# Darius Star: Cyber Coelacanth

Horizontal retro shoot-'em-up space arcade game. 16-bit cyberpunk aesthetic with biomechanical boss battles. Canvas-based HTML5 game with Web Audio synthesis.

## Play

Open `index.html` in any modern browser. No build step, no dependencies.

## Controls

| Key | Action |
|-----|--------|
| W/A/S/D or Arrow Keys | Move |
| Spacebar or J | Fire |
| P | Pause |

## Features

- **5 weapon levels** — single shot → double → triple spread → heavy pulsar → supreme nova
- **4 enemy types** — scout (sine-wave), interceptor (speed-charge), heavy (shoots back), boss minion
- **Boss battle** — Cyber Coelacanth dreadnought with 5-state AI (intro/idle/rage/laser_charge/laser_fire)
- **Parallax starfield** — 3-layer scrolling background
- **Power-up system** — weapon upgrades (red orbs) + shield restores (green orbs)
- **Web Audio synthesizer** — all sounds generated procedurally, no audio files needed
- **Boss trigger at 2,000 points** — siren warning → full boss engagement

## Project Structure

```
darius-star/
├── index.html          # Main game (single-file HTML5 canvas)
├── assets/
│   ├── sprites/        # Sliced sprite PNGs (to be generated)
│   └── audio/          # Audio assets (currently Web Audio synthesis)
├── docs/               # Design docs, integration pack, architecture notes
└── README.md
```

## Development Pipeline

See [Linear project](https://linear.app/growthwebdev/project/darius-star-cyber-coelacanth-1539682890b7) for task tracking.

1. **Baseline** — Working game with canvas-drawn graphics ✅
2. **Asset Generation** — Google Flow Beta / Leonardo.ai sprite generation
3. **Asset Processing** — Pillow-based sprite sheet slicing → `/assets/sprites/`
    - **Sprite Manifest Tooling** — Run `python3 generate_sprites_manifest.py` to scan `/assets/sprites/` and build the dynamic asset manifest `assets/sprites.json`.
    - **Validation & Sanity Checks** — Checks for power-of-two image dimensions (GPU-optimized) and reports missing or invalid assets in `validation.errors`.
    - **Mock Testing** — Run `python3 generate_mock_sprites.py` to create a suite of simulated 16-bit retro sprites for pipeline validation.
4. **Dynamic Integration** — Replace canvas shapes with real sprite assets
5. **Performance** — Offscreen canvas pre-rendering, lazy-loading
6. **Deployment** — Cloudflare Pages (free global CDN)

## Credits

Game concept and initial build via Gemini Spark. Integration pack: [Google Drive](https://docs.google.com/document/d/147oKeowgx0nj4qhONSmM5E8wBxlst9wbAL8-0u-b4hI/edit)
