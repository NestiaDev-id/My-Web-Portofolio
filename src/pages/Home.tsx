import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import P5RansomText from "../components/P5RansomText";
import Momoisay from "../components/momoisay";
import { MessageSquare, Play } from "lucide-react";

const MENU_ITEMS = [
  { label: "PROJECTS", path: "/projects" },
  { label: "SKILLS", path: "/about" },
  { label: "Game", path: "/game" },
  { label: "CHAT ME", path: "/chat-me" },
];

function HomePage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlocked = useRef(false);

  // Unlock audio on first user gesture
  useEffect(() => {
    const unlock = () => {
      audioUnlocked.current = true;
    };
    window.addEventListener("pointerdown", unlock, { once: true, capture: true });
    window.addEventListener("keydown", unlock, { once: true, capture: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const playSelect = useCallback(() => {
    if (!audioUnlocked.current || !sfxRef.current) return;
    try {
      sfxRef.current.currentTime = 0;
      const p = sfxRef.current.play();
      if (p && p.catch) p.catch(() => {});
    } catch {}
  }, []);

  const goTo = useCallback(
    (path: string) => {
      playSelect();
      navigate(path);
    },
    [navigate, playSelect]
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = (prev + 1) % MENU_ITEMS.length;
          playSelect();
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = (prev - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
          playSelect();
          return next;
        });
      } else if (e.key === "Enter") {
        goTo(MENU_ITEMS[selectedIndex].path);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedIndex, goTo, playSelect]);

  return (
    <section
      className="p5-home relative z-[2] flex flex-col justify-between min-h-[calc(100vh-80px)] md:justify-center md:min-h-screen px-[5vw] py-[2vh]"
      aria-label="Main menu"
    >
      {/* SFX Audio */}
      <audio ref={sfxRef} src="/p5/sfx/select.mp3" preload="auto" />

      {/* Hero section */}
      <div className="p5-home-hero flex flex-col items-start w-full pt-1 pb-3">
        {/* Eyebrow */}
        <div className="p5-intro-eyebrow text-p5-white text-xs font-bold tracking-[0.2em] mb-2 uppercase">
          Take a look at my work
        </div>

        {/* Big Name */}
        <h1
          className="p5-big-name cursor-pointer mb-3"
          onClick={() => playSelect()}
        >
          <P5RansomText text="YOHANES" />
          <P5RansomText text="CHRISTIAN" />
        </h1>

        {/* JRPG DIALOGUE BOX (Hanya untuk Mobile) */}
        <div className="relative bg-black/95 text-white p-4 border-[3px] border-white rounded-br-[2.5rem] rounded-tl-lg shadow-[6px_6px_0px_rgba(0,0,0,0.8)] max-w-xl md:hidden">
          <p className="text-sm leading-relaxed font-medium">
            Fullstack Developer, Software Engineer, and AI Enthusiast from
            Indonesia. I build intuitive web experiences, from browser-based
            interactive applications to scalable cloud-deployed AI services.
          </p>
          {/* Ikon segitiga berkedip ala nunggu di-klik/scroll */}
          <div className="absolute bottom-2 right-3 animate-pulse">
            <Play className="w-4 h-4 fill-white text-white rotate-90" />
          </div>
        </div>

        {/* Tagline Asli Persona 5 (Hanya untuk Desktop) */}
        <p className="p5-tagline hidden md:block">
          Fullstack Developer, Software Engineer, and AI Enthusiast from Indonesia.
          I build intuitive web experiences, from browser-based interactive applications
          to scalable cloud-deployed AI services.
        </p>
      </div>

      {/* Ticker tape - mobile only */}
      <div className="md:hidden relative z-20 w-[120%] -ml-[10%] h-10 bg-[#fcd116] border-y-[4px] border-black flex items-center transform -rotate-2 my-2 shadow-2xl overflow-hidden pointer-events-none select-none">
        <div className="animate-marquee font-black text-black text-sm tracking-[0.3em] uppercase">
          [ SYSTEM ALERT ] // UNAUTHORIZED ACCESS // [ PORTFOLIO ] // [ SYSTEM ALERT ] // UNAUTHORIZED ACCESS // [ PORTFOLIO ] // [ SYSTEM ALERT ] // UNAUTHORIZED ACCESS // [ PORTFOLIO ] //
        </div>
      </div>

      {/* Menu section */}
      <div className="relative z-10 w-full md:bg-transparent -mx-[5vw] px-[5vw] pt-6 pb-20 md:mx-0 md:px-0 md:pt-0 md:pb-0 flex-1 md:flex-initial flex flex-col justify-start">
        <div
          className="md:hidden absolute inset-0 -top-5 bg-[#0b0b0d] -z-10"
          style={{
            transform: "rotate(-2deg)",
            transformOrigin: "top left",
            width: "130%",
            left: "-15%",
            height: "calc(100% + 60px)",
          }}
        />
        <nav
          className="p5-home-nav md:mt-[4vh] flex flex-col items-start gap-[0.6vh]"
          aria-label="Sections"
        >
          {MENU_ITEMS.map((item, i) => (
            <button
              key={item.label}
              className={`p5-menu-item ${item.label === "CHAT ME" ? "hidden md:block" : ""} ${i === selectedIndex ? "sel" : ""}`}
              onMouseEnter={() => {
                setSelectedIndex(i);
                playSelect();
              }}
              onClick={() => goTo(item.path)}
            >
              <P5RansomText
                text={item.label}
                className="text-[clamp(26px,4.2vw,56px)]"
              />
              <span className="p5-cursor-mark">◀</span>
            </button>
          ))}
        </nav>
      </div>

      {/* AI chat button - mobile only */}
      <button
        onClick={() => goTo("/chat-me")}
        className="md:hidden fixed right-5 bottom-6 z-50 flex items-center gap-2.5 bg-[#e60012] text-white px-4 py-3 rounded-full border-2 border-white shadow-[4px_4px_0px_#000] active:scale-95 transition-all cursor-pointer"
        aria-label="Chat AI"
      >
        <div className="relative flex items-center justify-center">
          <MessageSquare className="w-5 h-5 fill-white text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-black animate-ping" />
        </div>
        <span className="font-bold text-xs tracking-wider font-mono uppercase text-white">
          Chat with Me
        </span>
      </button>

      {/* Mascot - desktop only */}
      <div className="absolute right-[-5vw] bottom-[5vh] lg:right-[5vw] lg:bottom-[10vh] opacity-40 lg:opacity-100 z-0 lg:z-[50] origin-bottom-right pointer-events-none lg:pointer-events-auto hidden md:block">
        <Momoisay className="rotate-[4deg] scale-75 lg:scale-150" />
      </div>
    </section>
  );
}

export default HomePage;