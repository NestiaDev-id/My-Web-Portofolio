import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import MainScene from "../game/scenes/MainScene";
import BattleScene from "../game/scenes/BattleScene";
import { GAME_WIDTH, GAME_HEIGHT } from "../game/constants";

import JoyConLeft from "./JoyConLeft";
import JoyConRight from "./JoyConRight";
import StartupScreen from "./StartupScreen";

/* ═══════════════════════════════════════════════════════════
   SWITCH SHELL — Refactored with Simulator Components
   ═══════════════════════════════════════════════════════════ */

const dispatchKey = (key: string, type: "keydown" | "keyup") => {
  window.dispatchEvent(new KeyboardEvent(type, { key }));
};

export default function SwitchShell() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [power, setPower] = useState<"off" | "boot" | "on">("off");
  
  // Custom colors for JoyCons
  const joyconColors = {
    left: "#00c3e3", // Classic Neon Blue
    right: "#ff4554", // Classic Neon Red
  };

  const handlePower = () => {
    if (power === "off") {
      setPower("boot");
    } else {
      setPower("off");
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    }
  };

  // Maps physical JoyCon button presses to keyboard events for Phaser
  const handleButtonPress = (btn: string) => {
    let key = "";
    switch (btn) {
      case "UP": key = "w"; break;
      case "LEFT": key = "a"; break;
      case "DOWN": key = "s"; break;
      case "RIGHT": key = "d"; break;
      case "A": key = " "; break;
      case "B": key = "Escape"; break;
      case "X": key = "w"; break;
      case "Y": key = "a"; break;
      case "MINUS": key = "q"; break;
      case "PLUS": key = "e"; break;
    }
    
    if (key) {
      dispatchKey(key, "keydown");
      setTimeout(() => dispatchKey(key, "keyup"), 150);
    }
  };

  useEffect(() => {
    if (power === "on" && !gameRef.current) {
      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        parent: "switch-screen",
        physics: { default: "arcade", arcade: { gravity: { y: 0, x: 0 }, debug: false } },
        scene: [MainScene, BattleScene],
        pixelArt: true,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      });
    }
  }, [power]);

  useEffect(() => {
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Power button */}
      <div className="w-full max-w-[700px] flex justify-between items-center px-4 mb-3 font-mono text-[9px] font-bold tracking-widest select-none">
        <span className="text-gray-600">◀ OFF</span>
        <button
          onClick={handlePower}
          className="relative w-14 h-7 bg-white border-2 border-black paper-shadow-sm flex items-center p-0.5 cursor-pointer"
        >
          <div
            className={`w-6 h-6 border-2 border-black transform transition-transform duration-200 flex items-center justify-center ${
              power !== "off"
                ? "translate-x-6 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                : "bg-gray-300"
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

      {/* Console Assembly */}
      <div className="relative flex items-center justify-center select-none w-full max-w-[900px] mx-auto group">
        
        {/* Left JoyCon */}
        <div className="z-10 translate-x-2 group-hover:translate-x-0 transition-transform duration-300 ease-out">
          <JoyConLeft
            color={joyconColors.left}
            onButtonPress={handleButtonPress}
          />
        </div>

        {/* Center Screen Assembly */}
        <div 
          className="z-20 flex-grow w-full min-w-[300px] sm:min-w-[480px] max-w-[640px] bg-slate-950 p-2 sm:p-3 relative flex flex-col justify-center items-center shadow-2xl transition-all"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6), inset 0 1px 3px rgba(255,255,255,0.1)",
            borderRadius: "14px",
            zIndex: 20
          }}
        >
          {/* Top vents */}
          <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-48 h-[10px] bg-slate-800 rounded-t-md flex justify-between px-6 border-t border-slate-700/60 opacity-95 pointer-events-none z-0">
            <div className="w-16 h-1 bg-slate-950 rounded-full mt-1 flex gap-0.5 px-1 justify-between">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-0.5 h-full bg-slate-700" />
              ))}
            </div>
          </div>

          <div
            className="w-full relative rounded-lg overflow-hidden border-2 border-slate-900 bg-black shadow-inner"
            style={{ aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}` }}
          >
            {/* The Screen Display */}
            <div className="absolute inset-0 bg-[#1a1a2e]">
              
              {/* OFF State */}
              {power === "off" && (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <p className="font-mono text-[10px] text-slate-700 tracking-widest">
                    PRESS POWER TO WAKE
                  </p>
                </div>
              )}

              {/* BOOT Sequence */}
              {power === "boot" && (
                <StartupScreen onComplete={() => setPower("on")} />
              )}

              {/* ON State (Phaser Game Container) */}
              <div 
                id="switch-screen" 
                className={`w-full h-full ${power === "on" ? "opacity-100" : "opacity-0 pointer-events-none"} transition-opacity duration-500`}
              />
              
            </div>
          </div>

          {/* Screen Bottom Bezel Details */}
          <div className="w-full flex justify-between items-center px-4 mt-2 h-4">
            <span className="text-[7px] text-slate-600 tracking-widest font-bold">
              NESTIA SWITCH
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[6px] text-slate-700">STATUS</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  power === "on" ? "bg-green-500 animate-pulse" : "bg-slate-800"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Right JoyCon */}
        <div className="z-10 -translate-x-2 group-hover:translate-x-0 transition-transform duration-300 ease-out">
          <JoyConRight
            color={joyconColors.right}
            onButtonPress={handleButtonPress}
          />
        </div>

      </div>

      {/* Status bar (bottom UI) */}
      <div className="mt-8 w-full max-w-[700px] flex justify-between items-center bg-white border-2 border-black p-3 paper-shadow-sm font-mono text-[9px] font-bold tracking-wider text-gray-700">
        <span>
          STATUS: {power === "off" ? "⬛ OFF" : power === "boot" ? "🟡 BOOTING..." : "🟢 RUNNING"}
        </span>
        <span className="text-emerald-600">PELLET TOWN v1.0</span>
      </div>
    </div>
  );
}
