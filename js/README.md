# Darius Star Modules

This directory contains the modular JavaScript components that drive the Darius Star space arcade game. Each module is loaded globally in a specific dependency order to manage game loop execution, entities, rendering, and audio.

* [audio.js](audio.js) — audio — Web Audio synthesizer that handles game sound effects and routing output through a safety compressor.
* [audio_chip.js](audio_chip.js) — audio — Web Audio chiptune synthesizer loop that plays procedurally generated retro music tracks using simple waveforms.
* [audio_manager.js](audio_manager.js) — audio — Handles audio preloading, biome-aware track switching, and crossfading for cinematic music.
* [banter_db.js](banter_db.js) — data — Dialogue database containing over 500 lines of contextual character banter across all 10 biomes.
* [banter_engine.js](banter_engine.js) — system — Event-driven dialogue engine that triggers contextual character conversations during missions based on gameplay events.
* [canvas_setup.js](canvas_setup.js) — utility — Initializes the canvas element, rendering context, and DOM HUD references early in the loading order.
* [combat.js](combat.js) — core — Defines classes representing player/enemy bullets, collectible powerups, and visual explosion entities.
* [combo.js](combo.js) — system — Tracks and visualizes kill-streaks, scaling a score multiplier based on rapid successive kills.
* [economy.js](economy.js) — system — Manages scrap drops, anti-farming logic, and collectible scrap creation when enemies are destroyed.
* [enemies.js](enemies.js) — core — Implements baseline classes for enemy behavior, boss patterns, and seeded random number generation.
* [game_loop.js](game_loop.js) — core — Core game orchestrator that manages state transitions, entity updating/drawing loops, input handling, and collision detection.
* [i18n.js](i18n.js) — ui — Framework providing multi-language support for subtitles and game UI elements.
* [leaderboard.js](leaderboard.js) — system — LocalStorage-backed registry tracking personal bests and high scores in three game mode categories.
* [level_manager.js](level_manager.js) — system — Spawns enemies according to designed waves, formations, and campaign progression configurations.
* [multiplayer.js](multiplayer.js) — system — Manages the active state and registration of up to 4 players for drop-in/drop-out cooperative play.
* [ngplus.js](ngplus.js) — system — Orchestrates the New Game+ gameplay mechanics, paradox enemies, and campaign loop progression.
* [player.js](player.js) — core — Defines the Player class representing the controllable player ship, including movement and configuration.
* [player_state.js](player_state.js) — system — Centralized API tracking player campaign progress, unlocks, and narrative decisions.
* [renderer.js](renderer.js) — render — Orchestrates particle and parallax background rendering, including cavern and screen-shake effects.
* [save_system.js](save_system.js) — system — LocalStorage-backed campaign save system supporting three distinct game slots.
* [scrap_events.js](scrap_events.js) — system — Event emitter connecting the economy scrap collection with the banter dialogue system.
* [sprites.js](sprites.js) — render — Preloads visual sprites, portraits, explosions, and boss sheets into canvas image buffers.
* [touch_controls.js](touch_controls.js) — ui — Renders and processes a virtual on-screen joystick and action buttons for mobile devices.
* [ui.js](ui.js) — ui — Implements menus, settings, HUD, dialog flow, and shop UI screens.
* [upgrade_system.js](upgrade_system.js) — system — Metaprogression system managing purchase and state of permanent ship upgrades.
* [utils.js](utils.js) — utility — Shared helper functions including sprite sheet frame slicing and late-bound variable references.
* [voice_playback.js](voice_playback.js) — audio — Lazy-loads and handles playback of audio voice lines, integrated with subtitles.
