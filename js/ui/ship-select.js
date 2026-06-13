// js/ui/ship-select.js — Ship selection screen with stat cards
// EXTRACTED from js/ui.js drawMenuScreens() (GRO-1062)
// Loaded BEFORE ui.js so drawShipSelect(ctx) is defined when drawMenuScreens() calls it

export function drawShipSelect(ctx) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 22px monospace';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fillText('SELECT YOUR FIGHTER', canvas.width / 2, 60);
    ctx.shadowBlur = 0;
    
    const startY = 140;
    const spacing = 65;
    const shipNames = ['X-1 SCOUT', 'Y-2 INTERCEPTOR', 'Z-3 DREADNOUGHT'];
    const shipStats = [
        { speed: 'HIGH (280)', shield: 'LOW (80)', weapon: 'RAPID SINGLE' },
        { speed: 'MID (220)', shield: 'MID (100)', weapon: 'SPREAD DOUBLE' },
        { speed: 'LOW (170)', shield: 'HIGH (150)', weapon: 'SLOW WAVE' }
    ];
    
    for (let i = 0; i < 3; i++) {
        const itemY = startY + i * spacing;
        const isSelected = selectedShipIndex === i;
        
        ctx.fillStyle = isSelected ? 'rgba(0, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)';
        ctx.strokeStyle = isSelected ? '#00ffff' : '#3a3a4a';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.fillRect(80, itemY - 25, 640, 52);
        ctx.strokeRect(80, itemY - 25, 640, 52);
        
        const spriteKey = i === 0 ? 'scout_0' : (i === 2 ? 'heavy_0' : 'interceptor_0');
        const sprite = playerSprites[spriteKey];
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, 105, itemY - 20, 40, 40);
        } else {
            ctx.fillStyle = i === 0 ? '#00ffff' : (i === 2 ? '#ff9900' : '#00ffaa');
            ctx.fillRect(115, itemY - 10, 20, 20);
        }
        
        ctx.textAlign = 'left';
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = isSelected ? '#00ffff' : '#8a8a9f';
        ctx.fillText(shipNames[i], 170, itemY - 5);
        
        ctx.font = '10px monospace';
        ctx.fillStyle = isSelected ? '#ffffff' : '#6a6a7f';
        ctx.fillText(`SPEED: ${shipStats[i].speed}  |  SHIELD: ${shipStats[i].shield}  |  WEAPON: ${shipStats[i].weapon}`, 170, itemY + 14);
        
        if (isSelected) {
            ctx.font = 'bold 14px monospace';
            ctx.fillStyle = '#00ffff';
            ctx.fillText('SELECTED', 620, itemY + 5);
        }
    }
    
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#ff0055';
    ctx.fillText('BACK TO MENU', canvas.width / 2, 365);
    
    ctx.fillStyle = '#4a4a5f';
    ctx.font = '10px monospace';
    ctx.fillText('ENTER / CLICK to CHOOSE  |  ESC to RETURN', canvas.width / 2, canvas.height - 25);
    ctx.restore();
}

// ES Module bridge — publish exports to global scope for cross-module access
window.drawShipSelect = drawShipSelect;
