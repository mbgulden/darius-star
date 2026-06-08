#!/usr/bin/env python3
"""
Darius Star — Automated Asset Generator
========================================
One script to replace 6 manual Google Flow Beta sessions.

Reads asset prompts from the Integration Pack, calls an image generation API,
downloads/saves sprites, and updates the sprite manifest.

Usage:
  python3 generate_assets.py --provider mock           # Generate mock sprites (testing)
  python3 generate_assets.py --provider leonardo --key $API_KEY   # Leonardo.ai API
  python3 generate_assets.py --provider imagen --key $API_KEY     # Imagen 3 (Vertex AI)
  python3 generate_assets.py --provider gemini --key $API_KEY     # Gemini image gen
"""

import os
import sys
import json
import argparse
import subprocess
import time
import base64
from datetime import datetime, timezone
from pathlib import Path

# ──────────────────────────────────────────────
# Asset catalog — prompts from the Integration Pack
# ──────────────────────────────────────────────

ASSET_CATALOG = {
    "player": {
        "category": "Player Ship",
        "prompt": "Retro-cyberpunk fighter jet, 2D side-view sprite, 16-bit pixel art style, sleek aerodynamic frame with neon blue and purple glow accents, visible exhaust ports, high contrast.",
        "width": 256,
        "height": 128,
        "frames": 2,
        "output_prefix": "player",
    },
    "enemy_scout": {
        "category": "Enemy Fleet",
        "prompt": "Cybernetic robotic fish with metallic scales, 2D side-view sprite, 16-bit pixel art, glowing cyan eye, orange metallic body, transparent background.",
        "width": 64,
        "height": 64,
        "frames": 1,
        "output_prefix": "scout",
    },
    "enemy_interceptor": {
        "category": "Enemy Fleet",
        "prompt": "Cybernetic arrowhead ship, 2D side-view sprite, 16-bit pixel art, pink-red metallic body, red thruster flame trailing behind, transparent background.",
        "width": 64,
        "height": 64,
        "frames": 1,
        "output_prefix": "interceptor",
    },
    "enemy_heavy": {
        "category": "Enemy Fleet",
        "prompt": "Cybernetic trilobite/crab heavy armor ship, 2D side-view sprite, 16-bit pixel art, purple metallic shell with white plating lines, red cannon glow, transparent background.",
        "width": 64,
        "height": 64,
        "frames": 1,
        "output_prefix": "heavy",
    },
    "enemy_boss_minion": {
        "category": "Enemy Fleet",
        "prompt": "Cybernetic round green metallic scale minion, 2D side-view sprite, 16-bit pixel art, sharp dorsal fin, small fast-moving enemy, transparent background.",
        "width": 32,
        "height": 32,
        "frames": 1,
        "output_prefix": "boss_minion",
    },
    "boss_coelacanth": {
        "category": "Colossal Boss",
        "prompt": "'Cyber Coelacanth' dreadnought ship, massive armored prehistoric fish silhouette, biomechanical plating, glowing red optic sensors, side-view boss sprite, intricate engine details, neon pink fins.",
        "width": 360,
        "height": 280,
        "frames": 1,
        "output_prefix": "boss",
    },
    "vfx_laser": {
        "category": "Sprites & Effects",
        "prompt": "2D retro plasma laser beam, 16-bit pixel art, bright cyan/blue energy beam, horizontal orientation, pixel-perfect edges, transparent background.",
        "width": 64,
        "height": 16,
        "frames": 1,
        "output_prefix": "laser",
    },
    "vfx_explosion": {
        "category": "Sprites & Effects",
        "prompt": "2D retro explosion sprite sheet, multi-frame circular shockwave, orange/yellow/white fire, 16-bit pixel art, transparent background, 4 frames arranged horizontally.",
        "width": 128,
        "height": 32,
        "frames": 4,
        "output_prefix": "explosion",
    },
    "vfx_shield": {
        "category": "Sprites & Effects",
        "prompt": "2D translucent blue energy shield forcefield ring, 16-bit pixel art, circular glowing barrier, semi-transparent cyan/blue, transparent background.",
        "width": 64,
        "height": 64,
        "frames": 1,
        "output_prefix": "shield",
    },
    "powerup_weapon": {
        "category": "Sprites & Effects",
        "prompt": "2D retro metallic orb power-up, red glowing sphere with 'W' letter indicator, 16-bit pixel art, bright red neon glow, transparent background.",
        "width": 32,
        "height": 32,
        "frames": 1,
        "output_prefix": "powerup_w",
    },
    "powerup_shield": {
        "category": "Sprites & Effects",
        "prompt": "2D retro metallic orb power-up, green glowing sphere with 'S' letter indicator, 16-bit pixel art, bright green neon glow, transparent background.",
        "width": 32,
        "height": 32,
        "frames": 1,
        "output_prefix": "powerup_s",
    },
    "bg_nebula": {
        "category": "Parallax Levels",
        "prompt": "Deep-space nebula background, layered seamless scrolling, neon gas clouds in purple/blue/cyan, distant stars, 16-bit retro pixel art style, tileable horizontally.",
        "width": 800,
        "height": 450,
        "frames": 1,
        "output_prefix": "bg_nebula",
    },
    "bg_city": {
        "category": "Parallax Levels",
        "prompt": "Cyberpunk biomechanical city background, towering silhouettes with flickering neon lights, dark atmosphere, 16-bit retro pixel art style, tileable horizontally.",
        "width": 800,
        "height": 450,
        "frames": 1,
        "output_prefix": "bg_city",
    },
    "title_card": {
        "category": "Title & Credits",
        "prompt": "16-bit arcade title card, 'Darius Star: Cyber Coelacanth' in stylized glowing futuristic font, dark space background, vibrant neon color palette, retro-gaming aesthetic.",
        "width": 800,
        "height": 450,
        "frames": 1,
        "output_prefix": "title",
    },
}

REPO_ROOT = Path(__file__).parent
SPRITES_DIR = REPO_ROOT / "assets" / "sprites"


# ──────────────────────────────────────────────
# Provider: Mock (generates colored placeholder sprites)
# ──────────────────────────────────────────────

def generate_mock(asset_id: str, config: dict):
    """Generate a mock sprite using Pillow — colored placeholder."""
    from PIL import Image, ImageDraw

    w, h = config["width"], config["height"]
    prefix = config["output_prefix"]
    frames = config.get("frames", 1)
    colors = [
        (0, 255, 255, 255),   # cyan
        (255, 85, 0, 255),    # orange
        (255, 0, 85, 255),    # pink
        (154, 51, 204, 255),  # purple
        (0, 255, 85, 255),    # green
        (255, 255, 0, 255),   # yellow
        (255, 0, 0, 255),     # red
        (0, 170, 255, 255),   # blue
    ]

    for i in range(frames):
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        color = colors[i % len(colors)]

        # Draw a simple shape
        if frames > 1:
            # Multi-frame: vary the shape slightly
            offset = i * 4
            draw.ellipse([2 + offset, 2, w - 2 - offset, h - 2], fill=color, outline=(255, 255, 255, 200))
        else:
            draw.rounded_rectangle([4, 4, w - 5, h - 5], radius=min(w, h) // 6, fill=color, outline=(255, 255, 255, 200))

        # Add label
        from PIL import ImageFont
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size=min(w, h) // 5)
        except Exception:
            font = ImageFont.load_default()

        label = prefix[:8]
        bbox = draw.textbbox((0, 0), label, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text(((w - tw) // 2, (h - th) // 2), label, fill=(255, 255, 255, 255), font=font)

        filename = f"{prefix}_{i}.png"
        filepath = SPRITES_DIR / filename
        SPRITES_DIR.mkdir(parents=True, exist_ok=True)
        img.save(str(filepath), "PNG")
        print(f"  ✓ {filename} ({w}x{h})")

    return True


# ──────────────────────────────────────────────
# Provider: Leonardo.ai API
# ──────────────────────────────────────────────

def generate_leonardo(asset_id: str, config: dict, api_key: str):
    """Generate sprite via Leonardo.ai API."""
    import urllib.request

    url = "https://cloud.leonardo.ai/api/rest/v1/generations"
    payload = json.dumps({
        "prompt": config["prompt"],
        "width": config["width"],
        "height": config["height"],
        "num_images": config.get("frames", 1),
        "alchemy": True,
        "presetStyle": "PIXEL_ART",
        "transparency": "foreground_only",
    }).encode()

    req = urllib.request.Request(url, data=payload, headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    })

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read())
    except Exception as e:
        print(f"  ✗ Leonardo API error: {e}")
        return False

    generation_id = result.get("sdGenerationJob", {}).get("generationId")
    if not generation_id:
        print(f"  ✗ No generation ID returned")
        return False

    print(f"  → Generation started: {generation_id}")

    # Poll for completion
    for attempt in range(30):
        time.sleep(6)
        status_url = f"https://cloud.leonardo.ai/api/rest/v1/generations/{generation_id}"
        req = urllib.request.Request(status_url, headers={"Authorization": f"Bearer {api_key}"})
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                status = json.loads(resp.read())
        except Exception:
            continue

        gen_status = status.get("generations_by_pk", {}).get("status", "")
        if gen_status == "COMPLETE":
            images = status.get("generations_by_pk", {}).get("generated_images", [])
            prefix = config["output_prefix"]
            for i, img_data in enumerate(images):
                img_url = img_data.get("url")
                if img_url:
                    filename = f"{prefix}_{i}.png"
                    filepath = SPRITES_DIR / filename
                    urllib.request.urlretrieve(img_url, str(filepath))
                    print(f"  ✓ {filename}")
            return True
        elif gen_status == "FAILED":
            print(f"  ✗ Generation failed")
            return False
        else:
            print(f"  … {gen_status} (attempt {attempt + 1}/30)")

    print(f"  ✗ Timed out waiting for generation")
    return False


# ──────────────────────────────────────────────
# Provider: Gemini Image Generation
# ──────────────────────────────────────────────

def generate_gemini(asset_id: str, config: dict, api_key: str):
    """Generate sprite via Gemini API image generation."""
    import urllib.request

    # Gemini 2.5 Flash with image generation support
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key={api_key}"

    payload = json.dumps({
        "contents": [{
            "parts": [{
                "text": f"Generate a game sprite: {config['prompt']}. Output as a transparent PNG, {config['width']}x{config['height']} pixels, 16-bit pixel art style."
            }]
        }],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"]
        }
    }).encode()

    try:
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read())
    except Exception as e:
        print(f"  ✗ Gemini API error: {e}")
        return False

    # Extract images from response
    candidates = result.get("candidates", [])
    prefix = config["output_prefix"]
    saved = 0

    for candidate in candidates:
        for part in candidate.get("content", {}).get("parts", []):
            if "inlineData" in part:
                mime_type = part["inlineData"].get("mimeType", "image/png")
                data = part["inlineData"].get("data", "")
                if data:
                    filename = f"{prefix}_{saved}.png"
                    filepath = SPRITES_DIR / filename
                    with open(filepath, "wb") as f:
                        f.write(base64.b64decode(data))
                    print(f"  ✓ {filename}")
                    saved += 1

    return saved > 0


# ──────────────────────────────────────────────
# Provider: Imagen 3 (Vertex AI)
# ──────────────────────────────────────────────

def generate_imagen(asset_id: str, config: dict, api_key: str):
    """Generate sprite via Vertex AI Imagen 3 API.
    
    Requires: GCP project with Vertex AI enabled.
    API key is actually a service account JSON or access token.
    """
    import urllib.request

    # This uses the Vertex AI REST API
    # Format: POST https://{region}-aiplatform.googleapis.com/v1/projects/{project}/locations/{region}/publishers/google/models/imagen-3.0-generate-001:predict
    # For now, provide a clear message about setup requirements
    print(f"  ⚠ Imagen 3 requires GCP project setup:")
    print(f"    1. Enable Vertex AI API in GCP console")
    print(f"    2. Create service account with Vertex AI User role")
    print(f"    3. Set up billing")
    print(f"    4. Use the gcloud auth flow")
    print(f"  → Falling back to mock for: {asset_id}")
    return generate_mock(asset_id, config)


# ──────────────────────────────────────────────
# Main orchestrator
# ──────────────────────────────────────────────

PROVIDERS = {
    "mock": generate_mock,
    "leonardo": generate_leonardo,
    "imagen": generate_imagen,
    "gemini": generate_gemini,
}


def main():
    parser = argparse.ArgumentParser(description="Darius Star — Automated Asset Generator")
    parser.add_argument("--provider", choices=PROVIDERS.keys(), default="mock",
                        help="Image generation provider (default: mock)")
    parser.add_argument("--key", default=None, help="API key for the provider")
    parser.add_argument("--assets", nargs="*", default=None,
                        help="Specific asset IDs to generate (default: all)")
    parser.add_argument("--category", default=None,
                        help="Only generate assets from this category")
    args = parser.parse_args()

    provider_fn = PROVIDERS[args.provider]
    api_key = args.key

    if args.provider != "mock" and not api_key:
        print(f"Error: --key required for provider '{args.provider}'")
        print(f"  Get a key at:")
        if args.provider == "leonardo":
            print(f"    https://app.leonardo.ai → Settings → API Keys")
        elif args.provider == "gemini":
            print(f"    https://aistudio.google.com/apikey")
        elif args.provider == "imagen":
            print(f"    https://console.cloud.google.com/vertex-ai")
        sys.exit(1)

    # Filter assets
    if args.assets:
        assets_to_gen = {k: ASSET_CATALOG[k] for k in args.assets if k in ASSET_CATALOG}
    elif args.category:
        assets_to_gen = {k: v for k, v in ASSET_CATALOG.items() if v["category"] == args.category}
    else:
        assets_to_gen = ASSET_CATALOG

    print(f"\n{'='*60}")
    print(f"  Darius Star — Asset Generator")
    print(f"  Provider: {args.provider}")
    print(f"  Assets: {len(assets_to_gen)}")
    print(f"  Output: {SPRITES_DIR}")
    print(f"{'='*60}\n")

    # Ensure sprites directory
    SPRITES_DIR.mkdir(parents=True, exist_ok=True)

    generated = []
    failed = []

    for asset_id, config in assets_to_gen.items():
        print(f"[{config['category']}] {asset_id}")
        try:
            if provider_fn(asset_id, config, api_key) if args.provider != "mock" else provider_fn(asset_id, config):
                generated.append(asset_id)
            else:
                failed.append(asset_id)
        except Exception as e:
            print(f"  ✗ Error: {e}")
            failed.append(asset_id)

    # Run manifest generator
    print(f"\n{'='*60}")
    print(f"  Running sprite manifest generator...")
    manifest_script = REPO_ROOT / "generate_sprites_manifest.py"
    if manifest_script.exists():
        result = subprocess.run(["python3", str(manifest_script)], capture_output=True, text=True)
        print(result.stdout)
    else:
        print(f"  ⚠ Manifest generator not found at {manifest_script}")

    # Summary
    print(f"\n{'='*60}")
    print(f"  Results: {len(generated)} generated, {len(failed)} failed")
    if generated:
        print(f"  ✓ {', '.join(generated)}")
    if failed:
        print(f"  ✗ {', '.join(failed)}")
    print(f"{'='*60}\n")

    # Save generation log
    log = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "provider": args.provider,
        "generated": generated,
        "failed": failed,
        "total": len(assets_to_gen),
    }
    log_path = REPO_ROOT / "assets" / "generation_log.json"
    with open(log_path, "w") as f:
        json.dump(log, f, indent=2)
    print(f"Generation log saved to: {log_path}")

    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
