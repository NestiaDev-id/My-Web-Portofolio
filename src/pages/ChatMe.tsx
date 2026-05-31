import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { chatWithRag, uploadTask } from "@/utils/rag";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  Sun,
  Languages,
  Smile,
  Paperclip,
  Loader,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [emojiTheme, setEmojiTheme] = useState<"light" | "dark">("light");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return "default";
    const stored = window.localStorage.getItem("rag-session-id");
    if (stored) return stored;
    const freshId =
      window.crypto?.randomUUID?.() ?? `session-${Date.now()}`;
    window.localStorage.setItem("rag-session-id", freshId);
    return freshId;
  });

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

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => {
      setEmojiTheme(root.classList.contains("dark") ? "dark" : "light");
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const handleEmojiSelect = (emoji: { native: string }) => {
    setInput((prev) => `${prev}${emoji.native}`);
    setIsEmojiOpen(false);
    inputRef.current?.focus();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validExtensions = [".txt", ".pdf", ".doc", ".docx"];
    const fileName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!hasValidExt) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "NestiaDev",
          text: `Format file tidak didukung. Hanya .txt, .pdf, .docx yang diperbolehkan.`,
          time: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatar:
            "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
        },
      ]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "NestiaDev",
          text: `File terlalu besar. Maksimal 5MB.`,
          time: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatar:
            "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
        },
      ]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadTask(file, sessionId);

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "NestiaDev",
          text: `✅ Dokumen "${file.name}" berhasil di-upload (${result.chunks_added} chunks ditambahkan).`,
          time: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatar:
            "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
        },
      ]);

      const autoMessage = `Saya sudah upload dokumen ${file.name}. Bisakah kamu menganalisisnya?`;
      setInput(autoMessage);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal upload dokumen.";
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "NestiaDev",
          text: `❌ Error: ${message}`,
          time: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatar:
            "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
        },
      ]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
      const aiResponse = await chatWithRag(input, sessionId);

      const botMessage = {
        id: messages.length + 2,
        sender: "NestiaDev",
        text: aiResponse.answer || "Maaf, aku tidak bisa menjawab.",
        time: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        avatar:
          "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan.";
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 2,
          sender: "NestiaDev",
          text: message,
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
    <section className="min-h-screen pt-20 bg-white dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col items-center px-4 transition-colors duration-300">
      <h1 className="text-2xl sm:text-3xl font-bold mt-4 text-center">
        Ask anything
      </h1>
      <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base text-center">
        Kamu bisa menanyakan apa saja soal diriku...
      </p>

      <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[60%] xl:w-[50%] mt-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl shadow-xl flex flex-col h-[600px] border border-gray-200 dark:border-gray-800">
        <div className="flex justify-end gap-2 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-white"
              >
                <Languages className="w-4 h-4" />
                Bahasa
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
            >
              <DropdownMenuItem className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <Sun className="w-4 h-4 text-red-400" />
                Bahasa Indonesia
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <Sun className="w-4 h-4 text-blue-400" />
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
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
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
              />
              <div className="flex flex-col max-w ">
                <div className="flex items-center space-x-2 text-sm mb-1">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {msg.sender}
                  </span>
                  <span className="text-[10px] text-gray-400">{msg.time}</span>
                </div>
                <div
                  className={`p-3 rounded-2xl text-sm max-w-xs leading-snug shadow-sm ${
                    msg.sender === "You"
                      ? "bg-blue-600 text-white ml-auto rounded-tr-none"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700"
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
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
              />
              <div className="flex flex-col space-y-1 animate-pulse">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    NestiaDev
                  </span>
                  <span className="text-xs text-gray-400">{time}</span>
                </div>
                <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 size-8 flex items-center text-center rounded-2xl rounded-tl-none border border-gray-200 dark:border-gray-700 w-fit max-w-xs">
                  <div className="flex space-x-1">
                    <span className="size-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:.1s]"></span>
                    <span className="size-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:.2s]"></span>
                    <span className="size-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:.3s]"></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl mt-2 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden p-1">
          <DropdownMenu open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Smile className="size-5 text-gray-500 dark:text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={6}
              className="border-none bg-transparent p-0 shadow-none"
            >
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <Picker
                  data={data}
                  theme={emojiTheme}
                  onEmojiSelect={handleEmojiSelect}
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upload dokumen"
          >
            {isUploading ? (
              <Loader className="size-5 text-gray-500 dark:text-gray-400 animate-spin" />
            ) : (
              <Paperclip className="size-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <input
            type="text"
            ref={inputRef}
            className="flex-grow p-2 bg-transparent outline-none text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="Adakah yang ingin ditanyakan?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20"
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
