const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
    console.log("=== STARTING DETAILED LOCAL AUDIT (PORT 8088) ===");
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    const consoleMsgs = [];
    const failedUrls = [];

    page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();
        consoleMsgs.push({ type, text });
        console.log(`[Console ${type}] ${text}`);
    });

    page.on('pageerror', err => {
        consoleMsgs.push({ type: 'error', text: `Page Error: ${err.message}` });
        console.error(`[PageError] ${err.stack}`);
    });

    page.on('response', response => {
        if (response.status() >= 400) {
            const entry = { url: response.url(), status: response.status() };
            failedUrls.push(entry);
            console.log(`[Network Error ${response.status()}] ${response.url()}`);
        }
    });

    console.log("Navigating to http://127.0.0.1:8088 ...");
    await page.goto('http://127.0.0.1:8088', { waitUntil: 'networkidle' });

    console.log("Page loaded. Wait for title screen...");
    await page.waitForTimeout(2000);

    console.log("Clicking canvas and starting New Game...");
    await page.click('#gameCanvas');
    await page.keyboard.press('Enter');

    // Wait 5 seconds to capture game load asset requests
    await page.waitForTimeout(5000);

    console.log("Audit complete. Closing browser...");
    await browser.close();

    // Save outputs
    const auditResults = {
        consoleLogs: consoleMsgs,
        failedNetworkRequests: failedUrls
    };

    const resultsPath = path.join(__dirname, '..', 'docs', 'detailed_audit_results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(auditResults, null, 2));
    console.log("Saved detailed audit results to:", resultsPath);
}

run().catch(err => {
    console.error("Audit run error:", err);
    process.exit(1);
});
