// js/ui/settings.js — Pause menu with volume sliders, difficulty, toggles
// EXTRACTION TARGET (GRO-1062): Extract from js/ui.js drawMenuScreens()
//
// CURRENT LINE RANGE in js/ui.js:
//   SCREENS.SETTINGS: L739-807
//
// Contains: Volume sliders (master, SFX, music), difficulty selector,
// toggle settings (audio tunnels, banter, streamer mode).
//
// DEPENDENCIES (shared scope from drawMenuScreens):
//   - ctx (Canvas 2D context)
//   - canvas (global)
//   - masterVolume, sfxVolume, musicVolume (global)
//   - selectedSettingsIndex, SETTINGS_OPTIONS[] (global)
//   - audioTunnelsEnabled, banterEnabled, streamerMode (global)
//   - getCurrentDifficultyConfig() (global function)
//
// WARNING: Inside drawMenuScreens()'s if/else chain (L739).
// Volume sliders are interactive canvas elements — extraction
// modifies the chain and needs browser verification.
