const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const assert = require('assert');

async function run() {
    console.log("=== STARTING MULTIPLAYER DROP-IN/DROP-OUT STRESS TEST ===");
    console.log("Starting Python HTTP server...");
    const server = spawn('python3', ['-m', 'http.server', '8099'], {
        cwd: '/home/ubuntu/work/darius-star'
    });
    await new Promise(r => setTimeout(r, 1500));

    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        let pageErrors = [];
        page.on('console', msg => {
            const txt = msg.text();
            if (txt.includes('[ERROR]') || txt.includes('Exception') || txt.includes('Error')) {
                console.log('PAGE LOG ERROR:', txt);
            }
        });
        page.on('pageerror', err => {
            console.error('PAGE EXCEPTION:', err.message, err.stack);
            pageErrors.push(err.message);
        });

        await page.goto('http://127.0.0.1:8099/index.html?launch=true', { waitUntil: 'networkidle' });
        await page.waitForSelector('#gameCanvas');

        await page.evaluate(() => {
            transitionToScreen(SCREENS.PLAYING);
        });
        await page.click('#gameCanvas');
        await page.waitForTimeout(2000);

        console.log("--- PART 1: RAPID KEY PRESSES STRESS TEST ---");
        // We will press Enter, 3, 4 in rapid succession multiple times to stress the input queue
        const keysToPress = ['Enter', '3', '4'];
        let exceptionCountBefore = pageErrors.length;
        
        for (let i = 0; i < 50; i++) {
            const key = keysToPress[i % keysToPress.length];
            // Simulate press down and immediately release
            await page.keyboard.down(key);
            await page.waitForTimeout(20);
            await page.keyboard.up(key);
            await page.waitForTimeout(10);
        }

        // Wait a bit for processing to catch up
        await page.waitForTimeout(1000);
        console.log(`Part 1 finished. Active player count after rapid key presses:`, await page.evaluate(() => Multiplayer.count));
        console.log(`Exceptions caught during Part 1:`, pageErrors.length - exceptionCountBefore);

        console.log("--- PART 2: DIRECT API FLOOD STRESS TEST ---");
        // We will flood requestJoin and requestLeave directly in a loop to check for race conditions
        const apiStats = await page.evaluate(() => {
            let joinFailed = 0;
            let joinSucceeded = 0;
            let leaveFailed = 0;
            let leaveSucceeded = 0;

            for (let i = 0; i < 200; i++) {
                // Alternatingly request join and leave for random/sequential players
                const action = i % 2 === 0 ? 'join' : 'leave';
                if (action === 'join') {
                    const req = Multiplayer.requestJoin('interceptor');
                    if (req) {
                        joinSucceeded++;
                        Multiplayer.processJoins(1);
                    } else {
                        joinFailed++;
                    }
                } else {
                    const targetId = (i % 3) + 2; // P2, P3, P4
                    const ok = Multiplayer.requestLeave(targetId);
                    if (ok) {
                        leaveSucceeded++;
                        Multiplayer.processLeaves();
                    } else {
                        leaveFailed++;
                    }
                }
            }

            return {
                joinSucceeded,
                joinFailed,
                leaveSucceeded,
                leaveFailed,
                finalCount: Multiplayer.count,
                players: Multiplayer.players.map(p => ({ id: p.id, status: p.status, alive: p.alive }))
            };
        });

        console.log("API stress test stats:", JSON.stringify(apiStats, null, 2));
        console.log("Exceptions caught during Part 2:", pageErrors.length - exceptionCountBefore);

        assert.strictEqual(pageErrors.length, 0, `Stress test failed due to ${pageErrors.length} client exceptions!`);
        assert.ok(apiStats.finalCount >= 1 && apiStats.finalCount <= 4, `Player count out of bounds! count: ${apiStats.finalCount}`);
        
        console.log("✅ Multiplayer Drop-In/Drop-Out Stress Test: PASSED");

    } finally {
        if (browser) await browser.close();
        server.kill();
    }
}

run().catch(err => {
    console.error("Stress test runner failed:", err);
    process.exit(1);
});
