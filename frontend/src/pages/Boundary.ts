export class Boundary {
  static width = 48;
  static height = 48;
  position: { x: number; y: number };

  constructor({ position }: { position: { x: number; y: number } }) {
    this.position = position;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
    ctx.fillRect(
      this.position.x,
      this.position.y,
      Boundary.width,
      Boundary.height
    );
  }
}
