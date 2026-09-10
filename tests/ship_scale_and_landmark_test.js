// tests/ship_scale_and_landmark_test.js — Ship scale rules, glow tuning, and landmark background tests
const assert = require('assert');

console.log("============================================================");
console.log("DARIUS STAR: SHIP SCALING & LANDMARK VISUAL RULES AUDIT");
console.log("============================================================");

// Mock globals for Node environment
global.window = global;
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};
global.canvas = { width: 960, height: 540 };
global.ctx = {
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    drawImage: () => {},
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    shadowBlur: 0,
    shadowColor: 'transparent',
    globalAlpha: 1.0
};
global.Image = class {
    constructor() {
        this.src = '';
        this.complete = true;
        this.naturalWidth = 256;
        this.naturalHeight = 256;
    }
};
global.document = {
    createElement: () => ({
        getContext: () => global.ctx,
        width: 800,
        height: 450
    })
};
global.mulberry32 = () => () => 0.5;
global.runSeed = 1337;
global.difficulty = 'normal';
global.enemyIdCounter = 0;
global.particles = [];
global.envParticles = [];
global.vfxSprites = {};
global.landmarkSprites = {};
global.LevelManager = { biome: 1, level: 1 };

// Load modules in dependency order
require('../js/levels/biome_data.js');
require('../js/player.js');
require('../js/enemies.js');
require('../js/renderer/parallax.js');

let testsPassed = 0;
let totalTests = 0;

function test(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  ✅ [PASS] ${name}`);
        testsPassed++;
    } catch (e) {
        console.error(`  ❌ [FAIL] ${name}: ${e.message}`);
        console.error(e.stack);
    }
}

// ─── 1. PLAYER SHIP CLASS SCALING RULES ──────────────────────────────
console.log("\n1. Auditing Player Ship Class Rules & Scaling (Min +20%)...");

test("Player ship classes defined and all >= +20% scale over 44x44 base", () => {
    assert(window.PLAYER_SHIP_CLASS_RULES, "PLAYER_SHIP_CLASS_RULES must be defined");
    const baseline = 44;
    const classes = ['scout', 'phantom', 'specter', 'nyxa', 'interceptor', 'tempest', 'warden', 'bastion', 'heavy'];
    
    classes.forEach(cls => {
        const rules = window.getPlayerShipRules(cls);
        assert(rules, `Rules must exist for ${cls}`);
        const scaleFactor = rules.width / baseline;
        assert(scaleFactor >= 1.20, `Ship class ${cls} must be at least +20% (got width ${rules.width}, scale ${scaleFactor.toFixed(2)})`);
        assert(rules.renderSize >= rules.width, `renderSize ${rules.renderSize} must accommodate hitbox width ${rules.width}`);
        assert(rules.shieldRadius >= 40, `shieldRadius ${rules.shieldRadius} must scale with larger chassis`);
    });
});

test("Heavier player chassis scale progressively higher than light chassis", () => {
    const scoutRules = window.getPlayerShipRules('scout');
    const nyxaRules = window.getPlayerShipRules('nyxa');
    const wardenRules = window.getPlayerShipRules('warden');
    const bastionRules = window.getPlayerShipRules('bastion');

    assert(bastionRules.width > wardenRules.width, "Bastion dreadnought must be larger than Warden frigate");
    assert(wardenRules.width > nyxaRules.width, "Warden frigate must be larger than Nyxa medium fighter");
    assert(nyxaRules.width >= scoutRules.width, "Nyxa medium fighter must be >= Scout light fighter");
    assert(bastionRules.width === 64 && bastionRules.renderSize === 72, "Bastion must be 64x64 hitbox, 72px render (+45%)");
});

test("Player ship instance inherits class rules and hitbox upon instantiation", () => {
    const pScout = new Player('scout', 1);
    assert.strictEqual(pScout.width, 54);
    assert.strictEqual(pScout.height, 54);

    const pBastion = new Player('bastion', 1);
    assert.strictEqual(pBastion.width, 64);
    assert.strictEqual(pBastion.height, 64);
    assert.strictEqual(pBastion.shieldRadius, 48);
});

// ─── 2. ENEMY SHIP CLASS SCALING RULES ──────────────────────────────
console.log("\n2. Auditing Enemy Ship Class Rules & Scaling (Min +20%)...");

test("Enemy ship classes defined and all >= +20% scale over base archetypes", () => {
    assert(window.ENEMY_CLASS_RULES, "ENEMY_CLASS_RULES must be defined");
    
    // Original base sizes: scout 38, interceptor 40, hazard 42, heavy 52, boss_minion 34
    const checks = [
        { type: 'scout', bp: 'scout', base: 38, minW: 46 },
        { type: 'interceptor', bp: 'interceptor', base: 40, minW: 52 },
        { type: 'hazard', bp: 'hazard', base: 42, minW: 58 },
        { type: 'trench_eel', bp: 'hazard', base: 42, minW: 64 },
        { type: 'heavy', bp: 'heavy', base: 52, minW: 76 },
        { type: 'lava_golem', bp: 'heavy', base: 52, minW: 82 },
        { type: 'boss_minion', bp: 'boss_minion', base: 34, minW: 42 }
    ];

    checks.forEach(c => {
        const rules = window.getEnemyClassRules(c.type, c.bp);
        assert(rules, `Rules must exist for ${c.type}`);
        const scaleFactor = rules.width / c.base;
        assert(scaleFactor >= 1.20, `Enemy archetype ${c.type} must be at least +20% (got ${rules.width} vs base ${c.base}, scale ${scaleFactor.toFixed(2)})`);
        assert(rules.width >= c.minW, `Enemy archetype ${c.type} width ${rules.width} >= ${c.minW}`);
    });
});

test("Behemoths and titanic heavies scale up to 82x82 (+58%)", () => {
    const titans = ['gas_giant', 'glacier', 'lava_golem', 'null_entity', 'thunderhead', 'juggernaut'];
    titans.forEach(t => {
        const rules = window.getEnemyClassRules(t, 'heavy');
        assert.strictEqual(rules.width, 82, `Titan ${t} must be 82x82`);
        assert.strictEqual(rules.renderSize, 82, `Titan ${t} render size must be 82`);
    });
});

test("Enemy instance sets dimensions and calibrated muzzle hardpoints on spawn", () => {
    const eScout = new Enemy('scout');
    assert.strictEqual(eScout.width, 46);
    assert.strictEqual(eScout.height, 46);
    assert.strictEqual(eScout.muzzleOffsets.length, 1);

    const eHeavy = new Enemy('vent_crab_heavy');
    assert.strictEqual(eHeavy.width, 76);
    assert.strictEqual(eHeavy.height, 76);
    assert.strictEqual(eHeavy.muzzleOffsets.length, 2); // Twin heavy battery
});

test("Boss scaling: Mid-boss is 188x188 (+25%) and Biome Boss is 240x170 (+26%)", () => {
    const midBoss = new Boss(1, 5);
    midBoss.isMidBoss = true;
    midBoss.width = 188;
    midBoss.height = 188;
    assert.strictEqual(midBoss.width, 188);
    assert.strictEqual(midBoss.height, 188);

    const biomeBoss = new Boss(1, 10);
    assert.strictEqual(biomeBoss.width, 240);
    assert.strictEqual(biomeBoss.height, 170);
});

// ─── 3. ENEMY OUTER GLOW TONING & BIOME THEME MATCHING ──────────────
console.log("\n3. Auditing Enemy Outer Glow Toning & Biome Color Themes...");

test("Enemy outer glow blur is toned down to 3-5 (down from 8-10)", () => {
    const scoutRules = window.getEnemyClassRules('scout', 'scout');
    const interceptorRules = window.getEnemyClassRules('interceptor', 'interceptor');
    const heavyRules = window.getEnemyClassRules('heavy', 'heavy');

    assert(scoutRules.glowBlur <= 4, `Scout glowBlur ${scoutRules.glowBlur} must be <= 4`);
    assert(interceptorRules.glowBlur <= 4, `Interceptor glowBlur ${interceptorRules.glowBlur} must be <= 4`);
    assert(heavyRules.glowBlur <= 5, `Heavy glowBlur ${heavyRules.glowBlur} must be <= 5`);
});

test("getBiomeLevelThemeColor returns distinct theme colors for all 10 biomes", () => {
    for (let b = 1; b <= 10; b++) {
        for (let l = 1; l <= 10; l++) {
            const color = window.getBiomeLevelThemeColor(b, l);
            assert(color && color.startsWith('#'), `Biome ${b} Level ${l} must return a hex color (got ${color})`);
        }
    }
});

test("Enemy instance resolves biome level theme glow color dynamically", () => {
    const e = new Enemy('scout');
    e.biome = 2;
    e.level = 4;
    const expected = window.getBiomeLevelThemeColor(2, 4);
    assert.strictEqual(expected, '#ff2a8d', "Biome 2 level 4 accent color should match BIOME_DATA (#ff2a8d)");
});

// ─── 4. LANDMARK STRUCTURE BACKGROUND & NO-GLOW RULES ───────────────
console.log("\n4. Auditing Landmark Background & Non-Glowing Rules...");

test("Landmark is non-destructible by default and has no outer glow", () => {
    const landmark = new JourneyLandmark(1, 1);
    assert.strictEqual(landmark.isDestructible, false, "Landmarks must be non-destructible by default");

    // Test draw on mock ctx with captured property mutations
    let capturedBlur = -1;
    let capturedColor = '';
    const mockCtx = Object.create(global.ctx);
    Object.defineProperty(mockCtx, 'shadowBlur', {
        set(v) { capturedBlur = v; },
        get() { return capturedBlur; }
    });
    Object.defineProperty(mockCtx, 'shadowColor', {
        set(v) { capturedColor = v; },
        get() { return capturedColor; }
    });

    landmark.draw(mockCtx);
    assert.strictEqual(capturedBlur, 0, "Non-destructible landmark must set shadowBlur to 0");
    assert.strictEqual(capturedColor, 'transparent', "Non-destructible landmark must set shadowColor to 'transparent'");
});

test("JourneyBackgroundRenderer separates background from foreground landmarks", () => {
    JourneyBackgroundRenderer.setLevel(1, 1);
    assert(JourneyBackgroundRenderer.currentLandmark, "currentLandmark must be initialized");
    assert.strictEqual(JourneyBackgroundRenderer.currentLandmark.isDestructible, false);

    let bgDrawn = false;
    let fgDrawn = false;

    JourneyBackgroundRenderer.currentLandmark.draw = () => { bgDrawn = true; };
    JourneyBackgroundRenderer.draw(global.ctx);
    assert.strictEqual(bgDrawn, true, "Non-destructible landmark must draw in background pass");

    JourneyBackgroundRenderer.drawForeground(global.ctx);
    // bgDrawn should not be retriggered by foreground
    JourneyBackgroundRenderer.currentLandmark.isDestructible = true;
    JourneyBackgroundRenderer.currentLandmark.draw = () => { fgDrawn = true; };
    bgDrawn = false;

    JourneyBackgroundRenderer.draw(global.ctx);
    assert.strictEqual(bgDrawn, false, "Destructible landmark must NOT draw in background pass");

    JourneyBackgroundRenderer.drawForeground(global.ctx);
    assert.strictEqual(fgDrawn, true, "Destructible landmark MUST draw in foreground pass");
});

console.log(`\n============================================================`);
console.log(`AUDIT COMPLETE: ${testsPassed} / ${totalTests} tests passed (${Math.round(testsPassed / totalTests * 100)}%)`);
console.log(`============================================================\n`);

if (testsPassed !== totalTests) {
    process.exit(1);
}
