import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ListMusic,
  Music,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";
import { getMuteState, syncAudioElement } from "../utils/audio";

type QueueTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  audioUrl?: string;
  synthPreset?:
    | "pastel-breeze"
    | "ambient-dream"
    | "retro-synth"
    | "lofi-sunset"
    | "chill-hop";
  duration: number;
};

const queueTracks: QueueTrack[] = [
  {
    id: "local-relax",
    title: "Lofi chill",
    artist: "Kero One",
    album: "Relax Session",
    audioUrl: "/assets/Audio/Relax.m4a",
    duration: 180,
  },
  {
    id: "local-focus",
    title: "Focus Session",
    artist: "Sonora",
    album: "Focus Session",
    audioUrl: "/assets/Audio/Focus.m4a",
    duration: 180,
  },
  {
    id: "sonora-me-you",
    title: "Me & You",
    artist: "Alex Skrindo",
    album: "NCS Release",
    synthPreset: "pastel-breeze",
    duration: 198,
  },
  {
    id: "sonora-tearing",
    title: "Tearing Me Up",
    artist: "Bob Moses",
    album: "Days Gone By",
    synthPreset: "ambient-dream",
    duration: 388,
  },
  {
    id: "sonora-lovers",
    title: "Lovers Rock",
    artist: "Sonora Demo",
    album: "Modern Vinyl",
    synthPreset: "retro-synth",
    duration: 216,
  },
  {
    id: "sonora-midnight",
    title: "Midnight Vinyl Groove",
    artist: "The Noir Quartet",
    album: "Pure Analog 33 RPM",
    synthPreset: "lofi-sunset",
    duration: 245,
  },
  {
    id: "sonora-tape",
    title: "Analog Tape Nostalgia",
    artist: "Vintage Frequency",
    album: "Side B Unreleased",
    synthPreset: "chill-hop",
    duration: 182,
  },
];

const synthChords: Record<
  NonNullable<QueueTrack["synthPreset"]>,
  number[][]
> = {
  "pastel-breeze": [
    [261.63, 329.63, 392, 493.88],
    [220, 261.63, 329.63, 392],
    [174.61, 220, 261.63, 329.63],
    [196, 246.94, 293.66, 349.23],
  ],
  "ambient-dream": [
    [146.83, 220, 293.66, 349.23],
    [130.81, 196, 261.63, 329.63],
    [110, 164.81, 220, 261.63],
    [123.47, 185, 246.94, 329.63],
  ],
  "retro-synth": [
    [130.81, 164.81, 196, 246.94],
    [110, 138.59, 164.81, 220],
    [146.83, 174.61, 220, 261.63],
    [164.81, 196, 246.94, 293.66],
  ],
  "lofi-sunset": [
    [174.61, 220, 261.63, 329.63],
    [164.81, 196, 246.94, 293.66],
    [146.83, 174.61, 220, 261.63],
    [130.81, 164.81, 196, 246.94],
  ],
  "chill-hop": [
    [220, 261.63, 329.63, 392],
    [174.61, 220, 261.63, 329.63],
    [196, 246.94, 293.66, 349.23],
    [164.81, 207.65, 246.94, 329.63],
  ],
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

type MusicPlayerContextValue = {
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  currentTrack: QueueTrack;
  tracks: QueueTrack[];
  playTrack: (index: number) => Promise<void>;
  nextTrack: () => Promise<void>;
  prevTrack: () => Promise<void>;
  seek: (seconds: number) => void;
  togglePlay: () => Promise<void>;
  setInlineVisible: (visible: boolean) => void;
};

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [inlineVisible, setInlineVisible] = useState(false);
  const synthRef = useRef<{
    context: AudioContext;
    gain: GainNode;
    timer: number | null;
    clock: number | null;
  } | null>(null);

  const stopSynth = () => {
    if (synthRef.current?.timer) window.clearInterval(synthRef.current.timer);
    if (synthRef.current?.clock) window.clearInterval(synthRef.current.clock);
    synthRef.current?.context.close();
    synthRef.current = null;
  };

  const startSynth = (track: QueueTrack) => {
    stopSynth();
    if (!track.synthPreset) return;
    const context = new AudioContext();
    const gain = context.createGain();
    gain.gain.value = getMuteState() ? 0 : 0.12;
    gain.connect(context.destination);
    let step = 0;
    const playStep = () => {
      const chord = synthChords[track.synthPreset!][step++ % 4];
      chord.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const noteGain = context.createGain();
        oscillator.type = index === 0 ? "triangle" : "sine";
        oscillator.frequency.value = frequency;
        noteGain.gain.setValueAtTime(0.001, context.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(
          0.06 / chord.length,
          context.currentTime + 0.3,
        );
        noteGain.gain.exponentialRampToValueAtTime(
          0.0001,
          context.currentTime + 2.8,
        );
        oscillator.connect(noteGain).connect(gain);
        oscillator.start();
        oscillator.stop(context.currentTime + 3);
      });
    };
    void context.resume();
    playStep();
    const clock = window.setInterval(() => {
      setCurrentTime((time) => {
        const nextTime = time + 0.5;
        if (nextTime >= track.duration) {
          stopSynth();
          setIsPlaying(false);
          return track.duration;
        }
        setProgress((nextTime / track.duration) * 100);
        return nextTime;
      });
    }, 500);
    synthRef.current = {
      context,
      gain,
      timer: window.setInterval(playStep, 2400),
      clock,
    };
  };

  useEffect(() => {
    const syncSynthMute = () => {
      if (synthRef.current)
        synthRef.current.gain.gain.value = getMuteState() ? 0 : 0.12;
    };
    window.addEventListener("global-audio-mute-change", syncSynthMute);
    return () =>
      window.removeEventListener("global-audio-mute-change", syncSynthMute);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    syncAudioElement(audio);

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setProgress(
        audio.duration ? (audio.currentTime / audio.duration) * 100 : 0,
      );
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => () => stopSynth(), []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    const track = queueTracks[trackIndex];
    if (isPlaying) {
      audio.pause();
      stopSynth();
      setIsPlaying(false);
    } else if (track.synthPreset) {
      startSynth(track);
      setIsPlaying(true);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        startSynth({ ...track, synthPreset: "pastel-breeze" });
        setIsPlaying(true);
      }
    }
  };

  const playTrack = async (index: number) => {
    const track = queueTracks[index];
    if (!track.audioUrl && !track.synthPreset) return;
    setTrackIndex(index);
    setCurrentTime(0);
    setProgress(0);
    stopSynth();
    if (audioRef.current) audioRef.current.pause();
    if (track.synthPreset) {
      startSynth(track);
    } else if (audioRef.current) {
      audioRef.current.src = track.audioUrl ?? "";
      try {
        await audioRef.current.play();
      } catch {
        startSynth({ ...track, synthPreset: "pastel-breeze" });
      }
    }
    setIsPlaying(true);
  };

  const nextTrack = () => playTrack((trackIndex + 1) % queueTracks.length);
  const prevTrack = () =>
    playTrack((trackIndex - 1 + queueTracks.length) % queueTracks.length);
  const seek = (seconds: number) => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration)) {
      audio.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        isPlaying,
        progress,
        currentTime,
        duration: queueTracks[trackIndex].synthPreset
          ? queueTracks[trackIndex].duration
          : duration,
        currentTrack: queueTracks[trackIndex],
        tracks: queueTracks,
        playTrack,
        nextTrack,
        prevTrack,
        seek,
        togglePlay,
        setInlineVisible,
      }}
    >
      <audio ref={audioRef} src={queueTracks[0].audioUrl} preload="metadata" />
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
  const { currentTrack, tracks, playTrack } = useMusicPlayer();

  return (
    <div className="relative h-full overflow-hidden border-2 border-black bg-[#f4f1ed] p-5 shadow-[10px_10px_0_#111]">
      <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-72 rotate-[-18deg] bg-[#e91e2b]" />
      <div className="relative mb-5 flex items-center justify-between border-b-2 border-black pb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e91e2b]">
            Playlist
          </p>
          <h3 className="mt-1 text-xl font-black uppercase italic text-black">
            Playlist dump
          </h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close playlist"
            className="bg-black p-1 text-white transition hover:bg-[#e91e2b]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
        {tracks.map((track, index) => (
          <button
            type="button"
            key={track.id}
            disabled={!track.audioUrl && !track.synthPreset}
            onClick={() => void playTrack(index)}
            className={`flex w-full items-center gap-3 border-b border-black/10 px-3 py-3 text-left ${track.id === currentTrack.id ? "bg-[#e91e2b] font-bold text-white" : "text-black"} ${!track.audioUrl && !track.synthPreset ? "cursor-not-allowed opacity-50" : "hover:bg-black hover:text-white"}`}
          >
            <span className="w-5 font-mono text-xs text-zinc-400">
              0{index + 1}
            </span>
            <ListMusic className="h-4 w-4" />
            <span className="truncate text-sm font-semibold">
              {track.title}
            </span>
            <span
              className={`ml-auto text-[9px] uppercase ${track.id === currentTrack.id ? "text-white" : "text-[#e91e2b]"}`}
            >
              {track.synthPreset ? "web audio" : "local audio"}
            </span>
          </button>
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
  const {
    isPlaying,
    progress,
    currentTime,
    duration,
    currentTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setInlineVisible,
  } = useMusicPlayer();
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

  if (variant === "floating") {
    return (
      <aside className="fixed bottom-4 right-4 z-60 w-[min(24rem,calc(100vw-2rem))]">
        <div className="relative overflow-hidden rounded-3xl border border-rose-100/80 bg-white/95 p-3.5 shadow-2xl shadow-rose-950/15 backdrop-blur-xl">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-linear-to-bl from-rose-200/40 via-pink-100/20 to-transparent blur-xl" />
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-rose-500">
              <span
                className={`h-1.5 w-1.5 rounded-full ${isPlaying ? "animate-ping bg-rose-500" : "bg-zinc-300"}`}
              />
              Mini Player
            </span>
            <span className="text-zinc-400">⌄</span>
          </div>
          <div className="my-1 flex items-center gap-3.5">
            <div
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[#181820] shadow-lg ${isPlaying ? "animate-vinyl" : "animate-vinyl animate-vinyl-paused"}`}
            >
              <div className="vinyl-grooves absolute inset-0 rounded-full opacity-80" />
              <div className="absolute inset-2 rounded-full border border-white/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="h-5 w-5 rounded-full border border-[#d4af37] bg-[#242436]" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-bold leading-tight text-slate-800">
                {currentTrack.title}
              </h4>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {currentTrack.artist}
              </p>
              <span className="font-mono text-[10px] font-semibold text-rose-500">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => void prevTrack()}
                aria-label="Previous track"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
              >
                <SkipBack className="h-4 w-4 fill-current" />
              </button>
              <button
                type="button"
                onClick={() => void togglePlay()}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="rounded-full bg-rose-500 p-2.5 text-white shadow-md shadow-rose-300/60"
              >
                <span>
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-white" />
                  ) : (
                    <Play className="h-4 w-4 fill-white" />
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={() => void nextTrack()}
                aria-label="Next track"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
              >
                <SkipForward className="h-4 w-4 fill-current" />
              </button>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label="Seek mini progress"
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-rose-100 accent-rose-500"
            style={{
              background: `linear-gradient(to right, #f43f5e ${progress}%, #ffe4e6 ${progress}%)`,
            }}
          />
        </div>
      </aside>
    );
  }

  const content = (
    <>
      <div className="relative w-full max-w-md transition-all duration-300">
        <div className="relative overflow-visible border-2 border-black bg-[#f7f1e8] px-5 pb-16 pt-6 shadow-[10px_10px_0_#111217] sm:px-6">
          <div
            className="pointer-events-none absolute right-0 top-0 h-24 w-1/2 bg-[#e91e2b]"
            style={{ clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0 100%)" }}
          />
          <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-2/3 -skew-x-12 bg-[#e8dfd3]" />
          <div className="relative z-10 flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div
              className={`relative z-10 shrink-0 overflow-hidden rounded-full border border-white/20 bg-[#181820] shadow-2xl ${"h-44 w-44 md:h-48 md:w-48"} ${isPlaying ? "animate-vinyl" : "animate-vinyl animate-vinyl-paused"}`}
            >
              <div className="vinyl-grooves absolute inset-0 rounded-full opacity-80" />
              <div className="vinyl-reflection absolute inset-0 rounded-full opacity-40" />
              <div className="absolute inset-2 rounded-full border border-white/10" />
              <div className="absolute inset-5 rounded-full border border-white/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-[#d4af37]/60 bg-linear-to-br from-[#1a1a24] via-[#242436] to-[#121218] text-center shadow-inner">
                  <span className="absolute top-5 text-[7px] font-bold tracking-widest text-[#d4af37]">
                    SONORA 33⅓
                  </span>
                  <span className="absolute top-8 max-w-[90%] truncate px-1 text-[8px] font-semibold text-rose-200">
                    {currentTrack.title}
                  </span>
                  <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#d4af37] bg-black" />
                </div>
              </div>
            </div>

            <div className="flex w-full min-w-0 flex-1 flex-col justify-center pt-2 text-center text-black sm:text-left">
              <div className="mb-2 flex items-center gap-2">
                {/* <Music className="h-3 w-3 animate-pulse text-[#ff3040]" /> */}
                <span className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-2">
                  {isPlaying ? "NOW PLAYING" : "PAUSED"}
                </span>
              </div>
              <h4 className="truncate text-xl font-black uppercase italic tracking-tight text-black sm:text-2xl">
                {currentTrack.title}
              </h4>
              <p className="mt-1 truncate text-xs font-medium text-black/60 sm:text-sm">
                {currentTrack.artist} — {currentTrack.album}
              </p>
              <div className="mt-4 w-full">
                <div className="mb-1.5 flex justify-between font-mono text-xs font-semibold text-[#ff3040]">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(event) => seek(Number(event.target.value))}
                  aria-label="Seek player progress"
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-black/15 accent-[#e91e2b]"
                  style={{
                    background: `linear-gradient(to right, #e91e2b ${progress}%, rgba(17,18,23,.18) ${progress}%)`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="absolute -bottom-9 left-1/2 z-20 flex w-[92%] -translate-x-1/2 items-center justify-between border-2 border-black bg-[#f4f1ed] px-4 py-3 shadow-[6px_6px_0_#111217]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-label="Toggle playlist"
                className={`p-2 transition-colors ${isOpen ? "bg-[#e91e2b] text-white" : "text-black hover:bg-[#e91e2b] hover:text-white"}`}
              >
                <ListMusic className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Shuffle"
                className="p-2 text-black hover:bg-[#e91e2b] hover:text-white"
              >
                <Shuffle className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => void prevTrack()}
                aria-label="Previous track"
                className="p-3 text-black hover:bg-[#e91e2b] hover:text-white"
              >
                <SkipBack className="h-5 w-5 fill-current" />
              </button>
              <button
                type="button"
                onClick={() => void togglePlay()}
                aria-label={isPlaying ? "Pause music" : "Play music"}
                className="flex h-12 w-12 items-center justify-center rounded-none bg-[#e91e2b] text-white shadow-[4px_4px_0_#111] transition hover:scale-105 active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 fill-white" />
                ) : (
                  <Play className="h-6 w-6 translate-x-0.5 fill-white" />
                )}
              </button>
              <button
                type="button"
                onClick={() => void nextTrack()}
                aria-label="Next track"
                className="p-3 text-black hover:bg-[#e91e2b] hover:text-white"
              >
                <SkipForward className="h-5 w-5 fill-current" />
              </button>
            </div>
            <button
              type="button"
              aria-label="Repeat"
              className="p-2 text-black hover:bg-[#e91e2b] hover:text-white"
            >
              <Repeat className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <aside
      ref={inlineRef}
      className="mt-8 w-full transition-transform hover:-translate-y-1"
    >
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
