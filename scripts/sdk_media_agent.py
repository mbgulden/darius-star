#!/usr/bin/env python3
"""
scripts/sdk_media_agent.py — Programmatic Antigravity Media Agent Dispatcher (Option A)
Spawns an Antigravity agent via the Python SDK or runtime daemon to execute
Google Lyria (voice), Google Veo (video), and Google Omni (motion portraits) tasks.
"""

import os
import sys
import json
import argparse
import subprocess
import asyncio

# Attempt to import Antigravity Python SDK if installed
try:
    from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig
    HAS_SDK = True
except ImportError:
    HAS_SDK = False

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AGY_BIN = os.path.expanduser("~/.local/bin/agy-bin")

async def run_via_python_sdk(task_type, prompt, output_path):
    config = LocalAgentConfig(
        system_instructions=(
            "You are the Antigravity Media Agent. Your task is to generate the requested "
            "media asset (voice, video, or portrait) and save the binary output to the destination path."
        ),
        capabilities=CapabilitiesConfig(allow_write_tools=True)
    )
    async with Agent(config) as agent:
        full_prompt = f"Action: Generate {task_type}.\nPrompt: {prompt}\nTarget Output Path: {output_path}"
        response = await agent.chat(full_prompt)
        async for token in response:
            print(token, end="", flush=True)
        print(f"\n[OK] SDK generation completed: {output_path}")

def run_via_daemon_cli(task_type, prompt, output_path):
    if not os.path.exists(AGY_BIN):
        print(f"[ERROR] agy-bin not found at {AGY_BIN}", file=sys.stderr)
        sys.exit(1)

    full_prompt = f"Goal: Generate {task_type} for prompt '{prompt}' and save directly to {output_path}."
    cmd = [
        "script", "-qc",
        f'{AGY_BIN} --dangerously-skip-permissions --print "{full_prompt}" 2>&1',
        "/dev/null"
    ]
    subprocess.run(" ".join(cmd), shell=True, check=True)

def main():
    parser = argparse.ArgumentParser(description="Antigravity SDK Media Agent Dispatcher (Option A)")
    parser.add_argument("--type", choices=["voice", "video", "portrait"], required=True, help="Media asset type")
    parser.add_argument("--prompt", help="Generation prompt")
    parser.add_argument("--text", help="Voice dialogue text (for voice tasks)")
    parser.add_argument("--speaker", default="darius", help="Speaker name (for voice tasks)")
    parser.add_argument("--character", default="Lyra", help="Character name (for portrait tasks)")
    parser.add_argument("--mood", default="neutral", help="Mood (for portrait tasks)")
    parser.add_argument("--output", required=True, help="Target output file path")
    args = parser.parse_args()

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)

    if args.type == "voice":
        p = f"Speaker: {args.speaker} | Text: '{args.text or args.prompt}'"
    elif args.type == "portrait":
        p = f"Character: {args.character} | Mood: {args.mood}"
    else:
        p = args.prompt or "Cinematic Boss Encounter Video"

    print(f"[Antigravity Media Agent] Dispatching {args.type} generation task...")
    if HAS_SDK:
        asyncio.run(run_via_python_sdk(args.type, p, args.output))
    else:
        run_via_daemon_cli(args.type, p, args.output)

if __name__ == "__main__":
    main()
