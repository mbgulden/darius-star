#!/usr/bin/env python3
"""
scripts/generate_all_pre_level_html_audio.py
Fast parallel synthesizer for all 120 pre_level.html mission briefings.
"""

import os
import sys
import json
import asyncio
import subprocess
import edge_tts

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(REPO_ROOT, "assets/mission-briefings.json")
MANIFEST_PATH = os.path.join(REPO_ROOT, "assets/audio/voice_manifest.json")
SFX_DIR = os.path.join(REPO_ROOT, "assets/audio/sfx/comms")
os.makedirs(SFX_DIR, exist_ok=True)

INTRO_WAV = os.path.join(SFX_DIR, "radio_intro_chirp.wav")
OUTRO_WAV = os.path.join(SFX_DIR, "radio_outro_squelch.wav")

with open(JSON_PATH, "r") as f:
    briefing_data = json.load(f)

THORNE_VOICE = "en-US-BrianNeural"
THORNE_PITCH = "-6Hz"
THORNE_RATE = "-2%"
THORNE_DSP = "equalizer=f=120:t=q:w=1:g=4,highpass=f=160,lowpass=f=5200,volume=1.35,aecho=0.75:0.8:22:0.25"

sem = asyncio.Semaphore(10)

async def synthesize_thorne_line(biome_id, mode, idx, text, line_id):
    async with sem:
        file_rel = f"thorne/{line_id}.mp3"
        final_path = os.path.join(REPO_ROOT, "assets/audio/voice", file_rel)
        os.makedirs(os.path.dirname(final_path), exist_ok=True)
        
        temp_raw = final_path + ".raw.mp3"
        try:
            comm = edge_tts.Communicate(text, THORNE_VOICE, pitch=THORNE_PITCH, rate=THORNE_RATE)
            await comm.save(temp_raw)
            
            cmd = [
                "ffmpeg", "-y",
                "-i", INTRO_WAV,
                "-i", temp_raw,
                "-i", OUTRO_WAV,
                "-f", "lavfi", "-i", "anoisesrc=c=pink:r=48000:a=0.015",
                "-filter_complex",
                "[0:a][1:a][2:a]concat=n=3:v=0:a=1,"
                f"{THORNE_DSP}[comms];"
                "[3:a]highpass=f=350,lowpass=f=4500,volume=0.3[noise_bed];"
                "[comms][noise_bed]amix=inputs=2:duration=first:dropout_transition=0.05,volume=1.35[outa]",
                "-map", "[outa]",
                "-c:a", "libmp3lame", "-b:a", "192k",
                final_path
            ]
            
            proc = await asyncio.create_subprocess_exec(*cmd, stdout=asyncio.subprocess.DEVNULL, stderr=asyncio.subprocess.DEVNULL)
            await proc.wait()
            
            if os.path.exists(temp_raw):
                os.remove(temp_raw)
                
            probe_cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", final_path]
            p = await asyncio.create_subprocess_exec(*probe_cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
            stdout, _ = await p.communicate()
            dur = round(float(stdout.decode().strip()), 2)
            print(f"  [+] Done {line_id} ({dur}s)")
            return line_id, {
                "id": line_id,
                "speaker": "thorne",
                "file": file_rel,
                "text": text,
                "duration": dur,
                "biome": biome_id,
                "mode": mode,
                "type": "pre_level_briefing"
            }
        except Exception as e:
            print(f"  [-] Error {line_id}: {e}")
            if os.path.exists(temp_raw):
                os.remove(temp_raw)
            return line_id, None

async def main():
    print("=" * 70)
    print("PARALLEL SYNTHESIS: 120 PRE_LEVEL.HTML MISSION BRIEFINGS")
    print("=" * 70)
    
    with open(MANIFEST_PATH, "r") as f:
        manifest = json.load(f)
        
    tasks = []
    for biome in briefing_data.get("biomes", []):
        biome_id = biome["id"]
        pre_level = biome.get("pre_level", {})
        for mode in ["solo", "coop2", "coop4"]:
            lines = pre_level.get(mode, [])
            for idx, line_item in enumerate(lines):
                text = line_item.get("text", "")
                line_id = f"pre_b{biome_id}_{mode}_{idx+1}"
                tasks.append(synthesize_thorne_line(biome_id, mode, idx, text, line_id))
                
    results = await asyncio.gather(*tasks)
    
    success_count = 0
    for line_id, entry in results:
        if entry:
            manifest["lines"][line_id] = entry
            success_count += 1
            
    with open(MANIFEST_PATH, "w") as f:
        json.dump(manifest, f, indent=2)
        
    print("=" * 70)
    print(f"SUCCESS: {success_count}/{len(tasks)} audio tracks synthesized & manifest updated!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(main())
