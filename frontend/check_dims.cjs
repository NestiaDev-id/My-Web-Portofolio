const fs = require('fs');

function getPngDimensions(filePath) {
    const buffer = fs.readFileSync(filePath);
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
}

const files = [
    'src/assets/img/villager/Idle.png',
    'src/assets/img/oldMan/Idle.png',
    'src/assets/img/playerDown.png',
    'src/assets/img/playerUp.png',
    'src/assets/img/playerLeft.png',
    'src/assets/img/playerRight.png'
];

files.forEach(file => {
    try {
        const dims = getPngDimensions(file);
        console.log(`${file}: ${dims.width}x${dims.height}`);
    } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
    }
});
