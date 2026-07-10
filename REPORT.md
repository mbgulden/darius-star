# Project Report: Darius Star: Cyber Coelacanth

## Overview
**Darius Star: Cyber Coelacanth** is a horizontal retro shoot-'em-up space arcade game. It features a 16-bit cyberpunk aesthetic and centers around biomechanical boss battles. The game is built as a single-file HTML5 canvas application with procedural audio.

## Key Features
- **Gameplay**: 5 weapon levels, 4 distinct enemy types, and a complex boss battle triggered at 2,000 points.
- **Visuals**: Parallax scrolling (3 layers), 16-bit retro aesthetic, and cinematic video overlays.
- **Audio**: Procedural sound generation using the Web Audio API (no external audio files required for core effects).
- **Controls**: Standard WASD/Arrow keys for movement, Space/J for firing, and P for pausing.

## Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (Canvas API, Web Audio API).
- **Backend/Tooling**: Python scripts for asset generation (Pillow-based), sprite manifest management, and linting.
- **Infrastructure**: Cloudflare Pages for deployment.

## Current State
- **Development Phase**: The project has successfully moved past the "Baseline" phase (canvas-drawn graphics). It is currently focused on **Asset Generation and Processing**.
- **Completed**:
    - Working core game mechanics.
    - Automation for sprite slicing and manifest generation (`generate_sprites_manifest.py`).
    - Mock testing suite for pipeline validation.
- **In Progress / Planned**:
    - Integration of real sprite assets to replace placeholder canvas shapes.
    - Performance optimizations (offscreen canvas, lazy-loading).
    - Refinement of the build and deployment pipeline as defined in `tasks.json`.

## Recent Repository Maintenance (Rescue Sweep)
The repository recently underwent a "Ned rescue sweep" to consolidate stale pull requests and maintain a clean `master` lineage. Key outcomes include:
- **Consolidation**: Safe artifacts from various feature branches were merged into `master` via targeted PRs (#18, #19, #20).
- **Branch Management**: The `main` branch is considered to have unrelated history and is currently avoided for direct merges to prevent mass deletion diffs.
- **Preserved Material**:
    - Documentation and reference media (PR #19).
    - Sprite slicer tooling (PR #20).
    - Transparent VFX feature assets (PR #18).
- **Procedural Backgrounds**: Recent fixes included 2× width backgrounds for seamless tiling and additive blending for explosions.

## Repository Structure
- `index.html`: Main game file.
- `assets/`: Contains sprites and audio (to be fully populated).
- `docs/`: Design documentation and architecture notes.
- `tasks/`: Automation scripts for linting and building.
- Root scripts: Various Python utilities for asset pipeline management.
