import Phaser from "phaser";
import {
  TILE_SIZE,
  MAP_WIDTH,
  VILLAGER_DIALOGUES,
  OLD_MAN_DIALOGUES,
  playerDownImage,
  playerUpImage,
  playerLeftImage,
  playerRightImage,
  backgroundImage,
  collisions,
  villagerImage,
  oldManImage,
} from "../constants";

import type { Character } from "../constants";

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private npcSprites: Phaser.Physics.Arcade.Sprite[] = [];
  private npcDirectionIndex: number = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private boundaries!: Phaser.Physics.Arcade.StaticGroup;
  private battleZones!: Phaser.Physics.Arcade.StaticGroup;
  private speed: number = 200;
  private lastKey: string = "down";
  private moving: boolean = false;
  private battleInitiated: boolean = false;
  private dialogueBox!: Phaser.GameObjects.Container;
  private isInteracting: boolean = false;
  private timeText!: Phaser.GameObjects.Text;

  // NPC direction frames: down=0, left=1, right=2, up=3
  // Cycle order: down → left → up → right
  private readonly NPC_DIRECTION_CYCLE = [0, 1, 3, 2];

  private offset = {
    x: -735,
    y: -650,
  };

  private characters: Character[] = [
    {
      position: { x: 25, y: 16 },
      image: "villager",
      frames: { max: 4, hold: 60 },
      animate: true,
      scale: 3,
      dialogue: ["...", "Hey mister, have you seen my Doggochu?"],
    },
    {
      position: { x: 28, y: 19 },
      image: "oldMan",
      frames: { max: 4, hold: 60 },
      animate: false,
      scale: 3,
      dialogue: ["My bones hurt."],
    },
  ];

  constructor() {
    super({ key: "MainScene" });
  }

  // ── Lifecycle ──────────────────────────────────────────────

  preload() {
    this.load.image("background", backgroundImage);
    this.load.spritesheet("player-down", playerDownImage, {
      frameWidth: 48,
      frameHeight: 68,
    });
    this.load.spritesheet("player-up", playerUpImage, {
      frameWidth: 48,
      frameHeight: 68,
    });
    this.load.spritesheet("player-left", playerLeftImage, {
      frameWidth: 48,
      frameHeight: 68,
    });
    this.load.spritesheet("player-right", playerRightImage, {
      frameWidth: 48,
      frameHeight: 68,
    });
    this.load.spritesheet("villager", villagerImage, {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("oldMan", oldManImage, {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create() {
    // Background
    const background = this.add.image(this.offset.x, this.offset.y, "background");
    background.setOrigin(0, 0);

    // World setup
    this.createBoundaries();
    this.createBattleZones();
    this.createCharacters();

    // Player
    this.player = this.physics.add.sprite(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "player-down"
    );
    this.player.setCollideWorldBounds(false);
    this.player.setSize(32, 32);
    this.player.setOffset(8, 32);

    // Collisions & animations
    this.setupCollisions();
    this.createPlayerAnimations();

    // NPC direction cycling (every 500ms)
    this.time.addEvent({
      delay: 500,
      callback: this.cycleNPCDirection,
      callbackScope: this,
      loop: true,
    });

    // Camera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1);

    // Controls
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Dialogue & interactions
    this.createDialogueSystem();
    this.setupInteractions();
  }

  update() {
    if (!this.player || !this.cursors || this.isInteracting) return;

    this.player.setVelocity(0);
    this.moving = false;

    const keys = this.input.keyboard!.addKeys("W,A,S,D") as {
      [key: string]: Phaser.Input.Keyboard.Key;
    };

    // Movement (4-way only, no diagonal)
    if (this.cursors.left.isDown || keys.A.isDown) {
      this.player.setVelocityX(-this.speed);
      this.player.setVelocityY(0);
      this.player.anims.play("walk-left", true);
      this.lastKey = "left";
      this.moving = true;
    } else if (this.cursors.right.isDown || keys.D.isDown) {
      this.player.setVelocityX(this.speed);
      this.player.setVelocityY(0);
      this.player.anims.play("walk-right", true);
      this.lastKey = "right";
      this.moving = true;
    } else if (this.cursors.up.isDown || keys.W.isDown) {
      this.player.setVelocityY(-this.speed);
      this.player.setVelocityX(0);
      this.player.anims.play("walk-up", true);
      this.lastKey = "up";
      this.moving = true;
    } else if (this.cursors.down.isDown || keys.S.isDown) {
      this.player.setVelocityY(this.speed);
      this.player.setVelocityX(0);
      this.player.anims.play("walk-down", true);
      this.lastKey = "down";
      this.moving = true;
    }

    // Idle
    if (!this.moving) {
      switch (this.lastKey) {
        case "left":
          this.player.anims.play("idle-left", true);
          break;
        case "right":
          this.player.anims.play("idle-right", true);
          break;
        case "up":
          this.player.anims.play("idle-up", true);
          break;
        case "down":
          this.player.anims.play("idle-down", true);
          break;
      }
    }
  }

  // ── World Building ─────────────────────────────────────────

  private createBoundaries() {
    this.boundaries = this.physics.add.staticGroup();

    const collisionsMap: number[][] = [];
    for (let i = 0; i < collisions.length; i += MAP_WIDTH) {
      collisionsMap.push(collisions.slice(i, i + MAP_WIDTH));
    }

    collisionsMap.forEach((row, i) => {
      row.forEach((symbol, j) => {
        if (symbol === 1025) {
          const boundary = this.boundaries.create(
            j * TILE_SIZE + this.offset.x,
            i * TILE_SIZE + this.offset.y,
            ""
          );
          boundary.setSize(TILE_SIZE, TILE_SIZE);
          boundary.setVisible(false);
          boundary.refreshBody();
        }
      });
    });
  }

  private createBattleZones() {
    this.battleZones = this.physics.add.staticGroup();

    const battleZone = this.battleZones.create(
      this.offset.x + 500,
      this.offset.y + 500,
      ""
    );
    battleZone.setSize(200, 200);
    battleZone.setVisible(false);
    battleZone.refreshBody();
  }

  private createCharacters() {
    this.npcSprites = [];
    this.characters.forEach((char) => {
      const npc = this.physics.add.sprite(
        char.position.x * TILE_SIZE + this.offset.x,
        char.position.y * TILE_SIZE + this.offset.y,
        char.image
      );
      npc.setScale(char.scale);
      npc.setImmovable(true);

      // Default facing: down (frame 0)
      npc.setFrame(0);

      // Dialogue
      const dialogues =
        char.image === "villager"
          ? VILLAGER_DIALOGUES[
              Math.floor(Math.random() * VILLAGER_DIALOGUES.length)
            ]
          : OLD_MAN_DIALOGUES[
              Math.floor(Math.random() * OLD_MAN_DIALOGUES.length)
            ];

      npc.setData("dialogue", dialogues);
      npc.setData("dialogueIndex", 0);

      this.npcSprites.push(npc);
    });
  }

  // ── NPC Direction Cycling ──────────────────────────────────

  private cycleNPCDirection() {
    this.npcDirectionIndex =
      (this.npcDirectionIndex + 1) % this.NPC_DIRECTION_CYCLE.length;
    const frame = this.NPC_DIRECTION_CYCLE[this.npcDirectionIndex];

    this.npcSprites.forEach((npc) => {
      npc.setFrame(frame);
    });
  }

  // ── Collisions ─────────────────────────────────────────────

  private setupCollisions() {
    this.physics.add.collider(this.player, this.boundaries);

    this.npcSprites.forEach((npc) => {
      this.physics.add.collider(this.player, npc);
    });

    this.physics.add.overlap(
      this.player,
      this.battleZones,
      this.handleBattleZoneOverlap,
      undefined,
      this
    );
  }

  private handleBattleZoneOverlap() {
    if (this.moving && !this.battleInitiated && Math.random() < 0.01) {
      this.battleInitiated = true;

      const flash = this.add.rectangle(0, 0, 1024, 576, 0xffffff);
      flash.setOrigin(0, 0);

      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 400,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          flash.destroy();
          this.scene.start("BattleScene");
        },
      });
    }
  }

  // ── Dialogue System ────────────────────────────────────────

  private createDialogueSystem() {
    this.dialogueBox = this.add.container(512, 500);

    const box = this.add.rectangle(0, 0, 800, 100, 0xffffff);
    box.setStrokeStyle(2, 0x000000);

    const text = this.add.text(-380, -30, "", {
      fontSize: "20px",
      wordWrap: { width: 760 },
      color: "#000000",
    });

    const spaceIcon = this.add.text(320, 30, "[Space]", {
      fontSize: "16px",
      backgroundColor: "#dddddd",
      color: "#000000",
      padding: { x: 5, y: 3 },
    });

    this.dialogueBox.add([box, text, spaceIcon]);
    this.dialogueBox.setVisible(false);

    // Clock
    this.timeText = this.add.text(900, 20, "", {
      fontSize: "20px",
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 10, y: 5 },
    });
    this.timeText.setScrollFactor(0);
    this.updateClock();

    this.time.addEvent({
      delay: 1000,
      callback: this.updateClock,
      callbackScope: this,
      loop: true,
    });
  }

  private updateClock() {
    const jakartaTime = new Date().toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    });
    this.timeText.setText(jakartaTime);
  }

  private setupInteractions() {
    this.input.keyboard!.on("keydown-SPACE", () => {
      if (this.isInteracting) {
        const activeNPC = this.getActiveNPC();
        if (!activeNPC) {
          this.endDialogue();
          return;
        }

        const dialogues = activeNPC.getData("dialogue");
        const currentIndex = activeNPC.getData("dialogueIndex");

        if (currentIndex >= dialogues.length - 1) {
          this.endDialogue();
          activeNPC.setData("dialogueIndex", 0);
        } else {
          activeNPC.setData("dialogueIndex", currentIndex + 1);
          this.showDialogue(activeNPC);
        }
      } else {
        this.checkForCharacterInteraction();
      }
    });
  }

  private getActiveNPC(): Phaser.GameObjects.Sprite | undefined {
    const nearby = this.physics.overlapCirc(this.player.x, this.player.y, 50);

    const nearbySprite = nearby.find(
      (obj) =>
        obj.gameObject instanceof Phaser.GameObjects.Sprite &&
        (obj.gameObject as Phaser.GameObjects.Sprite).getData("dialogue")
    );

    return nearbySprite?.gameObject as Phaser.GameObjects.Sprite;
  }

  private checkForCharacterInteraction() {
    const activeNPC = this.getActiveNPC();
    if (activeNPC) {
      this.startDialogue(activeNPC);
    }
  }

  private startDialogue(npc: Phaser.GameObjects.Sprite) {
    this.isInteracting = true;
    npc.setData("dialogueIndex", 0);
    this.showDialogue(npc);
  }

  private showDialogue(npc: Phaser.GameObjects.Sprite) {
    const text = this.dialogueBox.getAt(1) as Phaser.GameObjects.Text;
    const dialogue = npc.getData("dialogue");
    const dialogueIndex = npc.getData("dialogueIndex");
    text.setText(dialogue[dialogueIndex]);
    this.dialogueBox.setVisible(true);
  }

  private endDialogue() {
    this.isInteracting = false;
    this.dialogueBox.setVisible(false);
  }

  // ── Animations ─────────────────────────────────────────────

  private createPlayerAnimations() {
    // Walk animations
    this.anims.create({
      key: "walk-down",
      frames: this.anims.generateFrameNumbers("player-down", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "walk-up",
      frames: this.anims.generateFrameNumbers("player-up", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "walk-left",
      frames: this.anims.generateFrameNumbers("player-left", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "walk-right",
      frames: this.anims.generateFrameNumbers("player-right", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    // Idle animations (single frame — first frame of each direction)
    this.anims.create({
      key: "idle-down",
      frames: [{ key: "player-down", frame: 0 }],
      frameRate: 1,
    });

    this.anims.create({
      key: "idle-up",
      frames: [{ key: "player-up", frame: 0 }],
      frameRate: 1,
    });

    this.anims.create({
      key: "idle-left",
      frames: [{ key: "player-left", frame: 0 }],
      frameRate: 1,
    });

    this.anims.create({
      key: "idle-right",
      frames: [{ key: "player-right", frame: 0 }],
      frameRate: 1,
    });
  }
}
