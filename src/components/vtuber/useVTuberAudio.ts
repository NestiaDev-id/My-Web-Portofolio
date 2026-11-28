import { useState, useEffect, useRef, useCallback } from "react";
import type { VTuberExpression } from "./types";

interface UseVTuberAudioProps {
  initialVoiceEnabled?: boolean;
}

export function useVTuberAudio({ initialVoiceEnabled = true }: UseVTuberAudioProps = {}) {
  const [voiceEnabled, setVoiceEnabled] = useState(initialVoiceEnabled);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioAmplitude, setAudioAmplitude] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([0.1, 0.2, 0.15, 0.3, 0.15, 0.2, 0.1]);
  const [currentSubtitle, setCurrentSubtitle] = useState(
    '"Panggung AI VTuber aktif! Kirim pesan atau klik tombol ekspresi untuk mencoba interaksi."'
  );
  const [expression, setExpression] = useState<VTuberExpression>("senyum");

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioQueueRef = useRef<Array<{ audioBase64?: string; durationMs?: number; text?: string; expression?: VTuberExpression }>>([]);
  const isPlayingRef = useRef(false);

  // Initialize and unlock AudioContext
  const unlockAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  }, []);

  // Update real-time waveform and amplitude loop
  const updateAudioMeters = useCallback(() => {
    if (!analyserRef.current || !isSpeaking) {
      setAudioAmplitude(0);
      setWaveformData([0.1, 0.15, 0.1, 0.2, 0.1, 0.15, 0.1]);
      return;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    const bars: number[] = [];
    const step = Math.max(1, Math.floor(dataArray.length / 7));

    for (let i = 0; i < 7; i++) {
      const val = dataArray[i * step] || 0;
      bars.push(Math.max(0.1, val / 255));
      sum += val;
    }

    const avg = sum / (dataArray.length * 255);
    setAudioAmplitude(Math.min(1, avg * 2.2));
    setWaveformData(bars);

    animationFrameRef.current = requestAnimationFrame(updateAudioMeters);
  }, [isSpeaking]);

  useEffect(() => {
    if (isSpeaking) {
      animationFrameRef.current = requestAnimationFrame(updateAudioMeters);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAudioAmplitude(0);
      setWaveformData([0.1, 0.15, 0.1, 0.2, 0.1, 0.15, 0.1]);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isSpeaking, updateAudioMeters]);

  // Play audio chunk or simulated speech
  const playAudioChunk = useCallback(
    async (item: { audioBase64?: string; durationMs?: number; text?: string; expression?: VTuberExpression }) => {
      if (item.text) {
        setCurrentSubtitle(item.text);
      }
      if (item.expression) {
        setExpression(item.expression);
      }

      const duration = item.durationMs || 1500;
      setIsSpeaking(true);

      if (voiceEnabled && item.audioBase64 && audioContextRef.current) {
        try {
          const binary = atob(item.audioBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer.slice(0));
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;

          if (analyserRef.current) {
            source.connect(analyserRef.current);
            analyserRef.current.connect(audioContextRef.current.destination);
          } else {
            source.connect(audioContextRef.current.destination);
          }

          source.start(0);
          await new Promise((resolve) => {
            source.onended = resolve;
          });
        } catch {
          // Fallback timer if decode fails
          await new Promise((resolve) => setTimeout(resolve, duration));
        }
      } else {
        // Silent or WebSpeech / simulated duration
        await new Promise((resolve) => setTimeout(resolve, duration));
      }

      setIsSpeaking(false);
    },
    [voiceEnabled]
  );

  // Process sequential audio queue
  const processQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
    isPlayingRef.current = true;

    while (audioQueueRef.current.length > 0) {
      const nextItem = audioQueueRef.current.shift();
      if (nextItem) {
        await playAudioChunk(nextItem);
      }
    }

    isPlayingRef.current = false;
  }, [playAudioChunk]);

  const enqueueAudioChunk = useCallback(
    (chunk: { audioBase64?: string; durationMs?: number; text?: string; expression?: VTuberExpression }) => {
      audioQueueRef.current.push(chunk);
      processQueue();
    },
    [processQueue]
  );

  const toggleVoiceMute = useCallback(() => {
    setVoiceEnabled((prev) => !prev);
  }, []);

  const triggerExpression = useCallback((expr: VTuberExpression, customText?: string) => {
    setExpression(expr);
    const subtitleMap: Record<VTuberExpression, string> = {
      senyum: '"[Ekspresi: Senyum] Senang sekali bisa ngobrol santai bareng kamu! Ada yang mau dibahas lagi?"',
      jelaskan: '"[Ekspresi: Jelaskan] Panel panggung ini dirancang modular dan terpisah dari thread chat utama agar obrolan tetap lega."',
      kaget: '"[Ekspresi: Kaget] Wah, keren banget ide fiturnya! Ayo kita kembangkan lebih lanjut!"',
      idle: '"[Mode Standby] Menunggu pertanyaan berikutnya..."',
      tease: '"[Ekspresi: Menggoda] Hehe, masa soal ginian aja kamu bingung? Sini aku bantu jelasin!"',
    };
    setCurrentSubtitle(customText || subtitleMap[expr]);
    setIsSpeaking(true);
    setTimeout(() => setIsSpeaking(false), 1400);
  }, []);

  return {
    voiceEnabled,
    isSpeaking,
    audioAmplitude,
    waveformData,
    currentSubtitle,
    expression,
    unlockAudioContext,
    toggleVoiceMute,
    triggerExpression,
    enqueueAudioChunk,
    setExpression,
    setCurrentSubtitle,
  };
}
