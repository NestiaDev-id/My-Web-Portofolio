import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const ChatApp = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: "NestiaDev", text: "Tanyakan padaku sesuatu!" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto scroll ke bawah saat ada pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: messages.length + 1, sender: "You", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("https://api.groq.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`, // ✅ Perbaiki variabel env
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768", // ✅ Coba model lain jika diperlukan
          messages: [{ role: "user", content: input }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Groq Response:", data); // ✅ Debugging

      const botMessage = {
        id: messages.length + 2,
        sender: "NestiaDev",
        text:
          data.choices?.[0]?.message?.content ||
          "Maaf, aku tidak bisa menjawab.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 2,
          sender: "NestiaDev",
          text: "Terjadi kesalahan. Coba lagi nanti.",
        },
      ]);
    }
  };

  return (
    <div className="min-h-screen mt-16 bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold">Ask anything</h1>
      <p className="text-gray-400">
        Kamu bisa menanyakan apa saja soal diriku...
      </p>

      <div className="w-full max-w-xl mt-6 bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="h-64 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.sender === "You" ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-3 rounded-lg max-w-xs ${
                msg.sender === "You" ? "bg-blue-500 ml-auto" : "bg-gray-700"
              }`}
            >
              <strong>{msg.sender}</strong>
              <p>{msg.text}</p>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Chat */}
        <div className="flex items-center mt-3 bg-gray-700 rounded-lg">
          <input
            type="text"
            className="w-full p-2 bg-transparent outline-none"
            placeholder="Adakah yang ingin ditanyakan?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="p-2 bg-blue-500 rounded-r-lg"
            onClick={sendMessage}
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
