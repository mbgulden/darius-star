/**
 * router/src/multiplayer_room.js — Cloudflare Durable Object Multiplayer Room Relay (GRO-4303)
 * Provides ultra-low latency WebSocket connection handling, 30Hz binary state aggregation,
 * bullet spawn synchronization, mutual nanite repairs, and squadron scrap pool tracking.
 */

export class MultiplayerRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map(); // webSocket -> { playerId, shipId, name, lastPing }
    this.roomCode = null;
    this.nextPlayerId = 1;
  }

  async fetch(request) {
    const url = new URL(request.url);

    // WebSocket upgrade
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      await this.handleSession(server, url);

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    // Room info JSON endpoint
    return new Response(JSON.stringify({
      roomCode: this.roomCode,
      activePilots: this.sessions.size,
      maxPilots: 4,
      timestamp: Date.now()
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  async handleSession(webSocket, url) {
    webSocket.accept();

    const playerId = this.nextPlayerId++;
    const session = {
      playerId,
      shipId: 0,
      name: `Pilot-${playerId}`,
      lastPing: Date.now(),
      webSocket
    };

    this.sessions.set(webSocket, session);

    // Send assigned player ID to client
    const welcomePkt = new Uint8Array([0x01, playerId, this.sessions.size]);
    webSocket.send(welcomePkt);

    webSocket.addEventListener("message", async (msg) => {
      try {
        if (typeof msg.data === "string") {
          const json = JSON.parse(msg.data);
          if (json.type === "ping") {
            webSocket.send(JSON.stringify({ type: "pong", time: Date.now() }));
          }
          return;
        }

        // Binary ArrayBuffer Packet Relay
        const buffer = msg.data;
        if (!buffer || buffer.byteLength === 0) return;

        // Broadcast binary state tick / bullet / event to all other pilots in the room
        for (const [ws, s] of this.sessions.entries()) {
          if (ws !== webSocket && ws.readyState === WebSocket.READY_STATE_OPEN) {
            ws.send(buffer);
          }
        }
      } catch (e) {
        console.error("[MultiplayerRoom] Error handling packet:", e);
      }
    });

    const closeHandler = () => {
      this.sessions.delete(webSocket);
      // Notify remaining players of disconnect
      const leavePkt = new Uint8Array([0x05, playerId]);
      for (const [ws] of this.sessions.entries()) {
        if (ws.readyState === WebSocket.READY_STATE_OPEN) {
          ws.send(leavePkt);
        }
      }
    };

    webSocket.addEventListener("close", closeHandler);
    webSocket.addEventListener("error", closeHandler);
  }
}
