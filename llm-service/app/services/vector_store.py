"""
ChromaDB vector-store service.

Handles collection management, document ingestion, and similarity search.
"""

import os
import uuid

import chromadb
from langchain_community.embeddings import HuggingFaceEmbeddings

from app.utils.config import CHROMA_PATH, EMBED_MODEL

# ── Initialise once at import ────────────────────────────
os.makedirs(CHROMA_PATH, exist_ok=True)
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
embeddings = HuggingFaceEmbeddings(model_name=EMBED_MODEL)


def normalize_session_id(session_id: str) -> str:
    """Sanitise a session ID so it's safe as a ChromaDB collection name."""
    safe = "".join(
        ch for ch in session_id.lower() if ch.isalnum() or ch in ("-", "_")
    )
    return safe or "default"


def get_collection(session_id: str):
    """Return (or create) a ChromaDB collection scoped to a session."""
    name = f"chat_{normalize_session_id(session_id)}"
    return chroma_client.get_or_create_collection(
        name=name, metadata={"hnsw:space": "cosine"}
    )


def ingest_chunks(session_id: str, chunks: list[str], source: str) -> int:
    """Embed text chunks and add them to the session's collection.

    Returns the number of chunks stored.
    """
    collection = get_collection(session_id)
    vectors = embeddings.embed_documents(chunks)
    ids = [f"{normalize_session_id(session_id)}-{uuid.uuid4()}" for _ in chunks]
    metadatas = [{"source": source}] * len(chunks)
    collection.add(
        documents=chunks, embeddings=vectors, ids=ids, metadatas=metadatas
    )
    return len(chunks)


def search(session_id: str, query: str, top_k: int = 3) -> list[str]:
    """Return the *top_k* most relevant document chunks for *query*."""
    collection = get_collection(session_id)
    if collection.count() == 0:
        return []

    query_embedding = embeddings.embed_query(query)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )
    return results.get("documents", [[]])[0]


def clear(session_id: str) -> bool:
    """Delete the collection for *session_id*. Returns True if it existed."""
    name = f"chat_{normalize_session_id(session_id)}"
    existing = {col.name for col in chroma_client.list_collections()}
    if name not in existing:
        return False
    chroma_client.delete_collection(name)
    return True
