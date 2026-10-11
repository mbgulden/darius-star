# DARIUS STAR — Story Quality Evaluation Rubric
## 10 Criteria × 5 Levels | Based on Michael Gulden's Story Directives (2026-06-09)

---

> **PURPOSE**: This rubric defines objective quality standards for evaluating the story execution of *Darius Star: Cyber Coelacanth*. Each criterion is scored 1–5, with clear descriptions of what each level looks like in practice. Use this to score the current state, guide future writing, and validate all new narrative content before integration.

---

## How to Use This Rubric

1. **Score each criterion independently** — a weakness in one area doesn't automatically lower another.
2. **Use specific evidence** — cite biome numbers, character quotes, or mechanics, not gut feelings.
3. **A score of 5 is aspirational** — it means "fully realized with no meaningful gaps." Expect most criteria to land at 3–4 during active development.
4. **"N/A" is valid** for criteria that don't apply to the current development phase (e.g., ending satisfaction before endings are implemented).

---

## Criterion 1: Emotional Impact

> *"Player attachment grows over journey — Lyra is the emotional core."*
> *"Tone journey: betrayal→redemption→trust→bonding→surprises→catastrophe→teamwork"*

**Evaluates**: Does the story make the player *feel*? Does Lyra's presence anchor the emotional experience? Are the emotional beats earned rather than told?

| Score | Description |
|-------|-------------|
| **1 — Absent** | Characters are interchangeable. Lyra is a MacGuffin with no personality. No scene produces any emotional response beyond "when does the shooting start?" |
| **2 — Weak** | One or two emotional beats land vaguely ("sad thing happened"). Lyra exists but the player has no reason to care about her. Emotional arc is telegraphed but not felt. |
| **3 — Functional** | Key emotional beats work: Darius hearing Aldric's voice, the biome 6 attack on Haven-7, Lyra's coma in biomes 7–8. The player cares about Lyra as a character. Emotional trajectory follows the planned arc but some transitions feel abrupt. |
| **4 — Strong** | Multiple scenes produce genuine emotional responses. Lyra is actively missed during her coma (mechanical + emotional void). Father-daughter bond earns its payoff. The player feels the weight of the final choice. Tone journey matches the intended betrayal→teamwork arc. |
| **5 — Exceptional** | The story produces tears, tension, relief, and catharsis at the intended moments. Lyra's emotional core is so strong that players report thinking about her between sessions. Secondary characters (Cross's grief, Ophion's guilt, Naya's ferocity) each produce distinct emotional responses. The tone journey is a seamless, earned progression that leaves the player changed. |

**Current Assessment Basis**: Lyra-as-navigator design (PLOT-GAPS-FILLED §1) has 5 specific bonding scenes. The emotional arc is documented across Acts I–IV (story-mode-narrative.md §7). Banter reinforces emotional beats but volume is limited in implementation.

---

## Criterion 2: Character Consistency

> *"Every line must sound like the same person. Voice profiles at docs/character-voice-profiles.md"*
> *"Characters: Darius, Lyra, Naya, Cross, Thorne, Ophion, Selene, Architect"*

**Evaluates**: Does each of the 8 characters speak with a consistent, distinctive voice? Can you identify the speaker from a line out of context? Do they stay consistent across all 10 biomes?

| Score | Description |
|-------|-------------|
| **1 — Absent** | Characters share one generic voice. Darius and Cross sound identical. No catchphrases, no speech patterns, no distinguishing vocabulary. |
| **2 — Weak** | Characters have different roles but their dialogue could be swapped without detection. Catchphrases exist on paper but aren't used consistently. Voice profiles are referenced but not enforced. |
| **3 — Functional** | Major characters (Darius, Lyra, Cross) have distinct voices. Catchphrases appear at key moments. Ophion has his exclamation-mark energy. Most lines pass the "who said this?" test. Some minor characters (Thorne, Selene) are less distinctive. |
| **4 — Strong** | All 8 characters are immediately identifiable by speech alone. Catchphrases, vocabulary, sentence length, and rhythm are consistent across all biomes. Voice profiles are actively used as validation checklists for every line. Characters evolve (Lyra's post-coma resonance, Cross's formal→warm shift) without losing their core identity. |
| **5 — Exceptional** | Characters feel like real people the player knows. Lines are so voice-specific that players can quote them and instantly identify the speaker. Evolution is subtle and continuous (not "biome 6 switch flip"). Voice profiles are treated as living documents. The Architect's speech is genuinely unsettling in a way no other character could produce. |

**Current Assessment Basis**: Voice profiles exist for all 8 characters (1,162 lines). Banter validation checklist (Appendix D of voice profiles) defines 8 checks per line. Banter in BANTER-AND-SYSTEMS.md follows these profiles well. banter_engine.js has limited volume but existing lines are voice-consistent.

---

## Criterion 3: Escalation Effectiveness

> *"Escalating stakes: start reasonable, rise higher, then go even higher when you think they can't"*
> *"Full narrative across 10 biomes/100 levels"*

**Evaluates**: Do stakes actually escalate? Are there plateaus or regressions? Does the escalation feel organic or forced? Does the "one-way trip" mechanical constraint reinforce narrative tension?

| Score | Description |
|-------|-------------|
| **1 — Absent** | Stakes are static or arbitrary. Biomes feel interchangeable danger-wise. No meaningful difference between biome 1 and biome 10 stakes. |
| **2 — Weak** | Stakes escalate on paper but not in experience. Bosses get bigger but the feeling of danger doesn't change. The one-way-trip fuel constraint is mentioned but doesn't affect gameplay decisions. |
| **3 — Functional** | Clear stake progression: Personal (B1–3) → Mid (B4–6) → High (B7–9) → Ultimate (B10). The one-way-trip creates real tension. Each biome raises a new kind of stake (family secrets, military pursuit, cosmic threat). The "oh shit" moments in escalating-stakes-map.md land. |
| **4 — Strong** | Escalation is multi-dimensional (personal, military, ecological, existential) and each dimension peaks at different moments, creating a complex tension weave. The player feels the stakes physically (Lyra's silence in B7–8, reality warping in B10). The "even higher when you think they can't" moment (engineered bloodline revelation in B8) genuinely surprises. |
| **5 — Exceptional** | The escalation is so well-crafted that players describe it as "a descent into something bigger than I could have imagined." Each biome transition feels like a point of no return. Stakes compound rather than replace — the personal never vanishes, it's just overlaid with larger threats. The finale makes biome 1 feel like a different game, yet the through-line is unbroken. |

**Current Assessment Basis**: Escalating-stakes-map.md defines a clear tension curve (2/10 to 10/10). Four-act structure is well-documented. The "one-way trip" mechanic (PLOT-GAPS-FILLED §4) reinforces narrative stakes. The engineered bloodline revelation (B8) is the "even higher" moment.

---

## Criterion 4: Dialogue Authenticity

> *"Show-don't-tell: ambiance + environmental noise + music tells the story"*
> *"Audio drama format — story unfolds through in-game character interactions"*

**Evaluates**: Does dialogue sound like real people talking, not exposition delivery systems? Is information conveyed through character interaction rather than narration? Does ambiance carry story weight?

| Score | Description |
|-------|-------------|
| **1 — Absent** | Dialogue is pure exposition. Characters announce plot points. "As you know, the Dreamer is a cosmic entity that..." No environmental storytelling. |
| **2 — Weak** | Characters sometimes sound natural, but exposition dumps are frequent. Mission briefings read like Wikipedia entries. Environmental storytelling exists but is decorative, not narrative. |
| **3 — Functional** | Most dialogue serves double duty (character + plot). Lyra's navigation calls convey character while providing gameplay utility. Banter reveals relationships naturally. Mission briefings establish stakes without pure exposition. Environmental design reinforces tone. |
| **4 — Strong** | Dialogue consistently feels like real people in extraordinary circumstances. Exposition emerges from conflict, not lecture. The audio-drama format works: characters reveal themselves through what they say under pressure. Ambiance (Lyra's silence in B7, the Dreamer's voice in B10, storm audio in B7) carries as much narrative weight as dialogue. |
| **5 — Exceptional** | Dialogue is so natural that the player forgets it was written. Characters interrupt, contradict, reveal, and bond through subtext as much as text. Environmental audio tells its own story — the Storm-Singer's weeping, the Hive's seductive whispers, Haven-7's desperate silence after the attack. The player learns more from what characters *don't* say than what they do. |

**Current Assessment Basis**: Banter system has contextual triggers (level_start, boss_entrance, player_death, etc.). Voice pipeline (BANTER §4) includes radio-effect post-processing to sell the comms format. PLOT-GAPS-FILLED §1 has extensive "show don't tell" navigation design. Mission briefings vary by player count. Ambient noise design doc exists separately.

---

## Criterion 5: Ending Satisfaction

> *"3 endings: Sacrifice/Transcendence/Dominion"*
> *(Michael uses: Containment, Symbiosis, Transcendence)*

**Evaluates**: Are all three endings meaningful, distinct, and earned? Does each feel like a valid conclusion? Is the choice itself dramatically compelling?

| Score | Description |
|-------|-------------|
| **1 — Absent** | One ending, or three endings with no meaningful difference. Final choice is arbitrary. Epilogue is a text crawl. |
| **2 — Weak** | Three endings exist but one is clearly "correct" and the others feel like failure states. The choice is presented mechanically (menu selection, not narrative culmination). Epilogue is brief and unsatisfying. |
| **3 — Functional** | All three endings are valid, with distinct outcomes for Lyra, Darius, and the Dreamer. The choice flows naturally from 10 biomes of accumulated context. Each ending has a unique emotional payoff. Epilogue acknowledges player choices. |
| **4 — Strong** | Each ending recontextualizes the entire journey. Containment feels like a tragic necessity. Symbiosis feels like earned hope. Transcendence feels like devastating love. The player genuinely struggles with the choice because all paths have been foreshadowed. Character-specific resolutions (Cross's vengeance/forgiveness, Naya's acceptance/protection, Ophion's merge/remain) add dimension. |
| **5 — Exceptional** | The ending choice becomes a topic of genuine debate among players. No consensus "best" ending emerges. Each ending provides closure while leaving meaningful questions. The final conversation with the Dreamer is one of the most memorable moments in the game. Character arcs resolve in ways that feel both surprising and inevitable. The epilogue shows consequences without over-explaining. |

**Current Assessment Basis**: Three endings are defined (story-mode-design.md §7, story-mode-narrative.md §4, B10 section). Multiplayer consensus mechanic described in escalating-stakes-map.md. Character-specific resolution beats exist in character-arcs-complete.md. The Architect serves as the final emotional trial before the choice. No ending cinematics exist yet (credits-content.md is for old 3-level game).

---

## Criterion 6: Audio-Drama Immersion

> *"Audio drama format — story unfolds through in-game character interactions"*
> *"Tension, relief, victory, mystery/awe"*

**Evaluates**: Does the audio experience (voice, SFX, music, ambient) create a cohesive story world? Does the comms-radio format enhance or detract from immersion? Are the four emotional modes (tension, relief, victory, mystery/awe) audible?

| Score | Description |
|-------|-------------|
| **1 — Absent** | Audio is purely functional. Voice lines exist but feel disconnected. No radio-effect processing. Music is generic, unrelated to biome theme or emotional beat. |
| **2 — Weak** | Voice lines play at correct triggers but lack atmospheric integration. Radio effects exist but are inconsistent. Music changes per biome but doesn't respond to narrative beats. Emotional modes are suggested but not felt. |
| **3 — Functional** | Voice pipeline (EQ profiles, radio post-processing, speaker transitions) creates a convincing comms experience. Biome-specific music themes exist. Boss fights have distinct audio. The four emotional modes are distinguishable. Character EQ profiles make voices recognizable by ear. |
| **4 — Strong** | The audio-drama format is immersive. Speaker transitions (static burst + click + crossfade) sell the radio-comms fiction. Environmental audio (vent rumbles in B1, storm howl in B7, reality static in B10) tells story independently. Voice performances (via TTS + EQ) convey character emotion without visual aid. Music dynamically shifts with tension level. |
| **5 — Exceptional** | Players describe the audio as "a movie in my ears." The radio-comms format becomes invisible — it's simply how this world sounds. Lyra's silence in B7–8 is more powerful than any line could be. The Architect's layered, discordant voice is genuinely frightening. Audio alone conveys the full emotional arc. The game could be enjoyed as a radio drama. |

**Current Assessment Basis**: Full voice pipeline designed (BANTER §4): 2-tier TTS, 5-stage post-processing, 7 character EQ profiles, speaker transitions, priority/culling. ~800 voice lines planned. Ambient noise design doc exists. Lyra's silence (B7–8) is a deliberate audio void. Biome-specific music prompts in biome-boss-design.md. Implementation status unknown.

---

## Criterion 7: Procedural Narrative Variety

> *"Mob procedural variation for organic replay feel"*
> *"Mission Briefings overlay multi-character arc for procedural structure without repetition"*

**Evaluates**: Does replay produce fresh narrative experiences? Do banter variants, procedural enemy composition, and briefing variations prevent repetition? Does NG+ change the story feel?

| Score | Description |
|-------|-------------|
| **1 — Absent** | Every playthrough is identical narratively. No banter variants beyond one line per trigger. NG+ is stat-only with no narrative changes. |
| **2 — Weak** | Banter has 2–3 variants per trigger but cycles predictably. Enemy variety exists but doesn't affect story feel. Mission briefings are identical every run. NG+ adds scrap multiplier but no narrative changes. |
| **3 — Functional** | Banter cycles through variants per trigger. Enemy composition varies procedurally. Multiplayer character combinations create different banter dynamics. Mission briefings vary by player count. NG+ carries over glyph knowledge with narrative acknowledgment. |
| **4 — Strong** | Banter system has enough variants that players hear new lines across multiple runs. Procedural enemy variety creates emergent "story moments" (e.g., rare enemy combinations produce unique banter). Multiplayer combinations meaningfully change the narrative texture. NG+ adds new banter referencing previous runs. Briefings adapt to player performance. |
| **5 — Exceptional** | Players report discovering new dialogue after 5+ playthroughs. Procedural enemy behavior creates genuinely surprising narrative moments that feel authored. The "one-in-a-million" legendary scrap system adds gambling-excitement to story context. Multiplayer creates so many unique character dynamics that each squad composition feels like a different story. NG+ transforms the narrative through accumulated glyph knowledge. |

**Current Assessment Basis**: Banter has variants per trigger (BANTER §1). banter_engine.js supports variant cycling with played-line tracking. Multiplayer adds 3 configurations (solo/duo/4P) with unique banter. NG+ system defined (PLOT-GAPS-FILLED §6) with glyph knowledge carryover. Mission briefings have solo/coop2/coop4 variants. Procedural enemy variety design exists but narrative impact is limited.

---

## Criterion 8: Mission Briefing Integration

> *"Mission Briefings overlay multi-character arc for procedural structure without repetition"*

**Evaluates**: Do briefings serve narrative purpose beyond objective delivery? Do they reflect character arcs and current story state? Are they concise enough to not slow momentum?

| Score | Description |
|-------|-------------|
| **1 — Absent** | Briefings are generic text dumps. "Destroy enemies. Get the thing." No character voice, no narrative context, no variation. |
| **2 — Weak** | Briefings have character attribution but read identically across biomes. No acknowledgment of previous biome events. Same structure every time with no evolution. |
| **3 — Functional** | Briefings reflect biome-specific context and Thorne's character voice. They vary by player count. They reference recent story events. They're reasonably concise. The structure (situation → objective → threats → encouragement → sign-off) provides consistency without monotony. |
| **4 — Strong** | Briefings evolve with the story. Thorne's tone shifts from professional to urgent to humbled across biomes. Post-level briefings acknowledge character-specific developments. In 4P, other characters interject. Briefings feel like organic mission prep, not formality. The typewriter effect and pacing variations (normal/slow/fast) enhance delivery. |
| **5 — Exceptional** | Briefings are a storytelling highlight, not an obligation. Players look forward to them. Thorne's arc from skeptic to believer is told largely through how he delivers briefings. Post-level briefings provide genuine catharsis. The briefing format itself becomes a character — the sound of the comms click, Thorne's sign-off — that players associate with the game's identity. |

**Current Assessment Basis**: mission-briefings.json has pre-level briefings for solo/coop2/coop4 for all 10 biomes, plus post-level and boss_defeat sequences. Format includes typewriter effect, speed pacing, and SFX integration. Briefings are Thorne-centric with Darius/Lyra interjections. Post-level briefings narratively bridge biomes. Boss defeat sequences add enemy-voice elements.

---

## Criterion 9: Cohesion & Internal Consistency

> *No single directive, but implied by "full narrative across 10 biomes" and all other directives*

**Evaluates**: Does the story hold together as one continuous narrative? Are there contradictions between documents? Do mechanics and narrative reinforce each other? Is timeline/logic consistent?

| Score | Description |
|-------|-------------|
| **1 — Absent** | Major contradictions between design docs. Narrative events happen in impossible orders. Mechanics contradict story (e.g., one-way-trip mentioned but player can backtrack). |
| **2 — Weak** | Core story is coherent but details conflict. Boss names differ between docs. Character presence in biomes is inconsistent (e.g., character speaks in banter before they're introduced). Timeline has gaps. |
| **3 — Functional** | Story is coherent end-to-end. Major events happen in correct order. Characters are introduced before they speak. Mechanics (one-way trip, pull-out, scrap) align with narrative. Minor inconsistencies exist in tertiary details. |
| **4 — Strong** | Every document aligns on key events, character arcs, and biome progression. Mechanics and narrative are mutually reinforcing. The "one-way trip" fuel constraint, Lyra's navigator role, scrap economy — all serve both gameplay and story without contradiction. References between docs are consistent. |
| **5 — Exceptional** | The narrative is airtight. Players cannot find contradictions. The story works equally well whether examined at the macro (10-biome arc) or micro (single banter line) level. Design documents function as a single coherent source of truth. Previous design iterations are clearly superseded, with no legacy artifacts creating confusion. |

**Current Assessment Basis**: Multiple documents describe overlapping story content. Several inconsistencies exist (see Deep Audit). Key: escalating-stakes-map describes different events than main narrative for biomes 2–3. Boss names vary between docs. credits-content.md and LEVEL-THEME-SPEC.md reference old 3-level structure. Banter has Architect pull-out lines in all biomes. These issues are documented in the Deep Audit.

---

## Criterion 10: Player Agency & Choice Resonance

> *"Pull out mechanic: ships never blow up, get damaged→retreat with character-specific emergency lines"*
> *"Multiplayer: damaged players pull out individually... All down→checkpoint restart with UNIQUE situational dialogue"*

**Evaluates**: Do player actions have narrative weight? Does the "pull out" mechanic feel like a story event, not just a gameplay reset? Do multiplayer dynamics create story? Does the final choice feel like *your* choice?

| Score | Description |
|-------|-------------|
| **1 — Absent** | Pull-out is a mechanical respawn with no narrative acknowledgment. Death feels like a game over screen, not a story beat. Multiplayer has no narrative dimension. Final choice is a menu selection. |
| **2 — Weak** | Pull-out has one generic line. Character-specific lines exist but are limited. Multiplayer join/leave has token banter. Final choice exists but isn't foreshadowed by player actions. |
| **3 — Functional** | Each character has unique pull-out lines per biome. Pull-out feels like a tactical withdrawal, not death. Multiplayer join/leave banter is contextual (early/mid/late biome). Checkpoint restart has unique situational dialogue. Final choice reflects the journey but doesn't adapt to player-specific actions. |
| **4 — Strong** | Pull-out lines reflect character state and biome context. The mechanic reinforces the "no one dies, they retreat" fiction. Multiplayer creates distinct narrative experiences: Cross's defection plays differently in co-op, Naya joining changes squad dynamics. The final choice is influenced by player actions throughout the game (who they saved, what they discovered, which legendary scraps they found). |
| **5 — Exceptional** | The pull-out mechanic becomes a storytelling device. Emergency retreats create mini character moments that accumulate across a run. Players remember specific pull-outs ("that time Naya saved me in the Fire Nebula"). Multiplayer creates emergent stories that feel authored. The final choice is so responsive to player history that different players arrive at different endings for different reasons, and all feel correct. |

**Current Assessment Basis**: Pull-out mechanic designed with character-specific lines (banter_engine.js has pull_out triggers for all 8 characters across all 10 biomes). Multiplayer join/leave banter exists (BANTER §2). Checkpoint restart mechanics defined (PLOT-GAPS-FILLED §6, save system). Final choice has 3 distinct paths but limited player-action responsiveness.

---

## Scoring Summary Template

| # | Criterion | Score (1–5) | Evidence / Notes |
|---|-----------|-------------|------------------|
| 1 | Emotional Impact | | |
| 2 | Character Consistency | | |
| 3 | Escalation Effectiveness | | |
| 4 | Dialogue Authenticity | | |
| 5 | Ending Satisfaction | | |
| 6 | Audio-Drama Immersion | | |
| 7 | Procedural Narrative Variety | | |
| 8 | Mission Briefing Integration | | |
| 9 | Cohesion & Internal Consistency | | |
| 10 | Player Agency & Choice Resonance | | |
| | **OVERALL** (average) | | |

---

## Phase-Appropriate Expectations

Since *Darius Star* is in active development, different criteria have different "acceptable" score targets based on implementation phase:

| Criterion | Phase-Appropriate Target | Notes |
|-----------|--------------------------|-------|
| Emotional Impact | 2–3 (design complete, awaiting VO/implementation) | Emotional beats designed, not yet playable |
| Character Consistency | 3–4 (voice profiles complete, banter being written) | Profiles are the strongest asset |
| Escalation Effectiveness | 3–4 (escalation map exists, needs playtesting) | Structure is solid |
| Dialogue Authenticity | 2–3 (banter exists, volume limited) | Quality is good, quantity needs growth |
| Ending Satisfaction | 1–2 (designed but no implementation) | Earliest phase |
| Audio-Drama Immersion | 2 (pipeline designed, assets not generated) | Design is thorough |
| Procedural Variety | 2–3 (systems exist, content needs expansion) | Architecture supports it |
| Mission Briefing Integration | 3 (briefings exist for all biomes) | Most complete criterion |
| Cohesion | 2–3 (strong core, document inconsistencies exist) | See Deep Audit |
| Player Agency | 2 (pull-out works, choice system designed) | Core loop works |

---

*End of Story Evaluation Rubric — Darius Star: Cyber Coelacanth*
*Aligned with Michael Gulden's 13 story directives (2026-06-09)*
