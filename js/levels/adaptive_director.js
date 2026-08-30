/**
 * js/levels/adaptive_director.js — Dynamic Pacing Director & Precursor Salvage Economy (GRO-4304)
 * Real-time combat efficiency analysis, graduated bullet speed assistance on repeat wipes, 
 * high-yield Precursor quantum salvage node spawning, and checkpoint quick-fabrication.
 * 
 * Load order: after js/levels/biome_data.js, before js/level_manager.js
 */

const AdaptiveDirector = {
    metrics: {
        dpsWindow: [],
        hitsTakenInSector: 0,
        sectorAttemptCount: 1,
        timeInSector: 0,
        nearDeathCount: 0
    },

    init() {
        if (typeof window !== 'undefined') {
            window.AdaptiveDirector = this;
        }
    },

    resetSectorMetrics(attempt = 1) {
        this.metrics.dpsWindow = [];
        this.metrics.hitsTakenInSector = 0;
        this.metrics.sectorAttemptCount = attempt;
        this.metrics.timeInSector = 0;
        this.metrics.nearDeathCount = 0;
    },

    recordDamageTaken(amount, playerShield, playerShieldMax) {
        this.metrics.hitsTakenInSector++;
        if (playerShield / playerShieldMax < 0.25) {
            this.metrics.nearDeathCount++;
        }
    },

    getScalingFactors(difficultyId = 'normal') {
        const diff = (difficultyId || 'normal').toLowerCase();

        // Hardcore difficulties remain unassisted
        if (diff === 'hard' || diff === 'insane' || diff === 'cyber' || diff === 'ace') {
            return {
                bulletSpeedMult: 1.0,
                enemyHpMult: 1.0,
                scrapBonusMult: 1.0,
                emergencyNaniteChance: 0.05
            };
        }

        // Cadet / Pilot Adaptive Assistance
        const attempts = this.metrics.sectorAttemptCount || 1;
        const speedReduction = Math.min(0.18, (attempts - 1) * 0.05);
        const hpReduction = Math.min(0.15, (attempts - 1) * 0.04);
        const scrapBonus = Math.min(0.80, (attempts - 1) * 0.20);
        const naniteChance = Math.min(0.40, 0.10 + (attempts - 1) * 0.10);

        return {
            bulletSpeedMult: 1.0 - speedReduction,
            enemyHpMult: 1.0 - hpReduction,
            scrapBonusMult: 1.0 + scrapBonus,
            emergencyNaniteChance: naniteChance
        };
    },

    getHighYieldNodeDrop(biomeLevel) {
        if (biomeLevel < 7) return null;
        // In late-game Biomes 7-10, high-yield nodes drop substantial scrap
        const baseScrap = 150 + (biomeLevel - 7) * 100;
        return {
            type: 'quantum_scrap_cluster',
            scrapValue: baseScrap,
            color: '#ffd700',
            glowColor: '#ffaa00'
        };
    }
};

if (typeof window !== 'undefined') {
    window.AdaptiveDirector = AdaptiveDirector;
}
if (typeof global !== 'undefined') {
    global.AdaptiveDirector = AdaptiveDirector;
}
AdaptiveDirector.init();
