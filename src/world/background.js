import { createParallaxLayer } from './parallax.js';
import { drawTheme } from './backgroundThemes.js';

export function drawBackground(scene, worldWidth) {
  const { width: viewWidth, height } = scene.scale.gameSize;
  const layers = [];
  const layer = (factor) => {
    const entry = createParallaxLayer(scene, worldWidth, viewWidth, factor);
    layers.push(entry);
    return entry;
  };

  const sky = layer(0).graphics;
  sky.fillStyle(0x8abbd1).fillRect(0, 0, viewWidth, height);
  sky.fillStyle(0xafcddc).fillRect(0, 57, viewWidth, height - 57);
  sky.fillStyle(0xf6ced2).fillRect(0, 106, viewWidth, height - 106);
  sky.fillStyle(0xffe3ba).fillRect(0, 143, viewWidth, height - 143);
  const themeLayer = layer(0).graphics;
  const sun = layer(0).graphics;
  sun.fillStyle(0xffefbf).fillRect(352, 48, 48, 32).fillRect(360, 40, 32, 48);
  sun.fillStyle(0xffd4a7).fillRect(352, 70, 48, 5).fillRect(360, 82, 32, 6);

  const clouds = layer(0.19);
  for (let x = 16, i = 0; x < clouds.width; x += 150, i += 1) {
    const y = 42 + (i % 3) * 17;
    clouds.graphics.fillStyle(0xf2d9e3).fillRect(x, y + 12, 80, 9);
    clouds.graphics.fillStyle(0xfff2ec).fillRect(x + 8, y + 8, 64, 8)
      .fillRect(x + 24, y, 28, 12).fillRect(x + 32, y - 5, 14, 8);
  }

  const mountains = layer(0.34);
  for (let x = -42, i = 0; x < mountains.width; x += 108, i += 1) {
    const y = 94 + (i % 3) * 9;
    mountains.graphics.fillStyle(0x9c91b1).fillRect(x, y + 48, 120, height - y - 48)
      .fillRect(x + 12, y + 32, 96, 16).fillRect(x + 25, y + 20, 70, 12)
      .fillRect(x + 36, y + 10, 48, 10).fillRect(x + 48, y, 24, 10);
    mountains.graphics.fillStyle(0xe9c5cf).fillRect(x + 48, y, 24, 10)
      .fillRect(x + 44, y + 10, 32, 7);
  }

  const hills = layer(0.58);
  for (let x = -76, i = 0; x < hills.width; x += 134, i += 1) {
    const y = 150 + (i % 3) * 8;
    hills.graphics.fillStyle(0x719f93).fillRect(x, y + 21, 152, height - y - 21)
      .fillRect(x + 14, y + 10, 124, 11).fillRect(x + 33, y, 86, 10);
    hills.graphics.fillStyle(0x96b7a0).fillRect(x + 33, y, 86, 4);
  }

  const trees = layer(0.78);
  for (let x = 34, i = 0; x < trees.width; x += 119, i += 1) {
    const y = 157 + (i % 3) * 8;
    const crown = i % 3 === 1 ? 0xd582a2 : 0x51887e;
    trees.graphics.fillStyle(0x8a6574).fillRect(x + 15, y + 15, 6, 44);
    trees.graphics.fillStyle(crown).fillRect(x, y + 8, 36, 18)
      .fillRect(x + 7, y + 2, 24, 30).fillRect(x + 13, y - 3, 13, 7);
    trees.graphics.fillStyle(i % 3 === 1 ? 0xf1a9b5 : 0x80b29a)
      .fillRect(x + 8, y + 8, 11, 4).fillRect(x + 22, y + 17, 7, 3);
  }

  let activeTheme;
  return (cameraX, theme) => {
    for (const entry of layers) entry.scrollTo(cameraX);
    if (theme === activeTheme) return;
    activeTheme = theme;
    drawTheme(themeLayer, theme, viewWidth);
    sun.setAlpha(theme === 'rain' ? 0.25 : 1);
  };
}
