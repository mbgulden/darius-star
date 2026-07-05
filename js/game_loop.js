// game_loop.js — Core game orchestrator
// Extracted from index.html by Ned (GRO-1100)
// Contains: game setup, state, entity pools, collision,
//           resetGame, update(), draw(), loop(), input handling

// --- Game Setup ---
initializeRendererBuffers();

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 100));

// Check for redirect from ship select page
window.addEventListener('DOMContentLoaded', () => {
    if (window.LevelManager && !LevelManager.initialized) {
        LevelManager.initialized = true;
        LevelManager.init();
    }
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('launch') === 'true') {
        const url = new URL(window.location.href);
        url.searchParams.delete('launch');
        window.history.replaceState({}, '', url.toString());
        
        // GRO-1154: Initialize audio for auto-launch (fix silent gameplay)
        initAudio();
        // GRO-1926: Start chiptune immediately so the user hears something
        // before AudioManager finishes preloading the cinematic MP3s.
        startMenuMusic();
        // Fallback: ensure AudioContext is resumed on first user interaction
        // (browsers may keep context suspended until user gesture)
        const resumeOnGesture = () => {
            initAudio();
            // GRO-865: Start preloading cinematic music tracks on first interaction
            if (typeof AudioManager !== 'undefined') {
                AudioManager.init().then(function() {
                    // GRO-1926: Preload then crossfade chiptune → MP3 (only if
                    // currently on a screen that wants menu music).
                    AudioManager.preloadAll().then(function() {
                        if (typeof crossfadeToMenuTrack === 'function' &&
                            typeof currentScreen !== 'undefined' &&
                            currentScreen !== SCREENS.PLAYING) {
                            crossfadeToMenuTrack('ambient_deep_space', 2.0);
                        }
                    });
                });
            }
            document.removeEventListener('click', resumeOnGesture);
            document.removeEventListener('keydown', resumeOnGesture);
            document.removeEventListener('touchstart', resumeOnGesture);
        };
        document.addEventListener('click', resumeOnGesture);
        document.addEventListener('keydown', resumeOnGesture);
        document.addEventListener('touchstart', resumeOnGesture);
        
        // Immediately start playing
        setTimeout(() => {
            currentScreen = SCREENS.PLAYING;
            stopMenuMusic();
            stopCreditsMusic();

            let activeSaveSlot = parseInt(localStorage.getItem('dariusStar_activeSlot') || '0');
            let isNewGame = localStorage.getItem('dariusStar_isNewGame') === 'true';
            if (isNewGame && window.CampaignSave) {
                const newSave = CampaignSave.createBlank();
                const shipSel = localStorage.getItem('dariusStar_shipSelection');
                if (shipSel) {
                    const parsed = JSON.parse(shipSel);
                    if (parsed && parsed.p1 && parsed.p1.shipId) {
                        newSave.ship = parsed.p1.shipId;
                    }
                    if (parsed && parsed.difficulty) {
                        newSave.difficulty = parsed.difficulty;
                    }
                }
                newSave.difficulty = newSave.difficulty || localStorage.getItem('dariusStar_difficulty') || 'normal';
                newSave.lives = getDifficultyConfig(newSave.difficulty).startingLives;
                CampaignSave.save(activeSaveSlot, newSave);
                localStorage.setItem('dariusStar_isNewGame', 'false');
            }

            resetGame();
            // Initialize campaign systems
            if (window.Multiplayer) Multiplayer.init();
            if (window.Economy) Economy.init();
            if (window.BanterEngine) {
                BanterEngine.init(window.Multiplayer ? Multiplayer.count : 1);
                BanterEngine.trigger('level_start', 1);
                // GRO-1054: Wire scrap/upgrade events into banter system
                BanterEngine.initScrapEvents();
            }
            if (window.CampaignSave && window.CampaignSave.pendingCorruptionNotice) {
                window.CampaignSave.pendingCorruptionNotice = false;
                if (typeof DialogueSequence !== 'undefined') {
                    activeDialogue = new DialogueSequence([
                        {
                            speaker: 'Lyra',
                            portrait: 'lyra_reactive',
                            text: 'Warning: I detected corrupted telemetry save data. It has been repaired and reset to a fresh state to prevent a system crash.'
                        }
                    ]);
                }
            }
        }, 100);
    }
});
resizeCanvas();


// Game state variables
let score = 0;
let gameOver = false;
let singlePlayerPullOutTimer = 0; // GRO-1469: 30s gameOver fallback for stuck pull-out
let gameWon = false;
let paused = false;
let lastTime = 0;
let pdgZaps = [];
let gameTime = 0;
let bossSpawned = false;
let sirenTimer = 0;
let bossesDefeated = 0; // Track how many bosses killed for per-biome progression
const BOSS_SCORE_THRESHOLDS = [290, 590, 890, 1190, 1490, 1790, 2090, 2390, 2690, 2990];
let biomeLevel = 1;  // Economy segment tracking
let currentNGLevel = 0; // NG+ level (0 = normal run)

// --- Polish system variables (GRO-990: screen shake tints, hit-flash, overheat, low-health) ---
let screenFlashAlpha = 0;
let screenFlashColor = '#FFFFFF';
const hitFlashes = [];
let overheatWarning = false;
let overheatCritical = false;
let overheatTimer = 0;
let lowHealthPulseTimer = 0;
let glitchTimer = 0;
let glitchCooldown = 0;
let ngPlusRun = false;  // Whether current run is NG+
let _winTransition = false; // Flag for win screen transition

// --- Narrative Flags & Ending System (GRO-1009) ---
// Tracks player story choices throughout the game. Flags accrue from dialogue
// choices and biome milestones. At Biome 10 climax, determineEnding() picks
// one of three endings: sacrifice, transcendence, dominion.
const narrativeFlags = {
    lyra_trust: 0,           // Lyra dialogue choices
    coelacanth_mercy: 0,     // Mercy shown to Coelacanth minions/boss
    power_lust: 0,           // Aggressive/dominant choices
    dreamer_connection: 0,   // Connection to the Dreamer entity
    sacrifice_seen: 0        // Lyra sacrifice foreshadowing witnessed
};
let selectedEnding = null;   // 'sacrifice' | 'transcendence' | 'dominion'
let endingEligible = [];     // Which endings are eligible (for player choice)




// --- Game Entity Pools ---
let initialShip = 'striker';
try {
    const shipSel = localStorage.getItem('dariusStar_shipSelection');
    if (shipSel) {
        const parsed = JSON.parse(shipSel);
        if (parsed && parsed.shipId) {
            initialShip = parsed.shipId;
        }
    }
} catch(e) {}
let player = new Player(initialShip);
let remotePlayers = [];  // P2-P4 ship instances (GRO-958 multiplayer)
const bullets = [];
const enemyBullets = [];
const enemies = [];
const powerups = [];
const particles = [];
const scrapDrops = [];
const floatingTexts = [];
let runScrap = 0;
let runScrapSaved = false;
const scrapNarrativeMilestonesPlayed = new Set();
let enemyIdCounter = 0;  // Unique IDs for Economy.shouldDrop()

// Procedural variation seed (GRO-1006): set at run start, stored in save
let runSeed = Math.floor(Math.random() * 2147483648);

// Parallax background layers (image-based)
const bgLayers = [
    new ParallaxLayer('bg_1', 12, 0, 0.55, canvas.height / 768),      // Far: nebula cloud
    new ParallaxLayer('bg_1', 55, 0, 0.45, canvas.height / 450)        // Mid: city silhouette
];

// Environmental particle system (all 10 biomes)
const envParticles = [];
let envSpawnAccum = 0;
// Seed initial particles for the starting biome (biome 1 = Abyssal Trench)
for (let i = 0; i < 45; i++) envParticles.push(new EnvironmentParticle('mote'));

let boss = null;
let enemySpawnTimer = 1.2;

const vfxExplosions = [];









function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    if (!paused && !gameOver && !gameWon && !bossIntroPlaying && !victoryVideoPlaying) {
        gameTime += dt;
        Combo.update(dt);
        update(dt);
    }

    draw();
    requestAnimationFrame(loop);
}

function update(dt) {
    // Screen transition overlay fading
    if (targetScreen) {
        transitionTimer += dt;
        const halfDuration = TRANSITION_DURATION / 2;
        if (transitionTimer < halfDuration) {
            screenFadeAlpha = transitionTimer / halfDuration;
        } else if (transitionTimer >= halfDuration && transitionTimer < TRANSITION_DURATION) {
            if (currentScreen !== targetScreen) {
                currentScreen = targetScreen;
                if (currentScreen === SCREENS.PLAYING) {
                    stopMenuMusic();
                    stopCreditsMusic();
                    // Start cinematic music management (GRO-865)
                    if (typeof AudioManager !== 'undefined') {
                        AudioManager.tick();
                    }
                    // Start engine hum (GRO-866)
                    startEngineHum();
                    if (!_winTransition) {
                        resetGame();
                    } else {
                        _winTransition = false;
                        gameWon = true;
                        
                        // GRO-2170: Serialize, base64 encode, and save total scrap to localStorage upon biome completion
                        if (typeof saveTotalScrapOnBiomeCompletion === 'function') {
                            saveTotalScrapOnBiomeCompletion();
                        }
                        
                        // Game completion: save state and trigger NGPlus.start()!
                        if (window.CampaignSave) {
                            let activeSaveSlot = parseInt(localStorage.getItem('dariusStar_activeSlot') || '0');
                            const currentSave = CampaignSave.load(activeSaveSlot) || CampaignSave.createBlank();
                            // Save the final completed campaign state
                            CampaignSave.autosave(activeSaveSlot, {
                                ...currentSave,
                                biome: 10,
                                score: score,
                                scrap: currentSave.scrap || 0,
                                runScrap: runScrap,
                                ship: player.shipType || currentSave.ship || 'striker',
                                weaponLevel: player.weaponLevel,
                                shieldMax: player.shieldMax,
                                shield: player.shield,
                                difficulty: difficulty,
                                ngLevel: currentNGLevel,
                                inGameFlags: narrativeFlags,
                                wave: currentSave.wave || 1,
                                lives: currentSave.lives || 2,
                                upgrades: currentSave.upgrades || {}
                            });
                            
                            // Upgrade the slot to New Game+
                            if (window.NGPlus) {
                                const ngState = NGPlus.start(activeSaveSlot);
                                if (ngState) {
                                    CampaignSave.save(activeSaveSlot, ngState);
                                    console.log(`Successfully completed game! Upgraded slot ${activeSaveSlot} to NG+${ngState.ngLevel}`);
                                }
                            }
                        }
                    }
                } else if (currentScreen === SCREENS.CREDITS) {
                    stopMenuMusic();
                    startCreditsMusic();
                    creditsScrollY = 0;
                    creditsHoldTimer = 0;
                } else if (currentScreen === SCREENS.CINEMATIC) {
                    stopMenuMusic();
                    stopCreditsMusic();
                    cinematicTime = 0;
                    playSound('victory_fanfare');
                } else {
                    stopCreditsMusic();
                    // Stop cinematic music when leaving gameplay (GRO-865)
                    if (typeof AudioManager !== 'undefined') {
                        AudioManager.stop();
                    }
                    // Stop engine hum (GRO-866)
                    stopEngineHum();
                    startMenuMusic();
                }
            }
            screenFadeAlpha = 1 - (transitionTimer - halfDuration) / halfDuration;
        } else {
            currentScreen = targetScreen;
            targetScreen = null;
            screenFadeAlpha = 0;
        }
    }

    if (currentScreen !== SCREENS.PLAYING) {
        if (currentScreen === SCREENS.CREDITS) {
            creditsScrollY += 35 * dt;
        } else if (currentScreen === SCREENS.CINEMATIC) {
            cinematicTime += dt;
            if (cinematicTime >= 20 && !targetScreen) {
                // If boss was defeated, show victory screen instead of credits
                if (bossDefeated) {
                    _winTransition = true;
                    transitionToScreen(SCREENS.PLAYING);
                } else {
                    transitionToScreen(SCREENS.CREDITS);
                }
            }
        } else if (currentScreen === SCREENS.BRIEFING) {
            // GRO-936: Update briefing typewriter animation
            updateBriefing(dt);
        }
        updateTitleBackground(dt);
        return;
    }

    updateActiveBiome(dt, score);
    
    // GRO-865: Cinematic music track switching (score thresholds, boss detection)
    if (typeof AudioManager !== 'undefined') {
        AudioManager.tick();
    }
    
    // GRO-1028: Audio drama systems — biome ambient loop & story beats
    // GRO-1040: Respect audioTunnelsEnabled toggle
    // GRO-1042: Streamer Mode — also gate audio tunnels
    if ((typeof audioTunnelsEnabled === 'undefined' || audioTunnelsEnabled) && !streamerMode) {
        updateBiomeAmbientLoop(dt);
        updateAudioStoryBeat(dt);
    }

    if (activeDialogue) {
        activeDialogue.update(dt);
        if (activeDialogue.isBlocking()) {
            bgLayers.forEach(layer => layer.update(dt));
            stars.forEach(star => star.update(dt));
            for (let i = envParticles.length - 1; i >= 0; i--) {
                envParticles[i].update(dt);
                if (!envParticles[i].alive) envParticles.splice(i, 1);
            }
            
            for (let i = vfxExplosions.length - 1; i >= 0; i--) {
                vfxExplosions[i].update(dt);
                if (!vfxExplosions[i].alive) vfxExplosions.splice(i, 1);
            }
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update(dt);
                if (!particles[i].alive) particles.splice(i, 1);
            }
            for (let i = floatingTexts.length - 1; i >= 0; i--) {
                floatingTexts[i].update(dt);
                if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
            }
            
            if (uiBiome) uiBiome.innerText = activeBiomeName;
            if (uiNavigator) {
                if (stormActive) {
                    uiNavigator.innerText = 'OFFLINE (COMA)';
                    uiNavigator.style.color = '#ff0033';
                } else if (pathfinderActive) {
                    uiNavigator.innerText = 'LYRA (RESONATING)';
                    uiNavigator.style.color = '#00ffff';
                } else {
                    uiNavigator.innerText = 'LYRA (ONLINE)';
                    uiNavigator.style.color = '#00ff55';
                }
            }
            return;
        }
    } else {
        if (typeof document !== 'undefined') {
            const hud = document.getElementById('lyra-hud');
            if (hud && hud.style.display !== 'none') {
                hud.style.display = 'none';
                hud.classList.remove('lyra-hud-active');
            }
        }
    }

    if (bossDefeated) {
        bgLayers.forEach(layer => layer.update(dt));
        stars.forEach(star => star.update(dt));
        for (let i = envParticles.length - 1; i >= 0; i--) {
            envParticles[i].update(dt);
            if (!envParticles[i].alive) envParticles.splice(i, 1);
        }
        player.invulnerable = 999;
        player.update(dt);
        if (boss) boss.update(dt);
        
        bullets.forEach(b => b.update(dt));
        enemyBullets.forEach(eb => eb.update(dt));
        for (let i = vfxExplosions.length - 1; i >= 0; i--) {
            vfxExplosions[i].update(dt);
            if (!vfxExplosions[i].alive) vfxExplosions.splice(i, 1);
        }
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update(dt);
            if (!particles[i].alive) particles.splice(i, 1);
        }
        return;
    }

    bgLayers.forEach(layer => layer.update(dt));
    stars.forEach(star => star.update(dt));
    for (let i = envParticles.length - 1; i >= 0; i--) {
        envParticles[i].update(dt);
        if (!envParticles[i].alive) envParticles.splice(i, 1);
    }
    // Spawn biome-appropriate environmental particles
    spawnBiomeParticles(dt);

    // Offscreen buffer lazy-render: rebuild star/env buffers on interval
    starBuffer.renderTimer += dt;
    if (starBuffer.renderTimer >= starBuffer.renderInterval) {
        starBuffer.rebuild(rebuildStarBuffer);
        starBuffer.renderTimer = 0;
    }
    envBuffer.renderTimer += dt;
    if (envBuffer.renderTimer >= envBuffer.renderInterval) {
        envBuffer.rebuild(rebuildEnvBuffer);
        envBuffer.renderTimer = 0;
    }

    player.update(dt);
    // Update engine hum based on player speed (GRO-866)
    const engineSpeedPct = player.speed / 290; // max speed is 290 (scout ship)
    updateEngineHum(engineSpeedPct);
    for (const rp of remotePlayers) {
        if (!rp.isPulledOut || rp.pullOutTimer > 0) rp.update(dt);
    }

    // --- Overheat detection (§6.3) — Supreme Nova (weapon 5) held fire tracking ---
    const playerFiring = keys[player.inputKeys.fire] && player.weaponLevel === 5;
    if (playerFiring && !player.isSpecialActive) {
        overheatTimer += dt;
        overheatWarning = overheatTimer >= 3.0;
        overheatCritical = overheatTimer >= 4.0;
        if (overheatCritical) {
            // Overheat trigger: screen flash, weapon reset, damage, smoke
            screenFlashAlpha = Math.max(screenFlashAlpha, 0.08);
            screenFlashColor = '#FF0000';
            player.weaponLevel = 1;
            player.takeDamage(1);
            overheatTimer = 0;
            overheatWarning = false;
            overheatCritical = false;
            // Smoke particles from ship
            for (let s = 0; s < 8; s++) {
                particles.push(new Particle(
                    player.x + player.width/2, player.y + player.height/2, '#888888'
                ));
            }
        }
    } else {
        // Cool down when not firing at level 5
        if (overheatTimer > 0) overheatTimer = Math.max(0, overheatTimer - dt * 2);
        if (overheatTimer === 0) { overheatWarning = false; overheatCritical = false; }
    }

    // --- Low-health pulse & glitch timers (§6.4) ---
    const hpPct = player.shield / player.shieldMax;

    // GRO-958: Multiplayer — process joins/leaves, sync remote player state
    if (window.Multiplayer) {
        Multiplayer.update(dt);
        // P2 joins by pressing Enter/NumpadEnter during gameplay
        if (keys['Enter'] && Multiplayer.count < Multiplayer.maxPlayers && !remotePlayers.find(rp => rp.playerId === 2)) {
            let p2ShipType = 'interceptor';
            try {
                if (typeof localStorage !== 'undefined') {
                    const storedSelection = localStorage.getItem('dariusStar_shipSelection');
                    if (storedSelection) {
                        const parsed = JSON.parse(storedSelection);
                        if (parsed.p2 && parsed.p2.shipId) {
                            p2ShipType = parsed.p2.shipId;
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to load P2 ship selection on drop-in:", e);
            }
            Multiplayer.requestJoin(p2ShipType);
            Multiplayer.processJoins(biomeLevel);
            const rp2 = new Player(p2ShipType, 2);
            rp2.x = 120; rp2.y = 200;
            rp2.isRemote = true;
            remotePlayers.push(rp2);
        }
        // P3 joins by pressing Numpad3  (key '3')
        if (keys['3'] && Multiplayer.count < Multiplayer.maxPlayers && !remotePlayers.find(rp => rp.playerId === 3)) {
            Multiplayer.requestJoin('interceptor');
            Multiplayer.processJoins(biomeLevel);
            const rp3 = new Player('interceptor', 3);
            rp3.x = 140; rp3.y = 240;
            rp3.isRemote = true;
            remotePlayers.push(rp3);
        }
        // P4 joins by pressing key '4'
        if (keys['4'] && Multiplayer.count < Multiplayer.maxPlayers && !remotePlayers.find(rp => rp.playerId === 4)) {
            Multiplayer.requestJoin('interceptor');
            Multiplayer.processJoins(biomeLevel);
            const rp4 = new Player('interceptor', 4);
            rp4.x = 160; rp4.y = 280;
            rp4.isRemote = true;
            remotePlayers.push(rp4);
        }
        // Sync remote player shield/state back to Multiplayer module
        for (const rp of remotePlayers) {
            const mp = Multiplayer.players.find(p => p.id === rp.playerId);
            if (mp && mp.alive) {
                mp.shield = rp.shield;
                mp.x = rp.x;
                mp.y = rp.y;
                if (rp.isPulledOut && !mp._wasPulledOut) {
                    mp._wasPulledOut = true;
                    Multiplayer.requestLeave(rp.playerId);
                }
                if (!rp.isPulledOut) mp._wasPulledOut = false;
            }
        }
        // Process any queued leaves
        const leaveLine = Multiplayer.processLeaves();
        if (leaveLine) {
            // Re-sync remotePlayers array by removing any players that are no longer in Multiplayer.players
            remotePlayers = remotePlayers.filter(rp => 
                Multiplayer.players.some(mp => mp.id === rp.playerId && mp.alive && mp.status !== "leaving")
            );
            if (typeof FloatingText !== 'undefined') {
                floatingTexts.push(new FloatingText(canvas.width/2, 60, leaveLine, '#ff6600'));
            } else {
                floatingTexts.push({ text: leaveLine, x: canvas.width/2, y: 60, life: 3.0, color: '#ff6600' });
            }
        }
    }
    if (hpPct < 0.25) {
        lowHealthPulseTimer += dt;
        // Glitch lines at <10% HP: cycle 100ms glitch, then 1-2s cooldown
        if (hpPct < 0.10) {
            if (glitchTimer > 0) {
                glitchTimer -= dt; // glitch active, count down
            } else {
                glitchCooldown -= dt;
                if (glitchCooldown <= 0) {
                    glitchTimer = 0.10; // trigger 100ms glitch
                    glitchCooldown = 1.0 + Math.random() * 2.0; // 1-3s until next
                }
            }
        }
    } else {
        lowHealthPulseTimer = 0;
        glitchTimer = 0;
        glitchCooldown = 1.0;
    }

    if (!bossSpawned && !bossIntroPlaying) {
        // Feeds wave spawner: LevelManager handles queuing and spawning of enemies
        // (no direct spawning code needed here, LevelManager.update does it)

        // Preload boss assets when approaching the current biome's boss threshold
        const nextBossIdx = bossesDefeated;
        const preloadThreshold = nextBossIdx < 10 ? BOSS_SCORE_THRESHOLDS[nextBossIdx] - 100 : 2900;
        if (score >= preloadThreshold && !bossAssetsLoaded) {
            preloadBossAssets();
        }

        // Check if current level has a boss trigger condition
        if (window.LevelManager && LevelManager.currentLevelConfig && LevelManager.currentLevelConfig.bossTrigger) {
            if (!bossSpawned) {
                playBossIntro();
            }
        }
    } else {
        if (sirenTimer > 0) {
            sirenTimer -= dt;
            if (Math.floor(sirenTimer * 10) % 4 === 0) {
                playSound('siren');
            }
            if (sirenTimer <= 0) {
                boss = new Boss();
            }
        } else if (boss) {
            boss.update(dt);
        }
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.update(dt);
        if (b.x > canvas.width + 40 || b.x < -40 || b.y < -40 || b.y > canvas.height + 40) {
            bullets.splice(i, 1);
        }
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const eb = enemyBullets[i];
        eb.update(dt);
        
        const ebBox = { x: eb.x - eb.size, y: eb.y - eb.size, width: eb.size*2, height: eb.size*2 };
        if (checkCollision(ebBox, player)) {
            const style = eb.type === 'missile' ? 'missile' : 'red_projectile';
            createExplosion(eb.x, eb.y, eb.color, 10, style);
            player.takeDamage(12);
            enemyBullets.splice(i, 1);
            continue;
        }
        // GRO-958: Check remote players too
        let ebHitRemote = false;
        for (const rp of remotePlayers) {
            if (checkCollision(ebBox, rp)) {
                rp.takeDamage(12);
                ebHitRemote = true;
                break;
            }
        }
        if (ebHitRemote) {
            enemyBullets.splice(i, 1);
            continue;
        }

        if (eb.x < -20) {
            enemyBullets.splice(i, 1);
        }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.update(dt);

        if (checkCollision(e, player)) {
            player.takeDamage(20);
            createExplosion(e.x + e.width/2, e.y + e.height/2, e.color, 10);
            enemies.splice(i, 1);
            continue;
        }
        // GRO-958: Check remote players
        let enemyHitRemote = false;
        for (const rp of remotePlayers) {
            if (checkCollision(e, rp)) {
                rp.takeDamage(20);
                createExplosion(e.x + e.width/2, e.y + e.height/2, e.color, 10);
                enemyHitRemote = true;
                break;
            }
        }
        if (enemyHitRemote) {
            enemies.splice(i, 1);
            continue;
        }

        for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            const bBox = { x: b.x - b.size, y: b.y - 2, width: b.size*2, height: 4 };
            if (checkCollision(bBox, e)) {
                const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
                const dmg = b.damage || ((player.weaponLevel >= 4 ? 2 : 1) * (mods ? mods.weaponDamageMultiplier : 1.0));
                e.hp -= dmg;

                // Map projectile type to varied explosion/impact VFX
                let style = 'blue_laser';
                if (b.secondaryType === 'missile') {
                    style = 'missile';
                } else {
                    const wl = b.weaponLevel || player.weaponLevel;
                    if (wl === 1 || wl === 2) {
                        style = 'blue_laser';
                    } else if (wl === 3) {
                        style = 'green_laser';
                    } else if (wl === 4) {
                        style = 'purple_laser';
                    } else if (wl >= 5) {
                        style = 'white_laser';
                    }
                }
                createExplosion(b.x, b.y, b.color, 8, style);

                bullets.splice(j, 1);
                playSound('hit');
                // Spawn hit-flash (§6.2) at impact point
                spawnHitFlash(e.x + e.width/2, e.y + e.height/2, e.enemyType);

                if (e.hp <= 0) {
                    createExplosion(e.x + e.width/2, e.y + e.height/2, e.color, 12);
                    playSound('explosion');
                    const comboMult = Combo.onKill();
                    score += Math.floor(e.scoreValue * comboMult);
                    if (player.addSecondaryCharge) player.addSecondaryCharge(5);

                    // Economy-based scrap drops (prevents checkpoint farming)
                    if (window.Economy && Economy.shouldDrop(e.id, e.enemyType)) {
                        const drop = Economy.rollDrop(e.enemyType, biomeLevel);
                        const ecoDrop = Economy.createDrop(e.x + e.width/2, e.y + e.height/2, drop.type, drop.amount);
                        scrapDrops.push(new ScrapDrop(ecoDrop.x, ecoDrop.y, ecoDrop.type, drop.amount));
                    }

                    const difficultyConfig = getCurrentDifficultyConfig();
                    const powerupScale = difficultyConfig.powerupDropMultiplier;
                    if (powerupScale > 0) {
                        const weaponDropThreshold = 0.15 * powerupScale;
                        const shieldDropThreshold = weaponDropThreshold + (0.08 * powerupScale);
                        const dropChance = Math.random();
                        if (dropChance < weaponDropThreshold) {
                            powerups.push(new PowerUp(e.x, e.y, 'W'));
                        } else if (dropChance < shieldDropThreshold) {
                            powerups.push(new PowerUp(e.x, e.y, 'S'));
                        }
                    }

                    enemies.splice(i, 1);
                    break;
                }
            }
        }

        if (e.x < -60) {
            enemies.splice(i, 1);
        }
    }

    if (boss) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            const bBox = { x: b.x - b.size, y: b.y - 2, width: b.size*2, height: 4 };
            if (checkCollision(bBox, boss)) {
                const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
                const dmg = b.damage || ((player.weaponLevel >= 4 ? 2 : 1) * (mods ? mods.weaponDamageMultiplier : 1.0));
                boss.takeDamage(dmg);

                // Map projectile type to varied explosion/impact VFX
                let style = 'blue_laser';
                if (b.secondaryType === 'missile') {
                    style = 'missile';
                } else {
                    const wl = b.weaponLevel || player.weaponLevel;
                    if (wl === 1 || wl === 2) {
                        style = 'blue_laser';
                    } else if (wl === 3) {
                        style = 'green_laser';
                    } else if (wl === 4) {
                        style = 'purple_laser';
                    } else if (wl >= 5) {
                        style = 'white_laser';
                    }
                }
                createExplosion(b.x, b.y, b.color, 8, style);

                if (player.addSecondaryCharge) player.addSecondaryCharge(10);
                bullets.splice(j, 1);
            }
        }

        if (checkCollision(player, boss)) {
            player.takeDamage(35);
        }

        if (boss.state === 'laser_fire') {
            const laserYStart = boss.y + 50;
            const laserHeight = 40;
            if (player.x + player.width > 0 && player.x < boss.x + 20) {
                if (player.y + player.height > laserYStart && player.y < laserYStart + laserHeight) {
                    player.takeDamage(3);
                }
            }
        }
    }

    for (let i = powerups.length - 1; i >= 0; i--) {
        const pu = powerups[i];
        pu.update(dt);

        if (checkCollision(pu, player)) {
            playSound('powerup');
            if (pu.kind === 'W') {
                player.weaponLevel = Math.min(5, player.weaponLevel + 1);
                playSound('weapon_upgrade', {newLevel: player.weaponLevel});
            } else if (pu.kind === 'S') {
                player.shield = Math.min(player.shieldMax, player.shield + 30);
            }
            if (player.addSecondaryCharge) player.addSecondaryCharge(25, 'METER');
            powerups.splice(i, 1);
            continue;
        }

        if (pu.x < -30) {
            powerups.splice(i, 1);
        }
    }

    for (let i = scrapDrops.length - 1; i >= 0; i--) {
        const sd = scrapDrops[i];
        sd.update(dt);

        if (checkCollision(sd, player)) {
            playSound('powerup');
            let collectedVal = sd.value;
            if (player.shipType === 'warden') {
                collectedVal = Math.round(collectedVal * 1.20);
            }
            runScrap += collectedVal;
            // NG+ scrap multiplier: double+ scrap in NG+ runs
            if (ngPlusRun && currentNGLevel > 0 && window.NGPlus) {
                const bonus = collectedVal * (NGPlus.getScrapMult({ ngLevel: currentNGLevel }) - 1);
                runScrap += Math.round(bonus);
                collectedVal += Math.round(bonus);
            }
            floatingTexts.push(new FloatingText(sd.x, sd.y, `+⚙️${collectedVal}`, '#00ff55'));
            // GRO-1054: Bridge scrap collection to story events
            if (window.ScrapEvents && ScrapEvents.onScrapCollected) {
                ScrapEvents.onScrapCollected(collectedVal, sd.type);
            }
            triggerScrapNarrativeBeat();
            scrapDrops.splice(i, 1);
            continue;
        }

        if (sd.x < -30) {
            scrapDrops.splice(i, 1);
        }
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.update(dt);
        if (ft.life <= 0) {
            floatingTexts.splice(i, 1);
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update(dt);
        if (p.alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    for (let i = vfxExplosions.length - 1; i >= 0; i--) {
        vfxExplosions[i].update(dt);
        if (!vfxExplosions[i].alive) {
            vfxExplosions.splice(i, 1);
        }
    }
    
    // Update Warden point-defense zaps
    for (let i = pdgZaps.length - 1; i >= 0; i--) {
        pdgZaps[i].timer -= dt;
        if (pdgZaps[i].timer <= 0) {
            pdgZaps.splice(i, 1);
        }
    }

    // Update high score celebration particles
    if (highScoreBannerTimer > 0) {
        highScoreBannerTimer -= dt;
        for (let i = highScoreParticles.length - 1; i >= 0; i--) {
            const p = highScoreParticles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 30 * dt; // gravity
            p.life -= dt;
            if (p.life <= 0) {
                highScoreParticles.splice(i, 1);
            }
        }
    }

    if ((gameOver || gameWon) && !runScrapSaved) {
        if (window.DS_UpgradeSystem) {
            window.DS_UpgradeSystem.addScrap(runScrap);
        }
        runScrapSaved = true;
        
        // Save score to leaderboard
        if (window.Leaderboard) {
            let isNewBest = false;
            
            if (runScrap > 0) {
                // Submit to Scrap Lord
                Leaderboard.submit('scrapLord', {
                    scrapCollected: runScrap,
                    ship: selectedShip,
                    difficulty: difficulty
                });
                isNewBest = Leaderboard.isPersonalBest('scrapLord', runScrap, selectedShip);
            }
            
            if (gameWon) {
                // Submit to Speedrun and Survivor
                Leaderboard.submit('speedrun', {
                    timeSeconds: gameTime,
                    ship: selectedShip,
                    difficulty: difficulty
                });
                Leaderboard.submit('survivor', {
                    deaths: 0,
                    ship: selectedShip,
                    difficulty: difficulty
                });
                const isNewSpeedBest = Leaderboard.isPersonalBest('speedrun', gameTime, selectedShip);
                if (isNewSpeedBest) isNewBest = true;
            }
            
            // Check for new high score / record
            if (isNewBest && !newHighScoreCelebrated) {
                newHighScoreCelebrated = true;
                highScoreBannerTimer = 4.0; // 4 seconds of celebration
                // Spawn celebration particles
                for (let p = 0; p < 40; p++) {
                    highScoreParticles.push({
                        x: canvas.width / 2 + (Math.random() - 0.5) * 400,
                        y: canvas.height / 2 + (Math.random() - 0.5) * 200,
                        vx: (Math.random() - 0.5) * 120,
                        vy: (Math.random() - 0.5) * 120 - 40,
                        life: 1.5 + Math.random() * 2.0,
                        color: ['#ffd700', '#ffaa00', '#ff0055', '#00ffff'][Math.floor(Math.random() * 4)],
                        size: 3 + Math.random() * 5
                    });
                }
            }
        }
    }

    // GRO-1469: 30s gameOver fallback for single-player stuck pull-out
    if (player.isPulledOut) {
        singlePlayerPullOutTimer += dt;
        // Check if single-player (no Multiplayer active or only 1 player)
        const isSinglePlayer = !window.Multiplayer || Multiplayer.players.length <= 1;
        if (isSinglePlayer && singlePlayerPullOutTimer >= 30.0) {
            gameOver = true;
            singlePlayerPullOutTimer = 0;
        }
    } else if (singlePlayerPullOutTimer > 0) {
        // Reset on recovery if timer hasn't tripped
        singlePlayerPullOutTimer = 0;
    }

    if (player.isPulledOut) {
        uiShield.innerText = 'REPAIR ' + Math.ceil(player.pullOutTimer) + 's';
        uiShield.style.color = '#ff6600';
    } else {
        uiShield.innerText = Math.round(player.shield) + '%';
        uiShield.style.color = player.shield > 40 ? '#00ff00' : '#ff0033';
    }
    // Low-health health bar pulse animation (§6.4)
    const uiHpPercent = player.shield / player.shieldMax;
    if (uiHpPercent < 0.25) {
        const pulse = Math.sin(lowHealthPulseTimer * 9) * 0.5 + 0.5;
        const r = Math.floor(255 * pulse);
        const g = Math.floor(0 * pulse);
        const b = Math.floor(0 * pulse);
        uiShield.style.textShadow = `0 0 ${4 + pulse * 8}px rgb(${r},${g},${b})`;
        uiShield.style.transform = `scale(${1 + pulse * 0.15})`;
    } else {
        uiShield.style.textShadow = '';
        uiShield.style.transform = '';
    }
    uiWeapon.innerText = 'LVL ' + player.weaponLevel + (player.weaponLevel === 5 ? ' (MAX)' : '');
    uiScore.innerText = score;
    if (uiScrap) uiScrap.innerText = '⚙️' + runScrap;

    // Streamer Mode HUD indicator (GRO-1042)
    if (uiStreamer) {
        if (streamerMode) {
            uiStreamer.style.display = 'block';
        } else {
            uiStreamer.style.display = 'none';
        }
    }

    // Banter display
    if (window.BanterEngine) {
        BanterEngine.update(dt);
        const activeBanter = BanterEngine.getActive();
        const banterEl = document.getElementById('ui-banter');
        if (banterEl) {
            if (activeBanter) {
                // Play the procedural environmental cue once when it becomes active
                if (activeBanter.cue && !activeBanter._cuePlayed) {
                    playSound(activeBanter.cue);
                    activeBanter._cuePlayed = true;
                }
                if (activeBanter.l.startsWith('[SILENCE]')) {
                    // Strip [SILENCE] tag and format as soft environmental action caption
                    banterEl.innerText = activeBanter.l.replace('[SILENCE]', '').trim();
                    banterEl.style.fontStyle = 'italic';
                    banterEl.style.color = '#a0ffa0'; // soft cyber-green
                } else {
                    banterEl.innerText = activeBanter.s + ': ' + activeBanter.l;
                    banterEl.style.fontStyle = 'normal';
                    banterEl.style.color = ''; // reset to default
                }
                banterEl.style.opacity = '1';
            } else {
                banterEl.style.opacity = '0';
            }
        }
    }

    // GRO-940: Accessibility subtitle overlay — high-visibility voice line captions
    const subtitleOverlay = document.getElementById('ui-subtitles');
    const subtitleSpeaker = document.getElementById('ui-subtitles-speaker');
    const subtitleText = document.getElementById('ui-subtitles-text');
    if (subtitleOverlay && typeof subtitlesEnabled !== 'undefined' && subtitlesEnabled) {
        if (window.VoicePlayback) {
            const activeLine = VoicePlayback.getActiveLine();
            if (activeLine && VoicePlayback.isPlaying()) {
                subtitleOverlay.style.display = 'block';
                if (subtitleSpeaker) subtitleSpeaker.innerText = activeLine.speaker || '';
                if (subtitleText) subtitleText.innerText = activeLine.text || '';
            } else {
                subtitleOverlay.style.display = 'none';
            }
        }
    } else if (subtitleOverlay) {
        subtitleOverlay.style.display = 'none';
    }
    
    if (uiBoost) {
        if (player.isBoosting) {
            uiBoost.innerText = 'BOOSTING!';
            uiBoost.style.color = '#00ffff';
        } else if (player.boostCooldown > 0) {
            uiBoost.innerText = `COOLDOWN (${Math.ceil(player.boostCooldown)}s)`;
            uiBoost.style.color = '#ff0033';
        } else {
            uiBoost.innerText = 'READY';
            uiBoost.style.color = '#ffaa00';
        }
    }
    
    if (uiSpecial) {
        const meter = Math.round(player.secondaryMeter || 0);
        if (player.isSpecialActive) {
            const label = player.secondarySpecialType ? player.secondarySpecialType.toUpperCase() : 'OVERLOAD';
            uiSpecial.innerText = `${label} (${Math.ceil(player.specialActiveTimer)}s)`;
            uiSpecial.style.color = '#ff00aa';
        } else if (player.specialCooldown > 0) {
            uiSpecial.innerText = `METER ${meter}% / COOLDOWN ${Math.ceil(player.specialCooldown)}s`;
            uiSpecial.style.color = '#ff0033';
        } else if (meter >= 100) {
            uiSpecial.innerText = `FULL — B BOMB / M MISSILES / K SPECIAL`;
            uiSpecial.style.color = '#b026ff';
        } else if (meter >= 50) {
            uiSpecial.innerText = `METER ${meter}% — B BOMB / M MISSILES`;
            uiSpecial.style.color = '#ffaa00';
        } else if (meter >= 30) {
            uiSpecial.innerText = `METER ${meter}% — M MISSILES`;
            uiSpecial.style.color = '#ffaa00';
        } else {
            uiSpecial.innerText = `METER ${meter}%`;
            uiSpecial.style.color = '#7777aa';
        }
    }
    
    if (uiDodge) {
        if (player.isDodging) {
            uiDodge.innerText = 'EVADING!';
            uiDodge.style.color = '#00ffaa';
        } else if (player.dodgeCooldown > 0) {
            uiDodge.innerText = `COOLDOWN (${Math.ceil(player.dodgeCooldown)}s)`;
            uiDodge.style.color = '#ff0033';
        } else {
            uiDodge.innerText = 'READY (E)';
            uiDodge.style.color = '#00ffff';
        }
    }
}

function draw() {
    if (currentScreen !== SCREENS.PLAYING) {
        drawMenuScreens();
        if (screenFadeAlpha > 0) {
            ctx.save();
            ctx.fillStyle = `rgba(0, 0, 0, ${screenFadeAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
        return;
    }

    ctx.fillStyle = '#010108';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render parallax layers back-to-front (image-based, drawn directly)
    bgLayers.forEach(layer => layer.draw());

    // Blit offscreen buffers (lazy-rendered every 200-250ms)
    // First frame: force-build buffers if not yet rendered
    if (starBuffer.dirty) starBuffer.rebuild(rebuildStarBuffer);
    if (envBuffer.dirty) envBuffer.rebuild(rebuildEnvBuffer);
    ctx.drawImage(starBuffer.canvas, 0, 0);
    ctx.drawImage(envBuffer.canvas, 0, 0);

    bullets.forEach(b => b.draw());
    enemyBullets.forEach(eb => eb.draw());
    powerups.forEach(pu => pu.draw());
    scrapDrops.forEach(sd => sd.draw());
    enemies.forEach(e => e.draw());
    if (boss) boss.draw();
    player.draw();
    for (const rp of remotePlayers) rp.draw();
    vfxExplosions.forEach(ex => ex.draw());
    
    // Combo counter HUD overlay
    Combo.draw(ctx);
    
    // Draw Warden Point Defense Grid zaps
    pdgZaps.forEach(zap => {
        ctx.save();
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(zap.x1, zap.y1);
        ctx.lineTo(zap.x2, zap.y2);
        ctx.stroke();
        ctx.restore();
    });
    particles.forEach(p => p.draw());
    floatingTexts.forEach(ft => ft.draw());

    // --- Hit-flash effects (5-tier weapon hit) ---
    for (const hf of hitFlashes) {
        hf.frameTime += 0.016;
        if (hf.frameTime >= hf.frameRate) {
            hf.frameTime -= hf.frameRate;
            hf.frame++;
        }
        const lifeRatio = hf.life / hf.duration;
        const alpha = lifeRatio;
        const size = hf.size * (1 + (1 - lifeRatio) * 0.3);
        if (hf.frame < hf.maxFrames) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = hf.color;
            ctx.shadowColor = hf.color;
            ctx.shadowBlur = size * 0.5;
            const hs = size * (1 - hf.frame / hf.maxFrames);
            ctx.fillRect(hf.x - hs/2, hf.y - hs/2, hs, hs);
            ctx.restore();
        }
    }
    // Cull expired hit flashes
    for (let i = hitFlashes.length - 1; i >= 0; i--) {
        hitFlashes[i].life -= 0.016;
        if (hitFlashes[i].life <= 0) hitFlashes.splice(i, 1);
    }

    // --- Screen flash overlay (biome shake tint) ---
    if (screenFlashAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = screenFlashAlpha;
        ctx.fillStyle = screenFlashColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        screenFlashAlpha = Math.max(0, screenFlashAlpha - 0.016);
    }

    // --- Low-health pulse (screen border red at <25% HP) ---
    const drawHpPercent = player.shield / player.shieldMax;
    if (drawHpPercent < 0.25) {
        const urgency = drawHpPercent < 0.10 ? 1.0 : 0.5;
        const pulseAlpha = (0.10 + Math.sin(lowHealthPulseTimer * 9) * 0.06) * urgency;
        const borderWidth = 8 + (drawHpPercent < 0.10 ? 6 : 0);
        ctx.save();
        ctx.globalAlpha = pulseAlpha;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, canvas.width, borderWidth);
        ctx.fillRect(0, canvas.height - borderWidth, canvas.width, borderWidth);
        ctx.fillRect(0, 0, borderWidth, canvas.height);
        ctx.fillRect(canvas.width - borderWidth, 0, borderWidth, canvas.height);
        ctx.restore();

        // Static glitch lines at <10% HP
        if (glitchTimer > 0) {
            ctx.save();
            ctx.globalAlpha = 0.05;
            ctx.fillStyle = '#FFFFFF';
            for (let g = 0; g < 3; g++) {
                const gy = Math.random() * canvas.height;
                ctx.fillRect(0, gy, canvas.width, 2 + Math.random() * 4);
            }
            ctx.restore();
        }
    }

    // --- Overheat glow (weapon barrel white-to-red gradient) ---
    if (overheatWarning) {
        const owAlpha = overheatCritical ? 0.25 : 0.12;
        const pulse = Math.sin(gameTime * 12) * 0.5 + 0.5;
        ctx.save();
        ctx.globalAlpha = owAlpha * (0.5 + pulse * 0.5);
        const shipCX = player.x + player.width;
        const shipCY = player.y + player.height / 2;
        const glowRadius = overheatCritical ? 60 : 40;
        const grad = ctx.createRadialGradient(shipCX - 10, shipCY, 0, shipCX, shipCY, glowRadius);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.2, '#FFAA00');
        grad.addColorStop(0.6, '#FF4400');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(shipCX - glowRadius, shipCY - glowRadius, glowRadius * 2, glowRadius * 2);
        if (overheatCritical) {
            ctx.fillStyle = `rgba(255, 0, 0, ${0.3 + pulse * 0.3})`;
            ctx.fillRect(10, canvas.height - 18, 120, 10);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '9px monospace';
            ctx.fillText('OVERHEAT!', 14, canvas.height - 10);
        }
        ctx.restore();
    }

    // --- Screen shake decay ---
    if (shakeDuration > 0) {
        shakeDuration = Math.max(0, shakeDuration - 0.016);
        if (shakeDuration <= 0) {
            shakeIntensity = 0;
        }
    }
    
    // --- Biome environmental particles ---
    if (bossAssetsLoading && !bossAssetsLoaded) {
        const loadY = canvas.height - 30;
        ctx.fillStyle = 'rgba(5, 5, 15, 0.8)';
        ctx.fillRect(canvas.width / 2 - 100, loadY - 12, 200, 28);

        // Progress bar background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(canvas.width / 2 - 80, loadY + 2, 160, 6);

        // Progress bar fill
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(canvas.width / 2 - 80, loadY + 2, 160 * (bossLoadProgress / 100), 6);

        // Text
        ctx.fillStyle = '#00ffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PRELOADING BOSS ASSETS... ' + bossLoadProgress + '%', canvas.width / 2, loadY - 2);
    }

    if (sirenTimer > 0) {
        ctx.fillStyle = 'rgba(255, 0, 0, ' + (Math.sin(gameTime * 20) * 0.2 + 0.25) + ')';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff0033';
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('WARNING: BOSS ENGAGING', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '16px monospace';
        ctx.fillText('CRITICAL SIGNALS DETECTED AHEAD', canvas.width / 2, canvas.height / 2 + 15);
    }

    if (boss && boss.state !== 'intro') {
        const barWidth = 300;
        const barHeight = 12;
        const bx = canvas.width / 2 - barWidth / 2;
        const by = 20;

        ctx.fillStyle = '#111';
        ctx.fillRect(bx, by, barWidth, barHeight);

        const hpPercent = boss.hp / boss.hpMax;
        ctx.fillStyle = hpPercent > 0.4 ? '#ff3300' : '#ff00ff';
        ctx.fillRect(bx, by, barWidth * hpPercent, barHeight);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, barWidth, barHeight);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CYBER COELACANTH', canvas.width / 2, by - 6);
    }

    // GRO-2166: Draw/update active dialogue (handles DOM HUD overlay updating and canvas dimming)
    if (typeof activeDialogue !== 'undefined' && activeDialogue) {
        activeDialogue.draw();
    }

    if (paused) {
        ctx.save();
        ctx.fillStyle = 'rgba(5, 5, 15, 0.82)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (pauseSubScreen === 'menu') {
            // Title
            ctx.fillStyle = '#00ffff';
            ctx.font = 'bold 36px monospace';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 12;
            ctx.fillText('SYSTEM PAUSED', canvas.width / 2, 150);
            ctx.shadowBlur = 0;
            
            // Pause menu options
            const startY = 240;
            const spacing = 44;
            for (let i = 0; i < PAUSE_OPTIONS.length; i++) {
                const itemY = startY + i * spacing;
                const isSelected = pauseMenuIndex === i;
                
                ctx.textAlign = 'center';
                ctx.font = 'bold ' + (isSelected ? '22' : '18') + 'px monospace';
                
                // Selection indicator
                if (isSelected) {
                    ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
                    ctx.fillRect(canvas.width / 2 - 140, itemY - 18, 280, 36);
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
                    ctx.strokeRect(canvas.width / 2 - 140, itemY - 18, 280, 36);
                }
                
                ctx.fillStyle = isSelected ? '#00ffff' : '#8a8a9f';
                ctx.fillText(PAUSE_OPTIONS[i], canvas.width / 2, itemY + 6);
            }
            
            // Footer hints
            ctx.fillStyle = '#4a4a5f';
            ctx.font = '11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('ARROW KEYS to Navigate  |  ENTER to Select  |  P / ESC to Resume', canvas.width / 2, canvas.height - 40);
            
        } else if (pauseSubScreen === 'settings') {
            // Settings sub-screen title
            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 28px monospace';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#ffaa00';
            ctx.shadowBlur = 10;
            ctx.fillText('SYSTEM SETTINGS', canvas.width / 2, 100);
            ctx.shadowBlur = 0;
            
            const startY = 190;
            const spacing = 40;
            for (let i = 0; i < SETTINGS_OPTIONS.length; i++) {
                const itemY = startY + i * spacing;
                const isSelected = selectedSettingsIndex === i;
                
                ctx.textAlign = 'left';
                ctx.font = 'bold 14px monospace';
                ctx.fillStyle = isSelected ? '#00ffff' : '#8a8a9f';
                
                if (i < 3) {
                    const volVal = i === 0 ? masterVolume : (i === 1 ? sfxVolume : musicVolume);
                    ctx.fillText(SETTINGS_OPTIONS[i], 220, itemY + 5);
                    
                    const sliderX = 450;
                    const sliderWidth = 130;
                    ctx.fillStyle = '#222';
                    ctx.fillRect(sliderX, itemY - 6, sliderWidth, 12);
                    
                    ctx.fillStyle = isSelected ? '#00ffff' : '#ff0055';
                    ctx.fillRect(sliderX, itemY - 6, sliderWidth * volVal, 12);
                    
                    ctx.strokeStyle = '#fff';
                    ctx.strokeRect(sliderX, itemY - 6, sliderWidth, 12);
                    
                    ctx.fillText(Math.round(volVal * 100) + '%', 595, itemY + 5);
                } else if (i === 3) {
                    ctx.fillText(SETTINGS_OPTIONS[i], 220, itemY + 5);
                    ctx.fillStyle = isSelected ? '#ffffff' : '#6a6a7f';
                    ctx.fillText(difficulty.toUpperCase(), 450, itemY + 5);
                } else if (i >= 4 && i <= 6) {
                    // Toggle settings: AUDIO TUNNELS, BANTER SYSTEM, STREAMER MODE
                    ctx.fillText(SETTINGS_OPTIONS[i], 220, itemY + 5);
                    let toggleVal = false;
                    if (i === 4) toggleVal = audioTunnelsEnabled;
                    else if (i === 5) toggleVal = banterEnabled;
                    else if (i === 6) toggleVal = streamerMode;
                    ctx.fillStyle = toggleVal ? '#00ff88' : '#ff3355';
                    ctx.fillText(toggleVal ? 'ON' : 'OFF', 470, itemY + 5);
                    ctx.fillStyle = toggleVal ? '#00ff88' : '#ff3355';
                    ctx.beginPath();
                    ctx.arc(445, itemY + 1, 5, 0, Math.PI * 2);
                    ctx.fill();
                } else if (i === 7) {
                    ctx.textAlign = 'center';
                    ctx.fillStyle = isSelected ? '#ff0055' : '#8a8a9f';
                    ctx.fillText('BACK', canvas.width / 2, itemY + 5);
                }
            }
            
            // Footer hints
            ctx.fillStyle = '#4a4a5f';
            ctx.font = '11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('LEFT/RIGHT to Adjust  |  ENTER to Toggle  |  P / ESC to Return', canvas.width / 2, canvas.height - 40);
        }
        
        ctx.restore();
    }

    if (gameOver) {
        ctx.fillStyle = 'rgba(15, 5, 5, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // High Score Celebration
        if (highScoreBannerTimer > 0 && newHighScoreCelebrated) {
            const bannerAlpha = Math.min(1, highScoreBannerTimer);
            const pulse = Math.sin(highScoreBannerTimer * 8) * 0.3 + 0.7;
            
            ctx.save();
            ctx.fillStyle = `rgba(255, 170, 0, ${bannerAlpha * 0.15})`;
            ctx.fillRect(0, canvas.height / 2 - 100, canvas.width, 200);
            
            ctx.font = 'bold 36px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(255, 215, 0, ${bannerAlpha * pulse})`;
            ctx.shadowColor = '#ffaa00';
            ctx.shadowBlur = 20 * pulse;
            ctx.fillText('★ NEW HIGH SCORE! ★', canvas.width / 2, canvas.height / 2 - 68);
            ctx.shadowBlur = 0;
            
            ctx.font = 'bold 16px monospace';
            ctx.fillStyle = `rgba(255, 255, 255, ${bannerAlpha * 0.9})`;
            ctx.fillText(score.toLocaleString() + ' POINTS', canvas.width / 2, canvas.height / 2 - 38);
            
            // Celebration particles
            for (const p of highScoreParticles) {
                ctx.fillStyle = `rgba(${hexToRgb(p.color)}, ${Math.min(1, p.life)})`;
                ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            }
            ctx.restore();
        }
        
        ctx.fillStyle = '#ff6600';
        ctx.font = 'bold 42px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SQUADRON WIPED', canvas.width / 2, canvas.height / 2 - 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px monospace';
        ctx.fillText('All ships pulled out — no one left to cover.', canvas.width / 2, canvas.height / 2 - 5);
        ctx.fillText('SCORE: ' + score, canvas.width / 2, canvas.height / 2 + 20);
        
        let yOffset = 38;
        const topScrap = window.Leaderboard ? Leaderboard.getTop('scrapLord', 1)[0] : null;
        if (topScrap) {
            ctx.fillStyle = '#ffaa00';
            ctx.font = '12px monospace';
            ctx.fillText('★ RECORD SCRAP: ' + topScrap.scrapCollected.toLocaleString() + ' — ' + topScrap.ship.toUpperCase(), canvas.width / 2, canvas.height / 2 + yOffset);
            yOffset += 16;
        }
        ctx.fillStyle = '#00ff55';
        ctx.font = '12px monospace';
        ctx.fillText('SCRAP EARNED: +' + runScrap, canvas.width / 2, canvas.height / 2 + yOffset);
        
        ctx.font = '14px monospace';
        ctx.fillStyle = '#8a8a9f';
        ctx.fillText('Click screen or press SPACE to retry', canvas.width / 2, canvas.height / 2 + 55);
        ctx.fillText('Press U to open Upgrades Shop', canvas.width / 2, canvas.height / 2 + 75);
        ctx.fillText('Press ESC to return to main menu', canvas.width / 2, canvas.height / 2 + 95);
        ctx.fillStyle = '#ff0055';
        ctx.font = '11px monospace';
        ctx.fillText('whatanadventure.games/darius-star', canvas.width / 2, canvas.height / 2 + 118);
    }

    if (gameWon) {
        ctx.fillStyle = 'rgba(5, 15, 10, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff55';
        ctx.font = 'bold 42px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VICTORY ACHIEVED', canvas.width / 2, canvas.height / 2 - 55);
        // GRO-1009: Show ending achieved
        const endingName = selectedEnding || 'transcendence';
        const endingColor = endingName === 'sacrifice' ? '#00ffff' : (endingName === 'transcendence' ? '#ff00ff' : '#ff3300');
        ctx.fillStyle = endingColor;
        ctx.font = 'bold 16px monospace';
        ctx.fillText('ENDING: ' + endingName.toUpperCase(), canvas.width / 2, canvas.height / 2 - 32);
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px monospace';
        ctx.fillText('SCORE: ' + score, canvas.width / 2, canvas.height / 2);
        
        let yOffsetVal = 18;
        const topScrapLord = window.Leaderboard ? Leaderboard.getTop('scrapLord', 1)[0] : null;
        const topTime = window.Leaderboard ? Leaderboard.getTop('speedrun', 1)[0] : null;
        if (topScrapLord) {
            ctx.fillStyle = '#ffaa00';
            ctx.font = '12px monospace';
            ctx.fillText('★ RECORD SCRAP: ' + topScrapLord.scrapCollected.toLocaleString() + ' — ' + topScrapLord.ship.toUpperCase(), canvas.width / 2, canvas.height / 2 + yOffsetVal);
            yOffsetVal += 16;
        }
        if (topTime) {
            const val = topTime.timeSeconds;
            const m = Math.floor(val / 60);
            const sec = Math.floor(val % 60);
            const timeStr = `${m}:${sec.toString().padStart(2, '0')}`;
            ctx.fillStyle = '#00ffff';
            ctx.font = '12px monospace';
            ctx.fillText('⏱ RECORD TIME: ' + timeStr + ' — ' + topTime.ship.toUpperCase(), canvas.width / 2, canvas.height / 2 + yOffsetVal);
            yOffsetVal += 16;
        }
        ctx.fillStyle = '#00ff55';
        ctx.font = '12px monospace';
        ctx.fillText('SCRAP EARNED: +' + runScrap, canvas.width / 2, canvas.height / 2 + yOffsetVal);
        yOffsetVal += 16;
        ctx.fillStyle = '#00ffff';
        ctx.font = '12px monospace';
        ctx.fillText('Cyber Coelacanth eradicated.', canvas.width / 2, canvas.height / 2 + yOffsetVal);
        yOffsetVal += 24;
        // NG+ prompt if eligible
        const ngEligible = localStorage.getItem('darius_star_ngplus_eligible');
        if (ngEligible) {
            try {
                const ngData = JSON.parse(ngEligible);
                const shipData = ngData[selectedShip];
                if (shipData) {
                    const nextLevel = (shipData.ngLevel || 0) + 1;
                    const mult = window.NGPlus ? NGPlus.getScrapMult({ ngLevel: nextLevel }) : 1;
                    ctx.fillStyle = '#cc44ff';
                    ctx.font = 'bold 16px monospace';
                    ctx.fillText('⚡ PRESS N: NEW GAME+ Lv' + nextLevel + ' (' + mult.toFixed(1) + 'x SCRAP)', canvas.width / 2, canvas.height / 2 + yOffsetVal);
                    yOffsetVal += 20;
                }
            } catch(e) {}
        }
        ctx.fillStyle = '#8a8a9f';
        ctx.font = '14px monospace';
        ctx.fillText('Click screen or press SPACE to replay', canvas.width / 2, canvas.height / 2 + yOffsetVal);
        yOffsetVal += 20;
        ctx.fillText('Press U to open Upgrades Shop', canvas.width / 2, canvas.height / 2 + yOffsetVal);
        ctx.fillText('Press ESC to return to main menu', canvas.width / 2, canvas.height / 2 + 115);
        ctx.fillStyle = '#ff0055';
        ctx.font = '11px monospace';
        ctx.fillText('whatanadventure.games/darius-star', canvas.width / 2, canvas.height / 2 + 138);
    }


    if (screenFadeAlpha > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${screenFadeAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
}

canvas.addEventListener('mousemove', e => {
    if (currentScreen === SCREENS.PLAYING || targetScreen) return;
    const { x, y } = getCanvasMouseCoords(e);
    
    // Save previous hover states for sound debounce
    const prevMenu = hoveredMenuIndex;
    const prevShip = hoveredShipIndex;
    const prevSettings = hoveredSettingsIndex;
    const prevUpgrade = hoveredUpgradeIndex;
    
    if (currentScreen === SCREENS.MENU) {
        const startY = 210;
        const spacing = 35;
        hoveredMenuIndex = -1;
        for (let i = 0; i < menuOptions.length; i++) {
            const itemY = startY + i * spacing;
            if (x >= 280 && x <= 520 && y >= itemY - 18 && y <= itemY + 8) {
                hoveredMenuIndex = i;
            }
        }
        if (hoveredMenuIndex !== prevMenu && hoveredMenuIndex >= 0) {
            playSound('ui_hover');
        }
    } else if (currentScreen === SCREENS.SHIP_SELECT) {
        const startY = 140;
        const spacing = 65;
        hoveredShipIndex = -1;
        for (let i = 0; i < 3; i++) {
            const itemY = startY + i * spacing;
            if (x >= 80 && x <= 720 && y >= itemY - 25 && y <= itemY + 27) {
                hoveredShipIndex = i;
            }
        }
        if (hoveredShipIndex !== prevShip && hoveredShipIndex >= 0) {
            playSound('ui_hover');
        }
    } else if (currentScreen === SCREENS.SETTINGS) {
        const startY = 175;
        const spacing = 36;
        hoveredSettingsIndex = -1;
        for (let i = 0; i < SETTINGS_OPTIONS.length; i++) {
            const itemY = startY + i * spacing;
            if (x >= 200 && x <= 600 && y >= itemY - 15 && y <= itemY + 15) {
                hoveredSettingsIndex = i;
            }
        }
        if (hoveredSettingsIndex !== prevSettings && hoveredSettingsIndex >= 0) {
            playSound('ui_hover');
        }
    } else if (currentScreen === SCREENS.UPGRADE_SHOP) {
        // GRO-1294: Hover detection for upgrade shop items
        const startY = 80;
        const spacing = 75;
        const labels = ['weapons','shields','engines','specials','cosmetics'];
        hoveredUpgradeIndex = -1;
        for (let i = 0; i < labels.length; i++) {
            const itemY = startY + i * spacing;
            if (x >= 20 && x <= canvas.width - 40 && y >= itemY - 5 && y <= itemY + spacing - 9) {
                hoveredUpgradeIndex = i;
            }
        }
        if (hoveredUpgradeIndex !== prevUpgrade && hoveredUpgradeIndex >= 0) {
            playSound('ui_hover');
        }
    } else if (currentScreen === SCREENS.LOAD_GAME) {
        // GRO-1160: Touch/mouse hover tracking for load game screen
        const regions = window._loadHitRegions || [];
        window._loadHoveredSlot = -1;
        window._loadHoveredBtn = null;  // 'load' or 'delete' or null
        for (let i = 0; i < regions.length; i++) {
            const r = regions[i];
            if (r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
                window._loadHoveredSlot = i;
                // Check button hit regions
                if (r.btnLoad && x >= r.btnLoad.x && x <= r.btnLoad.x + r.btnLoad.w &&
                    y >= r.btnLoad.y && y <= r.btnLoad.y + r.btnLoad.h) {
                    window._loadHoveredBtn = 'load';
                } else if (r.btnDelete && x >= r.btnDelete.x && x <= r.btnDelete.x + r.btnDelete.w &&
                    y >= r.btnDelete.y && y <= r.btnDelete.y + r.btnDelete.h) {
                    window._loadHoveredBtn = 'delete';
                }
                break;
            }
        }
    }
});

canvas.addEventListener('mouseleave', () => {
    hoveredMenuIndex = -1;
    hoveredShipIndex = -1;
    hoveredSettingsIndex = -1;
    hoveredUpgradeIndex = -1;
});

canvas.addEventListener('click', e => {
    setBiomeBackgrounds(biomeLevel);
    initAudio();
    // GRO-1470 / GRO-1926: Chiptune starts immediately for instant feedback;
    // AudioManager.preloadAll resolves and triggers crossfadeToMenuTrack()
    // to ramp chiptune out and start the cinematic MP3.
    if (typeof AudioManager !== 'undefined') {
        AudioManager.init().then(function() {
            AudioManager.preloadAll().then(function() {
                if (typeof crossfadeToMenuTrack === 'function' &&
                    typeof currentScreen !== 'undefined' &&
                    currentScreen !== SCREENS.PLAYING) {
                    crossfadeToMenuTrack('ambient_deep_space', 2.0);
                }
            });
        });
    }
    loadPlayerSprites();
    loadPortraitSprites();
    loadEnemySprites();
    loadVFXSprites();
    if (window.LevelManager && !LevelManager.initialized) {
        LevelManager.initialized = true;
        LevelManager.init();
    }

    if (currentScreen !== SCREENS.PLAYING) {
        startMenuMusic();
    }

    if (typeof activeDialogue !== 'undefined' && activeDialogue) {
        activeDialogue.next();
        return;
    }

    if (currentScreen === SCREENS.PLAYING) {
        if (gameOver || gameWon) {
            handleDeathOrVictoryRestart();
        }
        return;
    }
    
    if (targetScreen) return;
    
    const { x, y } = getCanvasMouseCoords(e);
    
    if (currentScreen === SCREENS.MENU) {
        if (hoveredMenuIndex >= 0) {
            selectedMenuIndex = hoveredMenuIndex;
            playSound('menu_click');
            handleMenuConfirm();
        }
    } else if (currentScreen === SCREENS.SHIP_SELECT) {
        if (hoveredShipIndex >= 0) {
            selectedShipIndex = hoveredShipIndex;
            playSound('menu_click');
            handleMenuConfirm();
        } else if (x >= 300 && x <= 500 && y >= 345 && y <= 375) {
            playSound('menu_click');
            transitionToScreen(SCREENS.MENU);
        }
    } else if (currentScreen === SCREENS.SETTINGS) {
        if (hoveredSettingsIndex >= 0) {
            selectedSettingsIndex = hoveredSettingsIndex;
            const i = hoveredSettingsIndex;
            if (i === 7) {
                playSound('menu_click');
                handleMenuConfirm();
            } else if (i >= 4 && i <= 6) {
                playSound('menu_click');
                adjustSetting(i, 1);
            } else if (i === 3) {
                playSound('menu_select');
                adjustSetting(3, 1);
            } else if (i < 3) {
                if (x >= 430 && x <= 600) {
                    const rawVal = (x - 450) / 130;
                    const newVal = Math.max(0, Math.min(1.0, rawVal));
                    playSound('menu_select');
                    if (i === 0) masterVolume = newVal;
                    else if (i === 1) sfxVolume = newVal;
                    else if (i === 2) musicVolume = newVal;
                }
            }
        }
    } else if (currentScreen === SCREENS.CREDITS) {
        playSound('menu_click');
        transitionToScreen(SCREENS.MENU);
    } else if (currentScreen === SCREENS.CINEMATIC) {
        playSound('menu_click');
        transitionToScreen(SCREENS.CREDITS);
    } else if (currentScreen === SCREENS.BRIEFING) {
        // GRO-936: Click to advance/skip briefing
        handleBriefingClick();
    } else if (currentScreen === SCREENS.LOAD_GAME) {
        // GRO-1160: Touch/click handling for load game screen
        const hoveredSlot = window._loadHoveredSlot;
        const hoveredBtn = window._loadHoveredBtn;
        if (hoveredBtn === 'load' && hoveredSlot >= 0) {
            playSound('menu_click');
            window._loadSelectedSlot = hoveredSlot;
            confirmLoadGame();
        } else if (hoveredBtn === 'delete' && hoveredSlot >= 0) {
            const slot = hoveredSlot;
            if (confirm('Delete save in Slot ' + (slot+1) + '?')) {
                playSound('menu_click');
                deleteSaveSlot(slot);
            }
        } else if (hoveredSlot >= 0) {
            // Tap slot to select it
            playSound('menu_select');
            window._loadSelectedSlot = hoveredSlot;
        }
    }
});

// GRO-1160: Long-press handler for save slot delete on mobile
let _longPressTimer = null;
let _longPressSlot = -1;
canvas.addEventListener('touchstart', e => {
    if (currentScreen !== SCREENS.LOAD_GAME || targetScreen) return;
    const touch = e.touches[0];
    const { x, y } = getCanvasMouseCoords(touch);
    const regions = window._loadHitRegions || [];
    for (let i = 0; i < regions.length; i++) {
        const r = regions[i];
        if (r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
            const save = (window._loadSaves || [])[i];
            if (save) {
                _longPressSlot = i;
                _longPressTimer = setTimeout(() => {
                    if (currentScreen === SCREENS.LOAD_GAME && (window._loadSelectedSlot || 0) === _longPressSlot) {
                        if (confirm('Delete save in Slot ' + (_longPressSlot + 1) + '?')) {
                            playSound('menu_click');
                            deleteSaveSlot(_longPressSlot);
                        }
                    }
                    _longPressTimer = null;
                    _longPressSlot = -1;
                }, 600);
            }
            break;
        }
    }
}, { passive: true });
canvas.addEventListener('touchend', () => {
    if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; }
    _longPressSlot = -1;
});
canvas.addEventListener('touchmove', () => {
    if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; }
    _longPressSlot = -1;
});

requestAnimationFrame(loop);
