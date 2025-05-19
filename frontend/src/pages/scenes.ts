// src/phaser/scenes/GameScene.ts
import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    // Load asset di sini (contoh: this.load.image('logo', '...')
  }

  create() {
    this.add.text(100, 100, "Game Page!", {
      fontSize: "32px",
      color: "#ffffff",
    });
  }

  update() {
    // Update loop logic
  }
}
