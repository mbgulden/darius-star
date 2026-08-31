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
            speaker: 'Lyra',
            portrait: 'lyra_reactive',
            text: "Daddy — it's beautiful. And it's so, so old. It's not evil. It's just... guarding something. Something the Dreamer left behind. Please don't hurt it if you don't have to."
        },
        {
            id: 'briefing_b3_03',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Objective: Survive. The Coelacanth controls the lair — it can trigger cave-ins, redirect currents, and summon lesser predators. Find its weakness and either neutralize or bypass it."
        },
        {
            id: 'briefing_b3_04',
            speaker: 'Darius',
            portrait: 'darius_neutral',
            text: "I've faced big fish before. Lyra — if there's a way to get past it without killing it, find it. But if it's us or the fish, the fish loses. Thorne out."
        }
    ],

    biome4: [
        {
            id: 'briefing_b4_01',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Mission Control to Nyxa. You've entered the Veil Nebula Drift. High-energy ion plasma is disrupting our long-range radar."
        },
        {
            id: 'briefing_b4_02',
            speaker: 'Lyra',
            portrait: 'lyra_neutral',
            text: "The nebula gas is singing, Daddy. The plasma wisps are drawing power directly from precursor conduits."
        },
        {
            id: 'briefing_b4_03',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Objective: Secure the tachyon navigation gate and eliminate the Warp Striker patrol squadron before they pin us down. Thorne out."
        }
    ],

    biome5: [
        {
            id: 'briefing_b5_01',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Mission Control. Sector 5: Saturn Ice Ring. Sub-zero temperatures are stressing the Nyxa's thermal radiators."
        },
        {
            id: 'briefing_b5_02',
            speaker: 'Lyra',
            portrait: 'lyra_neutral',
            text: "Watch the glacier fields, Daddy! The ice shards are crystalline superconductors. They shatter into explosive fragments!"
        },
        {
            id: 'briefing_b5_03',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Objective: Destroy the Cryo Aberration vanguard and clear the thermal fissure for orbital ascent. Thorne out."
        }
    ],

    biome6: [
        {
            id: 'briefing_b6_01',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Haven-7 to Nyxa. You are entering the Fire Nebula around Betelgeuse. Thermal shielding at maximum load."
        },
        {
            id: 'briefing_b6_02',
            speaker: 'Lyra',
            portrait: 'lyra_reactive',
            text: "The magma currents are surging! Magma wasps and pyroclastic golems are converging on our thermal signature!"
        },
        {
            id: 'briefing_b6_03',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Objective: Punch through the magma furnace cruisers and extract the GLYPH-6 Thermal Catalyst. Move fast! Thorne out."
        }
    ],

    biome7: [
        {
            id: 'briefing_b7_01',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Mission Control. Storm Belt entry confirmed. Heavy lightning arcs and ion disruption detected across all frequencies."
        },
        {
            id: 'briefing_b7_02',
            speaker: 'Naya',
            portrait: 'naya_neutral',
            text: "Naya here! Atmospheric turbulence is off the charts, Darius! I've got your flank covered from the thunderheads!"
        },
        {
            id: 'briefing_b7_03',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Objective: Neutralize the Storm Sentinel's EMP array before it disables our primary shields. Thorne out."
        }
    ],

    biome8: [
        {
            id: 'briefing_b8_01',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Haven-7 to Star. You have arrived at the Derelict Navy Fleet graveyard. Centuries of ghost hulls drifting in decaying orbit."
        },
        {
            id: 'briefing_b8_02',
            speaker: 'Cross',
            portrait: 'cross_neutral',
            text: "Automated Navy defense turrets are still active on dead frigate hulls. Targeting subroutines set to kill on sight."
        },
        {
            id: 'briefing_b8_03',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Objective: Salvage the master navy encryption keys from the flagship dreadnought. Do not let those ghost fighters surround you. Thorne out."
        }
    ],

    biome9: [
        {
            id: 'briefing_b9_01',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Mission Control. Extreme biological bio-hazard alert. You are inside the Xenomorph Hive breeding cavern on Proxima b."
        },
        {
            id: 'briefing_b9_02',
            speaker: 'Lyra',
            portrait: 'lyra_somber',
            text: "The hive mind is awake... It's crying out in agony, Daddy. The precursor corruption has mutated every single organism."
        },
        {
            id: 'briefing_b9_03',
            speaker: 'Thorne',
            portrait: 'thorne_neutral',
            text: "Objective: Destroy the Hive Mind Node and sever the neural infestation before it spreads to Haven-7. Thorne out."
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
    const biomeName = (typeof BIOME_DATA !== 'undefined' && BIOME_DATA.names && BIOME_DATA.names[biome]) ? BIOME_DATA.names[biome] : `BIOME ${biome}`;

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
