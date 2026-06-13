// js/utils.js — Shared utility functions
// Extracted from game_loop.js by Ned (GRO-1168)
// Loaded as module #1 — before all other game modules
// These functions reference variables declared in game_loop.js
// (narrativeFlags, vfxExplosions, particles, hitFlashes, etc.)
// All variable lookups use late binding — resolved at call time.

// --- Sprite Sheet Slicing Constants ---
// Most sprites are 1024x1024 sheets with frames in a grid.
const SPRITE_FRAME = 48;   // default frame cell size (21x21 grid)
const BOSS_FRAME = 256;    // boss sprite frame cell size (4x4 grid)
const SHIELD_FRAME = 512;  // shield ring frame cell size (2x2 grid)

// --- Sprite Sheet Slicing Utility ---
// Extracts a single frame from a 1024x1024 sprite sheet using the 9-param drawImage.
// frameW/frameH = dimensions of one frame cell.
// frameX/frameY = column/row index in the sheet grid (0-indexed).
// dx/dy/dW/dH = destination position and size on canvas.
export function drawSpriteFrame(ctx, sprite, frameX, frameY, frameW, frameH, dx, dy, dW, dH) {
    const sheetW = (sprite.tagName === 'CANVAS') ? sprite.width : (sprite.naturalWidth || sprite.width || 0);
    const sheetH = (sprite.tagName === 'CANVAS') ? sprite.height : (sprite.naturalHeight || sprite.height || 0);
    if (sheetW === 0 || sheetH === 0) return;
    // If sheet is smaller than one frame cell, it's not a sprite sheet — draw it directly
    if (sheetW <= frameW && sheetH <= frameH) {
        ctx.drawImage(sprite, dx, dy, dW, dH);
        return;
    }
    const sx = frameX * frameW;
    const sy = frameY * frameH;
    ctx.drawImage(sprite, sx, sy, frameW, frameH, dx, dy, dW, dH);
}

export function resizeCanvas() {
    var maxW = window.innerWidth;
    // GRO-1172: In fullscreen mode, no header/controls to account for
    var isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
    var maxH = isFS ? window.innerHeight : window.innerHeight - 120;
    var scale = Math.min(maxW / GAME_WIDTH, maxH / GAME_HEIGHT);
    canvas.style.width = (GAME_WIDTH * scale) + 'px';
    canvas.style.height = (GAME_HEIGHT * scale) + 'px';
}

export function setNarrativeFlag(key, value) {
    if (narrativeFlags.hasOwnProperty(key)) {
        narrativeFlags[key] = Math.max(0, narrativeFlags[key] + value);
    }
}

export function getNarrativeFlag(key) {
    return narrativeFlags[key] || 0;
}

// Determine which ending(s) the player qualifies for.
// Returns array of eligible ending ids. If multiple, player chooses at climax.
export function determineEnding() {
    const flags = narrativeFlags;
    const eligible = [];

    // SACRIFICE: Lyra trust high + sacrifice foreshadowing + mercy
    if (flags.lyra_trust >= 3 && flags.sacrifice_seen >= 1 && flags.coelacanth_mercy >= 2) {
        eligible.push('sacrifice');
    }
    // TRANSCENDENCE: Dreamer connection high + lyra trust
    if (flags.dreamer_connection >= 2 && flags.lyra_trust >= 2) {
        eligible.push('transcendence');
    }
    // DOMINION: Power lust high + low mercy
    if (flags.power_lust >= 3 && flags.coelacanth_mercy <= 1) {
        eligible.push('dominion');
    }

    // Fallback: if no ending qualifies, enable all three (player's choice)
    if (eligible.length === 0) {
        eligible.push('sacrifice', 'transcendence', 'dominion');
    }

    // If only one eligible, select it automatically
    if (eligible.length === 1) {
        selectedEnding = eligible[0];
    } else {
        endingEligible = eligible;
        // Player will choose from endingEligible at the climax screen
    }

    return eligible;
}

export function createExplosion(x, y, color, count = 12, style = null) {
    // Map color/attributes to a default style if none specified
    if (!style) {
        const cLower = color ? color.toLowerCase() : '';
        if (cLower === '#00ffff' || cLower === '#00ffaa' || cLower === 'cyan') {
            style = 'blue_laser';
        } else if (cLower === '#00ff88' || cLower === 'green' || cLower === '#00ff55') {
            style = 'green_laser';
        } else if (cLower === '#ff00ff' || cLower === 'purple' || cLower === '#ff00aa' || cLower === '#b026ff') {
            style = 'purple_laser';
        } else if (cLower === '#ffffff' || cLower === 'white') {
            style = 'white_laser';
        } else if (cLower === '#ff3333' || cLower === '#ff3300' || cLower === 'red') {
            style = 'red_projectile';
        } else if (cLower === '#ff8800' || cLower === '#ffaa00' || cLower === 'orange' || cLower === '#ff6600') {
            style = 'missile';
        } else if (cLower === '#0088ff' || cLower === 'blue') {
            style = 'shield_hit';
        } else {
            style = 'blue_laser'; // fallback
        }
    }

    // Sprite-based explosion for the main visual
    const explosionSize = Math.max(40, count * 3.5);
    vfxExplosions.push(new SpriteExplosion(x, y, explosionSize, style));
    
    // Keep particles for debris/sparks (tailored count and color per style)
    let particleCount = Math.min(count, 6);
    let particleColor = color;

    if (style === 'blue_laser') {
        particleCount = 8;
        particleColor = '#00FFFF';
    } else if (style === 'green_laser') {
        particleCount = 6;
        particleColor = '#00FF88';
    } else if (style === 'purple_laser') {
        particleCount = 10;
        particleColor = '#FF00FF';
    } else if (style === 'white_laser') {
        particleCount = 12;
        particleColor = '#FFFFFF';
    } else if (style === 'red_projectile') {
        particleCount = 8;
        particleColor = '#FF3333';
    } else if (style === 'missile') {
        particleCount = 15;
        particleColor = '#FF8800';
    } else if (style === 'shield_hit') {
        particleCount = 12;
        particleColor = '#0088FF';
    }

    for (let i = 0; i < particleCount; i++) {
        const p = new Particle(x, y, particleColor);
        if (style === 'shield_hit') {
            // Shield sparks: faster velocity, quicker decay
            p.vx = (Math.random() - 0.5) * 350;
            p.vy = (Math.random() - 0.5) * 350;
            p.decay = Math.random() * 3.0 + 2.0;
        } else if (style === 'missile') {
            // Fireball debris: drifting up, slower decay, slightly larger size
            p.vx = (Math.random() - 0.5) * 150;
            p.vy = (Math.random() - 0.5) * 150 - 50;
            p.size = Math.random() * 5 + 2;
            p.decay = Math.random() * 1.2 + 0.6;
        }
        particles.push(p);
    }
}

// --- Hit-flash spawner (§6.2) — 5-tier hit-flash effects ---
const HIT_FLASH_CONFIG = {
    scout:   { size: 16, maxFrames: 4,  frameRate: 0.025, duration: 0.10, color: '#FFFFFF' },
    interceptor: { size: 24, maxFrames: 6,  frameRate: 0.025, duration: 0.15, color: '#FF0055' },
    heavy:   { size: 32, maxFrames: 8,  frameRate: 0.025, duration: 0.20, color: '#FF5500' },
    elite:   { size: 32, maxFrames: 8,  frameRate: 0.025, duration: 0.20, color: '#FF5500' },
    grunt:   { size: 16, maxFrames: 4,  frameRate: 0.025, duration: 0.10, color: '#FFFFFF' },
    boss_armored:  { size: 48, maxFrames: 10, frameRate: 0.025, duration: 0.25, color: '#FF3333' },
    boss_vulnerable: { size: 64, maxFrames: 12, frameRate: 0.025, duration: 0.30, color: '#FFD700' },
    boss:    { size: 48, maxFrames: 10, frameRate: 0.025, duration: 0.25, color: '#FF3333' }
};

export function spawnHitFlash(x, y, enemyType) {
    const cfg = HIT_FLASH_CONFIG[enemyType] || HIT_FLASH_CONFIG['scout'];
    // 5% chance of critical hit-flash (upgrade one tier)
    const isCrit = Math.random() < 0.05;
    const critCfg = isCrit ? (enemyType === 'boss_vulnerable' ? HIT_FLASH_CONFIG['boss_vulnerable'] :
                   (HIT_FLASH_CONFIG['heavy'] || cfg)) : cfg;
    hitFlashes.push({
        x, y, size: critCfg.size, maxFrames: critCfg.maxFrames,
        frameRate: critCfg.frameRate, duration: critCfg.duration,
        color: critCfg.color, life: critCfg.duration, frame: 0, frameTime: 0
    });
}

export function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// GRO-950: Weave scrap collection into the core story stakes.
// These are short, one-time banter beats tied to run scrap totals so loot is not
// just currency; it reinforces Darius as a scrapper on a one-way rescue dive.
const SCRAP_NARRATIVE_BEATS = [
    {
        key: 'one_way_trip',
        threshold: 25,
        line: {
            s: 'D',
            l: "Every scrap plate we pull is life support for the next depth. One-way trip, starlight. No retreat path.",
            r: { s: 'L', l: "Then we keep finding pieces, Daddy. One piece at a time." }
        }
    },
    {
        key: 'scrapper_trade',
        threshold: 75,
        line: {
            s: 'D',
            l: "I was a scrapper before I was anything else. Junk talks if you know where to cut.",
            r: { s: 'O', l: "Then let the wreckage finance the impossible, Darius Star." }
        }
    },
    {
        key: 'one_in_a_million',
        threshold: 150,
        line: {
            s: 'D',
            l: "Grandpa called finds like this one-in-a-million. Lyra only needs one miracle to stay alive.",
            r: { s: 'L', l: "One-in-a-million is still a chance. That is us." }
        }
    },
    {
        key: 'no_retreat',
        threshold: 300,
        line: {
            s: 'N',
            l: "Darius, that haul keeps your shields breathing, but it will not buy a way back.",
            r: { s: 'D', l: "Wasn't buying a way back. Buying the next push forward." }
        }
    }
];

export function triggerScrapNarrativeBeat() {
    if (!banterEnabled || streamerMode || !window.BanterEngine || !BanterEngine.triggerDirect) return;
    if (BanterEngine.getActive && BanterEngine.getActive()) return;

    for (const beat of SCRAP_NARRATIVE_BEATS) {
        if (runScrap >= beat.threshold && !scrapNarrativeMilestonesPlayed.has(beat.key)) {
            scrapNarrativeMilestonesPlayed.add(beat.key);
            BanterEngine.triggerDirect(beat.line, 5.0);
            break;
        }
    }
}

export function startNGPlus(prevRunData) {
    // Start a New Game+ run using previous run's completion data
    if (!window.NGPlus || !window.CampaignSave) return;
    
    const ngSave = NGPlus.start(prevRunData);
    if (!ngSave) return;
    
    // Find an empty save slot or use slot 0
    let slot = 0;
    for (let s = 0; s < 3; s++) {
        const existing = CampaignSave.load(s);
        if (!existing) { slot = s; break; }
    }
    
    CampaignSave.save(slot, ngSave);
    localStorage.setItem('dariusStar_activeSlot', String(slot));
    ngPlusRun = true;
    currentNGLevel = ngSave.ngLevel || 1;
    
    // Clear NG+ eligibility for next run
    localStorage.removeItem('darius_star_ngplus_eligible');
    
    playSound('menu_select');
    resetGame();
}

export function resetGame() {
    score = 0;
    gameOver = false;
    singlePlayerPullOutTimer = 0; // GRO-1469: Reset 30s fallback
    gameWon = false;
    bossSpawned = false;
    if (boss && boss.cleanup) boss.cleanup();
    boss = null;

    // Load campaign save state before any restore logic reads it.
    let activeSaveSlot = parseInt(localStorage.getItem('dariusStar_activeSlot') || '0');
    let campaignSave = null;
    if (window.CampaignSave) {
        campaignSave = CampaignSave.load(activeSaveSlot);
    }

    // GRO-1009: Reset narrative state for new run
    selectedEnding = null;
    endingEligible = [];
    Object.keys(narrativeFlags).forEach(k => narrativeFlags[k] = 0);
    // GRO-1007: Restore in-game narrative flags from save if available
    if (campaignSave && campaignSave.inGameFlags) {
        Object.keys(campaignSave.inGameFlags).forEach(k => {
            if (narrativeFlags.hasOwnProperty(k)) {
                narrativeFlags[k] = campaignSave.inGameFlags[k] || 0;
            }
        });
    }
    sirenTimer = 0;
    gameTime = 0;
    
    // Reset Dialogue System variables
    dialogueCompletedScenes = {};
    activeDialogue = null;
    stormActive = false;
    pathfinderActive = false;
    cavernNavActive = false;
    cavernTimer = 0;
    cavernStage = '';
    shakeDuration = 0;
    shakeIntensity = 0;
    screenFlashAlpha = 0;
    screenFlashColor = '#FFFFFF';
    hitFlashes.length = 0;
    overheatWarning = false;
    overheatCritical = false;
    overheatTimer = 0;
    lowHealthPulseTimer = 0;
    glitchTimer = 0;
    glitchCooldown = 0;
    activeBiomeName = '1: Abyssal Trench';
    loadPortraitSprites();
    bossDefeated = false;
    bossIntroPlaying = false;
    bossesDefeated = 0;
    victoryVideoPlaying = false;
    if (bossIntroVideo) { bossIntroVideo.pause(); bossIntroVideo.classList.remove('active'); bossIntroVideo.muted = true; }
    if (victoryVideo) { victoryVideo.pause(); victoryVideo.classList.remove('active'); victoryVideo.muted = true; }
    skipHint.classList.remove('active');
    
    runScrap = 0;
    runScrapSaved = false;
    scrapNarrativeMilestonesPlayed.clear();
    // GRO-1054: Reset scrap event state for new run
    if (window.ScrapEvents && ScrapEvents.reset) ScrapEvents.reset();
    newHighScoreCelebrated = false;
    highScoreBannerTimer = 0;
    highScoreParticles = [];
    
    // Lock difficulty before constructing players so ship stats/lives use the save or ship-select choice.
    if (campaignSave) {
        difficulty = campaignSave.difficulty || 'normal';
    } else {
        try {
            const shipSel = JSON.parse(localStorage.getItem('dariusStar_shipSelection') || 'null');
            difficulty = (shipSel && shipSel.difficulty) || localStorage.getItem('dariusStar_difficulty') || difficulty || 'normal';
        } catch (e) {
            difficulty = localStorage.getItem('dariusStar_difficulty') || difficulty || 'normal';
        }
    }

    // Re-instantiate player ship with the currently selected model or saved model
    let activeShip = 'striker';
    if (campaignSave && campaignSave.ship) {
        activeShip = campaignSave.ship;
    } else {
        try {
            const shipSel = localStorage.getItem('dariusStar_shipSelection');
            if (shipSel) {
                const parsed = JSON.parse(shipSel);
                if (parsed && parsed.p1 && parsed.p1.shipId) {
                    activeShip = parsed.p1.shipId;
                } else if (parsed && parsed.shipId) {
                    activeShip = parsed.shipId;
                }
            } else {
                activeShip = SHIP_OPTIONS[selectedShipIndex];
            }
        } catch (e) {
            activeShip = SHIP_OPTIONS[selectedShipIndex];
        }
    }
    player = new Player(activeShip);
    
    // GRO-958: Multiplayer — sync Player instances with Multiplayer module
    remotePlayers = [];
    if (window.Multiplayer && Multiplayer.players.length > 1) {
        for (let i = 1; i < Multiplayer.players.length; i++) {
            const mp = Multiplayer.players[i];
            if (!mp.alive) continue;
            const shipType = mp.ship || 'interceptor';
            const rp = new Player(shipType, mp.id);
            rp.x = mp.x || (80 + i * 40);
            rp.y = mp.y || (180 + i * 30);
            rp.isRemote = true;
            remotePlayers.push(rp);
        }
    }

    // Restore other campaign progress
    if (campaignSave) {
        difficulty = campaignSave.difficulty || 'normal';
        currentNGLevel = campaignSave.ngLevel || 0;
        // GRO-1006: Restore procedural variation seed from save
        runSeed = campaignSave.seed || Math.floor(Math.random() * 2147483648);
        score = campaignSave.score || 0;
        runScrap = campaignSave.scrap || 0;
        if (campaignSave.weaponLevel) player.weaponLevel = campaignSave.weaponLevel;
        if (campaignSave.shield) player.shield = campaignSave.shield;
    } else {
        currentNGLevel = 0;
    }

    // Set LevelManager state
    if (window.LevelManager) {
        if (campaignSave) {
            LevelManager.setBiomeAndLevel(campaignSave.biome || 1, campaignSave.wave || 1);
        } else {
            LevelManager.setBiomeAndLevel(1, 1);
        }
    }

    // Re-apply score to get correct biome level
    updateActiveBiome(0.016, score);
    
    bullets.length = 0;
    enemyBullets.length = 0;
    enemies.length = 0;
    powerups.length = 0;
    particles.length = 0;
    vfxExplosions.length = 0;
    floatingTexts.length = 0;
    hitFlashes.length = 0;
    scrapDrops.length = 0;
    pdgZaps.length = 0;
    envParticles.length = 0;
    envSpawnAccum = 0;
    // Seed initial particles for current biome
    const seedType = biomeLevel === 1 ? 'mote' : (biomeLevel === 2 ? 'rust_flake' : 'mote');
    for (let i = 0; i < 30; i++) envParticles.push(new EnvironmentParticle(seedType));
    envBuffer.markDirty();

    Combo.init();
    // Re-initialize campaign modules if loaded to avoid stale state on retry/restart
    if (window.Multiplayer) Multiplayer.init();
    // Preserve looted segments across restarts (prevents checkpoint farming)
    const savedLooted = {};
    if (window.Economy && Economy._lootedSegments) {
        for (const segId in Economy._lootedSegments) {
            savedLooted[segId] = new Set(Economy._lootedSegments[segId]);
        }
    }
    if (window.Economy) Economy.init();
    if (window.Economy) Economy._lootedSegments = savedLooted;
    if (window.BanterEngine) {
        BanterEngine.init(window.Multiplayer ? Multiplayer.count : 1);
        BanterEngine.trigger('level_start', 1);
        // GRO-1054: Wire scrap/upgrade events (save-load path)
        BanterEngine.initScrapEvents();
    }
}

export function handleDeathOrVictoryRestart() {
    let activeSaveSlot = parseInt(localStorage.getItem('dariusStar_activeSlot') || '0');
    if (gameOver && window.CampaignSave) {
        const restored = CampaignSave.restoreCheckpoint(activeSaveSlot);
        if (restored) {
            // Update save slot with restored checkpoint progress and decremented lives
            const existing = CampaignSave.load(activeSaveSlot);
            CampaignSave.save(activeSaveSlot, {
                ...existing,
                ...restored,
                lives: restored.lives
            });
            console.log(`Restored Campaign Checkpoint in slot ${activeSaveSlot}: Biome ${restored.biome}, Lives remaining ${restored.lives}`);
        } else {
            // Lives exhausted or no checkpoint: reset slot progress to Biome 1
            const existing = CampaignSave.load(activeSaveSlot);
            if (existing) {
                CampaignSave.save(activeSaveSlot, {
                    ...existing,
                    biome: 1,
                    score: 0,
                    scrap: 0,
                    lives: getCurrentDifficultyConfig().startingLives
                });
            }
            console.log(`No lives remaining. Campaign reset in slot ${activeSaveSlot}.`);
        }
    }
    resetGame();
}


// ES Module bridge — publish exports to global scope for cross-module access
window.drawSpriteFrame = drawSpriteFrame;
window.resizeCanvas = resizeCanvas;
window.setNarrativeFlag = setNarrativeFlag;
window.getNarrativeFlag = getNarrativeFlag;
window.determineEnding = determineEnding;
window.createExplosion = createExplosion;
window.spawnHitFlash = spawnHitFlash;
window.checkCollision = checkCollision;
window.triggerScrapNarrativeBeat = triggerScrapNarrativeBeat;
window.startNGPlus = startNGPlus;
window.resetGame = resetGame;
window.handleDeathOrVictoryRestart = handleDeathOrVictoryRestart;
