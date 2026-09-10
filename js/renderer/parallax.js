// js/renderer/parallax.js — Multi-Layer High-Fidelity Journey Backgrounds & Landmarks (GRO-1170)
// Implements 100-Level progressive visual journey with unique landmarks across all 10 biomes.
// Uses globals: ctx, canvas, gameTime, LevelManager, BIOME_DATA

const bgImages = (typeof window !== 'undefined' && window.bgImages) ? window.bgImages : (typeof window !== 'undefined' ? (window.bgImages = {}) : {});

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

const BIOMES_WITHOUT_ASSETS = new Set();

function preloadBiomeBackground(biomeNum) {
    const dirName = BIOME_BG_MAP[biomeNum];
    if (!dirName) return;
    const base = `assets/sprites/backgrounds/bg_${dirName}`;

    const farKey  = `bg_${biomeNum}_far`;
    const nearKey = `bg_${biomeNum}_near`;
    const stripKey = `bg_${biomeNum}_strip`;

    if (!bgImages[farKey]) {
        bgImages[farKey] = new Image();
        bgImages[farKey].src = `${base}_far.png`;
    }
    if (!bgImages[nearKey]) {
        bgImages[nearKey] = new Image();
        bgImages[nearKey].src = `${base}_near.png`;
    }
    if (!bgImages[stripKey]) {
        bgImages[stripKey] = new Image();
        bgImages[stripKey].src = `${base}_strip.png`;
    }
    if (!bgImages[`bg_${biomeNum}`]) {
        bgImages[`bg_${biomeNum}`] = bgImages[farKey];
    }
}

// Preload all 10 biomes immediately so background assets are cached in memory
for (let b = 1; b <= 10; b++) {
    preloadBiomeBackground(b);
}

function setBiomeBackgrounds(biomeNum, levelNum = 1) {
    if (typeof biomeNum !== 'number' || biomeNum < 1) biomeNum = 1;
    if (typeof levelNum !== 'number' || levelNum < 1) levelNum = 1;

    preloadBiomeBackground(biomeNum);

    const farKey  = `bg_${biomeNum}_far`;
    const nearKey = `bg_${biomeNum}_near`;

    if (typeof bgLayers !== 'undefined' && Array.isArray(bgLayers)) {
        if (bgLayers.length > 0 && bgLayers[0].setKey) bgLayers[0].setKey(farKey);
        if (bgLayers.length > 1 && bgLayers[1].setKey) bgLayers[1].setKey(nearKey);
    }

    if (typeof JourneyBackgroundRenderer !== 'undefined' && JourneyBackgroundRenderer.setLevel) {
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

// ─── ParallaxLayer Class (Backwards-compatible + Ultra-Wide >=3000px Support) ──
class ParallaxLayer {
    constructor(key, speed, yOffset = 0, alpha = 1.0, scale = 1.0, anchor = 'fill') {
        this.speed = speed;
        this.yOffset = yOffset;
        this.alpha = alpha;
        this.scale = scale;
        this.anchor = anchor; // 'fill', 'top', 'bottom', 'center'
        this.offset = 0;
        this.setKey(key || 'bg_1_far');
    }

    getImg() {
        if (bgImages[this.key] && bgImages[this.key].complete && bgImages[this.key].naturalWidth > 0) {
            return bgImages[this.key];
        }
        const farKey = `${this.key}_far`;
        const nearKey = `${this.key}_near`;
        if (bgImages[farKey] && bgImages[farKey].complete && bgImages[farKey].naturalWidth > 0) return bgImages[farKey];
        if (bgImages[nearKey] && bgImages[nearKey].complete && bgImages[nearKey].naturalWidth > 0) return bgImages[nearKey];
        return bgImages[this.key] || null;
    }

    setKey(newKey) {
        if (!newKey) return;
        const isFar = newKey.endsWith('_far');
        const isNear = newKey.endsWith('_near');
        const numMatch = newKey.match(/bg_(\d+)/);
        const biomeNum = numMatch ? parseInt(numMatch[1], 10) : 1;
        const dirName = BIOME_BG_MAP[biomeNum] || 'abyssal_trench';

        const farKey = `bg_${biomeNum}_far`;
        const nearKey = `bg_${biomeNum}_near`;
        const stripKey = `bg_${biomeNum}_strip`;

        if (!bgImages[farKey]) {
            const img = new Image();
            img.src = `assets/sprites/backgrounds/bg_${dirName}_far.png`;
            bgImages[farKey] = img;
        }
        if (!bgImages[nearKey]) {
            const img = new Image();
            img.src = `assets/sprites/backgrounds/bg_${dirName}_near.png`;
            bgImages[nearKey] = img;
        }
        if (!bgImages[stripKey]) {
            const img = new Image();
            img.src = `assets/sprites/backgrounds/bg_${dirName}_strip.png`;
            bgImages[stripKey] = img;
        }
        if (!bgImages[newKey]) {
            bgImages[newKey] = isFar ? bgImages[farKey] : (isNear ? bgImages[nearKey] : bgImages[stripKey]);
        }
        if (!bgImages[`bg_${biomeNum}`]) {
            bgImages[`bg_${biomeNum}`] = bgImages[farKey];
        }
        this.key = newKey;
        this.offset = 0;
    }

    update(dt) {
        const img = this.getImg();
        let w;
        const targetH = (typeof canvas !== 'undefined' && canvas.height) ? canvas.height : 450;
        if (img && img.complete && img.naturalWidth > 0) {
            const scaleY = (targetH / img.naturalHeight) * this.scale;
            w = img.naturalWidth * scaleY;
        } else {
            let biomeNum = 1;
            let levelNum = 1;
            if (typeof LevelManager !== 'undefined') {
                biomeNum = LevelManager.biome || 1;
                levelNum = LevelManager.level || 1;
            }
            const procBg = generateBiomeBackground(biomeNum, levelNum);
            w = procBg ? procBg.width : ((typeof canvas !== 'undefined' && canvas.width) ? canvas.width : 800);
        }
        if (w <= 0) w = (typeof canvas !== 'undefined' && canvas.width) ? canvas.width : 800;
        this.offset = (this.offset + this.speed * dt) % w;
    }

    draw() {
        const img = this.getImg();
        let biomeNum = (typeof LevelManager !== 'undefined') ? (LevelManager.biome || 1) : 1;
        let levelNum = (typeof LevelManager !== 'undefined') ? (LevelManager.level || 1) : 1;
        const canvasW = (typeof canvas !== 'undefined' && canvas.width) ? canvas.width : 800;
        const canvasH = (typeof canvas !== 'undefined' && canvas.height) ? canvas.height : 450;

        if (!img || !img.complete || img.naturalWidth === 0) {
            const procBg = generateBiomeBackground(biomeNum, levelNum);
            if (procBg) {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                const w = procBg.width;
                const h = procBg.height;
                const drawX = -this.offset % w;
                const count = Math.ceil(canvasW / w) + 1;
                for (let i = 0; i < count; i++) {
                    ctx.drawImage(procBg, Math.floor(drawX + i * w), Math.floor(this.yOffset), Math.ceil(w) + 1, Math.ceil(h));
                }
                ctx.restore();
            }
            return;
        }

        ctx.save();
        ctx.globalAlpha = this.alpha;
        const scaleY = (canvasH / img.naturalHeight) * this.scale;
        const w = img.naturalWidth * scaleY;
        const h = canvasH;
        const drawX = -((this.offset % w + w) % w);
        const count = Math.ceil(canvasW / w) + 2;
        
        // Render seamless tiles with 1px overdraw to prevent sub-pixel hairline seams
        for (let i = 0; i < count; i++) {
            const x = Math.floor(drawX + i * w);
            ctx.drawImage(img, x, Math.floor(this.yOffset), Math.ceil(w) + 1, Math.ceil(h));
        }
        ctx.restore();
    }
}

// ─── Unique Journey Landmark Renderer (Dynamic Angles, Sizes & Progression) ───
class JourneyLandmark {
    constructor(biome, level, progress = 0.0) {
        this.biome = biome;
        this.level = level;
        this.progress = progress; // 0.0 (start of level) to 1.0 (level climax / boss)
        this.x = (typeof canvas !== 'undefined' ? canvas.width : 800) + 150;
        this.y = (typeof canvas !== 'undefined' ? canvas.height / 2 : 225);
        this.speed = 28; // Midground parallax velocity
        this.time = Math.random() * Math.PI * 2;
        this.isBossAlert = false;
        this.info = (typeof BIOME_DATA !== 'undefined' && BIOME_DATA.getLevelInfo)
            ? BIOME_DATA.getLevelInfo(biome, level)
            : { landmark: 'coral_spire', accentColor: '#00ffff' };
        
        // Deterministic unique angle seed per biome + level (ranges between -18 deg and +18 deg)
        const angleSeed = (this.biome * 43 + this.level * 23) % 360;
        this.baseAngle = ((angleSeed % 37) - 18) * (Math.PI / 180);
        this.currentAngle = this.baseAngle;

        // Base display size for >=1000px master assets
        this.baseSize = 340;
        this.currentScale = 1.0;

        // Ground-rooted volcanic spires sit naturally in the lower seabed terrain
        const isGroundRooted = (this.info && this.info.landmark === 'magma_chimney');
        this.y = isGroundRooted
            ? (typeof canvas !== 'undefined' ? canvas.height * 0.65 : 292)
            : (typeof canvas !== 'undefined' ? canvas.height * 0.48 : 216);

        // Levitation & Anti-Gravity Flotation System
        this.levitateActive = true;
        this.levitateY = 0;
        this.levitateTilt = 0;
        this.levitateBobAmp = 14;
        this.levitateFreq = 0.85;
        this.repulsorPulse = 1.0;

        // Destructibility & Foreground Flag (Landmarks are strictly background and non-glowing unless destructible)
        this.isDestructible = !!(this.info && this.info.isDestructible);
    }

    setProgress(p, isBoss = false) {
        this.progress = Math.max(0, Math.min(1.0, p));
        this.isBossAlert = !!isBoss;
    }

    update(dt, progress = null, isBoss = null) {
        if (progress !== null && typeof progress === 'number') {
            this.progress = Math.max(0, Math.min(1.0, progress));
        }
        if (isBoss !== null) {
            this.isBossAlert = !!isBoss;
        }

        this.x -= this.speed * dt;
        this.time += dt * (this.isBossAlert ? 2.8 : 1.3);

        const isGroundRooted = (this.info && this.info.landmark === 'magma_chimney');

        // 1. Harmonic Multi-Frequency Levitation Bobbing (Physics-based weightless flotation)
        if (this.levitateActive && !isGroundRooted) {
            const primaryWave = Math.sin(this.time * this.levitateFreq);
            const secondaryWave = Math.cos(this.time * 0.42);
            this.levitateY = primaryWave * this.levitateBobAmp + secondaryWave * (this.levitateBobAmp * 0.45);
            this.levitateTilt = Math.sin(this.time * 0.55) * 0.035 + Math.cos(this.time * 0.85) * 0.02;
        } else if (isGroundRooted) {
            // Subtle geothermal seismic tremor for volcanic spires rooted in the floor
            this.levitateY = Math.sin(this.time * 1.8) * 2.2;
            this.levitateTilt = Math.sin(this.time * 0.9) * 0.012;
        } else {
            this.levitateY = 0;
            this.levitateTilt = 0;
        }

        // Dynamic undulating tilt based on environmental current, base perspective angle, and levitation roll
        this.currentAngle = this.baseAngle + this.levitateTilt + Math.sin(this.time * 0.7) * 0.04 + (this.progress * 0.08);

        // Progressive scaling: looms larger into midground as waves clear (1.0x -> 1.35x)
        this.currentScale = 1.0 + (this.progress * 0.35);
        this.repulsorPulse = 1.0 + Math.sin(this.time * 2.2) * (this.isBossAlert ? 0.25 : 0.12);

        const currentDrawY = this.y + this.levitateY;

        // Dynamic hydrothermal volcanic chimney smoke venting: plumes billow up from flue nozzle
        if (this.info && this.info.landmark === 'magma_chimney' && typeof envParticles !== 'undefined') {
            const screenW = typeof canvas !== 'undefined' ? canvas.width : 960;
            if (this.x > -120 && this.x < screenW + 120) {
                const flueX = this.x;
                const flueY = currentDrawY - (this.baseSize * this.currentScale * 0.42);
                const spawnChance = (this.isBossAlert ? 0.75 : 0.35);
                if (Math.random() < spawnChance) {
                    const p = new EnvironmentParticle('vent_smoke', flueX + (Math.random() - 0.5) * 16, flueY);
                    p.isThermal = Math.random() < 0.5;
                    p.color = p.isThermal ? '#ff7722' : '#2a2f38';
                    p.speed = 48 + Math.random() * 42;
                    envParticles.push(p);
                }
            }
        }

        // Ambient anti-gravity / buoyancy flotation motes for floating landmarks
        if (!isGroundRooted && typeof envParticles !== 'undefined' && Math.random() < 0.10) {
            const screenW = typeof canvas !== 'undefined' ? canvas.width : 960;
            if (this.x > -100 && this.x < screenW + 100) {
                const moteX = this.x + (Math.random() - 0.5) * (this.baseSize * this.currentScale * 0.4);
                const moteY = currentDrawY + (this.baseSize * this.currentScale * 0.22) + Math.random() * 15;
                const p = new EnvironmentParticle('mote', moteX, moteY);
                p.color = this.info.accentColor || '#00ffff';
                p.speed = 8 + Math.random() * 14;
                p.alpha = 0.45;
                envParticles.push(p);
            }
        }

        // Loop landmark around smoothly so the level feels continuously inhabited
        const wrapX = -550;
        if (this.x < wrapX) {
            this.x = (typeof canvas !== 'undefined' ? canvas.width : 800) + 280;
            this.y = isGroundRooted
                ? (canvas.height || 450) * 0.65
                : (canvas.height || 450) * (0.28 + (Math.sin(this.time * 0.5) * 0.5 + 0.5) * 0.44);
        }
    }

    _drawLevitationField(c, drawW, drawH, accent, pulse) {
        c.save();
        
        const baseAlpha = this.isBossAlert ? 0.35 : 0.22;
        const auraY = drawH * 0.28; // Positioned beneath the core/keel
        const radiusX = drawW * 0.44;
        const radiusY = drawH * 0.16;

        // 1. Soft Elliptical Repulsor Field Cushion
        c.save();
        c.translate(0, auraY);
        c.scale(1.0, radiusY / radiusX);
        const grad = c.createRadialGradient(0, 0, 2, 0, 0, radiusX);
        grad.addColorStop(0.0, accent);
        grad.addColorStop(0.4, accent);
        grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
        
        c.globalAlpha = baseAlpha * pulse;
        c.fillStyle = grad;
        c.beginPath();
        c.arc(0, 0, radiusX, 0, Math.PI * 2);
        c.fill();
        c.restore();

        // 2. Concentric Anti-Gravity Distortion Ripple Rings
        const phase1 = (this.time * 0.75) % 1.0;
        const phase2 = (this.time * 0.75 + 0.5) % 1.0;
        
        c.lineWidth = 1.8;
        [phase1, phase2].forEach(phase => {
            const rX = radiusX * (0.25 + phase * 0.75);
            const rY = radiusY * (0.25 + phase * 0.75);
            const ringAlpha = (1.0 - phase) * (this.isBossAlert ? 0.45 : 0.26);
            
            c.save();
            c.translate(0, auraY + phase * 16);
            c.scale(1.0, rY / rX);
            c.strokeStyle = accent;
            c.globalAlpha = ringAlpha * pulse;
            c.beginPath();
            c.arc(0, 0, rX, 0, Math.PI * 2);
            c.stroke();
            c.restore();
        });

        // 3. Central Core Ambient Levitation Radiance (soft backlight behind the mass)
        const coreGrad = c.createRadialGradient(0, 0, 10, 0, 0, drawW * 0.38);
        coreGrad.addColorStop(0.0, accent);
        coreGrad.addColorStop(0.5, accent);
        coreGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
        c.globalAlpha = (this.isBossAlert ? 0.22 : 0.12) * pulse;
        c.fillStyle = coreGrad;
        c.beginPath();
        c.arc(0, 0, drawW * 0.38, 0, Math.PI * 2);
        c.fill();

        c.restore();
    }

    draw(targetCtx) {
        const c = targetCtx || ctx;
        if (!c) return;

        c.save();
        const renderY = this.y + this.levitateY;
        c.translate(this.x, renderY);
        c.rotate(this.currentAngle);

        const type = this.info.landmark;
        const accent = this.isBossAlert ? '#ff3344' : (this.info.accentColor || '#00ffff');
        const pulse = this.repulsorPulse;
        const isGroundRooted = (this.info && this.info.landmark === 'magma_chimney');

        const spriteKey = 'landmark_' + type;
        const spriteImg = (typeof landmarkSprites !== 'undefined' && landmarkSprites[spriteKey])
            ? landmarkSprites[spriteKey]
            : ((typeof window !== 'undefined' && window.landmarkSprites) ? window.landmarkSprites[spriteKey] : null);

        const drawW = this.baseSize * this.currentScale * pulse;
        const drawH = this.baseSize * this.currentScale * pulse;

        // Landmarks are strictly background scenery structures with NO glowing
        c.shadowColor = 'transparent';
        c.shadowBlur = 0;
        c.globalAlpha = 0.92; // Subtle atmospheric depth for midground scenery

        // Render >=1000px high-definition master asset when available
        if (spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
            c.drawImage(spriteImg, -drawW / 2, -drawH / 2, drawW, drawH);
            c.restore();
            return;
        }

        if (!this.isDestructible) {
            c.shadowColor = 'transparent';
            c.shadowBlur = 0;
        } else {
            c.shadowColor = accent;
            c.shadowBlur = this.isBossAlert ? 16 : 8;
        }

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
                c.shadowBlur = this.isDestructible ? 8 : 0;
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
            c.shadowColor = this.isDestructible ? '#ff5500' : 'transparent';
            c.shadowBlur = this.isDestructible ? 10 : 0;
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
    levelProgress: 0.0,
    isBossActive: false,
    currentLandmark: null,

    setLevel(biome, level, progress = 0.0) {
        this.biome = Math.max(1, Math.min(10, biome));
        this.level = Math.max(1, Math.min(10, level));
        this.levelProgress = progress;
        this.currentLandmark = new JourneyLandmark(this.biome, this.level, this.levelProgress);
    },

    update(dt, progress = null, isBoss = null) {
        if (progress !== null && typeof progress === 'number') {
            this.levelProgress = Math.max(0, Math.min(1.0, progress));
        } else if (typeof LevelManager !== 'undefined') {
            const curWave = LevelManager.currentWave || 0;
            const maxW = (LevelManager.currentLevelConfig && LevelManager.currentLevelConfig.waves) ? LevelManager.currentLevelConfig.waves.length : 5;
            this.levelProgress = maxW > 0 ? Math.min(1.0, curWave / maxW) : 0.0;
        }

        if (isBoss !== null) {
            this.isBossActive = !!isBoss;
        } else if (typeof boss !== 'undefined' && boss !== null && boss.hp > 0) {
            this.isBossActive = true;
        } else {
            this.isBossActive = false;
        }

        if (!this.currentLandmark) {
            this.currentLandmark = new JourneyLandmark(this.biome, this.level, this.levelProgress);
        }
        this.currentLandmark.update(dt, this.levelProgress, this.isBossActive);
    },

    draw(targetCtx) {
        if (this.currentLandmark && !this.currentLandmark.isDestructible) {
            this.currentLandmark.draw(targetCtx || ctx);
        }
    },

    drawForeground(targetCtx) {
        if (this.currentLandmark && this.currentLandmark.isDestructible) {
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
    window.bgImages = bgImages;
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

// Preload all 10 biome background multi-plane assets immediately
for (let b = 1; b <= 10; b++) {
    preloadBiomeBackground(b);
}
