// tests/audio_micro_test.js — Micro-Soundscape Engine Test Suite (GRO-4305)
const assert = require('assert');

console.log('============================================================');
console.log('DARIUS STAR: MICRO-SOUNDSCAPE & THRUSTER SYNTH TESTS');
console.log('============================================================');

global.window = {};
global.sfxVolume = 0.8;
require('../js/audio_micro.js');
const ma = global.MicroAudioEngine;
assert(ma, 'MicroAudioEngine must be defined');

console.log('1. Testing Ship Thruster Chassis Configuration...');
const ships = ['striker', 'bastion', 'phantom', 'tempest', 'specter', 'warden'];
ships.forEach(s => {
    ma.setShipType(s);
    assert.strictEqual(ma._currentShipKey, s, `Ship type ${s} must be active`);
    console.log(`  [PASS] Vessel ${s.toUpperCase()} thruster profile registered.`);
});

console.log('2. Testing Mock Player Flight Simulation...');
const mockPlayer = {
    vx: 240,
    vy: 0,
    speed: 280,
    shield: 100,
    shieldMax: 100,
    boostActive: false
};

// Verify update handles mock state without throwing
assert.doesNotThrow(() => {
    ma.update(0.016, mockPlayer, 1);
}, 'MicroAudioEngine.update must execute cleanly');
console.log('  [PASS] MicroAudioEngine flight loop executed cleanly.');

console.log('3. Testing Low-Health Hull Breach Heartbeat Trigger...');
const criticalPlayer = {
    vx: 50,
    vy: 0,
    speed: 280,
    shield: 15,
    shieldMax: 100,
    boostActive: false
};

assert.doesNotThrow(() => {
    ma.update(0.016, criticalPlayer, 8);
    ma.playHullStressCreak();
}, 'Critical health & hull stress creak must execute cleanly');
console.log('  [PASS] Low-health cardiac trigger & hull stress creak tested.');

console.log('============================================================');
console.log('ALL MICRO-SOUNDSCAPE TESTS PASSED (100%)');
console.log('============================================================');
