const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const assert = require('assert');

async function run() {
    console.log("=== STARTING MULTIPLAYER INPUTS VERIFICATION ===");
    console.log("Starting Python HTTP server...");
    const server = spawn('python3', ['-m', 'http.server', '8099'], {
        cwd: path.join(__dirname, '..')
    });
    await new Promise(r => setTimeout(r, 1500));

    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        
        // Mock the Gamepad API to simulate a connected controller: Gamepad 0 connected with button A pressed, Gamepad 1 not connected initially
        await context.addInitScript(() => {
            window.mockGamepads = [
                {
                    index: 0,
                    id: "Standard Gamepad 1",
                    connected: true,
                    buttons: Array(16).fill(null).map((_, i) => ({ pressed: i === 0 })), // A button (index 0) pressed
                    axes: [1.0, 0.0, 0.0, 0.0] // Left Stick X = 1.0 (Right)
                },
                null
            ];
            navigator.getGamepads = () => window.mockGamepads;
        });

        const page = await context.newPage();
        
        // Forward page console logs to terminal
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

        await page.goto('http://127.0.0.1:8099/index.html?launch=true', { waitUntil: 'networkidle' });
        await page.waitForSelector('#gameCanvas');

        // Transition to PLAYING state
        await page.evaluate(() => {
            transitionToScreen(SCREENS.PLAYING);
        });
        console.log("Waiting 5 seconds for audio preloading to settle...");
        await page.waitForTimeout(5000);

        console.log("Before keypress - Current Screen:", await page.evaluate(() => currentScreen));
        console.log("Before keypress - Multiplayer count:", await page.evaluate(() => Multiplayer.count));

        // 1. Verify Player 2 can join via keyboard 'Enter'
        console.log("Pressing Enter to spawn Player 2...");
        await page.keyboard.down('Enter');
        for (let attempt = 0; attempt < 40; attempt++) {
            const count = await page.evaluate(() => Multiplayer.count);
            if (count >= 2) break;
            await page.waitForTimeout(50);
        }
        await page.keyboard.up('Enter');
        await page.waitForTimeout(500); // Wait for joinCooldown
        
        console.log("After Enter - Multiplayer count:", await page.evaluate(() => Multiplayer.count));
        const hasP2 = await page.evaluate(() => remotePlayers.some(rp => rp.playerId === 2));
        assert.ok(hasP2, "Player 2 failed to spawn on Enter keypress.");

        // 2. Verify Player 3 can join via '3'
        console.log("Pressing '3' to spawn Player 3...");
        await page.keyboard.down('3');
        for (let attempt = 0; attempt < 40; attempt++) {
            const count = await page.evaluate(() => Multiplayer.count);
            if (count >= 3) break;
            await page.waitForTimeout(50);
        }
        await page.keyboard.up('3');
        await page.waitForTimeout(500); // Wait for joinCooldown
        
        console.log("After '3' - Multiplayer count:", await page.evaluate(() => Multiplayer.count));
        const hasP3 = await page.evaluate(() => remotePlayers.some(rp => rp.playerId === 3));
        assert.ok(hasP3, "Player 3 failed to spawn on '3' keypress.");

        // 3. Verify Player 4 can join via '4'
        console.log("Pressing '4' to spawn Player 4...");
        await page.keyboard.down('4');
        for (let attempt = 0; attempt < 40; attempt++) {
            const count = await page.evaluate(() => Multiplayer.count);
            if (count >= 4) break;
            await page.waitForTimeout(50);
        }
        await page.keyboard.up('4');
        await page.waitForTimeout(500); // Wait for joinCooldown
        
        console.log("After '4' - Multiplayer count:", await page.evaluate(() => Multiplayer.count));
        const hasP4 = await page.evaluate(() => remotePlayers.some(rp => rp.playerId === 4));
        assert.ok(hasP4, "Player 4 failed to spawn on '4' keypress.");

        // 4. Verify Gamepad input updates the `keys` object
        const gamepadKeysRegistered = await page.evaluate(() => {
            return typeof keys !== 'undefined' && keys['Gamepad1A'] && keys['Gamepad1R'];
        });
        console.log(`Gamepad keys registered during gameplay: ${gamepadKeysRegistered}`);
        assert.ok(gamepadKeysRegistered, "Gamepad inputs should propagate to keys object during gameplay.");

        // 5. Verify Gamepad disconnect clears the keys
        console.log("Simulating Gamepad disconnect...");
        await page.evaluate(() => {
            window.mockGamepads[0] = null;
        });
        // Run update loop or wait a frame for polling to run
        await page.waitForTimeout(1000);
        
        const keysObj = await page.evaluate(() => ({ ...keys }));
        console.log("Keys state after disconnect:", keysObj);

        const gamepadKeysCleared = !keysObj['Gamepad1A'] && !keysObj['Gamepad1R'];
        console.log(`Gamepad keys cleared after disconnect: ${gamepadKeysCleared}`);
        assert.ok(gamepadKeysCleared, "Gamepad inputs should be cleared in keys object when gamepad is disconnected.");

        console.log("✅ All multiplayer input and slot bugs verified successfully!");
    } finally {
        if (browser) await browser.close();
        server.kill();
    }
}

run().catch(err => {
    console.error("Verification failed:", err);
    process.exit(1);
});
