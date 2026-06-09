#!/usr/bin/env python3
"""Convert existing Veo-generated background frames into parallax sprite sheet strips."""

import hashlib, json, sys
from pathlib import Path
from datetime import datetime, timezone
from PIL import Image

REPO_ROOT = Path("/home/ubuntu/work/darius-star")
SPRITES_DIR = REPO_ROOT / "assets" / "sprites"
BG_DIR = SPRITES_DIR / "backgrounds"
SPRITES_JSON = REPO_ROOT / "assets" / "sprites.json"

STRIP_FRAME_COUNT = 30

BACKGROUNDS = [
    "bg_abyssal_trench",
    "bg_coral_graveyard",
    "bg_coelacanth_lair",
    # bg_title will be added after Veo finishes
]


def compute_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def create_strip(prefix):
    """Create a horizontal sprite sheet strip from extracted frames."""
    frames = sorted(SPRITES_DIR.glob(f"{prefix}_*.png"))
    if not frames:
        print(f"  ✗ No frames found for {prefix}")
        return None

    # Sample evenly
    if len(frames) > STRIP_FRAME_COUNT:
        step = len(frames) / STRIP_FRAME_COUNT
        sampled = [frames[int(i * step)] for i in range(STRIP_FRAME_COUNT)]
    else:
        sampled = frames

    first = Image.open(sampled[0])
    fw, fh = first.size

    # +1 frame at end for seamless loop wrap
    total_width = fw * (len(sampled) + 1)
    strip = Image.new("RGBA", (total_width, fh))

    for i, fp in enumerate(sampled):
        img = Image.open(fp)
        strip.paste(img, (i * fw, 0))

    # Loop seam: paste first frame at end
    strip.paste(first, (len(sampled) * fw, 0))

    BG_DIR.mkdir(parents=True, exist_ok=True)
    strip_path = BG_DIR / f"{prefix}_strip.png"
    strip.save(strip_path, "PNG", optimize=True)
    size_kb = strip_path.stat().st_size / 1024
    print(f"  ✓ {strip_path.name}: {fw}×{fh} → {total_width}×{fh}, {size_kb:.0f} KB")
    return strip_path, fw, fh, total_width


def main():
    results = {}
    for prefix in BACKGROUNDS:
        result = create_strip(prefix)
        if result:
            strip_path, fw, fh, tw = result
            results[prefix] = {
                "strip_path": strip_path,
                "frame_width": fw,
                "frame_height": fh,
                "strip_width": tw,
            }

    if not results:
        print("No strips created")
        return 1

    # Update sprites.json
    with open(SPRITES_JSON) as f:
        manifest = json.load(f)

    manifest["generated_at"] = datetime.now(timezone.utc).isoformat()

    for bg_id, info in results.items():
        strip_path = info["strip_path"]
        rel_path = str(strip_path.relative_to(REPO_ROOT))
        sha = compute_sha256(strip_path)

        manifest["sprites"][bg_id] = {
            "type": "parallax_strip",
            "path": rel_path,
            "frame_width": info["frame_width"],
            "frame_height": info["frame_height"],
            "strip_width": info["strip_width"],
            "frame_count": STRIP_FRAME_COUNT + 1,
            "sha256": sha,
        }

    with open(SPRITES_JSON, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"\n✓ Updated sprites.json — {len(results)} background strips registered")
    return 0


if __name__ == "__main__":
    sys.exit(main())
