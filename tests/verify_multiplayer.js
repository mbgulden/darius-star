const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const assert = require('assert');

async function run() {
    console.log("=== STARTING MULTIPLAYER SELECTION & SCREEN CONSTRAINTS VERIFICATION ===");

    // 1. Start local server
    console.log("Starting local HTTP server...");
    const server = spawn('python3', ['-m', 'http.server', '8099'], {
        cwd: path.join(__dirname, '..')
    });
    await new Promise(resolve => setTimeout(resolve, 1500));

    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
        const page = await context.newPage();

        // Forward page console logs to terminal
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

        // 2. Verify Ship Selection Screen Independence
        console.log("Navigating to ship selection screen...");
        await page.goto('http://127.0.0.1:8099/ship_select.html');
        
        // P2 should be inactive initially
        const p2ActiveInit = await page.evaluate(() => p2Active);
        assert.strictEqual(p2ActiveInit, false, "Player 2 should be inactive by default");

        // Navigate P1 (WASD)
        console.log("Moving Player 1 selection...");
        await page.keyboard.press('d');
        const p1IndexAfterD = await page.evaluate(() => p1SelectedIndex);
        assert.strictEqual(p1IndexAfterD, 1, "Player 1 selection index should change to 1 after pressing 'd'");

        // Activate P2 via ArrowRight
        console.log("Activating Player 2...");
        await page.keyboard.press('ArrowRight');
        const p2ActiveAfterArrow = await page.evaluate(() => p2Active);
        assert.strictEqual(p2ActiveAfterArrow, true, "Player 2 should become active after arrow key press");

        // Verify independent control: ArrowRight moves P2, 'a' moves P1
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('a');
        
        const p1IndexFinal = await page.evaluate(() => p1SelectedIndex);
        const p2IndexFinal = await page.evaluate(() => p2SelectedIndex);
        assert.strictEqual(p1IndexFinal, 0, "Player 1 should have returned to index 0");
        assert.strictEqual(p2IndexFinal, 1, "Player 2 selection index should be 1");

        // Choose custom color swatch for P1 (Cyan) and P2 (Pink)
        await page.click('#p1-swatches .color-swatch[title="Cyan"]');
        await page.click('#p2-swatches .color-swatch[title="Pink"]');
        
        const p1ColorVal = await page.evaluate(() => p1Color);
        const p2ColorVal = await page.evaluate(() => p2Color);
        assert.strictEqual(p1ColorVal, '#00ffff', "Player 1 color should be set to Cyan");
        assert.strictEqual(p2ColorVal, '#ff0055', "Player 2 color should be set to Pink");

        // 3. Verify Local Storage writing on Launch
        console.log("Clicking Launch...");
        await page.click('#btn-launch');
        // Let's wait a tiny bit so the click handler runs and writes to localStorage,
        // but not long enough for the page to navigate away.
        await page.waitForTimeout(100);

        console.log("Reading localStorage selectionRaw...");
        const selectionRaw = await page.evaluate(() => localStorage.getItem('dariusStar_shipSelection'));
        assert.ok(selectionRaw, "localStorage should contain dariusStar_shipSelection");
        
        const selection = JSON.parse(selectionRaw);
        assert.strictEqual(selection.p1.shipId, 'striker', "Player 1 ship ID mismatch");
        assert.strictEqual(selection.p1.color, '#00ffff', "Player 1 color mismatch");
        assert.strictEqual(selection.p2.active, true, "Player 2 active status mismatch");
        assert.strictEqual(selection.p2.shipId, 'phantom', "Player 2 ship ID mismatch");
        assert.strictEqual(selection.p2.color, '#ff0055', "Player 2 color mismatch");

        // 4. Verify Game Mode Screen sharing & boundaries
        console.log("Navigating to index.html with launch params...");
        await page.goto('http://127.0.0.1:8099/index.html?launch=true');
        await page.waitForSelector('#gameCanvas');

        // Transition to PLAYING screen
        await page.evaluate(() => transitionToScreen(SCREENS.PLAYING));
        await page.waitForTimeout(500);

        // Verify Player 1 bounds constraint
        console.log("Testing Player 1 screen boundaries...");
        // Set Player 1 position beyond right/bottom borders
        await page.evaluate(() => {
            player.x = 1000;
            player.y = 1000;
            player.update(0.016); // force update step
        });

        const clampedX = await page.evaluate(() => player.x);
        const clampedY = await page.evaluate(() => player.y);
        const canvasW = await page.evaluate(() => canvas.width);
        const canvasH = await page.evaluate(() => canvas.height);
        const playerW = await page.evaluate(() => player.width);
        const playerH = await page.evaluate(() => player.height);

        assert.strictEqual(clampedX, canvasW - playerW - 10, "Player X was not clamped to canvas boundaries");
        assert.strictEqual(clampedY, canvasH - playerH - 10, "Player Y was not clamped to canvas boundaries");

        console.log("✅ All Multiplayer and Camera Boundary assertions passed successfully!");

    } finally {
        if (browser) await browser.close();
        server.kill();
    }
}

run().catch(err => {
    console.error("❌ Verification failed:", err);
    process.exit(1);
});
