#!/usr/bin/env python3
"""
Cinematic SFX Sample Generator — GRO-1270
Generates 10 core gameplay SFX as synthetic audio samples (WAV → MP3).
No external ML models required — pure numpy synthesis + ffmpeg conversion.

Design direction: Cinematic sci-fi (Tron:Legacy, Mass Effect, Halo)
NOT arcade bleeps — layered, atmospheric, impactful.
"""

import numpy as np
import struct
import wave
import os
import subprocess
from pathlib import Path

SAMPLE_RATE = 44100
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "audio" / "sfx"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def make_wav(samples, filename, sample_rate=SAMPLE_RATE):
    """Write numpy array as 16-bit WAV file."""
    samples = np.clip(samples, -1.0, 1.0)
    int_samples = (samples * 32767).astype(np.int16)
    
    path = OUTPUT_DIR / filename
    with wave.open(str(path), 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(int_samples.tobytes())
    return path


def convert_to_mp3(wav_path):
    """Convert WAV to MP3 (128k CBR), remove WAV."""
    mp3_path = wav_path.with_suffix('.mp3')
    subprocess.run([
        'ffmpeg', '-y', '-i', str(wav_path),
        '-codec:a', 'libmp3lame', '-b:a', '128k',
        str(mp3_path)
    ], capture_output=True)
    if mp3_path.exists():
        wav_path.unlink()
        return mp3_path
    return None


def envelope(t, duration, attack=0.01, decay=None, sustain=0.7, release=0.05):
    """ADSR-style envelope. decay defaults to 30% of remaining duration."""
    if decay is None:
        decay = duration * 0.3
    y = np.ones_like(t)
    # Attack
    attack_samples = int(attack * SAMPLE_RATE)
    if attack_samples > 0:
        y[:attack_samples] = np.linspace(0, 1, attack_samples)
    # Decay
    decay_samples = int(decay * SAMPLE_RATE)
    decay_start = attack_samples
    decay_end = min(attack_samples + decay_samples, len(t))
    if decay_end > decay_start:
        y[decay_start:decay_end] = np.linspace(1, sustain, decay_end - decay_start)
    # Sustain (implicit)
    # Release
    release_samples = int(release * SAMPLE_RATE)
    if release_samples > 0:
        y[-release_samples:] *= np.linspace(1, 0, release_samples)
    return y


def sine_wave(freq, duration, sample_rate=SAMPLE_RATE):
    """Pure sine wave at given frequency."""
    t = np.arange(int(duration * sample_rate)) / sample_rate
    return np.sin(2 * np.pi * freq * t)


def sawtooth_wave(freq, duration, sample_rate=SAMPLE_RATE):
    """Sawtooth wave."""
    t = np.arange(int(duration * sample_rate)) / sample_rate
    return 2 * (t * freq - np.floor(t * freq + 0.5))


def square_wave(freq, duration, sample_rate=SAMPLE_RATE):
    """Square wave."""
    t = np.arange(int(duration * sample_rate)) / sample_rate
    return np.sign(np.sin(2 * np.pi * freq * t))


def triangle_wave(freq, duration, sample_rate=SAMPLE_RATE):
    """Triangle wave."""
    t = np.arange(int(duration * sample_rate)) / sample_rate
    return 2 * np.abs(2 * (t * freq - np.floor(t * freq + 0.5))) - 1


def white_noise(duration, sample_rate=SAMPLE_RATE):
    """White noise."""
    return np.random.uniform(-1, 1, int(duration * sample_rate))


def pink_noise(duration, sample_rate=SAMPLE_RATE):
    """Pink noise (1/f spectrum) via Voss-McCartney algorithm."""
    n_samples = int(duration * sample_rate)
    num_rows = 16
    rows = np.random.uniform(-1, 1, (num_rows, (n_samples + num_rows - 1) // num_rows + 1))
    running_sum = np.sum(rows[:, 0], axis=0)
    output = np.zeros(n_samples)
    for i in range(n_samples):
        output[i] = running_sum
        for j in range(num_rows):
            if (i + 1) % (2 ** j) == 0:
                row_idx = (i + 1) // (2 ** j)
                if row_idx < rows.shape[1]:
                    running_sum += rows[j, row_idx] - rows[j, row_idx - 1]
    output /= np.max(np.abs(output)) + 1e-10
    return output


def freq_sweep(start_hz, end_hz, duration, wave_fn=sine_wave):
    """Frequency sweep from start_hz to end_hz."""
    t = np.arange(int(duration * SAMPLE_RATE)) / SAMPLE_RATE
    # Linear frequency sweep
    freq = start_hz + (end_hz - start_hz) * t / duration
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    return np.sin(phase)


def lowpass(samples, cutoff_hz, sample_rate=SAMPLE_RATE):
    """Simple lowpass filter (moving average)."""
    window = int(sample_rate / cutoff_hz / 2)
    if window < 2:
        return samples
    kernel = np.ones(window) / window
    return np.convolve(samples, kernel, mode='same')


def highpass(samples, cutoff_hz, sample_rate=SAMPLE_RATE):
    """Simple highpass filter."""
    return samples - lowpass(samples, cutoff_hz, sample_rate)


# ────────────────────────────────────────────
# SFX GENERATORS — Cinematic sci-fi design
# ────────────────────────────────────────────

def gen_player_laser():
    """Cinematic laser shot — layered: bass thud + high zap + white noise crack.
    Tron:Legacy-style energy weapon — not a simple pew."""
    dur = 0.35
    t = np.arange(int(dur * SAMPLE_RATE)) / SAMPLE_RATE
    
    # Layer 1: Bass impact — sine sweep 200→60Hz
    bass = freq_sweep(200, 60, dur)
    bass_env = envelope(t, dur, attack=0.001, decay=0.05, sustain=0.1, release=0.15)
    bass *= bass_env * 0.5
    
    # Layer 2: Mid zap — sawtooth sweep 2000→400Hz
    mid = freq_sweep(2000, 400, dur * 0.6)
    mid_padded = np.zeros(len(t))
    mid_padded[:len(mid)] = mid
    mid_env = envelope(t, dur, attack=0.002, decay=0.08, sustain=0.05, release=0.1)
    mid_padded *= mid_env * 0.3
    
    # Layer 3: High crackle — filtered noise burst
    noise = white_noise(dur)
    noise = highpass(noise, 4000)
    noise_env = envelope(t, dur, attack=0.001, decay=0.02, sustain=0.05, release=0.08)
    noise *= noise_env * 0.15
    
    samples = bass + mid_padded + noise
    return make_wav(samples, 'player_laser.wav')


def gen_impact_hit():
    """Cinematic hit impact — deep thud + metallic ping + noise burst.
    Mass Effect-style shield impact."""
    dur = 0.25
    t = np.arange(int(dur * SAMPLE_RATE)) / SAMPLE_RATE
    
    # Layer 1: Deep thud — sine 80→30Hz
    thud = freq_sweep(80, 30, dur)
    thud_env = envelope(t, dur, attack=0.001, decay=0.04, sustain=0.1, release=0.1)
    thud *= thud_env * 0.6
    
    # Layer 2: Metallic ping — sine 1200Hz short burst
    ping = sine_wave(1200, 0.08)
    ping_padded = np.zeros(len(t))
    ping_padded[50:50+len(ping)] = ping
    ping_env = np.zeros(len(t))
    ping_env[50:50+len(ping)] = envelope(np.arange(len(ping))/SAMPLE_RATE, 0.08, attack=0.001, decay=0.03, sustain=0.05, release=0.02)
    ping_padded *= ping_env * 0.3
    
    # Layer 3: Noise impact
    noise = white_noise(dur)
    noise = lowpass(noise, 3000)
    noise_env = envelope(t, dur, attack=0.001, decay=0.03, sustain=0.05, release=0.08)
    noise *= noise_env * 0.2
    
    return make_wav(thud + ping_padded + noise, 'impact_hit.wav')


def gen_explosion_large():
    """Cinematic large explosion — layered bass rumble + mid crack + high debris.
    Halo-style ship explosion."""
    dur = 1.2
    t = np.arange(int(dur * SAMPLE_RATE)) / SAMPLE_RATE
    
    # Layer 1: Deep rumble — pink noise lowpassed
    rumble = pink_noise(dur)
    rumble = lowpass(rumble, 200)
    rumble_env = envelope(t, dur, attack=0.01, decay=0.3, sustain=0.2, release=0.5)
    rumble *= rumble_env * 0.5
    
    # Layer 2: Mid crack — white noise bandpass-ish
    crack = white_noise(dur)
    crack = lowpass(crack, 4000)
    crack = highpass(crack, 300)
    crack_env = envelope(t, dur, attack=0.005, decay=0.1, sustain=0.1, release=0.3)
    crack *= crack_env * 0.4
    
    # Layer 3: Sub impact — sine 40Hz thump
    sub = sine_wave(40, dur)
    sub_env = envelope(t, dur, attack=0.005, decay=0.15, sustain=0.1, release=0.4)
    sub *= sub_env * 0.4
    
    # Layer 4: Debris — high noise crackle tail
    debris = white_noise(dur)
    debris = highpass(debris, 2000)
    debris_env = envelope(t, dur, attack=0.02, decay=0.1, sustain=0.05, release=0.6)
    debris *= debris_env * 0.15
    
    return make_wav(sub + rumble + crack + debris, 'explosion_large.wav')


def gen_powerup_pickup():
    """Cinematic powerup — rising synth arpeggio with shimmer.
    Tron:Legacy-style energy pickup."""
    dur = 0.6
    n_samples = int(dur * SAMPLE_RATE)
    t = np.arange(n_samples) / SAMPLE_RATE
    
    # Rising C-major: C5, E5, G5, C6
    notes = [523.25, 659.25, 783.99, 1046.5]
    shimmer_notes = [2093, 2637, 3136, 4186]  # C7, E7, G7, C8
    note_dur = dur / len(notes)
    note_samples = int(note_dur * SAMPLE_RATE) + 1  # +1 to handle rounding
    
    # Pre-generate full waveforms for each note
    tri_waves = [triangle_wave(f, note_dur)[:note_samples] for f in notes]
    sine_waves = [sine_wave(f, note_dur)[:note_samples] for f in shimmer_notes]
    
    samples = np.zeros(n_samples)
    shimmer = np.zeros(n_samples)
    
    for i in range(4):
        start = int(i * note_dur * SAMPLE_RATE)
        end = int((i + 1) * note_dur * SAMPLE_RATE)
        seg_len = end - start
        seg_t = t[start:end] - t[start]
        
        # Use min to handle rounding differences
        n = min(seg_len, len(tri_waves[i]))
        note_env = envelope(seg_t[:n], note_dur, attack=0.01, decay=0.05, sustain=0.5, release=0.08)
        samples[start:start+n] = tri_waves[i][:n] * note_env[:n]
        shimmer[start:start+n] = sine_waves[i][:n] * note_env[:n] * 0.15
    
    global_env = envelope(t, dur, attack=0.02, decay=0.05, sustain=0.8, release=0.1)
    
    return make_wav((samples + shimmer) * global_env, 'powerup_pickup.wav')


def gen_laser_charge():
    """Cinematic charge-up — rising energy whine with sub-bass buildup.
    Mass Effect-style weapon charge."""
    dur = 0.9
    t = np.arange(int(dur * SAMPLE_RATE)) / SAMPLE_RATE
    
    # Layer 1: Rising sawtooth 100→800Hz (main whine)
    whine = freq_sweep(100, 800, dur, wave_fn=None)  # we'll build custom
    freq = 100 + (800 - 100) * t / dur
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    whine = np.sin(phase)  # use sine for cleaner sweep
    whine += 0.3 * np.sin(2 * phase)  # add slight harmonic
    whine_env = envelope(t, dur, attack=0.02, decay=0.1, sustain=0.6, release=0.05)
    whine *= whine_env * 0.4
    
    # Layer 2: Sub bass 40Hz throb (intensifies toward end)
    sub = sine_wave(40, dur)
    sub_intensity = np.linspace(0.3, 1.0, len(t))
    sub *= sub_intensity * 0.4
    
    # Layer 3: High-frequency crackle (intensifies)
    crackle = white_noise(dur)
    crackle = highpass(crackle, 3000)
    crackle_intensity = np.linspace(0.05, 0.4, len(t))
    crackle *= crackle_intensity
    
    # Layer 4: Pulsing energy clicks
    clicks = np.zeros(len(t))
    for click_time in [0.3, 0.5, 0.65, 0.78, 0.85]:
        idx = int(click_time * SAMPLE_RATE)
        if idx + 200 < len(clicks):
            clicks[idx:idx+200] = white_noise(200/SAMPLE_RATE) * 0.1 * min(1.0, (click_time / dur) * 2)
    
    return make_wav(whine + sub + crackle + clicks, 'laser_charge.wav')


def gen_laser_fire():
    """Cinematic laser discharge — sharp energy release with bass punch.
    Think Halo Spartan Laser firing."""
    dur = 0.55
    t = np.arange(int(dur * SAMPLE_RATE)) / SAMPLE_RATE
    
    # Layer 1: Sharp attack — square pulse burst
    burst = white_noise(0.08)
    burst = lowpass(burst, 8000)
    burst_padded = np.zeros(len(t))
    burst_padded[:len(burst)] = burst * 0.6
    
    # Layer 2: Descending zap — 3000→200Hz fast sweep
    zap = freq_sweep(3000, 200, dur)
    zap_env = envelope(t, dur, attack=0.002, decay=0.08, sustain=0.05, release=0.15)
    zap *= zap_env * 0.45
    
    # Layer 3: Bass thump
    thump = sine_wave(60, 0.15)
    thump_padded = np.zeros(len(t))
    thump_padded[:len(thump)] = thump
    thump_env = np.zeros(len(t))
    thump_env[:len(thump)] = envelope(np.arange(len(thump))/SAMPLE_RATE, 0.15, attack=0.002, decay=0.04, sustain=0.1, release=0.06)
    thump_padded *= thump_env * 0.5
    
    # Layer 4: Reverb tail — filtered noise
    tail = white_noise(dur)
    tail = lowpass(tail, 1500)
    tail_env = envelope(t, dur, attack=0.1, decay=0.1, sustain=0.1, release=0.3)
    tail *= tail_env * 0.08
    
    return make_wav(burst_padded + zap + thump_padded + tail, 'laser_fire.wav')


def gen_ui_click():
    """Subtle, atmospheric UI click — not a 8-bit tick.
    Soft, satisfying mechanical click feel."""
    dur = 0.12
    n_samples = int(dur * SAMPLE_RATE)
    t = np.arange(n_samples) / SAMPLE_RATE
    
    # Layer 1: Soft mechanical thud — sine 300→100Hz
    click_dur = 0.06
    click_n = int(click_dur * SAMPLE_RATE)
    click = freq_sweep(300, 100, click_dur)[:click_n]
    click_env = envelope(np.arange(click_n)/SAMPLE_RATE, click_dur, attack=0.001, decay=0.02, sustain=0.1, release=0.02)
    click *= click_env * 0.5
    
    # Pad to full duration
    click_padded = np.zeros(n_samples)
    click_padded[:click_n] = click
    
    # Layer 2: High tick — sine 3000Hz very short
    tick_dur = 0.02
    tick_n = int(tick_dur * SAMPLE_RATE)
    tick_offset = 20
    tick = sine_wave(3000, tick_dur)[:tick_n]
    tick_env = envelope(np.arange(tick_n)/SAMPLE_RATE, tick_dur, attack=0.001, decay=0.005, sustain=0.1, release=0.005)
    tick *= tick_env * 0.25
    
    tick_padded = np.zeros(n_samples)
    tick_padded[tick_offset:tick_offset+tick_n] = tick
    
    return make_wav(click_padded + tick_padded, 'ui_click.wav')


def gen_ui_select():
    """Atmospheric UI select — gentle rising chime, satisfying but not gamey.
    Soft confirmation tone."""
    dur = 0.25
    t = np.arange(int(dur * SAMPLE_RATE)) / SAMPLE_RATE
    
    # Rising two-tone chime: D5→A5
    freq1, freq2 = 587.33, 880.0  # D5, A5
    half = len(t) // 2
    
    tone1 = sine_wave(freq1, dur/2)
    tone2 = sine_wave(freq2, dur/2)
    
    combined = np.zeros(len(t))
    combined[:half] = tone1[:half]
    combined[half:half+len(tone2)] = tone2[:len(t)-half]
    
    # Add slight harmonic shimmer
    shimmer = sine_wave(freq1 * 2, dur/2) * 0.1
    shimmer2 = sine_wave(freq2 * 2, dur/2) * 0.1
    combined[:half] += shimmer[:half]
    combined[half:half+len(tone2)] += shimmer2[:len(t)-half]
    
    global_env = envelope(t, dur, attack=0.01, decay=0.03, sustain=0.5, release=0.06)
    
    return make_wav(combined * global_env * 0.6, 'ui_select.wav')


def gen_alarm_siren():
    """Cinematic alarm — dual-oscillator warbling, not arcade siren.
    Submarine/ship klaxon feel."""
    dur = 1.6
    t = np.arange(int(dur * SAMPLE_RATE)) / SAMPLE_RATE
    
    # Warbling frequency: slow modulation 400↔600Hz
    mod_freq = 3.0  # 3 Hz wobble
    base_freq = 500 + 100 * np.sin(2 * np.pi * mod_freq * t)
    
    # FM-like synthesis
    phase = 2 * np.pi * np.cumsum(base_freq) / SAMPLE_RATE
    carrier = np.sin(phase)
    modulator = np.sin(phase * 0.5) * 0.3  # sub-harmonic modulation
    
    siren = (carrier * 0.6 + modulator) * 0.7
    
    # Add sub-bass pulse
    sub = sine_wave(100, dur)
    sub_pulse = 0.5 + 0.5 * np.sin(2 * np.pi * 1.5 * t)  # slow pulse
    sub *= sub_pulse * 0.3
    
    # Global envelope with repeating swell
    swell = 0.5 + 0.5 * np.sin(2 * np.pi * 1.5 * t)
    global_env = envelope(t, dur, attack=0.03, decay=0.1, sustain=0.7, release=0.1)
    
    return make_wav((siren + sub) * global_env * swell, 'alarm_siren.wav')


def gen_victory_jingle():
    """Cinematic victory fanfare — triumphant chord progression, not 8-bit jingle.
    Orchestral sci-fi victory sting."""
    dur = 2.2
    n_samples = int(dur * SAMPLE_RATE)
    t = np.arange(n_samples) / SAMPLE_RATE
    
    # Triumphant chord progression: C-E-G-C → F-A-C → G-B-D → C-E-G-C
    
    progression = [
        (0.0, 0.5, [261.63, 329.63, 392.0, 523.25]),   # C major
        (0.5, 1.0, [349.23, 440.0, 523.25]),            # F major
        (1.0, 1.4, [392.0, 493.88, 587.33]),            # G major
        (1.4, 2.2, [261.63, 329.63, 392.0, 523.25, 1046.5]),  # C major (triumphant)
    ]
    
    samples = np.zeros(n_samples)
    
    for start_t, end_t, freqs in progression:
        start_idx = int(start_t * SAMPLE_RATE)
        end_idx = int(end_t * SAMPLE_RATE)
        seg_len = end_idx - start_idx
        seg_t = t[start_idx:end_idx] - t[start_idx]
        
        chord = np.zeros(seg_len)
        for freq in freqs:
            # Mix triangle (warm) + sine (bright) for orchestral feel
            tri = triangle_wave(freq, end_t - start_t)
            si = sine_wave(freq, end_t - start_t)
            # Use min to handle rounding differences in individual wave generators
            n = min(seg_len, len(tri), len(si))
            chord[:n] += tri[:n] * 0.15 + si[:n] * 0.08
        
        # Envelope per chord
        chord_env = envelope(seg_t, end_t - start_t, attack=0.02, decay=0.08, sustain=0.5, release=0.15)
        samples[start_idx:end_idx] = chord * chord_env
    
    # Add shimmer — high octave sparkle on final chord
    final_start = int(1.4 * SAMPLE_RATE)
    final_len = n_samples - final_start
    shimmer = sine_wave(2093, 0.8)  # C7 sparkle
    n_shim = min(final_len, len(shimmer))
    samples[final_start:final_start+n_shim] += shimmer[:n_shim] * 0.05
    
    # Global dynamic arc — crescendo on final chord
    intensity = np.ones(n_samples)
    intensity[final_start:] *= 1.0 + 0.3 * np.linspace(0, 1, n_samples - final_start)
    samples *= intensity
    
    return make_wav(samples, 'victory_jingle.wav')


# ────────────────────────────────────────────
# MAIN
# ────────────────────────────────────────────

GENERATORS = {
    'player_laser': gen_player_laser,
    'impact_hit': gen_impact_hit,
    'explosion_large': gen_explosion_large,
    'powerup_pickup': gen_powerup_pickup,
    'laser_charge': gen_laser_charge,
    'laser_fire': gen_laser_fire,
    'ui_click': gen_ui_click,
    'ui_select': gen_ui_select,
    'alarm_siren': gen_alarm_siren,
    'victory_jingle': gen_victory_jingle,
}


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Generate cinematic SFX samples')
    parser.add_argument('--all', action='store_true', help='Generate all 10 SFX types')
    parser.add_argument('--type', help='Generate a single SFX type (e.g. player_laser)')
    parser.add_argument('--list', action='store_true', help='List available SFX types')
    args = parser.parse_args()
    
    if args.list:
        print("Available SFX types:")
        for name in GENERATORS:
            print(f"  {name}")
        return
    
    to_generate = []
    if args.all:
        to_generate = list(GENERATORS.keys())
    elif args.type:
        if args.type not in GENERATORS:
            print(f"Unknown type: {args.type}")
            print(f"Available: {', '.join(GENERATORS.keys())}")
            return
        to_generate = [args.type]
    else:
        parser.print_help()
        return
    
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Generating {len(to_generate)} SFX samples...\n")
    
    for name in to_generate:
        print(f"  Generating {name}...", end=' ', flush=True)
        wav_path = GENERATORS[name]()
        print(f"WAV: {wav_path.name} ({wav_path.stat().st_size:,} bytes)", end=' ')
        mp3_path = convert_to_mp3(wav_path)
        if mp3_path:
            print(f"→ MP3: {mp3_path.name} ({mp3_path.stat().st_size:,} bytes)")
        else:
            print("→ MP3 conversion FAILED")
    
    print(f"\nDone. Generated {len(to_generate)} samples.")


if __name__ == '__main__':
    main()
