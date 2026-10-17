import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const P5HUD: React.FC = () => {
  const [clock, setClock] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Global Escape Listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && location.pathname !== "/") {
        navigate("/");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [navigate, location.pathname]);

  useEffect(() => {
    const update = () => {
      setClock(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta",
        }) + " · JKT"
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* TOP HUD */}
      <div className="p5-hud-top">
        <div className="p5-hud-tag">Portfolio // NestiaDev</div>
        <div className="p5-hud-tag alt">Indonesia · Fullstack Developer</div>
      </div>

      <div className="p5-hud-bottom">
        <button 
          className="group flex items-center gap-1 hover:text-p5-red transition-colors cursor-pointer"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
          }}
        >
          <span className="key group-hover:bg-p5-red group-hover:text-p5-white transition-colors">↑↓</span>
          Select
        </button>
        
        <button 
          className="group flex items-center gap-1 hover:text-p5-red transition-colors cursor-pointer"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
          }}
        >
          <span className="key group-hover:bg-p5-red group-hover:text-p5-white transition-colors">Enter</span>
          Confirm
        </button>
        
        <button 
          className="group flex items-center gap-1 hover:text-p5-red transition-colors cursor-pointer"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
          }}
        >
          <span className="key group-hover:bg-p5-red group-hover:text-p5-white transition-colors">Esc</span>
          Back
        </button>
        
        <span style={{ marginLeft: "auto", opacity: 0.8 }}>{clock}</span>
      </div>
    </>
  );
};

export default P5HUD;
