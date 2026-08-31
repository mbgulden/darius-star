const assert = require('assert');

// Mock browser globals
global.window = global;
global.currentScreen = 2; // SCREENS.PLAYING
global.SCREENS = { PLAYING: 2, BRIEFING: 1, MENU: 0 };
global.masterVolume = 1.0;
global.sfxVolume = 1.0;
global.runScrap = 0;
global.score = 0;
global.lives = 3;
global.playSound = function() {};

// Load modules
require('../js/scrap_events.js');
require('../js/banter_db.js');
require('../js/banter_engine.js');
require('../js/voice_pipeline.js');
require('../js/ui/dialogue.js');

const ScrapEvents = global.ScrapEvents;
const BanterEngine = global.BanterEngine;
const VoicePipeline = global.VoicePipeline;

function testScrapMilestonesAndAudioPolish() {
    console.log("Running scrap milestone & audio polish tests...");

    // 1. Initialize BanterEngine and ScrapEvents
    BanterEngine.init(1);
    BanterEngine.initScrapEvents();
    ScrapEvents.reset();

    let milestoneCount = 0;
    let lastMilestoneData = null;
    ScrapEvents.on('scrap:milestone', (data) => {
        milestoneCount++;
        lastMilestoneData = data;
    });

    // 2. Routine scrap pickups under 1000 should NOT trigger milestone comms
    ScrapEvents.onScrapCollected(25, 'common');
    assert.strictEqual(milestoneCount, 0, "25 scrap should not trigger milestone");
    ScrapEvents.onScrapCollected(50, 'uncommon');
    assert.strictEqual(milestoneCount, 0, "75 total scrap should not trigger milestone");
    ScrapEvents.onScrapCollected(400, 'rare');
    assert.strictEqual(milestoneCount, 0, "475 total scrap should not trigger milestone");
    ScrapEvents.onScrapCollected(500, 'rare');
    assert.strictEqual(milestoneCount, 0, "975 total scrap should not trigger milestone");

    // 3. Reaching 1000 scrap should trigger milestone 1000 exactly once
    ScrapEvents.onScrapCollected(25, 'common');
    assert.strictEqual(milestoneCount, 1, "1000 scrap should trigger 1st milestone");
    assert.strictEqual(lastMilestoneData.threshold, 1000);

    // 4. Minor pickup after 1000 should NOT trigger milestone
    ScrapEvents.onScrapCollected(200, 'common');
    assert.strictEqual(milestoneCount, 1, "1200 scrap should not re-trigger milestone");

    // 5. Reaching 2000 scrap should trigger 2nd milestone
    ScrapEvents.onScrapCollected(800, 'rare');
    assert.strictEqual(milestoneCount, 2, "2000 scrap should trigger 2nd milestone");
    assert.strictEqual(lastMilestoneData.threshold, 2000);

    // 6. Test shuffle-bag non-repeating milestone phrases across 12 triggers
    BanterEngine._scrapShuffleBags = {};
    const heardLines = [];
    for (let i = 0; i < 12; i++) {
        const line = BanterEngine.triggerScrapEvent('scrap_milestone');
        assert.ok(line, "triggerScrapEvent should return a line");
        assert.ok(line.l, "line should have text content");
        assert.strictEqual(heardLines.includes(line.l), false, `Line "${line.l}" should not repeat in a 12-item shuffle cycle`);
        heardLines.push(line.l);
    }
    assert.strictEqual(heardLines.length, 12, "Should have 12 unique milestone lines in the cycle");

    // 7. Verify VoicePipeline cancellation and request ID sequencing
    VoicePipeline._manifest = {
        lines: {
            'darius_ms_01': { file: 'darius/darius_scrap_milestone_01.mp3', text: 'One thousand scrap plates logged. The Nyxa\'s frame is holding.', speaker: 'darius' }
        }
    };
    VoicePipeline._buildNormalizedIndex();

    VoicePipeline.speak("One thousand scrap plates logged. The Nyxa's frame is holding.", "Darius");
    const firstReqId = VoicePipeline._currentRequestId;
    assert.ok(firstReqId > 0, "First speak should assign request ID");

    // Rapid second speak should increment request ID and stop first
    VoicePipeline.speak("Two thousand scrap secured. That's enough alloy to reinforce forward deflectors.", "Naya");
    const secondReqId = VoicePipeline._currentRequestId;
    assert.strictEqual(secondReqId, firstReqId + 2, "Second speak and stop should increment request sequence");

    console.log("✅ All scrap milestone & audio polish tests passed successfully!");
}

testScrapMilestonesAndAudioPolish();
