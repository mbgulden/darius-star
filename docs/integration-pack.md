# Darius Star: AI Asset & Antigravity TUI Integration Pack

**Source:** Gemini Spark — generated for Michael Gulden, June 8, 2026
**Google Drive:** [Open Doc](https://docs.google.com/document/d/147oKeowgx0nj4qhONSmM5E8wBxlst9wbAL8-0u-b4hI/edit)

---

## 1. AI App Recommendation for 2D Retro Game Assets

To achieve the specific 16-bit aesthetic required for a retro-cyberpunk experience:

- **Google Flow Beta (Premier Choice):** Powered by Gemini Omni and Imagen 3. Excels at maintaining stylistic coherence across complex prompt sequences. Subject/Scene/Style matching interface ensures unified visual language.
- **Leonardo.ai:** Industry alternative for isolated 2D sprites with clean edges, ideal for individual enemy units and character designs.

---

## 2. Complete Game Asset Prompt Pack

Use these curated prompts within Google Flow Beta or Gemini:

| Asset Category | Detailed Prompt Content |
|---|---|
| **Player Ship** | Retro-cyberpunk fighter jet, 2D side-view sprite, 16-bit pixel art style, sleek aerodynamic frame with neon blue and purple glow accents, visible exhaust ports, high contrast. |
| **Enemy Fleet** | Set of cybernetic aquatic biome ships, including robotic fish with metallic scales, mechanical jellyfish with glowing fiber-optic tentacles, and electric eels with translucent circuitry. |
| **Colossal Boss** | 'Cyber Coelacanth' dreadnought ship, massive armored prehistoric fish silhouette, biomechanical plating, glowing red optic sensors, side-view boss sprite, intricate engine details. |
| **Sprites & Effects** | 2D retro VFX sheet, plasma laser beams, pulsating thruster flames, translucent blue energy shields, circular shockwave explosions, pixel-perfect bloom. |
| **Parallax Levels** | Layered backgrounds: Deep-space nebula with neon gas clouds and distant stars; sprawling cyberpunk biomechanical city with towering silhouettes and flickering lights. |
| **Title & Credits** | 16-bit arcade title card, 'Darius Star: Cyber Coelacanth' in stylized glowing futuristic font, dark space background, vibrant color palette, retro-gaming aesthetic. |

---

## 3. Antigravity TUI/CLI Integration & Optimization

### Asset Processing & Slicing

Instruct Antigravity agent:
> "Using the local Python library **Pillow**, write and execute a script to programmatically slice generated sprite sheets into individual 64x64 pixel frames. Ensure the script handles alpha transparency and saves the output to the `/assets/sprites/` directory."

### Dynamic HTML5 Integration

Instruct Antigravity agent:
> "Update `darius_twin.html` to dynamically inject the newly sliced assets. Write a JavaScript utility that reads the asset manifest and populates the internal sprite object array, ensuring all paths are mapped correctly to the current directory structure."

### Performance Optimization Prompts

- **Loop Refactoring:** "Refactor the `darius_twin.html` rendering loop to utilize `requestAnimationFrame`. Eliminate all `setInterval` calls to ensure synchronicity with the display refresh rate."
- **Pre-rendering:** "Implement offscreen canvas pre-rendering for the 'Cyber Coelacanth' boss and complex fleet sprites. Render these to a hidden buffer once during load to reduce per-frame draw calls."
- **Lazy-loading:** "Optimize initial load times by implementing lazy-loading for the parallax background layers and the Colossal Boss assets, triggering the download only when the player nears the relevant stage trigger."

### Automation & Resource Linting

> "Generate a `tasks.json` configuration to automate development workflows. Include a 'lint' command to check for missing asset references in `darius_twin.html` and a 'build' command to verify that all image dimensions conform to the required power-of-two constraints for GPU optimization."

---

## Current State (June 8, 2026)

- **Repo:** github.com/mbgulden/darius-star
- **Game file:** index.html — fully playable HTML5 canvas game
- **Graphics:** All canvas-drawn (procedural shapes). No sprite assets yet.
- **Audio:** Web Audio API synthesis — no audio files needed
- **Architecture:** Single-file HTML. No build step, no dependencies.
- **Game features:** 5 weapon levels, 4 enemy types, boss battle with 5-state AI, 3-layer parallax starfield, power-up system
- **Next phase:** Asset generation via Google Flow Beta → sprite slicing → integration → deployment
