const assert = require('assert');
const fs = require('fs');

console.log('================================================================');
console.log('=== TEST: COMPLETE 20-BOSS & SUB-BOSS ENGINE INTEGRATION SUITE ===');
console.log('================================================================\n');

// Mock browser globals
global.window = global;
global.Image = class {
    constructor() {
        this.src = '';
        this.complete = true;
        this.naturalWidth = 2048;
        this.naturalHeight = 2048;
    }
};
global.canvas = { width: 1280, height: 720 };
global.enemyIdCounter = 0;
global.runSeed = 12345;
global.gameTime = 10.0;
global.particles = [];
global.enemyBullets = [];
global.enemies = [];
global.floatingTexts = [];
global.scrapDrops = [];
global.vfxExplosions = [];
global.hitFlashes = [];
global.bossDefeated = false;

const explosionsLogged = [];
global.playSound = function(s) {};
global.createExplosion = function(x, y, color, count, style) {
    explosionsLogged.push({ x, y, color, count, style });
};
global.spawnHitFlash = function(x, y, type) {
    global.hitFlashes.push({ x, y, type });
};
global.getCurrentDifficultyConfig = function() {
    return {
        enemyHpMultiplier: 1.0,
        enemySpeedMultiplier: 1.0,
        enemyFireRateMultiplier: 1.0,
        bossHpMultiplier: 1.0,
        powerupDropMultiplier: 1.0
    };
};
global.FloatingText = class { constructor(x, y, text, color) { this.x = x; this.y = y; this.text = text; this.color = color; } };
global.ScrapDrop = class { constructor(x, y, type, amount) { this.x = x; this.y = y; this.type = type; this.amount = amount; } };
global.Economy = {
    shouldDrop: () => true,
    rollDrop: (type, biome) => ({ type: 'scrap_large', amount: 50 }),
    createDrop: (x, y, type, amount) => ({ x, y, type, amount })
};

// Mock canvas 2D rendering context
const drawCalls = [];
global.ctx = {
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    drawImage: (img, sx, sy, sw, sh, dx, dy, dw, dh) => {
        drawCalls.push({ img, sx, sy, sw, sh, dx, dy, dw, dh });
    },
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    rect: () => {},
    arc: () => {},
    ellipse: () => {},
    fill: () => {},
    stroke: () => {},
    strokeText: () => {},
    fillText: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    measureText: () => ({ width: 100 }),
    createLinearGradient: () => ({ addColorStop: () => {} })
};

// Load modules in order
require('../js/levels/biome_data.js');
require('../js/sprites.js');
require('../js/level_manager.js');
require('../js/enemies.js');

// 1. Verify LevelManager to Boss Sprite Mapping across all 10 Biomes
console.log('--- 1. Testing LevelManager Spawning & SpriteKey Assignment (20 Bosses) ---');

const expectedRoster = [
    { biome: 1, level: 5,  absLevel: 5,   isMid: true,  key: 'boss_b1_mid_0',  name: 'TRENCH NAUTILUS' },
    { biome: 1, level: 10, absLevel: 10,  isMid: false, key: 'boss_b1_0',      name: 'DROWNED WARDEN' },
    { biome: 2, level: 5,  absLevel: 15,  isMid: true,  key: 'boss_b2_mid_0',  name: 'CORAL DREADNOUGHT CORE' },
    { biome: 2, level: 10, absLevel: 20,  isMid: false, key: 'boss_b2_0',      name: 'MEMORY WRAITH' },
    { biome: 3, level: 5,  absLevel: 25,  isMid: true,  key: 'boss_b3_mid_0',  name: 'WARDEN MECH' },
    { biome: 3, level: 10, absLevel: 30,  isMid: false, key: 'boss_b3_0',      name: 'EUROPA CYBER COELACANTH' },
    { biome: 4, level: 5,  absLevel: 35,  isMid: true,  key: 'boss_b4_mid_0',  name: 'NEBULA LEVIATHAN' },
    { biome: 4, level: 10, absLevel: 40,  isMid: false, key: 'boss_b4_0',      name: 'VORTEX PRIMUS' },
    { biome: 5, level: 5,  absLevel: 45,  isMid: true,  key: 'boss_b5_mid_0',  name: 'GLACIAL JUGGERNAUT' },
    { biome: 5, level: 10, absLevel: 50,  isMid: false, key: 'boss_b5_0',      name: 'FROST TYRANT' },
    { biome: 6, level: 5,  absLevel: 55,  isMid: true,  key: 'boss_b6_mid_0',  name: 'MAGMA BEHEMOTH' },
    { biome: 6, level: 10, absLevel: 60,  isMid: false, key: 'boss_b6_0',      name: 'INFERNO DRAGON' },
    { biome: 7, level: 5,  absLevel: 65,  isMid: true,  key: 'boss_b7_mid_0',  name: 'STORM EMPEROR CRUISER' },
    { biome: 7, level: 10, absLevel: 70,  isMid: false, key: 'boss_b7_0',      name: 'STORM-SINGER' },
    { biome: 8, level: 5,  absLevel: 75,  isMid: true,  key: 'boss_b8_mid_0',  name: 'FLAGSHIP HANGAR' },
    { biome: 8, level: 10, absLevel: 80,  isMid: false, key: 'boss_b8_0',      name: 'THE IRON GHOST' },
    { biome: 9, level: 5,  absLevel: 85,  isMid: true,  key: 'boss_b9_mid_0',  name: 'HIVE QUEEN SUB-CORE' },
    { biome: 9, level: 10, absLevel: 90,  isMid: false, key: 'boss_b9_0',      name: 'HIVE MIND OVERMIND' },
    { biome: 10, level: 5, absLevel: 95,  isMid: true,  key: 'boss_b10_mid_0', name: 'PARADOX SINGULARITY GATE' },
    { biome: 10, level: 10, absLevel: 100, isMid: false, key: 'boss_b10_0',    name: 'THE PRIMORDIAL SINGULARITY' }
];

for (const entry of expectedRoster) {
    // Test direct biome + level set
    LevelManager.setBiomeAndLevel(entry.biome, entry.level);
    assert.strictEqual(LevelManager.biome, entry.biome, `Biome must be ${entry.biome}`);
    assert.strictEqual(LevelManager.level, entry.level, `Level must be ${entry.level}`);
    assert.strictEqual(LevelManager.currentLevelConfig.midBoss, entry.isMid, `midBoss flag mismatch for ${entry.key}`);
    assert.strictEqual(LevelManager.currentLevelConfig.biomeBoss, !entry.isMid, `biomeBoss flag mismatch for ${entry.key}`);

    const boss = new Boss();
    assert.strictEqual(boss.spriteKey, entry.key, `Boss spriteKey must be ${entry.key}`);
    assert.strictEqual(boss.bossName, entry.name, `Boss name must be ${entry.name}`);
    assert.strictEqual(boss.isMidBoss, entry.isMid, `isMidBoss must be ${entry.isMid}`);
    assert(boss.targetPoints.length >= 2, `Boss ${entry.key} must have multi-part hardpoints`);

    // Test absolute level normalization (e.g. level 75 -> biome 8, level 5)
    LevelManager.setBiomeAndLevel(1, entry.absLevel);
    assert.strictEqual(LevelManager.biome, entry.biome, `Absolute level ${entry.absLevel} must resolve to biome ${entry.biome}`);
    assert.strictEqual(LevelManager.level, entry.level, `Absolute level ${entry.absLevel} must resolve to level ${entry.level}`);

    boss.cleanup();
    console.log(`  ✓ Biome ${entry.biome} Level ${entry.level} (Abs ${entry.absLevel}): Spawns ${entry.name} [${entry.key}]`);
}

// 2. Testing Progressive Destruction and Animation Frames for all 20 Bosses
console.log('\n--- 2. Testing 4-Tier Progressive Destruction & Animation State Machine ---');

for (const entry of expectedRoster) {
    LevelManager.setBiomeAndLevel(entry.biome, entry.level);
    const boss = new Boss();
    const totalParts = boss.targetPoints.length;

    // A. Pristine State -> Row 0 (Idle)
    drawCalls.length = 0;
    boss.draw();
    assert(drawCalls.length > 0, 'draw() must emit drawImage calls');
    const idleCall = drawCalls[drawCalls.length - 1];
    assert.strictEqual(idleCall.sy, 0, `${entry.key}: Pristine state must sample Row 0 (idle)`);

    // B. Shooting State -> Row 1 (Shoot)
    boss.muzzleFlashTimer = 1.0;
    boss.recoilX = 1.0;
    boss.update(0.016);
    drawCalls.length = 0;
    boss.draw();
    const shootCall = drawCalls[drawCalls.length - 1];
    assert.strictEqual(shootCall.sy, idleCall.sh, `${entry.key}: Shooting state must sample Row 1 (shoot)`);

    // Reset muzzle flash
    boss.muzzleFlashTimer = 0;
    boss.recoilX = 0;

    // C. Destroy Part 1 -> Row 2, Tier 1 Frame
    const part1 = boss.targetPoints[0];
    explosionsLogged.length = 0;
    boss.takeDamage(part1.maxHp, boss.x + part1.relX + 5, boss.y + part1.relY + 5);
    assert.strictEqual(part1.destroyed, true, `${entry.key}: Part 1 must be destroyed`);
    assert(explosionsLogged.some(e => e.style === 'missile_aoe'), `${entry.key}: Part destruction must spawn missile_aoe explosion`);
    assert(explosionsLogged.some(e => e.style && e.style.startsWith('explosion_')), `${entry.key}: Part destruction must spawn sprite explosion`);

    drawCalls.length = 0;
    boss.draw();
    const tier1Call = drawCalls[drawCalls.length - 1];
    assert.strictEqual(tier1Call.sy, idleCall.sh * 2, `${entry.key}: Damaged state must sample Row 2 (hit)`);
    assert.strictEqual(tier1Call.sx, 0, `${entry.key}: 1 part destroyed must display Tier 1 (Frame 0)`);

    // D. Firing while damaged -> temporarily displays Row 1, then returns to Row 2
    boss.muzzleFlashTimer = 1.0;
    boss.recoilX = 1.0;
    drawCalls.length = 0;
    boss.draw();
    const shootWhileDamagedCall = drawCalls[drawCalls.length - 1];
    assert.strictEqual(shootWhileDamagedCall.sy, idleCall.sh, `${entry.key}: Firing while damaged must display Row 1 (shoot)`);
    
    // Muzzle flash expires -> returns to Tier 1 damaged frame
    boss.muzzleFlashTimer = 0;
    boss.recoilX = 0;
    drawCalls.length = 0;
    boss.draw();
    const returnDamagedCall = drawCalls[drawCalls.length - 1];
    assert.strictEqual(returnDamagedCall.sy, idleCall.sh * 2, `${entry.key}: Must return to Row 2 (hit) after firing`);
    assert.strictEqual(returnDamagedCall.sx, 0, `${entry.key}: Must retain Tier 1 frame after firing`);

    // E. Destroy Part 2 -> Tier 2 Frame (Frame 1)
    if (totalParts >= 2) {
        const part2 = boss.targetPoints[1];
        boss.takeDamage(part2.maxHp, boss.x + part2.relX + 5, boss.y + part2.relY + 5);
        assert.strictEqual(part2.destroyed, true, `${entry.key}: Part 2 must be destroyed`);
        drawCalls.length = 0;
        boss.draw();
        const tier2Call = drawCalls[drawCalls.length - 1];
        assert.strictEqual(tier2Call.sy, idleCall.sh * 2, `${entry.key}: Damaged state must sample Row 2`);
        assert.strictEqual(tier2Call.sx, idleCall.sw, `${entry.key}: 2 parts destroyed must display Tier 2 (Frame 1)`);
    }

    // F. Destroy Part 3 -> Tier 3 Frame (Frame 2 if >= 4 parts, or Frame 3 if all 3 parts destroyed)
    if (totalParts >= 3) {
        const part3 = boss.targetPoints[2];
        boss.hp = Math.max(boss.hp, Math.round(boss.hpMax * 0.40) + part3.maxHp); // Keep boss HP > 25% for Tier 3 inspection
        boss.takeDamage(part3.maxHp, boss.x + part3.relX + 5, boss.y + part3.relY + 5);
        assert.strictEqual(part3.destroyed, true, `${entry.key}: Part 3 must be destroyed`);
        drawCalls.length = 0;
        boss.draw();
        const tier3Call = drawCalls[drawCalls.length - 1];
        assert.strictEqual(tier3Call.sy, idleCall.sh * 2, `${entry.key}: Damaged state must sample Row 2`);
        const expectedSx = (totalParts === 3) ? idleCall.sw * 3 : idleCall.sw * 2;
        assert.strictEqual(tier3Call.sx, expectedSx, `${entry.key}: 3 parts destroyed must display correct damage tier`);
    }

    // G. Critical Bare Frame -> Tier 4 Frame (Frame 3)
    boss.hp = Math.max(1, Math.floor(boss.hpMax * 0.15)); // HP <= 20% but alive
    drawCalls.length = 0;
    boss.draw();
    const tier4Call = drawCalls[drawCalls.length - 1];
    assert.strictEqual(tier4Call.sy, idleCall.sh * 2, `${entry.key}: Critical state must sample Row 2`);
    assert.strictEqual(tier4Call.sx, idleCall.sw * 3, `${entry.key}: Critical state must display Tier 4 (Frame 3)`);

    // H. Defeat -> Row 3 (Death) with Sequential Frame Progression
    explosionsLogged.length = 0;
    boss.takeDamage(boss.hp + 10, boss.x + 50, boss.y + 50);
    assert.strictEqual(boss.hp, 0, `${entry.key}: Boss must be defeated (HP = 0)`);
    assert(boss._explosionTimers.length >= 20, `${entry.key}: Must schedule 20+ cascading explosions on defeat`);

    // Frame 0 of Death (t = 0)
    drawCalls.length = 0;
    boss.draw();
    const deathCall0 = drawCalls[drawCalls.length - 1];
    assert.strictEqual(deathCall0.sy, idleCall.sh * 3, `${entry.key}: Death state must sample Row 3 (death)`);
    assert.strictEqual(deathCall0.sx, 0, `${entry.key}: Death at t=0s must sample Frame 0 (core rupture flash)`);

    // Frame 1 of Death (t = 0.2s)
    boss.update(0.20);
    drawCalls.length = 0;
    boss.draw();
    const deathCall1 = drawCalls[drawCalls.length - 1];
    assert.strictEqual(deathCall1.sx, idleCall.sw, `${entry.key}: Death at t=0.2s must sample Frame 1 (plasma fireball)`);

    // Frame 2 of Death (t = 0.38s)
    boss.update(0.18);
    drawCalls.length = 0;
    boss.draw();
    const deathCall2 = drawCalls[drawCalls.length - 1];
    assert.strictEqual(deathCall2.sx, idleCall.sw * 2, `${entry.key}: Death at t=0.38s must sample Frame 2 (shrapnel dispersion)`);

    // Frame 3 of Death (t = 0.6s)
    boss.update(0.22);
    drawCalls.length = 0;
    boss.draw();
    const deathCall3 = drawCalls[drawCalls.length - 1];
    assert.strictEqual(deathCall3.sx, idleCall.sw * 3, `${entry.key}: Death at t=0.6s must sample Frame 3 (smoke cloud)`);

    boss.cleanup();
    console.log(`  ✓ ${entry.name} (${entry.key}): Verified Row 0 (Idle) -> Row 1 (Shoot) -> Row 2 (Tiers 1-4) -> Row 3 (Death Frames 0-3)`);
}

console.log('\n================================================================');
console.log('=== ALL 20 BOSSES & SUB-BOSSES FULLY VERIFIED IN ENGINE! ===');
console.log('================================================================\n');
