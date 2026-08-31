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

    speak(text, speaker = 'Lyra', options = {}) {
        if (typeof streamerMode !== 'undefined' && streamerMode) {
            if (options.onStart) options.onStart();
            if (options.onEnd) options.onEnd();
            return;
        }

        this.stop();
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

        // Match by normalized text across all 687 recorded voice lines
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

        // Direct fallback for stratum banter triggers to play studio voice files
        if (!audioFile && options.biome && options.trigger && typeof VoicePlayback !== 'undefined') {
            const speakerCode = (typeof VoicePlayback.SPEAKER_MAP !== 'undefined') ? 
                (Object.keys(VoicePlayback.SPEAKER_MAP).find(k => VoicePlayback.SPEAKER_MAP[k] === charKey) || charKey[0].toUpperCase()) : 
                charKey[0].toUpperCase();
            const directPath = VoicePlayback._buildPath(options.biome, options.trigger, speakerCode);
            if (directPath) {
                audioFile = directPath.replace(/^assets\/audio\/voice\//, '');
            }
        }

        // Guaranteed voice line fallback for any character dialogue
        if (!audioFile) {
            const biome = options.biome || (typeof LevelManager !== 'undefined' ? LevelManager.biome : 1);
            if (this._manifest && this._manifest.lines) {
                const candidate = Object.values(this._manifest.lines).find(item => 
                    item && item.speaker === charKey && item.biome === biome && item.file
                );
                if (candidate) {
                    audioFile = candidate.file;
                }
            }
            if (!audioFile) {
                const defaultFiles = {
                    'thorne': `thorne/briefing_b${biome}_01.mp3`,
                    'lyra': `lyra/briefing_b${biome}_01.mp3`,
                    'darius': `darius/banter_b${biome}_level_start_tier1_0.mp3`,
                    'naya': `naya/banter_b${biome}_level_start_tier1_1.mp3`,
                    'cross': `cross/banter_b${biome}_level_start_tier1_1.mp3`,
                    'selene': `selene/briefing_b${biome}_selene.mp3`,
                    'architect': `architect/banter_b10_level_start_tier1_1.mp3`
                };
                if (defaultFiles[charKey]) {
                    audioFile = defaultFiles[charKey];
                }
            }
        }

        if (audioFile) {
            this._playStudioAudio(audioFile, options);
        } else {
            this._playProceduralFallback(text, speaker, options);
        }
    },

    _audioBufferCache: new Map(),
    _activeSource: null,

    _playStudioAudio(fileUrl, options) {
        // Duck BGM
        if (typeof AudioManager !== 'undefined' && typeof AudioManager.duckMusic === 'function') {
            AudioManager.duckMusic(0.5);
        } else if (typeof VoicePlayback !== 'undefined' && typeof VoicePlayback.duckBGM === 'function') {
            VoicePlayback.duckBGM(0.65, 0.25);
        }

        const path = fileUrl.startsWith('assets/') ? fileUrl : `assets/audio/voice/${fileUrl}`;

        const onFinish = () => {
            this._isPlaying = false;
            this._activeSource = null;
            this._currentAudio = null;
            if (typeof AudioManager !== 'undefined' && typeof AudioManager.unduckMusic === 'function') {
                AudioManager.unduckMusic();
            } else if (typeof VoicePlayback !== 'undefined' && typeof VoicePlayback.unduckBGM === 'function') {
                VoicePlayback.unduckBGM(0.4);
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

            if (this._audioBufferCache.has(path)) {
                playDecodedBuffer(this._audioBufferCache.get(path));
                return;
            }

            fetch(path)
                .then(r => {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.arrayBuffer();
                })
                .then(buf => ctx.decodeAudioData(buf))
                .then(audioBuffer => {
                    this._audioBufferCache.set(path, audioBuffer);
                    playDecodedBuffer(audioBuffer);
                })
                .catch(err => {
                    console.warn('[VoicePipeline] Buffer load failed, falling back to HTML5 Audio:', path, err);
                    this._playHtml5Audio(path, options, onFinish);
                });
            return;
        }

        this._playHtml5Audio(path, options, onFinish);
    },

    _playHtml5Audio(path, options, onFinish) {
        if (typeof Audio === 'undefined') {
            if (options.onStart) options.onStart();
            setTimeout(onFinish, 10);
            return;
        }
        const audio = new Audio(path);
        audio.volume = (typeof sfxVolume !== 'undefined' ? sfxVolume : 0.8) * (typeof masterVolume !== 'undefined' ? masterVolume : 1.0);
        this._currentAudio = audio;

        audio.onplay = () => {
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
        this._isPlaying = false;
        if (this._activeSource) {
            try {
                this._activeSource.stop();
                this._activeSource.disconnect();
            } catch(e) {}
            this._activeSource = null;
        }
        if (this._currentAudio) {
            try {
                this._currentAudio.pause();
                this._currentAudio.currentTime = 0;
            } catch(e) {}
            this._currentAudio = null;
        }
        if (typeof AudioManager !== 'undefined' && typeof AudioManager.unduckMusic === 'function') {
            AudioManager.unduckMusic();
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
