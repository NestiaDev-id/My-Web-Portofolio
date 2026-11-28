from typing import List, Literal, Optional
from pydantic import BaseModel, Field

class VTuberChatRequest(BaseModel):
    """Payload for POST /vtuber/chat and /vtuber/chat/stream."""
    session_id: str
    user_message: str
    history: List[dict] = Field(default_factory=list)
    persona_mode: str = "playful_mentor"
    enable_tts: bool = True
    tts_engine: Literal["pocket-tts-id", "edge-tts", "chatterbox-nano"] = "pocket-tts-id"


class AudioChunkEvent(BaseModel):
    """Individual audio segment event emitted in the SSE stream."""
    event: Literal["audio_chunk"] = "audio_chunk"
    seq: int
    type: Literal["speech", "paralinguistic"]
    text: Optional[str] = None
    normalized_text: Optional[str] = None
    lang: Optional[Literal["id", "ja", "en"]] = "id"
    mood: str = "warm"
    paralinguistic_event: Optional[str] = None
    tts_token: Optional[str] = None
    sfx_asset: Optional[str] = None
    engine: Literal["pocket-tts-id", "kokoro-82m-onnx", "chatterbox-nano", "edge-tts"] = "edge-tts"
    emotion: str = "friendly"
    live2d_expression: str = "f01_smile"
    duration_ms: int = 500
    start_ms: int = 0
    end_ms: int = 500
    audio_base64: Optional[str] = None


class ScriptReadyEvent(BaseModel):
    """Initial event emitted as soon as the LLM finishes drafting the director script."""
    event: Literal["script_ready"] = "script_ready"
    session_id: str
    raw_annotated_text: str
    total_segments: int


class StreamEndEvent(BaseModel):
    """Final event emitted when all audio chunks in the sequence have completed."""
    event: Literal["stream_end"] = "stream_end"
    session_id: str
    total_duration_ms: int


class DialogSegment(BaseModel):
    """Internal parsed representation of a single speech or paralinguistic unit."""
    type: Literal["speech", "paralinguistic"]
    text: Optional[str] = None
    normalized_text: Optional[str] = None
    lang: Optional[Literal["id", "ja", "en"]] = "id"
    mood: str = "warm"
    paralinguistic_event: Optional[str] = None
    tts_token: Optional[str] = None
    sfx_asset: Optional[str] = None
    emotion: str = "friendly"
    live2d_expression: str = "f01_smile"
    estimated_duration_ms: int = 600

    def to_silent_event(self, seq: int, start_ms: int = 0) -> AudioChunkEvent:
        """Create a silent chunk event with preserved timing and visual expression metadata."""
        end_ms = start_ms + self.estimated_duration_ms
        return AudioChunkEvent(
            seq=seq,
            type=self.type,
            text=self.text,
            normalized_text=self.normalized_text or self.text,
            lang=self.lang,
            mood=self.mood,
            paralinguistic_event=self.paralinguistic_event,
            tts_token=self.tts_token,
            sfx_asset=self.sfx_asset,
            engine="edge-tts",
            emotion=self.emotion,
            live2d_expression=self.live2d_expression,
            duration_ms=self.estimated_duration_ms,
            start_ms=start_ms,
            end_ms=end_ms,
            audio_base64=None,
        )


class VTuberChatResponse(BaseModel):
    """Non-streaming complete response for VTuber dialog."""
    session_id: str
    raw_annotated_text: str
    total_duration_ms: int
    chunks: List[AudioChunkEvent]


class TTSBenchmarkRequest(BaseModel):
    text: str
    engine: Literal["edge-tts", "pocket-tts-id", "chatterbox-nano"] = "pocket-tts-id"
    lang: Literal["id", "ja", "en"] = "id"


class TTSBenchmarkResponse(BaseModel):
    engine: str
    text: str
    duration_ms: int
    synthesis_ms: int
    sample_rate: Optional[int] = None
    audio_base64: Optional[str] = None
    error: Optional[str] = None
