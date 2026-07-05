const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
    const targetUrl = process.env.GAME_URL || process.env.STAGING_URL || 'https://darius-star.pages.dev';
    console.log(`=== STARTING LIVE AUDIT OF ${targetUrl} ===`);
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

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

    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    console.log("Page loaded. Title:", await page.title());

    // Take screenshot of title screen
    const screenshotDir = path.join(__dirname, '..', 'docs', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
    }
    await page.screenshot({ path: path.join(screenshotDir, '01_title_screen.png') });
    console.log("Captured screenshot: 01_title_screen.png");

    // Let's inspect what variables are exposed on window
    const windowInspection = await page.evaluate(() => {
        return {
            hasLevelManager: typeof window.LevelManager !== 'undefined',
            hasCampaignSave: typeof window.CampaignSave !== 'undefined',
            hasEconomy: typeof window.Economy !== 'undefined',
            hasMultiplayer: typeof window.Multiplayer !== 'undefined',
            hasNGPlus: typeof window.NGPlus !== 'undefined',
            hasLeaderboard: typeof window.Leaderboard !== 'undefined',
            hasBanterEngine: typeof window.BanterEngine !== 'undefined',
            hasPlayer: typeof window.Player !== 'undefined',
            hasEnemies: typeof window.Enemies !== 'undefined',
            globals: Object.keys(window).filter(k => !k.startsWith('webkit') && !k.startsWith('chrome') && k.length < 50)
        };
    });

    console.log("Window objects inspection:", JSON.stringify(windowInspection, null, 2));

    // Strict assertions checking that critical game systems are loaded
    const requiredSystems = ['LevelManager', 'Player', 'Economy', 'CampaignSave'];
    for (const system of requiredSystems) {
        const prop = `has${system}`;
        if (!windowInspection[prop]) {
            throw new Error(`CRITICAL SYSTEM MISSING: ${system} is not loaded in browser context!`);
        }
    }
    console.log("All critical systems (LevelManager, Player, Economy, CampaignSave) successfully verified.");

    // Wait 2 seconds to see if anything changes or logs appear
    await page.waitForTimeout(2000);

    // Let's close the browser
    await browser.close();

    // Save console logs for review
    const logsPath = path.join(__dirname, '..', 'docs', 'browser_console.log');
    fs.writeFileSync(logsPath, JSON.stringify(consoleMsgs, null, 2));
    console.log("Saved browser console logs to:", logsPath);
}

run().catch(err => {
    console.error("Audit script run error:", err);
    process.exit(1);
});
