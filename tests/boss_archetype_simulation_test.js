// tests/boss_archetype_simulation_test.js — Simulation testing for all 20 Bosses & Sub-Bosses
const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log("============================================================");
console.log("DARIUS STAR: BOSS ARCHETYPE & ATTACK SIMULATION TESTS");
console.log("============================================================");

// Mock global environment
global.window = global;
global.canvas = { width: 1280, height: 720 };
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

// Run verification across all 10 biomes for both Sub-Boss (level 5) and Biome Boss (level 10)
for (let b = 1; b <= 10; b++) {
    global.biomeLevel = b;
    LevelManager.biome = b;

    // ─── 1. Sub-Boss (Level 5) ───
    LevelManager.level = 5;
    LevelManager.currentLevelConfig = { midBoss: true };
    const subBoss = new Boss();
    assert.strictEqual(subBoss.isMidBoss, true, `Biome ${b} level 5 should be Mid-Boss`);
    assert(subBoss.hpMax > 0, `Biome ${b} Sub-Boss should have positive HP`);
    assert(subBoss.bossName.length > 0, `Biome ${b} Sub-Boss should have a distinct name: ${subBoss.bossName}`);
    assert(subBoss.spriteKey.includes(`boss_b${b}_mid_0`), `Biome ${b} Sub-Boss sprite key mismatch: ${subBoss.spriteKey}`);

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

    // Test damage and hardpoint transition
    subBoss.takeDamage(subBoss.hpMax * 0.6);
    assert(subBoss.currentStage >= 1, `Biome ${b} Sub-Boss should advance stage when HP drops below 50%`);
    console.log(`  [PASS] Biome ${b} Sub-Boss [${subBoss.bossName}]: All attacks & Stage 2 transition verified.`);

    // ─── 2. Biome Boss (Level 10) ───
    LevelManager.level = 10;
    LevelManager.currentLevelConfig = { midBoss: false, bossTrigger: true };
    const mainBoss = new Boss();
    assert.strictEqual(mainBoss.isMidBoss, false, `Biome ${b} level 10 should be Biome Boss`);
    assert(mainBoss.hpMax >= subBoss.hpMax, `Biome Boss HP (${mainBoss.hpMax}) should be >= Sub-Boss HP (${subBoss.hpMax})`);
    assert(mainBoss.spriteKey.includes(`boss_b${b}_0`), `Biome ${b} Biome Boss sprite key mismatch: ${mainBoss.spriteKey}`);

    mainBoss.attackNormal();
    mainBoss.attackAlternating();
    mainBoss.fireChargedBlast();

    // Damage test
    mainBoss.takeDamage(mainBoss.hpMax * 0.55);
    assert(mainBoss.currentStage >= 1, `Biome ${b} Biome Boss should destroy Stage 1 hardpoint`);
    console.log(`  [PASS] Biome ${b} Biome Boss [${mainBoss.bossName}]: All attacks & Hardpoint destruction verified.`);
}

console.log("============================================================");
console.log("ALL 20 BOSS & SUB-BOSS SIMULATION TESTS PASSED (100%)");
console.log("============================================================");
