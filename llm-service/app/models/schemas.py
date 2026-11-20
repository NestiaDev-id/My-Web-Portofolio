from pydantic import BaseModel

from app.utils.config import DEFAULT_TOP_K


class ChatRequest(BaseModel):
    """Body for POST /chat."""
    question: str
    session_id: str = "default"
    top_k: int = DEFAULT_TOP_K
    history: list[dict] = []


class ClearRequest(BaseModel):
    """Body for POST /clear."""
    session_id: str = "default"


class UploadResponse(BaseModel):
    status: str
    filename: str
    chunks_added: int
    collection: str


class ChatResponse(BaseModel):
    answer: str
    context: list[str]


class ClearResponse(BaseModel):
    status: str
    cleared: bool
    collection: str


class ChatVisionResponse(BaseModel):
    answer: str
    filename: str
