from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
import os

def run_gemini_chain(prompt: str) -> str:
    llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=os.getenv("GOOGLE_API_KEY"))
    template = PromptTemplate.from_template("Jawab dengan ringkas: {question}")
    chain = LLMChain(llm=llm, prompt=template)
    return chain.run({"question": prompt})
