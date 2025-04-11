"use client";

import { useState } from "react";

export default function HomePage() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/groq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      console.log(data);
      setResponse(data.result.content || "Tidak ada respons dari AI.");
    } catch (err) {
      console.error("Gagal mendapatkan respons dari AI", err);
      setResponse("Terjadi kesalahan saat memproses permintaan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Asisten NestiaDev</h1>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Tanyakan sesuatu..."
        className="w-full border rounded-xl p-4 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <button
        onClick={handleAsk}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {loading ? "Memproses..." : "Tanyakan"}
      </button>

      {response && (
        <div className="bg-gray-100 p-4 rounded-xl border text-gray-800 whitespace-pre-line">
          {response}
        </div>
      )}
    </main>
  );
}
