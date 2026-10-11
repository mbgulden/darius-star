# Darius Star: Cyber Coelacanth — Technical Audit
**Date:** 2026-06-09  
**Auditor:** Hermes Agent (read-only)  
**Scope:** Code health, module integration, performance, browser compat, save/load, NG+, multiplayer, economy
**Constraint:** No code changes

---

## Executive Summary

The technical foundation of Darius Star is **solid but under-tested**. The single-file architecture (6,572-line `index.html` + 8 JS modules) is functional and well-organized. The economy system is now wired into the game loop (as of today). The save system works. The NG+ system has one critical bug (broken 'N' key). Multiplayer is code-complete with input maps for 4 players. The `leaderboard.js` module is dead code. No performance hot spots identified. Browser compatibility is universal (Canvas + localStorage).

| System | Status | Grade |
|--------|--------|-------|
| Code Architecture | Single-file + 8 modules, clean | B+ |
| Module Integration | All 8 loaded, 7 wired, 1 dead | B |
| Save/Load (3 slots) | Fully functional | A- |
| Economy/Scrap | Wired into game loop | B+ |
| NG+ Flow | Auto-win path works; 'N' key broken | C+ |
| Multiplayer | Code-complete, 4 bugs fixed | B |
| Performance | No hot loops, particles capped | A- |
| Browser Compat | Universal (Canvas + localStorage) | A |

**Overall grade: B**

---

## 1. Code Architecture

### 1.1 File Structure

| File | Lines | Role | Load Order |
|------|-------|------|------------|
| `index.html` | 6,572 | Main game: HTML, CSS, canvas, game loop, rendering, input, UI, enemy AI, boss AI, particle systems, polish systems | N/A (host) |
| `upgrade_system.js` | 265 | Permanent scrap upgrades + cosmetics (IIFE) | 1st |
| `save_system.js` | 216 | 3-slot campaign save/load/checkpoint | 2nd |
| `combo.js` | 226 | Kill-streak multiplier with visual feedback | 3rd |
| `economy.js` | 221 | Scrap types, drop tables, upgrade trees, ships | 4th |
| `banter_engine.js` | 172 | In-mission event-driven dialogue | 5th |
| `multiplayer.js` | 143 | 1-4 player co-op with difficulty scaling | 6th |
| `ngplus.js` | 106 | New Game+ with paradox enemies | 7th |
| `leaderboard.js` | 196 | Leaderboard with 3 categories and tiers | 8th |

**Total codebase: ~8,117 lines** (6,572 inline + 1,545 across modules)

### 1.2 Script Loading

All modules loaded via `<script src="..."></script>` tags at lines 278–285 of `index.html`. Load order is correct:
- `upgrade_system.js` first (no dependencies, attaches to `window.DS_UpgradeSystem`)
- `save_system.js` second (used by economy, ngplus, and index.html)
- `combo.js` third (standalone, used by game loop)
- `economy.js` fourth (references `CampaignSave` concept but doesn't call it at load)
- `banter_engine.js` fifth (standalone)
- `multiplayer.js` sixth (references `BanterEngine`)
- `ngplus.js` seventh (references `CampaignSave`)
- `leaderboard.js` eighth (standalone)

**Verdict: ✅ Correct order** — No forward-reference issues at load time.

### 1.3 Module Dependency Graph

```
index.html
├── upgrade_system.js ← [standalone, IIFE]
├── save_system.js ← [standalone]
├── combo.js ← [standalone]
├── economy.js ← [standalone, references CampaignSave in comments]
├── banter_engine.js ← [standalone]
├── multiplayer.js ← depends on: BanterEngine
├── ngplus.js ← depends on: CampaignSave
└── leaderboard.js ← [standalone, UNUSED]
```

**Verdict: ✅ Clean dependency graph** — Only two inter-module dependencies (multiplayer→banter, ngplus→save), both appropriate. No circular dependencies.

---

## 2. Module-by-Module Health Check

### 2.1 save_system.js — Campaign Save System

| Criterion | Assessment |
|-----------|-----------|
| **API Surface** | 9 public methods: `createBlank`, `loadAll`, `load`, `save`, `delete`, `autosave`, `checkpoint`, `restoreCheckpoint`, `unlockShip`, `purchaseUpgrade`, `summarize` |
| **Error Handling** | ✅ Try/catch on all localStorage operations. Returns null/empty gracefully. |
| **Integration** | ✅ Used extensively in index.html (load, delete, summarize, checkpoint, autosave on biome transitions, save slot UI) |
| **Bugs** | ⚠️ `restoreCheckpoint()` subtracts 1 life without checking if lives ≤ 0 (could go negative). No version migration path for `SAVE_VERSION` bumps. |
| **Performance** | O(1) per operation. JSON payload ~500 bytes. Only called on UI events/checkpoints, never in hot loop. |
| **Grade** | **A-** |

### 2.2 economy.js — Economy & Upgrade System

| Criterion | Assessment |
|-----------|-----------|
| **Data Completeness** | 5 scrap types, 6 ships, 4 upgrade trees (5 tiers), 5 permanent upgrades, 4 enemy drop tables, segment-based loot tracking |
| **Integration** | ✅ Now wired (as of today's GRO-978). `Economy.init()` at game start. `shouldDrop()`/`rollDrop()`/`createDrop()` on enemy death and boss death. `newSegment()` on biome transitions. `getScrapMult()` used for NG+ bonus. |
| **Bugs** | ⚠️ `_lootedSegments` never pruned — could grow indefinitely in very long sessions. `createDrop()` accesses `this.scrapTypes[type]` without null guard. |
| **Performance** | Set-based looted tracking is O(1). All drop calcs are lightweight. |
| **Grade** | **B+** |

### 2.3 combo.js — Combo System

| Criterion | Assessment |
|-----------|-----------|
| **Feature Completeness** | 5 tiers (C/B/A/S/SS), score multiplier (1x/2x/3x/5x/10x), visual HUD with flash/shake effects, decay bar |
| **Integration** | ✅ `Combo.init()` called in `resetGame()`. `Combo.onKill()` wired into enemy death. `Combo.update(dt)` and `Combo.draw(ctx)` in game loop. |
| **Bugs** | None identified. `_hexToRgb` helper is correct. `_roundRect` is a well-known Canvas pattern. |
| **Performance** | `update(dt)` is O(1). `draw(ctx)` renders ~12 canvas ops — negligible. |
| **Grade** | **A** |

### 2.4 banter_engine.js — Banter Engine

| Criterion | Assessment |
|-----------|-----------|
| **Feature Completeness** | 10 biomes of solo banter with 3–7 trigger types each. Join/leave banter for multiplayer. Speaker tags: D/O/L/C/N. |
| **Integration** | ✅ `BanterEngine.init()` at game start and reset. `BanterEngine.trigger('level_start', biome)` on biome transitions. `BanterEngine.getActive()` in game loop for HUD display. |
| **Bugs** | ⚠️ `_playedLines` Set never cleared except on exhaustion — mild memory concern. Missing duo/4P banter data (design exists, code doesn't). |
| **Performance** | `getLine()` uses `.filter()` + `.indexOf()` on arrays ≤ 10 elements — negligible. |
| **Grade** | **B** (functionally working, content-incomplete) |

### 2.5 multiplayer.js — Multiplayer System

| Criterion | Assessment |
|-----------|-----------|
| **Feature Completeness** | 1-4 player support, join/leave queues with grace timers, difficulty scaling (HP/spawn/scrap multipliers), input maps for keyboard + gamepad |
| **Integration** | ✅ `Multiplayer.init()` at game start/reset. `Multiplayer.update(dt)` in game loop. `processJoins()`/`processLeaves()` called. |
| **Bugs** | ⚠️ 4 bugs fixed today (GRO-980): join banter loss, for...in pattern, double-death guard, host-reference on leave. Minor remaining: `banterLine` overwritten each join iteration — only last join's line shown. |
| **Performance** | O(n) where n ≤ 4. Negligible. |
| **Grade** | **B** |

### 2.6 ngplus.js — New Game+ System

| Criterion | Assessment |
|-----------|-----------|
| **Feature Completeness** | NG+ levels 1-3, scrap multipliers (1.5x/2.0x/3.0x), paradox enemies with HP/speed/color modifiers |
| **Integration** | ✅ Auto-gameWon flow works: `NGPlus.start(activeSaveSlot)` called on win. Paradox enemies wired in enemy constructor. Scrap multiplier applied on collection. |
| **Bugs** | 🔴 **CRITICAL — 'N' key broken:** Eligibility check `parsed.ngLevel` on a payload that doesn't have that property. The stored eligibility data is `{shipName: {biome, score, scrap, date}}`. 🔴 **`startNGPlus()` passes wrong argument:** Sends parsed object instead of slot number to `NGPlus.start()`. |
| **Performance** | O(1) operations. |
| **Grade** | **C+** (auto-win path works, user-facing restart is broken) |

### 2.7 leaderboard.js — Leaderboard System

| Criterion | Assessment |
|-----------|-----------|
| **Feature Completeness** | 3 categories (Speedrun/ScrapLord/Survivor), 5 tiers each (Bronze→Paradox), sort/render/top-N |
| **Integration** | ❌ **NOT INTEGRATED.** `leaderboard.js` is loaded via script tag (line 285) but `Leaderboard` is never called from index.html. Leaderboard functionality exists as duplicate inline code within index.html. |
| **Bugs** | N/A — module never executed. |
| **Grade** | **D** (dead code — 196 lines with zero runtime references) |

### 2.8 upgrade_system.js — Permanent Upgrade System

| Criterion | Assessment |
|-----------|-----------|
| **Feature Completeness** | 5 upgrade categories (weapons/shields/engines/specials/cosmetics), 4-5 tiers each, cost escalation, cosmetic unlock tree, gameplay modifier calculation |
| **Integration** | ✅ Attached to `window.DS_UpgradeSystem` via IIFE. Methods are available to `upgrade_shop.html` and any page that loads this script. |
| **Bugs** | ⚠️ Uses separate localStorage key (`darius_star_metaprogression`) from `save_system.js` (`darius_star_saves`) — two parallel save systems with no synchronization. `getGameplayModifiers()` has a bug at line 251: `wardenVowBonus: 0.30 + (spRank >= 10 ? 0.10 : 0.0)` — but `spRank` maxes at 4, so this condition is always false. |
| **Performance** | O(1) for all operations. |
| **Grade** | **B-** (parallel save system is architectural concern) |

---

## 3. index.html Health

### 3.1 Size and Structure

| Metric | Value |
|--------|-------|
| Total lines | 6,572 |
| HTML/CSS (lines ~1–275) | ~275 lines |
| JavaScript (lines ~276–6572) | ~6,296 lines |
| Functions declared | ~80+ |
| Classes defined | `Particle`, `Enemy`, `Boss`, `ScrapDrop`, `BiomeParticleSystem` + VFX classes |

### 3.2 Code Organization

The inline JavaScript follows this approximate structure:
1. **Lines 276–500:** Module init, game state variables, save slot UI functions
2. **Lines 500–1500:** Menu screens (title, save select, ship select, upgrade, credits)
3. **Lines 1500–2600:** Input handling, audio system, cinematic playback
4. **Lines 2600–3100:** Enemy class, Boss class, AI state machines
5. **Lines 3100–3500:** VFX classes (Particle, ScrapDrop, BiomeParticleSystem, Polish systems)
6. **Lines 3500–4500:** Rendering functions, HUD, dialogue display
7. **Lines 4500–5300:** Game loop (`loop()`, `update()`, `resetGame()`), biome transitions
8. **Lines 5300–6572:** Helper functions, event listeners, initialization

**Verdict: ⚠️ LARGE but ORGANIZED** — 6,572 lines in a single file is unwieldy but the code is sectioned with clear comment blocks. A future refactor should extract the enemy/boss classes, VFX systems, and menu screens into separate modules.

### 3.3 Syntax Quality

- **JavaScript syntax:** Valid — no unbalanced braces, semicolons are consistent (mostly present)
- **Variable scoping:** Uses `let`/`const` throughout; no `var` leakage
- **Global namespace:** Several globals (`biomeLevel`, `currentNGLevel`, `ngPlusRun`, `activeSaveSlot`, `scrapDrops`, `biomeParticles`, `hitFlashes`, etc.) — expected for single-file architecture
- **Canvas patterns:** Proper `ctx.save()`/`ctx.restore()` wrapping throughout drawing code

### 3.4 Known Bugs in index.html

| Bug | Line(s) | Severity |
|-----|---------|----------|
| NG+ 'N' key eligibility check always fails | ~1753-1757 | 🔴 Critical |
| `startNGPlus()` passes wrong arg type to `NGPlus.start()` | ~4389 | 🔴 Critical |
| `leaderboard.js` loaded but unused (inline dupe) | 285 | 🟡 Low |
| Biome 3 boss missing from boss design spec | N/A (design) | 🟡 Medium |
| `upgrade_system.js` uses separate localStorage from `save_system.js` | N/A | 🟡 Medium |
| `_lootedSegments` never pruned | economy.js | 🟢 Minor |

---

## 4. Module Integration Verification

### 4.1 All 8 Modules: Loaded vs. Wired

| Module | Script Tag | Runtime Init | Hot-Loop Update | Methods Called | Status |
|--------|-----------|-------------|-----------------|----------------|--------|
| `upgrade_system.js` | ✅ L278 | ✅ IIFE auto | ❌ | `getGameplayModifiers()`, `addScrap()`, etc. via upgrade shop | ✅ Wired |
| `save_system.js` | ✅ L279 | ✅ Called at game start | ❌ | `loadAll`, `load`, `save`, `delete`, `checkpoint`, `autosave`, `summarize` | ✅ Wired |
| `combo.js` | ✅ L280 | ✅ `Combo.init()` | ✅ `Combo.update(dt)`, `Combo.draw(ctx)` | `onKill()`, `getMultiplier()` | ✅ Wired |
| `economy.js` | ✅ L281 | ✅ `Economy.init()` | ❌ (event-driven) | `shouldDrop()`, `rollDrop()`, `createDrop()`, `newSegment()`, `getScrapMult()` | ✅ Wired |
| `banter_engine.js` | ✅ L282 | ✅ `BanterEngine.init()` | ✅ `BanterEngine.update(dt)` | `trigger()`, `getActive()` | ✅ Wired |
| `multiplayer.js` | ✅ L283 | ✅ `Multiplayer.init()` | ✅ `Multiplayer.update(dt)` | `processJoins()`, `processLeaves()`, `getAlivePlayers()` | ✅ Wired |
| `ngplus.js` | ✅ L284 | ❌ (lazy) | ❌ (event-driven) | `rollParadox()`, `applyParadox()`, `getScrapMult()`, `start()` (via auto-win) | ⚠️ Partial |
| `leaderboard.js` | ✅ L285 | ❌ | ❌ | **None** | ❌ Dead |

### 4.2 Key Integration Points Verified

| Integration Point | Line(s) | Status |
|-------------------|---------|--------|
| `CampaignSave.loadAll()` — Save slot menu | 873 | ✅ |
| `CampaignSave.checkpoint()` — Biome transition | 5089–5093 | ✅ |
| `Economy.shouldDrop()` → `rollDrop()` → `createDrop()` — Enemy death | 4818–4823 | ✅ |
| `Economy.newSegment()` — Biome change | 5083–5085 | ✅ |
| `NGPlus.rollParadox()` — Enemy constructor | 2680–2686 | ✅ |
| `NGPlus.getScrapMult()` — Scrap collection | 4901–4905 | ✅ |
| `BanterEngine.trigger('level_start')` — Biome start | 469 | ✅ |
| `Multiplayer.init()` — Game reset | 4500 | ✅ |
| `Combo.onKill()` — Enemy death | 4809 | ✅ |
| `BiomeParticleSystem` spawn/update/draw — Game loop | 5108–5112, 5569 | ✅ |
| Polish systems (flash/hit/overheat/low-HP) — Game loop | 3454–3462, 5574–5656 | ✅ |

**Verdict: ✅ 7 of 8 modules properly wired.** Leaderboard.js is the only dead module.

---

## 5. Performance Assessment

### 5.1 Hot Loop Analysis

The main game loop (`loop()`) runs at `requestAnimationFrame` (~60fps):

| Operation | Frequency | Complexity | Concern? |
|-----------|-----------|------------|----------|
| `update(dt)` — Game state | Every frame | O(n) where n = enemies + bullets + scrap + particles | No |
| `BiomeParticleSystem.update(dt)` | Every frame | O(p) where p ≤ 200 | No |
| `Combo.update(dt)` | Every frame | O(1) | No |
| `BanterEngine.update(dt)` | Every frame | O(1) | No |
| `Multiplayer.update(dt)` | Every frame | O(p) where p ≤ 4 | No |
| Enemy AI updates | Every frame | O(e) where e = active enemies | No |
| Collision detection | Every frame | O(e × b) naive (not spatial-partitioned) | ⚠️ Minor |
| Canvas draw calls | Every frame | ~50–100 draw ops | No |
| `localStorage` access | Checkpoints only | JSON parse/write ~500 bytes | No |

### 5.2 Memory / GC Pressure

| Source | Concern |
|--------|---------|
| `biomeParticles[]` — Capped at 250, trimmed | ✅ Safe |
| `hitFlashes[]` — Capped at 40, expired culled | ✅ Safe |
| `scrapDrops[]` — Variable, culled on collection/expiry | ✅ Safe |
| `enemies[]` — Variable, cleared per wave | ✅ Safe |
| `bullets[]` — Variable, culled off-screen | ✅ Safe |
| `BanterEngine._playedLines` — Set grows unbounded (~240 max) | ✅ Negligible |
| `Economy._lootedSegments` — Object of Sets, never pruned | ⚠️ Minor (grows ~1 key per biome) |

### 5.3 Asset Loading

- **2,528 PNG sprites** cataloged in `sprites.json` (~370 MB total)
- **All loaded as individual files** (no atlas packing)
- Background strips: 2 MB – 44 MB each (loaded on demand per biome)
- This is a browser game — asset loading happens progressively, not all at startup

**Verdict: ✅ No critical performance issues.** The main concern is collision detection (naive O(n²)) which could become noticeable at very high enemy counts, but the game's wave-based spawning likely keeps enemy counts manageable.

---

## 6. Browser Compatibility

| Feature | Used | Support |
|---------|------|---------|
| HTML5 Canvas | Core rendering | ✅ Universal |
| `requestAnimationFrame` | Game loop | ✅ Universal |
| `localStorage` | Save/load | ✅ Universal |
| Web Audio API | Music/SFX | ✅ Universal (Chrome/FF/Safari/Edge) |
| `JSON.parse`/`stringify` | Save data, mission data | ✅ Universal |
| `class` syntax | Enemy, Boss, Particle, etc. | ✅ ES6 — all modern browsers |
| Arrow functions | Various | ✅ ES6 — all modern browsers |
| `for...of` | Multiplayer.js | ✅ ES6 — all modern browsers |
| Template literals | Various | ✅ ES6 — all modern browsers |
| `Set` / `Map` | Economy loot tracking | ✅ ES6 — all modern browsers |
| Gamepad API | Multiplayer (players 3-4) | ⚠️ Chrome/FF/Edge, partial Safari |
| `<video>` element | Cinematic playback | ✅ Universal |

**Verdict: ✅ UNIVERSAL** — No browser-specific code, no polyfills needed. The game runs on any modern browser (Chrome 80+, Firefox 80+, Safari 14+, Edge 80+).

---

## 7. Save/Load System

### 7.1 3-Slot Architecture

| Feature | Implementation | Status |
|---------|---------------|--------|
| 3 save slots | Array in localStorage under `darius_star_saves` | ✅ |
| New game → create blank | `CampaignSave.createBlank()` → `save(slot, state)` | ✅ |
| Load game | `CampaignSave.load(slot)` → populate game state | ✅ |
| Delete save | `CampaignSave.delete(slot)` → null out slot | ✅ |
| Autosave | `CampaignSave.autosave(slot, gameState)` — merges deltas | ✅ |
| Checkpoint (every 3 waves / biome) | `CampaignSave.checkpoint(slot, gameState)` → stores checkpoint + autosaves | ✅ |
| Restore from checkpoint (on death) | `CampaignSave.restoreCheckpoint(slot)` → returns checkpoint state with -1 life | ✅ |
| Slot summary for UI | `CampaignSave.summarize(slot)` → {biome, wave, score, scrap, ship, difficulty, date, time, playTime, deaths, shipsUnlocked} | ✅ |

### 7.2 Save Payload

```json
{
  "version": 1,
  "timestamp": 1700000000000,
  "biome": 3,
  "wave": 7,
  "score": 12450,
  "scrap": 340,
  "ship": "striker",
  "weaponLevel": 2,
  "shieldMax": 140,
  "shield": 95,
  "lives": 2,
  "unlockedShips": ["striker", "phantom"],
  "permanentUpgrades": { "weaponDamage": 1, "shieldCapacity": 0, ... },
  "difficulty": "normal",
  "masterVolume": 0.8,
  "sfxVolume": 0.8,
  "musicVolume": 0.6,
  "totalScrapCollected": 1250,
  "totalEnemiesDefeated": 87,
  "playTime": 1245,
  "deaths": 1,
  "playerCount": 1,
  "lastCheckpoint": { "biome": 3, "wave": 6, ... }
}
```

### 7.3 Save-Related Issues

| Issue | Severity |
|--------|----------|
| No version migration — `SAVE_VERSION` bumps break old saves silently | 🟡 Medium |
| `restoreCheckpoint()` doesn't guard against negative lives | 🟢 Minor |
| `upgrade_system.js` uses separate key (`darius_star_metaprogression`) — two parallel save systems | 🟡 Medium |
| No narrative flags in save (glyphs, character states) | 🟡 Medium |

---

## 8. New Game+ Flow

### 8.1 Working Path

1. Player completes biome 10 boss → `gameWon = true`
2. Game-over screen shows stats
3. On exit to title, `NGPlus.start(activeSaveSlot)` is called with the slot number
4. This creates a new save with unlocked ships + permanent upgrades carried over, NG level incremented
5. Starting a new game from that slot enters NG+ mode

**Verdict: ✅ Automatic flow works.**

### 8.2 Broken Path

1. "PRESS N FOR NEW GAME+" prompt displayed
2. Player presses 'N'
3. Handler loads eligibility data: `JSON.parse(localStorage.getItem('darius_star_ngplus_eligible'))`
4. Checks `parsed.ngLevel` — but the stored payload is `{shipName: {biome, score, scrap, date}}`
5. Check **always fails** — `startNGPlus()` never reached

**Verdict: 🔴 'N' key is dead.**

---

## 9. Multiplayer

### 9.1 Feature Set

| Feature | Status |
|---------|--------|
| 1-4 players | ✅ |
| Keyboard input (players 1-2) | ✅ (WASD + Arrows) |
| Gamepad input (players 3-4) | ✅ (mapped to Gamepad API) |
| Drop-in join (3s invuln) | ✅ |
| Drop-out leave (3s grace) | ✅ |
| Difficulty scaling (HP/spawn/scrap) | ✅ (1.0x/1.4x/1.7x/2.0x) |
| Shared scrap pool | ✅ |
| Host scrap transfer on leave | ✅ |
| PvPvE biome 5 duel (Cross vs Darius) | ⚠️ Designed, not coded |
| Banter per player count | ⚠️ Solo only coded |

### 9.2 Bug Fix Status (GRO-980)

| Bug | Fixed? |
|-----|--------|
| `processJoins()` early return inside while loop | ✅ Fixed |
| `for...in` on `_graceTimers` | ✅ Fixed |
| `onPlayerDeath()` double-death guard | ✅ Fixed |
| `processLeaves()` host reference could be self | ✅ Fixed |

---

## 10. Economy / Scrap System

### 10.1 Integration Status

The economy system, previously a "well-designed but dead module" (per prior code review), is now fully wired:

| Integration Point | Status |
|-------------------|--------|
| Enemy type tagging (`enemyType`, `id`) | ✅ |
| Enemy death → `Economy.shouldDrop()` → `rollDrop()` → `createDrop()` | ✅ |
| Boss state transition drops | ✅ |
| Boss death drops (5x) | ✅ |
| `biomeLevel` tracking with `updateActiveBiome(score)` | ✅ |
| `Economy.newSegment()` on biome change | ✅ |
| NG+ scrap multiplier on collection | ✅ |
| `ScrapDrop` class supports all 5 Economy types | ✅ |
| Cheat prevention (segment-based loot tracking) | ✅ |

**Verdict: ✅ FULLY WIRED**

---

## 11. Audio System

### 11.1 Audio Manifest

`audio_manifest.json` catalogs 81 tracks:

| Category | Count | Format | Status |
|----------|-------|--------|--------|
| Title/Menu music | 4 | MP3 128kbps | ✅ |
| Phase music (1-2) | 2 | MP3 128kbps | ✅ |
| Boss music (intro + loop) | 2 | MP3 128kbps | ✅ |
| Victory/GameOver | 2 | MP3 128kbps | ✅ |
| Ambients (biomes 1-10 + deepspace + victory) | 12 | MP3 128kbps | ✅ |
| Boss themes (biomes 1-10) | 10 | MP3 128kbps | ✅ |
| Midboss themes (biomes 1-10) | 10 | MP3 128kbps | ✅ |
| Engine hums (biomes 1-10) | 10 | MP3 128kbps | ✅ |
| Environmental SFX (biomes 1-10, 2 each) | 20 | MP3 128kbps | ✅ |
| UI SFX | 10 | MP3/WAV | ✅ |
| **TOTAL** | **81** | | |

### 11.2 Audio Integration

All biome music tracks follow naming convention `engine_b{N}`, `midboss_b{N}`, `boss_b{N}`, `ambient_*`, `env_b{N}_*`. The audio system in `index.html` uses Web Audio API with `AudioContext`. Cinematic SFX exists as MP4 files in `assets/cinematics/`.

**Verdict: ✅ Audio assets complete and cataloged.** Runtime audio switching per biome needs verification (ambient/boss track selection at biome boundaries).

---

## 12. Recommendations

### Critical
1. **Fix NG+ 'N' key bug** — Change eligibility check from `parsed.ngLevel` to check for completed run data. Fix `startNGPlus()` argument type.
2. **Delete or integrate `leaderboard.js`** — 196 lines of dead code. Either wire it into index.html or remove the script tag.

### High Priority
3. **Unify save systems** — Merge `upgrade_system.js` localStorage key into `save_system.js` payload to prevent desync.
4. **Add narrative flags to save** — `glyphsCollected[]`, `crossDefected`, `nayaJoined`, `ophionActive`, `lyraState`.
5. **Fix `wardenVowBonus` calculation** — Condition `spRank >= 10` is unreachable (max rank is 4).

### Medium Priority
6. **Prune `_lootedSegments`** — Add a cap or per-biome cleanup to prevent unbounded growth.
7. **Add lives-underflow guard** — `restoreCheckpoint()` should return null if lives would go below 0.
8. **Consider extracting Enemy/Boss classes** — 6,572-line index.html is hard to navigate.
9. **Add spatial partitioning for collision** — Only if enemy counts regularly exceed ~50.

### Low Priority
10. **Implement PvPvE biome 5 duel** — The design exists in BANTER-AND-SYSTEMS.md.
11. **Generate voice line files** — 810 needed, 12 exist.

---

*End of Technical Audit. All findings based on read-only inspection. No code was modified.*
