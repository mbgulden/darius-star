# Explosion Taxonomy — Darius Star: Cyber Coelacanth

> **Status:** Design Document | **Author:** Ned (autonomous) | **Date:** 2026-06-09
> **Scope:** Complete explosion variety system covering all weapon impacts, enemy deaths, and boss hits.

---

## Design Philosophy

Every weapon impact, enemy death, and boss hit needs **unique, satisfying visual + audio feedback**. Players should FEEL the difference between a popgun L1 shot and a fully-charged L5 blast. Variation within the same firepower level prevents visual fatigue — no two explosions should look identical even at the same power tier.

**Core principles:**
- **Readability**: Explosion type communicates what died and how powerful the kill was
- **Satisfaction**: Bigger explosions = bigger dopamine. Chain reactions multiply this
- **Variation**: 3-5 visual variants per explosion type, selected randomly with weighted distribution
- **Audio coupling**: Every visual type has a matched sound signature from the Sega Genesis palette
- **Performance**: All sprites are 1024×1024 PNGs with transparent backgrounds, rendered via sprite sheet animation

---

## 1. Energy Blasts

Clean energy discharges. No debris. Pure neon plasma — the bread-and-butter of shmup combat. These are the fastest to render (no physics, no particles).

### 1.1 Small Pop (L1 — Weakest)

**Trigger:** L1 weapon hit on scouts, popcorn enemies, destroyable projectiles

| Variant | Visual Description | Frame Count | Duration | Audio |
|---------|-------------------|-------------|----------|-------|
| **Variant A: Cyan Pop** | Small cyan (#00FFFF) sphere, bright center, soft halo, rapid expand-and-fade | 8 frames | ~200ms | Short crisp burst (Yamaha YM2612 sine blip) |
| **Variant B: Neon Flash** | Quick pink (#FF0055) starburst, 4-point star shape, instant flash | 6 frames | ~150ms | High-pitched FM "ping" |
| **Variant C: Ring Pop** | Tiny orange (#FF5500) ring that expands once and dissolves | 8 frames | ~200ms | Soft low-pass thud |

**Random selection:** A=50%, B=30%, C=20%

**Usage:** Scout deaths, interceptor light hits, enemy bullet destruction

### 1.2 Medium Burst (L3 — Mid)

**Trigger:** L3 weapon hit on interceptors, heavies (light damage), scout critical hits

| Variant | Visual Description | Frame Count | Duration | Audio |
|---------|-------------------|-------------|----------|-------|
| **Variant A: Plasma Burst** | Purple (#8B00FF) plasma sphere, layered rings expanding outward, white-hot core | 12 frames | ~300ms | FM synthesis "bwaaam" — Genesis bass hit |
| **Variant B: Dual Ring** | Inner cyan ring + outer orange ring, expanding at different speeds, interference pattern at overlap | 14 frames | ~350ms | Dual-tone chord blast |
| **Variant C: Staccato Flash** | Rapid 3-pulse pink starburst, each pulse smaller than the last | 10 frames (3 sub-animations) | ~250ms | Three rapid FM stabs |

**Random selection:** A=40%, B=35%, C=25%

**Usage:** Interceptor deaths, heavy ship light damage, boss armor hits

### 1.3 Large Detonation (L5 — Strongest)

**Trigger:** L5 weapon hit on heavies, boss weak-point hits, miniboss deaths

| Variant | Visual Description | Frame Count | Duration | Audio |
|---------|-------------------|-------------|----------|-------|
| **Variant A: Supernova** | White-hot core expanding into layered cyan/purple/pink rings, pixel-perfect bloom, lingering afterglow | 20 frames | ~500ms | Deep bass explosion + high-end shimmer (YM2612 + PSG noise channel) |
| **Variant B: Cross Blast** | Four directional energy beams (cardinal) with expanding ring, beam tips spark with orange | 18 frames | ~450ms | Directional stereo "whoosh" into bass hit |
| **Variant C: Implosion-Flash** | Brief inward collapse (2 frames) → massive outward flash → fading ring | 16 frames | ~400ms | Sharp "crack" into long bass decay |
| **Variant D: Spiral Detonation** | Energy spiral unwinding from center, cyan-to-purple gradient, trailing particles | 22 frames | ~550ms | Rising FM tone into crash |

**Random selection:** A=30%, B=25%, C=25%, D=20%

**Usage:** Heavy ship destruction, boss phase transitions, miniboss kills

### 1.4 Enemy Discharge (Death Animation)

**Trigger:** Any enemy reaching 0 HP — plays their unique death explosion

| Enemy Type | Death Explosion Type | Notes |
|-----------|---------------------|-------|
| Scout (small robotic fish) | Small Pop — Variant A | Clean, quick, satisfying |
| Interceptor (mechanical jellyfish) | Medium Burst — Variant B | Tentacle fragments fly outward |
| Heavy (robotic eel) | Large Detonation — Variant A | Segmented body breaks apart sequentially |
| Boss Minion (drone) | Small Pop — Variant C | Green (#33CC55) tinted, matching their core color |
| Surprise Unit (biome-unique) | Medium Burst — Variant A | Each biome's surprise unit gets a unique color tint matching their palette |

---

## 2. Shockwaves

Expanding energy rings and pulses. No debris, no fire — pure kinetic force visualization. Used for area attacks, boss mechanics, and environmental hazards.

### 2.1 Expanding Ring

**Trigger:** Boss radial attacks, charged enemy attacks, mine detonation

| Variant | Visual Description | Frame Count | Duration | Audio |
|---------|-------------------|-------------|----------|-------|
| **Variant A: Cyan Ring** | Thin cyan ring expanding from center, bright edge, transparent interior, fade over distance | 16 frames | ~400ms | Rising FM sweep + noise channel hiss |
| **Variant B: Pulse Train** | Three concentric rings fired in rapid succession, each slightly larger | 20 frames (3 sub-animations) | ~500ms | Three descending FM tones |
| **Variant C: Hex Grid** | Hexagonal grid pattern expanding outward (cyberpunk theme), node points glow purple | 18 frames | ~450ms | Digital "bzzt" with metallic resonance |

**Random selection:** A=45%, B=30%, C=25%

### 2.2 Ground-Pound

**Trigger:** Boss slams, heavy enemy landing, stage hazard activation

| Variant | Visual Description | Frame Count | Duration | Audio |
|---------|-------------------|-------------|----------|-------|
| **Variant A: Impact Ring** | Thick orange ring at ground level, expanding horizontally, dust particles kicked up at edges | 14 frames | ~350ms | Deep bass "thud" + noise channel rumble |
| **Variant B: Cracks + Ring** | Purple energy cracks spiderwebbing from impact point + expanding ring | 18 frames | ~450ms | Metallic "crunch" into ring expansion |
| **Variant C: Ripple** | Multiple thin concentric ripples (like water), cyan colored, fast propagation | 12 frames | ~300ms | Quick FM descending glissando |

**Random selection:** A=40%, B=35%, C=25%

### 2.3 Screen-Filling Blast Wave

**Trigger:** Boss ultimate attack, stage transition, super weapon activation

| Variant | Visual Description | Frame Count | Duration | Audio |
|---------|-------------------|-------------|----------|-------|
| **Full-Screen Wave** | Massive energy wave traveling from left to right (or center outward), layered cyan/purple/pink bands, screen flash white at peak, trailing particle wake | 24 frames | ~600ms | Maximum Genesis: layered FM bass + PSG noise + PCM sample hit |

**Notes:** This is a one-of — no variants needed. It's the game's biggest spectacle moment. Reserve for boss desperation attacks and level-ending sequences.

### 2.4 EMP Pulse

**Trigger:** EMP weapon, boss electric attack, stage hazard (electric fields)

| Variant | Visual Description | Frame Count | Duration | Audio |
|---------|-------------------|-------------|----------|-------|
| **Variant A: Electric Sphere** | Blue-white electrical sphere, arcing lightning bolts to nearby surfaces, rapid flicker | 16 frames | ~400ms | Harsh noise-channel static burst |
| **Variant B: Data Corruption** | Green-on-black grid glitch effect, horizontal scan lines, pixel displacement | 14 frames | ~350ms | Digital glitch stutter (FM noise + PSG) |

**Random selection:** A=60%, B=40%

---

## 3. Missile / Rocket

Projectile-based explosions with directional trails and multi-stage detonations. Distinct from energy blasts — these have physicality (trails, smoke, delayed detonation).

### 3.1 Small Missile Pop

**Trigger:** L1-L2 missile impact, weak rocket hit

| Variant | Visual Description | Frame Count | Duration | Audio |
|---------|-------------------|-------------|----------|-------|
| **Variant A: Fireball Pop** | Small orange fireball, brief smoke puff, quick fade | 10 frames | ~250ms | Short explosion + noise decay |
| **Variant B: Spark Burst** | Directional spark cone (away from impact), metallic glint | 8 frames | ~200ms | Metallic "ping" + spark hiss |
| **Variant C: Fire Ring** | Tiny fire ring expanding once, orange-to-yellow gradient | 10 frames | ~250ms | Quick "fwoom" |

**Random selection:** A=40%, B=30%, C=30%

### 3.2 Medium Missile Blast

**Trigger:** L3 missile hit, rocket pod impact

| Variant | Visual Description | Frame Count | Duration | Audio |
|---------|-------------------|-------------|----------|-------|
| **Variant A: Fireball + Ring** | Central orange fireball + expanding smoke ring, debris particles at edges | 14 frames | ~350ms | Layered explosion: bass + crackle |
| **Variant B: Fuel-Air Burst** | Wide flat orange blast (horizontal spread), secondary white flash | 16 frames | ~400ms | Deep "whump" — fuel-air explosion |
| **Variant C: Shrapnel Blast** | Red-orange burst with metallic fragments, angular debris shapes | 14 frames | ~350ms | Explosion + metallic pings (3-5 random) |

**Random selection:** A=35%, B=35%, C=30%

### 3.3 Large Multi-Stage

**Trigger:** L5 missile, boss-targeted warhead, special weapon

| Variant | Visual Description | Frame Count | Duration | Audio |
|---------|-------------------|-------------|----------|-------|
| **Variant A: Two-Stage** | Stage 1: Initial fireball. Stage 2: Larger secondary detonation after 100ms delay. Smoke pillar rises | 22 frames (both stages) | ~550ms | Two explosions: initial hit + larger secondary |
| **Variant B: Implosion** | Brief inward suck (3 frames) → massive fireball outward → smoke ring → lingering flame licks | 24 frames | ~600ms | Suction whoosh → massive explosion → long decay |
| **Variant C: Airburst** | Detonation above target, downward cone of fire + shockwave, ground scorch mark | 20 frames | ~500ms | High-pitched whistle → explosion → bass rumble |

**Random selection:** A=35%, B=35%, C=30%

### 3.4 Cluster Chain

**Trigger:** Cluster missile weapon, minefield detonation, chain-reaction explosions

| Variant | Visual Description | Frame Count | Duration | Audio |
|---------|-------------------|-------------|----------|-------|
| **Cluster Chain** | 3-6 small fireball pops in rapid sequence (40ms apart), cascading across the blast zone, overlapping smoke clouds | 18-24 frames (depends on cluster count) | ~500-700ms | Rapid fire: pop-pop-pop-pop (PSG noise channel stutter) |

**Notes:** Single variant — the randomness comes from cluster count and spread pattern, not visual style. Each sub-explosion uses Small Missile Pop Variant A tinted slightly differently.

---

## 4. Debris

Physical fragmentation. Unlike energy blasts (clean) and missiles (fire), debris adds materiality — shattered metal, broken machinery, cracked hulls. Key for making heavy enemies feel HEAVY.

### 4.1 Small Fragment Burst

**Trigger:** Light enemy destruction with debris, destructible terrain, container destruction

| Variant | Visual Description | Frame Count | Duration | Audio |
|---------|-------------------|-------------|----------|-------|
| **Variant A: Metal Fragments** | 4-6 small angular metal pieces (silver/grey) flying outward, tumbling, fading | 12 frames | ~300ms | Sharp metallic "clink" + debris scatter |
| **Variant B: Glass Shatter** | 8-12 transparent shards (cyan-tinted), radial spread, each shard rotates independently | 14 frames | ~350ms | Glass shatter effect (FM high-end + noise) |
| **Variant C: Spark Burst** | 10-15 tiny orange sparks in random directions, quick fade, no gravity (zero-G) | 10 frames | ~250ms | Hiss + multiple tiny metallic pings |

**Random selection:** A=45%, B=30%, C=25%

### 4.2 Medium Debris Field

**Trigger:** Interceptor death (debris variant), heavy enemy moderate damage, container explosion

| Variant | Visual Description | Frame Count | Duration | Audio |
|---------|-------------------|-------------|----------|-------|
| **Variant A: Hull Breach** | 8-10 armor plates tearing away, purple circuitry exposed underneath, electrical arcing | 16 frames | ~400ms | Metal tear + electrical crackle + bass thud |
| **Variant B: Machinery Burst** | Gears, pistons, and biomechanical parts ejecting, green fluid spray (bioluminescent coolant) | 18 frames | ~450ms | Mechanical grind + fluid spray + structural collapse |
| **Variant C: Panel Explosion** | Symmetrical panel blowout (4-6 panels), each panel trails smoke, central flame burst | 16 frames | ~400ms | Panel rupture + fire + metal clatter |

**Random selection:** A=35%, B=35%, C=30%

### 4.3 Heavy Wreckage

**Trigger:** Heavy enemy destruction, miniboss death, boss phase transition (armor break)

| Variant | Visual Description | Frame Count | Duration | Audio |
|---------|-------------------|-------------|----------|-------|
| **Variant A: Catastrophic Breach** | 12-16 large hull sections breaking apart, secondary internal explosions at fracture points, purple energy venting | 22 frames | ~550ms | Massive structural groan → multiple explosions → debris rain |
| **Variant B: Meltdown** | Hull superheating to white, sagging/melting (3 frames), then bursting outward as molten slag, orange-to-red cooling gradient | 24 frames | ~600ms | Rising heat whine → molten burst → sizzle and crack |
| **Variant C: Chain Failure** | Sequential failures: front section → middle → rear (50ms apart), each section's explosion bigger than the last | 20 frames | ~500ms | Pop-pop-BOOM sequence — escalating intensity |

**Random selection:** A=40%, B=30%, C=30%

### 4.4 Catastrophic Disassembly (Boss Death)

**Trigger:** Final boss kill — the game's biggest spectacle after the ending sequence

**This is a scripted sequence, not a random selection:**

| Phase | Visual | Duration | Audio |
|-------|--------|----------|-------|
| **Phase 1: Critical Hit** | Boss freezes, red optic flickers erratically, energy arcing across hull | ~500ms | Alarms, klaxons, electrical overload |
| **Phase 2: Chain Detonation** | Sequential explosions along the boss's body (head → mid → tail), each larger than the last | ~800ms | Escalating bass explosions in sequence |
| **Phase 3: Core Breach** | Central core glows white-hot, screen flashes, massive energy release | ~400ms | Rising FM tone → massive detonation |
| **Phase 4: Disassembly** | 20+ debris pieces flying in all directions, lingering smoke, secondary small explosions on debris | ~1000ms | Debris rain, distant explosions, fading rumble |
| **Phase 5: Aftermath** | Drifting wreckage field, fading embers, score tally appears | Persistent (until transition) | Ambient debris + score tally SFX |

**Total sequence duration:** ~2.7 seconds (score tally afterward)

---

## 5. Variation System

### 5.1 Per-Firepower Variant Pool

| Firepower Level | Explosion Type | Variant Count | Selection Method |
|----------------|---------------|---------------|------------------|
| L1 | Small Pop / Small Missile Pop / Small Fragment Burst | 3 variants each | Uniform random per explosion |
| L2 | L1 pool + 20% chance of L3 variant | 3 + 1 rare | Weighted: 80% L1 / 20% L3 |
| L3 | Medium Burst / Medium Missile Blast / Medium Debris Field | 3 variants each | Uniform random per explosion |
| L4 | L3 pool + 25% chance of L5 variant | 3 + 1 rare | Weighted: 75% L3 / 25% L5 |
| L5 | Large Detonation / Large Multi-Stage / Heavy Wreckage | 3-4 variants each | Uniform random per explosion |

### 5.2 Critical Hit System (Rare Variant)

A **5% chance** on any hit to trigger a "Critical Hit" — an enhanced variant of the current explosion type:

| Base Explosion | Critical Variant | Visual Enhancement |
|---------------|-----------------|-------------------|
| Small Pop | **Critical Pop** | 2× size, screen flash (10% opacity white, 100ms) |
| Medium Burst | **Critical Burst** | Additional ring layer, spark particles, screen shake (3px, 150ms) |
| Large Detonation | **Critical Detonation** | 3× size, full-screen white flash, lingering afterimage, heavy screen shake (8px, 300ms) |
| Any Missile | **Critical Missile** | Double blast (two simultaneous fireballs), extra smoke trail |
| Any Shockwave | **Critical Shockwave** | Double ring (ring + echo ring 50ms behind), slow-motion effect on ring (bullet time for 200ms) |
| Any Debris | **Critical Debris** | 2× debris count, pieces glow orange (superheated), bouncing debris physics |

### 5.3 Anti-Repetition Rule

No identical variant plays twice in a row for the same explosion type. Track the last variant used and re-roll if the same one comes up.

```javascript
const lastVariant = {};
function getVariant(explosionType) {
    const pool = VARIANT_POOLS[explosionType];
    let pick;
    do {
        pick = pool[Math.floor(Math.random() * pool.length)];
    } while (pick === lastVariant[explosionType] && pool.length > 1);
    lastVariant[explosionType] = pick;
    return pick;
}
```

---

## 6. Color Palette Quick Reference

All explosions live within the unified Darius Star palette:

| Color | Hex | Usage |
|-------|-----|-------|
| Cyan | `#00FFFF` | Player energy, plasma, shields, small pops |
| Purple | `#8B00FF` | Heavy energy, arcane blasts, medium bursts |
| Pink | `#FF0055` | Critical hits, enemy energy, interceptors |
| Orange | `#FF5500` | Fire, missiles, shockwaves, debris |
| Red | `#FF3333` | Enemy projectiles, boss rage, heavy explosions |
| Green | `#33CC55` | Bioluminescent, coolant, boss minions |
| White | `#FFFFFF` | Core flashes, maximum intensity, supernova |
| Gold | `#FFD700` | Critical hit accents, rare variant highlights |

---

## 7. Implementation Checklist

- [ ] Create sprite sheets for all explosion variants (10-12 sheets total)
- [ ] Define animation frame data in `sprites.json`
- [ ] Implement `ExplosionManager` class with variant pools and anti-repetition logic
- [ ] Generate/assign audio files for each type (Lyria: Sega Genesis palette)
- [ ] Wire up explosion type → enemy death mapping in enemy config
- [ ] Implement critical hit system (5% chance, enhanced variant)
- [ ] Add screen shake integration for heavy/critical explosions
- [ ] Performance test: max simultaneous explosions on target hardware

---

## 8. Asset Inventory Summary

| Category | Sub-Type | Variants | Total Unique Sprites |
|----------|---------|----------|---------------------|
| Energy Blasts | Small Pop | 3 | 3 sheets × 8 frames avg = 24 frames |
| Energy Blasts | Medium Burst | 3 | 3 sheets × 12 frames avg = 36 frames |
| Energy Blasts | Large Detonation | 4 | 4 sheets × 20 frames avg = 80 frames |
| Shockwaves | Expanding Ring | 3 | 3 sheets × 16 frames avg = 48 frames |
| Shockwaves | Ground-Pound | 3 | 3 sheets × 14 frames avg = 42 frames |
| Shockwaves | Screen-Filling Wave | 1 | 1 sheet × 24 frames = 24 frames |
| Shockwaves | EMP Pulse | 2 | 2 sheets × 16 frames avg = 32 frames |
| Missiles | Small Pop | 3 | 3 sheets × 10 frames avg = 30 frames |
| Missiles | Medium Blast | 3 | 3 sheets × 14 frames avg = 42 frames |
| Missiles | Large Multi-Stage | 3 | 3 sheets × 22 frames avg = 66 frames |
| Missiles | Cluster Chain | 1 | 1 sheet × 18 frames = 18 frames |
| Debris | Small Fragment | 3 | 3 sheets × 12 frames avg = 36 frames |
| Debris | Medium Field | 3 | 3 sheets × 16 frames avg = 48 frames |
| Debris | Heavy Wreckage | 3 | 3 sheets × 22 frames avg = 66 frames |
| Debris | Catastrophic (Boss) | 1 | 1 sheet × 30 frames = 30 frames |
| **TOTAL** | | **42 variants** | **~622 frames** |

---

*Next action: Create sprite generation prompts for each variant type, then batch-generate via Imagen.*
