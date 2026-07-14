# Rencana Redesign Portofolio: Persona 5 Style 🎭

Tujuan dari dokumen ini adalah merencanakan langkah-langkah sistematis untuk mengubah antarmuka (UI) web portofolio NestiaDev saat ini menjadi gaya ikonik dari game **Persona 5**, tanpa menghilangkan data statis (pengalaman, proyek, skill) maupun fungsionalitas cerdas (AI Chatbot) yang sudah ada.

## 🎨 Analisis Estetika Persona 5 (UI/UX)
Desain Persona 5 sangat khas dan berani. Kita akan mengadopsi elemen-elemen berikut ke dalam Tailwind CSS / React kita:
1. **Palet Warna Ekstrem:** Dominasi warna Merah Terang (`#FF0000` / `#E60012`), Hitam Pekat (`#000000`), dan Putih Bersih (`#FFFFFF`), dengan aksen abu-abu/kuning.
2. **Tipografi "Ransom Note":** Penggunaan *font* yang tebal, miring, dan terkesan asimetris/tidak beraturan (seperti tulisan potong-tempel).
3. **Bentuk Miring & Asimetris:** Kotak, tombol, dan pembatas konten tidak berbentuk kotak lurus biasa, melainkan diputar (skewed / rotated) atau menggunakan *clip-path*.
4. **Animasi & Transisi Dinamis:** Elemen UI melesat cepat masuk ke layar, efek "*glitch*", bintang-bintang (*stars/halftones*), dan transisi layar berani.

## 🛠️ Langkah Implementasi (Fase per Fase)

### Fase 1: Persiapan Aset & *Styling Base*
*   [ ] Memeriksa folder `persona5-style-portfolio-main/` untuk mengekstrak aset-aset penting (gambar background, *font* khusus, *pattern* halftone).
*   [ ] Memindahkan aset-aset tersebut ke folder `public/` atau `src/assets/` di proyek utama React kita.
*   [ ] Mengubah konfigurasi `index.css` dan Tailwind:
    *   Mendefinisikan *Custom Colors* (P5 Red, P5 Black, P5 White).
    *   Mengatur ulang *Custom Fonts* di `index.css`.
    *   Mendefinisikan kelas animasi dasar (seperti *shake*, *glitch*, atau *skew*).

### Fase 2: Redesign Komponen Utama (Layouting)
*   [ ] **Navbar / Header:** Mengubah menu menjadi potongan-potongan asimetris berwarna hitam/merah.
*   [ ] **Hero Section (Halaman Depan):** Mengubah perkenalan diri dengan tipografi besar dan dinamis, mungkin dengan gambar karakter bergaya siluet atau *comic book*.
*   [ ] **Background:** Mengubah *background* statis menjadi pola bintang-bintang (*star pattern*) bergerak atau warna solid berani ala UI Persona.

### Fase 3: Migrasi Data Statis ke Desain Baru
*   [ ] **Bagian Skill / Tech Stack:** Menampilkan keahlian dalam bentuk kartu (card) miring yang merespons secara berani saat di-*hover*.
*   [ ] **Bagian Proyek (Portfolio):** Menampilkan galeri proyek dengan transisi tebal dan garis tepi (border) hitam pekat bergaya komik.
*   [ ] **Bagian Pengalaman / Timeline:** Mendesain ulang *timeline* konvensional menjadi jejak yang dinamis.

### Fase 4: Integrasi Fitur AI (ChatMe) ke Tema P5
Fitur *chatbot* AI kita (`/chatme`) adalah senjata utama. Kita harus membuatnya senada:
*   [ ] Mengubah warna `ChatBubble` agar sesuai dengan palet P5 (misal: *bubble* merah untuk *user*, hitam/putih tajam untuk AI).
*   [ ] Memberikan efek *skew* ringan pada kotak input teks.

## ⚠️ Tantangan yang Harus Diperhatikan
*   **Responsivitas (Mobile-Friendly):** Desain miring/asimetris biasanya sulit diatur di layar kecil (HP). Kita harus sangat hati-hati menggunakan *Tailwind breakpoints*.
*   **Aksesibilitas (Readability):** Tipografi tebal dan asimetris bisa sulit dibaca jika teksnya panjang. Kita harus menyeimbangkan antara *"style"* dan keterbacaan, terutama di bagian deskripsi proyek.

---
**Status Saat Ini:** Menunggu persetujuan pengguna untuk memulai Fase 1 (Ekstraksi Aset & Penyesuaian Tailwind).
