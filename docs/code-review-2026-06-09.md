# Darius Star: Cyber Coelacanth — Code Review
**Date:** 2026-06-09  
**Reviewer:** Hermes Agent (automated)  
**Scope:** Integrated game modules — save_system.js, banter_engine.js, multiplayer.js, economy.js, ngplus.js, leaderboard.js, upgrade_system.js, and index.html  
**GRO References:** GRO-917 (voice lines), GRO-919 (filler music), GRO-934 (enemy variety)

---

## 1. Module-by-Module Assessment

### 1.1 save_system.js — Campaign Save System (GRO-959)
**Rating: ✅ Good**

| Criterion | Assessment |
|-----------|-----------|
| Code Quality | Clean, well-commented JSDoc blocks. Consistent try/catch wrapping on all localStorage operations. Sensible API surface (`loadAll`, `load`, `save`, `delete`, `autosave`, `checkpoint`, `restoreCheckpoint`, `unlockShip`, `purchaseUpgrade`, `summarize`). |
| Integration | Used by index.html for load/delete/summarize/checkpoint. Used by ngplus.js (`NGPlus.start()` calls `CampaignSave.load()`). No circular deps. Loaded second in script order — correct, depends on nothing. |
| Edge Cases | ✅ Handles null saves gracefully. ✅ Version number in payload. ❌ No migration path for `SAVE_VERSION` bumps — old saves silently break. ❌ `restoreCheckpoint()` subtracts 1 life but doesn't check if lives ≤ 0. |
| Browser Compat | localStorage only — universal support. No issues. |
| Performance | Called only at UI-level interactions (menu, checkpoint), never in hot loop. `JSON.parse`/`JSON.stringify` of tiny payloads — negligible. |

**Summary:** Solid foundation. Add a version migration function and a lives-underflow guard in `restoreCheckpoint()`.

---

### 1.2 banter_engine.js — Banter Engine (GRO-957)
**Rating: ✅ Good**

| Criterion | Assessment |
|-----------|-----------|
| Code Quality | Concise, well-structured data. 10 biomes of dialogue with 8 trigger types, plus join/leave banter. Speaker tags (D/O/L/C/N) provide character identification. Code is dense but readable. |
| Integration | Initialized by index.html (`BanterEngine.init()`). Called every frame (`update`, `getActive`). Referenced by multiplayer.js for join/leave lines — tight but appropriate coupling. |
| Edge Cases | ✅ Recycling logic when all lines played (resets tracking set). ✅ `getLine()` returns null if biome or trigger missing. ❌ `_playedLines` Set grows unbounded — 10 biomes × 8 triggers × ~3 lines = ~240 entries max, but no cleanup on level transition or game reset. ❌ `getLine()` line 150 uses `lines.indexOf(available[idx])` on the **original** `lines` array after `available` was filtered — works correctly but is confusing. |
| Browser Compat | Pure JS, no issues. |
| Performance | `update()` every frame (O(1)). `trigger()` does `.filter()` + `.indexOf()` — O(n) but n ≤ 10 lines. Negligible. |

**Summary:** Well-crafted. Minor concerns: document the indexOf trick, and consider clearing `_playedLines` per biome transition rather than only on exhaustion.

---

### 1.3 multiplayer.js — Multiplayer System (GRO-958)
**Rating: ⚠️ Needs Attention**

| Criterion | Assessment |
|-----------|-----------|
| Code Quality | Clean API design, good comments, clear state variables. Input mapping for all 4 players is well-organized. Difficulty scaling table is clear. |
| Integration | Used by index.html (`init`, `update`). References `BanterEngine.getJoinLine()` and `BanterEngine.getLeaveLine()` — functional dependency. |
| Edge Cases | ❌ **`processJoins()` bug:** When multiple players join in one frame, the `while` loop processes all, but only the **last** `return` value is captured. Earlier join banter lines are lost (line 76 `return BanterEngine.getJoinLine(biome)` exits after first iteration). ❌ **`update()` ignores `processLeaves()` return:** Line 112 calls `this.processLeaves()` but discards the banter line. ❌ **`for...in` on `_graceTimers`:** Line 109 iterates with `for...in`, which includes prototype properties. Use `for...of Object.keys()` or a Map. ❌ **`onPlayerDeath()`** doesn't guard against double-death (already-dead player). ❌ **`processLeaves()` transfers scrap to host** but doesn't clear the host reference if host itself leaves (player[0] could be the leaving player). |
| Browser Compat | Pure JS, no issues. |
| Performance | O(n) where n ≤ 4. Negligible. |

**Summary:** Solid architecture with several concrete bugs. Fix the `processJoins` early return, the `for...in` pattern, and add guard checks.

---

### 1.4 economy.js — Economy & Upgrade System (GRO-954, GRO-960)
**Rating: ⚠️ Needs Attention (Unintegrated)**

| Criterion | Assessment |
|-----------|-----------|
| Code Quality | Excellent documentation. Comprehensive data structures: 5 scrap types with rarity tiers, 6 ships with costs, 4 upgrade trees (weapon/shield/engine/special), 5 permanent upgrades, 4 enemy drop tables. Cheat-prevention via segment-based loot tracking is clever. Asset generation prompts at bottom are helpful. |
| Integration | Only `Economy.init()` is called (in index.html line 449). **None of the core methods** (`rollDrop`, `shouldDrop`, `createDrop`, `weaponCost`, `getShopCatalog`, etc.) are referenced anywhere in index.html. The Economy module is wired in but functionally dead. |
| Edge Cases | ✅ `shouldDrop()` segment-tracking prevents save-scum farming. ✅ `rollDrop()` biome multiplier scales drops. ✅ Tier upgrade chance (2%) adds variety. ❌ `createDrop()` accesses `this.scrapTypes[type]` without null check (line 168). ❌ `_lootedSegments` never pruned — could grow over very long sessions. |
| Browser Compat | Pure JS, no issues. |
| Performance | Set-based looted tracking is O(1) add/has. All operations are lightweight. |

**Summary:** This is a **well-designed but dead module**. The enemy spawning/kill code in index.html needs to call `Economy.rollDrop()` and `Economy.shouldDrop()` to activate it. This is the #1 integration gap in the project.

---

### 1.5 ngplus.js — New Game+ System (GRO-967)
**Rating: ⚠️ Needs Attention (Unintegrated)**

| Criterion | Assessment |
|-----------|-----------|
| Code Quality | Clean, focused module. Good parameter documentation. Paradox enemy modifiers scale sensibly. Scrap multipliers follow a reasonable progression (1.0→1.5→2.0→3.0). |
| Integration | Depends on `CampaignSave.load()` (correct). **But never called from index.html.** No `NGPlus.start()`, `NGPlus.rollParadox()`, or `NGPlus.applyParadox()` invocations exist in the game loop. |
| Edge Cases | ✅ `start()` requires biome ≥ 10 to qualify. ✅ `rollParadox()` caps ngLevel at 3 for modifier lookup. ✅ `getScrapMult()` handles missing save. ❌ `summarize()` called with null save — returns null, which is fine but caller should guard. |
| Browser Compat | Pure JS, no issues. |
| Performance | O(1) operations. |

**Summary:** Another well-built module that's never wired into the game loop. Needs integration into the game-over/win flow (calling `NGPlus.start()` on completed run) and enemy spawning (calling `NGPlus.rollParadox()` per enemy).

---

### 1.6 leaderboard.js — Leaderboard System (GRO-968)
**Rating: ⚠️ Needs Attention (Duplicate System)**

| Criterion | Assessment |
|-----------|-----------|
| Code Quality | Well-structured with 3 categories (speedrun, scrapLord, survivor), 5-tier ranking (Bronze→Paradox), personal best tracking, category-specific sort orders. `renderHTML()` provides good HTML output. |
| Integration | **Loaded but never used.** Index.html has its own separate leaderboard system (lines 501–568) using a different localStorage key (`darius_star_scores` vs `darius_star_leaderboard`). This is a complete duplication. |
| Edge Cases | ✅ `isPersonalBest()` guards empty entries array. ❌ **`getTier()` logic issue:** The tier loop checks both the explicit `value >= tier.min && value <= tier.max` AND an additional sort-based condition. For speedrun (asc), if value=500, Bronze matches (500 in [1,3600] AND 500≤3600), so it returns Bronze. But Gold also has max=1500. The first-match-wins approach means overlapping tier ranges (all have min=1 for speedrun) always return Bronze. The tier ranges need non-overlapping definitions. |
| Browser Compat | Pure JS, no issues. |
| Performance | O(n log n) on save for sorting; O(n) for display. Top 50 cap prevents unbounded growth. |

**Summary:** A well-designed module that is **completely unused**. Index.html has its own flat scoreboard. Pick one system and retire the other. The tier range overlap bug must be fixed if this module is adopted.

---

### 1.7 upgrade_system.js — Meta-Progression Upgrade System
**Rating: ✅ Good**

| Criterion | Assessment |
|-----------|-----------|
| Code Quality | Class-based, IIFE-wrapped, good schema migration via deep-merge with defaults. Clear separation of concerns: config/metadata, state management, cost calculation, cosmetic unlocking, gameplay modifier computation. |
| Integration | Exposed as `window.DS_UpgradeSystem`. **Well-integrated:** Used in ~10 places in index.html for gameplay modifiers, scrap addition, and menu display. Also used by upgrade_shop.html for the full shop UI. |
| Edge Cases | ✅ `loadState()` handles corrupted localStorage with fallback to defaults. ✅ `buyUpgrade()` checks cost before deducting. ✅ `isCosmeticUnlocked()` explicit rank checks per cosmetic. ❌ **`resetState()` confusion:** Lines 116–130 increment `state.upgrades[cat]` during cost calculation loop, then overwrite with defaults — functionally correct but confusing to read. ❌ **`getGameplayModifiers()` creates new object every call** — called every frame in the player update loop, creating GC pressure. |
| Browser Compat | Uses ES6 classes — not compatible with IE11. Acceptable for a game targeting modern browsers. |
| Performance | `getGameplayModifiers()` called ~3 times per frame (player constructor, update loop, various enemy handlers). Returns new object each time. Recommend caching with invalidation on `buyUpgrade()`/`resetState()`. |

**Summary:** The best-integrated module in the project. The only real concern is the per-frame object allocation from `getGameplayModifiers()`.

---

### 1.8 index.html — Main Game File
**Rating: ⚠️ Needs Attention**

| Criterion | Assessment |
|-----------|-----------|
| Code Quality | ~5000-line monolithic file. Contains: game loop, player/enemy/boss classes, menu/settings/credits/leaderboard screens, Web Audio synthesizer, cinematic playback, parallax backgrounds, dialogue system, scoring, UI. Functions are well-named but file is too large. |
| Integration | Correct script loading order (lines 278–284): upgrade_system → save_system → economy → banter_engine → multiplayer → ngplus → leaderboard. This respects dependency chains. But **only CampaignSave, BanterEngine, Multiplayer, and DS_UpgradeSystem are actually called.** Economy, NGPlus, Leaderboard modules are loaded but never invoked. |
| Edge Cases | ❌ **No module re-init on `resetGame()`:** Lines 4104–4164 reset game state but don't call `Multiplayer.init()`, `Economy.init()`, or `BanterEngine.init()`. After player death/restart, modules retain stale state. ❌ **Duplicate leaderboard:** Lines 501–568 implement a flat high-score system using a different key than leaderboard.js. ❌ **`runScrapSaved` flag (line 4537) is set once** but never reset — after first game-over, all subsequent deaths skip scrap saving. ❌ **`window._loadSaves`** and **`window._resumeSave`** use global window pollution for state passing. |
| Browser Compat | ✅ Web Audio fallback: `window.AudioContext \|\| window.webkitAudioContext`. ✅ canvas with pixelated rendering. ✅ touch controls with `@media (hover: none)`. ✅ `playsinline` on videos. |
| Performance | ✅ Offscreen buffers for star/sea layers with 200–250ms lazy rebuild. ✅ `requestAnimationFrame` loop. ❌ `innerText` updates on every frame for ALL UI elements regardless of change — should guard with dirty checks. ❌ Player constructor and update loop both call `DS_UpgradeSystem.getGameplayModifiers()` creating fresh objects. |

**Summary:** The central nervous system works but is carrying dead weight (unused modules) and has stale-state risks on restart. The file is due for splitting — the dialogue, cinematic, and menu systems alone could be separate files.

---

## 2. Integration Wiring Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SCRIPT LOAD ORDER                            │
│  (index.html lines 278–284)                                         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│ upgrade_sys-  │          │ save_system.js │          │ economy.js    │
│ tem.js        │          │ (CampaignSave) │          │ (Economy)     │
│ (DS_Upgrade-  │          │                │          │               │
│  System)      │          │ Used by:       │          │ Used by:      │
│               │          │  • index.html  │          │  • index.html │
│ Used by:      │          │  • ngplus.js   │          │    (init only)│
│  • index.html │          │                │          │                │
│  • upgrade_   │          │ Status: ❤️ LIVE │          │ Status: 💀 DEAD│
│    shop.html  │          └───────┬────────┘          └───────────────┘
│               │                  │
│ Status: ❤️ LIVE│          ┌───────▼────────┐
└───────────────┘          │ ngplus.js      │
                           │ (NGPlus)       │
                           │                │
                           │ Used by:       │
                           │  • NOBODY      │
                           │ Status: 💀 DEAD │
                           └────────────────┘

        ┌───────────────────────────┐
        ▼                           │
┌───────────────┐          ┌────────▼──────┐          ┌───────────────┐
│ banter_engine │──────────▶│ multiplayer.js│          │ leaderboard.js│
│ .js           │ dependency│ (Multiplayer) │          │ (Leaderboard) │
│ (BanterEngine)│           │               │          │               │
│               │           │ Used by:      │          │ Used by:      │
│ Used by:      │           │  • index.html │          │  • NOBODY     │
│  • index.html │           │    (init,     │          │               │
│  • multiplayer│           │     update)   │          │ Status: 💀 DEAD│
│    .js        │           │               │          │  (duplicate of │
│               │           │ Status: ⚠️ LIVE│          │   index.html  │
│ Status: ❤️ LIVE│           │  (with bugs)  │          │   own system) │
└───────────────┘           └───────────────┘          └───────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                      index.html (4976 lines)                         │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ Menu System  │  │ Game Loop    │  │ Own Leaderboard          │   │
│  │              │  │              │  │ (LS_KEY: darius_star_    │   │
│  │ • CONTINUE→  │  │ • update()   │  │  scores)                 │   │
│  │   Campaign-  │  │ • draw()     │  │                          │   │
│  │   Save.load  │  │ • BanterEng- │  │  ❗ DUPLICATE of          │   │
│  │ • SETTINGS   │  │   ine.update │  │  leaderboard.js module   │   │
│  │ • CREDITS    │  │ • DS_Upgrade │  └──────────────────────────┘   │
│  │ • LEADERBOARD│  │   System     │                                 │
│  └──────────────┘  │ • Multiplay- │  ┌──────────────────────────┐   │
│                     │   er.update  │  │ Web Audio Synth          │   │
│  ┌──────────────┐  │ • playSound  │  │ • Menu music loop        │   │
│  │ Cinematics   │  │ • Own scrap  │  │ • Credits music loop     │   │
│  │              │  │   tracking   │  │ • SFX: 10 sound types    │   │
│  │ • Boss intro │  │   (runScrap) │  └──────────────────────────┘   │
│  │ • Victory    │  │              │                                 │
│  │ • Ending     │  │ ❗ Does NOT   │  ┌──────────────────────────┐   │
│  └──────────────┘  │  call:       │  │ UI System                │   │
│                     │  Economy.*   │  │ • 10 ui-* span elements  │   │
│                     │  NGPlus.*    │  │ • Updated every frame    │   │
│                     │  Leaderboard │  └──────────────────────────┘   │
│                     └──────────────┘                                 │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────┐     ┌──────────────────┐
│ ship_select.  │     │ upgrade_shop.html │
│ html          │     │                  │
│               │     │ Uses:            │
│ Uses:         │     │  • DS_Upgrade-   │
│  • NOTHING    │     │    System only   │
│  from the 7   │     │                  │
│  JS modules   │     │ Status: ❤️ LIVE   │
└───────────────┘     └──────────────────┘

LEGEND:
  ❤️ LIVE  = Actively called and functional
  ⚠️ LIVE  = Called but has bugs
  💀 DEAD  = Loaded but never invoked
```

---

## 3. Top 5 Issues — Ranked by Severity

### 🔴 Issue #1: Economy Module Is Dead Code (CRITICAL)
**Severity:** High — Blocks GRO-934 (enemy variety), core gameplay loop is incomplete.

The `Economy` module defines scrap drops, enemy type tables, ship costs, upgrade trees, and cheat-prevention loot tracking — but **none of it is called** in the game loop. Index.html tracks `runScrap` manually with its own counters. Enemy kills don't call `Economy.rollDrop()`. The upgrade shop uses `DS_UpgradeSystem` instead. All the design work in economy.js is wasted.

**Fix:** Hook `Economy.rollDrop(enemyType, biome)` into the enemy death handler. Hook `Economy.shouldDrop(enemyId)` to prevent farming. Wire ship purchase costs through `Economy.shipCost()`.

---

### 🔴 Issue #2: NG+ Module Is Dead Code (CRITICAL)
**Severity:** High — Blocks the entire NG+ feature.

`NGPlus.start()`, `NGPlus.rollParadox()`, and `NGPlus.applyParadox()` are never called. The Paradox enemy system (colored variants with HP/speed multipliers and 3x scrap) is completely inaccessible.

**Fix:** On game completion (biome 10 boss defeat), offer NG+ via `NGPlus.start(slot)`. In enemy spawning, call `NGPlus.rollParadox(ngLevel, biome)` to randomly upgrade enemies.

---

### 🔴 Issue #3: Duplicate Leaderboard Systems (HIGH)
**Severity:** High — Confusion and wasted effort.

`leaderboard.js` defines a 3-category, 5-tier system (speedrun/scrapLord/survivor with Bronze→Paradox ranks). But index.html lines 501–568 implement a completely separate flat high-score system using a different localStorage key. The `Leaderboard` module's `renderHTML()` is never called, `submit()` is never invoked.

**Fix:** Choose one system. If leaderboard.js is preferred, replace the inline leaderboard code in index.html with calls to `Leaderboard.submit()` and `Leaderboard.renderHTML()`. Fix the overlapping tier range bug in `getTier()`.

---

### 🟡 Issue #4: No Module Re-Initialization on Game Reset (MEDIUM)
**Severity:** Medium — Stale state across runs.

`resetGame()` (line 4104) resets the player, enemies, bullets, score, and visual state — but does **not** re-initialize `Multiplayer`, `Economy`, or `BanterEngine`. After a death and restart:
- Multiplayer retains old player array and join/leave queues
- Economy retains looted segment tracking from the previous run
- BanterEngine retains `_playedLines` from the previous run (so all dialogue may be exhausted)

**Fix:** Add `Multiplayer.init()`, `Economy.init()`, and `BanterEngine.clear()` calls inside `resetGame()`.

---

### 🟡 Issue #5: getGameplayModifiers() Allocates Per Frame (MEDIUM)
**Severity:** Medium — GC pressure, performance degradation over time.

`DS_UpgradeSystem.getGameplayModifiers()` is called 3+ times per frame (player constructor, player update, enemy handlers). Each call creates a new object (~25 properties). At 60fps, that's 180+ objects/second of unnecessary allocation.

**Fix:** Cache the result. Invalidate the cache only in `buyUpgrade()` and `resetState()`. Return the cached object.

---

## 4. GRO Ticket Recommendations

### GRO-917: Voice Lines

**What exists in the codebase:** The `BanterEngine._data` structure already maps all 10 biomes × 8 trigger types with speaker-tagged lines. Speaker IDs: `D` (Darius/Naya), `O` (Ophion), `L` (Lyra), `C` (Captain), `N` (Nyx).

**Recommended approach:**

1. **Extend the line data model.** Add an optional `audio` property to each line object in `_data`:
   ```
   {s:'D', l:"Deepest place on Earth...", audio:'vo_b1_start_01.ogg'}
   ```
   Lines without audio fall back to text-only display (existing behavior).

2. **Add audio playback to `BanterEngine.trigger()`.** When a line with an `audio` property is triggered, play the clip through the existing Web Audio context (`audioCtx` in index.html). The BanterEngine should emit a callback or event rather than directly owning audio — keep it decoupled.

3. **Naming convention:** `vo_b{biome}_{trigger}_{index}.ogg` — e.g., `vo_b1_level_start_01.ogg`, `vo_b5_boss_entrance_01.ogg`.

4. **Integration points to modify:**
   - `banter_engine.js` line 163 (`trigger` method) — fire an audio event
   - index.html lines 4575–4585 (banter display loop) — handle the audio event

5. **Fallback:** If audio file fails to load, still display text. If `audioCtx` is suspended (autoplay policy), queue playback for next user interaction.

---

### GRO-919: Filler Music

**What exists in the codebase:** A Web Audio chiptune synthesizer with two loops:
- Menu music (lines 628–685): `bassLine[]` + `melody[]`, `setInterval` at 200ms
- Credits music (lines 688–741): separate `creditsBassLine[]` + `creditsMelody[]`, `setInterval` at 250ms

Both use `audioCtx.createOscillator()` with sawtooth/triangle/sine waveforms.

**Recommended approach:**

1. **Refactor the music system into its own module** (`music_engine.js`) to stop index.html from growing further. Move `playMenuMusicStep`, `playCreditsMusicStep`, `startMenuMusic`, `stopMenuMusic`, `startCreditsMusic`, `stopCreditsMusic` out of index.html.

2. **Add biome-specific music tracks.** Create a track registry:
   ```
   const BIOME_TRACKS = {
       1: { bass: [110,110,130,130,...], melody: [220,0,261,...], tempo: 200 },
       2: { bass: [...], melody: [...], tempo: 220 },
       ...
   };
   ```

3. **Transition on biome change.** In index.html's `update()` function, when the biome changes, crossfade to the new track. The `musicInterval` pattern already supports this — just change the note arrays and restart the step counter.

4. **Boss music.** Detect boss presence and switch to a higher-intensity track (faster tempo, harsher waveform like square wave).

5. **Silence during dialogue/cinematics.** The existing check `currentScreen === 'playing'` in `playMenuMusicStep()` already prevents menu music during gameplay. Extend this pattern to pause music during active dialogue and cinematics.

6. **Pre-rendered audio fallback.** For browsers that support it, consider loading Ogg Vorbis loops and playing them through `AudioBufferSourceNode` with `loop=true` for better quality than synthesized chiptune. Keep the synthesizer as a fallback.

---

### GRO-934: Enemy Variety

**What exists in the codebase:**
- `Economy.scrapDropTable` defines 4 enemy types (grunt/elite/boss/unique) with min/max drops and bonus type chances
- `Economy.rollDrop(enemyType, biomeLevel)` computes biome-scaled scrap drops with rare tier upgrades
- `NGPlus.rollParadox(ngLevel, biome)` rolls for Paradox enemy upgrades with increasing probability
- `NGPlus.applyParadox(enemy, paradox)` applies HP/speed/color/scrap multipliers
- `NGPlus.paradoxMods` defines 3 tiers of Paradox enemies

**None of these are wired into the enemy lifecycle.** Recommendation:

1. **Wire Economy into enemy death.** When an enemy dies in index.html's update loop:
   - Call `Economy.shouldDrop(enemyId)` to prevent checkpoint farming
   - Call `Economy.rollDrop(enemyType, biome)` to determine drops
   - Call `Economy.createDrop(x, y, type, amount)` to spawn scrap pickups
   - This replaces the manual `runScrap` tracking

2. **Wire NG+ into enemy spawning.** When spawning enemies:
   - If on NG+ run, call `NGPlus.rollParadox(ngLevel, currentBiome)`
   - If Paradox is rolled, call `NGPlus.applyParadox(enemy, paradox)`
   - Paradox enemies get visual distinction (paradoxColor tint) and 3x scrap

3. **Add enemy type tagging.** The current index.html enemy system needs an `enemyType` property (`'grunt'`, `'elite'`, `'boss'`, `'unique'`) on each enemy to feed into `Economy.rollDrop()`.

4. **Biome-specific enemy varieties.** The Economy's `scrapDropTable` already supports this — `unique` enemies have 15% chance for Dreamer Essence drops. Adding biome-specific enemy variants is a matter of extending the enemy spawning logic in index.html to reference Economy's data.

5. **Integration touchpoints in index.html:**
   - Enemy constructor (~line range for enemy classes): Add `enemyType` property
   - Enemy death handler: Add `Economy.rollDrop()` + scrap spawning
   - Game start / NG+ start: Add `NGPlus.rollParadox()` calls
   - Checkpoint restore: Ensure `Economy._lootedSegments` is preserved correctly

---

## 5. Summary

| Module | Rating | Status | Key Issue |
|--------|--------|--------|-----------|
| save_system.js | ✅ Good | Live | Missing version migration |
| banter_engine.js | ✅ Good | Live | `_playedLines` grows unbounded |
| multiplayer.js | ⚠️ Attention | Live (buggy) | `processJoins` early return, `for...in` usage |
| economy.js | ⚠️ Attention | Dead | **Completely unintegrated** |
| ngplus.js | ⚠️ Attention | Dead | **Never called** |
| leaderboard.js | ⚠️ Attention | Dead | **Duplicate system exists** |
| upgrade_system.js | ✅ Good | Live | Per-frame object allocation |
| index.html | ⚠️ Attention | Live | Dead modules, no re-init, file too large |

**Overall Assessment:** The project has strong individual modules with good design and documentation, but suffers from a significant **integration gap**. Three of seven modules (Economy, NG+, Leaderboard) are well-coded but never wired into the game loop. The main game file (index.html) is monolithic at ~5000 lines and has duplicate functionality for the leaderboard. The highest-impact fix is activating the Economy module, which would immediately improve enemy variety (GRO-934) and provide the foundation for NG+ (GRO-967) integration.

**Top priority actions (in order):**
1. Wire `Economy.rollDrop()` / `Economy.shouldDrop()` into enemy death handling
2. Wire `NGPlus.rollParadox()` / `NGPlus.applyParadox()` into enemy spawning
3. Unify the two leaderboard implementations
4. Add module re-initialization to `resetGame()`
5. Add caching to `DS_UpgradeSystem.getGameplayModifiers()`
