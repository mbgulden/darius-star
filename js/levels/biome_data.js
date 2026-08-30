// js/levels/biome_data.js — Biome and 100-Level Journey Metadata (GRO-1063 & GRO-1140)
// Complete 10-Biome x 10-Level campaign structure with unique landmarks, lighting palettes, and intel logs.

const BIOME_DATA = {
  enemies: {
    1: { scout:'angler_scout', interceptor:'jelly_interceptor', heavy:'vent_crab_heavy', alt:'trench_eel' },
    2: { scout:'rust_drone', interceptor:'coral_wasp', heavy:'armored_eel', alt:'spine_urchin' },
    3: { scout:'sparker', interceptor:'sentinel', heavy:'juggernaut', alt:'boss_minion' },
    4: { scout:'plasma_wisp', interceptor:'storm_sprite', heavy:'gas_giant', alt:'nebula_wraith' },
    5: { scout:'ice_shard', interceptor:'frost_drone', heavy:'glacier', alt:'ice_swarm' },
    6: { scout:'ember_sprite', interceptor:'magma_wasp', heavy:'lava_golem', alt:'inferno_node' },
    7: { scout:'static_spark', interceptor:'storm_hawk', heavy:'thunderhead', alt:'storm_sentinel' },
    8: { scout:'salvage_drone', interceptor:'ghost_fighter', heavy:'turret_battery', alt:'fleet_turret' },
    9: { scout:'crawler', interceptor:'spitter', heavy:'brute', alt:'hive_node' },
    10:{ scout:'glitch_fragment', interceptor:'paradox_wisp', heavy:'null_entity', alt:'rift_aberration' }
  },
  names: {
    1:'Abyssal Trench', 2:'Coral Graveyard', 3:'Coelacanth\'s Lair',
    4:'Nebula Drift', 5:'Ice Ring', 6:'Fire Nebula',
    7:'Storm Belt', 8:'Derelict Fleet', 9:'Xenomorph Hive',
    10:'Core Rift'
  },
  bossHP: {
    1:{ midBoss:60, biomeBoss:120 }, 2:{ midBoss:80, biomeBoss:150 },
    3:{ midBoss:100, biomeBoss:200 }, 4:{ midBoss:120, biomeBoss:180 },
    5:{ midBoss:140, biomeBoss:200 }, 6:{ midBoss:160, biomeBoss:220 },
    7:{ midBoss:180, biomeBoss:240 }, 8:{ midBoss:200, biomeBoss:260 },
    9:{ midBoss:220, biomeBoss:280 }, 10:{ midBoss:240, biomeBoss:400 }
  },
  // ─── 100-LEVEL JOURNEY METADATA ──────────────────────────────────────────
  levelDetails: {
    1: {
      1: {
        name: "1.1 Sunlit Atoll Crest",
        shortName: "Sunlit Atoll Crest",
        landmark: "coral_spire",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "Surface sunlight filters through azure waters, illuminating crystalline coral spires.",
        hazard: "Crushing Hydrostatic Pressure",
        classifiedLog: "Marcus Star Log #01: We breached the Mariana crust at 11,000 meters. The sonar echoes aren't bouncing off rock—something is absorbing sound.",
        commLine: { s: "D", l: "Sunlight's fading fast. The trench mouth opens ahead." }
      },
      2: {
        name: "1.2 Coral Gardens Approach",
        shortName: "Coral Gardens Approach",
        landmark: "kelp_canopy",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "Dense fields of golden bioluminescent polyps line the subterranean ridge.",
        hazard: "Bioluminescent Drone Swarms",
        classifiedLog: "Haven-7 Survey: Coral polyp clusters here generate coherent laser frequencies when stimulated by intruders.",
        commLine: { s: "L", l: "Daddy, the reef is lighting up... it's calling for defenders." }
      },
      3: {
        name: "1.3 Derelict Scout Wreckage",
        shortName: "Derelict Scout Wreckage",
        landmark: "frigate_wreck",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "The rusted hull of an ancient Terran exploration probe rests wedged between reefs.",
        hazard: "Hull Structural Decompression",
        classifiedLog: "Scrap Recovery Memo: This exploration frigate went dark in 2048. Its hull plating is fused with living coelacanth scales.",
        commLine: { s: "N", l: "Old Terran wreckage detected. Useful alloys for the quantum fabricator." }
      },
      4: {
        name: "1.4 Turquoise Atoll Chasm",
        shortName: "Turquoise Atoll Chasm",
        landmark: "atoll_chasm",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "A massive vertical drop plunging deeper into the upper twilight zone.",
        hazard: "Vertical Gravity Sinks",
        classifiedLog: "Marcus Star Log #04: The chasm pulled our bathysphere downward at 30 knots. Natural currents don't move like this.",
        commLine: { s: "D", l: "Hold on to your thrusters. The bottom just dropped out." }
      },
      5: {
        name: "1.5 Precursor Sensor Buoy",
        shortName: "Precursor Sensor Buoy",
        landmark: "sensor_buoy",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "A floating Precursor telemetry spire pulses low-frequency quantum pings.",
        hazard: "Precursor Quantum Pings",
        classifiedLog: "Navy Surveillance Intercept: Precursor beacon transmitting 4.8 THz quantum carrier wave toward Jupiter.",
        commLine: { s: "T", l: "That sensor buoy is pinging our location. Blast it before it calls the fleet." }
      },
      6: {
        name: "1.6 Sunken Aqueduct Shallows",
        shortName: "Sunken Aqueduct Shallows",
        landmark: "sunken_aqueduct",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "Ancient stone and alloy water channels carved by the Precursors millennia ago.",
        hazard: "Submerged Aqueduct Cross-Currents",
        classifiedLog: "Haven-7 Xenology: Aqueducts carved from monomolecular carbon. They carried biosynthetic amniotic fluids.",
        commLine: { s: "N", l: "These ancient stone channels were built to nurture prototypes." }
      },
      7: {
        name: "1.7 Bioluminescent Kelp Wall",
        shortName: "Bioluminescent Kelp Wall",
        landmark: "kelp_canopy",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "Towering emerald kelp fronds create a natural labyrinth of drifting bio-spores.",
        hazard: "Neurotoxic Bio-Spores",
        classifiedLog: "Medical Log: Kelp fronds release microscopic spores that induce hallucinations and temporal disorientation.",
        commLine: { s: "L", l: "The green light is dancing across the cockpit. I can hear distant humming." }
      },
      8: {
        name: "1.8 Hydrothermal Chimney Field",
        shortName: "Hydrothermal Chimney Field",
        landmark: "magma_chimney",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "Sulfurous mineral spires venting superheated mineral-rich black smoke.",
        hazard: "Superheated Sulfur Plumes",
        classifiedLog: "Thermal Analysis: Vent chimneys discharging 450°C mineral slurry. Thermal shield integrity mandatory.",
        commLine: { s: "D", l: "Thermal chimneys blowing black smoke! Watch your temperature gauges." }
      },
      9: {
        name: "1.9 Submerged Fortress Approach",
        shortName: "Submerged Fortress Approach",
        landmark: "ruins_pylon",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "Fortified titanium sea-gates marking the perimeter of the biome guardian.",
        hazard: "Automated Sea-Gate Artillery",
        classifiedLog: "Tactical Recon: Titanium fortress gates armed with magnetic rail cannons. Break through the perimeter.",
        commLine: { s: "N", l: "Fortress gate perimeter sighted. Heavy defensive resistance inbound." }
      },
      10: {
        name: "1.10 Guardian Reef Stronghold",
        shortName: "Guardian Reef Stronghold",
        landmark: "chrono_singularity",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "The central defensive redoubt of the Abyssal Guardian Coelacanth.",
        hazard: "Apex Biome Leviathan Resonance",
        classifiedLog: "Classified Core File: The Abyssal Guardian Coelacanth has protected this trench for ten millennia. It will not yield.",
        commLine: { s: "D", l: "Guardian signature confirmed on radar. Time to earn our passage." }
      },
    },
    2: {
      1: {
        name: "2.1 Bleached Reef Shallows",
        shortName: "Bleached Reef Shallows",
        landmark: "coral_spire",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "Calcified ivory coral formations stretching like skeletal fingers across the abyss.",
        hazard: "Calcified Spore Clouds",
        classifiedLog: "Haven-7 Archive: The Great Dying bleached this colony in a single hour. Nothing living was spared.",
        commLine: { s: "D", l: "Bleached coral as far as the eye can see. Pure silence." }
      },
      2: {
        name: "2.2 Leviathan Ribcage Basin",
        shortName: "Leviathan Ribcage Basin",
        landmark: "leviathan_bones",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "The colossal fossilized ribcage of an ancient oceanic behemoth.",
        hazard: "Fossilized Bone Hazard",
        classifiedLog: "Xenobiology: The ribcage belongs to an organism larger than any dreadnought in the Terran fleet.",
        commLine: { s: "N", l: "Flying between ancient rib arches. Sensors picking up residual marrow radiation." }
      },
      3: {
        name: "2.3 Spectral Frigate Hulks",
        shortName: "Spectral Frigate Hulks",
        landmark: "frigate_wreck",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "Warship hulls from the First Precursor War trapped in calcified coral nets.",
        hazard: "Ghost Warship Phantoms",
        classifiedLog: "Navy Casualty Record: 3rd Heavy Flotilla lost during the first contact skirmish. Their automated guns still fire.",
        commLine: { s: "C", l: "I recognize those hull numbers. Old Navy brothers trapped in the reef." }
      },
      4: {
        name: "2.4 Ghost Polyp Thicket",
        shortName: "Ghost Polyp Thicket",
        landmark: "kelp_canopy",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "Translucent purple sea fans that release numbing neurotoxin clouds on contact.",
        hazard: "Neurotoxin Polyp Thickets",
        classifiedLog: "Haven-7 Bio-Hazmat: Neurotoxins attack synaptic neural links, causing control lag in pilot rigs.",
        commLine: { s: "L", l: "The purple flowers... they're trying to put my mind to sleep, Daddy." }
      },
      5: {
        name: "2.5 Crystalline Monolith Ridge",
        shortName: "Crystalline Monolith Ridge",
        landmark: "ruins_pylon",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "Vibrating quartz pillars emitting resonant harmonic frequencies.",
        hazard: "Crystalline Resonance Shards",
        classifiedLog: "Dr. Marcus Star Log #12: When the crystals vibrate, they project auditory memories of people you love.",
        commLine: { s: "D", l: "I hear music from home. Stay sharp, it's just crystal resonance." }
      },
      6: {
        name: "2.6 Sunken Amphitheater Ruins",
        shortName: "Sunken Amphitheater Ruins",
        landmark: "sunken_aqueduct",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "A colossal Precursor arena carved into the limestone bedrock.",
        hazard: "Amphitheater Sound Cannons",
        classifiedLog: "Precursor Cipher: This arena tested warrior ships in ritual combat before the Fall.",
        commLine: { s: "T", l: "Stone amphitheater ahead. Prepare for an ambush in the center ring." }
      },
      7: {
        name: "2.7 Prismatic Spire Labyrinth",
        shortName: "Prismatic Spire Labyrinth",
        landmark: "coral_spire",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "Diamond-sharp crystalline spires refracting light into dazzling halos.",
        hazard: "Prismatic Light Flares",
        classifiedLog: "Sensor Report: Light bouncing through these diamond pillars can blind target acquisition sensors.",
        commLine: { s: "N", l: "Prismatic glare is splitting our HUD crosshairs. Fire on physical telemetry." }
      },
      8: {
        name: "2.8 Ancestral Ossuary Trench",
        shortName: "Ancestral Ossuary Trench",
        landmark: "atoll_chasm",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "Deep oceanic burial grounds carpeted in bio-synthetic sediment.",
        hazard: "Ossuary Silt Traps",
        classifiedLog: "Salvage Memo: Billions of bio-synthetic components buried in the silt bed. High scrap concentration.",
        commLine: { s: "D", l: "Scrap signals lighting up the board. Harvest what we can on the fly." }
      },
      9: {
        name: "2.9 Memory Vault Gatehouse",
        shortName: "Memory Vault Gatehouse",
        landmark: "sensor_buoy",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "Heavily fortified holographic gates protecting the Precursor memory vaults.",
        hazard: "Memory Vault Defense Grid",
        classifiedLog: "Haven-7 Tactical: The inner sanctum is shielded by a holographic matrix powered by Precursor souls.",
        commLine: { s: "L", l: "The vault doors are opening, Daddy... they're crying out for release." }
      },
      10: {
        name: "2.10 Vault Golem Sanctum",
        shortName: "Vault Golem Sanctum",
        landmark: "chrono_singularity",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "The ancient inner sanctum where the crystalline Vault Golem rests.",
        hazard: "Vault Golem Prismatic Beam",
        classifiedLog: "Final Precursor Log: The Vault Golem was built from our collective grief. Strike its heart to set it free.",
        commLine: { s: "D", l: "Vault Golem is assembling! Break its crystal armor before it fires!" }
      },
    },
    3: {
      1: {
        name: "3.1 Sub-Glacial Trench Entry",
        shortName: "Sub-Glacial Trench Entry",
        landmark: "coral_spire",
        particlePreset: "marine_snow",
        accentColor: "#00ffcc",
        skyGradient: ["#001428", "#002444", "#003866"],
        intel: "Cracking through Europa's outer ice crust into frigid methane oceans.",
        hazard: "Sub-Zero Nitrogen Brine",
        classifiedLog: "Europa Exploration File: Water temperature under the ice sheet sits at -4°C with heavy salt saturation.",
        commLine: { s: "D", l: "Europa's sub-glacial ocean. The cradle of the Coelacanths." }
      },
      2: {
        name: "3.2 Cryogenic Geyser Valley",
        shortName: "Cryogenic Geyser Valley",
        landmark: "magma_chimney",
        particlePreset: "marine_snow",
        accentColor: "#00ffcc",
        skyGradient: ["#001428", "#002444", "#003866"],
        intel: "High-pressure nitrogen geysers bursting from sub-oceanic fissures.",
        hazard: "Cryogenic Geyser Eruptions",
        classifiedLog: "Haven-7 Geological: Geysers erupt every 8 seconds, launching ice shrapnel at supersonic speeds.",
        commLine: { s: "T", l: "Geysers blowing from the ice floor! Keep your elevation high!" }
      },
      3: {
        name: "3.3 Bio-Fabrication Hatchery",
        shortName: "Bio-Fabrication Hatchery",
        landmark: "ruins_pylon",
        particlePreset: "marine_snow",
        accentColor: "#00ffcc",
        skyGradient: ["#001428", "#002444", "#003866"],
        intel: "Autonomous incubation chambers cultivating prototype bio-synthetic Coelacanths.",
        hazard: "Bio-Fabricator Prototype Swarms",
        classifiedLog: "Ophion Design Note: The prototype embryos lack cognitive dampers. They attack anything that generates heat.",
        commLine: { s: "N", l: "Unfinished Coelacanth prototypes detected. They're drawn to our engines." }
      },
      4: {
        name: "3.4 Thermal Vent Fissure",
        shortName: "Thermal Vent Fissure",
        landmark: "atoll_chasm",
        particlePreset: "marine_snow",
        accentColor: "#00ffcc",
        skyGradient: ["#001428", "#002444", "#003866"],
        intel: "Geothermal fractures releasing boiling mineral brine into the freezing dark.",
        hazard: "Thermal Vent Shockwaves",
        classifiedLog: "Thermal Scan: Deep geothermal fractures provide the only warmth in this frozen grave.",
        commLine: { s: "D", l: "Ride the warm updrafts from the fissure. It'll restore engine efficiency." }
      },
      5: {
        name: "3.5 Incubator Pylon Array",
        shortName: "Incubator Pylon Array",
        landmark: "sensor_buoy",
        particlePreset: "marine_snow",
        accentColor: "#00ffcc",
        skyGradient: ["#001428", "#002444", "#003866"],
        intel: "Towering power conduits feeding quantum energy to the Coelacanth brood.",
        hazard: "Incubator Pylon Shockfields",
        classifiedLog: "Automated Defense Log: High-voltage cables connect the hatchery pylons. Sever them to advance.",
        commLine: { s: "L", l: "The incubator eggs are pulsing in rhythm with my heartbeat..." }
      },
      6: {
        name: "3.6 Fractured Ice Shelf Cavern",
        shortName: "Fractured Ice Shelf Cavern",
        landmark: "kelp_canopy",
        particlePreset: "marine_snow",
        accentColor: "#00ffcc",
        skyGradient: ["#001428", "#002444", "#003866"],
        intel: "Vast subterranean caverns under kilometres of shifting, groaning ice sheets.",
        hazard: "Fractured Ice Shelf Collapses",
        classifiedLog: "Structural Warning: Overhead ice shelves are cracking under sonic vibrations from our weapons.",
        commLine: { s: "T", l: "Ice ceiling is coming down! Throttle up and clear the corridor!" }
      },
      7: {
        name: "3.7 Prototype Discard Trench",
        shortName: "Prototype Discard Trench",
        landmark: "leviathan_bones",
        particlePreset: "marine_snow",
        accentColor: "#00ffcc",
        skyGradient: ["#001428", "#002444", "#003866"],
        intel: "Deep canyon filled with discarded mechanical chassis from failed evolutionary cycles.",
        hazard: "Prototype Discard Trenches",
        classifiedLog: "Ophion Personal Log: Thousands of failed models were dumped here. I was the only one that achieved balance.",
        commLine: { s: "N", l: "This was Ophion's graveyard before he found Haven-7. A heavy price was paid." }
      },
      8: {
        name: "3.8 Stasis Chamber Vaults",
        shortName: "Stasis Chamber Vaults",
        landmark: "frigate_wreck",
        particlePreset: "marine_snow",
        accentColor: "#00ffcc",
        skyGradient: ["#001428", "#002444", "#003866"],
        intel: "Ancient cryo-pods housing elite cybernetic warriors in suspended animation.",
        hazard: "Cryo-Stasis Chamber Sentry Grid",
        classifiedLog: "Terran Intelligence: Navy tried to weaponize these stasis pods. The automated defenses turned on them.",
        commLine: { s: "C", l: "Navy survey team was wiped here in '62. The sentry turrets are still hot." }
      },
      9: {
        name: "3.9 Nursery Sanctum Gateway",
        shortName: "Nursery Sanctum Gateway",
        landmark: "sunken_aqueduct",
        particlePreset: "marine_snow",
        accentColor: "#00ffcc",
        skyGradient: ["#001428", "#002444", "#003866"],
        intel: "Reinforced blast doors guarding the central breeding throne room.",
        hazard: "Nursery Sanctum Gates",
        classifiedLog: "Precursor Nursery Codex: Only those carrying the spark of ancient kinship may enter the Queen's chamber.",
        commLine: { s: "L", l: "The Queen knows we're outside, Daddy. She's humming a lullaby." }
      },
      10: {
        name: "3.10 Hatchery Queen Nest",
        shortName: "Hatchery Queen Nest",
        landmark: "chrono_singularity",
        particlePreset: "marine_snow",
        accentColor: "#00ffcc",
        skyGradient: ["#001428", "#002444", "#003866"],
        intel: "The royal chamber where the Hatchery Queen oversees cybernetic evolution.",
        hazard: "Hatchery Queen Cryo-Burst",
        classifiedLog: "Haven-7 Bio-Registry: The Hatchery Queen generates absolute zero fields that instantly shatter steel.",
        commLine: { s: "D", l: "Queen Coelacanth has surfaced! Focus all heat ordnance on her core!" }
      },
    },
    4: {
      1: {
        name: "4.1 Veil Nebula Ingress",
        shortName: "Veil Nebula Ingress",
        landmark: "nebula_cloud",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "Entering the glowing interstellar dust clouds of the Veil Nebula.",
        hazard: "Tachyon Plasma Refraction",
        classifiedLog: "Nebula Science Report: The Veil Nebula bends local spacetime, creating non-Euclidean flight corridors.",
        commLine: { s: "D", l: "The Veil Nebula. The stars look like they're melting into water." }
      },
      2: {
        name: "4.2 Chromatic Distortion Belt",
        shortName: "Chromatic Distortion Belt",
        landmark: "nebula_cloud",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "Intense electromagnetic lensing distorting spatial awareness and targeting scopes.",
        hazard: "Quantum Mirages",
        classifiedLog: "Pilot Advisory: Target blips on radar may represent past or future positions of hostile craft.",
        commLine: { s: "N", l: "Sensors showing three targets for every drone. Shoot the one with engine wake." }
      },
      3: {
        name: "4.3 Accretion Dust Stream",
        shortName: "Accretion Dust Stream",
        landmark: "nebula_cloud",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "High-density metallic particles swirling in planetary accretion spirals.",
        hazard: "Supernova Dust Clouds",
        classifiedLog: "Astrophysics File: Heavy metal dust clouds strip shields if flown through at maximum velocity.",
        commLine: { s: "T", l: "Stardust is scraping the paint clean off my armor. Watch your speed." }
      },
      4: {
        name: "4.4 Thought-Form Anomalies",
        shortName: "Thought-Form Anomalies",
        landmark: "sensor_buoy",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "Resonant psychotronic fields projecting vivid optical illusions into the cockpit.",
        hazard: "Thought-Form Anomalies",
        classifiedLog: "Dr. Marcus Star Log #25: In the Veil, the ship's computers started generating poetry instead of math.",
        commLine: { s: "L", l: "The nebula wants to tell us a story, Daddy. It's about a world made of glass." }
      },
      5: {
        name: "4.5 Plasma Squall Corridor",
        shortName: "Plasma Squall Corridor",
        landmark: "magma_chimney",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "Ionized plasma winds buffeting craft with extreme thermal turbulence.",
        hazard: "Plasma Storm Fronts",
        classifiedLog: "Thermal Warning: Ionized gas cyclones reach speeds exceeding Mach 12.",
        commLine: { s: "D", l: "Plasma squall ahead! Dive into the magnetic channel to stay stable." }
      },
      6: {
        name: "4.6 Prismatic Dust Pillars",
        shortName: "Prismatic Dust Pillars",
        landmark: "coral_spire",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "Towering pillars of creation refracting newborn stellar radiation.",
        hazard: "Stellar Nursery Flares",
        classifiedLog: "Haven-7 Astrometry: Baby stars igniting inside the dust pillars create spontaneous radiation surges.",
        commLine: { s: "N", l: "Protostar flare warning! Shield deflectors to 100%." }
      },
      7: {
        name: "4.7 Tachyon Eddy Trench",
        shortName: "Tachyon Eddy Trench",
        landmark: "atoll_chasm",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "Localized tachyon currents causing spatial anomalies and sensor ghosting.",
        hazard: "Temporal Lag Corridors",
        classifiedLog: "Quantum Field Note: Radio transmissions here arrive 10 seconds before they are transmitted.",
        commLine: { s: "T", l: "I'm hearing my own callout on the radio before I say it. Disorienting." }
      },
      8: {
        name: "4.8 Phantom Cruiser Graveyard",
        shortName: "Phantom Cruiser Graveyard",
        landmark: "frigate_wreck",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "Derelict exploratory vessels trapped forever in gravitational eddies.",
        hazard: "Ghost Ship Phantoms",
        classifiedLog: "Navy Search & Rescue: 12 destroyers vanished into the Veil in 2074. Their quantum silhouettes remain.",
        commLine: { s: "C", l: "My old flight academy training cruiser is drifting in that cloud. Eerie." }
      },
      9: {
        name: "4.9 Dreamer Conduit Threshold",
        shortName: "Dreamer Conduit Threshold",
        landmark: "ruins_pylon",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "The threshold where spatial dimensions collapse into pure consciousness.",
        hazard: "Dreamer Conduit Threshold",
        classifiedLog: "Haven-7 Telemetry: The Dreamer's consciousness converges into a singular point of light.",
        commLine: { s: "L", l: "We're almost at the heart of the dream. Don't let go of what is real, Daddy." }
      },
      10: {
        name: "4.10 Dreamer Golem Singularity",
        shortName: "Dreamer Golem Singularity",
        landmark: "chrono_singularity",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "The colossal Dreamer Golem guarding the passage to the ring worlds.",
        hazard: "Dreamer Golem Reality Warp",
        classifiedLog: "Classified Precursor Record: The Dreamer cannot be killed, only awakened. Shatter its cosmic anchors.",
        commLine: { s: "D", l: "The Dreamer Golem is manifesting! Fire across its anchor points!" }
      },
    },
    5: {
      1: {
        name: "5.1 Saturn B-Ring Boundary",
        shortName: "Saturn B-Ring Boundary",
        landmark: "asteroid_field",
        particlePreset: "ice_crystals",
        accentColor: "#66ccff",
        skyGradient: ["#021020", "#062238", "#0b3452"],
        intel: "Navigating through trillions of tons of spinning orbital ice boulders.",
        hazard: "Ice-Ring Shrapnel Field",
        classifiedLog: "Ring Navigation Guide: Saturn's B-ring consists of pure water ice chunks traveling at 15 km/s.",
        commLine: { s: "D", l: "Saturn's rings. Trillions of tons of frozen shrapnel spinning at orbital speed." }
      },
      2: {
        name: "5.2 Umbra Shadow Corridor",
        shortName: "Umbra Shadow Corridor",
        landmark: "asteroid_field",
        particlePreset: "ice_crystals",
        accentColor: "#66ccff",
        skyGradient: ["#021020", "#062238", "#0b3452"],
        intel: "Flying through Saturn's planetary shadow where stealth drones lie in ambush.",
        hazard: "Umbra Stealth Cloaking",
        classifiedLog: "Navy Tactical Directive: Umbra Squad interceptors use active radar absorbing carbon metamaterials.",
        commLine: { s: "C", l: "My former squadron is lurking in the ice shadows. Watch your six." }
      },
      3: {
        name: "5.3 Orbital Railgun Battery",
        shortName: "Orbital Railgun Battery",
        landmark: "sensor_buoy",
        particlePreset: "ice_crystals",
        accentColor: "#66ccff",
        skyGradient: ["#021020", "#062238", "#0b3452"],
        intel: "Automated defense batteries built into hollowed out glacial boulders.",
        hazard: "Railgun Perimeter Batteries",
        classifiedLog: "Navy Recon: Automated defense satellites stationed every 50 kilometers along the ring plane.",
        commLine: { s: "T", l: "Heavy railgun batteries mounted on the icebergs. Knock out their power generators." }
      },
      4: {
        name: "5.4 Sub-Zero Geyser Drift",
        shortName: "Sub-Zero Geyser Drift",
        landmark: "magma_chimney",
        particlePreset: "ice_crystals",
        accentColor: "#66ccff",
        skyGradient: ["#021020", "#062238", "#0b3452"],
        intel: "Violent nitrogen geysers blasting shrapnel across the ring plane.",
        hazard: "Cryo-Nitrogen Geysers",
        classifiedLog: "Haven-7 Geology: Sub-surface geysers on ice boulders venting liquid nitrogen plumes.",
        commLine: { s: "N", l: "Nitrogen geysers venting across our flight path. Bank left to clear the vapor." }
      },
      5: {
        name: "5.5 Diamond Dust Expanse",
        shortName: "Diamond Dust Expanse",
        landmark: "coral_spire",
        particlePreset: "ice_crystals",
        accentColor: "#66ccff",
        skyGradient: ["#021020", "#062238", "#0b3452"],
        intel: "Vast clouds of diamond dust that diffuse and scatter energy weapons.",
        hazard: "Diamond Dust Clouds",
        classifiedLog: "Sensor Advisory: Microscopic diamond crystals interfere with laser weapons, reducing beam coherence.",
        commLine: { s: "D", l: "Lasers diffusing in the diamond dust! Switch to kinetic rockets!" }
      },
      6: {
        name: "5.6 Destroyer Graveyard Alley",
        shortName: "Destroyer Graveyard Alley",
        landmark: "frigate_wreck",
        particlePreset: "ice_crystals",
        accentColor: "#66ccff",
        skyGradient: ["#021020", "#062238", "#0b3452"],
        intel: "Hundreds of shattered warships frozen in orbital resonance.",
        hazard: "Destroyer Graveyard Alley",
        classifiedLog: "Salvage Registry: Wreckage from the Second Interplanetary War trapped in orbital resonance.",
        commLine: { s: "D", l: "Dozens of Navy destroyers smashed together like frozen scrap cars." }
      },
      7: {
        name: "5.7 Military Jamming Corridor",
        shortName: "Military Jamming Corridor",
        landmark: "ruins_pylon",
        particlePreset: "ice_crystals",
        accentColor: "#66ccff",
        skyGradient: ["#021020", "#062238", "#0b3452"],
        intel: "Broadband military radar jamming obscuring enemy tactical formations.",
        hazard: "Navy Electronic Warfare Jamming",
        classifiedLog: "Comms Log: Navy command broadcasting broadband white noise across all standard frequencies.",
        commLine: { s: "T", l: "Comms are jammed with military noise! Switch to Haven-7 direct laser link!" }
      },
      8: {
        name: "5.8 Absolute Zero Abyss",
        shortName: "Absolute Zero Abyss",
        landmark: "atoll_chasm",
        particlePreset: "ice_crystals",
        accentColor: "#66ccff",
        skyGradient: ["#021020", "#062238", "#0b3452"],
        intel: "Extreme cold sector causing superconductive strain on ship hulls.",
        hazard: "Absolute Zero Pockets",
        classifiedLog: "Cryo Physics: Shadowed side of ring boulders reaches 2.7 Kelvin, causing superconductive hull stress.",
        commLine: { s: "N", l: "Entering the dark side of the ring. Hull heaters on standby." }
      },
      9: {
        name: "5.9 Fortress Kraken Approach",
        shortName: "Fortress Kraken Approach",
        landmark: "sunken_aqueduct",
        particlePreset: "ice_crystals",
        accentColor: "#66ccff",
        skyGradient: ["#021020", "#062238", "#0b3452"],
        intel: "The outer defensive perimeter of Admiral Crane's mobile fortress.",
        hazard: "Fortress Kraken Approach",
        classifiedLog: "Navy Combat Log: The Kraken Mobile Fortress is the flagship of EDC ring suppression forces.",
        commLine: { s: "C", l: "Kraken Fortress sighted. This was Crane's master weapon. Time to tear it apart." }
      },
      10: {
        name: "5.10 Kraken Mobile Fortress",
        shortName: "Kraken Mobile Fortress",
        landmark: "chrono_singularity",
        particlePreset: "ice_crystals",
        accentColor: "#66ccff",
        skyGradient: ["#021020", "#062238", "#0b3452"],
        intel: "The dreadnought flagship enforcing the blockade of the outer system.",
        hazard: "Kraken Dreadnought Battery",
        classifiedLog: "Navy Black-Ops File: Destroying the Kraken will break EDC's blockade of the outer solar system.",
        commLine: { s: "D", l: "Kraken is opening all torpedo tubes! Evade the volley and hit the bridge!" }
      },
    },
    6: {
      1: {
        name: "6.1 Supernova Slag Field",
        shortName: "Supernova Slag Field",
        landmark: "asteroid_field",
        particlePreset: "ember_sparks",
        accentColor: "#ff5500",
        skyGradient: ["#200800", "#381000", "#541a00"],
        intel: "Scorched asteroid remains from a dying red supergiant star.",
        hazard: "Supernova Slag Fallout",
        classifiedLog: "Haven-7 Sensor Sweep: Surface temperatures on asteroid fragments exceed 1200°C.",
        commLine: { s: "D", l: "Fire nebula. Everything out here has been cooked to molten slag." }
      },
      2: {
        name: "6.2 Magma Column Archipelago",
        shortName: "Magma Column Archipelago",
        landmark: "magma_chimney",
        particlePreset: "ember_sparks",
        accentColor: "#ff5500",
        skyGradient: ["#200800", "#381000", "#541a00"],
        intel: "Subterranean lava streams erupting directly into the vacuum.",
        hazard: "Magma Eruption Columns",
        classifiedLog: "Volcanic Advisory: Subterranean lava reservoirs bursting into the vacuum of space.",
        commLine: { s: "N", l: "Magma plumes arcing across the sector like burning bridges. Fly under the arc." }
      },
      3: {
        name: "6.3 Autonomous Smelter Belt",
        shortName: "Autonomous Smelter Belt",
        landmark: "ruins_pylon",
        particlePreset: "ember_sparks",
        accentColor: "#ff5500",
        skyGradient: ["#200800", "#381000", "#541a00"],
        intel: "Automated mining drones converting raw planetary crust into war alloys.",
        hazard: "Foundry Drone Patrols",
        classifiedLog: "Forge-Mind Automation: Automated smelting drones convert space wreckage into combat hulls.",
        commLine: { s: "T", l: "Smelter drones are harvesting the asteroid belt. Break up their convoy." }
      },
      4: {
        name: "6.4 Solar Flare Sweeps",
        shortName: "Solar Flare Sweeps",
        landmark: "nebula_cloud",
        particlePreset: "ember_sparks",
        accentColor: "#ff5500",
        skyGradient: ["#200800", "#381000", "#541a00"],
        intel: "Coronal mass ejections sweeping across the corridor every twenty seconds.",
        hazard: "Solar Flare Radiation Waves",
        classifiedLog: "Stellar Warning: Coronal mass ejections from the dying star sweep the sector every 20 seconds.",
        commLine: { s: "D", l: "Solar flare incoming! Tuck behind that iron asteroid for cover!" }
      },
      5: {
        name: "6.5 Obsidian Basalt Canyon",
        shortName: "Obsidian Basalt Canyon",
        landmark: "atoll_chasm",
        particlePreset: "ember_sparks",
        accentColor: "#ff5500",
        skyGradient: ["#200800", "#381000", "#541a00"],
        intel: "Razor-sharp volcanic glass canyons glowing with residual geothermal heat.",
        hazard: "Obsidian Chasm Vents",
        classifiedLog: "Haven-7 Survey: Razor-sharp volcanic glass formations lining the interior canyons.",
        commLine: { s: "L", l: "The glass is glowing red in the dark... it looks like burning veins." }
      },
      6: {
        name: "6.6 Crucible Containment Vats",
        shortName: "Crucible Containment Vats",
        landmark: "sunken_aqueduct",
        particlePreset: "ember_sparks",
        accentColor: "#ff5500",
        skyGradient: ["#200800", "#381000", "#541a00"],
        intel: "Gigantic magnetic vats containing millions of tons of molten titanium.",
        hazard: "Crucible Smelting Chambers",
        classifiedLog: "Forge Architecture: Giant magnetic containment vats holding thousands of tons of liquid titanium.",
        commLine: { s: "N", l: "Crucible vats ahead. If they rupture, the whole corridor will be flooded with slag." }
      },
      7: {
        name: "6.7 Plasma Overheat Trench",
        shortName: "Plasma Overheat Trench",
        landmark: "coral_spire",
        particlePreset: "ember_sparks",
        accentColor: "#ff5500",
        skyGradient: ["#200800", "#381000", "#541a00"],
        intel: "Thermal density redlining weapon heat radiators and engine shields.",
        hazard: "Plasma Stream Overheats",
        classifiedLog: "Thermal Danger: Laser weapon heat buildup is tripled in this atmospheric density.",
        commLine: { s: "T", l: "Pace your shots, Darius! The ambient heat is redlining our weapon radiators." }
      },
      8: {
        name: "6.8 Molten Conduit Raceway",
        shortName: "Molten Conduit Raceway",
        landmark: "sensor_buoy",
        particlePreset: "ember_sparks",
        accentColor: "#ff5500",
        skyGradient: ["#200800", "#381000", "#541a00"],
        intel: "High-voltage power conduits supplying the central planetary foundry.",
        hazard: "Molten Core Conduit",
        classifiedLog: "Haven-7 Tactical: The power conduit feeding the master forge is exposed along the basalt trench.",
        commLine: { s: "D", l: "I see the power conduits. Blow the cooling lines to force an emergency shutdown." }
      },
      9: {
        name: "6.9 Master Forge Portals",
        shortName: "Master Forge Portals",
        landmark: "frigate_wreck",
        particlePreset: "ember_sparks",
        accentColor: "#ff5500",
        skyGradient: ["#200800", "#381000", "#541a00"],
        intel: "The fortified gates leading to the Forge-Mind automated core.",
        hazard: "Master Forge Gate",
        classifiedLog: "Precursor Foundry Log: The Forge-Mind has operated without human supervision for five centuries.",
        commLine: { s: "C", l: "The main foundry gates are opening. Automated guardians are rolling out." }
      },
      10: {
        name: "6.10 Forge-Mind Leviathan",
        shortName: "Forge-Mind Leviathan",
        landmark: "chrono_singularity",
        particlePreset: "ember_sparks",
        accentColor: "#ff5500",
        skyGradient: ["#200800", "#381000", "#541a00"],
        intel: "The sentient AI foundry constructing endless cybernetic armada wings.",
        hazard: "Forge-Mind Leviathan Crucible",
        classifiedLog: "Classified Core Directive: Destroy the central smelting core to permanently disable automated drone production.",
        commLine: { s: "D", l: "Forge-Mind is engaging! Strike the crucible coolers and shatter its frame!" }
      },
    },
    7: {
      1: {
        name: "7.1 Jovian Gale Ingress",
        shortName: "Jovian Gale Ingress",
        landmark: "nebula_cloud",
        particlePreset: "storm_arcs",
        accentColor: "#00ffff",
        skyGradient: ["#001828", "#002c48", "#004066"],
        intel: "Descending into Jupiter's supersonic atmospheric shear layers.",
        hazard: "Jovian Hurricane Winds",
        classifiedLog: "Atmospheric Flight Memo: Winds in the Storm Belt reach 5,000 km/h with vertical wind shear.",
        commLine: { s: "D", l: "Jupiter's Storm Belt. Five thousand mile-an-hour gale winds slamming into the hull." }
      },
      2: {
        name: "7.2 Conductive Lightning Grid",
        shortName: "Conductive Lightning Grid",
        landmark: "ruins_pylon",
        particlePreset: "storm_arcs",
        accentColor: "#00ffff",
        skyGradient: ["#001828", "#002c48", "#004066"],
        intel: "Massive electrical static discharges arcing between floating gas harvesters.",
        hazard: "Conductive Lightning Grids",
        classifiedLog: "Haven-7 Physics: Atmospheric static builds until it discharges across conductive metallic surfaces.",
        commLine: { s: "N", l: "Static building on the cockpit canopy. Disperse shields before the lightning strikes!" }
      },
      3: {
        name: "7.3 Predator Storm-Hawk Roost",
        shortName: "Predator Storm-Hawk Roost",
        landmark: "kelp_canopy",
        particlePreset: "storm_arcs",
        accentColor: "#00ffff",
        skyGradient: ["#001828", "#002c48", "#004066"],
        intel: "Hunting grounds of bio-synthetic avian drones that ride storm fronts.",
        hazard: "Storm-Hawk Dive Attacks",
        classifiedLog: "Xeno-Aviation: Bio-synthetic predatory birds that hunt by riding atmospheric shockwaves.",
        commLine: { s: "T", l: "Predator drones diving out of the storm clouds! Flak burst on my mark!" }
      },
      4: {
        name: "7.4 Static Cloud Pillars",
        shortName: "Static Cloud Pillars",
        landmark: "coral_spire",
        particlePreset: "storm_arcs",
        accentColor: "#00ffff",
        skyGradient: ["#001828", "#002c48", "#004066"],
        intel: "Dense ammonium hydrosulfide clouds blinding radar and optical scopes.",
        hazard: "Static Cloud Pillars",
        classifiedLog: "Radar Telemetry: Dense ion clouds obscure all optical and infrared sensor equipment.",
        commLine: { s: "L", l: "The lightning is so bright... but behind it, I can hear a voice singing." }
      },
      5: {
        name: "7.6 Atmospheric Pressure Sink",
        shortName: "Atmospheric Pressure Sink",
        landmark: "atoll_chasm",
        particlePreset: "storm_arcs",
        accentColor: "#00ffff",
        skyGradient: ["#001828", "#002c48", "#004066"],
        intel: "Extreme atmospheric density threatening hull compression.",
        hazard: "Thunderhead Downdrafts",
        classifiedLog: "Flight Safety Log: Downdrafts can crush an unshielded fighter against denser Jovian atmospheric layers.",
        commLine: { s: "D", l: "Downdraft pulling us down! Boost engines to escape the atmospheric sink!" }
      },
      6: {
        name: "7.6 Atmospheric Pressure Choke",
        shortName: "Atmospheric Pressure Choke",
        landmark: "atoll_chasm",
        particlePreset: "storm_arcs",
        accentColor: "#00ffff",
        skyGradient: ["#001828", "#002c48", "#004066"],
        intel: "Atmospheric pressure reaching 50 times Terran sea-level.",
        hazard: "Atmospheric Pressure Choke",
        classifiedLog: "Structural Telemetry: Pressure at this depth is 50 times Terran sea level.",
        commLine: { s: "N", l: "Hull groaning under atmospheric pressure. We need to reach the eye of the storm." }
      },
      7: {
        name: "7.7 Ball Lightning Swarms",
        shortName: "Ball Lightning Swarms",
        landmark: "sensor_buoy",
        particlePreset: "storm_arcs",
        accentColor: "#00ffff",
        skyGradient: ["#001828", "#002c48", "#004066"],
        intel: "Self-sustaining plasma orbs attracted to active ship reactor cores.",
        hazard: "Ball Lightning Clusters",
        classifiedLog: "Physics Report: Stable plasma spheres that seek out active electrical power sources.",
        commLine: { s: "T", l: "Ball lightning drifting toward our engines! Cut power for two seconds to break lock!" }
      },
      8: {
        name: "7.8 Great Red Eye Wall",
        shortName: "Great Red Eye Wall",
        landmark: "magma_chimney",
        particlePreset: "storm_arcs",
        accentColor: "#00ffff",
        skyGradient: ["#001828", "#002c48", "#004066"],
        intel: "The cyclonic boundary of the galaxy's largest storm vortex.",
        hazard: "Eye Wall Perimeter Gale",
        classifiedLog: "Meteorology Report: The boundary of the storm eye generates continuous cyclonic tornadoes.",
        commLine: { s: "D", l: "Punching through the eye wall! Hold the flight stick with both hands!" }
      },
      9: {
        name: "7.9 Storm-Singer Sanctuary",
        shortName: "Storm-Singer Sanctuary",
        landmark: "sunken_aqueduct",
        particlePreset: "storm_arcs",
        accentColor: "#00ffff",
        skyGradient: ["#001828", "#002c48", "#004066"],
        intel: "The eye of the tempest where calm acoustics echo across the clouds.",
        hazard: "Storm-Singer Sanctuary",
        classifiedLog: "Haven-7 Acoustic Log: The Storm-Singer chose this tempest to hide its grief from the galaxy.",
        commLine: { s: "L", l: "We made it to the quiet center. The Storm-Singer is right in front of us." }
      },
      10: {
        name: "7.10 Storm-Singer Colossus",
        shortName: "Storm-Singer Colossus",
        landmark: "chrono_singularity",
        particlePreset: "storm_arcs",
        accentColor: "#00ffff",
        skyGradient: ["#001828", "#002c48", "#004066"],
        intel: "The ancient titan commanding the atmospheric fury of Jupiter.",
        hazard: "Storm-Singer Colossus Eye",
        classifiedLog: "Classified Sanctuary Log: Free the Storm-Singer from its eternal storm loop.",
        commLine: { s: "D", l: "Storm-Singer is charging its lightning vortex! Evade the funnel and attack the core!" }
      },
    },
    8: {
      1: {
        name: "8.1 Ghost Flotilla Perimeter",
        shortName: "Ghost Flotilla Perimeter",
        landmark: "frigate_wreck",
        particlePreset: "void_sparks",
        accentColor: "#88aacc",
        skyGradient: ["#080c14", "#101824", "#182436"],
        intel: "Approaching hundreds of dead capital ships adrift in the dark.",
        hazard: "Derelict Minefield Clusters",
        classifiedLog: "Navy Salvage Registry: 400 Navy warships abandoned during the Precursor Offensive of 2070.",
        commLine: { s: "D", l: "The ghost fleet. Hundreds of battleships floating dead in the black." }
      },
      2: {
        name: "8.2 Automated Defense Grid",
        shortName: "Automated Defense Grid",
        landmark: "sensor_buoy",
        particlePreset: "void_sparks",
        accentColor: "#88aacc",
        skyGradient: ["#080c14", "#101824", "#182436"],
        intel: "Point-defense turrets still firing on 30-year-old automated protocols.",
        hazard: "Automated Defense Turrets",
        classifiedLog: "Navy Defense Network: Drone turrets programmed to shoot any craft not broadcasting EDC encrypted codes.",
        commLine: { s: "C", l: "Those point-defense turrets are still hunting on Admiral Crane's orders." }
      },
      3: {
        name: "8.3 Carrier Hangar Breaches",
        shortName: "Carrier Hangar Breaches",
        landmark: "frigate_wreck",
        particlePreset: "void_sparks",
        accentColor: "#88aacc",
        skyGradient: ["#080c14", "#101824", "#182436"],
        intel: "Boarding pods launching from cavernous hangar bays of derelict supercarriers.",
        hazard: "Boarding Pod Ambushers",
        classifiedLog: "Tactical Warning: Automated boarding pods hidden in the hollow hangar bays of dead carriers.",
        commLine: { s: "T", l: "Boarding pods launching from the carrier wrecks! Shoot them down before they attach!" }
      },
      4: {
        name: "8.4 Leaking Reactor Corridor",
        shortName: "Leaking Reactor Corridor",
        landmark: "magma_chimney",
        particlePreset: "void_sparks",
        accentColor: "#88aacc",
        skyGradient: ["#080c14", "#101824", "#182436"],
        intel: "Breached nuclear fusion reactors flooding the corridor with ionizing radiation.",
        hazard: "Nuclear Reactor Radiation Leaks",
        classifiedLog: "Radiation Warning: Breached fission reactors leaking radioactive coolant into the debris field.",
        commLine: { s: "N", l: "Radiation spiking in sector four. Keep distance from the cracked reactor cores." }
      },
      5: {
        name: "8.5 Armor Plate Labyrinth",
        shortName: "Armor Plate Labyrinth",
        landmark: "asteroid_field",
        particlePreset: "void_sparks",
        accentColor: "#88aacc",
        skyGradient: ["#080c14", "#101824", "#182436"],
        intel: "Razor-sharp shattered warship hulls creating tight flight obstacles.",
        hazard: "Hull Fragment Corridors",
        classifiedLog: "Salvage Guide: Razor-sharp armor plates drifting across narrow flight channels.",
        commLine: { s: "D", l: "Weaving through shattered battlecruiser hulls. Watch the protruding superstructure." }
      },
      6: {
        name: "8.6 Autonomous Cruiser Patrol",
        shortName: "Autonomous Cruiser Patrol",
        landmark: "ruins_pylon",
        particlePreset: "void_sparks",
        accentColor: "#88aacc",
        skyGradient: ["#080c14", "#101824", "#182436"],
        intel: "Heavy automated cruisers maintaining endless defensive patrol circuits.",
        hazard: "Automated Dreadnought Patrols",
        classifiedLog: "Navy Combat Log: Autonomous patrol cruisers maintaining defensive patrols around the flagship.",
        commLine: { s: "C", l: "Heavy automated dreadnought on patrol. It hasn't received a stand-down order in 30 years." }
      },
      7: {
        name: "8.7 Tactical Decoy Cloud",
        shortName: "Tactical Decoy Cloud",
        landmark: "sensor_buoy",
        particlePreset: "void_sparks",
        accentColor: "#88aacc",
        skyGradient: ["#080c14", "#101824", "#182436"],
        intel: "Holographic decoy drones mimicking battlefleet signatures.",
        hazard: "Sensor Decoy Drones",
        classifiedLog: "Tactical Intercept: Fleet decoys projecting false capital ship radar signatures.",
        commLine: { s: "T", l: "Don't trust the radar blips. Verify targets through the optical scope." }
      },
      8: {
        name: "8.8 Escort Ring Defense Net",
        shortName: "Escort Ring Defense Net",
        landmark: "sunken_aqueduct",
        particlePreset: "void_sparks",
        accentColor: "#88aacc",
        skyGradient: ["#080c14", "#101824", "#182436"],
        intel: "Synchronized particle lances protecting the flagship perimeter.",
        hazard: "Flagship Escort Ring",
        classifiedLog: "Haven-7 Intelligence: The Goliath's escort ring is armed with synchronized particle lances.",
        commLine: { s: "N", l: "Synchronized particle lance batteries sighted. We need to disable the relay ships." }
      },
      9: {
        name: "8.9 Flagship Goliath Sanctum",
        shortName: "Flagship Goliath Sanctum",
        landmark: "frigate_wreck",
        particlePreset: "void_sparks",
        accentColor: "#88aacc",
        skyGradient: ["#080c14", "#101824", "#182436"],
        intel: "The massive command bridge of the Terran Navy's greatest supercarrier.",
        hazard: "Goliath Supercarrier Sanctum",
        classifiedLog: "Admiral Crane Archive: The Goliath was designed to be the ultimate Terran command nexus.",
        commLine: { s: "D", l: "Flagship Goliath dead ahead. Crane's automated ghost is waiting on the bridge." }
      },
      10: {
        name: "8.10 Admiral Crane AI Flagship",
        shortName: "Admiral Crane AI Flagship",
        landmark: "chrono_singularity",
        particlePreset: "void_sparks",
        accentColor: "#88aacc",
        skyGradient: ["#080c14", "#101824", "#182436"],
        intel: "The digitized ghost of Admiral Crane commanding his automated armada.",
        hazard: "Admiral Crane AI Flagship",
        classifiedLog: "Classified EDC Archive: Purge Admiral Crane's digital ghost to liberate the fleet archives.",
        commLine: { s: "D", l: "Goliath main batteries powering up! Break its shield generator arrays!" }
      },
    },
    9: {
      1: {
        name: "9.1 Synaptic Spore Boundary",
        shortName: "Synaptic Spore Boundary",
        landmark: "kelp_canopy",
        particlePreset: "bio_spores",
        accentColor: "#00ff88",
        skyGradient: ["#02140a", "#042412", "#08381c"],
        intel: "The organic planetary surface pulsating with bio-luminescent nerve fibers.",
        hazard: "Synaptic Hive Spores",
        classifiedLog: "Haven-7 Biology: Spores create a direct neural link between the Hive Mother and all living organisms.",
        commLine: { s: "D", l: "The Xenomorph Hive. The planet itself is breathing and watching us." }
      },
      2: {
        name: "9.2 Acidic Spitter Nest",
        shortName: "Acidic Spitter Nest",
        landmark: "magma_chimney",
        particlePreset: "bio_spores",
        accentColor: "#00ff88",
        skyGradient: ["#02140a", "#042412", "#08381c"],
        intel: "Bio-plasma towers firing corrosive acid that dissolves energy shields.",
        hazard: "Bio-Plasma Spitter Nests",
        classifiedLog: "Xenobiology: Bio-plasma spitters fire corrosive acid globs that dissolve energy shields.",
        commLine: { s: "N", l: "Acid spitters firing from the bio-towers! Dodge laterally to avoid the splash!" }
      },
      3: {
        name: "9.3 Regenerating Chitin Walls",
        shortName: "Regenerating Chitin Walls",
        landmark: "coral_spire",
        particlePreset: "bio_spores",
        accentColor: "#00ff88",
        skyGradient: ["#02140a", "#042412", "#08381c"],
        intel: "Living chitin barriers that rapidly regenerate when damaged.",
        hazard: "Organic Chitin Walls",
        classifiedLog: "Haven-7 Tactical: Chitin walls regenerate rapidly unless destroyed with sustained high-explosive ordnance.",
        commLine: { s: "T", l: "Chitin walls are closing the tunnel! Blast a hole through the membrane!" }
      },
      4: {
        name: "9.4 Neural Hallucination Maze",
        shortName: "Neural Hallucination Maze",
        landmark: "sensor_buoy",
        particlePreset: "bio_spores",
        accentColor: "#00ff88",
        skyGradient: ["#02140a", "#042412", "#08381c"],
        intel: "Psychic resonance projecting false memories and phantom attack vectors.",
        hazard: "Synaptic Hallucinations",
        classifiedLog: "Psychic Telemetry: The Hive projects memories of loved ones to lure pilots into organic pods.",
        commLine: { s: "L", l: "Daddy... the walls are whispering in Mom's voice. Don't listen to them!" }
      },
      5: {
        name: "9.5 Bio-Construct Hatchery",
        shortName: "Bio-Construct Hatchery",
        landmark: "ruins_pylon",
        particlePreset: "bio_spores",
        accentColor: "#00ff88",
        skyGradient: ["#02140a", "#042412", "#08381c"],
        intel: "Thousands of bio-construct eggs pulsing with bio-electricity.",
        hazard: "Egg Nursery Hatcheries",
        classifiedLog: "Xeno-Reproduction: Thousands of bio-construct eggs pulsing with electric bioluminescence.",
        commLine: { s: "N", l: "Nursery sector. Wipe out the egg clusters before they hatch into interceptors." }
      },
      6: {
        name: "9.6 Bio-Acidic Waterfalls",
        shortName: "Bio-Acidic Waterfalls",
        landmark: "atoll_chasm",
        particlePreset: "bio_spores",
        accentColor: "#00ff88",
        skyGradient: ["#02140a", "#042412", "#08381c"],
        intel: "Cascading rivers of digestive acid dissolving structural rock.",
        hazard: "Acidic Fluid Waterfalls",
        classifiedLog: "Chemical Warning: Bio-acid waterfalls flowing from the ceiling into digestive pools below.",
        commLine: { s: "D", l: "Bio-acid dripping from the ceiling. Keep flight trim tight and centered." }
      },
      7: {
        name: "9.7 Synaptic Bridge Relays",
        shortName: "Synaptic Bridge Relays",
        landmark: "sunken_aqueduct",
        particlePreset: "bio_spores",
        accentColor: "#00ff88",
        skyGradient: ["#02140a", "#042412", "#08381c"],
        intel: "Neural nodes relaying hive coordination across the continental crust.",
        hazard: "Neural Bridge Nodes",
        classifiedLog: "Haven-7 Science: Synaptic nodes transferring stolen memories to the central hive mind.",
        commLine: { s: "T", l: "Destroy the neural bridge nodes. It'll blind their defensive coordination." }
      },
      8: {
        name: "9.8 Chitin Brute Vanguard",
        shortName: "Chitin Brute Vanguard",
        landmark: "leviathan_bones",
        particlePreset: "bio_spores",
        accentColor: "#00ff88",
        skyGradient: ["#02140a", "#042412", "#08381c"],
        intel: "Massive armored bio-titans designed to repel fleet orbital bombardments.",
        hazard: "Chitin Brute Vanguard",
        classifiedLog: "Combat Threat: Armored bio-titans designed to absorb fleet-level missile bombardments.",
        commLine: { s: "N", l: "Chitin Brute charging down the corridor! Aim for the soft joints under its carapace!" }
      },
      9: {
        name: "9.9 Hive Mother Throne Chamber",
        shortName: "Hive Mother Throne Chamber",
        landmark: "ruins_pylon",
        particlePreset: "bio_spores",
        accentColor: "#00ff88",
        skyGradient: ["#02140a", "#042412", "#08381c"],
        intel: "The organic heart of the living world where the queen resides.",
        hazard: "Hive Mother Throne Chamber",
        classifiedLog: "Haven-7 Intel: The Hive Mother sits atop a mountain of calcified Precursor technology.",
        commLine: { s: "L", l: "She's waiting for us in the center of the web. Her thoughts are overwhelming." }
      },
      10: {
        name: "9.10 Hive Mother Bio-Nexus",
        shortName: "Hive Mother Bio-Nexus",
        landmark: "chrono_singularity",
        particlePreset: "bio_spores",
        accentColor: "#00ff88",
        skyGradient: ["#02140a", "#042412", "#08381c"],
        intel: "The supreme bio-synthetic hive intellect controlling the xenomorph horde.",
        hazard: "Hive Mother Bio-Nexus",
        classifiedLog: "Classified Core File: Destroying the Hive Mother will sever the synaptic web and free all trapped minds.",
        commLine: { s: "D", l: "Hive Mother has uncoiled! Sever her neural tentacles and break her crown!" }
      },
    },
    10: {
      1: {
        name: "10.1 Event Horizon Ingress",
        shortName: "Event Horizon Ingress",
        landmark: "chrono_singularity",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "Crossing into the gravitational edge where space and time unbind.",
        hazard: "Event Horizon Gravitational Shear",
        classifiedLog: "Core Physics: Gravitational force near the singularity bends time by a factor of 100.",
        commLine: { s: "D", l: "The Core Rift. The edge of reality itself. We made it, Lyra." }
      },
      2: {
        name: "10.2 Temporal Loop Fractures",
        shortName: "Temporal Loop Fractures",
        landmark: "nebula_cloud",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "Shattered timeline fragments causing enemies to loop their trajectories.",
        hazard: "Chrono-Rift Temporal Fractures",
        classifiedLog: "Haven-7 Astrometry: Space and time are shattering into discrete, repeating code fragments.",
        commLine: { s: "N", l: "Enemies are rewinding their attack vectors! Anticipate the temporal loop!" }
      },
      3: {
        name: "10.3 Singularity Code Cascade",
        shortName: "Singularity Code Cascade",
        landmark: "sensor_buoy",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "Glowing green runes of universal source code cascading through reality.",
        hazard: "Singularity Code Streams",
        classifiedLog: "Precursor Matrix: The universe's source code is leaking into observable space as glowing green runes.",
        commLine: { s: "L", l: "I can read the code in the dark, Daddy. It says... everything is connected." }
      },
      4: {
        name: "10.4 Null-Space Void Chasm",
        shortName: "Null-Space Void Chasm",
        landmark: "atoll_chasm",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "Pockets of non-existence that instantly erase energy shields on contact.",
        hazard: "Null-Space Blackouts",
        classifiedLog: "Quantum Physics: Pockets of absolute non-existence that erase weapons and shields on contact.",
        commLine: { s: "T", l: "Null-space rifts opening ahead! Steer clear of the black voids!" }
      },
      5: {
        name: "10.5 Paradox Phantom Corridor",
        shortName: "Paradox Phantom Corridor",
        landmark: "ruins_pylon",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "Enemies phasing between multiple timelines simultaneously.",
        hazard: "Paradox Drone Phantoms",
        classifiedLog: "Temporal Mechanics: Drones existing in multiple timelines simultaneously.",
        commLine: { s: "N", l: "Paradox fighters are phased across timelines. Hit them when they fully materialize." }
      },
      6: {
        name: "10.6 Tachyon Mirror Shards",
        shortName: "Tachyon Mirror Shards",
        landmark: "coral_spire",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "Cosmic mirrors displaying reflections of alternate timelines and endings.",
        hazard: "Tachyon Mirror Shards",
        classifiedLog: "Haven-7 Core: Reflections in the rift show alternate endings of our journey.",
        commLine: { s: "D", l: "I see ships from every timeline flying alongside us. We're not alone." }
      },
      7: {
        name: "10.7 Singularity Overdrive Trench",
        shortName: "Singularity Overdrive Trench",
        landmark: "magma_chimney",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "Maximum acceleration required to avoid being pulled into the black hole.",
        hazard: "Singularity Horizon Chasm",
        classifiedLog: "Astrophysics Warning: Escape velocity here requires 100% quantum overdrive.",
        commLine: { s: "T", l: "Engines at 110%! Keep forward velocity or get pulled into the core!" }
      },
      8: {
        name: "10.8 Precursor Throne Spires",
        shortName: "Precursor Throne Spires",
        landmark: "sunken_aqueduct",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "The monumental architecture where the first Coelacanth was conceived.",
        hazard: "Precursor Throne Spires",
        classifiedLog: "Architectural File: The ancient monument where the first Cyber Coelacanth was conceived.",
        commLine: { s: "L", l: "The spires are singing the first song of creation. We're almost at the throne." }
      },
      9: {
        name: "10.9 Architect Prime Threshold",
        shortName: "Architect Prime Threshold",
        landmark: "frigate_wreck",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "The final cosmological gateway before the master creator.",
        hazard: "Architect Prime Threshold",
        classifiedLog: "Omega Directive: The Architect awaits to administer the final cosmological test.",
        commLine: { s: "A", l: "You who travel through time and sorrow... approach the final threshold..." }
      },
      10: {
        name: "10.10 The Cyber Coelacanth Singularity",
        shortName: "The Cyber Coelacanth Singularity",
        landmark: "chrono_singularity",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "The ultimate origin of consciousness and divine mechanical transcendence.",
        hazard: "The Cyber Coelacanth Singularity",
        classifiedLog: "Canonical Omega Record: The Cyber Coelacanth awakens in its transcendent divine form. Deliver humanity's answer.",
        commLine: { s: "D", l: "The Cyber Coelacanth has awakened! All weapons, all hearts, full burn!" }
      },
    },
  },
  // Helper method to retrieve sector intel and level metadata safely (GRO-4203)
  getLevelInfo(biome, level) {
    const b = Math.max(1, Math.min(10, biome || 1));
    const l = Math.max(1, Math.min(10, level || 1));
    if (this.levelDetails[b] && this.levelDetails[b][l]) {
      const data = this.levelDetails[b][l];
      return {
        sectorId: `b${b}_l${l}`,
        biome: b,
        level: l,
        ...data,
        hazard: data.hazard || `Hazard Level ${b}: Environmental Distortion`,
        classifiedLog: data.classifiedLog || `[CLASSIFIED ARCHIVE ${b}.${l}]: Precursor energy signature active in this sector. Proceed with caution.`,
        commLine: data.commLine || { s: 'D', l: `Entering sector ${b}.${l}. Weapons hot.` }
      };
    }
    return {
      sectorId: `b${b}_l${l}`,
      biome: b,
      level: l,
      name: `${b}.${l} Sector Passage`,
      shortName: 'Sector Passage',
      landmark: 'coral_spire',
      particlePreset: 'marine_snow',
      accentColor: '#00ffff',
      skyGradient: ['#020418', '#06102a', '#0a1a3a'],
      hazard: 'Standard Sector Hostility',
      intel: 'Navigating active sector airspace. Hostile fleet resistance detected.',
      classifiedLog: '[HAVEN-7 TELEMETRY]: Deep sector scans confirm high-density Precursor scrap reserves.',
      commLine: { s: 'D', l: `Sector ${b}.${l} in sight. Let's clear the path.` }
    };
  },

  getSectorIntel(biome, level, difficulty = null, ngLevel = null) {
    const info = this.getLevelInfo(biome, level);
    const b = Math.max(1, Math.min(10, biome || 1));
    const l = Math.max(1, Math.min(10, level || 1));
    const curDiff = difficulty || (typeof window !== 'undefined' && window.difficulty ? window.difficulty : 'normal');
    const curNg = (ngLevel !== null && ngLevel !== undefined) ? ngLevel : (typeof window !== 'undefined' && window.ngLevel ? window.ngLevel : 0);

    let bonusClassified = null;
    let bonusParadox = null;

    if (curDiff === 'hard' || curDiff === 'insane') {
      const cPool = (typeof BanterDB !== 'undefined' && BanterDB.classified) ? BanterDB.classified[b] : null;
      if (cPool && cPool.length > 0) {
        bonusClassified = cPool[(l - 1) % cPool.length].l;
      }
    }

    if (curNg >= 1) {
      const pPool = (typeof BanterDB !== 'undefined' && BanterDB.paradox) ? BanterDB.paradox[b] : null;
      if (pPool && pPool.length > 0) {
        bonusParadox = pPool[(l - 1) % pPool.length].l;
      }
    }

    return {
      ...info,
      bonusClassified,
      bonusParadox
    };
  }
};

// Expose on window for global access
if (typeof window !== 'undefined') {
  window.BIOME_DATA = BIOME_DATA;
}
if (typeof global !== 'undefined') {
  global.BIOME_DATA = BIOME_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BIOME_DATA;
}
