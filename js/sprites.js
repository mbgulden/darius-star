// sprites.js — Player, Portrait, Enemy, VFX, and Boss sprite loading functions
// Extracted from index.html by Ned (GRO-1097)

        // --- Player Sprite Preloading ---
        const playerSprites = {};
        let playerSpritesLoaded = false;

        function loadPlayerSprites() {
            if (playerSpritesLoaded) return;
            playerSpritesLoaded = true;
            const frames = [
                'player_0', 'player_1',
                'player_phantom_0', 'player_phantom_1',
                'player_bastion_0', 'player_bastion_1',
                'player_tempest_0', 'player_tempest_1',
                'player_specter_0', 'player_specter_1',
                'player_warden_0', 'player_warden_1',
                'scout_0', 'interceptor_0', 'heavy_0'
            ];
            frames.forEach(key => {
                playerSprites[key] = new Image();
                playerSprites[key].src = `assets/sprites/${key}.png`;
            });
        }

        // --- Character Portrait Preloading ---
        const portraitSprites = {};
        let portraitSpritesLoaded = false;

        function loadPortraitSprites() {
            if (portraitSpritesLoaded) return;
            portraitSpritesLoaded = true;
            const characters = [
                'lyra_neutral', 'lyra_reactive',
                'darius_neutral', 'darius_reactive',
                'naya_neutral', 'naya_reactive',
                'thorne_neutral', 'thorne_reactive',
                'cross_neutral', 'cross_reactive'
            ];
            characters.forEach(char => {
                portraitSprites[char] = new Image();
                portraitSprites[char].src = `assets/sprites/portraits/${char}.png`;
            });
            portraitSprites['comms_overlay'] = new Image();
            portraitSprites['comms_overlay'].src = 'assets/sprites/portraits/comms_overlay.png';
        }

        // --- Enemy Sprite Preloading ---
        const enemySprites = {};
        let enemySpritesLoaded = false;

        function loadEnemySprites() {
            if (enemySpritesLoaded) return;
            enemySpritesLoaded = true;
            const types = ['scout', 'interceptor', 'heavy', 'boss_minion'];
            types.forEach(key => {
                const img = new Image();
                img.onload = function() { enemySprites[key] = preCompositeAdditive(img); };
                img.onerror = function() { enemySprites[key] = null; };
                img.src = `assets/sprites/${key}_0.png`;
            });
        }

        // --- VFX Sprite Preloading ---
        const vfxSprites = {};
        let vfxSpritesLoaded = false;

        function loadVFXSprites() {
            if (vfxSpritesLoaded) return;
            vfxSpritesLoaded = true;

            const _loadVFX = (key, src) => {
                const img = new Image();
                img.onload = function() { vfxSprites[key] = preCompositeAdditive(img); };
                img.onerror = function() { vfxSprites[key] = null; };
                img.src = src;
            };

            _loadVFX('laser', 'assets/sprites/player_bullet.png');
            _loadVFX('laser_enemy', 'assets/sprites/enemy_bullet.png');
            _loadVFX('laser_glow', 'assets/sprites/laser_0_glow.png');
            for (let f = 0; f < 4; f++) {
                _loadVFX('explosion_' + f, `assets/sprites/explosion_${f}.png`);
            }
            _loadVFX('shield', 'assets/sprites/shield_0.png');
            _loadVFX('thruster_0', 'assets/sprites/thruster_0.png');
            _loadVFX('thruster_1', 'assets/sprites/thruster_1.png');
        }

        // --- GRO-1141: Pre-composite additive sprites ---
        // Strips near-black pixels from VFX/enemy sprites so the main loop
        // can use source-over (fast) instead of 'lighter' (slow GPU readback).
        // Returns an offscreen canvas with transparent background.
        function preCompositeAdditive(image) {
            try {
                const w = image.naturalWidth || image.width || 0;
                const h = image.naturalHeight || image.height || 0;
                if (w === 0 || h === 0) return image;
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);
                const imageData = ctx.getImageData(0, 0, w, h);
                const pixels = imageData.data;
                // Make near-black pixels transparent (< 15 on all channels)
                for (let i = 0; i < pixels.length; i += 4) {
                    if (pixels[i] < 15 && pixels[i+1] < 15 && pixels[i+2] < 15) {
                        pixels[i+3] = 0;
                    }
                }
                ctx.putImageData(imageData, 0, 0);
                return canvas;
            } catch (_) {
                return image; // fallback on cross-origin or other errors
            }
        }

// Track which sprites have been pre-composited
const _preCompositeCache = new Set();

        // --- Boss Asset Lazy-Loading ---
        // Boss sprites are preloaded when score nears 2,000-point trigger
        const bossSprites = {};
        let bossAssetsLoading = false;
        let bossAssetsLoaded = false;
        let bossLoadProgress = 0;  // 0-100

        function preloadBossAssets() {
            if (bossAssetsLoading || bossAssetsLoaded) return;
            bossAssetsLoading = true;
            bossLoadProgress = 0;

            const toLoad = [
                { key: 'boss',              src: 'assets/sprites/boss_0.png' },
                { key: 'boss_idle',         src: 'assets/sprites/boss_0.png' },
                { key: 'boss_rage',         src: 'assets/sprites/boss_1.png' },
                { key: 'boss_laser_charge', src: 'assets/sprites/boss_2.png' },
                { key: 'boss_laser_fire',   src: 'assets/sprites/boss_3.png' },
                { key: 'boss_death',        src: 'assets/sprites/boss_0.png' },
                { key: 'bossMinion',        src: 'assets/sprites/boss_minion_0.png' }
            ];
            let loadedCount = 0;
            const total = toLoad.length;

            toLoad.forEach(({key, src}) => {
                const img = new Image();
                img.onload = () => {
                    // Pre-composite on load for faster main-loop draws
                    bossSprites[key] = preCompositeAdditive(img);
                    loadedCount++;
                    bossLoadProgress = Math.round((loadedCount / total) * 100);
                    if (loadedCount >= total) {
                        bossAssetsLoaded = true;
                        bossAssetsLoading = false;
                    }
                };
                img.onerror = () => {
                    // Graceful fallback: mark done even on error
                    loadedCount++;
                    bossLoadProgress = Math.round((loadedCount / total) * 100);
                    if (loadedCount >= total) {
                        bossAssetsLoaded = true;
                        bossAssetsLoading = false;
                    }
                };
                img.src = src;
                bossSprites[key] = img;
            });
        }

