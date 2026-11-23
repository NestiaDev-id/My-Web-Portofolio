interface LiveSubtitleBarProps {
  subtitle: string;
  isSpeaking: boolean;
}

export const LiveSubtitleBar = ({ subtitle, isSpeaking }: LiveSubtitleBarProps) => {
  return (
    <div className="bg-[#1A1A1A]/95 border-2 border-[#F4B8C4] rounded-lg p-2.5 shadow-[4px_4px_0px_#3B1E26] select-none">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-pixel text-[8.5px] text-[#F4B8C4] tracking-wider">
          LIVE SUBTITLE CAPTION
        </span>
        <span
          className={`font-pixel text-[8px] px-2 py-0.5 rounded flex items-center gap-1 border transition-colors ${
            isSpeaking
              ? "bg-[#059669]/20 text-emerald-400 border-emerald-500 shadow-[0_0_8px_rgba(5,150,105,0.4)]"
              : "bg-[#2B2B2B] text-gray-400 border-gray-700"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSpeaking ? "bg-emerald-400 animate-pulse" : "bg-gray-500"
            }`}
          />
          {isSpeaking ? "LIP-SYNC: SPEAKING" : "LIP-SYNC: IDLE"}
        </span>
      </div>
      <p className="font-mono-retro text-[11px] text-white leading-relaxed line-clamp-3 select-text">
        {subtitle}
      </p>
    </div>
  );
};
