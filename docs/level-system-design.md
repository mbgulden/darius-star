# Level System Design — Darius Star: Cyber Coelacanth

## Overview

**Current state:** Score-based progression with 3 continuous zones (Abyssal Trench → Coral Graveyard → Coelacanth's Lair). Boss triggers at score thresholds.

**Target:** 10 biomes × 10 sub-levels each = 100 total stages. Each sub-level is a discrete wave-clear challenge with a sub-boss at level 5 and a biome boss at level 10. Scoring continues to function — sub-levels have score quotas for advancement.

## Progression Architecture

```
Biome N, Level L: Clear waves → hit score quota → advance
              Level 5: Mid-boss encounter (unique per biome)
              Level 10: Biome boss → unlock next biome
```

**Score quotas per sub-level:**
- Levels 1–4: 300 points each
- Level 5 (mid-boss): 500 points + boss kill
- Levels 6–9: 400 points each
- Level 10 (biome boss): 800 points + boss kill

**Difficulty scaling per sub-level (within a biome):**
| Stat | Scaling |
|------|---------|
| Enemy speed | +20% per sub-level |
| Enemy HP | +50% per sub-level |
| Spawn rate | +30% per sub-level |
| Bullet density | +25% per sub-level |
| Mid-boss HP | 60 HP (biome 1) → 240 HP (biome 10) |
| Biome boss HP | 120 HP (biome 1) → 480 HP (biome 10) |

**Difficulty scaling across biomes:**
| Biome | Base HP Multiplier | Base Speed Multiplier | New Enemy Types |
|-------|-------------------|----------------------|-----------------|
| 1–3 (Ocean Depths) | 1.0× | 1.0× | Scout, Interceptor, Heavy |
| 4–6 (Cosmic Expanse) | 1.5× | 1.3× | + Nebula Wraith, Ice Drone |
| 7–9 (War Zones) | 2.0× | 1.6× | + Storm Sentinel, Fleet Turret |
| 10 (Core Rift) | 3.0× | 2.0× | + Rift Aberration, Void Maw |

---

## The 10 Biomes

### Biome 1: Abyssal Trench
**Depth:** 0m — The entry wound. Hydrothermal vents pierce eternal darkness.
**Background:** 3-layer parallax — far: black abyss with faint blue glow, mid: towering vent chimneys belching mineral smoke, near: drifting bioluminescent particles and ancient bone fragments.
**Color palette:** Deep navy (#0A1128), vent orange (#FF6600), bioluminescent cyan (#00FFFF)
**Ambient track:** "Abyssal Descent" — sub-bass drones (40–80Hz), hydrophone crackle, distant whale-song pads
**Enemies:**
| Type | Description | HP | Points | Behavior |
|------|-------------|-----|--------|----------|
| Scout (Anglerfish) | Robotic anglerfish with lure-light sensor | 1 | 100 | Sine-wave approach, pauses to flash lure |
| Interceptor (Jellyfish) | Cyber-jellyfish with pink fiber-optic tentacles | 1 | 150 | Diagonal strafe, tentacle whip on proximity |
| Heavy (Vent Crab) | Armored crustacean with superheated claw | 4 | 300 | Slow drift, claw shockwave (AoE), 2-sec charge telegraph |
| **Mid-boss L5:** Vent Leviathan | Giant tube-worm serpent, 60 HP | — | 2000 | Emerges from vent, flame breath attack, segment destruction |
| **Biome boss L10:** Trench Guardian | Colossal armored isopod, 120 HP | — | 5000 | 3-phase: rolling charge → vent eruption spam → enrage spin |

### Biome 2: Coral Graveyard
**Depth:** 2000m — Where neon dreams go to rust.
**Background:** Far: murky green abyss, mid: shattered cyber-coral formations with broken neon signage (flickering), near: drifting rust particles, dead fiber-optic vines.
**Color palette:** Rust orange (#CC5500), dead coral pink (#FF4488), murk green (#1A3A2A)
**Ambient track:** "Coral Collapse" — industrial percussion (metallic clangs), detuned synth arpeggios, distant structural groans
**Enemies:**
| Type | Description | HP | Points | Behavior |
|------|-------------|-----|--------|----------|
| Scout (Rust Drone) | Corroded survey drone, sparking | 1 | 100 | Erratic zigzag, random speed bursts |
| Interceptor (Coral Wasp) | Neon-stinger cyber-insect | 2 | 175 | Hover-strafe, sting lunge (telegraphed) |
| Heavy (Armored Eel) | Segmented cyber-eel weaving through coral | 4 | 300 | Undulation pattern, homing electric bolts |
| **Mid-boss L5:** Reef Cracker | Giant pistol-shrimp mech, 80 HP | — | 2500 | Cavitation bubble → sonic blast (screen shake), claw grapple |
| **Biome boss L10:** Graveyard Leviathan** | Reanimated cyber-whale carcass, 150 HP | — | 6000 | 3-phase: parasite swarm release → tail sweep → death spiral beam |

> \*\*Note: This is NOT the Cyber Coelacanth — it's a different boss for biome 2 completion. The Cyber Coelacanth is the Biome 3 boss.

### Biome 3: Coelacanth's Lair
**Depth:** 5000m — The biomechanical throne room. Final ocean biome.
**Background:** Far: pulsating red energy cores in darkness, mid: cathedral-scale ancient machinery with dripping coolant, near: arcing electricity between Tesla coils, massive pipe networks.
**Color palette:** Blood red (#CC0000), machine gray (#555555), energy cyan (#00CCFF)
**Ambient track:** "Dreadnought Rising" → "Coelacanth's Fury" (phase shift at boss encounter)
**Enemies:**
| Type | Description | HP | Points | Behavior |
|------|-------------|-----|--------|----------|
| Scout (Sparker) | Small flying drone with arc welder | 1 | 100 | Fast linear passes, leaves electric trail |
| Interceptor (Sentinel) | Floating turret orb, red optic | 2 | 200 | Stationary, 3-shot burst pattern, rotates |
| Heavy (Juggernaut) | Heavy walker mech on ceiling tracks | 5 | 350 | Rail-mounted, drops proximity mines |
| Boss Minion | Spawned by Coelacanth | 2 | 50 | Fast scurry, sacrificial charge |
| **Mid-boss L5:** Warden Mech | Giant bipedal guardian, 100 HP | — | 3000 | Stomp shockwaves → missile volley → shield phase (invulnerable 3s) |
| **Biome boss L10:** Cyber Coelacanth | Ancient biomechanical dreadnought, 200 HP | — | 10000 | 5-state AI: Intro → Idle → Rage (50%) → Laser Charge → Laser Fire → Death |

### Biome 4: Nebula Drift
**Era:** Ascending from the ocean planet into low orbit. The planet's atmosphere bleeds into space.
**Background:** Far: cosmic gas clouds in cyan/magenta, mid: electrical storm cells with lightning flashes, near: drifting debris from shattered satellites, glowing plasma pockets.
**Color palette:** Nebula cyan (#00BFFF), plasma magenta (#FF00FF), void black (#050510)
**Ambient track:** "Nebula Drift" — ethereal pads with slow filter sweeps, ion crackle percussion, theremin-like lead melody
**Enemies:**
| Type | Description | HP | Points | Behavior |
|------|-------------|-----|--------|----------|
| Scout (Plasma Wisp) | Floating energy orb, phase-shifts | 1 | 125 | Teleports short distances, unpredictable |
| Interceptor (Storm Sprite) | Lightning-elemental fighter | 2 | 200 | Chain-lightning attack, arcs between wisps |
| Heavy (Gas Giant) | Massive slow-moving cloud entity | 6 | 400 | Absorbs bullets (front shield), vulnerable from behind |
| Nebula Wraith (new) | Semi-transparent ghost ship | 3 | 250 | Phases in/out of visibility, passes through terrain |
| **Mid-boss L5:** Storm Cell Core | Concentrated electrical storm, 120 HP | — | 3500 | Rotating lightning arms, expanding/contracting AoE |
| **Biome boss L10:** Nebula Serpent | Cosmic gas-serpent, 180 HP | — | 7000 | 3-phase: gas cloud camouflage → constricting rings → plasma supernova |

### Biome 5: Ice Ring
**Era:** The frozen asteroid belt surrounding the ocean planet.
**Background:** Far: distant star with cold blue light, mid: massive ice crystal formations refracting light into prismatic beams, near: tumbling asteroid fragments, frozen debris clouds.
**Color palette:** Ice blue (#88CCFF), crystal white (#EEEEFF), deep freeze (#002244)
**Ambient track:** "Ice Ring" — glass harmonica tones, crystalline delay effects, sub-zero wind ambience, sparse bell hits
**Enemies:**
| Type | Description | HP | Points | Behavior |
|------|-------------|-----|--------|----------|
| Scout (Ice Shard) | Sharp crystal fragment, spinning | 1 | 125 | Ricochets off screen edges |
| Interceptor (Frost Drone) | Hexagonal drone, ice beam | 2 | 200 | Freeze ray slows player temporarily |
| Heavy (Glacier) | Massive ice block with weapon ports | 7 | 450 | Slow, fires ice spikes in all directions on death |
| Ice Drone (new) | Small crystal swarm unit | 1 | 75 | Attacks in groups of 5, formation flying |
| **Mid-boss L5:** Crystal Golem | Animated ice colossus, 140 HP | — | 4000 | Shatter attack (fragments become projectiles), freeze-lock grapple |
| **Biome boss L10:** Frost Wyrm | Ice dragon burrowing through asteroids, 200 HP | — | 8000 | 3-phase: burrow-strike → ice breath sweep → asteroid-hurling frenzy |

### Biome 6: Fire Nebula
**Era:** Volcanic planetoid cluster. Lava rivers connect floating landmasses.
**Background:** Far: orange-red nebula glow, mid: volcanic planetoids with active lava flows, near: ash clouds, ember particles, heat-distortion shimmer.
**Color palette:** Lava orange (#FF4400), ember yellow (#FFAA00), ash gray (#443333)
**Ambient track:** "Fire Nebula" — distorted bass growl, tribal percussion (taiko), heat-haze synth washes, rising tension builds
**Enemies:**
| Type | Description | HP | Points | Behavior |
|------|-------------|-----|--------|----------|
| Scout (Ember Sprite) | Tiny fire elemental | 1 | 150 | Leaves burning trail, fast but fragile |
| Interceptor (Magma Wasp) | Molten insectoid fighter | 2 | 225 | Dive-bomb attack, explodes on death (AoE) |
| Heavy (Lava Golem) | Slow molten humanoid | 8 | 500 | Lava pool spawn (creates hazard zone), melee smash |
| **Mid-boss L5:** Caldera Wyrm | Lava-dwelling serpent, 160 HP | — | 4500 | Erupts from lava pools, rain of fire attack, terrain becomes hazardous |
| **Biome boss L10:** Inferno Titan | Walking volcano entity, 220 HP | — | 9000 | 3-phase: eruption barrage → magma wave → core-exposed desperation |

### Biome 7: Storm Belt
**Era:** Perpetual electromagnetic storm zone. Navigation systems fail. Visuals glitch.
**Background:** Far: black cloud banks with internal lightning, mid: electromagnetic interference static bands, near: floating wreckage of ships caught in the storm, arcing electricity between debris.
**Color palette:** Lightning white (#FFFFFF), static blue (#4466FF), storm gray (#333344)
**Ambient track:** "Storm Belt" — white noise gusts, thunder percussive hits, distorted radio signals, glitchy breakbeats
**Enemies:**
| Type | Description | HP | Points | Behavior |
|------|-------------|-----|--------|----------|
| Scout (Static Spark) | Ball lightning, erratic | 1 | 150 | Random teleports, ionizes area |
| Interceptor (Storm Hawk) | Mechanical bird, lightning wings | 3 | 250 | Swoop attack, EMP burst disables player weapons (1.5s) |
| Heavy (Thunderhead) | Dense storm cloud with weapon core | 8 | 500 | Chain lightning between all enemies on screen |
| Storm Sentinel (new) | Floating obelisk, stationary | 5 | 350 | Projects lightning wall (vertical/horizontal), rotates |
| **Mid-boss L5:** Eye of the Storm | Calm center with rotating lightning arms, 180 HP | — | 5000 | Expands/contracts safe zone, lightning arm sweep |
| **Biome boss L10:** Tempest Colossus | Storm giant formed from the belt itself, 240 HP | — | 10000 | 3-phase: wind push (player drift) → lightning cage → total blackout strikes |

### Biome 8: Derelict Fleet
**Era:** Abandoned warship graveyard. A battle frozen in time.
**Background:** Far: starfield with distant explosion flashes (frozen), mid: massive derelict battleship hulls with flickering emergency lights, near: floating debris — torn hull plates, dead fighter craft, drifting escape pods.
**Color palette:** Hull gray (#555566), emergency red (#FF2222), rust brown (#886644)
**Ambient track:** "Derelict Fleet" — distant distress beacons (Morse code pings), metallic groans, ghostly ship-horn drones, industrial reverb
**Enemies:**
| Type | Description | HP | Points | Behavior |
|------|-------------|-----|--------|----------|
| Scout (Salvage Drone) | Autonomous repair bot, repurposed | 1 | 150 | Magnetizes to player, self-destructs on contact |
| Interceptor (Ghost Fighter) | Derelict fighter on autopilot | 3 | 250 | Pre-programmed attack patterns, predictable but dense |
| Heavy (Turret Battery) | Still-active battleship turret | 10 | 600 | Stationary, rotating triple-cannon, fires synchronized volleys |
| Fleet Turret (new) | Smaller deck gun, pop-up ambush | 4 | 300 | Emerges from debris, 2-sec warning flash, then rapid fire |
| **Mid-boss L5:** Reactor Core Guardian | Automated defense system, 200 HP | — | 5500 | Rotating shield segments (must hit gaps), overcharge beam |
| **Biome boss L10:** Dreadnought AI** | Central AI of the derelict fleet, 260 HP | — | 12000 | 3-phase: turret grid activation → fighter swarm deployment → core self-destruct sequence (timer) |

> \*\*Note: The Dreadnought AI is a separate entity from the Cyber Coelacanth — it's the warship fleet's command intelligence.

### Biome 9: Xenomorph Hive
**Era:** Organic alien infestation. The fleet wasn't abandoned — it was consumed.
**Background:** Far: pulsating organic sacs on hull surfaces, mid: fleshy tunnels bored through warship structures, near: dripping acidic ooze, egg clusters, twitching organic tendrils.
**Color palette:** Flesh pink (#CC6677), acid green (#33FF33), organic purple (#6633AA)
**Ambient track:** "Xenomorph Hive" — organic squelch percussive sounds, chittering insectoid rhythms, deep throat-sung drones, heartbeat sub-bass
**Enemies:**
| Type | Description | HP | Points | Behavior |
|------|-------------|-----|--------|----------|
| Scout (Crawler) | Facehugger-type skittering creature | 2 | 175 | Wall-crawling (climbs screen edges), pounces |
| Interceptor (Spitter) | Ranged organic turret-creature | 3 | 275 | Fires acid globs (DoT on hit, 3 ticks) |
| Heavy (Brute) | Massive armored xenomorph | 10 | 600 | Charge attack, ground pound AoE, enrages at 25% HP |
| Hive Node (new) | Organic spawner structure | 8 | 400 | Stationary, spawns Crawlers every 8s, must destroy to stop flow |
| **Mid-boss L5:** Brood Mother | Giant egg-layer creature, 220 HP | — | 6000 | Spawns waves → acid pool vomit → screech stun + rush |
| **Biome boss L10:** Hive Mind** | Central intelligence of the infestation, 280 HP | — | 14000 | 3-phase: psychic scream (reverse controls) → swarm convergence → final assimilation attempt (QTE dodge) |

> \*\*Note: The Hive Mind is an organic entity — distinct from the Dreadnought AI (biome 8) and Cyber Coelacanth (biome 3).

### Biome 10: Core Rift
**Era:** The reality-bending final biome. Physics glitch. Time stutters. The true enemy reveals itself.
**Background:** Far: swirling event horizon with gravitational lensing, mid: reality tears — cracks in space showing raw code/static, near: distorted reflections of previous biomes, fragmented geometry, impossible architecture.
**Color palette:** Void black (#000000), rift white (#FFFFFF), reality-bleed magenta (#FF0088), code green (#00FF41)
**Ambient track:** "Core Rift" — granular synthesis disintegration, reversed audio fragments from all previous biome tracks, Shepard-tone rising tension, heartbeat that gradually desyncs
**Enemies:**
| Type | Description | HP | Points | Behavior |
|------|-------------|-----|--------|----------|
| Scout (Glitch Fragment) | Corrupted data-visual, flickers | 2 | 200 | Phase-shifts between 2 positions, unpredictable |
| Interceptor (Paradox Wisp) | Time-distorted enemy | 3 | 300 | Moves in reverse, bullets travel backward then forward |
| Heavy (Null Entity) | Void-born horror, static-edged | 12 | 700 | Erases player bullets in radius, silence aura (no SFX near it) |
| Rift Aberration (new) | Shifting geometry nightmare | 6 | 450 | Changes shape every 3s (copies any enemy from biomes 1–9) |
| Void Maw (new) | Gaping tear that pulls player toward it | 10 | 0 (indestructible hazard) | Gravity well, instant kill on contact, must navigate around |
| **Mid-boss L5:** Reality Anchor | Stabilization pylon, corrupted, 240 HP | — | 7000 | Alternates between 4 reality-states (fire → ice → storm → void), each with different attack patterns |
| **Biome boss L10:** The Architect** | The entity that created the Cyber Coelacanth. Not a ship — a consciousness. 400 HP | — | 25000 | 5-phase: Manifestation → Reality Warp (biome flashbacks) → Code Injection (UI corruption) → Void Ascension → Final Form (the player vs. a shadow-self) |

> \*\*The Architect is the final boss of Darius Star. It created the biomechanical horrors infesting the ocean planet. Defeating it breaks the cycle.

---

## Enemy Master Table

| ID | Name | Type | Base HP | Points | Biome Debut | Special |
|----|------|------|---------|--------|-------------|---------|
| E01 | Anglerfish Scout | Scout | 1 | 100 | 1 | Lure flash |
| E02 | Jellyfish Interceptor | Interceptor | 1 | 150 | 1 | Tentacle whip |
| E03 | Vent Crab Heavy | Heavy | 4 | 300 | 1 | Claw shockwave |
| E04 | Rust Drone | Scout | 1 | 100 | 2 | Speed bursts |
| E05 | Coral Wasp | Interceptor | 2 | 175 | 2 | Sting lunge |
| E06 | Armored Eel | Heavy | 4 | 300 | 2 | Homing bolts |
| E07 | Sparker | Scout | 1 | 100 | 3 | Electric trail |
| E08 | Sentinel | Interceptor | 2 | 200 | 3 | 3-burst pattern |
| E09 | Juggernaut | Heavy | 5 | 350 | 3 | Proximity mines |
| E10 | Boss Minion | Minion | 2 | 50 | 3 | Sacrificial charge |
| E11 | Plasma Wisp | Scout | 1 | 125 | 4 | Short teleport |
| E12 | Storm Sprite | Interceptor | 2 | 200 | 4 | Chain lightning |
| E13 | Gas Giant | Heavy | 6 | 400 | 4 | Front shield |
| E14 | Nebula Wraith | Special | 3 | 250 | 4 | Phase visibility |
| E15 | Ice Shard | Scout | 1 | 125 | 5 | Screen ricochet |
| E16 | Frost Drone | Interceptor | 2 | 200 | 5 | Freeze ray |
| E17 | Glacier | Heavy | 7 | 450 | 5 | Death spike burst |
| E18 | Ice Drone Swarm | Special | 1 | 75 | 5 | Formation of 5 |
| E19 | Ember Sprite | Scout | 1 | 150 | 6 | Burning trail |
| E20 | Magma Wasp | Interceptor | 2 | 225 | 6 | Death explosion |
| E21 | Lava Golem | Heavy | 8 | 500 | 6 | Lava pool spawn |
| E22 | Static Spark | Scout | 1 | 150 | 7 | Ionization zone |
| E23 | Storm Hawk | Interceptor | 3 | 250 | 7 | EMP burst |
| E24 | Thunderhead | Heavy | 8 | 500 | 7 | Chain lightning |
| E25 | Storm Sentinel | Special | 5 | 350 | 7 | Lightning wall |
| E26 | Salvage Drone | Scout | 1 | 150 | 8 | Self-destruct rush |
| E27 | Ghost Fighter | Interceptor | 3 | 250 | 8 | Pattern attack |
| E28 | Turret Battery | Heavy | 10 | 600 | 8 | Triple cannon |
| E29 | Fleet Turret | Special | 4 | 300 | 8 | Pop-up ambush |
| E30 | Crawler | Scout | 2 | 175 | 9 | Wall-crawl pounce |
| E31 | Spitter | Interceptor | 3 | 275 | 9 | Acid DoT |
| E32 | Brute | Heavy | 10 | 600 | 9 | Charge + enrage |
| E33 | Hive Node | Special | 8 | 400 | 9 | Spawns Crawlers |
| E34 | Glitch Fragment | Scout | 2 | 200 | 10 | Position flicker |
| E35 | Paradox Wisp | Interceptor | 3 | 300 | 10 | Reverse movement |
| E36 | Null Entity | Heavy | 12 | 700 | 10 | Bullet erase aura |
| E37 | Rift Aberration | Special | 6 | 450 | 10 | Shape-shift |
| E38 | Void Maw | Hazard | 10 | 0 | 10 | Gravity well, unkillable |

**Total unique enemy types: 38** (up from current 4)

---

## Boss Master Table

| ID | Name | Biome | Level | Type | HP | Points | Phases |
|----|------|-------|-------|------|-----|--------|--------|
| B01 | Vent Leviathan | 1 | 5 | Mid-boss | 60 | 2000 | 2 (emerge, flame breath) |
| B02 | Trench Guardian | 1 | 10 | Biome boss | 120 | 5000 | 3 (roll, vent, spin) |
| B03 | Reef Cracker | 2 | 5 | Mid-boss | 80 | 2500 | 2 (cavitation, grapple) |
| B04 | Graveyard Leviathan | 2 | 10 | Biome boss | 150 | 6000 | 3 (parasites, sweep, beam) |
| B05 | Warden Mech | 3 | 5 | Mid-boss | 100 | 3000 | 3 (stomp, missiles, shield) |
| B06 | Cyber Coelacanth | 3 | 10 | Biome boss | 200 | 10000 | 5 (intro, idle, rage, laser, death) |
| B07 | Storm Cell Core | 4 | 5 | Mid-boss | 120 | 3500 | 2 (lightning arms, AoE) |
| B08 | Nebula Serpent | 4 | 10 | Biome boss | 180 | 7000 | 3 (camouflage, rings, nova) |
| B09 | Crystal Golem | 5 | 5 | Mid-boss | 140 | 4000 | 2 (shatter, freeze-lock) |
| B10 | Frost Wyrm | 5 | 10 | Biome boss | 200 | 8000 | 3 (burrow, breath, asteroid) |
| B11 | Caldera Wyrm | 6 | 5 | Mid-boss | 160 | 4500 | 2 (erupt, fire rain) |
| B12 | Inferno Titan | 6 | 10 | Biome boss | 220 | 9000 | 3 (eruption, wave, core) |
| B13 | Eye of the Storm | 7 | 5 | Mid-boss | 180 | 5000 | 2 (safe zone, arm sweep) |
| B14 | Tempest Colossus | 7 | 10 | Biome boss | 240 | 10000 | 3 (wind, cage, blackout) |
| B15 | Reactor Core Guardian | 8 | 5 | Mid-boss | 200 | 5500 | 2 (shield rotate, overcharge) |
| B16 | Dreadnought AI | 8 | 10 | Biome boss | 260 | 12000 | 3 (turrets, swarm, self-destruct) |
| B17 | Brood Mother | 9 | 5 | Mid-boss | 220 | 6000 | 3 (spawn, acid, stun) |
| B18 | Hive Mind | 9 | 10 | Biome boss | 280 | 14000 | 3 (psychic, swarm, assimilation) |
| B19 | Reality Anchor | 10 | 5 | Mid-boss | 240 | 7000 | 4 (multi-element) |
| B20 | The Architect | 10 | 10 | Final boss | 400 | 25000 | 5 (manifest, warp, inject, ascend, shadow-self) |

**Total bosses: 20** (10 mid-bosses + 10 biome bosses)

---

## Difficulty Curve Visualization

```
Biome:  1     2     3     4     5     6     7     8     9     10
        |-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
HP×:    1.0   1.0   1.0   1.5   1.5   1.5   2.0   2.0   2.0   3.0
Spd×:   1.0   1.0   1.0   1.3   1.3   1.3   1.6   1.6   1.6   2.0
Types:  3     3     4     4     4     4     4     4     4     5
BossHP: 120   150   200   180   200   220   240   260   280   400

Sub-level scaling within a biome:
L1 → L10: speed 1.0→2.8×, HP 1.0→5.5×, spawn rate 1.0→3.7×
```

---

## Progression Flow

```
START → Biome 1 (Ocean Depths) → Biome 2 → Biome 3 (Cyber Coelacanth)
                                    ↓
                              ASCEND TO ORBIT
                                    ↓
        Biome 4 (Nebula Drift) → Biome 5 (Ice Ring) → Biome 6 (Fire Nebula)
                                    ↓
                              ENTER THE STORM
                                    ↓
        Biome 7 (Storm Belt) → Biome 8 (Derelict Fleet) → Biome 9 (Xenomorph Hive)
                                    ↓
                              THE TRUTH REVEALED
                                    ↓
                          Biome 10 (Core Rift) → THE ARCHITECT → ENDING
```

---

## Narrative Arc

**Biomes 1–3 (The Hunt):** You descend into the ocean planet to destroy the Cyber Coelacanth. Each biome strips away more of the natural world, revealing the mechanical horror beneath.

**Biomes 4–6 (The Escape):** After defeating the Coelacanth, you discover the infestation isn't local — it's planetary. You ascend through the atmosphere, fighting through cosmic biomes to reach the fleet that came before you.

**Biomes 7–9 (The Truth):** The fleet is dead. Not destroyed — *consumed*. The storm belt is a defense grid. The derelict fleet was the last attack wave. The xenomorph hive is what grew from their bones.

**Biome 10 (The Source):** At the core of the rift, reality breaks. The Architect — an entity that creates biomechanical horrors and seeds them across worlds — is your true enemy. The Cyber Coelacanth was just one of its creations.

---

## Implementation Phases

### Phase 1: Score Quota System (can ship now)
- Replace continuous scroll with discrete sub-levels
- Score quota check after each wave clear
- Level counter display (Biome X — Level Y)
- Mid-boss trigger at level 5, biome boss at level 10

### Phase 2: Biome Switching
- Background swap on biome transition
- Color palette shift
- Music track change
- Enemy table swap

### Phase 3: New Enemy Types
- Add E11–E38 per the master table
- Implement special behaviors (teleport, chain lightning, EMP, acid DoT, reverse movement, phase-shift)
- Hive Node spawner logic
- Void Maw gravity well

### Phase 4: Boss Encounters
- Boss state machine (generalized from Cyber Coelacanth's 5-state AI)
- Mid-boss encounter templates
- Health bar UI for bosses
- Phase transition effects

### Phase 5: Biome 10 Special Mechanics
- Glitch effects (screen tearing, color inversion)
- Reverse-control sections
- Gravity manipulation
- UI corruption effects for The Architect fight

---

## Asset Requirements Summary

| Asset Type | Count | Generator | Status |
|-----------|-------|-----------|--------|
| Biome backgrounds | 10 | Veo 3.1 / Imagen | 0/10 |
| Enemy sprites (new) | 34 types × 2–4 frames | Veo 3.1-lite / Leonardo.ai | 0/34 |
| Boss sprites (new) | 20 bosses × 3–5 frames | Veo 3.1 | 0/20 |
| Ambient music tracks | 10 | Lyria 2 | 0/10 |
| Boss music tracks | 10 | Lyria 2 | 0/10 |
| VFX (lightning, acid, rift) | ~15 | Veo 3.1-lite | 0/15 |

---

## Next Steps

1. **GRO-910** — Ship Selection Screen (5 playable ships with specialties)
2. **GRO-912** — Generate background sprites + enemy designs for biomes 4–10
3. **GRO-913** — Generate 4 new player ship sprites
4. **GRO-914** — Story Mode: Research narrative structure & hero journey
5. **GRO-915** — Write mission briefing scripts for all 10 biomes

*Design complete. This spec provides enough detail for AGY to research enemy behavior patterns and for Veo/Lyria to generate assets per biome.*
