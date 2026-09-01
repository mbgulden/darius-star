/**
 * tests/briefing_back_button_test.js
 * Unit and integration tests for the "Save & Go Back" button, skip button,
 * and keyboard navigation on the Mission Briefing screen.
 */

const assert = require('assert');

// Mock browser globals
global.window = global;
global.document = {
    getElementById: (id) => {
        if (id === 'lyra-hud') {
            return {
                style: { display: 'block' },
                classList: {
                    add: () => {},
                    remove: () => {}
                }
            };
        }
        return null;
    }
};
global.localStorage = {
    _data: {},
    getItem: function(k) { return this._data[k] || null; },
    setItem: function(k, v) { this._data[k] = String(v); },
    removeItem: function(k) { delete this._data[k]; },
    clear: function() { this._data = {}; }
};

global.SCREENS = {
    MENU: 'menu',
    SHIP_SELECT: 'ship_select',
    BRIEFING: 'briefing',
    PLAYING: 'playing'
};
global.currentScreen = 'briefing';

let _transitionTarget = null;
global.transitionToScreen = function(scr) {
    _transitionTarget = scr;
    global.currentScreen = scr;
};

let _soundPlayed = null;
global.playSound = function(s) { _soundPlayed = s; };

let _voiceStopped = false;
global.VoicePipeline = {
    stop: () => { _voiceStopped = true; },
    speak: () => {}
};

let _savedSlots = {};
global.CampaignSave = {
    createBlank: () => ({ biome: 1, level: 1, ship: 'interceptor', scrap: 0, upgrades: {} }),
    load: (slot) => _savedSlots[slot] || null,
    save: (slot, data) => { _savedSlots[slot] = data; }
};

global.LevelManager = { biome: 2, level: 1 };
global.selectedShip = 'aegis';
global.DS_UpgradeSystem = { state: { scrap: 1500, upgrades: { weapons: 2 } } };
global.canvas = { width: 800, height: 450 };

// Load briefing.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const briefingCode = fs.readFileSync(path.join(__dirname, '../js/ui/briefing.js'), 'utf8');

// DialogueSequence mock
global.DialogueSequence = function(lines) {
    this.lines = lines;
    this.currentLineIndex = 0;
    this.next = () => { this.currentLineIndex++; };
    this.draw = () => {};
    this.update = () => {};
};

vm.runInThisContext(briefingCode);

console.log('--- RUNNING BRIEFING BACK BUTTON & NAVIGATION TESTS ---');

// Test 1: Start Briefing
let completeCalled = false;
startBriefing(2, () => {
    completeCalled = true;
});
assert(activeBriefing !== null, 'Briefing should be active after startBriefing');
assert.strictEqual(_briefingHitRegions.back.x, 24, 'Back button region X should be 24');
console.log('✅ Test 1 Passed: startBriefing initializes briefing state and hit regions');

// Test 2: Click Back button saves progress and transitions to SHIP_SELECT
localStorage.setItem('dariusStar_activeSlot', '0');
_transitionTarget = null;
_voiceStopped = false;

handleBriefingClick(50, 25); // Inside Back button (24 to 189, y: 14 to 48)

assert.strictEqual(activeBriefing, null, 'Active briefing should be cleared after back click');
assert.strictEqual(_voiceStopped, true, 'VoicePipeline.stop() should be called on back click');
assert.strictEqual(_transitionTarget, SCREENS.SHIP_SELECT, 'Should transition back to SHIP_SELECT');
assert(_savedSlots[0], 'CampaignSave should have saved slot 0');
assert.strictEqual(_savedSlots[0].ship, 'aegis', 'Saved ship should match selectedShip');
assert.strictEqual(_savedSlots[0].scrap, 1500, 'Saved scrap should match upgrade system scrap');
console.log('✅ Test 2 Passed: Clicking Save & Go Back button saves game and transitions to SHIP_SELECT');

// Test 3: Keyboard Escape triggers Save & Go Back
startBriefing(1, () => {});
_transitionTarget = null;
_voiceStopped = false;

handleBriefingKey('Escape');
assert.strictEqual(activeBriefing, null, 'Escape should cancel active briefing');
assert.strictEqual(_transitionTarget, SCREENS.SHIP_SELECT, 'Escape should transition to SHIP_SELECT');
console.log('✅ Test 3 Passed: Escape key triggers saveAndReturnFromBriefing');

// Test 4: Keyboard 'b' triggers Save & Go Back
startBriefing(1, () => {});
_transitionTarget = null;

handleBriefingKey('b');
assert.strictEqual(activeBriefing, null, 'Key "b" should cancel active briefing');
assert.strictEqual(_transitionTarget, SCREENS.SHIP_SELECT, '"b" key should transition to SHIP_SELECT');
console.log('✅ Test 4 Passed: "b" hotkey triggers saveAndReturnFromBriefing');

// Test 5: Click Skip button advances straight to mission
completeCalled = false;
startBriefing(1, () => {
    completeCalled = true;
});

handleBriefingClick(700, 25); // Inside Skip button (canvas.width - 189 = 611 to 776)
assert.strictEqual(activeBriefing, null, 'Skip should clear active briefing');
assert.strictEqual(completeCalled, true, 'Skip button should invoke mission launch callback');
console.log('✅ Test 5 Passed: Clicking Skip Briefing button launches mission');

console.log('\nAll 5 briefing navigation tests passed with 100% success!');
