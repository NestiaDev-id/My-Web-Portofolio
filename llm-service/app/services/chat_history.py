"""
Chat history service — persists every prompt and AI response to a local
SQLite database so conversation logs survive within a single runtime session.

Schema
------
conversations
    id          TEXT PRIMARY KEY   — UUID per conversation / session
    user_id     TEXT               — optional user identifier
    title       TEXT               — auto-generated from first prompt
    created_at  TEXT (ISO-8601)
    updated_at  TEXT (ISO-8601)

messages
    id              TEXT PRIMARY KEY
    conversation_id TEXT  FK → conversations.id
    role            TEXT  ('user' | 'assistant' | 'system')
    content         TEXT
    model_used      TEXT  — e.g. "mistralai/Mistral-7B-Instruct-v0.2"
    tokens_used     INTEGER  (nullable)
    created_at      TEXT (ISO-8601)
"""

import os
import sqlite3
import uuid
from datetime import datetime, timezone
from typing import Optional

from app.utils.config import CHAT_HISTORY_DB, HF_MODEL

_conn: Optional[sqlite3.Connection] = None


def _get_connection() -> sqlite3.Connection:
    """Return a module-level SQLite connection, creating the DB if needed."""
    global _conn
    if _conn is None:
        os.makedirs(os.path.dirname(CHAT_HISTORY_DB) or ".", exist_ok=True)
        _conn = sqlite3.connect(CHAT_HISTORY_DB, check_same_thread=False)
        _conn.row_factory = sqlite3.Row
        _conn.execute("PRAGMA journal_mode=WAL")
        _init_tables(_conn)
    return _conn


def _init_tables(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS conversations (
            id          TEXT PRIMARY KEY,
            user_id     TEXT,
            title       TEXT,
            created_at  TEXT NOT NULL,
            updated_at  TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS messages (
            id              TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            role            TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
            content         TEXT NOT NULL,
            model_used      TEXT,
            tokens_used     INTEGER,
            created_at      TEXT NOT NULL,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id)
        );

        CREATE INDEX IF NOT EXISTS idx_messages_conv
            ON messages(conversation_id, created_at);
        """
    )
    conn.commit()


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Public API ────────────────────────────────────────────

def ensure_conversation(session_id: str, title: Optional[str] = None) -> str:
    """Create a conversation row if it doesn't exist yet. Returns the id."""
    conn = _get_connection()
    row = conn.execute(
        "SELECT id FROM conversations WHERE id = ?", (session_id,)
    ).fetchone()

    if row:
        return row["id"]

    now = _now_iso()
    conn.execute(
        "INSERT INTO conversations (id, user_id, title, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, ?)",
        (session_id, None, title or "Untitled", now, now),
    )
    conn.commit()
    return session_id


def save_message(
    conversation_id: str,
    role: str,
    content: str,
    model_used: Optional[str] = None,
    tokens_used: Optional[int] = None,
) -> str:
    """Insert a message and return its UUID."""
    conn = _get_connection()
    msg_id = str(uuid.uuid4())
    now = _now_iso()

    conn.execute(
        "INSERT INTO messages "
        "(id, conversation_id, role, content, model_used, tokens_used, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        (msg_id, conversation_id, role, content, model_used, tokens_used, now),
    )
    # Also bump the conversation's updated_at
    conn.execute(
        "UPDATE conversations SET updated_at = ? WHERE id = ?",
        (now, conversation_id),
    )
    conn.commit()
    return msg_id


def save_user_message(conversation_id: str, content: str) -> str:
    """Shorthand — save a user prompt."""
    return save_message(conversation_id, "user", content)


def save_assistant_message(
    conversation_id: str, content: str, tokens_used: Optional[int] = None
) -> str:
    """Shorthand — save an AI response."""
    return save_message(
        conversation_id,
        "assistant",
        content,
        model_used=HF_MODEL,
        tokens_used=tokens_used,
    )


def get_history(conversation_id: str, limit: int = 50) -> list[dict]:
    """Return the most recent *limit* messages for a conversation."""
    conn = _get_connection()
    rows = conn.execute(
        "SELECT id, role, content, model_used, tokens_used, created_at "
        "FROM messages WHERE conversation_id = ? "
        "ORDER BY created_at ASC LIMIT ?",
        (conversation_id, limit),
    ).fetchall()
    return [dict(r) for r in rows]


def list_conversations(limit: int = 20) -> list[dict]:
    """List recent conversations, newest first."""
    conn = _get_connection()
    rows = conn.execute(
        "SELECT id, user_id, title, created_at, updated_at "
        "FROM conversations ORDER BY updated_at DESC LIMIT ?",
        (limit,),
    ).fetchall()
    return [dict(r) for r in rows]
