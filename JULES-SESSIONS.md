# Jules Sessions — Darius Star Modularization

**Goal:** Extract 8000-line index.html into 7 separate .js modules
**Strategy:** 7 parallel Jules sessions, each extracting one module → Fred integrates PRs

| # | Module | Session ID | Status | PR |
|---|--------|-----------|--------|-----|
| 1 | js/player.js | [7951194088332578973](https://jules.google.com/session/7951194088332578973) | 🔄 Running | — |
| 2 | js/enemies.js | [214270100773240712](https://jules.google.com/session/214270100773240712) | 🔄 Running | — |
| 3 | js/combat.js | [16942782032474049519](https://jules.google.com/session/16942782032474049519) | 🔄 Running | — |
| 4 | js/renderer.js | [2537756392709685899](https://jules.google.com/session/2537756392709685899) | 🔄 Running | — |
| 5 | js/sprites.js | [251516966939375623](https://jules.google.com/session/251516966939375623) | 🔄 Running | — |
| 6 | js/audio.js | [5687445356295703761](https://jules.google.com/session/5687445356295703761) | 🔄 Running | — |
| 7 | js/ui.js | [13281164017414948648](https://jules.google.com/session/13281164017414948648) | 🔄 Running | — |

## Integration Order (Fred's job)
1. player → merge
2. enemies → merge (may conflict with player's index.html edits)
3. combat → merge
4. renderer → merge
5. sprites → merge
6. audio → merge
7. ui → merge (hardest — code is scattered)

## Validation Checklist
- [ ] Game loads without errors
- [ ] Player ship visible and controllable
- [ ] Enemies spawn and animate
- [ ] Shooting works (player + enemy bullets)
- [ ] Boss spawns at wave thresholds
- [ ] Explosions render correctly
- [ ] Backgrounds/parallax work
- [ ] Audio plays (laser, explosion, ambient)
- [ ] Menus work (title, pause, game over)
- [ ] HUD displays (score, lives, scrap, combo)
- [ ] Deploy to darius-star.pages.dev
