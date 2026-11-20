from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, File, Form, HTTPException, Header, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    ChatVisionResponse,
    ClearRequest,
    ClearResponse,
    UploadResponse,
)
from app.services import vector_store
from app.services.llm import generate_answer, generate_vision_answer
from app.utils.config import (
    CV_PATH,
    DEFAULT_CHUNK_OVERLAP,
    DEFAULT_CHUNK_SIZE,
    INTERNAL_API_SECRET,
    RAG_COLLECTION_ID,
)
from app.utils.text import extract_text_from_file, split_text

app = FastAPI(
    title="LLM Compute Worker",
    description=(
        "Stateless RAG & Vision compute worker backed by ChromaDB. "
        "Session persistence and database management are delegated to the API Gateway."
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_UPLOAD_EXTENSIONS = {".txt", ".pdf", ".doc", ".docx"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
MAX_IMAGE_BYTES = 10 * 1024 * 1024

IMAGE_MIME_MAP = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


def verify_internal_secret(
    x_internal_secret: Optional[str] = Header(default=None, alias="X-Internal-Secret")
):
    if INTERNAL_API_SECRET and x_internal_secret != INTERNAL_API_SECRET:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Invalid internal secret.",
        )


def validate_upload(filename: str, data: bytes):
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_UPLOAD_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Allowed: .txt, .pdf, .doc, .docx",
        )
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail="File too large. Max size is 5MB.",
        )
    if ext == ".doc":
        raise HTTPException(
            status_code=400,
            detail="File .doc belum didukung. Gunakan .docx, .pdf, atau .txt.",
        )


@app.get("/")
def root():
    return {
        "service": "LLM Compute Worker",
        "status": "running",
        "mode": "stateless-worker",
        "note": "Ephemeral ChromaDB vector store. No external database connections.",
    }


@app.get("/healthcheck")
@app.head("/healthcheck")
def healthcheck():
    collections_count = len(vector_store.chroma_client.list_collections())
    return {
        "status": "ok",
        "service": "Hugging Face Space (Active)",
        "vector_store": {
            "status": "ready",
            "active_collections": collections_count,
        },
    }


@app.on_event("startup")
def index_cv_on_startup():
    cv_file = Path(CV_PATH)
    if not cv_file.exists():
        return

    text = cv_file.read_text(encoding="utf-8").strip()
    if not text:
        return

    vector_store.clear(RAG_COLLECTION_ID)
    chunks = split_text(text, DEFAULT_CHUNK_SIZE, DEFAULT_CHUNK_OVERLAP)
    if not chunks:
        return

    vector_store.ingest_chunks(RAG_COLLECTION_ID, chunks, source=cv_file.name)


@app.post("/upload-task", response_model=UploadResponse, dependencies=[Depends(verify_internal_secret)])
async def upload_client_task(
    file: UploadFile = File(...),
    session_id: str = Form("default"),
    chunk_size: int = Form(DEFAULT_CHUNK_SIZE),
    chunk_overlap: int = Form(DEFAULT_CHUNK_OVERLAP),
):
    filename = file.filename or "upload"
    data = await file.read()
    validate_upload(filename, data)
    text = extract_text_from_file(filename, data)
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text extracted from file.")

    chunks = split_text(text, chunk_size, chunk_overlap)
    if not chunks:
        raise HTTPException(status_code=400, detail="No valid text chunks found.")

    collection_id = f"client_{session_id}"
    count = vector_store.ingest_chunks(collection_id, chunks, source=filename)
    collection = vector_store.get_collection(collection_id)

    return UploadResponse(
        status="ok",
        filename=filename,
        chunks_added=count,
        collection=collection.name,
    )


@app.post("/chat", response_model=ChatResponse, dependencies=[Depends(verify_internal_secret)])
def chat(request: ChatRequest):
    # 1. Retrieve relevant document chunks from CV + client task collection
    cv_documents = vector_store.search(
        RAG_COLLECTION_ID, request.question, request.top_k
    )
    client_collection_id = f"client_{request.session_id}"
    client_documents = vector_store.search(
        client_collection_id, request.question, request.top_k
    )
    documents = cv_documents + client_documents

    # 2. Generate answer via LLM using passed history
    try:
        answer = generate_answer(
            question=request.question,
            context_chunks=documents,
            history=request.history,
        )
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return ChatResponse(answer=answer, context=documents)


@app.post("/chat-vision", response_model=ChatVisionResponse, dependencies=[Depends(verify_internal_secret)])
async def chat_vision(
    file: UploadFile = File(...),
    question: str = Form(""),
    session_id: str = Form("default"),
    top_k: int = Form(3),
    _auth: None = Depends(verify_internal_secret),
):
    """Analyse an uploaded image using Vision AI."""
    filename = file.filename or "image"
    ext = Path(filename).suffix.lower()

    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Format gambar tidak didukung. Gunakan: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}",
        )

    data = await file.read()

    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Gambar terlalu besar. Maksimal 10MB.",
        )

    mime_type = IMAGE_MIME_MAP.get(ext, "image/jpeg")

    # Optionally retrieve RAG context if question is provided
    context_chunks: list[str] = []
    if question.strip():
        cv_docs = vector_store.search(RAG_COLLECTION_ID, question, top_k)
        client_docs = vector_store.search(f"client_{session_id}", question, top_k)
        context_chunks = cv_docs + client_docs

    try:
        answer = generate_vision_answer(
            image_bytes=data,
            mime_type=mime_type,
            question=question.strip() or None,
            context_chunks=context_chunks if context_chunks else None,
        )
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return ChatVisionResponse(answer=answer, filename=filename)


@app.post("/clear", response_model=ClearResponse, dependencies=[Depends(verify_internal_secret)])
def clear_collection(request: ClearRequest):
    # Clear both base collection and client task collection
    cleared_base = vector_store.clear(request.session_id)
    cleared_client = vector_store.clear(f"client_{request.session_id}")
    name = f"chat_{vector_store.normalize_session_id(request.session_id)}"
    return ClearResponse(
        status="ok",
        cleared=cleared_base or cleared_client,
        collection=name,
    )
