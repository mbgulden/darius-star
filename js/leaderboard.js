// leaderboard.js — FULL IMPLEMENTATION (Ned, GRO-1075)
// LocalStorage-backed high score registry with tier classification.
// Categories: scrapLord, speedrun, survivor. Supports PB tracking and tiered display.

window.Leaderboard = {
    KEY: 'darius_star_leaderboards',

    categories: {
        scrapLord: {
            name: 'Scrap Lord',
            sortDir: 'desc', // higher is better
            tiers: [
                { name: 'Scrap Cadet',   min: 0,     color: '#888888' },
                { name: 'Scrap Miner',   min: 500,   color: '#c0c0c0' },
                { name: 'Scrap Baron',   min: 2000,  color: '#ffd700' },
                { name: 'Scrap Lord',    min: 5000,  color: '#ff4500' }
            ],
            getValue(entry) { return entry.value; }
        },
        speedrun: {
            name: 'Speedrun',
            sortDir: 'asc', // lower is better
            tiers: [
                { name: 'Abyssal Crawler', min: 0,     color: '#4488ff' },
                { name: 'Trench Runner',    min: 300,   color: '#44ccff' },
                { name: 'Rift Dasher',      min: 600,   color: '#ff8844' },
                { name: 'Sonic Phantom',    min: 900,   color: '#ff44ff' }
            ],
            getValue(entry) { return entry.timeSeconds; }
        },
        survivor: {
            name: 'Survivor',
            sortDir: 'asc', // lower deaths = better
            tiers: [
                { name: 'Fodder',       min: 0,   color: '#888888' },
                { name: 'Scrapper',     min: 3,   color: '#44ff44' },
                { name: 'Survivor',     min: 10,  color: '#ffaa00' },
                { name: 'Untouchable',  min: 25,  color: '#ff00ff' }
            ],
            getValue(entry) { return entry.deaths || 0; }
        }
    },

    // ── Query ──────────────────────────────────────────

    _readAll() {
        try {
            return JSON.parse(localStorage.getItem(this.KEY) || '{}');
        } catch (e) {
            return {};
        }
    },

    _writeAll(data) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(data));
        } catch (e) { /* storage full or private mode */ }
    },

    getTop(category, count) {
        const data = this._readAll();
        const list = (data[category] || []).slice();
        const catDef = this.categories[category];
        if (!catDef) return [];

        list.sort((a, b) => {
            const va = catDef.getValue(a);
            const vb = catDef.getValue(b);
            return catDef.sortDir === 'asc' ? va - vb : vb - va;
        });
        return list.slice(0, count || 10);
    },

    // ── Submission ─────────────────────────────────────

    getTier(category, value) {
        const catDef = this.categories[category];
        if (!catDef) return null;
        // Find highest tier the value qualifies for
        let best = catDef.tiers[0];
        for (const tier of catDef.tiers) {
            if (value >= tier.min) best = tier;
        }
        return best;
    },

    submit(category, entry) {
        if (!this.categories[category]) return;

        const data = this._readAll();
        if (!data[category]) data[category] = [];
        data[category].push({
            ...entry,
            date: new Date().toISOString()
        });
        this._writeAll(data);
    },

    isPersonalBest(category, value, shipType) {
        const top = this.getTop(category, 1);
        if (top.length === 0) return true;

        const catDef = this.categories[category];
        const bestVal = catDef.getValue(top[0]);
        return catDef.sortDir === 'asc'
            ? value < bestVal
            : value > bestVal;
    },

    // ── Utility ────────────────────────────────────────

    clearAll() {
        try {
            localStorage.removeItem(this.KEY);
        } catch (e) { }
    },

    getAllForShip(category, shipType, count) {
        const top = this.getTop(category, 100);
        return top.filter(e => !shipType || e.ship === shipType).slice(0, count || 10);
    }
};

console.log('[OK] leaderboard.js loaded — 3 categories, tiered display, localStorage-backed');
