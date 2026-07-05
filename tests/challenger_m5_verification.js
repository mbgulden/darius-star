const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
    console.log('=== STARTING MILESTONE 5 CHALLENGER VERIFICATION ===');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    const consoleMsgs = [];
    const pageErrors = [];
    const networkErrors = [];

    page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();
        consoleMsgs.push({ type, text });
        console.log(`[Browser Console ${type}] ${text}`);
    });

    page.on('pageerror', err => {
        pageErrors.push(err.message);
        console.error(`[Browser PageError] ${err.stack}`);
    });

    page.on('response', response => {
        if (response.status() >= 400) {
            networkErrors.push({ url: response.url(), status: response.status() });
            console.log(`[Browser Network Error ${response.status()}] ${response.url()}`);
        }
    });

    console.log('Navigating to http://127.0.0.1:8088/index.html ...');
    await page.goto('http://127.0.0.1:8088/index.html', { waitUntil: 'networkidle' });

    console.log('Page loaded. Clicking canvas to trigger user interaction...');
    await page.click('#gameCanvas');
    await page.waitForTimeout(1000);

    // 1. Verify title background strip assets
    console.log('1. Checking title background asset loading and parameters...');
    const titleBgInfo = await page.evaluate(() => {
        if (typeof titleBgImage === 'undefined') return { error: 'titleBgImage is undefined' };
        return {
            loaded: typeof titleBgLoaded !== 'undefined' ? titleBgLoaded : null,
            complete: titleBgImage.complete,
            naturalWidth: titleBgImage.naturalWidth,
            naturalHeight: titleBgImage.naturalHeight,
            src: titleBgImage.src,
            frameWidth: typeof TITLE_FRAME_WIDTH !== 'undefined' ? TITLE_FRAME_WIDTH : null,
            frameHeight: typeof TITLE_FRAME_HEIGHT !== 'undefined' ? TITLE_FRAME_HEIGHT : null,
            totalFrames: typeof TITLE_TOTAL_FRAMES !== 'undefined' ? TITLE_TOTAL_FRAMES : null,
        };
    });
    console.log('Title Background Image Info:', JSON.stringify(titleBgInfo, null, 2));

    if (titleBgInfo.error) {
        console.error('FAILURE: Title background image variable not found in window scope.');
        process.exit(1);
    }

    if (!titleBgInfo.complete || titleBgInfo.naturalWidth === 0) {
        console.error('FAILURE: Title background image failed to load or has 0 width.');
        process.exit(1);
    }

    const expectedWidth = (titleBgInfo.totalFrames || 31) * (titleBgInfo.frameWidth || 1280);
    if (titleBgInfo.naturalWidth !== expectedWidth) {
        console.error(`FAILURE: Title background image width ${titleBgInfo.naturalWidth} does not match expected width ${expectedWidth}`);
        process.exit(1);
    }
    console.log('SUCCESS: Title background image width matches expected frame strip width.');

    // 2. Check title background animation loop (panning)
    console.log('2. Verifying title background panning loop frames are incrementing...');
    const frame0 = await page.evaluate(() => typeof titleBgFrame !== 'undefined' ? titleBgFrame : -1);
    await page.waitForTimeout(500);
    const frame1 = await page.evaluate(() => typeof titleBgFrame !== 'undefined' ? titleBgFrame : -1);
    console.log(`Frame at T0: ${frame0}, Frame at T0+500ms: ${frame1}`);
    if (frame0 === -1 || frame1 === -1) {
        console.error('FAILURE: titleBgFrame is not defined.');
        process.exit(1);
    }
    if (frame0 === frame1) {
        console.error('FAILURE: titleBgFrame is static. Panning loop is not updating.');
        process.exit(1);
    }
    console.log('SUCCESS: titleBgFrame is incrementing successfully.');

    // 3. Verify Boss Intro Video playback
    console.log('3. Verifying boss intro video playback integration...');
    await page.evaluate(() => {
        playBossIntro();
    });
    await page.waitForTimeout(1500);

    const bossVideoState = await page.evaluate(() => {
        const video = document.getElementById('boss-intro-video');
        return {
            playing: typeof bossIntroPlaying !== 'undefined' ? bossIntroPlaying : null,
            videoPaused: video.paused,
            videoMuted: video.muted,
            videoCurrentTime: video.currentTime,
            isActiveClass: video.classList.contains('active')
        };
    });
    console.log('Boss Intro Video State:', JSON.stringify(bossVideoState, null, 2));

    if (!bossVideoState.playing || bossVideoState.videoPaused || !bossVideoState.isActiveClass) {
        console.error('FAILURE: Boss Intro Video is not playing or active.');
        process.exit(1);
    }
    console.log('SUCCESS: Boss Intro Video is playing successfully.');

    // Skip Boss Intro Video
    console.log('Skipping boss intro video...');
    await page.evaluate(() => {
        skipBossIntro();
    });
    await page.waitForTimeout(500);

    const bossVideoStateAfterSkip = await page.evaluate(() => {
        const video = document.getElementById('boss-intro-video');
        return {
            playing: typeof bossIntroPlaying !== 'undefined' ? bossIntroPlaying : null,
            videoPaused: video.paused,
            isActiveClass: video.classList.contains('active')
        };
    });
    console.log('Boss Intro Video State After Skip:', JSON.stringify(bossVideoStateAfterSkip, null, 2));
    if (bossVideoStateAfterSkip.playing || !bossVideoStateAfterSkip.videoPaused || bossVideoStateAfterSkip.isActiveClass) {
        console.error('FAILURE: Boss Intro Video was not correctly skipped.');
        process.exit(1);
    }
    console.log('SUCCESS: Boss Intro Video skipped successfully.');

    // 4. Verify Victory Video playback
    console.log('4. Verifying victory video playback integration...');
    await page.evaluate(() => {
        playVictoryCinematic();
    });
    await page.waitForTimeout(1500);

    const victoryVideoState = await page.evaluate(() => {
        const video = document.getElementById('victory-video');
        return {
            playing: typeof victoryVideoPlaying !== 'undefined' ? victoryVideoPlaying : null,
            videoPaused: video.paused,
            videoMuted: video.muted,
            videoCurrentTime: video.currentTime,
            isActiveClass: video.classList.contains('active')
        };
    });
    console.log('Victory Video State:', JSON.stringify(victoryVideoState, null, 2));

    if (!victoryVideoState.playing || victoryVideoState.videoPaused || !victoryVideoState.isActiveClass) {
        console.error('FAILURE: Victory Video is not playing or active.');
        process.exit(1);
    }
    console.log('SUCCESS: Victory Video is playing successfully.');

    // Skip Victory Video
    console.log('Skipping victory video...');
    await page.evaluate(() => {
        skipVictoryCinematic();
    });
    await page.waitForTimeout(500);

    const victoryVideoStateAfterSkip = await page.evaluate(() => {
        const video = document.getElementById('victory-video');
        return {
            playing: typeof victoryVideoPlaying !== 'undefined' ? victoryVideoPlaying : null,
            videoPaused: video.paused,
            isActiveClass: video.classList.contains('active')
        };
    });
    console.log('Victory Video State After Skip:', JSON.stringify(victoryVideoStateAfterSkip, null, 2));
    if (victoryVideoStateAfterSkip.playing || !victoryVideoStateAfterSkip.videoPaused || victoryVideoStateAfterSkip.isActiveClass) {
        console.error('FAILURE: Victory Video was not correctly skipped.');
        process.exit(1);
    }
    console.log('SUCCESS: Victory Video skipped successfully.');

    await browser.close();

    console.log('\n=== SUMMARY OF RUNTIME AUDIT ===');
    console.log('Page Errors:', pageErrors.length);
    console.log('Network 4xx/5xx Errors:', networkErrors.length);

    if (pageErrors.length > 0) {
        console.error('Page Errors detected:', pageErrors);
        process.exit(1);
    }
    
    // Ignore ui_hover.mp3 and shield_hit.mp3 404s since they are unrelated to Milestone 5 assets
    const criticalNetworkErrors = networkErrors.filter(e => !e.url.includes('ui_hover.mp3') && !e.url.includes('shield_hit.mp3'));
    if (criticalNetworkErrors.length > 0) {
        console.error('Critical Network Errors detected:', criticalNetworkErrors);
        process.exit(1);
    }

    console.log('\nALL MILESTONE 5 ASSET TESTS PASSED SUCCESSFULLY! ✅');
}

run().catch(err => {
    console.error('Verification run failed:', err);
    process.exit(1);
});
