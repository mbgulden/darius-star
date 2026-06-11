# Darius Star: Cyber Coelacanth — Sprint Plan
**GRO-1108: Remaining Work Mapped to Completion** · Updated 2026-06-11 by Ned

This document is the single-source-of-truth roadmap for shipping Darius Star. It reflects
the current codebase state as of 2026-06-11 05:30 UTC, verified against live filesystem
contents, git history, and open Linear issues.

---

## 1. What's Done ✅

### Architecture — Fully Modular
All 17 JS modules extracted from the monolith into `js/`, loaded in dependency order
from `index.html` (lines 327–343). Zero duplicate function definitions.

| # | Module | Lines | Status |
|---|--------|-------|--------|
| 1 | `upgrade_system.js` | 236 | ✅ |
| 2 | `save_system.js` | 279 | ✅ 3-slot localStorage + checkpoint |
| 3 | `combo.js` | 226 | ✅ Kill-streak scoring |
| 4 | `economy.js` | 164 | ✅ Anti-farm scrap drops |
| 5 | `banter_engine.js` | 333 | ✅ Window-attached (GRO-1145) |
| 6 | `multiplayer.js` | 395 | ✅ 1-4 player drop-in/out |
| 7 | `ngplus.js` | 143 | ✅ Paradox enemies + NG+ triggers |
| 8 | `leaderboard.js` | 124 | ✅ Speedrun/ScrapLord/Survivor |
| 9 | `player.js` | 1026 | ✅ Ship class, weapon levels |
| 10 | `enemies.js` | 678 | ✅ Enemy, Boss, EnemyBullet classes |
| 11 | `combat.js` | 199 | ✅ Bullet, PowerUp, SpriteExplosion |
| 12 | `renderer.js` | 1225 | ✅ Particle, Parallax, backgrounds |
| 13 | `sprites.js` | 164 | ✅ All sprite loading + preCompositeAdditive |
| 14 | `audio.js` | 900 | ✅ Web Audio synth + environmental cues |
| 15 | `ui.js` | 2367 | ✅ Menus, HUD, dialogue, pause, settings |
| 16 | `level_manager.js` | 458 | ✅ Wave system, formation spawning (GRO-1140) |
| 17 | `game_loop.js` | 1865 | ✅ Main loop, collision, input, narrative flags |

### Game Systems — Operational
- **Save/Load**: 3-slot CampaignSave with biome checkpoints, play-time tracking, restore
- **LevelManager**: Wave spawning, formation system, difficulty scaling, boss triggers
- **Economy**: Scrap drops with anti-farm tracking per-enemy
- **Multiplayer**: Drop-in/out, player-count context synced to BanterEngine
- **New Game+**: Paradox enemies, scrap multipliers, ending-dependent loops
- **Leaderboard**: Three categories wired
- **Audio Drama (GRO-1028)**: 30 procedural audio cues, biome ambient drones, timed story beats
- **Pre-composite pipeline (GRO-1141)**: Additive sprites pre-composited for source-over draw
- **Gemini TTS**: Voice client at `tools/gemini_tts_client.py`

### Asset Pipeline — Partially Populated
- **Boss sprite**: `boss_0.png` (512×512) + `boss_0_small.png` (256×256) — generated
- **Background strips**: 27 files in `assets/sprites/backgrounds/` for all 10 biomes (near/far/strip)
- **Generated enemy sprites**: `robot_mob.png`, `mine_layer.png`, `sniper_drone.png` in `assets/sprites/generated/`
- **VFX explosion frames**: 180+ individual frame PNGs in `assets/sprites/vfx/` (sliced from sheets)
- **Player sprites**: All 16 ship variant frames present
- **Enemy base sprites**: `scout_0.png`, `interceptor_0.png`, `heavy_0.png` present
- **Biome-specific enemies**: `enemy_b1_crawler_0.png` through `enemy_b7` present (7 files)
- **Scout animation cycle**: `scout_cycle_0001.png` through `0032.png` (32 individual frames)

### Docs — Canon Established
- `STORY-CANON.md` — single source of truth for all narrative
- `GAME-DESIGN-DOCUMENT.md` — authoritative mechanics reference
- `biome-visual-guide.md` — verified against live code, 10 biomes with hex palettes
- `enemy-wave-designer.md` — wave composition, formation specs, scaling formulas
- `foundational-structure-audit.md` — dependency graph and module specs
- `live-game-audit.md` — boot-crash root causes (all since resolved)
- `code-quality-audit.md` — lint/tooling assessment
- Character docs: `voice-lines-master.md`, `voice-profiles.md`, `arcs-complete.md`, `escalating-stakes-map.md`

---

## 2. What's Broken — Active Issues (agent:ned Backlog)

These issues are verified against live code. Each has a concrete resolution path.

### 🔴 GRO-1157: Boss Loop — Fish Boss Respawning Without Sprite
**Status**: `agent:ned`, Backlog  
**Severity**: Critical (progression blocker)  
**Root cause**: At biome 1 level 5, boss spawns invisible (`boss_minion_0.png` MISSING from disk),
and defeat detection fails → boss respawns infinitely → level never progresses.  
**Fix path**:
1. Generate `boss_minion_0.png` sprite (use `tools/generate_boss_sprite.py` pattern or manual asset)
2. Verify boss defeat callback triggers `_winTransition` in `enemies.js` Boss class
3. Check `game_loop.js` victory sequence handles boss death correctly
4. Test: kill boss at biome 1 level 5 → must advance to next biome  
**Est. effort**: 3 hours (mostly sprite generation)

### 🔴 GRO-1158: Enemy Sprites Not Rendering
**Status**: `agent:ned`, Backlog  
**Severity**: Critical (visual)  
**Root cause**: `js/sprites.js` `loadEnemySprites()` has a race condition. The raw `Image` object
is inserted into `enemySprites[key]` at line 60 BEFORE `onload` fires. The `onload` callback at
line 58 replaces it with a pre-composited canvas. If draw happens between line 60 and onload,
the sprite is a not-yet-loaded Image. Also: `boss_minion_0.png` is missing entirely.
Additionally: biome-specific enemy sprites (`enemy_b1_crawler_0.png` etc.) exist on disk
but are not referenced in `loadEnemySprites()` — they have no loading path.  
**Fix path**:
1. Fix race: remove `enemySprites[key] = img;` at line 60, keep only the onload assignment
2. Add biome enemy sprites to the `types` array or create separate `loadBiomeEnemySprites()`
3. Ensure fallback colored rectangles render when sprites are still loading
4. Verify scout_0.png, interceptor_0.png, heavy_0.png load and render in-game  
**Est. effort**: 2 hours

### 🟡 GRO-1159: Weapon Blast Sprite Squares
**Status**: `agent:ned`, Backlog  
**Severity**: Medium (visual polish)  
**Root cause**: Level 5 weapon blast sprite sheets are loaded whole instead of being sliced
into individual animation frames. Entire sheet renders as one large square.  
**Fix path**:
1. Identify which sprite sheet file is used for weapon blasts (check `renderer.js` or `sprites.js`)
2. Use Pillow to slice the sheet into individual frame PNGs → `assets/sprites/vfx/weapon_blast_NNNN.png`
3. Update `sprites.js` to load sliced frames
4. Verify all weapon levels render correctly  
**Est. effort**: 3 hours

### 🟡 GRO-1155: Parallax Backgrounds Not Rendering
**Status**: `agent:ned`, Backlog  
**Severity**: Medium (visual)  
**Root cause**: Background strip PNGs exist on disk (27 files) but the Parallax class in
`renderer.js` may not be properly initialized or `LevelManager.backgroundSettingsForBiome()`
may return null/undefined. Also: naming inconsistencies — biome 6 has both `ice_ring_*` and
`ice_rings_*` files, biome 10 is `inferno_core_*` instead of `core_rift_*`, biome 9
(xenomorph_hive) has no strip files at all, and `derelict_fleet` has no `near` layer.  
**Fix path**:
1. Check `renderer.js` Parallax class instantiation in `game_loop.js`
2. Verify `LevelManager.currentLevelConfig.backgroundLayers` is populated
3. Normalize background file naming to match biome names canonically
4. Generate missing layers: `derelict_fleet_near.png`, `xenomorph_hive_*.png` (3 files), `core_rift_*.png` (or rename inferno_core)
5. Test: each of the 10 biomes should show 2-3 scrolling parallax layers  
**Est. effort**: 4 hours

### 🟡 GRO-1160: Load Saved Game Menu — No Touch Support
**Status**: `agent:ned`, Backlog  
**Severity**: Medium (mobile UX)  
**Root cause**: Save slot selection in `ui.js` uses keyboard events only. No tap/click
handlers on save slots. Tap targets too small for mobile (min 44×44px required).  
**Fix path**:
1. Add `click`/`touchend` event listeners on save slot elements
2. Size slots to min 44×44px
3. Add "Load" and "Delete" touch buttons
4. Test on 375px viewport  
**Est. effort**: 2 hours

### 🟢 GRO-1161: Fullscreen Mode for Mobile
**Status**: `agent:ned`, Backlog  
**Severity**: Low (mobile UX)  
**Fix path**: Add fullscreen toggle button using Fullscreen API with iOS webkit prefix.
Trigger on first tap. See MDN docs for `element.requestFullscreen()`.  
**Est. effort**: 1.5 hours

### 🟢 GRO-1162: Mobile Touch Controls
**Status**: `agent:ned`, Backlog  
**Severity**: Low (mobile UX, but broad scope)  
**Fix path**: Implement invisible omnidirectional joystick (left 40%) + action buttons
(right 40%). Multi-touch support for simultaneous move + fire. Auto-detect mobile.
Desktop input must continue to work. Reference `multiplayer.js` for input mappings.  
**Est. effort**: 5 hours

---

## 3. What's Missing to Ship

### 🖼️ Missing Assets (Blocking Visual Quality)

| Asset | Status | Fix |
|-------|--------|-----|
| `boss_minion_0.png` | **MISSING** | Generate via Pillow or manual |
| Character portraits (10 files) | **MISSING** — `assets/sprites/portraits/` is empty | Generate 10 character portraits + comms_overlay |
| Cinematic videos (boss intro, victory) | **MISSING** — `assets/cinematics/` is empty | Generate placeholder MP4s or fallback canvas sequences |
| Xenomorph Hive backgrounds | **MISSING** (biome 9 has no strip files) | Generate 3 layer strips |

### 🎮 Gameplay Polish

| Area | Current State | Target |
|------|--------------|--------|
| Difficulty ramping | LevelManager has formulas, untested across all 10 biomes | Full 10-biome playthrough with smooth curve |
| Ship balance | 6 ships defined, stat differentials exist | Play-test balance pass |
| Weapon level progression | Levels 1-5 defined | Verify all levels work end-to-end |
| Collision feel | Spatial indexing exists | Tune hitbox sizes, invincibility frames |
| Boss fight pacing | 3-phase boss (intro/idle/rage/laser) | Verify transitions feel dramatic |

### 🔊 Audio

| Area | Current State | Target |
|------|--------------|--------|
| SFX synthesis | `generate_audio.py` exists | Verify all SFX trigger correctly in-game |
| Voice lines | JSON manifest exists, TTS client ready | Generate and integrate voice WAVs |
| Scene 3 audio tunnel | Spec exists in lyra-navigator-system.md | Implement zero-visibility audio-navigation level |
| Music | Web Audio chiptune synth in audio.js | Ensure music transitions with biome changes |

### 📱 Mobile

| Area | Current State | Target |
|------|--------------|--------|
| Touch controls | None (GRO-1162) | Invisible joystick + action buttons |
| Fullscreen | None (GRO-1161) | Fullscreen API toggle |
| Save menu touch | Keyboard-only (GRO-1160) | Touch-friendly slot selection |
| Viewport scaling | Canvas resizes in JS | Test 375×667 (iPhone SE) through 428×926 (iPhone 14) |
| Orientation | Not handled | Portrait lock or orientation warning |

### 📦 Optimization

| Area | Current State | Target |
|------|--------------|--------|
| Sprite sheets | 32 individual scout_cycle PNGs (100MB+) | Pack into texture atlas, slice at runtime |
| Sprite slicer utility | Not built | `tools/sprite_slicer.py` using Pillow |
| Asset preloading | Per-function lazy loading | Unified loading screen with progress bar |
| Load size | ~11GB repo (mostly assets) | Audit and prune unused assets |

### 🚀 Deployment

| Area | Current State | Target |
|------|--------------|--------|
| Cloudflare Pages | Deployed manually from master | Verify `veo_client.py` auto-deploy |
| Wrangler config | Not validated | Set caching policies for asset-heavy site |
| Staging branch | Used for dev work | Ensure staging → master merge flow is clean |

---

## 4. Prioritized Sprint Schedule

### Sprint 1: Fix What's Broken (Now)
*Goal: Game is playable through all 10 biomes with visible enemies and backgrounds.*

| ID | Task | Linear | Est. |
|----|------|--------|------|
| S1-1 | Fix boss loop — generate `boss_minion_0.png` + defeat detection | GRO-1157 | 3h |
| S1-2 | Fix enemy sprite loading — race condition + biome enemies | GRO-1158 | 2h |
| S1-3 | Fix weapon blast sprite slicing | GRO-1159 | 3h |
| S1-4 | Fix parallax backgrounds — init + missing layers | GRO-1155 | 4h |
| S1-5 | Generate missing portrait sprites (10 char + overlay) | NEW | 4h |
| S1-6 | Generate Xenomorph Hive background strips | NEW | 1h |
| **Sprint 1 total** | | | **17h** |

### Sprint 2: Polish & Audio
*Goal: Game feels good — balanced, sounds great, cinematics work.*

| ID | Task | Linear | Est. |
|----|------|--------|------|
| S2-1 | Difficulty ramp play-testing (all 10 biomes) | NEW | 6h |
| S2-2 | Ship balance pass (6 ships) | NEW | 4h |
| S2-3 | Weapon level 1-5 end-to-end verification | NEW | 3h |
| S2-4 | Generate cinematic placeholder MP4s or canvas fallbacks | NEW | 3h |
| S2-5 | SFX synthesis verification + integration | NEW | 4h |
| S2-6 | Voice line generation (Gemini TTS → WAVs) | NEW | 4h |
| S2-7 | Scene 3 audio-navigation tunnel | NEW | 6h |
| **Sprint 2 total** | | | **30h** |

### Sprint 3: Mobile + Ship
*Goal: Game works on phones, deploys automatically.*

| ID | Task | Linear | Est. |
|----|------|--------|------|
| S3-1 | Touch controls — joystick + action buttons | GRO-1162 | 5h |
| S3-2 | Fullscreen API toggle | GRO-1161 | 1.5h |
| S3-3 | Touch-friendly save menu | GRO-1160 | 2h |
| S3-4 | Viewport + orientation testing (iOS/Android) | NEW | 4h |
| S3-5 | Sprite sheet atlas packer (`tools/sprite_slicer.py`) | NEW | 4h |
| S3-6 | Unified loading screen with progress bar | NEW | 3h |
| S3-7 | Cloudflare Pages deploy verification + Wrangler caching | NEW | 2h |
| S3-8 | Asset audit — prune unused, organize directories | NEW | 3h |
| **Sprint 3 total** | | | **24.5h** |

---

## 5. Summary

| Sprint | Focus | Hours |
|--------|-------|-------|
| Sprint 1 | Fix What's Broken | 17h |
| Sprint 2 | Polish & Audio | 30h |
| Sprint 3 | Mobile + Ship | 24.5h |
| **Total** | | **71.5 hours** |

**Realistic timeline**: ~2 weeks for a single developer, ~1 week with 2 developers,
or ~4 days of coordinated agent swarm execution (Ned/Jules/AGY parallel lanes).

**Immediate next action**: Execute GRO-1157 (boss loop fix) — highest severity blocker.
Then GRO-1158 (enemy sprites) and GRO-1155 (parallax backgrounds) in parallel
where possible. Mobile issues (GRO-1160/1161/1162) can be batched in Sprint 3.
