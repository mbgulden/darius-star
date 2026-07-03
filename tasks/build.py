#!/usr/bin/env python3
"""Build task: validate power-of-two constraints and generate production-ready output."""
import json
import os
import re
import sys
from pathlib import Path
from struct import unpack

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(REPO_ROOT)

errors = []
warnings = []

# 1. Check image dimensions for power-of-two compliance
def get_png_dimensions(filepath):
    """Read PNG dimensions from IHDR chunk without loading full image."""
    with open(filepath, 'rb') as f:
        # Skip PNG signature (8 bytes)
        f.read(8)
        # Read IHDR length
        length = unpack('>I', f.read(4))[0]
        if f.read(4) != b'IHDR':
            return None, None
        width = unpack('>I', f.read(4))[0]
        height = unpack('>I', f.read(4))[0]
        return width, height

def is_power_of_two(n):
    return n > 0 and (n & (n - 1)) == 0

manifest_path = 'assets/sprites.json'
if os.path.exists(manifest_path):
    with open(manifest_path) as f:
        manifest = json.load(f)

    print("🔍 Checking power-of-two constraints...")
    non_pot = []
    for name, data in manifest.get('sprites', {}).items():
        w = data.get('width', 0)
        h = data.get('height', 0)
        pot_ok = is_power_of_two(w) and is_power_of_two(h)
        if not pot_ok:
            non_pot.append((name, w, h))

    if non_pot:
        print(f"⚠️  {len(non_pot)} asset(s) with non-power-of-two dimensions:")
        for name, w, h in non_pot:
            print(f"   - {name}: {w}x{h}")
        warnings.append(f"{len(non_pot)} sprite(s) have non-power-of-two dimensions (GPU optimization note)")
    else:
        print("✅ All sprites pass power-of-two check.")
else:
    warnings.append("sprites.json not found — skipping power-of-two validation")

# 2. Generate minified production HTML and copy dependencies
print("\n📦 Generating production build...")
dist_dir = Path('dist')
dist_dir.mkdir(exist_ok=True)

# Minify all HTML files
html_files = list(Path('.').glob('*.html'))
total_orig = 0
total_min = 0

def minify_html(content):
    # Simple minification: strip comments
    content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
    # Collapse multiple whitespace but preserve newlines to avoid breaking // comments in scripts
    content = re.sub(r'[ \t]+', ' ', content)
    return content.strip()

for html_path in html_files:
    content = html_path.read_text(encoding='utf-8')
    minified = minify_html(content)
    (dist_dir / html_path.name).write_text(minified, encoding='utf-8')

    total_orig += len(content)
    total_min += len(minified)
    print(f"   Processed: {html_path.name}")

savings = ((total_orig - total_min) / total_orig) * 100
print(f"   Total HTML Original: {total_orig:,} bytes")
print(f"   Total HTML Minified: {total_min:,} bytes")
print(f"   HTML Savings:  {savings:.1f}%")

import shutil

# Copy JS directory to dist
js_src = Path('js')
js_dst = dist_dir / 'js'
if js_src.exists():
    if js_dst.exists():
        shutil.rmtree(js_dst)
    shutil.copytree(js_src, js_dst)
    print(f"   JS modules copied to dist/js/")

# Copy assets to dist
assets_src = Path('assets')
assets_dst = dist_dir / 'assets'
if assets_dst.exists():
    shutil.rmtree(assets_dst)
shutil.copytree(assets_src, assets_dst)

print(f"   Assets copied to dist/assets/")
print(f"✅ Build complete: dist/")

if errors:
    print(f"\n❌ BUILD FAILED: {len(errors)} validation error(s).")
    for e in errors:
        print(f"   {e}")
    sys.exit(1)
else:
    print("✅ BUILD PASSED")
    sys.exit(0)
