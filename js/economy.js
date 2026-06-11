// economy.js — PLACEHOLDER (Jules building full implementation: GRO-1072)
// Provides Economy global with stub methods. Scrap drops disabled until real module ships.

window.Economy = {
    _lootedSegments: {},
    _currentSegment: 0,
    init() {
        this._lootedSegments = {};
        this._currentSegment = 0;
    },
    shouldDrop(enemyId) {
        // Stub: 40% drop rate, no anti-farming yet
        const key = this._currentSegment + '_' + enemyId;
        if (this._lootedSegments[key]) return false;
        this._lootedSegments[key] = true;
        return Math.random() < 0.4;
    },
    rollDrop(enemyType, biomeLevel) {
        const types = ['scrap', 'scrap', 'scrap', 'shield', 'weapon'];
        return { type: types[Math.floor(Math.random() * types.length)], amount: 5 + biomeLevel * 2 };
    },
    createDrop(x, y, type, amount) {
        return { x, y, type, amount };
    },
    newSegment() {
        this._currentSegment++;
    }
};
console.log('[PLACEHOLDER] economy.js loaded — full implementation pending Jules GRO-1072');
