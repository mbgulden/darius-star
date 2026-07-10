# Credits & Ending Cinematic Design — Darius Star: Cyber Coelacanth

This document outlines the content, script, and technical implementation specifications for the ending cinematic and scrolling credits sequence of **Darius Star: Cyber Coelacanth**.

---

## Act IV Epilogue: Ending Cinematic Script

**Trigger:** Defeat of the Cyber Coelacanth Dreadnought (HP <= 0 in Level 3 Coelacanth Lair).  
**Atmosphere:** Calm after the storm, dramatic transition from biomechanical deep-sea horror to vast cosmic hope.  

### Cutscene Timeline (20 Seconds)

| Timestamp | Visual Action | Text Subtitle / Dialogue Overlay | Audio Cue |
|---|---|---|---|
| **0.0s - 3.0s** | Boss ship enters a massive chain-reaction explosion. Blue-white thermal plasma leaks from the core. | `CYBER COELACANTH MELTDOWN INITIALIZED...` | Relentless explosions, low rumble frequency. |
| **3.0s - 8.0s** | Screen shakes violently, culminating in a bright flash. Wreckage drifts into the abyssal quiet. | `SECTOR 3 DEEP LAIR CLEARED. ESCAPING DREADNOUGHT LAIR...` | Ominous blast fades into silence. |
| **8.0s - 18.0s** | Fade in neon sunrise over mechanical oceans. Hero ship flies across the canvas towards the horizon. | `The Cyber Coelacanth is defeated... but the galaxy still needs you.` | *Triumphant Chiptune Fanfare* transitions into credits ambient theme. |
| **18.0s - 20.0s** | Hero ship shrinks into the distance. Sunrise grows. Fade to black. | `TO BE CONTINUED...` | Serene synth pads. |

---

## Scrolling Credits Registry

### 1. Game Studio Card
* **Studio Name:** What An Adventure Games
* **Asset:** [studio_logo.png](file:///home/ubuntu/work/darius-star/assets/sprites/studio_logo.png) (16-bit retro cyberpunk neon sign)
* **Animation:** Slow zoom/glow pulse.

### 2. Core Creative Credits
* **Game Design & Narrative Architecture:** Michael Gulden
* **AI Agent Engineering:** Fred (Implementation) & AGY (Content & Narrative)
* **2D Pixel Art & Parallax Strips:** Imagen 3 (via Vertex AI Model Garden)
* **Cinematic Video Prototyping:** Veo 3.1 (via Vertex AI Model Garden)
* **Soundtrack & Music Composition:** Lyria 2/3 (procedural melodies)
* **Sound Effects (SFX):** jsfxr & Web Audio API (procedural synthesis)

### 3. Special Thanks
* **Vertex AI Model Garden Team**
* **Google DeepMind Advanced Agentic Coding Team**
* **GrowthWebDev Quality Assurance Testers**
* **The Retro Arcade Shmup Community**

### 4. Game Engine & Tools
* **Antigravity CLI Agent Platform**
* **HTML5 Canvas & Web Audio API**
* **Pillow Image Slicer & FFmpeg**

### 5. Final Card
* **Text:** `THANK YOU FOR PLAYING`
* **Coda:** `THE END`

---

## Technical Integration Details

1. **State Machine Expansion:**
   * Declared `SCREENS.CINEMATIC` and `SCREENS.CREDITS` in `SCREENS` state registry inside [index.html](file:///home/ubuntu/work/darius-star/index.html).
   * Implemented transition hooks inside `transitionToScreen` to reset timers, play specialized audio loops, and load assets.
2. **Procedural Chiptune Audio Player:**
   * Configured `playCreditsMusicStep` playing a calm, major-key synth arpeggio using `sine` and `triangle` oscillators.
   * Synthesized `victory_fanfare` using a square-wave step array (C-E-G-C-G-C-E) with exponential gain decay.
3. **Parallax Background:**
   * Credits screen scrolls text over a semi-transparent dark overlay (`rgba(5, 5, 12, 0.65)`) sitting on top of the moving title parallax screen, ensuring readability while preserving ambient style.
