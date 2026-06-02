"""
Centralized configuration loaded from environment variables.
"""

import os

# ── ChromaDB (ephemeral vector store) ────────────────────
CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")

# ── Embedding model ──────────────────────────────────────
EMBED_MODEL = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

# ── LLM served via HF Inference API ─────────────────────
HF_MODEL = "Qwen/Qwen2.5-72B-Instruct" # Hardcode to prevent Spaces env var override

# ── Text chunking defaults ───────────────────────────────
DEFAULT_CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
DEFAULT_CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))

# ── Retrieval defaults ───────────────────────────────────
DEFAULT_TOP_K = int(os.getenv("TOP_K", "3"))

# ── RAG data source (static CV) ───────────────────────────
RAG_COLLECTION_ID = os.getenv("RAG_COLLECTION_ID", "nestia")
CV_PATH = os.getenv("CV_PATH", "data/cv_nestia.txt")

# ── Upload protection ─────────────────────────────────────
UPLOAD_TOKEN = os.getenv("UPLOAD_TOKEN", "")

# ── Upstash Redis (short-term chat memory) ───────────────
REDIS_URL = os.getenv("REDIS_URL", "")
REDIS_MAX_HISTORY = int(os.getenv("REDIS_MAX_HISTORY", "100"))

# ── MongoDB Atlas (permanent chat archive) ───────────────
MONGO_URI = os.getenv("MONGO_URI", "")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "llm_chat_history")
