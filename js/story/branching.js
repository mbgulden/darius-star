/**
 * Darius Star — Story Branching System (GRO-1065: js/story/branching.js)
 * Choice/consequence system — tracks flags from player choices,
 * gates certain dialogue/endings.
 *
 * Integrates with:
 *   - narrativeFlags (game_loop.js) — core flag storage
 *   - DialogueSequence.onChoice (ui/dialogue.js) — dialogue choices
 *   - determineEnding() (game_loop.js) — ending selection
 *
 * Load order: after ui/dialogue.js, before level_manager.js
 */

const StoryBranching = {
    // --- Branching Flags ---
    // Extends the core narrativeFlags with story-specific tracking.
    // These persist across levels via CampaignSave.inGameFlags.
    _flags: {
        // Core narrative lock-in moments
        lyra_trusted: false,       // Lyra trust threshold reached
        coelacanth_spared: false,  // Coelacanth boss spared (vs. killed)
        dreamer_awakened: false,   // Dreamer entity fully contacted
        navy_betrayal_witnessed: false, // Saw the Navy's true colors
        squad_saved: false,        // Saved all squad members
        trench_codex_complete: false, // All codex entries found

        // Biome-specific branching gates
        biome3_choice: null,       // 'mercy' | 'aggression' — Coral Graveyard decision
        biome5_choice: null,       // 'truth' | 'power' — Fire Nebula decision
        biome7_choice: null,       // 'resist' | 'accept' — Void Edge decision
        biome9_choice: null,       // 'sacrifice' | 'survive' — Abyss Core decision
    },

    // --- Branch Definitions ---
    // Each branch maps to a story path. When the player makes a choice
    // that satisfies a branch's conditions, that branch activates.
    _activeBranches: [],

    /**
     * Register a player choice. Called from DialogueSequence.onChoice.
     * @param {string} choiceId — unique choice identifier
     * @param {*} value — choice value (string, number, boolean)
     */
    registerChoice(choiceId, value) {
        if (this._flags.hasOwnProperty(choiceId)) {
            this._flags[choiceId] = value;
        }

        // Mirror to core narrativeFlags where applicable
        switch (choiceId) {
            case 'biome3_choice':
                if (value === 'mercy') {
                    setNarrativeFlag('coelacanth_mercy', 1);
                } else {
                    setNarrativeFlag('power_lust', 1);
                }
                break;
            case 'biome5_choice':
                if (value === 'truth') {
                    setNarrativeFlag('lyra_trust', 1);
                    this._flags.lyra_trusted = getNarrativeFlag('lyra_trust') >= 3;
                } else {
                    setNarrativeFlag('power_lust', 1);
                }
                break;
            case 'biome7_choice':
                if (value === 'accept') {
                    setNarrativeFlag('dreamer_connection', 2);
                    this._flags.dreamer_awakened = true;
                }
                break;
            case 'biome9_choice':
                if (value === 'sacrifice') {
                    setNarrativeFlag('sacrifice_seen', 2);
                    setNarrativeFlag('lyra_trust', 1);
                }
                break;
        }

        this._evaluateBranches();
    },

    /**
     * Get a choice flag value.
     * @param {string} flagId
     * @returns {*} flag value or null
     */
    getFlag(flagId) {
        return this._flags.hasOwnProperty(flagId) ? this._flags[flagId] : null;
    },

    /**
     * Evaluate gate conditions for dialogue/event unlocking.
     * Gates are arrays of conditions; ALL conditions must be met (AND logic).
     * @param {Array} gates — [{flag: string, value: *}] or [{flag: string, min: number}]
     * @returns {boolean}
     */
    evaluateGate(gates) {
        if (!gates || gates.length === 0) return true;
        return gates.every(gate => {
            const flagVal = this._flags[gate.flag];
            if (flagVal === undefined) return false;
            if (gate.value !== undefined) return flagVal === gate.value;
            if (gate.min !== undefined) return flagVal >= gate.min;
            return !!flagVal;
        });
    },

    /**
     * Check if a specific branch is active.
     * @param {string} branchId
     * @returns {boolean}
     */
    isBranchActive(branchId) {
        return this._activeBranches.includes(branchId);
    },

    /**
     * Get all currently active branches.
     * @returns {string[]}
     */
    getActiveBranches() {
        return [...this._activeBranches];
    },

    /**
     * Determine which dialogues are unlocked based on current branch state.
     * Returns an array of dialogue IDs that should be available.
     */
    getUnlockedDialogues() {
        const unlocked = [];

        // Always available dialogues
        unlocked.push('biome1_intro', 'biome2_intro');

        // Biome 3 branching
        if (this._flags.biome3_choice === 'mercy') {
            unlocked.push('lyra_hope', 'coelacanth_whisper');
        } else if (this._flags.biome3_choice === 'aggression') {
            unlocked.push('thorne_warning', 'navy_interest');
        }

        // Biome 5 branching
        if (this._flags.biome5_choice === 'truth') {
            unlocked.push('dreamer_echo', 'naya_trust');
        } else {
            unlocked.push('power_surge', 'thorne_respect');
        }

        // Biome 7 branching
        if (this._flags.dreamer_awakened) {
            unlocked.push('dreamer_full', 'abyss_truth');
        }

        // Squad save unlock
        if (this._flags.squad_saved) {
            unlocked.push('full_crew_unity');
        }

        // Coelacanth spare
        if (this._flags.coelacanth_spared) {
            unlocked.push('coelacanth_ally');
        }

        return unlocked;
    },

    /**
     * Persist all branching state to a save object.
     * Called by save_system.js before serialization.
     * @returns {object} savable state
     */
    persistToSave() {
        return {
            branchingFlags: {...this._flags},
            activeBranches: [...this._activeBranches],
        };
    },

    /**
     * Restore branching state from a save object.
     * Called by save_system.js after deserialization.
     * @param {object} saved
     */
    restoreFromSave(saved) {
        if (!saved) return;
        if (saved.branchingFlags) {
            Object.assign(this._flags, saved.branchingFlags);
        }
        if (saved.activeBranches) {
            this._activeBranches = [...saved.activeBranches];
        }
    },

    /**
     * Reset all branching state for a new game.
     */
    reset() {
        Object.keys(this._flags).forEach(k => {
            if (typeof this._flags[k] === 'boolean') this._flags[k] = false;
            else this._flags[k] = null;
        });
        this._activeBranches = [];
    },

    // --- Internal ---

    /**
     * Re-evaluate which branches should be active based on current flags.
     */
    _evaluateBranches() {
        this._activeBranches = [];

        // Mercy path
        if (this._flags.biome3_choice === 'mercy' && this._flags.coelacanth_spared) {
            this._activeBranches.push('mercy_full');
        }

        // Truth path
        if (this._flags.biome5_choice === 'truth' && this._flags.dreamer_awakened) {
            this._activeBranches.push('truth_full');
        }

        // Power path
        if (this._flags.biome5_choice === 'power' && this._flags.navy_betrayal_witnessed) {
            this._activeBranches.push('power_full');
        }

        // Sacrifice path
        if (this._flags.biome9_choice === 'sacrifice') {
            this._activeBranches.push('sacrifice_path');
        }

        // Survival path
        if (this._flags.biome9_choice === 'survive') {
            this._activeBranches.push('survive_path');
        }

        // Squad complete
        if (this._flags.squad_saved) {
            this._activeBranches.push('squad_complete');
        }
    },
};
