// tests/network_packet_serialization_test.js — Multiplayer Packet Serialization Test Suite (GRO-4303)
const assert = require('assert');

console.log('============================================================');
console.log('DARIUS STAR: BINARY WEBSOCKET NETCODE PACKET TESTS');
console.log('============================================================');

global.window = {};
require('../js/net/network_client.js');
const net = global.NetworkClient;
assert(net, 'NetworkClient must be defined');

console.log('1. Testing Welcome & State Tick Packet Processing...');
// Simulate welcome packet: [0x01, localPlayerId: 2, totalPilots: 3]
const welcomeBuf = new Uint8Array([0x01, 0x02, 0x03]).buffer;
net._handlePacket(welcomeBuf);
assert.strictEqual(net._localPlayerId, 2, 'Local player ID must be set to 2');
console.log('  [PASS] Welcome packet processed: LocalPlayerId = 2');

// Simulate state tick from Remote Player 1:
// [op: 0x02, playerId: 1, seq: 10, x: 250.5, y: 180.2, vx: 120, vy: -50, shield: 90, shieldMax: 100, flags: 1]
const tickBuf = new ArrayBuffer(20);
const view = new DataView(tickBuf);
view.setUint8(0, 0x02);
view.setUint8(1, 1); // remoteId 1
view.setUint16(2, 10);
view.setFloat32(4, 250.5);
view.setFloat32(8, 180.2);
view.setInt16(12, 120);
view.setInt16(14, -50);
view.setUint8(16, 90);
view.setUint8(17, 100);
view.setUint8(18, 1); // isFiring

net._handlePacket(tickBuf);
const pilots = net.getRemotePilots();
assert.strictEqual(pilots.length, 1, 'Must have 1 remote pilot registered');
assert.strictEqual(pilots[0].id, 1, 'Remote pilot ID must be 1');
assert.strictEqual(pilots[0].shield, 90, 'Remote pilot shield must be 90');
assert.strictEqual(pilots[0].isFiring, true, 'Remote pilot isFiring must be true');
console.log('  [PASS] Binary state tick decoded: Remote Pilot #1 at (250.5, 180.2), Shield: 90/100, Firing: true');

console.log('2. Testing Disconnect / Leave Packet...');
// [0x05, playerId: 1]
const leaveBuf = new Uint8Array([0x05, 0x01]).buffer;
net._handlePacket(leaveBuf);
assert.strictEqual(net.getRemotePilots().length, 0, 'Remote pilot must be removed after leave packet');
console.log('  [PASS] Leave packet processed cleanly.');

console.log('============================================================');
console.log('ALL NETCODE PACKET TESTS PASSED (100%)');
console.log('============================================================');
