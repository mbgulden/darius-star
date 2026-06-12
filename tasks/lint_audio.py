#!/usr/bin/env python3
"""
lint_audio.py — Validate Darius Star audio manifest against files on disk.

Cross-references audio_manifest.json entries with assets/audio/*.mp3 files.
Checks MP3 file validity via ID3/frame sync signatures.
Reports: missing tracks, orphan files, size mismatches, invalid files.

Usage:
    python3 tasks/lint_audio.py              # Check only
    python3 tasks/lint_audio.py --verbose    # Show per-file details
    python3 tasks/lint_audio.py --fix        # Update manifest to match disk
"""

import json
import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
MANIFEST_PATH = REPO_ROOT / "assets" / "audio" / "audio_manifest.json"
AUDIO_DIR = REPO_ROOT / "assets" / "audio"

# Minimum valid MP3 size (header + silence frame)
MIN_MP3_SIZE = 100


def is_valid_mp3(filepath: Path) -> tuple[bool, str]:
    """Check if file is a valid MP3 by looking for frame sync (0xFF 0xFB/0xFA/0xF3/0xF2)."""
    try:
        size = filepath.stat().st_size
        if size < MIN_MP3_SIZE:
            return False, f"File too small ({size} bytes, min {MIN_MP3_SIZE})"
        with open(filepath, "rb") as f:
            header = f.read(4)
        if len(header) < 4:
            return False, "File too short to read header"
        # MP3 frame sync: 0xFF followed by 0xE0-0xFF (check top 3 bits of byte 2)
        if header[0] == 0xFF and (header[1] & 0xE0) == 0xE0:
            return True, f"Valid MP3 ({size:,} bytes)"
        # Check for ID3v2 tag at start (0x49 0x44 0x33 = "ID3")
        if header[0:3] == b"ID3":
            # ID3v2 header present; seek past it and check first frame
            with open(filepath, "rb") as f:
                f.seek(6)  # Skip ID3 magic + version
                size_bytes = f.read(4)
                tag_size = (
                    (size_bytes[0] << 21)
                    | (size_bytes[1] << 14)
                    | (size_bytes[2] << 7)
                    | size_bytes[3]
                )
                f.seek(10 + tag_size)  # Skip to first frame
                frame_header = f.read(4)
            if len(frame_header) >= 2 and frame_header[0] == 0xFF and (frame_header[1] & 0xE0) == 0xE0:
                return True, f"Valid MP3 with ID3v2 tag ({size:,} bytes)"
            return False, "ID3v2 tag found but no valid MP3 frame follows"
        return False, f"Not a valid MP3 (magic bytes: {header.hex()})"
    except OSError as e:
        return False, f"Read error: {e}"


def load_manifest() -> dict:
    """Load and return the audio manifest."""
    with open(MANIFEST_PATH, "r") as f:
        return json.load(f)


def scan_disk() -> dict[str, Path]:
    """Scan assets/audio/ for all MP3 and WAV files, return {filename: full_path}."""
    files = {}
    for ext in ("*.mp3", "*.wav", "*.MP3", "*.WAV"):
        for fp in AUDIO_DIR.glob(ext):
            if fp.is_file():
                files[fp.name] = fp
    return files


def lint(verbose: bool = False) -> dict:
    """Run lint checks. Returns results dict."""
    manifest = load_manifest()
    disk_files = scan_disk()

    tracks = manifest.get("tracks", {})
    manifest_files = set()
    for track_id, track in tracks.items():
        fname = track.get("file", "")
        if fname:
            manifest_files.add(fname)

    results = {
        "manifest_version": manifest.get("version"),
        "manifest_tracks": len(tracks),
        "disk_files": len(disk_files),
        "missing": [],       # In manifest but not on disk
        "orphans": [],       # On disk but not in manifest
        "invalid": [],       # On disk but not valid MP3/WAV
        "size_mismatches": [],  # On disk but size differs from manifest
        "matched": 0,
    }

    # Check manifest entries against disk
    for track_id, track in tracks.items():
        fname = track.get("file", "")
        if not fname:
            results["missing"].append(f"{track_id}: no file field")
            continue
        if fname not in disk_files:
            results["missing"].append(f"{track_id}: {fname} not found on disk")
            continue

        fp = disk_files[fname]
        valid, msg = is_valid_mp3(fp)
        if not valid:
            results["invalid"].append(f"{track_id}: {fname} — {msg}")
            continue

        disk_size = fp.stat().st_size
        manifest_size = track.get("size_bytes", 0)
        if manifest_size and manifest_size != disk_size:
            results["size_mismatches"].append(
                f"{track_id}: {fname} — manifest={manifest_size:,} disk={disk_size:,}"
            )
            continue

        results["matched"] += 1
        if verbose:
            print(f"  ✅ {track_id}: {fname} — {msg}")

    # Check for orphan files (on disk but not in manifest)
    for fname in sorted(disk_files):
        if fname not in manifest_files:
            fp = disk_files[fname]
            valid, msg = is_valid_mp3(fp) if fname.lower().endswith((".mp3", ".wav")) else (True, "unknown format")
            results["orphans"].append(
                f"{fname} ({fp.stat().st_size:,} bytes)" + (f" — {msg}" if not valid else "")
            )

    return results


def fix_manifest(results: dict) -> None:
    """Update manifest: add orphans, update sizes, set 'generated' for existing files."""
    manifest = load_manifest()
    disk_files = scan_disk()
    tracks = manifest.setdefault("tracks", {})

    # Collect manifest filenames
    manifest_filenames = {t.get("file", ""): tid for tid, t in tracks.items()}

    # Update existing tracks: set generated=True + correct size if file exists
    for track_id, track in tracks.items():
        fname = track.get("file", "")
        if fname and fname in disk_files:
            track["generated"] = True
            track["size_bytes"] = disk_files[fname].stat().st_size

    # Add orphan files as new tracks
    for fname, fp in sorted(disk_files.items()):
        if fname not in manifest_filenames:
            track_id = fname.replace(".mp3", "").replace(".wav", "").replace(".MP3", "").replace(".WAV", "")
            # Avoid duplicate IDs
            counter = 1
            base_id = track_id
            while track_id in tracks:
                track_id = f"{base_id}_{counter}"
                counter += 1
            tracks[track_id] = {
                "scene": f"Auto-detected: {fname}",
                "file": fname,
                "path": str(AUDIO_DIR / fname),
                "duration_sec": 30,
                "loop": True,
                "generated": True,
                "size_bytes": fp.stat().st_size,
            }

    manifest["updated"] = "2026-06-12T00:00:00Z"
    with open(MANIFEST_PATH, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"✅ Manifest updated: {len(tracks)} tracks total")


def print_report(results: dict) -> int:
    """Print lint report. Returns exit code (0=clean, 1=issues found)."""
    print(f"\n{'='*60}")
    print(f"🔊 Darius Star — Audio Lint Report")
    print(f"{'='*60}")
    print(f"  Manifest version: {results['manifest_version']}")
    print(f"  Manifest tracks:  {results['manifest_tracks']}")
    print(f"  Files on disk:    {results['disk_files']}")
    print(f"  ✅ Matched:       {results['matched']}")

    issues = 0

    if results["missing"]:
        issues += len(results["missing"])
        print(f"\n  ❌ MISSING ({len(results['missing'])}):")
        for item in results["missing"]:
            print(f"     • {item}")

    if results["invalid"]:
        issues += len(results["invalid"])
        print(f"\n  ❌ INVALID ({len(results['invalid'])}):")
        for item in results["invalid"]:
            print(f"     • {item}")

    if results["size_mismatches"]:
        issues += len(results["size_mismatches"])
        print(f"\n  ⚠️  SIZE MISMATCHES ({len(results['size_mismatches'])}):")
        for item in results["size_mismatches"]:
            print(f"     • {item}")

    if results["orphans"]:
        issues += len(results["orphans"])
        print(f"\n  ℹ️  ORPHAN FILES ({len(results['orphans'])}):")
        for item in results["orphans"]:
            print(f"     • {item}")

    print(f"\n{'='*60}")
    if issues == 0:
        print("✅ All clean — manifest matches disk.")
        return 0
    else:
        print(f"⚠️  {issues} issue(s) found. Run with --fix to auto-resolve.")
        return 1


def main():
    verbose = "--verbose" in sys.argv or "-v" in sys.argv
    fix = "--fix" in sys.argv

    results = lint(verbose=verbose)

    if fix:
        fix_manifest(results)
        # Re-lint after fix
        results = lint(verbose=verbose)

    exit_code = print_report(results)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
