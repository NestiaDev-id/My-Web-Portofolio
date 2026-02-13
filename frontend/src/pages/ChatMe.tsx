import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { requestToAi } from "@/utils/groq";
import {
  Settings,
  Cpu,
  SlidersHorizontal,
  MessageSquareCode,
  DollarSign,
  Sun,
  Languages,
  Plus,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  // AI parameters with default values
  const [temperature, setTemperature] = useState(0.2);
  const [topP, setTopP] = useState(0.8);
  const [seed, setSeed] = useState(10);
  // const [topk, setTopk] = useState(40);
  const [maxTokens, setMaxTokens] = useState(750);
  const [model, setModel] = useState("llama-3.3-70b-versatile");
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
    // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    messagesEndRef.current?.scrollIntoView({
      behavior: messages.length === 1 ? "auto" : "smooth",
    });
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
        maxTokens: maxTokens,
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
    <section className="min-h-screen pt-20 dark:text-white flex flex-col items-center px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mt-4 text-center">
        Ask anything
      </h1>
      <p className="dark:text-gray-400 text-sm sm:text-base text-center">
        Kamu bisa menanyakan apa saja soal diriku...
      </p>

      <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[60%] xl:w-[50%] mt-6 bg-gray-800 p-4 rounded-lg shadow-md flex flex-col h-[600px]">
        <div className="flex justify-end gap-2 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="gap-2 bg-gray-700 hover:bg-gray-600 text-white"
              >
                <Languages className="w-4 h-4" />
                Bahasa
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 text-white">
              <DropdownMenuItem className="gap-2 hover:bg-gray-700 cursor-pointer">
                <Sun className="w-4 h-4 text-red-400" />
                Bahasa Indonesia
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 hover:bg-gray-700 cursor-pointer">
                <Sun className="w-4 h-4 text-blue-400" />
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="gap-2 bg-gray-700 hover:bg-gray-600 text-white"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-800 text-white p-4 w-80 space-y-4"
            >
              {/* Model Select */}
              <div>
                <label className="flex items-center gap-2 font-semibold mb-1 text-sm">
                  <Cpu className="w-4 h-4" />
                  Select Model
                </label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="bg-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 text-white">
                    <SelectItem value="llama-3.3-70b-versatile">
                      Llama 3.3 70B Versatile
                    </SelectItem>
                    <SelectItem value="llama-3.1-8b-instant">
                      Llama 3.1 8B Instant
                    </SelectItem>
                    <SelectItem value="deepseek-r1-distill-llama-70b">
                      DeepSeek R1 Distill Llama 70B
                    </SelectItem>
                    <SelectItem value="mixtral-8x7b-32768">
                      Mixtral 8x7B 32k
                    </SelectItem>
                    <SelectItem value="gemma2-9b-it">Gemma 2 9B IT</SelectItem>
                    <SelectItem value="openai/gpt-oss-120b">
                      OpenAI GPT-OSS 120B
                    </SelectItem>
                    <SelectItem value="openai/gpt-oss-20b">
                      OpenAI GPT-OSS 20B
                    </SelectItem>
                    <SelectItem value="whisper-large-v3">
                      Whisper Large V3
                    </SelectItem>
                    <SelectItem value="whisper-large-v3-turbo">
                      Whisper Large V3 Turbo
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* System Prompt */}
              <div>
                <label className="flex items-center gap-2 font-semibold mb-1 text-sm">
                  <MessageSquareCode className="w-4 h-4" />
                  System Prompt
                </label>
                <Textarea
                  rows={2}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="bg-gray-700 text-white resize-none"
                />
              </div>

              {/* Parameters */}
              <div>
                <label className="flex items-center gap-2 font-semibold mb-1 text-sm">
                  <SlidersHorizontal className="w-4 h-4" />
                  Parameters
                </label>

                <div className="space-y-2">
                  {/* Temperature */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">Temperature</span>
                      <span className="text-gray-400">
                        {temperature.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[temperature]}
                      onValueChange={([val]) => setTemperature(val)}
                    />
                  </div>

                  {/* Top_p */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">Top_p</span>
                      <span className="text-gray-400">{topP.toFixed(2)}</span>
                    </div>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[topP]}
                      onValueChange={([val]) => setTopP(val)}
                    />
                  </div>

                  {/* Seed */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">Seed</span>
                      <span className="text-gray-400">{seed.toFixed(0)}</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[seed]}
                      onValueChange={([val]) => setSeed(val)}
                    />
                  </div>

                  {/* Max Tokens */}
                  <div>
                    <label className="text-xs text-gray-300">Max Tokens</label>
                    <Input
                      type="number"
                      min={10}
                      max={4096}
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(Number(e.target.value))}
                      className="bg-gray-700 text-white mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Token Usage */}
              <div>
                <label className="flex items-center gap-2 font-semibold mb-1 text-sm">
                  <DollarSign className="w-4 h-4" />
                  Token Usage (Est.)
                </label>
                <p className="text-xs text-gray-400">
                  This message used ~127 tokens. Estimated cost: $0.0001
                </p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
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
              <div className="flex flex-col max-w ">
                <div className="flex items-center space-x-2 text-sm ">
                  <span className="text-gray-300">{msg.sender}</span>
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
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center bg-gray-700 rounded-lg mt-2">
          <button className="p-2 rounded-l-lg hover:bg-gray-600 outline-white">
            <Plus className="size-6 text-white" />
          </button>
          <input
            type="text"
            className="w-full p-2 bg-transparent outline-none text-sm text-white"
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
