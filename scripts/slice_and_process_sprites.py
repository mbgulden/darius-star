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

def extract_alpha_flood_fill(img: Image.Image, bg_threshold: int = 240) -> Image.Image:
    """
    Extracts alpha transparency by flood-filling exclusively from the 4 outer image borders.
    Internal white highlights (specular reflections, runes, eye glints) remain 100% opaque.
    """
    img = img.convert('RGBA')
    w, h = img.size
    arr = np.array(img, dtype=np.uint8)

    # Detect near-white pixels (R, G, B >= bg_threshold)
    is_white = (arr[:, :, 0] >= bg_threshold) & (arr[:, :, 1] >= bg_threshold) & (arr[:, :, 2] >= bg_threshold)

    # 4-connected exterior flood fill from 4 boundaries
    visited = np.zeros((h, w), dtype=bool)
    queue = deque()

    # Seed top and bottom borders
    for x in range(w):
        if is_white[0, x]:
            queue.append((0, x))
            visited[0, x] = True
        if is_white[h - 1, x]:
            queue.append((h - 1, x))
            visited[h - 1, x] = True

    # Seed left and right borders
    for y in range(h):
        if is_white[y, 0] and not visited[y, 0]:
            queue.append((y, 0))
            visited[y, 0] = True
        if is_white[y, w - 1] and not visited[y, w - 1]:
            queue.append((y, w - 1))
            visited[y, w - 1] = True

    # Flood fill exterior connected component only
    while queue:
        cy, cx = queue.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w:
                if not visited[ny, nx] and is_white[ny, nx]:
                    visited[ny, nx] = True
                    queue.append((ny, nx))

    # Set alpha of exterior white to 0
    arr[visited, 3] = 0
    return Image.fromarray(arr, 'RGBA')

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
