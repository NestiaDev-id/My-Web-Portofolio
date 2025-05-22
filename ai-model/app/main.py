# ai-model/app/main.py (Tidak perlu diubah, hanya untuk referensi)
from fastapi import FastAPI
from app.api.endpoints import router as api_router
from dotenv import load_dotenv

load_dotenv() # Pastikan dotenv dimuat di awal

app = FastAPI(
    title="AI Model API",
    description="API untuk berinteraksi dengan berbagai model AI.",
    version="0.1.0"
)

app.include_router(api_router, prefix="/api")

@app.get("/")
async def read_root():
    return {"message": "Selamat datang di AI Model API. Kunjungi /docs untuk dokumentasi API."}

# Untuk menjalankan aplikasi (biasanya dari terminal):
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000