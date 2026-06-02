"""
LLM generation service via Hugging Face Inference API.
"""

import os
from functools import lru_cache

from huggingface_hub import InferenceClient
from langchain_core.prompts import PromptTemplate

from app.utils.config import HF_MODEL

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


@lru_cache
def _get_hf_client() -> InferenceClient:
    """Create (and cache) an authenticated HF Inference client."""
    token = os.getenv("HUGGINGFACEHUB_API_TOKEN") or os.getenv("HF_TOKEN")
    if not token:
        raise ValueError(
            "Set HUGGINGFACEHUB_API_TOKEN (or HF_TOKEN) to use Hugging Face Inference API."
        )
    return InferenceClient(model=HF_MODEL, token=token)


def generate_answer(question: str, context_chunks: list[str]) -> str:
    """Build a RAG prompt and stream an answer from the LLM.

    Args:
        question: The user's question.
        context_chunks: Relevant document chunks retrieved from the vector store.

    Returns:
        The generated answer string.
    """
    context = "\n\n".join(context_chunks)
    prompt = PROMPT.format(context=context, question=question)

    client = _get_hf_client()
    response = client.chat_completion(
        messages=[{"role": "user", "content": prompt}],
        max_tokens=512,
        temperature=0.2,
        top_p=0.95,
    )
    return response.choices[0].message.content.strip()
