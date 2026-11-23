interface AudioWaveformProps {
  isSpeaking: boolean;
  waveformData: number[];
  onPlayClick?: () => void;
}

export const AudioWaveform = ({
  isSpeaking,
  waveformData,
  onPlayClick,
}: AudioWaveformProps) => {
  return (
    <div className="bg-[#FADADD] border-2 border-[#3B1E26] rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2 shadow-[3px_3px_0px_#3B1E26] select-none">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onPlayClick}
          className="pixel-btn bg-[#D90429] hover:bg-[#b50322] text-white w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] shrink-0 cursor-pointer shadow-[1px_1px_0px_#3B1E26] transition"
          title="Play / Test Audio Wave"
        >
          {isSpeaking ? "■" : "▶"}
        </button>
        <div className="min-w-0">
          <div className="font-pixel text-[8.5px] font-bold text-[#3B1E26] truncate">
            TTS WAVEFORM
          </div>
          <div className="font-mono-retro text-[9px] text-[#7A3047] truncate">
            Edge-TTS / WebSpeech
          </div>
        </div>
      </div>

      {/* Dynamic 7-bar Equalizer Visualizer */}
      <div className="flex items-end gap-1 h-5 px-1 shrink-0">
        {waveformData.map((val, idx) => {
          const heightPx = Math.max(4, Math.min(20, Math.round(val * 20)));
          const isRed = idx % 2 === 0;
          return (
            <span
              key={idx}
              className={`w-1 rounded-t transition-all duration-75 ${
                isRed ? "bg-[#D90429]" : "bg-[#3B1E26]"
              } ${isSpeaking ? "opacity-100" : "opacity-40"}`}
              style={{ height: `${heightPx}px` }}
            />
          );
        })}
      </div>
    </div>
  );
};
