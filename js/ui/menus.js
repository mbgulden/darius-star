// js/ui/menus.js — Main menu, credits, cinematic screens
// EXTRACTION TARGET (GRO-1062): Extract from js/ui.js drawMenuScreens()
//
// CURRENT LINE RANGES in js/ui.js (1870 lines total):
//   SCREENS.MENU:      L596-675  (main menu rendering — logo, scrap display, high scores, nav)
//   SCREENS.CREDITS:   L1183-1314 (credits scroll — ending-specific credit lists)
//   SCREENS.CINEMATIC: L1315-1522 (boss intro, victory, ending cinematics)
//
// DEPENDENCIES (shared scope from drawMenuScreens):
//   - ctx (Canvas 2D context)
//   - canvas (global)
//   - menuOptions[], selectedMenuIndex, hoveredMenuIndex
//   - window.DS_UpgradeSystem, window.Leaderboard
//   - transitionToScreen()
//   - drawTitleBackground(), drawTitleLogo()
//
// WARNING: These are inside drawMenuScreens()'s if/else chain.
// Extraction requires replacing each if-block with a function call
// and passing ctx/canvas as parameters. Needs browser verification.
