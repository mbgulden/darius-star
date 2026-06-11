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
`index.html` is now a **376-line HTML/CSS shell** with 34 active external `<script>` tags.
All game logic lives in `js/`. Load order is critical — modules are loaded
in dependency order, with `game_loop.js` and story modules last.

### js/ module map (loaded in this order)
| # | Module | What it contains |
|---|--------|-----------------|
| 1 | `js/utils.js` | Shared utility functions (extracted from game_loop.js) |
| 2 | `js/canvas_setup.js` | Canvas initialization and DOM HUD references |
| 3 | `js/upgrade_system.js` | DS_UpgradeSystem — Ship upgrade tree and purchase logic |
| 4 | `js/save_system.js` | CampaignSave — 3-slot save/load JSON localStorage system |
| 5 | `js/player_state.js` | PlayerState — tracks progress, checkpoints, and playthrough stats |
| 6 | `js/combo.js` | Combo scoring and floating multiplier text |
| 7 | `js/economy.js` | Scrap drop rules and anti-farming thresholds |
| 8 | `js/scrap_events.js` | Economy ↔ banter bridge (triggers voice comments on scrap pickup) |
| 9 | `js/banter_db.js` | Database of character dialogue lines and arc conditions |
| 10 | `js/banter_engine.js` | BanterEngine — evaluates dialogue rules and speaks voice/text |
| 11 | `js/multiplayer.js` | 1-4 player local co-op drop-in/out and keyboard/gamepad config |
| 12 | `js/ngplus.js` | NGPlus — New Game+ paradox loops and difficulty multipliers |
| 13 | `js/leaderboard.js` | High scores local storage and filter categories |
| 14 | `js/player.js` | Player ship class, movement, weapon configurations |
| 15 | `js/enemies.js` | Enemy, EnemyBullet, and Boss classes |
| 16 | `js/combat.js` | Bullet, PowerUp, and SpriteExplosion classes |
| 17 | `js/renderer/parallax.js` | ParallaxLayer, Star, OffscreenBuffer, background loading |
| 18 | `js/renderer/particles.js` | Particle, FloatingText, EnvironmentParticle + 10 biome systems |
| 19 | `js/renderer.js` | Orchestrator, screen shake, text wrap helpers |
| 20 | `js/sprites.js` | Sprite loading functions and ready state check |
| 21 | `js/audio.js` | Web Audio synthesizer, sound effects player, and ambient soundtrack |
| 22 | `js/ui/menus.js` | Main menu canvas rendering |
| 23 | `js/ui/ship-select.js` | Ship selection screen canvas rendering |
| 24 | `js/ui/settings.js` | Audio sliders and difficulty selectors canvas rendering |
| 25 | `js/ui.js` | Pause menu input handling, Credits screen, video playback transitions |
| 26 | `js/audio_chip.js` | Chiptune music loop generator for menu and credits |
| 27 | `js/ui/dialogue.js` | DialogueSequence, PortraitRenderer, CommsOverlay |
| 28 | `js/levels/biome_data.js` | Biome level layouts, backgrounds, wave definitions |
| 29 | `js/level_manager.js` | Wave spawning, difficulty scaling, boss triggering |
| 30 | `js/game_loop.js` | Main game loop, update/draw cycles, collision checks, key bindings |
| 31 | `js/story/branching.js` | StoryBranching — tracks branch gates and registers choices |
| 32 | `js/story/audio-tunnels.js` | AudioTunnel narrator audio player |
| 33 | `js/story/triggers.js` | StoryTriggers — gameplay event hooks (dormant/unintegrated) |
| 34 | `js/touch_controls.js` | Mobile touch overlays and virtual joysticks |
| 35 | `js/ui/hud.js` | DOM HUD and pause input separation (placeholder stub; not loaded) |
| 36 | `js/ui/game-over.js` | Game over / victory screens separation (placeholder stub; not loaded) |

## Key Architecture Notes
- **No IIFE wrappers** — modules use top-level scope. Classes defined in one module
  are visible to all subsequent modules via global scope.
- **Shared utility functions** — `resizeCanvas`, `setNarrativeFlag`, `getNarrativeFlag`,
  `determineEnding`, `createExplosion`, `spawnHitFlash`, `checkCollision`,
  `triggerScrapNarrativeBeat`, `startNGPlus`, `resetGame`, and
  `handleDeathOrVictoryRestart` are defined in `js/utils.js` and loaded first.
- **LevelManager** — global singleton loaded at #29. game_loop.js calls
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
