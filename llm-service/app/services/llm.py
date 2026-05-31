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
    "Jawab dalam bahasa Indonesia yang profesional, ramah, dan jelas.\n"
    "Gunakan konteks jika tersedia. Jika konteks kosong, tetap jawab secara umum "
    "tanpa mengarang detail yang tidak diketahui.\n\n"
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
    answer = client.text_generation(
        prompt,
        max_new_tokens=512,
        temperature=0.2,
        top_p=0.95,
    )
    return answer.strip()
