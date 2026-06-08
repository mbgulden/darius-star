# Darius Star: Cyber Coelacanth

Horizontal retro shoot-em-up space arcade game. Built in single-file HTML5 Canvas with Web Audio synthesis.

## Current Architecture

- **index.html** — 1233 lines. Single-file game. No build step, no dependencies.
- **Canvas-drawn graphics** — all sprites are procedural shapes (ctx.fillRect, ctx.beginPath, ctx.arc, etc.)
- **Web Audio synthesis** — all sounds generated at runtime via OscillatorNode. No audio files.
- **requestAnimationFrame** — already used for game loop (not setInterval)
- **No sprite assets** — zero image files in the repo
- **No level system** — continuous scrolling with enemy waves
- **No state persistence** — no localStorage, no high scores

## Game Systems

### Player
- 5 weapon levels (single → double → triple → heavy pulsar → supreme nova)
- Shield system (100HP, invulnerability frames on hit)
- Power-up collection (weapon upgrade orbs, shield restore orbs)

### Enemies
- Scout: sine-wave movement, 1HP, 100pts
- Interceptor: speed-charge, 1HP, 150pts
- Heavy: slow drift, 4HP, shoots homing bullets, 300pts
- Boss Minion: fast scurrying, 2HP, 50pts

### Boss (Cyber Coelacanth)
- 5-state AI: intro → idle → rage → laser_charge → laser_fire
- 120HP, massive beam attack, minion spawning, homing bullets
- Triggers at 2,000 points with siren warning sequence

### Background
- 3-layer parallax starfield (77 stars across 3 speed layers)
- Procedural — no image assets

## What's Needed for Asset Integration

The game currently draws everything procedurally. To integrate sprite assets:
1. Load sprite images into Image objects
2. Replace canvas-drawn shapes with ctx.drawImage() calls
3. Handle sprite sheet frame animation (cycling through frames)
4. Maintain existing game logic — just swap rendering method

## What's Needed for a Reusable Sprite Tool

A tool that can be used across future 2D games should:
1. Accept a sprite sheet PNG + layout config (grid size, frame count)
2. Slice into individual frames
3. Output PNG files + JSON manifest
4. Generate JavaScript sprite loader code
5. Handle power-of-two validation
6. Support alpha transparency
7. Work with Google Flow Beta / Leonardo.ai output formats
