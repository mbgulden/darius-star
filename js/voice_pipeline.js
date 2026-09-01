/**
 * js/voice_pipeline.js — Hybrid Studio Voice Acting & Motion Portrait Pipeline (GRO-4302)
 * Seamlessly manages studio voice playback with Google Lyria/Omni assets, 
 * real-time BGM ducking, dynamic amplitude lip-syncing, and automatic graceful 
 * fallback to procedural Web Audio formant synthesis (VoicePlayback).
 * 
 * Load order: after js/voice_playback.js, before js/ui/dialogue.js
 */

const VoicePipeline = {
    _manifest: null,
    _manifestLoaded: false,
    _currentAudio: null,
    _isPlaying: false,
    _currentSpeaker: null,
    _currentMood: 'neutral',
    _audioContext: null,
    _analyzerNode: null,
    _currentAmplitude: 0,
    _normalizedLineMap: null,

    _normalizeText(str) {
        if (!str) return '';
        return str.toLowerCase().replace(/[^a-z0-9]/g, '');
    },

    init() {
        if (typeof window !== 'undefined') {
            window.VoicePipeline = this;
        }

        if (typeof fetch === 'function') {
            fetch('assets/audio/voice_manifest.json')
                .then(res => {
                    if (!res.ok) throw new Error('Voice manifest status: ' + res.status);
                    return res.json();
                })
                .then(data => {
                    this._manifest = data;
                    this._manifestLoaded = true;
                    this._buildNormalizedIndex();
                })
                .catch(err => {
                    console.warn('[VoicePipeline] Running with procedural synthesis fallback:', err.message);
                });
        }
    },

    _buildNormalizedIndex() {
        this._normalizedLineMap = new Map();
        if (this._manifest && this._manifest.lines) {
            for (const k in this._manifest.lines) {
                const item = this._manifest.lines[k];
                if (item && item.text && item.file) {
                    this._normalizedLineMap.set(this._normalizeText(item.text), item.file);
                }
            }
        }
    },

    getCharacterConfig(speaker) {
        if (!speaker) return null;
        const key = speaker.toLowerCase();
        if (this._manifest && this._manifest.characters && this._manifest.characters[key]) {
            return this._manifest.characters[key];
        }
        return null;
    },

    getMotionPortraitUrl(speaker, mood = 'neutral') {
        const charCfg = this.getCharacterConfig(speaker);
        if (charCfg && charCfg.motionPortraits && charCfg.motionPortraits[mood]) {
            return charCfg.motionPortraits[mood];
        }
        return null;
    },

    _audioBufferCache: new Map(),
    _maxCacheSize: 40,
    _activeSource: null,
    _currentRequestId: 0,

    _setCachedBuffer(path, audioBuffer) {
        if (this._audioBufferCache.has(path)) {
            this._audioBufferCache.delete(path);
        } else if (this._audioBufferCache.size >= this._maxCacheSize) {
            const oldestKey = this._audioBufferCache.keys().next().value;
            if (oldestKey) this._audioBufferCache.delete(oldestKey);
        }
        this._audioBufferCache.set(path, audioBuffer);
    },

    _getCachedBuffer(path) {
        if (!this._audioBufferCache.has(path)) return null;
        const buffer = this._audioBufferCache.get(path);
        this._audioBufferCache.delete(path);
        this._audioBufferCache.set(path, buffer);
        return buffer;
    },

    speak(text, speaker = 'Lyra', options = {}) {
        if (typeof streamerMode !== 'undefined' && streamerMode) {
            if (options.onStart) options.onStart();
            if (options.onEnd) options.onEnd();
            return;
        }

        this.stop();
        const reqId = ++this._currentRequestId;
        this._isPlaying = true;
        this._currentSpeaker = speaker;
        this._currentMood = options.mood || 'neutral';

        // Check if voice line file exists in manifest
        const lineKey = options.lineId;
        const charKey = (speaker || 'lyra').toLowerCase();
        let audioFile = null;

        if (this._manifest && this._manifest.lines) {
            if (lineKey && this._manifest.lines[lineKey]) {
                audioFile = this._manifest.lines[lineKey].file;
            }
        }

        // Match by normalized text across all recorded voice lines
        if (!audioFile && text && this._normalizedLineMap) {
            const norm = this._normalizeText(text);
            if (this._normalizedLineMap.has(norm)) {
                audioFile = this._normalizedLineMap.get(norm);
            }
        }

        // Direct fallback paths for known briefing / combat keys
        if (!audioFile && lineKey && lineKey.startsWith('briefing_')) {
            audioFile = `${charKey}/${lineKey}.mp3`;
        }

        if (audioFile) {
            this._playStudioAudio(audioFile, options, reqId);
        } else {
            this._playProceduralFallback(text, speaker, options);
        }
    },

    _playStudioAudio(fileUrl, options, reqId) {
        // Duck BGM and Battle SFX on smooth natural easing curves
        if (typeof AudioManager !== 'undefined' && typeof AudioManager.duckMusic === 'function') {
            AudioManager.duckMusic(0.45, 0.35);
        } else if (typeof VoicePlayback !== 'undefined' && typeof VoicePlayback.duckBGM === 'function') {
            VoicePlayback.duckBGM(0.45, 0.35);
        }
        if (typeof duckSFX === 'function') {
            duckSFX(0.35, 0.35);
        }

        const path = fileUrl.startsWith('assets/') ? fileUrl : `assets/audio/voice/${fileUrl}`;

        const onFinish = () => {
            if (reqId && reqId !== this._currentRequestId) return;
            this._isPlaying = false;
            this._activeSource = null;
            this._currentAudio = null;
            if (typeof AudioManager !== 'undefined' && typeof AudioManager.unduckMusic === 'function') {
                AudioManager.unduckMusic(0.55);
            } else if (typeof VoicePlayback !== 'undefined' && typeof VoicePlayback.unduckBGM === 'function') {
                VoicePlayback.unduckBGM(0.55);
            }
            if (typeof unduckSFX === 'function') {
                unduckSFX(0.55);
            }
            if (options.onEnd) options.onEnd();
        };

        // Try playing via Web Audio API audioCtx (guaranteed unlocked and volume-controlled)
        const ctx = (typeof audioCtx !== 'undefined' && audioCtx) ? audioCtx : this._audioContext;
        if (ctx && ctx.state !== 'closed') {
            if (ctx.state === 'suspended') {
                try { ctx.resume(); } catch(e) {}
            }

            const playDecodedBuffer = (buffer) => {
                if (reqId && reqId !== this._currentRequestId) return false;
                try {
                    const source = ctx.createBufferSource();
                    source.buffer = buffer;
                    const gain = ctx.createGain();
                    const vol = (typeof sfxVolume !== 'undefined' ? sfxVolume : 0.8) * (typeof masterVolume !== 'undefined' ? masterVolume : 1.0);
                    gain.gain.setValueAtTime(vol, ctx.currentTime);
                    source.connect(gain);
                    gain.connect(ctx.destination);
                    
                    source.onended = onFinish;
                    source.start(0);
                    this._activeSource = source;
                    if (options.onStart) options.onStart();
                    return true;
                } catch(err) {
                    console.warn('[VoicePipeline] Web Audio buffer source start failed:', err);
                    return false;
                }
            };

            const cached = this._getCachedBuffer(path);
            if (cached) {
                playDecodedBuffer(cached);
                return;
            }

            fetch(path)
                .then(r => {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.arrayBuffer();
                })
                .then(buf => ctx.decodeAudioData(buf))
                .then(audioBuffer => {
                    if (reqId && reqId !== this._currentRequestId) return;
                    this._setCachedBuffer(path, audioBuffer);
                    playDecodedBuffer(audioBuffer);
                })
                .catch(err => {
                    if (reqId && reqId !== this._currentRequestId) return;
                    // Gracefully fallback to procedural synthesis or finish without crashing
                    if (this._isPlaying) {
                        this._playProceduralFallback(options.text || '', options.speaker || this._currentSpeaker, options);
                    } else {
                        onFinish();
                    }
                });
            return;
        }

        this._playHtml5Audio(path, options, onFinish, reqId);
    },

    _playHtml5Audio(path, options, onFinish, reqId) {
        if (reqId && reqId !== this._currentRequestId) return;
        if (typeof Audio === 'undefined') {
            if (options.onStart) options.onStart();
            setTimeout(onFinish, 10);
            return;
        }
        const audio = new Audio(path);
        audio.volume = (typeof sfxVolume !== 'undefined' ? sfxVolume : 0.8) * (typeof masterVolume !== 'undefined' ? masterVolume : 1.0);
        this._currentAudio = audio;

        audio.onplay = () => {
            if (reqId && reqId !== this._currentRequestId) {
                try { audio.pause(); } catch(e) {}
                return;
            }
            if (options.onStart) options.onStart();
        };

        audio.onended = onFinish;
        audio.onerror = (e) => {
            console.log('[VoicePipeline] Audio element error:', path, e);
            onFinish();
        };

        audio.play().catch(err => {
            console.log('[VoicePipeline] Audio autoplay prevented:', path, err);
            onFinish();
        });
    },

    _playProceduralFallback(text, speaker, options) {
        if (typeof playSound === 'function') {
            try { playSound('ui_select'); } catch(e) {}
        }
        this._isPlaying = false;
        if (options.onStart) options.onStart();
        if (options.onEnd) options.onEnd();
    },

    stop() {
        this._currentRequestId++;
        this._isPlaying = false;
        if (this._activeSource) {
            try {
                this._activeSource.onended = null;
                this._activeSource.stop();
                this._activeSource.disconnect();
            } catch(e) {}
            this._activeSource = null;
        }
        if (this._currentAudio) {
            try {
                this._currentAudio.onended = null;
                this._currentAudio.pause();
                this._currentAudio.currentTime = 0;
            } catch(e) {}
            this._currentAudio = null;
        }
        if (typeof AudioManager !== 'undefined' && typeof AudioManager.unduckMusic === 'function') {
            AudioManager.unduckMusic(0.55);
        } else if (typeof VoicePlayback !== 'undefined' && typeof VoicePlayback.unduckBGM === 'function') {
            VoicePlayback.unduckBGM(0.55);
        }
        if (typeof unduckSFX === 'function') {
            unduckSFX(0.55);
        }
    },

    isPlaying() {
        return this._isPlaying;
    },

    getCurrentSpeaker() {
        return this._currentSpeaker;
    },

    getCurrentMood() {
        return this._currentMood;
    },

    getCurrentAmplitude() {
        return this._isPlaying ? 0.8 : 0;
    }
};

if (typeof window !== 'undefined') {
    window.VoicePipeline = VoicePipeline;
    VoicePipeline.init();
}
if (typeof global !== 'undefined') {
    global.VoicePipeline = VoicePipeline;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VoicePipeline };
}
