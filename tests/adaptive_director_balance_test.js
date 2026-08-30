// tests/adaptive_director_balance_test.js — Adaptive Director Balance Test Suite (GRO-4304)
const assert = require('assert');

console.log('============================================================');
console.log('DARIUS STAR: ADAPTIVE PACING DIRECTOR & ECONOMY TESTS');
console.log('============================================================');

global.window = {};
require('../js/levels/adaptive_director.js');
const ad = global.AdaptiveDirector;
assert(ad, 'AdaptiveDirector must be defined');

console.log('1. Testing Initial Clean Sector State (Attempt 1)...');
ad.resetSectorMetrics(1);
const initialFactors = ad.getScalingFactors('normal');
assert.strictEqual(initialFactors.bulletSpeedMult, 1.0, 'Initial bulletSpeedMult must be 1.0');
assert.strictEqual(initialFactors.enemyHpMult, 1.0, 'Initial enemyHpMult must be 1.0');
assert.strictEqual(initialFactors.scrapBonusMult, 1.0, 'Initial scrapBonusMult must be 1.0');
console.log('  [PASS] Initial state on Normal difficulty: 100% baseline speed, HP, and scrap.');

console.log('2. Testing Dynamic Assist on Repeat Sector Wipes (Attempt 3)...');
ad.resetSectorMetrics(3);
const assistedFactors = ad.getScalingFactors('normal');
assert(assistedFactors.bulletSpeedMult < 1.0, 'Bullet speed must be softened on Attempt 3');
assert(assistedFactors.scrapBonusMult > 1.0, 'Scrap drop bonus must be increased on Attempt 3');
assert(assistedFactors.emergencyNaniteChance > 0.10, 'Nanite drop chance must scale up on Attempt 3');
console.log(`  [PASS] Attempt 3 Adaptive Assist: Bullet Speed = ${(assistedFactors.bulletSpeedMult * 100).toFixed(0)}%, Scrap Bonus = +${((assistedFactors.scrapBonusMult - 1) * 100).toFixed(0)}%, Nanite Chance = ${(assistedFactors.emergencyNaniteChance * 100).toFixed(0)}%`);

console.log('3. Testing Hardcore Difficulty Purity (Ace / Cyber)...');
const aceFactors = ad.getScalingFactors('ace');
assert.strictEqual(aceFactors.bulletSpeedMult, 1.0, 'Ace difficulty must not receive bullet speed assistance');
assert.strictEqual(aceFactors.scrapBonusMult, 1.0, 'Ace difficulty must not receive scrap bonus assistance');
console.log('  [PASS] Ace / Cyber difficulties strictly bypass adaptive assistance.');

console.log('4. Testing Precursor High-Yield Quantum Salvage Node Spawning...');
const b1Drop = ad.getHighYieldNodeDrop(1);
assert.strictEqual(b1Drop, null, 'Early biomes should not spawn high-yield quantum clusters');
const b7Drop = ad.getHighYieldNodeDrop(7);
assert(b7Drop && b7Drop.scrapValue === 150, 'Biome 7 quantum cluster must yield 150 scrap');
const b10Drop = ad.getHighYieldNodeDrop(10);
assert(b10Drop && b10Drop.scrapValue === 450, 'Biome 10 quantum cluster must yield 450 scrap');
console.log(`  [PASS] Precursor Salvage Nodes: Biome 7 = 💎 +${b7Drop.scrapValue} SCRAP, Biome 10 = 💎 +${b10Drop.scrapValue} SCRAP`);

console.log('============================================================');
console.log('ALL ADAPTIVE DIRECTOR & BALANCE TESTS PASSED (100%)');
console.log('============================================================');
