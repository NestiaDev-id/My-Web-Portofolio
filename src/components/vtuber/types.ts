export type VTuberExpression = "senyum" | "jelaskan" | "kaget" | "idle" | "tease";

export type VTuberEngine = "LIVE2D" | "MMD";

export interface VTuberModelConfig {
  id: string;
  name: string;
  type: VTuberEngine;
  modelPath: string;
  scale?: number;
  positionX?: number;
  positionY?: number;
}

export interface VTuberAudioState {
  isSpeaking: boolean;
  voiceEnabled: boolean;
  audioAmplitude: number; // 0 to 1 for lip-sync
  currentSubtitle: string;
  expression: VTuberExpression;
}

export const DEFAULT_VTUBER_MODEL: VTuberModelConfig = {
  id: "hiyori",
  name: "Hiyori Pro",
  type: "LIVE2D",
  modelPath: "/vtuber_chara/hiyori_pro_en/runtime/hiyori_pro_t11.model3.json",
  scale: 0.18,
};
