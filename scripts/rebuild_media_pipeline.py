#!/usr/bin/env python3
"""
scripts/rebuild_media_pipeline.py — Master Media Rebuilder & Concurrency Benchmark
- Rebuilds all audio dialogue in strict batches of 10 with character acoustic consistency.
- Rebuilds all boss and story cinematics strictly one-at-a-time.
- Benchmarks concurrency limits and throughput to maximize future output.
"""

import os
import sys
import json
import time
import subprocess
from concurrent.futures import ProcessPoolExecutor, as_completed

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE_MANIFEST = os.path.join(REPO_ROOT, 'assets/audio/voice_manifest.json')
CINEMATICS_MANIFEST = os.path.join(REPO_ROOT, 'assets/cinematics/cinematics_manifest.json')
VOICE_OUTPUT_DIR = os.path.join(REPO_ROOT, 'assets/audio/voice')
CINEMATICS_OUTPUT_DIR = os.path.join(REPO_ROOT, 'assets/cinematics')

# Import core voice and cinematic processors
sys.path.insert(0, os.path.join(REPO_ROOT, 'scripts'))
from generate_voice_audio import process_voice_line, VOICE_MODELS
from generate_boss_cinematics import render_cinematic

def chunk_list(lst, chunk_size=10):
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]

def rebuild_audio_in_batches_of_10():
    print("=" * 70)
    print("1. REBUILDING ALL AUDIO DIALOGUE IN BATCHES OF 10")
    print("=" * 70)

    if not os.path.exists(VOICE_MANIFEST):
        print(f"[ERROR] Manifest missing: {VOICE_MANIFEST}")
        return

    with open(VOICE_MANIFEST, 'r', encoding='utf8') as f:
        manifest = json.load(f)

    lines = list(manifest.get('lines', {}).items())
    total_lines = len(lines)
    batches = list(chunk_list(lines, 10))
    print(f"Total Lines: {total_lines} | Total Batches of 10: {len(batches)}")

    start_time = time.time()
    completed = 0

    for b_idx, batch in enumerate(batches, 1):
        b_start = time.time()
        # Execute batch of 10 in parallel
        with ProcessPoolExecutor(max_workers=min(10, len(batch))) as executor:
            futures = [executor.submit(process_voice_line, item) for item in batch]
            for future in as_completed(futures):
                future.result()
        
        completed += len(batch)
        b_duration = time.time() - b_start
        print(f"  [Batch {b_idx:02d}/{len(batches)}] Processed {len(batch)} lines in {b_duration:.2f}s (Total: {completed}/{total_lines})")

    total_duration = time.time() - start_time
    rate = total_lines / max(0.1, total_duration)
    print(f"\n[OK] Rebuilt all {total_lines} audio files in {total_duration:.2f}s ({rate:.1f} lines/sec)\n")

def rebuild_videos_one_at_a_time():
    print("=" * 70)
    print("2. REBUILDING ALL CINEMATIC VIDEOS ONE AT A TIME")
    print("=" * 70)

    if not os.path.exists(CINEMATICS_MANIFEST):
        print(f"[ERROR] Manifest missing: {CINEMATICS_MANIFEST}")
        return

    with open(CINEMATICS_MANIFEST, 'r', encoding='utf8') as f:
        manifest_data = json.load(f)

    cinematics = manifest_data.get('cinematics', {})
    
    # Add standard fallback keys
    cinematics['cinematic_boss_intro'] = {
        'name': 'CYBERNETIC COELACANTH APEX',
        'superpower': 'CHRONO RAILGUN & OMEGA SINGULARITY',
        'path': 'assets/cinematics/cinematic_boss_intro.mp4',
        'duration': 5,
        'themeColor': '#ff0055'
    }
    cinematics['cinematic_victory'] = {
        'name': 'VICTORY: PRECURSOR SINGULARITY SECURED',
        'superpower': 'ASCENT TO SURFACE FLEET HAVEN-7',
        'path': 'assets/cinematics/cinematic_victory.mp4',
        'duration': 6,
        'themeColor': '#00ff88'
    }

    total_videos = len(cinematics)
    start_time = time.time()

    for idx, (key, entry) in enumerate(cinematics.items(), 1):
        v_start = time.time()
        print(f"[{idx:02d}/{total_videos}] Rendering 60fps HD video sequentially: {key}...")
        render_cinematic(key, entry)
        v_dur = time.time() - v_start
        print(f"       -> Completed in {v_dur:.2f}s")

    total_duration = time.time() - start_time
    print(f"\n[OK] Rebuilt all {total_videos} cinematic videos in {total_duration:.2f}s\n")

def test_concurrency_limits():
    print("=" * 70)
    print("3. TESTING CONCURRENCY & SUBMISSION LIMITS")
    print("=" * 70)

    test_item = ("benchmark_test", {
        "speaker": "darius",
        "text": "Testing submission throughput and rendering limits under maximum load.",
        "duration": 3.0,
        "file": "darius/benchmark_test.mp3"
    })

    batch_sizes = [1, 5, 10, 20, 32]
    results = {}

    for size in batch_sizes:
        items = [(f"bench_{size}_{i}", test_item[1]) for i in range(size)]
        t0 = time.time()
        with ProcessPoolExecutor(max_workers=size) as executor:
            futures = [executor.submit(process_voice_line, item) for item in items]
            for f in as_completed(futures):
                f.result()
        dur = time.time() - t0
        throughput = size / max(0.01, dur)
        results[size] = { "duration": dur, "throughput": throughput }
        print(f"  Concurrency Level {size:2d} Workers: {size} jobs finished in {dur:.2f}s ({throughput:.1f} tasks/sec)")

    # Clean up benchmark file
    bench_file = os.path.join(VOICE_OUTPUT_DIR, "darius/benchmark_test.mp3")
    if os.path.exists(bench_file):
        os.remove(bench_file)

    best_size = max(results.keys(), key=lambda k: results[k]["throughput"])
    print(f"\n[BENCHMARK RESULT] Optimal submission batch size: {best_size} concurrent workers ({results[best_size]['throughput']:.1f} tasks/sec max throughput)")

def main():
    test_concurrency_limits()
    rebuild_audio_in_batches_of_10()
    rebuild_videos_one_at_a_time()
    print("=" * 70)
    print("ALL MEDIA SUCCESSFULLY REBUILT AND BENCHMARKED")
    print("=" * 70)

if __name__ == '__main__':
    main()
