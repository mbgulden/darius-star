#!/usr/bin/env python3
"""
Lyria 2 Audio Generator — Darius Star: Cyber Coelacanth
=========================================================
Generates 30-second instrumental game music loops via Lyria 2 (Vertex AI).
Uses google-cloud-aiplatform PredictionServiceClient — same auth as Imagen 3 + Veo.

PREREQUISITES:
  pip install google-cloud-aiplatform
  gcloud auth login (same as Imagen/Veo)

Usage:
  python3 generate_audio.py --check          # Verify API connection
  python3 generate_audio.py --list           # Show all 9 music prompts
  python3 generate_audio.py --all            # Generate all 9 tracks
  python3 generate_audio.py --track phase1   # Generate specific track

Cost: ~$0.04 per 30s clip → $0.28 total for 9 tracks
"""

import os
import sys
import json
import base64
import argparse
import subprocess
from pathlib import Path
from datetime import datetime, timezone

# ──────────────────────────────────────────────
# Music prompt catalog (from PHASE2-AUDIO-PLAN.md)
# ──────────────────────────────────────────────

MUSIC_CATALOG = {
    "title": {
        "scene": "Title Screen Music",
        "prompt": (
            "Epic retro-arcade title screen theme, 16-bit era inspired, "
            "pulsing synth bass, dramatic stabs, building crescendo, "
            "cyberpunk atmosphere, instrumental, loop-compatible ending, "
            "30 seconds, Sega Genesis style, no vocals."
        ),
        "duration": 30,
        "output": "assets/audio/title.mp3",
        "loop": True,
    },
    "phase1": {
        "scene": "Gameplay Phase 1 (Score 0-1000)",
        "prompt": (
            "High-energy retro shoot-em-up background music, driving 140 BPM beat, "
            "arpeggiated synth leads, deep space exploration vibe, "
            "30-second seamless loop, 16-bit Sega Genesis style, instrumental, "
            "energetic but not frantic, good for extended gameplay."
        ),
        "duration": 30,
        "output": "assets/audio/phase1.mp3",
        "loop": True,
    },
    "phase2": {
        "scene": "Gameplay Phase 2 (Score 1000-2000)",
        "prompt": (
            "Intensified retro arcade battle music, faster tempo 160 BPM, "
            "darker synth tones, mechanical percussion, building tension, "
            "racing feel, 30-second seamless loop, 16-bit Sega Genesis style, "
            "instrumental, rising intensity but still loopable."
        ),
        "duration": 30,
        "output": "assets/audio/phase2.mp3",
        "loop": True,
    },
    "boss_intro": {
        "scene": "Boss Battle Intro Sting",
        "prompt": (
            "Dramatic boss entrance sting, cybernetic monster awakening, "
            "deep ominous brass hits, industrial percussion, rising tension, "
            "15-second cinematic cue, 16-bit era orchestral, instrumental, "
            "builds to a climax then cuts, designed for one-shot play."
        ),
        "duration": 15,
        "output": "assets/audio/boss_intro.mp3",
        "loop": False,
    },
    "boss_loop": {
        "scene": "Boss Battle Loop",
        "prompt": (
            "Intense boss battle music, rapid 180 BPM, "
            "aggressive distorted synths, heavy industrial drums, "
            "cyber-coelacanth dreadnought theme, dark orchestral hits, "
            "frantic energy, 30-second seamless loop, 16-bit Sega Genesis style, "
            "instrumental, relentless driving beat."
        ),
        "duration": 30,
        "output": "assets/audio/boss_loop.mp3",
        "loop": True,
    },
    "victory": {
        "scene": "Victory Fanfare",
        "prompt": (
            "Triumphant victory fanfare, 16-bit arcade celebration, "
            "bright major key, ascending melody, chiptune brass, "
            "satisfying resolution, 10-second sting, instrumental, "
            "pure joy and accomplishment, Sega Genesis sound chip style."
        ),
        "duration": 10,
        "output": "assets/audio/victory.mp3",
        "loop": False,
    },
    "game_over": {
        "scene": "Game Over Theme",
        "prompt": (
            "Melancholic game over theme, slow descending melody, "
            "minor key, fading synth pads, retro arcade defeat, "
            "respectful 15-second coda, 16-bit style, instrumental, "
            "somber but not depressing, motivates retry."
        ),
        "duration": 15,
        "output": "assets/audio/game_over.mp3",
        "loop": False,
    },
    "ambient": {
        "scene": "Title Screen Ambient (Idle)",
        "prompt": (
            "Ethereal deep space ambient, drifting synth pads, "
            "occasional distant pulses, mysterious cyberpunk atmosphere, "
            "minimal, meditative, 30-second loop, 16-bit inspired, "
            "instrumental, calm background for menu screens."
        ),
        "duration": 30,
        "output": "assets/audio/ambient.mp3",
        "loop": True,
    },
    "level_clear": {
        "scene": "Level Clear Jingle",
        "prompt": (
            "Short level clear jingle, 16-bit arcade celebration, "
            "ascending arpeggio, major chord resolution, "
            "5-second sting, bright chiptune, instrumental, "
            "concise victory acknowledgment, Sega Genesis style."
        ),
        "duration": 5,
        "output": "assets/audio/level_clear.mp3",
        "loop": False,
    },
    # ═══════════════════════════════════════════════
    # Environmental Ambient Layers (Lyria 2)
    # ═══════════════════════════════════════════════
    "ambient_deep_space": {
        "scene": "Deep Space Ambient (under title screen)",
        "prompt": (
            "Deep space ambient drone, very subtle and minimal, "
            "low frequency rumble with occasional distant cosmic pulses, "
            "ethereal and mysterious, 30-second seamless loop, "
            "designed to play quietly behind title screen music, barely noticeable, "
            "like the sound of empty space, no melody, pure atmosphere."
        ),
        "duration": 30,
        "output": "assets/audio/ambient_deep_space.mp3",
        "loop": True,
    },
    "ambient_abyssal_trench": {
        "scene": "Abyssal Trench Ambient (L1)",
        "prompt": (
            "Deep ocean trench ambient texture, subtle low-frequency water pressure, "
            "occasional distant hydrothermal vent rumbles, "
            "faint metallic creaks from cyberpunk industrial pipes, "
            "dark and oppressive but subtle, 30-second seamless loop, "
            "designed to layer quietly under phase1 gameplay music."
        ),
        "duration": 30,
        "output": "assets/audio/ambient_abyssal_trench.mp3",
        "loop": True,
    },
    "ambient_coral_graveyard": {
        "scene": "Coral Graveyard Ambient (L2)",
        "prompt": (
            "Eerie underwater ruin ambient texture, "
            "faint electrical crackles like damaged circuits sparking, "
            "distant metallic groans from broken structures shifting, "
            "subtle wind-like current through shattered coral, "
            "haunting and atmospheric, 30-second seamless loop, "
            "designed to layer quietly under phase2 gameplay music."
        ),
        "duration": 30,
        "output": "assets/audio/ambient_coral_graveyard.mp3",
        "loop": True,
    },
    "ambient_coelacanth_lair": {
        "scene": "Coelacanth Lair Ambient (L3/Boss)",
        "prompt": (
            "Biomechanical cavern ambient texture, "
            "low mechanical heartbeat rhythm — deep thudding pulse, "
            "wet organic sounds mixed with synthetic machinery hum, "
            "distant dripping of viscous fluid, "
            "ominous and alive-feeling, 30-second seamless loop, "
            "designed to layer quietly under boss battle music."
        ),
        "duration": 30,
        "output": "assets/audio/ambient_coelacanth_lair.mp3",
        "loop": True,
    },
    "ambient_victory_space": {
        "scene": "Victory Space Ambient",
        "prompt": (
            "Peaceful post-battle space ambient, "
            "gentle drifting synth pads with subtle shimmer, "
            "feeling of calm after chaos, quiet triumph, "
            "distant twinkling star-like high frequencies, "
            "30-second seamless loop, serene and beautiful, "
            "designed to play behind victory screen."
        ),
        "duration": 30,
        "output": "assets/audio/ambient_victory_space.mp3",
        "loop": True,
    },
    "ambient_ice_rings": {
        "scene": "Ice Ring Ambient (Biome 5)",
        "prompt": (
            "Frozen deep space ambient, icy crystalline tones, "
            "cold wind textures, shimmering frost particles, "
            "deep sub-zero atmosphere, 30-second seamless loop, "
            "16-bit Sega Genesis style, instrumental, sparse and haunting."
        ),
        "duration": 30,
        "output": "assets/audio/ambient_ice_rings.mp3",
        "loop": True,
    },
    "ambient_fire_nebula": {
        "scene": "Fire Nebula Ambient (Biome 6)",
        "prompt": (
            "Inferno nebula ambient, low rumbling magma bass, "
            "crackling fire textures, intense heat shimmer, "
            "oppressive thermal atmosphere, 30-second seamless loop, "
            "16-bit Sega Genesis style, instrumental, dark and intense."
        ),
        "duration": 30,
        "output": "assets/audio/ambient_fire_nebula.mp3",
        "loop": True,
    },
    "ambient_storm_belt": {
        "scene": "Storm Belt Ambient (Biome 7)",
        "prompt": (
            "Violent gas giant storm ambient, howling wind layers, "
            "distant thunder cracks, electrical crackle textures, "
            "chaotic tempest atmosphere, 30-second seamless loop, "
            "16-bit Sega Genesis style, instrumental, turbulent and electric."
        ),
        "duration": 30,
        "output": "assets/audio/ambient_storm_belt.mp3",
        "loop": True,
    },
    "ambient_derelict_fleet": {
        "scene": "Derelict Fleet Ambient (Biome 8)",
        "prompt": (
            "Abandoned starship graveyard ambient, groaning metal stress, "
            "distant distress beacon pings, hollow vacuum echoes, "
            "lonely deep space wreckage atmosphere, 30-second seamless loop, "
            "16-bit Sega Genesis style, instrumental, eerie and desolate."
        ),
        "duration": 30,
        "output": "assets/audio/ambient_derelict_fleet.mp3",
        "loop": True,
    },
    "ambient_xenomorph_hive": {
        "scene": "Xenomorph Hive Ambient (Biome 9)",
        "prompt": (
            "Organic alien hive ambient, wet chittering textures, "
            "pulsing biological rhythms, squelching membrane sounds, "
            "living ship interior atmosphere, 30-second seamless loop, "
            "16-bit Sega Genesis style, instrumental, organic and unsettling."
        ),
        "duration": 30,
        "output": "assets/audio/ambient_xenomorph_hive.mp3",
        "loop": True,
    },
    "ambient_core_rift": {
        "scene": "Core Rift Ambient (Biome 10)",
        "prompt": (
            "Reality-tearing dimensional rift ambient, warped space-time drones, "
            "unnatural pitch-bending textures, deep cosmic horror bass, "
            "end-of-reality atmosphere, 30-second seamless loop, "
            "16-bit Sega Genesis style, instrumental, mind-bending and epic."
        ),
        "duration": 30,
        "output": "assets/audio/ambient_core_rift.mp3",
        "loop": True,
    },

    # ═══════════════════════════════════════════════
    # Biome Boss Music (GRO-987)
    # ═══════════════════════════════════════════════
    "boss_b1_abyssal": {
        "scene": "Boss B1: Abyssal Trench — Trench Guardian",
        "prompt": "Epic deep-sea boss battle, 16-bit Sega Genesis style, 180 BPM, pulsing synth bass arpeggios, eerie bioluminescent pads, industrial percussion with hydrostatic reverb, rising tension orchestral stabs, 30-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 30, "output": "assets/audio/boss_b1_abyssal.mp3", "loop": True,
    },
    "boss_b2_coral": {
        "scene": "Boss B2: Coral Graveyard — Rust Colossus",
        "prompt": "Rusted mechanical boss fight, 16-bit Sega Genesis style, 175 BPM, distorted metal-hitting-metal percussion, orange-tinted industrial synths, collapsing structure bass drops, frantic energy, 30-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 30, "output": "assets/audio/boss_b2_coral.mp3", "loop": True,
    },
    "boss_b3_coelacanth": {
        "scene": "Boss B3: Coelacanth Lair — Cyber Coelacanth",
        "prompt": "Cybernetic dreadnought boss theme, 16-bit Sega Genesis style, 190 BPM, aggressive distorted synths, heavy industrial drums, dark orchestral hits with biomechanical undertones, frantic energy, 30-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 30, "output": "assets/audio/boss_b3_coelacanth.mp3", "loop": True,
    },
    "boss_b4_nebula": {
        "scene": "Boss B4: Nebula Drift — Void Specter",
        "prompt": "Ethereal boss battle in plasma nebula, 16-bit Sega Genesis style, 170 BPM, phase-shifted synth leads, ghostly choir pads, plasma burst percussion, reality-bending pitch slides, 30-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 30, "output": "assets/audio/boss_b4_nebula.mp3", "loop": True,
    },
    "boss_b5_ice": {
        "scene": "Boss B5: Ice Ring — Frost Titan",
        "prompt": "Frozen boss encounter, 16-bit Sega Genesis style, 165 BPM, crystalline bell-like percussion, cold shimmering pads, ice-cracking bass hits, sub-zero wind textures, 30-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 30, "output": "assets/audio/boss_b5_ice.mp3", "loop": True,
    },
    "boss_b6_fire": {
        "scene": "Boss B6: Fire Nebula — Inferno Lord",
        "prompt": "Volcanic boss battle, 16-bit Sega Genesis style, 185 BPM, aggressive taiko drum patterns, distorted fire-roar bass, heat-shimmer synth leads, eruption impact hits, 30-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 30, "output": "assets/audio/boss_b6_fire.mp3", "loop": True,
    },
    "boss_b7_storm": {
        "scene": "Boss B7: Storm Belt — Tempest Sovereign",
        "prompt": "Electromagnetic storm boss, 16-bit Sega Genesis style, 195 BPM, glitchy breakbeat percussion, white-noise wind gusts, thunderous FM synth hits, lightning-crack stabs, 30-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 30, "output": "assets/audio/boss_b7_storm.mp3", "loop": True,
    },
    "boss_b8_derelict": {
        "scene": "Boss B8: Derelict Fleet — Admiral's Wrath",
        "prompt": "Ghost fleet boss battle, 16-bit Sega Genesis style, 160 BPM, military snare march, ominous brass horns, distress-beacon ping accents, metallic groan drones, industrial reverb, 30-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 30, "output": "assets/audio/boss_b8_derelict.mp3", "loop": True,
    },
    "boss_b9_hive": {
        "scene": "Boss B9: Xenomorph Hive — Hive Mind",
        "prompt": "Organic alien boss, 16-bit Sega Genesis style, 175 BPM, wet squelch percussion, insectoid chittering rhythms, heartbeat sub-bass, screeching alien synth leads, biological horror, 30-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 30, "output": "assets/audio/boss_b9_hive.mp3", "loop": True,
    },
    "boss_b10_core": {
        "scene": "Boss B10: Core Rift — The Architect",
        "prompt": "Reality-breaking final boss, 16-bit Sega Genesis style, 200 BPM, granular disintegration beats, reversed melodic fragments, Shepard-tone rising tension, detuned piano stabs, glitchcore texture, 30-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 30, "output": "assets/audio/boss_b10_core.mp3", "loop": True,
    },

    # ═══════════════════════════════════════════════
    # Mid-Boss Music (GRO-988)
    # ═══════════════════════════════════════════════
    "midboss_b1": {
        "scene": "Mid-Boss B1: Abyssal Guardian",
        "prompt": "Mini-boss encounter deep ocean, 16-bit Sega Genesis style, 160 BPM, tense pulsing bass, sonar-ping percussion accents, dark abyssal pads, 15-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 15, "output": "assets/audio/midboss_b1.mp3", "loop": True,
    },
    "midboss_b2": {
        "scene": "Mid-Boss B2: Coral Warden",
        "prompt": "Mini-boss in rusted reef, 16-bit Sega Genesis style, 165 BPM, metallic clang percussion, orange-tinted synths, crumbling structure effects, 15-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 15, "output": "assets/audio/midboss_b2.mp3", "loop": True,
    },
    "midboss_b3": {
        "scene": "Mid-Boss B3: Lair Sentinel",
        "prompt": "Mini-boss in biomechanical lair, 16-bit Sega Genesis style, 170 BPM, heavy mechanical rhythm, red-alert synth stabs, industrial tension, 15-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 15, "output": "assets/audio/midboss_b3.mp3", "loop": True,
    },
    "midboss_b4": {
        "scene": "Mid-Boss B4: Nebula Wraith",
        "prompt": "Mini-boss in plasma nebula, 16-bit Sega Genesis style, 155 BPM, phase-shifted synth arpeggios, ghostly choir pads, space-wind textures, 15-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 15, "output": "assets/audio/midboss_b4.mp3", "loop": True,
    },
    "midboss_b5": {
        "scene": "Mid-Boss B5: Ice Warden",
        "prompt": "Mini-boss in frozen rings, 16-bit Sega Genesis style, 150 BPM, crystalline bell percussion, cold shimmer pads, ice-crack accents, 15-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 15, "output": "assets/audio/midboss_b5.mp3", "loop": True,
    },
    "midboss_b6": {
        "scene": "Mid-Boss B6: Flame Keeper",
        "prompt": "Mini-boss in fire nebula, 16-bit Sega Genesis style, 170 BPM, aggressive drum hits, fire-roar bass, heat-haze synth leads, 15-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 15, "output": "assets/audio/midboss_b6.mp3", "loop": True,
    },
    "midboss_b7": {
        "scene": "Mid-Boss B7: Storm Herald",
        "prompt": "Mini-boss in electromagnetic storm, 16-bit Sega Genesis style, 175 BPM, glitch-break percussion, static-burst accents, thunder-hit stabs, 15-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 15, "output": "assets/audio/midboss_b7.mp3", "loop": True,
    },
    "midboss_b8": {
        "scene": "Mid-Boss B8: Ghost Commander",
        "prompt": "Mini-boss in derelict fleet, 16-bit Sega Genesis style, 145 BPM, military snare hits, ghostly brass drones, beacon-ping accents, 15-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 15, "output": "assets/audio/midboss_b8.mp3", "loop": True,
    },
    "midboss_b9": {
        "scene": "Mid-Boss B9: Brood Guardian",
        "prompt": "Mini-boss in alien hive, 16-bit Sega Genesis style, 165 BPM, organic squelch percussion, chittering rhythms, heartbeat bass, 15-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 15, "output": "assets/audio/midboss_b9.mp3", "loop": True,
    },
    "midboss_b10": {
        "scene": "Mid-Boss B10: Rift Keeper",
        "prompt": "Mini-boss at reality rift, 16-bit Sega Genesis style, 180 BPM, glitch-texture percussion, reversed fragment accents, detuned synth stabs, 15-second loop, instrumental, retro arcade shmup, no vocals.",
        "duration": 15, "output": "assets/audio/midboss_b10.mp3", "loop": True,
    },

    # ═══════════════════════════════════════════════
    # Engine Hum Variants (GRO-985)
    # ═══════════════════════════════════════════════
    "engine_b1_abyssal": {
        "scene": "Engine Hum B1: Deep Pressure",
        "prompt": "Spaceship engine idle loop, muffled low-mid drone with hydrostatic crackle overlay, 120Hz droning base, 2-second seamless loop, 16-bit Sega Genesis style, pure texture, no melody, no vocals.",
        "duration": 2, "output": "assets/audio/engine_b1_abyssal.mp3", "loop": True,
    },
    "engine_b2_coral": {
        "scene": "Engine Hum B2: Rust-Rattle",
        "prompt": "Spaceship engine idle loop, metallic rattle mixed into standard hum, intermittent clank, 140Hz base, 2-second seamless loop, 16-bit Sega Genesis style, pure texture, no melody, no vocals.",
        "duration": 2, "output": "assets/audio/engine_b2_coral.mp3", "loop": True,
    },
    "engine_b3_lair": {
        "scene": "Engine Hum B3: Industrial Thrum",
        "prompt": "Spaceship engine idle loop, heavier mechanical piston-like rhythm, reverb-damped, 100Hz base, 2-second seamless loop, 16-bit Sega Genesis style, pure texture, no melody, no vocals.",
        "duration": 2, "output": "assets/audio/engine_b3_lair.mp3", "loop": True,
    },
    "engine_b4_nebula": {
        "scene": "Engine Hum B4: Ion Drift",
        "prompt": "Spaceship engine idle loop, airy phase-shifted drone, subtle high-freq sparkle, 180Hz base, 2-second seamless loop, 16-bit Sega Genesis style, pure texture, no melody, no vocals.",
        "duration": 2, "output": "assets/audio/engine_b4_nebula.mp3", "loop": True,
    },
    "engine_b5_ice": {
        "scene": "Engine Hum B5: Cryo Hum",
        "prompt": "Spaceship engine idle loop, clean cold tone, crystalline harmonic overtones, 160Hz base, 2-second seamless loop, 16-bit Sega Genesis style, pure texture, no melody, no vocals.",
        "duration": 2, "output": "assets/audio/engine_b5_ice.mp3", "loop": True,
    },
    "engine_b6_fire": {
        "scene": "Engine Hum B6: Thermal Strain",
        "prompt": "Spaceship engine idle loop, distorted crackling saturation, heat-waver pitch warble, 130Hz base, 2-second seamless loop, 16-bit Sega Genesis style, pure texture, no melody, no vocals.",
        "duration": 2, "output": "assets/audio/engine_b6_fire.mp3", "loop": True,
    },
    "engine_b7_storm": {
        "scene": "Engine Hum B7: Static Hum",
        "prompt": "Spaceship engine idle loop, white noise component mixed in, intermittent EM dropout, 150Hz base, 2-second seamless loop, 16-bit Sega Genesis style, pure texture, no melody, no vocals.",
        "duration": 2, "output": "assets/audio/engine_b7_storm.mp3", "loop": True,
    },
    "engine_b8_derelict": {
        "scene": "Engine Hum B8: Reactor Decay",
        "prompt": "Spaceship engine idle loop, unstable slightly detuned drone, irregular failing-reactor pulse, 110Hz base, 2-second seamless loop, 16-bit Sega Genesis style, pure texture, no melody, no vocals.",
        "duration": 2, "output": "assets/audio/engine_b8_derelict.mp3", "loop": True,
    },
    "engine_b9_hive": {
        "scene": "Engine Hum B9: Organic Resonance",
        "prompt": "Spaceship engine idle loop, wet squelchy undertone, biological pulse rhythm, 90Hz base, 2-second seamless loop, 16-bit Sega Genesis style, pure texture, no melody, no vocals.",
        "duration": 2, "output": "assets/audio/engine_b9_hive.mp3", "loop": True,
    },
    "engine_b10_core": {
        "scene": "Engine Hum B10: Phase-Drift",
        "prompt": "Spaceship engine idle loop, constantly pitch-shifting drone sliding 140-200Hz, phase-reversing, 2-second seamless loop, 16-bit Sega Genesis style, pure texture, no melody, no vocals.",
        "duration": 2, "output": "assets/audio/engine_b10_core.mp3", "loop": True,
    },

    # ═══════════════════════════════════════════════
    # Environmental SFX — Biomes 1-10 (GRO-988)
    # ═══════════════════════════════════════════════
    "env_b1_vent": {
        "scene": "B1: Hydrothermal Vent Eruption",
        "prompt": "Deep underwater rumble with steam hiss, 1.5s, 16-bit Sega Genesis style, FM synthesis, no reverb, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b1_vent.mp3", "loop": False,
    },
    "env_b1_biolum": {
        "scene": "B1: Bioluminescent Pulse",
        "prompt": "Soft high-pitched sine chime, 0.3s, 16-bit Sega Genesis style, crisp FM synthesis, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b1_biolum.mp3", "loop": False,
    },
    "env_b2_coral_collapse": {
        "scene": "B2: Coral Structure Collapse",
        "prompt": "Metallic crunch with debris scatter, 2.0s, 16-bit Sega Genesis style, FM noise percussion, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b2_coral_collapse.mp3", "loop": False,
    },
    "env_b2_neon_flicker": {
        "scene": "B2: Broken Neon Sign Flicker",
        "prompt": "Electric buzz stutter, FM noise, 0.2s, 16-bit Sega Genesis style, crisp, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b2_neon_flicker.mp3", "loop": False,
    },
    "env_b3_tesla": {
        "scene": "B3: Tesla Coil Discharge",
        "prompt": "Sharp electric crack with hum decay, 0.4s, 16-bit Sega Genesis style, FM synthesis zap, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b3_tesla.mp3", "loop": False,
    },
    "env_b3_heartbeat": {
        "scene": "B3: Background Core Pulse",
        "prompt": "Deep muffled thud at 72 BPM, 0.5s loop, 16-bit Sega Genesis style, low-frequency square wave, retro arcade shmup, pure texture, no vocals.",
        "duration": 2, "output": "assets/audio/env_b3_heartbeat.mp3", "loop": True,
    },
    "env_b4_plasma": {
        "scene": "B4: Plasma Stream Pass",
        "prompt": "Rising ion sweep with soft crackle, 1.0s, 16-bit Sega Genesis style, FM synthesis sweep, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b4_plasma.mp3", "loop": False,
    },
    "env_b4_storm_flash": {
        "scene": "B4: Nebula Lightning Flash",
        "prompt": "Distant thunder rumble, low-pass filtered, 0.6s, 16-bit Sega Genesis style, FM noise burst, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b4_storm_flash.mp3", "loop": False,
    },
    "env_b5_ice_crack": {
        "scene": "B5: Ice Formation Fracture",
        "prompt": "Sharp crystalline fracture with long-ringing decay, 0.8s, 16-bit Sega Genesis style, bell-like FM tone, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b5_ice_crack.mp3", "loop": False,
    },
    "env_b5_prism": {
        "scene": "B5: Prismatic Light Beam",
        "prompt": "Glass harmonica shimmer sweep, 0.5s, 16-bit Sega Genesis style, bright FM chime, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b5_prism.mp3", "loop": False,
    },
    "env_b6_lava_bubble": {
        "scene": "B6: Lava Pool Burst",
        "prompt": "Thick liquid pop with sizzle, 0.4s, 16-bit Sega Genesis style, PSG noise burst, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b6_lava_bubble.mp3", "loop": False,
    },
    "env_b6_ember_swarm": {
        "scene": "B6: Ember Particle Burst",
        "prompt": "Crackling fire swarm, PSG noise texture, 0.7s, 16-bit Sega Genesis style, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b6_ember_swarm.mp3", "loop": False,
    },
    "env_b7_thunder": {
        "scene": "B7: Close Lightning Strike",
        "prompt": "Sharp crack with long bass rumble decay, 0.9s, 16-bit Sega Genesis style, FM noise explosion, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b7_thunder.mp3", "loop": False,
    },
    "env_b7_static_burst": {
        "scene": "B7: EM Interference Burst",
        "prompt": "White noise burst with digital glitch stutter, 0.3s, 16-bit Sega Genesis style, PSG noise, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b7_static_burst.mp3", "loop": False,
    },
    "env_b8_hull_groan": {
        "scene": "B8: Derelict Hull Stress",
        "prompt": "Deep metallic stress moan, 1.5s, 16-bit Sega Genesis style, low FM drone with pitch bend, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b8_hull_groan.mp3", "loop": False,
    },
    "env_b8_beacon": {
        "scene": "B8: Distress Beacon Ping",
        "prompt": "Sharp electronic ping, Morse-friendly, 0.2s, 16-bit Sega Genesis style, crisp FM sine, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b8_beacon.mp3", "loop": False,
    },
    "env_b9_acid_drip": {
        "scene": "B9: Acid Droplet Impact",
        "prompt": "Wet sizzle with hiss, 0.3s, 16-bit Sega Genesis style, PSG noise + FM tone, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b9_acid_drip.mp3", "loop": False,
    },
    "env_b9_vein_pulse": {
        "scene": "B9: Organic Vein Network Throb",
        "prompt": "Wet squelchy low-frequency pulse, 0.5s loop, 16-bit Sega Genesis style, FM synthesis texture, retro arcade shmup, pure texture, no vocals.",
        "duration": 2, "output": "assets/audio/env_b9_vein_pulse.mp3", "loop": True,
    },
    "env_b10_rift_tear": {
        "scene": "B10: Dimensional Rift Open",
        "prompt": "Reversed glass-shatter with digital glitch, 1.0s, 16-bit Sega Genesis style, FM noise + reverse envelope, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b10_rift_tear.mp3", "loop": False,
    },
    "env_b10_code_stream": {
        "scene": "B10: Code Cascade Pass",
        "prompt": "Rapid data-burst chirps, FM synthesis stutter, 0.6s, 16-bit Sega Genesis style, retro arcade shmup, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/env_b10_code_stream.mp3", "loop": False,
    },

    # ═══════════════════════════════════════════════
    # Menu / UI SFX (GRO-986)
    # ═══════════════════════════════════════════════
    "ui_hover": {
        "scene": "UI: Button Hover",
        "prompt": "Light high-pitched sine beep, C6 note, 80ms, 16-bit Sega Genesis style, crisp FM synthesis, retro arcade menu, short and impactful, no reverb, no vocals.",
        "duration": 2, "output": "assets/audio/ui_hover.mp3", "loop": False,
    },
    "ui_select": {
        "scene": "UI: Button Confirm",
        "prompt": "Satisfying double chirp, C6 to E6 ascending, 50ms each, 16-bit Sega Genesis style, crisp FM synthesis, retro arcade menu, short and impactful, no reverb, no vocals.",
        "duration": 2, "output": "assets/audio/ui_select.mp3", "loop": False,
    },
    "ui_back": {
        "scene": "UI: Back/Cancel",
        "prompt": "Descending two-note, E5 to C5, 60ms each, 16-bit Sega Genesis style, crisp FM synthesis, retro arcade menu, short and impactful, no reverb, no vocals.",
        "duration": 2, "output": "assets/audio/ui_back.mp3", "loop": False,
    },
    "ui_upgrade_purchase": {
        "scene": "UI: Upgrade Purchased",
        "prompt": "Ascending chime arpeggio, C5-E5-G5-C6, 100ms each, 16-bit Sega Genesis style, bright FM chimes, retro arcade menu, short and impactful, no reverb, no vocals.",
        "duration": 2, "output": "assets/audio/ui_upgrade_purchase.mp3", "loop": False,
    },
    "ui_insufficient": {
        "scene": "UI: Insufficient Scrap",
        "prompt": "Dull buzzy thud, low square wave 150Hz, 0.3s, 16-bit Sega Genesis style, retro arcade menu, short and impactful, no reverb, no vocals.",
        "duration": 2, "output": "assets/audio/ui_insufficient.mp3", "loop": False,
    },
    "ui_transition_in": {
        "scene": "UI: Menu Screen Slide In",
        "prompt": "Rising FM sweep with soft whoosh, 0.4s, 16-bit Sega Genesis style, retro arcade menu, short and impactful, no reverb, no vocals.",
        "duration": 2, "output": "assets/audio/ui_transition_in.mp3", "loop": False,
    },
    "ui_transition_out": {
        "scene": "UI: Menu Screen Slide Out",
        "prompt": "Descending FM sweep, 0.3s, 16-bit Sega Genesis style, retro arcade menu, short and impactful, no reverb, no vocals.",
        "duration": 2, "output": "assets/audio/ui_transition_out.mp3", "loop": False,
    },
    "ui_level_start": {
        "scene": "UI: Sub-Level Start Sting",
        "prompt": "Dramatic ascending sting, FM brass-like, 0.8s, 16-bit Sega Genesis style, retro arcade, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/ui_level_start.mp3", "loop": False,
    },
    "ui_biome_transition": {
        "scene": "UI: Biome Change Sweep",
        "prompt": "Grand transition sweep with unique identifier note, 1.2s, 16-bit Sega Genesis style, FM synthesis sweep, retro arcade, short and impactful, no vocals.",
        "duration": 2, "output": "assets/audio/ui_biome_transition.mp3", "loop": False,
    },
    "ui_pause_in": {
        "scene": "UI: Game Paused",
        "prompt": "Time-stop descending sine blip, 0.2s, 16-bit Sega Genesis style, crisp FM, retro arcade, short and impactful, no reverb, no vocals.",
        "duration": 2, "output": "assets/audio/ui_pause_in.mp3", "loop": False,
    },
    "ui_pause_out": {
        "scene": "UI: Game Unpaused",
        "prompt": "Time-resume ascending sine blip, 0.2s, 16-bit Sega Genesis style, crisp FM, retro arcade, short and impactful, no reverb, no vocals.",
        "duration": 2, "output": "assets/audio/ui_pause_out.mp3", "loop": False,
    },

    # ═══════════════════════════════════════════════
    # Mystery & Wonder Themes (GRO-1017)
    # Discovery, revelation, awe — "what IS this place?"
    # ═══════════════════════════════════════════════
    "mystery_first_contact": {
        "scene": "Mystery: First Contact — Ancient Alien Tech Awakens",
        "prompt": (
            "Moment of first contact with ancient alien technology, "
            "ethereal shimmering synth pads slowly building, mysterious ascending tones, "
            "sense of awe and wonder, 30-second slow build with climactic reveal, "
            "16-bit Sega Genesis style, instrumental, no vocals, wonder-evoking."
        ),
        "duration": 30, "output": "assets/audio/mystery_first_contact.mp3", "loop": True,
    },
    "mystery_biome_reveal": {
        "scene": "Mystery: First Biome Entry — A World Unknown",
        "prompt": (
            "Entering an unknown alien world for the first time, "
            "slow reveal with shimmering crystalline textures, deep ethereal pads, "
            "gentle evolving arpeggios, breathtaking and mysterious, "
            "30-second seamless loop, 16-bit Sega Genesis style, instrumental, no vocals."
        ),
        "duration": 30, "output": "assets/audio/mystery_biome_reveal.mp3", "loop": True,
    },
    "mystery_lyra_vision": {
        "scene": "Mystery: Lyra's Prophetic Vision",
        "prompt": (
            "Mystical vision sequence, floating ethereal pads with subtle choral overtones, "
            "delicate bell-like chimes, slow dreamlike build with moments of revelation, "
            "30-second seamless loop, 16-bit Sega Genesis style, instrumental, no vocals."
        ),
        "duration": 30, "output": "assets/audio/mystery_lyra_vision.mp3", "loop": True,
    },
    "mystery_precursor_awakening": {
        "scene": "Mystery: Precursor Technology Awakening",
        "prompt": (
            "Ancient precursor technology coming to life, low pulsing bass drone, "
            "shimmering high-frequency arpeggios cascading, gradual buildup of complexity, "
            "sense of vast intelligence awakening, 30-second seamless loop, "
            "16-bit Sega Genesis style, instrumental, no vocals, awe and mystery."
        ),
        "duration": 30, "output": "assets/audio/mystery_precursor_awakening.mp3", "loop": True,
    },
    "mystery_hidden_chamber": {
        "scene": "Mystery: Hidden Chamber Discovery",
        "prompt": (
            "Discovering a secret ancient chamber, slow mysterious pads with reverb, "
            "subtle sparkle textures, descending bell tones suggesting depth and age, "
            "30-second seamless loop, 16-bit Sega Genesis style, instrumental, no vocals, "
            "feeling of uncovering something long forgotten."
        ),
        "duration": 30, "output": "assets/audio/mystery_hidden_chamber.mp3", "loop": True,
    },
    "mystery_cosmic_secret": {
        "scene": "Mystery: Cosmic Secret Revealed",
        "prompt": (
            "Uncovering a cosmic-scale secret, vast spacious synth pads, "
            "slow-building celestial arpeggios, shimmering star-like high tones, "
            "awe-inspiring and humbling, 30-second seamless loop, "
            "16-bit Sega Genesis style, instrumental, no vocals."
        ),
        "duration": 30, "output": "assets/audio/mystery_cosmic_secret.mp3", "loop": True,
    },
    "mystery_ancient_signal": {
        "scene": "Mystery: Decoding the Ancient Signal",
        "prompt": (
            "Decoding a mysterious signal from deep space, rhythmic pulsing bass, "
            "ascending pattern sequences suggesting intelligence, shimmering textures, "
            "30-second seamless loop, 16-bit Sega Genesis style, instrumental, no vocals, "
            "curiosity and anticipation building toward understanding."
        ),
        "duration": 30, "output": "assets/audio/mystery_ancient_signal.mp3", "loop": True,
    },
    "mystery_revelation": {
        "scene": "Mystery: Major Story Revelation",
        "prompt": (
            "Dramatic story revelation, slow build from ethereal pads to triumphant climax, "
            "ascending melodic fragments, shimmering textures with emotional weight, "
            "30-second seamless loop, 16-bit Sega Genesis style, instrumental, no vocals, "
            "the moment everything clicks into place."
        ),
        "duration": 30, "output": "assets/audio/mystery_revelation.mp3", "loop": True,
    },
    "mystery_lost_civilization": {
        "scene": "Mystery: Ruins of a Lost Civilization",
        "prompt": (
            "Exploring the ruins of an ancient alien civilization, "
            "hauntingly beautiful synth pads, distant fragmented melodic echoes, "
            "deep resonant bass suggesting immense scale, melancholic wonder, "
            "30-second seamless loop, 16-bit Sega Genesis style, instrumental, no vocals."
        ),
        "duration": 30, "output": "assets/audio/mystery_lost_civilization.mp3", "loop": True,
    },
    "mystery_transcendence": {
        "scene": "Mystery: Moment of Transcendence",
        "prompt": (
            "Moment of transcendence and cosmic understanding, "
            "ascending shimmering pads reaching toward the heavens, "
            "slow buildup to breathtaking climax of pure wonder, "
            "30-second seamless loop, 16-bit Sega Genesis style, instrumental, no vocals, "
            "becoming one with something greater."
        ),
        "duration": 30, "output": "assets/audio/mystery_transcendence.mp3", "loop": True,
    },

}

REPO_ROOT = Path(__file__).parent
AUDIO_DIR = REPO_ROOT / "assets" / "audio"
PROJECT_ID = "darius-star-game"
LOCATION = "us-central1"
MODEL_PATH = "publishers/google/models/lyria-002"


def generate_lyria(prompt: str) -> bytes | None:
    """Generate music via Lyria 2 Vertex AI.

    Returns raw audio bytes (WAV format) on success, None on failure.
    """
    try:
        from google.cloud import aiplatform
        from google.protobuf import json_format
        from google.protobuf.struct_pb2 import Value

        client = aiplatform.gapic.PredictionServiceClient(
            client_options={"api_endpoint": "aiplatform.googleapis.com"}
        )

        instance = json_format.ParseDict({"prompt": prompt}, Value())
        endpoint_path = (
            f"projects/{PROJECT_ID}/locations/{LOCATION}/{MODEL_PATH}"
        )

        response = client.predict(endpoint=endpoint_path, instances=[instance])

        for pred in response.predictions:
            # Lyria returns bytesBase64Encoded WAV audio
            b64 = dict(pred).get("bytesBase64Encoded", "")
            if b64:
                data = base64.b64decode(b64)
                print(f"  ✓ Generated: {len(data)} bytes (WAV)")
                return data

        print("  ✗ No audio in response")
        return None

    except ImportError:
        print("  ✗ google-cloud-aiplatform not installed.")
        print("  → pip install google-cloud-aiplatform")
        return None
    except Exception as e:
        print(f"  ✗ API error: {type(e).__name__}: {e}")
        return None


def save_audio(data: bytes, output_path: str):
    """Save audio bytes to file, converting WAV to MP3."""
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    tmp_wav = path.with_suffix(".wav")
    with open(tmp_wav, "wb") as f:
        f.write(data)

    # Convert to MP3 using ffmpeg
    try:
        subprocess.run([
            "ffmpeg", "-i", str(tmp_wav),
            "-codec:a", "libmp3lame", "-b:a", "128k",
            "-y", str(path),
        ], capture_output=True, check=True, timeout=30)
        tmp_wav.unlink()
        size_kb = path.stat().st_size / 1024
        print(f"  ✓ Saved: {path.name} ({size_kb:.0f} KB MP3)")
    except (subprocess.CalledProcessError, FileNotFoundError):
        tmp_wav.rename(path)
        size_kb = path.stat().st_size / 1024
        print(f"  ✓ Saved: {path.name} ({size_kb:.0f} KB WAV)")


def generate_audio_manifest():
    """Generate audio_manifest.json for the AudioManager class."""
    manifest = {
        "version": 1,
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "tracks": {}
    }

    for track_id, config in MUSIC_CATALOG.items():
        output_path = Path(config["output"])
        exists = output_path.exists()
        manifest["tracks"][track_id] = {
            "scene": config["scene"],
            "file": output_path.name,
            "path": config["output"],
            "duration_sec": config["duration"],
            "loop": config["loop"],
            "generated": exists,
            "size_bytes": output_path.stat().st_size if exists else 0,
        }

    manifest_path = AUDIO_DIR / "audio_manifest.json"
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n✓ Manifest: {manifest_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Darius Star — Lyria 2 Audio Generator (Vertex AI)"
    )
    parser.add_argument(
        "--check", action="store_true",
        help="Verify Lyria API connection"
    )
    parser.add_argument(
        "--list", action="store_true",
        help="List all music prompts"
    )
    parser.add_argument(
        "--track", nargs="*", default=None,
        help="Generate specific track(s) (e.g., 'title', 'phase1', 'boss_loop')"
    )
    parser.add_argument(
        "--all", action="store_true",
        help="Generate all 14 music tracks"
    )
    parser.add_argument(
        "--manifest", action="store_true",
        help="Only regenerate audio_manifest.json"
    )
    parser.add_argument(
        "--delay", type=float, default=3.0,
        help="Seconds between Lyria API calls (default: 3s)"
    )
    args = parser.parse_args()

    print(f"\n{'='*60}")
    print(f"  Darius Star — Lyria 2 Audio Generator")
    print(f"  Model: {MODEL_PATH}")
    print(f"  Tracks: {len(MUSIC_CATALOG)}")
    print(f"{'='*60}\n")

    if args.list:
        print(f"Music Catalog ({len(MUSIC_CATALOG)} tracks):\n")
        total_cost = 0
        for track_id, config in MUSIC_CATALOG.items():
            cost = 0.04 if config["duration"] >= 20 else 0.02
            total_cost += cost
            print(f"  [{config['scene']}]")
            print(f"    ID: {track_id} | {config['duration']}s | Loop: {config['loop']}")
            print(f"    Output: {config['output']} (~${cost:.2f})")
            print()
        print(f"  Total: ~${total_cost:.2f}")
        return 0

    if args.check:
        print("Testing Lyria 2 connection...")
        data = generate_lyria("single piano note C major, 2 seconds")
        if data:
            print(f"✅ Lyria 2: connected ({len(data)} bytes)")
            return 0
        else:
            print("❌ Lyria 2: failed")
            return 1

    if args.manifest:
        generate_audio_manifest()
        return 0

    # Determine what to generate
    if args.track:
        unknown = [t for t in args.track if t not in MUSIC_CATALOG]
        if unknown:
            print(f"Unknown track(s): {', '.join(unknown)}")
            print(f"Available: {', '.join(MUSIC_CATALOG.keys())}")
            return 1
        tracks = {t: MUSIC_CATALOG[t] for t in args.track}
    elif args.all:
        tracks = MUSIC_CATALOG
    else:
        print("Specify --track <id> or --all")
        return 1

    import time
    generated = []
    failed = []

    for track_id, config in tracks.items():
        print(f"\n[{config['scene']}] {track_id}")
        print(f"  Prompt: {config['prompt'][:80]}...")

        data = generate_lyria(config["prompt"])
        if data:
            save_audio(data, config["output"])
            generated.append(track_id)
        else:
            failed.append(track_id)

        # Rate limit
        if list(tracks.keys())[-1] != track_id:
            time.sleep(args.delay)

    # Generate manifest
    generate_audio_manifest()

    # Summary
    print(f"\n{'='*60}")
    print(f"  Results: {len(generated)} generated, {len(failed)} failed")
    if generated:
        print(f"  ✅ {', '.join(generated)}")
    if failed:
        print(f"  ❌ {', '.join(failed)}")
    print(f"{'='*60}\n")

    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
