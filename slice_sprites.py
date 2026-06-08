#!/usr/bin/env python3
import os
import sys
import argparse
import json
from PIL import Image

def is_power_of_two(n):
    """Returns True if n is a power of two, otherwise False."""
    return n > 0 and (n & (n - 1)) == 0

def slice_sprite_sheet(sheet_path, out_dir, prefix, frame_width, frame_height, max_frames=None):
    """Slices a sprite sheet PNG into individual frame files."""
    print(f"Loading sprite sheet: {sheet_path}")
    if not os.path.exists(sheet_path):
        print(f"Error: Sprite sheet file '{sheet_path}' does not exist.")
        return False

    try:
        sheet = Image.open(sheet_path)
    except Exception as e:
        print(f"Error: Could not open image file '{sheet_path}': {e}")
        return False

    # Ensure output directory exists
    os.makedirs(out_dir, exist_ok=True)

    sheet_width, sheet_height = sheet.size
    cols = sheet_width // frame_width
    rows = sheet_height // frame_height
    total_cells = cols * rows

    print(f"Sprite sheet dimensions: {sheet_width}x{sheet_height}")
    print(f"Grid: {cols} columns x {rows} rows (total potential frames: {total_cells})")
    print(f"Frame size: {frame_width}x{frame_height}")

    # Validate power-of-two frame dimensions
    w_pot = is_power_of_two(frame_width)
    h_pot = is_power_of_two(frame_height)
    if not (w_pot and h_pot):
        print(f"Warning: Frame dimensions {frame_width}x{frame_height} are not power-of-two.")

    frame_count = 0
    for r in range(rows):
        for c in range(cols):
            if max_frames is not None and frame_count >= max_frames:
                break

            # Calculate box coordinates
            left = c * frame_width
            top = r * frame_height
            right = left + frame_width
            bottom = top + frame_height

            # Crop the frame
            frame = sheet.crop((left, top, right, bottom))

            # Skip entirely empty/transparent frames
            # Check if frame is fully transparent (all pixels have alpha = 0)
            if frame.mode == 'RGBA':
                alpha = frame.split()[-1]
                bbox = alpha.getbbox()
                if bbox is None:
                    # Fully transparent frame, skip
                    continue

            # Save the individual frame
            frame_filename = f"{prefix}_{frame_count}.png"
            frame_path = os.path.join(out_dir, frame_filename)
            frame.save(frame_path, "PNG")
            print(f"Saved frame {frame_count}: {frame_path}")
            frame_count += 1

        if max_frames is not None and frame_count >= max_frames:
            break

    print(f"Slicing complete. Sliced {frame_count} frames successfully.")
    return True

def main():
    parser = argparse.ArgumentParser(description="Pillow-based Sprite Sheet Slicer for Darius Star")
    parser.add_argument("--input", required=True, help="Path to input sprite sheet image (PNG)")
    parser.add_argument("--outdir", default="/home/ubuntu/work/darius-star/assets/sprites", help="Output directory for sliced frames")
    parser.add_argument("--prefix", required=True, help="Prefix name for sliced frames (e.g. player, scout)")
    parser.add_argument("--width", type=int, default=64, help="Width of individual frame (default: 64)")
    parser.add_argument("--height", type=int, default=64, help="Height of individual frame (default: 64)")
    parser.add_argument("--count", type=int, default=None, help="Maximum number of frames to extract")

    args = parser.parse_args()

    success = slice_sprite_sheet(
        sheet_path=args.input,
        out_dir=args.outdir,
        prefix=args.prefix,
        frame_width=args.width,
        frame_height=args.height,
        max_frames=args.count
    )

    if success:
        # Run manifest generator to update sprites.json
        print("Updating sprite manifest...")
        os.system("python3 /home/ubuntu/work/darius-star/generate_sprites_manifest.py")
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
