const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const assert = require('assert');

async function run() {
    console.log("=== STARTING MULTIPLAYER INPUTS ERROR TRACKING ===");
    console.log("Starting Python HTTP server...");
    const server = spawn('python3', ['-m', 'http.server', '8099'], {
        cwd: path.join(__dirname, '..')
    });
    await new Promise(r => setTimeout(r, 1500));

    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        
        await context.addInitScript(() => {
            window.addEventListener('error', (err) => {
                console.log(`[GLOBAL ERROR] ${err.message} at ${err.filename}:${err.lineno}`);
            });
            window.addEventListener('unhandledrejection', (e) => {
                console.log(`[UNHANDLED REJECTION] ${e.reason}`);
            });

            window.mockGamepads = [
                {
                    index: 0,
                    id: "Standard Gamepad 1",
                    connected: true,
                    buttons: Array(16).fill(null).map((_, i) => ({ pressed: i === 0 })),
                    axes: [1.0, 0.0, 0.0, 0.0]
                },
                null
            ];
            navigator.getGamepads = () => window.mockGamepads;
        });

        const page = await context.newPage();
        
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.error('PAGE ERROR LOG:', err.message, err.stack));

        await page.goto('http://127.0.0.1:8099/index.html?launch=true', { waitUntil: 'networkidle' });
        await page.waitForSelector('#gameCanvas');

        await page.evaluate(() => {
            transitionToScreen(SCREENS.PLAYING);
        });
        await page.click('#gameCanvas');
        console.log("Waiting 5 seconds for audio preloading to settle...");
        await page.waitForTimeout(5000);

        console.log("Pressing Enter to spawn Player 2...");
        await page.keyboard.down('Enter');
        await page.waitForTimeout(100);
        await page.keyboard.up('Enter');
        await page.waitForTimeout(1000);
        
        console.log("Pressing '3' to spawn Player 3...");
        await page.keyboard.down('3');
        await page.waitForTimeout(100);
        await page.keyboard.up('3');
        await page.waitForTimeout(1000);
        
        console.log("Pressing '4' to spawn Player 4...");
        await page.keyboard.down('4');
        await page.waitForTimeout(100);
        await page.keyboard.up('4');
        await page.waitForTimeout(1000);

        console.log("Simulating Gamepad disconnect...");
        await page.evaluate(() => {
            window.mockGamepads[0] = null;
        });
        
        await page.waitForTimeout(1000);

        const keysState = await page.evaluate(() => {
            return typeof keys !== 'undefined' ? { ...keys } : null;
        });
        console.log("Keys state after 1000ms:", JSON.stringify(keysState, null, 2));

        const gamepadKeysCleared = !keysState['Gamepad1A'] && !keysState['Gamepad1R'];
        assert.ok(gamepadKeysCleared, "Gamepad inputs should be cleared in keys object when gamepad is disconnected.");
        console.log("✅ Verified successfully!");
    } finally {
        if (browser) await browser.close();
        server.kill();
    }
}

run().catch(err => {
    console.error("Verification failed:", err);
    process.exit(1);
});
