const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
    const targetUrl = 'https://staging.darius-star.pages.dev';
    console.log('=== STARTING CHALLENGER STAGING NETWORK AUDIT OF ' + targetUrl + ' ===');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    const consoleMsgs = [];
    const pageErrors = [];
    const networkErrors = [];
    const allRequests = [];

    page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();
        consoleMsgs.push({ type, text });
        console.log('[Console ' + type + '] ' + text);
    });

    page.on('pageerror', err => {
        pageErrors.push({ message: err.message, stack: err.stack });
        console.error('[PageError] ' + err.stack);
    });

    page.on('request', request => {
        allRequests.push(request.url());
    });

    page.on('response', response => {
        const status = response.status();
        const url = response.url();
        if (status >= 400) {
            networkErrors.push({ url, status });
            console.error('[NetworkError] ' + status + ' - ' + url);
        } else {
            console.log('[NetworkResponse] ' + status + ' - ' + url);
        }
    });

    console.log('Navigating to ' + targetUrl + '...');
    const launchUrl = targetUrl + '/index.html?launch=true&biome=1&level=1&mode=solo';
    await page.goto(launchUrl, { waitUntil: 'networkidle', timeout: 30000 });

    console.log('Page loaded. Title:', await page.title());

    // Click canvas to trigger sound init
    const canvas = page.locator('canvas').first();
    if (await canvas.count() > 0) {
        const box = await canvas.boundingBox();
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        console.log('Clicking canvas...');
        await page.mouse.click(cx, cy);
        await page.waitForTimeout(1000);

        // Force transition to PLAYING screen and trigger some sounds
        console.log('Transitioning to PLAYING screen...');
        await page.evaluate(() => {
            if (typeof transitionToScreen === 'function' && typeof SCREENS !== 'undefined') {
                transitionToScreen(SCREENS.PLAYING);
            }
            // Trigger audio system init and SFX preloads if any
            if (typeof initAudio === 'function') {
                initAudio();
            }
            // Let's play hover and shield hit sounds directly via the game's audio manager to force their fetching!
            if (typeof playSound === 'function') {
                console.log('Triggering playSound(ui_hover) and playSound(shield_hit) inside page evaluate...');
                playSound('ui_hover');
                playSound('shield_hit');
            }
        });
        await page.waitForTimeout(3000); // Wait for fetches to settle
    } else {
        console.error('No canvas found!');
    }

    await browser.close();

    const report = {
        timestamp: new Date().toISOString(),
        url: launchUrl,
        consoleMsgs,
        pageErrors,
        networkErrors,
        totalRequests: allRequests.length
    };

    const reportPath = path.join(__dirname, '..', 'docs', 'challenger_staging_audit.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('=== AUDIT COMPLETE. Report saved to ' + reportPath + ' ===');
    console.log('Total console logs: ' + consoleMsgs.length);
    console.log('Total page errors: ' + pageErrors.length);
    console.log('Total network errors (4xx/5xx): ' + networkErrors.length);
}

run().catch(err => {
    console.error('Audit script failed:', err);
    process.exit(1);
});
