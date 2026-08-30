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
                this.isPlayer = true;
                this.weaponLevel = typeof player !== 'undefined' ? player.weaponLevel : 1;
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

                // Smoke trail for player missiles
                if (this.secondaryType === 'missile') {
                    if (Math.random() < 0.45) {
                        const angle = Math.atan2(this.vy, this.vx);
                        const rx = this.x - Math.cos(angle) * 8;
                        const ry = this.y - Math.sin(angle) * 8;
                        const p = new Particle(rx, ry, Math.random() < 0.25 ? '#FF8800' : '#888888');
                        p.vx = -this.vx * 0.12 + (Math.random() - 0.5) * 35;
                        p.vy = -this.vy * 0.12 + (Math.random() - 0.5) * 35;
                        p.size = Math.random() * 4.5 + 2.5;
                        p.decay = Math.random() * 2.2 + 1.2;
                        particles.push(p);
                    }
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

                // GRO-882: Render glow sprite behind main laser for weapon glow effect
                const glowSprite = vfxSprites['laser_glow'];
                const isGlowImage = glowSprite && glowSprite.tagName !== 'CANVAS' && glowSprite.complete && glowSprite.naturalWidth > 0;
                const isGlowCanvas = glowSprite && glowSprite.tagName === 'CANVAS' && glowSprite.width > 0;
                if (isGlowImage || isGlowCanvas) {
                    const renderSize = this.size * 3.5;
                    const glowSize = renderSize * 2.2;  // Glow is larger and softer
                    ctx.globalAlpha = 0.35;
                    ctx.globalCompositeOperation = 'lighter';
                    drawSpriteFrame(ctx, glowSprite, 0, 0, SPRITE_FRAME, SPRITE_FRAME, -glowSize / 2, -glowSize / 2, glowSize, glowSize);
                    ctx.globalCompositeOperation = 'source-over';
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
                this.kind = kind; // 'W' | 'S' | 'B' | 'SP' | 'M' | 'weapon' | 'shield' | 'bomb' | 'speed' | 'materia'
                this.width = 24;
                this.height = 24;
                this.speed = 110;
                this.bob = Math.random() * Math.PI * 2;
            }

            update(dt) {
                this.x -= this.speed * dt;
                this.bob += dt * 4;
                this.y += Math.sin(this.bob * 2) * 1.5;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x + 12, this.y + 12);

                const k = (this.kind || 'W').toUpperCase();
                let spriteKey = 'powerup_weapon';
                let themeColor = '#ff0055';
                let label = 'W';

                if (k === 'S' || k === 'SHIELD') {
                    spriteKey = 'powerup_shield';
                    themeColor = '#00e5ff';
                    label = 'S';
                } else if (k === 'B' || k === 'BOMB') {
                    spriteKey = 'powerup_bomb';
                    themeColor = '#ffaa00';
                    label = 'B';
                } else if (k === 'SP' || k === 'SPEED') {
                    spriteKey = 'powerup_speed';
                    themeColor = '#00ff66';
                    label = 'SPD';
                } else if (k === 'M' || k === 'MATERIA') {
                    spriteKey = 'powerup_materia';
                    themeColor = '#b026ff';
                    label = 'MAT';
                }

                const pulse = 1.0 + Math.sin(this.bob * 3) * 0.12;
                ctx.scale(pulse, pulse);

                // 1. Animated Vector Containment Rings & Spark Orbiters
                ctx.save();
                ctx.rotate(this.bob * 1.8);
                ctx.strokeStyle = themeColor;
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = 0.7;
                ctx.strokeRect(-14, -14, 28, 28);
                
                // Orbiting sparks
                for (let i = 0; i < 3; i++) {
                    const sparkAng = this.bob * 2.5 + i * (Math.PI * 2 / 3);
                    const sx = Math.cos(sparkAng) * 16;
                    const sy = Math.sin(sparkAng) * 16;
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(sx, sy, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();

                // 2. High-Resolution Pre-Composited Sprite Core
                const sprite = vfxSprites[spriteKey];
                const isImage = sprite && sprite.tagName !== 'CANVAS' && sprite.complete && sprite.naturalWidth > 0;
                const isCanvas = sprite && sprite.tagName === 'CANVAS' && sprite.width > 0;
                
                ctx.shadowColor = themeColor;
                ctx.shadowBlur = 14 * pulse;

                if (isImage || isCanvas) {
                    const renderW = 28;
                    const renderH = 28;
                    if (isImage) ctx.globalCompositeOperation = 'lighter';
                    ctx.drawImage(sprite, -renderW / 2, -renderH / 2, renderW, renderH);
                    if (isImage) ctx.globalCompositeOperation = 'source-over';
                } else {
                    // Geometric vector fallback
                    ctx.fillStyle = themeColor;
                    ctx.beginPath();
                    ctx.arc(0, 0, 10, 0, Math.PI * 2);
                    ctx.fill();
                }

                // 3. Floating Materia / Power-Up Typography Badge
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.lineWidth = 2;
                ctx.strokeText(label, 0, 0);
                ctx.fillText(label, 0, 0);

                ctx.restore();
            }
        }

        // --- Sprite-Based Explosion Class (Direct vs Indirect & AOE Physics VFX) ---
        class SpriteExplosion {
            constructor(x, y, size = 48, style = 'blue_laser') {
                this.x = x;
                this.y = y;
                this.size = size;
                this.style = style;
                this.frame = 0;
                this.frameTimer = 0;
                this.frameDuration = 0.07;
                this.alive = true;
                this.maxFrames = 5;

                // Configure properties per explosion style & Materia height
                if (style === 'blue_laser') {
                    this.maxFrames = 4;
                    this.frameDuration = 0.05;
                    this.color = '#00FFFF';
                } else if (style === 'green_laser') {
                    this.maxFrames = 5;
                    this.frameDuration = 0.06;
                    this.color = '#00FF88';
                } else if (style === 'purple_laser') {
                    this.maxFrames = 6;
                    this.frameDuration = 0.07;
                    this.color = '#FF00FF';
                } else if (style === 'white_laser') {
                    this.maxFrames = 8;
                    this.frameDuration = 0.06;
                    this.color = '#FFFFFF';
                } else if (style === 'red_projectile') {
                    this.maxFrames = 5;
                    this.frameDuration = 0.07;
                    this.color = '#FF3333';
                } else if (style === 'missile') {
                    this.maxFrames = 10;
                    this.frameDuration = 0.06;
                    this.color = '#FF8800';
                } else if (style === 'missile_aoe') {
                    this.maxFrames = 12;
                    this.frameDuration = 0.05;
                    this.color = '#FF4400';
                } else if (style === 'shield_hit') {
                    this.maxFrames = 6;
                    this.frameDuration = 0.05;
                    this.color = '#00D5FF';
                } else if (style === 'indirect_glance') {
                    this.maxFrames = 4;
                    this.frameDuration = 0.05;
                    this.color = '#FFCC00';
                }
            }

            update(dt) {
                this.frameTimer += dt;
                if (this.frameTimer >= this.frameDuration) {
                    this.frameTimer -= this.frameDuration;
                    this.frame++;
                    if (this.frame >= this.maxFrames) {
                        this.alive = false;
                    }
                }
            }

            draw() {
                if (!this.alive) return;

                const customStyles = ['blue_laser', 'green_laser', 'purple_laser', 'white_laser', 'red_projectile', 'missile', 'missile_aoe', 'shield_hit', 'indirect_glance'];
                if (customStyles.includes(this.style)) {
                    const progress = this.frame / this.maxFrames;
                    ctx.save();

                    if (this.style === 'blue_laser') {
                        // Cyan sharp core piercing flash + directional ion sparks
                        ctx.globalAlpha = (1 - progress) * 0.95;
                        ctx.fillStyle = '#00FFFF';
                        ctx.shadowColor = '#00FFFF';
                        ctx.shadowBlur = 12;
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size * 0.45 * (1 - progress * 0.25), 0, Math.PI * 2);
                        ctx.fill();

                        // High-velocity sparks
                        ctx.strokeStyle = '#FFFFFF';
                        ctx.lineWidth = 1.5 * (1 - progress);
                        for (let i = 0; i < 4; i++) {
                            const ang = (i * Math.PI / 2) + progress * 0.8;
                            const d = this.size * 0.7 * progress;
                            ctx.beginPath();
                            ctx.moveTo(this.x, this.y);
                            ctx.lineTo(this.x + Math.cos(ang) * d, this.y + Math.sin(ang) * d);
                            ctx.stroke();
                        }
                    } 
                    else if (this.style === 'green_laser') {
                        // Emerald plasma burst + dual expanding ion shockwaves
                        ctx.globalAlpha = (1 - progress) * 0.88;
                        ctx.fillStyle = '#00FF88';
                        ctx.shadowColor = '#00FF88';
                        ctx.shadowBlur = 14;
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size * 0.50 * (1 - progress * 0.2), 0, Math.PI * 2);
                        ctx.fill();

                        ctx.globalAlpha = (1 - progress) * 0.9;
                        ctx.strokeStyle = '#00FF88';
                        ctx.lineWidth = 2.5 * (1 - progress);
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size * 0.85 * progress, 0, Math.PI * 2);
                        ctx.stroke();
                    } 
                    else if (this.style === 'purple_laser') {
                        // Violet tachyon singularity nova + dark-energy shockwave ring
                        ctx.globalAlpha = (1 - progress) * 0.85;
                        ctx.fillStyle = '#FF00FF';
                        ctx.shadowColor = '#FF00FF';
                        ctx.shadowBlur = 18;
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size * 0.60 * (1 - progress * 0.15), 0, Math.PI * 2);
                        ctx.fill();

                        ctx.globalAlpha = (1 - progress) * 0.95;
                        ctx.strokeStyle = '#E056FD';
                        ctx.lineWidth = 4 * (1 - progress);
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size * 1.25 * progress, 0, Math.PI * 2);
                        ctx.stroke();
                    } 
                    else if (this.style === 'white_laser') {
                        // Radiant white prismatic starburst + double expanding shockwave
                        ctx.globalAlpha = (1 - progress) * 0.95;
                        ctx.fillStyle = '#FFFFFF';
                        ctx.shadowColor = '#00FFFF';
                        ctx.shadowBlur = 24;
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size * 0.80 * (1 - progress * 0.1), 0, Math.PI * 2);
                        ctx.fill();

                        // Outer shockwave
                        ctx.strokeStyle = '#FFFFFF';
                        ctx.globalAlpha = (1 - progress) * 0.85;
                        ctx.lineWidth = 4 * (1 - progress);
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size * 1.50 * progress, 0, Math.PI * 2);
                        ctx.stroke();

                        // Inner chromatic ring
                        ctx.strokeStyle = '#FF00AA';
                        ctx.globalAlpha = (1 - progress) * 0.65;
                        ctx.lineWidth = 2 * (1 - progress);
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size * 0.95 * progress, 0, Math.PI * 2);
                        ctx.stroke();
                    } 
                    else if (this.style === 'red_projectile') {
                        // Red spiky explosion
                        ctx.globalAlpha = (1 - progress) * 0.9;
                        ctx.fillStyle = '#FF3333';
                        ctx.strokeStyle = '#FF3333';
                        ctx.lineWidth = 1.5;
                        ctx.shadowColor = '#FF3333';
                        ctx.shadowBlur = 12;

                        const spikes = 8;
                        const outerRadius = this.size * 0.8 * (0.35 + progress * 0.65);
                        const innerRadius = this.size * 0.3 * (0.35 + progress * 0.65);
                        let rot = (Math.PI / 2) * 3 + progress * 0.4;
                        let step = Math.PI / spikes;

                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y - outerRadius);
                        for (let i = 0; i < spikes; i++) {
                            let sx = this.x + Math.cos(rot) * outerRadius;
                            let sy = this.y + Math.sin(rot) * outerRadius;
                            ctx.lineTo(sx, sy);
                            rot += step;

                            sx = this.x + Math.cos(rot) * innerRadius;
                            sy = this.y + Math.sin(rot) * innerRadius;
                            ctx.lineTo(sx, sy);
                            rot += step;
                        }
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    } 
                    else if (this.style === 'missile') {
                        // Orange kinetic fireball: multi-bubble roiling heat spheres
                        ctx.globalAlpha = (1 - progress) * 0.9;
                        const bubbleCount = 4;
                        const maxRadius = this.size * 1.15;
                        const currentRadius = maxRadius * (0.4 + progress * 0.6);

                        ctx.shadowColor = '#FF3300';
                        ctx.shadowBlur = 16;

                        for (let i = 0; i < bubbleCount; i++) {
                            const angle = (i / bubbleCount) * Math.PI * 2 + progress * 2.2;
                            const dist = currentRadius * 0.22 * (1 - progress);
                            const bx = this.x + Math.cos(angle) * dist;
                            const by = this.y + Math.sin(angle) * dist;
                            const r = currentRadius * (0.55 - i * 0.05);

                            if (i === 0) ctx.fillStyle = '#FF3300';
                            else if (i === 1) ctx.fillStyle = '#FF8800';
                            else if (i === 2) ctx.fillStyle = '#FFCC00';
                            else ctx.fillStyle = '#FFFF88';

                            ctx.beginPath();
                            ctx.arc(bx, by, r, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                    else if (this.style === 'missile_aoe') {
                        // Colossal Area of Effect (AOE) Pressure Wave & Kinetic Fireball
                        ctx.globalAlpha = (1 - progress) * 0.92;
                        const aoeR = this.size * (0.25 + progress * 0.75);

                        // Outer blast wave
                        ctx.strokeStyle = '#FF4400';
                        ctx.lineWidth = 5 * (1 - progress);
                        ctx.shadowColor = '#FF6600';
                        ctx.shadowBlur = 25;
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, aoeR, 0, Math.PI * 2);
                        ctx.stroke();

                        // Inner thermal combustion sphere
                        ctx.fillStyle = progress < 0.4 ? '#FFFFFF' : (progress < 0.7 ? '#FFAA00' : '#FF3300');
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, aoeR * 0.45 * (1 - progress * 0.5), 0, Math.PI * 2);
                        ctx.fill();

                        // Expanding debris ring
                        ctx.strokeStyle = '#FFD700';
                        ctx.lineWidth = 2 * (1 - progress);
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, aoeR * 0.75, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                    else if (this.style === 'shield_hit') {
                        // Hexagonal energetic deflection ripple & electrical arcs
                        ctx.globalAlpha = (1 - progress) * 0.95;
                        ctx.strokeStyle = '#00E5FF';
                        ctx.lineWidth = 3 * (1 - progress);
                        ctx.shadowColor = '#00FFFF';
                        ctx.shadowBlur = 18;

                        const hexR = this.size * 0.65 * (0.4 + progress * 0.6);
                        ctx.beginPath();
                        for (let i = 0; i < 6; i++) {
                            const ang = i * (Math.PI / 3) + progress * 0.5;
                            const hx = this.x + Math.cos(ang) * hexR;
                            const hy = this.y + Math.sin(ang) * hexR;
                            if (i === 0) ctx.moveTo(hx, hy);
                            else ctx.lineTo(hx, hy);
                        }
                        ctx.closePath();
                        ctx.stroke();

                        // Core deflection flare
                        ctx.fillStyle = '#FFFFFF';
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size * 0.25 * (1 - progress), 0, Math.PI * 2);
                        ctx.fill();
                    }
                    else if (this.style === 'indirect_glance') {
                        // Tangential glancing spark scatter & soft ember puff
                        ctx.globalAlpha = (1 - progress) * 0.8;
                        ctx.fillStyle = '#FFAA00';
                        ctx.shadowColor = '#FF6600';
                        ctx.shadowBlur = 8;

                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size * 0.28 * (1 - progress), 0, Math.PI * 2);
                        ctx.fill();

                        ctx.strokeStyle = '#FFFF88';
                        ctx.lineWidth = 1;
                        for (let i = 0; i < 3; i++) {
                            const a = (i * Math.PI * 2 / 3) + progress * 1.5;
                            const d = this.size * 0.6 * progress;
                            ctx.beginPath();
                            ctx.moveTo(this.x, this.y);
                            ctx.lineTo(this.x + Math.cos(a) * d, this.y + Math.sin(a) * d);
                            ctx.stroke();
                        }
                    }

                    ctx.restore();
                } else {
                    // Fallback to sprite-based animation (loaded as pre-sliced frames)
                    let variant = 0;
                    if (this.style && this.style.startsWith('explosion_')) {
                        const part = this.style.split('_')[1];
                        const parsed = parseInt(part, 10);
                        if (!isNaN(parsed) && parsed >= 0 && parsed <= 3) {
                            variant = parsed;
                        }
                    }
                    const frameIdx = Math.min(3, this.frame);
                    const key = `explosion_${variant}_${frameIdx}`;
                    const sprite = vfxSprites[key];
                    const hasSprite = sprite && (sprite.width > 0 || (sprite.complete && sprite.naturalWidth > 0));
                    if (hasSprite) {
                        ctx.save();
                        ctx.globalAlpha = 0.9;
                        ctx.drawImage(sprite,
                            this.x - this.size / 2,
                            this.y - this.size / 2,
                            this.size, this.size);
                        ctx.restore();
                    } else {
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
        }

        // --- ScrapDrop Class --- (moved from renderer.js by Ned, GRO-1163)
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

// --- Window bindings for explicit global scope ---
window.Bullet = Bullet;
window.PowerUp = PowerUp;
window.SpriteExplosion = SpriteExplosion;
window.ScrapDrop = ScrapDrop;
