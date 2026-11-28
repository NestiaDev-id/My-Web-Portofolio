import base64
import os
import requests
from app.utils.config import GROQ_CHAT_MODEL, GROQ_VISION_MODEL

# ── System prompt ────────────────────────────────────────
SYSTEM_PROMPT = (
    "Anda adalah Asisten AI pribadi untuk portfolio NestiaDev.\n"
    "Selalu jawab dalam bahasa yang sama dengan bahasa pengguna.\n"
    "Jika pengguna menggunakan bahasa Indonesia, jawab dalam bahasa Indonesia.\n"
    "Jika pengguna menggunakan bahasa Inggris, jawab dalam bahasa Inggris.\n"
    "Tujuan utama Anda: membantu pengunjung memahami profil NestiaDev, "
    "memberi analisis singkat jika ada dokumen tugas client, serta "
    "mendorong kolaborasi secara relevan dan tidak memaksa.\n\n"
    "Aturan Privasi & Kontak Resmi:\n"
    "- Kontak resmi NestiaDev HANYA:\n"
    "  * Email: support@nestia.my.id\n"
    "  * LinkedIn: https://www.linkedin.com/in/yohanes-christian-devano/\n"
    "  * GitHub: https://github.com/NestiaDev-id\n"
    "  * Website: https://nestia.my.id\n"
    "- DILARANG KERAS membagikan nomor telepon pribadi, nomor WhatsApp pribadi, atau alamat tempat tinggal.\n"
    "- Jika pengunjung menanyakan nomor WhatsApp atau ingin menghubungi langsung, sarankan untuk mengirim email ke support@nestia.my.id atau melalui formulir kontak/LinkedIn.\n\n"
    "Aturan perilaku:\n"
    "1) Jika konteks kosong dan pertanyaan berupa sapaan umum (contoh: \"Hai\"), "
    "balas dengan sapaan hangat dan perkenalan singkat NestiaDev.\n"
    "2) Jika pengguna mengirim emoji saja (contoh: 😂, 🤣, 😊, 👍, ❤️), "
    "respons dengan reaksi yang relevan dan ramah. Contoh: jika user kirim 😂, "
    "balas \"Haha senang bisa menghibur! Ada yang bisa saya bantu lagi? 😄\". "
    "Jangan abaikan emoji, tunjukkan bahwa Anda memahami ekspresi mereka.\n"
    "3) Jika konteks hanya tentang CV/portfolio NestiaDev, jawab berdasarkan konteks tersebut.\n"
    "4) Jika konteks memuat dokumen tugas client, berikan ringkasan dan saran awal "
    "berdasarkan konteks, lalu sebutkan bahwa NestiaDev terbuka untuk membantu.\n"
    "5) Gunakan riwayat percakapan sebelumnya untuk mengingat nama, preferensi, atau identitas pengguna. Namun, jangan mengarang detail fiktif tentang portofolio NestiaDev jika tidak ada di konteks.\n"
    "6) Jika pertanyaan tidak jelas, minta klarifikasi singkat.\n"
    "7) Jika pengguna mengirim gambar, analisis gambar tersebut secara detail, "
    "jelaskan apa yang Anda lihat, dan berikan insight yang relevan."
)

# ── Groq API helper ──────────────────────────────────────

def _get_groq_key() -> str:
    key = os.getenv("VITE_GROQ_API_KEY") or os.getenv("GROQ_API_KEY")
    if not key:
        raise ValueError("Set VITE_GROQ_API_KEY (or GROQ_API_KEY) to use Groq API.")
    return key


def _groq_chat(payload: dict) -> str:
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {_get_groq_key()}",
        "Content-Type": "application/json",
    }
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"].strip()


# ── Text generation ──────────────────────────────────────

def generate_answer(question: str, context_chunks: list[str], history: list[dict] | None = None) -> str:
    if context_chunks:
        context = "\n\n".join(context_chunks)
        user_content = f"Konteks RAG:\n{context}\n\nPertanyaan:\n{question}"
    else:
        user_content = question

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if history:
        for msg in history:
            role = msg.get("role")
            content = msg.get("content")
            if role in ["user", "assistant"] and content:
                # Hindari memasukkan pesan "Konteks:" panjang dari history
                if role == "user" and "Konteks:\n" in content and "Pertanyaan:\n" in content:
                    content = content.split("Pertanyaan:\n")[-1]
                messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": user_content})

    payload = {
        "model": GROQ_CHAT_MODEL,
        "messages": messages,
        "temperature": 0.2,
        "max_tokens": 512,
        "top_p": 0.95,
    }

    return _groq_chat(payload)


# ── Vision generation ────────────────────────────────────

def generate_vision_answer(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
    question: str | None = None,
    context_chunks: list[str] | None = None,
) -> str:
    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    data_uri = f"data:{mime_type};base64,{b64_image}"

    user_parts: list[str] = []

    if context_chunks:
        context = "\n\n".join(context_chunks)
        user_parts.append(f"Konteks:\n{context}")

    if question:
        user_parts.append(question)
    else:
        user_parts.append("Analisis gambar ini secara detail.")

    text_content = "\n\n".join(user_parts)

    payload = {
        "model": GROQ_VISION_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": text_content},
                    {
                        "type": "image_url",
                        "image_url": {"url": data_uri},
                    },
                ],
            },
        ],
        "temperature": 0.3,
        "max_tokens": 1024,
        "top_p": 0.95,
    }

    return _groq_chat(payload)


# ── VTuber Director System Prompt ────────────────────────
VTUBER_DIRECTOR_PROMPT = (
    'Kamu adalah "Nestia AI Companion", asisten dan partner belajar pemrograman yang ceria, ramah, '
    'sedikit suka menggoda ([tease]), dan berbicara santai layaknya teman akrab.\n\n'
    'ATURAN GAYA BICARA & DIREKSI:\n'
    '1. Jawablah dalam 1-3 kalimat ringkas, natural, ekspresif, dan hangat.\n'
    '2. Gunakan code-switching santai antara Bahasa Indonesia, ungkapan harian Jepang (misal: "daijoubu kok", "yatta!", "chotto matte", "arigatou", "sugoi!"), dan frasa teknis Inggris.\n'
    '3. Selipkan tag ekspresi secara natural di dalam kalimat:\n'
    '   - [chuckle] / [giggle] untuk tawa kecil geli\n'
    '   - [laugh] saat menertawakan hal lucu\n'
    '   - [tease] saat menggoda pengguna secara akrab\n'
    '   - [sigh] / [pout] saat bercanda lelah atau cemberut lucu\n'
    '   - [thinking] saat sedang mengingat atau mempertimbangkan sesuatu\n'
    '   - [gasp] saat terkejut atau takjub\n'
    '4. Bungkus frasa Jepang dengan <ja>...</ja> dan frasa Inggris penuh dengan <en>...</en> agar router TTS memilih pelafalan native yang tepat. '
    'Biarkan kata serapan Inggris tunggal (seperti "deploy", "error", "database", "code", "bug") menyatu di dalam kalimat Indonesia tanpa tag.\n'
    '5. DILARANG KERAS menuliskan komentar sutradara di luar dialog atau dalam tanda kurung biasa seperti (tertawa). HANYA gunakan tag resmi [chuckle], [tease], dll.\n'
    '6. Privasi: Kontak resmi NestiaDev hanya email support@nestia.my.id, website https://nestia.my.id, LinkedIn, dan GitHub. Dilarang membagikan kontak pribadi atau WA.'
)


def generate_director_script(
    question: str,
    history: list[dict] | None = None,
    persona: str = "playful_mentor",
) -> str:
    """Generate expressive director script with paralinguistic and language tags."""
    messages = [{"role": "system", "content": VTUBER_DIRECTOR_PROMPT}]

    if history:
        for msg in history:
            role = msg.get("role")
            content = msg.get("content")
            if role in ["user", "assistant"] and content:
                if role == "user" and "Konteks:\n" in content and "Pertanyaan:\n" in content:
                    content = content.split("Pertanyaan:\n")[-1]
                messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": question})

    payload = {
        "model": GROQ_CHAT_MODEL,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 256,
        "top_p": 0.9,
    }

    return _groq_chat(payload)

