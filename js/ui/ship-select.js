// js/ui/ship-select.js — Ship selection screen with stat cards
// EXTRACTED from js/ui.js drawMenuScreens() (GRO-1062)
// Loaded BEFORE ui.js so drawShipSelect(ctx) is defined when drawMenuScreens() calls it

function drawShipSelect(ctx) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 22px monospace';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fillText('SELECT YOUR FIGHTER', canvas.width / 2, 60);
    ctx.shadowBlur = 0;
    
    const startY = 110;
    const spacing = 44;
    const shipDetails = [
        { name: 'X-1 STRIKER', sprite: 'player_0', speed: '240', shield: '100', special: 'SHOCK LANCE', color: '#00ffff' },
        { name: 'PHANTOM', sprite: 'player_phantom_0', speed: '280', shield: '80', special: 'PHASE SHIFT', color: '#bf55ec' },
        { name: 'Z-3 BASTION', sprite: 'player_bastion_0', speed: '170', shield: '150', special: 'IRON CURTAIN', color: '#f39c12' },
        { name: 'Y-2 TEMPEST', sprite: 'player_tempest_0', speed: '220', shield: '110', special: 'OVERLOAD PULSE', color: '#2ecc71' },
        { name: 'SPECTER', sprite: 'player_specter_0', speed: '260', shield: '90', special: 'SHADOW CLONE', color: '#3498db' },
        { name: 'WARDEN (NAYA)', sprite: 'player_warden_0', speed: '230', shield: '130', special: 'BIO-SURGE', color: '#e74c3c' }
    ];
    
    for (let i = 0; i < shipDetails.length; i++) {
        const itemY = startY + i * spacing;
        const isSelected = selectedShipIndex === i;
        const isHovered = hoveredShipIndex === i;
        const info = shipDetails[i];
        
        ctx.fillStyle = isSelected ? 'rgba(0, 255, 255, 0.12)' : (isHovered ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)');
        ctx.strokeStyle = isSelected ? '#00ffff' : (isHovered ? '#8a8a9f' : '#2a2a3a');
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.fillRect(80, itemY - 18, 640, 38);
        ctx.strokeRect(80, itemY - 18, 640, 38);
        
        const sprite = playerSprites[info.sprite];
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, 95, itemY - 14, 30, 30);
        } else {
            ctx.fillStyle = info.color;
            ctx.fillRect(100, itemY - 8, 16, 16);
        }
        
        ctx.textAlign = 'left';
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = isSelected ? '#00ffff' : '#dcdde1';
        ctx.fillText(info.name, 145, itemY - 2);
        
        ctx.font = '10px monospace';
        ctx.fillStyle = isSelected ? '#ffffff' : '#7f8c8d';
        ctx.fillText(`SPD: ${info.speed} | SHD: ${info.shield} | SPEC: ${info.special}`, 145, itemY + 12);
        
        if (isSelected) {
            ctx.font = 'bold 12px monospace';
            ctx.fillStyle = '#00ffff';
            ctx.fillText('SELECTED', 630, itemY + 5);
        }
    }
    
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#ff0055';
    ctx.fillText('BACK TO MENU', canvas.width / 2, 390);
    
    ctx.fillStyle = '#4a4a5f';
    ctx.font = '10px monospace';
    ctx.fillText('UP/DOWN to Select  |  ENTER / CLICK to Choose  |  ESC to Return', canvas.width / 2, canvas.height - 18);
    ctx.restore();
}
