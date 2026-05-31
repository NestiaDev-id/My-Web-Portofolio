from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, Header, UploadFile

from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    ClearRequest,
    ClearResponse,
    UploadResponse,
)
from app.services import chat_history, vector_store
from app.services.llm import generate_answer
from app.utils.config import (
    CV_PATH,
    DEFAULT_CHUNK_OVERLAP,
    DEFAULT_CHUNK_SIZE,
    RAG_COLLECTION_ID,
    UPLOAD_TOKEN,
)
from app.utils.text import extract_text_from_file, split_text

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="LLM RAG Service",
    description=(
        "RAG chatbot backed by ChromaDB (ephemeral vector store), "
        "Upstash Redis (short-term chat memory), and MongoDB Atlas "
        "(permanent chat archive). Deployed on Hugging Face Spaces."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "LLM RAG Service",
        "status": "running",
        "note": (
            "Documents are stored on local ephemeral disk and will be "
            "lost when the Space restarts."
        ),
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


@app.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    session_id: str = Form(RAG_COLLECTION_ID),
    chunk_size: int = Form(DEFAULT_CHUNK_SIZE),
    chunk_overlap: int = Form(DEFAULT_CHUNK_OVERLAP),
    x_upload_token: Optional[str] = Header(default=None, alias="X-Upload-Token"),
):
    if not UPLOAD_TOKEN:
        raise HTTPException(status_code=403, detail="Upload disabled.")
    if x_upload_token != UPLOAD_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid upload token.")

    filename = file.filename or "upload"
    data = await file.read()
    text = extract_text_from_file(filename, data)
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text extracted from file.")

    chunks = split_text(text, chunk_size, chunk_overlap)
    if not chunks:
        raise HTTPException(status_code=400, detail="No valid text chunks found.")

    count = vector_store.ingest_chunks(session_id, chunks, source=filename)
    collection = vector_store.get_collection(session_id)

    return UploadResponse(
        status="ok",
        filename=filename,
        chunks_added=count,
        collection=collection.name,
    )

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    # 1. Retrieve relevant document chunks
    cv_documents = vector_store.search(
        RAG_COLLECTION_ID, request.question, request.top_k
    )
    client_collection_id = f"client_{request.session_id}"
    client_documents = vector_store.search(
        client_collection_id, request.question, request.top_k
    )
    documents = cv_documents + client_documents

    # 2. Generate answer via LLM
    try:
        answer = generate_answer(request.question, documents)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    # 3. Persist prompt + response to chat history DB
    chat_history.ensure_conversation(
        request.session_id, title=request.question[:80]
    )
    chat_history.save_user_message(request.session_id, request.question)
    msg_id = chat_history.save_assistant_message(request.session_id, answer)

    return ChatResponse(answer=answer, context=documents, message_id=msg_id)


@app.post("/clear", response_model=ClearResponse)
def clear_collection(request: ClearRequest):
    cleared = vector_store.clear(request.session_id)
    name = f"chat_{vector_store.normalize_session_id(request.session_id)}"
    return ClearResponse(status="ok", cleared=cleared, collection=name)


@app.get("/history/{session_id}")
def get_history(session_id: str, limit: int = 50):
    """Return stored messages for a conversation, ordered by time."""
    messages = chat_history.get_history(session_id, limit=limit)
    return {"session_id": session_id, "messages": messages}


@app.get("/conversations")
def list_conversations(limit: int = 20):
    """List recent conversations."""
    convos = chat_history.list_conversations(limit=limit)
    return {"conversations": convos}
