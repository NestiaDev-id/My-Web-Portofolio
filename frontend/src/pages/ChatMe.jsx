import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { requestToAi } from "../utils/core/groqAsisstant";
import {
  Settings,
  Cpu,
  SlidersHorizontal,
  MessageSquareCode,
  DollarSign,
  Sun,
  Languages,
  Send,
  BotMessageSquare,
  User,
  Plus,
} from "lucide-react";

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

  // AI parameters with default values
  const [temperature, setTemperature] = useState(0.2);
  const [topP, setTopP] = useState(0.8);
  const [seed, setSeed] = useState(10);
  const [topk, setTopk] = useState(40);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [model, setModel] = useState("llama3-8b-8192");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant."
  );

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
      const aiResponse = await requestToAi(input, {
        model: model,
        temperature: temperature,
        top_p: topP,
        max_tokens: maxTokens,
        seed: seed,
      });

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

      <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[60%] xl:w-[50%] mt-6 bg-gray-800 p-4 rounded-lg shadow-md flex flex-col h-[600px]">
        <div className="flex justify-end gap-2 mb-4">
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-sm gap-2 text-white bg-gray-700 hover:bg-gray-600"
            >
              <Languages className="w-4 h-4" />
              Bahasa
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <button className="btn btn-sm gap-2 text-white bg-gray-700 hover:bg-gray-600 w-full">
                  <Sun className="w-4 h-4 text-red-400" />
                  Bahasa Indonesia
                </button>
              </li>
              <li>
                <button className="btn btn-sm gap-2 text-white bg-gray-700 hover:bg-gray-600 w-full">
                  <Sun className="w-4 h-4 text-blue-400" />
                  English
                </button>
              </li>
            </ul>
          </div>

          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-sm gap-2 text-white bg-gray-700 hover:bg-gray-600"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>

            <div
              tabIndex={0}
              className="dropdown-content z-[1] bg-base-300 p-4 shadow-xl rounded-lg w-80 space-y-4 text-sm text-white"
            >
              <div>
                <label className="flex items-center gap-2 font-semibold mb-1">
                  <Cpu className="w-4 h-4" />
                  Select Model
                </label>
                <select
                  className="select select-sm w-full bg-gray-700 text-white"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  {/* Daftar model... */}
                  <option value="llama3-8b-8192">LLaMA 3 8B 8192</option>
                  <option value="llama3-70b-8192">LLaMA 3 70B 8192</option>
                  <option value="meta-llama/llama-4-scout-17b-16e-instruct">
                    LLaMA 4 Scout 17B
                  </option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 font-semibold mb-1">
                  <MessageSquareCode className="w-4 h-4" />
                  System Prompt
                </label>
                <textarea
                  className="textarea textarea-sm w-full bg-gray-700 text-white resize-none"
                  rows={2}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 font-semibold mb-1">
                  <SlidersHorizontal className="w-4 h-4" />
                  Parameters
                </label>

                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">Temperature</span>
                    <span className="text-gray-400">
                      {temperature.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="range range-xs"
                  />
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">Top_p</span>
                    <span className="text-gray-400">{topP.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="range range-xs"
                  />
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">Seed</span>
                    <span className="text-gray-400">{seed.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.01"
                    value={seed}
                    onChange={(e) => setSeed(parseFloat(e.target.value))}
                    className="range range-xs"
                  />
                </div>

                <div className="mb-2">
                  <label className="text-xs text-gray-300">Max Tokens</label>
                  <input
                    type="number"
                    className="input input-sm w-full bg-gray-700 text-white mt-1"
                    min={10}
                    max={4096}
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 font-semibold mb-1">
                  <DollarSign className="w-4 h-4" />
                  Token Usage (Est.)
                </label>
                <p className="text-xs text-gray-400">
                  This message used ~127 tokens. Estimated cost: $0.0001
                </p>
              </div>
            </div>
          </div>
        </div>

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

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3"
            >
              <img
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                alt="Nestia avatar"
                className="w-8 h-8 rounded-full"
              />
              <div className="flex flex-col space-y-1 animate-pulse">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-semibold text-white">NestiaDev</span>
                  <span className="text-xs text-gray-400">{time}</span>
                </div>
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

        <div className="flex items-center bg-gray-700 rounded-lg mt-2">
          <button className="p-2 rounded-l-lg bg-gray-600">
            <Plus className="size-6" />
          </button>
          <input
            type="text"
            className="w-full p-2 bg-transparent outline-none text-sm"
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
    </section>
  );
};

export default ChatApp;
