/**
 * Darius Star — Banter Engine (GRO-957 / GRO-1004 / GRO-4202)
 * Event-driven in-mission dialogue with 3-Tier Attempt-Aware Progressive Narrative.
 * Tier 1: First Reconnaissance & Mystery
 * Tier 2: Tactical Countermeasures & Adaptation (addressing prior wipe)
 * Tier 3: Tenacity, Mastery & Gritty Focus
 */

const SPEAKER_NAMES = {
    'D': 'Darius',
    'L': 'Lyra',
    'N': 'Naya',
    'T': 'Thorne',
    'C': 'Cross',
    'S': 'Selene',
    'A': 'Architect',
    'O': 'Ophion'
};

const BanterEngine = {
    _playerCount: 1,
    _playerCharacters: {},
    _playedLines: new Set(),
    _activeLine: null,
    _activeResponse: null,
    _displayTimer: 0,
    _lineDuration: 4.2,
    _levelAttempts: {}, // { 'b1_l1': 1, ... }
    
    // Banter database loaded from js/banter_db.js
    get _data() {
        if (typeof BanterDB !== 'undefined') {
            return BanterDB._data || BanterDB;
        }
        return null;
    },

    _scrapData: {
        scrap_collected: [
            {s:'D', l:"Another plate. The Nyxa appreciates it."},
            {s:'N', l:"Salvage logged. Every credit counts toward the next push."},
        ],
        scrap_milestone: [
            {s:'D', l:"That's a decent haul. Keep the momentum."},
            {s:'N', l:"Milestone hit. We are not broke yet."},
            {s:'N', l:"Energy-credits banked. Keep salvaging, Darius."},
        ],
        legendary_drop: [
            {s:'D', l:"Essence plate! Pre-war alloy. Worth more than a fleet destroyer."},
            {s:'N', l:"LEGENDARY drop! That piece alone would buy a week of station time."},
            {s:'N', l:"An essence fragment. Dreamer signature confirmed in the alloy."},
        ],
        upgrade_purchased: [
            {s:'N', l:"Upgrade installed. Should help with what is ahead."},
            {s:'D', l:"Better gear. The deep doesn't get easier."},
            {s:'T', l:"Good investment. That system will earn its keep."},
        ],
        upgrade_max_tier: [
            {s:'N', l:"MAX rank upgrade! That system is fully tuned now."},
            {s:'D', l:"Top of the line. Nothing in the trench can match this."},
            {s:'N', l:"Maximum calibration achieved. Upgrade branch complete."},
        ],
    },

    _joinBanter: {
        early: [
            {s:'D', l:"Welcome aboard. We've got a long dive ahead."},
            {s:'D', l:"Glad you made it. This trench doesn't explore itself."},
            {s:'N', l:"Another pilot. We could use the help down here."},
        ],
        mid: [
            {s:'D', l:"Just in time. The heavy fighting's about to start."},
            {s:'D', l:"Right on schedule. Things are heating up."},
            {s:'C', l:"Reinforcements. About time."},
        ],
        late: [
            {s:'D', l:"It's about time! Let's finish this."},
            {s:'D', l:"Welcome! We're at the final push. Every gun counts."},
            {s:'N', l:"Never too late to join the fight!"},
        ],
    },
    _leaveBanter: [
        {s:'D', l:"They'll be back. We keep going."},
        {s:'D', l:"We're still standing. That's what matters."},
        {s:'C', l:"One less gun. We adapt. We always do."},
        {s:'N', l:"They fought well. Now it's on us."},
    ],

    init(playerCount) {
        this._playerCount = playerCount || 1;
        this._playedLines.clear();
        this.clear();
        const chars = ['D', 'L', 'T', 'N'];
        this._playerCharacters = {};
        for (let i = 0; i < this._playerCount; i++) {
            this._playerCharacters[i + 1] = chars[i] || 'N';
        }
    },

    getSpeakerForPlayer(playerId) {
        return this._playerCharacters[playerId] || 'L';
    },

    getAttemptCount(biome = 1, level = 1) {
        if (typeof LevelManager !== 'undefined' && LevelManager.getAttemptCount) {
            return LevelManager.getAttemptCount(biome, level);
        }
        return this._levelAttempts[`b${biome}_l${level}`] || 1;
    },

    recordAttempt(biome = 1, level = 1) {
        const key = `b${biome}_l${level}`;
        this._levelAttempts[key] = (this._levelAttempts[key] || 0) + 1;
        return this._levelAttempts[key];
    },

    getLine(trigger, biome = 1, speaker = null, attemptCount = 1) {
        const db = this._data;
        if (!db || !db[biome] || !db[biome][trigger]) return null;
        
        const rawTriggerData = db[biome][trigger];
        let lines = [];

        // Check if data is structured as 3-tier object or flat array
        if (rawTriggerData && typeof rawTriggerData === 'object' && !Array.isArray(rawTriggerData)) {
            let tierKey = 'tier1';
            if (attemptCount === 2) tierKey = 'tier2';
            else if (attemptCount >= 3) tierKey = 'tier3';

            lines = rawTriggerData[tierKey] || [];
            if (!lines || lines.length === 0) {
                // Fallback to tier1 or any tier
                lines = rawTriggerData.tier1 || rawTriggerData.tier2 || rawTriggerData.tier3 || [];
            }
        } else if (Array.isArray(rawTriggerData)) {
            lines = rawTriggerData;
        }

        if (!lines || lines.length === 0) return null;

        // Filter by speaker if requested
        if (speaker) {
            const filtered = lines.filter(l => l.s === speaker);
            if (filtered.length > 0) lines = filtered;
        }

        // Anti-repetition check per tier
        const attemptTier = Math.min(Math.max(1, attemptCount), 3);
        let available = lines.filter(l => !this._playedLines.has(`${biome}_${trigger}_t${attemptTier}_${l.l}`));
        if (available.length === 0) {
            lines.forEach(l => this._playedLines.delete(`${biome}_${trigger}_t${attemptTier}_${l.l}`));
            available = lines;
        }

        const pick = available[Math.floor(Math.random() * available.length)];
        if (pick) {
            this._playedLines.add(`${biome}_${trigger}_t${attemptTier}_${pick.l}`);
        }
        return pick;
    },

    getJoinLine(biome = 1) {
        let phase = biome >= 7 ? 'late' : (biome >= 4 ? 'mid' : 'early');
        const lines = this._joinBanter[phase];
        return lines[Math.floor(Math.random() * lines.length)];
    },

    getLeaveLine() {
        return this._leaveBanter[Math.floor(Math.random() * this._leaveBanter.length)];
    },

    trigger(event, biome = 1, speaker = null, attemptCount = null) {
        const attempts = (attemptCount !== null && attemptCount !== undefined) 
            ? attemptCount 
            : this.getAttemptCount(biome, (typeof LevelManager !== 'undefined' ? LevelManager.level : 1));

        const line = this.getLine(event, biome, speaker, attempts);
        if (line) {
            this.clear();
            this._activeLine = line;
            this._displayTimer = this._lineDuration;

            // Trigger non-blocking Holographic Comms Banner HUD if DialogueSequence is available
            if (typeof DialogueSequence !== 'undefined' && typeof window !== 'undefined') {
                const speakerName = SPEAKER_NAMES[line.s] || line.s || 'SYSTEM';
                const sequenceLines = [{ speaker: speakerName, text: line.l }];
                
                if (line.r) {
                    const respSpeakerName = SPEAKER_NAMES[line.r.s] || line.r.s || 'SYSTEM';
                    sequenceLines.push({ speaker: respSpeakerName, text: line.r.l });
                }

                window.activeDialogue = new DialogueSequence(sequenceLines, null, false);
            }

            // Play voice line if VoicePlayback is available
            if (typeof window !== 'undefined' && window.VoicePlayback) {
                try {
                    window.VoicePlayback.play(biome, event, line.s, line);
                } catch(e) {}
            }
        }
        return line;
    },

    triggerDirect(line, duration = this._lineDuration) {
        if (!line) return null;
        this.clear();
        this._activeLine = line;
        this._displayTimer = duration;

        if (typeof DialogueSequence !== 'undefined' && typeof window !== 'undefined') {
            const speakerName = SPEAKER_NAMES[line.s] || line.s || 'SYSTEM';
            window.activeDialogue = new DialogueSequence([{ speaker: speakerName, text: line.l }], null, false);
        }
        return line;
    },

    update(dt) {
        if (this._displayTimer > 0) {
            this._displayTimer -= dt;
            if (this._displayTimer <= 0) {
                if (this._activeLine && this._activeLine.r && !this._activeResponse) {
                    this._activeResponse = this._activeLine.r;
                    this._displayTimer = this._lineDuration;
                } else {
                    this.clear();
                }
            }
        }
    },

    getActive() {
        return this._activeResponse || this._activeLine;
    },

    clear() {
        this._activeLine = null;
        this._activeResponse = null;
        this._displayTimer = 0;
    },

    triggerScrapEvent(trigger, line) {
        if (line) {
            return this.triggerDirect(line, 5.0);
        }
        const lines = this._scrapData[trigger];
        if (lines && lines.length > 0) {
            const pick = lines[Math.floor(Math.random() * lines.length)];
            return this.triggerDirect(pick, 4.0);
        }
        return null;
    },

    initScrapEvents() {
        if (typeof window === 'undefined' || !window.ScrapEvents) return;

        window.ScrapEvents.on('scrap:collected', () => {
            if (this.getActive()) return;
            this.triggerScrapEvent('scrap_collected');
        });

        window.ScrapEvents.on('scrap:milestone', () => {
            if (this.getActive()) return;
            this.triggerScrapEvent('scrap_milestone');
        });

        window.ScrapEvents.on('scrap:legendary', () => {
            this.triggerScrapEvent('legendary_drop');
        });

        window.ScrapEvents.on('upgrade:purchased', () => {
            if (this.getActive()) return;
            this.triggerScrapEvent('upgrade_purchased');
        });

        window.ScrapEvents.on('upgrade:max_tier', () => {
            this.triggerScrapEvent('upgrade_max_tier');
        });
    }
};

if (typeof window !== 'undefined') window.BanterEngine = BanterEngine;
if (typeof global !== 'undefined') global.BanterEngine = BanterEngine;
if (typeof module !== 'undefined' && module.exports) module.exports = BanterEngine;
