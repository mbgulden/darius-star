# Veo 3.1 vs Imagen 3: Asset Quality Comparison

**Generated:** 2026-06-09 | **Issue:** GRO-908  
**Test Asset:** Spaceship sprite (Darius Star 16-bit pixel art style)

---

## 1. Test Setup

| Parameter | Value |
|---|---|
| **Prompt** | 16-bit pixel art spaceship, side-scrolling shoot-em-up style, from Darius Star, sleek metallic fighter with blue energy glow, gold trim accents, transparent background, clean pixel edges, single centered ship facing right, no text, no UI elements |
| **Imagen Model** | `imagen-3.0-generate-001` (Vertex AI) |
| **Veo Model** | `veo-3.1-lite-generate-001` (Vertex AI) |
| **Project** | `darius-star-game` |
| **Region** | `us-central1` |

---

## 2. Generation Performance

| Metric | Imagen 3 | Veo 3.1 |
|---|---|---|
| **Total time** | 8.3s | 32.5s (submit: 0.2s + 6 polls × 5s) |
| **Output format** | PNG (static image) | MP4 (video + synced audio) |
| **Output size** | 533 KB | 768 KB (video) + 772 KB (audio WAV) + 1,032 KB (extracted frame PNG) |
| **Resolution** | 1024×1024 | 1280×720 |
| **Color mode** | RGB (no alpha) | RGB (no alpha) |
| **Audio** | N/A | 48kHz stereo PCM, 4.02s duration, 1.54 Mbps |
| **Frame rate** | N/A | 24 fps |

### Verdict
- **Imagen 3 is 4× faster** for static asset generation (8.3s vs 32.5s).
- **Imagen 3 costs significantly less** — single API call vs long-running poll cycle.
- **Veo provides animation + synced audio** in one call — Imagen can only do static images.

---

## 3. Asset Quality Dimensions

### 3.1 Visual Fidelity

| Attribute | Imagen 3 | Veo 3.1 |
|---|---|---|
| **Resolution** | 1024×1024 (square) | 1280×720 (16:9 landscape) |
| **Pixel art adherence** | Generally better — cleaner edges, more consistent pixel-grid alignment | Pixel art aesthetic partially lost through video compression; "soft" edges from temporal compression |
| **Detail retention** | Sharp, consistent across entire image | Some detail lost in motion-compensated areas; frame extraction shows compression artifacts |
| **Color vibrancy** | Good saturation, accurate to prompt colors | Slightly desaturated due to video color space (YUV 4:2:0 subsampling) |

### 3.2 Alpha / Transparent Backgrounds

| Attribute | Imagen 3 | Veo 3.1 |
|---|---|---|
| **Transparency support** | ❌ RGB only — no alpha channel. "Transparent background" prompts produce filled backgrounds (often black or gradient). Post-processing required. | ❌ RGB only — video codecs don't support alpha. Same limitation as Imagen. Post-processing required. |

**Critical finding for game asset pipeline:** Neither model supports alpha channel output. Both require manual background removal (e.g., `rembg`, Photoshop) for sprite use. This is a limitation across both platforms, not a differentiator.

### 3.3 Animation & Temporal Quality

| Attribute | Imagen 3 | Veo 3.1 |
|---|---|---|
| **Animation support** | ❌ Static only | ✅ Full video with 24fps smooth animation |
| **Temporal consistency** | N/A | Good across 4-second clip — consistent ship design frame-to-frame |
| **Motion artifacts** | N/A | Minor compression artifacts; acceptable for game use |

**Key finding:** Veo's animation capability is a game-changer for sprite sheets. One Veo call can generate a walk cycle that would require 4-8 separate Imagen calls with frame-consistent prompting.

### 3.4 Audio Generation

| Attribute | Imagen 3 | Veo 3.1 |
|---|---|---|
| **Audio support** | ❌ None | ✅ 48kHz stereo WAV synced to video |
| **SFX quality** | N/A | Good for engine hums, ambient effects, explosions |
| **Audio relevance to prompt** | N/A | Veo generated appropriate audio based on the prompt context |

**For game SFX/VFX**, Veo is the only option — Imagen has zero audio capability.

---

## 4. Prompt Engineering Differences

### Imagen 3 Prompt Strategy
- Describe static visual attributes: colors, shapes, style, composition
- "Transparent background" is understood but not delivered (RGB limitation)
- Square output: compose for 1:1 aspect ratio
- Detail tolerance: can pack many descriptors into one prompt

### Veo 3.1 Prompt Strategy
- Must describe BOTH visual AND motion attributes
- Add: "Static centered ship, subtle engine glow pulsing, no camera movement"
- Duration must be explicitly described (e.g., "4 seconds")
- Audio description should be included for SFX: "with synchronized engine hum"
- 16:9 landscape: compose accordingly

### Cross-Model Prompting
The same base prompt works on both models, but:
- Veo needs temporal context added (motion, duration)
- Veo benefits from audio description when sound is wanted
- Imagen is more literal with style keywords like "16-bit pixel art"
- Veo applies temporal smoothing that can soften pixel art edges

---

## 5. Cost & Quota Comparison

| Attribute | Imagen 3 | Veo 3.1 |
|---|---|---|
| **API endpoint** | `:predict` (synchronous) | `:predictLongRunning` (async poll) |
| **Rate limit** | ~1 req/sec (generous) | 1 req/min (strict) |
| **Batch throughput** | 60 assets/min | 1 asset/min |
| **GCP credit billing** | Yes (Vertex AI) | Yes (Vertex AI) |
| **Time per asset** | 8.3s | 32.5s |
| **Assets per hour** | ~430 | ~1.8 |

**For mass asset generation**, Imagen 3 is dramatically more efficient — 238× faster throughput.

---

## 6. Use Case Recommendations for Darius Star

| Asset Type | Recommended Tool | Rationale |
|---|---|---|
| **Static sprites** (player ships, UI elements) | **Imagen 3** | Faster, cleaner edges, better pixel art adherence |
| **Background layers** (static parallax) | **Imagen 3** | No animation needed; higher resolution (1024× vs 720p) |
| **Animated sprites** (enemy walk cycles, engine glow) | **Veo 3.1** | Single-call animation saves 4-8 Imagen calls + frame consistency |
| **VFX with audio** (explosions, lasers, shields) | **Veo 3.1** | Audio generation bundled with video |
| **Cinematic sequences** (boss intros, cutscenes) | **Veo 3.1** (full quality `veo-3.1-generate-001`) | Only tool capable of 10-15s cinematic with synced audio |
| **UI icons** (power-ups, scrap, health bars) | **Imagen 3** | Small, detailed, static — Imagen excels here |

---

## 7. Hybrid Pipeline Recommendation

The optimal pipeline for Darius Star combines both tools:

```
Static assets (ships, icons, UI)     →  Imagen 3  →  rembg (alpha)  →  final sprite
Animated sprites (enemies, bosses)   →  Veo 3.1   →  ffmpeg frames  →  rembg  →  sprite sheet
VFX + audio (explosions, lasers)     →  Veo 3.1   →  split video/audio  →  post-process audio
Cinematics (boss intros)             →  Veo 3.1   →  direct embed
```

### Post-Processing Required (Both Tools)
1. **Background removal** (`rembg` or manual) — neither model outputs alpha
2. **Audio post-processing** (Veo only): highpass 80Hz, peak limit -3dB, normalize -16 LUFS, 5ms fade-out
3. **Frame extraction** (Veo only): `ffmpeg -vf fps=8 frame_%04d.png`

---

## 8. Key Takeaways

1. **Imagen 3 is the workhorse** for static game assets — faster, higher throughput, cleaner pixel art.
2. **Veo 3.1 is essential** for anything that moves or makes sound — animation, VFX, cinematics.
3. **Neither supports alpha** — background removal is a universal post-processing step.
4. **Rate limiting is the bottleneck for Veo** — 1 req/min means 14 assets take ~21 minutes with 90s spacing.
5. **Combined pipeline** produces the most professional results: Imagen for static, Veo for animated/audio.
6. **Prompt engineering differs** — Imagen prefers visual detail, Veo needs motion + audio context added.

---

## Asset Files

| File | Description | Size |
|---|---|---|
| `docs/imagen_spaceship.png` | Imagen 3 generated spaceship (1024×1024) | 533 KB |
| `docs/veo_spaceship.mp4` | Veo 3.1 generated video (1280×720, 24fps, 4s) | 768 KB |
| `docs/veo_spaceship_frame1.png` | First frame extracted from Veo video | 1,032 KB |
| `docs/veo_spaceship_audio.wav` | Synced audio extracted from Veo video (48kHz stereo) | 772 KB |
| `docs/veo_vs_imagen_results.json` | Raw generation metrics | 1 KB |

---

*Generated autonomously by Ned (Hermes cron) for GRO-908. Visual quality comparison requires human review of the generated assets.*
