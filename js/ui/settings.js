// js/ui/settings.js — Pause menu with volume sliders, difficulty, toggles
// EXTRACTED from js/ui.js drawMenuScreens() (GRO-1062)
// Loaded BEFORE ui.js so drawSettings(ctx) is defined when drawMenuScreens() calls it

export function drawSettings(ctx) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 22px monospace';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fillText('SYSTEM SETTINGS', canvas.width / 2, 60);
    ctx.shadowBlur = 0;
    
    const startY = 175;
    const spacing = 36;
    
    for (let i = 0; i < SETTINGS_OPTIONS.length; i++) {
        const itemY = startY + i * spacing;
        const isSelected = selectedSettingsIndex === i;
        
        ctx.textAlign = 'left';
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = isSelected ? '#00ffff' : '#8a8a9f';
        
        if (i < 3) {
            const volVal = i === 0 ? masterVolume : (i === 1 ? sfxVolume : musicVolume);
            ctx.fillText(SETTINGS_OPTIONS[i], 220, itemY + 5);
            
            const sliderX = 450;
            const sliderWidth = 130;
            ctx.fillStyle = '#222';
            ctx.fillRect(sliderX, itemY - 6, sliderWidth, 12);
            
            ctx.fillStyle = isSelected ? '#00ffff' : '#ff0055';
            ctx.fillRect(sliderX, itemY - 6, sliderWidth * volVal, 12);
            
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(sliderX, itemY - 6, sliderWidth, 12);
            
            ctx.fillText(Math.round(volVal * 100) + '%', 595, itemY + 5);
        } else if (i === 3) {
            ctx.fillText(SETTINGS_OPTIONS[i], 220, itemY + 5);
            const cfg = getCurrentDifficultyConfig();
            ctx.fillStyle = isSelected ? '#ffffff' : '#6a6a7f';
            ctx.fillText(`${cfg.label} (${cfg.id.toUpperCase()})`, 450, itemY + 5);
        } else if (i >= 4 && i <= 7) {
            // Toggle settings: AUDIO TUNNELS, BANTER SYSTEM, STREAMER MODE, SUBTITLES
            ctx.fillText(SETTINGS_OPTIONS[i], 220, itemY + 5);
            let toggleVal = false;
            if (i === 4) toggleVal = audioTunnelsEnabled;
            else if (i === 5) toggleVal = banterEnabled;
            else if (i === 6) toggleVal = streamerMode;
            else if (i === 7) toggleVal = subtitlesEnabled;
            ctx.fillStyle = toggleVal ? '#00ff88' : '#ff3355';
            ctx.fillText(toggleVal ? 'ON' : 'OFF', 470, itemY + 5);
            // Draw toggle indicator
            ctx.fillStyle = toggleVal ? '#00ff88' : '#ff3355';
            ctx.beginPath();
            ctx.arc(445, itemY + 1, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (i === 8) {
            ctx.textAlign = 'center';
            ctx.fillStyle = isSelected ? '#ff0055' : '#8a8a9f';
            ctx.fillText('BACK TO MENU', canvas.width / 2, itemY + 5);
        }
    }
    
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4a4a5f';
    ctx.font = '10px monospace';
    ctx.fillText('CONTROLS: WASD / ARROWS to MOVE  |  SPACE / J to FIRE  |  E to DODGE  |  P to PAUSE', canvas.width / 2, 335);
    ctx.fillText('LEFT/RIGHT to ADJUST VOLUME  |  ENTER / CLICK to TOGGLE  |  ESC to RETURN', canvas.width / 2, canvas.height - 25);
    ctx.restore();
}

// ES Module bridge — publish exports to global scope for cross-module access
window.drawSettings = drawSettings;
