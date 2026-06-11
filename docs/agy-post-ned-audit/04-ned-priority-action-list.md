# Report 4: Ned's Priority Action List

This action list prioritizes the remaining work for Ned to finalize and ship **Darius Star: Cyber Coelacanth**. Tasks are ordered by impact, starting with critical progression blockers.

---

## Priority 1: Critical Bugs (Progression Blockers)

### 1. Fix LevelManager Progression / Infinite Boss Loop (`GRO-1157`)
*   **Description:** Defeating the mid-boss at Biome 1 Level 5 triggers `advanceToNextBiome()` which resets boss variables, but fails to advance the level or biome in `LevelManager`. The game remains trapped on Level 5 and spawns the boss again immediately.
*   **Action:** Modify `advanceToNextBiome()` in [ui.js](file:///home/ubuntu/work/darius-star/js/ui.js) to call `LevelManager.advanceLevel()` or `LevelManager.setBiomeAndLevel(LevelManager.biome + 1, 1)` to advance the level/biome configuration.
*   **Affected File(s):** [js/ui.js](file:///home/ubuntu/work/darius-star/js/ui.js) (specifically `advanceToNextBiome()`).
*   **Est. Effort:** 1.0 hour.

### 2. Correct Boss Sprite Image Source Path
*   **Description:** `preloadBossAssets()` in `sprites.js` attempts to load `assets/sprites/boss_0.png` for the boss entity. However, the file is located at `assets/boss_0.png` in the repository, causing a 404 error and forcing a canvas-drawn fallback body.
*   **Action:** Update the src path in `preloadBossAssets` to load from `assets/boss_0.png`.
*   **Affected File(s):** [js/sprites.js](file:///home/ubuntu/work/darius-star/js/sprites.js#L133).
*   **Est. Effort:** 0.5 hours.

### 3. Fix Parallax setKey Fallback Naming Bug (`GRO-1155`)
*   **Description:** `ParallaxLayer.setKey(newKey)` looks up `newKey` (e.g. `'bg_2_far'`) in `BIOME_STRIP_MAP` which only contains prefix keys (e.g. `'bg_2'`). Because of this mismatch, it defaults to `'abyssal_trench'` (`'bg_1'`) for all biomes when assets fail, instead of running the beautiful biome-specific procedural backgrounds.
*   **Action:** Modify `setKey` to strip `_far` and `_near` suffixes from `newKey` before querying the biome name mapping.
*   **Affected File(s):** [js/renderer.js](file:///home/ubuntu/work/darius-star/js/renderer.js#L344-L353).
*   **Est. Effort:** 1.0 hour.

---

## Priority 2: Integration Gaps & Quality Fixes

### 4. Resolve Enemy Sprite Preloading Race Condition (`GRO-1158`)
*   **Description:** `loadEnemySprites()` assigns `enemySprites[key] = img` before the `onload` pre-compositing canvas replaces it. If a draw occurs in this window, it renders the raw, uncomposited image.
*   **Action:** Remove `enemySprites[key] = img;` at line 60 of `sprites.js` and keep only the `onload` canvas assignment.
*   **Affected File(s):** [js/sprites.js](file:///home/ubuntu/work/darius-star/js/sprites.js#L60).
*   **Est. Effort:** 0.5 hours.

### 5. Decouple `ScrapDrop` Class Definition
*   **Description:** `class ScrapDrop` is implemented at the top of `renderer.js` but has its comment header at the end of `combat.js`. Gameplay entities should not be coupled inside the background rendering layer.
*   **Action:** Move `class ScrapDrop` from [renderer.js](file:///home/ubuntu/work/darius-star/js/renderer.js) to [combat.js](file:///home/ubuntu/work/darius-star/js/combat.js) and remove the comments.
*   **Affected File(s):** [js/renderer.js](file:///home/ubuntu/work/darius-star/js/renderer.js) & [js/combat.js](file:///home/ubuntu/work/darius-star/js/combat.js).
*   **Est. Effort:** 0.5 hours.

### 6. Explicitly Bind Classes to the `window` Object
*   **Description:** Key classes (`Enemy`, `Boss`, `Bullet`, `PowerUp`, `SpriteExplosion`, `ScrapDrop`) are declared globally but not explicitly attached to `window`. This can fail in strict scoping test runners or Node environments.
*   **Action:** Add explicit attachments at the bottom of respective scripts (e.g. `window.Enemy = Enemy;`).
*   **Affected File(s):** [js/enemies.js](file:///home/ubuntu/work/darius-star/js/enemies.js), [js/combat.js](file:///home/ubuntu/work/darius-star/js/combat.js).
*   **Est. Effort:** 0.5 hours.

### 7. Harden Lifecycle Timeout Cleanups
*   **Description:** Player dodge resetting and boss phase transitions utilize fire-and-forget `setTimeout` calls that are never stored or cleared. If the player exits or restarts a level, these timers keep running, causing potential state desyncs.
*   **Action:** Store `setTimeout` IDs in the respective classes and clear them using `clearTimeout()` inside cleanup/reset functions.
*   **Affected File(s):** [js/player.js](file:///home/ubuntu/work/darius-star/js/player.js), [js/enemies.js](file:///home/ubuntu/work/darius-star/js/enemies.js).
*   **Est. Effort:** 1.5 hours.

---

## Priority 3: Missing Features & Assets

### 8. Generate and Place Missing Sprite Assets
*   **Description:** Dialogue boxes look for portraits, and the boss loop looks for minion sprites which are missing from disk.
*   **Action:**
    1.  Generate and place 10 character portraits and `comms_overlay.png` in `assets/sprites/portraits/`.
    2.  Generate and place `boss_minion_0.png` in `assets/sprites/`.
    3.  Generate background layers for Biome 9 (Xenomorph Hive) and a near layer for Biome 8 (Derelict Fleet).
*   **Affected File(s):** Repository assets folders.
*   **Est. Effort:** 4.0 hours (mostly sprite generation/sourcing).

### 9. Build specialized Audio Navigation Tunnel for Biome 7
*   **Description:** Biome 7 features a comatose Lyra, meaning standard navigational instruments fail. The design requires a zero-visibility level where the player navigates purely using spatial audio cues.
*   **Action:** Implement low-visibility screen filters and wire directional synth frequency loops to guide players.
*   **Affected File(s):** [js/game_loop.js](file:///home/ubuntu/work/darius-star/js/game_loop.js), [js/audio.js](file:///home/ubuntu/work/darius-star/js/audio.js).
*   **Est. Effort:** 6.0 hours.

---

## Priority 4: Polish & Slicing

### 10. Fix Weapon Blast Sprite Sheets Slicing (`GRO-1159`)
*   **Description:** Level 5 weapon blasts load the whole sprite sheet instead of slicing it, creating solid blocks around explosions.
*   **Action:** Update `sprites.js` to slice weapon blast frames at runtime (similar to the explosion sheets).
*   **Affected File(s):** [js/sprites.js](file:///home/ubuntu/work/darius-star/js/sprites.js) & [js/renderer.js](file:///home/ubuntu/work/darius-star/js/renderer.js).
*   **Est. Effort:** 3.0 hours.

### 11. Normalize global file indentation
*   **Description:** `audio.js` and `ui.js` contain global 8-space indentations.
*   **Action:** Format/beautify the code to standard 4-space or 2-space indentation.
*   **Affected File(s):** [js/audio.js](file:///home/ubuntu/work/darius-star/js/audio.js), [js/ui.js](file:///home/ubuntu/work/darius-star/js/ui.js).
*   **Est. Effort:** 1.0 hour.
