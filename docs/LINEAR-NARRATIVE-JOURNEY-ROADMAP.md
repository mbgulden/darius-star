# Darius Star: Cyber Coelacanth — Narrative Journey & Comms Roadmap (GRO-4200 Series)

**Created Date:** August 2026  
**Parent Document:** [`docs/GAME-DESIGN-DOCUMENT.md`](file:///home/ubuntu/work/darius-star/docs/GAME-DESIGN-DOCUMENT.md)  
**Governance Standard:** `agy-as-planner` & `agy-delegate-goals-not-tasks`  
**Target Repository:** `mbgulden/darius-star` (Unified branches: `main` / `master` / `deploy-fresh`)  

---

## 1. Executive Task Summary

This roadmap establishes the complete work packets for overhauling the story delivery, comms chatter, and narrative progression in *Darius Star: Cyber Coelacanth*. It transitions the game into a **fluid, non-blocking holographic comms system** with **attempt-aware dynamic dialogue**, **high-difficulty / NG+ classified lore unlocks**, **character-consistent animated portraits**, and **full voice audio integration with BGM ducking**, ensuring players never have to read text while dodging bullet hell.

```mermaid
graph TD
    subgraph Track 7: Narrative & Comms Architecture (GRO-4200 Series)
        T7_1["GRO-4201: Non-Blocking Holographic Comms Banner & SFX"] --> T7_2["GRO-4202: Attempt-Aware Progressive Banter Engine"]
        T7_2 --> T7_3["GRO-4203: Canonical Lore Gaps Ingestion & 100-Level Chatter"]
        T7_3 --> T7_4["GRO-4204: Precursor Sector Intel Archive Terminal"]
        T7_1 --> T7_5["GRO-4205: Automated Narrative Journey Test Suite"]
        T7_3 --> T7_6["GRO-4206: Higher-Difficulty & NG+ Classified Lore Unlocks"]
        T7_1 --> T7_7["GRO-4207: Character-Consistent Animated Portraits Suite"]
        T7_1 --> T7_8["GRO-4208: Voice Audio Integration & Real-Time BGM Ducking"]
        T7_6 --> T7_5
        T7_7 --> T7_5
        T7_8 --> T7_5
    end
```

---

## 2. Detailed Linear Work Packets

### [GRO-4201] Non-Blocking Holographic Comms Banner HUD & Audio Squelch Engine
- **Title:** `feat(ui): implement non-blocking holographic comms banner HUD with animated waveform and radio squelch SFX`
- **Priority:** 🔴 High (Core Gameplay / Immersion Fix)
- **Assignee / Model:** `agent:fred` (`model:pro`)
- **Estimated Effort:** 4 Story Points
- **Target Files:**
  - [`js/ui/dialogue.js`](file:///home/ubuntu/work/darius-star/js/ui/dialogue.js) (Convert `DialogueSequence` to non-blocking comms overlay)
  - [`js/audio.js`](file:///home/ubuntu/work/darius-star/js/audio.js) (Procedural radio squelch & transmission beep synthesis)
  - [`index.html`](file:///home/ubuntu/work/darius-star/index.html) (`#comms-hud-overlay` DOM container and CSS scanline styling)
  - [`js/renderer.js`](file:///home/ubuntu/work/darius-star/js/renderer.js) (Canvas waveform visualizer blitting)
- **Problem Statement:**  
  Currently, mid-mission story sequences freeze bullet-hell action with fullscreen dimming modals (`ctx.fillStyle = 'rgba(0,0,0,0.45)'`), jarring player momentum, interrupting combat flow, and causing unfair damage upon unpausing.
- **Detailed Specifications:**
  1. **Non-Blocking In-Flight Comms Banner:** Create a sleek HUD transmission box anchored at the top-center of the screen (`width: 520px, height: 68px`) with semi-transparent navy backing (`rgba(6, 12, 24, 0.88)`) and faction-themed laser borders.
  2. **Character Portrait Box:** 48x48 animated CRT scanline frame with glowing faction border:
     - Darius (Amber `#ffaa00`), Lyra (Cyan `#00ffff`), Naya (Green `#00ff88`), Thorne (Navy/Silver `#88aacc`), Cross (Magenta `#ff00aa`), Selene (Gold `#ffd700`), Precursor Architect (Violet `#cc44ff`).
  3. **Real-Time Audio Waveform Meter:** Render a 12-bar canvas visualizer that pulses rhythmically during active character voice/text playback.
  4. **Radio Squelch & Transmission Audio:** Synthesize dual-tone radio squelch chirps (high burst -> static burst at start; low tone -> click on close) via Web Audio API oscillators.
  5. **100% Control Continuity:** Player ship movement, primary weapons, missiles, dodges, and special abilities remain fully active during transmissions.
- **Acceptance Criteria:**
  - In-game dialogue plays in real-time without pausing or locking player controls.
  - Radio squelch sound effects trigger smoothly on comms open/close.
  - Comms banner automatically slides down on trigger and slides up upon completion (4.0s duration or voice end).
- **Verification Command:** `node tests/narrative_journey_comms_test.js --grep=comms_banner`
- **Rollback Plan:** Revert `js/ui/dialogue.js` and `index.html` to commit `f330a59`.

---

### [GRO-4202] Attempt-Aware Progressive Banter Engine & Dynamic Replay State
- **Title:** `feat(banter): build 3-tier attempt-aware dialogue rotation to eliminate level replay repetition`
- **Priority:** 🔴 High (Core Replayability Goal)
- **Assignee / Model:** `agent:fred` (`model:pro`)
- **Estimated Effort:** 3 Story Points
- **Target Files:**
  - [`js/banter_engine.js`](file:///home/ubuntu/work/darius-star/js/banter_engine.js) (Attempt tracking and multi-tier line retrieval)
  - [`js/level_manager.js`](file:///home/ubuntu/work/darius-star/js/level_manager.js) (Expose `LevelManager.stats.attemptCount`)
  - [`js/save_system.js`](file:///home/ubuntu/work/darius-star/js/save_system.js) (Persist per-level attempt history in `CampaignSave`)
- **Problem Statement:**  
  When players retry difficult boss levels or replay sectors, existing banter engines repeat the identical static lines (*"Deepest place on Earth..."*), creating a repetitive "Groundhog Day" experience.
- **Detailed Specifications:**
  1. **Level Attempt Tracking:** Track `levelAttempts[`${biome}_${level}`]` across session and campaign saves.
  2. **3-Tier Contextual Comm Chatter Pools:**
     - **Tier 1 (Attempt 1 - First Reconnaissance):** Initial mystery, sector scans, personal character observations.
     - **Tier 2 (Attempt 2 - Tactical Countermeasures):** Direct acknowledgment of prior wipe (*"Second approach—target the lure joint before it charges EMP!"*), shield frequency adjustments.
     - **Tier 3 (Attempt 3+ - Gritty Tenacity & Mastery):** Veteran scrapper determination, deep Precursor lore resonance, family bond exchanges.
  3. **Dynamic Boss Engagement Chatter:** Boss entrances and mid-fight target point destructions cycle through tactical advisories on retries instead of repeating generic intros.
- **Acceptance Criteria:**
  - Attempt 1, Attempt 2, and Attempt 3 on the same level trigger 3 distinct, non-repeating comms lines.
  - Attempt counter increments cleanly on death/pull-out and persists in active save slot.
  - Never plays a Tier 1 recon line on a retry sortie.
- **Verification Command:** `node tests/narrative_journey_comms_test.js --grep=attempt_rotation`
- **Rollback Plan:** Revert `js/banter_engine.js` line selection to single-tier fallback.

---

### [GRO-4203] Canonical Lore Ingestion & 100-Level Sector Intel Master Catalog
- **Title:** `feat(lore): ingest complete canonical narrative arcs, Arthur Star origin logs, and 100-level sector chatter`
- **Priority:** 🟡 Medium (Narrative Depth & Worldbuilding)
- **Assignee / Model:** `agent:agy` (`model:pro`)
- **Estimated Effort:** 5 Story Points
- **Target Files:**
  - [`js/banter_db.js`](file:///home/ubuntu/work/darius-star/js/banter_db.js) (Expand from 504 to 900+ lines across 10 biomes)
  - [`js/levels/biome_data.js`](file:///home/ubuntu/work/darius-star/js/levels/biome_data.js) (Inject in-universe transmission logs for all 100 levels)
  - [`docs/GAME-DESIGN-DOCUMENT.md`](file:///home/ubuntu/work/darius-star/docs/GAME-DESIGN-DOCUMENT.md) (Update canonical story bible)
- **Problem Statement:**  
  Several critical story bridges are currently missing: Grandfather Arthur Star's first contact in 2046, Squadron Umbra's military motivation under Commander Cross, Selene's Navy defection, and Lyra's attunement cure at the Galactic Core.
- **Detailed Specifications:**
  1. **Arthur Star Trench Logs (Biomes 1–3):** Ingest 15 historical dive logs detailing Arthur Star's discovery of the first Precursor bio-seed and the genetic origin of the Star bloodline's neural attunement.
  2. **Squadron Umbra Military Arc (Biomes 4–6):** Script encrypted Navy comms intercepts explaining Commander Cross's mission to weaponize the Precursor Hivemind for Earth Defense Command.
  3. **Selene & Thorne Tactical Guidance (Biomes 7–8):** Comms chatter for Lyra's coma phase where Selene (Haven-7 Base Command) guides Darius through the *Derelict Fleet* graveyard, uncovering cruisers she designed.
  4. **The Cyber Coelacanth Dual Resolution (Biomes 9–10):** Script dialogue for both the Scrapper's Harvest (combat power) and Harmonic Communion (true healing ending).
- **Acceptance Criteria:**
  - All 10 biomes contain complete 3-tier dialogue sets for `level_start`, `boss_entrance`, `pull_out`, `wave_clear`, and `target_destroyed`.
  - All 100 level entries in `biome_data.js` contain unique, lore-consistent briefing logs.
- **Verification Command:** `node tests/narrative_journey_comms_test.js --grep=lore_integrity`
- **Rollback Plan:** Revert `js/banter_db.js` and `js/levels/biome_data.js` to previous commit.

---

### [GRO-4204] Precursor Sector Intel Archive Terminal in Debriefing
- **Title:** `feat(ui): build Precursor Sector Intel Archive terminal on level debriefing screen`
- **Priority:** 🟡 Medium (Player Agency & Lore Accessibility)
- **Assignee / Model:** `agent:fred` (`model:pro`)
- **Estimated Effort:** 3 Story Points
- **Target Files:**
  - [`js/ui.js`](file:///home/ubuntu/work/darius-star/js/ui.js) (`SCREENS.LEVEL_CLEAR` and `[L]` Sector Intel Modal)
  - [`js/ui/debriefing.js`](file:///home/ubuntu/work/darius-star/js/ui/debriefing.js) (Intel terminal layout, tabs, audio log player)
- **Problem Statement:**  
  Players wanting deep lore have no in-game terminal to read full transmission transcripts, Arthur Star logs, or enemy anatomical specs, while players wanting fast action shouldn't be forced to read long texts during flights.
- **Detailed Specifications:**
  1. **Sector Intel Hotkey (`[L]`):** Add prominent badge `[L] PRECURSOR SECTOR INTEL` on the Level Clear Debriefing screen.
  2. **Categorized Intel Terminal:**
     - **Tab 1: Mission Comm Logs:** Full transcripts of all chatter heard during the sector.
     - **Tab 2: Precursor Signals:** Decoded harmonic frequencies and Arthur Star historical logs.
     - **Tab 3: Threat Analysis:** Anatomical breakdown and hardpoint specs of defeated cybernetic fauna.
  3. **Seamless Navigation:** `[SPACE] / [ENTER]` immediately launches the next sector, while `[L]` pauses debriefing timers for reading.
- **Acceptance Criteria:**
  - Pressing `[L]` on the Level Clear screen opens the Intel Terminal with full text archives.
  - Pressing `[ESC]` or `[L]` closes the modal and returns smoothly to debriefing.
- **Verification Command:** `node tests/narrative_journey_comms_test.js --grep=intel_terminal`
- **Rollback Plan:** Revert `js/ui.js` modal hook.

---

### [GRO-4206] Higher-Difficulty & New Game+ Classified Narration / Lore Unlocks
- **Title:** `feat(story): implement difficulty-aware classified dialogue and NG+ secret transmission unlocks`
- **Priority:** 🔴 High (Replayability & Mastery Incentive)
- **Assignee / Model:** `agent:fred` (`model:pro`)
- **Estimated Effort:** 4 Story Points
- **Target Files:**
  - [`js/banter_engine.js`](file:///home/ubuntu/work/darius-star/js/banter_engine.js) (Difficulty level checking and classified line pool filtering)
  - [`js/banter_db.js`](file:///home/ubuntu/work/darius-star/js/banter_db.js) (Ingest ACE, CYBER, and NG+ exclusive chatter branches)
  - [`js/save_system.js`](file:///home/ubuntu/work/darius-star/js/save_system.js) (Track `maxCompletedDifficulty` in CampaignSave)
  - [`js/ngplus.js`](file:///home/ubuntu/work/darius-star/js/ngplus.js) (Trigger NG+ loop narrative milestones)
- **Problem Statement:**  
  Currently, replaying the campaign on Hard (ACE) or Insane (CYBER) difficulty gives the exact same narrative as Cadet/Pilot, missing a massive opportunity to reward skilled players with deeper, classified lore and dark precursor secrets.
- **Detailed Specifications:**
  1. **Difficulty-Gated Comm Chatter:**
     - **PILOT / CADET (Standard Story):** Focuses on core survival, Lyra's health, and basic salvage progression.
     - **ACE (Hard Mode - Classified Navy Files):** Unlocks intercepted Navy intelligence exposing Earth Defense Command's black-ops project to weaponize the Coelacanth.
     - **CYBER (Insane Mode - Precursor Singularity Lore):** The Precursor Architect speaks directly to the pilots, revealing the cosmic cycle and how previous civilizations failed the test.
     - **NEW GAME+ (Paradox Transmissions):** Alternate timeline chatter where characters have deja vu of past victories, remarking on paradox enemies and temporal rifts.
  2. **Tactical Modifier Advisories:** High-difficulty comms provide urgent warnings for modified enemy mechanics (e.g. death revenge bullets, aggressive boss charging phases).
- **Acceptance Criteria:**
  - Playing on ACE, CYBER, or NG+ dynamically pulls from the unlocked classified lore pools.
  - Standard Cadet/Pilot runs do not expose high-difficulty endgame secrets prematurely.
  - Saves track `highestDifficultyCleared` and unlocks NG+ narrative badges.
- **Verification Command:** `node tests/narrative_journey_comms_test.js --grep=difficulty_narration`
- **Rollback Plan:** Revert `js/banter_engine.js` difficulty filter.

---

### [GRO-4207] Character-Consistent Holographic Animated Portraits Suite
- **Title:** `feat(art): generate and integrate character-consistent multi-state animated portrait sprites with CRT scanlines`
- **Priority:** 🔴 High (Visual Polish & Emotional Resonance)
- **Assignee / Model:** `agent:agy` (`model:pro` with Google Antigravity visual asset pipeline)
- **Estimated Effort:** 4 Story Points
- **Target Files:**
  - [`assets/sprites/portraits/`](file:///home/ubuntu/work/darius-star/assets/sprites/portraits/) (256x256 master sheets & 48x48 sliced frames)
  - [`assets/sprites/portraits/portraits_manifest.json`](file:///home/ubuntu/work/darius-star/assets/sprites/portraits/portraits_manifest.json) (Updated asset registry)
  - [`js/sprites.js`](file:///home/ubuntu/work/darius-star/js/sprites.js) (Preload portrait sprite textures)
  - [`js/ui/dialogue.js`](file:///home/ubuntu/work/darius-star/js/ui/dialogue.js) (Portrait rendering with scanline overlay and state switching)
- **Problem Statement:**  
  Currently, portrait assets lack state variety (missing Selene, Architect, Lyra's attuned glow, and battle strain), and static portraits feel disconnected from high-stakes combat situations.
- **Detailed Specifications:**
  1. **Complete 7-Character Visual Roster:**
     - **Darius Star:** `darius_neutral`, `darius_reactive` (combat shout), `darius_damaged` (helmet HUD spark).
     - **Lyra Star:** `lyra_neutral`, `lyra_reactive`, `lyra_attuned` (bioluminescent cyan glowing eyes & psychic aura).
     - **Naya Star:** `naya_neutral`, `naya_reactive`, `naya_tactical`.
     - **Commander Thorne:** `thorne_neutral`, `thorne_reactive`, `thorne_grim`.
     - **Captain Cross:** `cross_neutral`, `cross_hostile` (Navy visor on), `cross_defector` (unmasked ally).
     - **Selene (Haven-7 Base Command):** `selene_neutral` (golden comms glow), `selene_urgent`.
     - **Precursor Architect / Ophion:** `architect_ethereal` (translucent code stream), `architect_corrupted`.
  2. **CRT Scanlines & Holographic Shader:** Render dynamic scanline jitter, chromatic aberration glow, and subtle animated speaking mouth frames.
  3. **Situational Consistency:** The comms engine automatically selects portrait state based on player health, biome atmosphere, and narrative flags (e.g. Lyra's `attuned` portrait activates in Biome 9–10).
- **Acceptance Criteria:**
  - All 7 characters have verified high-resolution pixel art portraits in `assets/sprites/portraits/`.
  - Portraits dynamically change expressions based on combat stress and story triggers.
  - Pixel art palette adheres strictly to 16-bit retro aesthetic with crisp contrast.
- **Verification Command:** `node tests/narrative_journey_comms_test.js --grep=portraits`
- **Rollback Plan:** Revert `assets/sprites/portraits/` and `js/sprites.js`.

---

### [GRO-4208] Voice Audio Integration & Real-Time BGM Ducking for Hands-Free Bullet-Hell Comms
- **Title:** `feat(audio): integrate full voice audio playback with automatic BGM ducking for hands-free combat communication`
- **Priority:** 🔴 High (Hands-Free Accessibility & Immersion)
- **Assignee / Model:** `agent:fred` (`model:pro`)
- **Estimated Effort:** 4 Story Points
- **Target Files:**
  - [`js/audio.js`](file:///home/ubuntu/work/darius-star/js/audio.js) (Dynamic volume ducking manager)
  - [`js/voice_playback.js`](file:///home/ubuntu/work/darius-star/js/voice_playback.js) (Voice playback event pipeline)
  - [`js/banter_engine.js`](file:///home/ubuntu/work/darius-star/js/banter_engine.js) (Link banter trigger to VoicePlayback)
- **Problem Statement:**  
  In a high-intensity shmup with dozens of enemy bullets on screen, forcing players to read text subtitles causes frustration and unfair deaths. Full voice integration with proper audio mixing is essential so players can simply listen while flying.
- **Detailed Specifications:**
  1. **Automatic BGM & SFX Ducking:** When a voice line begins playing, smoothly attenuate background music and laser SFX volume by -35% (0.65x multiplier) over 80ms, restoring to full volume over 250ms when speech ends.
  2. **Voice Audio Pipeline Integration:** Connect all in-flight comms triggers to the voice audio catalog via `VoicePlayback.play(biome, event, speaker, line)`.
  3. **Synchronized Waveform HUD Visualizer:** Drive the in-engine 12-bar equalizer meter directly from Web Audio `AnalyserNode` frequency data or speech duration envelopes.
  4. **Radio Transmission Envelopes:** Play a subtle high-frequency radio burst chirp before speech starts and a mechanical squelch click when speech concludes.
- **Acceptance Criteria:**
  - Every comms chit triggers clear voice audio playback.
  - BGM and sound effects cleanly duck during voice lines so dialogue is 100% intelligible over weapon fire.
  - Zero audio clipping, popping, or volume jumps during rapid voice line triggers.
- **Verification Command:** `node tests/narrative_journey_comms_test.js --grep=audio_ducking`
- **Rollback Plan:** Revert `js/audio.js` ducking hooks.

---

### [GRO-4205] Automated Narrative Journey & Comms Verification Suite
- **Title:** `test(ci): build automated test suite for non-blocking comms, multi-attempt rotation, and lore integrity`
- **Priority:** 🔴 High (CI Quality Gate)
- **Assignee / Model:** `agent:fred` (`model:pro`)
- **Estimated Effort:** 2 Story Points
- **Target Files:**
  - [`tests/narrative_journey_comms_test.js`](file:///home/ubuntu/work/darius-star/tests/narrative_journey_comms_test.js)
- **Problem Statement:**  
  Automated testing must verify that comms chatter never blocks canvas game loops, that multi-attempt rotation functions without duplicate keys, and that all 100 level lore entries resolve without missing properties.
- **Acceptance Criteria:**
  1. Verify comms banner renders without halting `player.update()`, `player.shoot()`, or bullet loops.
  2. Verify 3 consecutive attempts on level `1_5` produce 3 distinct dialogue lines.
  3. Verify higher-difficulty modes unlock classified lore branches without regression.
  4. Verify all 7 character portraits resolve cleanly with zero missing image paths.
  5. 100% pass rate in CI test runner (`python3 scripts/verify_syntax.py && node tests/narrative_journey_comms_test.js`).
- **Verification Command:** `node tests/narrative_journey_comms_test.js`
- **Rollback Plan:** N/A (Test file).

---

## 3. Dependency Graph & Execution Matrix

| Linear Task ID | Title | Prerequisites | Target Files |
|---|---|---|---|
| **GRO-4201** | Non-Blocking Holographic Comms Banner HUD & SFX | None | `js/ui/dialogue.js`, `js/audio.js`, `index.html` |
| **GRO-4202** | Attempt-Aware Progressive Banter Engine | None | `js/banter_engine.js`, `js/level_manager.js` |
| **GRO-4203** | Canonical Lore Ingestion & 100-Level Chatter DB | GRO-4202 | `js/banter_db.js`, `js/levels/biome_data.js` |
| **GRO-4204** | Precursor Sector Intel Archive in Debriefing | GRO-4203 | `js/ui.js`, `js/ui/debriefing.js` |
| **GRO-4206** | Higher-Difficulty & NG+ Classified Lore Unlocks | GRO-4203 | `js/banter_engine.js`, `js/save_system.js`, `js/ngplus.js` |
| **GRO-4207** | Character-Consistent Animated Portraits Suite | GRO-4201 | `assets/sprites/portraits/`, `js/sprites.js`, `js/ui/dialogue.js` |
| **GRO-4208** | Full Voice Audio & BGM Ducking Integration | GRO-4201, GRO-4203 | `js/audio.js`, `js/voice_playback.js`, `js/banter_engine.js` |
| **GRO-4205** | Automated Narrative Journey Test Suite | GRO-4201–GRO-4208 | `tests/narrative_journey_comms_test.js` |
