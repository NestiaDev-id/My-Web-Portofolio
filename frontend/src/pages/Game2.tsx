import { useEffect, useRef } from "react";
import { Sprite } from "../classes/classes";
import playerDownImage from "../assets/img/playerDown.png";
import playerUpImage from "../assets/img/playerUp.png";
import playerLeftImage from "../assets/img/playerLeft.png";
import playerRightImage from "../assets/img/playerRight.png";
import backgroundImage from "../assets/img/Pellet Town.png";
import collisions from "@/assets/data/collisions";
import { Boundary } from "./Boundary";

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keys = useRef<Record<string, boolean>>({
    w: false,
    a: false,
    s: false,
    d: false,
  });

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

    let lastKey = "s";

    const backgroundPosition = { x: -500, y: -400 };
    const speed = 3;

    const collisionsMap = [];
    const MAP_WIDTH = 70; // ganti sesuai lebar peta (jumlah kolom)

    for (let i = 0; i < collisions.length; i += MAP_WIDTH) {
      collisionsMap.push(collisions.slice(i, i + MAP_WIDTH));
    }

    const boundaries: Boundary[] = [];

    collisionsMap.forEach((row, rowIndex) => {
      row.forEach((symbol, colIndex) => {
        if (symbol === 1025) {
          boundaries.push(
            new Boundary({
              position: {
                x: colIndex * Boundary.width,
                y: rowIndex * Boundary.height,
              },
            })
          );
        }
      });
    });

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
      const movables = [backgroundPosition, boundaries]; // background dan batas bergerak
      function rectangularCollision({
        rect1,
        rect2,
      }: {
        rect1: {
          position: { x: number; y: number };
          width: number;
          height: number;
        };
        rect2: {
          position: { x: number; y: number };
          width: number;
          height: number;
        };
      }) {
        return (
          rect1.position.x < rect2.position.x + rect2.width &&
          rect1.position.x + rect1.width > rect2.position.x &&
          rect1.position.y < rect2.position.y + rect2.height &&
          rect1.position.y + rect1.height > rect2.position.y
        );
      }
      if (keys.current.w) {
        player.image = player.sprites?.up || player.image; // Menentukan sprite pemain untuk bergerak ke atas
        player.animate = true; // Memulai animasi pemain
        lastKey = "w"; // Menyimpan tombol terakhir yang ditekan

        let canMove = true; // Flag untuk menentukan apakah pemain bisa bergerak
        for (const boundary of boundaries) {
          // Memeriksa tabrakan antara pemain dan boundary
          if (
            rectangularCollision({
              rect1: {
                position: { x: player.position.x, y: player.position.y }, // Posisi pemain
                width: 48, // Lebar pemain
                height: 48, // Tinggi pemain
              },
              rect2: {
                position: {
                  x: boundary.position.x + backgroundPosition.x,
                  y: boundary.position.y + backgroundPosition.y + speed,
                },
                width: Boundary.width,
                height: Boundary.height,
              },
            })
          ) {
            canMove = false; // Jika tabrakan terjadi, set flag canMove ke false
            break; // Keluar dari loop karena sudah ada tabrakan
          }
        }
        // Jika tidak ada tabrakan, maka background bergerak ke bawah (seolah-olah pemain bergerak ke atas)
        if (canMove) backgroundPosition.y += speed;
      } else if (keys.current.a) {
        player.image = player.sprites?.left || player.image; // Menentukan sprite pemain untuk bergerak ke kiri
        player.animate = true; // Memulai animasi pemain
        lastKey = "a"; // Menyimpan tombol terakhir yang ditekan

        let canMove = true; // Flag untuk menentukan apakah pemain bisa bergerak
        for (const boundary of boundaries) {
          // Memeriksa tabrakan antara pemain dan boundary
          if (
            rectangularCollision({
              rect1: {
                position: {
                  x: player.position.x - speed, // Mengurangi posisi X pemain untuk bergerak ke kiri
                  y: player.position.y,
                },
                width: 48, // Lebar pemain
                height: 48, // Tinggi pemain
              },
              rect2: {
                position: {
                  x: boundary.position.x + backgroundPosition.x, // Posisi X boundary
                  y: boundary.position.y + backgroundPosition.y, // Posisi Y boundary
                },
                width: Boundary.width, // Lebar boundary
                height: Boundary.height, // Tinggi boundary
              },
            })
          ) {
            canMove = false; // Jika tabrakan terjadi, set flag canMove ke false
            break; // Keluar dari loop karena sudah ada tabrakan
          }
        }
        // Jika tidak ada tabrakan, maka background bergerak ke kanan (seolah-olah pemain bergerak ke kiri)
        if (canMove) backgroundPosition.x += speed;
      }
      // Mengecek apakah tombol 'S' ditekan (bergerak ke bawah)
      else if (keys.current.s) {
        player.image = player.sprites?.down || player.image; // Menentukan sprite pemain untuk bergerak ke bawah
        player.animate = true; // Memulai animasi pemain
        lastKey = "s"; // Menyimpan tombol terakhir yang ditekan

        let canMove = true; // Flag untuk menentukan apakah pemain bisa bergerak
        for (const boundary of boundaries) {
          // Memeriksa tabrakan antara pemain dan boundary
          if (
            rectangularCollision({
              rect1: {
                position: {
                  x: player.position.x,
                  y: player.position.y + speed, // Menambah posisi Y pemain untuk bergerak ke bawah
                },
                width: 48, // Lebar pemain
                height: 48, // Tinggi pemain
              },
              rect2: {
                position: {
                  x: boundary.position.x + backgroundPosition.x, // Posisi X boundary
                  y: boundary.position.y + backgroundPosition.y, // Posisi Y boundary
                },
                width: Boundary.width, // Lebar boundary
                height: Boundary.height, // Tinggi boundary
              },
            })
          ) {
            canMove = false; // Jika tabrakan terjadi, set flag canMove ke false
            break; // Keluar dari loop karena sudah ada tabrakan
          }
        }
        // Jika tidak ada tabrakan, maka background bergerak ke atas (seolah-olah pemain bergerak ke bawah)
        if (canMove) backgroundPosition.y -= speed;
      }
      // Mengecek apakah tombol 'D' ditekan (bergerak ke kanan)
      else if (keys.current.d) {
        player.image = player.sprites?.right || player.image; // Menentukan sprite pemain untuk bergerak ke kanan
        player.animate = true; // Memulai animasi pemain
        lastKey = "d"; // Menyimpan tombol terakhir yang ditekan

        let canMove = true; // Flag untuk menentukan apakah pemain bisa bergerak
        for (const boundary of boundaries) {
          // Memeriksa tabrakan antara pemain dan boundary
          if (
            rectangularCollision({
              rect1: {
                position: {
                  x: player.position.x + speed, // Menambah posisi X pemain untuk bergerak ke kanan
                  y: player.position.y,
                },
                width: 48, // Lebar pemain
                height: 48, // Tinggi pemain
              },
              rect2: {
                position: {
                  x: boundary.position.x + backgroundPosition.x, // Posisi X boundary
                  y: boundary.position.y + backgroundPosition.y, // Posisi Y boundary
                },
                width: Boundary.width, // Lebar boundary
                height: Boundary.height, // Tinggi boundary
              },
            })
          ) {
            canMove = false; // Jika tabrakan terjadi, set flag canMove ke false
            break; // Keluar dari loop karena sudah ada tabrakan
          }
        }
        // Jika tidak ada tabrakan, maka background bergerak ke kiri (seolah-olah pemain bergerak ke kanan)
        if (canMove) backgroundPosition.x -= speed;
      }

      draw();
      requestAnimationFrame(update);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["w", "a", "s", "d"].includes(e.key)) {
        keys.current[e.key] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (["w", "a", "s", "d"].includes(e.key)) {
        keys.current[e.key] = false;
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
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 md:hidden">
        <button
          className="w-12 h-12 bg-white bg-opacity-20 rounded-full text-white text-xl touch-none"
          onTouchStart={() => (keys.current.w = true)}
          onTouchEnd={() => (keys.current.w = false)}
          onMouseDown={() => (keys.current.w = true)}
          onMouseUp={() => (keys.current.w = false)}
        >
          ↑
        </button>
        <div className="flex space-x-2">
          <button
            className="w-12 h-12 bg-white bg-opacity-20 rounded-full text-white text-xl touch-none"
            onTouchStart={() => (keys.current.a = true)}
            onTouchEnd={() => (keys.current.a = false)}
            onMouseDown={() => (keys.current.a = true)}
            onMouseUp={() => (keys.current.a = false)}
          >
            ←
          </button>
          <button
            className="w-12 h-12 bg-white bg-opacity-20 rounded-full text-white text-xl touch-none"
            onTouchStart={() => (keys.current.s = true)}
            onTouchEnd={() => (keys.current.s = false)}
            onMouseDown={() => (keys.current.s = true)}
            onMouseUp={() => (keys.current.s = false)}
          >
            ↓
          </button>
          <button
            className="w-12 h-12 bg-white bg-opacity-20 rounded-full text-white text-xl touch-none"
            onTouchStart={() => (keys.current.d = true)}
            onTouchEnd={() => (keys.current.d = false)}
            onMouseDown={() => (keys.current.d = true)}
            onMouseUp={() => (keys.current.d = false)}
          >
            →
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="border border-white" />
    </div>
  );
};

export default Game;
