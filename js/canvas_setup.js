// js/canvas_setup.js — Canvas setup & DOM HUD references
// Extracted from game_loop.js by Ned (GRO-1169)
// Loaded as module #2 — after utils.js, before all other game modules
// Sets up canvas, ctx, and all HUD element references early
// initializeRendererBuffers() is NOT called here — depends on renderer.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsive canvas: maintain internal 800x450, scale display via CSS
const GAME_WIDTH = 800;
const GAME_HEIGHT = 450;
canvas.width = GAME_WIDTH * 2;
canvas.height = GAME_HEIGHT * 2;
ctx.scale(2, 2);

canvas.style.width = '800px';
canvas.style.height = '450px';

// Override DOM properties to return logical coordinate space (800x450)
// to prevent game positioning math throughout the project from breaking
Object.defineProperty(canvas, 'width', {
    get: () => GAME_WIDTH,
    configurable: true
});
Object.defineProperty(canvas, 'height', {
    get: () => GAME_HEIGHT,
    configurable: true
});

const uiShield = document.getElementById('ui-shield');
const uiWeapon = document.getElementById('ui-weapon');
const uiScore = document.getElementById('ui-score');
const uiScrap = document.getElementById('ui-scrap');
const uiBoost = document.getElementById('ui-boost');
const uiSpecial = document.getElementById('ui-special');
const uiDodge = document.getElementById('ui-dodge');
const uiBiome = document.getElementById('ui-biome');
const uiNavigator = document.getElementById('ui-navigator');
const uiStreamer = document.getElementById('ui-streamer');
