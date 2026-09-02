// enemies.js — EnemyBullet, Seeded RNG, Enemy, and Boss classes
// Extracted from index.html by Ned (GRO-1094)
// Upgraded with Animated Blasters, 20-Boss Multi-Part Destructible Architecture, Creature Kinematics & Visual States

// --- Enemy Bullet Class ---
class EnemyBullet {
    constructor(x, y, vx, vy, type = 'bullet', biome = 1) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type; // 'bullet', 'missile', 'plasma', 'cryo', 'flak', 'acid', 'tachyon'
        this.biome = biome;
        this.size = (type === 'missile' || type === 'plasma') ? 7 : 5;
        this.age = 0;

        // Thematic bullet colors per biome and type
        const BIOME_BULLET_COLORS = {
            1: '#00ffff', 2: '#ff6b81', 3: '#74b9ff', 4: '#e056fd',
            5: '#00cec9', 6: '#f39c12', 7: '#fed330', 8: '#2ed573',
            9: '#00b894', 10: '#e84393'
        };
        this.color = type === 'missile' ? '#FF8800' :
                     type === 'plasma' ? '#a29bfe' :
                     type === 'acid' ? '#00FF66' :
                     type === 'tachyon' ? '#FF007F' :
                     (BIOME_BULLET_COLORS[biome] || '#FF3333');
    }

    update(dt) {
        this.age += dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Smoke / energy trail for missiles and special munitions
        if (this.type === 'missile') {
            if (Math.random() < 0.45 && typeof Particle !== 'undefined') {
                const angle = Math.atan2(this.vy, this.vx);
                const rx = this.x - Math.cos(angle) * 8;
                const ry = this.y - Math.sin(angle) * 8;
                const p = new Particle(rx, ry, Math.random() < 0.25 ? '#FF8800' : '#777777');
                p.vx = -this.vx * 0.15 + (Math.random() - 0.5) * 35;
                p.vy = -this.vy * 0.15 + (Math.random() - 0.5) * 35;
                p.size = Math.random() * 4 + 2;
                p.decay = Math.random() * 2.2 + 1.2;
                particles.push(p);
            }
        } else if (this.type === 'plasma' && Math.random() < 0.35 && typeof Particle !== 'undefined') {
            const p = new Particle(this.x, this.y, this.color);
            p.vx = (Math.random() - 0.5) * 20;
            p.vy = (Math.random() - 0.5) * 20;
            p.size = Math.random() * 3 + 1;
            p.decay = 2.5;
            particles.push(p);
        } else if (this.type === 'acid' && Math.random() < 0.30 && typeof Particle !== 'undefined') {
            const p = new Particle(this.x, this.y, '#55ff00');
            p.vx = -this.vx * 0.1;
            p.vy = (Math.random() - 0.5) * 15;
            p.size = 2;
            p.decay = 3.0;
            particles.push(p);
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Rotate: enemy bullets face direction of movement
        const angle = Math.atan2(this.vy, this.vx);
        ctx.rotate(angle);

        if (this.type === 'missile') {
            // Custom Boss / Heavy Missile: Orange body, white tip, red fins, flame exhaust
            ctx.shadowColor = '#FF5500';
            ctx.shadowBlur = 10;

            // Flame flare at engine
            ctx.fillStyle = '#FF3300';
            ctx.beginPath();
            ctx.moveTo(-8, -1.5);
            ctx.lineTo(-15 - Math.random() * 6, 0);
            ctx.lineTo(-8, 1.5);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#FFAA00';
            ctx.beginPath();
            ctx.moveTo(-8, -1.0);
            ctx.lineTo(-12 - Math.random() * 4, 0);
            ctx.lineTo(-8, 1.0);
            ctx.closePath();
            ctx.fill();

            // Main body
            ctx.fillStyle = '#FF8800';
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(-6, -4.5);
            ctx.lineTo(-3, 0);
            ctx.lineTo(-6, 4.5);
            ctx.closePath();
            ctx.fill();

            // White nose tip
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(3, -2.5);
            ctx.lineTo(3, 2.5);
            ctx.closePath();
            ctx.fill();

            // Fins
            ctx.fillStyle = '#FF3333';
            ctx.fillRect(-7, -3.5, 3.5, 7);

            ctx.restore();
            return;
        }

        if (this.type === 'plasma') {
            // Pulsing Plasma Sphere
            const pulse = 1.0 + Math.sin(this.age * 12) * 0.25;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * pulse, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, (this.size * 0.5) * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }

        // Default enemy laser bolt with subtle shimmer accent
        const renderSize = this.size * 4;
        const pulse = 0.7 + Math.sin(gameTime * 8 + this.x * 0.05) * 0.3;

        const glowGrad = ctx.createRadialGradient(0, 0, renderSize * 0.15, 0, 0, renderSize * 0.8);
        glowGrad.addColorStop(0, this.color);
        glowGrad.addColorStop(0.5, 'rgba(255, 30, 0, 0.15)');
        glowGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');

        ctx.globalAlpha = pulse * 0.7;
        ctx.fillStyle = glowGrad;
        ctx.fillRect(-renderSize * 0.8, -renderSize * 0.8, renderSize * 1.6, renderSize * 1.6);

        // Core laser bolt
        ctx.globalAlpha = 0.95;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-renderSize * 0.4, -2, renderSize * 0.8, 4);

        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

// --- Seeded RNG for procedural variation (GRO-1006) ---
function mulberry32(a) {
    return function() {
        a |= 0;
        a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// --- Enemy Ship Class (Kinematics, Animated Blasters, Dynamic States) ---
class Enemy {
    constructor(type) {
        this.type = type || 'scout';
        this.id = ++enemyIdCounter;  // Unique ID for Economy.shouldDrop()
        this.x = canvas.width + 50;
        this.y = 50 + Math.random() * (canvas.height - 100);
        this.width = 38;
        this.height = 38;
        this.age = 0;
        this.rotation = 0;

        // Current stratum / biome detection
        this.biome = (typeof LevelManager !== 'undefined' && LevelManager.biome) ? LevelManager.biome : 1;

        // Stratum glow colors
        const BIOME_GLOWS = {
            1: '#00ffff', 2: '#ff6b81', 3: '#74b9ff', 4: '#e056fd',
            5: '#00cec9', 6: '#f39c12', 7: '#fed330', 8: '#2ed573',
            9: '#00b894', 10: '#e84393'
        };
        this.biomeGlowColor = BIOME_GLOWS[this.biome] || '#00ffff';

        // Kinematics & Archetype Classification
        const isScout = type === 'scout' || type.includes('crawler') || type.includes('drone') || type.includes('sprite') || type.includes('wisp') || type.includes('spark') || type.includes('fragment') || type.includes('angler');
        const isInterceptor = type === 'interceptor' || type.includes('interceptor') || type.includes('spitter') || type.includes('wraith') || type.includes('fighter') || type.includes('hawk') || type.includes('aberration') || type.includes('wasp') || type.includes('sentinel');
        const isHeavy = type === 'heavy' || type.includes('heavy') || type.includes('brute') || type.includes('turret') || type.includes('battery') || type.includes('golem') || type.includes('giant') || type.includes('node') || type.includes('glacier') || type.includes('thunderhead') || type.includes('juggernaut') || type.includes('null_entity') || type.includes('crab');
        const isHazard = type.includes('eel') || type.includes('urchin') || type.includes('swarm') || type.includes('shard');

        // Creature movement archetype tag
        this.creatureArchetype = isHazard ? 'serpentine_or_hazard' :
                                (type.includes('crawler') || type.includes('brute') || type.includes('crab')) ? 'arachnid' :
                                (type.includes('jelly') || type.includes('wisp') || type.includes('urchin')) ? 'pulsating_organic' :
                                isHeavy ? 'heavy_warship' :
                                isInterceptor ? 'tactical_interceptor' : 'scout_dart';

        // Blaster Hardpoint Animation Subsystem
        this.muzzleFlashTimer = 0;
        this.muzzleRecoil = 0;
        this.barrelHeat = 0;
        this.muzzleOffsets = isHeavy ? [ {x: -18, y: -8}, {x: -18, y: 8} ] :
                             isInterceptor ? [ {x: -14, y: -6}, {x: -14, y: 6} ] :
                             [ {x: -16, y: 0} ];

        if (isHazard) {
            this.behaviorPattern = 'hazard';
            this.enemyType = 'elite';
            this.speed = 130;
            this.hp = 3;
            this.scoreValue = 200;
            this.color = this.biomeGlowColor;
            this.startY = this.y;
        } else if (isScout) {
            this.behaviorPattern = 'scout';
            this.enemyType = 'grunt';
            this.speed = 160;
            this.hp = 1;
            this.scoreValue = 100;
            this.color = '#ff5500';
            this.startY = this.y;
        } else if (isInterceptor) {
            this.behaviorPattern = 'interceptor';
            this.enemyType = 'elite';
            this.speed = 260;
            this.hp = 2;
            this.scoreValue = 180;
            this.color = '#ff0055';
            this.startY = this.y;
            this.shootCooldown = 1.8 + Math.random() * 0.8;
            this.shootTimer = this.shootCooldown;
        } else if (isHeavy) {
            this.behaviorPattern = 'heavy';
            this.enemyType = 'elite';
            this.speed = 85;
            this.hp = 4;
            this.scoreValue = 300;
            this.color = '#9a33cc';
            this.shootCooldown = 1.1 + Math.random() * 0.7;
            this.shootTimer = this.shootCooldown;
        } else if (type === 'boss_minion') {
            this.behaviorPattern = 'boss_minion';
            this.enemyType = 'boss_minion';
            this.speed = 180;
            this.hp = 2;
            this.scoreValue = 75;
            this.color = '#33cc55';
        } else {
            this.behaviorPattern = 'scout';
            this.enemyType = 'grunt';
            this.speed = 160;
            this.hp = 2;
            this.scoreValue = 100;
            this.color = '#33cc55';
            this.startY = this.y;
        }

        this.hpMax = this.hp;

        // NG+ Paradox roll: chance to upgrade spawned enemy
        if (typeof currentNGLevel !== 'undefined' && currentNGLevel > 0 && window.NGPlus) {
            const paradox = NGPlus.rollParadox(currentNGLevel, biomeLevel);
            if (paradox) {
                NGPlus.applyParadox(this, paradox);
            }
        }

        // GRO-1006: Procedural mob variation — seed-based per-enemy variance
        const _varRng = mulberry32(runSeed * 31 + this.id);
        this._speedVar = 0.90 + _varRng() * 0.20;       // ±10% speed variance
        const difficultyConfig = getCurrentDifficultyConfig();
        this.hp = Math.max(1, Math.ceil(this.hp * difficultyConfig.enemyHpMultiplier));
        this.hpMax = this.hp;
        this.speed = Math.round(this.speed * this._speedVar * difficultyConfig.enemySpeedMultiplier);
        if (this.shootCooldown) {
            this.shootCooldown = this.shootCooldown / difficultyConfig.enemyFireRateMultiplier;
            this.shootTimer = Math.min(this.shootTimer || this.shootCooldown, this.shootCooldown);
        }
        this._moveVariant = Math.floor(_varRng() * 3);   // 0-2 movement pattern
        this._bulletAngleShift = (_varRng() - 0.5) * 0.10; // ±5% bullet angle shift
    }

    update(dt) {
        this.age += dt;

        // Blaster animation timers decay
        if (this.muzzleFlashTimer > 0) this.muzzleFlashTimer -= dt * 6.0;
        if (this.muzzleRecoil > 0) this.muzzleRecoil = Math.max(0, this.muzzleRecoil - dt * 7.0);
        if (this.barrelHeat > 0) this.barrelHeat = Math.max(0, this.barrelHeat - dt * 0.8);

        // Creature & Archetype Kinematics
        if (this.creatureArchetype === 'serpentine_or_hazard' || this.type.includes('eel')) {
            // Sinuous Multi-Segment Undulation
            this.x -= this.speed * dt;
            const undulateFreq = 4.2;
            const undulateAmp = 45;
            this.y = this.startY + Math.sin(this.age * undulateFreq + this.x * 0.02) * undulateAmp;
            this.rotation = Math.cos(this.age * undulateFreq + this.x * 0.02) * 0.25;
        } else if (this.creatureArchetype === 'arachnid') {
            // Arachnid Skittering: Micro-hops and pouncing stride
            this.x -= this.speed * dt;
            const skitterStep = Math.abs(Math.sin(this.age * 12.0)) * 12;
            this.y = this.startY + Math.sin(this.age * 2.5) * 20 + skitterStep;
            this.rotation = Math.sin(this.age * 12.0) * 0.08;
        } else if (this.behaviorPattern === 'scout') {
            this.x -= this.speed * dt;
            const _freq = [4.5, 5.2, 6.0][this._moveVariant];
            const _amp = [50, 65, 75][this._moveVariant];
            this.y = this.startY + Math.sin(this.age * _freq) * _amp;
            this.rotation = Math.cos(this.age * _freq) * 0.12;
        } else if (this.behaviorPattern === 'interceptor') {
            this.x -= this.speed * dt;
            // Tactical Interceptor Roll & Vertical Intercept
            if (typeof player !== 'undefined' && player) {
                const targetPlayer = player;
                const dy = targetPlayer.y - this.y;
                this.y += Math.sign(dy) * Math.min(Math.abs(dy), 70 * dt);
                this.rotation = Math.max(-0.35, Math.min(0.35, dy * 0.006));
            }
            this.y += Math.sin(this.age * 6) * 15 * dt;

            // Interceptor Weapon Firing
            if (this.shootTimer) {
                this.shootTimer -= dt;
                if (this.shootTimer <= 0) {
                    this.shoot();
                    this.shootTimer = this.shootCooldown;
                }
            }
        } else if (this.behaviorPattern === 'heavy') {
            this.x -= this.speed * dt;
            this.y += Math.sin(this.age * 2) * 12 * dt;
            this.rotation = Math.sin(this.age * 1.5) * 0.05;

            this.shootTimer -= dt;
            if (this.shootTimer <= 0) {
                this.shoot();
                this.shootTimer = this.shootCooldown;
            }
        } else if (this.behaviorPattern === 'hazard') {
            this.x -= this.speed * 0.8 * dt;
            this.rotation += dt * 2.5;
            this.y += Math.sin(this.age * 4) * 35 * dt;
        } else if (this.behaviorPattern === 'boss_minion') {
            this.x -= this.speed * dt;
            this.y += Math.sin(this.age * 8) * 80 * dt;
            this.rotation = Math.cos(this.age * 8) * 0.2;
        }

        // Damage Smoke Particle Emitter when HP is low
        if (this.hp <= this.hpMax * 0.5 && Math.random() < 0.35 && typeof Particle !== 'undefined') {
            const p = new Particle(this.x + this.width * 0.5 + (Math.random() - 0.5) * 12,
                                  this.y + this.height * 0.5 + (Math.random() - 0.5) * 12,
                                  Math.random() < 0.5 ? '#333333' : '#ff5500');
            p.vx = 40 + Math.random() * 30;
            p.vy = (Math.random() - 0.5) * 25;
            p.size = Math.random() * 3 + 2;
            p.decay = 2.0;
            particles.push(p);
        }
    }

    shoot() {
        const targetPlayer = (typeof player !== 'undefined') ? player : { x: 100, y: canvas.height / 2 };
        const dx = targetPlayer.x - this.x;
        const dy = targetPlayer.y - this.y;
        const dist = Math.max(1, Math.sqrt(dx*dx + dy*dy));
        const bulletSpeed = -240;

        const _shiftedDy = (dy/dist) + this._bulletAngleShift;

        // Blaster Visual Flare & Recoil Trigger
        this.muzzleFlashTimer = 1.0;
        this.muzzleRecoil = 1.0;
        this.barrelHeat = Math.min(1.0, this.barrelHeat + 0.4);

        playSound('enemy_shoot', {enemyType: this.type});

        const bulletType = this.behaviorPattern === 'heavy' ? 'missile' : 'bullet';
        
        for (const m of this.muzzleOffsets) {
            enemyBullets.push(new EnemyBullet(this.x + m.x + this.width / 2, this.y + m.y + this.height / 2, bulletSpeed, _shiftedDy * 90, bulletType, this.biome));
        }

        // Spawn firing muzzle sparks
        if (typeof Particle !== 'undefined') {
            for (let i = 0; i < 3; i++) {
                const p = new Particle(this.x + this.muzzleOffsets[0].x + this.width / 2,
                                      this.y + this.muzzleOffsets[0].y + this.height / 2,
                                      this.biomeGlowColor);
                p.vx = -120 - Math.random() * 60;
                p.vy = (Math.random() - 0.5) * 80;
                p.size = Math.random() * 2 + 1;
                p.decay = 3.5;
                particles.push(p);
            }
        }
    }

    draw() {
        ctx.save();
        
        // Recoil offset kicks the entity back along horizontal axis
        const recoilX = this.muzzleRecoil * 5;
        const cx = this.x + this.width / 2 + recoilX;
        const cy = this.y + this.height / 2;
        ctx.translate(cx, cy);

        // Dynamic Pulsation (Squish-and-Stretch Kinematics)
        let scaleX = 1;
        let scaleY = 1;
        if (this.creatureArchetype === 'pulsating_organic') {
            scaleX = 1 + Math.sin(this.age * 6.5) * 0.12;
            scaleY = 1 - Math.sin(this.age * 6.5) * 0.10;
        } else {
            scaleX = 1 + Math.sin(this.age * 7) * 0.04;
            scaleY = 1 + Math.cos(this.age * 7) * 0.04;
        }
        ctx.scale(scaleX, scaleY);

        if (this.rotation) {
            ctx.rotate(this.rotation);
        }

        // Resolve exact sprite
        const eSprites = (typeof window !== 'undefined' && window.enemySprites) ? window.enemySprites : (typeof enemySprites !== 'undefined' ? enemySprites : {});
        let sprite = eSprites[this.type] ||
                     eSprites[this.type + '_0'] ||
                     eSprites['enemy_' + this.type + '_0'];

        // If type is a generic role or not directly loaded, resolve stratum archetype
        if (!sprite && typeof BIOME_DATA !== 'undefined' && BIOME_DATA.enemies) {
            const biomeEnemies = BIOME_DATA.enemies[this.biome] || BIOME_DATA.enemies[1];
            if (biomeEnemies) {
                const roleKey = this.behaviorPattern === 'hazard' ? 'alt' : this.behaviorPattern;
                const archetypeKey = biomeEnemies[this.type] || biomeEnemies[roleKey] || biomeEnemies[this.behaviorPattern];
                if (archetypeKey) {
                    sprite = eSprites[archetypeKey] || eSprites[archetypeKey + '_0'];
                }
            }
        }

        if (!sprite) {
            sprite = eSprites[this.behaviorPattern] || eSprites['angler_scout'] || eSprites['scout'];
        }

        const isImage = sprite && sprite.tagName !== 'CANVAS' && sprite.complete && sprite.naturalWidth > 0;
        const isCanvas = sprite && sprite.tagName === 'CANVAS' && sprite.width > 0;
        const hasSprite = isImage || isCanvas;

        // Render dimensions based on unit class
        const sizes = { scout: 38, interceptor: 40, heavy: 52, hazard: 42, boss_minion: 34 };
        const renderSize = sizes[this.behaviorPattern] || 38;

        if (hasSprite) {
            // Stratum glow aura
            ctx.shadowColor = this.isParadox ? this.paradoxColor : this.biomeGlowColor;
            ctx.shadowBlur = this.isParadox ? 16 : 10;
            
            const animDef = (typeof SPRITE_ANIMATIONS !== 'undefined' && window.SPRITE_ANIMATIONS) ? (window.SPRITE_ANIMATIONS[this.type] || window.SPRITE_ANIMATIONS[`enemy_${this.type}_0`]) : null;
            let actionName = 'idle';
            if (this.hp <= 0) {
                actionName = 'death';
            } else if (this.muzzleFlashTimer > 0) {
                actionName = 'shoot';
            }

            if (animDef && typeof drawAnimatedSpriteSheet === 'function') {
                // Biome 10 Chromatic Glitch Offset
                if (this.biome === 10 || this.isParadox) {
                    ctx.globalAlpha = 0.55;
                    drawAnimatedSpriteSheet(ctx, sprite, animDef, actionName, this.age, -renderSize / 2 - 2, -renderSize / 2, renderSize, renderSize);
                    drawAnimatedSpriteSheet(ctx, sprite, animDef, actionName, this.age, -renderSize / 2 + 2, -renderSize / 2, renderSize, renderSize);
                    ctx.globalAlpha = 1.0;
                }
                drawAnimatedSpriteSheet(ctx, sprite, animDef, actionName, this.age, -renderSize / 2, -renderSize / 2, renderSize, renderSize);
            } else {
                // Biome 10 Chromatic Glitch Offset
                if (this.biome === 10 || this.isParadox) {
                    ctx.globalAlpha = 0.55;
                    ctx.drawImage(sprite, -renderSize / 2 - 2, -renderSize / 2, renderSize, renderSize);
                    ctx.drawImage(sprite, -renderSize / 2 + 2, -renderSize / 2, renderSize, renderSize);
                    ctx.globalAlpha = 1.0;
                }
                ctx.drawImage(sprite, -renderSize / 2, -renderSize / 2, renderSize, renderSize);
            }
        } else {
            // Fallback geometry
            ctx.fillStyle = this.isParadox ? this.paradoxColor : this.color;
            ctx.shadowColor = this.biomeGlowColor;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(0, 0, renderSize / 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // ─── ANIMATED BLASTER MUZZLE FLASH & THERMAL GLOW ──────────────────
        if (this.barrelHeat > 0.05) {
            // Thermal Barrel Dissipation Glow
            ctx.save();
            ctx.shadowColor = '#ff5500';
            ctx.shadowBlur = 10 * this.barrelHeat;
            ctx.fillStyle = `rgba(255, 120, 0, ${this.barrelHeat * 0.75})`;
            for (const m of this.muzzleOffsets) {
                ctx.beginPath();
                ctx.arc(m.x, m.y, 2.5 * this.barrelHeat, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        if (this.muzzleFlashTimer > 0) {
            // High-Intensity Muzzle Flash Star Flare
            ctx.save();
            ctx.shadowColor = this.biomeGlowColor;
            ctx.shadowBlur = 18;
            ctx.fillStyle = '#ffffff';
            const flashSize = 6 * this.muzzleFlashTimer;
            for (const m of this.muzzleOffsets) {
                ctx.beginPath();
                ctx.arc(m.x, m.y, flashSize, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = this.biomeGlowColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(m.x - flashSize * 1.8, m.y);
                ctx.lineTo(m.x + flashSize * 1.8, m.y);
                ctx.moveTo(m.x, m.y - flashSize * 1.8);
                ctx.lineTo(m.x, m.y + flashSize * 1.8);
                ctx.stroke();
            }
            ctx.restore();
        }

        // If Paradox, draw title above
        if (this.isParadox) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = this.paradoxColor;
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.paradoxName, 0, -renderSize / 2 - 4);
        }
        
        ctx.restore();
    }
}

// --- 20-Boss Multi-Part Destructible Hardpoint Matrix ---
const BOSS_HARDPOINTS_MAP = {
    // SUB-BOSSES (Level 5)
    'boss_b1_mid_0': [
        { id: 'shell', name: 'Nautilus Armor Shell', type: 'armor', relX: 10, relY: 15, width: 75, height: 75, hpRatio: 0.40, disable: 'armor' },
        { id: 'tentacles', name: 'Dart Tentacle Array', type: 'weapon', relX: 45, relY: 70, width: 75, height: 35, hpRatio: 0.30, disable: 'dart_spread' },
        { id: 'maw', name: 'Bio-Plasma Maw Core', type: 'core', relX: 80, relY: 35, width: 55, height: 45, hpRatio: 0.30, disable: 'plasma_orb' }
    ],
    'boss_b1_0': [
        { id: 'dorsal_rail', name: 'Dorsal Railgun Battery', type: 'weapon', relX: 15, relY: 10, width: 75, height: 35, hpRatio: 0.25, disable: 'railgun' },
        { id: 'torpedo_bay', name: 'Ventral Torpedo Pods', type: 'weapon', relX: 15, relY: 85, width: 75, height: 35, hpRatio: 0.25, disable: 'torpedoes' },
        { id: 'anchor_armor', name: 'Abyssal Armor Carapace', type: 'armor', relX: 55, relY: 20, width: 75, height: 90, hpRatio: 0.25, disable: 'armor' },
        { id: 'precursor_core', name: 'Precursor Power Reactor', type: 'core', relX: 100, relY: 45, width: 65, height: 50, hpRatio: 0.25, disable: 'core' }
    ],
    'boss_b2_mid_0': [
        { id: 'upper_flak', name: 'Upper Coral Flak Sponson', type: 'weapon', relX: 15, relY: 15, width: 70, height: 35, hpRatio: 0.25, disable: 'upper_flak' },
        { id: 'lower_flak', name: 'Lower Coral Flak Sponson', type: 'weapon', relX: 15, relY: 80, width: 70, height: 35, hpRatio: 0.25, disable: 'lower_flak' },
        { id: 'calcified_plate', name: 'Calcified Shield Plate', type: 'armor', relX: 45, relY: 25, width: 70, height: 80, hpRatio: 0.25, disable: 'armor' },
        { id: 'dread_core', name: 'Dreadnought Fusion Core', type: 'core', relX: 90, relY: 45, width: 60, height: 45, hpRatio: 0.25, disable: 'core' }
    ],
    'boss_b2_0': [
        { id: 'upper_fin', name: 'Dorsal Spectral Fin', type: 'weapon', relX: 20, relY: 10, width: 80, height: 35, hpRatio: 0.25, disable: 'upper_ion' },
        { id: 'lower_fin', name: 'Ventral Spectral Fin', type: 'weapon', relX: 20, relY: 85, width: 80, height: 35, hpRatio: 0.25, disable: 'lower_ion' },
        { id: 'phase_shield', name: 'Phase Energy Shroud', type: 'shield', relX: 50, relY: 25, width: 75, height: 80, hpRatio: 0.25, disable: 'phase_barrier' },
        { id: 'wraith_heart', name: 'Memory Core Heart', type: 'core', relX: 95, relY: 45, width: 65, height: 45, hpRatio: 0.25, disable: 'core' }
    ],
    'boss_b3_mid_0': [
        { id: 'rail_arm', name: 'Kinetic Rail Arm', type: 'weapon', relX: 15, relY: 20, width: 75, height: 40, hpRatio: 0.30, disable: 'rapid_rail' },
        { id: 'shield_arm', name: 'Titanium Shield Arm', type: 'armor', relX: 15, relY: 75, width: 75, height: 40, hpRatio: 0.30, disable: 'shield_barrier' },
        { id: 'sensor_pod', name: 'Tactical Optics Pod', type: 'weapon', relX: 65, relY: 15, width: 50, height: 35, hpRatio: 0.20, disable: 'target_lock' },
        { id: 'mech_reactor', name: 'Warden Mech Reactor', type: 'core', relX: 95, relY: 45, width: 60, height: 50, hpRatio: 0.20, disable: 'core' }
    ],
    'boss_b3_0': [
        { id: 'dorsal_rail', name: 'Dorsal Heavy Railgun', type: 'weapon', relX: 15, relY: 10, width: 85, height: 40, hpRatio: 0.25, disable: 'heavy_rail' },
        { id: 'ventral_missiles', name: 'Ventral Swarm Launchers', type: 'weapon', relX: 15, relY: 85, width: 85, height: 40, hpRatio: 0.25, disable: 'swarm_missiles' },
        { id: 'caudal_thruster', name: 'Caudal Thruster Array', type: 'engine', relX: 110, relY: 35, width: 65, height: 60, hpRatio: 0.25, disable: 'dash_speed' },
        { id: 'coelacanth_core', name: 'Cyber Coelacanth Core', type: 'core', relX: 55, relY: 45, width: 75, height: 50, hpRatio: 0.25, disable: 'core' }
    ],
    'boss_b4_mid_0': [
        { id: 'plasma_horn', name: 'Forehead Ion Horn', type: 'weapon', relX: 10, relY: 20, width: 65, height: 35, hpRatio: 0.25, disable: 'ion_horn' },
        { id: 'dorsal_fin', name: 'Dorsal Plasma Emitter', type: 'weapon', relX: 45, relY: 10, width: 75, height: 35, hpRatio: 0.25, disable: 'dorsal_plasma' },
        { id: 'dragon_maw', name: 'Mouth Plasma Blast', type: 'weapon', relX: 10, relY: 60, width: 70, height: 40, hpRatio: 0.25, disable: 'mouth_blast' },
        { id: 'leviathan_heart', name: 'Nebula Leviathan Heart', type: 'core', relX: 75, relY: 45, width: 65, height: 50, hpRatio: 0.25, disable: 'core' }
    ],
    'boss_b4_0': [
        { id: 'upper_crescent', name: 'Upper Armor Crescent', type: 'armor', relX: 20, relY: 10, width: 85, height: 40, hpRatio: 0.25, disable: 'upper_plate' },
        { id: 'lower_crescent', name: 'Lower Armor Crescent', type: 'armor', relX: 20, relY: 85, width: 85, height: 40, hpRatio: 0.25, disable: 'lower_plate' },
        { id: 'forward_rail', name: 'Storm Railgun Prow', type: 'weapon', relX: 10, relY: 45, width: 70, height: 45, hpRatio: 0.25, disable: 'storm_rail' },
        { id: 'vortex_core', name: 'Vortex Reactor Core', type: 'core', relX: 75, relY: 45, width: 75, height: 50, hpRatio: 0.25, disable: 'vortex_pulse' }
    ],
    'boss_b5_mid_0': [
        { id: 'ram_prow', name: 'Icebreaker Ram Prow', type: 'armor', relX: 10, relY: 35, width: 65, height: 60, hpRatio: 0.30, disable: 'ram_armor' },
        { id: 'freeze_mortar', name: 'Dorsal Sub-Zero Mortar', type: 'weapon', relX: 45, relY: 10, width: 75, height: 35, hpRatio: 0.25, disable: 'freeze_mortar' },
        { id: 'cooling_vents', name: 'Cryogenic Heat-Sinks', type: 'engine', relX: 95, relY: 20, width: 60, height: 45, hpRatio: 0.20, disable: 'cryo_overheat' },
        { id: 'glacial_engine', name: 'Glacial Engine Core', type: 'core', relX: 65, relY: 45, width: 70, height: 50, hpRatio: 0.25, disable: 'core' }
    ],
    'boss_b5_0': [
        { id: 'cryo_horns', name: 'Twin Cryo-Beam Horns', type: 'weapon', relX: 10, relY: 15, width: 75, height: 40, hpRatio: 0.25, disable: 'cryo_beam' },
        { id: 'glacial_carapace', name: 'Glacial Armor Shell', type: 'armor', relX: 45, relY: 15, width: 85, height: 55, hpRatio: 0.25, disable: 'armor' },
        { id: 'frost_gills', name: 'Ventral Freeze Spikes', type: 'weapon', relX: 45, relY: 75, width: 75, height: 40, hpRatio: 0.25, disable: 'freeze_spikes' },
        { id: 'tyrant_engine', name: 'Frost Tyrant Core Engine', type: 'core', relX: 95, relY: 45, width: 65, height: 50, hpRatio: 0.25, disable: 'core' }
    ],
    'boss_b6_mid_0': [
        { id: 'upper_lance', name: 'Upper Thermal Lance', type: 'weapon', relX: 10, relY: 15, width: 75, height: 35, hpRatio: 0.25, disable: 'upper_lance' },
        { id: 'lower_lance', name: 'Lower Thermal Lance', type: 'weapon', relX: 10, relY: 80, width: 75, height: 35, hpRatio: 0.25, disable: 'lower_lance' },
        { id: 'basalt_armor', name: 'Obsidian Slag Armor', type: 'armor', relX: 45, relY: 25, width: 75, height: 75, hpRatio: 0.25, disable: 'armor' },
        { id: 'magma_forge', name: 'Molten Core Forge', type: 'core', relX: 85, relY: 45, width: 65, height: 45, hpRatio: 0.25, disable: 'core' }
    ],
    'boss_b6_0': [
        { id: 'dragon_maw', name: 'Dragon Mouth Plasma Cannon', type: 'weapon', relX: 10, relY: 40, width: 70, height: 45, hpRatio: 0.25, disable: 'dragon_blast' },
        { id: 'spinal_plates', name: 'Obsidian Spinal Plates', type: 'armor', relX: 55, relY: 15, width: 80, height: 45, hpRatio: 0.25, disable: 'armor' },
        { id: 'magma_tail', name: 'Magma Exhaust Tail Rockets', type: 'engine', relX: 110, relY: 25, width: 65, height: 60, hpRatio: 0.25, disable: 'tail_rockets' },
        { id: 'inferno_heart', name: 'Inferno Dragon Core', type: 'core', relX: 65, relY: 45, width: 70, height: 50, hpRatio: 0.25, disable: 'core' }
    ],
    'boss_b7_mid_0': [
        { id: 'port_nacelle', name: 'Port Lightning Nacelle', type: 'weapon', relX: 45, relY: 10, width: 75, height: 35, hpRatio: 0.25, disable: 'port_lightning' },
        { id: 'starboard_nacelle', name: 'Starboard Lightning Nacelle', type: 'weapon', relX: 45, relY: 85, width: 75, height: 35, hpRatio: 0.25, disable: 'starboard_lightning' },
        { id: 'tesla_prow', name: 'Forward Tesla Railgun Prow', type: 'weapon', relX: 10, relY: 45, width: 70, height: 40, hpRatio: 0.25, disable: 'tesla_rail' },
        { id: 'emp_drive', name: 'Storm Emperor EMP Drive', type: 'core', relX: 85, relY: 45, width: 65, height: 45, hpRatio: 0.25, disable: 'core' }
    ],
    'boss_b7_0': [
        { id: 'upper_wing', name: 'Upper Cybernetic Thunder Wing', type: 'weapon', relX: 45, relY: 10, width: 85, height: 45, hpRatio: 0.25, disable: 'upper_arcs' },
        { id: 'lower_wing', name: 'Lower Cybernetic Thunder Wing', type: 'weapon', relX: 45, relY: 80, width: 85, height: 45, hpRatio: 0.25, disable: 'lower_arcs' },
        { id: 'triple_ion', name: 'Triple Prow Ion Railguns', type: 'weapon', relX: 10, relY: 40, width: 70, height: 45, hpRatio: 0.25, disable: 'triple_ion' },
        { id: 'storm_core', name: 'Storm Singularity Reactor', type: 'core', relX: 75, relY: 45, width: 70, height: 50, hpRatio: 0.25, disable: 'core' }
    ],
    'boss_b8_mid_0': [
        { id: 'upper_turret', name: 'Upper Kinetic Flak Battery', type: 'weapon', relX: 20, relY: 15, width: 65, height: 35, hpRatio: 0.25, disable: 'upper_flak' },
        { id: 'lower_turret', name: 'Lower Kinetic Flak Battery', type: 'weapon', relX: 20, relY: 80, width: 65, height: 35, hpRatio: 0.25, disable: 'lower_flak' },
        { id: 'drone_hangar', name: 'Automated Drone Flight Deck', type: 'hangar', relX: 70, relY: 30, width: 75, height: 65, hpRatio: 0.25, disable: 'drone_spawns' },
        { id: 'mainframe', name: 'Flagship Command Mainframe', type: 'core', relX: 110, relY: 45, width: 60, height: 45, hpRatio: 0.25, disable: 'core' }
    ],
    'boss_b8_0': [
        { id: 'broadside_prow', name: 'Forward Broadside Railgun', type: 'weapon', relX: 10, relY: 40, width: 70, height: 45, hpRatio: 0.25, disable: 'broadside' },
        { id: 'upper_tether', name: 'Floating Dorsal Armor Plate', type: 'armor', relX: 45, relY: 10, width: 80, height: 35, hpRatio: 0.25, disable: 'upper_tether' },
        { id: 'lower_tether', name: 'Floating Ventral Armor Plate', type: 'armor', relX: 45, relY: 85, width: 80, height: 35, hpRatio: 0.25, disable: 'lower_tether' },
        { id: 'phantom_core', name: 'Iron Ghost Emerald Core', type: 'core', relX: 75, relY: 45, width: 75, height: 50, hpRatio: 0.25, disable: 'core' }
    ],
    'boss_b9_mid_0': [
        { id: 'brood_sac', name: 'Brood Egg Sac Chamber', type: 'hangar', relX: 75, relY: 25, width: 75, height: 65, hpRatio: 0.30, disable: 'parasite_spawns' },
        { id: 'upper_acid', name: 'Dorsal Acid Cannon', type: 'weapon', relX: 15, relY: 15, width: 70, height: 35, hpRatio: 0.25, disable: 'upper_acid' },
        { id: 'lower_acid', name: 'Ventral Acid Cannon', type: 'weapon', relX: 15, relY: 75, width: 70, height: 35, hpRatio: 0.25, disable: 'lower_acid' },
        { id: 'queen_head', name: 'Brood Queen Carapace', type: 'core', relX: 10, relY: 45, width: 65, height: 45, hpRatio: 0.20, disable: 'core' }
    ],
    'boss_b9_0': [
        { id: 'acid_maw', name: 'Bio-Acid Maw Jaws', type: 'weapon', relX: 10, relY: 40, width: 70, height: 45, hpRatio: 0.25, disable: 'acid_maw' },
        { id: 'dorsal_chitin', name: 'Dorsal Chitin Shield Shell', type: 'armor', relX: 45, relY: 15, width: 85, height: 45, hpRatio: 0.25, disable: 'armor' },
        { id: 'nerve_siphon', name: 'Ventral Organ Siphon', type: 'engine', relX: 55, relY: 75, width: 75, height: 45, hpRatio: 0.25, disable: 'nerve_siphon' },
        { id: 'brain_core', name: 'Pulsating Synaptic Brain Core', type: 'core', relX: 85, relY: 35, width: 70, height: 55, hpRatio: 0.25, disable: 'core' }
    ],
    'boss_b10_mid_0': [
        { id: 'upper_iris', name: 'Upper Tachyon Emitter Pylon', type: 'weapon', relX: 15, relY: 20, width: 65, height: 35, hpRatio: 0.25, disable: 'upper_tachyon' },
        { id: 'lower_iris', name: 'Lower Tachyon Emitter Pylon', type: 'weapon', relX: 15, relY: 75, width: 65, height: 35, hpRatio: 0.25, disable: 'lower_tachyon' },
        { id: 'containment_ring', name: 'Outer Iris Shield Ring', type: 'armor', relX: 35, relY: 15, width: 85, height: 95, hpRatio: 0.25, disable: 'ring_shield' },
        { id: 'void_vortex', name: 'Singularity Gate Void Vortex', type: 'core', relX: 65, relY: 40, width: 70, height: 55, hpRatio: 0.25, disable: 'core' }
    ],
    'boss_b10_0': [
        { id: 'singularity_maw', name: 'Singularity Mouth Cannon', type: 'weapon', relX: 10, relY: 40, width: 75, height: 45, hpRatio: 0.25, disable: 'singularity_cannon' },
        { id: 'aurora_upper', name: 'Upper Cosmic Aurora Fins', type: 'weapon', relX: 50, relY: 10, width: 85, height: 45, hpRatio: 0.25, disable: 'upper_aurora' },
        { id: 'aurora_lower', name: 'Lower Cosmic Aurora Fins', type: 'weapon', relX: 50, relY: 75, width: 85, height: 45, hpRatio: 0.25, disable: 'lower_aurora' },
        { id: 'blackhole_core', name: 'Primordial Black Hole Core', type: 'core', relX: 85, relY: 40, width: 70, height: 55, hpRatio: 0.25, disable: 'core' }
    ]
};

// --- Boss Fighter Class (Multi-Part Destructibles, Kinematics, Animated Blasters) ---
class Boss {
    constructor() {
        this.id = ++enemyIdCounter;
        this.enemyType = 'boss';
        this.x = canvas.width + 100;
        this.y = canvas.height / 2 - 70;
        this.width = 190;
        this.height = 140;
        this.bobTimer = 0;
        this.chargeProgress = 0;
        this.altAttackToggle = false;
        this.ambushDir = 'RIGHT';
        this.ambushVx = -700;
        this.ambushVy = 0;
        this.rotation = 0;
        this.recoilX = 0;
        this.barrelHeat = 0;
        this.muzzleFlashTimer = 0;
        this._victoryTimeout = null;
        this._advanceTimeout = null;
        this._explosionTimers = [];

        // Detect mid-boss (level 5) vs biome boss (level 10)
        this.isMidBoss = (typeof LevelManager !== 'undefined' && LevelManager.level === 5) || 
                         (typeof LevelManager !== 'undefined' && LevelManager.currentLevelConfig && LevelManager.currentLevelConfig.midBoss);

        const currentBiome = (typeof LevelManager !== 'undefined' && LevelManager.biome) ? LevelManager.biome : (typeof biomeLevel !== 'undefined' ? biomeLevel : 1);
        this.biome = currentBiome;

        const difficultyConfig = getCurrentDifficultyConfig();
        let baseHp = 120;
        if (typeof LevelManager !== 'undefined' && typeof LevelManager.getBossHP === 'function') {
            baseHp = LevelManager.getBossHP() || (this.isMidBoss ? 60 : 120);
        } else if (typeof BIOME_DATA !== 'undefined' && BIOME_DATA.bossHP && BIOME_DATA.bossHP[currentBiome]) {
            baseHp = this.isMidBoss ? BIOME_DATA.bossHP[currentBiome].midBoss : BIOME_DATA.bossHP[currentBiome].biomeBoss;
        }

        // Dynamic Co-Op Scaling
        let coOpMultiplier = 1.0;
        if (typeof Multiplayer !== 'undefined' && Multiplayer.activePlayers && Multiplayer.activePlayers.length > 1) {
            coOpMultiplier = 1.0 + 0.45 * (Multiplayer.activePlayers.length - 1);
        }
        
        this.hpMax = Math.round(baseHp * difficultyConfig.bossHpMultiplier * coOpMultiplier);
        this.hp = this.hpMax;

        // Dynamic Boss Names per Biome
        const midBossNames = {
            1: "TRENCH NAUTILUS", 2: "CORAL DREADNOUGHT CORE", 3: "WARDEN MECH",
            4: "NEBULA LEVIATHAN", 5: "GLACIAL JUGGERNAUT", 6: "MAGMA BEHEMOTH",
            7: "STORM EMPEROR CRUISER", 8: "FLAGSHIP HANGAR", 9: "HIVE QUEEN SUB-CORE",
            10: "PARADOX SINGULARITY GATE"
        };
        const biomeBossNames = {
            1: "DROWNED WARDEN", 2: "MEMORY WRAITH", 3: "EUROPA CYBER COELACANTH",
            4: "VORTEX PRIMUS", 5: "FROST TYRANT", 6: "INFERNO DRAGON",
            7: "STORM-SINGER", 8: "THE IRON GHOST", 9: "HIVE MIND OVERMIND",
            10: "THE PRIMORDIAL SINGULARITY"
        };
        this.bossName = this.isMidBoss ? (midBossNames[currentBiome] || "SUB-GUARDIAN") : (biomeBossNames[currentBiome] || "BIOME OVERLORD");
        this.spriteKey = this.isMidBoss ? `boss_b${currentBiome}_mid_0` : `boss_b${currentBiome}_0`;

        // ─── INITIALIZE 20-BOSS MULTI-PART TARGET POINTS ───────────────────
        const hpDefList = BOSS_HARDPOINTS_MAP[this.spriteKey] || [
            { id: 'part1', name: 'Dorsal Weapon Array', type: 'weapon', relX: 15, relY: 15, width: 80, height: 45, hpRatio: 0.50, disable: 'weapon1' },
            { id: 'part2', name: 'Precursor Bio-Core', type: 'core', relX: 55, relY: 45, width: 70, height: 50, hpRatio: 0.50, disable: 'core' }
        ];

        this.targetPoints = hpDefList.map(hpDef => {
            const partHp = Math.max(1, Math.round(this.hpMax * hpDef.hpRatio));
            return {
                id: hpDef.id,
                name: hpDef.name,
                type: hpDef.type,
                relX: hpDef.relX,
                relY: hpDef.relY,
                width: hpDef.width,
                height: hpDef.height,
                maxHp: partHp,
                hp: partHp,
                destroyed: false,
                hitTimer: 0,
                disable: hpDef.disable
            };
        });
        this.currentStage = 0;

        // Colors & Themes
        const bossThemes = {
            1: { color: 'rgba(0, 255, 255, 0.25)', shadow: '#00ffff', pulse: '#00e5ff' },
            2: { color: 'rgba(255, 107, 129, 0.25)', shadow: '#ff6b81', pulse: '#ff4757' },
            3: { color: 'rgba(116, 185, 255, 0.25)', shadow: '#74b9ff', pulse: '#0984e3' },
            4: { color: 'rgba(224, 86, 253, 0.25)', shadow: '#e056fd', pulse: '#be2edd' },
            5: { color: 'rgba(0, 206, 201, 0.25)', shadow: '#00cec9', pulse: '#81ecec' },
            6: { color: 'rgba(243, 156, 18, 0.25)', shadow: '#f39c12', pulse: '#e67e22' },
            7: { color: 'rgba(254, 211, 48, 0.25)', shadow: '#fed330', pulse: '#fa8231' },
            8: { color: 'rgba(46, 213, 115, 0.25)', shadow: '#2ed573', pulse: '#20bf6b' },
            9: { color: 'rgba(0, 184, 148, 0.25)', shadow: '#00b894', pulse: '#6c5ce7' },
            10: { color: 'rgba(232, 67, 147, 0.25)', shadow: '#e84393', pulse: '#f7b731' }
        };
        const theme = bossThemes[currentBiome] || { color: 'rgba(0, 255, 255, 0.25)', shadow: '#00ffff', pulse: '#00e5ff' };
        this.themeColor = theme.color;
        this.themeShadow = theme.shadow;
        this.pulseColor = theme.pulse;

        this.state = 'intro';
        this.stateTimer = 2.0;
        this.shootTimer = 0.8 / difficultyConfig.enemyFireRateMultiplier;

        console.log(`[BOSS] Spawned ${this.bossName} (${this.isMidBoss ? 'Mid-Boss' : 'Biome Boss'}), HP: ${this.hpMax}, Parts: ${this.targetPoints.length}, Sprite: ${this.spriteKey}`);

        if (window.BanterEngine) {
            BanterEngine.trigger('boss_entrance', currentBiome);
        }
    }

    cleanup() {
        if (this._victoryTimeout) { clearTimeout(this._victoryTimeout); this._victoryTimeout = null; }
        if (this._advanceTimeout) { clearTimeout(this._advanceTimeout); this._advanceTimeout = null; }
        this._explosionTimers.forEach(t => clearTimeout(t));
        this._explosionTimers = [];
    }

    isPartDestroyed(disableKey) {
        const pt = this.targetPoints.find(tp => tp.disable === disableKey || tp.id === disableKey);
        return pt ? pt.destroyed : false;
    }

    update(dt) {
        this.bobTimer += dt;

        // Blaster animation timers decay
        if (this.muzzleFlashTimer > 0) this.muzzleFlashTimer -= dt * 6.0;
        if (this.recoilX > 0) this.recoilX = Math.max(0, this.recoilX - dt * 8.0);
        if (this.barrelHeat > 0) this.barrelHeat = Math.max(0, this.barrelHeat - dt * 0.5);

        // Update target point mini health bar decay
        for (const tp of this.targetPoints) {
            if (tp.hitTimer > 0) {
                tp.hitTimer -= dt;
            }
        }

        // ─── BOSS KINEMATICS & SPREAD BEHAVIORS ─────────────────────────────
        const isSerpentine = this.spriteKey.includes('b4_mid') || this.spriteKey.includes('b6_0') || this.spriteKey.includes('b10_0');
        if (isSerpentine) {
            this.rotation = Math.sin(this.bobTimer * 2.8) * 0.08;
        }

        // Low Health Damage Smoke Emitter
        if (this.hp <= this.hpMax * 0.6 && Math.random() < 0.45 && typeof Particle !== 'undefined') {
            const p = new Particle(this.x + 40 + Math.random() * 100,
                                  this.y + 30 + Math.random() * 70,
                                  Math.random() < 0.4 ? '#222222' : '#ff4400');
            p.vx = 60 + Math.random() * 40;
            p.vy = (Math.random() - 0.5) * 35;
            p.size = Math.random() * 4 + 3;
            p.decay = 1.8;
            particles.push(p);
        }

        // ─── STATE MACHINE & 2D FLIGHT / AMBUSH MANEUVERS ───────────
        if (this.state === 'intro') {
            this.x -= 55 * dt;
            if (this.x <= canvas.width - 210) {
                this.x = canvas.width - 210;
                this.state = 'hover_patrol';
                this.stateTimer = 3.0;
            }
            return;
        }

        if (this.state === 'hover_patrol' || this.state === 'idle') {
            // Dynamic 2D multi-directional flight
            const targetX = canvas.width - 230 + Math.cos(this.bobTimer * 1.6) * 55;
            const targetY = canvas.height / 2 - 30 + Math.sin(this.bobTimer * 2.2) * (canvas.height * 0.28);
            this.x += (targetX - this.x) * 2.5 * dt;
            this.y += (targetY - this.y) * 2.5 * dt;

            this.stateTimer -= dt;
            if (this.stateTimer <= 0) {
                const roll = Math.random();
                if (roll < 0.30) {
                    // Forward player lunge
                    this.state = 'target_lunge';
                    this.stateTimer = 1.4;
                } else if (roll < 0.60) {
                    // Alternating weapon sweep
                    this.state = 'alternating';
                    this.stateTimer = 2.8;
                } else if (roll < 0.82) {
                    // Charged energy pulse
                    this.state = 'charge_up';
                    this.stateTimer = 1.8;
                    this.chargeProgress = 0;
                    playSound('laser_charge');
                } else {
                    // Off-screen ambush dive
                    this.state = 'offscreen_dive';
                    this.stateTimer = 1.2;
                }
            }
        } else if (this.state === 'target_lunge') {
            // Aggressive forward thrust towards player
            const targetPlayer = (typeof player !== 'undefined') ? player : { x: 100, y: canvas.height / 2 };
            this.x -= 340 * dt;
            this.y += Math.sign(targetPlayer.y - (this.y + 70)) * 100 * dt;
            this.stateTimer -= dt;
            if (this.x < canvas.width * 0.45 || this.stateTimer <= 0) {
                this.state = 'retreat_bank';
                this.stateTimer = 1.2;
            }
        } else if (this.state === 'retreat_bank') {
            // Smooth backward banking
            this.x += (canvas.width - 220 - this.x) * 3.5 * dt;
            this.stateTimer -= dt;
            if (this.stateTimer <= 0) {
                this.state = 'hover_patrol';
                this.stateTimer = 2.5;
            }
        } else if (this.state === 'alternating') {
            this.y += Math.sin(this.bobTimer * 3.0) * 40 * dt;
            this.stateTimer -= dt;
            if (this.stateTimer <= 0) {
                this.state = 'hover_patrol';
                this.stateTimer = 2.5;
            }
        } else if (this.state === 'charge_up') {
            this.chargeProgress = Math.min(1.0, 1.0 - (this.stateTimer / 1.8));
            if (Math.random() < 0.6) {
                createExplosion(this.x + 30 + Math.random() * 80, this.y + 40 + Math.random() * 60, this.pulseColor, 4);
            }
            this.stateTimer -= dt;
            if (this.stateTimer <= 0) {
                this.state = 'charge_blast';
                this.stateTimer = 1.6;
                this.fireChargedBlast();
                playSound('laser_fire');
            }
        } else if (this.state === 'charge_blast' || this.state === 'rage') {
            this.stateTimer -= dt;
            if (this.stateTimer <= 0) {
                this.state = 'hover_patrol';
                this.stateTimer = 2.2;
            }
        } else if (this.state === 'offscreen_dive') {
            this.x += 650 * dt;
            if (this.x > canvas.width + 120) {
                this.state = 'ambush_warning';
                this.stateTimer = 1.5;
                this.ambushDir = ['RIGHT', 'TOP', 'BOTTOM'][Math.floor(Math.random() * 3)];
                playSound('siren');
            }
        } else if (this.state === 'ambush_warning') {
            this.stateTimer -= dt;
            if (this.stateTimer <= 0) {
                this.state = 'ambush_charge';
                this.stateTimer = 1.8;
                if (this.ambushDir === 'TOP') {
                    this.x = canvas.width - 240;
                    this.y = -150;
                    this.ambushVx = -250;
                    this.ambushVy = 650;
                } else if (this.ambushDir === 'BOTTOM') {
                    this.x = canvas.width - 240;
                    this.y = canvas.height + 150;
                    this.ambushVx = -250;
                    this.ambushVy = -650;
                } else {
                    this.x = canvas.width + 150;
                    const targetPlayer = (typeof player !== 'undefined') ? player : { y: canvas.height / 2 };
                    this.y = targetPlayer.y - 70;
                    this.ambushVx = -750;
                    this.ambushVy = 0;
                }
                playSound('laser_fire');
            }
        } else if (this.state === 'ambush_charge') {
            this.x += this.ambushVx * dt;
            this.y += this.ambushVy * dt;
            createExplosion(this.x + 80, this.y + 70, this.pulseColor, 10);
            this.shootTimer -= dt;
            if (this.shootTimer <= 0) {
                this.attackNormal();
                this.shootTimer = 0.25;
            }
            if (this.x < -200 || this.y < -200 || this.y > canvas.height + 200 || this.stateTimer <= 0) {
                this.x = canvas.width + 80;
                this.y = canvas.height / 2 - 70;
                this.state = 'intro';
                this.stateTimer = 1.5;
            }
        }

        // Continuous weapon firing
        this.shootTimer -= dt;
        if (this.shootTimer <= 0) {
            if (this.state === 'hover_patrol' || this.state === 'idle' || this.state === 'target_lunge') {
                this.attackNormal();
                this.shootTimer = (this.currentStage > 0 ? 0.55 : 0.85);
            } else if (this.state === 'alternating') {
                this.attackAlternating();
                this.shootTimer = 0.40;
            } else if (this.state === 'rage' || this.state === 'architect_final') {
                this.attackNormal();
                this.shootTimer = 0.35;
            }
        }
    }

    // ─── ATTACK 1: THEMATIC WEAPON STREAM (With Dynamic Part Disablement) ─────
    attackNormal() {
        playSound('enemy_shoot', { enemyType: this.enemyType });
        const b = this.biome;
        const tx = this.x + 10;
        const ty = this.y + 70;

        this.muzzleFlashTimer = 1.0;
        this.recoilX = 1.0;
        this.barrelHeat = Math.min(1.0, this.barrelHeat + 0.35);

        // Spawn firing muzzle flash particles
        if (typeof Particle !== 'undefined') {
            for (let i = 0; i < 4; i++) {
                const p = new Particle(tx, ty, this.pulseColor);
                p.vx = -180 - Math.random() * 100;
                p.vy = (Math.random() - 0.5) * 120;
                p.size = Math.random() * 3 + 2;
                p.decay = 3.5;
                particles.push(p);
            }
        }

        if (b === 1) {
            if (!this.isPartDestroyed('railgun') && !this.isPartDestroyed('shell')) {
                enemyBullets.push(new EnemyBullet(tx, ty - 30, -280, -60, 'bullet', b));
            }
            if (!this.isPartDestroyed('torpedoes')) {
                enemyBullets.push(new EnemyBullet(tx, ty, -300, 0, 'missile', b));
            }
            if (!this.isPartDestroyed('dart_spread') && !this.isPartDestroyed('tentacles')) {
                enemyBullets.push(new EnemyBullet(tx, ty + 30, -280, 60, 'bullet', b));
            }
        } else if (b === 2) {
            if (!this.isPartDestroyed('upper_flak') && !this.isPartDestroyed('upper_ion')) {
                enemyBullets.push(new EnemyBullet(tx, ty - 25, -260, -50, 'bullet', b));
            }
            if (!this.isPartDestroyed('calcified_plate') && !this.isPartDestroyed('phase_barrier')) {
                enemyBullets.push(new EnemyBullet(tx, ty, -270, 0, 'bullet', b));
            }
            if (!this.isPartDestroyed('lower_flak') && !this.isPartDestroyed('lower_ion')) {
                enemyBullets.push(new EnemyBullet(tx, ty + 25, -260, 50, 'bullet', b));
            }
        } else if (b === 3) {
            if (!this.isPartDestroyed('heavy_rail') && !this.isPartDestroyed('dorsal_rail')) {
                enemyBullets.push(new EnemyBullet(tx, ty - 25, -340, 0, 'bullet', b));
                enemyBullets.push(new EnemyBullet(tx, ty + 25, -340, 0, 'bullet', b));
            }
            if (!this.isPartDestroyed('swarm_missiles') && !this.isPartDestroyed('ventral_missiles') && !this.isPartDestroyed('rapid_rail')) {
                enemyBullets.push(new EnemyBullet(tx, ty, -360, 0, 'missile', b));
            }
            if (!this.isPartDestroyed('core')) {
                enemyBullets.push(new EnemyBullet(tx, ty, -310, 0, 'plasma', b));
            }
        } else if (b === 4) {
            if (!this.isPartDestroyed('ion_horn') && !this.isPartDestroyed('storm_rail') && !this.isPartDestroyed('upper_plate')) {
                enemyBullets.push(new EnemyBullet(tx, ty - 35, -270, -90, 'plasma', b));
            }
            if (!this.isPartDestroyed('mouth_blast') && !this.isPartDestroyed('forward_rail')) {
                enemyBullets.push(new EnemyBullet(tx, ty, -290, 0, 'plasma', b));
            }
            if (!this.isPartDestroyed('dorsal_plasma') && !this.isPartDestroyed('lower_plate')) {
                enemyBullets.push(new EnemyBullet(tx, ty + 35, -270, 90, 'plasma', b));
            }
        } else if (b === 5) {
            if (!this.isPartDestroyed('freeze_mortar') && !this.isPartDestroyed('cryo_beam')) {
                enemyBullets.push(new EnemyBullet(tx, ty - 40, -260, -70, 'missile', b));
            }
            if (!this.isPartDestroyed('freeze_spikes') && !this.isPartDestroyed('cooling_vents')) {
                enemyBullets.push(new EnemyBullet(tx, ty + 40, -260, 70, 'missile', b));
            }
            if (!this.isPartDestroyed('core')) {
                enemyBullets.push(new EnemyBullet(tx, ty, -310, 0, 'bullet', b));
            }
        } else if (b === 6) {
            if (!this.isPartDestroyed('upper_lance') && !this.isPartDestroyed('dragon_blast')) {
                enemyBullets.push(new EnemyBullet(tx, ty - 30, -280, -60, 'plasma', b));
            }
            if (!this.isPartDestroyed('magma_forge') && !this.isPartDestroyed('inferno_heart')) {
                enemyBullets.push(new EnemyBullet(tx, ty, -300, 0, 'plasma', b));
            }
            if (!this.isPartDestroyed('lower_lance') && !this.isPartDestroyed('tail_rockets')) {
                enemyBullets.push(new EnemyBullet(tx, ty + 30, -280, 60, 'plasma', b));
            }
        } else if (b === 7) {
            if (!this.isPartDestroyed('port_lightning') && !this.isPartDestroyed('upper_arcs')) {
                enemyBullets.push(new EnemyBullet(tx, ty - 30, -440, 0, 'tachyon', b));
            }
            if (!this.isPartDestroyed('tesla_rail') && !this.isPartDestroyed('triple_ion')) {
                enemyBullets.push(new EnemyBullet(tx, ty, -460, 0, 'tachyon', b));
            }
            if (!this.isPartDestroyed('starboard_lightning') && !this.isPartDestroyed('lower_arcs')) {
                enemyBullets.push(new EnemyBullet(tx, ty + 30, -440, 0, 'tachyon', b));
            }
        } else if (b === 8) {
            if (!this.isPartDestroyed('upper_flak') && !this.isPartDestroyed('upper_tether')) {
                enemyBullets.push(new EnemyBullet(tx, ty - 35, -330, -80, 'bullet', b));
            }
            if (!this.isPartDestroyed('broadside') && !this.isPartDestroyed('phantom_core')) {
                enemyBullets.push(new EnemyBullet(tx, ty, -350, 0, 'missile', b));
            }
            if (!this.isPartDestroyed('lower_flak') && !this.isPartDestroyed('lower_tether')) {
                enemyBullets.push(new EnemyBullet(tx, ty + 35, -330, 80, 'bullet', b));
            }

            // Spawn minion drone if hangar is intact
            if (!this.isPartDestroyed('drone_spawns') && Math.random() < 0.12 && typeof enemies !== 'undefined' && enemies.length < 6) {
                enemies.push(new Enemy('salvage_drone'));
            }
        } else if (b === 9) {
            if (!this.isPartDestroyed('upper_acid') && !this.isPartDestroyed('acid_maw')) {
                enemyBullets.push(new EnemyBullet(tx, ty - 25, -260, -70, 'acid', b));
            }
            if (!this.isPartDestroyed('brain_core') && !this.isPartDestroyed('queen_head')) {
                enemyBullets.push(new EnemyBullet(tx, ty, -280, 0, 'acid', b));
            }
            if (!this.isPartDestroyed('lower_acid') && !this.isPartDestroyed('nerve_siphon')) {
                enemyBullets.push(new EnemyBullet(tx, ty + 25, -260, 70, 'acid', b));
            }

            // Spawn parasite minion if brood sac is intact
            if (!this.isPartDestroyed('parasite_spawns') && Math.random() < 0.12 && typeof enemies !== 'undefined' && enemies.length < 6) {
                enemies.push(new Enemy('crawler'));
            }
        } else {
            if (!this.isPartDestroyed('upper_iris') && !this.isPartDestroyed('upper_aurora')) {
                enemyBullets.push(new EnemyBullet(tx, ty - 30, -320, -70, 'tachyon', b));
            }
            if (!this.isPartDestroyed('singularity_cannon') && !this.isPartDestroyed('void_vortex') && !this.isPartDestroyed('blackhole_core')) {
                enemyBullets.push(new EnemyBullet(tx, ty, -360, 0, 'missile', b));
            }
            if (!this.isPartDestroyed('lower_iris') && !this.isPartDestroyed('lower_aurora')) {
                enemyBullets.push(new EnemyBullet(tx, ty + 30, -320, 70, 'tachyon', b));
            }
        }
    }

    // ─── ATTACK 2: ALTERNATING WEAPON SWEEP ─────────────────────────────
    attackAlternating() {
        playSound('enemy_shoot', { enemyType: this.enemyType });
        this.altAttackToggle = !this.altAttackToggle;
        
        const targetPlayer = (typeof player !== 'undefined') ? player : { x: 100, y: canvas.height / 2 };
        const dy = targetPlayer.y - (this.y + 70);
        const dx = targetPlayer.x - (this.x + 10);
        const dist = Math.max(1, Math.sqrt(dx*dx + dy*dy));

        this.muzzleFlashTimer = 0.8;
        this.recoilX = 0.8;

        if (this.altAttackToggle) {
            const upY = this.y + 25;
            enemyBullets.push(new EnemyBullet(this.x + 20, upY, -290, -90, 'bullet', this.biome));
            enemyBullets.push(new EnemyBullet(this.x + 20, upY, (dx/dist) * 310, (dy/dist) * 310, 'bullet', this.biome));
        } else {
            const lowY = this.y + 115;
            enemyBullets.push(new EnemyBullet(this.x + 20, lowY, -290, 90, 'bullet', this.biome));
            enemyBullets.push(new EnemyBullet(this.x + 20, lowY, (dx/dist) * 310, (dy/dist) * 310, 'bullet', this.biome));
        }
    }

    // ─── ATTACK 3: CHARGED ENERGY PULSE BLAST ────────────────────────────
    fireChargedBlast() {
        const b = this.biome;
        const tx = this.x + 10;
        const ty = this.y + 70;

        createExplosion(tx, ty, this.pulseColor, 20);

        if (b === 2 || b === 4 || b === 6 || b === 9) {
            const count = 16;
            for (let i = 0; i < count; i++) {
                const ang = i * (Math.PI * 2 / count) + this.bobTimer;
                enemyBullets.push(new EnemyBullet(tx, ty, Math.cos(ang) * 260, Math.sin(ang) * 260, 'plasma', b));
            }
        } else {
            for (let o = -60; o <= 60; o += 30) {
                enemyBullets.push(new EnemyBullet(tx, ty + o, -400, o * 1.5, 'bullet', b));
                enemyBullets.push(new EnemyBullet(tx, ty + o, -360, o * 0.8, 'missile', b));
            }
        }
    }

    // ─── INTERACTIVE MULTI-PART TARGET POINT HIT RESOLUTION ──────────────
    takeDamage(amt, hitX, hitY) {
        if (this.hp <= 0) return;
        playSound('hit');

        // Determine which target point was hit based on spatial collision coordinates
        let targetHit = null;
        if (typeof hitX === 'number' && typeof hitY === 'number') {
            const localX = hitX - this.x;
            const localY = hitY - this.y;
            
            for (const tp of this.targetPoints) {
                if (!tp.destroyed) {
                    if (localX >= tp.relX - 15 && localX <= tp.relX + tp.width + 15 &&
                        localY >= tp.relY - 15 && localY <= tp.relY + tp.height + 15) {
                        targetHit = tp;
                        break;
                    }
                }
            }
        }

        if (!targetHit) {
            targetHit = this.targetPoints.find(tp => !tp.destroyed) || this.targetPoints[this.targetPoints.length - 1];
        }

        if (targetHit) {
            targetHit.hp = Math.max(0, targetHit.hp - amt);
            targetHit.hitTimer = 2.5; // Display mini health bar for 2.5 seconds

            const sparkX = this.x + targetHit.relX + targetHit.width / 2;
            const sparkY = this.y + targetHit.relY + targetHit.height / 2;
            createExplosion(sparkX, sparkY, '#ffffff', 4);

            if (targetHit.hp <= 0 && !targetHit.destroyed) {
                targetHit.destroyed = true;
                this.currentStage++;
                playSound('explosion');

                // Major localized component explosion
                for (let k = 0; k < 15; k++) {
                    createExplosion(sparkX + (Math.random() - 0.5) * 45, sparkY + (Math.random() - 0.5) * 45, '#ff3300', 14);
                }
                spawnHitFlash(sparkX, sparkY, 'boss_vulnerable');

                // Floating Notification
                if (typeof floatingTexts !== 'undefined') {
                    floatingTexts.push(new FloatingText(canvas.width / 2, canvas.height / 3, 
                        `${targetHit.name.toUpperCase()} DESTROYED!`, '#ff4757'));
                }

                // Drop scrap reward for breaking component
                if (window.Economy && typeof scrapDrops !== 'undefined') {
                    const scrapAmt = Math.round(50 + Math.random() * 50);
                    scrapDrops.push(new ScrapDrop(sparkX, sparkY, 'scrap_large', scrapAmt));
                }

                this.state = 'rage';
                this.stateTimer = 2.8;
            }
        }

        this.hp = Math.max(0, this.hp - amt);

        const flashType = this.hp > this.hpMax * 0.5 ? 'boss_armored' : 'boss_vulnerable';
        spawnHitFlash(this.x + this.width / 2, this.y + this.height / 2, flashType);

        // Boss Defeat Check
        if (this.hp <= 0) {
            this.hp = 0;
            bossDefeated = true;

            if (typeof StoryTriggers !== 'undefined') {
                StoryTriggers.onBossKill(this.biome, this.isMidBoss);
            }

            if (window.BanterEngine) {
                BanterEngine.trigger('boss_defeat', this.biome);
            }

            // High scrap drops upon boss kill
            if (window.Economy && typeof scrapDrops !== 'undefined') {
                const totalDrops = this.isMidBoss ? 6 : 14;
                for (let d = 0; d < totalDrops; d++) {
                    const drop = Economy.rollDrop(this.isMidBoss ? 'boss_mid' : 'boss_biome', this.biome);
                    const ecoDrop = Economy.createDrop(
                        this.x + 50 + (Math.random() - 0.5) * 60,
                        this.y + 60 + (Math.random() - 0.5) * 60,
                        drop.type, drop.amount
                    );
                    scrapDrops.push(new ScrapDrop(ecoDrop.x, ecoDrop.y, ecoDrop.type, drop.amount));
                }
            }

            for (let i = 0; i < (this.isMidBoss ? 18 : 35); i++) {
                this._explosionTimers.push(setTimeout(() => {
                    createExplosion(this.x + Math.random() * 160, this.y + Math.random() * 120, '#ff3300', 14);
                    playSound('explosion');
                }, i * 90));
            }

            if (this.isMidBoss) {
                if (this._advanceTimeout) clearTimeout(this._advanceTimeout);
                this._advanceTimeout = setTimeout(() => { advanceSubLevel(); }, 2500);
            } else if (this.biome >= 10) {
                _winTransition = true;
                determineEnding();
                if (typeof saveTotalScrapOnBiomeCompletion === 'function') {
                    saveTotalScrapOnBiomeCompletion();
                }
                if (this._victoryTimeout) clearTimeout(this._victoryTimeout);
                this._victoryTimeout = setTimeout(() => { playVictoryCinematic(); }, 3500);
            } else {
                if (this._advanceTimeout) clearTimeout(this._advanceTimeout);
                this._advanceTimeout = setTimeout(() => { advanceToNextBiome(); }, 3000);
            }
        }
    }

    draw() {
        // ─── AMBUSH WARNING INDICATOR (Drawn across screen edge) ─────
        if (this.state === 'ambush_warning') {
            ctx.save();
            const flash = Math.sin(this.bobTimer * 12) > 0;
            ctx.fillStyle = flash ? 'rgba(255, 0, 80, 0.35)' : 'rgba(255, 230, 0, 0.20)';
            
            if (this.ambushDir === 'TOP') {
                ctx.fillRect(0, 0, canvas.width, 30);
            } else if (this.ambushDir === 'BOTTOM') {
                ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
            } else {
                ctx.fillRect(canvas.width - 40, 0, 40, canvas.height);
            }

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 15;
            ctx.fillText(`⚠️ WARNING: ${this.bossName} AMBUSH FROM ${this.ambushDir} ⚠️`, canvas.width / 2, 22);
            ctx.restore();
        }

        ctx.save();
        const cx = this.x + this.width / 2 + this.recoilX * 8;
        const cy = this.y + this.height / 2;
        ctx.translate(cx, cy);

        // Dynamic breathing and mechanical tilt
        const pulseX = 1 + Math.sin(this.bobTimer * 4) * 0.03;
        const pulseY = 1 + Math.cos(this.bobTimer * 4) * 0.03;
        ctx.scale(pulseX, pulseY);

        if (this.rotation) {
            ctx.rotate(this.rotation);
        }

        // Sprite selection
        const spritesDict = (typeof window !== 'undefined' && window.bossSprites) ? window.bossSprites : (typeof bossSprites !== 'undefined' ? bossSprites : {});
        const sprite = spritesDict[this.spriteKey] ||
                       spritesDict[this.isMidBoss ? `boss_b${this.biome}_mid_0` : `boss_b${this.biome}_0`] ||
                       spritesDict[`boss_b${this.biome}_0`] ||
                       spritesDict[`boss_${(this.biome - 1) % 4}`] ||
                       spritesDict['boss_0'] ||
                       spritesDict['boss'];

        const isImage = sprite && sprite.tagName !== 'CANVAS' && sprite.complete && sprite.naturalWidth > 0;
        const isCanvas = sprite && sprite.tagName === 'CANVAS' && sprite.width > 0;
        const hasSprite = isImage || isCanvas;
        const animDef = (typeof SPRITE_ANIMATIONS !== 'undefined' && window.SPRITE_ANIMATIONS) ? window.SPRITE_ANIMATIONS[this.spriteKey] : null;

        const renderW = this.isMidBoss ? 150 : 190;
        const renderH = this.isMidBoss ? 150 : 135;

        // Ambient & rage lighting
        if (this.state === 'charge_up') {
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 30;
        } else if (this.state === 'rage') {
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 25;
        } else {
            ctx.shadowColor = this.themeShadow;
            ctx.shadowBlur = 12 + Math.sin(this.bobTimer * 3) * 5;
        }

        if (hasSprite) {
            // Determine active action state and hardpoint damage frame
            let actionName = 'idle';
            let customFrameIndex = undefined;

            if (this.hp <= 0) {
                actionName = 'death';
            } else if (this.targetPoints && this.targetPoints.length > 0 && this.targetPoints.some(tp => tp.destroyed || tp.hp <= 0)) {
                actionName = 'hit';
                const totalParts = this.targetPoints.length;
                const destroyedParts = this.targetPoints.filter(tp => tp.destroyed || tp.hp <= 0);
                const destroyedCount = destroyedParts.length;

                // Progressive non-reverting destruction mapping:
                // Frame 0: Tier 1 damage (1st part destroyed)
                // Frame 1: Tier 2 damage (2 parts destroyed - keeps Tier 1 destroyed)
                // Frame 2: Tier 3 damage (3 parts destroyed - keeps Tiers 1 & 2 destroyed)
                // Frame 3: Critical breakdown (all parts destroyed or HP <= 20%)
                if (destroyedCount >= totalParts || (this.hp / this.hpMax) <= 0.20) {
                    customFrameIndex = 3;
                } else if (destroyedCount >= 3) {
                    customFrameIndex = 2;
                } else if (destroyedCount >= 2) {
                    customFrameIndex = 1;
                } else if (destroyedCount === 1) {
                    const pId = destroyedParts[0].id;
                    if (this.spriteKey === 'boss_b1_mid_0') {
                        if (pId === 'tentacles') customFrameIndex = 0;
                        else if (pId === 'maw') customFrameIndex = 1;
                        else if (pId === 'shell') customFrameIndex = 2;
                        else customFrameIndex = 0;
                    } else if (this.spriteKey === 'boss_b2_mid_0') {
                        if (pId === 'upper_flak') customFrameIndex = 0;
                        else if (pId === 'lower_flak') customFrameIndex = 1;
                        else if (pId === 'calcified_plate') customFrameIndex = 2;
                        else customFrameIndex = 0;
                    } else if (this.spriteKey === 'boss_b3_mid_0') {
                        if (pId === 'rail_arm') customFrameIndex = 0;
                        else if (pId === 'shield_arm') customFrameIndex = 1;
                        else if (pId === 'sensor_pod') customFrameIndex = 2;
                        else customFrameIndex = 0;
                    } else if (this.spriteKey === 'boss_b5_mid_0') {
                        if (pId === 'ram_prow') customFrameIndex = 0;
                        else if (pId === 'freeze_mortar') customFrameIndex = 1;
                        else if (pId === 'cooling_vents') customFrameIndex = 2;
                        else customFrameIndex = 0;
                    } else if (this.spriteKey === 'boss_b8_mid_0') {
                        if (pId === 'upper_turret') customFrameIndex = 0;
                        else if (pId === 'lower_turret') customFrameIndex = 1;
                        else if (pId === 'drone_hangar') customFrameIndex = 2;
                        else customFrameIndex = 0;
                    } else {
                        const partIdx = this.targetPoints.findIndex(tp => tp.id === pId);
                        customFrameIndex = Math.max(0, Math.min(2, partIdx));
                    }
                }
            } else if (this.state === 'charge_up' || this.state === 'charge_blast' || this.muzzleFlashTimer > 0) {
                actionName = 'shoot';
            } else if (this.targetPoints && this.targetPoints.some(tp => tp.hitTimer > 1.8)) {
                actionName = 'hit';
                customFrameIndex = 0;
            }

            if (animDef && typeof drawAnimatedSpriteSheet === 'function') {
                // Biome 10 Chromatic Glitch Offset
                if (this.biome === 10) {
                    ctx.globalAlpha = 0.60;
                    drawAnimatedSpriteSheet(ctx, sprite, animDef, actionName, this.bobTimer, -renderW / 2 - 3, -renderH / 2, renderW, renderH, customFrameIndex);
                    drawAnimatedSpriteSheet(ctx, sprite, animDef, actionName, this.bobTimer, -renderW / 2 + 3, -renderH / 2, renderW, renderH, customFrameIndex);
                    ctx.globalAlpha = 1.0;
                }
                drawAnimatedSpriteSheet(ctx, sprite, animDef, actionName, this.bobTimer, -renderW / 2, -renderH / 2, renderW, renderH, customFrameIndex);
            } else {
                // Biome 10 Chromatic Glitch Offset
                if (this.biome === 10) {
                    ctx.globalAlpha = 0.60;
                    ctx.drawImage(sprite, -renderW / 2 - 3, -renderH / 2, renderW, renderH);
                    ctx.drawImage(sprite, -renderW / 2 + 3, -renderH / 2, renderW, renderH);
                    ctx.globalAlpha = 1.0;
                }
                ctx.drawImage(sprite, -renderW / 2, -renderH / 2, renderW, renderH);
            }
        } else {
            ctx.fillStyle = this.themeColor;
            ctx.beginPath();
            ctx.ellipse(0, 0, renderW / 2, renderH / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // ─── CHARGED ATTACK ENERGY PULSES OVERLAY ────────────────────
        if (this.state === 'charge_up') {
            ctx.save();
            const p = this.chargeProgress;
            const ringRadius = (renderW / 2) * (1.4 - p * 0.8);
            
            ctx.strokeStyle = this.pulseColor;
            ctx.lineWidth = 3 + p * 4;
            ctx.shadowColor = this.pulseColor;
            ctx.shadowBlur = 25;

            ctx.beginPath();
            ctx.arc(0, 0, Math.max(10, ringRadius), 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, Math.max(5, ringRadius * 0.5), 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-renderW / 4, 0, 8 + p * 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // ─── CHARGE BLAST LASER BEAM OVERLAY ────────────────────────
        if (this.state === 'charge_blast' && (this.biome === 1 || this.biome === 3 || this.biome === 5 || this.biome === 7 || this.biome === 8 || this.biome === 10)) {
            ctx.save();
            ctx.shadowColor = this.pulseColor;
            ctx.shadowBlur = 30;

            const bGrd = ctx.createLinearGradient(-renderW / 2, -35, -renderW / 2, 35);
            bGrd.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
            bGrd.addColorStop(0.3, '#ffffff');
            bGrd.addColorStop(0.5, this.pulseColor);
            bGrd.addColorStop(0.7, '#ffffff');
            bGrd.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
            ctx.fillStyle = bGrd;

            const endX = -this.x - renderW;
            ctx.fillRect(endX, -30, -endX - renderW / 2, 60);

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-renderW / 2, 0, 35, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // ─── ANIMATED BLASTER MUZZLE FLASHES & BARREL HEAT ON BOSS ──────────
        if (this.muzzleFlashTimer > 0) {
            ctx.save();
            ctx.shadowColor = this.pulseColor;
            ctx.shadowBlur = 25;
            ctx.fillStyle = '#ffffff';
            const flashR = 12 * this.muzzleFlashTimer;
            ctx.beginPath();
            ctx.arc(-renderW / 2 + 5, 0, flashR, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // ─── DESTROYED HARDPOINT VISUAL DAMAGE SCARS ────────────────────────
        for (const tp of this.targetPoints) {
            if (tp.destroyed) {
                ctx.save();
                const pLocalX = (tp.relX + tp.width / 2) - this.width / 2;
                const pLocalY = (tp.relY + tp.height / 2) - this.height / 2;

                // Blackened Scorch Mark (Only for procedural fallback shapes)
                if (!animDef) {
                    ctx.fillStyle = 'rgba(15, 15, 20, 0.75)';
                    ctx.beginPath();
                    ctx.ellipse(pLocalX, pLocalY, tp.width * 0.45, tp.height * 0.45, 0, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Sparking Electrical Arcs
                if (Math.random() < 0.4) {
                    ctx.strokeStyle = Math.random() < 0.5 ? '#ffaa00' : '#00ffff';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(pLocalX + (Math.random() - 0.5) * tp.width * 0.6, pLocalY + (Math.random() - 0.5) * tp.height * 0.6);
                    ctx.lineTo(pLocalX + (Math.random() - 0.5) * tp.width * 0.6, pLocalY + (Math.random() - 0.5) * tp.height * 0.6);
                    ctx.stroke();
                }

                ctx.restore();
            }
        }

        // ─── BOSS NAME & STAGE HUD ───────────────────────────────────
        ctx.shadowBlur = 0;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.pulseColor;
        ctx.strokeStyle = 'rgba(0,0,0,0.85)';
        ctx.lineWidth = 3;

        const nameTag = `${this.bossName} [${this.isMidBoss ? 'SUB-BOSS' : 'STAGE ' + (this.currentStage + 1)}]`;
        ctx.strokeText(nameTag, 0, -renderH / 2 - 10);
        ctx.fillText(nameTag, 0, -renderH / 2 - 10);

        ctx.restore();

        // ─── ACTIVE TARGET POINT FLOATING MINI-HEALTH BARS ──────────
        for (const tp of this.targetPoints) {
            if (tp.hitTimer > 0 && !tp.destroyed) {
                ctx.save();
                const alpha = Math.min(1.0, tp.hitTimer / 0.4);
                ctx.globalAlpha = alpha;

                const barX = this.x + tp.relX + tp.width / 2;
                const barY = this.y + tp.relY - 14;
                const barW = 68;
                const barH = 5;

                // Background
                ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
                ctx.fillRect(barX - barW / 2 - 2, barY - 2, barW + 4, barH + 4);

                // Health fill
                const ratio = Math.max(0, tp.hp / tp.maxHp);
                ctx.fillStyle = ratio > 0.5 ? '#2ecc71' : (ratio > 0.25 ? '#f1c40f' : '#e74c3c');
                ctx.fillRect(barX - barW / 2, barY, barW * ratio, barH);

                // Hardpoint label
                ctx.font = 'bold 7px monospace';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.strokeText(tp.name, barX, barY - 4);
                ctx.fillText(tp.name, barX, barY - 4);

                ctx.restore();
            }
        }
    }
}

// --- Window bindings for explicit global scope ---
window.EnemyBullet = EnemyBullet;
window.Enemy = Enemy;
window.Boss = Boss;
window.BOSS_HARDPOINTS_MAP = BOSS_HARDPOINTS_MAP;
