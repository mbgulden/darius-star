// js/renderer/parallax.js — Multi-Layer High-Fidelity Journey Backgrounds & Landmarks (GRO-1170)
// Implements 100-Level progressive visual journey with unique landmarks across all 10 biomes.
// Uses globals: ctx, canvas, gameTime, LevelManager, BIOME_DATA

const bgImages = {};

// === Biome background file mapping ===
const BIOME_BG_MAP = {
    1: 'abyssal_trench',
    2: 'coral_graveyard',
    3: 'coelacanth_lair',
    4: 'nebula_drift',
    5: 'ice_rings',
    6: 'inferno_core',
    7: 'storm_belt',
    8: 'derelict_fleet',
    9: 'xenomorph_hive',
    10: 'core_rift'
};

const BIOMES_WITHOUT_ASSETS = new Set([10]);

function preloadBiomeBackground(biomeNum) {
    const dirName = BIOME_BG_MAP[biomeNum];
    if (!dirName) return;
    const base = `assets/sprites/backgrounds/bg_${dirName}`;

    const farKey  = `bg_${biomeNum}_far`;
    const nearKey = `bg_${biomeNum}_near`;

    if (!bgImages[farKey]) {
        bgImages[farKey] = new Image();
        bgImages[farKey].src = `${base}_far.png`;
    }
    if (!bgImages[nearKey]) {
        bgImages[nearKey] = new Image();
        bgImages[nearKey].src = `${base}_near.png`;
    }
}

function setBiomeBackgrounds(biomeNum, levelNum = 1) {
    if (typeof biomeNum !== 'number' || biomeNum < 1) biomeNum = 1;
    if (typeof levelNum !== 'number' || levelNum < 1) levelNum = 1;

    if (!BIOMES_WITHOUT_ASSETS.has(biomeNum)) {
        preloadBiomeBackground(biomeNum);
    }

    const farKey  = `bg_${biomeNum}_far`;
    const nearKey = `bg_${biomeNum}_near`;

    if (typeof bgLayers !== 'undefined' && Array.isArray(bgLayers)) {
        if (bgLayers.length > 0 && bgLayers[0].setKey) bgLayers[0].setKey(farKey);
        if (bgLayers.length > 1 && bgLayers[1].setKey) bgLayers[1].setKey(nearKey);
    }

    if (JourneyBackgroundRenderer) {
        JourneyBackgroundRenderer.setLevel(biomeNum, levelNum);
    }
}

// ─── Procedural High-Fidelity Biome & Level Background Generator ─────────────
const biomeBgCanvases = {};

function generateBiomeBackground(biomeNum, levelNum = 1) {
    const key = `${biomeNum}_${levelNum}`;
    if (biomeBgCanvases[key]) return biomeBgCanvases[key];

    const c = document.createElement('canvas');
    const baseW = (typeof canvas !== 'undefined' && canvas.width) ? canvas.width : 800;
    const baseH = (typeof canvas !== 'undefined' && canvas.height) ? canvas.height : 450;
    c.width = baseW * 2;
    c.height = baseH;
    const bctx = c.getContext('2d');

    const lvlInfo = (typeof BIOME_DATA !== 'undefined' && BIOME_DATA.getLevelInfo)
        ? BIOME_DATA.getLevelInfo(biomeNum, levelNum)
        : null;

    const skyGrad = (lvlInfo && lvlInfo.skyGradient) ? lvlInfo.skyGradient : ['#020418', '#06102a', '#0a1a3a'];
    const accent = (lvlInfo && lvlInfo.accentColor) ? lvlInfo.accentColor : '#00aacc';

    // 1. Multi-stop Deep Atmospheric Sky Gradient
    const grad = bctx.createLinearGradient(0, 0, 0, c.height);
    grad.addColorStop(0, skyGrad[0]);
    grad.addColorStop(0.5, skyGrad[1]);
    grad.addColorStop(1, skyGrad[2]);
    bctx.fillStyle = grad;
    bctx.fillRect(0, 0, c.width, c.height);

    // 2. High-Fidelity Celestial / Abyssal Nebula Clouds
    const seed = biomeNum * 137.5 + levelNum * 31.7;
    for (let i = 0; i < 7; i++) {
        const nx = ((Math.sin(seed + i * 2.3) * 0.5 + 0.5) * c.width);
        const ny = ((Math.cos(seed + i * 3.1) * 0.5 + 0.5) * c.height);
        const nr = 70 + (Math.sin(seed + i * 1.7) * 0.5 + 0.5) * 110;
        const ng = bctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        ng.addColorStop(0, accent + '33');
        ng.addColorStop(0.4, skyGrad[1] + '44');
        ng.addColorStop(0.8, skyGrad[0] + '22');
        ng.addColorStop(1, 'transparent');
        bctx.fillStyle = ng;
        bctx.fillRect(nx - nr, ny - nr, nr * 2, nr * 2);
    }

    // 3. Dense Multi-Spectral Starfield
    for (let i = 0; i < 240; i++) {
        const sx = ((Math.sin(seed * 5.3 + i * 13.7) * 0.5 + 0.5) * c.width);
        const sy = ((Math.cos(seed * 7.1 + i * 17.3) * 0.5 + 0.5) * c.height);
        const sr = 0.3 + Math.abs(Math.sin(i * 3.1)) * 1.7;
        const sa = 0.3 + Math.abs(Math.sin(i * 5.7)) * 0.7;
        bctx.fillStyle = `rgba(255, 255, 255, ${sa.toFixed(2)})`;
        bctx.beginPath();
        bctx.arc(sx, sy, sr, 0, Math.PI * 2);
        bctx.fill();
    }

    // 4. Accent Celestial Objects
    for (let i = 0; i < 20; i++) {
        const ax = ((Math.sin(seed * 3.2 + i * 19.1) * 0.5 + 0.5) * c.width);
        const ay = ((Math.cos(seed * 4.9 + i * 23.7) * 0.5 + 0.5) * c.height);
        bctx.fillStyle = accent + 'bb';
        bctx.beginPath();
        bctx.arc(ax, ay, 1.4, 0, Math.PI * 2);
        bctx.fill();
    }

    biomeBgCanvases[key] = c;
    return c;
}

// ─── ParallaxLayer Class (Backwards-compatible + Level Journey integration) ──
class ParallaxLayer {
    constructor(key, speed, yOffset = 0, alpha = 1.0, scale = 1.0) {
        this.key = key;
        this.speed = speed;
        this.yOffset = yOffset;
        this.alpha = alpha;
        this.scale = scale;
        this.offset = 0;
    }

    getImg() {
        return bgImages[this.key] || null;
    }

    setKey(newKey) {
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
        this.offset = 0;
    }

    update(dt) {
        const img = this.getImg();
        let w;
        if (img && img.complete && img.naturalWidth > 0) {
            const scaleY = (canvas.height || 450) / img.naturalHeight;
            w = img.naturalWidth * scaleY;
        } else {
            let biomeNum = 1;
            let levelNum = 1;
            if (typeof LevelManager !== 'undefined') {
                biomeNum = LevelManager.biome || 1;
                levelNum = LevelManager.level || 1;
            }
            const procBg = generateBiomeBackground(biomeNum, levelNum);
            w = procBg ? procBg.width : (canvas.width || 800);
        }
        if (w <= 0) w = canvas.width || 800;
        this.offset = (this.offset + this.speed * dt) % w;
    }

    draw() {
        const img = this.getImg();
        let biomeNum = (typeof LevelManager !== 'undefined') ? (LevelManager.biome || 1) : 1;
        let levelNum = (typeof LevelManager !== 'undefined') ? (LevelManager.level || 1) : 1;

        if (!img || !img.complete || img.naturalWidth === 0) {
            const procBg = generateBiomeBackground(biomeNum, levelNum);
            if (procBg) {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                const w = procBg.width;
                const h = procBg.height;
                const drawX = -this.offset % w;
                const count = Math.ceil((canvas.width || 800) / w) + 1;
                for (let i = 0; i < count; i++) {
                    ctx.drawImage(procBg, drawX + i * w, this.yOffset, w, h);
                }
                ctx.restore();
            }
            return;
        }

        ctx.save();
        ctx.globalAlpha = this.alpha;
        const scaleY = (canvas.height || 450) / img.naturalHeight;
        const w = img.naturalWidth * scaleY;
        const h = canvas.height || 450;
        const drawX = -this.offset;
        const count = Math.ceil((canvas.width || 800) / w) + 1;
        for (let i = 0; i < count; i++) {
            ctx.drawImage(img, drawX + i * w, this.yOffset, w, h);
        }
        ctx.restore();
    }
}

// ─── Unique Journey Landmark Renderer (100 Distinct Level Landmarks) ─────────
class JourneyLandmark {
    constructor(biome, level) {
        this.biome = biome;
        this.level = level;
        this.x = (typeof canvas !== 'undefined' ? canvas.width : 800) + 100;
        this.y = (typeof canvas !== 'undefined' ? canvas.height / 2 : 225);
        this.speed = 28; // Midground parallax velocity
        this.time = Math.random() * Math.PI * 2;
        this.info = (typeof BIOME_DATA !== 'undefined' && BIOME_DATA.getLevelInfo)
            ? BIOME_DATA.getLevelInfo(biome, level)
            : { landmark: 'coral_spire', accentColor: '#00ffff' };
    }

    update(dt) {
        this.x -= this.speed * dt;
        this.time += dt * 1.5;
        // Loop landmark around smoothly so the level feels continuously inhabited
        const wrapX = -450;
        if (this.x < wrapX) {
            this.x = (typeof canvas !== 'undefined' ? canvas.width : 800) + 250;
            this.y = (canvas.height || 450) * (0.25 + (Math.sin(this.time) * 0.5 + 0.5) * 0.5);
        }
    }

    draw(targetCtx) {
        const c = targetCtx || ctx;
        if (!c) return;

        c.save();
        c.translate(this.x, this.y);

        const type = this.info.landmark;
        const accent = this.info.accentColor || '#00ffff';
        const pulse = 1.0 + Math.sin(this.time) * 0.12;

        const spriteKey = 'landmark_' + type;
        const spriteImg = (typeof landmarkSprites !== 'undefined' && landmarkSprites[spriteKey])
            ? landmarkSprites[spriteKey]
            : ((typeof window !== 'undefined' && window.landmarkSprites) ? window.landmarkSprites[spriteKey] : null);

        if (spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
            c.shadowColor = accent;
            c.shadowBlur = 18 * pulse;
            const drawW = 280 * pulse;
            const drawH = 280 * pulse;
            c.drawImage(spriteImg, -drawW / 2, -drawH / 2, drawW, drawH);
            c.restore();
            return;
        }

        c.shadowColor = accent;
        c.shadowBlur = 12;

        if (type === 'coral_spire') {
            // Bioluminescent branching coral pinnacle
            c.fillStyle = '#0f2b38';
            c.strokeStyle = accent;
            c.lineWidth = 2;
            c.beginPath();
            c.moveTo(0, 160);
            c.lineTo(30, 60);
            c.lineTo(70, -80);
            c.lineTo(50, -140);
            c.lineTo(30, -90);
            c.lineTo(10, -40);
            c.lineTo(-30, 20);
            c.lineTo(-50, 160);
            c.closePath();
            c.fill();
            c.stroke();
            // Glowing polyps
            for (let i = 0; i < 6; i++) {
                const px = Math.sin(i * 1.7) * 35 + 20;
                const py = -100 + i * 40;
                c.fillStyle = accent;
                c.beginPath();
                c.arc(px, py, 3.5 * pulse, 0, Math.PI * 2);
                c.fill();
            }
        } else if (type === 'kelp_canopy') {
            // Majestic swaying giant kelp forest pillars
            c.strokeStyle = '#00ff88';
            c.lineWidth = 4;
            c.beginPath();
            for (let i = 0; i < 5; i++) {
                const kx = i * 40 - 80;
                const sway = Math.sin(this.time + i) * 25;
                c.moveTo(kx, 180);
                c.bezierCurveTo(kx + sway, 60, kx - sway, -60, kx + sway * 1.5, -160);
            }
            c.stroke();
            // Spore nodes
            for (let i = 0; i < 8; i++) {
                c.fillStyle = '#88ffaa';
                c.beginPath();
                c.arc(-60 + i * 20, -120 + Math.sin(this.time * 2 + i) * 20, 3, 0, Math.PI * 2);
                c.fill();
            }
        } else if (type === 'frigate_wreck') {
            // Derelict warship hull with blinking warning lights
            c.fillStyle = '#161c28';
            c.strokeStyle = '#3a4b66';
            c.lineWidth = 2;
            c.beginPath();
            c.moveTo(-120, 30);
            c.lineTo(80, -20);
            c.lineTo(140, 10);
            c.lineTo(110, 45);
            c.lineTo(-90, 60);
            c.closePath();
            c.fill();
            c.stroke();
            // Exposed bulkheads & blinking beacons
            c.strokeStyle = '#ff3344';
            c.fillStyle = '#ff3344';
            c.strokeRect(-50, 0, 30, 20);
            if (Math.sin(this.time * 4) > 0) {
                c.shadowColor = '#ff2200';
                c.shadowBlur = 16;
                c.beginPath();
                c.arc(120, 5, 4, 0, Math.PI * 2);
                c.fill();
            }
        } else if (type === 'sensor_buoy') {
            // Precursor tetrahedral telemetry relay
            c.rotate(this.time * 0.4);
            c.strokeStyle = accent;
            c.lineWidth = 2;
            c.strokeRect(-30, -30, 60, 60);
            c.beginPath();
            c.arc(0, 0, 18 * pulse, 0, Math.PI * 2);
            c.stroke();
            c.fillStyle = accent;
            c.beginPath();
            c.arc(0, 0, 6, 0, Math.PI * 2);
            c.fill();
            // Sonar waves
            c.strokeStyle = accent + '44';
            c.beginPath();
            c.arc(0, 0, 45 * pulse, 0, Math.PI * 2);
            c.stroke();
        } else if (type === 'magma_chimney') {
            // Hydrothermal chimney with glowing magma cracks
            c.fillStyle = '#220800';
            c.strokeStyle = '#ff4400';
            c.lineWidth = 2;
            c.beginPath();
            c.moveTo(-40, 160);
            c.lineTo(-15, -90);
            c.lineTo(15, -90);
            c.lineTo(40, 160);
            c.closePath();
            c.fill();
            c.stroke();
            // Lava fissures
            c.fillStyle = '#ff8800';
            c.shadowColor = '#ff5500';
            c.shadowBlur = 18;
            c.fillRect(-6, -85, 12, 60);
        } else if (type === 'ice_berg') {
            // Translucent crystalline pykrete mountain
            c.fillStyle = 'rgba(10, 35, 65, 0.75)';
            c.strokeStyle = '#00e5ff';
            c.lineWidth = 2;
            c.beginPath();
            c.moveTo(-90, 150);
            c.lineTo(-30, -110);
            c.lineTo(20, -140);
            c.lineTo(90, 150);
            c.closePath();
            c.fill();
            c.stroke();
            // Inner crystal facet lines
            c.beginPath();
            c.moveTo(-30, -110);
            c.lineTo(10, 40);
            c.lineTo(90, 150);
            c.stroke();
        } else if (type === 'chrono_cube') {
            // 4D Wireframe hypercube
            c.rotate(this.time * 0.6);
            c.strokeStyle = '#ff00ea';
            c.lineWidth = 1.5;
            c.strokeRect(-40, -40, 80, 80);
            c.strokeRect(-20, -20, 40, 40);
            c.beginPath();
            c.moveTo(-40, -40); c.lineTo(-20, -20);
            c.moveTo(40, -40);  c.lineTo(20, -20);
            c.moveTo(-40, 40);  c.lineTo(-20, 20);
            c.moveTo(40, 40);   c.lineTo(20, 20);
            c.stroke();
        } else if (type === 'chrono_singularity') {
            // Swirling black hole / chrono singularity vortex
            c.rotate(this.time);
            for (let i = 0; i < 4; i++) {
                c.rotate(Math.PI / 2);
                c.strokeStyle = accent;
                c.lineWidth = 2;
                c.beginPath();
                c.arc(0, 0, 35 + i * 8, 0, Math.PI * 0.8);
                c.stroke();
            }
            c.fillStyle = '#000000';
            c.beginPath();
            c.arc(0, 0, 22, 0, Math.PI * 2);
            c.fill();
            c.strokeStyle = accent;
            c.stroke();
        } else {
            // Default ruins / pylon geometry
            c.fillStyle = '#101a28';
            c.strokeStyle = accent;
            c.lineWidth = 2;
            c.fillRect(-25, -120, 50, 260);
            c.strokeRect(-25, -120, 50, 260);
            c.fillStyle = accent;
            c.fillRect(-8, -90, 16, 30);
            c.fillRect(-8, 0, 16, 30);
        }

        c.restore();
    }
}

// ─── Journey Background Renderer Singleton ──────────────────────────────────
const JourneyBackgroundRenderer = {
    biome: 1,
    level: 1,
    currentLandmark: null,

    setLevel(biome, level) {
        this.biome = Math.max(1, Math.min(10, biome));
        this.level = Math.max(1, Math.min(10, level));
        this.currentLandmark = new JourneyLandmark(this.biome, this.level);
    },

    update(dt) {
        if (!this.currentLandmark) {
            this.currentLandmark = new JourneyLandmark(this.biome, this.level);
        }
        this.currentLandmark.update(dt);
    },

    draw(targetCtx) {
        if (this.currentLandmark) {
            this.currentLandmark.draw(targetCtx || ctx);
        }
    }
};

// ─── OffscreenBuffer & Star Field ───────────────────────────────────────────
class OffscreenBuffer {
    constructor(width, height) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        this.dirty = true;
        this.renderInterval = 0;
        this.renderTimer = 0;
    }
    markDirty() { this.dirty = true; }
    rebuild(renderFn) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        renderFn(this.ctx);
        this.dirty = false;
    }
}

class Star {
    constructor(depth) {
        this.depth = depth;
        this.x = Math.random() * (typeof canvas !== 'undefined' ? canvas.width : 800);
        this.y = Math.random() * (typeof canvas !== 'undefined' ? canvas.height : 450);
        this.speed = 20 + depth * 25;
        this.size = 0.5 + depth * 0.4;
        this.twinkle = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 1.5 + Math.random() * 2.5;
        this.color = depth === 3 ? '#ccddff' : (depth === 2 ? '#7799cc' : '#334466');
    }

    update(dt) {
        this.x -= this.speed * dt;
        this.twinkle += this.twinkleSpeed * dt;
        const w = (typeof canvas !== 'undefined' ? canvas.width : 800);
        const h = (typeof canvas !== 'undefined' ? canvas.height : 450);
        if (this.x < -5) {
            this.x = w + 5;
            this.y = Math.random() * h;
        }
    }

    getAlpha() { return 0.4 + Math.sin(this.twinkle) * 0.35; }
}

let starBuffer = null;
const stars = [];

function initializeRendererBuffers() {
    if (!starBuffer && typeof canvas !== 'undefined') {
        starBuffer = new OffscreenBuffer(canvas.width || 800, canvas.height || 450);
        starBuffer.renderInterval = 0.25;
    }
    if (stars.length === 0) {
        for (let i = 0; i < 35; i++) stars.push(new Star(1));
        for (let i = 0; i < 22; i++) stars.push(new Star(2));
        for (let i = 0; i < 10; i++) stars.push(new Star(3));
    }
    if (typeof envBuffer !== 'undefined' && !envBuffer && typeof canvas !== 'undefined') {
        envBuffer = new OffscreenBuffer(canvas.width || 800, canvas.height || 450);
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

// Expose on window for global access
if (typeof window !== 'undefined') {
    window.ParallaxLayer = ParallaxLayer;
    window.OffscreenBuffer = OffscreenBuffer;
    window.Star = Star;
    window.stars = stars;
    window.JourneyLandmark = JourneyLandmark;
    window.JourneyBackgroundRenderer = JourneyBackgroundRenderer;
    window.setBiomeBackgrounds = setBiomeBackgrounds;
    window.preloadBiomeBackground = preloadBiomeBackground;
    window.generateBiomeBackground = generateBiomeBackground;
}
