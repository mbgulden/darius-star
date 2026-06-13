/**
 * Darius Star — Combo System (GRO-926)
 * =====================================
 * Kill-streak multiplier with visual feedback.
 * Rapid kills build a combo meter; the multiplier
 * scales score earned. Decays after 1.5s of no kills.
 *
 * Tiers:
 *   C-rank (1x)  —  0–4 kills
 *   B-rank (2x)  —  5–9 kills
 *   A-rank (3x)  — 10–14 kills
 *   S-rank (5x)  — 15–24 kills
 *   SS-rank (10x) — 25+ kills
 *
 * Visual: combo counter top-right with tier color,
 * brief flash on tier-up, shake on drop.
 */

const Combo = {
    // ── TIER DEFINITIONS ──
    tiers: [
        { name: 'C',   min: 0,  multiplier: 1,  color: '#888888', glow: '#444444' },
        { name: 'B',   min: 5,  multiplier: 2,  color: '#00CCFF', glow: '#006688' },
        { name: 'A',   min: 10, multiplier: 3,  color: '#FFAA00', glow: '#885500' },
        { name: 'S',   min: 15, multiplier: 5,  color: '#FF3366', glow: '#881133' },
        { name: 'SS',  min: 25, multiplier: 10, color: '#FF00FF', glow: '#880088' },
    ],

    // ── STATE ──
    count: 0,           // current kill streak
    timer: 0,           // seconds since last kill (decays above 1.5)
    decayTime: 1.5,     // seconds before combo resets
    currentTier: 0,     // index into tiers array
    flashTimer: 0,      // visual flash on tier-up
    shakeTimer: 0,      // screen shake on combo drop
    maxCombo: 0,        // best combo this run
    totalKills: 0,      // total kills this run (for stats)

    init() {
        this.count = 0;
        this.timer = 0;
        this.currentTier = 0;
        this.flashTimer = 0;
        this.shakeTimer = 0;
        this.maxCombo = 0;
        this.totalKills = 0;
    },

    /** Call when an enemy is killed. Returns the score multiplier for this kill. */
    onKill() {
        this.count++;
        this.totalKills++;
        this.timer = 0;

        // Track max combo
        if (this.count > this.maxCombo) {
            this.maxCombo = this.count;
        }

        // Check for tier-up
        const prevTier = this.currentTier;
        for (let i = this.tiers.length - 1; i >= 0; i--) {
            if (this.count >= this.tiers[i].min) {
                this.currentTier = i;
                break;
            }
        }

        if (this.currentTier > prevTier) {
            this.flashTimer = 1.2; // 1.2s flash on tier-up
        }

        return this.getMultiplier();
    },

    /** Get current score multiplier */
    getMultiplier() {
        return this.tiers[this.currentTier].multiplier;
    },

    /** Get current tier info for HUD display */
    getTierInfo() {
        return this.tiers[this.currentTier];
    },

    /** Call each frame with delta-time */
    update(dt) {
        this.timer += dt;

        // Decay combo after 1.5s without kills
        if (this.timer > this.decayTime && this.count > 0) {
            const prevTier = this.currentTier;
            this.count = 0;
            this.currentTier = 0;
            if (prevTier > 0) {
                this.shakeTimer = 0.4; // shake on combo drop from B+ rank
            }
        }

        // Decay visual effects
        if (this.flashTimer > 0) this.flashTimer -= dt;
        if (this.shakeTimer > 0) this.shakeTimer -= dt;
    },

    /** Draw combo counter HUD overlay */
    draw(ctx) {
        if (this.count === 0) return;

        const tier = this.getTierInfo();
        const cx = ctx.canvas.width - 80;
        const cy = 55;

        // Flash glow effect on tier-up
        if (this.flashTimer > 0) {
            const flashAlpha = this.flashTimer / 1.2 * 0.6;
            ctx.save();
            ctx.fillStyle = `rgba(${this._hexToRgb(tier.color)},${flashAlpha})`;
            ctx.shadowColor = tier.glow;
            ctx.shadowBlur = 20 + this.flashTimer * 15;
            ctx.beginPath();
            ctx.arc(cx, cy, 40, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Combo count number
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Shake on combo drop
        let shakeX = 0, shakeY = 0;
        if (this.shakeTimer > 0) {
            shakeX = (Math.random() - 0.5) * 6 * (this.shakeTimer / 0.4);
            shakeY = (Math.random() - 0.5) * 6 * (this.shakeTimer / 0.4);
        }

        // Background pill
        const pillW = 70;
        const pillH = 28;
        const pillAlpha = 0.7 + (this.flashTimer > 0 ? 0.3 : 0);
        ctx.fillStyle = `rgba(5, 5, 20, ${pillAlpha})`;
        ctx.strokeStyle = tier.color;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = tier.glow;
        ctx.shadowBlur = this.flashTimer > 0 ? 12 : 5;
        this._roundRect(ctx, cx - pillW / 2 + shakeX, cy - pillH / 2 + shakeY, pillW, pillH, 6);
        ctx.fill();
        ctx.stroke();

        // Tier letter (left side)
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = tier.color;
        ctx.shadowColor = tier.glow;
        ctx.shadowBlur = 4;
        ctx.fillText(tier.name, cx - 18 + shakeX, cy + shakeY);

        // Divider
        ctx.strokeStyle = tier.color;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(cx - 8 + shakeX, cy - 9 + shakeY);
        ctx.lineTo(cx - 8 + shakeX, cy + 9 + shakeY);
        ctx.stroke();

        // Combo count (right side)
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = tier.glow;
        ctx.shadowBlur = 2;
        ctx.fillText(this.count, cx + 16 + shakeX, cy + shakeY);

        // Multiplier label below
        if (tier.multiplier > 1) {
            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = tier.color;
            ctx.shadowColor = tier.glow;
            ctx.shadowBlur = 2;
            ctx.fillText(`x${tier.multiplier}`, cx + shakeX, cy + 22 + shakeY);
        }

        // Decay bar (shows remaining time before combo drops)
        const decayProgress = Math.max(0, 1 - (this.timer / this.decayTime));
        if (decayProgress < 1) {
            const barY = cy + 32;
            const barW = pillW - 10;
            const barH = 2;
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            this._roundRect(ctx, cx - barW / 2 + shakeX, barY + shakeY, barW, barH, 1);
            ctx.fill();

            // Decay color transitions from tier color to red
            const decayColor = decayProgress > 0.4 ? tier.color : '#FF3333';
            ctx.fillStyle = decayColor;
            ctx.shadowBlur = 0;
            this._roundRect(ctx, cx - barW / 2 + shakeX, barY + shakeY, barW * decayProgress, barH, 1);
            ctx.fill();
        }

        ctx.restore();
    },

    /** Helper: draw rounded rect path */
    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
    },

    /** Helper: hex to rgb string */
    _hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r},${g},${b}`;
    },
};

// ES Module bridge — publish const state to global scope
window.Combo = Combo;
