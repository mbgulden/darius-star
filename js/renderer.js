// renderer.js — Renderer orchestrator (GRO-1170)
// Loads particle and parallax subsystems, initializes backgrounds
// Delegates to js/renderer/particles.js and js/renderer/parallax.js

        // --- Screen Shake & Cavern Navigation Helper Functions ---
        let shakeDuration = 0;
        let shakeIntensity = 0;

        // Biome shake tint lookup (§6.1) — maps activeBiome number to flash color
        const BIOME_SHAKE_TINTS = {
            1: '#0A2244', 2: '#CC5500', 3: '#CC0000', 4: '#FF00FF', 5: '#88CCFF',
            6: '#FF4400', 7: '#CCDDFF', 8: '#FF2222', 9: '#33FF33', 10: '#FF0088'
        };
        function triggerScreenShake(duration, intensity) {
            shakeDuration = duration;
            shakeIntensity = intensity;
            // Trigger biome-tinted screen flash (§6.1)
            screenFlashAlpha = Math.min(0.15, intensity / 200);
            screenFlashColor = BIOME_SHAKE_TINTS[biomeLevel] || '#FFFFFF';
        }

        let cavernNavActive = false;
        let cavernTimer = 0;
        let cavernStage = ''; // 'intro', 'left_fork', 'slow_down', 'right_turn', 'exit'
        function startCavernNavigation() {
            cavernNavActive = true;
            cavernTimer = 0;
            cavernStage = 'intro';
        }

        let stormActive = false;
        let pathfinderActive = false;
        let activeBiomeName = '1: Abyssal Trench';

        // --- Text Wrapping Helper ---
        function wrapText(context, text, x, y, maxWidth, lineHeight) {
            const words = text.split(' ');
            let line = '';
            for (let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + ' ';
                let metrics = context.measureText(testLine);
                let testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    context.fillText(line, x, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            context.fillText(line, x, y);
        }


