// level_manager.js — Wave system, formation spawning, difficulty scaling
// Built by Ned (GRO-1140) from Jules' docs/enemy-wave-designer.md
// Updated GRO-938: Campaign Wave Schema integration (loads from WAVE_CAMPAIGN if present)
// Loaded between wave_campaign.js / biome_data.js and game_loop.js

// --- Level Manager ---
// Global singleton: LevelManager
// Called by game_loop.js: setBiomeAndLevel(), update(), currentLevelConfig

const LevelManager = {
    // Current state
    initialized: false,
    biome: 1,
    level: 1,
    wave: 1,
    waveActive: false,
    waveTimer: 0,
    spawnQueue: [],
    spawnDelay: 0,
    enemiesSpawnedThisWave: 0,
    totalEnemiesSpawned: 0,
    lastSpawnTime: 0,

    // Current level config (read by game_loop.js for boss triggers)
    currentLevelConfig: null,

    // Wave specs per level configuration
    // Each level has: waves (number), midBoss, biomeBoss, bossTrigger
    _levelSpecs: {},

    // Campaign schema reference (GRO-938)
    // If WAVE_CAMPAIGN is loaded, LevelManager reads from it for bossHP, enemy pools,
    // level config, and wave validation. Falls back to BIOME_DATA when absent.
    _campaign: null,
    _campaignAvailable: false,

    // Enemy type pools per biome
    // Maps to the type strings that Enemy() constructor recognizes
    _biomeEnemies: BIOME_DATA.enemies,

    _biomeNames: BIOME_DATA.names,

    _bossHP: BIOME_DATA.bossHP,

    get currentBiome() {
        return this.biome;
    },

    get currentLevel() {
        return this.level;
    },

    init() {
        this._detectCampaign();
        this.initialized = true;
        if (!this.currentLevelConfig) {
            this.setBiomeAndLevel(this.biome, this.level);
        }
    },

    // --- Campaign schema detection (GRO-938) ---
    _detectCampaign() {
        if (typeof WAVE_CAMPAIGN !== 'undefined' && WAVE_CAMPAIGN) {
            this._campaign = WAVE_CAMPAIGN;
            this._campaignAvailable = true;
            // Override bossHP from campaign if available (still fall back to BIOME_DATA)
            if (WAVE_CAMPAIGN.biome1 && WAVE_CAMPAIGN.biome1.bossHP) {
                const campaignBossHP = {};
                for (let b = 1; b <= 10; b++) {
                    const bkey = 'biome' + b;
                    if (WAVE_CAMPAIGN[bkey] && WAVE_CAMPAIGN[bkey].bossHP) {
                        campaignBossHP[b] = WAVE_CAMPAIGN[bkey].bossHP;
                    }
                }
                if (Object.keys(campaignBossHP).length === 10) {
                    this._bossHP = campaignBossHP;
                }
            }
            // Override enemy pools from campaign
            if (WAVE_CAMPAIGN.biome1 && WAVE_CAMPAIGN.biome1.enemyPool) {
                const campaignEnemies = {};
                for (let b = 1; b <= 10; b++) {
                    const bkey = 'biome' + b;
                    if (WAVE_CAMPAIGN[bkey] && WAVE_CAMPAIGN[bkey].enemyPool) {
                        campaignEnemies[b] = WAVE_CAMPAIGN[bkey].enemyPool;
                    }
                }
                if (Object.keys(campaignEnemies).length === 10) {
                    this._biomeEnemies = campaignEnemies;
                }
            }
            // Override biome names
            if (WAVE_CAMPAIGN.biome1 && WAVE_CAMPAIGN.biome1.name) {
                const campaignNames = {};
                for (let b = 1; b <= 10; b++) {
                    const bkey = 'biome' + b;
                    if (WAVE_CAMPAIGN[bkey] && WAVE_CAMPAIGN[bkey].name) {
                        campaignNames[b] = WAVE_CAMPAIGN[bkey].name;
                    }
                }
                if (Object.keys(campaignNames).length === 10) {
                    this._biomeNames = campaignNames;
                }
            }
        }
    },

    // --- Initialization ---
    setBiomeAndLevel(biome, level) {
        this.biome = Math.max(1, Math.min(10, biome));
        this.level = Math.max(1, Math.min(10, level));
        this.wave = 1;
        this.waveActive = true;
        this.waveTimer = 1.5; // Initial delay before first wave
        this.spawnQueue = [];
        this.spawnDelay = 0;
        this.enemiesSpawnedThisWave = 0;
        this.totalEnemiesSpawned = 0;
        this.lastSpawnTime = 0;

        this._refreshLevelConfig(false);

        // Set initial wave
        this._queueWave();
    },

    // --- Wave count per level (from wave designer §2) ---
    _wavesForLevel(level) {
        if (level === 5) return 4;  // 4 waves + mid-boss
        if (level === 10) return 9; // 9 waves + biome boss
        return 5; // Levels 1-4 & 6-9: 5 standard waves
    },

    // --- Type distribution percentages (from wave designer §2) ---
    _typeDistribution(level) {
        if (level <= 3) return { scout: 0.60, interceptor: 0.30, heavy: 0.0, alt: 0.10 };
        if (level <= 6) return { scout: 0.40, interceptor: 0.40, heavy: 0.10, alt: 0.10 };
        return { scout: 0.20, interceptor: 0.40, heavy: 0.30, alt: 0.10 };
    },

    // --- Biome multiplier MB = 1 + (B-1)*0.25 ---
    _biomeMultiplier() {
        return 1 + (this.biome - 1) * 0.25;
    },

    // --- Level multiplier ML = 1 + (L-1)*0.10 ---
    _levelMultiplier() {
        return 1 + (this.level - 1) * 0.10;
    },

    // --- Enemy count per wave (from wave designer §2) ---
    _waveEnemyCount() {
        const baseWaveSize = 4;
        const playerCount = (typeof Multiplayer !== 'undefined' && Multiplayer.count)
            ? Multiplayer.count : 1;
        return Math.floor(baseWaveSize + (this.level * 1.5) + (playerCount * 2));
    },

    // --- Multiplayer HP multiplier (from wave designer §5) ---
    _multiplayerHPMultiplier() {
        const p = (typeof Multiplayer !== 'undefined' && Multiplayer.count)
            ? Multiplayer.count : 1;
        const table = { 1: 1.0, 2: 1.6, 3: 2.2, 4: 3.0 };
        return table[p] || 1.0;
    },

    // --- Multiplayer count multiplier ---
    _multiplayerCountMultiplier() {
        const p = (typeof Multiplayer !== 'undefined' && Multiplayer.count)
            ? Multiplayer.count : 1;
        const table = { 1: 1.0, 2: 1.4, 3: 1.8, 4: 2.2 };
        return table[p] || 1.0;
    },

    // --- Queue a wave of enemies ---
    _queueWave() {
        this.enemiesSpawnedThisWave = 0;
        this.spawnQueue = [];
        this.spawnDelay = 0;

        const count = Math.floor(this._waveEnemyCount() * this._multiplayerCountMultiplier());
        const dist = this._typeDistribution(this.level);
        const pool = this.currentLevelConfig.enemyPool;
        const seed = (typeof runSeed === 'number' ? runSeed : 1) * 13 + this.biome * 100 + this.level * 10 + this.wave;
        const rng = (typeof mulberry32 === 'function') ? mulberry32(seed) : Math.random;

        // Build enemy type list for this wave
        const enemyTypes = [];
        for (let i = 0; i < count; i++) {
            const roll = typeof rng === 'function' ? rng() : Math.random();
            if (roll < dist.scout) {
                enemyTypes.push(pool.scout);
            } else if (roll < dist.scout + dist.interceptor) {
                enemyTypes.push(pool.interceptor);
            } else if (roll < dist.scout + dist.interceptor + dist.heavy) {
                enemyTypes.push(pool.heavy);
            } else {
                enemyTypes.push(pool.alt);
            }
        }

        // Pick a formation based on enemy distribution and wave number
        const formation = this._pickFormation(enemyTypes, count);

        // Build spawn queue with formation offsets
        const spawnInterval = Math.max(0.12, 0.2 - (this.biome - 1) * 0.01); // decreases 5% per biome
        for (let i = 0; i < enemyTypes.length; i++) {
            const pos = this._formationPosition(formation, i, count);
            this.spawnQueue.push({
                type: enemyTypes[i],
                x: canvas.width + pos.x,
                y: pos.y,
                delay: i * spawnInterval
            });
        }

        this.spawnDelay = 0;
    },

    // --- Pick a formation based on wave composition ---
    _pickFormation(enemyTypes, count) {
        const heavyCount = enemyTypes.filter(t => t.includes('heavy') || t.includes('brute') ||
            t.includes('turret') || t.includes('golem') || t.includes('glacier') ||
            t.includes('thunderhead') || t.includes('giant') || t.includes('node') ||
            t.includes('battery')).length;

        // Wave 1: always V-formation (gentle start)
        if (this.wave === 1) return 'v';
        // Waves with heavies: prefer Wall
        if (heavyCount >= 2) return 'wall';
        // Even waves: Diamond
        if (this.wave % 2 === 0) return 'diamond';
        // Odd waves after wave 3: Pincer
        if (this.wave >= 3) return 'pincer';
        // Default: Staggered Column
        return 'column';
    },

    // --- Formation position for enemy index ---
    _formationPosition(formation, index, total) {
        const margin = 60;
        const playHeight = canvas.height - margin * 2;

        switch (formation) {
            case 'v':
                // Classic V: center-left, fanning out
                const vSpread = Math.min(total * 40, playHeight * 0.7);
                const vOffset = (index - (total - 1) / 2) * (vSpread / Math.max(total - 1, 1));
                return { x: 20 + index * 30, y: canvas.height / 2 + vOffset };

            case 'wall':
                // Staggered vertical line
                const wallSpacing = playHeight / Math.max(total, 1);
                return { x: 40 + (index % 2) * 30, y: margin + wallSpacing * (index + 0.5) };

            case 'diamond':
                // 4-unit diamond drifting left; for larger waves, split into diamond clusters
                const clusterSize = 4;
                const clusterIndex = Math.floor(index / clusterSize);
                const clusterPos = index % clusterSize;
                const diamondPositions = [
                    { x: 30, y: -30 },  // top
                    { x: 0, y: 0 },     // left
                    { x: 60, y: 0 },    // right
                    { x: 30, y: 30 }    // bottom
                ];
                const base = diamondPositions[clusterPos] || diamondPositions[0];
                return {
                    x: 60 + base.x + clusterIndex * 80,
                    y: canvas.height / 2 + base.y
                };

            case 'pincer':
                // Two groups: top-right and bottom-right
                const half = Math.ceil(total / 2);
                if (index < half) {
                    return { x: 80 + index * 25, y: margin + index * 25 };
                } else {
                    return { x: 80 + (index - half) * 25, y: canvas.height - margin - (index - half) * 25 };
                }

            case 'column':
            default:
                // Staggered: one every 0.5s horizontally at fixed Y
                const colY = margin + (index / total) * playHeight;
                return { x: 60 + index * 15, y: colY };
        }
    },

    // --- Main update called from game loop ---
    update(dt) {
        if (!this.waveActive || !this.currentLevelConfig) return;

        this.waveTimer += dt;

        // If boss level and waves are done, nothing more to spawn
        if ((this.level === 5 && this.wave > 4) || (this.level === 10 && this.wave > 9)) {
            return;
        }

        // Non-boss levels: waves 1-5
        const maxWaves = this._wavesForLevel(this.level);
        if (this.wave > maxWaves) return;

        // Process spawn queue
        if (this.spawnQueue.length > 0) {
            this.spawnDelay += dt;
            while (this.spawnQueue.length > 0 && this.spawnDelay >= this.spawnQueue[0].delay) {
                const entry = this.spawnQueue.shift();
                this._spawnEnemy(entry.type, entry.x, entry.y);
            }
        }

        // Check if current wave is complete (all enemies spawned + all dead/offscreen)
        const allSpawned = this.spawnQueue.length === 0;
        if (allSpawned) {
            const waveClear = enemies.length === 0 ||
                enemies.every(e => e.x < -100 || e.y < -100 || e.y > canvas.height + 100);

            if (waveClear && this.waveTimer > 2.5) {
                this.wave++;
                this.waveTimer = 0;

                // Check if we hit the boss trigger
                if ((this.level === 5 && this.wave > 4) || (this.level === 10 && this.wave > 9)) {
                    // Boss wave — signal to game_loop.js
                    this.currentLevelConfig.bossTrigger = true;
                    this.waveActive = false;
                } else if (this.wave <= maxWaves) {
                    // Queue next wave
                    this._queueWave();
                    // Wave interval (decreases 5% per biome from base 2.0s)
                    const interval = Math.max(1.0, 2.0 - (this.biome - 1) * 0.1);
                    this.waveTimer = -interval; // offset so first enemy appears after interval
                } else {
                    this.advanceLevel();
                }
            }
        }
    },

    // --- Spawn a single enemy ---
    _spawnEnemy(type, x, y) {
        // Apply difficulty scaling to enemy
        const enemy = new Enemy(type);
        enemy.x = x;
        enemy.y = y;

        // Override enemy stats with wave designer scaling
        const mb = this._biomeMultiplier();
        const ml = this._levelMultiplier();
        const mpHP = this._multiplayerHPMultiplier();

        // Scale HP: BaseHP × MB × ML × MP (from wave designer §3C)
        const baseHP = enemy.hp || 1;
        enemy.hp = Math.max(1, Math.ceil(baseHP * mb * ml * mpHP));
        enemy.maxHp = enemy.hp;

        // Scale speed: BaseSpeed × sqrt(MB × ML) — but clamped for playability
        const baseSpeed = enemy.speed || 150;
        enemy.speed = Math.round(baseSpeed * Math.sqrt(mb * ml));
        enemy.speed = Math.min(enemy.speed, 500); // cap at 500

        // Scale damage (stored for use by collision system)
        const baseDmg = (type.includes('heavy') || type.includes('brute') || type.includes('golem')) ? 35 : 15;
        enemy._waveDmg = Math.ceil(baseDmg * mb * ml);

        enemies.push(enemy);
        this.enemiesSpawnedThisWave++;
        this.totalEnemiesSpawned++;

        // GRO-866: Rising synth sweep on enemy spawn
        playSound('enemy_spawn', {enemyType: type});

        return enemy;
    },

    // --- Helper: get boss HP for current level ---
    getBossHP() {
        const hp = this._bossHP[this.biome];
        if (!hp) return 120;
        if (this.level === 5) return hp.midBoss;
        if (this.level === 10) return hp.biomeBoss;
        return hp.midBoss || 120;
    },

    // --- Advance to next level ---
    advanceLevel() {
        if (this.level >= 10) {
            // Advance biome
            if (this.biome >= 10) {
                // Game complete — final level
                this.waveActive = false;
                return;
            }
            this.biome++;
            this.level = 1;
        } else {
            this.level++;
        }
        this.wave = 1;
        this.waveActive = true;
        this.waveTimer = 2.0; // brief pause before next level
        this.spawnQueue = [];
        this.enemiesSpawnedThisWave = 0;

        this._refreshLevelConfig(false);

        this._queueWave();
    },

    _refreshLevelConfig(bossTrigger) {
        const wavesInLevel = this._wavesForLevel(this.level);
        this.currentLevelConfig = {
            biome: this.biome,
            level: this.level,
            totalWaves: wavesInLevel,
            midBoss: this.level === 5,
            biomeBoss: this.level === 10,
            bossTrigger: Boolean(bossTrigger),
            background: 'bg_' + this.biome,
            particleSettings: this._particleSettingsForBiome(this.biome),
            biomeName: this._biomeNames[this.biome] || 'Unknown',
            enemyPool: this._biomeEnemies[this.biome] || this._biomeEnemies[1]
        };
    },

    // Returns nested { primary, secondary?, tertiary? } structure consumed by renderer.js
    // Each sub-object has { type, rate } or { type, chance }. Types must match
    // the EnvironmentParticle constructor cases in renderer.js.
    _particleSettingsForBiome(biome) {
        const settings = {
            1: { // Abyssal Trench — Bioluminescent Drift
                primary:   { type: 'mote',       rate: 12 },
                secondary: { type: 'vent_smoke', chance: 0.35 }
            },
            2: { // Coral Graveyard — Rust Storm
                primary:   { type: 'rust_flake', rate: 10 },
                secondary: { type: 'neon_glow',  chance: 0.25 }
            },
            3: { // Coelacanth Lair — Tesla Arcs
                primary:   { type: 'tesla_bolt',  rate: 14 },
                secondary: { type: 'coolant_drip', chance: 0.30 }
            },
            4: { // Nebula Drift — Plasma Currents
                primary:   { type: 'plasma_ribbon', rate: 10 },
                secondary: { type: 'storm_flash',   chance: 0.20 }
            },
            5: { // Ice Ring — Diamond Dust
                primary:   { type: 'ice_crystal', rate: 12 },
                secondary: { type: 'prism_beam',  chance: 0.18 }
            },
            6: { // Fire Nebula — Ember Storm
                primary:   { type: 'ember',     rate: 13 },
                secondary: { type: 'ash_cloud', chance: 0.22 }
            },
            7: { // Storm Belt — Lightning Cage
                primary:   { type: 'lightning_strike', rate: 14 },
                secondary: { type: 'rain_drop',        rate: 8 },
                tertiary:  { type: 'static_band',      chance: 0.15 }
            },
            8: { // Derelict Fleet — Drifting Debris
                primary:   { type: 'debris',       rate: 9 },
                secondary: { type: 'beacon_flash', chance: 0.12 },
                tertiary:  { type: 'coolant_gas',  chance: 0.20 }
            },
            9: { // Xenomorph Hive — Organic Seepage
                primary:   { type: 'spore',     rate: 11 },
                secondary: { type: 'acid_drip', chance: 0.25 },
                tertiary:  { type: 'vein_pulse', chance: 0.30 }
            },
            10: { // Core Rift — Reality Tears
                primary:   { type: 'code_stream', rate: 15 },
                secondary: { type: 'rift_tear',   chance: 0.18 }
            }
        };
        return settings[biome] || settings[1];
    },

    // --- Reset to defaults ---
    reset() {
        this.setBiomeAndLevel(1, 1);
    }
};

// Export globally so game_loop.js can reference it
window.LevelManager = LevelManager;
