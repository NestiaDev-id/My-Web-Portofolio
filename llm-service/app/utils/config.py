"""
Centralized configuration loaded from environment variables.
"""

import os

# ── Internal Gateway Authentication ─────────────────────
INTERNAL_API_SECRET = os.getenv("INTERNAL_API_SECRET", "")

# ── Groq Models ──────────────────────────────────────────
GROQ_CHAT_MODEL = os.getenv("GROQ_CHAT_MODEL", "llama-3.1-8b-instant")
GROQ_VISION_MODEL = os.getenv("GROQ_VISION_MODEL", "llama-3.2-11b-vision-preview")

# ── ChromaDB (ephemeral vector store) ────────────────────
CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")

# ── Embedding model ──────────────────────────────────────
EMBED_MODEL = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

# ── Text chunking defaults ───────────────────────────────
DEFAULT_CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
DEFAULT_CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))

# ── Retrieval defaults ───────────────────────────────────
DEFAULT_TOP_K = int(os.getenv("TOP_K", "3"))

# ── RAG data source (static CV) ───────────────────────────
RAG_COLLECTION_ID = os.getenv("RAG_COLLECTION_ID", "nestia")
CV_PATH = os.getenv("CV_PATH", "data/cv_nestia.txt")

# ── VTuber TTS engine configuration ─────────────────────
VTUBER_TTS_PRIMARY = os.getenv("VTUBER_TTS_PRIMARY", "pocket-tts-id")
VTUBER_TTS_FALLBACK = os.getenv("VTUBER_TTS_FALLBACK", "edge-tts")
POCKET_TTS_CONFIG = os.getenv(
    "POCKET_TTS_CONFIG",
    "hf://anak10thn/pocket-tts-indonesian/indonesian_6l.yaml@17257664e384561c957b02ac92edd1a24807f0e5",
)
CHATTERBOX_NANO_DEVICE = os.getenv("CHATTERBOX_NANO_DEVICE", "cpu")
TTS_BENCHMARK_MODE = os.getenv("TTS_BENCHMARK_MODE", "false").lower() in ("1", "true", "yes")
