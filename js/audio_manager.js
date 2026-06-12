// --- AudioManager: Preloading, Track Switching, Crossfade ---
// GRO-865: Cinematic audio management for Darius Star
// GRO-869: Game state → music track mapping (biome-aware, state-driven)
//
// Handles preloading from audio_manifest.json, game-state-driven track switching,
// and smooth crossfade transitions between cinematic music tracks.
//
// Loaded after audio.js (provides audioCtx, initAudio) and audio_chip.js (chiptune fallback).
// Uses globals: audioCtx, masterVolume, musicVolume, currentScreen, SCREENS,
//               score, biomeLevel, bossSpawned, bossIntroPlaying, bossDefeated,
//               gameOver, gameWon, paused, enemies, player

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
    let _lastBiome = 0;
    let _lastScreen = null;
    let _wasBossActive = false;
    let _wasBossDefeated = false;
    let _wasGameOver = false;
    let _wasGameWon = false;
    let _wasPaused = false;
    let _lowHealthTensionActive = false;
    let _activeGainTarget = 1.0;  // multiplier applied to track gain (1.0 = normal)

    // --- Biome name suffix mapping for victory tracks ---
    const BIOME_SUFFIX = {
        1: 'abyssal', 2: 'coral', 3: 'lair', 4: 'nebula', 5: 'ice',
        6: 'fire', 7: 'storm', 8: 'derelict', 9: 'hive', 10: 'core'
    };

    /**
     * Get current biome number (1-10).
     * Uses LevelManager.currentBiome if available, falls back to biomeLevel global.
     */
    function _getCurrentBiome() {
        if (typeof LevelManager !== 'undefined' && LevelManager.currentBiome) {
            return LevelManager.currentBiome;
        }
        if (typeof biomeLevel !== 'undefined') {
            return biomeLevel;
        }
        return 1;
    }

    /**
     * Check if enemies are nearby / combat is active.
     */
    function _isCombatActive() {
        if (typeof enemies !== 'undefined' && enemies.length > 0) return true;
        return false;
    }

    /**
     * Check if player health is critically low (< 25%).
     */
    function _isLowHealth() {
        if (typeof player === 'undefined' || !player) return false;
        if (typeof player.health === 'undefined' || typeof player.maxHealth === 'undefined') return false;
        if (player.maxHealth <= 0) return false;
        return (player.health / player.maxHealth) < 0.25;
    }

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

    // ====================================================================
    // GRO-869: Game State → Music Track Mapping
    //
    // Cinematic layered intensity system using biome-appropriate tracks.
    // Each game state maps to the best available track for that state.
    //
    // State hierarchy (higher = overrides lower):
    //   1. PAUSED → keep current track, reduce volume
    //   2. GAME OVER → game_over_cinematic (one-shot)
    //   3. VICTORY (gameWon) → victory_b{N}_* (one-shot)
    //   4. CREDITS → victory_cinematic / ending_{type}
    //   5. PLAYING — Boss active → suspense_b{N}_preboss
    //   6. PLAYING — Combat active → suspense_b{N}_preboss
    //   7. PLAYING — Low health tension → reduce gain, switch to suspense if ambient
    //   8. PLAYING — Exploration → biome_b{N}_* (ambient)
    //   9. MENU / non-playing screens → title_cinematic
    // ====================================================================

    /**
     * Get the appropriate track ID for current game state.
     * GRO-869: Rewritten to use cinematic biome-aware tracks.
     *
     * @returns {string|null} track ID to play, null = don't change, false = stop music
     */
    function _getTrackForState() {
        if (!_manifest || !_manifest.tracks) return null;

        // Determine screen state
        if (typeof currentScreen === 'undefined') {
            return _manifest.tracks['title_cinematic'] ? 'title_cinematic' : 'ambient_deep_space';
        }

        // --- CINEMATIC → don't change music ---
        if (currentScreen === SCREENS.CINEMATIC) return null;

        // --- GAME OVER → cinematic game over track (one-shot) ---
        if (typeof gameOver !== 'undefined' && gameOver) {
            if (_manifest.tracks['game_over_cinematic']) return 'game_over_cinematic';
            if (_manifest.tracks['game_over']) return 'game_over';
            return 'game_over_cinematic'; // try to load even if not in manifest
        }

        // --- VICTORY (gameWon or bossDefeated) → biome victory track (one-shot) ---
        if ((typeof gameWon !== 'undefined' && gameWon) ||
            (typeof bossDefeated !== 'undefined' && bossDefeated)) {
            var biome = _getCurrentBiome();
            var suffix = BIOME_SUFFIX[biome] || 'abyssal';
            var victoryId = 'victory_b' + biome + '_' + suffix;
            if (_manifest.tracks[victoryId]) return victoryId;
            // Fallback: generic victory
            if (_manifest.tracks['victory_cinematic']) return 'victory_cinematic';
            if (_manifest.tracks['victory']) return 'victory';
            return 'victory_cinematic';
        }

        // --- CREDITS → victory cinematic ---
        if (currentScreen === SCREENS.CREDITS || currentScreen === SCREENS.LEADERBOARD) {
            if (_manifest.tracks['victory_cinematic']) return 'victory_cinematic';
            if (_manifest.tracks['victory']) return 'victory';
            return 'title_cinematic';
        }

        // --- MENU / non-playing screens → title cinematic ---
        if (currentScreen !== SCREENS.PLAYING) {
            if (_manifest.tracks['title_cinematic']) return 'title_cinematic';
            if (_manifest.tracks['ambient_deep_space']) return 'ambient_deep_space';
            return 'title';
        }

        // --- PLAYING STATE ---
        if (currentScreen === SCREENS.PLAYING) {
            var biome = _getCurrentBiome();

            // Check if boss is active
            var bossActive = false;
            if (typeof bossSpawned !== 'undefined' && bossSpawned) bossActive = true;
            if (typeof bossIntroPlaying !== 'undefined' && bossIntroPlaying) bossActive = true;
            // Also check LevelManager
            if (!bossActive && typeof LevelManager !== 'undefined' &&
                LevelManager.currentLevelConfig &&
                LevelManager.currentLevelConfig.bossTrigger) {
                bossActive = LevelManager.currentLevelConfig.bossTrigger;
            }

            // BOSS ACTIVE → suspense track (most intense)
            if (bossActive) {
                var suspenseId = 'suspense_b' + biome + '_preboss';
                if (_manifest.tracks[suspenseId]) return suspenseId;
                // Fallback: generic boss_loop
                if (_manifest.tracks['boss_loop']) return 'boss_loop';
            }

            // COMBAT ACTIVE → suspense track
            if (_isCombatActive()) {
                var suspenseId = 'suspense_b' + biome + '_preboss';
                if (_manifest.tracks[suspenseId]) return suspenseId;
            }

            // EXPLORATION (no enemies, no boss) → biome ambient
            var ambientId = 'biome_b' + biome + '_' + (BIOME_SUFFIX[biome] || 'abyssal');
            if (_manifest.tracks[ambientId]) return ambientId;

            // Fallback to old phase-based system
            var currentScore = (typeof score !== 'undefined') ? score : 0;
            if (currentScore < 1000) {
                if (_manifest.tracks['phase1']) return 'phase1';
            } else if (currentScore < 2000) {
                if (_manifest.tracks['phase2']) return 'phase2';
            }

            // Ultimate fallback
            if (_manifest.tracks['ambient_deep_space']) return 'ambient_deep_space';
        }

        return null;
    }

    /**
     * Get current gain multiplier based on game state modifiers.
     * GRO-869: Reduces volume for low-health tension and pause.
     */
    function _getGainMultiplier() {
        var mult = 1.0;

        // Low health tension: reduce volume by 25%
        if (_isLowHealth() && typeof currentScreen !== 'undefined' && currentScreen === SCREENS.PLAYING) {
            mult *= 0.75;
        }

        // Pause: reduce volume by 50%
        if (typeof paused !== 'undefined' && paused) {
            mult *= 0.50;
        }

        return mult;
    }

    /**
     * Compute effective volume for a track, accounting for gain modifiers.
     */
    function _getEffectiveVolume() {
        var baseVol = (typeof masterVolume !== 'undefined' ? masterVolume : 0.8) *
                      (typeof musicVolume !== 'undefined' ? musicVolume : 0.6);
        return baseVol * _getGainMultiplier();
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
        var effectiveVol = _getEffectiveVolume();

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
        _activeGains.forEach(function(gn) {
            setTimeout(function() {
                try { gn.disconnect(); } catch(e) {}
            }, (crossfade + 0.1) * 1000);
        });

        // Create new source
        var source = audioCtx.createBufferSource();
        var gain = audioCtx.createGain();
        source.buffer = buffer;
        source.loop = shouldLoop;

        // Fade in
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(effectiveVol, fadeOutEnd);

        source.connect(gain);
        gain.connect(audioCtx.destination);

        source.start(now);

        // Replace active arrays
        _activeSources.push(source);
        _activeGains.push(gain);
        _activeGainTarget = effectiveVol;

        // Cleanup when source ends naturally (non-looping)
        if (!shouldLoop) {
            source.onended = function() {
                var idx = _activeSources.indexOf(source);
                if (idx >= 0) {
                    _activeSources.splice(idx, 1);
                    if (_activeGains[idx]) {
                        _activeGains[idx].disconnect();
                        _activeGains.splice(idx, 1);
                    }
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
        _lowHealthTensionActive = false;
        _activeGainTarget = 1.0;
    }

    /**
     * Crossfade to a new track.
     */
    function crossfadeTo(trackId, duration) {
        play(trackId, duration || CROSSFADE_SEC, undefined);
    }

    /**
     * Tick: called every frame from game loop to handle state-driven music changes.
     * GRO-869: Now handles biome transitions, combat state, boss state, low health,
     * victory, game over, pause, and dynamic gain adjustments.
     */
    function tick() {
        if (!_initialized) return;
        if (!_manifest || !_manifest.tracks) return;

        // Don't change during cinematic
        if (typeof currentScreen !== 'undefined' && currentScreen === SCREENS.CINEMATIC) {
            return;
        }

        var biome = _getCurrentBiome();
        var targetTrack = _getTrackForState();

        // Detect biome transition (crossfade to new biome's ambient)
        var biomeChanged = (_lastBiome > 0 && biome !== _lastBiome);
        if (biomeChanged && typeof currentScreen !== 'undefined' && currentScreen === SCREENS.PLAYING) {
            // On biome change, force crossfade to new biome's ambient
            console.log('[AudioManager] Biome transition:', _lastBiome, '→', biome);
            _lastBiome = biome;
            var suffix = BIOME_SUFFIX[biome] || 'abyssal';
            var ambientId = 'biome_b' + biome + '_' + suffix;
            if (_manifest.tracks[ambientId]) {
                play(ambientId, 1.0, undefined); // longer crossfade for biome transitions
                _wasBossActive = false;
                _wasBossDefeated = false;
                _wasGameOver = false;
                _wasGameWon = false;
                return;
            }
        }

        // Detect boss → defeated transition (switch to victory)
        var bossDefeatedNow = (typeof bossDefeated !== 'undefined' && bossDefeated);
        if (bossDefeatedNow && !_wasBossDefeated) {
            _wasBossDefeated = true;
            // Force immediate switch to victory track
            if (targetTrack && targetTrack !== _currentTrack) {
                play(targetTrack, 0.3, false); // short crossfade, one-shot
                return;
            }
        }

        // Detect game over transition
        var gameOverNow = (typeof gameOver !== 'undefined' && gameOver);
        if (gameOverNow && !_wasGameOver) {
            _wasGameOver = true;
            if (targetTrack && targetTrack !== _currentTrack) {
                play(targetTrack, 0.3, false); // short crossfade, one-shot
                return;
            }
        }

        // Detect game won transition
        var gameWonNow = (typeof gameWon !== 'undefined' && gameWon);
        if (gameWonNow && !_wasGameWon) {
            _wasGameWon = true;
            if (targetTrack && targetTrack !== _currentTrack) {
                play(targetTrack, 0.3, false); // short crossfade, one-shot
                return;
            }
        }

        // Detect boss spawn transition (ambient → suspense)
        var bossActiveNow = false;
        if (typeof bossSpawned !== 'undefined' && bossSpawned) bossActiveNow = true;
        if (typeof bossIntroPlaying !== 'undefined' && bossIntroPlaying) bossActiveNow = true;
        if (!bossActiveNow && typeof LevelManager !== 'undefined' &&
            LevelManager.currentLevelConfig &&
            LevelManager.currentLevelConfig.bossTrigger) {
            bossActiveNow = LevelManager.currentLevelConfig.bossTrigger;
        }
        if (bossActiveNow && !_wasBossActive) {
            _wasBossActive = true;
            if (targetTrack && targetTrack !== _currentTrack) {
                play(targetTrack, 0.4, undefined);
                return;
            }
        } else if (!bossActiveNow && _wasBossActive && !bossDefeatedNow) {
            _wasBossActive = false;
        }

        // Regular track switching
        if (targetTrack && targetTrack !== _currentTrack) {
            play(targetTrack, CROSSFADE_SEC, undefined);
            return;
        }

        // Dynamic gain adjustment (low health tension, pause)
        // Don't do this during active crossfade
        if (!_changingTrack && _activeGains.length > 0) {
            var effectiveVol = _getEffectiveVolume();
            var now = audioCtx ? audioCtx.currentTime : 0;

            // Smooth gain adjustment
            _activeGains.forEach(function(gain) {
                var currentVal = gain.gain.value;
                // Only adjust if difference is significant
                if (Math.abs(currentVal - effectiveVol) > 0.01) {
                    gain.gain.setValueAtTime(currentVal, now);
                    gain.gain.linearRampToValueAtTime(effectiveVol, now + 0.3);
                }
            });
            _activeGainTarget = effectiveVol;
        }

        // Track state for next tick
        _lastBiome = biome;
        _lastScreen = (typeof currentScreen !== 'undefined') ? currentScreen : null;
    }

    /**
     * Set master volume for the AudioManager (handles live gain adjustment).
     */
    function setMusicVolume(vol) {
        // Volume is applied on next track switch and dynamically via tick()
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

    /**
     * Force a music state refresh (e.g., after loading a save).
     */
    function forceRefresh() {
        _lastBiome = 0;
        _wasBossActive = false;
        _wasBossDefeated = false;
        _wasGameOver = false;
        _wasGameWon = false;
        _wasPaused = false;
        _lowHealthTensionActive = false;
        var targetTrack = _getTrackForState();
        if (targetTrack && targetTrack !== _currentTrack) {
            play(targetTrack, CROSSFADE_SEC, undefined);
        }
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
        forceRefresh: forceRefresh,
        isPreloaded: isPreloaded,
        getPreloadedCount: getPreloadedCount,
        getCurrentTrack: function() { return _currentTrack; },
        getManifest: function() { return _manifest; },
        getCurrentBiome: _getCurrentBiome
    };
})();
