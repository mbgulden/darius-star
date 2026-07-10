# Ship Sprite Generation Prompts — Darius Star

For GRO-910: Ship Selection Screen. Generate sprite sheets for 4 non-default ships.
The STRIKER (default) uses the existing `player_0.png` / `player_1.png` sprites.

All sprites: 256×256 PNG, transparent background, 16-bit retro pixel art style.
Each ship needs 2 frames (idle + glow frame) matching the existing player sprite convention.

---

## 1. PHANTOM (Speed Class — S-02)

### Veo 3.1 Prompt
```
16-bit retro sci-fi starfighter sprite, ultra-streamlined needle design,
teal-green (#00ffaa) energy glow along fuselage edges, minimal wings,
stretched elongated hull built for maximum velocity, single narrow cockpit,
bright teal afterburner flame, pixel art texture, transparent background,
256x256 sprite sheet frame, Darius Star game asset, top-down view,
glowing accent lines, retro arcade shmup style
```

### Imagen Prompt
```
A 16-bit pixel art speedster spaceship sprite for a retro arcade shoot-em-up game.
Needle-thin elongated design with bright teal (#00ffaa) afterburner glow.
Minimal wing profile, stretched fuselage built for velocity.
Transparent background, 256x256 pixels, top-down orientation.
Single frame, pixel art style with crisp edges and limited color palette.
```

### Frame 2 (Glow Variant) Adjustments
- Increase glow intensity 40%
- Add motion-blur-like wing streaks
- Brighten afterburner flame

---

## 2. BASTION (Tank Class — D-03)

### Veo 3.1 Prompt
```
16-bit retro sci-fi starfighter sprite, massive armored bulk design,
gold-yellow (#ffcc00) heavy reinforced plating, thick angular hull,
dual forward cannon mounts visible, fortress-like broad silhouette,
slow-burning orange afterburner glow, pixel art texture,
transparent background, 256x256 sprite sheet frame,
Darius Star game asset, top-down view, intimidating presence,
retro arcade shmup style, heavy metal shading
```

### Imagen Prompt
```
A 16-bit pixel art heavy armored spaceship sprite for a retro arcade shoot-em-up game.
Broad wide design with gold (#ffcc00) reinforced plating and angular armor panels.
Thick hull with dual forward cannon mounts visible. Fortress-like intimidating silhouette.
Transparent background, 256x256 pixels, top-down orientation.
Pixel art with metallic shading, limited color palette, crisp edges.
```

### Frame 2 (Glow Variant) Adjustments
- Gold armor panels glow brighter
- Shield shimmer overlay on hull
- Cannon tips charged (brighter)

---

## 3. TEMPEST (DPS Class — F-04)

### Veo 3.1 Prompt
```
16-bit retro sci-fi starfighter sprite, aggressive wide-body design,
hot-rod red-pink (#ff0055) racing stripes along fuselage,
multiple visible weapon barrels (5 barrels in fan pattern),
heat-vent panels glowing orange along wings,
intimidating front-heavy combat stance, pixel art texture,
transparent background, 256x256 sprite sheet frame,
Darius Star game asset, top-down view, aggressive angles,
retro arcade shmup style, weapon-forward silhouette
```

### Imagen Prompt
```
A 16-bit pixel art heavy firepower spaceship sprite for a retro arcade shoot-em-up game.
Wide aggressive design with red (#ff0055) hot-rod stripe accents along the fuselage.
Multiple visible weapon barrels (5 barrels arranged in a fan spread).
Heat-vent panels along wings glowing orange. Intimidating combat stance.
Transparent background, 256x256 pixels, top-down orientation.
Pixel art with bold contrast, limited palette, crisp edges.
```

### Frame 2 (Glow Variant) Adjustments
- Weapon barrels glow red-hot
- Heat vents bright orange
- Stripes pulse brighter

---

## 4. SPECTER (Stealth Class — A-05)

### Veo 3.1 Prompt
```
16-bit retro sci-fi starfighter sprite, low-profile stealth design,
purple-violet (#b026ff) phase-shift shimmer along geometric hull edges,
angular radar-absorbing faceted geometry, minimal visible engine signature,
predatory crouched stance, dark metallic hull with purple undertones,
pixel art texture, transparent background, 256x256 sprite sheet frame,
Darius Star game asset, top-down view, stealth bomber silhouette,
retro arcade shmup style, subtle glow only at edges
```

### Imagen Prompt
```
A 16-bit pixel art stealth spaceship sprite for a retro arcade shoot-em-up game.
Low-profile angular design with purple (#b026ff) phase-shift glow only at the edges.
Radar-absorbing geometric faceted hull panels. Minimal visible engine output.
Predatory crouched stance. Dark metallic hull with subtle purple undertones.
Transparent background, 256x256 pixels, top-down orientation.
Pixel art with muted palette, crisp geometric edges, mostly dark with edge highlights.
```

### Frame 2 (Glow Variant) Adjustments
- Phase-shift glow intensifies (purple brighter)
- Ship becomes slightly more transparent/ethereal
- Edge highlights pulse

---

## Integration Notes

After generation:
1. Save frames as `assets/sprites/<ship_id>_0.png` and `assets/sprites/<ship_id>_1.png`
   - E.g.: `phantom_0.png`, `phantom_1.png`
2. Run `python3 generate_sprites_manifest.py` to update `assets/sprites.json`
3. Update `ship_select.html` ship emojis to `<img>` tags loading the real sprites
4. The game's `index.html` references sprites by `playerSprites['phantom_0']` etc.

## Color Reference

| Ship     | Hex       | RGB              |
|----------|-----------|------------------|
| STRIKER  | `#00ffff` | (0, 255, 255)   |
| PHANTOM  | `#00ffaa` | (0, 255, 170)   |
| BASTION  | `#ffcc00` | (255, 204, 0)   |
| TEMPEST  | `#ff0055` | (255, 0, 85)    |
| SPECTER  | `#b026ff` | (176, 38, 255)  |
