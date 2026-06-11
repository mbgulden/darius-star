// js/levels/biome_data.js — Biome config data (GRO-1063)
// Loaded before level_manager.js
const BIOME_DATA = {
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
