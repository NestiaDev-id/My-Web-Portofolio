from fastapi import APIRouter, HTTPException
from app.schemas.prompt_schema import PromptRequest, TextResponse
# Hapus atau komentari impor hf_chain jika tidak lagi digunakan secara langsung di sini
# from app.llm.hf_models import hf_chain 
from app.llm.gemini_chain import generate_text_with_gemini # <--- Impor fungsi baru

router = APIRouter()

# Endpoint yang sudah ada untuk Hugging Face (jika masih ingin dipertahankan)
# @router.post("/generate_text", response_model=TextResponse)
# async def generate_text_endpoint(request: PromptRequest):
#     try:
#         # generated_text = hf_chain.invoke({"question": request.prompt}) # Langchain syntax
#         # Jika hf_chain adalah fungsi biasa yang mengembalikan string:
#         # generated_text = hf_chain(request.prompt) 
#         # Sesuaikan pemanggilan hf_chain berdasarkan implementasinya
#         # Untuk saat ini, kita fokus pada Gemini, jadi Anda bisa mengomentari ini jika tidak ada implementasi hf_chain yang valid
#         return TextResponse(generated_text="Contoh teks dari Hugging Face (perlu implementasi hf_chain)")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate_text_gemini", response_model=TextResponse)
async def generate_text_gemini_endpoint(request: PromptRequest):
    """
    Endpoint untuk menghasilkan teks menggunakan Gemini API.
    Menerima prompt dari user dan mengembalikan teks yang dihasilkan oleh Gemini.
    """
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt tidak boleh kosong.")
    
    try:
        generated_text = await generate_text_with_gemini(request.prompt)
        if "Error:" in generated_text: # Penanganan sederhana jika fungsi Gemini mengembalikan error
            raise HTTPException(status_code=500, detail=generated_text)
        return TextResponse(generated_text=generated_text)
    except HTTPException as http_exc:
        # Melempar kembali HTTPException yang sudah ada (dari validasi prompt atau dari generate_text_with_gemini)
        raise http_exc
    except Exception as e:
        # Menangkap error tak terduga lainnya
        print(f"Terjadi error pada endpoint /generate_text_gemini: {e}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan internal: {str(e)}")

# Anda bisa menambahkan lebih banyak endpoint di sini
@router.get("/healthcheck")
async def healthcheck():
    return {"status": "ok"}
