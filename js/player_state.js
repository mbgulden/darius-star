// player_state.js — Player State Tracker (GRO-1030)
// Centralized API for player progress, story decisions, unlocks.
// Built on CampaignSave + narrativeFlags.

const PlayerState = {
  getState: function() {
    return {
      biome: LevelManager.biome,
      level: LevelManager.level,
      flags: Object.assign({}, narrativeFlags),
      scrap: window.DS_UpgradeSystem ? DS_UpgradeSystem.state.scrap : 0,
      upgrades: window.DS_UpgradeSystem ? Object.assign({}, DS_UpgradeSystem.state.upgrades) : {},
      shipsUnlocked: this.getShipsUnlocked(),
      ending: determineEnding ? determineEnding() : 'transcendence'
    };
  },

  getShipsUnlocked: function() {
    var save = CampaignSave ? CampaignSave.loadLast() : null;
    return (save && save.shipsUnlocked) ? save.shipsUnlocked : 3;
  },

  hasFlag: function(key) {
    return getNarrativeFlag ? getNarrativeFlag(key) > 0 : false;
  },

  completedBiome: function(b) {
    var flags = this.getState().flags;
    return (flags['biome_' + b + '_boss'] || 0) > 0;
  },

  totalScrapEarned: function() {
    return window.DS_UpgradeSystem ? DS_UpgradeSystem.state.scrap : 0;
  },

  summary: function() {
    var s = this.getState();
    var completed = 0;
    for (var i = 1; i <= 10; i++) {
      if (s.flags['biome_' + i + '_boss']) completed++;
    }
    return 'B' + s.biome + '-' + s.level + ' | ' + completed + '/10 biomes | '
      + s.scrap + ' scrap | ' + s.shipsUnlocked + ' ships | ' + s.ending;
  }
};
