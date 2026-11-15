import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Phaser from "phaser";
import MainScene from "../game/scenes/MainScene";
import BattleScene from "../game/scenes/BattleScene";
import { GAME_WIDTH, GAME_HEIGHT } from "../game/constants";
import { virtualPad } from "../game/virtualPad";
import {
  playRetroSound,
  triggerHaptic,
  toggleRetroMute,
} from "../game/retroAudio";
import SwitchShell from "../components/SwitchShell";

/* ════════════════════════════════════════════════════════════════
   GAME CONSOLE PAGE
   Persona 5 × Scrapbook Game Boy Shell & Switch Shell
   ════════════════════════════════════════════════════════════════ */

const GameConsolePage: React.FC = () => {
  const navigate = useNavigate();
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const gbGameRef = useRef<Phaser.Game | null>(null);
  const powerTimerRef = useRef<number | null>(null);
  const audioUnlocked = useRef(false);

  const [consoleType, setConsoleType] = useState<"gameboy" | "switch">("gameboy");
  const [gbPower, setGbPower] = useState<"off" | "boot" | "on">("off");
  const [isMobile, setIsMobile] = useState(false);

  // Button States for tactile press animation
  const [activeDirection, setActiveDirection] = useState<
    "up" | "down" | "left" | "right" | null
  >(null);
  const [isAPressed, setIsAPressed] = useState(false);
  const [isBPressed, setIsBPressed] = useState(false);
  const [isStartPressed, setIsStartPressed] = useState(false);
  const [isSelectPressed, setIsSelectPressed] = useState(false);
  const [isMuted, setIsMutedState] = useState(false);

  const dpadRef = useRef<HTMLDivElement | null>(null);
  const dpadPointerId = useRef<number | null>(null);

  // Unlock audio on first interaction
  useEffect(() => {
    const unlock = () => {
      audioUnlocked.current = true;
    };
    window.addEventListener("pointerdown", unlock, { once: true, capture: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  const playSound = useCallback(() => {
    if (!audioUnlocked.current || !sfxRef.current) return;
    try {
      sfxRef.current.currentTime = 0;
      sfxRef.current.play().catch(() => {});
    } catch {}
  }, []);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768
      );
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Force Game Boy on mobile
  useEffect(() => {
    if (isMobile && consoleType === "switch") {
      setConsoleType("gameboy");
    }
  }, [isMobile, consoleType]);

  // Handle Game Boy Power & Phaser Init
  useEffect(() => {
    if (consoleType === "gameboy" && gbPower === "on" && !gbGameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        parent: "gb-screen",
        physics: {
          default: "arcade",
          arcade: { gravity: { y: 0, x: 0 }, debug: false },
        },
        scene: [MainScene, BattleScene],
        pixelArt: true,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      };
      gbGameRef.current = new Phaser.Game(config);
    }
  }, [gbPower, consoleType]);

  // Cleanup Game Boy Phaser on unmount or switch change
  useEffect(() => {
    return () => {
      if (powerTimerRef.current !== null) {
        window.clearTimeout(powerTimerRef.current);
        powerTimerRef.current = null;
      }
      if (gbGameRef.current) {
        gbGameRef.current.destroy(true);
        gbGameRef.current = null;
      }
      virtualPad.releaseAll();
    };
  }, []);

  // Release virtual buttons on window blur
  useEffect(() => {
    const handleBlur = () => {
      virtualPad.releaseAll();
      setActiveDirection(null);
      setIsAPressed(false);
      setIsBPressed(false);
      setIsStartPressed(false);
      setIsSelectPressed(false);
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, []);

  const handleGbPowerSwitch = () => {
    playRetroSound("power");
    triggerHaptic(20);
    playSound();

    if (gbPower === "off") {
      setGbPower("boot");
      powerTimerRef.current = window.setTimeout(() => {
        powerTimerRef.current = null;
        setGbPower("on");
      }, 2000);
    } else {
      if (powerTimerRef.current !== null) {
        window.clearTimeout(powerTimerRef.current);
        powerTimerRef.current = null;
      }
      setGbPower("off");
      virtualPad.releaseAll();
      setActiveDirection(null);
      if (gbGameRef.current) {
        gbGameRef.current.destroy(true);
        gbGameRef.current = null;
      }
    }
  };

  // Switch console mode handler
  const handleConsoleSwitch = (type: "gameboy" | "switch") => {
    playSound();
    if (type !== consoleType) {
      if (powerTimerRef.current !== null) {
        window.clearTimeout(powerTimerRef.current);
        powerTimerRef.current = null;
      }
      if (gbGameRef.current) {
        gbGameRef.current.destroy(true);
        gbGameRef.current = null;
        setGbPower("off");
      }
      virtualPad.releaseAll();
      setConsoleType(type);
    }
  };

  // ─── D-Pad Touch Drag & Press Logic ───
  const updateDpadDirection = (clientX: number, clientY: number) => {
    if (!dpadRef.current) return;
    const rect = dpadRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    // Deadzone
    if (dist < 10) {
      if (activeDirection) {
        virtualPad.setButton(activeDirection, false);
        setActiveDirection(null);
      }
      return;
    }

    let newDir: "up" | "down" | "left" | "right";
    if (Math.abs(dx) > Math.abs(dy)) {
      newDir = dx < 0 ? "left" : "right";
    } else {
      newDir = dy < 0 ? "up" : "down";
    }

    if (newDir !== activeDirection) {
      if (activeDirection) {
        virtualPad.setButton(activeDirection, false);
      }
      virtualPad.setButton(newDir, true);
      setActiveDirection(newDir);
      playRetroSound("dpad");
      triggerHaptic(12);
    }
  };

  const handleDpadPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    dpadPointerId.current = e.pointerId;
    updateDpadDirection(e.clientX, e.clientY);
  };

  const handleDpadPointerMove = (e: React.PointerEvent) => {
    if (dpadPointerId.current !== null && dpadPointerId.current === e.pointerId) {
      e.preventDefault();
      updateDpadDirection(e.clientX, e.clientY);
    }
  };

  const handleDpadPointerUp = (e: React.PointerEvent) => {
    if (dpadPointerId.current === e.pointerId) {
      e.preventDefault();
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
      dpadPointerId.current = null;
      if (activeDirection) {
        virtualPad.setButton(activeDirection, false);
        setActiveDirection(null);
      }
    }
  };

  // ─── Action Buttons Logic (A, B, START, SELECT) ───
  const handleButtonDown = (
    btn: "a" | "b" | "start" | "select",
    e?: React.SyntheticEvent
  ) => {
    e?.preventDefault();
    triggerHaptic(15);
    playRetroSound(btn);

    if (btn === "a") {
      setIsAPressed(true);
      virtualPad.setButton("a", true);
    } else if (btn === "b") {
      setIsBPressed(true);
      virtualPad.setButton("b", true);
    } else if (btn === "start") {
      setIsStartPressed(true);
      virtualPad.setButton("start", true);
      if (gbPower === "off") {
        handleGbPowerSwitch();
      }
    } else if (btn === "select") {
      setIsSelectPressed(true);
      virtualPad.setButton("select", true);
      const muted = toggleRetroMute();
      setIsMutedState(muted);
    }
  };

  const handleButtonUp = (
    btn: "a" | "b" | "start" | "select",
    e?: React.SyntheticEvent
  ) => {
    e?.preventDefault();
    if (btn === "a") {
      setIsAPressed(false);
      virtualPad.setButton("a", false);
    } else if (btn === "b") {
      setIsBPressed(false);
      virtualPad.setButton("b", false);
    } else if (btn === "start") {
      setIsStartPressed(false);
      virtualPad.setButton("start", false);
    } else if (btn === "select") {
      setIsSelectPressed(false);
      virtualPad.setButton("select", false);
    }
  };

  return (
    <section className="relative z-[2] min-h-screen bg-[#ece5d8] newspaper-grid text-black overflow-y-auto p5-scroll pb-20 select-none">
      <audio ref={sfxRef} src="/p5/sfx/select.mp3" preload="none" />

      {/* Top bar */}
      <div className="w-full h-4 bg-black" />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-6 sm:pt-8">
        {/* ─── Header + Back ─── */}
        <div className="flex items-center gap-4 mb-4">
          <button
            className="p5-back-hint"
            onClick={() => {
              playSound();
              navigate("/");
            }}
          >
            ESC · Back
          </button>
        </div>

        {/* ─── Title ─── */}
        <header className="relative mb-6 sm:mb-8 text-center">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-p5-red opacity-30 -rotate-[3deg] scale-110 -z-10" />
            <h1 className="font-bungee text-2xl md:text-4xl text-black px-6 py-3 bg-white border-4 border-black -rotate-1 paper-shadow-lg uppercase inline-block">
              🎮 GAME CONSOLE
            </h1>
          </div>
          <p className="font-typewriter text-xs text-gray-600 mt-4 max-w-md mx-auto">
            Mainkan Pellet Town Adventure di dalam konsol pilihanmu!
          </p>
        </header>

        {/* ─── Console Selector (Desktop Only) ─── */}
        {!isMobile && (
          <div className="flex justify-center items-center gap-6 mb-10">
            <button
              onClick={() => handleConsoleSwitch("gameboy")}
              className={`relative px-6 py-3 font-bungee text-sm uppercase transition-all duration-200 border-4 border-black paper-shadow-sm ${
                consoleType === "gameboy"
                  ? "bg-p5-red text-white scale-110 rotate-1 z-10 shadow-[4px_4px_0px_#000]"
                  : "bg-white text-gray-400 hover:bg-gray-100 grayscale"
              }`}
            >
              🕹️ Game Boy
              {consoleType === "gameboy" && (
                <div className="absolute -top-3 -right-3 bg-yellow-300 text-black border-2 border-black px-1.5 py-0.5 text-[10px] font-mono rotate-12">
                  ACTIVE
                </div>
              )}
            </button>
            <button
              onClick={() => handleConsoleSwitch("switch")}
              className={`relative px-6 py-3 font-bungee text-sm uppercase transition-all duration-200 border-4 border-black paper-shadow-sm ${
                consoleType === "switch"
                  ? "bg-[#00c3e3] text-white scale-110 -rotate-1 z-10 shadow-[4px_4px_0px_#000]"
                  : "bg-white text-gray-400 hover:bg-gray-100 grayscale"
              }`}
            >
              🎮 Switch
              {consoleType === "switch" && (
                <div className="absolute -top-3 -right-3 bg-[#ff4554] text-white border-2 border-black px-1.5 py-0.5 text-[10px] font-mono rotate-12">
                  ACTIVE
                </div>
              )}
            </button>
          </div>
        )}

        {/* ════ MAIN LAYOUT ════ */}
        <div
          className={`grid grid-cols-1 ${
            consoleType === "gameboy" ? "lg:grid-cols-12" : "lg:grid-cols-1"
          } gap-8 items-start`}
        >
          {/* ─── LEFT: Manual & Controls (Below Game Boy on mobile) ─── */}
          <div
            className={`${
              consoleType === "gameboy" ? "lg:col-span-5" : "max-w-3xl mx-auto w-full"
            } space-y-6 order-2 ${consoleType === "gameboy" ? "lg:order-1" : ""}`}
          >
            {/* How to Play Card */}
            <div
              className={`bg-white border-4 border-black p-5 sm:p-6 relative ${
                consoleType === "gameboy" ? "-rotate-1" : "rotate-0"
              } paper-shadow-lg dot-grid-bg`}
            >
              <div className="absolute -top-3 left-6 bg-p5-red text-white px-2 py-0.5 font-mono text-[9px] font-bold -rotate-[4deg] uppercase border border-black shadow-[2px_2px_0px_#000]">
                MANUAL
              </div>
              <h3 className="font-bungee text-sm text-black mt-2 mb-4 uppercase">
                📖 PANDUAN BERMAIN
              </h3>

              <div className="space-y-3 text-xs font-typewriter text-gray-700">
                <p className="border-b border-dashed border-black/30 pb-2">
                  Nyalakan saklar{" "}
                  <span className="font-heavy-block text-p5-red">POWER</span> di atas
                  atau tekan tombol <span className="font-heavy-block text-black">START</span>.
                  Gunakan tombol virtual di layar atau keyboard.
                </p>

                {/* Control Mappings */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "D-PAD", key: "↑↓←→ / WASD" },
                    { label: "TOMBOL A", key: "Interaksi / Space" },
                    { label: "TOMBOL B", key: "Lari / Shift / Esc" },
                    { label: "START", key: "Jeda (Pause) / Enter" },
                    { label: "SELECT", key: "Bip Audio / Mute" },
                    { label: "POWER", key: "Saklar Daya ON/OFF" },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-yellow-50 px-2 py-1.5 border-2 border-black paper-shadow-sm"
                    >
                      <span className="text-[10px] font-heavy-block text-gray-500">
                        {c.label}
                      </span>
                      <span className="font-heavy-block text-[10px] text-black">
                        {c.key}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-gray-500 text-center mt-2 border-t border-dashed border-black/20 pt-2">
                  🎮 Tombol Game Boy dioptimalkan untuk layar sentuh mobile dengan feedback haptik dan audio 8-bit.
                </p>
              </div>

              {/* Tape deco */}
              <div className="absolute -bottom-2 -right-4 w-16 h-8 bg-[#fed7aa] rotate-[35deg] opacity-70 border-t border-black border-dashed pointer-events-none z-0" />
            </div>

            {/* Game Info Card */}
            <div
              className={`bg-amber-50 border-4 border-black p-5 relative ${
                consoleType === "gameboy" ? "rotate-1" : "rotate-0"
              } paper-shadow notebook-lines`}
            >
              <div className="absolute -top-3 right-8 bg-black text-yellow-300 px-2 py-0.5 font-mono text-[9px] font-bold rotate-[3deg] uppercase border border-black">
                GAME INFO
              </div>
              <h3 className="font-bungee text-sm text-black mt-2 mb-3 uppercase">
                🗺️ PELLET TOWN ADVENTURE
              </h3>
              <div className="font-typewriter text-xs text-gray-800 space-y-2 leading-relaxed">
                <p>
                  Jelajahi dunia Pellet Town, berbicara dengan penduduk (NPC), dan nikmati
                  suasana retro RPG klasik!
                </p>
                <p>
                  Dibuat dengan <span className="font-heavy-block text-blue-600">Phaser.js</span> &
                  TypeScript dalam format DMG-01 Game Boy.
                </p>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {["Phaser.js", "TypeScript", "Mobile Touch", "GameBoy DMG"].map(
                  (t, i) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 text-[9px] font-heavy-block border border-black paper-shadow-sm ${
                        i % 2 === 0
                          ? "bg-p5-red text-white rotate-1"
                          : "bg-black text-white -rotate-1"
                      }`}
                    >
                      {t}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* ─── RIGHT / TOP: Console Shell ─── */}
          <div
            className={`${
              consoleType === "gameboy"
                ? "lg:col-span-7 flex flex-col items-center"
                : "w-full flex flex-col items-center mb-10"
            } order-1 ${consoleType === "gameboy" ? "lg:order-2" : ""}`}
          >
            {consoleType === "gameboy" ? (
              <>
                {/* ════ GAME BOY SHELL ════ */}
                {/* Power Switch */}
                <div className="w-full max-w-[360px] sm:max-w-[400px] flex justify-between items-center px-4 mb-3 select-none font-mono text-[9px] font-bold tracking-widest">
                  <span className="text-gray-600">◀ POWER OFF</span>
                  <button
                    type="button"
                    onClick={handleGbPowerSwitch}
                    aria-label="Game Boy Power Switch"
                    className="relative w-14 h-7 bg-white border-2 border-black paper-shadow-sm flex items-center p-0.5 cursor-pointer transition-all touch-manipulation"
                  >
                    <div
                      className={`w-6 h-6 border-2 border-black transform transition-transform duration-200 flex items-center justify-center ${
                        gbPower !== "off"
                          ? "translate-x-6 bg-p5-red shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                          : "bg-gray-300 shadow-sm"
                      }`}
                    >
                      <div className="w-1.5 h-3 flex gap-0.5 opacity-50">
                        <div className="w-[1px] bg-black/40 h-full" />
                        <div className="w-[1px] bg-black/40 h-full" />
                      </div>
                    </div>
                  </button>
                  <span className="text-gray-600">ON ▶</span>
                </div>

                {/* Console Body */}
                <div
                  className="relative w-full max-w-[360px] sm:max-w-[400px] bg-p5-red border-4 border-black paper-shadow-lg flex flex-col items-center p-4 sm:p-5 select-none overflow-hidden touch-none"
                  style={{ minHeight: 520, borderRadius: "24px 24px 32px 32px" }}
                >
                  {/* Subtle housing mold lines */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/20" />
                  <div className="absolute bottom-4 left-6 right-6 h-0.5 bg-white/10" />

                  {/* ─── Screen Bezel ─── */}
                  <div
                    className="w-full bg-black border-4 border-black p-3 sm:p-4 flex flex-col justify-between relative"
                    style={{
                      borderRadius: "16px",
                      boxShadow:
                        "inset 0 0 15px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.15)",
                      minHeight: 270,
                    }}
                  >
                    {/* Screen bezel stripes */}
                    <div className="absolute top-2 left-4 right-4 flex items-center gap-1.5">
                      <div className="h-[1.5px] bg-p5-red/80 flex-1 rounded" />
                      <span className="text-[7px] text-gray-400 font-extrabold tracking-[1.5px] whitespace-nowrap uppercase font-mono">
                        Pellet Town • DMG-01
                      </span>
                      <div className="h-[1.5px] bg-gray-500/80 w-12 rounded" />
                    </div>

                    {/* Battery indicator + Screen */}
                    <div className="flex justify-between items-center flex-1 mt-4 gap-3">
                      <div className="flex flex-col items-center gap-1 mt-2">
                        <div
                          className={`w-2.5 h-2.5 border border-black/30 transition-all duration-300 ${
                            gbPower !== "off"
                              ? "bg-p5-red shadow-[0_0_8px_rgba(239,68,68,0.9)]"
                              : "bg-stone-800"
                          }`}
                        />
                        <span className="text-[6px] text-gray-400 font-extrabold uppercase font-mono">
                          PWR
                        </span>
                      </div>

                      {/* Screen Box */}
                      <div
                        className="flex-1 bg-stone-950 p-1.5 border-2 border-stone-800/80 flex items-center justify-center"
                        style={{
                          boxShadow: "inset 0 3px 5px rgba(0,0,0,0.9)",
                          borderRadius: "8px",
                          minHeight: 220,
                        }}
                      >
                        <div
                          className="w-full relative"
                          style={{ aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}` }}
                        >
                          <div
                            id="gb-screen"
                            className="absolute inset-0 overflow-hidden border border-stone-900 bg-[#9bbc0f] flex items-center justify-center"
                            style={{ borderRadius: "4px" }}
                          >
                            {gbPower === "off" && (
                              <div
                                className="w-full h-full bg-[#1b2110] flex items-center justify-center cursor-pointer"
                                onClick={handleGbPowerSwitch}
                                style={{ boxShadow: "inset 0 0 16px rgba(0,0,0,0.85)" }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                                <p className="font-mono text-[8px] text-[#2d3a15] animate-pulse">
                                  PRESS POWER OR START
                                </p>
                              </div>
                            )}
                            {gbPower === "boot" && (
                              <div
                                className="w-full h-full bg-[#9bbc0f] flex flex-col items-center justify-center"
                                style={{ imageRendering: "pixelated" }}
                              >
                                <div className="text-[#0f380f] text-center">
                                  <p className="text-[10px] font-bold font-mono tracking-[2px]">
                                    Nintendo
                                  </p>
                                  <p className="text-[5px] font-mono mt-0.5">®</p>
                                </div>
                                <p className="text-[6px] text-[#0f380f] font-mono mt-4 animate-pulse tracking-wider">
                                  LOADING PELLET TOWN...
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ─── Brand Label ─── */}
                  <div className="w-full flex justify-center mt-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 text-[12px] font-black tracking-tight italic font-sans drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]">
                        Nestia
                      </span>
                      <span className="text-white/80 text-[15px] font-black tracking-widest italic font-sans drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]">
                        GAME BOY
                        <span className="text-[7px] tracking-normal not-italic align-top">
                          ™
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* ─── Controls Section (Mobile Touch Optimized) ─── */}
                  <div className="w-full flex-1 flex flex-col justify-between px-1 sm:px-2 mt-1 touch-none select-none">
                    <div className="flex justify-between items-center sm:items-start">
                      {/* D-Pad Container */}
                      <div
                        ref={dpadRef}
                        onPointerDown={handleDpadPointerDown}
                        onPointerMove={handleDpadPointerMove}
                        onPointerUp={handleDpadPointerUp}
                        onPointerCancel={handleDpadPointerUp}
                        className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center touch-none cursor-pointer"
                        style={{ userSelect: "none", WebkitUserSelect: "none" }}
                      >
                        {/* Circular recess behind D-Pad */}
                        <div className="absolute w-[104px] h-[104px] sm:w-[116px] sm:h-[116px] bg-black/25 rounded-full shadow-inner border border-black/20" />

                        {/* D-Pad Cross */}
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center pointer-events-none">
                          {/* Horizontal Bar */}
                          <div className="absolute top-8 sm:top-9 left-0 w-24 sm:w-28 h-8 sm:h-10 bg-stone-900 border-2 border-black flex justify-between items-center rounded-sm shadow-[0_3px_0_#000]">
                            {/* LEFT */}
                            <div
                              className={`w-8 sm:w-9 h-full flex items-center justify-center text-xs font-black transition-colors ${
                                activeDirection === "left"
                                  ? "bg-stone-950 text-yellow-300 shadow-inner"
                                  : "text-white/80"
                              }`}
                            >
                              ◀
                            </div>
                            {/* RIGHT */}
                            <div
                              className={`w-8 sm:w-9 h-full flex items-center justify-center text-xs font-black transition-colors ${
                                activeDirection === "right"
                                  ? "bg-stone-950 text-yellow-300 shadow-inner"
                                  : "text-white/80"
                              }`}
                            >
                              ▶
                            </div>
                          </div>

                          {/* Vertical Bar */}
                          <div className="absolute top-0 left-8 sm:left-9 w-8 sm:w-10 h-24 sm:h-28 bg-stone-900 border-2 border-black flex flex-col justify-between items-center rounded-sm shadow-[0_3px_0_#000]">
                            {/* UP */}
                            <div
                              className={`w-full h-8 sm:h-9 flex items-center justify-center text-xs font-black transition-colors ${
                                activeDirection === "up"
                                  ? "bg-stone-950 text-yellow-300 shadow-inner"
                                  : "text-white/80"
                              }`}
                            >
                              ▲
                            </div>
                            {/* DOWN */}
                            <div
                              className={`w-full h-8 sm:h-9 flex items-center justify-center text-xs font-black transition-colors ${
                                activeDirection === "down"
                                  ? "bg-stone-950 text-yellow-300 shadow-inner"
                                  : "text-white/80"
                              }`}
                            >
                              ▼
                            </div>
                          </div>

                          {/* Center Pivot */}
                          <div className="absolute top-8 sm:top-9 left-8 sm:left-9 w-8 sm:w-10 h-8 sm:h-10 bg-stone-900 flex items-center justify-center z-10 border border-black/40">
                            <div className="w-3.5 h-3.5 rounded-full bg-stone-800 shadow-inner border border-stone-950" />
                          </div>
                        </div>
                      </div>

                      {/* A/B Buttons In Angled Recess */}
                      <div className="relative w-32 sm:w-36 h-20 sm:h-22 bg-black/20 rounded-[30px] border-2 border-black/30 p-2 flex items-center justify-around rotate-[-25deg] transform translate-y-3 sm:translate-y-4 shadow-inner touch-none">
                        {/* Button B */}
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            aria-label="Button B - Sprint / Cancel"
                            onPointerDown={(e) => handleButtonDown("b", e)}
                            onPointerUp={(e) => handleButtonUp("b", e)}
                            onPointerCancel={(e) => handleButtonUp("b", e)}
                            onPointerLeave={(e) => {
                              if (isBPressed) handleButtonUp("b", e);
                            }}
                            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-black flex items-center justify-center cursor-pointer transition-all touch-manipulation ${
                              isBPressed
                                ? "bg-[#5a0c20] translate-y-1 shadow-[0_1px_0_#000]"
                                : "bg-[#8b1538] hover:bg-[#73122e] shadow-[0_4px_0_#000]"
                            }`}
                          >
                            <span className="text-white text-xs font-black select-none drop-shadow">
                              B
                            </span>
                          </button>
                          <span className="text-white/80 text-[10px] font-black uppercase font-mono tracking-wider rotate-[25deg] mt-1 select-none">
                            B
                          </span>
                        </div>

                        {/* Button A */}
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            aria-label="Button A - Interact / Confirm"
                            onPointerDown={(e) => handleButtonDown("a", e)}
                            onPointerUp={(e) => handleButtonUp("a", e)}
                            onPointerCancel={(e) => handleButtonUp("a", e)}
                            onPointerLeave={(e) => {
                              if (isAPressed) handleButtonUp("a", e);
                            }}
                            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-black flex items-center justify-center cursor-pointer transition-all touch-manipulation ${
                              isAPressed
                                ? "bg-[#5a0c20] translate-y-1 shadow-[0_1px_0_#000]"
                                : "bg-[#8b1538] hover:bg-[#73122e] shadow-[0_4px_0_#000]"
                            }`}
                          >
                            <span className="text-white text-xs font-black select-none drop-shadow">
                              A
                            </span>
                          </button>
                          <span className="text-white/80 text-[10px] font-black uppercase font-mono tracking-wider rotate-[25deg] mt-1 select-none">
                            A
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SELECT & START Buttons */}
                    <div className="flex justify-center items-center gap-8 sm:gap-10 mt-6 sm:mt-7 pb-2 touch-none">
                      {/* SELECT */}
                      <div className="flex flex-col items-center">
                        <button
                          type="button"
                          aria-label="Select Button - Mute / Audio"
                          onPointerDown={(e) => handleButtonDown("select", e)}
                          onPointerUp={(e) => handleButtonUp("select", e)}
                          onPointerCancel={(e) => handleButtonUp("select", e)}
                          onPointerLeave={(e) => {
                            if (isSelectPressed) handleButtonUp("select", e);
                          }}
                          className="w-14 h-8 flex items-center justify-center cursor-pointer touch-manipulation"
                        >
                          <div
                            className={`w-12 h-3.5 rounded-full border border-black transform rotate-[-25deg] transition-all ${
                              isSelectPressed
                                ? "bg-stone-900 translate-y-[2px] shadow-none"
                                : "bg-stone-700 hover:bg-stone-600 shadow-[0_2px_0_#000]"
                            }`}
                          />
                        </button>
                        <span className="text-white/70 text-[8px] font-black uppercase tracking-widest font-mono select-none">
                          SELECT
                        </span>
                      </div>

                      {/* START */}
                      <div className="flex flex-col items-center">
                        <button
                          type="button"
                          aria-label="Start Button - Pause / Resume"
                          onPointerDown={(e) => handleButtonDown("start", e)}
                          onPointerUp={(e) => handleButtonUp("start", e)}
                          onPointerCancel={(e) => handleButtonUp("start", e)}
                          onPointerLeave={(e) => {
                            if (isStartPressed) handleButtonUp("start", e);
                          }}
                          className="w-14 h-8 flex items-center justify-center cursor-pointer touch-manipulation"
                        >
                          <div
                            className={`w-12 h-3.5 rounded-full border border-black transform rotate-[-25deg] transition-all ${
                              isStartPressed
                                ? "bg-stone-900 translate-y-[2px] shadow-none"
                                : "bg-stone-700 hover:bg-stone-600 shadow-[0_2px_0_#000]"
                            }`}
                          />
                        </button>
                        <span className="text-white/70 text-[8px] font-black uppercase tracking-widest font-mono select-none">
                          START
                        </span>
                      </div>
                    </div>

                    {/* Speaker Grill */}
                    <div className="w-full flex justify-end items-end pr-2 gap-1.5 pb-1">
                      <div className="flex-1 flex justify-center text-[7px] text-white/50 font-extrabold tracking-widest uppercase font-mono">
                        🎧 {isMuted ? "Audio Muted" : "Phones"}
                      </div>
                      <div className="flex gap-2 rotate-[-28deg] transform translate-y-3 pr-4">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-10 bg-black/30 rounded-full border border-black/20"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Scrapbook tape deco */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-24 h-5 bg-yellow-200 opacity-80 -rotate-2 border border-black border-dashed flex items-center justify-center text-[7px] font-mono font-bold text-gray-700 tracking-widest">
                    HANDMADE
                  </div>
                </div>

                {/* Status indicator */}
                <div className="mt-4 w-full max-w-[360px] sm:max-w-[400px] flex justify-between items-center bg-white border-2 border-black p-3 paper-shadow-sm font-mono text-[9px] font-bold tracking-wider text-gray-700">
                  <span>
                    STATUS:{" "}
                    {gbPower === "off"
                      ? "⬛ POWER OFF"
                      : gbPower === "boot"
                      ? "🟡 BOOTING..."
                      : "🟢 RUNNING"}
                  </span>
                  <span className="text-p5-red">PELLET TOWN • DMG-01</span>
                </div>
              </>
            ) : (
              /* ════ SWITCH SHELL ════ */
              <div className="w-full max-w-4xl mx-auto transform hover:scale-[1.01] transition-transform duration-500">
                <SwitchShell />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameConsolePage;
