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
        "--track", default=None,
        help="Generate specific track (e.g., 'title', 'phase1', 'boss_loop')"
    )
    parser.add_argument(
        "--all", action="store_true",
        help="Generate all 9 music tracks"
    )
    parser.add_argument(
        "--manifest", action="store_true",
        help="Only regenerate audio_manifest.json"
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
        if args.track not in MUSIC_CATALOG:
            print(f"Unknown track: {args.track}")
            print(f"Available: {', '.join(MUSIC_CATALOG.keys())}")
            return 1
        tracks = {args.track: MUSIC_CATALOG[args.track]}
    elif args.all:
        tracks = MUSIC_CATALOG
    else:
        print("Specify --track <id> or --all")
        return 1

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
