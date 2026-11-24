import asyncio
import base64
import logging
import os
import tempfile
from pathlib import Path
from typing import Optional

from app.models.vtuber import AudioChunkEvent, DialogSegment

logger = logging.getLogger("vtuber.tts_router")

# Voice profiles mapping per language (Blueprint Section 2 & 4)
VOICE_MAP = {
    "id": "id-ID-GadisNeural",
    "ja": "ja-JP-NanamiNeural",
    "en": "en-US-AvaNeural",
}

# Pitch and rate tweaks to align character tone
VOICE_PARAMS = {
    "id": {"rate": "+5%", "pitch": "+8Hz"},
    "ja": {"rate": "+4%", "pitch": "+6Hz"},
    "en": {"rate": "+4%", "pitch": "+6Hz"},
}


class MultiEngineTTSRouter:
    """Manages audio synthesis routing and Live2D expression pairing."""

    def __init__(
        self,
        reference_voice_path: str = "app/data/voices/character_voice.mp3",
        omp_threads: int = 2,
    ):
        self.reference_voice_path = Path(reference_voice_path)
        self.omp_threads = omp_threads
        self._is_warm = False
        self._edge_tts_available = False
        self._pocket_tts = None
        self._pocket_state = None
        self._chatterbox_model = None

    async def warmup(self) -> None:
        """Warm up engine and test synthesis capabilities."""
        # Check reference voice
        if not self.reference_voice_path.exists():
            # Check fallback in data/voices
            alt_path = Path("data/voices/character_voice.wav")
            if alt_path.exists():
                self.reference_voice_path = alt_path

        # Test edge-tts import
        try:
            import edge_tts  # noqa: F401
            self._edge_tts_available = True
            logger.info("Edge-TTS engine detected and ready.")
        except ImportError:
            self._edge_tts_available = False
            logger.warning(
                "edge-tts package is not installed; will operate in resilient timeline mode (silent events)."
            )

        self._is_warm = True
        logger.info(
            f"MultiEngineTTSRouter initialized. Ref voice: {self.reference_voice_path} (exists={self.reference_voice_path.exists()})"
        )

    async def shutdown(self) -> None:
        """Clean up resources on server shutdown."""
        self._pocket_tts = None
        self._pocket_state = None
        self._chatterbox_model = None
        self._is_warm = False
        logger.info("MultiEngineTTSRouter shut down.")

    def _load_pocket_tts(self):
        if self._pocket_tts is not None:
            return self._pocket_tts

        try:
            from pocket_tts import TTSModel

            config_url = os.getenv(
                "POCKET_TTS_CONFIG",
                "hf://anak10thn/pocket-tts-indonesian/indonesian_6l.yaml@17257664e384561c957b02ac92edd1a24807f0e5",
            )
            self._pocket_tts = TTSModel.load_model(config=config_url)
            logger.info("Pocket-TTS Indonesian 6-layer loaded.")
        except Exception as exc:
            logger.warning("Pocket-TTS Indonesian unavailable: %s", exc)
            self._pocket_tts = None
        return self._pocket_tts

    def _load_chatterbox_nano(self):
        if self._chatterbox_model is not None:
            return self._chatterbox_model

        try:
            from chatterbox.tts_turbo import ChatterboxTurboTTS

            device = os.getenv("CHATTERBOX_NANO_DEVICE", "cpu")
            self._chatterbox_model = ChatterboxTurboTTS.from_pretrained(
                device=device,
                nano=True,
            )
            logger.info("Chatterbox-Nano loaded on %s.", device)
        except Exception as exc:
            logger.warning("Chatterbox-Nano unavailable: %s", exc)
            self._chatterbox_model = None
        return self._chatterbox_model

    async def benchmark_engine(
        self,
        text: str,
        engine: str,
        lang: str = "id",
    ) -> dict:
        """Synthesize one benchmark sample and report real latency/audio metadata."""
        import time

        started = time.perf_counter()
        text = text.strip()
        if not text:
            return {"engine": engine, "text": "", "duration_ms": 0, "synthesis_ms": 0, "error": "Text is empty."}

        try:
            if engine == "pocket-tts-id":
                model = self._load_pocket_tts()
                if model is None:
                    raise RuntimeError("Pocket-TTS Indonesian package/model is unavailable.")

                if self._pocket_state is None:
                    reference = str(self.reference_voice_path)
                    if not self.reference_voice_path.exists():
                        reference = "hf://anak10thn/pocket-tts-indonesian"
                    self._pocket_state = model.get_state_for_audio_prompt(reference)

                audio = model.generate_audio(self._pocket_state, text)
                sample_rate = int(getattr(model, "sample_rate", 24000))

                import numpy as np
                import soundfile as sf

                pcm = audio.detach().cpu().numpy() if hasattr(audio, "detach") else np.asarray(audio)
                buffer = tempfile.SpooledTemporaryFile(suffix=".wav", mode="w+b")
                sf.write(buffer, pcm, sample_rate, format="WAV")
                buffer.seek(0)
                wav_bytes = buffer.read()
                buffer.close()
                duration_ms = max(1, int(len(pcm) / sample_rate * 1000))

                return {
                    "engine": engine,
                    "text": text,
                    "duration_ms": duration_ms,
                    "synthesis_ms": int((time.perf_counter() - started) * 1000),
                    "sample_rate": sample_rate,
                    "audio_base64": base64.b64encode(wav_bytes).decode("ascii"),
                    "error": None,
                }

            if engine == "chatterbox-nano":
                model = self._load_chatterbox_nano()
                if model is None:
                    raise RuntimeError("Chatterbox-Nano package/model is unavailable.")

                wav = model.generate(text)
                sample_rate = int(getattr(model, "sr", 24000))

                import io
                import torchaudio

                buffer = io.BytesIO()
                torchaudio.save(buffer, wav, sample_rate, format="wav")
                wav_bytes = buffer.getvalue()
                duration_ms = max(1, int(wav.shape[-1] / sample_rate * 1000))

                return {
                    "engine": engine,
                    "text": text,
                    "duration_ms": duration_ms,
                    "synthesis_ms": int((time.perf_counter() - started) * 1000),
                    "sample_rate": sample_rate,
                    "audio_base64": base64.b64encode(wav_bytes).decode("ascii"),
                    "error": None,
                }

            if engine == "edge-tts":
                if not self._edge_tts_available:
                    raise RuntimeError("edge-tts package is unavailable.")

                import edge_tts

                voice = VOICE_MAP.get(lang, "id-ID-GadisNeural")
                params = VOICE_PARAMS.get(lang, {"rate": "+0%", "pitch": "+0Hz"})
                communicate = edge_tts.Communicate(text=text, voice=voice, rate=params["rate"], pitch=params["pitch"])
                audio_buffer = bytearray()
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        audio_buffer.extend(chunk["data"])

                return {
                    "engine": engine,
                    "text": text,
                    "duration_ms": max(400, int(len(audio_buffer) / 6.0)),
                    "synthesis_ms": int((time.perf_counter() - started) * 1000),
                    "sample_rate": None,
                    "audio_base64": base64.b64encode(audio_buffer).decode("ascii") if audio_buffer else None,
                    "error": None if audio_buffer else "Edge-TTS returned no audio.",
                }

            raise ValueError(f"Unknown TTS engine: {engine}")
        except Exception as exc:
            logger.exception("TTS benchmark failed for engine=%s", engine)
            return {
                "engine": engine,
                "text": text,
                "duration_ms": 0,
                "synthesis_ms": int((time.perf_counter() - started) * 1000),
                "sample_rate": None,
                "audio_base64": None,
                "error": str(exc),
            }

    async def synthesize_segment(
        self,
        seq: int,
        segment: DialogSegment,
        engine: str = "pocket-tts-id",
    ) -> AudioChunkEvent:
        """Synthesize a single speech or paralinguistic segment into an AudioChunkEvent."""
        # 1. Paralinguistic event handling (chuckle, tease, sigh, thinking, etc.)
        if segment.type == "paralinguistic":
            # For paralinguistic events, provide exact expression metadata and duration
            # In full pipeline with Chatterbox/Seed-VC, this emits cloned audio.
            # In resilient mode, it emits the event with accurate duration for Live2D sync.
            return AudioChunkEvent(
                seq=seq,
                type="paralinguistic",
                paralinguistic_event=segment.paralinguistic_event,
                tts_token=segment.tts_token,
                sfx_asset=segment.sfx_asset,
                engine="chatterbox-nano",
                mood=segment.mood,
                emotion=segment.emotion,
                live2d_expression=segment.live2d_expression,
                duration_ms=segment.estimated_duration_ms,
                audio_base64=None,
            )

        # 2. Speech segment handling (id, ja, en)
        text = (segment.text or "").strip()
        if not text:
            return segment.to_silent_event(seq)

        lang = segment.lang or "id"
        voice = VOICE_MAP.get(lang, "id-ID-GadisNeural")
        params = VOICE_PARAMS.get(lang, {"rate": "+0%", "pitch": "+0Hz"})

        if engine == "pocket-tts-id" and lang == "id":
            model = self._load_pocket_tts()
            if model is not None:
                try:
                    if self._pocket_state is None:
                        reference = str(self.reference_voice_path)
                        if not self.reference_voice_path.exists():
                            reference = "hf://kyutai/tts-voices/alba-mackenna/casual.wav"
                        self._pocket_state = model.get_state_for_audio_prompt(reference)

                    normalized_text = segment.normalized_text or text
                    audio = model.generate_audio(self._pocket_state, normalized_text)
                    sample_rate = int(getattr(model, "sample_rate", 24000))
                    import numpy as np
                    import soundfile as sf

                    pcm = audio.detach().cpu().numpy() if hasattr(audio, "detach") else np.asarray(audio)
                    buffer = tempfile.SpooledTemporaryFile(suffix=".wav", mode="w+b")
                    sf.write(buffer, pcm, sample_rate, format="WAV")
                    buffer.seek(0)
                    wav_bytes = buffer.read()
                    buffer.close()
                    duration_ms = max(400, int(len(pcm) / sample_rate * 1000))

                    return AudioChunkEvent(
                        seq=seq,
                        type="speech",
                        text=segment.text,
                        normalized_text=normalized_text,
                        lang=lang,
                        mood=segment.mood,
                        engine="pocket-tts-id",
                        emotion=segment.emotion,
                        live2d_expression=segment.live2d_expression,
                        duration_ms=duration_ms,
                        audio_base64=base64.b64encode(wav_bytes).decode("ascii"),
                    )
                except Exception as exc:
                    logger.warning("Pocket-TTS synthesis failed: %s. Falling back to Edge-TTS.", exc)

        if self._edge_tts_available:
            try:
                import edge_tts

                communicate = edge_tts.Communicate(
                    text=text,
                    voice=voice,
                    rate=params["rate"],
                    pitch=params["pitch"],
                )

                audio_buffer = bytearray()
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        audio_buffer.extend(chunk["data"])

                if audio_buffer:
                    b64_audio = base64.b64encode(audio_buffer).decode("utf-8")
                    # Approximate duration from 48kbps MP3 stream (6000 bytes/sec)
                    computed_duration = max(
                        400,
                        int(len(audio_buffer) / 6.0),  # approx ms for standard edge-tts mp3
                    )
                    return AudioChunkEvent(
                        seq=seq,
                        type="speech",
                        text=segment.text,
                        normalized_text=text,
                        lang=lang,
                        mood=segment.mood,
                        engine="edge-tts",
                        emotion=segment.emotion,
                        live2d_expression=segment.live2d_expression,
                        duration_ms=computed_duration,
                        audio_base64=b64_audio,
                    )
            except Exception as exc:
                logger.warning(
                    f"TTS synthesis error for '{text}' ({lang}): {exc}. Falling back to silent event."
                )

        # Fallback to silent event if synthesis unavailable
        return segment.to_silent_event(seq)
