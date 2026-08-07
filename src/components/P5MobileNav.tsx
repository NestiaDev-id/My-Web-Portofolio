import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import P5RansomText from "./P5RansomText";

const MENU_ITEMS = [
  { label: "HOME", path: "/", icon: "🏠" },
  { label: "PROJECTS", path: "/projects", icon: "📂" },
  { label: "SKILLS", path: "/about", icon: "⚡" },
  { label: "GAME", path: "/game", icon: "🎮" },
  { label: "CHAT ME", path: "/chat-me", icon: "💬" },
];

/* Diagonal slash clip-path for the fullscreen overlay */
const slashVariants = {
  closed: {
    clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)",
    transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] },
  },
  open: {
    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
    transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] },
  },
};

const menuItemVariants = {
  closed: { x: 80, opacity: 0 },
  open: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: 0.15 + i * 0.08,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  exit: (i: number) => ({
    x: -60,
    opacity: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.25,
      ease: [0.76, 0, 0.24, 1],
    },
  }),
};

const P5MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const sfxRef = useRef<HTMLAudioElement | null>(null);

  const playSelect = useCallback(() => {
    if (!sfxRef.current) return;
    try {
      sfxRef.current.currentTime = 0;
      const p = sfxRef.current.play();
      if (p && p.catch) p.catch(() => {});
    } catch {}
  }, []);

  const goTo = useCallback(
    (path: string) => {
      playSelect();
      setIsOpen(false);
      // Small delay so the closing animation plays first
      setTimeout(() => navigate(path), 350);
    },
    [navigate, playSelect]
  );

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <audio ref={sfxRef} src="/p5/sfx/select.mp3" preload="auto" />

      {/* ── Hamburger Button (Mobile Only) ── */}
      <button
        onClick={() => { setIsOpen(!isOpen); playSelect(); }}
        className="fixed top-4 right-4 z-[9999] md:hidden flex flex-col items-center justify-center w-14 h-14 bg-p5-red border-2 border-p5-black shadow-[4px_4px_0px_#000] active:shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition-all"
        style={{ transform: `skewX(-6deg) rotate(${isOpen ? "0" : "-2"}deg)` }}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {/* Three animated bars → X transition */}
        <motion.span
          className="block w-7 h-[3px] bg-p5-white rounded-sm origin-center"
          animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3 }}
        />
        <motion.span
          className="block w-7 h-[3px] bg-p5-white rounded-sm mt-[5px] origin-center"
          animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="block w-7 h-[3px] bg-p5-white rounded-sm mt-[5px] origin-center"
          animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3 }}
        />
      </button>

      {/* ── Fullscreen Overlay ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-nav-overlay"
            className="fixed inset-0 z-[9998] md:hidden"
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* Background: Red diagonal slash */}
            <motion.div
              className="absolute inset-0 bg-p5-red"
              variants={slashVariants}
            />

            {/* Black accent stripe */}
            <motion.div
              className="absolute top-0 right-0 w-[35%] h-full bg-p5-black"
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
            />

            {/* Decorative diagonal lines */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.08 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-p5-white"
                  style={{
                    width: "200%",
                    height: "2px",
                    top: `${i * 9}%`,
                    left: "-20%",
                    transform: `rotate(-8deg)`,
                  }}
                />
              ))}
            </motion.div>

            {/* Menu Content */}
            <div className="relative h-full flex flex-col justify-center px-8 py-20">
              {/* Top label */}
              <motion.div
                className="absolute top-6 left-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.3 }}
              >
                <span className="font-mono text-[10px] text-p5-white/60 tracking-[.3em] uppercase">
                  ── Navigation
                </span>
              </motion.div>

              {/* Menu Items */}
              <nav className="flex flex-col gap-3">
                {MENU_ITEMS.map((item, i) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.button
                      key={item.label}
                      custom={i}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                      exit="exit"
                      className={`group relative flex items-center gap-4 py-3 px-4 text-left transition-all ${
                        selectedIndex === i || isActive
                          ? "translate-x-3"
                          : ""
                      }`}
                      onTouchStart={() => { setSelectedIndex(i); playSelect(); }}
                      onMouseEnter={() => { setSelectedIndex(i); playSelect(); }}
                      onClick={() => goTo(item.path)}
                    >
                      {/* Red bar behind selected item */}
                      <motion.div
                        className="absolute inset-0 bg-p5-black/30 -skew-x-6"
                        initial={false}
                        animate={{
                          scaleX: selectedIndex === i ? 1 : 0,
                          opacity: selectedIndex === i ? 1 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                        style={{ originX: 0 }}
                      />

                      {/* Cursor mark */}
                      <motion.span
                        className="relative text-p5-white text-2xl z-10"
                        animate={{
                          scale: selectedIndex === i ? [1, 1.3, 1] : 1,
                          rotate: selectedIndex === i ? [0, -10, 10, 0] : 0,
                        }}
                        transition={{
                          duration: 0.4,
                          repeat: selectedIndex === i ? Infinity : 0,
                          repeatDelay: 1.5,
                        }}
                      >
                        {item.icon}
                      </motion.span>

                      {/* Label in Ransom style */}
                      <span className="relative z-10">
                        <P5RansomText
                          text={item.label}
                          className="text-[clamp(28px,7vw,48px)]"
                        />
                      </span>

                      {/* Active indicator: triangle */}
                      {(selectedIndex === i || isActive) && (
                        <motion.span
                          className="relative z-10 text-p5-white text-xl ml-auto font-bold"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          ◀
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </nav>

              {/* Bottom decorative text */}
              <motion.div
                className="absolute bottom-6 left-6 right-6 flex justify-between items-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="font-mono text-[9px] text-p5-white/40 tracking-widest">
                  PORTFOLIO // NESTIADEV
                </span>
                <span className="font-mono text-[9px] text-p5-white/40 tracking-widest">
                  © 2026
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default P5MobileNav;
