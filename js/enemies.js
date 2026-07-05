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
                this.type = type;
                this.id = ++enemyIdCounter;  // Unique ID for Economy.shouldDrop()
                this.x = canvas.width + 50;
                this.y = 50 + Math.random() * (canvas.height - 100);
                this.width = 30;
                this.height = 30;
                this.age = 0;

                // Determine behavior pattern and map attributes
                this.behaviorPattern = 'scout'; // default fallback
                
                const isScout = type === 'scout' || type.includes('crawler') || type.includes('drone') || type.includes('sprite') || type.includes('wisp') || type.includes('spark') || type.includes('fragment');
                const isInterceptor = type === 'interceptor' || type.includes('interceptor') || type.includes('spitter') || type.includes('wraith') || type.includes('fighter') || type.includes('hawk') || type.includes('aberration');
                const isHeavy = type === 'heavy' || type.includes('heavy') || type.includes('brute') || type.includes('turret') || type.includes('battery') || type.includes('sentinel') || type.includes('golem') || type.includes('giant') || type.includes('node') || type.includes('glacier') || type.includes('thunderhead') || type.includes('shard') || type.includes('swarm') || type.includes('eel');
                
                if (isScout) {
                    this.behaviorPattern = 'scout';
                    this.enemyType = 'grunt';
                    this.speed = 150;
                    this.hp = 1;
                    this.scoreValue = 100;
                    this.color = '#ff5500';
                    this.startY = this.y;
                } else if (isInterceptor) {
                    this.behaviorPattern = 'interceptor';
                    this.enemyType = 'elite';
                    this.speed = 280;
                    this.hp = 1;
                    this.scoreValue = 150;
                    this.color = '#ff0055';
                } else if (isHeavy) {
                    this.behaviorPattern = 'heavy';
                    this.enemyType = 'elite';
                    this.speed = 80;
                    this.hp = 4;
                    this.scoreValue = 300;
                    this.color = '#9a33cc';
                    this.shootCooldown = 1.2 + Math.random() * 0.8;
                    this.shootTimer = this.shootCooldown;
                } else if (type === 'boss_minion') {
                    this.behaviorPattern = 'boss_minion';
                    this.enemyType = 'boss_minion';
                    this.speed = 180;
                    this.hp = 2;
                    this.scoreValue = 50;
                    this.color = '#33cc55';
                } else {
                    this.behaviorPattern = 'scout';
                    this.enemyType = 'grunt';
                    this.speed = 180;
                    this.hp = 2;
                    this.scoreValue = 50;
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
                // Uses mulberry32 seeded RNG: (runSeed * prime + enemyId) for deterministic uniqueness
                const _varRng = mulberry32(runSeed * 31 + this.id);
                this._speedVar = 0.88 + _varRng() * 0.24;       // ±12% speed variance
                const difficultyConfig = getCurrentDifficultyConfig();
                this.hp = Math.max(1, Math.ceil(this.hp * difficultyConfig.enemyHpMultiplier));
                this.speed = Math.round(this.speed * this._speedVar * difficultyConfig.enemySpeedMultiplier);
                if (this.shootCooldown) {
                    this.shootCooldown = this.shootCooldown / difficultyConfig.enemyFireRateMultiplier;
                    this.shootTimer = Math.min(this.shootTimer || this.shootCooldown, this.shootCooldown);
                }
                this._moveVariant = Math.floor(_varRng() * 3);   // 0-2 movement pattern
                this._bulletAngleShift = (_varRng() - 0.5) * 0.10; // ±5% bullet angle shift (radians)
            }

            update(dt) {
                this.age += dt;

                if (this.behaviorPattern === 'scout') {
                    this.x -= this.speed * dt;
                    // GRO-1006: path variant — 3 different sine patterns
                    const _freq = [4.5, 5.0, 6.0][this._moveVariant];
                    const _amp = [55, 60, 70][this._moveVariant];
                    this.y = this.startY + Math.sin(this.age * _freq) * _amp;
                } else if (this.behaviorPattern === 'interceptor') {
                    this.x -= this.speed * dt;
                    // GRO-1006: interceptor gets subtle y-drift on variants 1-2
                    if (this._moveVariant > 0) {
                        this.y += Math.sin(this.age * (3 + this._moveVariant)) * 25 * dt;
                    }
                } else if (this.behaviorPattern === 'heavy') {
                    this.x -= this.speed * dt;
                    this.shootTimer -= dt;
                    if (this.shootTimer <= 0) {
                        this.shoot();
                        this.shootTimer = this.shootCooldown;
                    }
                } else if (this.behaviorPattern === 'boss_minion') {
                    this.x -= this.speed * dt;
                    this.y += Math.sin(this.age * 8) * 80 * dt;
                }
            }

            shoot() {
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const bulletSpeed = -220;

                // GRO-1006: apply per-enemy bullet angle shift
                const _shiftedDy = (dy/dist) + this._bulletAngleShift;

                playSound('enemy_shoot', {enemyType: this.type});
                enemyBullets.push(new EnemyBullet(this.x, this.y + this.height/2, bulletSpeed, _shiftedDy * 100));
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);

                const sprite = enemySprites[this.type] || enemySprites[this.behaviorPattern];
                const isImage = sprite && sprite.tagName !== 'CANVAS' && sprite.complete && sprite.naturalWidth > 0;
                const isCanvas = sprite && sprite.tagName === 'CANVAS' && sprite.width > 0;
                const hasSprite = isImage || isCanvas;

                if (hasSprite) {
                    // Map each type to appropriate render size (sprites are 1024x1024)
                    const sizes = { scout: 36, interceptor: 36, heavy: 44, boss_minion: 32 };
                    const size = sizes[this.behaviorPattern] || 36;
                    
                    if (this.isParadox) {
                        ctx.shadowBlur = 12;
                        ctx.shadowColor = this.paradoxColor;
                    }
                    // Use additive only for non-pre-composited images (fallback)
                    if (isImage) {
                        ctx.globalCompositeOperation = 'lighter';
                    }
                    // Use drawSpriteFrame to properly slice from 1024x1024 sheet
                    drawSpriteFrame(ctx, sprite, 0, 0, SPRITE_FRAME, SPRITE_FRAME, 0, 0, size, size);
                    if (isImage) {
                        ctx.globalCompositeOperation = 'source-over';
                    }
                } else {
                    // Fallback: colored shapes if sprite not loaded
                    ctx.fillStyle = this.isParadox ? this.paradoxColor : this.color;
                    if (this.behaviorPattern === 'scout') {
                        ctx.beginPath();
                        ctx.moveTo(30, 15); ctx.lineTo(10, 0); ctx.lineTo(0, 15); ctx.lineTo(10, 30);
                        ctx.closePath(); ctx.fill();
                    } else if (this.behaviorPattern === 'interceptor') {
                        ctx.beginPath();
                        ctx.moveTo(30, 15); ctx.lineTo(0, 5); ctx.lineTo(10, 15); ctx.lineTo(0, 25);
                        ctx.closePath(); ctx.fill();
                    } else if (this.behaviorPattern === 'heavy') {
                        ctx.beginPath();
                        ctx.moveTo(30, 5); ctx.lineTo(10, 0); ctx.lineTo(0, 15); ctx.lineTo(10, 30);
                        ctx.lineTo(30, 25); ctx.lineTo(20, 15);
                        ctx.closePath(); ctx.fill();
                    } else if (this.behaviorPattern === 'boss_minion') {
                        ctx.beginPath();
                        ctx.arc(15, 15, 14, 0, Math.PI * 2); ctx.fill();
                    }
                }

                // If Paradox, draw name text above
                if (this.isParadox) {
                    ctx.fillStyle = this.paradoxColor;
                    ctx.font = 'bold 9px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(this.paradoxName, 15, -6);
                }
                
                // GRO-1068: Debug labels — show enemy type for playtesting identification
                if (window.DEBUG_LABELS) {
                    ctx.fillStyle = 'rgba(255,255,255,0.75)';
                    ctx.font = '8px monospace';
                    ctx.textAlign = 'center';
                    const label = this.type + (this.enemyType ? '/' + this.enemyType : '');
                    // Draw text with dark outline for readability on any background
                    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
                    ctx.lineWidth = 2;
                    ctx.strokeText(label, 15, -6);
                    ctx.fillText(label, 15, -6);
                }

                ctx.restore();
            }
        }

        // --- Boss Fighter Class (Cyber Coelacanth) ---
        class Boss {
            constructor() {
                this.id = ++enemyIdCounter;  // Unique ID for Economy.shouldDrop()
                this.enemyType = 'boss';     // Economy scrapDropTable key
                this.x = canvas.width + 100;
                this.y = canvas.height / 2 - 80;
                this.width = 180;
                this.height = 140;
                const difficultyConfig = getCurrentDifficultyConfig();
                this.hpMax = Math.round(120 * difficultyConfig.bossHpMultiplier);
                this.hp = this.hpMax;
                this.state = 'intro';
                this.stateTimer = 2;
                this.bobTimer = 0;
                this.shootTimer = 1.0 / difficultyConfig.enemyFireRateMultiplier;
                this.laserWarningTimer = 0;
                this.color = '#305080';
                this.shieldColor = '#ff00aa';
                this.architectPhase = null; // GRO-1009: 'sacrifice'|'transcendence'|'dominion' — set at low HP
                this._victoryTimeout = null;
                this._advanceTimeout = null;
                this._explosionTimers = [];
            }

            cleanup() {
                // Clear all pending timeouts to prevent ghost callbacks after boss destruction
                if (this._victoryTimeout) { clearTimeout(this._victoryTimeout); this._victoryTimeout = null; }
                if (this._advanceTimeout) { clearTimeout(this._advanceTimeout); this._advanceTimeout = null; }
                this._explosionTimers.forEach(t => clearTimeout(t));
                this._explosionTimers = [];
            }

            update(dt) {
                this.bobTimer += dt;

                if (this.state === 'intro') {
                    this.x -= 40 * dt;
                    if (this.x <= canvas.width - 210) {
                        this.x = canvas.width - 210;
                        this.state = 'idle';
                        this.stateTimer = 3;
                    }
                    return;
                }

                this.y += Math.sin(this.bobTimer * 2) * 20 * dt;

                this.stateTimer -= dt;
                if (this.stateTimer <= 0) {
                    // Economy-based scrap drops on boss state transition
                    if (typeof scrapDrops !== 'undefined' && window.Economy && Economy.shouldDrop(this.id, this.enemyType)) {
                        const tx = this.x + 30;
                        const ty = this.y + 60;
                        const drop = Economy.rollDrop(this.enemyType, biomeLevel);
                        const ecoDrop = Economy.createDrop(tx, ty, drop.type, drop.amount);
                        scrapDrops.push(new ScrapDrop(ecoDrop.x, ecoDrop.y, ecoDrop.type, drop.amount));
                    }

                    if (this.state === 'idle') {
                        // GRO-1009: Architect final phase — set dominant theme at 25% HP
                        if (this.hp < this.hpMax * 0.25 && !this.architectPhase) {
                            const flags = narrativeFlags;
                            // Determine which theme dominates for the final phase
                            if (flags.sacrifice_seen >= 1 && flags.lyra_trust >= 2) {
                                this.architectPhase = 'sacrifice';
                            } else if (flags.dreamer_connection >= 2) {
                                this.architectPhase = 'transcendence';
                            } else if (flags.power_lust >= 2) {
                                this.architectPhase = 'dominion';
                            } else {
                                this.architectPhase = 'transcendence'; // default
                            }
                            this.state = 'architect_final';
                            this.stateTimer = 999; // Stay in final phase until death
                            playSound('victory_fanfare');
                        } else if (this.hp < this.hpMax / 2 && Math.random() > 0.4) {
                            this.state = 'laser_charge';
                            this.stateTimer = 1.5;
                            playSound('laser_charge');
                        } else {
                            this.state = 'rage';
                            this.stateTimer = 4;
                        }
                    } else if (this.state === 'architect_final') {
                        // Architect final phase: relentless attacks, no exit until death
                        this.stateTimer = 999; // persist
                    } else if (this.state === 'rage') {
                        this.state = 'idle';
                        this.stateTimer = 3;
                    } else if (this.state === 'laser_charge') {
                        this.state = 'laser_fire';
                        this.stateTimer = 1.8;
                        playSound('laser_fire');
                    } else if (this.state === 'laser_fire') {
                        this.state = 'idle';
                        this.stateTimer = 3;
                    }
                }

                this.shootTimer -= dt;
                if (this.shootTimer <= 0) {
                    this.shootAttack();
                    this.shootTimer = this.state === 'rage' ? 0.3 : 0.75;
                }

                if (this.state === 'laser_charge') {
                    createExplosion(this.x + 15, this.y + 70, '#00ffff', 3);
                }
            }

            shootAttack() {
                playSound('enemy_shoot', {enemyType: this.enemyType});
                if (this.state === 'architect_final') {
                    // GRO-1009: Architect final phase — unique attack per ending theme
                    const phase = this.architectPhase;
                    if (phase === 'sacrifice') {
                        // SACRIFICE: Converging energy rings — Lyra's resonance
                        for (let a = 0; a < 8; a++) {
                            const angle = (a / 8) * Math.PI * 2 + this.bobTimer;
                            enemyBullets.push(new EnemyBullet(this.x + 90, this.y + 70, Math.cos(angle) * 180, Math.sin(angle) * 180));
                        }
                    } else if (phase === 'transcendence') {
                        // TRANSCENDENCE: Spiral wave of light — dreamer ascension
                        for (let a = 0; a < 5; a++) {
                            const angle = (a / 5) * Math.PI * 2 + this.bobTimer * 3;
                            enemyBullets.push(new EnemyBullet(this.x + 90, this.y + 70, Math.cos(angle) * 220, Math.sin(angle) * 220));
                        }
                        // Plus homing shot toward player
                        const dx = player.x - (this.x + 90);
                        const dy = player.y - (this.y + 70);
                        const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                        enemyBullets.push(new EnemyBullet(this.x + 90, this.y + 70, (dx/dist) * 300, (dy/dist) * 300));
                    } else {
                        // DOMINION: Overwhelming firepower — seize control
                        for (let r = 0; r < 3; r++) {
                            const spread = (r - 1) * 0.4;
                            enemyBullets.push(new EnemyBullet(this.x + 90, this.y + 70, -300, -100 + spread * 100));
                            enemyBullets.push(new EnemyBullet(this.x + 90, this.y + 70, -300, 100 + spread * 100));
                        }
                    }
                } else if (this.state === 'idle') {
                    enemyBullets.push(new EnemyBullet(this.x + 10, this.y + 50, -260, -80));
                    enemyBullets.push(new EnemyBullet(this.x + 10, this.y + 70, -280, 0, 'missile'));
                    enemyBullets.push(new EnemyBullet(this.x + 10, this.y + 90, -260, 80));
                    const difficultyConfig = getCurrentDifficultyConfig();
                    if (difficultyConfig.id === 'hard' || difficultyConfig.id === 'insane') {
                        enemyBullets.push(new EnemyBullet(this.x + 30, this.y + 40, -300, -130));
                        enemyBullets.push(new EnemyBullet(this.x + 30, this.y + 100, -300, 130));
                    }
                    if (difficultyConfig.id === 'insane') {
                        const dy = player.y - (this.y + 70);
                        const dx = player.x - (this.x + 20);
                        const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                        enemyBullets.push(new EnemyBullet(this.x + 20, this.y + 70, (dx/dist) * 360, (dy/dist) * 360));
                    }
                } else if (this.state === 'rage') {
                    const dy = player.y - (this.y + 70);
                    const dx = player.x - (this.x + 10);
                    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                    enemyBullets.push(new EnemyBullet(this.x + 10, this.y + 70, (dx/dist) * 320, (dy/dist) * 320, 'missile'));

                    const difficultyConfig = getCurrentDifficultyConfig();
                    const minionChance = difficultyConfig.id === 'insane' ? 0.45 : (difficultyConfig.id === 'hard' ? 0.35 : 0.25);
                    const minionCap = difficultyConfig.id === 'insane' ? 8 : (difficultyConfig.id === 'hard' ? 6 : 5);
                    if (Math.random() < minionChance && enemies.length < minionCap) {
                        enemies.push(new Enemy('boss_minion'));
                    }
                } else if (this.state === 'laser_fire') {
                    enemyBullets.push(new EnemyBullet(this.x + 40, this.y + 20, -180, -150));
                    enemyBullets.push(new EnemyBullet(this.x + 40, this.y + 110, -180, 150));
                }
            }

            takeDamage(amt) {
                if (this.hp <= 0) return;
                this.hp -= amt;
                playSound('hit');
                createExplosion(this.x + Math.random()*120, this.y + Math.random()*100, '#ffffff', 5);
                // Spawn hit-flash (§6.2) — boss gets 'boss_armored' or 'boss_vulnerable'
                const flashType = this.hp > this.hpMax * 0.5 ? 'boss_armored' : 'boss_vulnerable';
                spawnHitFlash(this.x + this.width/2, this.y + this.height/2, flashType);

                if (this.hp <= 0) {
                    this.hp = 0;
                    bossDefeated = true;
                    
                    // GRO-1187: Story trigger — boss defeated
                    if (typeof StoryTriggers !== 'undefined') {
                        StoryTriggers.onBossKill(biomeLevel, false);
                    }
                    
                    // GRO-1009: Determine ending only on final boss (biome 10)
                    if (biomeLevel >= 10) {
                        _winTransition = true; // Victory flag — triggers game won screen
                        determineEnding();
                        
                        // GRO-1187: Story trigger — all bosses defeated
                        if (typeof StoryTriggers !== 'undefined') {
                            StoryTriggers.onAllBossesDefeated();
                        }
                        
                        if (!selectedEnding && endingEligible.length > 0) {
                            selectedEnding = this.architectPhase && endingEligible.includes(this.architectPhase)
                                ? this.architectPhase : endingEligible[0];
                        }
                        if (!selectedEnding) selectedEnding = 'transcendence';
                        
                        // Save NG+ eligibility
                        try {
                            const ngKey = 'darius_star_ngplus_eligible';
                            const eligible = JSON.parse(localStorage.getItem(ngKey) || '{}');
                            eligible[selectedShip] = { 
                                biome: biomeLevel, 
                                score: score, 
                                scrap: runScrap, 
                                date: new Date().toISOString(),
                                ngLevel: typeof currentNGLevel !== 'undefined' ? currentNGLevel : 0
                            };
                            localStorage.setItem(ngKey, JSON.stringify(eligible));
                        } catch(e) {}
                    }
                    
                    playSound('explosion');
                    
                    // Spawn Economy-based Data Fragments on Boss defeat!
                    if (typeof scrapDrops !== 'undefined' && window.Economy) {
                        const bossDropCount = getCurrentDifficultyConfig().id === 'insane' ? 0 : 5;
                        for (let k = 0; k < bossDropCount; k++) {
                            const drop = Economy.rollDrop(this.enemyType, biomeLevel);
                            const ecoDrop = Economy.createDrop(
                                this.x + 50 + (Math.random()-0.5)*50,
                                this.y + 60 + (Math.random()-0.5)*50,
                                drop.type, drop.amount
                            );
                            scrapDrops.push(new ScrapDrop(ecoDrop.x, ecoDrop.y, ecoDrop.type, drop.amount));
                        }
                    }

                    for (let i = 0; i < 35; i++) {
                        this._explosionTimers.push(setTimeout(() => {
                            createExplosion(this.x + Math.random()*150, this.y + Math.random()*120, '#ff3300', 15);
                            playSound('explosion');
                        }, i * 100));
                    }
                    
                    if (biomeLevel >= 10) {
                        // Final boss — victory cinematic
                        if (typeof saveTotalScrapOnBiomeCompletion === 'function') {
                            saveTotalScrapOnBiomeCompletion();
                        }
                        if (this._victoryTimeout) clearTimeout(this._victoryTimeout);
                        this._victoryTimeout = setTimeout(() => { playVictoryCinematic(); }, 3500);
                    } else {
                        // Biome clear — advance to next biome after explosions
                        if (this._advanceTimeout) clearTimeout(this._advanceTimeout);
                        this._advanceTimeout = setTimeout(() => { advanceToNextBiome(); }, 3000);
                    }
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);

                // --- Sprite-based boss rendering ---
                // boss_0.png is 1280x896; render scaled to 190x133 (matching original boss footprint)
                let spriteKey = 'boss';
                if (this.hp <= 0) {
                    spriteKey = 'boss_death';
                } else if (this.state === 'intro' || this.state === 'idle') {
                    spriteKey = 'boss_idle';
                } else if (this.state === 'rage' || this.state === 'architect_final') {
                    spriteKey = 'boss_rage';
                } else if (this.state === 'laser_charge') {
                    spriteKey = 'boss_laser_charge';
                } else if (this.state === 'laser_fire') {
                    spriteKey = 'boss_laser_fire';
                }

                let sprite = bossSprites[spriteKey] || bossSprites['boss'];
                const checkSprite = (s) => {
                    if (!s) return false;
                    if (s.tagName === 'CANVAS') return s.width > 0;
                    return s.complete && s.naturalWidth > 0;
                };
                let hasSprite = checkSprite(sprite);
                if (!hasSprite) {
                    sprite = bossSprites['boss'];
                    hasSprite = checkSprite(sprite);
                }
                const renderW = 190;
                const renderH = 133;

                if (hasSprite) {
                    // State-based visual effects applied on top of the sprite
                    if (this.state === 'laser_charge') {
                        // Cyan charge glow pulsing around the sprite
                        ctx.shadowColor = '#00ffff';
                        ctx.shadowBlur = 15 + Math.sin(this.bobTimer * 8) * 8;
                    }
                    if (this.state === 'rage') {
                        // Red rage tint overlay via global composite
                        drawSpriteFrame(ctx, sprite, 0, 0, BOSS_FRAME, BOSS_FRAME, 0, 0, renderW, renderH);
                        ctx.globalCompositeOperation = 'source-atop';
                        ctx.fillStyle = 'rgba(255, 0, 30, 0.25)';
                        ctx.fillRect(0, 0, renderW, renderH);
                        ctx.globalCompositeOperation = 'source-over';
                    } else if (this.state === 'architect_final') {
                        // GRO-1009: Architect final phase — ending-specific boss aura
                        drawSpriteFrame(ctx, sprite, 0, 0, BOSS_FRAME, BOSS_FRAME, 0, 0, renderW, renderH);
                        const phase = this.architectPhase;
                        const pulse = Math.sin(this.bobTimer * 6) * 0.5 + 0.5;
                        if (phase === 'sacrifice') {
                            ctx.shadowColor = '#00ffff';
                            ctx.shadowBlur = 20 + pulse * 15;
                            ctx.globalCompositeOperation = 'source-atop';
                            ctx.fillStyle = `rgba(0, 255, 255, ${0.15 + pulse * 0.1})`;
                            ctx.fillRect(0, 0, renderW, renderH);
                            ctx.globalCompositeOperation = 'source-over';
                        } else if (phase === 'transcendence') {
                            ctx.shadowColor = '#ff00ff';
                            ctx.shadowBlur = 25 + pulse * 20;
                            ctx.globalCompositeOperation = 'source-atop';
                            ctx.fillStyle = `rgba(255, 0, 255, ${0.12 + pulse * 0.08})`;
                            ctx.fillRect(0, 0, renderW, renderH);
                            ctx.globalCompositeOperation = 'source-over';
                        } else {
                            ctx.shadowColor = '#ff3300';
                            ctx.shadowBlur = 18 + pulse * 22;
                            ctx.globalCompositeOperation = 'source-atop';
                            ctx.fillStyle = `rgba(255, 50, 0, ${0.2 + pulse * 0.15})`;
                            ctx.fillRect(0, 0, renderW, renderH);
                            ctx.globalCompositeOperation = 'source-over';
                        }
                    } else if (this.state === 'intro') {
                        // Intro: fade in from the right edge
                        const introProgress = Math.min(1, (canvas.width - 210 - this.x) / 100 + 1);
                        ctx.globalAlpha = Math.min(1, introProgress);
                        drawSpriteFrame(ctx, sprite, 0, 0, BOSS_FRAME, BOSS_FRAME, 0, 0, renderW, renderH);
                        ctx.globalAlpha = 1;
                    } else {
                        drawSpriteFrame(ctx, sprite, 0, 0, BOSS_FRAME, BOSS_FRAME, 0, 0, renderW, renderH);
                    }
                    ctx.shadowBlur = 0;
                } else {
                    // --- Fallback: original canvas-drawn boss (kept for graceful degradation) ---
                    // Tail fin
                    ctx.fillStyle = '#ff3366';
                    ctx.beginPath();
                    ctx.moveTo(140, 70);
                    ctx.lineTo(190, 20);
                    ctx.lineTo(165, 70);
                    ctx.lineTo(190, 120);
                    ctx.closePath();
                    ctx.fill();

                    // Top spines
                    ctx.fillStyle = '#ff3366';
                    for (let i = 0; i < 3; i++) {
                        ctx.beginPath();
                        ctx.moveTo(40 + i*30, 25);
                        ctx.lineTo(65 + i*30, -15);
                        ctx.lineTo(80 + i*30, 25);
                        ctx.closePath();
                        ctx.fill();
                    }

                    // Bottom spines
                    for (let i = 0; i < 2; i++) {
                        ctx.beginPath();
                        ctx.moveTo(60 + i*40, 115);
                        ctx.lineTo(80 + i*40, 145);
                        ctx.lineTo(95 + i*40, 115);
                        ctx.closePath();
                        ctx.fill();
                    }

                    // Main body
                    ctx.fillStyle = this.color;
                    ctx.fillRect(30, 25, 120, 90);

                    // Armor plates
                    for (let col = 0; col < 4; col++) {
                        for (let row = 0; row < 3; row++) {
                            ctx.fillStyle = (col + row) % 2 === 0 ? '#406090' : '#284068';
                            ctx.fillRect(35 + col*28, 30 + row*26, 25, 22);
                        }
                    }

                    // Head / cockpit
                    ctx.fillStyle = '#1e2d42';
                    ctx.beginPath();
                    ctx.moveTo(40, 25);
                    ctx.lineTo(10, 40);
                    ctx.lineTo(0, 70);
                    ctx.lineTo(15, 95);
                    ctx.lineTo(40, 115);
                    ctx.lineTo(45, 25);
                    ctx.closePath();
                    ctx.fill();

                    // Eye
                    ctx.fillStyle = this.state === 'rage' ? '#ff0000' : '#00ffcc';
                    ctx.beginPath();
                    ctx.arc(28, 50, 6, 0, Math.PI*2);
                    ctx.fill();

                    // Vent
                    ctx.fillStyle = '#ff7700';
                    ctx.fillRect(-2, 60, 10, 20);

                    // Rage glow border
                    if (this.state === 'rage') {
                        ctx.strokeStyle = '#ff0055';
                        ctx.lineWidth = 3 + Math.sin(this.bobTimer * 10) * 2;
                        ctx.strokeRect(30, 25, 120, 90);
                    }
                }

                // --- Laser beam overlay (always drawn, independent of sprite/fallback) ---
                if (this.state === 'laser_fire') {
                    ctx.shadowColor = '#00ffff';
                    ctx.shadowBlur = 25;
                    const bGrd = ctx.createLinearGradient(0, 50, 0, 90);
                    bGrd.addColorStop(0, 'rgba(0, 255, 255, 0.2)');
                    bGrd.addColorStop(0.4, '#ffffff');
                    bGrd.addColorStop(0.5, '#00ffff');
                    bGrd.addColorStop(0.6, '#ffffff');
                    bGrd.addColorStop(1, 'rgba(0, 255, 255, 0.2)');
                    ctx.fillStyle = bGrd;

                    // Beam starts at 10px high at mouth (y: 65-75), expanding to 40px (y: 50-90) over first 100px
                    const endX = -this.x;
                    const transX = Math.max(-this.x, -100);
                    ctx.beginPath();
                    ctx.moveTo(0, 65);
                    ctx.lineTo(transX, 50);
                    ctx.lineTo(endX, 50);
                    ctx.lineTo(endX, 90);
                    ctx.lineTo(transX, 90);
                    ctx.lineTo(0, 75);
                    ctx.closePath();
                    ctx.fill();

                    // Concentrated muzzle flash at origin (0, 70)
                    const muzzleGrd = ctx.createRadialGradient(0, 70, 0, 0, 70, 30);
                    muzzleGrd.addColorStop(0, '#ffffff');
                    muzzleGrd.addColorStop(0.3, '#ffffff');
                    muzzleGrd.addColorStop(0.7, 'rgba(0, 255, 255, 0.8)');
                    muzzleGrd.addColorStop(1, 'rgba(0, 255, 255, 0)');
                    ctx.fillStyle = muzzleGrd;
                    ctx.beginPath();
                    ctx.arc(0, 70, 30, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.shadowBlur = 0;
                }

                // --- Rage glow overlay (when using sprite, draw pulsating border) ---
                if (hasSprite && this.state === 'rage') {
                    ctx.strokeStyle = '#ff0055';
                    ctx.lineWidth = 3 + Math.sin(this.bobTimer * 10) * 2;
                    ctx.strokeRect(0, 0, renderW, renderH);
                }

                ctx.restore();
            }
        }

// --- Window bindings for explicit global scope ---
window.EnemyBullet = EnemyBullet;
window.Enemy = Enemy;
window.Boss = Boss;
