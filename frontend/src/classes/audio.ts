// src/audio.ts

export const audio = {
  initFireball: new Audio("./audio/initFireball.wav"),
  fireballHit: new Audio("./audio/fireballHit.wav"),
  tackleHit: new Audio("./audio/tackleHit.wav"),

  // (Opsional) Tambahkan pengaturan default volume atau loop jika dibutuhkan
  setup() {
    this.initFireball.volume = 0.5;
    this.fireballHit.volume = 0.5;
    this.tackleHit.volume = 0.5;

    // Misalnya jika ingin looping salah satu suara
    // this.someLoopingAudio.loop = true;
  },

  // (Opsional) Utility untuk menghentikan semua suara
  stopAll() {
    Object.values(this).forEach((sound) => {
      if (sound instanceof Audio) {
        sound.pause();
        sound.currentTime = 0;
      }
    });
  },
};
