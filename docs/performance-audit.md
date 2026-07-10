# Performance Audit: Darius Star: Cyber Coelacanth

## 1. Executive Summary

This audit evaluates the performance, memory management, and architecture of *Darius Star: Cyber Coelacanth*. The game is a ~4,000-line monolithic HTML5 canvas application. While it achieves a high-quality 16-bit aesthetic, it suffers from several bottlenecks typical of single-file canvas engines, notably high Garbage Collection (GC) pressure and redundant draw calls.

**Key Findings:**
- **Object Churn**: Constant instantiation and splicing of bullets and particles (GC pressure).
- **Redundant State Changes**: Excessive use of `ctx.save()` and `ctx.restore()` in hot loops.
- **Collision Inefficiency**: O(N*M) collision logic becomes a bottleneck as entity counts rise.
- **Missing Infrastructure**: Several referenced modules (`multiplayer.js`, etc.) are missing from the repo.
- **Asset Pipeline Gaps**: Known issues with boss sprites and animation frames impact visual consistency and engine robustness.

---

## 2. Priority Audit & Fix Recommendations

### 1. Object Pooling for Bullets and Particles
- **Severity**: Critical
- **Estimated fix effort**: Medium (2-4 hours)
- **File/Lines**: `index.html` (Lines 1800-2500, update loops at 3140+)
- **Recommendation**: Replace `new Bullet()` and `splice()` with a pre-allocated array and `active` flags to eliminate GC pauses.
- **Code Sketch**:
```javascript
class BulletPool {
    constructor(size) {
        this.items = Array.from({length: size}, () => new Bullet());
    }
    spawn(x, y, vx, vy) {
        let b = this.items.find(i => !i.active);
        if (b) { b.active = true; b.x = x; b.y = y; b.vx = vx; b.vy = vy; }
    }
}
// In loop: bullets.items.forEach(b => { if(b.active) b.update(dt); });
```

### 2. Spatial Partitioning for Collision Detection
- **Severity**: High
- **Estimated fix effort**: Medium (4 hours)
- **File/Lines**: `index.html` (Lines 3180-3250)
- **Recommendation**: Use a simple grid-based spatial hash to reduce collision checks from O(N*M) to nearly O(N).
- **Code Sketch**:
```javascript
const grid = {};
function getGridKey(x, y) { return `${Math.floor(x/100)}_${Math.floor(y/100)}`; }
// In update:
enemies.forEach(e => {
    let key = getGridKey(e.x, e.y);
    if(!grid[key]) grid[key] = [];
    grid[key].push(e);
});
// Bullets only check their own grid cell + neighbors
```

### 3. Batched Particle Rendering
- **Severity**: High
- **Estimated fix effort**: Small (1 hour)
- **File/Lines**: `index.html` (Lines 2450-2500)
- **Recommendation**: Move `ctx.save()` and color settings outside the particle loop. Use a single `Path2D` or draw all particles of one color together.
- **Code Sketch**:
```javascript
ctx.fillStyle = '#ff7700';
ctx.beginPath();
particles.forEach(p => {
    if(p.color === '#ff7700') ctx.rect(p.x, p.y, p.size, p.size);
});
ctx.fill();
```

### 4. DPI Awareness & High-Res Scaling
- **Severity**: Medium
- **Estimated fix effort**: Small (1 hour)
- **File/Lines**: `index.html` (Lines 150-180)
- **Recommendation**: Adjust canvas backing store size based on `window.devicePixelRatio`.
- **Code Sketch**:
```javascript
const dpr = window.devicePixelRatio || 1;
canvas.width = 800 * dpr;
canvas.height = 450 * dpr;
ctx.scale(dpr, dpr);
canvas.style.width = '800px';
canvas.style.height = '450px';
```

### 5. Modularization of Monolithic index.html
- **Severity**: Medium
- **Estimated fix effort**: Large (1-2 days)
- **File/Lines**: `index.html` (Whole file)
- **Recommendation**: Extract `Player`, `Enemy`, `Boss`, and `Renderer` into ES6 modules to improve maintainability and load times.
- **Code Sketch**:
```javascript
// player.js
export class Player { ... }
// index.html
import { Player } from './player.js';
```

### 6. Parallax Seam Fix (Sub-pixel Gaps)
- **Severity**: Low
- **Estimated fix effort**: Small (30 mins)
- **File/Lines**: `index.html` (Lines 2821-2850, ParallaxLayer.draw)
- **Recommendation**: Use `Math.floor()` for draw coordinates and add a 1px overlap to background tiles to prevent gaps.
- **Code Sketch**:
```javascript
// In ParallaxLayer.draw()
ctx.drawImage(img, Math.floor(drawX + i * w), this.yOffset, w + 1, h);
```

### 7. Redundant Asset Load Guards
- **Severity**: Low
- **Estimated fix effort**: Small (15 mins)
- **File/Lines**: `index.html` (Lines 1800-2150, Input Handlers)
- **Recommendation**: Use a single `isLoaded` flag to prevent multiple event listeners from re-triggering load logic on every keydown.
- **Code Sketch**:
```javascript
let assetsStarted = false;
function initAssets() {
    if (assetsStarted) return;
    assetsStarted = true;
    loadPlayerSprites(); // etc
}
```

### 8. Additive Blending Performance Workaround
- **Severity**: Low
- **Estimated fix effort**: Small (1 hour)
- **File/Lines**: `index.html` (Parallax Backgrounds / VFX)
- **Recommendation**: Pre-composite additive elements into sprite sheets instead of using `globalCompositeOperation = 'lighter'` in the main loop.
- **Code Sketch**:
```javascript
// Instead of:
ctx.globalCompositeOperation = 'lighter';
ctx.drawImage(glow, x, y);
ctx.globalCompositeOperation = 'source-over';
// Use: Pre-rendered glow sprites with baked alpha/color.
```

---

## 3. Infrastructure Gaps

The following files are referenced in the architecture but are **ABSENT** from the filesystem:
- `multiplayer.js`, `economy.js`, `combo.js`, `save_system.js`, `banter_engine.js`, `ngplus.js`, `leaderboard.js`.

**Priority**: High. These should be recovered or re-implemented. Their absence currently breaks high-level features like metaprogression sync and state persistence.

---

*Audit Complete - 2024-06-11*
