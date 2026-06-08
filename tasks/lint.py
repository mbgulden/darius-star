#!/usr/bin/env python3
"""Lint task: validate asset references in index.html and sprites.json."""
import json
import os
import re
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(REPO_ROOT)

FIX_MODE = '--fix' in sys.argv

errors = []

# 1. Extract all asset references from index.html
index_path = 'index.html'
with open(index_path, 'r') as f:
    html = f.read()

# Find all src="..." and href="..." references to assets/sprites/
sprite_refs = set()
for match in re.finditer(r'''src=["'](assets/sprites/[^"']+)["']''', html):
    sprite_refs.add(match.group(1))
for match in re.finditer(r'''href=["'](assets/sprites/[^"']+)["']''', html):
    sprite_refs.add(match.group(1))

# Also check JS string references for sprites
js_sprite_refs = re.findall(r'''['"]assets/sprites/([^'"]+)['"]''', html)
for ref in js_sprite_refs:
    sprite_refs.add(f'assets/sprites/{ref}')

# 2. Verify each referenced sprite exists on disk
missing_from_disk = []
for ref in sorted(sprite_refs):
    if not os.path.exists(ref):
        missing_from_disk.append(ref)
        errors.append(f"MISSING: {ref} referenced in index.html but not on disk")

# 3. Load sprites.json and verify its entries
manifest_path = 'assets/sprites.json'
if os.path.exists(manifest_path):
    with open(manifest_path) as f:
        manifest = json.load(f)

    sprites = manifest.get('sprites', {})

    # Check each manifest entry's files exist on disk
    for name, data in sprites.items():
        for frame in data.get('frames', []):
            fpath = frame.get('path', '')
            if not os.path.exists(fpath):
                errors.append(f"MISSING: {fpath} in sprites.json but not on disk (sprite: {name})")

    # Check for files on disk not in sprites.json
    sprite_files = set()
    for root, dirs, files in os.walk('assets/sprites'):
        for f in files:
            if f.endswith('.png'):
                sprite_files.add(os.path.join(root, f))

    manifest_files = set()
    for name, data in sprites.items():
        for frame in data.get('frames', []):
            manifest_files.add(frame.get('path', ''))

    unlisted = sprite_files - manifest_files
    if unlisted:
        if FIX_MODE:
            # Regenerate sprites.json
            print(f"🔧 Fix mode: regenerating sprites.json to include {len(unlisted)} unlisted files...")
            # Run the generate script
            import subprocess
            result = subprocess.run(
                [sys.executable, 'generate_sprites_manifest.py'],
                capture_output=True, text=True, timeout=30
            )
            if result.returncode == 0:
                print("✅ sprites.json regenerated.")
            else:
                print(f"❌ Failed: {result.stderr}")
                errors.append("Sprites manifest regeneration failed")
        else:
            for f in sorted(unlisted):
                errors.append(f"UNLISTED: {f} exists on disk but not in sprites.json")

# 4. Check for unused assets (on disk but never referenced)
if not FIX_MODE:
    all_disk_sprites = set()
    for root, dirs, files in os.walk('assets/sprites'):
        for f in files:
            if f.endswith('.png'):
                all_disk_sprites.add(os.path.join(root, f))

    unused = all_disk_sprites - sprite_refs
    if unused:
        for f in sorted(unused):
            print(f"⚠️  UNUSED: {f} exists on disk but is never referenced in index.html")

# Report
if missing_from_disk:
    print(f"\n❌ {len(missing_from_disk)} asset(s) referenced in index.html but missing from disk:")
    for f in missing_from_disk:
        print(f"   - {f}")

if errors:
    print(f"\n❌ LINT FAILED: {len(errors)} issue(s) found.")
    for e in errors:
        print(f"   {e}")
    sys.exit(1)
else:
    print("✅ LINT PASSED: All asset references valid. 0 missing.")
    sys.exit(0)
