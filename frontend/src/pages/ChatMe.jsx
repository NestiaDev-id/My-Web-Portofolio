import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { requestToAi } from "../utils/grog";

const ChatApp = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "NestiaDev",
      text: "Tanyakan padaku sesuatu!",
      time: "21:21",
      avatar:
        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    },
  ]);
  const [input, setInput] = useState("");
  const [time, setTime] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date().toLocaleTimeString("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
      });
      setTime(now);
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: "You",
      text: input,
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      avatar: "https://img.daisyui.com/images/profile/demo/3@94.webp",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const aiResponse = await requestToAi(input);
      const botMessage = {
        id: messages.length + 2,
        sender: "NestiaDev",
        text: aiResponse || "Maaf, aku tidak bisa menjawab.",
        time: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        avatar:
          "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to fetch AI response:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 2,
          sender: "NestiaDev",
          text: "Terjadi kesalahan. Coba lagi nanti.",
          time: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatar:
            "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
        },
      ]);
    }
  };

  return (
    <section className="min-h-screen mt-16 bg-gray-900 text-white flex flex-col items-center p-4">
      <h1 className="text-2xl sm:text-3xl font-bold mt-4 text-center">
        Ask anything
      </h1>
      <p className="text-gray-400 text-sm sm:text-base text-center">
        Kamu bisa menanyakan apa saja soal diriku...
      </p>

      {/* Chat Container */}
      <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[60%] xl:w-[50%] mt-6 bg-gray-800 p-4 rounded-lg shadow-md flex flex-col h-[450px] sm:h-[500px] md:h-[600px]">
        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto space-y-4 p-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.sender === "You" ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 ${
                msg.sender === "You" ? "flex-row-reverse" : ""
              }`}
            >
              <img
                src={msg.avatar}
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{msg.sender}</span>
                  <span className="text-xs text-gray-400">{msg.time}</span>
                </div>
                <div
                  className={`p-3 rounded-lg max-w-xs ${
                    msg.sender === "You"
                      ? "bg-blue-500 text-white ml-auto"
                      : "bg-gray-700"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="flex items-center bg-gray-700 rounded-lg mt-3">
          <input
            type="text"
            className="w-full p-2 bg-transparent outline-none text-sm sm:text-base"
            placeholder="Adakah yang ingin ditanyakan?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="p-2 bg-blue-500 rounded-r-lg text-sm sm:text-base"
            onClick={sendMessage}
          >
            Kirim
          </button>
        </div>
      </div>
    </section>
  );
};
export default ChatApp;
