// tests/level_journey_background_test.js — Verification for 100-Level Background Journey & Level Clear Screen
const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log("============================================================");
console.log("DARIUS STAR: 100-LEVEL JOURNEY & LEVEL CLEAR INTERMISSION TESTS");
console.log("============================================================");

// Mock browser / storage globals
const storageMap = {};
global.localStorage = {
    getItem: (k) => storageMap[k] || null,
    setItem: (k, v) => { storageMap[k] = String(v); },
    removeItem: (k) => { delete storageMap[k]; }
};

global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
const dummyEl = { addEventListener: () => {}, removeEventListener: () => {}, style: {}, classList: { add: ()=>{}, remove: ()=>{} } };
global.document = { getElementById: () => dummyEl, createElement: () => ({ getContext: () => ctx, width: 800, height: 450 }), addEventListener: () => {} };
global.canvas = { width: 800, height: 450, addEventListener: () => {} };
global.ctx = {
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    moveTo: () => {},
    lineTo: () => {},
    bezierCurveTo: () => {},
    closePath: () => {},
    strokeText: () => {},
    fillText: () => {},
    drawImage: () => {},
    setLineDash: () => {},
    measureText: (txt) => ({ width: txt.length * 8 }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createLinearGradient: () => ({ addColorStop: () => {} })
};
global.Image = class { constructor() { this.src = ''; this.complete = true; this.naturalWidth = 256; this.naturalHeight = 256; } };
global.Particle = class { constructor(x, y, color) { this.x = x; this.y = y; this.color = color; } };
global.FloatingText = class { constructor(x, y, text, color) { this.x = x; this.y = y; this.text = text; this.color = color; } };

global.enemies = [];
global.enemyBullets = [];
global.bullets = [];
global.particles = [];
global.scrapDrops = [];
global.floatingTexts = [];
global.powerups = [];
global.score = 1200;
global.runScrap = 350;
global.gameTime = 42.5;
global.runSeed = 42;
global.biomeLevel = 1;
global.vfxSprites = {};
global.keys = {};
global.playSound = () => {};
global.spawnHitFlash = () => {};
global.mulberry32 = (seed) => () => 0.5;

// Load biome_data.js
const biomeDataCode = fs.readFileSync(path.join(__dirname, '../js/levels/biome_data.js'), 'utf8');
eval(biomeDataCode);

// Load parallax.js
const parallaxCode = fs.readFileSync(path.join(__dirname, '../js/renderer/parallax.js'), 'utf8');
eval(parallaxCode);

// Load upgrade_system.js
const upgradeCode = fs.readFileSync(path.join(__dirname, '../js/upgrade_system.js'), 'utf8');
eval(upgradeCode);

// Load save_system.js
const saveCode = fs.readFileSync(path.join(__dirname, '../js/save_system.js'), 'utf8');
eval(saveCode);

// Load ui.js
const uiCode = fs.readFileSync(path.join(__dirname, '../js/ui.js'), 'utf8');
eval(uiCode);

// Load enemies.js for Enemy constructor
const enemiesCode = fs.readFileSync(path.join(__dirname, '../js/enemies.js'), 'utf8');
eval(enemiesCode);

// Load level_manager.js
const levelManagerCode = fs.readFileSync(path.join(__dirname, '../js/level_manager.js'), 'utf8');
eval(levelManagerCode);

// ─── 1. 100-Level Journey Metadata Verification ──────────────────────────────
console.log("1. Testing 100-Level Journey Metadata Completeness across 10 Biomes...");
assert(BIOME_DATA, "BIOME_DATA must exist");
assert(BIOME_DATA.levelDetails, "BIOME_DATA.levelDetails must be defined");

let totalLevelsFound = 0;
for (let b = 1; b <= 10; b++) {
    for (let l = 1; l <= 10; l++) {
        const info = BIOME_DATA.getLevelInfo(b, l);
        assert(info, `Level ${b}.${l} info must exist`);
        assert(info.name && info.name.length > 0, `Level ${b}.${l} must have a name`);
        assert(info.landmark && info.landmark.length > 0, `Level ${b}.${l} must have a landmark`);
        assert(info.skyGradient && info.skyGradient.length === 3, `Level ${b}.${l} must have a 3-stop sky gradient`);
        assert(info.intel && info.intel.length > 10, `Level ${b}.${l} must have intel lore description`);
        totalLevelsFound++;
    }
}
assert.strictEqual(totalLevelsFound, 100, "Must have exactly 100 level definitions across 10 biomes");
console.log("  [PASS] All 100 level metadata entries, landmarks, gradients, and intel logs verified.");

// ─── 2. Multi-Layer Background & Landmark Rendering Test ────────────────────
console.log("2. Testing Journey Landmarks & Multi-Layer Procedural Backgrounds...");
for (let b = 1; b <= 10; b++) {
    for (let l = 1; l <= 10; l++) {
        const canvasBg = generateBiomeBackground(b, l);
        assert(canvasBg && canvasBg.width >= 800, `Background canvas for level ${b}.${l} must be created`);
        const lm = new JourneyLandmark(b, l);
        lm.update(0.016);
        lm.draw(ctx);
    }
}
console.log("  [PASS] Background generators & landmarks for all 100 levels rendered without error.");

// ─── 3. LevelManager Per-Level Statistics & Clear Screen Trigger ─────────────
console.log("3. Testing LevelManager Stat Tracking & Level Clear Intermission Screen...");
LevelManager.init();
LevelManager.setBiomeAndLevel(2, 3);
assert.strictEqual(LevelManager.biome, 2);
assert.strictEqual(LevelManager.level, 3);

// Simulate spawning and killing enemies
LevelManager.onEnemySpawned();
LevelManager.onEnemySpawned();
LevelManager.onEnemySpawned();
LevelManager.onEnemySpawned();
LevelManager.onEnemyKilled();
LevelManager.onEnemyKilled();
LevelManager.onEnemyKilled();
LevelManager.onEnemyKilled();

// Simulate scrap drops and collections
LevelManager.onScrapDropped(200);
LevelManager.onScrapCollected(200);

let clearScreenReceived = null;
global.showLevelClearScreen = (summary) => {
    clearScreenReceived = summary;
};

LevelManager.triggerLevelClear();
assert(clearScreenReceived, "showLevelClearScreen must be triggered");
assert.strictEqual(clearScreenReceived.biome, 2);
assert.strictEqual(clearScreenReceived.level, 3);
assert.strictEqual(clearScreenReceived.killPct, 100, "Kill percentage should be 100%");
assert.strictEqual(clearScreenReceived.scrapPct, 100, "Scrap percentage should be 100%");
assert.strictEqual(clearScreenReceived.rank, 'S', "Grade should be S-Rank for 100% kill & 100% scrap");

console.log("  [PASS] Level stats calculated, S-Rank awarded, and Level Clear screen triggered.");

// ─── 4. Level Clear Debriefing UI & Screen Flow Test ─────────────────────────
console.log("4. Testing Level Clear Debriefing UI & Direct Actions (Next, Upgrade, Intel)...");
// Set screen to LEVEL_CLEAR
currentScreen = SCREENS.LEVEL_CLEAR;
window._levelClearSummary = clearScreenReceived;
window._levelClearAnimTimer = 2.0;

// Test advanceToNextLevelFromDebriefing
advanceToNextLevelFromDebriefing();
assert.strictEqual(currentScreen, SCREENS.PLAYING, "Transition to PLAYING on advance");
assert.strictEqual(LevelManager.level, 4, "LevelManager should advance to Level 4");
assert.strictEqual(LevelManager.biome, 2, "Biome should remain Biome 2");

console.log("  [PASS] Debriefing transition to next level (2.4) verified.");

console.log("============================================================");
console.log("ALL 100-LEVEL JOURNEY & DEBRIEFING TESTS PASSED (100%)");
console.log("============================================================");
