import { useEffect, useRef, useState, useCallback } from "react";
import type { VTuberExpression, VTuberModelConfig } from "./types";
import { loadCubismCore } from "./cubismLoader";

interface Live2DCanvasProps {
  modelConfig: VTuberModelConfig;
  expression: VTuberExpression;
  isSpeaking: boolean;
  audioAmplitude: number; // 0 to 1
}

export const Live2DCanvas = ({
  modelConfig,
  expression,
  isSpeaking,
  audioAmplitude,
}: Live2DCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // References for live ticker updates without re-instantiating PIXI
  const modelRef = useRef<any>(null);
  const pixiAppRef = useRef<any>(null);
  const isSpeakingRef = useRef(isSpeaking);
  const audioAmpRef = useRef(audioAmplitude);
  const currentExpressionRef = useRef<VTuberExpression>(expression);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    audioAmpRef.current = audioAmplitude;
  }, [audioAmplitude]);

  // Apply Live2D parameter modifications according to expression
  const applyExpressionParameters = useCallback((expr: VTuberExpression) => {
    if (!modelRef.current) return;
    const model = modelRef.current;

    // 1. Try built-in expression manager if registered
    try {
      if (expr === "idle") {
        model.expression?.("default");
      } else {
        model.expression?.(expr);
      }
    } catch (_) {
      // ignore
    }

    // 2. Direct parameter override for guaranteed expressive visual feedback on Hiyori Pro
    const core = model.internalModel?.coreModel;
    if (core) {
      switch (expr) {
        case "senyum":
          core.setParameterValueById("ParamEyeLSmile", 1.0);
          core.setParameterValueById("ParamEyeRSmile", 1.0);
          core.setParameterValueById("ParamMouthForm", 1.0);
          core.setParameterValueById("ParamCheek", 0.85);
          core.setParameterValueById("ParamBrowLY", 0.25);
          core.setParameterValueById("ParamBrowRY", 0.25);
          core.setParameterValueById("ParamEyeLOpen", 0.95);
          core.setParameterValueById("ParamEyeROpen", 0.95);
          try {
            model.motion?.("Tap");
          } catch (_) {}
          break;

        case "kaget":
          core.setParameterValueById("ParamEyeLOpen", 1.35);
          core.setParameterValueById("ParamEyeROpen", 1.35);
          core.setParameterValueById("ParamEyeLSmile", 0.0);
          core.setParameterValueById("ParamEyeRSmile", 0.0);
          core.setParameterValueById("ParamBrowLY", 0.85);
          core.setParameterValueById("ParamBrowRY", 0.85);
          core.setParameterValueById("ParamBrowLAngle", 0.45);
          core.setParameterValueById("ParamBrowRAngle", 0.45);
          core.setParameterValueById("ParamMouthOpenY", 0.7);
          core.setParameterValueById("ParamMouthForm", -0.4);
          core.setParameterValueById("ParamCheek", 0.35);
          try {
            model.motion?.("FlickUp");
          } catch (_) {}
          break;

        case "jelaskan":
          core.setParameterValueById("ParamBrowLY", -0.2);
          core.setParameterValueById("ParamBrowRY", 0.35);
          core.setParameterValueById("ParamBrowLAngle", -0.3);
          core.setParameterValueById("ParamBrowRAngle", -0.1);
          core.setParameterValueById("ParamBrowLForm", -0.4);
          core.setParameterValueById("ParamBrowRForm", -0.2);
          core.setParameterValueById("ParamEyeBallX", -0.35);
          core.setParameterValueById("ParamEyeBallY", 0.25);
          core.setParameterValueById("ParamCheek", 0.2);
          try {
            model.motion?.("Flick");
          } catch (_) {}
          break;

        case "tease":
          core.setParameterValueById("ParamEyeLSmile", 0.95);
          core.setParameterValueById("ParamEyeROpen", 0.75);
          core.setParameterValueById("ParamMouthForm", 0.9);
          core.setParameterValueById("ParamCheek", 0.7);
          core.setParameterValueById("ParamAngleZ", 5.0);
          break;

        case "idle":
        default:
          core.setParameterValueById("ParamEyeLSmile", 0);
          core.setParameterValueById("ParamEyeRSmile", 0);
          core.setParameterValueById("ParamMouthForm", 0);
          core.setParameterValueById("ParamCheek", 0);
          core.setParameterValueById("ParamBrowLY", 0);
          core.setParameterValueById("ParamBrowRY", 0);
          core.setParameterValueById("ParamBrowLAngle", 0);
          core.setParameterValueById("ParamBrowRAngle", 0);
          core.setParameterValueById("ParamEyeLOpen", 1.0);
          core.setParameterValueById("ParamEyeROpen", 1.0);
          try {
            model.motion?.("Idle");
          } catch (_) {}
          break;
      }
    }
  }, []);

  // Update expression whenever expression prop changes
  useEffect(() => {
    currentExpressionRef.current = expression;
    applyExpressionParameters(expression);
  }, [expression, applyExpressionParameters]);

  // Main Pixi + Live2D initialization
  useEffect(() => {
    let isDisposed = false;

    async function initLive2D() {
      try {
        const ready = await loadCubismCore();
        if (isDisposed) return;
        if (!ready || !window.PIXI || !window.PIXI.live2d?.Live2DModel) {
          throw new Error("Cubism 4 WebSDK or PixiJS failed to initialize.");
        }

        if (!canvasRef.current || !containerRef.current) return;

        const PIXI = window.PIXI;

        // Register Pixi Ticker into Live2DModel so animations and frames advance
        if (PIXI.live2d?.Live2DModel?.registerTicker && PIXI.Ticker) {
          PIXI.live2d.Live2DModel.registerTicker(PIXI.Ticker);
        }

        // Clean up previous app if any
        if (pixiAppRef.current) {
          try {
            pixiAppRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
          } catch (_) {}
          pixiAppRef.current = null;
        }

        const rect = containerRef.current.getBoundingClientRect();
        const initWidth = Math.max(280, Math.floor(rect.width));
        const initHeight = Math.max(260, Math.floor(rect.height));

        const app = new PIXI.Application({
          view: canvasRef.current,
          width: initWidth,
          height: initHeight,
          backgroundAlpha: 0,
          autoStart: true,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        pixiAppRef.current = app;

        // Load the actual Hiyori Pro Live2D model
        console.info(`[Live2D] Loading Hiyori Pro from: ${modelConfig.modelPath}`);
        const model = await PIXI.live2d.Live2DModel.from(modelConfig.modelPath, {
          autoInteract: true,
        });

        if (isDisposed) {
          try {
            model.destroy();
            app.destroy(true);
          } catch (_) {}
          return;
        }

        // Enable auto updates on model
        model.autoUpdate = true;
        modelRef.current = model;
        app.stage.addChild(model);

        // Frame Hiyori Pro responsive to any desktop screen size
        const updateTransform = () => {
          if (!containerRef.current || !app.renderer || !model) return;
          const { width, height } = containerRef.current.getBoundingClientRect();
          if (width <= 0 || height <= 0) return;

          app.renderer.resize(width, height);

          // Native moc3 canvas size in Hiyori Pro is 2048x2048
          const nativeH = model.internalModel?.height || 2048;

          // Bust shot scaling:
          // Shows head, hair ribbon, eyes, shoulders, and chest nicely framed
          // Adaptive to desktop viewport height:
          const scale = (height / nativeH) * 1.52;
          model.scale.set(scale);

          // Anchor around Hiyori's face / neck line (x: 50% center, y: 22% from top)
          model.anchor.set(0.5, 0.22);
          model.x = width / 2;
          // Position face right at the optical center of the radar circle (42% from top)
          model.y = height * 0.42;

          console.info("[Live2D] Hiyori framed at:", {
            stageWidth: width,
            stageHeight: height,
            scale: scale.toFixed(3),
            x: model.x,
            y: model.y,
          });
        };

        updateTransform();

        // Ticker for real-time audio lip-sync mouth movement
        const lipSyncTicker = () => {
          if (!modelRef.current?.internalModel?.coreModel) return;
          const core = modelRef.current.internalModel.coreModel;

          if (isSpeakingRef.current) {
            // Mouth opening reacting to voice audio amplitude
            const mouthVal = Math.min(1.0, Math.max(0.2, audioAmpRef.current * 2.5));
            core.setParameterValueById("ParamMouthOpenY", mouthVal);
          } else if (currentExpressionRef.current !== "kaget") {
            // Close mouth when idle / not speaking
            core.setParameterValueById("ParamMouthOpenY", 0.0);
          }
        };

        app.ticker.add(lipSyncTicker);

        // Apply initial expression
        applyExpressionParameters(currentExpressionRef.current);

        setModelReady(true);
        setLoadError(null);

        // Responsive observer for container resize (small, medium, large desktop screens)
        const resizeObserver = new ResizeObserver(() => {
          updateTransform();
        });
        resizeObserver.observe(containerRef.current);

        return () => {
          resizeObserver.disconnect();
          app.ticker.remove(lipSyncTicker);
        };
      } catch (err: any) {
        console.warn("[Live2D] WebGL / Model loading notice:", err);
        if (!isDisposed) {
          setLoadError(err?.message || "Failed to load Live2D model.");
        }
      }
    }

    initLive2D();

    return () => {
      isDisposed = true;
      if (pixiAppRef.current) {
        try {
          pixiAppRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        } catch (_) {}
        pixiAppRef.current = null;
      }
      modelRef.current = null;
    };
  }, [modelConfig, applyExpressionParameters]);

  // Interactive tap on character canvas
  const handleCanvasClick = () => {
    if (modelRef.current) {
      try {
        const motions = ["Tap", "Flick", "FlickUp", "Tap@Body"];
        const randomMotion = motions[Math.floor(Math.random() * motions.length)];
        modelRef.current.motion?.(randomMotion);
      } catch (_) {}
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none overflow-hidden"
    >
      {/* Decorative Cyber-Radar Accent Ring & Subtle Grid Backing */}
      <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full border-[2.5px] border-[#D90429]/75 bg-gradient-to-b from-[#D90429]/15 via-transparent to-transparent flex items-center justify-center relative shadow-[0_0_30px_rgba(217,4,41,0.25)] pointer-events-none">
        <div className="absolute inset-2 rounded-full border border-dashed border-[#F4B8C4]/40 animate-[spin_50s_linear_infinite]" />
        <div className="absolute inset-8 rounded-full border border-dotted border-[#D90429]/30" />
      </div>

      {/* Loading Placeholder */}
      {!modelReady && !loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-20 font-pixel-freddy text-[#FADADD] text-center p-4">
          <div className="w-8 h-8 rounded-full border-3 border-[#F4B8C4] border-t-transparent animate-spin mb-1" />
          <span className="text-[10px] sm:text-[11px] tracking-wider text-[#F4B8C4]">MEMUAT HIYORI PRO...</span>
          <span className="text-[8.5px] font-mono text-[#FADADD]/80">PixiJS + Live2D Cubism WebSDK</span>
        </div>
      )}

      {/* Live2D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={`absolute inset-0 w-full h-full z-10 cursor-pointer transition-opacity duration-300 ${
          modelReady ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        title="Klik Hiyori untuk gesture interaktif!"
      />

      {/* Fallback Display if WebGL/Live2D is not supported */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 font-pixel-freddy text-[#F4B8C4]">
          <div className="bg-[#2A121B] border-2 border-[#D90429] rounded-lg p-3 max-w-[260px] shadow-[3px_3px_0px_#D90429]">
            <p className="text-xs font-bold text-white mb-1">Live2D Standby Mode</p>
            <p className="font-mono text-[9.5px] text-[#FADADD] leading-relaxed">
              Model Hiyori Pro disiapkan di /public/vtuber_char/hiyori_pro_en.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
