#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw

def generate_boss():
    """Procedurally generates a boss sprite (boss_0.png)."""
    target_path = "assets/sprites/boss_0.png"
    os.makedirs(os.path.dirname(target_path), exist_ok=True)

    # 128x128 Red Colossal Boss
    width, height = 128, 128
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    # Draw a more "boss-like" shape than just a circle
    # A large diamond/shield shape
    points = [
        (64, 10),   # Top
        (118, 64),  # Right
        (64, 118),  # Bottom
        (10, 64)    # Left
    ]
    draw.polygon(points, fill=(200, 0, 0, 255), outline=(255, 255, 255, 255))

    # Add some "glowing" eyes
    draw.ellipse([40, 40, 55, 55], fill=(255, 255, 0, 255))
    draw.ellipse([73, 40, 88, 55], fill=(255, 255, 0, 255))

    image.save(target_path, "PNG")
    print(f"Generated boss sprite: {target_path}")

if __name__ == "__main__":
    generate_boss()
