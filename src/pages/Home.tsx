import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import P5RansomText from "../components/P5RansomText";
import Momoisay from "../components/momoisay";

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
      className="relative z-[2] flex flex-col justify-center min-h-screen px-[4vw] py-[2vh]"
      aria-label="Main menu"
    >
      {/* SFX Audio */}
      <audio ref={sfxRef} src="/p5/sfx/select.mp3" preload="auto" />

      {/* Eyebrow */}
      <div className="p5-intro-eyebrow text-p5-white">Take a look at my work</div>

      {/* Big Name */}
      <h1 className="p5-big-name" onClick={() => playSelect()}>
        <P5RansomText text="YOHANES" />
        <P5RansomText text="DEVANO" />
      </h1>

      {/* Tagline */}
      <p className="p5-tagline">
        Fullstack Developer, Software Engineer, and AI Enthusiast from Indonesia.
        I build intuitive web experiences, from browser-based interactive applications
        to scalable cloud-deployed AI services.
      </p>

      {/* Menu */}
      <nav
        className="mt-[4vh] flex flex-col items-start gap-[0.6vh]"
        aria-label="Sections"
      >
        {MENU_ITEMS.map((item, i) => (
          <button
            key={item.label}
            className={`p5-menu-item ${i === selectedIndex ? "sel" : ""}`}
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

      {/* Momoi Mascot / Vtuber ASCII Art on the right side */}
      <div className="absolute right-[5vw] bottom-[10vh] opacity-100 z-[50] origin-bottom-right pointer-events-auto">
        <Momoisay className="rotate-[4deg] scale-150" />
      </div>
    </section>
  );
}

export default HomePage;
