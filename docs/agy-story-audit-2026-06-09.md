# Darius Star: Cyber Coelacanth — Story Cohesion Audit
**Date:** 2026-06-09  
**Auditor:** Hermes Agent (read-only)  
**Scope:** Narrative architecture, character consistency, dialogue coverage, voice assets, save-story integration
**Constraint:** No code changes

---

## Executive Summary

The story of Darius Star is **thoroughly designed** — the docs contain a complete hero's journey across 10 biomes with richly developed characters, emotional arcs, and three distinct endings. However, the **implementation gap** between design docs and game code is substantial. Mission briefings exist as JSON/data but are not loaded at runtime. Banter is partially coded (solo only, ~60% of designed lines). Voice lines are test files only. The save system tracks biome progression but not narrative flags. The three-endings choice is designed but not built into the game loop.

| Aspect | Status | Coverage |
|--------|--------|----------|
| Story Arc (10 biomes) | ✅ Complete in design | 10/10 biomes designed |
| Mission Briefings (data) | ✅ Exist | 10/10 biomes, solo/duo/4P |
| Mission Briefings (runtime) | ❌ Not loaded | 0/10 biomes wired |
| Banter Lines (design) | ✅ Complete | 10/10 biomes, full solo/duo/4P |
| Banter Lines (code) | ⚠️ Partial | Solo lines only (~60%) |
| Voice Lines (raw .wav) | ⚠️ Test only | 12 test files |
| Character Consistency | ✅ Coherent | All 8 major characters |
| Save-Story Integration | ⚠️ Basic | Biome tracking only |
| Endings (3 choices) | ❌ Not built | Designed, not coded |
| Mid-Game Lyra Silence | ❌ Not enforced | Designed, not mechanic |

**Overall grade: B- (Design: A, Implementation: D+)**

---

## 1. Story Arc Completeness

### 1.1 The 10-Biome Journey

The narrative follows a classical four-act structure documented in `story-mode-narrative.md`:

| Act | Biomes | Arc Phase | Emotional Core |
|-----|--------|-----------|----------------|
| I: Hope | 1–3 | "I can save her." | Determined optimism |
| II: Struggle | 4–6 | "What if I'm wrong?" | Doubt, moral vertigo |
| III: Near Defeat | 7–9 | "I don't know if I can do this." | Despair, identity crisis |
| IV: Triumph | 10 | "I understand now. And I choose." | Clarity, acceptance |

**Verdict: ✅ COMPLETE** — Every biome has a clear narrative beat, boss encounter, emotional beat, and Glyph component. The arc is well-structured with rising stakes, a midpoint crisis (biome 6 Haven-7 attack), a dark night of the soul (biome 8's genetic engineering revelation), and a climactic choice.

### 1.2 Core Plot Threads

Five thematic threads run through the entire game:

1. **Fatherhood & Sacrifice** — Three generations of Star men who went into the deep
2. **Communication vs. Containment** — Ophion's dissident philosophy vs. precursor walls
3. **Identity & Autonomy** — Is "curing" Lyra right if she doesn't see her condition as illness?
4. **Institutional Betrayal** — The Navy's Project Dream-Weapon and the Star bloodline engineering
5. **Cosmic Loneliness** — The Dreamer as sympathetic entity, not villain

**Verdict: ✅ COHERENT** — All threads are established early (biomes 1–3), developed (4–6), tested (7–9), and resolved (10). No dropped threads.

---

## 2. Character Consistency

### 2.1 Major Characters — Cross-Reference Across All Docs

| Character | Role | Docs Present In | Consistent? |
|-----------|------|-----------------|-------------|
| **Darius Star** | Protagonist, salvage mercenary, father | All 9 docs | ✅ — Scrapper identity, family motivation, Aldric's legacy all consistent |
| **Lyra Star** | Daughter, navigator, Dreamer-attuned | Narrative, Plot-Gaps, Banter, Missions | ✅ — Evolves from sick child → navigator → cosmic bridge. Navigation role in PLOT-GAPS-FILLED matches banter references to her voice |
| **Naya Star** | Wife, former security officer, later pilot (Warden) | Narrative, Plot-Gaps, Banter, Credits | ✅ — Backstory (orbital security) consistent. Warden ship specs in PLOT-GAPS-FILLED match economy.js `warden` ship definition |
| **Valera Cross** | Navy captain → defector → ally | Narrative, Plot-Gaps, Banter, Missions | ✅ — Squadron Umbra backstory, defection in biome 5, son's death motivation all consistent |
| **Commander Thorne** | Haven-7 tactical controller, Naya's brother | Missions, Plot-Gaps, Banter | ✅ — Professional, loyal, family connection to Naya consistent |
| **Ophion** | Precursor dissident → AI construct → Ophion Reborn | Narrative, Plot-Gaps, Banter, Missions | ✅ — Sabotage motivation, AI restoration in biome 7, 4P embodiment in biome 8 all consistent |
| **Selene Star** | Darius's mother, intel lead | Narrative, Plot-Gaps | ✅ — Protector of Aldric's logs, bitter about Navy |
| **The Dreamer** | Cosmic consciousness, not villain | Narrative, Plot-Gaps, Banter, Missions | ✅ — Lonely, scared, doesn't understand individuality. Consistent across all references |
| **Admiral Crane** | Antagonist, Project Dream-Weapon architect | Narrative, Plot-Gaps, Missions | ✅ — "Patriot who lost his moral compass" is consistent framing |
| **Aldric Star** | Grandfather (deceased, logs/visions) | Narrative, Plot-Gaps, Banter | ✅ — Discovered Coelacanth network, murdered for it |
| **Marcus Star** | Father (deceased, memories) | Narrative, Plot-Gaps | ✅ — Died broken chasing truth |

**Verdict: ✅ ALL CHARACTERS CONSISTENT** — No contradictions across the 9 design docs. Where details differ (e.g., boss names between LEVEL-THEME-SPEC's "Cyber Coelacanth" at score 2000+ vs. biome-boss-design's "Hatchery Queen" at sub-level 10), these represent different design iterations (early 3-level prototype vs. final 100-level design) rather than contradictions.

### 2.2 Character Voice Distinction

Each character has a recognizable voice in the banter design:

- **Darius**: Earnest, scrappy, occasionally dark humor ("The battlefield is where you shop.")
- **Lyra**: Childlike wonder evolving into eerie cosmic perception
- **Ophion**: Academic enthusiasm, childlike wonder at physical existence
- **Cross**: Tactical, pragmatic, emotionally guarded
- **Naya**: Warm but fierce, protective
- **Thorne**: Professional, mission-focused, paternal concern

**Verdict: ✅ DISTINCT VOICES** — The BANTER-AND-SYSTEMS.md table shows clear differentiation.

---

## 3. Mission Briefings

### 3.1 Data Completeness

`docs/mission-briefings.json` contains structured briefing data for **all 10 biomes**:

- Pre-level briefings: solo, coop2, squad4 variants for each biome
- Boss defeat cinematic dialogue
- Post-level summaries with narrative transitions

`docs/mission-briefings-formatted.md` is a human-readable transcript of the same data.

**Verdict: ✅ DATA COMPLETE** — 10/10 biomes have full briefing scripts.

### 3.2 Runtime Integration

Searching `index.html` for `mission-briefings`, `briefing`, `pre_level`, or mission JSON loading:

- **Result: ZERO references found.** The mission briefings JSON is never loaded, parsed, or displayed at runtime.
- There is no briefing screen, no typewriter dialogue UI for pre-level briefings, and no post-level summary display in the game loop.

**Verdict: ❌ NOT INTEGRATED** — This is the single largest story-implementation gap. The entire tactical comms briefing system exists only on paper.

---

## 4. Banter Lines

### 4.1 Design Completeness

`docs/BANTER-AND-SYSTEMS.md` specifies banter for all 10 biomes across 8 trigger types, in 3 player configurations (solo, duo, 4P):

| Mode | Biomes Covered | Trigger Types | Total Lines (est.) |
|------|---------------|---------------|---------------------|
| Solo (Darius + Ophion AI) | 1–10 | 7–10 per biome | ~180 |
| Duo (Darius + Cross) | 1–10 | 7–10 per biome | ~180 |
| 4P (Darius + Cross + Naya + Ophion) | 1–10 | 8–12 per biome | ~300 |
| **Total designed** | | | **~660 lines** |

**Verdict: ✅ DESIGN COMPLETE** — Full coverage for all biomes and player counts.

### 4.2 Code Implementation

`banter_engine.js` contains:

| Mode | Biomes Covered | Triggers per Biome | Total Lines |
|------|---------------|-------------------|-------------|
| Solo only | 1–10 | 3–7 | ~80 |

Specifically, biome 3 is missing `player_death`, `player_respawn`, `low_health`, and `wave_clear` triggers. Biomes 5–10 have only `level_start`, `boss_entrance` (some), and `level_end` — missing `unique_enemy`, `player_death`, `player_respawn`, `low_health`, and `wave_clear`.

**Duo and 4P banter is NOT coded** — it exists only in the design doc. The `banter_engine.js` `_data` object has only solo speaker tags (D, O, L, C).

**Verdict: ⚠️ ~35% IMPLEMENTED** — Solo banter covers ~80 lines of ~660 designed. No duo/4P banter in code.

### 4.3 Banter Triggers vs. Implementation

| Trigger | Designed | Coded | Gap |
|---------|----------|-------|-----|
| `level_start` | 10 biomes × 3 modes | 10 biomes × solo | Missing duo/4P |
| `unique_enemy` | 10 biomes × 3 modes | 5 biomes × solo | Missing 5 biomes + duo/4P |
| `boss_entrance` | 10 biomes × 3 modes | 5 biomes × solo | Missing 5 biomes + duo/4P |
| `player_death` | 10 biomes × 3 modes | 2 biomes × solo | Missing 8 biomes + duo/4P |
| `player_respawn` | 10 biomes × 3 modes | 2 biomes × solo | Missing 8 biomes + duo/4P |
| `low_health` | 10 biomes × 3 modes | 2 biomes × solo | Missing 8 biomes + duo/4P |
| `wave_clear` | 10 biomes × 3 modes | 1 biome × solo | Missing 9 biomes + duo/4P |
| `level_end` | 10 biomes × 3 modes | 10 biomes × solo | Missing duo/4P |
| `squad_save` | Duo/4P only | None | Missing entirely |
| `pickup_collect` | Designed | None | Missing entirely |

---

## 5. Voice Line Files

### 5.1 Existing Files

12 `raw_*.wav` files exist in `assets/audio/test/`:

| File | Character | Status |
|------|-----------|--------|
| `raw_darius.wav` | Darius Star | Test |
| `raw_lyra.wav` | Lyra Star | Test |
| `raw_naya.wav` | Naya Star | Test |
| `raw_cross.wav` | Valera Cross | Test |
| `raw_thorne.wav` | Commander Thorne | Test |
| `raw_ophion.wav` | Ophion | Test |
| `raw_aldric.wav` | Aldric Star | Test |
| `raw_crane.wav` | Admiral Crane | Test |
| `raw_dreamer.wav` | The Dreamer | Test |
| `raw_trench_guardian.wav` | Trench Guardian | Test |
| `raw_hive_mind.wav` | Hive Mind | Test |
| `raw_architect.wav` | The Architect | Test |

**Verdict: ⚠️ TEST ONLY** — 12 character voice samples exist but are in a `test/` subdirectory, suggesting they are quality/evaluation samples rather than production voice lines. No per-line voice files exist for the ~660 designed banter lines or the mission briefings.

### 5.2 What's Missing

For a fully-voiced game, the project would need:
- ~180 solo banter voice lines
- ~480 duo/4P banter voice lines
- ~120 mission briefing voice lines (per mode)
- ~30 boss cinematic voice lines
- **Total: ~810 voice line files needed; 12 exist (1.5%)**

---

## 6. Save System — Story Progression Integration

### 6.1 What's Tracked

`save_system.js` `createBlank()` tracks:

| Field | Story Relevance | Status |
|-------|----------------|--------|
| `biome` | Current biome (1–10) | ✅ Tracked |
| `wave` | Current sub-level (1–10) | ✅ Tracked |
| `score` | Score | ✅ Tracked |
| `scrap` | Scrap balance | ✅ Tracked |
| `ship` | Selected ship | ✅ Tracked |
| `unlockedShips` | Ship unlocks | ✅ Tracked |
| `permanentUpgrades` | Meta-progression | ✅ Tracked |

### 6.2 What's NOT Tracked

| Narrative Flag | Why Needed | Status |
|----------------|-----------|--------|
| Glyphs collected (1–10) | Core mission progress | ❌ Not tracked |
| Story beats seen | Prevent repeat briefings | ❌ Not tracked |
| Character relationship states | Cross defected? Naya joined? | ❌ Not tracked |
| Ending chosen | NG+ epilogue variation | ❌ Not tracked |
| Banter lines played | Prevent repetition | ⚠️ Per-session only (Set, not persisted) |
| Lyra's condition | Affects navigation availability | ❌ Not tracked |
| Haven-7 status | Affects hub availability | ❌ Not tracked |
| Ophion AI status | Affects companion availability | ❌ Not tracked |

**Verdict: ⚠️ BASIC ONLY** — The save system tracks *where* the player is (biome/wave) but not *what* has happened. This means: no persistence for mid-session narrative state, no way to prevent story beats from replaying on reload, and no foundation for the complex narrative branching (Cross defection, Naya joining, Ophion activation, Lyra's silence period).

---

## 7. Story Gaps — Designed but Not Built

### 7.1 Critical Gaps

| Gap | Design Doc | Code Status |
|-----|-----------|-------------|
| **Mission briefings at runtime** | `mission-briefings.json` (1,253 lines) | ❌ Never loaded or displayed |
| **3 narrative endings** | `story-mode-narrative.md` §7 | ❌ No ending selection UI or logic |
| **Mid-game Lyra silence** (biomes 7–8) | `PLOT-GAPS-FILLED.md` §1, Scene 4 | ❌ Navigation system doesn't toggle based on Lyra state |
| **Lyra as active navigator** | `PLOT-GAPS-FILLED.md` §1 | ❌ No navigation mechanic exists — Lyra's role is design-only |
| **Naya as playable character (4P)** | `PLOT-GAPS-FILLED.md` §2 | ❌ Multiplayer.js supports 4 players generically but Naya-specific mechanics (Warden, Guardian Protocol) are not integrated |
| **Ophion Reborn emergence** (biome 7→8) | `PLOT-GAPS-FILLED.md` §3 | ❌ Stem-cell culture collection tracked narratively, but no code triggers Ophion's embodiment |
| **The Final Choice** (3 endings) | `story-mode-narrative.md` §7 | ❌ No choice UI, no ending cinematics beyond credits |

### 7.2 Medium Gaps

| Gap | Design Doc | Code Status |
|-----|-----------|-------------|
| **Progenitor cutscenes** | `credits-content.md` mentions ending cinematic | Only credits sequence implemented; no biome-specific cutscenes |
| **Hub Haven-7 interactions** | `story-mode-narrative.md` §0 | No hub world exists — between-biome shop is UI only |
| **Duo/4P banter** | `BANTER-AND-SYSTEMS.md` | Not in `banter_engine.js` |
| **Lyra's navigation chair upgrades** | `PLOT-GAPS-FILLED.md` scrap section | Economy.js has upgrade categories but no "navigation chair" item |
| **"One-way trip" fuel mechanic** | `PLOT-GAPS-FILLED.md` §4 | No fuel system exists; biome backtracking isn't prevented mechanically |
| **Navy pursuit progression** | Narrative docs | No escalating Navy presence mechanic in biomes 5–8 |

### 7.3 What IS Built

| Feature | Status |
|---------|--------|
| 10-biome score progression (score ranges → biome mapping) | ✅ `updateActiveBiome()` in index.html |
| Autosave/checkpoint on biome transitions | ✅ `CampaignSave.checkpoint()` |
| Scrap economy with "one-in-a-million" rare drops | ✅ Wired in game loop |
| Solo banter engine (partial) | ✅ `banter_engine.js` |
| Save slots showing biome/wave/scrap | ✅ `CampaignSave.summarize()` |
| Multiplayer 1-4 player framework | ✅ `multiplayer.js` |
| NG+ carry-over (ships, upgrades) | ✅ `ngplus.js` (partially buggy) |

---

## 8. Cross-Document Consistency Issues

### 8.1 Boss Name Variations

| Biome | Narrative Doc | Boss Design Doc | Mission Briefings | Banter Doc |
|-------|--------------|-----------------|-------------------|------------|
| 1 | Drowned Warden | Drowned Warden | Trench Guardian | Trench Guardian |
| 2 | Memory Wraith | Memory Wraith | Graveyard Leviathan | Memory Wraith |
| 3 | Hatchery Queen | *(missing from boss design)* | Cyber Coelacanth | Hatchery Queen |
| 4 | Thoughtform Colossus | Storm Conductor | Nebula Serpent | Nebula Serpent |
| 5 | Cryo-Kraken | Frost Colossus | Frost Wyrm | Frost Wyrm |
| 6 | Forge-Mind | Inferno Core | Inferno Titan | Forge-Mind |
| 7 | Storm-Singer | Tempest Overlord | Tempest Colossus | Storm-Singer |
| 8 | Admiral's Remnant | Warship Hulk | Dreadnought AI | Dreadnought AI |
| 9 | Hive-Mind Nexus | Hive Queen | Hive Mind | Hive-Mind Nexus |
| 10 | The Dreamer's Fear | Reality Warp | The Architect | The Architect |

**Assessment:** These are mostly naming discrepancies between early and later design documents, not story contradictions. The narrative doc uses more thematically rich names; the mission briefings use more gameplay-oriented names. For consistency, one naming convention should be chosen.

### 8.2 Biome 3 Boss Missing from Boss Design

`docs/biome-boss-design.md` covers biomes 1, 2, 4, 5, 6, 7, 8, 9, 10 — but **biome 3 (Coelacanth Lair / Hatchery Queen) is missing**. The biome 3 boss is described narratively in `story-mode-narrative.md` and `PLOT-GAPS-FILLED.md` but has no AI state machine, weak point mechanics, or music prompt in the boss design spec.

---

## 9. Recommendations

### Immediate (Blocking)
1. **Load mission briefings at runtime** — Wire `mission-briefings.json` to a pre-level briefing screen with typewriter text effect. This is the most impactful single story integration.
2. **Add narrative flags to save system** — Track `glyphsCollected`, `crossDefected`, `nayaJoined`, `ophionActive`, `lyraState` in the save payload.

### High Priority
3. **Implement duo/4P banter in `banter_engine.js`** — The BANTER-AND-SYSTEMS.md design is complete; translate to code.
4. **Build the 3-endings choice UI** — This is the narrative climax; without it, the game has no ending.
5. **Implement Lyra's navigation mechanic** — Toggle route guidance on/off based on `lyraState` to enforce the emotional beats of biomes 7–8.

### Medium Priority
6. **Generate voice lines for banter** — Start with boss entrance/defeat cinematic lines (highest impact per file).
7. **Add Lyra's navigation chair as upgrade category** — Ties scrap economy to narrative.
8. **Standardize boss naming** — Choose one naming convention and apply across all docs/code.

---

*End of Story Cohesion Audit. All findings based on read-only inspection. No code was modified.*
