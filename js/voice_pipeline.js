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

        if (this._manifest && this._manifest.lines) {
            if (lineKey && this._manifest.lines[lineKey]) {
                audioFile = this._manifest.lines[lineKey].file;
            } else if (text) {
                // Fuzzy match text if lineId not provided
                const cleanText = text.trim().toLowerCase();
                for (const k in this._manifest.lines) {
                    const item = this._manifest.lines[k];
                    if (item.text && item.text.trim().toLowerCase() === cleanText) {
                        audioFile = item.file;
                        break;
                    }
                }
            }
        }

        // Direct fallback paths for known briefing / combat keys
        if (!audioFile && lineKey && lineKey.startsWith('briefing_')) {
            audioFile = `${charKey}/${lineKey}.mp3`;
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
        if (typeof VoicePlayback !== 'undefined' && typeof VoicePlayback._synthesizeVoiceSpeech === 'function') {
            const speakerMap = {
                'Darius': 'D', 'Lyra': 'L', 'Thorne': 'T', 'Naya': 'N',
                'Cross': 'C', 'Ophion': 'O', 'Selene': 'S', 'Architect': 'A'
            };
            const code = speakerMap[speaker] || (speaker ? speaker[0].toUpperCase() : 'L');
            VoicePlayback.duckBGM(0.65, 0.25);
            VoicePlayback._synthesizeVoiceSpeech(code, text);
            if (options.onStart) options.onStart();
            if (options.onEnd) options.onEnd();
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
