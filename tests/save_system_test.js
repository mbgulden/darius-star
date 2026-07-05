const assert = require('assert');
const path = require('path');

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
    }
};

// Load the save system module
function loadSaveSystem() {
    const modulePath = path.resolve(__dirname, '../js/save_system.js');
    delete require.cache[modulePath];
    require(modulePath);
    return global.CampaignSave;
}

function testSaveSystemValidation() {
    const CampaignSave = loadSaveSystem();
    
    // Test case 1: read from empty storage returns [null, null, null]
    localStorage.removeItem(CampaignSave.STORAGE_KEY);
    localStorage.removeItem('darius_star_save');
    assert.deepStrictEqual(CampaignSave.loadAll(), [null, null, null]);
    assert.strictEqual(CampaignSave.pendingCorruptionNotice, false);

    // Test case 2: valid blank save object creation and saving
    const blank = CampaignSave.createBlank();
    CampaignSave.save(0, blank);
    const loaded = CampaignSave.load(0);
    assert.ok(loaded);
    assert.strictEqual(loaded.biome, 1);
    assert.strictEqual(loaded.wave, 1);
    assert.strictEqual(loaded.ship, 'striker');
    assert.strictEqual(CampaignSave.pendingCorruptionNotice, false);

    // Test case 3: corrupted schema validation (missing required upgrades key)
    const corruptSave = { ...blank };
    delete corruptSave.upgrades;
    
    const savesArray = [corruptSave, null, null];
    localStorage.setItem(CampaignSave.STORAGE_KEY, JSON.stringify(savesArray));
    
    // When loaded, the corrupted slot should be filtered to null
    const result = CampaignSave.loadAll();
    assert.strictEqual(result[0], null);
    assert.strictEqual(CampaignSave.pendingCorruptionNotice, true);
    
    // Reset notification
    CampaignSave.pendingCorruptionNotice = false;

    // Test case 4: malformed JSON injection
    localStorage.setItem(CampaignSave.STORAGE_KEY, '{invalid json');
    const resultMalformed = CampaignSave.loadAll();
    assert.deepStrictEqual(resultMalformed, [null, null, null]);
    assert.strictEqual(CampaignSave.pendingCorruptionNotice, true);
    
    console.log('save_system_test: ok');
}

testSaveSystemValidation();