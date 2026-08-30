/**
 * js/audio_micro.js — Micro-Soundscape & Dynamic Vessel Thruster Acoustic Engine (GRO-4305)
 * Synthesizes unique continuous ship thruster hums, depth hydrophone ambient resonance, 
 * hull stress creaks, and low-health muffled cardiac filter via Web Audio API.
 * 
 * Load order: after js/audio.js, before js/audio_manager.js
 */

const MicroAudioEngine = {
    _ctx: null,
    _enabled: true,
    _masterGain: null,
    
    // Thruster Synth Nodes
    _thrusterOsc1: null,
    _thrusterOsc2: null,
    _thrusterGain: null,
    _thrusterFilter: null,
    _currentShipKey: 'striker',

    // Hydrophone Depth Noise Nodes
    _depthGain: null,
    _depthFilter: null,
    _depthNoiseSource: null,

    // Low-Health Muffle Biquad Filter
    _muffleFilter: null,
    _heartbeatTimer: 0,

    init() {
        if (typeof window !== 'undefined') {
            window.MicroAudioEngine = this;
        }
    },

    _ensureAudioContext() {
        if (this._ctx && this._ctx.state === 'running') return true;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return false;
            
            if (!this._ctx) {
                this._ctx = new AudioContextClass();
            }
            if (this._ctx.state === 'suspended') {
                this._ctx.resume();
            }

            if (!this._masterGain) {
                this._masterGain = this._ctx.createGain();
                this._masterGain.gain.setValueAtTime(0.6, this._ctx.currentTime);
                this._masterGain.connect(this._ctx.destination);
                this._setupThrusterSynth();
                this._setupDepthHydrophone();
            }
            return true;
        } catch (e) {
            console.warn('[MicroAudioEngine] Audio context init deferred:', e.message);
            return false;
        }
    },

    _setupThrusterSynth() {
        if (!this._ctx || !this._masterGain) return;

        this._thrusterGain = this._ctx.createGain();
        this._thrusterGain.gain.setValueAtTime(0.0, this._ctx.currentTime);

        this._thrusterFilter = this._ctx.createBiquadFilter();
        this._thrusterFilter.type = 'lowpass';
        this._thrusterFilter.frequency.setValueAtTime(600, this._ctx.currentTime);

        this._thrusterOsc1 = this._ctx.createOscillator();
        this._thrusterOsc1.type = 'sawtooth';
        this._thrusterOsc1.frequency.setValueAtTime(140, this._ctx.currentTime);

        this._thrusterOsc2 = this._ctx.createOscillator();
        this._thrusterOsc2.type = 'sine';
        this._thrusterOsc2.frequency.setValueAtTime(70, this._ctx.currentTime);

        this._thrusterOsc1.connect(this._thrusterFilter);
        this._thrusterOsc2.connect(this._thrusterFilter);
        this._thrusterFilter.connect(this._thrusterGain);
        this._thrusterGain.connect(this._masterGain);

        try {
            this._thrusterOsc1.start();
            this._thrusterOsc2.start();
        } catch (e) {}
    },

    _setupDepthHydrophone() {
        if (!this._ctx || !this._masterGain) return;

        // White noise buffer for water pressure simulation
        const bufferSize = this._ctx.sampleRate * 2;
        const noiseBuffer = this._ctx.createBuffer(1, bufferSize, this._ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        this._depthNoiseSource = this._ctx.createBufferSource();
        this._depthNoiseSource.buffer = noiseBuffer;
        this._depthNoiseSource.loop = true;

        this._depthFilter = this._ctx.createBiquadFilter();
        this._depthFilter.type = 'bandpass';
        this._depthFilter.frequency.setValueAtTime(180, this._ctx.currentTime);
        this._depthFilter.Q.setValueAtTime(3.0, this._ctx.currentTime);

        this._depthGain = this._ctx.createGain();
        this._depthGain.gain.setValueAtTime(0.04, this._ctx.currentTime);

        this._depthNoiseSource.connect(this._depthFilter);
        this._depthFilter.connect(this._depthGain);
        this._depthGain.connect(this._masterGain);

        try {
            this._depthNoiseSource.start();
        } catch (e) {}
    },

    setShipType(shipKey) {
        this._currentShipKey = (shipKey || 'striker').toLowerCase();
    },

    update(dt, player, biomeLevel) {
        if (!this._enabled || !this._ensureAudioContext() || !player) return;

        const t = this._ctx.currentTime;
        const speedRatio = Math.min(1.0, Math.hypot(player.vx || 0, player.vy || 0) / (player.speed || 300));
        const isBoosting = player.boostActive || false;

        // Dynamic Ship Frequencies
        const shipFreqs = {
            striker: { base1: 220, base2: 110, filter: 800, gain: 0.05 },
            bastion: { base1: 75,  base2: 45,  filter: 350, gain: 0.09 },
            phantom: { base1: 180, base2: 90,  filter: 500, gain: 0.04 },
            tempest: { base1: 280, base2: 140, filter: 950, gain: 0.06 },
            specter: { base1: 160, base2: 82,  filter: 600, gain: 0.05 },
            warden:  { base1: 120, base2: 60,  filter: 450, gain: 0.07 }
        };

        const cfg = shipFreqs[this._currentShipKey] || shipFreqs.striker;
        const pitchShift = isBoosting ? 1.4 : (1.0 + speedRatio * 0.35);

        if (this._thrusterOsc1 && this._thrusterOsc2) {
            this._thrusterOsc1.frequency.setTargetAtTime(cfg.base1 * pitchShift, t, 0.05);
            this._thrusterOsc2.frequency.setTargetAtTime(cfg.base2 * pitchShift, t, 0.05);
            this._thrusterFilter.frequency.setTargetAtTime(cfg.filter * (isBoosting ? 1.6 : 1.0), t, 0.05);
            
            const targetGain = cfg.gain * (typeof sfxVolume !== 'undefined' ? sfxVolume : 0.8) * (0.4 + speedRatio * 0.6);
            this._thrusterGain.gain.setTargetAtTime(targetGain, t, 0.05);
        }

        // Depth hydrophone resonance scaling with biome level
        if (this._depthFilter) {
            const depthFreq = Math.max(60, 240 - (biomeLevel || 1) * 16);
            this._depthFilter.frequency.setTargetAtTime(depthFreq, t, 0.1);
        }

        // Low-Health Cardiac Heartbeat Pulse
        const hpPercent = player.shield / player.shieldMax;
        if (hpPercent < 0.25) {
            this._heartbeatTimer += dt * 3.5;
            if (this._heartbeatTimer > Math.PI * 2) {
                this._heartbeatTimer -= Math.PI * 2;
                this._triggerHeartbeatThump();
            }
        }
    },

    _triggerHeartbeatThump() {
        if (!this._ctx || !this._masterGain) return;
        try {
            const osc = this._ctx.createOscillator();
            const gain = this._ctx.createGain();
            const t = this._ctx.currentTime;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(80, t);
            osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);

            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

            osc.connect(gain);
            gain.connect(this._masterGain);

            osc.start(t);
            osc.stop(t + 0.16);
        } catch (e) {}
    },

    playHullStressCreak() {
        if (!this._ctx || !this._masterGain) return;
        try {
            const osc = this._ctx.createOscillator();
            const gain = this._ctx.createGain();
            const t = this._ctx.currentTime;

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(95, t);
            osc.frequency.linearRampToValueAtTime(145, t + 0.25);
            osc.frequency.linearRampToValueAtTime(80, t + 0.5);

            gain.gain.setValueAtTime(0.04, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

            osc.connect(gain);
            gain.connect(this._masterGain);

            osc.start(t);
            osc.stop(t + 0.56);
        } catch (e) {}
    }
};

if (typeof window !== 'undefined') {
    window.MicroAudioEngine = MicroAudioEngine;
}
if (typeof global !== 'undefined') {
    global.MicroAudioEngine = MicroAudioEngine;
}
MicroAudioEngine.init();
