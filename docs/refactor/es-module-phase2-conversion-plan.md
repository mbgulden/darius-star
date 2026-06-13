# ES Module Phase 2 — Explicit Import/Export Conversion Plan

**Last updated:** 2026-06-13 by Ned (cron, GRO-1528)
**Parent issue:** GRO-1528
**Phase 1 commit:** `855de3d` (ES module shell — main.js entry point, window bridge)

## Phase 1 Deliverables (Complete ✓)

- `package.json` with `"type": "module"` ✓
- `build.js` (esbuild) ✓  
- `js/main.js` — imports all 46 modules in dependency order ✓
- `index.html` — single `<script type="module" src="js/main.js">` ✓
- 13 files already use `export` statements: `audio.js`, `audio_chip.js`, `economy.js`, `game_loop.js`, `i18n.js`, `player.js`, `ui.js`, `ui/briefing.js`, `ui/hud.js`, `ui/menus.js`, `ui/settings.js`, `ui/ship-select.js`, `utils.js` ✓

## Phase 2 Remaining: 19 Files (all use `window.X` assignments — zero `export`)

| # | File | Lines | Window Refs | Primary Exports |
|---|------|-------|-------------|-----------------|
| 1 | `audio_manager.js` | 647 | 1 | `AudioManager` class |
| 2 | `banter_db.js` | 214 | 1 | Banter data arrays |
| 3 | `banter_engine.js` | 221 | 3 | `BanterEngine` class |
| 4 | `canvas_setup.js` | 42 | 14 | Canvas/DOM setup functions |
| 5 | `combat.js` | 556 | 4 | `Bullet`, `PowerUp`, `SpriteExplosion` |
| 6 | `combo.js` | 229 | 1 | `ComboSystem` class |
| 7 | `enemies.js` | 796 | 7 | `EnemyBullet`, `Enemy`, `Boss` |
| 8 | `leaderboard.js` | 124 | 1 | `Leaderboard` class |
| 9 | `level_manager.js` | 551 | 1 | `LevelManager` class |
| 10 | `multiplayer.js` | 221 | 1 | Multiplayer player management |
| 11 | `ngplus.js` | 143 | 2 | `startNGPlus` |
| 12 | `player_state.js` | 48 | 4 | `PlayerState` class |
| 13 | `renderer.js` | 54 | 0 | `Parallax`, `Particle` (thin re-export wrapper) |
| 14 | `save_system.js` | 278 | 3 | `CampaignSave` class |
| 15 | `scrap_events.js` | 119 | 1 | `ScrapEvents` class |
| 16 | `sprites.js` | 174 | 1 | Sprite loading functions |
| 17 | `touch_controls.js` | 340 | 0 | Touch control event handlers |
| 18 | `upgrade_system.js` | 236 | 1 | `DS_UpgradeSystem` class |
| 19 | `voice_playback.js` | 250 | 1 | `VoicePlayback` class |

## Conversion Per File

For each file above:
1. **Add `export`** to all public classes/functions/constants
2. **Add `import`** for every dependency currently accessed via global scope
3. **Remove `window.X = X`** assignments (after verifying no external consumers)
4. **Remove explicit `window.X` reads** — replace with imported reference

## Circular Dependency Risks (from Phase 1 audit)
- `player.js` → `createExplosion()` defined in `game_loop.js` (reverse dependency)
- `economy.js` ↔ `scrap_events.js` (mutual reference)
- `game_loop.js` depends on nearly everything — it's the hub

## ⚠️ Triage: FLAGGED FOR INTERACTIVE

This task hits ALL autonomous-execution red flags:

| Factor | Assessment |
|--------|-----------|
| **File size** | 5 files >500 lines (enemies 796, combat 556, audio_manager 647, level_manager 551, touch_controls 340) |
| **Testability** | Verification requires browser gameplay — must run identically |
| **Isolation** | State, rendering, and input are interleaved across 19 modules |
| **Risk** | Breaking any import chain makes the game unplayable |
| **Dependencies** | 19 files depend on each other via globals — conversion must be coordinated |

### Recommended Approach (Interactive Session)
1. Convert bottom-up: files with zero dependencies first (`sprites.js`, `leaderboard.js`, `combo.js`)
2. Then single-dependency files (`scrap_events.js`, `banter_db.js`, `banter_engine.js`, `save_system.js`, `ngplus.js`, `upgrade_system.js`, `voice_playback.js`, `multiplayer.js`)
3. Then multi-dependency files (`combat.js`, `enemies.js`, `player_state.js`, `touch_controls.js`, `canvas_setup.js`, `renderer.js`)
4. Finally, the heavy hitters with circular deps: `audio_manager.js`, `level_manager.js`
5. Test in browser after each layer — `python3 -m http.server 8080` + Chrome DevTools
6. Resolve circular deps: `createExplosion` → shared utility module; `economy↔scrap` → break via event emitter pattern
