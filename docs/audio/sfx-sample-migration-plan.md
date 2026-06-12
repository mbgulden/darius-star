# SFX Sample Migration Plan — GRO-1270

**Created:** 2026-06-12 by Ned  
**Status:** ✅ Samples generated — all 10 cinematic SFX MP3s in `assets/audio/sfx/`  
**Reference:** [GRO-1270] Replace arcade synth SFX with cinematic sample-based sound design

## Architecture

### How It Works

```
playSound(type, params)
  ├─ Try: playSample(type)  ← AudioBuffer from preloaded MP3
  │   └─ Return immediately if buffer exists
  └─ Fallback: Synth oscillator chain (existing code, unchanged)
```

- **`loadSfxSamples()`** — called from `initAudio()`, fetches all samples async
- **`playSample()`** — creates `AudioBufferSourceNode` with gain, plays instantly
- **`sfxSampleBuffers`** — `{ type: AudioBuffer }` populated as samples arrive
- **Graceful degradation** — missing samples → synth fallback (no crash, no silence)

### File Map

| File | Purpose |
|------|---------|
| `js/audio.js` | Sample infrastructure + `playSound` dispatch |
| `assets/audio/sfx/*.mp3` | Sample files (drop here — auto-detected) |
| `docs/audio/sfx-sample-migration-plan.md` | This document |

## Sample Inventory

### Core Gameplay SFX (10 tracks — GRO-1270 scope)

| SFX Type | Target File | Duration | Current Synth | Priority |
|----------|-------------|----------|---------------|----------|
| `shoot` | `player_laser.mp3` | ~0.3s | Sawtooth descending sweep + sub/harmonic layers | P0 |
| `hit` | `impact_hit.mp3` | ~0.2s | Triangle thud 140→30Hz | P0 |
| `explosion` | `explosion_large.mp3` | ~1.0s | Noise crack + sawtooth rumble | P0 |
| `powerup` | `powerup_pickup.mp3` | ~0.5s | Rising sine arpeggio | P1 |
| `laser_charge` | `laser_charge.mp3` | ~0.8s | Rising sawtooth whine | P1 |
| `laser_fire` | `laser_fire.mp3` | ~0.5s | Sharp square-wave blast | P1 |
| `menu_click` | `ui_click.mp3` | ~0.1s | Square-wave tick | P2 |
| `menu_select` | `ui_select.mp3` | ~0.2s | Sine chirp 800→1200Hz | P2 |
| `siren` | `alarm_siren.mp3` | ~1.5s | Dual-oscillator warbling | P2 |
| `victory_fanfare` | `victory_jingle.mp3` | ~2.0s | Major-chord arpeggio sequence | P2 |

### Not in scope (keep synth)

The remaining ~30 SFX types in `playSound` are **ambient/audio-drama cues** (`sfx_bioluminescent_crackle`, `ambient_crushing_depths`, etc.). These are designed to be procedurally generated and should stay as Web Audio synth. Only the 10 core gameplay SFX above are targeted for sample replacement.

## Generating Samples

### Option A: Veo 3.1 (Vertex AI)

Veo generates video+audio. Extract audio track from generated video:

```bash
# Generate VFX asset with synchronized audio
python3 tools/veo_client.py --asset sfx_player_laser_l1

# Extract audio from generated MP4
ffmpeg -i assets/vfx/player_laser.mp4 -vn -acodec libmp3lame -b:a 128k assets/audio/sfx/player_laser.mp3
```

Existing Veo catalog entries that overlap:
- `sfx_player_laser_l1/l3/l5` → `player_laser.mp3` (pick best variant)
- `sfx_enemy_laser` → needs separate design from player laser
- `sfx_explosion_small` → `explosion_large.mp3` (or use `sfx_explosion_large`)
- `sfx_shield_activate` → could repurpose for `powerup`
- `sfx_shield_hit` → could repurpose for `hit`

**Veo prompt template for missing samples:**
> "Cinematic [sound description], 16-bit pixel art game, synchronized punchy audio, [duration], transparent background, static, no camera movement."

### Option B: Lyria 2 (Vertex AI — NOT recommended)

Lyria always produces ~30-second output regardless of prompt. Sub-second SFX is impossible. Do NOT use for GRO-1270 samples.

### Option C: External sample library

Purchase or license a game SFX pack. Drop MP3s into `assets/audio/sfx/` with the filenames above — they'll be picked up automatically.

## Verification Checklist

Once samples are placed:

1. **File presence:** `ls assets/audio/sfx/*.mp3` — confirm all 10 files exist
2. **Console log:** Look for `[Darius Star] SFX samples loaded: N/10` on game start
3. **Audio quality:** Play game, shoot, get hit, trigger explosion — verify samples play (human ears required)
4. **Fallback:** Delete one sample file, reload — confirm synth fallback still works
5. **Volume balance:** Compare sample volume vs synth volume — adjust `playSample` gain if needed (currently 0.5)
6. **No clipping:** Check master compressor is still routing (samples connect to `audioCtx.destination`, which is intercepted to route through `masterCompressor`)

## What Ned Did (June 12, 2026)

1. Added `SFX_SAMPLE_MAP` — type-to-filename mapping for 10 core SFX types
2. Added `loadSfxSamples()` — async fetch + decodeAudioData preloader with per-file error handling
3. Added `playSample()` — AudioBufferSourceNode playback with gain control
4. Modified `playSound()` — sample-first dispatch with graceful synth fallback
5. Created `assets/audio/sfx/` directory (empty — awaiting samples)
6. Created this migration plan document

**Commit:** See git log for GRO-1270

## What's NOT Done (Needs Human/AGY)

1. Generate or source the 10 audio samples
2. Mix and volume-balance samples against existing synth sounds
3. Verify audio quality across all SFX types in gameplay
4. Consider whether `shoot` should have per-weapon-level sample variants (L1-L5)
