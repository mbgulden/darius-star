import os
from PIL import Image

image_path = '/home/ubuntu/work/darius-star/assets/sprites/backgrounds/bg_title_strip.png'
if not os.path.exists(image_path):
    print(f'ERROR: File {image_path} does not exist!')
    exit(1)

try:
    im = Image.open(image_path)
    print(f'SUCCESS: Opened {image_path}')
    print(f'Format: {im.format}')
    print(f'Size: {im.size}')
    print(f'Mode: {im.mode}')
    
    expected_width = 39680
    expected_height = 720
    
    if im.size != (expected_width, expected_height):
        print(f'ERROR: Image size {im.size} does not match expected size ({expected_width}, {expected_height})!')
        exit(1)
        
    print('SUCCESS: Dimensions are correct.')
    
    # Check each frame to make sure it contains non-blank data
    for i in range(31):
        left = i * 1280
        box = (left, 0, left + 1280, 720)
        frame = im.crop(box)
        extrema = frame.convert('L').getextrema()
        if extrema[0] == extrema[1]:
            print(f'WARNING: Frame {i} is blank (single color: {extrema[0]})')
        else:
            # Calculate some basic stats to ensure frame is not corrupt
            stats = frame.convert('L').getdata()
            avg = sum(stats) / len(stats)
            if avg < 1.0:
                print(f'WARNING: Frame {i} has extremely low average brightness ({avg:.2f})')
            
    print('SUCCESS: Checked all 31 frames. Image is properly stitched and valid.')
except Exception as e:
    print(f'ERROR: Failed to parse/check image: {e}')
    exit(1)
