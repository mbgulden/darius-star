const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
    const targetBaseUrl = process.env.GAME_URL || 'http://localhost:8099';
    console.log(`=== STARTING 4-PLAYER DEEP AUDIT OF ${targetBaseUrl} ===`);

    const screenshotDir = path.join(__dirname, '..', 'docs', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Mock HTML5 Gamepad API before loading the document
    await page.evaluateOnNewDocument(() => {
        window.mockGamepad1 = {
            index: 0,
            id: "Mock Gamepad 1",
            connected: true,
            buttons: [
                { pressed: false, value: 0.0 }, // A (fire)
                { pressed: false, value: 0.0 }, // B
                { pressed: false, value: 0.0 }, // X
                { pressed: false, value: 0.0 }, // Y
                { pressed: false, value: 0.0 }, // LB
                { pressed: false, value: 0.0 }  // RB
            ],
            axes: [0.0, 0.0, 0.0, 0.0]
        };
        window.mockGamepad2 = {
            index: 1,
            id: "Mock Gamepad 2",
            connected: true,
            buttons: [
                { pressed: false, value: 0.0 }, // A (fire)
                { pressed: false, value: 0.0 }, // B
                { pressed: false, value: 0.0 }, // X
                { pressed: false, value: 0.0 }, // Y
                { pressed: false, value: 0.0 }, // LB
                { pressed: false, value: 0.0 }  // RB
            ],
            axes: [0.0, 0.0, 0.0, 0.0]
        };
        navigator.getGamepads = () => [window.mockGamepad1, window.mockGamepad2];
    });

    const consoleMsgs = [];
    page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();
        consoleMsgs.push({ type, text });
        console.log(`[Browser Console ${type}] ${text}`);
    });

    page.on('pageerror', err => {
        consoleMsgs.push({ type: 'error', text: `Page Error: ${err.message}` });
        console.error(`[Browser PageError] ${err.stack}`);
    });

    async function capture(page, filename, delayMs = 1000) {
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
        await new Promise(r => setTimeout(r, delayMs));
        const outPath = path.join(screenshotDir, filename);
        await page.screenshot({ path: outPath });
        console.log(`Captured screenshot: ${filename} -> ${outPath}`);
    }

    // Load Gameplay URL
    const launchUrl = `${targetBaseUrl}/index.html?biome=1&level=1&launch=true`;
    console.log(`Navigating to ${launchUrl}...`);
    await page.goto(launchUrl, { waitUntil: 'load' });
    
    // Wait 5 seconds for asset preloading
    await new Promise(r => setTimeout(r, 5000));

    // Focus canvas
    await page.click('#gameCanvas');
    console.log("Canvas focused.");

    // Trigger Player 2, 3, and 4 Join
    console.log("Simulating P2, P3, and P4 drop-in commands...");
    await page.keyboard.press('2');
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.press('3');
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.press('4');
    
    // Wait 2 seconds for all drop-in animations
    await new Promise(r => setTimeout(r, 2000));
    await capture(page, '08_4player_dropin.png', 500);

    // Simulate Active Gamepad Controls for P3/P4 and Keyboard Controls for P1/P2
    console.log("Simulating concurrent inputs for all 4 players...");
    
    // Trigger Gamepad Inputs (P3 & P4 move up and shoot)
    await page.evaluate(() => {
        window.mockGamepad1.buttons[0].pressed = true;
        window.mockGamepad1.buttons[0].value = 1.0;
        window.mockGamepad1.axes[1] = -0.8; // Move up

        window.mockGamepad2.buttons[0].pressed = true;
        window.mockGamepad2.buttons[0].value = 1.0;
        window.mockGamepad2.axes[1] = -0.8; // Move up
    });

    // Trigger Keyboard Inputs (P1 & P2 move up and shoot)
    await page.keyboard.down('KeyW');
    await page.keyboard.down('Space');
    await page.keyboard.down('ArrowUp');
    await page.keyboard.down('Digit0');

    // Run inputs for 2 seconds
    await new Promise(r => setTimeout(r, 2000));

    // Take screenshot during active combat
    await capture(page, '09_4player_bullet_hell.png', 500);

    // Release all inputs
    await page.keyboard.up('KeyW');
    await page.keyboard.up('Space');
    await page.keyboard.up('ArrowUp');
    await page.keyboard.up('Digit0');

    await page.evaluate(() => {
        window.mockGamepad1.buttons[0].pressed = false;
        window.mockGamepad1.buttons[0].value = 0.0;
        window.mockGamepad1.axes[1] = 0.0;

        window.mockGamepad2.buttons[0].pressed = false;
        window.mockGamepad2.buttons[0].value = 0.0;
        window.mockGamepad2.axes[1] = 0.0;
    });

    console.log("Closing browser...");
    await browser.close();

    const logsPath = path.join(__dirname, '..', 'docs', 'puppeteer_4player_console.log');
    fs.writeFileSync(logsPath, JSON.stringify(consoleMsgs, null, 2));
    console.log("Saved console logs.");
    console.log("=== 4-PLAYER DEEP AUDIT COMPLETED ===");
}

run().catch(err => {
    console.error("4-player stress test failed:", err);
    process.exit(1);
});
