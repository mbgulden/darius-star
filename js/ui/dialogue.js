// js/ui/dialogue.js — Dialogue system (GRO-1062: extracted from ui.js)
// DialogueBox, PortraitRenderer, CommsOverlay classes
// Loaded after ui.js, before level_manager.js

        // --- EventBus Definition (GRO-2163) ---
        const EventBus = {
            _listeners: {},
            on(event, callback) {
                if (!this._listeners[event]) this._listeners[event] = [];
                this._listeners[event].push(callback);
            },
            off(event, callback) {
                if (!this._listeners[event]) return;
                this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
            },
            emit(event, data) {
                const cbs = this._listeners[event];
                if (cbs) {
                    cbs.forEach(cb => {
                        try { cb(data); } catch (e) { console.error("EventBus error:", e); }
                    });
                }
            }
        };
        if (typeof window !== 'undefined') window.EventBus = EventBus;
        if (typeof global !== 'undefined') global.EventBus = EventBus;

        // --- Dialogue System Classes & Data ---
        let _activeDialogue = null;
        let _dialogueCompletedScenes = {};

        const propConfig = {
            get() { return _activeDialogue; },
            set(val) { _activeDialogue = val; },
            configurable: true
        };
        const scenesConfig = {
            get() { return _dialogueCompletedScenes; },
            set(val) { _dialogueCompletedScenes = val; },
            configurable: true
        };

        if (typeof window !== 'undefined') {
            Object.defineProperty(window, 'activeDialogue', propConfig);
            Object.defineProperty(window, 'dialogueCompletedScenes', scenesConfig);
        }
        if (typeof global !== 'undefined') {
            Object.defineProperty(global, 'activeDialogue', propConfig);
            Object.defineProperty(global, 'dialogueCompletedScenes', scenesConfig);
        }


        const SPEAKER_CONFIG = {
            'Lyra':      { color: '#00ffff', callsign: '[NAVIGATOR]', portrait: 'lyra_neutral' },
            'Darius':    { color: '#ffaa00', callsign: '[SCRAPPER]', portrait: 'darius_neutral' },
            'Naya':      { color: '#00ff88', callsign: '[TACTICAL PILOT]', portrait: 'naya_neutral' },
            'Thorne':    { color: '#88aacc', callsign: '[MISSION CONTROL]', portrait: 'thorne_neutral' },
            'Cross':     { color: '#ff00aa', callsign: '[NAVY SPECIAL OPS]', portrait: 'cross_neutral' },
            'Selene':    { color: '#ffd700', callsign: '[HAVEN-7 BASE COMMAND]', portrait: 'selene_neutral' },
            'Architect': { color: '#cc44ff', callsign: '[PRECURSOR FREQUENCY]', portrait: 'architect_ethereal' },
            'Ophion':    { color: '#cc44ff', callsign: '[AI SYNTHESIS]', portrait: 'architect_ethereal' },
            'System':    { color: '#00ffff', callsign: '[PRIORITY SCAN]', portrait: 'none' }
        };
        if (typeof window !== 'undefined') window.SPEAKER_CONFIG = SPEAKER_CONFIG;

        // ─── GRO-4207: Character-Consistent Holographic Animated Portrait Suite ────────────
        const PortraitAnimator = {
            _animTimer: 0,

            getSituationalMood(speaker, text, explicitMood = null) {
                if (explicitMood) return explicitMood;
                if (!text) return 'neutral';
                const t = text.toLowerCase();
                if (t.includes('victory') || t.includes('clear') || t.includes('answer') || t.includes('together') || 
                    t.includes('hold fast') || t.includes('full burn') || t.includes('sweep') || t.includes('purpose') || 
                    t.includes('ready') || t.includes('locked')) {
                    return 'determined';
                }
                if (t.includes('sorrow') || t.includes('dying') || t.includes('lost') || t.includes('corpse') || 
                    t.includes('graveyard') || t.includes('ghost') || t.includes('goodbye') || t.includes('die') || t.includes('crying') ||
                    t.includes('nightmare') || t.includes('swallowing')) {
                    return 'somber';
                }
                if (t.includes('warning') || t.includes('danger') || t.includes('ambush') || 
                    t.includes('shields down') || t.includes('under attack') || t.includes('taking fire') ||
                    t.includes('redline') || t.includes('rupture') || t.includes('black smoke') || t.includes('crush') ||
                    t.includes('intercept') || t.includes('shearing') || t.includes('pull out') || t.includes('!')) {
                    return 'reactive';
                }
                return 'neutral';
            },

            renderToCanvas(canvasEl, speakerName, text, isTalking, dt = 0.016, explicitMood = null) {
                if (!canvasEl || typeof canvasEl.getContext !== 'function') return;
                const ctx = canvasEl.getContext('2d');
                if (!ctx) return;

                this._animTimer += dt;
                const t = this._animTimer;
                const w = canvasEl.width || 56;
                const h = canvasEl.height || 56;
                const mood = this.getSituationalMood(speakerName, text, explicitMood);
                const spk = SPEAKER_CONFIG[speakerName] || { color: '#00ffff', callsign: '[COMMS]', portrait: 'lyra_neutral' };
                const color = spk.color || '#00ffff';

                // Background
                ctx.fillStyle = '#02040c';
                ctx.fillRect(0, 0, w, h);

                const speakerKey = (speakerName || 'Lyra').toLowerCase();
                let spriteKey = `${speakerKey}_${mood === 'reactive' ? 'reactive' : 'neutral'}`;
                if (typeof portraitSprites !== 'undefined' && !portraitSprites[spriteKey]) {
                    spriteKey = `${speakerKey}_neutral`;
                }

                const sprite = (typeof portraitSprites !== 'undefined') ? portraitSprites[spriteKey] : null;

                if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                    ctx.drawImage(sprite, 0, 0, w, h);

                    // Situational mood color grading
                    if (mood === 'reactive') {
                        ctx.fillStyle = 'rgba(255, 60, 40, 0.18)';
                        ctx.fillRect(0, 0, w, h);
                    } else if (mood === 'determined') {
                        ctx.fillStyle = 'rgba(255, 200, 50, 0.14)';
                        ctx.fillRect(0, 0, w, h);
                    } else if (mood === 'somber') {
                        ctx.fillStyle = 'rgba(30, 80, 160, 0.22)';
                        ctx.fillRect(0, 0, w, h);
                    }

                    // Talking mouth animation flap when text typing is active
                    if (isTalking) {
                        const mouthOpen = Math.sin(t * 22) > 0.15;
                        if (mouthOpen) {
                            ctx.fillStyle = 'rgba(10, 10, 15, 0.75)';
                            ctx.fillRect(w * 0.44, h * 0.68, w * 0.13, h * 0.06);
                        }
                    }

                    // Natural eye blink cycle
                    const blinkCycle = t % 3.6;
                    if (blinkCycle < 0.14) {
                        ctx.fillStyle = color;
                        ctx.fillRect(w * 0.32, h * 0.46, w * 0.12, 2);
                        ctx.fillRect(w * 0.56, h * 0.46, w * 0.12, 2);
                    }
                } else {
                    // Procedural High-Tech Holographic Avatar
                    ctx.save();
                    ctx.fillStyle = 'rgba(4, 10, 24, 0.95)';
                    ctx.fillRect(0, 0, w, h);

                    // Tech grid
                    ctx.strokeStyle = `${color}22`;
                    ctx.lineWidth = 1;
                    for (let x = 8; x < w; x += 12) {
                        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
                    }
                    for (let y = 8; y < h; y += 12) {
                        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
                    }

                    if (speakerKey === 'architect' || speakerKey === 'ophion') {
                        // Precursor Singularity Matrix
                        const rot = t * 1.2;
                        ctx.translate(w / 2, h / 2);
                        ctx.rotate(rot);
                        ctx.strokeStyle = '#cc44ff';
                        ctx.lineWidth = 1.5;
                        ctx.strokeRect(-14, -14, 28, 28);
                        ctx.rotate(-rot * 2);
                        ctx.strokeStyle = '#00ffff';
                        ctx.strokeRect(-9, -9, 18, 18);
                        ctx.rotate(rot);
                        const corePulse = 4 + Math.sin(t * 8) * 1.5;
                        ctx.fillStyle = '#ffffff';
                        ctx.beginPath(); ctx.arc(0, 0, corePulse, 0, Math.PI * 2); ctx.fill();
                    } else if (speakerKey === 'selene') {
                        // Jovian Storm-Singer Solar Corona
                        ctx.translate(w / 2, h / 2);
                        const rayCount = 8;
                        for (let i = 0; i < rayCount; i++) {
                            const angle = (i / rayCount) * Math.PI * 2 + t * 0.8;
                            const r1 = 12 + Math.sin(t * 6 + i) * 3;
                            const r2 = 22 + Math.sin(t * 6 + i) * 4;
                            ctx.strokeStyle = '#ffd700';
                            ctx.lineWidth = 1.5;
                            ctx.beginPath();
                            ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
                            ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
                            ctx.stroke();
                        }
                        ctx.fillStyle = '#ffeedd';
                        ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
                    } else {
                        // Procedural Cyber Pilot Visor Silhouette
                        ctx.fillStyle = `${color}44`;
                        ctx.beginPath();
                        ctx.arc(w / 2, h * 0.45, 14, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = color;
                        const visorY = h * 0.42 + (mood === 'reactive' ? Math.sin(t * 20) * 1.5 : 0);
                        ctx.fillRect(w * 0.28, visorY, w * 0.44, 5);
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 2;
                        ctx.strokeRect(w * 0.22, h * 0.38, 4, 8);
                        ctx.strokeRect(w * 0.72, h * 0.38, 4, 8);
                    }
                    ctx.restore();
                }

                // Animated CRT Raster Scanlines
                ctx.fillStyle = 'rgba(0, 0, 0, 0.26)';
                for (let y = 0; y < h; y += 3) {
                    ctx.fillRect(0, y, w, 1);
                }

                const scanlineY = (t * 42) % h;
                ctx.fillStyle = `${color}44`;
                ctx.fillRect(0, scanlineY, w, 2);

                // Frame Border Glow
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.strokeRect(0.75, 0.75, w - 1.5, h - 1.5);
            }
        };
        if (typeof window !== 'undefined') window.PortraitAnimator = PortraitAnimator;
        if (typeof global !== 'undefined') global.PortraitAnimator = PortraitAnimator;

        

        function triggerDialogueSFX(name, vol) {
            if (typeof window !== 'undefined' && typeof window.playSound === 'function') {
                try { window.playSound(name, vol); } catch(e) {}
            } else if (typeof playSound === 'function') {
                try { playSound(name, vol); } catch(e) {}
            }
        }


        class DialogueSequence {
            constructor(lines, onChoiceCallback = null, blocking = false) {
                this.lines = lines || [];
                this.currentLineIndex = 0;
                this.typedText = "";
                this.charIndex = 0;
                this.typeTimer = 0;
                this.typeSpeed = 0.022; // seconds per character
                this.onChoice = onChoiceCallback;
                this.selectedChoiceIndex = 0;
                this.soundCooldown = 0;
                this.currentLineText = "";
                this.blocking = blocking; // Non-blocking by default
                this.lineDuration = 4.2;  // Auto-advance duration after typing completes
                this.lineTimer = this.lineDuration;
                this.waveformTimer = 0;

                // Play incoming radio squelch chirp
                triggerDialogueSFX('radio_squelch_in');

                if (typeof document !== 'undefined') {
                    const hud = document.getElementById('lyra-hud');
                    if (hud) {
                        hud.onclick = (e) => {
                            const l = this.lines[this.currentLineIndex];
                            if (l && l.choices && this.charIndex >= this.currentLineText.length) {
                                // Choices handled by choice elements
                            } else {
                                triggerDialogueSFX('menu_select');
                                this.next();
                            }
                        };
                        hud.classList.remove('lyra-hud-active');
                        void hud.offsetWidth; // force reflow
                        hud.classList.add('lyra-hud-active');
                    }
                }

                this.initLine();
            }

            isBlocking() {
                return this.blocking;
            }

            interpolate(text) {
                if (typeof text !== 'string') return text;
                return text.replace(/\{\{(\w+)\}\}/g, (match, p1) => {
                    switch (p1) {
                        case 'scrap':
                        case 'runScrap':
                            return (typeof runScrap !== 'undefined') ? runScrap : 0;
                        case 'score':
                            return (typeof score !== 'undefined') ? score : 0;
                        case 'biome':
                            return (typeof activeBiomeName !== 'undefined') ? activeBiomeName : (typeof biomeLevel !== 'undefined' ? biomeLevel : 1);
                        case 'weaponLevel':
                            return (typeof player !== 'undefined' && player) ? player.weaponLevel : 1;
                        case 'shield':
                            return (typeof player !== 'undefined' && player) ? Math.round(player.shield) : 100;
                        case 'ship':
                            return (typeof player !== 'undefined' && player) ? player.shipType.toUpperCase() : 'INTERCEPTOR';
                        default:
                            return match;
                    }
                });
            }

            initLine() {
                this.typedText = "";
                this.charIndex = 0;
                this.typeTimer = 0;
                this.soundCooldown = 0;
                this.lineTimer = this.lineDuration;
                const line = this.lines[this.currentLineIndex];
                if (line) {
                    this.currentLineText = this.interpolate(line.text);
                    if (typeof VoicePlayback !== 'undefined' && VoicePlayback && typeof VoicePlayback.speak === 'function') {
                        VoicePlayback.speak(line.speaker, this.currentLineText);
                    }
                    if (line.onStart) {
                        try { line.onStart(); } catch(e) { console.error(e); }
                    }
                } else {
                    this.currentLineText = "";
                }
            }

            update(dt) {
                const line = this.lines[this.currentLineIndex];
                if (!line) return;

                // Waveform animation
                this.waveformTimer += dt;
                if (typeof document !== 'undefined') {
                    const bars = document.querySelectorAll('.lyra-waveform-bar');
                    if (bars && bars.length > 0) {
                        const isSpeaking = this.charIndex < this.currentLineText.length;
                        bars.forEach((bar, idx) => {
                            if (isSpeaking) {
                                const h = Math.sin(this.waveformTimer * 18 + idx * 0.8) * 4 + 6;
                                bar.style.height = `${Math.max(2, Math.min(10, h))}px`;
                            } else {
                                bar.style.height = '2px';
                            }
                        });
                    }
                }

                // Typewriter effect
                if (this.charIndex < this.currentLineText.length) {
                    this.typeTimer += dt;
                    if (this.typeTimer >= this.typeSpeed) {
                        this.typeTimer = 0;
                        this.typedText += this.currentLineText[this.charIndex];
                        this.charIndex++;
                        
                        this.soundCooldown -= dt;
                        if (this.soundCooldown <= 0) {
                            triggerDialogueSFX('menu_select', 0.2);
                            this.soundCooldown = 0.08;
                        }
                    }
                } else {
                    // Non-blocking auto-advance when typing finishes
                    if (!line.choices) {
                        this.lineTimer -= dt;
                        if (this.lineTimer <= 0) {
                            this.next();
                        }
                    }
                }
            }

            draw() {
                const line = this.lines[this.currentLineIndex];
                if (!line) return;

                if (typeof document !== 'undefined') {
                    const hud = document.getElementById('lyra-hud');
                    if (hud) {
                        if (hud.style.display !== 'block') {
                            hud.style.display = 'block';
                        }

                        // Determine theme color and callsign
                        const spk = SPEAKER_CONFIG[line.speaker] || { color: '#00ffff', callsign: '[TRANSMISSION]' };
                        const speakerColor = spk.color;

                        hud.style.borderColor = speakerColor;
                        hud.style.boxShadow = `0 0 16px ${speakerColor}55, inset 0 0 10px ${speakerColor}22`;

                        const speakerNameEl = document.getElementById('lyra-speaker-name');
                        if (speakerNameEl) {
                            speakerNameEl.innerText = (line.speaker || 'SYSTEM').toUpperCase();
                            speakerNameEl.style.color = speakerColor;
                        }

                        const callsignEl = document.getElementById('lyra-callsign-badge');
                        if (callsignEl) {
                            callsignEl.innerText = spk.callsign || '[COMMS]';
                            callsignEl.style.color = `${speakerColor}aa`;
                        }

                        // Handle holographic animated portrait
                        const portraitCanvas = document.getElementById('lyra-portrait-canvas');
                        const imgEl = document.getElementById('lyra-portrait-img');
                        const noSignalEl = document.getElementById('lyra-no-signal');
                        let showPortrait = true;
                        if (typeof stormActive !== 'undefined' && stormActive && line.speaker === 'Lyra') {
                            showPortrait = false;
                        }

                        if (showPortrait) {
                            if (portraitCanvas) {
                                portraitCanvas.style.display = 'block';
                                const isTalking = this.charIndex < this.currentLineText.length;
                                PortraitAnimator.renderToCanvas(portraitCanvas, line.speaker || 'Lyra', line.text, isTalking, 0.016, line.mood);
                            } else if (imgEl) {
                                const portraitKey = line.portrait || spk.portrait;
                                if (portraitKey && typeof portraitSprites !== 'undefined' && portraitSprites[portraitKey] && portraitSprites[portraitKey].complete && portraitSprites[portraitKey].naturalWidth > 0) {
                                    imgEl.src = portraitSprites[portraitKey].src;
                                    imgEl.style.display = 'block';
                                }
                            }
                            if (noSignalEl) noSignalEl.style.display = 'none';
                        } else {
                            if (portraitCanvas) portraitCanvas.style.display = 'none';
                            if (imgEl) imgEl.style.display = 'none';
                            if (noSignalEl) noSignalEl.style.display = 'block';
                        }

                        // Dialogue Text
                        const textEl = document.getElementById('lyra-dialogue-text');
                        if (textEl) {
                            textEl.innerText = this.typedText;
                        }

                        // Choices or continue prompt
                        const choicesEl = document.getElementById('lyra-choices');
                        const promptEl = document.getElementById('lyra-continue-prompt');

                        if (line.choices && this.charIndex >= this.currentLineText.length) {
                            if (promptEl) promptEl.style.display = 'none';
                            if (choicesEl) {
                                choicesEl.style.display = 'flex';
                                choicesEl.innerHTML = '';
                                line.choices.forEach((choice, idx) => {
                                    const isSelected = this.selectedChoiceIndex === idx;
                                    const option = document.createElement('div');
                                    option.className = 'lyra-choice-option' + (isSelected ? ' selected' : '');
                                    option.innerText = `[${idx+1}] ` + this.interpolate(choice.text);
                                    option.onclick = (e) => {
                                        e.stopPropagation();
                                        this.selectedChoiceIndex = idx;
                                        triggerDialogueSFX('menu_click');
                                        if (this.onChoice) this.onChoice(choice.value);
                                        this.next();
                                    };
                                    choicesEl.appendChild(option);
                                });
                            }
                        } else {
                            if (choicesEl) choicesEl.style.display = 'none';
                            if (promptEl) promptEl.style.display = 'block';
                        }
                    }
                }
            }

            next() {
                const line = this.lines[this.currentLineIndex];
                if (!line) return;

                if (line.choices && this.charIndex >= this.currentLineText.length) {
                    const selected = line.choices[this.selectedChoiceIndex];
                    if (this.onChoice) {
                        this.onChoice(selected.value);
                    }
                    return;
                }

                if (this.charIndex < this.currentLineText.length) {
                    this.typedText = this.currentLineText;
                    this.charIndex = this.currentLineText.length;
                    return;
                }

                if (line.onComplete) {
                    try { line.onComplete(); } catch(e) { console.error(e); }
                }

                this.currentLineIndex++;
                if (this.currentLineIndex >= this.lines.length) {
                    activeDialogue = null;
                    if (typeof VoicePlayback !== 'undefined' && VoicePlayback && typeof VoicePlayback.stop === 'function') {
                        VoicePlayback.stop();
                    }
                    triggerDialogueSFX('radio_squelch_out');
                    if (typeof document !== 'undefined') {
                        const hud = document.getElementById('lyra-hud');
                        if (hud) {
                            hud.style.display = 'none';
                            hud.classList.remove('lyra-hud-active');
                        }
                    }
                } else {
                    this.initLine();
                }
            }

            handleKey(key) {
                const line = this.lines[this.currentLineIndex];
                if (!line) return;

                if (line.choices && this.charIndex >= this.currentLineText.length) {
                    if (key === '1' || key === 'Numpad1' || key === 'ArrowLeft' || key === 'a' || key === 'A') {
                        this.selectedChoiceIndex = 0;
                        triggerDialogueSFX('menu_select');
                        if (key === '1' || key === 'Numpad1') {
                            const selected = line.choices[0];
                            if (this.onChoice) this.onChoice(selected.value);
                            this.next();
                        }
                    } else if (key === '2' || key === 'Numpad2' || key === 'ArrowRight' || key === 'd' || key === 'D') {
                        this.selectedChoiceIndex = 1;
                        triggerDialogueSFX('menu_select');
                        if (key === '2' || key === 'Numpad2') {
                            const selected = line.choices[1];
                            if (this.onChoice) this.onChoice(selected.value);
                            this.next();
                        }
                    } else if (key === 'Enter' || key === ' ') {
                        triggerDialogueSFX('menu_click');
                        const selected = line.choices[this.selectedChoiceIndex];
                        if (this.onChoice) this.onChoice(selected.value);
                        this.next();
                    }
                } else {
                    if (key === 'Enter' || key === ' ' || key === 'Escape') {
                        triggerDialogueSFX('menu_select');
                        this.next();
                    }
                }
            }
        }

        if (typeof window !== 'undefined') {
            window.DialogueSequence = DialogueSequence;
        }
        if (typeof global !== 'undefined') {
            global.DialogueSequence = DialogueSequence;
        }
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = { DialogueSequence, SPEAKER_CONFIG };
        }

        const DIALOGUE_SCENES = {
            scene1: {
                triggerScore: 150,
                lines: [
                    {
                        speaker: 'Lyra',
                        portrait: 'lyra_neutral',
                        text: "Daddy... don't go left. The vents — they're going to blow in sequence. Left channel first, then right, then the center. If you go left you'll be in the middle of it."
                    },
                    {
                        speaker: 'Thorne',
                        portrait: 'thorne_neutral',
                        text: "Darius, our thermal readings show the left channel is stable. Stay on course."
                    },
                    {
                        speaker: 'Darius',
                        portrait: 'darius_neutral',
                        text: "Override decision required. Which channel do we take?",
                        choices: [
                            { text: "Center Channel (Lyra)", value: "center" },
                            { text: "Left Channel (Thorne)", value: "left" }
                        ]
                    }
                ],
                onChoice: function(choiceValue) {
                    if (choiceValue === 'center') {
                        setNarrativeFlag('lyra_trust', 1);
                        activeDialogue = new DialogueSequence([
                            {
                                speaker: 'Darius',
                                portrait: 'darius_neutral',
                                text: "Thorne, I'm overriding. Taking the center channel."
                            },
                            {
                                speaker: 'Thorne',
                                portrait: 'thorne_neutral',
                                text: "Center's a dead end, the coral formations — "
                            },
                            {
                                speaker: 'System',
                                portrait: 'none',
                                text: "[NARRATIVE] The Nyxa boosts through a tight center channel. Behind you, the left channel erupts in a blowout! Superheated vents erupt in massive flares.",
                                onStart: () => {
                                    triggerScreenShake(2.0, 15);
                                    playSound('explosion');
                                }
                            },
                            {
                                speaker: 'Lyra',
                                portrait: 'lyra_reactive',
                                text: "The center opens up in about forty meters. There's a hidden cave — precursor construction. You can slip through. I can... feel the shape of it."
                            },
                            {
                                speaker: 'Darius',
                                portrait: 'darius_neutral',
                                text: "Now what, navigator?"
                            },
                            {
                                speaker: 'Lyra',
                                portrait: 'lyra_neutral',
                                text: "Follow the blue glow. Not the bright one — the dim one, way down low. It's not trying to trick you."
                            }
                        ]);
                    } else {
                        activeDialogue = new DialogueSequence([
                            {
                                speaker: 'Darius',
                                portrait: 'darius_neutral',
                                text: "Thorne's the professional. Sticking to the charted left channel."
                            },
                            {
                                speaker: 'System',
                                portrait: 'none',
                                text: "[WARNING] Thermal vents blowing! Massive thermal surge detected. Direct hit! Shield integrity damaged!",
                                onStart: () => {
                                    triggerScreenShake(3.0, 25);
                                    player.takeDamage(40);
                                    playSound('explosion');
                                }
                            },
                            {
                                speaker: 'Thorne',
                                portrait: 'thorne_neutral',
                                text: "Error! Left channel thermal readings spiking! Pull out, Darius!"
                            },
                            {
                                speaker: 'Lyra',
                                portrait: 'lyra_reactive',
                                text: "Daddy! Get out of there! Veer center now! The blue glow!"
                            },
                            {
                                speaker: 'Darius',
                                portrait: 'darius_neutral',
                                text: "Steering center... Coral cave spotted. We're in, but took heavy damage."
                            }
                        ]);
                    }
                }
            },
            scene2: {
                triggerScore: 500,
                lines: [
                    {
                        speaker: 'System',
                        portrait: 'none',
                        text: "[NARRATIVE] The coral maze begins to collapse as the Memory Wraith's death throes destabilize the sector. Bedrock shuddering."
                    },
                    {
                        speaker: 'Thorne',
                        portrait: 'thorne_neutral',
                        text: "All primary escape routes are sealed. I'm calculating secondary vectors..."
                    },
                    {
                        speaker: 'Lyra',
                        portrait: 'lyra_neutral',
                        text: "Go down."
                    },
                    {
                        speaker: 'Thorne',
                        portrait: 'thorne_neutral',
                        text: "Negative, Lyra. Down is the substrate layer. Solid bedrock for three kilometers. There's nothing down there."
                    },
                    {
                        speaker: 'Lyra',
                        portrait: 'lyra_reactive',
                        text: "Not solid. Not anymore. The Dreamer... it dreamed through it. There's a vein. A hollow vein. Like a crack in a tooth. You can fit."
                    },
                    {
                        speaker: 'Darius',
                        portrait: 'darius_neutral',
                        text: "Lyra's reading matches no scans, but Thorne's exit is blocked. Where do we go?",
                        choices: [
                            { text: "Dive Down (Trust Lyra)", value: "down" },
                            { text: "Stay Course (Trust Thorne)", value: "stay" }
                        ]
                    }
                ],
                onChoice: function(choiceValue) {
                    if (choiceValue === 'down') {
                        setNarrativeFlag('lyra_trust', 1);
                        setNarrativeFlag('dreamer_connection', 1);
                        activeDialogue = new DialogueSequence([
                            {
                                speaker: 'Darius',
                                portrait: 'darius_neutral',
                                text: "Lyra. How sure are you?"
                            },
                            {
                                speaker: 'Lyra',
                                portrait: 'lyra_neutral',
                                text: "I can feel the water moving through it. It's real, Daddy. I promise."
                            },
                            {
                                speaker: 'Darius',
                                portrait: 'darius_neutral',
                                text: "Diving down! Hold on!"
                            },
                            {
                                speaker: 'System',
                                portrait: 'none',
                                text: "[NARRATIVE] The Nyxa plunges into what looks like solid coral bedrock—and passes right through! A illusionary membrane of psychic static reveals a hidden current tunnel.",
                                onStart: () => {
                                    triggerScreenShake(1.5, 10);
                                    player.shield = Math.min(player.maxShield, player.shield + 50); // bonus shield
                                }
                            },
                            {
                                speaker: 'Darius',
                                portrait: 'darius_neutral',
                                text: "We're clear. Lyra... good call."
                            },
                            {
                                speaker: 'Lyra',
                                portrait: 'lyra_reactive',
                                text: "I told you. I can feel the shape of things."
                            }
                        ]);
                    } else {
                        activeDialogue = new DialogueSequence([
                            {
                                speaker: 'Darius',
                                portrait: 'darius_neutral',
                                text: "Cannot risk smashing solid bedrock. Thorne, give me that secondary vector!"
                            },
                            {
                                speaker: 'System',
                                portrait: 'none',
                                text: "[WARNING] Debris collision! Substrate collapse! Hull damage sustained!",
                                onStart: () => {
                                    triggerScreenShake(3.0, 30);
                                    player.takeDamage(35);
                                    playSound('explosion');
                                }
                            },
                            {
                                speaker: 'Lyra',
                                portrait: 'lyra_reactive',
                                text: "Daddy! The wall is falling! You have to go down, please!"
                            },
                            {
                                speaker: 'Darius',
                                portrait: 'darius_neutral',
                                text: "Fine! Heading down! Bedrock is... hollow! We are inside the vein!"
                            }
                        ]);
                    }
                }
            },
            scene3: {
                triggerScore: 1350,
                lines: [
                    {
                        speaker: 'Cross',
                        portrait: 'cross_neutral',
                        text: "You're boxed, Star. Three squadrons converging on your position. Surrender the components and I'll let you walk."
                    },
                    {
                        speaker: 'Lyra',
                        portrait: 'lyra_reactive',
                        text: "Daddy — the ice shard at bearing 217. The big one, the one that looks like a broken tooth. Fly INTO it."
                    },
                    {
                        speaker: 'Darius',
                        portrait: 'darius_neutral',
                        text: "Lyra, that's a solid ice mass. I'll pancake."
                    },
                    {
                        speaker: 'Lyra',
                        portrait: 'lyra_neutral',
                        text: "No. It's hollow. The Dreamer dreamed a cavity inside. A tunnel network. I can see the whole path. Please."
                    },
                    {
                        speaker: 'Darius',
                        portrait: 'darius_neutral',
                        text: "Umbra fighters locking missiles. Do we trust Lyra or engage?",
                        choices: [
                            { text: "Trust Lyra (Fly Into Ice)", value: "ice" },
                            { text: "Fight Squadron (Engage)", value: "engage" }
                        ]
                    }
                ],
                onChoice: function(choiceValue) {
                    if (choiceValue === 'ice') {
                        setNarrativeFlag('lyra_trust', 1);
                        setNarrativeFlag('dreamer_connection', 1);
                        activeDialogue = new DialogueSequence([
                            {
                                speaker: 'Darius',
                                portrait: 'darius_neutral',
                                text: "Trusting you, starlight. Banking hard!"
                            },
                            {
                                speaker: 'System',
                                portrait: 'none',
                                text: "[NARRATIVE] The Nyxa flies straight at the ice shard's surface. At the last possible moment, a fissure opens, bioluminescent Dreamer-matter pulsing. The ship slides through as Cross's torpedoes detonate harmlessly against the ice.",
                                onStart: () => {
                                    triggerScreenShake(2.0, 15);
                                    startCavernNavigation();
                                }
                            },
                            {
                                speaker: 'Lyra',
                                portrait: 'lyra_neutral',
                                text: "I can see the path in my head. Left fork in twenty meters... now!"
                            },
                            {
                                speaker: 'Darius',
                                portrait: 'darius_neutral',
                                text: "Steering left! Cavern is narrow!"
                            },
                            {
                                speaker: 'Lyra',
                                portrait: 'lyra_neutral',
                                text: "Slow down for the next chamber — there's something resting in there, don't wake it..."
                            },
                            {
                                speaker: 'Lyra',
                                portrait: 'lyra_reactive',
                                text: "Okay, you're past. Right turn!"
                            },
                            {
                                speaker: 'Lyra',
                                portrait: 'lyra_neutral',
                                text: "Surface exit in three hundred meters. Cross is waiting on the far side, but she doesn't know which exit you'll take. Pick the northern one."
                            },
                            {
                                speaker: 'Darius',
                                portrait: 'darius_neutral',
                                text: "Exiting northern corridor! We are clear. Cross is out of position!"
                            }
                        ]);
                    } else {
                        setNarrativeFlag('power_lust', 1);
                        activeDialogue = new DialogueSequence([
                            {
                                speaker: 'Darius',
                                portrait: 'darius_neutral',
                                text: "I'm not running. Let's see how good Squadron Umbra really is."
                            },
                            {
                                speaker: 'System',
                                portrait: 'none',
                                text: "[WARNING] Incoming Umbra squad! Tactical ambush! Taking fire!",
                                onStart: () => {
                                    triggerScreenShake(3.0, 20);
                                    player.takeDamage(40);
                                    for(let i=0; i<3; i++) enemies.push(new Enemy('interceptor'));
                                }
                            },
                            {
                                speaker: 'Lyra',
                                portrait: 'lyra_reactive',
                                text: "Daddy! Shields are failing! Get into the ice cavern, it's the only way!"
                            },
                            {
                                speaker: 'Darius',
                                portrait: 'darius_neutral',
                                text: "Too many of them! Banking into the shard fissure!"
                            },
                            {
                                speaker: 'System',
                                portrait: 'none',
                                text: "[NARRATIVE] Darius plunges the damaged Nyxa into the ice shard fissure, escaping Cross's main squadron.",
                                onStart: () => {
                                    startCavernNavigation();
                                }
                            },
                            {
                                speaker: 'Lyra',
                                portrait: 'lyra_neutral',
                                text: "Left fork... now! Then right turn. Exiting North!"
                            }
                        ]);
                    }
                }
            },
            scene4: {
                triggerScore: 1810,
                blocking: false,
                lines: [
                    {
                        speaker: 'System',
                        portrait: 'none',
                        text: "[NARRATIVE] Navy attunement accelerator strike on Haven-7. Lyra has suffered neural overload and fallen into a deep coma."
                    },
                    {
                        speaker: 'Thorne',
                        portrait: 'thorne_neutral',
                        text: "Without Lyra's navigation, we're flying standard instruments through an environment where standard instruments are useless. Wind shear will throw off your vector. Lightning will fry your guidance. You're on your own, Darius."
                    },
                    {
                        speaker: 'Darius',
                        portrait: 'darius_neutral',
                        text: "Wake up soon, starlight. I don't know how to do this without you."
                    },
                    {
                        speaker: 'System',
                        portrait: 'none',
                        text: "[EFFECT] Lyra is offline. No navigator route warnings. Wind shear active. Lightning storm active.",
                        onStart: () => {
                            stormActive = true;
                            setNarrativeFlag('sacrifice_seen', 1);
                        }
                    }
                ]
            },
            scene5: {
                triggerScore: 2410,
                blocking: false,
                lines: [
                    {
                        speaker: 'System',
                        portrait: 'none',
                        text: "[NARRATIVE] Lyra awakens, her eyes glowing with a steady bioluminescent cyan light. A layered harmonic echo accompanies her voice."
                    },
                    {
                        speaker: 'Lyra',
                        portrait: 'lyra_reactive',
                        text: "...Daddy?"
                    },
                    {
                        speaker: 'Darius',
                        portrait: 'darius_neutral',
                        text: "Lyra! You're awake."
                    },
                    {
                        speaker: 'Lyra',
                        portrait: 'lyra_neutral',
                        text: "I had to go deep to come back. I saw everything. The Dreamer isn't trying to hurt us. It's trapped in a loop of its own fear. Like a whale tangled in a net, thrashing, and we're the plankton."
                    },
                    {
                        speaker: 'Lyra',
                        portrait: 'lyra_reactive',
                        text: "The Hive is going to try to confuse you. It'll show you routes that look safe. They're traps. Let me guide you. Please."
                    },
                    {
                        speaker: 'Darius',
                        portrait: 'darius_neutral',
                        text: "Tell me where to go."
                    },
                    {
                        speaker: 'System',
                        portrait: 'none',
                        text: "[EFFECT] Lyra is back online. Pathfinding overlay enabled.",
                        onStart: () => {
                            stormActive = false;
                            pathfinderActive = true;
                            setNarrativeFlag('dreamer_connection', 1);
                            setNarrativeFlag('sacrifice_seen', 1);
                        }
                    }
                ]
            }
        };

        // Event-driven dialogue triggering (GRO-2163)
        if (typeof EventBus !== 'undefined') {
            EventBus.on('score:changed', (newScore) => {
                for (const sceneKey in DIALOGUE_SCENES) {
                    const scene = DIALOGUE_SCENES[sceneKey];
                    if (newScore >= scene.triggerScore && !dialogueCompletedScenes[sceneKey] && !activeDialogue) {
                        dialogueCompletedScenes[sceneKey] = true;
                        const isSceneBlocking = scene.blocking !== undefined ? scene.blocking : true;
                        activeDialogue = new DialogueSequence(scene.lines, scene.onChoice, isSceneBlocking);
                        break;
                    }
                }
            });
        }

        function updateActiveBiome(dt, score) {
            let oldBiome = activeBiomeName;
            let oldBiomeLevel = biomeLevel;

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('score:changed', score);
            }

            if (window.LevelManager) {
                LevelManager.update(dt, score);
                biomeLevel = LevelManager.currentBiome;
            } else {
                if (score < 300) {
                    activeBiomeName = '1: Abyssal Trench'; biomeLevel = 1;
                } else if (score < 600) {
                    activeBiomeName = '2: Coral Graveyard'; biomeLevel = 2;
                } else if (score < 900) {
                    activeBiomeName = '3: Coelacanth Lair'; biomeLevel = 3;
                } else if (score < 1200) {
                    activeBiomeName = '4: Nebula Drift'; biomeLevel = 4;
                } else if (score < 1500) {
                    activeBiomeName = '5: Ice Ring'; biomeLevel = 5;
                } else if (score < 1800) {
                    activeBiomeName = '6: Fire Nebula'; biomeLevel = 6;
                } else if (score < 2100) {
                    activeBiomeName = '7: Storm Belt'; biomeLevel = 7;
                } else if (score < 2400) {
                    activeBiomeName = '8: Derelict Fleet'; biomeLevel = 8;
                } else if (score < 2700) {
                    activeBiomeName = '9: Xenomorph Hive'; biomeLevel = 9;
                } else {
                    activeBiomeName = '10: Core Rift'; biomeLevel = 10;
                }
            }

            const biomeNames = {
                1: '1: Abyssal Trench',
                2: '2: Coral Graveyard',
                3: '3: Coelacanth Lair',
                4: '4: Nebula Drift',
                5: '5: Ice Ring',
                6: '6: Fire Nebula',
                7: '7: Storm Belt',
                8: '8: Derelict Fleet',
                9: '9: Xenomorph Hive',
                10: '10: Core Rift'
            };
            activeBiomeName = biomeNames[biomeLevel] || '1: Abyssal Trench';

            if (window.LevelManager && uiBiome) {
                uiBiome.innerText = `BIOME: ${activeBiomeName} — LEVEL: ${LevelManager.currentLevel}`;
            } else if (uiBiome) {
                uiBiome.innerText = `BIOME: ${activeBiomeName}`;
            }

            if (oldBiome !== activeBiomeName) {
                floatingTexts.push(new FloatingText(canvas.width / 2, canvas.height / 3, `ENTERING BIOME ${activeBiomeName.toUpperCase()}`, '#00ffff'));
                
                // Update both parallax layers with biome-specific far/near backgrounds
                setBiomeBackgrounds(biomeLevel);

                // GRO-1028: Play biome-specific ambient drone on transition
                // GRO-1040: Respect audioTunnelsEnabled toggle
                if (audioTunnelsEnabled) triggerBiomeAmbient();
                // GRO-1028: Trigger audio-only story beat for this biome
                if (audioTunnelsEnabled) playAudioStoryBeat(biomeLevel);
            }

            if (window.maxBiomeReached === undefined) {
                window.maxBiomeReached = oldBiomeLevel || biomeLevel || 1;
            }

            if (biomeLevel > window.maxBiomeReached) {
                // Loop through all un-entered intermediate biomes
                for (let b = window.maxBiomeReached + 1; b <= biomeLevel; b++) {
                    // Narrative flags for intermediate biomes
                    if (b === 3) setNarrativeFlag('dreamer_connection', 1);
                    if (b === 6) setNarrativeFlag('cross_defected', 1);
                    if (b === 10) {
                        setNarrativeFlag('coelacanth_mercy', 1);
                        setNarrativeFlag('power_lust', 1);
                    }
                    if (window.Economy) {
                        Economy.newSegment();
                    }
                }
                
                window.maxBiomeReached = biomeLevel;

                // Campaign Save System: save checkpoint on entering a new biome
                if (window.CampaignSave && typeof player !== 'undefined') {
                    let activeSaveSlot = parseInt(localStorage.getItem('dariusStar_activeSlot') || '0');
                    const save = CampaignSave.load(activeSaveSlot);
                    const currentLives = save ? save.lives : 3;
                    CampaignSave.checkpoint(activeSaveSlot, {
                        biome: biomeLevel,
                        wave: window.LevelManager ? LevelManager.currentLevel : 1,
                        score: score,
                        runScrap: runScrap,
                        ship: player.shipType,
                        weaponLevel: player.weaponLevel,
                        shieldMax: player.shieldMax,
                        shield: player.shield,
                        difficulty: difficulty,
                        banterEnabled: banterEnabled,
                        audioTunnelsEnabled: audioTunnelsEnabled,
                        streamerMode: streamerMode,
                        subtitlesEnabled: typeof subtitlesEnabled !== 'undefined' ? subtitlesEnabled : true,
                        lives: currentLives,
                        inGameFlags: narrativeFlags,
                    });
                    console.log(`Saved Campaign Checkpoint in slot ${activeSaveSlot}: Biome ${biomeLevel}, Lives ${currentLives}`);
                }
            }

            if (oldBiome !== activeBiomeName) {
                // Transition environmental particles to new biome
                if (typeof envParticles !== 'undefined') {
                    envParticles.length = 0;
                    envSpawnAccum = 0;
                    const biomeSeeds = {
                        1: 'mote', 2: 'rust_flake', 3: 'coolant_drip', 4: 'plasma_ribbon',
                        5: 'ice_crystal', 6: 'ember', 7: 'rain_drop', 8: 'debris',
                        9: 'spore', 10: 'code_stream'
                    };
                    const seedType = biomeSeeds[biomeLevel] || 'mote';
                    for (let i = 0; i < Math.min(30, 10 + biomeLevel * 3); i++) {
                        envParticles.push(new EnvironmentParticle(seedType));
                    }
                    if (typeof envBuffer !== 'undefined') envBuffer.markDirty();
                }
        }
    }

