# Economy Integration — June 9, 2026

**Issue:** GRO-978 — Wire economy.js into game loop  
**Review:** docs/code-review-2026-06-09.md (AGY)  
**Status:** ✅ Complete

## Changes Made (all in index.html)

### 1. Enemy Type Tagging
- Added `this.enemyType` to Enemy constructor: `'grunt'`, `'elite'`, or `'grunt'` based on enemy class
- Added `this.enemyType = 'boss'` to Boss constructor
- Added `this.id = ++enemyIdCounter` to both for Economy.shouldDrop()

### 2. Scrap Drop on Enemy Death (~line 4478)
Replaced hardcoded metal/cell drops with:
```js
if (window.Economy && Economy.shouldDrop(e.id)) {
    const drop = Economy.rollDrop(e.enemyType, biomeLevel);
    const ecoDrop = Economy.createDrop(e.x + e.width/2, e.y + e.height/2, drop.type, drop.amount);
}
```

### 3. Scrap Drop on Boss State Transition (~line 2625)
Same Economy.shouldDrop → rollDrop → createDrop pattern

### 4. Scrap Drop on Boss Death (~line 2701)
5 drops using Economy.rollDrop with 'boss' enemyType

### 5. Biome Tracking
- Added `let biomeLevel = 1` tracking variable
- Added `updateActiveBiome(score)` function mapping score → biome 1-10
- Called every frame in update(dt) with `updateActiveBiome(score)`
- Calls `Economy.newSegment()` when biome changes

### 6. Reset Game Preservation
- Saves `Economy._lootedSegments` as a new Set before Economy.init()
- Restores after init to prevent checkpoint farming across deaths

### 7. ScrapDrop Class Update
- Constructor now accepts optional 4th parameter `value`
- Supports all 5 Economy scrap types: metal, alloy, cell, core, essence + fragment
- Added draw rendering for alloy (pink), core (deep blue), essence (gold)

## Files Modified
- `index.html`: 98 insertions, 31 deletions
- `economy.js`: UNCHANGED

## Verification
- All script blocks have balanced braces ✅
- updateActiveBiome called every frame in update(dt) ✅
- _lootedSegments preserved across resetGame ✅
- Economy.shouldDrop/rollDrop/createDrop called at 3 integration points ✅
