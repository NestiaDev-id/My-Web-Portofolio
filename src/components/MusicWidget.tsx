import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ListMusic, Music, Pause, Play, X } from "lucide-react";

type MusicPlayerContextValue = {
  isPlaying: boolean;
  progress: number;
  togglePlay: () => Promise<void>;
  setInlineVisible: (visible: boolean) => void;
};

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inlineVisible, setInlineVisible] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
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
      value={{ isPlaying, progress, togglePlay, setInlineVisible }}
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

function PlaylistDump({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="mb-2 border-4 border-black bg-[#f4f0e6] p-3 shadow-[5px_5px_0_#000]">
      <div className="mb-2 flex items-center justify-between border-b-2 border-black pb-2">
        <span className="font-bungee text-[10px] text-black">PLAYLIST DUMP</span>
        <button type="button" onClick={onClose} aria-label="Close playlist">
          <X className="h-4 w-4 text-black" />
        </button>
      </div>
      <div className="space-y-1 text-black">
        <p className="bg-yellow-300 px-2 py-1 text-xs font-bold">01 — Lofi chill</p>
        <p className="px-2 py-1 text-xs opacity-60">02 — Lovers Rock</p>
        <p className="px-2 py-1 text-xs opacity-60">03 — Come Inside Of My Heart</p>
      </div>
    </div>
  );
}

export default function MusicWidget({
  variant = "inline",
}: {
  variant?: "inline" | "floating";
}) {
  const { isPlaying, progress, togglePlay, setInlineVisible } = useMusicPlayer();
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
      <PlaylistDump isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <div className="relative border-4 border-black bg-[#f4f0e6] p-3 shadow-[5px_5px_0_#000]">
        <div className="flex items-center gap-3">
          <div
            className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-4 border-black bg-zinc-800 shadow-inner ${
              isPlaying ? "animate-[spin_4s_linear_infinite]" : ""
            }`}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-red-500">
              <div className="h-2 w-2 rounded-full border border-black bg-[#f4f0e6]" />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Music className="h-3 w-3 animate-pulse text-black" />
              <span className="border border-black bg-yellow-300 px-1 text-[10px] uppercase tracking-widest text-black">
                {isPlaying ? "NOW PLAYING" : "PAUSED"}
              </span>
            </div>
            <h4 className="truncate text-xs font-bold uppercase text-black">Lofi chill</h4>
            <p className="mt-0.5 truncate text-[10px] text-gray-600">Kero One</p>
          </div>

          <button
            type="button"
            onClick={() => void togglePlay()}
            aria-label={isPlaying ? "Pause music" : "Play music"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white shadow-[2px_2px_0_#000] transition-all hover:scale-110 hover:bg-blue-200 active:scale-95"
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-black" /> : <Play className="ml-0.5 h-4 w-4 fill-black" />}
          </button>
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full border border-black/20 bg-black/10">
          <div className="h-full bg-black transition-all" style={{ width: `${progress}%` }} />
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase text-black underline"
        >
          <ListMusic className="h-3 w-3" />
          {isOpen ? "Hide playlist" : "Show playlist"}
        </button>
      </div>
    </>
  );

  if (variant === "floating") {
    return <aside className="fixed bottom-4 right-4 z-[60] w-[min(21rem,calc(100vw-2rem))]">{content}</aside>;
  }

  return (
    <aside ref={inlineRef} className="mt-8 w-full -rotate-2 transition-transform hover:rotate-0">
      {content}
    </aside>
  );
}
