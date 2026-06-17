/**
 * Darius Star — Story Triggers (GRO-1065: js/story/triggers.js)
 * Gameplay event hooks → story events.
 * Bridges gameplay state to narrative systems (AudioTunnel, StoryBranching).
 *
 * Integrates with:
 *   - game_loop.js (boss kill, biome transitions, squad events)
 *   - AudioTunnel (tunnel playback on transitions)
 *   - StoryBranching (branch updates on key events)
 *   - BanterEngine (contextual banter triggers)
 *
 * Load order: after game_loop.js (last in the chain)
 */

const StoryTriggers = {
    // --- Tracks which triggers have fired (prevent repeats) ---
    _fired: {},

    /**
     * Called when a boss is defeated.
     * @param {number} bossIndex — 1-10 (biome number)
     * @param {boolean} spared — true if boss was spared, false if killed
     */
    onBossKill(bossIndex, spared) {
        this._fired[`boss_${bossIndex}`] = true;

        // Boss-specific branching
        switch (bossIndex) {
            case 1: // Abyssal Trench boss — no branch, but trigger banter
                if (typeof BanterEngine !== 'undefined') {
                    BanterEngine.trigger('boss_entrance', 'abyssal_guardian');
                }
                break;

            case 3: // Coral Graveyard boss — Coelacanth mercy choice
                if (spared) {
                    StoryBranching.registerChoice('coelacanth_spared', true);
                    if (typeof BanterEngine !== 'undefined') {
                        BanterEngine.trigger('boss_defeat', 'coelacanth_merciful');
                    }
                }
                break;

            case 5: // Fire Nebula boss — Dreamer awakening trigger
                StoryBranching.registerChoice('dreamer_awakened', true);
                break;

            case 7: // Void Edge boss — Navy betrayal reveal
                StoryBranching.registerChoice('navy_betrayal_witnessed', true);
                break;

            case 10: // Abyss Core final boss — triggers ending determination
                if (typeof determineEnding === 'function') {
                    determineEnding();
                }
                break;

            default:
                break;
        }
    },

    /**
     * Called when transitioning from one biome to the next.
     * Triggers the appropriate audio tunnel.
     * @param {number} fromBiome — 1-10, or 0 for game start
     * @param {number} toBiome — 1-10, or 11 for victory
     */
    onBiomeTransition(fromBiome, toBiome) {
        const transitionKey = `transition_${fromBiome}_${toBiome}`;
        if (this._fired[transitionKey]) return;
        this._fired[transitionKey] = true;

        // Determine which tunnel to play
        let tunnelId = null;

        if (fromBiome === 0 && toBiome === 1) {
            tunnelId = 'intro';
        } else if (fromBiome >= 1 && fromBiome <= 9 && toBiome === fromBiome + 1) {
            tunnelId = `t${fromBiome}_${toBiome}`;
        } else if (fromBiome === 10 && toBiome === 11) {
            // Check for NG+ reverse tunnel
            if (typeof ngPlusRun !== 'undefined' && ngPlusRun) {
                tunnelId = 'ngplus_void';
            } else {
                tunnelId = 't10_end';
            }
        }

        if (tunnelId && typeof AudioTunnel !== 'undefined') {
            AudioTunnel.play(tunnelId);
        }
    },

    /**
     * Called when a squad member is rescued.
     * @param {string} squadMember — character code ('N', 'T', 'L', etc.)
     */
    onSquadSave(squadMember) {
        StoryBranching.registerChoice('squad_saved', true);

        if (typeof BanterEngine !== 'undefined') {
            BanterEngine.trigger('squad_rescued', squadMember);
        }
    },

    /**
     * Called when a squad member is lost.
     * @param {string} squadMember — character code
     */
    onSquadLoss(squadMember) {
        StoryBranching.registerChoice('squad_saved', false);

        if (typeof BanterEngine !== 'undefined') {
            BanterEngine.trigger('squad_lost', squadMember);
        }
    },

    /**
     * Called when the first biome is cleared (first-time player milestone).
     */
    onFirstBiomeClear() {
        if (this._fired['first_biome_clear']) return;
        this._fired['first_biome_clear'] = true;

        // Unlock biome 2-specific story content
        StoryBranching.registerChoice('trench_codex_complete', true);
    },

    /**
     * Called when all 10 bosses have been defeated.
     * Triggers the finale sequence.
     */
    onAllBossesDefeated() {
        if (this._fired['all_bosses_defeated']) return;
        this._fired['all_bosses_defeated'] = true;

        // Evaluate ending eligibility
        if (typeof StoryBranching !== 'undefined') {
            const branches = StoryBranching.getActiveBranches();

            // If sacrifice path is active, ensure sacrifice ending is available
            if (branches.includes('sacrifice_path') && typeof setNarrativeFlag === 'function') {
                setNarrativeFlag('sacrifice_seen', 1);
            }
        }
    },

    /**
     * Called when the player encounters a codex entry (lore collectible).
     * @param {string} codexId
     */
    onCodexFound(codexId) {
        const allCodexFound = [
            'abyssal_origins', 'coelacanth_bones', 'navy_betrayal',
            'dreamer_first', 'star_bloodline', 'abyss_core_map',
        ];

        // Track codex discovery for completion check
        this._fired[`codex_${codexId}`] = true;

        const allFound = allCodexFound.every(id => this._fired[`codex_${id}`]);
        if (allFound) {
            StoryBranching.registerChoice('trench_codex_complete', true);
        }
    },

    /**
     * Called when a player choice triggers mid-gameplay (non-dialogue).
     * Examples: deciding to rescue a squad member, choosing a path split.
     * @param {string} choiceId
     * @param {*} value
     */
    onGameplayChoice(choiceId, value) {
        StoryBranching.registerChoice(choiceId, value);

        // Trigger contextual banter for gameplay choices
        if (typeof BanterEngine !== 'undefined') {
            BanterEngine.trigger('player_choice', choiceId);
        }
    },

    /**
     * Reset all trigger state for a new game.
     */
    reset() {
        this._fired = {};
    },

    /**
     * Persist trigger state to save.
     * @returns {object}
     */
    persistToSave() {
        return {
            firedTriggers: {...this._fired},
        };
    },

    /**
     * Restore trigger state from save.
     * @param {object} saved
     */
    restoreFromSave(saved) {
        if (saved && saved.firedTriggers) {
            this._fired = {...saved.firedTriggers};
        }
    },
};
