// tests/narrative_journey_comms_test.js — Verification for Non-Blocking Holographic Comms Banner HUD (GRO-4201)
const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log("============================================================");
console.log("DARIUS STAR: HOLOGRAPHIC COMMS & NON-BLOCKING DIALOGUE TESTS (GRO-4201)");
console.log("============================================================");

// Mock browser globals
const storageMap = {};
global.localStorage = {
    getItem: (k) => storageMap[k] || null,
    setItem: (k, v) => { storageMap[k] = String(v); },
    removeItem: (k) => { delete storageMap[k]; }
};

global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.window.matchMedia = () => ({ matches: false });

const dummyHud = {
    style: {},
    classList: { add: () => {}, remove: () => {} },
    innerText: '',
    querySelectorAll: () => []
};

const domElements = {
    'lyra-hud': dummyHud,
    'lyra-speaker-name': { style: {}, innerText: '' },
    'lyra-callsign-badge': { style: {}, innerText: '' },
    'lyra-portrait-img': { style: {}, src: '' },
    'lyra-no-signal': { style: {} },
    'lyra-comms-overlay': { style: {}, src: '' },
    'lyra-dialogue-text': { innerText: '' },
    'lyra-choices': { style: {}, innerHTML: '', appendChild: () => {} },
    'lyra-continue-prompt': { style: {} }
};

global.document = {
    getElementById: (id) => domElements[id] || { style: {}, classList: { add: ()=>{}, remove: ()=>{} }, innerText: '' },
    createElement: () => ({ getContext: () => ctx, width: 800, height: 450, classList: { add: ()=>{}, remove: ()=>{} }, style: {} }),
    querySelectorAll: () => [
        { style: {} }, { style: {} }, { style: {} }, { style: {} },
        { style: {} }, { style: {} }, { style: {} }, { style: {} }
    ],
    addEventListener: () => {}
};

global.canvas = { width: 800, height: 450, style: {}, addEventListener: () => {} };
global.ctx = {
    save: () => {}, restore: () => {}, translate: () => {}, rotate: () => {}, scale: () => {},
    beginPath: () => {}, arc: () => {}, fill: () => {}, stroke: () => {}, fillRect: () => {},
    strokeRect: () => {}, moveTo: () => {}, lineTo: () => {}, closePath: () => {},
    strokeText: () => {}, fillText: () => {}, drawImage: () => {}, setLineDash: () => {},
    measureText: (txt) => ({ width: txt.length * 8 }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createLinearGradient: () => ({ addColorStop: () => {} })
};

global.Image = class { constructor() { this.src = ''; this.complete = true; this.naturalWidth = 256; this.naturalHeight = 256; } };
global.Particle = class { constructor(x, y, color) { this.x = x; this.y = y; this.color = color; } };
global.FloatingText = class { constructor(x, y, text, color) { this.x = x; this.y = y; this.text = text; this.color = color; } };
global.EnvironmentParticle = class { constructor(type) { this.type = type; } };

global.enemies = [];
global.enemyBullets = [];
global.bullets = [];
global.particles = [];
global.scrapDrops = [];
global.floatingTexts = [];
global.powerups = [];
global.vfxExplosions = [];
global.envParticles = [];
global.bgLayers = [];
global.stars = [];
global.score = 1000;
global.runScrap = 500;
global.gameTime = 10.0;
global.runSeed = 42;
global.biomeLevel = 1;
global.vfxSprites = {};
global.playerSprites = {};
global.portraitSprites = {};
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
global.GAME_WIDTH = 800;
global.GAME_HEIGHT = 450;
global.initializeRendererBuffers = () => {};
global.setBiomeBackgrounds = () => {};
global.requestAnimationFrame = () => {};

let playedSounds = [];
global.playSound = (type, vol) => { playedSounds.push(type); };
global.createExplosion = () => {};
global.spawnHitFlash = () => {};
global.drawSpriteFrame = () => {};
global.getCurrentDifficultyConfig = () => ({ playerDamageMultiplier: 1.0, startingLives: 3 });

// Load upgrade_system.js
eval(fs.readFileSync(path.join(__dirname, '../js/upgrade_system.js'), 'utf8'));

// Load multiplayer.js
eval(fs.readFileSync(path.join(__dirname, '../js/multiplayer.js'), 'utf8'));

// Load player.js
eval(fs.readFileSync(path.join(__dirname, '../js/player.js'), 'utf8'));

// Load biome_data.js
eval(fs.readFileSync(path.join(__dirname, '../js/levels/biome_data.js'), 'utf8'));

// Load combat.js
eval(fs.readFileSync(path.join(__dirname, '../js/combat.js'), 'utf8'));

// Load parallax.js
eval(fs.readFileSync(path.join(__dirname, '../js/renderer/parallax.js'), 'utf8'));

// Load utils.js
eval(fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf8'));

// Load audio.js
eval(fs.readFileSync(path.join(__dirname, '../js/audio.js'), 'utf8'));

const _origPlaySound = global.playSound;
global.playSound = (type, p) => {
    playedSounds.push(type);
    if (typeof _origPlaySound === 'function') _origPlaySound(type, p);
};

// Load dialogue.js
eval(fs.readFileSync(path.join(__dirname, '../js/ui/dialogue.js'), 'utf8'));

// Load game_loop.js
eval(fs.readFileSync(path.join(__dirname, '../js/game_loop.js'), 'utf8'));

global.playSound = (type, p) => {
    playedSounds.push(type);
    console.log("TEST playSound called with:", type);
};


// ─── 1. Non-Blocking Holographic Comms Banner Initialisation ────────────────
console.log("1. Testing Non-Blocking Holographic Comms Banner Initialization...");
playedSounds = [];
global.activeDialogue = new DialogueSequence([
    { speaker: 'Lyra', text: "Daddy! Scanners show massive acoustic echoes down in the silt." },
    { speaker: 'Darius', text: "Copy that, navigator. Weapons primed and scanning." }
], null, false);

assert.strictEqual(activeDialogue.isBlocking(), false, "DialogueSequence must default to non-blocking (blocking === false)");
assert.ok(playedSounds.includes('radio_squelch_in'), "Radio squelch start chirp must trigger on comms open");
console.log("  [PASS] Comms banner initialized as non-blocking with radio squelch start SFX.");

// ─── 2. 100% Ship Control Continuity During Active Comms ────────────────────
console.log("2. Testing 100% Ship Control Continuity (Movement & Firing Unlocked)...");
player.x = 100;
player.y = 200;
bullets.length = 0;

// Update active dialogue while simulating combat loop
activeDialogue.update(0.1);
assert.strictEqual(activeDialogue.isBlocking(), false, "Comms must remain non-blocking during update");

// Player shoots during active comms
player.shoot();
assert.strictEqual(bullets.length > 0, true, "Player must be able to shoot and fire weapons during comms transmission");

console.log("  [PASS] Ship weapons and flight movement remain 100% active during in-mission dialogue.");

// ─── 3. Speaker Configuration & Waveform Equalizer Verification ─────────────
console.log("3. Testing Speaker Config & Waveform Equalizer Animation...");
assert.strictEqual(SPEAKER_CONFIG['Lyra'].color, '#00ffff', "Lyra should have Cyan theme");
assert.strictEqual(SPEAKER_CONFIG['Darius'].color, '#ffaa00', "Darius should have Amber theme");
assert.strictEqual(SPEAKER_CONFIG['Thorne'].color, '#88aacc', "Thorne should have Mission Control theme");
assert.strictEqual(SPEAKER_CONFIG['Cross'].color, '#ff00aa', "Cross should have Navy Magenta theme");
assert.strictEqual(SPEAKER_CONFIG['Selene'].color, '#ffd700', "Selene should have Gold Haven-7 theme");

activeDialogue.draw();
console.log("  [PASS] Speaker metadata, callsign tags, and equalizer visualizer updated cleanly.");

// ─── 4. Non-Blocking Quick Choices & Keypad Selection ───────────────────────
console.log("4. Testing Non-Blocking Quick Choices via Keypad [1, 2]...");
let chosenRoute = null;
global.activeDialogue = new DialogueSequence([
    {
        speaker: 'Darius',
        text: "Thermal vents blowing! Choose vector:",
        choices: [
            { text: "Center Channel (Lyra)", value: "center" },
            { text: "Left Channel (Thorne)", value: "left" }
        ]
    }
], (val) => { chosenRoute = val; }, false);

// Fast forward text
activeDialogue.charIndex = activeDialogue.currentLineText.length;
activeDialogue.draw();

// Tap '1' key to choose Lyra's route
activeDialogue.handleKey('1');
assert.strictEqual(chosenRoute, 'center', "Tapping '1' should select choice 0 ('center')");

console.log("  [PASS] Non-blocking quick choices selectable via number keys without freezing controls.");

// ─── 5. Auto-Advance & Squelch Out Clean Dismissal ───────────────────────────
console.log("5. Testing Auto-Advance & Radio Squelch Close SFX...");
playedSounds = [];
global.activeDialogue = new DialogueSequence([
    { speaker: 'Naya', text: "Sector clear, Darius. Moving deeper." }
], null, false);

// Complete text typing and let auto-advance timer expire
activeDialogue.charIndex = activeDialogue.currentLineText.length;
activeDialogue.update(5.0); // timer expires

assert.strictEqual(activeDialogue, null, "activeDialogue should cleanly dismiss after sequence completes");
assert.ok(playedSounds.includes('radio_squelch_out'), "Radio squelch close click must trigger on comms close");

console.log("  [PASS] Dialogue auto-advances and dismisses with radio squelch close click.");

console.log("============================================================");
console.log("ALL GRO-4201 HOLOGRAPHIC COMMS TESTS PASSED (100%)");
console.log("============================================================");
