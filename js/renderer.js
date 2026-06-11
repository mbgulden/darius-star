// renderer.js — Particle, ScrapDrop, FloatingText, ParallaxLayer,
// OffscreenBuffer, Star, EnvironmentParticle, star fields, and biome particles
// Extracted from index.html by Ned (GRO-1096)

        // --- Particle Class ---
        class Particle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.color = color;
                this.vx = (Math.random() - 0.5) * 250;
                this.vy = (Math.random() - 0.5) * 250;
                this.size = Math.random() * 4 + 1;
                this.alpha = 1.0;
                this.decay = Math.random() * 1.5 + 1.0;
            }

            update(dt) {
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                this.alpha -= this.decay * dt;
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = Math.max(0, this.alpha);
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.size, this.size);
                ctx.restore();
            }
        }
        class ScrapDrop {
            constructor(x, y, type, value = null) {
                this.x = x;
                this.y = y;
                this.type = type; // 'metal', 'alloy', 'cell', 'core', 'essence', 'fragment'
                this.width = 12;
                this.height = 12;
                this.vx = (Math.random() - 0.5) * 60 - 50; // drifting left
                this.vy = (Math.random() - 0.5) * 80;
                this.spin = Math.random() * Math.PI;
                this.spinSpeed = 2 + Math.random() * 4;
                
                if (value !== null && value !== undefined) {
                    this.value = value;
                } else if (type === 'metal') {
                    this.value = Math.floor(10 + Math.random() * 41); // 10-50
                } else if (type === 'alloy') {
                    this.value = 50 + Math.floor(Math.random() * 51); // 50-100
                } else if (type === 'cell') {
                    this.value = Math.floor(100 + Math.random() * 151); // 100-250
                } else if (type === 'core') {
                    this.value = 250 + Math.floor(Math.random() * 251); // 250-500
                } else if (type === 'essence') {
                    this.value = 500 + Math.floor(Math.random() * 501); // 500-1000
                } else if (type === 'fragment') {
                    this.value = Math.floor(500 + Math.random() * 501); // 500-1000
                }
                
                if (type === 'metal') {
                    this.color = '#c0c0c0'; // silver/grey
                } else if (type === 'alloy') {
                    this.color = '#4A90D9'; // blue alloy
                } else if (type === 'cell') {
                    this.color = '#00ffff'; // neon cyan
                } else if (type === 'core') {
                    this.color = '#FFD700'; // gold
                } else if (type === 'essence') {
                    this.color = '#FF44CC'; // pink/purple
                } else if (type === 'fragment') {
                    this.color = '#ff00ff'; // neon purple
                }
            }
            update(dt) {
                // Apply magnetic pull toward player
                const dx = player.x + player.width/2 - this.x;
                const dy = player.y + player.height/2 - this.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                const magnetRadius = 100;
                if (dist < magnetRadius) {
                    const pullForce = 350 * (1 - dist / magnetRadius);
                    this.vx += (dx / dist) * pullForce * dt;
                    this.vy += (dy / dist) * pullForce * dt;
                } else {
                    this.vx = this.vx * 0.98;
                    this.vy = this.vy * 0.98;
                    this.x -= 40 * dt;
                }
                
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                this.spin += this.spinSpeed * dt;
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.spin);
                
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 8;
                ctx.fillStyle = this.color;
                
                if (this.type === 'metal') {
                    ctx.beginPath();
                    for(let i=0; i<6; i++) {
                        const angle = i * Math.PI / 3;
                        ctx.lineTo(Math.cos(angle)*6, Math.sin(angle)*6);
                    }
                    ctx.closePath();
                    ctx.fill();
                } else if (this.type === 'alloy') {
                    // Blue alloy plate with circuit traces
                    ctx.fillRect(-7, -5, 14, 10);
                    ctx.fillStyle = '#2266AA';
                    ctx.fillRect(-3, -3, 6, 6);
                } else if (this.type === 'cell') {
                    ctx.fillRect(-3, -6, 6, 12);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(-1, -4, 2, 8);
                } else if (this.type === 'core') {
                    // Gold precursor core with pulsing glow
                    ctx.shadowBlur = 14;
                    ctx.beginPath();
                    ctx.arc(0, 0, 8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.arc(0, 0, 3, 0, Math.PI * 2);
                    ctx.fill();
                } else if (this.type === 'essence') {
                    // Pink/purple Dreamer essence orb
                    ctx.shadowBlur = 16;
                    ctx.beginPath();
                    ctx.arc(0, 0, 9, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.arc(0, 0, 4, 0, Math.PI * 2);
                    ctx.fill();
                } else if (this.type === 'fragment') {
                    ctx.fillRect(-5, -5, 10, 10);
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(-5, -5, 10, 10);
                }
                
                ctx.restore();
            }
        }

        // --- FloatingText Class ---
        class FloatingText {
            constructor(x, y, text, color = '#00ff55') {
                this.x = x;
                this.y = y;
                this.text = text;
                this.color = color;
                this.alpha = 1.0;
                this.vy = -40; // floating upwards
                this.life = 1.0; // seconds
            }
            update(dt) {
                this.y += this.vy * dt;
                this.life -= dt;
                this.alpha = Math.max(0, this.life);
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(this.text, this.x, this.y);
                ctx.restore();
            }
        }

        function getTrailColorValue(name) {
            switch(name) {
                case 'cyan': return '#00ffff';
                case 'magenta': return '#ff0055';
                case 'emerald': return '#00ff55';
                case 'gold': return '#ffcc00';
                case 'purple': return '#ff00aa';
                default: return '#ff7700';
            }
        }

        // --- Parallax Background System ---
        // Image-based parallax layers (bg_nebula, bg_city) + procedural starfield

        const bgImages = {};
        function loadBackgroundImages() {
            const toLoad = [
                { key: 'nebula', src: 'assets/sprites/bg_nebula_0.png' },
                { key: 'city',   src: 'assets/sprites/bg_city_0.png' }
            ];
            let loaded = 0;
            toLoad.forEach(({key, src}) => {
                bgImages[key] = new Image();
                bgImages[key].onload = () => { loaded++; };
                bgImages[key].src = src;
            });
        }
        // Background images lazy-loaded on first user interaction
        let bgImagesLoaded = false;
        function ensureBackgroundImages() {
            if (!bgImagesLoaded) {
                bgImagesLoaded = true;
                loadBackgroundImages();
            }
        }

        // === Procedural Biome Backgrounds (fallback when strip images missing) ===
        const biomeBgCanvases = {};
        function generateBiomeBackground(biomeNum) {
            if (biomeBgCanvases[biomeNum]) return biomeBgCanvases[biomeNum];
            const c = document.createElement('canvas');
            const baseW = canvas.width || 800;
            // 2× width for seamless tiling — eliminates visible seam at viewport edge
            c.width = baseW * 2;
            c.height = canvas.height || 450;
            const bctx = c.getContext('2d');
            
            // Biome color palettes — deep space + environmental tint
            const themes = {
                1: { sky: ['#020418','#06102a','#0a1a3a'], particles: ['#004466','#006688'], accent: '#00aacc', name: 'Abyssal Trench' },
                2: { sky: ['#1a0020','#2a0030','#1a1030'], particles: ['#661144','#883366'], accent: '#cc4488', name: 'Coral Graveyard' },
                3: { sky: ['#001a10','#002a18','#0a2018'], particles: ['#006644','#008866'], accent: '#00cc66', name: 'Coelacanth Lair' },
                4: { sky: ['#100020','#1a0030','#200840'], particles: ['#442288','#6644aa'], accent: '#8844cc', name: 'Nebula Drift' },
                5: { sky: ['#081020','#0a1830','#102040'], particles: ['#4488aa','#66aacc'], accent: '#88ccff', name: 'Ice Rings' },
                6: { sky: ['#200802','#300c04','#1a0802'], particles: ['#883300','#aa4400'], accent: '#ff6600', name: 'Inferno Core' },
                7: { sky: ['#101018','#181828','#202038'], particles: ['#666688','#8888aa'], accent: '#aaaacc', name: 'Storm Belt' },
                8: { sky: ['#181008','#201410','#281810'], particles: ['#664422','#886633'], accent: '#cc8844', name: 'Derelict Fleet' },
                9: { sky: ['#050508','#0a0a10','#100818'], particles: ['#224422','#336633'], accent: '#44ff44', name: 'Core Rift' },
                10:{ sky: ['#050508','#0a0a10','#100818'], particles: ['#442244','#663366'], accent: '#ff44ff', name: 'Core Rift' },
            };
            const theme = themes[biomeNum] || themes[1];
            
            // Sky gradient
            const grad = bctx.createLinearGradient(0, 0, 0, c.height);
            grad.addColorStop(0, theme.sky[0]);
            grad.addColorStop(0.5, theme.sky[1]);
            grad.addColorStop(1, theme.sky[2]);
            bctx.fillStyle = grad;
            bctx.fillRect(0, 0, c.width, c.height);
            
            // Distant nebula blobs
            const seed = biomeNum * 137.5;
            for (let i = 0; i < 5; i++) {
                const nx = ((Math.sin(seed + i * 2.1) * 0.5 + 0.5) * c.width);
                const ny = ((Math.cos(seed + i * 3.7) * 0.5 + 0.5) * c.height);
                const nr = 60 + (Math.sin(seed + i) * 0.5 + 0.5) * 80;
                const ng = bctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
                ng.addColorStop(0, theme.particles[0] + '44');
                ng.addColorStop(0.5, theme.particles[1] + '22');
                ng.addColorStop(1, 'transparent');
                bctx.fillStyle = ng;
                bctx.fillRect(nx - nr, ny - nr, nr * 2, nr * 2);
            }
            
            // Star field (dense, varied sizes)
            for (let i = 0; i < 200; i++) {
                const sx = ((Math.sin(seed * 7 + i * 13.7) * 0.5 + 0.5) * c.width);
                const sy = ((Math.cos(seed * 11 + i * 17.3) * 0.5 + 0.5) * c.height);
                const sr = 0.3 + Math.abs(Math.sin(i * 3.1)) * 1.8;
                const sa = 0.3 + Math.abs(Math.sin(i * 5.7)) * 0.7;
                bctx.fillStyle = `rgba(255,255,255,${sa.toFixed(2)})`;
                bctx.beginPath();
                bctx.arc(sx, sy, sr, 0, Math.PI * 2);
                bctx.fill();
            }
            
            // Occasional colored accent stars
            for (let i = 0; i < 15; i++) {
                const ax = ((Math.sin(seed * 3 + i * 19.1) * 0.5 + 0.5) * c.width);
                const ay = ((Math.cos(seed * 5 + i * 23.7) * 0.5 + 0.5) * c.height);
                bctx.fillStyle = theme.accent + 'cc';
                bctx.beginPath();
                bctx.arc(ax, ay, 1.2, 0, Math.PI * 2);
                bctx.fill();
            }
            
            biomeBgCanvases[biomeNum] = c;
            return c;
        }

        class ParallaxLayer {
            constructor(key, speed, yOffset = 0, alpha = 1.0, scale = 1.0) {
                this.key = key;          // Image key in bgImages — lazy-resolved at draw time
                this.speed = speed;
                this.yOffset = yOffset;
                this.alpha = alpha;
                this.scale = scale;
                this.offset = 0;
            }

            getImg() {
                // Lazy-resolve: bgImages is populated asynchronously by ensureBackgroundImages()
                return bgImages[this.key] || null;
            }

            setKey(newKey) {
                // Switch to a different background image (biome transition)
                // Map biome number keys to named strip files
                const BIOME_STRIP_MAP = {
                    'bg_1': 'abyssal_trench', 'bg_2': 'coral_graveyard',
                    'bg_3': 'coelacanth_lair', 'bg_4': 'nebula_drift',
                    'bg_5': 'ice_rings', 'bg_6': 'inferno_core',
                    'bg_7': 'storm_belt', 'bg_8': 'derelict_fleet',
                    'bg_9': 'core_rift', 'bg_10': 'core_rift'
                };
                const stripName = BIOME_STRIP_MAP[newKey] || 'abyssal_trench';
                if (!bgImages[newKey]) {
                    const img = new Image();
                    img.src = `assets/sprites/backgrounds/bg_${stripName}_strip.png`;
                    bgImages[newKey] = img;
                }
                this.key = newKey;
                this.offset = 0; // Reset scroll position for new background
            }

            update(dt) {
                const img = this.getImg();
                // Use procedural canvas width as fallback (2× viewport for seamless tiling)
                let w;
                if (img && img.complete && img.naturalWidth > 0) {
                    w = img.width;
                } else {
                    const match = this.key.match(/bg_(\d+)/);
                    const biomeNum = match ? parseInt(match[1]) : 1;
                    const procBg = biomeBgCanvases[biomeNum] || generateBiomeBackground(biomeNum);
                    w = procBg ? procBg.width : (canvas.width || 800);
                }
                this.offset = (this.offset + this.speed * dt) % w;
            }

            draw() {
                const img = this.getImg();
                // Fall back to procedural background if image not loaded
                if (!img || !img.complete || img.naturalWidth === 0) {
                    // Try procedural: extract biome number from key (bg_1 → 1)
                    let biomeNum = 1;
                    const match = this.key.match(/bg_(\d+)/);
                    if (match) biomeNum = parseInt(match[1]);
                    const procBg = generateBiomeBackground(biomeNum);
                    if (procBg) {
                        ctx.save();
                        ctx.globalAlpha = this.alpha;
                        const w = procBg.width * this.scale;
                        const h = procBg.height * this.scale;
                        const drawX = -this.offset % w;
                        const count = Math.ceil(canvas.width / w) + 1;
                        for (let i = 0; i < count; i++) {
                            ctx.drawImage(procBg, drawX + i * w, this.yOffset, w, h);
                        }
                        ctx.restore();
                    }
                    return;
                }
                ctx.save();
                ctx.globalAlpha = this.alpha;
                const w = img.width * this.scale;
                const h = img.height * this.scale;
                // Tile horizontally for seamless scroll
                const drawX = -this.offset;
                const count = Math.ceil(canvas.width / w) + 1;
                for (let i = 0; i < count; i++) {
                    ctx.drawImage(img, drawX + i * w, this.yOffset, w, h);
                }
                ctx.restore();
            }
        }

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
            // Load all actual enemy sprite files
            const types = [
                'enemy_crawler', 'enemy_brute', 'enemy_spitter',
                'enemy_b1_crawler', 'enemy_b2_wraith', 'enemy_b3_spider',
                'enemy_b4_rider', 'enemy_b4_serpent', 'enemy_b4_wisp',
                'enemy_ember_sprite', 'enemy_fleet_turret', 'enemy_frost_drone',
                'enemy_gas_giant', 'enemy_ghost_fighter', 'enemy_glacier',
                'enemy_glitch_fragment', 'enemy_hive_node', 'enemy_ice_shard',
                'enemy_ice_swarm', 'enemy_inferno_node', 'enemy_lava_golem',
                'enemy_magma_wasp', 'enemy_nebula_wraith', 'enemy_null_entity',
                'enemy_paradox_wisp', 'enemy_plasma_wisp', 'enemy_rift_aberration',
                'enemy_salvage_drone', 'enemy_static_spark', 'enemy_storm_hawk',
                'enemy_storm_sentinel', 'enemy_storm_sprite', 'enemy_thunderhead',
                'enemy_turret_battery'
            ];
            types.forEach(key => {
                enemySprites[key] = new Image();
                enemySprites[key].src = `assets/sprites/${key}_0.png`;
            });
            // Legacy aliases — map old type names to new sprites
            enemySprites['scout'] = enemySprites['enemy_crawler'];
            enemySprites['interceptor'] = enemySprites['enemy_spitter'];
            enemySprites['heavy'] = enemySprites['enemy_brute'];
            enemySprites['boss_minion'] = enemySprites['enemy_b1_crawler'];
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

        // --- Offscreen Canvas Pre-Rendering ---
        // Static/procedural assets are rendered to offscreen canvases
        // and blitted in a single drawImage call instead of 100+ individual draws.

        class OffscreenBuffer {
            constructor(width, height) {
                this.canvas = document.createElement('canvas');
                this.canvas.width = width;
                this.canvas.height = height;
                this.ctx = this.canvas.getContext('2d');
                this.dirty = true;          // force first render
                this.renderInterval = 0;     // ms between rebuilds
                this.renderTimer = 0;        // countdown accumulator
            }
            markDirty() { this.dirty = true; }
            rebuild(renderFn) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                renderFn(this.ctx);
                this.dirty = false;
            }
        }

        // --- Star field (3 depth layers rendered procedurally) ---
        class Star {
            constructor(depth) {
                this.depth = depth; // 1=far, 2=mid, 3=near
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.speed = 20 + depth * 25;
                this.size = 0.5 + depth * 0.4;
                this.twinkle = Math.random() * Math.PI * 2;
                this.twinkleSpeed = 1.5 + Math.random() * 2.5;
                this.color = depth === 3 ? '#ccddff' : (depth === 2 ? '#7799cc' : '#334466');
            }

            update(dt) {
                this.x -= this.speed * dt;
                this.twinkle += this.twinkleSpeed * dt;
                if (this.x < -5) {
                    this.x = canvas.width + 5;
                    this.y = Math.random() * canvas.height;
                }
            }

            getAlpha() { return 0.4 + Math.sin(this.twinkle) * 0.35; }
        }

        // Offscreen buffer for star field (rendered lazily every 250ms)
        const starBuffer = new OffscreenBuffer(canvas.width, canvas.height);
        starBuffer.renderInterval = 0.25; // seconds
        const stars = [];
        for (let i = 0; i < 35; i++) stars.push(new Star(1));   // far
        for (let i = 0; i < 22; i++) stars.push(new Star(2));   // mid
        for (let i = 0; i < 10; i++) stars.push(new Star(3));   // near

        function rebuildStarBuffer(offCtx) {
            stars.forEach(star => {
                offCtx.save();
                offCtx.globalAlpha = star.getAlpha();
                offCtx.fillStyle = star.color;
                offCtx.fillRect(star.x, star.y, star.size, star.size);
                offCtx.restore();
            });
        }

        // --- Environmental Particle System (all 10 biomes) ---
        // Replaces the old SeaParticle. Each biome gets a unique particle type
        // as defined in docs/missing-elements-style-guide.md §2.

        class EnvironmentParticle {
            constructor(type, x, y) {
                this.type = type;
                this.x = x;
                this.y = y;
                this.alive = true;
                this.life = 1.0;
                this.frame = 0;
                this._initByType();
            }

            _initByType() {
                switch (this.type) {
                    // --- B1: Abyssal Trench — Bioluminescent Drift ---
                    case 'mote':
                        this.size = 1.5 + Math.random() * 3;
                        this.speed = 15 + Math.random() * 25;
                        this.drift = Math.sin(Math.random() * Math.PI * 2) * 40;
                        this.phase = Math.random() * Math.PI * 2;
                        this.alpha = 0.4 + Math.random() * 0.5;
                        this.alphaPulseSpeed = 1.5 + Math.random() * 2.5;
                        this.color = '#00FFFF'; // cyan bioluminescent
                        this.glowSize = this.size * 4;
                        break;
                    case 'vent_smoke':
                        this.x = Math.random() * canvas.width * 0.6 + canvas.width * 0.2;
                        this.y = canvas.height + 5;
                        this.size = 6 + Math.random() * 12;
                        this.speed = 40 + Math.random() * 50;
                        this.drift = (Math.random() - 0.5) * 20;
                        this.alpha = 0.2 + Math.random() * 0.2;
                        this.color = Math.random() < 0.5 ? '#FF6600' : '#333333';
                        this.life = 3 + Math.random() * 2;
                        break;

                    // --- B2: Coral Graveyard — Rust Storm ---
                    case 'rust_flake':
                        this.size = 2 + Math.random() * 4;
                        this.speed = (Math.random() - 0.5) * 120;
                        this.drift = (Math.random() - 0.5) * 120;
                        this.alpha = 0.3 + Math.random() * 0.4;
                        this.color = '#CC5500';
                        this.life = 2 + Math.random() * 3;
                        this.angle = Math.random() * Math.PI * 2;
                        this.rotSpeed = (Math.random() - 0.5) * 4;
                        break;
                    case 'neon_glow':
                        this.x = Math.random() * canvas.width;
                        this.y = Math.random() * canvas.height * 0.6 + canvas.height * 0.2;
                        this.size = 40 + Math.random() * 40;
                        this.alpha = 0.06 + Math.random() * 0.08;
                        this.color = '#FF4488';
                        this.life = 0.3 + Math.random() * 0.5;
                        break;

                    // --- B3: Coelacanth Lair — Tesla Arcs ---
                    case 'tesla_bolt':
                        this.points = [];
                        const count = 4 + Math.floor(Math.random() * 5);
                        const sx = Math.random() * canvas.width;
                        const ex = sx + (Math.random() - 0.5) * 120;
                        const gap = (ex - sx) / count;
                        for (let i = 0; i <= count; i++) {
                            this.points.push({
                                x: sx + gap * i,
                                y: 150 + Math.random() * (canvas.height - 300)
                            });
                        }
                        this.alpha = 0.7 + Math.random() * 0.3;
                        this.color = '#00CCFF';
                        this.lineWidth = 1.5 + Math.random() * 2;
                        this.life = 0.3 + Math.random() * 0.3;
                        break;
                    case 'coolant_drip':
                        this.y = -10;
                        this.size = 3;
                        this.speed = 80 + Math.random() * 120;
                        this.drift = 0;
                        this.alpha = 0.5 + Math.random() * 0.3;
                        this.color = '#33CC55';
                        this.life = canvas.height / this.speed + 0.3;
                        break;

                    // --- B4: Nebula Drift — Plasma Currents ---
                    case 'plasma_ribbon':
                        this.y = 50 + Math.random() * (canvas.height - 100);
                        this.x = canvas.width + 20;
                        this.size = 8 + Math.random() * 30;
                        this.speed = 40 + Math.random() * 60;
                        this.drift = Math.sin(Math.random() * Math.PI * 2) * 60;
                        this.phase = Math.random() * Math.PI * 2;
                        this.alpha = 0.15 + Math.random() * 0.2;
                        this.color = Math.random() < 0.5 ? '#00BFFF' : '#FF00FF';
                        this.life = 5 + Math.random() * 3;
                        break;
                    case 'storm_flash':
                        this.x = -10;
                        this.y = -10;
                        this.size = 0;
                        this.alpha = 0.08;
                        this.color = '#FFFFFF';
                        this.life = 0.08;
                        break;

                    // --- B5: Ice Ring — Diamond Dust ---
                    case 'ice_crystal':
                        this.size = 3 + Math.random() * 6;
                        this.speed = 10 + Math.random() * 20;
                        this.drift = (Math.random() - 0.5) * 15;
                        this.alpha = 0.3 + Math.random() * 0.5;
                        this.color = '#EEEEFF';
                        this.glowColor = '#88CCFF';
                        this.angle = Math.random() * Math.PI * 2;
                        this.rotSpeed = 0.5 + Math.random() * 2;
                        this.sparkleTimer = Math.random() * 3;
                        this.sparkleInterval = 2 + Math.random() * 4;
                        break;
                    case 'prism_beam':
                        this.x = Math.random() * canvas.width;
                        this.y = -50;
                        this.size = 0;
                        this.alpha = 0.08 + Math.random() * 0.07;
                        this.color = '#88CCFF';
                        this.life = 8;
                        this.beamAngle = (Math.random() - 0.5) * 10;
                        break;

                    // --- B6: Fire Nebula — Ember Storm ---
                    case 'ember':
                        this.x = Math.random() * canvas.width;
                        this.y = canvas.height + 10;
                        this.size = 2 + Math.random() * 3;
                        this.speed = 60 + Math.random() * 100;
                        this.phase = Math.random() * Math.PI * 2;
                        this.rotRadius = 15 + Math.random() * 25;
                        this.rotSpeed = 3 + Math.random() * 5;
                        this.alpha = 0.5 + Math.random() * 0.4;
                        this.color = Math.random() < 0.5 ? '#FF4400' : '#FFAA00';
                        this.life = 3 + Math.random() * 2;
                        break;
                    case 'ash_cloud':
                        this.x = Math.random() * canvas.width;
                        this.y = Math.random() * canvas.height;
                        this.size = 100 + Math.random() * 100;
                        this.speed = 25;
                        this.drift = (Math.random() - 0.5) * 10;
                        this.alpha = 0.15 + Math.random() * 0.15;
                        this.color = '#443333';
                        this.life = 6 + Math.random() * 4;
                        break;

                    // --- B7: Storm Belt — Lightning Cage ---
                    case 'lightning_strike':
                        this.y = Math.random() * canvas.height;
                        this.x = Math.random() * canvas.width * 0.3;
                        this.size = 0;
                        this.alpha = 0.7 + Math.random() * 0.3;
                        this.color = '#FFFFFF';
                        this.glowColor = '#4466FF';
                        this.strikeLen = 40 + Math.random() * canvas.width * 0.5;
                        this.life = 0.15;
                        break;
                    case 'static_band':
                        this.y = Math.random() * canvas.height;
                        this.x = 0;
                        this.size = 4;
                        this.speed = 30 + Math.random() * 50;
                        this.alpha = 0.1 + Math.random() * 0.1;
                        this.color = '#4466FF';
                        this.life = 2 + Math.random() * 2;
                        break;
                    case 'rain_drop':
                        this.x = Math.random() * canvas.width;
                        this.y = -10;
                        this.size = 1;
                        this.speed = 200 + Math.random() * 300;
                        this.drift = 15;
                        this.alpha = 0.3 + Math.random() * 0.3;
                        this.color = '#CCDDFF';
                        this.life = canvas.height / this.speed + 0.2;
                        break;

                    // --- B8: Derelict Fleet — Drifting Debris ---
                    case 'debris':
                        this.size = 16 + Math.random() * 16;
                        this.speed = (Math.random() - 0.5) * 80;
                        this.drift = (Math.random() - 0.5) * 80;
                        this.alpha = 0.4 + Math.random() * 0.4;
                        this.color = '#555566';
                        this.edgeColor = '#886644';
                        this.angle = Math.random() * Math.PI * 2;
                        this.rotSpeed = 0.3 + Math.random() * 1.5;
                        this.life = 4 + Math.random() * 3;
                        break;
                    case 'beacon_flash':
                        this.x = Math.random() * canvas.width * 0.8;
                        this.y = Math.random() * canvas.height * 0.6;
                        this.size = 40;
                        this.alpha = 0.15;
                        this.color = '#FF2222';
                        this.life = 0.3;
                        this.onCycle = true;
                        break;
                    case 'coolant_gas':
                        this.x = Math.random() * canvas.width;
                        this.y = Math.random() * canvas.height * 0.6 + canvas.height * 0.2;
                        this.size = 10;
                        this.drift = (Math.random() - 0.5) * 30;
                        this.alpha = 0.08 + Math.random() * 0.12;
                        this.color = '#33FF33';
                        this.life = 3 + Math.random() * 2;
                        this.maxSize = this.size + 60;
                        break;

                    // --- B9: Xenomorph Hive — Organic Seepage ---
                    case 'acid_drip':
                        this.y = -10;
                        this.x = Math.random() * canvas.width;
                        this.size = 3;
                        this.speed = 60 + Math.random() * 90;
                        this.drift = 0;
                        this.alpha = 0.4 + Math.random() * 0.4;
                        this.color = '#33FF33';
                        this.life = canvas.height / this.speed + 0.2;
                        break;
                    case 'vein_pulse':
                        this.x = Math.random() * canvas.width;
                        this.y = Math.random() * canvas.height;
                        this.size = 2 + Math.random() * 4;
                        this.alpha = 0.2 + Math.random() * 0.3;
                        this.color = Math.random() < 0.5 ? '#6633AA' : '#CC6677';
                        this.life = 1.2;
                        this.pulsePhase = Math.random() * Math.PI * 2;
                        break;
                    case 'spore':
                        this.size = 2 + Math.random() * 3;
                        this.speed = (Math.random() - 0.5) * 40;
                        this.drift = (Math.random() - 0.5) * 40;
                        this.alpha = 0.15 + Math.random() * 0.15;
                        this.color = '#CC6677';
                        this.life = 5 + Math.random() * 3;
                        break;

                    // --- B10: Core Rift — Reality Tears ---
                    case 'code_stream':
                        this.x = Math.random() * canvas.width;
                        this.y = -20;
                        this.size = 6;
                        this.speed = 80 + Math.random() * 150;
                        this.drift = 0;
                        this.alpha = 0.2 + Math.random() * 0.3;
                        this.color = '#00FF41';
                        this.codeChar = String.fromCharCode(0x30 + Math.floor(Math.random() * 16)).toString(16).toUpperCase();
                        this.life = canvas.height / this.speed + 0.5;
                        break;
                    case 'rift_tear':
                        this.x = Math.random() * canvas.width * 0.7 + canvas.width * 0.1;
                        this.y = Math.random() * canvas.height * 0.5 + canvas.height * 0.2;
                        this.size = 20 + Math.random() * 40;
                        this.alpha = 0.3 + Math.random() * 0.3;
                        this.color = '#FF0088';
                        this.life = 0.8 + Math.random() * 1.2;
                        this.pulsePhase = Math.random() * Math.PI * 2;
                        break;
                    case 'echo_shard':
                        this.size = 8 + Math.random() * 12;
                        this.speed = 5 + Math.random() * 20;
                        this.drift = (Math.random() - 0.5) * 10;
                        this.alpha = 0.15;
                        this.color = '#FFFFFF';
                        this.life = 1.5;
                        break;

                    default:
                        // fallback: simple bioluminescent mote
                        this.size = 2 + Math.random() * 3;
                        this.speed = 15 + Math.random() * 25;
                        this.drift = Math.sin(Math.random() * Math.PI * 2) * 40;
                        this.phase = Math.random() * Math.PI * 2;
                        this.alpha = 0.4 + Math.random() * 0.5;
                        this.color = '#00FFFF';
                        this.life = 5;
                }
            }

            update(dt) {
                this.life -= dt;
                if (this.life <= 0) { this.alive = false; return; }

                switch (this.type) {
                    case 'mote':
                        this.x -= this.speed * dt;
                        this.phase += this.alphaPulseSpeed * dt;
                        const moteAlpha = 0.4 + Math.sin(this.phase) * 0.3;
                        this.alpha = Math.max(0.1, moteAlpha);
                        this.y += Math.sin(this.phase * 0.7) * this.drift * dt;
                        if (this.x < -10) { this.x = canvas.width + 10; this.y = Math.random() * canvas.height; }
                        break;
                    case 'vent_smoke':
                        this.y -= this.speed * dt;
                        this.x += this.drift * dt;
                        this.size += dt * 8;
                        this.alpha = Math.max(0, this.life / 4);
                        if (this.y < -30) this.alive = false;
                        break;
                    case 'rust_flake':
                        this.x += this.speed * dt;
                        this.y += this.drift * dt;
                        this.angle += this.rotSpeed * dt;
                        if (this.x < -30) this.x = canvas.width + 30;
                        if (this.x > canvas.width + 30) this.x = -30;
                        if (this.y < -30) this.y = canvas.height + 30;
                        if (this.y > canvas.height + 30) this.y = -30;
                        break;
                    case 'neon_glow':
                        this.alpha = Math.max(0, this.life / 0.5) * 0.08;
                        break;
                    case 'tesla_bolt':
                        break; // static bolt, dies on timeout
                    case 'coolant_drip':
                        this.y += this.speed * dt;
                        if (this.y > canvas.height) { this.alive = false; }
                        break;
                    case 'plasma_ribbon':
                        this.x -= this.speed * dt;
                        this.phase += dt;
                        this.y += Math.sin(this.phase) * this.drift * dt;
                        this.alpha = Math.max(0.05, this.life / 5 * 0.2);
                        if (this.x < -100) this.alive = false;
                        break;
                    case 'storm_flash':
                        break; // one-shot
                    case 'ice_crystal':
                        this.x -= this.speed * dt;
                        this.y += this.drift * dt;
                        this.angle += this.rotSpeed * dt;
                        this.sparkleTimer -= dt;
                        if (this.sparkleTimer <= 0) {
                            this.sparkleTimer = this.sparkleInterval;
                        }
                        if (this.x < -20) { this.x = canvas.width + 20; this.y = Math.random() * canvas.height; }
                        if (this.y < -20) this.y = canvas.height + 20;
                        if (this.y > canvas.height + 20) this.y = -20;
                        break;
                    case 'prism_beam':
                        this.beamAngle += Math.sin(this.life * 0.5) * dt * 10;
                        break;
                    case 'ember':
                        this.y -= this.speed * dt;
                        this.phase += this.rotSpeed * dt;
                        this.x += Math.sin(this.phase) * this.rotRadius * dt * 0.1;
                        if (this.y < -20) this.alive = false;
                        break;
                    case 'ash_cloud':
                        this.x -= this.speed * dt;
                        this.y += this.drift * dt;
                        if (this.x < -150) this.alive = false;
                        break;
                    case 'lightning_strike':
                        break; // one-shot
                    case 'static_band':
                        this.y += this.speed * dt;
                        if (this.y > canvas.height + 10) this.y = -10;
                        break;
                    case 'rain_drop':
                        this.y += this.speed * dt;
                        this.x += this.drift * dt;
                        if (this.y > canvas.height + 10) this.alive = false;
                        break;
                    case 'debris':
                        this.x += this.speed * dt;
                        this.y += this.drift * dt;
                        this.angle += this.rotSpeed * dt;
                        if (this.x < -50) this.x = canvas.width + 50;
                        if (this.x > canvas.width + 50) this.x = -50;
                        if (this.y < -50) this.y = canvas.height + 50;
                        if (this.y > canvas.height + 50) this.y = -50;
                        break;
                    case 'beacon_flash':
                        break; // one-shot
                    case 'coolant_gas':
                        this.x += this.drift * dt;
                        this.size = Math.min(this.maxSize, this.size + dt * 20);
                        this.alpha = Math.max(0.02, this.life / 3 * 0.10);
                        break;
                    case 'acid_drip':
                        this.y += this.speed * dt;
                        if (this.y > canvas.height) this.alive = false;
                        break;
                    case 'vein_pulse':
                        this.pulsePhase += dt * 4.5;
                        this.alpha = 0.2 + Math.sin(this.pulsePhase) * 0.3;
                        this.life = 1.2; // persist until manually removed
                        break;
                    case 'spore':
                        this.x += this.speed * dt;
                        this.y += this.drift * dt;
                        if (this.x < -20) this.x = canvas.width + 20;
                        if (this.x > canvas.width + 20) this.x = -20;
                        if (this.y < -20) this.y = canvas.height + 20;
                        if (this.y > canvas.height + 20) this.y = -20;
                        break;
                    case 'code_stream':
                        this.y += this.speed * dt;
                        if (this.y > canvas.height + 20) this.alive = false;
                        break;
                    case 'rift_tear':
                        this.pulsePhase += dt * 3;
                        this.alpha = 0.15 + Math.sin(this.pulsePhase) * 0.15;
                        this.life = Math.max(0, this.life); // countdown handled above
                        break;
                    case 'echo_shard':
                        this.x -= this.speed * dt;
                        this.y += this.drift * dt;
                        this.alpha = Math.max(0, this.life / 1.5 * 0.15);
                        break;
                }
            }

            draw() {} // No-op — rendered via offscreen buffer
        }

        // Spawning helper: creates biome-appropriate particles each frame
        function spawnBiomeParticles(dt) {
            if (!window.LevelManager || !LevelManager.currentLevelConfig) return;
            const settings = LevelManager.currentLevelConfig.particleSettings;
            if (!settings) return;

            // Accumulator-based spawning to avoid frame-rate dependency
            envSpawnAccum += dt;

            // 1. Primary particle (accumulated spawning)
            if (settings.primary) {
                const rate = settings.primary.rate;
                const type = settings.primary.type;
                while (envSpawnAccum >= rate) {
                    envSpawnAccum -= rate;
                    envParticles.push(new EnvironmentParticle(type));
                }
            }

            // 2. Secondary particle (chance or rate)
            if (settings.secondary) {
                const sec = settings.secondary;
                if (sec.rate) {
                    while (envSpawnAccum >= sec.rate) {
                        envSpawnAccum -= sec.rate;
                        envParticles.push(new EnvironmentParticle(sec.type));
                    }
                } else if (sec.chance) {
                    if (Math.random() < dt * sec.chance) {
                        envParticles.push(new EnvironmentParticle(sec.type));
                    }
                }
            }

            // 3. Tertiary particle (chance or rate)
            if (settings.tertiary) {
                const tert = settings.tertiary;
                if (tert.rate) {
                    while (envSpawnAccum >= tert.rate) {
                        envSpawnAccum -= tert.rate;
                        envParticles.push(new EnvironmentParticle(tert.type));
                    }
                } else if (tert.chance) {
                    if (Math.random() < dt * tert.chance) {
                        envParticles.push(new EnvironmentParticle(tert.type));
                    }
                }
            }

            // Cap accumulator
            envSpawnAccum = Math.min(envSpawnAccum, 1.0);
        }

        // Offscreen buffer for environmental particles (redrawn every 150ms)
        const envBuffer = new OffscreenBuffer(canvas.width, canvas.height);
        envBuffer.renderInterval = 0.15;

        function rebuildEnvBuffer(offCtx) {
            envParticles.forEach(p => {
                if (!p.alive) return;
                offCtx.save();
                offCtx.globalAlpha = p.alpha;
                switch (p.type) {
                    case 'mote':
                        offCtx.fillStyle = p.color;
                        offCtx.shadowColor = p.color;
                        offCtx.shadowBlur = p.glowSize;
                        offCtx.beginPath();
                        offCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        offCtx.fill();
                        break;
                    case 'vent_smoke':
                        offCtx.fillStyle = p.color;
                        offCtx.globalAlpha = Math.min(p.alpha, 0.25);
                        offCtx.beginPath();
                        offCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        offCtx.fill();
                        break;
                    case 'rust_flake':
                        offCtx.fillStyle = p.color;
                        offCtx.translate(p.x, p.y);
                        offCtx.rotate(p.angle);
                        offCtx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.6);
                        offCtx.rotate(-p.angle);
                        offCtx.translate(-p.x, -p.y);
                        break;
                    case 'neon_glow':
                        const ng = offCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                        ng.addColorStop(0, p.color);
                        ng.addColorStop(1, 'transparent');
                        offCtx.fillStyle = ng;
                        offCtx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
                        break;
                    case 'tesla_bolt':
                        if (p.points && p.points.length > 1) {
                            offCtx.strokeStyle = p.color;
                            offCtx.lineWidth = p.lineWidth;
                            offCtx.shadowColor = p.color;
                            offCtx.shadowBlur = 6;
                            offCtx.beginPath();
                            offCtx.moveTo(p.points[0].x, p.points[0].y);
                            for (let i = 1; i < p.points.length; i++) {
                                offCtx.lineTo(p.points[i].x, p.points[i].y);
                            }
                            offCtx.stroke();
                            offCtx.shadowBlur = 0;
                            // White core
                            offCtx.strokeStyle = '#FFFFFF';
                            offCtx.lineWidth = p.lineWidth * 0.4;
                            offCtx.stroke();
                        }
                        break;
                    case 'coolant_drip':
                        offCtx.fillStyle = p.color;
                        offCtx.fillRect(p.x - 2, p.y - 6, 4, 12);
                        break;
                    case 'plasma_ribbon':
                        const grd = offCtx.createLinearGradient(p.x, p.y - p.size, p.x, p.y + p.size);
                        grd.addColorStop(0, 'transparent');
                        grd.addColorStop(0.3, p.color === '#00BFFF' ? '#00BFFF' : '#FF00FF');
                        grd.addColorStop(0.7, p.color === '#00BFFF' ? '#FF00FF' : '#00BFFF');
                        grd.addColorStop(1, 'transparent');
                        offCtx.fillStyle = grd;
                        offCtx.fillRect(p.x - p.size * 0.3, p.y - p.size, p.size * 0.6, p.size * 2);
                        break;
                    case 'storm_flash':
                        offCtx.fillStyle = '#FFFFFF';
                        offCtx.fillRect(0, 0, canvas.width, canvas.height);
                        break;
                    case 'ice_crystal':
                        // Hexagonal crystal
                        offCtx.fillStyle = p.color;
                        offCtx.translate(p.x, p.y);
                        offCtx.rotate(p.angle);
                        offCtx.beginPath();
                        for (let i = 0; i < 6; i++) {
                            const a = (Math.PI / 3) * i;
                            const r = p.size;
                            if (i === 0) offCtx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                            else offCtx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                        }
                        offCtx.closePath();
                        offCtx.fill();
                        if (p.sparkleTimer > 0) {
                            offCtx.fillStyle = p.glowColor;
                            offCtx.shadowColor = p.glowColor;
                            offCtx.shadowBlur = p.size * 2;
                            offCtx.fill();
                            offCtx.shadowBlur = 0;
                        }
                        offCtx.rotate(-p.angle);
                        offCtx.translate(-p.x, -p.y);
                        break;
                    case 'prism_beam':
                        offCtx.save();
                        offCtx.translate(p.x, canvas.height/2);
                        offCtx.rotate((p.beamAngle || 0) * Math.PI / 180);
                        const beamGrd = offCtx.createLinearGradient(0, -canvas.height, 0, canvas.height);
                        beamGrd.addColorStop(0, 'transparent');
                        beamGrd.addColorStop(0.3, '#EEEEFF');
                        beamGrd.addColorStop(0.5, '#88CCFF');
                        beamGrd.addColorStop(0.7, '#EEEEFF');
                        beamGrd.addColorStop(1, 'transparent');
                        offCtx.fillStyle = beamGrd;
                        offCtx.fillRect(-2, -canvas.height, 4, canvas.height * 2);
                        offCtx.restore();
                        break;
                    case 'ember':
                        offCtx.fillStyle = p.color;
                        offCtx.shadowColor = p.color;
                        offCtx.shadowBlur = p.size * 3;
                        offCtx.beginPath();
                        offCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        offCtx.fill();
                        offCtx.shadowBlur = 0;
                        break;
                    case 'ash_cloud':
                        const ashGrd = offCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                        ashGrd.addColorStop(0, p.color);
                        ashGrd.addColorStop(0.7, p.color);
                        ashGrd.addColorStop(1, 'transparent');
                        offCtx.fillStyle = ashGrd;
                        offCtx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
                        break;
                    case 'lightning_strike':
                        offCtx.strokeStyle = p.color;
                        offCtx.lineWidth = 2;
                        offCtx.shadowColor = p.glowColor;
                        offCtx.shadowBlur = 10;
                        offCtx.beginPath();
                        offCtx.moveTo(p.x, p.y);
                        let cx = p.x;
                        let cy = p.y;
                        const steps = 8;
                        const segLen = p.strikeLen / steps;
                        for (let i = 0; i < steps; i++) {
                            cx += segLen;
                            cy += (Math.random() - 0.5) * 60;
                            offCtx.lineTo(cx, cy);
                        }
                        offCtx.stroke();
                        offCtx.shadowBlur = 0;
                        // White core
                        offCtx.strokeStyle = '#FFFFFF';
                        offCtx.lineWidth = 0.8;
                        offCtx.stroke();
                        break;
                    case 'static_band':
                        offCtx.fillStyle = p.color;
                        offCtx.fillRect(0, p.y, canvas.width, p.size);
                        break;
                    case 'rain_drop':
                        offCtx.fillStyle = p.color;
                        offCtx.fillRect(p.x, p.y, 1.5, 8);
                        break;
                    case 'debris':
                        offCtx.fillStyle = p.color;
                        offCtx.translate(p.x, p.y);
                        offCtx.rotate(p.angle);
                        offCtx.fillRect(-p.size/2, -p.size/3, p.size, p.size/1.5);
                        offCtx.fillStyle = p.edgeColor;
                        offCtx.fillRect(-p.size/2, -p.size/6, p.size, 2);
                        offCtx.rotate(-p.angle);
                        offCtx.translate(-p.x, -p.y);
                        break;
                    case 'beacon_flash':
                        const bg = offCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                        bg.addColorStop(0, p.color);
                        bg.addColorStop(1, 'transparent');
                        offCtx.fillStyle = bg;
                        offCtx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
                        break;
                    case 'coolant_gas':
                        const cgGrd = offCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                        cgGrd.addColorStop(0, p.color);
                        cgGrd.addColorStop(1, 'transparent');
                        offCtx.fillStyle = cgGrd;
                        offCtx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
                        break;
                    case 'acid_drip':
                        offCtx.fillStyle = p.color;
                        offCtx.shadowColor = p.color;
                        offCtx.shadowBlur = 4;
                        offCtx.fillRect(p.x - 3, p.y - 7, 6, 14);
                        offCtx.shadowBlur = 0;
                        break;
                    case 'vein_pulse':
                        offCtx.fillStyle = p.color;
                        offCtx.beginPath();
                        offCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        offCtx.fill();
                        break;
                    case 'spore':
                        offCtx.fillStyle = p.color;
                        offCtx.beginPath();
                        offCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        offCtx.fill();
                        break;
                    case 'code_stream':
                        offCtx.fillStyle = p.color;
                        offCtx.font = 'bold 10px monospace';
                        offCtx.textAlign = 'center';
                        offCtx.fillText(p.codeChar, p.x, p.y);
                        break;
                    case 'rift_tear':
                        offCtx.strokeStyle = p.color;
                        offCtx.lineWidth = 2;
                        offCtx.shadowColor = p.color;
                        offCtx.shadowBlur = 12;
                        // Draw jagged crack
                        offCtx.beginPath();
                        offCtx.moveTo(p.x - p.size * 0.8, p.y - p.size * 0.6);
                        for (let i = 1; i < 6; i++) {
                            const rx = p.x - p.size * 0.8 + (Math.random() * p.size * 1.6);
                            const ry = p.y - p.size * 0.6 + (i / 6) * p.size * 1.2;
                            offCtx.lineTo(rx, ry);
                        }
                        offCtx.stroke();
                        offCtx.shadowBlur = 0;
                        break;
                    case 'echo_shard':
                        offCtx.fillStyle = p.color;
                        offCtx.globalAlpha = p.alpha;
                        offCtx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
                        break;
                    default:
                        offCtx.fillStyle = p.color || '#00FFFF';
                        offCtx.fillRect(p.x, p.y, p.size || 2, p.size || 2);
                }
                offCtx.restore();
            });
        }

        // --- Screen Shake & Cavern Navigation Helper Functions ---
        let shakeDuration = 0;
        let shakeIntensity = 0;

        // Biome shake tint lookup (§6.1) — maps activeBiome number to flash color
        const BIOME_SHAKE_TINTS = {
            1: '#0A2244', 2: '#CC5500', 3: '#CC0000', 4: '#FF00FF', 5: '#88CCFF',
            6: '#FF4400', 7: '#CCDDFF', 8: '#FF2222', 9: '#33FF33', 10: '#FF0088'
        };
        function triggerScreenShake(duration, intensity) {
            shakeDuration = duration;
            shakeIntensity = intensity;
            // Trigger biome-tinted screen flash (§6.1)
            screenFlashAlpha = Math.min(0.15, intensity / 200);
            screenFlashColor = BIOME_SHAKE_TINTS[biomeLevel] || '#FFFFFF';
        }

        let cavernNavActive = false;
        let cavernTimer = 0;
        let cavernStage = ''; // 'intro', 'left_fork', 'slow_down', 'right_turn', 'exit'
        function startCavernNavigation() {
            cavernNavActive = true;
            cavernTimer = 0;
            cavernStage = 'intro';
        }

        let stormActive = false;
        let pathfinderActive = false;
        let activeBiomeName = '1: Abyssal Trench';

        // --- Text Wrapping Helper ---
        function wrapText(context, text, x, y, maxWidth, lineHeight) {
            const words = text.split(' ');
            let line = '';
            for (let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + ' ';
                let metrics = context.measureText(testLine);
                let testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    context.fillText(line, x, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            context.fillText(line, x, y);
        }

