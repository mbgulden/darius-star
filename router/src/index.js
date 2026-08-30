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
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
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
    
    return fetch(request);
  }
}
