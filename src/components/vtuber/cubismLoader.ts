/**
 * Dynamic script loader for Live2D Cubism Core SDK, PixiJS, and Pixi-Live2D-Display.
 * Ensures 0 bytes downloaded on initial page load until VTuber stage is toggled ON.
 */

declare global {
  interface Window {
    Live2DCubismCore?: unknown;
    PIXI?: any;
  }
}

let loaderPromise: Promise<boolean> | null = null;

function loadScript(localSrc: string, fallbackSrc: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = localSrc;
    script.async = true;

    script.onload = () => resolve(true);

    script.onerror = () => {
      console.warn(`[Live2D] Failed loading ${localSrc}, attempting fallback ${fallbackSrc}...`);
      const fallbackScript = document.createElement("script");
      fallbackScript.src = fallbackSrc;
      fallbackScript.async = true;
      fallbackScript.onload = () => resolve(true);
      fallbackScript.onerror = () => {
        console.error(`[Live2D] Failed to load both ${localSrc} and ${fallbackSrc}`);
        resolve(false);
      };
      document.head.appendChild(fallbackScript);
    };

    document.head.appendChild(script);
  });
}

export function loadCubismCore(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);

  // If already loaded in window
  if (window.PIXI?.live2d?.Live2DModel) {
    return Promise.resolve(true);
  }

  if (loaderPromise) {
    return loaderPromise;
  }

  loaderPromise = (async () => {
    try {
      // 1. Load Live2DCubismCore
      if (!window.Live2DCubismCore) {
        const coreOk = await loadScript(
          "/live2d/live2dcubismcore.min.js",
          "https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js"
        );
        if (!coreOk || !window.Live2DCubismCore) {
          console.warn("[Live2D] Live2DCubismCore unavailable.");
        }
      }

      // 2. Load PixiJS
      if (!window.PIXI) {
        const pixiOk = await loadScript(
          "/live2d/pixi.min.js",
          "https://cdn.jsdelivr.net/npm/pixi.js@6.5.8/dist/browser/pixi.min.js"
        );
        if (!pixiOk || !window.PIXI) {
          console.warn("[Live2D] PixiJS unavailable.");
        }
      }

      // 3. Load Pixi-Live2D-Display (Cubism 4)
      if (window.PIXI && !window.PIXI.live2d?.Live2DModel) {
        await loadScript(
          "/live2d/cubism4.min.js",
          "https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism4.min.js"
        );
      }

      const ready = !!(window.PIXI?.live2d?.Live2DModel && window.Live2DCubismCore);
      if (ready) {
        console.info("[Live2D] Cubism 4 and PixiJS successfully initialized!");
      }
      return ready;
    } catch (err) {
      console.error("[Live2D] Initialization error:", err);
      return false;
    }
  })();

  return loaderPromise;
}
