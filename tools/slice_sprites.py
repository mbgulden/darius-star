#!/usr/bin/env python3
import os
import json
import argparse
import glob
from PIL import Image

def get_category(filename):
    name = os.path.basename(filename).lower()
    if name.startswith('player_') or any(s in name for s in ['phantom', 'specter', 'tempest', 'bastion']):
        return 'player'
    if any(s in name for s in ['enemy_', 'midboss_', 'unique_', 'boss_']):
        return 'enemy'
    if any(s in name for s in ['explosion_', 'sfx_']):
        return 'vfx'
    if 'portrait' in name:
        return 'portrait'
    if 'biome' in name:
        return 'biome'
    return 'other'

def is_line_empty(img, y=None, x=None, threshold=20):
    """Checks if a row or column is 'empty' (all pixels below threshold)."""
    width, height = img.size
    if y is not None:
        for xi in range(width):
            pixel = img.getpixel((xi, y))
            if any(c > threshold for c in pixel[:3]):
                return False
        return True
    if x is not None:
        for yi in range(height):
            pixel = img.getpixel((x, yi))
            if any(c > threshold for c in pixel[:3]):
                return False
        return True
    return False

def guess_grid(img, filename):
    width, height = img.size
    name = os.path.basename(filename).lower()
    
    if 'portrait' in name:
        return 1, 1
    
    # Common patterns: 1×1, 2×2, 4×4, 2×1, 1×2, 4×2, 8×4, 8×8
    patterns = [(1,1), (2,2), (4,4), (2,1), (1,2), (4,2), (8,4), (8,8)]
    
    # If it's a biome strip, it might be 1xN or Nx1. 
    # Usually they are wide, so maybe 4x1 or 8x1? The prompt says "single wide strips".
    if 'biome' in name:
        if width > height * 2:
            # Try to guess based on aspect ratio
            for cols in [8, 4, 2]:
                if width % cols == 0:
                    return cols, 1
        return 1, 1

    # For other sprites, try to see if they fit the patterns
    # We can rank patterns by checking if their grid lines are empty
    best_pattern = (1, 1)
    max_empty_score = -1
    
    rgb_img = img.convert("RGB")
    
    for cols, rows in patterns:
        if cols == 1 and rows == 1:
            continue
            
        if width % cols != 0 or height % rows != 0:
            continue
            
        frame_w = width // cols
        frame_h = height // rows
        
        score = 0
        # Check vertical lines
        for c in range(1, cols):
            if is_line_empty(rgb_img, x=c * frame_w):
                score += 1
        # Check horizontal lines
        for r in range(1, rows):
            if is_line_empty(rgb_img, y=r * frame_h):
                score += 1
                
        if score > max_empty_score:
            max_empty_score = score
            best_pattern = (cols, rows)
        elif score == max_empty_score and score > 0:
            # Prefer smaller grid if scores are equal? 
            # Or maybe prefer larger? Usually sprites are tightly packed.
            if cols * rows > best_pattern[0] * best_pattern[1]:
                best_pattern = (cols, rows)

    # Heuristics if no empty lines found
    if max_empty_score <= 0:
        if width == height and width >= 512:
            if 'player' in name: return 4, 4
            if 'enemy' in name or 'explosion' in name: return 2, 2
        
    return best_pattern

def remove_background(img, threshold=25):
    """Converts dark pixels to transparent."""
    img = img.convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # If R, G, and B are all below threshold, make it transparent
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    return img

def main():
    parser = argparse.ArgumentParser(description='Sprite sheet slicing tool')
    parser.add_argument('--dry-run', action='store_true', help='Do not save sliced frames')
    parser.add_argument('--category', default='all', help='Category to process: player|enemy|vfx|portrait|biome|all')
    args = parser.parse_args()

    sprites_dir = 'assets/sprites'
    output_base = 'assets/sprites'
    
    # We look for pngs directly in assets/sprites/
    all_sheets = glob.glob(os.path.join(sprites_dir, '*.png'))
    metadata = {
        "manifest_version": "1.1",
        "generated_at": "2024-06-11T00:00:00Z", # Placeholder
        "sheets": {}
    }

    processed_count = 0
    for sheet_path in sorted(all_sheets):
        # Skip already sliced frames if we are re-running
        if '_frame_' in sheet_path:
            continue
            
        category = get_category(sheet_path)
        if args.category != 'all' and category != args.category:
            continue
            
        print(f"Processing {sheet_path} (Category: {category})...")
        
        try:
            with Image.open(sheet_path) as img:
                width, height = img.size
                cols, rows = guess_grid(img, sheet_path)
                frame_width = width // cols
                frame_height = height // rows
                frame_count = cols * rows
                
                sheet_name = os.path.splitext(os.path.basename(sheet_path))[0]
                
                metadata["sheets"][sheet_name] = {
                    "filename": os.path.basename(sheet_path),
                    "category": category,
                    "grid_size": [cols, rows],
                    "frame_count": frame_count,
                    "frame_dimensions": [frame_width, frame_height],
                    "frames": []
                }

                category_dir = os.path.join(output_base, category)
                if not args.dry_run and not os.path.exists(category_dir):
                    os.makedirs(category_dir)

                for r in range(rows):
                    for c in range(cols):
                        idx = r * cols + c
                        left = c * frame_width
                        top = r * frame_height
                        right = left + frame_width
                        bottom = top + frame_height
                        
                        frame = img.crop((left, top, right, bottom))
                        
                        # Check if frame is empty before saving? 
                        # Actually, just save it.
                        frame = remove_background(frame)
                        
                        frame_filename = f"{sheet_name}_frame_{idx:02d}.png"
                        frame_rel_path = os.path.join(category, frame_filename)
                        frame_full_path = os.path.join(output_base, frame_rel_path)
                        
                        if not args.dry_run:
                            frame.save(frame_full_path)
                        
                        metadata["sheets"][sheet_name]["frames"].append({
                            "path": f"assets/sprites/{frame_rel_path}",
                            "index": idx,
                            "width": frame_width,
                            "height": frame_height
                        })
                
                processed_count += 1
                print(f"  Sliced into {frame_count} frames ({cols}x{rows})")
        except Exception as e:
            print(f"  Error processing {sheet_path}: {e}")

    if not args.dry_run and processed_count > 0:
        with open(os.path.join(output_base, 'sprites.json'), 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f"Generated {os.path.join(output_base, 'sprites.json')}")

if __name__ == "__main__":
    main()
