import collisions from "../data/collisions";

// ── Images (Public Assets) ──
const playerDownImage = "/assets/img/playerDown.png";
const playerUpImage = "/assets/img/playerUp.png";
const playerLeftImage = "/assets/img/playerLeft.png";
const playerRightImage = "/assets/img/playerRight.png";
const backgroundImage = "/assets/img/Pellet Town.png";
const villagerImage = "/assets/img/villager/Idle.png";
const oldManImage = "/assets/img/oldMan/Idle.png";

// ── Constants ──
export const TILE_SIZE = 48;
export const MAP_WIDTH = 70;
export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 576;

// ── Types ──
export interface Character {
  position: { x: number; y: number };
  image: string;
  frames: { max: number; hold: number };
  animate: boolean;
  scale: number;
  dialogue: string[];
}

// ── Dialogue Data ──
export const VILLAGER_DIALOGUES = [
  ["Selamat datang di Pellet Town!", "Cuaca hari ini sangat cerah ya?"],
  ["Kamu terlihat seperti trainer yang kuat!", "Mau bertarung denganku?"],
  ["Aku sedang mencari Doggochu ku...", "Apa kamu melihatnya?"],
];

export const OLD_MAN_DIALOGUES = [
  [
    "Ah... tulang-tulangku sudah tua...",
    "Dulu aku juga seorang trainer hebat.",
  ],
  ["Jangan lupa istirahat yang cukup.", "Kesehatan itu penting!"],
  ["Kamu mengingatkanku pada diriku waktu muda."],
];

// ── Asset Re-exports ──
export {
  playerDownImage,
  playerUpImage,
  playerLeftImage,
  playerRightImage,
  backgroundImage,
  collisions,
  villagerImage,
  oldManImage,
};
