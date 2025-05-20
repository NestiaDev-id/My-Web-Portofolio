import os
import nltk

from langchain_google_genai import (
    ChatGoogleGenerativeAI,
    GoogleGenerativeAIEmbeddings,
)
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_text_splitters import NLTKTextSplitter
from langchain_community.vectorstores import Chroma
from langchain.document_loaders import PyPDFLoader
from dotenv import load_dotenv
import glob


load_dotenv()  # load .env if not loaded globally

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PDF_PATH = os.path.join(BASE_DIR, "docs", "10_Penerapan Algoritma Genetika Untuk Optimasi penjadwalan pada mts negeri 1 pangkalpinang.pdf")
if not os.path.exists(PDF_PATH):
    raise FileNotFoundError(f"PDF file tidak ditemukan di path: {PDF_PATH}")

CHROMA_PATH = "./chroma_db"
API_KEY = os.getenv("GOOGLE_API_KEY")


def load_documents():
    loader = PyPDFLoader(PDF_PATH)
    
    pages = loader.load_and_split()
    splitter = NLTKTextSplitter(chunk_size=1000, chunk_overlap=0)
    return splitter.split_documents(pages)


def setup_vectorstore(docs):
    embedding_model = GoogleGenerativeAIEmbeddings(
        google_api_key=API_KEY, model="models/embedding-001"
    )
    db = Chroma.from_documents(
        docs, embedding=embedding_model, persist_directory=CHROMA_PATH
    )
    db.persist()
    return db


def get_retriever():
    embedding_model = GoogleGenerativeAIEmbeddings(
        google_api_key=API_KEY, model="models/embedding-001"
    )
    db = Chroma(
        persist_directory=CHROMA_PATH,
        embedding_function=embedding_model,
    )
    return db.as_retriever(search_kwargs={"k": 4})


def get_answer(query: str) -> str:
    retriever = get_retriever()

    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-pro-latest",
        google_api_key=API_KEY,
        temperature=0.7,
    )

    qa_chain = RetrievalQA.from_chain_type(
        llm=llm, retriever=retriever, return_source_documents=True
    )

    result = qa_chain.invoke({"query": query})
    return result["result"]

if __name__ == "__main__":
    docs = load_documents()
    setup_vectorstore(docs)
    response = get_answer("Jelaskan apa itu algoritma genetika?")
    print(response)
