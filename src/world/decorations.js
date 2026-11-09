import { createParallaxLayer } from './parallax.js';

function drawSign(scene, graphics, x, roadY) {
  graphics.fillStyle(0x68495b).fillRect(x - 3, roadY - 24, 6, 24);
  graphics.fillStyle(0x7b4b61).fillRect(x - 49, roadY - 47, 98, 24)
    .fillRect(x + 49, roadY - 42, 5, 14).fillRect(x + 54, roadY - 38, 4, 6);
  graphics.fillStyle(0xffca9e).fillRect(x - 47, roadY - 45, 94, 20)
    .fillRect(x + 47, roadY - 40, 5, 10).fillRect(x + 52, roadY - 36, 3, 2);
  scene.add.text(x, roadY - 35, 'Việt ❤️ Mai', {
    fontFamily: 'Consolas, monospace', fontSize: '13px', color: '#532d49',
  }).setOrigin(0.5);
}

export function drawDecorations(scene, worldWidth, roadY) {
  const props = scene.add.graphics();
  for (let x = 18, i = 0; x < worldWidth - 22; x += 38, i += 1) {
    props.fillStyle(0x3c7166).fillRect(x, roadY - 5, 14, 5)
      .fillRect(x + 4, roadY - 9, 4, 5).fillRect(x + 11, roadY - 7, 3, 4);
    props.fillStyle(0x527e70).fillRect(x + 20, roadY - 12, 2, 11);
    props.fillStyle(i % 2 ? 0xffa7b7 : 0xffe9a5).fillRect(x + 17, roadY - 15, 8, 4)
      .fillRect(x + 19, roadY - 17, 4, 8);
    props.fillStyle(0xfff0d3).fillRect(x + 20, roadY - 14, 2, 2);
  }

  for (const x of [115, 846, 1770]) drawSign(scene, props, x, roadY);

  for (const [x, y] of [[294, 146], [617, 138], [643, 138], [1076, 151], [1462, 144], [1988, 141]]) {
    props.fillStyle(0x8a5268).fillRect(x, y, 23, 23);
    props.fillStyle(0xf6ba81).fillRect(x + 2, y + 2, 19, 18);
    props.fillStyle(0xffe4a2).fillRect(x + 3, y + 3, 17, 3);
    props.fillStyle(0x9b5b70).fillRect(x + 7, y + 7, 8, 2)
      .fillRect(x + 13, y + 9, 2, 3).fillRect(x + 10, y + 12, 4, 2)
      .fillRect(x + 10, y + 16, 2, 2);
  }

  const { width: viewWidth } = scene.scale.gameSize;
  const { graphics: birds, width, scrollTo } = createParallaxLayer(scene, worldWidth, viewWidth, 0.46);
  const flightSpan = width + 48;
  let birdFrame;
  return (elapsed, cameraX) => {
    scrollTo(cameraX);
    const frame = Math.floor(elapsed * 30);
    if (frame === birdFrame) return;
    birdFrame = frame;
    birds.clear().fillStyle(0x734e72);
    for (let i = 0; i < 9; i += 1) {
      const x = Math.round((i * 151 + elapsed * 23) % flightSpan) - 24;
      const y = 64 + (i % 4) * 13 + Math.round(Math.sin(elapsed * 2 + i) * 4);
      const wing = Math.floor(elapsed * 8 + i) % 2 ? -2 : 2;
      birds.fillRect(x, y, 5, 2).fillRect(x - 4, y + wing, 4, 2)
        .fillRect(x + 5, y + wing, 4, 2);
    }
  };
}
