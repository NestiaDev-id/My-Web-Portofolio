import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playLockSound } from "../utils/audio";

interface StartupScreenProps {
  onComplete: () => void;
}

export default function StartupScreen({ onComplete }: StartupScreenProps) {
  // Animation state sequence:
  // 0: Init/Black screen
  // 1: Silver Nintendo logo fades in
  // 2: Brief black transitional fade
  // 3: Red screen with Switch Joycon snap & text glow
  const [phase, setPhase] = useState(0);
  const [isSnapped, setIsSnapped] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Phase 0 -> 1: Show Nintendo Logo
    const timer1 = setTimeout(() => {
      setPhase(1);
    }, 400);

    // Phase 1 -> 2: Brief transitional black
    const timer2 = setTimeout(() => {
      setPhase(2);
    }, 2000);

    // Phase 2 -> 3: Show Red Switch Screen
    const timer3 = setTimeout(() => {
      setPhase(3);
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Handle Joy-Con snap trigger and sound inside Phase 3
  useEffect(() => {
    if (phase !== 3) return;

    // Slide-down Joycon finishes at 600ms
    const snapTimer = setTimeout(() => {
      setIsSnapped(true);
      playLockSound(); // Iconic Switch double mechanical clack
    }, 600);

    // Show Nintendo Switch text slightly after snap
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 1100);

    // Auto-complete the startup after total red screen display duration
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3800);

    return () => {
      clearTimeout(snapTimer);
      clearTimeout(textTimer);
      clearTimeout(completeTimer);
    };
  }, [phase, onComplete]);

  return (
    <div className="absolute inset-0 bg-black z-50 flex items-center justify-center select-none overflow-hidden" id="switch_startup_wrapper">
      <AnimatePresence mode="wait">
        {/* PHASE 1: Silver Nintendo Logo */}
        {phase === 1 && (
          <motion.div
            key="nintendo-logo"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center justify-center"
            id="startup_phase_1"
          >
            <div className="border-[2.5px] border-slate-400 px-7 py-2.5 rounded-full font-black text-xs sm:text-sm tracking-[0.25em] text-slate-300 uppercase font-display shadow-md">
              Nintendo
            </div>
          </motion.div>
        )}

        {/* PHASE 3: Red Screen with Switch Assembly */}
        {phase === 3 && (
          <motion.div
            key="switch-red-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -400 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#e60012] flex flex-col items-center justify-center p-6"
            id="startup_phase_3"
          >
            {/* Visual Ripple Effect from Snap */}
            {isSnapped && (
              <motion.div
                initial={{ scale: 0.3, opacity: 1 }}
                animate={{ scale: 2.8, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute w-24 h-24 rounded-full border-4 border-white/60 pointer-events-none z-10"
                id="snap_ripple_effect"
              />
            )}

            {/* Assemble Logo Container */}
            <div className="relative flex flex-col items-center justify-center gap-6" id="logo_assembly_container">
              <div className="flex items-center gap-3 relative h-20 w-36 justify-center">
                
                {/* Left Joy-Con (Slides from top-left) */}
                <motion.div
                  initial={{ y: -80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
                  className="w-7 h-16 rounded-l-2xl border-r-2 border-[#e60012] flex flex-col items-center justify-start py-2.5 bg-white shrink-0 shadow-lg relative"
                  style={{
                    borderTopLeftRadius: "1.25rem",
                    borderBottomLeftRadius: "1.25rem",
                  }}
                  id="left_joycon_assembly"
                >
                  {/* Joystick Dot */}
                  <div className="w-2.5 h-2.5 rounded-full bg-[#e60012] mb-3" />
                  {/* Bottom D-pad representation or hole */}
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e60012]/40" />
                </motion.div>

                {/* Right Joy-Con (Hollow outline with solid dot, fades/slides up slightly) */}
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                  className="w-7 h-16 rounded-r-2xl border-[4px] border-white flex flex-col items-center justify-end py-2 bg-transparent shrink-0 relative"
                  style={{
                    borderTopRightRadius: "1.25rem",
                    borderBottomRightRadius: "1.25rem",
                    borderLeft: "0",
                  }}
                  id="right_joycon_assembly"
                >
                  {/* Top A/B representation or hole */}
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 mb-3" />
                  {/* Joystick Dot */}
                  <div className="w-2.5 h-2.5 rounded-full bg-white mb-0.5" />
                </motion.div>
              </div>

              {/* Glowing Nintendo Switch Logotype text */}
              <div className="h-10 flex items-center justify-center">
                <AnimatePresence>
                  {showText && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="text-center"
                      id="text_assembly_container"
                    >
                      <h2 className="text-white font-extrabold text-sm sm:text-base tracking-[0.35em] font-sans uppercase">
                        NINTENDO
                      </h2>
                      <p className="text-white/80 font-bold text-[9px] sm:text-[10px] tracking-[0.5em] font-sans uppercase mt-0.5 ml-1">
                        SWITCH
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Accent: Glowing corner prompt */}
            {showText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute bottom-6 right-6 text-[8px] text-white/60 tracking-widest font-mono font-bold"
                id="startup_glowing_prompt"
              >
                BOOTING SYSTEM...
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
