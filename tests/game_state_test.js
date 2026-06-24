// tests/game_state_test.js — GameState Unit Test (GRO-2161)
const assert = require('assert');

// Mock window object to be the global object for Node environment
global.window = global;
global.score = 0; // Compatibility global

// Load GameState.js
const fs = require('fs');
const path = require('path');
const code = fs.readFileSync(path.join(__dirname, '..', 'js/state/GameState.js'), 'utf8');

// Execute code in global context
eval(code);

// Mock LevelManager and player
global.LevelManager = {
    biome: 1,
    level: 1,
    get currentBiome() { return this.biome; },
    get currentLevel() { return this.level; }
};

global.BIOME_DATA = {
    names: {
        1: 'Neon Slums',
        2: 'Abyssal Trench'
    }
};

global.player = null;

// Test Suite
console.log('Running GameState tests...');

// 1. Initial State
assert.strictEqual(window.GameState.score, 0);
assert.strictEqual(window.GameState.health, 100);

// 2. Score mapping
window.GameState.score = 500;
assert.strictEqual(window.GameState.score, 500);
assert.strictEqual(global.score, 500);

global.score = 750;
assert.strictEqual(window.GameState.score, 750);
assert.strictEqual(global.score, 750);

// 3. Health mapping with player entity
global.player = { shield: 80 };
assert.strictEqual(window.GameState.health, 80);

window.GameState.health = 45;
assert.strictEqual(global.player.shield, 45);
assert.strictEqual(window.GameState.health, 45);

// 4. Current level string
global.LevelManager.biome = 1;
global.LevelManager.level = 3;
assert.strictEqual(window.GameState.currentLevelString, 'BIOME: Neon Slums — LEVEL: 3');

global.LevelManager.biome = 2;
global.LevelManager.level = 1;
assert.strictEqual(window.GameState.currentLevelString, 'BIOME: Abyssal Trench — LEVEL: 1');

console.log('✅ GameState unit tests passed successfully!');
