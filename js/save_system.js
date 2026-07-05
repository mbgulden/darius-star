// save_system.js — FULL IMPLEMENTATION (Ned, GRO-1090)
// CampaignSave: localStorage-backed 3-slot save system for Darius Star.
// Built from AGY audit specs in docs/foundational-structure-audit.md
// and cross-referenced against all CampaignSave.* calls in index.html.

(function() {
    'use strict';

    const STORAGE_KEY = 'darius_star_saves';
    const MAX_SLOTS = 3;

    // Schema validation helper
    function validateSave(saveData) {
        if (!saveData || typeof saveData !== 'object') return false;
        
        // Required keys check
        const requiredKeys = ['wave', 'ship', 'scrap', 'score', 'lives', 'difficulty', 'upgrades'];
        for (const key of requiredKeys) {
            if (!(key in saveData)) return false;
        }

        // Check that either biome or biomeLevel is present as a number
        const hasBiome = ('biome' in saveData && typeof saveData.biome === 'number' && !isNaN(saveData.biome)) ||
                         ('biomeLevel' in saveData && typeof saveData.biomeLevel === 'number' && !isNaN(saveData.biomeLevel));
        if (!hasBiome) return false;

        // Type checks
        if (typeof saveData.wave !== 'number' || isNaN(saveData.wave)) return false;
        if (typeof saveData.ship !== 'string') return false;
        if (typeof saveData.scrap !== 'number' || isNaN(saveData.scrap)) return false;
        if (typeof saveData.score !== 'number' || isNaN(saveData.score)) return false;
        if (typeof saveData.lives !== 'number' || isNaN(saveData.lives)) return false;
        if (typeof saveData.difficulty !== 'string') return false;
        if (typeof saveData.upgrades !== 'object' || saveData.upgrades === null) return false;

        // Checkpoint check (if present)
        if (saveData.lastCheckpoint) {
            const cp = saveData.lastCheckpoint;
            if (typeof cp !== 'object' || cp === null) return false;
            if (typeof cp.biome !== 'number' || isNaN(cp.biome)) return false;
            if (typeof cp.wave !== 'number' || isNaN(cp.wave)) return false;
            if (typeof cp.lives !== 'number' || isNaN(cp.lives)) return false;
        }

        return true;
    }

    /**
     * Create a blank/default save object with all expected fields.
     * Mirrors the shape that index.html reads from during game start/resume.
     */
    function createBlank() {
        const now = new Date().toISOString();
        return {
            biomeLevel: 1,
            biome: 1,
            wave: 1,
            ship: 'striker',
            scrap: 0,
            score: 0,
            playTime: 0,
            deaths: 0,
            lives: 2,
            difficulty: 'normal',
            lastCheckpoint: null,
            upgrades: {},
            masterVolume: 0.8,
            sfxVolume: 0.8,
            musicVolume: 0.6,
            banterEnabled: true,
            audioTunnelsEnabled: true,
            streamerMode: false,
            subtitlesEnabled: true,
            weaponLevel: 1,
            shield: 100,
            shieldMax: 100,
            ngLevel: 0,
            runScrap: 0,
            seed: Math.floor(Math.random() * 2147483648),
            inGameFlags: {},
            createdAt: now,
            updatedAt: now
        };
    }

    /**
     * Load the full saves array from localStorage.
     * Always returns a 3-element array (null for empty slots).
     */
    function _readAll() {
        let raw = null;
        try {
            raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                // Try reading the singular key too, just in case
                raw = localStorage.getItem('darius_star_save');
            }
            if (!raw) return [null, null, null];
            
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                // Check if it's a single save object (non-array)
                if (typeof parsed === 'object' && parsed !== null) {
                    if (validateSave(parsed)) {
                        return [parsed, null, null];
                    }
                }
                throw new Error("Invalid saves format (not an array)");
            }
            
            // Validate each slot
            const validated = parsed.map(slot => {
                if (slot === null) return null;
                if (validateSave(slot)) return slot;
                // Corrupted save slot detected!
                window.CampaignSave.pendingCorruptionNotice = true;
                return null;
            });
            
            while (validated.length < MAX_SLOTS) validated.push(null);
            return validated.slice(0, MAX_SLOTS);
        } catch (e) {
            console.warn('CampaignSave: failed to read saves, resetting.', e);
            window.CampaignSave.pendingCorruptionNotice = true;
            try {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem('darius_star_save');
            } catch (ex) {}
            return [null, null, null];
        }
    }

    /**
     * Write the full saves array to localStorage.
     */
    function _writeAll(saves) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
        } catch (e) {
            console.error('CampaignSave: failed to write saves (storage full?).', e);
        }
    }

    /**
     * Save an object into a specific slot (0-2).
     */
    function save(slotIndex, saveObj) {
        if (slotIndex < 0 || slotIndex >= MAX_SLOTS) {
            console.warn('CampaignSave.save: invalid slot', slotIndex);
            return;
        }
        const saves = _readAll();
        saves[slotIndex] = saveObj ? { ...saveObj, updatedAt: new Date().toISOString() } : null;
        _writeAll(saves);
    }

    /**
     * Load a single save from a slot. Returns null if empty.
     */
    function load(slotIndex) {
        if (slotIndex < 0 || slotIndex >= MAX_SLOTS) return null;
        const saves = _readAll();
        return saves[slotIndex] || null;
    }

    /**
     * Return the full 3-slot saves array.
     */
    function loadAll() {
        return _readAll();
    }

    /**
     * Delete the save at a specific slot.
     */
    function deleteSlot(slotIndex) {
        if (slotIndex < 0 || slotIndex >= MAX_SLOTS) return;
        const saves = _readAll();
        saves[slotIndex] = null;
        _writeAll(saves);
    }

    /**
     * Build a display-ready summary of a save slot.
     * Used by index.html's load-game screen rendering.
     *
     * Expected keys (from index.html line ~2328-2346):
     *   biome, wave, ship, scrap, score, date, time, playTime,
     *   deaths, shipsUnlocked, difficulty
     */
    function summarize(slotIndex) {
        const saveData = load(slotIndex);
        if (!saveData) return null;

        const updated = saveData.updatedAt ? new Date(saveData.updatedAt) : new Date();

        // Format date: "6/10/2026"
        const date = updated.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });

        // Format time: "3:45 PM"
        const time = updated.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        // Format playTime: "1h 23m" or "45m" or "0m"
        const totalSeconds = saveData.playTime || 0;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        let playTimeStr;
        if (hours > 0) {
            playTimeStr = hours + 'h ' + minutes + 'm';
        } else {
            playTimeStr = minutes + 'm';
        }

        // Ships unlocked: read from DS_UpgradeSystem global, default to 3
        let shipsUnlocked = 3;
        try {
            if (window.DS_UpgradeSystem && window.DS_UpgradeSystem.state) {
                const cosmeticRank = window.DS_UpgradeSystem.state.upgrades.cosmetics || 0;
                // Rank 1-5 each unlock a new ship color (+ default = interceptor)
                shipsUnlocked = 1 + cosmeticRank;
            }
        } catch (e) {
            // Fall back to default
        }
        // If save itself tracks ships, use that as override
        if (typeof saveData.shipsUnlocked === 'number') {
            shipsUnlocked = saveData.shipsUnlocked;
        }

        return {
            biome: saveData.biome || saveData.biomeLevel || 1,
            wave: saveData.wave || 1,
            ship: saveData.ship || 'interceptor',
            scrap: saveData.scrap || 0,
            score: saveData.score || 0,
            date: date,
            time: time,
            playTime: playTimeStr,
            deaths: saveData.deaths || 0,
            shipsUnlocked: shipsUnlocked,
            difficulty: saveData.difficulty || 'normal'
        };
    }

    /**
     * Store a checkpoint snapshot into the save's lastCheckpoint field.
     * Called every time the player enters a new biome (index.html ~line 6559).
     *
     * Expected payload keys (from index.html ~line 6559-6574):
     *   biome, wave, score, runScrap, ship, weaponLevel, shieldMax,
     *   shield, difficulty, banterEnabled, audioTunnelsEnabled,
     *   streamerMode, lives, inGameFlags
     */
    function checkpoint(slotIndex, payload) {
        const saveData = load(slotIndex);
        if (!saveData) {
            console.warn('CampaignSave.checkpoint: no save in slot', slotIndex);
            return;
        }
        saveData.lastCheckpoint = {
            biome: payload.biome,
            wave: payload.wave,
            score: payload.score,
            runScrap: payload.runScrap,
            ship: payload.ship,
            weaponLevel: payload.weaponLevel,
            shieldMax: payload.shieldMax,
            shield: payload.shield,
            difficulty: payload.difficulty,
            banterEnabled: payload.banterEnabled,
            audioTunnelsEnabled: payload.audioTunnelsEnabled,
            streamerMode: payload.streamerMode,
            subtitlesEnabled: payload.subtitlesEnabled !== undefined ? payload.subtitlesEnabled : true,
            lives: payload.lives,
            inGameFlags: payload.inGameFlags ? { ...payload.inGameFlags } : {},
            lootedSegments: (window.Economy && typeof window.Economy.serializeLootedSegments === 'function')
                ? window.Economy.serializeLootedSegments()
                : null,
            currentSegment: (window.Economy && typeof window.Economy._currentSegment === 'number')
                ? window.Economy._currentSegment
                : 0
        };
        save(slotIndex, saveData);
    }

    /**
     * Restore from last checkpoint and decrement lives by 1.
     * Called on game-over death (index.html ~line 6872).
     *
     * Returns the checkpoint data with lives decremented, or null if:
     *   - No save in slot
     *   - No checkpoint in save
     *   - Lives already at 0 (all lives exhausted)
     */
    function restoreCheckpoint(slotIndex) {
        const saveData = load(slotIndex);
        if (!saveData || !saveData.lastCheckpoint) return null;

        const cp = { ...saveData.lastCheckpoint };
        cp.lives = (cp.lives || 0) - 1;

        if (cp.lives <= 0) {
            // Lives exhausted — clear the checkpoint so next death resets to biome 1
            saveData.lastCheckpoint = null;
            save(slotIndex, saveData);
            return null;
        }

        // Decrement deaths counter on the save itself
        saveData.deaths = (saveData.deaths || 0) + 1;
        save(slotIndex, saveData);

        // Anti-farming: restore looted segments
        if (cp.lootedSegments && window.Economy && typeof window.Economy.restoreLootedSegments === 'function') {
            window.Economy.restoreLootedSegments(cp.lootedSegments, cp.currentSegment);
        }

        return cp;
    }

    /**
     * Direct save commit — used for autosave or final run progress.
     * Alias for save(), but named for API clarity.
     */
    function autosave(slotIndex, runPayload) {
        save(slotIndex, runPayload);
    }

    // ── Public API ──
    window.CampaignSave = {
        createBlank: createBlank,
        save: save,
        load: load,
        loadAll: loadAll,
        delete: deleteSlot,
        summarize: summarize,
        checkpoint: checkpoint,
        restoreCheckpoint: restoreCheckpoint,
        autosave: autosave,
        STORAGE_KEY: STORAGE_KEY,
        MAX_SLOTS: MAX_SLOTS,
        pendingCorruptionNotice: false
    };

    console.log('[CampaignSave] save_system.js loaded — full implementation (GRO-1090, GRO-2171)');
})();