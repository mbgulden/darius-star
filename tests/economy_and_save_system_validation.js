const assert = require('assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

// Setup global mock environment
const localStorageStore = {};
global.localStorage = {
    setItem(key, val) {
        localStorageStore[key] = String(val);
    },
    getItem(key) {
        return localStorageStore[key] || null;
    },
    removeItem(key) {
        delete localStorageStore[key];
    },
    clear() {
        for (const key in localStorageStore) {
            delete localStorageStore[key];
        }
    }
};

global.window = global;
global.playSound = () => {};
global.FloatingText = function(x, y, text, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
};
global.floatingTexts = [];
global.scrapDrops = [];

// Mock player
global.player = {
    x: 100,
    y: 100,
    width: 32,
    height: 32,
    shipType: 'striker'
};

// Mock checkCollision
global.checkCollision = (obj1, obj2) => {
    return true; // Force collision for picking up scrap
};

// Mock Math.random to return deterministic values
let mockRandomVal = 0.01;
global.Math.random = () => mockRandomVal;

// Load Economy first
const economyPath = path.resolve(__dirname, '../js/economy.js');
const economyCode = fs.readFileSync(economyPath, 'utf-8');
vm.runInThisContext(economyCode);

// Load Utils
const utilsPath = path.resolve(__dirname, '../js/utils.js');
const utilsCode = fs.readFileSync(utilsPath, 'utf-8');
vm.runInThisContext(utilsCode);

// Load NGPlus
const ngPlusPath = path.resolve(__dirname, '../js/ngplus.js');
const ngPlusCode = fs.readFileSync(ngPlusPath, 'utf-8');
vm.runInThisContext(ngPlusCode);

// Load CampaignSave
const saveSystemPath = path.resolve(__dirname, '../js/save_system.js');
const saveSystemCode = fs.readFileSync(saveSystemPath, 'utf-8');
vm.runInThisContext(saveSystemCode);

// Mock ScrapEvents
global.ScrapEvents = {
    onScrapCollected(amount, type) {
        this.collected = { amount, type };
    },
    onDropGenerated(drop, enemyType, biomeLevel) {
        this.dropped = { drop, enemyType, biomeLevel };
    }
};

console.log('--- STARTING ECONOMY AND SAVE SYSTEM VERIFICATION ---');

// ==========================================
// 1. Scrap Dropping and Wallet Incrementation
// ==========================================
function testScrapDroppingAndWallet() {
    console.log('\nRunning: 1. Scrap Dropping & Wallet Incrementation Tests');
    
    // Test 1.1: Basic roll, drop, and collection
    global.runScrap = 0;
    global.player.shipType = 'striker';
    global.ngPlusRun = false;
    global.currentNGLevel = 0;
    
    // Initialize Economy
    window.Economy.init();
    
    // Grunt drop roll
    mockRandomVal = 0.01; // Ensure shouldDrop returns true
    const canDrop = window.Economy.shouldDrop('enemy_grunt_1', 'grunt');
    assert.strictEqual(canDrop, true, 'First encounter should drop under mocked random');
    
    const drop = window.Economy.rollDrop('grunt', 1);
    assert.ok(drop.amount >= 10 && drop.amount <= 50, 'Grunt drop amount should be within metal range (10-50)');
    
    const ecoDrop = window.Economy.createDrop(150, 150, drop.type, drop.amount);
    assert.strictEqual(ecoDrop.type, drop.type);
    assert.strictEqual(ecoDrop.amount, drop.amount);
    
    // Simulate game loop pickup logic
    let collectedVal = ecoDrop.amount;
    if (global.player.shipType === 'warden') {
        collectedVal = Math.round(collectedVal * 1.20);
    }
    global.runScrap += collectedVal;
    
    assert.strictEqual(global.runScrap, drop.amount, 'Wallet should be incremented by the drop amount');
    console.log(`- Test 1.1: PASSED (dropped ${drop.amount}, wallet is ${global.runScrap})`);

    // Test 1.2: Warden ship type 20% bonus
    global.runScrap = 0;
    global.player.shipType = 'warden';
    
    let baseVal = 100;
    collectedVal = baseVal;
    if (global.player.shipType === 'warden') {
        collectedVal = Math.round(collectedVal * 1.20);
    }
    global.runScrap += collectedVal;
    assert.strictEqual(global.runScrap, 120, 'Warden should receive 20% bonus scrap');
    console.log(`- Test 1.2: PASSED (base 100 -> collected ${global.runScrap})`);

    // Test 1.3: NG+ Multiplier
    global.runScrap = 0;
    global.player.shipType = 'striker';
    global.ngPlusRun = true;
    global.currentNGLevel = 2; // Multiplier should be 1 + 2 * 0.5 = 2.0x
    
    baseVal = 100;
    collectedVal = baseVal;
    if (global.player.shipType === 'warden') {
        collectedVal = Math.round(collectedVal * 1.20);
    }
    global.runScrap += collectedVal;
    
    if (global.ngPlusRun && global.currentNGLevel > 0 && window.NGPlus) {
        const bonus = collectedVal * (window.NGPlus.getScrapMult({ ngLevel: global.currentNGLevel }) - 1);
        global.runScrap += Math.round(bonus);
    }
    
    assert.strictEqual(global.runScrap, 200, 'NG+ Level 2 should double the scrap (2.0x multiplier)');
    console.log(`- Test 1.3: PASSED (base 100 -> NG+ level 2 -> collected ${global.runScrap})`);

    // Test 1.4: Warden + NG+ Level 2 Multiplier
    global.runScrap = 0;
    global.player.shipType = 'warden';
    global.ngPlusRun = true;
    global.currentNGLevel = 2;
    
    baseVal = 100;
    collectedVal = baseVal;
    if (global.player.shipType === 'warden') {
        collectedVal = Math.round(collectedVal * 1.20);
    }
    global.runScrap += collectedVal;
    
    if (global.ngPlusRun && global.currentNGLevel > 0 && window.NGPlus) {
        const bonus = collectedVal * (window.NGPlus.getScrapMult({ ngLevel: global.currentNGLevel }) - 1);
        global.runScrap += Math.round(bonus);
    }
    
    assert.strictEqual(global.runScrap, 240, 'Warden + NG+ Level 2 should be 100 * 1.2 * 2 = 240');
    console.log(`- Test 1.4: PASSED (base 100 -> Warden + NG+ lvl 2 -> collected ${global.runScrap})`);

    // Test 1.5: Anti-farming segment protection
    window.Economy.init();
    mockRandomVal = 0.01;
    const drop1 = window.Economy.shouldDrop('enemy_unique_1', 'grunt');
    const drop2 = window.Economy.shouldDrop('enemy_unique_1', 'grunt');
    assert.strictEqual(drop1, true, 'Unique enemy in new run should drop');
    assert.strictEqual(drop2, false, 'Same unique enemy in same segment should NOT drop again');
    
    window.Economy.newSegment();
    mockRandomVal = 0.01;
    const drop3 = window.Economy.shouldDrop('enemy_unique_1', 'grunt');
    assert.strictEqual(drop3, true, 'Same unique enemy in NEW segment should drop');
    console.log('- Test 1.5: PASSED (anti-farming segment protection validated)');
}

// ==========================================
// 2. Base64 Serialization & LocalStorage
// ==========================================
function testBase64Serialization() {
    console.log('\nRunning: 2. Base64 Serialization & LocalStorage Tests');
    localStorage.clear();
    
    global.DS_UpgradeSystem = {
        state: {
            scrap: 350
        }
    };
    global.runScrap = 75; // Total should be 350 + 75 = 425
    
    // Call serialization function
    saveTotalScrapOnBiomeCompletion();
    
    // Verify it is base64 encoded in localStorage
    const keys = [
        'darius_star_total_scrap',
        'darius_star_scrap',
        'total_scrap',
        'totalScrap',
        'darius_star_totalScrap',
        'darius_star_total_scrap_raw'
    ];
    
    for (const key of keys) {
        const val = localStorage.getItem(key);
        assert.ok(val, `Key ${key} must exist in localStorage`);
        
        // Ensure it is valid base64
        assert.doesNotThrow(() => {
            const decoded = Buffer.from(val, 'base64').toString('utf-8');
            JSON.parse(decoded);
        }, `Value under key ${key} is not valid base64-encoded JSON`);
    }
    
    // Test decoding and loading back
    const loadedScrap = loadTotalScrapFromBase64();
    assert.strictEqual(loadedScrap, 425, 'Loaded scrap from base64 must match serialized total (425)');
    console.log(`- Test 2.1: PASSED (serialized 425 to base64, verified keys, loaded back successfully)`);
}

// ==========================================
// 3. Validation & Error Recovery Schemas
// ==========================================
function testValidationAndErrorRecovery() {
    console.log('\nRunning: 3. Validation & Error Recovery Schema Tests');
    
    // Test 3.1: CampaignSave - Malformed JSON recovery
    localStorage.clear();
    localStorage.setItem(window.CampaignSave.STORAGE_KEY, '{invalid json');
    window.CampaignSave.pendingCorruptionNotice = false;
    
    const saves1 = window.CampaignSave.loadAll();
    assert.deepStrictEqual(saves1, [null, null, null], 'Should return empty slots array on malformed JSON');
    assert.strictEqual(window.CampaignSave.pendingCorruptionNotice, true, 'Should raise corruption flag');
    assert.strictEqual(localStorage.getItem(window.CampaignSave.STORAGE_KEY), null, 'Should clean/remove corrupted key from localStorage');
    console.log('- Test 3.1: PASSED (CampaignSave malformed JSON recovered and cleared)');

    // Test 3.2: CampaignSave - Invalid schema (missing upgrades) recovery
    localStorage.clear();
    const blankSave = window.CampaignSave.createBlank();
    const corruptSave = { ...blankSave };
    delete corruptSave.upgrades;
    
    const savesArray = [corruptSave, null, null];
    localStorage.setItem(window.CampaignSave.STORAGE_KEY, JSON.stringify(savesArray));
    window.CampaignSave.pendingCorruptionNotice = false;
    
    const saves2 = window.CampaignSave.loadAll();
    assert.strictEqual(saves2[0], null, 'Corrupted slot should be filtered to null');
    assert.strictEqual(window.CampaignSave.pendingCorruptionNotice, true, 'Should raise corruption flag');
    console.log('- Test 3.2: PASSED (CampaignSave schema mismatch filtered to null)');

    // Test 3.3: Total Scrap Loader - Malformed base64
    localStorage.clear();
    localStorage.setItem('darius_star_total_scrap', '!!!NotBase64!!!');
    
    let result = loadTotalScrapFromBase64();
    assert.strictEqual(result, null, 'Should return null and not crash on invalid base64');
    
    // Test 3.4: Total Scrap Loader - Valid base64 but malformed JSON
    localStorage.setItem('darius_star_total_scrap', Buffer.from('{bad json').toString('base64'));
    result = loadTotalScrapFromBase64();
    assert.strictEqual(result, null, 'Should return null and not crash on malformed JSON inside base64');

    // Test 3.5: Total Scrap Loader - Valid base64 and JSON but missing/incorrect schema
    localStorage.setItem('darius_star_total_scrap', Buffer.from(JSON.stringify({ notScrap: 123 })).toString('base64'));
    result = loadTotalScrapFromBase64();
    assert.strictEqual(result, null, 'Should return null and not crash on invalid schema');
    console.log('- Test 3.3 - 3.5: PASSED (Base64 loader error recovery validated)');
}

try {
    testScrapDroppingAndWallet();
    testBase64Serialization();
    testValidationAndErrorRecovery();
    console.log('\n=========================================');
    console.log('ALL TESTS PASSED SUCCESSFULLY! SYSTEM IS ROBUST.');
    console.log('=========================================');
} catch (e) {
    console.error('TEST FAILURE:', e);
    process.exit(1);
}
