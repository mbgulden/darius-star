/**
 * Darius Star: Cyber Coelacanth - Renderer & Background System
 *
 * Contains:
 * - ScrapDrop Class
 * - FloatingText Class
 * - Background Image Loading
 * - ParallaxLayer Class
 * - OffscreenBuffer Class
 * - Star Class
 * - SeaParticle Class
 * - Star & Sea Buffer Management
 */

// Global access to bgImages and loading state
const bgImages = {};
let bgImagesLoaded = false;

// --- ScrapDrop Class ---
class ScrapDrop {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'metal', 'cell', 'fragment'
        this.width = 12;
        this.height = 12;
        this.vx = (Math.random() - 0.5) * 60 - 50; // drifting left
        this.vy = (Math.random() - 0.5) * 80;
        this.spin = Math.random() * Math.PI;
        this.spinSpeed = 2 + Math.random() * 4;

        if (type === 'metal') {
            this.value = Math.floor(10 + Math.random() * 41); // 10-50
            this.color = '#c0c0c0'; // silver/grey
        } else if (type === 'cell') {
            this.value = Math.floor(100 + Math.random() * 151); // 100-250
            this.color = '#00ffff'; // neon cyan
        } else if (type === 'fragment') {
            this.value = Math.floor(500 + Math.random() * 501); // 500-1000
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
        } else if (this.type === 'cell') {
            ctx.fillRect(-3, -6, 6, 12);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-1, -4, 2, 8);
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

// --- Background Image Loading ---
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
function ensureBackgroundImages() {
    if (!bgImagesLoaded) {
        bgImagesLoaded = true;
        loadBackgroundImages();
    }
}

// --- ParallaxLayer Class ---
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

    update(dt) {
        const img = this.getImg();
        this.offset = (this.offset + this.speed * dt) % (img ? img.width : 800);
    }

    draw() {
        const img = this.getImg();
        if (!img || !img.complete || img.naturalWidth === 0) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        const w = img.width * this.scale;
        const h = img.height * this.scale;
        // Tile horizontally for seamless scroll
        const drawX = -this.offset;
        const count = Math.ceil(800 / w) + 1;
        for (let i = 0; i < count; i++) {
            ctx.drawImage(img, drawX + i * w, this.yOffset, w, h);
        }
        ctx.restore();
    }
}

// --- Offscreen Buffer Class ---
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

// --- Star Class ---
class Star {
    constructor(depth) {
        this.depth = depth; // 1=far, 2=mid, 3=near
        this.x = Math.random() * 800;
        this.y = Math.random() * 450;
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
            this.x = 800 + 5;
            this.y = Math.random() * 450;
        }
    }

    getAlpha() { return 0.4 + Math.sin(this.twinkle) * 0.35; }
}

// --- SeaParticle Class ---
class SeaParticle {
    constructor() {
        this.reset(true);
    }
    reset(initial = false) {
        this.x = initial ? Math.random() * 800 : 800 + 20;
        this.y = Math.random() * 450;
        this.size = 0.6 + Math.random() * 2.5;
        this.speed = 8 + Math.random() * 25;
        this.drift = (Math.random() - 0.5) * 12;
        this.alpha = 0.05 + Math.random() * 0.18;
        this.color = Math.random() < 0.3 ? '#00ffaa' : '#3388aa';
    }
    update(dt) {
        this.x -= this.speed * dt;
        this.y += this.drift * dt;
        if (this.y < 0) this.y = 450;
        if (this.y > 450) this.y = 0;
        if (this.x < -10) this.reset();
    }
    draw() {} // No-op — rendered via offscreen buffer
}

// --- Star & Sea Buffer Management ---
// These will be initialized in index.html after canvas is created
let starBuffer;
let stars = [];
let seaBuffer;
let seaParticles = [];

function initRendererBuffers() {
    starBuffer = new OffscreenBuffer(800, 450);
    starBuffer.renderInterval = 0.25; // seconds
    stars = [];
    for (let i = 0; i < 35; i++) stars.push(new Star(1));   // far
    for (let i = 0; i < 22; i++) stars.push(new Star(2));   // mid
    for (let i = 0; i < 10; i++) stars.push(new Star(3));   // near

    seaBuffer = new OffscreenBuffer(800, 450);
    seaBuffer.renderInterval = 0.20; // seconds
    seaParticles = [];
    for (let i = 0; i < 45; i++) seaParticles.push(new SeaParticle());
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

function rebuildSeaBuffer(offCtx) {
    seaParticles.forEach(p => {
        offCtx.save();
        offCtx.globalAlpha = p.alpha;
        offCtx.fillStyle = p.color;
        offCtx.fillRect(p.x, p.y, p.size, p.size);
        offCtx.restore();
    });
}
