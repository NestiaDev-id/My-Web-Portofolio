import playerDownImage from "@/assets/img/playerDown.png";
import playerUpImage from "@/assets/img/playerUp.png";
import playerLeftImage from "@/assets/img/playerLeft.png";
import playerRightImage from "@/assets/img/playerRight.png";
import backgroundImage from "@/assets/img/Pellet Town.png";
import collisions from "@/assets/data/collisions";
import villagerImage from "@/assets/img/villager/Idle.png";
import oldManImage from "@/assets/img/oldMan/Idle.png";

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
