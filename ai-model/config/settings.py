import os
from dotenv import load_dotenv

# Load variabel lingkungan dari .env
load_dotenv()

class Settings:
    # 🔹 API Config
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", 8000))

    # 🔹 Model NLP
    NLP_MODEL: str = os.getenv("NLP_MODEL", "mistralai/Mistral-7B-Instruct")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

    # 🔹 Retrieval Config
    CHROMA_DB_PATH: str = os.getenv("CHROMA_DB_PATH", "../knowledge_base/vector_db/chromadb")
    TOP_K_RETRIEVAL: int = int(os.getenv("TOP_K_RETRIEVAL", 3))

    # 🔹 API External (Opsional)
    NEWS_API_KEY: str = os.getenv("NEWS_API_KEY", "")
    WIKIPEDIA_API_URL: str = os.getenv("WIKIPEDIA_API_URL", "https://en.wikipedia.org/api/rest_v1/page/summary/")

# Inisialisasi settings global
settings = Settings()
