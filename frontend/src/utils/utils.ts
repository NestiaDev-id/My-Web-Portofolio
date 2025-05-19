// Tipe untuk posisi
interface Position {
  x: number;
  y: number;
}

// Tipe untuk rectangle (persegi panjang)
interface Rectangle {
  position: Position;
  width: number;
  height: number;
}

// Tipe untuk karakter
interface Character extends Rectangle {
  interactionAsset?: Character | null;
}

// 🔹 Fungsi untuk memeriksa tabrakan antara dua rectangle
export function rectangularCollision({
  rectangle1,
  rectangle2,
}: {
  rectangle1: Rectangle;
  rectangle2: Rectangle;
}) {
  return (
    rectangle1.position.x < rectangle2.position.x + rectangle2.width &&
    rectangle1.position.x + rectangle1.width > rectangle2.position.x &&
    rectangle1.position.y < rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.height > rectangle2.position.y
  );
}

// 🔹 Fungsi untuk memeriksa tabrakan antara pemain dan karakter
export function checkForCharacterCollision({
  characters,
  player,
  characterOffset = { x: 0, y: 0 },
}: {
  characters: Character[];
  player: Character;
  characterOffset?: Position;
}): void {
  player.interactionAsset = null;

  // Monitor untuk tabrakan dengan karakter
  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];
    if (
      rectangularCollision({
        rectangle1: player,
        rectangle2: {
          ...character,
          position: {
            x: character.position.x + characterOffset.x,
            y: character.position.y + characterOffset.y,
          },
        },
      })
    ) {
      player.interactionAsset = character;
      break;
    }
  }
}

// Fungsi untuk mengubah ukuran canvas agar sesuai dengan ukuran jendela
export function resizeCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
