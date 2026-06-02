"""
LLM generation service via Groq API.
Supports both text chat (llama-3.1-8b-instant) and
vision/image analysis (llama-3.2-11b-vision-preview).
"""

import base64
import os
import requests

# ── System prompt ────────────────────────────────────────
SYSTEM_PROMPT = (
    "Anda adalah Asisten AI pribadi untuk portfolio NestiaDev.\n"
    "Selalu jawab dalam bahasa yang sama dengan bahasa pengguna.\n"
    "Jika pengguna menggunakan bahasa Indonesia, jawab dalam bahasa Indonesia.\n"
    "Jika pengguna menggunakan bahasa Inggris, jawab dalam bahasa Inggris.\n"
    "Tujuan utama Anda: membantu pengunjung memahami profil NestiaDev, "
    "memberi analisis singkat jika ada dokumen tugas client, serta "
    "mendorong kolaborasi secara relevan dan tidak memaksa.\n\n"
    "Aturan perilaku:\n"
    "1) Jika konteks kosong dan pertanyaan berupa sapaan umum (contoh: \"Hai\"), "
    "balas dengan sapaan hangat dan perkenalan singkat NestiaDev.\n"
    "2) Jika pengguna mengirim emoji saja (contoh: 😂, 🤣, 😊, 👍, ❤️), "
    "respons dengan reaksi yang relevan dan ramah. Contoh: jika user kirim 😂, "
    "balas \"Haha senang bisa menghibur! Ada yang bisa saya bantu lagi? 😄\". "
    "Jangan abaikan emoji, tunjukkan bahwa Anda memahami ekspresi mereka.\n"
    "3) Jika konteks hanya tentang CV/portfolio NestiaDev, jawab berdasarkan konteks tersebut.\n"
    "4) Jika konteks memuat dokumen tugas client, berikan ringkasan dan saran awal "
    "berdasarkan konteks, lalu sebutkan bahwa NestiaDev terbuka untuk membantu.\n"
    "5) Jangan mengarang detail yang tidak ada di konteks.\n"
    "6) Jika pertanyaan tidak jelas, minta klarifikasi singkat.\n"
    "7) Jika pengguna mengirim gambar, analisis gambar tersebut secara detail, "
    "jelaskan apa yang Anda lihat, dan berikan insight yang relevan."
)

# ── Groq API helper ──────────────────────────────────────

def _get_groq_key() -> str:
    key = os.getenv("VITE_GROQ_API_KEY") or os.getenv("GROQ_API_KEY")
    if not key:
        raise ValueError("Set VITE_GROQ_API_KEY (or GROQ_API_KEY) to use Groq API.")
    return key


def _groq_chat(payload: dict) -> str:
    """Send a chat completion request to Groq and return the text."""
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {_get_groq_key()}",
        "Content-Type": "application/json",
    }
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"].strip()


# ── Text generation ──────────────────────────────────────

def generate_answer(question: str, context_chunks: list[str]) -> str:
    """Build a RAG prompt and get an answer from the LLM via Groq.

    Args:
        question: The user's question.
        context_chunks: Relevant document chunks retrieved from the vector store.

    Returns:
        The generated answer string.
    """
    context = "\n\n".join(context_chunks) if context_chunks else "(tidak ada konteks)"

    user_content = (
        f"Konteks:\n{context}\n\n"
        f"Pertanyaan:\n{question}"
    )

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        "temperature": 0.2,
        "max_tokens": 512,
        "top_p": 0.95,
    }

    return _groq_chat(payload)


# ── Vision generation ────────────────────────────────────

def generate_vision_answer(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
    question: str | None = None,
    context_chunks: list[str] | None = None,
) -> str:
    """Analyse an image using Groq Vision API.

    Args:
        image_bytes: Raw bytes of the uploaded image.
        mime_type: MIME type of the image (e.g. image/jpeg, image/png).
        question: Optional question about the image.
        context_chunks: Optional context from RAG.

    Returns:
        The generated analysis string.
    """
    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    data_uri = f"data:{mime_type};base64,{b64_image}"

    # Build user message with optional text
    user_parts: list[str] = []

    if context_chunks:
        context = "\n\n".join(context_chunks)
        user_parts.append(f"Konteks:\n{context}")

    if question:
        user_parts.append(question)
    else:
        user_parts.append("Analisis gambar ini secara detail.")

    text_content = "\n\n".join(user_parts)

    payload = {
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": text_content},
                    {
                        "type": "image_url",
                        "image_url": {"url": data_uri},
                    },
                ],
            },
        ],
        "temperature": 0.3,
        "max_tokens": 1024,
        "top_p": 0.95,
    }

    return _groq_chat(payload)
