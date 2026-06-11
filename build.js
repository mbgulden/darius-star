/**
 * Darius Star esbuild build script.
 * 
 * PRE-CONVERSION (current): This script does nothing useful — the game
 * uses global <script> tags, not ES modules.  Run `npm run dev` and serve
 * files directly.
 *
 * POST-CONVERSION (after GRO-1064): Bundles js/main.js → dist/game.js
 * with all modules inlined.  Use `npm run build` for dev bundle,
 * `npm run build:prod` for minified production bundle.
 */

import { readFileSync, existsSync } from 'fs';

const isProduction = process.argv.includes('--minify');
const isWatch = process.argv.includes('--watch');

const entryPoint = 'js/main.js';

if (!existsSync(entryPoint)) {
  console.log('⚠️  js/main.js not found — ES module conversion (GRO-1064) not yet complete.');
  console.log('   Run `npm run dev` and serve files directly with:');
  console.log('   python3 -m http.server 8080');
  process.exit(0);
}

// Only load esbuild after confirming we're in the post-conversion state
const esbuild = await import('esbuild');

const opts = {
  entryPoints: [entryPoint],
  bundle: true,
  outfile: 'dist/game.js',
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  minify: isProduction,
  sourcemap: !isProduction,
  loader: { '.js': 'jsx' },  // tolerate JSX-like patterns in game code
  define: {
    'process.env.NODE_ENV': isProduction ? '"production"' : '"development"',
  },
};

// Game-specific: treat all js/ files as side-effect-free for tree-shaking
// (they are class/function definitions with no top-level side effects)

if (isWatch) {
  const ctx = await esbuild.context(opts);
  await ctx.watch();
  console.log('👀 Watching js/ for changes...');
} else {
  const result = await esbuild.build(opts);
  const bytes = readFileSync('dist/game.js').length;
  const kb = (bytes / 1024).toFixed(1);
  const mode = isProduction ? 'minified prod' : 'dev';
  console.log(`✅ Built dist/game.js (${kb} KB, ${mode})`);

  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:', result.warnings);
  }
}
