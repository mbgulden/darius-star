#!/usr/bin/env python3
"""
GRO-912: Generate background sprites and enemy designs for biomes 4-10.
Creates mock/placeholder assets that can be later replaced with Veo/Imagen generations.

Deliverables:
- Parallax background frames (10 frames per biome, 1280x720)
- Enemy sprites (scout, interceptor, heavy, special per biome)
- Sub-boss and biome boss sprites  
- Ambient audio placeholders
- Updated sprites.json manifest
- ASSET_CATALOG.json and VEO_ASSET_CATALOG.json
"""

import os
import json
import struct
import wave
import math
from datetime import datetime, timezone
from PIL import Image, ImageDraw, ImageFilter

BASE_DIR = "/home/ubuntu/work/darius-star"
SPRITES_DIR = os.path.join(BASE_DIR, "assets", "sprites")
BOSSES_DIR = os.path.join(SPRITES_DIR, "bosses")
AUDIO_DIR = os.path.join(BASE_DIR, "assets", "audio")
AMBIENT_DIR = os.path.join(AUDIO_DIR, "ambient")

os.makedirs(SPRITES_DIR, exist_ok=True)
os.makedirs(BOSSES_DIR, exist_ok=True)
os.makedirs(AMBIENT_DIR, exist_ok=True)

# ═══════════════════════════════════════════════════════════════
# BIOME DEFINITIONS (from level-system-design.md + biome-boss-design.md)
# ═══════════════════════════════════════════════════════════════

BIOMES = [
    {
        "id": 4,
        "name": "nebula_drift",
        "display": "Nebula Drift",
        "colors": {
            "primary": (0, 191, 255),     # Nebula cyan #00BFFF
            "secondary": (255, 0, 255),    # Plasma magenta #FF00FF
            "tertiary": (5, 5, 16),        # Void black #050510
            "accent": (100, 200, 255),
        },
        "enemies": {
            "scout": {"name": "plasma_wisp", "prefix": "enemy_plasma_wisp", "hp": 1, "points": 125, "color": (0, 220, 255), "size": (32, 32)},
            "interceptor": {"name": "storm_sprite", "prefix": "enemy_storm_sprite", "hp": 2, "points": 200, "color": (255, 0, 255), "size": (32, 32)},
            "heavy": {"name": "gas_giant", "prefix": "enemy_gas_giant", "hp": 6, "points": 400, "color": (0, 150, 255), "size": (64, 64)},
            "special": {"name": "nebula_wraith", "prefix": "enemy_nebula_wraith", "hp": 3, "points": 250, "color": (180, 100, 255), "size": (48, 48)},
        },
        "mid_boss": {"name": "storm_cell_core", "prefix": "midboss_b4", "hp": 120, "points": 3500, "color": (0, 200, 255), "size": (128, 128)},
        "biome_boss": {"name": "nebula_serpent", "prefix": "boss_biome_4", "hp": 180, "points": 7000, "color": (0, 180, 255), "size": (256, 256)},
        "ambient": "nebula_drift_ambient",
        "bg_colors": [(5, 5, 20), (10, 10, 40), (0, 50, 100), (50, 0, 80), (0, 100, 180)],
        "star_density": 0.003,
        "nebula_blobs": 8,
    },
    {
        "id": 5,
        "name": "ice_rings",
        "display": "Ice Rings",
        "colors": {
            "primary": (100, 200, 255),    # Ice blue #64C8FF
            "secondary": (200, 230, 255),   # Frost white #C8E6FF
            "tertiary": (20, 40, 80),       # Deep ice #142850
            "accent": (150, 220, 255),
        },
        "enemies": {
            "scout": {"name": "ice_shard", "prefix": "enemy_ice_shard", "hp": 1, "points": 125, "color": (150, 220, 255), "size": (24, 24)},
            "interceptor": {"name": "frost_drone", "prefix": "enemy_frost_drone", "hp": 2, "points": 200, "color": (100, 180, 255), "size": (32, 32)},
            "heavy": {"name": "glacier", "prefix": "enemy_glacier", "hp": 7, "points": 450, "color": (80, 160, 240), "size": (64, 64)},
            "special": {"name": "ice_drone_swarm", "prefix": "enemy_ice_swarm", "hp": 1, "points": 75, "color": (180, 220, 255), "size": (16, 16)},
        },
        "mid_boss": {"name": "crystal_golem", "prefix": "midboss_b5", "hp": 140, "points": 4000, "color": (100, 200, 255), "size": (128, 128)},
        "biome_boss": {"name": "frost_wyrm", "prefix": "boss_biome_5", "hp": 200, "points": 8000, "color": (80, 180, 255), "size": (256, 256)},
        "ambient": "ice_rings_ambient",
        "bg_colors": [(10, 20, 40), (20, 40, 80), (40, 80, 120), (60, 120, 180), (80, 160, 220)],
        "star_density": 0.004,
        "nebula_blobs": 3,
    },
    {
        "id": 6,
        "name": "inferno_core",
        "display": "Inferno Core",
        "colors": {
            "primary": (255, 68, 0),       # Lava orange #FF4400
            "secondary": (255, 170, 0),     # Ember yellow #FFAA00
            "tertiary": (68, 51, 51),       # Ash gray #443333
            "accent": (255, 100, 0),
        },
        "enemies": {
            "scout": {"name": "ember_sprite", "prefix": "enemy_ember_sprite", "hp": 1, "points": 150, "color": (255, 150, 0), "size": (32, 32)},
            "interceptor": {"name": "magma_wasp", "prefix": "enemy_magma_wasp", "hp": 2, "points": 225, "color": (255, 100, 0), "size": (32, 32)},
            "heavy": {"name": "lava_golem", "prefix": "enemy_lava_golem", "hp": 8, "points": 500, "color": (255, 50, 0), "size": (64, 64)},
            "special": {"name": "inferno_node", "prefix": "enemy_inferno_node", "hp": 5, "points": 350, "color": (255, 80, 0), "size": (48, 48)},
        },
        "mid_boss": {"name": "caldera_wyrm", "prefix": "midboss_b6", "hp": 160, "points": 4500, "color": (255, 100, 0), "size": (128, 128)},
        "biome_boss": {"name": "inferno_titan", "prefix": "boss_biome_6", "hp": 220, "points": 9000, "color": (255, 40, 0), "size": (256, 256)},
        "ambient": "inferno_core_ambient",
        "bg_colors": [(40, 10, 5), (60, 20, 5), (80, 30, 10), (120, 40, 10), (200, 60, 10)],
        "star_density": 0.001,
        "nebula_blobs": 12,
    },
    {
        "id": 7,
        "name": "storm_belt",
        "display": "Storm Belt",
        "colors": {
            "primary": (255, 255, 255),     # Lightning white
            "secondary": (68, 102, 255),    # Static blue #4466FF
            "tertiary": (51, 51, 68),       # Storm gray #333344
            "accent": (100, 130, 255),
        },
        "enemies": {
            "scout": {"name": "static_spark", "prefix": "enemy_static_spark", "hp": 1, "points": 150, "color": (150, 180, 255), "size": (32, 32)},
            "interceptor": {"name": "storm_hawk", "prefix": "enemy_storm_hawk", "hp": 3, "points": 250, "color": (100, 130, 255), "size": (32, 32)},
            "heavy": {"name": "thunderhead", "prefix": "enemy_thunderhead", "hp": 8, "points": 500, "color": (80, 100, 255), "size": (64, 64)},
            "special": {"name": "storm_sentinel", "prefix": "enemy_storm_sentinel", "hp": 5, "points": 350, "color": (70, 70, 255), "size": (48, 48)},
        },
        "mid_boss": {"name": "eye_of_the_storm", "prefix": "midboss_b7", "hp": 180, "points": 5000, "color": (150, 150, 255), "size": (128, 128)},
        "biome_boss": {"name": "tempest_overlord", "prefix": "boss_biome_7", "hp": 360, "points": 11000, "color": (100, 100, 255), "size": (256, 256)},
        "ambient": "storm_belt_ambient",
        "bg_colors": [(30, 30, 50), (35, 35, 55), (40, 40, 60), (50, 50, 80), (60, 60, 100)],
        "star_density": 0.002,
        "nebula_blobs": 4,
    },
    {
        "id": 8,
        "name": "derelict_fleet",
        "display": "Derelict Fleet",
        "colors": {
            "primary": (85, 85, 102),      # Hull gray #555566
            "secondary": (255, 34, 34),     # Emergency red #FF2222
            "tertiary": (136, 102, 68),     # Rust brown #886644
            "accent": (200, 50, 50),
        },
        "enemies": {
            "scout": {"name": "salvage_drone", "prefix": "enemy_salvage_drone", "hp": 1, "points": 150, "color": (150, 150, 150), "size": (32, 32)},
            "interceptor": {"name": "ghost_fighter", "prefix": "enemy_ghost_fighter", "hp": 3, "points": 250, "color": (100, 100, 120), "size": (32, 32)},
            "heavy": {"name": "turret_battery", "prefix": "enemy_turret_battery", "hp": 10, "points": 600, "color": (80, 80, 90), "size": (64, 64)},
            "special": {"name": "fleet_turret", "prefix": "enemy_fleet_turret", "hp": 4, "points": 300, "color": (120, 40, 40), "size": (48, 48)},
        },
        "mid_boss": {"name": "reactor_core_guardian", "prefix": "midboss_b8", "hp": 200, "points": 5500, "color": (255, 50, 50), "size": (128, 128)},
        "biome_boss": {"name": "warship_hulk", "prefix": "boss_biome_8", "hp": 400, "points": 12000, "color": (200, 30, 30), "size": (256, 256)},
        "ambient": "derelict_fleet_ambient",
        "bg_colors": [(20, 20, 25), (30, 30, 35), (50, 50, 55), (40, 30, 20), (60, 40, 15)],
        "star_density": 0.005,
        "nebula_blobs": 2,
    },
    {
        "id": 9,
        "name": "xenomorph_hive",
        "display": "Xenomorph Hive",
        "colors": {
            "primary": (204, 102, 119),     # Flesh pink #CC6677
            "secondary": (51, 255, 51),      # Acid green #33FF33
            "tertiary": (102, 51, 170),      # Organic purple #6633AA
            "accent": (80, 255, 80),
        },
        "enemies": {
            "scout": {"name": "crawler", "prefix": "enemy_crawler", "hp": 2, "points": 175, "color": (200, 100, 150), "size": (32, 32)},
            "interceptor": {"name": "spitter", "prefix": "enemy_spitter", "hp": 3, "points": 275, "color": (80, 200, 80), "size": (32, 32)},
            "heavy": {"name": "brute", "prefix": "enemy_brute", "hp": 10, "points": 600, "color": (150, 50, 180), "size": (64, 64)},
            "special": {"name": "hive_node", "prefix": "enemy_hive_node", "hp": 8, "points": 400, "color": (100, 255, 100), "size": (48, 48)},
        },
        "mid_boss": {"name": "brood_mother", "prefix": "midboss_b9", "hp": 220, "points": 6000, "color": (200, 50, 150), "size": (128, 128)},
        "biome_boss": {"name": "hive_queen", "prefix": "boss_biome_9", "hp": 440, "points": 14000, "color": (180, 50, 200), "size": (256, 256)},
        "ambient": "xenomorph_hive_ambient",
        "bg_colors": [(40, 10, 30), (50, 15, 40), (60, 30, 50), (80, 20, 60), (30, 40, 20)],
        "star_density": 0.001,
        "nebula_blobs": 6,
    },
    {
        "id": 10,
        "name": "core_rift",
        "display": "Core Rift",
        "colors": {
            "primary": (0, 0, 0),           # Void black
            "secondary": (255, 255, 255),   # Rift white
            "tertiary": (255, 0, 136),      # Reality-bleed magenta #FF0088
            "accent": (0, 255, 65),         # Code green #00FF41
        },
        "enemies": {
            "scout": {"name": "glitch_fragment", "prefix": "enemy_glitch_fragment", "hp": 2, "points": 200, "color": (0, 255, 100), "size": (32, 32)},
            "interceptor": {"name": "paradox_wisp", "prefix": "enemy_paradox_wisp", "hp": 3, "points": 300, "color": (255, 0, 150), "size": (32, 32)},
            "heavy": {"name": "null_entity", "prefix": "enemy_null_entity", "hp": 12, "points": 700, "color": (100, 0, 100), "size": (64, 64)},
            "special": {"name": "rift_aberration", "prefix": "enemy_rift_aberration", "hp": 6, "points": 450, "color": (200, 0, 200), "size": (48, 48)},
        },
        "mid_boss": {"name": "reality_anchor", "prefix": "midboss_b10", "hp": 240, "points": 7000, "color": (255, 0, 200), "size": (128, 128)},
        "biome_boss": {"name": "reality_warp", "prefix": "boss_biome_10", "hp": 480, "points": 25000, "color": (255, 0, 255), "size": (256, 256)},
        "ambient": "core_rift_ambient",
        "bg_colors": [(0, 0, 5), (5, 0, 10), (10, 0, 20), (5, 0, 15), (0, 0, 0)],
        "star_density": 0.008,
        "nebula_blobs": 0,
    },
]

# ═══════════════════════════════════════════════════════════════
# HELPER: Create mock sprite image
# ═══════════════════════════════════════════════════════════════

def create_sprite(path, width, height, color, shape="ellipse", alpha=255):
    """Create a mock sprite PNG."""
    r, g, b = color[:3]
    if len(color) > 3:
        alpha = color[3]
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    pad = 2
    
    if shape == "ellipse":
        draw.ellipse([pad, pad, width - pad - 1, height - pad - 1],
                     fill=(r, g, b, alpha), outline=(255, 255, 255, 80))
    elif shape == "rect":
        draw.rectangle([pad, pad, width - pad - 1, height - pad - 1],
                       fill=(r, g, b, alpha), outline=(255, 255, 255, 80))
    elif shape == "diamond":
        cx, cy = width // 2, height // 2
        pts = [(cx, pad), (width - pad - 1, cy), (cx, height - pad - 1), (pad, cy)]
        draw.polygon(pts, fill=(r, g, b, alpha), outline=(255, 255, 255, 80))
    elif shape == "triangle":
        pts = [(width // 2, pad), (width - pad - 1, height - pad - 1), (pad, height - pad - 1)]
        draw.polygon(pts, fill=(r, g, b, alpha), outline=(255, 255, 255, 80))
    elif shape == "boss":
        # Complex boss shape - layered
        draw.ellipse([width//4, height//4, 3*width//4, 3*height//4],
                     fill=(r, g, b, alpha), outline=(255, 255, 255, 100))
        draw.ellipse([width//3, height//3, 2*width//3, 2*height//3],
                     fill=(min(r+60, 255), min(g+60, 255), min(b+60, 255), 200))
        # Eyes
        draw.ellipse([width//3, height//3 - 5, width//3 + 15, height//3 + 10], fill=(255, 0, 0, 255))
        draw.ellipse([2*width//3 - 15, height//3 - 5, 2*width//3, height//3 + 10], fill=(255, 0, 0, 255))
    
    img.save(path, "PNG")
    return True


def create_background_frame(path, width, height, colors, frame_idx, total_frames, biome_cfg):
    """Create a parallax background frame with stars and nebula effects."""
    import random
    rng = random.Random(biome_cfg["id"] * 1000 + frame_idx)
    
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Fill base gradient from colors
    num_colors = len(colors)
    for y in range(height):
        t = y / height
        seg = t * (num_colors - 1)
        i = int(seg)
        frac = seg - i
        if i >= num_colors - 1:
            c = colors[-1]
        else:
            c1, c2 = colors[i], colors[i + 1]
            c = tuple(int(c1[j] + (c2[j] - c1[j]) * frac) for j in range(3))
        draw.line([(0, y), (width, y)], fill=c)
    
    # Stars (parallax layers)
    for layer, density_mul in [(0, 0.3), (1, 0.7), (2, 1.0)]:
        density = biome_cfg["star_density"] * density_mul * width * height
        num_stars = int(density)
        parallax_offset = int(frame_idx * (layer + 1) * 0.5) % width
        for _ in range(num_stars):
            x = (rng.randint(0, width - 1) + parallax_offset) % width
            y = rng.randint(0, height - 1)
            brightness = rng.randint(100, 255)
            size = rng.randint(1, 3)
            draw.ellipse([x, y, x + size, y + size], fill=(brightness, brightness, brightness, rng.randint(150, 255)))
    
    # Nebula blobs (if any)
    for _ in range(biome_cfg.get("nebula_blobs", 0)):
        cx = rng.randint(0, width)
        cy = rng.randint(0, height)
        radius = rng.randint(40, 120)
        neb_color = biome_cfg["colors"]["primary"]
        for r in range(radius, 0, -5):
            alpha = int(30 * (r / radius))
            draw.ellipse([cx - r, cy - r, cx + r, cy + r],
                        fill=(neb_color[0], neb_color[1], neb_color[2], alpha))
    
    # Apply slight blur for depth
    img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
    img.save(path, "PNG")
    return True


def create_audio_placeholder(path, duration_sec=60, sample_rate=22050):
    """Create a placeholder WAV with silence + tone pulses."""
    num_samples = duration_sec * sample_rate
    samples = []
    for i in range(num_samples):
        t = i / sample_rate
        # Subtle pulsing drone
        val = int(20 * math.sin(2 * math.pi * 80 * t) * (0.3 + 0.2 * math.sin(2 * math.pi * 0.25 * t)))
        # Clamp
        val = max(-32767, min(32767, val))
        samples.append(val)
    
    with wave.open(path, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        for s in samples:
            wf.writeframes(struct.pack('<h', s))
    return True


# ═══════════════════════════════════════════════════════════════
# MAIN GENERATION
# ═══════════════════════════════════════════════════════════════

FRAMES_PER_BIOME = 10  # Reduced from 120 for mock - expand with Veo later
BG_WIDTH = 1280
BG_HEIGHT = 720

new_sprites = {}
asset_catalog_entries = []
veo_catalog_entries = []
generated_count = 0

for biome in BIOMES:
    bid = biome["id"]
    bname = biome["name"]
    print(f"\n{'='*60}")
    print(f"BIOME {bid}: {biome['display']} ({bname})")
    print(f"{'='*60}")
    
    # ── Parallax Background Frames ──
    bg_prefix = f"bg_{bname}"
    bg_frames = []
    print(f"  Generating {FRAMES_PER_BIOME} background frames...")
    for fi in range(FRAMES_PER_BIOME):
        fname = f"{bg_prefix}_{fi:04d}.png"
        fpath = os.path.join(SPRITES_DIR, fname)
        create_background_frame(fpath, BG_WIDTH, BG_HEIGHT, biome["bg_colors"], fi, FRAMES_PER_BIOME, biome)
        bg_frames.append({
            "index": fi,
            "filename": fname,
            "path": f"assets/sprites/{fname}",
            "width": BG_WIDTH,
            "height": BG_HEIGHT,
            "is_power_of_two": False
        })
        generated_count += 1
    
    # Create strip composite
    strip_path = os.path.join(SPRITES_DIR, "backgrounds", f"{bg_prefix}_strip.png")
    os.makedirs(os.path.dirname(strip_path), exist_ok=True)
    # Stack horizontally
    strip_img = Image.new("RGBA", (BG_WIDTH * FRAMES_PER_BIOME, BG_HEIGHT))
    for fi in range(FRAMES_PER_BIOME):
        frame = Image.open(os.path.join(SPRITES_DIR, f"{bg_prefix}_{fi:04d}.png"))
        strip_img.paste(frame, (BG_WIDTH * fi, 0))
    strip_img.save(strip_path, "PNG")
    print(f"  → Strip composite: backgrounds/{bg_prefix}_strip.png")
    
    new_sprites[f"bg_{bname}"] = {
        "biome": bid,
        "display": biome["display"],
        "frames": bg_frames,
        "strip": f"assets/sprites/backgrounds/{bg_prefix}_strip.png",
        "frame_count": FRAMES_PER_BIOME,
        "width": BG_WIDTH,
        "height": BG_HEIGHT,
    }
    
    veo_catalog_entries.append({
        "asset_id": f"BG_{bid:02d}",
        "type": "parallax_background",
        "biome": bid,
        "name": f"{biome['display']} Background",
        "prompt": f"Parallax scrolling space background for {biome['display']}, {biome['colors']['primary']} dominant with {biome['colors']['secondary']} accents, 16-bit pixel art style, 3-layer parallax depth, 1280x720, seamless loop",
        "status": "mock_generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    })
    
    # ── Enemy Sprites ──
    for etype, edata in biome["enemies"].items():
        prefix = edata["prefix"]
        size = edata["size"]
        color = edata["color"]
        shape_map = {"scout": "triangle", "interceptor": "diamond", "heavy": "rect", "special": "ellipse"}
        shape = shape_map.get(etype, "ellipse")
        
        fname = f"{prefix}_0.png"
        fpath = os.path.join(SPRITES_DIR, fname)
        create_sprite(fpath, size[0], size[1], color, shape=shape)
        print(f"  Enemy: {edata['name']} ({etype}) → {fname}")
        generated_count += 1
        
        new_sprites[prefix] = {
            "biome": bid,
            "display": edata["name"],
            "type": etype,
            "hp": edata["hp"],
            "points": edata["points"],
            "filename": fname,
            "path": f"assets/sprites/{fname}",
            "width": size[0],
            "height": size[1],
            "color": list(color),
            "frames": [{"index": 0, "filename": fname, "path": f"assets/sprites/{fname}"}]
        }
        
        asset_catalog_entries.append({
            "asset_id": f"E{11 + bid * 4 + list(biome['enemies'].keys()).index(etype):02d}",
            "type": f"enemy_{etype}",
            "biome": bid,
            "name": edata["name"].replace("_", " ").title(),
            "hp": edata["hp"],
            "points": edata["points"],
            "filename": fname,
            "status": "mock_generated",
        })
    
    # ── Sub-Boss Sprite ──
    mb = biome["mid_boss"]
    mbfname = f"{mb['prefix']}_0.png"
    mbfpath = os.path.join(SPRITES_DIR, mbfname)
    create_sprite(mbfpath, mb["size"][0], mb["size"][1], mb["color"], shape="boss")
    print(f"  Mid-boss: {mb['name']} → {mbfname}")
    generated_count += 1
    
    new_sprites[mb["prefix"]] = {
        "biome": bid,
        "display": mb["name"],
        "type": "mid_boss",
        "hp": mb["hp"],
        "points": mb["points"],
        "filename": mbfname,
        "path": f"assets/sprites/{mbfname}",
        "width": mb["size"][0],
        "height": mb["size"][1],
        "color": list(mb["color"]),
        "frames": [{"index": 0, "filename": mbfname, "path": f"assets/sprites/{mbfname}"}]
    }
    
    asset_catalog_entries.append({
        "asset_id": f"MB_{bid:02d}",
        "type": "mid_boss",
        "biome": bid,
        "name": mb["name"].replace("_", " ").title(),
        "hp": mb["hp"],
        "points": mb["points"],
        "filename": mbfname,
        "status": "mock_generated",
    })
    
    # ── Biome Boss (concept PNG already exists, create game-ready version) ──
    bb = biome["biome_boss"]
    bb_fname = f"{bb['prefix']}_game.png"
    bb_fpath = os.path.join(SPRITES_DIR, bb_fname)
    # Check if concept art exists
    concept_path = os.path.join(BOSSES_DIR, f"{bb['prefix']}.png")
    if os.path.exists(concept_path):
        print(f"  Boss concept exists: {concept_path} (generating game-ready version)")
    create_sprite(bb_fpath, bb["size"][0], bb["size"][1], bb["color"], shape="boss")
    print(f"  Biome boss: {bb['name']} → {bb_fname}")
    generated_count += 1
    
    new_sprites[f"{bb['prefix']}_game"] = {
        "biome": bid,
        "display": bb["name"],
        "type": "biome_boss",
        "hp": bb["hp"],
        "points": bb["points"],
        "filename": bb_fname,
        "path": f"assets/sprites/{bb_fname}",
        "width": bb["size"][0],
        "height": bb["size"][1],
        "color": list(bb["color"]),
        "concept_art": f"assets/sprites/bosses/{bb['prefix']}.png",
        "frames": [{"index": 0, "filename": bb_fname, "path": f"assets/sprites/{bb_fname}"}]
    }
    
    veo_catalog_entries.append({
        "asset_id": f"BOSS_{bid:02d}",
        "type": "biome_boss",
        "biome": bid,
        "name": bb["name"].replace("_", " ").title(),
        "hp": bb["hp"],
        "prompt": f"16-bit pixel art boss sprite for {bb['name'].replace('_', ' ')}, cyberpunk biomechanical aesthetic, {bb['size'][0]}x{bb['size'][1]}, transparent background",
        "status": "concept_exists_game_mock_generated",
    })
    
    # ── Ambient Audio Placeholder ──
    amb_fname = f"{biome['ambient']}.wav"
    amb_fpath = os.path.join(AMBIENT_DIR, amb_fname)
    create_audio_placeholder(amb_fpath)
    print(f"  Ambient audio: {amb_fname}")
    generated_count += 1
    
    new_sprites[f"audio_{biome['ambient']}"] = {
        "biome": bid,
        "type": "ambient_audio",
        "filename": amb_fname,
        "path": f"assets/audio/ambient/{amb_fname}",
        "format": "wav",
        "duration_sec": 60,
        "status": "placeholder",
    }
    
    asset_catalog_entries.append({
        "asset_id": f"AUDIO_{bid:02d}",
        "type": "ambient_audio",
        "biome": bid,
        "name": f"{biome['display']} Ambient",
        "filename": amb_fname,
        "status": "placeholder",
    })

# ── Update sprites.json ──
print(f"\n{'='*60}")
print("UPDATING MANIFEST")
print(f"{'='*60}")

manifest_path = os.path.join(BASE_DIR, "assets", "sprites.json")
with open(manifest_path, "r") as f:
    manifest = json.load(f)

# Merge new sprites into manifest (don't overwrite existing)
existing = set(manifest.get("sprites", {}).keys())
added = 0
for key, val in new_sprites.items():
    if key not in existing:
        manifest["sprites"][key] = val
        added += 1
    else:
        print(f"  SKIP: {key} already exists in manifest")

manifest["generated_at"] = datetime.now(timezone.utc).isoformat()
manifest["manifest_version"] = "2.0"
manifest["total_sprites"] = len(manifest["sprites"])

with open(manifest_path, "w") as f:
    json.dump(manifest, f, indent=2)
print(f"  Added {added} new sprite entries to sprites.json")
print(f"  Total sprites: {manifest['total_sprites']}")

# ── Create ASSET_CATALOG.json ──
catalog_path = os.path.join(BASE_DIR, "assets", "ASSET_CATALOG.json")
catalog = {
    "catalog_version": "1.0",
    "generated_at": datetime.now(timezone.utc).isoformat(),
    "description": "Complete asset catalog for Darius Star: Cyber Coelacanth - all biomes 1-10",
    "total_entries": len(asset_catalog_entries),
    "assets": asset_catalog_entries
}
with open(catalog_path, "w") as f:
    json.dump(catalog, f, indent=2)
print(f"  Created ASSET_CATALOG.json with {len(asset_catalog_entries)} entries")

# ── Create VEO_ASSET_CATALOG.json ──
veo_path = os.path.join(BASE_DIR, "assets", "VEO_ASSET_CATALOG.json")
veo_catalog = {
    "catalog_version": "1.0",
    "generated_at": datetime.now(timezone.utc).isoformat(),
    "description": "Veo/Imagen/Lyria generation prompts and status for biome 4-10 assets",
    "generator": "Veo 3.1-lite (video), Imagen 3 (sprites), Lyria 2 (audio)",
    "total_entries": len(veo_catalog_entries),
    "assets": veo_catalog_entries
}
with open(veo_path, "w") as f:
    json.dump(veo_catalog, f, indent=2)
print(f"  Created VEO_ASSET_CATALOG.json with {len(veo_catalog_entries)} entries")

print(f"\n{'='*60}")
print(f"GENERATION COMPLETE")
print(f"{'='*60}")
print(f"Total files generated: {generated_count}")
print(f"Biomes processed: {len(BIOMES)} (4-10)")
print(f"Background frames: {len(BIOMES) * FRAMES_PER_BIOME}")
print(f"Enemy types: {sum(len(b['enemies']) for b in BIOMES)}")
print(f"Mid-bosses: {len(BIOMES)}")
print(f"Biome bosses: {len(BIOMES)}")
print(f"Ambient tracks: {len(BIOMES)}")
print(f"Manifest entries added: {added}")
