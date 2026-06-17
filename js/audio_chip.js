// --- Web Audio Chiptune Synthesizer Loop ---
let musicInterval = null;
let musicStep = 0;
const bassLine = [110, 110, 130, 130, 146, 146, 165, 165]; // A2, C3, D3, E3
const melody = [
    220, 0, 261, 293, 329, 0, 293, 261,
    220, 220, 329, 0, 293, 0, 261, 0
];

function playMenuMusicStep() {
    if (!audioCtx || currentScreen === 'playing' || currentScreen === SCREENS.CINEMATIC || currentScreen === SCREENS.CREDITS) return;
    const now = audioCtx.currentTime;
    
    // Play bass note
    const bassFreq = bassLine[Math.floor(musicStep / 2) % bassLine.length];
    if (musicStep % 2 === 0 && bassFreq > 0) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassFreq, now);
        gain.gain.setValueAtTime(0.015 * masterVolume * musicVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    }
    
    // Play melody note
    const melFreq = melody[musicStep % melody.length];
    if (melFreq > 0) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(melFreq, now);
        gain.gain.setValueAtTime(0.02 * masterVolume * musicVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
    }
    
    musicStep++;
}

function startMenuMusic() {
    if (musicInterval) return;
    // GRO-1926: Chiptune starts immediately for instant feedback after user gesture.
    // crossfadeToMenuTrack() (called from game_loop.js after AudioManager.preloadAll)
    // ramps chiptune down and starts the cinematic MP3 once preloads finish.
    // Don't skip when AudioManager is initialized — we want both layers active.
    musicStep = 0;
    musicInterval = setInterval(playMenuMusicStep, 200); // 120 bpm, 8th notes
}

function stopMenuMusic() {
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
}

// GRO-1926: Crossfade chiptune synth → cinematic MP3 over 2 seconds.
// Called from game_loop.js after AudioManager.preloadAll() resolves.
// Ramps the chiptune's master volume (musicVolume) down via exponential ramp
// on the audio context, then stops the synth interval. Caller is responsible
// for calling AudioManager.play(targetTrack) BEFORE stopMenuMusic() so the MP3
// is already producing sound when the chiptune fades.
function crossfadeToMenuTrack(targetTrack, durationSec) {
    durationSec = durationSec || 2.0;
    if (typeof audioCtx === 'undefined' || !audioCtx) return;
    if (typeof AudioManager === 'undefined' || !AudioManager.play) return;

    // Start the cinematic MP3 — it begins immediately.
    try {
        AudioManager.play(targetTrack, durationSec, true);
    } catch (e) {
        console.warn('[crossfadeToMenuTrack] AudioManager.play failed:', e.message);
        return;
    }

    // Ramp musicVolume down over durationSec. The chiptune's gain nodes multiply
    // by musicVolume on every step, so reducing it fades the synth out smoothly.
    const startVol = musicVolume;
    const startTime = audioCtx.currentTime;
    // We can't use exponentialRampToValueAtTime on a plain JS variable, so we
    // just step it down via setInterval, then clear the synth when it hits ~0.
    const STEP_MS = 50;
    const totalSteps = Math.max(1, Math.floor((durationSec * 1000) / STEP_MS));
    let step = 0;
    const fade = setInterval(function() {
        step++;
        // Linear ramp; safe for the existing synth code.
        musicVolume = startVol * (1 - step / totalSteps);
        if (step >= totalSteps) {
            clearInterval(fade);
            stopMenuMusic();
            musicVolume = startVol; // restore for next time startMenuMusic runs
        }
    }, STEP_MS);
}

// --- Web Audio Credits Music Loop ---
let creditsMusicInterval = null;
const creditsBassLine = [98, 98, 146, 146, 130, 130, 98, 98]; // G2, D3, C3, G2
const creditsMelody = [
    392, 0, 493, 587, 784, 0, 739, 587, // G4, B4, D5, G5, F#5, D5
    493, 493, 587, 0, 440, 0, 392, 0    // B4, B4, D5, A4, G4
];

function playCreditsMusicStep() {
    if (!audioCtx || currentScreen !== SCREENS.CREDITS) return;
    const now = audioCtx.currentTime;
    
    const bassFreq = creditsBassLine[Math.floor(musicStep / 2) % creditsBassLine.length];
    if (musicStep % 2 === 0 && bassFreq > 0) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(bassFreq, now);
        gain.gain.setValueAtTime(0.015 * masterVolume * musicVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
    }
    
    const melFreq = creditsMelody[musicStep % creditsMelody.length];
    if (melFreq > 0) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(melFreq, now);
        gain.gain.setValueAtTime(0.012 * masterVolume * musicVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
    }
    
    musicStep++;
}

function startCreditsMusic() {
    if (creditsMusicInterval) return;
    musicStep = 0;
    creditsMusicInterval = setInterval(playCreditsMusicStep, 250); // 120 bpm, 8th notes, slightly slower
}

function stopCreditsMusic() {
    if (creditsMusicInterval) {
        clearInterval(creditsMusicInterval);
        creditsMusicInterval = null;
    }
}
