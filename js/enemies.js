// enemies.js — EnemyBullet, Seeded RNG, Enemy, and Boss classes
// Extracted from index.html by Ned (GRO-1094)

// --- Enemy Bullet Class ---
        class EnemyBullet {
            constructor(x, y, vx, vy, type = 'bullet') {
                this.x = x;
                this.y = y;
                this.vx = vx;
                this.vy = vy;
                this.type = type; // 'bullet' or 'missile'
                this.color = type === 'missile' ? '#FF8800' : '#FF3333';
                this.size = type === 'missile' ? 7 : 5;
            }

            update(dt) {
                this.x += this.vx * dt;
                this.y += this.vy * dt;

                // Smoke trail for boss/enemy missiles
                if (this.type === 'missile') {
                    if (Math.random() < 0.45) {
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
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);

                // Rotate: enemy bullets face direction of movement
                const angle = Math.atan2(this.vy, this.vx);
                ctx.rotate(angle);

                if (this.type === 'missile') {
                    // Custom Boss Missile: Orange body, white tip, red fins, flame exhaust
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

                // Default enemy laser bolt
                const renderSize = this.size * 4;
                const pulse = 0.7 + Math.sin(gameTime * 8 + this.x * 0.05) * 0.3;

                // Subtle shimmer accent — faint radial glow behind the bolt
                const glowGrad = ctx.createRadialGradient(0, 0, renderSize * 0.15, 0, 0, renderSize * 0.8);
                glowGrad.addColorStop(0, 'rgba(255, 100, 30, 0.5)');
                glowGrad.addColorStop(0.5, 'rgba(255, 30, 0, 0.15)');
                glowGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');

                ctx.globalAlpha = pulse * 0.7;
                ctx.fillStyle = glowGrad;
                ctx.fillRect(-renderSize * 0.8, -renderSize * 0.8, renderSize * 1.6, renderSize * 1.6);

                // Enemy laser bolt sprite on top
                const sprite = vfxSprites['laser_enemy'];
                const isImage = sprite && sprite.tagName !== 'CANVAS' && sprite.complete && sprite.naturalWidth > 0;
                const isCanvas = sprite && sprite.tagName === 'CANVAS' && sprite.width > 0;
                if (isImage || isCanvas) {
                    ctx.globalAlpha = 0.9;
                    drawSpriteFrame(ctx, sprite, 0, 0, SPRITE_FRAME, SPRITE_FRAME,
                        -renderSize / 2, -renderSize / 2,
                        renderSize, renderSize);
                }

                ctx.globalAlpha = 1;
                ctx.restore();
            }
        }

        // --- Seeded RNG for procedural variation (GRO-1006) ---
        // mulberry32: fast, high-quality 32-bit PRNG — deterministic per seed
        function mulberry32(a) {
            return function() {
                a |= 0;
                a = a + 0x6D2B79F5 | 0;
                var t = Math.imul(a ^ a >>> 15, 1 | a);
                t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            };
        }

        // --- Enemy Ship Classes ---
        class Enemy {
            constructor(type) {
                this.type = type || 'scout';
                this.id = ++enemyIdCounter;  // Unique ID for Economy.shouldDrop()
                this.x = canvas.width + 50;
                this.y = 50 + Math.random() * (canvas.height - 100);
                this.width = 32;
                this.height = 32;
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

                // Determine behavior pattern and map attributes
                const isScout = type === 'scout' || type.includes('crawler') || type.includes('drone') || type.includes('sprite') || type.includes('wisp') || type.includes('spark') || type.includes('fragment') || type.includes('angler');
                const isInterceptor = type === 'interceptor' || type.includes('interceptor') || type.includes('spitter') || type.includes('wraith') || type.includes('fighter') || type.includes('hawk') || type.includes('aberration') || type.includes('wasp') || type.includes('sentinel');
                const isHeavy = type === 'heavy' || type.includes('heavy') || type.includes('brute') || type.includes('turret') || type.includes('battery') || type.includes('golem') || type.includes('giant') || type.includes('node') || type.includes('glacier') || type.includes('thunderhead') || type.includes('juggernaut') || type.includes('null_entity') || type.includes('crab');
                const isHazard = type.includes('eel') || type.includes('urchin') || type.includes('swarm') || type.includes('shard');

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

                if (this.behaviorPattern === 'scout') {
                    this.x -= this.speed * dt;
                    const _freq = [4.5, 5.2, 6.0][this._moveVariant];
                    const _amp = [50, 65, 75][this._moveVariant];
                    this.y = this.startY + Math.sin(this.age * _freq) * _amp;
                } else if (this.behaviorPattern === 'interceptor') {
                    this.x -= this.speed * dt;
                    // Interceptor jukes vertically toward player plane
                    if (typeof player !== 'undefined' && player) {
                        const targetY = player.y;
                        const dy = targetY - this.y;
                        this.y += Math.sign(dy) * Math.min(Math.abs(dy), 60 * dt);
                    }
                    this.y += Math.sin(this.age * 6) * 15 * dt;
                } else if (this.behaviorPattern === 'heavy') {
                    this.x -= this.speed * dt;
                    this.y += Math.sin(this.age * 2) * 12 * dt;
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
                }
            }

            shoot() {
                const targetPlayer = (typeof player !== 'undefined') ? player : { x: 100, y: canvas.height / 2 };
                const dx = targetPlayer.x - this.x;
                const dy = targetPlayer.y - this.y;
                const dist = Math.max(1, Math.sqrt(dx*dx + dy*dy));
                const bulletSpeed = -220;

                const _shiftedDy = (dy/dist) + this._bulletAngleShift;

                playSound('enemy_shoot', {enemyType: this.type});
                enemyBullets.push(new EnemyBullet(this.x, this.y + this.height/2, bulletSpeed, _shiftedDy * 100));
            }

            draw() {
                ctx.save();
                
                const cx = this.x + this.width / 2;
                const cy = this.y + this.height / 2;
                ctx.translate(cx, cy);

                // Dynamic banking and organic pulsation
                const pulseX = 1 + Math.sin(this.age * 7) * 0.05;
                const pulseY = 1 + Math.cos(this.age * 7) * 0.05;
                ctx.scale(pulseX, pulseY);

                if (this.rotation) {
                    ctx.rotate(this.rotation);
                }

                // Resolve exact sprite
                const sprite = enemySprites[this.type] ||
                               enemySprites[this.type + '_0'] ||
                               enemySprites['enemy_' + this.type + '_0'] ||
                               enemySprites[this.behaviorPattern] ||
                               enemySprites['angler_scout'];

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

                    if (isImage) {
                        ctx.globalCompositeOperation = 'lighter';
                    }
                    
                    ctx.drawImage(sprite, -renderSize / 2, -renderSize / 2, renderSize, renderSize);

                    if (isImage) {
                        ctx.globalCompositeOperation = 'source-over';
                    }
                } else {
                    // Fallback geometry (unique non-player silhouette)
                    ctx.fillStyle = this.isParadox ? this.paradoxColor : this.color;
                    ctx.shadowColor = this.biomeGlowColor;
                    ctx.shadowBlur = 8;
                    
                    ctx.beginPath();
                    ctx.arc(0, 0, renderSize / 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }

                // If Paradox, draw title above
                if (this.isParadox) {
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = this.paradoxColor;
                    ctx.font = 'bold 9px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(this.paradoxName, 0, -renderSize / 2 - 4);
                }
                
                // Debug labels
                if (window.DEBUG_LABELS) {
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = 'rgba(255,255,255,0.85)';
                    ctx.font = '8px monospace';
                    ctx.textAlign = 'center';
                    const label = this.type + (this.enemyType ? '/' + this.enemyType : '');
                    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
                    ctx.lineWidth = 2;
                    ctx.strokeText(label, 0, -renderSize / 2 - 4);
                    ctx.fillText(label, 0, -renderSize / 2 - 4);
                }

                ctx.restore();
            }
        }

        // --- Boss Fighter Class (Multi-Stage & Stratum Variety) ---
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
                this._victoryTimeout = null;
                this._advanceTimeout = null;
                this._explosionTimers = [];

                // Detect mid-boss (level 5) vs biome boss (level 10)
                this.isMidBoss = (typeof LevelManager !== 'undefined' && LevelManager.level === 5) || 
                                 (typeof LevelManager !== 'undefined' && LevelManager.currentLevelConfig && LevelManager.currentLevelConfig.midBoss);

                const difficultyConfig = getCurrentDifficultyConfig();
                let baseHp = 120;
                if (typeof LevelManager !== 'undefined' && typeof LevelManager.getBossHP === 'function') {
                    baseHp = LevelManager.getBossHP() || (this.isMidBoss ? 60 : 120);
                } else if (typeof BIOME_DATA !== 'undefined' && BIOME_DATA.bossHP && BIOME_DATA.bossHP[biomeLevel]) {
                    baseHp = this.isMidBoss ? BIOME_DATA.bossHP[biomeLevel].midBoss : BIOME_DATA.bossHP[biomeLevel].biomeBoss;
                }

                // Dynamic Co-Op Scaling
                let coOpMultiplier = 1.0;
                if (typeof Multiplayer !== 'undefined' && Multiplayer.activePlayers && Multiplayer.activePlayers.length > 1) {
                    coOpMultiplier = 1.0 + 0.45 * (Multiplayer.activePlayers.length - 1);
                }
                
                this.hpMax = Math.round(baseHp * difficultyConfig.bossHpMultiplier * coOpMultiplier);
                this.hp = this.hpMax;

                // Dynamic Boss Names & Themes per Biome
                const midBossNames = {
                    1: "TRENCH NAUTILUS", 2: "CALCIFIED SCORPION", 3: "CRYO MANTIS",
                    4: "WARP STRIKER", 5: "FROST BEHEMOTH", 6: "MAGMA DRAKE",
                    7: "VOLT WYVERN", 8: "GHOST FRIGATE", 9: "HIVE CRUSHER",
                    10: "PARADOX HARBINGER"
                };
                const biomeBossNames = {
                    1: "ABYSSAL GUARDIAN", 2: "CORAL COLOSSUS", 3: "HATCHERY QUEEN",
                    4: "NEBULA WRAITH", 5: "KRAKEN UMBRA", 6: "EMBER OVERLORD",
                    7: "STORM SENTINEL", 8: "NAVY DREADNOUGHT", 9: "HIVE MIND NODE",
                    10: "CYBER COELACANTH"
                };
                this.bossName = this.isMidBoss ? (midBossNames[biomeLevel] || "SUB-GUARDIAN") : (biomeBossNames[biomeLevel] || "BIOME OVERLORD");
                this.spriteKey = this.isMidBoss ? `boss_b${biomeLevel}_mid_0` : `boss_b${biomeLevel}_0`;

                // Multi-Stage & Destructible Hardpoint System
                if (this.isMidBoss) {
                    this.stages = [
                        { name: 'Armor Shell', hpRatio: 0.50, destroyed: false, hardpoint: 'Armor Plating' },
                        { name: 'Exposed Core', hpRatio: 0.00, destroyed: false, hardpoint: 'Bio-Core' }
                    ];
                } else if (biomeLevel === 10) {
                    this.stages = [
                        { name: 'Dorsal Heavy Railgun', hpRatio: 0.66, destroyed: false, hardpoint: 'Railgun Cannon' },
                        { name: 'Singularity Launchers', hpRatio: 0.33, destroyed: false, hardpoint: 'Ventral Pods' },
                        { name: 'Unbound Chrono Core', hpRatio: 0.00, destroyed: false, hardpoint: 'Chrono Core' }
                    ];
                } else {
                    const hardpoints = {
                        1: 'Dorsal Railgun Cannon', 2: 'Dual Coral Flak Turrets', 3: 'Cryo Brood Sac',
                        4: 'Quantum Shield Prisms', 5: 'Icebreaker Titanium Plating', 6: 'Solar Prominence Wings',
                        7: 'Twin Tesla Pylons', 8: 'Battleship Quad Turrets', 9: 'Synaptic Neuro-Nodes'
                    };
                    this.stages = [
                        { name: hardpoints[biomeLevel] || 'Weapon Array', hpRatio: 0.50, destroyed: false, hardpoint: hardpoints[biomeLevel] || 'Hardpoint' },
                        { name: 'Exposed Bio/Chrono Core', hpRatio: 0.00, destroyed: false, hardpoint: 'Core' }
                    ];
                }
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
                const theme = bossThemes[biomeLevel] || { color: 'rgba(0, 255, 255, 0.25)', shadow: '#00ffff', pulse: '#00e5ff' };
                this.themeColor = theme.color;
                this.themeShadow = theme.shadow;
                this.pulseColor = theme.pulse;

                this.state = 'intro';
                this.stateTimer = 2.0;
                this.shootTimer = 0.8 / difficultyConfig.enemyFireRateMultiplier;
                this.architectPhase = null;

                console.log(`[BOSS] Spawned ${this.bossName} (${this.isMidBoss ? 'Mid-Boss' : 'Biome Boss'}), HP: ${this.hpMax}, Sprite: ${this.spriteKey}`);

                if (window.BanterEngine) {
                    BanterEngine.trigger('boss_entrance', biomeLevel);
                }
            }

            cleanup() {
                if (this._victoryTimeout) { clearTimeout(this._victoryTimeout); this._victoryTimeout = null; }
                if (this._advanceTimeout) { clearTimeout(this._advanceTimeout); this._advanceTimeout = null; }
                this._explosionTimers.forEach(t => clearTimeout(t));
                this._explosionTimers = [];
            }

            update(dt) {
                this.bobTimer += dt;

                // Entrance glide
                if (this.state === 'intro') {
                    this.x -= 45 * dt;
                    if (this.x <= canvas.width - 210) {
                        this.x = canvas.width - 210;
                        this.state = 'idle';
                        this.stateTimer = 2.8;
                    }
                    return;
                }

                // Vertical hover
                const hoverAmp = this.currentStage > 0 ? 30 : 20;
                const hoverFreq = this.currentStage > 0 ? 2.8 : 2.0;
                this.y += Math.sin(this.bobTimer * hoverFreq) * hoverAmp * dt;

                // State cycle timer
                this.stateTimer -= dt;
                if (this.stateTimer <= 0) {
                    if (this.state === 'idle') {
                        // Switch to Alternating attack or Charged attack
                        if (Math.random() < 0.45) {
                            this.state = 'alternating';
                            this.stateTimer = 3.0;
                        } else {
                            this.state = 'charge_up';
                            this.stateTimer = 1.8;
                            this.chargeProgress = 0;
                            playSound('laser_charge');
                        }
                    } else if (this.state === 'alternating') {
                        this.state = 'idle';
                        this.stateTimer = 2.5;
                    } else if (this.state === 'charge_up') {
                        this.state = 'charge_blast';
                        this.stateTimer = 1.6;
                        this.fireChargedBlast();
                        playSound('laser_fire');
                    } else if (this.state === 'charge_blast' || this.state === 'rage') {
                        this.state = 'idle';
                        this.stateTimer = 2.2;
                    }
                }

                // Charge-up particle & pulse updates
                if (this.state === 'charge_up') {
                    this.chargeProgress = Math.min(1.0, 1.0 - (this.stateTimer / 1.8));
                    if (Math.random() < 0.6) {
                        createExplosion(this.x + 30 + Math.random() * 80, this.y + 40 + Math.random() * 60, this.pulseColor, 4);
                    }
                }

                // Continuous weapon firing
                this.shootTimer -= dt;
                if (this.shootTimer <= 0) {
                    if (this.state === 'idle') {
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

            // ─── ATTACK 1: NORMAL THEMATIC ATTACK ───────────────────────────
            attackNormal() {
                playSound('enemy_shoot', { enemyType: this.enemyType });
                const b = biomeLevel;
                const tx = this.x + 10;
                const ty = this.y + 70;

                if (b === 1) {
                    // Abyssal Trident salvo
                    enemyBullets.push(new EnemyBullet(tx, ty - 30, -280, -60));
                    enemyBullets.push(new EnemyBullet(tx, ty, -300, 0, 'missile'));
                    enemyBullets.push(new EnemyBullet(tx, ty + 30, -280, 60));
                } else if (b === 2) {
                    // Calcified bone needle fan
                    for (let i = -2; i <= 2; i++) {
                        enemyBullets.push(new EnemyBullet(tx, ty, -250, i * 45));
                    }
                } else if (b === 3) {
                    // Cryo ice-lance needles
                    enemyBullets.push(new EnemyBullet(tx, ty - 25, -340, 0));
                    enemyBullets.push(new EnemyBullet(tx, ty, -360, 0, 'missile'));
                    enemyBullets.push(new EnemyBullet(tx, ty + 25, -340, 0));
                } else if (b === 4) {
                    // Ethereal curving wisps
                    enemyBullets.push(new EnemyBullet(tx, ty - 35, -270, -90));
                    enemyBullets.push(new EnemyBullet(tx, ty, -290, 0));
                    enemyBullets.push(new EnemyBullet(tx, ty + 35, -270, 90));
                } else if (b === 5) {
                    // Sub-zero frost flak + homing missile
                    enemyBullets.push(new EnemyBullet(tx, ty - 40, -260, -70, 'missile'));
                    enemyBullets.push(new EnemyBullet(tx, ty + 40, -260, 70, 'missile'));
                    enemyBullets.push(new EnemyBullet(tx, ty, -310, 0));
                } else if (b === 6) {
                    // Magma flare radial burst
                    for (let i = -2; i <= 2; i++) {
                        enemyBullets.push(new EnemyBullet(tx, ty, -270, i * 65));
                    }
                } else if (b === 7) {
                    // High-voltage lightning needles
                    enemyBullets.push(new EnemyBullet(tx, ty - 30, -440, 0));
                    enemyBullets.push(new EnemyBullet(tx, ty, -460, 0));
                    enemyBullets.push(new EnemyBullet(tx, ty + 30, -440, 0));
                } else if (b === 8) {
                    // Naval battleship battery flak
                    enemyBullets.push(new EnemyBullet(tx, ty - 35, -330, -80));
                    enemyBullets.push(new EnemyBullet(tx, ty, -350, 0, 'missile'));
                    enemyBullets.push(new EnemyBullet(tx, ty + 35, -330, 80));
                } else if (b === 9) {
                    // Synaptic bio-plasma spray
                    for (let i = -1; i <= 1; i++) {
                        enemyBullets.push(new EnemyBullet(tx, ty, -260, i * 80));
                    }
                } else {
                    // Chrono tachyon stream
                    enemyBullets.push(new EnemyBullet(tx, ty - 30, -320, -70));
                    enemyBullets.push(new EnemyBullet(tx, ty, -350, 0, 'missile'));
                    enemyBullets.push(new EnemyBullet(tx, ty + 30, -320, 70));
                }
            }

            // ─── ATTACK 2: ALTERNATING WEAPON SWEEP ───────────────────────────
            attackAlternating() {
                playSound('enemy_shoot', { enemyType: this.enemyType });
                this.altAttackToggle = !this.altAttackToggle;
                
                const targetPlayer = (typeof player !== 'undefined') ? player : { x: 100, y: canvas.height / 2 };
                const dy = targetPlayer.y - (this.y + 70);
                const dx = targetPlayer.x - (this.x + 10);
                const dist = Math.max(1, Math.sqrt(dx*dx + dy*dy));

                if (this.altAttackToggle) {
                    // Upper hardpoint barrage
                    const upY = this.y + 25;
                    enemyBullets.push(new EnemyBullet(this.x + 20, upY, -290, -90));
                    enemyBullets.push(new EnemyBullet(this.x + 20, upY, (dx/dist) * 310, (dy/dist) * 310));
                } else {
                    // Lower hardpoint barrage
                    const lowY = this.y + 115;
                    enemyBullets.push(new EnemyBullet(this.x + 20, lowY, -290, 90));
                    enemyBullets.push(new EnemyBullet(this.x + 20, lowY, (dx/dist) * 310, (dy/dist) * 310));
                }
            }

            // ─── ATTACK 3: CHARGED ENERGY PULSE BLAST ────────────────────────
            fireChargedBlast() {
                const b = biomeLevel;
                const tx = this.x + 10;
                const ty = this.y + 70;

                createExplosion(tx, ty, this.pulseColor, 20);

                if (b === 2 || b === 4 || b === 6 || b === 9) {
                    // 16-Direction Super-Nova Radial Barrage
                    const count = 16;
                    for (let i = 0; i < count; i++) {
                        const ang = i * (Math.PI * 2 / count) + this.bobTimer;
                        enemyBullets.push(new EnemyBullet(tx, ty, Math.cos(ang) * 260, Math.sin(ang) * 260));
                    }
                } else {
                    // Multi-Beam Heavy Laser Salvo
                    for (let o = -60; o <= 60; o += 30) {
                        enemyBullets.push(new EnemyBullet(tx, ty + o, -400, o * 1.5));
                        enemyBullets.push(new EnemyBullet(tx, ty + o, -360, o * 0.8, 'missile'));
                    }
                }
            }

            takeDamage(amt) {
                if (this.hp <= 0) return;
                this.hp -= amt;
                playSound('hit');
                createExplosion(this.x + Math.random() * 140, this.y + Math.random() * 100, '#ffffff', 5);

                // Multi-Stage & Destructible Hardpoint Check
                const currentRatio = this.hp / this.hpMax;
                for (let i = 0; i < this.stages.length - 1; i++) {
                    const st = this.stages[i];
                    if (!st.destroyed && currentRatio <= st.hpRatio) {
                        st.destroyed = true;
                        this.currentStage = i + 1;
                        
                        // Hardpoint Destruction VFX & Event
                        playSound('explosion');
                        for (let k = 0; k < 12; k++) {
                            createExplosion(this.x + 40 + Math.random() * 100, this.y + 20 + Math.random() * 90, '#ff3300', 12);
                        }
                        spawnHitFlash(this.x + this.width / 2, this.y + this.height / 2, 'boss_vulnerable');
                        
                        if (typeof floatingTexts !== 'undefined') {
                            floatingTexts.push(new FloatingText(canvas.width / 2, canvas.height / 3, 
                                `${st.hardpoint.toUpperCase()} DESTROYED!`, '#ff4757'));
                        }
                        
                        this.state = 'rage';
                        this.stateTimer = 3.5;
                        break;
                    }
                }

                const flashType = this.hp > this.hpMax * 0.5 ? 'boss_armored' : 'boss_vulnerable';
                spawnHitFlash(this.x + this.width / 2, this.y + this.height / 2, flashType);

                // Boss Defeat Check
                if (this.hp <= 0) {
                    this.hp = 0;
                    bossDefeated = true;

                    if (typeof StoryTriggers !== 'undefined') {
                        StoryTriggers.onBossKill(biomeLevel, this.isMidBoss);
                    }

                    if (window.BanterEngine) {
                        BanterEngine.trigger(this.isMidBoss ? 'midboss_defeated' : 'level_end', biomeLevel);
                    }

                    playSound('explosion');

                    // Scrap drops on defeat
                    if (typeof scrapDrops !== 'undefined' && window.Economy) {
                        const dropCount = this.isMidBoss ? 3 : (getCurrentDifficultyConfig().id === 'insane' ? 1 : 5);
                        for (let k = 0; k < dropCount; k++) {
                            const drop = Economy.rollDrop(this.enemyType, biomeLevel);
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
                        // Mid-boss clear: advance to level 6 after explosions
                        if (this._advanceTimeout) clearTimeout(this._advanceTimeout);
                        this._advanceTimeout = setTimeout(() => { advanceSubLevel(); }, 2500);
                    } else if (biomeLevel >= 10) {
                        // Final boss victory cinematic
                        _winTransition = true;
                        determineEnding();
                        if (typeof saveTotalScrapOnBiomeCompletion === 'function') {
                            saveTotalScrapOnBiomeCompletion();
                        }
                        if (this._victoryTimeout) clearTimeout(this._victoryTimeout);
                        this._victoryTimeout = setTimeout(() => { playVictoryCinematic(); }, 3500);
                    } else {
                        // Biome clear: advance to next biome
                        if (this._advanceTimeout) clearTimeout(this._advanceTimeout);
                        this._advanceTimeout = setTimeout(() => { advanceToNextBiome(); }, 3000);
                    }
                }
            }

            draw() {
                ctx.save();
                
                const cx = this.x + this.width / 2;
                const cy = this.y + this.height / 2;
                ctx.translate(cx, cy);

                // Breathing and mechanical vibration
                const pulseX = 1 + Math.sin(this.bobTimer * 4) * 0.03;
                const pulseY = 1 + Math.cos(this.bobTimer * 4) * 0.03;
                ctx.scale(pulseX, pulseY);

                // Sprite selection
                const sprite = bossSprites[this.spriteKey] ||
                               bossSprites[`boss_${(biomeLevel - 1) % 4}`] ||
                               bossSprites['boss_0'] ||
                               bossSprites['boss'];

                const isImage = sprite && sprite.tagName !== 'CANVAS' && sprite.complete && sprite.naturalWidth > 0;
                const isCanvas = sprite && sprite.tagName === 'CANVAS' && sprite.width > 0;
                const hasSprite = isImage || isCanvas;

                const renderW = this.isMidBoss ? 150 : 190;
                const renderH = this.isMidBoss ? 110 : 135;

                // Ambient & rage lighting
                if (this.state === 'charge_up') {
                    ctx.shadowColor = this.pulseColor;
                    ctx.shadowBlur = 18 + this.chargeProgress * 22;
                } else if (this.state === 'rage') {
                    ctx.shadowColor = '#ff0055';
                    ctx.shadowBlur = 20;
                } else {
                    ctx.shadowColor = this.themeShadow;
                    ctx.shadowBlur = 12 + Math.sin(this.bobTimer * 3) * 5;
                }

                if (hasSprite) {
                    if (isImage) ctx.globalCompositeOperation = 'lighter';
                    ctx.drawImage(sprite, -renderW / 2, -renderH / 2, renderW, renderH);
                    if (isImage) ctx.globalCompositeOperation = 'source-over';
                } else {
                    // Geometric fallback
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

                    // Inner contracting energy ripples
                    ctx.beginPath();
                    ctx.arc(0, 0, Math.max(5, ringRadius * 0.5), 0, Math.PI * 2);
                    ctx.stroke();

                    // Core energy condensation flare
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(-renderW / 4, 0, 8 + p * 14, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }

                // ─── CHARGE BLAST LASER BEAM OVERLAY ────────────────────────
                if (this.state === 'charge_blast' && (biomeLevel === 1 || biomeLevel === 3 || biomeLevel === 5 || biomeLevel === 7 || biomeLevel === 8 || biomeLevel === 10)) {
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

                    // Muzzle flare
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(-renderW / 2, 0, 35, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }

                // ─── BOSS NAME & HARDPOINT / STAGE HUD ───────────────────────
                ctx.shadowBlur = 0;
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.fillStyle = this.pulseColor;
                ctx.strokeStyle = 'rgba(0,0,0,0.85)';
                ctx.lineWidth = 3;

                const nameTag = `${this.bossName} [${this.isMidBoss ? 'SUB-BOSS' : 'STAGE ' + (this.currentStage + 1)}]`;
                ctx.strokeText(nameTag, 0, -renderH / 2 - 10);
                ctx.fillText(nameTag, 0, -renderH / 2 - 10);

                // Destructible hardpoint status
                if (this.stages[this.currentStage] && !this.isMidBoss) {
                    ctx.font = '8px monospace';
                    ctx.fillStyle = '#ffffff';
                    const partTag = `TARGET: ${this.stages[this.currentStage].name}`;
                    ctx.strokeText(partTag, 0, -renderH / 2 - 22);
                    ctx.fillText(partTag, 0, -renderH / 2 - 22);
                }

                ctx.restore();
            }
        }

// --- Window bindings for explicit global scope ---
window.EnemyBullet = EnemyBullet;
window.Enemy = Enemy;
window.Boss = Boss;

