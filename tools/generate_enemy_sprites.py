#!/usr/bin/env python3
"""
tools/generate_enemy_sprites.py — Complete Stratum Enemy Sprite Suite (40 Units)
=================================================================================
Generates 512x512 crisp, transparent RGBA pixel/vector-hybrid retro arcade sprites
for all 40 distinct enemy archetypes across all 10 campaign strata (biomes)
in Darius Star: Cyber Coelacanth.
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

def add_glow(img, color, radius=16, alpha=140):
    glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    alpha_mask = img.split()[3]
    glow_color = (*color[:3], alpha)
    glow_draw.bitmap((0, 0), alpha_mask, fill=glow_color)
    glow = glow.filter(ImageFilter.GaussianBlur(radius))
    return Image.alpha_composite(glow, img)

# ─── BIOME 1: ABYSSAL TRENCH ──────────────────────────────────────────────────
def gen_angler_scout():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    body = [(120, 256), (200, 190), (360, 200), (420, 256), (360, 312), (200, 322)]
    d.polygon(body, fill=(10, 30, 60, 255), outline=(0, 255, 255, 255), width=4)
    d.polygon([(240, 200), (320, 110), (380, 205)], fill=(0, 200, 255, 180), outline=(0, 255, 255, 255), width=3)
    d.polygon([(240, 312), (310, 380), (370, 310)], fill=(0, 200, 255, 180), outline=(0, 255, 255, 255), width=3)
    d.polygon([(420, 256), (480, 170), (450, 256), (480, 342)], fill=(0, 229, 255, 220), outline=(0, 255, 255, 255), width=3)
    d.arc([80, 130, 260, 280], start=180, end=340, fill=(0, 255, 255, 255), width=5)
    d.ellipse([70, 160, 110, 200], fill=(255, 255, 100, 255), outline=(255, 255, 255, 255), width=3)
    d.ellipse([170, 230, 205, 265], fill=(255, 200, 0, 255), outline=(255, 50, 50, 255), width=3)
    d.ellipse([180, 240, 195, 255], fill=(255, 0, 0, 255))
    teeth = [(130, 260), (145, 275), (160, 260), (175, 275), (190, 260)]
    for i in range(len(teeth)-1):
        d.polygon([teeth[i], teeth[i+1], (teeth[i][0]+7, teeth[i][1]+16)], fill=(240, 255, 255, 255))
    return add_glow(img, (0, 255, 255), radius=14)

def gen_jelly_interceptor():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.pieslice([100, 156, 320, 356], start=90, end=270, fill=(0, 200, 255, 160), outline=(0, 255, 255, 255), width=5)
    d.ellipse([210, 216, 290, 296], fill=(255, 0, 200, 220), outline=(255, 255, 255, 255), width=3)
    for i, y_offset in enumerate([-70, -40, -10, 20, 50, 80]):
        c = (0, 255, 255, 220) if i % 2 == 0 else (255, 0, 220, 200)
        d.line([(310, 256 + y_offset), (360, 240 + y_offset), (410, 270 + y_offset), (470, 256 + y_offset)], fill=c, width=4)
        d.ellipse([465, 251 + y_offset, 475, 261 + y_offset], fill=(255, 255, 255, 255))
    return add_glow(img, (0, 230, 255), radius=16)

def gen_vent_crab_heavy():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    carapace = [(160, 256), (220, 160), (380, 160), (430, 256), (380, 352), (220, 352)]
    d.polygon(carapace, fill=(20, 25, 35, 255), outline=(255, 100, 0, 255), width=6)
    d.ellipse([250, 190, 300, 240], fill=(255, 80, 0, 255), outline=(255, 220, 0, 255), width=3)
    d.ellipse([250, 272, 300, 322], fill=(255, 80, 0, 255), outline=(255, 220, 0, 255), width=3)
    d.polygon([(140, 170), (70, 130), (100, 210)], fill=(40, 50, 65, 255), outline=(255, 120, 0, 255), width=4)
    d.polygon([(140, 342), (70, 382), (100, 302)], fill=(40, 50, 65, 255), outline=(255, 120, 0, 255), width=4)
    d.rectangle([50, 160, 90, 180], fill=(255, 50, 0, 255))
    d.rectangle([50, 332, 90, 352], fill=(255, 50, 0, 255))
    for y in [180, 230, 280, 330]:
        d.line([(380, y), (460, y - 20), (490, y)], fill=(60, 70, 90, 255), width=6)
    return add_glow(img, (255, 90, 0), radius=16)

def gen_trench_eel():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    pts = [(100, 256), (180, 200), (270, 290), (360, 210), (450, 270), (480, 256)]
    d.line(pts, fill=(0, 220, 255, 255), width=28)
    d.line(pts, fill=(20, 60, 100, 255), width=16)
    for x, y in [(180, 200), (270, 290), (360, 210), (450, 270)]:
        d.ellipse([x-14, y-14, x+14, y+14], fill=(0, 255, 255, 255), outline=(255, 255, 255, 255), width=3)
    d.polygon([(100, 256), (150, 230), (140, 282)], fill=(0, 180, 230, 255), outline=(255, 255, 255, 255), width=3)
    d.ellipse([115, 242, 130, 257], fill=(255, 255, 0, 255))
    return add_glow(img, (0, 255, 255), radius=18)

# ─── BIOME 2: CORAL GRAVEYARD ─────────────────────────────────────────────────
def gen_rust_drone():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    hull = [(140, 256), (220, 180), (360, 190), (400, 256), (360, 322), (220, 332)]
    d.polygon(hull, fill=(130, 65, 20, 255), outline=(230, 126, 34, 255), width=5)
    d.ellipse([180, 244, 204, 268], fill=(255, 75, 0, 255), outline=(255, 220, 0, 255), width=2)
    d.ellipse([214, 220, 230, 236], fill=(255, 75, 0, 255))
    d.ellipse([214, 276, 230, 292], fill=(255, 75, 0, 255))
    d.line([(140, 220), (80, 190), (90, 240)], fill=(180, 90, 30, 255), width=6)
    d.line([(140, 292), (80, 322), (90, 272)], fill=(180, 90, 30, 255), width=6)
    return add_glow(img, (230, 126, 34), radius=14)

def gen_coral_wasp():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    body = [(120, 256), (200, 220), (340, 230), (430, 256), (340, 282), (200, 292)]
    d.polygon(body, fill=(220, 100, 130, 255), outline=(255, 220, 230, 255), width=4)
    d.polygon([(220, 220), (280, 90), (380, 140), (300, 230)], fill=(255, 120, 160, 190), outline=(255, 255, 255, 255), width=3)
    d.polygon([(220, 292), (280, 422), (380, 372), (300, 282)], fill=(255, 120, 160, 190), outline=(255, 255, 255, 255), width=3)
    d.polygon([(120, 256), (50, 256), (120, 251)], fill=(255, 255, 255, 255), outline=(255, 50, 100, 255), width=2)
    d.ellipse([160, 236, 185, 261], fill=(255, 0, 80, 255))
    return add_glow(img, (255, 100, 150), radius=16)

def gen_armored_eel():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    mantle = [(120, 256), (220, 130), (380, 150), (450, 256), (380, 362), (220, 382)]
    d.polygon(mantle, fill=(160, 70, 90, 255), outline=(245, 180, 200, 255), width=6)
    for x in [220, 280, 340, 400]:
        d.line([(x, 170), (x - 20, 256), (x, 342)], fill=(255, 235, 240, 255), width=5)
    d.rectangle([80, 180, 150, 210], fill=(200, 40, 80, 255), outline=(255, 255, 255, 255), width=3)
    d.rectangle([80, 302, 150, 332], fill=(200, 40, 80, 255), outline=(255, 255, 255, 255), width=3)
    return add_glow(img, (240, 100, 140), radius=18)

def gen_spine_urchin():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    num_spikes = 16
    for i in range(num_spikes):
        ang = i * (2 * math.pi / num_spikes)
        x1, y1 = CENTER + math.cos(ang) * 90, CENTER + math.sin(ang) * 90
        x2, y2 = CENTER + math.cos(ang) * 190, CENTER + math.sin(ang) * 190
        d.line([(x1, y1), (x2, y2)], fill=(255, 150, 180, 255), width=6)
    d.ellipse([CENTER-90, CENTER-90, CENTER+90, CENTER+90], fill=(140, 30, 60, 255), outline=(255, 200, 220, 255), width=6)
    d.ellipse([CENTER-45, CENTER-45, CENTER+45, CENTER+45], fill=(255, 0, 80, 255), outline=(255, 255, 255, 255), width=3)
    return add_glow(img, (255, 50, 100), radius=16)

# ─── BIOME 3: EUROPA COELACANTH LAIR ──────────────────────────────────────────
def gen_sparker():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    body = [(120, 256), (256, 170), (392, 256), (256, 342)]
    d.polygon(body, fill=(30, 80, 140, 255), outline=(0, 220, 255, 255), width=5)
    d.polygon([(180, 256), (256, 210), (332, 256), (256, 302)], fill=(100, 210, 255, 200), outline=(255, 255, 255, 255), width=2)
    d.line([(120, 256), (60, 190)], fill=(0, 255, 255, 255), width=4)
    d.line([(120, 256), (60, 322)], fill=(0, 255, 255, 255), width=4)
    return add_glow(img, (0, 220, 255), radius=14)

def gen_sentinel():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    mantle = [(100, 256), (200, 190), (340, 200), (380, 256), (340, 312), (200, 322)]
    d.polygon(mantle, fill=(15, 45, 95, 255), outline=(100, 200, 255, 255), width=5)
    d.ellipse([160, 220, 190, 250], fill=(0, 255, 255, 255), outline=(255, 255, 255, 255), width=2)
    d.ellipse([160, 262, 190, 292], fill=(0, 255, 255, 255), outline=(255, 255, 255, 255), width=2)
    for y in [220, 244, 268, 292]:
        d.line([(380, y), (480, y)], fill=(80, 180, 255, 220), width=5)
    return add_glow(img, (80, 190, 255), radius=16)

def gen_juggernaut():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    hull = [(140, 256), (220, 140), (410, 150), (460, 256), (410, 362), (220, 372)]
    d.polygon(hull, fill=(20, 40, 75, 255), outline=(0, 200, 255, 255), width=7)
    for y in [180, 220, 292, 332]:
        d.rectangle([90, y-12, 150, y+12], fill=(0, 180, 255, 255), outline=(255, 255, 255, 255), width=2)
    return add_glow(img, (0, 210, 255), radius=18)

def gen_boss_minion():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    body = [(130, 256), (200, 200), (350, 210), (410, 256), (350, 302), (200, 312)]
    d.polygon(body, fill=(35, 55, 80, 255), outline=(0, 255, 180, 255), width=4)
    d.rectangle([160, 244, 210, 268], fill=(255, 0, 60, 255), outline=(255, 200, 200, 255), width=2)
    d.polygon([(260, 210), (330, 130), (360, 210)], fill=(0, 220, 150, 200), outline=(0, 255, 180, 255), width=3)
    d.polygon([(260, 302), (330, 382), (360, 302)], fill=(0, 220, 150, 200), outline=(0, 255, 180, 255), width=3)
    d.polygon([(410, 256), (470, 190), (450, 256), (470, 322)], fill=(0, 255, 180, 255))
    return add_glow(img, (0, 255, 180), radius=15)

# ─── BIOME 4: NEBULA DRIFT (Quantum Violet) ───────────────────────────────────
def gen_plasma_wisp():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.ellipse([180, 180, 332, 332], fill=(142, 68, 173, 220), outline=(224, 86, 253, 255), width=4)
    d.ellipse([216, 216, 296, 296], fill=(255, 100, 255, 255), outline=(255, 255, 255, 255), width=3)
    for a in [0, 90, 180, 270]:
        rad = math.radians(a)
        x = CENTER + math.cos(rad) * 110
        y = CENTER + math.sin(rad) * 110
        d.ellipse([x-18, y-18, x+18, y+18], fill=(190, 46, 221, 255))
    return add_glow(img, (224, 86, 253), radius=18)

def gen_storm_sprite():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    # Dimensional Mantis shape
    d.polygon([(110, 256), (200, 210), (360, 220), (410, 256), (360, 292), (200, 302)], fill=(44, 44, 84, 255), outline=(190, 46, 221, 255), width=4)
    d.polygon([(200, 210), (140, 120), (280, 190)], fill=(142, 68, 173, 220), outline=(255, 255, 255, 255), width=3)
    d.polygon([(200, 302), (140, 392), (280, 322)], fill=(142, 68, 173, 220), outline=(255, 255, 255, 255), width=3)
    return add_glow(img, (190, 46, 221), radius=16)

def gen_gas_giant():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    # Massive gaseous leviathan
    d.ellipse([140, 140, 372, 372], fill=(64, 30, 100, 240), outline=(170, 70, 230, 255), width=8)
    d.ellipse([180, 180, 332, 332], fill=(100, 40, 150, 255), outline=(220, 120, 255, 255), width=4)
    d.rectangle([90, 230, 150, 282], fill=(230, 100, 255, 255), outline=(255, 255, 255, 255), width=3)
    return add_glow(img, (180, 60, 240), radius=20)

def gen_nebula_wraith():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(120, 256), (220, 160), (370, 190), (450, 256), (370, 322), (220, 352)], fill=(80, 30, 120, 200), outline=(240, 120, 255, 255), width=5)
    d.ellipse([170, 236, 200, 276], fill=(255, 0, 180, 255))
    return add_glow(img, (220, 80, 240), radius=18)

# ─── BIOME 5: ICE RING / IRON TRENCH ──────────────────────────────────────────
def gen_ice_shard():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(80, 256), (256, 210), (432, 256), (256, 302)], fill=(0, 206, 201, 230), outline=(223, 230, 233, 255), width=4)
    d.line([(80, 256), (432, 256)], fill=(255, 255, 255, 255), width=3)
    return add_glow(img, (0, 206, 201), radius=14)

def gen_frost_drone():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(140, 256), (230, 190), (370, 200), (410, 256), (370, 312), (230, 322)], fill=(45, 52, 54, 255), outline=(0, 206, 201, 255), width=5)
    d.rectangle([110, 246, 150, 266], fill=(0, 255, 255, 255))
    return add_glow(img, (0, 206, 201), radius=15)

def gen_glacier():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(120, 256), (200, 130), (420, 150), (460, 256), (420, 362), (200, 382)], fill=(99, 110, 114, 255), outline=(0, 206, 201, 255), width=7)
    d.polygon([(220, 170), (390, 180), (370, 256), (200, 256)], fill=(178, 190, 195, 255))
    d.polygon([(220, 342), (390, 332), (370, 256), (200, 256)], fill=(178, 190, 195, 255))
    return add_glow(img, (0, 206, 201), radius=18)

def gen_ice_swarm():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    for ox, oy in [(-50, -40), (50, -40), (0, 50)]:
        cx, cy = CENTER + ox, CENTER + oy
        d.polygon([(cx-40, cy), (cx, cy-30), (cx+40, cy), (cx, cy+30)], fill=(0, 206, 201, 240), outline=(255, 255, 255, 255), width=3)
    return add_glow(img, (0, 206, 201), radius=14)

# ─── BIOME 6: FIRE NEBULA ─────────────────────────────────────────────────────
def gen_ember_sprite():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.ellipse([170, 170, 342, 342], fill=(230, 126, 34, 255), outline=(243, 156, 18, 255), width=5)
    d.ellipse([216, 216, 296, 296], fill=(255, 235, 59, 255), outline=(255, 255, 255, 255), width=3)
    return add_glow(img, (255, 87, 34), radius=18)

def gen_magma_wasp():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(120, 256), (200, 210), (360, 220), (430, 256), (360, 292), (200, 302)], fill=(214, 48, 49, 255), outline=(243, 156, 18, 255), width=5)
    d.polygon([(200, 210), (260, 100), (370, 160)], fill=(230, 126, 34, 220), outline=(255, 235, 59, 255), width=3)
    d.polygon([(200, 302), (260, 412), (370, 352)], fill=(230, 126, 34, 220), outline=(255, 235, 59, 255), width=3)
    return add_glow(img, (243, 156, 18), radius=16)

def gen_lava_golem():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(140, 256), (220, 140), (410, 150), (460, 256), (410, 362), (220, 372)], fill=(45, 52, 54, 255), outline=(214, 48, 49, 255), width=7)
    d.ellipse([240, 220, 310, 292], fill=(255, 100, 0, 255), outline=(255, 235, 59, 255), width=4)
    return add_glow(img, (214, 48, 49), radius=18)

def gen_inferno_node():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.ellipse([CENTER-90, CENTER-90, CENTER+90, CENTER+90], fill=(180, 20, 20, 255), outline=(255, 160, 0, 255), width=6)
    d.ellipse([CENTER-40, CENTER-40, CENTER+40, CENTER+40], fill=(255, 235, 59, 255))
    return add_glow(img, (255, 100, 0), radius=18)

# ─── BIOME 7: STORM BELT ──────────────────────────────────────────────────────
def gen_static_spark():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(CENTER-80, CENTER), (CENTER, CENTER-80), (CENTER+80, CENTER), (CENTER, CENTER+80)], fill=(254, 211, 48, 255), outline=(255, 255, 255, 255), width=4)
    for a in [45, 135, 225, 315]:
        rad = math.radians(a)
        d.line([(CENTER, CENTER), (CENTER + math.cos(rad)*150, CENTER + math.sin(rad)*150)], fill=(69, 170, 242, 255), width=5)
    return add_glow(img, (254, 211, 48), radius=16)

def gen_storm_hawk():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(110, 256), (220, 200), (370, 210), (430, 256), (370, 302), (220, 312)], fill=(32, 191, 107, 255), outline=(254, 211, 48, 255), width=5)
    d.polygon([(220, 200), (280, 80), (380, 140)], fill=(69, 170, 242, 220), outline=(255, 255, 255, 255), width=3)
    d.polygon([(220, 312), (280, 432), (380, 372)], fill=(69, 170, 242, 220), outline=(255, 255, 255, 255), width=3)
    return add_glow(img, (69, 170, 242), radius=16)

def gen_thunderhead():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(130, 256), (210, 140), (410, 150), (460, 256), (410, 362), (210, 372)], fill=(43, 58, 66, 255), outline=(254, 211, 48, 255), width=7)
    d.ellipse([240, 220, 320, 292], fill=(254, 211, 48, 255), outline=(255, 255, 255, 255), width=4)
    return add_glow(img, (254, 211, 48), radius=18)

def gen_storm_sentinel():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(120, 256), (256, 150), (392, 256), (256, 362)], fill=(30, 39, 46, 255), outline=(69, 170, 242, 255), width=6)
    d.ellipse([216, 216, 296, 296], fill=(254, 211, 48, 255), outline=(255, 255, 255, 255), width=3)
    return add_glow(img, (69, 170, 242), radius=16)

# ─── BIOME 8: DERELICT FLEET ──────────────────────────────────────────────────
def gen_salvage_drone():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(150, 256), (230, 190), (370, 200), (410, 256), (370, 312), (230, 322)], fill=(47, 53, 66, 255), outline=(46, 213, 115, 255), width=5)
    d.ellipse([180, 240, 210, 272], fill=(255, 165, 2, 255))
    return add_glow(img, (46, 213, 115), radius=15)

def gen_ghost_fighter():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(110, 256), (200, 210), (380, 220), (440, 256), (380, 292), (200, 302)], fill=(30, 60, 45, 220), outline=(123, 237, 159, 255), width=5)
    d.polygon([(200, 210), (280, 90), (360, 150)], fill=(46, 213, 115, 200), outline=(255, 255, 255, 255), width=3)
    d.polygon([(200, 302), (280, 422), (360, 362)], fill=(46, 213, 115, 200), outline=(255, 255, 255, 255), width=3)
    return add_glow(img, (123, 237, 159), radius=16)

def gen_turret_battery():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.ellipse([160, 160, 392, 392], fill=(47, 53, 66, 255), outline=(46, 213, 115, 255), width=7)
    for y in [200, 236, 276, 312]:
        d.rectangle([80, y-8, 220, y+8], fill=(30, 39, 46, 255), outline=(255, 165, 2, 255), width=2)
    return add_glow(img, (46, 213, 115), radius=18)

def gen_fleet_turret():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(160, 256), (240, 180), (370, 190), (410, 256), (370, 322), (240, 332)], fill=(47, 53, 66, 255), outline=(46, 213, 115, 255), width=5)
    d.rectangle([100, 246, 180, 266], fill=(46, 213, 115, 255))
    return add_glow(img, (46, 213, 115), radius=15)

# ─── BIOME 9: XENOMORPH HIVE ──────────────────────────────────────────────────
def gen_crawler():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(130, 256), (200, 200), (370, 210), (430, 256), (370, 302), (200, 312)], fill=(45, 52, 54, 255), outline=(0, 184, 148, 255), width=5)
    for y in [180, 220, 292, 332]:
        d.line([(240, y), (170, y - 40), (130, y - 20)], fill=(108, 92, 231, 255), width=6)
    return add_glow(img, (0, 184, 148), radius=16)

def gen_spitter():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(120, 256), (220, 180), (370, 190), (440, 256), (370, 322), (220, 332)], fill=(108, 92, 231, 255), outline=(0, 184, 148, 255), width=6)
    d.ellipse([140, 230, 200, 282], fill=(0, 184, 148, 255))
    return add_glow(img, (0, 184, 148), radius=16)

def gen_brute():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(130, 256), (220, 130), (420, 140), (470, 256), (420, 372), (220, 382)], fill=(45, 52, 54, 255), outline=(108, 92, 231, 255), width=7)
    d.polygon([(130, 256), (240, 180), (240, 332)], fill=(0, 184, 148, 255))
    return add_glow(img, (108, 92, 231), radius=18)

def gen_hive_node():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.ellipse([CENTER-90, CENTER-90, CENTER+90, CENTER+90], fill=(80, 20, 100, 255), outline=(0, 184, 148, 255), width=6)
    d.ellipse([CENTER-45, CENTER-45, CENTER+45, CENTER+45], fill=(0, 184, 148, 255), outline=(255, 255, 255, 255), width=3)
    return add_glow(img, (0, 184, 148), radius=18)

# ─── BIOME 10: CORE RIFT / EVENT HORIZON ──────────────────────────────────────
def gen_glitch_fragment():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    # Fractal glitch fragments
    for ox, oy in [(-30, -30), (30, -20), (-20, 40), (40, 30)]:
        d.rectangle([CENTER+ox-40, CENTER+oy-30, CENTER+ox+40, CENTER+oy+30], fill=(232, 67, 147, 240), outline=(255, 255, 255, 255), width=3)
    d.ellipse([CENTER-30, CENTER-30, CENTER+30, CENTER+30], fill=(87, 95, 207, 255))
    return add_glow(img, (232, 67, 147), radius=18)

def gen_paradox_wisp():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.ellipse([CENTER-80, CENTER-80, CENTER+80, CENTER+80], fill=(30, 39, 46, 240), outline=(232, 67, 147, 255), width=5)
    d.ellipse([CENTER-40, CENTER-40, CENTER+40, CENTER+40], fill=(247, 183, 49, 255))
    return add_glow(img, (232, 67, 147), radius=18)

def gen_null_entity():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(140, 256), (220, 130), (410, 140), (460, 256), (410, 372), (220, 382)], fill=(10, 10, 20, 255), outline=(232, 67, 147, 255), width=7)
    d.ellipse([230, 206, 330, 306], fill=(0, 0, 0, 255), outline=(247, 183, 49, 255), width=4)
    return add_glow(img, (232, 67, 147), radius=20)

def gen_rift_aberration():
    img = create_base_canvas()
    d = ImageDraw.Draw(img)
    d.polygon([(110, 256), (256, 140), (402, 256), (256, 372)], fill=(87, 95, 207, 220), outline=(232, 67, 147, 255), width=6)
    d.ellipse([216, 216, 296, 296], fill=(255, 255, 255, 255))
    return add_glow(img, (232, 67, 147), radius=18)


GENERATORS = {
    # Biome 1
    "enemy_angler_scout_0": gen_angler_scout,
    "enemy_jelly_interceptor_0": gen_jelly_interceptor,
    "enemy_vent_crab_heavy_0": gen_vent_crab_heavy,
    "enemy_trench_eel_0": gen_trench_eel,
    "enemy_b1_crawler_0": gen_angler_scout,
    
    # Biome 2
    "enemy_rust_drone_0": gen_rust_drone,
    "enemy_coral_wasp_0": gen_coral_wasp,
    "enemy_armored_eel_0": gen_armored_eel,
    "enemy_spine_urchin_0": gen_spine_urchin,
    "enemy_b2_wraith_0": gen_rust_drone,
    
    # Biome 3
    "enemy_sparker_0": gen_sparker,
    "enemy_sentinel_0": gen_sentinel,
    "enemy_juggernaut_0": gen_juggernaut,
    "enemy_boss_minion_0": gen_boss_minion,
    "enemy_b3_spider_0": gen_sparker,
    
    # Biome 4
    "enemy_plasma_wisp_0": gen_plasma_wisp,
    "enemy_storm_sprite_0": gen_storm_sprite,
    "enemy_gas_giant_0": gen_gas_giant,
    "enemy_nebula_wraith_0": gen_nebula_wraith,
    "enemy_b4_wisp_0": gen_plasma_wisp,
    "enemy_b4_rider_0": gen_storm_sprite,
    "enemy_b4_serpent_0": gen_gas_giant,
    
    # Biome 5
    "enemy_ice_shard_0": gen_ice_shard,
    "enemy_frost_drone_0": gen_frost_drone,
    "enemy_glacier_0": gen_glacier,
    "enemy_ice_swarm_0": gen_ice_swarm,
    
    # Biome 6
    "enemy_ember_sprite_0": gen_ember_sprite,
    "enemy_magma_wasp_0": gen_magma_wasp,
    "enemy_lava_golem_0": gen_lava_golem,
    "enemy_inferno_node_0": gen_inferno_node,
    
    # Biome 7
    "enemy_static_spark_0": gen_static_spark,
    "enemy_storm_hawk_0": gen_storm_hawk,
    "enemy_thunderhead_0": gen_thunderhead,
    "enemy_storm_sentinel_0": gen_storm_sentinel,
    
    # Biome 8
    "enemy_salvage_drone_0": gen_salvage_drone,
    "enemy_ghost_fighter_0": gen_ghost_fighter,
    "enemy_turret_battery_0": gen_turret_battery,
    "enemy_fleet_turret_0": gen_fleet_turret,
    
    # Biome 9
    "enemy_crawler_0": gen_crawler,
    "enemy_spitter_0": gen_spitter,
    "enemy_brute_0": gen_brute,
    "enemy_hive_node_0": gen_hive_node,
    
    # Biome 10
    "enemy_glitch_fragment_0": gen_glitch_fragment,
    "enemy_paradox_wisp_0": gen_paradox_wisp,
    "enemy_null_entity_0": gen_null_entity,
    "enemy_rift_aberration_0": gen_rift_aberration,
}

def generate_all_enemy_sprites():
    print("=" * 60)
    print("DARIUS STAR: GENERATING HIGH-RESOLUTION STRATUM ENEMY SPRITES")
    print(f"Target Directory: {SPRITES_DIR}")
    print(f"Total Unique Assets: {len(GENERATORS)}")
    print("=" * 60)
    
    count = 0
    for filename, gen_fn in GENERATORS.items():
        out_path = SPRITES_DIR / f"{filename}.png"
        img = gen_fn()
        img.save(out_path, format="PNG")
        size_bytes = out_path.stat().st_size
        print(f"  [OK] {filename}.png ({img.size[0]}x{img.size[1]} RGBA): {size_bytes} bytes")
        count += 1
        
    print("=" * 60)
    print(f"Generation Complete: {count}/{len(GENERATORS)} enemy sprites generated successfully.")
    print("=" * 60)

if __name__ == "__main__":
    generate_all_enemy_sprites()
