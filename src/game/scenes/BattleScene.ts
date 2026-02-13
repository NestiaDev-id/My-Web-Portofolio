import Phaser from "phaser";

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "BattleScene" });
  }

  create() {
    const battleBackground = this.add.rectangle(0, 0, 1024, 576, 0x000000);
    battleBackground.setOrigin(0, 0);

    this.createBattleUI();

    this.input.keyboard!.on("keydown-SPACE", () => {
      this.scene.start("MainScene");
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

    uiContainer.add([
      enemyHealthBar,
      enemyHealthText,
      playerHealthBar,
      playerHealthText,
    ]);
  }
}
