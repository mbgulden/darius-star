#!/usr/bin/env node
/**
 * Darius Star Autoplay Bot — GRO-941
 * Headless Playwright autoplay + telemetry collection.
 *
 * Usage: node tests/autoplay_bot.js [--runs=3] [--duration=120] [--headless]
 *
 * Collects:
 *   - Death count per run
 *   - Weapon level progression
 *   - Scrap accumulated
 *   - Boss defeat time
 *   - Biome reached
 *   - Level reached
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ─── Config ────────────────────────────────────────────────────────────────
const CONFIG = {
    gameUrl: process.env.GAME_URL || 'https://darius-star.pages.dev',
    runs: parseInt(process.env.RUNS || '3', 10),
    durationPerRun: parseInt(process.env.DURATION || '120', 10), // seconds
    headless: process.env.HEADLESS !== 'false',
    viewport: { width: 1280, height: 720 },
    reportPath: path.join(__dirname, '..', 'docs', 'autoplay-telemetry.json'),
};

// ─── Key simulation helpers ───────────────────────────────────────────────
const KEYS = {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    up: 'ArrowUp',
    down: 'ArrowDown',
    fire: ' ',        // Space
    dodge: 'e',
    bomb: 'b',
    missile: 'm',
};

async function holdKey(page, key, durationMs) {
    await page.keyboard.down(key);
    await page.waitForTimeout(durationMs);
    await page.keyboard.up(key);
}

async function autoplayLoop(page, durationSec) {
    const startTime = Date.now();
    const endTime = startTime + durationSec * 1000;

    while (Date.now() < endTime) {
        // Random movement pattern — zigzag with bias toward right (forward)
        const action = Math.random();
        const holdMs = 200 + Math.random() * 400;

        if (action < 0.15) {
            await holdKey(page, KEYS.up, holdMs);
        } else if (action < 0.25) {
            await holdKey(page, KEYS.down, holdMs);
        } else if (action < 0.35) {
            await holdKey(page, KEYS.left, holdMs);
        } else if (action < 0.55) {
            await holdKey(page, KEYS.right, holdMs);
        } else if (action < 0.70) {
            // Fire constantly
            await holdKey(page, KEYS.fire, holdMs);
        } else if (action < 0.80) {
            // Diagonal: up-right
            await page.keyboard.down(KEYS.up);
            await page.keyboard.down(KEYS.right);
            await page.waitForTimeout(holdMs);
            await page.keyboard.up(KEYS.up);
            await page.keyboard.up(KEYS.right);
        } else if (action < 0.90) {
            // Diagonal: down-right
            await page.keyboard.down(KEYS.down);
            await page.keyboard.down(KEYS.right);
            await page.waitForTimeout(holdMs);
            await page.keyboard.up(KEYS.down);
            await page.keyboard.up(KEYS.right);
        } else {
            // Fire + move right
            await page.keyboard.down(KEYS.fire);
            await page.keyboard.down(KEYS.right);
            await page.waitForTimeout(holdMs);
            await page.keyboard.up(KEYS.fire);
            await page.keyboard.up(KEYS.right);
        }

        // Occasionally dodge or bomb
        if (Math.random() < 0.05) {
            await page.keyboard.press(KEYS.dodge);
        }
        if (Math.random() < 0.02) {
            await page.keyboard.press(KEYS.bomb);
        }

        await page.waitForTimeout(50 + Math.random() * 100);
    }
}

async function collectTelemetry(page) {
    return await page.evaluate(() => {
        const telemetry = {
            timestamp: new Date().toISOString(),
            screen: 'unknown',
            player: { dead: false, weaponLevel: 0, scrap: 0, hp: 0 },
            level: { biome: 0, level: 0 },
            enemies: { killed: 0, bossDefeated: false, bossHp: 0 },
            fps: 0,
        };

        try {
            telemetry.screen = (typeof currentScreen !== 'undefined') ? currentScreen : 'unknown';

            if (typeof player !== 'undefined' && player) {
                telemetry.player.dead = player.dead || false;
                telemetry.player.weaponLevel = player.weaponLevel || 0;
                telemetry.player.scrap = player.scrap ?? (typeof scrap !== 'undefined' ? scrap : 0);
                telemetry.player.hp = player.hp ?? (player.health ?? 0);
            }

            if (typeof LevelManager !== 'undefined' && LevelManager) {
                telemetry.level.biome = LevelManager.biome || 0;
                telemetry.level.level = LevelManager.level || 0;
            }

            if (typeof biomeLevel !== 'undefined') {
                telemetry.level.biome = telemetry.level.biome || biomeLevel;
            }

            // Count enemies
            if (typeof enemies !== 'undefined' && Array.isArray(enemies)) {
                telemetry.enemies.active = enemies.filter(e => e && !e.dead).length;
            }
            if (typeof totalEnemiesKilled !== 'undefined') {
                telemetry.enemies.killed = totalEnemiesKilled;
            }

            // Boss state
            if (typeof bossActive !== 'undefined') {
                telemetry.enemies.bossActive = bossActive;
            }
            if (typeof boss !== 'undefined' && boss) {
                telemetry.enemies.bossHp = boss.hp || 0;
                telemetry.enemies.bossDefeated = boss.dead || false;
            }

            // FPS
            if (typeof lastFrameTime !== 'undefined' && typeof performance !== 'undefined') {
                const dt = performance.now() - lastFrameTime;
                telemetry.fps = dt > 0 ? Math.round(1000 / dt) : 60;
            }
        } catch (e) {
            telemetry.error = e.message;
        }

        return telemetry;
    });
}

async function runAutoplay(browser, runIndex) {
    console.log(`\n=== Run ${runIndex + 1}/${CONFIG.runs} ===`);
    const context = await browser.newContext({ viewport: CONFIG.viewport });
    const page = await context.newPage();

    // Collect console errors
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(err.message));

    try {
        console.log(`  Navigating to ${CONFIG.gameUrl}...`);
        await page.goto(CONFIG.gameUrl, { waitUntil: 'networkidle', timeout: 30000 });

        const title = await page.title();
        console.log(`  Page: ${title}`);

        // Wait for canvas to be ready
        await page.waitForSelector('canvas', { timeout: 10000 });
        await page.waitForTimeout(2000); // Let sprites load

        // Click canvas to start (first click initializes audio + enters menu)
        const canvas = await page.$('canvas');
        if (canvas) {
            const box = await canvas.boundingBox();
            const cx = box.x + box.width / 2;
            const cy = box.y + box.height / 2;

            // First click: init audio / dismiss any overlay
            console.log('  Clicking canvas to initialize...');
            await page.mouse.click(cx, cy);
            await page.waitForTimeout(1000);

            // Second click: navigate START GAME (menu option index 1)
            // The menu uses canvas clicks, not DOM buttons
            // "START GAME" is at menuOptions[1] — about 40% down from center
            console.log('  Clicking START GAME...');
            await page.mouse.click(cx, cy * 1.3); // Slightly below center for START GAME
            await page.waitForTimeout(1000);

            // Click through upgrade shop if it appears
            const screen = await page.evaluate(() => {
                return typeof currentScreen !== 'undefined' ? currentScreen : 'unknown';
            });
            console.log(`  Screen after START: ${screen}`);

            if (screen === 'upgrade_shop') {
                console.log('  In upgrade shop — clicking through...');
                await page.mouse.click(cx, cy);
                await page.waitForTimeout(2000);
            }

            // Start autoplay — fire continuously + move
            console.log(`  Starting autoplay for ${CONFIG.durationPerRun}s...`);

            // Hold fire and move right most of the time
            const startTime = Date.now();
            const endTime = startTime + CONFIG.durationPerRun * 1000;
            let sampleCount = 0;
            const samples = [];

            while (Date.now() < endTime) {
                // Basic autoplay: fire + move
                await page.keyboard.down(' '); // fire
                await page.keyboard.down('ArrowRight');
                await page.waitForTimeout(300 + Math.random() * 200);
                await page.keyboard.up('ArrowRight');

                // Random vertical movement
                if (Math.random() < 0.3) {
                    await page.keyboard.down('ArrowUp');
                    await page.waitForTimeout(150 + Math.random() * 200);
                    await page.keyboard.up('ArrowUp');
                } else if (Math.random() < 0.3) {
                    await page.keyboard.down('ArrowDown');
                    await page.waitForTimeout(150 + Math.random() * 200);
                    await page.keyboard.up('ArrowDown');
                }

                // Dodge occasionally
                if (Math.random() < 0.05) {
                    await page.keyboard.press('e');
                }

                await page.keyboard.up(' ');

                // Collect telemetry sample every ~5 seconds
                if (sampleCount % 15 === 0) {
                    const telemetry = await collectTelemetry(page);
                    samples.push(telemetry);
                }
                sampleCount++;
            }

            // Final telemetry collection
            const finalTelemetry = await collectTelemetry(page);
            finalTelemetry.runIndex = runIndex + 1;
            finalTelemetry.durationSec = CONFIG.durationPerRun;
            finalTelemetry.consoleErrors = consoleErrors;
            finalTelemetry.samples = samples;

            return finalTelemetry;
        } else {
            console.log('  ERROR: No canvas found');
            return { runIndex: runIndex + 1, error: 'No canvas', consoleErrors };
        }
    } catch (err) {
        console.log(`  ERROR: ${err.message}`);
        return { runIndex: runIndex + 1, error: err.message, consoleErrors };
    } finally {
        await context.close();
    }
}

async function main() {
    console.log('=== Darius Star Autoplay Bot ===');
    console.log(`Runs: ${CONFIG.runs}, Duration: ${CONFIG.durationPerRun}s each, Headless: ${CONFIG.headless}`);
    console.log(`Game URL: ${CONFIG.gameUrl}`);

    const browser = await chromium.launch({ headless: CONFIG.headless });
    const results = [];

    try {
        for (let i = 0; i < CONFIG.runs; i++) {
            const result = await runAutoplay(browser, i);
            results.push(result);
            console.log(`  Run ${i + 1} complete: biome=${result.level?.biome || '?'}, weapon=${result.player?.weaponLevel || '?'}, scrap=${result.player?.scrap || '?'}`);
        }
    } finally {
        await browser.close();
    }

    // ─── Generate report ────────────────────────────────────────────────
    const report = {
        generated: new Date().toISOString(),
        gameUrl: CONFIG.gameUrl,
        config: { runs: CONFIG.runs, durationPerRun: CONFIG.durationPerRun },
        summary: {
            totalRuns: results.length,
            successfulRuns: results.filter(r => !r.error).length,
            averageWeaponLevel: avg(results.map(r => r.player?.weaponLevel || 0)),
            averageScrap: avg(results.map(r => r.player?.scrap || 0)),
            maxBiomeReached: Math.max(...results.map(r => r.level?.biome || 0)),
            totalErrors: results.reduce((sum, r) => sum + (r.consoleErrors?.length || 0), 0),
        },
        runs: results,
    };

    fs.writeFileSync(CONFIG.reportPath, JSON.stringify(report, null, 2));
    console.log(`\n=== Report saved to ${CONFIG.reportPath} ===`);
    console.log(JSON.stringify(report.summary, null, 2));
}

function avg(arr) {
    if (arr.length === 0) return 0;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10;
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
