const assert = require('assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

// Mock browser global environments
global.window = global;
global.localStorage = {
    _data: {},
    getItem(key) {
        return this._data[key] || null;
    },
    setItem(key, value) {
        this._data[key] = String(value);
    },
    removeItem(key) {
        delete this._data[key];
    },
    clear() {
        this._data = {};
    }
};

// Mock player ship
global.player = {
    shipType: 'striker'
};

// Mock NGPlus
global.ngPlusRun = false;
global.currentNGLevel = 0;
global.NGPlus = {
    getScrapMult(opts) {
        return 1.0 + (opts.ngLevel * 0.5); // e.g. NG+1 gives 1.5x scrap
    }
};

// Mock sound / text/ narrative / canvas / others
global.playSound = () => {};
global.floatingTexts = [];
global.FloatingText = class {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
    }
};
global.triggerScrapNarrativeBeat = () => {};
global.scrapDrops = [];

// Mock particles
global.Particle = class {
    constructor() {}
};

// Load all modules in order
function loadModule(filePath) {
    const code = fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8');
    vm.runInThisContext(code);
}

console.log("Loading modules...");
loadModule('../js/economy.js');
loadModule('../js/scrap_events.js');
loadModule('../js/combat.js');
loadModule('../js/upgrade_system.js');
loadModule('../js/utils.js');
loadModule('../js/save_system.js');
console.log("Modules loaded successfully!");

// Verification 1: Economy and scrap wallet increment
function testEconomyAndWallet() {
    console.log("Running testEconomyAndWallet...");

    // Initialize systems
    Economy.init();
    ScrapEvents.reset();
    localStorage.clear();
    
    // 1.1 Test segment-based anti-farming: shouldDrop
    const enemyId = "enemy_123";
    const enemyType = "grunt";
    
    // First shouldDrop roll
    const firstRoll = Economy.shouldDrop(enemyId, enemyType);
    console.log(`First shouldDrop roll: ${firstRoll}`);
    
    // Second shouldDrop roll for the same enemyId in the same segment MUST be false
    const secondRoll = Economy.shouldDrop(enemyId, enemyType);
    assert.strictEqual(secondRoll, false, "Anti-farming: Should not drop scrap twice for the same enemy in the same segment");

    // 1.2 Test rollDrop limits and biome bonuses
    // Let's check grunt in biome 1 and biome 5
    // Grunt drop table: biomeBonus: 2, weight: metal/alloy/cell
    // Metal min: 10 max: 50
    // Alloy min: 50 max: 100
    // Cell min: 100 max: 250
    for (let i = 0; i < 1000; i++) {
        const dropB1 = Economy.rollDrop("grunt", 1);
        const config = Economy._dropTypes[dropB1.type];
        assert.ok(dropB1.amount >= config.min && dropB1.amount <= config.max, `Biome 1 drop amount ${dropB1.amount} should be within min/max for type ${dropB1.type}`);

        const dropB5 = Economy.rollDrop("grunt", 5);
        const configB5 = Economy._dropTypes[dropB5.type];
        const bonus = (5 - 1) * 2; // (biome - 1) * table.biomeBonus
        assert.ok(dropB5.amount >= configB5.min + bonus && dropB5.amount <= configB5.max + bonus, `Biome 5 drop amount ${dropB5.amount} should include biome bonus. Expected min ${configB5.min + bonus}, max ${configB5.max + bonus}`);
    }

    // 1.3 Test ScrapDrop value assignment
    // ScrapDrop class from combat.js computes value based on type if value is not explicitly passed
    const sdMetal = new ScrapDrop(100, 100, 'metal');
    assert.ok(sdMetal.value >= 10 && sdMetal.value <= 50, "Default ScrapDrop metal value should be 10-50");
    
    const sdExplicit = new ScrapDrop(100, 100, 'metal', 75);
    assert.strictEqual(sdExplicit.value, 75, "ScrapDrop value should match explicitly passed value");

    // 1.4 Test Scrap Collection & Wallet Increments in game loop
    // Simulate game loop logic for collision & collection
    let runScrap = 0;
    
    // Function to simulate collision
    function collectScrap(scrapDropObj, shipType, isNGPlus, ngLevel) {
        global.player.shipType = shipType;
        global.ngPlusRun = isNGPlus;
        global.currentNGLevel = ngLevel;
        
        let collectedVal = scrapDropObj.value;
        if (global.player.shipType === 'warden') {
            collectedVal = Math.round(collectedVal * 1.20);
        }
        
        let localRunScrap = 0;
        localRunScrap += collectedVal;
        if (global.ngPlusRun && global.currentNGLevel > 0 && window.NGPlus) {
            const bonus = collectedVal * (NGPlus.getScrapMult({ ngLevel: global.currentNGLevel }) - 1);
            localRunScrap += Math.round(bonus);
            collectedVal += Math.round(bonus);
        }
        
        if (window.ScrapEvents && ScrapEvents.onScrapCollected) {
            ScrapEvents.onScrapCollected(collectedVal, scrapDropObj.type);
        }
        
        return { collectedVal, localRunScrap };
    }

    // Normal Ship, Non-NG+
    const sd1 = new ScrapDrop(100, 100, 'metal', 20);
    const res1 = collectScrap(sd1, 'striker', false, 0);
    assert.strictEqual(res1.collectedVal, 20, "Collected value should be raw value for normal ship");
    
    // Warden Ship (+20% bonus)
    const sd2 = new ScrapDrop(100, 100, 'metal', 20);
    const res2 = collectScrap(sd2, 'warden', false, 0);
    assert.strictEqual(res2.collectedVal, 24, "Collected value should be 1.2x for warden ship"); // 20 * 1.2 = 24
    
    // Warden Ship with NG+1 (+50% NG bonus)
    // base = 20, warden bonus = 24
    // ng bonus = 24 * (1.5 - 1) = 12
    // total = 24 + 12 = 36
    const sd3 = new ScrapDrop(100, 100, 'metal', 20);
    const res3 = collectScrap(sd3, 'warden', true, 1);
    assert.strictEqual(res3.collectedVal, 36, "Collected value should combine warden and NG+ multipliers");

    // Verify event bridge total run scrap
    assert.strictEqual(ScrapEvents.getRunScrap(), 20 + 24 + 36, "ScrapEvents run scrap should accumulate all collected scrap");

    // 1.5 Test permanent wallet accumulation on game over / win
    // Reset ScrapEvents and runScrap
    ScrapEvents.reset();
    const sd4 = new ScrapDrop(100, 100, 'metal', 100);
    const res4 = collectScrap(sd4, 'striker', false, 0);
    const finalRunScrap = res4.collectedVal;
    
    // Instantiating the DS_UpgradeSystem
    const upgradeSystem = new DS_UpgradeSystem.constructor();
    assert.strictEqual(upgradeSystem.state.scrap, 0, "Upgrade system state scrap should start at 0");
    
    // Game over / win logic: addScrap
    upgradeSystem.addScrap(finalRunScrap);
    assert.strictEqual(upgradeSystem.state.scrap, 100, "Permanent wallet should accumulate runScrap on run end");

    console.log("testEconomyAndWallet: PASS");
}

// Verification 2 & 3: Save System Serialization, Base64 Encoding, Validation, and Error Recovery
function testSaveSystemRobustness() {
    console.log("Running testSaveSystemRobustness...");

    // 2.1 Test CampaignSave slot serialization
    localStorage.clear();
    const blankSave = CampaignSave.createBlank();
    CampaignSave.save(0, blankSave);
    
    // Verify it is saved in localStorage under STORAGE_KEY
    const rawSaves = localStorage.getItem(CampaignSave.STORAGE_KEY);
    assert.ok(rawSaves, "CampaignSave STORAGE_KEY should exist in localStorage");
    
    const parsedSaves = JSON.parse(rawSaves);
    assert.ok(Array.isArray(parsedSaves), "Saves key must hold an array");
    assert.strictEqual(parsedSaves.length, CampaignSave.MAX_SLOTS);
    assert.ok(parsedSaves[0], "Slot 0 should contain the saved object");
    
    // 2.2 Test Total Scrap serialization and Base64-encoding
    // Mock DS_UpgradeSystem and runScrap
    global.DS_UpgradeSystem = { state: { scrap: 300 } };
    global.runScrap = 150;
    saveTotalScrapOnBiomeCompletion();
    
    const totalScrapB64 = localStorage.getItem('darius_star_total_scrap');
    assert.ok(totalScrapB64, "darius_star_total_scrap key must exist in localStorage");
    
    // Decode base64 and parse JSON
    const decoded = Buffer.from(totalScrapB64, 'base64').toString('utf-8');
    const parsedScrapObj = JSON.parse(decoded);
    assert.strictEqual(parsedScrapObj.scrap, 450, "Serialized total scrap should combine upgrade scrap and run scrap (300 + 150 = 450)");

    // Test loadTotalScrapFromBase64
    const loadedScrap = loadTotalScrapFromBase64();
    assert.strictEqual(loadedScrap, 450, "loadTotalScrapFromBase64 should correctly retrieve the total scrap amount");

    // 3.1 Test CampaignSave Error Recovery on Malformed JSON
    // Set malformed JSON
    localStorage.setItem(CampaignSave.STORAGE_KEY, "{invalid_json");
    CampaignSave.pendingCorruptionNotice = false;
    
    const loadedMalformed = CampaignSave.loadAll();
    assert.deepStrictEqual(loadedMalformed, [null, null, null], "Malformed JSON must recover to empty array [null, null, null]");
    assert.strictEqual(CampaignSave.pendingCorruptionNotice, true, "pendingCorruptionNotice should be set to true on syntax error");
    
    // 3.2 Test CampaignSave Error Recovery on Schema Violation
    // Create a save missing required upgrades key
    localStorage.clear();
    const badSave = CampaignSave.createBlank();
    delete badSave.upgrades; // delete required key
    
    CampaignSave.save(1, badSave); // Saved under slot 1
    CampaignSave.pendingCorruptionNotice = false;
    
    // Reading slot 1 should return null due to validation failure
    const loadedSlot1 = CampaignSave.load(1);
    assert.strictEqual(loadedSlot1, null, "Corrupt save slot missing required upgrades field should return null");
    assert.strictEqual(CampaignSave.pendingCorruptionNotice, true, "pendingCorruptionNotice should be set to true on validation failure");

    // 3.3 Test Total Scrap Base64 Error Recovery
    // Set invalid base64 string
    localStorage.setItem('darius_star_total_scrap', "!!!invalid_base64!!!");
    const loadedBadB64 = loadTotalScrapFromBase64();
    assert.strictEqual(loadedBadB64, null, "Malformed base64 string must recover cleanly and return null without throwing error");

    // Set valid base64 but invalid JSON
    const invalidJsonB64 = Buffer.from("{invalid_json").toString('base64');
    localStorage.setItem('darius_star_total_scrap', invalidJsonB64);
    const loadedBadJson = loadTotalScrapFromBase64();
    assert.strictEqual(loadedBadJson, null, "Malformed JSON inside base64 must recover cleanly and return null without throwing error");

    console.log("testSaveSystemRobustness: PASS");
}

// Run tests
try {
    testEconomyAndWallet();
    testSaveSystemRobustness();
    console.log("\nALL CHALLENGER ROBUSTNESS TESTS PASSED SUCCESSFULLY! ✅");
} catch (e) {
    console.error("TESTS FAILED ❌");
    console.error(e);
    process.exit(1);
}
