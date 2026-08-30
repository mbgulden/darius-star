// tests/multiplayer_repair_protocol_test.js — Verification for Multiplayer Repair Protocol & Anti-Hoarding Scrap Jettison
const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log("============================================================");
console.log("DARIUS STAR: MULTIPLAYER REPAIR PROTOCOL & ANTI-HOARDING TESTS");
console.log("============================================================");

// Mock browser globals
const storageMap = {};
global.localStorage = {
    getItem: (k) => storageMap[k] || null,
    setItem: (k, v) => { storageMap[k] = String(v); },
    removeItem: (k) => { delete storageMap[k]; }
};

global.window = global;
global.window.matchMedia = () => ({ matches: false });
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
const dummyEl = { addEventListener: () => {}, removeEventListener: () => {}, style: {}, classList: { add: ()=>{}, remove: ()=>{} }, innerText: '' };
global.document = { getElementById: () => dummyEl, createElement: () => ({ getContext: () => ctx, width: 800, height: 450 }), addEventListener: () => {} };
global.canvas = { width: 800, height: 450, style: {}, addEventListener: () => {} };
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
global.EnvironmentParticle = class { constructor(type) { this.type = type; } };
global.envParticles = [];
global.envSpawnAccum = 0;
global.FloatingText = class { constructor(x, y, text, color) { this.x = x; this.y = y; this.text = text; this.color = color; } };

global.enemies = [];
global.enemyBullets = [];
global.bullets = [];
global.particles = [];
global.vfxExplosions = [];
global.scrapDrops = [];
global.floatingTexts = [];
global.powerups = [];
global.score = 1000;
global.runScrap = 500;
global.gameTime = 10.0;
global.runSeed = 42;
global.biomeLevel = 1;
global.vfxSprites = {};
global.playerSprites = {};
global.SPRITE_FRAME = 64;
global.keys = {};
global.banterEnabled = true;
global.streamerMode = false;
global.gameOver = false;
global.gameWon = false;
global.paused = false;
global.bossIntroPlaying = false;
global.victoryVideoPlaying = false;
global.singlePlayerPullOutTimer = 0;
global.requestAnimationFrame = () => {};
global.GAME_WIDTH = 800;
global.GAME_HEIGHT = 450;
global.initializeRendererBuffers = () => {};
global.setBiomeBackgrounds = () => {};
global.bgLayers = [];
global.starBuffer = { dirty: false, rebuild: () => {}, canvas: {} };
global.envBuffer = { dirty: false, rebuild: () => {}, canvas: {} };
global.playSound = () => {};
global.createExplosion = () => {};
global.spawnHitFlash = () => {};
global.drawSpriteFrame = () => {};
global.getCurrentDifficultyConfig = () => ({ playerDamageMultiplier: 1.0, startingLives: 3 });

// Load upgrade_system.js
const upgradeCode = fs.readFileSync(path.join(__dirname, '../js/upgrade_system.js'), 'utf8');
eval(upgradeCode);

// Load multiplayer.js
const mpCode = fs.readFileSync(path.join(__dirname, '../js/multiplayer.js'), 'utf8');
eval(mpCode);

// Load player.js
const playerCode = fs.readFileSync(path.join(__dirname, '../js/player.js'), 'utf8');
eval(playerCode);


// Load biome_data.js
const biomeDataCode = fs.readFileSync(path.join(__dirname, '../js/levels/biome_data.js'), 'utf8');
eval(biomeDataCode);

// Load combat.js
const combatCode = fs.readFileSync(path.join(__dirname, '../js/combat.js'), 'utf8');
eval(combatCode);

// Load level_manager.js
const lmCode = fs.readFileSync(path.join(__dirname, '../js/level_manager.js'), 'utf8');
eval(lmCode);



// Load parallax.js
const parallaxCode = fs.readFileSync(path.join(__dirname, '../js/renderer/parallax.js'), 'utf8');
eval(parallaxCode);

// Load utils.js
const utilsCode = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf8');
eval(utilsCode);

// Load game_loop.js
const glCode = fs.readFileSync(path.join(__dirname, '../js/game_loop.js'), 'utf8');
eval(glCode);

// ─── 1. Single-Player Knockout vs Multiplayer Knockout Test ──────────────────
console.log("1. Testing Player Knockout & Repair Retreat Behavior...");
global.player = new Player('striker', 1);
player.x = 200;
player.y = 150;
global.remotePlayers = [new Player('phantom', 2)];
remotePlayers[0].x = 250;
remotePlayers[0].y = 200;
Multiplayer.init();
Multiplayer.players = [
    Multiplayer.createPlayerMeta(1, 'striker', true),
    Multiplayer.createPlayerMeta(2, 'phantom', false)
];
Multiplayer.count = 2;

// Deal fatal damage to Player 1
player.shield = 20;
player.takeDamage(50); // Knockout

assert.strictEqual(player.isPulledOut, true, "Player 1 should enter isPulledOut repair state");
assert.strictEqual(player.shield, 0, "Shield should be 0");
assert.strictEqual(player.canShoot, false, "Knocked-out ship must stop firing immediately");
assert(player.pullOutTimer > 0, "pullOutTimer should be active");

// Simulate update loop — verify ship retreats towards bottom-left
const initialX = player.x;
const initialY = player.y;
player.update(0.5);
assert(player.x < initialX, "Repairing ship should pull back / retreat towards left");
assert(player.y > initialY, "Repairing ship should retreat towards bottom of screen");

// Verify shoot() is blocked while pulled out
const bulletCountBefore = bullets.length;
player.shoot();
assert.strictEqual(bullets.length, bulletCountBefore, "shoot() must be disabled during repair");

console.log("  [PASS] Knocked-out ship stops firing, retreats to bottom-left staging area, and counts down repair.");

// ─── 2. Revival / Rejoin when teammate covers repair cycle ───────────────────
console.log("2. Testing Revival & Return to Combat when Teammate Survives...");
// Complete Player 1's repair timer while Player 2 is healthy
player.pullOutTimer = 0.05;
player.update(0.1); // Timer expires

assert.strictEqual(player.isPulledOut, false, "Player 1 should be repaired and back in combat");
assert.strictEqual(player.shield, player.shieldMax, "Shield should be restored to maximum");
assert(player.invulnerable >= 3.0, "Repaired ship should have 3s return invulnerability");

console.log("  [PASS] Field repair completes successfully when teammate remains active.");

// ─── 3. Mutual Knockout / Double Defeat Regroup Checkpoint Test ──────────────
console.log("3. Testing Mutual Knockout & Regroup at Checkpoint Protocol...");
gameOver = false;
player.isPulledOut = true;
player.shield = 0;
remotePlayers[0].isPulledOut = true;
remotePlayers[0].shield = 0;

checkMultiplayerRegroupCheckpoint(0.016);
assert.strictEqual(gameOver, true, "gameOver must trigger when all players are knocked out");
assert.strictEqual(window._isRegroupCheckpoint, true, "window._isRegroupCheckpoint must be set");

console.log("  [PASS] Mutual knockout triggered squadron regroup checkpoint protocol.");

// ─── 4. Anti-Hoarding Scrap Jettison on Level Restart Test ───────────────────
console.log("4. Testing Anti-Hoarding Scrap Jettison on Level Restart...");
LevelManager.stats = { startScrap: 500 };
runScrap = 750; // Collected 250 junk during failed level run
DS_UpgradeSystem.state.scrap = 750;

jettisonUncommittedScrap();
assert.strictEqual(runScrap, 500, "runScrap must be reset to level start baseline (500)");
assert.strictEqual(DS_UpgradeSystem.state.scrap, 500, "UpgradeSystem scrap must be reset to 500");
assert.strictEqual(window._jettisonedScrapAmount, 250, "Jettisoned scrap should be exactly 250");

console.log("  [PASS] Anti-hoarding protocol successfully jettisoned 250 uncommitted scrap upon failure.");

console.log("============================================================");
console.log("ALL MULTIPLAYER REPAIR PROTOCOL & ANTI-HOARDING TESTS PASSED (100%)");
console.log("============================================================");
