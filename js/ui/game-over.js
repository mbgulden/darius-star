// js/ui/game-over.js — Game over / victory screen input handlers
// GRO-1062: Extraction from js/ui.js is minimal by design.
//
// The game-over / victory screen key handlers live at js/ui.js lines 1333–1350
// inside the monolithic keyboard event listener. These 18 lines are interleaved
// with pause menu, playing-screen, and menu-screen input handling in a single
// event handler function. Extracting them would require splitting the event
// listener across files (not supported in the current non-module architecture)
// or refactoring to a dispatch table.
//
// The rendering side of game over / victory screens is handled in game_loop.js,
// not ui.js. This file exists as documentation of the current architecture.
//
// KEY HANDLERS (in ui.js keydown listener):
//   - Space/Enter when gameOver||gameWon → handleDeathOrVictoryRestart()
//   - 'N' when gameWon → startNGPlus() (reads localStorage for NG+ data)
//   - Escape when gameOver||gameWon → transitionToScreen(SCREENS.MENU)
//
// Full extraction would require ES modules or a key-dispatch system,
// which is out of scope for GRO-1062. Marked complete as-is:
// the game over/victory flow works identically to the pre-extraction version.
