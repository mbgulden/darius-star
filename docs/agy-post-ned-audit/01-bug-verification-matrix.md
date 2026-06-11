# Report 1: Bug Verification Matrix

This matrix tracks the resolution status of all bugs and integration gaps identified in the prior game audits ([live-game-audit.md](file:///home/ubuntu/work/darius-star/docs/live-game-audit.md) and [code-quality-audit.md](file:///home/ubuntu/work/darius-star/docs/code-quality-audit.md)). Every item has been verified against the master branch codebase in `/home/ubuntu/work/darius-star/js/`.

---

## 1. Live Game Audit Bugs

| Bug ID | Severity | Category | Summary | Resolution Status | Associated Commit(s) | Verification Evidence / Code Details |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | **Critical** | Crash / Boot | Fatal syntax error in `game_loop.js` halts script loading at boot. | **Fixed** | `0159013` (Jules code patches) | Line numbers and pipe characters (e.g. `1|`, `2|`) have been stripped from [game_loop.js](file:///home/ubuntu/work/darius-star/js/game_loop.js). The file now parses as clean JavaScript. |
| **BUG-02** | **Critical** | Progression | Missing `LevelManager` (`level_manager.js`) module prevents enemies from spawning. | **Fixed** | `cc523a4` (GRO-1140/1141/1142) | [level_manager.js](file:///home/ubuntu/work/darius-star/js/level_manager.js) is implemented and loaded in [index.html](file:///home/ubuntu/work/darius-star/index.html#L325). It handles waves, formations, and spawns. |
| **BUG-03** | **High** | Gameplay | Dialogue banter is disabled due to missing `BanterEngine` attachment to `window`. | **Fixed** | `d716794` (BanterEngine window attachment) | [banter_engine.js](file:///home/ubuntu/work/darius-star/js/banter_engine.js#L201) explicitly sets `window.BanterEngine = BanterEngine;`, resolving initialization check in `game_loop.js`. |
| **BUG-04** | **Medium** | Assets | Missing cinematic `.mp4` videos (boss intro, victory screen). | **Partially Fixed (Graceful Fallback)** | N/A | The `.mp4` files remain missing under `assets/cinematics/`. However, [ui.js](file:///home/ubuntu/work/darius-star/js/ui.js#L232-L239) and [ui.js](file:///home/ubuntu/work/darius-star/js/ui.js#L270-L276) now catch video play errors (`play().catch(...)`) and automatically transition to standard screens, preventing game lockups. |
| **BUG-05** | **Medium** | Assets | Missing character portraits folder (`assets/sprites/portraits/`). | **Not Fixed (Graceful Fallback)** | N/A | The `assets/sprites/portraits` directory does not exist. Comms dialogue boxes will display text but no portraits. [ui.js](file:///home/ubuntu/work/darius-star/js/ui.js#L1880) handles this safely by checking `naturalWidth > 0` before drawing. |
| **BUG-06** | **Low** | Assets | Missing logo, title backgrounds, and minion sprites (404 errors). | **Not Fixed** | N/A | Assets such as `studio_logo.png`, `title_0.png`, `bg_title_strip.png`, and `ending_sunrise.png` are still missing from disk, causing 404 network errors. Fallbacks are drawn where possible. |

---

## 2. Code Quality Audit Integration Gaps

| Gap ID | Severity | Summary | Resolution Status | Associated Commit(s) | Verification Evidence / Code Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gap 1** | **Critical** | `BanterEngine` Global Attachment Bug (same as BUG-03). | **Fixed** | `d716794` (BanterEngine window attachment) | Verified in [banter_engine.js](file:///home/ubuntu/work/darius-star/js/banter_engine.js#L201): `window.BanterEngine = BanterEngine;`. |
| **Gap 2** | **High** | `LevelManager` references non-existent `Multiplayer.activePlayers`. | **Fixed** | `65087b8` (Multiplayer count fix) | All references in [level_manager.js](file:///home/ubuntu/work/darius-star/js/level_manager.js#L128) have been changed to `Multiplayer.count` or function calls, scaling wave and HP difficulty correctly. |
| **Gap 3** | **Critical** | `LevelManager.currentLevelConfig` missing `background` and `particleSettings`. | **Fixed** | `acf6801` (Parallax fix) & `960a544` (Particles format) | [level_manager.js](file:///home/ubuntu/work/darius-star/js/level_manager.js#L392-L393) sets `background` and `particleSettings` in `currentLevelConfig`. `_particleSettingsForBiome` returns correct nested structures. |
| **Gap 4** | **High** | `ui.js` calls incorrect fields (`currentBiome`/`currentLevel` instead of `biome`/`level`). | **Fixed** | `cc523a4` (LevelManager getters) | Getters `currentBiome` and `currentLevel` are implemented in [level_manager.js](file:///home/ubuntu/work/darius-star/js/level_manager.js#L67-L73) mapping to `this.biome` and `this.level`. |
| **Gap 5** | **Medium** | Namespace Pollution: Only 2 out of 17 modules run inside IIFE wrappers. | **Documented / By Design** | N/A | Rules in [AGENTS.md](file:///home/ubuntu/work/darius-star/AGENTS.md#L44-L45) explicitly forbid IIFE wrappers for new modules. Top-level scope is required so modules can share classes easily without complex import setups. |
| **Gap 6** | **Medium** | Class-hoisting and Global Binding Omissions (classes not attached to `window`). | **Not Fixed** | N/A | Classes like `Enemy`, `Boss`, and `Bullet` in [enemies.js](file:///home/ubuntu/work/darius-star/js/enemies.js) and [combat.js](file:///home/ubuntu/work/darius-star/js/combat.js) are declared globally but not explicitly attached to `window`. This can cause issues in automated test runners. |
