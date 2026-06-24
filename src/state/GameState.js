// js/state/GameState.js — Game State Manager (GRO-2161)
// Centralized global singleton managing score, health, and current level string.

const GameState = {
    _score: 0,
    _health: 100,

    get score() {
        return this._score;
    },
    set score(val) {
        this._score = val;
    },

    get health() {
        if (typeof player !== 'undefined' && player) {
            return player.shield;
        }
        return this._health;
    },
    set health(val) {
        this._health = val;
        if (typeof player !== 'undefined' && player) {
            player.shield = val;
        }
    },

    get currentLevelString() {
        if (typeof LevelManager !== 'undefined' && LevelManager.currentBiome) {
            const biomeNum = LevelManager.currentBiome;
            const levelNum = LevelManager.currentLevel;
            const activeBiomeName = (typeof BIOME_DATA !== 'undefined' && BIOME_DATA.names) ?
                (BIOME_DATA.names[biomeNum] || `Biome ${biomeNum}`) : `Biome ${biomeNum}`;
            return `BIOME: ${activeBiomeName} — LEVEL: ${levelNum}`;
        }
        return 'BIOME: Unknown';
    }
};

// Expose GameState globally
const globalObj = (typeof window !== 'undefined') ? window : global;
globalObj.GameState = GameState;

// Define compatibility getters/setters on global object for global score variable
Object.defineProperty(globalObj, 'score', {
    get: function() { return GameState.score; },
    set: function(val) { GameState.score = val; },
    configurable: true
});
