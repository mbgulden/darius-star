---
type: Reference
title: "Darius Star — Voice Asset Registry & Audio File Locations"
description: "Authoritative reference for all 937 active voice lines, directory structure, acoustic DSP profiles, manifest schema, and audio asset locations across the codebase."
resource: okf/storyline/voice-asset-registry-and-locations.md
tags: [darius-star, voice-pipeline, audio, okf, documentation, assets]
timestamp: 2026-08-31T08:28:45Z
linear_issue: null
git_repo: mbgulden/darius-star
git_path: okf/storyline/voice-asset-registry-and-locations.md
last_verified: 2026-08-31
verified_by: fred
status: current
---

# Darius Star — Voice Asset Registry & Locations
## Authoritative Audio Asset Manifest and Directory Reference
### 10-Biome Narrative Voice Acting Suite | 937 Active Voice Lines

---

## 1. Executive Summary

Every piece of dialogue, mission briefing, tactical alert, wingman banter, and narrative branch in **Darius Star: Cyber Coelacanth** is backed by studio-mastered neural voice acting. 

- **Total Active Registered Voice Lines**: **937 lines**
- **Total Physical Audio Files in Voice Library**: **1,739 files** (`.mp3` and `.ogg`)
- **Acoustic Standards**: 48kHz / 44.1kHz, 16-bit, broadcast-normalized, processed with character-specific DSP acoustic chains, cockpit VHF radio bandpass filters, NASA intro chirps, and roger squelch tails.
- **Runtime Engine**: Decoded directly via Web Audio API (`AudioContext.decodeAudioData`) through `js/voice_pipeline.js` and cached in memory for zero-latency in-game playback.

---

## 2. Canonical Manifest Registry

The ground-truth JSON manifest mapping all in-game dialogue strings to audio files is located at:
```
assets/audio/voice_manifest.json
```

### Manifest Schema
```json
{
  "version": "2.0",
  "generatedWith": "Edge-TTS + FFmpeg DSP Mastering",
  "characters": {
    "darius": {
      "name": "Darius Star",
      "callsign": "Scrapper / Starfish",
      "voice": "en-US-ChristopherNeural",
      "pitch": "-4Hz",
      "rate": "+5%"
    },
    "lyra": {
      "name": "Lyra Star",
      "callsign": "Navigator",
      "voice": "en-US-AnaNeural",
      "pitch": "-2Hz",
      "rate": "+2%"
    },
    "thorne": {
      "name": "Commander Jack Thorne",
      "callsign": "Mission Control",
      "voice": "en-US-BrianNeural",
      "pitch": "-6Hz",
      "rate": "-2%"
    },
    "naya": {
      "name": "Naya",
      "callsign": "Tactical Pilot",
      "voice": "en-US-AvaNeural",
      "pitch": "+1Hz",
      "rate": "+9%"
    },
    "cross": {
      "name": "Valera Cross",
      "callsign": "Navy Special Ops",
      "voice": "en-US-EricNeural",
      "pitch": "-5Hz",
      "rate": "-4%"
    },
    "selene": {
      "name": "Selene",
      "callsign": "Haven-7 Base Command",
      "voice": "en-US-JennyNeural",
      "pitch": "+0Hz",
      "rate": "+1%"
    },
    "architect": {
      "name": "The Architect",
      "callsign": "Precursor Frequency",
      "voice": "en-GB-ThomasNeural",
      "pitch": "-8Hz",
      "rate": "-16%"
    }
  },
  "lines": {
    "<line_id>": {
      "id": "<line_id>",
      "speaker": "<character_key>",
      "file": "<character_folder>/<filename>.mp3",
      "text": "<full_dialogue_text>",
      "duration": <seconds_float>,
      "biome": <biome_number_or_null>,
      "level": <level_number_or_null>
    }
  }
}
```

---

## 3. Directory Structure & File Locations

All runtime character voice files reside under:
```
assets/audio/voice/
```

### Character Subdirectories

| Directory | Role / Speaker | File Count | Line Types Included |
|---|---|:---:|---|
| `assets/audio/voice/darius/` | Darius Star | **298** | 100 Sector intros, combat logs, prototype dialogue branches (`dialogue_scenes_*`), story decisions, sacrifice & transcendence endings, boss taunts. |
| `assets/audio/voice/thorne/` | Commander Jack Thorne | **248** | Mission Control tactical briefings (`briefing_b1`–`b10`), thermal warnings, sector hazard intel, solo & co-op pre-flight checks, wingman support. |
| `assets/audio/voice/lyra/` | Lyra Star | **115** | Child psychic navigator routes, coral/vent sequence instructions, Dreamer-matter cavity detection, boss awareness callouts, coma recovery. |
| `assets/audio/voice/naya/` | Naya (Tactical Pilot) | **104** | Warden combat support, scrap collection milestones, legendary essence alerts, military formation callouts. |
| `assets/audio/voice/cross/` | Valera Cross (Navy Ops) | **78** | Intercept warnings, ambush sequences, squadron combat calls, defection banter. |
| `assets/audio/voice/selene/` | Selene (Haven-7 Command) | **68** | Station telemetry logs, xenology surveys, atmospheric breach warnings, psychic attunement guidance. |
| `assets/audio/voice/architect/` | The Architect | **26** | Precursor frequency broadcasts, singularity collapse monologues, timeless cosmic horror dialogues. |
| `assets/audio/voice/` (Root) | Multi-Character Legacy | **802** | OGG fallback files for stratum triggers (`b1_level_start_*`, `b1_boss_entrance_*`), multiplayer join/leave events. |

---

## 4. Other Voice & Audio Asset Locations

In addition to the primary runtime `assets/audio/voice/` directory, audio assets exist in the following dedicated locations:

### 1. Comms Squelch & Radio Telemetry SFX
```
assets/audio/sfx/comms/
```
- `radio_intro_chirp.wav`: 48kHz NASA/Aviation radio opening burst (2.8kHz tone + pink noise, 0.06s).
- `radio_outro_squelch.wav`: 48kHz VHF roger beep & squelch tail (2.475kHz -> 1.85kHz dual tone + decay noise, 0.12s).

### 2. Showcase & Trailer Voice Lines
```
assets/showcase/voice/
```
- Showcase audio cuts used for promotional materials, game design document audio teasers, and external pitch reels.

### 3. Audio Preview Staging
```
assets/preview/audio/
```
- Pre-release audio clips and prototype synthesis passes used for testing DSP variations.

### 4. Gameplay Sound Effects (Sample-Based Audio Engine)
```
assets/audio/sfx/
```
- `player_laser.mp3`: Primary weapon fire.
- `impact_hit.mp3`: Hull and armor hit impact.
- `explosion_large.mp3`: Enemy and boss destruction shockwave.
- `powerup_pickup.mp3`: Weapon powerup collection.
- `ui_click.mp3` / `ui_select.mp3`: Menu navigation & non-blocking radio clicks.
- `alarm_siren.mp3`: Low health and proximity warning siren.
- `victory_jingle.mp3`: Sector complete fanfare.
- `shield_hit.mp3`: Deflector shield absorption.

### 5. Ambient Environmental Soundtracks
```
assets/audio/
```
- `ambient_abyssal_trench.mp3`: Biome 1 abyssal drone soundtrack.
- `ambient_coral_graveyard.mp3`: Biome 2 sunken reef soundtrack.
- Additional biome atmospheric loops streamed via `js/audio_manager.js`.

---

## 5. Character Acoustic DSP Profiles & Mastering Specs

All voice lines are mastered with custom acoustic signal chains using FFmpeg:

```
                          [Raw Neural Voice (Edge-TTS)]
                                       │
                                       ▼
        ┌─────────────────────────────────────────────────────────────┐
        │                 Acoustic Profile Routing                    │
        └──────────────────────────────┬──────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
   [Radio Comms]               [Quantum Crystal]             [Precursor Entity]
   Darius, Thorne,             Lyra                          The Architect
   Naya, Cross, Selene                 │                             │
         │                             │                             │
  ┌──────┴──────────────┐       ┌──────┴──────────────┐       ┌──────┴──────────────┐
  │ • Radio Intro Chirp │       │ • 7.5kHz Crystal EQ │       │ • Sub-Bass Boost    │
  │ • Bandpass Filter   │       │ • Ethereal Reverb   │       │   (+18dB @ 70Hz)    │
  │ • Pink Noise Bed    │       │ • 25ms Stereo Delay │       │ • Sub-Octave Drone  │
  │ • Roger Squelch Out │       │ • Crystal Presence  │       │   (0.82x Resample)  │
  └─────────────────────┘       └─────────────────────┘       │ • Wide Cavern Echo  │
                                                              └─────────────────────┘
```

### Profile Specifications

1. **Commander Jack Thorne (`en-US-BrianNeural`)**:
   - `pitch`: `-6Hz`, `rate`: `-2%`
   - `dsp`: `equalizer=f=120:t=q:w=1:g=4,highpass=f=160,lowpass=f=5200,volume=1.35,aecho=0.75:0.8:22:0.25`
   - Acoustic style: Heavy naval authority, gravelly radio comms, low-frequency presence.

2. **Lyra Star (`en-US-AnaNeural`)**:
   - `pitch`: `-2Hz`, `rate`: `+2%`
   - `dsp`: `equalizer=f=7500:t=q:w=1.2:g=3.5,volume=1.25,aecho=0.8:0.85:25:0.2`
   - Acoustic style: Intelligent 7-year-old child psychic, crystal resonance, ethereal telepathic delay.

3. **Darius Star (`en-US-ChristopherNeural`)**:
   - `pitch`: `-4Hz`, `rate`: `+5%`
   - `dsp`: `highpass=f=250,lowpass=f=5500,volume=1.35,aecho=0.7:0.75:18:0.2`
   - Acoustic style: Grounded combat mercenary, cockpit VHF filter, pink-noise electromagnetic floor.

4. **Naya (`en-US-AvaNeural`)**:
   - `pitch`: `+1Hz`, `rate`: `+9%`
   - `dsp`: `highpass=f=350,lowpass=f=6500,volume=1.35,equalizer=f=3000:t=q:w=1:g=3`
   - Acoustic style: Military discipline, crisp articulation, sharp 3kHz presence.

5. **Valera Cross (`en-US-EricNeural`)**:
   - `pitch`: `-5Hz`, `rate`: `-4%`
   - `dsp`: `flanger=delay=4:depth=2.5:regen=45:width=85:speed=0.6,highpass=f=180,lowpass=f=7000,volume=1.3`
   - Acoustic style: Mercenary flanger modulation, aggressive tactical radio.

6. **Selene (`en-US-JennyNeural`)**:
   - `pitch`: `+0Hz`, `rate`: `+1%`
   - `dsp`: `equalizer=f=10000:t=q:w=1:g=3,volume=1.25,aecho=0.8:0.88:30:0.2`
   - Acoustic style: Haven-7 base coordinator, high-frequency air boost, orbital relay reverb.

7. **The Architect (`en-GB-ThomasNeural`)**:
   - `pitch`: `-8Hz`, `rate`: `-16%`
   - `dsp`: `bass=g=18:f=70:w=0.8,equalizer=f=3000:t=q:w=1:g=2,asetrate=48000*0.82,aresample=48000,lowpass=f=200,aecho=0.85:0.88:60|120:0.4|0.25`
   - Acoustic style: Inhuman ancient intelligence, sub-50Hz resonant drone, cavernous cosmic reverb.

---

## 6. Runtime Resolution Pipeline (`js/voice_pipeline.js`)

When a comms line or story event triggers in-game, the voice pipeline resolves audio through the following hierarchy:

1. **Explicit Line ID Lookup**: Checks `options.lineId` against `voice_manifest.json`.
2. **Normalized Dialogue Index**: Matches alphanumeric-normalized dialogue text against `_normalizedLineMap` (guaranteeing matches even across punctuation or casing differences).
3. **Stratum / Biome Fallback**: If an unindexed or dynamic line triggers, routes to the character's biome briefing or tactical audio file.
4. **Decoding & Playback**: Decodes audio binary data directly into an `AudioBuffer` via Web Audio API (`audioCtx.decodeAudioData`) with BGM ducking (-50% volume during speech) and smooth post-speech recovery.
