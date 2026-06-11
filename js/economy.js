// economy.js — FULL IMPLEMENTATION (Ned, GRO-1100)
// Economy: scrap drop rolling, segment-based anti-farming, and drop payload creation.
// Built from docs/foundational-structure-audit.md §2 and matched to game_loop/enemies calls.

const ECONOMY_DROP_TYPES = {
    metal:   { min: 10,  max: 50,   weight: 54 },
    alloy:   { min: 50,  max: 100,  weight: 25 },
    cell:    { min: 100, max: 250,  weight: 13 },
    core:    { min: 250, max: 500,  weight: 6  },
    essence: { min: 500, max: 1000, weight: 2  }
};

const ECONOMY_TABLES = {
    grunt: {
        dropChance: 0.38,
        biomeBonus: 2,
        typeWeights: { metal: 72, alloy: 22, cell: 6 }
    },
    elite: {
        dropChance: 0.58,
        biomeBonus: 5,
        typeWeights: { metal: 35, alloy: 38, cell: 20, core: 7 }
    },
    boss_minion: {
        dropChance: 0.46,
        biomeBonus: 4,
        typeWeights: { metal: 45, alloy: 35, cell: 16, core: 4 }
    },
    boss: {
        dropChance: 1.0,
        biomeBonus: 12,
        typeWeights: { alloy: 18, cell: 34, core: 30, essence: 18 }
    },
    default: {
        dropChance: 0.42,
        biomeBonus: 3,
        typeWeights: { metal: 60, alloy: 28, cell: 10, core: 2 }
    }
};

function economyClampBiome(biomeLevel) {
    const level = Number.isFinite(Number(biomeLevel)) ? Math.floor(Number(biomeLevel)) : 1;
    return Math.max(1, Math.min(10, level));
}

function economyGetTable(enemyType) {
    return ECONOMY_TABLES[enemyType] || ECONOMY_TABLES.default;
}

function economyWeightedChoice(weightMap) {
    const entries = Object.entries(weightMap || ECONOMY_TABLES.default.typeWeights)
        .filter(([, weight]) => Number(weight) > 0);
    const total = entries.reduce((sum, [, weight]) => sum + Number(weight), 0);
    if (!entries.length || total <= 0) return 'metal';

    let roll = Math.random() * total;
    for (const [type, weight] of entries) {
        roll -= Number(weight);
        if (roll <= 0) return type;
    }
    return entries[entries.length - 1][0];
}

function economyRollAmount(type, biomeLevel, table) {
    const config = ECONOMY_DROP_TYPES[type] || ECONOMY_DROP_TYPES.metal;
    const biome = economyClampBiome(biomeLevel);
    const base = config.min + Math.floor(Math.random() * (config.max - config.min + 1));
    const biomeBonus = (biome - 1) * (table.biomeBonus || 0);
    return Math.max(1, Math.round(base + biomeBonus));
}

function economyNormalizeSegmentStore(store) {
    const normalized = {};
    if (!store || typeof store !== 'object') return normalized;

    for (const segmentId in store) {
        const value = store[segmentId];
        if (value instanceof Set) {
            normalized[segmentId] = value;
        } else if (Array.isArray(value)) {
            normalized[segmentId] = new Set(value);
        } else if (value && typeof value === 'object') {
            normalized[segmentId] = new Set(Object.keys(value).filter((key) => value[key]));
        }
    }
    return normalized;
}

window.Economy = {
    _lootedSegments: {},
    _currentSegment: 0,
    _dropTypes: ECONOMY_DROP_TYPES,
    _lootTables: ECONOMY_TABLES,

    init() {
        this._lootedSegments = {};
        this._currentSegment = 0;
    },

    _segmentKey() {
        return `segment_${this._currentSegment}`;
    },

    _currentLootSet() {
        this._lootedSegments = economyNormalizeSegmentStore(this._lootedSegments);
        const segmentKey = this._segmentKey();
        if (!this._lootedSegments[segmentKey]) {
            this._lootedSegments[segmentKey] = new Set();
        }
        return this._lootedSegments[segmentKey];
    },

    shouldDrop(enemyId) {
        const id = enemyId === undefined || enemyId === null ? `unknown_${Date.now()}_${Math.random()}` : String(enemyId);
        const looted = this._currentLootSet();
        if (looted.has(id)) return false;

        // Mark first, even if the chance roll fails, so checkpoint reloads cannot re-roll the same enemy.
        looted.add(id);
        const chance = ECONOMY_TABLES.default.dropChance;
        return Math.random() < chance;
    },

    rollDrop(enemyType, biomeLevel) {
        const table = economyGetTable(enemyType);
        const type = economyWeightedChoice(table.typeWeights);
        const amount = economyRollAmount(type, biomeLevel, table);
        return { type, amount };
    },

    createDrop(x, y, type, amount) {
        const safeType = ECONOMY_DROP_TYPES[type] ? type : 'metal';
        const fallbackAmount = economyRollAmount(safeType, (typeof biomeLevel !== 'undefined' ? biomeLevel : 1), ECONOMY_TABLES.default);
        return {
            x: Number.isFinite(Number(x)) ? Number(x) : 0,
            y: Number.isFinite(Number(y)) ? Number(y) : 0,
            type: safeType,
            amount: Number.isFinite(Number(amount)) ? Math.max(1, Math.round(Number(amount))) : fallbackAmount
        };
    },

    newSegment() {
        this._currentSegment += 1;
        this._currentLootSet();
        return this._currentSegment;
    },

    serializeLootedSegments() {
        this._lootedSegments = economyNormalizeSegmentStore(this._lootedSegments);
        const serializable = {};
        for (const segmentId in this._lootedSegments) {
            serializable[segmentId] = Array.from(this._lootedSegments[segmentId]);
        }
        return serializable;
    },

    restoreLootedSegments(serialized, currentSegment = this._currentSegment) {
        this._lootedSegments = economyNormalizeSegmentStore(serialized);
        this._currentSegment = Math.max(0, Math.floor(Number(currentSegment) || 0));
        this._currentLootSet();
    }
};

console.log('[OK] economy.js loaded — Economy loot tables and anti-farming enabled');
