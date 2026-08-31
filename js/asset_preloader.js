// js/asset_preloader.js — Universal Asset Preloader & Progressive Level Buffering
// Features:
// 1. Boot-time Core Asset Preloading with interactive AudioContext unlocker.
// 2. On-Demand Progressive Biome Buffering (loads only active stratum enemies, bosses, and music).
// 3. Cyberpunk Holographic Telemetry UI renderer for canvas loading states.

const AssetPreloader = (function() {
    // --- State ---
    let _progress = 0;          // 0.0 to 1.0 (visual smoothed progress)
    let _rawProgress = 0;       // 0.0 to 1.0 (actual loaded weight / total weight)
    let _isComplete = false;    // All core assets downloaded & decoded
    let _isLaunched = false;    // User has clicked/pressed key to enter game
    let _statusText = 'INITIALIZING QUANTUM AVIONICS CORE...';
    let _telemetryLogs = [];    // Real-time scrolling asset log
    let _bufferedBiomes = new Set();
    let _activeBufferPromise = null;
    let _pulseTimer = 0;
    let _hexScanAngle = 0;

    // --- Asset Manifests & Definitions ---
    const CORE_SPRITES = [
        // Player Ship Frames (6 ships)
        'player_0', 'player_1',
        'player_phantom_0', 'player_phantom_1',
        'player_bastion_0', 'player_bastion_1',
        'player_tempest_0', 'player_tempest_1',
        'player_specter_0', 'player_specter_1',
        'player_warden_0', 'player_warden_1',
        'scout_0', 'interceptor_0', 'heavy_0',

        // Core VFX & Projectiles
        'player_bullet', 'enemy_bullet', 'laser_0_glow',
        'shield_0', 'thruster_0', 'thruster_1',
        'powerup_weapon', 'powerup_shield', 'powerup_shield_regen',
        'powerup_bomb', 'powerup_speed', 'powerup_materia',
        'scrap_metal', 'scrap_alloy', 'scrap_cell', 'scrap_core',
        'studio_logo'
    ];

    const CORE_PORTRAITS = [
        'lyra_neutral', 'lyra_reactive',
        'darius_neutral', 'darius_reactive',
        'naya_neutral', 'naya_reactive',
        'thorne_neutral', 'thorne_reactive',
        'cross_neutral', 'cross_reactive',
        'comms_overlay'
    ];

    const CORE_AUDIO_SFX = [
        'assets/audio/sfx/ui_select.mp3',
        'assets/audio/sfx/ui_click.mp3',
        'assets/audio/sfx/laser_fire.mp3',
        'assets/audio/sfx/laser_charge.mp3',
        'assets/audio/sfx/transition_click.wav',
        'assets/audio/title-screen.mp3',
        'assets/audio/relief_home_base.mp3'
    ];

    const BIOME_ENEMIES_MAP = {
        1: [
            { key: 'angler_scout', src: 'assets/sprites/enemy_angler_scout_0.png' },
            { key: 'jelly_interceptor', src: 'assets/sprites/enemy_jelly_interceptor_0.png' },
            { key: 'vent_crab_heavy', src: 'assets/sprites/enemy_vent_crab_heavy_0.png' },
            { key: 'trench_eel', src: 'assets/sprites/enemy_trench_eel_0.png' }
        ],
        2: [
            { key: 'rust_drone', src: 'assets/sprites/enemy_rust_drone_0.png' },
            { key: 'coral_wasp', src: 'assets/sprites/enemy_coral_wasp_0.png' },
            { key: 'armored_eel', src: 'assets/sprites/enemy_armored_eel_0.png' },
            { key: 'spine_urchin', src: 'assets/sprites/enemy_spine_urchin_0.png' }
        ],
        3: [
            { key: 'sparker', src: 'assets/sprites/enemy_sparker_0.png' },
            { key: 'sentinel', src: 'assets/sprites/enemy_sentinel_0.png' },
            { key: 'juggernaut', src: 'assets/sprites/enemy_juggernaut_0.png' },
            { key: 'boss_minion', src: 'assets/sprites/enemy_boss_minion_0.png' }
        ],
        4: [
            { key: 'plasma_wisp', src: 'assets/sprites/enemy_plasma_wisp_0.png' },
            { key: 'storm_sprite', src: 'assets/sprites/enemy_storm_sprite_0.png' },
            { key: 'gas_giant', src: 'assets/sprites/enemy_gas_giant_0.png' },
            { key: 'nebula_wraith', src: 'assets/sprites/enemy_nebula_wraith_0.png' }
        ],
        5: [
            { key: 'ice_shard', src: 'assets/sprites/enemy_ice_shard_0.png' },
            { key: 'frost_drone', src: 'assets/sprites/enemy_frost_drone_0.png' },
            { key: 'glacier', src: 'assets/sprites/enemy_glacier_0.png' },
            { key: 'ice_swarm', src: 'assets/sprites/enemy_ice_swarm_0.png' }
        ],
        6: [
            { key: 'ember_sprite', src: 'assets/sprites/enemy_ember_sprite_0.png' },
            { key: 'magma_wasp', src: 'assets/sprites/enemy_magma_wasp_0.png' },
            { key: 'lava_golem', src: 'assets/sprites/enemy_lava_golem_0.png' },
            { key: 'inferno_node', src: 'assets/sprites/enemy_inferno_node_0.png' }
        ],
        7: [
            { key: 'static_spark', src: 'assets/sprites/enemy_static_spark_0.png' },
            { key: 'storm_hawk', src: 'assets/sprites/enemy_storm_hawk_0.png' },
            { key: 'thunderhead', src: 'assets/sprites/enemy_thunderhead_0.png' },
            { key: 'storm_sentinel', src: 'assets/sprites/enemy_storm_sentinel_0.png' }
        ],
        8: [
            { key: 'salvage_drone', src: 'assets/sprites/enemy_salvage_drone_0.png' },
            { key: 'ghost_fighter', src: 'assets/sprites/enemy_ghost_fighter_0.png' },
            { key: 'turret_battery', src: 'assets/sprites/enemy_turret_battery_0.png' },
            { key: 'fleet_turret', src: 'assets/sprites/enemy_fleet_turret_0.png' }
        ],
        9: [
            { key: 'crawler', src: 'assets/sprites/enemy_crawler_0.png' },
            { key: 'spitter', src: 'assets/sprites/enemy_spitter_0.png' },
            { key: 'brute', src: 'assets/sprites/enemy_brute_0.png' },
            { key: 'hive_node', src: 'assets/sprites/enemy_hive_node_0.png' }
        ],
        10: [
            { key: 'glitch_fragment', src: 'assets/sprites/enemy_glitch_fragment_0.png' },
            { key: 'paradox_wisp', src: 'assets/sprites/enemy_paradox_wisp_0.png' },
            { key: 'null_entity', src: 'assets/sprites/enemy_null_entity_0.png' },
            { key: 'rift_aberration', src: 'assets/sprites/enemy_rift_aberration_0.png' }
        ]
    };

    function _addLog(msg) {
        _telemetryLogs.push({ text: msg, time: Date.now() });
        if (_telemetryLogs.length > 7) _telemetryLogs.shift();
    }

    function _loadImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ ok: true, img, src });
            img.onerror = () => resolve({ ok: false, img: null, src });
            img.src = src;
        });
    }

    function _loadAudio(src) {
        return new Promise((resolve) => {
            const audio = new Audio();
            let resolved = false;
            const done = (ok) => {
                if (!resolved) {
                    resolved = true;
                    resolve({ ok, audio, src });
                }
            };
            audio.oncanplaythrough = () => done(true);
            audio.onloadeddata = () => done(true);
            audio.onerror = () => done(false);
            // Fallback timeout to never hang the preloader
            setTimeout(() => done(true), 2500);
            audio.src = src;
            audio.load();
        });
    }

    // --- Core Boot Preloader ---
    async function startBootPreload() {
        console.log('[AssetPreloader] Starting Tier 1 Boot Preload...');
        _rawProgress = 0.05;
        _addLog('[SYS] INITIALIZING ANTIGRAVITY ENGINE...');

        let totalItems = CORE_SPRITES.length + CORE_PORTRAITS.length + CORE_AUDIO_SFX.length + 6;
        let loadedItems = 0;

        function updateItem(label) {
            loadedItems++;
            _rawProgress = Math.min(0.95, loadedItems / totalItems);
            _statusText = `BUFFERING ASSET: ${label.toUpperCase()}`;
            _addLog(`[VRAM] LOADED: ${label}`);
        }

        // 1. Core Sprites
        const spritePromises = CORE_SPRITES.map(async (name) => {
            const src = name === 'studio_logo' ? 'assets/sprites/studio_logo.png' : `assets/sprites/${name}.png`;
            const res = await _loadImage(src);
            if (typeof playerSprites !== 'undefined' && name.startsWith('player')) {
                playerSprites[name] = res.img;
            }
            if (typeof vfxSprites !== 'undefined') {
                vfxSprites[name] = res.img;
            }
            updateItem(name);
        });

        // 2. Portraits
        const portraitPromises = CORE_PORTRAITS.map(async (name) => {
            const src = `assets/sprites/portraits/${name}.png`;
            const res = await _loadImage(src);
            if (typeof portraitSprites !== 'undefined') {
                portraitSprites[name] = res.img;
            }
            updateItem(`portrait_${name}`);
        });

        // 3. Core Audio SFX
        const audioPromises = CORE_AUDIO_SFX.map(async (src) => {
            await _loadAudio(src);
            const baseName = src.split('/').pop();
            updateItem(baseName);
        });

        // 4. Initial Biome 1 Assets
        const biome1Promise = bufferBiome(1).then(() => updateItem('biome_1_stratum'));

        // 5. Pre-warm explosion animation frames
        const vfxExplosionPromises = [];
        for (let f = 0; f < 4; f++) {
            for (let n = 0; n < 4; n++) {
                vfxExplosionPromises.push(_loadImage(`assets/sprites/vfx/explosion_${f}_${n}.png`).then(() => {
                    updateItem(`vfx_explosion_${f}_${n}`);
                }));
            }
        }

        // 6. Preload title music track in AudioManager
        let audioMgrPromise = Promise.resolve();
        if (typeof AudioManager !== 'undefined' && AudioManager.init) {
            audioMgrPromise = AudioManager.init().then(() => {
                return AudioManager.preloadTrack('title_cinematic');
            }).then(() => updateItem('title_music')).catch(() => {});
        }

        await Promise.all([
            ...spritePromises,
            ...portraitPromises,
            ...audioPromises,
            ...vfxExplosionPromises,
            biome1Promise,
            audioMgrPromise
        ]);

        _rawProgress = 1.0;
        _isComplete = true;
        _statusText = '★ ALL AVIONICS & TACTICAL ASSETS READY ★';
        _addLog('[SYS] ALL TIER-1 RECEPTORS SYNCHRONIZED (100%)');
        console.log('[AssetPreloader] Boot Preload Complete!');
    }

    // --- On-Demand Progressive Biome Buffering ---
    async function bufferBiome(biomeId) {
        const id = Math.max(1, Math.min(10, parseInt(biomeId, 10) || 1));
        if (_bufferedBiomes.has(id)) return true;

        console.log(`[AssetPreloader] On-Demand Buffering Biome ${id}...`);
        const enemies = BIOME_ENEMIES_MAP[id] || [];
        const bossSrc = `assets/sprites/boss_b${id}_0.png`;
        const midBossSrc = `assets/sprites/boss_b${id}_mid_0.png`;

        const promises = [];

        // Stratum enemies
        enemies.forEach(({ key, src }) => {
            promises.push(_loadImage(src).then((res) => {
                if (res.img && typeof enemySprites !== 'undefined') {
                    if (typeof preCompositeAdditive === 'function') {
                        enemySprites[key] = preCompositeAdditive(res.img);
                    } else {
                        enemySprites[key] = res.img;
                    }
                }
            }));
        });

        // Sub-Boss and Biome Boss
        promises.push(_loadImage(midBossSrc).then((res) => {
            if (res.img && typeof bossSprites !== 'undefined') {
                bossSprites[`boss_b${id}_mid_0`] = (typeof preCompositeAdditive === 'function') ? preCompositeAdditive(res.img) : res.img;
            }
        }));
        promises.push(_loadImage(bossSrc).then((res) => {
            if (res.img && typeof bossSprites !== 'undefined') {
                bossSprites[`boss_b${id}_0`] = (typeof preCompositeAdditive === 'function') ? preCompositeAdditive(res.img) : res.img;
            }
        }));

        await Promise.all(promises);
        _bufferedBiomes.add(id);
        console.log(`[AssetPreloader] Biome ${id} Buffering Complete!`);
        return true;
    }

    // --- Canvas Renderer for Preloader Screen ---
    function draw(ctx, width, height) {
        ctx.save();

        // 1. Cyberpunk Dark Void Background
        ctx.fillStyle = '#03030c';
        ctx.fillRect(0, 0, width, height);

        // Tech grid backdrop
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }

        const cx = width / 2;
        const cy = height * 0.42;

        // 2. Holographic Circular Reactor Ring
        _hexScanAngle += 0.03;
        const outerRadius = 85;
        const innerRadius = 72;

        // Outer rotating ticks
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Progress Arc
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (_progress * Math.PI * 2);
        const grad = ctx.createLinearGradient(cx - outerRadius, cy, cx + outerRadius, cy);
        grad.addColorStop(0, '#00ffff');
        grad.addColorStop(0.5, '#00ff55');
        grad.addColorStop(1, '#ff0055');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(cx, cy, innerRadius, startAngle, endAngle);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Center Percentage
        const pctInt = Math.floor(_progress * 100);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px "Share Tech Mono", monospace, Courier';
        ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fillText(`${pctInt}%`, cx, cy - 6);
        ctx.shadowBlur = 0;

        ctx.font = '10px "Share Tech Mono", monospace, Courier';
        ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
        ctx.fillText('AVIONICS BUFFER', cx, cy + 18);

        // 3. Header & Title Banner
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 24px "Orbitron", monospace, sans-serif';
        ctx.fillText('DARIUS STAR : CYBER COELACANTH', cx, cy - 140);

        ctx.fillStyle = '#ff0055';
        ctx.font = '11px "Share Tech Mono", monospace';
        ctx.fillText('★ SYSTEM BOOTSTRAP & TACTICAL ASSET BUFFER ★', cx, cy - 116);

        // 4. Horizontal Linear Gauge
        const barWidth = Math.min(500, width * 0.7);
        const barHeight = 8;
        const barX = cx - barWidth / 2;
        const barY = cy + 110;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        const fillWidth = barWidth * _progress;
        ctx.fillStyle = grad;
        ctx.fillRect(barX, barY, fillWidth, barHeight);

        // 5. Telemetry Live Log Stream
        const logBoxY = barY + 30;
        ctx.fillStyle = 'rgba(4, 10, 24, 0.85)';
        ctx.fillRect(barX - 20, logBoxY, barWidth + 40, 110);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.strokeRect(barX - 20, logBoxY, barWidth + 40, 110);

        ctx.textAlign = 'left';
        ctx.font = '11px "Share Tech Mono", monospace';
        _telemetryLogs.forEach((log, idx) => {
            const alpha = 0.3 + (idx / _telemetryLogs.length) * 0.7;
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.fillText(log.text, barX - 10, logBoxY + 20 + idx * 14);
        });

        // 6. Status Text / Launch Action Prompt
        ctx.textAlign = 'center';
        if (_isComplete) {
            _pulseTimer += 0.05;
            const glow = (Math.sin(_pulseTimer * 4) + 1) * 0.5;
            ctx.fillStyle = `rgba(0, 255, 85, ${0.7 + glow * 0.3})`;
            ctx.font = 'bold 15px "Orbitron", monospace, sans-serif';
            ctx.shadowColor = 'rgba(0, 255, 85, 0.8)';
            ctx.shadowBlur = 12 * glow;
            ctx.fillText('▶ CLICK ANYWHERE OR PRESS SPACE TO LAUNCH ◀', cx, height - 35);
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = '#ffaa00';
            ctx.font = '12px "Share Tech Mono", monospace';
            ctx.fillText(_statusText, cx, height - 35);
        }

        // 7. CRT Raster Scanlines
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let y = 0; y < height; y += 3) {
            ctx.fillRect(0, y, width, 1);
        }

        ctx.restore();
    }

    function update(dt) {
        // Smooth visual progress easing towards raw progress
        if (_progress < _rawProgress) {
            _progress += (_rawProgress - _progress) * Math.min(1, dt * 8);
            if (Math.abs(_progress - _rawProgress) < 0.005) {
                _progress = _rawProgress;
            }
        }
    }

    function handleLaunch() {
        if (!_isComplete) return;
        _isLaunched = true;
        _progress = 1.0;
        console.log('[AssetPreloader] User Launched into Main Menu');

        if (typeof initAudio === 'function') initAudio();
        if (typeof audioCtx !== 'undefined' && audioCtx) {
            if (audioCtx.state === 'suspended') {
                try { audioCtx.resume(); } catch(e) {}
            }
        }
        if (typeof AudioManager !== 'undefined') {
            AudioManager.init().then(() => {
                AudioManager.preloadTrack('title_cinematic').then(() => {
                    AudioManager.play('title_cinematic', 0.5, true);
                }).catch(() => {});
            }).catch(() => {});
        }
        if (typeof startMenuMusic === 'function') startMenuMusic();

        const menuScreen = (typeof SCREENS !== 'undefined' && SCREENS.MENU) ? SCREENS.MENU : 'menu';
        if (typeof window !== 'undefined') {
            window.currentScreen = menuScreen;
            window.targetScreen = null;
        }
        if (typeof currentScreen !== 'undefined') {
            currentScreen = menuScreen;
        }
        if (typeof targetScreen !== 'undefined') {
            targetScreen = null;
        }
    }

    // ─── Fast Sector Loading Interstitial (GRO-4410) ───────────────────────────
    let _sectorLoading = false;
    let _sectorTimer = 0;
    const SECTOR_DURATION = 1.0;
    let _sectorBiome = 1;
    let _sectorLevel = 1;

    function startSectorInterstitial(biome, level) {
        _sectorLoading = true;
        _sectorTimer = 0;
        _sectorBiome = biome || 1;
        _sectorLevel = level || 1;
        bufferBiome(_sectorBiome);
        if (typeof setBiomeBackgrounds === 'function') {
            setBiomeBackgrounds(_sectorBiome, _sectorLevel);
        }
    }

    function updateSectorInterstitial(dt) {
        if (!_sectorLoading) return;
        _sectorTimer += dt;
        if (_sectorTimer >= SECTOR_DURATION) {
            _sectorLoading = false;
        }
    }

    function drawSectorInterstitial(ctx, width, height) {
        if (!_sectorLoading) return;

        const progress = Math.min(1, _sectorTimer / (SECTOR_DURATION * 0.75));
        const fadeAlpha = _sectorTimer > (SECTOR_DURATION * 0.75) 
            ? Math.max(0, 1 - (_sectorTimer - SECTOR_DURATION * 0.75) / (SECTOR_DURATION * 0.25)) 
            : 1.0;

        ctx.save();
        ctx.globalAlpha = fadeAlpha;

        // Dark tactical backdrop
        ctx.fillStyle = '#020208';
        ctx.fillRect(0, 0, width, height);

        // Tech grid backdrop
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }

        const cx = width / 2;
        const cy = height / 2;

        // Corner framing brackets
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        const bw = 240, bh = 70;
        // Top-left
        ctx.beginPath(); ctx.moveTo(cx - bw, cy - bh + 15); ctx.lineTo(cx - bw, cy - bh); ctx.lineTo(cx - bw + 15, cy - bh); ctx.stroke();
        // Top-right
        ctx.beginPath(); ctx.moveTo(cx + bw - 15, cy - bh); ctx.lineTo(cx + bw, cy - bh); ctx.lineTo(cx + bw, cy - bh + 15); ctx.stroke();
        // Bottom-left
        ctx.beginPath(); ctx.moveTo(cx - bw, cy + bh - 15); ctx.lineTo(cx - bw, cy + bh); ctx.lineTo(cx - bw + 15, cy + bh); ctx.stroke();
        // Bottom-right
        ctx.beginPath(); ctx.moveTo(cx + bw - 15, cy + bh); ctx.lineTo(cx + bw, cy + bh); ctx.lineTo(cx + bw, cy + bh - 15); ctx.stroke();

        // Biome Titles
        const BIOME_NAMES = {
            1: 'ABYSSAL TRENCH', 2: 'CORAL GRAVEYARD', 3: 'COELACANTH LAIR', 4: 'NEBULA DRIFT',
            5: 'ICE RINGS', 6: 'INFERNO CORE', 7: 'STORM BELT', 8: 'DERELICT FLEET',
            9: 'XENOMORPH HIVE', 10: 'CORE RIFT'
        };
        const bName = BIOME_NAMES[_sectorBiome] || `BIOME ${_sectorBiome}`;

        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
        ctx.font = 'bold 11px "Share Tech Mono", monospace';
        ctx.fillText(`⚡ INITIATING SECTOR ${_sectorBiome}.${_sectorLevel} ⚡`, cx, cy - 25);

        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 22px "Orbitron", monospace, sans-serif';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 12;
        ctx.fillText(bName, cx, cy + 5);
        ctx.shadowBlur = 0;

        // Progress bar
        const barW = 320;
        const barH = 5;
        const barX = cx - barW / 2;
        const barY = cy + 28;

        ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.fillRect(barX, barY, barW, barH);

        ctx.fillStyle = '#00ffaa';
        ctx.shadowColor = '#00ffaa';
        ctx.shadowBlur = 8;
        ctx.fillRect(barX, barY, barW * progress, barH);
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(0, 255, 170, 0.9)';
        ctx.font = '10px "Share Tech Mono", monospace';
        ctx.fillText('AVIONICS & SENSORS LOCKED — ENGAGING THRUSTERS', cx, cy + 48);

        // Scanlines
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let y = 0; y < height; y += 3) {
            ctx.fillRect(0, y, width, 1);
        }

        ctx.restore();
    }

    return {
        init: startBootPreload,
        bufferBiome,
        draw,
        update,
        handleLaunch,
        startSectorInterstitial,
        updateSectorInterstitial,
        drawSectorInterstitial,
        get isSectorLoading() { return _sectorLoading; },
        get isComplete() { return _isComplete; },
        get progress() { return _progress; }
    };
})();

if (typeof window !== 'undefined') {
    window.AssetPreloader = AssetPreloader;
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => AssetPreloader.init());
        } else {
            AssetPreloader.init();
        }
    }
}
