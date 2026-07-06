// --- Menu & Settings State Variables ---
const SCREENS = {
    MENU: 'menu',
    SHIP_SELECT: 'ship_select',
    SETTINGS: 'settings',
    CREDITS: 'credits',
    LEADERBOARD: 'leaderboard',
    PLAYING: 'playing',
    CINEMATIC: 'cinematic',
    BRIEFING: 'briefing',       // GRO-936: Pre-mission story briefing screen
    LOAD_GAME: 'load_game',
    UPGRADE_SHOP: 'upgrade_shop'  // GRO-1056: In-canvas upgrade flow
};
let currentScreen = SCREENS.MENU;
let selectedMenuIndex = 0;
let hoveredMenuIndex = -1; // distinct from selected for hover state
let prevHoveredMenuIndex = -1;   // GRO-1294: track previous for hover-sound debounce
const menuOptions = ['CONTINUE', 'START GAME', 'UPGRADE SHOP', 'SHIP SELECT', 'SETTINGS', 'LEADERBOARD', 'CREDITS'];
let shipSelectSource = 'menu'; // 'menu' or 'start'

let pauseMenuIndex = 0;
const PAUSE_OPTIONS = ['RESUME', 'SETTINGS', 'QUIT TO MENU'];
let pauseSubScreen = 'menu'; // 'menu' or 'settings'

let selectedSettingsIndex = 0;
let hoveredSettingsIndex = -1;
let prevHoveredSettingsIndex = -1; // GRO-1294
const SETTINGS_OPTIONS = ['MASTER VOLUME', 'SFX VOLUME', 'MUSIC VOLUME', 'DIFFICULTY', 'AUDIO TUNNELS', 'BANTER SYSTEM', 'STREAMER MODE', 'SUBTITLES', 'BACK'];

let selectedShipIndex = 0; // 0=scout, 1=interceptor, 2=heavy
let hoveredShipIndex = -1;
let prevHoveredShipIndex = -1;   // GRO-1294
let hoveredUpgradeIndex = -1;     // GRO-1294: upgrade shop hover
let prevHoveredUpgradeIndex = -1; // GRO-1294
const SHIP_OPTIONS = ['striker', 'phantom', 'bastion', 'tempest', 'specter', 'warden'];
let selectedShip = 'striker';

// Unified Leaderboard state
let leaderboardFilter = 'speedrun'; // 'speedrun' | 'scrapLord' | 'survivor'
let leaderboardScrollOffset = 0;
let newHighScoreCelebrated = false;
let highScoreBannerTimer = 0;
let highScoreParticles = [];

// Cinematic & Credits Scroll variables
let cinematicTime = 0;
let creditsScrollY = 0;
let creditsHoldTimer = 0;
let maxCreditsScroll = 1050;
let bossDefeated = false;
let bossIntroPlaying = false;
let victoryVideoPlaying = false;

// Video elements for cinematics
const bossIntroVideo = document.getElementById('boss-intro-video');
const victoryVideo = document.getElementById('victory-video');
const skipHint = document.getElementById('skip-cinematic-hint');

// Click/touch to skip cinematic videos
bossIntroVideo.addEventListener('click', () => { if (bossIntroPlaying) skipBossIntro(); });
victoryVideo.addEventListener('click', () => { if (victoryVideoPlaying) skipVictoryCinematic(); });

// Ending cinematic assets
const endingSunriseImg = new Image();
let endingSunriseLoaded = false;
endingSunriseImg.onload = () => { endingSunriseLoaded = true; };
endingSunriseImg.src = 'assets/cinematics/ending_sunrise.png';

const studioLogoImg = new Image();
let studioLogoLoaded = false;
studioLogoImg.onload = () => { studioLogoLoaded = true; };
studioLogoImg.src = 'assets/sprites/studio_logo.png';

let masterVolume = 0.8;
let sfxVolume = 0.8;
let musicVolume = 0.6;
let difficulty = 'normal'; // 'easy', 'normal', 'hard', 'insane'

// Content channel toggles — "Go Big or Go Home" immersion settings
let banterEnabled = true;       // Banter System — character dialogue during gameplay
let audioTunnelsEnabled = true; // Audio Tunnels — between-stage immersive audio
let streamerMode = false;       // Streamer Mode — disables all voice content
let subtitlesEnabled = true;    // GRO-940: Accessibility subtitles — high-visibility voice captions

let screenFadeAlpha = 0;
let targetScreen = null;
let transitionTimer = 0;
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
    bossIntroVideo.muted = false; // audio allowed after user interaction (START GAME click)
    bossIntroVideo.classList.add('active');
    skipHint.classList.add('active');
    bossIntroVideo.currentTime = 0;
    bossIntroVideo.play().catch(() => {
        // Autoplay blocked — try again on next user interaction
        bossIntroPlaying = false;
        bossIntroVideo.classList.remove('active');
        skipHint.classList.remove('active');
        spawnBossNow();
        return;
    });
    bossIntroVideo.onended = () => {
        bossIntroVideo.classList.remove('active');
        skipHint.classList.remove('active');
        bossIntroPlaying = false;
        spawnBossNow();
    };
}

function skipBossIntro() {
    if (!bossIntroPlaying) return;
    bossIntroVideo.pause();
    bossIntroVideo.classList.remove('active');
    skipHint.classList.remove('active');
    bossIntroPlaying = false;
    spawnBossNow();
}

function spawnBossNow() {
    bossSpawned = true;
    sirenTimer = 0; // skip siren, boss appears immediately after cinematic
    boss = new Boss();
}

function playVictoryCinematic() {
    if (victoryVideoPlaying) return;
    victoryVideoPlaying = true;
    victoryVideo.muted = false; // audio allowed after user interaction (START GAME click)
    victoryVideo.classList.add('active');
    skipHint.classList.add('active');
    victoryVideo.currentTime = 0;
    victoryVideo.play().catch(() => {
        victoryVideoPlaying = false;
        victoryVideo.classList.remove('active');
        skipHint.classList.remove('active');
        transitionToScreen(SCREENS.CINEMATIC);
        return;
    });
    victoryVideo.onended = () => {
        victoryVideo.classList.remove('active');
        skipHint.classList.remove('active');
        victoryVideoPlaying = false;
        transitionToScreen(SCREENS.CINEMATIC);
    };
}

function skipVictoryCinematic() {
    if (!victoryVideoPlaying) return;
    victoryVideo.pause();
    victoryVideo.classList.remove('active');
    skipHint.classList.remove('active');
    victoryVideoPlaying = false;
    transitionToScreen(SCREENS.CINEMATIC);
}

function advanceToNextBiome() {
    // Called after boss defeat in biomes 1-9
    // Advances the game to the next biome without resetting player progress
    
    bossesDefeated++;
    const oldBiome = biomeLevel;
    
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
        const lw = 420;
        const lh = 140;
        const lx = canvas.width / 2 - lw / 2;
        const ly = 30 + Math.sin(gameTime * 2.5) * 6; // floating effect
        
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 12 + Math.sin(gameTime * 5) * 6;
        ctx.drawImage(titleLogoImg, lx, ly, lw, lh);
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
    drawTitleBackground();
    
    if (currentScreen === SCREENS.MENU) {
        drawMainMenu(ctx);
    } else if (currentScreen === SCREENS.SHIP_SELECT) {
        drawShipSelect(ctx);
    } else if (currentScreen === SCREENS.SETTINGS) {
        drawSettings(ctx);
    } else if (currentScreen === SCREENS.LEADERBOARD) {
        ctx.fillStyle = 'rgba(5, 5, 12, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.textAlign = 'center';
        
        // Header
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 24px monospace';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 12;
        ctx.fillText('🏆 CYBER LEADERBOARDS', canvas.width / 2, 55);
        ctx.shadowBlur = 0;
        
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
            ctx.fillStyle = '#00ffff';
            ctx.font = 'bold 14px monospace';
            ctx.fillText(`CATEGORY RECORD: ${topValStr} — ${(categoryTop.ship || 'unknown').toUpperCase()} — ${(categoryTop.difficulty || 'normal').toUpperCase()}`, canvas.width / 2, 90);
        } else {
            ctx.fillStyle = '#8a8a9f';
            ctx.font = '14px monospace';
            ctx.fillText('No entries yet in this category. Go fight!', canvas.width / 2, 90);
        }
        
        // Category bar
        ctx.font = 'bold 11px monospace';
        const categories = ['speedrun', 'scrapLord', 'survivor'];
        const categoryLabels = ['⏱ SPEEDRUN', '⚙ SCRAP LORD', '🛡 SURVIVOR'];
        const filterStartX = 200;
        const filterY = 115;
        const gap = 160;
        
        for (let fi = 0; fi < categories.length; fi++) {
            const fx = filterStartX + fi * gap;
            const isActive = leaderboardFilter === categories[fi];
            ctx.fillStyle = isActive ? '#ffaa00' : '#4a4a5f';
            ctx.fillText(categoryLabels[fi], fx, filterY);
            if (isActive) {
                ctx.fillRect(fx - 40, filterY + 4, 80, 2);
            }
        }
        
        ctx.fillStyle = '#3a3a5f';
        ctx.fillRect(80, 135, 640, 2);
        
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
        ctx.fillStyle = 'rgba(5, 5, 12, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.textAlign = 'center';

        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 22px monospace';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.fillText('💾 LOAD GAME', canvas.width / 2, 48);
        ctx.shadowBlur = 0;

        const saves = window._loadSaves || [];
        const selected = window._loadSelectedSlot || 0;

        // GRO-1160: Responsive sizing for mobile touch targets (min 44px on 375px viewport)
        const slotW = Math.min(canvas.width - 60, 640);
        const slotH = 76;  // Taller for touch targets
        const slotX = (canvas.width - slotW) / 2;
        const slotStartY = 110;
        const slotSpacing = slotH + 10;
        const btnW = 80;
        const btnH = 32;

        // Store hit regions for touch/mouse handling
        window._loadHitRegions = [];

        for (let i = 0; i < 3; i++) {
            const y = slotStartY + i * slotSpacing;
            const isSelected = i === selected;
            const save = saves[i];

            // Store hit region for this slot
            window._loadHitRegions[i] = { x: slotX, y: y, w: slotW, h: slotH,
                btnLoad: null, btnDelete: null, isSelected: isSelected };

            // Slot background
            ctx.fillStyle = isSelected ? 'rgba(0,255,255,0.12)' : 'rgba(255,255,255,0.04)';
            if (isSelected) {
                ctx.fillStyle = 'rgba(0,255,255,0.18)';
            }
            ctx.fillRect(slotX, y, slotW, slotH);
            if (isSelected) {
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(slotX, y, slotW, slotH);
            }

            ctx.textAlign = 'left';
            if (save) {
                const s = CampaignSave.summarize(i);
                ctx.fillStyle = isSelected ? '#00ffff' : '#ffffff';
                ctx.font = 'bold 14px monospace';
                const ngText = (save.ngLevel && save.ngLevel > 0) ? ` [NG+${save.ngLevel}]` : '';
                ctx.fillText(`SLOT ${i+1}: Biome ${s.biome} — Wave ${s.wave} — ${s.ship.toUpperCase()}${ngText}`, slotX + 16, y + 18);

                let ngMeta = '';
                if (save.ngLevel && save.ngLevel > 0 && window.NGPlus) {
                    const ngSummary = NGPlus.summarize(save);
                    if (ngSummary) {
                        ngMeta = `  |  NG+${ngSummary.level} (Scrap x${ngSummary.scrapMult})`;
                    }
                }

                ctx.fillStyle = '#aaa';
                ctx.font = '11px monospace';
                ctx.fillText(`Scrap: ${s.scrap}  |  Score: ${s.score.toLocaleString()}  |  ${s.date} ${s.time}  |  ${s.playTime}  |  ${s.deaths} deaths${ngMeta}`, slotX + 16, y + 38);
                ctx.fillStyle = '#888';
                ctx.fillText(`${s.shipsUnlocked} ships unlocked  |  Difficulty: ${s.difficulty}`, slotX + 16, y + 54);

                // GRO-1160: Load/Delete buttons for selected slot
                if (isSelected) {
                    const btnLoadX = slotX + slotW - btnW * 2 - 20;
                    const btnDeleteX = slotX + slotW - btnW - 10;
                    const btnY = y + (slotH - btnH) / 2;

                    // Load button
                    ctx.fillStyle = '#00aa44';
                    ctx.fillRect(btnLoadX, btnY, btnW, btnH);
                    ctx.strokeStyle = '#00ff66';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(btnLoadX, btnY, btnW, btnH);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 12px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('LOAD', btnLoadX + btnW / 2, btnY + 21);

                    // Delete button
                    ctx.fillStyle = '#aa0033';
                    ctx.fillRect(btnDeleteX, btnY, btnW, btnH);
                    ctx.strokeStyle = '#ff3355';
                    ctx.strokeRect(btnDeleteX, btnY, btnW, btnH);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText('DELETE', btnDeleteX + btnW / 2, btnY + 21);

                    // Store button hit regions
                    window._loadHitRegions[i].btnLoad = { x: btnLoadX, y: btnY, w: btnW, h: btnH };
                    window._loadHitRegions[i].btnDelete = { x: btnDeleteX, y: btnY, w: btnW, h: btnH };
                }
            } else {
                ctx.fillStyle = isSelected ? '#00ffff' : '#555';
                ctx.font = 'bold 14px monospace';
                ctx.fillText(`SLOT ${i+1}: EMPTY`, slotX + 16, y + 18);
                ctx.fillStyle = '#444';
                ctx.font = '11px monospace';
                ctx.fillText('Start a new game to create a save.', slotX + 16, y + 38);
            }
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = '#8a8a9f';
        ctx.font = '11px monospace';
        ctx.fillText('ENTER to LOAD  |  DEL to DELETE  |  ESC to BACK  |  TAP slot to select', canvas.width / 2, slotStartY + 3 * slotSpacing + 6);
        ctx.fillText('Long-press slot to delete', canvas.width / 2, slotStartY + 3 * slotSpacing + 22);

        ctx.restore();
    } else if (currentScreen === SCREENS.UPGRADE_SHOP) {
        // GRO-1056: In-canvas upgrade flow
        ctx.fillStyle = 'rgba(5, 5, 12, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        const us = window.DS_UpgradeSystem;
        const upgradeLabels = ['weapons', 'shields', 'engines', 'specials', 'cosmetics'];
        const upgradeNames = ['Weapon Systems', 'Shield Generators', 'Engines & Thrusters', 'Cyber Overload', 'Ship Customization'];
        const maxRanks = upgradeLabels.map(label => us ? us.getMaxRank(label) : 10);
        const selected = window._upgradeSelected || 0;
        const startY = 80, spacing = 75;

        // Title
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 22px monospace';
        ctx.fillText('UPGRADE TERMINAL', canvas.width / 2, 45);

        // Scrap balance
        const scrap = us && us.state ? us.state.scrap : 0;
        ctx.fillStyle = '#ffcc00';
        ctx.font = '14px monospace';
        ctx.fillText('SCRAP: ' + scrap, canvas.width / 2, 65);

        for (let i = 0; i < upgradeLabels.length; i++) {
            const label = upgradeLabels[i];
            const rank = us && us.state ? (us.state.upgrades[label] || 0) : 0;
            const maxRank = maxRanks[i];
            let cost = 0;
            try { cost = us ? us.getUpgradeCost(label) : 999; } catch(e) {}
            const isMaxed = rank >= maxRank;
            const canAfford = !isMaxed && scrap >= cost;
            const isSelected = i === selected;

            const y = startY + i * spacing;
            const barY = y + 12;

            // Selection highlight
            if (isSelected) {
                ctx.fillStyle = 'rgba(0, 255, 255, 0.08)';
                ctx.fillRect(20, y - 5, canvas.width - 40, spacing - 4);
                ctx.strokeStyle = '#00ffff';
                ctx.strokeRect(20, y - 5, canvas.width - 40, spacing - 4);
            }

            // Category name
            ctx.textAlign = 'left';
            ctx.fillStyle = isSelected ? '#00ffff' : '#ccc';
            ctx.font = 'bold 14px monospace';
            ctx.fillText(upgradeNames[i], 35, y + 5);

            // Rank bar
            const barW = Math.min(180, canvas.width - 300);
            const rankPct = isMaxed ? 1 : rank / maxRank;
            ctx.fillStyle = '#1a1a3a';
            ctx.fillRect(35, barY, barW, 8);
            ctx.fillStyle = isMaxed ? '#00ff55' : '#00aaff';
            ctx.fillRect(35, barY, barW * rankPct, 8);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(35, barY, barW, 8);

            // Rank text
            ctx.fillStyle = '#8af';
            ctx.font = '11px monospace';
            ctx.fillText('RANK ' + rank + '/' + maxRank, 35 + barW + 10, barY + 8);

            // Cost / MAX
            const costX = canvas.width - 200;
            if (isMaxed) {
                ctx.fillStyle = '#00ff55';
                ctx.fillText('MAXED', costX, y + 20);
            } else {
                ctx.fillStyle = canAfford ? '#ffcc00' : '#ff3355';
                ctx.fillText(cost + ' SCRAP', costX, y + 15);
                if (isSelected) {
                    ctx.fillStyle = '#8af';
                    ctx.font = '10px monospace';
                    ctx.fillText('[ENTER] to purchase', costX, y + 32);
                }
            }

            // Description
            if (isSelected) {
                ctx.fillStyle = '#889';
                ctx.font = '10px monospace';
                const desc = label === 'weapons' ? 'Damage +5%, fire rate +3%, projectile speed +5% per rank' :
                             label === 'shields' ? 'Max HP +10, regen +0.1/s, invuln +0.05s per rank' :
                             label === 'engines' ? 'Speed +3%, boost duration & recharge per rank' :
                             label === 'specials' ? 'Ability duration +0.3s, cooldown -5% per rank' :
                             'Ship color, thruster trail, explosion style';
                ctx.fillText(desc, 35, barY + 28);
            }
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = '#8a8a9f';
        ctx.font = '11px monospace';
        ctx.fillText('\u2191\u2193 SELECT  |  ENTER BUY  |  ESC BACK', canvas.width / 2, startY + upgradeLabels.length * spacing + 10);

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
    setBiomeBackgrounds(biomeLevel);
    initAudio();
    loadPlayerSprites();
    loadPortraitSprites();
    loadEnemySprites();
    loadVFXSprites();

    // Check active dialogue first, on any screen!
    if (typeof activeDialogue !== 'undefined' && activeDialogue) {
        activeDialogue.handleKey(e.key);
        e.preventDefault();
        return;
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
        if (['Space', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'e', 'E'].indexOf(e.key) > -1) {
            e.preventDefault();
        }
        if (e.key === ' ' && (gameOver || gameWon)) {
            handleDeathOrVictoryRestart();
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
        if (e.key === 'Escape' && (gameOver || gameWon)) {
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
            } else if (currentScreen === SCREENS.LOAD_GAME) {
                window._loadSelectedSlot = Math.max(0, (window._loadSelectedSlot || 0) - 1);
            } else if (currentScreen === SCREENS.UPGRADE_SHOP) {
                const labels = ['weapons','shields','engines','specials','cosmetics'];
                window._upgradeSelected = Math.max(0, ((window._upgradeSelected || 0) - 1 + labels.length) % labels.length);
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
            } else if (currentScreen === SCREENS.LOAD_GAME) {
                const saves = window._loadSaves || [];
                window._loadSelectedSlot = Math.min(2, (window._loadSelectedSlot || 0) + 1);
            } else if (currentScreen === SCREENS.UPGRADE_SHOP) {
                const labels = ['weapons','shields','engines','specials','cosmetics'];
                window._upgradeSelected = ((window._upgradeSelected || 0) + 1) % labels.length;
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
            }
            e.preventDefault();
        } else if (e.key === 'Enter' || e.key === ' ') {
            playSound('menu_click');
            if (currentScreen === SCREENS.CINEMATIC) {
                transitionToScreen(SCREENS.CREDITS);
            } else if (currentScreen === SCREENS.BRIEFING) {
                // GRO-936: Advance/skip briefing on Enter/Space
                handleBriefingKey(e.key);
            } else if (currentScreen === SCREENS.LOAD_GAME) {
                confirmLoadGame();
            } else if (currentScreen === SCREENS.UPGRADE_SHOP) {
                const labels = ['weapons','shields','engines','specials','cosmetics'];
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
});

window.STATUS_EXPANDED = false;

// toggleStatusPanel() and DOMContentLoaded handler extracted to js/ui/hud.js (GRO-1062)

// GRO-1160: Touch/click handler for LOAD_GAME screen
canvas.addEventListener('click', function(e) {
    if (typeof currentScreen === 'undefined' || currentScreen !== SCREENS.LOAD_GAME) return;
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var cx = (e.clientX - rect.left) * scaleX;
    var cy = (e.clientY - rect.top) * scaleY;
    var regions = window._loadHitRegions || [];
    var saves = window._loadSaves || [];
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
});
