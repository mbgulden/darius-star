/**
 * UI and Menu Rendering for Darius Star
 */

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

// --- FloatingText Class ---
class FloatingText {
    constructor(x, y, text, color = '#00ff55') {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.alpha = 1.0;
        this.vy = -40; // floating upwards
        this.life = 1.0; // seconds
    }
    update(dt) {
        this.y += this.vy * dt;
        this.life -= dt;
        this.alpha = Math.max(0, this.life);
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

function drawTitleBackground(ctx, canvas, stars, titleBgLoaded, titleBgImage, titleBgFrame, TITLE_FRAME_WIDTH, TITLE_FRAME_HEIGHT) {
    if (titleBgLoaded && titleBgImage.naturalWidth > 0) {
        const sx = titleBgFrame * TITLE_FRAME_WIDTH;
        const sy = 0;
        ctx.drawImage(titleBgImage,
            sx, sy, TITLE_FRAME_WIDTH, TITLE_FRAME_HEIGHT,
            0, 0, canvas.width, canvas.height
        );
    } else {
        ctx.fillStyle = '#01010c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        stars.forEach(star => {
            const alpha = star.getAlpha();
            ctx.globalAlpha = alpha;
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        ctx.globalAlpha = 1.0;
    }
}

function drawTitleLogo(ctx, canvas, gameTime, titleLogoLoaded, titleLogoImg) {
    if (titleLogoLoaded && titleLogoImg.naturalWidth > 0) {
        ctx.save();
        const lw = 420;
        const lh = 140;
        const lx = canvas.width / 2 - lw / 2;
        const ly = 30 + Math.sin(gameTime * 2.5) * 6; // floating effect

        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 12 + Math.sin(gameTime * 5) * 6;
        ctx.drawImage(titleLogoImg, lx, ly, lw, lh);
        ctx.restore();
    } else {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = 'bold 36px Courier New';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15 + Math.sin(gameTime * 5) * 8;
        ctx.fillStyle = '#00ffff';
        ctx.fillText('DARIUS STAR', canvas.width / 2, 85 + Math.sin(gameTime * 2) * 4);

        ctx.font = 'bold 16px Courier New';
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 8;
        ctx.fillText('CYBER COELACANTH', canvas.width / 2, 115 + Math.sin(gameTime * 2) * 4);
        ctx.restore();
    }
}

function drawMenuScreens(ctx, canvas, currentScreen, SCREENS, gameTime, selectedMenuIndex, menuOptions, titleBgLoaded, titleBgImage, titleBgFrame, TITLE_FRAME_WIDTH, TITLE_FRAME_HEIGHT, titleLogoLoaded, titleLogoImg, stars, selectedShipIndex, playerSprites, selectedSettingsIndex, SETTINGS_OPTIONS, masterVolume, sfxVolume, musicVolume, difficulty, leaderboardFilter, leaderboardScrollOffset, creditsScrollY, endingSunriseLoaded, endingSunriseImg, cinematicTime, selectedShip, studioLogoLoaded, studioLogoImg, getTopScore, getFilteredScores) {
    drawTitleBackground(ctx, canvas, stars, titleBgLoaded, titleBgImage, titleBgFrame, TITLE_FRAME_WIDTH, TITLE_FRAME_HEIGHT);

    if (currentScreen === SCREENS.MENU) {
        drawTitleLogo(ctx, canvas, gameTime, titleLogoLoaded, titleLogoImg);

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
        const topScore = getTopScore();
        if (topScore) {
            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 12px monospace';
            ctx.fillText(`★ HIGH SCORE: ${topScore.score.toLocaleString()} — ${topScore.ship.toUpperCase()} — ${topScore.difficulty.toUpperCase()}`, canvas.width / 2, startY - 25);
        }

        ctx.font = 'bold 15px monospace';
        for (let i = 0; i < menuOptions.length; i++) {
            const itemY = startY + i * spacing;
            const isSelected = selectedMenuIndex === i;

            if (isSelected) {
                ctx.fillStyle = '#00ffff';
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 10;
                ctx.fillText(`>  ${menuOptions[i]}  <`, canvas.width / 2, itemY);
                ctx.shadowBlur = 0;
            } else {
                ctx.fillStyle = '#8a8a9f';
                ctx.fillText(menuOptions[i], canvas.width / 2, itemY);
            }
        }

        ctx.fillStyle = '#4a4a5f';
        ctx.font = '10px monospace';
        ctx.fillText('USE W/S or ARROWS to NAVIGATE | ENTER to SELECT', canvas.width / 2, canvas.height - 25);
        ctx.restore();
    } else if (currentScreen === SCREENS.SHIP_SELECT) {
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
    } else if (currentScreen === SCREENS.SETTINGS) {
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
                ctx.fillStyle = isSelected ? '#ffffff' : '#6a6a7f';
                ctx.fillText(difficulty.toUpperCase(), 450, itemY + 5);
            } else if (i === 4) {
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
    } else if (currentScreen === SCREENS.LEADERBOARD) {
        ctx.fillStyle = 'rgba(5, 5, 12, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.textAlign = 'center';

        // Header
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 24px monospace';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 12;
        ctx.fillText('🏆 HIGH SCORE LEADERBOARD', canvas.width / 2, 55);
        ctx.shadowBlur = 0;

        const scores = getFilteredScores();
        const topScore = getTopScore();

        // Show top score summary
        if (topScore) {
            ctx.fillStyle = '#00ffff';
            ctx.font = 'bold 14px monospace';
            ctx.fillText(`TOP SCORE: ${topScore.score.toLocaleString()} — ${topScore.ship.toUpperCase()} — ${topScore.difficulty.toUpperCase()}`, canvas.width / 2, 90);
        } else {
            ctx.fillStyle = '#8a8a9f';
            ctx.font = '14px monospace';
            ctx.fillText('No scores yet. Go fight!', canvas.width / 2, 90);
        }

        // Filter bar
        ctx.font = 'bold 11px monospace';
        const filters = ['all', 'scout', 'interceptor', 'heavy', 'easy', 'normal', 'hard'];
        const filterLabels = ['ALL', 'SCOUT', 'INT.', 'HEAVY', 'EASY', 'NORM', 'HARD'];
        const filterStartX = 130;
        const filterY = 115;

        for (let fi = 0; fi < filters.length; fi++) {
            const fx = filterStartX + fi * 78;
            const isActive = leaderboardFilter === filters[fi];
            ctx.fillStyle = isActive ? '#ffaa00' : '#4a4a5f';
            ctx.fillText(filterLabels[fi], fx, filterY);
            if (isActive) {
                ctx.fillRect(fx - 10, filterY + 4, 38, 2);
            }
        }

        ctx.fillStyle = '#3a3a5f';
        ctx.fillRect(80, 135, 640, 2);

        // Score entries
        const listStartY = 155;
        const rowH = 28;
        const maxVisible = 10;
        const display = scores.slice(leaderboardScrollOffset, leaderboardScrollOffset + maxVisible);

        if (display.length === 0) {
            ctx.fillStyle = '#8a8a9f';
            ctx.font = '14px monospace';
            ctx.fillText('No scores match this filter.', canvas.width / 2, 250);
        } else {
            // Column headers
            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = '#5a5a7f';
            ctx.textAlign = 'left';
            ctx.fillText('#', 100, listStartY - 8);
            ctx.fillText('SCORE', 140, listStartY - 8);
            ctx.fillText('SHIP', 280, listStartY - 8);
            ctx.fillText('BIOME', 380, listStartY - 8);
            ctx.fillText('DIFF', 460, listStartY - 8);
            ctx.fillText('DATE', 540, listStartY - 8);

            ctx.font = '13px monospace';
            for (let si = 0; si < display.length; si++) {
                const s = display[si];
                const rank = leaderboardScrollOffset + si + 1;
                const ry = listStartY + si * rowH;

                // Row background
                ctx.fillStyle = si % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)';
                ctx.fillRect(85, ry - 14, 630, rowH);

                // Rank highlight
                if (rank <= 3) {
                    const medal = rank === 1 ? '#ffd700' : (rank === 2 ? '#c0c0c0' : '#cd7f32');
                    ctx.fillStyle = medal;
                } else {
                    ctx.fillStyle = '#8a8a9f';
                }
                ctx.textAlign = 'left';
                ctx.fillText(rank, 100, ry + 4);

                ctx.fillStyle = '#ffffff';
                ctx.fillText(s.score.toLocaleString(), 140, ry + 4);
                ctx.fillText(s.ship.toUpperCase(), 280, ry + 4);
                ctx.fillText('BIOME ' + s.biome, 380, ry + 4);

                const diffColors = { easy: '#00ff55', normal: '#ffaa00', hard: '#ff0033' };
                ctx.fillStyle = diffColors[s.difficulty] || '#ffffff';
                ctx.fillText(s.difficulty.toUpperCase(), 460, ry + 4);

                ctx.fillStyle = '#8a8a9f';
                ctx.fillText(s.date, 540, ry + 4);
            }
        }

        // Scroll indicator
        if (scores.length > maxVisible) {
            ctx.fillStyle = '#5a5a7f';
            ctx.font = '10px monospace';
            const showing = Math.min(leaderboardScrollOffset + maxVisible, scores.length);
            ctx.fillText(`Showing ${leaderboardScrollOffset + 1}-${showing} of ${scores.length}  |  UP/DOWN to scroll`, canvas.width / 2, canvas.height - 48);
        }

        // Clear & Back
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = '#ff0033';
        ctx.fillText('[C] CLEAR ALL SCORES', canvas.width / 2, canvas.height - 28);

        ctx.fillStyle = '#8a8a9f';
        ctx.font = '10px monospace';
        ctx.fillText('ESC / BACKSPACE to RETURN  |  ARROWS to FILTER', canvas.width / 2, canvas.height - 8);

        ctx.restore();
    } else if (currentScreen === SCREENS.CREDITS) {
        // Dim the title loop background for legibility
        ctx.fillStyle = 'rgba(5, 5, 12, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();

        const creditsList = [
            { type: 'logo' },
            { type: 'spacer', height: 40 },
            { type: 'title', text: 'DARIUS STAR: CYBER COELACANTH' },
            { type: 'subtitle', text: 'DEVELOPMENT CREDITS' },
            { type: 'spacer', height: 50 },
            { type: 'role', text: 'GAME DESIGN & NARRATIVE' },
            { type: 'name', text: 'Michael Gulden' },
            { type: 'spacer', height: 35 },
            { type: 'role', text: 'AI AGENT ENGINEERING' },
            { type: 'name', text: 'Fred (Implementation)' },
            { type: 'name', text: 'AGY (Content & Story)' },
            { type: 'spacer', height: 35 },
            { type: 'role', text: 'ART GENERATION' },
            { type: 'name', text: 'Imagen 3 (Vertex AI)' },
            { type: 'name', text: 'Google Flow' },
            { type: 'spacer', height: 35 },
            { type: 'role', text: 'VIDEO GENERATION' },
            { type: 'name', text: 'Veo 3.1 (Vertex AI)' },
            { type: 'spacer', height: 35 },
            { type: 'role', text: 'MUSIC PRODUCTION' },
            { type: 'name', text: 'Lyria 2/3 (Vertex AI)' },
            { type: 'spacer', height: 35 },
            { type: 'role', text: 'SOUND EFFECTS' },
            { type: 'name', text: 'jsfxr' },
            { type: 'name', text: 'Web Audio Synth Engine' },
            { type: 'spacer', height: 35 },
            { type: 'role', text: 'SPECIAL THANKS' },
            { type: 'name', text: 'Vertex AI Model Garden' },
            { type: 'name', text: 'Google DeepMind Team' },
            { type: 'name', text: 'GrowthWebDev Tester Squad' },
            { type: 'name', text: 'Our retro arcade community' },
            { type: 'spacer', height: 60 },
            { type: 'thanks', text: 'THANK YOU FOR PLAYING' },
            { type: 'spacer', height: 50 },
            { type: 'end', text: 'THE END' }
        ];

        let currentY = canvas.height - creditsScrollY;
        ctx.textAlign = 'center';

        for (let i = 0; i < creditsList.length; i++) {
            const item = creditsList[i];

            if (currentY > -100 && currentY < canvas.height + 100) {
                if (item.type === 'logo') {
                    if (studioLogoLoaded && studioLogoImg.naturalWidth > 0) {
                        ctx.drawImage(studioLogoImg, canvas.width / 2 - 80, currentY - 50, 160, 160);
                    } else {
                        ctx.fillStyle = '#ff0055';
                        ctx.font = 'bold 16px monospace';
                        ctx.fillText('WHAT AN ADVENTURE GAMES', canvas.width / 2, currentY);
                    }
                } else if (item.type === 'title') {
                    ctx.fillStyle = '#00ffff';
                    ctx.font = 'bold 18px monospace';
                    ctx.shadowColor = '#00ffff';
                    ctx.shadowBlur = 8;
                    ctx.fillText(item.text, canvas.width / 2, currentY);
                    ctx.shadowBlur = 0;
                } else if (item.type === 'subtitle') {
                    ctx.fillStyle = '#8a8a9f';
                    ctx.font = '9px monospace';
                    ctx.fillText(item.text, canvas.width / 2, currentY);
                } else if (item.type === 'role') {
                    ctx.fillStyle = '#ff0055';
                    ctx.font = 'bold 11px monospace';
                    ctx.fillText(item.text, canvas.width / 2, currentY);
                } else if (item.type === 'name') {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '13px monospace';
                    ctx.fillText(item.text, canvas.width / 2, currentY);
                } else if (item.type === 'thanks') {
                    ctx.fillStyle = '#00ff55';
                    ctx.font = 'bold 18px monospace';
                    ctx.shadowColor = '#00ff55';
                    ctx.shadowBlur = 10;
                    ctx.fillText(item.text, canvas.width / 2, currentY);
                    ctx.shadowBlur = 0;
                } else if (item.type === 'end') {
                    ctx.fillStyle = '#ff0055';
                    ctx.font = 'bold 26px monospace';
                    ctx.shadowColor = '#ff0055';
                    ctx.shadowBlur = 12;
                    ctx.fillText(item.text, canvas.width / 2, currentY);
                    ctx.shadowBlur = 0;
                }
            }

            // Increment Y for next item
            if (item.type === 'spacer') {
                currentY += item.height;
            } else if (item.type === 'logo') {
                currentY += 100;
            } else if (item.type === 'title') {
                currentY += 22;
            } else if (item.type === 'subtitle') {
                currentY += 16;
            } else if (item.type === 'role') {
                currentY += 18;
            } else if (item.type === 'name') {
                currentY += 18;
            } else if (item.type === 'thanks') {
                currentY += 30;
            } else if (item.type === 'end') {
                currentY += 40;
            }
        }

        ctx.restore();

        const totalCreditsHeight = currentY - (canvas.height - creditsScrollY);
        // This relies on maxCreditsScroll being a global which it is
        if (typeof maxCreditsScroll !== 'undefined') {
            maxCreditsScroll = totalCreditsHeight;
        }

        ctx.fillStyle = '#4a4a5f';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CLICK / SPACE / ESC to SKIP TO MENU', canvas.width / 2, canvas.height - 15);
    } else if (currentScreen === SCREENS.CINEMATIC) {
        ctx.save();

        // Animate background image panning
        if (endingSunriseLoaded && endingSunriseImg.naturalWidth > 0) {
            const progress = Math.min(cinematicTime / 20, 1.0);
            // Panning viewport (800x450) from the 1024x1024 source image
            // Start at top-left, pan slowly down and right
            const sx = progress * 120;
            const sy = 150 + Math.sin(progress * Math.PI / 2) * 250;

            ctx.drawImage(endingSunriseImg,
                sx, sy, 800, 450,
                0, 0, canvas.width, canvas.height
            );
        } else {
            ctx.fillStyle = '#010108';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw a retro screen glare overlay for cinematic effect
        const scanlineGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        scanlineGrad.addColorStop(0, 'rgba(0, 255, 255, 0.05)');
        scanlineGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
        scanlineGrad.addColorStop(1, 'rgba(255, 0, 255, 0.05)');
        ctx.fillStyle = scanlineGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw player ship flying into the sunrise
        if (cinematicTime > 3) {
            const flightProgress = Math.min((cinematicTime - 3) / 15, 1.0);
            const startX = -50;
            const startY = 320;
            const targetX = 480;
            const targetY = 220;

            const shipX = startX + (targetX - startX) * flightProgress;
            const shipY = startY + (targetY - startY) * flightProgress;
            const size = 32 * (1 - flightProgress * 0.75); // scales down

            // Draw retro flame
            ctx.fillStyle = Math.random() < 0.5 ? '#ff0055' : '#ffff00';
            ctx.beginPath();
            ctx.moveTo(shipX - 10, shipY + size/2);
            ctx.lineTo(shipX, shipY + size/2 - 4);
            ctx.lineTo(shipX, shipY + size/2 + 4);
            ctx.closePath();
            ctx.fill();

            // Draw player ship sprite
            const shipKey = selectedShip === 'scout' ? 'scout_0' : (selectedShip === 'heavy' ? 'heavy_0' : 'interceptor_0');
            const shipSprite = playerSprites[shipKey];
            if (shipSprite && shipSprite.complete && shipSprite.naturalWidth > 0) {
                ctx.drawImage(shipSprite, shipX, shipY, size, size);
            } else {
                ctx.fillStyle = '#00ffff';
                ctx.fillRect(shipX, shipY, size, size);
            }
        }

        // Narrative typography typing text
        let txt = "";
        if (cinematicTime < 3) {
            txt = "CYBER COELACANTH MELTDOWN INITIALIZED...";
        } else if (cinematicTime < 7) {
            txt = "SECTOR 3 DEPTH LAIR SECURED. ESCAPING CAVERN...";
        } else if (cinematicTime < 18) {
            txt = "The Cyber Coelacanth is defeated... but the galaxy still needs you.";
        } else {
            txt = "TO BE CONTINUED...";
        }

        let subTime = 0;
        if (cinematicTime < 3) subTime = cinematicTime;
        else if (cinematicTime < 7) subTime = cinematicTime - 3;
        else if (cinematicTime < 18) subTime = cinematicTime - 7;
        else subTime = cinematicTime - 18;

        const typedLength = Math.floor(subTime * 25);
        const visibleText = txt.substring(0, typedLength);

        // Dialog Box
        ctx.fillStyle = 'rgba(5, 5, 15, 0.8)';
        ctx.fillRect(50, canvas.height - 75, canvas.width - 100, 45);
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, canvas.height - 75, canvas.width - 100, 45);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(visibleText, 70, canvas.height - 48);

        ctx.fillStyle = '#4a4a5f';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PRESS ENTER / ESC / CLICK to SKIP CUTSCENE', canvas.width / 2, canvas.height - 12);

        ctx.restore();
    }
}

function drawBossLoading(ctx, canvas, bossAssetsLoading, bossAssetsLoaded, bossLoadProgress) {
    if (bossAssetsLoading && !bossAssetsLoaded) {
        const loadY = canvas.height - 30;
        ctx.fillStyle = 'rgba(5, 5, 15, 0.8)';
        ctx.fillRect(canvas.width / 2 - 100, loadY - 12, 200, 28);

        // Progress bar background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(canvas.width / 2 - 80, loadY + 2, 160, 6);

        // Progress bar fill
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(canvas.width / 2 - 80, loadY + 2, 160 * (bossLoadProgress / 100), 6);

        // Text
        ctx.fillStyle = '#00ffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PRELOADING BOSS ASSETS... ' + bossLoadProgress + '%', canvas.width / 2, loadY - 2);
    }
}

function drawSirenWarning(ctx, canvas, gameTime, sirenTimer) {
    if (sirenTimer > 0) {
        ctx.fillStyle = 'rgba(255, 0, 0, ' + (Math.sin(gameTime * 20) * 0.2 + 0.25) + ')';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff0033';
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('WARNING: BOSS ENGAGING', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '16px monospace';
        ctx.fillText('CRITICAL SIGNALS DETECTED AHEAD', canvas.width / 2, canvas.height / 2 + 15);
    }
}

function drawBossHealthBar(ctx, canvas, boss) {
    if (boss && boss.state !== 'intro') {
        const barWidth = 300;
        const barHeight = 12;
        const bx = canvas.width / 2 - barWidth / 2;
        const by = 20;

        ctx.fillStyle = '#111';
        ctx.fillRect(bx, by, barWidth, barHeight);

        const hpPercent = boss.hp / boss.hpMax;
        ctx.fillStyle = hpPercent > 0.4 ? '#ff3300' : '#ff00ff';
        ctx.fillRect(bx, by, barWidth * hpPercent, barHeight);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, barWidth, barHeight);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CYBER COELACANTH', canvas.width / 2, by - 6);
    }
}

function drawPauseScreen(ctx, canvas, paused) {
    if (paused) {
        ctx.fillStyle = 'rgba(5, 5, 15, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SYSTEM PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.font = '14px monospace';
        ctx.fillText('Press P to Resume System', canvas.width / 2, canvas.height / 2 + 30);
    }
}

function drawGameOverScreen(ctx, canvas, gameOver, score, runScrap, highScoreBannerTimer, newHighScoreCelebrated, highScoreParticles, getTopScore) {
    if (gameOver) {
        ctx.fillStyle = 'rgba(15, 5, 5, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // High Score Celebration
        if (highScoreBannerTimer > 0 && newHighScoreCelebrated) {
            const bannerAlpha = Math.min(1, highScoreBannerTimer);
            const pulse = Math.sin(highScoreBannerTimer * 8) * 0.3 + 0.7;

            ctx.save();
            ctx.fillStyle = `rgba(255, 170, 0, ${bannerAlpha * 0.15})`;
            ctx.fillRect(0, canvas.height / 2 - 100, canvas.width, 200);

            ctx.font = 'bold 36px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(255, 215, 0, ${bannerAlpha * pulse})`;
            ctx.shadowColor = '#ffaa00';
            ctx.shadowBlur = 20 * pulse;
            ctx.fillText('★ NEW HIGH SCORE! ★', canvas.width / 2, canvas.height / 2 - 68);
            ctx.shadowBlur = 0;

            ctx.font = 'bold 16px monospace';
            ctx.fillStyle = `rgba(255, 255, 255, ${bannerAlpha * 0.9})`;
            ctx.fillText(score.toLocaleString() + ' POINTS', canvas.width / 2, canvas.height / 2 - 38);

            // Celebration particles
            for (const p of highScoreParticles) {
                ctx.fillStyle = `rgba(${hexToRgb(p.color)}, ${Math.min(1, p.life)})`;
                ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            }
            ctx.restore();
        }

        ctx.fillStyle = '#ff0033';
        ctx.font = 'bold 42px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('FIGHTER CRUSHED', canvas.width / 2, canvas.height / 2 - 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.fillText('SCORE: ' + score, canvas.width / 2, canvas.height / 2 + 10);
        const top = getTopScore();
        if (top) {
            ctx.fillStyle = '#ffaa00';
            ctx.font = '12px monospace';
            ctx.fillText('★ HIGH SCORE: ' + top.score.toLocaleString() + ' — ' + top.ship.toUpperCase(), canvas.width / 2, canvas.height / 2 + 28);
        }
        ctx.fillStyle = '#00ff55';
        ctx.fillText('SCRAP EARNED: +' + runScrap, canvas.width / 2, canvas.height / 2 + 30);
        ctx.font = '14px monospace';
        ctx.fillStyle = '#8a8a9f';
        ctx.fillText('Click screen or press SPACE to retry', canvas.width / 2, canvas.height / 2 + 55);
        ctx.fillText('Press U to open Upgrades Shop', canvas.width / 2, canvas.height / 2 + 75);
        ctx.fillText('Press ESC to return to main menu', canvas.width / 2, canvas.height / 2 + 95);
        ctx.fillStyle = '#ff0055';
        ctx.font = '11px monospace';
        ctx.fillText('whatanadventure.games/darius-star', canvas.width / 2, canvas.height / 2 + 118);
    }
}

function drawVictoryScreen(ctx, canvas, gameWon, score, runScrap, getTopScore) {
    if (gameWon) {
        ctx.fillStyle = 'rgba(5, 15, 10, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff55';
        ctx.font = 'bold 42px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VICTORY ACHIEVED', canvas.width / 2, canvas.height / 2 - 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px monospace';
        ctx.fillText('SCORE: ' + score, canvas.width / 2, canvas.height / 2);
        const topV = getTopScore();
        if (topV) {
            ctx.fillStyle = '#ffaa00';
            ctx.font = '12px monospace';
            ctx.fillText('★ HIGH SCORE: ' + topV.score.toLocaleString() + ' — ' + topV.ship.toUpperCase(), canvas.width / 2, canvas.height / 2 + 18);
        }
        ctx.fillStyle = '#00ff55';
        ctx.fillText('SCRAP EARNED: +' + runScrap, canvas.width / 2, canvas.height / 2 + 36);
        ctx.fillStyle = '#00ffff';
        ctx.fillText('Cyber Coelacanth eradicated.', canvas.width / 2, canvas.height / 2 + 45);
        ctx.fillStyle = '#8a8a9f';
        ctx.font = '14px monospace';
        ctx.fillText('Click screen or press SPACE to replay', canvas.width / 2, canvas.height / 2 + 75);
        ctx.fillText('Press U to open Upgrades Shop', canvas.width / 2, canvas.height / 2 + 95);
        ctx.fillText('Press ESC to return to main menu', canvas.width / 2, canvas.height / 2 + 115);
        ctx.fillStyle = '#ff0055';
        ctx.font = '11px monospace';
        ctx.fillText('whatanadventure.games/darius-star', canvas.width / 2, canvas.height / 2 + 138);
    }
}

function drawScreenTransition(ctx, canvas, screenFadeAlpha) {
    if (screenFadeAlpha > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${screenFadeAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
}
