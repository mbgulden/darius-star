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
let briefingCompletedForBiome = {};

const BRIEFING_SCENES = {
    /**
     * Biome 1: Abyssal Trench
     * The opening mission. Establish Thorne as mission control, Lyra as navigator,
     * and the stakes of the descent.
     */
    biome1: [
        {
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Commander Thorne, Mission Control. Identification confirmed: Pilot Darius Star, callsign 'Star.' Vessel: Nyxa-class deep-submersible fighter. Status: green across all systems."
        },
        {
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Situation: The Abyssal Trench. Sector 7-G. Our seismic scans show unusual tectonic activity in the lower chasm — activity that matches no known geological pattern. Something is down there."
        },
        {
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Objective: Descend through the trench. Eliminate hostile contacts. Reach the sector beacon at depth 2,400 meters. Standard recon sweep — chart the area, clear the path, report back."
        },
        {
            speaker: 'Lyra',
            portrait: 'lyra_neutral',
            text: "Daddy? I can feel it. The trench... it's not empty. There's something old down there. Something that's been sleeping. It knows we're coming."
        },
        {
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "...Noted, Lyra. Threats: Standard Umbra patrol craft reported in the upper chasm. Light resistance expected. But if Lyra's readings are accurate, we may be dealing with something beyond standard Umbra hardware."
        },
        {
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Keep your head on straight, son. Lyra's your navigator — listen to her when it counts. You've got the best ship in the fleet and I've got your six from up here."
        },
        {
            speaker: 'Darius',
            portrait: 'darius_neutral',
            text: "Understood, Thorne. Nyxa is prepped and ready. Lyra — keep me posted on anything unusual down there. Let's move."
        },
        {
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Good hunting, Star. Thorne out."
        }
    ],

    /**
     * Biome 2: Coral Graveyard
     * The coral maze. Introduce the Memory Wraith threat.
     */
    biome2: [
        {
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Commander Thorne, Mission Control. Situation: Coral Graveyard, Sector 12-F. What was once a thriving reef is now a calcified labyrinth. Something killed it — and it's still here."
        },
        {
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Objective: Navigate the coral maze. Locate and retrieve the Precursor data cache at the graveyard's heart. The coral formations will obstruct sensors — you'll be flying blind in the tight corridors."
        },
        {
            speaker: 'Lyra',
            portrait: 'lyra_neutral',
            text: "The corals... they remember. Every creature that died here, their memories are still in the water. I can hear them whispering. They're scared of something called the Memory Wraith."
        },
        {
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Threats: Memory Wraith — class: unknown. Reports describe a psychic predator that feeds on navigational fear. It will try to disorient you. Trust your instruments. Trust Lyra."
        },
        {
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "The maze shifts. What was open thirty seconds ago may be sealed now. Stay mobile. Don't let the Wraith corner you."
        },
        {
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Thorne out."
        }
    ],

    /**
     * Biome 3: Coelacanth's Lair
     * Boss level. The ancient Coelacanth.
     */
    biome3: [
        {
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Commander Thorne, Mission Control. Situation: Coelacanth's Lair. The creature you're about to face predates human civilization by three hundred million years. It is not hostile by nature — it is territorial."
        },
        {
            speaker: 'Lyra',
            portrait: 'lyra_reactive',
            text: "Daddy — it's beautiful. And it's so, so old. It's not evil. It's just... guarding something. Something the Dreamer left behind. Please don't hurt it if you don't have to."
        },
        {
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Objective: Survive. The Coelacanth controls the lair — it can trigger cave-ins, redirect currents, and summon lesser predators. Find its weakness and either neutralize or bypass it."
        },
        {
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Threats: Coelacanth — class: leviathan. Armored hide. Sonic pulse attack. Tail sweep. Watch for the charge — it telegraphs with a low-frequency rumble. When you hear it, DODGE."
        },
        {
            speaker: 'Darius',
            portrait: 'darius_neutral',
            text: "I've faced big fish before. Lyra — if there's a way to get past it without killing it, find it. But if it's us or the fish, the fish loses."
        },
        {
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Thorne out. Come back in one piece, both of you."
        }
    ]
};

/**
 * Start a briefing sequence for the given biome.
 * @param {number|string} biome - biome number (1-10) or key string ('biome1')
 * @param {function} onComplete - callback when briefing finishes or is skipped
 */
function startBriefing(biome, onComplete) {
    const key = typeof biome === 'number' ? `biome${biome}` : biome;
    const lines = BRIEFING_SCENES[key];

    if (!lines) {
        // No briefing defined for this biome — skip straight to callback
        if (onComplete) onComplete();
        return;
    }

    // Build dialogue lines from briefing data
    const dialogueLines = lines.map((line, idx) => ({
        speaker: line.speaker,
        portrait: line.portrait || 'none',
        text: line.text,
        onComplete: idx === lines.length - 1 ? () => {
            briefingCompletedForBiome[key] = true;
            activeBriefing = null;
            if (onComplete) onComplete();
        } : undefined
    }));

    activeBriefing = new DialogueSequence(dialogueLines);
}

/**
 * Skip the current briefing entirely (jump to gameplay).
 */
function skipBriefing() {
    if (activeBriefing) {
        activeBriefing = null;
    }
}

/**
 * Handle click input for briefing (delegates to activeBriefing.next()).
 */
function handleBriefingClick() {
    if (activeBriefing) {
        activeBriefing.next();
    }
}

/**
 * Handle keyboard input for briefing (delegates to activeBriefing.handleKey()).
 */
function handleBriefingKey(key) {
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
    const biomeName = (typeof BIOME_DATA !== 'undefined' && BIOME_DATA[biome]) ? BIOME_DATA[biome].name : `BIOME ${biome}`;

    // Top Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 20px monospace';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fillText('HAVEN-7 TACTICAL WAR ROOM // MISSION DESCENT BRIEFING', canvas.width / 2, 38);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`OPERATIONAL SECTOR: ${biomeName.toUpperCase()} — DEEP TRENCH ENTRY`, canvas.width / 2, 54);

    // Tactical Descent Depth Profile Panel
    const panelX = 40;
    const panelY = 72;
    const panelW = canvas.width - 80;
    const panelH = 260;

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
