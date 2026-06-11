const assert = require('assert');
const path = require('path');

function loadLevelManager() {
  const modulePath = path.resolve(__dirname, '../js/level_manager.js');
  delete require.cache[modulePath];
  global.window = global;
  global.canvas = { width: 800, height: 600 };
  global.enemies = [];
  global.runSeed = 12345;
  global.Enemy = class Enemy {
    constructor(type) {
      this.type = type;
      this.hp = 2;
      this.speed = 100;
      this.x = 0;
      this.y = 0;
    }
  };
  require(modulePath);
  return global.LevelManager;
}

function testInitializesWithoutMulberry32AndExposesUiState() {
  delete global.mulberry32;
  const LevelManager = loadLevelManager();

  assert.doesNotThrow(() => LevelManager.setBiomeAndLevel(5, 10));
  assert.strictEqual(LevelManager.currentBiome, 5);
  assert.strictEqual(LevelManager.currentLevel, 10);
  assert.strictEqual(LevelManager.currentLevelConfig.background, 'bg_5');
  assert.ok(LevelManager.currentLevelConfig.particleSettings);
  assert.strictEqual(
    LevelManager.currentLevelConfig.bossTrigger,
    false,
    'bossTrigger must stay false until all waves are cleared'
  );
  assert.ok(LevelManager.spawnQueue.length > 0, 'initial wave should be queued');
}

function testSpawnsEnemiesDuringUpdate() {
  const LevelManager = loadLevelManager();
  LevelManager.setBiomeAndLevel(1, 1);

  LevelManager.update(10);

  assert.ok(global.enemies.length > 0, 'update should spawn queued enemies');
  assert.ok(global.enemies.every(enemy => enemy.x > 800), 'enemies enter from the right edge');
}

testInitializesWithoutMulberry32AndExposesUiState();
testSpawnsEnemiesDuringUpdate();
console.log('level_manager_test: ok');
