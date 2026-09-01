/**
 * tests/menu_noise_and_sfx_ducking_test.js
 * Verification of low menu interaction audio levels and dynamic battle SFX ducking with easing curves.
 */

const assert = require('assert');

// Mock Web Audio API
class MockAudioParam {
    constructor(val = 1.0) {
        this.value = val;
        this.targetCalls = [];
        this.valueAtTimeCalls = [];
        this.rampCalls = [];
    }
    setValueAtTime(v, t) {
        this.value = v;
        this.valueAtTimeCalls.push({ v, t });
    }
    setTargetAtTime(target, startTime, timeConstant) {
        this.value = target;
        this.targetCalls.push({ target, startTime, timeConstant });
    }
    linearRampToValueAtTime(v, t) {
        this.value = v;
        this.rampCalls.push({ type: 'linear', v, t });
    }
    exponentialRampToValueAtTime(v, t) {
        this.value = v;
        this.rampCalls.push({ type: 'exponential', v, t });
    }
    cancelScheduledValues(t) {}
}

class MockAudioNode {
    constructor() {
        this.connections = [];
    }
    connect(dest) {
        this.connections.push(dest);
        return dest;
    }
    disconnect() {
        this.connections = [];
    }
}

class MockGainNode extends MockAudioNode {
    constructor() {
        super();
        this.gain = new MockAudioParam(1.0);
    }
}

class MockOscillatorNode extends MockAudioNode {
    constructor() {
        super();
        this.frequency = new MockAudioParam(440);
        this.type = 'sine';
    }
    start(t) {}
    stop(t) {}
}

class MockBiquadFilterNode extends MockAudioNode {
    constructor() {
        super();
        this.frequency = new MockAudioParam(1000);
        this.Q = new MockAudioParam(1);
        this.type = 'lowpass';
    }
}

class MockBufferSourceNode extends MockAudioNode {
    constructor() {
        super();
        this.buffer = null;
    }
    start(t) {}
    stop(t) {}
}

class MockAudioContext {
    constructor() {
        this.currentTime = 10.0;
        this.sampleRate = 44100;
        this.state = 'running';
        this.destination = new MockAudioNode();
    }
    createGain() { return new MockGainNode(); }
    createOscillator() { return new MockOscillatorNode(); }
    createBiquadFilter() { return new MockBiquadFilterNode(); }
    createBufferSource() { return new MockBufferSourceNode(); }
    createDynamicsCompressor() {
        return {
            threshold: new MockAudioParam(-1),
            knee: new MockAudioParam(12),
            ratio: new MockAudioParam(20),
            attack: new MockAudioParam(0.003),
            release: new MockAudioParam(0.25),
            connect: () => {}
        };
    }
    createBuffer(channels, length, sampleRate) {
        return {
            getChannelData: () => new Float32Array(length)
        };
    }
    resume() { return Promise.resolve(); }
}

global.AudioNode = MockAudioNode;
global.window = global;
global.audioCtx = new MockAudioContext();
global.masterVolume = 0.8;
global.sfxVolume = 0.8;
global.musicVolume = 0.8;

// Load audio.js, audio_manager.js, voice_pipeline.js, voice_playback.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const audioCode = fs.readFileSync(path.join(__dirname, '../js/audio.js'), 'utf8');
vm.runInThisContext(audioCode);
audioCtx = new MockAudioContext();

console.log('--- TEST SUITE: MENU NOISE & BATTLE SFX EASING DUCKING ---');

// Test 1: Verify calibrated UI sound gains vs Combat sound gains
assert(SFX_SAMPLE_VOL['menu_click'] <= 0.10, `menu_click sample gain should be <= 0.10, was ${SFX_SAMPLE_VOL['menu_click']}`);
assert(SFX_SAMPLE_VOL['menu_select'] <= 0.08, `menu_select sample gain should be <= 0.08, was ${SFX_SAMPLE_VOL['menu_select']}`);
assert(SFX_SAMPLE_VOL['ui_hover'] <= 0.05, `ui_hover sample gain should be <= 0.05, was ${SFX_SAMPLE_VOL['ui_hover']}`);
assert(SFX_SAMPLE_VOL['explosion'] >= 0.40, `combat explosion sample gain should be substantial (>= 0.40), was ${SFX_SAMPLE_VOL['explosion']}`);
console.log('✅ Test 1 Passed: UI sample volumes are calibrated to subtle non-intrusive levels.');

// Test 2: Verify getSfxDestination routing (UI -> direct destination, Combat SFX -> sfxMasterGain)
const uiDest = getSfxDestination(true);
const combatDest = getSfxDestination(false);
assert.strictEqual(uiDest, audioCtx.destination, 'UI sounds should route directly to audioCtx.destination');
assert.notStrictEqual(combatDest, audioCtx.destination, 'Combat SFX should route through sfxMasterGain bus');
console.log('✅ Test 2 Passed: Dedicated SFX master bus correctly isolates combat sound routing.');

// Test 3: Verify duckSFX applies smooth exponential easing curve (setTargetAtTime)
duckSFX(0.35, 0.35);
assert.strictEqual(sfxDuckingMultiplier, 0.35, 'sfxDuckingMultiplier should be 0.35');
const lastTargetCall = combatDest.gain.targetCalls[combatDest.gain.targetCalls.length - 1];
assert(lastTargetCall, 'duckSFX should have called setTargetAtTime on master gain');
assert.strictEqual(lastTargetCall.target, 0.35, 'Target ducking volume should be 0.35');
assert(lastTargetCall.timeConstant > 0, 'Time constant should be positive for natural easing');
console.log('✅ Test 3 Passed: duckSFX applies smooth exponential easing curve to battle SFX.');

// Test 4: Verify unduckSFX restores SFX volume on easing curve
unduckSFX(0.55);
assert.strictEqual(sfxDuckingMultiplier, 1.0, 'sfxDuckingMultiplier should be restored to 1.0');
const restoreTargetCall = combatDest.gain.targetCalls[combatDest.gain.targetCalls.length - 1];
assert.strictEqual(restoreTargetCall.target, 1.0, 'unduckSFX target should be 1.0');
console.log('✅ Test 4 Passed: unduckSFX smoothly restores battle SFX volume with fluid easing curve.');

// Test 5: Verify AudioManager and VoicePipeline integration with ducking
const audioMgrCode = fs.readFileSync(path.join(__dirname, '../js/audio_manager.js'), 'utf8');
vm.runInThisContext(audioMgrCode);
const voicePipeCode = fs.readFileSync(path.join(__dirname, '../js/voice_pipeline.js'), 'utf8');
vm.runInThisContext(voicePipeCode);

// Trigger studio audio playback ducking
VoicePipeline._playStudioAudio('test.ogg', {}, 1);
assert.strictEqual(sfxDuckingMultiplier, 0.35, 'VoicePipeline speaking should duck SFX');
assert(AudioManager.isDucked(), 'AudioManager BGM should be ducked');

// Stop voice line
VoicePipeline.stop();
assert.strictEqual(sfxDuckingMultiplier, 1.0, 'VoicePipeline stop should unduck SFX');
assert(!AudioManager.isDucked(), 'AudioManager BGM should be unducked');
console.log('✅ Test 5 Passed: Comms chatter speaking and stopping smoothly coordinates BGM and SFX ducking.');

console.log('\nAll 5 Menu Noise & Battle SFX Easing Ducking tests passed (100%)!');
