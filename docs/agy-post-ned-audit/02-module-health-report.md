# Report 2: Module Health Report

This report assesses all 20 JavaScript modules currently residing in [js/](file:///home/ubuntu/work/darius-star/js/) that power the game engine of **Darius Star: Cyber Coelacanth**. The modules are loaded sequentially in [index.html](file:///home/ubuntu/work/darius-star/index.html) in strict dependency order.

---

## Module Health Assessments

### 1. `audio.js`
*   **Size:** 900 lines | 49,396 bytes
*   **Quality Score:** 8.0 / 10
*   **Works:** Yes
*   **Integration Gaps:** Global scope pollution (helper arrays leak globally). Entire file is indented by 8 spaces.
*   **Missing Features:** Zero-visibility audio-navigation level mechanics for Biome 7 (Lyra Navigator comatose stage).

### 2. `banter_db.js`
*   **Size:** 214 lines | 24,367 bytes
*   **Quality Score:** 9.5 / 10
*   **Works:** Yes
*   **Integration Gaps:** None.
*   **Missing Features:** None. Dialogue lines for all characters across 10 biomes are cleanly mapped.

### 3. `banter_engine.js`
*   **Size:** 201 lines | 7,780 bytes
*   **Quality Score:** 9.0 / 10
*   **Works:** Yes
*   **Integration Gaps:** None. (Exposed as `window.BanterEngine` in commit `d716794`).
*   **Missing Features:** None.

### 4. `combat.js`
*   **Size:** 199 lines | 7,881 bytes
*   **Quality Score:** 7.5 / 10
*   **Works:** Yes
*   **Integration Gaps:** Dangling comment header `// --- ScrapDrop Class ---` at the end (line 199), but the actual class is implemented inside `renderer.js`.
*   **Missing Features:** Clean architectural separation of entity groups (ScrapDrop belongs in combat/entities, not renderer).

### 5. `combo.js`
*   **Size:** 226 lines | 7,456 bytes
*   **Quality Score:** 8.5 / 10
*   **Works:** Yes
*   **Integration Gaps:** Pollutes global scope, lacks explicit `window` binding for strict scopes.
*   **Missing Features:** None.

### 6. `economy.js`
*   **Size:** 171 lines | 5,968 bytes
*   **Quality Score:** 9.0 / 10
*   **Works:** Yes
*   **Integration Gaps:** Implicit references to global `biomeLevel` in fallbacks.
*   **Missing Features:** None.

### 7. `enemies.js`
*   **Size:** 678 lines | 34,258 bytes
*   **Quality Score:** 7.5 / 10
*   **Works:** **Partial**
*   **Integration Gaps:** Boss defeat schedules `advanceToNextBiome()` in `ui.js`, but doesn't notify `LevelManager` that the boss is dead, creating an infinite boss loop on level 5. Timeouts for cinematic transitions are fire-and-forget (not cleared on exit).
*   **Missing Features:** Missing `boss_minion_0.png` sprite (causes invisible minion rendering; falls back to colored circle). Boss sprite `boss_0.png` path points to `assets/sprites/boss_0.png` instead of the actual `assets/boss_0.png` on disk.

### 8. `game_loop.js`
*   **Size:** 1,963 lines | 77,796 bytes
*   **Quality Score:** 8.0 / 10
*   **Works:** **Partial** (Gameplay halts at Biome 1 Level 5 mid-boss)
*   **Integration Gaps:** Deeply dependent on sequential loading of all preceding modules. Shares highly mutable global state (`enemies`, `bullets`, etc.). Timers (`lowHealthPulseTimer`, etc.) are not cleared on level restarts.
*   **Missing Features:** Safe state clearing/restoration when loading/exiting runs.

### 9. `leaderboard.js`
*   **Size:** 124 lines | 4,388 bytes
*   **Quality Score:** 10.0 / 10
*   **Works:** Yes
*   **Integration Gaps:** None.
*   **Missing Features:** None.

### 10. `level_manager.js`
*   **Size:** 458 lines | 17,991 bytes
*   **Quality Score:** 7.0 / 10
*   **Works:** **Partial**
*   **Integration Gaps:** Spawning works but is progression-blocked after boss defeat because it never receives a signal to advance its internal `biome` or `level` state, leaving `bossTrigger` true forever.
*   **Missing Features:** Callback hook (e.g. `onBossDefeated()`) to cleanly increment level/biome config.

### 11. `multiplayer.js`
*   **Size:** 221 lines | 7,773 bytes
*   **Quality Score:** 9.5 / 10
*   **Works:** Yes
*   **Integration Gaps:** None.
*   **Missing Features:** None.

### 12. `ngplus.js`
*   **Size:** 143 lines | 5,080 bytes
*   **Quality Score:** 10.0 / 10
*   **Works:** Yes
*   **Integration Gaps:** None.
*   **Missing Features:** None.

### 13. `player.js`
*   **Size:** 1,026 lines | 46,214 bytes
*   **Quality Score:** 8.0 / 10
*   **Works:** Yes
*   **Integration Gaps:** Dodge cooldown/reset relies on fire-and-forget `setTimeout` that is never cleared on exit/reset. Tight coupling to global pools.
*   **Missing Features:** None.

### 14. `renderer.js`
*   **Size:** 1,263 lines | 60,308 bytes
*   **Quality Score:** 7.5 / 10
*   **Works:** **Partial**
*   **Integration Gaps:** Couples `ScrapDrop` entity class. `ParallaxLayer.setKey` has a bug where it maps keys to `BIOME_STRIP_MAP` but the keys passed are `bg_X_far` / `bg_X_near`. Since these don't exist in the map, they resolve to `undefined` and fall back to the Abyssal Trench (`bg_1`) strip, rendering it for all biomes when image assets fail.
*   **Missing Features:** Missing scroll layers for Biome 9 (Xenomorph Hive - no files, falls back to procedural/abyssal_trench), and Biome 8 (Derelict Fleet - near layer is missing).

### 15. `save_system.js`
*   **Size:** 279 lines | 9,178 bytes
*   **Quality Score:** 10.0 / 10
*   **Works:** Yes
*   **Integration Gaps:** None.
*   **Missing Features:** None.

### 16. `scrap_events.js`
*   **Size:** 119 lines | 3,878 bytes
*   **Quality Score:** 9.5 / 10
*   **Works:** Yes
*   **Integration Gaps:** None.
*   **Missing Features:** None.

### 17. `sprites.js`
*   **Size:** 164 lines | 6,685 bytes
*   **Quality Score:** 8.0 / 10
*   **Works:** **Partial**
*   **Integration Gaps:** `loadEnemySprites()` has a race condition: it assigns `enemySprites[key] = img` at line 60 before the `onload` pre-compositing canvas replaces it. If a draw occurs in between, it draws a raw, uncomposited Image.
*   **Missing Features:** Spliced weapon blast frames (sheets are rendered whole, resulting in large boxes around blasts). Loading paths for biome-specific enemy sprites are not defined (not preloaded).

### 18. `touch_controls.js`
*   **Size:** 311 lines | 11,400 bytes
*   **Quality Score:** 9.0 / 10
*   **Works:** Yes
*   **Integration Gaps:** None.
*   **Missing Features:** None.

### 19. `ui.js`
*   **Size:** 2,584 lines | 126,117 bytes
*   **Quality Score:** 7.0 / 10
*   **Works:** **Partial**
*   **Integration Gaps:** `advanceToNextBiome()` resets the boss variables but never calls `LevelManager.advanceLevel()` or `LevelManager.setBiomeAndLevel()`. Registers window keyboard/touch listeners that are never removed. Entire file is indented by 8 spaces.
*   **Missing Features:** None.

### 20. `upgrade_system.js`
*   **Size:** 236 lines | 8,832 bytes
*   **Quality Score:** 9.5 / 10
*   **Works:** Yes
*   **Integration Gaps:** None.
*   **Missing Features:** None.
