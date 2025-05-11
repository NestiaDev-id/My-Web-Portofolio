import { useEffect, useRef } from "react";
import backgroundImage from "../assets/img/Pellet Town.png";
import playerDownImage from "../assets/img/playerDown.png";

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    const keysPressed: Record<string, boolean> = {
      w: false,
      a: false,
      s: false,
      d: false,
    };
    let lastKeyPressed = "";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["w", "a", "s", "d"].includes(e.key)) {
        keysPressed[e.key] = true;
        lastKeyPressed = e.key;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (["w", "a", "s", "d"].includes(e.key)) {
        keysPressed[e.key] = false;
      }
    };

    const draw = () => {
      if (!background.complete || !player.complete) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(background, backgroundPosition.x, backgroundPosition.y);

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
      if (keysPressed.w && lastKeyPressed === "w")
        backgroundPosition.y += speed;
      if (keysPressed.a && lastKeyPressed === "a")
        backgroundPosition.x += speed;
      if (keysPressed.s && lastKeyPressed === "s")
        backgroundPosition.y -= speed;
      if (keysPressed.d && lastKeyPressed === "d")
        backgroundPosition.x -= speed;

      draw();
      requestAnimationFrame(update);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Mulai game loop hanya setelah gambar dimuat
    const startGame = () => {
      if (background.complete && player.complete) {
        requestAnimationFrame(update);
      } else {
        setTimeout(startGame, 100); // tunggu gambar selesai
      }
    };

    startGame();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <canvas ref={canvasRef} className="border border-white" />
    </div>
  );
};

export default Game;
