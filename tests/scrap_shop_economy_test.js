// tests/scrap_shop_economy_test.js — Verification for Precursor Quantum Fabricator, Scrap Magnetism & Rare Items
const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log("============================================================");
console.log("DARIUS STAR: QUANTUM FABRICATOR, SCRAP & MAGNETISM TESTS");
console.log("============================================================");

// Mock browser / storage globals
const storageMap = {};
global.localStorage = {
    getItem: (k) => storageMap[k] || null,
    setItem: (k, v) => { storageMap[k] = String(v); },
    removeItem: (k) => { delete storageMap[k]; }
};

global.window = global;
const dummyEl = { addEventListener: () => {}, removeEventListener: () => {}, style: {}, classList: { add: ()=>{}, remove: ()=>{} } };
global.document = { getElementById: () => dummyEl, addEventListener: () => {} };
global.canvas = { width: 1280, height: 720, addEventListener: () => {} };
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
    closePath: () => {},
    strokeText: () => {},
    fillText: () => {},
    drawImage: () => {},
    setLineDash: () => {},
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createLinearGradient: () => ({ addColorStop: () => {} })
};
global.Image = class { constructor() { this.src = ''; this.complete = true; this.naturalWidth = 256; this.naturalHeight = 256; } };
global.Particle = class { constructor(x, y, color) { this.x = x; this.y = y; this.color = color; } };
global.FloatingText = class { constructor(x, y, text, color) { this.x = x; this.y = y; this.text = text; this.color = color; } };

global.enemyBullets = [];
global.enemies = [];
global.bullets = [];
global.boss = null;
global.particles = [];
global.vfxExplosions = [];
global.scrapDrops = [];
global.floatingTexts = [];
global.powerups = [];
global.remotePlayers = [];
global.score = 0;
global.runScrap = 0;
global.gameTime = 1.0;
global.runSeed = 42;
global.biomeLevel = 1;
global.vfxSprites = {};
global.bossSprites = {};
global.playerSprites = {};
global.SPRITE_FRAME = 256;
global.SHIELD_FRAME = 512;
global.keys = {};

global.playSound = (name, opts) => {};
global.spawnHitFlash = (x, y, type) => {};
global.mulberry32 = (seed) => () => 0.5;

global.getCurrentDifficultyConfig = () => ({
    id: 'normal',
    enemyHpMultiplier: 1.0,
    enemySpeedMultiplier: 1.0,
    enemyFireRateMultiplier: 1.0,
    bossHpMultiplier: 1.0,
    powerupDropMultiplier: 1.0
});

// Load upgrade_system.js
const upgradeCode = fs.readFileSync(path.join(__dirname, '../js/upgrade_system.js'), 'utf8');
eval(upgradeCode);

const utilsCode = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf8');
eval(utilsCode);

const combatCode = fs.readFileSync(path.join(__dirname, '../js/combat.js'), 'utf8');
eval(combatCode);

const playerCode = fs.readFileSync(path.join(__dirname, '../js/player.js'), 'utf8');
eval(playerCode);

// ─── 1. UpgradeSystem 8-Category Suite & Modifiers Test ───
console.log("1. Testing Precursor Quantum Fabricator (8 Upgrade Branches)...");
const us = window.DS_UpgradeSystem;
assert(us, "UpgradeSystem must be defined");
us.resetState(false);

const cats = ['weapons', 'shields', 'rockets', 'magnetism', 'engines', 'specials', 'addons', 'cosmetics'];
cats.forEach(c => {
    assert(us.getMaxRank(c) > 0, `Category ${c} must have maxRank > 0`);
});

// Add scrap and purchase upgrades
us.addScrap(50000);
assert(us.state.scrap >= 50000, "Scrap must be credited");

// Buy Rank 10 in magnetism and rockets
for (let r = 0; r < 10; r++) {
    const okMag = us.buyUpgrade('magnetism');
    const okRk = us.buyUpgrade('rockets');
    const okAd = us.buyUpgrade('addons');
    assert(okMag, "Should purchase magnetism");
    assert(okRk, "Should purchase rockets");
    assert(okAd, "Should purchase addons");
}

const mods = us.getGameplayModifiers();
assert.strictEqual(mods.magnetismRank, 10, "Magnetism rank should be 10");
assert.strictEqual(mods.magnetRadius, 325, "Magnet radius should be 45 + 10*28 = 325px");
assert(mods.rocketAoeRadiusBonus === 120, "Rocket AOE radius bonus should be 120px");
assert(mods.droneCount === 4, "Rank 10 addons should deploy 4 drones");
console.log("  [PASS] All 8 Quantum Fabricator upgrade branches & gameplay modifiers verified.");

// ─── 2. ScrapDrop Variations & Upgraded Quantum Magnetism Test ───
console.log("2. Testing ScrapDrop Variations & Upgradable Magnetism Pull...");
global.player = new Player();
player.x = 200;
player.y = 200;

const scrapTypes = ['metal', 'alloy', 'cell', 'core', 'essence', 'fragment'];
scrapTypes.forEach(t => {
    const sd = new ScrapDrop(400, 200, t); // 200px away (within 325px upgraded radius, outside 45px unupgraded)
    sd.update(0.016);
    sd.draw();
    // With upgraded magnet radius (325px), distance is 200px -> sd should be pulled toward player (vx < 0 or moving towards player)
    assert(sd.vx < 0, `Scrap ${t} should be pulled towards player (vx: ${sd.vx})`);
});
console.log("  [PASS] All 6 scrap types (metal, alloy, cell, core, essence, fragment) and magnet physics verified.");

// ─── 3. Un-upgraded Magnetism Range Limitation Test ───
console.log("3. Testing Un-upgraded Magnetism (Strict Proximity Only)...");
us.resetState(false); // Reset to rank 0
const unupgradedMods = us.getGameplayModifiers();
assert.strictEqual(unupgradedMods.magnetRadius, 45, "Base un-upgraded magnet radius must be 45px");

const sdFar = new ScrapDrop(300, 200, 'metal'); // 100px away (> 45px)
const initialVx = sdFar.vx;
sdFar.update(0.016);
// Should NOT be pulled by magnet
assert(sdFar.vx === initialVx * 0.97, "Scrap outside 45px base radius should not be pulled");
console.log("  [PASS] Un-upgraded magnet radius strictly limited to 45px.");

// ─── 4. PowerUp Items & Shield Recharger Test ───
console.log("4. Testing PowerUp Variations (Weapon, Shield, Shield Regen, Bomb, Speed, Materia)...");
const pTypes = ['W', 'S', 'SR', 'B', 'SP', 'M'];
pTypes.forEach(pt => {
    const pu = new PowerUp(150, 150, pt);
    pu.update(0.016);
    pu.draw();
    assert(pu.width === 24 && pu.height === 24, "PowerUp dimensions must be 24x24");
});
console.log("  [PASS] PowerUp variations and Nanite Shield Recharger verified.");

// ─── 5. Player Combat Drones & Missile Rocket Pods Test ───
console.log("5. Testing Combat Drones Orbital Mechanics & Missile Payloads...");
us.addScrap(10000);
us.buyUpgrade('addons');
us.buyUpgrade('rockets');

player.update(0.016);
player.draw();
assert(player.droneAngle !== undefined, "Player drone angle should be initialized");

player.secondaryMeter = 100;
player.fireHomingMissiles();
assert(bullets.length >= 3, "Should launch 3 homing missiles");
const m = bullets[bullets.length - 1];
assert(m.secondaryType === 'missile', "Bullet should be missile type");
assert(m.damage > 6, "Missile damage should be boosted by rocket upgrades");
console.log("  [PASS] Combat drones and boosted Valkyrie missile pods verified.");

console.log("============================================================");
console.log("ALL QUANTUM FABRICATOR, SCRAP & MAGNETISM TESTS PASSED (100%)");
console.log("============================================================");
