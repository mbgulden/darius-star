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
        "--asset", default=None,
        help="Specific asset ID to generate"
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
        if args.asset not in VEO_ASSET_CATALOG:
            print(f"Unknown asset: {args.asset}")
            print(f"Available: {', '.join(VEO_ASSET_CATALOG.keys())}")
            return 1
        assets_to_gen = {args.asset: VEO_ASSET_CATALOG[args.asset]}
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

    # Veo quota: 1 request/minute — space requests 90s apart
    first = True
    for asset_id, config in assets_to_gen.items():
        if not first:
            import time
            print(f"  ⏱  Rate limit (1/min) — waiting 90s...")
            time.sleep(90)
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
