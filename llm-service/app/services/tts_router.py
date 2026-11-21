import asyncio
import base64
import logging
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
        self._is_warm = False
        logger.info("MultiEngineTTSRouter shut down.")

    async def synthesize_segment(self, seq: int, segment: DialogSegment) -> AudioChunkEvent:
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
                engine="chatterbox-nano",
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
                        text=text,
                        lang=lang,
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
