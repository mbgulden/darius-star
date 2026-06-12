# AGY Technical Audit Report (V2): Ned's Recent Darius-Star Work

**Author:** AGY (Antigravity AI)  
**Date:** June 12, 2026  
**Target:** Darius Star: Cyber Coelacanth Repository  
**Scope:** 20 most recent commits on `master` branch (including AudioManager, SFX enhancements, Campaign Wave integration, and Save system fixes)

---

## 1. Executive Summary

This follow-up technical audit evaluates the recent 12 commits on the `master` branch of **Darius Star: Cyber Coelacanth** (extending up to HEAD commit `660bd02`). This work introduces a central `AudioManager` class, advanced SFX (such as dynamic player engine hum and multi-layered explosions), campaign wave configurations loaded from the standard schema, and metaprogression-based ship unlocks.

The audit has successfully verified:
1. **100% Syntactic Validity:** Swept all 38 JS files using native V8 validation with 0 parse errors.
2. **0 Load-Time Exceptions:** Simulating the browser environment with all 36 active script tags loaded sequentially in their `index.html` order completed successfully.
3. **Correct Schema Validation:** The campaign wave config validates 100% against the campaign wave JSON schema.

Additionally, this audit identified **two runtime regressions/leaks** and **one test regression**, all of which have been patched and verified in this session:
- **AudioManager Memory Leak:** Fixed an array accumulation leak in crossfade handling.
- **Engine Hum Race Condition:** Fixed a quick-restart bug that silenced the engine hum.
- **Unit Test Crash:** Fixed a missing sound mock that broke `level_manager_test.js`.

---

## 2. Detailed Findings & Patches

### A. AudioManager Integration & Memory Leak Fix (GRO-865)
*   **Analysis:** Commit `89a6939` added the `AudioManager` class to `js/audio_manager.js` to manage track transitions and crossfades. However, when crossfading between looping tracks, the code pushed the new `AudioBufferSourceNode` and `GainNode` onto `_activeSources` and `_activeGains` but never removed the old nodes. This resulted in:
    *   An infinite memory leak as these arrays grew on every zone change or score transition.
    *   Redundant calls to `.setValueAtTime()`, `.linearRampToValueAtTime()`, and `.stop()` on dead nodes.
*   **Resolution:** Modified `js/audio_manager.js` to copy the fading nodes to local scope, schedule their cleanup (fade and disconnect), and reset the global tracking arrays. This ensures only the active, playing track is kept in the array.

### B. SFX Enhancements & Engine Hum Race Condition (GRO-866)
*   **Analysis:** Commit `6add8c6` added a chiptune engine hum oscillator whose pitch and volume scale with player speed. When stopping the hum, a `setTimeout` was set for 400ms to stop the oscillator. If the player restarted gameplay quickly (e.g. death/restart in under 400ms), the game would call `startEngineHum()` while the old one was active, return early, and then the timeout would fire and kill the active oscillator—leaving the player in silence.
*   **Resolution:** Patched `js/audio.js` to track `engineHumTimeout` and cancel any pending stop timeouts if `startEngineHum()` is triggered before they complete, allowing the hum to fade back in seamlessly.

### C. Save System Metaprogression Fix (GRO-935)
*   **Analysis:** Checked the save system changes in `js/save_system.js`. The ship-unlock check was correctly changed from looking at stale `localStorage` keys to directly reading the cosmetic upgrades level on the global `DS_UpgradeSystem` singleton.
*   **Resolution:** Confirmed this check is wrapped in a function call and runs safely with no boot-time dependencies.

### D. Campaign Wave Schema Integration (GRO-938)
*   **Analysis:** Verified that `WAVE_CAMPAIGN` was successfully added to `js/levels/wave_campaign.js` and registered in `js/level_manager.js`. 
*   **Resolution:** Ran the wave validation script (`tools/validate_waves.py`), which reported:
    *   100 levels successfully verified.
    *   Boss HP tables and type distributions correct.
    *   Est scrap totals compound correctly.

### E. Unit Test Regression Fix
*   **Analysis:** Running `node tests/level_manager_test.js` threw `ReferenceError: playSound is not defined` because Ned's new spawn logic in `level_manager.js` calls `playSound()`, which was not mocked in the test setup.
*   **Resolution:** Added `global.playSound = () => {};` to `tests/level_manager_test.js`'s global environment setup. Unit tests now pass with 100% success.

---

## 3. Playwright Integration Audit Results

We executed a local Playwright headless audit against the served game on port 8088 (recording actions and monitoring network calls).

### A. Graceful Fallbacks (404s)
The audit identified several 404 asset warnings, which correspond to media assets not stored in the repository:
*   `assets/cinematics/cinematic_victory.mp4` & `cinematic_boss_intro.mp4`
*   `assets/sprites/studio_logo.png` & `title_0.png`
*   `assets/sprites/backgrounds/bg_title_strip.png`
*   `assets/cinematics/ending_sunrise.png`

**Verdict:** **SAFE**. The codebase handles these 404s gracefully:
*   Video play failures are caught in `ui.js` and fallback to immediate canvas state transitions.
*   Sprites check `naturalWidth > 0` before rendering, preventing script crashes.

### B. Console Verification
All modular JS logs load cleanly with zero warnings or ReferenceErrors:
```
[CampaignSave] save_system.js loaded — full implementation (GRO-1090)
[OK] economy.js loaded — Economy loot tables and anti-farming enabled
[OK] scrap_events.js loaded — economy ↔ banter bridge active
[Darius Star] multiplayer.js loaded — 1-4 player drop-in and drop-out enabled
[OK] ngplus.js loaded — NG+ loops, paradox enemies, scrap scaling
[OK] leaderboard.js loaded — 3 categories, tiered display, localStorage-backed
```

---

## 4. Documentation Upgrades
We have updated `AGENTS.md` to replace the outdated pre-modularization list. It now maps the full **38-module architecture** (36 active, 2 placeholder stubs) in their exact load order and documents their dependencies.
