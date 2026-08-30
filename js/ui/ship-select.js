// js/ui/ship-select.js — Fighter selection screen with in-universe Hangar Bay 7 HUD

function drawShipSelect(ctx) {
    if (typeof CockpitUI !== 'undefined') {
        CockpitUI.drawCockpitGrid(ctx, canvas.width, canvas.height, (typeof gameTime !== 'undefined' ? gameTime : 0));
    }

    ctx.save();
    
    // 1. Header Banner
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 22px monospace';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 12;
    ctx.fillText('HANGAR BAY 7 // VESSEL FABRICATION DOCK', canvas.width / 2, 42);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 10.5px monospace';
    ctx.fillText('SELECT COMBAT CHASSIS & ASSIGNED PILOT CONFIGURATION', canvas.width / 2, 58);
    
    const startY = 82;
    const spacing = 50;
    const shipDetails = [
        { name: 'X-1 STRIKER', pilot: 'DARIUS STAR', sprite: 'player_0', speed: 240, shield: 100, specName: 'SHOCK LANCE', color: '#00ffff', desc: 'Balanced deep-recon fighter. High burst forward lance.' },
        { name: 'PHANTOM', pilot: 'CROSS // CYBERNETIC', sprite: 'player_phantom_0', speed: 280, shield: 80, specName: 'PHASE SHIFT', color: '#bf55ec', desc: 'High-speed stealth interceptor with phase invulnerability.' },
        { name: 'Z-3 BASTION', pilot: 'COMMANDER THORNE', sprite: 'player_bastion_0', speed: 170, shield: 150, specName: 'IRON CURTAIN', color: '#f39c12', desc: 'Heavy armored assault dreadnought with invulnerable frontal barrier.' },
        { name: 'Y-2 TEMPEST', pilot: 'RECON SQUAD ALPHA', sprite: 'player_tempest_0', speed: 220, shield: 110, specName: 'OVERLOAD PULSE', color: '#2ecc71', desc: 'EMP discharge chassis that cleanses enemy bullet fields.' },
        { name: 'SPECTER', pilot: 'CHRONO ECHO', sprite: 'player_specter_0', speed: 260, shield: 90, specName: 'SHADOW CLONE', color: '#3498db', desc: 'Chrono-splitting fighter projecting twin weapon decoys.' },
        { name: 'WARDEN', pilot: 'NAYA THORNE', sprite: 'player_warden_0', speed: 230, shield: 130, specName: 'BIO-SURGE', color: '#e74c3c', desc: 'Precursor nanite healer with automated Point Defense Grid.' }
    ];
    
    const cardW = 720;
    const cardH = 44;
    const cardX = (canvas.width - cardW) / 2;

    for (let i = 0; i < shipDetails.length; i++) {
        const itemY = startY + i * spacing;
        const isSelected = selectedShipIndex === i;
        const isHovered = hoveredShipIndex === i;
        const info = shipDetails[i];
        
        if (typeof CockpitUI !== 'undefined') {
            CockpitUI.drawPanel(ctx, cardX, itemY, cardW, cardH, {
                chamfer: 6,
                borderColor: isSelected ? '#00ffff' : (isHovered ? '#ffaa00' : 'rgba(0, 200, 255, 0.22)'),
                bgColor: isSelected ? 'rgba(0, 255, 255, 0.14)' : (isHovered ? 'rgba(255, 170, 0, 0.08)' : 'rgba(8, 16, 32, 0.85)'),
                bracketColor: isSelected ? '#00ffff' : '#ffaa00',
                glow: isSelected || isHovered,
                shadowBlur: isSelected ? 12 : 6,
                brackets: isSelected
            });
        }
        
        // Ship Sprite Icon Box
        const spriteBoxX = cardX + 8;
        const spriteBoxY = itemY + 4;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(spriteBoxX, spriteBoxY, 36, 36);
        ctx.strokeStyle = isSelected ? '#00ffff' : 'rgba(255,255,255,0.2)';
        ctx.strokeRect(spriteBoxX, spriteBoxY, 36, 36);

        const sprite = playerSprites[info.sprite];
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, spriteBoxX + 3, spriteBoxY + 3, 30, 30);
        } else {
            ctx.fillStyle = info.color;
            ctx.fillRect(spriteBoxX + 10, spriteBoxY + 10, 16, 16);
        }
        
        // Ship Title & Pilot
        ctx.textAlign = 'left';
        ctx.font = 'bold 12.5px monospace';
        ctx.fillStyle = isSelected ? '#00ffff' : '#ffffff';
        ctx.fillText(info.name, cardX + 54, itemY + 16);
        
        ctx.font = 'bold 9.5px monospace';
        ctx.fillStyle = '#88aacc';
        ctx.fillText(`PILOT: ${info.pilot}`, cardX + 180, itemY + 16);

        // Power Meters
        const meterY = itemY + 24;
        
        // Speed Meter
        ctx.font = '9px monospace';
        ctx.fillStyle = '#88aacc';
        ctx.fillText('SPD', cardX + 54, meterY + 9);
        if (typeof CockpitUI !== 'undefined') {
            CockpitUI.drawSegmentedBar(ctx, cardX + 78, meterY + 2, 70, 8, info.speed, 300, {
                segments: 6,
                activeColor: '#00ffff'
            });
        }

        // Shield Meter
        ctx.fillStyle = '#88aacc';
        ctx.fillText('SHD', cardX + 160, meterY + 9);
        if (typeof CockpitUI !== 'undefined') {
            CockpitUI.drawSegmentedBar(ctx, cardX + 184, meterY + 2, 70, 8, info.shield, 160, {
                segments: 6,
                activeColor: '#00ff88'
            });
        }

        // Special Weapon Tag
        ctx.fillStyle = '#88aacc';
        ctx.fillText('SPEC:', cardX + 270, meterY + 9);
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 9.5px monospace';
        ctx.fillText(info.specName, cardX + 305, meterY + 9);

        // Description / Role
        ctx.fillStyle = isSelected ? '#ffffff' : '#7f8c9d';
        ctx.font = 'italic 9px monospace';
        ctx.fillText(info.desc, cardX + 430, meterY + 9);
        
        // Status Badge
        if (isSelected) {
            ctx.textAlign = 'right';
            ctx.font = 'bold 11px monospace';
            ctx.fillStyle = '#00ffff';
            ctx.fillText('▶ ENGAGED', cardX + cardW - 14, itemY + 26);
        }
    }
    
    // Footer Navigation Controls
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ff3355';
    ctx.fillText('[ESC] RETURN TO BRIDGE', canvas.width / 2, canvas.height - 30);
    
    ctx.fillStyle = '#6a7a9a';
    ctx.font = '10px monospace';
    ctx.fillText('UP/DOWN to Select  |  ENTER / CLICK to Launch Fighter  |  ESC to Return', canvas.width / 2, canvas.height - 12);
    ctx.restore();
}
