// js/renderer/particles.js — Particle, FloatingText, EnvironmentParticle (GRO-1170)
// Extracted from renderer.js. Uses globals: ctx, canvas, GAME_WIDTH, GAME_HEIGHT

        // --- Particle Class ---
        class Particle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.color = color;
                this.vx = (Math.random() - 0.5) * 250;
                this.vy = (Math.random() - 0.5) * 250;
                this.size = Math.random() * 4 + 1;
                this.alpha = 1.0;
                this.decay = Math.random() * 1.5 + 1.0;
            }

            update(dt) {
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                this.alpha -= this.decay * dt;
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = Math.max(0, this.alpha);
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.size, this.size);
                ctx.restore();
            }
        }

        // --- FloatingText Class ---
        class FloatingText {
            constructor(x, y, text, color = '#00ff55') {
                this.x = x;
                this.y = y;
                this.text = text;
                this.color = color;
                this.alpha = 1.0;
                this.vy = -40; // floating upwards
                this.life = 1.0; // seconds
            }
            update(dt) {
                this.y += this.vy * dt;
                this.life -= dt;
                this.alpha = Math.max(0, this.life);
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(this.text, this.x, this.y);
                ctx.restore();
            }
        }

        function getTrailColorValue(name) {
            switch(name) {
                case 'cyan': return '#00ffff';
                case 'magenta': return '#ff0055';
                case 'emerald': return '#00ff55';
                case 'gold': return '#ffcc00';
                case 'purple': return '#ff00aa';
                default: return '#ff7700';
            }
        }


        // --- Environmental Particle System (all 10 biomes) ---
        // Replaces the old SeaParticle. Each biome gets a unique particle type
        // as defined in docs/missing-elements-style-guide.md §2.

        class EnvironmentParticle {
            constructor(type, x, y) {
                this.type = type;
                this.x = x;
                this.y = y;
                this.alive = true;
                this.life = 1.0;
                this.frame = 0;
                this._initByType();
            }

            _initByType() {
                switch (this.type) {
                    // --- B1: Abyssal Trench — Bioluminescent Drift ---
                    case 'mote':
                        this.size = 1.5 + Math.random() * 3;
                        this.speed = 15 + Math.random() * 25;
                        this.drift = Math.sin(Math.random() * Math.PI * 2) * 40;
                        this.phase = Math.random() * Math.PI * 2;
                        this.alpha = 0.4 + Math.random() * 0.5;
                        this.alphaPulseSpeed = 1.5 + Math.random() * 2.5;
                        this.color = '#00FFFF'; // cyan bioluminescent
                        this.glowSize = this.size * 4;
                        break;
                    case 'vent_smoke':
                        this.x = Math.random() * canvas.width * 0.6 + canvas.width * 0.2;
                        this.y = canvas.height + 5;
                        this.size = 6 + Math.random() * 12;
                        this.speed = 40 + Math.random() * 50;
                        this.drift = (Math.random() - 0.5) * 20;
                        this.alpha = 0.2 + Math.random() * 0.2;
                        this.color = Math.random() < 0.5 ? '#FF6600' : '#333333';
                        this.life = 3 + Math.random() * 2;
                        break;

                    // --- B2: Coral Graveyard — Rust Storm ---
                    case 'rust_flake':
                        this.size = 2 + Math.random() * 4;
                        this.speed = (Math.random() - 0.5) * 120;
                        this.drift = (Math.random() - 0.5) * 120;
                        this.alpha = 0.3 + Math.random() * 0.4;
                        this.color = '#CC5500';
                        this.life = 2 + Math.random() * 3;
                        this.angle = Math.random() * Math.PI * 2;
                        this.rotSpeed = (Math.random() - 0.5) * 4;
                        break;
                    case 'neon_glow':
                        this.x = Math.random() * canvas.width;
                        this.y = Math.random() * canvas.height * 0.6 + canvas.height * 0.2;
                        this.size = 40 + Math.random() * 40;
                        this.alpha = 0.06 + Math.random() * 0.08;
                        this.color = '#FF4488';
                        this.life = 0.3 + Math.random() * 0.5;
                        break;

                    // --- B3: Coelacanth Lair — Tesla Arcs ---
                    case 'tesla_bolt':
                        this.points = [];
                        const count = 4 + Math.floor(Math.random() * 5);
                        const sx = Math.random() * canvas.width;
                        const ex = sx + (Math.random() - 0.5) * 120;
                        const gap = (ex - sx) / count;
                        for (let i = 0; i <= count; i++) {
                            this.points.push({
                                x: sx + gap * i,
                                y: 150 + Math.random() * (canvas.height - 300)
                            });
                        }
                        this.alpha = 0.7 + Math.random() * 0.3;
                        this.color = '#00CCFF';
                        this.lineWidth = 1.5 + Math.random() * 2;
                        this.life = 0.3 + Math.random() * 0.3;
                        break;
                    case 'coolant_drip':
                        this.y = -10;
                        this.size = 3;
                        this.speed = 80 + Math.random() * 120;
                        this.drift = 0;
                        this.alpha = 0.5 + Math.random() * 0.3;
                        this.color = '#33CC55';
                        this.life = canvas.height / this.speed + 0.3;
                        break;

                    // --- B4: Nebula Drift — Plasma Currents ---
                    case 'plasma_ribbon':
                        this.y = 50 + Math.random() * (canvas.height - 100);
                        this.x = canvas.width + 20;
                        this.size = 8 + Math.random() * 30;
                        this.speed = 40 + Math.random() * 60;
                        this.drift = Math.sin(Math.random() * Math.PI * 2) * 60;
                        this.phase = Math.random() * Math.PI * 2;
                        this.alpha = 0.15 + Math.random() * 0.2;
                        this.color = Math.random() < 0.5 ? '#00BFFF' : '#FF00FF';
                        this.life = 5 + Math.random() * 3;
                        break;
                    case 'storm_flash':
                        this.x = -10;
                        this.y = -10;
                        this.size = 0;
                        this.alpha = 0.08;
                        this.color = '#FFFFFF';
                        this.life = 0.08;
                        break;

                    // --- B5: Ice Ring — Diamond Dust ---
                    case 'ice_crystal':
                        this.size = 3 + Math.random() * 6;
                        this.speed = 10 + Math.random() * 20;
                        this.drift = (Math.random() - 0.5) * 15;
                        this.alpha = 0.3 + Math.random() * 0.5;
                        this.color = '#EEEEFF';
                        this.glowColor = '#88CCFF';
                        this.angle = Math.random() * Math.PI * 2;
                        this.rotSpeed = 0.5 + Math.random() * 2;
                        this.sparkleTimer = Math.random() * 3;
                        this.sparkleInterval = 2 + Math.random() * 4;
                        break;
                    case 'prism_beam':
                        this.x = Math.random() * canvas.width;
                        this.y = -50;
                        this.size = 0;
                        this.alpha = 0.08 + Math.random() * 0.07;
                        this.color = '#88CCFF';
                        this.life = 8;
                        this.beamAngle = (Math.random() - 0.5) * 10;
                        break;

                    // --- B6: Fire Nebula — Ember Storm ---
                    case 'ember':
                        this.x = Math.random() * canvas.width;
                        this.y = canvas.height + 10;
                        this.size = 2 + Math.random() * 3;
                        this.speed = 60 + Math.random() * 100;
                        this.phase = Math.random() * Math.PI * 2;
                        this.rotRadius = 15 + Math.random() * 25;
                        this.rotSpeed = 3 + Math.random() * 5;
                        this.alpha = 0.5 + Math.random() * 0.4;
                        this.color = Math.random() < 0.5 ? '#FF4400' : '#FFAA00';
                        this.life = 3 + Math.random() * 2;
                        break;
                    case 'ash_cloud':
                        this.x = Math.random() * canvas.width;
                        this.y = Math.random() * canvas.height;
                        this.size = 100 + Math.random() * 100;
                        this.speed = 25;
                        this.drift = (Math.random() - 0.5) * 10;
                        this.alpha = 0.15 + Math.random() * 0.15;
                        this.color = '#443333';
                        this.life = 6 + Math.random() * 4;
                        break;

                    // --- B7: Storm Belt — Lightning Cage ---
                    case 'lightning_strike':
                        this.y = Math.random() * canvas.height;
                        this.x = Math.random() * canvas.width * 0.3;
                        this.size = 0;
                        this.alpha = 0.7 + Math.random() * 0.3;
                        this.color = '#FFFFFF';
                        this.glowColor = '#4466FF';
                        this.strikeLen = 40 + Math.random() * canvas.width * 0.5;
                        this.life = 0.15;
                        break;
                    case 'static_band':
                        this.y = Math.random() * canvas.height;
                        this.x = 0;
                        this.size = 4;
                        this.speed = 30 + Math.random() * 50;
                        this.alpha = 0.1 + Math.random() * 0.1;
                        this.color = '#4466FF';
                        this.life = 2 + Math.random() * 2;
                        break;
                    case 'rain_drop':
                        this.x = Math.random() * canvas.width;
                        this.y = -10;
                        this.size = 1;
                        this.speed = 200 + Math.random() * 300;
                        this.drift = 15;
                        this.alpha = 0.3 + Math.random() * 0.3;
                        this.color = '#CCDDFF';
                        this.life = canvas.height / this.speed + 0.2;
                        break;

                    // --- B8: Derelict Fleet — Drifting Debris ---
                    case 'debris':
                        this.size = 16 + Math.random() * 16;
                        this.speed = (Math.random() - 0.5) * 80;
                        this.drift = (Math.random() - 0.5) * 80;
                        this.alpha = 0.4 + Math.random() * 0.4;
                        this.color = '#555566';
                        this.edgeColor = '#886644';
                        this.angle = Math.random() * Math.PI * 2;
                        this.rotSpeed = 0.3 + Math.random() * 1.5;
                        this.life = 4 + Math.random() * 3;
                        break;
                    case 'beacon_flash':
                        this.x = Math.random() * canvas.width * 0.8;
                        this.y = Math.random() * canvas.height * 0.6;
                        this.size = 40;
                        this.alpha = 0.15;
                        this.color = '#FF2222';
                        this.life = 0.3;
                        this.onCycle = true;
                        break;
                    case 'coolant_gas':
                        this.x = Math.random() * canvas.width;
                        this.y = Math.random() * canvas.height * 0.6 + canvas.height * 0.2;
                        this.size = 10;
                        this.drift = (Math.random() - 0.5) * 30;
                        this.alpha = 0.08 + Math.random() * 0.12;
                        this.color = '#33FF33';
                        this.life = 3 + Math.random() * 2;
                        this.maxSize = this.size + 60;
                        break;

                    // --- B9: Xenomorph Hive — Organic Seepage ---
                    case 'acid_drip':
                        this.y = -10;
                        this.x = Math.random() * canvas.width;
                        this.size = 3;
                        this.speed = 60 + Math.random() * 90;
                        this.drift = 0;
                        this.alpha = 0.4 + Math.random() * 0.4;
                        this.color = '#33FF33';
                        this.life = canvas.height / this.speed + 0.2;
                        break;
                    case 'vein_pulse':
                        this.x = Math.random() * canvas.width;
                        this.y = Math.random() * canvas.height;
                        this.size = 2 + Math.random() * 4;
                        this.alpha = 0.2 + Math.random() * 0.3;
                        this.color = Math.random() < 0.5 ? '#6633AA' : '#CC6677';
                        this.life = 1.2;
                        this.pulsePhase = Math.random() * Math.PI * 2;
                        break;
                    case 'spore':
                        this.size = 2 + Math.random() * 3;
                        this.speed = (Math.random() - 0.5) * 40;
                        this.drift = (Math.random() - 0.5) * 40;
                        this.alpha = 0.15 + Math.random() * 0.15;
                        this.color = '#CC6677';
                        this.life = 5 + Math.random() * 3;
                        break;

                    // --- B10: Core Rift — Reality Tears ---
                    case 'code_stream':
                        this.x = Math.random() * canvas.width;
                        this.y = -20;
                        this.size = 6;
                        this.speed = 80 + Math.random() * 150;
                        this.drift = 0;
                        this.alpha = 0.2 + Math.random() * 0.3;
                        this.color = '#00FF41';
                        this.codeChar = String.fromCharCode(0x30 + Math.floor(Math.random() * 16)).toString(16).toUpperCase();
                        this.life = canvas.height / this.speed + 0.5;
                        break;
                    case 'rift_tear':
                        this.x = Math.random() * canvas.width * 0.7 + canvas.width * 0.1;
                        this.y = Math.random() * canvas.height * 0.5 + canvas.height * 0.2;
                        this.size = 20 + Math.random() * 40;
                        this.alpha = 0.3 + Math.random() * 0.3;
                        this.color = '#FF0088';
                        this.life = 0.8 + Math.random() * 1.2;
                        this.pulsePhase = Math.random() * Math.PI * 2;
                        break;
                    case 'echo_shard':
                        this.size = 8 + Math.random() * 12;
                        this.speed = 5 + Math.random() * 20;
                        this.drift = (Math.random() - 0.5) * 10;
                        this.alpha = 0.15;
                        this.color = '#FFFFFF';
                        this.life = 1.5;
                        break;

                    default:
                        // fallback: simple bioluminescent mote
                        this.size = 2 + Math.random() * 3;
                        this.speed = 15 + Math.random() * 25;
                        this.drift = Math.sin(Math.random() * Math.PI * 2) * 40;
                        this.phase = Math.random() * Math.PI * 2;
                        this.alpha = 0.4 + Math.random() * 0.5;
                        this.color = '#00FFFF';
                        this.life = 5;
                }
            }

            update(dt) {
                this.life -= dt;
                if (this.life <= 0) { this.alive = false; return; }

                switch (this.type) {
                    case 'mote':
                        this.x -= this.speed * dt;
                        this.phase += this.alphaPulseSpeed * dt;
                        const moteAlpha = 0.4 + Math.sin(this.phase) * 0.3;
                        this.alpha = Math.max(0.1, moteAlpha);
                        this.y += Math.sin(this.phase * 0.7) * this.drift * dt;
                        if (this.x < -10) { this.x = canvas.width + 10; this.y = Math.random() * canvas.height; }
                        break;
                    case 'vent_smoke':
                        this.y -= this.speed * dt;
                        this.x += this.drift * dt;
                        this.size += dt * 8;
                        this.alpha = Math.max(0, this.life / 4);
                        if (this.y < -30) this.alive = false;
                        break;
                    case 'rust_flake':
                        this.x += this.speed * dt;
                        this.y += this.drift * dt;
                        this.angle += this.rotSpeed * dt;
                        if (this.x < -30) this.x = canvas.width + 30;
                        if (this.x > canvas.width + 30) this.x = -30;
                        if (this.y < -30) this.y = canvas.height + 30;
                        if (this.y > canvas.height + 30) this.y = -30;
                        break;
                    case 'neon_glow':
                        this.alpha = Math.max(0, this.life / 0.5) * 0.08;
                        break;
                    case 'tesla_bolt':
                        break; // static bolt, dies on timeout
                    case 'coolant_drip':
                        this.y += this.speed * dt;
                        if (this.y > canvas.height) { this.alive = false; }
                        break;
                    case 'plasma_ribbon':
                        this.x -= this.speed * dt;
                        this.phase += dt;
                        this.y += Math.sin(this.phase) * this.drift * dt;
                        this.alpha = Math.max(0.05, this.life / 5 * 0.2);
                        if (this.x < -100) this.alive = false;
                        break;
                    case 'storm_flash':
                        break; // one-shot
                    case 'ice_crystal':
                        this.x -= this.speed * dt;
                        this.y += this.drift * dt;
                        this.angle += this.rotSpeed * dt;
                        this.sparkleTimer -= dt;
                        if (this.sparkleTimer <= 0) {
                            this.sparkleTimer = this.sparkleInterval;
                        }
                        if (this.x < -20) { this.x = canvas.width + 20; this.y = Math.random() * canvas.height; }
                        if (this.y < -20) this.y = canvas.height + 20;
                        if (this.y > canvas.height + 20) this.y = -20;
                        break;
                    case 'prism_beam':
                        this.beamAngle += Math.sin(this.life * 0.5) * dt * 10;
                        break;
                    case 'ember':
                        this.y -= this.speed * dt;
                        this.phase += this.rotSpeed * dt;
                        this.x += Math.sin(this.phase) * this.rotRadius * dt * 0.1;
                        if (this.y < -20) this.alive = false;
                        break;
                    case 'ash_cloud':
                        this.x -= this.speed * dt;
                        this.y += this.drift * dt;
                        if (this.x < -150) this.alive = false;
                        break;
                    case 'lightning_strike':
                        break; // one-shot
                    case 'static_band':
                        this.y += this.speed * dt;
                        if (this.y > canvas.height + 10) this.y = -10;
                        break;
                    case 'rain_drop':
                        this.y += this.speed * dt;
                        this.x += this.drift * dt;
                        if (this.y > canvas.height + 10) this.alive = false;
                        break;
                    case 'debris':
                        this.x += this.speed * dt;
                        this.y += this.drift * dt;
                        this.angle += this.rotSpeed * dt;
                        if (this.x < -50) this.x = canvas.width + 50;
                        if (this.x > canvas.width + 50) this.x = -50;
                        if (this.y < -50) this.y = canvas.height + 50;
                        if (this.y > canvas.height + 50) this.y = -50;
                        break;
                    case 'beacon_flash':
                        break; // one-shot
                    case 'coolant_gas':
                        this.x += this.drift * dt;
                        this.size = Math.min(this.maxSize, this.size + dt * 20);
                        this.alpha = Math.max(0.02, this.life / 3 * 0.10);
                        break;
                    case 'acid_drip':
                        this.y += this.speed * dt;
                        if (this.y > canvas.height) this.alive = false;
                        break;
                    case 'vein_pulse':
                        this.pulsePhase += dt * 4.5;
                        this.alpha = 0.2 + Math.sin(this.pulsePhase) * 0.3;
                        this.life = 1.2; // persist until manually removed
                        break;
                    case 'spore':
                        this.x += this.speed * dt;
                        this.y += this.drift * dt;
                        if (this.x < -20) this.x = canvas.width + 20;
                        if (this.x > canvas.width + 20) this.x = -20;
                        if (this.y < -20) this.y = canvas.height + 20;
                        if (this.y > canvas.height + 20) this.y = -20;
                        break;
                    case 'code_stream':
                        this.y += this.speed * dt;
                        if (this.y > canvas.height + 20) this.alive = false;
                        break;
                    case 'rift_tear':
                        this.pulsePhase += dt * 3;
                        this.alpha = 0.15 + Math.sin(this.pulsePhase) * 0.15;
                        this.life = Math.max(0, this.life); // countdown handled above
                        break;
                    case 'echo_shard':
                        this.x -= this.speed * dt;
                        this.y += this.drift * dt;
                        this.alpha = Math.max(0, this.life / 1.5 * 0.15);
                        break;
                }
            }

            draw() {} // No-op — rendered via offscreen buffer
        }

        // Spawning helper: creates biome-appropriate particles each frame
        function spawnBiomeParticles(dt) {
            if (!window.LevelManager || !LevelManager.currentLevelConfig) return;
            const settings = LevelManager.currentLevelConfig.particleSettings;
            if (!settings) return;

            // Accumulator-based spawning to avoid frame-rate dependency
            envSpawnAccum += dt;

            // 1. Primary particle (accumulated spawning)
            if (settings.primary) {
                const rate = settings.primary.rate;
                const type = settings.primary.type;
                while (envSpawnAccum >= rate) {
                    envSpawnAccum -= rate;
                    envParticles.push(new EnvironmentParticle(type));
                }
            }

            // 2. Secondary particle (chance or rate)
            if (settings.secondary) {
                const sec = settings.secondary;
                if (sec.rate) {
                    while (envSpawnAccum >= sec.rate) {
                        envSpawnAccum -= sec.rate;
                        envParticles.push(new EnvironmentParticle(sec.type));
                    }
                } else if (sec.chance) {
                    if (Math.random() < dt * sec.chance) {
                        envParticles.push(new EnvironmentParticle(sec.type));
                    }
                }
            }

            // 3. Tertiary particle (chance or rate)
            if (settings.tertiary) {
                const tert = settings.tertiary;
                if (tert.rate) {
                    while (envSpawnAccum >= tert.rate) {
                        envSpawnAccum -= tert.rate;
                        envParticles.push(new EnvironmentParticle(tert.type));
                    }
                } else if (tert.chance) {
                    if (Math.random() < dt * tert.chance) {
                        envParticles.push(new EnvironmentParticle(tert.type));
                    }
                }
            }

            // Cap accumulator
            envSpawnAccum = Math.min(envSpawnAccum, 1.0);
        }

        // Offscreen buffer for environmental particles (redrawn every 150ms)
        let envBuffer = null;

        function rebuildEnvBuffer(offCtx) {
            envParticles.forEach(p => {
                if (!p.alive) return;
                offCtx.save();
                offCtx.globalAlpha = p.alpha;
                switch (p.type) {
                    case 'mote':
                        offCtx.fillStyle = p.color;
                        offCtx.shadowColor = p.color;
                        offCtx.shadowBlur = p.glowSize;
                        offCtx.beginPath();
                        offCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        offCtx.fill();
                        break;
                    case 'vent_smoke':
                        offCtx.fillStyle = p.color;
                        offCtx.globalAlpha = Math.min(p.alpha, 0.25);
                        offCtx.beginPath();
                        offCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        offCtx.fill();
                        break;
                    case 'rust_flake':
                        offCtx.fillStyle = p.color;
                        offCtx.translate(p.x, p.y);
                        offCtx.rotate(p.angle);
                        offCtx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.6);
                        offCtx.rotate(-p.angle);
                        offCtx.translate(-p.x, -p.y);
                        break;
                    case 'neon_glow':
                        const ng = offCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                        ng.addColorStop(0, p.color);
                        ng.addColorStop(1, 'transparent');
                        offCtx.fillStyle = ng;
                        offCtx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
                        break;
                    case 'tesla_bolt':
                        if (p.points && p.points.length > 1) {
                            offCtx.strokeStyle = p.color;
                            offCtx.lineWidth = p.lineWidth;
                            offCtx.shadowColor = p.color;
                            offCtx.shadowBlur = 6;
                            offCtx.beginPath();
                            offCtx.moveTo(p.points[0].x, p.points[0].y);
                            for (let i = 1; i < p.points.length; i++) {
                                offCtx.lineTo(p.points[i].x, p.points[i].y);
                            }
                            offCtx.stroke();
                            offCtx.shadowBlur = 0;
                            // White core
                            offCtx.strokeStyle = '#FFFFFF';
                            offCtx.lineWidth = p.lineWidth * 0.4;
                            offCtx.stroke();
                        }
                        break;
                    case 'coolant_drip':
                        offCtx.fillStyle = p.color;
                        offCtx.fillRect(p.x - 2, p.y - 6, 4, 12);
                        break;
                    case 'plasma_ribbon':
                        const grd = offCtx.createLinearGradient(p.x, p.y - p.size, p.x, p.y + p.size);
                        grd.addColorStop(0, 'transparent');
                        grd.addColorStop(0.3, p.color === '#00BFFF' ? '#00BFFF' : '#FF00FF');
                        grd.addColorStop(0.7, p.color === '#00BFFF' ? '#FF00FF' : '#00BFFF');
                        grd.addColorStop(1, 'transparent');
                        offCtx.fillStyle = grd;
                        offCtx.fillRect(p.x - p.size * 0.3, p.y - p.size, p.size * 0.6, p.size * 2);
                        break;
                    case 'storm_flash':
                        offCtx.fillStyle = '#FFFFFF';
                        offCtx.fillRect(0, 0, canvas.width, canvas.height);
                        break;
                    case 'ice_crystal':
                        // Hexagonal crystal
                        offCtx.fillStyle = p.color;
                        offCtx.translate(p.x, p.y);
                        offCtx.rotate(p.angle);
                        offCtx.beginPath();
                        for (let i = 0; i < 6; i++) {
                            const a = (Math.PI / 3) * i;
                            const r = p.size;
                            if (i === 0) offCtx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                            else offCtx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                        }
                        offCtx.closePath();
                        offCtx.fill();
                        if (p.sparkleTimer > 0) {
                            offCtx.fillStyle = p.glowColor;
                            offCtx.shadowColor = p.glowColor;
                            offCtx.shadowBlur = p.size * 2;
                            offCtx.fill();
                            offCtx.shadowBlur = 0;
                        }
                        offCtx.rotate(-p.angle);
                        offCtx.translate(-p.x, -p.y);
                        break;
                    case 'prism_beam':
                        offCtx.save();
                        offCtx.translate(p.x, canvas.height/2);
                        offCtx.rotate((p.beamAngle || 0) * Math.PI / 180);
                        const beamGrd = offCtx.createLinearGradient(0, -canvas.height, 0, canvas.height);
                        beamGrd.addColorStop(0, 'transparent');
                        beamGrd.addColorStop(0.3, '#EEEEFF');
                        beamGrd.addColorStop(0.5, '#88CCFF');
                        beamGrd.addColorStop(0.7, '#EEEEFF');
                        beamGrd.addColorStop(1, 'transparent');
                        offCtx.fillStyle = beamGrd;
                        offCtx.fillRect(-2, -canvas.height, 4, canvas.height * 2);
                        offCtx.restore();
                        break;
                    case 'ember':
                        offCtx.fillStyle = p.color;
                        offCtx.shadowColor = p.color;
                        offCtx.shadowBlur = p.size * 3;
                        offCtx.beginPath();
                        offCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        offCtx.fill();
                        offCtx.shadowBlur = 0;
                        break;
                    case 'ash_cloud':
                        const ashGrd = offCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                        ashGrd.addColorStop(0, p.color);
                        ashGrd.addColorStop(0.7, p.color);
                        ashGrd.addColorStop(1, 'transparent');
                        offCtx.fillStyle = ashGrd;
                        offCtx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
                        break;
                    case 'lightning_strike':
                        offCtx.strokeStyle = p.color;
                        offCtx.lineWidth = 2;
                        offCtx.shadowColor = p.glowColor;
                        offCtx.shadowBlur = 10;
                        offCtx.beginPath();
                        offCtx.moveTo(p.x, p.y);
                        let cx = p.x;
                        let cy = p.y;
                        const steps = 8;
                        const segLen = p.strikeLen / steps;
                        for (let i = 0; i < steps; i++) {
                            cx += segLen;
                            cy += (Math.random() - 0.5) * 60;
                            offCtx.lineTo(cx, cy);
                        }
                        offCtx.stroke();
                        offCtx.shadowBlur = 0;
                        // White core
                        offCtx.strokeStyle = '#FFFFFF';
                        offCtx.lineWidth = 0.8;
                        offCtx.stroke();
                        break;
                    case 'static_band':
                        offCtx.fillStyle = p.color;
                        offCtx.fillRect(0, p.y, canvas.width, p.size);
                        break;
                    case 'rain_drop':
                        offCtx.fillStyle = p.color;
                        offCtx.fillRect(p.x, p.y, 1.5, 8);
                        break;
                    case 'debris':
                        offCtx.fillStyle = p.color;
                        offCtx.translate(p.x, p.y);
                        offCtx.rotate(p.angle);
                        offCtx.fillRect(-p.size/2, -p.size/3, p.size, p.size/1.5);
                        offCtx.fillStyle = p.edgeColor;
                        offCtx.fillRect(-p.size/2, -p.size/6, p.size, 2);
                        offCtx.rotate(-p.angle);
                        offCtx.translate(-p.x, -p.y);
                        break;
                    case 'beacon_flash':
                        const bg = offCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                        bg.addColorStop(0, p.color);
                        bg.addColorStop(1, 'transparent');
                        offCtx.fillStyle = bg;
                        offCtx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
                        break;
                    case 'coolant_gas':
                        const cgGrd = offCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                        cgGrd.addColorStop(0, p.color);
                        cgGrd.addColorStop(1, 'transparent');
                        offCtx.fillStyle = cgGrd;
                        offCtx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
                        break;
                    case 'acid_drip':
                        offCtx.fillStyle = p.color;
                        offCtx.shadowColor = p.color;
                        offCtx.shadowBlur = 4;
                        offCtx.fillRect(p.x - 3, p.y - 7, 6, 14);
                        offCtx.shadowBlur = 0;
                        break;
                    case 'vein_pulse':
                        offCtx.fillStyle = p.color;
                        offCtx.beginPath();
                        offCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        offCtx.fill();
                        break;
                    case 'spore':
                        offCtx.fillStyle = p.color;
                        offCtx.beginPath();
                        offCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        offCtx.fill();
                        break;
                    case 'code_stream':
                        offCtx.fillStyle = p.color;
                        offCtx.font = 'bold 10px monospace';
                        offCtx.textAlign = 'center';
                        offCtx.fillText(p.codeChar, p.x, p.y);
                        break;
                    case 'rift_tear':
                        offCtx.strokeStyle = p.color;
                        offCtx.lineWidth = 2;
                        offCtx.shadowColor = p.color;
                        offCtx.shadowBlur = 12;
                        // Draw jagged crack
                        offCtx.beginPath();
                        offCtx.moveTo(p.x - p.size * 0.8, p.y - p.size * 0.6);
                        for (let i = 1; i < 6; i++) {
                            const rx = p.x - p.size * 0.8 + (Math.random() * p.size * 1.6);
                            const ry = p.y - p.size * 0.6 + (i / 6) * p.size * 1.2;
                            offCtx.lineTo(rx, ry);
                        }
                        offCtx.stroke();
                        offCtx.shadowBlur = 0;
                        break;
                    case 'echo_shard':
                        offCtx.fillStyle = p.color;
                        offCtx.globalAlpha = p.alpha;
                        offCtx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
                        break;
                    default:
                        offCtx.fillStyle = p.color || '#00FFFF';
                        offCtx.fillRect(p.x, p.y, p.size || 2, p.size || 2);
                }
                offCtx.restore();
            });
        }

