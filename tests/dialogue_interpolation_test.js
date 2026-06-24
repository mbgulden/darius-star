const assert = require('assert');
const path = require('path');

// Mock browser global environments
global.window = global;
global.runScrap = 350;
global.score = 5000;
global.activeBiomeName = '3: Coelacanth Lair';
global.player = { weaponLevel: 3, shield: 75, shieldMax: 120, shipType: 'guardian' };
global.lives = 2;
global.playSound = function() {};
global.wrapText = function() {};
global.stormActive = false;
global.portraitSprites = {};
global.ctx = {};
global.canvas = { width: 800, height: 600 };

// Load the dialogue module
require('../js/ui/dialogue.js');
const DialogueSequence = global.DialogueSequence;

function testDialogueInterpolation() {
    console.log("Running dialogue interpolation tests...");

    // Test Case 1: Simple runScrap substitution
    const lines1 = [
        { speaker: 'Lyra', text: "Daddy, you've collected {scrap} scrap!" }
    ];
    const seq1 = new DialogueSequence(lines1);
    assert.strictEqual(seq1.currentLineText, "Daddy, you've collected 350 scrap!");

    // Test Case 2: Double curly brace and multiple variables
    const lines2 = [
        { speaker: 'Lyra', text: "We have {{runScrap}} scrap and a score of {score} in {biome}." }
    ];
    const seq2 = new DialogueSequence(lines2);
    assert.strictEqual(seq2.currentLineText, "We have 350 scrap and a score of 5000 in 3: Coelacanth Lair.");

    // Test Case 3: Player ship type and weapon level
    const lines3 = [
        { speaker: 'Thorne', text: "Your {ship} ship has weapon level {weaponLevel}." }
    ];
    const seq3 = new DialogueSequence(lines3);
    assert.strictEqual(seq3.currentLineText, "Your guardian ship has weapon level 3.");

    // Test Case 4: Player shield and lives
    const lines4 = [
        { speaker: 'System', text: "Shields at {shield}/{shieldMax}. Lives remaining: {lives}." }
    ];
    const seq4 = new DialogueSequence(lines4);
    assert.strictEqual(seq4.currentLineText, "Shields at 75/120. Lives remaining: 2.");

    // Test Case 5: Undefined variable fallback (should keep original placeholder)
    const lines5 = [
        { speaker: 'Lyra', text: "This {nonexistentVar} doesn't exist." }
    ];
    const seq5 = new DialogueSequence(lines5);
    assert.strictEqual(seq5.currentLineText, "This {nonexistentVar} doesn't exist.");

    // Test Case 6: Choice interpolation
    const lines6 = [
        {
            speaker: 'Lyra',
            text: "Ready to upgrade?",
            choices: [
                { text: "Yes ({scrap} scrap remaining)", value: "yes" },
                { text: "No ({lives} lives left)", value: "no" }
            ]
        }
    ];
    const seq6 = new DialogueSequence(lines6);
    assert.strictEqual(seq6.interpolate(lines6[0].choices[0].text), "Yes (350 scrap remaining)");
    assert.strictEqual(seq6.interpolate(lines6[0].choices[1].text), "No (2 lives left)");

    // Test Case 7: Double brace interpolation with spaces and formatting
    const lines7 = [
        { speaker: 'Lyra', text: "Weapon is level {{weaponLevel}}." }
    ];
    const seq7 = new DialogueSequence(lines7);
    assert.strictEqual(seq7.currentLineText, "Weapon is level 3.");

    console.log("All dialogue interpolation tests passed successfully!");
}

testDialogueInterpolation();
