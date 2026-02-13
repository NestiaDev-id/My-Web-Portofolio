import { useEffect, useState } from "react";
import Phaser from "phaser";
import { motion } from "framer-motion";
import {
  Gamepad2,
  Maximize2,
  Volume2,
  VolumeX,
  RefreshCw,
} from "lucide-react";
import MainScene from "./scenes/MainScene";
import BattleScene from "./scenes/BattleScene";
import { GAME_WIDTH, GAME_HEIGHT } from "./constants";

// ── Helpers ──────────────────────────────────────────────────

const handleDirectionalMovement = (
  e: React.TouchEvent,
  button: HTMLButtonElement
) => {
  const touch = e.touches[0];
  const rect = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const deltaX = touch.clientX - centerX;
  const deltaY = touch.clientY - centerY;

  ["w", "a", "s", "d"].forEach((key) => {
    window.dispatchEvent(new KeyboardEvent("keyup", { key }));
  });

  const angle = Math.atan2(deltaY, deltaX);
  const pi = Math.PI;

  if (angle > -pi / 4 && angle <= pi / 4) {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }));
  } else if (angle > pi / 4 && angle <= (3 * pi) / 4) {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "s" }));
  } else if (angle > (3 * pi) / 4 || angle <= (-3 * pi) / 4) {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
  } else {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }));
  }
};

// ── Component ────────────────────────────────────────────────

const GameUI: React.FC = () => {
  // ── State ──
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true);
  const [gameInstance, setGameInstance] = useState<Phaser.Game | null>(null);

  // ── Phaser Init ──
  useEffect(() => {
    // Detect mobile and orientation
    const checkMobileAndOrientation = () => {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const landscape = window.innerWidth > window.innerHeight;
      setIsMobile(mobile);
      setIsLandscape(landscape);
      return { mobile, landscape };
    };

    checkMobileAndOrientation();

    // Init game
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: "game-container",
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 0, x: 0 }, debug: false },
      },
      scene: [MainScene, BattleScene],
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const game = new Phaser.Game(config);
    setGameInstance(game);

    const handleResize = () => {
      checkMobileAndOrientation();
      if (document.fullscreenElement) {
        game.scale.resize(window.innerWidth, window.innerHeight);
      } else {
        game.scale.resize(GAME_WIDTH, GAME_HEIGHT);
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      handleResize();
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    // Also check on orientation change specifically for some devices
    window.addEventListener("orientationchange", handleResize);

    return () => {
      game.destroy(true);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  // ── Actions ──
  const toggleFullscreen = async () => {
    const gameContainer = document.getElementById("game-container");
    if (!document.fullscreenElement) {
      try {
        await gameContainer?.requestFullscreen();
        setIsFullscreen(true);
        if (gameInstance) {
          gameInstance.scale.resize(window.innerWidth, window.innerHeight);
        }
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
        if (gameInstance) {
          gameInstance.scale.resize(GAME_WIDTH, GAME_HEIGHT);
        }
      } catch (err) {
        console.error("Error attempting to exit fullscreen:", err);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleControls = () => {
    setIsControlsVisible(!isControlsVisible);
  };

  // ── Touch dispatch helper ──
  const dispatchKey = (key: string, type: "keydown" | "keyup") => {
    window.dispatchEvent(new KeyboardEvent(type, { key }));
  };

  // ── Render: Portrait Warning (Mobile Only) ──
  if (isMobile && !isLandscape) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-8">
        <motion.div
          animate={{ rotate: -90 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: "easeInOut",
          }}
          className="mb-8"
        >
          <div className="w-16 h-28 border-4 border-white rounded-2xl relative">
            <div className="w-1 h-8 bg-white/50 absolute top-2 right-[-2px] rounded-r-md" />
            <div className="w-10 h-1 bg-white/50 absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full" />
          </div>
        </motion.div>
        <h2 className="text-2xl font-bold mb-4 text-center">Turn Your Phone</h2>
        <p className="text-gray-400 text-center max-w-xs">
          This game is designed to be played in landscape mode.
        </p>
      </div>
    );
  }

  // ── Render: Game ──
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-indigo-100 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 transition-colors duration-500">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative rounded-2xl overflow-hidden bg-white/40 dark:bg-black/20 backdrop-blur-lg border border-white/50 dark:border-white/10 shadow-2xl transition-all duration-500 ${
          isFullscreen ? "w-screen h-screen rounded-none" : "max-w-[90vw]"
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10 transition-colors duration-500">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <Gamepad2 className="w-6 h-6 text-blue-600 dark:text-purple-400 transition-colors duration-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent transition-all duration-500">
              Pellet Town Adventure
            </h1>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3"
          >
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-300"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-blue-600 dark:text-purple-400 transition-colors duration-500" />
              )}
            </button>

            {/* Toggle Controls (Mobile Only) */}
            {isMobile && (
              <button
                onClick={toggleControls}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-300"
                title="Toggle Controls"
              >
                <Gamepad2
                  className={`w-5 h-5 transition-colors duration-300 ${
                    isControlsVisible
                      ? "text-blue-600 dark:text-purple-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                />
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-300 ${
                isFullscreen ? "bg-black/5 dark:bg-white/10" : ""
              }`}
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-5 h-5 text-blue-600 dark:text-purple-400 transition-colors duration-500" />
            </button>
          </motion.div>
        </div>

        {/* ── Game Container ── */}
        <div className="relative">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            id="game-container"
            className={`relative ${isFullscreen ? "w-screen h-screen" : ""}`}
            // Hide the game canva if necessary, but we are overlaying already
          >
            {/* Touch overlay */}
            <div
              className="absolute inset-0 z-10"
              style={{ touchAction: "none" }}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const dx = touch.clientX - rect.left - rect.width / 2;
                const dy = touch.clientY - rect.top - rect.height / 2;
                const key =
                  Math.abs(dx) > Math.abs(dy)
                    ? dx > 0
                      ? "d"
                      : "a"
                    : dy > 0
                    ? "s"
                    : "w";
                dispatchKey(key, "keydown");
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                ["w", "a", "s", "d"].forEach((k) => dispatchKey(k, "keyup"));
                const dx = touch.clientX - rect.left - rect.width / 2;
                const dy = touch.clientY - rect.top - rect.height / 2;
                const key =
                  Math.abs(dx) > Math.abs(dy)
                    ? dx > 0
                      ? "d"
                      : "a"
                    : dy > 0
                    ? "s"
                    : "w";
                dispatchKey(key, "keydown");
              }}
              onTouchEnd={() => {
                ["w", "a", "s", "d"].forEach((k) => dispatchKey(k, "keyup"));
              }}
            />
          </motion.div>

          {/* Loading overlay */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 z-20 transition-colors duration-500 pointer-events-none"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-8 h-8 text-blue-600 dark:text-purple-400 transition-colors duration-500" />
            </motion.div>
          </motion.div>
        </div>

        {/* ── Footer ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 border-t border-white/20 dark:border-white/10 transition-colors duration-500"
        >
          <p className="text-sm text-gray-700 dark:text-gray-400 text-center transition-colors duration-500">
            Use WASD or Arrow Keys to move • Space to interact
          </p>
        </motion.div>
      </motion.div>

      {/* ── Mobile Controls ── */}
      {isControlsVisible && isMobile && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          id="mobile-controls"
          className={`fixed bottom-4 left-0 right-0 flex flex-col items-center gap-2 p-4 ${
            isLandscape ? "landscape" : ""
          }`}
          style={{ touchAction: "none" }}
        >
          <style>
            {`
              .landscape {
                flex-direction: row !important;
                justify-content: space-between;
                padding: 2rem;
                bottom: 50%;
                transform: translateY(50%);
              }
              .landscape .controls-left,
              .landscape .controls-right {
                display: flex;
                gap: 1rem;
                align-items: center;
              }
              .action-button {
                position: fixed;
                right: 2rem;
                bottom: 8rem;
                width: 6rem;
                height: 6rem;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(4px);
                font-size: 0.875rem;
                color: white;
                text-transform: uppercase;
                font-weight: bold;
                touch-action: none;
              }
              .action-button::after {
                content: '';
                position: absolute;
                width: 2rem;
                height: 2rem;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                pointer-events: none;
              }
              .landscape .action-button {
                right: 4rem;
                bottom: 50%;
                transform: translateY(50%);
              }
            `}
          </style>

          {/* D-Pad */}
          <div className="controls-left">
            <div className="flex flex-col items-center gap-2">
              <button
                className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center text-white text-2xl backdrop-blur-sm active:bg-white/50"
                onTouchStart={() => dispatchKey("w", "keydown")}
                onTouchEnd={() => dispatchKey("w", "keyup")}
              >
                ↑
              </button>

              <div className="flex gap-4 items-center">
                <button
                  className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center text-white text-2xl backdrop-blur-sm active:bg-white/50"
                  onTouchStart={() => dispatchKey("a", "keydown")}
                  onTouchEnd={() => dispatchKey("a", "keyup")}
                >
                  ←
                </button>
                <button
                  className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center text-white text-2xl backdrop-blur-sm active:bg-white/50"
                  onTouchStart={() => dispatchKey("d", "keydown")}
                  onTouchEnd={() => dispatchKey("d", "keyup")}
                >
                  →
                </button>
              </div>

              <button
                className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center text-white text-2xl backdrop-blur-sm active:bg-white/50"
                onTouchStart={() => dispatchKey("s", "keydown")}
                onTouchEnd={() => dispatchKey("s", "keyup")}
              >
                ↓
              </button>
            </div>
          </div>

          {/* Action button */}
          <button
            className="action-button active:bg-white/50"
            onTouchStart={(e) =>
              handleDirectionalMovement(e, e.currentTarget)
            }
            onTouchMove={(e) =>
              handleDirectionalMovement(e, e.currentTarget)
            }
            onTouchEnd={() => {
              ["w", "a", "s", "d"].forEach((k) => dispatchKey(k, "keyup"));
            }}
          >
            <div className="w-2 h-2 bg-white rounded-full" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default GameUI;
