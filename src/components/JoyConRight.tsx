import { playClickSound } from "../utils/audio";

interface JoyConRightProps {
  color: string; // Hex color (default neon red)
  onButtonPress: (button: string) => void;
  isLandscape?: boolean;
}

export default function JoyConRight({
  color,
  onButtonPress,
}: JoyConRightProps) {
  const handlePress = (btn: string) => {
    playClickSound();
    onButtonPress(btn);
  };

  return (
    <div
      className={`relative w-[68px] sm:w-[74px] h-[340px] sm:h-[380px] rounded-r-[36px] border-l-4 border-slate-950 flex flex-col items-center justify-between py-6 sm:py-8 shadow-[inset_3px_0_10px_rgba(0,0,0,0.4)] select-none transition-all duration-300`}
      style={{
        backgroundColor: color,
        boxShadow: "inset 8px 0 16px rgba(0,0,0,0.3), -3px 6px 12px rgba(0,0,0,0.2)",
      }}
      id="joycon_right_body"
    >
      {/* Shoulder Bumpers (R & ZR) on top edge */}
      <div className="absolute top-[-10px] left-1 right-2 h-[14px] bg-slate-800 rounded-tr-lg rounded-tl-md flex justify-between px-1 border-b border-slate-900 shadow-inner" id="shoulder_r_container">
        <button
          onClick={() => handlePress("R")}
          className="w-[45%] h-full text-[7px] text-slate-400 font-bold active:bg-slate-700 rounded-sm transition-all"
          title="R shoulder"
          id="btn_shoulder_r"
        >
          R
        </button>
        <button
          onClick={() => handlePress("ZR")}
          className="w-[45%] h-full text-[7px] text-slate-400 font-bold active:bg-slate-700 rounded-sm transition-all"
          title="ZR trigger"
          id="btn_shoulder_zr"
        >
          ZR
        </button>
      </div>

      {/* Plus Button */}
      <div className="w-full flex justify-start px-5 sm:px-6" id="plus_btn_wrapper">
        <button
          onClick={() => handlePress("PLUS")}
          className="w-4 sm:w-5 h-4 sm:h-5 relative active:scale-90 transition-all cursor-pointer flex items-center justify-center"
          aria-label="Plus button"
          id="btn_plus"
        >
          {/* Custom drawing of a plus shape in slate-800 */}
          <div className="absolute w-3.5 sm:w-4.5 h-1 sm:h-1.5 bg-slate-800 rounded-sm" />
          <div className="absolute w-1 sm:w-1.5 h-3.5 sm:h-4.5 bg-slate-800 rounded-sm" />
        </button>
      </div>

      {/* Action Buttons (X, Y, A, B) */}
      <div className="relative w-14 sm:w-16 h-14 sm:h-16 grid grid-cols-3 grid-rows-3 gap-0.5 items-center justify-items-center mt-1" id="abxy_grid">
        {/* X Button (Top) */}
        <div className="col-start-2 row-start-1">
          <button
            onClick={() => handlePress("X")}
            className="w-5 sm:w-6 h-5 sm:h-6 bg-slate-800 active:bg-slate-700 text-white font-bold rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer border border-slate-900/85"
            id="btn_abxy_x"
          >
            <span className="text-[9px] text-slate-300 font-sans">X</span>
          </button>
        </div>

        {/* Y Button (Left) */}
        <div className="col-start-1 row-start-2">
          <button
            onClick={() => handlePress("Y")}
            className="w-5 sm:w-6 h-5 sm:h-6 bg-slate-800 active:bg-slate-700 text-white font-bold rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer border border-slate-900/85"
            id="btn_abxy_y"
          >
            <span className="text-[9px] text-slate-300 font-sans">Y</span>
          </button>
        </div>

        {/* Center circle placeholder */}
        <div className="col-start-2 row-start-2 w-3 h-3 bg-slate-900/40 rounded-full" />

        {/* A Button (Right - Confirm) */}
        <div className="col-start-3 row-start-2">
          <button
            onClick={() => handlePress("A")}
            className="w-5 sm:w-6 h-5 sm:h-6 bg-slate-800 active:bg-slate-700 text-emerald-400 font-bold rounded-full flex items-center justify-center shadow-md active:scale-95 cursor-pointer border-2 border-slate-900"
            id="btn_abxy_a"
          >
            <span className="text-[9px] font-sans">A</span>
          </button>
        </div>

        {/* B Button (Bottom - Back) */}
        <div className="col-start-2 row-start-3">
          <button
            onClick={() => handlePress("B")}
            className="w-5 sm:w-6 h-5 sm:h-6 bg-slate-800 active:bg-slate-700 text-rose-400 font-bold rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer border border-slate-900"
            id="btn_abxy_b"
          >
            <span className="text-[9px] font-sans">B</span>
          </button>
        </div>
      </div>

      {/* Analog Stick (R) */}
      <div className="flex flex-col items-center justify-center mt-2" id="analog_r_wrapper">
        <button
          onClick={() => handlePress("ANALOG_R_CLICK")}
          className="w-11 sm:w-13 h-11 sm:h-13 bg-slate-800 rounded-full shadow-lg border-[3px] border-slate-900/60 flex items-center justify-center relative active:scale-95 cursor-pointer transition-transform"
          style={{
            background: "radial-gradient(circle, #2d3748 0%, #1a202c 100%)",
          }}
          aria-label="Right analog stick"
          id="btn_analog_r"
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

      {/* Home Button (Glowing circle button) */}
      <div className="w-full flex justify-center mt-3" id="home_btn_wrapper">
        <button
          onClick={() => handlePress("HOME")}
          className="w-5 sm:w-6 h-5 sm:h-6 bg-slate-800 active:bg-slate-700 rounded-full shadow-md border-[2px] border-slate-900 flex items-center justify-center relative active:scale-90 transition-all cursor-pointer group"
          title="Home Dashboard"
          id="btn_home"
        >
          {/* Glowing ring */}
          <div className="absolute inset-[-2px] rounded-full border-2 border-slate-600/30 group-hover:border-slate-400/50 group-active:border-blue-400/80 transition-all" />
          
          {/* Home icon print style */}
          <div className="w-2.5 h-2.5 border-t border-r border-slate-400 rotate-[45deg] translate-y-[2px]" />
          <div className="absolute bottom-[4px] w-2.5 h-2 bg-slate-400 rounded-b-xs" />
        </button>
      </div>
    </div>
  );
}
