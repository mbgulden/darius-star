# Darius Star — Current Linear Task Map (June 8, 2026)

## Phase 1: Foundation ✅
- GRO-831: Repo & game baseline ✅ DONE
- GRO-832: Read and analyze Integration Pack from Google Drive (agent:fred)

## Phase 2: Asset Generation (requires:human-approval)
- GRO-833: Generate player ship sprite — retro-cyberpunk fighter jet
- GRO-834: Generate enemy fleet sprites — cybernetic aquatic biome ships
- GRO-835: Generate Cyber Coelacanth boss sprite
- GRO-836: Generate VFX sprite sheets — lasers, shields, explosions
- GRO-837: Generate parallax background layers — nebula + biomechanical city
- GRO-838: Generate title card and UI art

## Phase 3: Asset Processing (agent:agy)
- GRO-839: Sprite sheet slicer — Pillow-based Python script
- GRO-840: Generate sprites.json manifest from sliced assets

## Phase 4: Dynamic Integration (agent:fred)
- GRO-841: Replace canvas-drawn player ship with sprite asset
- GRO-842: Replace canvas-drawn enemies with sprite assets
- GRO-843: Replace canvas-drawn boss with Cyber Coelacanth sprite
- GRO-844: Integrate VFX sprites — lasers, explosions, shields
- GRO-845: Integrate parallax background layers

## Phase 5: Performance Optimization (agent:fred)
- GRO-846: Offscreen canvas pre-rendering for static assets
- GRO-847: Lazy-loading for boss and background assets
- GRO-848: tasks.json automation — lint and build commands

## Phase 6: Deployment (agent:fred)
- GRO-849: Deploy to Cloudflare Pages
- GRO-850: Mobile/touch controls + responsive canvas

## Known Gaps to Analyze
1. No audio asset phase — currently using Web Audio synthesis only
2. No game state persistence (high scores, localStorage)
3. No level/map system — single continuous scroll
4. No mobile/touch controls yet (GRO-850, last phase)
5. No multiplayer or leaderboard
6. No game studio branding or storefront integration
7. No particle effect pre-rendering optimization
8. No asset pipeline documentation for reuse across future games
9. No automated testing for game mechanics
10. No build/minification pipeline
