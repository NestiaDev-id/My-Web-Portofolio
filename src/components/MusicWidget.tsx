import React, { useState } from "react";
import { Play, Pause, Music } from "lucide-react";

const MusicWidget: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  // Optional: You can put a real music URL here, e.g., "/music/lofi.mp3"
  // const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // if (audioRef.current) {
    //   if (isPlaying) audioRef.current.pause();
    //   else audioRef.current.play();
    // }
  };

  return (
    <div className="bg-[#f4f0e6] border-4 border-black p-4 relative -rotate-2 paper-shadow-md transition-transform hover:rotate-0 mt-8">
      {/* Selotip / Tape */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-yellow-200 opacity-80 rotate-3 border-y border-black border-dashed pointer-events-none" />
      
      {/* <audio ref={audioRef} src="/your-music-file.mp3" loop /> */}

      <div className="flex items-center gap-4">
        {/* Piringan Hitam (Vinyl) */}
        <div 
          className={`relative w-16 h-16 rounded-full border-4 border-black bg-zinc-800 flex items-center justify-center shrink-0 shadow-inner overflow-hidden ${isPlaying ? "animate-[spin_4s_linear_infinite]" : ""}`}
        >
          {/* Label Tengah */}
          <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-black flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#f4f0e6] border border-black" />
          </div>
          {/* Garis Kilap Vinyl */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>

        {/* Info Lagu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Music className="w-3 h-3 text-black animate-pulse" />
            <span className="font-bungee text-[10px] text-black uppercase tracking-widest bg-yellow-300 px-1 border border-black">
              ON REPEAT
            </span>
          </div>
          <h4 className="font-heavy-block text-xs uppercase truncate text-black">
            Lofi chill
          </h4>
          <p className="font-typewriter text-[10px] text-gray-600 truncate mt-0.5">
            Kero One
          </p>
        </div>

        {/* Tombol Play/Pause */}
        <button 
          onClick={togglePlay}
          className="w-10 h-10 shrink-0 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-blue-200 hover:scale-110 active:scale-95 transition-all shadow-[2px_2px_0px_#000]"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-black" />
          ) : (
            <Play className="w-4 h-4 fill-black ml-0.5" />
          )}
        </button>
      </div>

      {/* Progress Bar Bohongan */}
      <div className="w-full h-1.5 bg-black/10 rounded-full mt-4 overflow-hidden border border-black/20">
        <div 
          className="h-full bg-black transition-all duration-1000" 
          style={{ width: isPlaying ? "45%" : "0%" }}
        />
      </div>
    </div>
  );
};

export default MusicWidget;
