// --- Enemy Bullet Class ---
class EnemyBullet {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = '#ff3300';
        this.size = 5;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Rotate: enemy bullets move left-to-right (vx is negative)
        const angle = Math.atan2(this.vy, this.vx);
        ctx.rotate(angle);

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
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.globalAlpha = 0.9;
            // Center the 1024×1024 sprite, scale to renderSize
            const sw = sprite.naturalWidth;
            const sh = sprite.naturalHeight;
            ctx.drawImage(sprite,
                0, 0, sw, sh,                           // source rect (full sprite)
                -renderSize / 2, -renderSize / 2,       // dest x, y
                renderSize, renderSize);                 // dest w, h
        }

        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

// --- Enemy Ship Classes ---
class Enemy {
    constructor(type) {
        this.type = type;
        this.x = canvas.width + 50;
        this.y = 50 + Math.random() * (canvas.height - 100);
        this.width = 30;
        this.height = 30;
        this.age = 0;

        if (type === 'scout') {
            this.speed = 150;
            this.hp = 1;
            this.scoreValue = 100;
            this.color = '#ff5500';
            this.startY = this.y;
        } else if (type === 'interceptor') {
            this.speed = 280;
            this.hp = 1;
            this.scoreValue = 150;
            this.color = '#ff0055';
        } else if (type === 'heavy') {
            this.speed = 80;
            this.hp = 4;
            this.scoreValue = 300;
            this.color = '#9a33cc';
            this.shootCooldown = 1.2 + Math.random() * 0.8;
            this.shootTimer = this.shootCooldown;
        } else {
            this.speed = 180;
            this.hp = 2;
            this.scoreValue = 50;
            this.color = '#33cc55';
        }
    }

    update(dt) {
        this.age += dt;

        if (this.type === 'scout') {
            this.x -= this.speed * dt;
            this.y = this.startY + Math.sin(this.age * 5) * 60;
        } else if (this.type === 'interceptor') {
            this.x -= this.speed * dt;
        } else if (this.type === 'heavy') {
            this.x -= this.speed * dt;
            this.shootTimer -= dt;
            if (this.shootTimer <= 0) {
                this.shoot();
                this.shootTimer = this.shootCooldown;
            }
        } else if (this.type === 'boss_minion') {
            this.x -= this.speed * dt;
            this.y += Math.sin(this.age * 8) * 80 * dt;
        }
    }

    shoot() {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const bulletSpeed = -220;

        enemyBullets.push(new EnemyBullet(this.x, this.y + this.height/2, bulletSpeed, (dy/dist) * 100));
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        const sprite = enemySprites[this.type];
        const hasSprite = sprite && sprite.complete && sprite.naturalWidth > 0;

        if (hasSprite) {
            // Map each type to appropriate render size (sprites are 1024x1024)
            const sizes = { scout: 36, interceptor: 36, heavy: 44, boss_minion: 32 };
            const size = sizes[this.type] || 36;
            ctx.drawImage(sprite, 0, 0, size, size);
        } else {
            // Fallback: colored shapes if sprite not loaded
            ctx.fillStyle = this.color;
            if (this.type === 'scout') {
                ctx.beginPath();
                ctx.moveTo(30, 15); ctx.lineTo(10, 0); ctx.lineTo(0, 15); ctx.lineTo(10, 30);
                ctx.closePath(); ctx.fill();
            } else if (this.type === 'interceptor') {
                ctx.beginPath();
                ctx.moveTo(30, 15); ctx.lineTo(0, 5); ctx.lineTo(10, 15); ctx.lineTo(0, 25);
                ctx.closePath(); ctx.fill();
            } else if (this.type === 'heavy') {
                ctx.beginPath();
                ctx.moveTo(30, 5); ctx.lineTo(10, 0); ctx.lineTo(0, 15); ctx.lineTo(10, 30);
                ctx.lineTo(30, 25); ctx.lineTo(20, 15);
                ctx.closePath(); ctx.fill();
            } else if (this.type === 'boss_minion') {
                ctx.beginPath();
                ctx.arc(15, 15, 14, 0, Math.PI * 2); ctx.fill();
            }
        }

        ctx.restore();
    }
}

// --- Boss Fighter Class (Cyber Coelacanth) ---
class Boss {
    constructor() {
        this.x = canvas.width + 100;
        this.y = canvas.height / 2 - 80;
        this.width = 180;
        this.height = 140;
        this.hpMax = 120;
        this.hp = 120;
        this.state = 'intro';
        this.stateTimer = 2;
        this.bobTimer = 0;
        this.shootTimer = 1.0;
        this.laserWarningTimer = 0;
        this.color = '#305080';
        this.shieldColor = '#ff00aa';
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
            // Spawn scrap drops on boss state transition
            if (typeof scrapDrops !== 'undefined') {
                const tx = this.x + 30;
                const ty = this.y + 60;
                scrapDrops.push(new ScrapDrop(tx, ty, 'cell'));
                if (Math.random() < 0.5) {
                    scrapDrops.push(new ScrapDrop(tx, ty, 'fragment'));
                }
            }

            if (this.state === 'idle') {
                if (this.hp < this.hpMax / 2 && Math.random() > 0.4) {
                    this.state = 'laser_charge';
                    this.stateTimer = 1.5;
                    playSound('laser_charge');
                } else {
                    this.state = 'rage';
                    this.stateTimer = 4;
                }
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
        if (this.state === 'idle') {
            enemyBullets.push(new EnemyBullet(this.x + 10, this.y + 50, -260, -80));
            enemyBullets.push(new EnemyBullet(this.x + 10, this.y + 70, -280, 0));
            enemyBullets.push(new EnemyBullet(this.x + 10, this.y + 90, -260, 80));
        } else if (this.state === 'rage') {
            const dy = player.y - (this.y + 70);
            const dx = player.x - (this.x + 10);
            const dist = Math.sqrt(dx*dx + dy*dy);
            enemyBullets.push(new EnemyBullet(this.x + 10, this.y + 70, (dx/dist) * 320, (dy/dist) * 320));

            if (Math.random() < 0.25 && enemies.length < 5) {
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

        if (this.hp <= 0) {
            this.hp = 0;
            bossDefeated = true;
            playSound('explosion');

            // Spawn Data Fragments on Boss defeat!
            if (typeof scrapDrops !== 'undefined') {
                for (let k = 0; k < 5; k++) {
                    scrapDrops.push(new ScrapDrop(this.x + 50 + (Math.random()-0.5)*50, this.y + 60 + (Math.random()-0.5)*50, 'fragment'));
                }
            }

            for (let i = 0; i < 35; i++) {
                setTimeout(() => {
                    createExplosion(this.x + Math.random()*150, this.y + Math.random()*120, '#ff3300', 15);
                    playSound('explosion');
                }, i * 100);
            }

            setTimeout(() => {
                playVictoryCinematic();
            }, 3500);
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // --- Sprite-based boss rendering ---
        // boss_0.png is 1280x896; render scaled to 190x133 (matching original boss footprint)
        const sprite = bossSprites['boss'];
        const hasSprite = sprite && sprite.complete && sprite.naturalWidth > 0;
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
                ctx.drawImage(sprite, 0, 0, renderW, renderH);
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = 'rgba(255, 0, 30, 0.25)';
                ctx.fillRect(0, 0, renderW, renderH);
                ctx.globalCompositeOperation = 'source-over';
            } else if (this.state === 'intro') {
                // Intro: fade in from the right edge
                const introProgress = Math.min(1, (canvas.width - 210 - this.x) / 100 + 1);
                ctx.globalAlpha = Math.min(1, introProgress);
                ctx.drawImage(sprite, 0, 0, renderW, renderH);
                ctx.globalAlpha = 1;
            } else {
                ctx.drawImage(sprite, 0, 0, renderW, renderH);
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
