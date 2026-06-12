/**
 * Darius Star — Banter Engine (GRO-957 / GRO-1004)
 * Event-driven in-mission dialogue. PG-rated, 75% positive.
 * Supports Solo/Duo/4P. Event triggers: level_start, unique_enemy,
 * boss_entrance, player_death, player_respawn, low_health, 
 * wave_clear, level_end, pull_out.
 */

const BanterEngine = {
    _playerCount: 1,
    _playerCharacters: {},  // GRO-1039: player ID → speaker code
    _playedLines: new Set(),
    _activeLine: null,
    _activeResponse: null,
    _displayTimer: 0,
    _lineDuration: 4.0,
    // Banter database loaded from js/banter_db.js (GRO-1050)
    _data: BanterDB,

    // GRO-1054: Scrap-to-story dialogue — global banter for scrap/upgrade events.
    // Delivered via ScrapEvents listeners rather than the standard getLine/biome path.
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
        this._playerCount = playerCount;
        this._playedLines.clear();
        this.clear();
        // GRO-1039: Assign characters to players (P1=always Darius)
        const chars = ['D', 'L', 'T', 'N']; // Darius, Lyra, Thorne, Naya
        this._playerCharacters = {};
        for (let i = 0; i < playerCount; i++) {
            this._playerCharacters[i + 1] = chars[i] || 'N';
        }
    },

    // GRO-1039: Get speaker code for a player
    getSpeakerForPlayer(playerId) {
        return this._playerCharacters[playerId] || 'L';
    },

    getLine(trigger, biome, speaker = null) {
        const biomeData = this._data[biome];
        if (!biomeData || !biomeData[trigger]) return null;
        let lines = biomeData[trigger];
        
        // Filter by speaker if requested
        if (speaker) {
            lines = lines.filter(l => l.s === speaker);
            if (lines.length === 0) {
                // Fallback to all if no lines found for this speaker
                lines = biomeData[trigger];
            }
        }
        
        let available = lines.filter((_, i) => !this._playedLines.has(`${biome}_${trigger}_${biomeData[trigger].indexOf(lines[i])}`));
        if (available.length === 0) {
            // Reset played lines for this specific trigger and speaker combo in this biome
            lines.forEach(l => {
                const originalIdx = biomeData[trigger].indexOf(l);
                this._playedLines.delete(`${biome}_${trigger}_${originalIdx}`);
            });
            available = lines;
        }
        
        const idx = Math.floor(Math.random() * available.length);
        const originalIndex = biomeData[trigger].indexOf(available[idx]);
        this._playedLines.add(`${biome}_${trigger}_${originalIndex}`);
        return available[idx];
    },

    getJoinLine(biome) {
        let phase = biome >= 7 ? 'late' : (biome >= 4 ? 'mid' : 'early');
        const lines = this._joinBanter[phase];
        return lines[Math.floor(Math.random() * lines.length)];
    },

    getLeaveLine() { return this._leaveBanter[Math.floor(Math.random() * this._leaveBanter.length)]; },

    trigger(event, biome, speaker = null) {
        const line = this.getLine(event, biome, speaker);
        if (line) {
            this.clear();
            this._activeLine = line;
            this._displayTimer = this._lineDuration;
            // GRO-940: Play voice line if VoicePlayback is available
            if (window.VoicePlayback) {
                VoicePlayback.play(biome, event, line.s, line);
            }
        }
        return line;
    },

    triggerDirect(line, duration = this._lineDuration) {
        if (!line) return null;
        this.clear();
        this._activeLine = line;
        this._displayTimer = duration;
        return line;
    },

    update(dt) {
        if (this._displayTimer > 0) {
            this._displayTimer -= dt;
            if (this._displayTimer <= 0) {
                if (this._activeLine && this._activeLine.r && !this._activeResponse) {
                    // Show response
                    this._activeResponse = this._activeLine.r;
                    this._displayTimer = this._lineDuration;
                } else {
                    this.clear();
                }
            }
        }
    },

    getActive() { return this._activeResponse || this._activeLine; },
    clear() { this._activeLine = null; this._activeResponse = null; this._displayTimer = 0; },

    // GRO-1054: Trigger a scrap/upgrade event line from _scrapData.
    // Falls back to event-system banter (SCRAP_NARRATIVE_BEATS) if no specific data.
    triggerScrapEvent(trigger, line) {
        if (line) {
            // Direct line provided (from legacy SCRAP_NARRATIVE_BEATS)
            return this.triggerDirect(line, 5.0);
        }
        const lines = this._scrapData[trigger];
        if (lines && lines.length > 0) {
            const pick = lines[Math.floor(Math.random() * lines.length)];
            return this.triggerDirect(pick, 4.0);
        }
        return null;
    },

    /**
     * GRO-1054: Wire ScrapEvents into the banter system.
     * Call once after both modules are loaded (e.g. from game_loop.js init).
     */
    initScrapEvents() {
        if (!window.ScrapEvents) return;

        ScrapEvents.on('scrap:collected', () => {
            if (this.getActive()) return; // don't stomp active dialogue
            this.triggerScrapEvent('scrap_collected');
        });

        ScrapEvents.on('scrap:milestone', () => {
            if (this.getActive()) return;
            this.triggerScrapEvent('scrap_milestone');
        });

        ScrapEvents.on('scrap:legendary', () => {
            // Legendary drops are rare — override active dialogue if needed
            this.triggerScrapEvent('legendary_drop');
        });

        ScrapEvents.on('upgrade:purchased', () => {
            if (this.getActive()) return;
            this.triggerScrapEvent('upgrade_purchased');
        });

        ScrapEvents.on('upgrade:max_tier', () => {
            // Max tier upgrades are significant — override active dialogue
            this.triggerScrapEvent('upgrade_max_tier');
        });
    },
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BanterEngine;
}
// Attach to window for browser access (required by game_loop.js)
window.BanterEngine = BanterEngine;
