/**
 * Darius Star — Audio Tunnel Player (GRO-1065: js/story/audio-tunnels.js)
 * Scripted timeline player for narrative tunnels between biomes.
 * Sequences audio clips, background changes, and dialogue lines
 * for the 15 narrative tunnels connecting the 10 biomes.
 *
 * Integrates with:
 *   - audio.js (audioCtx, playSound) — procedural audio cues
 *   - ui/dialogue.js (DialogueSequence, activeDialogue) — subtitle display
 *   - renderer.js (setBiomeBackgrounds) — background changes
 *   - banter_engine.js (BanterEngine.trigger) — contextual banter
 *
 * Load order: after audio.js and ui/dialogue.js, before level_manager.js
 */

const AudioTunnel = {
    // --- State ---
    _active: false,
    _currentTunnel: null,
    _currentEventIndex: 0,
    _elapsed: 0,
    _eventTimer: 0,
    _queuedDialogue: null,
    _backgroundTarget: null,

    // --- 15 Narrative Tunnels ---
    // One tunnel per biome transition (biome 1→2, 2→3, ..., 9→10)
    // plus intro tunnel (game start) and outro tunnel (game end)
    TUNNELS: {
        // Intro: Game start → Biome 1 (Abyssal Trench)
        intro: {
            id: 'intro',
            biomeFrom: 0,
            biomeTo: 1,
            duration: 8.0,
            timeline: [
                {time: 0.0, action: 'play_audio', params: {type: 'ambient_low', duration: 8}},
                {time: 0.5, action: 'show_dialogue', params: {speaker: 'Thorne', text: "Darius. You reading me? The trench opening is dead ahead."}},
                {time: 3.0, action: 'play_audio', params: {type: 'siren'}},
                {time: 3.5, action: 'show_dialogue', params: {speaker: 'Naya', text: "Scanners online. Abyssal Trench — pressure's reading extreme. Stay sharp."}},
                {time: 6.0, action: 'show_dialogue', params: {speaker: 'Darius', text: "Copy that. Taking us in."}},
                {time: 7.5, action: 'change_background', params: {biome: 1}},
            ]
        },

        // Biome 1→2: Abyssal Trench → Coral Graveyard
        t1_2: {
            id: 't1_2',
            biomeFrom: 1,
            biomeTo: 2,
            duration: 10.0,
            timeline: [
                {time: 0.0, action: 'play_audio', params: {type: 'ambient_low', duration: 10}},
                {time: 0.5, action: 'show_dialogue', params: {speaker: 'Lyra', text: "I... I feel something ahead. Old. Sleeping."}},
                {time: 2.5, action: 'show_dialogue', params: {speaker: 'Naya', text: "Coral Graveyard. Navy census says it's a dead reef. Lyra, what are you picking up?"}},
                {time: 5.0, action: 'play_audio', params: {type: 'explosion'}},
                {time: 5.5, action: 'show_dialogue', params: {speaker: 'Thorne', text: "Census was wrong. The reef is active — and it's not coral. Stay in formation."}},
                {time: 8.0, action: 'show_dialogue', params: {speaker: 'Lyra', text: "It's... it's the Dreamer's bones. This whole place is a graveyard of something ancient."}},
                {time: 9.5, action: 'change_background', params: {biome: 2}},
            ]
        },

        // Biome 2→3: Coral Graveyard → Rust Wastes
        t2_3: {
            id: 't2_3',
            biomeFrom: 2,
            biomeTo: 3,
            duration: 8.0,
            timeline: [
                {time: 0.0, action: 'play_audio', params: {type: 'ambient_mid', duration: 8}},
                {time: 0.5, action: 'show_dialogue', params: {speaker: 'Thorne', text: "Rust Wastes ahead. Old Navy salvage fields — high radiation, low visibility."}},
                {time: 3.0, action: 'show_dialogue', params: {speaker: 'Naya', text: "I'm reading Navy distress beacons. Old ones. Pre-war."}},
                {time: 5.5, action: 'show_dialogue', params: {speaker: 'Darius', text: "Ignore them. Navy doesn't come back for their own. We're here for salvage, not ghosts."}},
                {time: 7.5, action: 'change_background', params: {biome: 3}},
            ]
        },

        // Biome 3→4: Rust Wastes → Fire Nebula
        t3_4: {
            id: 't3_4',
            biomeFrom: 3,
            biomeTo: 4,
            duration: 9.0,
            timeline: [
                {time: 0.0, action: 'play_audio', params: {type: 'ambient_high', duration: 9}},
                {time: 0.5, action: 'show_dialogue', params: {speaker: 'Naya', text: "Fire Nebula. Temperature's spiking — shields at 100% but that won't last."}},
                {time: 2.5, action: 'show_dialogue', params: {speaker: 'Lyra', text: "There's something in the fire. Not heat — consciousness. The Dreamer is awake here."}},
                {time: 5.0, action: 'play_audio', params: {type: 'powerup'}},
                {time: 5.5, action: 'show_dialogue', params: {speaker: 'Thorne', text: "If the Dreamer's talking, listen. That thing predates the Navy by millennia."}},
                {time: 8.0, action: 'show_dialogue', params: {speaker: 'Darius', text: "Then let's hear what it has to say. Full burn through the nebula."}},
                {time: 8.5, action: 'change_background', params: {biome: 4}},
            ]
        },

        // Biome 4→5: Fire Nebula → Ice Shelf
        t4_5: {
            id: 't4_5',
            biomeFrom: 4,
            biomeTo: 5,
            duration: 8.0,
            timeline: [
                {time: 0.0, action: 'play_audio', params: {type: 'ambient_low', duration: 8}},
                {time: 0.5, action: 'show_dialogue', params: {speaker: 'Naya', text: "Ice Shelf. Temperature's bottoming out — weapons might ice up."}},
                {time: 2.5, action: 'show_dialogue', params: {speaker: 'Thorne', text: "Keep the engines hot. You freeze in the Shelf, you don't thaw."}},
                {time: 5.0, action: 'show_dialogue', params: {speaker: 'Lyra', text: "I see ships in the ice. Navy destroyers, frozen mid-battle. They were fighting something."}},
                {time: 7.5, action: 'change_background', params: {biome: 5}},
            ]
        },

        // Biome 5→6: Ice Shelf → Biolume Depths
        t5_6: {
            id: 't5_6',
            biomeFrom: 5,
            biomeTo: 6,
            duration: 9.0,
            timeline: [
                {time: 0.0, action: 'play_audio', params: {type: 'ambient_mid', duration: 9}},
                {time: 0.5, action: 'show_dialogue', params: {speaker: 'Lyra', text: "It's beautiful... Biolume Depths. The Dreamer's light."}},
                {time: 2.5, action: 'show_dialogue', params: {speaker: 'Naya', text: "Don't let the pretty lights fool you. Biolume attracts predators."}},
                {time: 5.0, action: 'show_dialogue', params: {speaker: 'Thorne', text: "Naya's right. Biolume means biomass — and biomass means teeth. Stay tight."}},
                {time: 7.5, action: 'show_dialogue', params: {speaker: 'Darius', text: "Acknowledged. We push through."}},
                {time: 8.5, action: 'change_background', params: {biome: 6}},
            ]
        },

        // Biome 6→7: Biolume Depths → Void Edge
        t6_7: {
            id: 't6_7',
            biomeFrom: 6,
            biomeTo: 7,
            duration: 10.0,
            timeline: [
                {time: 0.0, action: 'play_audio', params: {type: 'ambient_low', duration: 10}},
                {time: 0.5, action: 'show_dialogue', params: {speaker: 'Thorne', text: "Void Edge. This is where the trench stops and... nothing starts."}},
                {time: 3.0, action: 'show_dialogue', params: {speaker: 'Lyra', text: "The Dreamer... it's scared. The Void isn't empty — it's waiting."}},
                {time: 5.5, action: 'play_audio', params: {type: 'hit'}},
                {time: 6.0, action: 'show_dialogue', params: {speaker: 'Naya', text: "Proximity alert! Something's in the Void with us!"}},
                {time: 8.0, action: 'show_dialogue', params: {speaker: 'Thorne', text: "Navy shadow fleet. They've been following us since the Shelf. Ambush formation!"}},
                {time: 9.5, action: 'change_background', params: {biome: 7}},
            ]
        },

        // Biome 7→8: Void Edge → Gravity Rift
        t7_8: {
            id: 't7_8',
            biomeFrom: 7,
            biomeTo: 8,
            duration: 8.0,
            timeline: [
                {time: 0.0, action: 'play_audio', params: {type: 'ambient_high', duration: 8}},
                {time: 0.5, action: 'show_dialogue', params: {speaker: 'Naya', text: "Gravity Rift. Hold onto something — flight dynamics are going to get weird."}},
                {time: 3.0, action: 'show_dialogue', params: {speaker: 'Lyra', text: "The Dreamer says... let go. Let gravity take us."}},
                {time: 5.0, action: 'show_dialogue', params: {speaker: 'Darius', text: "Trust the Navigator. Cut engines — drift protocol."}},
                {time: 7.5, action: 'change_background', params: {biome: 8}},
            ]
        },

        // Biome 8→9: Gravity Rift → Time Sink
        t8_9: {
            id: 't8_9',
            biomeFrom: 8,
            biomeTo: 9,
            duration: 9.0,
            timeline: [
                {time: 0.0, action: 'play_audio', params: {type: 'ambient_mid', duration: 9}},
                {time: 0.5, action: 'show_dialogue', params: {speaker: 'Thorne', text: "Time Sink. Navy lost three destroyers here. Chronology errors in their black boxes."}},
                {time: 3.0, action: 'show_dialogue', params: {speaker: 'Lyra', text: "I can see... us. Past runs. Future runs. They all converge here."}},
                {time: 5.5, action: 'show_dialogue', params: {speaker: 'Naya', text: "If Lyra's seeing timelines, we're close to the Dreamer's core. Stay on her signal."}},
                {time: 7.5, action: 'show_dialogue', params: {speaker: 'Darius', text: "Every run, every death — it all leads here. We finish this."}},
                {time: 8.5, action: 'change_background', params: {biome: 9}},
            ]
        },

        // Biome 9→10: Time Sink → Abyss Core
        t9_10: {
            id: 't9_10',
            biomeFrom: 9,
            biomeTo: 10,
            duration: 12.0,
            timeline: [
                {time: 0.0, action: 'play_audio', params: {type: 'ambient_low', duration: 12}},
                {time: 0.5, action: 'show_dialogue', params: {speaker: 'Lyra', text: "This is it. Abyss Core. The Dreamer's... no, the CREATOR'S heart."}},
                {time: 3.0, action: 'play_audio', params: {type: 'powerup'}},
                {time: 3.5, action: 'show_dialogue', params: {speaker: 'Thorne', text: "All hands: this is the final push. Whatever's in that core — it's why the Navy burned a fleet here."}},
                {time: 6.0, action: 'show_dialogue', params: {speaker: 'Naya', text: "Darius... whatever choice you make here, we're with you. All the way."}},
                {time: 8.5, action: 'show_dialogue', params: {speaker: 'Lyra', text: "Dad... I can see the endings. Three of them. You have to choose."}},
                {time: 10.5, action: 'show_dialogue', params: {speaker: 'Darius', text: "Then let's write the right one. Full power to all systems. We end this."}},
                {time: 11.5, action: 'change_background', params: {biome: 10}},
            ]
        },

        // Biome 10→Victory: Abyss Core → Ending (branching triggered)
        t10_end: {
            id: 't10_end',
            biomeFrom: 10,
            biomeTo: 11,
            duration: 8.0,
            timeline: [
                {time: 0.0, action: 'play_audio', params: {type: 'ambient_high', duration: 8}},
                {time: 1.0, action: 'show_dialogue', params: {speaker: 'Lyra', text: "It's done. The Dreamer... it's free."}},
                {time: 3.0, action: 'show_dialogue', params: {speaker: 'Naya', text: "We did it. Against everything the Navy threw at us — we made it."}},
                {time: 5.0, action: 'show_dialogue', params: {speaker: 'Thorne', text: "Mission complete. All craft: status report. We're going home."}},
                {time: 7.0, action: 'show_dialogue', params: {speaker: 'Darius', text: "Not home. Forward. There's still work to do."}},
            ]
        },

        // NG+ exclusive: Reverse Abyss (post-game secret tunnel)
        ngplus_void: {
            id: 'ngplus_void',
            biomeFrom: 10,
            biomeTo: 0,
            duration: 6.0,
            timeline: [
                {time: 0.0, action: 'play_audio', params: {type: 'ambient_high', duration: 6}},
                {time: 0.5, action: 'show_dialogue', params: {speaker: 'Lyra', text: "Wait — the Dreamer says there's MORE. Beneath the core. The Reverse Abyss."}},
                {time: 2.5, action: 'show_dialogue', params: {speaker: 'Thorne', text: "A reverse run? Through the Abyss backwards? That's suicide."}},
                {time: 4.0, action: 'show_dialogue', params: {speaker: 'Darius', text: "Suicide was the first run. This is NG+. We go deeper."}},
                {time: 5.5, action: 'change_background', params: {biome: 0}},
            ]
        },

        // Squad save rescue tunnel (special)
        squad_rescue: {
            id: 'squad_rescue',
            biomeFrom: -1,
            biomeTo: -1,
            duration: 5.0,
            timeline: [
                {time: 0.0, action: 'play_audio', params: {type: 'powerup'}},
                {time: 0.5, action: 'show_dialogue', params: {speaker: 'Naya', text: "Rescue successful! All squad members accounted for."}},
                {time: 2.0, action: 'show_dialogue', params: {speaker: 'Thorne', text: "Good work. Nobody gets left behind in my trench."}},
                {time: 4.0, action: 'show_dialogue', params: {speaker: 'Darius', text: "We're stronger together. Let's finish this."}},
            ]
        },
    },

    /**
     * Start playing a tunnel sequence.
     * @param {string} tunnelId — key in TUNNELS (e.g., 'intro', 't1_2')
     * @returns {boolean} true if tunnel started, false if already playing or invalid
     */
    play(tunnelId) {
        if (this._active) {
            this.stop(); // interrupt current tunnel
        }

        const tunnel = this.TUNNELS[tunnelId];
        if (!tunnel) {
            console.warn(`AudioTunnel: unknown tunnel "${tunnelId}"`);
            return false;
        }

        this._active = true;
        this._currentTunnel = tunnel;
        this._currentEventIndex = 0;
        this._elapsed = 0;
        this._eventTimer = 0;
        this._queuedDialogue = null;
        this._backgroundTarget = null;

        // Trigger banter for tunnel start
        if (typeof BanterEngine !== 'undefined') {
            BanterEngine.trigger('tunnel_enter', tunnel.biomeTo);
        }

        return true;
    },

    /**
     * Stop the current tunnel immediately.
     */
    stop() {
        this._active = false;
        this._currentTunnel = null;
        this._currentEventIndex = 0;
        this._elapsed = 0;
        this._queuedDialogue = null;
        this._backgroundTarget = null;

        // Clear any active dialogue
        if (typeof activeDialogue !== 'undefined') {
            activeDialogue = null;
        }
    },

    /**
     * Update the audio tunnel timeline. Call from game_loop.js each frame.
     * @param {number} dt — delta time in seconds
     */
    update(dt) {
        if (!this._active || !this._currentTunnel) return;

        this._elapsed += dt;

        const timeline = this._currentTunnel.timeline;

        // Process all events whose time has passed
        while (this._currentEventIndex < timeline.length &&
               this._elapsed >= timeline[this._currentEventIndex].time) {
            this._executeEvent(timeline[this._currentEventIndex]);
            this._currentEventIndex++;
        }

        // Check if tunnel is complete
        if (this._currentEventIndex >= timeline.length) {
            // Finalize: apply background if queued
            if (this._backgroundTarget !== null && typeof setBiomeBackgrounds !== 'undefined') {
                setBiomeBackgrounds(this._backgroundTarget);
            }
            this._active = false;
            this._currentTunnel = null;
        }
    },

    /**
     * Check if a tunnel is currently playing.
     * @returns {boolean}
     */
    isPlaying() {
        return this._active;
    },

    /**
     * Get the current tunnel's target biome (for loading screens, etc).
     * @returns {number|null}
     */
    getTargetBiome() {
        return this._currentTunnel ? this._currentTunnel.biomeTo : null;
    },

    // --- Internal ---

    _executeEvent(event) {
        switch (event.action) {
            case 'play_audio':
                this._handleAudio(event.params);
                break;
            case 'show_dialogue':
                this._handleDialogue(event.params);
                break;
            case 'change_background':
                this._handleBackground(event.params);
                break;
            case 'wait':
                // No-op — timeline handles timing natively
                break;
            default:
                break;
        }
    },

    _handleAudio(params) {
        if (typeof playSound !== 'undefined') {
            if (params.duration && params.type && params.type.startsWith('ambient')) {
                // Ambient tones get special handling for sustained playback
                playSound(params.type);
            } else if (params.type) {
                playSound(params.type);
            }
        }
    },

    _handleDialogue(params) {
        if (typeof DialogueSequence === 'undefined') return;

        const line = {
            speaker: params.speaker || 'Naya',
            text: params.text || '',
            isTunnel: true, // mark as tunnel dialogue (no choice UI)
        };

        // Queue dialogue in the global dialogue system
        if (typeof activeDialogue !== 'undefined') {
            activeDialogue = new DialogueSequence([line]);
        }
    },

    _handleBackground(params) {
        // Queue background change for when tunnel completes
        this._backgroundTarget = params.biome;
    },
};
