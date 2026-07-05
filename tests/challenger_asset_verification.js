const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function run() {
    console.log("=== STARTING CHALLENGER ASSET VERIFICATION ===");
    
    // Spawn Node static server
    const port = 8099;
    const server = spawn('node', ['/home/ubuntu/work/darius-star/tests/static_server.js'], {
        cwd: '/home/ubuntu/work/darius-star/tests'
    });
    
    await new Promise(r => setTimeout(r, 2000));
    console.log(`Node static server spawned on port ${port}`);

    let browser;
    let success = true;
    const errors = [];
    const warnings = [];
    const failedRequests = [];

    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        const page = await context.newPage();

        page.on('console', msg => {
            const text = msg.text();
            const type = msg.type();
            console.log(`[BROWSER CONSOLE ${type.toUpperCase()}] ${text}`);
            if (type === 'error') {
                if (text.includes('ui_hover.mp3') || text.includes('shield_hit.mp3') || text.includes('Failed to load resource')) {
                    warnings.push(`Console error (ignored): ${text}`);
                    return;
                }
                errors.push(`Console error: ${text}`);
            } else if (type === 'warning') {
                warnings.push(`Console warning: ${text}`);
            }
        });

        page.on('pageerror', err => {
            console.error('[BROWSER PAGE ERROR]', err.stack || err.message);
            errors.push(`Page error: ${err.message}`);
        });

        page.on('response', response => {
            const status = response.status();
            const url = response.url();
            if (status >= 400) {
                if (url.endsWith('ui_hover.mp3') || url.endsWith('shield_hit.mp3')) {
                    console.log(`[BROWSER HTTP WARNING ${status}] Ignoring missing legacy asset: ${url}`);
                    warnings.push(`Missing legacy asset (ignored): ${url}`);
                    return;
                }
                console.error(`[BROWSER HTTP ERROR ${status}] ${url}`);
                failedRequests.push({ url, status });
                errors.push(`HTTP ${status} loading asset: ${url}`);
            }
        });

        console.log("Navigating to local game URL (Menu screen)...");
        await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });

        // Let page load and run initialization
        await page.waitForTimeout(3000);

        // Check if game has loaded the main screen
        const canvasExists = await page.evaluate(() => {
            const canvas = document.getElementById('gameCanvas');
            return canvas !== null;
        });
        console.log(`gameCanvas exists: ${canvasExists}`);
        if (!canvasExists) {
            errors.push("gameCanvas element not found on page.");
        }

        // Evaluate loaded status of bg_title_strip.png
        const titleBgDetails = await page.evaluate(() => {
            const img = new Image();
            img.src = 'assets/sprites/backgrounds/bg_title_strip.png';
            return {
                complete: img.complete,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight
            };
        });
        console.log("Title background image check:", titleBgDetails);
        if (titleBgDetails.naturalWidth === 0) {
            errors.push("bg_title_strip.png failed to load (naturalWidth = 0).");
        }

        // Evaluate loaded status of ending_sunrise.png
        const endingSunriseDetails = await page.evaluate(() => {
            const img = new Image();
            img.src = 'assets/cinematics/ending_sunrise.png';
            return {
                complete: img.complete,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight
            };
        });
        console.log("Ending sunrise image check:", endingSunriseDetails);
        if (endingSunriseDetails.naturalWidth === 0) {
            errors.push("ending_sunrise.png failed to load (naturalWidth = 0).");
        }

        // Check video elements on page
        const videoDetails = await page.evaluate(() => {
            const bossIntro = document.getElementById('boss-intro-video');
            const victory = document.getElementById('victory-video');
            return {
                bossIntro: bossIntro ? {
                    src: bossIntro.src,
                    readyState: bossIntro.readyState,
                    error: bossIntro.error ? bossIntro.error.message : null,
                    paused: bossIntro.paused
                } : null,
                victory: victory ? {
                    src: victory.src,
                    readyState: victory.readyState,
                    error: victory.error ? victory.error.message : null,
                    paused: victory.paused
                } : null
            };
        });
        console.log("Video elements check:", videoDetails);
        if (!videoDetails.bossIntro) {
            errors.push("boss-intro-video element not found in DOM.");
        }
        if (!videoDetails.victory) {
            errors.push("victory-video element not found in DOM.");
        }

        // Check if the variables tick over a 300ms period on Menu Screen
        const tickBefore = await page.evaluate(async () => {
            const vals = [];
            for (let i = 0; i < 7; i++) {
                vals.push({
                    frame: typeof titleBgFrame !== 'undefined' ? titleBgFrame : null,
                    timer: typeof titleBgTimer !== 'undefined' ? titleBgTimer : null,
                    gameTime: typeof gameTime !== 'undefined' ? gameTime : null,
                    paused: typeof paused !== 'undefined' ? paused : null,
                    currentScreen: typeof currentScreen !== 'undefined' ? currentScreen : null
                });
                await new Promise(r => setTimeout(r, 60));
            }
            return vals;
        });
        console.log("Tick values over time on MENU screen:", tickBefore);

        // Verify that the title background panner is actually ticking
        const pannerTicking = tickBefore.some((val, idx) => idx > 0 && val.frame !== tickBefore[0].frame) ||
                              tickBefore.some((val, idx) => idx > 0 && val.timer !== tickBefore[0].timer);
        console.log(`Title background loop panner actively ticking/animating: ${pannerTicking}`);
        if (!pannerTicking) {
            errors.push("Title background loop panner is frozen or not updating on the menu screen.");
        }

        // Transition to PLAYING screen to test gameplay loop
        console.log("Transitioning to SCREENS.PLAYING and clicking gameCanvas...");
        await page.evaluate(() => {
            transitionToScreen(SCREENS.PLAYING);
        });
        await page.click('#gameCanvas');
        await page.waitForTimeout(2000);

        // Check if the variables tick over a 200ms period after transition
        const tickAfter = await page.evaluate(async () => {
            const vals = [];
            for (let i = 0; i < 5; i++) {
                vals.push({
                    frame: typeof titleBgFrame !== 'undefined' ? titleBgFrame : null,
                    timer: typeof titleBgTimer !== 'undefined' ? titleBgTimer : null,
                    gameTime: typeof gameTime !== 'undefined' ? gameTime : null,
                    paused: typeof paused !== 'undefined' ? paused : null,
                    currentScreen: typeof currentScreen !== 'undefined' ? currentScreen : null
                });
                await new Promise(r => setTimeout(r, 50));
            }
            return vals;
        });
        console.log("Tick values over time in PLAYING mode:", tickAfter);

        // Verify gameTime is advancing
        const gameTimeAdvancing = tickAfter[tickAfter.length - 1].gameTime > tickAfter[0].gameTime;
        console.log(`Game loop active and gameTime advancing: ${gameTimeAdvancing}`);
        if (!gameTimeAdvancing) {
            errors.push("Game loop is frozen or gameTime not advancing after transition to PLAYING.");
        }

    } catch (e) {
        console.error("Verification script execution failed:", e);
        errors.push(`Script execution error: ${e.message}`);
    } finally {
        if (browser) await browser.close();
        server.kill();
    }

    console.log("\n=== VERIFICATION RESULTS ===");
    console.log("Errors found:", errors.length);
    errors.forEach(e => console.log(`- ERROR: ${e}`));
    console.log("Warnings found:", warnings.length);
    warnings.forEach(w => console.log(`- WARNING: ${w}`));
    
    if (errors.length > 0) {
        console.log("\nVERDICT: FAIL ❌");
        process.exit(1);
    } else {
        console.log("\nVERDICT: PASS ✅");
        process.exit(0);
    }
}

run();
