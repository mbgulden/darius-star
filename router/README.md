# Darius Star Cloudflare Worker Router

This directory contains the Cloudflare Worker reverse proxy configuration for `play.whatanadventure.games/darius-star`.

## Routes
- `play.whatanadventure.games/darius-star*` → Proxies to `https://darius-star.pages.dev`
- `play.whatanadventure.games/staging/darius-star*` → Proxies to `https://staging.darius-star.pages.dev`

## Deployment
```bash
npx wrangler deploy
```
