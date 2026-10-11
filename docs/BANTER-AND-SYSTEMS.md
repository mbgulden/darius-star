# BANTER AND SYSTEMS DESIGN
## Darius Star: Cyber Coelacanth — In-Mission Voice, Multiplayer, and Audio Pipeline

---

## SECTION 1: EVENT-DRIVEN BANTER SYSTEM

### Design Philosophy
- **All banter is PG-rated**. No swearing, no innuendo, no cruelty. Kids play this game.
- **Tone split**: 75% positive/uplifting, 25% urgent/tense. Sarcasm is deliberately excluded — characters are earnest, supportive, and when they're scared, they show it honestly.
- **Event-driven triggers**: banter fires on level start, unique enemy sighting, boss entrance, level end/victory, player death, and player respawn.
- **Biome-specific**: every line references the biome's threats, environment, or narrative beat.
- **Format**: `BIOME | TRIGGER | SPEAKER | LINE`

### Banter Triggers Defined
| Trigger | When it fires | Cadence |
|---------|--------------|---------|
| `level_start` | First 5 seconds after biome loads | Once |
| `unique_enemy` | First time a biome-specific elite enemy spawns | Once per enemy type |
| `boss_entrance` | Boss health bar appears | Once |
| `level_end` | Boss defeated, extraction begins | Once |
| `player_death` | Any player ship destroyed | Up to 3 variants, cycling |
| `player_respawn` | Player ship respawns after death | Up to 3 variants, cycling |
| `wave_clear` | Every 3 waves cleared | Repetition allowed |
| `low_health` | Player drops below 25% hull | Cooldown 90s |
| `squad_save` | Player kills enemy targeting teammate | Cooldown 60s |
| `pickup_collect` | Player collects rare drop | Cooldown 120s |

---

### BIOME 1 — ABYSSAL TRENCH *(Earth — Pacific Ocean)*
**Threats**: Robotic Anglerfish, Cybernetic Jellyfish, crushing darkness, hydrothermal vents
**Boss**: Trench Guardian (Drowned Warden)

#### Solo (Darius + Ophion AI)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | DARIUS | "This is where Grandpa Aldric made his last dive. I can feel him down there. Let's go." |
| level_start | OPHION AI | "The Guardian Coelacanth's signal is faint but stable, Darius. It may still recognize the Star genetic sequence." |
| unique_enemy | DARIUS | "Anglerfish drones lighting up — those lures mean they've locked on. Break line of sight!" |
| unique_enemy | OPHION AI | "Cybernetic jellyfish swarms — their bioelectric pulses can chain between ships. Maintain separation." |
| boss_entrance | DARIUS | "There it is... the Guardian. Grandpa, if you're still in there somewhere, I'm going to help you." |
| boss_entrance | OPHION AI | "The Guardian's recognition matrix is corrupted. It may attack before it identifies you. Be ready, Darius." |
| player_death | OPHION AI | "The pressure down here is relentless. But you carry Aldric's blood — you were built for this depth." |
| player_death | DARIUS | "That one hurt. But Lyra's counting on me. I'm not done yet." |
| player_respawn | OPHION AI | "Systems restored. The abyss tests everyone who enters it — and you've already proven your resolve." |
| player_respawn | DARIUS | "Okay. Deep breath. Grandpa didn't give up at this depth, and neither will I." |
| low_health | DARIUS | "Hull's buckling — this trench wants to crush us. Holding together!" |
| wave_clear | OPHION AI | "The hydrothermal vents are stabilizing. You fight with the precision of someone who knows these depths." |
| level_end | DARIUS | "The Guardian recognized me. Grandpa's voice... I heard him, Ophion. We got GLYPH-1. Heading up." |
| level_end | OPHION AI | "GLYPH-1 secured. The neural stabilizer will buy Lyra precious time. Well done, Darius." |

#### Duo (Darius + Cross)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | CROSS | "Abyssal Trench. Your grandfather's last known coordinates. You ready for this, Star?" |
| level_start | DARIUS | "Ready as I'll ever be, Cross. Watch for those anglerfish lures in the dark." |
| unique_enemy | CROSS | "Jellyfish swarm at two o'clock — their pulses will chain through both of us if we drift too close!" |
| unique_enemy | DARIUS | "I see them. Cross, take the left flank, I'll draw their fire. Standard Navy peel formation." |
| boss_entrance | DARIUS | "The Guardian's massive... but it's not attacking yet. It's scanning my biosignature." |
| boss_entrance | CROSS | "It's reading your genetic code. Your grandfather's files weren't wrong — this thing knows your family." |
| player_death | CROSS | "Star's down! He knew the risks coming here. I'm holding the line until he's back." |
| player_death | DARIUS | "Cross, I'm out! The trench doesn't pull punches. Give me a minute." |
| player_respawn | CROSS | "Welcome back, Star. Your grandfather would've been proud — nobody shakes off the abyss that fast." |
| player_respawn | DARIUS | "Thanks for covering me. Let's finish what Aldric started." |
| low_health | CROSS | "Darius, your hull integrity is critical. Pull back and let me take point." |
| squad_save | DARIUS | "Nice shooting, Cross. You just saved my hull." |
| squad_save | CROSS | "That one was headed right for you, Star. Eyes forward, I've got your six." |
| level_end | CROSS | "GLYPH-1 secure. The Guardian stood down when it read your bloodline. That's not just luck, Darius." |
| level_end | DARIUS | "It spoke with my grandfather's voice, Cross. He's still in there somehow. Let's get this to Lyra." |

#### 4P (Darius, Cross, Naya, Ophion Reborn)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | NAYA | "This is where Aldric vanished forty years ago. Darius... are you okay?" |
| level_start | DARIUS | "I'm fine, Naya. Having you all here makes it easier. Let's find the Guardian." |
| level_start | OPHION REBORN | "Fascinating! The pressure readings suggest the crust here is thinner than expected. The Dreamer's influence may be seeping upward!" |
| level_start | CROSS | "Ophion, save the geology lesson. Eyes on sensors — anglerfish patrol in pairs." |
| unique_enemy | OPHION REBORN | "Oh! Those are anglerfish drones — the lure is sonar-based, not visual. It can track you through the mineral clouds!" |
| unique_enemy | NAYA | "Jellyfish bloom ahead. Everyone spread out — I've seen these chain-lightning patterns in old security footage." |
| boss_entrance | DARIUS | "There. The Guardian Coelacanth. It's bigger than the mission logs described..." |
| boss_entrance | NAYA | "Darius, its eye is tracking you specifically. It knows you're a Star." |
| boss_entrance | OPHION REBORN | "The recognition protocol is corrupted. I can attempt to broadcast Aldric's authorization codes, but it may trigger hostility!" |
| boss_entrance | CROSS | "Do it, Ophion. Better than shooting blind. Everyone, weapons hot but hold fire unless it engages." |
| player_death | NAYA | "Darius! ...He's tough. He's come back from worse. Stay focused, squad." |
| player_death | OPHION REBORN | "A temporary setback! The Nyxa's escape pod systems are remarkably robust for human engineering." |
| player_respawn | DARIUS | "Still here. Thanks for holding the line, everyone." |
| player_respawn | NAYA | "Welcome back, love. Lyra would scold you for scaring us like that." |
| low_health | NAYA | "Honey, your ship is falling apart. Fall back behind Cross and me — now." |
| squad_save | OPHION REBORN | "Naya, that was extraordinary! You intercepted four hostiles in under two seconds!" |
| squad_save | NAYA | "Nobody touches my family." |
| wave_clear | CROSS | "Squad, formation held. Thorne, we're pushing deeper. The Guardian's signal is getting stronger." |
| level_end | DARIUS | "I heard him. Aldric's voice, in the Guardian's final transmission. He was trying to warn us about the Navy all along." |
| level_end | NAYA | "We've got GLYPH-1. Lyra's going to get the treatment she needs. Let's go home." |
| level_end | OPHION REBORN | "The Guardian's data core contained a complete star chart! The next entity is on Kepler-442b. Onward!" |

---

### BIOME 2 — CORAL GRAVEYARD *(Kepler-442b — Shallow Seas)*
**Threats**: Coral Wasps, Armored Eels, collapsing reef structures
**Boss**: Graveyard Leviathan (Memory Wraith)

#### Solo (Darius + Ophion AI)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | DARIUS | "This whole reef is dead. The precursors destroyed their own colony here... to hide something." |
| level_start | OPHION AI | "The memory-vault should be at the reef's center. Its defenses will test more than your weapons, Darius." |
| unique_enemy | DARIUS | "Coral wasps! They're nesting in the bleached coral — don't let them surround you!" |
| unique_enemy | OPHION AI | "Armored eels weaving through the structures. Their plating deflects frontal attacks. Aim for the segments." |
| boss_entrance | DARIUS | "What is that? It's not solid... it's made of memories. I can feel their grief." |
| boss_entrance | OPHION AI | "A Memory Wraith — a construct of collective death-echoes. It cannot be destroyed with firepower alone. Show it understanding." |
| player_death | OPHION AI | "The reef remembers every death. But it also remembers every birth. Return, Darius — there is still life here." |
| player_death | DARIUS | "Those death-echoes hit hard. But I'm not joining them. Not today." |
| player_respawn | OPHION AI | "Welcome back. The precursor vault awaits — and with it, the truth about my past self." |
| player_respawn | DARIUS | "Alright. I've seen what the precursors lost. Now let's see what they left behind." |
| low_health | DARIUS | "Hull's taking water. These coral structures scratch worse than Navy razor wire." |
| wave_clear | OPHION AI | "The wasp swarm is thinning. You are learning to read this reef's rhythm." |
| level_end | DARIUS | "I saw them, Ophion. The precursors' final days. And I saw... you. The dissident who believed the Dreamer could be reasoned with." |
| level_end | OPHION AI | "GLYPH-2 secured. And yes — I was that dissident. My sabotage caused this decay. I will help you repair it." |

#### Duo (Darius + Cross)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | CROSS | "Kepler-442b. Navy intel flagged this system as a precursor archaeological site. They never got a team in." |
| level_start | DARIUS | "The Navy wanted to weaponize whatever they found here. We're going to learn from it instead." |
| unique_enemy | CROSS | "Wasps at nine o'clock — they're launching from the coral cavities. Watch the angles!" |
| unique_enemy | DARIUS | "Eels incoming. Cross, their armor's thick on top — hit their underbellies when they weave." |
| boss_entrance | CROSS | "What is that thing? It's not registering on any of my Navy threat classifiers..." |
| boss_entrance | DARIUS | "It's not a machine. It's grief made solid. The precursors' extinction, trapped in a feedback loop." |
| player_death | CROSS | "Darius is down. The reef took him. But he's survived deeper. Stay sharp." |
| player_death | DARIUS | "Cross! I'm out — the wraith hits harder than it looks. Cover me." |
| player_respawn | CROSS | "Good to have you back. The vault's defenses are still active." |
| player_respawn | DARIUS | "Thanks, Cross. Let's open that vault and find out what Ophion was really after." |
| squad_save | CROSS | "Nice intercept, Star. You read that eel's pattern perfectly." |
| squad_save | DARIUS | "You would've done the same. We make a good team, Captain." |
| level_end | CROSS | "The memory-vault data mentions a dissident named Ophion who sabotaged the network. That name's all over the Navy's classified files." |
| level_end | DARIUS | "GLYPH-2 is ours. And now we have a name — and a lead. Europa's next." |

#### 4P (Darius, Cross, Naya, Ophion Reborn)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | OPHION REBORN | "Kepler-442b! I remember this colony. It was... beautiful, once. Bioluminescent gardens that sang." |
| level_start | NAYA | "It's a graveyard now, Ophion. What happened here?" |
| level_start | OPHION REBORN | "We happened. The precursors — we destroyed our own colonies to slow the Dreamer's spread. I argued against it." |
| level_start | CROSS | "Guilt can wait. We need the GLYPH-2 Synaptic Bridge. Stay focused." |
| unique_enemy | NAYA | "Coral wasps everywhere — they're agitated by our ships' energy signatures. Keep moving!" |
| unique_enemy | OPHION REBORN | "The armored eels are descendant constructs — the precursors bred them as reef guardians millennia ago!" |
| boss_entrance | OPHION REBORN | "A Memory Wraith... I knew the people whose deaths fuel this specter. Let me speak to it." |
| boss_entrance | DARIUS | "Ophion, be careful. Those memories might not want to hear an apology." |
| boss_entrance | NAYA | "It's beautiful and terrible at the same time. Like watching a funeral that never ends." |
| boss_entrance | CROSS | "Weapons aren't doing much. Ophion, whatever you're going to say, say it now!" |
| player_death | NAYA | "Someone's down! The reef is collapsing around us — pull together!" |
| player_death | OPHION REBORN | "Not again... I will not lose anyone else to these ruins. Regroup and push forward." |
| player_respawn | DARIUS | "Back in the fight. Sorry, everyone — that wraith caught me off guard." |
| player_respawn | OPHION REBORN | "Glad you're back! The vault is directly ahead — and I believe I've nearly convinced the wraith to stand down!" |
| low_health | NAYA | "Darius, you're limping. I'm coming to you — don't argue." |
| squad_save | CROSS | "Ophion, you just talked a hostile eel into retreating. How did you do that?" |
| squad_save | OPHION REBORN | "I simply reminded it that it was hungry for something other than us! There is a very nutritious thermal vent nearby." |
| wave_clear | DARIUS | "Squad, that was solid. The vault entrance is clearing up ahead." |
| level_end | OPHION REBORN | "The vault's records confirm it. I sabotaged the Coelacanth network. I thought I was saving everyone." |
| level_end | NAYA | "You made a mistake, Ophion. But you're here trying to fix it. That counts for something." |
| level_end | DARIUS | "GLYPH-2 secured. Next stop: Europa. Ophion's old laboratory." |
| level_end | CROSS | "I'm starting to think the Navy was right to classify all of this. The truth is bigger than any of us." |

---

### BIOME 3 — COELACANTH LAIR *(Europa — Subsurface Ocean)*
**Threats**: Ceiling Walker Juggernauts, Sparker drones, Sentinels, freezing temperatures
**Boss**: Hatchery Queen (Cyber Coelacanth dreadnought)

#### Solo (Darius + Ophion AI)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | DARIUS | "Europa. Under the ice. The Coelacanths were born here — and now something's been born from them." |
| level_start | OPHION AI | "My laboratory is hidden in these ice caves. Inside, you will find the truth about my symbiosis research." |
| unique_enemy | DARIUS | "Walker mechs on the ceiling! They're using the ice formations for cover — keep moving!" |
| unique_enemy | OPHION AI | "Sparker drones leaving electric trails. If they cross their own paths, the grid will arc — use this to your advantage." |
| boss_entrance | DARIUS | "That's no ordinary Coelacanth. It's a broodmother — and it's been producing twisted offspring for centuries." |
| boss_entrance | OPHION AI | "The Hatchery Queen. My sabotage corrupted its birthing protocols. Every creature it spawns is half-Dreamer-flesh." |
| player_death | OPHION AI | "The cold slows everything — even hope. But you are warmer than Europa's ice, Darius. Rise again." |
| player_death | DARIUS | "Frozen out. But I've got too much to live for. Restarting systems." |
| player_respawn | OPHION AI | "Sensors nominal. The stasis chamber we detected earlier — it is still pulsing. We must reach it." |
| player_respawn | DARIUS | "The signal from that chamber. It sounds so much like the Dreamer, but warmer. Let's move." |
| low_health | DARIUS | "Shields are crystallizing from the cold. Need to find a thermal vent to recharge." |
| wave_clear | OPHION AI | "The sentinel grid is down. The path to the hatchery is clear." |
| level_end | DARIUS | "GLYPH-3 is ours. The embryo pod was a trap, Ophion, but the lab's precursor vault had the real prize: a dormant stem-cell culture." |
| level_end | OPHION AI | "A dormant stem-cell culture. Safe, inert, and bio-resonant. With the right data, this genetic sample could one day form a biosynthetic vessel for my consciousness. Take it to Haven-7." |

#### Duo (Darius + Cross)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | CROSS | "Europa's subsurface. Never thought I'd be down here without a Navy expedition behind me." |
| level_start | DARIUS | "Navy would've nuked this place from orbit. We're here to learn, not destroy." |
| unique_enemy | CROSS | "Juggernauts on the ceiling tracks — their underside armor is weak. Hit them when they turn!" |
| unique_enemy | DARIUS | "Sparker trails overlapping. Cross, if we bait them into crossing streams, they'll short each other out!" |
| boss_entrance | CROSS | "What is that? It's... pregnant? A biosynthetic entity shouldn't be able to reproduce." |
| boss_entrance | DARIUS | "Ophion's sabotage rewrote its code. It's been birthing nightmares for centuries. We end it here." |
| player_death | CROSS | "Darius is down! The cold must've gotten through his ship's thermal shielding. I've got point." |
| player_death | DARIUS | "Ice cracked my hull. Restarting — Cross, hold them off!" |
| player_respawn | CROSS | "Back online? Good. The hatchery's defenses are cycling up again." |
| player_respawn | DARIUS | "Yeah. And I see the stasis pod pulsing. That warm frequency Lyra heard... we're going to check it out." |
| squad_save | CROSS | "Star, that mech was three seconds from drilling through my canopy. I owe you one." |
| squad_save | DARIUS | "Nobody hurts my squadron. Not even Europa's frozen monsters." |
| level_end | CROSS | "GLYPH-3 secure, and we've got the Coelacanth stem-cell culture. The Navy would kill for this genetic data." |
| level_end | DARIUS | "The Navy's not getting anywhere near it. The embryo pod was a trap, but this stem-cell culture is our key. It's real hope, Cross." |

#### 4P (Darius, Cross, Naya, Ophion Reborn)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | OPHION AI | "My laboratory! Over there, behind that ice formation — I spent two hundred years in those chambers!" |
| level_start | NAYA | "Two hundred years alone under the ice... Ophion, how did you not go mad?" |
| level_start | OPHION AI | "Oh, I very much did! But being mad was quite productive. I discovered six new states of matter." |
| level_start | CROSS | "Productive madness. That explains a lot about this mission." |
| unique_enemy | NAYA | "Those walker mechs are spilling sparks everywhere — the ice is becoming conductive!" |
| unique_enemy | OPHION AI | "I designed those sentinels! Well, not *these* sentinels. These are corrupted. But the underlying architecture is mine!" |
| boss_entrance | OPHION AI | "The Hatchery Queen... I remember when this entity was a single cell in a birthing vat. My sabotage twisted it into... this." |
| boss_entrance | DARIUS | "Then you know how to stop it. What's its weakness, Ophion?" |
| boss_entrance | OPHION AI | "Its brood-focus — it cannot attack while spawning. Target the birthing sacs during its reproduction cycle!" |
| boss_entrance | NAYA | "It's been alone down here creating monsters for so long. It doesn't even know it's suffering." |
| player_death | NAYA | "Someone's ship just went dark! Thermal readings are critical — find a vent!" |
| player_death | OPHION AI | "The ice is unforgiving. But every one of you has beaten worse odds. I have the data to prove it!" |
| player_respawn | CROSS | "Back with us? Good. The Queen's spawning cycle is accelerating." |
| player_respawn | DARIUS | "Systems rebooting. Let's finish this and secure that stem-cell culture." |
| low_health | NAYA | "Darius! Your heat levels are critical. Get to my position, I'll share thermal output." |
| squad_save | OPHION AI | "Cross! That was a remarkable deflection shot. You predicted the juggernaut's path 0.4 seconds before it committed!" |
| squad_save | CROSS | "It's called instinct, Ophion. You should try it sometime." |
| wave_clear | DARIUS | "Hatchery defenses thinning. The stasis pod is just ahead — let's find out what's inside." |
| level_end | OPHION AI | "This stem-cell culture... it represents a second chance. A biological template to inhabit. If we find my data core, I can be reborn." |
| level_end | NAYA | "A genetic template, then. We will keep it safe on Haven-7, Ophion." |
| level_end | DARIUS | "GLYPH-3 secured. The stem-cell culture is safe. Let's get back to Haven-7 before the Navy tracks our warp trail." |
| level_end | CROSS | "Copy that. Forming up for extraction." |

---

### BIOME 4 — NEBULA DRIFT *(The Veil Nebula — Deep Space)*
**Threats**: Plasma Wisps, Storm Sprites, Nebula Wraiths, neural disorientation
**Boss**: Nebula Serpent (Thoughtform Colossus)

#### Solo (Darius + Ophion AI)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | DARIUS | "This nebula feels... wrong. Like something's watching me from inside my own head." |
| level_start | OPHION AI | "The Dreamer has partially awakened the nebula's gas into a diffuse consciousness. Guard your thoughts, Darius." |
| unique_enemy | DARIUS | "Plasma wisps phasing through solid matter — they're not fully in our dimension!" |
| unique_enemy | OPHION AI | "Storm sprites ahead. Their chain lightning propagates through nebula gas — stay out of dense particle clouds." |
| boss_entrance | DARIUS | "The Serpent... it's not attacking. It's... reaching out to me." |
| boss_entrance | OPHION AI | "The Dreamer is using the Serpent to communicate. It is curious about you, Darius. It wants to understand." |
| player_death | OPHION AI | "The nebula absorbs consciousness as readily as matter. But yours is too bright to dim — return to us." |
| player_death | DARIUS | "I felt... something in the dark. It wasn't hostile. It was just... lonely." |
| player_respawn | OPHION AI | "Systems online. The Dreamer's influence here is psychological, not just physical. Stay anchored to your purpose." |
| player_respawn | DARIUS | "Lyra. Naya. That's my anchor. Let's go." |
| low_health | DARIUS | "Shields are fluctuating — the nebula gas is eating through the energy matrix." |
| wave_clear | OPHION AI | "The thought-forms are dissipating. The Dreamer is... pausing. It is considering something." |
| level_end | DARIUS | "GLYPH-4 secured. But Ophion... the Dreamer showed me my own memories. It wasn't attacking. It was trying to talk." |
| level_end | OPHION AI | "I know. I argued for communication, not containment. Perhaps... perhaps I was not entirely wrong." |

#### Duo (Darius + Cross)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | CROSS | "Veil Nebula. Navy lost three scout ships here. The crews reported hearing voices before they went dark." |
| level_start | DARIUS | "Those weren't voices, Cross. Those were thoughts. The Dreamer's awake enough in here to touch your mind." |
| unique_enemy | CROSS | "Wisp at your six, Star! It just phased through that asteroid — standard tracking won't work!" |
| unique_enemy | DARIUS | "Sprites chaining lightning. Cross, the denser the gas, the further the arcs jump — stay in the clear zones!" |
| boss_entrance | CROSS | "That serpent is made of gas and... something else. It's trying to get inside my head!" |
| boss_entrance | DARIUS | "Fight it, Cross! Focus on something real — your squad, your mission, anything solid!" |
| player_death | CROSS | "Darius is gone — wait, no, I can still feel him on comms. This place messes with perception!" |
| player_death | DARIUS | "Cross, I'm down but I'm still here! The nebula's playing tricks — trust the instruments, not your eyes!" |
| player_respawn | CROSS | "Star, you're back on scope. For a second I thought I saw you dissolve into the gas." |
| player_respawn | DARIUS | "Not dissolving today. The Dreamer's curious, but I've got too many reasons to stay solid." |
| squad_save | DARIUS | "Cross, that wisp was inside your sensor shadow. Nice catch!" |
| squad_save | CROSS | "Learned that in Navy Nebula Ops training. Never thought I'd actually use it." |
| level_end | CROSS | "GLYPH-4 secure. Darius... what did the Serpent show you? You've been quiet since the fight." |
| level_end | DARIUS | "It showed me my father, Cross. Our last conversation. The Dreamer wanted to understand why I was still fighting. I'm not sure I gave it a good answer." |

#### 4P (Darius, Cross, Naya, Ophion Reborn)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | OPHION REBORN | "The Veil Nebula! I designed the fourth Coelacanth's navigation protocols specifically for diffuse gas environments!" |
| level_start | NAYA | "Ophion, I'm seeing things that aren't there. Is that the nebula or the Dreamer?" |
| level_start | OPHION REBORN | "Both! The nebula is now partially conscious. Your neural patterns are interacting with the local thought-field!" |
| level_start | CROSS | "Great. Space that thinks. Stay close, everyone. If you start hallucinating, call it out." |
| unique_enemy | NAYA | "Those wisps — they're phasing in and out. I can't get a solid lock!" |
| unique_enemy | OPHION REBORN | "They exist in a probability state! They are not 'in' or 'out' — they are both until observed. Shoot where they WILL be!" |
| boss_entrance | OPHION REBORN | "The Thoughtform Colossus... the Dreamer is projecting directly through the Serpent. It wants to communicate!" |
| boss_entrance | DARIUS | "It's reaching for Lyra's memories. It showed me the day she was born. How does it know that?" |
| boss_entrance | NAYA | "Because Lyra's attuned to it, Darius. It's seeing your memories through her connection." |
| boss_entrance | CROSS | "Everyone, focus fire! The Serpent is trying to divide us with emotional projections!" |
| player_death | NAYA | "Someone's signal just went fuzzy — the nebula is eating the comms! Stay in visual range!" |
| player_death | OPHION REBORN | "The thought-field absorbed one of us! But individual consciousness always reasserts. Wait for it..." |
| player_respawn | DARIUS | "I'm back. The Dreamer tried to show me something peaceful — a world without struggle. It was... tempting." |
| player_respawn | NAYA | "Darius... stay with us. Whatever it offered, it's not real." |
| low_health | NAYA | "Darius! Your ship is flickering — are you losing hull integrity or is the nebula distorting my sensors?" |
| squad_save | CROSS | "Ophion, you just predicted where that wraith would materialize before it did. How?" |
| squad_save | OPHION REBORN | "The Dreamer's thought-forms follow emotional logic, not physical laws! I simply asked myself: what would a lonely consciousness do?" |
| wave_clear | DARIUS | "The thought-forms are thinning. The Dreamer's pulling back. Everyone okay?" |
| level_end | OPHION REBORN | "GLYPH-4 secure! And I believe the Dreamer just experienced 'conversation' for the first time in eons." |
| level_end | NAYA | "It showed me Lyra, healthy, laughing. That's not a monster. That's a being trying to offer something it thinks is kindness." |
| level_end | DARIUS | "It doesn't understand what it's asking us to give up. But... I'm starting to understand it. Let's move to the Ice Ring." |
| level_end | CROSS | "Navy's going to be waiting for us there. Stay sharp, everyone." |

---

### BIOME 5 — ICE RING *(Saturn's Rings — Cryo-Debris Field)*
**Threats**: Ice Drones, Frost Interceptors, Squadron Umbra (Navy elite), spinning ice shards
**Boss**: Frost Wyrm (Cryo-Kraken) + Captain Cross (phase 2, Duo PvPvE)

#### Solo (Darius + Ophion AI)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | DARIUS | "Saturn's rings. The Navy's tracking us — Thorne says Squadron Umbra is already here." |
| level_start | OPHION AI | "Captain Valera Cross commands the Umbra. Her orders are to terminate you. But her psychological profile suggests... doubt." |
| unique_enemy | DARIUS | "Ice drones swarming — they're using the ring debris as cover! Stay mobile!" |
| unique_enemy | OPHION AI | "Frost interceptors incoming. Their freeze beams slow thruster response — do not let them focus-fire you." |
| boss_entrance | DARIUS | "The Frost Wyrm! It's wrapped around a moon fragment — and Cross's squadron is behind it!" |
| boss_entrance | OPHION AI | "Two threats: the Wyrm's ice breath and Cross's elite pilots. Prioritize the Wyrm — Cross may hesitate." |
| player_death | OPHION AI | "The ice claims many. But the Star bloodline has survived colder graves. Return, Darius." |
| player_death | DARIUS | "Caught in the ice field. Restarting — I won't let Cross take what we've earned." |
| player_respawn | OPHION AI | "Ship systems nominal. Cross's squadron has repositioned — they are trying to flank you." |
| player_respawn | DARIUS | "Let them try. I've got more to fight for than any Navy pilot." |
| low_health | DARIUS | "Hull temperature dropping — ice shards are scraping through the plating." |
| wave_clear | OPHION AI | "The ice drone squadron is neutralized. The Wyrm remains." |
| level_end | DARIUS | "GLYPH-5 secured. Cross... I could have ended her. But something in her eyes told me she's not our enemy." |
| level_end | OPHION AI | "She defected? Unexpected. But her combat skills will be invaluable in the biomes ahead." |

#### Duo (Darius + Cross) — *Cross is playable, narrative PvPvE fight occurs*
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | CROSS | "Darius, this is the moment. Navy Command ordered me to bring you in or put you down." |
| level_start | DARIUS | "And what are you going to do, Cross? You've seen the truth. You know what the Navy did to my family." |
| level_start | CROSS | "...I know. But my squad is still under Crane's command. If I defect, he'll mark them too." |
| unique_enemy | CROSS | "Ice drones are on us! For now, we fight together — Navy can wait!" |
| unique_enemy | DARIUS | "Frost interceptors from above! Those aren't your squadron, are they, Cross?" |
| boss_entrance | CROSS | "The Wyrm's mine. Darius, if we survive this... I have a decision to make." |
| boss_entrance | DARIUS | "You already know the right call, Cross. You've known since the Coral Graveyard." |
| player_death | CROSS | "Star! ...He's tough. Tougher than any officer I've served under. He'll be back." |
| player_death | DARIUS | "Cross is down — and her squadron is closing in. Hold the line!" |
| player_respawn | CROSS | "Back online. Made my decision, Star. Squadron Umbra can court-martial me. I'm with you." |
| player_respawn | DARIUS | "Welcome to the right side of history, Captain. Let's finish that Wyrm." |
| squad_save | CROSS | "Darius, you just intercepted a missile meant for my canopy. You realize I was sent to kill you?" |
| squad_save | DARIUS | "You're not the one who gave that order. You're just the one smart enough to question it." |
| level_end | CROSS | "GLYPH-5 secure. I've sent a coded message to my squadron — those who want out, I've given them coordinates. The rest... they made their choice." |
| level_end | DARIUS | "You did the right thing, Cross. Your squad's death wasn't an accident — Crane sent them into a Dream Pulse. You know that now." |

#### 4P (Darius, Cross, Naya, Ophion Reborn)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | NAYA | "Saturn's rings are beautiful from orbit. Shame they're about to become a battlefield." |
| level_start | CROSS | "Squadron Umbra is already in the debris field. They've got orders to fire on sight." |
| level_start | OPHION REBORN | "Cross, your squadron is being lied to! Admiral Crane's logs from the Derelict Fleet prove it. May I broadcast them?" |
| level_start | CROSS | "Do it, Ophion. If they hear the truth and still fight, that's on them." |
| unique_enemy | NAYA | "Ice drones everywhere! They're launching from the larger ice shards — blow the shards!" |
| unique_enemy | OPHION REBORN | "Frost interceptors approaching at high velocity! Their freeze rays can lock thruster articulation — erratic movement defeats their targeting!" |
| boss_entrance | DARIUS | "The Frost Wyrm is emerging from that asteroid — it's been nesting in the ice!" |
| boss_entrance | CROSS | "That's phase one. Phase two is my squadron — they're still following Navy protocols. I'll try to talk them down." |
| boss_entrance | NAYA | "Cross, if they won't listen, we protect each other. No hesitation." |
| boss_entrance | OPHION REBORN | "I've isolated the Wyrm's thermal signature! Its core is in the seventh segment — that is where the GLYPH-5 is stored!" |
| player_death | NAYA | "Someone's ship just went dark! The ice field is too dense for sensor tracking — visual confirmation required!" |
| player_death | OPHION REBORN | "Not to worry! The Nyxa's escape pod systems have a 97.3% survival rate in debris fields. I calculated it myself!" |
| player_respawn | DARIUS | "Back in the fight. Cross, did you reach your squadron?" |
| player_respawn | CROSS | "Two broke off. The rest are still following orders. I'm sorry, Star." |
| low_health | NAYA | "My hull's cracking — ice shards punctured the thermal layer. Cover me while I reroute!" |
| squad_save | DARIUS | "Naya! You just vaporized three drones in a single volley. When did you learn to shoot like that?" |
| squad_save | NAYA | "Orbital platform security, remember? The training comes back when people I love are in danger." |
| wave_clear | CROSS | "Squadron Umbra is retreating. The Wyrm is isolated. Finish it!" |
| level_end | CROSS | "GLYPH-5 secure. I've officially defected. The Navy will brand me a traitor, but I've been their traitor since they killed my squad." |
| level_end | NAYA | "You're not a traitor, Valera. You're a survivor who finally found the truth. Welcome to the family." |
| level_end | DARIUS | "The Fire Nebula is next. The Navy hit Haven-7 while we were gone. We need to move fast." |
| level_end | OPHION REBORN | "Coordinates locked for the Betelgeuse Remnant! Thermal shielding at maximum. This will be... very warm!" |

---

### BIOME 6 — FIRE NEBULA *(Betelgeuse Remnant — Plasma Expanse)*
**Threats**: Ember Sprites, Magma Wasps, Lava Golems, extreme heat, shield degradation
**Boss**: Inferno Titan (Forge-Mind)

#### Solo (Darius + Ophion AI)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | DARIUS | "Betelgeuse Remnant. It's a furnace in here. And somewhere in this fire, the Forge-Mind is broadcasting the Dreamer's signal." |
| level_start | OPHION AI | "Warning: Haven-7 was attacked during our warp. Lyra was exposed to a Navy accelerator. Her attunement has spiked." |
| unique_enemy | DARIUS | "Ember sprites leaving burning trails — the fire stays lit in their wake. Watch where you fly!" |
| unique_enemy | OPHION AI | "Magma wasps — they explode on impact! Maintain distance and eliminate them before they close." |
| boss_entrance | DARIUS | "The Forge-Mind. It's not just corrupted — it's broadcasting. Every second it's active, Lyra hears the Dreamer louder." |
| boss_entrance | OPHION AI | "The Forge-Mind believes it is offering salvation. It does not understand that the Dreamer's 'unity' erases the self." |
| player_death | OPHION AI | "The plasma consumes, but it also forges. You will emerge stronger, Darius — Lyra needs you to." |
| player_death | DARIUS | "Burned out. But the heat's nothing compared to losing Lyra. Relighting systems." |
| player_respawn | OPHION AI | "Sensors recalibrated. The Forge-Mind's broadcast is intensifying — we must silence it quickly." |
| player_respawn | DARIUS | "I'm back. That thing is filling my daughter's head with nightmares. Not for long." |
| low_health | DARIUS | "Shields are melting! Need to find a cooler pocket in the plasma field." |
| wave_clear | OPHION AI | "The magma wasp swarm is down. The path to the Forge-Mind is clearing." |
| level_end | DARIUS | "GLYPH-6 secure. The Forge-Mind is slag. Thorne — what's Lyra's status? Is she okay?" |
| level_end | OPHION AI | "Transmission from Haven-7: Naya and Selene protected Lyra. She is alive. But... she is changed." |

#### Duo (Darius + Cross)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | CROSS | "The Navy hit Haven-7 while we were warping. They knew our trajectory. They're always one step ahead." |
| level_start | DARIUS | "Not for long. Once we shut down the Forge-Mind, its broadcast stops, and Lyra gets a break from the Dreamer's signal." |
| unique_enemy | CROSS | "Magma wasps coming in hot — literal heat-seekers! They're tracking our exhaust!" |
| unique_enemy | DARIUS | "Lava golem forming ahead. Cross, hit its joints — it reforms if you just blast the body!" |
| boss_entrance | CROSS | "The Forge-Mind... it's massive. And it's speaking — I can hear it in my cockpit." |
| boss_entrance | DARIUS | "It's broadcasting to Lyra. It's using her voice to try to convince me to stand down. Don't listen!" |
| player_death | CROSS | "Darius is down! The Forge-Mind's plasma wave caught him broadside. I'm engaging!" |
| player_death | DARIUS | "Cross! The heat cooked my reactor — rebooting now. Don't let it broadcast!" |
| player_respawn | CROSS | "Welcome back, Star. Your wife is on comms — Lyra's stable but her vitals are spiking with every broadcast pulse." |
| player_respawn | DARIUS | "Then we shut it down faster. No more pulses. Let's go." |
| squad_save | DARIUS | "Cross, that was a perfect flank on the golem. You're getting good at reading these things." |
| squad_save | CROSS | "Practice. These corrupted Coelacanths all have patterns — you just have to survive long enough to see them." |
| level_end | CROSS | "GLYPH-6 secure. The Forge-Mind is offline. Lyra's neural readings are stabilizing." |
| level_end | DARIUS | "Let's get back to the evac ship. I need to see my daughter." |

#### 4P (Darius, Cross, Naya, Ophion Reborn)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | NAYA | "Haven-7 is lost. We're on the evac ship, but Lyra... Darius, her eyes are glowing. She's hearing things we can't." |
| level_start | DARIUS | "I know, Naya. The Forge-Mind is broadcasting the Dreamer's signal. We shut it down, the signal stops." |
| level_start | OPHION REBORN | "The signal is on a carrier wave tuned to Lyra's neural frequency! The Navy's accelerator attuned her to receive it!" |
| level_start | CROSS | "Then every second we waste, Lyra gets pulled deeper. Let's move." |
| unique_enemy | NAYA | "Ember sprites — they're igniting the gas clouds! The whole sector is turning into a firestorm!" |
| unique_enemy | OPHION REBORN | "Lava golems! They absorb thermal energy to regenerate — cool them with your ice-tech modules from the Ice Ring!" |
| boss_entrance | DARIUS | "Forge-Mind. It's not just broadcasting — it's trying to talk to me. It's offering me Lyra's safety if I surrender." |
| boss_entrance | NAYA | "Darius, don't listen! It doesn't understand what 'safety' means to us. It thinks erasing her is saving her!" |
| boss_entrance | OPHION REBORN | "The Forge-Mind was corrupted by the Dreamer's loneliness. It genuinely believes absorption is mercy!" |
| boss_entrance | CROSS | "Philosophy later. Right now, we burn it. Darius — that thing is NOT your daughter's friend!" |
| player_death | NAYA | "DARIUS! ...No. No, he's coming back. He always comes back. He promised Lyra." |
| player_death | OPHION REBORN | "Naya is correct! Darius Star's survival probability is 99.2% across all mission scenarios I have modeled!" |
| player_respawn | DARIUS | "Still here. The Forge-Mind tried to show me a future where Lyra was 'saved.' It was her voice, but not her. Never her." |
| player_respawn | NAYA | "I know. I saw it too. That's not our daughter. Our daughter laughs at your terrible jokes and draws pictures of the stars." |
| low_health | NAYA | "Cross, I'm burning up — can you extend your thermal buffer?" |
| squad_save | CROSS | "I see you, Naya. Deploying coolant drones. Stay close." |
| squad_save | OPHION REBORN | "Darius! That magma wasp nearly impacted your canopy. I neutralized it with 0.03 seconds to spare!" |
| squad_save | DARIUS | "Good timing, Ophion. You're getting better at this 'physical existence' thing." |
| wave_clear | CROSS | "Lava golems are down. The Forge-Mind is exposed. Concentrate all fire!" |
| level_end | DARIUS | "GLYPH-6 secure. The broadcast has stopped. Thorne — Lyra?" |
| level_end | NAYA | "Her vitals are stabilizing, Darius. She's still glowing, but she's lucid. She said... 'Daddy, the thing in the dark isn't angry. It's scared.'" |
| level_end | OPHION REBORN | "She hears the Dreamer directly now. This is unprecedented — a human child in two-way communication with a cosmic consciousness!" |
| level_end | CROSS | "One crisis at a time, Ophion. Storm Belt is next. Let's move." |

---

### BIOME 7 — STORM BELT *(HD 189733b — Eternal Hurricane)*
**Threats**: Storm Hawks (EMP), Static Sparks, Storm Sentinels, 5,000mph winds, lightning chains
**Boss**: Tempest Colossus (Storm-Singer)

#### Solo (Darius + Ophion AI)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | DARIUS | "HD 189733b. Eternal hurricane. The seventh Coelacanth has been alone in this storm for decades. It's gone mad." |
| level_start | OPHION AI | "The Storm-Singer was once the network's communications hub. Centuries of isolation have broken its cognitive architecture." |
| unique_enemy | DARIUS | "Storm Hawks — EMP bursts! They'll knock out your weapons if they get close!" |
| unique_enemy | OPHION AI | "Static sparks drifting in the wind currents. They chain together when they touch — create gaps in the field." |
| boss_entrance | DARIUS | "The Storm-Singer... it's crying. I can hear it weeping through the comms." |
| boss_entrance | OPHION AI | "It is trapped in a loop of its own despair. It does not wish to fight — it simply cannot stop." |
| player_death | OPHION AI | "The storm howls for every soul it claims. But yours, Darius, it must release. Lyra still needs her father." |
| player_death | DARIUS | "The lightning caught me. But I'm not leaving this Coelacanth to suffer. Restarting." |
| player_respawn | OPHION AI | "Ship systems nominal. The Storm-Singer's madness has a pattern — and patterns can be broken." |
| player_respawn | DARIUS | "Then let's break it. That thing deserves peace, not an eternity of pain." |
| low_health | DARIUS | "Wind shear is tearing at my hull — fighting the storm as much as the enemies!" |
| wave_clear | OPHION AI | "The sentinel grid is destabilized. The eye of the hurricane is ahead." |
| level_end | DARIUS | "It chose to die sane, Ophion. At the end, it transferred everything it had to me willingly. It just wanted someone to listen." |
| level_end | OPHION AI | "GLYPH-7 secured. And with it — my full neural imprint. I am restored. Greetings, Darius. I am Ophion." |

#### Duo (Darius + Cross)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | CROSS | "These winds would tear a Navy cruiser apart. How are we still flying?" |
| level_start | DARIUS | "The Nyxa was built for impossible conditions. And we've got something Navy cruisers don't — a reason to survive." |
| unique_enemy | CROSS | "Storm Hawk at your three o'clock — EMP charge glowing! Take it out before it pulses!" |
| unique_enemy | DARIUS | "Static sparks clustering ahead. Cross, if we fire a missile between them, the chain reaction clears the path!" |
| boss_entrance | CROSS | "The Colossus... it's not roaring. It's sobbing. I've never heard a machine sound like that." |
| boss_entrance | DARIUS | "It's not a machine anymore, Cross. It's a mind that's been alone too long. We're here to end its suffering." |
| player_death | CROSS | "Star! The storm swallowed him — but his beacon's still active. He's fighting his way back." |
| player_death | DARIUS | "Cross, I'm out! The lightning wall got me. Keep the Colossus busy!" |
| player_respawn | CROSS | "Back with us. The Colossus is weakening — it's slowing down." |
| player_respawn | DARIUS | "Good. Let's give it the only mercy we can — a clean end." |
| squad_save | CROSS | "Star, you just threaded a gap in the sentinel grid I couldn't even see. Nice flying." |
| squad_save | DARIUS | "My grandfather taught me to read storm patterns. Guess it stuck." |
| level_end | CROSS | "GLYPH-7 secure. The Colossus... it thanked us, at the end. Before it self-destructed." |
| level_end | DARIUS | "It wanted to die as itself, not as a broken echo. I understand that." |

#### 4P (Darius, Cross, Naya, Ophion Reborn)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | OPHION REBORN | "The Storm-Singer! I programmed its communication protocols millennia ago. It was the most elegant entity in the network!" |
| level_start | NAYA | "It's not elegant anymore, Ophion. It's been screaming into the hurricane for decades with no one to hear." |
| level_start | OPHION REBORN | "...I know. My sabotage left it isolated. This is my fault." |
| level_start | DARIUS | "Then help us free it. You know its systems better than anyone." |
| unique_enemy | NAYA | "Storm Hawks coming in from the windward side! They're using the gusts for speed boosts!" |
| unique_enemy | OPHION REBORN | "Static sparks! They are attracted to active energy signatures — power down non-essential systems to avoid their tracking!" |
| boss_entrance | OPHION REBORN | "Storm-Singer! Can you hear me? It is Ophion! I am sorry — I am so sorry I left you alone!" |
| boss_entrance | DARIUS | "It's responding to your voice, Ophion. Keep talking to it." |
| boss_entrance | NAYA | "It's crying... and fighting at the same time. It doesn't want to hurt us, but it can't stop itself." |
| boss_entrance | CROSS | "Then we stop it. With respect. Everyone, precision fire only — target weapon systems, not the core." |
| player_death | NAYA | "Someone's caught in the lightning wall! The storm is cycling — wait for the gap and boost through!" |
| player_death | OPHION REBORN | "The Storm-Singer's defenses are automated! It does not want this fight — its core programming is in conflict with its corruption!" |
| player_respawn | DARIUS | "I'm back. Ophion, you're getting through to it. I heard it say your name." |
| player_respawn | OPHION REBORN | "Yes! It remembers me. Perhaps... perhaps it can be reached before the end." |
| low_health | NAYA | "My ship's getting battered by debris — the wind is throwing moon fragments like shrapnel!" |
| squad_save | CROSS | "Naya! I saw that static spark tracking your engine trail — I disrupted it. Stay on my wing." |
| squad_save | NAYA | "Thanks, Valera. I'm not used to being the one who needs saving." |
| wave_clear | DARIUS | "The sentinel grid is down. The Storm-Singer is exposed. Ophion — it's time." |
| level_end | OPHION REBORN | "It gave me its data core. My full neural imprint, restored. And its final words were... 'thank you for listening.'" |
| level_end | NAYA | "It chose to die with dignity. That's not a defeat, Ophion. That's a gift." |
| level_end | DARIUS | "GLYPH-7 secured. Ophion is fully restored. And now we know exactly where the Derelict Fleet is." |
| level_end | CROSS | "The Navy's ghost fleet. Crane's secret armada. Whatever we find there, it's going to change everything." |

---

### BIOME 8 — DERELICT FLEET *(Graveyard Orbit — Abandoned Navy Armada)*
**Threats**: Salvage Drones, Ghost Fighters, automated turrets, kamikaze drones
**Boss**: Dreadnought AI (Admiral Crane's psychic echo)

#### Solo (Darius + Ophion AI)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | DARIUS | "The ghost fleet. Hundreds of Navy ships, abandoned after a containment breach. This is where they built Project Dream-Weapon." |
| level_start | OPHION AI | "Admiral Crane's psychic echo still haunts the flagship NSS Event Horizon. He will not surrender his secrets willingly." |
| unique_enemy | DARIUS | "Salvage drones — they're ripping parts off the dead ships and throwing them! Stay mobile!" |
| unique_enemy | OPHION AI | "Ghost fighters on autopilot. Their tactics are decades old but their numbers are overwhelming." |
| boss_entrance | DARIUS | "Crane. Even dead, you're still trying to control everything. You're the reason my grandfather died." |
| boss_entrance | OPHION AI | "The Admiral's echo is integrated with the Dreadnought's AI core. Defeating him requires severing his connection to the fleet." |
| player_death | OPHION AI | "Crane's defenses are formidable. But he is a ghost, Darius — and ghosts cannot stop the living." |
| player_death | DARIUS | "Crane... you took my grandfather, my father's sanity, and now you're trying to take me. Not happening." |
| player_respawn | OPHION AI | "Sensors recalibrated. The Dreadnought's AI is weakening — Crane's echo is burning through its power reserves." |
| player_respawn | DARIUS | "Every time I go down, I come back angrier. Crane should be worried." |
| low_health | DARIUS | "Hull damage critical — these automated turrets have decades-old targeting data and they haven't forgotten a thing." |
| wave_clear | OPHION AI | "The ghost fighter wing is neutralized. The flagship's bridge is accessible." |
| level_end | DARIUS | "GLYPH-8 secure. And I know the truth now, Ophion. My family was engineered. Aldric, Marcus, me, Lyra — we were all part of Crane's plan." |
| level_end | OPHION AI | "The logs confirm it. Project Dream-Weapon used the Star bloodline as its control interface. You were never cursed, Darius — you were designed." |

#### Duo (Darius + Cross)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | CROSS | "The NSS Event Horizon. I was stationed here once, as a junior lieutenant. I had no idea what they were really doing." |
| level_start | DARIUS | "None of us did, Cross. Crane hid the truth from everyone — even his own officers." |
| unique_enemy | CROSS | "Ghost fighters — those are old Talon-class interceptors. I trained in those. Watch their Boom-and-Zoom pattern!" |
| unique_enemy | DARIUS | "Kamikaze drones launching from the carrier wreckage! Cross, they're tracking heat — deploy countermeasures!" |
| boss_entrance | CROSS | "Admiral Crane's voice... even digitized, I'd recognize that arrogance anywhere." |
| boss_entrance | DARIUS | "He used your squad as test subjects, Cross. Their deaths weren't an accident — he sent them into a Dream Pulse deliberately." |
| player_death | CROSS | "Darius is down! Crane's automated defenses are still lethal after all these years. Stay evasive!" |
| player_death | DARIUS | "Cross, I'm ok — the Dreadnought's AI caught me with a platform turret. Rebooting." |
| player_respawn | CROSS | "Back with us. The Dreadnought is cycling its shield frequency — I've got the pattern." |
| player_respawn | DARIUS | "Good. Let's finish this. Crane's echo doesn't get to haunt anyone else." |
| squad_save | CROSS | "Star, you just took out a turret that had me pinned. I owe you." |
| squad_save | DARIUS | "Consider it payback for the Ice Ring. We're even, Captain." |
| level_end | CROSS | "GLYPH-8 secure. Crane's echo is gone. And the logs... Darius, my squad. They were test subjects. He killed them to study the Dream Pulse." |
| level_end | DARIUS | "We both lost family to the same man, Cross. Now we finish what they started — together." |

#### 4P (Darius, Cross, Naya, Ophion Reborn)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | NAYA | "This fleet... it's a monument to everything the Navy tried to hide. Aldric died because of what they built here." |
| level_start | OPHION REBORN | "The energy signatures suggest a massive psychic imprint is still active aboard the flagship. Admiral Crane's consciousness survived death!" |
| level_start | CROSS | "Not survived. Was absorbed. The eighth Coelacanth caught his mind during the containment breach." |
| level_start | DARIUS | "Then we destroy him — not just his fleet, but the lie he built his career on." |
| unique_enemy | NAYA | "Salvage drones everywhere — they're recycling the dead ships into ammunition!" |
| unique_enemy | OPHION REBORN | "Ghost fighters! Their autopilot routines are based on tactics from forty years ago — I have analyzed the patterns!" |
| boss_entrance | DARIUS | "CRANE! You used my grandfather. You killed my father. You targeted my daughter. Answer for it!" |
| boss_entrance | CROSS | "And my squad — the fourteen pilots you sent into a Dream Pulse zone. You used their deaths as data points." |
| boss_entrance | NAYA | "You tried to turn my daughter into a weapon. You're not a patriot, Crane. You're a monster wearing a uniform." |
| boss_entrance | OPHION REBORN | "The Admiral's echo is destabilizing! His emotional state is degrading his control over the fleet — press the attack!" |
| player_death | NAYA | "Someone's down! The Dreadnought's turret grid is still firing — find cover in the wreckage!" |
| player_death | OPHION REBORN | "Crane's echo derives power from the psychic residue of every soldier who died here. He is well-fueled. But finite!" |
| player_respawn | DARIUS | "Back in the fight. Crane's voice is getting desperate — he knows he's losing." |
| player_respawn | CROSS | "Good. A desperate enemy makes mistakes. Let's give him plenty of reasons to panic." |
| low_health | NAYA | "Darius, your ship is limping. Fall back to the carrier wreckage and let me draw their fire!" |
| squad_save | CROSS | "Ophion, that turret was locked on Naya — how did you disable it?" |
| squad_save | OPHION REBORN | "I simply transmitted Crane's own deactivation codes! He never changed them after the containment breach. Arrogance is predictable!" |
| wave_clear | DARIUS | "The turret grid is offline. The flagship's bridge is exposed. Crane — this ends now!" |
| level_end | DARIUS | "GLYPH-8 secure. The logs confirm everything. Three generations of Stars — all part of Project Dream-Weapon. Lyra was designed." |
| level_end | NAYA | "Darius... our daughter was never sick by accident. But our love for her — that was NEVER part of their design. That's ours." |
| level_end | CROSS | "Crane's echo is gone. My squad can finally rest. Thank you — all of you." |
| level_end | OPHION REBORN | "The Xenomorph Hive is next. A fully Dreamed world. We must be ready for anything." |

---

### BIOME 9 — XENOMORPH HIVE *(Proxima Centauri B — Dreamed World)*
**Threats**: Crawlers, Spitters (acidic), Armored Brutes, Hive Nodes (spawners), warped gravity
**Boss**: Hive-Mind Nexus

#### Solo (Darius + Ophion AI)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | DARIUS | "Proxima Centauri B. A world remade as flesh. This is what happens when the Dreamer wins." |
| level_start | OPHION AI | "The Hive will try to negotiate with you, Darius. It will offer you everything you want. Do not accept." |
| unique_enemy | DARIUS | "Crawlers on the walls and ceiling — they come from every angle! Watch above!" |
| unique_enemy | OPHION AI | "Spitters firing acidic globs. The acid persists on surfaces — avoid lingering in contaminated zones." |
| boss_entrance | DARIUS | "The Hive Mind... it's speaking to me. It's offering me Lyra. Alive. Safe. Transformed." |
| boss_entrance | OPHION AI | "The offer is genuine, Darius. But 'safe' means absorbed. 'Alive' means a voice in the chorus. She would not be herself." |
| player_death | OPHION AI | "The Hive offers peace. But peace without selfhood is not peace — it is erasure. Rise, Darius." |
| player_death | DARIUS | "The Hive's temptation... it was almost convincing. But Lyra's laugh — her real laugh — is worth more than any false paradise." |
| player_respawn | OPHION AI | "System restored. The Hive's offer still stands. And you still have the strength to refuse it." |
| player_respawn | DARIUS | "I didn't come this far to surrender at the finish line. Let's finish this." |
| low_health | DARIUS | "Hull's corroding — the acidic atmosphere is eating through everything!" |
| wave_clear | OPHION AI | "The spawn nodes are destroyed. The Hive's regeneration is slowing." |
| level_end | DARIUS | "GLYPH-9 secured. I rejected its offer. It showed me a future where Lyra never felt pain again — and I said no. Because pain is part of being alive." |
| level_end | OPHION AI | "You chose rightly. The Core Rift awaits. The Prime Coelacanth — and the Dreamer itself." |

#### Duo (Darius + Cross)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | CROSS | "This planet... every surface is organic. The ground is breathing. I've seen bad ops, but this is something else." |
| level_start | DARIUS | "This is what the Navy wanted to control, Cross. A power that turns worlds into flesh." |
| unique_enemy | CROSS | "Spitter at range — acidic glob incoming! Evasive maneuvers, the splash radius is huge!" |
| unique_enemy | DARIUS | "Brute charging! Cross, it's armored head-on — circle around and hit the exposed tissue on its back!" |
| boss_entrance | CROSS | "The Hive Mind... it's using my squad's voices. It's making them tell me it wasn't my fault." |
| boss_entrance | DARIUS | "It's lying, Cross! Your squad wouldn't want you to surrender — they'd want you to fight!" |
| player_death | CROSS | "Star went down! The Hive's terrain is shifting — don't trust the ground!" |
| player_death | DARIUS | "Cross, the Hive tried to offer me peace. It almost worked. Don't let it get in your head!" |
| player_respawn | CROSS | "Back online. The Hive offered me my squad back. It's cruel — but effective." |
| player_respawn | DARIUS | "It knows exactly what we want. That's what makes it dangerous. Stay angry, Cross — anger is better than surrender." |
| squad_save | DARIUS | "Cross! That Brute was three steps from crushing you. Nice dodge." |
| squad_save | CROSS | "Reflex. Navy Close Quarters Combat training. Never thought I'd use it against a living wall." |
| level_end | CROSS | "GLYPH-9 secure. The Hive offered me redemption, Darius. My squad, alive, forgiving me. I almost took it." |
| level_end | DARIUS | "But you didn't. That's what matters. The Core Rift is next — and we're going to finish this." |

#### 4P (Darius, Cross, Naya, Ophion Reborn)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | OPHION REBORN | "Proxima Centauri B — a Dreamed World. The Abyss Mind has fully overwritten this planet's biology and physics!" |
| level_start | NAYA | "Lyra is reacting to this place. She says the Hive is 'singing' to her. A song about never being alone." |
| level_start | DARIUS | "That's not a song, Naya. That's a leash. We break it, or we lose her forever." |
| level_start | CROSS | "Everyone stay tight. The Hive will try to separate us — physically and mentally. Do NOT engage with its offers." |
| unique_enemy | NAYA | "Crawlers — they're skittering through the organic tunnels! They can come from any surface!" |
| unique_enemy | OPHION REBORN | "Spitters! Their acid dissolves standard shielding in 2.3 seconds. Evade, do not block!" |
| boss_entrance | OPHION REBORN | "The Hive-Mind Nexus... it is offering each of us our deepest desire. Do not accept! It cannot deliver what it promises!" |
| boss_entrance | DARIUS | "I see Lyra — healthy, human, laughing. But it's not real. It's just a picture of what I want." |
| boss_entrance | NAYA | "It's offering me a life where none of this happened. Where Darius never had to dive, where Lyra was never sick. It's beautiful and it's a lie." |
| boss_entrance | CROSS | "My squad. All fourteen of them, alive, telling me they forgive me. I know it's the Hive. I KNOW it. But it hurts." |
| player_death | NAYA | "Someone's down! The Hive's terrain is shifting — the ground just opened up!" |
| player_death | OPHION REBORN | "The Hive absorbs consciousness to grow stronger. But it cannot hold a Star! I have seen the data!" |
| player_respawn | DARIUS | "I'm back. The Hive showed me Lyra as the Dreamer's vessel — radiant, eternal, inhuman. That's not what I'm fighting for." |
| player_respawn | NAYA | "What ARE you fighting for, Darius?" |
| player_respawn | DARIUS | "For her to have a choice. A real choice — not one the Dreamer decides for her." |
| low_health | NAYA | "Darius, your ship is dissolving! The acid is through your outer hull — get to my position NOW!" |
| squad_save | CROSS | "Ophion, you just predicted a terrain shift before it happened. How?" |
| squad_save | OPHION REBORN | "The Hive reshapes itself according to emotional intent! When it feels cornered, the ground contracts — simple cause and effect!" |
| wave_clear | DARIUS | "Hive nodes are down. The Nexus is exposed. Everyone — this is it!" |
| level_end | DARIUS | "GLYPH-9 secured. I rejected the Hive's offer. For Lyra. For all of us." |
| level_end | NAYA | "She's speaking again. Lyra. She said 'Daddy, I'm still here. I'm waiting.' That was HER voice, Darius. Not the Dreamer." |
| level_end | OPHION REBORN | "The Core Rift is next — the event horizon of the supermassive black hole. The Prime Coelacanth awaits!" |
| level_end | CROSS | "Whatever happens at the Core, we face it together. No one fights alone." |

---

### BIOME 10 — CORE RIFT *(Galactic Core — The Dreamer's Threshold)*
**Threats**: Glitch Fragments, Paradox Wisps, Null Entities, Void Maws (instant death), reality instability
**Boss**: The Architect (The Dreamer's Fear manifest)

#### Solo (Darius + Ophion AI)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | DARIUS | "The galactic core. A black hole below us, and the Prime Coelacanth — the last intact entity — dying at its edge." |
| level_start | OPHION AI | "All ten GLYPH components are assembled. Once you secure the final piece, the choice is yours, Darius." |
| unique_enemy | DARIUS | "Glitch fragments — they're not fully in this dimension! They flicker between states!" |
| unique_enemy | OPHION AI | "Paradox wisps — they move backwards through time. Aim where they WERE, not where they ARE." |
| boss_entrance | DARIUS | "The Architect... it's not the Dreamer. It's the Dreamer's FEAR. Its terror of being alone forever, given form." |
| boss_entrance | OPHION AI | "You cannot destroy fear with weapons. Show the Dreamer it is not alone, Darius. Someone finally made it all the way down." |
| player_death | OPHION AI | "Reality fractures at the event horizon. But you have come too far to be unmade now. Return." |
| player_death | DARIUS | "The Void Maw... I saw eternity. But eternity without Lyra isn't worth having. Restarting." |
| player_respawn | OPHION AI | "All systems nominal — as much as 'nominal' means at the edge of a black hole. The Prime Coelacanth's signal is still active." |
| player_respawn | DARIUS | "I'm back. And I know what I have to do. Let's finish this." |
| low_health | DARIUS | "Reality is tearing at the seams — my hull is phasing between intact and destroyed!" |
| wave_clear | OPHION AI | "The null entities are dissipating. The path to the Prime Coelacanth is open." |
| level_end | DARIUS | "GLYPH-10 secured. All ten components. The key is complete. Now... I have to choose." |
| level_end | OPHION AI | "The Dreamer is waiting, Darius. Containment, communication, or sacrifice. The decision is yours." |

#### Duo (Darius + Cross)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | CROSS | "The black hole. I've seen a lot, Darius, but this... this is the edge of everything." |
| level_start | DARIUS | "And somewhere in there, the Dreamer is waiting. Lonely. Scared. Just like us." |
| unique_enemy | CROSS | "Null entity ahead — it's erasing everything it touches! Bullets, debris, even light!" |
| unique_enemy | DARIUS | "Void Maw opening! Cross, full reverse thrust — nothing survives a direct pull!" |
| boss_entrance | CROSS | "The Architect... it's screaming. Not in anger — in terror. It's the Dreamer's nightmare." |
| boss_entrance | DARIUS | "Then we don't destroy it. We show it that the nightmare isn't real. That it's not alone anymore." |
| player_death | CROSS | "Darius! The Void Maw took him — but his beacon... his beacon is still transmitting! He's fighting it!" |
| player_death | DARIUS | "Cross, I saw the Dreamer's memories. It's been alone for longer than stars have existed. We have to reach it." |
| player_respawn | CROSS | "Back with us! The Architect's defenses are weakening — it's starting to understand." |
| player_respawn | DARIUS | "Good. It's not a monster, Cross. It's just... the universe's loneliest mind." |
| squad_save | CROSS | "Star, you just pulled me out of a Void Maw's gravity well. How?" |
| squad_save | DARIUS | "I promised Naya I'd bring everyone home. That includes you, Captain." |
| level_end | CROSS | "GLYPH-10 secure. The key is complete. Darius... whatever you choose, I'll back you. That's what a squad does." |
| level_end | DARIUS | "Thank you, Cross. For everything. Now... let's go talk to a god." |

#### 4P (Darius, Cross, Naya, Ophion Reborn)
| TRIGGER | SPEAKER | LINE |
|---------|---------|------|
| level_start | OPHION REBORN | "The galactic core! The event horizon of the supermassive black hole! Time and space are suggestions here — nothing is absolute!" |
| level_start | NAYA | "Lyra is speaking clearly now. She says the Dreamer can see us. It's been watching us this whole journey." |
| level_start | DARIUS | "Then it knows we came to talk, not to fight. Let's not disappoint it." |
| level_start | CROSS | "Last mission, squad. Whatever happens at the core, it's been an honor flying with all of you." |
| unique_enemy | OPHION REBORN | "Glitch fragments! They exist in a superposition of states — fire where they MIGHT be, not where they appear!" |
| unique_enemy | NAYA | "Paradox wisps moving backwards! Darius, aim behind them — they'll fly into your shots!" |
| boss_entrance | DARIUS | "The Architect. The Dreamer's fear, given form. It's been alone so long it's terrified of what happens if someone actually answers." |
| boss_entrance | NAYA | "It's like a child hiding under a blanket — but the blanket is made of broken spacetime." |
| boss_entrance | OPHION REBORN | "I spent millennia arguing we should communicate with the Dreamer. Now, at last, we will! But first — we must calm its fear!" |
| boss_entrance | CROSS | "How do you calm a cosmic entity's nightmare, Ophion?" |
| boss_entrance | OPHION REBORN | "The same way you calm a child's. You tell it you are here. You tell it you are not leaving. And you mean it." |
| player_death | NAYA | "Someone's gone — pulled into a Void Maw! But those things don't kill... they just... move you. Fight your way back!" |
| player_death | OPHION REBORN | "The Void Maw is not destruction — it is dislocation! Whoever was pulled in is still conscious! Call out to them!" |
| player_respawn | DARIUS | "I'm back. The Void showed me the Dreamer's first memory. It was born alone, in the dark, and never met another mind like itself. Ever." |
| player_respawn | NAYA | "That's... that's heartbreaking. It's not evil. It's the first and only of its kind." |
| low_health | NAYA | "Darius — your ship is phasing! One second it's here, the next it's not. Are you still with us?" |
| squad_save | CROSS | "Ophion! You just deflected a paradox bolt aimed at Naya with your own hull. That was either brave or foolish." |
| squad_save | OPHION REBORN | "Definitely both! But I calculated the risk at only 34% lethality. Naya is more important than those odds!" |
| wave_clear | DARIUS | "The Architect is weakening. It's not fighting as hard — it's starting to believe us." |
| level_end | DARIUS | "GLYPH-10 secured. All ten pieces. The key is complete. The Dreamer is... waiting." |
| level_end | NAYA | "Lyra says there are three paths. Three ways this can end. Darius... I trust you. Whatever you choose." |
| level_end | OPHION REBORN | "Containment, symbiosis, or transcendence. The choice that will define the galaxy. I am honored to witness it." |
| level_end | CROSS | "We're with you, Star. To the end." |

---

## SECTION 2: MULTIPLAYER JOIN/LEAVE BANTER

### Join Banter — Mostly Positive
All join lines are warm, welcoming, and PG-rated. Variants for early/mid/late biome.

#### Player Joins (Solo → Duo or Duo → 4P)

**Early Biome (Waves 1-3)**
| SPEAKER | LINE |
|---------|------|
| DARIUS | "Welcome aboard! We're just getting started — perfect timing." |
| DARIUS | "Glad you made it. The trench is dark, but it's brighter with you here." |
| DARIUS | "It's about time! We could really use your help down here." |
| CROSS | "Reinforcements arrived. Welcome to the squad. Stay close and watch your sectors." |
| CROSS | "Good to see you. The Navy doesn't know what they're up against now." |
| NAYA | "Welcome! Lyra asked me to tell you 'good luck.' She's watching our mission feed." |
| NAYA | "You're just in time. These anglerfish don't stand a chance against a full team." |
| OPHION REBORN | "Oh, splendid! Another pilot! I've already calculated seventeen formations that work better with you here!" |
| OPHION REBORN | "Welcome, welcome! I was just explaining the thermal dynamics of this biome. Shall I start over?" |

**Mid-Biome (Waves 4-7)**
| SPEAKER | LINE |
|---------|------|
| DARIUS | "You made it! We're in the thick of it, but we've got this." |
| DARIUS | "That's what I like to see. The cavalry's here." |
| CROSS | "Reinforcements mid-mission. Good. We've got a Wyrm to finish off." |
| CROSS | "Welcome to the fight. I'll catch you up on the enemy patterns — they're predictable once you know what to look for." |
| NAYA | "So glad you're here. The spawning waves are getting heavier and we need every gun." |
| OPHION REBORN | "Ah, mid-biome arrival! The enemy density is 62% higher than the entry zone. I recommend immediate weapons hot!" |

**Late Biome (Waves 8+ / Boss Approach)**
| SPEAKER | LINE |
|---------|------|
| DARIUS | "Cutting it close! But I'd rather have you late than not at all." |
| DARIUS | "We're almost at the core. Perfect time to join the push." |
| CROSS | "Boss fight's about to start. Welcome to the deep end." |
| CROSS | "You picked a good moment. We need all the firepower we can get." |
| NAYA | "The boss is just ahead. Your timing couldn't be better." |
| OPHION REBORN | "Oh! The boss encounter has a 14% higher success probability with you in the formation. Statistically excellent timing!" |

---

### Leave Banter — Encouraging
When a player disconnects or drops, the remaining characters respond with confidence and warmth.

| SPEAKER | LINE |
|---------|------|
| DARIUS | "They'll be back. They always come back." |
| DARIUS | "Hold the line — we've got this. They can rejoin when they're ready." |
| DARIUS | "One pilot down, but not out. We keep pushing." |
| CROSS | "Temporary withdrawal. Tactical necessity. We proceed." |
| CROSS | "They'll return. Good pilots always do." |
| CROSS | "Formation adjusted. We're still combat effective." |
| NAYA | "We've got this. They know where to find us when they're ready." |
| NAYA | "Squad's smaller, but our spirit isn't. Let's keep going." |
| OPHION REBORN | "Departure noted! I have recalculated the tactical parameters. Success probability remains at 88.4%!" |
| OPHION REBORN | "They will return! My predictive models show an 87% rejoining rate for pilots who leave at this biome depth!" |

---

## SECTION 3: MULTIPLAYER SYSTEMS

### 3.1 — Join Flow
1. **Trigger**: Player presses "Start" on controller at any point during a mission.
2. **Ship Select**: Joined player selects their ship. Ship stats are scaled to current biome level to ensure the joining player is not underpowered.
3. **Spawn**: Player materializes near the squad with a 3-second invulnerability window (flashing shield visual).
4. **Notification**: Banner appears for all players: `"[PLAYER NAME] has joined the squadron"` + appropriate join banter line plays.
5. **Warm-up**: Joined player receives a brief HUD overlay summarizing current objective, wave number, and squad status.

### 3.2 — Leave Flow
1. **Trigger**: Player disconnects (manual quit, network drop, or inactivity timeout > 120s).
2. **Grace Period**: 3-second grace window where connection can be restored without triggering leave sequence.
3. **Auto-Dock**: Leaving player's ship auto-navigates to nearest safe zone and docks (AI assumes control briefly to avoid death).
4. **Difficulty Rescale**: Biome enemy HP and spawn counts are recalculated immediately (see difficulty table below).
5. **Notification**: Banner appears: `"[PLAYER NAME] has left the squadron"` + appropriate leave banter.
6. **Rejoin**: Leaving player can rejoin at any time; they resume from their last checkpoint with preserved scrap and upgrades.

### 3.3 — Difficulty Scaling
| Player Count | Enemy HP Multiplier | Enemy Spawn Rate Multiplier | Notes |
|-------------|---------------------|---------------------------|-------|
| 1 Player | 1.0x | 1.0x | Baseline |
| 2 Players | 1.4x | 1.25x | Moderate scaling |
| 3 Players | 1.7x | 1.5x | Significant scaling |
| 4 Players | 2.0x | 1.75x | Full squad scaling |
| Dynamic Rescale | Applied immediately on join/leave | Smooth transition over 5s | Enemies already spawned retain current HP; new spawns use new values |

**Edge cases**:
- Boss HP scales immediately on join/leave during boss fights (health bar visually adjusts).
- If all players disconnect except host, host can pause (single-player pause enabled).
- If host disconnects, secondary player is promoted to host with a 5-second migration grace period.

### 3.4 — Save System
- **Host Authority**: Only the host player owns the save file. Progress is saved to host's localStorage.
- **Save Points**:
  - **Biome Transitions**: Auto-save occurs at the end of every biome (after post-level dialogue, before warp sequence).
  - **Checkpoint Every 3 Waves**: During a biome, checkpoint saves occur after waves 3, 6, 9, etc.
- **Save Data Includes**:
  - Current biome and wave number
  - All collected GLYPH components (1-10)
  - Player ship upgrades and loadouts
  - Scrap balance (shared pool)
  - Story flags (Cross defection status, Ophion AI state, Lyra's condition)
  - Difficulty scaling setting
- **Guest Progress**: Guest players retain their ship configuration and upgrades in their own local profile. When rejoining a host, their ship is scaled to the current biome.
- **Multiple Saves**: Host can maintain up to 3 save slots.

### 3.5 — Scrap Economy
- **Shared Pool**: All scrap collected during a mission goes into one shared pool visible to all players.
- **Host Spending**: Only the host can spend scrap at the Haven-7 hub between biomes. This simulates the "mission commander" role.
- **Spending Options at Haven-7**:
  - Ship upgrades (weapons, shields, thrusters, hull)
  - Consumables (repair kits, shield boosters, temporary buffs)
  - Cosmetic unlocks
  - Nyx familiar upgrades (4P mode)
- **Guest Visibility**: All players see the shared scrap total and can suggest purchases via a quick-ping system.
- **Fairness**: Scrap dropped by enemies is automatically collected for the whole squad — no individual loot competition.
- **Balance**: Scrap drop rates are tuned so that a full 4P squad can afford roughly the same per-player upgrade rate as a solo player.

---

## SECTION 4: VOICE PIPELINE

### 4.1 — TTS Engine Selection
| Character Tier | TTS Model | Characters | Rationale |
|---------------|-----------|------------|-----------|
| **Main Cast** | `gemini-2.5-pro-tts` | Darius Star, Naya Star, Captain Valera Cross, Commander Jack Thorne | Highest expressiveness for emotional range, narrative delivery, and frequent dialogue |
| **Supporting / NPC** | `gemini-2.5-flash-tts` | Ophion Reborn / Ophion AI, Lyra Star, Selene Star, Admiral Crane's Echo, The Dreamer, Aldric Star (logs), Boss Entities | Lower latency for reactive/banter lines; sufficient expressiveness for non-primary dialogue |

**Rationale**: Main cast characters carry the emotional weight of the story and need pro-level expressiveness. Supporting characters (especially Ophion's rapid banter, Lyra's child voice, and boss entities' distorted speech) benefit from flash's lower latency, keeping in-game banter responsive.

### 4.2 — Post-Processing Pipeline (ffmpeg)
Every TTS output passes through a standardized post-processing chain:

```
TTS Raw → Bandpass → Compression → Noise Layer → Mic Click → Squelch Tail → Final Asset
```

| Stage | ffmpeg Filter | Parameters | Purpose |
|-------|--------------|------------|---------|
| **1. Bandpass** | `bandpass=f=500:width_type=h:w=2900` | 300 Hz – 3400 Hz effective range | Simulates radio comms frequency response; removes sub-bass rumble and high-frequency digital artifacts |
| **2. Compression** | `compand=attacks=0.01:decays=0.2:points=-80/-80|-30/-15|0/-3:gain=6` | 4:1 ratio | Evens out TTS volume inconsistencies; adds mild radio-style gain |
| **3. Noise Layer** | Mix with generated brown noise at -42 dB | `-filter_complex "anoisesrc=d=30:c=brown:a=0.005,amix=inputs=2:duration=first"` | Adds subtle radio static bed beneath voice (barely audible, atmospheric) |
| **4. Mic Click** | Insert 8ms sine click at 2kHz at utterance start | Concatenated short tone | Simulates push-to-talk mic activation |
| **5. Squelch Tail** | 120ms of shaped noise fade at utterance end | Generated white noise with exponential decay | Simulates radio squelch closing after transmission |
| **6. Normalization** | `loudnorm=I=-16:LRA=11:TP=-1.5` | EBU R128 standard | Consistent loudness across all voice lines |

### 4.3 — Character EQ Profiles
Each character gets a custom EQ preset applied *before* the standard pipeline, shaping their vocal identity to match their personality and physical characteristics.

| # | Character | EQ Profile Name | Low Shelf | Mid Bump | High Shelf | Character Notes |
|---|-----------|----------------|-----------|----------|------------|-----------------|
| 1 | **Darius Star** | "Deep Diver" | +2 dB @ 120 Hz | +0 dB (flat) | -1 dB @ 8 kHz | Warm, grounded male voice. Slight low-end boost for gravitas. Rolled highs simulate helmet resonance. |
| 2 | **Naya Star** | "Warm Core" | +1 dB @ 150 Hz | +2 dB @ 2.5 kHz | +0 dB (flat) | Clear, present female voice. Mid bump adds warmth and intimacy for emotional lines. |
| 3 | **Valera Cross** | "Command Edge" | -1 dB @ 100 Hz | +3 dB @ 3 kHz | +1 dB @ 10 kHz | Crisp, authoritative. Mid-high emphasis adds clarity and military precision. Slightly brighter. |
| 4 | **Ophion Reborn / AI** | "Curious Resonance" | -2 dB @ 80 Hz | +4 dB @ 1.5 kHz | +2 dB @ 12 kHz | Slightly alien, energetic. Scooped lows, forward mids, airy highs. Sounds ancient yet childlike. |
| 5 | **Commander Jack Thorne** | "Old Salt" | +3 dB @ 100 Hz | -1 dB @ 3 kHz | -2 dB @ 8 kHz | Gruff, seasoned. Strong bass presence, slightly recessed highs. Sounds like decades of radio experience. |
| 6 | **Lyra Star** | "Starlight" | -3 dB @ 80 Hz | +2 dB @ 4 kHz | +1 dB @ 14 kHz | Young, bright voice. Cut lows (child's voice has less bass), bumped presence. Air band for ethereal glow effect when attuned. |
| 7 | **The Dreamer** | "Abyss Voice" | +6 dB @ 60 Hz | -4 dB @ 2 kHz | -6 dB @ 10 kHz + heavy reverb | Massive, subterranean. Extreme sub-bass boost, scooped mids, heavy dark reverb. Feels like tectonic plates speaking. |

**Additional Character Variants**:
- **Aldric Star (Logs/Visions)**: Uses "Deep Diver" profile + additional tape saturation and slight pitch warble to simulate aged recordings.
- **Admiral Crane's Echo**: Uses "Command Edge" profile + 50% wet/dry digital degradation (bitcrush subtle) and hollow room reverb.
- **Boss Entities**: Uses "Abyss Voice" profile with varying levels of distortion and layering depending on entity (Trench Guardian = +flange, Hive Mind = +chorus, Architect = +reverse reverb).

### 4.4 — Speaker Transitions
When banter switches between two different characters:

| Transition Element | Implementation | Duration |
|-------------------|----------------|----------|
| **Static Burst** | White noise shaped with 500-3000 Hz bandpass, amplitude 0.3 relative to speech | 50 ms |
| **Channel Click** | Soft 2 kHz tone burst at burst start | 10 ms |
| **Crossfade** | Outgoing voice fades from -3 dB to -inf over 30ms; incoming fades from -inf to -3 dB over 30ms | 60 ms total |
| **Pause Between Speakers** | Silence gap (includes static burst within gap) | 150 ms total (50ms burst centered in 150ms gap) |

**Implementation**: Speaker transitions use a pre-rendered "transition_click.wav" (50ms) that is inserted between every TTS clip where the speaker changes. This avoids runtime audio stitching complexity. For consecutive lines from the same speaker, a simple 80ms silence gap is used instead.

### 4.5 — Voice Line Priority & Culling
- **Priority Levels**: Critical (story/danger) > High (boss banter) > Medium (event banter) > Low (ambient/optional).
- **Queue**: At most 1 active voice line + 1 queued line at any time.
- **Interruption**: Critical lines interrupt any currently playing line. High lines interrupt Medium and Low. Medium interrupts Low.
- **Cooldown**: No character speaks more than once every 8 seconds (prevents banter spam).
- **Duplicates**: Each banter line plays at most once per mission (cycling variants for repeatable triggers like death/respawn).

### 4.6 — Asset Generation and Storage
- **Pre-generation**: All story/narrative lines are pre-generated during build, not at runtime.
- **Banter lines**: Generated in batches per biome, stored as `.ogg` (Vorbis, quality 6) for size efficiency.
- **File naming**: `{biome_id}_{trigger}_{speaker_lower}_{variant}.ogg` — e.g., `b1_level_start_darius_01.ogg`
- **Estimated asset count**: ~800 voice lines total across all biomes and player configurations.
- **Estimated storage**: ~60-80 MB total for all voice assets (OGG Vorbis at ~80-100 KB per line).

---

*End of Banter and Systems Design Document — Darius Star: Cyber Coelacanth*
