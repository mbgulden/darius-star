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
    _onEndCallbacks: [],

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
                })
                .catch(err => {
                    console.warn('[VoicePipeline] Running with procedural synthesis fallback:', err.message);
                });
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
        const charKey = speaker.toLowerCase();
        let audioFile = null;

        if (this._manifest && this._manifest.lines && lineKey && this._manifest.lines[lineKey]) {
            audioFile = this._manifest.lines[lineKey].file;
        }

        if (audioFile) {
            this._playStudioAudio(audioFile, options);
        } else {
            this._playProceduralFallback(text, speaker, options);
        }
    },

    _playStudioAudio(fileUrl, options) {
        // Duck BGM
        if (typeof AudioManager !== 'undefined' && typeof AudioManager.duckMusic === 'function') {
            AudioManager.duckMusic(0.5);
        }

        const audio = new Audio(`assets/audio/voice/${fileUrl}`);
        audio.volume = typeof sfxVolume !== 'undefined' ? sfxVolume : 0.8;
        this._currentAudio = audio;

        audio.onplay = () => {
            if (options.onStart) options.onStart();
        };

        const handleFinish = () => {
            this._isPlaying = false;
            this._currentAudio = null;
            if (typeof AudioManager !== 'undefined' && typeof AudioManager.unduckMusic === 'function') {
                AudioManager.unduckMusic();
            }
            if (options.onEnd) options.onEnd();
        };

        audio.onended = handleFinish;
        audio.onerror = () => {
            this._playProceduralFallback(options.text || '', this._currentSpeaker, options);
        };

        audio.play().catch(() => {
            this._playProceduralFallback(options.text || '', this._currentSpeaker, options);
        });
    },

    _playProceduralFallback(text, speaker, options) {
        if (typeof VoicePlayback !== 'undefined' && typeof VoicePlayback.speak === 'function') {
            VoicePlayback.speak(text, speaker, {
                onStart: () => {
                    if (options.onStart) options.onStart();
                },
                onEnd: () => {
                    this._isPlaying = false;
                    if (options.onEnd) options.onEnd();
                }
            });
        } else {
            this._isPlaying = false;
            if (options.onStart) options.onStart();
            if (options.onEnd) options.onEnd();
        }
    },

    stop() {
        this._isPlaying = false;
        if (this._currentAudio) {
            try {
                this._currentAudio.pause();
                this._currentAudio.currentTime = 0;
            } catch (e) {}
            this._currentAudio = null;
        }

        if (typeof VoicePlayback !== 'undefined' && typeof VoicePlayback.stop === 'function') {
            VoicePlayback.stop();
        }

        if (typeof AudioManager !== 'undefined' && typeof AudioManager.unduckMusic === 'function') {
            AudioManager.unduckMusic();
        }
    },

    isPlaying() {
        return this._isPlaying || (typeof VoicePlayback !== 'undefined' && VoicePlayback.isPlaying());
    },

    getCurrentAmplitude() {
        if (!this.isPlaying()) return 0;
        // Synthesize dynamic speech amplitude wave
        const t = (typeof gameTime !== 'undefined' ? gameTime : Date.now() / 1000) * 18;
        return (Math.sin(t) * 0.5 + 0.5) * (Math.sin(t * 2.3) * 0.3 + 0.7);
    }
};

if (typeof window !== 'undefined') {
    window.VoicePipeline = VoicePipeline;
}
if (typeof global !== 'undefined') {
    global.VoicePipeline = VoicePipeline;
}
VoicePipeline.init();
