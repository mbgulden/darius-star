// multiplayer.js — FULL IMPLEMENTATION (Ned, GRO-1073)
// Local couch-coop drop-in/drop-out system. 1-4 players.
// Join: Enter (P2), 3 (P3), 4 (P4). Leave: Esc to flag pull-out.
// Integrates with game_loop.js remotePlayers and player.js pull-out mechanics.

window.Multiplayer = {
    count: 1,
    maxPlayers: 4,
    players: [
        { id: 1, alive: true, isHost: true, ship: 'interceptor', x: 80, y: 300, shield: 100, _wasPulledOut: false }
    ],

    // Internal queues
    _joinQueue: [],
    _leaveQueue: [],

    // ── Lifecycle ──────────────────────────────────────

    init() {
        this.count = 1;
        this.players = [
            { id: 1, alive: true, isHost: true, ship: 'interceptor', x: 80, y: 300, shield: 100, _wasPulledOut: false }
        ];
        this._joinQueue = [];
        this._leaveQueue = [];
    },

    /**
     * Per-frame update. Processes queued joins/leaves and syncs counts.
     */
    update(dt) {
        // Count alive players (game_loop.js syncs shield/x/y back into this array)
        const alive = this.players.filter(p => p.alive);
        this.count = Math.max(1, alive.length);
    },

    // ── Join System ────────────────────────────────────

    /**
     * Queue a player join request.
     */
    requestJoin(shipType) {
        if (this.count >= this.maxPlayers) return false;

        // Find next available slot
        const usedIds = new Set(this.players.map(p => p.id));
        let nextId = 2;
        while (usedIds.has(nextId) && nextId <= this.maxPlayers) nextId++;
        if (nextId > this.maxPlayers) return false;

        this._joinQueue.push({ id: nextId, ship: shipType || 'interceptor' });
        return true;
    },

    /**
     * Process all queued join requests.
     * Returns array of newly joined player objects.
     */
    processJoins(biomeLevel) {
        const joined = [];
        while (this._joinQueue.length > 0 && this.count < this.maxPlayers) {
            const req = this._joinQueue.shift();
            const playerObj = {
                id: req.id,
                alive: true,
                isHost: false,
                ship: req.ship,
                x: 80 + req.id * 40,
                y: 180 + req.id * 30,
                shield: 100,
                _wasPulledOut: false
            };
            this.players.push(playerObj);
            this.count = this.players.filter(p => p.alive).length;
            joined.push(playerObj);
        }
        return joined;
    },

    // ── Leave / Pull-out System ────────────────────────

    /**
     * Queue a player leave request.
     */
    requestLeave(playerId) {
        if (playerId === 1) return false; // Host cannot leave
        const player = this.players.find(p => p.id === playerId);
        if (!player || !player.alive) return false;

        this._leaveQueue.push(playerId);
        return true;
    },

    /**
     * Process all queued leave requests.
     * Returns a banter string for the floating text display, or null.
     */
    processLeaves() {
        let banterLine = null;
        while (this._leaveQueue.length > 0) {
            const pid = this._leaveQueue.shift();
            const idx = this.players.findIndex(p => p.id === pid);
            if (idx === -1) continue;

            const player = this.players[idx];
            const shipName = player.ship || 'fighter';
            player.alive = false;

            // Remove from active array
            this.players.splice(idx, 1);
            this.count = this.players.filter(p => p.alive).length;

            // Build banter message
            const names = { 2: 'Wing-2', 3: 'Wing-3', 4: 'Wing-4' };
            const label = names[pid] || `Player ${pid}`;
            banterLine = `${label} (${shipName}) — emergency retreat!`;
        }
        return banterLine;
    },

    /**
     * Handle player pull-out (shields depleted, failed to repair).
     * Called from player.js when a player's ship is destroyed.
     */
    onPlayerPullOut(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            player.alive = false;
            player._wasPulledOut = true;
            this.count = this.players.filter(p => p.alive).length;
        }
    },

    // ── Queries ────────────────────────────────────────

    getAliveCount() {
        return this.players.filter(p => p.alive).length;
    },

    getPlayer(playerId) {
        return this.players.find(p => p.id === playerId) || null;
    },

    isHostAlive() {
        const host = this.players.find(p => p.isHost);
        return host ? host.alive : false;
    }
};

console.log('[OK] multiplayer.js loaded — 1-4 player couch-coop, drop-in/drop-out');
