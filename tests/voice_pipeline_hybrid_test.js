// tests/voice_pipeline_hybrid_test.js — Hybrid Voice Pipeline Test Suite (GRO-4302)
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('============================================================');
console.log('DARIUS STAR: HYBRID VOICE PIPELINE & MANIFEST TESTS');
console.log('============================================================');

// 1. Validate Voice Manifest
const manifestPath = path.resolve(__dirname, '../assets/audio/voice_manifest.json');
assert(fs.existsSync(manifestPath), 'voice_manifest.json must exist');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log('1. Testing Voice Manifest Characters...');
const expectedCharacters = ['darius', 'lyra', 'thorne', 'naya', 'cross', 'selene', 'architect'];
expectedCharacters.forEach(char => {
    assert(manifest.characters[char], `Character ${char} must exist in manifest`);
    assert(manifest.characters[char].pitchHz > 0, `Character ${char} must have valid pitchHz`);
    assert(manifest.characters[char].motionPortraits, `Character ${char} must have motionPortraits defined`);
    assert(manifest.characters[char].motionPortraits.neutral, `Character ${char} must have neutral motion portrait`);
    console.log(`  [PASS] Character ${manifest.characters[char].name} (${char}): ${manifest.characters[char].pitchHz}Hz — ${manifest.characters[char].style}`);
});

// 2. Test VoicePipeline in Mock Window
global.window = {};
global.streamerMode = false;
global.sfxVolume = 0.8;
global.gameTime = 10.0;

// Mock VoicePlayback
global.VoicePlayback = {
    _playing: false,
    speak(text, speaker, opts) {
        this._playing = true;
        if (opts.onStart) opts.onStart();
        setTimeout(() => {
            this._playing = false;
            if (opts.onEnd) opts.onEnd();
        }, 10);
    },
    stop() { this._playing = false; },
    isPlaying() { return this._playing; }
};

// Mock AudioManager
global.AudioManager = {
    duckMusic(ratio) {},
    unduckMusic() {}
};

require('../js/voice_pipeline.js');
const vp = global.VoicePipeline;
assert(vp, 'VoicePipeline must be defined');

console.log('2. Testing Hybrid Voice Fallback & Speech Lifecycle...');
let started = false;
let ended = false;

vp.speak("Hold fast, Star. Deep trench ahead.", "Thorne", {
    onStart: () => { started = true; },
    onEnd: () => { ended = true; }
});

assert(started, 'onStart callback must fire');
setTimeout(() => {
    assert(ended, 'onEnd callback must fire');
    assert.strictEqual(vp.isPlaying(), false, 'VoicePipeline must be idle after playback');
    console.log('  [PASS] VoicePipeline speech lifecycle completed cleanly.');

    console.log('3. Testing Amplitude Lip-Sync Calculation...');
    const amp = vp.getCurrentAmplitude();
    assert(typeof amp === 'number', 'Amplitude must be a number');
    console.log(`  [PASS] Dynamic amplitude calculated: ${amp.toFixed(3)}`);

    console.log('============================================================');
    console.log('ALL HYBRID VOICE PIPELINE TESTS PASSED (100%)');
    console.log('============================================================');
}, 25);
