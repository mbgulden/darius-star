# Live Game Audit Report: Darius Star (GRO-1115)

This audit report documents the bugs, visual glitches, missing assets, broken mechanics, and crashes discovered during a full walkthrough of **Darius Star: Cyber Coelacanth** from the title screen through the expected Biome 1 boss fight.

---

## Executive Summary

The live deployment at `https://darius-star.pages.dev` is currently **completely unplayable** due to a fatal JavaScript syntax crash at boot. After resolving this boot crash locally, the game is still **non-progression blocked** because the central wave-spawning script module is missing, resulting in no enemies spawning. Additionally, several cinematic, portrait, and layout sprite assets are missing (returning 404 errors).

| Bug ID | Severity | Category | Summary |
| :--- | :---: | :---: | :--- |
| **BUG-01** | **Critical** | Crash / Boot | Fatal syntax error in `game_loop.js` halts script loading at boot. |
| **BUG-02** | **Critical** | Progression | Missing `LevelManager` (`level_manager.js`) module prevents enemies from spawning. |
| **BUG-03** | **High** | Gameplay | Dialogue banter is disabled due to missing `BanterEngine` attachment to `window`. |
| **BUG-04** | **Medium** | Assets | Missing cinematic `.mp4` videos (boss intro, victory screen). |
| **BUG-05** | **Medium** | Assets | Missing character portraits folder (`assets/sprites/portraits/`). |
| **BUG-06** | **Low** | Assets | Missing logo, title backgrounds, and minion sprites (404 errors). |

---

## Detailed Bug Reports

### BUG-01: Fatal syntax error in `game_loop.js` (Boot Crash)
* **Severity:** Critical
* **Category:** Crash / Boot
* **Reproduction Steps:**
  1. Open `https://darius-star.pages.dev` in Google Chrome or Chromium.
  2. Open Developer Tools (F12) and check the Console.
  3. Observe the fatal parsing error: `Uncaught SyntaxError: Unexpected token 'const'` pointing to the second line of `game_loop.js`.
* **Description:** 
  The file `js/game_loop.js` was committed with line numbers and pipe characters (e.g. `     1|`, `     2|`) prepended to the actual source code. The browser tries to evaluate this as JavaScript, failing on the second line because the number `2` followed by a pipe `|` is syntactically invalid. This prevents the canvas from initializing and the page from booting.
* **Screenshot Reference:** 
  ![Boot Screen / Console Error](/home/ubuntu/work/darius-star/docs/screenshots/01_title_screen.png)

---

### BUG-02: Missing Spawning Module `LevelManager` (Progression Block)
* **Severity:** Critical
* **Category:** Progression
* **Reproduction Steps:**
  1. Boot the game (requires stripping the line numbers from `game_loop.js` first).
  2. Click the canvas to start audio and select "START GAME".
  3. Select a ship and click "LAUNCH".
  4. Once gameplay loads, observe the player ship flying in space.
  5. Wait indefinitely: no enemies, waves, or obstacles ever spawn.
* **Description:** 
  The game's update loop in `game_loop.js` and `ui.js` delegates wave spawning, background selection, and particle effects to `window.LevelManager`. However, `js/level_manager.js` was never written, committed, or included in `index.html`. Because `LevelManager` is `undefined`, no enemy spawning queues are ever populated, and the game is locked in an empty loop.
* **Screenshot Reference:** 
  ![Empty Space Spawning Failure](/home/ubuntu/work/darius-star/docs/screenshots/03_local_gameplay_spawning.png)

---

### BUG-03: dialogue Banter Engine Silent Failure
* **Severity:** High
* **Category:** Gameplay
* **Reproduction Steps:**
  1. Boot the game (syntax error resolved).
  2. Play the game and watch the comms panel.
  3. Check `window.BanterEngine` in the console. Observe it returns `undefined`.
* **Description:** 
  In `js/banter_engine.js`, the `BanterEngine` object is declared as a local `const` but is never attached to `window.BanterEngine` (unlike `Economy` or `Multiplayer`). In `js/game_loop.js`, the initialization check `if (window.BanterEngine)` fails, silently bypassing and disabling all dialogue, banter events, and story progression.
* **Attachment Fix:** Add `window.BanterEngine = BanterEngine;` at the bottom of `js/banter_engine.js`.

---

### BUG-04: Missing Cinematic Video Assets (404 Not Found)
* **Severity:** Medium
* **Category:** Assets
* **Reproduction Steps:**
  1. Load the game page.
  2. Observe network requests for `assets/cinematics/cinematic_boss_intro.mp4` and `assets/cinematics/cinematic_victory.mp4`.
  3. Observe both return `404 Not Found` errors.
* **Description:** 
  The folder `assets/cinematics` does not exist on Fred's deployment server. When the game attempts to trigger the boss fight intro or the game victory screen, it requests these video files. The browser fails to fetch them, causing an immediate reject and skip of the cinematic sequences.
* **Network Logs:**
  * `http://127.0.0.1:8088/assets/cinematics/cinematic_boss_intro.mp4` -> `404`
  * `http://127.0.0.1:8088/assets/cinematics/cinematic_victory.mp4` -> `404`

---

### BUG-05: Missing Character Portraits Folder (404 Not Found)
* **Severity:** Medium
* **Category:** Assets
* **Reproduction Steps:**
  1. Navigate to gameplay and check network panel.
  2. Observe multiple network failures when loading PNGs under `assets/sprites/portraits/`.
* **Description:** 
  The folder `assets/sprites/portraits` is completely missing from the assets on disk. When character banter or choices load, the game requests dialogue portraits (e.g. `lyra_neutral.png`, `darius_neutral.png`, etc.) and the `comms_overlay.png` frame, which all return `404 Not Found`, rendering the comms dialogue system visually broken.
* **Missing Files List:**
  * `assets/sprites/portraits/lyra_neutral.png`
  * `assets/sprites/portraits/lyra_reactive.png`
  * `assets/sprites/portraits/darius_neutral.png`
  * `assets/sprites/portraits/darius_reactive.png`
  * `assets/sprites/portraits/naya_neutral.png`
  * `assets/sprites/portraits/naya_reactive.png`
  * `assets/sprites/portraits/thorne_neutral.png`
  * `assets/sprites/portraits/thorne_reactive.png`
  * `assets/sprites/portraits/cross_neutral.png`
  * `assets/sprites/portraits/cross_reactive.png`
  * `assets/sprites/portraits/comms_overlay.png`

---

### BUG-06: Missing Title Screen Logos and Game Backgrounds (404 Not Found)
* **Severity:** Low
* **Category:** Assets
* **Reproduction Steps:**
  1. Boot the game.
  2. Check console for layout asset warnings.
* **Description:** 
  Several minor graphics are missing from the folder structures, preventing the title screen and credits from displaying logos and backgrounds correctly:
  * `assets/sprites/studio_logo.png`
  * `assets/sprites/title_0.png`
  * `assets/cinematics/ending_sunrise.png`
  * `assets/sprites/backgrounds/bg_title_strip.png`
  * `assets/sprites/bg_city_0.png`
  * `assets/sprites/bg_nebula_0.png`
  * `assets/sprites/boss_minion_0.png`

---

## Technical Recommendations for Fred

1. **Clean up `js/game_loop.js` syntax:** The line prefixes `   1|` must be removed (this is already fixed in the local repository workspace but needs deploying).
2. **Implement/Restore `js/level_manager.js`:** The wave and biome configuration logic must be restored or written to spawn standard crawler/brute/spitter enemies in Biome 1, trigger the boss at score 2000, and define the particle settings/backgrounds.
3. **Expose `BanterEngine`:** Modify `js/banter_engine.js` to attach to the global window: `window.BanterEngine = BanterEngine;`.
4. **Deploy Missing Assets:** Restore the folders `assets/cinematics/` and `assets/sprites/portraits/` with their respective files on the deploy server.
