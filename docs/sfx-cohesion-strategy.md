# SFX Cohesion Strategy — Darius Star: Cyber Coelacanth

## The Problem

AI-generated sounds from independent API calls can vary wildly in tone, volume, and character. A laser from one call sounds like an 80s arcade cabinet; an explosion from another sounds like a modern movie. Without cohesion, the game sounds like a random soundboard.

## The Solution: Three-Layer Cohesion

### Layer 1: Prompt Engineering (during generation)

Every single Veo and Lyria prompt shares these "sonic signature" anchor words:

```
"16-bit Sega Genesis style"  → defines the sound chip palette
"retro arcade"               → narrows to classic arcade cabinet timbre
"short and impactful"        → prevents long reverb tails (space has no reverb!)
"transparent background"     → ensures clean extraction
```

**Genre anchor words used in every prompt:**
- "16-bit pixel art" (visual)
- "Sega Genesis" or "retro arcade" (audio palette)
- "instrumental" (no vocals)
- Descriptive of the specific timbre: "crisp", "bassy thud", "metallic", "electrical"

This means: ALL sounds live in the same sonic universe — a 1990s Sega Genesis cartridge running on arcade hardware.

### Layer 2: Post-Processing Pipeline (after generation)

```python
# sfx_postprocess.py — run after all SFX generated
for audio_file in all_sfx:
    apply_chain(audio_file, [
        highpass_filter(80Hz),      # Remove sub-bass rumble (space = no low end)
        peak_limiter(-3dB),          # Consistent loudness ceiling
        normalize_to(-16 LUFS),      # Gaming standard loudness
        fade_out(5ms),              # Prevent click at end of short SFX
    ])
```

**Why these settings:**
- **Highpass at 80Hz**: Retro chip sounds have no sub-bass. Clean cut below 80Hz makes everything sound more "16-bit."
- **Peak limit at -3dB**: Prevents clipping when multiple SFX play simultaneously
- **-16 LUFS**: Standard for mobile/web games. Loud enough to hear, quiet enough to layer
- **5ms fade**: Prevents digital clicks on short samples that end abruptly

### Layer 3: In-Game Mixing (runtime)

```javascript
// AudioManager in index.html
const sfxVolume = 0.7;      // SFX: 70%
const musicVolume = 0.4;    // Music: 40%
const ambientVolume = 0.15; // Ambient layers: 15% (barely there)

// Priority ducking: when important SFX plays, dip music 3dB
sfxBus.connect(ducker).connect(masterOut);
musicBus.connect(ducker.sidechain).connect(masterOut);
```

## The "Sega Genesis Sound Chip" Palette

All sounds target this frequency profile:

| Range | Character | Used For |
|-------|-----------|----------|
| 80-250 Hz | Warm thud, no rumble | Explosions, impacts |
| 250-800 Hz | Mids — body of the sound | Lasers, engine hum |
| 800-3kHz | Presence — cuts through | Pew-pew, alerts, sirens |
| 3-8kHz | Brightness — chip character | Power-ups, chimes, UI |
| 8kHz+ | Air — subtle sparkle | Ambient layers only |

**What to avoid:**
- Deep sub-bass below 60Hz (not period-appropriate for 16-bit era)
- Long reverb tails (there's no "room" in space)
- Modern cinematic "braaam" sounds (wrong era)
- Hyper-realistic Foley (footsteps, cloth rustle — not applicable)

## Prompt Consistency Checklist

Before generating any new SFX, verify the prompt includes:
- [ ] "16-bit pixel art" or "16-bit style"
- [ ] "retro arcade" or "Sega Genesis" 
- [ ] Specific timbre description ("crisp", "metallic", "synth", "chiptune")
- [ ] Duration (0.5s, 1s, 2s)
- [ ] "transparent background"
- [ ] NO mention of: "orchestral", "cinematic", "realistic", "3D", "photorealistic"

## Batch Generation Order

For best cohesion, generate in this order:
1. **Reference sounds first**: laser_l1, explosion_small, powerup_weapon
2. **Variants second**: laser_l3, laser_l5, explosion variants
3. **Unique sounds last**: boss, environmental, UI

This way, if the model's style drifts, the core sounds stay consistent.
