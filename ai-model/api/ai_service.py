from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import chromadb
from sentence_transformers import SentenceTransformer

# Inisialisasi FastAPI
app = FastAPI(title="AI Service API", version="1.0")

# Load tokenizer & model NLP (misalnya Mistral)
MODEL_NAME = "mistralai/Mistral-7B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

# Load embedding model untuk pencarian RAG
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Load ChromaDB untuk knowledge base
chroma_client = chromadb.PersistentClient(path="./knowledge_base/vector_db/chromadb")
collection = chroma_client.get_collection(name="knowledge_base")

# Model request input
class QueryRequest(BaseModel):
    question: str

# Model response output
class QueryResponse(BaseModel):
    question: str
    answer: str
    sources: list

@app.post("/query", response_model=QueryResponse)
def query_model(request: QueryRequest):
    question = request.question

    # 1️⃣ Buat embedding dari pertanyaan
    query_embedding = embedding_model.encode(question).tolist()

    # 2️⃣ Cari dokumen terkait di ChromaDB (jika ada)
    search_results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3  # Ambil 3 dokumen paling relevan
    )

    sources = []
    context = ""

    if search_results["documents"]:
        for doc in search_results["documents"][0]:  # Ambil dokumen pertama
            sources.append(doc["filename"])
            context += doc["content"] + "\n"

    # 3️⃣ Buat prompt untuk model dengan konteks dari RAG
    prompt = f"Konteks:\n{context}\n\nPertanyaan: {question}\nJawaban:"

    # 4️⃣ Gunakan model NLP untuk menghasilkan jawaban
    inputs = tokenizer(prompt, return_tensors="pt")
    output = model.generate(**inputs, max_length=100)
    answer = tokenizer.decode(output[0], skip_special_tokens=True)

    return QueryResponse(question=question, answer=answer, sources=sources)

@app.get("/")
def root():
    return {"message": "AI Service is running!"}

