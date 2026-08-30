// js/ui/settings.js — In-Universe Avionics & Sensor Configuration Screen

function drawSettings(ctx) {
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
    ctx.fillText('AVIONICS & SENSOR CALIBRATION', canvas.width / 2, 42);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 10.5px monospace';
    ctx.fillText('HARDWARE AUDIO, FLIGHT THREAT PROFILES & NARRATIVE SYSTEMS', canvas.width / 2, 58);
    
    const panelX = 50;
    const panelY = 78;
    const panelW = 700;
    const panelH = 325;

    if (typeof CockpitUI !== 'undefined') {
        CockpitUI.drawPanel(ctx, panelX, panelY, panelW, panelH, {
            borderColor: 'rgba(0, 200, 255, 0.35)',
            bgColor: 'rgba(6, 14, 28, 0.94)',
            bracketColor: '#ffaa00',
            headerBar: true,
            headerBarHeight: 22
        });

        ctx.textAlign = 'left';
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('⚙️ COCKPIT FLIGHT PARAMETERS', panelX + 14, panelY + 15);
    }
    
    const startY = panelY + 42;
    const spacing = 30;
    
    for (let i = 0; i < SETTINGS_OPTIONS.length; i++) {
        const itemY = startY + i * spacing;
        const isSelected = selectedSettingsIndex === i;
        const rowH = 26;
        const rowX = panelX + 16;
        const rowW = panelW - 32;

        // Row Highlight Box
        if (isSelected) {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.12)';
            ctx.fillRect(rowX, itemY - 6, rowW, rowH);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(rowX, itemY - 6, rowW, rowH);
        }
        
        ctx.textAlign = 'left';
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = isSelected ? '#00ffff' : '#88aacc';
        
        if (i < 3) {
            // Audio Channels with Segmented LED Meters
            const volVal = i === 0 ? masterVolume : (i === 1 ? sfxVolume : musicVolume);
            ctx.fillText(SETTINGS_OPTIONS[i], rowX + 12, itemY + 11);
            
            const meterX = rowX + 240;
            const meterW = 260;
            if (typeof CockpitUI !== 'undefined') {
                CockpitUI.drawSegmentedBar(ctx, meterX, itemY - 1, meterW, 14, volVal, 1.0, {
                    segments: 16,
                    activeColor: isSelected ? '#00ffff' : '#00aaee',
                    glow: isSelected
                });
            }
            
            ctx.textAlign = 'right';
            ctx.fillStyle = isSelected ? '#ffffff' : '#88aacc';
            ctx.font = 'bold 11.5px monospace';
            ctx.fillText(`${Math.round(volVal * 100)}%`, rowX + rowW - 14, itemY + 11);

        } else if (i === 3) {
            // Difficulty Flight Profile
            ctx.fillText(SETTINGS_OPTIONS[i], rowX + 12, itemY + 11);
            const cfg = getCurrentDifficultyConfig();
            
            const diffColor = cfg.id === 'easy' ? '#00ff88' : (cfg.id === 'normal' ? '#ffaa00' : (cfg.id === 'hard' ? '#ff0055' : '#cc44ff'));
            ctx.fillStyle = diffColor;
            ctx.font = 'bold 12px monospace';
            ctx.fillText(`[ ${cfg.label.toUpperCase()} ]`, rowX + 240, itemY + 11);

            ctx.textAlign = 'right';
            ctx.fillStyle = '#88aacc';
            ctx.font = 'italic 9.5px monospace';
            const multText = cfg.id === 'easy' ? 'Damage x0.75 | 5 Lives' : (cfg.id === 'normal' ? 'Damage x1.0 | 3 Lives' : (cfg.id === 'hard' ? 'Damage x1.5 | 2 Lives (ACE)' : 'Damage x2.0 | 1 Life (CYBER)'));
            ctx.fillText(multText, rowX + rowW - 14, itemY + 11);

        } else if (i >= 4 && i <= 7) {
            // Narrative and Accessibility Hardware Switches
            ctx.fillText(SETTINGS_OPTIONS[i], rowX + 12, itemY + 11);
            let toggleVal = false;
            if (i === 4) toggleVal = audioTunnelsEnabled;
            else if (i === 5) toggleVal = banterEnabled;
            else if (i === 6) toggleVal = streamerMode;
            else if (i === 7) toggleVal = subtitlesEnabled;

            const switchColor = toggleVal ? '#00ff88' : '#ff3355';
            
            // Switch Status Indicator Pill
            ctx.fillStyle = toggleVal ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 51, 85, 0.15)';
            ctx.fillRect(rowX + 240, itemY - 2, 70, 16);
            ctx.strokeStyle = switchColor;
            ctx.strokeRect(rowX + 240, itemY - 2, 70, 16);

            ctx.textAlign = 'center';
            ctx.fillStyle = switchColor;
            ctx.font = 'bold 10px monospace';
            ctx.fillText(toggleVal ? 'ONLINE' : 'OFFLINE', rowX + 275, itemY + 10);

            // Descriptive Subtitle
            ctx.textAlign = 'right';
            ctx.fillStyle = '#6a7a9a';
            ctx.font = 'italic 9.5px monospace';
            const toggleDesc = i === 4 ? 'Between-Sector Radio Tunnels' :
                               i === 5 ? 'Contextual In-Flight Character Comms' :
                               i === 6 ? 'Mute Spoken Voice for Content Streamers' :
                               'High-Visibility Comms Subtitles';
            ctx.fillText(toggleDesc, rowX + rowW - 14, itemY + 11);

        } else if (i === 8) {
            // Return to Bridge
            ctx.textAlign = 'center';
            ctx.fillStyle = isSelected ? '#ff3355' : '#88aacc';
            ctx.font = 'bold 12px monospace';
            ctx.fillText('[ESC] RETURN TO COMMAND BRIDGE', panelX + panelW / 2, itemY + 11);
        }
    }
    
    // Footer Hints
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6a7a9a';
    ctx.font = '10px monospace';
    ctx.fillText('LEFT/RIGHT to Adjust Values  |  ENTER / CLICK to Toggle  |  ESC to Return to Bridge', canvas.width / 2, canvas.height - 14);
    ctx.restore();
}
