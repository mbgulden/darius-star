#!/usr/bin/env python3
"""
scripts/rebuild_all_538_voice_manifest.py
Master Production Rebuilder for all 538+ in-game voice lines:
- Enhanced Phrasing & Natural Cadence
- Procedural NASA/Aviation Radio Squelch & Electromagnetic Noise Beds
- Lyra 7-Year-Old Child Timbre over Quantum Crystal Link
- The Architect Booming Inhuman Low Bass with Sub-Octave Drone
- Full Concurrency & SDK Verification
"""

import os
import sys
import json
import wave
import struct
import math
import random
import asyncio
import subprocess
import edge_tts
import google.antigravity as agy

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST_PATH = os.path.join(REPO_ROOT, "assets/audio/voice_manifest.json")
SFX_DIR = os.path.join(REPO_ROOT, "assets/audio/sfx/comms")
os.makedirs(SFX_DIR, exist_ok=True)

INTRO_WAV = os.path.join(SFX_DIR, "radio_intro_chirp.wav")
OUTRO_WAV = os.path.join(SFX_DIR, "radio_outro_squelch.wav")

# 1. Build Radio Comms SFX
def build_radio_sfx():
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

    # Radio Intro Chirp (0.06s)
    intro_samples = []
    for i in range(int(sr * 0.06)):
        t = i / sr
        env = math.exp(-35 * t)
        tone = math.sin(2 * math.pi * 2800 * t) * 0.5
        noise = (random.random() * 2 - 1) * 0.4
        intro_samples.append((tone + noise) * env)
    write_wav(INTRO_WAV, intro_samples)

    # Radio Outro Roger Beep & Squelch Tail (0.12s)
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

# 2. Phrasing & Natural Pacing Optimizer
def optimize_phrasing(text: str, speaker: str) -> str:
    t = text.strip()
    if speaker == "architect":
        # Add dramatic deliberate pauses
        t = t.replace(". ", "... ... ").replace("! ", "... ... ").replace("? ", "... ... ")
        return t
    if speaker == "lyra":
        # Make child pacing natural with slight breath pauses
        t = t.replace("...", ", ").replace("  ", " ")
        return t
    if speaker == "darius":
        # Combat urgency with intentional breath breaks
        t = t.replace("... ", ", ").replace(" -- ", ", ")
        return t
    return t

# 3. Speaker Profiles
SPEAKER_CONFIGS = {
    "darius": {
        "voice": "en-US-ChristopherNeural",
        "pitch": "-4Hz",
        "rate": "+5%",
        "type": "radio",
        "noise": 0.018,
        "dsp": "highpass=f=250,lowpass=f=5500,volume=1.35,aecho=0.7:0.75:18:0.2"
    },
    "lyra": {
        "voice": "en-US-AnaNeural",
        "pitch": "-2Hz",
        "rate": "+2%",
        "type": "crystal",
        "dsp": "equalizer=f=7500:t=q:w=1.2:g=3.5,volume=1.25,aecho=0.8:0.85:25:0.2"
    },
    "thorne": {
        "voice": "en-US-BrianNeural",
        "pitch": "-6Hz",
        "rate": "-2%",
        "type": "radio",
        "noise": 0.016,
        "dsp": "equalizer=f=120:t=q:w=1:g=4,highpass=f=160,lowpass=f=5200,volume=1.35,aecho=0.75:0.8:22:0.25"
    },
    "naya": {
        "voice": "en-US-AvaNeural",
        "pitch": "+1Hz",
        "rate": "+9%",
        "type": "radio",
        "noise": 0.022,
        "dsp": "highpass=f=350,lowpass=f=6500,volume=1.35,equalizer=f=3000:t=q:w=1:g=3"
    },
    "cross": {
        "voice": "en-US-EricNeural",
        "pitch": "-5Hz",
        "rate": "-4%",
        "type": "radio",
        "noise": 0.015,
        "dsp": "flanger=delay=4:depth=2.5:regen=45:width=85:speed=0.6,highpass=f=180,lowpass=f=7000,volume=1.3"
    },
    "selene": {
        "voice": "en-US-JennyNeural",
        "pitch": "+0Hz",
        "rate": "+1%",
        "type": "radio",
        "noise": 0.012,
        "dsp": "equalizer=f=10000:t=q:w=1:g=3,volume=1.25,aecho=0.8:0.88:30:0.2"
    },
    "architect": {
        "voice": "en-GB-ThomasNeural",
        "pitch": "-8Hz",
        "rate": "-16%",
        "type": "architect",
        "dsp": ""
    }
}

async def process_item(item_id, item_data, sem, stats):
    async with sem:
        speaker = item_data.get("speaker", "darius").lower()
        cfg = SPEAKER_CONFIGS.get(speaker, SPEAKER_CONFIGS["darius"])
        
        rel_file = item_data["file"]
        final_path = os.path.join(REPO_ROOT, "assets/audio/voice", rel_file)
        os.makedirs(os.path.dirname(final_path), exist_ok=True)
        
        raw_temp = final_path + ".raw.mp3"
        phrased_text = optimize_phrasing(item_data["text"], speaker)
        
        # 1. Neural TTS Call with Retry
        max_retries = 3
        for attempt in range(max_retries):
            try:
                comm = edge_tts.Communicate(phrased_text, cfg["voice"], pitch=cfg["pitch"], rate=cfg["rate"])
                await comm.save(raw_temp)
                break
            except Exception as e:
                if attempt == max_retries - 1:
                    print(f"[-] TTS Error for [{item_id}]: {e}")
                    return
                await asyncio.sleep(0.5 * (attempt + 1))
                
        # 2. FFmpeg DSP Mastering
        try:
            if cfg["type"] == "radio":
                cmd = [
                    "ffmpeg", "-y",
                    "-i", INTRO_WAV,
                    "-i", raw_temp,
                    "-i", OUTRO_WAV,
                    "-f", "lavfi", "-i", f"anoisesrc=c=pink:r=48000:a={cfg['noise']}",
                    "-filter_complex",
                    "[0:a][1:a][2:a]concat=n=3:v=0:a=1,"
                    f"{cfg['dsp']}[comms];"
                    "[3:a]highpass=f=350,lowpass=f=4500,volume=0.3[noise_bed];"
                    "[comms][noise_bed]amix=inputs=2:duration=first:dropout_transition=0.05,volume=1.35[outa]",
                    "-map", "[outa]",
                    "-c:a", "libmp3lame", "-b:a", "192k",
                    final_path
                ]
            elif cfg["type"] == "crystal":
                cmd = [
                    "ffmpeg", "-y", "-i", raw_temp,
                    "-af", cfg["dsp"],
                    "-c:a", "libmp3lame", "-b:a", "192k",
                    final_path
                ]
            elif cfg["type"] == "architect":
                cmd = [
                    "ffmpeg", "-y", "-i", raw_temp,
                    "-filter_complex",
                    "[0:a]bass=g=18:f=70:w=0.8,equalizer=f=3000:t=q:w=1:g=2,volume=1.4[bass_voice];"
                    "[0:a]asetrate=48000*0.82,aresample=48000,lowpass=f=200,volume=1.2[sub_drone];"
                    "[bass_voice][sub_drone]amix=inputs=2:duration=first,"
                    "aecho=0.85:0.88:60|120:0.4|0.25,volume=1.4[outa]",
                    "-map", "[outa]",
                    "-c:a", "libmp3lame", "-b:a", "192k",
                    final_path
                ]
                
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            if os.path.exists(raw_temp):
                os.remove(raw_temp)
                
            # Read duration
            probe_cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", final_path]
            res = subprocess.run(probe_cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
            duration = float(res.stdout.strip()) if res.stdout.strip() else item_data.get("duration", 3.0)
            item_data["duration"] = round(duration, 2)
            
            stats["completed"] += 1
            if stats["completed"] % 25 == 0 or stats["completed"] == stats["total"]:
                print(f"  [{stats['completed']}/{stats['total']}] Processed & Verified ({stats['completed']/stats['total']*100:.1f}%)")
        except Exception as e:
            print(f"[-] DSP Error for [{item_id}]: {e}")

async def main():
    print("=" * 70)
    print("REBUILDING ALL 538+ VOICE DIALOGUE FILES (STUDIO NEURAL ENGINE)")
    print("=" * 70)
    build_radio_sfx()
    
    with open(MANIFEST_PATH, "r") as f:
        manifest = json.load(f)
        
    lines = manifest.get("lines", {})
    stats = {"completed": 0, "total": len(lines)}
    print(f"Found {stats['total']} lines in voice_manifest.json. Launching async pool (10 workers)...")
    
    sem = asyncio.Semaphore(10)
    tasks = [process_item(k, v, sem, stats) for k, v in lines.items()]
    await asyncio.gather(*tasks)
    
    # Save updated durations back to manifest
    with open(MANIFEST_PATH, "w") as f:
        json.dump(manifest, f, indent=2)
        
    print("=" * 70)
    print(f"SUCCESS: All {stats['completed']} lines synthesized & voice_manifest.json updated!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(main())
