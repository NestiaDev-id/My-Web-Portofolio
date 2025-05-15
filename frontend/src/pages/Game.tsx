// import { useEffect, useRef, useState } from "react";
// import { Sprite } from "../classes/classes";
// import {
//   checkForCharacterCollision,
//   rectangularCollision,
// } from "../utils/utils";
// import idleSprite from "../assets/img/villager/Idle.png";
// import backgroundImage from "../assets/img/Pellet Town.png";
// import foregroundImage from "../assets/img/foregroundObjects.png";
// import playerDownImage from "../assets/img/playerDown.png";
// import playerUpImage from "../assets/img/playerUp.png";
// import playerLeftImage from "../assets/img/playerLeft.png";
// import playerRightImage from "../assets/img/playerRight.png";

// const Game: React.FC = () => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const [keys, setKeys] = useState({
//     w: { pressed: false },
//     a: { pressed: false },
//     s: { pressed: false },
//     d: { pressed: false },
//   });
//   const [lastKey, setLastKey] = useState("");

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas?.getContext("2d");

//     if (canvas && ctx) {
//       canvas.width = 1024;
//       canvas.height = 576;

//       const createImage = (src: string): HTMLImageElement => {
//         const img = new Image();
//         img.src = src;
//         return img;
//       };

//       // Inisialisasi pemain
//       const playerSprite = new Sprite({
//         position: {
//           x: canvas.width / 2 - 192 / 4 / 2,
//           y: canvas.height / 2 - 68 / 2,
//         },
//         velocity: { x: 0, y: 0 },
//         image: { src: playerDownImage },
//         frames: { max: 4, hold: 10 },
//         animate: true,
//         scale: 1,
//         sprites: {
//           up: createImage(playerUpImage),
//           left: createImage(playerLeftImage),
//           right: createImage(playerRightImage),
//           down: createImage(playerDownImage),
//         },
//         // width: 48, // Tambahkan width
//         // height: 48, // Tambahkan height
//       });

//       // Inisialisasi background dan foreground
//       const background = new Sprite({
//         position: { x: -735, y: -650 },
//         image: { src: backgroundImage },
//       });

//       const foreground = new Sprite({
//         position: { x: -735, y: -650 },
//         image: { src: foregroundImage },
//       });

//       // Inisialisasi boundaries
//       class Boundary {
//         static width = 48; // Example width, adjust as needed
//         static height = 48; // Example height, adjust as needed
//         position: { x: number; y: number };
//         width: number;
//         height: number;

//         constructor({ position }: { position: { x: number; y: number } }) {
//           this.position = position;
//           this.width = Boundary.width; // Tambahkan width
//           this.height = Boundary.height; // Tambahkan height
//         }

//         draw(ctx: CanvasRenderingContext2D) {
//           ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // Example color, adjust as needed
//           ctx.fillRect(
//             this.position.x,
//             this.position.y,
//             this.width,
//             this.height
//           );
//         }
//       }

//       const boundaries: Boundary[] = [];
//       const offset = { x: -735, y: -650 };

//       // Map boundaries
//       // Define collisions array (example data, replace with actual map data)
//       const collisions = [
//         [0, 0, 1025, 0],
//         [0, 1025, 0, 0],
//         [1025, 0, 0, 1025],
//       ];

//       collisions.forEach((row, i) => {
//         row.forEach((symbol, j) => {
//           if (symbol === 1025) {
//             boundaries.push(
//               new Boundary({
//                 position: {
//                   x: j * Boundary.width + offset.x,
//                   y: i * Boundary.height + offset.y,
//                 },
//               })
//             );
//           }
//         });
//       });

//       // Elemen yang dapat bergerak
//       const movables = [background, ...boundaries, foreground];

//       const animate = () => {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         // Gambar background
//         background.draw(ctx);

//         // Gambar boundaries
//         boundaries.forEach((boundary) => {
//           boundary.draw(ctx);
//         });

//         // Gambar pemain
//         playerSprite.draw(ctx);

//         // Gambar foreground
//         foreground.draw(ctx);

//         let moving = true;

//         // Pergerakan berdasarkan input keyboard
//         if (keys.w.pressed && lastKey === "w") {
//           playerSprite.image = playerSprite.sprites?.up || playerSprite.image;

//           interface Character {
//             position: { x: number; y: number };
//             width: number;
//             height: number;
//           }

//           const characters: Character[] = [
//             {
//               position: { x: 100, y: 100 },
//               width: 50,
//               height: 50,
//             },
//           ]; // Example characters, replace with actual data
//           checkForCharacterCollision({
//             characters,
//             player: playerSprite,
//             characterOffset: { x: 0, y: 3 },
//           });

//           // Deteksi tabrakan dengan boundaries
//           for (let i = 0; i < boundaries.length; i++) {
//             const boundary = boundaries[i];
//             if (
//               rectangularCollision({
//                 rectangle1: playerSprite,
//                 rectangle2: {
//                   position: {
//                     x: boundary.position.x,
//                     y: boundary.position.y + 3,
//                   },
//                   width: Boundary.width,
//                   height: Boundary.height,
//                 },
//               })
//             ) {
//               moving = false;
//               break;
//             }
//           }

//           if (moving) {
//             movables.forEach((movable) => {
//               movable.position.y += 3;
//             });
//           }
//         } else if (keys.a.pressed && lastKey === "a") {
//           playerSprite.image = playerSprite.sprites?.left || playerSprite.image;

//           for (let i = 0; i < boundaries.length; i++) {
//             const boundary = boundaries[i];
//             if (
//               rectangularCollision({
//                 rectangle1: playerSprite,
//                 rectangle2: {
//                   position: {
//                     x: boundary.position.x + 3,
//                     y: boundary.position.y,
//                   },
//                   width: Boundary.width,
//                   height: Boundary.height,
//                 },
//               })
//             ) {
//               moving = false;
//               break;
//             }
//           }

//           if (moving) {
//             movables.forEach((movable) => {
//               movable.position.x += 3;
//             });
//           }
//         } else if (keys.s.pressed && lastKey === "s") {
//           playerSprite.image = playerSprite.sprites?.down || playerSprite.image;

//           for (let i = 0; i < boundaries.length; i++) {
//             const boundary = boundaries[i];
//             if (
//               rectangularCollision({
//                 rectangle1: playerSprite,
//                 rectangle2: {
//                   position: {
//                     x: boundary.position.x,
//                     y: boundary.position.y - 3,
//                   },
//                   width: Boundary.width,
//                   height: Boundary.height,
//                 },
//               })
//             ) {
//               moving = false;
//               break;
//             }
//           }

//           if (moving) {
//             movables.forEach((movable) => {
//               movable.position.y -= 3;
//             });
//           }
//         } else if (keys.d.pressed && lastKey === "d") {
//           playerSprite.image =
//             playerSprite.sprites?.right || playerSprite.image;

//           for (let i = 0; i < boundaries.length; i++) {
//             const boundary = boundaries[i];
//             if (
//               rectangularCollision({
//                 rectangle1: playerSprite,
//                 rectangle2: {
//                   position: {
//                     x: boundary.position.x - 3,
//                     y: boundary.position.y,
//                   },
//                   width: Boundary.width,
//                   height: Boundary.height,
//                 },
//               })
//             ) {
//               moving = false;
//               break;
//             }
//           }

//           if (moving) {
//             movables.forEach((movable) => {
//               movable.position.x -= 3;
//             });
//           }
//         }

//         requestAnimationFrame(animate);
//       };

//       animate();

//       const handleKeyDown = (e: KeyboardEvent) => {
//         switch (e.key) {
//           case "w":
//             setKeys((prev) => ({ ...prev, w: { pressed: true } }));
//             setLastKey("w");
//             break;
//           case "a":
//             setKeys((prev) => ({ ...prev, a: { pressed: true } }));
//             setLastKey("a");
//             break;
//           case "s":
//             setKeys((prev) => ({ ...prev, s: { pressed: true } }));
//             setLastKey("s");
//             break;
//           case "d":
//             setKeys((prev) => ({ ...prev, d: { pressed: true } }));
//             setLastKey("d");
//             break;
//         }
//       };

//       const handleKeyUp = (e: KeyboardEvent) => {
//         switch (e.key) {
//           case "w":
//             setKeys((prev) => ({ ...prev, w: { pressed: false } }));
//             break;
//           case "a":
//             setKeys((prev) => ({ ...prev, a: { pressed: false } }));
//             break;
//           case "s":
//             setKeys((prev) => ({ ...prev, s: { pressed: false } }));
//             break;
//           case "d":
//             setKeys((prev) => ({ ...prev, d: { pressed: false } }));
//             break;
//         }
//       };

//       window.addEventListener("keydown", handleKeyDown);
//       window.addEventListener("keyup", handleKeyUp);

//       return () => {
//         window.removeEventListener("keydown", handleKeyDown);
//         window.removeEventListener("keyup", handleKeyUp);
//       };
//     }
//   }, [keys, lastKey]);

//   return (
//     <div className="container mx-auto md:mt-16 flex flex-col items-center justify-center px-4">
//       <h1>Game</h1>
//       <canvas ref={canvasRef}></canvas>
//     </div>
//   );
// };

// export default Game;
