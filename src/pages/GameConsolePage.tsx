import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Phaser from "phaser";
import MainScene from "../game/scenes/MainScene";
import BattleScene from "../game/scenes/BattleScene";
import { GAME_WIDTH, GAME_HEIGHT } from "../game/constants";

/* ════════════════════════════════════════════════════════════════
   GAME CONSOLE PAGE
   Persona 5 × Scrapbook Game Boy Shell with Pellet Town Adventure
   ════════════════════════════════════════════════════════════════ */

const GameConsolePage: React.FC = () => {
  const navigate = useNavigate();
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const audioUnlocked = useRef(false);

  const [power, setPower] = useState<"off" | "boot" | "on">("off");
  const [isMobile, setIsMobile] = useState(false);

  // Unlock audio on first interaction
  useEffect(() => {
    const unlock = () => { audioUnlocked.current = true; };
    window.addEventListener("pointerdown", unlock, { once: true, capture: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  const playSound = useCallback(() => {
    if (!audioUnlocked.current || !sfxRef.current) return;
    try { sfxRef.current.currentTime = 0; sfxRef.current.play().catch(() => {}); } catch {}
  }, []);

  // Detect mobile
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  // Init Phaser when power turns on
  useEffect(() => {
    if (power === "on" && !gameRef.current) {
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
      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      // Cleanup only on unmount
    };
  }, [power]);

  // Cleanup Phaser on unmount
  useEffect(() => {
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const handlePowerSwitch = () => {
    playSound();
    if (power === "off") {
      setPower("boot");
      setTimeout(() => setPower("on"), 2000);
    } else {
      setPower("off");
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    }
  };

  // Touch dispatch for mobile D-pad
  const dispatchKey = (key: string, type: "keydown" | "keyup") => {
    window.dispatchEvent(new KeyboardEvent(type, { key }));
  };

  return (
    <section className="relative z-[2] min-h-screen bg-[#ece5d8] newspaper-grid text-black overflow-y-auto p5-scroll">
      <audio ref={sfxRef} src="/p5/sfx/select.mp3" preload="auto" />

      {/* Top bar */}
      <div className="w-full h-4 bg-black" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-8 pb-20">

        {/* ─── Header + Back ─── */}
        <div className="flex items-center gap-4 mb-4">
          <button className="p5-back-hint" onClick={() => { playSound(); navigate("/"); }}>
            ESC · Back
          </button>
        </div>

        {/* ─── Title ─── */}
        <header className="relative mb-10 text-center">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-p5-red opacity-30 -rotate-[3deg] scale-110 -z-10" />
            <h1 className="font-bungee text-2xl md:text-4xl text-black px-6 py-3 bg-white border-4 border-black -rotate-1 paper-shadow-lg uppercase inline-block">
              🎮 GAME CONSOLE
            </h1>
          </div>
          <p className="font-typewriter text-xs text-gray-600 mt-4 max-w-md mx-auto">
            Mainkan Pellet Town Adventure di dalam konsol retro buatan tangan!
          </p>
        </header>

        {/* ════ MAIN LAYOUT ════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ─── LEFT: Manual & Controls ─── */}
          <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">

            {/* How to Play Card */}
            <div className="bg-white border-4 border-black p-6 relative -rotate-1 paper-shadow-lg dot-grid-bg">
              <div className="absolute -top-3 left-6 bg-p5-red text-white px-2 py-0.5 font-mono text-[9px] font-bold -rotate-[4deg] uppercase border border-black shadow-[2px_2px_0px_#000]">
                MANUAL
              </div>
              <h3 className="font-bungee text-sm text-black mt-2 mb-4 uppercase">
                📖 PANDUAN BERMAIN
              </h3>

              <div className="space-y-3 text-xs font-typewriter text-gray-700">
                <p className="border-b border-dashed border-black/30 pb-2">
                  Tekan tombol <span className="font-heavy-block text-p5-red">POWER</span> pada konsol untuk menyalakan game. Gunakan keyboard untuk bergerak dan berinteraksi.
                </p>

                {/* Control Mappings */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "GERAKAN", key: "↑↓←→ / WASD" },
                    { label: "INTERAKSI", key: "Space" },
                    { label: "FULLSCREEN", key: "F11" },
                    { label: "POWER", key: "Klik Tombol" },
                  ].map((c, i) => (
                    <div key={i} className="flex justify-between items-center bg-yellow-50 px-2 py-1.5 border-2 border-black paper-shadow-sm">
                      <span className="text-[10px] font-heavy-block text-gray-500">{c.label}</span>
                      <span className="font-heavy-block text-[10px] text-black">{c.key}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-gray-500 text-center mt-2 border-t border-dashed border-black/20 pt-2">
                  Keyboard mapping aktif secara global. Klik tombol virtual pada D-pad untuk layar sentuh.
                </p>
              </div>

              {/* Tape deco */}
              <div className="absolute -bottom-2 -right-4 w-16 h-8 bg-[#fed7aa] rotate-[35deg] opacity-70 border-t border-black border-dashed pointer-events-none z-0" />
            </div>

            {/* Game Info Card */}
            <div className="bg-amber-50 border-4 border-black p-5 relative rotate-1 paper-shadow notebook-lines">
              <div className="absolute -top-3 right-8 bg-black text-yellow-300 px-2 py-0.5 font-mono text-[9px] font-bold rotate-[3deg] uppercase border border-black">
                GAME INFO
              </div>
              <h3 className="font-bungee text-sm text-black mt-2 mb-3 uppercase">🗺️ PELLET TOWN ADVENTURE</h3>
              <div className="font-typewriter text-xs text-gray-800 space-y-2 leading-relaxed">
                <p>Jelajahi dunia Pellet Town, bertemu dengan NPC, dan temukan petualangan seru!</p>
                <p>Game ini dibuat menggunakan <span className="font-heavy-block text-blue-600">Phaser.js</span> dengan pixel art dan mekanika RPG klasik.</p>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {["Phaser.js", "TypeScript", "Pixel Art", "RPG"].map((t, i) => (
                  <span key={i} className={`px-2 py-0.5 text-[9px] font-heavy-block border border-black paper-shadow-sm ${i % 2 === 0 ? 'bg-p5-red text-white rotate-1' : 'bg-black text-white -rotate-1'}`}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Console Shell ─── */}
          <div className="lg:col-span-7 flex flex-col items-center order-1 lg:order-2">

            {/* Power Switch */}
            <div className="w-[340px] md:w-[400px] flex justify-between items-center px-4 mb-3 select-none font-mono text-[9px] font-bold tracking-widest">
              <span className="text-gray-600">◀ POWER OFF</span>
              <button
                onClick={handlePowerSwitch}
                className="relative w-14 h-7 bg-white border-2 border-black paper-shadow-sm flex items-center p-0.5 cursor-pointer transition-all"
              >
                <div className={`w-6 h-6 border-2 border-black transform transition-transform duration-200 flex items-center justify-center ${
                  power !== "off"
                    ? "translate-x-6 bg-p5-red shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                    : "bg-gray-300 shadow-sm"
                }`}>
                  <div className="w-1.5 h-3 flex gap-0.5 opacity-50">
                    <div className="w-[1px] bg-black/40 h-full" />
                    <div className="w-[1px] bg-black/40 h-full" />
                  </div>
                </div>
              </button>
              <span className="text-gray-600">ON ▶</span>
            </div>

            {/* ════ GAME BOY SHELL ════ */}
            <div className="relative w-[340px] md:w-[400px] bg-p5-red border-4 border-black paper-shadow-lg flex flex-col items-center p-5 select-none overflow-hidden"
              style={{ minHeight: 520, borderRadius: "24px 24px 32px 32px" }}
            >
              {/* Subtle housing mold lines */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/20" />
              <div className="absolute bottom-4 left-6 right-6 h-0.5 bg-white/10" />

              {/* ─── Screen Bezel ─── */}
              <div className="w-full bg-black border-4 border-black p-4 flex flex-col justify-between relative"
                style={{
                  borderRadius: "16px",
                  boxShadow: "inset 0 0 15px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.15)",
                  minHeight: 280,
                }}
              >
                {/* Screen bezel stripes */}
                <div className="absolute top-2 left-5 right-5 flex items-center gap-1.5">
                  <div className="h-[1.5px] bg-p5-red/80 flex-1 rounded" />
                  <span className="text-[7px] text-gray-400 font-extrabold tracking-[1.5px] whitespace-nowrap uppercase font-mono">
                    Pellet Town • DMG-01
                  </span>
                  <div className="h-[1.5px] bg-gray-500/80 w-12 rounded" />
                </div>

                {/* Battery indicator + Screen */}
                <div className="flex justify-between items-center flex-1 mt-4 gap-3">
                  {/* Battery LED */}
                  <div className="flex flex-col items-center gap-1 mt-2">
                    <div className={`w-2.5 h-2.5 border border-black/30 transition-all duration-300 ${
                      power !== "off"
                        ? "bg-p5-red shadow-[0_0_8px_rgba(239,68,68,0.9)]"
                        : "bg-stone-800"
                    }`} />
                    <span className="text-[6px] text-gray-400 font-extrabold uppercase font-mono">
                      PWR
                    </span>
                  </div>

                  {/* Screen Box */}
                  <div className="flex-1 bg-stone-950 p-1.5 border-2 border-stone-800/80 flex items-center justify-center"
                    style={{
                      boxShadow: "inset 0 3px 5px rgba(0,0,0,0.9)",
                      borderRadius: "8px",
                      minHeight: 230,
                    }}
                  >
                    <div
                      id="gb-screen"
                      className="w-full overflow-hidden border border-stone-900 bg-[#9bbc0f] relative"
                      style={{ aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}`, borderRadius: "4px", maxHeight: 220 }}
                    >
                      {/* Screen states */}
                      {power === "off" && (
                        <div className="w-full h-full bg-[#1b2110] flex items-center justify-center"
                          style={{ boxShadow: "inset 0 0 16px rgba(0,0,0,0.85)" }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                          <p className="font-mono text-[8px] text-[#2d3a15] animate-pulse">INSERT POWER</p>
                        </div>
                      )}

                      {power === "boot" && (
                        <div className="w-full h-full bg-[#9bbc0f] flex flex-col items-center justify-center"
                          style={{ imageRendering: "pixelated" }}
                        >
                          <div className="text-[#0f380f] text-center">
                            <p className="text-[10px] font-bold font-mono tracking-[2px]">Nintendo</p>
                            <p className="text-[5px] font-mono mt-0.5">®</p>
                          </div>
                          <p className="text-[6px] text-[#0f380f] font-mono mt-4 animate-pulse tracking-wider">
                            LOADING PELLET TOWN...
                          </p>
                        </div>
                      )}

                      {/* When power === "on", Phaser renders here via #gb-screen */}
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Brand Label ─── */}
              <div className="w-full flex justify-center mt-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-[12px] font-black tracking-tight italic font-sans drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]">
                    Nestia
                  </span>
                  <span className="text-white/80 text-[15px] font-black tracking-widest italic font-sans drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]">
                    GAME BOY<span className="text-[7px] tracking-normal not-italic align-top">™</span>
                  </span>
                </div>
              </div>

              {/* ─── Controls Section ─── */}
              <div className="w-full flex-1 flex flex-col justify-between px-2 mt-1">

                {/* D-Pad & Action Buttons */}
                <div className="flex justify-between items-start">

                  {/* D-Pad */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <div className="absolute w-[100px] h-[100px] bg-black/20 rounded-full" />
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      {/* Horizontal */}
                      <div className="absolute top-8 left-0 w-24 h-8 bg-stone-900 border-2 border-black flex justify-between px-1 items-center paper-shadow-sm">
                        <button
                          onMouseDown={() => dispatchKey("a", "keydown")}
                          onMouseUp={() => dispatchKey("a", "keyup")}
                          onTouchStart={() => dispatchKey("a", "keydown")}
                          onTouchEnd={() => dispatchKey("a", "keyup")}
                          className="w-7 h-7 text-white hover:text-yellow-300 font-extrabold text-xs cursor-pointer flex items-center justify-center active:scale-90 transition-all"
                        >◀</button>
                        <button
                          onMouseDown={() => dispatchKey("d", "keydown")}
                          onMouseUp={() => dispatchKey("d", "keyup")}
                          onTouchStart={() => dispatchKey("d", "keydown")}
                          onTouchEnd={() => dispatchKey("d", "keyup")}
                          className="w-7 h-7 text-white hover:text-yellow-300 font-extrabold text-xs cursor-pointer flex items-center justify-center active:scale-90 transition-all"
                        >▶</button>
                      </div>
                      {/* Vertical */}
                      <div className="absolute top-0 left-8 w-8 h-24 bg-stone-900 border-2 border-black flex flex-col justify-between py-1 items-center paper-shadow-sm">
                        <button
                          onMouseDown={() => dispatchKey("w", "keydown")}
                          onMouseUp={() => dispatchKey("w", "keyup")}
                          onTouchStart={() => dispatchKey("w", "keydown")}
                          onTouchEnd={() => dispatchKey("w", "keyup")}
                          className="w-7 h-7 text-white hover:text-yellow-300 font-extrabold text-xs cursor-pointer flex items-center justify-center active:scale-90 transition-all"
                        >▲</button>
                        <button
                          onMouseDown={() => dispatchKey("s", "keydown")}
                          onMouseUp={() => dispatchKey("s", "keyup")}
                          onTouchStart={() => dispatchKey("s", "keydown")}
                          onTouchEnd={() => dispatchKey("s", "keyup")}
                          className="w-7 h-7 text-white hover:text-yellow-300 font-extrabold text-xs cursor-pointer flex items-center justify-center active:scale-90 transition-all"
                        >▼</button>
                      </div>
                      {/* Center cap */}
                      <div className="absolute top-8 left-8 w-8 h-8 bg-stone-900 flex items-center justify-center z-10 border border-black/50">
                        <div className="w-3.5 h-3.5 rounded-full bg-stone-700 shadow-inner" />
                      </div>
                    </div>
                  </div>

                  {/* A/B Buttons */}
                  <div className="relative w-32 h-20 bg-black/20 rounded-[28px] border-2 border-black/30 p-2 flex items-center justify-around rotate-[-25deg] transform translate-y-4">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onMouseDown={() => dispatchKey("z", "keydown")}
                        onMouseUp={() => dispatchKey("z", "keyup")}
                        onTouchStart={() => dispatchKey("z", "keydown")}
                        onTouchEnd={() => dispatchKey("z", "keyup")}
                        className="w-11 h-11 rounded-full bg-black hover:bg-stone-800 text-white font-bold flex items-center justify-center border-2 border-black paper-shadow-sm active:scale-95 cursor-pointer transition-all"
                      >
                        <span className="text-white text-xs font-black select-none">B</span>
                      </button>
                      <span className="text-white/70 text-[10px] font-black uppercase font-mono tracking-wider rotate-[25deg] mt-1">B</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onMouseDown={() => dispatchKey(" ", "keydown")}
                        onMouseUp={() => dispatchKey(" ", "keyup")}
                        onTouchStart={() => dispatchKey(" ", "keydown")}
                        onTouchEnd={() => dispatchKey(" ", "keyup")}
                        className="w-11 h-11 rounded-full bg-black hover:bg-stone-800 text-white font-bold flex items-center justify-center border-2 border-black paper-shadow-sm active:scale-95 cursor-pointer transition-all"
                      >
                        <span className="text-white text-xs font-black select-none">A</span>
                      </button>
                      <span className="text-white/70 text-[10px] font-black uppercase font-mono tracking-wider rotate-[25deg] mt-1">A</span>
                    </div>
                  </div>
                </div>

                {/* SELECT & START */}
                <div className="flex justify-center items-center gap-8 mt-8 pb-2">
                  <div className="flex flex-col items-center gap-1">
                    <button className="w-12 h-3.5 bg-black/60 rounded-full border border-black/40 transform rotate-[-25deg] hover:bg-black/80 active:scale-95 cursor-pointer paper-shadow-sm" />
                    <span className="text-white/60 text-[8px] font-black uppercase tracking-widest font-mono mt-1">SELECT</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <button className="w-12 h-3.5 bg-black/60 rounded-full border border-black/40 transform rotate-[-25deg] hover:bg-black/80 active:scale-95 cursor-pointer paper-shadow-sm" />
                    <span className="text-white/60 text-[8px] font-black uppercase tracking-widest font-mono mt-1">START</span>
                  </div>
                </div>

                {/* Speaker Grill */}
                <div className="w-full flex justify-end items-end pr-2 gap-1.5 pb-1">
                  <div className="flex-1 flex justify-center text-[7px] text-white/50 font-extrabold tracking-widest uppercase font-mono">
                    🎧 Phones
                  </div>
                  <div className="flex gap-2 rotate-[-28deg] transform translate-y-3 pr-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-1.5 h-10 bg-black/30 rounded-full border border-black/20" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Scrapbook tape deco on console */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-24 h-5 bg-yellow-200 opacity-80 -rotate-2 border border-black border-dashed flex items-center justify-center text-[7px] font-mono font-bold text-gray-700 tracking-widest">
                HANDMADE
              </div>
            </div>

            {/* Status indicator below console */}
            <div className="mt-4 w-[340px] md:w-[400px] flex justify-between items-center bg-white border-2 border-black p-3 paper-shadow-sm font-mono text-[9px] font-bold tracking-wider text-gray-700">
              <span>STATUS: {power === "off" ? "⬛ OFF" : power === "boot" ? "🟡 BOOTING..." : "🟢 RUNNING"}</span>
              <span className="text-p5-red">PELLET TOWN v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameConsolePage;
