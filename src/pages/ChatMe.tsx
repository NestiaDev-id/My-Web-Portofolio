import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Send,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import "@/styles/pixel-chat.css";

type Message = {
  id: number;
  sender: string;
  text: string;
  time: string;
  avatar: string;
  imageUrl?: string;
};

const SUGGESTIONS = [
  "Siapa NestiaDev? 👋",
  "Tech stack apa saja yang dikuasai? 💻",
  "Ceritakan pengalaman proyek terbaikmu! 🚀",
  "Bagaimana cara menghubungi Nestia? 📬",
];

const ChatApp = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "NestiaDev",
      text: "Halo! Aku AI Assistant NestiaDev. Tanyakan apa saja tentang profil, tech stack, portofolio, atau kirim gambar/dokumen untuk dianalisis!",
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
      }),
      avatar: "/pomodoro/light-mode/timer/cat-awake.png",
    },
  ]);

  const [input, setInput] = useState("");
  const [time, setTime] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Image preview state
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);

  const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 menit

  const refreshAndGetSessionId = () => {
    if (typeof window === "undefined") return "default";
    const storedId = window.localStorage.getItem("rag-session-id");
    const lastActivity = window.localStorage.getItem("rag-last-activity");
    const now = Date.now();

    if (storedId && lastActivity) {
      if (now - parseInt(lastActivity, 10) <= SESSION_TIMEOUT_MS) {
        window.localStorage.setItem("rag-last-activity", now.toString());
        return storedId;
      }
    }

    const freshId = window.crypto?.randomUUID?.() ?? `session-${now}`;
    window.localStorage.setItem("rag-session-id", freshId);
    window.localStorage.setItem("rag-last-activity", now.toString());
    return freshId;
  };

  const [, setSessionId] = useState(refreshAndGetSessionId);

  const handleResetSession = () => {
    const freshId = window.crypto?.randomUUID?.() ?? `session-${Date.now()}`;
    window.localStorage.setItem("rag-session-id", freshId);
    window.localStorage.setItem("rag-last-activity", Date.now().toString());
    setSessionId(freshId);
    setMessages([
      {
        id: 1,
        sender: "NestiaDev",
        text: "Sesi percakapan baru telah dimulai! Ada yang bisa kubantu?",
        time: getNowTime(),
        avatar: "/pomodoro/light-mode/timer/cat-awake.png",
      },
    ]);
    clearPendingImage();
    setInput("");
  };

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
  }, [messages, isTyping]);

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
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
          avatar: "/pomodoro/light-mode/timer/cat-awake.png",
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
          avatar: "/pomodoro/light-mode/timer/cat-awake.png",
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
          avatar: "/pomodoro/light-mode/timer/cat-awake.png",
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
          avatar: "/pomodoro/light-mode/timer/cat-awake.png",
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
          avatar: "/pomodoro/light-mode/timer/cat-awake.png",
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
          avatar: "/pomodoro/light-mode/timer/cat-awake.png",
        },
      ]);
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

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
  const sendMessage = async (textToSend?: string) => {
    const messageText = (textToSend ?? input).trim();
    const hasText = messageText.length > 0;
    const hasImage = pendingImage !== null;

    if (!hasText && !hasImage) return;

    const userMessage: Message = {
      id: messages.length + 1,
      sender: "You",
      text: messageText || (hasImage ? `📷 ${pendingImage!.name}` : ""),
      time: getNowTime(),
      avatar: "/pomodoro/light-mode/main/timer.png",
      imageUrl: pendingImagePreview || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = messageText;
    const currentImage = pendingImage;
    setInput("");
    clearPendingImage();
    setIsTyping(true);

    try {
      let aiText: string;
      const activeSessionId = refreshAndGetSessionId();
      setSessionId(activeSessionId);

      if (currentImage) {
        const visionResponse = await chatWithVision(
          currentImage,
          activeSessionId,
          currentInput
        );
        aiText = visionResponse.answer || "Maaf, saya tidak bisa menganalisis gambar ini.";
      } else {
        const aiResponse = await chatWithRag(currentInput, activeSessionId);
        aiText = aiResponse.answer || "Maaf, aku tidak bisa menjawab pertanyaan tersebut saat ini.";
      }

      const botMessage: Message = {
        id: messages.length + 2,
        sender: "NestiaDev",
        text: aiText,
        time: getNowTime(),
        avatar: "/pomodoro/light-mode/timer/cat-awake.png",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan saat memproses jawaban.";
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 2,
          sender: "NestiaDev",
          text: message,
          time: getNowTime(),
          avatar: "/pomodoro/light-mode/timer/cat-awake.png",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section className="relative w-full min-h-[calc(100vh-70px)] pt-16 pb-16 px-2 sm:px-4 md:px-6 flex items-center justify-center font-pixel-freddy">
      {/* ── Main Responsive Pixel Window ── */}
      <div
        className={`pixel-chat-frame w-full flex flex-col transition-all duration-200 overflow-hidden ${
          isFullScreen
            ? "fixed inset-2 z-50 h-[calc(100vh-16px)] max-w-none"
            : "max-w-4xl h-[min(680px,calc(100vh-140px))] min-h-[500px]"
        }`}
      >
        {/* ── Retro Window Titlebar ── */}
        <div className="bg-[#f8a5c2] border-b-2 sm:border-b-4 border-[#4a2034] px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between select-none shrink-0">
          {/* Left: Pixel Cat Icon + Window Title */}
          <div className="flex items-center gap-2">
            <img
              src="/pomodoro/light-mode/timer/cat-awake.png"
              alt="Pixel Cat"
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain image-rendering-pixelated"
            />
            <span className="text-[#4a2034] text-xs sm:text-base font-bold tracking-wider">
              PIXEL CHAT // NESTIA BOT
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 ml-2 px-1.5 py-0.5 bg-[#ffffff] border border-[#4a2034] text-[10px] text-[#4a2034] rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ONLINE
            </span>
          </div>

          {/* Right: Window Controls [-] [□] [X] */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Reset / New Session button */}
            <button
              onClick={handleResetSession}
              title="Reset Percakapan"
              className="pixel-btn bg-[#feddde] hover:bg-[#ffc2cf] p-1 sm:p-1.5 rounded flex items-center justify-center text-[#4a2034]"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Minimize / Window Controls */}
            <button
              onClick={() => setIsFullScreen((prev) => !prev)}
              title={isFullScreen ? "Kecilkan Window" : "Perbesar Window"}
              className="pixel-btn bg-[#feddde] hover:bg-[#ffc2cf] p-1 sm:p-1.5 rounded flex items-center justify-center text-[#4a2034]"
            >
              {isFullScreen ? (
                <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>

            {/* Exit [X] button */}
            <button
              onClick={() => navigate("/")}
              title="Tutup / Kembali ke Beranda"
              className="pixel-btn bg-[#f47fa2] hover:bg-[#e0668b] p-1 sm:p-1.5 rounded flex items-center justify-center text-white"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* ── Window Inner Layout: Sidebar (Desktop) + Chat Content ── */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-[#ffdbe3]">
          {/* Desktop Left Retro Sidebar */}
          <div className="hidden md:flex flex-col justify-between w-40 lg:w-44 bg-[#feddde] border-r-2 sm:border-r-4 border-[#4a2034] p-3 select-none shrink-0">
            <div className="space-y-3">
              <div className="text-[11px] text-[#893760] font-bold tracking-wider uppercase mb-1">
                SYSTEM MENU
              </div>

              {/* Active Chat Tab */}
              <div className="pixel-btn bg-[#f8a5c2] text-[#4a2034] p-2 rounded flex items-center gap-2 cursor-pointer font-bold text-sm">
                <img
                  src="/pomodoro/light-mode/main/timer.png"
                  alt="Chat icon"
                  className="w-4 h-4 object-contain"
                />
                <span>AI CHAT</span>
              </div>

              {/* Reset Session Tab */}
              <button
                onClick={handleResetSession}
                className="pixel-btn bg-[#ffffff] hover:bg-[#fff0f4] text-[#893760] w-full p-2 rounded flex items-center gap-2 text-xs font-semibold text-left"
              >
                <img
                  src="/pomodoro/light-mode/main/reset.png"
                  alt="Reset icon"
                  className="w-4 h-4 object-contain"
                />
                <span>NEW CHAT</span>
              </button>

              {/* Status Box */}
              <div className="border-2 border-[#4a2034] bg-[#ffffff] p-2 rounded text-[10px] text-[#893760] space-y-1">
                <div className="flex justify-between font-bold">
                  <span>TIME</span>
                  <span>{time || "12:00"}</span>
                </div>
                <div className="flex justify-between">
                  <span>SESSION</span>
                  <span className="text-emerald-600 font-bold">ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Bottom Sleeping Cat Widget */}
            <div className="border-2 border-[#4a2034] bg-[#ffeef2] p-2 rounded flex flex-col items-center text-center">
              <img
                src="/pomodoro/light-mode/timer/cat-sleeping.png"
                alt="Sleeping Cat"
                className="w-12 h-10 object-contain image-rendering-pixelated mb-1"
              />
              <span className="text-[10px] text-[#893760] font-bold">
                Nestia Bot v1.0
              </span>
            </div>
          </div>

          {/* Main Chat Canvas & Messages Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#fff5f7]">
            {/* Quick Suggestion Chips (Desktop & Mobile) */}
            <div className="bg-[#ffe8ef] border-b-2 border-[#4a2034] px-3 py-1.5 overflow-x-auto whitespace-nowrap pixel-scrollbar flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-[#893760] font-bold flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3 text-[#f47fa2]" /> TANYA CEPAT:
              </span>
              {SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(item)}
                  className="pixel-btn bg-[#ffffff] hover:bg-[#fca5b9] text-[#4a2034] text-[11px] px-2.5 py-0.5 rounded-full shrink-0 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 pixel-scrollbar pixel-chat-canvas">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-2 sm:gap-3 ${
                    msg.sender === "You" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <img
                    src={msg.avatar}
                    alt={msg.sender}
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded border-2 border-[#4a2034] bg-[#feddde] shrink-0 image-rendering-pixelated"
                  />

                  {/* Bubble Content */}
                  <div
                    className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
                      msg.sender === "You" ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Sender & Timestamp */}
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-bold text-[#893760]">
                      <span>{msg.sender}</span>
                      <span className="text-[10px] opacity-70">[{msg.time}]</span>
                    </div>

                    {/* Bubble */}
                    <div
                      className={`p-2.5 sm:p-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        msg.sender === "You"
                          ? "pixel-bubble-user"
                          : "pixel-bubble-ai"
                      }`}
                    >
                      {/* Attached image preview if user sent an image */}
                      {msg.imageUrl && (
                        <div className="mb-2 overflow-hidden border border-[#4a2034] rounded">
                          <img
                            src={msg.imageUrl}
                            alt="Uploaded"
                            className="max-h-48 w-full object-cover cursor-pointer hover:opacity-95"
                            onClick={() => window.open(msg.imageUrl, "_blank")}
                          />
                        </div>
                      )}
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Bot Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-2 sm:gap-3"
                >
                  <img
                    src="/pomodoro/light-mode/timer/cat-awake.png"
                    alt="Bot thinking"
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded border-2 border-[#4a2034] bg-[#feddde] shrink-0 image-rendering-pixelated"
                  />
                  <div className="flex flex-col items-start">
                    <div className="text-[11px] font-bold text-[#893760] mb-1 px-1">
                      NestiaDev [AI] sedikitt berpikir...
                    </div>
                    <div className="pixel-bubble-ai px-3 py-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#f47fa2] animate-bounce [animation-delay:0s]"></span>
                      <span className="w-2 h-2 rounded-full bg-[#f47fa2] animate-bounce [animation-delay:0.15s]"></span>
                      <span className="w-2 h-2 rounded-full bg-[#f47fa2] animate-bounce [animation-delay:0.3s]"></span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Pending Image Preview Dock ── */}
            {pendingImagePreview && (
              <div className="bg-[#feddde] border-t-2 border-[#4a2034] p-2 flex items-center gap-2 shrink-0">
                <img
                  src={pendingImagePreview}
                  alt="Attachment preview"
                  className="w-12 h-12 object-cover rounded border-2 border-[#4a2034]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#4a2034] truncate">
                    {pendingImage?.name}
                  </p>
                  <p className="text-[10px] text-[#893760]">
                    {pendingImage
                      ? `${(pendingImage.size / 1024).toFixed(1)} KB`
                      : ""}
                  </p>
                </div>
                <button
                  onClick={clearPendingImage}
                  className="pixel-btn bg-[#f47fa2] text-white p-1 rounded"
                  title="Batalkan gambar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── Retro Input Toolbar Dock ── */}
            <div className="bg-[#ffdbe3] border-t-2 sm:border-t-4 border-[#4a2034] p-2 sm:p-2.5 flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Emoji Picker Dropdown */}
              <DropdownMenu open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="pixel-btn bg-[#feddde] hover:bg-[#ffc6d2] p-2 rounded text-[#4a2034]"
                    title="Emoji"
                  >
                    <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={6}
                  className="border-none bg-transparent p-0 shadow-none z-50"
                >
                  <div className="overflow-hidden rounded-lg border-2 border-[#4a2034] shadow-[4px_4px_0px_#4a2034] bg-white">
                    <Picker
                      data={data}
                      theme="light"
                      onEmojiSelect={handleEmojiSelect}
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* File Attachment Dropdown */}
              <DropdownMenu open={isAttachOpen} onOpenChange={setIsAttachOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    disabled={isUploading}
                    className="pixel-btn bg-[#feddde] hover:bg-[#ffc6d2] p-2 rounded text-[#4a2034] disabled:opacity-50"
                    title="Lampirkan File / Dokumen"
                  >
                    {isUploading ? (
                      <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#f47fa2]" />
                    ) : (
                      <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={6}
                  className="p-1 min-w-[200px] bg-[#feddde] border-2 border-[#4a2034] shadow-[4px_4px_0px_#4a2034] rounded-lg z-50 font-pixel-freddy"
                >
                  <button
                    onClick={() => {
                      setIsAttachOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs text-[#4a2034] hover:bg-[#ffdbe3] rounded transition-colors font-bold"
                  >
                    <FileText className="w-4 h-4 text-[#893760]" />
                    <span>Upload Dokumen</span>
                    <span className="text-[10px] text-[#893760] opacity-80 ml-auto">
                      PDF, TXT
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAttachOpen(false);
                      imageInputRef.current?.click();
                    }}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs text-[#4a2034] hover:bg-[#ffdbe3] rounded transition-colors font-bold"
                  >
                    <ImageIcon className="w-4 h-4 text-[#f47fa2]" />
                    <span>Upload Gambar</span>
                    <span className="text-[10px] text-[#893760] opacity-80 ml-auto">
                      JPG, PNG
                    </span>
                  </button>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Hidden File Inputs */}
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

              {/* Text Input Field */}
              <div className="flex-1 flex items-center bg-white border-2 border-[#4a2034] rounded px-2.5 py-1 sm:py-1.5 shadow-[inset_1px_1px_0px_rgba(74,32,52,0.1)]">
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full bg-transparent outline-none text-xs sm:text-sm text-[#4a2034] placeholder:text-[#c4899f] font-sans"
                  placeholder={
                    pendingImage
                      ? "Tanyakan sesuatu tentang gambar ini..."
                      : "Ketik pesan pertanyaan di sini..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
              </div>

              {/* Send Button */}
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() && !pendingImage}
                className={`pixel-btn px-3 sm:px-4 py-1.5 sm:py-2 rounded font-bold text-xs sm:text-sm flex items-center gap-1.5 ${
                  input.trim() || pendingImage
                    ? "bg-[#f47fa2] hover:bg-[#e0668b] text-white cursor-pointer"
                    : "pixel-btn-disabled bg-[#feddde] text-[#9c5974]"
                }`}
              >
                <span>KIRIM</span>
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatApp;
