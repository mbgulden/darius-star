// --- Player Ship Class ---
class Player {
    constructor(shipType = 'interceptor', playerId = 1) {
        this.x = 80;
        this.y = canvas.height / 2;
        this.playerId = playerId;
        // Per-player input binding — each player uses their own keys
        this.inputKeys = {
            1: { up:'w', down:'s', left:'a', right:'d', fire:' ', special:'k', dodge:'e', boost:'Shift' },
            2: { up:'ArrowUp', down:'ArrowDown', left:'ArrowLeft', right:'ArrowRight', fire:'0', special:'1', dodge:'2', boost:'Enter' },
            3: { up:'Gamepad1U', down:'Gamepad1D', left:'Gamepad1L', right:'Gamepad1R', fire:'Gamepad1A', special:'Gamepad1B', dodge:'Gamepad1X', boost:'Gamepad1L' },
            4: { up:'Gamepad2U', down:'Gamepad2D', left:'Gamepad2L', right:'Gamepad2R', fire:'Gamepad2A', special:'Gamepad2B', dodge:'Gamepad2X', boost:'Gamepad2L' },
        }[playerId];
        this.width = 40;
        this.height = 20;
        this.shipType = shipType;
        
        // Set stats based on ship model type
        if (shipType === 'phantom' || shipType === 'scout') {
            this.speed = 290;
            this.shieldMax = 60;
            this.color = '#00ffaa';
            this.shootCooldown = 0.06;
        } else if (shipType === 'bastion' || shipType === 'heavy') {
            this.speed = 140;
            this.shieldMax = 200;
            this.color = '#ffcc00';
            this.shootCooldown = 0.35;
        } else if (shipType === 'tempest') {
            this.speed = 200;
            this.shieldMax = 80;
            this.color = '#ff0055';
            this.shootCooldown = 0.22;
        } else if (shipType === 'specter') {
            this.speed = 230;
            this.shieldMax = 70;
            this.color = '#b026ff';
            this.shootCooldown = 0.25;
        } else if (shipType === 'warden') {
            this.speed = 160;
            this.shieldMax = 180;
            this.color = '#ff6600';
            this.shootCooldown = 0.16;
            this.wardenShieldDomeHP = 0; // Special dome health
        } else { // striker or interceptor (default)
            this.speed = 220;
            this.shieldMax = 100;
            this.color = '#00ffff';
            this.shootCooldown = 0.15;
        }
        
        // Adjust base stats based on difficulty level
        if (difficulty === 'easy') {
            this.shieldMax += 30;
            this.weaponLevel = 2;
        } else if (difficulty === 'hard') {
            this.shieldMax = Math.round(this.shieldMax * 0.8);
            this.weaponLevel = 1;
        } else {
            this.weaponLevel = 1;
        }
        
        // Apply permanent upgrades from window.DS_UpgradeSystem
        const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
        if (mods) {
            // Weapons
            this.shootCooldown = this.shootCooldown / mods.weaponFireRateMultiplier;
            
            // Shields
            this.shieldMax += mods.shieldMaxHPBonus;
            
            // Engines
            this.speed = this.speed * mods.engineSpeedMultiplier;
            
            // Boost State
            this.boostFuel = 3.0 * mods.engineBoostDurationMultiplier;
            this.boostMaxFuel = 3.0 * mods.engineBoostDurationMultiplier;
            this.boostCooldown = 0;
            this.isBoosting = false;
            
            // Special State
            this.specialCooldown = 0;
            this.specialMaxCooldown = 15.0 * mods.specialCooldownMultiplier;
            this.specialActiveTimer = 0;
            this.specialMaxDuration = 4.0 + mods.specialDurationBonus;
            this.isSpecialActive = false;

            // Dodge/Evade State
            this.dodgeCooldown = 0;
            this.dodgeMaxCooldown = 3.5 * (mods.engineBoostCooldownMultiplier || 1.0);
            this.dodgeDistance = 90;
            this.isDodging = false;
            this.dodgeInvulnTimer = 0;
            this.dodgeMaxInvuln = 0.25;
        } else {
            this.boostFuel = 3.0;
            this.boostMaxFuel = 3.0;
            this.boostCooldown = 0;
            this.isBoosting = false;
            this.specialCooldown = 0;
            this.specialMaxCooldown = 15.0;
            this.specialActiveTimer = 0;
            this.specialMaxDuration = 4.0;
            this.isSpecialActive = false;

            // Dodge/Evade State
            this.dodgeCooldown = 0;
            this.dodgeMaxCooldown = 3.5;
            this.dodgeDistance = 90;
            this.isDodging = false;
            this.dodgeInvulnTimer = 0;
            this.dodgeMaxInvuln = 0.25;
        }
        
        this.shield = this.shieldMax;
        this.shootTimer = 0;
        this.invulnerable = 0;
        
        // GRO-1003: Pull-out system — replaces death
        this.isPulledOut = false;       // Ship disabled, auto-repairing
        this.pullOutTimer = 0;          // Seconds until auto-repair completes
        this.pullOutReturnInvuln = 0;   // 3s invulnerability after return
    }

    update(dt) {
        // GRO-1003: Pull-out system — disable during repair, auto-return
        if (this.isPulledOut) {
            if (this.pullOutTimer > 0) {
                this.pullOutTimer -= dt;
                // Drift slowly during pull-out (disabled, not totally frozen)
                this.x -= 30 * dt; // Drift left as if recoiling
                this.y += Math.sin(this.pullOutTimer * 3) * 20 * dt; // Gentle bob
                return; // No input, no shooting, no abilities while pulled out
            }
            // Auto-repair complete: return to battle
            this.isPulledOut = false;
            this.shield = this.shieldMax;
            this.pullOutReturnInvuln = 3.0; // 3s invulnerability on return
            this.invulnerable = Math.max(this.invulnerable, 3.0);
            playSound('powerup');
            createExplosion(this.x + this.width/2, this.y + this.height/2, '#00ff88', 20);
            // Return flash text
            floatingTexts.push({ text: 'REPAIRED', x: this.x + this.width/2, y: this.y - 30, life: 2.0, color: '#00ff88' });
        }
        
        if (this.invulnerable > 0) {
            this.invulnerable -= dt;
        }

        let dx = 0;
        let dy = 0;
        if (keys[this.inputKeys.up]) dy -= 1;
        if (keys[this.inputKeys.down]) dy += 1;
        if (keys[this.inputKeys.left]) dx -= 1;
        if (keys[this.inputKeys.right]) dx += 1;

        if (dx !== 0 && dy !== 0) {
            dx *= 0.7071;
            dy *= 0.7071;
        }

        let currentSpeed = this.speed;

        // Apply permanent upgrades modifiers in update loop
        const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
        if (mods) {
            // Shield Passive Regeneration
            this.shield = Math.min(this.shieldMax, this.shield + mods.shieldRegenRate * dt);
            
            // Engine Afterburner Boost
            const canBoost = keys[this.inputKeys.boost] && this.boostCooldown <= 0 && this.boostFuel > 0;
            if (canBoost) {
                this.isBoosting = true;
                this.boostFuel -= dt;
                currentSpeed *= 1.5; // +50% speed burst
                
                // Spawn boost exhaust particles (trail)
                if (Math.random() < 0.4) {
                    let trailColor;
                    if (this.shipType === 'warden') {
                        trailColor = '#ff6600';
                    } else {
                        trailColor = mods.cosmetics.thrusterTrail === 'default' ? '#00ffff' : getTrailColorValue(mods.cosmetics.thrusterTrail);
                    }
                    particles.push(new Particle(
                        this.x, 
                        this.y + this.height/2 + (Math.random()-0.5)*10, 
                        trailColor
                    ));
                }
                
                if (this.boostFuel <= 0) {
                    this.boostFuel = 0;
                    this.isBoosting = false;
                    this.boostCooldown = 8.0 * mods.engineBoostCooldownMultiplier;
                }
            } else {
                this.isBoosting = false;
                if (this.boostCooldown > 0) {
                    this.boostCooldown -= dt;
                } else if (this.boostFuel < this.boostMaxFuel) {
                    this.boostFuel = Math.min(this.boostMaxFuel, this.boostFuel + dt * 0.7);
                }
            }
            
            // Cyber Overload / Guardian Protocol Special Ability
            const canSpecial = keys[this.inputKeys.special] && this.specialCooldown <= 0 && !this.isSpecialActive;
            if (canSpecial) {
                this.isSpecialActive = true;
                this.specialActiveTimer = this.specialMaxDuration;
                playSound('powerup');
                createExplosion(this.x + this.width/2, this.y + this.height/2, this.color, 15);
                
                if (this.shipType === 'warden') {
                    const spRank = window.DS_UpgradeSystem ? (window.DS_UpgradeSystem.state.upgrades.specials || 0) : 0;
                    this.wardenShieldDomeHP = 500 + (spRank >= 5 ? 300 : 0); // 800 if upgraded
                }
            }
            
            if (this.isSpecialActive) {
                this.specialActiveTimer -= dt;
                if (this.specialActiveTimer <= 0) {
                    this.isSpecialActive = false;
                    this.specialCooldown = this.specialMaxCooldown;
                }
            } else if (this.specialCooldown > 0) {
                this.specialCooldown -= dt;
            }

            // Add normal thruster trail
            if (!this.isBoosting && Math.random() < 0.15) {
                let trailColor;
                if (this.shipType === 'warden') {
                    trailColor = '#ff3300';
                } else {
                    trailColor = mods.cosmetics.thrusterTrail === 'default' ? '#ff7700' : getTrailColorValue(mods.cosmetics.thrusterTrail);
                }
                particles.push(new Particle(
                    this.x, 
                    this.y + this.height/2 + (Math.random()-0.5)*6, 
                    trailColor
                ));
            }
        } else {
            // Normal thruster trail fallback
            if (Math.random() < 0.15) {
                particles.push(new Particle(
                    this.x, 
                    this.y + this.height/2 + (Math.random()-0.5)*6, 
                    '#ff7700'
                ));
            }
        }

        this.x += dx * currentSpeed * dt;
        this.y += dy * currentSpeed * dt;

        if (this.x < 10) this.x = 10;
        if (this.x > canvas.width - this.width - 10) this.x = canvas.width - this.width - 10;
        if (this.y < 10) this.y = 10;
        if (this.y > canvas.height - this.height - 10) this.y = canvas.height - this.height - 10;

        // --- Dodge/Evade ---
        // Update dodge invulnerability timer
        if (this.dodgeInvulnTimer > 0) {
            this.dodgeInvulnTimer -= dt;
        }
        // Update dodge cooldown
        if (this.dodgeCooldown > 0) {
            this.dodgeCooldown -= dt;
        }
        // Execute dodge on E key press
        const canDodge = keys[this.inputKeys.dodge] && this.dodgeCooldown <= 0 && !this.isDodging;
        if (canDodge) {
            this.dodge();
        }

        // Warden Point Defense Grid
        if (this.shipType === 'warden') {
            if (!this.pdgTimer) this.pdgTimer = 0;
            this.pdgTimer -= dt;
            if (this.pdgTimer <= 0) {
                const pdgRange = 150 * (mods ? mods.wardenPDGRangeMultiplier : 1.0);
                let target = null;
                let minDist = pdgRange;
                for (let bullet of enemyBullets) {
                    const dist = Math.hypot(bullet.x - (this.x + this.width/2), bullet.y - (this.y + this.height/2));
                    if (dist < minDist) {
                        minDist = dist;
                        target = { type: 'bullet', obj: bullet };
                    }
                }
                if (!target) {
                    for (let enemy of enemies) {
                        if (enemy.hp && enemy.hp <= 30) {
                            const dist = Math.hypot(enemy.x - (this.x + this.width/2), enemy.y - (this.y + this.height/2));
                            if (dist < minDist) {
                                minDist = dist;
                                target = { type: 'enemy', obj: enemy };
                            }
                        }
                    }
                }
                if (target) {
                    this.pdgTimer = 0.4; // 0.4s cooldown
                    pdgZaps.push({
                        x1: this.x + this.width/2,
                        y1: this.y + this.height/2,
                        x2: target.obj.x,
                        y2: target.obj.y,
                        timer: 0.08
                    });
                    if (target.type === 'bullet') {
                        const idx = enemyBullets.indexOf(target.obj);
                        if (idx !== -1) enemyBullets.splice(idx, 1);
                        playSound('hit');
                    } else {
                        target.obj.hp -= 15;
                        if (target.obj.hp <= 0) target.obj.hp = 0;
                        playSound('hit');
                    }
                }
            }
        }

        let currentShootCooldown = this.shootCooldown;
        if (this.isSpecialActive) {
            currentShootCooldown *= 0.5; // fire twice as fast!
        }

        if (this.shootTimer > 0) {
            this.shootTimer -= dt;
        }

        if (keys[this.inputKeys.fire] && this.shootTimer <= 0) {
            this.shoot();
            this.shootTimer = currentShootCooldown;
        }
    }

    shoot() {
        playSound('shoot');
        const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
        const speedMultiplier = mods ? mods.weaponProjSpeedMultiplier : 1.0;
        
        const bulletSpeed = 550 * speedMultiplier;
        const bulletSize = 4;

        const isSpecial = this.isSpecialActive;
        const color = isSpecial ? '#ff00aa' : (this.weaponLevel === 1 ? '#00ffff' : (this.weaponLevel === 2 ? '#00ffaa' : (this.weaponLevel === 3 ? '#ffff00' : (this.weaponLevel === 4 ? '#ff00ff' : '#ffffff'))));

        if (isSpecial) {
            // Supreme Purple waves
            bullets.push(new Bullet(this.x + this.width, this.y + this.height/2, bulletSpeed + 50, 0, color, 14, true));
            bullets.push(new Bullet(this.x + this.width, this.y + 2, bulletSpeed, -120, color, 8, true));
            bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, bulletSpeed, 120, color, 8, true));
        } else {
            if (this.shipType === 'warden') {
                const plasmaColor = '#ff6600';
                if (this.weaponLevel === 1) {
                    bullets.push(new Bullet(this.x + this.width, this.y + 4, bulletSpeed, 0, plasmaColor, bulletSize + 1));
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, bulletSpeed, 0, plasmaColor, bulletSize + 1));
                } else if (this.weaponLevel === 2) {
                    bullets.push(new Bullet(this.x + this.width, this.y + 4, bulletSpeed, 0, plasmaColor, bulletSize + 2));
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, bulletSpeed, 0, plasmaColor, bulletSize + 2));
                } else if (this.weaponLevel === 3) {
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height/2, bulletSpeed + 30, 0, plasmaColor, bulletSize + 2));
                    bullets.push(new Bullet(this.x + this.width, this.y + 2, bulletSpeed, -50, plasmaColor, bulletSize + 1));
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, bulletSpeed, 50, plasmaColor, bulletSize + 1));
                } else if (this.weaponLevel === 4) {
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height/2, bulletSpeed + 50, 0, plasmaColor, 10, true));
                    bullets.push(new Bullet(this.x + this.width, this.y + 4, bulletSpeed, -80, plasmaColor, bulletSize + 1));
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, bulletSpeed, 80, plasmaColor, bulletSize + 1));
                } else {
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height/2, bulletSpeed + 80, 0, plasmaColor, 12, true));
                    bullets.push(new Bullet(this.x + this.width, this.y + 2, bulletSpeed, -120, plasmaColor, bulletSize + 2));
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, bulletSpeed, 120, plasmaColor, bulletSize + 2));
                    bullets.push(new Bullet(this.x + this.width, this.y + 4, bulletSpeed - 40, -200, '#ffcc00', bulletSize + 1));
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, bulletSpeed - 40, 200, '#ffcc00', bulletSize + 1));
                }
            } else {
                if (this.weaponLevel === 1) {
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height/2, bulletSpeed, 0, color, bulletSize));
                } else if (this.weaponLevel === 2) {
                    bullets.push(new Bullet(this.x + this.width, this.y + 4, bulletSpeed, 0, color, bulletSize + 1));
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, bulletSpeed, 0, color, bulletSize + 1));
                } else if (this.weaponLevel === 3) {
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height/2, bulletSpeed, 0, color, bulletSize + 1));
                    bullets.push(new Bullet(this.x + this.width, this.y + 2, bulletSpeed, -100, color, bulletSize));
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, bulletSpeed, 100, color, bulletSize));
                } else if (this.weaponLevel === 4) {
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height/2, bulletSpeed, 0, color, 12, true));
                    bullets.push(new Bullet(this.x + this.width, this.y + 2, bulletSpeed - 50, -120, '#00ffff', bulletSize));
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, bulletSpeed - 50, 120, '#00ffff', bulletSize));
                } else {
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height/2, bulletSpeed + 50, 0, color, 14, true));
                    bullets.push(new Bullet(this.x + this.width, this.y + 2, bulletSpeed, -160, '#ff00aa', bulletSize + 2));
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, bulletSpeed, 160, '#ff00aa', bulletSize + 2));
                    bullets.push(new Bullet(this.x + this.width, this.y + 4, bulletSpeed - 80, -300, '#ffff00', bulletSize + 1));
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, bulletSpeed - 80, 300, '#ffff00', bulletSize + 1));
                }
            }
        }
    }

    dodge() {
        // Determine dodge direction based on current movement input
        let ddx = 0, ddy = 0;
        if (keys[this.inputKeys.up]) ddy -= 1;
        if (keys[this.inputKeys.down]) ddy += 1;
        if (keys[this.inputKeys.left]) ddx -= 1;
        if (keys[this.inputKeys.right]) ddx += 1;
        
        // If no direction input, dodge backward (left)
        if (ddx === 0 && ddy === 0) {
            ddx = -1;
        }
        
        // Normalize diagonal
        const mag = Math.sqrt(ddx*ddx + ddy*ddy);
        ddx = (ddx / mag) * this.dodgeDistance;
        ddy = (ddy / mag) * this.dodgeDistance;
        
        // Spawn particle burst at starting position
        createExplosion(this.x + this.width/2, this.y + this.height/2, '#00ffff', 6);
        
        // Apply the blink / teleport
        this.x += ddx;
        this.y += ddy;
        
        // Clamp to bounds after dodge
        if (this.x < 10) this.x = 10;
        if (this.x > canvas.width - this.width - 10) this.x = canvas.width - this.width - 10;
        if (this.y < 10) this.y = 10;
        if (this.y > canvas.height - this.height - 10) this.y = canvas.height - this.height - 10;
        
        // Spawn particle burst at destination
        createExplosion(this.x + this.width/2, this.y + this.height/2, '#00ffaa', 5);
        
        // Trail particles between start and destination
        const trailSteps = 5;
        const startX = this.x - ddx;
        const startY = this.y - ddy;
        for (let i = 1; i <= trailSteps; i++) {
            const t = i / (trailSteps + 1);
            const tx = startX + ddx * t;
            const ty = startY + ddy * t;
            particles.push(new Particle(tx + this.width/2, ty + this.height/2, '#44ffff'));
        }
        
        // Activate dodge invulnerability and cooldown
        this.dodgeInvulnTimer = this.dodgeMaxInvuln;
        this.invulnerable = Math.max(this.invulnerable, this.dodgeMaxInvuln);
        this.dodgeCooldown = this.dodgeMaxCooldown;
        this.isDodging = true;
        
        // Reset dodging flag after brief delay (for visual feedback)
        setTimeout(() => { this.isDodging = false; }, 100);
        
        playSound('powerup');
    }

    takeDamage(amt) {
        if (this.invulnerable > 0) return;
        if (this.isPulledOut) return; // GRO-1003: No damage while repairing
        
        let damageMultiplier = 1.0;
        if (difficulty === 'easy') damageMultiplier = 0.7;
        else if (difficulty === 'hard') damageMultiplier = 1.3;
        
        const finalDmg = amt * damageMultiplier;
        
        // Warden Guardian Protocol dome shield absorption
        if (this.shipType === 'warden' && this.isSpecialActive && this.wardenShieldDomeHP > 0) {
            this.wardenShieldDomeHP -= finalDmg;
            playSound('hit');
            createExplosion(this.x + this.width/2, this.y + this.height/2, '#ff6600', 4);
            if (this.wardenShieldDomeHP <= 0) {
                this.wardenShieldDomeHP = 0;
                this.isSpecialActive = false;
                this.specialCooldown = this.specialMaxCooldown;
                playSound('explosion');
                createExplosion(this.x + this.width/2, this.y + this.height/2, '#ff0000', 20);
            }
            return;
        }
        
        this.shield -= finalDmg;
        
        const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
        this.invulnerable = 0.8 + (mods ? mods.shieldInvulnBonus : 0);
        
        playSound('hit');
        createExplosion(this.x + this.width/2, this.y + this.height/2, '#ffaa00', 8);

        if (this.shield <= 0) {
            // GRO-1003: Pull-out system replaces death
            // Capture overkill before zeroing shield
            const overkill = Math.abs(this.shield);
            this.shield = 0;
            
            if (!this.isPulledOut) {
                this.isPulledOut = true;
                // Repair time: 15s base + up to 15s based on overkill damage
                this.pullOutTimer = 15 + Math.min(15, overkill * 0.8);
                playSound('explosion');
                createExplosion(this.x, this.y, '#ff6600', 30);
                
                // Trigger pull-out banter — use the assigned player character, not ship type
                if (window.BanterEngine && currentBiome > 0 && banterEnabled && !streamerMode) {
                    const character = this.character || 'D';
                    const line = BanterEngine.getLine('pull_out', currentBiome, character);
                    if (line && window.activeDialogue === undefined) {
                        // Queue pull-out line as floating text (non-blocking)
                        floatingTexts.push({ text: line.l, x: this.x + this.width/2, y: this.y - 20, life: 3.0, color: '#ff6600' });
                    }
                }
                
                // Check if ALL players are pulled out (multiplayer check)
                let allPulledOut = true;
                if (window.Multiplayer && Multiplayer.players.length > 1) {
                    for (const mp of Multiplayer.players) {
                        if (mp.alive && !mp.isHost) allPulledOut = false;
                    }
                    if (allPulledOut) {
                        gameOver = true;
                        Multiplayer.onPlayerPullOut(this.id || 1);
                    }
                }
                // Single player: no gameOver, auto-repair will handle return
            }
        }
    }

    draw() {
        // GRO-1003: Pull-out visual — damaged ship with repair indicator
        if (this.isPulledOut) {
            ctx.save();
            ctx.translate(this.x, this.y);
            
            // Pulsing red-orange glow behind ship
            const pulse = Math.sin(this.pullOutTimer * 4) * 0.4 + 0.6;
            ctx.shadowColor = `rgba(255, 100, 0, ${pulse})`;
            ctx.shadowBlur = 20 * pulse;
            
            // Draw ship at reduced opacity
            ctx.globalAlpha = 0.5 + Math.sin(this.pullOutTimer * 8) * 0.2;
            
            let sprite;
            const frameIdx = (Math.floor(gameTime * 6) % 2 === 0) ? '0' : '1';
            if (this.shipType === 'phantom') sprite = playerSprites[`player_phantom_${frameIdx}`];
            else if (this.shipType === 'bastion') sprite = playerSprites[`player_bastion_${frameIdx}`];
            else if (this.shipType === 'tempest') sprite = playerSprites[`player_tempest_${frameIdx}`];
            else if (this.shipType === 'specter') sprite = playerSprites[`player_specter_${frameIdx}`];
            else if (this.shipType === 'warden') sprite = playerSprites[`player_warden_${frameIdx}`];
            else if (this.shipType === 'scout') sprite = playerSprites['scout_0'];
            else if (this.shipType === 'heavy') sprite = playerSprites['heavy_0'];
            else if (this.shipType === 'interceptor') sprite = playerSprites['interceptor_0'];
            else sprite = playerSprites[`player_${frameIdx}`];
            
            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                ctx.drawImage(sprite, 0, 0, 48, 48);
            } else {
                ctx.fillStyle = '#ff4400';
                ctx.beginPath();
                ctx.moveTo(40, 10); ctx.lineTo(0, 0); ctx.lineTo(0, 20); ctx.closePath();
                ctx.fill();
            }
            
            ctx.restore();
            
            // Repair timer text above ship
            ctx.save();
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(255, 136, 0, ${0.7 + pulse * 0.3})`;
            ctx.fillText(`REPAIRING ${Math.ceil(this.pullOutTimer)}s`, this.x + this.width/2, this.y - 15);
            ctx.restore();
            
            return; // Skip normal draw
        }
        
        if (this.invulnerable > 0 && Math.floor(this.invulnerable * 15) % 2 === 0) {
            return;
        }

        ctx.save();
        ctx.translate(this.x, this.y);

        // Faint red outline glow on player ship at low HP (§6.4)
        const hpPct = this.shield / this.shieldMax;
        if (hpPct < 0.25) {
            const outlineOpacity = hpPct < 0.10 ? 0.60 : 0.30;
            ctx.shadowColor = `rgba(255, 0, 0, ${outlineOpacity})`;
            ctx.shadowBlur = 6;
        }

        // --- Apply Ship Color Cosmetic plating tint ---
        const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
        const cosmeticColor = mods ? mods.cosmetics.shipColor : 'default';

        // Sprite frame: select ship model base sprite or cycle animation
        let sprite;
        const frameIdx = (Math.floor(gameTime * 6) % 2 === 0) ? '0' : '1';
        
        if (this.shipType === 'phantom') {
            sprite = playerSprites[`player_phantom_${frameIdx}`];
        } else if (this.shipType === 'bastion') {
            sprite = playerSprites[`player_bastion_${frameIdx}`];
        } else if (this.shipType === 'tempest') {
            sprite = playerSprites[`player_tempest_${frameIdx}`];
        } else if (this.shipType === 'specter') {
            sprite = playerSprites[`player_specter_${frameIdx}`];
        } else if (this.shipType === 'warden') {
            sprite = playerSprites[`player_warden_${frameIdx}`];
        } else if (this.shipType === 'scout') {
            sprite = playerSprites['scout_0'];
        } else if (this.shipType === 'heavy') {
            sprite = playerSprites['heavy_0'];
        } else if (this.shipType === 'interceptor') {
            sprite = playerSprites['interceptor_0'];
        } else {
            sprite = playerSprites[`player_${frameIdx}`];
        }

        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            // Render sprite scaled to 48x48 (ship area ~40x20, sprite is 1024x1024)
            const spriteSize = 48;
            ctx.drawImage(sprite, 0, 0, spriteSize, spriteSize);

            // Tint plating with chosen cosmetic color
            if (cosmeticColor !== 'default') {
                ctx.save();
                ctx.globalCompositeOperation = 'source-atop';
                switch(cosmeticColor) {
                    case 'cyan': ctx.fillStyle = 'rgba(0, 255, 255, 0.3)'; break;
                    case 'magenta': ctx.fillStyle = 'rgba(255, 0, 85, 0.3)'; break;
                    case 'emerald': ctx.fillStyle = 'rgba(0, 255, 85, 0.3)'; break;
                    case 'gold': ctx.fillStyle = 'rgba(255, 204, 0, 0.35)'; break;
                    case 'purple': ctx.fillStyle = 'rgba(176, 38, 255, 0.3)'; break;
                }
                ctx.fillRect(0, 0, spriteSize, spriteSize);
                ctx.restore();
            }
        } else {
            // Fallback: simple triangle ship if sprite not loaded yet
            if (cosmeticColor !== 'default') {
                switch(cosmeticColor) {
                    case 'cyan': ctx.fillStyle = '#00ffff'; break;
                    case 'magenta': ctx.fillStyle = '#ff00ff'; break;
                    case 'emerald': ctx.fillStyle = '#00ff55'; break;
                    case 'gold': ctx.fillStyle = '#ffcc00'; break;
                    case 'purple': ctx.fillStyle = '#b026ff'; break;
                }
            } else {
                ctx.fillStyle = this.color;
            }
            ctx.beginPath();
            ctx.moveTo(0, 4);
            ctx.lineTo(25, 4);
            ctx.lineTo(40, this.height / 2);
            ctx.lineTo(25, this.height - 4);
            ctx.lineTo(0, this.height - 4);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#ff7700';
            ctx.beginPath();
            ctx.moveTo(0, 5);
            ctx.lineTo(-8, this.height / 2);
            ctx.lineTo(0, this.height - 5);
            ctx.closePath();
            ctx.fill();
        }

        // Draw Overload active visual aura / dome shield
        if (this.isSpecialActive) {
            if (this.shipType === 'warden' && this.wardenShieldDomeHP > 0) {
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 102, 0, 0.6)';
                ctx.fillStyle = 'rgba(255, 102, 0, 0.05)';
                ctx.lineWidth = 3 + Math.sin(gameTime * 10) * 1.5;
                ctx.beginPath();
                ctx.arc(20, this.height/2, 60, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            } else {
                ctx.strokeStyle = '#ff00aa';
                ctx.lineWidth = 2 + Math.sin(gameTime * 15) * 1.5;
                ctx.beginPath();
                ctx.arc(20, this.height/2, 28, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        // Weapon level 4+ shield aura (sprite-based)
        if (this.weaponLevel >= 4) {
            const shieldSprite = vfxSprites['shield'];
            if (shieldSprite && shieldSprite.complete && shieldSprite.naturalWidth > 0) {
                // Pulsing alpha based on game time
                const pulse = 0.25 + Math.sin(gameTime * 3) * 0.15;
                ctx.globalAlpha = pulse;
                // Render translucent blue forcefield ring (1024x1024 → 72x72)
                const shieldSize = 72;
                ctx.drawImage(shieldSprite,
                    -shieldSize / 2 + 24,  // center x offset
                    -shieldSize / 2 + this.height / 2,  // center y offset
                    shieldSize, shieldSize);
                ctx.globalAlpha = 1;
            } else {
                // Fallback: double-ring procedural shield
                const pulse = 0.25 + Math.sin(gameTime * 3) * 0.15;
                // Outer ring
                ctx.strokeStyle = `rgba(0, 200, 255, ${pulse + 0.1})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(24, this.height / 2, 32, 0, Math.PI * 2);
                ctx.stroke();
                // Inner ring
                ctx.strokeStyle = `rgba(0, 255, 255, ${pulse + 0.2})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(24, this.height / 2, 26, 0, Math.PI * 2);
                ctx.stroke();
                // Glow dots at cardinal points
                ctx.fillStyle = `rgba(0, 255, 255, ${pulse + 0.3})`;
                for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
                    ctx.beginPath();
                    ctx.arc(24 + Math.cos(a) * 29, this.height / 2 + Math.sin(a) * 29, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Dodge-ready glow ring
        if (this.dodgeCooldown <= 0 && !this.isDodging) {
            const dodgePulse = 0.3 + Math.sin(gameTime * 5) * 0.2;
            ctx.strokeStyle = `rgba(0, 255, 170, ${dodgePulse})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.arc(20, this.height / 2, 26, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
    }
}

// Expose Player for the main game script after extraction.
window.Player = Player;
