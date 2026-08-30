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
            maxRank: 10,
            descriptions: [
                'Base projectile damage: +5% per rank',
                'Fire rate: +3% per rank (cooldown reduced)',
                'Projectile velocity: +5% per rank'
            ]
        },
        shields: {
            name: 'Aegis Shield & Nanite Matrix',
            maxRank: 10,
            descriptions: [
                'Max HP/Shield: +10 per rank (up to 200 total)',
                'Passive Shield Regen: +0.15 HP/s per rank',
                'Invulnerability frames: +0.05s on hit'
            ]
        },
        rockets: {
            name: 'Valkyrie Missile Pods',
            maxRank: 10,
            descriptions: [
                'Missile payload damage: +10% per rank',
                'Area of Effect (AOE) blast radius: +12px per rank (up to +120px)',
                'Secondary missile charge rate: +6% per rank'
            ]
        },
        magnetism: {
            name: 'Quantum Tractor Beam',
            maxRank: 10,
            descriptions: [
                'Scrap attraction radius: +28px per rank (45px -> 325px)',
                'Magnetic pull acceleration: +35px/s² per rank',
                'Scavenger salvage yield: +3% bonus scrap value per rank'
            ]
        },
        engines: {
            name: 'Hyper-Drive & Thrusters',
            maxRank: 10,
            descriptions: [
                'Ship movement speed: +3% per rank',
                'Afterburner Boost: +6% duration, -5% recharge cooldown per rank'
            ]
        },
        specials: {
            name: 'Precursor Cyber Overload',
            maxRank: 10,
            descriptions: [
                'Special ability duration: +0.35s per rank',
                'Special ability cooldown: -5% per rank (down to 50% cooldown)'
            ]
        },
        addons: {
            name: 'Quantum Combat Drones',
            maxRank: 10,
            descriptions: [
                'Deploys orbiting companion drones (1 at Rank 1, 2 at Rank 4, 3 at Rank 7, 4 at Rank 10)',
                'Drones fire helper plasma darts and intercept enemy missiles'
            ]
        },
        cosmetics: {
            name: 'Chrono-Holo Plating & FX',
            maxRank: 5,
            descriptions: [
                'Rank 1: Unlocks Neon Cyan ship & Electric Blue trail',
                'Rank 2: Unlocks Cyber Magenta ship & Flame Red trail',
                'Rank 3: Unlocks Matrix Emerald ship & Toxic Green trail',
                'Rank 4: Unlocks Aurum Gold ship, Gold trail & EMP Shockwave explosion',
                'Rank 5: Unlocks Void Purple ship, Rainbow trail & Scrap Burst explosion'
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

        // Reset all upgrades and refund all spent scrap (player-friendly)
        resetState(refund = true) {
            if (refund) {
                // Calculate total spent scrap
                let totalSpent = 0;
                for (const cat in this.state.upgrades) {
                    const rank = this.state.upgrades[cat];
                    for (let r = 1; r <= rank; r++) {
                        totalSpent += r * 100;
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
            // Cost scale: rank N costs N * 100 scrap
            return (currentRank + 1) * 100;
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
            // Validate unlock status before setting
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
            } else if (type === 'explosionStyle') {
                if (value === 'emp' && cosmeticRank >= 4) return true;
                if (value === 'scrap' && cosmeticRank >= 5) return true;
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

            return {
                // Weapons: Base damage +5% per rank, fire rate +3% per rank, projectile speed +5% per rank
                weaponDamageMultiplier: 1 + wpRank * 0.05,
                weaponFireRateMultiplier: 1 + wpRank * 0.03, // reduces cooldown duration
                weaponProjSpeedMultiplier: 1 + wpRank * 0.05,

                // Shields: Max HP +10 per rank, regen rate (+0.15 HP/sec per rank), invuln duration (+0.05s)
                shieldMaxHPBonus: shRank * 10,
                shieldRegenRate: shRank * 0.15, // HP per second
                shieldInvulnBonus: shRank * 0.05, // seconds

                // Rockets: Missile payload damage +10%/rank, AOE blast radius +12px/rank, recharge rate +6%/rank
                rocketDamageMultiplier: 1 + rkRank * 0.10,
                rocketAoeRadiusBonus: rkRank * 12,
                rocketRechargeMultiplier: 1 + rkRank * 0.06,

                // Magnetism: Attraction radius (base 45px, +28px/rank up to 325px), pull force (+35/rank), scrap value bonus (+3%/rank)
                magnetismRank: mgRank,
                magnetRadius: 45 + mgRank * 28,
                magnetPullForce: 280 + mgRank * 35,
                scrapValueMultiplier: 1 + mgRank * 0.03,

                // Engines: Movement speed +3% per rank, thruster efficiency
                engineSpeedMultiplier: 1 + enRank * 0.03,
                engineBoostDurationMultiplier: 1 + enRank * 0.06,
                engineBoostCooldownMultiplier: Math.max(0.4, 1 - enRank * 0.05),

                // Specials: Ship-specific ability cooldown reduction (-5% per rank), duration increase (+0.35s per rank)
                specialCooldownMultiplier: Math.max(0.5, 1 - spRank * 0.05),
                specialDurationBonus: spRank * 0.35,

                // Addons: Orbiting combat drone count (1 at rank 1, 2 at rank 4, 3 at rank 7, 4 at rank 10) & fire rate
                addonRank: adRank,
                droneCount: adRank >= 10 ? 4 : (adRank >= 7 ? 3 : (adRank >= 4 ? 2 : (adRank >= 1 ? 1 : 0))),
                droneFireRate: 1.0 + adRank * 0.1,

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
