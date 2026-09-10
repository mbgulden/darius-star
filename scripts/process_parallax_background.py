#!/usr/bin/env python3
"""
scripts/process_parallax_background.py
Processes, extracts alpha transparency, blends horizontal seams, and compiles
ultra-wide (>=3000px) seamless parallax layers for Darius Star.
"""

import os
import sys
from collections import deque
import numpy as np
from PIL import Image

def extract_alpha_flood_fill(img: Image.Image, bg_threshold: int = 240) -> Image.Image:
    """
    Extracts alpha transparency by flood-filling exclusively from the 4 outer image borders.
    Preserves interior white highlights (runes, specular shine, glowing energy nodes).
    """
    img = img.convert('RGBA')
    w, h = img.size
    arr = np.array(img, dtype=np.uint8)

    is_white = (arr[:, :, 0] >= bg_threshold) & (arr[:, :, 1] >= bg_threshold) & (arr[:, :, 2] >= bg_threshold)

    visited = np.zeros((h, w), dtype=bool)
    is_transparent = np.zeros((h, w), dtype=bool)

    # 1. Flood-fill all white regions connected to the 4 outer borders
    border_queue = deque()
    for x in range(w):
        if is_white[0, x] and not visited[0, x]:
            border_queue.append((0, x))
            visited[0, x] = True
        if is_white[h - 1, x] and not visited[h - 1, x]:
            border_queue.append((h - 1, x))
            visited[h - 1, x] = True

    for y in range(h):
        if is_white[y, 0] and not visited[y, 0]:
            border_queue.append((y, 0))
            visited[y, 0] = True
        if is_white[y, w - 1] and not visited[y, w - 1]:
            border_queue.append((y, w - 1))
            visited[y, w - 1] = True

    while border_queue:
        cy, cx = border_queue.popleft()
        is_transparent[cy, cx] = True
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w:
                if not visited[ny, nx] and is_white[ny, nx]:
                    visited[ny, nx] = True
                    border_queue.append((ny, nx))

    # 2. For remaining unvisited white regions (enclosed holes/arches):
    # If area > min_hole_size (e.g. 150 px), it is empty space (hollow arch/flight path) -> transparent.
    # If area <= min_hole_size, it is an interior highlight/specular glint -> preserved opaque.
    min_hole_size = 150
    for y in range(h):
        for x in range(w):
            if is_white[y, x] and not visited[y, x]:
                hole_queue = deque([(y, x)])
                visited[y, x] = True
                hole_pixels = [(y, x)]
                while hole_queue:
                    cy, cx = hole_queue.popleft()
                    for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < h and 0 <= nx < w:
                            if not visited[ny, nx] and is_white[ny, nx]:
                                visited[ny, nx] = True
                                hole_queue.append((ny, nx))
                                hole_pixels.append((ny, nx))
                if len(hole_pixels) > min_hole_size:
                    for hy, hx in hole_pixels:
                        is_transparent[hy, hx] = True

    arr[is_transparent, 3] = 0
    return Image.fromarray(arr, 'RGBA')

def make_seamless_horizontal(img: Image.Image, blend_fraction: float = 0.12) -> Image.Image:
    """
    Blends the left and right edges across a smooth cosine-weighted seam
    so the image tiles horizontally with zero visible seam line.
    """
    img = img.convert('RGBA')
    w, h = img.size
    blend_w = max(16, int(w * blend_fraction))
    arr = np.array(img, dtype=np.float32)

    # We take the rightmost blend_w strip and blend it into the leftmost blend_w strip
    # and vice-versa so column 0 exactly matches column w-1
    t = np.linspace(0, np.pi, blend_w, endpoint=True)
    alpha_weights = (1.0 - np.cos(t)) / 2.0 # 0.0 at left, 1.0 at right

    # For the seam: copy a blend slice from right to left
    left_slice = arr[:, :blend_w, :].copy()
    right_slice = arr[:, -blend_w:, :].copy()

    for i in range(blend_w):
        w_right = alpha_weights[i]
        w_left = 1.0 - w_right
        blended = left_slice[:, i, :] * w_right + right_slice[:, i, :] * w_left
        arr[:, i, :] = blended
        arr[:, w - blend_w + i, :] = blended

    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')

def compile_dual_angle_panorama(frame_a_path: str, frame_b_path: str, output_path: str,
                                target_w: int = 3072, target_h: int = 768,
                                blend_fraction: float = 0.12) -> Image.Image:
    """
    Combines two distinct camera perspective frames (Frame A & Frame B) into a seamless 3072x768 panorama.
    Frame A occupies the left half, Frame B occupies the right half.
    Applies smooth cosine cross-fade blending at the center interface and outer loop boundary.
    """
    img_a = Image.open(frame_a_path).convert('RGBA')
    img_b = Image.open(frame_b_path).convert('RGBA')

    half_w = target_w // 2
    overlap_w = max(32, int(half_w * blend_fraction))
    tile_w = half_w + overlap_w

    scale_a = max(tile_w / img_a.size[0], target_h / img_a.size[1])
    scaled_a = img_a.resize((int(img_a.size[0] * scale_a), int(img_a.size[1] * scale_a)), Image.Resampling.LANCZOS)
    cropped_a = scaled_a.crop((0, 0, tile_w, target_h))

    scale_b = max(tile_w / img_b.size[0], target_h / img_b.size[1])
    scaled_b = img_b.resize((int(img_b.size[0] * scale_b), int(img_b.size[1] * scale_b)), Image.Resampling.LANCZOS)
    cropped_b = scaled_b.crop((0, 0, tile_w, target_h))

    arr_a = np.array(cropped_a, dtype=np.float32)
    arr_b = np.array(cropped_b, dtype=np.float32)

    canvas = np.zeros((target_h, target_w, 4), dtype=np.float32)

    # Place left half up to transition zone
    canvas[:, :half_w - overlap_w, :] = arr_a[:, :half_w - overlap_w, :]

    # Center transition blend
    blend_len = 2 * overlap_w
    t_center = np.linspace(0, np.pi, blend_len, endpoint=True)
    w_b = (1.0 - np.cos(t_center)) / 2.0
    for i in range(blend_len):
        idx = half_w - overlap_w + i
        weight_b = w_b[i]
        weight_a = 1.0 - weight_b
        canvas[:, idx, :] = arr_a[:, half_w - overlap_w + i, :] * weight_a + arr_b[:, i, :] * weight_b

    # Place right half
    right_start = half_w + overlap_w
    rem_w = target_w - right_start
    canvas[:, right_start:, :] = arr_b[:, blend_len : blend_len + rem_w, :]

    out_img = Image.fromarray(np.clip(canvas, 0, 255).astype(np.uint8), 'RGBA')
    seamless_out = make_seamless_horizontal(out_img, blend_fraction=0.08)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    seamless_out.save(output_path, 'PNG')
    print(f"[COMPILED DUAL-ANGLE PANORAMA] Successfully created 2-frame seamless panorama ({target_w}x{target_h}): {output_path}")
    return seamless_out

def compile_ultra_wide_background(input_path: str, output_path: str,
                                  target_w: int = 3072, target_h: int = 768,
                                  is_near_silhouette: bool = False,
                                  bg_threshold: int = 240) -> Image.Image:
    img = Image.open(input_path)
    
    if is_near_silhouette:
        img = extract_alpha_flood_fill(img, bg_threshold=bg_threshold)

    # First resize to target height preserving aspect ratio
    orig_w, orig_h = img.size
    scale = target_h / orig_h
    scaled_w = int(orig_w * scale)
    scaled_img = img.resize((scaled_w, target_h), Image.Resampling.LANCZOS)

    # Repeat horizontally until >= target_w + blend margin
    repeats = (target_w // scaled_w) + 2
    canvas = Image.new('RGBA', (scaled_w * repeats, target_h), (0, 0, 0, 0))
    for r in range(repeats):
        canvas.paste(scaled_img, (r * scaled_w, 0), scaled_img if is_near_silhouette else None)

    # Crop to target_w
    cropped = canvas.crop((0, 0, target_w, target_h))

    # Apply seamless horizontal blending
    seamless = make_seamless_horizontal(cropped, blend_fraction=0.08)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    seamless.save(output_path, 'PNG')
    print(f"[COMPILED] Successfully created ultra-wide seamless background ({target_w}x{target_h}): {output_path}")
    return seamless

def compile_landmark(input_path: str, output_path: str,
                     target_size: int = 1024,
                     bg_threshold: int = 240) -> Image.Image:
    """
    Extracts alpha transparency via 4-border flood-fill, fits into a square canvas,
    resizes smoothly with Lanczos to target_size x target_size, and preserves interior highlights.
    """
    img = Image.open(input_path)
    alpha_img = extract_alpha_flood_fill(img, bg_threshold=bg_threshold)
    
    # Fit into target_size while preserving aspect ratio if not 1:1, centering it
    orig_w, orig_h = alpha_img.size
    scale = min(target_size / orig_w, target_size / orig_h)
    new_w = int(orig_w * scale)
    new_h = int(orig_h * scale)
    resized = alpha_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    canvas = Image.new('RGBA', (target_size, target_size), (0, 0, 0, 0))
    offset_x = (target_size - new_w) // 2
    offset_y = (target_size - new_h) // 2
    canvas.paste(resized, (offset_x, offset_y), resized)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    canvas.save(output_path, 'PNG')
    print(f"[COMPILED LANDMARK] Successfully created landmark ({target_size}x{target_size}): {output_path}")
    return canvas

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage:")
        print("  python3 scripts/process_parallax_background.py <input_img> <output_png> [--near] [--landmark] [--width 3072] [--height 768] [--size 1024]")
        print("  python3 scripts/process_parallax_background.py --dual <frame_a> <frame_b> <output_png> [--width 3072] [--height 768]")
        sys.exit(1)

    w = 3072
    h = 768
    size = 1024
    if '--width' in sys.argv:
        w = int(sys.argv[sys.argv.index('--width') + 1])
    if '--height' in sys.argv:
        h = int(sys.argv[sys.argv.index('--height') + 1])
    if '--size' in sys.argv:
        size = int(sys.argv[sys.argv.index('--size') + 1])

    if '--dual' in sys.argv:
        dual_idx = sys.argv.index('--dual')
        frame_a = sys.argv[dual_idx + 1]
        frame_b = sys.argv[dual_idx + 2]
        out_p = sys.argv[dual_idx + 3]
        compile_dual_angle_panorama(frame_a, frame_b, out_p, target_w=w, target_h=h)
    elif '--landmark' in sys.argv:
        in_p = sys.argv[1]
        out_p = sys.argv[2]
        compile_landmark(in_p, out_p, target_size=size)
    else:
        in_p = sys.argv[1]
        out_p = sys.argv[2]
        is_near = '--near' in sys.argv
        compile_ultra_wide_background(in_p, out_p, target_w=w, target_h=h, is_near_silhouette=is_near)
