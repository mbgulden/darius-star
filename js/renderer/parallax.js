// js/renderer/parallax.js — ParallaxLayer, Star, OffscreenBuffer, bg preloading (GRO-1170)
// Extracted from renderer.js. Uses globals: ctx, canvas

        // --- Parallax Background System ---
        // Image-based parallax layers (bg_nebula, bg_city) + procedural starfield

        const bgImages = {};

        // === Biome background file mapping ===
        // Maps biome number → canonical directory name for asset paths.
        // Uses far/near layer files when available; falls back to strip or procedural.
        const BIOME_BG_MAP = {
            1: 'abyssal_trench',
            2: 'coral_graveyard',
            3: 'coelacanth_lair',
            4: 'nebula_drift',
            5: 'ice_rings',         // also has ice_ring duplicates on disk
            6: 'inferno_core',      // also known as fire_nebula
            7: 'storm_belt',
            8: 'derelict_fleet',
            9: 'xenomorph_hive',    // has asset files
            10: 'core_rift'         // no asset files yet — procedural fallback
        };

        // Known-missing biomes that have zero background image files
        const BIOMES_WITHOUT_ASSETS = new Set([10]);

        // Preloads far + near (or strip fallback) images for a single biome.
        // Returns immediately; images load asynchronously.
        // Keys: 'bg_B_far', 'bg_B_near' (or 'bg_B_strip' when layer not on disk).
        function preloadBiomeBackground(biomeNum) {
            const dirName = BIOME_BG_MAP[biomeNum];
            if (!dirName) return;
            const base = `assets/sprites/backgrounds/bg_${dirName}`;

            const farKey  = `bg_${biomeNum}_far`;
            const nearKey = `bg_${biomeNum}_near`;

            // Only preload if we don't already have the images
            if (!bgImages[farKey]) {
                bgImages[farKey] = new Image();
                bgImages[farKey].src = `${base}_far.png`;
            }
            if (!bgImages[nearKey]) {
                bgImages[nearKey] = new Image();
                bgImages[nearKey].src = `${base}_near.png`;
            }
        }

        // Sets both parallax layers to the correct far/near backgrounds for a biome.
        // Falls back to strip image or procedural generation when assets are missing.
        function setBiomeBackgrounds(biomeNum) {
            if (typeof biomeNum !== 'number' || biomeNum < 1) biomeNum = 1;

            // Preload images for this biome (no-op if already loaded)
            if (!BIOMES_WITHOUT_ASSETS.has(biomeNum)) {
                preloadBiomeBackground(biomeNum);
            }

            const farKey  = `bg_${biomeNum}_far`;
            const nearKey = `bg_${biomeNum}_near`;

            if (bgLayers.length > 0) bgLayers[0].setKey(farKey);
            if (bgLayers.length > 1) bgLayers[1].setKey(nearKey);
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
                // Lazy-resolve: bgImages is populated asynchronously by preloadBiomeBackground()
                return bgImages[this.key] || null;
            }

            setKey(newKey) {
                // Switch to a different background image (biome transition)
                // Map biome number keys to named strip files
                // Strip _far/_near suffix for the biome name lookup (e.g. bg_2_far → bg_2)
                const baseKey = newKey.replace(/(_far|_near)$/, '');
                const BIOME_STRIP_MAP = {
                    'bg_1': 'abyssal_trench', 'bg_2': 'coral_graveyard',
                    'bg_3': 'coelacanth_lair', 'bg_4': 'nebula_drift',
                    'bg_5': 'ice_rings', 'bg_6': 'inferno_core',
                    'bg_7': 'storm_belt', 'bg_8': 'derelict_fleet',
                    'bg_9': 'xenomorph_hive', 'bg_10': 'core_rift'
                };
                const stripName = BIOME_STRIP_MAP[baseKey] || 'abyssal_trench';
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
                // Use scaled width so offset wrap aligns with draw() tiling
                let w;
                if (img && img.complete && img.naturalWidth > 0) {
                const scaleY = canvas.height / img.naturalHeight;
                w = img.naturalWidth * scaleY;
                } else {
                const match = this.key.match(/bg_(\d+)/);
                const biomeNum = match ? parseInt(match[1]) : 1;
                const procBg = biomeBgCanvases[biomeNum] || generateBiomeBackground(biomeNum);
                w = procBg ? procBg.width : (canvas.width || 800);
            }
                // Guard against zero-width (uninitialized canvas or broken image)
                if (w <= 0) w = canvas.width || 800;
                this.offset = (this.offset + this.speed * dt) % w;
            }
                
            draw() {
                const img = this.getImg();
                // Fall back to procedural background if image not loaded
                if (!img || !img.complete || img.naturalWidth === 0) {
                // Try procedural: extract biome number from key (bg_1 ??? 1)
                let biomeNum = 1;
                const match = this.key.match(/bg_(\d+)/);
                if (match) biomeNum = parseInt(match[1]);
                const procBg = generateBiomeBackground(biomeNum);
                if (procBg) {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                const w = procBg.width;
                const h = procBg.height;
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
                const scaleY = canvas.height / img.naturalHeight;
                const w = img.naturalWidth * scaleY;
                const h = canvas.height;
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
        let starBuffer = null;
        const stars = [];

        function initializeRendererBuffers() {
            // renderer.js loads before the inline game setup script. Build canvas-sized
            // buffers only after index.html has created `canvas`/`ctx`.
            if (!starBuffer) {
                starBuffer = new OffscreenBuffer(canvas.width, canvas.height);
                starBuffer.renderInterval = 0.25; // seconds
            }
            if (stars.length === 0) {
                for (let i = 0; i < 35; i++) stars.push(new Star(1));   // far
                for (let i = 0; i < 22; i++) stars.push(new Star(2));   // mid
                for (let i = 0; i < 10; i++) stars.push(new Star(3));   // near
            }
            if (!envBuffer) {
                envBuffer = new OffscreenBuffer(canvas.width, canvas.height);
                envBuffer.renderInterval = 0.15;
            }
        }

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
