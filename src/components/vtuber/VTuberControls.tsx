import type { VTuberExpression } from "./types";

interface VTuberControlsProps {
  onExpressionSelect: (expression: VTuberExpression) => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  activeExpression: VTuberExpression;
}

export const VTuberControls = ({
  onExpressionSelect,
  voiceEnabled,
  onToggleVoice,
  activeExpression,
}: VTuberControlsProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 z-10 select-none">
      {/* Senyum (Smile) */}
      <button
        onClick={() => onExpressionSelect("senyum")}
        className={`pixel-btn rounded px-2.5 py-1 font-pixel text-[8.5px] cursor-pointer transition border ${
          activeExpression === "senyum"
            ? "bg-[#F4B8C4] text-[#3B1E26] border-[#3B1E26] font-bold shadow-[1.5px_1.5px_0px_#3B1E26]"
            : "bg-[#1E1E1E] text-[#FADADD] border-[#F4B8C4]/60 hover:bg-[#F4B8C4] hover:text-[#3B1E26]"
        }`}
        title="Ekspresi Senyum & Ceria"
      >
        😊 Senyum
      </button>

      {/* Kaget (Surprised) */}
      <button
        onClick={() => onExpressionSelect("kaget")}
        className={`pixel-btn rounded px-2.5 py-1 font-pixel text-[8.5px] cursor-pointer transition border ${
          activeExpression === "kaget"
            ? "bg-[#F4B8C4] text-[#3B1E26] border-[#3B1E26] font-bold shadow-[1.5px_1.5px_0px_#3B1E26]"
            : "bg-[#1E1E1E] text-[#FADADD] border-[#F4B8C4]/60 hover:bg-[#F4B8C4] hover:text-[#3B1E26]"
        }`}
        title="Ekspresi Kaget / Terkejut"
      >
        😲 Kaget
      </button>

      {/* Jelaskan (Explain / Thinking) */}
      <button
        onClick={() => onExpressionSelect("jelaskan")}
        className={`pixel-btn rounded px-2.5 py-1 font-pixel text-[8.5px] cursor-pointer transition border ${
          activeExpression === "jelaskan"
            ? "bg-[#F4B8C4] text-[#3B1E26] border-[#3B1E26] font-bold shadow-[1.5px_1.5px_0px_#3B1E26]"
            : "bg-[#1E1E1E] text-[#FADADD] border-[#F4B8C4]/60 hover:bg-[#F4B8C4] hover:text-[#3B1E26]"
        }`}
        title="Ekspresi Menjelaskan / Berpikir"
      >
        💡 Jelaskan
      </button>

      {/* Tease (Smug / Playful) */}
      <button
        onClick={() => onExpressionSelect("tease")}
        className={`pixel-btn rounded px-2.5 py-1 font-pixel text-[8.5px] cursor-pointer transition border ${
          activeExpression === "tease"
            ? "bg-[#F4B8C4] text-[#3B1E26] border-[#3B1E26] font-bold shadow-[1.5px_1.5px_0px_#3B1E26]"
            : "bg-[#1E1E1E] text-[#FADADD] border-[#F4B8C4]/60 hover:bg-[#F4B8C4] hover:text-[#3B1E26]"
        }`}
        title="Ekspresi Menggoda / Santai"
      >
        😏 Tease
      </button>

      {/* Idle (Neutral) */}
      <button
        onClick={() => onExpressionSelect("idle")}
        className={`pixel-btn rounded px-2 py-1 font-pixel text-[8.5px] cursor-pointer transition border ${
          activeExpression === "idle"
            ? "bg-[#F4B8C4] text-[#3B1E26] border-[#3B1E26] font-bold shadow-[1.5px_1.5px_0px_#3B1E26]"
            : "bg-[#1E1E1E] text-[#FADADD] border-[#F4B8C4]/60 hover:bg-[#F4B8C4] hover:text-[#3B1E26]"
        }`}
        title="Ekspresi Netral / Standby"
      >
        😐 Netral
      </button>

      {/* Voice Mute / Unmute */}
      <button
        onClick={onToggleVoice}
        className={`pixel-btn rounded px-2.5 py-1 font-pixel text-[8.5px] cursor-pointer transition border ${
          voiceEnabled
            ? "bg-[#059669] text-white border-white/40 hover:bg-[#047857] shadow-[1.5px_1.5px_0px_#024731]"
            : "bg-[#6B7280] text-gray-200 border-gray-400 hover:bg-[#4B5563]"
        }`}
        title={voiceEnabled ? "Klik untuk Mute Suara" : "Klik untuk Menyalakan Suara"}
      >
        {voiceEnabled ? "🔊 VOICE ON" : "🔇 VOICE OFF"}
      </button>
    </div>
  );
};
