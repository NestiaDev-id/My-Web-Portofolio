import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { uploadTask, clearChatSession, getApiUrl } from "@/utils/rag";
import { requestAi } from "@/utils/aiRouter";
import { useChatPresence } from "@/hooks/useChatPresence";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
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
  MessageSquare,
  Users,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import "@/styles/pixel-chat.css";

const VTuberStage = lazy(() => import("@/components/vtuber/VTuberStage"));

type Message = {
  id: number;
  sender: string;
  text: string;
  time: string;
  avatar: string;
  imageUrl?: string;
  isContactCard?: boolean;
  contactPrefill?: string;
};

const BOT_AVATAR =
  "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
const USER_AVATAR = "https://img.daisyui.com/images/profile/demo/3@94.webp";

const SUGGESTIONS = [
  { label: "Siapa NestiaDev?", emoji: "👋", text: "Siapa NestiaDev?" },
  {
    label: "Tech stack apa saja yang dikuasai?",
    emoji: "💻",
    text: "Tech stack apa saja yang dikuasai?",
  },
  {
    label: "Ceritakan proyek terbaikmu!",
    emoji: "🚀",
    text: "Ceritakan pengalaman proyek terbaikmu!",
  },
  {
    label: "Kirim Pesan / Kontak",
    emoji: "📬",
    text: "/kontak",
  },
];

interface ContactFormCardProps {
  prefill?: string;
}

const ContactFormCard = ({ prefill = "Diskusi Proyek / Kolaborasi" }: ContactFormCardProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    prefill ? `${prefill}: ` : "Diskusi Proyek / Kolaborasi: "
  );
  const [hp, setHp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileSiteKey =
    import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cooldown > 0) {
      setErrorMessage(`Mohon tunggu ${cooldown} detik sebelum mengirim pesan kembali (anti-spam cooldown).`);
      return;
    }

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage("Mohon lengkapi seluruh field sebelum mengirim.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(getApiUrl("/api/v1/contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          _hp_website: hp.trim(),
          turnstileToken: turnstileToken || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("Retry-After")) || 60;
        setCooldown(retryAfter);
        throw new Error(
          data?.error?.message ||
            `Terlalu banyak permintaan kontak dari IP Anda. Silakan tunggu ${retryAfter} detik.`
        );
      }

      if (!response.ok || data.success === false) {
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        throw new Error(data.error || `Gagal mengirim pesan (HTTP ${response.status})`);
      }

      setIsSuccess(true);
      setTrackingId(data.id || `re_${Math.random().toString(36).substring(2, 9)}`);
      setCooldown(30);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal terhubung ke API Gateway.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    setIsSuccess(false);
    setName("");
    setEmail("");
    setMessage(prefill ? `${prefill}: ` : "Diskusi Proyek / Kolaborasi: ");
    setHp("");
    setErrorMessage(null);
    turnstileRef.current?.reset();
    setTurnstileToken(null);
  };

  if (isSuccess) {
    return (
      <div className="bg-[#fffafd] border-2 border-[#4a2034] rounded-lg p-3 text-left space-y-2 w-full max-w-[480px]">
        <p className="font-pixel-freddy text-xs font-bold text-[#893760]">
          Pesan berhasil dikirim
        </p>
        <p className="font-mono text-xs text-[#2D1B22] leading-relaxed">
          Pesan sudah diteruskan ke <strong>support@nestia.my.id</strong>.
        </p>
        {trackingId && (
          <p className="font-mono text-[10px] text-[#8C5061] break-all">
            ID: {trackingId}
          </p>
        )}
        <button
          type="button"
          onClick={handleResetForm}
          className="pixel-btn bg-white hover:bg-[#fff0f4] text-[#893760] font-pixel-freddy text-[10px] px-3 py-1.5 rounded border border-[#4a2034] cursor-pointer"
        >
          Kirim pesan lain
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#fffafd] border-2 border-[#4a2034] rounded-lg p-3 sm:p-3.5 space-y-2.5 w-full max-w-[500px]">

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* Honeypot protection field (hidden from real users) */}
        <input
          type="text"
          name="_hp_website"
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <input
            type="text"
            required
            placeholder="Nama Anda"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border-2 border-[#2D1B22] rounded-lg px-3 py-1.5 font-mono text-xs text-[#2D1B22] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00966D]"
          />
          <input
            type="email"
            required
            placeholder="email@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border-2 border-[#2D1B22] rounded-lg px-3 py-1.5 font-mono text-xs text-[#2D1B22] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00966D]"
          />
        </div>

        <textarea
          rows={3}
          required
          placeholder="Diskusi Proyek / Kolaborasi:"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-white border-2 border-[#2D1B22] rounded-lg px-3 py-2 font-mono text-xs text-[#2D1B22] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00966D] resize-y"
        />

        {errorMessage && (
          <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-300 rounded p-1.5 font-mono">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Cloudflare Turnstile Verification Widget */}
        <div className="flex justify-center sm:justify-start my-1.5 overflow-hidden min-h-[65px]">
          <Turnstile
            ref={turnstileRef}
            siteKey={turnstileSiteKey}
            onSuccess={(token) => setTurnstileToken(token)}
            onError={() => setTurnstileToken(null)}
            onExpire={() => setTurnstileToken(null)}
            options={{
              theme: "light",
              size: "flexible",
            }}
          />
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[#8C5061] font-mono text-[10.5px]">
            <Shield className="w-3.5 h-3.5 text-[#00966D]" />
            <span>{turnstileToken ? "Verified by Turnstile" : "Turnstile Protected"}</span>
          </div>
          <button
            type="submit"
            disabled={isLoading || cooldown > 0}
            className="pixel-btn bg-[#00966D] hover:bg-[#047857] text-white font-pixel-freddy text-[10px] sm:text-[11px] px-3.5 py-1.5 rounded-lg border-2 border-[#2D1B22] shadow-[2.5px_2.5px_0px_#2D1B22] cursor-pointer flex items-center gap-1.5 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span>MENGIRIM...</span>
                <span>⏳</span>
              </>
            ) : cooldown > 0 ? (
              <span>TUNGGU ({cooldown}s)</span>
            ) : (
              <>
                <span>KIRIM EMAIL</span>
                <span>➤</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const ChatApp = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "NestiaDev",
      text: 'Halo! Aku AI Assistant NestiaDev. Tanyakan apa saja tentang profil, tech stack, portofolio, atau ketik "kontak" / "hire" untuk memunculkan kartu formulir langsung di dalam chat!',
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
      }),
      avatar: BOT_AVATAR,
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
  const [isVtuberActive, setIsVtuberActive] = useState(false);
  const chatTurnstileRef = useRef<TurnstileInstance | undefined>(undefined);
  const [chatTurnstileToken, setChatTurnstileToken] = useState<string | null>(null);
  const chatTurnstileSiteKey =
    import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";
  const [vtuberSubtitle, setVtuberSubtitle] = useState("");
  const [vtuberSpeaking, setVtuberSpeaking] = useState(false);

  const handleToggleVtuber = () => {
    // Live2D is strictly for desktop screens
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return;
    }
    setIsVtuberActive((prev) => !prev);
  };

  // Image preview state
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(
    null,
  );

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

  const [sessionId, setSessionId] = useState(refreshAndGetSessionId);
  const { activeUsers, queueInfo } = useChatPresence(sessionId);

  const handleResetSession = () => {
    const oldSessionId = sessionId;
    const freshId = window.crypto?.randomUUID?.() ?? `session-${Date.now()}`;
    window.localStorage.setItem("rag-session-id", freshId);
    window.localStorage.setItem("rag-last-activity", Date.now().toString());
    setSessionId(freshId);

    // Asynchronously clear old session on API Gateway (Redis + MongoDB)
    if (oldSessionId) {
      clearChatSession(oldSessionId).catch(() => {});
    }

    setMessages([
      {
        id: 1,
        sender: "NestiaDev",
        text: "Sesi percakapan baru telah dimulai! Ada yang bisa kubantu?",
        time: getNowTime(),
        avatar: BOT_AVATAR,
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
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
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
          avatar: BOT_AVATAR,
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
          avatar: BOT_AVATAR,
        },
      ]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const activeSessionId = refreshAndGetSessionId();
      setSessionId(activeSessionId);

      if (!chatTurnstileToken) {
        throw new Error("Verifikasi keamanan belum selesai. Silakan tunggu sebentar lalu coba lagi.");
      }

      const result = await uploadTask(file, activeSessionId, chatTurnstileToken);
      chatTurnstileRef.current?.reset();
      setChatTurnstileToken(null);

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "NestiaDev",
          text: `✅ Dokumen "${file.name}" berhasil di-upload (${result.chunks_added} chunks ditambahkan).`,
          time: getNowTime(),
          avatar: BOT_AVATAR,
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
          avatar: BOT_AVATAR,
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
          avatar: BOT_AVATAR,
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
          avatar: BOT_AVATAR,
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
      avatar: USER_AVATAR,
      imageUrl: pendingImagePreview || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = messageText;
    const currentImage = pendingImage;
    setInput("");
    clearPendingImage();

    // Intercept contact/hire command to render Generative UI card
    const normalized = currentInput.toLowerCase().trim();
    const isContactCommand =
      normalized === "/kontak" ||
      normalized === "/contact" ||
      normalized === "/hire" ||
      normalized === "kontak" ||
      normalized === "hire" ||
      normalized === "hubungi" ||
      normalized === "cara kontak" ||
      normalized.includes("cara menghubungi") ||
      normalized.includes("hubungi nestia") ||
      normalized.includes("kirim email");

    if (isContactCommand) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const cardMessage: Message = {
          id: Date.now(),
          sender: "NestiaDev",
          text: "",
          time: getNowTime(),
          avatar: "AI",
          isContactCard: true,
          contactPrefill: "Diskusi Proyek / Kolaborasi",
        };
        setMessages((prev) => [...prev, cardMessage]);
      }, 350);
      return;
    }

    setIsTyping(true);

    try {
      if (!chatTurnstileToken) {
        throw new Error("Verifikasi keamanan belum selesai. Silakan tunggu sebentar lalu coba lagi.");
      }

      let aiText: string;
      const activeSessionId = refreshAndGetSessionId();
      setSessionId(activeSessionId);

      const aiResponse = await requestAi({
        question: currentInput,
        sessionId: activeSessionId,
        image: currentImage,
        turnstileToken: chatTurnstileToken,
      });
      chatTurnstileRef.current?.reset();
      setChatTurnstileToken(null);
      aiText = aiResponse.answer || "Maaf, aku tidak bisa menjawab.";

      const botMessage: Message = {
        id: messages.length + 2,
        sender: "NestiaDev",
        text: aiText,
        time: getNowTime(),
        avatar: BOT_AVATAR,
      };
      setMessages((prev) => [...prev, botMessage]);

      if (isVtuberActive) {
        setVtuberSubtitle(aiText);
        setVtuberSpeaking(true);
        setTimeout(
          () => setVtuberSpeaking(false),
          Math.min(8000, Math.max(1800, aiText.length * 50))
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memproses jawaban.";
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 2,
          sender: "NestiaDev",
          text: message,
          time: getNowTime(),
          avatar: BOT_AVATAR,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section className="relative w-full min-h-[calc(100vh-70px)] pt-10 pb-10 px-2 sm:px-4 md:px-6 flex items-center justify-center">
      {/* ── Two Standalone Window Frames Container ── */}
      <div
        className={`w-full transition-all duration-300 flex items-stretch justify-center gap-3 sm:gap-4 lg:gap-5 ${
          isFullScreen
            ? "fixed inset-2 z-50 h-[calc(100vh-16px)] max-w-none"
            : isVtuberActive
              ? "max-w-[1360px] 2xl:max-w-[1520px] h-[min(740px,calc(100vh-100px))] min-h-[500px]"
              : "max-w-4xl 2xl:max-w-5xl h-[min(680px,calc(100vh-130px))] min-h-[500px]"
        }`}
      >
        {/* ── FRAME 1 (LEFT): Chat with My Assistant ── */}
        <div
          className={`pixel-chat-frame flex flex-col transition-all duration-300 overflow-hidden h-full ${
            isVtuberActive ? "flex-1 min-w-0" : "w-full"
          }`}
        >
        {/* ── Retro Window Titlebar ── */}
        <div className="bg-[#f8a5c2] border-b-2 sm:border-b-4 border-[#4a2034] px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between select-none shrink-0 font-pixel-freddy">
          {/* Left: Pixel Bot Icon + Window Title + Active Users Badge */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[#4a2034] text-xs sm:text-base font-bold tracking-wider">
              Chat with My Assistant
            </span>
            <div
              title={`${activeUsers} pengguna aktif di ChatMe. Sistem dilindungi antrean pintar.`}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white border border-[#4a2034] text-[#4a2034] rounded shadow-[1px_1px_0px_#4a2034] select-none"
            >
              <Users className="w-3 h-3 text-[#4a2034]" />
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-pixel-freddy tracking-wider uppercase">
                {activeUsers} {activeUsers === 1 ? "USER" : "USERS"}
              </span>
            </div>
          </div>

          {/* Right: Window Controls [-] [□] [X] */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Reset / New Session button */}
            <button
              onClick={handleResetSession}
              title="Reset Percakapan"
              className="pixel-btn bg-[#feddde] hover:bg-[#ffc2cf] p-1.5 rounded flex items-center justify-center text-[#4a2034]"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Maximize / Window Controls */}
            <button
              onClick={() => setIsFullScreen((prev) => !prev)}
              title={isFullScreen ? "Kecilkan Window" : "Perbesar Window"}
              className="pixel-btn bg-[#feddde] hover:bg-[#ffc2cf] p-1.5 rounded flex items-center justify-center text-[#4a2034]"
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
              className="pixel-btn bg-[#f47fa2] hover:bg-[#e0668b] p-1.5 rounded flex items-center justify-center text-white"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* ── Window Inner Layout: Sidebar (Desktop) + Chat Content ── */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-[#ffdbe3]">
          {/* Desktop Left Retro Sidebar */}
          <div className="hidden md:flex flex-col justify-between w-40 lg:w-44 bg-[#feddde] border-r-2 sm:border-r-4 border-[#4a2034] p-3 select-none shrink-0 font-pixel-freddy">
            <div className="space-y-3">
              <div className="text-[11px] text-[#893760] font-bold tracking-wider uppercase mb-1">
                SYSTEM MENU
              </div>

              {/* Active Chat Tab */}
              <div className="pixel-btn bg-[#f8a5c2] text-[#4a2034] p-2 rounded flex items-center gap-2 cursor-pointer font-bold text-sm">
                <MessageSquare className="w-4 h-4" />
                <span className="mt-2 text-[12px] ">AI CHAT</span>
              </div>

              {/* Reset Session Tab */}
              <button
                onClick={handleResetSession}
                className="pixel-btn bg-[#ffffff] hover:bg-[#fff0f4] text-[#893760] w-full p-2 rounded flex items-center gap-2 text-xs font-semibold text-left"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="mt-2 text-[12px] ">NEW CHAT</span>
              </button>

              {/* Quick Contact Form Tab */}
              <button
                onClick={() => sendMessage("/kontak")}
                className="pixel-btn bg-[#ffffff] hover:bg-[#fff0f4] text-[#893760] w-full p-2 rounded flex items-center gap-2 text-xs font-semibold text-left"
                title="Buka Formulir Kontak"
              >
                <span className="text-sm">📩</span>
                <span className="mt-2 text-[12px] ">/KONTAK</span>
              </button>

              {/* VTuber Stage Toggle Button */}
              <button
                onClick={handleToggleVtuber}
                className={`pixel-btn w-full p-2 rounded flex items-center justify-between text-xs font-semibold text-left transition-colors cursor-pointer ${
                  isVtuberActive
                    ? "bg-[#059669] text-white shadow-[2px_2px_0px_#024731]"
                    : "bg-[#ffffff] hover:bg-[#fff0f4] text-[#893760]"
                }`}
                title="Buka / Tutup Panggung AI VTuber"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🎭</span>
                  <span className="mt-1 text-[11px] font-bold">AI VTUBER</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    isVtuberActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-[#4a2034]"
                  }`}
                >
                  {isVtuberActive ? "ON" : "OFF"}
                </span>
              </button>

              <div className="overflow-hidden max-w-[160px]">
                <Turnstile
                  ref={chatTurnstileRef}
                  siteKey={chatTurnstileSiteKey}
                  onSuccess={(token) => setChatTurnstileToken(token)}
                  onError={() => setChatTurnstileToken(null)}
                  onExpire={() => setChatTurnstileToken(null)}
                  options={{ size: "compact" }}
                />
              </div>

              {/* Status Box */}
              <div className="border-2 border-[#4a2034] bg-[#ffffff] p-2.5 rounded text-[11px] text-[#893760] space-y-1.5 shadow-[2px_2px_0px_#4a2034]">
                <div className="flex justify-between font-bold">
                  <span>TIME</span>
                  <span>{time || "12:00"}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>USERS</span>
                  <span className="text-emerald-600 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    {activeUsers} Online
                  </span>
                </div>
                {queueInfo && (
                  <div className="flex justify-between font-bold text-[10px]">
                    <span>AI QUEUE</span>
                    <span
                      className={
                        queueInfo.queuedCount > 0
                          ? "text-amber-600 font-bold"
                          : "text-emerald-600"
                      }
                    >
                      {queueInfo.queuedCount > 0
                        ? `${queueInfo.queuedCount} Antre`
                        : "Lancar"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>SESSION</span>
                  <span className="text-emerald-600">ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Bottom Profile Widget */}
            <div className="border-2 border-[#4a2034] bg-[#ffeef2] p-2.5 rounded flex flex-col items-center text-center shadow-[2px_2px_0px_#4a2034]">
              <img
                src={BOT_AVATAR}
                alt="Nestia Bot"
                className="w-11 h-11 rounded-full object-cover border-2 border-[#4a2034] mb-1.5 shadow-sm"
              />
              <span className="text-[11px] text-[#893760] font-bold">
                Nestia Bot v1.1
              </span>
              <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wide">
                Ready to Help
              </span>
            </div>
          </div>

          {/* Main Chat Canvas & Messages Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#fff5f7]">
            {/* Quick Suggestion Chips (Desktop & Mobile) */}
            <div className="bg-[#ffe8ef] border-b-2 border-[#4a2034] px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
              <span className="font-pixel-freddy text-xs text-[#893760] font-bold flex items-center gap-1 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-[#f47fa2]" /> TANYA CEPAT:
              </span>
              {SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(item.text)}
                  className="pixel-btn bg-white hover:bg-[#feddde] text-[#4a2034] text-xs px-2.5 py-1 rounded-full shrink-0 inline-flex items-center gap-1.5 transition-colors font-pixel-freddy tracking-wide"
                >
                  <span className="leading-tight translate-y-[0.5px]">
                    {item.label}
                  </span>
                  <span className="text-xs sm:text-sm leading-none inline-block -translate-y-[3px]">
                    {item.emoji}
                  </span>
                </button>
              ))}
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 pixel-scrollbar pixel-chat-canvas">
              {messages.map((msg) => {
                if (msg.isContactCard) {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-start gap-2 sm:gap-3 flex-row w-full"
                    >
                      {/* Retro AI Avatar Badge */}
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[2.5px] border-[#2D1B22] bg-[#FCE7EE] shrink-0 overflow-hidden flex items-center justify-center mt-1 shadow-[1px_1px_0px_#2D1B22]">
                        <span className="font-pixel-freddy text-[11px] font-bold text-[#2D1B22]">
                          AI
                        </span>
                      </div>

                      {/* Contact Card Container */}
                      <div className="flex flex-col flex-1 min-w-0 items-start">
                        <div className="font-pixel-freddy flex items-center gap-1.5 mb-1 px-1 text-[11px] font-bold text-[#893760]">
                          <span>NestiaDev</span>
                          <span className="text-[10px] opacity-75">[{msg.time}]</span>
                        </div>

                        {/* Inline Contact Card Form */}
                        <ContactFormCard prefill={msg.contactPrefill} />
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-2 sm:gap-3 ${
                      msg.sender === "You" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Face Avatar */}
                    <img
                      src={msg.avatar}
                      alt={msg.sender}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-[#4a2034] shadow-[1.5px_1.5px_0px_#4a2034] shrink-0 bg-white"
                    />

                    {/* Bubble Content */}
                    <div
                      className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
                        msg.sender === "You" ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Sender & Timestamp */}
                      <div className="font-pixel-freddy flex items-center gap-1.5 mb-1 px-1 text-[11px] font-bold text-[#893760]">
                        <span>{msg.sender}</span>
                        <span className="text-[10px] opacity-75">
                          [{msg.time}]
                        </span>
                      </div>

                      {/* Bubble */}
                      <div
                        className={`p-2 sm:p-2.5 px-3 text-xs sm:text-[13px] pixel-bubble-text leading-snug whitespace-pre-wrap break-words select-text ${
                          msg.sender === "You"
                            ? "pixel-bubble-user"
                            : "pixel-bubble-ai"
                        }`}
                      >
                        {/* Attached image preview if user sent an image */}
                        {msg.imageUrl && (
                          <div className="mb-2 overflow-hidden border-2 border-[#4a2034] rounded-lg shadow-sm">
                            <img
                              src={msg.imageUrl}
                              alt="Uploaded"
                              className="max-h-52 w-full object-cover cursor-pointer hover:opacity-95"
                              onClick={() => window.open(msg.imageUrl, "_blank")}
                            />
                          </div>
                        )}
                        <span>{msg.text}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Bot Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-2.5 sm:gap-3.5"
                >
                  <img
                    src={BOT_AVATAR}
                    alt="Bot thinking"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-[#4a2034] shadow-[1.5px_1.5px_0px_#4a2034] shrink-0 bg-white"
                  />
                  <div className="flex flex-col items-start">
                    <div className="font-pixel-freddy text-xs font-bold text-[#893760] mb-1 px-1">
                      NestiaDev [AI] sedang berpikir...
                    </div>
                    <div className="pixel-bubble-ai px-4 py-2.5 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#f47fa2] animate-bounce [animation-delay:0s]"></span>
                        <span className="w-2 h-2 rounded-full bg-[#f47fa2] animate-bounce [animation-delay:0.15s]"></span>
                        <span className="w-2 h-2 rounded-full bg-[#f47fa2] animate-bounce [animation-delay:0.3s]"></span>
                      </div>
                      {queueInfo && queueInfo.queuedCount > 0 && (
                        <div className="text-[10px] text-amber-800 bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded font-pixel-freddy">
                          Sedang dalam antrean AI ({queueInfo.queuedCount} antrean). Mohon tunggu sejenak...
                        </div>
                      )}
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
            <div className="bg-[#ffdbe3] border-t-2 sm:border-t-4 border-[#4a2034] p-2 sm:p-2.5 flex items-center gap-1.5 sm:gap-2 shrink-0 font-pixel-freddy">
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
                  <div className="pixel-emoji-popup overflow-hidden rounded-lg border-2 border-[#4a2034] shadow-[4px_4px_0px_#4a2034] bg-[#feddde]">
                    <Picker
                      data={data}
                      theme="light"
                      previewPosition="none"
                      skinTonePosition="none"
                      emojiSize={24}
                      emojiButtonSize={34}
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
              <div className="flex-1 flex items-center bg-white border-2 border-[#4a2034] rounded px-2.5 py-1 shadow-[inset_1px_1px_0px_rgba(74,32,52,0.1)] h-8 sm:h-9">
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full bg-transparent outline-none text-xs sm:text-sm text-[#4a2034] placeholder:text-[#c4899f] font-sans placeholder:font-pixel-freddy placeholder:text-xs"
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

      {/* ── FRAME 2 (RIGHT): AI VTuber Stage (Hiyori Pro) — Desktop Only ── */}
      {isVtuberActive && (
        <div className="hidden md:flex w-[320px] lg:w-[380px] xl:w-[420px] 2xl:w-[460px] shrink-0 h-full flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-300">
          <Suspense
            fallback={
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#180d13] border-2 sm:border-4 border-[#4a2034] rounded-lg p-4 text-center font-pixel-freddy text-[#fadadd]">
                <div className="w-10 h-10 rounded-full border-4 border-[#f4b8c4] border-t-transparent animate-spin mb-3" />
                <span className="text-xs">MEMUAT AI VTUBER STAGE...</span>
              </div>
            }
          >
            <VTuberStage
              onClose={() => setIsVtuberActive(false)}
              externalSubtitle={vtuberSubtitle}
              externalSpeaking={vtuberSpeaking}
            />
          </Suspense>
        </div>
      )}
    </div>
  </section>
  );
};

export default ChatApp;
