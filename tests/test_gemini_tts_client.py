#!/usr/bin/env python3
"""Unit tests for tools/gemini_tts_client.py that do not call Gemini."""

from __future__ import annotations

import base64
import importlib.util
import sys
import tempfile
import unittest
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLIENT_PATH = ROOT / "tools" / "gemini_tts_client.py"
spec = importlib.util.spec_from_file_location("gemini_tts_client", CLIENT_PATH)
assert spec is not None and spec.loader is not None
gemini_tts_client = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = gemini_tts_client
spec.loader.exec_module(gemini_tts_client)


class GeminiTtsClientTests(unittest.TestCase):
    def test_character_voice_mapping_and_payload(self) -> None:
        voice = gemini_tts_client.resolve_voice("lyra", None)
        self.assertEqual(voice, "Leda")
        req = gemini_tts_client.TtsRequest(
            text="Daddy, the Abyss is listening.",
            character="lyra",
            voice=voice,
            emotion="fearful",
        )
        payload = gemini_tts_client.build_payload(req)
        text = payload["contents"][0]["parts"][0]["text"]
        self.assertIn("Character: lyra", text)
        self.assertIn("fear held in check", text)
        self.assertEqual(
            payload["generationConfig"]["speechConfig"]["voiceConfig"]["prebuiltVoiceConfig"]["voiceName"],
            "Leda",
        )
        self.assertEqual(payload["generationConfig"]["responseModalities"], ["AUDIO"])

    def test_extract_inline_audio(self) -> None:
        raw = b"\x01\x02\x03\x04"
        data = {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {
                                "inlineData": {
                                    "mimeType": "audio/L16;codec=pcm;rate=24000",
                                    "data": base64.b64encode(raw).decode("ascii"),
                                }
                            }
                        ]
                    }
                }
            ]
        }
        audio, mime = gemini_tts_client.extract_audio(data)
        self.assertEqual(audio, raw)
        self.assertIn("rate=24000", mime)

    def test_write_pcm_as_wav(self) -> None:
        pcm = b"\x00\x00\xff\x7f" * 4
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "line.wav"
            gemini_tts_client.write_audio(pcm, "audio/L16;codec=pcm;rate=24000", out)
            self.assertTrue(out.exists())
            with wave.open(str(out), "rb") as wav:
                self.assertEqual(wav.getnchannels(), 1)
                self.assertEqual(wav.getsampwidth(), 2)
                self.assertEqual(wav.getframerate(), 24000)
                self.assertEqual(wav.readframes(8), pcm)

    def test_no_audio_raises(self) -> None:
        with self.assertRaises(gemini_tts_client.GeminiTtsError):
            gemini_tts_client.extract_audio({"candidates": [{"content": {"parts": [{"text": "nope"}]}}]})


if __name__ == "__main__":
    unittest.main()
