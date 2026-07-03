import os
import json
import re
from datetime import datetime, timezone
from PIL import Image

# Expected game assets for missing asset detection
EXPECTED_ASSETS = [
    'player',
    'scout',
    'interceptor',
    'heavy',
    'boss_minion',
    'boss',
    'laser',
    'powerup_w',
    'powerup_s',
    'explosion'
]

def is_power_of_two(n):
    """Returns True if n is a power of two, otherwise False."""
    return n > 0 and (n & (n - 1)) == 0

def scan_and_generate_manifest(sprites_dir, output_file):
    print(f"Scanning directory: {sprites_dir}")
    
    if not os.path.exists(sprites_dir):
        os.makedirs(sprites_dir, exist_ok=True)
        print(f"Created empty directory: {sprites_dir}")
        
    # Get all image files in directory
    valid_extensions = ('.png', '.jpg', '.jpeg')
    files = [f for f in os.listdir(sprites_dir) if f.lower().endswith(valid_extensions)]
    files.sort()
    
    sprites_data = {}
    errors = []
    warnings = []
    
    total_files_scanned = len(files)
    valid_power_of_two_count = 0
    invalid_power_of_two_count = 0
    
    # Naming pattern: prefix_index.ext (e.g. player_0.png)
    name_pattern = re.compile(r"^([a-zA-Z_]+)_(\d+)\.(png|jpg|jpeg)$", re.IGNORECASE)
    
    for filename in files:
        filepath = os.path.join(sprites_dir, filename)
        
        # Determine image dimensions using Pillow
        try:
            with Image.open(filepath) as img:
                width, height = img.size
        except Exception as e:
            errors.append(f"Could not open image file '{filename}': {str(e)}")
            continue
            
        # Validate power-of-two dimensions
        w_pot = is_power_of_two(width)
        h_pot = is_power_of_two(height)
        is_pot = w_pot and h_pot
        
        if is_pot:
            valid_power_of_two_count += 1
        else:
            invalid_power_of_two_count += 1
            errors.append(f"Asset '{filename}' has non-power-of-two dimensions: {width}x{height}")
            
        # Parse prefix and index
        match = name_pattern.match(filename)
        if match:
            prefix = match.group(1).lower()
            frame_idx = int(match.group(2))
        else:
            # Fallback if the naming format doesn't match prefix_index.ext
            # Treat the whole filename (sans ext) as prefix and index 0
            prefix = os.path.splitext(filename)[0].lower()
            frame_idx = 0
            warnings.append(f"Filename '{filename}' does not follow standard 'prefix_index.ext' naming convention. Defaulted to prefix '{prefix}', index {frame_idx}")
            
        # Initialize sprite group if not exists
        if prefix not in sprites_data:
            sprites_data[prefix] = {
                "frames": [],
                "frame_count": 0,
                "width": width,
                "height": height,
                "is_valid_power_of_two": True
            }
            
        # Check for dimension consistency in animation frames
        sprite_group = sprites_data[prefix]
        if sprite_group["width"] != width or sprite_group["height"] != height:
            warnings.append(f"Dimension mismatch in animation group '{prefix}': frame '{filename}' is {width}x{height}, expected {sprite_group['width']}x{sprite_group['height']}")
            
        # Update power of two validation status for the group
        if not is_pot:
            sprite_group["is_valid_power_of_two"] = False
            
        # Add frame details
        # Store path relative to project root (e.g. assets/sprites/player_0.png)
        relative_path = os.path.relpath(filepath, start=os.path.dirname(os.path.dirname(sprites_dir)))
        sprite_group["frames"].append({
            "index": frame_idx,
            "filename": filename,
            "path": relative_path,
            "width": width,
            "height": height,
            "is_power_of_two": is_pot
        })
        
    # Finalize frames: sort by index and update counts
    for prefix, group in sprites_data.items():
        group["frames"].sort(key=lambda x: x["index"])
        group["frame_count"] = len(group["frames"])
        
    # Missing asset detection
    missing_assets = []
    for expected in EXPECTED_ASSETS:
        if expected not in sprites_data:
            missing_assets.append(expected)
            
    # Compile manifest
    manifest = {
        "manifest_version": "1.0",
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "sprites": sprites_data,
        "validation": {
            "total_files_scanned": total_files_scanned,
            "valid_power_of_two_count": valid_power_of_two_count,
            "invalid_power_of_two_count": invalid_power_of_two_count,
            "errors": errors,
            "warnings": warnings,
            "missing_assets": missing_assets
        }
    }
    
    # Write to output file
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)
        
    print(f"Generated manifest: {output_file}")
    print(f"Scanned files: {total_files_scanned}")
    print(f"Power-of-two validation: {valid_power_of_two_count} passed, {invalid_power_of_two_count} failed")
    print(f"Missing assets: {len(missing_assets)}")

def main():
    project_dir = os.path.dirname(os.path.abspath(__file__))
    sprites_dir = os.path.join(project_dir, "assets/sprites")
    output_file = os.path.join(project_dir, "assets/sprites.json")
    
    scan_and_generate_manifest(sprites_dir, output_file)

if __name__ == "__main__":
    main()
