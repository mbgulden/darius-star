#!/usr/bin/env python3
"""Script to add a subtle neon techno glow effect to specific sprites."""
import os
from PIL import Image, ImageFilter

def main():
    # Setup working directory to repository root
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(repo_root)

    sprites_dir = "assets/sprites"
    
    # Define targets and their glow colors
    # Cyan: (0, 255, 255, 38) -> #00FFFF at 15% opacity (38/255)
    # Blue: (0, 136, 255, 38) -> #0088FF at 15% opacity (38/255)
    cyan_glow = (0, 255, 255, 38)
    blue_glow = (0, 136, 255, 38)
    
    targets = [
        ("player_0.png", cyan_glow),
        ("player_1.png", cyan_glow),
        ("laser_0.png", cyan_glow),
        ("shield_0.png", blue_glow)
    ]
    
    for filename, glow_color in targets:
        filepath = os.path.join(sprites_dir, filename)
        if not os.path.exists(filepath):
            print(f"⚠️  Target {filename} not found at {filepath}, skipping.")
            continue
            
        print(f"Adding glow to {filename}...")
        try:
            img = Image.open(filepath).convert("RGBA")
        except Exception as e:
            print(f"❌ Error opening {filename}: {e}")
            continue
            
        # Get alpha channel (mask)
        r, g, b, alpha = img.split()
        
        # Dilate mask by 2px using MaxFilter with size 5
        dilated_alpha = alpha.filter(ImageFilter.MaxFilter(5))
        
        # Create solid color image for the glow
        glow_solid = Image.new("RGBA", img.size, glow_color)
        
        # Paste solid glow color using dilated mask
        glow_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        glow_layer.paste(glow_solid, (0, 0), mask=dilated_alpha)
        
        # Overlay original image on top of the glow layer
        final_img = Image.alpha_composite(glow_layer, img)
        
        # Save with _glow suffix
        name_parts = os.path.splitext(filename)
        output_filename = f"{name_parts[0]}_glow{name_parts[1]}"
        output_filepath = os.path.join(sprites_dir, output_filename)
        
        final_img.save(output_filepath, "PNG")
        print(f"✅ Saved glow sprite: {output_filepath}")

if __name__ == "__main__":
    main()
