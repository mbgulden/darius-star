#!/usr/bin/env python3
"""
tools/generate_boss_sprites.py — Complete Boss & Sub-Boss Sprite Generator (20 Units)
=====================================================================================
Generates 512x512 crisp, transparent RGBA pixel/vector-hybrid retro arcade sprites
for all 10 Sub-Bosses (Level 5) and 10 Biome Bosses (Level 10) in Darius Star.
"""

import os
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

REPO_ROOT = Path(__file__).resolve().parent.parent
SPRITES_DIR = REPO_ROOT / "assets" / "sprites"
SPRITES_DIR.mkdir(parents=True, exist_ok=True)

SIZE = 512
CENTER = SIZE // 2

def create_base_canvas():
    return Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))

def add_glow(img, color, radius=20, alpha=160):
    glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    alpha_mask = img.split()[3]
    glow_color = (*color[:3], alpha)
    glow_draw.bitmap((0, 0), alpha_mask, fill=glow_color)
    glow = glow.filter(ImageFilter.GaussianBlur(radius))
    return Image.alpha_composite(glow, img)

# ─── BIOME 1: ABYSSAL TRENCH ──────────────────────────────────────────────────
def gen_b1_mid(): # Trench Nautilus
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    # Spiral nautilus shell (facing left)
    d.pieslice([120, 100, 420, 412], start=90, end=270, fill=(10, 40, 70, 255), outline=(0, 255, 255, 255), width=6)
    d.pieslice([180, 160, 360, 352], start=90, end=270, fill=(20, 65, 110, 255), outline=(0, 220, 255, 255), width=4)
    # Spiral ridges
    for r in [60, 100, 140]:
        d.arc([CENTER-r, CENTER-r, CENTER+r, CENTER+r], start=90, end=270, fill=(0, 255, 255, 255), width=3)
    # Twin bio-plasma cannon mouth
    d.polygon([(120, 210), (40, 180), (120, 240)], fill=(0, 200, 255, 255), outline=(255, 255, 255, 255), width=3)
    d.polygon([(120, 272), (40, 302), (120, 302)], fill=(0, 200, 255, 255), outline=(255, 255, 255, 255), width=3)
    # Bioluminescent tentacles
    for y in [180, 220, 260, 300, 340]:
        d.line([(400, y), (470, y - 15), (500, y)], fill=(0, 255, 255, 200), width=5)
    return add_glow(img, (0, 255, 255), radius=18)

def gen_b1_boss(): # Abyssal Guardian (Titanic Coelacanth)
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    # Colossal armored fish body
    body = [(80, 256), (160, 130), (380, 140), (450, 256), (380, 372), (160, 382)]
    d.polygon(body, fill=(15, 35, 65, 255), outline=(0, 255, 255, 255), width=7)
    # Dorsal heavy railgun cannon mount
    d.polygon([(160, 130), (120, 70), (280, 70), (320, 130)], fill=(30, 60, 95, 255), outline=(0, 255, 255, 255), width=4)
    d.rectangle([60, 80, 140, 105], fill=(0, 255, 255, 255), outline=(255, 255, 255, 255), width=2)
    # Ventral torpedo bays
    d.polygon([(200, 375), (280, 440), (340, 375)], fill=(30, 60, 95, 255), outline=(0, 255, 255, 255), width=4)
    # Giant glowing angler eye & mouth
    d.ellipse([120, 220, 170, 270], fill=(255, 220, 0, 255), outline=(255, 50, 50, 255), width=4)
    d.polygon([(80, 256), (140, 280), (140, 310)], fill=(0, 255, 255, 255))
    # Massive cyber-fins
    d.polygon([(360, 140), (460, 40), (420, 160)], fill=(0, 200, 255, 200), outline=(0, 255, 255, 255), width=4)
    d.polygon([(360, 372), (460, 472), (420, 352)], fill=(0, 200, 255, 200), outline=(0, 255, 255, 255), width=4)
    return add_glow(img, (0, 255, 255), radius=22)

# ─── BIOME 2: CORAL GRAVEYARD ─────────────────────────────────────────────────
def gen_b2_mid(): # Calcified Scorpion
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    # Calcified carapace
    d.polygon([(140, 256), (220, 170), (360, 180), (410, 256), (360, 332), (220, 342)], fill=(160, 60, 80, 255), outline=(255, 180, 200, 255), width=5)
    # Twin heavy stinger tail curved overhead
    d.arc([160, 60, 380, 260], start=180, end=350, fill=(255, 100, 140, 255), width=16)
    d.polygon([(140, 130), (70, 110), (120, 160)], fill=(255, 50, 100, 255), outline=(255, 255, 255, 255), width=3)
    # Pincer shield claws
    d.polygon([(140, 210), (50, 180), (90, 250)], fill=(200, 80, 110, 255), outline=(255, 200, 220, 255), width=4)
    d.polygon([(140, 302), (50, 332), (90, 262)], fill=(200, 80, 110, 255), outline=(255, 200, 220, 255), width=4)
    return add_glow(img, (255, 100, 140), radius=18)

def gen_b2_boss(): # Coral Colossus
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    # Massive living reef fortress
    body = [(100, 256), (180, 110), (400, 120), (460, 256), (400, 392), (180, 402)]
    d.polygon(body, fill=(180, 70, 90, 255), outline=(255, 220, 230, 255), width=8)
    # Dual coral flak turret spires
    d.polygon([(200, 110), (160, 30), (240, 30), (260, 110)], fill=(230, 90, 120, 255), outline=(255, 255, 255, 255), width=4)
    d.polygon([(200, 402), (160, 482), (240, 482), (260, 402)], fill=(230, 90, 120, 255), outline=(255, 255, 255, 255), width=4)
    # Central bio-spore vortex maw
    d.ellipse([200, 206, 300, 306], fill=(255, 0, 80, 255), outline=(255, 255, 255, 255), width=5)
    d.ellipse([230, 236, 270, 276], fill=(255, 255, 255, 255))
    return add_glow(img, (255, 80, 120), radius=22)

# ─── BIOME 3: EUROPA COELACANTH LAIR ──────────────────────────────────────────
def gen_b3_mid(): # Cryo Mantis
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    # Faceted sub-zero chassis
    d.polygon([(140, 256), (240, 170), (370, 180), (420, 256), (370, 332), (240, 342)], fill=(20, 50, 90, 255), outline=(0, 220, 255, 255), width=5)
    # Twin frost scythes
    d.polygon([(200, 170), (80, 90), (160, 190)], fill=(100, 210, 255, 230), outline=(255, 255, 255, 255), width=3)
    d.polygon([(200, 342), (80, 422), (160, 322)], fill=(100, 210, 255, 230), outline=(255, 255, 255, 255), width=3)
    # Blue laser optic array
    d.rectangle([110, 244, 160, 268], fill=(0, 255, 255, 255), outline=(255, 255, 255, 255), width=2)
    return add_glow(img, (0, 220, 255), radius=18)

def gen_b3_boss(): # Hatchery Queen
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    # Massive cryogenic brood-mother
    body = [(90, 256), (170, 120), (390, 130), (460, 256), (390, 382), (170, 392)]
    d.polygon(body, fill=(15, 45, 85, 255), outline=(100, 220, 255, 255), width=7)
    # Pulsating cryogenic egg sac pod
    d.ellipse([240, 186, 360, 326], fill=(0, 180, 255, 200), outline=(255, 255, 255, 255), width=4)
    d.ellipse([270, 216, 330, 296], fill=(200, 240, 255, 255))
    # Sub-zero ice lance array
    for y in [160, 210, 260, 310, 350]:
        d.line([(90, y), (30, y)], fill=(0, 255, 255, 255), width=6)
    return add_glow(img, (0, 200, 255), radius=22)

# ─── BIOME 4: NEBULA DRIFT ────────────────────────────────────────────────────
def gen_b4_mid(): # Warp Striker
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(110, 256), (220, 160), (370, 180), (430, 256), (370, 332), (220, 352)], fill=(50, 20, 80, 255), outline=(220, 80, 255, 255), width=5)
    d.polygon([(200, 160), (280, 60), (360, 140)], fill=(180, 50, 230, 200), outline=(255, 255, 255, 255), width=3)
    d.polygon([(200, 352), (280, 452), (360, 372)], fill=(180, 50, 230, 200), outline=(255, 255, 255, 255), width=3)
    return add_glow(img, (220, 80, 255), radius=18)

def gen_b4_boss(): # Nebula Wraith
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    body = [(90, 256), (170, 110), (390, 120), (460, 256), (390, 392), (170, 402)]
    d.polygon(body, fill=(40, 15, 70, 230), outline=(240, 100, 255, 255), width=7)
    # Quantum shield prisms orbiting
    d.ellipse([210, 186, 330, 326], fill=(140, 30, 200, 220), outline=(255, 255, 255, 255), width=5)
    d.ellipse([250, 226, 290, 286], fill=(255, 100, 255, 255))
    return add_glow(img, (240, 100, 255), radius=22)

# ─── BIOME 5: ICE RING / IRON TRENCH ──────────────────────────────────────────
def gen_b5_mid(): # Frost Behemoth
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(110, 256), (220, 140), (390, 150), (440, 256), (390, 362), (220, 372)], fill=(60, 70, 80, 255), outline=(0, 206, 201, 255), width=6)
    # Giant icebreaker drill tip
    d.polygon([(110, 256), (40, 220), (40, 292)], fill=(0, 206, 201, 255), outline=(255, 255, 255, 255), width=3)
    return add_glow(img, (0, 206, 201), radius=18)

def gen_b5_boss(): # Kraken Umbra
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    body = [(100, 256), (180, 120), (380, 130), (450, 256), (380, 382), (180, 392)]
    d.polygon(body, fill=(45, 52, 54, 255), outline=(0, 206, 201, 255), width=8)
    # Heavy titanium ice-shell plates
    d.polygon([(200, 150), (360, 160), (340, 256), (180, 256)], fill=(178, 190, 195, 255), outline=(255, 255, 255, 255), width=3)
    d.polygon([(200, 362), (360, 352), (340, 256), (180, 256)], fill=(178, 190, 195, 255), outline=(255, 255, 255, 255), width=3)
    # Siphon tentacles
    for y in [170, 210, 256, 302, 342]:
        d.line([(450, y), (490, y - 10), (510, y)], fill=(0, 206, 201, 240), width=6)
    return add_glow(img, (0, 206, 201), radius=22)

# ─── BIOME 6: FIRE NEBULA ─────────────────────────────────────────────────────
def gen_b6_mid(): # Magma Drake
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(110, 256), (220, 170), (370, 180), (430, 256), (370, 332), (220, 342)], fill=(180, 40, 20, 255), outline=(255, 160, 0, 255), width=5)
    d.polygon([(200, 170), (280, 70), (360, 150)], fill=(230, 100, 20, 220), outline=(255, 235, 59, 255), width=3)
    d.polygon([(200, 342), (280, 442), (360, 362)], fill=(230, 100, 20, 220), outline=(255, 235, 59, 255), width=3)
    return add_glow(img, (255, 120, 0), radius=18)

def gen_b6_boss(): # Ember Overlord
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    body = [(90, 256), (170, 110), (390, 120), (460, 256), (390, 392), (170, 402)]
    d.polygon(body, fill=(45, 20, 20, 255), outline=(243, 156, 18, 255), width=8)
    # Twin solar flare wings
    d.polygon([(220, 120), (320, 20), (420, 120)], fill=(230, 126, 34, 230), outline=(255, 235, 59, 255), width=4)
    d.polygon([(220, 392), (320, 492), (420, 392)], fill=(230, 126, 34, 230), outline=(255, 235, 59, 255), width=4)
    # Coronal fusion core
    d.ellipse([210, 186, 330, 326], fill=(255, 87, 34, 255), outline=(255, 235, 59, 255), width=5)
    d.ellipse([250, 226, 290, 286], fill=(255, 255, 255, 255))
    return add_glow(img, (255, 100, 0), radius=22)

# ─── BIOME 7: STORM BELT ──────────────────────────────────────────────────────
def gen_b7_mid(): # Volt Wyvern
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(110, 256), (220, 170), (370, 180), (430, 256), (370, 332), (220, 342)], fill=(30, 45, 60, 255), outline=(254, 211, 48, 255), width=5)
    d.polygon([(200, 170), (280, 70), (360, 150)], fill=(69, 170, 242, 220), outline=(255, 255, 255, 255), width=3)
    d.polygon([(200, 342), (280, 442), (360, 362)], fill=(69, 170, 242, 220), outline=(255, 255, 255, 255), width=3)
    return add_glow(img, (254, 211, 48), radius=18)

def gen_b7_boss(): # Storm Sentinel
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    body = [(90, 256), (170, 110), (390, 120), (460, 256), (390, 392), (170, 402)]
    d.polygon(body, fill=(30, 39, 46, 255), outline=(69, 170, 242, 255), width=8)
    # Twin tesla coil pylons
    d.polygon([(180, 110), (140, 30), (220, 30), (240, 110)], fill=(40, 60, 80, 255), outline=(254, 211, 48, 255), width=4)
    d.polygon([(180, 402), (140, 482), (220, 482), (240, 402)], fill=(40, 60, 80, 255), outline=(254, 211, 48, 255), width=4)
    # Central ion tempest eye
    d.ellipse([210, 186, 330, 326], fill=(254, 211, 48, 255), outline=(255, 255, 255, 255), width=5)
    d.ellipse([250, 226, 290, 286], fill=(255, 255, 255, 255))
    return add_glow(img, (254, 211, 48), radius=22)

# ─── BIOME 8: DERELICT FLEET ──────────────────────────────────────────────────
def gen_b8_mid(): # Ghost Frigate
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(120, 256), (220, 170), (380, 180), (440, 256), (380, 332), (220, 342)], fill=(35, 50, 45, 240), outline=(46, 213, 115, 255), width=5)
    d.rectangle([80, 244, 150, 268], fill=(46, 213, 115, 255))
    return add_glow(img, (46, 213, 115), radius=18)

def gen_b8_boss(): # Navy Dreadnought
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    body = [(80, 256), (160, 110), (400, 120), (470, 256), (400, 392), (160, 402)]
    d.polygon(body, fill=(47, 53, 66, 255), outline=(46, 213, 115, 255), width=8)
    # Quad heavy naval turrets
    for y in [150, 210, 290, 350]:
        d.rectangle([60, y-10, 160, y+10], fill=(30, 39, 46, 255), outline=(255, 165, 2, 255), width=3)
    # Heavy command bridge
    d.polygon([(240, 206), (320, 206), (300, 296), (220, 296)], fill=(30, 39, 46, 255), outline=(46, 213, 115, 255), width=4)
    return add_glow(img, (46, 213, 115), radius=22)

# ─── BIOME 9: XENOMORPH HIVE ──────────────────────────────────────────────────
def gen_b9_mid(): # Hive Crusher
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(110, 256), (220, 150), (390, 160), (440, 256), (390, 352), (220, 362)], fill=(45, 30, 60, 255), outline=(0, 184, 148, 255), width=6)
    # Spiked raptorial claws
    d.line([(180, 150), (80, 110)], fill=(108, 92, 231, 255), width=8)
    d.line([(180, 362), (80, 402)], fill=(108, 92, 231, 255), width=8)
    return add_glow(img, (0, 184, 148), radius=18)

def gen_b9_boss(): # Hive Mind Node
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    body = [(90, 256), (170, 110), (390, 120), (460, 256), (390, 392), (170, 402)]
    d.polygon(body, fill=(45, 25, 65, 255), outline=(108, 92, 231, 255), width=8)
    # Synaptic neuro-node brain core
    d.ellipse([200, 176, 340, 336], fill=(0, 184, 148, 230), outline=(255, 255, 255, 255), width=5)
    d.ellipse([240, 216, 300, 296], fill=(162, 155, 254, 255))
    return add_glow(img, (0, 184, 148), radius=22)

# ─── BIOME 10: CORE RIFT / EVENT HORIZON ──────────────────────────────────────
def gen_b10_mid(): # Paradox Harbinger
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(110, 256), (256, 140), (402, 256), (256, 372)], fill=(30, 25, 45, 240), outline=(232, 67, 147, 255), width=6)
    d.ellipse([CENTER-40, CENTER-40, CENTER+40, CENTER+40], fill=(247, 183, 49, 255))
    return add_glow(img, (232, 67, 147), radius=18)

def gen_b10_boss(): # Cyber Coelacanth Prime
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    # The Prime Precursor Leviathan
    body = [(70, 256), (150, 100), (390, 110), (470, 256), (390, 402), (150, 412)]
    d.polygon(body, fill=(15, 20, 35, 255), outline=(232, 67, 147, 255), width=8)
    # Dorsal Chrono-Railgun
    d.polygon([(150, 100), (100, 30), (280, 30), (320, 100)], fill=(40, 30, 60, 255), outline=(247, 183, 49, 255), width=4)
    d.rectangle([40, 40, 120, 70], fill=(232, 67, 147, 255), outline=(255, 255, 255, 255), width=2)
    # Ventral Singularity Launchers
    d.polygon([(180, 412), (260, 482), (320, 412)], fill=(40, 30, 60, 255), outline=(247, 183, 49, 255), width=4)
    # Unbound Chrono Core
    d.ellipse([210, 186, 330, 326], fill=(0, 0, 0, 255), outline=(232, 67, 147, 255), width=6)
    d.ellipse([240, 216, 300, 296], fill=(247, 183, 49, 255))
    return add_glow(img, (232, 67, 147), radius=25)


BOSS_GENERATORS = {
    "boss_b1_mid_0": gen_b1_mid,
    "boss_b1_0": gen_b1_boss,
    
    "boss_b2_mid_0": gen_b2_mid,
    "boss_b2_0": gen_b2_boss,
    
    "boss_b3_mid_0": gen_b3_mid,
    "boss_b3_0": gen_b3_boss,
    
    "boss_b4_mid_0": gen_b4_mid,
    "boss_b4_0": gen_b4_boss,
    
    "boss_b5_mid_0": gen_b5_mid,
    "boss_b5_0": gen_b5_boss,
    
    "boss_b6_mid_0": gen_b6_mid,
    "boss_b6_0": gen_b6_boss,
    
    "boss_b7_mid_0": gen_b7_mid,
    "boss_b7_0": gen_b7_boss,
    
    "boss_b8_mid_0": gen_b8_mid,
    "boss_b8_0": gen_b8_boss,
    
    "boss_b9_mid_0": gen_b9_mid,
    "boss_b9_0": gen_b9_boss,
    
    "boss_b10_mid_0": gen_b10_mid,
    "boss_b10_0": gen_b10_boss,
}

def generate_all_boss_sprites():
    print("=" * 60)
    print("DARIUS STAR: GENERATING HIGH-RESOLUTION BOSS & SUB-BOSS SPRITES")
    print(f"Target Directory: {SPRITES_DIR}")
    print(f"Total Unique Boss Assets: {len(BOSS_GENERATORS)}")
    print("=" * 60)
    
    count = 0
    for filename, gen_fn in BOSS_GENERATORS.items():
        out_path = SPRITES_DIR / f"{filename}.png"
        img = gen_fn()
        img.save(out_path, format="PNG")
        size_bytes = out_path.stat().st_size
        print(f"  [OK] {filename}.png ({img.size[0]}x{img.size[1]} RGBA): {size_bytes} bytes")
        count += 1
        
    print("=" * 60)
    print(f"Generation Complete: {count}/{len(BOSS_GENERATORS)} boss sprites generated successfully.")
    print("=" * 60)

if __name__ == "__main__":
    generate_all_boss_sprites()
