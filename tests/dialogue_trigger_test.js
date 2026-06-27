const assert = require('assert');
const path = require('path');

// Mock browser global environments
global.window = global;
global.runScrap = 100;
global.score = 0;
global.activeBiomeName = '1: Abyssal Trench';
global.player = { weaponLevel: 1, shield: 100, shieldMax: 100, shipType: 'interceptor', takeDamage: function() {} };
global.lives = 3;
global.playSound = function() {};
global.wrapText = function() {};
global.stormActive = false;
global.pathfinderActive = false;
global.setNarrativeFlag = function() {};
global.triggerScreenShake = function() {};
global.startCavernNavigation = function() {};
global.portraitSprites = {
    'lyra_neutral': { complete: true, naturalWidth: 64, src: 'lyra_neutral.png' },
    'thorne_neutral': { complete: true, naturalWidth: 64, src: 'thorne_neutral.png' },
    'darius_neutral': { complete: true, naturalWidth: 64, src: 'darius_neutral.png' }
};
global.ctx = {};
global.canvas = { width: 800, height: 600 };

// Load the dialogue module
require('../js/ui/dialogue.js');
const DialogueSequence = global.DialogueSequence;
const EventBus = global.EventBus;

function testDialogueTriggers() {
    console.log("Running dialogue EventBus and trigger tests...");

    // 1. Verify EventBus exists
    assert.ok(EventBus, "EventBus should be defined");
    assert.strictEqual(typeof EventBus.on, 'function', "EventBus.on should be a function");
    assert.strictEqual(typeof EventBus.emit, 'function', "EventBus.emit should be a function");

    // 2. Initially activeDialogue should be null
    assert.strictEqual(global.activeDialogue, null, "activeDialogue should be null initially");

    // 3. Emit score:changed < 150 (no trigger)
    EventBus.emit('score:changed', 100);
    assert.strictEqual(global.activeDialogue, null, "activeDialogue should remain null for score < 150");

    // 4. Emit score:changed >= 150 (triggers scene1)
    EventBus.emit('score:changed', 150);
    assert.ok(global.activeDialogue, "activeDialogue should be set after score >= 150");
    assert.strictEqual(global.activeDialogue.lines[0].speaker, 'Lyra');
    assert.strictEqual(global.activeDialogue.isBlocking(), true, "scene1 should be blocking");

    // Helper to bypass typewriter typing and advance DialogueSequence
    const advance = (seq) => {
        if (!seq) return;
        seq.charIndex = seq.currentLineText.length;
        seq.next();
    };

    // 5. Complete scene1
    // Line 0: Lyra
    advance(global.activeDialogue); 
    // Line 1: Thorne
    advance(global.activeDialogue);
    // Line 2: Choice (Darius)
    assert.ok(global.activeDialogue.lines[global.activeDialogue.currentLineIndex].choices, "Should have choices on last line");
    assert.strictEqual(global.activeDialogue.isBlocking(), true, "Line with choices must be blocking");
    
    // Choose center (Lyra)
    global.activeDialogue.selectedChoiceIndex = 0;
    advance(global.activeDialogue);
    
    // Outcome sequence starts
    assert.ok(global.activeDialogue, "Outcome dialogue should start");
    assert.strictEqual(global.activeDialogue.lines[0].speaker, 'Darius');
    
    // Drain outcome dialogue
    while (global.activeDialogue !== null) {
        advance(global.activeDialogue);
    }
    assert.strictEqual(global.activeDialogue, null, "Dialogue should finish and clear");

    // 6. Test Non-blocking scene4
    global.dialogueCompletedScenes.scene2 = true;
    global.dialogueCompletedScenes.scene3 = true;
    EventBus.emit('score:changed', 1810);
    assert.ok(global.activeDialogue, "activeDialogue should be set for scene4");
    assert.strictEqual(global.activeDialogue.isBlocking(), false, "scene4 should be non-blocking");

    // Complete scene4
    while (global.activeDialogue !== null) {
        advance(global.activeDialogue);
    }
    assert.strictEqual(global.activeDialogue, null, "scene4 should complete and clear");

    console.log("All dialogue trigger tests passed successfully!");
}

testDialogueTriggers();
