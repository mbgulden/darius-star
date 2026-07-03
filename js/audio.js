// --- Web Audio Synthesizer ---
let audioCtx = null;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

let masterVolume = 0.8;
let sfxVolume = 0.8;
let musicVolume = 0.6;

function playSound(type) {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const volMultiplier = masterVolume * sfxVolume;

        if (type === 'shoot') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(500, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.08 * volMultiplier, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.12);
        } else if (type === 'hit') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.15 * volMultiplier, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        } else if (type === 'explosion') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(80, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.45);
            gain.gain.setValueAtTime(0.25 * volMultiplier, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.45);
        } else if (type === 'powerup') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(280, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(520, audioCtx.currentTime + 0.08);
            osc.frequency.linearRampToValueAtTime(850, audioCtx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.12 * volMultiplier, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
        } else if (type === 'siren') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(350, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(450, audioCtx.currentTime + 0.2);
            osc.frequency.linearRampToValueAtTime(350, audioCtx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.06 * volMultiplier, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.4);
        } else if (type === 'laser_charge') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(100, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 1.2);
            gain.gain.setValueAtTime(0.05 * volMultiplier, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.1 * volMultiplier, audioCtx.currentTime + 1.2);
            osc.start();
            osc.stop(audioCtx.currentTime + 1.2);
        } else if (type === 'laser_fire') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 1.5);
            gain.gain.setValueAtTime(0.2 * volMultiplier, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
            osc.start();
            osc.stop(audioCtx.currentTime + 1.5);
        } else if (type === 'menu_select') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.05 * volMultiplier, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.05);
        } else if (type === 'menu_click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.08 * volMultiplier, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.08);
        } else if (type === 'victory_fanfare') {
            // Triumphant 16-bit melody: C4, E4, G4, C5, G4, C5, E5
            const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25, 659.25];
            const durations = [0.12, 0.12, 0.12, 0.24, 0.12, 0.12, 0.48];
            let accumTime = 0;
            notes.forEach((freq, idx) => {
                const noteTime = audioCtx.currentTime + accumTime;
                const oscNode = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscNode.type = 'square'; // chiptune brass/lead feel
                oscNode.frequency.setValueAtTime(freq, noteTime);
                gainNode.gain.setValueAtTime(0.05 * volMultiplier, noteTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + durations[idx]);
                oscNode.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscNode.start(noteTime);
                oscNode.stop(noteTime + durations[idx]);
                accumTime += durations[idx] * 0.8;
            });
        }
    } catch (e) {
        console.log("Audio play blocked/failed:", e);
    }
}

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
