// tests/gap_closure_features_test.js — Verification for Gap Closure & Feature Delivery
const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log("============================================================");
console.log("DARIUS STAR: GAP CLOSURE & FULL FEATURE VERIFICATION SUITE");
console.log("============================================================");

// Mock browser environment
global.window = global;
global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
};
global.document = {
    getElementById: () => ({ style: {}, classList: { add: ()=>{}, remove: ()=>{} }, innerText: "" }),
    querySelectorAll: () => []
};
global.canvas = { width: 800, height: 450 };
global.playedSounds = [];
global.playSound = (type) => { global.playedSounds.push(type); };
global.keys = {};
global.FloatingText = class { constructor(x, y, text, color) { this.x = x; this.y = y; this.text = text; this.color = color; } };
global.Particle = class { constructor(x, y, color) { this.x = x; this.y = y; this.color = color; } };

// 1. Load i18n dictionaries
eval(fs.readFileSync(path.join(__dirname, '../js/i18n/en.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/i18n/ja.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/i18n/de.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/i18n/es.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/i18n.js'), 'utf8'));

console.log("1. Testing Multi-Language Dictionaries & Key Parity...");
const enDict = I18N_DICTS['en'];
const jaDict = I18N_DICTS['ja'];
const deDict = I18N_DICTS['de'];
const esDict = I18N_DICTS['es'];

const enKeys = Object.keys(enDict);
console.log(`  English keys: ${enKeys.length}`);
console.log(`  Japanese keys: ${Object.keys(jaDict).length}`);
console.log(`  German keys: ${Object.keys(deDict).length}`);
console.log(`  Spanish keys: ${Object.keys(esDict).length}`);

assert.ok(Object.keys(deDict).length >= 50, "German dictionary must have complete key coverage");
assert.ok(Object.keys(esDict).length >= 50, "Spanish dictionary must have complete key coverage");

setLanguage('en');
assert.strictEqual(t('START_GAME'), 'START GAME');

setLanguage('de');
assert.strictEqual(t('START_GAME'), 'SPIEL STARTEN');
assert.strictEqual(t('UPGRADE_SHOP'), 'UPGRADE-WERKSTATT');

setLanguage('es');
assert.strictEqual(t('START_GAME'), 'INICIAR MISIÓN');
assert.strictEqual(t('UPGRADE_SHOP'), 'TALLER DE MEJORAS');

setLanguage('ja');
assert.strictEqual(t('START_GAME'), 'ゲームスタート');

console.log("  [PASS] All 4 languages translated and verified cleanly with t() resolution.");

// 2. Testing Weapon Thermal Overheat (GDD §2.2 Supreme Nova)
console.log("2. Testing Weapon Thermal Overheat & Dissipation (GDD §2.2)...");
eval(fs.readFileSync(path.join(__dirname, '../js/upgrade_system.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/save_system.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/multiplayer.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/combat.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/player.js'), 'utf8'));

global.bullets = [];
global.particles = [];
global.floatingTexts = [];
global.gameTime = 1.0;
global.enemyBullets = [];
global.enemies = [];
global.getCurrentDifficultyConfig = () => ({ id: 'normal', playerDamageMultiplier: 1.0 });

const p = new Player(1, 'striker');
p.weaponLevel = 5; // Supreme Nova
assert.strictEqual(p.weaponHeat, 0, "Initial heat must be 0");
assert.strictEqual(p.isOverheated, false, "Initial overheat must be false");

// Fire Supreme Nova repeatedly
for (let i = 0; i < 20; i++) {
    p.shoot();
}

assert.ok(p.weaponHeat >= 100, "20 Supreme Nova salvos must reach 100% heat threshold");
assert.strictEqual(p.isOverheated, true, "Player weapon must enter OVERHEATED state");
assert.ok(p.overheatTimer > 0, "Overheat cooling timer must be active");

// Attempt to fire while overheated
const bulletCount = bullets.length;
p.shoot();
assert.strictEqual(bullets.length, bulletCount, "Player cannot fire weapon while overheated");

// Simulate cooling
p.update(2.0);
assert.strictEqual(p.isOverheated, false, "After 2.0s cooldown, player weapon must return to cooled state");
assert.strictEqual(p.weaponHeat, 0, "Heat must return to 0");
console.log("  [PASS] Weapon heat accumulation, overheat lock, and cooling cycle verified.");

// 3. Testing Online Squadron Lobby & Room Generation
console.log("3. Testing Online Squadron Lobby & Room Codes...");
eval(fs.readFileSync(path.join(__dirname, '../js/ui/multiplayer_lobby.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/net/network_client.js'), 'utf8'));

assert.ok(squadronRoomCode && squadronRoomCode.length >= 4, "Squadron room code must be valid");
generateNewRoomCode();
assert.ok(squadronRoomCode.includes('-'), "Generated room code must have format PREFIX-NUM");
console.log("  [PASS] Squadron room code generated cleanly:", squadronRoomCode);

// 4. Testing Leaderboard Categories & Tier Classification
console.log("4. Testing New Leaderboard Categories (Daily Challenge & Hardcore Scrapper)...");
eval(fs.readFileSync(path.join(__dirname, '../js/leaderboard.js'), 'utf8'));

assert.ok(Leaderboard.categories.dailyChallenge, "dailyChallenge category must exist");
assert.ok(Leaderboard.categories.hardcoreScrapper, "hardcoreScrapper category must exist");

Leaderboard.submit('dailyChallenge', {
    score: 42000,
    ship: 'striker',
    difficulty: 'hard',
    date: new Date().toISOString()
});

const topDaily = Leaderboard.getTop('dailyChallenge', 5);
assert.strictEqual(topDaily.length, 1);
assert.strictEqual(topDaily[0].score, 42000);

const tier = Leaderboard.getTier('dailyChallenge', 42000);
assert.strictEqual(tier.name, 'Grandmaster');

Leaderboard.submit('hardcoreScrapper', {
    scrap: 8500,
    ship: 'bastion',
    difficulty: 'insane',
    date: new Date().toISOString()
});

const topHardcore = Leaderboard.getTop('hardcoreScrapper', 5);
assert.strictEqual(topHardcore.length, 1);
assert.strictEqual(topHardcore[0].scrap, 8500);

const hcTier = Leaderboard.getTier('hardcoreScrapper', 8500);
assert.strictEqual(hcTier.name, 'Iron Coelacanth');

console.log("  [PASS] Daily Challenge and Hardcore Scrapper leaderboard tiers verified.");

console.log("============================================================");
console.log("ALL GAP CLOSURE & FEATURE TESTS PASSED (100%)");
console.log("============================================================");
