export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;
    
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
