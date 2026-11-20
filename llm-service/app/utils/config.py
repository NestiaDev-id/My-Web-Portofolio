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
