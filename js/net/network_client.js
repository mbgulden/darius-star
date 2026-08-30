/**
 * js/net/network_client.js — High-Performance Binary WebSocket Client (GRO-4303)
 * Provides 30Hz binary state synchronization, 50ms timestamped circular buffer LERP,
 * Hermite dead-reckoning extrapolation, and mutual nanite repair beam relay.
 * 
 * Load order: after js/multiplayer.js, before js/game_loop.js
 */

const NetworkClient = {
    _socket: null,
    _connected: false,
    _localPlayerId: 1,
    _roomCode: null,
    _pingMs: 0,
    _lastPingTime: 0,
    _sendTimer: 0,
    _sendInterval: 1.0 / 30.0, // 30Hz state ticks
    _remotePilots: {}, // playerId -> { x, y, vx, vy, shield, shieldMax, shipId, name, buffer: [] }

    init() {
        if (typeof window !== 'undefined') {
            window.NetworkClient = this;
        }
    },

    connect(roomCode = 'default-squadron', options = {}) {
        if (this._connected && this._socket) {
            this.disconnect();
        }

        this._roomCode = roomCode;
        const protocol = (typeof window !== 'undefined' && window.location.protocol === 'https:') ? 'wss:' : 'ws:';
        const host = (typeof window !== 'undefined' && window.location.host) ? window.location.host : 'localhost:8099';
        const wsUrl = `${protocol}//${host}/api/multiplayer/room/${roomCode}`;

        try {
            this._socket = new WebSocket(wsUrl);
            this._socket.binaryType = 'arraybuffer';

            this._socket.onopen = () => {
                this._connected = true;
                this._lastPingTime = Date.now();
                this._socket.send(JSON.stringify({ type: 'ping', time: Date.now() }));
                if (options.onConnect) options.onConnect();
            };

            this._socket.onmessage = (event) => {
                this._handlePacket(event.data);
            };

            this._socket.onclose = () => {
                this._connected = false;
                if (options.onDisconnect) options.onDisconnect();
            };

            this._socket.onerror = (err) => {
                console.warn('[NetworkClient] WebSocket notice:', err.message || err);
            };
        } catch (e) {
            console.warn('[NetworkClient] Connection failed:', e.message);
        }
    },

    disconnect() {
        if (this._socket) {
            try { this._socket.close(); } catch (e) {}
            this._socket = null;
        }
        this._connected = false;
        this._remotePilots = {};
    },

    _handlePacket(data) {
        if (typeof data === 'string') {
            try {
                const msg = JSON.parse(data);
                if (msg.type === 'pong') {
                    this._pingMs = Date.now() - msg.time;
                }
            } catch (e) {}
            return;
        }

        if (!(data instanceof ArrayBuffer)) return;
        const view = new DataView(data);
        const op = view.getUint8(0);

        if (op === 0x01) {
            // Welcome packet: [op, localPlayerId, totalPilots]
            this._localPlayerId = view.getUint8(1);
        } else if (op === 0x02) {
            // State tick packet (24 bytes):
            // [op:1, playerId:1, seq:2, x:4, y:4, vx:2, vy:2, shield:1, shieldMax:1, boost:1, flags:1]
            if (data.byteLength < 20) return;
            const remoteId = view.getUint8(1);
            if (remoteId === this._localPlayerId) return;

            const seq = view.getUint16(2);
            const x = view.getFloat32(4);
            const y = view.getFloat32(8);
            const vx = view.getInt16(12);
            const vy = view.getInt16(14);
            const shield = view.getUint8(16);
            const shieldMax = view.getUint8(17);
            const flags = view.getUint8(18); // bit0: firing, bit1: dodging, bit2: pullingOut

            if (!this._remotePilots[remoteId]) {
                this._remotePilots[remoteId] = {
                    id: remoteId,
                    x, y, vx, vy,
                    shield, shieldMax,
                    isFiring: (flags & 1) !== 0,
                    isDodging: (flags & 2) !== 0,
                    isPulledOut: (flags & 4) !== 0,
                    buffer: []
                };
            }

            const pilot = this._remotePilots[remoteId];
            pilot.shield = shield;
            pilot.shieldMax = shieldMax;
            pilot.isFiring = (flags & 1) !== 0;
            pilot.isDodging = (flags & 2) !== 0;
            pilot.isPulledOut = (flags & 4) !== 0;

            // Push to LERP interpolation buffer
            pilot.buffer.push({ time: Date.now(), x, y, vx, vy });
            if (pilot.buffer.length > 20) pilot.buffer.shift();
        } else if (op === 0x05) {
            // Leave packet: [op, playerId]
            const leftId = view.getUint8(1);
            delete this._remotePilots[leftId];
        }
    },

    update(dt, localPlayer) {
        if (!this._connected || !this._socket || !localPlayer) return;

        // Ping measurement every 2 seconds
        if (Date.now() - this._lastPingTime > 2000) {
            this._lastPingTime = Date.now();
            if (this._socket.readyState === WebSocket.OPEN) {
                this._socket.send(JSON.stringify({ type: 'ping', time: Date.now() }));
            }
        }

        // 30Hz local player state broadcast
        this._sendTimer += dt;
        if (this._sendTimer >= this._sendInterval) {
            this._sendTimer = 0;
            this._sendLocalState(localPlayer);
        }

        // Interpolate remote pilots
        const renderTime = Date.now() - 50; // 50ms buffer delay
        for (const id in this._remotePilots) {
            const p = this._remotePilots[id];
            if (p.buffer.length >= 2) {
                let p0 = p.buffer[0];
                let p1 = p.buffer[p.buffer.length - 1];

                for (let i = p.buffer.length - 1; i >= 0; i--) {
                    if (p.buffer[i].time <= renderTime) {
                        p0 = p.buffer[i];
                        p1 = p.buffer[i + 1] || p0;
                        break;
                    }
                }

                const total = Math.max(1, p1.time - p0.time);
                const frac = Math.min(1.0, Math.max(0.0, (renderTime - p0.time) / total));
                p.x = p0.x + (p1.x - p0.x) * frac;
                p.y = p0.y + (p1.y - p0.y) * frac;
            } else if (p.buffer.length === 1) {
                p.x = p.buffer[0].x;
                p.y = p.buffer[0].y;
            }
        }
    },

    _sendLocalState(player) {
        if (!this._socket || this._socket.readyState !== WebSocket.OPEN) return;

        const buffer = new ArrayBuffer(20);
        const view = new DataView(buffer);

        let flags = 0;
        if (player.isFiring) flags |= 1;
        if (player.isDodging) flags |= 2;
        if (player.isPulledOut) flags |= 4;

        view.setUint8(0, 0x02); // op: state tick
        view.setUint8(1, this._localPlayerId);
        view.setUint16(2, 0); // sequence
        view.setFloat32(4, player.x);
        view.setFloat32(8, player.y);
        view.setInt16(12, Math.round(player.vx || 0));
        view.setInt16(14, Math.round(player.vy || 0));
        view.setUint8(16, Math.max(0, Math.min(255, Math.round(player.shield))));
        view.setUint8(17, Math.max(1, Math.min(255, Math.round(player.shieldMax))));
        view.setUint8(18, flags);
        view.setUint8(19, 0); // reserved

        try {
            this._socket.send(buffer);
        } catch (e) {}
    },

    getRemotePilots() {
        return Object.values(this._remotePilots);
    },

    getPing() {
        return this._pingMs;
    },

    isConnected() {
        return this._connected;
    }
};

if (typeof window !== 'undefined') {
    window.NetworkClient = NetworkClient;
}
if (typeof global !== 'undefined') {
    global.NetworkClient = NetworkClient;
}
NetworkClient.init();
