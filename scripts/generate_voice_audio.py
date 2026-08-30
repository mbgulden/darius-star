#!/usr/bin/env python3
"""
scripts/generate_voice_audio.py — Studio Voice Audio Generation & DSP Filtering Pipeline
Synthesizes character-specific voice recordings with precise acoustic profiles, 
cockpit comms filters, VHF radio squelches, and precursor reverbs using Python & FFmpeg.
"""

import os
import sys
import json
import math
import struct
import wave
import subprocess

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST_PATH = os.path.join(REPO_ROOT, 'assets/audio/voice_manifest.json')
OUTPUT_BASE = os.path.join(REPO_ROOT, 'assets/audio/voice')

SAMPLE_RATE = 48000

# Formant frequencies (F1, F2, F3) and bandwidths for characters
VOICE_MODELS = {
    'darius': {
        'base_pitch': 140.0,
        'formants': [(500, 80), (1100, 100), (2400, 150)],
        'roughness': 0.18,
        'ffmpeg_filter': 'highpass=f=250,lowpass=f=3800,acompressor=threshold=-14dB:ratio=4:attack=5:release=50,volume=1.4'
    },
    'lyra': {
        'base_pitch': 440.0,
        'formants': [(650, 90), (1700, 120), (2800, 180)],
        'roughness': 0.04,
        'ffmpeg_filter': 'aecho=0.8:0.88:40|80:0.3|0.2,volume=1.2'
    },
    'thorne': {
        'base_pitch': 110.0,
        'formants': [(400, 70), (950, 90), (2200, 140)],
        'roughness': 0.22,
        'ffmpeg_filter': 'highpass=f=350,lowpass=f=3200,acompressor=threshold=-12dB:ratio=6:attack=2:release=40,volume=1.5'
    },
    'naya': {
        'base_pitch': 280.0,
        'formants': [(550, 80), (1500, 110), (2600, 160)],
        'roughness': 0.08,
        'ffmpeg_filter': 'highpass=f=280,lowpass=f=4200,acompressor=threshold=-15dB:ratio=3.5:attack=4:release=50,volume=1.3'
    },
    'cross': {
        'base_pitch': 210.0,
        'formants': [(450, 90), (1300, 130), (2500, 190)],
        'roughness': 0.35,
        'ffmpeg_filter': 'flanger=delay=4:depth=3:regen=50:width=80:speed=2.5,highpass=f=200,lowpass=f=4000,volume=1.3'
    },
    'selene': {
        'base_pitch': 580.0,
        'formants': [(700, 100), (1900, 140), (3100, 200)],
        'roughness': 0.05,
        'ffmpeg_filter': 'aecho=0.8:0.7:30:0.25,volume=1.2'
    },
    'architect': {
        'base_pitch': 85.0,
        'formants': [(300, 60), (800, 80), (2000, 120)],
        'roughness': 0.28,
        'ffmpeg_filter': 'aecho=0.8:0.9:80|160|320:0.5|0.35|0.2,lowpass=f=4500,volume=1.6'
    }
}

def generate_voice_wave(text, speaker, duration, temp_wav_path):
    model = VOICE_MODELS.get(speaker, VOICE_MODELS['lyra'])
    base_f0 = model['base_pitch']
    roughness = model['roughness']
    formants = model['formants']

    total_samples = int(SAMPLE_RATE * duration)
    words = text.split()
    word_count = max(1, len(words))
    syllables_per_sec = max(2.5, min(5.5, len(text) / (duration * 3.5)))

    samples = []
    phase = 0.0
    mod_phase = 0.0

    for i in range(total_samples):
        t = i / SAMPLE_RATE
        
        # Envelope: Attack, Syllable rhythm, Decay
        envelope = min(1.0, t / 0.05) * min(1.0, (duration - t) / 0.08)
        syllable_env = 0.6 + 0.4 * math.sin(2.0 * math.pi * syllables_per_sec * t)
        
        # Pitch intonation drift (slight downward contour toward end of sentence)
        pitch_contour = 1.0 + 0.08 * math.sin(2.0 * math.pi * 0.8 * t) - (t / duration) * 0.12
        f0 = base_f0 * pitch_contour
        
        # Add micro-vibrato & roughness
        vibrato = 1.0 + 0.015 * math.sin(2.0 * math.pi * 5.5 * t)
        jitter = (math.sin(i * 123.456) * roughness) * 0.05
        current_freq = f0 * vibrato * (1.0 + jitter)

        phase += 2.0 * math.pi * current_freq / SAMPLE_RATE
        if phase > 2.0 * math.pi:
            phase -= 2.0 * math.pi

        # Pulse wave fundamental
        pulse = math.sin(phase) + 0.5 * math.sin(2 * phase) + 0.25 * math.sin(3 * phase)
        
        # Formant resonant synthesis
        sample_val = 0.0
        for f_freq, f_bw in formants:
            f_phase = 2.0 * math.pi * f_freq * t
            resonance = math.sin(f_phase) * math.exp(-t * (f_bw / 100.0) % 1.0)
            sample_val += pulse * resonance * 0.4

        # Combine
        final_sample = sample_val * envelope * syllable_env * 0.35
        # Soft clamp
        final_sample = max(-0.95, min(0.95, final_sample))
        int_sample = int(final_sample * 32767)
        samples.append(int_sample)

    # Write WAV
    with wave.open(temp_wav_path, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(struct.pack(f'<{len(samples)}h', *samples))

def process_voice_line(line_id, line_data):
    speaker = line_data.get('speaker', 'lyra').lower()
    text = line_data.get('text', '')
    duration = float(line_data.get('duration', 3.5))
    rel_file = line_data.get('file', f"{speaker}/{line_id}.mp3")
    
    out_mp3_path = os.path.join(OUTPUT_BASE, rel_file)
    os.makedirs(os.path.dirname(out_mp3_path), exist_ok=True)

    temp_wav = out_mp3_path.replace('.mp3', '_temp.wav')

    try:
        generate_voice_wave(text, speaker, duration, temp_wav)
        
        model = VOICE_MODELS.get(speaker, VOICE_MODELS['lyra'])
        audio_filter = model['ffmpeg_filter']

        # FFmpeg encode with filtergraph to MP3
        cmd = [
            'ffmpeg', '-y', '-i', temp_wav,
            '-af', audio_filter,
            '-b:a', '192k',
            '-loglevel', 'error',
            out_mp3_path
        ]
        subprocess.run(cmd, check=True)
    finally:
        if os.path.exists(temp_wav):
            os.remove(temp_wav)

def main():
    if not os.path.exists(MANIFEST_PATH):
        print(f"Manifest not found: {MANIFEST_PATH}")
        sys.exit(1)

    with open(MANIFEST_PATH, 'r', encoding='utf8') as f:
        manifest = json.load(f)

    lines = manifest.get('lines', {})
    print(f"Synthesizing {len(lines)} studio voice audio files...")

    count = 0
    for line_id, line_data in lines.items():
        process_voice_line(line_id, line_data)
        count += 1
        if count % 20 == 0 or count == len(lines):
            print(f"  Processed {count}/{len(lines)} voice files...")

    print("All studio voice files generated successfully!")

if __name__ == '__main__':
    main()
