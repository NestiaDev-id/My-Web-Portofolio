import { useEffect, useRef } from "react";
import { Sprite } from "../classes/classes";
import playerDownImage from "../assets/img/playerDown.png";
import playerUpImage from "../assets/img/playerUp.png";
import playerLeftImage from "../assets/img/playerLeft.png";
import playerRightImage from "../assets/img/playerRight.png";
import backgroundImage from "../assets/img/Pellet Town.png";

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

    const playerDown = new Image();
    playerDown.src = playerDownImage;

    const playerUp = new Image();
    playerUp.src = playerUpImage;

    const playerLeft = new Image();
    playerLeft.src = playerLeftImage;

    const playerRight = new Image();
    playerRight.src = playerRightImage;

    const keys: Record<string, boolean> = {
      w: false,
      a: false,
      s: false,
      d: false,
    };
    let lastKey = "s";

    const backgroundPosition = { x: -500, y: -400 };
    const speed = 3;

    const player = new Sprite({
      position: {
        x: canvas.width / 2 - 24,
        y: canvas.height / 2 - 34,
      },
      image: playerDown,
      frames: { max: 4, hold: 10 },
      animate: false,
      sprites: {
        up: playerUp,
        down: playerDown,
        left: playerLeft,
        right: playerRight,
      },
    });

    const draw = () => {
      if (!background.complete || !player.image.complete) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(background, backgroundPosition.x, backgroundPosition.y);

      player.draw(ctx);
    };

    const update = () => {
      player.animate = false;

      if (keys.w) {
        backgroundPosition.y += speed;
        player.image = player.sprites?.up || player.image;
        player.animate = true;
        lastKey = "w";
      } else if (keys.a) {
        backgroundPosition.x += speed;
        player.image = player.sprites?.left || player.image;
        player.animate = true;
        lastKey = "a";
      } else if (keys.s) {
        backgroundPosition.y -= speed;
        player.image = player.sprites?.down || player.image;
        player.animate = true;
        lastKey = "s";
      } else if (keys.d) {
        backgroundPosition.x -= speed;
        player.image = player.sprites?.right || player.image;
        player.animate = true;
        lastKey = "d";
      }

      draw();
      requestAnimationFrame(update);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["w", "a", "s", "d"].includes(e.key)) {
        keys[e.key] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (["w", "a", "s", "d"].includes(e.key)) {
        keys[e.key] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const startGame = () => {
      if (background.complete && player.image.complete) {
        requestAnimationFrame(update);
      } else {
        setTimeout(startGame, 100);
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
