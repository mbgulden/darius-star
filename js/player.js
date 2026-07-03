// --- Player Ship Class ---
class Player {
    constructor(shipType = 'interceptor') {
        this.x = 80;
        this.y = canvas.height / 2;
        this.width = 40;
        this.height = 20;
        this.shipType = shipType;

        // Set stats based on ship model type
        if (shipType === 'scout') {
            this.speed = 280;
            this.shieldMax = 80;
            this.color = '#00ffff';
            this.shootCooldown = 0.12; // faster reload
        } else if (shipType === 'heavy') {
            this.speed = 170;
            this.shieldMax = 150;
            this.color = '#ff9900';
            this.shootCooldown = 0.18; // slower reload
        } else { // interceptor (default)
            this.speed = 220;
            this.shieldMax = 100;
            this.color = '#00ffaa';
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
    }

    update(dt) {
        if (this.invulnerable > 0) {
            this.invulnerable -= dt;
        }

        let dx = 0;
        let dy = 0;
        if (keys['w'] || keys['W'] || keys['ArrowUp']) dy -= 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown']) dy += 1;
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) dx -= 1;
        if (keys['d'] || keys['D'] || keys['ArrowRight']) dx += 1;

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
            const canBoost = keys['Shift'] && this.boostCooldown <= 0 && this.boostFuel > 0;
            if (canBoost) {
                this.isBoosting = true;
                this.boostFuel -= dt;
                currentSpeed *= 1.5; // +50% speed burst

                // Spawn boost exhaust particles (trail)
                if (Math.random() < 0.4) {
                    const trailColor = mods.cosmetics.thrusterTrail === 'default' ? '#00ffff' : getTrailColorValue(mods.cosmetics.thrusterTrail);
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

            // Cyber Overload Special Ability
            const canSpecial = (keys['k'] || keys['K']) && this.specialCooldown <= 0 && !this.isSpecialActive;
            if (canSpecial) {
                this.isSpecialActive = true;
                this.specialActiveTimer = this.specialMaxDuration;
                playSound('powerup');
                createExplosion(this.x + this.width/2, this.y + this.height/2, '#b026ff', 15);
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
                const trailColor = mods.cosmetics.thrusterTrail === 'default' ? '#ff7700' : getTrailColorValue(mods.cosmetics.thrusterTrail);
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
        const canDodge = (keys['e'] || keys['E']) && this.dodgeCooldown <= 0 && !this.isDodging;
        if (canDodge) {
            this.dodge();
        }

        let currentShootCooldown = this.shootCooldown;
        if (this.isSpecialActive) {
            currentShootCooldown *= 0.5; // fire twice as fast!
        }

        if (this.shootTimer > 0) {
            this.shootTimer -= dt;
        }

        if ((keys[' '] || keys['j'] || keys['J']) && this.shootTimer <= 0) {
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

    dodge() {
        // Determine dodge direction based on current movement input
        let ddx = 0, ddy = 0;
        if (keys['w'] || keys['W'] || keys['ArrowUp']) ddy -= 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown']) ddy += 1;
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) ddx -= 1;
        if (keys['d'] || keys['D'] || keys['ArrowRight']) ddx += 1;

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

        let damageMultiplier = 1.0;
        if (difficulty === 'easy') damageMultiplier = 0.7;
        else if (difficulty === 'hard') damageMultiplier = 1.3;

        this.shield -= amt * damageMultiplier;

        const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
        this.invulnerable = 0.8 + (mods ? mods.shieldInvulnBonus : 0);

        playSound('hit');
        createExplosion(this.x + this.width/2, this.y + this.height/2, '#ffaa00', 8);

        if (this.shield <= 0) {
            this.shield = 0;
            gameOver = true;
            playSound('explosion');
            createExplosion(this.x, this.y, '#ff0000', 40);
        }
    }

    draw() {
        if (this.invulnerable > 0 && Math.floor(this.invulnerable * 15) % 2 === 0) {
            return;
        }

        ctx.save();
        ctx.translate(this.x, this.y);

        // --- Apply Ship Color Cosmetic plating tint ---
        const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
        const cosmeticColor = mods ? mods.cosmetics.shipColor : 'default';

        // Sprite frame: select ship model base sprite or cycle animation
        let sprite;
        if (this.shipType === 'scout') {
            sprite = playerSprites['scout_0'];
        } else if (this.shipType === 'heavy') {
            sprite = playerSprites['heavy_0'];
        } else {
            sprite = playerSprites['interceptor_0'];
        }

        if (!sprite || !sprite.complete || sprite.naturalWidth === 0) {
            const frameKey = (Math.floor(gameTime * 6) % 2 === 0) ? 'player_0' : 'player_1';
            sprite = playerSprites[frameKey];
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

        // Draw Overload active visual aura
        if (this.isSpecialActive) {
            ctx.strokeStyle = '#ff00aa';
            ctx.lineWidth = 2 + Math.sin(gameTime * 15) * 1.5;
            ctx.beginPath();
            ctx.arc(20, this.height/2, 28, 0, Math.PI * 2);
            ctx.stroke();
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
                // Fallback: procedural circle
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(24, this.height / 2, 28, 0, Math.PI * 2);
                ctx.stroke();
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
