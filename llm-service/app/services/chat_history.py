"""
Chat history service — dual-write to Upstash Redis AND MongoDB Atlas.

Strategy
--------
- **Redis (Upstash)**: Fast short-term memory. Stores the most recent messages
  per session using a capped list (window memory). Ideal for feeding context
  back to the LLM on subsequent turns.
- **MongoDB (Atlas)**: Permanent long-term archive. Every single message is
  persisted as a document so chat logs are never lost, even if Redis evicts
  old entries.

Both writes happen on every call so the two stores stay in sync. If one
backend is unreachable the other still succeeds (best-effort).
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

import redis
from pymongo import MongoClient
from pymongo.errors import PyMongoError

from app.utils.config import (
    HF_MODEL,
    MONGO_DB_NAME,
    MONGO_URI,
    REDIS_MAX_HISTORY,
    REDIS_URL,
)

logger = logging.getLogger(__name__)

# ── Redis client ──────────────────────────────────────────
_redis: Optional[redis.Redis] = None


def _get_redis() -> redis.Redis:
    global _redis
    if _redis is None:
        _redis = redis.from_url(REDIS_URL, decode_responses=True)
    return _redis


# ── MongoDB client ────────────────────────────────────────
_mongo_db = None


def _get_mongo_db():
    global _mongo_db
    if _mongo_db is None:
        client = MongoClient(MONGO_URI)
        _mongo_db = client[MONGO_DB_NAME]
    return _mongo_db


# ── Helpers ───────────────────────────────────────────────

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _redis_key(session_id: str) -> str:
    """Redis list key scoped to a session."""
    return f"chat:{session_id}:messages"


def _build_message_doc(
    message_id: str,
    session_id: str,
    role: str,
    content: str,
    model_used: Optional[str] = None,
    tokens_used: Optional[int] = None,
) -> dict:
    """Build a message document used by both Redis and MongoDB."""
    return {
        "id": message_id,
        "session_id": session_id,
        "role": role,
        "content": content,
        "model_used": model_used,
        "tokens_used": tokens_used,
        "created_at": _now_iso(),
    }


# ── Write: Redis ──────────────────────────────────────────

def _save_to_redis(session_id: str, message: dict) -> None:
    """Push message JSON to a Redis list and trim to keep a rolling window."""
    try:
        import json

        r = _get_redis()
        key = _redis_key(session_id)
        r.rpush(key, json.dumps(message))
        r.ltrim(key, -REDIS_MAX_HISTORY, -1)
    except Exception:
        logger.exception("Failed to write to Redis – continuing with MongoDB only")


# ── Write: MongoDB ────────────────────────────────────────

def _save_to_mongo(session_id: str, message: dict) -> None:
    """Insert the message document into the MongoDB messages collection
    and upsert the parent conversation metadata."""
    try:
        db = _get_mongo_db()

        # Upsert conversation metadata
        db.conversations.update_one(
            {"_id": session_id},
            {
                "$setOnInsert": {
                    "created_at": message["created_at"],
                    "title": message["content"][:80] if message["role"] == "user" else "Untitled",
                },
                "$set": {"updated_at": message["created_at"]},
            },
            upsert=True,
        )

        # Insert individual message
        db.messages.insert_one(message)
    except PyMongoError:
        logger.exception("Failed to write to MongoDB – continuing with Redis only")


# ── Public API ────────────────────────────────────────────

def ensure_conversation(session_id: str, title: Optional[str] = None) -> str:
    """Ensure a conversation document exists in MongoDB. Returns session_id."""
    try:
        db = _get_mongo_db()
        db.conversations.update_one(
            {"_id": session_id},
            {
                "$setOnInsert": {
                    "title": title or "Untitled",
                    "created_at": _now_iso(),
                },
                "$set": {"updated_at": _now_iso()},
            },
            upsert=True,
        )
    except PyMongoError:
        logger.exception("Failed to ensure conversation in MongoDB")
    return session_id


def save_message(
    session_id: str,
    role: str,
    content: str,
    model_used: Optional[str] = None,
    tokens_used: Optional[int] = None,
) -> str:
    """Dual-write a message to Redis AND MongoDB. Returns the message UUID."""
    msg_id = str(uuid.uuid4())
    doc = _build_message_doc(msg_id, session_id, role, content, model_used, tokens_used)

    # Write to both backends (best-effort)
    _save_to_redis(session_id, doc)
    _save_to_mongo(session_id, doc)

    return msg_id


def save_user_message(session_id: str, content: str) -> str:
    """Save a user prompt to both stores."""
    return save_message(session_id, "user", content)


def save_assistant_message(
    session_id: str, content: str, tokens_used: Optional[int] = None
) -> str:
    """Save an AI response to both stores."""
    return save_message(
        session_id, "assistant", content, model_used=HF_MODEL, tokens_used=tokens_used
    )


def get_history(session_id: str, limit: int = 50) -> list[dict]:
    """Retrieve chat history.

    Tries Redis first (fast, recent window). Falls back to MongoDB
    if Redis is empty or unreachable.
    """
    # 1. Try Redis (fast path)
    try:
        import json

        r = _get_redis()
        key = _redis_key(session_id)
        raw = r.lrange(key, 0, limit - 1)
        if raw:
            return [json.loads(item) for item in raw]
    except Exception:
        logger.exception("Redis read failed – falling back to MongoDB")

    # 2. Fallback to MongoDB (permanent archive)
    try:
        db = _get_mongo_db()
        cursor = (
            db.messages.find({"session_id": session_id}, {"_id": 0})
            .sort("created_at", 1)
            .limit(limit)
        )
        return list(cursor)
    except PyMongoError:
        logger.exception("MongoDB read also failed")
        return []


def list_conversations(limit: int = 20) -> list[dict]:
    """List recent conversations from MongoDB, newest first."""
    try:
        db = _get_mongo_db()
        cursor = (
            db.conversations.find({}, {"_id": 1, "title": 1, "created_at": 1, "updated_at": 1})
            .sort("updated_at", -1)
            .limit(limit)
        )
        results = []
        for doc in cursor:
            doc["id"] = doc.pop("_id")
            results.append(doc)
        return results
    except PyMongoError:
        logger.exception("Failed to list conversations from MongoDB")
        return []

def check_health() -> dict:
    """Check connections to Redis and MongoDB for uptime monitors."""
    status = {"redis": "disconnected", "mongodb": "disconnected"}
    
    try:
        r = _get_redis()
        if r.ping():
            status["redis"] = "connected"
    except Exception as e:
        status["redis"] = f"error: {str(e)}"
        
    try:
        db = _get_mongo_db()
        db.command("ping")
        status["mongodb"] = "connected"
    except Exception as e:
        status["mongodb"] = f"error: {str(e)}"
        
    return status
