/**
 * Darius Star: Cyber Coelacanth - UI & Menu System
 * Handles menu states, rendering, leaderboards, and cinematics.
 */

// --- Screen Constants ---
window.SCREENS = {
    MENU: 'menu',
    SHIP_SELECT: 'ship_select',
    SETTINGS: 'settings',
    CREDITS: 'credits',
    LEADERBOARD: 'leaderboard',
    PLAYING: 'playing',
    CINEMATIC: 'cinematic'
};

// --- Menu & Settings State Variables ---
window.currentScreen = window.SCREENS.MENU;
window.selectedMenuIndex = 0;
window.menuOptions = ['START GAME', 'UPGRADE SHOP', 'SHIP SELECT', 'SETTINGS', 'LEADERBOARD', 'CREDITS'];
window.shipSelectSource = 'menu'; // 'menu' or 'start'

window.selectedSettingsIndex = 0;
window.SETTINGS_OPTIONS = ['MASTER VOLUME', 'SFX VOLUME', 'MUSIC VOLUME', 'DIFFICULTY', 'BACK'];

window.selectedShipIndex = 1; // 0=scout, 1=interceptor, 2=heavy
window.SHIP_OPTIONS = ['scout', 'interceptor', 'heavy'];
window.selectedShip = 'interceptor';

// High Score & Leaderboard state
window.LS_KEY = 'darius_star_scores';
window.leaderboardFilter = 'all'; // 'all' | ship name | 'easy' | 'normal' | 'hard'
window.leaderboardScrollOffset = 0;
window.newHighScoreCelebrated = false;
window.highScoreBannerTimer = 0;
window.highScoreParticles = [];

// Cinematic & Credits Scroll variables
window.cinematicTime = 0;
window.creditsScrollY = 0;
window.creditsHoldTimer = 0;
window.maxCreditsScroll = 1050;
window.bossDefeated = false;
window.bossIntroPlaying = false;
window.victoryVideoPlaying = false;

// Audio Settings (matching index.html defaults)
window.masterVolume = 0.8;
window.sfxVolume = 0.8;
window.musicVolume = 0.6;
window.difficulty = 'normal'; // 'easy', 'normal', 'hard'

// Transition state
window.screenFadeAlpha = 0;
window.targetScreen = null;
window.transitionTimer = 0;
window.TRANSITION_DURATION = 0.3; // 300ms transition fade

// --- Video Elements (references set in index.html) ---
window.bossIntroVideo = null;
window.victoryVideo = null;
window.skipHint = null;

window.initUIVideoElements = function() {
    window.bossIntroVideo = document.getElementById('boss-intro-video');
    window.victoryVideo = document.getElementById('victory-video');
    window.skipHint = document.getElementById('skip-cinematic-hint');

    if (window.bossIntroVideo) {
        window.bossIntroVideo.addEventListener('click', () => { if (window.bossIntroPlaying) skipBossIntro(); });
    }
    if (window.victoryVideo) {
        window.victoryVideo.addEventListener('click', () => { if (window.victoryVideoPlaying) skipVictoryCinematic(); });
    }
}

// --- Cinematic & Logo Assets ---
const endingSunriseImg = new Image();
window.endingSunriseLoaded = false;
endingSunriseImg.onload = () => { window.endingSunriseLoaded = true; };
endingSunriseImg.src = 'assets/cinematics/ending_sunrise.png';

const studioLogoImg = new Image();
window.studioLogoLoaded = false;
studioLogoImg.onload = () => { window.studioLogoLoaded = true; };
studioLogoImg.src = 'assets/sprites/studio_logo.png';

// Title background title loop strip assets
const titleBgImage = new Image();
window.titleBgLoaded = false;
titleBgImage.onload = () => { window.titleBgLoaded = true; };
titleBgImage.src = 'assets/sprites/backgrounds/bg_title_strip.png';

window.titleBgFrame = 0;
window.titleBgTimer = 0;
const TITLE_FRAME_WIDTH = 1280;
const TITLE_FRAME_HEIGHT = 720;
const TITLE_TOTAL_FRAMES = 31;
const TITLE_FRAME_DURATION = 0.067; // ~15fps (1/15s)

// Title logo asset
const titleLogoImg = new Image();
window.titleLogoLoaded = false;
titleLogoImg.onload = () => { window.titleLogoLoaded = true; };
titleLogoImg.src = 'assets/sprites/title_0.png';

// --- Leaderboard Functions ---
window.loadScores = function() {
    try {
        const raw = localStorage.getItem(window.LS_KEY);
        return raw ? JSON.parse(raw) : { highScores: [] };
    } catch(e) {
        return { highScores: [] };
    }
}

window.saveScores = function(data) {
    try {
        localStorage.setItem(window.LS_KEY, JSON.stringify(data));
    } catch(e) {
        // localStorage full or unavailable
    }
}

window.saveRunScore = function(score, ship, biome, difficulty) {
    const data = loadScores();
    const entry = {
        score: score,
        ship: ship,
        biome: biome,
        difficulty: difficulty,
        date: new Date().toISOString().split('T')[0]
    };
    data.highScores.push(entry);
    // Sort descending by score
    data.highScores.sort((a, b) => b.score - a.score);
    // Keep top 50
    if (data.highScores.length > 50) {
        data.highScores = data.highScores.slice(0, 50);
    }
    saveScores(data);
    return entry;
}

window.getTopScore = function() {
    const data = loadScores();
    return data.highScores.length > 0 ? data.highScores[0] : null;
}

window.isNewHighScore = function(score) {
    const top = getTopScore();
    if (!top) return score > 0;
    return score > top.score;
}

window.getFilteredScores = function() {
    const data = loadScores();
    if (window.leaderboardFilter === 'all') return data.highScores;
    if (['easy', 'normal', 'hard'].includes(window.leaderboardFilter)) {
        return data.highScores.filter(s => s.difficulty === window.leaderboardFilter);
    }
    return data.highScores.filter(s => s.ship === window.leaderboardFilter);
}

window.clearAllScores = function() {
    saveScores({ highScores: [] });
}

// --- Menu Music & Audio Helpers ---
let musicInterval = null;
let musicStep = 0;
const bassLine = [110, 110, 130, 130, 146, 146, 165, 165]; // A2, C3, D3, E3
const melody = [
    220, 0, 261, 293, 329, 0, 293, 261,
    220, 220, 329, 0, 293, 0, 261, 0
];

window.playMenuMusicStep = function() {
    if (!window.audioCtx || window.currentScreen === 'playing' || window.currentScreen === window.SCREENS.CINEMATIC || window.currentScreen === window.SCREENS.CREDITS) return;
    const now = window.audioCtx.currentTime;

    const bassFreq = bassLine[Math.floor(musicStep / 2) % bassLine.length];
    if (musicStep % 2 === 0 && bassFreq > 0) {
        const osc = window.audioCtx.createOscillator();
        const gain = window.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassFreq, now);
        gain.gain.setValueAtTime(0.015 * window.masterVolume * window.musicVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(window.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    const melFreq = melody[musicStep % melody.length];
    if (melFreq > 0) {
        const osc = window.audioCtx.createOscillator();
        const gain = window.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(melFreq, now);
        gain.gain.setValueAtTime(0.02 * window.masterVolume * window.musicVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(window.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
    }
    musicStep++;
}

window.startMenuMusic = function() {
    if (musicInterval) return;
    musicStep = 0;
    musicInterval = setInterval(playMenuMusicStep, 200);
}

window.stopMenuMusic = function() {
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
}

let creditsMusicInterval = null;
const creditsBassLine = [98, 98, 146, 146, 130, 130, 98, 98]; // G2, D3, C3, G2
const creditsMelody = [
    392, 0, 493, 587, 784, 0, 739, 587, // G4, B4, D5, G5, F#5, D5
    493, 493, 587, 0, 440, 0, 392, 0    // B4, B4, D5, A4, G4
];

window.playCreditsMusicStep = function() {
    if (!window.audioCtx || window.currentScreen !== window.SCREENS.CREDITS) return;
    const now = window.audioCtx.currentTime;

    const bassFreq = creditsBassLine[Math.floor(musicStep / 2) % creditsBassLine.length];
    if (musicStep % 2 === 0 && bassFreq > 0) {
        const osc = window.audioCtx.createOscillator();
        const gain = window.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(bassFreq, now);
        gain.gain.setValueAtTime(0.015 * window.masterVolume * window.musicVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(window.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
    }

    const melFreq = creditsMelody[musicStep % creditsMelody.length];
    if (melFreq > 0) {
        const osc = window.audioCtx.createOscillator();
        const gain = window.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(melFreq, now);
        gain.gain.setValueAtTime(0.012 * window.masterVolume * window.musicVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(window.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
    }
    musicStep++;
}

window.startCreditsMusic = function() {
    if (creditsMusicInterval) return;
    musicStep = 0;
    creditsMusicInterval = setInterval(playCreditsMusicStep, 250);
}

window.stopCreditsMusic = function() {
    if (creditsMusicInterval) {
        clearInterval(creditsMusicInterval);
        creditsMusicInterval = null;
    }
}

// --- UI Utility Functions ---
window.transitionToScreen = function(newScreen) {
    if (window.targetScreen) return;
    window.targetScreen = newScreen;
    window.transitionTimer = 0;
}

window.hexToRgb = function(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

window.adjustSetting = function(index, dir) {
    const step = 0.1;
    if (index === 0) {
        window.masterVolume = Math.max(0, Math.min(1.0, window.masterVolume + dir * step));
    } else if (index === 1) {
        window.sfxVolume = Math.max(0, Math.min(1.0, window.sfxVolume + dir * step));
    } else if (index === 2) {
        window.musicVolume = Math.max(0, Math.min(1.0, window.musicVolume + dir * step));
    } else if (index === 3) {
        const diffs = ['easy', 'normal', 'hard'];
        let currentIdx = diffs.indexOf(window.difficulty);
        currentIdx = (currentIdx + dir + 3) % 3;
        window.difficulty = diffs[currentIdx];
    }
}

window.handleMenuConfirm = function() {
    if (window.currentScreen === window.SCREENS.MENU) {
        if (window.selectedMenuIndex === 0) {
            window.shipSelectSource = 'start';
            transitionToScreen(window.SCREENS.SHIP_SELECT);
        } else if (window.selectedMenuIndex === 1) {
            window.location.href = 'upgrade_shop.html';
        } else if (window.selectedMenuIndex === 2) {
            window.shipSelectSource = 'menu';
            transitionToScreen(window.SCREENS.SHIP_SELECT);
        } else if (window.selectedMenuIndex === 3) {
            window.selectedSettingsIndex = 0;
            transitionToScreen(window.SCREENS.SETTINGS);
        } else if (window.selectedMenuIndex === 4) {
            transitionToScreen(window.SCREENS.LEADERBOARD);
        } else if (window.selectedMenuIndex === 5) {
            transitionToScreen(window.SCREENS.CREDITS);
        }
    } else if (window.currentScreen === window.SCREENS.SHIP_SELECT) {
        window.selectedShip = window.SHIP_OPTIONS[window.selectedShipIndex];
        if (window.shipSelectSource === 'start') {
            transitionToScreen(window.SCREENS.PLAYING);
        } else {
            transitionToScreen(window.SCREENS.MENU);
        }
    } else if (window.currentScreen === window.SCREENS.SETTINGS) {
        if (window.selectedSettingsIndex === 4) {
            transitionToScreen(window.SCREENS.MENU);
        }
    } else if (window.currentScreen === window.SCREENS.CREDITS) {
        transitionToScreen(window.SCREENS.MENU);
    }
}

window.getCanvasMouseCoords = function(e) {
    const rect = window.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (window.canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (window.canvas.height / rect.height);
    return { x, y };
}

// --- Cinematic Video Playback ---
window.playBossIntro = function() {
    if (window.bossIntroPlaying) return;
    window.bossIntroPlaying = true;
    if (window.bossIntroVideo) {
        window.bossIntroVideo.muted = false;
        window.bossIntroVideo.classList.add('active');
        if (window.skipHint) window.skipHint.classList.add('active');
        window.bossIntroVideo.currentTime = 0;
        window.bossIntroVideo.play().catch(() => {
            window.bossIntroPlaying = false;
            window.bossIntroVideo.classList.remove('active');
            if (window.skipHint) window.skipHint.classList.remove('active');
            spawnBossNow();
        });
        window.bossIntroVideo.onended = () => {
            window.bossIntroVideo.classList.remove('active');
            if (window.skipHint) window.skipHint.classList.remove('active');
            window.bossIntroPlaying = false;
            spawnBossNow();
        };
    }
}

window.skipBossIntro = function() {
    if (!window.bossIntroPlaying) return;
    if (window.bossIntroVideo) {
        window.bossIntroVideo.pause();
        window.bossIntroVideo.classList.remove('active');
    }
    if (window.skipHint) window.skipHint.classList.remove('active');
    window.bossIntroPlaying = false;
    spawnBossNow();
}

window.spawnBossNow = function() {
    window.bossSpawned = true;
    window.sirenTimer = 0;
    window.boss = new window.Boss();
}

window.playVictoryCinematic = function() {
    if (window.victoryVideoPlaying) return;
    window.victoryVideoPlaying = true;
    if (window.victoryVideo) {
        window.victoryVideo.muted = false;
        window.victoryVideo.classList.add('active');
        if (window.skipHint) window.skipHint.classList.add('active');
        window.victoryVideo.currentTime = 0;
        window.victoryVideo.play().catch(() => {
            window.victoryVideoPlaying = false;
            window.victoryVideo.classList.remove('active');
            if (window.skipHint) window.skipHint.classList.remove('active');
            transitionToScreen(window.SCREENS.CINEMATIC);
        });
        window.victoryVideo.onended = () => {
            window.victoryVideo.classList.remove('active');
            if (window.skipHint) window.skipHint.classList.remove('active');
            window.victoryVideoPlaying = false;
            transitionToScreen(window.SCREENS.CINEMATIC);
        };
    }
}

window.skipVictoryCinematic = function() {
    if (!window.victoryVideoPlaying) return;
    if (window.victoryVideo) {
        window.victoryVideo.pause();
        window.victoryVideo.classList.remove('active');
    }
    if (window.skipHint) window.skipHint.classList.remove('active');
    window.victoryVideoPlaying = false;
    transitionToScreen(window.SCREENS.CINEMATIC);
}

// --- Rendering Functions ---
window.updateTitleBackground = function(dt) {
    window.titleBgTimer += dt;
    if (window.titleBgTimer >= TITLE_FRAME_DURATION) {
        window.titleBgTimer -= TITLE_FRAME_DURATION;
        window.titleBgFrame = (window.titleBgFrame + 1) % TITLE_TOTAL_FRAMES;
    }
}

window.drawTitleBackground = function() {
    if (window.titleBgLoaded && titleBgImage.naturalWidth > 0) {
        const sx = window.titleBgFrame * TITLE_FRAME_WIDTH;
        const sy = 0;
        window.ctx.drawImage(titleBgImage,
            sx, sy, TITLE_FRAME_WIDTH, TITLE_FRAME_HEIGHT,
            0, 0, window.canvas.width, window.canvas.height
        );
    } else {
        window.ctx.fillStyle = '#01010c';
        window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height);
        window.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        window.stars.forEach(star => {
            const alpha = star.getAlpha();
            window.ctx.globalAlpha = alpha;
            window.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        window.ctx.globalAlpha = 1.0;
    }
}

window.drawTitleLogo = function() {
    if (window.titleLogoLoaded && titleLogoImg.naturalWidth > 0) {
        window.ctx.save();
        const lw = 420;
        const lh = 140;
        const lx = window.canvas.width / 2 - lw / 2;
        const ly = 30 + Math.sin(window.gameTime * 2.5) * 6; // floating effect

        window.ctx.shadowColor = '#00ffff';
        window.ctx.shadowBlur = 12 + Math.sin(window.gameTime * 5) * 6;
        window.ctx.drawImage(titleLogoImg, lx, ly, lw, lh);
        window.ctx.restore();
    } else {
        window.ctx.save();
        window.ctx.textAlign = 'center';
        window.ctx.font = 'bold 36px Courier New';
        window.ctx.shadowColor = '#00ffff';
        window.ctx.shadowBlur = 15 + Math.sin(window.gameTime * 5) * 8;
        window.ctx.fillStyle = '#00ffff';
        window.ctx.fillText('DARIUS STAR', window.canvas.width / 2, 85 + Math.sin(window.gameTime * 2) * 4);

        window.ctx.font = 'bold 16px Courier New';
        window.ctx.fillStyle = '#ff0055';
        window.ctx.shadowColor = '#ff0055';
        window.ctx.shadowBlur = 8;
        window.ctx.fillText('CYBER COELACANTH', window.canvas.width / 2, 115 + Math.sin(window.gameTime * 2) * 4);
        window.ctx.restore();
    }
}

window.drawMenuScreens = function() {
    drawTitleBackground();

    if (window.currentScreen === window.SCREENS.MENU) {
        drawTitleLogo();

        window.ctx.save();
        window.ctx.textAlign = 'center';
        window.ctx.font = 'bold 15px monospace';

        const startY = 210;
        const spacing = 35;

        const lifetimeScrap = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.state.scrap : 0;
        window.ctx.fillStyle = '#00ff55';
        window.ctx.font = 'bold 12px monospace';
        window.ctx.fillText(`⚙️ SCRAP CORE: ${lifetimeScrap.toLocaleString()}`, window.canvas.width / 2, startY - 45);

        const topScore = getTopScore();
        if (topScore) {
            window.ctx.fillStyle = '#ffaa00';
            window.ctx.font = 'bold 12px monospace';
            window.ctx.fillText(`★ HIGH SCORE: ${topScore.score.toLocaleString()} — ${topScore.ship.toUpperCase()} — ${topScore.difficulty.toUpperCase()}`, window.canvas.width / 2, startY - 25);
        }

        window.ctx.font = 'bold 15px monospace';
        for (let i = 0; i < window.menuOptions.length; i++) {
            const itemY = startY + i * spacing;
            const isSelected = window.selectedMenuIndex === i;

            if (isSelected) {
                window.ctx.fillStyle = '#00ffff';
                window.ctx.shadowColor = '#00ffff';
                window.ctx.shadowBlur = 10;
                window.ctx.fillText(`>  ${window.menuOptions[i]}  <`, window.canvas.width / 2, itemY);
                window.ctx.shadowBlur = 0;
            } else {
                window.ctx.fillStyle = '#8a8a9f';
                window.ctx.fillText(window.menuOptions[i], window.canvas.width / 2, itemY);
            }
        }

        window.ctx.fillStyle = '#4a4a5f';
        window.ctx.font = '10px monospace';
        window.ctx.fillText('USE W/S or ARROWS to NAVIGATE | ENTER to SELECT', window.canvas.width / 2, window.canvas.height - 25);
        window.ctx.restore();
    } else if (window.currentScreen === window.SCREENS.SHIP_SELECT) {
        window.ctx.save();
        window.ctx.textAlign = 'center';
        window.ctx.fillStyle = '#00ffff';
        window.ctx.font = 'bold 22px monospace';
        window.ctx.shadowColor = '#00ffff';
        window.ctx.shadowBlur = 10;
        window.ctx.fillText('SELECT YOUR FIGHTER', window.canvas.width / 2, 60);
        window.ctx.shadowBlur = 0;

        const startY = 140;
        const spacing = 65;
        const shipNames = ['X-1 SCOUT', 'Y-2 INTERCEPTOR', 'Z-3 DREADNOUGHT'];
        const shipStats = [
            { speed: 'HIGH (280)', shield: 'LOW (80)', weapon: 'RAPID SINGLE' },
            { speed: 'MID (220)', shield: 'MID (100)', weapon: 'SPREAD DOUBLE' },
            { speed: 'LOW (170)', shield: 'HIGH (150)', weapon: 'SLOW WAVE' }
        ];

        for (let i = 0; i < 3; i++) {
            const itemY = startY + i * spacing;
            const isSelected = window.selectedShipIndex === i;

            window.ctx.fillStyle = isSelected ? 'rgba(0, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)';
            window.ctx.strokeStyle = isSelected ? '#00ffff' : '#3a3a4a';
            window.ctx.lineWidth = isSelected ? 2 : 1;
            window.ctx.fillRect(80, itemY - 25, 640, 52);
            window.ctx.strokeRect(80, itemY - 25, 640, 52);

            const spriteKey = i === 0 ? 'scout_0' : (i === 2 ? 'heavy_0' : 'interceptor_0');
            const sprite = window.playerSprites[spriteKey];
            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                window.ctx.drawImage(sprite, 105, itemY - 20, 40, 40);
            } else {
                window.ctx.fillStyle = i === 0 ? '#00ffff' : (i === 2 ? '#ff9900' : '#00ffaa');
                window.ctx.fillRect(115, itemY - 10, 20, 20);
            }

            window.ctx.textAlign = 'left';
            window.ctx.font = 'bold 14px monospace';
            window.ctx.fillStyle = isSelected ? '#00ffff' : '#8a8a9f';
            window.ctx.fillText(shipNames[i], 170, itemY - 5);

            window.ctx.font = '10px monospace';
            window.ctx.fillStyle = isSelected ? '#ffffff' : '#6a6a7f';
            window.ctx.fillText(`SPEED: ${shipStats[i].speed}  |  SHIELD: ${shipStats[i].shield}  |  WEAPON: ${shipStats[i].weapon}`, 170, itemY + 14);

            if (isSelected) {
                window.ctx.font = 'bold 14px monospace';
                window.ctx.fillStyle = '#00ffff';
                window.ctx.fillText('SELECTED', 620, itemY + 5);
            }
        }

        window.ctx.textAlign = 'center';
        window.ctx.font = 'bold 14px monospace';
        window.ctx.fillStyle = '#ff0055';
        window.ctx.fillText('BACK TO MENU', window.canvas.width / 2, 365);

        window.ctx.fillStyle = '#4a4a5f';
        window.ctx.font = '10px monospace';
        window.ctx.fillText('ENTER / CLICK to CHOOSE  |  ESC to RETURN', window.canvas.width / 2, window.canvas.height - 25);
        window.ctx.restore();
    } else if (window.currentScreen === window.SCREENS.SETTINGS) {
        window.ctx.save();
        window.ctx.textAlign = 'center';
        window.ctx.fillStyle = '#00ffff';
        window.ctx.font = 'bold 22px monospace';
        window.ctx.shadowColor = '#00ffff';
        window.ctx.shadowBlur = 10;
        window.ctx.fillText('SYSTEM SETTINGS', window.canvas.width / 2, 60);
        window.ctx.shadowBlur = 0;

        const startY = 175;
        const spacing = 36;

        for (let i = 0; i < window.SETTINGS_OPTIONS.length; i++) {
            const itemY = startY + i * spacing;
            const isSelected = window.selectedSettingsIndex === i;

            window.ctx.textAlign = 'left';
            window.ctx.font = 'bold 14px monospace';
            window.ctx.fillStyle = isSelected ? '#00ffff' : '#8a8a9f';

            if (i < 3) {
                const volVal = i === 0 ? window.masterVolume : (i === 1 ? window.sfxVolume : window.musicVolume);
                window.ctx.fillText(window.SETTINGS_OPTIONS[i], 220, itemY + 5);

                const sliderX = 450;
                const sliderWidth = 130;
                window.ctx.fillStyle = '#222';
                window.ctx.fillRect(sliderX, itemY - 6, sliderWidth, 12);

                window.ctx.fillStyle = isSelected ? '#00ffff' : '#ff0055';
                window.ctx.fillRect(sliderX, itemY - 6, sliderWidth * volVal, 12);

                window.ctx.strokeStyle = '#fff';
                window.ctx.strokeRect(sliderX, itemY - 6, sliderWidth, 12);

                window.ctx.fillText(Math.round(volVal * 100) + '%', 595, itemY + 5);
            } else if (i === 3) {
                window.ctx.fillText(window.SETTINGS_OPTIONS[i], 220, itemY + 5);
                window.ctx.fillStyle = isSelected ? '#ffffff' : '#6a6a7f';
                window.ctx.fillText(window.difficulty.toUpperCase(), 450, itemY + 5);
            } else if (i === 4) {
                window.ctx.textAlign = 'center';
                window.ctx.fillStyle = isSelected ? '#ff0055' : '#8a8a9f';
                window.ctx.fillText('BACK TO MENU', window.canvas.width / 2, itemY + 5);
            }
        }

        window.ctx.textAlign = 'center';
        window.ctx.fillStyle = '#4a4a5f';
        window.ctx.font = '10px monospace';
        window.ctx.fillText('CONTROLS: WASD / ARROWS to MOVE  |  SPACE / J to FIRE  |  E to DODGE  |  P to PAUSE', window.canvas.width / 2, 335);
        window.ctx.fillText('LEFT/RIGHT to ADJUST VOLUME  |  ENTER / CLICK to TOGGLE  |  ESC to RETURN', window.canvas.width / 2, window.canvas.height - 25);
        window.ctx.restore();
    } else if (window.currentScreen === window.SCREENS.LEADERBOARD) {
        window.ctx.fillStyle = 'rgba(5, 5, 12, 0.75)';
        window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height);
        window.ctx.save();
        window.ctx.textAlign = 'center';

        window.ctx.fillStyle = '#ffaa00';
        window.ctx.font = 'bold 24px monospace';
        window.ctx.shadowColor = '#ffaa00';
        window.ctx.shadowBlur = 12;
        window.ctx.fillText('🏆 HIGH SCORE LEADERBOARD', window.canvas.width / 2, 55);
        window.ctx.shadowBlur = 0;

        const scores = getFilteredScores();
        const topScore = getTopScore();

        if (topScore) {
            window.ctx.fillStyle = '#00ffff';
            window.ctx.font = 'bold 14px monospace';
            window.ctx.fillText(`TOP SCORE: ${topScore.score.toLocaleString()} — ${topScore.ship.toUpperCase()} — ${topScore.difficulty.toUpperCase()}`, window.canvas.width / 2, 90);
        } else {
            window.ctx.fillStyle = '#8a8a9f';
            window.ctx.font = '14px monospace';
            window.ctx.fillText('No scores yet. Go fight!', window.canvas.width / 2, 90);
        }

        window.ctx.font = 'bold 11px monospace';
        const filters = ['all', 'scout', 'interceptor', 'heavy', 'easy', 'normal', 'hard'];
        const filterLabels = ['ALL', 'SCOUT', 'INT.', 'HEAVY', 'EASY', 'NORM', 'HARD'];
        const filterStartX = 130;
        const filterY = 115;

        for (let fi = 0; fi < filters.length; fi++) {
            const fx = filterStartX + fi * 78;
            const isActive = window.leaderboardFilter === filters[fi];
            window.ctx.fillStyle = isActive ? '#ffaa00' : '#4a4a5f';
            window.ctx.fillText(filterLabels[fi], fx, filterY);
            if (isActive) {
                window.ctx.fillRect(fx - 10, filterY + 4, 38, 2);
            }
        }

        window.ctx.fillStyle = '#3a3a5f';
        window.ctx.fillRect(80, 135, 640, 2);

        const listStartY = 155;
        const rowH = 28;
        const maxVisible = 10;
        const display = scores.slice(window.leaderboardScrollOffset, window.leaderboardScrollOffset + maxVisible);

        if (display.length === 0) {
            window.ctx.fillStyle = '#8a8a9f';
            window.ctx.font = '14px monospace';
            window.ctx.fillText('No scores match this filter.', window.canvas.width / 2, 250);
        } else {
            window.ctx.font = 'bold 10px monospace';
            window.ctx.fillStyle = '#5a5a7f';
            window.ctx.textAlign = 'left';
            window.ctx.fillText('#', 100, listStartY - 8);
            window.ctx.fillText('SCORE', 140, listStartY - 8);
            window.ctx.fillText('SHIP', 280, listStartY - 8);
            window.ctx.fillText('BIOME', 380, listStartY - 8);
            window.ctx.fillText('DIFF', 460, listStartY - 8);
            window.ctx.fillText('DATE', 540, listStartY - 8);

            window.ctx.font = '13px monospace';
            for (let si = 0; si < display.length; si++) {
                const s = display[si];
                const rank = window.leaderboardScrollOffset + si + 1;
                const ry = listStartY + si * rowH;

                window.ctx.fillStyle = si % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)';
                window.ctx.fillRect(85, ry - 14, 630, rowH);

                if (rank <= 3) {
                    const medal = rank === 1 ? '#ffd700' : (rank === 2 ? '#c0c0c0' : '#cd7f32');
                    window.ctx.fillStyle = medal;
                } else {
                    window.ctx.fillStyle = '#8a8a9f';
                }
                window.ctx.textAlign = 'left';
                window.ctx.fillText(rank, 100, ry + 4);

                window.ctx.fillStyle = '#ffffff';
                window.ctx.fillText(s.score.toLocaleString(), 140, ry + 4);
                window.ctx.fillText(s.ship.toUpperCase(), 280, ry + 4);
                window.ctx.fillText('BIOME ' + s.biome, 380, ry + 4);

                const diffColors = { easy: '#00ff55', normal: '#ffaa00', hard: '#ff0033' };
                window.ctx.fillStyle = diffColors[s.difficulty] || '#ffffff';
                window.ctx.fillText(s.difficulty.toUpperCase(), 460, ry + 4);

                window.ctx.fillStyle = '#8a8a9f';
                window.ctx.fillText(s.date, 540, ry + 4);
            }
        }

        if (scores.length > maxVisible) {
            window.ctx.fillStyle = '#5a5a7f';
            window.ctx.font = '10px monospace';
            const showing = Math.min(window.leaderboardScrollOffset + maxVisible, scores.length);
            window.ctx.fillText(`Showing ${window.leaderboardScrollOffset + 1}-${showing} of ${scores.length}  |  UP/DOWN to scroll`, window.canvas.width / 2, window.canvas.height - 48);
        }

        window.ctx.font = 'bold 13px monospace';
        window.ctx.fillStyle = '#ff0033';
        window.ctx.fillText('[C] CLEAR ALL SCORES', window.canvas.width / 2, window.canvas.height - 28);

        window.ctx.fillStyle = '#8a8a9f';
        window.ctx.font = '10px monospace';
        window.ctx.fillText('ESC / BACKSPACE to RETURN  |  ARROWS to FILTER', window.canvas.width / 2, window.canvas.height - 8);

        window.ctx.restore();
    } else if (window.currentScreen === window.SCREENS.CREDITS) {
        window.ctx.fillStyle = 'rgba(5, 5, 12, 0.75)';
        window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height);

        window.ctx.save();

        const creditsList = [
            { type: 'logo' },
            { type: 'spacer', height: 40 },
            { type: 'title', text: 'DARIUS STAR: CYBER COELACANTH' },
            { type: 'subtitle', text: 'DEVELOPMENT CREDITS' },
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
            { type: 'spacer', height: 60 },
            { type: 'thanks', text: 'THANK YOU FOR PLAYING' },
            { type: 'spacer', height: 50 },
            { type: 'end', text: 'THE END' }
        ];

        let currentY = window.canvas.height - window.creditsScrollY;
        window.ctx.textAlign = 'center';

        for (let i = 0; i < creditsList.length; i++) {
            const item = creditsList[i];

            if (currentY > -100 && currentY < window.canvas.height + 100) {
                if (item.type === 'logo') {
                    if (window.studioLogoLoaded && studioLogoImg.naturalWidth > 0) {
                        window.ctx.drawImage(studioLogoImg, window.canvas.width / 2 - 80, currentY - 50, 160, 160);
                    } else {
                        window.ctx.fillStyle = '#ff0055';
                        window.ctx.font = 'bold 16px monospace';
                        window.ctx.fillText('WHAT AN ADVENTURE GAMES', window.canvas.width / 2, currentY);
                    }
                } else if (item.type === 'title') {
                    window.ctx.fillStyle = '#00ffff';
                    window.ctx.font = 'bold 18px monospace';
                    window.ctx.shadowColor = '#00ffff';
                    window.ctx.shadowBlur = 8;
                    window.ctx.fillText(item.text, window.canvas.width / 2, currentY);
                    window.ctx.shadowBlur = 0;
                } else if (item.type === 'subtitle') {
                    window.ctx.fillStyle = '#8a8a9f';
                    window.ctx.font = '9px monospace';
                    window.ctx.fillText(item.text, window.canvas.width / 2, currentY);
                } else if (item.type === 'role') {
                    window.ctx.fillStyle = '#ff0055';
                    window.ctx.font = 'bold 11px monospace';
                    window.ctx.fillText(item.text, window.canvas.width / 2, currentY);
                } else if (item.type === 'name') {
                    window.ctx.fillStyle = '#ffffff';
                    window.ctx.font = '13px monospace';
                    window.ctx.fillText(item.text, window.canvas.width / 2, currentY);
                } else if (item.type === 'thanks') {
                    window.ctx.fillStyle = '#00ff55';
                    window.ctx.font = 'bold 18px monospace';
                    window.ctx.shadowColor = '#00ff55';
                    window.ctx.shadowBlur = 10;
                    window.ctx.fillText(item.text, window.canvas.width / 2, currentY);
                    window.ctx.shadowBlur = 0;
                } else if (item.type === 'end') {
                    window.ctx.fillStyle = '#ff0055';
                    window.ctx.font = 'bold 26px monospace';
                    window.ctx.shadowColor = '#ff0055';
                    window.ctx.shadowBlur = 12;
                    window.ctx.fillText(item.text, window.canvas.width / 2, currentY);
                    window.ctx.shadowBlur = 0;
                }
            }

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

        window.ctx.restore();

        const totalCreditsHeight = currentY - (window.canvas.height - window.creditsScrollY);
        window.maxCreditsScroll = totalCreditsHeight;

        window.ctx.fillStyle = '#4a4a5f';
        window.ctx.font = '10px monospace';
        window.ctx.textAlign = 'center';
        window.ctx.fillText('CLICK / SPACE / ESC to SKIP TO MENU', window.canvas.width / 2, window.canvas.height - 15);
    } else if (window.currentScreen === window.SCREENS.CINEMATIC) {
        window.ctx.save();

        if (window.endingSunriseLoaded && endingSunriseImg.naturalWidth > 0) {
            const progress = Math.min(window.cinematicTime / 20, 1.0);
            const sx = progress * 120;
            const sy = 150 + Math.sin(progress * Math.PI / 2) * 250;

            window.ctx.drawImage(endingSunriseImg,
                sx, sy, 800, 450,
                0, 0, window.canvas.width, window.canvas.height
            );
        } else {
            window.ctx.fillStyle = '#010108';
            window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height);
        }

        const scanlineGrad = window.ctx.createLinearGradient(0, 0, 0, window.canvas.height);
        scanlineGrad.addColorStop(0, 'rgba(0, 255, 255, 0.05)');
        scanlineGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
        scanlineGrad.addColorStop(1, 'rgba(255, 0, 255, 0.05)');
        window.ctx.fillStyle = scanlineGrad;
        window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height);

        if (window.cinematicTime > 3) {
            const flightProgress = Math.min((window.cinematicTime - 3) / 15, 1.0);
            const startX = -50;
            const startY = 320;
            const targetX = 480;
            const targetY = 220;

            const shipX = startX + (targetX - startX) * flightProgress;
            const shipY = startY + (targetY - startY) * flightProgress;
            const size = 32 * (1 - flightProgress * 0.75);

            window.ctx.fillStyle = Math.random() < 0.5 ? '#ff0055' : '#ffff00';
            window.ctx.beginPath();
            window.ctx.moveTo(shipX - 10, shipY + size/2);
            window.ctx.lineTo(shipX, shipY + size/2 - 4);
            window.ctx.lineTo(shipX, shipY + size/2 + 4);
            window.ctx.closePath();
            window.ctx.fill();

            const shipKey = window.selectedShip === 'scout' ? 'scout_0' : (window.selectedShip === 'heavy' ? 'heavy_0' : 'interceptor_0');
            const shipSprite = window.playerSprites[shipKey];
            if (shipSprite && shipSprite.complete && shipSprite.naturalWidth > 0) {
                window.ctx.drawImage(shipSprite, shipX, shipY, size, size);
            } else {
                window.ctx.fillStyle = '#00ffff';
                window.ctx.fillRect(shipX, shipY, size, size);
            }
        }

        let txt = "";
        if (window.cinematicTime < 3) {
            txt = "CYBER COELACANTH MELTDOWN INITIALIZED...";
        } else if (window.cinematicTime < 7) {
            txt = "SECTOR 3 DEPTH LAIR SECURED. ESCAPING CAVERN...";
        } else if (window.cinematicTime < 18) {
            txt = "The Cyber Coelacanth is defeated... but the galaxy still needs you.";
        } else {
            txt = "TO BE CONTINUED...";
        }

        let subTime = 0;
        if (window.cinematicTime < 3) subTime = window.cinematicTime;
        else if (window.cinematicTime < 7) subTime = window.cinematicTime - 3;
        else if (window.cinematicTime < 18) subTime = window.cinematicTime - 7;
        else subTime = window.cinematicTime - 18;

        const typedLength = Math.floor(subTime * 25);
        const visibleText = txt.substring(0, typedLength);

        window.ctx.fillStyle = 'rgba(5, 5, 15, 0.8)';
        window.ctx.fillRect(50, window.canvas.height - 75, window.canvas.width - 100, 45);
        window.ctx.strokeStyle = '#ff0055';
        window.ctx.lineWidth = 2;
        window.ctx.strokeRect(50, window.canvas.height - 75, window.canvas.width - 100, 45);

        window.ctx.fillStyle = '#ffffff';
        window.ctx.font = 'bold 11px monospace';
        window.ctx.textAlign = 'left';
        window.ctx.fillText(visibleText, 70, window.canvas.height - 48);

        window.ctx.fillStyle = '#4a4a5f';
        window.ctx.font = '9px monospace';
        window.ctx.textAlign = 'center';
        window.ctx.fillText('PRESS ENTER / ESC / CLICK to SKIP CUTSCENE', window.canvas.width / 2, window.canvas.height - 12);

        window.ctx.restore();
    }
}
