#!/usr/bin/env python3
"""
Darius Star Asset Pipeline
==========================
Automated workflow for asset generation, processing, and validation.
"""

import os
import sys
import json
import subprocess
import shutil
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
ASSETS_DIR = REPO_ROOT / "assets"
SPRITES_DIR = ASSETS_DIR / "sprites"
MANIFEST_PATH = ASSETS_DIR / "ASSET_MANIFEST.json"
SPRITES_JSON = ASSETS_DIR / "sprites.json"

def run_command(cmd, cwd=REPO_ROOT):
    """Runs a shell command and returns success."""
    print(f"Running: {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, cwd=cwd, check=True, capture_output=True, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        print(e.stderr)
        return False, e.stderr

def check_pillow():
    """Checks if Pillow is installed, attempts to install if not."""
    try:
        from PIL import Image
        print("✓ Pillow is installed.")
        return True
    except ImportError:
        print("Pillow not found. Attempting to install...")
        success, _ = run_command([sys.executable, "-m", "pip", "install", "Pillow"])
        return success

def ensure_boss_sprite():
    """Generates boss_0.png if it doesn't exist."""
    boss_path = SPRITES_DIR / "boss_0.png"
    if not boss_path.exists():
        print("boss_0.png missing. Generating...")
        success, _ = run_command([sys.executable, "tools/generate_boss_sprite.py"])
        return success
    print("✓ boss_0.png exists.")
    return True

def slice_assets():
    """Slices sprite sheets."""
    print("Slicing all sprite sheets...")
    # Currently 'all' is a placeholder to avoid massive regressions until
    # more precise sheet discovery is implemented.
    success, _ = run_command([sys.executable, "tools/slice_sprites.py", "--category", "all"])
    return success

def validate_outputs():
    """Validates the state of assets/sprites.json and files on disk."""
    print("Validating asset integrity...")
    if not SPRITES_JSON.exists():
        print("Error: assets/sprites.json missing.")
        return False, 0, 0

    with open(SPRITES_JSON, 'r') as f:
        data = json.load(f)

    sprites = data.get("sprites", {})
    frame_count = 0
    sheet_count = len(sprites)

    for name, sprite_data in sprites.items():
        for frame in sprite_data.get("frames", []):
            path_str = frame.get("path")
            if not path_str:
                continue
            path = REPO_ROOT / path_str
            if not path.exists():
                print(f"Warning: Frame missing on disk: {path_str}")
            else:
                frame_count += 1

    return True, sheet_count, frame_count

def generate_full_manifest():
    """Generates a comprehensive ASSET_MANIFEST.json for the game."""
    print("Generating ASSET_MANIFEST.json...")

    # Get current UTC time for manifest
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    manifest = {
        "version": "1.0.0",
        "generated_at": now,
        "categories": {
            "sprites": [],
            "audio": [],
            "cinematics": []
        },
        "statistics": {
            "total_files": 0,
            "total_size_kb": 0
        }
    }

    total_size = 0
    total_files = 0

    # Process Sprites (from sprites.json)
    if SPRITES_JSON.exists():
        with open(SPRITES_JSON, 'r') as f:
            sprites_data = json.load(f)
            for name, data in sprites_data.get("sprites", {}).items():
                for frame in data.get("frames", []):
                    fpath_str = frame.get("path")
                    if not fpath_str:
                        continue
                    fpath = REPO_ROOT / fpath_str
                    if fpath.exists():
                        size = fpath.stat().st_size
                        total_size += size
                        total_files += 1
                        manifest["categories"]["sprites"].append({
                            "name": name,
                            "index": frame["index"],
                            "path": fpath_str,
                            "size_bytes": size,
                            "width": frame["width"],
                            "height": frame["height"]
                        })

    # Process Audio
    audio_dir = ASSETS_DIR / "audio"
    if audio_dir.exists():
        for root, _, files in os.walk(audio_dir):
            for f in files:
                if f.endswith(('.wav', '.mp3', '.ogg')):
                    fpath = Path(root) / f
                    rel_path = fpath.relative_to(REPO_ROOT)
                    size = fpath.stat().st_size
                    total_size += size
                    total_files += 1
                    manifest["categories"]["audio"].append({
                        "filename": f,
                        "path": str(rel_path),
                        "size_bytes": size
                    })

    # Process Cinematics
    cin_dir = ASSETS_DIR / "cinematics"
    if cin_dir.exists():
        for f in os.listdir(cin_dir):
            if f.endswith('.mp4'):
                fpath = cin_dir / f
                rel_path = fpath.relative_to(REPO_ROOT)
                size = fpath.stat().st_size
                total_size += size
                total_files += 1
                manifest["categories"]["cinematics"].append({
                    "filename": f,
                    "path": str(rel_path),
                    "size_bytes": size
                })

    manifest["statistics"]["total_files"] = total_files
    manifest["statistics"]["total_size_kb"] = round(total_size / 1024, 2)

    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=2)

    return True, total_files, manifest["statistics"]["total_size_kb"]

def main():
    print("=== Darius Star Asset Pipeline ===")

    if not check_pillow():
        print("Failed to ensure Pillow.")
        sys.exit(1)

    if not ensure_boss_sprite():
        print("Failed to generate/find boss sprite.")
        sys.exit(1)

    if not slice_assets():
        print("Failed to slice assets.")
        sys.exit(1)

    valid, sheets, frames = validate_outputs()
    if not valid:
        print("Validation failed.")
        sys.exit(1)

    success, total_assets, total_kb = generate_full_manifest()
    if not success:
        print("Failed to generate manifest.")
        sys.exit(1)

    print("\n" + "="*40)
    print("PIPELINE COMPLETE")
    print(f"{sheets} sprite groups → {frames} individual frames")
    print(f"Total Assets: {total_assets}")
    print(f"Total Size: {total_kb} KB")
    print("="*40)

if __name__ == "__main__":
    main()
