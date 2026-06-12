import os
import sys
from PIL import Image

sprites_dir = "/home/ubuntu/work/darius-star/assets/sprites"
files = [
    "boss_idle.png",
    "boss_rage.png",
    "boss_charge.png",
    "boss_fire.png",
    "boss_death.png"
]

all_ok = True

print("Verifying Cyber Coelacanth Boss State Sprite Assets:")
print("-" * 50)

for f in files:
    path = os.path.join(sprites_dir, f)
    print(f"Verifying {f}...")
    if not os.path.exists(path):
        print(f"  [ERROR] File does not exist: {path}")
        all_ok = False
        continue
    
    try:
        img = Image.open(path)
        print(f"  Format: {img.format}")
        print(f"  Mode: {img.mode}")
        print(f"  Size: {img.size}")
        
        if img.size != (1024, 1024):
            print(f"  [ERROR] Size is {img.size}, expected (1024, 1024)")
            all_ok = False
            
        if img.mode != "RGBA":
            print(f"  [ERROR] Mode is {img.mode}, expected RGBA")
            all_ok = False
            
        corners = [
            img.getpixel((0, 0)),
            img.getpixel((img.size[0] - 1, 0)),
            img.getpixel((0, img.size[1] - 1)),
            img.getpixel((img.size[0] - 1, img.size[1] - 1))
        ]
        print(f"  Corner pixels (RGBA): {corners}")
        
        for i, c in enumerate(corners):
            if len(c) == 4 and c[3] != 0:
                print(f"  [WARNING] Corner pixel {i} alpha is not 0: {c}")
                
    except Exception as e:
        print(f"  [ERROR] Failed to open/verify image: {e}")
        all_ok = False

print("-" * 50)
if all_ok:
    print("[SUCCESS] All boss state assets are successfully verified and correct!")
    sys.exit(0)
else:
    print("[FAILURE] One or more verification checks failed.")
    sys.exit(1)
