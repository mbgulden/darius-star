# AGY Audit Report: Audio Pipeline & AudioManager
**Verdict**: NEEDS_FIXES  
**Target Files**: 
* [assets/audio/audio_manifest.json](file:///home/ubuntu/work/darius-star/assets/audio/audio_manifest.json) (manifest configuration)
* [js/audio_manager.js](file:///home/ubuntu/work/darius-star/js/audio_manager.js) (cinematic audio controller)
* [js/audio.js](file:///home/ubuntu/work/darius-star/js/audio.js) (sound synthesis engine)
* [js/audio_chip.js](file:///home/ubuntu/work/darius-star/js/audio_chip.js) (chiptune synth loop)
**Reference Issues**: GRO-1470, GRO-1293, GRO-1294, GRO-1295  

---

## 1. Executive Summary
This report audits the cinematic audio pipeline including file inventory, preloading, audio context gesture unlocking, and procedural sound hooks. Although the canvas-click gesture unlock and crossfade systems work correctly, the pipeline suffers from major catalogue discrepancies, bandwidth/memory issues, and missing files.

---

## 2. Detailed Findings

### A. Severe Manifest Catalogue Bloat & Missing Tracks
* **Disk vs Manifest**: There are **101 MP3 files** present under `assets/audio`. However, the manifest file lists **156 tracks**.
* **404 Load Errors**: Exactly **78 tracks** listed in `audio_manifest.json` do not exist on disk. During `AudioManager.preloadAll()`, this causes 78 network 404 errors to clog the console.
* **Code Mappings**: The code inside `AudioManager` references exactly **40 tracks** (30 biome tracks + 10 general tracks).
* **Missing References**: Of the 40 referenced tracks, 35 exist on disk. The remaining 5 are missing:
  1. `title` -> maps to missing `title.mp3` (actual file is `title-screen.mp3` or `title_cinematic.mp3`).
  2. `game_over` -> maps to missing `game_over.mp3` (actual file is `game_over_cinematic.mp3`).
  3. `boss_loop` -> maps to missing `boss_loop.mp3`.
  4. `phase1` -> maps to missing `phase1.mp3`.
  5. `phase2` -> maps to missing `phase2.mp3`.

### B. Preloading Performance and Memory Issues
* **File Reference**: [js/game_loop.js:L1572-1580](file:///home/ubuntu/work/darius-star/js/game_loop.js#L1572-L1580) and [js/audio_manager.js:L178-199](file:///home/ubuntu/work/darius-star/js/audio_manager.js#L178-L199)
* **The Bug**: `game_loop.js` calls `AudioManager.init()` and `AudioManager.preloadAll()` immediately on page load, rather than deferring it until the first user interaction.
* **Impact**: `preloadAll` will attempt to fetch and decode all 156 tracks in the manifest immediately on startup. Downloading and decoding hundreds of megabytes of audio data into uncompressed PCM buffers wastes immense network bandwidth, clogs the browser, and consumes massive amounts of RAM, risking browser out-of-memory crashes.

### C. Missing SFX Assets
* **File Reference**: [js/audio.js:L50-51](file:///home/ubuntu/work/darius-star/js/audio.js#L50-L51)
* **The Bug**: `ui_hover.mp3` and `shield_hit.mp3` are specified in `SFX_SAMPLE_MAP` but are completely missing under `assets/audio/sfx/` on disk.
* **Impact**: While they fall back to the Web Audio synth engine correctly, the custom high-quality MP3 samples are not utilized.

### D. Chiptune Synth Bypassed
* **File Reference**: [js/audio_chip.js:L51](file:///home/ubuntu/work/darius-star/js/audio_chip.js#L51)
* **The Bug**: `startMenuMusic()` returns early if `AudioManager.isInitialized()` is true. Since `AudioManager.init()` is run immediately on page load, the chiptune menu music is completely bypassed from startup, causing the game to be completely silent until the user clicks and resumes the audio context.

---

## 3. Recommended Actions

1. **Clean up audio manifest**:
   Remove the 78 non-existent entries from `assets/audio/audio_manifest.json` to prevent console 404 spam.
2. **Re-map missing keys**:
   * In `assets/audio/audio_manifest.json`, map `title` to `assets/audio/title-screen.mp3`.
   * Map `game_over` to `assets/audio/game_over_cinematic.mp3`.
3. **Map exploration fallbacks**:
   Map `phase1` and `phase2` to existing biome ambient tracks or `ambient_deep_space.mp3` file to prevent errors.
4. **Lazy-Load Audio Assets**:
   Remove `AudioManager.preloadAll()` from startup in `game_loop.js`. Defer preloading tracks to when they are about to be played (e.g. preload the next biome's music when the level starts, or load only when `play` is called).
5. **Restore Chiptune Menu Music on Startup**:
   Allow chiptune music to run on startup. Once the user clicks the canvas and AudioManager is fully playing, fade out the chiptune synth.
