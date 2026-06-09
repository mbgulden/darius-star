#!/usr/bin/env python3
"""Script to remove solid backgrounds from sprites and convert them to RGBA transparency."""
import os
import glob
from collections import Counter
from PIL import Image

def main():
    # Setup working directory to repository root
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(repo_root)

    sprites_dir = "assets/sprites"
    png_files = sorted(glob.glob(os.path.join(sprites_dir, "*.png")))
    
    print(f"Found {len(png_files)} PNG files in {sprites_dir}.")
    
    for filepath in png_files:
        filename = os.path.basename(filepath)
        
        # Open image
        try:
            img = Image.open(filepath)
        except Exception as e:
            print(f"❌ Error opening {filename}: {e}")
            continue
            
        # Skip files already in RGBA mode
        if img.mode == 'RGBA':
            print(f"⏭️  Skipping {filename} (already RGBA)")
            continue
            
        print(f"⚙️  Processing {filename} (mode: {img.mode})...")
        
        # Convert to RGBA
        rgba_img = img.convert('RGBA')
        w, h = rgba_img.size
        
        # Edge sampling to find background color
        edge_pixels = []
        for x in range(w):
            edge_pixels.append(rgba_img.getpixel((x, 0)))
            edge_pixels.append(rgba_img.getpixel((x, h - 1)))
        for y in range(1, h - 1):
            edge_pixels.append(rgba_img.getpixel((0, y)))
            edge_pixels.append(rgba_img.getpixel((w - 1, y)))
            
        rgb_edge_pixels = [(p[0], p[1], p[2]) for p in edge_pixels]
        counter = Counter(rgb_edge_pixels)
        bg_color, bg_count = counter.most_common(1)[0]
        
        print(f"   Detected background color: {bg_color} (sampled {bg_count} times on edges)")
        
        # Determine if dark background (all channels < 70)
        is_dark = bg_color[0] < 70 and bg_color[1] < 70 and bg_color[2] < 70
        
        # Load pixels
        pixels = list(rgba_img.getdata())
        new_pixels = []
        
        if is_dark:
            print("   Classification: Dark/near-black background sprite.")
            # Set alpha=0 where close to black (R<20, G<20, B<20) OR close to detected bg color (tolerance 20)
            for p in pixels:
                r, g, b, a = p
                close_to_black = (r < 20 and g < 20 and b < 20)
                close_to_bg = (abs(r - bg_color[0]) < 20 and 
                               abs(g - bg_color[1]) < 20 and 
                               abs(b - bg_color[2]) < 20)
                               
                if close_to_black or close_to_bg:
                    new_pixels.append((r, g, b, 0))
                else:
                    new_pixels.append((r, g, b, a))
        else:
            print("   Classification: White/light background sprite.")
            # Set alpha=0 where close to detected bg color (tolerance 20)
            for p in pixels:
                r, g, b, a = p
                close_to_bg = (abs(r - bg_color[0]) < 20 and 
                               abs(g - bg_color[1]) < 20 and 
                               abs(b - bg_color[2]) < 20)
                if close_to_bg:
                    new_pixels.append((r, g, b, 0))
                else:
                    new_pixels.append((r, g, b, a))
                    
        # Put pixels back and save
        rgba_img.putdata(new_pixels)
        rgba_img.save(filepath, "PNG")
        print(f"   Saved {filename} with transparency.")

if __name__ == "__main__":
    main()
