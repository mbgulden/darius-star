#!/usr/bin/env python3
"""Darius Star Main Theme — Lyria 2 batch generation. 6 variations, ~$0.24."""
import os, sys, json, base64, subprocess, time
from pathlib import Path
from google.cloud import aiplatform
from google.protobuf import json_format
from google.protobuf.struct_pb2 import Value

PROJECT_ID = "darius-star-game"
LOCATION = "us-central1"
MODEL_PATH = "publishers/google/models/lyria-002"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "assets" / "audio" / "main-theme"

PROMPTS = {
    "ambient-ocean-trench": "Subtle ambient low-frequency ocean pressure drone with distant underwater rumbles, deep sea trench atmosphere, quiet and dark, 30-second loop",
    "ambient-cosmic-void": "Ethereal cosmic void drone, quiet deep space ambient background with occasional sub-bass rumble, sense of infinite isolation, subtle electronic shimmer, 30-second loop"
}

def generate(prompt):
    client = aiplatform.gapic.PredictionServiceClient(
        client_options={"api_endpoint": "aiplatform.googleapis.com"}
    )
    instance = json_format.ParseDict({"prompt": prompt}, Value())
    endpoint = f"projects/{PROJECT_ID}/locations/{LOCATION}/{MODEL_PATH}"
    resp = client.predict(endpoint=endpoint, instances=[instance])
    for pred in resp.predictions:
        b64 = dict(pred).get("bytesBase64Encoded", "")
        if b64:
            return base64.b64decode(b64)
    return None

def save_mp3(data, path):
    wav = path.with_suffix(".wav")
    with open(wav, "wb") as f:
        f.write(data)
    subprocess.run(["ffmpeg", "-i", str(wav), "-codec:a", "libmp3lame", "-b:a", "128k", "-y", str(path)],
                   capture_output=True, check=False, timeout=30)
    wav.unlink(missing_ok=True)
    return path.stat().st_size if path.exists() else 0

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
generated, failed = [], []

for key, prompt in PROMPTS.items():
    print(f"\n[{key}] Generating...", flush=True)
    data = generate(prompt)
    if data:
        path = OUTPUT_DIR / f"{key}.mp3"
        size = save_mp3(data, path)
        print(f"  ✓ {path.name} ({size/1024:.0f} KB MP3)", flush=True)
        generated.append(key)
    else:
        print(f"  ❌ FAILED", flush=True)
        failed.append(key)
    time.sleep(2)

print(f"\n{'='*50}")
print(f"  {len(generated)} generated, {len(failed)} failed")
print(f"  Output: {OUTPUT_DIR}")
sys.exit(0 if not failed else 1)
