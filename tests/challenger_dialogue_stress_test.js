const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock browser global environments
global.window = global;
global.localStorage = {
    _data: {},
    setItem(key, val) { this._data[key] = String(val); },
    getItem(key) { return this._data[key] || null; },
    removeItem(key) { delete this._data[key]; },
    clear() { this._data = {}; }
};

// Mock other game variables required by dialogue.js and level_manager.js
global.runScrap = 0;
global.score = 0;
global.activeBiomeName = '1: Abyssal Trench';
global.biomeLevel = 1;
global.player = {
    weaponLevel: 1,
    shield: 100,
    shieldMax: 100,
    shipType: 'interceptor',
    takeDamage() {}
};
global.difficulty = 'normal';
global.lives = 3;
global.banterEnabled = true;
global.audioTunnelsEnabled = true;
global.streamerMode = false;
global.subtitlesEnabled = true;
global.narrativeFlags = {
    lyra_trust: 0,
    coelacanth_mercy: 0,
    power_lust: 0,
    dreamer_connection: 0,
    sacrifice_seen: 0,
    cross_defected: 0
};
global.envParticles = [];
global.envSpawnAccum = 0;
global.floatingTexts = [];
global.canvas = { width: 800, height: 600 };
global.uiBiome = { innerText: '' };

// Mock Sprites
global.portraitSprites = {
    'lyra_neutral': { complete: true, naturalWidth: 64, src: 'lyra_neutral.png' },
    'thorne_neutral': { complete: true, naturalWidth: 64, src: 'thorne_neutral.png' },
    'darius_neutral': { complete: true, naturalWidth: 64, src: 'darius_neutral.png' }
};
global.vfxSprites = {};
global.playerSprites = {};

// Mock Functions
global.playSound = function(sound) {
    global.soundsPlayed = global.soundsPlayed || [];
    global.soundsPlayed.push(sound);
};
global.wrapText = function() {};
global.stormActive = false;
global.pathfinderActive = false;
global.setNarrativeFlag = function(flag, val) {
    global.narrativeFlags[flag] = val;
};
global.triggerScreenShake = function() {};
global.startCavernNavigation = function() {};
global.triggerBiomeAmbient = function() {};
global.playAudioStoryBeat = function() {};
global.setBiomeBackgrounds = function() {};

// Mock Environment Particle class
global.EnvironmentParticle = class {
    constructor(type) { this.type = type; }
};
global.envBuffer = {
    markDirty() {}
};

// Mock FloatingText class
global.FloatingText = class {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
    }
};

// Mock CampaignSave class
global.CampaignSave = {
    checkpoints: {},
    checkpoint(slot, data) {
        this.checkpoints[slot] = data;
    },
    load(slot) {
        return this.checkpoints[slot] || null;
    }
};

// Mock Economy class
global.Economy = {
    segments: 0,
    newSegment() {
        this.segments++;
    }
};

// Mock level_manager.js globals
global.BIOME_DATA = {
    names: {
        1: '1: Abyssal Trench',
        2: '2: Coral Graveyard',
        3: '3: Coelacanth Lair',
        4: '4: Nebula Drift',
        5: '5: Ice Ring',
        6: '6: Fire Nebula',
        7: '7: Storm Belt',
        8: '8: Derelict Fleet',
        9: '9: Xenomorph Hive',
        10: '10: Core Rift'
    },
    enemies: {
        1: { scout: 'scout_1', interceptor: 'int_1', heavy: 'hvy_1' }
    },
    bossHP: {}
};

// Load and eval dialogue.js with extra global exports
const dialoguePath = path.join(__dirname, '../js/ui/dialogue.js');
let dialogueCode = fs.readFileSync(dialoguePath, 'utf8');
// Append global assignments to non-exported variables and functions
dialogueCode += '\nglobal.updateActiveBiome = updateActiveBiome;\nglobal.DIALOGUE_SCENES = DIALOGUE_SCENES;';
eval(dialogueCode);

const DialogueSequence = global.DialogueSequence;
const EventBus = global.EventBus;

// Mock extra browser environment properties for ui.js
global.addEventListener = () => {};
global.keys = {};
global.canvas = {
    width: 800,
    height: 600,
    addEventListener() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 800, height: 600 }; }
};
global.document = {
    getElementById(id) {
        return {
            addEventListener() {},
            classList: { add() {}, remove() {} },
            pause() {},
            muted: false,
            play() { return Promise.resolve(); }
        };
    }
};
global.Image = class {
    constructor() {
        setTimeout(() => { if (this.onload) this.onload(); }, 0);
    }
};

const vm = require('vm');

// Load ui.js
const uiPath = path.resolve(__dirname, '../js/ui.js');
let uiCode = fs.readFileSync(uiPath, 'utf8');
uiCode = uiCode.replace('let selectedShipIndex =', 'var selectedShipIndex =');
uiCode = uiCode.replace('const SHIP_OPTIONS =', 'var SHIP_OPTIONS =');
uiCode = uiCode.replace('let selectedShip =', 'var selectedShip =');
vm.runInThisContext(uiCode);

// Load utils.js
const utilsPath = path.resolve(__dirname, '../js/utils.js');
const utilsCode = fs.readFileSync(utilsPath, 'utf8');
vm.runInThisContext(utilsCode);

// We will track the test results
const results = {
    test1_extremeValues: null,
    test2_fastTransitions: null,
    test3_scoreFluctuations: null,
    test4_undefinedShips: null
};

// Reset globals between tests
function resetGameState() {
    global.runScrap = 0;
    global.score = 0;
    global.activeBiomeName = '1: Abyssal Trench';
    global.biomeLevel = 1;
    global.maxBiomeReached = 1;
    global.player = {
        weaponLevel: 1,
        shield: 100,
        shieldMax: 100,
        shipType: 'interceptor',
        takeDamage() {}
    };
    global.narrativeFlags = {
        lyra_trust: 0,
        coelacanth_mercy: 0,
        power_lust: 0,
        dreamer_connection: 0,
        sacrifice_seen: 0,
        cross_defected: 0
    };
    global.floatingTexts = [];
    global.soundsPlayed = [];
    global.Economy.segments = 0;
    global.CampaignSave.checkpoints = {};
    global.localStorage.clear();
    
    // reset dialogue state
    global.activeDialogue = null;
    for (const key in global.dialogueCompletedScenes) {
        global.dialogueCompletedScenes[key] = false;
    }

    // Reset selected ship globals to new defaults
    global.selectedShip = 'striker';
    global.selectedShipIndex = 0;
}

// ----------------------------------------------------
// Test 1: Extremely high scrap or score values
// ----------------------------------------------------
try {
    resetGameState();
    console.log("Running Test 1: Extremely high scrap or score values...");

    // Set extremely high score and scrap
    global.score = 999999999;
    global.runScrap = 1234567890;
    
    const seq = new DialogueSequence([
        { speaker: "Darius", text: "Scrap is {scrap}, and score is {score}." }
    ], null, true);
    
    assert.strictEqual(seq.currentLineText, "Scrap is 1234567890, and score is 999999999.");
    
    // Set score to Infinity
    global.score = Infinity;
    global.runScrap = Infinity;
    const seq2 = new DialogueSequence([
        { speaker: "Darius", text: "Score: {score}. Scrap: {scrap}." }
    ], null, true);
    assert.strictEqual(seq2.currentLineText, "Score: Infinity. Scrap: Infinity.");

    // Update active biome with Infinity score
    global.updateActiveBiome(0.016, Infinity);
    assert.strictEqual(global.biomeLevel, 10);
    assert.strictEqual(global.activeBiomeName, '10: Core Rift');

    // Set score to NaN
    global.updateActiveBiome(0.016, NaN);
    // Since NaN < 300 etc are all false, it falls into the else branch (10: Core Rift)
    assert.strictEqual(global.biomeLevel, 10);
    assert.strictEqual(global.activeBiomeName, '10: Core Rift');

    results.test1_extremeValues = { status: "PASS", detail: "Interpolation and biome update handle extremely high and special values (Infinity, NaN) without crashing." };
} catch (e) {
    results.test1_extremeValues = { status: "FAIL", error: e.message };
}

// ----------------------------------------------------
// Test 2: Fast transitions between biomes
// ----------------------------------------------------
try {
    resetGameState();
    console.log("Running Test 2: Fast transitions between biomes...");

    // Jump from score 0 directly to 1500 (Biome 6 entry) in one frame
    // This transition should cross Biome 3 and Biome 6 which set critical narrative flags:
    // Biome 3 sets 'dreamer_connection'
    // Biome 6 sets 'cross_defected'
    
    global.updateActiveBiome(0.016, 1500);
    
    // Check if narrative flags are set
    const dreamerConnectionSet = global.narrativeFlags['dreamer_connection'] === 1;
    const crossDefectedSet = global.narrativeFlags['cross_defected'] === 1;
    
    console.log(`- Biome level: ${global.biomeLevel}`);
    console.log(`- narrativeFlags: ${JSON.stringify(global.narrativeFlags)}`);
    
    // Assert narrative flags are set (if intermediate biomes were processed)
    assert.ok(dreamerConnectionSet, "dreamer_connection narrative flag should be set on Biome 3 entry");
    assert.ok(crossDefectedSet, "cross_defected narrative flag should be set on Biome 6 entry");

    results.test2_fastTransitions = { status: "PASS", detail: "Fast biome transitions correctly process intermediate biomes and set narrative flags." };
} catch (e) {
    results.test2_fastTransitions = { status: "FAIL", detail: "Jumped directly to Biome 6. Intermediate biomes (Biome 3) and their narrative flags (dreamer_connection) were skipped because the update loop evaluates only the destination biome.", error: e.message };
}

// ----------------------------------------------------
// Test 3: Dialogue triggers firing when score goes backward or fluctuates
// ----------------------------------------------------
try {
    resetGameState();
    console.log("Running Test 3: Dialogue triggers on score fluctuation...");

    // Score goes 100 -> 150 -> 100 -> 150
    global.updateActiveBiome(0.016, 100);
    assert.strictEqual(global.activeDialogue, null);

    global.updateActiveBiome(0.016, 150);
    assert.ok(global.activeDialogue !== null, "Dialogue scene1 should trigger");
    assert.strictEqual(global.dialogueCompletedScenes.scene1, true);

    // Complete the dialogue manually to reset activeDialogue
    global.activeDialogue = null;

    global.updateActiveBiome(0.016, 100);
    assert.strictEqual(global.activeDialogue, null, "Should not trigger dialogue when going backward");

    global.updateActiveBiome(0.016, 150);
    assert.strictEqual(global.activeDialogue, null, "Should not trigger dialogue again when going forward to 150");

    // NOW let's test the Biome Fluctuation Side Effects:
    // If score fluctuates rapidly around biome boundaries (e.g. 299 <-> 301, transitioning between Biome 1 and Biome 2)
    // Does it repeatedly save checkpoints and notify Economy of new segments?
    resetGameState();
    
    // We start at score 290 (Biome 1)
    global.updateActiveBiome(0.016, 290);
    const initialCheckpointsCount = Object.keys(global.CampaignSave.checkpoints).length;
    const initialEconomySegments = global.Economy.segments;
    
    // Fluctuating between 290 and 310, 10 times
    for (let i = 0; i < 10; i++) {
        global.updateActiveBiome(0.016, 310); // enters Biome 2
        global.updateActiveBiome(0.016, 290); // enters Biome 1
    }
    
    const finalCheckpointsCount = Object.keys(global.CampaignSave.checkpoints).length;
    const finalEconomySegments = global.Economy.segments;
    
    console.log(`- Biome fluctuations resulted in:`);
    console.log(`  - Checkpoint saves: ${finalCheckpointsCount}`);
    console.log(`  - Economy newSegment calls: ${finalEconomySegments}`);

    // If it transitions 10 times back and forth, it saves checkpoint and calls Economy.newSegment 20 times.
    // This is excessive and leads to game loop stutter (due to disk I/O / save serialization) and corrupts economy tracking!
    assert.ok(finalCheckpointsCount <= 1, "Should not repeatedly save campaign checkpoints on biome fluctuations");
    assert.ok(finalEconomySegments <= 1, "Should not repeatedly call Economy.newSegment on biome fluctuations");

    results.test3_scoreFluctuations = { status: "PASS", detail: "Dialogue triggers and biome side effects are stable under score fluctuations." };
} catch (e) {
    results.test3_scoreFluctuations = { status: "FAIL", detail: `Score fluctuations cause multiple biome entry transitions. Checkpoint saves: ${global.CampaignSave.checkpoints ? Object.keys(global.CampaignSave.checkpoints).length : 0}, Economy newSegment calls: ${global.Economy.segments}. This results in excessive storage writing and corrupts loot tracking.`, error: e.message };
}

// ----------------------------------------------------
// Test 4: Ship types that might not map to existing ship categories or are undefined
// ----------------------------------------------------
try {
    resetGameState();
    console.log("Running Test 4: Undefined or unmapped ship types...");

    // Case A: Dialogue interpolation of invalid ship type
    global.player.shipType = 'alien_dreadnought';
    const seq = new DialogueSequence([
        { speaker: "Thorne", text: "You are piloting a {ship}." }
    ], null, true);
    assert.strictEqual(seq.currentLineText, "You are piloting a alien_dreadnought.");

    // Case B: Dialogue interpolation of undefined ship type
    global.player = undefined; // player is undefined
    const seq2 = new DialogueSequence([
        { speaker: "Thorne", text: "You are piloting a {ship}." }
    ], null, true);
    assert.strictEqual(seq2.currentLineText, "You are piloting a interceptor.", "Should fall back to 'interceptor' when player is undefined");

    // Case C: Save/load ship mismatch
    // In ui.js:
    // const SHIP_OPTIONS = ['scout', 'interceptor', 'heavy'];
    // selectedShipIndex = SHIP_OPTIONS.indexOf(save.ship);
    // if (selectedShipIndex < 0) selectedShipIndex = 0;
    
    // Simulate loading save state with advanced ship type 'warden'
    const saveStateShip = 'warden';
    
    // Mock CampaignSave.load to return a save data with ship 'warden'
    global.CampaignSave.checkpoints[0] = {
        ship: saveStateShip,
        biome: 1,
        wave: 1,
        score: 0,
        scrap: 0,
        lives: 3
    };
    global.localStorage.setItem('dariusStar_activeSlot', '0');

    // Call the actual implementation function
    global.initCampaignSession();

    // Check if global selectedShip and selectedShipIndex match saveStateShip
    assert.strictEqual(global.selectedShip, saveStateShip, "Loaded ship type should match the saved ship type ('warden')");
    assert.strictEqual(global.selectedShipIndex, global.SHIP_OPTIONS.indexOf(saveStateShip), "selectedShipIndex should match index of 'warden'");

    results.test4_undefinedShips = { status: "PASS", detail: "Unmapped ship types are handled gracefully without resetting selectedShipIndex." };
} catch (e) {
    results.test4_undefinedShips = { status: "FAIL", detail: "Advanced ship types (like 'warden' or 'tempest') or undefined ship types are not in SHIP_OPTIONS. When loading, selectedShipIndex resets to 0 ('scout'), causing ship select UI and next gameplay start to mismatch.", error: e.message };
}

// Output final summary
console.log("\n=== TEST RESULTS SUMMARY ===");
console.log(JSON.stringify(results, null, 2));

// Exit with 0 since we want the test runner to finish and output findings
process.exit(0);
