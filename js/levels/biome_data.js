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
        intel: "Surface sunlight filters through azure waters, illuminating crystalline coral spires."
      },
      2: {
        name: "1.2 Coral Gardens Approach",
        shortName: "Coral Gardens Approach",
        landmark: "kelp_canopy",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "Dense fields of golden bioluminescent polyps line the subterranean ridge."
      },
      3: {
        name: "1.3 Derelict Scout Wreckage",
        shortName: "Derelict Scout Wreckage",
        landmark: "frigate_wreck",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "The rusted hull of an ancient Terran exploration probe rests wedged between reefs."
      },
      4: {
        name: "1.4 Turquoise Atoll Chasm",
        shortName: "Turquoise Atoll Chasm",
        landmark: "atoll_chasm",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "A massive vertical drop plunging deeper into the upper twilight zone."
      },
      5: {
        name: "1.5 Precursor Sensor Buoy",
        shortName: "Precursor Sensor Buoy",
        landmark: "sensor_buoy",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "A floating Precursor telemetry spire pulses low-frequency quantum pings."
      },
      6: {
        name: "1.6 Sunken Aqueduct Shallows",
        shortName: "Sunken Aqueduct Shallows",
        landmark: "sunken_aqueduct",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "Ancient stone and alloy water channels carved by the Precursors millennia ago."
      },
      7: {
        name: "1.7 Bioluminescent Kelp Wall",
        shortName: "Bioluminescent Kelp Wall",
        landmark: "kelp_canopy",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "Towering emerald kelp fronds create a natural labyrinth of drifting bio-spores."
      },
      8: {
        name: "1.8 Hydrothermal Chimney Field",
        shortName: "Hydrothermal Chimney Field",
        landmark: "magma_chimney",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "Sulfurous mineral spires venting superheated mineral-rich black smoke."
      },
      9: {
        name: "1.9 Submerged Fortress Approach",
        shortName: "Submerged Fortress Approach",
        landmark: "ruins_pylon",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "Fortified titanium sea-gates marking the perimeter of the biome guardian."
      },
      10: {
        name: "1.10 Guardian Reef Stronghold",
        shortName: "Guardian Reef Stronghold",
        landmark: "chrono_singularity",
        particlePreset: "bubbles_light",
        accentColor: "#00d2ff",
        skyGradient: ["#020b1e", "#041536", "#06224e"],
        intel: "The central defensive redoubt of the Abyssal Guardian Coelacanth."
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
        intel: "Calcified ivory coral formations stretching like skeletal fingers across the abyss."
      },
      2: {
        name: "2.2 Leviathan Ribcage Basin",
        shortName: "Leviathan Ribcage Basin",
        landmark: "leviathan_bones",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "The colossal fossilized ribcage of an ancient oceanic behemoth."
      },
      3: {
        name: "2.3 Spectral Frigate Hulks",
        shortName: "Spectral Frigate Hulks",
        landmark: "frigate_wreck",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "Warship hulls from the First Precursor War trapped in calcified coral nets."
      },
      4: {
        name: "2.4 Ghost Polyp Thicket",
        shortName: "Ghost Polyp Thicket",
        landmark: "kelp_canopy",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "Translucent purple sea fans that release numbing neurotoxin clouds on contact."
      },
      5: {
        name: "2.5 The Whispering Grotto",
        shortName: "The Whispering Grotto",
        landmark: "sensor_buoy",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "A cavern resonant with acoustic feedback from long-dead communications arrays."
      },
      6: {
        name: "2.6 Calcified Dreadnought Spine",
        shortName: "Calcified Dreadnought Spine",
        landmark: "frigate_wreck",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "The broken keel of an ancient flagship overgrown by calcified crystal vines."
      },
      7: {
        name: "2.7 Sunken Crypt Spire",
        shortName: "Sunken Crypt Spire",
        landmark: "ruins_pylon",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "An ancient ossuary monument radiating eerie magenta electromagnetic pulses."
      },
      8: {
        name: "2.8 Necrotic Anemone Trench",
        shortName: "Necrotic Anemone Trench",
        landmark: "atoll_chasm",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "Deep violet trenches populated by predatory colonies of giant anemones."
      },
      9: {
        name: "2.9 Graveyard Citadel Outer Wall",
        shortName: "Graveyard Citadel Outer Wall",
        landmark: "ruins_pylon",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "Imposing calcified ramparts guarding the inner graveyard sanctuary."
      },
      10: {
        name: "2.10 Ossuary of the Coelacanth",
        shortName: "Ossuary of the Coelacanth",
        landmark: "chrono_singularity",
        particlePreset: "bio_spores",
        accentColor: "#ff2a8d",
        skyGradient: ["#160020", "#240033", "#340046"],
        intel: "The tomb-chamber where ancient Cyber Coelacanth hulls were decommissioned."
      },
    },
    3: {
      1: {
        name: "3.1 Abyssal Shelf Entry",
        shortName: "Abyssal Shelf Entry",
        landmark: "atoll_chasm",
        particlePreset: "marine_snow",
        accentColor: "#00ff88",
        skyGradient: ["#00140c", "#002416", "#003a22"],
        intel: "The continental drop-off where sunlight completely ceases and eternal cold begins."
      },
      2: {
        name: "3.2 Bioluminescent Angler Trench",
        shortName: "Bioluminescent Angler Trench",
        landmark: "bio_cluster",
        particlePreset: "marine_snow",
        accentColor: "#00ff88",
        skyGradient: ["#00140c", "#002416", "#003a22"],
        intel: "Pulsing emerald lures illuminate drifting swarms of deep-trench predators."
      },
      3: {
        name: "3.3 The Great Siphonophore Net",
        shortName: "The Great Siphonophore Net",
        landmark: "siphonophore_bloom",
        particlePreset: "marine_snow",
        accentColor: "#00ff88",
        skyGradient: ["#00140c", "#002416", "#003a22"],
        intel: "Kilometer-long colonial organisms forming living electric net barriers."
      },
      4: {
        name: "3.4 Sunken Research Rig",
        shortName: "Sunken Research Rig",
        landmark: "frigate_wreck",
        particlePreset: "marine_snow",
        accentColor: "#00ff88",
        skyGradient: ["#00140c", "#002416", "#003a22"],
        intel: "An automated deep-water extraction platform that went dark centuries ago."
      },
      5: {
        name: "3.5 Trench Hydrophone Array",
        shortName: "Trench Hydrophone Array",
        landmark: "sensor_buoy",
        particlePreset: "marine_snow",
        accentColor: "#00ff88",
        skyGradient: ["#00140c", "#002416", "#003a22"],
        intel: "Listening sensors monitoring tectonic shifts and cybernetic leviathan songs."
      },
      6: {
        name: "3.6 Basalt Pillar Cavern",
        shortName: "Basalt Pillar Cavern",
        landmark: "coral_spire",
        particlePreset: "marine_snow",
        accentColor: "#00ff88",
        skyGradient: ["#00140c", "#002416", "#003a22"],
        intel: "Hexagonal volcanic basalt columns rising from the sea floor like gothic cathedrals."
      },
      7: {
        name: "3.7 Thermal Brine Pool",
        shortName: "Thermal Brine Pool",
        landmark: "magma_chimney",
        particlePreset: "marine_snow",
        accentColor: "#00ff88",
        skyGradient: ["#00140c", "#002416", "#003a22"],
        intel: "Hyper-saline underwater lakes with distinct ripples and extreme density currents."
      },
      8: {
        name: "3.8 Precursor Sub-Cable Junction",
        shortName: "Precursor Sub-Cable Junction",
        landmark: "sunken_aqueduct",
        particlePreset: "marine_snow",
        accentColor: "#00ff88",
        skyGradient: ["#00140c", "#002416", "#003a22"],
        intel: "Glowing superconductive power lines connecting oceanic core relays."
      },
      9: {
        name: "3.9 The Abyssal Throne Approach",
        shortName: "The Abyssal Throne Approach",
        landmark: "ruins_pylon",
        particlePreset: "marine_snow",
        accentColor: "#00ff88",
        skyGradient: ["#00140c", "#002416", "#003a22"],
        intel: "Massive cybernetic mooring pylons designed to service planetary leviathans."
      },
      10: {
        name: "3.10 Den of the Cyber Coelacanth",
        shortName: "Den of the Cyber Coelacanth",
        landmark: "chrono_singularity",
        particlePreset: "marine_snow",
        accentColor: "#00ff88",
        skyGradient: ["#00140c", "#002416", "#003a22"],
        intel: "The primary feeding and repair nest of the apex mechanized coelacanth."
      },
    },
    4: {
      1: {
        name: "4.1 Ionized Gas Shallows",
        shortName: "Ionized Gas Shallows",
        landmark: "nebula_cloud",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "Dense clouds of ionized violet hydrogen and interstellar dust particles."
      },
      2: {
        name: "4.2 Stellar Nursery Passage",
        shortName: "Stellar Nursery Passage",
        landmark: "proto_star",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "Bright newborn proto-stars glowing behind swirling veil nebulae."
      },
      3: {
        name: "4.3 Plasma Conduit Belt",
        shortName: "Plasma Conduit Belt",
        landmark: "sunken_aqueduct",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "Plasma filaments arcing across asteroid clusters like lightning storms."
      },
      4: {
        name: "4.4 Derelict Solar Sailer",
        shortName: "Derelict Solar Sailer",
        landmark: "frigate_wreck",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "A mirror-hulled Precursor vessel drifting silently with deployed photon sails."
      },
      5: {
        name: "4.5 Gravitational Anchor Station",
        shortName: "Gravitational Anchor Station",
        landmark: "sensor_buoy",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "A station stabilizing the spatial drift of the surrounding accretion clouds."
      },
      6: {
        name: "4.6 Prismatic Dust Clouds",
        shortName: "Prismatic Dust Clouds",
        landmark: "nebula_cloud",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "Reflective micro-crystal clouds creating blinding chromatic light scatter."
      },
      7: {
        name: "4.7 Tachyon Eddy Trench",
        shortName: "Tachyon Eddy Trench",
        landmark: "atoll_chasm",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "Localized tachyon currents causing spatial anomalies and sensor ghosting."
      },
      8: {
        name: "4.8 Singularity Remnant Orbit",
        shortName: "Singularity Remnant Orbit",
        landmark: "chrono_singularity",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "The dying ember of a micro-singularity warping surrounding space-time."
      },
      9: {
        name: "4.9 Nebula Core Outpost",
        shortName: "Nebula Core Outpost",
        landmark: "ruins_pylon",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "A fortified research bastion perched on the event rim of the nebula core."
      },
      10: {
        name: "4.10 Heart of the Ion Storm",
        shortName: "Heart of the Ion Storm",
        landmark: "chrono_singularity",
        particlePreset: "void_sparks",
        accentColor: "#b84dff",
        skyGradient: ["#0d001a", "#1a0033", "#28004d"],
        intel: "The turbulent center of the nebula where raw plasma energy coalesces."
      },
    },
    5: {
      1: {
        name: "5.1 Permafrost Belt Entry",
        shortName: "Permafrost Belt Entry",
        landmark: "ice_berg",
        particlePreset: "ice_crystals",
        accentColor: "#00e5ff",
        skyGradient: ["#061124", "#0a1d3d", "#0f2d5c"],
        intel: "Vast fields of glittering methane icebergs orbiting in razor-sharp rings."
      },
      2: {
        name: "5.2 Glacial Fracture Chasms",
        shortName: "Glacial Fracture Chasms",
        landmark: "atoll_chasm",
        particlePreset: "ice_crystals",
        accentColor: "#00e5ff",
        skyGradient: ["#061124", "#0a1d3d", "#0f2d5c"],
        intel: "Deep blue canyons cleaved through moon-sized ice sheets."
      },
      3: {
        name: "5.3 Cryo-Stasis Ark Derelict",
        shortName: "Cryo-Stasis Ark Derelict",
        landmark: "frigate_wreck",
        particlePreset: "ice_crystals",
        accentColor: "#00e5ff",
        skyGradient: ["#061124", "#0a1d3d", "#0f2d5c"],
        intel: "A frozen colonization vessel preserving millions of souls in eternal sleep."
      },
      4: {
        name: "5.4 Sub-Zero Methane Geysers",
        shortName: "Sub-Zero Methane Geysers",
        landmark: "magma_chimney",
        particlePreset: "ice_crystals",
        accentColor: "#00e5ff",
        skyGradient: ["#061124", "#0a1d3d", "#0f2d5c"],
        intel: "Cryo-volcanoes erupting liquid nitrogen and icy crystalline clouds."
      },
      5: {
        name: "5.5 Deep Freeze Sensor Pylon",
        shortName: "Deep Freeze Sensor Pylon",
        landmark: "sensor_buoy",
        particlePreset: "ice_crystals",
        accentColor: "#00e5ff",
        skyGradient: ["#061124", "#0a1d3d", "#0f2d5c"],
        intel: "A frosted sensor spire encased in diamond-hard interstellar ice."
      },
      6: {
        name: "5.6 Aurora Borealis Reflectors",
        shortName: "Aurora Borealis Reflectors",
        landmark: "nebula_cloud",
        particlePreset: "ice_crystals",
        accentColor: "#00e5ff",
        skyGradient: ["#061124", "#0a1d3d", "#0f2d5c"],
        intel: "Solar winds interacting with ice dust creating emerald and violet auroras."
      },
      7: {
        name: "5.7 Glacier Spire Labyrinth",
        shortName: "Glacier Spire Labyrinth",
        landmark: "ice_berg",
        particlePreset: "ice_crystals",
        accentColor: "#00e5ff",
        skyGradient: ["#061124", "#0a1d3d", "#0f2d5c"],
        intel: "Towering spikes of pure crystalline ice capable of piercing heavy dreadnought hulls."
      },
      8: {
        name: "5.8 Submerged Cryo-Matrix Hub",
        shortName: "Submerged Cryo-Matrix Hub",
        landmark: "sunken_aqueduct",
        particlePreset: "ice_crystals",
        accentColor: "#00e5ff",
        skyGradient: ["#061124", "#0a1d3d", "#0f2d5c"],
        intel: "Supercooled quantum processing arrays running at near absolute zero."
      },
      9: {
        name: "5.9 The Frost Citadel Bastion",
        shortName: "The Frost Citadel Bastion",
        landmark: "ruins_pylon",
        particlePreset: "ice_crystals",
        accentColor: "#00e5ff",
        skyGradient: ["#061124", "#0a1d3d", "#0f2d5c"],
        intel: "A fortress constructed entirely from high-tensile pykrete and titanium alloy."
      },
      10: {
        name: "5.10 Throne of the Frost Leviathan",
        shortName: "Throne of the Frost Leviathan",
        landmark: "chrono_singularity",
        particlePreset: "ice_crystals",
        accentColor: "#00e5ff",
        skyGradient: ["#061124", "#0a1d3d", "#0f2d5c"],
        intel: "The sub-zero core where frozen mechanical horrors are forged."
      },
    },
    6: {
      1: {
        name: "6.1 Thermal Ingress Ridge",
        shortName: "Thermal Ingress Ridge",
        landmark: "magma_chimney",
        particlePreset: "volcanic_ash",
        accentColor: "#ff5500",
        skyGradient: ["#200400", "#380a00", "#521200"],
        intel: "Boiling oceans of liquid magma and glowing basalt rock shelves."
      },
      2: {
        name: "6.2 Molten Iron Cataracts",
        shortName: "Molten Iron Cataracts",
        landmark: "magma_chimney",
        particlePreset: "volcanic_ash",
        accentColor: "#ff5500",
        skyGradient: ["#200400", "#380a00", "#521200"],
        intel: "Cascades of superheated liquid metal pouring into bottomless volcanic vents."
      },
      3: {
        name: "6.3 Incinerated Fleet Remains",
        shortName: "Incinerated Fleet Remains",
        landmark: "frigate_wreck",
        particlePreset: "volcanic_ash",
        accentColor: "#ff5500",
        skyGradient: ["#200400", "#380a00", "#521200"],
        intel: "Smoldering warship frames glowing cherry red from centuries of heat."
      },
      4: {
        name: "6.4 Caldera of the Sunken Titan",
        shortName: "Caldera of the Sunken Titan",
        landmark: "atoll_chasm",
        particlePreset: "volcanic_ash",
        accentColor: "#ff5500",
        skyGradient: ["#200400", "#380a00", "#521200"],
        intel: "A massive collapsed volcanic crater venting radiant geothermal energy."
      },
      5: {
        name: "6.5 Thermal Converter Array",
        shortName: "Thermal Converter Array",
        landmark: "sensor_buoy",
        particlePreset: "volcanic_ash",
        accentColor: "#ff5500",
        skyGradient: ["#200400", "#380a00", "#521200"],
        intel: "Precursor geothermal siphon tapping the planetary mantle for power."
      },
      6: {
        name: "6.6 Obsidian Needle Fields",
        shortName: "Obsidian Needle Fields",
        landmark: "coral_spire",
        particlePreset: "volcanic_ash",
        accentColor: "#ff5500",
        skyGradient: ["#200400", "#380a00", "#521200"],
        intel: "Towering needles of black volcanic glass jutting through boiling lava rivers."
      },
      7: {
        name: "6.7 Plasma Flare Corridor",
        shortName: "Plasma Flare Corridor",
        landmark: "nebula_cloud",
        particlePreset: "volcanic_ash",
        accentColor: "#ff5500",
        skyGradient: ["#200400", "#380a00", "#521200"],
        intel: "Superheated plasma jet streams that surge with rhythmic solar pulses."
      },
      8: {
        name: "6.8 Infernal Foundry Spires",
        shortName: "Infernal Foundry Spires",
        landmark: "ruins_pylon",
        particlePreset: "volcanic_ash",
        accentColor: "#ff5500",
        skyGradient: ["#200400", "#380a00", "#521200"],
        intel: "Ancient automated smelters forging impenetrable hull armor from molten ore."
      },
      9: {
        name: "6.9 Magma Citadel Gates",
        shortName: "Magma Citadel Gates",
        landmark: "ruins_pylon",
        particlePreset: "volcanic_ash",
        accentColor: "#ff5500",
        skyGradient: ["#200400", "#380a00", "#521200"],
        intel: "Titanium-reinforced floodgates holding back seas of pressurized magma."
      },
      10: {
        name: "6.10 Core of the Molten Behemoth",
        shortName: "Core of the Molten Behemoth",
        landmark: "chrono_singularity",
        particlePreset: "volcanic_ash",
        accentColor: "#ff5500",
        skyGradient: ["#200400", "#380a00", "#521200"],
        intel: "The superheated fusion crucible powering the biome's core engines."
      },
    },
    7: {
      1: {
        name: "7.1 Static Gale Perimeter",
        shortName: "Static Gale Perimeter",
        landmark: "nebula_cloud",
        particlePreset: "void_sparks",
        accentColor: "#e0aaff",
        skyGradient: ["#0c0c16", "#141424", "#1e1e36"],
        intel: "Continuous high-voltage electrical discharges illuminating dense thunderclouds."
      },
      2: {
        name: "7.2 Lightning Arcus Trench",
        shortName: "Lightning Arcus Trench",
        landmark: "atoll_chasm",
        particlePreset: "void_sparks",
        accentColor: "#e0aaff",
        skyGradient: ["#0c0c16", "#141424", "#1e1e36"],
        intel: "Deep low-pressure trough where lightning strikes occur thousands of times per minute."
      },
      3: {
        name: "7.3 Shattered Storm Cruiser",
        shortName: "Shattered Storm Cruiser",
        landmark: "frigate_wreck",
        particlePreset: "void_sparks",
        accentColor: "#e0aaff",
        skyGradient: ["#0c0c16", "#141424", "#1e1e36"],
        intel: "A dreadnought hull completely fused by a direct hit from a hyper-lightning bolt."
      },
      4: {
        name: "7.4 Tesla Coil Megastructure",
        shortName: "Tesla Coil Megastructure",
        landmark: "ruins_pylon",
        particlePreset: "void_sparks",
        accentColor: "#e0aaff",
        skyGradient: ["#0c0c16", "#141424", "#1e1e36"],
        intel: "Enormous atmospheric capacitors designed to harvest lightning strikes."
      },
      5: {
        name: "7.5 Barometric Station Zero",
        shortName: "Barometric Station Zero",
        landmark: "sensor_buoy",
        particlePreset: "void_sparks",
        accentColor: "#e0aaff",
        skyGradient: ["#0c0c16", "#141424", "#1e1e36"],
        intel: "An atmospheric monitoring outpost caught in a perpetual category 5 storm."
      },
      6: {
        name: "7.6 Cyclonic Eye Oasis",
        shortName: "Cyclonic Eye Oasis",
        landmark: "nebula_cloud",
        particlePreset: "void_sparks",
        accentColor: "#e0aaff",
        skyGradient: ["#0c0c16", "#141424", "#1e1e36"],
        intel: "The calm eye of the storm surrounded by a wall of supersonic storm clouds."
      },
      7: {
        name: "7.7 Electromagnetic Anvil",
        shortName: "Electromagnetic Anvil",
        landmark: "ruins_pylon",
        particlePreset: "void_sparks",
        accentColor: "#e0aaff",
        skyGradient: ["#0c0c16", "#141424", "#1e1e36"],
        intel: "A magnetic containment field focusing electrical storms into plasma lances."
      },
      8: {
        name: "7.8 Ion Surge Highway",
        shortName: "Ion Surge Highway",
        landmark: "sunken_aqueduct",
        particlePreset: "void_sparks",
        accentColor: "#e0aaff",
        skyGradient: ["#0c0c16", "#141424", "#1e1e36"],
        intel: "Turbulent atmospheric jet streams that propel ships at dizzying velocities."
      },
      9: {
        name: "7.9 Tempest Bastion Spires",
        shortName: "Tempest Bastion Spires",
        landmark: "ruins_pylon",
        particlePreset: "void_sparks",
        accentColor: "#e0aaff",
        skyGradient: ["#0c0c16", "#141424", "#1e1e36"],
        intel: "Spire fortresses anchoring atmospheric lightning grid conductors."
      },
      10: {
        name: "7.10 Eye of the Great Storm",
        shortName: "Eye of the Great Storm",
        landmark: "chrono_singularity",
        particlePreset: "void_sparks",
        accentColor: "#e0aaff",
        skyGradient: ["#0c0c16", "#141424", "#1e1e36"],
        intel: "The central atmospheric vortex where the Great Storm Leviathan resides."
      },
    },
    8: {
      1: {
        name: "8.1 Graveyard Perimeter Float",
        shortName: "Graveyard Perimeter Float",
        landmark: "frigate_wreck",
        particlePreset: "marine_snow",
        accentColor: "#ffaa33",
        skyGradient: ["#120c06", "#1e140a", "#2c1e10"],
        intel: "Miles of drifting orbital debris, broken armor plates, and escape pods."
      },
      2: {
        name: "8.2 Carrier Superstructure Ribs",
        shortName: "Carrier Superstructure Ribs",
        landmark: "frigate_wreck",
        particlePreset: "marine_snow",
        accentColor: "#ffaa33",
        skyGradient: ["#120c06", "#1e140a", "#2c1e10"],
        intel: "The hollow skeletal interior of a 5-kilometer star carrier."
      },
      3: {
        name: "8.3 Automated Salvage Hub",
        shortName: "Automated Salvage Hub",
        landmark: "sensor_buoy",
        particlePreset: "marine_snow",
        accentColor: "#ffaa33",
        skyGradient: ["#120c06", "#1e140a", "#2c1e10"],
        intel: "Autonomous scrap drones slicing derelict hulls into usable raw materials."
      },
      4: {
        name: "8.4 Weapon Testing Debris Field",
        shortName: "Weapon Testing Debris Field",
        landmark: "frigate_wreck",
        particlePreset: "marine_snow",
        accentColor: "#ffaa33",
        skyGradient: ["#120c06", "#1e140a", "#2c1e10"],
        intel: "Scattered target drones and shattered armor test-plates from old military drills."
      },
      5: {
        name: "8.5 Command Dreadnought Bridge",
        shortName: "Command Dreadnought Bridge",
        landmark: "ruins_pylon",
        particlePreset: "marine_snow",
        accentColor: "#ffaa33",
        skyGradient: ["#120c06", "#1e140a", "#2c1e10"],
        intel: "The shattered command module of a fleet admiral's flagship."
      },
      6: {
        name: "8.6 Ammunition Depository Ring",
        shortName: "Ammunition Depository Ring",
        landmark: "sunken_aqueduct",
        particlePreset: "marine_snow",
        accentColor: "#ffaa33",
        skyGradient: ["#120c06", "#1e140a", "#2c1e10"],
        intel: "Floating ordnance pods and volatile warhead storage canisters."
      },
      7: {
        name: "8.7 Ghost Ship Formation",
        shortName: "Ghost Ship Formation",
        landmark: "frigate_wreck",
        particlePreset: "marine_snow",
        accentColor: "#ffaa33",
        skyGradient: ["#120c06", "#1e140a", "#2c1e10"],
        intel: "A silent flotilla of unmanned defense corvettes locked in patrol loops."
      },
      8: {
        name: "8.8 Reactor Core Containment Breach",
        shortName: "Reactor Core Containment Breach",
        landmark: "magma_chimney",
        particlePreset: "marine_snow",
        accentColor: "#ffaa33",
        skyGradient: ["#120c06", "#1e140a", "#2c1e10"],
        intel: "A leaking antimatter drive venting radiant green radiation plumes."
      },
      9: {
        name: "8.9 Fleet Anchorage Bastion",
        shortName: "Fleet Anchorage Bastion",
        landmark: "ruins_pylon",
        particlePreset: "marine_snow",
        accentColor: "#ffaa33",
        skyGradient: ["#120c06", "#1e140a", "#2c1e10"],
        intel: "The central orbital drydock where dreadnoughts were once repaired."
      },
      10: {
        name: "8.10 The Scraplord's Flagship",
        shortName: "The Scraplord's Flagship",
        landmark: "chrono_singularity",
        particlePreset: "marine_snow",
        accentColor: "#ffaa33",
        skyGradient: ["#120c06", "#1e140a", "#2c1e10"],
        intel: "The amalgamated super-dreadnought constructed from hundreds of salvage hulls."
      },
    },
    9: {
      1: {
        name: "9.1 Biomass Outskirts",
        shortName: "Biomass Outskirts",
        landmark: "bio_cluster",
        particlePreset: "bio_spores",
        accentColor: "#33ff55",
        skyGradient: ["#040a04", "#081408", "#0d200d"],
        intel: "Living chitinous webbing creeping across asteroid surfaces and abandoned stations."
      },
      2: {
        name: "9.2 Spore Hatchery Chasm",
        shortName: "Spore Hatchery Chasm",
        landmark: "atoll_chasm",
        particlePreset: "bio_spores",
        accentColor: "#33ff55",
        skyGradient: ["#040a04", "#081408", "#0d200d"],
        intel: "Caverns filled with thousands of pulsating bio-organic egg pods."
      },
      3: {
        name: "9.3 Infested Frigate Hive",
        shortName: "Infested Frigate Hive",
        landmark: "frigate_wreck",
        particlePreset: "bio_spores",
        accentColor: "#33ff55",
        skyGradient: ["#040a04", "#081408", "#0d200d"],
        intel: "A military cruiser completely overrun and mutated into a biological incubator."
      },
      4: {
        name: "9.4 Bio-luminescent Neuro-Tendril",
        shortName: "Bio-luminescent Neuro-Tendril",
        landmark: "siphonophore_bloom",
        particlePreset: "bio_spores",
        accentColor: "#33ff55",
        skyGradient: ["#040a04", "#081408", "#0d200d"],
        intel: "Kilometer-long neural cables transmitting Hive Mind consciousness across space."
      },
      5: {
        name: "9.5 Hive Sensory Polyp Spire",
        shortName: "Hive Sensory Polyp Spire",
        landmark: "sensor_buoy",
        particlePreset: "bio_spores",
        accentColor: "#33ff55",
        skyGradient: ["#040a04", "#081408", "#0d200d"],
        intel: "Organic ocular spires tracking intruding starships through biological radar."
      },
      6: {
        name: "9.6 Acidic Vent Fields",
        shortName: "Acidic Vent Fields",
        landmark: "magma_chimney",
        particlePreset: "bio_spores",
        accentColor: "#33ff55",
        skyGradient: ["#040a04", "#081408", "#0d200d"],
        intel: "Geysers erupting concentrated bio-acid capable of dissolving titanium armor."
      },
      7: {
        name: "9.7 Chitin Megastructure Pillars",
        shortName: "Chitin Megastructure Pillars",
        landmark: "ruins_pylon",
        particlePreset: "bio_spores",
        accentColor: "#33ff55",
        skyGradient: ["#040a04", "#081408", "#0d200d"],
        intel: "Towering organic columns formed from hardened bio-composite secretions."
      },
      8: {
        name: "9.8 Synaptic Chamber Entrance",
        shortName: "Synaptic Chamber Entrance",
        landmark: "sunken_aqueduct",
        particlePreset: "bio_spores",
        accentColor: "#33ff55",
        skyGradient: ["#040a04", "#081408", "#0d200d"],
        intel: "Pulsing bio-valves that open and close to the rhythm of the Hive's heartbeat."
      },
      9: {
        name: "9.9 Broodmother Guard Bastion",
        shortName: "Broodmother Guard Bastion",
        landmark: "ruins_pylon",
        particlePreset: "bio_spores",
        accentColor: "#33ff55",
        skyGradient: ["#040a04", "#081408", "#0d200d"],
        intel: "Heavily defended organic redoubts shielding the inner reproductive sanctum."
      },
      10: {
        name: "9.10 Womb of the Hive Queen",
        shortName: "Womb of the Hive Queen",
        landmark: "chrono_singularity",
        particlePreset: "bio_spores",
        accentColor: "#33ff55",
        skyGradient: ["#040a04", "#081408", "#0d200d"],
        intel: "The central chamber where the biome's biological matriarch gestates horrors."
      },
    },
    10: {
      1: {
        name: "10.1 Event Horizon Threshold",
        shortName: "Event Horizon Threshold",
        landmark: "chrono_singularity",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "The edge of space-time where physics breaks down and light bends into loops."
      },
      2: {
        name: "10.2 Fractured Dimension Shards",
        shortName: "Fractured Dimension Shards",
        landmark: "chrono_cube",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "Floating crystalline reality fragments displaying scenes from alternate timelines."
      },
      3: {
        name: "10.3 Precursor Core Gateway",
        shortName: "Precursor Core Gateway",
        landmark: "sunken_aqueduct",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "Monumental dimensional locks forged from pure chronal energy."
      },
      4: {
        name: "10.4 Tesseract Memory Vaults",
        shortName: "Tesseract Memory Vaults",
        landmark: "chrono_cube",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "4-dimensional hypercubes storing the uploaded minds of the ancient Precursors."
      },
      5: {
        name: "10.5 Singularity Tachyon Sensor",
        shortName: "Singularity Tachyon Sensor",
        landmark: "sensor_buoy",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "A beacon measuring temporal decay at the nexus of all realities."
      },
      6: {
        name: "10.6 Paradox Cascade Trench",
        shortName: "Paradox Cascade Trench",
        landmark: "atoll_chasm",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "A spatial rift where destroyed ships reappear as phase-shifted temporal ghosts."
      },
      7: {
        name: "10.7 Singularity Rail Conduit",
        shortName: "Singularity Rail Conduit",
        landmark: "sunken_aqueduct",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "Energy rails accelerating matter to near-light speed toward the rift engine."
      },
      8: {
        name: "10.8 The Transcendent Matrix Hub",
        shortName: "The Transcendent Matrix Hub",
        landmark: "ruins_pylon",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "The central quantum computer that calculated the collapse of the universe."
      },
      9: {
        name: "10.9 Sanctum of the Prime Architect",
        shortName: "Sanctum of the Prime Architect",
        landmark: "ruins_pylon",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "The dimensional throne room guarding the ultimate origin of the Coelacanth."
      },
      10: {
        name: "10.10 The Cyber Coelacanth Singularity",
        shortName: "The Cyber Coelacanth Singularity",
        landmark: "chrono_singularity",
        particlePreset: "matrix_runes",
        accentColor: "#ff00ee",
        skyGradient: ["#06020c", "#10041e", "#1b0632"],
        intel: "The final nexus where the Cyber Coelacanth awakens in its full divine form."
      },
    },
  },

  // Helper method to retrieve level metadata safely
  getLevelInfo(biome, level) {
    const b = Math.max(1, Math.min(10, biome || 1));
    const l = Math.max(1, Math.min(10, level || 1));
    if (this.levelDetails[b] && this.levelDetails[b][l]) {
      return this.levelDetails[b][l];
    }
    return {
      name: `${b}.${l} Sector Passage`,
      shortName: 'Sector Passage',
      landmark: 'coral_spire',
      particlePreset: 'marine_snow',
      accentColor: '#00ffff',
      skyGradient: ['#020418', '#06102a', '#0a1a3a'],
      intel: 'Navigating active sector airspace. Hostile fleet resistance detected.'
    };
  }
};

// Expose on window for global access
if (typeof window !== 'undefined') {
  window.BIOME_DATA = BIOME_DATA;
}
