// tests/telemetry_integration_test.js — Browser-based integration smoke test
// Proves that index.html loads the telemetry module in dependency order and logs events correctly.

const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

async function run() {
    console.log("=== STARTING TELEMETRY INTEGRATION SMOKE TEST ===");

    // 1. Spawn local static web server
    const server = spawn('python3', ['-m', 'http.server', '8099'], {
        cwd: path.resolve(__dirname, '..')
    });
    
    // Give the server a moment to boot
    await new Promise(r => setTimeout(r, 1500));

    let browser;
    try {
        // 2. Launch headless browser
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        // Track page console messages and errors
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

        // 3. Navigate to game index with standard UTM tracking parameters
        const testUrl = 'http://127.0.0.1:8099/index.html?launch=true&utm_source=gauntlet_integration&utm_medium=integration_test&utm_campaign=smoke_run';
        console.log(`Navigating to: ${testUrl}`);
        await page.goto(testUrl, { waitUntil: 'networkidle' });

        // 4. Verify Telemetry module is loaded in global scope
        const hasTelemetry = await page.evaluate(() => {
            return typeof window.Telemetry !== 'undefined';
        });
        if (!hasTelemetry) {
            throw new Error("Telemetry module failed to load or is not in global scope!");
        }
        console.log("✅ Telemetry module loaded successfully in index.html");

        // 5. Start the game (Transition to SCREENS.PLAYING to trigger session_start)
        console.log("Transitioning to gameplay screen...");
        await page.evaluate(() => {
            if (typeof transitionToScreen === 'function') {
                transitionToScreen(SCREENS.PLAYING);
            } else {
                // Fallback to direct currentScreen assignment if transitionToScreen is not available
                currentScreen = SCREENS.PLAYING;
                resetGame();
            }
        });

        // Let the game loop tick for a moment
        await page.waitForTimeout(1000);

        // 6. Verify session_start event was logged to localStorage
        const eventsBeforeDeath = await page.evaluate(() => {
            const data = localStorage.getItem('darius_star_telemetry_events');
            return data ? JSON.parse(data) : [];
        });

        console.log("Events in localStorage after start:", JSON.stringify(eventsBeforeDeath, null, 2));

        if (eventsBeforeDeath.length === 0) {
            throw new Error("No telemetry events logged on session start!");
        }
        
        const startEvent = eventsBeforeDeath.find(e => e.eventName === 'session_start');
        if (!startEvent) {
            throw new Error("session_start event not found in storage queue!");
        }
        
        // Assert start event payload values
        const payload = startEvent.payload;
        if (!payload.sessionId.startsWith('t-')) {
            throw new Error(`Invalid sessionId: ${payload.sessionId}`);
        }
        if (payload.shipType !== 'striker') {
            throw new Error(`Invalid shipType: ${payload.shipType}`);
        }
        if (!payload.sourcePath.includes('utm_source=gauntlet_integration')) {
            throw new Error(`Invalid sourcePath: ${payload.sourcePath}`);
        }
        console.log("✅ session_start telemetry event validated successfully.");

        // 7. Simulate a player death to trigger the death event
        console.log("Simulating player death...");
        await page.evaluate(() => {
            console.log("DIAGNOSTIC - BEFORE - currentScreen:", typeof currentScreen !== 'undefined' ? currentScreen : 'undefined');
            console.log("DIAGNOSTIC - BEFORE - targetScreen:", typeof targetScreen !== 'undefined' ? targetScreen : 'undefined');
            console.log("DIAGNOSTIC - BEFORE - activeDialogue:", typeof activeDialogue !== 'undefined' ? activeDialogue : 'undefined');
            console.log("DIAGNOSTIC - BEFORE - gameOver:", typeof gameOver !== 'undefined' ? gameOver : 'undefined');
            console.log("DIAGNOSTIC - BEFORE - runScrapSaved:", typeof runScrapSaved !== 'undefined' ? runScrapSaved : 'undefined');
            console.log("DIAGNOSTIC - BEFORE - player:", typeof player !== 'undefined' ? player : 'undefined');
            
            activeDialogue = null; // Clear any blocking dialogue that would cause early return
            gameOver = true;
            runScrapSaved = false; // Reset scrap saved flag to trigger telemetry check
            score = 1500;
            runScrap = 320;
            
            console.log("DIAGNOSTIC - AFTER ASSIGNMENTS - currentScreen:", typeof currentScreen !== 'undefined' ? currentScreen : 'undefined');
            console.log("DIAGNOSTIC - AFTER ASSIGNMENTS - gameOver:", typeof gameOver !== 'undefined' ? gameOver : 'undefined');
            console.log("DIAGNOSTIC - AFTER ASSIGNMENTS - runScrapSaved:", typeof runScrapSaved !== 'undefined' ? runScrapSaved : 'undefined');
            
            // Force game loop update call so it executes the telemetry check before loop skips it
            if (typeof update === 'function') {
                try {
                    update(0.016);
                    console.log("DIAGNOSTIC - update() executed successfully.");
                } catch (e) {
                    console.log("DIAGNOSTIC - update() crashed with error:", e.message, e.stack);
                }
            } else {
                console.log("DIAGNOSTIC - update function not found!");
            }
        });

        // Let the state update settle
        await page.waitForTimeout(1000);

        // 8. Verify death event was recorded in queue
        const eventsAfterDeath = await page.evaluate(() => {
            const data = localStorage.getItem('darius_star_telemetry_events');
            return data ? JSON.parse(data) : [];
        });

        console.log("Events in localStorage after death:", JSON.stringify(eventsAfterDeath, null, 2));

        const deathEvent = eventsAfterDeath.find(e => e.eventName === 'death');
        if (!deathEvent) {
            throw new Error("death event not found in storage queue!");
        }

        if (typeof deathEvent.payload.score !== 'number') {
            throw new Error(`Invalid score type in death event: ${typeof deathEvent.payload.score}`);
        }
        if (typeof deathEvent.payload.scrap !== 'number') {
            throw new Error(`Invalid scrap type in death event: ${typeof deathEvent.payload.scrap}`);
        }
        console.log("✅ death telemetry event validated successfully.");

        // 9. Simulate a replay/restart intent
        console.log("Simulating replay intent...");
        await page.evaluate(() => {
            if (typeof handleDeathOrVictoryRestart === 'function') {
                handleDeathOrVictoryRestart();
            }
        });

        // Let the transition settle
        await page.waitForTimeout(500);

        // 10. Verify replay_intent was recorded
        const eventsAfterReplay = await page.evaluate(() => {
            const data = localStorage.getItem('darius_star_telemetry_events');
            return data ? JSON.parse(data) : [];
        });

        console.log("Events in localStorage after replay restart:", JSON.stringify(eventsAfterReplay, null, 2));

        const replayEvent = eventsAfterReplay.find(e => e.eventName === 'replay_intent');
        if (!replayEvent) {
            throw new Error("replay_intent event not found in storage queue!");
        }
        if (replayEvent.payload.replay_type !== 'restart') {
            throw new Error(`Invalid replay_type: ${replayEvent.payload.replay_type}`);
        }
        console.log("✅ replay_intent telemetry event validated successfully.");

        console.log("=== TELEMETRY INTEGRATION SMOKE TEST PASSED ===");
        process.exit(0);

    } catch (err) {
        console.error("❌ INTEGRATION TEST FAILURE:", err);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
        server.kill();
    }
}

run().catch(err => {
    console.error("Unhandle rejection in integration runner:", err);
    process.exit(1);
});
