const assert = require('assert');
const path = require('path');

function loadLevelManager() {
  const modulePath = path.resolve(__dirname, '../js/level_manager.js');
  delete require.cache[modulePath];
  global.window = global;
  global.canvas = { width: 800, height: 600 };
  global.enemies = [];
  global.runSeed = 12345;
  global.BIOME_DATA = {
    enemies: {
      1: { scout:'angler_scout', interceptor:'jelly_interceptor', heavy:'vent_crab_heavy', alt:'angler_scout' },
      2: { scout:'rust_drone', interceptor:'coral_wasp', heavy:'armored_eel', alt:'rust_drone' },
      3: { scout:'sparker', interceptor:'sentinel', heavy:'juggernaut', alt:'boss_minion' },
      4: { scout:'plasma_wisp', interceptor:'storm_sprite', heavy:'gas_giant', alt:'nebula_wraith' },
      5: { scout:'ice_shard', interceptor:'frost_drone', heavy:'glacier', alt:'ice_swarm' },
      6: { scout:'ember_sprite', interceptor:'magma_wasp', heavy:'lava_golem', alt:'ember_sprite' },
      7: { scout:'static_spark', interceptor:'storm_hawk', heavy:'thunderhead', alt:'storm_sentinel' },
      8: { scout:'salvage_drone', interceptor:'ghost_fighter', heavy:'turret_battery', alt:'fleet_turret' },
      9: { scout:'crawler', interceptor:'spitter', heavy:'brute', alt:'hive_node' },
      10:{ scout:'glitch_fragment', interceptor:'paradox_wisp', heavy:'null_entity', alt:'rift_aberration' }
    },
    names: {
      1:'Abyssal Trench', 2:'Coral Graveyard', 3:'Coelacanth\'s Lair',
      4:'Nebula Drift', 5:'Ice Ring', 6:'Fire Nebula',
      7:'Storm Belt', 8:'Derelict Fleet', 9:'Xenomorph Hive',
      10:'Core Rift'
    },
    bossHP: {
      1:{ midBoss:60, biomeBoss:120 }, 2:{ midBoss:80, biomeBoss:150 },
      3:{ midBoss:100, biomeBoss:200 }, 4:{ midBoss:120, biomeBoss:180 },
      5:{ midBoss:140, biomeBoss:200 }, 6:{ midBoss:160, biomeBoss:220 },
      7:{ midBoss:180, biomeBoss:240 }, 8:{ midBoss:200, biomeBoss:260 },
      9:{ midBoss:220, biomeBoss:280 }, 10:{ midBoss:240, biomeBoss:400 }
    }
  };
  global.Enemy = class Enemy {
    constructor(type) {
      this.type = type;
      this.hp = 2;
      this.speed = 100;
      this.x = 0;
      this.y = 0;
    }
  };
  global.playSound = function() {};
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
