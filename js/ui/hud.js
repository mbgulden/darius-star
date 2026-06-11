// js/ui/hud.js — Controls overlay, score/shield/weapon display, banter text
// EXTRACTION TARGET (GRO-1062): Extract from js/ui.js + index.html
//
// HUD is largely DOM-based (#controls-overlay element in index.html) + canvas overlay
// during pause/playing screens. The in-game HUD rendering during SCREENS.PLAYING
// is minimal Canvas work — mostly status toggles and pause menu overlay.
//
// RELATED CODE:
//   - index.html: #controls-overlay div (DOM HUD)
//   - ui.js L1551-1612: Pause menu input handling
//   - ui.js L1613-1646: Playing screen key handling (gameOver/gameWon checks)
//   - ui.js L1803-1817: toggleStatusPanel() — DOM overlay expand/collapse
//
// DEPENDENCIES:
//   - gameOver, gameWon, paused globals
//   - PAUSE_OPTIONS[], SETTINGS_OPTIONS[]
//   - pauseMenuIndex, pauseSubScreen, selectedSettingsIndex
//   - handleDeathOrVictoryRestart(), startNGPlus(), transitionToScreen()
//
// WARNING: Pause menu rendering modifies Canvas state during active gameplay.
// Extraction needs careful separation of DOM (safe to move) vs Canvas (browser verify).
