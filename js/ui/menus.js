// js/ui/menus.js — Main menu rendering (Nyxa Command Bridge In-Universe Cockpit UI)

function drawMainMenu(ctx) {
    if (typeof CockpitUI !== 'undefined') {
        CockpitUI.drawCockpitGrid(ctx, canvas.width, canvas.height, (typeof gameTime !== 'undefined' ? gameTime : 0));
    }
    drawTitleLogo();
    
    ctx.save();
    
    // Check save availability
    const hasSaves = (() => {
        try {
            const saves = JSON.parse(localStorage.getItem('darius_star_saves') || 'null');
            if (!Array.isArray(saves)) return false;
            return saves.some(s => s !== null);
        } catch(e) { return false; }
    })();

    // 1. Left Telemetry Panel: PILOT STATUS & SINGULARITY CORE
    const leftPanelX = 40;
    const leftPanelY = 160;
    const leftPanelW = 270;
    const leftPanelH = 240;

    if (typeof CockpitUI !== 'undefined') {
        CockpitUI.drawPanel(ctx, leftPanelX, leftPanelY, leftPanelW, leftPanelH, {
            borderColor: 'rgba(0, 200, 255, 0.35)',
            bgColor: 'rgba(6, 14, 28, 0.92)',
            bracketColor: '#ffaa00',
            headerBar: true,
            headerBarHeight: 20
        });

        // Left Panel Header
        ctx.textAlign = 'left';
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('📡 PILOT TELEMETRY & STATUS', leftPanelX + 12, leftPanelY + 14);

        // Pilot Info
        const rowStartY = leftPanelY + 38;
        CockpitUI.drawDataRow(ctx, leftPanelX + 12, rowStartY, 'PILOT:', 'DARIUS STAR', { labelColor: '#88aacc', valueColor: '#ffffff' });
        CockpitUI.drawDataRow(ctx, leftPanelX + 12, rowStartY + 18, 'CALLSIGN:', "'STAR'", { labelColor: '#88aacc', valueColor: '#00ffff' });
        CockpitUI.drawDataRow(ctx, leftPanelX + 12, rowStartY + 36, 'NAVIGATOR:', 'LYRA STAR (AI/CO-PILOT)', { labelColor: '#88aacc', valueColor: '#00ff88' });
        CockpitUI.drawDataRow(ctx, leftPanelX + 12, rowStartY + 54, 'VESSEL:', 'NYXA-CLASS DEEP FIGHTER', { labelColor: '#88aacc', valueColor: '#ffffff' });

        // Scrap Core
        const lifetimeScrap = window.DS_UpgradeSystem ? window.DS_UpgradeSystem.state.scrap : 0;
        ctx.fillStyle = 'rgba(255, 200, 0, 0.12)';
        ctx.fillRect(leftPanelX + 10, rowStartY + 70, leftPanelW - 20, 28);
        ctx.strokeStyle = 'rgba(255, 170, 0, 0.35)';
        ctx.strokeRect(leftPanelX + 10, rowStartY + 70, leftPanelW - 20, 28);

        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`💎 QUANTUM SCRAP: ${lifetimeScrap.toLocaleString()}`, leftPanelX + 18, rowStartY + 88);

        // High Score Galactic Archives
        const topScrap = window.Leaderboard ? Leaderboard.getTop('scrapLord', 1)[0] : null;
        const topTime = window.Leaderboard ? Leaderboard.getTop('speedrun', 1)[0] : null;
        
        ctx.fillStyle = '#88aacc';
        ctx.font = 'bold 9.5px monospace';
        ctx.fillText('🏆 SECTOR GALACTIC RECORD:', leftPanelX + 12, rowStartY + 118);
        
        if (topScrap) {
            ctx.fillStyle = '#ffaa00';
            ctx.font = '9px monospace';
            ctx.fillText(`SCRAP: ${topScrap.scrapCollected.toLocaleString()} (${topScrap.ship.toUpperCase()})`, leftPanelX + 12, rowStartY + 134);
            if (topTime) {
                const val = topTime.timeSeconds;
                const m = Math.floor(val / 60);
                const sec = Math.floor(val % 60);
                ctx.fillText(`TIME: ${m}:${sec.toString().padStart(2, '0')} (${topTime.ship.toUpperCase()})`, leftPanelX + 12, rowStartY + 148);
            }
        } else {
            ctx.fillStyle = '#5a6a8a';
            ctx.font = '9px monospace';
            ctx.fillText('NO ARCHIVED RUNS IN DATABASE', leftPanelX + 12, rowStartY + 134);
        }

        // Precursor Sub-System Status
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 9.5px monospace';
        ctx.fillText('● PRECURSOR SENSORS: ONLINE', leftPanelX + 12, rowStartY + 172);
    }

    // 2. Right Operations Menu Switchboard
    const rightPanelX = 330;
    const startY = 160;
    const btnW = 430;
    const btnH = 30;
    const spacing = 35;

    const menuHotkeys = ['[C]', '[SPACE]', '[U]', '[H]', '[O]', '[T]', '[X]'];

    for (let i = 0; i < menuOptions.length; i++) {
        const itemY = startY + i * spacing;
        const isSelected = selectedMenuIndex === i;
        const isHovered = hoveredMenuIndex === i && !isSelected;
        const isContinue = (menuOptions[i] === 'CONTINUE');
        const grayedOut = isContinue && !hasSaves;
        const hotkey = menuHotkeys[i] || '';

        let label = menuOptions[i];
        if (isContinue) {
            label = hasSaves ? 'CONTINUE CAMPAIGN' : 'CONTINUE (NO SAVES)';
        }

        if (typeof CockpitUI !== 'undefined') {
            CockpitUI.drawAvionicsButton(ctx, rightPanelX, itemY, btnW, btnH, label, hotkey, isSelected, isHovered, {
                primaryColor: '#00ffff',
                accentColor: '#ffaa00',
                disabled: grayedOut,
                font: 'bold 11.5px monospace'
            });
        }
    }
    
    // Bottom Navigation Hint
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6a7a9a';
    ctx.font = '10px monospace';
    ctx.fillText('W/S or ARROWS to NAVIGATE  |  ENTER / CLICK to ENGAGE  |  F FULLSCREEN', canvas.width / 2, canvas.height - 14);
    ctx.restore();
}
