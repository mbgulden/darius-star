// scrap_events.js — Bridge between economy.js and banter_engine.js (GRO-1054)
// Event emitter that watches scrap collection/upgrades and fires story-relevant
// events so the dialogue system can react to gameplay moments.
//
// Events fired:
//   scrap:collected  { amount, type, runScrap }
//   scrap:milestone  { threshold, runScrap }
//   scrap:legendary  { type, amount }
//   upgrade:purchased { upgradeName, tier, cost }
//   upgrade:max_tier  { upgradeName }

const ScrapEvents = {
    _listeners: {},
    _runScrap: 0,
    _milestones: { '50': false, '200': 'scrap_milestone_50', '1000': 'scrap_milestone_1000' },
    _legendarySeen: {},

    // ---- Public API ----

    /** Register a callback for a named event. */
    on(event, callback) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
        return this;
    },

    /** Fire a named event. */
    emit(event, data) {
        const cbs = this._listeners[event];
        if (!cbs) return;
        for (const cb of cbs) {
            try { cb(data); } catch (e) { /* never let a listener crash the event system */ }
        }
    },

    /**
     * Called by economy.js when a drop payload is generated.
     * Checks for legendary drops (essence type) and fires scrap:legendary.
     */
    onDropGenerated(drop, enemyType, biomeLevel) {
        if (!drop) return;

        // Legendary drops: essence type
        if (drop.type === 'essence') {
            const key = `essence_${enemyType}_${biomeLevel}`;
            if (!this._legendarySeen[key]) {
                this._legendarySeen[key] = true;
                this.emit('scrap:legendary', {
                    type: drop.type,
                    amount: drop.amount,
                    enemyType: enemyType,
                    biomeLevel: biomeLevel
                });
            }
        }
    },

    /**
     * Called by game_loop.js when the player actually collects a scrap drop.
     * Checks milestones (50/200/1000) and fires scrap:collected + scrap:milestone.
     */
    onScrapCollected(amount, type) {
        this._runScrap += amount;

        // Always fire collected
        this.emit('scrap:collected', {
            amount: amount,
            type: type || 'unknown',
            runScrap: this._runScrap
        });

        // Check milestone thresholds
        for (const [threshold, key] of Object.entries(this._milestones)) {
            const t = parseInt(threshold, 10);
            if (this._runScrap >= t && key && !this._milestones[threshold + '_fired']) {
                this.emit('scrap:milestone', {
                    threshold: t,
                    runScrap: this._runScrap
                });
                this._milestones[threshold + '_fired'] = true;
            }
        }
    },

    /**
     * Called by upgrade_system.js when an upgrade is purchased.
     * Fires upgrade:purchased. Also fires upgrade:max_tier when rank hits max (5).
     */
    onUpgradePurchased(upgradeName, tier, cost, maxTier) {
        this.emit('upgrade:purchased', {
            upgradeName: upgradeName,
            tier: tier,
            cost: cost
        });

        if (maxTier !== undefined && tier >= maxTier) {
            this.emit('upgrade:max_tier', {
                upgradeName: upgradeName,
                tier: tier
            });
        }
    },

    /** Get current run scrap total. */
    getRunScrap() {
        return this._runScrap;
    },

    /** Reset all state for a new game. */
    reset() {
        this._runScrap = 0;
        this._milestones = { '50': false, '200': 'scrap_milestone_50', '1000': 'scrap_milestone_1000' };
        this._legendarySeen = {};
    }
};

// Attach to window for browser access
window.ScrapEvents = ScrapEvents;
console.log('[OK] scrap_events.js loaded — economy ↔ banter bridge active');
