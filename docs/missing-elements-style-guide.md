# Missing Visual & Audio Elements — Cohesive Style Guide
## Darius Star: Cyber Coelacanth

> **Status:** Research Deliverable (Read-Only)  
> **Date:** 2026-06-09  
> **Scope:** 10-biome style guide for all missing environmental VFX, parallax backgrounds, ambient audio, SFX, and polish elements  
> **Constraint:** No code changes. Output is design specification only.

---

## 1. Global Style Parameters

All missing elements must conform to the established Darius Star aesthetic:

### Visual Baseline
- **Rendering style:** 16-bit pixel art, retro arcade shmup (Darius/Gradius/R-Type era)
- **Cyberpunk biomechanical aesthetic** with neon color palette on dark backgrounds
- **Crisp pixel edges**, consistent lighting from top-left, no anti-aliasing
- **Canvas:** 1024×1024 for sprites, 800×450 for backgrounds, all transparent PNGs
- **Pixel density:** ~1px units, limited palette, dithering where needed

### Audio Baseline (Sega Genesis Sound Chip Palette)
- **Source:** "16-bit Sega Genesis style" / "retro arcade" anchor words on all prompts
- **Frequency profile:**
  - 80–250 Hz: Warm thud (explosions, impacts)
  - 250–800 Hz: Body of sound (lasers, engine hum)
  - 800–3 kHz: Presence (pew-pew, alerts, sirens)
  - 3–8 kHz: Brightness (power-ups, chimes, UI)
  - 8 kHz+: Air (ambient layers only)
- **Post-processing:** highpass 80Hz → peak limiter -3dB → normalize -16 LUFS → 5ms fade-out
- **Runtime mixing:** SFX 70%, Music 40%, Ambient 15%
- **Avoid:** sub-bass below 60Hz, long reverb tails, cinematic "braaam", realistic Foley

### Unified Color Palette
| Role | Hex | Usage |
|------|-----|-------|
| Cyan | `#00FFFF` | Player energy, plasma, shields |
| Purple | `#8B00FF` | Heavy energy, arcane blasts |
| Pink | `#FF0055` | Enemy energy, interceptors |
| Orange | `#FF5500` | Fire, missiles, shockwaves |
| Red | `#FF3333` | Enemy projectiles, boss rage |
| Green | `#33CC55` | Bioluminescent, coolant |
| White | `#FFFFFF` | Core flashes, supernova |
| Gold | `#FFD700` | Power-ups, critical accents |
| Deep Navy | `#0A1128` | Abyssal darkness |

---

## 2. Per-Biome Environmental Effects

Each biome requires ONE dominant environmental effect layer rendered as a foreground particle system on top of the parallax backgrounds. All effects use 16-bit pixel art particle sheets (16×16 to 32×32 per particle, 4–8 frame animated sprites) composited in real-time.

### Biome 1: Abyssal Trench — Bioluminescent Drift
- **Dominant palette:** Deep navy `#0A1128`, vent orange `#FF6600`, bioluminescent cyan `#00FFFF`
- **Effect type:** Floating bioluminescent particle field + hydrothermal vent smoke plumes
- **Particle behavior:**
  - **Bioluminescent motes:** 30–50 particles on screen at once, sine-wave vertical drift (amplitude 40px, period 3s), slow upward float at 15–25 px/s, opacity pulses between 40%–90% at 2 Hz, cyan `#00FFFF` with soft 8px glow halo
  - **Vent smoke:** 3–5 rising columns from bottom-of-screen vent positions, orange-to-gray gradient `#FF6600` → `#333333`, expands and fades over 4s lifespan, spawn rate 1 particle/200ms per vent
- **Ambient audio mood:** "Abyssal Descent" — sub-bass drones (40–80Hz), hydrophone crackle, distant whale-song pads. **STATUS: EXISTS (biome 1 of 4)**
- **Unique polish element:** **Pressure-crack vignette** — subtle darkening at screen edges (top and bottom, 15% opacity) that intensifies when the player is in the lower third of the screen, simulating depth pressure. Screen edges develop faint cyan bioluminescent hairline cracks at <25% player HP.

---

### Biome 2: Coral Graveyard — Rust Storm
- **Dominant palette:** Rust orange `#CC5500`, dead coral pink `#FF4488`, murk green `#1A3A2A`
- **Effect type:** Drifting rust particle clouds + flickering broken neon signage reflections
- **Particle behavior:**
  - **Rust particles:** 20–40 particles, Brownian-motion drift (random walk, max displacement 60px/s), opacity 30%–70%, rust orange `#CC5500`, 6–8 frame tumbling animation for angular flake shapes
  - **Neon flicker glow:** 4–6 fixed positions on the near parallax layer, pink `#FF4488` soft radial glow (radius 40–80px), flickers with random on/off pattern (50ms–500ms gaps), occasional full-brightness surge lasting 200ms
- **Ambient audio mood:** "Coral Collapse" — industrial percussion (metallic clangs), detuned synth arpeggios, distant structural groans. **STATUS: EXISTS (biome 2 of 4)**
- **Unique polish element:** **Dead reef parallax ghosting** — semi-transparent (20% opacity) echo copies of destroyed coral structures briefly persist for 2s after the near-layer scrolls past them, creating a spectral "memory trace" effect unique to the graveyard.

---

### Biome 3: Coelacanth's Lair — Tesla Arcs
- **Dominant palette:** Blood red `#CC0000`, machine gray `#555555`, energy cyan `#00CCFF`
- **Effect type:** Arcing electricity between Tesla coils + dripping coolant streams
- **Particle behavior:**
  - **Tesla arcs:** 3–5 arcs active simultaneously, jagged lightning-bolt path (4–8 vertices) between fixed coil positions, cyan `#00CCFF` core with white `#FFFFFF` hot center, 4-frame flicker animation at 12 fps, random arc path regeneration every 300–600ms
  - **Coolant drips:** 8–12 droplets falling from ceiling structures, green `#33CC55` tint, teardrop shape 8×12px, fall speed 80–120 px/s, splash into 3–4 micro-droplets on hitting bottom screen edge
- **Ambient audio mood:** "Dreadnought Rising" → "Coelacanth's Fury" (phase shift at boss encounter). Deep mechanical heartbeat (50 BPM), industrial piston rhythm, distant metal stress groans. **STATUS: EXISTS (biome 3 of 4)**
- **Unique polish element:** **Core pulse sync** — the background's pulsating red energy cores emit a screen-wide subtle red flash (5% opacity, 100ms) synchronized to the biome's heartbeat BPM. Flash rate accelerates from 50 BPM (idle) to 120 BPM during boss rage phase.

---

### Biome 4: Nebula Drift — Plasma Currents
- **Dominant palette:** Nebula cyan `#00BFFF`, plasma magenta `#FF00FF`, void black `#050510`
- **Effect type:** Flowing plasma streamers + electrical storm cell flashes
- **Particle behavior:**
  - **Plasma streamers:** 4–6 horizontal ribbons of translucent gas, cyan-to-magenta gradient, sine-wave undulation (amplitude 30–60px, period 2–4s, phase-offset per streamer), opacity 15%–35%, scroll speed 40–60 px/s right-to-left
  - **Storm cell flashes:** Random lightning bolts illuminating nebula clouds, full-screen white flash (8% opacity, 80ms), 2–3 per 10-second interval, accompanied by distant thunder rumble
- **Ambient audio mood:** "Nebula Drift" — ethereal pads with slow filter sweeps, ion crackle percussion, theremin-like lead melody. **STATUS: EXISTS (biome 4 of 4)**
- **Unique polish element:** **Gravity lensing** — background star field warps subtly (2–4px displacement in a radial pattern) near plasma-dense regions, creating an Einstein-ring distortion effect unique to the cosmic expanse biomes.

---

### Biome 5: Ice Ring — Diamond Dust
- **Dominant palette:** Ice blue `#88CCFF`, crystal white `#EEEEFF`, deep freeze `#002244`
- **Effect type:** Suspended ice crystal field + prismatic light refraction beams
- **Particle behavior:**
  - **Ice crystals:** 40–60 particles, hexagonal sprite shapes (12×12px), slow drift (10–20 px/s leftward), gentle rotation (0.5–2 rad/s), white `#EEEEFF` core with ice-blue `#88CCFF` edge highlight, 6-frame sparkle animation cycling at random intervals
  - **Prismatic beams:** 2–4 angled light rays (30–60° from horizontal) emanating from large background ice formations, cyan-to-white gradient, opacity 8%–15%, beams shift angle ±5° slowly (period 8s), creating subtle caustic light-play
- **Ambient audio mood:** "Ice Ring" — glass harmonica tones, crystalline delay effects, sub-zero wind ambience, sparse bell hits. **STATUS: MISSING (biome 5 of 10)**
  - **Lyria prompt:** "16-bit Sega Genesis style, retro arcade, instrumental. Ethereal glockenspiel arpeggios, sub-zero wind atmosphere, cold digital pads, 115 BPM cinematic orchestral drums, sparse bell hits with crystalline reverb. Short and impactful, no vocals."
- **Unique polish element:** **Frost creep** — when player HP drops below 25%, ice crystals begin forming on the screen edges (white frost branching pattern, 5-second gradual encroachment from corners), partially obscuring peripheral vision. Clears instantly on HP restore. No gameplay impact — pure atmospheric tension.

---

### Biome 6: Fire Nebula — Ember Storm
- **Dominant palette:** Lava orange `#FF4400`, ember yellow `#FFAA00`, ash gray `#443333`
- **Effect type:** Rising ember columns + heat-distortion shimmer + ash cloud banks
- **Particle behavior:**
  - **Embers:** 50–80 particles, upward spiral trajectories (corkscrew with 15–25px radius, 60–100 px/s rise), orange-to-yellow gradient `#FF4400` → `#FFAA00`, 4-frame glow-pulse animation, lifespan 3–5s, spawn from bottom-screen lava sources
  - **Ash clouds:** 2–3 large (100–200px wide) semi-transparent smoke banks, ash gray `#443333`, opacity 15%–30%, slow horizontal drift at 25 px/s, soft-edged with dithering fade at boundaries
  - **Heat shimmer:** Full-screen post-effect (if feasible) or 4–6 localized distortion zones above lava flows, horizontal pixel displacement ±2px at 4 Hz
- **Ambient audio mood:** "Fire Nebula" — distorted bass growl, tribal percussion (taiko), heat-haze synth washes, rising tension builds. **STATUS: MISSING (biome 6 of 10)**
  - **Lyria prompt:** "16-bit Sega Genesis style, retro arcade, instrumental. Heavy tribal taiko drums, distorted low-end synth growls, 125 BPM aggressive industrial metal rhythm, rising choir chants, heat-haze soundscapes. Short and impactful, no vocals."
- **Unique polish element:** **Shield melt glow** — when player shields take damage in this biome, the shield impact point glows orange-hot for 1.5s (matching the fire palette), leaving a brief molten afterimage trail behind the ship. Cosmetic only, reinforces biome identity.

---

### Biome 7: Storm Belt — Lightning Cage
- **Dominant palette:** Lightning white `#FFFFFF`, static blue `#4466FF`, storm gray `#333344`
- **Effect type:** Horizontal lightning strikes + electromagnetic interference static bands + driving rain
- **Particle behavior:**
  - **Lightning strikes:** 3–6 bolts per 10s, horizontal orientation predominantly, 6–10 frame flash animation at 20 fps, white `#FFFFFF` core with blue `#4466FF` halo, screen flash (12% opacity white, 60ms) on each strike
  - **Static bands:** 3–5 horizontal scanlines of EM interference scrolling vertically, blue `#4466FF` and white noise dither pattern, 4px tall bands, scroll at 30–50 px/s, opacity 10%–20%
  - **Rain:** 60–100 fast-falling droplet particles (3×8px vertical streaks), pale blue-white, fall speed 200–300 px/s, slight leftward wind drift (+15 px/s horizontal)
- **Ambient audio mood:** "Storm Belt" — white noise gusts, thunder percussive hits, distorted radio signals, glitchy breakbeats. **STATUS: MISSING (biome 7 of 10)**
  - **Lyria prompt:** "16-bit Sega Genesis style, retro arcade, instrumental. Distorted glitchy breakbeats, white-noise wind gusts, thunderous synth hits, 135 BPM chaotic electro-industrial rhythm, transitioning to desperate melodic string theme. Short and impactful, no vocals."
- **Unique polish element:** **HUD glitch** — at random intervals (every 15–30s), the HUD elements (score, health bar, combo counter) briefly glitch — horizontal displacement ±4px for 150ms, with a static-noise overlay on UI layer. During the biome boss fight, glitch frequency increases. Pure visual flavor; gameplay data remains accurate underneath.

---

### Biome 8: Derelict Fleet — Drifting Debris
- **Dominant palette:** Hull gray `#555566`, emergency red `#FF2222`, rust brown `#886644`
- **Effect type:** Tumbling wreckage fragments + flickering emergency beacon lights + coolant gas leaks
- **Particle behavior:**
  - **Debris fragments:** 15–25 metal shards (angular shapes, 16–32px), slow rotation (0.3–1.5 rad/s), linear drift at 20–40 px/s in random directions, hull gray `#555566` with rust brown `#886644` edge accents, 4-frame tumble animation
  - **Beacon flashes:** 5–8 fixed positions on derelict hulls, red `#FF2222` pulse (40px radius glow, 300ms on / 700ms off cycle, staggered per beacon), occasional rapid-flash SOS pattern (3 short, 3 long, 3 short)
  - **Coolant gas:** 2–4 slow-leaking gas plumes from hull breaches, green-tinted `#33FF33` (reactor coolant), expands from 10px to 60px radius over 3s, opacity 8%–20%, soft dither edge
- **Ambient audio mood:** "Derelict Fleet" — distant distress beacons (Morse code pings), metallic groans, ghostly ship-horn drones, industrial reverb. **STATUS: MISSING (biome 8 of 10)**
  - **Lyria prompt:** "16-bit Sega Genesis style, retro arcade, instrumental. Slow heavy military march snare, ominous brass horns, 100 BPM orchestral industrial metal, alarm pings, metallic groans, ghostly ship-horn drones. Short and impactful, no vocals."
- **Unique polish element:** **Proximity alert flicker** — when enemies are within 150px of the player, the nearest derelict hull's emergency lights on the background layer intensify (red glow doubles in radius and brightness). Creates environmental threat awareness without UI clutter.

---

### Biome 9: Xenomorph Hive — Organic Seepage
- **Dominant palette:** Flesh pink `#CC6677`, acid green `#33FF33`, organic purple `#6633AA`
- **Effect type:** Dripping acidic ooze + pulsating organic vein networks + spore clouds
- **Particle behavior:**
  - **Acid drips:** 15–25 droplets from ceiling organic structures, acid green `#33FF33`, elongated teardrop (6×14px), fall speed 60–90 px/s, on impact with bottom screen edge: 3-frame splash with 4–6 micro-droplets, leaves brief green scorch mark (fades over 2s)
  - **Vein pulse:** 8–12 organic tendril paths across the near background layer, purple `#6633AA` to pink `#CC6677` gradient pulse, throbs at 72 BPM (matching heartbeat sub-bass), opacity varies 20%–50% in sync with pulse
  - **Spore clouds:** 2–3 clusters of 20–30 micro-spores (4×4px dots), pink-tinted, slow Brownian drift, expand from cluster radius 0 to 80px over 5s, then dissipate
- **Ambient audio mood:** "Xenomorph Hive" — organic squelch percussive sounds, chittering insectoid rhythms, deep throat-sung drones, heartbeat sub-bass. **STATUS: MISSING (biome 9 of 10)**
  - **Lyria prompt:** "16-bit Sega Genesis style, retro arcade, instrumental. Organic squelch loops, 120 BPM heavy industrial techno, tribal woodblock percussion, insectoid chittering SFX, heartbeat sub-bass, screeching synth leads. Short and impactful, no vocals."
- **Unique polish element:** **Egg sac gestation glow** — scattered egg-cluster structures on the background layer pulse with internal green `#33FF33` glow that intensifies over 8s cycles. On the "hatch" beat, a burst of 8–12 spore particles erupts from the sac (cosmetic only — actual enemy spawns are handled by Hive Node logic, but the visual sync makes the hive feel alive).

---

### Biome 10: Core Rift — Reality Tears
- **Dominant palette:** Void black `#000000`, rift white `#FFFFFF`, reality-bleed magenta `#FF0088`, code green `#00FF41`
- **Effect type:** Dimensional rifts with raw code-stream emissions + gravitational lensing distortion + temporal echo fragments
- **Particle behavior:**
  - **Code streams:** 8–15 vertical cascades of green `#00FF41` matrix-style characters (random hexadecimal glyphs, 6×10px each, 4-frame cycling), fall speed 80–150 px/s, opacity 20%–50%, spawn from horizontal rift tears in the midground
  - **Rift tears:** 3–5 jagged dimensional cracks (animated 8-frame crack-formation sequence), magenta `#FF0088` edge glow, interior shows inverted-color snapshot of a previous biome (cycles through biomes 1–9), pulse-expand-contract at 0.5 Hz
  - **Echo fragments:** Ghostly afterimage shards (16×16px) of player/enemy positions from 2–3 seconds ago, 15% opacity, white `#FFFFFF` outline, persist for 1.5s before dissolving
- **Ambient audio mood:** "Core Rift" — granular synthesis disintegration, reversed audio fragments from all previous biome tracks, Shepard-tone rising tension, heartbeat that gradually desyncs. **STATUS: MISSING (biome 10 of 10)**
  - **Lyria prompt:** "16-bit Sega Genesis style, retro arcade, instrumental. Granular synthesis drones, reversed melodic fragments from all previous biome tracks, Shepard-tone riser, 140 BPM glitchcore breakbeat, detuned piano chords, climaxing in a heartbeat that fades into static. Short and impactful, no vocals."
- **Unique polish element:** **UI corruption effect** — during The Architect boss fight, UI elements randomly glitch: score numbers briefly display hexadecimal instead of decimal, health bar segments shift color to magenta, combo counter displays negative numbers for 300ms before snapping back. All corruption is cosmetic — underlying data is unaffected. Intensifies with each boss phase transition.

---

## 3. Missing Parallax Background Layers (Biomes 5–10)

Biomes 1–4 have documented parallax backgrounds. Biomes 5–10 require three-layer scrolling backgrounds at 800×450 resolution, horizontally tileable.

### Layer Architecture (All Biomes)
| Layer | Parallax Speed | Opacity | Content |
|-------|---------------|---------|---------|
| **Far** | 10% of camera speed | 100% | Distant celestial/abyssal features, stars, nebula |
| **Mid** | 30% of camera speed | 100% | Major structural elements (formations, hulls, terrain) |
| **Near** | 60% of camera speed | 85–100% | Foreground debris, particles, atmospheric elements |

### Biome 5: Ice Ring Backgrounds
| Sub-Levels | Far Layer | Mid Layer | Near Layer |
|------------|-----------|-----------|------------|
| 5-1, 5-2 (Crystal Fields) | Distant cold blue star, sparse starfield | Massive ice crystal formations, prismatic light refraction | Floating crystal shards, gentle ice dust |
| 5-3, 5-4 (Asteroid Belt) | Dark space with faint nebula | Tumbling asteroid field, cratered rock surfaces | Small rock fragments, ice-coated debris |
| 5-5, 5-6 (Deep Freeze) | Near-black void, single distant star | Frozen derelict ships embedded in ice, absolute stillness | Snow-drift particles, hoarfrost on foreground |
| 5-7, 5-8 (Black Ice) | Faint magenta corruption glow on horizon | Ice formations veined with dark energy cracks `#000000`/`#00FFFF` | Corrupted ice shards with dark aura |
| 5-9, 5-10 (The Fracture) | Planetoid splitting with bright core glow | Massive ice shelf breaking apart, white-hot fracture lines | Chunks of planetoid crust, white `#FFFFFF` impact flashes |

**Asset count:** 5 background sheets (one per sub-level pair)  
**Veo/Imagen prompt prefix:** "16-bit pixel art, retro arcade shmup style, cyberpunk biomechanical aesthetic, neon color palette. Frozen asteroid ring in deep space, ice blue (#88CCFF) crystal formations, distant cold star, tumbling ice shards, parallax scrolling background layers, 800x450, no transparency needed."

### Biome 6: Fire Nebula Backgrounds
| Sub-Levels | Far Layer | Mid Layer | Near Layer |
|------------|-----------|-----------|------------|
| 6-1, 6-2 (Ember Fields) | Orange-red nebula glow `#FF4400` | Cooling lava planetoids with dark crust | Smoke wisps, scattered ember particles |
| 6-3, 6-4 (Magma Rivers) | Bright orange horizon, volcanic silhouette | Flowing lava rivers between rock platforms | Heat shimmer, floating cinder sparks |
| 6-5, 6-6 (Eruption Zone) | Red sky with ash cloud ceiling | Active volcanic cones with eruption plumes | Ash particles, falling pyroclastic debris |
| 6-7, 6-8 (Hellfire Sector) | Blue-white flame horizon `#4488FF` | Brimstone formations, blue-hot flame jets | Black sulfur particles, white-hot embers |
| 6-9, 6-10 (The Crucible) | White-gold core glow `#FFDD44` | Planet core interior, liquid fire walls | Molten metal droplets, intense heat shimmer |

**Asset count:** 5 background sheets  
**Veo/Imagen prompt prefix:** "16-bit pixel art, retro arcade shmup style, cyberpunk biomechanical aesthetic, neon color palette. Volcanic planetoid sector, lava orange (#FF4400) magma rivers, ash clouds, volcanic silhouettes, ember particles, parallax scrolling background layers, 800x450, no transparency needed."

### Biome 7: Storm Belt Backgrounds
| Sub-Levels | Far Layer | Mid Layer | Near Layer |
|------------|-----------|-----------|------------|
| 7-1, 7-2 (Static Field) | Pale yellow-gray sky `#CCCC99` | Ionized particle clouds, faint static bands | Small static sparks, drifting ionization wisps |
| 7-3, 7-4 (Lightning Alley) | Black cloud banks `#222233` | Massive thunderheads with internal lightning | Rain streaks, horizontal lightning bolt flashes |
| 7-5, 7-6 (EMP Zone) | Green-tinted static sky `#335533` | Disabled tech wreckage, power-surge arcs | Floating dead drones, crackling green sparks |
| 7-7, 7-8 (Ion Storm) | Sickly yellow-green sky `#666622` | Corrosive cloud formations, acid rain curtains | Acid droplet streaks, corroded metal flakes |
| 7-9, 7-10 (The Maelstrom) | Black-violet vortex `#110022` | Spiral hurricane wall, eye-of-storm center | High-velocity debris, violet `#8800FF` lightning cage |

**Asset count:** 5 background sheets  
**Veo/Imagen prompt prefix:** "16-bit pixel art, retro arcade shmup style, cyberpunk biomechanical aesthetic, neon color palette. Perpetual electromagnetic storm zone, lightning white (#FFFFFF) bolts, dark storm clouds, static interference bands, parallax scrolling background layers, 800x450, no transparency needed."

### Biome 8: Derelict Fleet Backgrounds
| Sub-Levels | Far Layer | Mid Layer | Near Layer |
|------------|-----------|-----------|------------|
| 8-1, 8-2 (Outer Debris) | Starfield with distant explosion echoes | Scattered hull fragments, torn solar panels | Small metal scrap, drifting bolt particles |
| 8-3, 8-4 (Warship Row) | Dark space, distant fleet silhouette | Intact battleship hulls with rust `#886644`, gun turrets | Floating escape pods, severed cables |
| 8-5, 8-6 (Reactor Sector) | Green-glowing nebula `#33FF33` | Leaking reactor cores on derelict ships, coolant clouds | Radiation-warning klaxon lights, green gas wisps |
| 8-7, 8-8 (Haunted Decks) | Near-total darkness with sporadic stars | Flickering emergency lights on hulls, ghost-signal glows | Shadowy silhouette debris, brief red beacon flashes |
| 8-9, 8-10 (The Flagship) | Starfield with central massive silhouette | The command ship *Event Horizon*, chrome hull `#888899`, red alert strips | Active turret emplacements, missile bay doors, engine glow |

**Asset count:** 5 background sheets  
**Veo/Imagen prompt prefix:** "16-bit pixel art, retro arcade shmup style, cyberpunk biomechanical aesthetic, neon color palette. Derelict warship graveyard in space, hull gray (#555566) battleships, emergency red (#FF2222) beacon lights, floating debris, rust brown (#886644) hull damage, parallax scrolling background layers, 800x450, no transparency needed."

### Biome 9: Xenomorph Hive Backgrounds
| Sub-Levels | Far Layer | Mid Layer | Near Layer |
|------------|-----------|-----------|------------|
| 9-1, 9-2 (Outer Membrane) | Pale pink-amber glow `#CC9977` | Translucent organic walls with vein networks | Amniotic fluid droplets, floating membrane fragments |
| 9-3, 9-4 (Nursery Chambers) | Warm organic tones, pulsing sacs | Egg clusters with gestation glow `#33FF33` | Larval creature silhouettes, nutrient fluid streams |
| 9-5, 9-6 (Feeding Grounds) | Dark red background `#440011` | Devoured ship hulls encased in flesh | Acid pools (green `#33FF33`), dripping digestive fluids |
| 9-7, 9-8 (Immune Response) | Aggressive red-white glow `#FF4444` | Pulsating wall tissue, antibody constructs | White blood-cell-like orbs, attacking tendrils |
| 9-9, 9-10 (Queen's Chamber) | Deep purple `#220044` with golden light | Massive organic throne structure, egg sac | Royal jelly drips, crown-like bone spires |

**Asset count:** 5 background sheets  
**Veo/Imagen prompt prefix:** "16-bit pixel art, retro arcade shmup style, cyberpunk biomechanical aesthetic, neon color palette. Organic alien hive interior, flesh pink (#CC6677) tissue walls, acid green (#33FF33) egg sacs, organic purple (#6633AA) vein networks, pulsating biomechanical horror, parallax scrolling background layers, 800x450, no transparency needed."

### Biome 10: Core Rift Backgrounds
| Sub-Levels | Far Layer | Mid Layer | Near Layer |
|------------|-----------|-----------|------------|
| 10-1, 10-2 (Event Horizon) | Warped starfield with gravitational lensing rings `#FFFFFF` | Black hole accretion disk, bent light rays | Distorted reflection shards of previous biomes |
| 10-3, 10-4 (Fractured Space) | Void black `#000000` | Escher-like impossible geometry, floating platforms at wrong angles | Shattered mirror fragments reflecting code `#00FF41` |
| 10-5, 10-6 (Time Dilation) | Sepia-toned `#886644` frozen starfield | Replaying echo-images of biome 1–9 scenes (ghostly, 20% opacity) | Slow-motion particle trails, clock-hand shadows |
| 10-7, 10-8 (Anti-Reality) | White void `#FFFFFF` | Negative-color geometric forms, inverted physics structures | Black particle "holes" in white space, color-inverted debris |
| 10-9, 10-10 (Singularity) | Pure white expanding to event horizon ring | Converging reality streams, all biome palettes bleeding together | Code green `#00FF41` data-streams, white-hot `#FFFFFF` core pulse |

**Asset count:** 5 background sheets  
**Veo/Imagen prompt prefix:** "16-bit pixel art, retro arcade shmup style, cyberpunk biomechanical aesthetic, neon color palette. Reality-bending black hole event horizon, void black (#000000) space, reality-bleed magenta (#FF0088) dimensional cracks, code green (#00FF41) data streams, impossible geometry, parallax scrolling background layers, 800x450, no transparency needed."

### Background Asset Summary
| Biome | Missing Sub-Level Backgrounds | Total Sheets Needed |
|-------|-------------------------------|---------------------|
| 5: Ice Ring | 5 (one per sub-level pair) | 5 |
| 6: Fire Nebula | 5 | 5 |
| 7: Storm Belt | 5 | 5 |
| 8: Derelict Fleet | 5 | 5 |
| 9: Xenomorph Hive | 5 | 5 |
| 10: Core Rift | 5 | 5 |
| **TOTAL** | | **30 background sheets** |

*Note: Biomes 1–4 have 5 variation backgrounds each per sub-level-variations.md (20 sheets total). Some may already exist as sprites. Verify against sprites.json before duplicating generation.*

---

## 4. Missing Ambient Audio Tracks (Biomes 5–10)

Currently, biomes 1–4 have ambient music tracks. Biomes 5–10 require 6 ambient tracks generated via Lyria 2 following the SFX cohesion strategy.

| Biome | Track Name | Tempo | Key Characteristics | Reference Mood |
|-------|-----------|-------|---------------------|----------------|
| 5 | "Ice Ring" | 115 BPM | Glass harmonica, crystalline delays, sub-zero wind, bells | Cold beauty, isolation, frozen stillness |
| 6 | "Fire Nebula" | 125 BPM | Taiko drums, distorted bass growls, heat-haze pads, choir | Aggressive heat, pressure, volcanic fury |
| 7 | "Storm Belt" | 135 BPM | Glitchy breakbeats, white noise gusts, thunder hits, strings | Chaos, electromagnetic violence, desperation |
| 8 | "Derelict Fleet" | 100 BPM | Military snare march, brass horns, alarm pings, metallic drones | Somber militarism, abandonment, ghostly echoes |
| 9 | "Xenomorph Hive" | 120 BPM | Organic squelch, insectoid chitter, heartbeat bass, screech leads | Biological horror, pulsing life, alien consumption |
| 10 | "Core Rift" | 140 BPM | Granular disintegration, reversed fragments, Shepard tone, detuned piano | Reality collapse, cosmic dread, final transcendence |

### Lyria 2 Prompt Template (Apply to Each Track Above)
```
"16-bit Sega Genesis style, retro arcade, instrumental. [INSERT TRACK-SPECIFIC CHARACTERISTICS FROM TABLE].
Short and impactful, no vocals, transparent background. Crisp FM synthesis timbre, YM2612 sound chip character."
```

### Additional Music Needs
Beyond biome ambients, the following music tracks are also missing:

| Purpose | Count | Notes |
|---------|-------|-------|
| **Biome boss themes** | 10 tracks | One per biome boss fight (dynamic layering: idle → rage → death phases). Currently only the Cyber Coelacanth (biome 3) has boss music. |
| **Mid-boss themes** | 10 tracks | Shorter, loopable encounter music distinct from biome boss themes |
| **Menu/Title music** | 1 track | Heroic, atmospheric menu loop (GRO-919) |
| **Upgrade Station music** | 1 track | Calm, mechanical loop for between-level shop |
| **Game Over music** | 1 track | Somber fade-out, 8–12 seconds |
| **Victory fanfare** | 1 track | Triumphant 6-second sting for biome completion |
| **Credits music** | 1 track | Emotional, journey-recap theme (GRO-932) |

---

## 5. Missing Sound Effects (SFX)

### 5.1 Engine Hum Variants

Each biome's atmospheric density and environment should subtly alter the player ship's engine hum. All use the Sega Genesis palette (PSG noise + FM synthesis, no sub-bass below 80Hz).

| Biome | Engine Hum Variant | Sonic Character | Pitch Base |
|-------|-------------------|-----------------|------------|
| 1: Abyssal Trench | **Deep Pressure Hum** | Muffled low-mid drone, hydrostatic crackle overlay | 120 Hz (droning) |
| 2: Coral Graveyard | **Rust-Rattle Hum** | Metallic rattle mixed into standard hum, intermittent | 140 Hz |
| 3: Coelacanth Lair | **Industrial Thrum** | Heavier mechanical rhythm (piston-like), reverb-damped | 100 Hz |
| 4: Nebula Drift | **Ion Drift Hum** | Airy, phase-shifted, with subtle high-freq sparkle | 180 Hz |
| 5: Ice Ring | **Cryo Hum** | Clean, cold tone, crystalline harmonic overtones | 160 Hz |
| 6: Fire Nebula | **Thermal Strain Hum** | Distorted, crackling saturation, heat-waver pitch warble | 130 Hz |
| 7: Storm Belt | **Static Hum** | White noise component mixed in, intermittent dropout (EM interference) | 150 Hz |
| 8: Derelict Fleet | **Reactor Decay Hum** | Unstable, slightly detuned, irregular pulse (failing reactor) | 110 Hz |
| 9: Xenomorph Hive | **Organic Resonance Hum** | Wet, squelchy undertone, biological pulse rhythm | 90 Hz |
| 10: Core Rift | **Phase-Drift Hum** | Constantly pitch-shifting (±20 cents, 1 Hz), occasionally reverses | 140–200 Hz (sliding) |

**Lyria prompt template for engine hums:**
```
"16-bit Sega Genesis style, retro arcade, instrumental. Continuous spaceship engine idle loop, [INSERT SONIC CHARACTER], low-mid frequency drone, 2-second seamless loop, no melody, pure texture. Short and impactful, no vocals."
```

### 5.2 Biome-Specific Environmental SFX

One-shots and short loops triggered by environmental events, not by gameplay actions.

| Biome | SFX Name | Trigger | Duration | Character |
|-------|----------|---------|----------|-----------|
| 1 | `sfx_vent_eruption` | Hydrothermal vent burst (random, every 8–15s) | 1.5s | Deep underwater rumble + steam hiss |
| 1 | `sfx_biolum_pulse` | Bioluminescent particle cluster flash | 0.3s | Soft high-pitched sine chime |
| 2 | `sfx_coral_collapse` | Background coral structure crumbles (scripted, level transitions) | 2.0s | Metallic crunch + debris scatter |
| 2 | `sfx_neon_flicker` | Broken neon sign flickers | 0.2s | Electric buzz stutter (FM noise) |
| 3 | `sfx_tesla_arc` | Tesla coil discharge | 0.4s | Sharp electric crack + hum decay |
| 3 | `sfx_heartbeat` | Background core pulse | 0.5s loop | Deep muffled thud at biome BPM |
| 4 | `sfx_plasma_stream` | Plasma ribbon passes near camera | 1.0s | Rising ion sweep + soft crackle |
| 4 | `sfx_storm_flash` | Nebula lightning flash | 0.6s | Distant thunder rumble (low-pass filtered) |
| 5 | `sfx_ice_crack` | Ice formation shifts/settles | 0.8s | Sharp crystalline fracture + long-ringing decay |
| 5 | `sfx_prism_beam` | Prismatic light beam passes | 0.5s | Glass harmonica shimmer sweep |
| 6 | `sfx_lava_bubble` | Lava pool surface burst | 0.4s | Thick liquid pop + sizzle |
| 6 | `sfx_ember_swarm` | Large ember particle burst | 0.7s | Crackling fire swarm (PSG noise) |
| 7 | `sfx_thunder_crack` | Close lightning strike | 0.9s | Sharp crack + long bass rumble decay |
| 7 | `sfx_static_burst` | EM interference band passes | 0.3s | White noise burst + digital glitch stutter |
| 8 | `sfx_hull_groan` | Derelict ship hull stress | 1.5s | Deep metallic stress moan |
| 8 | `sfx_beacon_ping` | Distress beacon pulse | 0.2s | Sharp electronic ping (Morse-friendly) |
| 9 | `sfx_acid_drip` | Acid droplet impact | 0.3s | Wet sizzle + hiss |
| 9 | `sfx_vein_pulse` | Organic vein network throb | 0.5s loop | Wet, squelchy low-frequency pulse |
| 10 | `sfx_rift_tear` | Dimensional rift opens | 1.0s | Reversed glass-shatter + digital glitch |
| 10 | `sfx_code_stream` | Code cascade passes | 0.6s | Rapid data-burst chirps (FM synthesis stutter) |

**Total new environmental SFX:** 20 files  

### 5.3 Menu Transition Sounds

Currently, UI sounds are procedurally generated via Web Audio API. For a premium retro experience, dedicated WAV files are needed.

| SFX Name | Purpose | Duration | Character |
|----------|---------|----------|-----------|
| `sfx_ui_hover` | Button hover | 0.1s | Light high-pitched sine beep (C6, 80ms) |
| `sfx_ui_select` | Button confirm/select | 0.2s | Satisfying double chirp (C6→E6, 50ms each) |
| `sfx_ui_back` | Back/cancel | 0.15s | Descending two-note (E5→C5, 60ms each) |
| `sfx_upgrade_purchase` | Upgrade bought successfully | 0.5s | Ascending chime arpeggio (C5→E5→G5→C6, 100ms each) |
| `sfx_insufficient_scrap` | Not enough scrap for purchase | 0.3s | Dull buzzy thud (low square wave, 150Hz) |
| `sfx_menu_transition_in` | Menu screen slides in | 0.4s | Rising FM sweep + soft whoosh |
| `sfx_menu_transition_out` | Menu screen slides out | 0.3s | Descending FM sweep |
| `sfx_level_start` | Sub-level begins | 0.8s | Dramatic ascending sting (FM brass-like) |
| `sfx_biome_transition` | Biome change screen | 1.2s | Grand transition sweep + biome-unique identifier note |
| `sfx_pause_in` | Game paused | 0.2s | Time-stop "thwip" (descending sine blip) |
| `sfx_pause_out` | Game unpaused | 0.2s | Time-resume "thwip" (ascending sine blip) |

**Total menu/transition SFX:** 11 files  

**Lyria prompt template for all UI SFX:**
```
"16-bit Sega Genesis style, retro arcade, short and impactful. [INSERT SPECIFIC CHARACTER], crisp FM synthesis, Yamaha YM2612 chip character, [DURATION]. No reverb, transparent background."
```

### 5.4 SFX Asset Summary
| Category | Count | Status |
|----------|-------|--------|
| Engine hum variants | 10 | All missing |
| Environmental SFX (biome-specific) | 20 | All missing |
| Menu transition SFX | 11 | All missing (currently procedural) |
| **Total new SFX files** | **41** | |

---

## 6. Polish Elements

### 6.1 Screen Shake Variants

The game currently defines shake events but may lack biome-specific flavor. Add tinted screen-flash colors per biome on heavy shake events.

| Event | Base Intensity | Duration | Biome-Adaptive Tint |
|-------|---------------|----------|---------------------|
| Player hit | 3px directional | 0.15s | No tint (clean shake) |
| Heavy enemy destroyed | 5px omnidirectional | 0.25s | Flash biome color at 5% opacity (see table below) |
| Mid-boss destroyed | 8px omnidirectional | 0.5s | Flash biome color at 10% opacity + 0.2s pre-shake pause |
| Boss phase transition | 6px horizontal | 0.4s | Flash biome color at 8% opacity, sync with screen flash |
| Boss final destruction | 12px omnidirectional | 1.2s | Parabolic ramp: biome color 15% → white 20% → biome color 10% → fade |
| Supreme Nova continuous fire | 1px persistent | While firing | Subtle weapon glow pulsing at screen edge |

**Biome-specific shake flash tints (5% opacity overlay, 80–200ms):**

| Biome | Flash Color | Hex |
|-------|-------------|-----|
| 1: Abyssal Trench | Deep blue | `#0A2244` |
| 2: Coral Graveyard | Rust orange | `#CC5500` |
| 3: Coelacanth Lair | Blood red | `#CC0000` |
| 4: Nebula Drift | Plasma magenta | `#FF00FF` |
| 5: Ice Ring | Ice blue | `#88CCFF` |
| 6: Fire Nebula | Lava orange | `#FF4400` |
| 7: Storm Belt | Static white-blue | `#CCDDFF` |
| 8: Derelict Fleet | Emergency red | `#FF2222` |
| 9: Xenomorph Hive | Acid green | `#33FF33` |
| 10: Core Rift | Reality-bleed magenta | `#FF0088` |

### 6.2 Hit-Flash Effects

When enemies take damage, a brief flash effect should communicate impact. Currently handled by explosion taxonomy — add enemy-type hitspark variants:

| Enemy Tier | Flash Type | Duration | Color | Sprite |
|------------|-----------|----------|-------|--------|
| Scout | **Small spark** | 100ms | White `#FFFFFF` → fade | 4-frame starburst, 16×16px |
| Interceptor | **Medium spark** | 150ms | Enemy palette primary + white core | 6-frame impact ring, 24×24px |
| Heavy | **Armor spark** | 200ms | Orange `#FF5500` sparks + metallic glint | 8-frame directional spark cone, 32×32px |
| Boss (armored) | **Armor crack** | 250ms | White flash + red `#FF3333` crack lines | 10-frame radial fracture, 48×48px |
| Boss (vulnerable) | **Critical flash** | 300ms | Gold `#FFD700` + white super-flash | 12-frame critical starburst, 64×64px |

**Implementation:** Hitsparks spawn at impact point, play once, are purely cosmetic. Use the existing explosion taxonomy variant system (anti-repetition rule, 5% critical hit chance).

### 6.3 Weapon Overheat Glow

**Trigger:** Player holds fire at Supreme Nova (weapon level 5) for >3 seconds.

**Visual sequence:**
1. **3.0s mark:** Weapon icon on HUD begins subtle orange glow `#FFAA00` (pulsing at 2 Hz)
2. **3.5s mark:** Ship engine ports begin emitting orange-tinted exhaust (instead of normal cyan)
3. **4.0s mark (critical):** Ship hull glows orange-white from within, a visible heat-distortion effect warps the area around the ship (horizontal pixel displacement ±2px), HUD heat bar flashes red
4. **4.0s+ (overheat):** Brief screen flash red (8% opacity, 150ms), weapon drops to level 1, ship takes 1 damage, smoke particles emit from ship for 1s

**Sprite needed:** `overheat_glow` — 8-frame orange-white radial glow animation (32×32px expanding to 64×64px, centered on ship)

**SFX needed:** `sfx_overheat_warning` — rising capacitor whine (0.5s, FM synthesis, pitch ramp 400Hz→1200Hz)  
**SFX needed:** `sfx_overheat_trigger` — sharp electrical "crack" + power-down whump (0.6s)

### 6.4 Low-Health Warning Pulse

**Trigger:** Player HP drops below 25% (threshold varies by ship max HP).

**Visual sequence:**
1. **Border pulse:** Screen edges develop a red `#FF0000` vignette (10% opacity) that pulses at 1.5 Hz in sync with:
2. **Health bar:** HUD health bar pulses red (opacity oscillation 100% → 60% → 100% at 1.5 Hz), bar shakes ±2px horizontally
3. **Ship glow:** Player ship develops a faint red outline glow (2px, 30% opacity) — purely cosmetic danger indicator
4. **Audio:** Heartbeat SFX layered into the mix (`sfx_low_health_heartbeat` — deep muffled thud at 90 BPM, low-pass filtered at 200Hz, ducked behind music but audible)

**Below 10% HP additional effects:**
- Heartbeat accelerates to 140 BPM
- Border vignette deepens to 20% opacity
- Ship red outline intensifies to 60% opacity
- Occasional static-glitch lines across screen (1–2 per 5s, 100ms, white `#FFFFFF`, 5% opacity)

**SFX needed:** `sfx_low_health_heartbeat` — 90 BPM loop, deep muffled thud, Sega Genesis PSG noise channel, 2-second seamless loop

---

## 7. Complete Biome Summary Table

| # | Biome | Color Palette (Dominant) | Environmental Effect | Particle Type | Ambient Mood | Unique Polish |
|---|-------|--------------------------|---------------------|---------------|--------------|---------------|
| 1 | Abyssal Trench | `#0A1128` / `#FF6600` / `#00FFFF` | Bioluminescent Drift | Floating motes + vent smoke | Sub-bass drones + hydrophone crackle | Pressure-crack vignette |
| 2 | Coral Graveyard | `#CC5500` / `#FF4488` / `#1A3A2A` | Rust Storm | Brownian rust flakes + neon flicker | Industrial percussion + detuned synths | Dead reef parallax ghosting |
| 3 | Coelacanth Lair | `#CC0000` / `#555555` / `#00CCFF` | Tesla Arcs | Jagged lightning + coolant drips | Mechanical heartbeat + industrial rhythm | Core pulse sync (BPM-linked flash) |
| 4 | Nebula Drift | `#00BFFF` / `#FF00FF` / `#050510` | Plasma Currents | Sine-wave gas ribbons + storm flashes | Ethereal pads + ion crackle | Gravity lensing distortion |
| 5 | Ice Ring | `#88CCFF` / `#EEEEFF` / `#002244` | Diamond Dust | Hexagonal crystals + prismatic beams | Glass harmonica + crystalline delays | Frost creep on low HP |
| 6 | Fire Nebula | `#FF4400` / `#FFAA00` / `#443333` | Ember Storm | Corkscrew embers + ash clouds + heat shimmer | Taiko drums + distorted bass growls | Shield melt glow |
| 7 | Storm Belt | `#FFFFFF` / `#4466FF` / `#333344` | Lightning Cage | Horizontal bolts + static bands + rain | White noise gusts + glitchy breakbeats | HUD glitch (cosmetic) |
| 8 | Derelict Fleet | `#555566` / `#FF2222` / `#886644` | Drifting Debris | Tumbling shards + beacon flashes + coolant gas | Distress beacons + metallic groans | Proximity alert flicker |
| 9 | Xenomorph Hive | `#CC6677` / `#33FF33` / `#6633AA` | Organic Seepage | Acid drips + vein pulses + spore clouds | Organic squelch + insectoid chitter | Egg sac gestation glow |
| 10 | Core Rift | `#000000` / `#FFFFFF` / `#FF0088` / `#00FF41` | Reality Tears | Code streams + rift cracks + echo fragments | Granular disintegration + Shepard tone | UI corruption (cosmetic) |

---

## 8. Total Asset Gap Summary

| Asset Category | Missing Count | Generation Tool | Priority |
|---------------|---------------|-----------------|----------|
| Parallax background sheets (biomes 5–10) | 30 | Veo 3.1 / Imagen | **CRITICAL** |
| Ambient music tracks (biomes 5–10) | 6 | Lyria 2 | **CRITICAL** |
| Boss music tracks (all 10 biomes) | 10 | Lyria 2 | HIGH |
| Mid-boss music tracks | 10 | Lyria 2 | HIGH |
| Menu/title/credits music | 5 | Lyria 2 | MEDIUM |
| Engine hum variants | 10 | Lyria 2 | MEDIUM |
| Environmental SFX | 20 | Lyria 2 | MEDIUM |
| Menu transition SFX | 11 | Lyria 2 | MEDIUM |
| Overheat glow sprite | 1 | Veo 3.1-lite | MEDIUM |
| Hitspark sprites (5 tiers) | 5 sheets | Veo 3.1-lite | LOW |
| Low-health heartbeat SFX | 1 | Lyria 2 | LOW |
| Overheat warning/trigger SFX | 2 | Lyria 2 | LOW |
| **TOTAL** | **~111 assets** | | |

---

## 9. Generation Order (Recommended)

1. **Ambient music tracks** (biomes 5–10) — foundational audio identity for each biome
2. **Parallax background sheets** (biomes 5–10, 30 sheets) — largest visual gap
3. **Environmental particle sprite sheets** — one per biome (10 sheets, 16×16 to 32×32 particles)
4. **Environmental SFX** (20 files) — audio counterpart to particle effects
5. **Engine hum variants** (10 files) — subtle but important immersion layer
6. **Boss music tracks** (10 files) — essential for biome boss encounters
7. **Menu transition SFX** (11 files) — UI polish
8. **Polish sprites** (overheat glow, hitsparks) + remaining SFX

---

*End of style guide. This document provides sufficient specification for Veo 3.1 (visuals) and Lyria 2 (audio) asset generation across all 10 biomes. All elements conform to the unified Darius Star aesthetic: 16-bit pixel art, Sega Genesis sound palette, cyberpunk biomechanical theme, and cohesive neon color palette.*
