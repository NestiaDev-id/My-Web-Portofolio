import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import {
  DEFAULT_VTUBER_MODEL,
  type VTuberEngine,
  type VTuberModelConfig,
} from "./types";
import { Live2DCanvas } from "./Live2DCanvas";
import { VTuberControls } from "./VTuberControls";
import { LiveSubtitleBar } from "./LiveSubtitleBar";
import { AudioWaveform } from "./AudioWaveform";
import { useVTuberAudio } from "./useVTuberAudio";

interface VTuberStageProps {
  modelConfig?: VTuberModelConfig;
  onClose?: () => void;
  externalSubtitle?: string;
  externalSpeaking?: boolean;
}

export default function VTuberStage({
  modelConfig = DEFAULT_VTUBER_MODEL,
  onClose,
  externalSubtitle,
  externalSpeaking,
}: VTuberStageProps) {
  const [activeEngine, setActiveEngine] = useState<VTuberEngine>("LIVE2D");

  const {
    voiceEnabled,
    isSpeaking: audioSpeaking,
    audioAmplitude,
    waveformData,
    currentSubtitle,
    expression,
    toggleVoiceMute,
    triggerExpression,
  } = useVTuberAudio();

  const isSpeaking = externalSpeaking ?? audioSpeaking;
  const subtitle = externalSubtitle || currentSubtitle;

  return (
    <aside className="pixel-chat-frame w-full h-full flex flex-col overflow-hidden bg-[#180d13] border-2 sm:border-4 border-[#4a2034] rounded-lg shadow-[6px_6px_0px_#4a2034] select-none transition-all duration-200">
      {/* ── Standalone Frame Titlebar: Retro Arcade Header ── */}
      <div className="bg-[#f8a5c2] border-b-2 sm:border-b-4 border-[#4a2034] px-2.5 sm:px-3.5 py-1.5 sm:py-2 flex items-center justify-between select-none shrink-0 font-pixel-freddy">
        {/* Left: Live Indicator + Title */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[#4a2034] text-xs sm:text-sm font-bold tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#893760]" />
            AI VTuber Stage
          </span>
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-[#4a2034] text-[#059669] rounded text-[9px] font-bold shadow-[1px_1px_0px_#4a2034]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="tracking-wider">LIVE</span>
          </div>
        </div>

        {/* Right: Engine Switcher & Close Button */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-white border border-[#4a2034] rounded p-0.5 shadow-[1px_1px_0px_#4a2034]">
            <button
              onClick={() => setActiveEngine("LIVE2D")}
              className={`font-pixel text-[8.5px] px-2 py-0.5 rounded cursor-pointer transition ${
                activeEngine === "LIVE2D"
                  ? "bg-[#f8a5c2] text-[#4a2034] font-bold shadow-xs"
                  : "text-[#893760] hover:text-[#4a2034]"
              }`}
            >
              Live2D
            </button>
            <button
              onClick={() => setActiveEngine("MMD")}
              className={`font-pixel text-[8.5px] px-2 py-0.5 rounded cursor-pointer transition ${
                activeEngine === "MMD"
                  ? "bg-[#f8a5c2] text-[#4a2034] font-bold shadow-xs"
                  : "text-[#893760] hover:text-[#4a2034]"
              }`}
            >
              MMD
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="pixel-btn bg-[#f47fa2] hover:bg-[#e0668b] p-1.5 rounded flex items-center justify-center text-white"
              title="Tutup Panggung VTuber"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Standalone Frame Body: Dark Cyber Grid Stage ── */}
      <div className="flex-1 flex flex-col justify-between p-2.5 sm:p-3 min-h-0 bg-[rgba(18,18,18,0.92)] vtuber-stage-grid relative overflow-hidden">
        {/* Model Spec Badge */}
        <div className="bg-black/85 border border-[#F4B8C4]/40 rounded px-2.5 py-1 flex items-center justify-between z-10 shrink-0">
          <span className="font-pixel text-[8px] text-[#F4B8C4]">AVATAR:</span>
          <span className="font-mono-retro text-[10px] text-white truncate">
            {activeEngine === "LIVE2D"
              ? "Hiyori Momose (Pro) • PixiJS Cubism"
              : "MMD Stage • Three.js (Experimental)"}
          </span>
        </div>

        {/* Center Character Canvas + Expression Quick Buttons */}
        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center my-1">
          <div className="flex-1 w-full min-h-0 flex items-center justify-center">
            <Live2DCanvas
              modelConfig={modelConfig}
              expression={expression}
              isSpeaking={isSpeaking}
              audioAmplitude={audioAmplitude}
            />
          </div>

          <div className="mt-1.5 z-10">
            <VTuberControls
              onExpressionSelect={(expr) => triggerExpression(expr)}
              voiceEnabled={voiceEnabled}
              onToggleVoice={toggleVoiceMute}
              activeExpression={expression}
            />
          </div>
        </div>

        {/* Bottom Subtitle Caption & Real-Time Waveform */}
        <div className="space-y-1.5 z-10 shrink-0">
          <LiveSubtitleBar subtitle={subtitle} isSpeaking={isSpeaking} />

          <AudioWaveform
            isSpeaking={isSpeaking}
            waveformData={waveformData}
            onPlayClick={() => triggerExpression(expression)}
          />
        </div>
      </div>
    </aside>
  );
}
