#!/usr/bin/env python3
import os
from PIL import Image

def slice_explosion_sheets():
    src_dir = "assets/sprites"
    dest_dir = "assets/sprites/vfx"
    os.makedirs(dest_dir, exist_ok=True)
    
    # Slicing parameters
    grid_size = 2  # 2x2 grid
    frame_w = 512
    frame_h = 512
    threshold = 15  # < 15 on all channels to make transparent
    
    for variant in range(4):
        src_path = os.path.join(src_dir, f"explosion_{variant}.png")
        if not os.path.exists(src_path):
            print(f"Warning: {src_path} not found.")
            continue
            
        print(f"Slicing {src_path}...")
        try:
            with Image.open(src_path) as img:
                img = img.convert("RGBA")
                width, height = img.size
                
                # Double check sizes
                if width != 1024 or height != 1024:
                    print(f"Error: {src_path} is {width}x{height}, expected 1024x1024.")
                    continue
                    
                for r in range(grid_size):
                    for c in range(grid_size):
                        idx = r * grid_size + c
                        left = c * frame_w
                        top = r * frame_h
                        right = left + frame_w
                        bottom = top + frame_h
                        
                        # Crop the frame
                        frame = img.crop((left, top, right, bottom))
                        
                        # Apply additive pre-compositing (strip near-black pixels)
                        datas = frame.getdata()
                        new_data = []
                        for item in datas:
                            # item is (R, G, B, A)
                            if item[0] < threshold and item[1] < threshold and item[2] < threshold:
                                new_data.append((0, 0, 0, 0))
                            else:
                                new_data.append(item)
                        frame.putdata(new_data)
                        
                        # Save
                        dest_filename = f"explosion_{variant}_{idx}.png"
                        dest_path = os.path.join(dest_dir, dest_filename)
                        frame.save(dest_path, "PNG")
                        print(f"  Saved {dest_path}")
                        
        except Exception as e:
            print(f"Error processing {src_path}: {e}")

if __name__ == "__main__":
    slice_explosion_sheets()
