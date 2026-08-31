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

        // --- Boss Fighter Class (Interactive Target Points & Dynamic Flight) ---
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

                // Dynamic Boss Names per Biome
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

                // Multi-Stage & Discrete Interactive Target Points
                if (this.isMidBoss) {
                    const subHp = Math.round(this.hpMax * 0.5);
                    this.targetPoints = [
                        { id: 'part1', name: 'Armor Shell', relX: 15, relY: 15, width: 80, height: 45, maxHp: subHp, hp: subHp, destroyed: false, hitTimer: 0 },
                        { id: 'part2', name: 'Bio-Plasma Maw', relX: 55, relY: 45, width: 70, height: 50, maxHp: subHp, hp: subHp, destroyed: false, hitTimer: 0 }
                    ];
                    this.stages = [
                        { name: 'Armor Shell', hpRatio: 0.50, destroyed: false, hardpoint: 'Armor Shell' },
                        { name: 'Exposed Bio-Core', hpRatio: 0.00, destroyed: false, hardpoint: 'Bio-Core' }
                    ];
                } else if (biomeLevel === 10) {
                    const p1 = Math.round(this.hpMax * 0.34);
                    const p2 = Math.round(this.hpMax * 0.33);
                    const p3 = Math.round(this.hpMax * 0.33);
                    this.targetPoints = [
                        { id: 'railgun', name: 'Dorsal Chrono Railgun', relX: 20, relY: 10, width: 85, height: 40, maxHp: p1, hp: p1, destroyed: false, hitTimer: 0 },
                        { id: 'singularity', name: 'Singularity Launchers', relX: 20, relY: 90, width: 85, height: 40, maxHp: p2, hp: p2, destroyed: false, hitTimer: 0 },
                        { id: 'chrono_core', name: 'Unbound Chrono Core', relX: 55, relY: 45, width: 80, height: 55, maxHp: p3, hp: p3, destroyed: false, hitTimer: 0 }
                    ];
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
                    const hp1 = Math.round(this.hpMax * 0.50);
                    const hp2 = Math.round(this.hpMax * 0.50);
                    this.targetPoints = [
                        { id: 'hardpoint1', name: hardpoints[biomeLevel] || 'Weapon Array', relX: 25, relY: 15, width: 85, height: 45, maxHp: hp1, hp: hp1, destroyed: false, hitTimer: 0 },
                        { id: 'core', name: 'Exposed Bio-Core', relX: 60, relY: 45, width: 75, height: 50, maxHp: hp2, hp: hp2, destroyed: false, hitTimer: 0 }
                    ];
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

                // Update target point mini health bar decay
                for (const tp of this.targetPoints) {
                    if (tp.hitTimer > 0) {
                        tp.hitTimer -= dt;
                    }
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
                    // Accelerate rapidly off the screen
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

            // ─── ATTACK 1: NORMAL THEMATIC ATTACK ───────────────────────────
            attackNormal() {
                playSound('enemy_shoot', { enemyType: this.enemyType });
                const b = biomeLevel;
                const tx = this.x + 10;
                const ty = this.y + 70;

                if (b === 1) {
                    enemyBullets.push(new EnemyBullet(tx, ty - 30, -280, -60));
                    enemyBullets.push(new EnemyBullet(tx, ty, -300, 0, 'missile'));
                    enemyBullets.push(new EnemyBullet(tx, ty + 30, -280, 60));
                } else if (b === 2) {
                    for (let i = -2; i <= 2; i++) {
                        enemyBullets.push(new EnemyBullet(tx, ty, -250, i * 45));
                    }
                } else if (b === 3) {
                    enemyBullets.push(new EnemyBullet(tx, ty - 25, -340, 0));
                    enemyBullets.push(new EnemyBullet(tx, ty, -360, 0, 'missile'));
                    enemyBullets.push(new EnemyBullet(tx, ty + 25, -340, 0));
                } else if (b === 4) {
                    enemyBullets.push(new EnemyBullet(tx, ty - 35, -270, -90));
                    enemyBullets.push(new EnemyBullet(tx, ty, -290, 0));
                    enemyBullets.push(new EnemyBullet(tx, ty + 35, -270, 90));
                } else if (b === 5) {
                    enemyBullets.push(new EnemyBullet(tx, ty - 40, -260, -70, 'missile'));
                    enemyBullets.push(new EnemyBullet(tx, ty + 40, -260, 70, 'missile'));
                    enemyBullets.push(new EnemyBullet(tx, ty, -310, 0));
                } else if (b === 6) {
                    for (let i = -2; i <= 2; i++) {
                        enemyBullets.push(new EnemyBullet(tx, ty, -270, i * 65));
                    }
                } else if (b === 7) {
                    enemyBullets.push(new EnemyBullet(tx, ty - 30, -440, 0));
                    enemyBullets.push(new EnemyBullet(tx, ty, -460, 0));
                    enemyBullets.push(new EnemyBullet(tx, ty + 30, -440, 0));
                } else if (b === 8) {
                    enemyBullets.push(new EnemyBullet(tx, ty - 35, -330, -80));
                    enemyBullets.push(new EnemyBullet(tx, ty, -350, 0, 'missile'));
                    enemyBullets.push(new EnemyBullet(tx, ty + 35, -330, 80));
                } else if (b === 9) {
                    for (let i = -1; i <= 1; i++) {
                        enemyBullets.push(new EnemyBullet(tx, ty, -260, i * 80));
                    }
                } else {
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
                    const upY = this.y + 25;
                    enemyBullets.push(new EnemyBullet(this.x + 20, upY, -290, -90));
                    enemyBullets.push(new EnemyBullet(this.x + 20, upY, (dx/dist) * 310, (dy/dist) * 310));
                } else {
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
                    const count = 16;
                    for (let i = 0; i < count; i++) {
                        const ang = i * (Math.PI * 2 / count) + this.bobTimer;
                        enemyBullets.push(new EnemyBullet(tx, ty, Math.cos(ang) * 260, Math.sin(ang) * 260));
                    }
                } else {
                    for (let o = -60; o <= 60; o += 30) {
                        enemyBullets.push(new EnemyBullet(tx, ty + o, -400, o * 1.5));
                        enemyBullets.push(new EnemyBullet(tx, ty + o, -360, o * 0.8, 'missile'));
                    }
                }
            }

            // ─── INTERACTIVE TARGET POINT HIT RESOLUTION ─────────────────────
            takeDamage(amt, hitX, hitY) {
                if (this.hp <= 0) return;
                this.hp -= amt;
                playSound('hit');

                // Determine which target point was hit based on collision coordinates
                let targetHit = null;
                if (typeof hitX === 'number' && typeof hitY === 'number') {
                    const localX = hitX - this.x;
                    const localY = hitY - this.y;
                    
                    for (const tp of this.targetPoints) {
                        if (!tp.destroyed) {
                            if (localX >= tp.relX - 20 && localX <= tp.relX + tp.width + 20 &&
                                localY >= tp.relY - 20 && localY <= tp.relY + tp.height + 20) {
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
                    targetHit.hitTimer = 2.0; // Display mini health bar for 2 seconds

                    const sparkX = this.x + targetHit.relX + targetHit.width / 2;
                    const sparkY = this.y + targetHit.relY + targetHit.height / 2;
                    createExplosion(sparkX, sparkY, '#ffffff', 4);

                    if (targetHit.hp <= 0 && !targetHit.destroyed) {
                        targetHit.destroyed = true;
                        this.currentStage++;
                        playSound('explosion');

                        for (let k = 0; k < 12; k++) {
                            createExplosion(sparkX + (Math.random() - 0.5) * 40, sparkY + (Math.random() - 0.5) * 40, '#ff3300', 12);
                        }
                        spawnHitFlash(sparkX, sparkY, 'boss_vulnerable');

                        if (typeof floatingTexts !== 'undefined') {
                            floatingTexts.push(new FloatingText(canvas.width / 2, canvas.height / 3, 
                                `${targetHit.name.toUpperCase()} DESTROYED!`, '#ff4757'));
                        }

                        this.state = 'rage';
                        this.stateTimer = 3.2;
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

                        if (typeof AdaptiveDirector !== 'undefined') {
                            const qNode = AdaptiveDirector.getHighYieldNodeDrop(biomeLevel);
                            if (qNode && typeof ScrapDrop !== 'undefined') {
                                scrapDrops.push(new ScrapDrop(this.x + 80, this.y + 60, 'scrap_large', qNode.scrapValue));
                            }
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
                    } else if (biomeLevel >= 10) {
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
                const cx = this.x + this.width / 2;
                const cy = this.y + this.height / 2;
                ctx.translate(cx, cy);

                // Dynamic breathing and mechanical tilt
                const pulseX = 1 + Math.sin(this.bobTimer * 4) * 0.03;
                const pulseY = 1 + Math.cos(this.bobTimer * 4) * 0.03;
                ctx.scale(pulseX, pulseY);

                // Sprite selection
                const currentBiome = (typeof LevelManager !== 'undefined' && LevelManager.biome) ? LevelManager.biome : (typeof biomeLevel !== 'undefined' ? biomeLevel : 1);
                const isMid = this.isMidBoss;
                const exactKey = this.spriteKey || (isMid ? `boss_b${currentBiome}_mid_0` : `boss_b${currentBiome}_0`);
                const spritesDict = (typeof window !== 'undefined' && window.bossSprites) ? window.bossSprites : (typeof bossSprites !== 'undefined' ? bossSprites : {});
                const sprite = spritesDict[exactKey] ||
                               spritesDict[isMid ? `boss_b${currentBiome}_mid_0` : `boss_b${currentBiome}_0`] ||
                               spritesDict[`boss_b${currentBiome}_0`] ||
                               spritesDict[`boss_${(currentBiome - 1) % 4}`] ||
                               spritesDict['boss_0'] ||
                               spritesDict['boss'];

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

                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(-renderW / 2, 0, 35, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
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

