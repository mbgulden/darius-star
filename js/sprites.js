// --- Sprite State Management & Loading ---

// Global Sprite Collections
let playerSprites = {};
let playerSpritesLoaded = false;

let enemySprites = {};
let enemySpritesLoaded = false;

let vfxSprites = {};
let vfxSpritesLoaded = false;

let bossSprites = {};
let bossAssetsLoading = false;
let bossAssetsLoaded = false;
let bossLoadProgress = 0;  // 0-100

let bgImages = {};
let bgImagesLoaded = false;

// Loading state management
let spritesReady = new Set();

// --- Player Sprite Preloading ---
function loadPlayerSprites() {
    if (playerSpritesLoaded) return;
    playerSpritesLoaded = true;
    const frames = ['player_0', 'player_1', 'scout_0', 'interceptor_0', 'heavy_0'];
    frames.forEach(key => {
        playerSprites[key] = new Image();
        playerSprites[key].onload = () => {
            checkAllSpritesReady('player');
        };
        playerSprites[key].src = `assets/sprites/${key}.png`;
    });
}

// --- Enemy Sprite Preloading ---
function loadEnemySprites() {
    if (enemySpritesLoaded) return;
    enemySpritesLoaded = true;
    const types = ['scout', 'interceptor', 'heavy', 'boss_minion'];
    types.forEach(key => {
        enemySprites[key] = new Image();
        enemySprites[key].onload = () => {
            checkAllSpritesReady('enemy');
        };
        enemySprites[key].src = `assets/sprites/${key}_0.png`;
    });
}

// --- VFX Sprite Preloading ---
function loadVFXSprites() {
    if (vfxSpritesLoaded) return;
    vfxSpritesLoaded = true;

    const vfxToLoad = [
        { key: 'laser', src: 'assets/sprites/laser_0.png' },
        { key: 'laser_enemy', src: 'assets/sprites/laser_enemy.png' },
        { key: 'laser_glow', src: 'assets/sprites/laser_0_glow.png' },
        { key: 'shield', src: 'assets/sprites/shield_0.png' }
    ];

    vfxToLoad.forEach(({key, src}) => {
        vfxSprites[key] = new Image();
        vfxSprites[key].onload = () => {
            checkAllSpritesReady('vfx');
        };
        vfxSprites[key].src = src;
    });

    // Multi-frame explosion (4 frames)
    for (let f = 0; f < 4; f++) {
        const key = 'explosion_' + f;
        vfxSprites[key] = new Image();
        vfxSprites[key].onload = () => {
            checkAllSpritesReady('vfx');
        };
        vfxSprites[key].src = `assets/sprites/explosion_${f}.png`;
    }
}

// --- Boss Asset Lazy-Loading ---
function preloadBossAssets() {
    if (bossAssetsLoading || bossAssetsLoaded) return;
    bossAssetsLoading = true;
    bossLoadProgress = 0;

    const toLoad = [
        { key: 'boss',       src: 'assets/sprites/boss_0.png' },
        { key: 'bossMinion', src: 'assets/sprites/boss_minion_0.png' }
    ];
    let loadedCount = 0;
    const total = toLoad.length;

    toLoad.forEach(({key, src}) => {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            bossLoadProgress = Math.round((loadedCount / total) * 100);
            if (loadedCount >= total) {
                bossAssetsLoaded = true;
                bossAssetsLoading = false;
                checkAllSpritesReady('boss');
            }
        };
        img.onerror = () => {
            // Graceful fallback: mark done even on error
            loadedCount++;
            bossLoadProgress = Math.round((loadedCount / total) * 100);
            if (loadedCount >= total) {
                bossAssetsLoaded = true;
                bossAssetsLoading = false;
                checkAllSpritesReady('boss');
            }
        };
        img.src = src;
        bossSprites[key] = img;
    });
}

// --- Background Image Loading ---
function loadBackgroundImages() {
    const toLoad = [
        { key: 'nebula', src: 'assets/sprites/bg_nebula_0.png' },
        { key: 'city',   src: 'assets/sprites/bg_city_0.png' }
    ];
    let loaded = 0;
    toLoad.forEach(({key, src}) => {
        bgImages[key] = new Image();
        bgImages[key].onload = () => {
            loaded++;
            if (loaded >= toLoad.length) {
                checkAllSpritesReady('background');
            }
        };
        bgImages[key].src = src;
    });
}

function ensureBackgroundImages() {
    if (!bgImagesLoaded) {
        bgImagesLoaded = true;
        loadBackgroundImages();
    }
}

function loadPortraitSprites() {
    // Placeholder as requested in context
    console.log("Loading portrait sprites...");
    checkAllSpritesReady('portraits');
}

function loadBiomeStripSprites() {
    // Placeholder as requested in context
    console.log("Loading biome strip sprites...");
    checkAllSpritesReady('biome');
}

function checkAllSpritesReady(category) {
    spritesReady.add(category);
    // This can be expanded to call startGameAfterSprites if all required categories are loaded
}

function startGameAfterSprites() {
    console.log("All sprites ready, initializing game start sequence...");
    // Logic to transition from loading to game can go here
}
