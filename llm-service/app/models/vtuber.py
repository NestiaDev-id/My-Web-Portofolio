from typing import List, Literal, Optional
from pydantic import BaseModel, Field

class VTuberChatRequest(BaseModel):
    """Payload for POST /vtuber/chat and /vtuber/chat/stream."""
    session_id: str
    user_message: str
    history: List[dict] = Field(default_factory=list)
    persona_mode: str = "playful_mentor"
    enable_tts: bool = True


class AudioChunkEvent(BaseModel):
    """Individual audio segment event emitted in the SSE stream."""
    event: Literal["audio_chunk"] = "audio_chunk"
    seq: int
    type: Literal["speech", "paralinguistic"]
    text: Optional[str] = None
    lang: Optional[Literal["id", "ja", "en"]] = "id"
    paralinguistic_event: Optional[str] = None
    engine: Literal["pocket-tts-id", "kokoro-82m-onnx", "chatterbox-nano", "edge-tts"] = "edge-tts"
    emotion: str = "friendly"
    live2d_expression: str = "f01_smile"
    duration_ms: int = 500
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
    lang: Optional[Literal["id", "ja", "en"]] = "id"
    paralinguistic_event: Optional[str] = None
    emotion: str = "friendly"
    live2d_expression: str = "f01_smile"
    estimated_duration_ms: int = 600

    def to_silent_event(self, seq: int) -> AudioChunkEvent:
        """Create a silent chunk event with preserved timing and visual expression metadata."""
        return AudioChunkEvent(
            seq=seq,
            type=self.type,
            text=self.text,
            lang=self.lang,
            paralinguistic_event=self.paralinguistic_event,
            engine="edge-tts",
            emotion=self.emotion,
            live2d_expression=self.live2d_expression,
            duration_ms=self.estimated_duration_ms,
            audio_base64=None,
        )


class VTuberChatResponse(BaseModel):
    """Non-streaming complete response for VTuber dialog."""
    session_id: str
    raw_annotated_text: str
    total_duration_ms: int
    chunks: List[AudioChunkEvent]
