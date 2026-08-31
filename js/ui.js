
function showLevelClearScreen(summary) {
    window._levelClearSummary = summary || {
        biome: (typeof LevelManager !== 'undefined') ? LevelManager.biome : 1,
        level: (typeof LevelManager !== 'undefined') ? LevelManager.level : 1,
        killCount: 20,
        killTotal: 20,
        killPct: 100,
        scrapCollected: 350,
        scrapTotal: 350,
        scrapPct: 100,
        scoreEarned: 2400,
        timeSpent: 45,
        rank: 'S'
    };
    window._levelClearAnimTimer = 0;
    window._levelClearHitRegions = [];
    window._showIntelModal = false;
    currentScreen = (typeof SCREENS !== 'undefined') ? SCREENS.LEVEL_CLEAR : 'level_clear';
    targetScreen = null;
    playSound('powerup');
}

function advanceToNextLevelFromDebriefing() {
    playSound('menu_click');
    if (typeof LevelManager !== 'undefined' && LevelManager.advanceLevel) {
        LevelManager.advanceLevel();
        if (typeof setBiomeBackgrounds === 'function') {
            setBiomeBackgrounds(LevelManager.biome, LevelManager.level);
        }
    }
    if (typeof enemies !== 'undefined') enemies.length = 0;
    if (typeof enemyBullets !== 'undefined') enemyBullets.length = 0;
    if (typeof powerups !== 'undefined') powerups.length = 0;
    currentScreen = (typeof SCREENS !== 'undefined') ? SCREENS.PLAYING : 'playing';
    targetScreen = null;
}

if (typeof window !== 'undefined') {
    window.showLevelClearScreen = showLevelClearScreen;
    window.advanceToNextLevelFromDebriefing = advanceToNextLevelFromDebriefing;
}

// --- Menu & Settings State Variables ---
var SCREENS = {
    LOADING: 'loading',         // Boot-time preloader & avionics buffering
    MENU: 'menu',
    SHIP_SELECT: 'ship_select',
    SETTINGS: 'settings',
    CREDITS: 'credits',
    LEADERBOARD: 'leaderboard',
    PLAYING: 'playing',
    CINEMATIC: 'cinematic',
    BRIEFING: 'briefing',       // GRO-936: Pre-mission story briefing screen
    LOAD_GAME: 'load_game',
    UPGRADE_SHOP: 'upgrade_shop',
    LEVEL_CLEAR: 'level_clear',
    SECTOR_INTEL: 'sector_intel'  // GRO-1056: In-canvas upgrade flow
};
if (typeof window !== 'undefined') {
    window.SCREENS = SCREENS;
}
var currentScreen = SCREENS.LOADING;
var selectedMenuIndex = 0;
var hoveredMenuIndex = -1; // distinct from selected for hover state
var prevHoveredMenuIndex = -1;   // GRO-1294: track previous for hover-sound debounce
var menuOptions = ['CONTINUE', 'START GAME', 'UPGRADE SHOP', 'SHIP SELECT', 'SETTINGS', 'LEADERBOARD', 'CREDITS'];
var shipSelectSource = 'menu'; // 'menu' or 'start'

var pauseMenuIndex = 0;
var PAUSE_OPTIONS = ['RESUME', 'SETTINGS', 'QUIT TO MENU'];
var pauseSubScreen = 'menu'; // 'menu' or 'settings'

var selectedSettingsIndex = 0;
var hoveredSettingsIndex = -1;
var prevHoveredSettingsIndex = -1; // GRO-1294
var SETTINGS_OPTIONS = ['MASTER VOLUME', 'SFX VOLUME', 'MUSIC VOLUME', 'DIFFICULTY', 'AUDIO TUNNELS', 'BANTER SYSTEM', 'STREAMER MODE', 'SUBTITLES', 'BACK'];

var selectedShipIndex = 0; // 0=scout, 1=interceptor, 2=heavy
var hoveredShipIndex = -1;
var prevHoveredShipIndex = -1;   // GRO-1294
var hoveredUpgradeIndex = -1;     // GRO-1294: upgrade shop hover
var prevHoveredUpgradeIndex = -1; // GRO-1294
var SHIP_OPTIONS = ['striker', 'phantom', 'bastion', 'tempest', 'specter', 'warden'];
var selectedShip = 'striker';

// Unified Leaderboard state
var leaderboardFilter = 'speedrun'; // 'speedrun' | 'scrapLord' | 'survivor'
var leaderboardScrollOffset = 0;
var newHighScoreCelebrated = false;
var highScoreBannerTimer = 0;
var highScoreParticles = [];

// Cinematic & Credits Scroll variables
var cinematicTime = 0;
var creditsScrollY = 0;
var creditsHoldTimer = 0;
var maxCreditsScroll = 1050;
var bossDefeated = false;
var bossIntroPlaying = false;
var victoryVideoPlaying = false;

// Video elements for cinematics
var bossIntroVideo = typeof document !== 'undefined' ? document.getElementById('boss-intro-video') : null;
var victoryVideo = typeof document !== 'undefined' ? document.getElementById('victory-video') : null;
var skipHint = typeof document !== 'undefined' ? document.getElementById('skip-cinematic-hint') : null;

// Click/touch to skip cinematic videos
if (bossIntroVideo) bossIntroVideo.addEventListener('click', () => { if (bossIntroPlaying) skipBossIntro(); });
if (victoryVideo) victoryVideo.addEventListener('click', () => { if (victoryVideoPlaying) skipVictoryCinematic(); });

// Ending cinematic assets
const endingSunriseImg = new Image();
let endingSunriseLoaded = false;
endingSunriseImg.onload = () => { endingSunriseLoaded = true; };
endingSunriseImg.src = 'assets/cinematics/ending_sunrise.png';

const studioLogoImg = new Image();
let studioLogoLoaded = false;
studioLogoImg.onload = () => { studioLogoLoaded = true; };
studioLogoImg.src = 'assets/sprites/studio_logo.png';

var masterVolume = 0.8;
var sfxVolume = 0.8;
var musicVolume = 0.6;
var difficulty = 'normal'; // 'easy', 'normal', 'hard', 'insane'

// Content channel toggles — "Go Big or Go Home" immersion settings
var banterEnabled = true;       // Banter System — character dialogue during gameplay
var audioTunnelsEnabled = true; // Audio Tunnels — between-stage immersive audio
var streamerMode = false;       // Streamer Mode — disables all voice content
var subtitlesEnabled = true;    // GRO-940: Accessibility subtitles — high-visibility voice captions

var screenFadeAlpha = 0;
var targetScreen = null;
var transitionTimer = 0;
const TRANSITION_DURATION = 0.3; // 300ms transition fade

// Background title loop strip assets
const titleBgImage = new Image();
let titleBgLoaded = false;
titleBgImage.onload = () => { titleBgLoaded = true; };
titleBgImage.src = 'assets/sprites/backgrounds/bg_title_strip.png';

let titleBgFrame = 0;
let titleBgTimer = 0;
const TITLE_FRAME_WIDTH = 1280;
const TITLE_FRAME_HEIGHT = 720;
const TITLE_TOTAL_FRAMES = 31;
const TITLE_FRAME_DURATION = 0.067; // ~15fps (1/15s)

// Title logo asset
const titleLogoImg = new Image();
let titleLogoLoaded = false;
titleLogoImg.onload = () => { titleLogoLoaded = true; };
titleLogoImg.src = 'assets/sprites/title_0.png';

function transitionToScreen(newScreen) {
    if (targetScreen) return; // already transitioning
    targetScreen = newScreen;
    transitionTimer = 0;
}

// ── Cinematic Video Playback ──

function playBossIntro() {
    if (bossIntroPlaying) return;
    bossIntroPlaying = true;

    const isMid = (typeof LevelManager !== 'undefined' && LevelManager.level === 5);
    const biome = (typeof LevelManager !== 'undefined') ? LevelManager.biome : 1;
    const cinKey = (typeof CinematicsEngine !== 'undefined') 
        ? CinematicsEngine.getBossCinematicKey(biome, isMid)
        : 'boss_b1_boss';

    if (typeof CinematicsEngine !== 'undefined') {
        CinematicsEngine.play(cinKey, {
            onStart: () => {
                if (skipHint) skipHint.classList.add('active');
            },
            onComplete: () => {
                if (skipHint) skipHint.classList.remove('active');
                bossIntroPlaying = false;
                spawnBossNow();
            },
            onFallback: () => {
                if (skipHint) skipHint.classList.remove('active');
                bossIntroPlaying = false;
                spawnBossNow();
            }
        });
    } else {
        bossIntroVideo.muted = false;
        bossIntroVideo.classList.add('active');
        skipHint.classList.add('active');
        bossIntroVideo.currentTime = 0;
        bossIntroVideo.play().catch(() => {
            bossIntroPlaying = false;
            bossIntroVideo.classList.remove('active');
            skipHint.classList.remove('active');
            spawnBossNow();
        });
        bossIntroVideo.onended = () => {
            bossIntroVideo.classList.remove('active');
            skipHint.classList.remove('active');
            bossIntroPlaying = false;
            spawnBossNow();
        };
    }
}

function skipBossIntro() {
    if (!bossIntroPlaying) return;
    if (typeof CinematicsEngine !== 'undefined' && CinematicsEngine.isPlaying()) {
        CinematicsEngine.skip();
    } else {
        bossIntroVideo.pause();
        bossIntroVideo.classList.remove('active');
        skipHint.classList.remove('active');
        bossIntroPlaying = false;
        spawnBossNow();
    }
}

function spawnBossNow() {
    bossSpawned = true;
    sirenTimer = 0; // skip siren, boss appears immediately after cinematic
    boss = new Boss();
}

function playVictoryCinematic() {
    if (victoryVideoPlaying) return;
    victoryVideoPlaying = true;

    if (typeof CinematicsEngine !== 'undefined') {
        CinematicsEngine.play('victory', {
            onStart: () => {
                if (skipHint) skipHint.classList.add('active');
            },
            onComplete: () => {
                if (skipHint) skipHint.classList.remove('active');
                victoryVideoPlaying = false;
                transitionToScreen(SCREENS.CINEMATIC);
            },
            onFallback: () => {
                if (skipHint) skipHint.classList.remove('active');
                victoryVideoPlaying = false;
                transitionToScreen(SCREENS.CINEMATIC);
            }
        });
    } else {
        victoryVideo.muted = false;
        victoryVideo.classList.add('active');
        skipHint.classList.add('active');
        victoryVideo.currentTime = 0;
        victoryVideo.play().catch(() => {
            victoryVideoPlaying = false;
            victoryVideo.classList.remove('active');
            skipHint.classList.remove('active');
            transitionToScreen(SCREENS.CINEMATIC);
        });
        victoryVideo.onended = () => {
            victoryVideo.classList.remove('active');
            skipHint.classList.remove('active');
            victoryVideoPlaying = false;
            transitionToScreen(SCREENS.CINEMATIC);
        };
    }
}

function skipVictoryCinematic() {
    if (!victoryVideoPlaying) return;
    if (typeof CinematicsEngine !== 'undefined' && CinematicsEngine.isPlaying()) {
        CinematicsEngine.skip();
    } else {
        victoryVideo.pause();
        victoryVideo.classList.remove('active');
        skipHint.classList.remove('active');
        victoryVideoPlaying = false;
        transitionToScreen(SCREENS.CINEMATIC);
    }
}

function advanceSubLevel() {
    // Called after Sub-Boss defeat at Level 5
    floatingTexts.push(new FloatingText(canvas.width / 2, canvas.height / 3, 'SUB-BOSS DESTROYED!', '#fed330'));
    
    // Reset boss tracking variables
    boss = null;
    bossDefeated = false;
    bossSpawned = false;
    bossIntroPlaying = false;
    sirenTimer = 0;

    // Clear remaining bullets and enemy stragglers
    enemyBullets.length = 0;
    
    // Advance LevelManager to Level 6
    if (window.LevelManager) {
        LevelManager.advanceLevel();
    }
    
    enemySpawnTimer = 1.0;
}

function advanceToNextBiome() {
    // Called after boss defeat in biomes 1-9
    // Advances the game to the next biome without resetting player progress
    
    bossesDefeated++;
    const oldBiome = biomeLevel;
    
    if (window.Telemetry) {
        Telemetry.logEvent('completion', {
            score: score,
            biome: oldBiome,
            level: 10,
            scrap: runScrap,
            is_final_victory: false
        });
    }
    
    // Show biome clear message
    floatingTexts.push(new FloatingText(canvas.width / 2, canvas.height / 3, 
        `BIOME ${oldBiome} CLEAR!`, '#00ffff'));
    
    // Reset boss state for new biome
    boss = null;
    bossDefeated = false;
    bossSpawned = false;
    bossIntroPlaying = false;
    sirenTimer = 0;
    bossAssetsLoaded = false;
    
    // Stop any boss intro video still playing
    if (bossIntroVideo) {
        bossIntroVideo.pause();
        bossIntroVideo.classList.remove('active');
    }
    if (victoryVideo) {
        victoryVideo.pause();
        victoryVideo.classList.remove('active');
    }
    skipHint.classList.remove('active');
    
    // Clear all enemies and projectiles for clean biome transition
    enemies.length = 0;
    enemyBullets.length = 0;
    powerups.length = 0;
    
    // Reset spawn timer — enemies will start fresh
    enemySpawnTimer = 1.0;
    
    // Advance LevelManager's internal biome/level state so bossTrigger
    // is cleared and enemies spawn for the next level/biome
    if (window.LevelManager) {
        LevelManager.advanceLevel();
    }
    
    // Update biome display and ambient audio
    updateActiveBiome(0, score);
    if (uiBiome) uiBiome.innerText = activeBiomeName;
    
    // GRO-1187: Story triggers — biome transition & first biome clear
    if (typeof StoryTriggers !== 'undefined') {
        StoryTriggers.onBiomeTransition(oldBiome, biomeLevel);
        if (oldBiome === 1) {
            StoryTriggers.onFirstBiomeClear();
        }
    }
    
    // GRO-2170: Serialize, base64 encode, and save total scrap to localStorage upon biome completion
    if (typeof saveTotalScrapOnBiomeCompletion === 'function') {
        saveTotalScrapOnBiomeCompletion();
    }
    
    // Re-seed environmental particles for new biome
    envParticles.length = 0;
    envSpawnAccum = 0;
    const newSeedType = biomeLevel <= 2 ? 'mote' : (biomeLevel <= 4 ? 'rust_flake' : 'mote');
    for (let i = 0; i < 30; i++) envParticles.push(new EnvironmentParticle(newSeedType));
    envBuffer.markDirty();
    
    console.log(`Advanced to Biome ${biomeLevel}: ${activeBiomeName}`);
}

function updateTitleBackground(dt) {
    titleBgTimer += dt;
    if (titleBgTimer >= TITLE_FRAME_DURATION) {
        titleBgTimer -= TITLE_FRAME_DURATION;
        titleBgFrame = (titleBgFrame + 1) % TITLE_TOTAL_FRAMES;
    }
}

function drawTitleBackground() {
    if (titleBgLoaded && titleBgImage.naturalWidth > 0) {
        const sx = titleBgFrame * TITLE_FRAME_WIDTH;
        const sy = 0;
        ctx.drawImage(titleBgImage, 
            sx, sy, TITLE_FRAME_WIDTH, TITLE_FRAME_HEIGHT,
            0, 0, canvas.width, canvas.height
        );
    } else {
        ctx.fillStyle = '#01010c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        stars.forEach(star => {
            const alpha = star.getAlpha();
            ctx.globalAlpha = alpha;
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        ctx.globalAlpha = 1.0;
    }
}

function drawTitleLogo() {
    if (titleLogoLoaded && titleLogoImg.naturalWidth > 0) {
        ctx.save();
        // title_0.png has content bounding box: sx=106, sy=328, sw=827, sh=366 (aspect ratio ~2.26)
        const sw = 827;
        const sh = 366;
        const lw = 310;
        const lh = Math.round(lw * (sh / sw)); // 137px
        const lx = canvas.width / 2 - lw / 2;
        const ly = 8 + Math.sin(gameTime * 2.0) * 3; // subtle floating effect
        
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10 + Math.sin(gameTime * 4) * 4;
        ctx.drawImage(titleLogoImg, 106, 328, sw, sh, lx, ly, lw, lh);
        ctx.restore();
    } else {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = 'bold 36px Courier New';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15 + Math.sin(gameTime * 5) * 8;
        ctx.fillStyle = '#00ffff';
        ctx.fillText('DARIUS STAR', canvas.width / 2, 85 + Math.sin(gameTime * 2) * 4);
        
        ctx.font = 'bold 16px Courier New';
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 8;
        ctx.fillText('CYBER COELACANTH', canvas.width / 2, 115 + Math.sin(gameTime * 2) * 4);
        ctx.restore();
    }
}

function adjustSetting(index, dir) {
    const step = 0.1;
    if (index === 0) { // Master Volume
        masterVolume = Math.max(0, Math.min(1.0, masterVolume + dir * step));
    } else if (index === 1) { // SFX Volume
        sfxVolume = Math.max(0, Math.min(1.0, sfxVolume + dir * step));
    } else if (index === 2) { // Music Volume
        musicVolume = Math.max(0, Math.min(1.0, musicVolume + dir * step));
    } else if (index === 3) { // Difficulty
        const diffs = ['easy', 'normal', 'hard', 'insane'].filter(d => d !== 'insane' || isInsaneDifficultyUnlocked());
        let currentIdx = diffs.indexOf(difficulty);
        if (currentIdx < 0) currentIdx = 1;
        currentIdx = (currentIdx + dir + diffs.length) % diffs.length;
        difficulty = diffs[currentIdx];
    } else if (index === 4) { // Audio Tunnels — toggle
        audioTunnelsEnabled = !audioTunnelsEnabled;
    } else if (index === 5) { // Banter System — toggle
        banterEnabled = !banterEnabled;
    } else if (index === 6) { // Streamer Mode — toggle (disables both voice channels)
        streamerMode = !streamerMode;
        if (streamerMode) {
            // Save previous states for restoration when streamer mode is turned off
            window._preStreamerBanter = banterEnabled;
            window._preStreamerAudioTunnels = audioTunnelsEnabled;
            banterEnabled = false;
            audioTunnelsEnabled = false;
        } else {
            // Restore previous toggle states
            if (typeof window._preStreamerBanter !== 'undefined') {
                banterEnabled = window._preStreamerBanter;
                audioTunnelsEnabled = window._preStreamerAudioTunnels;
            }
        }
    } else if (index === 7) { // GRO-940: Accessibility Subtitles — toggle
        subtitlesEnabled = !subtitlesEnabled;
    }
}

function loadGameScreen() {
    // Show save slots as an in-game overlay rather than navigating away
    const saves = CampaignSave.loadAll();
    let hasSaves = false;
    for (let i = 0; i < 3; i++) {
        if (saves[i]) { hasSaves = true; break; }
    }
    if (!hasSaves) {
        // No saves exist — just start a new game
        window.location.href = 'ship_select.html';
        return;
    }
    // Store saves for rendering and go to a simple load screen
    window._loadSaves = saves;
    window._loadSelectedSlot = 0;
    transitionToScreen(SCREENS.LOAD_GAME);
}

function confirmLoadGame() {
    const slot = window._loadSelectedSlot || 0;
    const save = (window._loadSaves || [])[slot];
    if (!save) return;

    // Resurrect from last checkpoint if one exists (lose up to 2 waves of progress)
    // Read checkpoint directly — no life penalty (that's only for death-respawn)
    if (save.lastCheckpoint && window.CampaignSave) {
        const cp = save.lastCheckpoint;
        CampaignSave.save(slot, {
            ...save,
            biome: cp.biome,
            wave: cp.wave,
            score: cp.score,
            scrap: cp.scrap,
            weaponLevel: cp.weaponLevel,
            shield: cp.shield,
            lives: cp.lives,
            lootedSegments: cp.lootedSegments,
            currentSegment: cp.currentSegment
        });
        // Re-read the saved state we just updated
        const reloaded = CampaignSave.load(slot);
        if (reloaded) {
            window._loadSaves[slot] = reloaded;
        }
    }

    // Restore settings
    difficulty = save.difficulty || 'normal';
    masterVolume = save.masterVolume || 0.8;
    sfxVolume = save.sfxVolume || 0.8;
    musicVolume = save.musicVolume || 0.6;
    banterEnabled = save.banterEnabled !== undefined ? save.banterEnabled : true;
    audioTunnelsEnabled = save.audioTunnelsEnabled !== undefined ? save.audioTunnelsEnabled : true;
    streamerMode = save.streamerMode || false;
    subtitlesEnabled = save.subtitlesEnabled !== undefined ? save.subtitlesEnabled : true;

    // Restore ship
    selectedShipIndex = SHIP_OPTIONS.indexOf(save.ship);
    if (selectedShipIndex < 0) selectedShipIndex = 0;

    // Set run state
    window._resumeSave = save;
    window._resumeSlot = slot;
    window.location.href = 'ship_select.html?continue=' + slot;
}

function deleteSaveSlot(slot) {
    CampaignSave.delete(slot);
    window._loadSaves = CampaignSave.loadAll();
    // If all slots now empty, bounce back to main menu
    const hasAny = window._loadSaves.some(s => s !== null);
    if (!hasAny) {
        transitionToScreen(SCREENS.MENU);
    }
}

function handlePauseMenuSelect() {
    if (pauseSubScreen === 'menu') {
        if (pauseMenuIndex === 0) { // RESUME
            paused = false;
            pauseSubScreen = 'menu';
        } else if (pauseMenuIndex === 1) { // SETTINGS
            pauseSubScreen = 'settings';
            selectedSettingsIndex = 0;
        } else if (pauseMenuIndex === 2) { // QUIT TO MENU
            paused = false;
            pauseSubScreen = 'menu';
            gameOver = true;
            transitionToScreen(SCREENS.MENU);
        }
    } else if (pauseSubScreen === 'settings') {
        if (selectedSettingsIndex === 8) { // BACK
            pauseSubScreen = 'menu';
        }
    }
}

function handleMenuConfirm() {
    if (currentScreen === SCREENS.MENU) {
        if (selectedMenuIndex === 0) { // CONTINUE
            const hasSaves = (() => {
                try {
                    const saves = JSON.parse(localStorage.getItem('darius_star_saves') || 'null');
                    if (!Array.isArray(saves)) return false;
                    return saves.some(s => s !== null);
                } catch(e) { return false; }
            })();
            if (!hasSaves) {
                playSound('menu_click');
                return; // Grayed out — no saves to continue
            }
            loadGameScreen();
        } else if (selectedMenuIndex === 1) { // START GAME
            window.location.href = 'ship_select.html';
        } else if (selectedMenuIndex === 2) { // UPGRADE SHOP
            transitionToScreen(SCREENS.UPGRADE_SHOP);
        } else if (selectedMenuIndex === 3) { // SHIP SELECT
            window.location.href = 'ship_select.html';
        } else if (selectedMenuIndex === 4) { // SETTINGS
            selectedSettingsIndex = 0;
            transitionToScreen(SCREENS.SETTINGS);
        } else if (selectedMenuIndex === 5) { // LEADERBOARD
            transitionToScreen(SCREENS.LEADERBOARD);
        } else if (selectedMenuIndex === 6) { // CREDITS
            transitionToScreen(SCREENS.CREDITS);
        }
    } else if (currentScreen === SCREENS.SHIP_SELECT) {
        selectedShip = SHIP_OPTIONS[selectedShipIndex];
        if (shipSelectSource === 'start') {
            // GRO-936: Route through briefing screen before gameplay
            transitionToScreen(SCREENS.BRIEFING);
            startBriefing(biomeLevel, () => {
                transitionToScreen(SCREENS.PLAYING);
            });
        } else {
            transitionToScreen(SCREENS.MENU);
        }
    } else if (currentScreen === SCREENS.SETTINGS) {
        if (selectedSettingsIndex === 7) { // BACK
            transitionToScreen(SCREENS.MENU);
        }
    } else if (currentScreen === SCREENS.LEVEL_CLEAR) {
        ctx.fillStyle = 'rgba(5, 8, 18, 0.94)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        window._levelClearAnimTimer = (window._levelClearAnimTimer || 0) + 0.016;
        const anim = window._levelClearAnimTimer;
        const sum = window._levelClearSummary || {};
        const b = sum.biome || ((typeof LevelManager !== 'undefined') ? LevelManager.biome : 1);
        const l = sum.level || ((typeof LevelManager !== 'undefined') ? LevelManager.level : 1);
        const lvlInfo = (typeof BIOME_DATA !== 'undefined' && BIOME_DATA.getLevelInfo)
            ? BIOME_DATA.getLevelInfo(b, l)
            : { name: `Sector ${b}.${l}`, landmark: 'coral_spire', intel: 'Sector airspace cleared.' };

        // 1. Header Banner
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 22px monospace';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 14;
        ctx.fillText('SECTOR DEBRIEFING // LEVEL COMPLETE', canvas.width / 2, 38);

        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 14px monospace';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 8;
        ctx.fillText(`SECTOR ${lvlInfo.name.toUpperCase()}`, canvas.width / 2, 60);
        ctx.shadowBlur = 0;

        // 2. Metrics & Tally Box (Left Column)
        const leftX = 40;
        const topY = 78;
        const boxW = (canvas.width - 100) / 2;
        const boxH = 220;

        ctx.fillStyle = 'rgba(12, 18, 32, 0.85)';
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.fillRect(leftX, topY, boxW, boxH);
        ctx.strokeRect(leftX, topY, boxW, boxH);

        const killRatio = Math.min(1.0, anim / 0.8);
        const scrapRatio = Math.min(1.0, Math.max(0, (anim - 0.4) / 0.8));
        const scoreRatio = Math.min(1.0, Math.max(0, (anim - 0.8) / 0.8));

        const curKills = Math.floor((sum.killCount || 0) * killRatio);
        const curScrap = Math.floor((sum.scrapCollected || 0) * scrapRatio);
        const curScore = Math.floor((sum.scoreEarned || 0) * scoreRatio);
        const scrapPct = sum.scrapPct !== undefined ? sum.scrapPct : 100;

        ctx.textAlign = 'left';
        ctx.font = 'bold 11px monospace';

        // Hostiles
        ctx.fillStyle = '#88ccff';
        ctx.fillText(`🎯 HOSTILES DESTROYED:`, leftX + 18, topY + 28);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${curKills} / ${sum.killTotal || sum.killCount || 0} (${Math.round((sum.killPct || 100) * killRatio)}%)`, leftX + 18, topY + 46);

        // Scrap
        ctx.fillStyle = '#ffcc00';
        ctx.fillText(`💎 QUANTUM SCRAP SALVAGED:`, leftX + 18, topY + 76);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`+${curScrap} SCRAP (${Math.round(scrapPct * scrapRatio)}% EFFICIENCY)`, leftX + 18, topY + 94);

        // Scrap Efficiency Badge
        if (anim > 1.0) {
            ctx.fillStyle = scrapPct >= 85 ? '#00ff88' : (scrapPct >= 50 ? '#ffaa00' : '#ff4455');
            ctx.font = 'bold 9.5px monospace';
            const effText = scrapPct >= 85 ? '⭐ PERFECT SALVAGE (ALL CRITICAL JUNK SECURED)' :
                            scrapPct >= 50 ? '⚠️ PARTIAL SALVAGE (SOME JUNK DRIFTED AWAY)' :
                            '❌ LOW SALVAGE (UPGRADE QUANTUM TRACTOR BEAM!)';
            ctx.fillText(effText, leftX + 18, topY + 112);
        }

        // Score
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`⭐ SECTOR COMBAT SCORE:`, leftX + 18, topY + 142);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`+${curScore.toLocaleString()} PTS`, leftX + 18, topY + 160);

        // Time
        const m = Math.floor((sum.timeSpent || 0) / 60);
        const s = Math.floor((sum.timeSpent || 0) % 60);
        ctx.fillStyle = '#8899aa';
        ctx.font = '9.5px monospace';
        ctx.fillText(`⏱️ TRANSIT TIME: ${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`, leftX + 18, topY + 195);

        // 3. Grade & Autosave Box (Right Column)
        const rightX = leftX + boxW + 20;
        ctx.fillStyle = 'rgba(12, 18, 32, 0.85)';
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.3)';
        ctx.fillRect(rightX, topY, boxW, boxH);
        ctx.strokeRect(rightX, topY, boxW, boxH);

        const rank = sum.rank || 'S';
        const rankColor = rank === 'S' ? '#ffd700' : (rank === 'A' ? '#00ffff' : (rank === 'B' ? '#00ff88' : '#ff4455'));
        ctx.textAlign = 'center';
        ctx.fillStyle = '#88aacc';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('MISSION PERFORMANCE GRADE', rightX + boxW / 2, topY + 28);

        if (anim > 1.2) {
            const stampScale = Math.max(1.0, 2.5 - (anim - 1.2) * 6);
            ctx.save();
            ctx.translate(rightX + boxW / 2, topY + 75);
            ctx.scale(stampScale, stampScale);
            ctx.fillStyle = rankColor;
            ctx.font = 'bold 36px monospace';
            ctx.shadowColor = rankColor;
            ctx.shadowBlur = 18;
            ctx.fillText(`[ ${rank}-RANK ]`, 0, 10);
            ctx.restore();
        }

        // Autosave Confirmation
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 11px monospace';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 6;
        ctx.fillText('💾 CAMPAIGN PROGRESS AUTOSAVED', rightX + boxW / 2, topY + 145);
        ctx.shadowBlur = 0;

        // Current Scrap Wallet
        const us = window.DS_UpgradeSystem;
        const totalScrap = us && us.state ? us.state.scrap : (window.runScrap || 0);
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`TOTAL SCRAP BALANCE: 💎 ${totalScrap}`, rightX + boxW / 2, topY + 180);

        // 4. Action Buttons Grid
        window._levelClearHitRegions = [];
        const btnY = topY + boxH + 16;
        const btnW = (canvas.width - 100 - 30) / 4;
        const btnH = 46;

        const btns = [
            { key: 'next', label: '[ENTER] NEXT SECTOR', color: '#00ff88', bg: 'rgba(0, 255, 136, 0.15)' },
            { key: 'upgrade', label: '[U] QUANTUM DODAD', color: '#00ffff', bg: 'rgba(0, 255, 255, 0.15)' },
            { key: 'intel', label: '[L] SECTOR INTEL LOG', color: '#ffaa00', bg: 'rgba(255, 170, 0, 0.15)' },
            { key: 'menu', label: '[ESC] COMMAND BRIDGE', color: '#ff4455', bg: 'rgba(255, 68, 85, 0.15)' }
        ];

        for (let i = 0; i < btns.length; i++) {
            const bx = leftX + i * (btnW + 10);
            const bDef = btns[i];
            window._levelClearHitRegions.push({ key: bDef.key, x: bx, y: btnY, w: btnW, h: btnH });

            ctx.fillStyle = bDef.bg;
            ctx.strokeStyle = bDef.color;
            ctx.lineWidth = 1.5;
            ctx.fillRect(bx, btnY, btnW, btnH);
            ctx.strokeRect(bx, btnY, btnW, btnH);

            ctx.textAlign = 'center';
            ctx.fillStyle = bDef.color;
            ctx.font = 'bold 9.5px monospace';
            ctx.fillText(bDef.label, bx + btnW / 2, btnY + 28);
        }

        // 5. Sector Intel Modal
        if (window._showIntelModal) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
            ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

            ctx.textAlign = 'center';
            ctx.fillStyle = '#00ffff';
            ctx.font = 'bold 16px monospace';
            ctx.fillText(`SECTOR INTEL // ${lvlInfo.name.toUpperCase()}`, canvas.width / 2, 85);

            ctx.fillStyle = '#88aacc';
            ctx.font = '11px monospace';
            ctx.fillText(`LANDMARK CLASSIFICATION: ${lvlInfo.landmark.toUpperCase()}`, canvas.width / 2, 110);

            ctx.textAlign = 'left';
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px monospace';
            if (typeof wrapText === 'function') {
                wrapText(ctx, lvlInfo.intel || '', 80, 150, canvas.width - 160, 22);
            } else {
                ctx.fillText(lvlInfo.intel || '', 80, 150);
            }

            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('PRESS [L] OR CLICK ANYWHERE TO CLOSE INTEL LOG', canvas.width / 2, canvas.height - 75);
        }

        ctx.restore();

    } else if (currentScreen === SCREENS.CREDITS) {
        transitionToScreen(SCREENS.MENU);
    }
}

function getCanvasMouseCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
}

function drawMenuScreens() {
    if (currentScreen === SCREENS.LOADING) {
        if (typeof AssetPreloader !== 'undefined') {
            AssetPreloader.draw(ctx, canvas.width, canvas.height);
        }
        return;
    }
    drawTitleBackground();
    
    if (currentScreen === SCREENS.MENU) {
        drawMainMenu(ctx);
    } else if (currentScreen === SCREENS.SHIP_SELECT) {
        drawShipSelect(ctx);
    } else if (currentScreen === SCREENS.SETTINGS) {
        drawSettings(ctx);
    } else if (currentScreen === SCREENS.LEADERBOARD) {
        if (typeof CockpitUI !== 'undefined') {
            CockpitUI.drawCockpitGrid(ctx, canvas.width, canvas.height, (typeof gameTime !== 'undefined' ? gameTime : 0));
        }
        ctx.save();
        ctx.textAlign = 'center';
        
        // Header
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 22px monospace';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 12;
        ctx.fillText('EDC NAVY GALACTIC ARCHIVE // COMBAT RANKINGS', canvas.width / 2, 42);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 10.5px monospace';
        ctx.fillText('CROSS-SECTOR FLIGHT DATA & DEEP DESCENT TELEMETRY', canvas.width / 2, 58);
        
        // Load scores using Leaderboard module
        const scores = window.Leaderboard ? Leaderboard.getTop(leaderboardFilter, 50) : [];
        
        // Show top record summary for category
        const categoryTop = scores.length > 0 ? scores[0] : null;
        if (categoryTop && window.Leaderboard) {
            let topValStr = "";
            const val = Leaderboard.categories[leaderboardFilter].getValue(categoryTop);
            if (leaderboardFilter === 'speedrun') {
                const m = Math.floor(val / 60);
                const sec = Math.floor(val % 60);
                topValStr = `${m}:${sec.toString().padStart(2, '0')}`;
            } else if (leaderboardFilter === 'scrapLord') {
                topValStr = `${val.toLocaleString()} SCRAP`;
            } else {
                topValStr = `${val} DEATHS`;
            }
            ctx.fillStyle = '#00ff88';
            ctx.font = 'bold 11px monospace';
            ctx.fillText(`★ CURRENT GALACTIC RECORD: ${topValStr} — ${(categoryTop.ship || 'unknown').toUpperCase()} — ${(categoryTop.difficulty || 'normal').toUpperCase()}`, canvas.width / 2, 78);
        } else {
            ctx.fillStyle = '#6a7a9a';
            ctx.font = '11px monospace';
            ctx.fillText('No recorded flight transmissions in this category archive.', canvas.width / 2, 78);
        }
        
        // Category tabs
        const categories = ['speedrun', 'scrapLord', 'survivor'];
        const categoryLabels = ['[1] ⏱ SPEEDRUN', '[2] 💎 SCRAP LORD', '[3] 🛡 SURVIVOR'];
        const filterStartX = 140;
        const filterY = 92;
        const tabW = 160;
        const tabH = 26;
        const gap = 175;
        
        for (let fi = 0; fi < categories.length; fi++) {
            const fx = filterStartX + fi * gap;
            const isActive = leaderboardFilter === categories[fi];
            if (typeof CockpitUI !== 'undefined') {
                CockpitUI.drawAvionicsButton(ctx, fx, filterY, tabW, tabH, categoryLabels[fi], '', isActive, false, {
                    primaryColor: '#ffaa00',
                    font: 'bold 10px monospace'
                });
            }
        }
        
        // Main Archive Panel
        if (typeof CockpitUI !== 'undefined') {
            CockpitUI.drawPanel(ctx, 40, 128, 720, 260, {
                chamfer: 6,
                borderColor: 'rgba(0, 200, 255, 0.3)',
                bgColor: 'rgba(8, 16, 32, 0.90)',
                bracketColor: '#ffaa00',
                headerBar: true,
                headerBarHeight: 22
            });
        }
        
        // Entries
        const listStartY = 155;
        const rowH = 28;
        const maxVisible = 10;
        const display = scores.slice(leaderboardScrollOffset, leaderboardScrollOffset + maxVisible);
        
        if (display.length === 0) {
            ctx.fillStyle = '#8a8a9f';
            ctx.font = '14px monospace';
            ctx.fillText('No submissions match this category.', canvas.width / 2, 250);
        } else {
            // Column headers
            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = '#5a5a7f';
            ctx.textAlign = 'left';
            ctx.fillText('#', 100, listStartY - 8);
            ctx.fillText(leaderboardFilter === 'speedrun' ? 'TIME' : (leaderboardFilter === 'scrapLord' ? 'SCRAP' : 'DEATHS'), 140, listStartY - 8);
            ctx.fillText('SHIP', 260, listStartY - 8);
            ctx.fillText('TIER', 360, listStartY - 8);
            ctx.fillText('DIFF', 480, listStartY - 8);
            ctx.fillText('DATE', 580, listStartY - 8);
            
            ctx.font = '13px monospace';
            for (let si = 0; si < display.length; si++) {
                const s = display[si];
                const rank = leaderboardScrollOffset + si + 1;
                const ry = listStartY + si * rowH;
                
                // Row background
                ctx.fillStyle = si % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)';
                ctx.fillRect(85, ry - 14, 630, rowH);
                
                // Rank highlight
                if (rank <= 3) {
                    const medal = rank === 1 ? '#ffd700' : (rank === 2 ? '#c0c0c0' : '#cd7f32');
                    ctx.fillStyle = medal;
                } else {
                    ctx.fillStyle = '#8a8a9f';
                }
                ctx.textAlign = 'left';
                ctx.fillText(rank, 100, ry + 4);
                
                // Formatted Value
                ctx.fillStyle = '#ffffff';
                let displayValue = "";
                if (window.Leaderboard) {
                    const val = Leaderboard.categories[leaderboardFilter].getValue(s);
                    if (leaderboardFilter === 'speedrun') {
                        const m = Math.floor(val / 60);
                        const sec = Math.floor(val % 60);
                        displayValue = `${m}:${sec.toString().padStart(2, '0')}`;
                    } else if (leaderboardFilter === 'scrapLord') {
                        displayValue = val.toLocaleString();
                    } else {
                        displayValue = val + (val === 1 ? ' death' : ' deaths');
                    }
                }
                ctx.fillText(displayValue, 140, ry + 4);
                ctx.fillText((s.ship || 'unknown').toUpperCase(), 260, ry + 4);
                
                // Tier name + color
                if (s.tier) {
                    ctx.fillStyle = s.tier.color || '#ffffff';
                    ctx.fillText(s.tier.name.toUpperCase(), 360, ry + 4);
                } else {
                    ctx.fillStyle = '#666666';
                    ctx.fillText('UNRANKED', 360, ry + 4);
                }
                
                const diffColors = { easy: '#00ff55', normal: '#ffaa00', hard: '#ff0033' };
                ctx.fillStyle = diffColors[s.difficulty] || '#ffffff';
                ctx.fillText((s.difficulty || 'normal').toUpperCase(), 480, ry + 4);
                
                ctx.fillStyle = '#8a8a9f';
                ctx.fillText(s.date ? s.date.split('T')[0] : '', 580, ry + 4);
            }
        }
        
        // Scroll indicator
        if (scores.length > maxVisible) {
            ctx.fillStyle = '#5a5a7f';
            ctx.font = '10px monospace';
            const showing = Math.min(leaderboardScrollOffset + maxVisible, scores.length);
            ctx.fillText(`Showing ${leaderboardScrollOffset + 1}-${showing} of ${scores.length}  |  UP/DOWN to scroll`, canvas.width / 2, canvas.height - 48);
        }
        
        // Clear & Back
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = '#ff0033';
        ctx.fillText('[C] CLEAR LEADERBOARD', canvas.width / 2, canvas.height - 28);
        
        ctx.fillStyle = '#8a8a9f';
        ctx.font = '10px monospace';
        ctx.fillText('ESC / BACKSPACE to RETURN  |  ARROWS to SWITCH CATEGORIES', canvas.width / 2, canvas.height - 8);
        
        ctx.restore();
    } else if (currentScreen === SCREENS.LOAD_GAME) {
        if (typeof CockpitUI !== 'undefined') {
            CockpitUI.drawCockpitGrid(ctx, canvas.width, canvas.height, (typeof gameTime !== 'undefined' ? gameTime : 0));
        }
        ctx.save();

        // 1. Header Banner
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 22px monospace';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 12;
        ctx.fillText('FLIGHT RECORDER // MEMORY PODS ARCHIVE', canvas.width / 2, 42);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 10.5px monospace';
        ctx.fillText('RESTORE TACTICAL CAMPAIGN STATE FROM SHIP OPTICAL STORAGE', canvas.width / 2, 58);

        const saves = window._loadSaves || [];
        const selected = window._loadSelectedSlot || 0;

        const slotW = Math.min(canvas.width - 60, 680);
        const slotH = 76;
        const slotX = (canvas.width - slotW) / 2;
        const slotStartY = 85;
        const slotSpacing = slotH + 14;
        const btnW = 90;
        const btnH = 30;

        window._loadHitRegions = [];

        for (let i = 0; i < 3; i++) {
            const y = slotStartY + i * slotSpacing;
            const isSelected = i === selected;
            const save = saves[i];

            window._loadHitRegions[i] = { x: slotX, y: y, w: slotW, h: slotH,
                btnLoad: null, btnDelete: null, isSelected: isSelected };

            if (typeof CockpitUI !== 'undefined') {
                CockpitUI.drawPanel(ctx, slotX, y, slotW, slotH, {
                    chamfer: 6,
                    borderColor: isSelected ? '#00ffff' : (save ? 'rgba(0, 200, 255, 0.3)' : 'rgba(50, 60, 80, 0.3)'),
                    bgColor: isSelected ? 'rgba(0, 255, 255, 0.14)' : 'rgba(8, 16, 32, 0.88)',
                    bracketColor: isSelected ? '#00ffff' : '#ffaa00',
                    glow: isSelected,
                    shadowBlur: isSelected ? 12 : 6,
                    brackets: isSelected
                });
            }

            ctx.textAlign = 'left';
            if (save) {
                const s = CampaignSave.summarize(i);
                ctx.fillStyle = isSelected ? '#00ffff' : '#ffffff';
                ctx.font = 'bold 13px monospace';
                const ngText = (save.ngLevel && save.ngLevel > 0) ? ` [NG+${save.ngLevel}]` : '';
                ctx.fillText(`POD ${i+1}: BIOME ${s.biome} — SECTOR ${s.wave} // ${s.ship.toUpperCase()}${ngText}`, slotX + 16, y + 20);

                // Biome Badge
                ctx.font = 'bold 9.5px monospace';
                ctx.fillStyle = '#00ff88';
                ctx.fillText(`● STATUS: NOMINAL // DIFFICULTY: ${s.difficulty.toUpperCase()}`, slotX + 16, y + 36);

                let ngMeta = '';
                if (save.ngLevel && save.ngLevel > 0 && window.NGPlus) {
                    const ngSummary = NGPlus.summarize(save);
                    if (ngSummary) {
                        ngMeta = ` | NG+${ngSummary.level}`;
                    }
                }

                ctx.fillStyle = '#88aacc';
                ctx.font = '10px monospace';
                ctx.fillText(`💎 SCRAP: ${s.scrap} | SCORE: ${s.score.toLocaleString()} | TIME: ${s.playTime} | DEATHS: ${s.deaths}${ngMeta}`, slotX + 16, y + 54);
                ctx.fillStyle = '#5a7a9a';
                ctx.fillText(`ARCHIVED: ${s.date} ${s.time} | SHIPS UNLOCKED: ${s.shipsUnlocked}`, slotX + 16, y + 68);

                // Action Buttons for selected slot
                if (isSelected) {
                    const btnLoadX = slotX + slotW - btnW * 2 - 20;
                    const btnDeleteX = slotX + slotW - btnW - 10;
                    const btnY = y + (slotH - btnH) / 2;

                    if (typeof CockpitUI !== 'undefined') {
                        CockpitUI.drawAvionicsButton(ctx, btnLoadX, btnY, btnW, btnH, 'ENGAGE', '[ENTER]', true, false, {
                            primaryColor: '#00ff88',
                            font: 'bold 11px monospace'
                        });
                        CockpitUI.drawAvionicsButton(ctx, btnDeleteX, btnY, btnW, btnH, 'PURGE', '[DEL]', false, false, {
                            primaryColor: '#ff2244',
                            accentColor: '#ff2244',
                            font: 'bold 11px monospace'
                        });
                    }

                    window._loadHitRegions[i].btnLoad = { x: btnLoadX, y: btnY, w: btnW, h: btnH };
                    window._loadHitRegions[i].btnDelete = { x: btnDeleteX, y: btnY, w: btnW, h: btnH };
                }
            } else {
                ctx.fillStyle = isSelected ? '#00ffff' : '#556677';
                ctx.font = 'bold 13px monospace';
                ctx.fillText(`POD ${i+1}: [EMPTY OPTICAL CARTRIDGE]`, slotX + 16, y + 26);
                ctx.fillStyle = '#445566';
                ctx.font = '10px monospace';
                ctx.fillText('No tactical flight records stored. Start a new campaign to initialize.', slotX + 16, y + 48);
            }
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff3355';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('[ESC] RETURN TO COMMAND BRIDGE', canvas.width / 2, canvas.height - 30);

        ctx.fillStyle = '#6a7a9a';
        ctx.font = '10px monospace';
        ctx.fillText('ENTER / CLICK to Load  |  DEL to Purge Memory  |  ESC to Return', canvas.width / 2, canvas.height - 12);

        ctx.restore();
    } else if (currentScreen === SCREENS.UPGRADE_SHOP) {
        // Precursor Quantum Fabricator / Scrap Shop UI
        if (typeof CockpitUI !== 'undefined') {
            CockpitUI.drawCockpitGrid(ctx, canvas.width, canvas.height, (typeof gameTime !== 'undefined' ? gameTime : 0));
        }
        ctx.save();

        const us = window.DS_UpgradeSystem;
        const upgradeLabels = ['weapons', 'shields', 'rockets', 'magnetism', 'engines', 'specials', 'addons', 'cosmetics'];
        const upgradeNames = [
            '1. Quantum Main Cannons',
            '2. Aegis Shield & Nanites',
            '3. Valkyrie Missile Pods',
            '4. Quantum Tractor Beam',
            '5. Hyper-Drive Thrusters',
            '6. Cyber Overload Special',
            '7. Quantum Combat Drones',
            '8. Chrono Plating & FX'
        ];
        const maxRanks = upgradeLabels.map(label => us ? us.getMaxRank(label) : 10);
        const selected = window._upgradeSelected || 0;
        const scrap = us && us.state ? us.state.scrap : 0;

        // 1. Header & Quantum Dodad Lore Subtitle
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 22px monospace';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 12;
        ctx.fillText('PRECURSOR QUANTUM FABRICATOR', canvas.width / 2, 36);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#88aacc';
        ctx.font = '10.5px monospace';
        ctx.fillText('TRANSMUTING SALVAGED QUANTUM JUNK INTO DURABLE SHIP HARDPOINTS', canvas.width / 2, 52);

        // Scrap Wallet Badge
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 14px monospace';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 8;
        ctx.fillText(`💎 RECOVERED QUANTUM SCRAP: ${scrap.toLocaleString()}`, canvas.width / 2, 72);
        ctx.shadowBlur = 0;

        // 2. 2-Column Card Grid (4 per column)
        const colW = (canvas.width - 70) / 2;
        const rowH = 72;
        const startY = 88;
        window._upgradeHitRegions = [];

        for (let i = 0; i < upgradeLabels.length; i++) {
            const col = i >= 4 ? 1 : 0;
            const row = i % 4;
            const cardX = 25 + col * (colW + 20);
            const cardY = startY + row * (rowH + 8);

            const label = upgradeLabels[i];
            const rank = us && us.state ? (us.state.upgrades[label] || 0) : 0;
            const maxRank = maxRanks[i];
            let cost = 0;
            try { cost = us ? us.getUpgradeCost(label) : 999; } catch(e) {}
            const isMaxed = rank >= maxRank;
            const canAfford = !isMaxed && scrap >= cost;
            const isSelected = i === selected;

            window._upgradeHitRegions.push({ index: i, x: cardX, y: cardY, w: colW, h: rowH, label: label, canAfford: canAfford });

            // Card Panel
            if (typeof CockpitUI !== 'undefined') {
                CockpitUI.drawPanel(ctx, cardX, cardY, colW, rowH, {
                    chamfer: 6,
                    borderColor: isSelected ? '#00ffff' : 'rgba(0, 200, 255, 0.22)',
                    bgColor: isSelected ? 'rgba(0, 255, 255, 0.14)' : 'rgba(10, 18, 34, 0.88)',
                    bracketColor: isSelected ? '#00ffff' : '#ffaa00',
                    glow: isSelected,
                    shadowBlur: isSelected ? 10 : 4,
                    brackets: isSelected
                });
            }

            // Title
            ctx.textAlign = 'left';
            ctx.fillStyle = isSelected ? '#00ffff' : '#ffffff';
            ctx.font = 'bold 12px monospace';
            ctx.fillText(upgradeNames[i], cardX + 12, cardY + 18);

            // Cost / Status Badge
            ctx.textAlign = 'right';
            if (isMaxed) {
                ctx.fillStyle = '#00ff88';
                ctx.font = 'bold 11px monospace';
                ctx.fillText('✔ MAXED', cardX + colW - 12, cardY + 18);
            } else {
                ctx.fillStyle = canAfford ? '#ffcc00' : '#ff3355';
                ctx.font = 'bold 11px monospace';
                ctx.fillText(`${cost} SCRAP`, cardX + colW - 12, cardY + 18);
            }

            // Segmented Rank Meter
            const meterX = cardX + 12;
            const meterY = cardY + 26;
            const meterW = colW - 130;
            if (typeof CockpitUI !== 'undefined') {
                CockpitUI.drawSegmentedBar(ctx, meterX, meterY, meterW, 8, rank, maxRank, {
                    segments: maxRank,
                    activeColor: isMaxed ? '#00ff88' : (isSelected ? '#00ffff' : '#00aaee')
                });
            }

            // Rank text
            ctx.textAlign = 'left';
            ctx.fillStyle = '#88aacc';
            ctx.font = 'bold 10px monospace';
            ctx.fillText(`LV ${rank}/${maxRank}`, meterX + meterW + 8, meterY + 7);

            // Real-Time Stat Delta Preview
            let statDelta = '';
            if (label === 'weapons') {
                statDelta = `Dmg +${rank*5}% → +${(rank+1)*5}% | Bullet Speed +${rank*5}%`;
            } else if (label === 'shields') {
                statDelta = `Shield ${100 + rank*10}HP → ${100 + (rank+1)*10}HP (+10 HP)`;
            } else if (label === 'rockets') {
                statDelta = `Missile Dmg +${rank*10}% | Blast +${rank*12}px`;
            } else if (label === 'magnetism') {
                statDelta = `Tractor Radius: ${45 + rank*28}px → ${45 + (rank+1)*28}px (+28px)`;
            } else if (label === 'engines') {
                statDelta = `Speed +${rank*3}% | Dodge CD: ${Math.round((3.5 * Math.max(0.4, 1-rank*0.05))*10)/10}s`;
            } else if (label === 'specials') {
                statDelta = `Special Duration: +${Math.round(rank*0.35*100)/100}s | CD: -${rank*5}%`;
            } else if (label === 'addons') {
                const curDrones = rank >= 10 ? 4 : (rank >= 7 ? 3 : (rank >= 4 ? 2 : (rank >= 1 ? 1 : 0)));
                statDelta = `Companion Combat Drones Active: ${curDrones} / 4`;
            } else {
                statDelta = `Chrono Plating Colors (Cyan, Mag, Gold, Void), FX`;
            }

            ctx.fillStyle = isSelected ? '#ffffff' : '#8899aa';
            ctx.font = '9px monospace';
            ctx.fillText(statDelta, cardX + 12, cardY + 48);

            // Dynamic Sub-Description
            ctx.fillStyle = isSelected ? '#00ff88' : '#5a6a7a';
            ctx.font = 'italic 8.5px monospace';
            const subDesc = isMaxed ? 'Maximum hardpoint efficiency achieved.' : (canAfford ? '▶ READY TO TRANSMUTE [ENTER]' : '⚠️ INSUFFICIENT SCRAP SALVAGE');
            ctx.fillText(subDesc, cardX + 12, cardY + 62);
        }

        // Footer instructions
        ctx.textAlign = 'center';
        ctx.fillStyle = '#6a7a9a';
        ctx.font = '10px monospace';
        ctx.fillText('↑↓←→ SELECT  |  ENTER / CLICK TO TRANSMUTE  |  ESC RETURN TO BRIDGE', canvas.width / 2, canvas.height - 12);

        ctx.restore();
    } else if (currentScreen === SCREENS.LEVEL_CLEAR) {
        if (typeof CockpitUI !== 'undefined') {
            CockpitUI.drawCockpitGrid(ctx, canvas.width, canvas.height, (typeof gameTime !== 'undefined' ? gameTime : 0));
        }
        ctx.save();

        window._levelClearAnimTimer = (window._levelClearAnimTimer || 0) + 0.016;
        const anim = window._levelClearAnimTimer;
        const sum = window._levelClearSummary || {};
        const b = sum.biome || ((typeof LevelManager !== 'undefined') ? LevelManager.biome : 1);
        const l = sum.level || ((typeof LevelManager !== 'undefined') ? LevelManager.level : 1);
        const lvlInfo = (typeof BIOME_DATA !== 'undefined' && BIOME_DATA.getLevelInfo)
            ? BIOME_DATA.getLevelInfo(b, l)
            : { name: `Sector ${b}.${l}`, landmark: 'coral_spire', intel: 'Sector airspace cleared.' };

        // 1. Header Banner
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 22px monospace';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 12;
        ctx.fillText('SECTOR COMBAT DEBRIEFING // AIRSPACE SECURED', canvas.width / 2, 38);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`SECTOR ${lvlInfo.name.toUpperCase()}`, canvas.width / 2, 56);

        // 2. Metrics & Tally Box (Left Column)
        const leftX = 40;
        const topY = 74;
        const boxW = (canvas.width - 100) / 2;
        const boxH = 230;

        if (typeof CockpitUI !== 'undefined') {
            CockpitUI.drawPanel(ctx, leftX, topY, boxW, boxH, {
                chamfer: 6,
                borderColor: 'rgba(0, 200, 255, 0.35)',
                bgColor: 'rgba(8, 16, 32, 0.90)',
                bracketColor: '#00ffff',
                headerBar: true,
                headerBarHeight: 22
            });

            ctx.textAlign = 'left';
            ctx.fillStyle = '#00ffff';
            ctx.font = 'bold 10px monospace';
            ctx.fillText('📡 COMBAT TELEMETRY METRICS', leftX + 14, topY + 15);
        }

        const killRatio = Math.min(1.0, anim / 0.8);
        const scrapRatio = Math.min(1.0, Math.max(0, (anim - 0.4) / 0.8));
        const scoreRatio = Math.min(1.0, Math.max(0, (anim - 0.8) / 0.8));

        const curKills = Math.floor((sum.killCount || 0) * killRatio);
        const curScrap = Math.floor((sum.scrapCollected || 0) * scrapRatio);
        const curScore = Math.floor((sum.scoreEarned || 0) * scoreRatio);
        const scrapPct = sum.scrapPct !== undefined ? sum.scrapPct : 100;

        ctx.textAlign = 'left';
        ctx.font = 'bold 11px monospace';

        // Hostiles
        ctx.fillStyle = '#88ccff';
        ctx.fillText(`🎯 HOSTILES DESTROYED:`, leftX + 18, topY + 44);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${curKills} / ${sum.killTotal || sum.killCount || 0} (${Math.round((sum.killPct || 100) * killRatio)}%)`, leftX + 18, topY + 60);

        // Scrap
        ctx.fillStyle = '#ffcc00';
        ctx.fillText(`💎 QUANTUM SCRAP SALVAGED:`, leftX + 18, topY + 90);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`+${curScrap} SCRAP (${Math.round(scrapPct * scrapRatio)}% EFFICIENCY)`, leftX + 18, topY + 106);

        // Scrap Efficiency Badge
        if (anim > 1.0) {
            ctx.fillStyle = scrapPct >= 85 ? '#00ff88' : (scrapPct >= 50 ? '#ffaa00' : '#ff4455');
            ctx.font = 'bold 9px monospace';
            const effText = scrapPct >= 85 ? '⭐ PERFECT SALVAGE (ALL CRITICAL JUNK SECURED)' :
                            scrapPct >= 50 ? '⚠️ PARTIAL SALVAGE (SOME JUNK DRIFTED AWAY)' :
                            '❌ LOW SALVAGE (UPGRADE QUANTUM TRACTOR BEAM!)';
            ctx.fillText(effText, leftX + 18, topY + 124);
        }

        // Score
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`⭐ SECTOR COMBAT SCORE:`, leftX + 18, topY + 154);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`+${curScore.toLocaleString()} PTS`, leftX + 18, topY + 170);

        // Time
        const m = Math.floor((sum.timeSpent || 0) / 60);
        const s = Math.floor((sum.timeSpent || 0) % 60);
        ctx.fillStyle = '#88aacc';
        ctx.font = '10px monospace';
        ctx.fillText(`⏱️ TRANSIT TIME: ${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`, leftX + 18, topY + 205);

        // 3. Grade & Autosave Box (Right Column)
        const rightX = leftX + boxW + 20;
        if (typeof CockpitUI !== 'undefined') {
            CockpitUI.drawPanel(ctx, rightX, topY, boxW, boxH, {
                chamfer: 6,
                borderColor: 'rgba(255, 170, 0, 0.35)',
                bgColor: 'rgba(8, 16, 32, 0.90)',
                bracketColor: '#ffaa00',
                headerBar: true,
                headerBarHeight: 22
            });

            ctx.textAlign = 'left';
            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 10px monospace';
            ctx.fillText('🏆 PERFORMANCE RATING & ARCHIVES', rightX + 14, topY + 15);
        }

        const rank = sum.rank || 'S';
        const rankColor = rank === 'S' ? '#ffd700' : (rank === 'A' ? '#00ffff' : (rank === 'B' ? '#00ff88' : '#ff4455'));
        ctx.textAlign = 'center';
        ctx.fillStyle = '#88aacc';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('MISSION PERFORMANCE GRADE', rightX + boxW / 2, topY + 46);

        if (anim > 1.2) {
            const stampScale = Math.max(1.0, 2.5 - (anim - 1.2) * 6);
            ctx.save();
            ctx.translate(rightX + boxW / 2, topY + 75);
            ctx.scale(stampScale, stampScale);
            ctx.fillStyle = rankColor;
            ctx.font = 'bold 36px monospace';
            ctx.shadowColor = rankColor;
            ctx.shadowBlur = 18;
            ctx.fillText(`[ ${rank}-RANK ]`, 0, 10);
            ctx.restore();
        }

        // Autosave Confirmation
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 11px monospace';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 6;
        ctx.fillText('💾 CAMPAIGN PROGRESS AUTOSAVED', rightX + boxW / 2, topY + 155);
        ctx.shadowBlur = 0;

        // Current Scrap Wallet
        const us = window.DS_UpgradeSystem;
        const totalScrap = us && us.state ? us.state.scrap : (window.runScrap || 0);
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`TOTAL SCRAP BALANCE: 💎 ${totalScrap.toLocaleString()}`, rightX + boxW / 2, topY + 190);

        // 4. Action Buttons Grid
        window._levelClearHitRegions = [];
        const btnY = topY + boxH + 14;
        const btnW = (canvas.width - 100 - 30) / 4;
        const btnH = 46;

        const btns = [
            { key: 'next', label: 'NEXT SECTOR', hint: '[ENTER]', color: '#00ff88', accent: '#00ff88' },
            { key: 'upgrade', label: 'QUANTUM DODAD', hint: '[U]', color: '#00ffff', accent: '#00ffff' },
            { key: 'intel', label: 'SECTOR INTEL', hint: '[L]', color: '#ffaa00', accent: '#ffaa00' },
            { key: 'menu', label: 'COMMAND BRIDGE', hint: '[ESC]', color: '#ff4455', accent: '#ff4455' }
        ];

        for (let i = 0; i < btns.length; i++) {
            const bx = leftX + i * (btnW + 10);
            const bDef = btns[i];
            window._levelClearHitRegions.push({ key: bDef.key, x: bx, y: btnY, w: btnW, h: btnH });

            if (typeof CockpitUI !== 'undefined') {
                CockpitUI.drawAvionicsButton(ctx, bx, btnY, btnW, btnH, bDef.label, bDef.hint, false, false, {
                    primaryColor: bDef.color,
                    accentColor: bDef.accent,
                    font: 'bold 10px monospace'
                });
            }
        }

        // 5. Precursor Sector Intel Archive Terminal Modal (GRO-4204)
        if (window._showIntelModal) {
            const modalX = 30;
            const modalY = 22;
            const modalW = canvas.width - 60;
            const modalH = canvas.height - 44;

            // Semi-transparent deep glass backdrop
            ctx.fillStyle = 'rgba(2, 6, 18, 0.96)';
            ctx.fillRect(modalX, modalY, modalW, modalH);

            // Glowing cyan tech border
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(modalX, modalY, modalW, modalH);

            // Corner accents
            const bracketSize = 12;
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(modalX, modalY + bracketSize); ctx.lineTo(modalX, modalY); ctx.lineTo(modalX + bracketSize, modalY); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(modalX + modalW - bracketSize, modalY); ctx.lineTo(modalX + modalW, modalY); ctx.lineTo(modalX + modalW, modalY + bracketSize); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(modalX, modalY + modalH - bracketSize); ctx.lineTo(modalX, modalY + modalH); ctx.lineTo(modalX + bracketSize, modalY + modalH); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(modalX + modalW - bracketSize, modalY + modalH); ctx.lineTo(modalX + modalW, modalY + modalH); ctx.lineTo(modalX + modalW, modalY + modalH - bracketSize); ctx.stroke();

            // Terminal Header Banner
            ctx.fillStyle = 'rgba(0, 255, 255, 0.12)';
            ctx.fillRect(modalX + 2, modalY + 2, modalW - 4, 36);
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(modalX + 2, modalY + 2, modalW - 4, 36);

            ctx.textAlign = 'left';
            ctx.fillStyle = '#00ffff';
            ctx.font = 'bold 12.5px monospace';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 8;
            ctx.fillText(`PRECURSOR SECTOR INTEL TERMINAL // SECTOR ${lvlInfo.name.toUpperCase()}`, modalX + 16, modalY + 23);
            ctx.shadowBlur = 0;

            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 10px monospace';
            ctx.fillText(`SECURITY CLEARANCE: LEVEL ${b} // UNRESTRICTED`, modalX + modalW - 16, modalY + 23);

            // Two-column layout
            const colW = (modalW - 36) / 2;
            const colTopY = modalY + 48;
            const colH = modalH - 85;

            // Column 1: Tactical & Environmental Reconnaissance
            ctx.fillStyle = 'rgba(10, 16, 32, 0.75)';
            ctx.strokeStyle = 'rgba(0, 200, 255, 0.25)';
            ctx.fillRect(modalX + 12, colTopY, colW, colH);
            ctx.strokeRect(modalX + 12, colTopY, colW, colH);

            ctx.textAlign = 'left';
            ctx.fillStyle = '#00ffff';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('📡 TACTICAL RECONNAISSANCE & HAZARDS', modalX + 24, colTopY + 24);

            ctx.fillStyle = '#88aacc';
            ctx.font = 'bold 9.5px monospace';
            ctx.fillText('LANDMARK TOPOLOGY:', modalX + 24, colTopY + 46);
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px monospace';
            ctx.fillText(`[ ${lvlInfo.landmark.toUpperCase()} ]`, modalX + 24, colTopY + 62);

            ctx.fillStyle = '#ff4455';
            ctx.font = 'bold 9.5px monospace';
            ctx.fillText('⚠️ SECTOR HAZARD PROFILE:', modalX + 24, colTopY + 88);
            ctx.fillStyle = '#ffaaaa';
            ctx.font = '9.5px monospace';
            if (typeof wrapText === 'function') {
                wrapText(ctx, lvlInfo.hazard || 'Standard Environmental Hostility', modalX + 24, colTopY + 104, colW - 24, 15);
            } else {
                ctx.fillText(lvlInfo.hazard || 'Standard Environmental Hostility', modalX + 24, colTopY + 104);
            }

            ctx.fillStyle = '#00ff88';
            ctx.font = 'bold 9.5px monospace';
            ctx.fillText('🔍 OPERATIONAL SECTOR INTEL:', modalX + 24, colTopY + 145);
            ctx.fillStyle = '#e0e8f0';
            ctx.font = '9.5px monospace';
            if (typeof wrapText === 'function') {
                wrapText(ctx, lvlInfo.intel || 'Airspace secured by Vanguard fighters.', modalX + 24, colTopY + 162, colW - 24, 15);
            } else {
                ctx.fillText(lvlInfo.intel || 'Airspace secured.', modalX + 24, colTopY + 162);
            }

            // Column 2: Archival Telemetry & Comms Intercept
            const col2X = modalX + 12 + colW + 12;
            ctx.fillStyle = 'rgba(10, 16, 32, 0.75)';
            ctx.strokeStyle = 'rgba(255, 170, 0, 0.25)';
            ctx.fillRect(col2X, colTopY, colW, colH);
            ctx.strokeRect(col2X, colTopY, colW, colH);

            ctx.textAlign = 'left';
            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('📜 CLASSIFIED PRECURSOR ARCHIVES & COMMS', col2X + 14, colTopY + 24);

            ctx.fillStyle = '#ffcc88';
            ctx.font = 'bold 9.5px monospace';
            ctx.fillText('HAVEN-7 TELEMETRY & SURVEY LOG:', col2X + 14, colTopY + 46);
            ctx.fillStyle = '#fff0dd';
            ctx.font = '9px monospace';
            if (typeof wrapText === 'function') {
                wrapText(ctx, lvlInfo.classifiedLog || 'Classified Precursor telemetry log decrypted.', col2X + 14, colTopY + 62, colW - 24, 13);
            } else {
                ctx.fillText(lvlInfo.classifiedLog || '', col2X + 14, colTopY + 62);
            }

            // Bonus Higher-Difficulty / NG+ Lore (GRO-4206)
            if (lvlInfo.bonusClassified || lvlInfo.bonusParadox) {
                const bonusText = lvlInfo.bonusParadox || lvlInfo.bonusClassified;
                const bonusHeader = lvlInfo.bonusParadox ? '🌌 [TIMELINE PARADOX ECHO // NG+]' : '🔒 [EDC NAVY BLACK-OPS // ACE+]';
                const bonusColor = lvlInfo.bonusParadox ? '#cc44ff' : '#ffaa00';
                
                ctx.fillStyle = bonusColor;
                ctx.font = 'bold 9.5px monospace';
                ctx.fillText(bonusHeader, col2X + 14, colTopY + 115);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'italic 8.5px monospace';
                if (typeof wrapText === 'function') {
                    wrapText(ctx, bonusText, col2X + 14, colTopY + 129, colW - 24, 12);
                } else {
                    ctx.fillText(bonusText, col2X + 14, colTopY + 129);
                }
            }

            // In-flight Audio Intercept
            ctx.fillStyle = '#00ffff';
            ctx.font = 'bold 9.5px monospace';
            ctx.fillText('📻 FLIGHT COMMS TRANSCRIPT:', col2X + 14, colTopY + 168);
            const speakerCodes = { 'D':'Darius', 'L':'Lyra', 'N':'Naya', 'T':'Thorne', 'C':'Cross', 'S':'Selene', 'A':'Architect', 'O':'Ophion' };
            const speakerCode = (lvlInfo.commLine && lvlInfo.commLine.s) ? lvlInfo.commLine.s : 'D';
            const speakerName = speakerCodes[speakerCode] || speakerCode;
            const commText = (lvlInfo.commLine && lvlInfo.commLine.l) ? `"${lvlInfo.commLine.l}"` : '"Weapons hot. Stay in formation."';
            ctx.fillStyle = '#88ccff';
            ctx.font = 'italic 9px monospace';
            ctx.fillText(`[CALLSIGN: ${speakerName.toUpperCase()}]`, col2X + 14, colTopY + 184);
            ctx.fillStyle = '#ffffff';
            ctx.font = '9px monospace';
            if (typeof wrapText === 'function') {
                wrapText(ctx, commText, col2X + 14, colTopY + 198, colW - 24, 13);
            } else {
                ctx.fillText(commText, col2X + 14, colTopY + 198);
            }

            // Bottom Footer Prompt
            ctx.textAlign = 'center';
            ctx.fillStyle = '#00ff88';
            ctx.font = 'bold 10.5px monospace';
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 6;
            ctx.fillText('PRESS [L], [ESC], [ENTER] OR CLICK ANYWHERE TO CLOSE ARCHIVE TERMINAL', canvas.width / 2, modalY + modalH - 12);
            ctx.shadowBlur = 0;
        }

        ctx.restore();

    } else if (currentScreen === SCREENS.CREDITS) {
        // Dim the title loop background for legibility
        ctx.fillStyle = 'rgba(5, 5, 12, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        
        // GRO-1009: Ending-specific credits
        const endingCredit = selectedEnding || 'transcendence';
        const creditsList = [
            { type: 'logo' },
            { type: 'spacer', height: 40 },
            { type: 'title', text: 'DARIUS STAR: CYBER COELACANTH' },
            { type: 'subtitle', text: endingCredit === 'sacrifice' ? 'SACRIFICE ENDING' : (endingCredit === 'transcendence' ? 'TRANSCENDENCE ENDING' : 'DOMINION ENDING') },
            { type: 'spacer', height: 50 },
            { type: 'role', text: 'GAME DESIGN & NARRATIVE' },
            { type: 'name', text: 'Michael Gulden' },
            { type: 'spacer', height: 35 },
            { type: 'role', text: 'AI AGENT ENGINEERING' },
            { type: 'name', text: 'Fred (Implementation)' },
            { type: 'name', text: 'AGY (Content & Story)' },
            { type: 'spacer', height: 35 },
            { type: 'role', text: 'ART GENERATION' },
            { type: 'name', text: 'Imagen 3 (Vertex AI)' },
            { type: 'name', text: 'Google Flow' },
            { type: 'spacer', height: 35 },
            { type: 'role', text: 'VIDEO GENERATION' },
            { type: 'name', text: 'Veo 3.1 (Vertex AI)' },
            { type: 'spacer', height: 35 },
            { type: 'role', text: 'MUSIC PRODUCTION' },
            { type: 'name', text: 'Lyria 2/3 (Vertex AI)' },
            { type: 'spacer', height: 35 },
            { type: 'role', text: 'SOUND EFFECTS' },
            { type: 'name', text: 'jsfxr' },
            { type: 'name', text: 'Web Audio Synth Engine' },
            { type: 'spacer', height: 35 },
            { type: 'role', text: 'SPECIAL THANKS' },
            { type: 'name', text: 'Vertex AI Model Garden' },
            { type: 'name', text: 'Google DeepMind Team' },
            { type: 'name', text: 'GrowthWebDev Tester Squad' },
            { type: 'name', text: 'Our retro arcade community' },
            { type: 'spacer', height: 40 },
            { type: 'role', text: 'ENDING CREDITS' },
            { type: 'name', text: endingCredit === 'sacrifice' ? 'Lyra — The light that guides us home' : (endingCredit === 'transcendence' ? 'The Dreamer — Weaver of infinite possibility' : 'Darius Star — Master of the Coelacanth') },
            { type: 'spacer', height: 60 },
            { type: 'thanks', text: endingCredit === 'sacrifice' ? 'IN MEMORY OF LYRA' : (endingCredit === 'transcendence' ? 'BEYOND THE STARS' : 'THE GALAXY IS YOURS') },
            { type: 'spacer', height: 50 },
            { type: 'end', text: endingCredit === 'sacrifice' ? 'SACRIFICE' : (endingCredit === 'transcendence' ? 'TRANSCENDENCE' : 'DOMINION') }
        ];

        let currentY = canvas.height - creditsScrollY;
        ctx.textAlign = 'center';

        for (let i = 0; i < creditsList.length; i++) {
            const item = creditsList[i];
            
            if (currentY > -100 && currentY < canvas.height + 100) {
                if (item.type === 'logo') {
                    if (studioLogoLoaded && studioLogoImg.naturalWidth > 0) {
                        ctx.drawImage(studioLogoImg, canvas.width / 2 - 80, currentY - 50, 160, 160);
                    } else {
                        ctx.fillStyle = '#ff0055';
                        ctx.font = 'bold 16px monospace';
                        ctx.fillText('WHAT AN ADVENTURE GAMES', canvas.width / 2, currentY);
                    }
                } else if (item.type === 'title') {
                    ctx.fillStyle = '#00ffff';
                    ctx.font = 'bold 18px monospace';
                    ctx.shadowColor = '#00ffff';
                    ctx.shadowBlur = 8;
                    ctx.fillText(item.text, canvas.width / 2, currentY);
                    ctx.shadowBlur = 0;
                } else if (item.type === 'subtitle') {
                    ctx.fillStyle = '#8a8a9f';
                    ctx.font = '9px monospace';
                    ctx.fillText(item.text, canvas.width / 2, currentY);
                } else if (item.type === 'role') {
                    ctx.fillStyle = '#ff0055';
                    ctx.font = 'bold 11px monospace';
                    ctx.fillText(item.text, canvas.width / 2, currentY);
                } else if (item.type === 'name') {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '13px monospace';
                    ctx.fillText(item.text, canvas.width / 2, currentY);
                } else if (item.type === 'thanks') {
                    ctx.fillStyle = '#00ff55';
                    ctx.font = 'bold 18px monospace';
                    ctx.shadowColor = '#00ff55';
                    ctx.shadowBlur = 10;
                    ctx.fillText(item.text, canvas.width / 2, currentY);
                    ctx.shadowBlur = 0;
                } else if (item.type === 'end') {
                    ctx.fillStyle = '#ff0055';
                    ctx.font = 'bold 26px monospace';
                    ctx.shadowColor = '#ff0055';
                    ctx.shadowBlur = 12;
                    ctx.fillText(item.text, canvas.width / 2, currentY);
                    ctx.shadowBlur = 0;
                }
            }

            // Increment Y for next item
            if (item.type === 'spacer') {
                currentY += item.height;
            } else if (item.type === 'logo') {
                currentY += 100;
            } else if (item.type === 'title') {
                currentY += 22;
            } else if (item.type === 'subtitle') {
                currentY += 16;
            } else if (item.type === 'role') {
                currentY += 18;
            } else if (item.type === 'name') {
                currentY += 18;
            } else if (item.type === 'thanks') {
                currentY += 30;
            } else if (item.type === 'end') {
                currentY += 40;
            }
        }

        ctx.restore();

        const totalCreditsHeight = currentY - (canvas.height - creditsScrollY);
        if (typeof maxCreditsScroll !== 'undefined') {
            maxCreditsScroll = totalCreditsHeight;
        }

        ctx.fillStyle = '#4a4a5f';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CLICK / SPACE / ESC to SKIP  |  Hold S to SPEED UP', canvas.width / 2, canvas.height - 15);
    } else if (currentScreen === SCREENS.CINEMATIC) {
        ctx.save();
        
        // GRO-1009: Ending choice screen — when multiple endings are eligible
        if (endingEligible.length > 1 && !selectedEnding) {
            // Dark background
            ctx.fillStyle = 'rgba(5, 5, 15, 0.9)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Title
            ctx.fillStyle = '#00ffff';
            ctx.font = 'bold 28px monospace';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 15;
            ctx.fillText('CHOOSE YOUR DESTINY', canvas.width / 2, 100);
            ctx.shadowBlur = 0;
            
            // Ending options
            const endingNames = {
                sacrifice: 'SACRIFICE — Lyra merges with the Coelacanth core, trading her life for victory.',
                transcendence: 'TRANSCENDENCE — Evolve beyond physical form with the Dreamer.',
                dominion: 'DOMINION — Seize the Coelacanth\'s power and rule the galaxy.'
            };
            const endingColors = { sacrifice: '#00ffff', transcendence: '#ff00ff', dominion: '#ff3300' };
            
            let choiceY = 160;
            endingEligible.forEach((endId, idx) => {
                const isHovered = false; // keyboard selection handled via keydown
                ctx.fillStyle = endingColors[endId] || '#ffffff';
                ctx.font = 'bold 20px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`[${idx + 1}] ${endId.toUpperCase()}`, canvas.width / 2, choiceY);
                
                ctx.fillStyle = '#cccccc';
                ctx.font = '12px monospace';
                // Wrap text for the description
                const desc = endingNames[endId] || '';
                const words = desc.split(' ');
                let line = '';
                let lineY = choiceY + 22;
                const maxW = 600;
                words.forEach(w => {
                    const test = line + w + ' ';
                    if (ctx.measureText(test).width > maxW && line !== '') {
                        ctx.fillText(line, canvas.width / 2, lineY);
                        line = w + ' ';
                        lineY += 16;
                    } else {
                        line = test;
                    }
                });
                if (line) ctx.fillText(line, canvas.width / 2, lineY);
                
                choiceY += 70;
            });
            
            // Prompt
            ctx.fillStyle = '#8a8a9f';
            ctx.font = '13px monospace';
            ctx.fillText('PRESS 1, 2, or 3 to SELECT YOUR ENDING', canvas.width / 2, canvas.height - 40);
            
            ctx.restore();
            return; // Skip normal cinematic rendering during choice
        }
        
        // Animate background image panning
        if (endingSunriseLoaded && endingSunriseImg.naturalWidth > 0) {
            const progress = Math.min(cinematicTime / 20, 1.0);
            // Panning viewport (800x450) from the 1024x1024 source image
            // Start at top-left, pan slowly down and right
            const sx = progress * 120;
            const sy = 150 + Math.sin(progress * Math.PI / 2) * 250;
            
            ctx.drawImage(endingSunriseImg,
                sx, sy, 800, 450,
                0, 0, canvas.width, canvas.height
            );
        } else {
            ctx.fillStyle = '#010108';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw a retro screen glare overlay for cinematic effect — GRO-1009: ending tint
        const scanlineGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        const endTint = selectedEnding || 'transcendence';
        if (endTint === 'sacrifice') {
            scanlineGrad.addColorStop(0, 'rgba(0, 255, 255, 0.08)');
            scanlineGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
            scanlineGrad.addColorStop(1, 'rgba(0, 100, 255, 0.08)');
        } else if (endTint === 'transcendence') {
            scanlineGrad.addColorStop(0, 'rgba(200, 0, 255, 0.08)');
            scanlineGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
            scanlineGrad.addColorStop(1, 'rgba(255, 255, 255, 0.06)');
        } else {
            scanlineGrad.addColorStop(0, 'rgba(255, 50, 0, 0.08)');
            scanlineGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
            scanlineGrad.addColorStop(1, 'rgba(255, 150, 0, 0.08)');
        }
        ctx.fillStyle = scanlineGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw player ship flying into the sunrise
        if (cinematicTime > 3) {
            const flightProgress = Math.min((cinematicTime - 3) / 15, 1.0);
            const startX = -50;
            const startY = 320;
            const targetX = 480;
            const targetY = 220;

            const shipX = startX + (targetX - startX) * flightProgress;
            const shipY = startY + (targetY - startY) * flightProgress;
            const size = 32 * (1 - flightProgress * 0.75); // scales down

            // Draw retro flame
            ctx.fillStyle = Math.random() < 0.5 ? '#ff0055' : '#ffff00';
            ctx.beginPath();
            ctx.moveTo(shipX - 10, shipY + size/2);
            ctx.lineTo(shipX, shipY + size/2 - 4);
            ctx.lineTo(shipX, shipY + size/2 + 4);
            ctx.closePath();
            ctx.fill();

            // Draw player ship sprite
            const shipKey = selectedShip === 'scout' ? 'scout_0' : (selectedShip === 'heavy' ? 'heavy_0' : 'interceptor_0');
            const shipSprite = playerSprites[shipKey];
            if (shipSprite && shipSprite.complete && shipSprite.naturalWidth > 0) {
                drawSpriteFrame(ctx, shipSprite, 0, 0, SPRITE_FRAME, SPRITE_FRAME, shipX, shipY, size, size);
            } else {
                ctx.fillStyle = '#00ffff';
                ctx.fillRect(shipX, shipY, size, size);
            }
        }

        // Narrative typography typing text — GRO-1009: ending-specific
        let txt = "";
        const ending = selectedEnding || 'transcendence';
        if (cinematicTime < 3) {
            txt = "CYBER COELACANTH MELTDOWN INITIALIZED...";
        } else if (cinematicTime < 7) {
            txt = "SECTOR 3 DEPTH LAIR SECURED. ESCAPING CAVERN...";
        } else if (cinematicTime < 12) {
            if (ending === 'sacrifice') {
                txt = "Lyra's voice fills the comms one last time. 'It's okay, Daddy. I know what I have to do.' Her signal merges with the Coelacanth core, neutralizing it from within.";
            } else if (ending === 'transcendence') {
                txt = "The Dreamer's frequency harmonizes with the Nyxa. Light peels away from matter. Lyra whispers: 'We're not ending. We're becoming something else.'";
            } else {
                txt = "The Coelacanth's power core flickers — exposed, vulnerable. Darius seizes control. 'This technology belongs to humanity now.' The Archon network goes silent.";
            }
        } else if (cinematicTime < 18) {
            if (ending === 'sacrifice') {
                txt = "One life exchanged for a galaxy. Lyra's sacrifice breaks the Coelacanth's hold forever. The Nyxa emerges alone into the sunrise.";
            } else if (ending === 'transcendence') {
                txt = "Physical form becomes irrelevant. The Nyxa and its crew transcend into the Dreamer's realm — a new species, a new beginning, beyond the reach of war.";
            } else {
                txt = "Absolute power bends to Darius Star. The Coelacanth's network is now under his command. But power has a cost — and the galaxy will soon learn what that cost is.";
            }
        } else {
            if (ending === 'sacrifice') {
                txt = "ENDING: SACRIFICE — 'For her, the stars will always shine.'";
            } else if (ending === 'transcendence') {
                txt = "ENDING: TRANSCENDENCE — 'We dreamed ourselves into gods.'";
            } else {
                txt = "ENDING: DOMINION — 'The galaxy bends to a new master.'";
            }
        }

        let subTime = 0;
        if (cinematicTime < 3) subTime = cinematicTime;
        else if (cinematicTime < 7) subTime = cinematicTime - 3;
        else if (cinematicTime < 18) subTime = cinematicTime - 7;
        else subTime = cinematicTime - 18;

        const typedLength = Math.floor(subTime * 25);
        const visibleText = txt.substring(0, typedLength);

        // Dialog Box
        ctx.fillStyle = 'rgba(5, 5, 15, 0.8)';
        ctx.fillRect(50, canvas.height - 75, canvas.width - 100, 45);
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, canvas.height - 75, canvas.width - 100, 45);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(visibleText, 70, canvas.height - 48);

        ctx.fillStyle = '#4a4a5f';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PRESS ENTER / ESC / CLICK to SKIP CUTSCENE', canvas.width / 2, canvas.height - 12);

        ctx.restore();
    } else if (currentScreen === SCREENS.BRIEFING) {
        // GRO-936: Mission Briefing Screen — delegate to briefing.js
        drawBriefing();
    }

    if (typeof activeDialogue !== 'undefined' && activeDialogue) {
        activeDialogue.draw();
    }
}

// Keys pressed
const keys = {};
window.addEventListener('keydown', e => {
    if (currentScreen === SCREENS.LOADING) {
        if (typeof AssetPreloader !== 'undefined' && AssetPreloader.isComplete) {
            AssetPreloader.handleLaunch();
            e.preventDefault();
        }
        return;
    }

    setBiomeBackgrounds(biomeLevel);
    initAudio();
    loadPlayerSprites();
    loadPortraitSprites();
    loadEnemySprites();
    loadVFXSprites();
    preloadBossAssets();

    // Check active dialogue keys without intercepting flight controls if non-blocking!
    if (typeof activeDialogue !== 'undefined' && activeDialogue && typeof activeDialogue.handleKey === 'function') {
        if (typeof activeDialogue.isBlocking === 'function' && activeDialogue.isBlocking()) {
            activeDialogue.handleKey(e.key);
            e.preventDefault();
            return;
        } else {
            const isCombatKey = ['w','W','a','A','s','S','d','D','ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Shift','e','E','k','K'].includes(e.key);
            if (!isCombatKey) {
                activeDialogue.handleKey(e.key);
            }
        }
    }

    // GRO-1009: Ending choice keyboard handling
    if (currentScreen === SCREENS.CINEMATIC && endingEligible.length > 1 && !selectedEnding) {
        const numKeys = { '1': 0, '2': 1, '3': 2 };
        if (numKeys[e.key] !== undefined && numKeys[e.key] < endingEligible.length) {
            selectedEnding = endingEligible[numKeys[e.key]];
            playSound('menu_click');
            e.preventDefault();
            return;
        }
    }
    
    // Cinematic skip: Space or Escape while a video is playing
    if (e.key === ' ' || e.key === 'Space' || e.key === 'Escape') {
        if (bossIntroPlaying) {
            skipBossIntro();
            e.preventDefault();
            return;
        }
        if (victoryVideoPlaying) {
            skipVictoryCinematic();
            e.preventDefault();
            return;
        }
    }
    
    if (currentScreen !== SCREENS.PLAYING) {
        startMenuMusic();
    }

    if (currentScreen === SCREENS.PLAYING) {
        // Pause menu input (overrides all other input when paused)
        if (paused) {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                playSound('menu_select');
                if (pauseSubScreen === 'menu') {
                    pauseMenuIndex = (pauseMenuIndex - 1 + PAUSE_OPTIONS.length) % PAUSE_OPTIONS.length;
                } else {
                    selectedSettingsIndex = (selectedSettingsIndex - 1 + SETTINGS_OPTIONS.length) % SETTINGS_OPTIONS.length;
                }
                e.preventDefault(); return;
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                playSound('menu_select');
                if (pauseSubScreen === 'menu') {
                    pauseMenuIndex = (pauseMenuIndex + 1) % PAUSE_OPTIONS.length;
                } else {
                    selectedSettingsIndex = (selectedSettingsIndex + 1) % SETTINGS_OPTIONS.length;
                }
                e.preventDefault(); return;
            } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                if (pauseSubScreen === 'settings') {
                    playSound('menu_select');
                    adjustSetting(selectedSettingsIndex, -1);
                }
                e.preventDefault(); return;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                if (pauseSubScreen === 'settings') {
                    playSound('menu_select');
                    adjustSetting(selectedSettingsIndex, 1);
                }
                e.preventDefault(); return;
            } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'Space') {
                playSound('menu_click');
                handlePauseMenuSelect();
                e.preventDefault(); return;
            } else if (e.key === 'p' || e.key === 'P') {
                playSound('menu_click');
                if (pauseSubScreen === 'settings') {
                    pauseSubScreen = 'menu';
                } else {
                    paused = false;
                    pauseSubScreen = 'menu';
                }
                e.preventDefault(); return;
            } else if (e.key === 'Escape') {
                playSound('menu_click');
                if (pauseSubScreen === 'settings') {
                    pauseSubScreen = 'menu';
                } else {
                    paused = false;
                    pauseSubScreen = 'menu';
                }
                e.preventDefault(); return;
            }
            return; // Block all other input when paused
        }
        
        if (e.key === 'p' || e.key === 'P') {
            playSound('menu_click');
            paused = !paused;
            if (paused) { pauseMenuIndex = 0; pauseSubScreen = 'menu'; }
        }
        // F3: Toggle system status panel + debug enemy name labels (GRO-1068, GRO-1156)
        if (e.key === 'F3') {
            window.DEBUG_LABELS = !window.DEBUG_LABELS;
            toggleStatusPanel();
            e.preventDefault();
        }
        keys[e.key] = true;
        if (e.code) keys[e.code] = true;
        if (['Space', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'e', 'E'].indexOf(e.key) > -1) {
            e.preventDefault();
        }
        if (e.key === ' ' && (gameOver || gameWon)) {
            handleDeathOrVictoryRestart();
        }
        if ((e.key === 'r' || e.key === 'R' || e.key === 'Enter') && gameOver) {
            handleDeathOrVictoryRestart();
        }
        if ((e.key === 's' || e.key === 'S') && gameOver) {
            const activeSlot = parseInt(localStorage.getItem('dariusStar_activeSlot') || '0');
            if (window.CampaignSave) {
                const us = window.DS_UpgradeSystem;
                const saveData = {
                    biome: window.LevelManager ? LevelManager.biome : 1,
                    level: window.LevelManager ? LevelManager.level : 1,
                    score: typeof score !== 'undefined' ? score : 0,
                    scrap: us && us.state ? us.state.scrap : (window.runScrap || 0),
                    upgrades: us && us.state ? us.state.upgrades : {},
                    timestamp: Date.now()
                };
                CampaignSave.save(activeSlot, saveData);
                playSound('powerup');
            }
        }
        if ((e.key === 'n' || e.key === 'N') && gameWon) {
            const ngData = localStorage.getItem('darius_star_ngplus_eligible');
            if (ngData) {
                try {
                    const parsed = JSON.parse(ngData);
                    const shipData = parsed[selectedShip];
                    if (shipData) {
                        let activeSaveSlot = parseInt(localStorage.getItem('dariusStar_activeSlot') || '0');
                        let currentSave = (window.CampaignSave ? CampaignSave.load(activeSaveSlot) : null) || {};
                        startNGPlus({
                            ngLevel: shipData.ngLevel || 0,
                            ship: selectedShip,
                            upgrades: currentSave.upgrades || {}
                        });
                    }
                } catch(ex) {}
            }
        }
        if ((e.key === 'Escape' || e.key === 'q' || e.key === 'Q') && (gameOver || gameWon)) {
            playSound('menu_click');
            transitionToScreen(SCREENS.MENU);
        }
    } else {
        if (targetScreen) return;
        
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            playSound('menu_select');
            if (currentScreen === SCREENS.MENU) {
                selectedMenuIndex = (selectedMenuIndex - 1 + menuOptions.length) % menuOptions.length;
            } else if (currentScreen === SCREENS.SETTINGS) {
                selectedSettingsIndex = (selectedSettingsIndex - 1 + SETTINGS_OPTIONS.length) % SETTINGS_OPTIONS.length;
            } else if (currentScreen === SCREENS.SHIP_SELECT) {
                selectedShipIndex = (selectedShipIndex - 1 + SHIP_OPTIONS.length) % SHIP_OPTIONS.length;
            } else if (currentScreen === SCREENS.LEADERBOARD) {
                if (leaderboardScrollOffset > 0) leaderboardScrollOffset--;
            } else if (currentScreen === SCREENS.LEVEL_CLEAR) {
                if (window._showIntelModal) {
                    window._showIntelModal = false;
                } else {
                    advanceToNextLevelFromDebriefing();
                }
            } else if (currentScreen === SCREENS.LOAD_GAME) {
                window._loadSelectedSlot = Math.max(0, (window._loadSelectedSlot || 0) - 1);
            } else if (currentScreen === SCREENS.UPGRADE_SHOP) {
                const labels = ['weapons', 'shields', 'rockets', 'magnetism', 'engines', 'specials', 'addons', 'cosmetics'];
                const cur = window._upgradeSelected || 0;
                if (cur % 4 === 0) window._upgradeSelected = cur + 3;
                else window._upgradeSelected = cur - 1;
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
            playSound('menu_select');
            if (currentScreen === SCREENS.MENU) {
                selectedMenuIndex = (selectedMenuIndex + 1) % menuOptions.length;
            } else if (currentScreen === SCREENS.SETTINGS) {
                selectedSettingsIndex = (selectedSettingsIndex + 1) % SETTINGS_OPTIONS.length;
            } else if (currentScreen === SCREENS.SHIP_SELECT) {
                selectedShipIndex = (selectedShipIndex + 1) % SHIP_OPTIONS.length;
            } else if (currentScreen === SCREENS.LEADERBOARD) {
                const scores = window.Leaderboard ? Leaderboard.getTop(leaderboardFilter, 50) : [];
                if (leaderboardScrollOffset + 10 < scores.length) leaderboardScrollOffset++;
            } else if (currentScreen === SCREENS.LEVEL_CLEAR) {
                if (window._showIntelModal) {
                    window._showIntelModal = false;
                } else {
                    advanceToNextLevelFromDebriefing();
                }
            } else if (currentScreen === SCREENS.LOAD_GAME) {
                const saves = window._loadSaves || [];
                window._loadSelectedSlot = Math.min(2, (window._loadSelectedSlot || 0) + 1);
            } else if (currentScreen === SCREENS.UPGRADE_SHOP) {
                const labels = ['weapons', 'shields', 'rockets', 'magnetism', 'engines', 'specials', 'addons', 'cosmetics'];
                const cur = window._upgradeSelected || 0;
                if (cur % 4 === 3) window._upgradeSelected = cur - 3;
                else window._upgradeSelected = cur + 1;
            }
            e.preventDefault();
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            if (currentScreen === SCREENS.SETTINGS) {
                playSound('menu_select');
                adjustSetting(selectedSettingsIndex, -1);
            } else if (currentScreen === SCREENS.BRIEFING) {
                // GRO-936: Choice navigation in briefing
                handleBriefingKey(e.key);
            } else if (currentScreen === SCREENS.LEADERBOARD) {
                playSound('menu_select');
                const categories = ['speedrun', 'scrapLord', 'survivor'];
                const idx = categories.indexOf(leaderboardFilter);
                leaderboardFilter = categories[(idx - 1 + categories.length) % categories.length];
                leaderboardScrollOffset = 0;
            } else if (currentScreen === SCREENS.UPGRADE_SHOP) {
                playSound('menu_select');
                const cur = window._upgradeSelected || 0;
                if (cur >= 4) window._upgradeSelected = cur - 4;
                else window._upgradeSelected = cur + 4;
            }
            e.preventDefault();
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            if (currentScreen === SCREENS.SETTINGS) {
                playSound('menu_select');
                adjustSetting(selectedSettingsIndex, 1);
            } else if (currentScreen === SCREENS.BRIEFING) {
                // GRO-936: Choice navigation in briefing
                handleBriefingKey(e.key);
            } else if (currentScreen === SCREENS.LEADERBOARD) {
                playSound('menu_select');
                const categories = ['speedrun', 'scrapLord', 'survivor'];
                const idx = categories.indexOf(leaderboardFilter);
                leaderboardFilter = categories[(idx + 1) % categories.length];
                leaderboardScrollOffset = 0;
            } else if (currentScreen === SCREENS.UPGRADE_SHOP) {
                playSound('menu_select');
                const cur = window._upgradeSelected || 0;
                if (cur < 4) window._upgradeSelected = cur + 4;
                else window._upgradeSelected = cur - 4;
            }
            e.preventDefault();
        } else if (e.key === 'Enter' || e.key === ' ') {
            playSound('menu_click');
            if (currentScreen === SCREENS.CINEMATIC) {
                transitionToScreen(SCREENS.CREDITS);
            } else if (currentScreen === SCREENS.BRIEFING) {
                // GRO-936: Advance/skip briefing on Enter/Space
                handleBriefingKey(e.key);
            } else if (currentScreen === SCREENS.LEVEL_CLEAR) {
                if (window._showIntelModal) {
                    window._showIntelModal = false;
                } else {
                    advanceToNextLevelFromDebriefing();
                }
            } else if (currentScreen === SCREENS.LOAD_GAME) {
                confirmLoadGame();
            } else if (currentScreen === SCREENS.UPGRADE_SHOP) {
                const labels = ['weapons', 'shields', 'rockets', 'magnetism', 'engines', 'specials', 'addons', 'cosmetics'];
                const i = window._upgradeSelected || 0;
                const us = window.DS_UpgradeSystem;
                if (us) {
                    const cost = us.getUpgradeCost(labels[i]);
                    if (us.state && us.state.scrap >= cost) {
                        us.buyUpgrade(labels[i]);
                        playSound('menu_click');
                        
                        // Sync upgrades back to the active campaign save slot
                        if (window.CampaignSave) {
                            const activeSlot = parseInt(localStorage.getItem('dariusStar_activeSlot') || '0');
                            const saveData = CampaignSave.load(activeSlot);
                            if (saveData) {
                                saveData.upgrades = { ...us.state.upgrades };
                                saveData.scrap = us.state.scrap;
                                CampaignSave.save(activeSlot, saveData);
                            }
                        }
                    }
                }
            } else {
                handleMenuConfirm();
            }
            e.preventDefault();
        } else if (e.key === 'Escape') {
            playSound('menu_click');
            if (currentScreen === SCREENS.CINEMATIC) {
                transitionToScreen(SCREENS.CREDITS);
            } else if (currentScreen === SCREENS.BRIEFING) {
                // GRO-936: Skip briefing on Escape
                handleBriefingKey(e.key);
            } else if (currentScreen === SCREENS.LEVEL_CLEAR) {
                if (window._showIntelModal) {
                    window._showIntelModal = false;
                } else {
                    advanceToNextLevelFromDebriefing();
                }
            } else if (currentScreen === SCREENS.LOAD_GAME) {
                transitionToScreen(SCREENS.MENU);
            } else if (currentScreen === SCREENS.UPGRADE_SHOP) {
                transitionToScreen(SCREENS.MENU);
            } else if (currentScreen === SCREENS.SHIP_SELECT || currentScreen === SCREENS.SETTINGS || currentScreen === SCREENS.CREDITS || currentScreen === SCREENS.LEADERBOARD) {
                if (currentScreen === SCREENS.LEADERBOARD) {
                    leaderboardFilter = 'speedrun';
                    leaderboardScrollOffset = 0;
                }
                transitionToScreen(SCREENS.MENU);
            }
            e.preventDefault();
        } else if (e.key === 'Delete' && currentScreen === SCREENS.LOAD_GAME) {
            const slot = window._loadSelectedSlot || 0;
            if (confirm('Delete save in Slot ' + (slot+1) + '?')) {
                deleteSaveSlot(slot);
            }
            e.preventDefault();
        } else if ((e.key === 'l' || e.key === 'L') && currentScreen === SCREENS.LEVEL_CLEAR) {
            window._showIntelModal = !window._showIntelModal;
            if (window._showIntelModal) {
                playSound('radio_squelch_in');
                const sum = window._levelClearSummary || {};
                if (typeof window !== 'undefined' && window.LevelManager && window.LevelManager.recordIntelViewed) {
                    window.LevelManager.recordIntelViewed(sum.biome, sum.level);
                }
                if (typeof VoicePipeline !== 'undefined') {
                    const lvlInfo = (typeof LevelManager !== 'undefined' && LevelManager.getSectorIntel) 
                        ? LevelManager.getSectorIntel(sum.biome || 1, sum.level || 1) 
                        : null;
                    if (lvlInfo && lvlInfo.classifiedLog) {
                        const lineId = `log_b${sum.biome || 1}_l${sum.level || 1}`;
                        VoicePipeline.speak(lvlInfo.classifiedLog, 'Selene', { lineId: lineId });
                    }
                }
            } else {
                playSound('radio_squelch_out');
                if (typeof VoicePipeline !== 'undefined') {
                    VoicePipeline.stop();
                }
            }
            e.preventDefault();
        } else if ((e.key === 'u' || e.key === 'U') && currentScreen === SCREENS.LEVEL_CLEAR) {
            window._upgradeReturnScreen = SCREENS.LEVEL_CLEAR;
            transitionToScreen(SCREENS.UPGRADE_SHOP);
            playSound('menu_click');
            e.preventDefault();
        } else if ((e.key === 'u' || e.key === 'U') && (gameOver || gameWon || currentScreen === SCREENS.MENU)) {
            transitionToScreen(SCREENS.UPGRADE_SHOP);
        } else if ((e.key === 'c' || e.key === 'C') && currentScreen === SCREENS.LEADERBOARD) {
            if (confirm('Clear all leaderboard entries? This cannot be undone.')) {
                if (window.Leaderboard) localStorage.removeItem(Leaderboard.KEY);
                leaderboardScrollOffset = 0;
            }
        }
    }
});
// --- Touch Controls ---
const touchKeys = { 'w': false, 'a': false, 's': false, 'd': false, ' ': false };

function setupTouchButton(elId, key) {
    const el = document.getElementById(elId);
    if (!el) return;
    
    el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        initAudio();
        setBiomeBackgrounds(biomeLevel);
        loadPlayerSprites();
        loadPortraitSprites();
        loadEnemySprites();
        loadVFXSprites();
        preloadBossAssets();
        keys[key] = true;
        el.classList.add('pressed');
    });
    el.addEventListener('pointerup', (e) => {
        e.preventDefault();
        keys[key] = false;
        el.classList.remove('pressed');
    });
    el.addEventListener('pointerleave', (e) => {
        keys[key] = false;
        el.classList.remove('pressed');
    });
    // Prevent touch scrolling on controls
    el.addEventListener('touchstart', (e) => e.preventDefault());
    el.addEventListener('touchmove', (e) => e.preventDefault());
}

// Set up each touch button
setupTouchButton('dpad-up', 'w');
setupTouchButton('dpad-down', 's');
setupTouchButton('dpad-left', 'a');
setupTouchButton('dpad-right', 'd');
setupTouchButton('fire-btn', ' ');

window.addEventListener('keyup', e => {
    keys[e.key] = false;
    if (e.code) keys[e.code] = false;
});

window.STATUS_EXPANDED = false;

// toggleStatusPanel() and DOMContentLoaded handler extracted to js/ui/hud.js (GRO-1062)

// Touch/click handler for SCREENS (LOAD_GAME, UPGRADE_SHOP)
canvas.addEventListener('click', function(e) {
    if (typeof currentScreen === 'undefined') return;
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var cx = (e.clientX - rect.left) * scaleX;
    var cy = (e.clientY - rect.top) * scaleY;

    if (currentScreen === SCREENS.LEVEL_CLEAR) {
        if (window._showIntelModal) {
            window._showIntelModal = false;
            playSound('radio_squelch_out');
            if (typeof VoicePipeline !== 'undefined') {
                VoicePipeline.stop();
            }
            return;
        }
        var lcRegions = window._levelClearHitRegions || [];
        for (var k = 0; k < lcRegions.length; k++) {
            var reg = lcRegions[k];
            if (cx >= reg.x && cx <= reg.x + reg.w && cy >= reg.y && cy <= reg.y + reg.h) {
                if (reg.key === 'next') {
                    advanceToNextLevelFromDebriefing();
                } else if (reg.key === 'upgrade') {
                    window._upgradeReturnScreen = SCREENS.LEVEL_CLEAR;
                    transitionToScreen(SCREENS.UPGRADE_SHOP);
                    playSound('menu_click');
                } else if (reg.key === 'intel') {
                    window._showIntelModal = true;
                    playSound('radio_squelch_in');
                    const sum = window._levelClearSummary || {};
                    if (typeof window !== 'undefined' && window.LevelManager && window.LevelManager.recordIntelViewed) {
                        window.LevelManager.recordIntelViewed(sum.biome, sum.level);
                    }
                    if (typeof VoicePipeline !== 'undefined') {
                        const lvlInfo = (typeof LevelManager !== 'undefined' && LevelManager.getSectorIntel) 
                            ? LevelManager.getSectorIntel(sum.biome || 1, sum.level || 1) 
                            : null;
                        if (lvlInfo && lvlInfo.classifiedLog) {
                            const lineId = `log_b${sum.biome || 1}_l${sum.level || 1}`;
                            VoicePipeline.speak(lvlInfo.classifiedLog, 'Selene', { lineId: lineId });
                        }
                    }
                } else if (reg.key === 'menu') {
                    transitionToScreen(SCREENS.MENU);
                    playSound('menu_click');
                }
                return;
            }
        }
        return;
    }

    if (currentScreen === SCREENS.UPGRADE_SHOP) {
        var uRegions = window._upgradeHitRegions || [];
        var us = window.DS_UpgradeSystem;
        for (var k = 0; k < uRegions.length; k++) {
            var reg = uRegions[k];
            if (cx >= reg.x && cx <= reg.x + reg.w && cy >= reg.y && cy <= reg.y + reg.h) {
                window._upgradeSelected = reg.index;
                if (us) {
                    var cost = us.getUpgradeCost(reg.label);
                    if (us.state && us.state.scrap >= cost) {
                        us.buyUpgrade(reg.label);
                        playSound('menu_click');
                        if (window.CampaignSave) {
                            var activeSlot = parseInt(localStorage.getItem('dariusStar_activeSlot') || '0');
                            var saveData = CampaignSave.load(activeSlot);
                            if (saveData) {
                                saveData.upgrades = { ...us.state.upgrades };
                                saveData.scrap = us.state.scrap;
                                CampaignSave.save(activeSlot, saveData);
                            }
                        }
                    } else {
                        playSound('menu_select');
                    }
                }
                return;
            }
        }
        return;
    }

    if (currentScreen === SCREENS.LOAD_GAME) {
        var regions = window._loadHitRegions || [];
        for (var i = 0; i < regions.length; i++) {
            var r = regions[i];
            // Check slot selection area
            if (cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h) {
                window._loadSelectedSlot = i;
                // Double-tap to load
                if (window._lastSlotTap === i && Date.now() - (window._lastSlotTapTime || 0) < 400) {
                    confirmLoadGame();
                    window._lastSlotTap = -1;
                } else {
                    window._lastSlotTap = i;
                    window._lastSlotTapTime = Date.now();
                }
                return;
            }
            // Check LOAD button
            if (r.btnLoad && cx >= r.btnLoad.x && cx <= r.btnLoad.x + r.btnLoad.w && cy >= r.btnLoad.y && cy <= r.btnLoad.y + r.btnLoad.h) {
                window._loadSelectedSlot = i;
                confirmLoadGame();
                return;
            }
            // Check DELETE button
            if (r.btnDelete && cx >= r.btnDelete.x && cx <= r.btnDelete.x + r.btnDelete.w && cy >= r.btnDelete.y && cy <= r.btnDelete.y + r.btnDelete.h) {
                if (confirm('Delete save in Slot ' + (i+1) + '?')) {
                    CampaignSave.delete(i);
                    loadGameScreen();
                }
                return;
            }
        }
    }
});
