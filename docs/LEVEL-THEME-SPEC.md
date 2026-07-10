# Level Theme Spec — Darius Star: Cyber Coelacanth

## Storyline
The Cyber Coelacanth — an ancient biomechanical dreadnought — has awakened in the depths of a neon-drenched ocean planet. You pilot the last fighter jet through cybernetic aquatic battle zones to reach and destroy it.

---

## Level 1: Abyssal Trench (Score 0–1000)
**Theme:** Deep ocean canyon with bioluminescent vents
**Background:** Dark water gradients, glowing hydrothermal vents, drifting bioluminescent particles
**Enemies:**
- **Scout:** Small robotic anglerfish with lure-light sensors
- **Interceptor:** Cyber-jellyfish with pink fiber-optic tentacles
**Music:** "Abyssal Descent" — deep pulsing bass, ethereal synth pads
**Boss trigger:** Score reaches 1000

---

## Level 2: Coral Graveyard (Score 1000–2000)
**Theme:** Bleached cyber-coral reef, rusted metal structures
**Background:** Twisted metal coral formations, orange rust clouds, broken neon signage
**Enemies:**
- **Heavy:** Armored cyber-eels weaving through coral
- **Interceptor (upgraded):** Swarming cyber-jellyfish with faster attack patterns
**Music:** "Coral Collapse" — industrial percussion, distorted synth leads
**Boss trigger:** Cyber Coelacanth awakens at 2000

---

## Level 3: Coelacanth's Lair (Boss Level, Score 2000+)
**Theme:** Biomechanical throne room in the ocean depths
**Background:** Massive ancient machinery, pulsating red energy cores, cables and pipes
**Enemies:** Boss minions (spawned by the Coelacanth)
**Boss Phases:**
1. **Idle/Intro:** Emerges from darkness, red optic sensors scanning
2. **Rage (50% HP):** Weapon ports extend, intensified attacks
3. **Laser Charge:** Plasma railgun charges with cyan halo
4. **Death:** Breaking apart, cascading explosions
**Music:** "Dreadnought Rising" → "Coelacanth's Fury" → "Victory or Oblivion"

---

## Unified Enemy Spawn Table

| Level | Scout | Interceptor | Heavy | Boss Minion |
|-------|-------|-------------|-------|-------------|
| 1 (0–1000) | ✅ Anglerfish | ✅ Jellyfish | ❌ | ❌ |
| 2 (1000–2000) | ✅ Anglerfish | ✅ Jellyfish (fast) | ✅ Cyber-eel | ❌ |
| 3 (2000+) | ❌ | ❌ | ✅ Cyber-eel | ✅ Spawned by boss |

---

## Needed Sprites for Level Themes

| Sprite | Frames | Theme |
|--------|--------|-------|
| scout_angler_0, scout_angler_1 | 2 | Robotic anglerfish with lure |
| jellyfish_pink_0, jellyfish_pink_1 | 2 | Cyber-jellyfish with pink tentacles |
| eel_armor_0, eel_armor_1 | 2 | Armored cyber-eel, segmented |
| level1_bg | 1 | Abyssal trench with vents |
| level2_bg | 1 | Coral graveyard with rust |
| level3_bg | 1 | Coelacanth throne room |

**Total new sprites needed:** 10
