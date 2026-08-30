#!/usr/bin/env python3
"""
scripts/generate_rich_personality_voices.py
Master Studio Neural Voice Pipeline:
1. Procedural Radio Squelch, NASA/Aviation Chirps & Roger Beeps, and Cosmic Static Beds
2. Lyra: Articulate, intelligent 7-year-old voice (not babyish) over quantum crystal link
3. The Architect: Inhuman Booming Low Bass (-24Hz) with dramatic pauses, sub-50Hz core, and ethereal shimmer overtones
4. Radio Comms (Darius, Thorne, Naya, Cross, Selene): Dynamic intro chirps, outro squelch beeps, and electromagnetic static
"""

import os
import sys
import wave
import struct
import math
import random
import asyncio
import subprocess
import edge_tts
import google.antigravity as agy

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE_DIR = os.path.join(REPO_ROOT, "assets/showcase/voice")
PREVIEW_VOICE_DIR = os.path.join(REPO_ROOT, "assets/preview/audio")
SFX_DIR = os.path.join(REPO_ROOT, "assets/audio/sfx/comms")
os.makedirs(VOICE_DIR, exist_ok=True)
os.makedirs(PREVIEW_VOICE_DIR, exist_ok=True)
os.makedirs(SFX_DIR, exist_ok=True)

INTRO_WAV = os.path.join(SFX_DIR, "radio_intro_chirp.wav")
OUTRO_WAV = os.path.join(SFX_DIR, "radio_outro_squelch.wav")

def build_radio_sfx():
    """Generates procedural 48kHz PCM radio comms sound effects."""
    sr = 48000
    
    def write_wav(path, samples):
        with wave.open(path, 'w') as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sr)
            raw = bytearray()
            for s in samples:
                val = max(-32767, min(32767, int(s * 32767)))
                raw.extend(struct.pack('<h', val))
            w.writeframes(raw)

    # 1. Radio Intro Chirp (0.06s)
    intro_samples = []
    for i in range(int(sr * 0.06)):
        t = i / sr
        env = math.exp(-35 * t)
        tone = math.sin(2 * math.pi * 2800 * t) * 0.5
        noise = (random.random() * 2 - 1) * 0.4
        intro_samples.append((tone + noise) * env)
    write_wav(INTRO_WAV, intro_samples)

    # 2. Radio Outro Roger Beep & Squelch Tail (0.12s)
    outro_samples = []
    for i in range(int(sr * 0.12)):
        t = i / sr
        if t < 0.05:
            tone = math.sin(2 * math.pi * 2475 * t) * 0.45
            noise = (random.random() * 2 - 1) * 0.08
            env = 1.0
        elif t < 0.09:
            tone = math.sin(2 * math.pi * 1850 * t) * 0.45
            noise = (random.random() * 2 - 1) * 0.08
            env = 1.0
        else:
            t_tail = t - 0.09
            tone = 0
            noise = (random.random() * 2 - 1) * 0.4
            env = math.exp(-50 * t_tail)
        outro_samples.append((tone + noise) * env)
    write_wav(OUTRO_WAV, outro_samples)

async def synthesize_radio_comms_line(text, voice, pitch, rate, dsp_filter, final_path, noise_level=0.018):
    """Processes character voice with intro chirp, outro squelch, character DSP, and background cosmic static."""
    temp_raw = final_path + ".raw.mp3"
    comm = edge_tts.Communicate(text, voice, pitch=pitch, rate=rate)
    await comm.save(temp_raw)
    
    cmd = [
        "ffmpeg", "-y",
        "-i", INTRO_WAV,
        "-i", temp_raw,
        "-i", OUTRO_WAV,
        "-f", "lavfi", "-i", f"anoisesrc=c=pink:r=48000:a={noise_level}",
        "-filter_complex",
        "[0:a][1:a][2:a]concat=n=3:v=0:a=1,"
        f"{dsp_filter}[comms];"
        "[3:a]highpass=f=350,lowpass=f=4500,volume=0.3[noise_bed];"
        "[comms][noise_bed]amix=inputs=2:duration=first:dropout_transition=0.05,volume=1.35[outa]",
        "-map", "[outa]",
        "-c:a", "libmp3lame", "-b:a", "192k",
        final_path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.exists(temp_raw):
        os.remove(temp_raw)

async def synthesize_crystal_neural_line(text, voice, pitch, rate, dsp_filter, final_path):
    """Clean quantum neural link processing (for Lyra) without harsh static."""
    temp_raw = final_path + ".raw.mp3"
    comm = edge_tts.Communicate(text, voice, pitch=pitch, rate=rate)
    await comm.save(temp_raw)
    
    cmd = [
        "ffmpeg", "-y", "-i", temp_raw,
        "-af", dsp_filter,
        "-c:a", "libmp3lame", "-b:a", "192k",
        final_path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.exists(temp_raw):
        os.remove(temp_raw)

async def synthesize_booming_architect_entity(text, final_path):
    """Inhuman Booming Low Bass with dramatic spatial pauses, sub-bass octave, and ethereal shimmer overtones."""
    temp_raw = final_path + ".raw.mp3"
    # Single deep voice with slow, deliberate dramatic cadence
    comm = edge_tts.Communicate(text, "en-US-RogerNeural", pitch="-24Hz", rate="-18%")
    await comm.save(temp_raw)
    
    cmd = [
        "ffmpeg", "-y",
        "-i", temp_raw,
        "-filter_complex",
        # Layer 1: Booming Sub-Bass Core
        "[0:a]bass=g=18:f=55:w=0.6,volume=1.5[sub_bass];"
        # Layer 2: Ethereal High Shimmer Overtone (+1.5 octave crystal resonance)
        "[0:a]asetrate=48000*1.5,aresample=48000,highpass=f=2200,volume=0.32[shimmer];"
        # Mix booming sub-bass + shimmer + cosmic multi-dimensional cavern reverb
        "[sub_bass][shimmer]amix=inputs=2:duration=first,"
        "aecho=0.88:0.95:60|140|280:0.55|0.35|0.22,volume=1.6[outa]",
        "-map", "[outa]",
        "-c:a", "libmp3lame", "-b:a", "192k",
        final_path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.exists(temp_raw):
        os.remove(temp_raw)

async def build_all_personality_voices():
    print("=" * 70)
    print("GENERATING STUDIO NEURAL VOICES (RADIO STATIC + BOOMING ENTITY)")
    print("=" * 70)
    build_radio_sfx()
    
    # 1. DARIUS STAR (Gritty combat pilot VHF radio + squelch + static)
    print("1. Synthesizing DARIUS STAR (Cockpit VHF comms + squelch)...")
    darius_text = "This is Darius Star aboard the Nyxa. All weapons locked on the Coelacanth core. We finish this today."
    darius_out = os.path.join(VOICE_DIR, "darius_showcase.mp3")
    darius_dsp = "highpass=f=250,lowpass=f=5500,volume=1.35,aecho=0.7:0.75:18:0.2"
    await synthesize_radio_comms_line(darius_text, "en-US-ChristopherNeural", "-4Hz", "+6%", darius_dsp, darius_out, noise_level=0.018)
    subprocess.run(["cp", darius_out, os.path.join(PREVIEW_VOICE_DIR, "darius_climax.mp3")], check=True)
    obj = agy.Audio.from_file(darius_out)
    print(f"   -> [SDK Verified] {darius_out} ({len(obj.data):,} bytes)")

    # 2. LYRA STAR (Articulate 7-Year-Old Child over Quantum Crystal Link)
    print("2. Synthesizing LYRA STAR (Articulate 7-Year-Old Child timbre)...")
    lyra_text = "Daddy, the precursor quantum harmonies are opening. I'm shielding our navigation matrix now."
    lyra_out = os.path.join(VOICE_DIR, "lyra_showcase.mp3")
    lyra_dsp = "equalizer=f=7500:t=q:w=1.2:g=3.5,volume=1.25,aecho=0.8:0.85:25:0.2"
    await synthesize_crystal_neural_line(lyra_text, "en-US-AnaNeural", "-2Hz", "+2%", lyra_dsp, lyra_out)
    subprocess.run(["cp", lyra_out, os.path.join(PREVIEW_VOICE_DIR, "lyra_resonance.mp3")], check=True)
    obj = agy.Audio.from_file(lyra_out)
    print(f"   -> [SDK Verified] {lyra_out} ({len(obj.data):,} bytes)")

    # 3. COMMANDER THORNE (Stern military base command squelch)
    print("3. Synthesizing COMMANDER THORNE (Base director radio channel)...")
    thorne_text = "Mission Control to Nyxa. Tactical telemetry confirmed. You are cleared for hot entry into Sector 10."
    thorne_out = os.path.join(VOICE_DIR, "thorne_showcase.mp3")
    thorne_dsp = "equalizer=f=120:t=q:w=1:g=4,highpass=f=160,lowpass=f=5200,volume=1.35,aecho=0.75:0.8:22:0.25"
    await synthesize_radio_comms_line(thorne_text, "en-US-BrianNeural", "-6Hz", "-2%", thorne_dsp, thorne_out, noise_level=0.016)
    subprocess.run(["cp", thorne_out, os.path.join(PREVIEW_VOICE_DIR, "thorne_command.mp3")], check=True)
    obj = agy.Audio.from_file(thorne_out)
    print(f"   -> [SDK Verified] {thorne_out} ({len(obj.data):,} bytes)")

    # 4. NAYA THORNE (High-energy dogfight helmet mic + battle static)
    print("4. Synthesizing NAYA THORNE (Adrenaline wingman intercom)...")
    naya_text = "Naya on your right wing, Darius! I've got three fighters breaking through the spore cloud—taking them out!"
    naya_out = os.path.join(VOICE_DIR, "naya_showcase.mp3")
    naya_dsp = "highpass=f=350,lowpass=f=6500,volume=1.35,equalizer=f=3000:t=q:w=1:g=3"
    await synthesize_radio_comms_line(naya_text, "en-US-AvaNeural", "+1Hz", "+10%", naya_dsp, naya_out, noise_level=0.022)
    obj = agy.Audio.from_file(naya_out)
    print(f"   -> [SDK Verified] {naya_out} ({len(obj.data):,} bytes)")

    # 5. CROSS (Cybernetic spec-ops cyborg + flanged vocoder)
    print("5. Synthesizing CROSS (Cybernetic spec-ops flanged comms)...")
    cross_text = "Cybernetic dampers synchronized. Target signature acquired. Commencing railgun suppression volley."
    cross_out = os.path.join(VOICE_DIR, "cross_showcase.mp3")
    cross_dsp = "flanger=delay=4:depth=2.5:regen=45:width=85:speed=0.6,highpass=f=180,lowpass=f=7000,volume=1.3"
    await synthesize_radio_comms_line(cross_text, "en-US-EricNeural", "-5Hz", "-4%", cross_dsp, cross_out, noise_level=0.015)
    obj = agy.Audio.from_file(cross_out)
    print(f"   -> [SDK Verified] {cross_out} ({len(obj.data):,} bytes)")

    # 6. COMMANDER SELENE (Haven-7 deep space orbital telemetry)
    print("6. Synthesizing COMMANDER SELENE (Orbital deep space relay)...")
    selene_text = "Haven-7 Base Command transmitting encrypted survey coordinates. Be advised: extreme gravitational shear detected."
    selene_out = os.path.join(VOICE_DIR, "selene_showcase.mp3")
    selene_dsp = "equalizer=f=10000:t=q:w=1:g=3,volume=1.25,aecho=0.8:0.88:30:0.2"
    await synthesize_radio_comms_line(selene_text, "en-US-JennyNeural", "+0Hz", "+1%", selene_dsp, selene_out, noise_level=0.012)
    obj = agy.Audio.from_file(selene_out)
    print(f"   -> [SDK Verified] {selene_out} ({len(obj.data):,} bytes)")

    # 7. THE ARCHITECT (Inhuman Booming Low Bass with Spaced Phrases & Ethereal Shimmer)
    print("7. Synthesizing THE ARCHITECT (Inhuman Booming Bass & Ethereal Shimmer)...")
    arch_text = "Mortal vessels enter the singularity... ... ... The Dreamer awakens... ... ... Your journey ends... ... ... where creation began."
    arch_out = os.path.join(VOICE_DIR, "architect_showcase.mp3")
    await synthesize_booming_architect_entity(arch_text, arch_out)
    obj = agy.Audio.from_file(arch_out)
    print(f"   -> [SDK Verified] {arch_out} ({len(obj.data):,} bytes)")

    print("=" * 70)
    print("ALL 7 STUDIO NEURAL TRACKS COMPILED & SDK VERIFIED")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(build_all_personality_voices())
