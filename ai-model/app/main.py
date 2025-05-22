from fastapi import FastAPI
from app.api.endpoints import router as api_router
from dotenv import load_dotenv

# Load .env untuk pengembangan lokal. Vercel akan menggunakan environment variables-nya sendiri.
load_dotenv()

app = FastAPI(
    title="AI Model API",
    description="API untuk berinteraksi dengan berbagai model AI.",
    version="0.1.0"
)

app.include_router(api_router, prefix="/api")

@app.get("/")
async def read_root():
    return {"message": "Selamat datang di AI Model API. Kunjungi /docs atau /api/docs untuk dokumentasi API."}

# Tidak perlu `uvicorn.run(app, ...)` di sini, Vercel akan menanganinya.