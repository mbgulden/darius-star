// js/ui/menus.js — Main menu rendering (GRO-1062)
// EXTRACTED from js/ui.js drawMenuScreens()
// Loaded BEFORE ui.js so drawMainMenu(ctx) is defined when drawMenuScreens() calls it
// NOTE: CREDITS and CINEMATIC extraction still pending — they remain in ui.js for now

export function drawMainMenu(ctx) {
    drawTitleLogo();
    
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 15px monospace';
    
    const startY = 210;
    const spacing = 35;
    
    // Draw lifetime scrap balance on the menu screen
    const lifetimeScrap = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.state.scrap : 0;
    ctx.fillStyle = '#00ff55';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`⚙️ SCRAP CORE: ${lifetimeScrap.toLocaleString()}`, canvas.width / 2, startY - 45);
    
    // Show high score on menu
    const topScrap = window.Leaderboard ? Leaderboard.getTop('scrapLord', 1)[0] : null;
    const topTime = window.Leaderboard ? Leaderboard.getTop('speedrun', 1)[0] : null;
    if (topScrap) {
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 12px monospace';
        let text = `★ RECORD: ${topScrap.scrapCollected.toLocaleString()} SCRAP (${topScrap.ship.toUpperCase()})`;
        if (topTime) {
            const val = topTime.timeSeconds;
            const m = Math.floor(val / 60);
            const sec = Math.floor(val % 60);
            text += ` | ⏱ TIME: ${m}:${sec.toString().padStart(2, '0')} (${topTime.ship.toUpperCase()})`;
        }
        ctx.fillText(text, canvas.width / 2, startY - 25);
    }
    
    ctx.font = 'bold 15px monospace';
    const hasSaves = (() => {
        try {
            const saves = JSON.parse(localStorage.getItem('darius_star_saves') || 'null');
            if (!Array.isArray(saves)) return false;
            return saves.some(s => s !== null);
        } catch(e) { return false; }
    })();
    for (let i = 0; i < menuOptions.length; i++) {
        const itemY = startY + i * spacing;
        const isSelected = selectedMenuIndex === i;
        const isHovered = hoveredMenuIndex === i && !isSelected;
        const isContinue = (menuOptions[i] === 'CONTINUE');
        const grayedOut = isContinue && !hasSaves;
        
        if (isSelected) {
            ctx.fillStyle = grayedOut ? '#445555' : '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = grayedOut ? 2 : 10;
            ctx.fillText(`>  ${menuOptions[i]}  <`, canvas.width / 2, itemY);
            ctx.shadowBlur = 0;
        } else if (isHovered) {
            ctx.fillStyle = grayedOut ? '#555533' : '#ffaa00';
            ctx.shadowColor = '#ffaa00';
            ctx.shadowBlur = 6;
            ctx.fillText(menuOptions[i], canvas.width / 2, itemY);
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = grayedOut ? '#333344' : '#8a8a9f';
            ctx.fillText(menuOptions[i], canvas.width / 2, itemY);
        }
        if (isContinue && hasSaves) {
            ctx.fillStyle = '#00ff55';
            ctx.font = '9px monospace';
            ctx.fillText('● SAVES AVAILABLE', canvas.width / 2, itemY + 15);
            ctx.font = 'bold 15px monospace';
        } else if (isContinue && !hasSaves) {
            ctx.fillStyle = '#666';
            ctx.font = '9px monospace';
            ctx.fillText('NO SAVES FOUND', canvas.width / 2, itemY + 15);
            ctx.font = 'bold 15px monospace';
        }
    }
    
    ctx.fillStyle = '#4a4a5f';
    ctx.font = '10px monospace';
    ctx.fillText('USE W/S or ARROWS to NAVIGATE | ENTER to SELECT', canvas.width / 2, canvas.height - 25);
    ctx.restore();
}

// ES Module bridge — publish exports to global scope for cross-module access
window.drawMainMenu = drawMainMenu;
