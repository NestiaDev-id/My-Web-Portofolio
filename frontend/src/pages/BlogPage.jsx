import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Menu, X, Clipboard } from "lucide-react";

const BlogPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fungsi untuk menyalin teks
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen mt-16 p-4 bg-gray-900 text-gray-200 relative">
      {/* Hamburger Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-lg"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={24} className="text-white" />
      </button>

      {/* Overlay untuk mode mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 p-6 shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        {/* Tombol Close di Mode Mobile */}
        <button
          className="md:hidden absolute top-4 right-4 text-white"
          onClick={() => setIsOpen(false)}
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold mb-4">NestiaDev</h2>
        <nav className="space-y-2">
          <Link to="#" className="block text-gray-300 hover:text-white">
            Wajib BACA!
          </Link>
          <Link to="#" className="block text-blue-400 font-semibold">
            Login Dengan Social
          </Link>
          <Link to="#" className="block text-gray-300 hover:text-white">
            Daftar Menggunakan Email
          </Link>
          <Link to="#" className="block text-gray-300 hover:text-white">
            Login dengan Email OTP
          </Link>
          <Link to="#" className="block text-gray-300 hover:text-white">
            Login Dengan Email Dan Password
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h1 className="text-4xl font-bold">Login Dengan Social</h1>
        <p className="mt-2 text-gray-400">
          Cara Login dengan Social Media (Google, Discord, Twitter)
        </p>

        {/* Syarat */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold">Syarat:</h2>
          <p className="mt-2 flex items-center">
            ✅ Akun Social Media kamu harus sudah ada dan{" "}
            <strong>logged in</strong> di browser yang digunakan.
          </p>
        </div>

        {/* Langkah-Langkah */}
        <h2 className="text-2xl font-bold mt-6">
          Langkah 1: Buka Halaman Login
        </h2>
        <ul className="mt-2 space-y-2 list-decimal list-inside">
          <li>
            <strong>Klik tombol Login</strong> di pojok kanan atas situs.
          </li>
          <li>Akan muncul pop-up dengan pilihan Login.</li>
        </ul>

        {/* Blok Kode dengan Tombol Copy */}
        <div className="relative mt-6 bg-gray-800 p-4 rounded-lg">
          <button
            className="absolute top-2 right-2 bg-gray-700 text-white p-1 rounded"
            onClick={() => handleCopy("console.log('Hello, World!');")}
          >
            {copied ? "✔" : <Clipboard size={18} />}
          </button>
          <pre className="text-sm text-gray-300 overflow-x-auto">
            <code>console.log('Hello, World!');</code>
          </pre>
        </div>

        {/* Gambar */}
        <div className="mt-6">
          <h2 className="text-xl font-bold">Gambar Contoh:</h2>
          <img
            src="https://via.placeholder.com/800x400"
            alt="Contoh"
            className="mt-2 rounded-lg border border-gray-700"
          />
        </div>

        {/* Upload File (Future Feature) */}
        <div className="mt-6">
          <h2 className="text-xl font-bold">Upload File:</h2>
          <input
            type="file"
            className="mt-2 bg-gray-800 p-2 rounded text-gray-300"
          />
        </div>
      </main>

      {/* Right Panel - Dihilangkan di Mobile */}
      <aside className="hidden md:block w-64 bg-gray-800 p-6">
        <h2 className="text-lg font-bold mb-4">Syarat:</h2>
        <ul className="space-y-2">
          <li>
            <Link to="#" className="text-blue-400 hover:text-white">
              Langkah 1: Buka Halaman Login
            </Link>
          </li>
          <li>
            <Link to="#" className="text-blue-400 hover:text-white">
              Langkah 2: Pilih Metode Social Login
            </Link>
          </li>
        </ul>
        <div className="mt-6">
          <a
            href="#"
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <BookOpen size={18} /> Edit on GitHub
          </a>
        </div>
      </aside>
    </div>
  );
};

export default BlogPage;
