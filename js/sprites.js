// sprites.js ??? Player, Portrait, Enemy, VFX, and Boss sprite loading functions
// Extracted from index.html by Ned (GRO-1097)

        // --- Player Sprite Preloading ---
        const playerSprites = {};
        let playerSpritesLoaded = false;

        function loadPlayerSprites() {
            if (playerSpritesLoaded) return;
            playerSpritesLoaded = true;
            console.log("[SPRITE] Starting preloading of player sprites...");
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
                playerSprites[key].onload = () => console.log(`[SPRITE] Successfully loaded player sprite: ${key}`);
                playerSprites[key].onerror = () => console.error(`[SPRITE] [ERROR] Failed to load player sprite: ${key}`);
                playerSprites[key].src = `assets/sprites/${key}.png`;
            });
        }

        // --- Character Portrait Preloading ---
        const portraitSprites = {};
        let portraitSpritesLoaded = false;

        function loadPortraitSprites() {
            if (portraitSpritesLoaded) return;
            portraitSpritesLoaded = true;
            console.log("[SPRITE] Starting preloading of character portrait sprites...");
            const characters = [
                'lyra_neutral', 'lyra_reactive',
                'darius_neutral', 'darius_reactive',
                'naya_neutral', 'naya_reactive',
                'thorne_neutral', 'thorne_reactive',
                'cross_neutral', 'cross_reactive'
            ];
            characters.forEach(char => {
                portraitSprites[char] = new Image();
                portraitSprites[char].onload = () => console.log(`[SPRITE] Successfully loaded portrait: ${char}`);
                portraitSprites[char].onerror = () => console.error(`[SPRITE] [ERROR] Failed to load portrait: ${char}`);
                portraitSprites[char].src = `assets/sprites/portraits/${char}.png`;
            });
            portraitSprites['comms_overlay'] = new Image();
            portraitSprites['comms_overlay'].onload = () => console.log("[SPRITE] Successfully loaded comms_overlay");
            portraitSprites['comms_overlay'].onerror = () => console.error("[SPRITE] [ERROR] Failed to load comms_overlay");
            portraitSprites['comms_overlay'].src = 'assets/sprites/portraits/comms_overlay.png';
        }

        // --- Enemy Sprite Preloading ---
        const enemySprites = {};
        let enemySpritesLoaded = false;

        function loadEnemySprites() {
            if (enemySpritesLoaded) return;
            enemySpritesLoaded = true;
            console.log("[SPRITE] Starting preloading of enemy sprites...");
            
            // Generic fallback enemy types
            const types = ['scout', 'interceptor', 'heavy', 'boss_minion'];
            types.forEach(key => {
                const img = new Image();
                img.onload = function() { 
                    enemySprites[key] = preCompositeAdditive(img); 
                    console.log(`[SPRITE] Successfully loaded fallback enemy: ${key}`);
                };
                img.onerror = function() { 
                    enemySprites[key] = null; 
                    console.error(`[SPRITE] [ERROR] Failed to load fallback enemy: ${key}`);
                };
                img.src = `assets/sprites/${key}_0.png`;
            });

            // Map custom biome-specific enemy sprites directly to the spawned enemy types.
            // Other biomes are left undefined so they fallback to generic scout/interceptor/heavy.
            const customBiomeEnemies = [
                { key: 'angler_scout', src: 'assets/sprites/enemy_b1_crawler_0.png' },
                { key: 'rust_drone',   src: 'assets/sprites/enemy_b2_wraith_0.png' },
                { key: 'sparker',      src: 'assets/sprites/enemy_b3_spider_0.png' },
                { key: 'plasma_wisp',  src: 'assets/sprites/enemy_b4_wisp_0.png' },
                { key: 'storm_sprite', src: 'assets/sprites/enemy_b4_rider_0.png' },
                { key: 'gas_giant',    src: 'assets/sprites/enemy_b4_serpent_0.png' },
                { key: 'crawler',      src: 'assets/sprites/enemy_crawler_0.png' },
                { key: 'spitter',      src: 'assets/sprites/enemy_spitter_0.png' },
                { key: 'brute',        src: 'assets/sprites/enemy_brute_0.png' }
            ];

            customBiomeEnemies.forEach(({key, src}) => {
                const img = new Image();
                img.onload = function() { 
                    enemySprites[key] = preCompositeAdditive(img); 
                    console.log(`[SPRITE] Successfully loaded custom biome enemy: ${key} (${src})`);
                };
                img.onerror = function() { 
                    enemySprites[key] = null; 
                    console.error(`[SPRITE] [ERROR] Failed to load custom biome enemy: ${key} (${src})`);
                };
                img.src = src;
            });
        }

        // --- VFX Sprite Preloading ---
        const vfxSprites = {};
        let vfxSpritesLoaded = false;

        function loadVFXSprites() {
            if (vfxSpritesLoaded) return;
            vfxSpritesLoaded = true;
            console.log("[SPRITE] Starting preloading of VFX sprites...");

            const _loadVFX = (key, src) => {
                const img = new Image();
                img.onload = function() { 
                    vfxSprites[key] = preCompositeAdditive(img); 
                    console.log(`[SPRITE] Successfully loaded VFX sprite: ${key}`);
                };
                img.onerror = function() { 
                    vfxSprites[key] = null; 
                    console.error(`[SPRITE] [ERROR] Failed to load VFX sprite: ${key} (${src})`);
                };
                img.src = src;
            };

            _loadVFX('laser', 'assets/sprites/player_bullet.png');
            _loadVFX('laser_enemy', 'assets/sprites/enemy_bullet.png');
            _loadVFX('laser_glow', 'assets/sprites/laser_0_glow.png');
            for (let f = 0; f < 4; f++) {
                for (let n = 0; n < 4; n++) {
                    _loadVFX(`explosion_${f}_${n}`, `assets/sprites/vfx/explosion_${f}_${n}.png`);
                }
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
            console.log("[BOSS] Starting preloading of boss assets...");

            const toLoad = [
                // Biome-specific boss sheets
                { key: 'boss_0',            src: 'assets/sprites/boss_0.png' },
                { key: 'boss_1',            src: 'assets/sprites/boss_1.png' },
                { key: 'boss_2',            src: 'assets/sprites/boss_2.png' },
                { key: 'boss_3',            src: 'assets/sprites/boss_3.png' },
                { key: 'bossMinion',        src: 'assets/sprites/boss_minion_0.png' },
                { key: 'boss_minion_0',     src: 'assets/sprites/boss_minion_0.png' },
                // Legacy state-specific sheets (retained as backup fallbacks)
                { key: 'boss',              src: 'assets/sprites/boss_idle.png' },
                { key: 'boss_idle',         src: 'assets/sprites/boss_idle.png' },
                { key: 'boss_rage',         src: 'assets/sprites/boss_rage.png' },
                { key: 'boss_laser_charge', src: 'assets/sprites/boss_charge.png' },
                { key: 'boss_laser_fire',   src: 'assets/sprites/boss_fire.png' },
                { key: 'boss_death',        src: 'assets/sprites/boss_death.png' }
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
                    console.log(`[BOSS] Successfully loaded boss asset: ${key} (${src})`);
                    if (loadedCount >= total) {
                        bossAssetsLoaded = true;
                        bossAssetsLoading = false;
                        console.log("[BOSS] All boss assets successfully preloaded!");
                    }
                };
                img.onerror = () => {
                    // Graceful fallback: mark done even on error
                    loadedCount++;
                    bossLoadProgress = Math.round((loadedCount / total) * 100);
                    console.error(`[BOSS] [ERROR] Failed to load boss asset: ${key} (${src})`);
                    if (loadedCount >= total) {
                        bossAssetsLoaded = true;
                        bossAssetsLoading = false;
                    }
                };
                img.src = src;
                bossSprites[key] = img;
            });
        }
