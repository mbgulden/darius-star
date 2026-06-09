#!/usr/bin/env python3
"""
Lyria 2 Audio Generator — Darius Star: Cyber Coelacanth
=========================================================
Generates 30-second instrumental game music loops via Lyria 2 API.
Uses Google Gemini API (generativelanguage.googleapis.com).

STATUS: Script ready. Needs GEMINI_API_KEY.
        Lyria is accessed via Gemini API, NOT Vertex AI.

PREREQUISITES:
  export GEMINI_API_KEY="your-key-here"
  pip install google-genai

GET A KEY: https://aistudio.google.com/apikey

Usage:
  python3 generate_audio.py --check          # Verify API connection
  python3 generate_audio.py --list           # Show all 9 music prompts
  python3 generate_audio.py --all            # Generate all 9 tracks
  python3 generate_audio.py --track phase1   # Generate specific track

Cost: ~$0.04 per 30s clip → $0.36 total for 9 tracks
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
            "builds to a climax then cuts — designed for one-shot play."
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
            "somber but not depressing — motivates retry."
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
}

REPO_ROOT = Path(__file__).parent
AUDIO_DIR = REPO_ROOT / "assets" / "audio"


def get_api_key():
    """Get Gemini API key from environment."""
    key = os.environ.get("GEMINI_API_KEY", os.environ.get("GOOGLE_API_KEY", ""))
    if not key:
        # Check common config files
        for path in [
            REPO_ROOT / ".env",
            Path.home() / ".gemini" / "api_key",
        ]:
            if path.exists():
                key = path.read_text().strip()
                if key:
                    return key
    return key


def generate_lyria2(prompt: str, duration_sec: int = 30) -> bytes | None:
    """Generate music via Lyria 2 Gemini API.

    Returns raw audio bytes on success, None on failure.
    """
    api_key = get_api_key()
    if not api_key:
        print("  ✗ No GEMINI_API_KEY found.")
        print("  → Get one: https://aistudio.google.com/apikey")
        print("  → Then: export GEMINI_API_KEY='your-key'")
        return None

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        # Lyria 2 uses the music generation capability
        # Model: lyria-2 (30-second instrumentals)
        response = client.models.generate_content(
            model="lyria-2-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
            ),
        )

        # Extract audio from response
        for part in response.candidates[0].content.parts:
            if hasattr(part, 'inline_data') and part.inline_data:
                data = part.inline_data.data
                mime = part.inline_data.mime_type
                print(f"  ✓ Generated: {len(data)} bytes ({mime})")
                return data

        print(f"  ✗ No audio in response")
        return None

    except ImportError:
        print("  ✗ google-genai not installed.")
        print("  → pip install google-genai")
        return None
    except Exception as e:
        print(f"  ✗ API error: {e}")
        return None


def generate_via_rest(prompt: str, duration_sec: int = 30) -> bytes | None:
    """Fallback: Generate via REST API directly."""
    import urllib.request
    import urllib.error

    api_key = get_api_key()
    if not api_key:
        return None

    url = (
        "https://generativelanguage.googleapis.com/v1beta/"
        "models/lyria-2-preview:generateContent"
    )

    payload = json.dumps({
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
        }
    }).encode()

    req = urllib.request.Request(
        f"{url}?key={api_key}",
        data=payload,
        headers={"Content-Type": "application/json"},
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read())

        # Extract base64 audio
        candidates = result.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            for part in parts:
                if "inlineData" in part:
                    b64 = part["inlineData"].get("data", "")
                    if b64:
                        data = base64.b64decode(b64)
                        print(f"  ✓ REST: {len(data)} bytes")
                        return data

        print(f"  ✗ No audio in REST response")
        return None

    except urllib.error.HTTPError as e:
        body = e.read().decode()[:500]
        print(f"  ✗ REST HTTP {e.code}: {body}")
        return None


def save_audio(data: bytes, output_path: str):
    """Save audio bytes to file, converting to MP3 if needed."""
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    # Try to detect format and convert to MP3
    # Lyria typically outputs WAV — convert to MP3 for smaller game files
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
        tmp_wav.unlink()  # Remove temp WAV
        size_kb = path.stat().st_size / 1024
        print(f"  ✓ Saved: {path.name} ({size_kb:.0f} KB MP3)")
    except (subprocess.CalledProcessError, FileNotFoundError):
        # ffmpeg not available — keep as WAV
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
        description="Darius Star — Lyria 2 Audio Generator"
    )
    parser.add_argument(
        "--check", action="store_true",
        help="Verify API connection and key"
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
    print(f"  Tracks: {len(MUSIC_CATALOG)}")
    print(f"{'='*60}\n")

    # Check API key
    api_key = get_api_key()
    if api_key:
        print(f"✓ API key found ({api_key[:8]}...)")
    else:
        print("❌ No GEMINI_API_KEY found.")
        print("   Get one: https://aistudio.google.com/apikey")
        print("   Then: export GEMINI_API_KEY='your-key'")
        if not args.list:
            print("\n⚠ Run with --list to see prompts while waiting for key.")
            return 1

    if args.list:
        print(f"\nMusic Catalog ({len(MUSIC_CATALOG)} tracks):\n")
        total_cost = 0
        for track_id, config in MUSIC_CATALOG.items():
            cost = 0.04 if config["duration"] >= 20 else 0.02
            total_cost += cost
            print(f"  [{config['scene']}]")
            print(f"    ID: {track_id} | Duration: {config['duration']}s | Loop: {config['loop']}")
            print(f"    Prompt: {config['prompt'][:100]}...")
            print(f"    Output: {config['output']} (~${cost:.2f})")
            print()
        print(f"  Total estimated cost: ${total_cost:.2f}")
        return 0

    if args.check:
        if not api_key:
            return 1
        print("Testing Lyria 2 connection...")
        data = generate_via_rest("single piano note C major, 1 second", 1)
        if data:
            print("✅ Lyria 2 API: connected!")
            return 0
        else:
            print("❌ Lyria 2 API: failed — check key and model availability")
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

    if not api_key:
        return 1

    generated = []
    failed = []

    for track_id, config in tracks.items():
        print(f"\n[{config['scene']}] {track_id}")
        print(f"  Prompt: {config['prompt'][:80]}...")

        # Try SDK first, fall back to REST
        data = generate_lyria2(config["prompt"], config["duration"])
        if data is None:
            data = generate_via_rest(config["prompt"], config["duration"])

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
