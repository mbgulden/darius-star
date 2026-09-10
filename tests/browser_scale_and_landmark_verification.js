// tests/browser_scale_and_landmark_verification.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORT = 8112;
const REPO_ROOT = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(REPO_ROOT, reqPath);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.png': 'image/png',
            '.ogg': 'audio/ogg',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.json': 'application/json'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(data);
    });
});

async function run() {
    console.log("Starting local test server on port", PORT);
    await new Promise((resolve) => server.listen(PORT, resolve));

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
    });

    try {
        await page.goto(`http://localhost:${PORT}/index.html`);
        await page.waitForSelector('#gameCanvas');

        // Start game
        const result = await page.evaluate(() => {
            currentScreen = SCREENS.PLAYING;
            if (typeof resetGame === 'function') resetGame();

            // Check Player scaling
            const p = player;
            const pScout = new Player('scout');
            const pBastion = new Player('bastion');

            // Spawn representative enemies of each tier
            const eScout = new Enemy('scout');
            const eInterceptor = new Enemy('interceptor');
            const eHazard = new Enemy('hazard');
            const eEel = new Enemy('trench_eel');
            const eHeavy = new Enemy('vent_crab_heavy');
            const eTitan = new Enemy('lava_golem');

            // Set biome and level to 3-4 to test theme glow
            eInterceptor.biome = 3;
            eInterceptor.level = 4;
            eInterceptor.biomeGlowColor = getBiomeLevelThemeColor(3, 4);

            // Test landmark state
            JourneyBackgroundRenderer.setLevel(3, 4);
            const landmark = JourneyBackgroundRenderer.currentLandmark;

            return {
                playerDefault: { type: p.shipType, w: p.width, h: p.height, rSize: p.renderSize },
                playerScout: { type: pScout.shipType, w: pScout.width, h: pScout.height, rSize: pScout.renderSize },
                playerBastion: { type: pBastion.shipType, w: pBastion.width, h: pBastion.height, rSize: pBastion.renderSize },
                enemies: {
                    scout: { w: eScout.width, h: eScout.height, rSize: eScout.renderSize, glow: eScout.classRules.glowBlur },
                    interceptor: { w: eInterceptor.width, h: eInterceptor.height, rSize: eInterceptor.renderSize, glowColor: eInterceptor.biomeGlowColor },
                    hazard: { w: eHazard.width, h: eHazard.height, rSize: eHazard.renderSize },
                    eel: { w: eEel.width, h: eEel.height, rSize: eEel.renderSize },
                    heavy: { w: eHeavy.width, h: eHeavy.height, rSize: eHeavy.renderSize },
                    titan: { w: eTitan.width, h: eTitan.height, rSize: eTitan.renderSize }
                },
                landmark: {
                    type: landmark.info.landmark,
                    isDestructible: landmark.isDestructible,
                    accentColor: landmark.info.accentColor
                }
            };
        });

        console.log("In-browser evaluation results:");
        console.log(JSON.stringify(result, null, 2));

        // Advance simulation to let enemies and landmarks render
        await page.evaluate(() => {
            if (typeof LevelManager !== 'undefined') {
                LevelManager.setBiomeAndLevel(1, 1);
            }
            // Position player and some enemies visibly for screenshot
            player.x = 180;
            player.y = 240;

            const scout = new Enemy('scout');
            scout.x = 420; scout.y = 160;
            const interceptor = new Enemy('interceptor');
            interceptor.x = 560; interceptor.y = 260;
            const heavy = new Enemy('vent_crab_heavy');
            heavy.x = 720; heavy.y = 340;

            enemies.push(scout, interceptor, heavy);
        });
        await page.waitForTimeout(1000);

        // Take screenshot
        const screenshotPath = path.join(REPO_ROOT, 'tests', 'gameplay_scale_verification.png');
        await page.screenshot({ path: screenshotPath });
        console.log("Saved gameplay screenshot to:", screenshotPath);

        if (errors.length > 0) {
            console.warn("Browser console errors encountered:", errors);
        } else {
            console.log("No browser console errors encountered!");
        }

    } finally {
        await browser.close();
        server.close();
    }
}

run().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
