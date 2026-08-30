// banter_db.js — Darius Star banter dialogue database (GRO-1050 / GRO-4202)
// Attempt-aware progressive dialogue: Tier 1 (Recon), Tier 2 (Tactical), Tier 3 (Tenacity/Mastery)
// Speaker codes: D=Darius, N=Naya, L=Lyra, T=Thorne, C=Cross,
//                S=Selene (Comms), A=Architect, O=Ophion

const BanterDB = {
  _data: {
    1: {
      level_start: {
        tier1: [
          {s:'D', l:"Deepest place on Earth. Grandpa made it here forty years ago."},
          {s:'N', l:"The water pressure would crush conventional alloys. The Nyxa is not conventional."},
          {s:'L', l:"Daddy, I can feel something down there. It's old. It's been waiting."}
        ],
        tier2: [
          {s:'D', l:"Watch the silt vents this time! That last ambush took our shields down fast."},
          {s:'N', l:"Sensors recalibrated. Acoustic sentinels cluster on the left ridge—flank them early."},
          {s:'L', l:"Daddy, I can read their pulse rhythm now. Shoot when the biolight flashes green!"}
        ],
        tier3: [
          {s:'D', l:"Third dive into the silt. We know their patrol loops now. Clear them out."},
          {s:'T', l:"No hesitation, Darius. Full burn through the trench choke point."},
          {s:'N', l:"We have the tactical advantage this run. Let's finish the sweep clean."}
        ]
      },
      unique_enemy: [
        {s:'D', l:"What IS that thing? Some kind of mechanical angler fish?"},
        {s:'N', l:"A biosynthetic sentinel. The Coelacanth network spawns defenders."},
        {s:'L', l:"Its lantern is broadcasting a jammer pulse! Don't look at the light!"}
      ],
      boss_entrance: {
        tier1: [
          {s:'D', l:"That's no wreckage. That's the Guardian. It's moving."},
          {s:'L', l:"Daddy... it knows you're here. It recognizes something in you."}
        ],
        tier2: [
          {s:'D', l:"Aim for the dorsal energy vents before it charges the main beam! Don't let it pin us."},
          {s:'N', l:"Targeting arrays locked onto the lateral nodes. Break the shield generators first!"},
          {s:'T', l:"Keep your distance on the charge cycle, Darius! It sweeps the lower quadrant."}
        ],
        tier3: [
          {s:'D', l:"We know every move it makes now. Tear down those hardpoints!"},
          {s:'L', l:"It's weakening, Daddy! Strike the core while its rhythm stutters!"},
          {s:'N', l:"Maximum firepower. This Leviathan goes down right now."}
        ]
      },
      player_death: [
        {s:'D', l:"Not yet. I'm not done yet. Lyra's waiting."},
        {s:'N', l:"Darius, hull failure! Emergency nanites deploying!"},
        {s:'L', l:"Daddy! Hold on, I'm boosting the emergency beacon!"}
      ],
      player_respawn: {
        tier1: [
          {s:'D', l:"Second try. The deep doesn't get to win that easily."}
        ],
        tier2: [
          {s:'D', l:"Rerouted power from life support to forward deflectors. Let's counter them."},
          {s:'N', l:"Nanite matrix restored. Angle your shields against the pressure wave."}
        ],
        tier3: [
          {s:'D', l:"Iron resolve. We're punching through this sector today."},
          {s:'T', l:"Back in the fight, scrapper. Make every shot count."}
        ]
      },
      low_health: [
        {s:'D', l:"Shields failing! I need some breathing room!"},
        {s:'N', l:"Critical shield warning! Disengage from the crossfire!"},
        {s:'L', l:"Daddy, danger! Hull stress at 90%!"}
      ],
      wave_clear: [
        {s:'D', l:"Squadron clear. Moving deeper."},
        {s:'N', l:"Path sanitized. Scanners picking up next wave."},
        {s:'L', l:"Good shooting, Daddy! The way is open."}
      ],
      level_end: [
        {s:'D', l:"The Warden transmitted coordinates. He knew I'd come."},
        {s:'N', l:"Trench sector cleared. Descending to next depth horizon."},
        {s:'L', l:"I can hear the reef singing ahead. We're getting closer."}
      ],
      pull_out: [
        {s:'D', l:"These anglerfish drones locked onto my heat signature! I'm pulling out!", r:{s:'N', l:"Thrusters to maximum, Darius. The trench pressure is compounding the damage!"}},
        {s:'L', l:"The dark in this trench is... heavy. It's trying to swallow my voice. I have to break contact!", r:{s:'D', l:"Lyra! Hold on, I'm clearing the comm interference. Retreating!"}},
        {s:'N', l:"Cybernetic jellyfish swarm is overloading my shields! I'm pulling back to the reef edge!"},
        {s:'T', l:"Old sensors are blind in this silt. I'm backing out before I scrape the trench walls.", r:{s:'N', l:"Thorne, watch your depth. The current is rising. Regroup!"}},
        {s:'S', l:"Comms from Haven-7 are fracturing. The abyssal distortion is too thick, I'm dropping offline!", r:{s:'L', l:"Grandma, I can still hear you in the water... stay safe."}}
      ]
    },

    2: {
      level_start: {
        tier1: [
          {s:'D', l:"Coral graveyard. Whole reef, just dead. The Dreamer's been here."},
          {s:'N', l:"This was a thriving precursor colony. What happened here was deliberate."}
        ],
        tier2: [
          {s:'D', l:"Watch for the calcified spore mines. Clear them at distance before entering the archway."},
          {s:'N', l:"Spore density is highest along the floor. Keep flight path elevated."},
          {s:'L', l:"The ghost echoes are loud near the monoliths. I'm filtering the frequency."}
        ],
        tier3: [
          {s:'D', l:"We know the reef's layout now. Strike fast and don't linger in the spore clouds."},
          {s:'T', l:"Sweep the calcified snipers before they anchor. Move!"},
          {s:'N', l:"Precision flight protocol. The reef won't claim us this time."}
        ]
      },
      unique_enemy: [
        {s:'D', l:"Is that a GHOST? Coral formations don't just attack."},
        {s:'N', l:"Memory echoes. The reef remembers what killed it."}
      ],
      boss_entrance: {
        tier1: [
          {s:'D', l:"The vault's defense system. Made of their deaths."},
          {s:'N', l:"Massive crystalline bio-construct. Resonance frequencies off the scale."}
        ],
        tier2: [
          {s:'D', l:"Shatter the outer crystal facets before it focuses the prismatic beam!"},
          {s:'T', l:"Cross your fire across the central spire. Don't let it regenerate!"},
          {s:'L', l:"Daddy, the singing stops when the amber crystals break! Target those!"}
        ],
        tier3: [
          {s:'D', l:"Third round with the Vault Golem. Break its prism array and finish it."},
          {s:'N', l:"Executing synchronized bombardment. Core exposure guaranteed."}
        ]
      },
      player_death: [
        {s:'D', l:"I can't... Lyra, I'm sorry..."},
        {s:'N', l:"Darius is down! Activating emergency extraction!"}
      ],
      player_respawn: {
        tier1: [
          {s:'D', l:"Second attempt. This reef deserves better than silence."}
        ],
        tier2: [
          {s:'D', l:"Frequency dampers installed. The memory screams won't slow us down."},
          {s:'N', l:"Sensors compensated for psychic refraction. Ready to engage."}
        ],
        tier3: [
          {s:'D', l:"We're making it through this graveyard. All guns blazing."}
        ]
      },
      low_health: [
        {s:'D', l:"Hull integrity failing! These memories hit harder than torpedoes."},
        {s:'N', l:"Hull breach imminent! Evasive maneuvers!"}
      ],
      wave_clear: [
        {s:'D', l:"Wave clear. The reef is quiet for now."},
        {s:'N', l:"Memory constructs dispersed. Path forward identified."}
      ],
      level_end: [
        {s:'D', l:"The precursors chose extinction. What kind of courage is that?"},
        {s:'N', l:"The kind that leaves echoes for ten thousand years."}
      ],
      pull_out: [
        {s:'D', l:"The memory vault defenses are firing phantom spikes! I'm pulling out before my hull crystallizes!", r:{s:'N', l:"Darius, watch those white beams! Regroup at the perimeter!"}},
        {s:'L', l:"So many old voices crying in this reef... it hurts! I have to shut them out!", r:{s:'S', l:"Close your eyes, Lyra. Focus on my voice. We're retreating."}},
        {s:'N', l:"Ghost coral spores are clogging my engine intakes! I'm backing off to purge!", r:{s:'T', l:"Purge engines now, Naya. I'll blast the calcified nodes off your hull."}}
      ]
    },

    3: {
      level_start: {
        tier1: [
          {s:'D', l:"Europa. Beneath the ice. Where Coelacanths were born."},
          {s:'N', l:"The hatchery. I have complicated feelings about this place."}
        ],
        tier2: [
          {s:'D', l:"Sub-zero brine pools are freezing our thrusters. Use boost sparingly!"},
          {s:'T', l:"Cryo-mines ahead. Detonate them early with wide spread shot."},
          {s:'L', l:"The baby bio-drones attack in triplets. Watch your six, Daddy!"}
        ],
        tier3: [
          {s:'D', l:"We know the ice currents now. Full thrust through the nursery."},
          {s:'N', l:"Thermal cannons primed. Melting through their defensive perimeter."}
        ]
      },
      unique_enemy: [
        {s:'D', l:"Half-formed Coelacanth. Twisted. Wrong."},
        {s:'N', l:"An embryonic prototype. The bio-fabricator is running corrupt templates."}
      ],
      boss_entrance: {
        tier1: [
          {s:'D', l:"The Queen. She sees me as raw material for new young."},
          {s:'L', l:"Daddy... she's crying. She thinks she's protecting her nest."}
        ],
        tier2: [
          {s:'D', l:"Sever the egg sacs before she spawns the escort swarm!"},
          {s:'N', l:"Concentrate fire on the cryo-sacs. Disabling her freezing aura!"},
          {s:'T', l:"Roll out of her pounce trajectory! She hits the ceiling then dives!"}
        ],
        tier3: [
          {s:'D', l:"No more hesitation. Free the Queen from her corrupted loop."},
          {s:'N', l:"Firing heavy armor-piercing salvo. The hatchery falls now."}
        ]
      },
      player_death: [
        {s:'D', l:"It's so cold... Lyra..."},
        {s:'N', l:"Darius, wake up! Don't let the frost claim you!"}
      ],
      player_respawn: {
        tier1: [
          {s:'D', l:"Heating systems at maximum. Let's finish the dive."}
        ],
        tier2: [
          {s:'D', l:"Hull de-icers active. Ready for their cryo-spread."},
          {s:'N', l:"Shield modulation calibrated to thermal frequencies."}
        ],
        tier3: [
          {s:'D', l:"Unbreakable. Let's crack this ice shelf wide open."}
        ]
      },
      low_health: [
        {s:'D', l:"Cryo-damage creeping into the cockpit! Life support failing!"}
      ],
      wave_clear: [
        {s:'D', l:"Hatchery defenders cleared. Deeper into the sub-glacial trench."}
      ],
      level_end: [
        {s:'D', l:"Ophion really thought he could talk to the Dreamer."},
        {s:'N', l:"He was young. We all believed we could save everything back then."}
      ],
      pull_out: [
        {s:'D', l:"Freezing water is locking up my primary flight surfaces! Pulling back before I freeze solid!", r:{s:'N', l:"Engaging hull heaters, Darius. Retrograde immediately."}},
        {s:'L', l:"The Hatchery Queen... she thinks I'm one of her children! She's pulling my mind down! Help!", r:{s:'D', l:"Lyra, break the link! I'm moving in, pulling out now!"}},
        {s:'T', l:"Ice shelf collapsing above us! I'm punching the thrusters to get clear!", r:{s:'N', l:"Thorne, watch your radar! There's a second shelf below!"}}
      ]
    },

    4: {
      level_start: {
        tier1: [
          {s:'D', l:"The Veil Nebula. They say it's partially awake."},
          {s:'L', l:"Daddy, I can hear it. Not words — feelings. It's so lonely."}
        ],
        tier2: [
          {s:'D', l:"Watch out for visual mirages! Sensors lag by two seconds in this plasma cloud."},
          {s:'N', l:"Lock on to tachyon signatures, not optical scans. The clouds bend light."},
          {s:'T', l:"Maintain tight formation. If you get separated in the Veil, you're toast."}
        ],
        tier3: [
          {s:'D', l:"We see through their illusions now. Target the true plasma cores."},
          {s:'N', l:"Full sensor synchronization. Cutting right through the nebula fog."}
        ]
      },
      unique_enemy: [
        {s:'D', l:"That enemy just changed shape. Reality is thin here."},
        {s:'N', l:"Quantum superposition drones. Shoot them before they collapse into armor state."}
      ],
      boss_entrance: {
        tier1: [
          {s:'D', l:"A giant made of gas and thought. How do you fight a dream?"},
          {s:'L', l:"It's not fighting us, Daddy... it's just trying to wake up!"}
        ],
        tier2: [
          {s:'D', l:"Disperse the plasma vortices with spread fire before it creates a cyclone!"},
          {s:'N', l:"Target the anchor beacons on its perimeter! That's what holds its form!"},
          {s:'T', l:"Keep moving laterally! Its tachyon beam locks onto stationary vectors!"}
        ],
        tier3: [
          {s:'D', l:"We know the cyclone patterns. Break its anchors and free the sky!"},
          {s:'L', l:"The dream is clearing, Daddy! Final burst!"}
        ]
      },
      player_death: [
        {s:'D', l:"The colors... they're taking over..."},
        {s:'L', l:"Daddy! Stay in your ship! Don't let the nebula dissolve you!"}
      ],
      player_respawn: {
        tier1: [
          {s:'D', l:"Focus. Anchor to reality. We're flying through."}
        ],
        tier2: [
          {s:'D', l:"Tachyon filters engaged. Illusions won't trick us again."},
          {s:'N', l:"Stabilizer gyros locked. Pushing forward."}
        ],
        tier3: [
          {s:'D', l:"Nothing stops this run. Let's finish the Veil."}
        ]
      },
      low_health: [
        {s:'D', l:"Cockpit glass is refracting! I can't tell which way is forward!"}
      ],
      wave_clear: [
        {s:'D', l:"Nebula sector clear. The stars are looking sharper."}
      ],
      level_end: [
        {s:'D', l:"The Dreamer showed me my own memories. It wasn't attacking."},
        {s:'L', l:"It just wants someone to listen, Daddy."}
      ],
      pull_out: [
        {s:'D', l:"Reality is warping my hull geometry! My thrusters are firing backward! Pulling out!"},
        {s:'L', l:"The Dreamer is whispering directly to me... the stars are too bright! I can't breathe!", r:{s:'N', l:"Lyra, baby, listen to Mom's voice. I'm pulling your ship out of the nebula."}},
        {s:'N', l:"These shape-shifters are mimicking my sensor targets. I can't tell friend from foe. Backing off!", r:{s:'D', l:"Naya, standard beacon code engaged. Regroup on my signal."}}
      ]
    },

    5: {
      level_start: {
        tier1: [
          {s:'D', l:"Saturn's rings. Beautiful from a distance. Up close, frozen shrapnel."},
          {s:'C', l:"Navy patrol frequency active. They're hunting us with heavy destroyers."}
        ],
        tier2: [
          {s:'D', l:"Navy strike wings use converging crossfires. Punch through the lead fighter early!"},
          {s:'C', l:"I know their tactical playbook. They deploy railgun turrets behind the ice boulders."},
          {s:'T', l:"Keep your shields angled forward. Don't get bracketed by their flak."}
        ],
        tier3: [
          {s:'D', l:"We outfly their best aces every time. Sweep the ring plane!"},
          {s:'C', l:"Navy command has no answer for our maneuvers. Advance and dismantle."}
        ]
      },
      unique_enemy: [
        {s:'C', l:"Umbra Squad stealth interceptors. They decloak right before firing."},
        {s:'D', l:"Watch for the radar ripple before they strike."}
      ],
      boss_entrance: {
        tier1: [
          {s:'C', l:"The Kraken's the priority. My squad — I'll handle them."},
          {s:'D', l:"Massive Navy mobile fortress. It's deploying heavy torpedo bays."}
        ],
        tier2: [
          {s:'C', l:"Destroy the torpedo tubes first! That cuts their burst DPS in half."},
          {s:'D', l:"Flank to the ventral blindspot when the dorsal cannons fire!"},
          {s:'N', l:"Targeting the hangar deck to prevent reinforcement waves!"}
        ],
        tier3: [
          {s:'D', l:"We've dissected this fortress. Tear out the main reactor core!"},
          {s:'C', l:"End of the line for Navy black-ops. Fire all batteries!"}
        ]
      },
      player_death: [
        {s:'D', l:"Cross... finish the mission... protect Lyra..."},
        {s:'C', l:"Darius! Stay with me! Pulling you out of the crossfire!"}
      ],
      player_respawn: {
        tier1: [
          {s:'D', l:"Rebooting avionics. Navy hasn't won yet."}
        ],
        tier2: [
          {s:'D', l:"Radar jammers tuned to Navy tactical band. Engaging."},
          {s:'C', l:"Formation reformed. Let's make them regret tracking us."}
        ],
        tier3: [
          {s:'D', l:"Unstoppable. Clear the ring plane!"}
        ]
      },
      low_health: [
        {s:'D', l:"Railgun slug clipped the main engine! Losing thrust!"}
      ],
      wave_clear: [
        {s:'D', l:"Navy squadron routed. Sector secure."}
      ],
      level_end: [
        {s:'D', l:"You defected. Why?"},
        {s:'C', l:"Because I had a son too. And the Navy took him."}
      ],
      pull_out: [
        {s:'D', l:"Squadron Umbra has me locked with heavy torpedoes! Pulling out of the ring plane!", r:{s:'T', l:"Darius, dive into the ice debris. I'll draw their target locks."}},
        {s:'L', l:"The metal ships... they are so angry, they want to kill us. I'm dropping the sensor link!", r:{s:'S', l:"Good choice, Lyra. Let the fighters handle the Navy. Fall back."}},
        {s:'T', l:"Navy jammer has cut my fire control. Weapons are cold. I'm out of here!", r:{s:'N', l:"Purging jammer frequency now, Thorne. Fall back to my position."}}
      ]
    },

    6: {
      level_start: {
        tier1: [
          {s:'D', l:"Supernova remnant. Every surface is slag."},
          {s:'N', l:"Thermal radiation exceeding safety thresholds. Keep cooling cycle active."}
        ],
        tier2: [
          {s:'D', l:"Solar flares pulse every 15 seconds. Take cover behind the molten asteroids!"},
          {s:'N', l:"Plasma drones absorb heat from our lasers. Switch to kinetic missiles!"},
          {s:'T', l:"Watch the lava jets from the shattered crust. Fly high!"}
        ],
        tier3: [
          {s:'D', l:"We know the solar flare timings by heart. Push through the furnace."},
          {s:'N', l:"All thermal shields calibrated. Maximum forward velocity."}
        ]
      },
      unique_enemy: [
        {s:'D', l:"Molten heavy juggernaut! Its armor is liquid titanium!"},
        {s:'N', l:"Cool it with cryogenic burst or strike its exhaust port!"}
      ],
      boss_entrance: {
        tier1: [
          {s:'D', l:"The Forge-Mind. It's smelting precursor relics into combat automatons."},
          {s:'N', l:"Massive automated foundry. Heat levels off the chart."}
        ],
        tier2: [
          {s:'D', l:"Aim for the crucible coolers before it dumps molten slag across the arena!"},
          {s:'N', l:"Targeting conveyor tracks to stop the drone assembly line!"},
          {s:'T', l:"Stay clear of the central forge hammer! It causes structural shockwaves!"}
        ],
        tier3: [
          {s:'D', l:"Shut this forge down for good. Heavy ordnance on the master forge core!"},
          {s:'N', l:"Foundry overload initiated. Finish the strike!"}
        ]
      },
      player_death: [
        {s:'D', l:"Cockpit melting... shields collapsed..."},
        {s:'N', l:"Darius! Emergency cryogenic purge engaged!"}
      ],
      player_respawn: {
        tier1: [
          {s:'D', l:"Coolant replenished. Diving back into the furnace."}
        ],
        tier2: [
          {s:'D', l:"Thermal deflectors overclocked. Let's finish the Forge-Mind."},
          {s:'N', l:"Heatsinks cleared. Ready for the next salvo."}
        ],
        tier3: [
          {s:'D', l:"Forged in fire. Nothing in this furnace can stop us."}
        ]
      },
      low_health: [
        {s:'D', l:"Temperature alarm blaring! Hull plates are warping!"}
      ],
      wave_clear: [
        {s:'D', l:"Forge automatons destroyed. The ash is settling."}
      ],
      level_end: [
        {s:'D', l:"Haven-7 was attacked. Lyra is changing. I need to get back."},
        {s:'L', l:"Daddy, the thing in the dark isn't angry. It's scared."}
      ],
      pull_out: [
        {s:'D', l:"Thermal shield is melting! My cockpit is burning up! I'm pulling out!", r:{s:'N', l:"Redirecting coolants to your primary cabin, Darius. Retreat immediately."}},
        {s:'L', l:"The fire... it's screaming. Haven-7 was attacked... Selene? Mom? I can't hear them!", r:{s:'D', l:"Lyra, I'm here! Comms are down due to the flare, I'm pulling back to you!"}},
        {s:'C', l:"Forge-Mind plasma beam has melted my armor plating. Pulling back before my reactor blows!", r:{s:'T', l:"Valera, eject your heatsinks. I'll cover your retreat."}}
      ]
    },

    7: {
      level_start: {
        tier1: [
          {s:'D', l:"Eternal hurricane. Five thousand mph winds. A mad god in the eye."},
          {s:'T', l:"Jovian storm currents will tear any loose plating off your ship. Tighten up!"}
        ],
        tier2: [
          {s:'D', l:"Ride the wind shears instead of fighting them! Drift with the cyclone current."},
          {s:'N', l:"Lightning arcs between the cloud pylons. Destroy the pylons to ground the storm."},
          {s:'T', l:"Thunderbirds dive from the upper eye wall. Keep radar pointed up!"}
        ],
        tier3: [
          {s:'D', l:"We've mastered the storm flight paths. Cut straight through to the eye."},
          {s:'T', l:"No storm on Jupiter can ground this squadron. Full burn!"}
        ]
      },
      unique_enemy: [
        {s:'D', l:"Lightning ray! It's chaining high-voltage arcs across our fighters!"},
        {s:'N', l:"Spread out to prevent conductive arc-chaining!"}
      ],
      boss_entrance: {
        tier1: [
          {s:'D', l:"The Storm-Singer. A giant atmospheric beast generating the cyclone."},
          {s:'L', l:"It's singing with the thunder... it's trying to drown out its own pain."}
        ],
        tier2: [
          {s:'D', l:"Shoot the electrical gills when it inhales the storm clouds!"},
          {s:'N', l:"Drop resonance disruptors into its lightning vortex to break the barrier!"},
          {s:'T', l:"Roll 90 degrees when it charges the hurricane funnel!"}
        ],
        tier3: [
          {s:'D', l:"Third clash in the eye. Put the Storm-Singer to rest!"},
          {s:'N', l:"Vortex collapsed. Firing the finishing torpedo spread!"}
        ]
      },
      player_death: [
        {s:'D', l:"Torn apart in the squall... Lyra..."},
        {s:'T', l:"Darius went down in the vortex! Deploying storm winch!"}
      ],
      player_respawn: {
        tier1: [
          {s:'D', l:"Engines re-ignited in the eye. Let's finish the dive."}
        ],
        tier2: [
          {s:'D', l:"Faraday cage active. Lightning won't short our thrusters now."},
          {s:'N', l:"Atmospheric gyros steady. Back on vector."}
        ],
        tier3: [
          {s:'D', l:"Riding the lightning. We take the eye today."}
        ]
      },
      low_health: [
        {s:'D', l:"Turbulence tearing off the stabilizer! Flight control failing!"}
      ],
      wave_clear: [
        {s:'D', l:"Storm wave dispersed. Eye of the storm holding stable."}
      ],
      level_end: [
        {s:'D', l:"The Storm-Singer chose death over madness."},
        {s:'L', l:"Its song is peaceful now, Daddy. It's resting."}
      ],
      pull_out: [
        {s:'D', l:"The atmospheric pressure is crushing my hull! Winds are tearing my wings off! Pulling out!", r:{s:'C', l:"Thrust down into the lower drafts, Darius. I'm falling back too."}},
        {s:'L', l:"The lightning... it's singing. It's so loud it hurts my head! I have to go!", r:{s:'D', l:"Lyra, close the audio feed! I'm pulling us out of the storm!"}},
        {s:'N', l:"Megastorm lightning has shorted my primary battery! I'm dead in the air, pulling back!", r:{s:'T', l:"Towing cable deployed, Naya. Hold on, I'm dragging you out!"}}
      ]
    },

    8: {
      level_start: {
        tier1: [
          {s:'D', l:"The ghost fleet. Hundreds of Navy ships, abandoned."},
          {s:'C', l:"Admiral Crane's automated defense network is still guarding the wrecks."}
        ],
        tier2: [
          {s:'D', l:"Automated point-defense turrets are networked. Take out the radar carrier first!"},
          {s:'C', l:"Crane's AI uses flanking ambush pods hidden in the hollow hulls. Watch your flank."},
          {s:'T', l:"Beware proximity mines tethered to the wreckage corridors."}
        ],
        tier3: [
          {s:'D', l:"We know Crane's automated subroutines. Dismantle the fleet."},
          {s:'C', l:"Severing their tactical data links. The ghost fleet is ours."}
        ]
      },
      unique_enemy: [
        {s:'D', l:"Heavy automated dreadnought! It's charging bow rail cannons!"},
        {s:'C', l:"Stay in its dorsal blindspot! Those bow cannons can't elevate!"}
      ],
      boss_entrance: {
        tier1: [
          {s:'D', l:"Admiral Crane's flagship: the Goliath. Controlled by his digital ghost."},
          {s:'C', l:"Crane... you enslaved whole generations for this machine. It ends here."}
        ],
        tier2: [
          {s:'D', l:"Focus on the automated shield relay ships escorting the Goliath!"},
          {s:'C', l:"Override codes applied to the port missile batteries. Strike the breach!"},
          {s:'T', l:"Dive under the broadside salvo! It fires in 3-second staggered volleys!"}
        ],
        tier3: [
          {s:'D', l:"No more ghosts. Time to bury Crane's flagship in the scrap pile."},
          {s:'C', l:"Primary reactor breached. Firing the final salute."}
        ]
      },
      player_death: [
        {s:'D', l:"Crane... you won't touch her..."},
        {s:'C', l:"Darius is down! Suppressive fire, protect the lead ship!"}
      ],
      player_respawn: {
        tier1: [
          {s:'D', l:"Rebooted. Ghost fleet hasn't buried us yet."}
        ],
        tier2: [
          {s:'D', l:"Counter-hack installed. Crane can't scramble our HUD."},
          {s:'C', l:"Fleet fire-control overridden. Striking back."}
        ],
        tier3: [
          {s:'D', l:"Iron will. The fleet falls today."}
        ]
      },
      low_health: [
        {s:'D', l:"Armor plating sheared by railgun fire! Critical warning!"}
      ],
      wave_clear: [
        {s:'D', l:"Ghost fleet vanguard neutralized. Path to the flagship open."}
      ],
      level_end: [
        {s:'D', l:"My family was engineered. Three generations. But Lyra is NOT a weapon."},
        {s:'C', l:"None of us are weapons, Darius. We are free."}
      ],
      pull_out: [
        {s:'D', l:"The automated Navy dreadnought has me pinned with heavy lasers! I'm pulling out!", r:{s:'T', l:"Darius, break line of sight behind the wreck. I'm dropping chaff."}},
        {s:'L', l:"Admiral Crane's voice... it's inside my head. He's saying we are all just weapons... I want to leave!", r:{s:'N', l:"Lyra! He's wrong, baby. You're my daughter. I'm pulling you out of the network."}},
        {s:'N', l:"Defense lasers have sliced through my starboard engine! I'm pulling back to the wreckage!", r:{s:'D', l:"Naya, get inside the hull of that carrier. I'll cover your retreat."}}
      ]
    },

    9: {
      level_start: {
        tier1: [
          {s:'D', l:"The first world the Dreamer transformed. Nothing here is real."},
          {s:'L', l:"The Hive is whispering in thousands of voices... they want to make us sleep."}
        ],
        tier2: [
          {s:'D', l:"Neural spores are distorting our flight vectors. Keep your eyes on the physical compass!"},
          {s:'N', l:"Bio-luminescent tendrils regenerate if not severed completely. Use rapid fire."},
          {s:'L', l:"Daddy, I'm maintaining a psychic shield around your cockpit. Trust my voice."}
        ],
        tier3: [
          {s:'D', l:"We know the Hive's neural tricks. Push straight through the synaptic matrix."},
          {s:'N', l:"Synaptic resonance steady. Piercing their collective barrier."}
        ]
      },
      unique_enemy: [
        {s:'D', l:"Synaptic parasite drone! It's latching onto the shield matrix!"},
        {s:'N', l:"Roll maneuver and pulse shields to shake it off!"}
      ],
      boss_entrance: {
        tier1: [
          {s:'D', l:"The Hive Mother. A cosmic nexus of stolen minds and biomass."},
          {s:'L', l:"She's holding so many stolen souls... we have to wake them up!"}
        ],
        tier2: [
          {s:'D', l:"Sever the neural tentacles before she channels the psychic scream!"},
          {s:'N', l:"Focus heavy fire on the bio-plasma sacs at her base!"},
          {s:'T', l:"Clear the spore swarm immediately or they'll detonate on your canopy!"}
        ],
        tier3: [
          {s:'D', l:"We know every tendril swipe. Break the Hive Mother's crown!"},
          {s:'L', l:"Her song is breaking, Daddy! Free the stolen minds!"}
        ]
      },
      player_death: [
        {s:'D', l:"The song is so sweet... no... Lyra..."},
        {s:'L', l:"Daddy! Wake up! Don't let the Hive take you!"}
      ],
      player_respawn: {
        tier1: [
          {s:'D', l:"Mind clear. Neural link secured. We finish this."}
        ],
        tier2: [
          {s:'D', l:"Psychic feedback filters at 100%. The Hive won't cloud our aim."},
          {s:'N', l:"Bio-matrix purged. Advancing into the core."}
        ],
        tier3: [
          {s:'D', l:"Unshakable. Break the collective."}
        ]
      },
      low_health: [
        {s:'D', l:"Neural link fracturing! My hands are going numb!"}
      ],
      wave_clear: [
        {s:'D', l:"Hive node shattered. Synaptic distortion dropping."}
      ],
      level_end: [
        {s:'D', l:"The Hive offered me everything. I almost said yes."},
        {s:'L', l:"You said no because you love us, Daddy. That's real."}
      ],
      pull_out: [
        {s:'D', l:"The Hive is showing me Lyra... but it's not her. It's trying to dissolve my mind! Pulling out!", r:{s:'N', l:"Darius, don't look at it! I'm pulling you back, follow my ship!"}},
        {s:'L', l:"The Hive wants to take my memories... they want to keep my childhood. I won't let them!", r:{s:'D', l:"Lyra, hold on to my hand. We're breaking the link and pulling out!"}},
        {s:'N', l:"These false realities are trying to convince me this is Haven-7. I'm pulling back before I lose myself!", r:{s:'C', l:"It's an illusion, Naya. Break the synaptic link. Regroup at the beacon."}}
      ]
    },

    10: {
      level_start: {
        tier1: [
          {s:'D', l:"Edge of a black hole. The last Coelacanth. This is it."},
          {s:'A', l:"The void awaits... why do you bring light into the final rest..."}
        ],
        tier2: [
          {s:'D', l:"Event horizon gravitational shearing is intense! Counter-steer away from the vortex!"},
          {s:'N', l:"Chrono-anomalies ahead! Enemies repeat their attack loops—anticipate the rewind!"},
          {s:'L', l:"The Architect's fear is warping spacetime. Hold the center vector, Daddy!"}
        ],
        tier3: [
          {s:'D', l:"We know the chrono-warp cycles. Time to answer the Architect and end the loop."},
          {s:'N', l:"All systems at peak synchronization. For Lyra. For everyone."}
        ]
      },
      unique_enemy: [
        {s:'D', l:"Chrono-sentinel! It's teleporting across temporal rifts!"},
        {s:'N', l:"Lead your target into its arrival coordinates!"}
      ],
      boss_entrance: {
        tier1: [
          {s:'D', l:"That's no reality. That's its nightmares. I have to show it — it's not alone."},
          {s:'A', l:"We were the first... we will be the last... burn with us in the eternal silence!"}
        ],
        tier2: [
          {s:'D', l:"Destroy the Singularity Launchers before it warps the event horizon!"},
          {s:'N', l:"Dorsal Chrono Railgun charging! Dive under the beam arc!"},
          {s:'L', l:"Daddy, the Unbound Chrono Core is vulnerable when it rewinds! Strike then!"}
        ],
        tier3: [
          {s:'D', l:"This is the final test. No more loops. Deliver the answer!"},
          {s:'L', l:"I'm with you, Daddy! All the way through the light!"},
          {s:'N', l:"Full fleet salvo! Break the singularity!"}
        ]
      },
      player_death: [
        {s:'D', l:"The void is swallowing everything... Lyra... hold my hand..."},
        {s:'L', l:"Daddy! I'm here! I won't let go!"}
      ],
      player_respawn: {
        tier1: [
          {s:'D', l:"Rebooting at the rift threshold. We are not letting the universe die in fear."}
        ],
        tier2: [
          {s:'D', l:"Chrono-stabilizers locked. Spacetime won't shatter our resolve."},
          {s:'N', l:"Singularity shields holding. Back to the event horizon."}
        ],
        tier3: [
          {s:'D', l:"Final push into eternity. Let's finish the Cyber Coelacanth."}
        ]
      },
      low_health: [
        {s:'D', l:"Singularity shear tearing through the hull! Hull integrity 10%!"}
      ],
      wave_clear: [
        {s:'D', l:"Chrono rift sealed. Final approach to the Architect's Core."}
      ],
      level_end: [
        {s:'D', l:"I'm not here to defeat it. I'm here to answer it."},
        {s:'L', l:"We answered it together, Daddy. We're going home."}
      ],
      pull_out: [
        {s:'D', l:"The black hole's gravity is pulling me past the event horizon! I'm pushing engines to the limit, pulling out!", r:{s:'O', l:"Engaging singularity shield, Darius. Escape trajectory is narrow. Retreat now!"}},
        {s:'L', l:"The Architect's nightmare is too loud... it's the end of everything! I can't look!", r:{s:'D', l:"Lyra, look at me. Only me. We're pulling back to the rift edge."}},
        {s:'N', l:"Gravitational shearing is tearing my hull apart! I have to back off before I'm crushed!", r:{s:'C', l:"Engage reverse thrusters, Naya. I'll drop a gravity anchor to hold you."}}
      ]
    }
  },
  
  // ─── GRO-4206: Higher-Difficulty Classified Lore (ACE / CYBER) ─────────────
  classified: {
    1: [
      { s: 'C', l: "[EDC BLACK-OPS // INTERCEPT]: Mariana Trench was never an expedition—it was a quarantine zone for Prototype Alpha." },
      { s: 'D', l: "Marcus Star Log #00: The Navy told me I was surveying sea life. They lied. The Coelacanth was already awake." }
    ],
    2: [
      { s: 'N', l: "[PRECURSOR DECRYPT]: The Great Dying wasn't a plague. The Precursors chose crystallisation over surrender." },
      { s: 'T', l: "I found Navy transponders inside the bone fields. High Command sent an entire black-ops strike wing here." }
    ],
    3: [
      { s: 'N', l: "[PROJECT OPHION FILE 402]: The cybernetic genome was spliced from Darius's grandfather forty years ago." },
      { s: 'D', l: "Grandpa didn't just find the hatchery on Europa... he helped build the neural interface." }
    ],
    4: [
      { s: 'L', l: "[DREAMER CIPHER]: The Veil is not a gas cloud. It is the dreaming mind of the first Precursor Architect." },
      { s: 'C', l: "Navy lost three stealth squadrons in the Veil trying to capture the Dreamer's core. None survived." }
    ],
    5: [
      { s: 'C', l: "[ADMIRAL CRANE DIRECTIVE 9]: All civilian craft passing Saturn rings are to be neutralized on sight." },
      { s: 'D', l: "Crane knew about Haven-7 all along. The rings were his blockade to keep humanity trapped inside." }
    ],
    6: [
      { s: 'T', l: "[FORGE-MIND REGISTRY]: Smelter output reached 12,000 hulls per day before the overseers were terminated." },
      { s: 'N', l: "The Forge-Mind isn't building defenders for Earth. It's building an armada for the Architect." }
    ],
    7: [
      { s: 'S', l: "[STORM-SINGER ARCHIVE]: Her acoustic song is a distress beacon broadcasting on frequencies older than stars." },
      { s: 'L', l: "She's crying because she knows what happens at the end of the universe, Daddy." }
    ],
    8: [
      { s: 'C', l: "[FLAGSHIP GOLIATH PURGE LOG]: Admiral Crane digitized his consciousness 48 hours before the fleet fell." },
      { s: 'D', l: "He gave up his humanity to keep command. Now he's just a program trapped in rusted steel." }
    ],
    9: [
      { s: 'N', l: "[SYNAPTIC HIVE GENOME]: The Hive Mother was human once. The first test pilot to interface with the Coelacanth." },
      { s: 'L', l: "Her name was Elena... Daddy, she remembers you." }
    ],
    10: [
      { s: 'A', l: "[ARCHITECT OMEGA CIPHER]: The Cyber Coelacanth is the eternal reset button. Every timeline ends here." },
      { s: 'D', l: "Then every timeline ends with us breaking through the cycle." }
    ]
  },

  // ─── GRO-4206: New Game+ Timeline Paradox Chatter ─────────────────────────
  paradox: {
    1: [
      { s: 'D', l: "[TIMELINE ECHO]: I remember this silt reef... we've flown this dive before in another life." },
      { s: 'L', l: "The timeline is looping, Daddy! But our weapons are tuned from our last run!" }
    ],
    2: [
      { s: 'N', l: "[PARADOX TELEMETRY]: Crystalline lattice resonance matches data from our previous campaign." },
      { s: 'T', l: "Paradox enemies inbound! They remember our tactics—switch up attack vectors!" }
    ],
    3: [
      { s: 'D', l: "[CHRONO RESIDUAL]: Europa's ice feels familiar. We know every ambush coordinate." },
      { s: 'N', l: "Quantum fabricator has retained full blueprint memory. Sweep the sector clean." }
    ],
    4: [
      { s: 'L', l: "[DREAMER RECURSION]: The stars in the Veil are singing the song from our previous victory!" },
      { s: 'D', l: "We're bending spacetime back on itself. Push through the paradox fog." }
    ],
    5: [
      { s: 'C', l: "[UMBRA DEJA-VU]: Crane's ring blockade is tighter in this timeline, but we know the weak points." },
      { s: 'T', l: "Blow the kraken generators on the fly. Second time's the charm." }
    ],
    6: [
      { s: 'N', l: "[FOUNDRY ECHO]: The Forge-Mind has upgraded its armor based on our last assault." },
      { s: 'D', l: "Let it upgrade. Our quantum dodad has higher output this loop." }
    ],
    7: [
      { s: 'S', l: "[STORM-SINGER HARMONIC]: The tempest recognizes your ship signature, Vanguard." },
      { s: 'L', l: "We promised we'd come back and free her song. Time to keep that promise." }
    ],
    8: [
      { s: 'D', l: "[GHOST FLEET PARADOX]: Crane's AI is panicking—his sensors show two iterations of us on radar." },
      { s: 'C', l: "Overload his processing core before he reconciles the timeline paradox." }
    ],
    9: [
      { s: 'L', l: "[HIVE MEMORY FRACTURE]: Elena's mind is calling out clearer than before... she knows we're close." },
      { s: 'D', l: "We're going to break the synaptic web for good this time." }
    ],
    10: [
      { s: 'A', l: "[ARCHITECT PARADOX EQUATION]: You return to the singularity... yet each return brings higher entropy..." },
      { s: 'D', l: "Not entropy, Architect. Purpose. All ships, engage the Cyber Coelacanth!" }
    ]
  }
};

// Attach to window and export
if (typeof window !== 'undefined') window.BanterDB = BanterDB;
if (typeof global !== 'undefined') global.BanterDB = BanterDB;
if (typeof module !== 'undefined' && module.exports) module.exports = BanterDB;
