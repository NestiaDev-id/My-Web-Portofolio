import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { requestToAi } from "../utils/grog";
import { Send, BotMessageSquare, User, Plus } from "lucide-react";

const ChatApp = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "NestiaDev",
      text: "Tanyakan padaku sesuatu!",
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
      }),
      avatar:
        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    },
  ]);
  const [input, setInput] = useState("");
  const [time, setTime] = useState("");
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

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
    setIsTyping(true);

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
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section className="min-h-screen pt-20 bg-gray-900 text-white flex flex-col items-center px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mt-4 text-center">
        Ask anything
      </h1>
      <p className="text-gray-400 text-sm sm:text-base text-center">
        Kamu bisa menanyakan apa saja soal diriku...
      </p>

      {/* Chat Container */}
      <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[60%] xl:w-[50%] mt-6 bg-gray-800 p-4 rounded-lg shadow-md flex flex-col h-[450px] sm:h-[500px] md:h-[600px]">
        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
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
              <div className="flex flex-col max-w">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-semibold">{msg.sender}</span>
                  <span className="text-xs text-gray-400">{msg.time}</span>
                </div>
                <div
                  className={`p-3 rounded-lg text-sm max-w-xs leading-snug ${
                    msg.sender === "You"
                      ? "bg-blue-500 text-white ml-auto rounded-tr-none"
                      : "bg-gray-700 text-white rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing bubble */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3 "
            >
              {/* Avatar */}
              <img
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                alt="Nestia avatar"
                className="w-8 h-8 rounded-full"
              />

              {/* Nama dan bubble */}
              <div className="flex flex-col space-y-1 animate-pulse">
                {/* Nama dan waktu */}
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-semibold text-white">NestiaDev</span>
                  <span className="text-xs text-gray-400">
                    {new Date().toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "Asia/Jakarta",
                    })}
                  </span>
                </div>

                {/* Bubble chat dengan sudut atas kiri kotak */}
                <div className="bg-gray-700 text-white px-4 py-2 size-8 flex items-center text-center rounded-2xl rounded-tl-none w-fit max-w-xs">
                  <div className="flex space-x-1">
                    <span className="size-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:.1s]"></span>
                    <span className="size-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:.2s]"></span>
                    <span className="size-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:.3s]"></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Chat Input */}
        <div className="flex items-center bg-gray-700 rounded-lg">
          {/* Upload files */}
          <button
            onClick={(e) => e.target.value}
            className="p-2 rounded-l-lg bg-gray-600 text-sm sm:text-base"
          >
            <Plus className="size-6 text-sm sm:text-base" />
          </button>

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
