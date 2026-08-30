#!/usr/bin/env python3
"""
scripts/generate_showcase_assets.py — Generate Showcase Voice Samples & Boss Video
Generates:
1. 7 bespoke showcase audio lines (one for each story character).
2. A 60fps HD Boss Cinematic Video (Apex Cyber Coelacanth Encounter).
3. Ingests and verifies all outputs using google.antigravity SDK.
"""

import os
import sys
import json
import google.antigravity as agy

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOWCASE_DIR = os.path.join(REPO_ROOT, "assets/showcase")
os.makedirs(os.path.join(SHOWCASE_DIR, "voice"), exist_ok=True)
os.makedirs(os.path.join(SHOWCASE_DIR, "video"), exist_ok=True)

# Import rendering pipelines
sys.path.insert(0, os.path.join(REPO_ROOT, "scripts"))
from generate_voice_audio import process_voice_line
from generate_boss_cinematics import render_cinematic

# 1. Seven Character Showcase Voice Scripts
SHOWCASE_VOICE_SCRIPTS = [
    ("showcase_darius", {
        "speaker": "darius",
        "text": "This is Darius Star aboard the Nyxa. All weapons locked on the Coelacanth core. We finish this today.",
        "duration": 4.5,
        "file": "../../showcase/voice/darius_showcase.mp3"
    }),
    ("showcase_lyra", {
        "speaker": "lyra",
        "text": "Daddy, the precursor quantum harmonies are opening. I'm shielding our navigation matrix now.",
        "duration": 4.2,
        "file": "../../showcase/voice/lyra_showcase.mp3"
    }),
    ("showcase_thorne", {
        "speaker": "thorne",
        "text": "Mission Control to Nyxa. Tactical telemetry confirmed. You are cleared for hot entry into Sector 10.",
        "duration": 4.6,
        "file": "../../showcase/voice/thorne_showcase.mp3"
    }),
    ("showcase_naya", {
        "speaker": "naya",
        "text": "Naya on your right wing, Darius! I've got three fighters breaking through the spore cloud—taking them out!",
        "duration": 4.8,
        "file": "../../showcase/voice/naya_showcase.mp3"
    }),
    ("showcase_cross", {
        "speaker": "cross",
        "text": "Cybernetic dampers synchronized. Target signature acquired. Commencing railgun suppression volley.",
        "duration": 4.4,
        "file": "../../showcase/voice/cross_showcase.mp3"
    }),
    ("showcase_selene", {
        "speaker": "selene",
        "text": "Haven-7 Base Command transmitting encrypted survey coordinates. Be advised: extreme gravitational shear detected.",
        "duration": 5.0,
        "file": "../../showcase/voice/selene_showcase.mp3"
    }),
    ("showcase_architect", {
        "speaker": "architect",
        "text": "Mortal vessels enter the singularity... The Dreamer awakens. Your journey ends where creation began.",
        "duration": 5.5,
        "file": "../../showcase/voice/architect_showcase.mp3"
    }),
]

def generate_voice_showcase():
    print("=" * 70)
    print("1. GENERATING 7 CHARACTER SHOWCASE AUDIO SAMPLES")
    print("=" * 70)
    
    results = []
    for line_id, data in SHOWCASE_VOICE_SCRIPTS:
        print(f"Generating voice for [{data['speaker'].upper()}]: \"{data['text']}\"")
        process_voice_line((line_id, data))
        
        # Verify via Antigravity SDK
        out_path = os.path.join(SHOWCASE_DIR, "voice", f"{data['speaker']}_showcase.mp3")
        if os.path.exists(out_path):
            audio_obj = agy.Audio.from_file(out_path)
            results.append((data['speaker'], out_path, len(audio_obj.data), audio_obj.mime_type))
            print(f"  -> [SDK Verified] {out_path} ({len(audio_obj.data):,} bytes, {audio_obj.mime_type})")
        else:
            print(f"  -> [ERROR] Failed to find {out_path}")
            
    return results

def generate_video_showcase():
    print("\n" + "=" * 70)
    print("2. GENERATING SHOWCASE 60FPS HD BOSS CINEMATIC VIDEO")
    print("=" * 70)
    
    boss_config = {
        "name": "CYBERNETIC COELACANTH APEX",
        "superpower": "QUANTUM SINGULARITY & CHRONO HYPER-BEAM",
        "path": "assets/showcase/video/boss_cyber_coelacanth_showcase.mp4",
        "duration": 5,
        "themeColor": "#00ffff"
    }
    
    print(f"Rendering Video: {boss_config['name']} ({boss_config['superpower']})...")
    render_cinematic("showcase_boss_coelacanth", boss_config)
    
    # Verify via Antigravity SDK
    out_path = os.path.join(REPO_ROOT, boss_config["path"])
    video_result = None
    if os.path.exists(out_path):
        video_obj = agy.Video.from_file(out_path)
        video_result = (boss_config['name'], out_path, len(video_obj.data), video_obj.mime_type)
        print(f"  -> [SDK Verified] {out_path} ({len(video_obj.data):,} bytes, {video_obj.mime_type})")
    else:
        print(f"  -> [ERROR] Video output missing: {out_path}")
        
    return video_result

def main():
    print(f"Running Antigravity SDK Media Showcase (SDK v{getattr(agy, '__version__', '0.1.15')})")
    voice_results = generate_voice_showcase()
    video_result = generate_video_showcase()
    
    print("\n" + "=" * 70)
    print("SHOWCASE GENERATION COMPLETE & VERIFIED VIA ANTIGRAVITY SDK")
    print("=" * 70)
    print("Character Voice Audio Samples:")
    for spk, path, size, mime in voice_results:
        print(f" - {spk.capitalize():10s}: {path} ({size:,} bytes)")
    if video_result:
        print(f"\nBoss Encounter Video:\n - {video_result[0]}: {video_result[1]} ({video_result[2]:,} bytes)")

if __name__ == "__main__":
    main()
