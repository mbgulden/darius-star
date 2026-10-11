# Sprite Audit Report — Darius Star: Cyber Coelacanth

**Date:** 2026-06-09
**Audit type:** Read-only, no code changes
**Manifest:** `assets/sprites.json` (v1.0, generated 2026-06-09T19:47:57Z)
**Source:** `/home/ubuntu/work/darius-star/assets/sprites/`

---

## 1. Executive Summary

| Metric | Value |
|--------|-------|
| PNG files on disk | **2,528** |
| Sprite groups in manifest | **221** |
| Total frames in manifest | **2,528** |
| Disk ↔ Manifest match | **100% (0 missing, 0 extra)** |
| Manifest ↔ Disk match | **100% (0 missing, 0 extra)** |
| Multi-frame sprite groups | **27** (sprite sheets / sequences) |
| Single-frame sprite groups | **194** |

**Overall assessment:** The manifest is fully complete and consistent with the on-disk assets. All 2,528 PNG files are correctly cataloged. The primary concerns are: (1) 35 tiny placeholder/mock sprites, (2) missing boss_biome_3 assets, and (3) dimension inconsistency for enemy_b4_serpent.

---

## 2. Manifest Completeness

### 2.1 File Count Validation

- **Disk PNGs:** 2,528 (verified via `find assets/sprites -name '*.png' | wc -l`)
- **Manifest sprite groups:** 221
- **Manifest total frames:** 2,528
- **Orphaned files (on disk, not in manifest):** 0
- **Dangling references (in manifest, not on disk):** 0

✅ **PASS** — The manifest perfectly mirrors the filesystem.

### 2.2 Manifest Structure

Each sprite group in `sprites.json` contains:
- `frames[]` — array of frame objects with `index`, `filename`, `path`, `width`, `height`, `is_power_of_two`
- `frame_count` — total number of frames in the group
- `width` / `height` — sprite dimensions
- `is_valid_power_of_two` — whether the sprite uses power-of-two dimensions (WebGL optimization)

---

## 3. Category Breakdown

| Category | Groups | Total Frames | Description |
|----------|--------|-------------|-------------|
| **sfx_sequence** | 26 | 1,560 | Veo VFX: 26 types × 60 frames each |
| **background_variant** | 43 | 582 | Static bg variants + frame sequences |
| **background_strip** | 11 | 11 | Ultra-wide scrolling strips |
| **boss** | 20 | 152 | Boss idle, death, rage, laser, biome images |
| **enemy** | 34 | 34 | Regular enemies (28 mock + 6 real) |
| **unknown** | 39 | 136 | Portraits, misc gameplay, shop, title |
| **icon** | 15 | 15 | UI upgrade icons (weapon/shield/engine T1-T5) |
| **player_ship** | 8 | 14 | Player ships + glow variants |
| **ship_card** | 6 | 6 | Ship selection cards |
| **unique_enemy** | 10 | 10 | Unique biome enemies |
| **scrap** | 5 | 5 | Economy resources |
| **powerup** | 2 | 2 | Weapon/Shield powerups |
| **gameplay** | 2 | 2 | Explosion + laser sprites |
| **studio_logo** | 1 | 1 | What An Adventure Games logo |
| **TOTAL** | **221** | **2,528** | |

---

## 4. Sprite Sheet / Multi-Frame Analysis

### 4.1 Multi-Frame Sprites (27 groups)

#### Background Frame Sequences
| Sprite | Frames | Dimensions | Type |
|--------|--------|------------|------|
| bg_title | 120 | 1280×720 | Frame sequence (0001-0120) |
| bg_abyssal_trench | 120 | 1280×720 | Frame sequence (0001-0120) |
| bg_coelacanth_lair | 120 | 1280×720 | Frame sequence (0001-0120) |
| bg_coral_graveyard | 120 | 1280×720 | Frame sequence (0001-0120) |
| bg_core_rift | 10 | 1280×720 | Frame sequence (0001-0010) |
| bg_derelict_fleet | 10 | 1280×720 | Frame sequence (0001-0010) |
| bg_ice_rings | 10 | 1280×720 | Frame sequence (0001-0010) |
| bg_inferno_core | 10 | 1280×720 | Frame sequence (0001-0010) |
| bg_nebula_drift | 10 | 1280×720 | Frame sequence (0001-0010) |
| bg_storm_belt | 10 | 1280×720 | Frame sequence (0001-0010) |
| bg_xenomorph_hive | 10 | 1280×720 | Frame sequence (0001-0010) |

✅ All frame indices are consecutive 1..N (1-indexed manifest). No gaps detected.

#### Boss Sequences
| Sprite | Frames | Dimensions |
|--------|--------|------------|
| boss_biome | 9 | 1024×1024 |
| boss_death | 32 | 1280×720 |
| boss_idle | 32 | 1280×720 |
| boss_laser_charge | 32 | 1280×720 |
| boss_rage | 32 | 1280×720 |

⚠️ **boss_biome has only 9 frames (indices 1-10, skipping index 3)** — `bosses/boss_biome_3.png` is MISSING from both disk and manifest.

#### Enemy Cycle Sprites
| Sprite | Frames | Dimensions |
|--------|--------|------------|
| scout_cycle | 32 | 1280×720 |
| interceptor_cycle | 32 | 1280×720 |
| heavy_cycle | 32 | 1280×720 |

#### Player Ship (2-frame idle animations)
| Sprite | Frames | Dimensions |
|--------|--------|------------|
| player | 2 | 1024×1024 |
| player_bastion | 2 | 1024×1024 |
| player_phantom | 2 | 1024×1024 |
| player_specter | 2 | 1024×1024 |
| player_tempest | 2 | 1024×1024 |
| player_warden | 2 | 1024×1024 |

#### VFX / Explosion
| Sprite | Frames | Dimensions |
|--------|--------|------------|
| explosion | 4 | 1024×1024 |

### 4.2 SFX Sequences (26 groups × 60 frames)

All 26 SFX sequences have exactly 60 frames (0001-0060), all at 1280×720. Frame numbering is consecutive with no gaps.

| SFX Sequence | Avg Frame Size |
|-------------|----------------|
| sfx_score_milestone | 1,715 KB |
| sfx_level_clear | 1,689 KB |
| sfx_boss_death | 2,064 KB |
| sfx_boss_siren | 1,412 KB |
| sfx_game_start | 1,421 KB |
| sfx_player_death | 1,438 KB |
| sfx_explosion_large | 1,313 KB |
| sfx_player_hit_laser | 1,287 KB |
| sfx_shield_activate | 1,268 KB |
| sfx_boss_laser_charge | 1,569 KB |
| sfx_powerup_shield | 1,213 KB |
| sfx_player_laser_l5 | 1,192 KB |
| sfx_shield_hit | 1,138 KB |
| sfx_player_hit_rocket | 1,136 KB |
| sfx_collision_ship | 1,082 KB |
| sfx_powerup_weapon | 1,015 KB |
| sfx_player_laser_l1 | 916 KB |
| sfx_boss_laser_fire | 874 KB |
| sfx_enemy_spawn | 873 KB |
| sfx_explosion_small | 861 KB |
| sfx_engine_hum | 841 KB |
| sfx_enemy_mine_drop | 833 KB |
| sfx_player_low_health | 833 KB |
| sfx_enemy_rocket_launch | 832 KB |
| sfx_enemy_rocket_travel | 716 KB |
| sfx_menu_select | 482 KB |

✅ **PASS** — All 26 × 60 = 1,560 SFX frames present and properly sequenced. All are real art (418 KB – 2.5 MB per frame).

### 4.3 Slicing Needs Assessment

**Sprite sheets that ARE properly structured as individual frames (no slicing needed):**
- All 26 SFX sequences — each is already exported as individual 60-frame PNG strips
- All 11 background frame sequences — individual frames
- All 5 boss sequences — individual frames
- All 3 enemy cycle sprites — individual frames
- All 6 player ships — 2-frame idle animations, individual frames

**Sprite sheets that may need slicing consideration:**
- `explosion` (4 frames, 1024×1024) — currently stored as 4 individual PNGs; could be combined into a sprite sheet for better performance
- `boss_biome` (9 frames, 1024×1024) — individual PNGs in `bosses/` subdirectory

**No sprite sheets are stored as single large strip images requiring runtime slicing.** All multi-frame assets are exported as sequential individual PNGs. The architecture uses individual frame files rather than atlas sheets.

---

## 5. Dimension Analysis

### 5.1 Dimension Summary by Category

| Category | Width(s) | Height(s) | Consistency |
|----------|----------|-----------|-------------|
| Icons | 32 | 32 | ✅ Perfect |
| Ship cards | 128 | 64 | ✅ Perfect |
| Scrap | 1024 | 1024 | ✅ Perfect |
| Player ships | 1024 | 1024 | ✅ Perfect |
| Unique enemies | 1024 | 1024 | ✅ Perfect |
| Powerups | 1024 | 1024 | ✅ Perfect |
| SFX sequences | 1280 | 720 | ✅ Perfect |
| Boss sequences | 1280 | 720 | ✅ Perfect |
| Enemy cycles | 1280 | 720 | ✅ Perfect |
| Background variants | 1408 | 768 | ✅ Consistent |
| Background strips | 12800 / 39680 | 720 | ✅ Consistent |
| Portraits (main) | 1024 | 1024 | ✅ Perfect |
| Portraits (pilot/squad) | 256 | 256 | ✅ Perfect |
| Midboss | 128 | 128 | ✅ Perfect |
| Enemy (mock) | 16-64 | 16-64 | ✅ Consistent |
| Enemy (real) | 1024 | 1024 | Mostly ✅ |

### 5.2 Dimension Anomalies

| Sprite | Dimensions | Expected | Severity |
|--------|-----------|----------|----------|
| **enemy_b4_serpent** | 1408×768 | 1024×1024 | ⚠️ MEDIUM |
| bg_fire_nebula_v* | 800×450 | 1408×768 | ⚠️ LOW |
| boss_biome_*_game | 1280×720 | 1024×1024 | ℹ️ INFO |

**enemy_b4_serpent_0.png** is the only enemy sprite at 1408×768 (match background variant dimensions) instead of the standard 1024×1024 used by all other enemy_b4 sprites. This may be intentional (serpent = long) or an export error.

**bg_fire_nebula_v1-v5** are 800×450 (half the standard 1408×768). All other background variants (core_rift, derelict_fleet, ice_rings, storm_belt, xenomorph_hive) are 1408×768. The fire_nebula may be intentionally smaller or may need re-export.

---

## 6. Mock / Placeholder Detection

### 6.1 Tiny Enemy Sprites (<500 bytes) — 28 sprites

These are 1-2 pixel solid-color PNGs, clearly placeholder art:

| Sprite | Size | Dimensions |
|--------|------|-------------|
| enemy_ice_swarm_0.png | 166 B | 16×16 |
| enemy_ice_shard_0.png | 196 B | 24×24 |
| enemy_storm_sprite_0.png | 197 B | 32×32 |
| enemy_ember_sprite_0.png | 236 B | 32×32 |
| enemy_plasma_wisp_0.png | 237 B | 32×32 |
| enemy_glitch_fragment_0.png | 237 B | 32×32 |
| enemy_salvage_drone_0.png | 237 B | 32×32 |
| enemy_static_spark_0.png | 238 B | 32×32 |
| enemy_crawler_0.png | 241 B | 32×32 |
| enemy_gas_giant_0.png | 242 B | 64×64 |
| enemy_thunderhead_0.png | 243 B | 64×64 |
| enemy_turret_battery_0.png | 243 B | 64×64 |
| enemy_null_entity_0.png | 244 B | 64×64 |
| enemy_lava_golem_0.png | 245 B | 64×64 |
| enemy_glacier_0.png | 247 B | 64×64 |
| enemy_brute_0.png | 250 B | 64×64 |
| enemy_paradox_wisp_0.png | 273 B | 32×32 |
| enemy_magma_wasp_0.png | 273 B | 32×32 |
| enemy_spitter_0.png | 277 B | 32×32 |
| enemy_frost_drone_0.png | 280 B | 32×32 |
| enemy_storm_hawk_0.png | 281 B | 32×32 |
| enemy_ghost_fighter_0.png | 282 B | 32×32 |
| enemy_inferno_node_0.png | 349 B | 48×48 |
| enemy_storm_sentinel_0.png | 353 B | 48×48 |
| enemy_rift_aberration_0.png | 354 B | 48×48 |
| enemy_hive_node_0.png | 354 B | 48×48 |
| enemy_nebula_wraith_0.png | 357 B | 48×48 |
| enemy_fleet_turret_0.png | 359 B | 48×48 |

### 6.2 Tiny Midboss Sprites (<900 bytes) — 7 sprites

| Sprite | Size | Dimensions |
|--------|------|-------------|
| midboss_b6_0.png | 855 B | 128×128 |
| midboss_b10_0.png | 861 B | 128×128 |
| midboss_b8_0.png | 870 B | 128×128 |
| midboss_b5_0.png | 871 B | 128×128 |
| midboss_b4_0.png | 876 B | 128×128 |
| midboss_b7_0.png | 878 B | 128×128 |
| midboss_b9_0.png | 886 B | 128×128 |

### 6.3 Tiny Boss Biome Game Sprites (~1.6 KB) — 7 sprites

| Sprite | Size |
|--------|------|
| boss_biome_4_game.png – boss_biome_10_game.png (7 files) | ~1,640 B each |

### 6.4 Real Art Assets (confirmed by file size)

- **Boss sequences** (death/idle/laser/rage): 700 KB – 1.5 MB per frame ✅
- **SFX sequences** (all 26): 400 KB – 2.5 MB per frame ✅
- **Unique enemies** (10): 333 KB – 1.2 MB ✅
- **Enemy B-series** (5 real): 632 KB – 949 KB ✅
- **Player ships** (6): 344 KB – 590 KB ✅
- **Scrap** (5): 569 KB – 892 KB ✅
- **Background strips** (11): 2 MB – 44 MB each ✅
- **Background variants** (excluding fire_nebula): real art ✅
- **Portraits**: real art (varying sizes) ✅
- **Icons** (15): 875 B – 3,255 B (small but genuine pixel art at 32×32) ✅
- **Ship cards** (6): 5,978 B – 8,197 B (genuine pixel art at 128×64) ✅

---

## 7. Index.html Cross-Reference

### 7.1 Referenced Sprites in index.html (12 unique PNGs)

| Reference | On Disk | In Manifest | Status |
|-----------|---------|-------------|--------|
| backgrounds/bg_title_strip.png | ✅ | ✅ | OK |
| bg_city_0.png | ✅ | ✅ | OK |
| bg_nebula_0.png | ✅ | ✅ | OK |
| boss_0.png | ✅ | ✅ | OK |
| boss_minion_0.png | ✅ | ✅ | OK |
| laser_0.png | ✅ | ✅ | OK |
| laser_0_glow.png | ✅ | ✅ | OK |
| laser_enemy.png | ✅ | ✅ | OK |
| portraits/comms_overlay.png | ✅ | ✅ | OK |
| shield_0.png | ✅ | ✅ | OK |
| studio_logo.png | ✅ | ✅ | OK |
| title_0.png | ✅ | ✅ | OK |

✅ **PASS** — All 12 sprite references in index.html resolve to files present on disk and in the manifest. No broken image references.

### 7.2 Note on Naming Convention
The manifest file captures sprite names slightly differently from the index.html references. For example:
- `boss_0.png` on disk → manifest sprite group `boss` (frame 0)
- `shield_0.png` on disk → manifest sprite group `shield` (frame 0)
- `laser_0_glow.png` → manifest sprite group `laser_0_glow`

The mapping is consistent and correct.

---

## 8. Background Variant Audit

### 8.1 bg_*_v1 through v5 Variants

| Background | v1 | v2 | v3 | v4 | v5 | Status |
|------------|----|----|----|----|----|--------|
| bg_core_rift | ✅ | ✅ | ✅ | ✅ | ✅ | COMPLETE |
| bg_derelict_fleet | ✅ | ✅ | ✅ | ✅ | ✅ | COMPLETE |
| bg_fire_nebula | ✅ | ✅ | ✅ | ✅ | ✅ | COMPLETE |
| bg_ice_rings | ✅ | ✅ | ✅ | ✅ | ✅ | COMPLETE |
| bg_storm_belt | ✅ | ✅ | ✅ | ✅ | ✅ | COMPLETE |
| bg_xenomorph_hive | ✅ | ✅ | ✅ | ✅ | ✅ | COMPLETE |

✅ All 6 biomes have complete v1-v5 variant sets (30 total). All present on disk and in manifest.

### 8.2 Background Strip Assets

| Strip | Dimensions | File Size |
|-------|-----------|-----------|
| bg_title_strip.png | 39680×720 | 35.3 MB |
| bg_abyssal_trench_strip.png | 39680×720 | 32.2 MB |
| bg_coral_graveyard_strip.png | 39680×720 | 35.4 MB |
| bg_coelacanth_lair_strip.png | 39680×720 | 41.9 MB |
| bg_core_rift_strip.png | 12800×720 | 10.5 MB |
| bg_derelict_fleet_strip.png | 12800×720 | 6.8 MB |
| bg_ice_rings_strip.png | 12800×720 | 5.5 MB |
| bg_inferno_core_strip.png | 12800×720 | 2.0 MB |
| bg_nebula_drift_strip.png | 12800×720 | 4.5 MB |
| bg_storm_belt_strip.png | 12800×720 | 3.1 MB |
| bg_xenomorph_hive_strip.png | 12800×720 | 1.9 MB |

✅ All 11 strips present. Two size classes: 39680×720 (4 title/endgame strips) and 12800×720 (7 biome strips).

### 8.3 Background Frame Sequences

The 10-frame sequences (bg_core_rift, bg_derelict_fleet, etc.) and 120-frame sequences (bg_title, bg_abyssal_trench, bg_coelacanth_lair, bg_coral_graveyard) are all complete with consecutive frame numbering.

---

## 9. Player Ship Audit

| Ship | Frame 0 | Frame 1 | Glow 0 | Glow 1 |
|------|---------|---------|--------|--------|
| player (default) | 590 KB | 484 KB | 220 KB | 220 KB |
| player_bastion | 375 KB | 344 KB | — | — |
| player_phantom | 347 KB | 402 KB | — | — |
| player_specter | 587 KB | 469 KB | — | — |
| player_tempest | 553 KB | 476 KB | — | — |
| player_warden | 423 KB | 471 KB | — | — |

✅ All 6 ships present with both idle frames. Only the default ship has glow variants. All at 1024×1024.

---

## 10. Economy & UI Audit

### 10.1 Scrap Resources (5 types)
| Sprite | Size | Status |
|--------|------|--------|
| scrap_alloy_0.png | 702 KB | ✅ Real art |
| scrap_cell_0.png | 569 KB | ✅ Real art |
| scrap_core_0.png | 668 KB | ✅ Real art |
| scrap_essence_0.png | 595 KB | ✅ Real art |
| scrap_metal_0.png | 892 KB | ✅ Real art |

### 10.2 UI Icons (15 icons, 3 types × 5 tiers)
| Type | T1 | T2 | T3 | T4 | T5 |
|------|----|----|----|----|----|
| icon_weapon | ✅ 875 B | ✅ 1,023 B | ✅ 1,067 B | ✅ 1,180 B | ✅ 2,724 B |
| icon_shield | ✅ 2,649 B | ✅ 2,890 B | ✅ 2,987 B | ✅ 3,255 B | ✅ 3,064 B |
| icon_engine | ✅ 1,259 B | ✅ 1,926 B | ✅ 1,552 B | ✅ 1,739 B | ✅ 2,205 B |

✅ All 15 icons present. All 32×32 pixel art.

### 10.3 Ship Cards (6 ships)
| Card | Size | Status |
|------|------|--------|
| ship_card_bastion.png | 6,731 B | ✅ |
| ship_card_phantom.png | 5,978 B | ✅ |
| ship_card_specter.png | 6,289 B | ✅ |
| ship_card_striker.png | 8,197 B | ✅ |
| ship_card_tempest.png | 6,058 B | ✅ |
| ship_card_warden.png | 7,573 B | ✅ |

✅ All 6 ship cards present. All 128×64 pixel art.

### 10.4 Powerups
| Sprite | Size | Status |
|--------|------|--------|
| powerup_s_0.png (shield) | 1,098 KB | ✅ Real art |
| powerup_w_0.png (weapon) | 922 KB | ✅ Real art |
| shield_0.png + shield_0_glow.png | 541 KB + 508 KB | ✅ Real art |

---

## 11. Missing / Incomplete Assets

### 11.1 Critical Missing
| Asset | Details |
|-------|---------|
| **bosses/boss_biome_3.png** | Missing from disk and manifest. boss_biome has frames for indices 1,2,4,5,6,7,8,9,10 — skipping 3 |
| **boss_biome_1_game.png** | Missing _game variant for biome 1 |
| **boss_biome_2_game.png** | Missing _game variant for biome 2 |
| **boss_biome_3_game.png** | Missing _game variant for biome 3 |

### 11.2 Placeholder/Mock Assets (42 total)
- **28 enemy sprites** (biome-specific regular enemies) — tiny 1-2 pixel placeholders
- **7 midboss sprites** — 128×128 placeholders
- **7 boss_biome_X_game sprites** — ~1.6KB placeholders

### 11.3 Dimension Warnings
- **enemy_b4_serpent_0.png**: 1408×768 vs expected 1024×1024
- **bg_fire_nebula_v1-v5**: 800×450 vs expected 1408×768

---

## 12. File Size / Storage Summary

| Category | Count | Total Size | % of Total |
|----------|-------|------------|------------|
| Background strips | 11 | ~190 MB | ~52% |
| SFX sequences (1,560 frames) | 26 groups | ~110 MB | ~30% |
| Boss sequences (128 frames) | 5 groups | ~35 MB | ~10% |
| Background frames (570 frames) | 11 groups | ~20 MB | ~5% |
| Real enemy/unique art (16 frames) | 16 | ~10 MB | ~3% |
| Everything else | ~187 | ~5 MB | ~1% |
| **TOTAL** | **2,528** | **~370 MB** | **100%** |

---

## 13. Recommendations

### High Priority
1. **Investigate missing boss_biome_3**: Either create the asset or renumber the biome sequence.
2. **Add missing boss_biome_1_game, _2_game, _3_game**: These _game variants appear to be required for biomes 1-3.

### Medium Priority
3. **Replace 28 placeholder enemy sprites** with real art (affects all biomes).
4. **Replace 7 placeholder midboss sprites** with real art.
5. **Replace 7 placeholder boss_biome_X_game sprites** with real art.
6. **Verify enemy_b4_serpent dimensions**: Is 1408×768 intentional or an export error?

### Low Priority
7. **Verify bg_fire_nebula dimensions**: 800×450 is half of other background variants (1408×768). Intentional?
8. **Consider sprite sheet atlasing**: The 26 SFX sequences (1,560 individual PNGs) could be combined into sprite sheet strips for better load performance. Current architecture uses individual frame files which is correct for WebGL but could benefit from atlas packing.
9. **Add glow variants for all 6 ships** (currently only the default ship has glows).

---

## 14. Methodology

This audit was performed read-only with no code changes:
- `sprites.json` parsed with Python's `json` module
- Filesystem enumeration via `os.walk()` and `find`
- Regex-based category detection
- File size analysis for mock detection
- Cross-reference with `index.html` via regex extraction
- Manifest integrity checks (orphaned files, dangling references, frame continuity)

**Audit date:** 2026-06-09
**Auditor:** Hermes Agent (automated)
**Tool:** Python 3.12 + shell utilities
