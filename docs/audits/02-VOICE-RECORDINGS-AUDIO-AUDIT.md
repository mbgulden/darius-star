# Audit Document 02: Voice Recordings & Audio Engine Audit (Done vs. To-Do)

**Document Focus:** Voice Lines Master Catalog, Speaker Distribution, Done vs. To-Do Recording Analysis, Music Tracks, Web Audio SFX, and Ambient Soundscapes  
**Audio Inventory:** 711 Voice OGGs, 83 MP3 Music Tracks, 27 SFX Assets, 20 Ambient Loops  

---

## 1. Executive Summary: Audio Architecture

The audio engine combines:
1. **Cinematic Orchestral / Synth Tracks (MP3)** managed by `AudioManager` with smooth 0.5s crossfades.
2. **Dynamic In-Game Voice Lines (OGG)** triggered on combat events, retreats, and briefings.
3. **Procedural Web Audio Synthesis + Sampled SFX (WAV/MP3)** for crisp zero-latency firing, impacts, and explosions.
4. **Binaural Environmental Ambient Loops (WAV)** for deep-sea and planetary atmospheric pressure.

---

## 2. Voice Lines Inventory: Done vs. To-Do Analysis

### Current Audio Files on Disk (`assets/audio/voice/`): Total 711 Files

| Speaker / Role | Spoken Lines Count | Coverage Summary | Status |
|---|---|---|---|
| **Darius Star** (Protagonist) | 211 files | Full coverage across 10 biomes: level starts, boss encounters, deaths, respawns, retreats | 🟢 Generated & Available |
| **Ophion** (Biosynthetic AI) | 144 files | Tactical responses, sensor warnings, retreat assist | 🟢 Generated & Available |
| **Jack Thorne** (Commander) | 143 files | Mission briefings, tactical commands, wingman banter | 🟢 Generated & Available |
| **Valera Cross** (Mercenary) | 123 files | Co-op banter, combat alerts, retreat responses | 🟢 Generated & Available |
| **Naya** (Warden Pilot) | 74 files | Biome lore, Coelacanth warnings, retreat calls | 🟢 Generated & Available |
| **Unknown / Transmissions** | 12 files | Precursor glyph static, mysterious broadcasts | 🟢 Generated & Available |
| **Lyra Star** (Navigator Daughter) | **2 files** | **CRITICAL GAP**: Only 2 files present in voice directory | 🔴 **HIGH PRIORITY TO-DO** |
| **Selene Star** (Grandmother Comms) | **0 files** | Missing in audio directory | 🔴 **HIGH PRIORITY TO-DO** |
| **The Architect / Precursor** | **0 files** | Missing in audio directory | 🟡 **TO-DO** |

---

## 3. The Lyra Voice Gap: Forensic Analysis & To-Do Roster

`docs/voice-lines-master.md` and `docs/lyra-navigator-system.md` document **45 vital emotional navigation and retreat lines** for Lyra Star that serve as the narrative backbone of Darius's journey.

### High-Priority To-Do Lines for Lyra:
1. **`b1_retreat_lyra_01`**: *"The dark in this trench is... heavy. It's trying to swallow my voice. I have to break contact!"*
2. **`b2_retreat_lyra_01`**: *"So many old voices crying in this reef... it hurts! I have to shut them out!"*
3. **`b3_retreat_lyra_01`**: *"The Hatchery Queen... she thinks I'm one of her children! She's pulling my mind down! Help!"*
4. **`b4_retreat_lyra_01`**: *"The nebula... it's showing me things that haven't happened yet. I see fire and ice... I have to break the vision!"*
5. **`b5_retreat_lyra_01`**: *"My thoughts are freezing into crystals... Daddy, I can't feel my fingers on the comms!"*
6. **`b6_retreat_lyra_01`**: *"The fire isn't burning the ship... it's burning inside my chest! Daddy, pull away from the core!"*
7. **`b7_retreat_lyra_01`**: *"The lightning is singing in my ears! Millions of voices all screaming at once!"*
8. **`b8_retreat_lyra_01`**: *"The dead ships... they remember their crews! They think I'm their captain! Breaking link!"*
9. **`b9_retreat_lyra_01`**: *"The hive mind found the crack in my thoughts! It's flooding in! Disengaging!"*
10. **`b10_retreat_lyra_01`**: *"The Dreamer is waking up... and it's looking right at me! Daddy, we have to pull back NOW!"*

---

## 4. Music Soundtracks Catalog (79 MP3 Tracks)

The Lyria 2/3 soundtrack catalog covers every biome, emotional state, and story branch:

| Soundtrack Category | Track Count | Sample Tracks | Function |
|---|---|---|---|
| **Biome Exploration Themes** | 10 Tracks | `biome_b1_abyssal.mp3` through `biome_b10_core.mp3` | Dynamic looping exploration music |
| **Boss Battle Themes** | 10 Tracks | `boss_loop.mp3`, `boss_b1_guardian.mp3`, `boss_b10_dreamer.mp3` | High-tempo multi-phase encounter themes |
| **Mystery & Revelation** | 10 Tracks | `mystery_first_contact.mp3`, `mystery_lyra_vision.mp3` | Lore discoveries & cutscene audio |
| **Tension & Suspense** | 22 Tracks | `tension_deep_abyss.mp3`, `tension_hive_swarm.mp3` | Sub-level escalation & warning states |
| **Relief & Resolution** | 10 Tracks | `relief_trench_clear.mp3`, `relief_core_calm.mp3` | Post-boss calm & glyph acquisition |
| **Biome Victory Themes** | 10 Tracks | `victory_abyssal.mp3`, `victory_core.mp3` | Level clear celebration |
| **Ending Themes** | 3 Tracks | `ending_sacrifice.mp3`, `ending_transcendence.mp3`, `ending_dominion.mp3` | Branch-specific ending credits suites |
| **Ambient / Title** | 4 Tracks | `ambient_deep_space.mp3`, `ambient_abyssal_trench.mp3` | Menu and idle screens |

---

## 5. Web Audio SFX & Environmental Audio Catalog

| Audio Group | Assets Count | Technology | Latency | Key Events |
|---|---|---|---|---|
| **Primary Weapons** | 5 Tiers | Procedural Web Audio + `player_laser.mp3` | 0 ms | Single -> Supreme Nova firing |
| **Explosion Taxonomy** | 13 WAVs | `explosion_large.mp3`, `explosion_enemy_heavy_a.wav`, etc. | 0 ms | Heavy destruction, boss segment rupture |
| **Tactical & UI** | 9 Audio Files | `alarm_siren.mp3`, `shield_hit.mp3`, `ui_click.mp3` | 0 ms | Low health alarm, shield absorb, menu select |
| **Atmospheric Ambients** | 20 WAVs | `ambient_b1_atmosphere.wav`, `ambient_b1_narrative.wav` | Looped | Background hum, ocean floor pressure |

---

## 6. Findings & Recommendations

1. **Synthesize / Record Missing Lyra & Selene Lines**: Utilize `tools/gemini_tts_client.py` to synthesize the missing 45 Lyra navigator and 20 Selene comms lines to achieve 100% voice file parity.
2. **Audio Unlocking**: `js/audio.js` and `js/audio_manager.js` correctly gate AudioContext startup behind first user click/touch gesture, complying with modern browser autoplay policies.
3. **Streamer Mode**: Implemented in `js/ui/settings.js` and `js/voice_playback.js` to mute spoken voice lines while keeping music and SFX active.
