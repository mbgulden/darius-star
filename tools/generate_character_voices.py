import tempfile
#!/usr/bin/env python3
"""
tools/generate_character_voices.py — High-Fidelity Character Voice Synthesis
=============================================================================
Synthesizes character-specific spoken voice lines for Darius Star: Cyber Coelacanth
using acoustic formant synthesis (libflite) with custom DSP audio chains:
- Lyra Star: 8-11yo child psychic navigator (pitch +15%, ethereal chorus/echo)
- Selene Star: Haven-7 orbital comms coordinator (warm radio bandpass filter)
- The Architect: Ancient precursor entity (pitch -25%, deep spatial ring-mod)
- Darius Star: Seasoned deep-sea scrapper/pilot (grounded, crisp comms)
- Wingmen (Cross, Thorne, Naya, Ophion): Radio comms EQ & spatial filters

Outputs Vorbis OGG (44.1kHz, 16-bit, normalized) directly to assets/audio/voice/
"""

import os
import sys
import subprocess
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
VOICE_DIR = REPO_ROOT / "assets" / "audio" / "voice"
VOICE_DIR.mkdir(parents=True, exist_ok=True)

CHARACTER_PROFILES = {
    "lyra": {
        "voice": "slt",
        "filter": "asetrate=16000*1.15,aresample=44100,aecho=0.8:0.88:35:0.25,treble=g=3,volume=1.3",
        "description": "Young 8-11yo child psychic navigator; gentle, perceptive, ethereal resonance"
    },
    "selene": {
        "voice": "slt",
        "filter": "aresample=44100,highpass=f=250,lowpass=f=3600,aecho=0.8:0.7:50:0.15,volume=1.2",
        "description": "Haven-7 orbital comms coordinator; warm, maternal, crisp radio-comms"
    },
    "architect": {
        "voice": "kal",
        "filter": "asetrate=16000*0.75,aresample=44100,aecho=0.9:0.85:70:0.4,flanger=delay=5:depth=2,volume=1.4",
        "description": "Vast precursor entity; slow, terrifying, deep resonant spatial reverberation"
    },
    "darius": {
        "voice": "awb",
        "filter": "aresample=44100,highpass=f=180,lowpass=f=4200,volume=1.1",
        "description": "Father, deep salvage mercenary; determined, grounded, protective comms"
    },
    "naya": {
        "voice": "slt",
        "filter": "asetrate=16000*1.02,aresample=44100,highpass=f=220,lowpass=f=4000,volume=1.15",
        "description": "Warden pilot; crisp military discipline, alert, focused"
    },
    "thorne": {
        "voice": "kal",
        "filter": "aresample=44100,highpass=f=150,lowpass=f=3800,volume=1.2",
        "description": "Commander Jack Thorne; gravelly old naval veteran, warm authority"
    },
    "cross": {
        "voice": "awb",
        "filter": "asetrate=16000*1.05,aresample=44100,highpass=f=200,lowpass=f=4000,volume=1.1",
        "description": "Valera Cross; fast-talking mercenary, punchy, pragmatic"
    },
    "ophion": {
        "voice": "rms",
        "filter": "asetrate=16000*0.92,aresample=44100,aecho=0.8:0.8:40:0.2,volume=1.2",
        "description": "Biosynthetic sentient vessel AI; calm, analytical, oceanic cadence"
    }
}

VOICE_CATALOG = [
    # ─── LYRA STAR RETREAT LINES (Biomes 1-10) ───
    ("b1_retreat_lyra_01", "lyra", "The dark in this trench is... heavy. It's trying to swallow my voice. I have to break contact!"),
    ("b2_retreat_lyra_01", "lyra", "So many old voices crying in this reef... it hurts! I have to shut them out!"),
    ("b3_retreat_lyra_01", "lyra", "The Hatchery Queen... she thinks I'm one of her children! She's pulling my mind down! Help!"),
    ("b4_retreat_lyra_01", "lyra", "The nebula... it's showing me things that haven't happened yet. I see fire and ice... I have to break the vision!"),
    ("b5_retreat_lyra_01", "lyra", "My thoughts are freezing into crystals... Daddy, I can't feel my fingers on the comms!"),
    ("b6_retreat_lyra_01", "lyra", "The fire isn't burning the ship... it's burning inside my chest! Daddy, pull away from the core!"),
    ("b7_retreat_lyra_01", "lyra", "The lightning is singing in my ears! Millions of voices all screaming at once!"),
    ("b8_retreat_lyra_01", "lyra", "The dead ships... they remember their crews! They think I'm their captain! Breaking link!"),
    ("b9_retreat_lyra_01", "lyra", "The hive mind found the crack in my thoughts! It's flooding in! Disengaging!"),
    ("b10_retreat_lyra_01", "lyra", "The Dreamer is waking up... and it's looking right at me! Daddy, we have to pull back NOW!"),

    # ─── LYRA STAR LEVEL START & NAVIGATOR LINES ───
    ("b1_level_start_lyra_01", "lyra", "Daddy, I can feel something down there. It's old. It's been waiting."),
    ("b2_level_start_lyra_01", "lyra", "The reef isn't silent, Daddy. The coral is remembering everything."),
    ("b3_level_start_lyra_01", "lyra", "The ice is humming. It feels like a heartbeat beneath Europa."),
    ("b4_level_start_lyra_01", "lyra", "The colors are shifting outside... I can see paths through the dust."),
    ("b5_level_start_lyra_01", "lyra", "Stay close to the warm current, Daddy. The frost wants to swallow us."),
    ("b6_level_start_lyra_01", "lyra", "The star is angry, but the fire has a rhythm. Follow my voice."),
    ("b7_level_start_lyra_01", "lyra", "Lightning everywhere! But there's a calm eye ahead. Punch through!"),
    ("b8_level_start_lyra_01", "lyra", "Forty years of ghost signals... Grandpa's frequency is somewhere here."),
    ("b9_level_start_lyra_01", "lyra", "The organic walls are breathing. The hive knows we've entered."),
    ("b10_level_start_lyra_01", "lyra", "This is the center of everything, Daddy. The Dreamer is right ahead!"),

    # ─── LYRA STAR BOSS ENCOUNTER & VICTORY LINES ───
    ("b1_boss_entrance_lyra_01", "lyra", "Daddy... it knows you're here. It recognizes something in you!"),
    ("b2_boss_entrance_lyra_01", "lyra", "The memory vault is opening! Watch out for the crystal spikes!"),
    ("b3_boss_entrance_lyra_01", "lyra", "The Queen is waking up! She's protecting her nursery!"),
    ("b4_boss_entrance_lyra_01", "lyra", "The dimensional fold is tearing! Don't let it pull you in!"),
    ("b5_boss_entrance_lyra_01", "lyra", "Glacial leviathan detected! Its armor is solid ice!"),
    ("b6_boss_entrance_lyra_01", "lyra", "The Flame Wyrm is emerging from the solar flare! Dive, Daddy, dive!"),
    ("b7_boss_entrance_lyra_01", "lyra", "Storm Colossus incoming! It's drawing power from the thunderheads!"),
    ("b8_boss_entrance_lyra_01", "lyra", "The Admiral's flagship is powering up! Main cannons charging!"),
    ("b9_boss_entrance_lyra_01", "lyra", "The Hive Core is pulsing! Aim for the glowing synaptic nodes!"),
    ("b10_boss_entrance_lyra_01", "lyra", "The Dreamer... it's so big, Daddy. It's looking right into our souls!"),

    # ─── LYRA STAR SQUAD SAVE & UNIQUE LINES ───
    ("b1_squad_save_lyra_01", "lyra", "I cleared the sensor noise! You're safe now!"),
    ("b2_squad_save_lyra_01", "lyra", "I blocked their psychic echo! Regroup on Daddy!"),
    ("b3_squad_save_lyra_01", "lyra", "Ophion, I found the thermal pocket! Head there now!"),
    ("b4_squad_save_lyra_01", "lyra", "I'm holding the dimensional rift open! Cross through!"),
    ("b5_squad_save_lyra_01", "lyra", "Don't give up! I can feel the exit coordinates!"),
    ("b6_squad_save_lyra_01", "lyra", "Shield frequency adjusted! The heat won't pierce us!"),
    ("b7_squad_save_lyra_01", "lyra", "The lightning missed you! Keep flying!"),
    ("b8_squad_save_lyra_01", "lyra", "Grandma, I've got your comm signal boosted!"),
    ("b9_squad_save_lyra_01", "lyra", "I pushed the hive thoughts back! Break their line!"),
    ("b10_squad_save_lyra_01", "lyra", "We can do this together! I'm right here with you!"),

    # ─── SELENE STAR (GRANDMOTHER COMMS) RETREAT & BRIEFING LINES (Biomes 1-10) ───
    ("b1_retreat_selene_01", "selene", "Comms from Haven-7 are fracturing. The abyssal distortion is too thick, I'm dropping offline!"),
    ("b2_retreat_selene_01", "selene", "My monitors are picking up precursor memory-drains on your energy reserves. Fall back immediately!"),
    ("b3_retreat_selene_01", "selene", "Temperatures in the Hatchery are dropping to absolute zero. Comms are freezing. Get out of there!"),
    ("b4_retreat_selene_01", "selene", "Twenty-three dimensional pockets detected inside the Veil. Navigation is impossible. Aborting the run!"),
    ("b5_retreat_selene_01", "selene", "Umbra's command ship just deployed an EMP field. My long-range sensors are scrambled. Going dark!"),
    ("b6_retreat_selene_01", "selene", "The Wyrm's core temperature is approaching stellar fusion levels. Everyone within two kilometers is at risk. Full retreat!"),
    ("b7_retreat_selene_01", "selene", "Barometric pressure dropped below survivable levels in sector seven. All ships must evacuate immediately!"),
    ("b8_retreat_selene_01", "selene", "Navy cruisers are warping in behind your position. You're about to be flanked. Fall back!"),
    ("b9_retreat_selene_01", "selene", "My satellite network is being converted into Hive relay nodes. I'm losing control of the entire grid. Disconnecting!"),
    ("b10_retreat_selene_01", "selene", "Synaptic interference is overwriting my monitors with memories of Marcus. I'm losing sanity. Dropping link!"),
    ("b1_briefing_pre_selene_01", "selene", "Darius, Haven-7 has your telemetry locked. Bring my granddaughter home safe."),
    ("b2_briefing_pre_selene_01", "selene", "The memory matrix is active in the coral reef. Watch your power converters."),
    ("b3_briefing_pre_selene_01", "selene", "Europa sub-surface scans show massive biological signatures. Be careful down there."),
    ("b4_briefing_pre_selene_01", "selene", "Quantum distortion rising in sector four. Lyra's readings are spiking."),
    ("b5_briefing_pre_selene_01", "selene", "Thermal heaters at maximum. Don't let your thruster manifolds freeze."),
    ("b6_briefing_pre_selene_01", "selene", "Solar radiation is climbing. Maintain defensive vector alpha."),
    ("b7_briefing_pre_selene_01", "selene", "Electromagnetic storm is peaking. Routing emergency power to shields."),
    ("b8_briefing_pre_selene_01", "selene", "I recognize the flagship's transponder... it belonged to Marcus's division."),
    ("b9_briefing_pre_selene_01", "selene", "Biological signatures are overwhelming our sensors. Cut through their nodes!"),
    ("b10_briefing_pre_selene_01", "selene", "Darius, whatever happens at the core... know that your father and I are proud of you."),

    # ─── THE ARCHITECT / PRECURSOR RETREAT & ALERT LINES (Biomes 1-10) ───
    ("b1_retreat_architect_01", "architect", "They come with fire... violating the ancient quiet... we must scatter their light!"),
    ("b2_retreat_architect_01", "architect", "The graves are empty... yet they sing of the ending... we will not let you disturb the dust!"),
    ("b3_retreat_architect_01", "architect", "Cold... dark... the cradle is broken... we will freeze the intruders in their steel shells!"),
    ("b4_retreat_architect_01", "architect", "The veil is thin... so thin... they pierce it with their metal bodies... we will weave it shut around them!"),
    ("b5_retreat_architect_01", "architect", "Iron walls... cage of dust... they will grind your small ships to ash... we will watch them freeze!"),
    ("b6_retreat_architect_01", "architect", "They bring cold fire... the burning that does not warm... we will smother their flames in silence!"),
    ("b7_retreat_architect_01", "architect", "Thunder is the voice of ending... lightning the glance of oblivion... we will let the storm take them!"),
    ("b8_retreat_architect_01", "architect", "They trespass among our honored dead... they disturb the eternal watch... the fleet will rise against them!"),
    ("b9_retreat_architect_01", "architect", "The Dreamer's many voices call to us... we are the silence between their thoughts... we will not be left alone again!"),
    ("b10_retreat_architect_01", "architect", "The void... the silence... we will not be dragged into the light... leave us to the dark..."),

    # ─── DARIUS STAR RETREAT LINES (Biomes 1-10) ───
    ("b1_retreat_darius_01", "darius", "These anglerfish drones locked onto my heat signature! I'm pulling out!"),
    ("b2_retreat_darius_01", "darius", "The memory vault defenses are firing phantom spikes! I'm pulling out before my hull crystallizes!"),
    ("b3_retreat_darius_01", "darius", "Freezing water is locking up my primary flight surfaces! Pulling back before I freeze solid!"),
    ("b4_retreat_darius_01", "darius", "Reality is folding around my ship! The Veil is trying to push me into a different dimension!"),
    ("b5_retreat_darius_01", "darius", "Squadron Umbra has me locked with heavy torpedoes! Pulling out of the ice field!"),
    ("b6_retreat_darius_01", "darius", "Plasma storm just ignited my port fuel line! I'm pulling out before the whole ship goes up!"),
    ("b7_retreat_darius_01", "darius", "Hurricane-force winds are tearing my stabilizers apart! I'm losing attitude control! Pulling out!"),
    ("b8_retreat_darius_01", "darius", "The flagship's point-defense lasers are tracing my engine wake! I'm pulling out before they bracket me!"),
    ("b9_retreat_darius_01", "darius", "The Hive Mind is piercing my mental defenses! It's trying to absorb my consciousness! Pulling back!"),
    ("b10_retreat_darius_01", "darius", "The black hole's gravity is pulling me past the event horizon! I'm pushing every thruster to break free!")
]


def synthesize_line(filename: str, char_key: str, text: str) -> bool:
    out_path = VOICE_DIR / f"{filename}.ogg"
    profile = CHARACTER_PROFILES.get(char_key, CHARACTER_PROFILES["darius"])
    flite_voice = profile["voice"]
    dsp_filter = profile["filter"]

    with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".txt", delete=False) as tf:
        tf.write(text)
        tf_path = tf.name

    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", f"flite=textfile={tf_path}:voice={flite_voice}",
        "-af", dsp_filter,
        "-c:a", "libvorbis",
        "-q:a", "4",
        str(out_path)
    ]

    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        os.unlink(tf_path)
        size = out_path.stat().st_size
        print(f"  [OK] {filename}.ogg ({char_key.upper()}): {size} bytes")
        return True
    except subprocess.CalledProcessError as e:
        if os.path.exists(tf_path):
            os.unlink(tf_path)
        print(f"  [ERROR] Failed to synthesize {filename}: {e.stderr[:200]}", file=sys.stderr)
        return False


def main():
    print("=" * 60)
    print("DARIUS STAR: SYNTHESIZING MISSING CHARACTER VOICE LINES")
    print(f"Output Directory: {VOICE_DIR}")
    print(f"Total Lines to Process: {len(VOICE_CATALOG)}")
    print("=" * 60)

    success_count = 0
    for filename, char_key, text in VOICE_CATALOG:
        if synthesize_line(filename, char_key, text):
            success_count += 1

    print("=" * 60)
    print(f"Synthesis Complete: {success_count}/{len(VOICE_CATALOG)} lines generated successfully.")
    print("=" * 60)


if __name__ == "__main__":
    main()
