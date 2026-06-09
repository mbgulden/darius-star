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
    "player_phantom": {
        "category": "Player Ship",
        "prompt": "Sleek black stealth fighter, 2D side-view ship sprite facing right, 16-bit pixel art, needle-like minimal profile, purple thruster flame, dark hull with subtle purple glow accents, transparent background.",
        "width": 256, "height": 128, "frames": 2,
        "prefix": "player_phantom", "output_prefix": "player_phantom", "aspect_ratio": "1:1",
    },
    "player_bastion": {
        "category": "Player Ship",
        "prompt": "Heavy armored gunship, 2D side-view ship sprite facing right, 16-bit pixel art, dark grey hull with red accent stripes, wide broad hull, visible shield plate layers, dual cannon mounts, transparent background.",
        "width": 256, "height": 128, "frames": 2,
        "prefix": "player_bastion", "output_prefix": "player_bastion", "aspect_ratio": "1:1",
    },
    "player_tempest": {
        "category": "Player Ship",
        "prompt": "Aggressive red and orange fighter, 2D side-view ship sprite facing right, 16-bit pixel art, multiple visible weapon barrels, glowing orange heat vents along wings, hot-rod racing stripe, transparent background.",
        "width": 256, "height": 128, "frames": 2,
        "prefix": "player_tempest", "output_prefix": "player_tempest", "aspect_ratio": "1:1",
    },
    "player_specter": {
        "category": "Player Ship",
        "prompt": "Translucent ghost-like starfighter, 2D side-view ship sprite facing right, 16-bit pixel art, cyan and white phase-shift glow, semi-transparent hull with angular geometry, phased-matter shimmer effect, transparent background.",
        "width": 256, "height": 128, "frames": 2,
        "prefix": "player_specter", "output_prefix": "player_specter", "aspect_ratio": "1:1",
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
    # ═══════════════════════════════════════════════
    # Enemy Sprites — All 10 Biomes
    # ═══════════════════════════════════════════════
    "enemy_biome1_crawler": {
        "category": "Enemy Fleet",
        "prompt": "Heavy crustacean tank chassis, jagged black basalt armor plating, bright orange-glowing hydraulic limbs, warning steam vents pulsing on upper shell, 16-bit pixel art, side-view game sprite, retro Sega Genesis shmup style, transparent background.",
        "width": 64, "height": 64, "frames": 1,
        "prefix": "enemy_b1_crawler", "output_prefix": "enemy_b1_crawler", "aspect_ratio": "1:1",
    },
    "enemy_biome2_wraith": {
        "category": "Enemy Fleet",
        "prompt": "Skeletal bleached white coral structure with chrome servo joints, neon-pink fiber-optic wisps trailing from spinal ports, 16-bit pixel art, side-view game sprite, retro Sega Genesis shmup style, transparent background.",
        "width": 64, "height": 64, "frames": 1,
        "prefix": "enemy_b2_wraith", "output_prefix": "enemy_b2_wraith", "aspect_ratio": "1:1",
    },
    "enemy_biome3_spider": {
        "category": "Enemy Fleet",
        "prompt": "Compact hexagonal chrome chassis with 8 needle-like mechanical limbs, single blinking red optical sensor throwing electric sparks, 16-bit pixel art, side-view game sprite, retro Sega Genesis shmup style, transparent background.",
        "width": 32, "height": 32, "frames": 1,
        "prefix": "enemy_b3_spider", "output_prefix": "enemy_b3_spider", "aspect_ratio": "1:1",
    },
    "enemy_biome4_wisp": {
        "category": "Enemy Fleet",
        "prompt": "Swirling orb of concentrated purple and cyan plasma with trailing gaseous filaments, white-hot central core with soft magenta aura, 16-bit pixel art, side-view game sprite, retro Sega Genesis shmup style, transparent background.",
        "width": 32, "height": 32, "frames": 1,
        "prefix": "enemy_b4_wisp", "output_prefix": "enemy_b4_wisp", "aspect_ratio": "1:1",
    },
    "enemy_biome4_rider": {
        "category": "Enemy Fleet",
        "prompt": "Sleek forward-swept wing jet, chrome-magenta finish, crackling blue electrical arcs across wings, persistent neon jet trail, 16-bit pixel art, side-view game sprite, retro Sega Genesis shmup style, transparent background.",
        "width": 64, "height": 64, "frames": 1,
        "prefix": "enemy_b4_rider", "output_prefix": "enemy_b4_rider", "aspect_ratio": "1:1",
    },
    "enemy_biome4_serpent": {
        "category": "Enemy Fleet",
        "prompt": "Massive segmented dragon-like mech, heavy dark-purple hull plates with glowing pink joints, dual head-mounted optical sensors, 16-bit pixel art, side-view game sprite, retro Sega Genesis shmup style, transparent background.",
        "width": 128, "height": 64, "frames": 1,
        "prefix": "enemy_b4_serpent", "output_prefix": "enemy_b4_serpent", "aspect_ratio": "2:1",
    },
    # ═══════════════════════════════════════════════
    # UNIQUE UNITS — One surprise enemy per biome
    # ═══════════════════════════════════════════════
    "unique_b1_angler": {
        "category": "Unique Units",
        "prompt": "Giant cybernetic anglerfish with dangling bioluminescent lure, massive hinged jaw with serrated metal teeth, dark armored body with faint blue glow patterns, 16-bit pixel art, side-view game sprite, retro Sega Genesis shmup style, transparent background, menacing deep-sea predator.",
        "width": 96, "height": 96, "frames": 1,
        "prefix": "unique_b1_angler", "output_prefix": "unique_b1_angler", "aspect_ratio": "1:1",
    },
    "unique_b2_siren": {
        "category": "Unique Units",
        "prompt": "Ghostly holographic siren entity emerging from shattered coral, translucent cyan and pink form, trailing data-stream hair, sings distortion waves that ripple visually, 16-bit pixel art, side-view game sprite, retro Sega Genesis shmup style, transparent background, ethereal and haunting.",
        "width": 64, "height": 96, "frames": 1,
        "prefix": "unique_b2_siren", "output_prefix": "unique_b2_siren", "aspect_ratio": "1:1",
    },
    "unique_b3_parasite": {
        "category": "Unique Units",
        "prompt": "Biomechanical parasite that latches onto the screen border, tentacled flesh-metal hybrid with glowing red feeding tubes, pulsating sack body, 16-bit pixel art, side-view game sprite, retro Sega Genesis shmup style, transparent background, body-horror design.",
        "width": 96, "height": 64, "frames": 1,
        "prefix": "unique_b3_parasite", "output_prefix": "unique_b3_parasite", "aspect_ratio": "1:1",
    },
    "unique_b4_mirror": {
        "category": "Unique Units",
        "prompt": "Crystalline mirror entity that reflects the player's own ship silhouette, faceted chrome surface with rainbow refraction edges, constantly shifting geometric shape, 16-bit pixel art, side-view game sprite, retro Sega Genesis shmup style, transparent background, unsettling doppelganger.",
        "width": 64, "height": 64, "frames": 1,
        "prefix": "unique_b4_mirror", "output_prefix": "unique_b4_mirror", "aspect_ratio": "1:1",
    },
    "unique_b5_shatterer": {
        "category": "Unique Units",
        "prompt": "Frozen crystalline golem that shatters and reforms, angular ice shards held together by magnetic energy, glowing blue-white core visible through translucent body, 16-bit pixel art, side-view game sprite, retro Sega Genesis shmup style, transparent background, fragile but deadly.",
        "width": 80, "height": 80, "frames": 1,
        "prefix": "unique_b5_shatterer", "output_prefix": "unique_b5_shatterer", "aspect_ratio": "1:1",
    },
    "unique_b6_phoenix": {
        "category": "Unique Units",
        "prompt": "Mechanical phoenix made of flame-resistant alloys, wings spread wide trailing molten metal droplets, body glows from internal furnace visible through heat vents, 16-bit pixel art, side-view game sprite, retro Sega Genesis shmup style, transparent background, rebirth from ashes theme.",
        "width": 96, "height": 80, "frames": 1,
        "prefix": "unique_b6_phoenix", "output_prefix": "unique_b6_phoenix", "aspect_ratio": "1:1",
    },
    "unique_b7_conductor": {
        "category": "Unique Units",
        "prompt": "Floating Tesla coil orb surrounded by arcing electricity, copper-wound rings spinning independently, captive lightning stored in glass capacitors, 16-bit pixel art, side-view game sprite, retro Sega Genesis shmup style, transparent background, electrical hazard.",
        "width": 64, "height": 64, "frames": 1,
        "prefix": "unique_b7_conductor", "output_prefix": "unique_b7_conductor", "aspect_ratio": "1:1",
    },
    "unique_b8_salvager": {
        "category": "Unique Units",
        "prompt": "Scrap-collecting scavenger drone made of salvaged ship parts, asymmetrical design with mismatched armor plates, tractor beam emitter and cutting torch arms, 16-bit pixel art, side-view game sprite, retro Sega Genesis shmup style, transparent background, junkyard aesthetic.",
        "width": 72, "height": 56, "frames": 1,
        "prefix": "unique_b8_salvager", "output_prefix": "unique_b8_salvager", "aspect_ratio": "1:1",
    },
    "unique_b9_broodmother": {
        "category": "Unique Units",
        "prompt": "Grotesque alien broodmother swollen with egg sacs, chitinous armored carapace, multiple insectoid legs, constantly spawning smaller creatures from abdominal pores, 16-bit pixel art, side-view game sprite, retro Sega Genesis shmup style, transparent background, body horror.",
        "width": 128, "height": 96, "frames": 1,
        "prefix": "unique_b9_broodmother", "output_prefix": "unique_b9_broodmother", "aspect_ratio": "1:1",
    },
    "unique_b10_paradox": {
        "category": "Unique Units",
        "prompt": "Reality-warping entity that exists in multiple positions simultaneously, fragmented across 3 ghostly after-images, impossible geometry body with M.C. Escher angles, 16-bit pixel art, side-view game sprite, retro Sega Genesis shmup style, transparent background, mind-bending.",
        "width": 64, "height": 64, "frames": 1,
        "prefix": "unique_b10_paradox", "output_prefix": "unique_b10_paradox", "aspect_ratio": "1:1",
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
