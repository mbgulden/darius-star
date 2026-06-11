const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
    console.log("Launching Chromium...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    console.log("Navigating to https://darius-star.pages.dev...");
    await page.goto('https://darius-star.pages.dev', { waitUntil: 'networkidle' });

    console.log("Page title:", await page.title());

    // Create screenshots directory
    const screenshotDir = path.join(__dirname, '..', 'docs', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshotPath = path.join(screenshotDir, 'title-screen-test.png');
    await page.screenshot({ path: screenshotPath });
    console.log("Screenshot saved to:", screenshotPath);

    await browser.close();
}

run().catch(err => {
    console.error("Error running test:", err);
    process.exit(1);
});
