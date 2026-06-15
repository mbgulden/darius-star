#!/usr/bin/env python3
import os
import sys
from pathlib import Path
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent

def main():
    print("=== Background Asset Verification ===")
    bg_dir = str(REPO_ROOT / "assets" / "sprites" / "backgrounds")
    
    required_assets = [
        "bg_8_near.png",
        "bg_derelict_fleet_near.png",
        "bg_9_far.png",
        "bg_xenomorph_hive_far.png",
        "bg_9_near.png",
        "bg_xenomorph_hive_near.png"
    ]
    
    all_ok = True
    for asset in required_assets:
        path = os.path.join(bg_dir, asset)
        print(f"Checking {asset}...")
        if not os.path.exists(path):
            print(f"  ❌ ERROR: File does not exist at {path}")
            all_ok = False
            continue
            
        try:
            with Image.open(path) as img:
                w, h = img.size
                print(f"  Found image: {w}x{h}, Mode: {img.mode}, Format: {img.format}")
                if w != 2048 or h != 600:
                    print(f"  ❌ ERROR: Dimensions are {w}x{h}, expected 2048x600")
                    all_ok = False
                else:
                    print(f"  ✅ Size is correct: {w}x{h}")
        except Exception as e:
            print(f"  ❌ ERROR: Failed to read image: {e}")
            all_ok = False
            
    print("\n=== Renderer Integration Verification ===")
    renderer_path = str(REPO_ROOT / "js" / "renderer" / "parallax.js")
    if os.path.exists(renderer_path):
        with open(renderer_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Check if 9 has been removed from BIOMES_WITHOUT_ASSETS
        if "BIOMES_WITHOUT_ASSETS = new Set([10])" in content or "BIOMES_WITHOUT_ASSETS = new Set([ 10 ])" in content:
            print("  ✅ BIOMES_WITHOUT_ASSETS updated (Biome 9 removed, assets enabled)")
        else:
            # Check for other valid variations
            if "BIOMES_WITHOUT_ASSETS" in content and "9" not in content.split("BIOMES_WITHOUT_ASSETS")[1].split("\n")[0]:
                print("  ✅ BIOMES_WITHOUT_ASSETS updated (Biome 9 is not in the set)")
            else:
                print("  ❌ ERROR: Biome 9 still marked as asset-less in renderer.js")
                all_ok = False
                
        # Check BIOME_STRIP_MAP mapping
        if "'bg_9': 'xenomorph_hive'" in content or '"bg_9": "xenomorph_hive"' in content:
            print("  ✅ BIOME_STRIP_MAP updated ('bg_9' maps to 'xenomorph_hive')")
        else:
            print("  ❌ ERROR: BIOME_STRIP_MAP does not map 'bg_9' to 'xenomorph_hive'")
            all_ok = False
    else:
        print(f"  ❌ ERROR: renderer.js not found at {renderer_path}")
        all_ok = False
        
    if all_ok:
        print("\n🎉 ALL CHECKS PASSED: Missing background strips successfully generated and integrated!")
        sys.exit(0)
    else:
        print("\n❌ CHECK(S) FAILED: Please fix errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
