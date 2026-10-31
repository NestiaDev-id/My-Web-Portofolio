import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ListMusic, Music, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, X } from "lucide-react";
import { syncAudioElement } from "../utils/audio";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

type MusicPlayerContextValue = {
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  togglePlay: () => Promise<void>;
  setInlineVisible: (visible: boolean) => void;
};

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [inlineVisible, setInlineVisible] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    syncAudioElement(audio);

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <MusicPlayerContext.Provider
      value={{ isPlaying, progress, currentTime, duration, togglePlay, setInlineVisible }}
    >
      <audio ref={audioRef} src="/pomodoro/audio/Relax.m4a" preload="metadata" />
      {children}
      {isPlaying && !inlineVisible && <MusicWidget variant="floating" />}
    </MusicPlayerContext.Provider>
  );
}

function useMusicPlayer() {
  const player = useContext(MusicPlayerContext);
  if (!player) {
    throw new Error("MusicWidget must be rendered inside MusicPlayerProvider.");
  }
  return player;
}

function PlaylistDump({ onClose }: { onClose: () => void }) {
  return (
    <div className="h-full rounded-[28px] border border-white/60 bg-[#fbf7f4] p-6 shadow-lg">
      <div className="mb-5 flex items-center justify-between border-b border-rose-100 pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400">Playlist</p>
          <h3 className="mt-1 text-xl font-bold text-slate-800">Playlist dump</h3>
        </div>
        {onClose && <button type="button" onClick={onClose} aria-label="Close playlist"><X className="h-4 w-4 text-slate-400" /></button>}
      </div>
      <div className="space-y-2">
        {["Lofi chill", "Lovers Rock", "Come Inside Of My Heart"].map((track, index) => (
          <div key={track} className={`flex items-center gap-3 rounded-xl px-3 py-3 ${index === 0 ? "bg-rose-50 text-rose-600" : "text-slate-500"}`}>
            <span className="w-5 font-mono text-xs text-zinc-400">0{index + 1}</span>
            <ListMusic className="h-4 w-4" />
            <span className="truncate text-sm font-semibold">{track}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MusicWidget({
  variant = "inline",
}: {
  variant?: "inline" | "floating";
}) {
  const { isPlaying, progress, currentTime, duration, togglePlay, setInlineVisible } = useMusicPlayer();
  const [isOpen, setIsOpen] = useState(false);
  const inlineRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (variant !== "inline") return;
    const element = inlineRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInlineVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      setInlineVisible(false);
    };
  }, [setInlineVisible, variant]);

  const content = (
    <>
      <div className={`relative w-full max-w-md transition-all duration-300 ${variant === "floating" ? "max-w-none" : ""}`}>
        <div className="relative overflow-visible rounded-[28px] border border-white/60 bg-[#fbf7f4] px-5 pb-16 pt-6 shadow-lg sm:px-6">
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-72 rounded-full bg-linear-to-bl from-pink-100/50 via-rose-50/30 to-transparent blur-2xl" />
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-6">
          <div
            className={`relative z-10 shrink-0 overflow-hidden rounded-full border border-white/20 bg-[#181820] shadow-2xl ${
              variant === "floating" ? "h-20 w-20" : "h-44 w-44 md:h-48 md:w-48"
            } ${isPlaying ? "animate-vinyl" : "animate-vinyl animate-vinyl-paused"}`}
          >
            <div className="vinyl-grooves absolute inset-0 rounded-full opacity-80" />
            <div className="vinyl-reflection absolute inset-0 rounded-full opacity-40" />
            <div className="absolute inset-2 rounded-full border border-white/10" />
            <div className="absolute inset-5 rounded-full border border-white/5" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-[#d4af37]/60 bg-linear-to-br from-[#1a1a24] via-[#242436] to-[#121218] text-center shadow-inner">
                <span className="absolute top-5 text-[7px] font-bold tracking-widest text-[#d4af37]">SONORA 33⅓</span>
                <span className="absolute top-8 text-[8px] font-semibold text-rose-200">Lofi chill</span>
                <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#d4af37] bg-black" />
              </div>
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-1 flex-col justify-center pt-2 text-center sm:text-left">
            <div className="mb-2 flex items-center gap-2">
              <Music className="h-3 w-3 animate-pulse text-rose-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">{isPlaying ? "NOW PLAYING" : "PAUSED"}</span>
            </div>
            <h4 className="truncate text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">Lofi chill</h4>
            <p className="mt-1 truncate text-xs font-medium text-slate-500 sm:text-sm">Kero One</p>
            <div className="mt-4 w-full">
              <div className="mb-1.5 flex justify-between font-mono text-xs font-semibold text-rose-400"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-rose-200/60"><div className="h-full bg-rose-500 transition-all" style={{ width: `${progress}%` }} /></div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-9 left-1/2 z-20 flex w-[92%] -translate-x-1/2 items-center justify-between rounded-3xl border border-white/80 bg-white/95 px-4 py-3 shadow-xl">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setIsOpen((open) => !open)} aria-label="Toggle playlist" className={`rounded-xl p-2 transition-colors ${isOpen ? "bg-rose-50 text-rose-500" : "text-zinc-400 hover:text-zinc-700"}`}>
              <ListMusic className="h-4 w-4" />
            </button>
            <Shuffle className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="flex items-center gap-4">
            <button type="button" aria-label="Previous track" className="rounded-2xl p-3 text-slate-400"><SkipBack className="h-5 w-5 fill-current" /></button>
            <button type="button" onClick={() => void togglePlay()} aria-label={isPlaying ? "Pause music" : "Play music"} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-rose-500 to-pink-400 text-white shadow-lg shadow-rose-300/60 transition hover:scale-105 active:scale-95">
              {isPlaying ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 translate-x-0.5 fill-white" />}
            </button>
            <button type="button" aria-label="Next track" className="rounded-2xl p-3 text-slate-400"><SkipForward className="h-5 w-5 fill-current" /></button>
          </div>
          <div className="flex items-center gap-1"><Repeat className="h-4 w-4 text-zinc-400" /></div>
        </div>
      </div>
      </div>
    </>
  );

  if (variant === "floating") {
    return <aside className="fixed bottom-4 right-4 z-60 w-[min(21rem,calc(100vw-2rem))]">{content}</aside>;
  }

  return (
    <aside ref={inlineRef} className="mt-8 w-full transition-transform hover:-translate-y-1">
      <div className="relative w-full max-w-md">
        {content}
        {isOpen && (
          <div className="mt-4 w-full lg:absolute lg:left-[calc(100%+1.5rem)] lg:top-0 lg:mt-0 lg:w-72">
            <PlaylistDump onClose={() => setIsOpen(false)} />
          </div>
        )}
      </div>
    </aside>
  );
}
