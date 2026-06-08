import os
from PIL import Image, ImageDraw

def create_mock_sprite(filename, width, height, color):
    """Creates a mock sprite image with transparency and a filled shape."""
    # Create image with RGBA transparency
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # Draw a simple shape to represent the sprite
    # We will draw a border and an inner filled shape
    padding = 2
    draw.ellipse([padding, padding, width - padding - 1, height - padding - 1], fill=color, outline=(255, 255, 255, 255))
    
    # Save the file
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    image.save(filename, "PNG")
    print(f"Generated mock sprite: {filename} ({width}x{height})")

def main():
    target_dir = "/home/ubuntu/work/darius-star/assets/sprites"
    
    # Define sprites to generate
    # We'll generate a variety of power-of-two and some non-power-of-two sprites
    sprites = [
        # Player (2 frames, 64x64 - power of two)
        ("player_0.png", 64, 64, (0, 255, 255, 255)), # Cyan
        ("player_1.png", 64, 64, (0, 200, 255, 255)),
        
        # Scout (1 frame, 32x32 - power of two)
        ("scout_0.png", 32, 32, (255, 85, 0, 255)), # Orange
        
        # Interceptor (1 frame, 32x32 - power of two)
        ("interceptor_0.png", 32, 32, (255, 0, 85, 255)), # Pinkish Red
        
        # Heavy (1 frame, 64x64 - power of two)
        ("heavy_0.png", 64, 64, (154, 51, 204, 255)), # Purple
        
        # Boss Minion (1 frame, 16x16 - power of two)
        ("boss_minion_0.png", 16, 16, (51, 204, 85, 255)), # Green
        
        # Laser (1 frame, 64x16 - power of two)
        ("laser_0.png", 64, 16, (0, 255, 255, 128)), # Translucent Cyan
        
        # Powerups (1 frame each, 16x16 - power of two)
        ("powerup_w_0.png", 16, 16, (255, 0, 85, 255)), # Red
        ("powerup_s_0.png", 16, 16, (0, 255, 85, 255)), # Green
        
        # Explosion (2 frames, 32x32 - power of two)
        ("explosion_0.png", 32, 32, (255, 255, 255, 255)), # White
        ("explosion_1.png", 32, 32, (255, 170, 0, 255)), # Orange
        
        # Boss (Colossal boss, 1 frame, 128x128 - power of two)
        ("boss_0.png", 128, 128, (255, 0, 0, 255)), # Red
    ]
    
    print("Generating mock sprite assets...")
    for name, w, h, col in sprites:
        filepath = os.path.join(target_dir, name)
        create_mock_sprite(filepath, w, h, col)
        
    print("Mock sprite generation complete.")

if __name__ == "__main__":
    main()
