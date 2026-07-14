# Panduan Deploy ke Hugging Face Spaces

Karena proyek ini adalah sebuah *monorepo* (gabungan antara Frontend web dan Backend LLM), kita tidak bisa melakukan *push* seluruh proyek ke Hugging Face. Hugging Face Spaces hanya membutuhkan kode backend yang berada di dalam folder `llm-service`.

Oleh karena itu, kita menggunakan teknik **Git Subtree** untuk memotong (*split*) folder tersebut dan mengirimkannya ke remote Hugging Face.

## Langkah-langkah Commit dan Push

Setiap kali Anda selesai mengedit kode di dalam folder `llm-service/` dan ingin memperbaruinya di server Hugging Face, ikuti urutan perintah berikut di terminal (pastikan Anda berada di direktori root `My-Web-Portofolio`):

### 1. Simpan (Commit) Perubahan ke Git Lokal
Pertama, simpan semua perubahan Anda di branch utama proyek Anda (misalnya branch `main` lokal).
```bash
git add .
git commit -m "chore(llm): penjelasan perubahan yang Anda lakukan"
```

### 2. Potong (Split) Folder `llm-service` ke Branch Baru
Perintah ini akan mengambil **hanya** isi dari folder `llm-service` dan memasukkannya ke dalam sebuah *branch* sementara bernama `hf-deploy`.
```bash
git subtree split --prefix llm-service -b hf-deploy
```

### 3. Push ke Hugging Face
Kirimkan branch `hf-deploy` yang berisi potongan backend tersebut ke *remote* `huggingface` (Hugging Face Spaces) dan jadikan sebagai branch `main` di sana.
```bash
git push huggingface hf-deploy:main
```

---

**Catatan Penting:**
*   Pastikan Anda sudah pernah menambahkan URL *remote* Hugging Face sebelumnya dengan nama `huggingface` (contoh: `git remote add huggingface https://huggingface.co/spaces/NestiaDev/llm-service`).
*   Proses *build* di Hugging Face Spaces biasanya memakan waktu sekitar 1-3 menit setelah perintah `push` berhasil.
