#!/usr/bin/env python3
"""
Gemini TTS client for Darius Star voice asset generation.

Uses Google Cloud / gcloud auth (no API keys) against the public Gemini API TTS
models:
  - gemini-2.5-flash-tts
  - gemini-2.5-pro-tts

Examples:
  python3 tools/gemini_tts_client.py --check-auth
  python3 tools/gemini_tts_client.py --dry-run --text "Systems hot. Let's punch through." --character naya
  python3 tools/gemini_tts_client.py --text "Daddy, the Abyss is listening." --character lyra --emotion fearful --output assets/audio/voice/lyra/test.wav

The API currently returns 24 kHz signed 16-bit PCM in an inlineData part. This
client wraps raw PCM as WAV so browser/game tooling can consume it immediately.
"""

from __future__ import annotations

import argparse
import base64
import json
import re
import subprocess
import sys
import urllib.error
import urllib.request
import wave
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

GEMINI_API_ROOT = "https://generativelanguage.googleapis.com/v1beta"
DEFAULT_MODEL = "gemini-2.5-flash-tts"
PRO_MODEL = "gemini-2.5-pro-tts"
DEFAULT_SAMPLE_RATE = 24000

# Gemini prebuilt TTS voices. See Gemini TTS docs; all are usable with flash/pro TTS.
AVAILABLE_VOICES = [
    "Zephyr", "Puck", "Charon", "Kore", "Fenrir", "Leda", "Orus", "Aoede",
    "Callirrhoe", "Autonoe", "Enceladus", "Iapetus", "Umbriel", "Algieba",
    "Despina", "Erinome", "Algenib", "Rasalgethi", "Laomedeia", "Achernar",
    "Alnilam", "Schedar", "Gacrux", "Pulcherrima", "Achird", "Zubenelgenubi",
    "Vindemiatrix", "Sadachbia", "Sadaltager", "Sulafat",
]

# Character defaults tuned for Darius Star's found-family sci-fi radio-drama tone.
CHARACTER_VOICES = {
    "darius": {
        "voice": "Orus",
        "style": "battle-worn fatherly commander; grounded, protective, terse under fire",
    },
    "lyra": {
        "voice": "Leda",
        "style": "young, vulnerable, luminous, emotionally honest; wonder mixed with fear",
    },
    "naya": {
        "voice": "Zephyr",
        "style": "fast, bright ace pilot; playful confidence over real danger",
    },
    "cross": {
        "voice": "Kore",
        "style": "cool tactical veteran; clipped, precise, dry humor",
    },
    "thorne": {
        "voice": "Charon",
        "style": "gravelly old spacer; scarred, loyal, fatalistic warmth",
    },
    "ophion": {
        "voice": "Enceladus",
        "style": "ancient alien intelligence; calm, resonant, oceanic, nonhuman patience",
    },
    "selene": {
        "voice": "Aoede",
        "style": "maternal admiral-scientist; composed, warm, steel underneath",
    },
    "architect": {
        "voice": "Fenrir",
        "style": "vast abyssal machine-god; slow, threatening, layered dread",
    },
    "crane": {
        "voice": "Rasalgethi",
        "style": "authoritarian admiral; cold, controlled, righteous menace",
    },
    "computer": {
        "voice": "Alnilam",
        "style": "clear ship-computer readout; neutral, urgent when needed",
    },
}

EMOTION_HINTS = {
    "neutral": "natural performance, no exaggerated affect",
    "urgent": "urgent radio-comms delivery, compressed timing, controlled stress",
    "fearful": "fear held in check, breath tight, trying to stay brave",
    "angry": "controlled anger, sharp consonants, intensity without shouting",
    "tender": "soft, intimate, emotionally close, protective warmth",
    "awed": "hushed awe, vast scale, wonder with slight trembling",
    "triumphant": "victorious but battle-weary, bright lift at the end",
    "despair": "low, exhausted, almost breaking but still intelligible",
    "alien": "uncanny cadence, ancient and otherworldly, slightly ceremonial",
}


class GeminiTtsError(RuntimeError):
    """Raised when auth, API, or response parsing fails."""


@dataclass(frozen=True)
class TtsRequest:
    text: str
    model: str = DEFAULT_MODEL
    voice: str = "Kore"
    character: str | None = None
    style: str | None = None
    emotion: str = "neutral"
    output: Path | None = None
    sample_rate: int = DEFAULT_SAMPLE_RATE


def run_gcloud(args: list[str]) -> str:
    try:
        result = subprocess.run(
            ["gcloud", *args],
            check=False,
            capture_output=True,
            text=True,
            timeout=30,
        )
    except FileNotFoundError as exc:
        raise GeminiTtsError("gcloud CLI is not installed or not on PATH") from exc
    except subprocess.TimeoutExpired as exc:
        raise GeminiTtsError("gcloud command timed out") from exc

    if result.returncode != 0:
        stderr = result.stderr.strip() or result.stdout.strip()
        raise GeminiTtsError(f"gcloud {' '.join(args)} failed: {stderr}")
    return result.stdout.strip()


def get_access_token() -> str:
    """Return an ADC access token with Gemini-compatible scopes."""
    # application-default is the desired path for generativelanguage. Fall back to
    # user auth print-access-token because some CI shells only have that configured.
    errors: list[str] = []
    for args in (["auth", "application-default", "print-access-token"], ["auth", "print-access-token"]):
        try:
            token = run_gcloud(args)
            if token:
                return token
        except GeminiTtsError as exc:
            errors.append(str(exc))
    raise GeminiTtsError(
        "Unable to obtain a gcloud access token. Run: "
        "gcloud auth application-default login --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/generative-language\n"
        + "\n".join(errors)
    )


def check_auth() -> dict[str, Any]:
    token = get_access_token()
    req = urllib.request.Request(
        f"{GEMINI_API_ROOT}/models",
        headers={"Authorization": f"Bearer {token}"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise GeminiTtsError(f"Gemini auth check failed ({exc.code}): {body}") from exc
    except urllib.error.URLError as exc:
        raise GeminiTtsError(f"Gemini auth check failed: {exc}") from exc

    models = [m.get("name", "") for m in data.get("models", [])]
    tts_models = [m for m in models if "tts" in m.lower()]
    return {"ok": True, "tts_models": tts_models, "model_count": len(models)}


def normalize_character(name: str | None) -> str | None:
    if not name:
        return None
    return re.sub(r"[^a-z0-9_]+", "_", name.strip().lower()).strip("_")


def resolve_voice(character: str | None, voice: str | None) -> str:
    if voice:
        return voice
    key = normalize_character(character)
    if key and key in CHARACTER_VOICES:
        return CHARACTER_VOICES[key]["voice"]
    return "Kore"


def build_direction(req: TtsRequest) -> str:
    character_key = normalize_character(req.character)
    parts: list[str] = []
    if character_key and character_key in CHARACTER_VOICES:
        parts.append(f"Character: {character_key}. {CHARACTER_VOICES[character_key]['style']}.")
    elif req.character:
        parts.append(f"Character: {req.character}.")
    if req.style:
        parts.append(f"Performance style: {req.style}.")
    emotion = EMOTION_HINTS.get(req.emotion.lower(), req.emotion)
    if emotion:
        parts.append(f"Emotion: {emotion}.")
    parts.append("Deliver as cinematic sci-fi radio comms: clear, game-ready, no stage directions spoken.")
    return " ".join(parts)


def build_payload(req: TtsRequest) -> dict[str, Any]:
    direction = build_direction(req)
    return {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": f"{direction}\n\nSpeak this exact line:\n{req.text}"}
                ],
            }
        ],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {
                        "voiceName": req.voice,
                    }
                }
            },
        },
    }


def call_gemini_tts(req: TtsRequest) -> tuple[bytes, str]:
    token = get_access_token()
    payload = build_payload(req)
    body = json.dumps(payload).encode("utf-8")
    api_req = urllib.request.Request(
        f"{GEMINI_API_ROOT}/models/{req.model}:generateContent",
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(api_req, timeout=120) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body_text = exc.read().decode("utf-8", errors="replace")
        raise GeminiTtsError(f"Gemini TTS failed ({exc.code}): {body_text}") from exc
    except urllib.error.URLError as exc:
        raise GeminiTtsError(f"Gemini TTS request failed: {exc}") from exc

    return extract_audio(data)


def iter_parts(data: dict[str, Any]) -> Iterable[dict[str, Any]]:
    for candidate in data.get("candidates", []):
        content = candidate.get("content", {})
        for part in content.get("parts", []):
            yield part


def extract_audio(data: dict[str, Any]) -> tuple[bytes, str]:
    for part in iter_parts(data):
        inline = part.get("inlineData") or part.get("inline_data")
        if inline and inline.get("data"):
            mime = inline.get("mimeType") or inline.get("mime_type") or "audio/L16;codec=pcm;rate=24000"
            return base64.b64decode(inline["data"]), mime
    raise GeminiTtsError(f"No inline audio found in Gemini response: {json.dumps(data)[:1000]}")


def mime_sample_rate(mime: str, default: int = DEFAULT_SAMPLE_RATE) -> int:
    match = re.search(r"rate=(\d+)", mime or "")
    return int(match.group(1)) if match else default


def write_audio(audio: bytes, mime: str, output: Path, sample_rate: int = DEFAULT_SAMPLE_RATE) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    lower = (mime or "").lower()
    if "wav" in lower or output.suffix.lower() == ".raw":
        output.write_bytes(audio)
        return

    # Gemini TTS returns signed 16-bit little-endian PCM. Wrap it as mono WAV.
    rate = mime_sample_rate(mime, sample_rate)
    with wave.open(str(output), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(rate)
        wav.writeframes(audio)


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate Darius Star voice lines with Gemini TTS via gcloud auth.")
    parser.add_argument("--text", help="Exact line to synthesize")
    parser.add_argument("--text-file", type=Path, help="Read exact line text from a file")
    parser.add_argument("--output", type=Path, help="Output WAV path")
    parser.add_argument("--model", default=DEFAULT_MODEL, choices=[DEFAULT_MODEL, PRO_MODEL])
    parser.add_argument("--character", help="Character key, e.g. darius, lyra, naya, architect")
    parser.add_argument("--voice", choices=AVAILABLE_VOICES, help="Override Gemini prebuilt voice")
    parser.add_argument("--style", help="Extra performance/style direction")
    parser.add_argument("--emotion", default="neutral", help=f"Emotion hint. Known: {', '.join(sorted(EMOTION_HINTS))}")
    parser.add_argument("--check-auth", action="store_true", help="Verify gcloud auth and list TTS models; does not synthesize")
    parser.add_argument("--dry-run", action="store_true", help="Print payload only; does not call Gemini")
    parser.add_argument("--list-voices", action="store_true", help="Print built-in character and Gemini voice mappings")
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)

    if args.list_voices:
        print(json.dumps({"character_voices": CHARACTER_VOICES, "available_voices": AVAILABLE_VOICES}, indent=2))
        return 0

    if args.check_auth:
        print(json.dumps(check_auth(), indent=2))
        return 0

    text = args.text
    if args.text_file:
        text = args.text_file.read_text(encoding="utf-8").strip()
    if not text:
        raise GeminiTtsError("Provide --text or --text-file, or use --check-auth/--list-voices")

    character = normalize_character(args.character)
    voice = resolve_voice(character, args.voice)
    req = TtsRequest(
        text=text,
        model=args.model,
        voice=voice,
        character=character,
        style=args.style,
        emotion=args.emotion,
        output=args.output,
    )

    if args.dry_run:
        print(json.dumps({"model": req.model, "voice": req.voice, "payload": build_payload(req)}, indent=2))
        return 0

    if not req.output:
        raise GeminiTtsError("Provide --output for real synthesis")
    audio, mime = call_gemini_tts(req)
    write_audio(audio, mime, req.output, req.sample_rate)
    print(json.dumps({"ok": True, "output": str(req.output), "mime": mime, "bytes": len(audio)}, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv[1:]))
    except GeminiTtsError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
