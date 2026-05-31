"""
Centralized configuration loaded from environment variables.
"""

import os

# ── ChromaDB (ephemeral vector store) ────────────────────
CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")

# ── Embedding model ──────────────────────────────────────
EMBED_MODEL = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

# ── LLM served via HF Inference API ─────────────────────
HF_MODEL = os.getenv("HF_MODEL", "mistralai/Mistral-7B-Instruct-v0.2")

# ── Text chunking defaults ───────────────────────────────
DEFAULT_CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
DEFAULT_CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))

# ── Retrieval defaults ───────────────────────────────────
DEFAULT_TOP_K = int(os.getenv("TOP_K", "3"))

# ── Upstash Redis (short-term chat memory) ───────────────
REDIS_URL = os.getenv("REDIS_URL", "")
REDIS_MAX_HISTORY = int(os.getenv("REDIS_MAX_HISTORY", "100"))

# ── MongoDB Atlas (permanent chat archive) ───────────────
MONGO_URI = os.getenv("MONGO_URI", "")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "llm_chat_history")
