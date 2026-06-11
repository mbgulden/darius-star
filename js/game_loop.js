// game_loop.js — Core game orchestrator
// Extracted from index.html by Ned (GRO-1100)
// Contains: game setup, state, entity pools, collision,
//           resetGame, update(), draw(), loop(), input handling

     1|// --- Game Setup ---
     2|const canvas = document.getElementById('gameCanvas');
     3|const ctx = canvas.getContext('2d');
     4|
     5|// Responsive canvas: maintain internal 800x450, scale display via CSS
     6|const GAME_WIDTH = 800;
     7|const GAME_HEIGHT = 450;
     8|canvas.width = GAME_WIDTH;
     9|canvas.height = GAME_HEIGHT;
    10|initializeRendererBuffers();
    11|
    12|function resizeCanvas() {
    13|    const maxW = window.innerWidth;
    14|    const maxH = window.innerHeight - 120; // space for header + controls
    15|    const scale = Math.min(maxW / GAME_WIDTH, maxH / GAME_HEIGHT);
    16|    canvas.style.width = (GAME_WIDTH * scale) + 'px';
    17|    canvas.style.height = (GAME_HEIGHT * scale) + 'px';
    18|}
    19|window.addEventListener('resize', resizeCanvas);
    20|window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 100));
    21|
    22|// Check for redirect from ship select page
    23|window.addEventListener('DOMContentLoaded', () => {
    24|    if (window.LevelManager && !LevelManager.initialized) {
    25|        LevelManager.initialized = true;
    26|        LevelManager.init();
    27|    }
    28|    const urlParams = new URLSearchParams(window.location.search);
    29|    if (urlParams.get('launch') === 'true') {
    30|        const url = new URL(window.location.href);
    31|        url.searchParams.delete('launch');
    32|        window.history.replaceState({}, '', url.toString());
    33|        
    34|        // Immediately start playing
    35|        setTimeout(() => {
    36|            currentScreen = SCREENS.PLAYING;
    37|            stopMenuMusic();
    38|            stopCreditsMusic();
    39|
    40|            let activeSaveSlot = parseInt(localStorage.getItem('dariusStar_activeSlot') || '0');
    41|            let isNewGame = localStorage.getItem('dariusStar_isNewGame') === 'true';
    42|            if (isNewGame && window.CampaignSave) {
    43|                const newSave = CampaignSave.createBlank();
    44|                const shipSel = localStorage.getItem('dariusStar_shipSelection');
    45|                if (shipSel) {
    46|                    const parsed = JSON.parse(shipSel);
    47|                    if (parsed && parsed.p1 && parsed.p1.shipId) {
    48|                        newSave.ship = parsed.p1.shipId;
    49|                    }
    50|                }
    51|                CampaignSave.save(activeSaveSlot, newSave);
    52|                localStorage.setItem('dariusStar_isNewGame', 'false');
    53|            }
    54|
    55|            resetGame();
    56|            // Initialize campaign systems
    57|            if (window.Multiplayer) Multiplayer.init();
    58|            if (window.Economy) Economy.init();
    59|            if (window.BanterEngine) {
    60|                BanterEngine.init(window.Multiplayer ? Multiplayer.count : 1);
    61|                BanterEngine.trigger('level_start', 1);
    62|            }
    63|        }, 100);
    64|    }
    65|});
    66|resizeCanvas();
    67|
    68|const uiShield = document.getElementById('ui-shield');
    69|const uiWeapon = document.getElementById('ui-weapon');
    70|const uiScore = document.getElementById('ui-score');
    71|const uiScrap = document.getElementById('ui-scrap');
    72|const uiBoost = document.getElementById('ui-boost');
    73|const uiSpecial = document.getElementById('ui-special');
    74|const uiDodge = document.getElementById('ui-dodge');
    75|const uiBiome = document.getElementById('ui-biome');
    76|const uiNavigator = document.getElementById('ui-navigator');
    77|
    78|// Game state variables
    79|let score = 0;
    80|let gameOver = false;
    81|let gameWon = false;
    82|let paused = false;
    83|let lastTime = 0;
    84|let pdgZaps = [];
    85|let gameTime = 0;
    86|let bossSpawned = false;
    87|let sirenTimer = 0;
    88|let bossesDefeated = 0; // Track how many bosses killed for per-biome progression
    89|const BOSS_SCORE_THRESHOLDS = [290, 590, 890, 1190, 1490, 1790, 2090, 2390, 2690, 2990];
    90|let biomeLevel = 1;  // Economy segment tracking
    91|let currentNGLevel = 0; // NG+ level (0 = normal run)
    92|
    93|// --- Polish system variables (GRO-990: screen shake tints, hit-flash, overheat, low-health) ---
    94|let screenFlashAlpha = 0;
    95|let screenFlashColor = '#FFFFFF';
    96|const hitFlashes = [];
    97|let overheatWarning = false;
    98|let overheatCritical = false;
    99|let overheatTimer = 0;
   100|let lowHealthPulseTimer = 0;
   101|let glitchTimer = 0;
   102|let glitchCooldown = 0;
   103|let ngPlusRun = false;  // Whether current run is NG+
   104|let _winTransition = false; // Flag for win screen transition
   105|
   106|// --- Narrative Flags & Ending System (GRO-1009) ---
   107|// Tracks player story choices throughout the game. Flags accrue from dialogue
   108|// choices and biome milestones. At Biome 10 climax, determineEnding() picks
   109|// one of three endings: sacrifice, transcendence, dominion.
   110|const narrativeFlags = {
   111|    lyra_trust: 0,           // Lyra dialogue choices
   112|    coelacanth_mercy: 0,     // Mercy shown to Coelacanth minions/boss
   113|    power_lust: 0,           // Aggressive/dominant choices
   114|    dreamer_connection: 0,   // Connection to the Dreamer entity
   115|    sacrifice_seen: 0        // Lyra sacrifice foreshadowing witnessed
   116|};
   117|let selectedEnding = null;   // 'sacrifice' | 'transcendence' | 'dominion'
   118|let endingEligible = [];     // Which endings are eligible (for player choice)
   119|
   120|function setNarrativeFlag(key, value) {
   121|    if (narrativeFlags.hasOwnProperty(key)) {
   122|        narrativeFlags[key] = Math.max(0, narrativeFlags[key] + value);
   123|    }
   124|}
   125|
   126|function getNarrativeFlag(key) {
   127|    return narrativeFlags[key] || 0;
   128|}
   129|
   130|// Determine which ending(s) the player qualifies for.
   131|// Returns array of eligible ending ids. If multiple, player chooses at climax.
   132|function determineEnding() {
   133|    const flags = narrativeFlags;
   134|    const eligible = [];
   135|
   136|    // SACRIFICE: Lyra trust high + sacrifice foreshadowing + mercy
   137|    if (flags.lyra_trust >= 3 && flags.sacrifice_seen >= 1 && flags.coelacanth_mercy >= 2) {
   138|        eligible.push('sacrifice');
   139|    }
   140|    // TRANSCENDENCE: Dreamer connection high + lyra trust
   141|    if (flags.dreamer_connection >= 2 && flags.lyra_trust >= 2) {
   142|        eligible.push('transcendence');
   143|    }
   144|    // DOMINION: Power lust high + low mercy
   145|    if (flags.power_lust >= 3 && flags.coelacanth_mercy <= 1) {
   146|        eligible.push('dominion');
   147|    }
   148|
   149|    // Fallback: if no ending qualifies, enable all three (player's choice)
   150|    if (eligible.length === 0) {
   151|        eligible.push('sacrifice', 'transcendence', 'dominion');
   152|    }
   153|
   154|    // If only one eligible, select it automatically
   155|    if (eligible.length === 1) {
   156|        selectedEnding = eligible[0];
   157|    } else {
   158|        endingEligible = eligible;
   159|        // Player will choose from endingEligible at the climax screen
   160|    }
   161|
   162|    return eligible;
   163|}
   164|
   165|// --- Game Entity Pools ---
   166|let initialShip = 'striker';
   167|try {
   168|    const shipSel = localStorage.getItem('dariusStar_shipSelection');
   169|    if (shipSel) {
   170|        const parsed = JSON.parse(shipSel);
   171|        if (parsed && parsed.shipId) {
   172|            initialShip = parsed.shipId;
   173|        }
   174|    }
   175|} catch(e) {}
   176|let player = new Player(initialShip);
   177|let remotePlayers = [];  // P2-P4 ship instances (GRO-958 multiplayer)
   178|const bullets = [];
   179|const enemyBullets = [];
   180|const enemies = [];
   181|const powerups = [];
   182|const particles = [];
   183|const scrapDrops = [];
   184|const floatingTexts = [];
   185|let runScrap = 0;
   186|let runScrapSaved = false;
   187|let enemyIdCounter = 0;  // Unique IDs for Economy.shouldDrop()
   188|
   189|// Procedural variation seed (GRO-1006): set at run start, stored in save
   190|let runSeed = Math.floor(Math.random() * 2147483648);
   191|
   192|// Parallax background layers (image-based)
   193|const bgLayers = [
   194|    new ParallaxLayer('bg_1', 12, 0, 0.55, canvas.height / 768),      // Far: nebula cloud
   195|    new ParallaxLayer('bg_1', 55, 0, 0.45, canvas.height / 450)        // Mid: city silhouette
   196|];
   197|
   198|// Environmental particle system (all 10 biomes)
   199|const envParticles = [];
   200|let envSpawnAccum = 0;
   201|// Seed initial particles for the starting biome (biome 1 = Abyssal Trench)
   202|for (let i = 0; i < 45; i++) envParticles.push(new EnvironmentParticle('mote'));
   203|
   204|let boss = null;
   205|let enemySpawnTimer = 1.2;
   206|
   207|const vfxExplosions = [];
   208|
   209|function createExplosion(x, y, color, count = 12) {
   210|    // Sprite-based explosion for the main visual
   211|    const explosionSize = Math.max(40, count * 3.5);
   212|    vfxExplosions.push(new SpriteExplosion(x, y, explosionSize));
   213|    // Keep particles for debris/sparks (reduced count)
   214|    const particleCount = Math.min(count, 6);
   215|    for (let i = 0; i < particleCount; i++) {
   216|        particles.push(new Particle(x, y, color));
   217|    }
   218|}
   219|
   220|// --- Hit-flash spawner (§6.2) — 5-tier hit-flash effects ---
   221|const HIT_FLASH_CONFIG = {
   222|    scout:   { size: 16, maxFrames: 4,  frameRate: 0.025, duration: 0.10, color: '#FFFFFF' },
   223|    interceptor: { size: 24, maxFrames: 6,  frameRate: 0.025, duration: 0.15, color: '#FF0055' },
   224|    heavy:   { size: 32, maxFrames: 8,  frameRate: 0.025, duration: 0.20, color: '#FF5500' },
   225|    elite:   { size: 32, maxFrames: 8,  frameRate: 0.025, duration: 0.20, color: '#FF5500' },
   226|    grunt:   { size: 16, maxFrames: 4,  frameRate: 0.025, duration: 0.10, color: '#FFFFFF' },
   227|    boss_armored:  { size: 48, maxFrames: 10, frameRate: 0.025, duration: 0.25, color: '#FF3333' },
   228|    boss_vulnerable: { size: 64, maxFrames: 12, frameRate: 0.025, duration: 0.30, color: '#FFD700' },
   229|    boss:    { size: 48, maxFrames: 10, frameRate: 0.025, duration: 0.25, color: '#FF3333' }
   230|};
   231|function spawnHitFlash(x, y, enemyType) {
   232|    const cfg = HIT_FLASH_CONFIG[enemyType] || HIT_FLASH_CONFIG['scout'];
   233|    // 5% chance of critical hit-flash (upgrade one tier)
   234|    const isCrit = Math.random() < 0.05;
   235|    const critCfg = isCrit ? (enemyType === 'boss_vulnerable' ? HIT_FLASH_CONFIG['boss_vulnerable'] :
   236|                   (HIT_FLASH_CONFIG['heavy'] || cfg)) : cfg;
   237|    hitFlashes.push({
   238|        x, y, size: critCfg.size, maxFrames: critCfg.maxFrames,
   239|        frameRate: critCfg.frameRate, duration: critCfg.duration,
   240|        color: critCfg.color, life: critCfg.duration, frame: 0, frameTime: 0
   241|    });
   242|}
   243|
   244|function checkCollision(rect1, rect2) {
   245|    return rect1.x < rect2.x + rect2.width &&
   246|           rect1.x + rect1.width > rect2.x &&
   247|           rect1.y < rect2.y + rect2.height &&
   248|           rect1.y + rect1.height > rect2.y;
   249|}
   250|
   251|function startNGPlus(prevRunData) {
   252|    // Start a New Game+ run using previous run's completion data
   253|    if (!window.NGPlus || !window.CampaignSave) return;
   254|    
   255|    const ngSave = NGPlus.start(prevRunData);
   256|    if (!ngSave) return;
   257|    
   258|    // Find an empty save slot or use slot 0
   259|    let slot = 0;
   260|    for (let s = 0; s < 3; s++) {
   261|        const existing = CampaignSave.load(s);
   262|        if (!existing) { slot = s; break; }
   263|    }
   264|    
   265|    CampaignSave.save(slot, ngSave);
   266|    localStorage.setItem('dariusStar_activeSlot', String(slot));
   267|    ngPlusRun = true;
   268|    currentNGLevel = ngSave.ngLevel || 1;
   269|    
   270|    // Clear NG+ eligibility for next run
   271|    localStorage.removeItem('darius_star_ngplus_eligible');
   272|    
   273|    playSound('menu_select');
   274|    resetGame();
   275|}
   276|
   277|function resetGame() {
   278|    score = 0;
   279|    gameOver = false;
   280|    gameWon = false;
   281|    bossSpawned = false;
   282|    boss = null;
   283|    
   284|    // GRO-1009: Reset narrative state for new run
   285|    selectedEnding = null;
   286|    endingEligible = [];
   287|    Object.keys(narrativeFlags).forEach(k => narrativeFlags[k] = 0);
   288|    // GRO-1007: Restore in-game narrative flags from save if available
   289|    if (campaignSave && campaignSave.inGameFlags) {
   290|        Object.keys(campaignSave.inGameFlags).forEach(k => {
   291|            if (narrativeFlags.hasOwnProperty(k)) {
   292|                narrativeFlags[k] = campaignSave.inGameFlags[k] || 0;
   293|            }
   294|        });
   295|    }
   296|    sirenTimer = 0;
   297|    gameTime = 0;
   298|    
   299|    // Reset Dialogue System variables
   300|    dialogueCompletedScenes = {};
   301|    activeDialogue = null;
   302|    stormActive = false;
   303|    pathfinderActive = false;
   304|    cavernNavActive = false;
   305|    cavernTimer = 0;
   306|    cavernStage = '';
   307|    shakeDuration = 0;
   308|    shakeIntensity = 0;
   309|    screenFlashAlpha = 0;
   310|    screenFlashColor = '#FFFFFF';
   311|    hitFlashes.length = 0;
   312|    overheatWarning = false;
   313|    overheatCritical = false;
   314|    overheatTimer = 0;
   315|    lowHealthPulseTimer = 0;
   316|    glitchTimer = 0;
   317|    glitchCooldown = 0;
   318|    activeBiomeName = '1: Abyssal Trench';
   319|    loadPortraitSprites();
   320|    bossDefeated = false;
   321|    bossIntroPlaying = false;
   322|    bossesDefeated = 0;
   323|    victoryVideoPlaying = false;
   324|    if (bossIntroVideo) { bossIntroVideo.pause(); bossIntroVideo.classList.remove('active'); bossIntroVideo.muted = true; }
   325|    if (victoryVideo) { victoryVideo.pause(); victoryVideo.classList.remove('active'); victoryVideo.muted = true; }
   326|    skipHint.classList.remove('active');
   327|    
   328|    runScrap = 0;
   329|    runScrapSaved = false;
   330|    newHighScoreCelebrated = false;
   331|    highScoreBannerTimer = 0;
   332|    highScoreParticles = [];
   333|    
   334|    // Load campaign save state
   335|    let activeSaveSlot = parseInt(localStorage.getItem('dariusStar_activeSlot') || '0');
   336|    let campaignSave = null;
   337|    if (window.CampaignSave) {
   338|        campaignSave = CampaignSave.load(activeSaveSlot);
   339|    }
   340|
   341|    // Re-instantiate player ship with the currently selected model or saved model
   342|    let activeShip = 'striker';
   343|    if (campaignSave && campaignSave.ship) {
   344|        activeShip = campaignSave.ship;
   345|    } else {
   346|        try {
   347|            const shipSel = localStorage.getItem('dariusStar_shipSelection');
   348|            if (shipSel) {
   349|                const parsed = JSON.parse(shipSel);
   350|                if (parsed && parsed.shipId) {
   351|                    activeShip = parsed.shipId;
   352|                }
   353|            } else {
   354|                activeShip = SHIP_OPTIONS[selectedShipIndex];
   355|            }
   356|        } catch (e) {
   357|            activeShip = SHIP_OPTIONS[selectedShipIndex];
   358|        }
   359|    }
   360|    player = new Player(activeShip);
   361|    
   362|    // GRO-958: Multiplayer — sync Player instances with Multiplayer module
   363|    remotePlayers = [];
   364|    if (window.Multiplayer && Multiplayer.players.length > 1) {
   365|        for (let i = 1; i < Multiplayer.players.length; i++) {
   366|            const mp = Multiplayer.players[i];
   367|            if (!mp.alive) continue;
   368|            const shipType = mp.ship || 'interceptor';
   369|            const rp = new Player(shipType, mp.id);
   370|            rp.x = mp.x || (80 + i * 40);
   371|            rp.y = mp.y || (180 + i * 30);
   372|            rp.isRemote = true;
   373|            remotePlayers.push(rp);
   374|        }
   375|    }
   376|
   377|    // Restore other campaign progress
   378|    if (campaignSave) {
   379|        difficulty = campaignSave.difficulty || 'normal';
   380|        currentNGLevel = campaignSave.ngLevel || 0;
   381|        // GRO-1006: Restore procedural variation seed from save
   382|        runSeed = campaignSave.seed || Math.floor(Math.random() * 2147483648);
   383|        score = campaignSave.score || 0;
   384|        runScrap = campaignSave.scrap || 0;
   385|        if (campaignSave.weaponLevel) player.weaponLevel = campaignSave.weaponLevel;
   386|        if (campaignSave.shield) player.shield = campaignSave.shield;
   387|    } else {
   388|        currentNGLevel = 0;
   389|    }
   390|
   391|    // Set LevelManager state
   392|    if (window.LevelManager) {
   393|        if (campaignSave) {
   394|            LevelManager.setBiomeAndLevel(campaignSave.biome || 1, campaignSave.wave || 1);
   395|        } else {
   396|            LevelManager.setBiomeAndLevel(1, 1);
   397|        }
   398|    }
   399|
   400|    // Re-apply score to get correct biome level
   401|    updateActiveBiome(0.016, score);
   402|    
   403|    bullets.length = 0;
   404|    enemyBullets.length = 0;
   405|    enemies.length = 0;
   406|    powerups.length = 0;
   407|    particles.length = 0;
   408|    vfxExplosions.length = 0;
   409|    floatingTexts.length = 0;
   410|    hitFlashes.length = 0;
   411|    scrapDrops.length = 0;
   412|    pdgZaps.length = 0;
   413|    envParticles.length = 0;
   414|    envSpawnAccum = 0;
   415|    // Seed initial particles for current biome
   416|    const seedType = biomeLevel === 1 ? 'mote' : (biomeLevel === 2 ? 'rust_flake' : 'mote');
   417|    for (let i = 0; i < 30; i++) envParticles.push(new EnvironmentParticle(seedType));
   418|    envBuffer.markDirty();
   419|
   420|    Combo.init();
   421|    // Re-initialize campaign modules if loaded to avoid stale state on retry/restart
   422|    if (window.Multiplayer) Multiplayer.init();
   423|    // Preserve looted segments across restarts (prevents checkpoint farming)
   424|    const savedLooted = {};
   425|    if (window.Economy && Economy._lootedSegments) {
   426|        for (const segId in Economy._lootedSegments) {
   427|            savedLooted[segId] = new Set(Economy._lootedSegments[segId]);
   428|        }
   429|    }
   430|    if (window.Economy) Economy.init();
   431|    if (window.Economy) Economy._lootedSegments = savedLooted;
   432|    if (window.BanterEngine) {
   433|        BanterEngine.init(window.Multiplayer ? Multiplayer.count : 1);
   434|        BanterEngine.trigger('level_start', 1);
   435|    }
   436|}
   437|
   438|function handleDeathOrVictoryRestart() {
   439|    let activeSaveSlot = parseInt(localStorage.getItem('dariusStar_activeSlot') || '0');
   440|    if (gameOver && window.CampaignSave) {
   441|        const restored = CampaignSave.restoreCheckpoint(activeSaveSlot);
   442|        if (restored) {
   443|            // Update save slot with restored checkpoint progress and decremented lives
   444|            const existing = CampaignSave.load(activeSaveSlot);
   445|            CampaignSave.save(activeSaveSlot, {
   446|                ...existing,
   447|                ...restored,
   448|                lives: restored.lives
   449|            });
   450|            console.log(`Restored Campaign Checkpoint in slot ${activeSaveSlot}: Biome ${restored.biome}, Lives remaining ${restored.lives}`);
   451|        } else {
   452|            // Lives exhausted or no checkpoint: reset slot progress to Biome 1
   453|            const existing = CampaignSave.load(activeSaveSlot);
   454|            if (existing) {
   455|                CampaignSave.save(activeSaveSlot, {
   456|                    ...existing,
   457|                    biome: 1,
   458|                    score: 0,
   459|                    scrap: 0,
   460|                    lives: 3
   461|                });
   462|            }
   463|            console.log(`No lives remaining. Campaign reset in slot ${activeSaveSlot}.`);
   464|        }
   465|    }
   466|    resetGame();
   467|}
   468|
   469|function loop(timestamp) {
   470|    if (!lastTime) lastTime = timestamp;
   471|    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
   472|    lastTime = timestamp;
   473|
   474|    if (!paused && !gameOver && !gameWon && !bossIntroPlaying && !victoryVideoPlaying) {
   475|        gameTime += dt;
   476|        Combo.update(dt);
   477|        update(dt);
   478|    }
   479|
   480|    draw();
   481|    requestAnimationFrame(loop);
   482|}
   483|
   484|function update(dt) {
   485|    // Screen transition overlay fading
   486|    if (targetScreen) {
   487|        transitionTimer += dt;
   488|        const halfDuration = TRANSITION_DURATION / 2;
   489|        if (transitionTimer < halfDuration) {
   490|            screenFadeAlpha = transitionTimer / halfDuration;
   491|        } else if (transitionTimer >= halfDuration && transitionTimer < TRANSITION_DURATION) {
   492|            if (currentScreen !== targetScreen) {
   493|                currentScreen = targetScreen;
   494|                if (currentScreen === SCREENS.PLAYING) {
   495|                    stopMenuMusic();
   496|                    stopCreditsMusic();
   497|                    if (!_winTransition) {
   498|                        resetGame();
   499|                    } else {
   500|                        _winTransition = false;
   501|                        gameWon = true;
   502|                        
   503|                        // Game completion: save state and trigger NGPlus.start()!
   504|                        if (window.CampaignSave) {
   505|                            let activeSaveSlot = parseInt(localStorage.getItem('dariusStar_activeSlot') || '0');
   506|                            // Save the final completed campaign state
   507|                            CampaignSave.autosave(activeSaveSlot, {
   508|                                biome: 10,
   509|                                score: score,
   510|                                runScrap: runScrap,
   511|                                ship: player.shipType,
   512|                                weaponLevel: player.weaponLevel,
   513|                                shieldMax: player.shieldMax,
   514|                                shield: player.shield,
   515|                                difficulty: difficulty,
   516|                                ngLevel: currentNGLevel,
   517|                                inGameFlags: narrativeFlags,
   518|                            });
   519|                            
   520|                            // Upgrade the slot to New Game+
   521|                            if (window.NGPlus) {
   522|                                const ngState = NGPlus.start(activeSaveSlot);
   523|                                if (ngState) {
   524|                                    CampaignSave.save(activeSaveSlot, ngState);
   525|                                    console.log(`Successfully completed game! Upgraded slot ${activeSaveSlot} to NG+${ngState.ngLevel}`);
   526|                                }
   527|                            }
   528|                        }
   529|                    }
   530|                } else if (currentScreen === SCREENS.CREDITS) {
   531|                    stopMenuMusic();
   532|                    startCreditsMusic();
   533|                    creditsScrollY = 0;
   534|                    creditsHoldTimer = 0;
   535|                } else if (currentScreen === SCREENS.CINEMATIC) {
   536|                    stopMenuMusic();
   537|                    stopCreditsMusic();
   538|                    cinematicTime = 0;
   539|                    playSound('victory_fanfare');
   540|                } else {
   541|                    stopCreditsMusic();
   542|                    startMenuMusic();
   543|                }
   544|            }
   545|            screenFadeAlpha = 1 - (transitionTimer - halfDuration) / halfDuration;
   546|        } else {
   547|            currentScreen = targetScreen;
   548|            targetScreen = null;
   549|            screenFadeAlpha = 0;
   550|        }
   551|    }
   552|
   553|    if (currentScreen !== SCREENS.PLAYING) {
   554|        if (currentScreen === SCREENS.CREDITS) {
   555|            creditsScrollY += 35 * dt;
   556|        } else if (currentScreen === SCREENS.CINEMATIC) {
   557|            cinematicTime += dt;
   558|            if (cinematicTime >= 20 && !targetScreen) {
   559|                // If boss was defeated, show victory screen instead of credits
   560|                if (bossDefeated) {
   561|                    _winTransition = true;
   562|                    transitionToScreen(SCREENS.PLAYING);
   563|                } else {
   564|                    transitionToScreen(SCREENS.CREDITS);
   565|                }
   566|            }
   567|        }
   568|        updateTitleBackground(dt);
   569|        return;
   570|    }
   571|
   572|    updateActiveBiome(dt, score);
   573|    
   574|    // GRO-1028: Audio drama systems — biome ambient loop & story beats
   575|    updateBiomeAmbientLoop(dt);
   576|    updateAudioStoryBeat(dt);
   577|
   578|    if (activeDialogue) {
   579|        activeDialogue.update(dt);
   580|        bgLayers.forEach(layer => layer.update(dt));
   581|        stars.forEach(star => star.update(dt));
   582|        for (let i = envParticles.length - 1; i >= 0; i--) {
   583|            envParticles[i].update(dt);
   584|            if (!envParticles[i].alive) envParticles.splice(i, 1);
   585|        }
   586|        
   587|        for (let i = vfxExplosions.length - 1; i >= 0; i--) {
   588|            vfxExplosions[i].update(dt);
   589|            if (!vfxExplosions[i].alive) vfxExplosions.splice(i, 1);
   590|        }
   591|        for (let i = particles.length - 1; i >= 0; i--) {
   592|            particles[i].update(dt);
   593|            if (!particles[i].alive) particles.splice(i, 1);
   594|        }
   595|        for (let i = floatingTexts.length - 1; i >= 0; i--) {
   596|            floatingTexts[i].update(dt);
   597|            if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
   598|        }
   599|        
   600|        if (uiBiome) uiBiome.innerText = activeBiomeName;
   601|        if (uiNavigator) {
   602|            if (stormActive) {
   603|                uiNavigator.innerText = 'OFFLINE (COMA)';
   604|                uiNavigator.style.color = '#ff0033';
   605|            } else if (pathfinderActive) {
   606|                uiNavigator.innerText = 'LYRA (RESONATING)';
   607|                uiNavigator.style.color = '#00ffff';
   608|            } else {
   609|                uiNavigator.innerText = 'LYRA (ONLINE)';
   610|                uiNavigator.style.color = '#00ff55';
   611|            }
   612|        }
   613|        return;
   614|    }
   615|
   616|    if (bossDefeated) {
   617|        bgLayers.forEach(layer => layer.update(dt));
   618|        stars.forEach(star => star.update(dt));
   619|        for (let i = envParticles.length - 1; i >= 0; i--) {
   620|            envParticles[i].update(dt);
   621|            if (!envParticles[i].alive) envParticles.splice(i, 1);
   622|        }
   623|        player.invulnerable = 999;
   624|        player.update(dt);
   625|        if (boss) boss.update(dt);
   626|        
   627|        bullets.forEach(b => b.update(dt));
   628|        enemyBullets.forEach(eb => eb.update(dt));
   629|        for (let i = vfxExplosions.length - 1; i >= 0; i--) {
   630|            vfxExplosions[i].update(dt);
   631|            if (!vfxExplosions[i].alive) vfxExplosions.splice(i, 1);
   632|        }
   633|        for (let i = particles.length - 1; i >= 0; i--) {
   634|            particles[i].update(dt);
   635|            if (!particles[i].alive) particles.splice(i, 1);
   636|        }
   637|        return;
   638|    }
   639|
   640|    bgLayers.forEach(layer => layer.update(dt));
   641|    stars.forEach(star => star.update(dt));
   642|    for (let i = envParticles.length - 1; i >= 0; i--) {
   643|        envParticles[i].update(dt);
   644|        if (!envParticles[i].alive) envParticles.splice(i, 1);
   645|    }
   646|    // Spawn biome-appropriate environmental particles
   647|    spawnBiomeParticles(dt);
   648|
   649|    // Offscreen buffer lazy-render: rebuild star/env buffers on interval
   650|    starBuffer.renderTimer += dt;
   651|    if (starBuffer.renderTimer >= starBuffer.renderInterval) {
   652|        starBuffer.rebuild(rebuildStarBuffer);
   653|        starBuffer.renderTimer = 0;
   654|    }
   655|    envBuffer.renderTimer += dt;
   656|    if (envBuffer.renderTimer >= envBuffer.renderInterval) {
   657|        envBuffer.rebuild(rebuildEnvBuffer);
   658|        envBuffer.renderTimer = 0;
   659|    }
   660|
   661|    player.update(dt);
   662|    for (const rp of remotePlayers) {
   663|        if (!rp.isPulledOut || rp.pullOutTimer > 0) rp.update(dt);
   664|    }
   665|
   666|    // --- Overheat detection (§6.3) — Supreme Nova (weapon 5) held fire tracking ---
   667|    const playerFiring = keys[player.inputKeys.fire] && player.weaponLevel === 5;
   668|    if (playerFiring && !player.isSpecialActive) {
   669|        overheatTimer += dt;
   670|        overheatWarning = overheatTimer >= 3.0;
   671|        overheatCritical = overheatTimer >= 4.0;
   672|        if (overheatCritical) {
   673|            // Overheat trigger: screen flash, weapon reset, damage, smoke
   674|            screenFlashAlpha = Math.max(screenFlashAlpha, 0.08);
   675|            screenFlashColor = '#FF0000';
   676|            player.weaponLevel = 1;
   677|            player.takeDamage(1);
   678|            overheatTimer = 0;
   679|            overheatWarning = false;
   680|            overheatCritical = false;
   681|            // Smoke particles from ship
   682|            for (let s = 0; s < 8; s++) {
   683|                particles.push(new Particle(
   684|                    player.x + player.width/2, player.y + player.height/2, '#888888'
   685|                ));
   686|            }
   687|        }
   688|    } else {
   689|        // Cool down when not firing at level 5
   690|        if (overheatTimer > 0) overheatTimer = Math.max(0, overheatTimer - dt * 2);
   691|        if (overheatTimer === 0) { overheatWarning = false; overheatCritical = false; }
   692|    }
   693|
   694|    // --- Low-health pulse & glitch timers (§6.4) ---
   695|    const hpPct = player.shield / player.shieldMax;
   696|
   697|    // GRO-958: Multiplayer — process joins/leaves, sync remote player state
   698|    if (window.Multiplayer) {
   699|        Multiplayer.update(dt);
   700|        // P2 joins by pressing Enter/NumpadEnter during gameplay
   701|        if (keys['Enter'] && Multiplayer.count < Multiplayer.maxPlayers && !remotePlayers.find(rp => rp.playerId === 2)) {
   702|            Multiplayer.requestJoin('interceptor');
   703|            Multiplayer.processJoins(biomeLevel);
   704|            const rp2 = new Player('interceptor', 2);
   705|            rp2.x = 120; rp2.y = 200;
   706|            rp2.isRemote = true;
   707|            remotePlayers.push(rp2);
   708|        }
   709|        // P3 joins by pressing Numpad3  (key '3')
   710|        if (keys['3'] && Multiplayer.count < Multiplayer.maxPlayers && !remotePlayers.find(rp => rp.playerId === 3)) {
   711|            Multiplayer.requestJoin('interceptor');
   712|            Multiplayer.processJoins(biomeLevel);
   713|            const rp3 = new Player('interceptor', 3);
   714|            rp3.x = 140; rp3.y = 240;
   715|            rp3.isRemote = true;
   716|            remotePlayers.push(rp3);
   717|        }
   718|        // Sync remote player shield/state back to Multiplayer module
   719|        for (const rp of remotePlayers) {
   720|            const mp = Multiplayer.players.find(p => p.id === rp.playerId);
   721|            if (mp && mp.alive) {
   722|                mp.shield = rp.shield;
   723|                mp.x = rp.x;
   724|                mp.y = rp.y;
   725|                if (rp.isPulledOut && !mp._wasPulledOut) {
   726|                    mp._wasPulledOut = true;
   727|                    Multiplayer.requestLeave(rp.playerId);
   728|                }
   729|                if (!rp.isPulledOut) mp._wasPulledOut = false;
   730|            }
   731|        }
   732|        // Process any queued leaves
   733|        const leaveLine = Multiplayer.processLeaves();
   734|        if (leaveLine) {
   735|            floatingTexts.push({ text: leaveLine, x: canvas.width/2, y: 60, life: 3.0, color: '#ff6600' });
   736|        }
   737|    }
   738|    if (hpPct < 0.25) {
   739|        lowHealthPulseTimer += dt;
   740|        // Glitch lines at <10% HP: cycle 100ms glitch, then 1-2s cooldown
   741|        if (hpPct < 0.10) {
   742|            if (glitchTimer > 0) {
   743|                glitchTimer -= dt; // glitch active, count down
   744|            } else {
   745|                glitchCooldown -= dt;
   746|                if (glitchCooldown <= 0) {
   747|                    glitchTimer = 0.10; // trigger 100ms glitch
   748|                    glitchCooldown = 1.0 + Math.random() * 2.0; // 1-3s until next
   749|                }
   750|            }
   751|        }
   752|    } else {
   753|        lowHealthPulseTimer = 0;
   754|        glitchTimer = 0;
   755|        glitchCooldown = 1.0;
   756|    }
   757|
   758|    if (!bossSpawned && !bossIntroPlaying) {
   759|        // Feeds wave spawner: LevelManager handles queuing and spawning of enemies
   760|        // (no direct spawning code needed here, LevelManager.update does it)
   761|
   762|        // Preload boss assets when approaching the current biome's boss threshold
   763|        const nextBossIdx = bossesDefeated;
   764|        const preloadThreshold = nextBossIdx < 10 ? BOSS_SCORE_THRESHOLDS[nextBossIdx] - 100 : 2900;
   765|        if (score >= preloadThreshold && !bossAssetsLoaded) {
   766|            preloadBossAssets();
   767|        }
   768|
   769|        // Check if current level has a boss trigger condition
   770|        if (window.LevelManager && LevelManager.currentLevelConfig && LevelManager.currentLevelConfig.bossTrigger) {
   771|            if (!bossSpawned) {
   772|                playBossIntro();
   773|            }
   774|        }
   775|    } else {
   776|        if (sirenTimer > 0) {
   777|            sirenTimer -= dt;
   778|            if (Math.floor(sirenTimer * 10) % 4 === 0) {
   779|                playSound('siren');
   780|            }
   781|            if (sirenTimer <= 0) {
   782|                boss = new Boss();
   783|            }
   784|        } else if (boss) {
   785|            boss.update(dt);
   786|        }
   787|    }
   788|
   789|    for (let i = bullets.length - 1; i >= 0; i--) {
   790|        const b = bullets[i];
   791|        b.update(dt);
   792|        if (b.x > canvas.width + 20) {
   793|            bullets.splice(i, 1);
   794|        }
   795|    }
   796|
   797|    for (let i = enemyBullets.length - 1; i >= 0; i--) {
   798|        const eb = enemyBullets[i];
   799|        eb.update(dt);
   800|        
   801|        const ebBox = { x: eb.x - eb.size, y: eb.y - eb.size, width: eb.size*2, height: eb.size*2 };
   802|        if (checkCollision(ebBox, player)) {
   803|            player.takeDamage(12);
   804|            enemyBullets.splice(i, 1);
   805|            continue;
   806|        }
   807|        // GRO-958: Check remote players too
   808|        let ebHitRemote = false;
   809|        for (const rp of remotePlayers) {
   810|            if (checkCollision(ebBox, rp)) {
   811|                rp.takeDamage(12);
   812|                ebHitRemote = true;
   813|                break;
   814|            }
   815|        }
   816|        if (ebHitRemote) {
   817|            enemyBullets.splice(i, 1);
   818|            continue;
   819|        }
   820|
   821|        if (eb.x < -20) {
   822|            enemyBullets.splice(i, 1);
   823|        }
   824|    }
   825|
   826|    for (let i = enemies.length - 1; i >= 0; i--) {
   827|        const e = enemies[i];
   828|        e.update(dt);
   829|
   830|        if (checkCollision(e, player)) {
   831|            player.takeDamage(20);
   832|            createExplosion(e.x + e.width/2, e.y + e.height/2, e.color, 10);
   833|            enemies.splice(i, 1);
   834|            continue;
   835|        }
   836|        // GRO-958: Check remote players
   837|        let enemyHitRemote = false;
   838|        for (const rp of remotePlayers) {
   839|            if (checkCollision(e, rp)) {
   840|                rp.takeDamage(20);
   841|                createExplosion(e.x + e.width/2, e.y + e.height/2, e.color, 10);
   842|                enemyHitRemote = true;
   843|                break;
   844|            }
   845|        }
   846|        if (enemyHitRemote) {
   847|            enemies.splice(i, 1);
   848|            continue;
   849|        }
   850|
   851|        for (let j = bullets.length - 1; j >= 0; j--) {
   852|            const b = bullets[j];
   853|            const bBox = { x: b.x - b.size, y: b.y - 2, width: b.size*2, height: 4 };
   854|            if (checkCollision(bBox, e)) {
   855|                const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
   856|                const dmg = (player.weaponLevel >= 4 ? 2 : 1) * (mods ? mods.weaponDamageMultiplier : 1.0);
   857|                e.hp -= dmg;
   858|                bullets.splice(j, 1);
   859|                playSound('hit');
   860|                // Spawn hit-flash (§6.2) at impact point
   861|                spawnHitFlash(e.x + e.width/2, e.y + e.height/2, e.enemyType);
   862|
   863|                if (e.hp <= 0) {
   864|                    createExplosion(e.x + e.width/2, e.y + e.height/2, e.color, 12);
   865|                    playSound('explosion');
   866|                    const comboMult = Combo.onKill();
   867|                    score += Math.floor(e.scoreValue * comboMult);
   868|
   869|                    // Economy-based scrap drops (prevents checkpoint farming)
   870|                    if (window.Economy && Economy.shouldDrop(e.id)) {
   871|                        const drop = Economy.rollDrop(e.enemyType, biomeLevel);
   872|                        const ecoDrop = Economy.createDrop(e.x + e.width/2, e.y + e.height/2, drop.type, drop.amount);
   873|                        scrapDrops.push(new ScrapDrop(ecoDrop.x, ecoDrop.y, ecoDrop.type, drop.amount));
   874|                    }
   875|
   876|                    const dropChance = Math.random();
   877|                    if (dropChance < 0.15) {
   878|                        powerups.push(new PowerUp(e.x, e.y, 'W'));
   879|                    } else if (dropChance < 0.23) {
   880|                        powerups.push(new PowerUp(e.x, e.y, 'S'));
   881|                    }
   882|
   883|                    enemies.splice(i, 1);
   884|                    break;
   885|                }
   886|            }
   887|        }
   888|
   889|        if (e.x < -60) {
   890|            enemies.splice(i, 1);
   891|        }
   892|    }
   893|
   894|    if (boss) {
   895|        for (let j = bullets.length - 1; j >= 0; j--) {
   896|            const b = bullets[j];
   897|            const bBox = { x: b.x - b.size, y: b.y - 2, width: b.size*2, height: 4 };
   898|            if (checkCollision(bBox, boss)) {
   899|                const mods = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.getGameplayModifiers() : null;
   900|                const dmg = (player.weaponLevel >= 4 ? 2 : 1) * (mods ? mods.weaponDamageMultiplier : 1.0);
   901|                boss.takeDamage(dmg);
   902|                bullets.splice(j, 1);
   903|            }
   904|        }
   905|
   906|        if (checkCollision(player, boss)) {
   907|            player.takeDamage(35);
   908|        }
   909|
   910|        if (boss.state === 'laser_fire') {
   911|            const laserYStart = boss.y + 50;
   912|            const laserHeight = 40;
   913|            if (player.x + player.width > 0 && player.x < boss.x + 20) {
   914|                if (player.y + player.height > laserYStart && player.y < laserYStart + laserHeight) {
   915|                    player.takeDamage(3);
   916|                }
   917|            }
   918|        }
   919|    }
   920|
   921|    for (let i = powerups.length - 1; i >= 0; i--) {
   922|        const pu = powerups[i];
   923|        pu.update(dt);
   924|
   925|        if (checkCollision(pu, player)) {
   926|            playSound('powerup');
   927|            if (pu.kind === 'W') {
   928|                player.weaponLevel = Math.min(5, player.weaponLevel + 1);
   929|            } else if (pu.kind === 'S') {
   930|                player.shield = Math.min(player.shieldMax, player.shield + 30);
   931|            }
   932|            powerups.splice(i, 1);
   933|            continue;
   934|        }
   935|
   936|        if (pu.x < -30) {
   937|            powerups.splice(i, 1);
   938|        }
   939|    }
   940|
   941|    for (let i = scrapDrops.length - 1; i >= 0; i--) {
   942|        const sd = scrapDrops[i];
   943|        sd.update(dt);
   944|
   945|        if (checkCollision(sd, player)) {
   946|            playSound('powerup');
   947|            let collectedVal = sd.value;
   948|            if (player.shipType === 'warden') {
   949|                collectedVal = Math.round(collectedVal * 1.20);
   950|            }
   951|            runScrap += collectedVal;
   952|            // NG+ scrap multiplier: double+ scrap in NG+ runs
   953|            if (ngPlusRun && currentNGLevel > 0 && window.NGPlus) {
   954|                const bonus = collectedVal * (NGPlus.getScrapMult({ ngLevel: currentNGLevel }) - 1);
   955|                runScrap += Math.round(bonus);
   956|                collectedVal += Math.round(bonus);
   957|            }
   958|            floatingTexts.push(new FloatingText(sd.x, sd.y, `+⚙️${collectedVal}`, '#00ff55'));
   959|            scrapDrops.splice(i, 1);
   960|            continue;
   961|        }
   962|
   963|        if (sd.x < -30) {
   964|            scrapDrops.splice(i, 1);
   965|        }
   966|    }
   967|
   968|    for (let i = floatingTexts.length - 1; i >= 0; i--) {
   969|        const ft = floatingTexts[i];
   970|        ft.update(dt);
   971|        if (ft.life <= 0) {
   972|            floatingTexts.splice(i, 1);
   973|        }
   974|    }
   975|
   976|    for (let i = particles.length - 1; i >= 0; i--) {
   977|        const p = particles[i];
   978|        p.update(dt);
   979|        if (p.alpha <= 0) {
   980|            particles.splice(i, 1);
   981|        }
   982|    }
   983|
   984|    for (let i = vfxExplosions.length - 1; i >= 0; i--) {
   985|        vfxExplosions[i].update(dt);
   986|        if (!vfxExplosions[i].alive) {
   987|            vfxExplosions.splice(i, 1);
   988|        }
   989|    }
   990|    
   991|    // Update Warden point-defense zaps
   992|    for (let i = pdgZaps.length - 1; i >= 0; i--) {
   993|        pdgZaps[i].timer -= dt;
   994|        if (pdgZaps[i].timer <= 0) {
   995|            pdgZaps.splice(i, 1);
   996|        }
   997|    }
   998|
   999|    // Update high score celebration particles
  1000|    if (highScoreBannerTimer > 0) {
  1001|        highScoreBannerTimer -= dt;
  1002|        for (let i = highScoreParticles.length - 1; i >= 0; i--) {
  1003|            const p = highScoreParticles[i];
  1004|            p.x += p.vx * dt;
  1005|            p.y += p.vy * dt;
  1006|            p.vy += 30 * dt; // gravity
  1007|            p.life -= dt;
  1008|            if (p.life <= 0) {
  1009|                highScoreParticles.splice(i, 1);
  1010|            }
  1011|        }
  1012|    }
  1013|
  1014|    if ((gameOver || gameWon) && !runScrapSaved) {
  1015|        if (window.DS_UpgradeSystem) {
  1016|            window.DS_UpgradeSystem.addScrap(runScrap);
  1017|        }
  1018|        runScrapSaved = true;
  1019|        
  1020|        // Save score to leaderboard
  1021|        if (window.Leaderboard) {
  1022|            let isNewBest = false;
  1023|            
  1024|            if (runScrap > 0) {
  1025|                // Submit to Scrap Lord
  1026|                Leaderboard.submit('scrapLord', {
  1027|                    scrapCollected: runScrap,
  1028|                    ship: selectedShip,
  1029|                    difficulty: difficulty
  1030|                });
  1031|                isNewBest = Leaderboard.isPersonalBest('scrapLord', runScrap, selectedShip);
  1032|            }
  1033|            
  1034|            if (gameWon) {
  1035|                // Submit to Speedrun and Survivor
  1036|                Leaderboard.submit('speedrun', {
  1037|                    timeSeconds: gameTime,
  1038|                    ship: selectedShip,
  1039|                    difficulty: difficulty
  1040|                });
  1041|                Leaderboard.submit('survivor', {
  1042|                    deaths: 0,
  1043|                    ship: selectedShip,
  1044|                    difficulty: difficulty
  1045|                });
  1046|                const isNewSpeedBest = Leaderboard.isPersonalBest('speedrun', gameTime, selectedShip);
  1047|                if (isNewSpeedBest) isNewBest = true;
  1048|            }
  1049|            
  1050|            // Check for new high score / record
  1051|            if (isNewBest && !newHighScoreCelebrated) {
  1052|                newHighScoreCelebrated = true;
  1053|                highScoreBannerTimer = 4.0; // 4 seconds of celebration
  1054|                // Spawn celebration particles
  1055|                for (let p = 0; p < 40; p++) {
  1056|                    highScoreParticles.push({
  1057|                        x: canvas.width / 2 + (Math.random() - 0.5) * 400,
  1058|                        y: canvas.height / 2 + (Math.random() - 0.5) * 200,
  1059|                        vx: (Math.random() - 0.5) * 120,
  1060|                        vy: (Math.random() - 0.5) * 120 - 40,
  1061|                        life: 1.5 + Math.random() * 2.0,
  1062|                        color: ['#ffd700', '#ffaa00', '#ff0055', '#00ffff'][Math.floor(Math.random() * 4)],
  1063|                        size: 3 + Math.random() * 5
  1064|                    });
  1065|                }
  1066|            }
  1067|        }
  1068|    }
  1069|
  1070|    if (player.isPulledOut) {
  1071|        uiShield.innerText = 'REPAIR ' + Math.ceil(player.pullOutTimer) + 's';
  1072|        uiShield.style.color = '#ff6600';
  1073|    } else {
  1074|        uiShield.innerText = Math.round(player.shield) + '%';
  1075|        uiShield.style.color = player.shield > 40 ? '#00ff00' : '#ff0033';
  1076|    }
  1077|    // Low-health health bar pulse animation (§6.4)
  1078|    const uiHpPercent = player.shield / player.shieldMax;
  1079|    if (uiHpPercent < 0.25) {
  1080|        const pulse = Math.sin(lowHealthPulseTimer * 9) * 0.5 + 0.5;
  1081|        const r = Math.floor(255 * pulse);
  1082|        const g = Math.floor(0 * pulse);
  1083|        const b = Math.floor(0 * pulse);
  1084|        uiShield.style.textShadow = `0 0 ${4 + pulse * 8}px rgb(${r},${g},${b})`;
  1085|        uiShield.style.transform = `scale(${1 + pulse * 0.15})`;
  1086|    } else {
  1087|        uiShield.style.textShadow = '';
  1088|        uiShield.style.transform = '';
  1089|    }
  1090|    uiWeapon.innerText = 'LVL ' + player.weaponLevel + (player.weaponLevel === 5 ? ' (MAX)' : '');
  1091|    uiScore.innerText = score;
  1092|    if (uiScrap) uiScrap.innerText = '⚙️' + runScrap;
  1093|
  1094|    // Banter display
  1095|    if (window.BanterEngine) {
  1096|        BanterEngine.update(dt);
  1097|        const activeBanter = BanterEngine.getActive();
  1098|        const banterEl = document.getElementById('ui-banter');
  1099|        if (banterEl) {
  1100|            if (activeBanter) {
  1101|                // Play the procedural environmental cue once when it becomes active
  1102|                if (activeBanter.cue && !activeBanter._cuePlayed) {
  1103|                    playSound(activeBanter.cue);
  1104|                    activeBanter._cuePlayed = true;
  1105|                }
  1106|                if (activeBanter.l.startsWith('[SILENCE]')) {
  1107|                    // Strip [SILENCE] tag and format as soft environmental action caption
  1108|                    banterEl.innerText = activeBanter.l.replace('[SILENCE]', '').trim();
  1109|                    banterEl.style.fontStyle = 'italic';
  1110|                    banterEl.style.color = '#a0ffa0'; // soft cyber-green
  1111|                } else {
  1112|                    banterEl.innerText = activeBanter.s + ': ' + activeBanter.l;
  1113|                    banterEl.style.fontStyle = 'normal';
  1114|                    banterEl.style.color = ''; // reset to default
  1115|                }
  1116|                banterEl.style.opacity = '1';
  1117|            } else {
  1118|                banterEl.style.opacity = '0';
  1119|            }
  1120|        }
  1121|    }
  1122|    
  1123|    if (uiBoost) {
  1124|        if (player.isBoosting) {
  1125|            uiBoost.innerText = 'BOOSTING!';
  1126|            uiBoost.style.color = '#00ffff';
  1127|        } else if (player.boostCooldown > 0) {
  1128|            uiBoost.innerText = `COOLDOWN (${Math.ceil(player.boostCooldown)}s)`;
  1129|            uiBoost.style.color = '#ff0033';
  1130|        } else {
  1131|            uiBoost.innerText = 'READY';
  1132|            uiBoost.style.color = '#ffaa00';
  1133|        }
  1134|    }
  1135|    
  1136|    if (uiSpecial) {
  1137|        if (player.isSpecialActive) {
  1138|            uiSpecial.innerText = `OVERLOAD (${Math.ceil(player.specialActiveTimer)}s)`;
  1139|            uiSpecial.style.color = '#ff00aa';
  1140|        } else if (player.specialCooldown > 0) {
  1141|            uiSpecial.innerText = `COOLDOWN (${Math.ceil(player.specialCooldown)}s)`;
  1142|            uiSpecial.style.color = '#ff0033';
  1143|        } else {
  1144|            uiSpecial.innerText = 'READY (K)';
  1145|            uiSpecial.style.color = '#b026ff';
  1146|        }
  1147|    }
  1148|    
  1149|    if (uiDodge) {
  1150|        if (player.isDodging) {
  1151|            uiDodge.innerText = 'EVADING!';
  1152|            uiDodge.style.color = '#00ffaa';
  1153|        } else if (player.dodgeCooldown > 0) {
  1154|            uiDodge.innerText = `COOLDOWN (${Math.ceil(player.dodgeCooldown)}s)`;
  1155|            uiDodge.style.color = '#ff0033';
  1156|        } else {
  1157|            uiDodge.innerText = 'READY (E)';
  1158|            uiDodge.style.color = '#00ffff';
  1159|        }
  1160|    }
  1161|}
  1162|
  1163|function draw() {
  1164|    if (currentScreen !== SCREENS.PLAYING) {
  1165|        drawMenuScreens();
  1166|        if (screenFadeAlpha > 0) {
  1167|            ctx.save();
  1168|            ctx.fillStyle = `rgba(0, 0, 0, ${screenFadeAlpha})`;
  1169|            ctx.fillRect(0, 0, canvas.width, canvas.height);
  1170|            ctx.restore();
  1171|        }
  1172|        return;
  1173|    }
  1174|
  1175|    ctx.fillStyle = '#010108';
  1176|    ctx.fillRect(0, 0, canvas.width, canvas.height);
  1177|
  1178|    // Render parallax layers back-to-front (image-based, drawn directly)
  1179|    bgLayers.forEach(layer => layer.draw());
  1180|
  1181|    // Blit offscreen buffers (lazy-rendered every 200-250ms)
  1182|    // First frame: force-build buffers if not yet rendered
  1183|    if (starBuffer.dirty) starBuffer.rebuild(rebuildStarBuffer);
  1184|    if (envBuffer.dirty) envBuffer.rebuild(rebuildEnvBuffer);
  1185|    ctx.drawImage(starBuffer.canvas, 0, 0);
  1186|    ctx.drawImage(envBuffer.canvas, 0, 0);
  1187|
  1188|    bullets.forEach(b => b.draw());
  1189|    enemyBullets.forEach(eb => eb.draw());
  1190|    powerups.forEach(pu => pu.draw());
  1191|    scrapDrops.forEach(sd => sd.draw());
  1192|    enemies.forEach(e => e.draw());
  1193|    if (boss) boss.draw();
  1194|    player.draw();
  1195|    for (const rp of remotePlayers) rp.draw();
  1196|    vfxExplosions.forEach(ex => ex.draw());
  1197|    
  1198|    // Combo counter HUD overlay
  1199|    Combo.draw(ctx);
  1200|    
  1201|    // Draw Warden Point Defense Grid zaps
  1202|    pdgZaps.forEach(zap => {
  1203|        ctx.save();
  1204|        ctx.strokeStyle = '#ff6600';
  1205|        ctx.lineWidth = 2;
  1206|        ctx.shadowColor = '#ff6600';
  1207|        ctx.shadowBlur = 8;
  1208|        ctx.beginPath();
  1209|        ctx.moveTo(zap.x1, zap.y1);
  1210|        ctx.lineTo(zap.x2, zap.y2);
  1211|        ctx.stroke();
  1212|        ctx.restore();
  1213|    });
  1214|    particles.forEach(p => p.draw());
  1215|    floatingTexts.forEach(ft => ft.draw());
  1216|
  1217|    // --- Hit-flash effects (5-tier weapon hit) ---
  1218|    for (const hf of hitFlashes) {
  1219|        hf.frameTime += 0.016;
  1220|        if (hf.frameTime >= hf.frameRate) {
  1221|            hf.frameTime -= hf.frameRate;
  1222|            hf.frame++;
  1223|        }
  1224|        const lifeRatio = hf.life / hf.duration;
  1225|        const alpha = lifeRatio;
  1226|        const size = hf.size * (1 + (1 - lifeRatio) * 0.3);
  1227|        if (hf.frame < hf.maxFrames) {
  1228|            ctx.save();
  1229|            ctx.globalAlpha = alpha;
  1230|            ctx.fillStyle = hf.color;
  1231|            ctx.shadowColor = hf.color;
  1232|            ctx.shadowBlur = size * 0.5;
  1233|            const hs = size * (1 - hf.frame / hf.maxFrames);
  1234|            ctx.fillRect(hf.x - hs/2, hf.y - hs/2, hs, hs);
  1235|            ctx.restore();
  1236|        }
  1237|    }
  1238|    // Cull expired hit flashes
  1239|    for (let i = hitFlashes.length - 1; i >= 0; i--) {
  1240|        hitFlashes[i].life -= 0.016;
  1241|        if (hitFlashes[i].life <= 0) hitFlashes.splice(i, 1);
  1242|    }
  1243|
  1244|    // --- Screen flash overlay (biome shake tint) ---
  1245|    if (screenFlashAlpha > 0) {
  1246|        ctx.save();
  1247|        ctx.globalAlpha = screenFlashAlpha;
  1248|        ctx.fillStyle = screenFlashColor;
  1249|        ctx.fillRect(0, 0, canvas.width, canvas.height);
  1250|        ctx.restore();
  1251|        screenFlashAlpha = Math.max(0, screenFlashAlpha - 0.016);
  1252|    }
  1253|
  1254|    // --- Low-health pulse (screen border red at <25% HP) ---
  1255|    const drawHpPercent = player.shield / player.shieldMax;
  1256|    if (drawHpPercent < 0.25) {
  1257|        const urgency = drawHpPercent < 0.10 ? 1.0 : 0.5;
  1258|        const pulseAlpha = (0.10 + Math.sin(lowHealthPulseTimer * 9) * 0.06) * urgency;
  1259|        const borderWidth = 8 + (drawHpPercent < 0.10 ? 6 : 0);
  1260|        ctx.save();
  1261|        ctx.globalAlpha = pulseAlpha;
  1262|        ctx.fillStyle = '#FF0000';
  1263|        ctx.fillRect(0, 0, canvas.width, borderWidth);
  1264|        ctx.fillRect(0, canvas.height - borderWidth, canvas.width, borderWidth);
  1265|        ctx.fillRect(0, 0, borderWidth, canvas.height);
  1266|        ctx.fillRect(canvas.width - borderWidth, 0, borderWidth, canvas.height);
  1267|        ctx.restore();
  1268|
  1269|        // Static glitch lines at <10% HP
  1270|        if (glitchTimer > 0) {
  1271|            ctx.save();
  1272|            ctx.globalAlpha = 0.05;
  1273|            ctx.fillStyle = '#FFFFFF';
  1274|            for (let g = 0; g < 3; g++) {
  1275|                const gy = Math.random() * canvas.height;
  1276|                ctx.fillRect(0, gy, canvas.width, 2 + Math.random() * 4);
  1277|            }
  1278|            ctx.restore();
  1279|        }
  1280|    }
  1281|
  1282|    // --- Overheat glow (weapon barrel white-to-red gradient) ---
  1283|    if (overheatWarning) {
  1284|        const owAlpha = overheatCritical ? 0.25 : 0.12;
  1285|        const pulse = Math.sin(gameTime * 12) * 0.5 + 0.5;
  1286|        ctx.save();
  1287|        ctx.globalAlpha = owAlpha * (0.5 + pulse * 0.5);
  1288|        const shipCX = player.x + player.width;
  1289|        const shipCY = player.y + player.height / 2;
  1290|        const glowRadius = overheatCritical ? 60 : 40;
  1291|        const grad = ctx.createRadialGradient(shipCX - 10, shipCY, 0, shipCX, shipCY, glowRadius);
  1292|        grad.addColorStop(0, '#FFFFFF');
  1293|        grad.addColorStop(0.2, '#FFAA00');
  1294|        grad.addColorStop(0.6, '#FF4400');
  1295|        grad.addColorStop(1, 'transparent');
  1296|        ctx.fillStyle = grad;
  1297|        ctx.fillRect(shipCX - glowRadius, shipCY - glowRadius, glowRadius * 2, glowRadius * 2);
  1298|        if (overheatCritical) {
  1299|            ctx.fillStyle = `rgba(255, 0, 0, ${0.3 + pulse * 0.3})`;
  1300|            ctx.fillRect(10, canvas.height - 18, 120, 10);
  1301|            ctx.fillStyle = '#FFFFFF';
  1302|            ctx.font = '9px monospace';
  1303|            ctx.fillText('OVERHEAT!', 14, canvas.height - 10);
  1304|        }
  1305|        ctx.restore();
  1306|    }
  1307|
  1308|    // --- Screen shake decay ---
  1309|    if (shakeDuration > 0) {
  1310|        shakeDuration = Math.max(0, shakeDuration - 0.016);
  1311|        if (shakeDuration <= 0) {
  1312|            shakeIntensity = 0;
  1313|        }
  1314|    }
  1315|    
  1316|    // --- Biome environmental particles ---
  1317|    if (bossAssetsLoading && !bossAssetsLoaded) {
  1318|        const loadY = canvas.height - 30;
  1319|        ctx.fillStyle = 'rgba(5, 5, 15, 0.8)';
  1320|        ctx.fillRect(canvas.width / 2 - 100, loadY - 12, 200, 28);
  1321|
  1322|        // Progress bar background
  1323|        ctx.fillStyle = '#1a1a2e';
  1324|        ctx.fillRect(canvas.width / 2 - 80, loadY + 2, 160, 6);
  1325|
  1326|        // Progress bar fill
  1327|        ctx.fillStyle = '#00ffff';
  1328|        ctx.fillRect(canvas.width / 2 - 80, loadY + 2, 160 * (bossLoadProgress / 100), 6);
  1329|
  1330|        // Text
  1331|        ctx.fillStyle = '#00ffff';
  1332|        ctx.font = '10px monospace';
  1333|        ctx.textAlign = 'center';
  1334|        ctx.fillText('PRELOADING BOSS ASSETS... ' + bossLoadProgress + '%', canvas.width / 2, loadY - 2);
  1335|    }
  1336|
  1337|    if (sirenTimer > 0) {
  1338|        ctx.fillStyle = 'rgba(255, 0, 0, ' + (Math.sin(gameTime * 20) * 0.2 + 0.25) + ')';
  1339|        ctx.fillRect(0, 0, canvas.width, canvas.height);
  1340|        ctx.fillStyle = '#ff0033';
  1341|        ctx.font = 'bold 32px monospace';
  1342|        ctx.textAlign = 'center';
  1343|        ctx.fillText('WARNING: BOSS ENGAGING', canvas.width / 2, canvas.height / 2 - 20);
  1344|        ctx.font = '16px monospace';
  1345|        ctx.fillText('CRITICAL SIGNALS DETECTED AHEAD', canvas.width / 2, canvas.height / 2 + 15);
  1346|    }
  1347|
  1348|    if (boss && boss.state !== 'intro') {
  1349|        const barWidth = 300;
  1350|        const barHeight = 12;
  1351|        const bx = canvas.width / 2 - barWidth / 2;
  1352|        const by = 20;
  1353|
  1354|        ctx.fillStyle = '#111';
  1355|        ctx.fillRect(bx, by, barWidth, barHeight);
  1356|
  1357|        const hpPercent = boss.hp / boss.hpMax;
  1358|        ctx.fillStyle = hpPercent > 0.4 ? '#ff3300' : '#ff00ff';
  1359|        ctx.fillRect(bx, by, barWidth * hpPercent, barHeight);
  1360|
  1361|        ctx.strokeStyle = '#fff';
  1362|        ctx.lineWidth = 1;
  1363|        ctx.strokeRect(bx, by, barWidth, barHeight);
  1364|
  1365|        ctx.fillStyle = '#fff';
  1366|        ctx.font = 'bold 11px monospace';
  1367|        ctx.textAlign = 'center';
  1368|        ctx.fillText('CYBER COELACANTH', canvas.width / 2, by - 6);
  1369|    }
  1370|
  1371|    if (paused) {
  1372|        ctx.save();
  1373|        ctx.fillStyle = 'rgba(5, 5, 15, 0.82)';
  1374|        ctx.fillRect(0, 0, canvas.width, canvas.height);
  1375|        
  1376|        if (pauseSubScreen === 'menu') {
  1377|            // Title
  1378|            ctx.fillStyle = '#00ffff';
  1379|            ctx.font = 'bold 36px monospace';
  1380|            ctx.textAlign = 'center';
  1381|            ctx.shadowColor = '#00ffff';
  1382|            ctx.shadowBlur = 12;
  1383|            ctx.fillText('SYSTEM PAUSED', canvas.width / 2, 150);
  1384|            ctx.shadowBlur = 0;
  1385|            
  1386|            // Pause menu options
  1387|            const startY = 240;
  1388|            const spacing = 44;
  1389|            for (let i = 0; i < PAUSE_OPTIONS.length; i++) {
  1390|                const itemY = startY + i * spacing;
  1391|                const isSelected = pauseMenuIndex === i;
  1392|                
  1393|                ctx.textAlign = 'center';
  1394|                ctx.font = 'bold ' + (isSelected ? '22' : '18') + 'px monospace';
  1395|                
  1396|                // Selection indicator
  1397|                if (isSelected) {
  1398|                    ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
  1399|                    ctx.fillRect(canvas.width / 2 - 140, itemY - 18, 280, 36);
  1400|                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
  1401|                    ctx.strokeRect(canvas.width / 2 - 140, itemY - 18, 280, 36);
  1402|                }
  1403|                
  1404|                ctx.fillStyle = isSelected ? '#00ffff' : '#8a8a9f';
  1405|                ctx.fillText(PAUSE_OPTIONS[i], canvas.width / 2, itemY + 6);
  1406|            }
  1407|            
  1408|            // Footer hints
  1409|            ctx.fillStyle = '#4a4a5f';
  1410|            ctx.font = '11px monospace';
  1411|            ctx.textAlign = 'center';
  1412|            ctx.fillText('ARROW KEYS to Navigate  |  ENTER to Select  |  P / ESC to Resume', canvas.width / 2, canvas.height - 40);
  1413|            
  1414|        } else if (pauseSubScreen === 'settings') {
  1415|            // Settings sub-screen title
  1416|            ctx.fillStyle = '#ffaa00';
  1417|            ctx.font = 'bold 28px monospace';
  1418|            ctx.textAlign = 'center';
  1419|            ctx.shadowColor = '#ffaa00';
  1420|            ctx.shadowBlur = 10;
  1421|            ctx.fillText('SYSTEM SETTINGS', canvas.width / 2, 100);
  1422|            ctx.shadowBlur = 0;
  1423|            
  1424|            const startY = 190;
  1425|            const spacing = 40;
  1426|            for (let i = 0; i < SETTINGS_OPTIONS.length; i++) {
  1427|                const itemY = startY + i * spacing;
  1428|                const isSelected = selectedSettingsIndex === i;
  1429|                
  1430|                ctx.textAlign = 'left';
  1431|                ctx.font = 'bold 14px monospace';
  1432|                ctx.fillStyle = isSelected ? '#00ffff' : '#8a8a9f';
  1433|                
  1434|                if (i < 3) {
  1435|                    const volVal = i === 0 ? masterVolume : (i === 1 ? sfxVolume : musicVolume);
  1436|                    ctx.fillText(SETTINGS_OPTIONS[i], 220, itemY + 5);
  1437|                    
  1438|                    const sliderX = 450;
  1439|                    const sliderWidth = 130;
  1440|                    ctx.fillStyle = '#222';
  1441|                    ctx.fillRect(sliderX, itemY - 6, sliderWidth, 12);
  1442|                    
  1443|                    ctx.fillStyle = isSelected ? '#00ffff' : '#ff0055';
  1444|                    ctx.fillRect(sliderX, itemY - 6, sliderWidth * volVal, 12);
  1445|                    
  1446|                    ctx.strokeStyle = '#fff';
  1447|                    ctx.strokeRect(sliderX, itemY - 6, sliderWidth, 12);
  1448|                    
  1449|                    ctx.fillText(Math.round(volVal * 100) + '%', 595, itemY + 5);
  1450|                } else if (i === 3) {
  1451|                    ctx.fillText(SETTINGS_OPTIONS[i], 220, itemY + 5);
  1452|                    ctx.fillStyle = isSelected ? '#ffffff' : '#6a6a7f';
  1453|                    ctx.fillText(difficulty.toUpperCase(), 450, itemY + 5);
  1454|                } else if (i >= 4 && i <= 6) {
  1455|                    // Toggle settings: AUDIO TUNNELS, BANTER SYSTEM, STREAMER MODE
  1456|                    ctx.fillText(SETTINGS_OPTIONS[i], 220, itemY + 5);
  1457|                    let toggleVal = false;
  1458|                    if (i === 4) toggleVal = audioTunnelsEnabled;
  1459|                    else if (i === 5) toggleVal = banterEnabled;
  1460|                    else if (i === 6) toggleVal = streamerMode;
  1461|                    ctx.fillStyle = toggleVal ? '#00ff88' : '#ff3355';
  1462|                    ctx.fillText(toggleVal ? 'ON' : 'OFF', 470, itemY + 5);
  1463|                    ctx.fillStyle = toggleVal ? '#00ff88' : '#ff3355';
  1464|                    ctx.beginPath();
  1465|                    ctx.arc(445, itemY + 1, 5, 0, Math.PI * 2);
  1466|                    ctx.fill();
  1467|                } else if (i === 7) {
  1468|                    ctx.textAlign = 'center';
  1469|                    ctx.fillStyle = isSelected ? '#ff0055' : '#8a8a9f';
  1470|                    ctx.fillText('BACK', canvas.width / 2, itemY + 5);
  1471|                }
  1472|            }
  1473|            
  1474|            // Footer hints
  1475|            ctx.fillStyle = '#4a4a5f';
  1476|            ctx.font = '11px monospace';
  1477|            ctx.textAlign = 'center';
  1478|            ctx.fillText('LEFT/RIGHT to Adjust  |  ENTER to Toggle  |  P / ESC to Return', canvas.width / 2, canvas.height - 40);
  1479|        }
  1480|        
  1481|        ctx.restore();
  1482|    }
  1483|
  1484|    if (gameOver) {
  1485|        ctx.fillStyle = 'rgba(15, 5, 5, 0.85)';
  1486|        ctx.fillRect(0, 0, canvas.width, canvas.height);
  1487|        
  1488|        // High Score Celebration
  1489|        if (highScoreBannerTimer > 0 && newHighScoreCelebrated) {
  1490|            const bannerAlpha = Math.min(1, highScoreBannerTimer);
  1491|            const pulse = Math.sin(highScoreBannerTimer * 8) * 0.3 + 0.7;
  1492|            
  1493|            ctx.save();
  1494|            ctx.fillStyle = `rgba(255, 170, 0, ${bannerAlpha * 0.15})`;
  1495|            ctx.fillRect(0, canvas.height / 2 - 100, canvas.width, 200);
  1496|            
  1497|            ctx.font = 'bold 36px monospace';
  1498|            ctx.textAlign = 'center';
  1499|            ctx.fillStyle = `rgba(255, 215, 0, ${bannerAlpha * pulse})`;
  1500|            ctx.shadowColor = '#ffaa00';
  1501|            ctx.shadowBlur = 20 * pulse;
  1502|            ctx.fillText('★ NEW HIGH SCORE! ★', canvas.width / 2, canvas.height / 2 - 68);
  1503|            ctx.shadowBlur = 0;
  1504|            
  1505|            ctx.font = 'bold 16px monospace';
  1506|            ctx.fillStyle = `rgba(255, 255, 255, ${bannerAlpha * 0.9})`;
  1507|            ctx.fillText(score.toLocaleString() + ' POINTS', canvas.width / 2, canvas.height / 2 - 38);
  1508|            
  1509|            // Celebration particles
  1510|            for (const p of highScoreParticles) {
  1511|                ctx.fillStyle = `rgba(${hexToRgb(p.color)}, ${Math.min(1, p.life)})`;
  1512|                ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  1513|            }
  1514|            ctx.restore();
  1515|        }
  1516|        
  1517|        ctx.fillStyle = '#ff6600';
  1518|        ctx.font = 'bold 42px monospace';
  1519|        ctx.textAlign = 'center';
  1520|        ctx.fillText('SQUADRON WIPED', canvas.width / 2, canvas.height / 2 - 30);
  1521|        ctx.fillStyle = '#ffffff';
  1522|        ctx.font = '14px monospace';
  1523|        ctx.fillText('All ships pulled out — no one left to cover.', canvas.width / 2, canvas.height / 2 - 5);
  1524|        ctx.fillText('SCORE: ' + score, canvas.width / 2, canvas.height / 2 + 20);
  1525|        
  1526|        let yOffset = 38;
  1527|        const topScrap = window.Leaderboard ? Leaderboard.getTop('scrapLord', 1)[0] : null;
  1528|        if (topScrap) {
  1529|            ctx.fillStyle = '#ffaa00';
  1530|            ctx.font = '12px monospace';
  1531|            ctx.fillText('★ RECORD SCRAP: ' + topScrap.scrapCollected.toLocaleString() + ' — ' + topScrap.ship.toUpperCase(), canvas.width / 2, canvas.height / 2 + yOffset);
  1532|            yOffset += 16;
  1533|        }
  1534|        ctx.fillStyle = '#00ff55';
  1535|        ctx.font = '12px monospace';
  1536|        ctx.fillText('SCRAP EARNED: +' + runScrap, canvas.width / 2, canvas.height / 2 + yOffset);
  1537|        
  1538|        ctx.font = '14px monospace';
  1539|        ctx.fillStyle = '#8a8a9f';
  1540|        ctx.fillText('Click screen or press SPACE to retry', canvas.width / 2, canvas.height / 2 + 55);
  1541|        ctx.fillText('Press U to open Upgrades Shop', canvas.width / 2, canvas.height / 2 + 75);
  1542|        ctx.fillText('Press ESC to return to main menu', canvas.width / 2, canvas.height / 2 + 95);
  1543|        ctx.fillStyle = '#ff0055';
  1544|        ctx.font = '11px monospace';
  1545|        ctx.fillText('whatanadventure.games/darius-star', canvas.width / 2, canvas.height / 2 + 118);
  1546|    }
  1547|
  1548|    if (gameWon) {
  1549|        ctx.fillStyle = 'rgba(5, 15, 10, 0.85)';
  1550|        ctx.fillRect(0, 0, canvas.width, canvas.height);
  1551|        ctx.fillStyle = '#00ff55';
  1552|        ctx.font = 'bold 42px monospace';
  1553|        ctx.textAlign = 'center';
  1554|        ctx.fillText('VICTORY ACHIEVED', canvas.width / 2, canvas.height / 2 - 55);
  1555|        // GRO-1009: Show ending achieved
  1556|        const endingName = selectedEnding || 'transcendence';
  1557|        const endingColor = endingName === 'sacrifice' ? '#00ffff' : (endingName === 'transcendence' ? '#ff00ff' : '#ff3300');
  1558|        ctx.fillStyle = endingColor;
  1559|        ctx.font = 'bold 16px monospace';
  1560|        ctx.fillText('ENDING: ' + endingName.toUpperCase(), canvas.width / 2, canvas.height / 2 - 32);
  1561|        ctx.fillStyle = '#ffffff';
  1562|        ctx.font = '18px monospace';
  1563|        ctx.fillText('SCORE: ' + score, canvas.width / 2, canvas.height / 2);
  1564|        
  1565|        let yOffsetVal = 18;
  1566|        const topScrapLord = window.Leaderboard ? Leaderboard.getTop('scrapLord', 1)[0] : null;
  1567|        const topTime = window.Leaderboard ? Leaderboard.getTop('speedrun', 1)[0] : null;
  1568|        if (topScrapLord) {
  1569|            ctx.fillStyle = '#ffaa00';
  1570|            ctx.font = '12px monospace';
  1571|            ctx.fillText('★ RECORD SCRAP: ' + topScrapLord.scrapCollected.toLocaleString() + ' — ' + topScrapLord.ship.toUpperCase(), canvas.width / 2, canvas.height / 2 + yOffsetVal);
  1572|            yOffsetVal += 16;
  1573|        }
  1574|        if (topTime) {
  1575|            const val = topTime.timeSeconds;
  1576|            const m = Math.floor(val / 60);
  1577|            const sec = Math.floor(val % 60);
  1578|            const timeStr = `${m}:${sec.toString().padStart(2, '0')}`;
  1579|            ctx.fillStyle = '#00ffff';
  1580|            ctx.font = '12px monospace';
  1581|            ctx.fillText('⏱ RECORD TIME: ' + timeStr + ' — ' + topTime.ship.toUpperCase(), canvas.width / 2, canvas.height / 2 + yOffsetVal);
  1582|            yOffsetVal += 16;
  1583|        }
  1584|        ctx.fillStyle = '#00ff55';
  1585|        ctx.font = '12px monospace';
  1586|        ctx.fillText('SCRAP EARNED: +' + runScrap, canvas.width / 2, canvas.height / 2 + yOffsetVal);
  1587|        yOffsetVal += 16;
  1588|        ctx.fillStyle = '#00ffff';
  1589|        ctx.font = '12px monospace';
  1590|        ctx.fillText('Cyber Coelacanth eradicated.', canvas.width / 2, canvas.height / 2 + yOffsetVal);
  1591|        yOffsetVal += 24;
  1592|        // NG+ prompt if eligible
  1593|        const ngEligible = localStorage.getItem('darius_star_ngplus_eligible');
  1594|        if (ngEligible) {
  1595|            try {
  1596|                const ngData = JSON.parse(ngEligible);
  1597|                const nextLevel = (ngData.ngLevel || 0) + 1;
  1598|                const mult = window.NGPlus ? NGPlus.getScrapMult({ ngLevel: nextLevel }) : 1;
  1599|                ctx.fillStyle = '#cc44ff';
  1600|                ctx.font = 'bold 16px monospace';
  1601|                ctx.fillText('⚡ PRESS N: NEW GAME+ Lv' + nextLevel + ' (' + mult.toFixed(1) + 'x SCRAP)', canvas.width / 2, canvas.height / 2 + yOffsetVal);
  1602|                yOffsetVal += 20;
  1603|            } catch(e) {}
  1604|        }
  1605|        ctx.fillStyle = '#8a8a9f';
  1606|        ctx.font = '14px monospace';
  1607|        ctx.fillText('Click screen or press SPACE to replay', canvas.width / 2, canvas.height / 2 + yOffsetVal);
  1608|        yOffsetVal += 20;
  1609|        ctx.fillText('Press U to open Upgrades Shop', canvas.width / 2, canvas.height / 2 + yOffsetVal);
  1610|        ctx.fillText('Press ESC to return to main menu', canvas.width / 2, canvas.height / 2 + 115);
  1611|        ctx.fillStyle = '#ff0055';
  1612|        ctx.font = '11px monospace';
  1613|        ctx.fillText('whatanadventure.games/darius-star', canvas.width / 2, canvas.height / 2 + 138);
  1614|    }
  1615|
  1616|    if (screenFadeAlpha > 0) {
  1617|        ctx.save();
  1618|        ctx.fillStyle = `rgba(0, 0, 0, ${screenFadeAlpha})`;
  1619|        ctx.fillRect(0, 0, canvas.width, canvas.height);
  1620|        ctx.restore();
  1621|    }
  1622|}
  1623|
  1624|canvas.addEventListener('mousemove', e => {
  1625|    if (currentScreen === SCREENS.PLAYING || targetScreen) return;
  1626|    const { x, y } = getCanvasMouseCoords(e);
  1627|    
  1628|    if (currentScreen === SCREENS.MENU) {
  1629|        const startY = 210;
  1630|        const spacing = 35;
  1631|        hoveredMenuIndex = -1;
  1632|        for (let i = 0; i < menuOptions.length; i++) {
  1633|            const itemY = startY + i * spacing;
  1634|            if (x >= 280 && x <= 520 && y >= itemY - 18 && y <= itemY + 8) {
  1635|                hoveredMenuIndex = i;
  1636|            }
  1637|        }
  1638|    } else if (currentScreen === SCREENS.SHIP_SELECT) {
  1639|        const startY = 140;
  1640|        const spacing = 65;
  1641|        hoveredShipIndex = -1;
  1642|        for (let i = 0; i < 3; i++) {
  1643|            const itemY = startY + i * spacing;
  1644|            if (x >= 80 && x <= 720 && y >= itemY - 25 && y <= itemY + 27) {
  1645|                hoveredShipIndex = i;
  1646|            }
  1647|        }
  1648|    } else if (currentScreen === SCREENS.SETTINGS) {
  1649|        const startY = 175;
  1650|        const spacing = 36;
  1651|        hoveredSettingsIndex = -1;
  1652|        for (let i = 0; i < SETTINGS_OPTIONS.length; i++) {
  1653|            const itemY = startY + i * spacing;
  1654|            if (x >= 200 && x <= 600 && y >= itemY - 15 && y <= itemY + 15) {
  1655|                hoveredSettingsIndex = i;
  1656|            }
  1657|        }
  1658|    }
  1659|});
  1660|
  1661|canvas.addEventListener('mouseleave', () => {
  1662|    hoveredMenuIndex = -1;
  1663|    hoveredShipIndex = -1;
  1664|    hoveredSettingsIndex = -1;
  1665|});
  1666|
  1667|canvas.addEventListener('click', e => {
  1668|    ensureBackgroundImages();
  1669|    initAudio();
  1670|    loadPlayerSprites();
  1671|    loadPortraitSprites();
  1672|    loadEnemySprites();
  1673|    loadVFXSprites();
  1674|    if (window.LevelManager && !LevelManager.initialized) {
  1675|        LevelManager.initialized = true;
  1676|        LevelManager.init();
  1677|    }
  1678|    
  1679|    if (currentScreen !== SCREENS.PLAYING) {
  1680|        startMenuMusic();
  1681|    }
  1682|
  1683|    if (currentScreen === SCREENS.PLAYING) {
  1684|        if (typeof activeDialogue !== 'undefined' && activeDialogue) {
  1685|            activeDialogue.next();
  1686|            return;
  1687|        }
  1688|        if (gameOver || gameWon) {
  1689|            handleDeathOrVictoryRestart();
  1690|        }
  1691|        return;
  1692|    }
  1693|    
  1694|    if (targetScreen) return;
  1695|    
  1696|    const { x, y } = getCanvasMouseCoords(e);
  1697|    
  1698|    if (currentScreen === SCREENS.MENU) {
  1699|        if (hoveredMenuIndex >= 0) {
  1700|            selectedMenuIndex = hoveredMenuIndex;
  1701|            playSound('menu_click');
  1702|            handleMenuConfirm();
  1703|        }
  1704|    } else if (currentScreen === SCREENS.SHIP_SELECT) {
  1705|        if (hoveredShipIndex >= 0) {
  1706|            selectedShipIndex = hoveredShipIndex;
  1707|            playSound('menu_click');
  1708|            handleMenuConfirm();
  1709|        } else if (x >= 300 && x <= 500 && y >= 345 && y <= 375) {
  1710|            playSound('menu_click');
  1711|            transitionToScreen(SCREENS.MENU);
  1712|        }
  1713|    } else if (currentScreen === SCREENS.SETTINGS) {
  1714|        if (hoveredSettingsIndex >= 0) {
  1715|            selectedSettingsIndex = hoveredSettingsIndex;
  1716|            const i = hoveredSettingsIndex;
  1717|            if (i === 7) {
  1718|                playSound('menu_click');
  1719|                handleMenuConfirm();
  1720|            } else if (i >= 4 && i <= 6) {
  1721|                playSound('menu_click');
  1722|                adjustSetting(i, 1);
  1723|            } else if (i === 3) {
  1724|                playSound('menu_select');
  1725|                adjustSetting(3, 1);
  1726|            } else if (i < 3) {
  1727|                if (x >= 430 && x <= 600) {
  1728|                    const rawVal = (x - 450) / 130;
  1729|                    const newVal = Math.max(0, Math.min(1.0, rawVal));
  1730|                    playSound('menu_select');
  1731|                    if (i === 0) masterVolume = newVal;
  1732|                    else if (i === 1) sfxVolume = newVal;
  1733|                    else if (i === 2) musicVolume = newVal;
  1734|                }
  1735|            }
  1736|        }
  1737|    } else if (currentScreen === SCREENS.CREDITS) {
  1738|        playSound('menu_click');
  1739|        transitionToScreen(SCREENS.MENU);
  1740|    } else if (currentScreen === SCREENS.CINEMATIC) {
  1741|        playSound('menu_click');
  1742|        transitionToScreen(SCREENS.CREDITS);
  1743|    }
  1744|});
  1745|
  1746|requestAnimationFrame(loop);
  1747|