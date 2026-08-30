// js/ui/cockpit_theme.js — In-Universe Cockpit UI Design System (Nyxa Tactical Avionics OS)
// Provides reusable procedural rendering primitives for all menus, screens, HUD, and debriefings.

(function() {
    const CockpitUI = {
        // Color Palette constants
        COLORS: {
            OBSIDIAN_DEEP: '#020612',
            OBSIDIAN_PANEL: 'rgba(6, 14, 28, 0.94)',
            OBSIDIAN_CARD: 'rgba(10, 22, 44, 0.88)',
            CYAN_PRIMARY: '#00ffff',
            CYAN_DIM: '#00aacc',
            CYAN_GLOW: 'rgba(0, 255, 255, 0.35)',
            AMBER_ALERT: '#ffaa00',
            GOLD_ACCENT: '#ffd700',
            EMERALD_NOMINAL: '#00ff88',
            CRIMSON_DANGER: '#ff2244',
            VIOLET_QUANTUM: '#cc44ff',
            TEXT_MUTED: '#88aacc',
            TEXT_DIM: '#4a5a7f',
            BORDER_GRID: 'rgba(0, 200, 255, 0.22)'
        },

        /**
         * Draw a cybernetic chamfered panel with glowing borders and double-line corner brackets.
         */
        drawPanel(ctx, x, y, w, h, options = {}) {
            const chamfer = options.chamfer !== undefined ? options.chamfer : 8;
            const borderColor = options.borderColor || this.COLORS.BORDER_GRID;
            const bgColor = options.bgColor || this.COLORS.OBSIDIAN_PANEL;
            const bracketColor = options.bracketColor || this.COLORS.AMBER_ALERT;
            const glow = options.glow !== undefined ? options.glow : true;
            const lineWidth = options.lineWidth || 1.5;

            ctx.save();

            // 1. Background Chamfered Polygon
            ctx.beginPath();
            ctx.moveTo(x + chamfer, y);
            ctx.lineTo(x + w - chamfer, y);
            ctx.lineTo(x + w, y + chamfer);
            ctx.lineTo(x + w, y + h - chamfer);
            ctx.lineTo(x + w - chamfer, y + h);
            ctx.lineTo(x + chamfer, y + h);
            ctx.lineTo(x, y + h - chamfer);
            ctx.lineTo(x, y + chamfer);
            ctx.closePath();

            ctx.fillStyle = bgColor;
            ctx.fill();

            // 2. Glowing Border
            if (glow) {
                ctx.shadowColor = borderColor;
                ctx.shadowBlur = options.shadowBlur || 8;
            }
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // 3. Corner Tech Brackets
            if (options.brackets !== false) {
                const bSize = options.bracketSize || 10;
                ctx.strokeStyle = bracketColor;
                ctx.lineWidth = 2;

                // Top-Left
                ctx.beginPath();
                ctx.moveTo(x + bSize + chamfer, y);
                ctx.lineTo(x + chamfer, y);
                ctx.lineTo(x, y + chamfer);
                ctx.lineTo(x, y + bSize + chamfer);
                ctx.stroke();

                // Top-Right
                ctx.beginPath();
                ctx.moveTo(x + w - bSize - chamfer, y);
                ctx.lineTo(x + w - chamfer, y);
                ctx.lineTo(x + w, y + chamfer);
                ctx.lineTo(x + w, y + bSize + chamfer);
                ctx.stroke();

                // Bottom-Left
                ctx.beginPath();
                ctx.moveTo(x, y + h - bSize - chamfer);
                ctx.lineTo(x, y + h - chamfer);
                ctx.lineTo(x + chamfer, y + h);
                ctx.lineTo(x + bSize + chamfer, y + h);
                ctx.stroke();

                // Bottom-Right
                ctx.beginPath();
                ctx.moveTo(x + w, y + h - bSize - chamfer);
                ctx.lineTo(x + w, y + h - chamfer);
                ctx.lineTo(x + w - chamfer, y + h);
                ctx.lineTo(x + w - bSize - chamfer, y + h);
                ctx.stroke();
            }

            // 4. Subtle Top Header Accent Bar if requested
            if (options.headerBar) {
                ctx.fillStyle = options.headerBarColor || 'rgba(0, 255, 255, 0.12)';
                ctx.fillRect(x + chamfer + 2, y + 2, w - chamfer * 2 - 4, options.headerBarHeight || 24);
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
                ctx.strokeRect(x + chamfer + 2, y + 2, w - chamfer * 2 - 4, options.headerBarHeight || 24);
            }

            ctx.restore();
        },

        /**
         * Draw a segmented LED meter (for Volume, Shield, Weapon Heat, Boost Fuel).
         */
        drawSegmentedBar(ctx, x, y, w, h, value, maxValue, options = {}) {
            const segments = options.segments || 10;
            const gap = options.gap || 2;
            const segW = (w - (segments - 1) * gap) / segments;
            const activeColor = options.activeColor || this.COLORS.CYAN_PRIMARY;
            const emptyColor = options.emptyColor || '#07101e';
            const borderColor = options.borderColor || 'rgba(0, 255, 255, 0.2)';
            const ratio = Math.max(0, Math.min(1.0, value / (maxValue || 1)));
            const activeCount = Math.round(ratio * segments);

            ctx.save();
            for (let i = 0; i < segments; i++) {
                const segX = x + i * (segW + gap);
                const isActive = i < activeCount;

                ctx.fillStyle = isActive ? activeColor : emptyColor;
                if (isActive && options.glow) {
                    ctx.shadowColor = activeColor;
                    ctx.shadowBlur = 6;
                } else {
                    ctx.shadowBlur = 0;
                }
                ctx.fillRect(segX, y, segW, h);

                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 1;
                ctx.strokeRect(segX, y, segW, h);
            }
            ctx.restore();
        },

        /**
         * Draw a tactile avionics button with hover pulse, keyboard hotkey badge, and active selection glow.
         */
        drawAvionicsButton(ctx, x, y, w, h, label, keyHint, isSelected, isHovered, options = {}) {
            const primaryColor = options.primaryColor || this.COLORS.CYAN_PRIMARY;
            const accentColor = options.accentColor || this.COLORS.AMBER_ALERT;
            const disabled = options.disabled || false;

            ctx.save();

            let bgColor = 'rgba(6, 14, 28, 0.85)';
            let strokeColor = 'rgba(0, 200, 255, 0.28)';
            let textColor = this.COLORS.TEXT_MUTED;
            let blur = 0;

            if (disabled) {
                bgColor = 'rgba(10, 12, 18, 0.6)';
                strokeColor = 'rgba(50, 60, 80, 0.3)';
                textColor = '#445566';
            } else if (isSelected) {
                bgColor = 'rgba(0, 255, 255, 0.18)';
                strokeColor = primaryColor;
                textColor = '#ffffff';
                blur = 12;
            } else if (isHovered) {
                bgColor = 'rgba(255, 170, 0, 0.15)';
                strokeColor = accentColor;
                textColor = '#ffffff';
                blur = 8;
            }

            // Button Box
            ctx.fillStyle = bgColor;
            ctx.fillRect(x, y, w, h);

            if (blur > 0) {
                ctx.shadowColor = isSelected ? primaryColor : accentColor;
                ctx.shadowBlur = blur;
            }
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.strokeRect(x, y, w, h);
            ctx.shadowBlur = 0;

            // Selection indicator arrow / pip
            if (isSelected) {
                ctx.fillStyle = primaryColor;
                ctx.fillRect(x + 3, y + 3, 3, h - 6);
                ctx.fillRect(x + w - 6, y + 3, 3, h - 6);
            }

            // Button Label
            ctx.textAlign = 'center';
            ctx.fillStyle = textColor;
            ctx.font = options.font || 'bold 12.5px monospace';
            ctx.fillText(label, x + w / 2, y + h / 2 + 4);

            // Key Hint Badge (e.g. [ENTER], [1], [ESC])
            if (keyHint) {
                ctx.textAlign = 'right';
                ctx.font = 'bold 9px monospace';
                ctx.fillStyle = isSelected ? accentColor : this.COLORS.TEXT_DIM;
                ctx.fillText(keyHint, x + w - 8, y + 12);
            }

            ctx.restore();
        },

        /**
         * Draw a formatted telemetry data row with monospace alignment.
         */
        drawDataRow(ctx, x, y, label, value, options = {}) {
            ctx.save();
            ctx.textAlign = 'left';
            ctx.font = options.font || 'bold 11px monospace';
            ctx.fillStyle = options.labelColor || this.COLORS.TEXT_MUTED;
            ctx.fillText(label, x, y);

            if (options.alignRight && options.width) {
                ctx.textAlign = 'right';
                ctx.fillStyle = options.valueColor || '#ffffff';
                ctx.fillText(value, x + options.width, y);
            } else {
                const labelWidth = ctx.measureText(label).width;
                ctx.fillStyle = options.valueColor || '#ffffff';
                ctx.fillText(value, x + labelWidth + (options.spacing || 8), y);
            }
            ctx.restore();
        },

        /**
         * Draw subtle cockpit radar grid lines and rolling CRT scanline raster.
         */
        drawCockpitGrid(ctx, w, h, timer = 0) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0, 200, 255, 0.035)';
            ctx.lineWidth = 1;

            // Vertical grid lines
            const gridSpacing = 40;
            for (let gx = 0; gx < w; gx += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(gx, 0);
                ctx.lineTo(gx, h);
                ctx.stroke();
            }

            // Horizontal grid lines
            for (let gy = 0; gy < h; gy += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(0, gy);
                ctx.lineTo(w, gy);
                ctx.stroke();
            }

            // Subtle rolling scanline
            const scanY = (timer * 60) % h;
            const grad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
            grad.addColorStop(0, 'rgba(0, 255, 255, 0)');
            grad.addColorStop(0.5, 'rgba(0, 255, 255, 0.04)');
            grad.addColorStop(1, 'rgba(0, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, scanY - 30, w, 60);

            ctx.restore();
        }
    };

    if (typeof window !== 'undefined') {
        window.CockpitUI = CockpitUI;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = CockpitUI;
    }
})();
