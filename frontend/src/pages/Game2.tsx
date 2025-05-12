import { useEffect, useState } from "react";
import Phaser from "phaser";
import { motion } from "framer-motion";
import { Gamepad2, Maximize2, Volume2, VolumeX, RefreshCw } from "lucide-react";
import playerDownImage from "../assets/img/playerDown.png";
import playerUpImage from "../assets/img/playerUp.png";
import playerLeftImage from "../assets/img/playerLeft.png";
import playerRightImage from "../assets/img/playerRight.png";
import backgroundImage from "../assets/img/Pellet Town.png";
import collisions from "@/assets/data/collisions";
import villagerImage from "@/assets/img/villager/Idle.png";
import oldManImage from "@/assets/img/oldMan/Idle.png";

// Constants for the game
const TILE_SIZE = 48;
const MAP_WIDTH = 70;

interface Character {
  position: { x: number; y: number };
  image: string;
  frames: { max: number; hold: number };
  animate: boolean;
  scale: number;
  dialogue: string[];
}

// Add random dialogues
const VILLAGER_DIALOGUES = [
  ["Selamat datang di Pellet Town!", "Cuaca hari ini sangat cerah ya?"],
  ["Kamu terlihat seperti trainer yang kuat!", "Mau bertarung denganku?"],
  ["Aku sedang mencari Doggochu ku...", "Apa kamu melihatnya?"],
];

const OLD_MAN_DIALOGUES = [
  [
    "Ah... tulang-tulangku sudah tua...",
    "Dulu aku juga seorang trainer hebat.",
  ],
  ["Jangan lupa istirahat yang cukup.", "Kesehatan itu penting!"],
  ["Kamu mengingatkanku pada diriku waktu muda."],
];

class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "BattleScene" });
  }

  create() {
    // Battle scene implementation will go here
    const battleBackground = this.add.rectangle(0, 0, 1024, 576, 0x000000);
    battleBackground.setOrigin(0, 0);

    // Add UI elements
    this.createBattleUI();

    // Add transition back to main scene
    this.input.keyboard!.on("keydown-SPACE", () => {
      this.scene.start("MainScene");
    });
  }

  createBattleUI() {
    // Create battle UI elements
    const uiContainer = this.add.container(0, 0);

    // Enemy health bar
    const enemyHealthBar = this.add.rectangle(50, 50, 250, 10, 0x00ff00);
    const enemyHealthText = this.add.text(50, 30, "Enemy", {
      fontSize: "16px",
    });

    // Player health bar
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

class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private npc1!: Phaser.Physics.Arcade.Sprite;
  private npc2!: Phaser.Physics.Arcade.Sprite;
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

  preload() {
    // Load all assets
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
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("oldMan", oldManImage, {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    // Add background with offset
    const background = this.add.image(
      this.offset.x,
      this.offset.y,
      "background"
    );
    background.setOrigin(0, 0);

    // Create collision boundaries and battle zones
    this.createBoundaries();
    this.createBattleZones();
    this.createCharacters();

    // Create player at center of screen
    this.player = this.physics.add.sprite(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "player-down"
    );
    this.player.setCollideWorldBounds(false);
    this.player.setSize(32, 32);
    this.player.setOffset(8, 32);

    // Setup collisions
    this.setupCollisions();

    // Create animations
    this.createPlayerAnimations();

    // Setup camera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1);

    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Setup dialogue system
    this.createDialogueSystem();

    // Setup interaction handling
    this.setupInteractions();
  }

  createBoundaries() {
    this.boundaries = this.physics.add.staticGroup();

    const collisionsMap = [];
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

  createBattleZones() {
    this.battleZones = this.physics.add.staticGroup();

    // You'll need to create your battleZonesData similar to collisions
    // For now, we'll create a sample battle zone
    const battleZone = this.battleZones.create(
      this.offset.x + 500,
      this.offset.y + 500,
      ""
    );
    battleZone.setSize(200, 200);
    battleZone.setVisible(false);
    battleZone.refreshBody();
  }

  createCharacters() {
    this.characters.forEach((char) => {
      const npc = this.physics.add.sprite(
        char.position.x * TILE_SIZE + this.offset.x,
        char.position.y * TILE_SIZE + this.offset.y,
        char.image
      );
      npc.setScale(char.scale);
      npc.setImmovable(true);

      // Set frame to 0 for idle position
      npc.setFrame(0);

      // Store dialogue data
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
    });
  }

  setupCollisions() {
    this.physics.add.collider(this.player, this.boundaries);
    this.physics.add.collider(this.player, this.npc1);
    this.physics.add.collider(this.player, this.npc2);

    // Battle zone overlap checking
    this.physics.add.overlap(
      this.player,
      this.battleZones,
      this.handleBattleZoneOverlap,
      undefined,
      this
    );
  }

  createDialogueSystem() {
    // Create dialogue box (hidden by default)
    this.dialogueBox = this.add.container(512, 500);

    // Create white background for dialogue
    const box = this.add.rectangle(0, 0, 800, 100, 0xffffff);
    box.setStrokeStyle(2, 0x000000);

    // Create text for dialogue
    const text = this.add.text(-380, -30, "", {
      fontSize: "20px",
      wordWrap: { width: 760 },
      color: "#000000",
    });

    // Create space icon
    const spaceIcon = this.add.text(320, 30, "[Space]", {
      fontSize: "16px",
      backgroundColor: "#dddddd",
      color: "#000000",
      padding: { x: 5, y: 3 },
    });

    this.dialogueBox.add([box, text, spaceIcon]);
    this.dialogueBox.setVisible(false);

    // Add clock
    this.timeText = this.add.text(900, 20, "", {
      fontSize: "20px",
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 10, y: 5 },
    });
    this.timeText.setScrollFactor(0); // Fix position on screen
    this.updateClock();

    // Update clock every second
    this.time.addEvent({
      delay: 1000,
      callback: this.updateClock,
      callbackScope: this,
      loop: true,
    });
  }

  updateClock() {
    const jakartaTime = new Date().toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    });
    this.timeText.setText(jakartaTime);
  }

  setupInteractions() {
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

  progressDialogue() {
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
  }

  checkForCharacterInteraction() {
    const activeNPC = this.getActiveNPC();
    if (activeNPC) {
      this.startDialogue(activeNPC);
    }
  }

  getActiveNPC(): Phaser.GameObjects.Sprite | undefined {
    // Check for nearby NPCs
    const nearby = this.physics.overlapCirc(this.player.x, this.player.y, 50);

    const nearbySprite = nearby.find(
      (obj) =>
        obj.gameObject instanceof Phaser.GameObjects.Sprite &&
        (obj.gameObject as Phaser.GameObjects.Sprite).getData("dialogue")
    );

    return nearbySprite?.gameObject as Phaser.GameObjects.Sprite;
  }

  startDialogue(npc: Phaser.GameObjects.Sprite) {
    this.isInteracting = true;
    npc.setData("dialogueIndex", 0);
    this.showDialogue(npc);
  }

  showDialogue(npc: Phaser.GameObjects.Sprite) {
    const text = this.dialogueBox.getAt(1) as Phaser.GameObjects.Text;
    const dialogue = npc.getData("dialogue");
    const dialogueIndex = npc.getData("dialogueIndex");
    text.setText(dialogue[dialogueIndex]);
    this.dialogueBox.setVisible(true);
  }

  endDialogue() {
    this.isInteracting = false;
    this.dialogueBox.setVisible(false);
  }

  handleBattleZoneOverlap() {
    if (this.moving && !this.battleInitiated && Math.random() < 0.01) {
      this.battleInitiated = true;

      // Create a flash effect
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

  update() {
    if (!this.player || !this.cursors || this.isInteracting) return;

    // Reset velocity and moving flag
    this.player.setVelocity(0);
    this.moving = false;

    const keys = this.input.keyboard!.addKeys("W,A,S,D") as {
      [key: string]: Phaser.Input.Keyboard.Key;
    };

    // Handle movement with both arrow keys and WASD
    if (this.cursors.left.isDown || keys.A.isDown) {
      this.player.setVelocityX(-this.speed);
      this.player.anims.play("walk-left", true);
      this.lastKey = "left";
      this.moving = true;
    } else if (this.cursors.right.isDown || keys.D.isDown) {
      this.player.setVelocityX(this.speed);
      this.player.anims.play("walk-right", true);
      this.lastKey = "right";
      this.moving = true;
    }

    if (this.cursors.up.isDown || keys.W.isDown) {
      this.player.setVelocityY(-this.speed);
      this.player.anims.play("walk-up", true);
      this.lastKey = "up";
      this.moving = true;
    } else if (this.cursors.down.isDown || keys.S.isDown) {
      this.player.setVelocityY(this.speed);
      this.player.anims.play("walk-down", true);
      this.lastKey = "down";
      this.moving = true;
    }

    // Stop animations if not moving
    if (!this.moving) {
      this.player.anims.stop();
    }
  }

  createPlayerAnimations() {
    // Down animation
    this.anims.create({
      key: "walk-down",
      frames: this.anims.generateFrameNumbers("player-down", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Up animation
    this.anims.create({
      key: "walk-up",
      frames: this.anims.generateFrameNumbers("player-up", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Left animation
    this.anims.create({
      key: "walk-left",
      frames: this.anims.generateFrameNumbers("player-left", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Right animation
    this.anims.create({
      key: "walk-right",
      frames: this.anims.generateFrameNumbers("player-right", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }
}

const Game: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [gameInstance, setGameInstance] = useState<Phaser.Game | null>(null);

  // Add handleDirectionalMovement function
  const handleDirectionalMovement = (
    e: React.TouchEvent,
    button: HTMLButtonElement
  ) => {
    const touch = e.touches[0];
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = touch.clientX - centerX;
    const deltaY = touch.clientY - centerY;

    // Reset all keys
    ["w", "a", "s", "d"].forEach((key) => {
      window.dispatchEvent(new KeyboardEvent("keyup", { key }));
    });

    // Determine direction based on angle
    const angle = Math.atan2(deltaY, deltaX);
    const pi = Math.PI;

    if (angle > -pi / 4 && angle <= pi / 4) {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }));
    } else if (angle > pi / 4 && angle <= (3 * pi) / 4) {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "s" }));
    } else if (angle > (3 * pi) / 4 || angle <= (-3 * pi) / 4) {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    } else {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }));
    }
  };

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1024,
      height: 576,
      parent: "game-container",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false,
        },
      },
      scene: [MainScene, BattleScene],
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const game = new Phaser.Game(config);
    setGameInstance(game);

    // Handle window resize
    const handleResize = () => {
      if (document.fullscreenElement) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        game.scale.resize(width, height);
      } else {
        game.scale.resize(1024, 576);
      }
    };

    // Handle fullscreen change
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      handleResize();
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Add touch controls for mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      const controls = document.getElementById("mobile-controls");
      if (controls) controls.style.display = "flex";

      const handleOrientation = (): void => {
        const controls = document.getElementById("mobile-controls");
        if (controls) {
          if (window.orientation === 90 || window.orientation === -90) {
            controls.classList.remove("bottom-4");
            controls.classList.add("landscape");
          } else {
            controls.classList.add("bottom-4");
            controls.classList.remove("landscape");
          }
        }
        handleResize(); // Also handle game resize on orientation change
      };

      window.addEventListener("orientationchange", handleOrientation);
      handleOrientation();

      return () => {
        game.destroy(true);
        window.removeEventListener("orientationchange", handleOrientation);
        window.removeEventListener("resize", handleResize);
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
      };
    }

    return () => {
      game.destroy(true);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    const gameContainer = document.getElementById("game-container");
    if (!document.fullscreenElement) {
      try {
        await gameContainer?.requestFullscreen();
        setIsFullscreen(true);
        if (gameInstance) {
          const width = window.innerWidth;
          const height = window.innerHeight;
          gameInstance.scale.resize(width, height);
        }
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
        if (gameInstance) {
          gameInstance.scale.resize(1024, 576);
        }
      } catch (err) {
        console.error("Error attempting to exit fullscreen:", err);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Add actual mute logic here when audio is implemented
  };

  const toggleControls = () => {
    setIsControlsVisible(!isControlsVisible);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative rounded-2xl overflow-hidden bg-black/20 backdrop-blur-lg border border-white/10 shadow-2xl ${
          isFullscreen ? "w-screen h-screen rounded-none" : "max-w-[90vw]"
        }`}
      >
        {/* Game Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <Gamepad2 className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Pellet Town Adventure
            </h1>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3"
          >
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-gray-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-purple-400" />
              )}
            </button>

            <button
              onClick={toggleControls}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Toggle Controls"
            >
              <Gamepad2
                className={`w-5 h-5 ${
                  isControlsVisible ? "text-purple-400" : "text-gray-400"
                }`}
              />
            </button>

            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                isFullscreen ? "bg-white/10" : ""
              }`}
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-5 h-5 text-purple-400" />
            </button>
          </motion.div>
        </div>

        {/* Game Container */}
        <div className="relative">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            id="game-container"
            className={`relative ${isFullscreen ? "w-screen h-screen" : ""}`}
          >
            {/* Game Area Touch Controls */}
            <div
              className="absolute inset-0 z-10"
              style={{ touchAction: "none" }}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                const target = e.currentTarget;
                const rect = target.getBoundingClientRect();

                const relativeX = touch.clientX - rect.left;
                const relativeY = touch.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const deltaX = relativeX - centerX;
                const deltaY = relativeY - centerY;

                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                  const key = deltaX > 0 ? "d" : "a";
                  window.dispatchEvent(new KeyboardEvent("keydown", { key }));
                } else {
                  const key = deltaY > 0 ? "s" : "w";
                  window.dispatchEvent(new KeyboardEvent("keydown", { key }));
                }
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                const target = e.currentTarget;
                const rect = target.getBoundingClientRect();

                const relativeX = touch.clientX - rect.left;
                const relativeY = touch.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                ["w", "a", "s", "d"].forEach((key) => {
                  window.dispatchEvent(new KeyboardEvent("keyup", { key }));
                });

                const deltaX = relativeX - centerX;
                const deltaY = relativeY - centerY;

                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                  const key = deltaX > 0 ? "d" : "a";
                  window.dispatchEvent(new KeyboardEvent("keydown", { key }));
                } else {
                  const key = deltaY > 0 ? "s" : "w";
                  window.dispatchEvent(new KeyboardEvent("keydown", { key }));
                }
              }}
              onTouchEnd={() => {
                ["w", "a", "s", "d"].forEach((key) => {
                  window.dispatchEvent(new KeyboardEvent("keyup", { key }));
                });
              }}
            />
          </motion.div>

          {/* Loading Animation */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80 z-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-8 h-8 text-purple-400" />
            </motion.div>
          </motion.div>
        </div>

        {/* Game Footer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 border-t border-white/10"
        >
          <p className="text-sm text-gray-400 text-center">
            Use WASD or Arrow Keys to move • Space to interact
          </p>
        </motion.div>
      </motion.div>

      {/* Mobile Controls */}
      {isControlsVisible && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          id="mobile-controls"
          className="fixed bottom-4 left-0 right-0 flex flex-col items-center gap-2 p-4"
          style={{
            display: "none",
            touchAction: "none",
          }}
        >
          <style>
            {`
              .landscape {
                flex-direction: row !important;
                justify-content: space-between;
                padding: 2rem;
                bottom: 50%;
                transform: translateY(50%);
              }
              .landscape .controls-left,
              .landscape .controls-right {
                display: flex;
                gap: 1rem;
                align-items: center;
              }
              .action-button {
                position: fixed;
                right: 2rem;
                bottom: 8rem;
                width: 6rem;
                height: 6rem;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(4px);
                font-size: 0.875rem;
                color: white;
                text-transform: uppercase;
                font-weight: bold;
                touch-action: none;
              }
              .action-button::after {
                content: '';
                position: absolute;
                width: 2rem;
                height: 2rem;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                pointer-events: none;
              }
              .landscape .action-button {
                right: 4rem;
                bottom: 50%;
                transform: translateY(50%);
              }
            `}
          </style>

          {/* D-Pad Controls */}
          <div className="controls-left">
            <div className="flex flex-col items-center gap-2">
              <button
                className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center text-white text-2xl backdrop-blur-sm active:bg-white/50"
                onTouchStart={() =>
                  window.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "w" })
                  )
                }
                onTouchEnd={() =>
                  window.dispatchEvent(new KeyboardEvent("keyup", { key: "w" }))
                }
              >
                ↑
              </button>

              <div className="flex gap-4 items-center">
                <button
                  className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center text-white text-2xl backdrop-blur-sm active:bg-white/50"
                  onTouchStart={() =>
                    window.dispatchEvent(
                      new KeyboardEvent("keydown", { key: "a" })
                    )
                  }
                  onTouchEnd={() =>
                    window.dispatchEvent(
                      new KeyboardEvent("keyup", { key: "a" })
                    )
                  }
                >
                  ←
                </button>

                <button
                  className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center text-white text-2xl backdrop-blur-sm active:bg-white/50"
                  onTouchStart={() =>
                    window.dispatchEvent(
                      new KeyboardEvent("keydown", { key: "d" })
                    )
                  }
                  onTouchEnd={() =>
                    window.dispatchEvent(
                      new KeyboardEvent("keyup", { key: "d" })
                    )
                  }
                >
                  →
                </button>
              </div>

              <button
                className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center text-white text-2xl backdrop-blur-sm active:bg-white/50"
                onTouchStart={() =>
                  window.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "s" })
                  )
                }
                onTouchEnd={() =>
                  window.dispatchEvent(new KeyboardEvent("keyup", { key: "s" }))
                }
              >
                ↓
              </button>
            </div>
          </div>

          {/* Action Button with Directional Movement */}
          <button
            className="action-button active:bg-white/50"
            onTouchStart={(e) => {
              const button = e.currentTarget;
              handleDirectionalMovement(e, button);
            }}
            onTouchMove={(e) => {
              const button = e.currentTarget;
              handleDirectionalMovement(e, button);
            }}
            onTouchEnd={() => {
              ["w", "a", "s", "d"].forEach((key) => {
                window.dispatchEvent(new KeyboardEvent("keyup", { key }));
              });
            }}
          >
            <div className="w-2 h-2 bg-white rounded-full" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Game;
