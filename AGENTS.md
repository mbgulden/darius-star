# darius-star — Jules AGENTS.md

## Project: Darius Star: Cyber Coelacanth
Horizontal retro shoot-'em-up space arcade game. 10 biomes × 10 levels. 
Canvas-based browser game. Deployed via Cloudflare Pages from this repo.

## FORBID: Do NOT modify these
- `assets/` — binary game assets (sprites, audio, cinematics)
- `*.py` — build/deploy scripts
- `*.md` — documentation (except this file with approval)

## Architecture (8000-line index.html)
The game is a single `index.html` containing all game logic. Several modules are already extracted:
- `multiplayer.js` — 1-4 player drop-in/out
- `banter_engine.js` — dialogue/banter system
- `economy.js` — scrap drops/economy
- `save_system.js` — campaign save/load
- `combo.js` — combo scoring
- `upgrade_system.js` — ship upgrades
- `ngplus.js` — New Game+
- `leaderboard.js` — high scores

### What's still in index.html (~8000 lines)
Major sections (in order):
1. HTML/CSS shell (lines 1-286)
2. Web Audio synth + ambient audio (lines 287-500)
3. Game constants, settings, screens (lines 500-1300)
4. Menu/dialogue/ending systems (lines 1300-2960)
5. **Player class** (~600 lines, ~line 2962)
6. **Bullet, EnemyBullet classes** (~lines 3718-3824)
7. **Enemy class** (~250 lines, ~line 3826)
8. **Boss class** (~400 lines, ~line 4011)
9. SpriteExplosion, ScrapDrop, EnvironmentParticle, PowerUp (lines 4476-4669)
10. Backgrounds + ParallaxLayer (lines 4640-4820)
11. Sprite loading (player/enemy/VFX/boss/portrait, lines 4740-5050)
12. **Game loop** — update(), draw(), collision detection (lines 6700-8000)
13. Menu rendering, pause, settings, HUD

## Refactoring Goal
Extract these from index.html into separate .js files:
1. `js/player.js` — Player class
2. `js/enemies.js` — Enemy + Boss classes + EnemyBullet
3. `js/combat.js` — Bullet, collision detection, SpriteExplosion
4. `js/renderer.js` — ParallaxLayer, EnvironmentParticle, background generation
5. `js/sprites.js` — All sprite loading functions
6. `js/audio.js` — Web Audio synth + ambient
7. `js/ui.js` — Menu screens, HUD overlay, pause menu, settings

## Rules
- Keep exact same functionality — no behavior changes
- Add `<script src="js/xxx.js"></script>` tags in index.html for new modules
- Remove extracted code from index.html
- Test that the game still loads (check for missing global references)
- PR-only, do not merge
- Use `spritesReady` Set pattern for sprite loading (already in code)
