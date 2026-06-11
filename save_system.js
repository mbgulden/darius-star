/**
 * Darius Star — Campaign Save System (GRO-959)
 * =============================================
 * 3 save slots via localStorage. Saves at biome transitions and
 * every 3 waves (checkpoints). Persists: biome, wave, scrap, 
 * unlocked ships, permanent upgrades, difficulty, settings.
 */

const SAVE_KEY = 'darius_star_saves';
const SAVE_VERSION = 1;

const CampaignSave = {
    /**
     * Create a blank save state
     */
    createBlank() {
        return {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            // Campaign progress
            biome: 1,
            wave: 1,
            score: 0,
            scrap: 0,
            // Player state
            ship: 'scout',
            weaponLevel: 1,
            shieldMax: 100,
            shield: 100,
            lives: 3,
            // Unlocks
            unlockedShips: ['scout'],
            permanentUpgrades: {
                weaponDamage: 0,     // 0-3 levels
                shieldCapacity: 0,   // 0-3 levels
                shipSpeed: 0,        // 0-3 levels
                scrapMagnet: 0,      // 0-3 levels
                specialCharge: 0,    // 0-3 levels
            },
            // Settings
            difficulty: 'normal',
            masterVolume: 0.8,
            sfxVolume: 0.8,
            musicVolume: 0.6,
            // Meta
            totalScrapCollected: 0,
            totalEnemiesDefeated: 0,
            playTime: 0, // seconds
            deaths: 0,
            // Multiplayer
            playerCount: 1,
            // Narrative flags (GRO-1007)
            narrativeFlags: {
                glyphsCollected: [],
                lyraConsciousnessState: 'stable',
                characterTrustLevels: {},
                storyBeatsCompleted: [],
                endingEligibility: {},
            },
            // In-game session narrative flags (GRO-1007): persisted across saves
            // Maps to index.html narrativeFlags: lyra_trust, coelacanth_mercy, power_lust, dreamer_connection, sacrifice_seen
            inGameFlags: {
                lyra_trust: 0,
                coelacanth_mercy: 0,
                power_lust: 0,
                dreamer_connection: 0,
                sacrifice_seen: 0,
            },
            // Seed-based RNG per run
            seed: Math.floor(Math.random() * 2147483648),
        };
    },

    /**
     * Load all save slots
     */
    loadAll() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return [null, null, null];
            const data = JSON.parse(raw);
            return Array.isArray(data) ? data : [null, null, null];
        } catch (e) {
            console.warn('Save load failed:', e);
            return [null, null, null];
        }
    },

    /**
     * Load a specific slot (0, 1, or 2)
     */
    load(slot) {
        const saves = this.loadAll();
        return saves[slot] || null;
    },

    /**
     * Save to a specific slot
     */
    save(slot, state) {
        try {
            const saves = this.loadAll();
            state.timestamp = Date.now();
            state.version = SAVE_VERSION;
            saves[slot] = state;
            localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
            return true;
        } catch (e) {
            console.warn('Save failed (storage full?):', e);
            return false;
        }
    },

    /**
     * Delete a save slot
     */
    delete(slot) {
        try {
            const saves = this.loadAll();
            saves[slot] = null;
            localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * Quick-save current game state (autosave to last-used slot)
     */
    autosave(slot, gameState) {
        const existing = this.load(slot) || this.createBlank();
        const merged = {
            ...existing,
            biome: gameState.biome || existing.biome,
            wave: gameState.wave || existing.wave,
            score: gameState.score || 0,
            scrap: gameState.runScrap || existing.scrap,
            ship: gameState.ship || existing.ship,
            weaponLevel: gameState.weaponLevel || existing.weaponLevel,
            shieldMax: gameState.shieldMax || existing.shieldMax,
            shield: gameState.shield || existing.shieldMax,
            lives: gameState.lives !== undefined ? gameState.lives : existing.lives,
            difficulty: gameState.difficulty || existing.difficulty,
            totalScrapCollected: (existing.totalScrapCollected || 0) + (gameState.scrapDelta || 0),
            totalEnemiesDefeated: (existing.totalEnemiesDefeated || 0) + (gameState.enemiesDelta || 0),
            playTime: (existing.playTime || 0) + (gameState.dt || 0),
            deaths: (existing.deaths || 0) + (gameState.deathDelta || 0),
            playerCount: gameState.playerCount || existing.playerCount,
            narrativeFlags: this.updateNarrativeFlagsOnProgress(gameState.biome || existing.biome, gameState.narrativeFlags || existing.narrativeFlags),
            inGameFlags: gameState.inGameFlags !== undefined ? { ...existing.inGameFlags, ...gameState.inGameFlags } : existing.inGameFlags,
            seed: existing.seed !== undefined ? existing.seed : Math.floor(Math.random() * 2147483648),
            timestamp: Date.now(),
            version: SAVE_VERSION,
        };
        return this.save(slot, merged);
    },

    /**
     * Compute/update narrative flags based on biome campaign progress
     */
    updateNarrativeFlagsOnProgress(biome, currentFlags) {
        const flags = currentFlags ? { ...currentFlags } : {
            glyphsCollected: [],
            lyraConsciousnessState: 'stable',
            characterTrustLevels: {},
            storyBeatsCompleted: [],
            endingEligibility: {},
        };

        // 1. Glyphs collected: GLYPH-1 up to GLYPH-(biome - 1)
        const glyphs = new Set(flags.glyphsCollected || []);
        for (let i = 1; i < biome; i++) {
            glyphs.add(`GLYPH-${i}`);
        }
        flags.glyphsCollected = Array.from(glyphs);

        // 2. Lyra consciousness state
        if (biome >= 10) {
            flags.lyraConsciousnessState = 'transcendent';
        } else if (biome >= 7) {
            flags.lyraConsciousnessState = 'altered';
        } else if (biome >= 4) {
            flags.lyraConsciousnessState = 'awakening';
        } else {
            flags.lyraConsciousnessState = 'stable';
        }

        // 3. Character trust levels
        flags.characterTrustLevels = flags.characterTrustLevels ? { ...flags.characterTrustLevels } : {};
        if (flags.characterTrustLevels.lyra === undefined) {
            flags.characterTrustLevels.lyra = Math.min(5, Math.floor(biome / 2));
        }
        if (flags.characterTrustLevels.cross === undefined) {
            flags.characterTrustLevels.cross = biome >= 6 ? Math.min(5, biome - 5) : 0;
        }
        if (flags.characterTrustLevels.ophion === undefined) {
            flags.characterTrustLevels.ophion = biome >= 8 ? Math.min(5, biome - 7) : 0;
        }

        // 4. Story beats completed
        const beats = new Set(flags.storyBeatsCompleted || []);
        for (let i = 1; i < biome; i++) {
            beats.add(`biome_${i}_clear`);
        }
        if (biome >= 6) beats.add('cross_defection');
        if (biome >= 7) beats.add('haven7_attack');
        if (biome >= 9) beats.add('dream_weapon_truth');
        flags.storyBeatsCompleted = Array.from(beats);

        // 5. Ending eligibility
        if (biome >= 10) {
            flags.endingEligibility = {
                containment: true,
                symbiosis: true,
                transcendence: true,
            };
        } else {
            flags.endingEligibility = flags.endingEligibility || {};
        }

        return flags;
    },

    /**
     * Programmatic manual update of narrative flags for a slot
     */
    updateNarrativeFlags(slot, updates) {
        const state = this.load(slot);
        if (!state) return false;
        if (!state.narrativeFlags) {
            state.narrativeFlags = {
                glyphsCollected: [],
                lyraConsciousnessState: 'stable',
                characterTrustLevels: {},
                storyBeatsCompleted: [],
                endingEligibility: {},
            };
        }
        if (updates.glyphsCollected) {
            state.narrativeFlags.glyphsCollected = updates.glyphsCollected;
        }
        if (updates.lyraConsciousnessState) {
            state.narrativeFlags.lyraConsciousnessState = updates.lyraConsciousnessState;
        }
        if (updates.characterTrustLevels) {
            state.narrativeFlags.characterTrustLevels = {
                ...state.narrativeFlags.characterTrustLevels,
                ...updates.characterTrustLevels
            };
        }
        if (updates.storyBeatsCompleted) {
            const currentBeats = new Set(state.narrativeFlags.storyBeatsCompleted || []);
            updates.storyBeatsCompleted.forEach(beat => currentBeats.add(beat));
            state.narrativeFlags.storyBeatsCompleted = Array.from(currentBeats);
        }
        if (updates.endingEligibility) {
            state.narrativeFlags.endingEligibility = {
                ...state.narrativeFlags.endingEligibility,
                ...updates.endingEligibility
            };
        }
        return this.save(slot, state);
    },

    /**
     * Checkpoint save — called every 3 waves
     */
    checkpoint(slot, gameState) {
        const state = this.load(slot) || this.createBlank();
        state.lastCheckpoint = {
            biome: gameState.biome,
            wave: gameState.wave,
            score: gameState.score,
            scrap: gameState.runScrap,
            weaponLevel: gameState.weaponLevel,
            shield: gameState.shield,
            lives: gameState.lives,
            narrativeFlags: gameState.narrativeFlags || state.narrativeFlags,
            inGameFlags: gameState.inGameFlags || state.inGameFlags,
        };
        return this.autosave(slot, gameState);
    },

    /**
     * Restore from checkpoint (on death)
     */
    restoreCheckpoint(slot) {
        const state = this.load(slot);
        if (!state || !state.lastCheckpoint) return null;
        const cp = state.lastCheckpoint;
        return {
            biome: cp.biome,
            wave: cp.wave,
            score: cp.score,
            runScrap: cp.scrap,
            weaponLevel: cp.weaponLevel,
            shield: cp.shield,
            lives: cp.lives - 1, // lose a life on restore
            narrativeFlags: cp.narrativeFlags || state.narrativeFlags,
            inGameFlags: cp.inGameFlags || state.inGameFlags,
        };
    },

    /**
     * Unlock a ship permanently
     */
    unlockShip(slot, shipId) {
        const state = this.load(slot);
        if (!state) return false;
        if (!state.unlockedShips.includes(shipId)) {
            state.unlockedShips.push(shipId);
        }
        return this.save(slot, state);
    },

    /**
     * Purchase a permanent upgrade
     */
    purchaseUpgrade(slot, upgradeId, level) {
        const state = this.load(slot);
        if (!state) return false;
        state.permanentUpgrades[upgradeId] = level;
        return this.save(slot, state);
    },

    /**
     * Generate a summary for the save slot display
     */
    summarize(slot) {
        const state = this.load(slot);
        if (!state) return null;
        const d = new Date(state.timestamp);
        return {
            slot,
            biome: state.biome,
            wave: state.wave,
            score: state.score,
            scrap: state.scrap,
            ship: state.ship,
            difficulty: state.difficulty,
            date: d.toLocaleDateString(),
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            playTime: Math.round(state.playTime / 60) + 'm',
            deaths: state.deaths,
            shipsUnlocked: state.unlockedShips.length,
        };
    },
};
