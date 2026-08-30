/**
 * js/cinematics.js — Unified Cinematic Video Engine (GRO-4301)
 * Manages playback, preloading, audio ducking, skip hotkeys, and 
 * high-fidelity procedural canvas fallback for all 20 Bosses and Story cinematics.
 * 
 * Load order: after js/canvas_setup.js, before js/ui.js
 */

const CinematicsEngine = {
    _manifest: null,
    _manifestLoaded: false,
    _isPlaying: false,
    _currentCinematicKey: null,
    _fallbackTimer: 0,
    _fallbackDuration: 4.0,
    _onCompleteCallback: null,
    _cachedVideos: {},

    init() {
        if (typeof window !== 'undefined') {
            window.CinematicsEngine = this;
        }

        // Attempt to load manifest
        if (typeof fetch === 'function') {
            fetch('assets/cinematics/cinematics_manifest.json')
                .then(res => {
                    if (!res.ok) throw new Error('Manifest fetch failed: ' + res.status);
                    return res.json();
                })
                .then(data => {
                    this._manifest = data.cinematics || data;
                    this._manifestLoaded = true;
                    this._preloadKeyCinematics();
                })
                .catch(err => {
                    console.warn('[CinematicsEngine] Running with procedural fallbacks:', err.message);
                });
        }
    },

    _preloadKeyCinematics() {
        if (!this._manifest) return;
        // Pre-create or cache video elements if needed
    },

    getCinematicData(key) {
        if (this._manifest && this._manifest[key]) {
            return this._manifest[key];
        }
        return null;
    },

    getBossCinematicKey(biomeLevel, isMidBoss) {
        return isMidBoss ? `boss_b${biomeLevel}_mid` : `boss_b${biomeLevel}_boss`;
    },

    play(cinematicKey, options = {}) {
        if (this._isPlaying) return;
        this._isPlaying = true;
        this._currentCinematicKey = cinematicKey;
        this._onCompleteCallback = options.onComplete || null;

        const data = this.getCinematicData(cinematicKey) || {
            name: cinematicKey.toUpperCase(),
            superpower: 'Precursor Combat Engagement',
            themeColor: '#00ffff',
            duration: 5.0
        };

        // Duck background music
        if (typeof AudioManager !== 'undefined' && typeof AudioManager.duckMusic === 'function') {
            AudioManager.duckMusic(0.3);
        }

        const videoEl = document.getElementById('boss-intro-video');
        const skipHint = document.getElementById('skip-cinematic-hint');
        if (skipHint) skipHint.style.display = 'block';

        let videoAttemptSuccess = false;
        if (videoEl) {
            const videoPath = (data && data.path) ? data.path : 'assets/cinematics/cinematic_boss_intro.mp4';
            videoEl.src = videoPath;
            videoEl.muted = (typeof masterVolume !== 'undefined' && masterVolume === 0) || (typeof streamerMode !== 'undefined' && streamerMode);
            videoEl.currentTime = 0;
            videoEl.style.display = 'block';
            videoEl.classList.add('active');

            const onEnded = () => {
                this._cleanupVideoListeners(videoEl, onEnded, onError);
                this.stop();
            };

            const onError = () => {
                this._cleanupVideoListeners(videoEl, onEnded, onError);
                videoEl.style.display = 'none';
                videoEl.classList.remove('active');
                this._startProceduralFallback(data);
            };

            videoEl.addEventListener('ended', onEnded);
            videoEl.addEventListener('error', onError);

            const playPromise = videoEl.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    videoAttemptSuccess = true;
                    if (options.onStart) options.onStart();
                }).catch(err => {
                    this._cleanupVideoListeners(videoEl, onEnded, onError);
                    videoEl.style.display = 'none';
                    videoEl.classList.remove('active');
                    this._startProceduralFallback(data);
                });
            }
        } else {
            this._startProceduralFallback(data);
        }
    },

    _cleanupVideoListeners(videoEl, onEnded, onError) {
        if (!videoEl) return;
        videoEl.removeEventListener('ended', onEnded);
        videoEl.removeEventListener('error', onError);
    },

    _startProceduralFallback(data) {
        this._fallbackTimer = data.duration || 4.0;
        this._fallbackDuration = this._fallbackTimer;
    },

    update(dt) {
        if (!this._isPlaying) return;

        if (this._fallbackTimer > 0) {
            this._fallbackTimer -= dt;
            if (this._fallbackTimer <= 0) {
                this.stop();
            }
        }
    },

    draw(ctx, canvasWidth, canvasHeight) {
        if (!this._isPlaying || this._fallbackTimer <= 0) return;

        ctx.save();
        const data = this.getCinematicData(this._currentCinematicKey) || {
            name: 'UNKNOWN ENTITY',
            superpower: 'Precursor Combat Engagement',
            themeColor: '#00ffff'
        };

        const progress = 1.0 - (this._fallbackTimer / this._fallbackDuration);
        const themeColor = data.themeColor || '#00ffff';

        // Deep space / ocean backdrop
        ctx.fillStyle = '#020612';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Radar grid
        if (typeof CockpitUI !== 'undefined') {
            CockpitUI.drawCockpitGrid(ctx, canvasWidth, canvasHeight, progress * 4);
        }

        // Pulsing Warning Header
        const pulse = Math.sin(progress * 15) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 34, 68, ${0.15 + pulse * 0.2})`;
        ctx.fillRect(0, canvasHeight / 2 - 80, canvasWidth, 160);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff2244';
        ctx.font = 'bold 28px monospace';
        ctx.shadowColor = '#ff2244';
        ctx.shadowBlur = 14 * pulse;
        ctx.fillText('⚠️ CRITICAL THREAT DETECTED ⚠️', canvasWidth / 2, canvasHeight / 2 - 40);
        ctx.shadowBlur = 0;

        // Boss Name
        ctx.fillStyle = themeColor;
        ctx.font = 'bold 36px monospace';
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 16;
        ctx.fillText(data.name || 'APEX LEVIATHAN', canvasWidth / 2, canvasHeight / 2 + 6);
        ctx.shadowBlur = 0;

        // Signature Superpower
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`SUPERPOWER // ${data.superpower || 'Omega Singularity'}`, canvasWidth / 2, canvasHeight / 2 + 38);

        // Telemetry Scanline
        ctx.fillStyle = '#88aacc';
        ctx.font = '10.5px monospace';
        ctx.fillText('TARGET LOCK ENGAGED — BATTLE STATIONS READY', canvasWidth / 2, canvasHeight / 2 + 62);

        // Skip prompt
        ctx.fillStyle = '#6a7a9a';
        ctx.font = '10px monospace';
        ctx.fillText('PRESS [SPACE] OR [ESC] TO SKIP CINEMATIC', canvasWidth / 2, canvasHeight - 24);

        ctx.restore();
    },

    skip() {
        if (!this._isPlaying) return;
        this.stop();
    },

    stop() {
        if (!this._isPlaying) return;
        this._isPlaying = false;
        this._fallbackTimer = 0;

        const videoEl = document.getElementById('boss-intro-video');
        if (videoEl) {
            videoEl.pause();
            videoEl.style.display = 'none';
            videoEl.classList.remove('active');
        }

        const skipHint = document.getElementById('skip-cinematic-hint');
        if (skipHint) skipHint.style.display = 'none';

        // Restore background music
        if (typeof AudioManager !== 'undefined' && typeof AudioManager.unduckMusic === 'function') {
            AudioManager.unduckMusic();
        }

        if (this._onCompleteCallback) {
            const cb = this._onCompleteCallback;
            this._onCompleteCallback = null;
            cb();
        }
    },

    isPlaying() {
        return this._isPlaying;
    }
};

// Global registration
if (typeof window !== 'undefined') {
    window.CinematicsEngine = CinematicsEngine;
}
if (typeof global !== 'undefined') {
    global.CinematicsEngine = CinematicsEngine;
}
CinematicsEngine.init();
