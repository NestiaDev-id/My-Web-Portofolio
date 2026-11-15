import Phaser from "phaser";
import { virtualPad } from "../virtualPad";

export default class BattleScene extends Phaser.Scene {
  private unsubPad?: () => void;

  constructor() {
    super({ key: "BattleScene" });
  }

  create() {
    const battleBackground = this.add.rectangle(0, 0, 1024, 576, 0x000000);
    battleBackground.setOrigin(0, 0);

    this.createBattleUI();

    const returnToTown = () => {
      this.scene.start("MainScene");
    };

    this.input.keyboard!.on("keydown-SPACE", returnToTown);
    this.input.keyboard!.on("keydown-ENTER", returnToTown);
    this.input.keyboard!.on("keydown-ESC", returnToTown);

    this.unsubPad = virtualPad.subscribe((btn, isDown) => {
      if (isDown && (btn === "a" || btn === "b" || btn === "start")) {
        returnToTown();
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubPad?.();
    });
  }

  private createBattleUI() {
    const uiContainer = this.add.container(0, 0);

    const enemyHealthBar = this.add.rectangle(50, 50, 250, 10, 0x00ff00);
    const enemyHealthText = this.add.text(50, 30, "Enemy", {
      fontSize: "16px",
    });

    const playerHealthBar = this.add.rectangle(724, 330, 250, 10, 0x00ff00);
    const playerHealthText = this.add.text(724, 310, "Player", {
      fontSize: "16px",
    });

    const tipText = this.add.text(512, 500, "Tekan A / B / Space untuk kembali ke kota", {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#222222",
      padding: { x: 12, y: 6 },
    });
    tipText.setOrigin(0.5, 0.5);

    uiContainer.add([
      enemyHealthBar,
      enemyHealthText,
      playerHealthBar,
      playerHealthText,
      tipText,
    ]);
  }
}
