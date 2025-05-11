import { useEffect, useRef, useState } from "react";
import backgroundImage from "../assets/img/Pellet Town.png";
import playerDownImage from "../assets/img/playerDown.png";

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
  });

  const [lastKey, setLastKey] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    canvas.width = 1024;
    canvas.height = 576;

    const background = new Image();
    background.src = backgroundImage;

    const player = new Image();
    player.src = playerDownImage;

    const backgroundPosition = { x: -500, y: -400 };

    const speed = 3;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gambar background
      ctx.drawImage(background, backgroundPosition.x, backgroundPosition.y);

      // Gambar player di tengah
      const playerWidth = 48;
      const playerHeight = 68;
      ctx.drawImage(
        player,
        0,
        0,
        player.width / 4,
        player.height,
        canvas.width / 2 - playerWidth / 2,
        canvas.height / 2 - playerHeight / 2,
        playerWidth,
        playerHeight
      );
    };

    const update = () => {
      if (keys.w && lastKey === "w") backgroundPosition.y += speed;
      if (keys.a && lastKey === "a") backgroundPosition.x += speed;
      if (keys.s && lastKey === "s") backgroundPosition.y -= speed;
      if (keys.d && lastKey === "d") backgroundPosition.x -= speed;

      draw();
      requestAnimationFrame(update);
    };

    update();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["w", "a", "s", "d"].includes(e.key)) {
        setKeys((prev) => ({ ...prev, [e.key]: true }));
        setLastKey(e.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (["w", "a", "s", "d"].includes(e.key)) {
        setKeys((prev) => ({ ...prev, [e.key]: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keys, lastKey]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <canvas ref={canvasRef} className="border border-white" />
    </div>
  );
};

export default Game;
