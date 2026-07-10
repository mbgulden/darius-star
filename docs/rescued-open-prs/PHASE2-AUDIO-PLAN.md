# Phase 2: Audio & Sound Design — Darius Star: Cyber Coelacanth

**Date:** June 8, 2026
**Research by:** Deep Research Agent (Lyria 3 / Google Flow Music)

---

## Executive Summary

**Google Lyria 3** (via Gemini API) is the solution for cinematic game scores. **Google Flow Music** is a consumer app with no API — skip it. For sound effects, Lyria 3 doesn't do SFX — use traditional retro tools.

| Tool | Scores | SFX | API | Cost |
|------|--------|-----|-----|------|
| **Lyria 3 Clip** (30s) | ✅ Loops | ❌ | Gemini API | $0.04/song |
| **Lyria 3 Pro** (2min) | ✅ Full tracks | ❌ | Gemini API | $0.08/song |
| **Google Flow Music** | ✅ | ❌ | No API | Credit-based |
| **jsfxr/sfxr** | ❌ | ✅ Retro SFX | Local script | Free |
| **Web Audio API** | ❌ | ✅ Synthesis | Built-in | Free |

---

## Audio Scene Plan

### 1. Title Screen Music
**Prompt (Lyria 3 Pro):**
> "Epic retro-arcade title screen theme, 16-bit era inspired, pulsing synth bass, dramatic stabs, building crescendo, cyberpunk atmosphere, 2 minutes, instrumental, loop-compatible ending."

### 2. Main Gameplay — Phase 1 (Score 0-1000)
**Prompt (Lyria 3 Clip, loop):**
> "High-energy retro shoot-em-up background music, driving 140 BPM beat, arpeggiated synth leads, deep space exploration vibe, 30-second seamless loop, 16-bit Sega Genesis style."

### 3. Main Gameplay — Phase 2 (Score 1000-2000)
**Prompt (Lyria 3 Clip, loop):**
> "Intensified retro arcade battle music, faster tempo 160 BPM, darker synth tones, mechanical percussion, building tension, racing feel, 30-second seamless loop."

### 4. Boss Battle Intro
**Prompt (Lyria 3 Clip):**
> "Dramatic boss entrance sting, cybernetic monster awakening, deep ominous brass hits, industrial percussion, rising tension, 15-second cinematic cue."

### 5. Boss Battle Loop
**Prompt (Lyria 3 Clip, loop):**
> "Intense boss battle music, rapid 180 BPM, aggressive distorted synths, heavy industrial drums, cyber-coelacanth dreadnought theme, dark orchestral hits, frantic energy, 30-second seamless loop."

### 6. Victory Fanfare
**Prompt (Lyria 3 Clip):**
> "Triumphant victory fanfare, 16-bit arcade celebration, bright major key, ascending melody, chiptune brass, satisfying resolution, 10-second sting."

### 7. Game Over
**Prompt (Lyria 3 Clip):**
> "Melancholic game over theme, slow descending melody, minor key, fading synth pads, retro arcade defeat, respectful 15-second coda."

### 8. Ambient Deep Space (title screen idle)
**Prompt (Lyria 3 Clip):**
> "Ethereal deep space ambient, drifting synth pads, occasional distant pulses, mysterious cyberpunk atmosphere, minimal, meditative, 30-second loop."

---

## Sound Effects (SFX) Plan

### Using Web Audio API Synthesis (already partially implemented)
The game already uses Web Audio synthesis for:
- Laser fire (player + enemy variants)
- Explosions (small + large)
- Power-up pickup
- Shield hit
- Boss siren

**Enhancements needed:**

| SFX | Current | Enhancement |
|-----|---------|-------------|
| Player laser | `playSound('shoot')` | Add weapon-level variants (level 3+ add sub-bass) |
| Enemy laser | N/A | Add distinct enemy weapon sounds |
| Explosion small | `createExplosion` | Multi-layered — initial crack + rumble tail |
| Explosion large | Boss death | Cinematic multi-stage — boom → crackle → fade |
| Power-up | `playSound('powerup')` | Add rising pitch arpeggio |
| Shield hit | `playSound('hit')` | Add metallic clang layer |
| Boss siren | `sirenTimer` | Add phase-shifting for rage mode |
| **NEW: Engine hum** | N/A | Constant low drone varying with speed |
| **NEW: Enemy spawn** | N/A | Rising synth sweep per enemy type |
| **NEW: Weapon upgrade** | N/A | Ascending power chord sequence |
| **NEW: Shield break** | N/A | Shattering glass + power-down whine |

### Using jsfxr for Retro Chip Sounds
For additional retro-styled effects, integrate [jsfxr](https://github.com/grumdrig/jsfxr) — a JavaScript port of the classic sfxr:
- Laser pew-pew variants
- Retro explosion pops
- Coin/power-up chimes
- Menu navigation clicks

---

## Technical Integration Plan

### Step 1: Lyria 3 API Setup
```
API Key: Use Gemini API key (already have Vertex AI setup for Imagen 3)
Endpoint: https://generativelanguage.googleapis.com/v1beta/models/lyria-3-pro-preview:generateContent
SDK: google-genai Python package
```

### Step 2: Build-Time Asset Generation
```python
# generate_audio.py — runs at build time
# 1. Read prompts from assets/audio/prompts.json
# 2. Call Lyria 3 API for each prompt
# 3. Save MP3/WAV to assets/audio/
# 4. Generate audio_manifest.json
```

### Step 3: In-Game Audio Integration
```javascript
// index.html additions:
// 1. AudioManager class — preloads audio_manifest.json
// 2. Track switching based on game state (score thresholds)
// 3. Crossfade between tracks
// 4. SFX layered on top of music
```

### Step 4: Audio Pipeline Automation
```
tasks.json additions:
  "generate-audio": "python3 tasks/generate_audio.py"
  "lint-audio": "python3 tasks/lint_audio.py — checks audio_manifest.json matches files"
```

---

## Cost Estimate

| Asset | Model | Count | Unit Cost | Total |
|-------|-------|-------|-----------|-------|
| Title theme | Pro | 1 | $0.08 | $0.08 |
| Gameplay loops | Clip | 3 | $0.04 | $0.12 |
| Boss intro + loop | Clip | 2 | $0.04 | $0.08 |
| Victory / Game Over | Clip | 2 | $0.04 | $0.08 |
| Ambient space | Clip | 1 | $0.04 | $0.04 |
| **Total music** | | **9 tracks** | | **$0.40** |

SFX via Web Audio API + jsfxr: **$0.00**

---

## Linear Issues for Phase 2

| ID | Issue | Agent |
|----|-------|-------|
| PH2-01 | Audio research & scene prompt pack | AGY → Fred review |
| PH2-02 | Lyria 3 API integration — generate_audio.py | Fred |
| PH2-03 | Generate all 9 music tracks via Lyria 3 API | Fred |
| PH2-04 | AudioManager class — preloading, switching, crossfade | Fred |
| PH2-05 | SFX enhancement — weapon variants, engine hum, spawn sweeps | Fred |
| PH2-06 | jsfxr integration for retro chip sounds | Fred |
| PH2-07 | Audio pipeline automation (tasks.json + lint) | Fred |
| PH2-08 | Game state → music mapping (score thresholds trigger tracks) | Fred |
| PH2-09 | Audio QA — volume mixing, no clipping, seamless loops | AGY |

---

## Implementation Order

1. **PH2-01–02:** Research + API setup (AGY does research, Fred does API)
2. **PH2-03:** Generate all tracks (Fred runs generate_audio.py)
3. **PH2-04:** AudioManager in index.html
4. **PH2-08:** Game state → music mapping
5. **PH2-05–06:** SFX enhancements (parallel)
6. **PH2-07:** Pipeline automation
7. **PH2-09:** QA pass
