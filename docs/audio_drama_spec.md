# Darius Star: Cyber Coelacanth — Show-Don't-Tell Audio Drama Design Specification (GRO-1028)

This document specifies the integration of silence, sound effects (SFX), and environmental cues as narrative tools across all 10 biomes of *Darius Star: Cyber Coelacanth*. Following Michael's guidance, we treat the game as a 100-level audio drama: the gameplay is fun without the story, and the story is engaging purely through sound.

---

## 1. Design Philosophy: Silence and SFX as Narrative

In traditional games, characters explain what they see and feel. In a premium audio drama, dialogue stops, and the acoustic environment carries the story:
1.  **Silence as a Tool**: When the player enters a new biome or encounters a threat, verbal descriptions are removed in favor of environmental drones that convey the pressure, temperature, or psychic weight of the space.
2.  **Show, Don't Tell**: Instead of characters saying "there's an explosion" or "this place is freezing," these states are communicated via specific, high-fidelity sound cues that trigger directly in response to game events.
3.  **Audio-Only Story Beats**: Key plot developments—such as a ship's systems shutting down under gravity, a synthetic character's core being rewritten, or a mother's voice echoing from the past—are told through specialized soundscapes that require the player to *listen* to understand what is happening.
4.  **Unique Biome Signatures**: Every biome possesses a distinct acoustic frequency profile and ambient drone layer that communicates its specific history without using words.

---

## 2. Biome-by-Biome Audio Signature and Cues

Below is the design matrix for the 10 biomes, outlining their unique audio signatures, the environmental cues, and the audio-only narrative beats.

| Biome | Audio Signature (Ambient Drone) | Environmental Audio Cues | Audio-Only Story Beat |
| :--- | :--- | :--- | :--- |
| **1. Abyssal Trench** | Crushing sub-bass pressure drone (40-80 Hz); low-pass filtered at 800 Hz. | `ambient_crushing_depths` (deep ocean rumble)<br>`sfx_bioluminescent_crackle` (snaps/pops of alien fauna)<br>`sfx_guardian_heartbeat` (rhythmic mechanical thud) | The descent into the canyon narrows: dialogue drops out; only the double-thump of the Guardian's mechanical heartbeat and neural static remain. |
| **2. Coral Graveyard** | Resonant, hollow water acoustics; complete absence of biological sounds. | `ambient_dead_reef_creak` (calcium shifting)<br>`sfx_ghost_whale_song` (precursor chime echoes)<br>`sfx_precursor_collapse` (resonance collapse) | Decoding the vault: instead of dialogue, a massive, crystalline chorus rises to a peak, then collapses into absolute silence, representing precursor self-extinction. |
| **3. Coelacanth Hatchery** | Cold, crystalline ice-cave reverb; metallic contraction clicks. | `ambient_ice_cave_groan` (glacier contraction)<br>`sfx_embryonic_pulse` (wet organic pulses)<br>`sfx_cryo_shatter` (high-frequency glass breaking) | The embryo birth: dialogue stops; a wet tearing sound, a rapid double-heartbeat, and a low-frequency rumble convey the hatching of the corrupted entity. |
| **4. Veil Nebula** | Shifting, thought-responsive drones that pan and modulate key randomly. | `ambient_ionized_hum` (phase-modulating gas drone)<br>`sfx_reality_glitch` (frequency-jump distortion)<br>`sfx_dreamer_lonely_note` (hollow, sad wave drone) | First contact: all music fades out; the screen glitches visually as a single, achingly lonely note sweeps across the stereo field, showing the Dreamer's isolation. |
| **5. Ice Ring** | Near-total vacuum silence; close-mic'd, brittle ice impacts. | `ambient_ice_ring_crunch` (glassy ring friction)<br>`sfx_navy_radio_static` (encrypted military bursts)<br>`sfx_decompression_boom` (explosive decompression) | The distress beacon: finding Aldric's wreckage plays a retro Morse code sequence and a deep grandfatherly sigh lost in static, indicating his final moments. |
| **6. Fire Nebula** | Superheated plasma furnace roar; thermal pitch-wavering distortion. | `ambient_plasma_roar` (low furnace rumble)<br>`sfx_flare_sizzle` (high-frequency heat crackle)<br>`sfx_lyra_energy_arcs` (rapid electrical gating) | Lyra's transformation: her voice disappears; a sequence of crackling energy arcs and overlapping harmonic frequencies represent her mind merging with the network. |
| **7. Storm Belt** | 5,000 mph Jovian wind-shear roar (white noise with bandpassed sweeps). | `ambient_hurricane_howl` (modulating wind howl)<br>`sfx_singer_weeping` (distorted bio-acoustic wail)<br>`sfx_data_burst_transfer` (ascending chime arpeggio) | The Storm-Singer's death: the storm wind suddenly drops to a whisper; a single, clear ascending chime sequence plays, then total silence as it shuts down. |
| **8. Derelict Fleet** | Metal stress groans; cold, rhythmic automated distress beeps in vacuum. | `ambient_hull_groan_distress` (hull bending)<br>`sfx_crane_whisper` (filtered white-noise whisper)<br>`sfx_pressure_door_heartbeat` (hiss + double thud) | Entering the flagship hangar: zero dialogue; just the sound of a pressure seal failing, a faint human heartbeat, and a child's toy chime, conveying the father's abandonment. |
| **9. Hive Mind Core** | Warm, wet biological respiration (hive breathing); organic tissue shifting. | `ambient_hive_breathing` (2s swell/decay breathing)<br>`sfx_hive_seductive_choir` (major chord drone)<br>`sfx_rejection_alarm` (dissonant square alarm) | The temptation of peace: a warm, harmonic choir and Lyra's laughter play, then are suddenly cut short by a harsh metallic alarm and weapons loading, signaling rejection. |
| **10. Core Rift** | Gravitational waves (sub-bass sweeps 40-20 Hz) and event horizon hum. | `ambient_singularity_hum` (modulating sub-bass)<br>`sfx_prime_data_clicks` (rapid machine clicks)<br>`sfx_event_horizon_lensing` (muffled low-pass filter) | Reaching the event horizon: all gameplay sounds (lasers, explosions) lose high frequencies (muffled under a steep low-pass filter), leaving only the sub-bass hum. |

---

## 3. Dialogue Silencing & Environmental Cue Mappings

To implement the "show, don't tell" philosophy, redundant dialogue that verbally explained the environments has been silenced and replaced by environmental audio cues. The following table maps the original dialogue lines in `banter_engine.js` to their new silenced environmental subtitles and Web Audio cues.

| Biome | Trigger | Original Dialogue | Silenced Environmental Subtitle | Web Audio Cue ID |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `level_start` | "Deepest place on Earth. Grandpa made it here..." | `[SILENCE] * [Crushing deep-sea pressure drone intensifies] *` | `ambient_crushing_depths` |
| **1** | `unique_enemy` | "What IS that thing? Some kind of angler fish?" | `[SILENCE] * [Bioluminescent crackle echoes in the silt] *` | `sfx_bioluminescent_crackle` |
| **1** | `boss_entrance` | "That's no wreckage. That's the Guardian..." | `[SILENCE] * [Heavy mechanical heartbeat echoes as the Guardian stirs] *` | `sfx_guardian_heartbeat` |
| **2** | `level_start` | "Coral graveyard. Whole reef, just dead..." | `[SILENCE] * [Eerie marine silence: hollow coral structures creak] *` | `ambient_dead_reef_creak` |
| **2** | `unique_enemy` | "Is that a GHOST? Coral formations don't attack." | `[SILENCE] * [Precursor memory-echo whale song vibrates the hull] *` | `sfx_ghost_whale_song` |
| **2** | `boss_entrance` | "The vault's defense system. Made of their deaths." | `[SILENCE] * [Massive precursor voice chorus collapses into static] *` | `sfx_precursor_collapse` |
| **3** | `level_start` | "Europa. Beneath the ice. Where Coelacanths..." | `[SILENCE] * [Claustrophobic ice cavern groans under cryo-pressure] *` | `ambient_ice_cave_groan` |
| **3** | `unique_enemy` | "Half-formed Coelacanth. Twisted. Wrong." | `[SILENCE] * [Wet, organic embryonic pulse thuds from the ice] *` | `sfx_embryonic_pulse` |
| **3** | `boss_entrance` | "The Queen. She sees me as raw material..." | `[SILENCE] * [Stasis chamber ruptures with a high-pitched cryo-shatter] *` | `sfx_cryo_shatter` |
| **4** | `level_start` | "The Veil Nebula. They say it's partially awake." | `[SILENCE] * [Ionized gas hum pan-sweeps across instruments] *` | `ambient_ionized_hum` |
| **4** | `unique_enemy` | "That enemy just changed shape. Reality is thin..." | `[SILENCE] * [Reality-warp frequency glitch bends local time] *` | `sfx_reality_glitch` |
| **4** | `boss_entrance` | "A giant made of gas. How do you fight a dream?" | `[SILENCE] * [Dreamer's lonely note sweeps the stereo field] *` | `sfx_dreamer_lonely_note` |
| **5** | `level_start` | "Saturn's rings. Beautiful... Up close, shrapnel." | `[SILENCE] * [Zero-G vacuum silence: crystalline rings collide] *` | `ambient_ice_ring_crunch` |
| **5** | `unique_enemy` | N/A (Added new event) | `[SILENCE] * [Burst of encrypted Navy radio static blocks comms] *` | `sfx_navy_radio_static` |
| **5** | `boss_entrance` | "The Kraken's the priority. My squad..." | `[SILENCE] * [Cryo-Kraken ice shelf fractures with explosive decompression] *` | `sfx_decompression_boom` |
| **6** | `level_start` | "Supernova remnant. Every surface is slag." | `[SILENCE] * [Superheated plasma furnace roar vibrates the ship frame] *` | `ambient_plasma_roar` |
| **6** | `unique_enemy` | N/A (Added new event) | `[SILENCE] * [Ember flare-burst sizzles against thermal shielding] *` | `sfx_flare_sizzle` |
| **6** | `boss_entrance` | N/A (Added new event) | `[SILENCE] * [Lyra's voice dissolves into crackling energy arcs] *` | `sfx_lyra_energy_arcs` |
| **7** | `level_start` | "Eternal hurricane. Five thousand mph winds..." | `[SILENCE] * [5,000 mph Jovian wind-shear roar blocks all sensors] *` | `ambient_hurricane_howl` |
| **7** | `unique_enemy` | N/A (Added new event) | `[SILENCE] * [Storm-Singer's weeping wail echoes through the gale] *` | `sfx_singer_weeping` |
| **7** | `boss_entrance` | N/A (Added new event) | `[SILENCE] * [Storm winds drop to a whisper before ascending chime burst] *` | `sfx_data_burst_transfer` |
| **8** | `level_start` | "The ghost fleet. Hundreds of Navy ships..." | `[SILENCE] * [Graveyard hulls groan: automated distress beacons chirp] *` | `ambient_hull_groan_distress` |
| **8** | `unique_enemy` | N/A (Added new event) | `[SILENCE] * [Admiral Crane's decrypted voice whisper bleeds in] *` | `sfx_crane_whisper` |
| **8** | `boss_entrance` | N/A (Added new event) | `[SILENCE] * [Pressure door seal failure: faint, rhythmic heartbeat] *` | `sfx_pressure_door_heartbeat` |
| **9** | `level_start` | "The first world the Dreamer transformed..." | `[SILENCE] * [Warm biological breathing of the Xenomorph Hive core] *` | `ambient_hive_breathing` |
| **9** | `unique_enemy` | N/A (Added new event) | `[SILENCE] * [Seductive, warm choir harmonies swell in the cockpit] *` | `sfx_hive_seductive_choir` |
| **9** | `boss_entrance` | N/A (Added new event) | `[SILENCE] * [Warm choir cut short by harsh metallic alert tone] *` | `sfx_rejection_alarm` |
| **10** | `level_start` | "Edge of a black hole. The last Coelacanth..." | `[SILENCE] * [Gravitational waves create low-frequency sub-bass sweeps] *` | `ambient_singularity_hum` |
| **10** | `unique_enemy` | N/A (Added new event) | `[SILENCE] * [Prime Coelacanth's final machine-language data clicks] *` | `sfx_prime_data_clicks` |
| **10** | `boss_entrance` | "That's no reality. That's its nightmares..." | `[SILENCE] * [Event horizon lensing: all weapons muffled under sub-bass] *` | `sfx_event_horizon_lensing` |

---

## 4. Web Audio Procedural Synthesis Implementation Details

To ensure the environmental audio cues fit perfectly with the Sega Genesis/retro-arcade chip aesthetic and operate in a serverless, dependency-free environment, they are procedurally synthesized using the Web Audio API. 

Each cue is constructed using native oscillators (`sine`, `square`, `sawtooth`, `triangle`), gain nodes, filtering, and frequency modulation to simulate vintage FM sound chips:
*   **Low-Frequency Pressure/Gravity**: Synthesized using sub-bass oscillators (40-60 Hz) layered with low-pass filtered brownian/pink noise.
*   **Encrypted Static / Plasma Sizzle**: Synthesized using custom-generated noise buffers passed through dynamic bandpass filters with fast envelope modulations.
*   **Biomechanical Heartbeats**: Double-thud impulses created by modulating the frequency of a triangle wave down from 150 Hz to 20 Hz in 80ms, spaced 300ms apart.
*   **Crystalline Snaps/Chimes**: Multiple high-frequency sine oscillators (ranging from 1.2 kHz to 4.5 kHz) triggered in rapid succession with exponential volume decays.
*   **FM Reality Glitches / Electricity**: Modulating a square wave frequency with high-frequency LFOs and gating the audio path at irregular millisecond intervals.

---

## 5. Verification and Integration Map

*   **Banter Engine (`banter_engine.js`)**:
    *   Integrate silence descriptions as `l` strings prefixed with `[SILENCE]`.
    *   Attach the respective Web Audio cue identifier in the `cue` property of the banter line objects.
    *   Reset cue states upon engine initialization to ensure loops and triggers work reliably across player deaths and level transitions.
*   **Game Loop (`index.html`)**:
    *   Extend `playSound(type)` to support all 30 custom environmental cues, implementing their procedural synthesis.
    *   Modify the UI drawing logic so that if the active banter text starts with `[SILENCE]`, the speaker name is hidden, and the text is styled as a soft green, italicized environmental subtitle: `* [Action description] *`.
    *   Trigger `playSound(activeBanter.cue)` exactly once when the banter line becomes active, ensuring zero duplication.
