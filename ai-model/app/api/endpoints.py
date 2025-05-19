from fastapi import APIRouter
from app.schemas.prompt_schema import PromptRequest, PromptResponse
from app.llm.gemini_chain import run_gemini_chain

router = APIRouter()

@router.post("/generate", response_model=PromptResponse)
async def generate_text(prompt: PromptRequest):
    output = run_gemini_chain(prompt.prompt)
    return PromptResponse(response=output)
