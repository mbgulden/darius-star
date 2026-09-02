const assert = require('assert');
const fs = require('fs');

console.log('=== TEST: 5-Tier Spritesheet Architecture & Manifest Verification ===');

// 1. Verify Files on Disk
const bossKeys = ['boss_b1_mid_0', 'boss_b1_0', 'boss_b2_mid_0', 'boss_b2_0', 'boss_b3_mid_0', 'boss_b3_0', 'boss_b4_mid_0', 'boss_b4_0', 'boss_b5_mid_0', 'boss_b5_0', 'boss_b6_mid_0', 'boss_b6_0', 'boss_b7_mid_0', 'boss_b7_0', 'boss_b8_mid_0', 'boss_b8_0', 'boss_b9_mid_0', 'boss_b9_0', 'boss_b10_mid_0', 'boss_b10_0'];
for (const key of bossKeys) {
    const filePath = `assets/sprites/${key}.png`;
    assert(fs.existsSync(filePath), `Spritesheet file must exist at ${filePath}`);
    console.log(`  ✓ Spritesheet asset confirmed: ${filePath}`);
}

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
global.bossDefeated = false;
global.playSound = function() {};
global.createExplosion = function() {};
global.spawnHitFlash = function() {};
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
global.LevelManager = {
    biome: 1,
    level: 5,
    getBossHP: () => 100,
    currentLevelConfig: { midBoss: true }
};

// Load sprites and enemies modules
require('../js/sprites.js');
require('../js/enemies.js');

// 2. Verify Manifest Entry
assert(global.SPRITE_ANIMATIONS, 'SPRITE_ANIMATIONS manifest must be exported');

const requiredActions = ['idle', 'shoot', 'hit', 'death'];
const mockCtx = {
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    drawImage: (img, sx, sy, sw, sh, dx, dy, dw, dh) => {
        drawnSlices.push({ sx, sy, sw, sh, dx, dy, dw, dh });
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
let drawnSlices = [];

for (const key of bossKeys) {
    console.log(`\n--- Verifying Manifest & UV Grid for ${key} ---`);
    const animDef = global.SPRITE_ANIMATIONS[key];
    assert(animDef, `${key} must be registered in SPRITE_ANIMATIONS`);
    const expectedFrameSize = (key === 'boss_b1_0' || key === 'boss_b2_0' || key === 'boss_b4_mid_0' || key === 'boss_b4_0' || key === 'boss_b5_0' || key === 'boss_b6_mid_0' || key === 'boss_b6_0' || key === 'boss_b8_0' || key === 'boss_b9_mid_0' || key === 'boss_b10_0') ? 512 : 256;
    assert.strictEqual(animDef.frameWidth, expectedFrameSize, `Frame width must be ${expectedFrameSize}`);
    assert.strictEqual(animDef.frameHeight, expectedFrameSize, `Frame height must be ${expectedFrameSize}`);

    for (const act of requiredActions) {
        const a = animDef.actions[act];
        assert(a, `Action ${act} must be defined`);
        assert(a.frames === 4, `Action ${act} must have 4 frames`);
        assert(typeof a.row === 'number' && a.row >= 0 && a.row <= 3, `Action ${act} row must be 0-3`);
        console.log(`  ✓ Action '${act}': Row ${a.row}, ${a.frames} frames, FPS ${a.fps}, Loop ${a.loop}`);
    }

    // Test Frame UV mapping for each row
    for (let row = 0; row < 4; row++) {
        const actName = requiredActions[row];
        drawnSlices = [];
        for (let f = 0; f < 4; f++) {
            const time = f * (1.0 / animDef.actions[actName].fps) + 0.01;
            drawAnimatedSpriteSheet(mockCtx, {}, animDef, actName, time, 0, 0, 200, 200);
            const last = drawnSlices[drawnSlices.length - 1];
            assert.strictEqual(last.sx, f * expectedFrameSize, `Frame ${f} sx should be ${f * expectedFrameSize}, got ${last.sx}`);
            assert.strictEqual(last.sy, row * expectedFrameSize, `Row ${row} sy should be ${row * expectedFrameSize}, got ${last.sy}`);
            assert.strictEqual(last.sw, expectedFrameSize);
            assert.strictEqual(last.sh, expectedFrameSize);
        }
        console.log(`  ✓ UV Grid Math verified for Row ${row} (${actName}): sx=[0, ${expectedFrameSize}, ${expectedFrameSize * 2}, ${expectedFrameSize * 3}], sy=${row * expectedFrameSize}`);
    }
}

// 4. Verify In-Game Boss Draw with Animation Integration for both bosses
global.ctx = mockCtx;

// Test boss_b1_mid_0
{
    global.LevelManager.biome = 1;
    const boss1 = new Boss();
    boss1.spriteKey = 'boss_b1_mid_0';
    assert.strictEqual(boss1.isMidBoss, true);
    assert.strictEqual(boss1.targetPoints.length, 3);

    // Test idle draw
    drawnSlices = [];
    boss1.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss 1 (Trench Nautilus): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw
    boss1.targetPoints[0].hitTimer = 2.0;
    drawnSlices = [];
    boss1.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss 1 (Trench Nautilus): Boss.prototype.draw() rendered Row 2 (hit) successfully');

    // Test charge/shoot draw
    boss1.targetPoints[0].hitTimer = 0;
    boss1.state = 'charge_up';
    drawnSlices = [];
    boss1.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss 1 (Trench Nautilus): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    boss1.state = 'hover_patrol';
    boss1.hp = 0;
    drawnSlices = [];
    boss1.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss 1 (Trench Nautilus): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b1_0 (Drowned Warden)
{
    global.LevelManager.biome = 1;
    global.LevelManager.level = 10;
    global.LevelManager.currentLevelConfig = { midBoss: false };
    const bossWarden = new Boss();
    assert.strictEqual(bossWarden.spriteKey, 'boss_b1_0');
    assert.strictEqual(bossWarden.isMidBoss, false);
    assert.strictEqual(bossWarden.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    bossWarden.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss (Drowned Warden): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw (Tier 1 destruction)
    bossWarden.targetPoints[0].destroyed = true;
    drawnSlices = [];
    bossWarden.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss (Drowned Warden): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    bossWarden.targetPoints[0].destroyed = false;
    bossWarden.state = 'charge_up';
    drawnSlices = [];
    bossWarden.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss (Drowned Warden): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    bossWarden.state = 'hover_patrol';
    bossWarden.hp = 0;
    drawnSlices = [];
    bossWarden.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss (Drowned Warden): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b2_mid_0
{
    global.LevelManager.biome = 2;
    global.LevelManager.level = 5;
    global.LevelManager.currentLevelConfig = { midBoss: true };
    const boss2 = new Boss();
    boss2.spriteKey = 'boss_b2_mid_0';
    assert.strictEqual(boss2.isMidBoss, true);
    assert.strictEqual(boss2.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    boss2.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss 2 (Coral Dreadnought Core): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw
    boss2.targetPoints[0].destroyed = true;
    drawnSlices = [];
    boss2.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss 2 (Coral Dreadnought Core): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    boss2.targetPoints[0].destroyed = false;
    boss2.state = 'charge_up';
    drawnSlices = [];
    boss2.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss 2 (Coral Dreadnought Core): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    boss2.state = 'hover_patrol';
    boss2.hp = 0;
    drawnSlices = [];
    boss2.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss 2 (Coral Dreadnought Core): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b2_0 (Memory Wraith)
{
    global.LevelManager.biome = 2;
    global.LevelManager.level = 20;
    global.LevelManager.currentLevelConfig = { midBoss: false };
    const bossWraith = new Boss();
    assert.strictEqual(bossWraith.spriteKey, 'boss_b2_0');
    assert.strictEqual(bossWraith.isMidBoss, false);
    assert.strictEqual(bossWraith.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    bossWraith.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss (Memory Wraith): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw (Tier 1 destruction)
    bossWraith.targetPoints[0].destroyed = true;
    drawnSlices = [];
    bossWraith.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss (Memory Wraith): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    bossWraith.targetPoints[0].destroyed = false;
    bossWraith.state = 'charge_up';
    drawnSlices = [];
    bossWraith.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss (Memory Wraith): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    bossWraith.state = 'hover_patrol';
    bossWraith.hp = 0;
    drawnSlices = [];
    bossWraith.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss (Memory Wraith): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b3_mid_0 (Warden Mech)
{
    global.LevelManager.biome = 3;
    global.LevelManager.level = 5;
    global.LevelManager.currentLevelConfig = { midBoss: true };
    const boss3 = new Boss();
    boss3.spriteKey = 'boss_b3_mid_0';
    assert.strictEqual(boss3.isMidBoss, true);
    assert.strictEqual(boss3.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    boss3.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss 3 (Warden Mech): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw
    boss3.targetPoints[0].destroyed = true;
    drawnSlices = [];
    boss3.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss 3 (Warden Mech): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    boss3.targetPoints[0].destroyed = false;
    boss3.state = 'charge_up';
    drawnSlices = [];
    boss3.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss 3 (Warden Mech): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    boss3.state = 'hover_patrol';
    boss3.hp = 0;
    drawnSlices = [];
    boss3.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss 3 (Warden Mech): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b3_0 (Europa Cyber Coelacanth)
{
    global.LevelManager.biome = 3;
    global.LevelManager.level = 30;
    global.LevelManager.currentLevelConfig = { midBoss: false };
    const bossCoelacanth = new Boss();
    assert.strictEqual(bossCoelacanth.spriteKey, 'boss_b3_0');
    assert.strictEqual(bossCoelacanth.isMidBoss, false);
    assert.strictEqual(bossCoelacanth.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    bossCoelacanth.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss (Europa Cyber Coelacanth): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw (Tier 1 destruction)
    bossCoelacanth.targetPoints[0].destroyed = true;
    drawnSlices = [];
    bossCoelacanth.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss (Europa Cyber Coelacanth): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    bossCoelacanth.targetPoints[0].destroyed = false;
    bossCoelacanth.state = 'charge_up';
    drawnSlices = [];
    bossCoelacanth.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss (Europa Cyber Coelacanth): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    bossCoelacanth.state = 'hover_patrol';
    bossCoelacanth.hp = 0;
    drawnSlices = [];
    bossCoelacanth.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss (Europa Cyber Coelacanth): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b4_mid_0 (Nebula Leviathan)
{
    global.LevelManager.biome = 4;
    global.LevelManager.level = 35;
    global.LevelManager.currentLevelConfig = { midBoss: true };
    const bossLeviathan = new Boss();
    assert.strictEqual(bossLeviathan.spriteKey, 'boss_b4_mid_0');
    assert.strictEqual(bossLeviathan.isMidBoss, true);
    assert.strictEqual(bossLeviathan.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    bossLeviathan.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss (Nebula Leviathan): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw (Tier 1 destruction)
    bossLeviathan.targetPoints[0].destroyed = true;
    drawnSlices = [];
    bossLeviathan.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss (Nebula Leviathan): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    bossLeviathan.targetPoints[0].destroyed = false;
    bossLeviathan.state = 'charge_up';
    drawnSlices = [];
    bossLeviathan.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss (Nebula Leviathan): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    bossLeviathan.state = 'hover_patrol';
    bossLeviathan.hp = 0;
    drawnSlices = [];
    bossLeviathan.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss (Nebula Leviathan): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b5_0 (Frost Tyrant)
{
    global.LevelManager.biome = 5;
    global.LevelManager.level = 50;
    global.LevelManager.currentLevelConfig = { midBoss: false };
    const bossTyrant = new Boss();
    assert.strictEqual(bossTyrant.spriteKey, 'boss_b5_0');
    assert.strictEqual(bossTyrant.isMidBoss, false);
    assert.strictEqual(bossTyrant.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    bossTyrant.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss (Frost Tyrant): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw (Tier 1 destruction)
    bossTyrant.targetPoints[0].destroyed = true;
    drawnSlices = [];
    bossTyrant.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss (Frost Tyrant): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    bossTyrant.targetPoints[0].destroyed = false;
    bossTyrant.state = 'charge_up';
    drawnSlices = [];
    bossTyrant.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss (Frost Tyrant): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    bossTyrant.state = 'hover_patrol';
    bossTyrant.hp = 0;
    drawnSlices = [];
    bossTyrant.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss (Frost Tyrant): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b4_0 (Vortex Primus)
{
    global.LevelManager.biome = 4;
    global.LevelManager.level = 40;
    global.LevelManager.currentLevelConfig = { midBoss: false };
    const bossVortex = new Boss();
    assert.strictEqual(bossVortex.spriteKey, 'boss_b4_0');
    assert.strictEqual(bossVortex.isMidBoss, false);
    assert.strictEqual(bossVortex.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    bossVortex.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss (Vortex Primus): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw (Tier 1 destruction)
    bossVortex.targetPoints[0].destroyed = true;
    drawnSlices = [];
    bossVortex.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss (Vortex Primus): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    bossVortex.targetPoints[0].destroyed = false;
    bossVortex.state = 'charge_up';
    drawnSlices = [];
    bossVortex.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss (Vortex Primus): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    bossVortex.state = 'hover_patrol';
    bossVortex.hp = 0;
    drawnSlices = [];
    bossVortex.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss (Vortex Primus): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b6_mid_0 (Magma Behemoth)
{
    global.LevelManager.biome = 6;
    global.LevelManager.level = 55;
    global.LevelManager.currentLevelConfig = { midBoss: true };
    const bossBehemoth = new Boss();
    assert.strictEqual(bossBehemoth.spriteKey, 'boss_b6_mid_0');
    assert.strictEqual(bossBehemoth.isMidBoss, true);
    assert.strictEqual(bossBehemoth.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    bossBehemoth.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss (Magma Behemoth): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw (Tier 1 destruction)
    bossBehemoth.targetPoints[0].destroyed = true;
    drawnSlices = [];
    bossBehemoth.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss (Magma Behemoth): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    bossBehemoth.targetPoints[0].destroyed = false;
    bossBehemoth.state = 'charge_up';
    drawnSlices = [];
    bossBehemoth.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss (Magma Behemoth): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    bossBehemoth.state = 'hover_patrol';
    bossBehemoth.hp = 0;
    drawnSlices = [];
    bossBehemoth.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss (Magma Behemoth): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b5_mid_0 (Glacial Juggernaut)
{
    global.LevelManager.biome = 5;
    global.LevelManager.level = 45;
    global.LevelManager.currentLevelConfig = { midBoss: true };
    const bossJuggernaut = new Boss();
    assert.strictEqual(bossJuggernaut.spriteKey, 'boss_b5_mid_0');
    assert.strictEqual(bossJuggernaut.isMidBoss, true);
    assert.strictEqual(bossJuggernaut.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    bossJuggernaut.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss (Glacial Juggernaut): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw (Tier 1 destruction)
    bossJuggernaut.targetPoints[0].destroyed = true;
    drawnSlices = [];
    bossJuggernaut.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss (Glacial Juggernaut): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    bossJuggernaut.targetPoints[0].destroyed = false;
    bossJuggernaut.state = 'charge_up';
    drawnSlices = [];
    bossJuggernaut.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss (Glacial Juggernaut): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    bossJuggernaut.state = 'hover_patrol';
    bossJuggernaut.hp = 0;
    drawnSlices = [];
    bossJuggernaut.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss (Glacial Juggernaut): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b6_0 (Inferno Dragon)
{
    global.LevelManager.biome = 6;
    global.LevelManager.level = 60;
    global.LevelManager.currentLevelConfig = { midBoss: false };
    const bossDragon = new Boss();
    assert.strictEqual(bossDragon.spriteKey, 'boss_b6_0');
    assert.strictEqual(bossDragon.isMidBoss, false);
    assert.strictEqual(bossDragon.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    bossDragon.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss (Inferno Dragon): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw (Tier 1 destruction)
    bossDragon.targetPoints[0].destroyed = true;
    drawnSlices = [];
    bossDragon.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss (Inferno Dragon): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    bossDragon.targetPoints[0].destroyed = false;
    bossDragon.state = 'charge_up';
    drawnSlices = [];
    bossDragon.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss (Inferno Dragon): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    bossDragon.state = 'hover_patrol';
    bossDragon.hp = 0;
    drawnSlices = [];
    bossDragon.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss (Inferno Dragon): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b8_mid_0 (Flagship Hangar)
{
    global.LevelManager.biome = 8;
    global.LevelManager.level = 75;
    global.LevelManager.currentLevelConfig = { midBoss: true };
    const bossHangar = new Boss();
    assert.strictEqual(bossHangar.spriteKey, 'boss_b8_mid_0');
    assert.strictEqual(bossHangar.isMidBoss, true);
    assert.strictEqual(bossHangar.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    bossHangar.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss (Flagship Hangar): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw (Tier 1 destruction)
    bossHangar.targetPoints[0].destroyed = true;
    drawnSlices = [];
    bossHangar.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss (Flagship Hangar): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    bossHangar.targetPoints[0].destroyed = false;
    bossHangar.state = 'charge_up';
    drawnSlices = [];
    bossHangar.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss (Flagship Hangar): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    bossHangar.state = 'hover_patrol';
    bossHangar.hp = 0;
    drawnSlices = [];
    bossHangar.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss (Flagship Hangar): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b8_0 (Iron Ghost)
{
    global.LevelManager.biome = 8;
    global.LevelManager.level = 80;
    global.LevelManager.currentLevelConfig = { midBoss: false };
    const bossIronGhost = new Boss();
    assert.strictEqual(bossIronGhost.spriteKey, 'boss_b8_0');
    assert.strictEqual(bossIronGhost.isMidBoss, false);
    assert.strictEqual(bossIronGhost.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    bossIronGhost.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss (Iron Ghost): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw (Tier 1 destruction)
    bossIronGhost.targetPoints[0].destroyed = true;
    drawnSlices = [];
    bossIronGhost.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss (Iron Ghost): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    bossIronGhost.targetPoints[0].destroyed = false;
    bossIronGhost.state = 'charge_up';
    drawnSlices = [];
    bossIronGhost.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss (Iron Ghost): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    bossIronGhost.state = 'hover_patrol';
    bossIronGhost.hp = 0;
    drawnSlices = [];
    bossIronGhost.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss (Iron Ghost): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b9_mid_0 (Hive Queen Sub-Core)
{
    global.LevelManager.biome = 9;
    global.LevelManager.level = 85;
    global.LevelManager.currentLevelConfig = { midBoss: true };
    const bossQueen = new Boss();
    assert.strictEqual(bossQueen.spriteKey, 'boss_b9_mid_0');
    assert.strictEqual(bossQueen.isMidBoss, true);
    assert.strictEqual(bossQueen.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    bossQueen.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss (Hive Queen Sub-Core): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw (Tier 1 destruction)
    bossQueen.targetPoints[0].destroyed = true;
    drawnSlices = [];
    bossQueen.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss (Hive Queen Sub-Core): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    bossQueen.targetPoints[0].destroyed = false;
    bossQueen.state = 'charge_up';
    drawnSlices = [];
    bossQueen.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss (Hive Queen Sub-Core): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    bossQueen.state = 'hover_patrol';
    bossQueen.hp = 0;
    drawnSlices = [];
    bossQueen.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss (Hive Queen Sub-Core): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b9_0 (Hive Mind Overmind)
{
    global.LevelManager.biome = 9;
    global.LevelManager.level = 90;
    global.LevelManager.currentLevelConfig = { midBoss: false };
    const bossOvermind = new Boss();
    assert.strictEqual(bossOvermind.spriteKey, 'boss_b9_0');
    assert.strictEqual(bossOvermind.isMidBoss, false);
    assert.strictEqual(bossOvermind.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    bossOvermind.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss (Hive Mind Overmind): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw (Tier 1 destruction)
    bossOvermind.targetPoints[0].destroyed = true;
    drawnSlices = [];
    bossOvermind.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss (Hive Mind Overmind): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    bossOvermind.targetPoints[0].destroyed = false;
    bossOvermind.state = 'charge_up';
    drawnSlices = [];
    bossOvermind.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss (Hive Mind Overmind): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    bossOvermind.state = 'hover_patrol';
    bossOvermind.hp = 0;
    drawnSlices = [];
    bossOvermind.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss (Hive Mind Overmind): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b10_mid_0 (Paradox Singularity Gate)
{
    global.LevelManager.biome = 10;
    global.LevelManager.level = 95;
    global.LevelManager.currentLevelConfig = { midBoss: true };
    const bossGate = new Boss();
    assert.strictEqual(bossGate.spriteKey, 'boss_b10_mid_0');
    assert.strictEqual(bossGate.isMidBoss, true);
    assert.strictEqual(bossGate.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    bossGate.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss (Paradox Singularity Gate): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw (Tier 1 destruction)
    bossGate.targetPoints[0].destroyed = true;
    drawnSlices = [];
    bossGate.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss (Paradox Singularity Gate): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    bossGate.targetPoints[0].destroyed = false;
    bossGate.state = 'charge_up';
    drawnSlices = [];
    bossGate.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss (Paradox Singularity Gate): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    bossGate.state = 'hover_patrol';
    bossGate.hp = 0;
    drawnSlices = [];
    bossGate.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss (Paradox Singularity Gate): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b10_0 (The Primordial Singularity)
{
    global.LevelManager.biome = 10;
    global.LevelManager.level = 100;
    global.LevelManager.currentLevelConfig = { midBoss: false };
    const bossSingularity = new Boss();
    assert.strictEqual(bossSingularity.spriteKey, 'boss_b10_0');
    assert.strictEqual(bossSingularity.isMidBoss, false);
    assert.strictEqual(bossSingularity.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    bossSingularity.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss (The Primordial Singularity): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw (Tier 1 destruction)
    bossSingularity.targetPoints[0].destroyed = true;
    drawnSlices = [];
    bossSingularity.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss (The Primordial Singularity): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    bossSingularity.targetPoints[0].destroyed = false;
    bossSingularity.state = 'charge_up';
    drawnSlices = [];
    bossSingularity.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss (The Primordial Singularity): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    bossSingularity.state = 'hover_patrol';
    bossSingularity.hp = 0;
    drawnSlices = [];
    bossSingularity.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss (The Primordial Singularity): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b7_mid_0 (Storm Emperor Cruiser)
{
    global.LevelManager.biome = 7;
    global.LevelManager.level = 65;
    global.LevelManager.currentLevelConfig = { midBoss: true };
    const bossStormCruiser = new Boss();
    assert.strictEqual(bossStormCruiser.spriteKey, 'boss_b7_mid_0');
    assert.strictEqual(bossStormCruiser.isMidBoss, true);
    assert.strictEqual(bossStormCruiser.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    bossStormCruiser.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss (Storm Emperor Cruiser): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw (Tier 1 destruction)
    bossStormCruiser.targetPoints[0].destroyed = true;
    drawnSlices = [];
    bossStormCruiser.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss (Storm Emperor Cruiser): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    bossStormCruiser.targetPoints[0].destroyed = false;
    bossStormCruiser.state = 'charge_up';
    drawnSlices = [];
    bossStormCruiser.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss (Storm Emperor Cruiser): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    bossStormCruiser.state = 'hover_patrol';
    bossStormCruiser.hp = 0;
    drawnSlices = [];
    bossStormCruiser.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss (Storm Emperor Cruiser): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// Test boss_b7_0 (Storm-Singer)
{
    global.LevelManager.biome = 7;
    global.LevelManager.level = 70;
    global.LevelManager.currentLevelConfig = { midBoss: false };
    const bossStormSinger = new Boss();
    assert.strictEqual(bossStormSinger.spriteKey, 'boss_b7_0');
    assert.strictEqual(bossStormSinger.isMidBoss, false);
    assert.strictEqual(bossStormSinger.targetPoints.length, 4);

    // Test idle draw
    drawnSlices = [];
    bossStormSinger.draw();
    assert(drawnSlices.length > 0, 'Boss draw should blit animated sprite');
    assert.strictEqual(drawnSlices[0].sy, 0, 'Idle should draw Row 0 (sy=0)');
    console.log('  ✓ Boss (Storm-Singer): Boss.prototype.draw() rendered Row 0 (idle) successfully');

    // Test hit draw (Tier 1 destruction)
    bossStormSinger.targetPoints[0].destroyed = true;
    drawnSlices = [];
    bossStormSinger.draw();
    assert.strictEqual(drawnSlices[0].sy, 1024, 'Hit should draw Row 2 (sy=1024)');
    console.log('  ✓ Boss (Storm-Singer): Boss.prototype.draw() rendered Row 2 (hit Tier 1) successfully');

    // Test charge/shoot draw
    bossStormSinger.targetPoints[0].destroyed = false;
    bossStormSinger.state = 'charge_up';
    drawnSlices = [];
    bossStormSinger.draw();
    assert.strictEqual(drawnSlices[0].sy, 512, 'Charge/shoot should draw Row 1 (sy=512)');
    console.log('  ✓ Boss (Storm-Singer): Boss.prototype.draw() rendered Row 1 (charge/shoot) successfully');

    // Test death draw
    bossStormSinger.state = 'hover_patrol';
    bossStormSinger.hp = 0;
    drawnSlices = [];
    bossStormSinger.draw();
    assert.strictEqual(drawnSlices[0].sy, 1536, 'Death should draw Row 3 (sy=1536)');
    console.log('  ✓ Boss (Storm-Singer): Boss.prototype.draw() rendered Row 3 (death) successfully');
}

// 5. Verify 40 Stratum Enemy Archetypes
console.log('\n--- Verifying 40 Stratum Enemy Archetypes ---');
const stratumKeys = [
    'angler_scout', 'jelly_interceptor', 'vent_crab_heavy', 'trench_eel',
    'rust_drone', 'coral_wasp', 'armored_eel', 'spine_urchin',
    'sparker', 'sentinel', 'juggernaut', 'boss_minion',
    'plasma_wisp', 'storm_sprite', 'gas_giant', 'nebula_wraith',
    'ice_shard', 'frost_drone', 'glacier', 'ice_swarm',
    'ember_sprite', 'magma_wasp', 'lava_golem', 'inferno_node',
    'static_spark', 'storm_hawk', 'thunderhead', 'storm_sentinel',
    'salvage_drone', 'ghost_fighter', 'turret_battery', 'fleet_turret',
    'crawler', 'spitter', 'brute', 'hive_node',
    'null_entity', 'glitch_fragment', 'rift_aberration', 'paradox_wisp'
];
assert.strictEqual(stratumKeys.length, 40, 'Must have exactly 40 stratum enemies');
for (const sKey of stratumKeys) {
    assert(global.enemySprites[sKey], `Enemy archetype '${sKey}' must be registered in enemySprites`);
}
console.log(`  ✓ All 40 Stratum Enemy Archetypes verified in enemySprites registry!`);

console.log('\nALL 5-TIER SPRITESHEET & ENEMY ASSET TESTS PASSED SUCCESSFULLY!');





