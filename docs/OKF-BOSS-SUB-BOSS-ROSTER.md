# OKF Reference: Boss & Sub-Boss Roster (Biomes 1–10)
**Darius Star: Cyber Coelacanth — Canonical 20-Boss Spritesheet & Progressive Destruction Specification**
*Authoritative Reference for Gemini 3.1 Flash Image Prompts, Slicing, Hardpoints, and Atlas Manifests*

---

## 1. Master Boss Index & Status Matrix

| Biome | Level | Tier | Official Boss Name | Sprite Key | Hardpoint Count | Spritesheet Status | Reference Asset |
| :---: | :---: | :---: | :--- | :--- | :---: | :---: | :--- |
| **1** | 5 | Sub-Boss | **TRENCH NAUTILUS** | `boss_b1_mid_0` | 3 | ✅ **COMPLETE (Verified)** | [boss_b1_mid_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b1_mid_0.png) |
| **1** | 10 | Biome Boss | **DROWNED WARDEN** | `boss_b1_0` | 4 | 🟡 Design Ready / Queued | [boss_b1_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b1_0.png) |
| **2** | 15 | Sub-Boss | **CORAL DREADNOUGHT CORE** | `boss_b2_mid_0` | 4 | 🟡 Design Ready / Queued | [boss_b2_mid_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b2_mid_0.png) |
| **2** | 20 | Biome Boss | **MEMORY WRAITH** | `boss_b2_0` | 4 | 🟡 Design Ready / Queued | [boss_b2_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b2_0.png) |
| **3** | 25 | Sub-Boss | **WARDEN MECH** | `boss_b3_mid_0` | 4 | 🟡 Design Ready / Queued | [boss_b3_mid_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b3_mid_0.png) |
| **3** | 30 | Biome Boss | **EUROPA CYBER COELACANTH** | `boss_b3_0` | 4 | 🟡 Design Ready / Queued | [boss_b3_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b3_0.png) |
| **4** | 35 | Sub-Boss | **NEBULA LEVIATHAN** | `boss_b4_mid_0` | 4 | 🟡 Design Ready / Queued | [boss_b4_mid_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b4_mid_0.png) |
| **4** | 40 | Biome Boss | **VORTEX PRIMUS** | `boss_b4_0` | 4 | 🟡 Design Ready / Queued | [boss_b4_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b4_0.png) |
| **5** | 45 | Sub-Boss | **GLACIAL JUGGERNAUT** | `boss_b5_mid_0` | 4 | 🟡 Design Ready / Queued | [boss_b5_mid_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b5_mid_0.png) |
| **5** | 50 | Biome Boss | **FROST TYRANT** | `boss_b5_0` | 4 | 🟡 Design Ready / Queued | [boss_b5_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b5_0.png) |
| **6** | 55 | Sub-Boss | **MAGMA BEHEMOTH** | `boss_b6_mid_0` | 4 | 🟢 Shipped (2048x2048 HD 4x4 Atlas) | [boss_b6_mid_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b6_mid_0.png) |
| **6** | 60 | Biome Boss | **INFERNO DRAGON** | `boss_b6_0` | 4 | 🟡 Design Ready / Queued | [boss_b6_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b6_0.png) |
| **7** | 65 | Sub-Boss | **STORM EMPEROR CRUISER** | `boss_b7_mid_0` | 4 | 🟡 Design Ready / Queued | [boss_b7_mid_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b7_mid_0.png) |
| **7** | 70 | Biome Boss | **STORM-SINGER** | `boss_b7_0` | 4 | 🟡 Design Ready / Queued | [boss_b7_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b7_0.png) |
| **8** | 75 | Sub-Boss | **FLAGSHIP HANGAR** | `boss_b8_mid_0` | 4 | 🟡 Design Ready / Queued | [boss_b8_mid_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b8_mid_0.png) |
| **8** | 80 | Biome Boss | **THE IRON GHOST** | `boss_b8_0` | 4 | 🟡 Design Ready / Queued | [boss_b8_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b8_0.png) |
| **9** | 85 | Sub-Boss | **HIVE QUEEN SUB-CORE** | `boss_b9_mid_0` | 4 | 🟡 Design Ready / Queued | [boss_b9_mid_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b9_mid_0.png) |
| **9** | 90 | Biome Boss | **HIVE MIND OVERMIND** | `boss_b9_0` | 4 | 🟡 Design Ready / Queued | [boss_b9_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b9_0.png) |
| **10** | 95 | Sub-Boss | **PARADOX SINGULARITY GATE** | `boss_b10_mid_0` | 4 | 🟡 Design Ready / Queued | [boss_b10_mid_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b10_mid_0.png) |
| **10** | 100 | Biome Boss | **THE PRIMORDIAL SINGULARITY** | `boss_b10_0` | 4 | 🟡 Design Ready / Queued | [boss_b10_0.png](file:///home/ubuntu/work/darius-star/assets/sprites/boss_b10_0.png) |

---

## 2. Standardized 5-Tier 16-Frame Spritesheet Architecture

Every boss uses a uniform $4 \times 4$ grid (16 frames total, $256 \times 256\text{ px}$ per cell, $1024 \times 1024\text{ px}$ image). All sprites **must face LEFT**.

```
+-------------------+-------------------+-------------------+-------------------+
| Row 0, Frame 0    | Row 0, Frame 1    | Row 0, Frame 2    | Row 0, Frame 3    |  <-- IDLE / FLY
| Ambient breath    | Undulation/Pulse  | Thruster flare    | Cyan glow cycle   |
+-------------------+-------------------+-------------------+-------------------+
| Row 1, Frame 0    | Row 1, Frame 1    | Row 1, Frame 2    | Row 1, Frame 3    |  <-- SHOOT / CHARGE
| Energy charge     | Muzzle starburst  | Recoil beam blast | Heat dissipation  |
+-------------------+-------------------+-------------------+-------------------+
| Row 2, Frame 0    | Row 2, Frame 1    | Row 2, Frame 2    | Row 2, Frame 3    |  <-- PROGRESSIVE HIT
| Tier 1 Destroyed  | Tier 1+2 Destroyed| Tier 1+2+3 Destr. | Critical / Bare   |
+-------------------+-------------------+-------------------+-------------------+
| Row 3, Frame 0    | Row 3, Frame 1    | Row 3, Frame 2    | Row 3, Frame 3    |  <-- DEATH EXPLODE
| Core rupture flash| Plasma fireball   | Flying shrapnel   | Charcoal smoke    |
+-------------------+-------------------+-------------------+-------------------+
```

---

## 3. Global Prompt Engineering & Slicing Standards

### Mandatory White Background Token
Always end generation prompts with:
> `"isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter, facing left"`

### Pixel Art Style Anchor Token
> `"16-bit retro arcade pixel art shmup sprite in the style of Darius and Cyber Coelacanth, dark steel armor plates, glowing neon conduits, clean crisp pixel edges, sharp contour outlines, no blur, no anti-aliased vignette"`

### 4-Border Flood Fill Slicing Command
After generating any image, run:
```bash
python3 scripts/slice_and_process_sprites.py assets/sprites/[SPRITE_KEY].png
```
This algorithm flood-fills from the 4 image borders inward against `#FFFFFF`, keeping 100% of internal white specular highlights and chrome reflections opaque.

---

## 4. Comprehensive Roster Specification (Biomes 1 to 10)

---

### Biome 1: Hydrothermal Trench (Sub-Surface Abyss)

#### 1. Trench Nautilus (Sub-Boss, Level 5)
* **Sprite Key:** `assets/sprites/boss_b1_mid_0.png`
* **Status:** ✅ **COMPLETE & VERIFIED**
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b1_mid_0']`):**
  1. `tentacles`: Dart Tentacle Array (relX: 45, relY: 70, 75x35 px, disables `dart_spread`)
  2. `maw`: Bio-Plasma Maw Core (relX: 80, relY: 35, 55x45 px, disables `plasma_orb`)
  3. `shell`: Nautilus Armor Shell (relX: 10, relY: 15, 75x75 px, disables `armor`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of the Trench Nautilus: a colossal mechanical nautilus cyborg with spiral segmented gunmetal titanium shell, twin heavy forward plasma rail cannons, trailing articulated robotic cyber-tentacles with glowing cyan suction nodes, glowing cyan runes, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Lower robotic tentacles severed into smoking stump collars with cyan electric discharge arcs.
  - **Frame 1 (Tier 2):** Tentacles severed + forward twin rail cannons blown off into jagged smoking sockets.
  - **Frame 2 (Tier 3):** Tentacles severed + cannons blown off + armor shell carapace shattered open revealing titanium ribcage and cyan vortex reactor.
  - **Frame 3 (Critical):** Total chassis breakdown, bare smoking cybernetic frame, critical core breach.

---

#### 2. Drowned Warden (Biome Apex Boss, Level 10)
* **Sprite Key:** `assets/sprites/boss_b1_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b1_0']`):**
  1. `dorsal_rail`: Dorsal Railgun Battery (relX: 15, relY: 10, 75x35 px, disables `railgun`)
  2. `torpedo_bay`: Ventral Torpedo Pods (relX: 15, relY: 85, 75x35 px, disables `torpedoes`)
  3. `anchor_armor`: Abyssal Armor Carapace (relX: 55, relY: 20, 75x90 px, disables `armor`)
  4. `precursor_core`: Precursor Power Reactor (relX: 100, relY: 45, 65x50 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of the Drowned Warden: an ancient corrupted precursor armored isopod dreadnought serpent, dark navy steel hull, orange thermal exhaust vents, twin dorsal railgun turrets, ventral torpedo tubes, glowing orange optic sensor visor, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Dorsal railgun battery blown off into smoking torn metal mount.
  - **Frame 1 (Tier 2):** Dorsal railgun + ventral torpedo bays shattered and leaking sparks.
  - **Frame 2 (Tier 3):** Railguns + torpedo bays + outer abyssal carapace shattered open exposing hydraulic piping and orange core.
  - **Frame 3 (Critical):** All armor and weapons stripped, exposed smoking skeletal hull with critical reactor overload.

---

### Biome 2: Coral Graveyard (Sunken Reef)

#### 3. Coral Dreadnought Core (Sub-Boss, Level 15)
* **Sprite Key:** `assets/sprites/boss_b2_mid_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b2_mid_0']`):**
  1. `upper_flak`: Upper Coral Flak Sponson (relX: 15, relY: 15, 70x35 px, disables `upper_flak`)
  2. `lower_flak`: Lower Coral Flak Sponson (relX: 15, relY: 80, 70x35 px, disables `lower_flak`)
  3. `calcified_plate`: Calcified Shield Plate (relX: 45, relY: 25, 70x80 px, disables `armor`)
  4. `dread_core`: Dreadnought Fusion Core (relX: 90, relY: 45, 60x45 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of the Coral Dreadnought Core: a sunken battleship bridge overgrown with petrified calcified pink and green coral polyps, mounted with upper and lower dual flak cannons, rusted iron plating, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Upper coral flak cannon shattered into rubble.
  - **Frame 1 (Tier 2):** Upper + lower flak cannons both destroyed.
  - **Frame 2 (Tier 3):** Both flak sponsons + calcified armor plates cracked wide open exposing fusion coils.
  - **Frame 3 (Critical):** All weapon emplacements destroyed, bare burning superstructure, fusion core containment failing.

---

#### 4. Memory Wraith (Biome Apex Boss, Level 20)
* **Sprite Key:** `assets/sprites/boss_b2_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b2_0']`):**
  1. `upper_fin`: Dorsal Spectral Fin (relX: 20, relY: 10, 80x35 px, disables `upper_ion`)
  2. `lower_fin`: Ventral Spectral Fin (relX: 20, relY: 85, 80x35 px, disables `lower_ion`)
  3. `phase_shield`: Phase Energy Shroud (relX: 50, relY: 25, 75x80 px, disables `phase_barrier`)
  4. `wraith_heart`: Memory Core Heart (relX: 95, relY: 45, 65x45 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of the Memory Wraith: a spectral cybernetic leviathan whale skeleton composed of translucent glowing magenta and teal holographic memory-echoes intertwined with rusted steel vertebrae, sweeping dorsal and ventral spectral fins, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Dorsal spectral fin fractured into holographic glitch shards.
  - **Frame 1 (Tier 2):** Dorsal + ventral spectral fins severed into fizzling data particles.
  - **Frame 2 (Tier 3):** Fins destroyed + phase shroud collapsed, exposing rusted vertebrae and glowing memory heart.
  - **Frame 3 (Critical):** Holographic flesh disintegrated, leaving bare shattered rusted robotic bone cage with overloaded memory core.

---

### Biome 3: Europa Sunken City (Sub-Glacial Metropolis)

#### 5. Warden Mech (Sub-Boss, Level 25)
* **Sprite Key:** `assets/sprites/boss_b3_mid_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b3_mid_0']`):**
  1. `rail_arm`: Kinetic Rail Arm (relX: 15, relY: 20, 75x40 px, disables `rapid_rail`)
  2. `shield_arm`: Titanium Shield Arm (relX: 15, relY: 75, 75x40 px, disables `shield_barrier`)
  3. `sensor_pod`: Tactical Optics Pod (relX: 65, relY: 15, 50x35 px, disables `target_lock`)
  4. `mech_reactor`: Warden Mech Reactor (relX: 95, relY: 45, 60x50 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of the Warden Mech: an industrial heavy bipedal underwater combat walker mech with a heavy rapid-fire kinetic rail cannon on upper arm, reinforced tower shield on lower arm, yellow hazard stripes, tactical sensor crest, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Upper rail cannon arm severed at elbow with trailing sparking wires.
  - **Frame 1 (Tier 2):** Rail arm + lower titanium shield plate shattered.
  - **Frame 2 (Tier 3):** Both arms + head tactical sensor pod blown off, exposing pilot compartment and reactor.
  - **Frame 3 (Critical):** Armless, sensorless torso chassis leaking coolant and smoking heavily.

---

#### 6. Europa Cyber Coelacanth (Biome Apex Boss, Level 30)
* **Sprite Key:** `assets/sprites/boss_b3_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b3_0']`):**
  1. `dorsal_rail`: Dorsal Heavy Railgun (relX: 15, relY: 10, 85x40 px, disables `heavy_rail`)
  2. `ventral_missiles`: Ventral Swarm Launchers (relX: 15, relY: 85, 85x40 px, disables `swarm_missiles`)
  3. `caudal_thruster`: Caudal Thruster Array (relX: 110, relY: 35, 65x60 px, disables `dash_speed`)
  4. `coelacanth_core`: Cyber Coelacanth Core (relX: 55, relY: 45, 75x50 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of the Europa Cyber Coelacanth: the flagship cybernetic coelacanth fish dreadnought, heavy dark-titanium interlocking armor scales, massive dorsal electromagnetic railgun, ventral micro-missile pods, triple-lobed cyber caudal tail thruster, glowing neon blue armor seams, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Dorsal heavy railgun barrel cracked and blown off.
  - **Frame 1 (Tier 2):** Dorsal railgun + ventral missile pods destroyed into charred smoking bays.
  - **Frame 2 (Tier 3):** Railgun + missile pods + caudal tail fin thrusters shattered, exposing mechanical spine and pulsing cyber-heart.
  - **Frame 3 (Critical):** Stripped bare armored fish skeleton, tail sheared off, reactor core sparking violently.

---

### Biome 4: Bioluminescent Chasm (Nebula Abyss)

#### 7. Nebula Leviathan (Sub-Boss, Level 35)
* **Sprite Key:** `assets/sprites/boss_b4_mid_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b4_mid_0']`):**
  1. `plasma_horn`: Forehead Ion Horn (relX: 10, relY: 20, 65x35 px, disables `ion_horn`)
  2. `dorsal_fin`: Dorsal Plasma Emitter (relX: 45, relY: 10, 75x35 px, disables `dorsal_plasma`)
  3. `dragon_maw`: Mouth Plasma Blast (relX: 10, relY: 60, 70x40 px, disables `mouth_blast`)
  4. `leviathan_heart`: Nebula Leviathan Heart (relX: 75, relY: 45, 65x50 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of the Nebula Leviathan: an undulating deep-sea bio-mechanical dragon eel with a glowing purple ion horn on its forehead, dorsal photonic fin emitters, bioluminescent violet and cyan photophores along its flanks, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Forehead ion horn snapped off with purple plasma leakage.
  - **Frame 1 (Tier 2):** Horn + dorsal plasma fin emitter torn off.
  - **Frame 2 (Tier 3):** Horn + fin + lower jaw/maw cannons shattered, exposing organic-metal heart chamber.
  - **Frame 3 (Critical):** Heavily scarred bare eel torso, photophores extinguished, pulsing critical core rupture.

---

#### 8. Vortex Primus (Biome Apex Boss, Level 40)
* **Sprite Key:** `assets/sprites/boss_b4_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b4_0']`):**
  1. `upper_crescent`: Upper Armor Crescent (relX: 20, relY: 10, 85x40 px, disables `upper_plate`)
  2. `lower_crescent`: Lower Armor Crescent (relX: 20, relY: 85, 85x40 px, disables `lower_plate`)
  3. `forward_rail`: Storm Railgun Prow (relX: 10, relY: 45, 70x45 px, disables `storm_rail`)
  4. `vortex_core`: Vortex Reactor Core (relX: 75, relY: 45, 75x50 px, disables `vortex_pulse`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of Vortex Primus: a massive crescent-shaped void dreadnought with sweeping upper and lower armor wings, a forward tachyon storm railgun prow, and a swirling purple gravitational singularity reactor at its center, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Upper crescent wing severed into spinning shrapnel.
  - **Frame 1 (Tier 2):** Upper + lower crescent armor wings sheared off.
  - **Frame 2 (Tier 3):** Both wings + forward storm railgun prow destroyed, containment ring shattered around vortex core.
  - **Frame 3 (Critical):** Stripped central hub with uncontained swirling black hole core distorting surrounding metal.

---

### Biome 5: Glacial Sub-Surface (Cryo Vaults)

#### 9. Glacial Juggernaut (Sub-Boss, Level 45)
* **Sprite Key:** `assets/sprites/boss_b5_mid_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b5_mid_0']`):**
  1. `ram_prow`: Icebreaker Ram Prow (relX: 10, relY: 35, 65x60 px, disables `ram_armor`)
  2. `freeze_mortar`: Dorsal Sub-Zero Mortar (relX: 45, relY: 10, 75x35 px, disables `freeze_mortar`)
  3. `cooling_vents`: Cryogenic Heat-Sinks (relX: 95, relY: 20, 60x45 px, disables `cryo_overheat`)
  4. `glacial_engine`: Glacial Engine Core (relX: 65, relY: 45, 70x50 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of the Glacial Juggernaut: a brutal industrial icebreaker submarine with heavy spiked ram prow, dorsal cryogenic freeze mortar turret, frosted blue steel armor plates, frost exhaust heat-sinks, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Spiked ram prow smashed into cracked ice and jagged scrap.
  - **Frame 1 (Tier 2):** Ram prow + dorsal sub-zero mortar turret blown off.
  - **Frame 2 (Tier 3):** Prow + mortar + cooling heat-sinks blown out, venting clouds of freezing liquid nitrogen.
  - **Frame 3 (Critical):** Stripped smoking hull with cracked frozen reactor core venting cryo-plasma.

---

#### 10. Frost Tyrant (Biome Apex Boss, Level 50)
* **Sprite Key:** `assets/sprites/boss_b5_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b5_0']`):**
  1. `cryo_horns`: Twin Cryo-Beam Horns (relX: 10, relY: 15, 75x40 px, disables `cryo_beam`)
  2. `glacial_carapace`: Glacial Armor Shell (relX: 45, relY: 15, 85x55 px, disables `armor`)
  3. `frost_gills`: Ventral Freeze Spikes (relX: 45, relY: 75, 75x40 px, disables `freeze_spikes`)
  4. `tyrant_engine`: Frost Tyrant Core Engine (relX: 95, relY: 45, 65x50 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of the Frost Tyrant: a colossal armored cybernetic angler shark encased in translucent glacial ice spikes, twin frozen cryo-beam horn cannons on snout, ventral freeze icicle launchers, glowing pale cyan engine core, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Twin snout cryo-beam horns shattered into ice shards.
  - **Frame 1 (Tier 2):** Cryo horns + ventral freeze spike launchers blown off.
  - **Frame 2 (Tier 3):** Horns + ventral spikes + glacial carapace shell shattered open, exposing frozen mechanical skeleton.
  - **Frame 3 (Critical):** Bare robotic shark skeleton with shattered ice plating and smoking coolant leaks.

---

### Biome 6: Magma Vent (Thermal Foundry)

#### 11. Magma Behemoth (Sub-Boss, Level 55)
* **Sprite Key:** `assets/sprites/boss_b6_mid_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b6_mid_0']`):**
  1. `upper_lance`: Upper Thermal Lance (relX: 10, relY: 15, 75x35 px, disables `upper_lance`)
  2. `lower_lance`: Lower Thermal Lance (relX: 10, relY: 80, 75x35 px, disables `lower_lance`)
  3. `basalt_armor`: Obsidian Slag Armor (relX: 45, relY: 25, 75x75 px, disables `armor`)
  4. `magma_forge`: Molten Core Forge (relX: 85, relY: 45, 65x45 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of the Magma Behemoth: a heavy basalt-armored cybernetic crab fortress with upper and lower dual thermal slag lance cannons, glowing molten orange magma conduits, obsidian armor plates, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Upper thermal lance barrel melted and broken off.
  - **Frame 1 (Tier 2):** Upper + lower thermal lances destroyed into slagged stumps.
  - **Frame 2 (Tier 3):** Both lances + obsidian basalt armor plates cracked open, leaking molten lava from internal forge.
  - **Frame 3 (Critical):** Slagged molten chassis with burning core breach and smoking magma exhaust.

---

#### 12. Inferno Dragon (Biome Apex Boss, Level 60)
* **Sprite Key:** `assets/sprites/boss_b6_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b6_0']`):**
  1. `dragon_maw`: Dragon Mouth Plasma Cannon (relX: 10, relY: 40, 70x45 px, disables `dragon_blast`)
  2. `spinal_plates`: Obsidian Spinal Plates (relX: 55, relY: 15, 80x45 px, disables `armor`)
  3. `magma_tail`: Magma Exhaust Tail Rockets (relX: 110, relY: 25, 65x60 px, disables `tail_rockets`)
  4. `inferno_heart`: Inferno Dragon Core (relX: 65, relY: 45, 70x50 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of the Inferno Dragon: an apex biomechanical serpentine magma dragon, black obsidian scales with molten red-hot seams, gaping maw plasma cannon, jagged dorsal magma heat-sinks, rocket thruster tail, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Forward dragon maw cannon shattered with backfiring fire eruptions.
  - **Frame 1 (Tier 2):** Maw cannon + dorsal obsidian spinal heat-sinks blown off.
  - **Frame 2 (Tier 3):** Maw + dorsal spines + tail rocket engines destroyed, exposing white-hot fusion heart.
  - **Frame 3 (Critical):** Scorched skeletal dragon frame, tail blown off, fusion heart on verge of thermal detonation.

---

### Biome 7: Electromagnetic Storm (Ion Tempest)

#### 13. Storm Emperor Cruiser (Sub-Boss, Level 65)
* **Sprite Key:** `assets/sprites/boss_b7_mid_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b7_mid_0']`):**
  1. `port_nacelle`: Port Lightning Nacelle (relX: 45, relY: 10, 75x35 px, disables `port_lightning`)
  2. `starboard_nacelle`: Starboard Lightning Nacelle (relX: 45, relY: 85, 75x35 px, disables `starboard_lightning`)
  3. `tesla_prow`: Forward Tesla Railgun Prow (relX: 10, relY: 45, 70x40 px, disables `tesla_rail`)
  4. `emp_drive`: Storm Emperor EMP Drive (relX: 85, relY: 45, 65x45 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of the Storm Emperor Cruiser: an aerodynamic high-voltage battlecruiser with twin upper and lower lightning capacitor nacelles, a forward tesla arc railgun prow, electric blue and yellow lightning discharges, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Upper lightning nacelle shattered into discharging capacitor coils.
  - **Frame 1 (Tier 2):** Upper + lower lightning nacelles sheared off.
  - **Frame 2 (Tier 3):** Both nacelles + forward tesla prow railgun destroyed, exposing EMP reactor core.
  - **Frame 3 (Critical):** Completely disarmed cruiser hull, electrical fire arcs across bare metal frame.

---

#### 14. Storm-Singer (Biome Apex Boss, Level 70)
* **Sprite Key:** `assets/sprites/boss_b7_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b7_0']`):**
  1. `upper_wing`: Upper Cybernetic Thunder Wing (relX: 45, relY: 10, 85x45 px, disables `upper_arcs`)
  2. `lower_wing`: Lower Cybernetic Thunder Wing (relX: 45, relY: 80, 85x45 px, disables `lower_arcs`)
  3. `triple_ion`: Triple Prow Ion Railguns (relX: 10, relY: 40, 70x45 px, disables `triple_ion`)
  4. `storm_core`: Storm Singularity Reactor (relX: 75, relY: 45, 70x50 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of the Storm-Singer: an immense biomechanical manta ray thunder dreadnought with sweeping upper and lower electric wings, a triple-barrel forward ion prow, pulsating ball-lightning reactor, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Upper thunder wing sheared off with residual arc lightning.
  - **Frame 1 (Tier 2):** Upper + lower thunder wings both destroyed.
  - **Frame 2 (Tier 3):** Both wings + triple ion prow railguns blown off, exposing singularity core.
  - **Frame 3 (Critical):** Wingless smoking manta chassis with unstable ball-lightning core breach.

---

### Biome 8: Precursor Ship Graveyard (Derelict Flotilla)

#### 15. Flagship Hangar (Sub-Boss, Level 75)
* **Sprite Key:** `assets/sprites/boss_b8_mid_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b8_mid_0']`):**
  1. `upper_turret`: Upper Kinetic Flak Battery (relX: 20, relY: 15, 65x35 px, disables `upper_flak`)
  2. `lower_turret`: Lower Kinetic Flak Battery (relX: 20, relY: 80, 65x35 px, disables `lower_flak`)
  3. `drone_hangar`: Automated Drone Flight Deck (relX: 70, relY: 30, 75x65 px, disables `drone_spawns`)
  4. `mainframe`: Flagship Command Mainframe (relX: 110, relY: 45, 60x45 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of the Flagship Hangar: a hollowed-out precursor battlecarrier wreckage section with an open glowing hangar flight deck bay launching combat drones, twin defensive point-defense turrets, rusted gunmetal hull, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Upper flak turret blown off.
  - **Frame 1 (Tier 2):** Upper + lower flak turrets destroyed.
  - **Frame 2 (Tier 3):** Turrets + drone hangar bay collapsed and burning with secondary explosions.
  - **Frame 3 (Critical):** Burning gutted carrier section, mainframe exposed and smoking.

---

#### 16. The Iron Ghost (Biome Apex Boss, Level 80)
* **Sprite Key:** `assets/sprites/boss_b8_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b8_0']`):**
  1. `broadside_prow`: Forward Broadside Railgun (relX: 10, relY: 40, 70x45 px, disables `broadside`)
  2. `upper_tether`: Floating Dorsal Armor Plate (relX: 45, relY: 10, 80x35 px, disables `upper_tether`)
  3. `lower_tether`: Floating Ventral Armor Plate (relX: 45, relY: 85, 80x35 px, disables `lower_tether`)
  4. `phantom_core`: Iron Ghost Emerald Core (relX: 75, relY: 45, 75x50 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of The Iron Ghost: a haunted precursor dreadnought held together by glowing emerald-green tractor beams and gravimetric tethers, heavy broadside prow cannon, magnetically floating armor segments, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Upper floating armor plate tractor tether severed, plate tumbling away.
  - **Frame 1 (Tier 2):** Upper + lower floating armor plates severed and destroyed.
  - **Frame 2 (Tier 3):** Armor plates + forward broadside prow destroyed, tether network collapsing.
  - **Frame 3 (Critical):** Derelict core chassis exposed, emerald gravity field distorting into implosion.

---

### Biome 9: Bio-Organic Core (Hive Nexus)

#### 17. Hive Queen Sub-Core (Sub-Boss, Level 85)
* **Sprite Key:** `assets/sprites/boss_b9_mid_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b9_mid_0']`):**
  1. `brood_sac`: Brood Egg Sac Chamber (relX: 75, relY: 25, 75x65 px, disables `parasite_spawns`)
  2. `upper_acid`: Dorsal Acid Cannon (relX: 15, relY: 15, 70x35 px, disables `upper_acid`)
  3. `lower_acid`: Ventral Acid Cannon (relX: 15, relY: 75, 70x35 px, disables `lower_acid`)
  4. `queen_head`: Brood Queen Carapace (relX: 10, relY: 45, 65x45 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of the Hive Queen Sub-Core: a grotesque biomechanical alien queen torso with a pulsating yellow-green egg sac cluster, twin chitinous acid spitter cannons, chitin armor plating, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Upper acid spitter cannon severed, spewing green ichor.
  - **Frame 1 (Tier 2):** Upper + lower acid cannons destroyed.
  - **Frame 2 (Tier 3):** Acid cannons + pulsating brood egg sac ruptured, leaking bio-slime.
  - **Frame 3 (Critical):** Gutted chitin queen carapace, internal organs and cybernetic spine exposed.

---

#### 18. Hive Mind Overmind (Biome Apex Boss, Level 90)
* **Sprite Key:** `assets/sprites/boss_b9_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b9_0']`):**
  1. `acid_maw`: Bio-Acid Maw Jaws (relX: 10, relY: 40, 70x45 px, disables `acid_maw`)
  2. `dorsal_chitin`: Dorsal Chitin Shield Shell (relX: 45, relY: 15, 85x45 px, disables `armor`)
  3. `nerve_siphon`: Ventral Organ Siphon (relX: 55, relY: 75, 75x45 px, disables `nerve_siphon`)
  4. `brain_core`: Pulsating Synaptic Brain Core (relX: 85, relY: 35, 70x55 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of the Hive Mind Overmind: a colossal bio-cybernetic pulsating neural brain overlord with heavy segmented chitinous shielding, massive mandibles, bio-luminescent yellow-green synaptic tendrils, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Forward bio-acid mandibles shattered and leaking ichor.
  - **Frame 1 (Tier 2):** Mandibles + ventral organ siphons severed into smoking stumps.
  - **Frame 2 (Tier 3):** Mandibles + siphons + dorsal chitin shield cracked open, exposing the pulsating neural brain core.
  - **Frame 3 (Critical):** Exposed bleeding cybernetic brain core sparking with necrotic synaptic discharges.

---

### Biome 10: Chrono Singularity (Paradox Rift)

#### 19. Paradox Singularity Gate (Sub-Boss, Level 95)
* **Sprite Key:** `assets/sprites/boss_b10_mid_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b10_mid_0']`):**
  1. `upper_iris`: Upper Tachyon Emitter Pylon (relX: 15, relY: 20, 65x35 px, disables `upper_tachyon`)
  2. `lower_iris`: Lower Tachyon Emitter Pylon (relX: 15, relY: 75, 65x35 px, disables `lower_tachyon`)
  3. `containment_ring`: Outer Iris Shield Ring (relX: 35, relY: 15, 85x95 px, disables `ring_shield`)
  4. `void_vortex`: Singularity Gate Void Vortex (relX: 65, relY: 40, 70x55 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of the Paradox Singularity Gate: an ancient cosmic circular ring portal with upper and lower tachyon emitter pylons, rotating quantum iris containment shields, glowing rainbow chromatic aberration spacetime rift at center, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Upper tachyon emitter pylon shattered into glitching spatial fragments.
  - **Frame 1 (Tier 2):** Upper + lower tachyon pylons destroyed.
  - **Frame 2 (Tier 3):** Pylons + outer iris containment ring shattered, void vortex expanding uncontrollably.
  - **Frame 3 (Critical):** Ring broken into floating fragments around a destabilized roaring spatial singularity.

---

#### 20. The Primordial Singularity (Final Biome Apex Boss, Level 100)
* **Sprite Key:** `assets/sprites/boss_b10_0.png`
* **Hardpoints (`BOSS_HARDPOINTS_MAP['boss_b10_0']`):**
  1. `singularity_maw`: Singularity Mouth Cannon (relX: 10, relY: 40, 75x45 px, disables `singularity_cannon`)
  2. `aurora_upper`: Upper Cosmic Aurora Fins (relX: 50, relY: 10, 85x45 px, disables `upper_aurora`)
  3. `aurora_lower`: Lower Cosmic Aurora Fins (relX: 50, relY: 75, 85x45 px, disables `lower_aurora`)
  4. `blackhole_core`: Primordial Black Hole Core (relX: 85, relY: 40, 70x55 px, disables `core`)
* **Prompt (Master):**
  > "16-bit pixel art retro arcade shmup boss sprite of The Primordial Singularity: the ultimate transcendent cosmic cyber-deity leviathan, dark matter armor chassis, iridescent cosmic aurora solar wings, gaping event-horizon maw cannon, swirling primordial black hole core with accretion disk, facing left, isolated on a clean, solid, pure plain white background (#FFFFFF) with high contrast sharp silhouette, no ground shadow, no background clutter."
* **Row 2 Progressive Destruction Sequence:**
  - **Frame 0 (Tier 1):** Event-horizon mouth cannon fractured into cosmic energy plumes.
  - **Frame 1 (Tier 2):** Mouth cannon + upper cosmic aurora wing sheared off.
  - **Frame 2 (Tier 3):** Mouth cannon + upper and lower aurora wings destroyed, dark matter chassis cracked open exposing the primordial black hole.
  - **Frame 3 (Critical):** All outer armor disintegrated, bare pulsating event horizon with blinding cosmic gravitational collapse.

---

## 5. Verification Checklist for Worker Threads

Every worker thread completing a boss spritesheet must verify:
1. `python3 scripts/verify_syntax.py` $\to$ **55 / 55 Passed**.
2. Run slicing script: `python3 scripts/slice_and_process_sprites.py assets/sprites/[SPRITE_KEY].png`.
3. Spritesheet registered in `SPRITE_ANIMATIONS` in [`js/sprites.js`](file:///home/ubuntu/work/darius-star/js/sprites.js).
4. Run `node tests/test_spritesheet_manifest.js` $\to$ **All Passed**.
5. Capture Playwright screenshots showing intact, damaged, and death explosion states without ghosting.
