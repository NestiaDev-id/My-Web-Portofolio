import asyncio
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, File, Form, HTTPException, Header, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    ChatVisionResponse,
    ClearRequest,
    ClearResponse,
    UploadResponse,
)
from app.models.vtuber import (
    AudioChunkEvent,
    ScriptReadyEvent,
    StreamEndEvent,
    TTSBenchmarkRequest,
    TTSBenchmarkResponse,
    VTuberChatRequest,
    VTuberChatResponse,
)
from app.services import vector_store
from app.services.llm import (
    generate_answer,
    generate_director_script,
    generate_vision_answer,
)
from app.services.tts_router import MultiEngineTTSRouter
from app.services.vtuber_parser import parse_and_coalesce_segments
from app.utils.config import (
    CV_PATH,
    DEFAULT_CHUNK_OVERLAP,
    DEFAULT_CHUNK_SIZE,
    INTERNAL_API_SECRET,
    RAG_COLLECTION_ID,
)
from app.utils.text import extract_text_from_file, split_text

# Inference semaphore to isolate threads and protect 2 vCPU Hugging Face Free Tier
cpu_inference_lock = asyncio.Semaphore(1)
tts_router: Optional[MultiEngineTTSRouter] = None


def index_cv_on_startup():
    """Ingest CV document into ChromaDB upon worker startup."""
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Warm-in-RAM lifespan context: initialize ChromaDB and TTS models once."""
    global tts_router
    index_cv_on_startup()
    tts_router = MultiEngineTTSRouter(
        reference_voice_path="app/data/voices/character_voice.mp3",
        omp_threads=2,
    )
    await tts_router.warmup()
    yield
    if tts_router:
        await tts_router.shutdown()


app = FastAPI(
    title="LLM & VTuber Compute Worker",
    description=(
        "Stateless RAG, Vision & VTuber Expressive AI worker backed by ChromaDB and Edge-TTS. "
        "Session persistence and database management are delegated to the API Gateway."
    ),
    version="2.1.0",
    lifespan=lifespan,
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
    if not INTERNAL_API_SECRET or x_internal_secret != INTERNAL_API_SECRET:
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
        "service": "LLM & VTuber Compute Worker",
        "status": "running",
        "mode": "stateless-worker",
        "vtuber_engine": "active",
        "note": "Ephemeral ChromaDB vector store. Zero external database connections.",
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
        "tts_router": {
            "warm": tts_router._is_warm if tts_router else False,
            "edge_tts_available": tts_router._edge_tts_available if tts_router else False,
            "pocket_tts_loaded": tts_router._pocket_tts is not None if tts_router else False,
            "chatterbox_nano_loaded": tts_router._chatterbox_model is not None if tts_router else False,
        },
    }


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
    cv_documents = vector_store.search(
        RAG_COLLECTION_ID, request.question, request.top_k
    )
    client_collection_id = f"client_{request.session_id}"
    client_documents = vector_store.search(
        client_collection_id, request.question, request.top_k
    )
    documents = cv_documents + client_documents

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
    cleared_base = vector_store.clear(request.session_id)
    cleared_client = vector_store.clear(f"client_{request.session_id}")
    name = f"chat_{vector_store.normalize_session_id(request.session_id)}"
    return ClearResponse(
        status="ok",
        cleared=cleared_base or cleared_client,
        collection=name,
    )


# ════════════════════════════════════════════════════════════
# VTuber Expressive AI & Multilingual Streaming Endpoints
# ════════════════════════════════════════════════════════════

@app.post("/tts/benchmark", response_model=TTSBenchmarkResponse, dependencies=[Depends(verify_internal_secret)])
async def benchmark_tts(payload: TTSBenchmarkRequest):
    """Benchmark edge-TTS, Pocket-TTS Indonesian, or Chatterbox-Nano."""
    if not tts_router:
        raise HTTPException(status_code=503, detail="TTS router belum siap.")

    async with cpu_inference_lock:
        result = await tts_router.benchmark_engine(
            text=payload.text,
            engine=payload.engine,
            lang=payload.lang,
        )
    return TTSBenchmarkResponse(**result)


@app.post("/vtuber/chat/stream", dependencies=[Depends(verify_internal_secret)])
async def vtuber_chat_stream(payload: VTuberChatRequest):
    """Stream expressive multilingual dialog script & audio chunks via Server-Sent Events (SSE)."""
    async def event_generator():
        # 1. Generate director script from LLM (<600ms)
        raw_text = generate_director_script(
            question=payload.user_message,
            history=payload.history,
            persona=payload.persona_mode,
        )

        # 2. Parse and coalesce segments into sequential speech & paralinguistic units
        segments = parse_and_coalesce_segments(raw_text)

        # 3. Emit script_ready event
        script_ready = ScriptReadyEvent(
            session_id=payload.session_id,
            raw_annotated_text=raw_text,
            total_segments=len(segments),
        )
        yield f"data: {script_ready.model_dump_json()}\n\n"

        # 4. Synthesize and emit audio_chunk events
        total_duration = 0
        for idx, seg in enumerate(segments, start=1):
            if payload.enable_tts and tts_router:
                async with cpu_inference_lock:
                    chunk_event = await tts_router.synthesize_segment(
                        idx,
                        seg,
                        engine=payload.tts_engine,
                    )
            else:
                chunk_event = seg.to_silent_event(idx)

            start_ms = total_duration
            chunk_event.start_ms = start_ms
            chunk_event.end_ms = start_ms + chunk_event.duration_ms
            total_duration = chunk_event.end_ms
            yield f"data: {chunk_event.model_dump_json()}\n\n"

        # 5. Emit stream_end event
        stream_end = StreamEndEvent(
            session_id=payload.session_id,
            total_duration_ms=total_duration,
        )
        yield f"data: {stream_end.model_dump_json()}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/vtuber/chat", response_model=VTuberChatResponse, dependencies=[Depends(verify_internal_secret)])
async def vtuber_chat(payload: VTuberChatRequest):
    """Non-streaming complete response for VTuber dialog."""
    raw_text = generate_director_script(
        question=payload.user_message,
        history=payload.history,
        persona=payload.persona_mode,
    )
    segments = parse_and_coalesce_segments(raw_text)

    chunks = []
    total_duration = 0
    for idx, seg in enumerate(segments, start=1):
        if payload.enable_tts and tts_router:
            async with cpu_inference_lock:
                chunk_event = await tts_router.synthesize_segment(
                idx,
                seg,
                engine=payload.tts_engine,
            )
        else:
            chunk_event = seg.to_silent_event(idx, total_duration)

        if chunk_event.start_ms == 0 and total_duration > 0:
            chunk_event.start_ms = total_duration
            chunk_event.end_ms = total_duration + chunk_event.duration_ms
        elif chunk_event.start_ms == 0:
            chunk_event.end_ms = chunk_event.duration_ms

        total_duration = chunk_event.end_ms
        chunks.append(chunk_event)

    return VTuberChatResponse(
        session_id=payload.session_id,
        raw_annotated_text=raw_text,
        total_duration_ms=total_duration,
        chunks=chunks,
    )
