// Authentic 8-bit Web Audio synthesizer & haptics for Game Boy controls

let audioCtx: AudioContext | null = null;
let isAudioMuted: boolean = false;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

export const setMuted = (muted: boolean) => {
  isAudioMuted = muted;
};

export const toggleRetroMute = (): boolean => {
  isAudioMuted = !isAudioMuted;
  return isAudioMuted;
};

export const isRetroMuted = (): boolean => {
  return isAudioMuted;
};

export const playRetroSound = (
  type: "dpad" | "a" | "b" | "start" | "select" | "power"
): void => {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "dpad") {
      // Gentle mechanical click
      osc.type = "triangle";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.025);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      osc.start(now);
      osc.stop(now + 0.025);
    } else if (type === "a") {
      // Classic 8-bit upward confirm chirp (Game Boy style)
      osc.type = "square";
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(659.25, now + 0.04); // E5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === "b") {
      // Classic 8-bit downward cancel/sprint chirp
      osc.type = "square";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(349.23, now + 0.035); // F4
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "start") {
      // Classic Game Boy pause / start chime
      osc.type = "square";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.06); // A5
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === "select") {
      // High subtle pip
      osc.type = "square";
      osc.frequency.setValueAtTime(783.99, now); // G5
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "power") {
      // Mechanical slide switch click
      osc.type = "triangle";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch {
    // Ignore audio context exceptions
  }
};

export const triggerHaptic = (ms: number = 12): void => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(ms);
    } catch {
      // Ignore vibration error if not permitted
    }
  }
};
