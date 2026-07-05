const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

async function run() {
    console.log("=== CHECKING GAME LOOP RUNNING ===");
    const server = spawn('python3', ['-m', 'http.server', '8099'], {
        cwd: '/home/ubuntu/work/darius-star'
    });
    await new Promise(r => setTimeout(r, 1500));

    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();
        
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

        await page.goto('http://127.0.0.1:8099/index.html?launch=true', { waitUntil: 'networkidle' });
        await page.waitForSelector('#gameCanvas');

        await page.evaluate(() => {
            transitionToScreen(SCREENS.PLAYING);
        });
        await page.click('#gameCanvas');
        await page.waitForTimeout(2000);

        const getShields = async (lbl) => {
            return await page.evaluate((l) => {
                const s = typeof player !== 'undefined' ? player.shield : 'N/A';
                console.log(`[LOOP CHECK - ${l}] Shield: ${s}, gameTime: ${typeof gameTime !== 'undefined' ? gameTime : 'N/A'}`);
                return s;
            }, lbl);
        };

        await getShields("T0");
        await page.waitForTimeout(1000);
        await getShields("T1");
        await page.waitForTimeout(1000);
        await getShields("T2");

    } finally {
        if (browser) await browser.close();
        server.kill();
    }
}

run().catch(err => {
    console.error("Check failed:", err);
    process.exit(1);
});
