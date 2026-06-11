#!/usr/bin/env python3
"""
Veo 3.1 Client — Vertex AI Model Garden
=========================================
Video generation client for Darius Star: Cyber Coelacanth.
Generates animated sprite cycles, parallax backgrounds, VFX with audio.

STATUS: Veo LIVE — veo-3.1-lite-generate-001 confirmed working (HTTP 200).
        Imagen 3 works (HTTP 200). 1 request/minute quota.

PREREQUISITES (all working):
  1. GCP project with Vertex AI API enabled ✅ (darius-star-game)
  2. gcloud auth ✅ (mbgulden@gmail.com)
  3. Veo model enabled ✅ (veo-3.1-lite-generate-001)
  4. Quota: 1 request/minute — auto-spaced 90s apart

Usage (once Veo is enabled):
  python3 veo_client.py --asset enemy_scout_cycle
  python3 veo_client.py --category backgrounds
"""

import os
import sys
import json
import time
import argparse
import base64
import subprocess
import tempfile
from pathlib import Path
from datetime import datetime, timezone

# ──────────────────────────────────────────────
# Veo Asset Catalog — prompts for video generation
# ──────────────────────────────────────────────

VEO_ASSET_CATALOG = {
    # ── GRO-906 VFX with native synchronized audio ──
    "player_laser": {
        "category": "GRO-906 VFX",
        "prompt": (
            "Single cyan laser bolt firing from right to left, 16-bit pixel art, "
            "bright core with softer glow edges, muzzle flash at origin point, "
            "with synchronized sharp pew sound effect — crisp, short, satisfying, "
            "like a Sega Genesis laser sound, 1 second, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "player_laser",
        "extract_frames": True,
    },
    "enemy_laser": {
        "category": "GRO-906 VFX",
        "prompt": (
            "Red enemy blaster bolt firing from left to right, 16-bit pixel art, "
            "menacing red energy projectile with dark glow, "
            "with synchronized harsh zap sound — sharp, threatening, "
            "like an alien weapon discharging, 1 second, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "enemy_laser",
        "extract_frames": True,
    },
    "small_explosion": {
        "category": "GRO-906 VFX",
        "prompt": (
            "Small enemy ship explosion, 16-bit pixel art, "
            "orange fireball expanding from center, debris particles scattering outward, "
            "with synchronized satisfying pop-boom sound — crisp initial crack "
            "followed by short rumble tail, classic arcade explosion, 1 second, "
            "transparent background, static position."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "small_explosion",
        "extract_frames": True,
    },
    "large_explosion": {
        "category": "GRO-906 VFX",
        "prompt": (
            "Large boss-damage explosion, 16-bit pixel art, "
            "massive multi-layered fireball, orange core with yellow edges, "
            "smoke ring expanding, sparks flying, "
            "with synchronized deep booming explosion — powerful bass thud "
            "followed by crackling debris, cinematic impact, 2 seconds, "
            "transparent background, static position."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "large_explosion",
        "extract_frames": True,
    },
    "shield_activation": {
        "category": "GRO-906 VFX",
        "prompt": (
            "Blue energy shield activating around a spaceship, 16-bit pixel art, "
            "translucent cyan force-field ring expanding outward from center, "
            "pulsing once then stabilizing into a sphere, "
            "with synchronized rising hum sound — starting low, quickly sweeping up "
            "to a bright sustained energy tone, satisfying shield power-up audio, "
            "1 second, transparent background, static position."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "shield_activation",
        "extract_frames": True,
    },
    "shield_hit": {
        "category": "GRO-906 VFX",
        "prompt": (
            "Energy shield being struck by enemy fire, 16-bit pixel art, "
            "cyan force-field flashing white at impact point, ripple rings spreading, "
            "with synchronized metallic clang mixed with electrical crackle — "
            "sharp impact followed by fizzing static discharge, "
            "1 second, transparent background, static position."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "shield_hit",
        "extract_frames": True,
    },
    "powerup_pickup": {
        "category": "GRO-906 VFX",
        "prompt": (
            "Red weapon power-up orb being collected, 16-bit pixel art, "
            "orb shattering into particles that fly upward, bright red glow burst, "
            "with synchronized ascending power-up chime — "
            "rising arpeggio of 4 notes, each higher and brighter, "
            "classic arcade weapon-upgrade jingle, 1 second, transparent background, "
            "static position."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "powerup_pickup",
        "extract_frames": True,
    },
    "boss_laser_beam": {
        "category": "GRO-906 VFX",
        "prompt": (
            "Massive horizontal cyan laser beam erupting from a cannon, 16-bit pixel art, "
            "thick brilliant beam with white-hot core, expanding shockwave rings, "
            "with synchronized devastating laser blast — "
            "deep bass explosion followed by sustained roaring energy beam, "
            "powerful enough to shake the screen, 2 seconds, static position."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "boss_laser_beam",
        "extract_frames": True,
    },

    # ── Animated Enemy Cycles ──
    "enemy_scout_cycle": {
        "category": "Animated Sprites",
        "prompt": (
            "4-frame walk cycle of a robotic anglerfish enemy, 16-bit pixel art, "
            "side-scrolling shoot-em-up style, cyberpunk biomechanical aesthetic, "
            "neon orange metallic scales, glowing cyan lure, consistent character, "
            "transparent background, 256x256, frame-by-frame animation, "
            "no camera movement, static side view."
        ),
        "duration_sec": 4,
        "fps": 8,
        "output_prefix": "scout_cycle",
        "extract_frames": True,
    },
    "enemy_interceptor_cycle": {
        "category": "Animated Sprites",
        "prompt": (
            "4-frame charge/pulse cycle of a mechanical jellyfish enemy, 16-bit pixel art, "
            "side-scrolling shoot-em-up style, neon pink fiber-optic tentacles, "
            "translucent dome with circuitry patterns, pulsing motion, "
            "consistent character, transparent background, 256x256, "
            "no camera movement, static side view."
        ),
        "duration_sec": 4,
        "fps": 8,
        "output_prefix": "interceptor_cycle",
        "extract_frames": True,
    },
    "enemy_heavy_cycle": {
        "category": "Animated Sprites",
        "prompt": (
            "4-frame slither cycle of a robotic electric eel enemy, 16-bit pixel art, "
            "side-scrolling shoot-em-up style, translucent circuitry patterns, "
            "electric blue arcs along body, metallic segments, "
            "consistent character, transparent background, 256x256, "
            "no camera movement, static side view."
        ),
        "duration_sec": 4,
        "fps": 8,
        "output_prefix": "heavy_cycle",
        "extract_frames": True,
    },
    "boss_idle": {
        "category": "Animated Sprites",
        "prompt": (
            "4-frame idle bobbing animation of a massive Cyber Coelacanth dreadnought boss, "
            "16-bit pixel art, biomechanical plating, armored prehistoric fish silhouette, "
            "red optic sensors slowly pulsing, neon pink dorsal fins gently waving, "
            "exhaust vents venting faint cyan plasma, "
            "consistent design, dark transparent background, 512x512, "
            "no camera movement, static side view, subtle idle motion only."
        ),
        "duration_sec": 4,
        "fps": 8,
        "output_prefix": "boss_idle",
        "extract_frames": True,
    },
    "boss_rage": {
        "category": "Animated Sprites",
        "prompt": (
            "4-frame rage pulse animation of Cyber Coelacanth boss entering combat mode, "
            "16-bit pixel art, biomechanical armor plates shifting, red sensors blazing bright, "
            "neon pink fins fully extended, cyan plasma venting intensively, "
            "glowing rage aura pulsing around the ship, screen shake effect, "
            "consistent character, dark background, 512x512, "
            "no camera movement, static side view."
        ),
        "duration_sec": 4,
        "fps": 8,
        "output_prefix": "boss_rage",
        "extract_frames": True,
    },
    "boss_laser_charge": {
        "category": "Animated Sprites",
        "prompt": (
            "4-frame laser charging animation of Cyber Coelacanth boss, "
            "16-bit pixel art, massive front cannon gathering cyan energy, "
            "charging particles swirling around the barrel, ship vibrating slightly, "
            "increasing glow intensity, biomechanical details illuminated by charge, "
            "consistent character, dark background, 512x512, "
            "no camera movement, static side view."
        ),
        "duration_sec": 4,
        "fps": 8,
        "output_prefix": "boss_laser_charge",
        "extract_frames": True,
    },
    "boss_death": {
        "category": "Animated Sprites",
        "prompt": (
            "8-frame death/explosion sequence of Cyber Coelacanth boss, "
            "16-bit pixel art, stage 1: armor cracking, stage 2: internal fires erupting, "
            "stage 3: chain explosions across body, stage 4: final core meltdown, "
            "consistent character wreckage, dark background with expanding shockwave, "
            "512x512, frame-by-frame destruction sequence."
        ),
        "duration_sec": 4,
        "fps": 8,
        "output_prefix": "boss_death",
        "extract_frames": True,
    },

    # ── Background Loops ──
    "bg_abyssal_trench": {
        "category": "Background Loops",
        "prompt": (
            "Seamless looping parallax background, 16-bit pixel art, "
            "deep ocean trench with neon hydrothermal vents, "
            "bioluminescent particles drifting upward, "
            "dark cyberpunk industrial pipes embedded in rock walls, "
            "subtle water current distortion, horizontal scroll-ready, "
            "800x450, seamless loop, retro arcade shmup."
        ),
        "duration_sec": 8,
        "fps": 15,
        "output_prefix": "bg_abyssal_trench",
        "extract_frames": True,
        "loop": True,
    },
    "bg_coral_graveyard": {
        "category": "Background Loops",
        "prompt": (
            "Seamless looping parallax background, 16-bit pixel art, "
            "shattered neon coral formations, floating debris with cyan glow, "
            "electric arcs jumping between broken structures, "
            "dark water with particulate matter, bioluminescent flora on wreckage, "
            "horizontal scroll-ready, 800x450, seamless loop, retro arcade shmup."
        ),
        "duration_sec": 8,
        "fps": 15,
        "output_prefix": "bg_coral_graveyard",
        "extract_frames": True,
        "loop": True,
    },
    "bg_coelacanth_lair": {
        "category": "Background Loops",
        "prompt": (
            "Seamless looping parallax background, 16-bit pixel art, "
            "biomechanical cavern with pulsing organic-metal walls, "
            "glowing red optic sensors embedded in flesh-metal surfaces, "
            "cyan plasma dripping from ceiling vents, "
            "distant mechanical heartbeat rhythm, "
            "horizontal scroll-ready, 800x450, seamless loop, retro arcade shmup."
        ),
        "duration_sec": 8,
        "fps": 15,
        "output_prefix": "bg_coelacanth_lair",
        "extract_frames": True,
        "loop": True,
    },
    "bg_title": {
        "category": "Background Loops",
        "prompt": (
            "Seamless looping parallax background, 16-bit pixel art, "
            "deep space starfield with distant nebula clouds in purple and cyan hues, "
            "slowly drifting stellar dust lanes, faint pulsing stars, "
            "subtle parallax depth with bright foreground stars and dim background stars, "
            "horizontal scroll-ready, 800x450, seamless loop, retro arcade shmup title screen."
        ),
        "duration_sec": 8,
        "fps": 15,
        "output_prefix": "bg_title",
        "extract_frames": True,
        "loop": True,
    },

    # ── VFX with Audio ──
    "vfx_player_laser": {
        "category": "VFX with Audio",
        "prompt": (
            "Player laser fire effect, 16-bit pixel art, cyan energy beam burst, "
            "muzzle flash with expanding ring, bright core with softer edges, "
            "with synchronized pew sound effect, transparent background, "
            "1 second, 256x64, static position, retro arcade shmup."
        ),
        "duration_sec": 1,
        "fps": 15,
        "output_prefix": "vfx_player_laser",
        "extract_frames": True,
    },
    "vfx_explosion_large": {
        "category": "VFX with Audio",
        "prompt": (
            "Large multi-stage explosion, 16-bit pixel art, "
            "initial bright flash → expanding fireball with orange/yellow/white layers → "
            "smoke ring expanding → debris particles scattering, "
            "with synchronized boom-then-crackle sound effect, "
            "transparent background, 256x256, 2 seconds, retro arcade shmup."
        ),
        "duration_sec": 2,
        "fps": 15,
        "output_prefix": "vfx_explosion_large",
        "extract_frames": True,
    },

    # ── Cinematics ──
    "cinematic_boss_intro": {
        "category": "Cinematics",
        "prompt": (
            "Cinematic boss entrance, 16-bit pixel art, "
            "Cyber Coelacanth dreadnought emerging from dark biomechanical abyss, "
            "armored plating shifting into place, red optic sensors igniting one by one "
            "in sequence, camera shake on each ignition, neon exhaust ports venting cyan plasma, "
            "final shot pauses on full ship reveal with ominous red glow, "
            "with synchronized dramatic orchestral sting sound, "
            "15 seconds, 800x450, cinematic camera moves, retro arcade shmup."
        ),
        "duration_sec": 15,
        "fps": 24,
        "output_prefix": "cinematic_boss_intro",
        "extract_frames": False,
    },
    "cinematic_victory": {
        "category": "Cinematics",
        "prompt": (
            "Victory cinematic, 16-bit pixel art, "
            "Cyber Coelacanth exploding in slow motion, "
            "armored plates peeling away layer by layer, internal circuitry sparking, "
            "final core meltdown with expanding blue-white shockwave, "
            "debris field settling into stillness, "
            "player ship silhouette flying through wreckage toward distant stars, "
            "with synchronized triumphant chiptune fanfare, "
            "12 seconds, 800x450, cinematic camera moves, retro arcade shmup."
        ),
        "duration_sec": 12,
        "fps": 24,
        "output_prefix": "cinematic_victory",
        "extract_frames": False,
    },
    # ═══════════════════════════════════════════════
    # SFX with Synchronized Audio (Veo 3.1)
    # ═══════════════════════════════════════════════
    "sfx_player_laser_l1": {
        "category": "SFX Audio",
        "prompt": (
            "Single cyan laser bolt firing from right to left, 16-bit pixel art, "
            "bright core with softer glow edges, muzzle flash at origin point, "
            "with synchronized sharp pew sound effect — crisp, short, satisfying, "
            "like a Sega Genesis laser sound, 0.5 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_player_laser_l1",
        "extract_frames": True,
    },
    "sfx_player_laser_l3": {
        "category": "SFX Audio",
        "prompt": (
            "Triple yellow laser spread firing from right to left, 16-bit pixel art, "
            "three parallel beams with bright cores, widening spread pattern, "
            "with synchronized deeper powerful pew sound — heavier, more bass, "
            "satisfying triple-fire audio, 0.8 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_player_laser_l3",
        "extract_frames": True,
    },
    "sfx_player_laser_l5": {
        "category": "SFX Audio",
        "prompt": (
            "Massive white nova beam firing from right to left, 16-bit pixel art, "
            "thick brilliant white energy beam with purple corona, screen-shaking intensity, "
            "with synchronized thunderous bass-heavy blast sound — the ultimate weapon, "
            "deep satisfying rumble with crackling energy, 1 second, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_player_laser_l5",
        "extract_frames": True,
    },
    "sfx_enemy_laser": {
        "category": "SFX Audio",
        "prompt": (
            "Red enemy blaster bolt firing from left to right, 16-bit pixel art, "
            "menacing red energy projectile with dark glow, "
            "with synchronized harsh zap sound — sharp, threatening, "
            "like an alien weapon discharging, 0.5 seconds, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_enemy_laser",
        "extract_frames": True,
    },
    "sfx_explosion_small": {
        "category": "SFX Audio",
        "prompt": (
            "Small enemy ship explosion, 16-bit pixel art, "
            "orange fireball expanding from center, debris particles scattering outward, "
            "with synchronized satisfying pop-boom sound — crisp initial crack "
            "followed by short rumble tail, classic arcade explosion, 1 second, "
            "transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_explosion_small",
        "extract_frames": True,
    },
    "sfx_explosion_large": {
        "category": "SFX Audio",
        "prompt": (
            "Large boss-damage explosion, 16-bit pixel art, "
            "massive multi-layered fireball, orange core with yellow edges, "
            "smoke ring expanding, sparks flying, "
            "with synchronized deep booming explosion — powerful bass thud "
            "followed by crackling debris, cinematic impact, 2 seconds, transparent background."
        ),
        "duration_sec": 2, "fps": 15,
        "output_prefix": "sfx_explosion_large",
        "extract_frames": True,
    },
    "sfx_boss_death": {
        "category": "SFX Audio",
        "prompt": (
            "Massive boss destruction sequence, 16-bit pixel art, "
            "chain explosions rippling across a large mechanical structure, "
            "final core meltdown with expanding blue-white shockwave, "
            "with synchronized epic multi-stage destruction audio — "
            "initial catastrophic boom, cascading smaller explosions, "
            "deep resonant final blast with metallic debris rain, 4 seconds."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_boss_death",
        "extract_frames": True,
    },
    "sfx_shield_activate": {
        "category": "SFX Audio",
        "prompt": (
            "Blue energy shield activating around a spaceship, 16-bit pixel art, "
            "translucent cyan force-field ring expanding outward from center, "
            "pulsing once then stabilizing into a sphere, "
            "with synchronized rising hum sound — starting low, quickly sweeping up "
            "to a bright sustained energy tone, satisfying shield power-up audio, "
            "1 second, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_shield_activate",
        "extract_frames": True,
    },
    "sfx_shield_hit": {
        "category": "SFX Audio",
        "prompt": (
            "Energy shield being struck by enemy fire, 16-bit pixel art, "
            "cyan force-field flashing white at impact point, ripple rings spreading, "
            "with synchronized metallic clang mixed with electrical crackle — "
            "sharp impact followed by fizzing static discharge, "
            "1 second, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_shield_hit",
        "extract_frames": True,
    },
    "sfx_powerup_weapon": {
        "category": "SFX Audio",
        "prompt": (
            "Red weapon power-up orb being collected, 16-bit pixel art, "
            "orb shattering into particles that fly upward, bright red glow burst, "
            "with synchronized ascending power-up chime — "
            "rising arpeggio of 4 notes, each higher and brighter, "
            "classic arcade weapon-upgrade jingle, 0.8 seconds, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_powerup_weapon",
        "extract_frames": True,
    },
    "sfx_powerup_shield": {
        "category": "SFX Audio",
        "prompt": (
            "Green shield restore orb being collected, 16-bit pixel art, "
            "orb dissolving into healing particles that swirl inward, soft green glow, "
            "with synchronized soothing restoration chime — "
            "gentle rising tone with harmonic overtone, healing/recovery sound, "
            "0.8 seconds, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_powerup_shield",
        "extract_frames": True,
    },
    "sfx_boss_laser_charge": {
        "category": "SFX Audio",
        "prompt": (
            "Massive boss cannon charging up, 16-bit pixel art, "
            "cyan energy particles spiraling into the cannon barrel, "
            "glow intensifying from dim to blinding, screen vibrating, "
            "with synchronized charging whine — starting as low hum, "
            "rising in pitch and intensity over 2 seconds, "
            "culminating in a held high-frequency energy peak, "
            "threatening and ominous, 2 seconds."
        ),
        "duration_sec": 2, "fps": 15,
        "output_prefix": "sfx_boss_laser_charge",
        "extract_frames": True,
    },
    "sfx_boss_laser_fire": {
        "category": "SFX Audio",
        "prompt": (
            "Massive horizontal cyan laser beam erupting from a cannon, 16-bit pixel art, "
            "thick brilliant beam with white-hot core, expanding shockwave rings, "
            "with synchronized devastating laser blast — "
            "deep bass explosion followed by sustained roaring energy beam, "
            "powerful enough to shake the screen, 2 seconds."
        ),
        "duration_sec": 2, "fps": 15,
        "output_prefix": "sfx_boss_laser_fire",
        "extract_frames": True,
    },
    "sfx_boss_siren": {
        "category": "SFX Audio",
        "prompt": (
            "Red alert siren effect, 16-bit pixel art, "
            "flashing red warning lights pulsing in sequence, "
            "with synchronized urgent alarm siren — "
            "alternating high-low pitch in rapid pattern, "
            "classic boss-warning klaxon, attention-grabbing, 1.5 seconds."
        ),
        "duration_sec": 2, "fps": 15,
        "output_prefix": "sfx_boss_siren",
        "extract_frames": True,
    },
    "sfx_engine_hum": {
        "category": "SFX Audio",
        "prompt": (
            "Spaceship engine thruster flame burning steadily, 16-bit pixel art, "
            "blue-white flame with subtle flicker, exhaust particles, "
            "with synchronized constant low engine hum — "
            "deep bass drone with subtle harmonic overtones, "
            "smooth continuous rumble, 3 seconds, transparent background."
        ),
        "duration_sec": 3, "fps": 15,
        "output_prefix": "sfx_engine_hum",
        "extract_frames": True,
    },
    "sfx_enemy_spawn": {
        "category": "SFX Audio",
        "prompt": (
            "Enemy ship materializing from a portal, 16-bit pixel art, "
            "dark portal ring expanding then collapsing, enemy ship appearing, "
            "with synchronized menacing spawn sound — "
            "low whoosh rising then cutting off sharply, "
            "like something emerging from the void, 0.8 seconds, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_enemy_spawn",
        "extract_frames": True,
    },
    "sfx_level_clear": {
        "category": "SFX Audio",
        "prompt": (
            "Level clear celebration effect, 16-bit pixel art, "
            "burst of golden sparkles and confetti particles, "
            "with synchronized triumphant fanfare sting — "
            "bright major chord resolution, 3 ascending notes, "
            "pure arcade satisfaction, 1 second, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_level_clear",
        "extract_frames": True,
    },
    "sfx_menu_select": {
        "category": "SFX Audio",
        "prompt": (
            "Menu selection click effect, 16-bit pixel art, "
            "small cyan flash dot appearing and fading, "
            "with synchronized crisp UI click sound — "
            "short bright ping, satisfying menu navigation tone, "
            "0.3 seconds, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_menu_select",
        "extract_frames": True,
    },
    "sfx_game_start": {
        "category": "SFX Audio",
        "prompt": (
            "Game start sequence effect, 16-bit pixel art, "
            "arcade countdown numbers 3-2-1 appearing in sequence, "
            "with synchronized dramatic launch sting — "
            "building tension, three accelerating beeps, then explosive GO blast, "
            "2 seconds, retro arcade style."
        ),
        "duration_sec": 2, "fps": 15,
        "output_prefix": "sfx_game_start",
        "extract_frames": True,
    },
    # ═══════════════════════════════════════════════
    # Damage & Collision SFX
    # ═══════════════════════════════════════════════
    "sfx_player_hit_laser": {
        "category": "SFX Audio",
        "prompt": (
            "Player ship being struck by enemy laser, 16-bit pixel art, "
            "cyan shield flashing white at impact, energy ripple rings, "
            "with synchronized electrical sizzle sound — sharp crackling static "
            "mixed with metallic ping, like energy weapon hitting armor, "
            "short and impactful, 0.5 seconds, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_player_hit_laser",
        "extract_frames": True,
    },
    "sfx_player_hit_rocket": {
        "category": "SFX Audio",
        "prompt": (
            "Player ship being struck by enemy rocket, 16-bit pixel art, "
            "orange explosion flash at impact point, hull fragments scattering, "
            "with synchronized heavy explosive impact — deep bass thud "
            "followed by metallic screech of tearing armor, "
            "heavier and more violent than laser hit, 0.8 seconds, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_player_hit_rocket",
        "extract_frames": True,
    },
    "sfx_collision_ship": {
        "category": "SFX Audio",
        "prompt": (
            "Two spaceships colliding head-on, 16-bit pixel art, "
            "metal hulls crumpling together, sparks flying from impact zone, "
            "with synchronized harsh metal-on-metal crunch sound — "
            "grinding screech followed by buckling thud, "
            "like a car crash in space, 0.8 seconds, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_collision_ship",
        "extract_frames": True,
    },
    "sfx_player_low_health": {
        "category": "SFX Audio",
        "prompt": (
            "Red warning indicator flashing on a cockpit dashboard, 16-bit pixel art, "
            "pulsing red light with increasing urgency, "
            "with synchronized urgent low-health warning beep — "
            "high-pitched repeating pulse, faster as health decreases, "
            "anxiety-inducing but not annoying, classic arcade danger alert, "
            "1.5 seconds, transparent background."
        ),
        "duration_sec": 2, "fps": 15,
        "output_prefix": "sfx_player_low_health",
        "extract_frames": True,
    },
    "sfx_player_death": {
        "category": "SFX Audio",
        "prompt": (
            "Player ship total destruction, 16-bit pixel art, "
            "ship breaking apart into large chunks, core reactor going critical, "
            "final bright white flash consuming everything, "
            "with synchronized dramatic player death sound — "
            "initial catastrophic explosion, secondary smaller blasts as systems fail, "
            "fading into silence, 2 seconds, transparent background."
        ),
        "duration_sec": 2, "fps": 15,
        "output_prefix": "sfx_player_death",
        "extract_frames": True,
    },
    # ═══════════════════════════════════════════════
    # Enemy Weapon SFX
    # ═══════════════════════════════════════════════
    "sfx_enemy_rocket_launch": {
        "category": "SFX Audio",
        "prompt": (
            "Enemy rocket launching from a heavy ship, 16-bit pixel art, "
            "orange missile with smoke trail emerging from launcher, "
            "with synchronized rocket launch whoosh — "
            "initial ignition crack, then accelerating deep rumble as it flies, "
            "menacing and directional, 0.8 seconds, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_enemy_rocket_launch",
        "extract_frames": True,
    },
    "sfx_enemy_rocket_travel": {
        "category": "SFX Audio",
        "prompt": (
            "Enemy rocket traveling through space, 16-bit pixel art, "
            "missile with smoke trail, moving fast, "
            "with synchronized rocket flyby sound — "
            "doppler-effect whoosh, rising then falling pitch as it passes, "
            "classic projectile travel sound, 0.5 seconds, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_enemy_rocket_travel",
        "extract_frames": True,
    },
    "sfx_enemy_mine_drop": {
        "category": "SFX Audio",
        "prompt": (
            "Enemy ship dropping a proximity mine, 16-bit pixel art, "
            "spiked metal sphere with blinking red light falling from ship, "
            "with synchronized mine deployment clunk — "
            "mechanical click followed by arming beep, "
            "ominous and deliberate, 0.5 seconds, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_enemy_mine_drop",
        "extract_frames": True,
    },
    # ═══════════════════════════════════════════════
    # Gameplay Feedback SFX
    # ═══════════════════════════════════════════════
    "sfx_score_milestone": {
        "category": "SFX Audio",
        "prompt": (
            "Score counter ticking up rapidly with milestone celebration, 16-bit pixel art, "
            "numbers glowing gold as they roll over, sparkle particles, "
            "with synchronized score milestone chime — "
            "bright ascending ding-ding-ding like a pinball machine jackpot, "
            "satisfying reward feedback, 1 second, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_score_milestone",
        "extract_frames": True,
    },
    "sfx_wave_incoming": {
        "category": "SFX Audio",
        "prompt": (
            "New enemy wave incoming warning, 16-bit pixel art, "
            "arrow indicators appearing at screen edge pointing right, "
            "with synchronized wave alert sting — "
            "two-note rising alarm, similar to classic arcade 'new enemies approaching' sound, "
            "attention-grabbing but short, 0.5 seconds, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_wave_incoming",
        "extract_frames": True,
    },
    "sfx_weapon_overheat": {
        "category": "SFX Audio",
        "prompt": (
            "Weapon system overheating warning, 16-bit pixel art, "
            "temperature gauge going from green to red, steam venting, "
            "with synchronized overheat alarm — "
            "rising pitched whine that cuts off with a steam-release hiss, "
            "urgency and mechanical stress, 1 second, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_weapon_overheat",
        "extract_frames": True,
    },
    "sfx_shield_break": {
        "category": "SFX Audio",
        "prompt": (
            "Energy shield shattering, 16-bit pixel art, "
            "cyan force-field cracking like glass, fragments dissolving, "
            "with synchronized shield break sound — "
            "initial high-pitched crack like breaking glass, "
            "followed by power-down descending whine as energy fades, "
            "dramatic and final, 1 second, transparent background."
        ),
        "duration_sec": 1, "fps": 15,
        "output_prefix": "sfx_shield_break",
        "extract_frames": True,
    },
    "sfx_achievement": {
        "category": "SFX Audio",
        "prompt": (
            "Achievement unlocked popup appearing, 16-bit pixel art, "
            "golden banner unfurling with sparkle effects, "
            "with synchronized achievement fanfare — "
            "triumphant ascending melody, like finding a rare item, "
            "pure gaming dopamine hit, 1.5 seconds, transparent background."
        ),
        "duration_sec": 2, "fps": 15,
        "output_prefix": "sfx_achievement",
        "extract_frames": True,
    },
    # ═══════════════════════════════════════════════
    # GRO-922: Explosion Variety
    # ═══════════════════════════════════════════════
    "explosion_player_l1_a": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Small cyan sphere explosion, 16-bit pixel art, "
            "#00FFFF bright center with softer halo edges, rapid expand-and-fade, "
            "8-frame burst cycle, clean energy discharge with no debris, "
            "with synchronized short crisp burst like a Yamaha YM2612 sine blip — "
            "sharp and satisfying arcade pop, 0.2 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_player_l1_a",
        "extract_frames": True,
    },
    "explosion_player_l1_b": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Quick pink starburst explosion, 16-bit pixel art, "
            "#FF0055 neon flash in a 4-point star shape, instant brightness bloom, "
            "fast in-and-out, minimal persistence, "
            "with synchronized high-pitched FM ping sound — "
            "like a sharp metallic plink, 0.15 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_player_l1_b",
        "extract_frames": True,
    },
    "explosion_player_l1_c": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Tiny orange ring pop explosion, 16-bit pixel art, "
            "#FF5500 ring expanding once then dissolving, thin bright edge with transparent interior, "
            "simple clean geometric burst, "
            "with synchronized soft low-pass thud sound — "
            "gentle bass pop with quick decay, 0.2 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_player_l1_c",
        "extract_frames": True,
    },
    "explosion_player_l2_a": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Medium cyan sphere explosion, 16-bit pixel art, "
            "#00FFFF with layered glow, larger than L1, 10-frame expansion, "
            "brighter core with pulsing outer halo, small spark particles at edges, "
            "with synchronized satisfying pew-boom sound — crisp initial pop followed by short bass tail, "
            "arcade intermediate weapon impact, 0.3 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_player_l2_a",
        "extract_frames": True,
    },
    "explosion_player_l2_b": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Dual-ring cyan explosion, 16-bit pixel art, "
            "inner #00FFFF ring and outer lighter cyan ring expanding at different speeds, "
            "interference sparkle where rings overlap, bright flash center, "
            "with synchronized dual-tone arcade chord — two-note ascending FM blast, "
            "satisfying mid-tier impact, 0.3 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_player_l2_b",
        "extract_frames": True,
    },
    "explosion_player_l2_c": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Pink starburst with orange halo explosion, 16-bit pixel art, "
            "#FF0055 core flash with #FF5500 outer ring, rapid 3-pulse sequence, "
            "each pulse slightly smaller, lingering spark particles, "
            "with synchronized triple-FM-stab sound — three rapid arcade hits descending in pitch, "
            "0.3 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_player_l2_c",
        "extract_frames": True,
    },
    "explosion_player_l3_a": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Purple plasma sphere explosion, 16-bit pixel art, "
            "#8B00FF layered rings expanding outward from white-hot core, "
            "12-frame animation with bright center and fading outer rings, "
            "with synchronized deep FM synthesis bass hit — a Sega Genesis 'bwaaam' sound, "
            "powerful mid-tier weapon impact with satisfying weight, 0.35 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_player_l3_a",
        "extract_frames": True,
    },
    "explosion_player_l3_b": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Dual-ring cyan and orange explosion, 16-bit pixel art, "
            "inner #00FFFF ring and outer #FF5500 ring expanding at different speeds, "
            "interference sparkle pattern at overlap zone, white flash core, "
            "with synchronized dual-tone chord blast — rich layered FM explosion, "
            "bright and powerful mid-tier arcade impact, 0.35 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_player_l3_b",
        "extract_frames": True,
    },
    "explosion_player_l3_c": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Rapid triple-pulse pink starburst explosion, 16-bit pixel art, "
            "#FF0055 starburst firing three times in rapid sequence, each flash slightly dimmer, "
            "staccato visual rhythm, sharp angular energy pattern, "
            "with synchronized three rapid FM stabs — staccato arcade blast, "
            "percussive and punchy, 0.3 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_player_l3_c",
        "extract_frames": True,
    },
    "explosion_player_l4_a": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Large purple-white plasma burst, 16-bit pixel art, "
            "#8B00FF layered rings with #FFFFFF core, expanding in 16-frame animation, "
            "spark particles trailing outward, bright lingering afterglow, "
            "with synchronized heavy FM bass explosion — deep satisfying rumble with bright overtones, "
            "upgraded mid-tier arcade impact, 0.45 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_player_l4_a",
        "extract_frames": True,
    },
    "explosion_player_l4_b": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Cross-pattern energy burst, 16-bit pixel art, "
            "four directional #00FFFF beams firing in cardinal directions from white-hot center, "
            "expanding ring joining the beams, orange spark tips on each beam end, "
            "with synchronized directional stereo whoosh into bass hit — "
            "spatial explosion with satisfying power, 0.45 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_player_l4_b",
        "extract_frames": True,
    },
    "explosion_player_l4_c": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Implosion-flash explosion, 16-bit pixel art, "
            "brief 2-frame inward collapse of purple energy, then massive #FFFFFF outward flash, "
            "fading #8B00FF ring expanding, dramatic energy release pattern, "
            "with synchronized sharp crack into long bass decay — "
            "dramatic tension-release arcade explosion, 0.45 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_player_l4_c",
        "extract_frames": True,
    },
    "explosion_player_l5_a": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Supernova explosion, 16-bit pixel art, "
            "white-hot core expanding into layered cyan-purple-pink rings, "
            "pixel-perfect bloom effect, lingering afterglow, massive 20-frame burst, "
            "with synchronized deep bass explosion plus high-end shimmer — "
            "YM2612 bass + PSG noise channel, the ultimate arcade detonation, "
            "0.5 seconds, transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_player_l5_a",
        "extract_frames": True,
    },
    "explosion_player_l5_b": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Cross blast explosion, 16-bit pixel art, "
            "four directional energy beams in cardinal directions from white center, "
            "thick #00FFFF beams with orange spark tips, expanding #8B00FF ring, "
            "screen-shaking intensity, dramatic angular energy pattern, "
            "with synchronized devastating directional blast — spatial explosion with deep bass, "
            "maximum power arcade impact, 0.5 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_player_l5_b",
        "extract_frames": True,
    },
    "explosion_player_l5_c": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Implosion-flash maximum detonation, 16-bit pixel art, "
            "brief inward collapse sucking energy particles in, then massive white flash outward, "
            "expanding #FF0055 and #8B00FF rings, debris spark particles scattering, "
            "lingering afterglow with pixel bloom, "
            "with synchronized sharp crack into massive long bass decay — "
            "cataclysmic arcade weapon finale, 0.5 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_player_l5_c",
        "extract_frames": True,
    },
    "explosion_enemy_scout_a": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Small robotic fish enemy exploding, 16-bit pixel art, "
            "#00FFFF cyan pop with metallic fragment sparks, scout ship breaking into 4-6 small pieces, "
            "clean quick death, orange fire core with cyan energy halo, "
            "with synchronized crisp pop-boom sound — sharp initial crack with short metallic scatter tail, "
            "arcade scout destruction, 0.3 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_enemy_scout_a",
        "extract_frames": True,
    },
    "explosion_enemy_scout_b": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Small robotic fish enemy bursting into pink fragments, 16-bit pixel art, "
            "#FF0055 neon flash, angular metal pieces scattering in all directions, "
            "8-frame destruction sequence, bright then fading, "
            "with synchronized sharp FM ping followed by sparkle scatter — "
            "satisfying small enemy kill, 0.3 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_enemy_scout_b",
        "extract_frames": True,
    },
    "explosion_enemy_scout_c": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Scout enemy green-tinted death explosion, 16-bit pixel art, "
            "#33CC55 energy pop with expanding ring, green bioluminescent particles drifting, "
            "matching scout minion core color, 8-frame burst, "
            "with synchronized soft low thud with green-tinted resonance — "
            "distinct biome-themed death, 0.3 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_enemy_scout_c",
        "extract_frames": True,
    },
    "explosion_enemy_interceptor_a": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Mechanical jellyfish enemy death explosion, 16-bit pixel art, "
            "#8B00FF purple plasma burst with pink tentacle fragments flying outward, "
            "translucent dome shattering into 6-8 shards, 12-frame destruction sequence, "
            "with synchronized dual-tone chord blast — layered FM explosion, "
            "satisfying mid-tier enemy takedown, 0.4 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_enemy_interceptor_a",
        "extract_frames": True,
    },
    "explosion_enemy_interceptor_b": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Jellyfish interceptor shattering into pink glass-like shards, 16-bit pixel art, "
            "#FF0055 core flash with translucent cyan fragment scatter, "
            "fiber-optic tentacles whipping outward as they break, 14-frame animation, "
            "with synchronized glass shatter effect with FM high-end sparkle — "
            "beautiful destructive death, 0.4 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_enemy_interceptor_b",
        "extract_frames": True,
    },
    "explosion_enemy_interceptor_c": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Interceptor enemy implosion-then-burst death, 16-bit pixel art, "
            "dome collapsing inward briefly then exploding outward in #8B00FF rings, "
            "purple circuitry fragments scattering, electrical arcing at break points, "
            "with synchronized implosion whoosh into sharp explosion — dramatic tension-release kill, "
            "0.4 seconds, transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_enemy_interceptor_c",
        "extract_frames": True,
    },
    "explosion_enemy_heavy_a": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Robotic electric eel enemy exploding in segments, 16-bit pixel art, "
            "sequential explosions along the body — head to tail, each blast bigger, "
            "#FF5500 fireballs with blue electrical arcing between segments, "
            "18-frame multi-stage destruction, metallic hull fragments flying, "
            "with synchronized cascading bass explosions in sequence — pop-pop-BOOM, "
            "heavy enemy destruction, 0.5 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_enemy_heavy_a",
        "extract_frames": True,
    },
    "explosion_enemy_heavy_b": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Heavy eel enemy catastrophic hull breach, 16-bit pixel art, "
            "12-16 large hull sections breaking apart with secondary internal explosions, "
            "#8B00FF purple energy venting from fracture points, orange fireballs at each segment break, "
            "20-frame destruction with lingering debris, "
            "with synchronized massive structural groan into multiple explosions — debris rain audio, "
            "cinematic heavy kill, 0.55 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_enemy_heavy_b",
        "extract_frames": True,
    },
    "explosion_enemy_heavy_c": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Heavy eel meltdown explosion, 16-bit pixel art, "
            "hull superheating to white-hot, sagging and melting for 3 frames, "
            "then bursting outward as molten orange-red slag, cooling gradient, "
            "#FF3333 core with #FF5500 outer fire, 22-frame spectacle, "
            "with synchronized rising heat whine into molten burst — sizzle and crack decay, "
            "dramatic heavy enemy finale, 0.55 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_enemy_heavy_c",
        "extract_frames": True,
    },
    "explosion_enemy_boss_segment_a": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Boss armor segment chain-failure explosion, 16-bit pixel art, "
            "sequential failures along a large biomechanical section — #FF3333 internal fires, "
            "#8B00FF energy venting, armor plates peeling away in layers, "
            "each sequential blast bigger than the last, 20-frame sequence, "
            "with synchronized escalating explosion sequence — pop-pop-BOOM with metallic groan, "
            "boss-phase destruction, 0.55 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_enemy_boss_segment_a",
        "extract_frames": True,
    },
    "explosion_enemy_boss_segment_b": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Boss armor plate catastrophic breach, 16-bit pixel art, "
            "large biomechanical plate tearing away with #00FFFF energy arcing, "
            "purple circuitry exposed underneath, green coolant spray from ruptured lines, "
            "16-frame destruction with electrical crackle effects, "
            "with synchronized metal tear with electrical crackle and deep bass thud — "
            "heavy boss damage feedback, 0.5 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_enemy_boss_segment_b",
        "extract_frames": True,
    },
    "explosion_enemy_boss_segment_c": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Boss segment core meltdown, 16-bit pixel art, "
            "central core glowing white-hot, expanding #FF3333 fireball with #FFD700 critical hit accents, "
            "armor superheating to orange then bursting, 18-frame devastation, "
            "molten metal droplets scattering with cooling gradient, "
            "with synchronized rising FM tone into massive detonation — deep rumble with crackling energy, "
            "devastating boss segment kill, 0.55 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_enemy_boss_segment_c",
        "extract_frames": True,
    },
    "explosion_special_shockwave": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Expanding cyan shockwave ring, 16-bit pixel art, "
            "#00FFFF thin bright ring expanding from center point, transparent interior, "
            "fade over distance, 16-frame smooth expansion, pure kinetic force visualization, "
            "no fire or debris, clean geometric energy wave, "
            "with synchronized rising FM sweep plus noise channel hiss — "
            "powerful expanding energy wave sound, 0.4 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_special_shockwave",
        "extract_frames": True,
    },
    "explosion_special_emp": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "EMP pulse explosion, 16-bit pixel art, "
            "blue-white electrical sphere expanding outward, lightning bolts arcing to edges, "
            "rapid flicker effect, horizontal scan-line glitch distortion, "
            "#00FFFF core with white electric tendrils, data-corruption visual patterns, "
            "with synchronized harsh noise-channel static burst — digital disruption sound, "
            "0.4 seconds, transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_special_emp",
        "extract_frames": True,
    },
    "explosion_special_missile_trail": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Missile trail explosion with directional fire cone, 16-bit pixel art, "
            "#FF5500 orange fireball at impact point with smoke trail behind, "
            "directional spark cone extending away from impact, expanding smoke ring, "
            "14-frame detonation with trailing particle wake, "
            "with synchronized rocket-impact explosion — deep whump with crackling fire and smoke hiss, "
            "0.4 seconds, transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_special_missile_trail",
        "extract_frames": True,
    },
    "explosion_special_cluster": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Cluster chain explosion sequence, 16-bit pixel art, "
            "3-6 small #FF5500 fireball pops in rapid cascade across blast zone, "
            "overlapping smoke clouds, each pop slightly offset, "
            "chain reaction pattern spreading left to right, 20-frame cascading destruction, "
            "with synchronized rapid-fire pop-pop-pop sequence — PSG noise channel stutter, "
            "fast-paced chain detonation, 0.6 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_special_cluster",
        "extract_frames": True,
    },
    "explosion_special_screen_flash": {
        "category": "GRO-922 Explosions",
        "prompt": (
            "Full-screen white flash explosion, 16-bit pixel art, "
            "massive #FFFFFF energy wave traveling from center outward, "
            "layered cyan-purple-pink bands, screen flash at peak intensity, "
            "trailing particle wake, 24-frame spectacle — the game's biggest visual moment, "
            "with synchronized maximum Genesis audio — layered FM bass plus PSG noise plus PCM sample hit, "
            "screen-shaking ultimate detonation, 0.6 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "explosion_special_screen_flash",
        "extract_frames": True,
    },
    # ═══════════════════════════════════════════════
    # GRO-917: Story Mode Audio — Text transitions + voice lines
    # ═══════════════════════════════════════════════
    "story_text_whoosh_on": {
        "category": "GRO-917 Story Mode",
        "prompt": (
            "Sharp text whip-on whoosh, 16-bit pixel art, "
            "bright cyan streak flashing left to right across screen, "
            "motion blur trail, text-arrival energy wave, "
            "with synchronized crisp whoosh sound — "
            "sharp high-frequency sweep like air being sliced, "
            "fast and punchy, 0.3 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "story_text_whoosh_on",
        "extract_frames": True,
    },
    "story_text_whoosh_off": {
        "category": "GRO-917 Story Mode",
        "prompt": (
            "Text whip-off reverse whoosh, 16-bit pixel art, "
            "cyan streak pulling back right to left, vacuum-like motion trail, "
            "text-dismissal energy retraction, "
            "with synchronized reverse whoosh sound — "
            "descending frequency sweep, air sucking inward, "
            "quick and clean, 0.3 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "story_text_whoosh_off",
        "extract_frames": True,
    },
    "story_typewriter_click": {
        "category": "GRO-917 Story Mode",
        "prompt": (
            "Single typewriter key strike, 16-bit pixel art, "
            "small cyan dot flash at center with tiny ripple, "
            "minimalist text-character-appear indicator, "
            "with synchronized sharp mechanical click sound — "
            "crisp high-frequency tap like a vintage typewriter key striking paper, "
            "very short and precise, 0.1 seconds, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "story_typewriter_click",
        "extract_frames": True,
    },
    "story_mission_briefing_start": {
        "category": "GRO-917 Story Mode",
        "prompt": (
            "Mission briefing screen activating, 16-bit pixel art, "
            "cyan border drawing around screen edges then filling in, "
            "COMMANDER label appearing with glow, tactical grid overlay forming, "
            "with synchronized mission briefing startup sting — "
            "descending three-note synth sequence with radio static crackle, "
            "military comms channel opening, dramatic and official, "
            "1 second, transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "story_mission_briefing_start",
        "extract_frames": True,
    },
    "story_mission_briefing_end": {
        "category": "GRO-917 Story Mode",
        "prompt": (
            "Mission briefing screen deactivating, 16-bit pixel art, "
            "cyan border fading pixel by pixel, tactical grid dissolving, "
            "COMMANDER label dimming and disappearing, transition to gameplay, "
            "with synchronized briefing close sting — "
            "ascending two-note synth with radio static cutoff, "
            "comms channel closing, crisp and final, "
            "0.8 seconds, transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "story_mission_briefing_end",
        "extract_frames": True,
    },
    "story_comms_incoming": {
        "category": "GRO-917 Story Mode",
        "prompt": (
            "Incoming radio communication indicator, 16-bit pixel art, "
            "static burst with cyan interference lines, small speaker icon pulsing, "
            "radio frequency wave animation, "
            "with synchronized comms incoming static burst — "
            "sharp radio static crackle followed by open channel hum, "
            "like a military radio handset being keyed, "
            "0.5 seconds, transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "story_comms_incoming",
        "extract_frames": True,
    },
    # ═══════════════════════════════════════════════
    # GRO-988: Biome-Specific Environmental SFX (20)
    # ═══════════════════════════════════════════════
    "sfx_vent_eruption": {
        "category": "SFX Audio",
        "prompt": (
            "Hydrothermal vent erupting on deep ocean floor, 16-bit pixel art, "
            "billowing dark smoke plume with orange-glowing base rising from vent crack, "
            "bubbles streaming upward, "
            "with synchronized deep underwater rumble and steam hiss — "
            "low-frequency bass thud followed by pressurized steam release, "
            "like a Sega Genesis underwater eruption, 1.5 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_vent_eruption",
        "extract_frames": True,
    },
    "sfx_biolum_pulse": {
        "category": "SFX Audio",
        "prompt": (
            "Clusters of bioluminescent particles pulsing brightly in dark water, 16-bit pixel art, "
            "cyan glowing motes flashing in unison then fading, surrounded by deep navy darkness, "
            "with synchronized soft high-pitched sine chime — "
            "delicate crystalline ping like a sonar echo, "
            "gentle and ethereal, 0.3 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_biolum_pulse",
        "extract_frames": True,
    },
    "sfx_coral_collapse": {
        "category": "SFX Audio",
        "prompt": (
            "Ancient coral structure crumbling and collapsing in graveyard, 16-bit pixel art, "
            "pink dead coral formation fracturing into angular debris chunks falling downward, "
            "dust cloud billowing from impact point, "
            "with synchronized metallic crunch and debris scatter — "
            "sharp initial crack of breaking metal followed by tumbling debris clatter, "
            "heavy and destructive, 2.0 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_coral_collapse",
        "extract_frames": True,
    },
    "sfx_neon_flicker": {
        "category": "SFX Audio",
        "prompt": (
            "Broken neon sign flickering erratically in coral graveyard, 16-bit pixel art, "
            "pink neon tube buzzing on-off-on with rapid random pattern, "
            "sparks jumping at connection points, "
            "with synchronized electric buzz stutter — "
            "FM synthesis noise, rapid on-off electrical crackle like a failing fluorescent tube, "
            "glitchy and unstable, 0.2 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_neon_flicker",
        "extract_frames": True,
    },
    "sfx_tesla_arc": {
        "category": "SFX Audio",
        "prompt": (
            "Tesla coil discharging a jagged cyan lightning arc, 16-bit pixel art, "
            "electricity jumping between two metallic spheres with branching tendrils, "
            "white-hot core with cyan glow edges, sparks spraying outward, "
            "with synchronized sharp electric crack and hum decay — "
            "instantaneous high-voltage zap followed by deep electrical hum tail, "
            "powerful and dangerous, 0.4 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_tesla_arc",
        "extract_frames": True,
    },
    "sfx_heartbeat": {
        "category": "SFX Audio",
        "prompt": (
            "Mechanical heart core pulsing inside Coelacanth's lair, 16-bit pixel art, "
            "large red biomechanical organ contracting and expanding rhythmically, "
            "veins pulsing with each beat, dark industrial backdrop, "
            "with synchronized deep muffled thud at industrial BPM — "
            "low-frequency percussive thump like a distant piston, "
            "ominous and primal, 0.5 second loop, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_heartbeat",
        "extract_frames": True,
    },
    "sfx_plasma_stream": {
        "category": "SFX Audio",
        "prompt": (
            "Flowing plasma ribbon passing through nebula space, 16-bit pixel art, "
            "translucent cyan-to-magenta gas stream undulating horizontally, "
            "electrical particles dancing along its edges, "
            "with synchronized rising ion sweep and soft crackle — "
            "ascending filtered noise sweep like charged particles accelerating, "
            "ethereal and cosmic, 1.0 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_plasma_stream",
        "extract_frames": True,
    },
    "sfx_storm_flash": {
        "category": "SFX Audio",
        "prompt": (
            "Electrical storm flash illuminating nebula clouds, 16-bit pixel art, "
            "bright white lightning bolt branching across dark cosmic cloudscape, "
            "brief illumination revealing gas structures, "
            "with synchronized distant thunder rumble — "
            "low-pass filtered rolling thunder, muffled and far away, "
            "rumbling through space, 0.6 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_storm_flash",
        "extract_frames": True,
    },
    "sfx_ice_crack": {
        "category": "SFX Audio",
        "prompt": (
            "Massive ice formation cracking and shifting in frozen rings, 16-bit pixel art, "
            "hexagonal ice crystal fracturing with sharp angular breaks, "
            "shards spraying outward with prismatic light refraction, "
            "with synchronized sharp crystalline fracture and long-ringing decay — "
            "high-pitched glass-like crack followed by sustained crystalline resonance, "
            "cold and brittle, 0.8 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_ice_crack",
        "extract_frames": True,
    },
    "sfx_prism_beam": {
        "category": "SFX Audio",
        "prompt": (
            "Prismatic light beam sweeping through ice crystal field, 16-bit pixel art, "
            "angled white light ray refracting through hexagonal crystals into rainbow spectrum, "
            "gentle caustic light patterns dancing, "
            "with synchronized glass harmonica shimmer sweep — "
            "rising ethereal chime sweep like a glass armonica being played, "
            "crystalline and pure, 0.5 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_prism_beam",
        "extract_frames": True,
    },
    "sfx_lava_bubble": {
        "category": "SFX Audio",
        "prompt": (
            "Lava pool surface bursting with thick molten bubble, 16-bit pixel art, "
            "orange-yellow bubble dome rising from viscous lava surface, "
            "bursting with splatter of glowing droplets, heat shimmer above, "
            "with synchronized thick liquid pop and sizzle — "
            "low viscous pop followed by brief sizzling hiss, "
            "hot and heavy, 0.4 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_lava_bubble",
        "extract_frames": True,
    },
    "sfx_ember_swarm": {
        "category": "SFX Audio",
        "prompt": (
            "Swarm of glowing embers bursting upward from fire nebula floor, 16-bit pixel art, "
            "dozens of orange-yellow particle embers spiraling upward in corkscrew trajectories, "
            "ash cloud rising behind them, "
            "with synchronized crackling fire swarm — "
            "PSG noise channel crackle, dense and lively like a campfire intensified, "
            "warm and chaotic, 0.7 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_ember_swarm",
        "extract_frames": True,
    },
    "sfx_thunder_crack": {
        "category": "SFX Audio",
        "prompt": (
            "Close lightning strike in storm belt, 16-bit pixel art, "
            "brilliant white-blue lightning bolt striking from top of frame, "
            "branching into multiple ground strikes with intense flash, "
            "with synchronized sharp crack and long bass rumble decay — "
            "immediate high-frequency crack followed by deep rolling bass thunder, "
            "powerful and close, 0.9 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_thunder_crack",
        "extract_frames": True,
    },
    "sfx_static_burst": {
        "category": "SFX Audio",
        "prompt": (
            "Electromagnetic interference band sweeping across screen, 16-bit pixel art, "
            "horizontal static distortion lines tearing through image, "
            "digital glitch artifacts scrambling pixels momentarily, "
            "with synchronized white noise burst and digital glitch stutter — "
            "sharp burst of FM static noise followed by rapid stuttering glitch, "
            "electronic interference, 0.3 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_static_burst",
        "extract_frames": True,
    },
    "sfx_hull_groan": {
        "category": "SFX Audio",
        "prompt": (
            "Derelict spaceship hull groaning under structural stress, 16-bit pixel art, "
            "aged metal plates bending and warping with rivets popping, "
            "emergency red lighting flickering in background, "
            "with synchronized deep metallic stress moan — "
            "low-frequency bending metal sound, long sustained groan like a dying vessel, "
            "heavy and mournful, 1.5 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_hull_groan",
        "extract_frames": True,
    },
    "sfx_beacon_ping": {
        "category": "SFX Audio",
        "prompt": (
            "Distress beacon pulsing on derelict ship hull, 16-bit pixel art, "
            "small antenna emitting concentric radio wave rings, "
            "red indicator light blinking in Morse-like pattern, "
            "with synchronized sharp electronic ping — "
            "clean high-pitched square wave ping, Morse-code friendly, "
            "isolated and desperate, 0.2 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_beacon_ping",
        "extract_frames": True,
    },
    "sfx_acid_drip": {
        "category": "SFX Audio",
        "prompt": (
            "Glowing acid droplet falling and hitting organic surface, 16-bit pixel art, "
            "green luminescent teardrop falling through alien hive corridor, "
            "splashing on impact with corrosive steam rising, "
            "with synchronized wet sizzle and hiss — "
            "liquid droplet impact followed by corrosive chemical sizzle, "
            "wet and dangerous, 0.3 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_acid_drip",
        "extract_frames": True,
    },
    "sfx_vein_pulse": {
        "category": "SFX Audio",
        "prompt": (
            "Organic vein network throbbing on xenomorph hive wall, 16-bit pixel art, "
            "green bioluminescent veins pulsing rhythmically across fleshy surface, "
            "organic membranes stretching with each pulse, "
            "with synchronized wet squelchy low-frequency pulse — "
            "deep wet organic throb like a living organism's pulse, "
            "visceral and biological, 0.5 second loop, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_vein_pulse",
        "extract_frames": True,
    },
    "sfx_rift_tear": {
        "category": "SFX Audio",
        "prompt": (
            "Dimensional rift tearing open in reality core, 16-bit pixel art, "
            "jagged magenta tear in spacetime fabric with reality-bleed edges, "
            "digital fragments and code streaming from the rupture, "
            "with synchronized reversed glass-shatter and digital glitch — "
            "glass shatter sound played in reverse followed by harsh digital glitch burst, "
            "reality-breaking and unnatural, 1.0 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_rift_tear",
        "extract_frames": True,
    },
    "sfx_code_stream": {
        "category": "SFX Audio",
        "prompt": (
            "Streaming code cascade flowing through digital rift, 16-bit pixel art, "
            "vertical columns of green matrix-style code characters scrolling rapidly, "
            "cyan data packets streaming between code columns, "
            "with synchronized rapid data-burst chirps — "
            "FM synthesis stutter, rapid-fire digital chirps like a high-speed modem, "
            "data transmission, 0.6 seconds, "
            "transparent background, static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_code_stream",
        "extract_frames": True,
    },
    # ═══════════════════════════════════════════════
    # GRO-986 Menu Transition & UI SFX
    # ═══════════════════════════════════════════════
    "sfx_ui_hover": {
        "category": "GRO-986 Menu SFX",
        "prompt": (
            "Menu button hover effect, 16-bit pixel art, "
            "subtle cyan outline pulse around a UI button, single-frame flash, "
            "with synchronized light high-pitched sine beep — C6 note, 80ms, "
            "crisp FM synthesis, Yamaha YM2612 chip character, Sega Genesis style, "
            "very short and clean, no reverb, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_ui_hover",
        "extract_frames": True,
    },
    "sfx_ui_select": {
        "category": "GRO-986 Menu SFX",
        "prompt": (
            "Menu button select confirmation effect, 16-bit pixel art, "
            "brief gold flash on a UI button, expanding ring pulse, "
            "with synchronized satisfying double chirp — C6 to E6 rising, 50ms each, "
            "two rapid bright notes, Yamaha YM2612 FM synthesis, Sega Genesis arcade style, "
            "clean and punchy, no reverb, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_ui_select",
        "extract_frames": True,
    },
    "sfx_ui_back": {
        "category": "GRO-986 Menu SFX",
        "prompt": (
            "Menu back or cancel action effect, 16-bit pixel art, "
            "brief dimming flash on a UI button, subtle red tint, "
            "with synchronized descending two-note — E5 to C5, 60ms each, "
            "gentle downward tone, Yamaha YM2612 FM synthesis, Sega Genesis retro arcade style, "
            "soft but clear, no reverb, transparent background, "
            "static position, no camera movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_ui_back",
        "extract_frames": True,
    },
    "sfx_upgrade_purchase": {
        "category": "GRO-986 Menu SFX",
        "prompt": (
            "Successful upgrade purchase effect, 16-bit pixel art, "
            "gold sparkle burst around a weapon upgrade icon, glowing particles rising, "
            "with synchronized ascending chime arpeggio — C5 to E5 to G5 to C6, 100ms each, "
            "four bright rising notes, triumphant and satisfying, "
            "Yamaha YM2612 FM synthesis, Sega Genesis arcade shop, "
            "clean and crisp with short decay, no reverb, transparent background."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_upgrade_purchase",
        "extract_frames": True,
    },
    "sfx_insufficient_scrap": {
        "category": "GRO-986 Menu SFX",
        "prompt": (
            "Insufficient resources for purchase effect, 16-bit pixel art, "
            "red X flash over a shop icon, brief error shake, "
            "with synchronized dull buzzy thud — low square wave at 150Hz, "
            "short 300ms buzz, slightly distorted, Sega Genesis PSG noise channel, "
            "retro arcade error sound, flat and unmusical, no reverb, "
            "transparent background, static position."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_insufficient_scrap",
        "extract_frames": True,
    },
    "sfx_menu_transition_in": {
        "category": "GRO-986 Menu SFX",
        "prompt": (
            "Menu screen sliding in from right, 16-bit pixel art, "
            "dark panel with neon cyan border sliding across screen, "
            "with synchronized rising FM sweep and soft whoosh — "
            "pitch ramp from 200Hz to 1200Hz over 400ms, "
            "bright metallic FM synthesis, Yamaha YM2612, "
            "clean swoosh with no harshness, retro arcade menu feel, "
            "transparent background, horizontal movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_menu_transition_in",
        "extract_frames": True,
    },
    "sfx_menu_transition_out": {
        "category": "GRO-986 Menu SFX",
        "prompt": (
            "Menu screen sliding out to left, 16-bit pixel art, "
            "dark panel with neon cyan border sliding off-screen, "
            "with synchronized descending FM sweep — "
            "pitch ramp from 1200Hz to 200Hz over 300ms, "
            "metallic FM synthesis, Yamaha YM2612, "
            "smooth swoosh-down, retro arcade menu feel, "
            "transparent background, horizontal movement."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_menu_transition_out",
        "extract_frames": True,
    },
    "sfx_level_start": {
        "category": "GRO-986 Menu SFX",
        "prompt": (
            "Sub-level start dramatic announcement, 16-bit pixel art, "
            "large LEVEL text appearing with expanding glow and screen flash, "
            "with synchronized dramatic ascending sting — FM brass-like fanfare, "
            "rising from C4 to C6 over 800ms, bold and heroic tone, "
            "Yamaha YM2612 FM synthesis brass patch, Sega Genesis arcade style, "
            "powerful and clean attack, reverb tail, transparent background."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_level_start",
        "extract_frames": True,
    },
    "sfx_biome_transition": {
        "category": "GRO-986 Menu SFX",
        "prompt": (
            "Biome change screen transition, 16-bit pixel art, "
            "screen-sweeping wave with biome color flash and biome name text appearing, "
            "with synchronized grand transition sweep — 1200ms, "
            "rising and resolving FM synthesis sweep with a unique bright identifier note at the end, "
            "Yamaha YM2612, epic but short, like entering a new zone, "
            "Sega Genesis stage transition feel, transparent background."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_biome_transition",
        "extract_frames": True,
    },
    "sfx_pause_in": {
        "category": "GRO-986 Menu SFX",
        "prompt": (
            "Game pause time-stop effect, 16-bit pixel art, "
            "screen dimming with dark overlay descending, freeze-frame flash, "
            "with synchronized time-stop thwip sound — descending sine blip, "
            "200ms, pitch dropping from 800Hz to 200Hz, "
            "Yamaha YM2612, clean sine tone, retro arcade pause, "
            "short and distinctive, transparent background, static position."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_pause_in",
        "extract_frames": True,
    },
    "sfx_pause_out": {
        "category": "GRO-986 Menu SFX",
        "prompt": (
            "Game unpause time-resume effect, 16-bit pixel art, "
            "screen brightening from dark overlay, unfreeze-frame flash, "
            "with synchronized time-resume thwip sound — ascending sine blip, "
            "200ms, pitch rising from 200Hz to 800Hz, "
            "Yamaha YM2612, clean sine tone, retro arcade unpause, "
            "short and distinctive, transparent background, static position."
        ),
        "duration_sec": 4, "fps": 15,
        "output_prefix": "sfx_pause_out",
        "extract_frames": True,
    },
    # ═══════════════════════════════════════════════════════
    # Biome-Specific Engine Hums (GRO-985, 10 biomes)
    # ═══════════════════════════════════════════════════════
    "sfx_engine_hum_b1_abyssal": {
        "category": "GRO-985 Engine Hums",
        "prompt": (
            "Spaceship engine thruster burning steadily underwater, 16-bit pixel art, "
            "blue-white flame with bubbling edges, exhaust particles dispersing in water, "
            "with synchronized deep muffled engine hum — "
            "low-frequency drone with bubbling undertones and aquatic pressure feel, "
            "water-muffled bass, 3 seconds, transparent background, static position."
        ),
        "duration_sec": 3, "fps": 15,
        "output_prefix": "sfx_engine_hum_b1_abyssal",
        "extract_frames": True,
    },
    "sfx_engine_hum_b2_coral": {
        "category": "GRO-985 Engine Hums",
        "prompt": (
            "Spaceship engine thruster burning in coral graveyard, 16-bit pixel art, "
            "pale blue-green flame with particulate crackle, bone-white exhaust, "
            "with synchronized eerie engine hum — "
            "mid-low drone with coral crackle artifacts and hollow reverb, "
            "dry brittle texture, 3 seconds, transparent background, static position."
        ),
        "duration_sec": 3, "fps": 15,
        "output_prefix": "sfx_engine_hum_b2_coral",
        "extract_frames": True,
    },
    "sfx_engine_hum_b3_coelacanth": {
        "category": "GRO-985 Engine Hums",
        "prompt": (
            "Spaceship engine thruster burning in ancient coelacanth lair, 16-bit pixel art, "
            "deep teal flame with organic bioluminescent particles, primordial exhaust, "
            "with synchronized ancient deep engine hum — "
            "low rumbling drone with organic resonance and heartbeat-like pulse, "
            "primordial bass reverberation, 3 seconds, transparent background, static position."
        ),
        "duration_sec": 3, "fps": 15,
        "output_prefix": "sfx_engine_hum_b3_coelacanth",
        "extract_frames": True,
    },
    "sfx_engine_hum_b4_nebula": {
        "category": "GRO-985 Engine Hums",
        "prompt": (
            "Spaceship engine thruster burning through nebula drift, 16-bit pixel art, "
            "cyan-magenta flame with plasma particles, cosmic exhaust trail, "
            "with synchronized cosmic engine hum — "
            "mid-frequency drone with plasma hiss and cosmic wind overtones, "
            "ethereal space resonance, 3 seconds, transparent background, static position."
        ),
        "duration_sec": 3, "fps": 15,
        "output_prefix": "sfx_engine_hum_b4_nebula",
        "extract_frames": True,
    },
    "sfx_engine_hum_b5_ice": {
        "category": "GRO-985 Engine Hums",
        "prompt": (
            "Spaceship engine thruster burning through ice rings, 16-bit pixel art, "
            "frost-blue flame with ice crystal sparkles, frozen exhaust particles, "
            "with synchronized crystalline engine hum — "
            "mid-low drone with ice crackle artifacts and crystalline ringing overtones, "
            "cold brittle texture with glass-like harmonics, 3 seconds, transparent background, static position."
        ),
        "duration_sec": 3, "fps": 15,
        "output_prefix": "sfx_engine_hum_b5_ice",
        "extract_frames": True,
    },
    "sfx_engine_hum_b6_fire": {
        "category": "GRO-985 Engine Hums",
        "prompt": (
            "Spaceship engine thruster burning through fire nebula, 16-bit pixel art, "
            "orange-red flame with ember particles and heat shimmer, fiery exhaust, "
            "with synchronized fiery engine hum — "
            "low rumbling drone with fire crackle and heat distortion warble, "
            "warm overdriven bass with subtle combustion pops, 3 seconds, transparent background, static position."
        ),
        "duration_sec": 3, "fps": 15,
        "output_prefix": "sfx_engine_hum_b6_fire",
        "extract_frames": True,
    },
    "sfx_engine_hum_b7_storm": {
        "category": "GRO-985 Engine Hums",
        "prompt": (
            "Spaceship engine thruster burning through storm belt, 16-bit pixel art, "
            "white-blue flame with static discharge sparks, electrified exhaust, "
            "with synchronized storm engine hum — "
            "mid-frequency drone with static interference crackle and distant thunder rumble, "
            "electrical buzzing texture with low thunder booms, 3 seconds, transparent background, static position."
        ),
        "duration_sec": 3, "fps": 15,
        "output_prefix": "sfx_engine_hum_b7_storm",
        "extract_frames": True,
    },
    "sfx_engine_hum_b8_derelict": {
        "category": "GRO-985 Engine Hums",
        "prompt": (
            "Spaceship engine thruster burning through derelict fleet, 16-bit pixel art, "
            "gray-red flame with rust particles, industrial exhaust with metal flecks, "
            "with synchronized mechanical engine hum — "
            "low drone with metallic grinding artifacts and hull-groan overtones, "
            "industrial texture with mechanical strain harmonics, 3 seconds, transparent background, static position."
        ),
        "duration_sec": 3, "fps": 15,
        "output_prefix": "sfx_engine_hum_b8_derelict",
        "extract_frames": True,
    },
    "sfx_engine_hum_b9_xenomorph": {
        "category": "GRO-985 Engine Hums",
        "prompt": (
            "Spaceship engine thruster burning through xenomorph hive, 16-bit pixel art, "
            "pink-green flame with organic spore particles, bio-luminescent exhaust, "
            "with synchronized organic engine hum — "
            "low pulsing drone with wet organic resonance and acid-drip artifacts, "
            "fleshy texture with heartbeat-like throb, 3 seconds, transparent background, static position."
        ),
        "duration_sec": 3, "fps": 15,
        "output_prefix": "sfx_engine_hum_b9_xenomorph",
        "extract_frames": True,
    },
    "sfx_engine_hum_b10_core": {
        "category": "GRO-985 Engine Hums",
        "prompt": (
            "Spaceship engine thruster burning through core rift, 16-bit pixel art, "
            "black-white flame with reality-bleed magenta particles, glitched exhaust trail, "
            "with synchronized dimensional engine hum — "
            "unstable frequency drone with digital glitch artifacts and reality-distortion warble, "
            "phase-shifting harmonics with bit-crush degradation, 3 seconds, transparent background, static position."
        ),
        "duration_sec": 3, "fps": 15,
        "output_prefix": "sfx_engine_hum_b10_core",
        "extract_frames": True,
    },
}

REPO_ROOT = Path(__file__).parent
SPRITES_DIR = REPO_ROOT / "assets" / "sprites"
AUDIO_DIR = REPO_ROOT / "assets" / "audio"
CINEMATICS_DIR = REPO_ROOT / "assets" / "cinematics"

CLIENT_ID = "884354919052-36trc1jjb3tguiac32ov6cod268c5blh.apps.googleusercontent.com"
TOKEN_PATH = "/home/ubuntu/.gemini/antigravity-cli/antigravity-oauth-token"


def get_access_token():
    """Get Google Cloud access token using gcloud CLI with fallback to antigravity token."""
    import datetime
    import urllib.request
    import urllib.error
    
    # Try using antigravity oauth token
    if os.path.exists(TOKEN_PATH):
        try:
            with open(TOKEN_PATH, "r") as f:
                data = json.load(f)
            token_data = data.get("token", {})
            access_token = token_data.get("access_token")
            refresh_token = token_data.get("refresh_token")
            expiry_str = token_data.get("expiry")
            
            if access_token and refresh_token and expiry_str:
                # Parse expiry
                clean_expiry_str = expiry_str
                if clean_expiry_str.endswith("Z"):
                    clean_expiry_str = clean_expiry_str[:-1] + "+00:00"
                if "." in clean_expiry_str:
                    base, frac_tz = clean_expiry_str.split(".")
                    frac = frac_tz.split("+")[0]
                    tz = frac_tz[len(frac):]
                    frac = frac[:6]
                    clean_expiry_str = f"{base}.{frac}{tz}"
                
                expiry = datetime.datetime.fromisoformat(clean_expiry_str)
                now = datetime.datetime.now(datetime.timezone.utc)
                
                if expiry < now + datetime.timedelta(minutes=5):
                    print("  → Token expired or expiring soon. Refreshing...")
                    refresh_url = "https://oauth2.googleapis.com/token"
                    payload = json.dumps({
                        "client_id": CLIENT_ID,
                        "grant_type": "refresh_token",
                        "refresh_token": refresh_token
                    }).encode("utf-8")
                    
                    req = urllib.request.Request(
                        refresh_url,
                        data=payload,
                        headers={"Content-Type": "application/json"}
                    )
                    with urllib.request.urlopen(req, timeout=30) as resp:
                        res = json.loads(resp.read().decode("utf-8"))
                        new_access_token = res["access_token"]
                        expires_in = res["expires_in"]
                        
                        # Calculate new expiry
                        new_expiry = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=expires_in)
                        new_expiry_str = new_expiry.isoformat().replace("+00:00", "Z")
                        
                        # Update file
                        data["token"]["access_token"] = new_access_token
                        data["token"]["expiry"] = new_expiry_str
                        
                        with open(TOKEN_PATH, "w") as out:
                            json.dump(data, out)
                            
                        print(f"  ✓ Token refreshed successfully.")
                        return new_access_token
                else:
                    return access_token
        except Exception as e:
            print(f"  ⚠ Failed to read/refresh antigravity oauth token: {e}")

    # Fallback to gcloud CLI
    result = subprocess.run(
        ["gcloud", "auth", "print-access-token"],
        capture_output=True, text=True, timeout=15
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"gcloud auth failed: {result.stderr.strip()}\n"
            f"Run: gcloud auth login"
        )
    return result.stdout.strip()


def check_veo_availability(project_id: str, region: str = "us-central1") -> str | None:
    """Check if Veo is available in the project."""
    import urllib.request
    import urllib.error

    token = get_access_token()
    veo_models = [
        "veo-3.1-lite-generate-001",
        "veo-3.1-generate-preview",
        "veo-2.0-generate-001",
    ]

    for model_name in veo_models:
        # Check model metadata (GET — no quota cost)
        get_url = (
            f"https://{region}-aiplatform.googleapis.com"
            f"/v1/projects/{project_id}/locations/{region}"
            f"/publishers/google/models/{model_name}"
        )
        req = urllib.request.Request(get_url, headers={
            "Authorization": f"Bearer {token}",
        })
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                print(f"✅ Veo available: {model_name}")
                return model_name
        except urllib.error.HTTPError as e:
            # Some models don't expose metadata — try POST probe
            if e.code == 404:
                continue
            body = e.read().decode()[:200]
            # 403 = model exists but needs different auth
            if e.code == 403:
                print(f"✅ Veo found (needs auth): {model_name}")
                return model_name

    # Fallback: probe with a lightweight POST to detect the model
    for model_name in veo_models:
        probe_url = (
            f"https://{region}-aiplatform.googleapis.com"
            f"/v1/projects/{project_id}/locations/{region}"
            f"/publishers/google/models/{model_name}:predictLongRunning"
        )
        payload = json.dumps({
            "instances": [{"prompt": "test pixel"}],
            "parameters": {"durationSeconds": 4}
        }).encode()
        req = urllib.request.Request(probe_url, data=payload, headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        })
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                print(f"✅ Veo available: {model_name} (HTTP {resp.status})")
                return model_name
        except urllib.error.HTTPError as e:
            if e.code == 404:
                continue
            # 400/403/429 = model exists
            body = e.read().decode()[:200]
            print(f"✅ Veo found: {model_name} (HTTP {e.code})")
            return model_name

    return None


def generate_veo(asset_id: str, config: dict, project_id: str,
                 region: str = "us-central1", model_name: str = None):
    """Generate video via Vertex AI Veo — submit then poll async operation.

    Veo uses :predictLongRunning → :fetchPredictOperation (custom LRO, not
    the standard Vertex AI operations endpoint). Returns: True on success.
    """
    import urllib.request
    import urllib.error
    import time

    if model_name is None:
        model_name = check_veo_availability(project_id, region)
        if model_name is None:
            print("  ✗ Veo not available in this project.")
            return False

    token = get_access_token()
    base_url = (
        f"https://{region}-aiplatform.googleapis.com"
        f"/v1/projects/{project_id}/locations/{region}"
        f"/publishers/google/models/{model_name}"
    )

    # Veo minimum duration is 4 seconds
    duration = max(config.get("duration_sec", 4), 4)
    # Round to nearest valid duration: [4, 6, 8]
    if duration <= 4:
        duration = 4
    elif duration <= 6:
        duration = 6
    else:
        duration = 8

    # ── Step 1: Submit ──
    submit_url = f"{base_url}:predictLongRunning"
    payload = json.dumps({
        "instances": [{"prompt": config["prompt"]}],
        "parameters": {"durationSeconds": duration}
    }).encode()

    print(f"  → Submitting to Veo ({model_name}, {duration}s)...")
    submit_req = urllib.request.Request(submit_url, data=payload, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    })
    max_retries = 5
    submit_result = None
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(submit_req, timeout=60) as resp:
                submit_result = json.loads(resp.read())
                break
        except urllib.error.HTTPError as e:
            error_body = e.read().decode()
            if e.code == 429:
                if attempt < max_retries - 1:
                    print(f"  ⚠ Quota exceeded (429). Retrying in 60s... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(60)
                    continue
                else:
                    print(f"  ✗ Quota exceeded (429). Out of retries.")
                    return False
            print(f"  ✗ Submit error ({e.code}): {error_body[:500]}")
            return False
        except Exception as e:
            print(f"  ✗ Submit exception: {e}")
            return False

    if not submit_result:
        return False

    op_name = submit_result.get("name", "")
    if not op_name:
        print(f"  ✗ No operation name returned: {json.dumps(submit_result)[:200]}")
        return False
    print(f"  ✓ Submitted (op: ...{op_name[-20:]})")

    # ── Step 2: Poll with :fetchPredictOperation ──
    poll_url = f"{base_url}:fetchPredictOperation"
    max_polls = 60  # up to 10 minutes
    for attempt in range(max_polls):
        time.sleep(10)
        poll_payload = json.dumps({"operationName": op_name}).encode()
        poll_req = urllib.request.Request(poll_url, data=poll_payload, headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        })
        try:
            with urllib.request.urlopen(poll_req, timeout=30) as resp:
                poll_result = json.loads(resp.read())
        except urllib.error.HTTPError as e:
            print(f"  ✗ Poll error ({e.code}): {e.read().decode()[:300]}")
            return False

        if not poll_result.get("done"):
            if attempt % 6 == 0:
                print(f"  ⏳ Polling... ({attempt * 10}s)")
            continue

        # Done — check for error
        if "error" in poll_result:
            err = poll_result["error"]
            print(f"  ✗ Veo error: {err.get('message', err)}")
            return False

        # ── Step 3: Extract video ──
        videos = poll_result.get("response", {}).get("videos", [])
        if not videos:
            print(f"  ✗ No videos in response.")
            return False

        video_b64 = videos[0].get("bytesBase64Encoded", "")
        if not video_b64:
            gcs = videos[0].get("_self", {}).get("gcsUri", "N/A")
            print(f"  ✗ No inline video bytes. GCS URI: {gcs}")
            return False

        # Save video
        prefix = config["output_prefix"]
        CINEMATICS_DIR.mkdir(parents=True, exist_ok=True)
        video_path = CINEMATICS_DIR / f"{prefix}.mp4"
        with open(video_path, "wb") as f:
            f.write(base64.b64decode(video_b64))
        print(f"  ✓ Saved: {video_path} ({len(video_b64)} chars b64)")

        # Extract assets (frames + audio) if requested
        if config.get("extract_frames"):
            extract_assets_from_video(video_path, prefix, config.get("fps", 8))

        return True

    print(f"  ✗ Timed out after {max_polls * 10}s")
    return False


def extract_assets_from_video(video_path: Path, prefix: str, fps: int = 15):
    """Use ffmpeg to extract frames to assets/sprites/vfx/ and audio to assets/audio/sfx/."""
    # Define directories
    sprites_vfx_dir = REPO_ROOT / "assets" / "sprites" / "vfx"
    audio_sfx_dir = REPO_ROOT / "assets" / "audio" / "sfx"
    
    sprites_vfx_dir.mkdir(parents=True, exist_ok=True)
    audio_sfx_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Extract frames
    output_pattern = str(sprites_vfx_dir / f"{prefix}_%04d.png")
    frame_result = subprocess.run([
        "ffmpeg", "-i", str(video_path),
        "-vf", f"fps={fps}",
        "-pix_fmt", "rgba",
        output_pattern,
        "-y"
    ], capture_output=True, text=True, timeout=120)

    if frame_result.returncode != 0:
        print(f"  ⚠ ffmpeg frame extraction failed: {frame_result.stderr[:200]}")
    else:
        frames = sorted(sprites_vfx_dir.glob(f"{prefix}_*.png"))
        print(f"  ✓ Extracted {len(frames)} frames to {sprites_vfx_dir}/")

    # 2. Extract audio
    audio_path = audio_sfx_dir / f"{prefix}.wav"
    audio_result = subprocess.run([
        "ffmpeg", "-i", str(video_path),
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "44100",
        "-ac", "1",
        str(audio_path),
        "-y"
    ], capture_output=True, text=True, timeout=60)

    if audio_result.returncode != 0:
        print(f"  ⚠ ffmpeg audio extraction failed: {audio_result.stderr[:200]}")
    else:
        if audio_path.exists() and audio_path.stat().st_size > 0:
            print(f"  ✓ Extracted audio to {audio_path} ({audio_path.stat().st_size} bytes)")
        else:
            print(f"  ⚠ Extracted audio file is empty or missing.")


def main():
    parser = argparse.ArgumentParser(
        description="Darius Star — Veo 3.1 Asset Generator"
    )
    parser.add_argument(
        "--project", default="darius-star-game",
        help="GCP project ID"
    )
    parser.add_argument(
        "--region", default="us-central1",
        help="GCP region"
    )
    parser.add_argument(
        "--asset", nargs="*", default=None,
        help="Specific asset ID(s) to generate"
    )
    parser.add_argument(
        "--category", default=None,
        help="Only generate assets from this category"
    )
    parser.add_argument(
        "--check", action="store_true",
        help="Only check Veo availability, don't generate"
    )
    parser.add_argument(
        "--list", action="store_true",
        help="List all Veo asset prompts"
    )
    parser.add_argument(
        "--delay", type=float, default=65.0,
        help="Seconds between Veo API calls (default: 65s, quota=1/min)"
    )
    args = parser.parse_args()

    # Verify auth
    try:
        token_preview = get_access_token()[:20]
        print(f"✓ GCP authenticated (token: {token_preview}...)")
    except Exception as e:
        print(f"✗ Auth failed: {e}")
        sys.exit(1)

    # Check availability
    model_name = check_veo_availability(args.project, args.region)
    if model_name:
        print(f"✅ Veo is AVAILABLE: {model_name}")
    else:
        print("❌ Veo is NOT available in this project.")
        print("   Imagen 3 IS available and working (used for static sprites).")
        print()
        print("   To enable Veo:")
        print("   1. Open: https://console.cloud.google.com/vertex-ai/model-garden")
        print("   2. Search for 'Veo'")
        print("   3. Click 'Enable' on Veo 3.1")
        print("   4. Accept any terms/TOS")
        print("   5. Re-run: python3 veo_client.py --check")

    if args.check:
        return 0 if model_name else 1

    if args.list:
        print(f"\nVeo Asset Catalog ({len(VEO_ASSET_CATALOG)} entries):")
        for asset_id, config in VEO_ASSET_CATALOG.items():
            print(f"  [{config['category']}] {asset_id}")
            print(f"    Duration: {config['duration_sec']}s at {config['fps']}fps")
            print(f"    Prompt: {config['prompt'][:100]}...")
        return 0

    if not model_name:
        print("\n⚠ Cannot generate — Veo not available.")
        print("  The prompt catalog is ready. Enable Veo then re-run.")
        return 1

    # Filter assets
    if args.asset:
        unknown = [a for a in args.asset if a not in VEO_ASSET_CATALOG]
        if unknown:
            print(f"Unknown asset(s): {', '.join(unknown)}")
            print(f"Available: {', '.join(sorted(VEO_ASSET_CATALOG.keys()))}")
            return 1
        assets_to_gen = {a: VEO_ASSET_CATALOG[a] for a in args.asset}
    elif args.category:
        assets_to_gen = {
            k: v for k, v in VEO_ASSET_CATALOG.items()
            if v["category"] == args.category
        }
    else:
        assets_to_gen = VEO_ASSET_CATALOG

    if not assets_to_gen:
        print(f"No assets match category '{args.category}'")
        return 1

    print(f"\n{'='*60}")
    print(f"  Darius Star — Veo Asset Generator")
    print(f"  Project: {args.project} | Region: {args.region}")
    print(f"  Model: {model_name}")
    print(f"  Assets: {len(assets_to_gen)}")
    print(f"{'='*60}\n")

    generated = []
    failed = []

    # Veo quota: 1 request/minute — space requests per --delay
    first = True
    for asset_id, config in assets_to_gen.items():
        if not first:
            print(f"  ⏱  Rate limit (1/min) — waiting {args.delay}s...")
            time.sleep(args.delay)
        first = False
        print(f"\n[{config['category']}] {asset_id}")
        print(f"  Prompt: {config['prompt'][:100]}...")
        if generate_veo(asset_id, config, args.project, args.region, model_name):
            generated.append(asset_id)
        else:
            failed.append(asset_id)

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
