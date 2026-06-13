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
export function startBriefing(biome, onComplete) {
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
export function skipBriefing() {
    if (activeBriefing) {
        activeBriefing = null;
    }
}

/**
 * Handle click input for briefing (delegates to activeBriefing.next()).
 */
export function handleBriefingClick() {
    if (activeBriefing) {
        activeBriefing.next();
    }
}

/**
 * Handle keyboard input for briefing (delegates to activeBriefing.handleKey()).
 */
export function handleBriefingKey(key) {
    if (activeBriefing) {
        activeBriefing.handleKey(key);
    }
}

/**
 * Update briefing state (typewriter animation, etc.).
 * Called from game_loop.js's update().
 */
export function updateBriefing(dt) {
    if (activeBriefing) {
        activeBriefing.update(dt);
    }
}

/**
 * Draw the briefing screen.
 * Called from game_loop.js's draw() when currentScreen === SCREENS.BRIEFING.
 */
export function drawBriefing() {
    if (activeBriefing) {
        activeBriefing.draw();
    } else {
        // Fallback: draw a simple placeholder if no active briefing
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Title
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MISSION BRIEFING', canvas.width / 2, canvas.height / 2 - 40);

        // Subtitle
        ctx.fillStyle = '#8a8a9f';
        ctx.font = '12px monospace';
        ctx.fillText('Preparing transmission...', canvas.width / 2, canvas.height / 2 + 10);

        // Skip hint
        ctx.fillStyle = '#4a4a5f';
        ctx.font = '10px monospace';
        ctx.fillText('CLICK or ENTER to skip', canvas.width / 2, canvas.height / 2 + 50);

        ctx.restore();
    }
}

// ES Module bridge — publish exports to global scope for cross-module access
window.startBriefing = startBriefing;
window.skipBriefing = skipBriefing;
window.handleBriefingClick = handleBriefingClick;
window.handleBriefingKey = handleBriefingKey;
window.updateBriefing = updateBriefing;
window.drawBriefing = drawBriefing;
