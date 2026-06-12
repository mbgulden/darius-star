import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.resolve(__dirname, '..');

// Read index.html to get scripts in order
const indexPath = path.join(baseDir, 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');

const scriptRegex = /<script\s+src=["'](js\/[^"']+)["']\s*><\/script>/g;
const scripts = [];
let match;
while ((match = scriptRegex.exec(indexContent)) !== null) {
  scripts.push(match[1]);
}

console.log(`=== Simulating Browser Load of ${scripts.length} Scripts ===\n`);

// Mock browser environment
const domMock = {
  getElementById: (id) => {
    // Return mock elements
    if (id === 'gameCanvas') {
      return {
        getContext: () => ({
          createImageData: () => ({ data: [] }),
          drawImage: () => {},
          fillRect: () => {},
          fillText: () => {},
          save: () => {},
          restore: () => {},
          translate: () => {},
          rotate: () => {},
          scale: () => {},
        }),
        style: {},
        width: 800,
        height: 450,
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 450 }),
        addEventListener: () => {},
        removeEventListener: () => {},
      };
    }
    return {
      addEventListener: () => {},
      removeEventListener: () => {},
      classList: { add: () => {}, remove: () => {}, toggle: () => {} },
      style: {},
      play: () => Promise.resolve(),
      pause: () => {},
      getContext: () => ({}),
      appendChild: () => {},
    };
  },
  createElement: (tag) => {
    return {
      getContext: () => ({
        fillRect: () => {},
        drawImage: () => {},
        createRadialGradient: () => ({ addColorStop: () => {} }),
      }),
      style: {},
      classList: { add: () => {}, remove: () => {}, toggle: () => {} },
      appendChild: () => {},
    };
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  documentElement: {
    requestFullscreen: () => Promise.resolve(),
  },
  head: {
    appendChild: () => {},
  },
};

const sandbox = {
  window: {},
  document: domMock,
  console: {
    log: (...args) => console.log(`[Browser Console.log]`, ...args),
    warn: (...args) => console.warn(`[Browser Console.warn]`, ...args),
    error: (...args) => console.error(`[Browser Console.error]`, ...args),
  },
  Image: class {
    constructor() {
      setTimeout(() => {
        if (this.onload) this.onload();
      }, 10);
    }
  },
  AudioContext: class {
    constructor() {
      this.state = 'suspended';
    }
    resume() { return Promise.resolve(); }
  },
  localStorage: {
    getItem: (key) => null,
    setItem: (key, val) => {},
    removeItem: (key) => {},
  },
  setTimeout: setTimeout,
  setInterval: setInterval,
  clearTimeout: clearTimeout,
  clearInterval: clearInterval,
  requestAnimationFrame: () => {},
  Math: Math,
  navigator: { userAgent: 'node-mock-browser' },
  screen: { width: 1024, height: 768 },
  addEventListener: () => {},
  removeEventListener: () => {},
};

sandbox.window = sandbox;
vm.createContext(sandbox);

let loadedCount = 0;
let failedCount = 0;

for (const script of scripts) {
  const filePath = path.join(baseDir, script);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${script}: file does not exist (404)`);
    failedCount++;
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  try {
    // Run the script in the context
    vm.runInContext(content, sandbox, { filename: script });
    console.log(`✅ Loaded ${script} successfully`);
    loadedCount++;
  } catch (err) {
    console.error(`❌ Error in ${script}:`, err.message);
    console.error(err.stack.split('\n').slice(0, 3).join('\n'));
    failedCount++;
  }
}

console.log(`\n=== Load Simulation Complete: ${loadedCount} loaded, ${failedCount} failed ===`);
if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
