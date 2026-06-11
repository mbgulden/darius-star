        // --- Web Audio Synthesizer ---
        let audioCtx = null;
        function initAudio() {
            if (!audioCtx) {
                try {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                } catch(e) {
                    console.warn('[Darius Star] AudioContext creation failed:', e.message);
                    return;
                }
            }
            if (audioCtx.state === 'suspended') {
                try {
                    audioCtx.resume();
                } catch(e) {
                    console.warn('[Darius Star] AudioContext resume failed:', e.message);
                }
            }
        }

        function hexToRgb(hex) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `${r}, ${g}, ${b}`;
        }

        function playSound(type) {
            if (!audioCtx) return;
            try {
                const volMultiplier = masterVolume * sfxVolume;
                
                // Helper to create white noise buffer
                const createNoiseNode = (duration) => {
                    const bufferSize = audioCtx.sampleRate * duration;
                    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = Math.random() * 2 - 1;
                    }
                    const noiseNode = audioCtx.createBufferSource();
                    noiseNode.buffer = buffer;
                    return noiseNode;
                };

                // Standard Web Audio Synth for gameplay sounds and the 30 audio drama cues
                if (type === 'shoot') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(500, audioCtx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.12);
                    gain.gain.setValueAtTime(0.08 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.12);
                } else if (type === 'hit') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(140, audioCtx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.1);
                    gain.gain.setValueAtTime(0.15 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.1);
                } else if (type === 'explosion') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(80, audioCtx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.45);
                    gain.gain.setValueAtTime(0.25 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.45);
                } else if (type === 'powerup') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(280, audioCtx.currentTime);
                    osc.frequency.linearRampToValueAtTime(520, audioCtx.currentTime + 0.08);
                    osc.frequency.linearRampToValueAtTime(850, audioCtx.currentTime + 0.2);
                    gain.gain.setValueAtTime(0.12 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.2);
                } else if (type === 'siren') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(350, audioCtx.currentTime);
                    osc.frequency.linearRampToValueAtTime(450, audioCtx.currentTime + 0.2);
                    osc.frequency.linearRampToValueAtTime(350, audioCtx.currentTime + 0.4);
                    gain.gain.setValueAtTime(0.06 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.4);
                } else if (type === 'laser_charge') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 1.2);
                    gain.gain.setValueAtTime(0.05 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.1 * volMultiplier, audioCtx.currentTime + 1.2);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 1.2);
                } else if (type === 'laser_fire') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(120, audioCtx.currentTime);
                    osc.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 1.5);
                    gain.gain.setValueAtTime(0.2 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 1.5);
                } else if (type === 'menu_select') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
                    gain.gain.setValueAtTime(0.05 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.05);
                } else if (type === 'menu_click') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
                    osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.08);
                    gain.gain.setValueAtTime(0.08 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.08);
                } else if (type === 'victory_fanfare') {
                    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25, 659.25];
                    const durations = [0.12, 0.12, 0.12, 0.24, 0.12, 0.12, 0.48];
                    let accumTime = 0;
                    notes.forEach((freq, idx) => {
                        const noteTime = audioCtx.currentTime + accumTime;
                        const oscNode = audioCtx.createOscillator();
                        const gainNode = audioCtx.createGain();
                        oscNode.type = 'square';
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
                
                // --- GRO-1028: Environmental & Audio-Drama Cues ---
                
                // BIOME 1 CUES
                else if (type === 'ambient_crushing_depths') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    const filter = audioCtx.createBiquadFilter();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(45, audioCtx.currentTime); // sub-bass hum
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(90, audioCtx.currentTime);
                    gain.gain.setValueAtTime(0.3 * volMultiplier, audioCtx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.3 * volMultiplier, audioCtx.currentTime + 2.0);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.0);
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 3.0);
                } else if (type === 'sfx_bioluminescent_crackle') {
                    // 5 rapid micro-clicks representing biological light discharge
                    for (let i = 0; i < 5; i++) {
                        const clickTime = audioCtx.currentTime + i * 0.08;
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(3200 + Math.random() * 800, clickTime);
                        gain.gain.setValueAtTime(0.03 * volMultiplier, clickTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.015);
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.start(clickTime);
                        osc.stop(clickTime + 0.015);
                    }
                } else if (type === 'sfx_guardian_heartbeat') {
                    // Double heartbeat thump (lub-dub)
                    [0.0, 0.35].forEach((delay) => {
                        const thumpTime = audioCtx.currentTime + delay;
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        const filter = audioCtx.createBiquadFilter();
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(95, thumpTime);
                        osc.frequency.exponentialRampToValueAtTime(20, thumpTime + 0.12);
                        filter.type = 'lowpass';
                        filter.frequency.setValueAtTime(120, thumpTime);
                        gain.gain.setValueAtTime(0.28 * volMultiplier, thumpTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, thumpTime + 0.12);
                        osc.connect(filter);
                        filter.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.start(thumpTime);
                        osc.stop(thumpTime + 0.12);
                    });
                }
                
                // BIOME 2 CUES
                else if (type === 'ambient_dead_reef_creak') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    const filter = audioCtx.createBiquadFilter();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(140, audioCtx.currentTime);
                    osc.frequency.linearRampToValueAtTime(180, audioCtx.currentTime + 2.0);
                    filter.type = 'bandpass';
                    filter.frequency.setValueAtTime(600, audioCtx.currentTime);
                    filter.Q.setValueAtTime(4.0, audioCtx.currentTime);
                    gain.gain.setValueAtTime(0.08 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.0);
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 2.0);
                } else if (type === 'sfx_ghost_whale_song') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(380, audioCtx.currentTime);
                    osc.frequency.linearRampToValueAtTime(450, audioCtx.currentTime + 0.8);
                    osc.frequency.linearRampToValueAtTime(320, audioCtx.currentTime + 2.0);
                    // Tremolo
                    const lfo = audioCtx.createOscillator();
                    const lfoGain = audioCtx.createGain();
                    lfo.frequency.value = 5.0; // 5Hz vibrato
                    lfoGain.gain.value = 15; // frequency depth
                    lfo.connect(lfoGain);
                    lfoGain.connect(osc.frequency);
                    gain.gain.setValueAtTime(0.08 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.2);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    lfo.start();
                    osc.start();
                    lfo.stop(audioCtx.currentTime + 2.2);
                    osc.stop(audioCtx.currentTime + 2.2);
                } else if (type === 'sfx_precursor_collapse') {
                    const noise = createNoiseNode(1.5);
                    const gain = audioCtx.createGain();
                    const filter = audioCtx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
                    filter.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 1.5);
                    gain.gain.setValueAtTime(0.25 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
                    noise.connect(filter);
                    filter.connect(gain);
                    gain.connect(audioCtx.destination);
                    noise.start();
                    noise.stop(audioCtx.currentTime + 1.5);
                }
                
                // BIOME 3 CUES
                else if (type === 'ambient_ice_cave_groan') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(90, audioCtx.currentTime);
                    osc.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 2.5);
                    gain.gain.setValueAtTime(0.12 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 2.5);
                } else if (type === 'sfx_embryonic_pulse') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(180, audioCtx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(35, audioCtx.currentTime + 0.25);
                    gain.gain.setValueAtTime(0.18 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.25);
                } else if (type === 'sfx_cryo_shatter') {
                    [1400, 1800, 2200, 2900].forEach((freq, idx) => {
                        const noteTime = audioCtx.currentTime + idx * 0.05;
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(freq, noteTime);
                        gain.gain.setValueAtTime(0.05 * volMultiplier, noteTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.start(noteTime);
                        osc.stop(noteTime + 0.15);
                    });
                }
                
                // BIOME 4 CUES
                else if (type === 'ambient_ionized_hum') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
                    // Slow frequency shift LFO
                    const lfo = audioCtx.createOscillator();
                    const lfoGain = audioCtx.createGain();
                    lfo.frequency.value = 0.4;
                    lfoGain.gain.value = 30;
                    lfo.connect(lfoGain);
                    lfoGain.connect(osc.frequency);
                    gain.gain.setValueAtTime(0.15 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.8);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    lfo.start();
                    osc.start();
                    lfo.stop(audioCtx.currentTime + 2.8);
                    osc.stop(audioCtx.currentTime + 2.8);
                } else if (type === 'sfx_reality_glitch') {
                    // Random frequency jumps every 50ms for a glitched state
                    for (let i = 0; i < 8; i++) {
                        const jumpTime = audioCtx.currentTime + i * 0.06;
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'square';
                        osc.frequency.setValueAtTime(150 + Math.random() * 800, jumpTime);
                        gain.gain.setValueAtTime(0.04 * volMultiplier, jumpTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, jumpTime + 0.05);
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.start(jumpTime);
                        osc.stop(jumpTime + 0.05);
                    }
                } else if (type === 'sfx_dreamer_lonely_note') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3 note
                    // Tremolo
                    const lfo = audioCtx.createOscillator();
                    const lfoGain = audioCtx.createGain();
                    lfo.frequency.value = 4.2; 
                    lfoGain.gain.value = 8;
                    lfo.connect(lfoGain);
                    lfoGain.connect(osc.frequency);
                    gain.gain.setValueAtTime(0.14 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.8);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    lfo.start();
                    osc.start();
                    lfo.stop(audioCtx.currentTime + 2.8);
                    osc.stop(audioCtx.currentTime + 2.8);
                }
                
                // BIOME 5 CUES
                else if (type === 'ambient_ice_ring_crunch') {
                    const noise = createNoiseNode(1.5);
                    const gain = audioCtx.createGain();
                    const filter = audioCtx.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.setValueAtTime(450, audioCtx.currentTime);
                    filter.Q.setValueAtTime(3.0, audioCtx.currentTime);
                    gain.gain.setValueAtTime(0.06 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
                    noise.connect(filter);
                    filter.connect(gain);
                    gain.connect(audioCtx.destination);
                    noise.start();
                    noise.stop(audioCtx.currentTime + 1.5);
                } else if (type === 'sfx_navy_radio_static') {
                    const noise = createNoiseNode(0.6);
                    const gain = audioCtx.createGain();
                    const filter = audioCtx.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.setValueAtTime(1100, audioCtx.currentTime);
                    // Rapid gain fluctuations
                    gain.gain.setValueAtTime(0.12 * volMultiplier, audioCtx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.01 * volMultiplier, audioCtx.currentTime + 0.15);
                    gain.gain.linearRampToValueAtTime(0.15 * volMultiplier, audioCtx.currentTime + 0.35);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
                    noise.connect(filter);
                    filter.connect(gain);
                    gain.connect(audioCtx.destination);
                    noise.start();
                    noise.stop(audioCtx.currentTime + 0.6);
                } else if (type === 'sfx_decompression_boom') {
                    const noise = createNoiseNode(1.2);
                    const osc = audioCtx.createOscillator();
                    const noiseGain = audioCtx.createGain();
                    const oscGain = audioCtx.createGain();
                    const filter = audioCtx.createBiquadFilter();
                    
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.6);
                    oscGain.gain.setValueAtTime(0.22 * volMultiplier, audioCtx.currentTime);
                    oscGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
                    
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(140, audioCtx.currentTime);
                    noiseGain.gain.setValueAtTime(0.24 * volMultiplier, audioCtx.currentTime);
                    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
                    
                    noise.connect(filter);
                    filter.connect(noiseGain);
                    noiseGain.connect(audioCtx.destination);
                    
                    osc.connect(oscGain);
                    oscGain.connect(audioCtx.destination);
                    
                    noise.start();
                    osc.start();
                    noise.stop(audioCtx.currentTime + 1.2);
                    osc.stop(audioCtx.currentTime + 0.6);
                }
                
                // BIOME 6 CUES
                else if (type === 'ambient_plasma_roar') {
                    const noise = createNoiseNode(2.0);
                    const gain = audioCtx.createGain();
                    const filter = audioCtx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(110, audioCtx.currentTime);
                    gain.gain.setValueAtTime(0.25 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.0);
                    noise.connect(filter);
                    filter.connect(gain);
                    gain.connect(audioCtx.destination);
                    noise.start();
                    noise.stop(audioCtx.currentTime + 2.0);
                } else if (type === 'sfx_flare_sizzle') {
                    const noise = createNoiseNode(1.0);
                    const gain = audioCtx.createGain();
                    const filter = audioCtx.createBiquadFilter();
                    filter.type = 'highpass';
                    filter.frequency.setValueAtTime(4500, audioCtx.currentTime);
                    gain.gain.setValueAtTime(0.06 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.0);
                    noise.connect(filter);
                    filter.connect(gain);
                    gain.connect(audioCtx.destination);
                    noise.start();
                    noise.stop(audioCtx.currentTime + 1.0);
                } else if (type === 'sfx_lyra_energy_arcs') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
                    // Rapid electricity volume gate
                    gain.gain.setValueAtTime(0.12 * volMultiplier, audioCtx.currentTime);
                    for (let i = 0; i < 20; i++) {
                        const gateTime = audioCtx.currentTime + i * 0.05;
                        gain.gain.setValueAtTime(i % 2 === 0 ? 0.12 * volMultiplier : 0.01 * volMultiplier, gateTime);
                    }
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.0);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 1.0);
                }
                
                // BIOME 7 CUES
                else if (type === 'ambient_hurricane_howl') {
                    const noise = createNoiseNode(2.5);
                    const gain = audioCtx.createGain();
                    const filter = audioCtx.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.setValueAtTime(450, audioCtx.currentTime);
                    filter.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 1.2);
                    filter.frequency.linearRampToValueAtTime(500, audioCtx.currentTime + 2.5);
                    filter.Q.setValueAtTime(3.5, audioCtx.currentTime);
                    gain.gain.setValueAtTime(0.14 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5);
                    noise.connect(filter);
                    filter.connect(gain);
                    gain.connect(audioCtx.destination);
                    noise.start();
                    noise.stop(audioCtx.currentTime + 2.5);
                } else if (type === 'sfx_singer_weeping') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(850, audioCtx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(380, audioCtx.currentTime + 1.4);
                    gain.gain.setValueAtTime(0.08 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.4);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 1.4);
                } else if (type === 'sfx_data_burst_transfer') {
                    // Ascending retro chiptune chimes
                    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                        const noteTime = audioCtx.currentTime + idx * 0.06;
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'square';
                        osc.frequency.setValueAtTime(freq, noteTime);
                        gain.gain.setValueAtTime(0.04 * volMultiplier, noteTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.12);
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.start(noteTime);
                        osc.stop(noteTime + 0.12);
                    });
                }
                
                // BIOME 8 CUES
                else if (type === 'ambient_hull_groan_distress') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(75, audioCtx.currentTime);
                    osc.frequency.linearRampToValueAtTime(65, audioCtx.currentTime + 2.0);
                    gain.gain.setValueAtTime(0.12 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.0);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 2.0);
                    
                    // Periodic emergency locator beep
                    const beepTime = audioCtx.currentTime + 0.5;
                    const beep = audioCtx.createOscillator();
                    const beepGain = audioCtx.createGain();
                    beep.type = 'square';
                    beep.frequency.setValueAtTime(1200, beepTime);
                    beepGain.gain.setValueAtTime(0.03 * volMultiplier, beepTime);
                    beepGain.gain.exponentialRampToValueAtTime(0.001, beepTime + 0.08);
                    beep.connect(beepGain);
                    beepGain.connect(audioCtx.destination);
                    beep.start(beepTime);
                    beep.stop(beepTime + 0.08);
                } else if (type === 'sfx_crane_whisper') {
                    const noise = createNoiseNode(1.5);
                    const gain = audioCtx.createGain();
                    const filter = audioCtx.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.setValueAtTime(950, audioCtx.currentTime);
                    // Whispering breathing envelope
                    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.08 * volMultiplier, audioCtx.currentTime + 0.5);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
                    noise.connect(filter);
                    filter.connect(gain);
                    gain.connect(audioCtx.destination);
                    noise.start();
                    noise.stop(audioCtx.currentTime + 1.5);
                } else if (type === 'sfx_pressure_door_heartbeat') {
                    // System hiss
                    const noise = createNoiseNode(0.5);
                    const hissGain = audioCtx.createGain();
                    const filter = audioCtx.createBiquadFilter();
                    filter.type = 'highpass';
                    filter.frequency.setValueAtTime(3000, audioCtx.currentTime);
                    hissGain.gain.setValueAtTime(0.06 * volMultiplier, audioCtx.currentTime);
                    hissGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
                    noise.connect(filter);
                    filter.connect(hissGain);
                    hissGain.connect(audioCtx.destination);
                    noise.start();
                    noise.stop(audioCtx.currentTime + 0.5);
                    
                    // Double heartbeat
                    [0.6, 0.95].forEach((delay) => {
                        const heartbeatTime = audioCtx.currentTime + delay;
                        const osc = audioCtx.createOscillator();
                        const thumpGain = audioCtx.createGain();
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(80, heartbeatTime);
                        osc.frequency.exponentialRampToValueAtTime(20, heartbeatTime + 0.12);
                        thumpGain.gain.setValueAtTime(0.22 * volMultiplier, heartbeatTime);
                        thumpGain.gain.exponentialRampToValueAtTime(0.001, heartbeatTime + 0.12);
                        osc.connect(thumpGain);
                        thumpGain.connect(audioCtx.destination);
                        osc.start(heartbeatTime);
                        osc.stop(heartbeatTime + 0.12);
                    });
                }
                
                // BIOME 9 CUES
                else if (type === 'ambient_hive_breathing') {
                    const noise = createNoiseNode(3.0);
                    const gain = audioCtx.createGain();
                    const filter = audioCtx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(140, audioCtx.currentTime);
                    // 3s breathing loop (1.2s swell, 1.8s fade)
                    gain.gain.setValueAtTime(0.01 * volMultiplier, audioCtx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.20 * volMultiplier, audioCtx.currentTime + 1.2);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.0);
                    noise.connect(filter);
                    filter.connect(gain);
                    gain.connect(audioCtx.destination);
                    noise.start();
                    noise.stop(audioCtx.currentTime + 3.0);
                } else if (type === 'sfx_hive_seductive_choir') {
                    // Soft Major 7th chord (C4, E4, G4, B4)
                    [261.63, 329.63, 392.00, 493.88].forEach((freq) => {
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                        gain.gain.setValueAtTime(0.03 * volMultiplier, audioCtx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.0);
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.start();
                        osc.stop(audioCtx.currentTime + 2.0);
                    });
                } else if (type === 'sfx_rejection_alarm') {
                    const osc1 = audioCtx.createOscillator();
                    const osc2 = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc1.type = 'square';
                    osc2.type = 'square';
                    osc1.frequency.setValueAtTime(440, audioCtx.currentTime);
                    osc2.frequency.setValueAtTime(465, audioCtx.currentTime); // dissonant interval
                    
                    // Gated alarm volume
                    gain.gain.setValueAtTime(0.06 * volMultiplier, audioCtx.currentTime);
                    for (let i = 0; i < 5; i++) {
                        const gateTime = audioCtx.currentTime + i * 0.2;
                        gain.gain.setValueAtTime(i % 2 === 0 ? 0.06 * volMultiplier : 0.002 * volMultiplier, gateTime);
                    }
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.0);
                    
                    osc1.connect(gain);
                    osc2.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc1.start();
                    osc2.start();
                    osc1.stop(audioCtx.currentTime + 1.0);
                    osc2.stop(audioCtx.currentTime + 1.0);
                }
                
                // BIOME 10 CUES
                else if (type === 'ambient_singularity_hum') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(40, audioCtx.currentTime);
                    osc.frequency.linearRampToValueAtTime(20, audioCtx.currentTime + 2.5); // sub-bass descent
                    gain.gain.setValueAtTime(0.28 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 2.5);
                } else if (type === 'sfx_prime_data_clicks') {
                    // Rapid series of 12 click chirps
                    for (let i = 0; i < 12; i++) {
                        const clickTime = audioCtx.currentTime + i * 0.04;
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(2600 + i * 120, clickTime);
                        gain.gain.setValueAtTime(0.03 * volMultiplier, clickTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.02);
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.start(clickTime);
                        osc.stop(clickTime + 0.02);
                    }
                } else if (type === 'sfx_event_horizon_lensing') {
                    // Quick lowpass filter sweep representing audio absorption
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    const filter = audioCtx.createBiquadFilter();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(180, audioCtx.currentTime);
                    osc.frequency.linearRampToValueAtTime(90, audioCtx.currentTime + 1.8);
                    
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(4000, audioCtx.currentTime);
                    filter.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 1.5);
                    
                    gain.gain.setValueAtTime(0.12 * volMultiplier, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);
                    
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 1.8);
                }
            } catch (e) {
                console.log("Audio play blocked/failed:", e);
            }
        }

        // ====================================================================
        // GRO-1028: Biome Ambient System & Audio-Only Story Beats
        // "Show-don't-tell" audio drama — silence, SFX, environmental cues
        // ====================================================================

        // Maps biomeLevel → ambient drone cue ID
        const BIOME_AMBIENT_MAP = {
            1: 'ambient_crushing_depths',
            2: 'ambient_dead_reef_creak',
            3: 'ambient_ice_cave_groan',
            4: 'ambient_ionized_hum',
            5: 'ambient_ice_ring_crunch',
            6: 'ambient_plasma_roar',
            7: 'ambient_hurricane_howl',
            8: 'ambient_hull_groan_distress',
            9: 'ambient_hive_breathing',
            10: 'ambient_singularity_hum'
        };

        let _biomeAmbientTimer = 0;
        const BIOME_AMBIENT_INTERVAL = 8.0; // seconds between ambient drone pulses

        // Called on biome transition — plays the ambient drone once immediately,
        // and the update loop will re-trigger periodically
        function triggerBiomeAmbient() {
            const cue = BIOME_AMBIENT_MAP[biomeLevel];
            if (cue) {
                playSound(cue);
                _biomeAmbientTimer = 0; // reset timer so next pulse is a full interval away
            }
        }

        // Called every frame from update(). Periodically re-triggers the
        // current biome's ambient drone to maintain environmental presence.
        function updateBiomeAmbientLoop(dt) {
            _biomeAmbientTimer += dt;
            if (_biomeAmbientTimer >= BIOME_AMBIENT_INTERVAL) {
                _biomeAmbientTimer = 0;
                const cue = BIOME_AMBIENT_MAP[biomeLevel];
                if (cue) playSound(cue);
            }
        }

        // ====================================================================
        // Audio-Only Story Beats — multi-cue sequences for key narrative moments
        // Each beat is a timed sequence of sounds, often ending in silence.
        // These are the "100-level audio drama" moments where dialogue stops
        // and the acoustic environment carries the story.
        // ====================================================================

        let _activeStoryBeat = null;
        let _storyBeatTimer = 0;

        function playAudioStoryBeat(biomeLevel) {
            // Only one story beat at a time
            if (_activeStoryBeat) return;

            const beat = AUDIO_STORY_BEATS[biomeLevel];
            if (!beat) return;

            _activeStoryBeat = beat;
            _storyBeatTimer = 0;
        }

        function updateAudioStoryBeat(dt) {
            if (!_activeStoryBeat) return;
            _storyBeatTimer += dt;

            const beat = _activeStoryBeat;
            // Check for cues whose trigger time has been reached
            for (let i = beat._nextIdx || 0; i < beat.steps.length; i++) {
                const step = beat.steps[i];
                if (_storyBeatTimer >= step.t) {
                    playSound(step.cue);
                    beat._nextIdx = i + 1;
                } else {
                    break; // steps are in time order
                }
            }

            // Mark complete when all steps have fired
            if (beat._nextIdx >= beat.steps.length) {
                _activeStoryBeat = null;
            }
        }

        // Story beat definitions — timed sequences of cue IDs
        const AUDIO_STORY_BEATS = {
            // BIOME 1: Abyssal Trench — "Descent into the Canyon"
            // Dialogue drops, double-thump Guardian heartbeat + neural static
            1: {
                steps: [
                    {t: 0.0, cue: 'sfx_guardian_heartbeat'},
                    {t: 1.2, cue: 'sfx_guardian_heartbeat'},
                    {t: 2.4, cue: 'sfx_bioluminescent_crackle'},
                    {t: 3.0, cue: 'ambient_crushing_depths'}
                ]
            },
            // BIOME 2: Coral Graveyard — "Decoding the Vault"
            // Crystalline chorus rises to peak, collapses into absolute silence
            2: {
                steps: [
                    {t: 0.0, cue: 'sfx_ghost_whale_song'},
                    {t: 2.0, cue: 'sfx_precursor_collapse'},
                    {t: 2.8, cue: 'ambient_dead_reef_creak'}
                    // silence after collapse
                ]
            },
            // BIOME 3: Coelacanth Hatchery — "The Embryo Birth"
            // Wet tearing sound, rapid double-heartbeat, low-frequency rumble
            3: {
                steps: [
                    {t: 0.0, cue: 'sfx_embryonic_pulse'},
                    {t: 1.0, cue: 'sfx_cryo_shatter'},
                    {t: 1.6, cue: 'sfx_embryonic_pulse'},
                    {t: 2.5, cue: 'ambient_ice_cave_groan'}
                ]
            },
            // BIOME 4: Veil Nebula — "First Contact"
            // All music fades out, a single achingly lonely note sweeps across
            4: {
                steps: [
                    {t: 0.0, cue: 'sfx_reality_glitch'},
                    {t: 1.5, cue: 'sfx_dreamer_lonely_note'},
                    {t: 4.0, cue: 'ambient_ionized_hum'}
                ]
            },
            // BIOME 5: Ice Ring — "Finding Aldric's Wreckage"
            // Morse code sequence, deep grandfatherly sigh lost in static
            5: {
                steps: [
                    {t: 0.0, cue: 'sfx_navy_radio_static'},
                    {t: 1.5, cue: 'sfx_decompression_boom'},
                    {t: 3.0, cue: 'ambient_ice_ring_crunch'}
                ]
            },
            // BIOME 6: Fire Nebula — "Lyra's Transformation"
            // Voice disappears, crackling energy arcs, overlapping harmonics
            6: {
                steps: [
                    {t: 0.0, cue: 'sfx_flare_sizzle'},
                    {t: 1.0, cue: 'sfx_lyra_energy_arcs'},
                    {t: 2.5, cue: 'sfx_lyra_energy_arcs'},
                    {t: 4.0, cue: 'ambient_plasma_roar'}
                ]
            },
            // BIOME 7: Storm Belt — "The Storm-Singer's Death"
            // Storm wind drops to whisper, ascending chime, total silence
            7: {
                steps: [
                    {t: 0.0, cue: 'sfx_singer_weeping'},
                    {t: 2.0, cue: 'sfx_data_burst_transfer'},
                    {t: 3.5, cue: 'ambient_hurricane_howl'}
                    // silence after chime
                ]
            },
            // BIOME 8: Derelict Fleet — "Entering the Flagship Hangar"
            // Pressure seal failing, faint heartbeat, child's toy chime
            8: {
                steps: [
                    {t: 0.0, cue: 'sfx_pressure_door_heartbeat'},
                    {t: 1.5, cue: 'sfx_crane_whisper'},
                    {t: 3.0, cue: 'ambient_hull_groan_distress'}
                ]
            },
            // BIOME 9: Hive Mind Core — "The Temptation of Peace"
            // Warm harmonic choir + Lyra's laughter → cut by harsh metallic alarm
            9: {
                steps: [
                    {t: 0.0, cue: 'sfx_hive_seductive_choir'},
                    {t: 2.5, cue: 'sfx_rejection_alarm'},
                    {t: 3.2, cue: 'ambient_hive_breathing'}
                ]
            },
            // BIOME 10: Core Rift — "Reaching the Event Horizon"
            // All sounds lose high frequencies, only sub-bass hum remains
            10: {
                steps: [
                    {t: 0.0, cue: 'sfx_event_horizon_lensing'},
                    {t: 2.0, cue: 'sfx_prime_data_clicks'},
                    {t: 3.5, cue: 'ambient_singularity_hum'}
                ]
            }
        };

