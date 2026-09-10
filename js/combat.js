// combat.js — Bullet, PowerUp, and SpriteExplosion classes
// Extracted from index.html by Ned (GRO-1095)

// --- Bullet Class ---
        class Bullet {
            constructor(x, y, vx, vy, color, size = 4, isWave = false, bulletStyle = 'nyxa', damage = 1, piercing = false, helix = 0, helixPhase = 0) {
                this.x = x;
                this.y = y;
                this.vx = vx;
                this.vy = vy;
                this.color = color;
                this.size = size;
                this.isWave = isWave;
                this.bulletStyle = bulletStyle;
                this.damage = damage;
                this.piercing = piercing;
                this.pierceCount = 0;
                this.maxPierce = piercing ? 3 : 1;
                this.helix = helix; // -1, +1, or 0
                this.helixPhase = helixPhase;
                this.baseY = y;
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

                this.age += dt;
                this.x += this.vx * dt;

                if (this.helix !== 0) {
                    this.baseY += this.vy * dt;
                    this.y = this.baseY + Math.sin(this.age * 18 + this.helixPhase) * (14 * this.helix);
                } else if (this.isWave) {
                    this.y += (this.vy * dt) + Math.sin(this.age * 22) * 4;
                } else {
                    this.y += this.vy * dt;
                }

                if (typeof Particle !== 'undefined') {
                    if (this.secondaryType === 'missile') {
                        if (Math.random() < 0.45) {
                            const angle = Math.atan2(this.vy, this.vx);
                            const rx = this.x - Math.cos(angle) * 5;
                            const ry = this.y - Math.sin(angle) * 5;
                            const p = new Particle(rx, ry, Math.random() < 0.25 ? '#FF8800' : '#888888');
                            p.vx = -this.vx * 0.10 + (Math.random() - 0.5) * 18;
                            p.vy = -this.vy * 0.10 + (Math.random() - 0.5) * 18;
                            p.size = Math.random() * 2.2 + 1.2;
                            p.decay = Math.random() * 2.5 + 1.5;
                            particles.push(p);
                        }
                    } else if (this.bulletStyle === 'bastion' && Math.random() < 0.35) {
                        const p = new Particle(this.x - 6, this.y, Math.random() < 0.5 ? '#ffaa00' : '#ff5500');
                        p.vx = -this.vx * 0.08 + (Math.random() - 0.5) * 20;
                        p.vy = (Math.random() - 0.5) * 20;
                        p.size = Math.random() * 2 + 1;
                        p.decay = 3.0;
                        particles.push(p);
                    } else if (this.bulletStyle === 'specter' && Math.random() < 0.35) {
                        const p = new Particle(this.x - 8, this.y, Math.random() < 0.6 ? '#b026ff' : '#ffffff');
                        p.vx = -this.vx * 0.06;
                        p.vy = (Math.random() - 0.5) * 12;
                        p.size = Math.random() * 1.8 + 0.8;
                        p.decay = 4.0;
                        particles.push(p);
                    } else if (this.bulletStyle === 'tempest' && Math.random() < 0.30) {
                        const p = new Particle(this.x - 5, this.y, '#ff2244');
                        p.vx = -this.vx * 0.08 + (Math.random() - 0.5) * 25;
                        p.vy = (Math.random() - 0.5) * 25;
                        p.size = Math.random() * 1.8 + 1;
                        p.decay = 3.5;
                        particles.push(p);
                    } else if (this.bulletStyle === 'warden' && Math.random() < 0.35) {
                        const p = new Particle(this.x - 6, this.y, '#00ff88');
                        p.vx = -this.vx * 0.05;
                        p.vy = (Math.random() - 0.5) * 15;
                        p.size = Math.random() * 2.5 + 1;
                        p.decay = 3.0;
                        particles.push(p);
                    } else if (this.bulletStyle === 'phantom' && Math.random() < 0.40) {
                        const p = new Particle(this.x - 6, this.y, Math.random() < 0.5 ? '#ff00aa' : '#00ffff');
                        p.vx = -this.vx * 0.07 + (Math.random() - 0.5) * 20;
                        p.vy = (Math.random() - 0.5) * 20;
                        p.size = Math.random() * 2 + 1;
                        p.decay = 3.5;
                        particles.push(p);
                    } else if (this.bulletStyle === 'nyxa' && Math.random() < 0.25) {
                        const p = new Particle(this.x - 6, this.y, '#00f0ff');
                        p.vx = -this.vx * 0.05;
                        p.vy = (Math.random() - 0.5) * 12;
                        p.size = Math.random() * 1.5 + 1;
                        p.decay = 3.5;
                        particles.push(p);
                    }
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);

                // Rotate to face bullet velocity vector
                const angle = Math.atan2(this.vy, this.vx);
                ctx.rotate(angle);

                if (this.secondaryType === 'missile') {
                    // Downsized sleek compact micro-missile
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 5;
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.moveTo(3.5, 0);
                    ctx.lineTo(-3, -1.5);
                    ctx.lineTo(-1.5, 0);
                    ctx.lineTo(-3, 1.5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#ff3300';
                    ctx.fillRect(-4.5, -0.75, 2, 1.5);
                    ctx.restore();
                    return;
                }

                // Check for dedicated ship projectile sprite
                const vfx = (typeof window !== 'undefined' && window.vfxSprites) ? window.vfxSprites : (typeof vfxSprites !== 'undefined' ? vfxSprites : {});
                const styleKey = 'player_bullet_' + (this.bulletStyle || 'nyxa');
                const sprite = vfx[styleKey] || vfx['laser'];
                const isImage = sprite && sprite.tagName !== 'CANVAS' && sprite.complete && sprite.naturalWidth > 0;
                const isCanvas = sprite && sprite.tagName === 'CANVAS' && sprite.width > 0;

                if (isImage || isCanvas) {
                    const renderW = Math.min(38, this.size * 3.6);
                    const renderH = (this.bulletStyle === 'warden') ? renderW : renderW * 0.52;
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 10;
                    ctx.drawImage(sprite, -renderW / 2, -renderH / 2, renderW, renderH);
                    ctx.restore();
                    return;
                }

                // Procedural rendering fallback per player ship weapon style
                if (this.bulletStyle === 'bastion') {
                    // Molten amber sabot slug
                    ctx.shadowColor = '#ffaa00';
                    ctx.shadowBlur = 8;
                    ctx.fillStyle = '#ffaa00';
                    ctx.fillRect(-this.size * 1.5, -this.size * 0.5, this.size * 3.0, this.size);
                    ctx.fillStyle = '#ffee88';
                    ctx.fillRect(this.size * 0.3, -this.size * 0.3, this.size * 1.2, this.size * 0.6);
                    ctx.fillStyle = '#ff4400';
                    ctx.fillRect(-this.size * 1.8, -this.size * 0.3, this.size * 0.4, this.size * 0.6);
                } else if (this.bulletStyle === 'specter') {
                    // Void violet railgun lance
                    ctx.shadowColor = '#b026ff';
                    ctx.shadowBlur = 12;
                    ctx.strokeStyle = '#b026ff';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(-this.size * 3.0, 0);
                    ctx.lineTo(this.size * 3.0, 0);
                    ctx.stroke();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1.2;
                    ctx.stroke();
                } else if (this.bulletStyle === 'tempest') {
                    // Crimson scatter dart
                    ctx.shadowColor = '#ff2244';
                    ctx.shadowBlur = 10;
                    ctx.fillStyle = '#ff2244';
                    ctx.beginPath();
                    ctx.moveTo(this.size * 2.0, 0);
                    ctx.lineTo(-this.size * 1.2, -this.size * 0.8);
                    ctx.lineTo(-this.size * 0.6, 0);
                    ctx.lineTo(-this.size * 1.2, this.size * 0.8);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#ff88aa';
                    ctx.fillRect(0, -1, this.size, 2);
                } else if (this.bulletStyle === 'warden') {
                    // Acoustic shockwave rings
                    ctx.shadowColor = '#00ff88';
                    ctx.shadowBlur = 12;
                    ctx.strokeStyle = '#00ff88';
                    ctx.lineWidth = 2.2;
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size * 1.4, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.strokeStyle = '#aaffcc';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
                    ctx.stroke();
                } else if (this.bulletStyle === 'phantom') {
                    // Tachyon phase dart
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 10;
                    ctx.fillStyle = this.color;
                    ctx.fillRect(-this.size * 1.8, -2, this.size * 3.6, 4);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(-this.size * 0.8, -1, this.size * 1.6, 2);
                } else {
                    // Default / Nyxa: Cyan pulse laser
                    ctx.shadowColor = '#00f0ff';
                    ctx.shadowBlur = 10;
                    ctx.fillStyle = this.color;
                    ctx.fillRect(-this.size * 1.6, -2, this.size * 3.2, 4);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(-this.size * 0.8, -1, this.size * 1.6, 2);
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
                } else if (k === 'SR' || k === 'SHIELD_REGEN' || k === 'REPAIR') {
                    spriteKey = 'powerup_shield_regen';
                    themeColor = '#00ffaa';
                    label = 'REG';
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
                this.themeColor = themeColor;

                const pulse = 1.0 + Math.sin(this.bob * 3) * 0.12;
                ctx.scale(pulse, pulse);

                // Phased Radial Pulse Wave (radiating chromatic phase ring)
                const phaseProgress = (this.bob * 1.6) % Math.PI;
                const phaseR = 14 + (phaseProgress / Math.PI) * 20;
                const phaseAlpha = (1.0 - (phaseProgress / Math.PI)) * 0.55;
                ctx.save();
                ctx.strokeStyle = themeColor;
                ctx.lineWidth = 1.6;
                ctx.globalAlpha = phaseAlpha;
                ctx.shadowColor = themeColor;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(0, 0, phaseR, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                // High-Contrast Dark Rim Backdrop so items pop on ANY background
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.beginPath();
                ctx.arc(0, 0, 18, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

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
                    const renderW = 34;
                    const renderH = 34;
                    ctx.drawImage(sprite, -renderW / 2, -renderH / 2, renderW, renderH);
                } else {
                    // Geometric vector fallback
                    ctx.fillStyle = themeColor;
                    ctx.beginPath();
                    ctx.arc(0, 0, 10, 0, Math.PI * 2);
                    ctx.fill();
                }

                // 3. Floating Materia / Power-Up Micro-Badge
                ctx.shadowBlur = 0;
                ctx.fillStyle = 'rgba(6, 14, 28, 0.85)';
                ctx.fillRect(-13, 14, 26, 10);
                ctx.strokeStyle = themeColor;
                ctx.lineWidth = 1;
                ctx.strokeRect(-13, 14, 26, 10);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 8px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, 0, 19);

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
                        // High-Resolution Shield Impact Sprite Ripple & Hexagonal Deflection Arcs
                        const impactImg = (typeof vfxSprites !== 'undefined') ? vfxSprites['shield_impact'] : null;
                        if (impactImg) {
                            ctx.save();
                            ctx.globalAlpha = Math.max(0, (1 - progress) * 0.95);
                            ctx.translate(this.x, this.y);
                            ctx.rotate(progress * 1.4);
                            const impSz = this.size * (0.8 + progress * 0.8);
                            ctx.drawImage(impactImg, -impSz / 2, -impSz / 2, impSz, impSz);
                            ctx.restore();
                        }

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

        // --- ScrapDrop Class (High-Contrast Sprites, Rare Item VFX & Upgradable Magnetism) ---
        class ScrapDrop {
            constructor(x, y, type, value = null) {
                this.x = x;
                this.y = y;
                this.type = type; // 'metal', 'alloy', 'cell', 'core', 'essence', 'fragment'
                this.width = 16;
                this.height = 16;
                this.vx = (Math.random() - 0.5) * 60 - 45; // drifting left
                this.vy = (Math.random() - 0.5) * 70;
                this.spin = Math.random() * Math.PI * 2;
                this.spinSpeed = 1.5 + Math.random() * 3.0;
                this.pulseTime = Math.random() * Math.PI * 2;
                
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
                    this.glowColor = '#ffffff';
                } else if (type === 'alloy') {
                    this.color = '#4A90D9'; // blue alloy
                    this.glowColor = '#00e5ff';
                } else if (type === 'cell') {
                    this.color = '#00ffff'; // neon cyan
                    this.glowColor = '#00ffff';
                } else if (type === 'core') {
                    this.color = '#FFD700'; // gold
                    this.glowColor = '#ffea70';
                } else if (type === 'essence') {
                    this.color = '#FF44CC'; // pink/purple
                    this.glowColor = '#ff00aa';
                } else if (type === 'fragment') {
                    this.color = '#b026ff'; // neon quantum purple
                    this.glowColor = '#e056fd';
                }
            }

            update(dt) {
                this.pulseTime += dt * 4;

                // Apply Upgradable Quantum Magnet pull toward player
                if (typeof player !== 'undefined' && player && !player.isPulledOut) {
                    const targetX = player.x + player.width / 2;
                    const targetY = player.y + player.height / 2;
                    const dx = targetX - this.x;
                    const dy = targetY - this.y;
                    const dist = Math.hypot(dx, dy);
                    
                    const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
                    // Base unupgraded radius is 45px (super close), upgraded reaches up to 325px
                    const magnetRadius = mods ? (mods.magnetRadius || 45) : 45;
                    const basePull = mods ? (mods.magnetPullForce || 280) : 280;

                    if (dist < magnetRadius) {
                        // Direct terminal vector homing with velocity dampening so it never overshoots the ship
                        const dirX = dx / (dist || 1);
                        const dirY = dy / (dist || 1);
                        const speed = Math.max(380, basePull * (1.3 - (dist / magnetRadius) * 0.4));
                        
                        // Rapidly align velocity with target vector
                        this.vx = this.vx * 0.82 + (dirX * speed) * 0.18;
                        this.vy = this.vy * 0.82 + (dirY * speed) * 0.18;

                        // Immediate proximity terminal lock: when within collection snap range, clamp directly onto ship
                        if (dist <= 36) {
                            this.x = targetX - this.width / 2;
                            this.y = targetY - this.height / 2;
                            this.vx = 0;
                            this.vy = 0;
                            return;
                        }
                    } else {
                        this.vx = this.vx * 0.96;
                        this.vy = this.vy * 0.96;
                        this.x -= 35 * dt;
                    }
                } else {
                    this.vx = this.vx * 0.98;
                    this.vy = this.vy * 0.98;
                    this.x -= 35 * dt;
                }
                
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                this.spin += this.spinSpeed * dt;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

                const pulse = 1.0 + Math.sin(this.pulseTime) * 0.15;
                const isRare = (this.type === 'core' || this.type === 'essence' || this.type === 'fragment');

                // 1. High-Contrast Dark Rim Outline / Halo so items pop on ANY background
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
                ctx.beginPath();
                ctx.arc(0, 0, (isRare ? 14 : 11) * pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // 2. Ambient Color Glow Backdrop
                ctx.shadowColor = this.glowColor;
                ctx.shadowBlur = isRare ? (16 * pulse) : 8;

                // 3. Render Dedicated Pre-Composited Sprite
                const spriteKey = 'scrap_' + this.type;
                const sprite = vfxSprites[spriteKey];
                const isImage = sprite && sprite.tagName !== 'CANVAS' && sprite.complete && sprite.naturalWidth > 0;
                const isCanvas = sprite && sprite.tagName === 'CANVAS' && sprite.width > 0;

                ctx.rotate(this.spin);

                if (isImage || isCanvas) {
                    const renderSize = (isRare ? 28 : 22) * pulse;
                    ctx.drawImage(sprite, -renderSize / 2, -renderSize / 2, renderSize, renderSize);
                } else {
                    // Geometric vector fallback
                    ctx.fillStyle = this.color;
                    if (this.type === 'metal') {
                        ctx.beginPath();
                        for (let i = 0; i < 6; i++) {
                            const angle = i * Math.PI / 3;
                            ctx.lineTo(Math.cos(angle) * 7, Math.sin(angle) * 7);
                        }
                        ctx.closePath();
                        ctx.fill();
                    } else if (this.type === 'alloy') {
                        ctx.fillRect(-7, -5, 14, 10);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(-2, -2, 4, 4);
                    } else if (this.type === 'cell') {
                        ctx.fillRect(-4, -7, 8, 14);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(-2, -4, 4, 8);
                    } else {
                        ctx.beginPath();
                        ctx.arc(0, 0, 8 * pulse, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                // 4. Subtle Specular Sparkle / Orbiters for Rare / Epic / Legendary Scrap
                if (isRare) {
                    ctx.shadowBlur = 0;
                    const numOrbiters = this.type === 'fragment' ? 4 : 2;
                    for (let i = 0; i < numOrbiters; i++) {
                        const orbAng = this.pulseTime * 2.0 + (i * Math.PI * 2 / numOrbiters);
                        const ox = Math.cos(orbAng) * 14;
                        const oy = Math.sin(orbAng) * 14;
                        ctx.fillStyle = '#ffffff';
                        ctx.beginPath();
                        ctx.arc(ox, oy, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                ctx.restore();
            }
        }

// --- Window bindings for explicit global scope ---
window.Bullet = Bullet;
window.PowerUp = PowerUp;
window.SpriteExplosion = SpriteExplosion;
window.ScrapDrop = ScrapDrop;
