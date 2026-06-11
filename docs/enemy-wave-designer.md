# Enemy Wave System Design — Darius Star: Cyber Coelacanth

This document defines the complete enemy wave system, difficulty scaling, and economy balance for the 100-level progression (10 biomes × 10 levels).

---

## 1. Enemy Stat Master Table (38 Variants)

Stats are base values for Biome 1, Level 1. Final stats scale according to Section 3.
Scrap Values represent the total drop potential (Metal + Cells + Fragments).

| ID | Name | Role | HP | Speed | Dmg | Scrap | Biome | Primary Behavior |
|---|---|---|---|---|---|---|---|---|
| E01 | Angler Scout | Scout | 1 | 150 | 10 | 10-25 | 1 | Sine-wave, Lure flash |
| E02 | Jelly Interceptor| Interceptor | 1 | 280 | 15 | 15-35 | 1 | Diagonal strafe, whip |
| E03 | Vent Crab Heavy | Heavy | 4 | 80 | 25 | 40-70 | 1 | Slow drift, Shockwave AoE |
| E04 | Rust Drone | Scout | 1 | 160 | 12 | 12-30 | 2 | Zigzag, random bursts |
| E05 | Coral Wasp | Interceptor | 2 | 300 | 18 | 20-40 | 2 | Hover-strafe, Sting lunge |
| E06 | Armored Eel | Heavy | 4 | 90 | 30 | 50-80 | 2 | Undulation, Homing bolts |
| E07 | Sparker | Scout | 1 | 180 | 10 | 15-35 | 3 | Fast linear, Electric trail |
| E08 | Sentinel | Interceptor | 2 | 260 | 20 | 25-50 | 3 | Stationary, 3-shot burst |
| E09 | Juggernaut | Heavy | 5 | 70 | 35 | 60-100 | 3 | Rail-mounted, Mines |
| E10 | Boss Minion | Minion | 2 | 220 | 15 | 5-15 | 3 | Sacrificial charge (swarm) |
| E11 | Plasma Wisp | Scout | 1 | 200 | 20 | 20-40 | 4 | Quantum Phase (Teleport) |
| E12 | Storm Sprite | Interceptor | 2 | 380 | 25 | 30-60 | 4 | Chain-lightning arcs |
| E13 | Gas Giant | Heavy | 6 | 120 | 40 | 80-130 | 4 | Front shield, Rear weakpoint |
| E14 | Nebula Wraith | Alternate | 3 | 180 | 30 | 50-90 | 4 | Phase visibility (Cloak) |
| E15 | Ice Shard | Scout | 1 | 300 | 25 | 25-50 | 5 | Screen ricochet |
| E16 | Frost Drone | Interceptor | 2 | 240 | 30 | 35-70 | 5 | Freeze ray (Slow debuff) |
| E17 | Glacier | Heavy | 7 | 100 | 50 | 100-160 | 5 | Death spike burst |
| E18 | Ice Swarm | Minion | 1 | 350 | 15 | 10-20 | 5 | Formation flying (5 units) |
| E19 | Ember Sprite | Scout | 1 | 320 | 30 | 30-60 | 6 | Burning trail (DoT) |
| E20 | Magma Wasp | Interceptor | 2 | 300 | 35 | 40-80 | 6 | Dive-bomb, Death AoE |
| E21 | Lava Golem | Heavy | 8 | 110 | 60 | 120-200 | 6 | Magma pool spawn |
| E22 | Static Spark | Scout | 1 | 350 | 35 | 35-70 | 7 | Ionization zone (Hazard) |
| E23 | Storm Hawk | Interceptor | 3 | 320 | 40 | 50-100 | 7 | EMP burst (Disable shoot) |
| E24 | Thunderhead | Heavy | 8 | 130 | 70 | 150-250 | 7 | Chain lightning (Global) |
| E25 | Storm Sentinel | Alternate | 5 | 150 | 50 | 80-150 | 7 | Lightning wall (Vertical) |
| E26 | Salvage Drone | Scout | 2 | 280 | 45 | 40-90 | 8 | Magnetic rush (Suicide) |
| E27 | Ghost Fighter | Interceptor | 3 | 300 | 50 | 60-120 | 8 | Pre-programmed patterns |
| E28 | Turret Battery | Heavy | 10 | 60 | 80 | 200-350 | 8 | Triple cannon volleys |
| E29 | Fleet Turret | Alternate | 4 | 180 | 60 | 100-180 | 8 | Pop-up ambush (Debris) |
| E30 | Crawler | Scout | 2 | 320 | 55 | 50-110 | 9 | Wall-crawl, Pounce |
| E31 | Spitter | Interceptor | 3 | 280 | 60 | 70-140 | 9 | Acid globs (DoT) |
| E32 | Brute | Heavy | 10 | 120 | 90 | 250-450 | 9 | Charge attack, Enrage |
| E33 | Hive Node | Spawner | 8 | 0 | 0 | 150-300 | 9 | Spawns E30 (Stationary) |
| E34 | Glitch Fragment | Scout | 2 | 300 | 60 | 60-150 | 10 | Position flicker (Blink) |
| E35 | Paradox Wisp | Interceptor | 3 | 260 | 70 | 80-200 | 10 | Reverse movement/Time |
| E36 | Null Entity | Heavy | 12 | 140 | 110 | 300-600 | 10 | Bullet erasure aura |
| E37 | Rift Aberration | Alternate | 6 | 200 | 80 | 200-400 | 10 | Shape-shift (Copies E01-33) |
| E38 | Void Maw | Hazard | 10 | 80 | 999 | 0 | 10 | Gravity well (Indestructible) |

---

## 2. Wave Composition & Progression

Each level consists of a set number of waves. A level is completed when all waves are cleared and the score quota is met.

### Wave Structure per Level
- **Levels 1-4 & 6-9**: 5 Waves of standard enemies.
- **Level 5**: 4 Waves + 1 Mid-Boss.
- **Level 10**: 9 Waves + 1 Biome Boss.

### Enemy Count Formula
The number of enemies in a wave increases with level and player count ($P$):
$$\text{WaveCount} = \text{BaseWaveSize} + (\text{Level} \times 1.5) + (P \times 2)$$
- **BaseWaveSize**: 4 enemies.

### Type Distribution (%)
| Level Range | Scout | Interceptor | Heavy | Alt/Minion |
|---|---|---|---|---|
| **L1 - L3** | 60% | 30% | 0% | 10% |
| **L4 - L6** | 40% | 40% | 10% | 10% |
| **L7 - L10** | 20% | 40% | 30% | 10% |

---

## 3. Difficulty Scaling Formulas

Difficulty scaling ensures the game remains challenging as the player upgrades their ship.

### A. Biome Multiplier ($M_B$)
Applies as a base jump at the start of each biome (1-10):
$$M_B = 1 + (B - 1) \times 0.25$$
*(e.g., Biome 4 = 1.75x, Biome 10 = 3.25x)*

### B. Level Multiplier ($M_L$)
Applies incrementally within each biome's 10 levels:
$$M_L = 1 + (L - 1) \times 0.10$$
*(e.g., Level 10 = 1.9x relative to Level 1 of that biome)*

### C. Total Stat Calculation
$$\text{FinalHP} = \text{BaseHP} \times M_B \times M_L$$
$$\text{FinalSpeed} = \text{BaseSpeed} \times \sqrt{M_B \times M_L}$$
$$\text{FinalDamage} = \text{BaseDamage} \times M_B \times M_L$$

---

## 4. Boss Thresholds & Scaling

Bosses serve as "Gatekeepers" for the next level or biome.

### Trigger Waves
- **Mid-Boss (Level 5)**: Spawns after Wave 4.
- **Biome Boss (Level 10)**: Spawns after Wave 9.

### Boss HP Scaling Table
Boss HP scales sharply to reward high-DPS builds.

| Biome | Mid-Boss HP | Biome Boss HP |
|---|---|---|
| 1 | 60 | 120 |
| 2 | 80 | 150 |
| 3 | 100 | 200 |
| 4 | 120 | 180 (Agility-focused) |
| 5 | 140 | 200 |
| 6 | 160 | 220 |
| 7 | 180 | 240 |
| 8 | 200 | 260 |
| 9 | 220 | 280 |
| 10 | 240 | 400 |

---

## 5. Multiplayer Scaling

Co-operative play increases enemy durability and count to maintain the "bullet hell" experience.

| Players (P) | HP Multiplier | Count Multiplier | Enemy Dmg Multiplier |
|---|---|---|---|
| 1 | 1.0x | 1.0x | 1.0x |
| 2 | 1.6x | 1.4x | 1.1x |
| 3 | 2.2x | 1.8x | 1.2x |
| 4 | 3.0x | 2.2x | 1.3x |

**Scaling Logic**: 
- **HP**: Prevents 4 players from "instakilling" Heavies.
- **Count**: Increases target density to fill the screen with hazards.
- **Damage**: Slightly increases stakes for being hit.

---

## 6. Scrap Economy Balance

The economy is designed to ensure players can afford at least 1-2 Tier 5 upgrades by the end of a perfect 100-level run.

### Estimated Scrap Yields
- **Biome 1 Total**: ~4,500 Scrap
- **Biome 1-5 Total**: ~28,000 Scrap
- **Total Run (100 Levels)**: ~85,000 Scrap

### Upgrade Cost Correlation
| Tier | Avg Cost | Run Progress |
|---|---|---|
| **Tier 1** | 50 | Biome 1, Level 1 (After 1 Wave) |
| **Tier 2** | 150 | Biome 1, Level 2 |
| **Tier 3** | 350 | Biome 2 |
| **Tier 4** | 600 | Biome 4 |
| **Tier 5** | 1,000 | Biome 6+ |

*Note: Data Fragments drop exclusively from Biome Bosses (Level 10) to gate High-Tier Specials.*

---

## 7. Spawn Formations & Patterns

Enemies spawn in formations derived from their `Role`.

### Formation Library
1.  **V-Formation (Scouts)**: Classic arrowhead, enters from right center.
2.  **The Wall (Heavies)**: Staggered vertical line, forces horizontal movement.
3.  **Diamond (Interceptors)**: 4 units circling a center point that drifts left.
4.  **The Pincer (Minions)**: Two groups entering simultaneously from top-right and bottom-right.
5.  **Staggered Column**: One enemy every 0.5s in a horizontal line at a fixed Y.

### Entry Timing
- **Spawn Delay**: Time between enemy 1 and enemy 2 in a formation (Base: 0.2s).
- **Wave Interval**: Time between Wave N and Wave N+1 (Base: 2.0s).
- **Difficulty Adjustment**: Intervals decrease by 5% per Biome.
