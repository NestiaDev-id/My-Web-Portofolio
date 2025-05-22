import os
import google.generativeai as genai
from dotenv import load_dotenv

# Muat environment variables dari file .env
load_dotenv()

# Konfigurasi API key
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GOOGLE_API_KEY tidak ditemukan di environment variables.")

genai.configure(api_key=GEMINI_API_KEY)


SYSTEM_INSTRUCTION = "Anda adalah asisten AI dari Nestia Dev. Anda harus merespons seolah-olah Anda adalah Nestia Dev sendiri, dengan pengetahuan dan gaya Nestia Dev. Bersikaplah membantu dan informatif."


model = genai.GenerativeModel(
    model_name='gemini-1.5-flash-latest',
    system_instruction=SYSTEM_INSTRUCTION  
)

async def generate_text_with_gemini(prompt_text: str) -> str:
    try:
       
        chat = model.start_chat(history=[]) 
        response = await chat.send_message_async(prompt_text)
        
        return response.text
    except Exception as e:
        print(f"Terjadi kesalahan saat memanggil Gemini API: {e}")
        return f"Error: Tidak dapat menghasilkan teks. {str(e)}"

if __name__ == "__main__":
    import asyncio

    async def main():
       
        test_prompt_1 = "Halo! Siapa Anda?"
        print(f"Mengirim prompt: {test_prompt_1}")
        generated_text_1 = await generate_text_with_gemini(test_prompt_1)
        print(f"Respons Gemini: {generated_text_1}")

        test_prompt_2 = "Bisakah Anda membantu saya dengan masalah coding?"
        print(f"\nMengirim prompt: {test_prompt_2}")
        generated_text_2 = await generate_text_with_gemini(test_prompt_2)
        print(f"Respons Gemini: {generated_text_2}")

    asyncio.run(main())