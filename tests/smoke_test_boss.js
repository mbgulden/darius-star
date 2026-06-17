const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
    console.log("=== STARTING BOSS SPRITE SMOKE TEST ===");

    // 1. Start python HTTP server on port 8099
    console.log("Starting local HTTP server on port 8099...");
    const server = spawn('python3', ['-m', 'http.server', '8099'], {
        cwd: path.join(__dirname, '..')
    });

    server.stdout.on('data', (data) => {
        // console.log(`[Server]: ${data}`);
    });

    server.stderr.on('data', (data) => {
        // console.log(`[Server Err]: ${data}`);
    });

    // Wait 1.5 seconds for server to start
    await new Promise(resolve => setTimeout(resolve, 1500));

    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        const page = await context.newPage();

        const consoleMsgs = [];
        const networkErrors = [];

        page.on('console', msg => {
            consoleMsgs.push({ type: msg.type(), text: msg.text() });
            console.log(`[Browser Console ${msg.type()}] ${msg.text()}`);
        });

        page.on('pageerror', err => {
            consoleMsgs.push({ type: 'error', text: `Page Error: ${err.message}` });
            console.error(`[Browser PageError] ${err.stack}`);
        });

        page.on('response', response => {
            if (response.status() >= 400) {
                networkErrors.push({ url: response.url(), status: response.status() });
                console.log(`[Browser Network Error ${response.status()}] ${response.url()}`);
            }
        });

        console.log("Navigating to http://127.0.0.1:8099/index.html?launch=true ...");
        await page.goto('http://127.0.0.1:8099/index.html?launch=true', { waitUntil: 'networkidle' });

        console.log("Page loaded. Title:", await page.title());

        // Get coordinates of canvas center
        const canvasSelector = '#gameCanvas';
        await page.waitForSelector(canvasSelector);
        const canvasElement = await page.$(canvasSelector);
        const box = await canvasElement.boundingBox();
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;

        console.log(`Canvas bounding box:`, box);

        // Click canvas to dismiss any intro screen/initialize audio
        console.log("Clicking canvas to initialize...");
        await page.mouse.click(cx, cy);
        await page.waitForTimeout(2000);

        // Check screen state
        let screen = await page.evaluate(() => typeof currentScreen !== 'undefined' ? currentScreen : 'unknown');
        console.log(`Current screen: ${screen}`);

        // Force transition to playing screen if not already there
        if (screen !== 'playing') {
            console.log("Forcing state to playing...");
            await page.evaluate(() => {
                if (typeof transitionToScreen !== 'undefined' && typeof SCREENS !== 'undefined') {
                    transitionToScreen(SCREENS.PLAYING);
                }
            });
            await page.waitForTimeout(1000);
            screen = await page.evaluate(() => typeof currentScreen !== 'undefined' ? currentScreen : 'unknown');
            console.log(`Current screen now: ${screen}`);
        }

        // 2. Preload boss assets and spawn boss
        console.log("Preloading boss assets...");
        await page.evaluate(() => {
            preloadBossAssets();
        });

        // Wait for boss assets to load
        console.log("Waiting for boss assets to load...");
        let loadingAttempts = 0;
        let isLoaded = false;
        while (loadingAttempts < 10) {
            isLoaded = await page.evaluate(() => typeof bossAssetsLoaded !== 'undefined' ? bossAssetsLoaded : false);
            if (isLoaded) {
                console.log("Boss assets loaded successfully!");
                break;
            }
            await page.waitForTimeout(500);
            loadingAttempts++;
        }

        if (!isLoaded) {
            console.log("WARNING: bossAssetsLoaded is still false. Checking bossSprites keys...");
        }

        // Inspect bossSprites object
        const spritesStatus = await page.evaluate(() => {
            if (typeof bossSprites === 'undefined') return 'undefined';
            const keys = Object.keys(bossSprites);
            const status = {};
            keys.forEach(k => {
                const img = bossSprites[k];
                if (!img) {
                    status[k] = 'null';
                } else if (img.tagName === 'CANVAS') {
                    status[k] = `canvas_${img.width}x${img.height}`;
                } else {
                    status[k] = `img_complete=${img.complete}_width=${img.naturalWidth}`;
                }
            });
            return status;
        });
        console.log("bossSprites object status:", JSON.stringify(spritesStatus, null, 2));

        // 3. Spawn Boss now
        console.log("Spawning boss...");
        await page.evaluate(() => {
            spawnBossNow();
        });

        // Wait 2 seconds for boss to spawn and settle
        await page.waitForTimeout(2000);

        // Check if boss spawned and is rendered as sprite
        const bossState = await page.evaluate(() => {
            if (typeof boss === 'undefined' || !boss) return null;
            
            // Re-run the hasSprite check logic from enemies.js to see if it is using sprite or fallback
            let spriteKey = 'boss';
            if (boss.hp <= 0) {
                spriteKey = 'boss_death';
            } else if (boss.state === 'intro' || boss.state === 'idle') {
                spriteKey = 'boss_idle';
            } else if (boss.state === 'rage' || boss.state === 'architect_final') {
                spriteKey = 'boss_rage';
            } else if (boss.state === 'laser_charge') {
                spriteKey = 'boss_laser_charge';
            } else if (boss.state === 'laser_fire') {
                spriteKey = 'boss_laser_fire';
            }

            const checkSprite = (s) => {
                if (!s) return false;
                if (s.tagName === 'CANVAS') return s.width > 0;
                return s.complete && s.naturalWidth > 0;
            };

            const sprite = bossSprites[spriteKey] || bossSprites['boss'];
            const hasSprite = checkSprite(sprite);

            return {
                hp: boss.hp,
                state: boss.state,
                spriteKey,
                hasSprite,
                spriteTag: sprite ? sprite.tagName : 'null',
                spriteWidth: sprite ? (sprite.naturalWidth || sprite.width) : 0,
                x: boss.x,
                y: boss.y
            };
        });

        console.log("Boss State during smoke test:", JSON.stringify(bossState, null, 2));

        // Let's also verify boss_minion sprite
        const minionSpriteState = await page.evaluate(() => {
            if (typeof enemySprites === 'undefined') return 'undefined';
            const sprite = enemySprites['boss_minion'];
            if (!sprite) return 'null';
            return sprite.tagName === 'CANVAS' ? `canvas_${sprite.width}x${sprite.height}` : `img_complete=${sprite.complete}_width=${sprite.naturalWidth}`;
        });
        console.log("boss_minion sprite status in enemySprites:", minionSpriteState);

        // 4. Capture screenshot
        const screenshotDir = path.join(__dirname, '..', 'docs', 'screenshots');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
        const screenshotPath = path.join(screenshotDir, 'boss_smoke_test.png');
        await page.screenshot({ path: screenshotPath });
        console.log("Saved boss smoke test screenshot to:", screenshotPath);

        // Assert check
        if (bossState && bossState.hasSprite) {
            console.log("SUCCESS: Boss is rendering with sprite assets!");
        } else {
            console.error("FAILURE: Boss is rendering using the canvas fallback!");
        }

    } catch (err) {
        console.error("Smoke test error:", err);
    } finally {
        if (browser) await browser.close();
        console.log("Stopping local HTTP server...");
        server.kill();
    }
}

run().catch(err => {
    console.error("Fatal test error:", err);
    process.exit(1);
});
