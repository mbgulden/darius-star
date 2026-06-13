# ES Module Conversion Dependency Map — GRO-1064 (PHASE 1 — COMPLETE)

**Last updated:** 2026-06-13 by Ned (cron)
**Phase 1 commit:** `855de3d` (ES module shell — main.js entry point, window bridge)
**Phase 2 plan:** See `docs/refactor/es-module-phase2-conversion-plan.md` (GRO-1528)

## Phase 1 State (Complete ✓)
- `package.json` with `"type": "module"` ✓
- `build.js` (esbuild) with graceful pre-conversion handling ✓
- Dead js/systems/ duplicates removed ✓
- `js/main.js` — imports all 46 modules in dependency order ✓
- `index.html` — single `<script type="module" src="js/main.js">` ✓
- 13 files use `export` statements (audio.js, audio_chip.js, economy.js, game_loop.js, i18n.js, player.js, ui.js, ui/*.js, utils.js) ✓
- 19 files still use side-effect imports + `window.X` assignments (Phase 2 target) ✗

## Module Dependency Graph

### What Each Module DEFINES (will become `export`)
| Module | Exports |
|--------|---------|
| `sprites.js` | `loadPlayerSprites`, `loadEnemySprites`, `loadVFXSprites`, `loadPortraitSprites`, `playerSprites`, `enemySprites` |
| `audio.js` | `initAudio`, `playSound`, `startMenuMusic` |
| `combat.js` | `Bullet`, `PowerUp`, `SpriteExplosion` |
| `player.js` | `Player` |
| `enemies.js` | `EnemyBullet`, `Enemy`, `Boss` |
| `renderer.js` | `Parallax`, `Particle`, `setBiomeBackgrounds` |
| `banter_engine.js` | `BanterEngine` |
| `save_system.js` | `CampaignSave` |
| `upgrade_system.js` | `DS_UpgradeSystem` |
| `economy.js` | `Economy` |
| `combo.js` | `ComboSystem` |
| `multiplayer.js` | (active player management) |
| `ngplus.js` | `startNGPlus` |
| `leaderboard.js` | `Leaderboard` |
| `player_state.js` | `PlayerState` |
| `scrap_events.js` | `ScrapEvents` |
| `level_manager.js` | `LevelManager` |
| `levels/biome_data.js` | (biome config data) |
| `story/branching.js` | `BranchingSystem`, `determineEnding`, `setNarrativeFlag`, `getNarrativeFlag` |
| `story/audio-tunnels.js` | `AudioTunnelPlayer` |
| `story/triggers.js` | (story triggers) |
| `ui.js` | `transitionToScreen`, `drawMenuScreens`, `drawTitleBackground`, `drawTitleLogo` |
| `ui/dialogue.js` | `DialogueEngine` |
| `game_loop.js` | `checkCollision`, `createExplosion`, `spawnHitFlash`, `resetGame`, `handleDeathOrVictoryRestart`, `resizeCanvas` |

### What Each Module IMPORTS (must `import` from others)
| Module | Imports From |
|--------|-------------|
| `game_loop.js` | `LevelManager`(6x), `Economy`(8x), `ScrapEvents`(5x), `DS_UpgradeSystem`(4x), `Leaderboard`(4x), `BanterEngine`(4x), `PowerUp`(2x), `createExplosion`, `spawnHitFlash`, `checkCollision`, `playSound` |
| `enemies.js` | `Bullet`(from combat.js), `Economy` |
| `player.js` | `DS_UpgradeSystem`(3x), `playSound`, `createExplosion` |
| `player_state.js` | `Player`, `CampaignSave`, `LevelManager`, `DS_UpgradeSystem`, `determineEnding` |
| `renderer.js` | `Player`, `LevelManager` |
| `economy.js` | `ScrapEvents` |
| `banter_engine.js` | `ScrapEvents`(8x) |
| `ui.js` | `Leaderboard`, `LevelManager`, `startMenuMusic`, `transitionToScreen` |
| `ui/dialogue.js` | `playSound`(7x), `setNarrativeFlag`(3x) |
| `story/audio-tunnels.js` | `Player`, `playSound`, `setBiomeBackgrounds`, `BanterEngine`(6x) |
| `story/branching.js` | `determineEnding`, `CampaignSave`, `setNarrativeFlag`(7x), `getNarrativeFlag` |
| `story/triggers.js` | `BanterEngine`(7x), `Boss`, `determineEnding` |
| `ngplus.js` | `CampaignSave` |

### Circular Dependency Alerts
- `economy.js` → `ScrapEvents` and `ScrapEvents` (scrap_events.js) may reference `Economy` — check
- `game_loop.js` depends on nearly everything — it's the hub
- `player.js` → `createExplosion` (defined in game_loop.js) — reverse dependency!

## Proposed Import Strategy

### Topological Sort (bottom-up)
1. **Layer 0 (no deps):** `sprites.js`, `audio.js`, `combat.js`, `combo.js`, `leaderboard.js`, `levels/biome_data.js`, `upgrade_system.js`
2. **Layer 1:** `economy.js`, `scrap_events.js`, `banter_engine.js`, `enemies.js`, `multiplayer.js`, `save_system.js`, `level_manager.js`
3. **Layer 2:** `player.js`, `ngplus.js`, `renderer.js`, `story/branching.js`, `story/audio-tunnels.js`, `story/triggers.js`
4. **Layer 3:** `player_state.js`, `ui.js`, `ui/dialogue.js`
5. **Layer 4 (hub):** `game_loop.js`

### js/main.js Template
```javascript
// Layer 0
import './sprites.js';
import './audio.js';
import './combat.js';
import './combo.js';
import './leaderboard.js';
import './levels/biome_data.js';
import './upgrade_system.js';

// Layer 1
import './economy.js';
import './scrap_events.js';
import './banter_engine.js';
import './enemies.js';
import './multiplayer.js';
import './save_system.js';
import './level_manager.js';

// Layer 2
import './player.js';
import './ngplus.js';
import './renderer.js';
import './story/branching.js';
import './story/audio-tunnels.js';
import './story/triggers.js';

// Layer 3
import './player_state.js';
import './ui.js';
import './ui/dialogue.js';

// Layer 4 — hub (must be last)
import './game_loop.js';
```

## index.html Changes
Replace all 26 `<script src="...">` tags with a single:
```html
<script type="module" src="js/main.js"></script>
```

## ⚠️ Blockers Requiring Interactive Resolution
1. **`createExplosion` cycle**: `player.js` calls `createExplosion()` which is defined in `game_loop.js`. But `game_loop.js` must load AFTER `player.js`. Solution: move `createExplosion` to a shared utility or use late binding.
2. **Global window assignments**: Many modules assign to `window.X = X` for interop. These must become proper exports.
3. **Browser-only globals**: `canvas`, `ctx`, DOM references must be passed as parameters or imported from a shared context module.
4. **Load order**: Current `<script>` load order relies on global scope — ES modules must use explicit imports.

## Verification (interactive session)
1. Replace index.html script tags with `<script type="module" src="js/main.js">`
2. Build: `npm run build`
3. Serve: `python3 -m http.server 8080`
4. Browser test: all screens, gameplay, audio, save/load
5. Check DevTools → Sources for clean module graph
