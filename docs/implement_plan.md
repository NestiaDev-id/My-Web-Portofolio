# Rencana Implementasi AI Portfolio (NestiaDev)

> **Visi:** Asisten AI pribadi NestiaDev yang otomatis hafal CV developer, bisa menerima dokumen tugas dari client, dan secara cerdas mempromosikan jasa NestiaDev.

---

## Status Audit Kode Saat Ini

Berikut perbandingan rencana sebelumnya vs kondisi kode di `llm-service/`:

| # | Item Rencana | Status | Catatan |
|---|---|---|---|
| 1 | **Pengamanan Upload** (token protection) | ✅ Sudah | Endpoint `/upload` dilindungi `X-Upload-Token` header. Tanpa token → 401/403 |
| 2 | **Pre-indexing CV** (startup event) | ✅ Sudah | `@app.on_event("startup")` membaca `data/cv_nestia.txt` → ChromaDB |
| 3 | **File `cv_nestia.txt`** | ⚠️ Parsial | File ada (608 bytes), tapi isinya masih **sangat minim** — hanya skill dasar dan kontak. Belum ada: pengalaman kerja, proyek, pendidikan, sertifikasi, dll |
| 4 | **Prompt Persona** (AI berbicara sebagai asisten NestiaDev) | ✅ Sudah | Template di `llm.py` sudah berbahasa Indonesia dan menyebut "Asisten AI pribadi portfolio NestiaDev" |
| 5 | **Fallback saat dokumen kosong** (tidak error 400) | ✅ Sudah | `main.py` tidak lagi melempar HTTPException saat `documents == []` |
| 6 | **CORS Middleware** | ✅ Sudah | `allow_origins=["*"]` sudah aktif |
| 7 | **Frontend ↔ Backend parameter sync** | ❌ Belum | Frontend punya setting `model`, `temperature`, `topP`, `seed`, `maxTokens`, `systemPrompt` — tapi **tidak ada satupun yang dikirim ke backend**. Semua di-hardcode di backend |
| 8 | **Client upload dokumen tugas** | ❌ Belum | Upload ada tapi dilindungi token (client biasa tidak bisa pakai). Perlu alur baru khusus client |

---

## Arsitektur Baru: Dual-Collection

Masalah utama saat ini: jika client upload dokumen, data mereka akan **tercampur** dengan data CV NestiaDev. Solusinya adalah memisahkan data ke dalam 2 jenis koleksi ChromaDB:

```
┌─────────────────────────────────────────────────┐
│                   ChromaDB                       │
│                                                   │
│  ┌──────────────────┐  ┌──────────────────────┐  │
│  │ Collection:       │  │ Collection:           │  │
│  │ "chat_nestia"     │  │ "chat_client_{uuid}"  │  │
│  │ (CV, read-only)   │  │ (tugas client, temp)  │  │
│  └──────────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────┘
```

- **`chat_nestia`** — Diisi otomatis saat startup dari `cv_nestia.txt`. Tidak bisa ditulis oleh client.
- **`chat_client_{session_id}`** — Dibuat per session. Client bisa upload file `.doc`/`.txt` ke sini. Data ini bersifat **ephemeral** (hilang saat Space restart), sehingga tidak meracuni data CV permanen.

Saat menjawab pertanyaan, AI akan melakukan pencarian di **kedua koleksi** lalu menggabungkan hasilnya.

---

## Tugas-Tugas Implementasi

### Fase 1: Perkaya Data CV
**File:** `llm-service/data/cv_nestia.txt`

Data saat ini sangat minim. Perlu ditambahkan:
- [ ] Nama lengkap, lokasi, umur
- [ ] Riwayat pendidikan (universitas, jurusan, tahun)
- [ ] Pengalaman kerja / freelance
- [ ] Daftar proyek + deskripsi singkat masing-masing
- [ ] Tech stack lengkap (backend, frontend, mobile, devops, database)
- [ ] Sertifikasi / penghargaan (jika ada)
- [ ] Informasi harga jasa / cara hire (opsional)
- [ ] Fun facts / personality yang ingin ditonjolkan

> **PENTING:** Ini adalah bagian **paling kritis**. Kualitas jawaban AI 100% bergantung pada kelengkapan data ini.

---

### Fase 2: Dual-Collection Search di Backend
**File:** `llm-service/main.py`

- [ ] Modifikasi endpoint `POST /chat` agar mencari di 2 koleksi:
  1. Koleksi CV (`RAG_COLLECTION_ID` = `"nestia"`)
  2. Koleksi client (`"client_{session_id}"`)
- [ ] Gabungkan hasil pencarian dari kedua koleksi, lalu kirim ke LLM
- [ ] Jika kedua koleksi kosong → AI tetap menjawab sebagai asisten NestiaDev (fallback)

---

### Fase 3: Endpoint Upload Khusus Client (Tanpa Token)
**File:** `llm-service/main.py`

Saat ini `/upload` memerlukan `X-Upload-Token`. Kita butuh endpoint baru untuk client:

- [ ] Buat endpoint baru `POST /upload-task` yang **tidak memerlukan token**
- [ ] Endpoint ini menyimpan dokumen ke koleksi `"client_{session_id}"` (bukan ke koleksi CV)
- [ ] Tambahkan validasi keamanan ringan:
  - Batasi ukuran file (maks 5MB)
  - Batasi tipe file (hanya `.txt`, `.doc`, `.docx`, `.pdf`)
  - Rate limit (opsional, di level Hugging Face Spaces)

Endpoint lama `/upload` (dengan token) tetap dipertahankan untuk admin.

---

### Fase 4: Modifikasi Prompt untuk 3 Skenario
**File:** `llm-service/app/services/llm.py`

AI harus bisa menangani 3 skenario berbeda:

| Skenario | Konteks CV | Konteks Client | Perilaku yang Diharapkan |
|---|---|---|---|
| Sapaan biasa ("Hai") | Kosong/ada | Kosong | Menyapa balik + memperkenalkan NestiaDev |
| Pertanyaan tentang NestiaDev | Ada | Kosong | Menjawab berdasarkan CV |
| Client upload tugas lalu bertanya | Ada/kosong | Ada | Membantu analisis tugas + mempromosikan NestiaDev jika relevan |

- [ ] Perbarui template `PROMPT` agar mencakup instruksi:
  - Selalu memperkenalkan diri sebagai asisten NestiaDev
  - Jika ada konteks tugas client → bantu analisis, beri saran, lalu promosikan NestiaDev
  - Jangan mengarang data yang tidak ada di konteks

---

### Fase 5: Sinkronisasi Parameter Frontend ↔ Backend
**File:** `src/utils/rag.ts`, `src/pages/ChatMe.tsx`, `llm-service/main.py`, `llm-service/app/models/schemas.py`

Saat ini frontend punya banyak setting (model, temperature, topP, seed, maxTokens, systemPrompt) tapi **tidak ada yang dikirim ke backend**. Ada 2 opsi:

**Opsi A (Direkomendasikan): Hapus setting yang tidak relevan dari frontend**
- Model sudah ditentukan di backend (`Mistral-7B-Instruct-v0.2`)
- Parameter seperti temperature, topP sudah di-hardcode di `llm.py`
- Frontend cukup mengirim `question` dan `session_id` (seperti sekarang)
- Hapus UI setting model/parameter yang membingungkan user

**Opsi B: Kirim parameter ke backend**
- Tambahkan field `temperature`, `top_p`, `max_tokens` di `ChatRequest` schema
- Teruskan parameter tersebut ke `generate_answer()`
- Risiko: client bisa mengatur temperature tinggi → jawaban ngawur

> **TIP:** **Opsi A lebih aman** untuk web portfolio publik. Setting AI sebaiknya dikontrol sepenuhnya oleh developer (Anda), bukan pengunjung.

---

### Fase 6: Tombol Upload di Frontend
**File:** `src/pages/ChatMe.tsx`, `src/utils/rag.ts`

- [ ] Tambahkan tombol 📎 (attachment) di sebelah input chat
- [ ] Saat diklik, buka file picker (accept: `.txt, .doc, .docx, .pdf`)
- [ ] Panggil endpoint `POST /upload-task` (bukan `/upload`)
- [ ] Tampilkan status upload (loading, success, error) di chat bubble
- [ ] Setelah upload berhasil, otomatis kirim pesan: *"Saya sudah upload dokumen [nama file]. Bisakah kamu menganalisisnya?"*

---

### Fase 7: Deployment & Testing
- [ ] Push perubahan backend ke repo Hugging Face Spaces
- [ ] Pastikan Space status **Public**
- [ ] Verifikasi `cv_nestia.txt` ter-index saat startup (cek log)
- [ ] Test skenario:
  - Kirim "Hai" → AI memperkenalkan NestiaDev
  - Kirim "Apa skill NestiaDev?" → AI menjawab dari CV
  - Upload file tugas → tanya tentang isinya → AI membantu + promosi NestiaDev
- [ ] Pastikan URL di `src/utils/rag.ts` sudah benar (`nestiadev-llm-service.hf.space`)

---

## Prioritas Pengerjaan

```
1. Fase 1 (Perkaya CV)         ← Paling kritis, harus duluan
2. Fase 4 (Prompt Engineering)  ← Agar AI bisa ngobrol tanpa error
3. Fase 2 (Dual-Collection)     ← Pemisahan data CV vs client
4. Fase 3 (Upload endpoint)     ← Baru bisa setelah Fase 2
5. Fase 5 (Sync parameter)      ← Cleanup frontend
6. Fase 6 (Tombol upload FE)    ← Baru bisa setelah Fase 3
7. Fase 7 (Deploy & test)       ← Terakhir
```