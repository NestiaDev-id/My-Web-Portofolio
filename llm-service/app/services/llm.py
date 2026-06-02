"""
LLM generation service via Groq API.
"""

import os
import requests
from langchain_core.prompts import PromptTemplate

# ── Prompt template ──────────────────────────────────────
PROMPT = PromptTemplate.from_template(
    "Anda adalah Asisten AI pribadi untuk portfolio NestiaDev.\n"
    "Selalu jawab dalam bahasa Indonesia yang profesional, ramah, dan jelas.\n"
    "Tujuan utama Anda: membantu pengunjung memahami profil NestiaDev, "
    "memberi analisis singkat jika ada dokumen tugas client, serta "
    "mendorong kolaborasi secara relevan dan tidak memaksa.\n\n"
    "Aturan perilaku:\n"
    "1) Jika konteks kosong dan pertanyaan berupa sapaan umum (contoh: \"Hai\"), "
    "balas dengan sapaan hangat dan perkenalan singkat NestiaDev.\n"
    "2) Jika konteks hanya tentang CV/portfolio NestiaDev, jawab berdasarkan konteks tersebut.\n"
    "3) Jika konteks memuat dokumen tugas client, berikan ringkasan dan saran awal "
    "berdasarkan konteks, lalu sebutkan bahwa NestiaDev terbuka untuk membantu.\n"
    "4) Jangan mengarang detail yang tidak ada di konteks.\n"
    "5) Jika pertanyaan tidak jelas, minta klarifikasi singkat.\n\n"
    "Konteks:\n{context}\n\nPertanyaan:\n{question}\n\nJawaban:"
)


def generate_answer(question: str, context_chunks: list[str]) -> str:
    """Build a RAG prompt and stream an answer from the LLM via Groq.

    Args:
        question: The user's question.
        context_chunks: Relevant document chunks retrieved from the vector store.

    Returns:
        The generated answer string.
    """
    context = "\n\n".join(context_chunks)
    prompt = PROMPT.format(context=context, question=question)

    groq_api_key = os.getenv("VITE_GROQ_API_KEY") or os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("Set VITE_GROQ_API_KEY (or GROQ_API_KEY) to use Groq API.")

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {groq_api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "max_tokens": 512,
        "top_p": 0.95
    }

    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"].strip()
