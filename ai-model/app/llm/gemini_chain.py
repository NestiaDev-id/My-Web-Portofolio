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

# Inisialisasi model GenerativeModel
# Pilih model yang sesuai dengan kebutuhan Anda, misalnya 'gemini-pro' untuk teks
# Untuk daftar model yang tersedia: https://ai.google.dev/gemini-api/docs/models/generative
model = genai.GenerativeModel('gemini-1.5-flash-latest') # atau 'gemini-pro'

async def generate_text_with_gemini(prompt_text: str) -> str:
    """
    Mengirim prompt ke Gemini API dan mengembalikan teks yang dihasilkan.

    Args:
        prompt_text: Teks prompt yang akan dikirim ke model.

    Returns:
        Teks yang dihasilkan oleh model Gemini.
    """
    try:
        # Membuat konten untuk dikirim ke model
        # Untuk kasus penggunaan yang lebih kompleks (misalnya chat), Anda bisa menggunakan start_chat()
        # response = model.generate_content(prompt_text)
        
        # Jika Anda ingin menggunakan versi chat (untuk percakapan multi-turn)
        chat = model.start_chat(history=[])
        response = await chat.send_message_async(prompt_text)
        
        # Pastikan untuk mengakses teks dari respons dengan benar
        # Terkadang, respons mungkin memiliki beberapa kandidat atau bagian
        # Periksa dokumentasi Gemini API untuk struktur respons yang tepat
        # Untuk 'gemini-1.5-flash-latest' dan 'gemini-pro', biasanya 'response.text' sudah cukup
        return response.text
    except Exception as e:
        print(f"Terjadi kesalahan saat memanggil Gemini API: {e}")
        # Anda mungkin ingin menangani error ini dengan cara yang lebih baik,
        # misalnya dengan melempar kembali error atau mengembalikan pesan error khusus.
        return f"Error: Tidak dapat menghasilkan teks. {str(e)}"

# Contoh penggunaan (opsional, untuk testing langsung file ini)
if __name__ == "__main__":
    import asyncio

    async def main():
        test_prompt = "Ceritakan sebuah fakta menarik tentang Indonesia."
        print(f"Mengirim prompt: {test_prompt}")
        generated_text = await generate_text_with_gemini(test_prompt)
        print(f"Respons Gemini: {generated_text}")

    asyncio.run(main())