import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { chatWithRag, uploadTask, chatWithVision } from "@/utils/rag";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  Smile,
  Paperclip,
  Loader,
  FileText,
  ImageIcon,
  X,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

type Message = {
  id: number;
  sender: string;
  text: string;
  time: string;
  avatar: string;
  imageUrl?: string; // optional image to display in bubble
};

const ChatApp = () => {
  const [messages, setMessages] = useState<Message[]>([
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
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isAttachOpen, setIsAttachOpen] = useState(false);

  // Image preview state
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(
    null
  );

  const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 menit

  const refreshAndGetSessionId = () => {
    if (typeof window === "undefined") return "default";
    const storedId = window.localStorage.getItem("rag-session-id");
    const lastActivity = window.localStorage.getItem("rag-last-activity");
    const now = Date.now();

    if (storedId && lastActivity) {
      if (now - parseInt(lastActivity, 10) <= SESSION_TIMEOUT_MS) {
        // Sesi masih valid, perbarui waktu aktivitas
        window.localStorage.setItem("rag-last-activity", now.toString());
        return storedId;
      }
    }

    // Jika kedaluwarsa atau tidak ada, buat sesi baru
    const freshId = window.crypto?.randomUUID?.() ?? `session-${now}`;
    window.localStorage.setItem("rag-session-id", freshId);
    window.localStorage.setItem("rag-last-activity", now.toString());
    
    // Karena ini sesi baru, opsional kita bisa mengosongkan layar chat lama
    // tapi untuk sekarang kita biarkan history UI tetap ada.
    return freshId;
  };

  const [sessionId, setSessionId] = useState(refreshAndGetSessionId);

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

  const getNowTime = () =>
    new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleEmojiSelect = (emoji: { native: string }) => {
    setInput((prev) => `${prev}${emoji.native}`);
    setIsEmojiOpen(false);
    inputRef.current?.focus();
  };

  // ── File upload handler (documents) ────────────────────
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
          time: getNowTime(),
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
          time: getNowTime(),
          avatar:
            "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
        },
      ]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const activeSessionId = refreshAndGetSessionId();
      setSessionId(activeSessionId);

      const result = await uploadTask(file, activeSessionId);

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "NestiaDev",
          text: `✅ Dokumen "${file.name}" berhasil di-upload (${result.chunks_added} chunks ditambahkan).`,
          time: getNowTime(),
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
          time: getNowTime(),
          avatar:
            "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
        },
      ]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Image selection handler ────────────────────────────
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const fileName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!hasValidExt) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "NestiaDev",
          text: `Format gambar tidak didukung. Gunakan .jpg, .png, atau .webp.`,
          time: getNowTime(),
          avatar:
            "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
        },
      ]);
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "NestiaDev",
          text: `Gambar terlalu besar. Maksimal 10MB.`,
          time: getNowTime(),
          avatar:
            "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
        },
      ]);
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    // Set preview
    setPendingImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPendingImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (imageInputRef.current) imageInputRef.current.value = "";
    inputRef.current?.focus();
  };

  const clearPendingImage = () => {
    setPendingImage(null);
    setPendingImagePreview(null);
  };

  // ── Send message (text + optional image) ───────────────
  const sendMessage = async () => {
    const hasText = input.trim().length > 0;
    const hasImage = pendingImage !== null;

    if (!hasText && !hasImage) return;

    const userMessage: Message = {
      id: messages.length + 1,
      sender: "You",
      text: input || (hasImage ? `📷 ${pendingImage!.name}` : ""),
      time: getNowTime(),
      avatar: "https://img.daisyui.com/images/profile/demo/3@94.webp",
      imageUrl: pendingImagePreview || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    const currentImage = pendingImage;
    setInput("");
    clearPendingImage();
    setIsTyping(true);

    try {
      let aiText: string;
      const activeSessionId = refreshAndGetSessionId();
      setSessionId(activeSessionId);

      if (currentImage) {
        // Vision mode: send image to /chat-vision
        const visionResponse = await chatWithVision(
          currentImage,
          activeSessionId,
          currentInput
        );
        aiText = visionResponse.answer || "Maaf, saya tidak bisa menganalisis gambar ini.";
      } else {
        // Text mode: send to /chat
        const aiResponse = await chatWithRag(currentInput, activeSessionId);
        aiText = aiResponse.answer || "Maaf, aku tidak bisa menjawab.";
      }

      const botMessage: Message = {
        id: messages.length + 2,
        sender: "NestiaDev",
        text: aiText,
        time: getNowTime(),
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
          time: getNowTime(),
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
                  {/* Display image if present */}
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Uploaded"
                      className="rounded-lg mb-2 max-w-full max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(msg.imageUrl, "_blank")}
                    />
                  )}
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

        {/* ── Image preview bar ───────────────────────────── */}
        {pendingImagePreview && (
          <div className="flex items-center gap-2 mx-2 mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <img
              src={pendingImagePreview}
              alt="Preview"
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-grow min-w-0">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                {pendingImage?.name}
              </p>
              <p className="text-[10px] text-gray-400">
                {pendingImage
                  ? `${(pendingImage.size / 1024).toFixed(1)} KB`
                  : ""}
              </p>
            </div>
            <button
              onClick={clearPendingImage}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="size-4 text-gray-500" />
            </button>
          </div>
        )}

        {/* ── Input bar ──────────────────────────────────── */}
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl mt-2 border border-gray-200 dark:border-gray-700 shadow-sm overflow-visible p-1 relative">
          {/* Emoji button */}
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

          {/* Attach button with popup */}
          <DropdownMenu open={isAttachOpen} onOpenChange={setIsAttachOpen}>
            <DropdownMenuTrigger asChild>
              <button
                disabled={isUploading}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Lampirkan file"
              >
                {isUploading ? (
                  <Loader className="size-5 text-gray-500 dark:text-gray-400 animate-spin" />
                ) : (
                  <Paperclip className="size-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={6}
              className="p-1 min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg"
            >
              <button
                onClick={() => {
                  setIsAttachOpen(false);
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FileText className="size-4 text-blue-500" />
                <span>Dokumen</span>
                <span className="text-[10px] text-gray-400 ml-auto">
                  PDF, TXT, DOCX
                </span>
              </button>
              <button
                onClick={() => {
                  setIsAttachOpen(false);
                  imageInputRef.current?.click();
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ImageIcon className="size-4 text-green-500" />
                <span>Gambar / Foto</span>
                <span className="text-[10px] text-gray-400 ml-auto">
                  JPG, PNG, WEBP
                </span>
              </button>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <input
            ref={imageInputRef}
            type="file"
            hidden
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleImageSelect}
          />

          <input
            type="text"
            ref={inputRef}
            className="flex-grow p-2 bg-transparent outline-none text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder={
              pendingImage
                ? "Tulis pertanyaan tentang gambar ini... (opsional)"
                : "Adakah yang ingin ditanyakan?"
            }
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
