/**
 * Darius Star — Banter Engine (GRO-957 / GRO-1004)
 * Event-driven in-mission dialogue. PG-rated, 75% positive.
 * Supports Solo/Duo/4P. Event triggers: level_start, unique_enemy,
 * boss_entrance, player_death, player_respawn, low_health, 
 * wave_clear, level_end, pull_out.
 */

const BanterEngine = {
    _playerCount: 1,
    _playedLines: new Set(),
    _activeLine: null,
    _activeResponse: null,
    _displayTimer: 0,
    _lineDuration: 4.0,

    _data: {
        1: { level_start: [
            {s:'D', l:"Deepest place on Earth. Grandpa made it here forty years ago."},
            {s:'N', l:"The water pressure would crush conventional alloys. The Nyxa is not conventional."},
            {s:'L', l:"Daddy, I can feel something down there. It's old. It's been waiting."},
        ], unique_enemy: [
            {s:'D', l:"What IS that thing? Some kind of mechanical angler fish?"},
            {s:'N', l:"A biosynthetic sentinel. The Coelacanth network spawns defenders."},
        ], boss_entrance: [
            {s:'D', l:"That's no wreckage. That's the Guardian. It's moving."},
            {s:'L', l:"Daddy... it knows you're here. It recognizes something in you."},
        ], player_death: [
            {s:'D', l:"Not yet. I'm not done yet. Lyra's waiting."},
        ], player_respawn: [
            {s:'D', l:"Second try. The deep doesn't get to win that easily."},
        ], low_health: [
            {s:'D', l:"Shields failing! I need some breathing room!"},
        ], wave_clear: [
            {s:'D', l:"Squadron clear. Moving deeper."},
        ], level_end: [
            {s:'D', l:"The Warden transmitted coordinates. He knew I'd come."},
        ], pull_out: [
            {s:'D', l:"These anglerfish drones locked onto my heat signature! I'm pulling out!", r:{s:'N', l:"Thrusters to maximum, Darius. The trench pressure is compounding the damage!"}},
            {s:'L', l:"The dark in this trench is... heavy. It's trying to swallow my voice. I have to break contact!", r:{s:'D', l:"Lyra! Hold on, I'm clearing the comm interference. Retreating!"}},
            {s:'N', l:"Cybernetic jellyfish swarm is overloading my shields! I'm pulling back to the reef edge!"},
            {s:'T', l:"Old sensors are blind in this silt. I'm backing out before I scrape the trench walls.", r:{s:'N', l:"Thorne, watch your depth. The current is rising. Regroup!"}},
            {s:'N', l:"My biosynthetic hull is reacting to the Guardian's radiation. I must disengage!", r:{s:'D', l:"Ophion, retreat to the coordinates. Don't let that thing rewrite your core."}},
            {s:'S', l:"Comms from Haven-7 are fracturing. The abyssal distortion is too thick, I'm dropping offline!", r:{s:'L', l:"Grandma, I can still hear you in the water... stay safe."}},
            {s:'A', l:"They come with fire... violating the ancient quiet... we must scatter their light!", r:{s:'N', l:"The Architect's nightmare is reacting. Disengage before the signal corrupts!"}},
            {s:'D', l:"Sunlight's still filtering down here. Can't lose focus this early in the dive. Pulling back to the ridge!", r:{s:'N', l:"Surface refraction is distorting your sensor array, Darius. Regroup at depth."}},
            {s:'L', l:"The earth is cracking open... there's fire underneath the ocean floor! Daddy, the bottom is falling out!", r:{s:'D', l:"Lyra, stay locked on my signal! I'm pulling us up from the fissure!"}},
        ]},
        2: { level_start: [
            {s:'D', l:"Coral graveyard. Whole reef, just dead. The Dreamer's been here."},
            {s:'N', l:"This was a thriving precursor colony. What happened here was deliberate."},
        ], unique_enemy: [
            {s:'D', l:"Is that a GHOST? Coral formations don't just attack."},
            {s:'N', l:"Memory echoes. The reef remembers what killed it."},
        ], boss_entrance: [
            {s:'D', l:"The vault's defense system. Made of their deaths."},
        ], player_death: [
            {s:'D', l:"I can't... Lyra, I'm sorry..."},
        ], player_respawn: [
            {s:'D', l:"Second attempt. This reef deserves better than silence."},
        ], low_health: [
            {s:'D', l:"Hull integrity failing! These memories hit harder than torpedoes."},
        ], wave_clear: [
            {s:'D', l:"Wave clear. The reef is quiet for now."},
        ], level_end: [
            {s:'D', l:"The precursors chose extinction. What kind of courage is that?"},
            {s:'N', l:"The kind that leaves echoes for ten thousand years."},
        ], pull_out: [
            {s:'D', l:"The memory vault defenses are firing phantom spikes! I'm pulling out before my hull crystallizes!", r:{s:'N', l:"Darius, watch those white beams! Regroup at the perimeter!"}},
            {s:'L', l:"So many old voices crying in this reef... it hurts! I have to shut them out!", r:{s:'S', l:"Close your eyes, Lyra. Focus on my voice. We're retreating."}},
            {s:'N', l:"Ghost coral spores are clogging my engine intakes! I'm backing off to purge!", r:{s:'T', l:"Purge engines now, Naya. I'll blast the calcified nodes off your hull."}},
            {s:'T', l:"These memory echoes are mimicking my old squad's signals. It's messing with my heads-up. Pulling back.", r:{s:'N', l:"The reef uses neural ghosts to trap predators, Commander. Retreat is logical."}},
            {s:'N', l:"This was our home... but the resonance of their deaths is tearing my framework apart. Disengaging!", r:{s:'L', l:"Ophion, it's okay, they're gone now. Come back to the ship."}},
            {s:'S', l:"My monitors are picking up precursor memory-drains on your energy reserves. Fall back immediately!", r:{s:'D', l:"Acknowledged, Mom. Breaking contact and pulling out."}},
            {s:'A', l:"The graves are empty... yet they sing of the ending... we will not let you disturb the dust!"},
            {s:'N', l:"Some of this reef is still alive! The colors are incredible... but my hull won't take much more. Pulling back!", r:{s:'S', l:"Naya, the living reef will endure without us. Fall back to the perimeter."}},
        ]},
        3: { level_start: [
            {s:'D', l:"Europa. Beneath the ice. Where Coelacanths were born."},
            {s:'N', l:"The hatchery. I have complicated feelings about this place."},
        ], unique_enemy: [
            {s:'D', l:"Half-formed Coelacanth. Twisted. Wrong."},
        ], boss_entrance: [
            {s:'D', l:"The Queen. She sees me as raw material for new young."},
        ], level_end: [
            {s:'D', l:"Ophion really thought he could talk to the Dreamer."},
        ], pull_out: [
            {s:'D', l:"Freezing water is locking up my primary flight surfaces! Pulling back before I freeze solid!", r:{s:'N', l:"Engaging hull heaters, Darius. Retrograde immediately."}},
            {s:'L', l:"The Hatchery Queen... she thinks I'm one of her children! She's pulling my mind down! Help!", r:{s:'D', l:"Lyra, break the link! I'm moving in, pulling out now!"}},
            {s:'N', l:"Half-formed Coelacanths are swarming my cockpit glass! Breaking off to shake them!"},
            {s:'T', l:"Ice shelf collapsing above us! I'm punching the thrusters to get clear!", r:{s:'N', l:"Thorne, watch your radar! There's a second shelf below!"}},
            {s:'N', l:"This hatchery was my birthplace... but it's corrupted. The cold is piercing my bio-circuits. Retreating!", r:{s:'S', l:"Ophion, head for the heated exhaust conduits. We'll stabilize you."}},
            {s:'S', l:"Temperatures in the Hatchery are dropping to absolute zero. Comms are freezing. Get out of there!", r:{s:'D', l:"Engines firing. We're pulling out of the sub-glacial pocket."}},
            {s:'A', l:"Cold... dark... the cradle is broken... we will freeze the intruders in their steel shells!", r:{s:'L', l:"The cold... it's not anger, it's just fear. Daddy, we have to pull back!"}},
            {s:'T', l:"Point-defense turrets have locked onto my approach vector! I can't penetrate the outer shell. Pulling back!", r:{s:'D', l:"Thorne, mark the turret grid on tac. We'll flank after the cooldown cycle."}},
        ]},
        4: { level_start: [
            {s:'D', l:"The Veil Nebula. They say it's partially awake."},
            {s:'L', l:"Daddy, I can hear it. Not words — feelings. It's so lonely."},
        ], unique_enemy: [
            {s:'D', l:"That enemy just changed shape. Reality is thin here."},
        ], boss_entrance: [
            {s:'D', l:"A giant made of gas and thought. How do you fight a dream?"},
        ], level_end: [
            {s:'D', l:"The Dreamer showed me my own memories. It wasn't attacking."},
            {s:'L', l:"It just wants someone to listen, Daddy."},
        ], pull_out: [
            {s:'D', l:"Reality is warping my hull geometry! My thrusters are firing backward! Pulling out!"},
            {s:'L', l:"The Dreamer is whispering directly to me... the stars are too bright! I can't breathe!", r:{s:'N', l:"Lyra, baby, listen to Mom's voice. I'm pulling your ship out of the nebula."}},
            {s:'N', l:"These shape-shifters are mimicking my sensor targets. I can't tell friend from foe. Backing off!", r:{s:'D', l:"Naya, standard beacon code engaged. Regroup on my signal."}},
            {s:'T', l:"My instrument panel is showing coordinates that don't exist. I'm flying blind. Pulling back!", r:{s:'N', l:"The Veil nebula bends local space, Commander. Rely on physical feedback."}},
            {s:'N', l:"The boundary between thought and matter is dissolving here. I am losing physical form! Disengaging!", r:{s:'S', l:"Ophion, lock your molecular stabilizer. Retracting to Haven-7!"}},
            {s:'S', l:"Telemetry from the Veil is pure noise. I'm losing your location on the map. Fall back!", r:{s:'D', l:"Signal lost. We're aborting the run and heading for the edge!"}},
            {s:'A', l:"All thoughts are one... why do you cling to your shapes... dissolve into the chorus!", r:{s:'L', l:"No! I want my own voice! I'm breaking the connection!"}},
            {s:'S', l:"The outer nebula gas is denser than our long-range scans indicated. Radiation is spiking on all monitors. Pull back!", r:{s:'T', l:"Acknowledged, Selene. Squad is adjusting course to the plasma current."}},
            {s:'N', l:"Supernova debris is pelting my hull like a meteor storm! I'm pulling out of the blast radius!", r:{s:'D', l:"Naya, tuck behind my shield pattern. We're retreating to the gravitational shadow."}},
        ]},
        5: { level_start: [
            {s:'D', l:"Saturn's rings. Beautiful from a distance. Up close, frozen shrapnel."},
        ], boss_entrance: [
            {s:'C', l:"The Kraken's the priority. My squad — I'll handle them."},
        ], level_end: [
            {s:'D', l:"You defected. Why?"},
            {s:'C', l:"Because I had a son too. And the Navy took him."},
        ], pull_out: [
            {s:'D', l:"Squadron Umbra has me locked with heavy torpedoes! Pulling out of the ring plane!", r:{s:'T', l:"Darius, dive into the ice debris. I'll draw their target locks."}},
            {s:'L', l:"The metal ships... they are so angry, they want to kill us. I'm dropping the sensor link!", r:{s:'S', l:"Good choice, Lyra. Let the fighters handle the Navy. Fall back."}},
            {s:'N', l:"Ice shrapnel is shearing my stabilizer fins! Breaking formation to avoid collision!", r:{s:'D', l:"Naya, watch the drift! Pulling back with you."}},
            {s:'T', l:"Navy jammer has cut my fire control. Weapons are cold. I'm out of here!", r:{s:'N', l:"Purging jammer frequency now, Thorne. Fall back to my position."}},
            {s:'N', l:"The kinetic impactors are too dense in this ring sector. My shielding is failing. Disengaging!"},
            {s:'S', l:"Navy cruisers are warping in behind your position. You're about to be flanked. Fall back!", r:{s:'D', l:"Cruisers spotted. Tactical retreat, squad, move!"}},
            {s:'A', l:"Iron walls... cage of dust... they will grind your small ships to ash...", r:{s:'N', l:"The nightmares are utilizing Navy panic. Break off before the feedback loops!"}},
            {s:'L', l:"The ice crystals are so beautiful... they're singing like wind chimes. But the sound is making my head hurt. I have to pull back!", r:{s:'S', l:"Lyra, the crystals are resonating with Dreamer energy. Close your neural link now."}},
            {s:'T', l:"Absolute zero temperatures are freezing my fuel lines solid. Thrusters are sluggish. Pulling back before I'm a frozen hulk!"},
        ]},
        6: { level_start: [
            {s:'D', l:"Supernova remnant. Every surface is slag."},
        ], level_end: [
            {s:'D', l:"Haven-7 was attacked. Lyra is changing. I need to get back."},
            {s:'L', l:"Daddy, the thing in the dark isn't angry. It's scared."},
        ], pull_out: [
            {s:'D', l:"Thermal shield is melting! My cockpit is burning up! I'm pulling out!", r:{s:'N', l:"Redirecting coolants to your primary cabin, Darius. Retreat immediately."}},
            {s:'L', l:"The fire... it's screaming. Haven-7 was attacked... Selene? Mom? I can't hear them!", r:{s:'D', l:"Lyra, I'm here! Comms are down due to the flare, I'm pulling back to you!"}},
            {s:'N', l:"Haven-7 is burning... the Navy found us! I have to break off and defend Lyra!", r:{s:'S', l:"Naya, go! I'm venting the hangar bay to delay them. Get back here!"}},
            {s:'C', l:"Forge-Mind plasma beam has melted my armor plating. Pulling back before my reactor blows!", r:{s:'T', l:"Valera, eject your heatsinks. I'll cover your retreat."}},
            {s:'T', l:"Solar winds are pushing my steering thrusters past their limits. I'm backing out!", r:{s:'N', l:"Thorne, steer with the solar flow. Regroup in the shadow of the asteroid."}},
            {s:'N', l:"Supernova remnants are disrupting my biosynthetic cellular matrix. I must retreat to cool down!", r:{s:'C', l:"Copy that, Ophion. I've got your six. Get to the safe zone."}},
            {s:'S', l:"The station hangar is breached! Automated systems are failing, I'm dropping offline to seal the bulkheads!", r:{s:'N', l:"Selene! Hold on, I'm pulling out of the nebula to assist!"}},
            {s:'A', l:"Ash to ash... everything burns in the wake of the star... you will fade like the precursors...", r:{s:'L', l:"The fire isn't yours! It's just a dream! Daddy, pulling back!"}},
            {s:'S', l:"The ember field is setting off every heat sensor on Haven-7! You're flying into a furnace. Pull back to the ash belt!", r:{s:'D', l:"Mom, we see it. Cooling thrusters engaged. Pulling out of the embers."}},
            {s:'N', l:"Volcanic ejecta mass is exceeding my trajectory prediction models. This eruption is geological! Disengaging!", r:{s:'C', l:"Ophion, the magma plume is spreading laterally. Retreat to the obsidian shelf."}},
        ]},
        7: { level_start: [
            {s:'D', l:"Eternal hurricane. Five thousand mph winds. A mad god in the eye."},
        ], level_end: [
            {s:'D', l:"The Storm-Singer chose death over madness."},
        ], pull_out: [
            {s:'D', l:"The atmospheric pressure is crushing my hull! Winds are tearing my wings off! Pulling out!", r:{s:'C', l:"Thrust down into the lower drafts, Darius. I'm falling back too."}},
            {s:'L', l:"The lightning... it's singing. It's so loud it hurts my head! I have to go!", r:{s:'D', l:"Lyra, close the audio feed! I'm pulling us out of the storm!"}},
            {s:'N', l:"Megastorm lightning has shorted my primary battery! I'm dead in the air, pulling back!", r:{s:'T', l:"Towing cable deployed, Naya. Hold on, I'm dragging you out!"}},
            {s:'C', l:"Winds have locked my control surfaces! I'm in a terminal dive, breaking off!", r:{s:'O', l:"Engaging wind-deflection shields. Fall back to my coordinate."}},
            {s:'T', l:"Fierce drafts are throwing me into the Colossus's path! I can't hold her steady. Pulling back!", r:{s:'N', l:"Thorne, engage emergency ballast. Retreat to the eye!"}},
            {s:'O', l:"My biosynthetic wings are shredding in the Jovian storm. Structural integrity at critical. Retreating!", r:{s:'S', l:"Ophion, head for the hot updrafts. We're pulling back the squad."}},
            {s:'S', l:"Hurricane winds are jamming my satellite relays. I'm losing telemetry. Abort and retreat!", r:{s:'D', l:"Relays failing. Squad, climb out of the clouds now!"}},
            {s:'A', l:"Wind and fury... clean the sky of their metal bugs... silence their tiny screams...", r:{s:'C', l:"The storm is reacting to our comms. Break off and drop to the quiet zone!"}},
            {s:'N', l:"Static discharge is arcing across my canopy glass! I can barely read my instruments. Pulling back to clear air!", r:{s:'D', l:"Naya, ground your hull on my shield frequency. We're pulling out of the static field together."}},
            {s:'C', l:"EMP burst just knocked out my entire navigation suite! Flying manual in a debris field. Breaking off!", r:{s:'T', l:"Cross, follow my engine trail. I'm dropping a signal flare every five seconds."}},
        ]},
        8: { level_start: [
            {s:'D', l:"The ghost fleet. Hundreds of Navy ships, abandoned."},
        ], level_end: [
            {s:'D', l:"My family was engineered. Three generations. But Lyra is NOT a weapon."},
        ], pull_out: [
            {s:'D', l:"The automated Navy dreadnought has me pinned with heavy lasers! I'm pulling out!", r:{s:'T', l:"Darius, break line of sight behind the wreck. I'm dropping chaff."}},
            {s:'L', l:"Admiral Crane's voice... it's inside my head. He's saying we are all just weapons... I want to leave!", r:{s:'N', l:"Lyra! He's wrong, baby. You're my daughter. I'm pulling you out of the network."}},
            {s:'N', l:"Defense lasers have sliced through my starboard engine! I'm pulling back to the wreckage!", r:{s:'D', l:"Naya, get inside the hull of that carrier. I'll cover your retreat."}},
            {s:'C', l:"Crane's ghost is broadcasting my old codes to lock my ship's systems! I'm losing control, breaking off!", r:{s:'T', l:"Valera, purge the system logs. Retreat to the manual channel."}},
            {s:'T', l:"Old ship graveyard is full of mines. I just tripped a proximity sensor. Pulling back!", r:{s:'O', l:"Proximity mine array active, Commander. I am charting a retreat path."}},
            {s:'O', l:"The dreadnought AI is attempting to upload its corrupted consciousness to my core. I must disconnect!", r:{s:'S', l:"Ophion, sever the wireless link. Retreating to Haven-7's local grid."}},
            {s:'S', l:"Crane's network is hacking my database. I have to shut down Haven-7's main server to protect the logs!", r:{s:'D', l:"Do it, Mom. We're breaking off the run to cover the database."}},
            {s:'A', l:"The dead do not speak... yet their weapons still search the dark... go back to your grave...", r:{s:'L', l:"The dead are just lonely... but they can't have us. Daddy, I'm pulling out!"}},
            {s:'N', l:"Hull fragments are everywhere out here! One just clipped my port stabilizer clean off. Pulling back to clear space!", r:{s:'S', l:"Naya, I'm mapping the debris cloud now. Retreat to the carrier's gravitational shadow."}},
            {s:'T', l:"Radiation leak in sector seven! My dosimeter is screaming off the scale. I'm getting out of the reactor zone!", r:{s:'D', l:"Thorne, seal your suit systems! Regroup at the decontamination lock."}},
        ]},
        9: { level_start: [
            {s:'D', l:"The first world the Dreamer transformed. Nothing here is real."},
        ], level_end: [
            {s:'D', l:"The Hive offered me everything. I almost said yes."},
        ], pull_out: [
            {s:'D', l:"The Hive is showing me Lyra... but it's not her. It's trying to dissolve my mind! Pulling out!", r:{s:'N', l:"Darius, don't look at it! I'm pulling you back, follow my ship!"}},
            {s:'L', l:"The Hive wants to take my memories... they want to keep my childhood. I won't let them!", r:{s:'D', l:"Lyra, hold on to my hand. We're breaking the link and pulling out!"}},
            {s:'N', l:"These false realities are trying to convince me this is Haven-7. I'm pulling back before I lose myself!", r:{s:'C', l:"It's an illusion, Naya. Break the synaptic link. Regroup at the beacon."}},
            {s:'C', l:"Synaptic spikes are overloading my neural link! I can't feel my hands! Pulling out!", r:{s:'T', l:"Cross, override manual control! Fall back to the physical backup!"}},
            {s:'T', l:"The Hive is playing my old squad's voices... saying they're waiting for me. I'm backing out before I believe them.", r:{s:'O', l:"Synaptic echoes are designed to exploit grief, Commander. Retreat immediately."}},
            {s:'O', l:"The Hive wants to merge my precursor database with its collective. I will lose my individuality! Disengaging!", r:{s:'S', l:"Ophion, disconnect the neural bridge. We're pulling you back to Haven-7."}},
            {s:'S', l:"Synaptic interference is overwriting my monitors with memories of Marcus. I'm losing sanity. Dropping link!", r:{s:'D', l:"Mom, disconnect! We're aborting the run. Everyone, pull out!"}},
            {s:'A', l:"Unity... peace... why do you fight the connection... there is no pain in the chorus...", r:{s:'L', l:"My pain is mine! I won't give it away! Breaking link!"}},
            {s:'T', l:"The hive's outer membrane is regenerating faster than we can breach it! I'm pulling back before I'm sealed inside!", r:{s:'O', l:"The membrane uses adaptive protein chains, Commander. Retreat while the entry wound is still fresh."}},
            {s:'S', l:"Egg clusters are pulsating with bioelectric signals! Hatchlings are emerging. Fall back before they imprint on your ships!", r:{s:'N', l:"Selene, I see them! Pulling out of the nursery sector now!"}},
        ]},
        10: { level_start: [
            {s:'D', l:"Edge of a black hole. The last Coelacanth. This is it."},
        ], boss_entrance: [
            {s:'D', l:"That's no reality. That's its nightmares. I have to show it — it's not alone."},
        ], level_end: [
            {s:'D', l:"I'm not here to defeat it. I'm here to answer it."},
        ], pull_out: [
            {s:'D', l:"The black hole's gravity is pulling me past the event horizon! I'm pushing engines to the limit, pulling out!", r:{s:'O', l:"Engaging singularity shield, Darius. Escape trajectory is narrow. Retreat now!"}},
            {s:'L', l:"The Architect's nightmare is too loud... it's the end of everything! I can't look!", r:{s:'D', l:"Lyra, look at me. Only me. We're pulling back to the rift edge."}},
            {s:'N', l:"Gravitational shearing is tearing my hull apart! I have to back off before I'm crushed!", r:{s:'C', l:"Engage reverse thrusters, Naya. I'll drop a gravity anchor to hold you."}},
            {s:'C', l:"Nightmare rifts are appearing inside my cockpit! Reality is fracturing! Breaking off!", r:{s:'T', l:"Cross, focus on my beacon. Retreat to the stable space pocket."}},
            {s:'T', l:"Time dilation is slowing my engines down to zero. I'm getting sucked in! Pulling back!", r:{s:'N', l:"Thorne, fire your overload! We're dragging you out of the gravity well!"}},
            {s:'O', l:"The Architect's fear is manifest. It's rewriting my core protocols to suicide. I must disengage!", r:{s:'S', l:"Ophion, lock your core systems. We're pulling you out of the rift."}},
            {s:'S', l:"The gravitational pull is warping Haven-7's orbit. I have to fire the station engines. Going offline!", r:{s:'D', l:"Save the station, Mom. We're pulling out of the core to assist."}},
            {s:'A', l:"The void... the silence... we will not be dragged into the light... leave us to the dark...", r:{s:'L', l:"You don't have to be afraid anymore... but we are leaving. Daddy, pull out!"}},
            {s:'N', l:"The light from the event horizon is bending around my ship! I can see myself from behind! Pulling out!", r:{s:'S', l:"Naya, that's gravitational lensing. Track my beacon signal, not your eyes."}},
            {s:'C', l:"Geometry is folding in on itself! Up is sideways, forward loops backward. I can't navigate this! Breaking off!", r:{s:'L', l:"Captain Cross, close your eyes and listen to my voice. The Dreamer can't bend sound. I'll guide you out."}},
        ]},
    },
    
    // GRO-1054: Scrap-to-story dialogue — global banter for scrap/upgrade events.
    // Delivered via ScrapEvents listeners rather than the standard getLine/biome path.
    _scrapData: {
        scrap_collected: [
            {s:'D', l:"Another plate. The Nyxa appreciates it."},
            {s:'N', l:"Salvage logged. Every credit counts toward the next push."},
        ],
        scrap_milestone: [
            {s:'D', l:"That's a decent haul. Keep the momentum."},
            {s:'N', l:"Milestone hit. We are not broke yet."},
            {s:'O', l:"Sufficient energy-credits have been banked. Proceed."},
        ],
        legendary_drop: [
            {s:'D', l:"Essence plate! Pre-war alloy. Worth more than a fleet destroyer."},
            {s:'N', l:"LEGENDARY drop! That piece alone would buy a week of station time."},
            {s:'O', l:"An essence fragment. The Dreamer's signature is embedded in the alloy."},
        ],
        upgrade_purchased: [
            {s:'N', l:"Upgrade installed. Should help with what is ahead."},
            {s:'D', l:"Better gear. The deep doesn't get easier."},
            {s:'T', l:"Good investment. That system will earn its keep."},
        ],
        upgrade_max_tier: [
            {s:'N', l:"MAX rank upgrade! That system is fully tuned now."},
            {s:'D', l:"Top of the line. Nothing in the trench can match this."},
            {s:'O', l:"Maximum calibration achieved. The upgrade tree for this branch is complete."},
        ],
    },

    _joinBanter: {
        early: [
            {s:'D', l:"Welcome aboard. We've got a long dive ahead."},
            {s:'D', l:"Glad you made it. This trench doesn't explore itself."},
            {s:'N', l:"Another pilot. We could use the help down here."},
        ],
        mid: [
            {s:'D', l:"Just in time. The heavy fighting's about to start."},
            {s:'D', l:"Right on schedule. Things are heating up."},
            {s:'C', l:"Reinforcements. About time."},
        ],
        late: [
            {s:'D', l:"It's about time! Let's finish this."},
            {s:'D', l:"Welcome! We're at the final push. Every gun counts."},
            {s:'N', l:"Never too late to join the fight!"},
        ],
    },
    _leaveBanter: [
        {s:'D', l:"They'll be back. We keep going."},
        {s:'D', l:"We're still standing. That's what matters."},
        {s:'C', l:"One less gun. We adapt. We always do."},
        {s:'N', l:"They fought well. Now it's on us."},
    ],

    init(playerCount) { this._playerCount = playerCount; this._playedLines.clear(); this.clear(); },

    getLine(trigger, biome, speaker = null) {
        const biomeData = this._data[biome];
        if (!biomeData || !biomeData[trigger]) return null;
        let lines = biomeData[trigger];
        
        // Filter by speaker if requested
        if (speaker) {
            lines = lines.filter(l => l.s === speaker);
            if (lines.length === 0) {
                // Fallback to all if no lines found for this speaker
                lines = biomeData[trigger];
            }
        }
        
        let available = lines.filter((_, i) => !this._playedLines.has(`${biome}_${trigger}_${biomeData[trigger].indexOf(lines[i])}`));
        if (available.length === 0) {
            // Reset played lines for this specific trigger and speaker combo in this biome
            lines.forEach(l => {
                const originalIdx = biomeData[trigger].indexOf(l);
                this._playedLines.delete(`${biome}_${trigger}_${originalIdx}`);
            });
            available = lines;
        }
        
        const idx = Math.floor(Math.random() * available.length);
        const originalIndex = biomeData[trigger].indexOf(available[idx]);
        this._playedLines.add(`${biome}_${trigger}_${originalIndex}`);
        return available[idx];
    },

    getJoinLine(biome) {
        let phase = biome >= 7 ? 'late' : (biome >= 4 ? 'mid' : 'early');
        const lines = this._joinBanter[phase];
        return lines[Math.floor(Math.random() * lines.length)];
    },

    getLeaveLine() { return this._leaveBanter[Math.floor(Math.random() * this._leaveBanter.length)]; },

    trigger(event, biome, speaker = null) {
        const line = this.getLine(event, biome, speaker);
        if (line) {
            this.clear();
            this._activeLine = line;
            this._displayTimer = this._lineDuration;
        }
        return line;
    },

    triggerDirect(line, duration = this._lineDuration) {
        if (!line) return null;
        this.clear();
        this._activeLine = line;
        this._displayTimer = duration;
        return line;
    },

    update(dt) {
        if (this._displayTimer > 0) {
            this._displayTimer -= dt;
            if (this._displayTimer <= 0) {
                if (this._activeLine && this._activeLine.r && !this._activeResponse) {
                    // Show response
                    this._activeResponse = this._activeLine.r;
                    this._displayTimer = this._lineDuration;
                } else {
                    this.clear();
                }
            }
        }
    },

    getActive() { return this._activeResponse || this._activeLine; },
    clear() { this._activeLine = null; this._activeResponse = null; this._displayTimer = 0; },

    // GRO-1054: Trigger a scrap/upgrade event line from _scrapData.
    // Falls back to event-system banter (SCRAP_NARRATIVE_BEATS) if no specific data.
    triggerScrapEvent(trigger, line) {
        if (line) {
            // Direct line provided (from legacy SCRAP_NARRATIVE_BEATS)
            return this.triggerDirect(line, 5.0);
        }
        const lines = this._scrapData[trigger];
        if (lines && lines.length > 0) {
            const pick = lines[Math.floor(Math.random() * lines.length)];
            return this.triggerDirect(pick, 4.0);
        }
        return null;
    },

    /**
     * GRO-1054: Wire ScrapEvents into the banter system.
     * Call once after both modules are loaded (e.g. from game_loop.js init).
     */
    initScrapEvents() {
        if (!window.ScrapEvents) return;

        ScrapEvents.on('scrap:collected', () => {
            if (this.getActive()) return; // don't stomp active dialogue
            this.triggerScrapEvent('scrap_collected');
        });

        ScrapEvents.on('scrap:milestone', () => {
            if (this.getActive()) return;
            this.triggerScrapEvent('scrap_milestone');
        });

        ScrapEvents.on('scrap:legendary', () => {
            // Legendary drops are rare — override active dialogue if needed
            this.triggerScrapEvent('legendary_drop');
        });

        ScrapEvents.on('upgrade:purchased', () => {
            if (this.getActive()) return;
            this.triggerScrapEvent('upgrade_purchased');
        });

        ScrapEvents.on('upgrade:max_tier', () => {
            // Max tier upgrades are significant — override active dialogue
            this.triggerScrapEvent('upgrade_max_tier');
        });
    },
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BanterEngine;
}
// Attach to window for browser access (required by game_loop.js)
window.BanterEngine = BanterEngine;
