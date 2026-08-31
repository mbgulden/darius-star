// --- Darius Star: Cyber Coelacanth Upgrade System ---
// Verified and finalized for scrapper economy implementation (#GRO-2168).

(function() {
    const STORAGE_KEY = 'darius_star_metaprogression';

    // Default configuration for initial state
    const DEFAULT_STATE = {
        scrap: 0,
        upgrades: {
            weapons: 0,
            shields: 0,
            rockets: 0,
            magnetism: 0,
            engines: 0,
            specials: 0,
            addons: 0,
            cosmetics: 0
        },
        selections: {
            shipColor: 'default',
            thrusterTrail: 'default',
            explosionStyle: 'default'
        }
    };

    // Metadata for each upgrade category (Precursor Quantum Fabricator)
    const UPGRADE_CONFIG = {
        weapons: {
            name: 'Quantum Main Cannons',
            maxRank: 30,
            descriptions: [
                'Tier I (1-10): Base projectile dmg +5%/rank, fire rate +3%/rank',
                'Tier II (11-20): Overclocked beam velocity & +5% plasma piercing/rank',
                'Tier III (21-30): Apex Singularity core (+150% total dmg, +90% fire rate)'
            ]
        },
        shields: {
            name: 'Aegis Shield & Nanites',
            maxRank: 30,
            descriptions: [
                'Tier I (1-10): Max Shield +10 HP/rank, regen +0.15 HP/s',
                'Tier II (11-20): Overclocked nano-weave, +10 HP/rank, +0.15 HP/s regen',
                'Tier III (21-30): Apex Singularity shield matrix (up to 400 HP, 4.5 HP/s regen)'
            ]
        },
        rockets: {
            name: 'Valkyrie Missile Pods',
            maxRank: 30,
            descriptions: [
                'Tier I (1-10): Missile payload damage +10%/rank, AOE +10px/rank',
                'Tier II (11-20): Overclocked micro-thrusters, rapid salvo reload',
                'Tier III (21-30): Apex Singularity warheads (+300% dmg, +300px blast radius)'
            ]
        },
        magnetism: {
            name: 'Quantum Tractor Beam',
            maxRank: 30,
            descriptions: [
                'Tier I (1-10): Scrap attraction radius +20px/rank (45px -> 245px)',
                'Tier II (11-20): Overclocked magnetic coil (245px -> 445px, +2% bonus scrap value/rank)',
                'Tier III (21-30): Singularity scrap vortex (up to 645px screen-wide pull, +60% scrap bonus)'
            ]
        },
        engines: {
            name: 'Hyper-Drive Thrusters',
            maxRank: 30,
            descriptions: [
                'Tier I (1-10): Ship movement speed +2%/rank, afterburner boost duration',
                'Tier II (11-20): Overclocked sub-light thrusters & reduced dodge cooldown',
                'Tier III (21-30): Singularity hyper-space maneuverability (+60% speed, 0.35s dodge CD)'
            ]
        },
        specials: {
            name: 'Cyber Overload Special',
            maxRank: 30,
            descriptions: [
                'Tier I (1-10): Special duration +0.25s/rank, cooldown -3%/rank',
                'Tier II (11-20): Overclocked supercapacitors & extended active duration',
                'Tier III (21-30): Apex Singularity overload (+7.5s duration, 70% CD reduction)'
            ]
        },
        addons: {
            name: 'Quantum Combat Drones',
            maxRank: 30,
            descriptions: [
                'Tier I (1-10): Deploys 1 to 4 companion drones with helper plasma darts',
                'Tier II (11-20): Overclocked drones (5 to 6 drones) with hyper-interceptors',
                'Tier III (21-30): Apex Singularity drone armada (up to 8 orbiting companion drones!)'
            ]
        },
        cosmetics: {
            name: 'Chrono Plating & FX',
            maxRank: 15,
            descriptions: [
                'Tier I (1-5): Cyan, Magenta, Emerald, Gold & Void Plating skins',
                'Tier II (6-10): Solar Flare, Cyber Prism, Hyper Neon trails & EMP shockwaves',
                'Tier III (11-15): Apex Singularity Rainbow aura, Chrono Nova & Quantum Sparkles'
            ]
        }
    };

    class UpgradeSystem {
        constructor() {
            this.state = this.loadState();
        }

        // Load state from localStorage
        loadState() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                if (data) {
                    const parsed = JSON.parse(data);
                    // Deep copy merge to support schema migration/additions
                    return {
                        scrap: typeof parsed.scrap === 'number' ? parsed.scrap : DEFAULT_STATE.scrap,
                        upgrades: { ...DEFAULT_STATE.upgrades, ...parsed.upgrades },
                        selections: { ...DEFAULT_STATE.selections, ...parsed.selections }
                    };
                }
            } catch (e) {
                console.error("Failed to load upgrades state:", e);
            }
            return JSON.parse(JSON.stringify(DEFAULT_STATE));
        }

        // Save state to localStorage
        saveState() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
            } catch (e) {
                console.error("Failed to save upgrades state:", e);
            }
        }

        // Helper: Compute cost for a single rank index r (1-indexed)
        _computeRankCost(category, targetRank) {
            if (category === 'cosmetics') {
                if (targetRank <= 5) {
                    return targetRank * 150;
                } else if (targetRank <= 10) {
                    return 1000 + (targetRank - 5) * 400;
                } else {
                    return 4000 + (targetRank - 10) * 1000;
                }
            } else {
                if (targetRank <= 10) {
                    // Tier I (Standard / Green): 100 -> 1,000
                    return targetRank * 100;
                } else if (targetRank <= 20) {
                    // Tier II (Overclock / Gold): 1,350 -> 4,500
                    return 1000 + (targetRank - 10) * 350;
                } else {
                    // Tier III (Singularity / Purple): 5,800 -> 13,000
                    return 5000 + (targetRank - 20) * 800;
                }
            }
        }

        // Reset all upgrades and refund all spent scrap (player-friendly)
        resetState(refund = true) {
            if (refund) {
                let totalSpent = 0;
                for (const cat in this.state.upgrades) {
                    const rank = this.state.upgrades[cat] || 0;
                    for (let r = 1; r <= rank; r++) {
                        totalSpent += this._computeRankCost(cat, r);
                    }
                }
                this.state.scrap += totalSpent;
            } else {
                this.state.scrap = 0;
            }

            this.state.upgrades = JSON.parse(JSON.stringify(DEFAULT_STATE.upgrades));
            this.state.selections = JSON.parse(JSON.stringify(DEFAULT_STATE.selections));
            this.saveState();
        }

        // Add scrap to the permanent balance
        addScrap(amount) {
            if (amount > 0) {
                this.state.scrap += Math.floor(amount);
                this.saveState();
            }
        }

        // Get cost to upgrade to the next rank
        getUpgradeCost(category) {
            const currentRank = this.state.upgrades[category] || 0;
            const config = UPGRADE_CONFIG[category];
            if (!config || currentRank >= config.maxRank) {
                return Infinity; // Already maxed out
            }
            return this._computeRankCost(category, currentRank + 1);
        }

        // Purchase upgrade
        buyUpgrade(category) {
            const cost = this.getUpgradeCost(category);
            if (this.state.scrap >= cost) {
                this.state.scrap -= cost;
                this.state.upgrades[category]++;
                this.saveState();
                return true;
            }
            return false;
        }

        // Get tier metadata for a category and rank
        getTierInfo(category) {
            const rank = this.state.upgrades[category] || 0;
            const config = UPGRADE_CONFIG[category] || { maxRank: 30 };
            const isMaxed = rank >= config.maxRank;

            if (category === 'cosmetics') {
                if (rank < 5) {
                    return {
                        tier: 1,
                        tierRoman: 'I',
                        tierName: 'STANDARD',
                        color: '#00ff88',
                        accent: '#00ffff',
                        tierRank: rank,
                        tierMax: 5,
                        isMaxed: isMaxed
                    };
                } else if (rank < 10) {
                    return {
                        tier: 2,
                        tierRoman: 'II',
                        tierName: 'OVERCLOCK',
                        color: '#ffea00',
                        accent: '#ffaa00',
                        tierRank: rank - 5,
                        tierMax: 5,
                        isMaxed: isMaxed
                    };
                } else {
                    return {
                        tier: 3,
                        tierRoman: 'III',
                        tierName: 'SINGULARITY',
                        color: '#d044ff',
                        accent: '#b026ff',
                        tierRank: Math.min(5, rank - 10),
                        tierMax: 5,
                        isMaxed: isMaxed
                    };
                }
            }

            if (rank < 10) {
                return {
                    tier: 1,
                    tierRoman: 'I',
                    tierName: 'STANDARD',
                    color: '#00ff88',
                    accent: '#00ffff',
                    tierRank: rank,
                    tierMax: 10,
                    isMaxed: isMaxed
                };
            } else if (rank < 20) {
                return {
                    tier: 2,
                    tierRoman: 'II',
                    tierName: 'OVERCLOCK',
                    color: '#ffea00',
                    accent: '#ffaa00',
                    tierRank: rank - 10,
                    tierMax: 10,
                    isMaxed: isMaxed
                };
            } else {
                return {
                    tier: 3,
                    tierRoman: 'III',
                    tierName: 'SINGULARITY',
                    color: '#d044ff',
                    accent: '#b026ff',
                    tierRank: Math.min(10, rank - 20),
                    tierMax: 10,
                    isMaxed: isMaxed
                };
            }
        }

        // Get maximum ranks
        getMaxRank(category) {
            return UPGRADE_CONFIG[category] ? UPGRADE_CONFIG[category].maxRank : 0;
        }

        // Get configuration details
        getConfig() {
            return UPGRADE_CONFIG;
        }

        // Select cosmetic option
        selectCosmetic(type, value) {
            const allowed = this.isCosmeticUnlocked(type, value);
            if (allowed) {
                this.state.selections[type] = value;
                this.saveState();
                return true;
            }
            return false;
        }

        // Check if a cosmetic is unlocked
        isCosmeticUnlocked(type, value) {
            const cosmeticRank = this.state.upgrades.cosmetics || 0;
            if (value === 'default') return true;

            if (type === 'shipColor' || type === 'thrusterTrail') {
                if (value === 'cyan' && cosmeticRank >= 1) return true;
                if (value === 'magenta' && cosmeticRank >= 2) return true;
                if (value === 'emerald' && cosmeticRank >= 3) return true;
                if (value === 'gold' && cosmeticRank >= 4) return true;
                if (value === 'purple' && cosmeticRank >= 5) return true;
                if (value === 'solar' && cosmeticRank >= 8) return true;
                if (value === 'prism' && cosmeticRank >= 10) return true;
                if (value === 'singularity' && cosmeticRank >= 15) return true;
            } else if (type === 'explosionStyle') {
                if (value === 'emp' && cosmeticRank >= 4) return true;
                if (value === 'scrap' && cosmeticRank >= 5) return true;
                if (value === 'nova' && cosmeticRank >= 10) return true;
                if (value === 'singularity' && cosmeticRank >= 15) return true;
            }
            return false;
        }

        // Calculate and return stats modifications for gameplay
        getGameplayModifiers() {
            const wpRank = this.state.upgrades.weapons || 0;
            const shRank = this.state.upgrades.shields || 0;
            const rkRank = this.state.upgrades.rockets || 0;
            const mgRank = this.state.upgrades.magnetism || 0;
            const enRank = this.state.upgrades.engines || 0;
            const spRank = this.state.upgrades.specials || 0;
            const adRank = this.state.upgrades.addons || 0;

            // Dynamic companion drone calculation: up to 8 drones at Rank 30
            let drones = 0;
            if (adRank >= 30) drones = 8;
            else if (adRank >= 25) drones = 7;
            else if (adRank >= 20) drones = 6;
            else if (adRank >= 15) drones = 5;
            else if (adRank >= 10) drones = 4;
            else if (adRank >= 7) drones = 3;
            else if (adRank >= 4) drones = 2;
            else if (adRank >= 1) drones = 1;

            return {
                // Weapons: Base damage +5% per rank, fire rate +3% per rank, projectile speed +5% per rank
                weaponDamageMultiplier: 1 + wpRank * 0.05,
                weaponFireRateMultiplier: 1 + wpRank * 0.03,
                weaponProjSpeedMultiplier: 1 + wpRank * 0.05,

                // Shields: Max HP +10 per rank (up to 400 total), passive regen (+0.15 HP/sec per rank), invuln (+0.05s)
                shieldMaxHPBonus: shRank * 10,
                shieldRegenRate: shRank * 0.15,
                shieldInvulnBonus: shRank * 0.05,

                // Rockets: Missile payload damage +10%/rank, AOE blast radius +10px/rank, recharge rate +5%/rank
                rocketDamageMultiplier: 1 + rkRank * 0.10,
                rocketAoeRadiusBonus: rkRank * 10,
                rocketRechargeMultiplier: 1 + rkRank * 0.05,

                // Magnetism: Attraction radius (base 45px, +20px/rank up to 645px), pull force (+25/rank), scrap value bonus (+2%/rank)
                magnetismRank: mgRank,
                magnetRadius: 45 + mgRank * 20,
                magnetPullForce: 280 + mgRank * 25,
                scrapValueMultiplier: 1 + mgRank * 0.02,

                // Engines: Movement speed +2% per rank, thruster efficiency
                engineSpeedMultiplier: 1 + enRank * 0.02,
                engineBoostDurationMultiplier: 1 + enRank * 0.04,
                engineBoostCooldownMultiplier: Math.max(0.2, 1 - enRank * 0.03),

                // Specials: Ship-specific ability cooldown reduction (-3% per rank), duration increase (+0.25s per rank)
                specialCooldownMultiplier: Math.max(0.3, 1 - spRank * 0.03),
                specialDurationBonus: spRank * 0.25,

                // Addons: Orbiting combat drone count (1-8 drones) & helper fire rate
                addonRank: adRank,
                droneCount: drones,
                droneFireRate: 1.0 + adRank * 0.08,

                // Cosmetics selections
                cosmetics: {
                    shipColor: this.state.selections.shipColor,
                    thrusterTrail: this.state.selections.thrusterTrail,
                    explosionStyle: this.state.selections.explosionStyle
                }
            };
        }
    }

    // Attach to global window object
    window.DS_UpgradeSystem = new UpgradeSystem();
    window.UpgradeSystem = window.DS_UpgradeSystem;
})();
