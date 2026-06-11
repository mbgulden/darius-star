# UI Extraction Map — GRO-1062

**Last updated:** 2026-06-11 by Ned (cron)
**Source file:** `js/ui.js` (1,870 lines after dialogue duplicate removal in GRO-1062 Step 1)
**Goal:** Extract 5 UI submodules from ui.js + index.html

## File Structure Overview

```
js/ui.js (1870 lines)
├── L1-359:     Top-level vars, initAudio, transitionToScreen, victory video
├── L360-391:   drawTitleBackground(), drawTitleLogo()
├── L462-591:   Input handling: menu navigation, screen transitions
├── L593-1522:  drawMenuScreens() — MASSIVE if/else chain (930 lines)
│   ├── L596-675:   SCREENS.MENU (main menu)
│   ├── L676-738:   SCREENS.SHIP_SELECT
│   ├── L739-807:   SCREENS.SETTINGS
│   ├── L808-964:   SCREENS.LEADERBOARD
│   ├── L965-1081:  SCREENS.LOAD_GAME
│   ├── L1082-1182: SCREENS.UPGRADE_SHOP
│   ├── L1183-1314: SCREENS.CREDITS
│   └── L1315-1522: SCREENS.CINEMATIC
├── L1523-1646: Key handling (cinematic skip, playing, pause menu, gameOver)
├── L1647-1769: Menu navigation input (non-playing screens)
├── L1770-1801: Touch controls
├── L1803-1828: toggleStatusPanel() + DOM handler
└── L1830-1870: Canvas click handler for LOAD_GAME
```

## Extraction Targets

### ✅ DONE — Step 1 (commit `2f8f6cf`)
- **js/ui/dialogue.js** — 723 lines, extracted from ui.js (was L1803-2522 duplicate)
- ui.js shrunk from 2,590 → 1,870 lines

### ⚠️ PENDING — Steps 2-5 (all need browser verification)

| # | Target File | Screen(s) | Lines in ui.js | Risk | Notes |
|---|------------|-----------|----------------|------|-------|
| 2 | `js/ui/menus.js` | MENU, CREDITS, CINEMATIC | L596-675, L1183-1314, L1315-1522 | HIGH | 3 screen types, scattered in if/else chain |
| 3 | `js/ui/ship-select.js` | SHIP_SELECT | L676-738 | MEDIUM | Single screen, sprite-dependent rendering |
| 4 | `js/ui/settings.js` | SETTINGS | L739-807 | MEDIUM | Interactive sliders, 7 SETTINGS_OPTIONS |
| 5 | `js/ui/hud.js` | PLAYING HUD, pause overlay | L1551-1612 (input), DOM overlay | LOW | Mostly DOM-based, small canvas overlay |
| 6 | `js/ui/game-over.js` | Game over/victory input | L1629-1645 (input only) | LOW | Input dispatching, rendering in game_loop.js |

## Extraction Strategy

### Shared Scope Problem
`drawMenuScreens()` (L593) defines local variables used by all sub-screens:
- `ctx` — Canvas 2D context
- `startY`, `spacing` — layout variables (redefined per screen)
- `drawTitleBackground()`, `drawTitleLogo()` — called once at L594-595

**Extraction pattern for each screen:**
```javascript
// BEFORE: inside drawMenuScreens()'s if/else
if (currentScreen === SCREENS.MENU) {
    // ... 80 lines of menu rendering ...
}

// AFTER: call extracted function
if (currentScreen === SCREENS.MENU) {
    drawMainMenu(ctx, canvas);
}
```

### Recommended Extraction Order
1. **game-over.js** (lowest risk) — input dispatching, no rendering, no if/else chain modification
2. **hud.js** (DOM-based) — move DOM manipulation, keep canvas overlay minimal
3. **ship-select.js** — single screen, clear boundaries
4. **settings.js** — interactive sliders need careful extraction
5. **menus.js** — 3 screens, largest extraction, do last

### index.html Changes Needed
After extraction of each module, add script tag in load order:
```html
<script src="js/ui/menus.js"></script>
<script src="js/ui/hud.js"></script>
<script src="js/ui/ship-select.js"></script>
<script src="js/ui/settings.js"></script>
<script src="js/ui/game-over.js"></script>
```
Load order: menus → ship-select → settings → hud → game-over
(menus must load first since it defines drawMainMenu etc.)

## Verification Procedure (for interactive session)
1. Open `index.html` in browser
2. Navigate to each extracted screen
3. Verify: rendering matches pre-extraction, keyboard/mouse input works, transitions work
4. Check browser console for errors
5. Run `node scripts/verify_syntax.py` (or spot-check with `node --check`)

## Known Pitfalls
- **`node --check` core dumps** on files with top-level const/await — false alarm, use `scripts/verify_syntax.py`
- **Pause menu rendering** modifies Canvas in the PLAYING state — be careful not to break gameplay
- **LEADERBOARD, LOAD_GAME, UPGRADE_SHOP** are NOT GRO-1062 targets but share the same if/else chain — don't touch them yet
