// frontend/src/particles-config.ts
import type { ISourceOptions } from "@tsparticles/engine";

export const particlesOptions: ISourceOptions = {
  autoPlay: true,
  background: {
    // Kita tidak akan set warna background di sini agar
    // background dari Tailwind CSS tetap terlihat.
    // color: {
    //   value: "#0d47a1", // Contoh warna background partikel
    // },
  },
  fpsLimit: 60, // Bisa diturunkan ke 30 untuk performa jika perlu
  interactivity: {
    events: {
      onClick: {
        enable: false, // Set true jika ingin interaksi klik
        mode: "push",
      },
      onHover: {
        enable: true,
        mode: "repulse", // Partikel menjauh saat di-hover
      },
    },
    modes: {
      push: {
        quantity: 4,
      },
      repulse: {
        distance: 150, // Jarak "repulse"
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: "#ffffff", // Warna partikel (putih)
    },
    links: {
      color: "#ffffff", // Warna garis penghubung antar partikel
      distance: 150,
      enable: true,
      opacity: 0.2, // Buat garis lebih transparan
      width: 1,
    },
    collisions: {
      enable: false, // Set true jika ingin partikel bertabrakan
    },
    move: {
      direction: "none",
      enable: true,
      outModes: {
        default: "bounce", // Partikel akan memantul di tepi layar
      },
      random: false,
      speed: 1, // Kecepatan gerak partikel
      straight: false,
    },
    number: {
      density: {
        enable: true,
      },
      value: 50, // Jumlah partikel awal
    },
    opacity: {
      value: 0.3, // Buat partikel lebih transparan
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 3 }, // Ukuran partikel acak antara 1 dan 3
    },
  },
  detectRetina: true,
};
