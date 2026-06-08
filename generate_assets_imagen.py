#!/usr/bin/env python3
"""
Imagen 3 Asset Generator — Vertex AI Integration
=================================================
Uses Google Cloud Vertex AI Imagen 3 API for sprite generation.

Prerequisites:
  1. GCP project with Vertex AI API enabled
  2. Service account with "Vertex AI User" role
  3. Service account JSON key file downloaded
  4. GOOGLE_APPLICATION_CREDENTIALS env var set

Usage:
  python3 generate_assets_imagen.py --project YOUR_PROJECT_ID --assets player enemy_scout
"""

import os
import sys
import json
import argparse
import base64
import urllib.request
from pathlib import Path
from datetime import datetime, timezone

# ──────────────────────────────────────────────
# Asset prompts (same catalog as generate_assets.py)
# ──────────────────────────────────────────────

ASSET_CATALOG = {
    "player": {
        "category": "Player Ship",
        "prompt": "Retro-cyberpunk fighter jet, 2D side-view sprite, 16-bit pixel art style, sleek aerodynamic frame with neon blue and purple glow accents, visible exhaust ports, high contrast, transparent background.",
        "width": 256, "height": 128, "frames": 2,
        "prefix": "player", "output_prefix": "player", "aspect_ratio": "1:1",
    },
    "enemy_scout": {
        "category": "Enemy Fleet",
        "prompt": "Cybernetic robotic fish with metallic scales, 2D side-view sprite, 16-bit pixel art, glowing cyan eye, orange metallic body, transparent background.",
        "width": 64, "height": 64, "frames": 1,
        "prefix": "scout", "output_prefix": "scout", "aspect_ratio": "1:1",
    },
    "enemy_interceptor": {
        "category": "Enemy Fleet",
        "prompt": "Cybernetic arrowhead ship, 2D side-view sprite, 16-bit pixel art, pink-red metallic body, red thruster flame, transparent background.",
        "width": 64, "height": 64, "frames": 1,
        "prefix": "interceptor", "output_prefix": "interceptor", "aspect_ratio": "1:1",
    },
    "enemy_heavy": {
        "category": "Enemy Fleet",
        "prompt": "Cybernetic trilobite/crab heavy armor ship, 2D side-view sprite, 16-bit pixel art, purple metallic shell, white plating, red cannon, transparent background.",
        "width": 64, "height": 64, "frames": 1,
        "prefix": "heavy", "output_prefix": "heavy", "aspect_ratio": "1:1",
    },
    "enemy_boss_minion": {
        "category": "Enemy Fleet",
        "prompt": "Cybernetic round green metallic scale minion, 2D side-view sprite, 16-bit pixel art, sharp dorsal fin, transparent background.",
        "width": 32, "height": 32, "frames": 1,
        "prefix": "boss_minion", "output_prefix": "boss_minion", "aspect_ratio": "1:1",
    },
    "boss": {
        "category": "Colossal Boss",
        "prompt": "'Cyber Coelacanth' dreadnought ship, massive armored prehistoric fish, biomechanical plating, glowing red optic sensors, side-view boss sprite, intricate engine details, neon pink fins, transparent background.",
        "width": 360, "height": 280, "frames": 1,
        "prefix": "boss", "output_prefix": "boss", "aspect_ratio": "4:3",
    },
    "vfx_laser": {
        "category": "VFX",
        "prompt": "2D retro plasma laser beam, 16-bit pixel art, bright cyan/blue energy beam, horizontal, pixel-perfect, transparent background.",
        "width": 64, "height": 16, "frames": 1,
        "prefix": "laser", "output_prefix": "laser", "aspect_ratio": "1:1",
    },
    "vfx_explosion": {
        "category": "VFX",
        "prompt": "2D retro explosion sprite sheet, multi-frame circular shockwave, orange/yellow/white fire, 16-bit pixel art, transparent background, 4 frames in a strip.",
        "width": 128, "height": 32, "frames": 4,
        "prefix": "explosion", "output_prefix": "explosion", "aspect_ratio": "1:1",
    },
    "vfx_shield": {
        "category": "VFX",
        "prompt": "Translucent blue energy shield forcefield ring, 16-bit pixel art, circular glowing barrier, semi-transparent cyan, transparent background.",
        "width": 64, "height": 64, "frames": 1,
        "prefix": "shield", "output_prefix": "shield", "aspect_ratio": "1:1",
    },
    "powerup_weapon": {
        "category": "VFX",
        "prompt": "Red metallic orb power-up with 'W' letter, 16-bit pixel art, bright red neon glow, transparent background.",
        "width": 32, "height": 32, "frames": 1,
        "prefix": "powerup_w", "output_prefix": "powerup_w", "aspect_ratio": "1:1",
    },
    "powerup_shield": {
        "category": "VFX",
        "prompt": "Green metallic orb power-up with 'S' letter, 16-bit pixel art, bright green neon glow, transparent background.",
        "width": 32, "height": 32, "frames": 1,
        "prefix": "powerup_s", "output_prefix": "powerup_s", "aspect_ratio": "1:1",
    },
    "bg_nebula": {
        "category": "Parallax",
        "prompt": "Deep-space nebula background, layered seamless scrolling, neon gas clouds in purple/blue/cyan, distant stars, 16-bit pixel art, tileable horizontally.",
        "width": 800, "height": 450, "frames": 1,
        "prefix": "bg_nebula", "output_prefix": "bg_nebula", "aspect_ratio": "16:9",
    },
    "bg_city": {
        "category": "Parallax",
        "prompt": "Cyberpunk biomechanical city background, towering silhouettes, flickering neon lights, dark atmosphere, 16-bit pixel art, tileable horizontally.",
        "width": 800, "height": 450, "frames": 1,
        "prefix": "bg_city", "output_prefix": "bg_city", "aspect_ratio": "16:9",
    },
    "title": {
        "category": "Title",
        "prompt": "16-bit arcade title card, 'Darius Star: Cyber Coelacanth' in stylized glowing futuristic font, dark space background, vibrant neon colors, retro-gaming aesthetic.",
        "width": 800, "height": 450, "frames": 1,
        "prefix": "title", "output_prefix": "title", "aspect_ratio": "16:9",
    },
}

REPO_ROOT = Path(__file__).parent
SPRITES_DIR = REPO_ROOT / "assets" / "sprites"


def get_access_token():
    """Get Google Cloud access token using gcloud CLI."""
    import subprocess
    result = subprocess.run(
        ["gcloud", "auth", "print-access-token"],
        capture_output=True, text=True, timeout=15
    )
    if result.returncode != 0:
        raise RuntimeError(f"gcloud auth failed: {result.stderr.strip()}\nRun: gcloud auth login")
    return result.stdout.strip()


def generate_imagen(asset_id: str, config: dict, project_id: str, region: str = "us-central1"):
    """Generate sprite via Vertex AI Imagen 3."""
    import urllib.request
    import urllib.error

    token = get_access_token()

    # Vertex AI Imagen 3 endpoint
    url = (
        f"https://{region}-aiplatform.googleapis.com"
        f"/v1/projects/{project_id}/locations/{region}"
        f"/publishers/google/models/imagen-3.0-generate-001:predict"
    )

    # Build the prompt with pixel-art specific instructions
    prompt = (
        f"{config['prompt']} "
        f"Pixel art style. Clean edges. Power-of-two dimensions. "
        f"Game sprite asset. Solid shapes, no blur."
    )

    payload = json.dumps({
        "instances": [{
            "prompt": prompt,
        }],
        "parameters": {
            "sampleCount": config.get("frames", 1),
            "aspectRatio": config.get("aspect_ratio", "1:1"),
            "negativePrompt": "blurry, photorealistic, 3D, complex gradients, smooth shading",
            "personGeneration": "dont_allow",
        }
    }).encode()

    req = urllib.request.Request(url, data=payload, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    })

    print(f"  → Calling Imagen 3 (project: {project_id})...")
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"  ✗ API error ({e.code}): {error_body[:500]}")
        return False
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

    # Extract generated images
    predictions = result.get("predictions", [])
    if not predictions:
        print(f"  ✗ No predictions returned. Full response: {json.dumps(result, indent=2)[:500]}")
        return False

    prefix = config["prefix"]
    saved = 0

    for i, prediction in enumerate(predictions):
        # Imagen returns base64-encoded PNG in bytesBase64Encoded
        img_data = prediction.get("bytesBase64Encoded", "")
        if not img_data:
            continue

        filename = f"{prefix}_{i}.png"
        filepath = SPRITES_DIR / filename
        SPRITES_DIR.mkdir(parents=True, exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(img_data))
        print(f"  ✓ {filename} ({config['width']}x{config['height']})")
        saved += 1

    return saved > 0


def main():
    parser = argparse.ArgumentParser(description="Darius Star — Imagen 3 Asset Generator")
    parser.add_argument("--project", required=True, help="GCP project ID")
    parser.add_argument("--region", default="us-central1", help="GCP region (default: us-central1)")
    parser.add_argument("--assets", nargs="*", default=None, help="Specific asset IDs to generate")
    parser.add_argument("--category", default=None, help="Only generate assets from this category")
    args = parser.parse_args()

    # Filter assets
    if args.assets:
        assets_to_gen = {k: ASSET_CATALOG[k] for k in args.assets if k in ASSET_CATALOG}
    elif args.category:
        assets_to_gen = {k: v for k, v in ASSET_CATALOG.items() if v["category"] == args.category}
    else:
        assets_to_gen = ASSET_CATALOG

    print(f"\n{'='*60}")
    print(f"  Darius Star — Imagen 3 Asset Generator")
    print(f"  Project: {args.project} | Region: {args.region}")
    print(f"  Assets: {len(assets_to_gen)}")
    print(f"{'='*60}\n")

    SPRITES_DIR.mkdir(parents=True, exist_ok=True)

    # Verify auth
    try:
        token_preview = get_access_token()[:20]
        print(f"✓ GCP authenticated (token: {token_preview}...)")
    except Exception as e:
        print(f"✗ Auth failed: {e}")
        sys.exit(1)

    generated = []
    failed = []

    for asset_id, config in assets_to_gen.items():
        print(f"\n[{config['category']}] {asset_id}")
        print(f"  Prompt: {config['prompt'][:80]}...")
        if generate_imagen(asset_id, config, args.project, args.region):
            generated.append(asset_id)
        else:
            failed.append(asset_id)
            print(f"  → Falling back to mock for {asset_id}")
            from generate_assets import generate_mock
            generate_mock(asset_id, config)
        # Rate limit: pause between requests to avoid quota errors
        import time
        time.sleep(10)

    # Run manifest
    import subprocess
    manifest_script = REPO_ROOT / "generate_sprites_manifest.py"
    if manifest_script.exists():
        print(f"\n{'='*60}")
        print("  Running manifest generator...")
        subprocess.run(["python3", str(manifest_script)], capture_output=False)

    # Summary
    print(f"\n{'='*60}")
    print(f"  Results: {len(generated)} Imagen, {len(failed)} mock fallback")
    if generated:
        print(f"  ✓ Imagen: {', '.join(generated)}")
    if failed:
        print(f"  ⚠ Mock: {', '.join(failed)}")
    print(f"{'='*60}\n")

    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
