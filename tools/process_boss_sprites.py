import os
import shutil
from PIL import Image
from collections import deque

# Input paths from generate_image
INPUT_MAP = {
    "boss_idle.png": "/home/ubuntu/.gemini/antigravity-cli/brain/c36aec2f-82ce-4087-b0a2-9e294762cef4/boss_idle_1781280091375.png",
    "boss_rage.png": "/home/ubuntu/.gemini/antigravity-cli/brain/c36aec2f-82ce-4087-b0a2-9e294762cef4/boss_rage_1781280128306.png",
    "boss_charge.png": "/home/ubuntu/.gemini/antigravity-cli/brain/c36aec2f-82ce-4087-b0a2-9e294762cef4/boss_charge_1781280140814.png",
    "boss_fire.png": "/home/ubuntu/.gemini/antigravity-cli/brain/c36aec2f-82ce-4087-b0a2-9e294762cef4/boss_fire_1781280153713.png",
    "boss_death.png": "/home/ubuntu/.gemini/antigravity-cli/brain/c36aec2f-82ce-4087-b0a2-9e294762cef4/boss_death_1781280170939.png"
}

SPRITES_DIR = "/home/ubuntu/work/darius-star/assets/sprites"
SPRITE_DIR = "/home/ubuntu/work/darius-star/assets/sprite"

def is_background_color(r, g, b):
    # Checkerboard colors are grey-like.
    diff = max(r, g, b) - min(r, g, b)
    avg = (r + g + b) / 3
    # Checkerboard greys are in range [50, 220] across all states
    if diff <= 12 and (50 <= avg <= 220):
        return True
    if diff <= 5 and (40 <= avg <= 230):
        return True
    return False

def remove_background(img_path, output_path):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    queue = deque()
    visited = set()
    
    # Initialize queue with border pixels
    for x in range(width):
        for y in [0, height - 1]:
            r, g, b, a = pixels[x, y]
            if is_background_color(r, g, b):
                queue.append((x, y))
                visited.add((x, y))
    for y in range(height):
        for x in [0, width - 1]:
            r, g, b, a = pixels[x, y]
            if is_background_color(r, g, b) and (x, y) not in visited:
                queue.append((x, y))
                visited.add((x, y))
                
    # BFS to flood-fill background to transparent
    while queue:
        cx, cy = queue.popleft()
        r, g, b, a = pixels[cx, cy]
        pixels[cx, cy] = (r, g, b, 0)
        
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    nr, ng, nb, na = pixels[nx, ny]
                    if is_background_color(nr, ng, nb):
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
    img.save(output_path, "PNG")
    print(f"Processed {os.path.basename(img_path)} -> {output_path} (cleared {len(visited)} background pixels)")

def main():
    os.makedirs(SPRITES_DIR, exist_ok=True)
    os.makedirs(SPRITE_DIR, exist_ok=True)
    
    for filename, src_path in INPUT_MAP.items():
        dst_sprites = os.path.join(SPRITES_DIR, filename)
        dst_sprite = os.path.join(SPRITE_DIR, filename)
        
        # Remove background and save to assets/sprites
        remove_background(src_path, dst_sprites)
        
        # Copy to assets/sprite
        shutil.copy2(dst_sprites, dst_sprite)
        print(f"Copied {filename} to {dst_sprite}")

if __name__ == '__main__':
    main()
