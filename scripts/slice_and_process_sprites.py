#!/usr/bin/env python3
"""
scripts/slice_and_process_sprites.py
Standardized 4-Boundary Flood-Fill Alpha Slicing and Atlas Assembler for Boss Sprites.
"""

import sys
import os
import glob
from collections import deque
import numpy as np
from PIL import Image

from PIL import ImageFilter

def extract_alpha_flood_fill(img: Image.Image, bg_threshold: int = 242, close_radius: int = 2) -> Image.Image:
    """
    Extracts alpha transparency by flood-filling exclusively from the 4 outer image borders
    with morphological perimeter gap closing to guarantee 100% solid, filled-in interior models.
    Internal white highlights, armor plates, and speculars remain 100% opaque.
    """
    arr = np.array(img.convert('RGB'))
    h, w = arr.shape[:2]
    
    is_sprite = (arr[:, :, 0] < bg_threshold) | (arr[:, :, 1] < bg_threshold) | (arr[:, :, 2] < bg_threshold)
    mask_im = Image.fromarray((is_sprite * 255).astype(np.uint8), mode='L')
    if close_radius > 0:
        closed_im = mask_im.filter(ImageFilter.MaxFilter(2 * close_radius + 1))
        closed_mask = np.array(closed_im) > 0
    else:
        closed_mask = is_sprite
        
    visited = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(w):
        if not closed_mask[0, x] and not visited[0, x]: visited[0, x] = True; q.append((0, x))
        if not closed_mask[h-1, x] and not visited[h-1, x]: visited[h-1, x] = True; q.append((h-1, x))
    for y in range(h):
        if not closed_mask[y, 0] and not visited[y, 0]: visited[y, 0] = True; q.append((y, 0))
        if not closed_mask[y, w-1] and not visited[y, w-1]: visited[y, w-1] = True; q.append((y, w-1))
        
    while q:
        cy, cx = q.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and not closed_mask[ny, nx]:
                visited[ny, nx] = True
                q.append((ny, nx))
                
    sprite_mask = ~visited
    is_white = (arr[:, :, 0] >= bg_threshold) & (arr[:, :, 1] >= bg_threshold) & (arr[:, :, 2] >= bg_threshold)
    
    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[:, :, :3] = arr[:, :, :3]
    out[sprite_mask, 3] = 255
    
    border_touch = np.zeros((h, w), dtype=bool)
    for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        shifted = np.roll(np.roll(visited, dy, axis=0), dx, axis=1)
        border_touch |= shifted
    outer_edge_white = is_white & border_touch
    out[outer_edge_white, 3] = 0
    return Image.fromarray(out, 'RGBA')

def assemble_4x4_spritesheet(frame_images, output_path, cell_size=256):
    """
    Assembles 16 frames into a 4x4 spritesheet (1024x1024 or 2048x2048).
    frame_images: list of 16 PIL Images or paths in row-major order:
      [row0_f0..f3, row1_f0..f3, row2_f0..f3, row3_f0..f3]
    """
    sheet_w = cell_size * 4
    sheet_h = cell_size * 4
    sheet = Image.new('RGBA', (sheet_w, sheet_h), (0, 0, 0, 0))

    for idx, frame in enumerate(frame_images):
        if isinstance(frame, str):
            f_img = Image.open(frame)
        else:
            f_img = frame
        f_clean = extract_alpha_flood_fill(f_img)
        f_resized = f_clean.resize((cell_size, cell_size), Image.Resampling.LANCZOS)
        
        row = idx // 4
        col = idx % 4
        sheet.paste(f_resized, (col * cell_size, row * cell_size), f_resized)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    sheet.save(output_path, 'PNG')
    print(f"[SPRITESHEET] Successfully compiled 4x4 atlas ({sheet_w}x{sheet_h}): {output_path}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/slice_and_process_sprites.py <image_path_or_boss_key>")
        sys.exit(1)

    target = sys.argv[1]
    if os.path.exists(target):
        out_path = target if len(sys.argv) < 3 else sys.argv[2]
        img = Image.open(target)
        clean = extract_alpha_flood_fill(img)
        clean.save(out_path, 'PNG')
        print(f"[FLOOD-FILL] Processed alpha flood-fill on {target} -> {out_path}")
