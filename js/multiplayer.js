// multiplayer.js — 1-4 player drop-in and drop-out state manager
// Exposes Multiplayer as a browser global consumed by game_loop.js and Player.

const Multiplayer = {
    count: 1,
    maxPlayers: 4,
    players: [],
    joinQueue: [],
    leaveQueue: [],
    events: [],
    lastJoinEvents: [],
    lastLeaveEvents: [],
    defaultShip: "interceptor",
    joinCooldown: 0,

    init() {
        this.count = 1;
        this.players = [this.createPlayerMeta(1, this.defaultShip, true, 80, 300)];
        this.joinQueue = [];
        this.leaveQueue = [];
        this.events = [];
        this.lastJoinEvents = [];
        this.lastLeaveEvents = [];
        this.joinCooldown = 0;

        try {
            if (typeof localStorage !== 'undefined') {
                const storedSelection = localStorage.getItem('dariusStar_shipSelection');
                if (storedSelection) {
                    const parsed = JSON.parse(storedSelection);
                    // Update P1's ship if configured in shipSelection
                    if (parsed.p1 && parsed.p1.shipId) {
                        this.players[0].ship = this.normalizeShip(parsed.p1.shipId);
                    }
                    // If Player 2 is active on the selection screen, add Player 2
                    if (parsed.p2 && parsed.p2.active === true) {
                        const p2Ship = parsed.p2.shipId || this.defaultShip;
                        const spawn = this.getSpawnPoint(2);
                        const p2Meta = this.createPlayerMeta(2, p2Ship, false, spawn.x, spawn.y);
                        this.players.push(p2Meta);
                        this.count = this.getActivePlayers().length;
                    }
                }
            }
        } catch (e) {
            console.error("Failed to load P2 initialization ship selection:", e);
        }
    },

    createPlayerMeta(id, shipType, isHost = false, x = null, y = null) {
        const slot = Number(id) || 1;
        const spawn = this.getSpawnPoint(slot);
        return {
            id: slot,
            alive: true,
            isHost: !!isHost,
            ship: this.normalizeShip(shipType),
            x: Number.isFinite(x) ? x : spawn.x,
            y: Number.isFinite(y) ? y : spawn.y,
            shield: 100,
            shieldMax: 100,
            score: 0,
            scrap: 0,
            biomeJoined: 1,
            joinedAt: Date.now(),
            lastSeen: Date.now(),
            status: isHost ? "host" : "active",
            _wasPulledOut: false
        };
    },

    normalizeShip(shipType) {
        if (typeof shipType !== "string" || !shipType.trim()) return this.defaultShip;
        return shipType.trim();
    },

    getSpawnPoint(id) {
        const points = {
            1: { x: 80, y: 300 },
            2: { x: 120, y: 200 },
            3: { x: 140, y: 240 },
            4: { x: 160, y: 280 }
        };
        return points[id] || { x: 80 + (id - 1) * 40, y: 220 + (id - 2) * 40 };
    },

    getActivePlayers() {
        return this.players.filter(player => player.alive && player.status !== "leaving");
    },

    getPlayer(playerId) {
        return this.players.find(player => player.id === Number(playerId)) || null;
    },

    getNextAvailableSlot(preferredId = null) {
        const reserved = new Set([
            ...this.players.map(player => player.id),
            ...this.joinQueue.map(request => request.id)
        ]);
        if (preferredId) {
            const slot = Number(preferredId);
            if (slot >= 2 && slot <= this.maxPlayers && !reserved.has(slot)) return slot;
        }
        for (let slot = 2; slot <= this.maxPlayers; slot++) {
            if (!reserved.has(slot)) return slot;
        }
        return null;
    },

    update(dt) {
        const elapsed = Number(dt) || 0;
        if (this.joinCooldown > 0) this.joinCooldown = Math.max(0, this.joinCooldown - elapsed);
        this.count = this.getActivePlayers().length;
        const now = Date.now();
        for (const player of this.players) {
            if (player.alive) player.lastSeen = now;
            if (player.shield <= 0 && !player._wasPulledOut) {
                this.onPlayerPullOut(player.id);
            }
        }
        
        // Gamepad polling loop (Goal 1)
        if (typeof keys !== 'undefined') {
            const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
            const gamepadPrefixes = ['Gamepad1', 'Gamepad2'];
            for (let i = 0; i < 2; i++) {
                const prefix = gamepadPrefixes[i];
                const gp = gamepads[i];
                const gpKeys = [
                    prefix + 'U', prefix + 'D', prefix + 'L', prefix + 'R',
                    prefix + 'A', prefix + 'B', prefix + 'X', prefix + 'Y',
                    prefix + 'LB', prefix + 'RB'
                ];
                if (!gp || !gp.connected) {
                    for (const key of gpKeys) {
                        keys[key] = false;
                    }
                    continue;
                }
                const btnPressed = (index) => {
                    const btn = gp.buttons[index];
                    return btn && (typeof btn === 'object' ? btn.pressed : btn === 1.0);
                };
                const leftStickY = gp.axes && gp.axes[1] !== undefined ? gp.axes[1] : 0;
                keys[prefix + 'U'] = btnPressed(12) || leftStickY < -0.5;
                keys[prefix + 'D'] = btnPressed(13) || leftStickY > 0.5;
                const leftStickX = gp.axes && gp.axes[0] !== undefined ? gp.axes[0] : 0;
                keys[prefix + 'L'] = btnPressed(14) || leftStickX < -0.5;
                keys[prefix + 'R'] = btnPressed(15) || leftStickX > 0.5;
                keys[prefix + 'A'] = btnPressed(0);
                keys[prefix + 'B'] = btnPressed(1);
                keys[prefix + 'X'] = btnPressed(2);
                keys[prefix + 'Y'] = btnPressed(3);
                keys[prefix + 'LB'] = btnPressed(4);
                keys[prefix + 'RB'] = btnPressed(5);
            }
        }
    },

    onPlayerPullOut(playerId) {
        const player = this.getPlayer(playerId);
        if (!player) return null;

        player.alive = false;
        player.status = player.isHost ? "host_pulled_out" : "pulled_out";
        player._wasPulledOut = true;
        this.count = this.getActivePlayers().length;

        const line = player.isHost
            ? "P1 is down — squad integrity critical."
            : `P${player.id} pulled out. ${this.count} pilot${this.count === 1 ? "" : "s"} remain.`;
        this.events.push({ type: "pullout", playerId: player.id, line, at: Date.now() });
        return line;
    },

    requestJoin(shipType = this.defaultShip, preferredPlayerId = null) {
        if (this.joinCooldown > 0) return false;
        if (this.getActivePlayers().length + this.joinQueue.length >= this.maxPlayers) return false;

        const slot = this.getNextAvailableSlot(preferredPlayerId);
        if (!slot) return false;

        const request = {
            id: slot,
            ship: this.normalizeShip(shipType),
            requestedAt: Date.now(),
            status: "queued"
        };
        this.joinQueue.push(request);
        this.joinCooldown = 0.25;
        return request;
    },

    processJoins(biomeLevel = 1) {
        this.lastJoinEvents = [];
        while (this.joinQueue.length && this.getActivePlayers().length < this.maxPlayers) {
            const request = this.joinQueue.shift();
            if (this.getPlayer(request.id)) continue;

            const spawn = this.getSpawnPoint(request.id);
            const player = this.createPlayerMeta(request.id, request.ship, false, spawn.x, spawn.y);
            player.biomeJoined = Number(biomeLevel) || 1;
            this.players.push(player);
            this.count = this.getActivePlayers().length;

            const line = `P${player.id} joined in the ${this.getBiomeName(player.biomeJoined)} — ${this.count} pilots active.`;
            const event = { type: "join", playerId: player.id, ship: player.ship, biomeLevel: player.biomeJoined, line, at: Date.now() };
            this.lastJoinEvents.push(event);
            this.events.push(event);
        }
        return this.lastJoinEvents.slice();
    },

    requestLeave(playerId) {
        const id = Number(playerId);
        const player = this.getPlayer(id);
        if (!player || player.isHost) return false;
        if (!this.leaveQueue.includes(id)) this.leaveQueue.push(id);
        player.status = "leaving";
        return true;
    },

    processLeaves() {
        this.lastLeaveEvents = [];
        while (this.leaveQueue.length) {
            const id = this.leaveQueue.shift();
            const index = this.players.findIndex(player => player.id === id && !player.isHost);
            if (index === -1) continue;

            const player = this.players[index];
            this.players.splice(index, 1);
            this.count = this.getActivePlayers().length;
            const line = `P${player.id} left formation. ${this.count} pilot${this.count === 1 ? "" : "s"} remain.`;
            const event = { type: "leave", playerId: player.id, ship: player.ship, line, at: Date.now() };
            this.lastLeaveEvents.push(event);
            this.events.push(event);
        }
        return this.lastLeaveEvents.map(event => event.line).join(" / ");
    },

    updatePlayerState(playerId, state = {}) {
        const player = this.getPlayer(playerId);
        if (!player) return false;
        const allowed = ["x", "y", "shield", "shieldMax", "score", "scrap", "alive", "ship", "status", "_wasPulledOut"];
        for (const key of allowed) {
            if (Object.prototype.hasOwnProperty.call(state, key)) player[key] = state[key];
        }
        player.lastSeen = Date.now();
        this.count = this.getActivePlayers().length;
        return true;
    },

    getBiomeName(biomeLevel) {
        const names = {
            1: "Abyssal Trench",
            2: "Coral Graveyard",
            3: "Coelacanth Lair",
            4: "Nebula Drift",
            5: "Ice Ring",
            6: "Fire Nebula",
            7: "Storm Belt",
            8: "Derelict Fleet",
            9: "Xenomorph Hive",
            10: "Core Rift"
        };
        return names[Number(biomeLevel)] || `Biome ${biomeLevel}`;
    },

    serialize() {
        return {
            count: this.count,
            maxPlayers: this.maxPlayers,
            players: this.players.map(player => ({ ...player })),
            events: this.events.slice(-25)
        };
    }
};

Multiplayer.init();
window.Multiplayer = Multiplayer;
console.log("[Darius Star] multiplayer.js loaded — 1-4 player drop-in and drop-out enabled");
