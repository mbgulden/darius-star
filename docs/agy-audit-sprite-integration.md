# AGY Audit Report: Sprite Integration & Slicing
**Verdict**: NEEDS_FIXES  
**Target Files**: 
* [js/sprites.js](file:///home/ubuntu/work/darius-star/js/sprites.js) (preloading definitions)
* [js/utils.js](file:///home/ubuntu/work/darius-star/js/utils.js) (drawSpriteFrame helper)
* [js/player.js](file:///home/ubuntu/work/darius-star/js/player.js) (player rendering)
* [js/enemies.js](file:///home/ubuntu/work/darius-star/js/enemies.js) (enemy rendering)
**Reference Issue**: GRO-1468  

---

## 1. Executive Summary
This report audits the preloading system and sprite sheet slicing utilities across the modular game engine. Although the preloading functions are wired and run on startup and the image files physically exist on disk, several critical logic bugs render player ships invisible, keep bosses static, and break biome-specific enemy visual variety.

---

## 2. Detailed Findings

### A. Preloading Functions Wiring
* **File Reference**: [js/sprites.js:L8](file:///home/ubuntu/work/darius-star/js/sprites.js#L8) (`loadPlayerSprites`), [L30](file:///home/ubuntu/work/darius-star/js/sprites.js#L30) (`loadPortraitSprites`), [L52](file:///home/ubuntu/work/darius-star/js/sprites.js#L52) (`loadEnemySprites`), [L68](file:///home/ubuntu/work/darius-star/js/sprites.js#L68) (`loadVFXSprites`), [L129](file:///home/ubuntu/work/darius-star/js/sprites.js#L129) (`preloadBossAssets`).
* **Finding**: Preloading triggers successfully wire into game initialization and deferred boss triggers:
  * `loadPlayerSprites()`: Called in [ui.js:L1221](file:///home/ubuntu/work/darius-star/js/ui.js#L1221), [L1487](file:///home/ubuntu/work/darius-star/js/ui.js#L1487) and [game_loop.js:L1581](file:///home/ubuntu/work/darius-star/js/game_loop.js#L1581).
  * `loadPortraitSprites()`: Called in [ui.js:L1222](file:///home/ubuntu/work/darius-star/js/ui.js#L1222), [L1488](file:///home/ubuntu/work/darius-star/js/ui.js#L1488), [utils.js:L324](file:///home/ubuntu/work/darius-star/js/utils.js#L324), and [game_loop.js:L1582](file:///home/ubuntu/work/darius-star/js/game_loop.js#L1582).
  * `loadEnemySprites()`: Called in [ui.js:L1223](file:///home/ubuntu/work/darius-star/js/ui.js#L1223), [L1489](file:///home/ubuntu/work/darius-star/js/ui.js#L1489) and [game_loop.js:L1583](file:///home/ubuntu/work/darius-star/js/game_loop.js#L1583).
  * `loadVFXSprites()`: Called in [ui.js:L1224](file:///home/ubuntu/work/darius-star/js/ui.js#L1224), [L1490](file:///home/ubuntu/work/darius-star/js/ui.js#L1490) and [game_loop.js:L1584](file:///home/ubuntu/work/darius-star/js/game_loop.js#L1584).
  * `preloadBossAssets()`: Called in [game_loop.js:L509](file:///home/ubuntu/work/darius-star/js/game_loop.js#L509) when the score approaches 2,000.

### B. Critical Bug: Invisible Player Ships
* **File Reference**: [js/utils.js:L24-27](file:///home/ubuntu/work/darius-star/js/utils.js#L24-L27) and [js/player.js:L898](file:///home/ubuntu/work/darius-star/js/player.js#L898)
* **The Bug**: `player_0.png` (and other player ship variants) are saved as single 1024x1024 high-resolution images, not sprite sheets. However, in `player.js`, they are drawn using `drawSpriteFrame(ctx, sprite, 0, 0, SPRITE_FRAME, SPRITE_FRAME, 0, 0, spriteSize, spriteSize)` where `SPRITE_FRAME` is `48`.
* **Impact**: Because the image size (1024x1024) is larger than the frame size (48x48), `drawSpriteFrame` assumes it is a sprite sheet and extracts a 48x48 pixel crop from the top-left corner of the image. Since this corner contains only empty transparent space, the player ship renders as completely invisible in-game.

### C. Boss Animation Stuck on Frame 0
* **File Reference**: [js/enemies.js:L626](file:///home/ubuntu/work/darius-star/js/enemies.js#L626), [L633](file:///home/ubuntu/work/darius-star/js/enemies.js#L633), [L662](file:///home/ubuntu/work/darius-star/js/enemies.js#L662), and [L665](file:///home/ubuntu/work/darius-star/js/enemies.js#L665)
* **The Bug**: Boss state images (`boss_idle.png`, `boss_rage.png`, `boss_charge.png`, `boss_fire.png`, `boss_death.png`) are 1024x1024 sprite sheets containing a 4x4 grid of 256x256 frames (totaling 16 animation frames). However, in `enemies.js`, the drawing calls always pass `frameX = 0` and `frameY = 0` to `drawSpriteFrame`.
* **Impact**: The boss is completely static and never animates across any of its states.

### D. Missing Biome Enemy Sprite Preloading
* **File Reference**: [js/sprites.js:L55](file:///home/ubuntu/work/darius-star/js/sprites.js#L55)
* **The Bug**: Biome-specific enemy sprites (e.g. `enemy_b1_crawler_0.png`, `enemy_b2_wraith_0.png`, `enemy_b3_spider_0.png`) exist on disk, and the wave configuration triggers their spawning. However, `loadEnemySprites()` in `sprites.js` only loops over `['scout', 'interceptor', 'heavy', 'boss_minion']`.
* **Impact**: Biome enemy sprites are never loaded. When rendering, `enemies.js` line 262 evaluates `enemySprites[this.type]` to `undefined`, falling back to `enemySprites[this.behaviorPattern]`. Consequently, all enemies across all 10 biomes render as the generic scout, interceptor, or heavy graphics.

---

## 3. Recommended Actions

1. **Fix Player Invisible Crop Bug**:
   Add a specific flag or check in `drawSpriteFrame` or `player.js` to draw the entire image scaled down if it is a single-frame asset. E.g., check `sprites.json` frame count or add an override.
2. **Implement Boss Animation Cycles**:
   Update `js/enemies.js` Boss draw methods to calculate `frameX` and `frameY` based on game time and animation speed.
3. **Preload Biome Enemy Sprites**:
   Update `loadEnemySprites()` in `js/sprites.js` to iterate over all active enemy types specified in the campaign wave data, dynamically loading their sprites from disk.
