#!/usr/bin/env python3
import os
import sys
import argparse
import json
from PIL import Image

def is_power_of_two(n):
    """Returns True if n is a power of two, otherwise False."""
    return n > 0 and (n & (n - 1)) == 0

def slice_sprite_sheet(sheet_path, out_dir, prefix, frame_width=None, frame_height=None,
                       cols=None, rows=None, margin=0, spacing=0,
                       max_frames=None, skip_empty=True, update_manifest=False,
                       padding=4, start_index=1):
    """
    Slices a sprite sheet PNG into individual frame files with enhanced options.
    """
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

    # Determine frame dimensions and grid
    if cols and rows:
        # Calculate width/height from grid (ignoring margins for now in this calculation)
        frame_width = (sheet_width - 2 * margin - (cols - 1) * spacing) // cols
        frame_height = (sheet_height - 2 * margin - (rows - 1) * spacing) // rows
    elif frame_width and frame_height:
        # Calculate grid from width/height
        cols = (sheet_width - 2 * margin + spacing) // (frame_width + spacing)
        rows = (sheet_height - 2 * margin + spacing) // (frame_height + spacing)
    else:
        print("Error: Must specify either (width and height) or (cols and rows).")
        return False

    total_cells = cols * rows

    print(f"Sprite sheet dimensions: {sheet_width}x{sheet_height}")
    print(f"Grid: {cols} columns x {rows} rows (total potential frames: {total_cells})")
    print(f"Frame size: {frame_width}x{frame_height}")
    print(f"Margin: {margin}, Spacing: {spacing}")

    # Validate power-of-two frame dimensions
    if not (is_power_of_two(frame_width) and is_power_of_two(frame_height)):
        print(f"Warning: Frame dimensions {frame_width}x{frame_height} are not power-of-two.")

    processed_count = 0
    saved_count = 0

    for r in range(rows):
        for c in range(cols):
            if max_frames is not None and saved_count >= max_frames:
                break

            # Calculate box coordinates including margin and spacing
            left = margin + c * (frame_width + spacing)
            top = margin + r * (frame_height + spacing)
            right = left + frame_width
            bottom = top + frame_height

            # Bounds check
            if right > sheet_width or bottom > sheet_height:
                print(f"Warning: Frame {processed_count} at ({c},{r}) is out of sheet bounds. Skipping.")
                processed_count += 1
                continue

            # Crop the frame
            frame = sheet.crop((left, top, right, bottom))

            # Skip entirely empty/transparent frames if requested
            if skip_empty and frame.mode == 'RGBA':
                alpha = frame.split()[-1]
                bbox = alpha.getbbox()
                if bbox is None:
                    # Fully transparent frame, skip
                    processed_count += 1
                    continue

            # Save the individual frame
            # Default naming convention is {prefix}_{index:04d}.png with 1-based indexing
            index = start_index + saved_count
            index_str = str(index).zfill(padding)
            frame_filename = f"{prefix}_{index_str}.png"
            frame_path = os.path.join(out_dir, frame_filename)
            frame.save(frame_path, "PNG")

            saved_count += 1
            processed_count += 1

        if max_frames is not None and saved_count >= max_frames:
            break

    print(f"Slicing complete. Sliced {saved_count} frames successfully from {processed_count} processed.")

    if update_manifest:
        run_manifest_generator()

    return True

def run_manifest_generator():
    """Runs the manifest generator script if it exists in the root."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(script_dir)
    manifest_script = os.path.join(root_dir, "generate_sprites_manifest.py")

    if os.path.exists(manifest_script):
        print("Updating sprite manifest...")
        import subprocess
        try:
            # Note: generate_sprites_manifest.py might truncate sprites.json
            # if assets are missing locally. Use with caution.
            subprocess.run([sys.executable, manifest_script], check=True)
        except Exception as e:
            print(f"Error updating manifest: {e}")
    else:
        print(f"Warning: Manifest generator not found at {manifest_script}")

def process_batch(config_path, update_manifest=False):
    """Processes multiple sprite sheets based on a JSON config file."""
    if not os.path.exists(config_path):
        print(f"Error: Batch config file '{config_path}' does not exist.")
        return False

    try:
        with open(config_path, 'r') as f:
            batch_config = json.load(f)
    except Exception as e:
        print(f"Error reading batch config: {e}")
        return False

    if not isinstance(batch_config, list):
        print("Error: Batch config must be a JSON list of objects.")
        return False

    print(f"Starting batch processing of {len(batch_config)} sheets...")

    success_count = 0
    for i, item in enumerate(batch_config):
        print(f"\n[{i+1}/{len(batch_config)}] Processing {item.get('prefix', 'unnamed')}")

        sheet_path = item.get("input")
        if not sheet_path:
            print(f"  Error: Missing 'input' for item {i}. Skipping.")
            continue

        success = slice_sprite_sheet(
            sheet_path=sheet_path,
            out_dir=item.get("outdir", "assets/sprites"),
            prefix=item.get("prefix"),
            frame_width=item.get("width"),
            frame_height=item.get("height"),
            cols=item.get("cols"),
            rows=item.get("rows"),
            margin=item.get("margin", 0),
            spacing=item.get("spacing", 0),
            max_frames=item.get("count"),
            skip_empty=item.get("skip_empty", True),
            update_manifest=False,
            padding=item.get("padding", 4),
            start_index=item.get("start_index", 1)
        )

        if success:
            success_count += 1

    print(f"\nBatch complete. {success_count}/{len(batch_config)} sheets processed successfully.")

    if update_manifest and success_count > 0:
        run_manifest_generator()

    return success_count == len(batch_config)

def main():
    parser = argparse.ArgumentParser(description="Enhanced Sprite Sheet Slicer for Darius Star")
    parser.add_argument("--batch", help="Path to a JSON batch configuration file")
    parser.add_argument("--input", help="Path to input sprite sheet image (PNG)")
    parser.add_argument("--outdir", default="assets/sprites", help="Output directory for sliced frames")
    parser.add_argument("--prefix", help="Prefix name for sliced frames (e.g. player, scout)")

    # Dimension group: either size or grid
    dim_group = parser.add_argument_group("dimensions")
    dim_group.add_argument("--width", type=int, help="Width of individual frame")
    dim_group.add_argument("--height", type=int, help="Height of individual frame")
    dim_group.add_argument("--cols", type=int, help="Number of columns in the grid")
    dim_group.add_argument("--rows", type=int, help="Number of rows in the grid")

    # Layout options
    layout_group = parser.add_argument_group("layout")
    layout_group.add_argument("--margin", type=int, default=0, help="Margin around the entire sheet")
    layout_group.add_argument("--spacing", type=int, default=0, help="Spacing between frames")

    # Naming options
    naming_group = parser.add_argument_group("naming")
    naming_group.add_argument("--padding", type=int, default=4, help="Zero-padding for frame index (default: 4)")
    naming_group.add_argument("--start-index", type=int, default=1, help="Starting index for frames (default: 1)")

    # Processing options
    proc_group = parser.add_argument_group("processing")
    proc_group.add_argument("--count", type=int, default=None, help="Maximum number of frames to extract")
    proc_group.add_argument("--keep-empty", action="store_false", dest="skip_empty", help="Do not skip transparent frames")
    proc_group.set_defaults(skip_empty=True)
    proc_group.add_argument("--update-manifest", action="store_true", help="Run generate_sprites_manifest.py after slicing")

    args = parser.parse_args()

    if args.batch:
        success = process_batch(args.batch, update_manifest=args.update_manifest)
    elif args.input and args.prefix:
        success = slice_sprite_sheet(
            sheet_path=args.input,
            out_dir=args.outdir,
            prefix=args.prefix,
            frame_width=args.width,
            frame_height=args.height,
            cols=args.cols,
            rows=args.rows,
            margin=args.margin,
            spacing=args.spacing,
            max_frames=args.count,
            skip_empty=args.skip_empty,
            update_manifest=args.update_manifest,
            padding=args.padding,
            start_index=args.start_index
        )
    else:
        parser.print_help()
        print("\nError: Must provide either --batch or both --input and --prefix.")
        sys.exit(1)

    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()
