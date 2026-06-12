// js/ui/dialogue.js — Dialogue system (GRO-1062: extracted from ui.js)
// DialogueBox, PortraitRenderer, CommsOverlay classes
// Loaded after ui.js, before level_manager.js

        // --- Dialogue System Classes & Data ---
        let activeDialogue = null;
        let dialogueCompletedScenes = {};

        class DialogueSequence {
            constructor(lines, onChoiceCallback = null) {
                this.lines = lines;
                this.currentLineIndex = 0;
                this.typedText = "";
                this.charIndex = 0;
                this.typeTimer = 0;
                this.typeSpeed = 0.025; // seconds per character
                this.onChoice = onChoiceCallback;
                this.selectedChoiceIndex = 0;
                this.soundCooldown = 0;
                this.initLine();
            }

            initLine() {
                this.typedText = "";
                this.charIndex = 0;
                this.typeTimer = 0;
                this.soundCooldown = 0;
                const line = this.lines[this.currentLineIndex];
                if (line && line.onStart) {
                    line.onStart();
                }
            }

            update(dt) {
                const line = this.lines[this.currentLineIndex];
                if (!line) return;

                if (this.charIndex < line.text.length) {
                    this.typeTimer += dt;
                    if (this.typeTimer >= this.typeSpeed) {
                        this.typeTimer = 0;
                        this.typedText += line.text[this.charIndex];
                        this.charIndex++;
                        
                        this.soundCooldown -= dt;
                        if (this.soundCooldown <= 0) {
                            playSound('menu_select');
                            this.soundCooldown = 0.12;
                        }
                    }
                }
            }

            draw() {
                const line = this.lines[this.currentLineIndex];
                if (!line) return;

                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const boxX = 60;
                const boxY = canvas.height - 135;
                const boxW = canvas.width - 120;
                const boxH = 95;

                // Glowing border box
                ctx.fillStyle = 'rgba(8, 8, 20, 0.9)';
                ctx.fillRect(boxX, boxY, boxW, boxH);
                ctx.strokeStyle = line.speaker === 'Lyra' ? '#00ffff' : (line.speaker === 'Cross' ? '#ff00ff' : (line.speaker === 'Thorne' ? '#00ff55' : '#ffaa00'));
                ctx.shadowColor = ctx.strokeStyle;
                ctx.shadowBlur = 6;
                ctx.lineWidth = 2;
                ctx.strokeRect(boxX, boxY, boxW, boxH);
                ctx.shadowBlur = 0;

                // Character Name Header
                ctx.fillStyle = ctx.strokeStyle;
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'left';
                ctx.fillText(line.speaker.toUpperCase(), boxX + 110, boxY + 22);

                // Portrait Box
                const px = boxX + 12;
                const py = boxY + 12;
                const pSize = 70;
                ctx.fillStyle = '#020208';
                ctx.fillRect(px, py, pSize, pSize);
                ctx.strokeStyle = '#2a2a4a';
                ctx.lineWidth = 1;
                ctx.strokeRect(px, py, pSize, pSize);

                let showPortrait = true;
                if (stormActive && line.speaker === 'Lyra') {
                    showPortrait = false; // Lyra offline / blank during Biomes 7-8 coma
                }

                if (showPortrait && line.portrait && portraitSprites[line.portrait] && portraitSprites[line.portrait].complete && portraitSprites[line.portrait].naturalWidth > 0) {
                    ctx.drawImage(portraitSprites[line.portrait], px, py, pSize, pSize);
                    if (portraitSprites['comms_overlay'] && portraitSprites['comms_overlay'].complete) {
                        ctx.drawImage(portraitSprites['comms_overlay'], px, py, pSize, pSize);
                    }
                } else {
                    ctx.fillStyle = '#100505';
                    ctx.fillRect(px + 4, py + 4, pSize - 8, pSize - 8);
                    ctx.fillStyle = '#ff3355';
                    ctx.font = '9px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('NO SIGNAL', px + pSize / 2, py + pSize / 2 + 3);
                }

                // Dialogue Text
                ctx.fillStyle = '#ffffff';
                ctx.font = '10px monospace';
                ctx.textAlign = 'left';
                wrapText(ctx, this.typedText, boxX + 110, boxY + 38, boxW - 130, 14);

                // Choices or continue prompt
                if (line.choices && this.charIndex >= line.text.length) {
                    const startChoiceY = boxY + 74;
                    line.choices.forEach((choice, idx) => {
                        const isSelected = this.selectedChoiceIndex === idx;
                        ctx.fillStyle = isSelected ? '#ffd700' : '#8a8a9f';
                        ctx.font = isSelected ? 'bold 10px monospace' : '10px monospace';
                        const optionText = (isSelected ? "> " : "  ") + choice.text;
                        ctx.fillText(optionText, boxX + 110 + idx * 210, startChoiceY);
                    });
                } else {
                    ctx.fillStyle = '#4a4a5f';
                    ctx.font = '8px monospace';
                    ctx.textAlign = 'right';
                    ctx.fillText('CLICK / ENTER to continue', boxX + boxW - 12, boxY + boxH - 8);
                }

                ctx.restore();
            }

            next() {
                const line = this.lines[this.currentLineIndex];
                if (!line) return;

                if (line.choices && this.charIndex >= line.text.length) {
                    const selected = line.choices[this.selectedChoiceIndex];
                    if (this.onChoice) {
                        this.onChoice(selected.value);
                    }
                    return;
                }

                if (this.charIndex < line.text.length) {
                    this.typedText = line.text;
                    this.charIndex = line.text.length;
                    return;
                }

                if (line.onComplete) {
                    line.onComplete();
                }

                this.currentLineIndex++;
                if (this.currentLineIndex >= this.lines.length) {
                    activeDialogue = null;
                } else {
                    this.initLine();
                }
            }

            handleKey(key) {
                const line = this.lines[this.currentLineIndex];
                if (!line) return;

                if (line.choices && this.charIndex >= line.text.length) {
                    if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
                        this.selectedChoiceIndex = 0;
                        playSound('menu_select');
                    } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
                        this.selectedChoiceIndex = 1;
                        playSound('menu_select');
                    } else if (key === 'Enter' || key === ' ') {
                        playSound('menu_click');
                        this.next();
                    }
                } else {
                    if (key === 'Enter' || key === ' ' || key === 'Escape') {
                        playSound('menu_select');
                        this.next();
                    }
                }
            }
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

        function updateActiveBiome(dt, score) {
            let oldBiome = activeBiomeName;
            let oldBiomeLevel = biomeLevel;

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
                // Notify Economy of new segment for loot tracking
                if (window.Economy && oldBiomeLevel !== biomeLevel) {
                    Economy.newSegment();
                }

                // Narrative flags: entering biome 3 (Coelacanth Lair) — dreamer connection deepens
                if (biomeLevel === 3) setNarrativeFlag('dreamer_connection', 1);
                // GRO-1045: Cross defects at B5 level_end — set flag on B6 entry
                if (biomeLevel === 6) setNarrativeFlag('cross_defected', 1);
                // Biome 10 (Core Rift) — final confrontation, all flags intensify
                if (biomeLevel === 10) {
                    setNarrativeFlag('coelacanth_mercy', 1);
                    setNarrativeFlag('power_lust', 1);
                }

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

