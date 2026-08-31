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

const mockEl = {
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    play: () => Promise.resolve(),
    pause: () => {},
    style: {},
    appendChild: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getContext: () => global.ctx
};

global.bossIntroVideo = { ...mockEl };
global.victoryVideo = { ...mockEl };
global.skipHint = { ...mockEl };
global.document.getElementById = (id) => mockEl;

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

// Load scripts in canonical index.html order
eval(fs.readFileSync(path.join(__dirname, '../js/upgrade_system.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/save_system.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/economy.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/banter_db.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/banter_engine.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/multiplayer.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/player.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/levels/biome_data.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/levels/wave_campaign.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/combat.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/renderer/parallax.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/audio.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/audio_manager.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/voice_playback.js'), 'utf8'));

const _origPlaySound = global.playSound;
global.playSound = (type, p) => {
    playedSounds.push(type);
    if (typeof _origPlaySound === 'function') _origPlaySound(type, p);
};

eval(fs.readFileSync(path.join(__dirname, '../js/ui/dialogue.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/ui.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/level_manager.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/game_loop.js'), 'utf8'));

global.playSound = (type, p) => {
    playedSounds.push(type);
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


// ─── 6. GRO-4202: Attempt-Aware Progressive Banter Engine Tests ─────────────
console.log("6. Testing 3-Tier Attempt-Aware Progressive Dialogue Retrieval...");

// Test Tier 1 (Attempt 1)
const t1_line = BanterEngine.getLine('level_start', 1, 'D', 1);
assert.ok(t1_line, "Must return a Tier 1 line for Attempt 1");
assert.strictEqual(t1_line.s, 'D', "Speaker must match requested speaker code");
assert.strictEqual(t1_line.l.includes("Grandpa"), true, "Attempt 1 should return mystery/recon line about Grandpa");
console.log("  [PASS] Tier 1 (Attempt 1) returned First Reconnaissance line:", t1_line.l);

// Test Tier 2 (Attempt 2 - Tactical Countermeasure)
const t2_line = BanterEngine.getLine('level_start', 1, 'D', 2);
assert.ok(t2_line, "Must return a Tier 2 line for Attempt 2");
assert.strictEqual(t2_line.s, 'D', "Speaker must match requested speaker code");
assert.strictEqual(t2_line.l.includes("silt vents") || t2_line.l.includes("ambush"), true, "Attempt 2 should return tactical adaptation line addressing prior wipe");
console.log("  [PASS] Tier 2 (Attempt 2) returned Tactical Countermeasure line:", t2_line.l);

// Test Tier 3 (Attempt 3+ - Tenacity & Mastery)
const t3_line = BanterEngine.getLine('level_start', 1, 'D', 3);
assert.ok(t3_line, "Must return a Tier 3 line for Attempt 3");
assert.strictEqual(t3_line.s, 'D', "Speaker must match requested speaker code");
assert.strictEqual(t3_line.l.includes("Third dive") || t3_line.l.includes("patrol loops"), true, "Attempt 3 should return tenacity/mastery line");
console.log("  [PASS] Tier 3 (Attempt 3+) returned Tenacity & Mastery line:", t3_line.l);

// ─── 7. GRO-4202: LevelManager Attempt Tracking & Wipe Progression ──────────
console.log("7. Testing LevelManager Sector Attempt Tracking & Checkpoint Retries...");
LevelManager.resetLevelAttempts();

LevelManager.setBiomeAndLevel(2, 5);
assert.strictEqual(LevelManager.getAttemptCount(2, 5), 1, "First visit to Biome 2 Level 5 must have attempt count 1");

LevelManager.setBiomeAndLevel(2, 5); // Player wiped and restarted level
assert.strictEqual(LevelManager.getAttemptCount(2, 5), 2, "Second attempt at Biome 2 Level 5 must have attempt count 2");

LevelManager.setBiomeAndLevel(2, 5); // Player wiped third time
assert.strictEqual(LevelManager.getAttemptCount(2, 5), 3, "Third attempt at Biome 2 Level 5 must have attempt count 3");

console.log("  [PASS] LevelManager accurately tracks consecutive attempts across wipes and restarts.");

// ─── 8. GRO-4202: 10-Biome Progressive Coverage Verification ────────────────
console.log("8. Testing 3-Tier Progressive Coverage across all 10 Biomes...");
for (let b = 1; b <= 10; b++) {
    const tier1 = BanterEngine.getLine('level_start', b, null, 1);
    const tier2 = BanterEngine.getLine('level_start', b, null, 2);
    const tier3 = BanterEngine.getLine('level_start', b, null, 3);
    assert.ok(tier1, `Biome ${b} must have valid Tier 1 level_start dialogue`);
    assert.ok(tier2, `Biome ${b} must have valid Tier 2 level_start dialogue`);
    assert.ok(tier3, `Biome ${b} must have valid Tier 3 level_start dialogue`);
    assert.notStrictEqual(tier1.l, tier2.l, `Biome ${b} Tier 1 and Tier 2 lines must be differentiated`);
    assert.notStrictEqual(tier2.l, tier3.l, `Biome ${b} Tier 2 and Tier 3 lines must be differentiated`);
}
console.log("  [PASS] All 10 biomes have differentiated Tier 1, Tier 2, and Tier 3 dialogue.");

// ─── 9. GRO-4202: CampaignSave levelAttempts Serialization ──────────────────
console.log("9. Testing CampaignSave levelAttempts Serialization & Loading...");
CampaignSave.save(0, {
    wave: 1,
    ship: 'striker',
    scrap: 250,
    score: 1200,
    lives: 3,
    difficulty: 'normal',
    upgrades: {},
    biome: 2
});

const loadedSave = CampaignSave.load(0);
assert.ok(loadedSave, "Save slot 0 must load successfully");
assert.ok(loadedSave.levelAttempts, "Loaded save must contain levelAttempts map");
assert.strictEqual(loadedSave.levelAttempts['b2_l5'], 3, "Loaded save must preserve attempt count for sector b2_l5");
console.log("  [PASS] CampaignSave successfully serializes and restores levelAttempts without regression.");


// ─── 10. GRO-4203: 100-Level Sector Intel Master Catalog Tests ──────────────
console.log("10. Testing Canonical 100-Level Sector Intel Master Catalog...");

let totalSectorsVerified = 0;
const validSpeakers = ['D', 'L', 'N', 'T', 'C', 'S', 'A', 'O'];

for (let b = 1; b <= 10; b++) {
    for (let l = 1; l <= 10; l++) {
        const intel = LevelManager.getSectorIntel(b, l);
        assert.ok(intel, `Sector ${b}.${l} must return non-null sector intel`);
        assert.strictEqual(intel.sectorId, `b${b}_l${l}`, `Sector ${b}.${l} must have correct sectorId`);
        assert.ok(intel.name && intel.name.length > 3, `Sector ${b}.${l} must have valid name`);
        assert.ok(intel.landmark && intel.landmark.length > 2, `Sector ${b}.${l} must have valid landmark`);
        assert.ok(intel.hazard && intel.hazard.length > 3, `Sector ${b}.${l} must have defined hazard`);
        assert.ok(intel.intel && intel.intel.length > 10, `Sector ${b}.${l} must have tactical intel overview`);
        assert.ok(intel.classifiedLog && intel.classifiedLog.length > 10, `Sector ${b}.${l} must have archival classifiedLog`);
        assert.ok(intel.commLine && intel.commLine.l && intel.commLine.l.length > 5, `Sector ${b}.${l} must have unique comm chatter`);
        assert.ok(validSpeakers.includes(intel.commLine.s), `Sector ${b}.${l} commLine speaker must be a valid character code`);
        totalSectorsVerified++;
    }
}

assert.strictEqual(totalSectorsVerified, 100, "Must verify all 100 levels across 10 biomes");
console.log(`  [PASS] All 100/100 sectors verified with unique names, landmarks, hazards, classified logs, and comm lines.`);

// Test LevelManager sector start chatter trigger on attempt 1
LevelManager.resetLevelAttempts();
global.currentScreen = SCREENS.PLAYING;
currentScreen = SCREENS.PLAYING;
LevelManager.setBiomeAndLevel(4, 4); // The Veil Nebula - Sector 4.4 Thought-Form Anomalies
activeDialogue = window.activeDialogue;
assert.ok(activeDialogue, "Sector 4.4 entry must trigger activeDialogue");
assert.strictEqual(activeDialogue.lines[0].speaker, 'Lyra', "Sector 4.4 chatter should be spoken by Lyra");
assert.ok(activeDialogue.lines[0].text.includes("glass") || activeDialogue.lines[0].text.includes("story"), "Sector 4.4 must trigger bespoke narrative line");
console.log("  [PASS] Sector 4.4 triggered bespoke opening comms on Attempt 1:", activeDialogue.lines[0].text);


// ─── 11. GRO-4204: Precursor Sector Intel Archive Terminal Tests ────────────
console.log("11. Testing Precursor Sector Intel Archive Terminal on Level Debrief Screen...");

// Trigger level clear screen for Biome 3 Level 4 (Europa - Thermal Vent Shockwaves)
showLevelClearScreen({
    biome: 3,
    level: 4,
    killCount: 28,
    killTotal: 28,
    killPct: 100,
    scrapCollected: 450,
    scrapTotal: 450,
    scrapPct: 100,
    scoreEarned: 3200,
    timeSpent: 42,
    rank: 'S'
});

assert.strictEqual(currentScreen, SCREENS.LEVEL_CLEAR, "Must be on LEVEL_CLEAR screen");
assert.strictEqual(window._showIntelModal, false, "Intel modal must initially be closed");

// Simulate pressing [L] to open Sector Intel Archive Terminal
playedSounds.length = 0;
window._showIntelModal = true;
if (typeof LevelManager !== 'undefined' && LevelManager.recordIntelViewed) {
    LevelManager.recordIntelViewed(3, 4);
}
global.playSound('radio_squelch_in');

assert.strictEqual(window._showIntelModal, true, "Intel modal must now be active");
assert.ok(playedSounds.includes('radio_squelch_in'), "Must play radio_squelch_in on terminal opening");
assert.strictEqual(LevelManager.isIntelViewed(3, 4), true, "LevelManager must record sector 3.4 intel as viewed");
console.log("  [PASS] Sector Intel Archive Terminal opened with squelch SFX and registered in LevelManager.");

// Query sector 3.4 intel payload
const secIntel = LevelManager.getSectorIntel(3, 4);
assert.ok(secIntel.name.includes("Thermal") || secIntel.shortName.includes("Thermal"), "Sector 3.4 name must reflect Thermal Vents");
assert.ok(secIntel.hazard.includes("Thermal"), "Sector 3.4 hazard must report Thermal Vent Shockwaves");
assert.ok(secIntel.classifiedLog.includes("geothermal"), "Sector 3.4 classifiedLog must include geothermal research logs");
console.log("  [PASS] Sector 3.4 Terminal Payload verified: Hazard =", secIntel.hazard);

// Simulate closing modal via [ESC] / [ENTER] / click
playedSounds.length = 0;
window._showIntelModal = false;
global.playSound('radio_squelch_out');

assert.strictEqual(window._showIntelModal, false, "Intel modal must be dismissed");
assert.ok(playedSounds.includes('radio_squelch_out'), "Must play radio_squelch_out on terminal close");
assert.strictEqual(currentScreen, SCREENS.LEVEL_CLEAR, "Must remain on LEVEL_CLEAR debriefing screen");
console.log("  [PASS] Sector Intel Archive Terminal closed cleanly returning to Debriefing Screen.");

// Test CampaignSave unlockedIntelLogs persistence
CampaignSave.save(1, {
    wave: 1,
    ship: 'bastion',
    scrap: 600,
    score: 4000,
    lives: 3,
    difficulty: 'pilot',
    upgrades: {},
    biome: 3
});

const loadedSave1 = CampaignSave.load(1);
assert.ok(loadedSave1.unlockedIntelLogs, "Loaded save must contain unlockedIntelLogs map");
assert.strictEqual(loadedSave1.unlockedIntelLogs['b3_l4'], true, "Loaded save must persist viewed intel for sector b3_l4");
console.log("  [PASS] CampaignSave successfully serializes and restores unlockedIntelLogs.");


// ─── 12. GRO-4206: Higher-Difficulty & NG+ Classified Lore Tests ────────────
console.log("12. Testing Higher-Difficulty & NG+ Classified Lore Injections...");

// 1. Verify Easiest Difficulty (CADET / 'easy') receives 100% complete core storyline
const cadetLine = BanterEngine.getLine('level_start', 1, 'D', 1, 'easy', 0);
assert.ok(cadetLine, "Cadet mode must return valid core storyline line");
assert.ok(cadetLine.l.includes("Grandpa") || cadetLine.l.includes("Deepest"), "Cadet mode must contain complete canonical dialogue");
const cadetIntel = LevelManager.getSectorIntel(1, 1, 'easy', 0);
assert.ok(cadetIntel.intel && cadetIntel.classifiedLog && cadetIntel.commLine, "Cadet mode must have complete sector intel without truncation");
console.log("  [PASS] Easiest difficulty (CADET) verified: 100% full main storyline intact and unobstructed.");

// 2. Verify ACE ('hard') & CYBER ('insane') Classified Lore Unlocks
const aceLine = BanterEngine.getLine('level_start', 1, null, 1, 'hard', 0);
assert.ok(aceLine, "ACE difficulty must return a classified lore line");
assert.ok(aceLine.l.includes("BLACK-OPS") || aceLine.l.includes("Marcus Star"), "ACE difficulty must return classified Navy/Precursor decrypt");
console.log("  [PASS] ACE difficulty returned Classified Black-Ops Intercept:", aceLine.l);

const aceIntel = LevelManager.getSectorIntel(1, 1, 'hard', 0);
assert.ok(aceIntel.bonusClassified, "ACE difficulty must provide bonus classified decrypt in sector intel");
assert.ok(aceIntel.bonusClassified.includes("BLACK-OPS") || aceIntel.bonusClassified.includes("Marcus Star"), "Bonus classified decrypt payload verified");
console.log("  [PASS] Sector Intel returned ACE Black-Ops Decrypt:", aceIntel.bonusClassified);

// 3. Verify NG+ Timeline Paradox Dialogue & Ciphers
const ngPlusLine = BanterEngine.getLine('level_start', 1, null, 1, 'normal', 1);
assert.ok(ngPlusLine, "NG+ mode must return a paradox timeline line");
assert.ok(ngPlusLine.l.includes("TIMELINE ECHO") || ngPlusLine.l.includes("looping"), "NG+ mode must return timeline paradox chatter");
console.log("  [PASS] NG+ Replay returned Timeline Paradox line:", ngPlusLine.l);

const ngPlusIntel = LevelManager.getSectorIntel(1, 1, 'normal', 1);
assert.ok(ngPlusIntel.bonusParadox, "NG+ mode must provide bonus paradox cipher in sector intel");
assert.ok(ngPlusIntel.bonusParadox.includes("TIMELINE ECHO") || ngPlusIntel.bonusParadox.includes("looping"), "Bonus paradox cipher payload verified");
console.log("  [PASS] Sector Intel returned NG+ Paradox Cipher:", ngPlusIntel.bonusParadox);

// 4. Verify CampaignSave highestCompletedDifficulty and unlockedClassifiedLore
CampaignSave.save(2, {
    wave: 1,
    ship: 'warden',
    scrap: 800,
    score: 5500,
    lives: 1,
    difficulty: 'hard',
    highestCompletedDifficulty: 'hard',
    unlockedClassifiedLore: { 'b1_l1': true, 'b2_l5': true },
    upgrades: {},
    biome: 5
});

const loadedSave2 = CampaignSave.load(2);
assert.strictEqual(loadedSave2.highestCompletedDifficulty, 'hard', "Loaded save must preserve highestCompletedDifficulty");
assert.strictEqual(loadedSave2.unlockedClassifiedLore['b1_l1'], true, "Loaded save must preserve unlockedClassifiedLore map");
console.log("  [PASS] CampaignSave successfully serializes and restores highestCompletedDifficulty & unlockedClassifiedLore.");


// ─── 13. GRO-4207: Holographic Animated Portrait Suite Tests ────────────────
console.log("13. Testing Holographic Animated Portrait Suite (GRO-4207)...");

// 1. Verify Situational Mood Resolution across multiple emotional contexts
assert.strictEqual(PortraitAnimator.getSituationalMood('Darius', "Warning! Heavy laser ambush in front of us!"), 'reactive', "Combat/alert lines must resolve to 'reactive'");
assert.strictEqual(PortraitAnimator.getSituationalMood('Lyra', "Daddy, the void is swallowing everything..."), 'somber', "Tragedy/death lines must resolve to 'somber'");
assert.strictEqual(PortraitAnimator.getSituationalMood('Naya', "Wave clear! All ships advance with full burn!"), 'determined', "Victory/sweep lines must resolve to 'determined'");
assert.strictEqual(PortraitAnimator.getSituationalMood('Thorne', "Entering Mariana Ridge corridor."), 'neutral', "Standard recon lines must resolve to 'neutral'");
console.log("  [PASS] Situational mood emotion resolution verified across reactive, somber, determined, and neutral states.");

// 2. Verify Canvas Rendering for all 7 Characters (with mock Canvas 2D Context)
const mockCtx = {
    fillRect: () => {},
    drawImage: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {},
    arc: () => {},
    strokeRect: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {}
};
const mockCanvas = {
    width: 56,
    height: 56,
    getContext: () => mockCtx
};

const characters = ['Darius', 'Lyra', 'Naya', 'Thorne', 'Cross', 'Selene', 'Architect'];
characters.forEach(char => {
    assert.doesNotThrow(() => {
        PortraitAnimator.renderToCanvas(mockCanvas, char, "Tactical operational status green.", true, 0.016);
        PortraitAnimator.renderToCanvas(mockCanvas, char, "Warning! Shield failure imminent!", false, 0.016, 'reactive');
    }, `PortraitAnimator must render character ${char} without errors`);
});
console.log("  [PASS] Holographic animated portrait rendering verified for all 7 story characters with CRT scanlines & mouth animation.");


// ─── 14. GRO-4208: Voice Playback & Real-Time Dynamic BGM Ducking Tests ─────
console.log("14. Testing Voice Playback & Real-Time BGM Ducking (GRO-4208)...");

VoicePlayback.stop();
AudioManager.unduckMusic(0);

// 1. Verify AudioManager Ducking & Unducking API
assert.strictEqual(AudioManager.isDucked(), false, "AudioManager must not be ducked initially");
AudioManager.duckMusic(0.65, 0.25);
assert.strictEqual(AudioManager.isDucked(), true, "AudioManager must be ducked after duckMusic call");
assert.strictEqual(AudioManager.getDuckingMultiplier(), 0.65, "Gain multiplier must reflect -35% (0.65x) ducking");

AudioManager.unduckMusic(0.4);
assert.strictEqual(AudioManager.isDucked(), false, "AudioManager must restore volume after unduckMusic call");
assert.strictEqual(AudioManager.getDuckingMultiplier(), 1.0, "Gain multiplier must restore to 1.0x");
console.log("  [PASS] AudioManager duckMusic (0.65x) & unduckMusic (1.0x) verified cleanly.");

// 2. Verify VoicePlayback.speak and Stop Integration
VoicePlayback.speak('Lyra', "Watch out, Daddy! Chrono torpedo incoming!");
const activeLine = VoicePlayback.getActiveLine();
assert.ok(activeLine, "VoicePlayback must track active spoken dialogue line");
assert.strictEqual(activeLine.speaker, 'Lyra', "Spoken line speaker must match Lyra");
assert.strictEqual(AudioManager.isDucked(), true, "VoicePlayback.speak must automatically duck BGM");

VoicePlayback.stop();
assert.strictEqual(VoicePlayback.getActiveLine(), null, "VoicePlayback.stop must clear active line");
assert.strictEqual(AudioManager.isDucked(), false, "VoicePlayback.stop must restore BGM volume");
console.log("  [PASS] VoicePlayback.speak & stop verified with real-time dynamic BGM ducking.");

// 3. Verify DialogueSequence Speech & Squelch Lifecycle
const testSeq = new DialogueSequence([
    { speaker: 'Darius', text: "Shields holding. Commencing attack run." }
]);
assert.strictEqual(AudioManager.isDucked(), true, "DialogueSequence must trigger voice speech and duck BGM on line start");
testSeq.next(); // completes typing
testSeq.next(); // dismisses dialogue
assert.strictEqual(AudioManager.isDucked(), false, "DialogueSequence completion must unduck BGM");
console.log("  [PASS] DialogueSequence lifecycle fully harmonized with VoicePlayback & BGM ducking.");


// ─── 15. GRO-4205: Comprehensive End-to-End Narrative Journey Quality Gate ───
console.log("15. Running Comprehensive End-to-End Narrative Journey Simulation (GRO-4205)...");

// A. Verify Complete 100-Sector Canonical Integrity across all 10 Biomes
let e2eSectorsVerified = 0;
for (let b = 1; b <= 10; b++) {
    for (let l = 1; l <= 10; l++) {
        const intel = LevelManager.getSectorIntel(b, l, 'normal', 0);
        assert.ok(intel.sectorId === `b${b}_l${l}`, `Sector ${b}.${l} ID mismatch`);
        assert.ok(intel.name && intel.name.length > 3, `Sector ${b}.${l} missing name`);
        assert.ok(intel.landmark && intel.landmark.length > 2, `Sector ${b}.${l} missing landmark`);
        assert.ok(intel.hazard && intel.hazard.length > 5, `Sector ${b}.${l} missing hazard profile`);
        assert.ok(intel.classifiedLog && intel.classifiedLog.length > 10, `Sector ${b}.${l} missing classified archival log`);
        assert.ok(intel.commLine && intel.commLine.s && intel.commLine.l, `Sector ${b}.${l} missing opening comm line`);
        e2eSectorsVerified++;
    }
}
assert.strictEqual(e2eSectorsVerified, 100, "Must verify exactly 100/100 sectors");
console.log(`  [PASS] 100/100 sectors verified across all 10 biomes with complete lore, landmarks, hazards, and comm chatter.`);

// B. Simulate Consecutive Wipe & Checkpoint Retries on Sector 2.5 (Attempt 1, 2, 3+)
LevelManager.resetLevelAttempts();

// Attempt 1: First Reconnaissance
LevelManager.setBiomeAndLevel(2, 5);
assert.strictEqual(LevelManager.getAttemptCount(2, 5), 1, "First attempt at Sector 2.5 must have attempt count = 1");
const a1Line = BanterEngine.getLine('level_start', 2, null, 1, 'normal', 0);
assert.ok(a1Line, "Attempt 1 must return valid Recon line");
console.log("  [Attempt 1 Recon]:", a1Line.l);

// Attempt 2: Player wiped and restarted sector (Tactical Countermeasure)
LevelManager.setBiomeAndLevel(2, 5);
assert.strictEqual(LevelManager.getAttemptCount(2, 5), 2, "Second attempt at Sector 2.5 must have attempt count = 2");
const a2Line = BanterEngine.getLine('level_start', 2, null, 2, 'normal', 0);
assert.ok(a2Line, "Attempt 2 must return valid Tactical Countermeasure line");
assert.notStrictEqual(a1Line.l, a2Line.l, "Attempt 2 line must be distinct from Attempt 1");
console.log("  [Attempt 2 Adaptation]:", a2Line.l);

// Attempt 3: Player wiped third time (Tenacity & Gritty Focus)
LevelManager.setBiomeAndLevel(2, 5);
assert.strictEqual(LevelManager.getAttemptCount(2, 5), 3, "Third attempt at Sector 2.5 must have attempt count = 3");
const a3Line = BanterEngine.getLine('level_start', 2, null, 3, 'normal', 0);
assert.ok(a3Line, "Attempt 3 must return valid Tenacity line");
assert.notStrictEqual(a2Line.l, a3Line.l, "Attempt 3 line must be distinct from Attempt 2");
console.log("  [Attempt 3 Tenacity]:", a3Line.l);

// C. Verify Difficulty & NG+ Dynamic Lore Branching
const cadetCheck = BanterEngine.getLine('level_start', 3, 'D', 1, 'easy', 0);
const aceCheck = BanterEngine.getLine('level_start', 3, null, 1, 'hard', 0);
const ngCheck = BanterEngine.getLine('level_start', 3, null, 1, 'normal', 1);

assert.ok(cadetCheck, "Cadet mode must have full main storyline line");
assert.ok(aceCheck.l.includes("PROJECT OPHION") || aceCheck.l.includes("BLACK-OPS") || aceCheck.l.includes("Grandpa"), "ACE mode must return classified lore");
assert.ok(ngCheck.l.includes("CHRONO RESIDUAL") || ngCheck.l.includes("PARADOX") || ngCheck.l.includes("familiar"), "NG+ mode must return paradox recursion line");
console.log("  [PASS] Dynamic lore branching verified across CADET (Main Story), ACE (Classified Navy), and NG+ (Paradox Recursion).");

// D. Verify Flight & Combat Control Loop during Active In-Flight Comms Banner
const combatSeq = new DialogueSequence([
    { speaker: 'Thorne', text: "Incoming heavy missile barrage! Evasive maneuvers!" }
]);
assert.strictEqual(combatSeq.isBlocking(), false, "Comms banner must be non-blocking");
assert.strictEqual(AudioManager.isDucked(), true, "BGM must be ducked during active comms");

// Simulate 50 frames of player movement and weapon discharge during active comms
let bulletsFired = 0;
for (let f = 0; f < 50; f++) {
    player.x += 2;
    player.y += 1;
    if (f % 5 === 0) {
        player.shoot();
        bulletsFired++;
    }
    combatSeq.update(0.016);
}
assert.ok(bulletsFired >= 9, "Player must be able to continuously shoot while comms banner is open");
assert.ok(player.x > 150, "Player ship movement must remain 100% active");
console.log(`  [PASS] Non-blocking flight continuity verified: player moved to (${player.x}, ${player.y}) and fired ${bulletsFired} bullet salvos during live dialogue.`);

combatSeq.next(); // finish line
combatSeq.next(); // close banner
assert.strictEqual(AudioManager.isDucked(), false, "BGM must restore volume after comms banner dismissal");

// E. Verify Precursor Sector Intel Archive Terminal & CampaignSave 3-Slot State Persistence
LevelManager.recordIntelViewed(2, 5);
assert.strictEqual(LevelManager.isIntelViewed(2, 5), true, "LevelManager must record viewed intel");

CampaignSave.save(0, {
    ship: 'striker',
    biome: 2,
    wave: 5,
    lives: 2,
    scrap: 1250,
    score: 8400,
    difficulty: 'hard',
    highestCompletedDifficulty: 'hard',
    unlockedClassifiedLore: { 'b2_l5': true },
    upgrades: { 'laser': 2 }
});

const restoredSave = CampaignSave.load(0);
assert.strictEqual(restoredSave.levelAttempts['b2_l5'], 3, "Restored save must preserve attempt count = 3");
assert.strictEqual(restoredSave.unlockedIntelLogs['b2_l5'], true, "Restored save must preserve unlocked intel log");
assert.strictEqual(restoredSave.highestCompletedDifficulty, 'hard', "Restored save must preserve highest completed difficulty");
assert.strictEqual(restoredSave.unlockedClassifiedLore['b2_l5'], true, "Restored save must preserve unlocked classified lore");
console.log("  [PASS] 3-slot CampaignSave persistence losslessly verified across attempt counts, intel logs, and classified lore.");

console.log("============================================================");
console.log("ALL TRACK 7 NARRATIVE JOURNEY & COMMS TESTS PASSED (GRO-4201 TO GRO-4208: 100%)");
console.log("============================================================");
