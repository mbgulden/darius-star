// sprites.js ??? Player, Portrait, Enemy, VFX, and Boss sprite loading functions
// Extracted from index.html by Ned (GRO-1097)

// --- Sprite Registries (Global Scope & Window Export) ---
const playerSprites = (typeof window !== 'undefined' && window.playerSprites) ? window.playerSprites : (typeof window !== 'undefined' ? (window.playerSprites = {}) : {});
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
        const portraitSprites = (typeof window !== 'undefined' && window.portraitSprites) ? window.portraitSprites : (typeof window !== 'undefined' ? (window.portraitSprites = {}) : {});
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
        const enemySprites = (typeof window !== 'undefined' && window.enemySprites) ? window.enemySprites : (typeof window !== 'undefined' ? (window.enemySprites = {}) : {});
        let enemySpritesLoaded = false;

        function loadEnemySprites() {
            if (enemySpritesLoaded) return;
            enemySpritesLoaded = true;
            console.log("[SPRITE] Starting preloading of stratum enemy sprites...");

            // 40 Stratum-Specific Enemy Archetypes across all 10 Biomes
            const allStratumEnemies = [
                // Biome 1: Abyssal Trench
                { key: 'angler_scout',        src: 'assets/sprites/enemy_angler_scout_sheet.png', fallback: 'assets/sprites/enemy_angler_scout_0.png' },
                { key: 'jelly_interceptor',   src: 'assets/sprites/enemy_jelly_interceptor_sheet.png', fallback: 'assets/sprites/enemy_jelly_interceptor_0.png' },
                { key: 'vent_crab_heavy',     src: 'assets/sprites/enemy_vent_crab_heavy_sheet.png', fallback: 'assets/sprites/enemy_vent_crab_heavy_0.png' },
                { key: 'trench_eel',          src: 'assets/sprites/enemy_trench_eel_sheet.png', fallback: 'assets/sprites/enemy_trench_eel_0.png' },
                
                // Biome 2: Coral Graveyard
                { key: 'rust_drone',          src: 'assets/sprites/enemy_rust_drone_sheet.png', fallback: 'assets/sprites/enemy_rust_drone_0.png' },
                { key: 'coral_wasp',          src: 'assets/sprites/enemy_coral_wasp_sheet.png', fallback: 'assets/sprites/enemy_coral_wasp_0.png' },
                { key: 'armored_eel',         src: 'assets/sprites/enemy_armored_eel_sheet.png', fallback: 'assets/sprites/enemy_armored_eel_0.png' },
                { key: 'spine_urchin',        src: 'assets/sprites/enemy_spine_urchin_sheet.png', fallback: 'assets/sprites/enemy_spine_urchin_0.png' },
                
                // Biome 3: Europa Coelacanth Lair
                { key: 'sparker',             src: 'assets/sprites/enemy_sparker_sheet.png', fallback: 'assets/sprites/enemy_sparker_0.png' },
                { key: 'sentinel',            src: 'assets/sprites/enemy_sentinel_sheet.png', fallback: 'assets/sprites/enemy_sentinel_0.png' },
                { key: 'juggernaut',          src: 'assets/sprites/enemy_juggernaut_sheet.png', fallback: 'assets/sprites/enemy_juggernaut_0.png' },
                { key: 'boss_minion',         src: 'assets/sprites/enemy_boss_minion_sheet.png', fallback: 'assets/sprites/enemy_boss_minion_0.png' },
                
                // Biome 4: Nebula Drift
                { key: 'plasma_wisp',         src: 'assets/sprites/enemy_plasma_wisp_sheet.png', fallback: 'assets/sprites/enemy_plasma_wisp_0.png' },
                { key: 'storm_sprite',        src: 'assets/sprites/enemy_storm_sprite_sheet.png', fallback: 'assets/sprites/enemy_storm_sprite_0.png' },
                { key: 'gas_giant',           src: 'assets/sprites/enemy_gas_giant_sheet.png', fallback: 'assets/sprites/enemy_gas_giant_0.png' },
                { key: 'nebula_wraith',       src: 'assets/sprites/enemy_nebula_wraith_sheet.png', fallback: 'assets/sprites/enemy_nebula_wraith_0.png' },
                
                // Biome 5: Ice Ring / Iron Trench
                { key: 'ice_shard',           src: 'assets/sprites/enemy_ice_shard_sheet.png', fallback: 'assets/sprites/enemy_ice_shard_0.png' },
                { key: 'frost_drone',         src: 'assets/sprites/enemy_frost_drone_sheet.png', fallback: 'assets/sprites/enemy_frost_drone_0.png' },
                { key: 'glacier',             src: 'assets/sprites/enemy_glacier_sheet.png', fallback: 'assets/sprites/enemy_glacier_0.png' },
                { key: 'ice_swarm',           src: 'assets/sprites/enemy_ice_swarm_sheet.png', fallback: 'assets/sprites/enemy_ice_swarm_0.png' },
                
                // Biome 6: Fire Nebula / Corona
                { key: 'ember_sprite',        src: 'assets/sprites/enemy_ember_sprite_sheet.png', fallback: 'assets/sprites/enemy_ember_sprite_0.png' },
                { key: 'magma_wasp',          src: 'assets/sprites/enemy_magma_wasp_sheet.png', fallback: 'assets/sprites/enemy_magma_wasp_0.png' },
                { key: 'lava_golem',          src: 'assets/sprites/enemy_lava_golem_sheet.png', fallback: 'assets/sprites/enemy_lava_golem_0.png' },
                { key: 'inferno_node',        src: 'assets/sprites/enemy_inferno_node_sheet.png', fallback: 'assets/sprites/enemy_inferno_node_0.png' },
                
                // Biome 7: Storm Belt / Tempest
                { key: 'static_spark',        src: 'assets/sprites/enemy_static_spark_sheet.png', fallback: 'assets/sprites/enemy_static_spark_0.png' },
                { key: 'storm_hawk',          src: 'assets/sprites/enemy_storm_hawk_sheet.png', fallback: 'assets/sprites/enemy_storm_hawk_0.png' },
                { key: 'thunderhead',         src: 'assets/sprites/enemy_thunderhead_sheet.png', fallback: 'assets/sprites/enemy_thunderhead_0.png' },
                { key: 'storm_sentinel',      src: 'assets/sprites/enemy_storm_sentinel_sheet.png', fallback: 'assets/sprites/enemy_storm_sentinel_0.png' },
                
                // Biome 8: Derelict Fleet
                { key: 'salvage_drone',       src: 'assets/sprites/enemy_salvage_drone_sheet.png', fallback: 'assets/sprites/enemy_salvage_drone_0.png' },
                { key: 'ghost_fighter',       src: 'assets/sprites/enemy_ghost_fighter_sheet.png', fallback: 'assets/sprites/enemy_ghost_fighter_0.png' },
                { key: 'turret_battery',      src: 'assets/sprites/enemy_turret_battery_sheet.png', fallback: 'assets/sprites/enemy_turret_battery_0.png' },
                { key: 'fleet_turret',        src: 'assets/sprites/enemy_fleet_turret_sheet.png', fallback: 'assets/sprites/enemy_fleet_turret_0.png' },
                
                // Biome 9: Xenomorph Hive
                { key: 'crawler',             src: 'assets/sprites/enemy_crawler_sheet.png', fallback: 'assets/sprites/enemy_crawler_0.png' },
                { key: 'spitter',             src: 'assets/sprites/enemy_spitter_sheet.png', fallback: 'assets/sprites/enemy_spitter_0.png' },
                { key: 'brute',               src: 'assets/sprites/enemy_brute_sheet.png', fallback: 'assets/sprites/enemy_brute_0.png' },
                { key: 'hive_node',           src: 'assets/sprites/enemy_hive_node_sheet.png', fallback: 'assets/sprites/enemy_hive_node_0.png' },
                
                // Biome 10: Core Rift / Event Horizon
                { key: 'glitch_fragment',     src: 'assets/sprites/enemy_glitch_fragment_sheet.png', fallback: 'assets/sprites/enemy_glitch_fragment_0.png' },
                { key: 'paradox_wisp',        src: 'assets/sprites/enemy_paradox_wisp_sheet.png', fallback: 'assets/sprites/enemy_paradox_wisp_0.png' },
                { key: 'null_entity',         src: 'assets/sprites/enemy_null_entity_sheet.png', fallback: 'assets/sprites/enemy_null_entity_0.png' },
                { key: 'rift_aberration',     src: 'assets/sprites/enemy_rift_aberration_sheet.png', fallback: 'assets/sprites/enemy_rift_aberration_0.png' }
            ];

            allStratumEnemies.forEach(({key, src, fallback}) => {
                const img = new Image();
                img.onload = function() { 
                    img._isSingleFrame = img.src && img.src.includes('_0.png');
                    enemySprites[key] = img; 
                    enemySprites[key + '_sheet'] = img;
                    enemySprites[key + '_0'] = img;
                    enemySprites['enemy_' + key + '_0'] = img;
                    if (key === 'angler_scout') enemySprites['scout'] = img;
                    if (key === 'jelly_interceptor') enemySprites['interceptor'] = img;
                    if (key === 'vent_crab_heavy') enemySprites['heavy'] = img;
                    if (key === 'boss_minion') enemySprites['boss_minion'] = img;
                    console.log(`[SPRITE] Successfully loaded stratum enemy: ${key} (${img.src})`);
                };
                img.onerror = function() { 
                    if (fallback && img.src !== fallback && !img.src.endsWith(fallback)) {
                        img._isSingleFrame = true;
                        img.src = fallback;
                    } else {
                        enemySprites[key] = null; 
                        console.error(`[SPRITE] [ERROR] Failed to load stratum enemy: ${key} (${src})`);
                    }
                };
                img.src = src;
                // Immediate fallback pointer before image loads
                enemySprites[key] = img;
                enemySprites[key + '_sheet'] = img;
                enemySprites[key + '_0'] = img;
                enemySprites['enemy_' + key + '_0'] = img;
                if (key === 'angler_scout') enemySprites['scout'] = img;
                if (key === 'jelly_interceptor') enemySprites['interceptor'] = img;
                if (key === 'vent_crab_heavy') enemySprites['heavy'] = img;
                if (key === 'boss_minion') enemySprites['boss_minion'] = img;
            });
        }

        // --- VFX Sprite Preloading ---
        const vfxSprites = (typeof window !== 'undefined' && window.vfxSprites) ? window.vfxSprites : (typeof window !== 'undefined' ? (window.vfxSprites = {}) : {});
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
            
            // Dedicated Player Projectile VFX
            _loadVFX('player_bullet_nyxa', 'assets/sprites/player_bullet_nyxa.png');
            _loadVFX('player_bullet_bastion', 'assets/sprites/player_bullet_bastion.png');
            _loadVFX('player_bullet_specter', 'assets/sprites/player_bullet_specter.png');
            _loadVFX('player_bullet_tempest', 'assets/sprites/player_bullet_tempest.png');
            _loadVFX('player_bullet_warden', 'assets/sprites/player_bullet_warden.png');
            _loadVFX('player_bullet_phantom', 'assets/sprites/player_bullet_phantom.png');

            // Dedicated Stratum Enemy Munition VFX
            _loadVFX('enemy_bullet_plasma', 'assets/sprites/enemy_bullet_plasma.png');
            _loadVFX('enemy_bullet_cryo', 'assets/sprites/enemy_bullet_cryo.png');
            _loadVFX('enemy_bullet_magma', 'assets/sprites/enemy_bullet_magma.png');
            _loadVFX('enemy_bullet_lightning', 'assets/sprites/enemy_bullet_lightning.png');
            _loadVFX('enemy_bullet_acid', 'assets/sprites/enemy_bullet_acid.png');
            _loadVFX('enemy_bullet_tachyon', 'assets/sprites/enemy_bullet_tachyon.png');
            _loadVFX('enemy_bullet_singularity', 'assets/sprites/enemy_bullet_singularity.png');
            _loadVFX('enemy_bullet_flak', 'assets/sprites/enemy_bullet_flak.png');
            for (let f = 0; f < 4; f++) {
                for (let n = 0; n < 4; n++) {
                    _loadVFX(`explosion_${f}_${n}`, `assets/sprites/vfx/explosion_${f}_${n}.png`);
                }
            }
            _loadVFX('shield', 'assets/sprites/shield_0.png');
            _loadVFX('shield_impact', 'assets/sprites/shield_impact.png');
            _loadVFX('laser_wave', 'assets/sprites/laser_wave.png');
            _loadVFX('missile_seeker', 'assets/sprites/missile_seeker.png');
            _loadVFX('powerups_atlas', 'assets/sprites/powerups_atlas.png');
            _loadVFX('thruster_0', 'assets/sprites/thruster_0.png');
            _loadVFX('thruster_1', 'assets/sprites/thruster_1.png');
            _loadVFX('powerup_weapon', 'assets/sprites/powerup_weapon.png');
            _loadVFX('powerup_shield', 'assets/sprites/powerup_shield.png');
            _loadVFX('powerup_shield_regen', 'assets/sprites/powerup_shield_regen.png');
            _loadVFX('powerup_bomb', 'assets/sprites/powerup_bomb.png');
            _loadVFX('powerup_speed', 'assets/sprites/powerup_speed.png');
            _loadVFX('powerup_materia', 'assets/sprites/powerup_materia.png');
            _loadVFX('scrap_metal', 'assets/sprites/scrap_metal.png');
            _loadVFX('scrap_alloy', 'assets/sprites/scrap_alloy.png');
            _loadVFX('scrap_cell', 'assets/sprites/scrap_cell.png');
            _loadVFX('scrap_core', 'assets/sprites/scrap_core.png');
            _loadVFX('scrap_essence', 'assets/sprites/scrap_essence.png');
            _loadVFX('scrap_fragment', 'assets/sprites/scrap_fragment.png');
            loadLandmarkSprites();
            loadUISprites();
        }

        // --- Landmark Sprites Loading (100-Level Journey Landmarks) ---
        const landmarkSprites = {};
        function loadLandmarkSprites() {
            const list = [
                'landmark_coral_spire',
                'landmark_kelp_canopy',
                'landmark_frigate_wreck',
                'landmark_atoll_chasm',
                'landmark_sensor_buoy',
                'landmark_sunken_aqueduct',
                'landmark_magma_chimney',
                'landmark_ice_berg',
                'landmark_leviathan_bones',
                'landmark_bio_cluster',
                'landmark_chrono_cube',
                'landmark_chrono_singularity'
            ];
            list.forEach(name => {
                if (!landmarkSprites[name]) {
                    const img = new Image();
                    img.src = `assets/sprites/landmarks/${name}.png`;
                    landmarkSprites[name] = img;
                }
            });
        }

        // --- Cockpit UI, Avionics & Upgrade Badge Sprite Preloading ---
        const uiSprites = (typeof window !== 'undefined' && window.uiSprites) ? window.uiSprites : (typeof window !== 'undefined' ? (window.uiSprites = {}) : {});
        let uiSpritesLoaded = false;

        function loadUISprites() {
            if (uiSpritesLoaded) return;
            uiSpritesLoaded = true;
            const hudKeys = ['hud_shield', 'hud_weapon', 'hud_scrap', 'hud_boost', 'hud_special', 'hud_dodge', 'hud_score', 'hud_boss_threat'];
            const rankKeys = ['rank_s', 'rank_a', 'rank_b', 'rank_c', 'rank_d'];
            const upgradeKeys = [
                'icon_upgrade_weapons', 'icon_upgrade_shields', 'icon_upgrade_rockets', 'icon_upgrade_magnetism',
                'icon_upgrade_engines', 'icon_upgrade_specials', 'icon_upgrade_addons', 'icon_upgrade_cosmetics'
            ];
            
            [...hudKeys, ...rankKeys, ...upgradeKeys].forEach(key => {
                if (!uiSprites[key]) {
                    const img = new Image();
                    img.src = `assets/sprites/ui/${key}.png`;
                    uiSprites[key] = img;
                }
            });
        }

        if (typeof window !== 'undefined') {
            window.landmarkSprites = landmarkSprites;
            window.loadLandmarkSprites = loadLandmarkSprites;
            window.uiSprites = uiSprites;
            window.loadUISprites = loadUISprites;
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

        // --- Boss Asset Preloading ---
        const bossSprites = (typeof window !== 'undefined' && window.bossSprites) ? window.bossSprites : (typeof window !== 'undefined' ? (window.bossSprites = {}) : {});
        let bossAssetsLoading = false;
        let bossAssetsLoaded = false;
        let bossLoadProgress = 0;  // 0-100

        function preloadBossAssets() {
            if (bossAssetsLoading || bossAssetsLoaded) return;
            bossAssetsLoading = true;
            bossLoadProgress = 0;
            console.log("[BOSS] Starting preloading of boss assets...");

            const toLoad = [
                // 10 Sub-Bosses (Level 5) and 10 Biome Bosses (Level 10)
                { key: 'boss_b1_mid_0',     src: 'assets/sprites/boss_b1_mid_0.png' },
                { key: 'boss_b1_0',         src: 'assets/sprites/boss_b1_0.png' },
                { key: 'boss_b2_mid_0',     src: 'assets/sprites/boss_b2_mid_0.png' },
                { key: 'boss_b2_0',         src: 'assets/sprites/boss_b2_0.png' },
                { key: 'boss_b3_mid_0',     src: 'assets/sprites/boss_b3_mid_0.png' },
                { key: 'boss_b3_0',         src: 'assets/sprites/boss_b3_0.png' },
                { key: 'boss_b4_mid_0',     src: 'assets/sprites/boss_b4_mid_0.png' },
                { key: 'boss_b4_0',         src: 'assets/sprites/boss_b4_0.png' },
                { key: 'boss_b5_mid_0',     src: 'assets/sprites/boss_b5_mid_0.png' },
                { key: 'boss_b5_0',         src: 'assets/sprites/boss_b5_0.png' },
                { key: 'boss_b6_mid_0',     src: 'assets/sprites/boss_b6_mid_0.png' },
                { key: 'boss_b6_0',         src: 'assets/sprites/boss_b6_0.png' },
                { key: 'boss_b7_mid_0',     src: 'assets/sprites/boss_b7_mid_0.png' },
                { key: 'boss_b7_0',         src: 'assets/sprites/boss_b7_0.png' },
                { key: 'boss_b8_mid_0',     src: 'assets/sprites/boss_b8_mid_0.png' },
                { key: 'boss_b8_0',         src: 'assets/sprites/boss_b8_0.png' },
                { key: 'boss_b9_mid_0',     src: 'assets/sprites/boss_b9_mid_0.png' },
                { key: 'boss_b9_0',         src: 'assets/sprites/boss_b9_0.png' },
                { key: 'boss_b10_mid_0',    src: 'assets/sprites/boss_b10_mid_0.png' },
                { key: 'boss_b10_0',        src: 'assets/sprites/boss_b10_0.png' },

                // Legacy fallbacks and minions
                { key: 'boss_0',            src: 'assets/sprites/boss_0.png' },
                { key: 'boss_1',            src: 'assets/sprites/boss_1.png' },
                { key: 'boss_2',            src: 'assets/sprites/boss_2.png' },
                { key: 'boss_3',            src: 'assets/sprites/boss_3.png' },
                { key: 'bossMinion',        src: 'assets/sprites/boss_minion_0.png' },
                { key: 'boss_minion_0',     src: 'assets/sprites/boss_minion_0.png' },
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
                    bossSprites[key] = img;
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

        // --- 5-Tier Standardized Animation Manifest (GRO-1142) ---
        const SPRITE_ANIMATIONS = {};

        // Helper to register standard 4x4 16-frame boss spritesheet
        function registerBossAnimation(spriteKey, frameSize = 256) {
            SPRITE_ANIMATIONS[spriteKey] = {
                frameWidth: frameSize,
                frameHeight: frameSize,
                actions: {
                    idle:   { row: 0, frames: 4, fps: 6, loop: true },
                    shoot:  { row: 1, frames: 4, fps: 10, loop: false, muzzle: { x: -35, y: 0 } },
                    hit:    { row: 2, frames: 4, fps: 12, loop: false },
                    death:  { row: 3, frames: 4, fps: 6, loop: false }
                }
            };
        }

        // Register all 10 Sub-Bosses (Level 5) and 10 Biome Bosses (Level 10)
        for (let b = 1; b <= 10; b++) {
            registerBossAnimation(`boss_b${b}_mid_0`, (b === 4 || b === 6 || b === 9) ? 512 : 256);
            registerBossAnimation(`boss_b${b}_0`, (b === 1 || b === 2 || b === 4 || b === 5 || b === 6 || b === 8 || b === 10) ? 512 : 256);
        }

        // Helper to register standard 4x4 16-frame stratum enemy spritesheets
        function registerEnemyAnimation(spriteKey, frameSize = 256) {
            const def = {
                frameWidth: frameSize,
                frameHeight: frameSize,
                actions: {
                    idle:   { row: 0, frames: 4, fps: 6, loop: true },
                    shoot:  { row: 1, frames: 4, fps: 10, loop: false, muzzle: { x: -25, y: 0 } },
                    hit:    { row: 2, frames: 4, fps: 8, loop: false },
                    death:  { row: 3, frames: 4, fps: 10, loop: false }
                }
            };
            SPRITE_ANIMATIONS[spriteKey] = def;
            SPRITE_ANIMATIONS[`${spriteKey}_0`] = def;
            SPRITE_ANIMATIONS[`enemy_${spriteKey}_0`] = def;
            SPRITE_ANIMATIONS[`enemy_${spriteKey}_sheet`] = def;
        }

        // Register all 40 Stratum-Specific Enemies
        [
            'angler_scout', 'jelly_interceptor', 'vent_crab_heavy', 'trench_eel',
            'rust_drone', 'coral_wasp', 'armored_eel', 'spine_urchin',
            'sparker', 'sentinel', 'juggernaut', 'boss_minion',
            'plasma_wisp', 'storm_sprite', 'gas_giant', 'nebula_wraith',
            'ice_shard', 'frost_drone', 'glacier', 'ice_swarm',
            'ember_sprite', 'magma_wasp', 'lava_golem', 'inferno_node',
            'static_spark', 'storm_hawk', 'thunderhead', 'storm_sentinel',
            'salvage_drone', 'ghost_fighter', 'turret_battery', 'fleet_turret',
            'crawler', 'spitter', 'brute', 'hive_node',
            'glitch_fragment', 'paradox_wisp', 'null_entity', 'rift_aberration'
        ].forEach(key => registerEnemyAnimation(key, 256));

        function drawAnimatedSpriteSheet(ctx, spriteSheet, animDef, actionName, animTimer, dx, dy, dw, dh, customFrameIndex) {
            if (!animDef || !animDef.actions) {
                ctx.drawImage(spriteSheet, dx, dy, dw, dh);
                return;
            }
            if (spriteSheet && (spriteSheet._isSingleFrame || (spriteSheet.src && spriteSheet.src.includes('enemy_') && spriteSheet.src.includes('_0.png')))) {
                ctx.drawImage(spriteSheet, dx, dy, dw, dh);
                return;
            }
            const action = animDef.actions[actionName] || animDef.actions.idle || Object.values(animDef.actions)[0];
            const totalFrames = action.frames || 1;
            let frameIndex = 0;
            if (customFrameIndex !== undefined && customFrameIndex !== null) {
                frameIndex = Math.max(0, Math.min(totalFrames - 1, customFrameIndex));
            } else {
                frameIndex = action.loop 
                    ? Math.floor(animTimer * (action.fps || 8)) % totalFrames 
                    : Math.min(totalFrames - 1, Math.floor(animTimer * (action.fps || 8)));
            }
            
            const rawW = (spriteSheet && (spriteSheet.naturalWidth || spriteSheet.width)) || (animDef.frameWidth * 4);
            const rawH = (spriteSheet && (spriteSheet.naturalHeight || spriteSheet.height)) || (animDef.frameHeight * 4);
            const frameW = Math.floor(rawW / 4);
            const frameH = Math.floor(rawH / 4);
            const sx = frameIndex * frameW;
            const sy = (action.row || 0) * frameH;

            ctx.drawImage(
                spriteSheet,
                sx, sy, frameW, frameH,
                dx, dy, dw, dh
            );
        }

        // --- Window Exports ---
        if (typeof window !== 'undefined') {
            window.playerSprites = playerSprites;
            window.portraitSprites = portraitSprites;
            window.enemySprites = enemySprites;
            window.vfxSprites = vfxSprites;
            window.bossSprites = bossSprites;
            window.landmarkSprites = landmarkSprites;
            window.SPRITE_ANIMATIONS = SPRITE_ANIMATIONS;
            window.drawAnimatedSpriteSheet = drawAnimatedSpriteSheet;
            window.loadPlayerSprites = loadPlayerSprites;
            window.loadPortraitSprites = loadPortraitSprites;
            window.loadEnemySprites = loadEnemySprites;
            window.loadVFXSprites = loadVFXSprites;
            window.preloadBossAssets = preloadBossAssets;
            window.loadLandmarkSprites = loadLandmarkSprites;
            window.preCompositeAdditive = preCompositeAdditive;
        }

        // --- Auto-Initialize Core Sprite Registries Immediately on Script Execution ---
        loadPlayerSprites();
        loadPortraitSprites();
        loadEnemySprites();
        loadVFXSprites();
        preloadBossAssets();
        loadLandmarkSprites();
