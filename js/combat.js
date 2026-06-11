// combat.js — Bullet, PowerUp, and SpriteExplosion classes
// Extracted from index.html by Ned (GRO-1095)

// --- Bullet Class ---
        class Bullet {
            constructor(x, y, vx, vy, color, size = 4, isWave = false) {
                this.x = x;
                this.y = y;
                this.vx = vx;
                this.vy = vy;
                this.color = color;
                this.size = size;
                this.isWave = isWave;
                this.age = 0;
            }

            update(dt) {
                if (this.homingTarget && this.homingTarget.hp !== undefined && this.homingTarget.hp > 0) {
                    const tx = this.homingTarget.x + (this.homingTarget.width || 0) / 2;
                    const ty = this.homingTarget.y + (this.homingTarget.height || 0) / 2;
                    const desired = Math.atan2(ty - this.y, tx - this.x);
                    const speed = Math.hypot(this.vx, this.vy) || 430;
                    const current = Math.atan2(this.vy, this.vx);
                    let delta = desired - current;
                    while (delta > Math.PI) delta -= Math.PI * 2;
                    while (delta < -Math.PI) delta += Math.PI * 2;
                    const turn = Math.max(-1, Math.min(1, delta)) * (this.homingStrength || 4) * dt;
                    const next = current + turn;
                    this.vx = Math.cos(next) * speed;
                    this.vy = Math.sin(next) * speed;
                }

                this.x += this.vx * dt;
                this.y += this.vy * dt;
                this.age += dt;

                if (this.isWave) {
                    this.y += Math.sin(this.age * 22) * 4;
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);

                // Rotate to face bullet direction
                const angle = Math.atan2(this.vy, this.vx);
                ctx.rotate(angle);

                if (this.secondaryType === 'missile') {
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 10;
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.moveTo(10, 0);
                    ctx.lineTo(-8, -4);
                    ctx.lineTo(-4, 0);
                    ctx.lineTo(-8, 4);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#ff3300';
                    ctx.fillRect(-12, -2, 5, 4);
                    ctx.restore();
                    return;
                }

                const sprite = vfxSprites['laser'];
                // Check for both Image (not yet pre-composited) and Canvas (pre-composited)
                const isImage = sprite && sprite.tagName !== 'CANVAS' && sprite.complete && sprite.naturalWidth > 0;
                const isCanvas = sprite && sprite.tagName === 'CANVAS' && sprite.width > 0;
                if (isImage || isCanvas) {
                    // Render laser sprite scaled to bullet size (sprite is 1024x1024)
                    const renderSize = this.size * 3.5;
                    ctx.globalAlpha = 0.9;
                    if (this.isWave) {
                        ctx.shadowColor = this.color;
                        ctx.shadowBlur = 12;
                    }
                    // Use additive only for non-pre-composited images (fallback)
                    if (isImage) {
                        ctx.globalCompositeOperation = 'lighter';
                    }
                    ctx.drawImage(sprite, -renderSize / 2, -renderSize / 2, renderSize, renderSize);
                    if (isImage) {
                        ctx.globalCompositeOperation = 'source-over';
                    }
                    ctx.shadowBlur = 0;
                } else {
                    // Fallback: colored rectangle
                    ctx.fillStyle = this.color;
                    if (this.isWave) {
                        ctx.shadowColor = this.color;
                        ctx.shadowBlur = 10;
                        ctx.beginPath();
                        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    } else {
                        ctx.fillRect(-this.size, -2, this.size * 2, 4);
                    }
                }

                ctx.restore();
            }
        }
// --- PowerUp Class ---
        class PowerUp {
            constructor(x, y, kind) {
                this.x = x;
                this.y = y;
                this.kind = kind;
                this.width = 16;
                this.height = 16;
                this.speed = 100;
                this.bob = 0;
            }

            update(dt) {
                this.x -= this.speed * dt;
                this.bob += dt * 6;
                this.y += Math.sin(this.bob) * 1.2;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);

                const color = this.kind === 'W' ? '#ff0055' : '#00ff55';
                ctx.shadowColor = color;
                ctx.shadowBlur = 8;

                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(8, 8, 8, 0, Math.PI*2);
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px monospace';
                ctx.fillText(this.kind, 5, 11);

                ctx.restore();
            }
        }
// --- Sprite-Based Explosion Class ---
        class SpriteExplosion {
            constructor(x, y, size = 48) {
                this.x = x;
                this.y = y;
                this.size = size;
                this.frame = 0;
                this.frameTimer = 0;
                this.frameDuration = 0.08; // 80ms per frame = ~12.5fps for 4 frames = ~320ms total
                this.alive = true;
            }

            update(dt) {
                this.frameTimer += dt;
                if (this.frameTimer >= this.frameDuration) {
                    this.frameTimer -= this.frameDuration;
                    this.frame++;
                    if (this.frame >= 4) {
                        this.alive = false;
                    }
                }
            }

            draw() {
                if (!this.alive) return;
                const key = 'explosion_0';  // Single sprite sheet with 4 frames in 2x2 grid
                const sprite = vfxSprites[key];
                if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                    // Sprite sheet: 2x2 grid, 4 frames (each frame = half width, half height)
                    const fw = sprite.naturalWidth / 2;
                    const fh = sprite.naturalHeight / 2;
                    const col = this.frame % 2;
                    const row = Math.floor(this.frame / 2);
                    ctx.save();
                    ctx.globalAlpha = 0.9;
                    ctx.drawImage(sprite,
                        col * fw, row * fh, fw, fh,           // Source rect (single frame)
                        this.x - this.size / 2,               // Dest
                        this.y - this.size / 2,
                        this.size, this.size);
                    ctx.restore();
                } else {
                    // Fallback: orange flash circle
                    const progress = this.frame / 4;
                    ctx.save();
                    ctx.globalAlpha = 1 - progress;
                    ctx.fillStyle = '#ff6600';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size * (0.5 + progress * 0.5), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        }

        // --- ScrapDrop Class ---
