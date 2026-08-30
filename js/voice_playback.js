/**
 * Darius Star — Voice Playback Module (GRO-940)
 * Lazy-loads and plays voice lines from assets/audio/voice/.
 * Wires into BanterEngine, AudioTunnel, and DialogueSequence.
 * Respects streamerMode and audioTunnelsEnabled.
 *
 * Load order: after audio.js, before ui/dialogue.js
 */

const VoicePlayback = {
    // --- State ---
    _cache: {},           // url → Audio element
    _activeAudio: null,   // currently playing Audio
    _activeLine: null,    // {speaker, text} for subtitle sync
    _maxCache: 30,        // max cached Audio elements (LRU eviction)
    _cacheOrder: [],      // LRU tracking
    
    // --- Speaker code → voice file speaker name ---
    SPEAKER_MAP: {
        'D': 'darius',
        'L': 'lyra',
        'T': 'thorne',
        'N': 'naya',
        'C': 'cross',
        'O': 'ophion',
        'S': 'selene',
        'A': 'architect',
        'U': 'unknown',
        'System': 'unknown',
    },

    // --- Trigger name normalization (BanterEngine → voice file trigger) ---
    TRIGGER_MAP: {
        'level_start': 'level_start',
        'unique_enemy': 'unique_enemy',
        'boss_entrance': 'boss_entrance',
        'player_death': 'player_death',
        'player_respawn': 'player_respawn',
        'low_health': 'low_health',
        'wave_clear': 'wave_clear',
        'level_end': 'level_end',
        'pull_out': 'retreat',      // GRO-4101: mapped to synthesized retreat files
        'squad_save': 'squad_save',
        'tunnel_enter': 'briefing_pre_solo',  // fallback
    },

    _lastPlayTime: 0,
    DUCKING_COOLDOWN_MS: 300, // 0.3s debounce between rapid voice lines

    /**
     * Build a voice file path from biome, trigger, and speaker code.
     * Returns null if no matching file pattern exists.
     */
    _buildPath(biome, trigger, speakerCode) {
        const speaker = this.SPEAKER_MAP[speakerCode];
        if (!speaker) return null;
        
        const voiceTrigger = this.TRIGGER_MAP[trigger] || trigger;
        
        // Voice files: b{biome}_{trigger}_{speaker}_{variant}.ogg
        // Try exact variant 01, or fallback to random 01-03
        const variant = String(Math.floor(Math.random() * 2) + 1).padStart(2, '0');
        return `assets/audio/voice/b${biome}_${voiceTrigger}_${speaker}_${variant}.ogg`;
    },

    /**
     * Check if voice playback is allowed.
     */
    _isEnabled() {
        if (typeof streamerMode !== 'undefined' && streamerMode) return false;
        if (typeof audioTunnelsEnabled !== 'undefined' && !audioTunnelsEnabled) return false;
        return true;
    },

    /**
     * Play a voice line. Called by BanterEngine, AudioTunnel, or DialogueSequence.
     * @param {number} biome — current biome (1-10)
     * @param {string} trigger — event trigger (e.g., 'level_start', 'boss_entrance')
     * @param {string} speakerCode — BanterEngine speaker code ('D', 'L', 'T', 'N', ...)
     * @param {object} line — {speaker, text} for subtitle display
     * @returns {boolean} true if playback started
     */
    /**
     * Play a voice line. Called by BanterEngine, AudioTunnel, or DialogueSequence.
     * @param {number} biome — current biome (1-10)
     * @param {string} trigger — event trigger (e.g., 'level_start', 'boss_entrance')
     * @param {string} speakerCode — BanterEngine speaker code ('D', 'L', 'T', 'N', ...)
     * @param {object} line — {speaker, text} for subtitle display
     * @returns {boolean} true if playback started
     */
    play(biome, trigger, speakerCode, line) {
        if (!this._isEnabled()) return false;
        if (!biome || !trigger || !speakerCode) return false;
        
        const now = Date.now();
        if (now - this._lastPlayTime < this.DUCKING_COOLDOWN_MS) {
            return false;
        }
        this._lastPlayTime = now;

        // Stop any currently playing voice
        this.stop();
        
        const path = this._buildPath(biome, trigger, speakerCode);
        
        // Set active line for subtitle sync
        if (line) {
            this._activeLine = {
                speaker: line.s || line.speaker || speakerCode,
                text: line.l || line.text || '',
            };
        }

        // Trigger real-time BGM ducking (-35% / 0.65x) during character speech
        this.duckBGM(0.65, 0.25);
        
        if (path) {
            this._playFile(path, speakerCode, line ? (line.l || line.text) : '');
        } else {
            this._synthesizeVoiceSpeech(speakerCode, line ? (line.l || line.text) : '');
        }
        return true;
    },

    /**
     * Speak arbitrary character dialogue line with dynamic voice & BGM ducking (GRO-4208).
     * @param {string} speaker — character name ('Darius', 'Lyra', etc.) or code ('D', 'L')
     * @param {string} text — spoken dialogue text
     */
    speak(speaker, text) {
        if (!this._isEnabled()) return false;
        this.stop();
        
        const speakerMap = {
            'Darius': 'D', 'Lyra': 'L', 'Thorne': 'T', 'Naya': 'N',
            'Cross': 'C', 'Ophion': 'O', 'Selene': 'S', 'Architect': 'A',
            'D': 'D', 'L': 'L', 'T': 'T', 'N': 'N', 'C': 'C', 'O': 'O', 'S': 'S', 'A': 'A'
        };
        const code = speakerMap[speaker] || 'L';
        this._activeLine = { speaker: speaker || 'Lyra', text: text || '' };

        // Duck BGM during active voice
        this.duckBGM(0.65, 0.25);
        this._synthesizeVoiceSpeech(code, text);
        return true;
    },

    /**
     * Duck BGM volume via AudioManager (GRO-4208).
     */
    duckBGM(multiplier = 0.65, fadeTime = 0.25) {
        if (typeof AudioManager !== 'undefined' && AudioManager && typeof AudioManager.duckMusic === 'function') {
            AudioManager.duckMusic(multiplier, fadeTime);
        }
    },

    /**
     * Restore BGM volume via AudioManager (GRO-4208).
     */
    unduckBGM(fadeTime = 0.4) {
        if (typeof AudioManager !== 'undefined' && AudioManager && typeof AudioManager.unduckMusic === 'function') {
            AudioManager.unduckMusic(fadeTime);
        }
    },

    /**
     * Procedural synthesized voice speech generator for character radio chatter.
     */
    _synthesizeVoiceSpeech(speakerCode, text) {
        if (typeof audioCtx === 'undefined' || !audioCtx) return;
        
        const voicePresets = {
            'D': { freq: 135, type: 'sawtooth', filter: 800, q: 3.5 }, // Darius: low gravelly
            'L': { freq: 440, type: 'sine', filter: 1800, q: 2.0 },     // Lyra: high crystalline
            'N': { freq: 280, type: 'triangle', filter: 1200, q: 3.0 }, // Naya: sharp melodic
            'T': { freq: 110, type: 'sawtooth', filter: 650, q: 4.0 },  // Thorne: deep gruff
            'C': { freq: 210, type: 'square', filter: 1000, q: 5.0 },   // Cross: robotic vocoder
            'S': { freq: 580, type: 'sine', filter: 2200, q: 1.5 },     // Selene: ethereal
            'A': { freq: 85, type: 'sawtooth', filter: 500, q: 6.0 },   // Architect: deep sub-bass
            'O': { freq: 95, type: 'sawtooth', filter: 550, q: 5.5 },   // Ophion: AI synthesis
        };
        
        const code = this.SPEAKER_MAP[speakerCode] ? speakerCode : (speakerCode ? speakerCode[0].toUpperCase() : 'L');
        const preset = voicePresets[code] || voicePresets['L'];
        
        const now = audioCtx.currentTime;
        const dur = Math.min(2.5, Math.max(0.8, (text ? text.length : 20) * 0.035));
        
        try {
            const osc = audioCtx.createOscillator();
            const filter = audioCtx.createBiquadFilter();
            const gain = audioCtx.createGain();
            
            osc.type = preset.type;
            osc.frequency.setValueAtTime(preset.freq, now);
            osc.frequency.linearRampToValueAtTime(preset.freq * 1.08, now + dur * 0.3);
            osc.frequency.linearRampToValueAtTime(preset.freq * 0.94, now + dur * 0.7);
            osc.frequency.linearRampToValueAtTime(preset.freq, now + dur);
            
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(preset.filter, now);
            filter.Q.setValueAtTime(preset.q, now);
            
            const baseVol = (typeof masterVolume !== 'undefined' ? masterVolume : 0.8) * 0.12;
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(baseVol, now + 0.04);
            
            const pulseCount = Math.min(8, Math.max(3, Math.floor(dur * 4)));
            for (let i = 1; i < pulseCount; i++) {
                const pTime = now + (i / pulseCount) * dur;
                gain.gain.setValueAtTime(baseVol * 0.4, pTime - 0.02);
                gain.gain.setValueAtTime(baseVol, pTime);
            }
            gain.gain.linearRampToValueAtTime(0.0001, now + dur);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(now);
            osc.stop(now + dur);
            
            this._synthActive = true;
            setTimeout(() => {
                this._synthActive = false;
                if (!this.isPlaying()) {
                    this.unduckBGM(0.4);
                }
            }, dur * 1000);
        } catch(e) {
            // Silently handle audio context errors
        }
    },

    /**
     * Play a voice line for a tunnel dialogue event.
     * @param {number} biome — target biome
     * @param {string} speaker — speaker name (e.g., 'Darius', 'Lyra')
     * @param {string} text — dialogue text
     */
    playTunnel(biome, speaker, text) {
        if (!this._isEnabled()) return false;
        
        const speakerMap = {
            'Darius': 'D', 'Lyra': 'L', 'Thorne': 'T', 'Naya': 'N',
            'Cross': 'C', 'Ophion': 'O', 'Selene': 'S',
        };
        const code = speakerMap[speaker] || 'N';
        
        this._activeLine = { speaker, text };
        this.duckBGM(0.65, 0.25);
        
        const path = this._buildPath(biome, 'tunnel_enter', code);
        if (path) {
            this.stop();
            this._playFile(path, code, text);
            return true;
        } else {
            this._synthesizeVoiceSpeech(code, text);
            return true;
        }
    },

    /**
     * Internal: load and play an audio file.
     */
    _playFile(path, speakerCode = 'L', text = '') {
        // Check cache first
        let audio = this._cache[path];
        if (!audio) {
            while (this._cacheOrder.length >= this._maxCache) {
                const oldPath = this._cacheOrder.shift();
                if (this._cache[oldPath]) {
                    this._cache[oldPath].src = '';
                    this._cache[oldPath].load();
                    delete this._cache[oldPath];
                }
            }
            
            audio = new Audio();
            audio.preload = 'auto';
            audio.src = path;
            
            audio.addEventListener('error', () => {
                // If audio file is missing on disk, fallback to procedural radio synth
                this._synthesizeVoiceSpeech(speakerCode, text);
            });

            audio.addEventListener('ended', () => {
                this.unduckBGM(0.4);
            });
            
            this._cache[path] = audio;
            this._cacheOrder.push(path);
        }
        
        const idx = this._cacheOrder.indexOf(path);
        if (idx >= 0) {
            this._cacheOrder.splice(idx, 1);
            this._cacheOrder.push(path);
        }
        
        audio.currentTime = 0;
        audio.volume = typeof masterVolume !== 'undefined' ? masterVolume : 0.7;
        
        const playPromise = audio.play();
        if (playPromise) {
            playPromise.catch(() => {
                // If autoplay blocked or error, fallback to procedural speech synth
                this._synthesizeVoiceSpeech(speakerCode, text);
            });
        }
        
        this._activeAudio = audio;
    },

    /**
     * Stop current voice playback.
     */
    stop() {
        if (this._activeAudio) {
            try {
                this._activeAudio.pause();
                this._activeAudio.currentTime = 0;
            } catch (e) { /* ignore */ }
            this._activeAudio = null;
        }
        this._activeLine = null;
        this.unduckBGM(0.4);
    },

    /**
     * Get current active line for subtitle rendering.
     * @returns {object|null} {speaker, text} or null
     */
    getActiveLine() {
        return this._activeLine;
    },

    /**
     * Check if voice is currently playing.
     * @returns {boolean}
     */
    isPlaying() {
        return this._activeAudio !== null && !this._activeAudio.paused;
    },

    /**
     * Preload a batch of voice files for a biome.
     * Call during tunnel transitions for smoother playback.
     * @param {number} biome — biome to preload voices for
     */
    preloadBiome(biome) {
        if (!this._isEnabled()) return;
        
        const triggers = ['level_start', 'boss_entrance', 'player_death', 'wave_clear', 'level_end'];
        const speakers = ['darius', 'lyra', 'thorne', 'naya', 'cross', 'ophion'];
        
        triggers.forEach(trigger => {
            speakers.forEach(speaker => {
                const path = `assets/audio/voice/b${biome}_${trigger}_${speaker}_01.ogg`;
                if (!this._cache[path]) {
                    const audio = new Audio();
                    audio.preload = 'auto';
                    audio.src = path;
                    audio.volume = 0;
                    this._cache[path] = audio;
                    this._cacheOrder.push(path);
                    
                    // LRU eviction
                    while (this._cacheOrder.length > this._maxCache) {
                        const oldPath = this._cacheOrder.shift();
                        if (this._cache[oldPath]) {
                            this._cache[oldPath].src = '';
                            delete this._cache[oldPath];
                        }
                    }
                }
            });
        });
    },
};

// Attach to window for browser access
window.VoicePlayback = VoicePlayback;
