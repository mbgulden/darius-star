# darius-star — AGENTS.md

## Project: Darius Star: Cyber Coelacanth
Horizontal retro shoot-'em-up space arcade game. 10 biomes × 10 levels. 
Canvas-based browser game. Deployed via Cloudflare Pages from this repo.

**Canonical design reference:** `docs/GAME-DESIGN-DOCUMENT.md` (Jules, June 2026).
The GDD is authoritative for game mechanics, story, characters, biome structure,
and progression. The technical architecture section (§8) is outdated — it describes
the pre-modularization monolith. The module list below is the current ground truth.

## FORBID: Do NOT modify these
- `assets/` — binary game assets (sprites, audio, cinematics)
- `*.py` — build/deploy scripts
- `*.md` — documentation (except this file with approval)

## Architecture (fully modular)
`index.html` is now a **385-line HTML/CSS shell** with 19 external `<script>` tags.
All game logic lives in `js/`. Load order is critical — modules are loaded
in dependency order, with `game_loop.js` last.

### js/ module map (loaded in this order)
| # | Module | What it contains |
|---|--------|-----------------|
| 1 | `upgrade_system.js` | Ship upgrade tree |
| 2 | `save_system.js` | CampaignSave — 3-slot save/load |
| 3 | `combo.js` | Kill streak scoring |
| 4 | `economy.js` | Scrap drop tracking |
| 5 | `banter_engine.js` | Contextual character banter |
| 6 | `multiplayer.js` | 1-4 player drop-in/out |
| 7 | `ngplus.js` | New Game+ with paradox enemies |
| 8 | `leaderboard.js` | High scores |
| 9 | `player.js` | Player ship class (753 lines) |
| 10 | `enemies.js` | EnemyBullet, Enemy, Boss classes (672 lines) |
| 11 | `combat.js` | Bullet, PowerUp, SpriteExplosion (160 lines) |
| 12 | `renderer.js` | Particle, Parallax, backgrounds (1352 lines) |
| 13 | `sprites.js` | Sprite loading functions (132 lines) |
| 14 | `audio.js` | Web Audio synth + environmental cues (900 lines) |
| 15 | `ui.js` | Menus, HUD, pause, settings, dialogue (2336 lines) |
| 16 | `level_manager.js` | Wave system, formation spawning, difficulty scaling (GRO-1140) |
| 17 | `game_loop.js` | Game state, entity pools, update(), draw(), loop(), collision, input, narrative flags (1752 lines) |

## Key Architecture Notes
- **No IIFE wrappers** — modules use top-level scope. Classes defined in one module
  are visible to all subsequent modules via global scope.
- **Shared utility functions** — `createExplosion`, `spawnHitFlash`, `checkCollision`,
  `setNarrativeFlag`, `getNarrativeFlag`, `determineEnding`, `startNGPlus`,
  `resetGame`, `handleDeathOrVictoryRestart`, `resizeCanvas` are defined in
  `game_loop.js` and called from multiple modules. No duplicates exist.
- **LevelManager** — global singleton loaded at #16. game_loop.js calls
  `LevelManager.setBiomeAndLevel()`, `LevelManager.update(dt)`, and reads
  `LevelManager.currentLevelConfig.bossTrigger`. Enemy spawning is fully
  delegated to LevelManager.
- **Wave designer reference:** `docs/enemy-wave-designer.md` (Jules) — enemy
  stats, wave composition, formation specs, difficulty scaling formulas.
- **Syntax verification** — use `scripts/verify_syntax.py` for all files.
  `node --check` works for class/function-only modules but fails on `game_loop.js`
  (top-level `const` in CJS mode).

## Rules
- Keep exact same functionality — no behavior changes
- Add `<script src="js/xxx.js"></script>` tags in index.html for new modules
- Remove extracted code from index.html
- `git push` can take 3-10 minutes (repo is ~11GB). Run in background.
- Use `spritesReady` Set pattern for sprite loading
