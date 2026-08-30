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
- GRO-849: Deploy to Cloudflare Pages ✅ DONE
- GRO-850: Mobile/touch controls + responsive canvas ✅ DONE

## Phase 7: Post-Audit Modular Polish & Gap Closure (GRO-4100 Series) 🚀
*Canonical Roadmap Document:* [`docs/LINEAR-TASK-ROADMAP.md`](./LINEAR-TASK-ROADMAP.md)  
*Comprehensive Audit Reference:* [`docs/audits/00-MASTER-AUDIT-INDEX.md`](./audits/00-MASTER-AUDIT-INDEX.md)

### Track 1: Voice & Audio Subsystem
- **GRO-4101**: Synthesize & Ingest Lyra Star Navigator Voice Lines Suite (45 lines) (`agent:agy`)
- **GRO-4102**: Synthesize Haven-7 Comms (Selene) & Precursor Transmissions (Architect) (30 lines) (`agent:agy`)
- **GRO-4103**: Voice Playback Ducking & Subtitle Synchronization (`agent:fred`)

### Track 2: Visual Assets & Sprites
- **GRO-4104**: Synchronize Sprite Manifests & Power-of-Two Validation (`agent:agy`)
- **GRO-4105**: UI Animated Reticle & Power-Up Glow Frames (`agent:agy`)

### Track 3: Narrative & Story Polish
- **GRO-4106**: Narrative Empathy Flag Persistence Across New Game+ Loops (`agent:fred`)
- **GRO-4107**: Branching Ending Cinematic Transitions & Audio Tunnel Stems (`agent:fred`)

### Track 4: Level Content & Wave Balancing
- **GRO-4108**: Dynamic Co-Op Multi-Player Boss Scaling (`agent:fred`)
- **GRO-4109**: Biome 6-10 Scrap Economy & Yield Curve Calibration (`agent:fred`)

### Track 5: UI/UX & Gamepad Integration
- **GRO-4110**: Consolidate Standalone HTML Shells into Unified In-Engine DOM Overlays (`agent:fred`)
- **GRO-4111**: Standard Gamepad API & Haptic Vibration Integration (`agent:fred`)

### Track 6: CI/CD & Deployment Verification
- **GRO-4112**: Automated Playwright End-to-End Campaign Smoke Test Suite (`agent:fred`)
- **GRO-4113**: Edge Router Telemetry Aggregation & Healthcheck Endpoint (`agent:fred`)

