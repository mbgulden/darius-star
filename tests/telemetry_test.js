// tests/telemetry_test.js — Deterministic unit tests for Playable Telemetry Module
// Proves event recording, storage queue shape, privacy-safe fields, and crash resiliency.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const telemetryCode = fs.readFileSync(path.join(__dirname, '../js/telemetry.js'), 'utf8');

console.log('=== STARTING TELEMETRY UNIT TESTS ===');

function createSandbox() {
    const mockStorage = {
        store: {},
        getItem(key) {
            return this.store[key] || null;
        },
        setItem(key, value) {
            this.store[key] = String(value);
        },
        clear() {
            this.store = {};
        }
    };

    const sandbox = {
        console: console,
        Date: Date,
        Math: Math,
        JSON: JSON,
        URL: URL,
        URLSearchParams: URLSearchParams,
        localStorage: mockStorage,
        window: {
            location: {
                href: 'https://whatanadventure.games/darius-star/?utm_source=gauntlet&utm_medium=test&utm_campaign=run1&secret_token=12345&personal_email=user@example.com'
            }
        }
    };

    sandbox.window.localStorage = mockStorage;
    vm.createContext(sandbox);
    vm.runInContext(telemetryCode, sandbox, { filename: 'telemetry.js' });
    return sandbox;
}

// 1. Proves event recording & initialization works
function testEventRecording() {
    console.log('Running: testEventRecording...');
    const sandbox = createSandbox();
    const Telemetry = sandbox.window.Telemetry;
    
    Telemetry.init();
    Telemetry.startSession('phantom', 'hard');
    
    const eventsStr = sandbox.localStorage.getItem('darius_star_telemetry_events');
    assert.ok(eventsStr, 'Events should be stored in localStorage');
    
    const events = JSON.parse(eventsStr);
    assert.strictEqual(events.length, 1, 'Should have exactly 1 event (session_start)');
    
    const sessionStartEvent = events[0];
    assert.strictEqual(sessionStartEvent.eventName, 'session_start');
    assert.ok(sessionStartEvent.eventId.startsWith('t-'), 'eventId should start with t- prefix');
    assert.ok(sessionStartEvent.timestamp, 'timestamp should be populated');
    
    // Log additional events
    Telemetry.logEvent('death', { score: 1000, biome: 3, level: 5 });
    
    const updatedEvents = JSON.parse(sandbox.localStorage.getItem('darius_star_telemetry_events'));
    assert.strictEqual(updatedEvents.length, 2, 'Should have logged second event');
    assert.strictEqual(updatedEvents[1].eventName, 'death');
    assert.strictEqual(updatedEvents[1].payload.score, 1000);
    assert.strictEqual(updatedEvents[1].payload.biome, 3);
    assert.strictEqual(updatedEvents[1].payload.level, 5);
    
    console.log('✅ testEventRecording passed.');
}

// 2. Proves storage queue shape matches requirements
function testStorageQueueShape() {
    console.log('Running: testStorageQueueShape...');
    const sandbox = createSandbox();
    const Telemetry = sandbox.window.Telemetry;
    
    Telemetry.init();
    Telemetry.startSession('bastion', 'easy');
    Telemetry.logEvent('completion', { score: 2500, biome: 10, level: 10, is_final_victory: true });
    
    const events = JSON.parse(sandbox.localStorage.getItem('darius_star_telemetry_events'));
    
    for (const event of events) {
        // Enforce the standard JSON structure
        assert.ok(event.eventId, 'Event must have eventId');
        assert.ok(event.eventName, 'Event must have eventName');
        assert.ok(event.timestamp, 'Event must have timestamp');
        assert.ok(event.payload, 'Event must have payload');
        
        // Payload properties
        assert.ok(event.payload.sessionId, 'Payload must contain sessionId');
        assert.ok(event.payload.sessionId.startsWith('t-'), 'sessionId must be an anonymous token');
        assert.ok(typeof event.payload.durationSeconds === 'number', 'Payload must contain durationSeconds as number');
    }
    
    console.log('✅ testStorageQueueShape passed.');
}

// 3. Proves privacy-safe fields: strips PII, retains allowed marketing queries
function testPrivacySafeFields() {
    console.log('Running: testPrivacySafeFields...');
    const sandbox = createSandbox();
    const Telemetry = sandbox.window.Telemetry;
    
    Telemetry.init();
    Telemetry.startSession('striker', 'normal');
    
    const events = JSON.parse(sandbox.localStorage.getItem('darius_star_telemetry_events'));
    const startEvent = events[0];
    const sourcePath = startEvent.payload.sourcePath;
    
    assert.ok(sourcePath.includes('utm_source=gauntlet'), 'Should retain utm_source');
    assert.ok(sourcePath.includes('utm_medium=test'), 'Should retain utm_medium');
    assert.ok(sourcePath.includes('utm_campaign=run1'), 'Should retain utm_campaign');
    
    // Ensure sensitive query params are stripped
    assert.ok(!sourcePath.includes('secret_token'), 'Should strip secret_token');
    assert.ok(!sourcePath.includes('personal_email'), 'Should strip personal_email');
    
    console.log('✅ testPrivacySafeFields passed.');
}

// 4. Proves resilience (no crash) when storage/network is completely unavailable
function testStorageUnavailableResilience() {
    console.log('Running: testStorageUnavailableResilience...');
    const sandbox = createSandbox();
    const Telemetry = sandbox.window.Telemetry;
    
    // Mock localStorage throwing errors
    sandbox.localStorage = {
        getItem() {
            throw new Error('QuotaExceededError: The user agent is preventing access');
        },
        setItem() {
            throw new Error('QuotaExceededError: LocalStorage is full');
        }
    };
    
    try {
        Telemetry.init();
        Telemetry.startSession('warden', 'normal');
        Telemetry.logEvent('death', { score: 100 });
        console.log('✅ testStorageUnavailableResilience passed (No crash occurred).');
    } catch (err) {
        assert.fail(`Telemetry crashed when localStorage failed: ${err.message}`);
    }
}

function testCustomAdapterFailureResilience() {
    console.log('Running: testCustomAdapterFailureResilience...');
    const sandbox = createSandbox();
    const Telemetry = sandbox.window.Telemetry;
    
    // Custom broken adapter
    const brokenAdapter = {
        send() {
            throw new Error('Network timeout/credentials error');
        }
    };
    
    try {
        Telemetry.init(brokenAdapter);
        Telemetry.startSession('striker', 'normal');
        Telemetry.logEvent('death', { score: 200 });
        console.log('✅ testCustomAdapterFailureResilience passed (No crash occurred).');
    } catch (err) {
        assert.fail(`Telemetry crashed when adapter failed: ${err.message}`);
    }
}

// Run all test assertions
try {
    testEventRecording();
    testStorageQueueShape();
    testPrivacySafeFields();
    testStorageUnavailableResilience();
    testCustomAdapterFailureResilience();
    console.log('\n=== ALL TELEMETRY UNIT TESTS PASSED ===');
    process.exit(0);
} catch (err) {
    console.error('\n❌ UNIT TEST FAILURE:', err);
    process.exit(1);
}
