// tests/boss_archetype_simulation_test.js — Simulation testing for all 20 Bosses & Sub-Bosses
const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log("============================================================");
console.log("DARIUS STAR: BOSS ARCHETYPE & TARGET POINT SIMULATION TESTS");
console.log("============================================================");

// Mock global environment
global.window = global;
global.window.addEventListener = () => {};
global.Image = class { constructor() { this.src = ''; } };
const dummyEl = { addEventListener: () => {}, removeEventListener: () => {}, style: {}, classList: { add: ()=>{}, remove: ()=>{} } };
global.document = { getElementById: () => dummyEl, addEventListener: () => {} };
global.canvas = { width: 1280, height: 720, addEventListener: () => {} };
global.enemyIdCounter = 0;
global.enemyBullets = [];
global.enemies = [];
global.bullets = [];
global.scrapDrops = [];
global.floatingTexts = [];
global.score = 0;
global.runScrap = 0;
global.bossesDefeated = 0;
global.bossDefeated = false;
global.bossSpawned = true;
global.bossIntroPlaying = false;
global.sirenTimer = 0;
global.enemySpawnTimer = 0;
global.bossSprites = {};

global.playSound = (name, opts) => {};
global.createExplosion = (x, y, color, size, style) => {};
global.spawnHitFlash = (x, y, type) => {};
global.mulberry32 = (seed) => () => 0.5;
global.runSeed = 1337;

global.getCurrentDifficultyConfig = () => ({
    id: 'normal',
    enemyHpMultiplier: 1.0,
    enemySpeedMultiplier: 1.0,
    enemyFireRateMultiplier: 1.0,
    bossHpMultiplier: 1.0
});

global.BIOME_DATA = {
    bossHP: {
        1: { midBoss: 60, biomeBoss: 120 },
        2: { midBoss: 80, biomeBoss: 150 },
        3: { midBoss: 100, biomeBoss: 200 },
        4: { midBoss: 120, biomeBoss: 180 },
        5: { midBoss: 140, biomeBoss: 200 },
        6: { midBoss: 160, biomeBoss: 220 },
        7: { midBoss: 180, biomeBoss: 240 },
        8: { midBoss: 200, biomeBoss: 260 },
        9: { midBoss: 220, biomeBoss: 280 },
        10: { midBoss: 240, biomeBoss: 400 }
    }
};

global.LevelManager = {
    biome: 1,
    level: 1,
    currentLevelConfig: {},
    getBossHP: function() {
        const hp = BIOME_DATA.bossHP[this.biome];
        return this.level === 5 ? hp.midBoss : hp.biomeBoss;
    },
    advanceLevel: function() {
        this.level++;
    }
};

global.FloatingText = class {
    constructor(x, y, text, color) {
        this.text = text;
    }
};

// Load enemies.js
const enemiesCode = fs.readFileSync(path.join(__dirname, '../js/enemies.js'), 'utf8');
eval(enemiesCode);

// Load ui.js helper functions
const uiCode = fs.readFileSync(path.join(__dirname, '../js/ui.js'), 'utf8');
eval(uiCode);

// Run verification across all 10 biomes for both Sub-Boss (level 5) and Biome Boss (level 10)
for (let b = 1; b <= 10; b++) {
    global.biomeLevel = b;
    LevelManager.biome = b;

    // ─── 1. Sub-Boss (Level 5) ───
    LevelManager.level = 5;
    LevelManager.currentLevelConfig = { midBoss: true };
    const subBoss = new Boss();
    assert.strictEqual(subBoss.isMidBoss, true, `Biome ${b} level 5 should be Mid-Boss`);
    assert(subBoss.targetPoints.length >= 2, `Biome ${b} Sub-Boss should have at least 2 discrete target points`);
    
    // Test localized target point hit
    const tp0 = subBoss.targetPoints[0];
    const hitX = subBoss.x + tp0.relX + 5;
    const hitY = subBoss.y + tp0.relY + 5;
    const tp0HpBefore = tp0.hp;
    subBoss.takeDamage(10, hitX, hitY);
    assert(tp0.hp < tp0HpBefore, `Biome ${b} Sub-Boss target point ${tp0.name} should take localized damage`);
    assert(tp0.hitTimer > 0, `Biome ${b} Sub-Boss target point should illuminate mini health bar (hitTimer > 0)`);

    // Test attacks
    const bCountBefore = enemyBullets.length;
    subBoss.attackNormal();
    assert(enemyBullets.length > bCountBefore, `Biome ${b} Sub-Boss normal attack should spawn bullets`);

    const bCountBeforeAlt = enemyBullets.length;
    subBoss.attackAlternating();
    assert(enemyBullets.length > bCountBeforeAlt, `Biome ${b} Sub-Boss alternating attack should spawn bullets`);

    const bCountBeforeCharge = enemyBullets.length;
    subBoss.fireChargedBlast();
    assert(enemyBullets.length > bCountBeforeCharge, `Biome ${b} Sub-Boss charged blast should spawn bullets`);

    // Test flight state machine and ambush dive
    subBoss.state = 'offscreen_dive';
    subBoss.update(0.5);
    subBoss.state = 'ambush_warning';
    subBoss.update(2.0);
    assert.strictEqual(subBoss.state, 'ambush_charge', `Biome ${b} Sub-Boss should transition to ambush charge after warning`);

    console.log(`  [PASS] Biome ${b} Sub-Boss [${subBoss.bossName}]: Target Points [${subBoss.targetPoints.map(t=>t.name).join(', ')}] & Ambush Loop verified.`);

    // ─── 2. Biome Boss (Level 10) ───
    LevelManager.level = 10;
    LevelManager.currentLevelConfig = { midBoss: false, bossTrigger: true };
    const mainBoss = new Boss();
    assert.strictEqual(mainBoss.isMidBoss, false, `Biome ${b} level 10 should be Biome Boss`);
    assert(mainBoss.targetPoints.length >= 2, `Biome ${b} Biome Boss should have discrete target points`);

    // Test target point destruction
    const p0 = mainBoss.targetPoints[0];
    mainBoss.takeDamage(p0.maxHp + 5, mainBoss.x + p0.relX, mainBoss.y + p0.relY);
    assert(p0.destroyed, `Biome ${b} Biome Boss target point ${p0.name} should be destroyed when depleted`);
    assert(mainBoss.currentStage >= 1, `Biome ${b} Biome Boss should advance stage on target point destruction`);

    // Test lunge movement
    mainBoss.state = 'target_lunge';
    mainBoss.stateTimer = 0.05;
    mainBoss.update(0.1);
    assert.strictEqual(mainBoss.state, 'retreat_bank', `Biome ${b} Biome Boss should retreat after forward lunge`);

    console.log(`  [PASS] Biome ${b} Biome Boss [${mainBoss.bossName}]: Target Points [${mainBoss.targetPoints.map(t=>t.name).join(', ')}] & Hardpoint Destruction verified.`);
}

console.log("============================================================");
console.log("ALL 20 BOSS TARGET POINTS & AMBUSH SIMULATIONS PASSED (100%)");
console.log("============================================================");
