# Implementation Plan: GRO-1184 [AUDIT] AGY review of Ned recent darius-star work

**Issue Link**: [GRO-1184](file:///home/ubuntu/work/darius-star/docs/plans/GRO-1184-audit-implementation-plan.md)
**Role**: AGY (Auditor)
**Date**: June 12, 2026

---

## 1. Objectives & Approach
1. **Restore Modular Architecture**: Fix the regression introduced in commit `fc0574d` where `index.html` was reverted to a monolithic copy. This regression bypassed the modular structure, created 404 network errors for `UpgradeSystem` and other modules, and prevented modular bug fixes from taking effect in the running game.
2. **Port Monolith Fixes to Modules**: Extract Ned's additions inside the monolithic `index.html` and merge them into the appropriate modular files (e.g., merging the `laser_glow` sprite rendering into `js/combat.js`).
3. **Audit and Verify Ned's Recent 20 Commits**:
   - Verify syntax of all JavaScript modules recursively.
   - Fix any broken unit tests (e.g., fixing `tests/level_manager_test.js` failing due to missing `playSound` mockup).
   - Trace the status of each item in `docs/agy-post-ned-audit/04-ned-priority-action-list.md` (e.g. boss image path, parallax keys, preloading race conditions, class window bindings, boss loop).
4. **Deliver Audit Reports**:
   - Update and publish the bug matrix, module health report, game state assessment, and action list under `/home/ubuntu/work/darius-star/docs/agy-post-ned-audit/`.
   - Provide clear, actionable feedback for Ned.
5. **Re-label and Hand Off**: Hand off to `agent:ned` / `agent:fred` when complete.

---

## 2. Planned Artifacts
- **Audit Plan**: [GRO-1184-audit-implementation-plan.md](file:///home/ubuntu/work/darius-star/docs/plans/GRO-1184-audit-implementation-plan.md)
- **Bug Matrix**: [01-bug-verification-matrix.md](file:///home/ubuntu/work/darius-star/docs/agy-post-ned-audit/01-bug-verification-matrix.md)
- **Module Health Report**: [02-module-health-report.md](file:///home/ubuntu/work/darius-star/docs/agy-post-ned-audit/02-module-health-report.md)
- **Game State Assessment**: [03-game-state-assessment.md](file:///home/ubuntu/work/darius-star/docs/agy-post-ned-audit/03-game-state-assessment.md)
- **Action List**: [04-ned-priority-action-list.md](file:///home/ubuntu/work/darius-star/docs/agy-post-ned-audit/04-ned-priority-action-list.md)

---

## 3. Verification Steps
- Run `node tests/check_syntax.js` to ensure zero compilation or syntax errors.
- Run `node tests/level_manager_test.js` to verify level spawning mechanics and prevent unit test regressions.
- Run `node tests/local_audit.js` using headless Playwright to confirm the modular game boots and loads without console errors or 404 network requests.
