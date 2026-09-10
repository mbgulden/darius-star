// --- Difficulty Scaling System (GRO-928) ---
const DIFFICULTY_CONFIG = {
    easy: {
        id: 'easy', label: 'CADET', description: 'Forgiving enemy pressure and more supplies.',
        enemyHpMultiplier: 0.7, enemySpeedMultiplier: 0.8, enemyFireRateMultiplier: 0.6,
        bossHpMultiplier: 0.7, powerupDropMultiplier: 1.5, playerDamageMultiplier: 0.7,
        startingLives: 3, unlockable: false
    },
    normal: {
        id: 'normal', label: 'PILOT', description: 'Standard Darius Star balance.',
        enemyHpMultiplier: 1.0, enemySpeedMultiplier: 1.0, enemyFireRateMultiplier: 1.0,
        bossHpMultiplier: 1.0, powerupDropMultiplier: 1.0, playerDamageMultiplier: 1.0,
        startingLives: 2, unlockable: false
    },
    hard: {
        id: 'hard', label: 'ACE', description: 'Faster enemies, tougher bosses, fewer drops.',
        enemyHpMultiplier: 1.3, enemySpeedMultiplier: 1.2, enemyFireRateMultiplier: 1.5,
        bossHpMultiplier: 1.3, powerupDropMultiplier: 0.7, playerDamageMultiplier: 1.3,
        startingLives: 1, unlockable: false
    },
    insane: {
        id: 'insane', label: 'CYBER', description: 'One life. No continues. No mercy.',
        enemyHpMultiplier: 1.6, enemySpeedMultiplier: 1.4, enemyFireRateMultiplier: 1.8,
        bossHpMultiplier: 1.6, powerupDropMultiplier: 0.0, playerDamageMultiplier: 1.5,
        startingLives: 1, unlockable: true
    }
};

function isInsaneDifficultyUnlocked() {
    try {
        return localStorage.getItem('dariusStar_insaneUnlocked') === 'true' ||
            localStorage.getItem('darius_star_ngplus_eligible') !== null;
    } catch (e) {
        return false;
    }
}

function getDifficultyConfig(id) {
    let key = DIFFICULTY_CONFIG[id] ? id : 'normal';
    if (key === 'insane' && !isInsaneDifficultyUnlocked()) key = 'hard';
    return DIFFICULTY_CONFIG[key];
}

function getCurrentDifficultyConfig() {
    return getDifficultyConfig(typeof difficulty !== 'undefined' ? difficulty : 'normal');
}

window.DIFFICULTY_CONFIG = DIFFICULTY_CONFIG;
window.getDifficultyConfig = getDifficultyConfig;
window.getCurrentDifficultyConfig = getCurrentDifficultyConfig;
window.isInsaneDifficultyUnlocked = isInsaneDifficultyUnlocked;

// --- Canonical Player Ship Class & Scaling Rules ---
// Enforces minimum +20% scaling across all chassis and scales up progressively by tonnage/role
const PLAYER_SHIP_CLASS_RULES = {
    phantom: {
        className: 'Tachyon Phase Hunter',
        category: 'Scout / Interceptor',
        width: 54,
        height: 54,
        renderSize: 58,
        shieldRadius: 40,
        scalePercent: '+22%'
    },
    scout: {
        className: 'Tachyon Phase Hunter',
        category: 'Scout / Interceptor',
        width: 54,
        height: 54,
        renderSize: 58,
        shieldRadius: 40,
        scalePercent: '+22%'
    },
    specter: {
        className: 'Quantum Infiltrator',
        category: 'Recon / Sniper',
        width: 55,
        height: 55,
        renderSize: 60,
        shieldRadius: 41,
        scalePercent: '+25%'
    },
    nyxa: {
        className: 'Strike Fighter',
        category: 'Flagship Medium',
        width: 56,
        height: 56,
        renderSize: 62,
        shieldRadius: 42,
        scalePercent: '+27%'
    },
    interceptor: {
        className: 'Strike Fighter',
        category: 'Flagship Medium',
        width: 56,
        height: 56,
        renderSize: 62,
        shieldRadius: 42,
        scalePercent: '+27%'
    },
    tempest: {
        className: 'Rapid Interceptor',
        category: 'Dogfighter Medium',
        width: 56,
        height: 56,
        renderSize: 62,
        shieldRadius: 42,
        scalePercent: '+27%'
    },
    warden: {
        className: 'Acoustic Frigate',
        category: 'Support Frigate',
        width: 60,
        height: 60,
        renderSize: 66,
        shieldRadius: 45,
        scalePercent: '+36%'
    },
    bastion: {
        className: 'Heavy Gunship / Dread-Frigate',
        category: 'Assault Dreadnought',
        width: 64,
        height: 64,
        renderSize: 72,
        shieldRadius: 48,
        scalePercent: '+45%'
    },
    heavy: {
        className: 'Heavy Gunship / Dread-Frigate',
        category: 'Assault Dreadnought',
        width: 64,
        height: 64,
        renderSize: 72,
        shieldRadius: 48,
        scalePercent: '+45%'
    }
};

function getPlayerShipRules(shipType) {
    const key = (shipType || 'nyxa').toLowerCase();
    return PLAYER_SHIP_CLASS_RULES[key] || PLAYER_SHIP_CLASS_RULES.nyxa;
}

window.PLAYER_SHIP_CLASS_RULES = PLAYER_SHIP_CLASS_RULES;
window.getPlayerShipRules = getPlayerShipRules;

// --- Player Ship Class ---
class Player {
    constructor(shipType = 'interceptor', playerId = 1) {
        this.x = 80;
        this.y = (typeof canvas !== 'undefined' && canvas) ? canvas.height / 2 : 270;
        this.playerId = playerId;
        // Per-player input binding — each player uses their own keys (can be single string or array of strings)
        this.inputKeys = { 
            1: { 
                up: ['w', 'W'], 
                down: ['s', 'S'], 
                left: ['a', 'A'], 
                right: ['d', 'D'], 
                fire: [' '], 
                special: ['k', 'K'], 
                dodge: ['e', 'E'], 
                boost: ['Shift'] 
            },
            2: { 
                up: ['ArrowUp'], 
                down: ['ArrowDown'], 
                left: ['ArrowLeft'], 
                right: ['ArrowRight'], 
                fire: ['0', 'Numpad0', 'ControlRight', 'Control'], 
                special: ['1', 'Numpad1', 'ShiftRight', 'Shift'], 
                dodge: ['2', 'Numpad2', 'NumpadDot', '.'], 
                boost: ['Enter', 'NumpadEnter'] 
            },
            3: { up:'Gamepad1U', down:'Gamepad1D', left:'Gamepad1L', right:'Gamepad1R', fire:'Gamepad1A', special:'Gamepad1B', dodge:'Gamepad1X', boost:'Gamepad1LB' },
            4: { up:'Gamepad2U', down:'Gamepad2D', left:'Gamepad2L', right:'Gamepad2R', fire:'Gamepad2A', special:'Gamepad2B', dodge:'Gamepad2X', boost:'Gamepad2LB' },
        }[playerId || 1] || { up: ['w', 'W'], down: ['s', 'S'], left: ['a', 'A'], right: ['d', 'D'], fire: [' '], special: ['k', 'K'], dodge: ['e', 'E'], boost: ['Shift'] };
        
        // Scale player dimensions according to ship class
        const shipRules = getPlayerShipRules(shipType);
        this.shipRules = shipRules;
        this.width = shipRules.width;
        this.height = shipRules.height;
        this.renderSize = shipRules.renderSize;
        this.shieldRadius = shipRules.shieldRadius;
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
        
        // Adjust base stats based on selected difficulty.
        const difficultyConfig = getCurrentDifficultyConfig();
        if (difficultyConfig.id === 'easy') {
            this.shieldMax += 30;
            this.weaponLevel = 2;
        } else if (difficultyConfig.id === 'hard') {
            this.shieldMax = Math.round(this.shieldMax * 0.8);
            this.weaponLevel = 1;
        } else if (difficultyConfig.id === 'insane') {
            this.shieldMax = Math.round(this.shieldMax * 0.65);
            this.weaponLevel = 1;
        } else {
            this.weaponLevel = 1;
        }
        this.baseShieldMax = this.shieldMax;
        
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
            this.dodgeTimeout = null;
            this.dodgeInvulnTimer = 0;
            this.dodgeMaxInvuln = 0.25;
        } else {
            this.boostFuel = 3.0;
            this.boostMaxFuel = 3.0;
            this.boostCooldown = 0;
            this.boostMaxCooldown = 5.0;
            this.boostDistance = 90;
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
            this.dodgeTimeout = null;
            this.dodgeInvulnTimer = 0;
            this.dodgeMaxInvuln = 0.25;
        }

        // Thermal Weapon Overheat state (GDD §2.2 Supreme Nova)
        this.weaponHeat = 0;
        this.isOverheated = false;
        this.overheatTimer = 0;
        
        // Apply custom ship color from localStorage
        try {
            if (typeof localStorage !== 'undefined') {
                const storedSelection = localStorage.getItem('dariusStar_shipSelection');
                if (storedSelection) {
                    const parsed = JSON.parse(storedSelection);
                    const slotKey = 'p' + this.playerId;
                    if (parsed[slotKey] && parsed[slotKey].color) {
                        this.color = parsed[slotKey].color;
                    }
                }
            }
        } catch (e) {
            console.error("Failed to load custom ship color:", e);
        }
        
        this.shield = this.shieldMax;
        this.shootTimer = 0;
        this.invulnerable = 0;
        this.shieldHitFlash = 0;
        this.shieldImpacts = [];
        this.powerupAuraTimer = 0;
        this.powerupAuraColor = '#00ffff';
        this.powerupAuraKind = 'W';

        // Secondary weapon system (GRO-929)
        this.secondaryMeter = 0;
        this.secondaryMeterMax = 100;
        this.secondaryFlashTimer = 0;
        this.secondarySpecialType = null;
        this.secondarySpecialPulse = 0;
        this.secondaryShieldWallTimer = 0;
        this.secondaryDecoys = [];
        this.secondaryKeyLatch = { bomb: false, missile: false, special: false };
        
        // Pull-out system — replaces death
        this.alive = true;
        this.isPulledOut = false;       // Ship disabled, auto-repairing
        this.pullOutTimer = 0;          // Seconds until auto-repair completes
        this.pullOutReturnInvuln = 0;   // 3s invulnerability after return
    }

    isKeyPressed(action) {
        const binding = this.inputKeys[action];
        if (!binding) return false;
        if (Array.isArray(binding)) {
            return binding.some(k => keys[k]);
        }
        return !!keys[binding];
    }

    update(dt) {
        // Pull-out system — retreat to bottom-left staging area, auto-repair
        if (this.isPulledOut) {
            this.canShoot = false;
            this.isFiring = false;
            
            // Retreat to bottom-left corner of the screen
            const slotIdx = this.playerId ? (this.playerId - 1) : 0;
            const targetX = 55 + slotIdx * 45;
            const targetY = (typeof canvas !== 'undefined' ? canvas.height : 450) - 75;
            this.x += (targetX - this.x) * Math.min(1.0, 2.2 * dt);
            this.y += (targetY - this.y) * Math.min(1.0, 2.2 * dt);

            this.pullOutTimer -= dt;
            if (this.pullOutTimer > 0) {
                return; // No input or firing while repairing
            }

            // Auto-repair complete: check if other players remain active or single player
            let canRejoin = true;
            if (typeof remotePlayers !== 'undefined' && remotePlayers.length > 0) {
                if (this === (typeof player !== 'undefined' ? player : null)) {
                    canRejoin = remotePlayers.some(rp => !rp.isPulledOut && rp.alive !== false);
                } else if (typeof player !== 'undefined') {
                    canRejoin = (!player.isPulledOut && player.alive !== false) ||
                        remotePlayers.some(rp => rp !== this && !rp.isPulledOut && rp.alive !== false);
                }
            }

            if (canRejoin) {
                this.isPulledOut = false;
                this.shield = this.shieldMax;
                this.pullOutReturnInvuln = 3.0;
                this.invulnerable = Math.max(this.invulnerable, 3.0);
                if (typeof playSound === 'function') playSound('powerup');
                if (typeof createExplosion === 'function') createExplosion(this.x + this.width/2, this.y + this.height/2, '#00ff88', 25, 'shield_hit');
                
                if (typeof FloatingText !== 'undefined' && typeof floatingTexts !== 'undefined') {
                    floatingTexts.push(new FloatingText(this.x + this.width/2, this.y - 30, 'FIELD REPAIRS COMPLETE', '#00ff88'));
                }

                if (window.Multiplayer && this.playerId) {
                    Multiplayer.updatePlayerState(this.playerId, { alive: true, status: "active", _wasPulledOut: false, shield: this.shield });
                }
            }
            return;
        }
        
        if (this.invulnerable > 0) {
            this.invulnerable -= dt;
        }
        if (this.shieldHitFlash > 0) {
            this.shieldHitFlash -= dt;
        }
        if (this.shieldImpacts && this.shieldImpacts.length > 0) {
            for (let i = this.shieldImpacts.length - 1; i >= 0; i--) {
                this.shieldImpacts[i].timer -= dt;
                if (this.shieldImpacts[i].timer <= 0) {
                    this.shieldImpacts.splice(i, 1);
                }
            }
        }
        if (this.powerupAuraTimer > 0) {
            this.powerupAuraTimer -= dt;
        }
        if (this.muzzleFlashTimer > 0) {
            this.muzzleFlashTimer = Math.max(0, this.muzzleFlashTimer - dt * 6.0);
        }

        let dx = 0;
        let dy = 0;
        if (this.isKeyPressed('up')) dy -= 1;
        if (this.isKeyPressed('down')) dy += 1;
        if (this.isKeyPressed('left')) dx -= 1;
        if (this.isKeyPressed('right')) dx += 1;

        if (dx !== 0 && dy !== 0) {
            dx *= 0.7071;
            dy *= 0.7071;
        }

        let currentSpeed = this.speed;

        // Apply permanent upgrades modifiers in update loop
        const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
        if (mods) {
            // Recalculate shieldMax with permanent upgrade bonus
            this.shieldMax = (this.baseShieldMax || 100) + (mods.shieldMaxHPBonus || 0);

            // Shield Passive Regeneration
            this.shield = Math.min(this.shieldMax, this.shield + (mods.shieldRegenRate || 0) * dt);

            // Quantum Combat Drones (addons upgrade)
            if (mods.droneCount > 0 && !this.isPulledOut) {
                this.droneAngle = (this.droneAngle || 0) + dt * 2.2;
                this.droneShootTimer = (this.droneShootTimer || 0) - dt;

                // Drones fire helper plasma darts at nearest enemy
                if (this.droneShootTimer <= 0 && typeof enemies !== 'undefined' && enemies.length > 0) {
                    this.droneShootTimer = 1.2 / (mods.droneFireRate || 1.0);
                    let nearest = null;
                    let nearestDist = Infinity;
                    for (let k = 0; k < enemies.length; k++) {
                        const e = enemies[k];
                        if (e.x > this.x && e.hp > 0) {
                            const d = Math.hypot(e.x - this.x, e.y - this.y);
                            if (d < nearestDist) {
                                nearestDist = d;
                                nearest = e;
                            }
                        }
                    }
                    if (nearest) {
                        const droneIdx = Math.floor(Math.random() * mods.droneCount);
                        const ang = this.droneAngle + (droneIdx * Math.PI * 2 / mods.droneCount);
                        const drX = this.x + 24 + Math.cos(ang) * 45;
                        const drY = this.y + this.height / 2 + Math.sin(ang) * 35;
                        const aimAng = Math.atan2((nearest.y + nearest.height / 2) - drY, (nearest.x + nearest.width / 2) - drX);
                        const dart = new Bullet(drX, drY, Math.cos(aimAng) * 600, Math.sin(aimAng) * 600, '#00ffff', 3);
                        dart.damage = 2 * (mods.weaponDamageMultiplier || 1.0);
                        bullets.push(dart);
                        playSound('shoot', { weaponLevel: 1 });
                    }
                }

                // Drones intercept enemy projectiles close to them
                if (typeof enemyBullets !== 'undefined' && enemyBullets.length > 0) {
                    for (let d = 0; d < mods.droneCount; d++) {
                        const ang = this.droneAngle + (d * Math.PI * 2 / mods.droneCount);
                        const drX = this.x + 24 + Math.cos(ang) * 45;
                        const drY = this.y + this.height / 2 + Math.sin(ang) * 35;
                        for (let b = enemyBullets.length - 1; b >= 0; b--) {
                            const eb = enemyBullets[b];
                            if (Math.hypot(eb.x - drX, eb.y - drY) < 22) {
                                enemyBullets.splice(b, 1);
                                createExplosion(drX, drY, '#00ffff', 4, 'shield_hit');
                                playSound('hit');
                                break;
                            }
                        }
                    }
                }
            }
            
            // Engine Afterburner Boost
            const canBoost = this.isKeyPressed('boost') && this.boostCooldown <= 0 && this.boostFuel > 0;
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
                        this.x - 24, 
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
            
            // Add normal thruster trail
            if (!this.isBoosting && Math.random() < 0.15) {
                let trailColor;
                if (this.shipType === 'warden') {
                    trailColor = '#ff3300';
                } else {
                    trailColor = mods.cosmetics.thrusterTrail === 'default' ? '#ff7700' : getTrailColorValue(mods.cosmetics.thrusterTrail);
                }
                particles.push(new Particle(
                    this.x - 6, 
                    this.y + this.height/2 + (Math.random()-0.5)*6, 
                    trailColor
                ));
            }
        } else {
            // Normal thruster trail fallback
            if (Math.random() < 0.15) {
                particles.push(new Particle(
                    this.x - 6, 
                    this.y + this.height/2 + (Math.random()-0.5)*6, 
                    '#ff7700'
                ));
            }
        }

        // Secondary weapons are always active, even before permanent upgrades exist.
        this.updateSecondaryWeapons(dt);

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
        const canDodge = this.isKeyPressed('dodge') && this.dodgeCooldown <= 0 && !this.isDodging;
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
            if (this.secondarySpecialType === 'striker') {
                currentShootCooldown = Math.min(currentShootCooldown, 0.025);
            } else {
                currentShootCooldown *= 0.5; // fire twice as fast!
            }
        }

        if (this.shootTimer > 0) {
            this.shootTimer -= dt;
        }

        // Weapon Heat & Overheat cooling loop (GDD §2.2)
        if (this.isOverheated) {
            this.overheatTimer -= dt;
            this.weaponHeat = Math.max(0, this.weaponHeat - 50 * dt);
            if (Math.random() < 0.25 && typeof particles !== 'undefined') {
                particles.push(new Particle(this.x + Math.random() * this.width, this.y + Math.random() * this.height, '#ff4400'));
            }
            if (this.overheatTimer <= 0 && this.weaponHeat <= 0) {
                this.isOverheated = false;
                if (typeof floatingTexts !== 'undefined') {
                    floatingTexts.push(new FloatingText(this.x + this.width / 2, this.y - 20, 'WEAPONS COOLED', '#00ff88'));
                }
            }
        } else {
            const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
            const coolRate = 42 * (mods ? mods.weaponFireRateMultiplier : 1.0);
            if (!this.isKeyPressed('fire') || this.weaponLevel < 5) {
                this.weaponHeat = Math.max(0, this.weaponHeat - coolRate * dt);
            }
        }

        if (this.isKeyPressed('fire') && this.shootTimer <= 0 && !this.isOverheated) {
            this.shoot();
            this.shootTimer = currentShootCooldown;
        }
    }

    shoot() {
        if (this.isPulledOut || this.isOverheated) return;

        // Supreme Nova Heat Accumulation
        if (this.weaponLevel >= 5 && !this.isSpecialActive) {
            this.weaponHeat += 5.5;
            if (this.weaponHeat >= 100) {
                this.weaponHeat = 100;
                this.isOverheated = true;
                this.overheatTimer = 1.8;
                if (typeof playSound === 'function') playSound('explosion', { volume: 0.4 });
                if (typeof floatingTexts !== 'undefined') {
                    floatingTexts.push(new FloatingText(this.x + this.width / 2, this.y - 26, '⚠️ WEAPON OVERHEAT', '#ff0055'));
                }
                return;
            }
        }

        const ship = this.shipType || 'nyxa';
        playSound('shoot', { weaponLevel: this.weaponLevel, shipType: ship });

        const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
        const speedMultiplier = mods ? mods.weaponProjSpeedMultiplier : 1.0;
        const dmgMultiplier = mods ? mods.weaponDamageMultiplier : 1.0;
        
        const bulletSpeed = 550 * speedMultiplier;
        const isSpecial = this.isSpecialActive;
        const wl = this.weaponLevel || 1;

        // Visual Muzzle Flash
        this.muzzleFlashTimer = 0.15;

        // Ship-Specific Primary Munitions & Spread Trajectories
        if (ship === 'bastion' || ship === 'heavy') {
            // ==========================================
            // BASTION: Heavy Kinetic Autocannon & Flak
            // Color: Molten Amber (#ffaa00), heavy slugs
            // ==========================================
            this.muzzleFlashColor = '#ffaa00';
            const bColor = '#ffaa00';
            const bSpeed = 500 * speedMultiplier;

            if (isSpecial) {
                // Dreadnought Broadside Nova
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, bSpeed + 80, 0, '#ffee44', 10, false, 'bastion', 5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 4, bSpeed, -70, bColor, 6, false, 'bastion', 2.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, bSpeed, 70, bColor, 6, false, 'bastion', 2.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, bSpeed - 40, -150, '#ff6600', 5, false, 'bastion', 2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, bSpeed - 40, 150, '#ff6600', 5, false, 'bastion', 2 * dmgMultiplier));
            } else if (wl === 1) {
                bullets.push(new Bullet(this.x + this.width, this.y + 10, bSpeed, 0, bColor, 6, false, 'bastion', 2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 10, bSpeed, 0, bColor, 6, false, 'bastion', 2 * dmgMultiplier));
            } else if (wl === 2) {
                bullets.push(new Bullet(this.x + this.width, this.y + 8, bSpeed, 0, bColor, 6.5, false, 'bastion', 2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 8, bSpeed, 0, bColor, 6.5, false, 'bastion', 2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, bSpeed - 30, -75, '#ff8800', 5, false, 'bastion', 1.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, bSpeed - 30, 75, '#ff8800', 5, false, 'bastion', 1.5 * dmgMultiplier));
            } else if (wl === 3) {
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, bSpeed + 40, 0, '#ffee66', 8, false, 'bastion', 3 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 6, bSpeed, -60, bColor, 6, false, 'bastion', 2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 6, bSpeed, 60, bColor, 6, false, 'bastion', 2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, bSpeed - 50, -130, '#ff6600', 5, false, 'bastion', 1.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, bSpeed - 50, 130, '#ff6600', 5, false, 'bastion', 1.5 * dmgMultiplier));
            } else if (wl === 4) {
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, bSpeed + 60, 0, '#ffee66', 9, false, 'bastion', 4 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 8, bSpeed, -45, bColor, 6.5, false, 'bastion', 2.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 8, bSpeed, 45, bColor, 6.5, false, 'bastion', 2.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, bSpeed - 40, -110, '#ff6600', 5.5, false, 'bastion', 2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, bSpeed - 40, 110, '#ff6600', 5.5, false, 'bastion', 2 * dmgMultiplier));
            } else {
                // Supreme Bastion Vulcan
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, bSpeed + 80, 0, '#ffee22', 11, false, 'bastion', 5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 6, bSpeed + 20, -35, bColor, 7, false, 'bastion', 3 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 6, bSpeed + 20, 35, bColor, 7, false, 'bastion', 3 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, bSpeed - 30, -90, '#ff7700', 6, false, 'bastion', 2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, bSpeed - 30, 90, '#ff7700', 6, false, 'bastion', 2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 4, bSpeed - 60, -170, '#ff4400', 5, false, 'bastion', 1.8 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, bSpeed - 60, 170, '#ff4400', 5, false, 'bastion', 1.8 * dmgMultiplier));
            }
        } else if (ship === 'specter') {
            // ==========================================
            // SPECTER: Piercing Void Railgun Lance
            // Color: Void Violet (#b026ff), hyper-velocity
            // ==========================================
            this.muzzleFlashColor = '#b026ff';
            const sColor = '#b026ff';
            const sSpeed = 750 * speedMultiplier;

            if (isSpecial) {
                // Singularity Railgun Beam
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, sSpeed + 150, 0, '#f0c0ff', 10, false, 'specter', 6 * dmgMultiplier, true));
                bullets.push(new Bullet(this.x + this.width, this.y + 4, sSpeed + 50, -50, sColor, 5, false, 'specter', 3 * dmgMultiplier, true));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, sSpeed + 50, 50, sColor, 5, false, 'specter', 3 * dmgMultiplier, true));
            } else if (wl === 1) {
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, sSpeed, 0, sColor, 4.5, false, 'specter', 2 * dmgMultiplier, true));
            } else if (wl === 2) {
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2 - 6, sSpeed, 0, sColor, 5, false, 'specter', 2 * dmgMultiplier, true));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2 + 6, sSpeed, 0, sColor, 5, false, 'specter', 2 * dmgMultiplier, true));
            } else if (wl === 3) {
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, sSpeed + 50, 0, '#e088ff', 6.5, false, 'specter', 3 * dmgMultiplier, true));
                bullets.push(new Bullet(this.x + this.width, this.y + 4, sSpeed - 40, -45, sColor, 4, false, 'specter', 1.8 * dmgMultiplier, true));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, sSpeed - 40, 45, sColor, 4, false, 'specter', 1.8 * dmgMultiplier, true));
            } else if (wl === 4) {
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, sSpeed + 80, 0, '#f0c0ff', 8, false, 'specter', 4 * dmgMultiplier, true));
                bullets.push(new Bullet(this.x + this.width, this.y + 6, sSpeed, -30, sColor, 5, false, 'specter', 2.2 * dmgMultiplier, true));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 6, sSpeed, 30, sColor, 5, false, 'specter', 2.2 * dmgMultiplier, true));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, sSpeed - 50, -80, '#9900ee', 4, false, 'specter', 1.8 * dmgMultiplier, false));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, sSpeed - 50, 80, '#9900ee', 4, false, 'specter', 1.8 * dmgMultiplier, false));
            } else {
                // Supreme Specter Singularity Railgun
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, sSpeed + 120, 0, '#ffffff', 9.5, false, 'specter', 5.5 * dmgMultiplier, true));
                bullets.push(new Bullet(this.x + this.width, this.y + 4, sSpeed + 40, -25, sColor, 6, false, 'specter', 2.5 * dmgMultiplier, true));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, sSpeed + 40, 25, sColor, 6, false, 'specter', 2.5 * dmgMultiplier, true));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, sSpeed - 20, -70, '#d966ff', 4.5, false, 'specter', 2 * dmgMultiplier, true));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, sSpeed - 20, 70, '#d966ff', 4.5, false, 'specter', 2 * dmgMultiplier, true));
            }
        } else if (ship === 'tempest') {
            // ==========================================
            // TEMPEST: Rotary Cyclone Scatter Cannon
            // Color: Plasma Crimson (#ff2244), wide fan spreads
            // ==========================================
            this.muzzleFlashColor = '#ff2244';
            const tColor = '#ff2244';
            const tSpeed = 560 * speedMultiplier;

            if (isSpecial) {
                // Cyclone Hellstorm
                for (let a = -160; a <= 160; a += 45) {
                    bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, tSpeed, a, tColor, 5.5, false, 'tempest', 2.2 * dmgMultiplier));
                }
            } else if (wl === 1) {
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, tSpeed, 0, tColor, 4, false, 'tempest', 1.2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 4, tSpeed - 20, -75, tColor, 3.5, false, 'tempest', 1.0 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, tSpeed - 20, 75, tColor, 3.5, false, 'tempest', 1.0 * dmgMultiplier));
            } else if (wl === 2) {
                bullets.push(new Bullet(this.x + this.width, this.y + 6, tSpeed, -35, tColor, 4, false, 'tempest', 1.2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 6, tSpeed, 35, tColor, 4, false, 'tempest', 1.2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, tSpeed - 30, -100, tColor, 3.5, false, 'tempest', 1.0 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, tSpeed - 30, 100, tColor, 3.5, false, 'tempest', 1.0 * dmgMultiplier));
            } else if (wl === 3) {
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, tSpeed + 20, 0, '#ff6688', 5, false, 'tempest', 1.8 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 6, tSpeed, -55, tColor, 4, false, 'tempest', 1.3 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 6, tSpeed, 55, tColor, 4, false, 'tempest', 1.3 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, tSpeed - 40, -130, tColor, 3.5, false, 'tempest', 1.1 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, tSpeed - 40, 130, tColor, 3.5, false, 'tempest', 1.1 * dmgMultiplier));
            } else if (wl === 4) {
                bullets.push(new Bullet(this.x + this.width, this.y + 8, tSpeed + 10, -25, tColor, 4.5, false, 'tempest', 1.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 8, tSpeed + 10, 25, tColor, 4.5, false, 'tempest', 1.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 4, tSpeed - 10, -80, tColor, 4, false, 'tempest', 1.3 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, tSpeed - 10, 80, tColor, 4, false, 'tempest', 1.3 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, tSpeed - 50, -160, '#ff5577', 3.5, false, 'tempest', 1.1 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, tSpeed - 50, 160, '#ff5577', 3.5, false, 'tempest', 1.1 * dmgMultiplier));
            } else {
                // Supreme Tempest Cyclone Barrage (7-way spread)
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, tSpeed + 40, 0, '#ffffff', 6, false, 'tempest', 2.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 8, tSpeed + 20, -45, tColor, 5, false, 'tempest', 1.6 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 8, tSpeed + 20, 45, tColor, 5, false, 'tempest', 1.6 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 4, tSpeed - 10, -100, tColor, 4.5, false, 'tempest', 1.4 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, tSpeed - 10, 100, tColor, 4.5, false, 'tempest', 1.4 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, tSpeed - 40, -170, '#ff6688', 4, false, 'tempest', 1.2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, tSpeed - 40, 170, '#ff6688', 4, false, 'tempest', 1.2 * dmgMultiplier));
            }
        } else if (ship === 'warden') {
            // ==========================================
            // WARDEN: Acoustic Ion Resonance Shockwaves
            // Color: Acoustic Emerald (#00ff88), undulating waves
            // ==========================================
            this.muzzleFlashColor = '#00ff88';
            const wColor = '#00ff88';
            const wSpeed = 510 * speedMultiplier;

            if (isSpecial) {
                // Seismic Resonance Ring
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, wSpeed + 60, 0, '#aaffcc', 14, true, 'warden', 5 * dmgMultiplier, true));
                bullets.push(new Bullet(this.x + this.width, this.y + 4, wSpeed, -60, wColor, 8, true, 'warden', 2.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, wSpeed, 60, wColor, 8, true, 'warden', 2.5 * dmgMultiplier));
            } else if (wl === 1) {
                bullets.push(new Bullet(this.x + this.width, this.y + 4, wSpeed, 0, wColor, 5, true, 'warden', 1.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, wSpeed, 0, wColor, 5, true, 'warden', 1.5 * dmgMultiplier));
            } else if (wl === 2) {
                bullets.push(new Bullet(this.x + this.width, this.y + 4, wSpeed, 0, wColor, 6, true, 'warden', 1.8 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, wSpeed, 0, wColor, 6, true, 'warden', 1.8 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, wSpeed + 30, 0, '#33ffaa', 6, false, 'warden', 2 * dmgMultiplier));
            } else if (wl === 3) {
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, wSpeed + 40, 0, '#aaffcc', 7, true, 'warden', 2.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, wSpeed, -55, wColor, 5.5, true, 'warden', 1.8 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, wSpeed, 55, wColor, 5.5, true, 'warden', 1.8 * dmgMultiplier));
            } else if (wl === 4) {
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, wSpeed + 60, 0, '#ffffff', 9, true, 'warden', 3.5 * dmgMultiplier, true));
                bullets.push(new Bullet(this.x + this.width, this.y + 6, wSpeed, -70, wColor, 6, true, 'warden', 2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 6, wSpeed, 70, wColor, 6, true, 'warden', 2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, wSpeed - 40, -140, '#00cc66', 5, false, 'warden', 1.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, wSpeed - 40, 140, '#00cc66', 5, false, 'warden', 1.5 * dmgMultiplier));
            } else {
                // Supreme Warden Resonance Harmonizer
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, wSpeed + 80, 0, '#ffffff', 11, true, 'warden', 4.5 * dmgMultiplier, true));
                bullets.push(new Bullet(this.x + this.width, this.y + 4, wSpeed + 20, -50, wColor, 7, true, 'warden', 2.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, wSpeed + 20, 50, wColor, 7, true, 'warden', 2.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, wSpeed - 20, -110, '#33ffaa', 6, true, 'warden', 2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, wSpeed - 20, 110, '#33ffaa', 6, true, 'warden', 2 * dmgMultiplier));
            }
        } else if (ship === 'phantom' || ship === 'scout') {
            // ==========================================
            // PHANTOM: Intertwining Tachyon Double Helix
            // Color: Dual-Tone Magenta (#ff00aa) & Cyan (#00ffff)
            // ==========================================
            this.muzzleFlashColor = '#ff00aa';
            const pSpeed = 620 * speedMultiplier;

            if (isSpecial) {
                // Tachyon Quantum Weave
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed + 80, 0, '#ff00aa', 6, false, 'phantom', 3 * dmgMultiplier, false, 1, 0));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed + 80, 0, '#00ffff', 6, false, 'phantom', 3 * dmgMultiplier, false, -1, 0));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed + 80, 0, '#ffffff', 7, false, 'phantom', 3.5 * dmgMultiplier, false, 0));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, pSpeed, -100, '#ff00aa', 5, false, 'phantom', 2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, pSpeed, 100, '#00ffff', 5, false, 'phantom', 2 * dmgMultiplier));
            } else if (wl === 1) {
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed, 0, '#ff00aa', 4, false, 'phantom', 1.4 * dmgMultiplier, false, 1, 0));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed, 0, '#00ffff', 4, false, 'phantom', 1.4 * dmgMultiplier, false, -1, 0));
            } else if (wl === 2) {
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed, 0, '#ff00aa', 4.5, false, 'phantom', 1.5 * dmgMultiplier, false, 1, 0));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed, 0, '#00ffff', 4.5, false, 'phantom', 1.5 * dmgMultiplier, false, -1, 0));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed + 50, 0, '#ffffff', 4, false, 'phantom', 1.8 * dmgMultiplier));
            } else if (wl === 3) {
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed, 0, '#ff00aa', 5, false, 'phantom', 1.6 * dmgMultiplier, false, 1, 0));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed, 0, '#00ffff', 5, false, 'phantom', 1.6 * dmgMultiplier, false, -1, 0));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed, 0, '#ff66cc', 4.5, false, 'phantom', 1.5 * dmgMultiplier, false, 1, Math.PI));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed, 0, '#66ffff', 4.5, false, 'phantom', 1.5 * dmgMultiplier, false, -1, Math.PI));
            } else if (wl === 4) {
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed + 30, 0, '#ffffff', 6, false, 'phantom', 2.2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed, 0, '#ff00aa', 5, false, 'phantom', 1.8 * dmgMultiplier, false, 1, 0));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed, 0, '#00ffff', 5, false, 'phantom', 1.8 * dmgMultiplier, false, -1, 0));
                bullets.push(new Bullet(this.x + this.width, this.y + 4, pSpeed - 20, -75, '#ff00aa', 4, false, 'phantom', 1.4 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, pSpeed - 20, 75, '#00ffff', 4, false, 'phantom', 1.4 * dmgMultiplier));
            } else {
                // Supreme Phantom Chrono Helix
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed + 60, 0, '#ffffff', 7, false, 'phantom', 3 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed, 0, '#ff00aa', 5.5, false, 'phantom', 2.0 * dmgMultiplier, false, 1, 0));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed, 0, '#00ffff', 5.5, false, 'phantom', 2.0 * dmgMultiplier, false, -1, 0));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed, 0, '#ff66cc', 5, false, 'phantom', 1.8 * dmgMultiplier, false, 1.3, Math.PI));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, pSpeed, 0, '#66ffff', 5, false, 'phantom', 1.8 * dmgMultiplier, false, -1.3, Math.PI));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, pSpeed - 10, -110, '#ff00aa', 4.5, false, 'phantom', 1.6 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, pSpeed - 10, 110, '#00ffff', 4.5, false, 'phantom', 1.6 * dmgMultiplier));
            }
        } else {
            // ==========================================
            // NYXA (Default / Interceptor / Striker): Focused Cyan Pulse Laser
            // Color: Electric Cyan (#00f0ff), precision streams
            // ==========================================
            this.muzzleFlashColor = '#00f0ff';
            const nColor = '#00f0ff';
            const nSpeed = bulletSpeed;

            if (isSpecial) {
                // Supreme Overcharged Coelacanth Deluge
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, nSpeed + 80, 0, '#ffffff', 10, false, 'nyxa', 4 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 4, nSpeed + 40, -40, nColor, 7, false, 'nyxa', 2.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, nSpeed + 40, 40, nColor, 7, false, 'nyxa', 2.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, nSpeed, -90, '#00aaff', 5, false, 'nyxa', 2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, nSpeed, 90, '#00aaff', 5, false, 'nyxa', 2 * dmgMultiplier));
            } else if (wl === 1) {
                bullets.push(new Bullet(this.x + this.width, this.y + 6, nSpeed, 0, nColor, 4, false, 'nyxa', 1.2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 6, nSpeed, 0, nColor, 4, false, 'nyxa', 1.2 * dmgMultiplier));
            } else if (wl === 2) {
                bullets.push(new Bullet(this.x + this.width, this.y + 4, nSpeed, 0, nColor, 4.5, false, 'nyxa', 1.4 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, nSpeed, 0, nColor, 4.5, false, 'nyxa', 1.4 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 12, nSpeed + 20, 0, '#ffffff', 4, false, 'nyxa', 1.4 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 12, nSpeed + 20, 0, '#ffffff', 4, false, 'nyxa', 1.4 * dmgMultiplier));
            } else if (wl === 3) {
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, nSpeed + 40, 0, '#ffffff', 6, false, 'nyxa', 2.2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 4, nSpeed, 0, nColor, 4.5, false, 'nyxa', 1.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, nSpeed, 0, nColor, 4.5, false, 'nyxa', 1.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, nSpeed - 30, -60, '#00ccff', 3.5, false, 'nyxa', 1.2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, nSpeed - 30, 60, '#00ccff', 3.5, false, 'nyxa', 1.2 * dmgMultiplier));
            } else if (wl === 4) {
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, nSpeed + 60, 0, '#ffffff', 8, false, 'nyxa', 3.0 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 6, nSpeed + 20, -20, nColor, 5, false, 'nyxa', 1.8 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 6, nSpeed + 20, 20, nColor, 5, false, 'nyxa', 1.8 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, nSpeed - 30, -90, '#0099ff', 4, false, 'nyxa', 1.3 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, nSpeed - 30, 90, '#0099ff', 4, false, 'nyxa', 1.3 * dmgMultiplier));
            } else {
                // Supreme Nyxa Overcharged Nova
                bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, nSpeed + 90, 0, '#ffffff', 10, false, 'nyxa', 4.5 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 4, nSpeed + 40, -15, nColor, 6, false, 'nyxa', 2.2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 4, nSpeed + 40, 15, nColor, 6, false, 'nyxa', 2.2 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 2, nSpeed, -60, '#00ffff', 5, false, 'nyxa', 1.8 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 2, nSpeed, 60, '#00ffff', 5, false, 'nyxa', 1.8 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + 6, nSpeed - 40, -130, '#0088ff', 4, false, 'nyxa', 1.4 * dmgMultiplier));
                bullets.push(new Bullet(this.x + this.width, this.y + this.height - 6, nSpeed - 40, 130, '#0088ff', 4, false, 'nyxa', 1.4 * dmgMultiplier));
            }
        }

        // Firing muzzle sparks
        if (typeof Particle !== 'undefined') {
            for (let i = 0; i < 3; i++) {
                const p = new Particle(this.x + this.width + 2, this.y + this.height / 2 + (Math.random() - 0.5) * 16, this.muzzleFlashColor || '#00f0ff');
                p.vx = 70 + Math.random() * 50;
                p.vy = (Math.random() - 0.5) * 30;
                p.size = Math.random() * 2 + 1;
                p.decay = 4.0;
                particles.push(p);
            }
        }
    }

    addSecondaryCharge(amount, label = '') {
        if (!Number.isFinite(amount) || amount <= 0) return;
        const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
        const mult = mods ? (mods.rocketRechargeMultiplier || 1.0) : 1.0;
        const scaledAmt = amount * mult;
        const before = this.secondaryMeter;
        this.secondaryMeter = Math.min(this.secondaryMeterMax, this.secondaryMeter + scaledAmt);
        if (this.secondaryMeter >= this.secondaryMeterMax && before < this.secondaryMeterMax) {
            this.secondaryFlashTimer = 1.2;
            playSound('powerup');
            floatingTexts.push({
                text: 'SPECIAL READY',
                x: this.x + this.width / 2,
                y: this.y - 28,
                life: 1.5,
                color: '#b026ff',
                update(dt) { this.y -= 18 * dt; this.life -= dt; },
                draw() {
                    ctx.save();
                    ctx.globalAlpha = Math.max(0, this.life / 1.5);
                    ctx.fillStyle = this.color;
                    ctx.font = 'bold 12px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(this.text, this.x, this.y);
                    ctx.restore();
                }
            });
        } else if (label) {
            floatingTexts.push(new FloatingText(this.x + this.width / 2, this.y - 18, `+${Math.round(scaledAmt)} ${label}`, '#b026ff'));
        }
    }

    consumeSecondaryCharge(cost) {
        if (this.secondaryMeter < cost) {
            floatingTexts.push(new FloatingText(this.x + this.width / 2, this.y - 18, 'METER LOW', '#ff0033'));
            playSound('hit');
            return false;
        }
        this.secondaryMeter -= cost;
        return true;
    }

    updateSecondaryWeapons(dt) {
        if (this.secondaryFlashTimer > 0) this.secondaryFlashTimer -= dt;
        if (this.specialCooldown > 0) this.specialCooldown -= dt;

        const bombPressed = !!(keys['b'] || keys['B'] || keys['NumpadDivide'] || keys['/']);
        const missilePressed = !!(keys['m'] || keys['M'] || keys['NumpadMultiply'] || keys['*']);
        const specialPressed = this.isKeyPressed('special');

        if (bombPressed && !this.secondaryKeyLatch.bomb) this.fireSmartBomb();
        if (missilePressed && !this.secondaryKeyLatch.missile) this.fireHomingMissiles();
        if (specialPressed && !this.secondaryKeyLatch.special) this.activateShipSpecial();

        this.secondaryKeyLatch.bomb = bombPressed;
        this.secondaryKeyLatch.missile = missilePressed;
        this.secondaryKeyLatch.special = specialPressed;

        if (this.isSpecialActive) {
            this.specialActiveTimer -= dt;
            this.secondarySpecialPulse -= dt;

            if (this.secondarySpecialType === 'tempest' && this.secondarySpecialPulse <= 0) {
                this.secondarySpecialPulse = 0.12;
                this.spawnHellstormBurst();
            }

            if (this.secondarySpecialType === 'bastion') {
                this.invulnerable = Math.max(this.invulnerable, 0.15);
            }

            if (this.specialActiveTimer <= 0) {
                this.isSpecialActive = false;
                this.secondarySpecialType = null;
                this.wardenShieldDomeHP = 0;
                this.specialCooldown = Math.max(this.specialCooldown, 2.0);
            }
        }

        for (let i = this.secondaryDecoys.length - 1; i >= 0; i--) {
            const d = this.secondaryDecoys[i];
            d.life -= dt;
            d.x += d.vx * dt;
            d.y += Math.sin(gameTime * 6 + d.phase) * 18 * dt;
            if (d.life <= 0) this.secondaryDecoys.splice(i, 1);
        }
    }

    fireSmartBomb() {
        if (!this.consumeSecondaryCharge(50)) return;
        playSound('explosion');
        createExplosion(canvas.width / 2, canvas.height / 2, '#ff00aa', 60);

        let destroyed = 0;
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            const damage = 8;
            e.hp -= damage;
            createExplosion(e.x + e.width / 2, e.y + e.height / 2, '#ff00aa', 8);
            if (e.hp <= 0) {
                destroyed++;
                const comboMult = Combo.onKill();
                score += Math.floor(e.scoreValue * comboMult);
                if (window.Economy && Economy.shouldDrop(e.id, e.enemyType)) {
                    const drop = Economy.rollDrop(e.enemyType, biomeLevel);
                    const ecoDrop = Economy.createDrop(e.x + e.width / 2, e.y + e.height / 2, drop.type, drop.amount);
                    scrapDrops.push(new ScrapDrop(ecoDrop.x, ecoDrop.y, ecoDrop.type, drop.amount));
                }
                enemies.splice(i, 1);
            }
        }

        enemyBullets.length = 0;
        if (boss) boss.takeDamage(40);
        floatingTexts.push(new FloatingText(this.x + this.width / 2, this.y - 24, `SMART BOMB ${destroyed ? 'x' + destroyed : ''}`, '#ff00aa'));
    }

    fireHomingMissiles() {
        if (!this.consumeSecondaryCharge(30)) return;
        playSound('shoot', {weaponLevel: this.weaponLevel});
        const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
        const rocketDmgMult = mods ? (mods.rocketDamageMultiplier || 1.0) : 1.0;
        const aoeBonus = mods ? (mods.rocketAoeRadiusBonus || 0) : 0;
        const candidates = enemies.slice().sort((a, b) => Math.hypot(a.x - this.x, a.y - this.y) - Math.hypot(b.x - this.x, b.y - this.y));
        for (let i = 0; i < 3; i++) {
            const target = candidates[i] || boss || null;
            const missile = new Bullet(this.x + this.width, this.y + 4 + i * 6, 430, (i - 1) * 80, '#ffaa00', 2.5, true);
            missile.homingTarget = target;
            missile.homingStrength = 5.5;
            missile.damage = 6 * rocketDmgMult;
            missile.aoeRadiusBonus = aoeBonus;
            missile.secondaryType = 'missile';
            bullets.push(missile);
        }
        floatingTexts.push(new FloatingText(this.x + this.width / 2, this.y - 24, 'MISSILES AWAY', '#ffaa00'));
    }

    activateShipSpecial() {
        if (this.specialCooldown > 0 || this.isSpecialActive) return;
        if (!this.consumeSecondaryCharge(100)) return;

        const type = this.shipType === 'interceptor' || this.shipType === 'scout' ? 'striker' : this.shipType;
        this.secondarySpecialType = type;
        this.isSpecialActive = true;
        this.specialActiveTimer = 3.0;
        this.secondarySpecialPulse = 0;
        playSound('powerup');
        createExplosion(this.x + this.width / 2, this.y + this.height / 2, this.color, 22);

        if (type === 'phantom') {
            this.x = Math.min(canvas.width - this.width - 10, this.x + 200);
            this.invulnerable = Math.max(this.invulnerable, 1.2);
            this.specialActiveTimer = 0.8;
        } else if (type === 'bastion') {
            this.shield = Math.min(this.shieldMax, this.shield + 60);
            this.invulnerable = Math.max(this.invulnerable, 3.0);
        } else if (type === 'tempest') {
            this.spawnHellstormBurst();
        } else if (type === 'specter') {
            this.spawnGhostDecoys();
        } else if (type === 'warden') {
            const spRank = window.DS_UpgradeSystem ? (window.DS_UpgradeSystem.state.upgrades.specials || 0) : 0;
            this.wardenShieldDomeHP = 500 + (spRank >= 5 ? 300 : 0);
            this.specialActiveTimer = 4.0;
        }

        const names = { striker: 'OVERCHARGE', phantom: 'PHASE BLINK', bastion: 'FORTRESS', tempest: 'HELLSTORM', specter: 'GHOST SWARM', warden: 'GUARDIAN DOME' };
        floatingTexts.push(new FloatingText(this.x + this.width / 2, this.y - 30, names[type] || 'SPECIAL', '#b026ff'));
    }

    spawnHellstormBurst() {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 * i) / 16;
            const speed = 420;
            const round = new Bullet(cx, cy, Math.cos(angle) * speed, Math.sin(angle) * speed, '#ff0055', 5, true);
            round.damage = 2;
            round.secondaryType = 'hellstorm';
            bullets.push(round);
        }
    }

    spawnGhostDecoys() {
        this.secondaryDecoys.length = 0;
        for (let i = 0; i < 3; i++) {
            this.secondaryDecoys.push({
                x: this.x - 18 - i * 18,
                y: this.y + (i - 1) * 24,
                vx: -15,
                life: 5.0,
                phase: i * 1.7
            });
        }
        this.invulnerable = Math.max(this.invulnerable, 1.5);
    }

    dodge() {
        // Determine dodge direction based on current movement input
        let ddx = 0, ddy = 0;
        if (this.isKeyPressed('up')) ddy -= 1;
        if (this.isKeyPressed('down')) ddy += 1;
        if (this.isKeyPressed('left')) ddx -= 1;
        if (this.isKeyPressed('right')) ddx += 1;
        
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
        if (this.dodgeTimeout) clearTimeout(this.dodgeTimeout);
        this.dodgeTimeout = setTimeout(() => { this.isDodging = false; }, 100);
        
        playSound('powerup');
    }

    takeDamage(amt, hitX, hitY) {
        if (this.secondaryDecoys && this.secondaryDecoys.length > 0) {
            const decoy = this.secondaryDecoys.pop();
            createExplosion(decoy.x + this.width / 2, decoy.y + this.height / 2, '#b026ff', 14);
            playSound('hit');
            return;
        }
        if (this.invulnerable > 0) return;
        if (this.isPulledOut) return; // GRO-1003: No damage while repairing
        
        const difficultyConfig = getCurrentDifficultyConfig();
        const finalDmg = amt * difficultyConfig.playerDamageMultiplier;

        // Calculate directional impact angle (default 0 for oncoming attacks from right)
        const centerX = this.x + this.width * 0.48;
        const centerY = this.y + this.height * 0.5;
        let hitAngle = 0;
        if (hitX !== undefined && hitY !== undefined) {
            hitAngle = Math.atan2(hitY - centerY, hitX - centerX);
        }
        
        // Warden Guardian Protocol dome shield absorption
        if (this.shipType === 'warden' && this.isSpecialActive && this.wardenShieldDomeHP > 0) {
            this.wardenShieldDomeHP -= finalDmg;
            playSound('shield_hit');
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
        
        const shieldBefore = this.shield;
        this.shield -= finalDmg;
        if (shieldBefore > 0) {
            this.shieldHitFlash = 0.38;
            if (!this.shieldImpacts) this.shieldImpacts = [];
            this.shieldImpacts.push({
                angle: hitAngle,
                timer: 0.38,
                maxTimer: 0.38,
                intensity: Math.min(1.5, finalDmg / 15 + 0.6)
            });
            if (this.shieldImpacts.length > 6) this.shieldImpacts.shift();
        }

        if (typeof AdaptiveDirector !== 'undefined') {
            AdaptiveDirector.recordDamageTaken(finalDmg, this.shield, this.shieldMax);
        }
        
        const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
        this.invulnerable = 0.8 + (mods ? mods.shieldInvulnBonus : 0);
        
        playSound(shieldBefore > 0 ? 'shield_hit' : 'hit');
        if (shieldBefore > 0) {
            // Directional shield hit spark at exact perimeter boundary
            const hitR = 38;
            const sparkX = centerX + Math.cos(hitAngle) * hitR;
            const sparkY = centerY + Math.sin(hitAngle) * hitR;
            createExplosion(sparkX, sparkY, '#00e5ff', 12, 'shield_hit');
        } else {
            createExplosion(this.x + this.width/2, this.y + this.height/2, '#ffaa00', 8);
        }

        if (this.shield <= 0) {
            // GRO-1003: Pull-out system replaces death
            // Capture overkill before zeroing shield
            const overkill = Math.abs(this.shield);
            this.shield = 0;
            playSound('shield_break');
            
            if (!this.isPulledOut) {
                this.isPulledOut = true;
                this.canShoot = false;
                this.isFiring = false;
                this.pullOutMaxTimer = 15 + Math.min(10, overkill * 0.5);
                this.pullOutTimer = this.pullOutMaxTimer;
                if (typeof playSound === 'function') playSound('explosion');
                if (typeof createExplosion === 'function') createExplosion(this.x, this.y, '#ff6600', 30);
                
                // Trigger character audio and dialogue line explaining their repair
                const bLevel = typeof biomeLevel !== 'undefined' ? biomeLevel : (typeof LevelManager !== 'undefined' ? LevelManager.biome : 1);
                const character = this.character || (this.playerId === 2 ? 'L' : (this.playerId === 3 ? 'T' : 'D'));
                
                if (window.VoicePlayback && typeof VoicePlayback.play === 'function') {
                    VoicePlayback.play(bLevel, 'pull_out', character);
                }
                
                if (window.BanterEngine && bLevel > 0 && typeof banterEnabled !== 'undefined' && banterEnabled) {
                    const line = BanterEngine.getLine('pull_out', bLevel, character);
                    if (line) {
                        const lineText = (typeof line === 'object' && line.l) ? line.l : line;
                        if (typeof FloatingText !== 'undefined' && typeof floatingTexts !== 'undefined') {
                            floatingTexts.push(new FloatingText(this.x + this.width/2, this.y - 25, lineText, '#ff9900'));
                        }
                    }
                }
                
                if (window.Multiplayer && typeof Multiplayer.onPlayerPullOut === 'function' && this.playerId) {
                    Multiplayer.onPlayerPullOut(this.playerId);
                }

                // Check mutual knockout
                if (typeof checkMultiplayerRegroupCheckpoint === 'function') {
                    checkMultiplayerRegroupCheckpoint(0);
                }
            }
        }
    }

    draw() {
        // Pull-out visual — partially opaque ship retreating to bottom-left with repair bar
        if (this.isPulledOut) {
            ctx.save();
            ctx.translate(this.x, this.y);
            
            // Pulsing nanite repair glow
            const pulse = Math.sin(this.pullOutTimer * 5) * 0.35 + 0.65;
            ctx.shadowColor = `rgba(0, 220, 255, ${pulse * 0.8})`;
            ctx.shadowBlur = 18 * pulse;
            
            // Partially opaque ship (0.45)
            ctx.globalAlpha = 0.45 + Math.sin(this.pullOutTimer * 8) * 0.15;
            
            const pSprites = (typeof window !== 'undefined' && window.playerSprites) ? window.playerSprites : (typeof playerSprites !== 'undefined' ? playerSprites : {});
            if (this.shipType === 'phantom') sprite = pSprites[`player_phantom_${frameIdx}`];
            else if (this.shipType === 'bastion') sprite = pSprites[`player_bastion_${frameIdx}`];
            else if (this.shipType === 'tempest') sprite = pSprites[`player_tempest_${frameIdx}`];
            else if (this.shipType === 'specter') sprite = pSprites[`player_specter_${frameIdx}`];
            else if (this.shipType === 'warden') sprite = pSprites[`player_warden_${frameIdx}`];
            else if (this.shipType === 'scout') sprite = pSprites['scout_0'];
            else if (this.shipType === 'heavy') sprite = pSprites['heavy_0'];
            else if (this.shipType === 'interceptor') sprite = pSprites['interceptor_0'];
            else sprite = pSprites[`player_${frameIdx}`];
            
            const isRepImg = sprite && sprite.tagName !== 'CANVAS' && sprite.complete && sprite.naturalWidth > 0;
            const isRepCvs = sprite && sprite.tagName === 'CANVAS' && sprite.width > 0;
            const repSize = this.renderSize || 60;
            if (isRepImg || isRepCvs) {
                drawSpriteFrame(ctx, sprite, 0, 0, SPRITE_FRAME, SPRITE_FRAME, (this.width - repSize) / 2, (this.height - repSize) / 2, repSize, repSize);
            } else {
                ctx.fillStyle = '#00aacc';
                ctx.beginPath();
                ctx.moveTo(this.width * 0.85, this.height * 0.25); ctx.lineTo(0, 0); ctx.lineTo(0, this.height * 0.5); ctx.closePath();
                ctx.fill();
            }
            
            ctx.restore();
            
            // High-Contrast Cybernetic Repair Progress Bar
            ctx.save();
            const totalRepTime = this.pullOutMaxTimer || 15;
            const repairPct = Math.max(0, Math.min(1.0, 1.0 - (this.pullOutTimer / totalRepTime)));
            const barW = Math.max(74, Math.round(this.width * 1.3));
            const barH = 7;
            const barX = this.x + this.width / 2 - barW / 2;
            const barY = this.y + this.height + 6;

            // Background & cybernetic border
            ctx.fillStyle = 'rgba(6, 12, 24, 0.92)';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(barX, barY, barW, barH);

            // Progress fill
            const barColor = repairPct > 0.85 ? '#00ff88' : (repairPct > 0.4 ? '#00e5ff' : '#ff9900');
            ctx.fillStyle = barColor;
            ctx.fillRect(barX + 1, barY + 1, Math.max(0, (barW - 2) * repairPct), barH - 2);

            // Text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8.5px monospace';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 4;
            ctx.fillText(`REPAIRING: ${Math.floor(repairPct * 100)}%`, this.x + this.width / 2, barY + barH + 9);
            ctx.restore();
            
            return;
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

        // Draw thruster flame animation behind ship (GRO-879)
        const thrusterFrame = (Math.floor(gameTime * 12) % 2 === 0) ? 'thruster_0' : 'thruster_1';
        const thrusterSprite = vfxSprites[thrusterFrame];
        if (thrusterSprite) {
            const isThrusterImage = thrusterSprite.tagName !== 'CANVAS' && thrusterSprite.complete && thrusterSprite.naturalWidth > 0;
            const isThrusterCanvas = thrusterSprite.tagName === 'CANVAS' && thrusterSprite.width > 0;
            if (isThrusterImage || isThrusterCanvas) {
                ctx.save();
                const flameWidth = this.isBoosting ? Math.round(this.width * 1.45) : Math.round(this.width * 1.05);
                const flameHeight = Math.round(this.height * 0.95);
                const flameOffsetY = Math.round((this.height - flameHeight) / 2);
                ctx.drawImage(thrusterSprite, -flameWidth - 2, flameOffsetY, flameWidth, flameHeight);
                ctx.restore();
            }
        }

        // --- Apply Ship Color Cosmetic plating tint ---
        const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
        const cosmeticColor = mods ? mods.cosmetics.shipColor : 'default';

        // Sprite frame: select ship model base sprite or cycle animation
        let sprite;
        const pSprites = (typeof window !== 'undefined' && window.playerSprites) ? window.playerSprites : (typeof playerSprites !== 'undefined' ? playerSprites : {});
        const frameIdx = (Math.floor(gameTime * 6) % 2 === 0) ? '0' : '1';
        
        if (this.shipType === 'phantom') {
            sprite = pSprites[`player_phantom_${frameIdx}`];
        } else if (this.shipType === 'bastion') {
            sprite = pSprites[`player_bastion_${frameIdx}`];
        } else if (this.shipType === 'tempest') {
            sprite = pSprites[`player_tempest_${frameIdx}`];
        } else if (this.shipType === 'specter') {
            sprite = pSprites[`player_specter_${frameIdx}`];
        } else if (this.shipType === 'warden') {
            sprite = pSprites[`player_warden_${frameIdx}`];
        } else if (this.shipType === 'scout') {
            sprite = pSprites['scout_0'];
        } else if (this.shipType === 'heavy') {
            sprite = pSprites['heavy_0'];
        } else {
            sprite = pSprites[`player_${frameIdx}`];
        }

        const isImage = sprite && sprite.tagName !== 'CANVAS' && sprite.complete && sprite.naturalWidth > 0;
        const isCanvas = sprite && sprite.tagName === 'CANVAS' && sprite.width > 0;

        const spriteSize = this.renderSize || 62;
        const drawOffsetX = Math.round((this.width - spriteSize) / 2);
        const drawOffsetY = Math.round((this.height - spriteSize) / 2);

        if (isImage || isCanvas) {
            // Render sprite scaled according to ship class
            drawSpriteFrame(ctx, sprite, 0, 0, SPRITE_FRAME, SPRITE_FRAME, drawOffsetX, drawOffsetY, spriteSize, spriteSize);

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
                ctx.fillRect(drawOffsetX, drawOffsetY, spriteSize, spriteSize);
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
            ctx.moveTo(-2, 10);
            ctx.lineTo(this.width * 0.55, 10);
            ctx.lineTo(this.width - 4, this.height / 2);
            ctx.lineTo(this.width * 0.55, this.height - 10);
            ctx.lineTo(-2, this.height - 10);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#ff7700';
            ctx.beginPath();
            ctx.moveTo(-2, 12);
            ctx.lineTo(-10, this.height / 2);
            ctx.lineTo(-2, this.height - 12);
            ctx.closePath();
            ctx.fill();
        }

        // --- Draw Weapon Upgrade Attachments ---
        const sx = this.width / 44;
        const sy = this.height / 44;
        if (this.weaponLevel >= 2 && !this.isPulledOut) {
            ctx.save();
            ctx.fillStyle = '#445577';
            ctx.strokeStyle = '#223355';
            ctx.lineWidth = 1;
            // Top wing mount
            ctx.fillRect(10 * sx, 8 * sy, 12 * sx, 4 * sy);
            ctx.strokeRect(10 * sx, 8 * sy, 12 * sx, 4 * sy);
            // Bottom wing mount
            ctx.fillRect(10 * sx, this.height - (12 * sy), 12 * sx, 4 * sy);
            ctx.strokeRect(10 * sx, this.height - (12 * sy), 12 * sx, 4 * sy);
            
            const muzzlePulse = 0.5 + Math.sin(gameTime * 20) * 0.3;
            ctx.shadowBlur = 10 * muzzlePulse;
            ctx.shadowColor = '#00ffff';
            ctx.fillStyle = `rgba(0, 255, 255, ${0.6 + muzzlePulse * 0.4})`;
            // Top muzzle
            ctx.beginPath();
            ctx.arc(22 * sx, 10 * sy, 3 * sy, 0, Math.PI * 2);
            ctx.fill();
            // Bottom muzzle
            ctx.beginPath();
            ctx.arc(22 * sx, this.height - (10 * sy), 3 * sy, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        if (this.weaponLevel >= 3 && !this.isPulledOut) {
            ctx.save();
            ctx.fillStyle = '#223344';
            ctx.fillRect(16 * sx, 6 * sy, 16 * sx, 3 * sy);
            ctx.fillRect(16 * sx, this.height - (9 * sy), 16 * sx, 3 * sy);
            
            const chargePos = 32 * sx;
            const sparkPulse = Math.sin(gameTime * 25) * 2;
            ctx.fillStyle = '#00ffaa';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00ffaa';
            ctx.beginPath();
            ctx.arc(chargePos, 7.5 * sy, (1.5 + Math.abs(sparkPulse)*0.5) * sy, 0, Math.PI * 2);
            ctx.arc(chargePos, this.height - (7.5 * sy), (1.5 + Math.abs(sparkPulse)*0.5) * sy, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        if (this.weaponLevel >= 4 && !this.isPulledOut) {
            ctx.save();
            ctx.fillStyle = '#88aaee';
            ctx.fillRect(this.width - (8 * sx), this.height / 2 - (4 * sy), 8 * sx, 8 * sy);
            
            const arcPulse = Math.random();
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.4 + arcPulse * 0.6})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(this.width - (10 * sx), this.height / 2 - (8 * sy));
            ctx.quadraticCurveTo(this.width - (4 * sx) + arcPulse * 5, this.height / 2, this.width - (10 * sx), this.height / 2 + (8 * sy));
            ctx.stroke();
            
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffff';
            ctx.beginPath();
            ctx.arc(this.width - (2 * sx), this.height / 2, (4 + Math.sin(gameTime * 30) * 1.5) * sy, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        if (this.weaponLevel >= 5 && !this.isPulledOut) {
            ctx.save();
            ctx.strokeStyle = 'rgba(240, 0, 255, 0.6)';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff00ff';
            ctx.lineWidth = 2;
            
            ctx.translate(this.width / 2, this.height / 2);
            ctx.rotate(gameTime * 4);
            ctx.beginPath();
            ctx.ellipse(0, 0, 26 * sx, 12 * sy, 0, 0, Math.PI * 2);
            ctx.stroke();
            
            const coreGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 8 * sx);
            coreGrad.addColorStop(0, '#ffffff');
            coreGrad.addColorStop(0.5, 'rgba(255, 0, 255, 0.8)');
            coreGrad.addColorStop(1, 'rgba(0, 255, 255, 0)');
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 8 * sx, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Render Muzzle Flash burst on forward weapon hardpoints
        if (this.muzzleFlashTimer > 0 && !this.isPulledOut) {
            ctx.save();
            ctx.globalAlpha = Math.min(1.0, this.muzzleFlashTimer * 6.0);
            ctx.shadowColor = this.muzzleFlashColor || this.color || '#00ffff';
            ctx.shadowBlur = 14;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.width + 2, this.height / 2, 4 + this.muzzleFlashTimer * 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = this.muzzleFlashColor || this.color || '#00ffff';
            ctx.beginPath();
            ctx.arc(this.width + 2, this.height / 2, 7 + this.muzzleFlashTimer * 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // --- Draw Dynamic Shield Bubble & Directional Shield Impact VFX ---
        if (this.shield > 0 && !this.isPulledOut) {
            ctx.save();
            const cx = this.width / 2;
            const cy = this.height / 2;
            const shieldR = this.shipRules ? this.shipRules.shieldRadius : Math.max(40, Math.round(this.width * 0.72));

            // 1. Baseline Live Transparent Sheen (Subtle idle opacity so ship is clearly visible)
            const livePhase = gameTime * 2.5;
            const baseAlpha = 0.08 + Math.sin(livePhase) * 0.025;
            
            const sSprite = (typeof vfxSprites !== 'undefined') ? vfxSprites['shield'] : null;
            if (sSprite) {
                ctx.save();
                ctx.globalAlpha = baseAlpha;
                ctx.drawImage(sSprite, cx - shieldR, cy - shieldR, shieldR * 2, shieldR * 2);
                ctx.restore();
            }

            // Outer deflection energy perimeter boundary (crisp circular halo)
            ctx.save();
            ctx.strokeStyle = `rgba(0, 229, 255, ${baseAlpha * 1.6})`;
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.arc(cx, cy, shieldR, 0, Math.PI * 2);
            ctx.stroke();

            // Animated live static sheen: revolving harmonic pulse along perimeter
            ctx.setLineDash([6, 14, 4, 18]);
            ctx.lineDashOffset = -gameTime * 35;
            ctx.strokeStyle = 'rgba(120, 240, 255, 0.22)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx, cy, shieldR, 0, Math.PI * 2);
            ctx.stroke();

            // Orbiting ambient micro-nodes confirming active live shield grid
            for (let n = 0; n < 3; n++) {
                const nodeAngle = gameTime * 1.6 + (n * Math.PI * 2 / 3);
                const nx = cx + Math.cos(nodeAngle) * shieldR;
                const ny = cy + Math.sin(nodeAngle) * shieldR;
                ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.arc(nx, ny, 1.8, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            // 2. Directional Shield Impact Ripples (Localized Hexagonal Flare & Static Arcs)
            if (this.shieldImpacts && this.shieldImpacts.length > 0) {
                const impactSprite = (typeof vfxSprites !== 'undefined') ? vfxSprites['shield_impact'] : null;
                for (let k = 0; k < this.shieldImpacts.length; k++) {
                    const impact = this.shieldImpacts[k];
                    const p = Math.max(0, Math.min(1.0, 1.0 - (impact.timer / impact.maxTimer)));
                    const alpha = (1.0 - p) * impact.intensity;
                    const angle = impact.angle;
                    
                    // A. Sector-clipped hexagonal honeycomb ripple strictly on the impacted section
                    if (sSprite) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(cx, cy);
                        ctx.arc(cx, cy, shieldR + 12, angle - 0.92, angle + 0.92);
                        ctx.closePath();
                        ctx.clip();
                        
                        ctx.globalAlpha = Math.min(0.95, alpha * 1.5);
                        ctx.shadowColor = '#00ffff';
                        ctx.shadowBlur = 18;
                        ctx.drawImage(sSprite, cx - shieldR, cy - shieldR, shieldR * 2, shieldR * 2);
                        ctx.restore();
                    }
                    
                    // B. High-resolution directional impact sprite aligned at the impact angle
                    if (impactSprite) {
                        ctx.save();
                        ctx.translate(cx, cy);
                        // Rotating by angle + PI maps the sprite impact flash (-R, 0) directly to (cos(angle)*R, sin(angle)*R)
                        ctx.rotate(angle + Math.PI);
                        ctx.globalAlpha = Math.min(1.0, alpha * 1.6);
                        ctx.shadowColor = '#00e5ff';
                        ctx.shadowBlur = 22;
                        const impSize = (shieldR * 2) * (0.85 + p * 0.35);
                        
                        // Support progressive multi-frame animation strips (frame width = sprite height)
                        const totalFrames = Math.max(1, Math.floor(impactSprite.width / impactSprite.height));
                        if (totalFrames > 1) {
                            const frameW = impactSprite.height;
                            const frameIdx = Math.min(totalFrames - 1, Math.floor(p * totalFrames));
                            const sx = frameIdx * frameW;
                            ctx.drawImage(impactSprite, sx, 0, frameW, frameW, -impSize / 2, -impSize / 2, impSize, impSize);
                        } else {
                            ctx.drawImage(impactSprite, -impSize / 2, -impSize / 2, impSize, impSize);
                        }
                        ctx.restore();
                    }
                    
                    // C. Directional static charge ripple & electric arc along the shield perimeter
                    ctx.save();
                    const arcSpan = 0.5 + p * 0.65;
                    ctx.beginPath();
                    ctx.arc(cx, cy, shieldR, angle - arcSpan, angle + arcSpan);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
                    ctx.lineWidth = Math.max(1, 3.5 * (1.0 - p * 0.6));
                    ctx.shadowColor = '#00e5ff';
                    ctx.shadowBlur = 16;
                    ctx.stroke();
                    
                    // Secondary chromatic ripple boundary
                    ctx.beginPath();
                    ctx.arc(cx, cy, shieldR + p * 6, angle - arcSpan * 0.8, angle + arcSpan * 0.8);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.7})`;
                    ctx.lineWidth = 1.8;
                    ctx.stroke();
                    
                    // D. Localized impact flash burst at the exact point of contact
                    const ix = cx + Math.cos(angle) * shieldR;
                    const iy = cy + Math.sin(angle) * shieldR;
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.shadowColor = '#ffffff';
                    ctx.shadowBlur = 14;
                    ctx.beginPath();
                    ctx.arc(ix, iy, 4 + (1 - p) * 6, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = `rgba(0, 229, 255, ${alpha * 0.75})`;
                    ctx.shadowColor = '#00e5ff';
                    ctx.shadowBlur = 20;
                    ctx.beginPath();
                    ctx.arc(ix, iy, 8 + (1 - p) * 10, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Branching electric sparks
                    for (let s = 0; s < 3; s++) {
                        const sparkOffset = (s - 1) * 0.35 + Math.sin(p * 20 + s) * 0.15;
                        const sAngle = angle + sparkOffset;
                        const sx1 = cx + Math.cos(sAngle) * (shieldR - 2);
                        const sy1 = cy + Math.sin(sAngle) * (shieldR - 2);
                        const sx2 = cx + Math.cos(sAngle) * (shieldR + 8 + p * 8);
                        const sy2 = cy + Math.sin(sAngle) * (shieldR + 8 + p * 8);
                        ctx.strokeStyle = `rgba(180, 245, 255, ${alpha * 0.85})`;
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(sx1, sy1);
                        ctx.lineTo((sx1 + sx2) / 2 + (Math.sin(s * 7) * 4), (sy1 + sy2) / 2 + (Math.cos(s * 7) * 4));
                        ctx.lineTo(sx2, sy2);
                        ctx.stroke();
                    }
                    ctx.restore();
                }
            }

            ctx.restore();
        }

        // --- Draw Phased PowerUp Absorption Aura ---
        if (this.powerupAuraTimer > 0) {
            ctx.save();
            const pPct = Math.max(0, Math.min(1.0, 1.0 - (this.powerupAuraTimer / 0.6)));
            const auraColor = this.powerupAuraColor || '#00ffff';
            
            ctx.shadowColor = auraColor;
            ctx.shadowBlur = 18;
            ctx.globalAlpha = (1.0 - pPct) * 0.92;

            // Outer phased shockwave
            ctx.strokeStyle = auraColor;
            ctx.lineWidth = 2.5 * (1.0 - pPct);
            ctx.beginPath();
            ctx.arc(20, this.height / 2, 22 + pPct * 42, 0, Math.PI * 2);
            ctx.stroke();

            // Inner harmonic ring
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2 * (1.0 - pPct);
            ctx.beginPath();
            ctx.arc(20, this.height / 2, 14 + pPct * 26, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
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
                drawSpriteFrame(ctx, shieldSprite, 0, 0, SHIELD_FRAME, SHIELD_FRAME,
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

        // Specter ghost swarm decoys
        if (this.secondaryDecoys && this.secondaryDecoys.length > 0) {
            for (const decoy of this.secondaryDecoys) {
                ctx.save();
                ctx.globalAlpha = Math.max(0.2, decoy.life / 5) * 0.45;
                ctx.translate(decoy.x - this.x, decoy.y - this.y);
                ctx.strokeStyle = '#b026ff';
                ctx.shadowColor = '#b026ff';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.moveTo(0, 4);
                ctx.lineTo(25, 4);
                ctx.lineTo(40, this.height / 2);
                ctx.lineTo(25, this.height - 4);
                ctx.lineTo(0, this.height - 4);
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
            }
        }

        // Secondary meter ready flash
        if (this.secondaryMeter >= this.secondaryMeterMax || this.secondaryFlashTimer > 0) {
            const pulse = 0.35 + Math.sin(gameTime * 12) * 0.25;
            ctx.strokeStyle = `rgba(176, 38, 255, ${pulse})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(20, this.height / 2, 34, 0, Math.PI * 2);
            ctx.stroke();
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
        // Draw Orbiting Combat Drones
        if (mods && mods.droneCount > 0 && !this.isPulledOut) {
            for (let d = 0; d < mods.droneCount; d++) {
                const ang = (this.droneAngle || 0) + (d * Math.PI * 2 / mods.droneCount);
                const drX = 24 + Math.cos(ang) * 45;
                const drY = this.height / 2 + Math.sin(ang) * 35;

                // Connecting energy tether
                ctx.save();
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.28)';
                ctx.lineWidth = 1;
                ctx.setLineDash([2, 4]);
                ctx.beginPath();
                ctx.moveTo(24, this.height / 2);
                ctx.lineTo(drX, drY);
                ctx.stroke();
                ctx.setLineDash([]);

                // Drone chassis
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 8;
                ctx.fillStyle = '#0f1828';
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(drX, drY, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Core glowing micro-orb
                ctx.fillStyle = '#00ffff';
                ctx.beginPath();
                ctx.arc(drX, drY, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Thermal Weapon Overheat HUD Gauge (GDD §2.2 Supreme Nova)
        if (this.weaponHeat > 0) {
            const heatPct = Math.min(1.0, this.weaponHeat / 100);
            const barW = 36;
            const barH = 3;
            const bx = (this.width - barW) / 2;
            const by = this.height + 6;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(bx, by, barW, barH);
            ctx.fillStyle = this.isOverheated ? '#ff0033' : (heatPct > 0.75 ? '#ff6600' : '#ffcc00');
            ctx.fillRect(bx, by, barW * heatPct, barH);
            ctx.strokeStyle = this.isOverheated ? '#ff0033' : 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 0.8;
            ctx.strokeRect(bx, by, barW, barH);
        }

        ctx.restore();
    }
}

// Expose Player for the main game script after extraction.
window.Player = Player;
