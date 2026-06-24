const { chromium, devices } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

async function run() {
    console.log("=== STARTING MOBILE LAYOUT & INITIALIZATION TEST ===");

    // 1. Start python HTTP server on port 8099
    console.log("Starting local HTTP server on port 8099...");
    const server = spawn('python3', ['-m', 'http.server', '8099'], {
        cwd: path.join(__dirname, '..')
    });

    // Wait 1.5 seconds for server to start
    await new Promise(resolve => setTimeout(resolve, 1500));

    let browser;
    try {
        console.log("Launching Chromium for mobile simulation...");
        browser = await chromium.launch({ headless: true });
        
        // Emulate iPhone 12
        const iphone12 = devices['iPhone 12'];
        const context = await browser.newContext({
            ...iphone12,
            hasTouch: true
        });
        
        const page = await context.newPage();

        // Print console messages for debug
        page.on('console', msg => {
            console.log(`[Browser Console ${msg.type()}] ${msg.text()}`);
        });
        page.on('pageerror', err => {
            console.error(`[Browser PageError] ${err.stack}`);
        });

        console.log("Navigating to http://127.0.0.1:8099/index.html?launch=true ...");
        await page.goto('http://127.0.0.1:8099/index.html?launch=true', { waitUntil: 'networkidle' });
        
        // Wait for canvas to load
        await page.waitForSelector('#gameCanvas');
        await page.waitForTimeout(1000);

        // Assert that the touch action buttons container exists
        console.log("Checking for touch action buttons and toggle...");
        const buttonsContainer = await page.$('#touch-action-buttons');
        assert.ok(buttonsContainer, "Touch action buttons container (#touch-action-buttons) was not injected.");
        
        const toggleBtn = await page.$('#touch-toggle');
        assert.ok(toggleBtn, "Touch toggle button (#touch-toggle) was not injected.");

        // Force transition to playing screen to verify joystick movement during gameplay
        console.log("Transitioning to PLAYING screen...");
        await page.evaluate(() => {
            if (typeof transitionToScreen !== 'undefined' && typeof SCREENS !== 'undefined') {
                transitionToScreen(SCREENS.PLAYING);
            }
        });
        await page.waitForTimeout(500);

        // Get initial player coordinates
        const initialY = await page.evaluate(() => {
            return typeof player !== 'undefined' ? player.y : null;
        });
        console.log(`Initial player.y: ${initialY}`);
        assert.ok(initialY !== null, "Player object not found or player.y is null.");

        // Simulate touchstart at client coordinates on canvas (left 40% of canvas)
        const canvasElement = await page.$('#gameCanvas');
        const box = await canvasElement.boundingBox();
        console.log("Canvas bounding box:", box);

        const startX = box.x + 50; // left side
        const startY = box.y + 200; // middle vertical

        console.log(`Simulating touchstart at (${startX}, ${startY})...`);
        await page.dispatchEvent('#gameCanvas', 'touchstart', {
            changedTouches: [{
                identifier: 1,
                clientX: startX,
                clientY: startY
            }]
        });

        // Drag up: move touch point up by 60 pixels
        const moveY = startY - 60;
        console.log(`Simulating touchmove to (${startX}, ${moveY}) (dragging up)...`);
        await page.dispatchEvent('#gameCanvas', 'touchmove', {
            changedTouches: [{
                identifier: 1,
                clientX: startX,
                clientY: moveY
            }]
        });

        // Wait 300ms for player position to update in game loop
        await page.waitForTimeout(300);

        // Verify keys['w'] is active
        const keyWActive = await page.evaluate(() => typeof keys !== 'undefined' ? keys['w'] : null);
        console.log(`keys['w'] state: ${keyWActive}`);
        assert.strictEqual(keyWActive, true, "keys['w'] should be set to true by joystick drag up.");

        // Get final player coordinates
        const finalY = await page.evaluate(() => player.y);
        console.log(`Final player.y: ${finalY}`);
        assert.ok(finalY < initialY, `Player should have moved up! Initial Y: ${initialY}, Final Y: ${finalY}`);

        // Simulate touchend
        console.log("Simulating touchend...");
        await page.dispatchEvent('#gameCanvas', 'touchend', {
            changedTouches: [{
                identifier: 1,
                clientX: startX,
                clientY: moveY
            }]
        });

        // Wait 100ms
        await page.waitForTimeout(100);
        const keyWAfterRelease = await page.evaluate(() => keys['w']);
        assert.strictEqual(keyWAfterRelease, false, "keys['w'] should be released after touchend.");

        console.log("✅ Mobile Touch Controls and Movement verified successfully!");
        
        // Take a final screenshot
        const screenshotPath = '/tmp/darius-mobile-layout-after.png';
        await page.screenshot({ path: screenshotPath });
        console.log("Mobile layout screenshot saved to:", screenshotPath);

    } finally {
        if (browser) await browser.close();
        console.log("Stopping local HTTP server...");
        server.kill();
    }
}

run().catch(err => {
    console.error("❌ Mobile initialization test failed:", err);
    process.exit(1);
});
