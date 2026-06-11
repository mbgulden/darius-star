// js/ui/game-over.js — Game over / victory screens
// EXTRACTION TARGET (GRO-1062): Extract from js/ui.js
//
// Game over and victory screens are NOT inside drawMenuScreens().
// They live in the key-handling section and use Canvas overlay rendering.
//
// CURRENT LOCATIONS in js/ui.js:
//   - L1629-1631: Space key → handleDeathOrVictoryRestart() when gameOver/gameWon
//   - L1632-1641: 'N' key → startNGPlus() when gameWon
//   - L1643-1645: Escape → transitionToScreen(SCREENS.MENU) when gameOver/gameWon
//
// The actual game over / victory CANVAS rendering appears to be handled
// in game_loop.js (draw loop calls) rather than ui.js directly.
// ui.js handles only the INPUT side for these screens.
//
// DEPENDENCIES:
//   - gameOver, gameWon (globals from game_loop.js)
//   - handleDeathOrVictoryRestart() (defined in game_loop.js)
//   - startNGPlus() (defined in ngplus.js)
//   - transitionToScreen() (defined in ui.js)
//   - localStorage 'darius_star_ngplus_eligible'
//
// WARNING: This is input-handling code, not rendering code.
// The rendering side is in game_loop.js and needs coordinated extraction.
// Low risk for autonomous work — input dispatching is separable.
