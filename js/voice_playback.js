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
        'pull_out': 'level_end',  // fallback: pull_out uses level_end voice pool
        'tunnel_enter': 'briefing_pre_solo',  // fallback
    },

    /**
     * Build a voice file path from biome, trigger, and speaker code.
     * Returns null if no matching file pattern exists.
     */
    _buildPath(biome, trigger, speakerCode) {
        const speaker = this.SPEAKER_MAP[speakerCode];
        if (!speaker) return null;
        
        const voiceTrigger = this.TRIGGER_MAP[trigger];
        if (!voiceTrigger) return null;
        
        // Voice files: b{biome}_{trigger}_{speaker}_{variant}.ogg
        // We'll try variants 01-05 and pick the first that exists
        // To avoid excessive 404s, we pick a random variant 01-03
        const variant = String(Math.floor(Math.random() * 3) + 1).padStart(2, '0');
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
    play(biome, trigger, speakerCode, line) {
        if (!this._isEnabled()) return false;
        if (!biome || !trigger || !speakerCode) return false;
        
        // Stop any currently playing voice
        this.stop();
        
        const path = this._buildPath(biome, trigger, speakerCode);
        if (!path) return false;
        
        // Set active line for subtitle sync
        if (line) {
            this._activeLine = {
                speaker: line.s || line.speaker || speakerCode,
                text: line.l || line.text || '',
            };
        }
        
        this._playFile(path);
        return true;
    },

    /**
     * Play a voice line for a tunnel dialogue event.
     * @param {number} biome — target biome
     * @param {string} speaker — speaker name (e.g., 'Darius', 'Lyra')
     * @param {string} text — dialogue text
     */
    playTunnel(biome, speaker, text) {
        if (!this._isEnabled()) return false;
        
        // Map full speaker name to code
        const speakerMap = {
            'Darius': 'D', 'Lyra': 'L', 'Thorne': 'T', 'Naya': 'N',
            'Cross': 'C', 'Ophion': 'O', 'Selene': 'S',
        };
        const code = speakerMap[speaker] || 'N';
        
        this._activeLine = { speaker, text };
        
        // Use 'briefing_pre_solo' trigger for tunnel dialogue (closest match)
        const path = this._buildPath(biome, 'tunnel_enter', code);
        if (path) {
            this.stop();
            this._playFile(path);
            return true;
        }
        return false;
    },

    /**
     * Internal: load and play an audio file.
     */
    _playFile(path) {
        // Check cache first
        let audio = this._cache[path];
        if (!audio) {
            // Evict LRU if cache is full
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
            
            // Handle load errors gracefully
            audio.addEventListener('error', () => {
                // File not found — try next variant silently
                // Don't spam console; voice files may not exist for all combos
            });
            
            this._cache[path] = audio;
            this._cacheOrder.push(path);
        }
        
        // Move to end of LRU
        const idx = this._cacheOrder.indexOf(path);
        if (idx >= 0) {
            this._cacheOrder.splice(idx, 1);
            this._cacheOrder.push(path);
        }
        
        // Reset and play
        audio.currentTime = 0;
        audio.volume = typeof masterVolume !== 'undefined' ? masterVolume : 0.7;
        
        const playPromise = audio.play();
        if (playPromise) {
            playPromise.catch(() => {
                // Autoplay blocked or other error — silently ignore
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
