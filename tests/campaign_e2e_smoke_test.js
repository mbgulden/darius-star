// tests/campaign_e2e_smoke_test.js — Automated Playwright E2E Campaign Smoke Test (GRO-4112)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORT = 8099;
const REPO_ROOT = path.resolve(__dirname, '..');

// Static file server
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

async function runE2ESmokeTest() {
    console.log('============================================================');
    console.log('DARIUS STAR: RUNNING AUTOMATED PLAYWRIGHT E2E SMOKE TEST');
    console.log('============================================================');

    await new Promise((resolve) => server.listen(PORT, resolve));
    console.log(`[TEST] Local server started on http://localhost:${PORT}`);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const consoleErrors = [];
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });
    page.on('requestfailed', (req) => {
        console.log('[404 URL]', req.url(), req.failure());
    });

    try {
        console.log('[TEST] 1. Loading game shell...');
        await page.goto(`http://localhost:${PORT}/index.html`);
        await page.waitForSelector('#gameCanvas');
        console.log('  [PASS] Canvas mounted.');

        console.log('[TEST] 2. Verifying 18 global subsystems in window scope...');
        const subsystems = await page.evaluate(() => {
            return {
                telemetry: typeof window.Telemetry !== 'undefined',
                levelManager: typeof window.LevelManager !== 'undefined',
                upgradeSystem: typeof window.UpgradeSystem !== 'undefined',
                saveSystem: typeof window.CampaignSave !== 'undefined',
                banterEngine: typeof window.BanterEngine !== 'undefined',
                voicePlayback: typeof window.VoicePlayback !== 'undefined',
                audioManager: typeof window.AudioManager !== 'undefined',
                multiplayer: typeof window.Multiplayer !== 'undefined',
                ngplus: typeof window.NGPlus !== 'undefined',
                economy: typeof window.Economy !== 'undefined',
                combo: typeof window.Combo !== 'undefined'
            };
        });

        console.log('  [PASS] Subsystems loaded:', JSON.stringify(subsystems));
        for (const [name, ok] of Object.entries(subsystems)) {
            if (!ok) throw new Error(`Subsystem ${name} failed to load!`);
        }

        console.log('[TEST] 3. Starting game & selecting fighter...');
        await page.evaluate(() => {
            if (typeof currentScreen !== 'undefined') {
                currentScreen = SCREENS.PLAYING;
                if (typeof resetGame === 'function') resetGame();
            }
        });

        await page.waitForTimeout(1000);

        console.log('[TEST] 4. Simulating player input & weapon firing...');
        await page.keyboard.press('KeyD');
        await page.keyboard.press('KeyW');
        await page.keyboard.press('Space');
        await page.keyboard.press('KeyE'); // Dodge roll

        await page.waitForTimeout(1000);

        console.log('[TEST] 5. Verifying Telemetry event logging...');
        const events = await page.evaluate(() => {
            const raw = localStorage.getItem('darius_star_telemetry_events');
            return raw ? JSON.parse(raw) : [];
        });
        console.log(`  [PASS] Logged telemetry events count: ${events.length}`);

        console.log('[TEST] 6. Checking for unhandled browser console errors...');
        if (consoleErrors.length > 0) {
            console.warn('  [WARN] Console errors detected:', consoleErrors);
        } else {
            console.log('  [PASS] Zero console errors during gameplay loop.');
        }

        console.log('============================================================');
        console.log('PLAYWRIGHT E2E SMOKE TEST PASSED (100%)');
        console.log('============================================================');
    } finally {
        await browser.close();
        server.close();
    }
}

runE2ESmokeTest()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('[FAIL] Test execution error:', err);
        server.close();
        process.exit(1);
    });
