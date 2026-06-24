const assert = require('assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

// Mock localStorage
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

// Mock window and global objects
global.window = global;
global.runScrap = 50; // Mock current run scrap

// Mock DS_UpgradeSystem
global.DS_UpgradeSystem = {
    state: {
        scrap: 250 // Mock permanent scrap
    }
};

// Load the utility functions into the global context
const utilsPath = path.resolve(__dirname, '../js/utils.js');
const utilsCode = fs.readFileSync(utilsPath, 'utf-8');
vm.runInThisContext(utilsCode);

function testSaveTotalScrap() {
    localStorage.clear();
    
    // Total should be DS_UpgradeSystem.state.scrap (250) + runScrap (50) = 300
    assert.ok(typeof saveTotalScrapOnBiomeCompletion === 'function');
    assert.ok(typeof loadTotalScrapFromBase64 === 'function');

    saveTotalScrapOnBiomeCompletion();

    // Check stored values
    const stored = localStorage.getItem('darius_star_total_scrap');
    assert.ok(stored, 'darius_star_total_scrap key must exist');

    const decoded = atob(stored);
    const parsed = JSON.parse(decoded);
    assert.strictEqual(parsed.scrap, 300, 'Serialized scrap should be 300');

    const loadedVal = loadTotalScrapFromBase64();
    assert.strictEqual(loadedVal, 300, 'Loaded scrap should match expected 300');

    // Test raw fallback key
    const rawStored = localStorage.getItem('darius_star_total_scrap_raw');
    assert.ok(rawStored, 'darius_star_total_scrap_raw key must exist');
    assert.strictEqual(JSON.parse(atob(rawStored)), 300, 'Raw value must decode to 300');

    console.log('testSaveTotalScrap: PASS');
}

testSaveTotalScrap();
