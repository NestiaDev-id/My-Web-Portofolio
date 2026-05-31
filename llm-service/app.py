import io
import os
import uuid
from functools import lru_cache
from typing import List

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from huggingface_hub import InferenceClient
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel
from PyPDF2 import PdfReader
import chromadb


CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")
EMBED_MODEL = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
HF_MODEL = os.getenv("HF_MODEL", "mistralai/Mistral-7B-Instruct-v0.2")
DEFAULT_CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
DEFAULT_CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))
DEFAULT_TOP_K = int(os.getenv("TOP_K", "3"))

os.makedirs(CHROMA_PATH, exist_ok=True)

app = FastAPI(title="Local ChromaDB RAG API")
client = chromadb.PersistentClient(path=CHROMA_PATH)
embeddings = HuggingFaceEmbeddings(model_name=EMBED_MODEL)

PROMPT = PromptTemplate.from_template(
    "You are a helpful assistant. Use the context below to answer the question.\n\n"
    "Context:\n{context}\n\nQuestion:\n{question}\n\nAnswer:"
)


class ChatRequest(BaseModel):
    question: str
    session_id: str = "default"
    top_k: int = DEFAULT_TOP_K


class ClearRequest(BaseModel):
    session_id: str = "default"


def normalize_session_id(session_id: str) -> str:
    safe = "".join(ch for ch in session_id.lower() if ch.isalnum() or ch in ("-", "_"))
    return safe or "default"


def get_collection(session_id: str):
    name = f"chat_{normalize_session_id(session_id)}"
    return client.get_or_create_collection(name=name, metadata={"hnsw:space": "cosine"})


def extract_text_from_file(filename: str, data: bytes) -> str:
    if filename.lower().endswith(".pdf"):
        reader = PdfReader(io.BytesIO(data))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages)
    return data.decode("utf-8", errors="ignore")


def split_text(text: str, chunk_size: int, chunk_overlap: int) -> List[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )
    return [chunk for chunk in splitter.split_text(text) if chunk.strip()]


@lru_cache
def get_hf_client() -> InferenceClient:
    token = os.getenv("HUGGINGFACEHUB_API_TOKEN") or os.getenv("HF_TOKEN")
    if not token:
        raise ValueError(
            "Set HUGGINGFACEHUB_API_TOKEN (or HF_TOKEN) to use Hugging Face Inference API."
        )
    return InferenceClient(model=HF_MODEL, token=token)


@app.get("/")
def root():
    return {
        "message": "Local ChromaDB RAG API",
        "note": (
            "Documents are stored on local ephemeral disk and will be lost when the Space restarts."
        ),
    }


@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    session_id: str = Form("default"),
    chunk_size: int = Form(DEFAULT_CHUNK_SIZE),
    chunk_overlap: int = Form(DEFAULT_CHUNK_OVERLAP),
):
    filename = file.filename or "upload"
    data = await file.read()
    text = extract_text_from_file(filename, data)
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text extracted from file.")

    chunks = split_text(text, chunk_size, chunk_overlap)
    if not chunks:
        raise HTTPException(status_code=400, detail="No valid text chunks found.")

    collection = get_collection(session_id)
    vectors = embeddings.embed_documents(chunks)
    ids = [f"{normalize_session_id(session_id)}-{uuid.uuid4()}" for _ in chunks]
    metadatas = [{"source": filename}] * len(chunks)
    collection.add(documents=chunks, embeddings=vectors, ids=ids, metadatas=metadatas)

    return {
        "status": "ok",
        "filename": filename,
        "chunks_added": len(chunks),
        "collection": collection.name,
    }


@app.post("/chat")
def chat(request: ChatRequest):
    collection = get_collection(request.session_id)
    if collection.count() == 0:
        raise HTTPException(status_code=400, detail="No documents indexed for this session.")

    query_embedding = embeddings.embed_query(request.question)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=request.top_k,
        include=["documents", "metadatas", "distances"],
    )
    documents = results.get("documents", [[]])[0]
    if not documents:
        raise HTTPException(status_code=404, detail="No relevant documents found.")

    context = "\n\n".join(documents)
    prompt = PROMPT.format(context=context, question=request.question)

    try:
        client_hf = get_hf_client()
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    answer = client_hf.text_generation(
        prompt,
        max_new_tokens=512,
        temperature=0.2,
        top_p=0.95,
    )

    return {
        "answer": answer.strip(),
        "context": documents,
    }


@app.post("/clear")
def clear_collection(request: ClearRequest):
    name = f"chat_{normalize_session_id(request.session_id)}"
    collections = {col.name for col in client.list_collections()}
    if name not in collections:
        return {"status": "ok", "cleared": False, "collection": name}

    client.delete_collection(name)
    return {"status": "ok", "cleared": True, "collection": name}
