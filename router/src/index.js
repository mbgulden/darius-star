export { MultiplayerRoom } from "./multiplayer_room.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;
    
    // Health probe endpoint (GRO-4113)
    if (url.pathname === '/api/health' || url.pathname === '/darius-star/api/health') {
      return new Response(JSON.stringify({
        status: "ok",
        version: "1.0.0",
        service: "darius-star-edge-router",
        multiplayer: "enabled",
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Multiplayer WebSocket room endpoint (GRO-4303)
    if (url.pathname.startsWith('/api/multiplayer/room/') || url.pathname.startsWith('/darius-star/api/multiplayer/room/')) {
      const parts = url.pathname.split('/');
      const roomId = parts[parts.length - 1] || 'default-squadron';
      if (env && env.MULTIPLAYER_ROOMS) {
        const id = env.MULTIPLAYER_ROOMS.idFromName(roomId);
        const obj = env.MULTIPLAYER_ROOMS.get(id);
        return obj.fetch(request);
      }
    }

    // Telemetry beacon endpoint (GRO-4113)
    if (request.method === 'POST' && (url.pathname === '/api/telemetry' || url.pathname === '/darius-star/api/telemetry')) {
      return new Response(JSON.stringify({ received: true, timestamp: Date.now() }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Redirect /darius-star to /darius-star/
    if (url.pathname === '/darius-star') {
      return new Response(null, {
        status: 301,
        headers: {
          'Location': `https://${host}/darius-star/` + url.search
        }
      });
    }

    // Redirect /staging/darius-star to /staging/darius-star/
    if (url.pathname === '/staging/darius-star') {
      return new Response(null, {
        status: 301,
        headers: {
          'Location': `https://${host}/staging/darius-star/` + url.search
        }
      });
    }
    
    if (url.pathname.startsWith('/darius-star/')) {
      const targetPath = url.pathname.substring('/darius-star'.length) || '/';
      const targetUrl = new URL(targetPath + url.search, 'https://darius-star.pages.dev');
      return fetch(new Request(targetUrl, request));
    }

    if (url.pathname.startsWith('/staging/darius-star/')) {
      const targetPath = url.pathname.substring('/staging/darius-star'.length) || '/';
      const targetUrl = new URL(targetPath + url.search, 'https://staging.darius-star.pages.dev');
      return fetch(new Request(targetUrl, request));
    }

    // Direct proxy for assets/audio/js requested at host root
    if (url.pathname.startsWith('/assets/') || 
        url.pathname.startsWith('/audio/') || 
        url.pathname.startsWith('/js/') ||
        url.pathname.startsWith('/storyboards/')) {
      const targetUrl = new URL(url.pathname + url.search, 'https://darius-star.pages.dev');
      return fetch(new Request(targetUrl, request));
    }
    
    return fetch(request);
  }
};
