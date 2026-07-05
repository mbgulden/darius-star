const assert = require('assert');
const path = require('path');

// Mock browser global environment
global.window = global;
global.canvas = { width: 800, height: 600 };
global.enemies = [];
global.runSeed = 12345;
global.BIOME_DATA = {
  enemies: { 1: { scout:'angler_scout', interceptor:'jelly_interceptor', heavy:'vent_crab_heavy', alt:'angler_scout' } },
  names: { 1:'Abyssal Trench' },
  bossHP: { 1:{ midBoss:60, biomeBoss:120 } }
};
global.Enemy = class Enemy {
  constructor(type) {
    this.type = type;
    this.hp = type === 'vent_crab_heavy' ? 4 : 1;
    this.speed = 100;
  }
};
global.playSound = () => {};

// Mock Multiplayer module
global.Multiplayer = {
  count: 1
};

// Load LevelManager
const lmPath = path.resolve(__dirname, '../js/level_manager.js');
require(lmPath);

function runScalingTest() {
  console.log("Running Multiplayer Scaling Unit Tests...");

  // Set Biome 1, Level 1
  LevelManager.setBiomeAndLevel(1, 1);

  // Scenario A: 1 Player
  Multiplayer.count = 1;
  assert.strictEqual(LevelManager._waveEnemyCount(), 7, "Base wave count should be 7 for 1 player (4 + 1.5 + 2)");
  assert.strictEqual(LevelManager._multiplayerCountMultiplier(), 1.0, "Count multiplier should be 1.0 for 1 player");
  assert.strictEqual(LevelManager._multiplayerHPMultiplier(), 1.0, "HP multiplier should be 1.0 for 1 player");

  // Scenario B: 2 Players
  Multiplayer.count = 2;
  assert.strictEqual(LevelManager._waveEnemyCount(), 9, "Base wave count should be 9 for 2 players (4 + 1.5 + 4)");
  assert.strictEqual(LevelManager._multiplayerCountMultiplier(), 1.4, "Count multiplier should be 1.4 for 2 players");
  assert.strictEqual(LevelManager._multiplayerHPMultiplier(), 1.6, "HP multiplier should be 1.6 for 2 players");

  // Test actual spawn count (Math.floor(waveEnemyCount * countMultiplier))
  // For 2 players: Math.floor(9 * 1.4) = Math.floor(12.6) = 12 enemies
  LevelManager._queueWave();
  const spawnCount = LevelManager.spawnQueue.length;
  assert.strictEqual(spawnCount, 12, `Wave spawn size should scale to 12 for 2 players, got ${spawnCount}`);

  // Test HP Scaling (BaseHP × MB × ML × MP)
  // For Biome 1, Level 1, 2 Players:
  // MB = 1.0, ML = 1.0, MP = 1.6
  // Scout base HP = 1 -> Math.ceil(1 * 1.0 * 1.0 * 1.6) = 2
  // Heavy base HP = 4 -> Math.ceil(4 * 1.0 * 1.0 * 1.6) = 7
  const scoutEnemy = LevelManager._spawnEnemy('angler_scout', 0, 0);
  assert.strictEqual(scoutEnemy.hp, 2, `Scout HP should scale to 2, got ${scoutEnemy.hp}`);

  const heavyEnemy = LevelManager._spawnEnemy('vent_crab_heavy', 0, 0, 'heavy');
  assert.strictEqual(heavyEnemy.hp, 7, `Heavy HP should scale to 7, got ${heavyEnemy.hp}`);

  console.log("Multiplayer Scaling Unit Tests: PASSED");
}

runScalingTest();

// Load player.js and run Player tests
const playerPath = path.resolve(__dirname, '../js/player.js');
// Mock more globals required by player.js
global.createExplosion = () => {};
global.banterEnabled = true;
global.streamerMode = false;
global.floatingTexts = [];
global.FloatingText = class MockFloatingText {
  constructor(x, y, text, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
  }
};
global.BanterEngine = {
  getLine: (type, biome, char) => ({ l: `Mock pulled out line for biome ${biome}` })
};

require(playerPath);

function runPlayerRemediationTests() {
  console.log("Running Player Remediation Unit Tests...");
  
  // Set LevelManager biome to 3
  global.LevelManager = { biome: 3 };
  global.Multiplayer.players = [];
  
  const player = new Player('striker', 1);
  player.takeDamage(500); // Trigger pull-out which calls BanterEngine with bLevel

  assert.strictEqual(player.isPulledOut, true, "Player should be pulled out after taking overkill damage");
  assert.strictEqual(floatingTexts.length, 1, "A floating text should be queued for pull-out banter");
  assert.ok(floatingTexts[0] instanceof FloatingText, "Pushed floating text should be an instance of FloatingText");
  assert.strictEqual(floatingTexts[0].text, "Mock pulled out line for biome 3", "Pushed floating text should have correct biome info");
  
  console.log("Player Remediation Unit Tests: PASSED");
}

runPlayerRemediationTests();

