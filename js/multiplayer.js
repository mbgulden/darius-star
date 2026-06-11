// multiplayer.js — PLACEHOLDER (Jules building full implementation: GRO-1073)
// Provides Multiplayer global with stub — game runs single-player until real module ships.

window.Multiplayer = {
    count: 1,
    maxPlayers: 4,
    players: [{ id: 1, alive: true, isHost: true, ship: 'interceptor', x: 80, y: 300, shield: 100, _wasPulledOut: false }],
    init() {
        this.count = 1;
        this.players = [{ id: 1, alive: true, isHost: true, ship: 'interceptor', x: 80, y: 300, shield: 100, _wasPulledOut: false }];
    },
    update(dt) { /* no-op stub */ },
    onPlayerPullOut(playerId) { /* no-op stub */ },
    requestJoin(shipType) { return false; },
    processJoins(biomeLevel) { /* no-op stub */ },
    requestLeave(playerId) { /* no-op stub */ },
    processLeaves() { /* no-op stub */ }
};
console.log('[PLACEHOLDER] multiplayer.js loaded — full implementation pending Jules GRO-1073');
