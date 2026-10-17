import { playClickSound } from "../utils/audio";

interface JoyConLeftProps {
  color: string; // Hex color (default neon blue)
  onButtonPress: (button: string) => void;
  isLandscape?: boolean;
}

export default function JoyConLeft({
  color,
  onButtonPress,
}: JoyConLeftProps) {
  const handlePress = (btn: string) => {
    playClickSound();
    onButtonPress(btn);
  };

  return (
    <div
      className={`relative w-[68px] sm:w-[74px] h-[340px] sm:h-[380px] rounded-l-[36px] border-r-4 border-slate-950 flex flex-col items-center justify-between py-6 sm:py-8 shadow-[inset_-3px_0_10px_rgba(0,0,0,0.4)] select-none transition-all duration-300`}
      style={{
        backgroundColor: color,
        boxShadow: "inset -8px 0 16px rgba(0,0,0,0.3), 3px 6px 12px rgba(0,0,0,0.2)",
      }}
      id="joycon_left_body"
    >
      {/* Shoulder Bumpers (L & ZL) on top edge */}
      <div className="absolute top-[-10px] left-2 right-1 h-[14px] bg-slate-800 rounded-tl-lg rounded-tr-md flex justify-between px-1 border-b border-slate-900 shadow-inner" id="shoulder_l_container">
        <button
          onClick={() => handlePress("L")}
          className="w-[45%] h-full text-[7px] text-slate-400 font-bold active:bg-slate-700 rounded-sm transition-all"
          title="L shoulder"
          id="btn_shoulder_l"
        >
          L
        </button>
        <button
          onClick={() => handlePress("ZL")}
          className="w-[45%] h-full text-[7px] text-slate-400 font-bold active:bg-slate-700 rounded-sm transition-all"
          title="ZL trigger"
          id="btn_shoulder_zl"
        >
          ZL
        </button>
      </div>

      {/* Minus Button */}
      <div className="w-full flex justify-end px-5 sm:px-6" id="minus_btn_wrapper">
        <button
          onClick={() => handlePress("MINUS")}
          className="w-4 sm:w-5 h-1.5 sm:h-2 bg-slate-800 rounded-full active:bg-slate-700 shadow-md active:scale-90 transition-all cursor-pointer"
          aria-label="Minus button"
          id="btn_minus"
        />
      </div>

      {/* Analog Stick (L) */}
      <div className="flex flex-col items-center justify-center mt-2" id="analog_l_wrapper">
        <button
          onClick={() => handlePress("ANALOG_L_CLICK")}
          className="w-11 sm:w-13 h-11 sm:h-13 bg-slate-800 rounded-full shadow-lg border-[3px] border-slate-900/60 flex items-center justify-center relative active:scale-95 cursor-pointer transition-transform"
          style={{
            background: "radial-gradient(circle, #2d3748 0%, #1a202c 100%)",
          }}
          aria-label="Left analog stick"
          id="btn_analog_l"
        >
          {/* Inner thumb grip details */}
          <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full border border-slate-700/50 flex flex-wrap p-1 items-center justify-center opacity-60">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mx-1" />
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mx-1" />
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mx-1" />
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mx-1" />
          </div>
          {/* Subtle directional indicators */}
          <div className="absolute top-1 left-1/2 w-1.5 h-1 bg-slate-500 rounded-full opacity-40 -translate-x-1/2" />
          <div className="absolute bottom-1 left-1/2 w-1.5 h-1 bg-slate-500 rounded-full opacity-40 -translate-x-1/2" />
        </button>
      </div>

      {/* Directional D-Pad (Up, Left, Down, Right separate circular buttons) */}
      <div className="relative w-14 sm:w-16 h-14 sm:h-16 grid grid-cols-3 grid-rows-3 gap-0.5 items-center justify-items-center mt-3" id="dpad_grid">
        {/* UP Button */}
        <div className="col-start-2 row-start-1">
          <button
            onClick={() => handlePress("UP")}
            className="w-5 sm:w-6 h-5 sm:h-6 bg-slate-800 active:bg-slate-700 text-white font-bold rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer border border-slate-900/85"
            aria-label="Up Arrow"
            id="btn_dpad_up"
          >
            <span className="text-[7px] text-slate-300 font-sans">▲</span>
          </button>
        </div>

        {/* LEFT Button */}
        <div className="col-start-1 row-start-2">
          <button
            onClick={() => handlePress("LEFT")}
            className="w-5 sm:w-6 h-5 sm:h-6 bg-slate-800 active:bg-slate-700 text-white font-bold rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer border border-slate-900/85"
            aria-label="Left Arrow"
            id="btn_dpad_left"
          >
            <span className="text-[7px] text-slate-300 font-sans">◀</span>
          </button>
        </div>

        {/* Center circle dummy */}
        <div className="col-start-2 row-start-2 w-3 h-3 bg-slate-900/40 rounded-full" />

        {/* RIGHT Button */}
        <div className="col-start-3 row-start-2">
          <button
            onClick={() => handlePress("RIGHT")}
            className="w-5 sm:w-6 h-5 sm:h-6 bg-slate-800 active:bg-slate-700 text-white font-bold rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer border border-slate-900/85"
            aria-label="Right Arrow"
            id="btn_dpad_right"
          >
            <span className="text-[7px] text-slate-300 font-sans">▶</span>
          </button>
        </div>

        {/* DOWN Button */}
        <div className="col-start-2 row-start-3">
          <button
            onClick={() => handlePress("DOWN")}
            className="w-5 sm:w-6 h-5 sm:h-6 bg-slate-800 active:bg-slate-700 text-white font-bold rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer border border-slate-900/85"
            aria-label="Down Arrow"
            id="btn_dpad_down"
          >
            <span className="text-[7px] text-slate-300 font-sans">▼</span>
          </button>
        </div>
      </div>

      {/* Screen Capture / Screenshot Button */}
      <div className="w-full flex justify-center mt-3" id="screenshot_btn_wrapper">
        <button
          onClick={() => handlePress("SCREENSHOT")}
          className="w-4 sm:w-4.5 h-4 sm:h-4.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-sm shadow-md border-2 border-slate-950 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
          title="Ambil Tangkapan Layar (Screenshot)"
          id="btn_screenshot"
        >
          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-slate-900/90" />
        </button>
      </div>
    </div>
  );
}
