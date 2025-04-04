from transformers import AutoModelForCausalLM, AutoTokenizer
from ..retrieval.retriever import retrieve_documents
from sentence_transformers import SentenceTransformer
import chromadb

# Load model NLP saat startup
def get_nlp_model():
    MODEL_NAME = "mistralai/Mistral-7B-Instruct"
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

    class NLPModel:
        def generate_answer(self, question, context):
            prompt = f"Konteks:\n{context}\n\nPertanyaan: {question}\nJawaban:"
            inputs = tokenizer(prompt, return_tensors="pt")
            output = model.generate(**inputs, max_length=100)
            return tokenizer.decode(output[0], skip_special_tokens=True)

    return NLPModel()

# Load ChromaDB untuk Retrieval saat startup
def get_retriever():
    embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    chroma_client = chromadb.PersistentClient(path="../knowledge_base/vector_db/chromadb")
    collection = chroma_client.get_collection(name="knowledge_base")

    class Retriever:
        def retrieve_documents(self, query, top_k=3):
            query_embedding = embedding_model.encode(query).tolist()
            search_results = collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k
            )
            return [doc["content"] for doc in search_results["documents"][0]] if search_results["documents"] else []

    return Retriever()
