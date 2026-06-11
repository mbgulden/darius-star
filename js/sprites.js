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
                enemySprites[key] = new Image();
                enemySprites[key].src = `assets/sprites/${key}_0.png`;
            });
        }

        // --- VFX Sprite Preloading ---
        const vfxSprites = {};
        let vfxSpritesLoaded = false;

        function loadVFXSprites() {
            if (vfxSpritesLoaded) return;
            vfxSpritesLoaded = true;
            // Laser (player bullets)
            vfxSprites['laser'] = new Image();
            vfxSprites['laser'].src = 'assets/sprites/laser_0.png';
            // Enemy laser + glow
            vfxSprites['laser_enemy'] = new Image();
            vfxSprites['laser_enemy'].src = 'assets/sprites/laser_enemy.png';
            vfxSprites['laser_glow'] = new Image();
            vfxSprites['laser_glow'].src = 'assets/sprites/laser_0_glow.png';
            // Multi-frame explosion (4 frames)
            for (let f = 0; f < 4; f++) {
                vfxSprites['explosion_' + f] = new Image();
                vfxSprites['explosion_' + f].src = `assets/sprites/explosion_${f}.png`;
            }
            // Shield forcefield ring
            vfxSprites['shield'] = new Image();
            vfxSprites['shield'].src = 'assets/sprites/shield_0.png';
        }

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
                { key: 'boss',       src: 'assets/sprites/boss_0.png' },
                { key: 'bossMinion', src: 'assets/sprites/boss_minion_0.png' }
            ];
            let loadedCount = 0;
            const total = toLoad.length;

            toLoad.forEach(({key, src}) => {
                const img = new Image();
                img.onload = () => {
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

