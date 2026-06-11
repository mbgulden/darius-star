# Darius Star: Cyber Coelacanth — Game Design Document (GDD)

**Version:** 1.0  
**Studio Brand:** What An Adventure Games  
**Aesthetic:** Gritty Sci-Fi Scrapper Console  
**Author:** Jules (Software Engineer Agent)  
**Date:** June 2026

---

## 1. Game Overview
### 1.1 Elevator Pitch
*Darius Star: Cyber Coelacanth* is a horizontal retro shoot-'em-up that blends the fast-paced action of 16-bit arcade classics like *Darius* and *R-Type* with a gritty cyberpunk narrative and a modern "scrapper" economy. Players navigate the crushing depths of alien oceans and the vast reaches of space to save a dying family legacy.

### 1.2 Genre
Horizontal Scrolling Shoot-'em-up (SHMUP) with meta-progression and narrative-driven campaign.

### 1.3 Platform
Primary: Web (HTML5/Canvas), fully responsive for Desktop and Mobile.  
Target: Modern browsers, optimized for Cloudflare Pages deployment.

### 1.4 Target Audience
Retro arcade enthusiasts, fans of 16-bit console aesthetics (Sega Genesis/SNES), and players who enjoy challenging combat coupled with persistent upgrade systems.

---

## 2. Core Mechanics
### 2.1 Ship Types & Handling
Players can choose from multiple ship models, each with distinct stats and "Specials":
*   **X-1 Scout (Striker)**: High speed, low shield. Special: *Shock Lance* (Piercing energy beam).
*   **Y-2 Interceptor (Tempest)**: Balanced stats. Special: *Overload* (Temporary max weapon level + homing).
*   **Z-3 Dreadnought (Bastion)**: Low speed, high shield. Special: *Iron Curtain* (Stationary energy barrier).
*   **Phantom**: Special: *Phase Shift* (Invulnerability and speed, no firing).
*   **Specter**: Special: *Shadow Clone* (Decoy deployment and invisibility).

### 2.2 Combat & Weapon Levels
Primary fire evolves through five power tiers:
1.  **Single Shot**: Basic forward projectile.
2.  **Double Shot**: Parallel forward projectiles.
3.  **Triple Spread**: Angled projectiles for wider coverage.
4.  **Heavy Pulsar**: Larger, high-damage bolts with splash potential.
5.  **Supreme Nova**: Screen-filling energy wave (risk of overheat).

### 2.3 The "Pull-Out" Mechanic (No Death)
True to the "gritty scrapper" aesthetic, the game features a **Pull-Out Mechanic** rather than a traditional Game Over. When a ship's hull integrity reaches zero, a fail-safe emergency warp is triggered. The player is extracted from the mission, retaining a portion of gathered scrap but losing mission progress and in-run power-ups. This emphasizes the value of the ship as a reclaimed asset.

### 2.4 Scrap Economy & Upgrades
*   **Scrap**: Gathered from destroyed enemies. Higher tier enemies (Heavies, Bosses) drop rare scrap fragments.
*   **In-Run Upgrades**: Temporary boosts (Speed, Shield Restore, Weapon Orbs) collected during levels.
*   **Meta-Progression**: Permanent upgrades purchased at the *Haven-7* hub using accumulated scrap. Categories include Weapon Systems, Shield Generators, Engines, and Specials.

### 2.5 Combo Scoring
Destroying enemies in quick succession builds a **Combo Meter**. High combos grant score multipliers and cosmetic "juice" (screen shakes, particle bursts). Taking damage resets the combo.

### 2.6 Biomes & Level Structure
The game consists of **10 Biomes**, each containing **10 Levels** (100 total).
*   Levels 1-4: Standard wave clear.
*   Level 5: **Mid-Boss** encounter.
*   Levels 6-9: Escalating difficulty and environmental hazards.
*   Level 10: **Biome Boss** (The "Great Hunt").

---

## 3. Progression System
### 3.1 100-Level Campaign
Players progress through the biomes sequentially:
1. Abyssal Trench (Earth)
2. Coral Graveyard (Kepler-442b)
3. Coelacanth's Lair (Europa)
4. Nebula Drift (Veil Nebula)
5. Ice Ring (Saturn)
6. Fire Nebula (Betelgeuse)
7. Storm Belt (HD 189733b)
8. Derelict Fleet (Orbit)
9. Xenomorph Hive (Proxima b)
10. Core Rift (Galactic Core)

### 3.2 NG+ Scaling
Upon completing the 100th level and defeating the final boss, players unlock **New Game Plus (NG+)**. This increases enemy health, projectile speed, and spawn density while introducing "Elite" variants of early-biome enemies.

### 3.3 Save Slots & Persistence
The game utilizes `localStorage` to track:
*   Total Scrap balance.
*   Permanent upgrade ranks.
*   Unlocked ships and cosmetics.
*   High scores across three dedicated save slots.

---

## 4. Multiplayer
### 4.1 Drop-In/Out Co-op
Supports 2-4 players locally. Players can join or leave at the ship selection screen or between levels.
*   **P1/P2**: Optimized for shared keyboard or Gamepads.
*   **P3/P4**: Requires Gamepads.

### 4.2 Input Mapping
The `InputManager` abstracts physical keys into logical actions, supporting simultaneous input.
*   **Player 1 (Keyboard)**: `W/A/S/D` to move, `Space` to fire, `Left Shift` for Special/Bomb.
*   **Player 2 (Keyboard)**: `Arrow Keys` to move, `NumPad 0` or `J` to fire, `NumPad Enter` or `K` for Special/Bomb.
*   **Gamepads**: Automatically detected via the Gamepad API and assigned to the next available player slot. Standard mapping: Left Stick to move, South Face Button to fire, Right Trigger for Special.

### 4.3 UI for Joining
The **Ship Selection Screen** serves as the lobby. Pressing "Fire" on a secondary input device activates a new player slot. The UI displays "PRESS START / SPACE TO JOIN" in empty slots.

---

## 5. Characters and Story
### 5.1 The Star Family
The narrative centers on the **Star Bloodline**, engineered by the Navy to be vessels for a cosmic consciousness.
*   **Darius Star**: The protagonist, a deep-sea salvage mercenary.
*   **Naya Warden**: Darius’s partner and tactical pilot. She provides "The Heart" of the squad, often serving as the primary comms contact during missions.
*   **Lyra Navigator**: Darius’s daughter, afflicted with "Trench Sickness"—actually a precursor attunement. She acts as a "Navigator," sensing shifts in the Abyss Mind.

### 5.2 Banter System
A contextual dialogue engine triggers banter between pilots based on:
*   Biome entry/exit.
*   Boss health thresholds.
*   Low shield warnings.
*   Multi-player interactions (e.g., one player shielding another).

### 5.3 Voice Profiles
Characters have distinct "Gritty Sci-Fi" voice profiles:
*   **Thorne (Comms)**: Gruff, veteran, tactical.
*   **Naya**: Determined, sharp, protective.
*   **Ophion (AI)**: Ethereal, ancient, inquisitive.

---

## 6. Art Direction
### 6.1 Pixel Art Style
16-bit "Sega Genesis" aesthetic. Uses dithered gradients, high-contrast neon accents, and dark "Abyssal" backgrounds. 

### 6.2 Color Palettes
Each biome has a signature palette:
*   **Abyssal Trench**: Navy (#0A1128), Orange (#FF6600), Cyan (#00FFFF).
*   **Coral Graveyard**: Rust (#CC5500), Pink (#FF4488), Green (#1A3A2A).
*   **Fire Nebula**: Lava (#FF4400), Amber (#FFAA00), Ash (#443333).

### 6.3 Sprite Specifications
*   **Standard Sprites**: 32x32 or 64x64 grid-aligned.
*   **Bosses**: 128x128 to 256x256 multi-part sprites.
*   **Source**: 1024x1024 master sheets sliced via automation scripts.

### 6.4 Parallax Backgrounds
3-5 layers of depth per biome:
*   **Far**: Static nebula or starfield.
*   **Mid**: Scrolling silhouettes (cities, ruins, ice fields).
*   **Near**: Fast-moving particles (bubbles, ash, space dust).

---

## 7. Audio Design
### 7.1 Web Audio Synth Engine
Procedural generation of "Chiptune" SFX:
*   **Lasers**: Frequency sweeps (Sawtooth/Square).
*   **Explosions**: White noise with low-pass filters.
*   **UI**: Sine wave blips.

### 7.2 Sound Categories
*   **Impacts**: Thudding, metallic.
*   **Energy**: Hum, buzz, sizzle.
*   **Ambient**: Low-frequency drones and biome-specific noise (bubbles, static, wind).

### 7.3 Ambient Biome Design
Each biome features a unique "Ambient Noise" layer generated at runtime to ensure a deep, immersive "Scrapper" feel.

---

## 8. Technical Architecture
The architecture is designed for high performance in a single-threaded browser environment, leveraging modern Web APIs without external library dependencies.

### 8.1 Canvas Rendering Pipeline
*   **Main Loop**: Driven by `requestAnimationFrame`, ensuring synchronization with the display refresh rate.
*   **Layered Rendering**: 
    1.  Parallax Backgrounds (direct image blitting).
    2.  Offscreen Starfield/Particle Buffers (pre-rendered procedural content).
    3.  Entity Layer (Player, Enemies, Bullets using `drawImage`).
    4.  VFX Layer (Additive blending for explosions).
    5.  HUD/UI Overlay (Vector text and bars).
*   **Performance Optimization**: Static or slow-changing procedural elements are drawn to **Offscreen Canvases** and blitted as single images to minimize draw calls.

### 8.2 Module Structure
The codebase follows a modular design to separate concerns:
*   `index.html`: The orchestration layer. Contains the main game loop, entity management, and core rendering logic.
*   `upgrade_system.js`: A self-contained module managing the `localStorage` state, meta-progression logic, and gameplay modifiers.
*   `InputManager`: Abstracted input handling supporting multiple players and device types.
*   `AudioManager`: Handles procedural sound synthesis and sample playback.

### 8.3 Asset Loading & Manifests
*   **Sprite Manifest**: `assets/sprites.json` serves as the single source of truth for all graphical assets.
*   **Lazy Loading**: To minimize initial load times, high-resolution boss sprites and cinematic `.mp4` files are only fetched when the player nears the trigger threshold (e.g., 1,500 points).
*   **Procedural Fallbacks**: All entities include procedural drawing routines that execute if a sprite fails to load, ensuring the game remains playable.

### 8.4 Deployment & Infrastructure
*   **Host**: Cloudflare Pages for global low-latency distribution.
*   **Automation**: `tasks.json` defines Python-based workflows for asset linting, sprite sheet slicing, and manifest generation.

---

## Appendix: Technical Specifications
| System | Detail |
|---|---|
| **Language** | ECMAScript 2022+ (Vanilla JS) |
| **Graphics** | HTML5 Canvas 2D API |
| **Audio** | Web Audio API (Oscillator/Gain nodes) |
| **Persistence** | Window.localStorage (JSON serialized) |
| **Resolution** | Internal 800x450 (16:9), CSS responsive scaling |
| **Frame Rate** | Target 60 FPS |

---

## 9. Roadmap
### 9.1 Completed (Phase 1)
*   Core Engine (Movement, Collision, Firing).
*   First 3 Biomes (Visuals & Enemies).
*   Basic Upgrade Shop & Scrap Economy.
*   Cyber Coelacanth Boss (5-State AI).

### 9.2 In Progress (Phase 2)
*   Full 100-level sequence implementation.
*   Expanded Enemy Roster (28+ new types).
*   Character Banter Engine & Scripting.
*   Music Track Generation (Lyria 3).

### 9.3 Planned (Phase 3)
*   Advanced Multiplayer Networking (WebRTC).
*   Full Voice Acting for key story beats.
*   Daily Challenges & Global Leaderboards.
*   Hardcore "One Life" Scrapper Mode.

---
*Generated by the What An Adventure Games Documentation Pipeline.*
