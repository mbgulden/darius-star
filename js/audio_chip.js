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
    musicStep = 0;
    musicInterval = setInterval(playMenuMusicStep, 200); // 120 bpm, 8th notes
}

function stopMenuMusic() {
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
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
