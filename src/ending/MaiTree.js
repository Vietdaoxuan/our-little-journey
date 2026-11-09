const GOLD = [0xffd76f, 0xffe6a0, 0xf5b955];
const CLUSTERS = [[-58, -77], [-35, -91], [-14, -109], [10, -101], [33, -87], [55, -69], [-35, -66], [3, -76], [30, -61]];

export default class MaiTree {
  constructor(scene, x, y) {
    this.x = x;
    this.y = y;
    const trunk = scene.add.graphics({ x, y });
    trunk.fillStyle(0x483345).fillRect(-20, -4, 42, 7).fillRect(-12, -15, 26, 17)
      .fillRect(-8, -54, 18, 46).fillRect(-10, -78, 14, 29).fillRect(-13, -96, 10, 23)
      .fillRect(-17, -113, 7, 19).fillRect(-21, -116, 6, 7);
    trunk.fillRect(-25, -67, 23, 9).fillRect(-42, -76, 22, 9).fillRect(-57, -85, 21, 9)
      .fillRect(-65, -93, 12, 10).fillRect(-48, -96, 6, 21).fillRect(-37, -85, 6, 18)
      .fillRect(5, -64, 19, 9).fillRect(19, -73, 18, 10).fillRect(32, -83, 18, 11)
      .fillRect(45, -87, 14, 8).fillRect(55, -93, 10, 7).fillRect(27, -96, 7, 22)
      .fillRect(19, -104, 12, 9).fillRect(2, -92, 15, 7).fillRect(10, -102, 7, 13)
      .fillRect(15, -111, 6, 13).fillRect(-29, -90, 17, 6).fillRect(-34, -103, 7, 15)
      .fillRect(28, -61, 13, 6).fillRect(39, -67, 12, 6);
    trunk.fillStyle(0x8d615e).fillRect(-6, -54, 5, 40).fillRect(-10, -19, 6, 17)
      .fillRect(-7, -76, 4, 23).fillRect(-11, -96, 4, 19).fillRect(-15, -111, 3, 16)
      .fillRect(-24, -66, 17, 3).fillRect(-40, -75, 17, 3).fillRect(-54, -84, 16, 3)
      .fillRect(8, -63, 15, 3).fillRect(20, -72, 15, 3).fillRect(34, -82, 13, 3);

    this.flowers = scene.add.graphics({ x, y });
    this.wind = scene.add.graphics();
    this.spots = CLUSTERS.flatMap(([cx, cy], cluster) => Array.from({ length: 12 }, (_, i) => ({
      x: cx + (i * 13 + cluster * 3) % 31 - 15,
      y: cy + (i * 9 + cluster * 7) % 25 - 12,
      at: (i * 17 + cluster * 11) % 73 / 100,
      color: GOLD[(i + cluster) % GOLD.length],
    })));
  }

  draw(progress, elapsed) {
    const step = Math.floor(progress * 120);
    if (step !== this.step) {
      this.step = step;
      this.flowers.clear();
      for (const { x, y, at, color } of this.spots) {
        const age = step / 120 - at;
        if (age <= 0) continue;
        if (age < 0.14) {
          this.flowers.fillStyle(0xb0af72).fillRect(x, y, 2, 2);
        } else if (age < 0.25) {
          this.flowers.fillStyle(color).fillRect(x, y, 3, 3);
        } else {
          this.flowers.fillStyle(color).fillRect(x - 1, y, 5, 3).fillRect(x, y - 1, 3, 5);
          this.flowers.fillStyle(0xd88d4c).fillRect(x + 1, y + 1, 1, 1);
        }
      }
    }

    const windFrame = Math.floor(elapsed * 30);
    if (windFrame === this.windFrame) return;
    this.windFrame = windFrame;
    const g = this.wind;
    g.clear();
    if (progress < 0.48) return;
    const strength = (progress - 0.48) / 0.52;
    for (let i = 0; i < 25; i += 1) {
      const phase = (elapsed * 0.25 + i * 0.137) % 1;
      const x = Math.round(this.x - 71 + i % 9 * 15 + phase * 80 + Math.sin(elapsed * 2 + i) * 9);
      const y = Math.round(this.y - 103 + phase * 103 - (i % 4) * 4);
      g.fillStyle(GOLD[i % GOLD.length], strength * (1 - phase * 0.75)).fillRect(x, y, 2, 2);
    }
    for (let i = 0; i < 4; i += 1) {
      const phase = (elapsed * 0.31 + i * 0.26) % 1;
      const x = Math.round(this.x - 50 + i * 16 + Math.sin(elapsed + i) * 8);
      const y = Math.round(this.y - 49 - phase * 66);
      g.fillStyle(0xf7a3ac, strength * Math.sin(phase * Math.PI))
        .fillRect(x - 4, y - 3, 3, 3).fillRect(x + 1, y - 3, 3, 3)
        .fillRect(x - 4, y, 8, 2).fillRect(x - 2, y + 2, 4, 2).fillRect(x - 1, y + 4, 2, 1);
    }
  }
}
