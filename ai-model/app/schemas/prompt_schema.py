from pydantic import BaseModel

class PromptRequest(BaseModel):
    """
    Skema untuk permintaan prompt.
    Mengharapkan field 'prompt' bertipe string.
    """
    prompt: str

class TextResponse(BaseModel):
    """
    Skema untuk respons teks.
    Mengharapkan field 'generated_text' bertipe string.
    """
    generated_text: str

# Anda bisa menambahkan skema Pydantic lainnya di sini jika diperlukan.