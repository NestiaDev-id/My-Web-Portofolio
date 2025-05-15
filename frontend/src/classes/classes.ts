import gsap from "gsap";
// import { audio } from "./audio";
// Tipe untuk posisi
interface Position {
  x: number;
  y: number;
}

// Tipe untuk frame animasi
interface Frames {
  max: number;
  hold: number;
  val?: number;
  elapsed?: number;
}

// Tipe untuk sprite
interface SpriteConfig {
  position: Position;
  velocity?: Position;
  image: { src: string };
  frames?: Frames;
  sprites?: Record<string, HTMLImageElement>;
  animate?: boolean;
  rotation?: number;
  scale?: number;
}

// Kelas Sprite
// src/classes/classes.ts

class Sprite {
  position: Position;
  velocity?: Position;
  image: HTMLImageElement;
  frames: Frames;
  animate: boolean;
  rotation: number;
  scale: number;
  width: number = 0;
  height: number = 0;
  sprites?: Record<string, HTMLImageElement>;
  opacity: number = 1;
  isLoaded: boolean = false;

  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    scale = 1,
  }: SpriteConfig) {
    this.position = position;
    this.velocity = velocity;
    this.image = new Image();
    this.frames = { ...frames, val: 0, elapsed: 0 };
    this.animate = animate;
    this.sprites = sprites;
    this.rotation = rotation;
    this.scale = scale;

    // Atur properti width dan height setelah gambar selesai dimuat
    this.image.onload = () => {
      this.isLoaded = true;
      console.log("Image loaded in classes.ts");
      console.log("Image dimensions:", this.image.width, this.image.height);
      if (this.frames.max > 0) {
        this.width = (this.image.width / this.frames.max) * this.scale;
        this.height = this.image.height * this.scale;
      } else {
        console.error("frames.max harus lebih besar dari 0");
      }
      console.log("Sprite width:", this.width, "Sprite height:", this.height);
    };
    console.log("Setting image source to:", image.src);

    this.image.src = image.src;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isLoaded) return;

    ctx.save();
    ctx.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
    ctx.rotate(this.rotation);
    ctx.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2
    );
    ctx.globalAlpha = this.opacity;

    const crop = {
      position: {
        x: this.frames.val! * (this.width / this.scale),
        y: 0,
      },
      width: this.image.width / this.frames.max,
      height: this.image.height,
    };

    const image = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      width: this.image.width / this.frames.max,
      height: this.image.height,
    };

    ctx.drawImage(
      this.image,
      crop.position.x,
      crop.position.y,
      crop.width,
      crop.height,
      image.position.x,
      image.position.y,
      image.width * this.scale,
      image.height * this.scale
    );

    ctx.restore();

    if (!this.animate) return;

    if (this.frames.max > 1) {
      this.frames.elapsed!++;
    } else if (this.frames.max <= 0) {
      console.warn("frames.max <= 0, fallback ke 1");
      this.frames.max = 1;
    }

    if (this.frames.elapsed! % this.frames.hold === 0) {
      if (this.frames.val! < this.frames.max - 1) this.frames.val!++;
      else this.frames.val = 0;
    }
  }
}

export default Sprite;

// Kelas Monster
interface MonsterConfig extends SpriteConfig {
  isEnemy?: boolean;
  name: string;
  attacks: any[];
}

class Monster extends Sprite {
  health: number = 100;
  isEnemy: boolean;
  name: string;
  attacks: any[];

  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    isEnemy = false,
    name,
    attacks,
  }: MonsterConfig) {
    super({
      position,
      velocity: velocity || { x: 0, y: 0 },
      image,
      frames,
      sprites,
      animate,
      rotation,
    });
    this.isEnemy = isEnemy;
    this.name = name;
    this.attacks = attacks;
  }

  faint() {
    const dialogueBox = document.querySelector("#dialogueBox") as HTMLElement;
    dialogueBox.innerHTML = `${this.name} fainted!`;
    gsap.to(this.position, {
      y: this.position.y + 20,
    });
    gsap.to(this, {
      opacity: 0,
    });
    // audio.battle.stop();
    // audio.victory.play();
  }

  attack({
    attack,
    recipient,
    renderedSprites,
  }: {
    attack: any;
    recipient: Monster;
    renderedSprites: Sprite[];
  }) {
    const dialogueBox = document.querySelector("#dialogueBox") as HTMLElement;
    dialogueBox.style.display = "block";
    dialogueBox.innerHTML = `${this.name} used ${attack.name}`;

    let healthBar = "#enemyHealthBar";
    if (this.isEnemy) healthBar = "#playerHealthBar";

    let rotation = 1;
    if (this.isEnemy) rotation = -2.2;

    recipient.health -= attack.damage;

    // switch (attack.name) {
    //   case "Fireball":
    //     audio.initFireball.play();
    //     const fireballImage = new Image();
    //     fireballImage.src = "./img/fireball.png";
    //     const fireball = new Sprite({
    //       position: {
    //         x: this.position.x,
    //         y: this.position.y,
    //       },
    //       image: { src: fireballImage.src },
    //       frames: {
    //         max: 4,
    //         hold: 10,
    //       },
    //       animate: true,
    //       rotation,
    //     });
    //     renderedSprites.splice(1, 0, fireball);

    //     gsap.to(fireball.position, {
    //       x: recipient.position.x,
    //       y: recipient.position.y,
    //       onComplete: () => {
    //         audio.fireballHit.play();
    //         gsap.to(healthBar, {
    //           width: `${recipient.health}%`,
    //         });

    //         gsap.to(recipient.position, {
    //           x: recipient.position.x + 10,
    //           yoyo: true,
    //           repeat: 5,
    //           duration: 0.08,
    //         });

    //         gsap.to(recipient, {
    //           opacity: 0,
    //           repeat: 5,
    //           yoyo: true,
    //           duration: 0.08,
    //         });
    //         renderedSprites.splice(1, 1);
    //       },
    //     });

    //     break;
    //   case "Tackle":
    //     const tl = gsap.timeline();

    //     let movementDistance = 20;
    //     if (this.isEnemy) movementDistance = -20;

    //     tl.to(this.position, {
    //       x: this.position.x - movementDistance,
    //     })
    //       .to(this.position, {
    //         x: this.position.x + movementDistance * 2,
    //         duration: 0.1,
    //         onComplete: () => {
    //           audio.tackleHit.play();
    //           gsap.to(healthBar, {
    //             width: `${recipient.health}%`,
    //           });

    //           gsap.to(recipient.position, {
    //             x: recipient.position.x + 10,
    //             yoyo: true,
    //             repeat: 5,
    //             duration: 0.08,
    //           });

    //           gsap.to(recipient, {
    //             opacity: 0,
    //             repeat: 5,
    //             yoyo: true,
    //             duration: 0.08,
    //           });
    //         },
    //       })
    //       .to(this.position, {
    //         x: this.position.x,
    //       });
    //     break;
    // }
  }
}

// Kelas Boundary
interface BoundaryConfig {
  position: Position;
}

class Boundary {
  static width = 48;
  static height = 48;
  position: Position;
  width: number = Boundary.width;
  height: number = Boundary.height;

  constructor({ position }: BoundaryConfig) {
    this.position = position;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(255, 0, 0, 0)";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

// Kelas Character
interface CharacterConfig extends SpriteConfig {
  dialogue?: string[];
}

class Character extends Sprite {
  dialogue: string[];
  dialogueIndex: number = 0;

  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    scale = 1,
    dialogue = [""],
  }: CharacterConfig) {
    super({
      position,
      velocity: velocity || { x: 0, y: 0 },
      image,
      frames,
      sprites,
      animate,
      rotation,
      scale,
    });

    this.dialogue = dialogue;
  }
}

export { Sprite, Monster, Boundary, Character };
