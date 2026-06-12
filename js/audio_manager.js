// --- AudioManager: Preloading, Track Switching, Crossfade ---
// GRO-865: Cinematic audio management for Darius Star
// Handles preloading from audio_manifest.json, game-state-driven track switching,
// and smooth crossfade transitions between music tracks.
//
// Loaded after audio.js (provides audioCtx, initAudio) and audio_chip.js (chiptune fallback).
// Uses globals: audioCtx, masterVolume, musicVolume, currentScreen, SCREENS, score

const AudioManager = (function() {
    // --- Internal State ---
    let _manifest = null;
    let _buffers = {};        // trackId → AudioBuffer
    let _currentTrack = null; // currently playing track ID
    let _activeSources = [];  // active BufferSourceNodes for crossfade
    let _activeGains = [];    // active GainNodes for crossfade
    let _initialized = false;
    let _preloadStarted = false;
    let _preloadedCount = 0;
    let _userInteracted = false;
    let _changingTrack = false; // crossfade in progress
    const CROSSFADE_SEC = 0.5;
    const MANIFEST_PATH = 'assets/audio/audio_manifest.json';

    // Track what current game music state is vs what we're playing
    let _pendingTrackId = null;
    let _lastScoreThreshold = 0;
    let _lastScreen = null;
    let _wasBossActive = false;

    // --- Score thresholds for gameplay phases ---
    const PHASE1_MAX = 1000;
    const PHASE2_MAX = 2000;

    /**
     * Initialize: load manifest, mark ready for user-interaction resume.
     * Called automatically on first play() or preload().
     */
    async function _init() {
        if (_initialized) return;
        _initialized = true;

        // Ensure audio context exists
        if (typeof initAudio === 'function') initAudio();

        // Wire up first-interaction resume
        _wireUserInteraction();

        // Load manifest
        try {
            const resp = await fetch(MANIFEST_PATH);
            if (!resp.ok) {
                console.warn('[AudioManager] Manifest fetch failed:', resp.status);
                return;
            }
            _manifest = await resp.json();
            console.log('[AudioManager] Manifest loaded:', Object.keys(_manifest.tracks || {}).length, 'tracks');
        } catch (e) {
            console.warn('[AudioManager] Manifest load error:', e.message);
        }
    }

    /**
     * Wire user-interaction handlers to resume AudioContext.
     * Uses a one-shot event listener pattern.
     */
    function _wireUserInteraction() {
        if (_userInteracted) return;

        const _resume = () => {
            if (!audioCtx) return;
            if (audioCtx.state === 'suspended') {
                try { audioCtx.resume(); } catch(e) {}
            }
            _userInteracted = true;
        };

        // One-shot resume on first meaningful interaction
        const events = ['click', 'keydown', 'touchstart', 'mousedown'];
        function _onFirstInteraction(evt) {
            _resume();
            events.forEach(function(e) {
                document.removeEventListener(e, _onFirstInteraction, true);
            });
        }
        events.forEach(function(e) {
            document.addEventListener(e, _onFirstInteraction, true);
        });
    }

    /**
     * Fetch and decode a single audio file into an AudioBuffer.
     */
    async function _loadBuffer(path) {
        if (!audioCtx) return null;
        try {
            const resp = await fetch(path);
            if (!resp.ok) return null;
            const arrayBuf = await resp.arrayBuffer();
            const audioBuf = await audioCtx.decodeAudioData(arrayBuf);
            return audioBuf;
        } catch (e) {
            console.warn('[AudioManager] Buffer load failed:', path, e.message);
            return null;
        }
    }

    /**
     * Preload a specific track by ID.
     * Returns true if buffer is available after call.
     */
    async function preloadTrack(trackId) {
        await _init();
        if (!_manifest || !_manifest.tracks || !_manifest.tracks[trackId]) {
            console.warn('[AudioManager] Unknown track:', trackId);
            return false;
        }
        if (_buffers[trackId]) return true;

        const track = _manifest.tracks[trackId];
        const buffer = await _loadBuffer(track.path);
        if (buffer) {
            _buffers[trackId] = buffer;
            _preloadedCount++;
            console.log('[AudioManager] Preloaded:', trackId, '(' + (buffer.duration).toFixed(1) + 's)');
            return true;
        }
        return false;
    }

    /**
     * Preload all tracks in the manifest.
     * Returns count of successfully preloaded tracks.
     */
    async function preloadAll() {
        await _init();
        if (!_manifest || !_manifest.tracks) return 0;
        _preloadStarted = true;

        const trackIds = Object.keys(_manifest.tracks);
        console.log('[AudioManager] Preloading ' + trackIds.length + ' tracks...');

        // Load in batches of 4 to avoid overwhelming the browser
        const BATCH_SIZE = 4;
        let loaded = 0;
        for (let i = 0; i < trackIds.length; i += BATCH_SIZE) {
            const batch = trackIds.slice(i, i + BATCH_SIZE);
            const results = await Promise.all(batch.map(function(id) {
                return preloadTrack(id).then(function(ok) { return ok ? 1 : 0; });
            }));
            loaded += results.reduce(function(a, b) { return a + b; }, 0);
        }

        console.log('[AudioManager] Preload complete:', loaded + '/' + trackIds.length + ' tracks loaded');
        return loaded;
    }

    /**
     * Get the appropriate track ID for current game state.
     */
    function _getTrackForState() {
        if (!_manifest || !_manifest.tracks) return null;

        // Determine screen state
        if (typeof currentScreen === 'undefined') return 'ambient_deep_space';

        // CINEMATIC → don't change music, cinematic video has its own audio
        if (currentScreen === SCREENS.CINEMATIC) return null;

        // MENU / SETTINGS / CREDITS → title/ambient music
        if (currentScreen === SCREENS.MENU ||
            currentScreen === SCREENS.SETTINGS ||
            currentScreen === SCREENS.SHIP_SELECT ||
            currentScreen === SCREENS.LEADERBOARD ||
            currentScreen === SCREENS.LOAD_GAME ||
            currentScreen === SCREENS.UPGRADE_SHOP) {
            // Use ambient deep space for menus (if available), fall back to title
            return _manifest.tracks['ambient_deep_space'] ? 'ambient_deep_space' : 'title';
        }

        if (currentScreen === SCREENS.CREDITS) {
            return 'victory';
        }

        // PLAYING → score-threshold-based track selection
        if (currentScreen === SCREENS.PLAYING) {
            var currentScore = (typeof score !== 'undefined') ? score : 0;

            // Check if boss is active (LevelManager)
            var bossActive = false;
            if (typeof LevelManager !== 'undefined' &&
                LevelManager.currentLevelConfig &&
                LevelManager.currentLevelConfig.bossTrigger) {
                bossActive = LevelManager.currentLevelConfig.bossTrigger;
            }

            if (bossActive) {
                // Determine which biome's boss track to play
                var biome = 1;
                if (typeof LevelManager !== 'undefined' && LevelManager.currentBiome) {
                    biome = LevelManager.currentBiome;
                }
                var bossTrackId = 'boss_b' + biome;
                // Map biome numbers to boss track IDs
                var bossTrackMap = {
                    1: 'boss_b1_abyssal', 2: 'boss_b2_coral', 3: 'boss_b3_coelacanth',
                    4: 'boss_b4_nebula', 5: 'boss_b5_ice', 6: 'boss_b6_fire',
                    7: 'boss_b7_storm', 8: 'boss_b8_derelict', 9: 'boss_b9_hive',
                    10: 'boss_b10_core'
                };
                var bossTrack = bossTrackMap[biome] || bossTrackId;
                if (_manifest.tracks[bossTrack]) return bossTrack;
                // Fallback to generic boss loop
                if (_manifest.tracks['boss_loop']) return 'boss_loop';
            }

            // Phase-based music based on score thresholds
            if (currentScore < PHASE1_MAX) {
                return 'phase1';
            } else if (currentScore < PHASE2_MAX) {
                return 'phase2';
            } else {
                // Pre-boss intensity — use suspense track for current biome
                var biome = 1;
                if (typeof LevelManager !== 'undefined' && LevelManager.currentBiome) {
                    biome = LevelManager.currentBiome;
                }
                var suspenseId = 'suspense_b' + biome + '_preboss';
                if (_manifest.tracks[suspenseId]) return suspenseId;
                return 'phase2';
            }
        }

        return null;
    }

    /**
     * Stop all active sources and gains.
     */
    function _stopAll() {
        var now = audioCtx ? audioCtx.currentTime : 0;
        _activeSources.forEach(function(src) {
            try { src.stop(now); } catch(e) {}
        });
        _activeGains.forEach(function(gn) {
            try { gn.disconnect(); } catch(e) {}
        });
        _activeSources = [];
        _activeGains = [];
    }

    /**
     * Play a track by ID. If another track is playing, crossfade.
     * @param {string} trackId - manifest track ID
     * @param {number} crossfade - crossfade duration in seconds (default 0.5)
     * @param {boolean} loop - whether to loop (default uses manifest setting)
     */
    function play(trackId, crossfade, loop) {
        if (!audioCtx) return;
        if (_changingTrack) return;
        if (_currentTrack === trackId && _activeSources.length > 0) return; // already playing

        _changingTrack = true;
        crossfade = (typeof crossfade === 'number') ? crossfade : CROSSFADE_SEC;

        // Preload if not cached
        if (!_buffers[trackId]) {
            preloadTrack(trackId).then(function(ok) {
                if (ok) {
                    _changingTrack = false;
                    play(trackId, crossfade, loop);
                } else {
                    _changingTrack = false;
                }
            });
            return;
        }

        // Determine looping from manifest or override
        var shouldLoop = loop;
        if (typeof shouldLoop === 'undefined' && _manifest && _manifest.tracks && _manifest.tracks[trackId]) {
            shouldLoop = _manifest.tracks[trackId].loop !== false;
        }
        if (typeof shouldLoop === 'undefined') shouldLoop = true;

        var buffer = _buffers[trackId];
        var now = audioCtx.currentTime;

        // Fade out existing sources
        var fadeOutEnd = now + crossfade;
        _activeGains.forEach(function(gain) {
            gain.gain.setValueAtTime(gain.gain.value, now);
            gain.gain.linearRampToValueAtTime(0.0001, fadeOutEnd);
        });

        // Schedule cleanup of old sources
        _activeSources.forEach(function(src) {
            try { src.stop(fadeOutEnd + 0.05); } catch(e) {}
        });

        // Disconnect old gains after they fade out
        var oldGains = _activeGains;
        setTimeout(function() {
            oldGains.forEach(function(gn) {
                try { gn.disconnect(); } catch(e) {}
            });
        }, (crossfade + 0.1) * 1000);

        _activeSources = [];
        _activeGains = [];

        // Create new source
        var source = audioCtx.createBufferSource();
        var gain = audioCtx.createGain();
        source.buffer = buffer;
        source.loop = shouldLoop;

        // Compute volume
        var vol = (typeof masterVolume !== 'undefined' ? masterVolume : 0.8) *
                  (typeof musicVolume !== 'undefined' ? musicVolume : 0.6);

        // Fade in
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(vol, fadeOutEnd);

        source.connect(gain);
        gain.connect(audioCtx.destination);

        source.start(now);

        // Replace active arrays
        _activeSources.push(source);
        _activeGains.push(gain);

        // Cleanup when source ends naturally (non-looping)
        if (!shouldLoop) {
            source.onended = function() {
                var idx = _activeSources.indexOf(source);
                if (idx >= 0) {
                    _activeSources.splice(idx, 1);
                    _activeGains[idx].disconnect();
                    _activeGains.splice(idx, 1);
                }
                if (_currentTrack === trackId) {
                    _currentTrack = null;
                }
            };
        }

        _currentTrack = trackId;
        _changingTrack = false;
    }

    /**
     * Stop all music playback immediately.
     */
    function stop() {
        _stopAll();
        _currentTrack = null;
    }

    /**
     * Crossfade to a new track.
     */
    function crossfadeTo(trackId, duration) {
        play(trackId, duration || CROSSFADE_SEC, undefined);
    }

    /**
     * Tick: called every frame from game loop to handle state-driven music changes.
     * Call this in your game loop's update().
     */
    function tick() {
        if (!_initialized) return;
        if (!_manifest || !_manifest.tracks) return;

        var targetTrack = _getTrackForState();

        // Don't change during cinematic
        if (typeof currentScreen !== 'undefined' && currentScreen === SCREENS.CINEMATIC) {
            return;
        }

        if (targetTrack && targetTrack !== _currentTrack) {
            play(targetTrack, CROSSFADE_SEC, undefined);
        }
    }

    /**
     * Set master volume for the AudioManager (handles live gain adjustment).
     */
    function setMusicVolume(vol) {
        // This is a no-op for preloaded buffers since gain is set on play.
        // The volume is applied on next track switch via the masterVolume/musicVolume globals.
    }

    /**
     * Check if a track is preloaded.
     */
    function isPreloaded(trackId) {
        return !!_buffers[trackId];
    }

    /**
     * Get count of preloaded tracks.
     */
    function getPreloadedCount() {
        return _preloadedCount;
    }

    // --- Public API ---
    return {
        init: _init,
        preloadAll: preloadAll,
        preloadTrack: preloadTrack,
        play: play,
        stop: stop,
        crossfadeTo: crossfadeTo,
        tick: tick,
        isPreloaded: isPreloaded,
        getPreloadedCount: getPreloadedCount,
        getCurrentTrack: function() { return _currentTrack; },
        getManifest: function() { return _manifest; }
    };
})();
