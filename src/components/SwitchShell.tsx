import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import MainScene from "../game/scenes/MainScene";
import BattleScene from "../game/scenes/BattleScene";
import { GAME_WIDTH, GAME_HEIGHT } from "../game/constants";

/* ═══════════════════════════════════════════════════════════
   SWITCH SHELL — Lightweight console frame for Pellet Town
   ═══════════════════════════════════════════════════════════ */

const dispatchKey = (key: string, type: "keydown" | "keyup") =>
  window.dispatchEvent(new KeyboardEvent(type, { key }));

const DPadBtn = ({ label, k }: { label: string; k: string }) => (
  <button
    onMouseDown={() => dispatchKey(k, "keydown")}
    onMouseUp={() => dispatchKey(k, "keyup")}
    onTouchStart={() => dispatchKey(k, "keydown")}
    onTouchEnd={() => dispatchKey(k, "keyup")}
    className="w-5 sm:w-6 h-5 sm:h-6 bg-slate-800 active:bg-slate-700 text-white font-bold rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer border border-slate-900/85"
  >
    <span className="text-[7px] text-slate-300">{label}</span>
  </button>
);

interface Props { onBack?: () => void }

export default function SwitchShell({ onBack }: Props) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [power, setPower] = useState<"off" | "boot" | "on">("off");

  const handlePower = () => {
    if (power === "off") {
      setPower("boot");
      setTimeout(() => setPower("on"), 1800);
    } else {
      setPower("off");
      if (gameRef.current) { gameRef.current.destroy(true); gameRef.current = null; }
    }
  };

  useEffect(() => {
    if (power === "on" && !gameRef.current) {
      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO, width: GAME_WIDTH, height: GAME_HEIGHT,
        parent: "switch-screen",
        physics: { default: "arcade", arcade: { gravity: { y: 0, x: 0 }, debug: false } },
        scene: [MainScene, BattleScene], pixelArt: true,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      });
    }
  }, [power]);

  useEffect(() => () => { gameRef.current?.destroy(true); gameRef.current = null; }, []);

  const joyL = "#00c3e3", joyR = "#ff4554";

  return (
    <div className="flex flex-col items-center">
      {/* Power button */}
      <div className="w-full max-w-[700px] flex justify-between items-center px-4 mb-3 font-mono text-[9px] font-bold tracking-widest select-none">
        <span className="text-gray-600">◀ OFF</span>
        <button onClick={handlePower}
          className="relative w-14 h-7 bg-white border-2 border-black paper-shadow-sm flex items-center p-0.5 cursor-pointer"
        >
          <div className={`w-6 h-6 border-2 border-black transform transition-transform duration-200 flex items-center justify-center ${
            power !== "off" ? "translate-x-6 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-gray-300"
          }`}>
            <div className="w-1.5 h-3 flex gap-0.5 opacity-50">
              <div className="w-[1px] bg-black/40 h-full" /><div className="w-[1px] bg-black/40 h-full" />
            </div>
          </div>
        </button>
        <span className="text-gray-600">ON ▶</span>
      </div>

      {/* Console Assembly */}
      <div className="relative flex items-center justify-center select-none">
        {/* Top vent detail */}
        <div className="absolute top-[-12px] left-[15%] right-[15%] h-[12px] bg-slate-800 rounded-t-md flex justify-between px-6 border-t border-slate-700/60 opacity-95 pointer-events-none z-0">
          <div className="w-16 h-1 bg-slate-950 rounded-full mt-1 flex gap-0.5 px-1 justify-between">
            {[...Array(4)].map((_, i) => <div key={i} className="w-0.5 h-full bg-slate-700" />)}
          </div>
        </div>

        {/* ─── JoyCon LEFT ─── */}
        <div className="relative w-[68px] sm:w-[74px] h-[340px] sm:h-[380px] rounded-l-[36px] border-r-4 border-slate-950 flex flex-col items-center justify-between py-6 sm:py-8 select-none"
          style={{ backgroundColor: joyL, boxShadow: "inset -8px 0 16px rgba(0,0,0,0.3), 3px 6px 12px rgba(0,0,0,0.2)" }}
        >
          {/* L/ZL */}
          <div className="absolute top-[-10px] left-2 right-1 h-[14px] bg-slate-800 rounded-tl-lg rounded-tr-md flex justify-between px-1 border-b border-slate-900 shadow-inner">
            <span className="text-[7px] text-slate-400 font-bold flex items-center justify-center w-1/2">L</span>
            <span className="text-[7px] text-slate-400 font-bold flex items-center justify-center w-1/2">ZL</span>
          </div>
          {/* Minus */}
          <div className="w-full flex justify-end px-5"><div className="w-4 h-1.5 bg-slate-800 rounded-full shadow-md" /></div>
          {/* Analog L */}
          <div className="w-11 sm:w-13 h-11 sm:h-13 bg-slate-800 rounded-full shadow-lg border-[3px] border-slate-900/60 flex items-center justify-center"
            style={{ background: "radial-gradient(circle, #2d3748, #1a202c)" }}
          >
            <div className="w-8 h-8 rounded-full border border-slate-700/50 flex flex-wrap p-1 items-center justify-center opacity-60">
              {[...Array(4)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full mx-1" />)}
            </div>
          </div>
          {/* D-Pad */}
          <div className="relative w-14 sm:w-16 h-14 sm:h-16 grid grid-cols-3 grid-rows-3 gap-0.5 items-center justify-items-center mt-1">
            <div className="col-start-2 row-start-1"><DPadBtn label="▲" k="w" /></div>
            <div className="col-start-1 row-start-2"><DPadBtn label="◀" k="a" /></div>
            <div className="col-start-2 row-start-2 w-3 h-3 bg-slate-900/40 rounded-full" />
            <div className="col-start-3 row-start-2"><DPadBtn label="▶" k="d" /></div>
            <div className="col-start-2 row-start-3"><DPadBtn label="▼" k="s" /></div>
          </div>
          {/* Screenshot */}
          <div className="w-4 h-4 bg-slate-800 rounded-sm border-2 border-slate-950 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-900/90" />
          </div>
        </div>

        {/* ─── CENTER SCREEN ─── */}
        <div className="flex-grow max-w-[460px] bg-slate-950 p-2.5 sm:p-3.5 relative flex flex-col justify-center items-center shadow-2xl"
          style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6), inset 0 1px 3px rgba(255,255,255,0.1)", borderRadius: "14px" }}
        >
          <div className="w-full relative rounded-lg overflow-hidden border border-slate-900"
            style={{ aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}` }}
          >
            <div id="switch-screen" className="w-full h-full bg-[#1a1a2e] relative">
              {power === "off" && (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <p className="font-mono text-[10px] text-slate-600 animate-pulse">PRESS POWER TO START</p>
                </div>
              )}
              {power === "boot" && (
                <div className="w-full h-full bg-black flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-2 border-white/80 rounded-full flex items-center justify-center mb-3">
                    <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin" />
                  </div>
                  <p className="font-mono text-[10px] text-white/60 tracking-widest">LOADING...</p>
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex justify-between items-center px-4 mt-2">
            <span className="text-[7px] text-slate-600 tracking-wider font-bold">NESTIA SWITCH</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[6px] text-slate-700">STATUS</span>
              <span className={`w-1.5 h-1.5 rounded-full ${power === "on" ? "bg-green-500 animate-pulse" : "bg-slate-800"}`} />
            </div>
          </div>
        </div>

        {/* ─── JoyCon RIGHT ─── */}
        <div className="relative w-[68px] sm:w-[74px] h-[340px] sm:h-[380px] rounded-r-[36px] border-l-4 border-slate-950 flex flex-col items-center justify-between py-6 sm:py-8 select-none"
          style={{ backgroundColor: joyR, boxShadow: "inset 8px 0 16px rgba(0,0,0,0.3), -3px 6px 12px rgba(0,0,0,0.2)" }}
        >
          {/* R/ZR */}
          <div className="absolute top-[-10px] left-1 right-2 h-[14px] bg-slate-800 rounded-tr-lg rounded-tl-md flex justify-between px-1 border-b border-slate-900 shadow-inner">
            <span className="text-[7px] text-slate-400 font-bold flex items-center justify-center w-1/2">R</span>
            <span className="text-[7px] text-slate-400 font-bold flex items-center justify-center w-1/2">ZR</span>
          </div>
          {/* Plus */}
          <div className="w-full flex justify-start px-5 relative">
            <div className="w-4 h-4 relative"><div className="absolute w-3.5 h-1 bg-slate-800 rounded-sm top-1.5 left-0" /><div className="absolute w-1 h-3.5 bg-slate-800 rounded-sm top-0 left-1.5" /></div>
          </div>
          {/* ABXY */}
          <div className="relative w-14 sm:w-16 h-14 sm:h-16 grid grid-cols-3 grid-rows-3 gap-0.5 items-center justify-items-center mt-1">
            <div className="col-start-2 row-start-1"><DPadBtn label="X" k="w" /></div>
            <div className="col-start-1 row-start-2"><DPadBtn label="Y" k="a" /></div>
            <div className="col-start-2 row-start-2 w-3 h-3 bg-slate-900/40 rounded-full" />
            <div className="col-start-3 row-start-2">
              <button onMouseDown={() => dispatchKey(" ", "keydown")} onMouseUp={() => dispatchKey(" ", "keyup")}
                className="w-5 sm:w-6 h-5 sm:h-6 bg-slate-800 active:bg-slate-700 text-emerald-400 font-bold rounded-full flex items-center justify-center shadow-md active:scale-95 cursor-pointer border-2 border-slate-900"
              ><span className="text-[9px]">A</span></button>
            </div>
            <div className="col-start-2 row-start-3"><DPadBtn label="B" k="Escape" /></div>
          </div>
          {/* Analog R */}
          <div className="w-11 sm:w-13 h-11 sm:h-13 bg-slate-800 rounded-full shadow-lg border-[3px] border-slate-900/60 flex items-center justify-center mt-2"
            style={{ background: "radial-gradient(circle, #2d3748, #1a202c)" }}
          >
            <div className="w-8 h-8 rounded-full border border-slate-700/50 flex flex-wrap p-1 items-center justify-center opacity-60">
              {[...Array(4)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full mx-1" />)}
            </div>
          </div>
          {/* Home */}
          <div className="w-5 h-5 bg-slate-800 active:bg-slate-700 rounded-full shadow-md border-[2px] border-slate-900 flex items-center justify-center cursor-pointer">
            <div className="w-2 h-2 rounded-full bg-slate-600" />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="mt-4 w-full max-w-[700px] flex justify-between items-center bg-white border-2 border-black p-3 paper-shadow-sm font-mono text-[9px] font-bold tracking-wider text-gray-700">
        <span>STATUS: {power === "off" ? "⬛ OFF" : power === "boot" ? "🟡 BOOTING..." : "🟢 RUNNING"}</span>
        <span className="text-emerald-600">PELLET TOWN v1.0</span>
      </div>
    </div>
  );
}
