# AGY Audit Report: Script Load Order & Module Dependencies
**Verdict**: NEEDS_FIXES  
**Target File**: [index.html:L344-381](file:///home/ubuntu/work/darius-star/index.html#L344-L381)  
**Reference Issue**: Post-Modularization Architecture  

---

## 1. Executive Summary
This report analyzes the dependency structure and load order of the 38 script tags in `index.html`. While all modules parse cleanly and run-time dependencies resolve due to late-binding, the load order violates several architectural design guidelines specified in `AGENTS.md`. Key scripts are loaded out of order, and `game_loop.js` is not positioned as the last script in the load sequence.

---

## 2. Detailed Findings

### A. game_loop.js is Not Last
* **File Reference**: [index.html:L377-381](file:///home/ubuntu/work/darius-star/index.html#L377-L381) and [AGENTS.md:L19-20](file:///home/ubuntu/work/darius-star/AGENTS.md#L19-L20)
* **The Guideline**: `AGENTS.md` states: *"Load order is critical — modules are loaded in dependency order, with game_loop.js last."*
* **The Violation**: In `index.html`, `js/game_loop.js` is loaded at line 377, followed by `js/story/branching.js`, `js/story/audio-tunnels.js`, `js/story/triggers.js`, and `js/touch_controls.js`.
* **Impact**: While they resolve during initial synchronous page parsing, running `requestAnimationFrame(loop)` in `game_loop.js` before later scripts are parsed violates architectural layout rules and increases risk of race conditions if async operations or timers trigger early.

### B. Dependency Out-of-Order: ui.js vs audio_chip.js / audio_manager.js
* **File Reference**: [index.html:L368-370](file:///home/ubuntu/work/darius-star/index.html#L368-L370)
* **The Violation**: `js/ui.js` (loaded at line 368) references `startMenuMusic()` and `stopMenuMusic()`, which are defined in `js/audio_chip.js` (loaded at line 369).
* **Impact**: This relies on late-binding. If `ui.js` were to call these functions during parse time, it would fail with a ReferenceError. Loading the audio engines *before* the UI script is a cleaner and safer practice.

### C. Dependency Out-of-Order: enemies.js vs particles.js / sprites.js
* **File Reference**: [index.html:L358](file:///home/ubuntu/work/darius-star/index.html#L358), [L361](file:///home/ubuntu/work/darius-star/index.html#L361), and [L363](file:///home/ubuntu/work/darius-star/index.html#L363)
* **The Violation**: `js/enemies.js` (loaded at line 358) references the `Particle` class (defined in `js/renderer/particles.js`, line 361) and `enemySprites` / `vfxSprites` (defined in `js/sprites.js`, line 363).
* **Impact**: Again, this depends on late-binding at runtime. It is architecturally confusing to declare classes that reference undefined constructors at parse time.

---

## 3. Recommended Actions

Reorder the script tags in `index.html` to align with strict dependency hierarchies, ensuring all classes are declared before they are referenced, and that `game_loop.js` is positioned at the very end of the execution chain:

1. **Move audio scripts before ui.js**:
   Load `audio.js`, `audio_chip.js`, and `audio_manager.js` before `ui.js`.
2. **Move utility and sprite loaders early**:
   Ensure `sprites.js`, `renderer/particles.js`, and `renderer/parallax.js` load before `player.js` and `enemies.js`.
3. **Move game_loop.js to the absolute end**:
   Position `game_loop.js` after `touch_controls.js` and all story/triggers modules.
