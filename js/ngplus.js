// ngplus.js — FULL IMPLEMENTATION (Ned, GRO-1074)
// New Game+ system: paradox enemies, scrap multipliers, campaign loop progression.
// Integrates with CampaignSave for save-slot advancement and ending tracking.

window.NGPlus = {
    // ── NG+ Lifecycle ──────────────────────────────────

    /**
     * Start a New Game+ run from a previous save or run data.
     * Accepts either: an object with {ngLevel, ship, ...} or a save slot number.
     * Returns the NG+ state object used to seed the new save.
     */
    start(prevRunData) {
        let prevLevel = 0;
        let prevShip = 'interceptor';
        let prevEnding = null;

        if (typeof prevRunData === 'number') {
            // Called with a save slot number — load the save
            if (window.CampaignSave) {
                const save = CampaignSave.load(prevRunData);
                if (save) {
                    prevLevel = save.ngLevel || 0;
                    prevShip = save.ship || 'interceptor';
                    prevEnding = save.ending || null;
                }
            }
        } else if (prevRunData && typeof prevRunData === 'object') {
            prevLevel = prevRunData.ngLevel || 0;
            prevShip = prevRunData.ship || 'interceptor';
        }

        const nextLevel = prevLevel + 1;
        const scrapMult = 1 + nextLevel * 0.5;

        return {
            ngLevel: nextLevel,
            scrapMult: scrapMult,
            paradoxRate: Math.min(0.5, 0.1 * nextLevel),
            prevEnding: prevEnding
        };
    },

    /**
     * Summarize a save object for display in menus.
     */
    summarize(saveObj) {
        if (!saveObj) return { level: 0, scrapMult: 1, ending: null };
        const level = saveObj.ngLevel || 0;
        return {
            level: level,
            scrapMult: 1 + level * 0.5,
            ending: saveObj.ending || null
        };
    },

    // ── Paradox System ─────────────────────────────────

    /**
     * Roll for paradox enhancement on an enemy.
     * Chance scales with NG+ level and biome depth.
     */
    rollParadox(currentNGLevel, biomeLevel) {
        if (!currentNGLevel || currentNGLevel < 1) return null;

        const baseChance = 0.08;
        const ngBonus = (currentNGLevel - 1) * 0.04;
        const biomeBonus = ((biomeLevel || 1) - 1) * 0.02;
        const chance = Math.min(0.55, baseChance + ngBonus + biomeBonus);

        if (Math.random() < chance) {
            const intensity = 1 + (currentNGLevel * 0.3);
            return {
                hpMult: 1.5 + (currentNGLevel * 0.5),
                speedMult: 1 + (currentNGLevel * 0.15),
                bulletSpeedMult: 1 + (currentNGLevel * 0.1),
                scoreMult: 1.5 + (currentNGLevel * 0.5),
                scrapMult: intensity,
                visualTint: currentNGLevel >= 5 ? '#ff00ff' : currentNGLevel >= 3 ? '#ff4444' : '#ff8844'
            };
        }
        return null;
    },

    /**
     * Apply paradox buffs to an enemy instance.
     * Modifies the enemy object in-place.
     */
    applyParadox(enemy, paradoxObj) {
        if (!paradoxObj || !enemy) return;

        if (paradoxObj.hpMult) {
            enemy.hp = Math.ceil((enemy.hp || 100) * paradoxObj.hpMult);
            enemy.maxHp = enemy.hp;
        }
        if (paradoxObj.speedMult) {
            enemy.speed = (enemy.speed || 1) * paradoxObj.speedMult;
        }
        if (paradoxObj.bulletSpeedMult && enemy.bulletSpeed) {
            enemy.bulletSpeed *= paradoxObj.bulletSpeedMult;
        }
        if (paradoxObj.scoreMult) {
            enemy.scoreValue = Math.ceil((enemy.scoreValue || 100) * paradoxObj.scoreMult);
        }
        if (paradoxObj.visualTint) {
            enemy.paradoxTint = paradoxObj.visualTint;
        }
        enemy.isParadox = true;
    },

    // ── Scrap Multiplier ───────────────────────────────

    /**
     * Get the scrap multiplier for a given NG+ level.
     * Accepts {ngLevel: number} or a plain number.
     */
    getScrapMult(ngData) {
        let level = 0;
        if (typeof ngData === 'number') {
            level = ngData;
        } else if (ngData && typeof ngData === 'object') {
            level = ngData.ngLevel || 0;
        }
        return 1 + level * 0.5;
    },

    // ── Utility ────────────────────────────────────────

    /**
     * Get the full NG+ metadata for HUD/briefing display.
     */
    getMetadata(ngLevel, ending) {
        return {
            level: ngLevel || 0,
            loop: (ngLevel || 0) + 1,
            scrapMult: this.getScrapMult(ngLevel),
            paradoxRate: Math.min(0.5, 0.1 * (ngLevel || 0)),
            ending: ending || null
        };
    }
};

console.log('[OK] ngplus.js loaded — NG+ loops, paradox enemies, scrap scaling');
