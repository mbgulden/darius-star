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
            engines: 0,
            specials: 0,
            cosmetics: 0
        },
        selections: {
            shipColor: 'default',
            thrusterTrail: 'default',
            explosionStyle: 'default'
        }
    };

    // Metadata for each upgrade category
    const UPGRADE_CONFIG = {
        weapons: {
            name: 'Weapon Systems',
            maxRank: 10,
            descriptions: [
                'Base projectile damage: +5% per rank',
                'Fire rate: +3% per rank (cooldown reduced)',
                'Projectile speed: +5% per rank'
            ]
        },
        shields: {
            name: 'Shield Generators',
            maxRank: 10,
            descriptions: [
                'Max HP/Shield: +10 per rank (up to 200 total)',
                'Passive Shield Regen: +0.1 HP/s per rank',
                'Invulnerability frames: +0.05s on hit'
            ]
        },
        engines: {
            name: 'Engines & Thrusters',
            maxRank: 10,
            descriptions: [
                'Movement speed: +3% per rank',
                'Afterburner Boost: Increases duration and recharge rate (press Shift to boost)'
            ]
        },
        specials: {
            name: 'Cyber Overload',
            maxRank: 10,
            descriptions: [
                'Ability duration: +0.3s per rank (base 4.0s)',
                'Ability cooldown: -5% per rank (base 15s, press K to activate)'
            ]
        },
        cosmetics: {
            name: 'Ship Customization',
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
            const enRank = this.state.upgrades.engines || 0;
            const spRank = this.state.upgrades.specials || 0;

            return {
                // Weapons: Base damage +5% per rank, fire rate +3% per rank, projectile speed +5% per rank
                weaponDamageMultiplier: 1 + wpRank * 0.05,
                weaponFireRateMultiplier: 1 + wpRank * 0.03, // reduces cooldown duration
                weaponProjSpeedMultiplier: 1 + wpRank * 0.05,

                // Shields: Max HP +10 per rank, regen rate (+0.1 HP/sec per rank), invuln duration (+0.05s)
                shieldMaxHPBonus: shRank * 10,
                shieldRegenRate: shRank * 0.1, // HP per second
                shieldInvulnBonus: shRank * 0.05, // seconds

                // Engines: Movement speed +3% per rank, thruster efficiency
                engineSpeedMultiplier: 1 + enRank * 0.03,
                engineBoostDurationMultiplier: 1 + enRank * 0.05,
                engineBoostCooldownMultiplier: 1 - enRank * 0.04, // reduces cooldown duration

                // Specials: Ship-specific ability cooldown reduction (-5% per rank), duration increase (+0.3s per rank)
                specialCooldownMultiplier: 1 - spRank * 0.05,
                specialDurationBonus: spRank * 0.3, // seconds

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
})();
