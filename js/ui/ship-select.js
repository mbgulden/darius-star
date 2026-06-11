// js/ui/ship-select.js — Ship selection screen with stat cards
// EXTRACTION TARGET (GRO-1062): Extract from js/ui.js drawMenuScreens()
//
// CURRENT LINE RANGE in js/ui.js:
//   SCREENS.SHIP_SELECT: L676-738
//
// Contains: Ship selection with 3 fighters (Scout, Interceptor, Dreadnought),
// stat cards, sprite rendering, selection highlight.
//
// DEPENDENCIES (shared scope from drawMenuScreens):
//   - ctx (Canvas 2D context)
//   - canvas (global)
//   - selectedShipIndex (global)
//   - playerSprites{} — sprite cache (scout_0, interceptor_0, heavy_0)
//   - drawTitleBackground() (called before drawMenuScreens)
//
// WARNING: Inside drawMenuScreens()'s if/else chain (L676).
// Extraction requires replacing else-if block with function call.
// Needs browser verification — sprite loading and rendering are visual.
