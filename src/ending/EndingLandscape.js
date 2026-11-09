import { easeInOut } from '../characters/animation.js';

export const HILL_WIDTH = 1040;

export function hillGround(x) {
  const slope = (start, length) => easeInOut(Math.max(0, Math.min(1, (x - start) / length)));
  return Math.round(240 - 52 * slope(105, 330) + 29 * slope(660, 320));
}

const DAY = [0x695c8b, 0xa477a1, 0xdc9fa5, 0xf6c09e];
const NIGHT = [0x211c3c, 0x332952, 0x4f3b64, 0x845473];

function mixColor(from, to, progress) {
  const mix = (shift) => Math.round(((from >> shift) & 255) * (1 - progress) + ((to >> shift) & 255) * progress);
  return (mix(16) << 16) | (mix(8) << 8) | mix(0);
}

export default class EndingLandscape {
  constructor(scene, width, height) {
    this.width = width;
    this.height = height;
    this.sky = scene.add.graphics().setScrollFactor(0);
    const distant = scene.add.graphics().setScrollFactor(0.18, 0);
    const valley = scene.add.graphics().setScrollFactor(0.38, 0);
    const ground = scene.add.graphics();

    for (let x = -150, i = 0; x < HILL_WIDTH; x += 117, i += 1) {
      const y = 136 + (i % 3) * 11;
      distant.fillStyle(0x584a73).fillRect(x, y + 26, 132, 170)
        .fillRect(x + 15, y + 14, 102, 14).fillRect(x + 28, y, 74, 15);
      distant.fillStyle(0x746083).fillRect(x + 28, y, 74, 4);
    }
    for (let x = -106, i = 0; x < HILL_WIDTH; x += 94, i += 1) {
      const y = 174 + (i % 3) * 8;
      valley.fillStyle(0x433d5d).fillRect(x, y + 15, 107, 130)
        .fillRect(x + 12, y + 8, 87, 8).fillRect(x + 28, y, 58, 10);
    }
    for (let x = -20; x < HILL_WIDTH + 20; x += 4) {
      const y = hillGround(x + 2);
      ground.fillStyle(0x3f434f).fillRect(x, y - 16, 4, 155);
      ground.fillStyle(0x737663).fillRect(x, y - 16, 4, 4);
      ground.fillStyle(0x9c7772).fillRect(x, y - 10, 4, 22);
      ground.fillStyle(0xc3987f).fillRect(x, y - 8, 4, 3);
      ground.fillStyle(0x7d5b68).fillRect(x, y + 8, 4, 4);
      if (x % 28 === 0) ground.fillStyle(0xd0a38d).fillRect(x, y + 2, 4, 1);
      if (x % 36 === 0) {
        ground.fillStyle(0x929073).fillRect(x, y - 20, 2, 5).fillRect(x + 2, y - 18, 2, 3);
        ground.fillStyle(0xd5a6a7).fillRect(x - 1, y - 21, 3, 2);
      }
    }
  }

  drawSky(dusk, elapsed, shootingStar) {
    const frame = Math.floor(elapsed * 30);
    if (frame === this.skyFrame) return;
    this.skyFrame = frame;
    const g = this.sky;
    g.clear();
    const bands = [-90, 50, 102, 151, this.height + 90];
    for (let i = 0; i < DAY.length; i += 1) {
      g.fillStyle(mixColor(DAY[i], NIGHT[i], dusk)).fillRect(-90, bands[i], this.width + 180, bands[i + 1] - bands[i]);
    }

    if (dusk < 1) {
      const y = Math.round(84 + dusk * 68);
      g.fillStyle(0xffd497, 1 - dusk).fillRect(79, y, 42, 24).fillRect(86, y - 7, 28, 38);
      g.fillStyle(0xffedb6, (1 - dusk) * 0.7).fillRect(86, y - 5, 28, 3);
    }

    for (let i = 0; i < 53; i += 1) {
      const x = (i * 79 + 37) % (this.width + 94) - 47;
      const y = (i * 43 + 13) % 137 - 10;
      const alpha = Math.max(0, dusk - 0.25) * (0.73 + 0.23 * Math.sin(elapsed * 1.9 + i));
      g.fillStyle(i % 3 === 0 ? 0xffdfa6 : 0xe8d9eb, alpha).fillRect(x, y, i % 7 === 0 ? 2 : 1, 1);
      if (i % 7 === 0) g.fillRect(x, y - 1, 1, 3);
    }

    const moonX = this.width - 95;
    g.fillStyle(0xffe3b4, dusk * 0.9).fillRect(moonX, 22, 5, 23)
      .fillRect(moonX + 5, 26, 4, 23).fillRect(moonX + 9, 36, 5, 14)
      .fillRect(moonX + 14, 44, 6, 4);

    if (shootingStar >= 0 && shootingStar < 1) {
      const x = 75 + shootingStar * (this.width - 95);
      const y = 28 + shootingStar * 48;
      for (let i = 7; i >= 0; i -= 1) {
        g.fillStyle(0xffecc2, (1 - i / 8) * (1 - shootingStar * 0.65))
          .fillRect(Math.round(x - i * 5), Math.round(y - i), i === 0 ? 4 : 5, i === 0 ? 3 : 1);
      }
    }
  }
}
