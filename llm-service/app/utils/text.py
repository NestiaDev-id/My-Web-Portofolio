"""
Utilities for extracting and splitting text from uploaded files.
"""

import io
from typing import List

from langchain.text_splitter import RecursiveCharacterTextSplitter
from PyPDF2 import PdfReader


def extract_text_from_file(filename: str, data: bytes) -> str:
    """Extract plain text from PDF or plain-text file bytes."""
    if filename.lower().endswith(".pdf"):
        reader = PdfReader(io.BytesIO(data))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages)
    return data.decode("utf-8", errors="ignore")


def split_text(
    text: str,
    chunk_size: int,
    chunk_overlap: int,
) -> List[str]:
    """Split a long text into smaller overlapping chunks."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )
    return [chunk for chunk in splitter.split_text(text) if chunk.strip()]
