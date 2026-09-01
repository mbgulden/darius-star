/**
 * Darius Star — Mission Briefing Screen (GRO-936)
 * Pre-mission story briefing UI using the existing DialogueSequence engine.
 * Appears between ship select and gameplay. Renders commander portraits,
 * typewriter text, and transitions cleanly into the mission.
 *
 * Load order: after js/ui/dialogue.js, before js/level_manager.js
 */

// --- Briefing State ---
let activeBriefing = null;
let _briefingOnComplete = null;
let briefingCompletedForBiome = {};
if (typeof window !== 'undefined') {
    window._briefingHitRegions = { back: { x: 24, y: 14, w: 165, h: 34 }, skip: { x: 611, y: 14, w: 165, h: 34 } };
    window._briefingHoveredBtn = null;
}

const BRIEFING_SCENES = {
    biome1: [
        {
            id: 'briefing_b1_01',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Commander Thorne, Mission Control. Identification confirmed: Pilot Darius Star, callsign 'Star.' Vessel: Nyxa-class deep-submersible fighter. Status: green across all systems."
        },
        {
            id: 'briefing_b1_02',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Situation: The Abyssal Trench, Sector 7-G. Our seismic scans show unusual tectonic activity in the lower chasm — activity that matches no known geological pattern. Something is down there."
        },
        {
            id: 'briefing_b1_03',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Objective: Descend through the trench. Eliminate hostile contacts. Reach the sector beacon at depth 2,400 meters. Standard recon sweep — chart the area, clear the path, report back."
        },
        {
            id: 'briefing_b1_04',
            speaker: 'Lyra',
            portrait: 'lyra_neutral',
            text: "Daddy? I can feel it. The trench... it's not empty. There's something old down there. Something that's been sleeping. It knows we're coming."
        },
        {
            id: 'briefing_b1_05',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Noted, Lyra. Threats: Standard Umbra patrol craft reported in the upper chasm. Light resistance expected. But if Lyra's readings are accurate, we may be dealing with something beyond standard Umbra hardware."
        },
        {
            id: 'briefing_b1_06',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Keep your head on straight, son. Lyra's your navigator — listen to her when it counts. You've got the best ship in the fleet and I've got your six from up here."
        },
        {
            id: 'briefing_b1_07',
            speaker: 'Darius',
            portrait: 'darius_neutral',
            text: "Understood, Thorne. Nyxa is prepped and ready. Lyra — keep me posted on anything unusual down there. Let's move."
        },
        {
            id: 'briefing_b1_08',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Good hunting, Star. Thorne out."
        }
    ],

    biome2: [
        {
            id: 'briefing_b2_01',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Commander Thorne, Mission Control. Situation: Coral Graveyard, Sector 12-F. What was once a thriving reef is now a calcified labyrinth. Something killed it — and it's still here."
        },
        {
            id: 'briefing_b2_02',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Objective: Navigate the coral maze. Locate and retrieve the Precursor data cache at the graveyard's heart. The coral formations will obstruct sensors — you'll be flying blind in the tight corridors."
        },
        {
            id: 'briefing_b2_03',
            speaker: 'Lyra',
            portrait: 'lyra_neutral',
            text: "The corals... they remember. Every creature that died here, their memories are still in the water. I can hear them whispering. They're scared of something called the Memory Wraith."
        },
        {
            id: 'briefing_b2_04',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Threats: Memory Wraith — class: unknown. Reports describe a psychic predator that feeds on navigational fear. It will try to disorient you. Trust your instruments. Trust Lyra. Thorne out."
        }
    ],

    biome3: [
        {
            id: 'briefing_b3_01',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Commander Thorne, Mission Control. Situation: Coelacanth's Lair. The creature you're about to face predates human civilization by three hundred million years. It is not hostile by nature — it is territorial."
        },
        {
            id: 'briefing_b3_02',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Objective: The Cyber Coelacanth has integrated Precursor cybernetics into its biology. We need the data core embedded in its dorsal plate. You must disable the cybernetic augmentations without destroying the biological specimen."
        },
        {
            id: 'briefing_b3_03',
            speaker: 'Lyra',
            portrait: 'lyra_neutral',
            text: "It's in pain. The machine parts are burning it from the inside. It doesn't want to fight us — it wants the metal out. Please be gentle, Daddy."
        },
        {
            id: 'briefing_b3_04',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Threats: Cyber Coelacanth — bio-mechanical apex predator. Armored plating, EMP discharge, plasma breath. Aim for the cybernetic nodes. Bring it home in one piece if you can. Thorne out."
        }
    ],

    biome4: [
        {
            id: 'briefing_b4_01',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Mission Control. Sector 4: Nebula Drift. Ion storm density has reached critical thresholds."
        },
        {
            id: 'briefing_b4_02',
            speaker: 'Lyra',
            portrait: 'lyra_neutral',
            text: "The plasma waves are singing, Daddy. Ghost signatures in the dust clouds. Watch the sensor blind spots!"
        },
        {
            id: 'briefing_b4_03',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Keep your energy shields polarized. Vanguard units deployed ahead. Advance with caution."
        }
    ],

    biome5: [
        {
            id: 'briefing_b5_01',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Mission Control. Sector 5: Sub-Zero Trench. Hull integrity will suffer thermal compression."
        },
        {
            id: 'briefing_b5_02',
            speaker: 'Lyra',
            portrait: 'lyra_neutral',
            text: "Glacial spires moving under their own power... they are awake and hunting."
        },
        {
            id: 'briefing_b5_03',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Maintain engine thrust to prevent freeze-lock. Eliminate cryogenic defenders."
        }
    ],

    biome6: [
        {
            id: 'briefing_b6_01',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Sector 6: Magma Vent Stratum. Superheated plasma flows will test your heat sinks to the limit."
        },
        {
            id: 'briefing_b6_02',
            speaker: 'Lyra',
            portrait: 'lyra_neutral',
            text: "The lava serpents are guarding the thermal relays. High thermal spikes detected ahead!"
        },
        {
            id: 'briefing_b6_03',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Dodge eruptions, prioritize thermal vents, and punch through to the lower mantle."
        }
    ],

    biome7: [
        {
            id: 'briefing_b7_01',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Sector 7: Tempest Chasm. Lightning discharge grid active throughout the sector."
        },
        {
            id: 'briefing_b7_02',
            speaker: 'Lyra',
            portrait: 'lyra_neutral',
            text: "Electric archons are synchronizing their energy webs. Keep moving or get grounded!"
        },
        {
            id: 'briefing_b7_03',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Overload the lightning conduits and secure the passage."
        }
    ],

    biome8: [
        {
            id: 'briefing_b8_01',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Sector 8: Derelict Fleet Graveyard. Ancient warship hulls drifting in tight formation."
        },
        {
            id: 'briefing_b8_02',
            speaker: 'Lyra',
            portrait: 'lyra_neutral',
            text: "Automated defense turrets are still online after centuries... they think the war never ended."
        },
        {
            id: 'briefing_b8_03',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Navigate the wreckage, neutralize automated sentries, and extract the telemetry logs."
        }
    ],

    biome9: [
        {
            id: 'briefing_b9_01',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Sector 9: Xenomorph Hive Cluster. Bio-luminescent organic structures choking the rift."
        },
        {
            id: 'briefing_b9_02',
            speaker: 'Lyra',
            portrait: 'lyra_neutral',
            text: "The Hive Queen knows we are here. A million voices crying out in unison... it hurts!"
        },
        {
            id: 'briefing_b9_03',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Sterilize bio-pods and breach the hive core."
        }
    ],

    biome10: [
        {
            id: 'briefing_b10_01',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Mission Control to Nyxa. This is it, Darius. The Core Rift. The event horizon of the Precursor Singularity."
        },
        {
            id: 'briefing_b10_02',
            speaker: 'Lyra',
            portrait: 'lyra_determined',
            text: "I can see the entire timeline folding, Daddy. The Architect is waiting at the center of creation. I'm with you to the end."
        },
        {
            id: 'briefing_b10_03',
            speaker: 'Darius',
            portrait: 'darius_determined',
            text: "Nyxa systems locked and overclocked. We finish this today. For Lyra. For all of us."
        },
        {
            id: 'briefing_b10_04',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "May God be with you, Star squadron. Mission Control standing by."
        }
    ]
};

/**
 * Start a briefing sequence for the given biome.
 * @param {number|string} biome - biome number (1-10) or key string ('biome1')
 * @param {function} onComplete - callback when briefing finishes or is skipped
 */
function startBriefing(biome, onComplete) {
    _briefingOnComplete = onComplete;
    const key = typeof biome === 'number' ? `biome${biome}` : biome;
    const lines = BRIEFING_SCENES[key];

    if (!lines) {
        // No briefing defined for this biome — skip straight to callback
        if (onComplete) onComplete();
        return;
    }

    // Build dialogue lines from briefing data with explicit line IDs for studio audio playback
    const dialogueLines = lines.map((line, idx) => ({
        id: line.id || `briefing_${key}_0${idx + 1}`,
        speaker: line.speaker,
        portrait: line.portrait || 'none',
        text: line.text,
        onComplete: idx === lines.length - 1 ? () => {
            briefingCompletedForBiome[key] = true;
            activeBriefing = null;
            if (_briefingOnComplete) {
                const cb = _briefingOnComplete;
                _briefingOnComplete = null;
                cb();
            } else if (typeof transitionToScreen === 'function' && typeof SCREENS !== 'undefined') {
                transitionToScreen(SCREENS.PLAYING);
            }
        } : undefined
    }));

    activeBriefing = new DialogueSequence(dialogueLines);
}

/**
 * Auto-saves progress and returns from Briefing to Ship Selection / Hangar.
 */
function saveAndReturnFromBriefing() {
    if (typeof playSound === 'function') playSound('menu_click');

    // 1. Auto-save current progress to active campaign save slot
    if (typeof window !== 'undefined' && window.CampaignSave) {
        try {
            const activeSlot = parseInt(localStorage.getItem('dariusStar_activeSlot') || '0');
            const us = window.DS_UpgradeSystem;
            const currentSave = CampaignSave.load(activeSlot) || CampaignSave.createBlank();
            currentSave.biome = (typeof LevelManager !== 'undefined') ? LevelManager.biome : 1;
            currentSave.level = (typeof LevelManager !== 'undefined') ? LevelManager.level : 1;
            currentSave.ship = (typeof selectedShip !== 'undefined') ? selectedShip : (currentSave.ship || 'interceptor');
            if (us && us.state) {
                currentSave.scrap = us.state.scrap;
                currentSave.upgrades = { ...us.state.upgrades };
            }
            currentSave.timestamp = Date.now();
            CampaignSave.save(activeSlot, currentSave);
        } catch (err) {
            console.warn('[Briefing] Save failed on return:', err);
        }
    }

    // 2. Stop voice playback
    if (typeof VoicePipeline !== 'undefined' && VoicePipeline && typeof VoicePipeline.stop === 'function') {
        VoicePipeline.stop();
    }
    if (typeof VoicePlayback !== 'undefined' && VoicePlayback && typeof VoicePlayback.stop === 'function') {
        VoicePlayback.stop();
    }

    // 3. Clear active briefing and hide dialogue DOM HUD
    activeBriefing = null;
    _briefingOnComplete = null;
    if (typeof document !== 'undefined') {
        const hud = document.getElementById('lyra-hud');
        if (hud) {
            hud.style.display = 'none';
            hud.classList.remove('lyra-hud-active');
        }
    }

    // 4. Return to Ship Selection screen
    if (typeof transitionToScreen === 'function' && typeof SCREENS !== 'undefined') {
        transitionToScreen(SCREENS.SHIP_SELECT);
    }
}

/**
 * Skip the current briefing entirely (jump to gameplay).
 */
function skipBriefing() {
    if (typeof playSound === 'function') playSound('menu_click');
    if (typeof VoicePipeline !== 'undefined' && VoicePipeline && typeof VoicePipeline.stop === 'function') {
        VoicePipeline.stop();
    }
    if (typeof VoicePlayback !== 'undefined' && VoicePlayback && typeof VoicePlayback.stop === 'function') {
        VoicePlayback.stop();
    }
    const key = (typeof LevelManager !== 'undefined') ? `biome${LevelManager.biome}` : 'biome1';
    briefingCompletedForBiome[key] = true;
    activeBriefing = null;

    if (typeof document !== 'undefined') {
        const hud = document.getElementById('lyra-hud');
        if (hud) {
            hud.style.display = 'none';
            hud.classList.remove('lyra-hud-active');
        }
    }

    if (_briefingOnComplete) {
        const cb = _briefingOnComplete;
        _briefingOnComplete = null;
        cb();
    } else if (typeof transitionToScreen === 'function' && typeof SCREENS !== 'undefined') {
        transitionToScreen(SCREENS.PLAYING);
    }
}

/**
 * Handle click input for briefing with button hit testing.
 */
function handleBriefingClick(x, y) {
    if (typeof x === 'number' && typeof y === 'number') {
        const regions = window._briefingHitRegions || {};
        if (regions.back && x >= regions.back.x && x <= regions.back.x + regions.back.w &&
            y >= regions.back.y && y <= regions.back.y + regions.back.h) {
            saveAndReturnFromBriefing();
            return;
        }
        if (regions.skip && x >= regions.skip.x && x <= regions.skip.x + regions.skip.w &&
            y >= regions.skip.y && y <= regions.skip.y + regions.skip.h) {
            skipBriefing();
            return;
        }
    }
    if (activeBriefing) {
        activeBriefing.next();
    }
}

/**
 * Handle keyboard input for briefing (delegates to activeBriefing.handleKey() or returns to hangar).
 */
function handleBriefingKey(key) {
    if (!key) return;
    const k = key.toLowerCase();
    if (k === 'escape' || k === 'b' || k === 'backspace') {
        saveAndReturnFromBriefing();
        return;
    }
    if (k === 's') {
        skipBriefing();
        return;
    }
    if (activeBriefing) {
        activeBriefing.handleKey(key);
    }
}

/**
 * Update briefing state (typewriter animation, etc.).
 * Called from game_loop.js's update().
 */
function updateBriefing(dt) {
    if (activeBriefing) {
        activeBriefing.update(dt);
    }
}

/**
 * Draw the briefing screen.
 * Called from game_loop.js's draw() when currentScreen === SCREENS.BRIEFING.
 */
function drawBriefing() {
    ctx.save();
    if (typeof CockpitUI !== 'undefined') {
        CockpitUI.drawCockpitGrid(ctx, canvas.width, canvas.height, (typeof gameTime !== 'undefined' ? gameTime : 0));
    }

    // Haven-7 Tactical War Room Background
    const biome = (typeof LevelManager !== 'undefined') ? LevelManager.biome : 1;
    const biomeName = (typeof BIOME_DATA !== 'undefined' && BIOME_DATA.names && BIOME_DATA.names[biome]) ? BIOME_DATA.names[biome] : `BIOME ${biome}`;

    // Define Hit Regions for interactive buttons
    const backBtn = { x: 24, y: 14, w: 165, h: 34 };
    const skipBtn = { x: canvas.width - 189, y: 14, w: 165, h: 34 };
    window._briefingHitRegions = { back: backBtn, skip: skipBtn };

    const hovered = window._briefingHoveredBtn;

    // 1. Back / Save & Return Button (Top Left)
    ctx.save();
    const isBackHovered = (hovered === 'back');
    ctx.fillStyle = isBackHovered ? 'rgba(0, 255, 255, 0.25)' : 'rgba(4, 14, 28, 0.90)';
    ctx.fillRect(backBtn.x, backBtn.y, backBtn.w, backBtn.h);
    ctx.strokeStyle = isBackHovered ? '#00ffff' : 'rgba(0, 200, 255, 0.55)';
    ctx.lineWidth = isBackHovered ? 2 : 1.2;
    if (isBackHovered) {
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
    }
    ctx.strokeRect(backBtn.x, backBtn.y, backBtn.w, backBtn.h);
    ctx.shadowBlur = 0;

    // Corner tech notches on Back button
    ctx.fillStyle = isBackHovered ? '#00ffff' : '#00aacc';
    ctx.fillRect(backBtn.x, backBtn.y, 4, 4);
    ctx.fillRect(backBtn.x + backBtn.w - 4, backBtn.y, 4, 4);
    ctx.fillRect(backBtn.x, backBtn.y + backBtn.h - 4, 4, 4);
    ctx.fillRect(backBtn.x + backBtn.w - 4, backBtn.y + backBtn.h - 4, 4, 4);

    ctx.textAlign = 'center';
    ctx.fillStyle = isBackHovered ? '#ffffff' : '#00ffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('◀ SAVE & GO BACK', backBtn.x + backBtn.w / 2, backBtn.y + 15);
    ctx.fillStyle = isBackHovered ? '#00ffff' : 'rgba(0, 255, 255, 0.65)';
    ctx.font = 'bold 8.5px monospace';
    ctx.fillText('[ESC / B]', backBtn.x + backBtn.w / 2, backBtn.y + 27);
    ctx.restore();

    // 2. Skip Briefing Button (Top Right)
    ctx.save();
    const isSkipHovered = (hovered === 'skip');
    ctx.fillStyle = isSkipHovered ? 'rgba(255, 170, 0, 0.25)' : 'rgba(28, 14, 4, 0.90)';
    ctx.fillRect(skipBtn.x, skipBtn.y, skipBtn.w, skipBtn.h);
    ctx.strokeStyle = isSkipHovered ? '#ffaa00' : 'rgba(255, 170, 0, 0.55)';
    ctx.lineWidth = isSkipHovered ? 2 : 1.2;
    if (isSkipHovered) {
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 10;
    }
    ctx.strokeRect(skipBtn.x, skipBtn.y, skipBtn.w, skipBtn.h);
    ctx.shadowBlur = 0;

    // Corner tech notches on Skip button
    ctx.fillStyle = isSkipHovered ? '#ffaa00' : '#cc8800';
    ctx.fillRect(skipBtn.x, skipBtn.y, 4, 4);
    ctx.fillRect(skipBtn.x + skipBtn.w - 4, skipBtn.y, 4, 4);
    ctx.fillRect(skipBtn.x, skipBtn.y + skipBtn.h - 4, 4, 4);
    ctx.fillRect(skipBtn.x + skipBtn.w - 4, skipBtn.y + skipBtn.h - 4, 4, 4);

    ctx.textAlign = 'center';
    ctx.fillStyle = isSkipHovered ? '#ffffff' : '#ffaa00';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('SKIP BRIEFING ▶', skipBtn.x + skipBtn.w / 2, skipBtn.y + 15);
    ctx.fillStyle = isSkipHovered ? '#ffaa00' : 'rgba(255, 170, 0, 0.65)';
    ctx.font = 'bold 8.5px monospace';
    ctx.fillText('[SPACE / S]', skipBtn.x + skipBtn.w / 2, skipBtn.y + 27);
    ctx.restore();

    // Top Center Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 15px monospace';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 8;
    ctx.fillText('HAVEN-7 TACTICAL WAR ROOM', canvas.width / 2, 26);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`SECTOR ${biome}: ${biomeName.toUpperCase()} — ENTRY BRIEFING`, canvas.width / 2, 42);

    // Tactical Descent Depth Profile Panel
    const panelX = 40;
    const panelY = 64;
    const panelW = canvas.width - 80;
    const panelH = 268;

    if (typeof CockpitUI !== 'undefined') {
        CockpitUI.drawPanel(ctx, panelX, panelY, panelW, panelH, {
            borderColor: 'rgba(0, 200, 255, 0.3)',
            bgColor: 'rgba(4, 10, 22, 0.90)',
            bracketColor: '#ffaa00',
            headerBar: true,
            headerBarHeight: 22
        });

        ctx.textAlign = 'left';
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('📊 TOPOGRAPHICAL DESCENT PROFILE & THREAT ADVISORY', panelX + 14, panelY + 15);
    }

    // Depth Profile Line
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(panelX + 20, panelY + 60);
    ctx.lineTo(panelX + 180, panelY + 110);
    ctx.lineTo(panelX + 360, panelY + 160);
    ctx.lineTo(panelX + 540, panelY + 190);
    ctx.lineTo(panelX + panelW - 40, panelY + 220);
    ctx.stroke();

    // Waypoints
    const waypoints = ['WAYPOINT ALPHA (0m)', 'SURFACE BARRIER (-800m)', 'THERMOCLINE (-1,600m)', 'SUB-CRUSTAL CAVERN (-2,400m)', 'PRECURSOR CORE (-3,200m)'];
    const wayPts = [
        {x: panelX + 20, y: panelY + 60},
        {x: panelX + 180, y: panelY + 110},
        {x: panelX + 360, y: panelY + 160},
        {x: panelX + 540, y: panelY + 190},
        {x: panelX + panelW - 40, y: panelY + 220}
    ];

    for (let i = 0; i < wayPts.length; i++) {
        const pt = wayPts[i];
        ctx.fillStyle = i === 0 ? '#00ff88' : '#ffaa00';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#88aacc';
        ctx.font = 'bold 8.5px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(waypoints[i], pt.x + 8, pt.y + 3);
    }

    // Threat advisory box
    ctx.fillStyle = 'rgba(255, 34, 68, 0.12)';
    ctx.fillRect(panelX + panelW - 200, panelY + 36, 180, 70);
    ctx.strokeStyle = 'rgba(255, 34, 68, 0.4)';
    ctx.strokeRect(panelX + panelW - 200, panelY + 36, 180, 70);

    ctx.fillStyle = '#ff2244';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('⚠️ THREAT LEVEL: HIGH', panelX + panelW - 190, panelY + 54);
    ctx.fillStyle = '#88aacc';
    ctx.font = '9px monospace';
    ctx.fillText('Hostile swarms active.', panelX + panelW - 190, panelY + 70);
    ctx.fillText('Maintain evasive readiness.', panelX + panelW - 190, panelY + 86);

    ctx.restore();

    if (activeBriefing) {
        activeBriefing.draw();
    }
}

if (typeof window !== 'undefined') {
    window.startBriefing = startBriefing;
    window.saveAndReturnFromBriefing = saveAndReturnFromBriefing;
    window.skipBriefing = skipBriefing;
    window.handleBriefingClick = handleBriefingClick;
    window.handleBriefingKey = handleBriefingKey;
    window.updateBriefing = updateBriefing;
    window.drawBriefing = drawBriefing;
}
