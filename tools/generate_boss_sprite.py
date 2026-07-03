import os
import sys
from PIL import Image, ImageDraw

def main():
    """
    Generates a procedural Cyber Coelacanth boss sprite.
    Output: assets/boss_0.png (512x512) and assets/boss_0_small.png (256x256)
    """
    # Parameters
    size = 512
    small_size = 256
    canvas_size = 128 # Drawing at 128x128 and scaling up for pixel art look

    # Colors (RGBA)
    c_dark1 = (26, 26, 46, 255)    # #1a1a2e
    c_dark2 = (22, 33, 62, 255)    # #16213e
    c_dark3 = (15, 52, 96, 255)    # #0f3460
    c_neon1 = (0, 255, 255, 255)   # #00ffff (Neon Cyan)
    c_neon2 = (0, 188, 212, 255)   # #00bcd4 (Neon Cyan Accent)
    c_red   = (255, 51, 51, 255)   # #ff3333 (Red Eye)
    c_plasma = (255, 102, 0, 255)  # #ff6600 (Orange Plasma)
    c_border = (40, 40, 70, 255)   # Dark border
    c_highlight = (80, 80, 120, 255)

    # Create canvas
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # --- Cyber Coelacanth Design (Facing Left) ---

    # 1. Main Body Hull - Segmented Armor Plates
    # Head segment
    head_poly = [(10, 64), (25, 42), (45, 42), (55, 64), (45, 86), (25, 86)]
    draw.polygon(head_poly, fill=c_dark1, outline=c_border)

    # Mid segment 1
    mid1_poly = [(55, 64), (45, 42), (75, 45), (80, 64), (75, 83), (45, 86)]
    draw.polygon(mid1_poly, fill=c_dark2, outline=c_border)

    # Mid segment 2
    mid2_poly = [(80, 64), (75, 45), (100, 50), (105, 64), (100, 78), (75, 83)]
    draw.polygon(mid2_poly, fill=c_dark3, outline=c_border)

    # Tail base segment
    tail_base_poly = [(105, 64), (100, 50), (115, 58), (120, 64), (115, 70), (100, 78)]
    draw.polygon(tail_base_poly, fill=c_dark1, outline=c_border)

    # 2. Mechanical Fins
    # Primary Dorsal Fin (Top)
    dorsal1 = [(50, 42), (70, 15), (90, 47)]
    draw.polygon(dorsal1, fill=c_dark2, outline=c_neon1)
    draw.line([(50, 42), (70, 15)], fill=c_neon2, width=1) # Leading edge highlight

    # Secondary Dorsal Fin (Back)
    dorsal2 = [(95, 50), (105, 35), (115, 58)]
    draw.polygon(dorsal2, fill=c_dark3, outline=c_neon1)

    # Pectoral Fin (Side/Front)
    pec_fin = [(35, 68), (60, 95), (45, 105), (25, 80)]
    draw.polygon(pec_fin, fill=c_dark3, outline=c_neon2)
    draw.line([(35, 68), (45, 105)], fill=c_neon1, width=1) # Mechanical joint

    # Pelvic Fin (Bottom/Front)
    pelvic = [(65, 83), (85, 105), (95, 82)]
    draw.polygon(pelvic, fill=c_dark2, outline=c_neon2)

    # Anal Fin (Bottom/Back)
    anal = [(100, 78), (115, 95), (120, 70)]
    draw.polygon(anal, fill=c_dark3, outline=c_neon2)

    # 3. Triple-Lobed Caudal Fin (Tail)
    # Upper lobe
    draw.polygon([(120, 64), (127, 40), (122, 60)], fill=c_dark1, outline=c_neon1)
    # Lower lobe
    draw.polygon([(120, 64), (127, 88), (122, 68)], fill=c_dark1, outline=c_neon1)
    # Middle lobe (supplementary)
    draw.polygon([(122, 64), (127, 64), (122, 64)], fill=c_neon1, outline=c_neon1)
    draw.line([(120, 64), (127, 64)], fill=c_neon1, width=1)

    # 4. Weapons and Tech
    # Front-facing Plasma Railgun
    draw.rectangle([2, 58, 12, 70], fill=(30, 30, 50, 255), outline=c_neon1)
    draw.rectangle([0, 62, 5, 66], fill=c_plasma) # Railgun Muzzle/Glow
    draw.line([(5, 64), (15, 64)], fill=c_plasma, width=1) # Barrel energy line

    # Glowing Red Eye
    draw.rectangle([18, 54, 23, 59], fill=c_red)
    # Eye glow effect (small)
    draw.point([(17, 56), (18, 53), (23, 53), (24, 56), (18, 60), (23, 60)], fill=c_red)

    # Neon Exhaust Ports
    for x in [50, 70, 90]:
        # Top exhaust
        draw.rectangle([x, 50, x+6, 54], fill=c_neon1)
        # Bottom exhaust
        draw.rectangle([x, 74, x+6, 78], fill=c_neon1)

    # Detail: Armor highlights and panels
    # Vertical plate lines
    draw.line([(45, 42), (45, 86)], fill=c_border, width=1)
    draw.line([(75, 45), (75, 83)], fill=c_border, width=1)
    draw.line([(100, 50), (100, 78)], fill=c_border, width=1)

    # Horizontal tech lines
    draw.line([(25, 64), (100, 64)], fill=c_highlight, width=1)

    # --- Final Processing ---

    # Scale up with Nearest Neighbor to maintain pixel art sharpness
    img_final = img.resize((size, size), resample=Image.NEAREST)

    # Ensure assets directory exists
    os.makedirs("assets", exist_ok=True)

    # Save primary sprite
    output_path = "assets/boss_0.png"
    img_final.save(output_path, "PNG")

    # Save small version
    output_path_small = "assets/boss_0_small.png"
    img_small = img_final.resize((small_size, small_size), resample=Image.NEAREST)
    img_small.save(output_path_small, "PNG")

    print(f"Success: Generated Cyber Coelacanth boss sprite.")
    print(f" - Main: {output_path} ({size}x{size})")
    print(f" - Small: {output_path_small} ({small_size}x{small_size})")

if __name__ == "__main__":
    main()
