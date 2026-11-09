const INK = 0x30383e;
const RUBBER = 0x4b5255;
const METAL = 0xb8c8cb;
const MINT = 0x92c8b2;
const MINT_LIGHT = 0xc8e2d2;
const MINT_SHADE = 0x5a8f80;
const BADGE = 0x345f55;
const DECAL = 0xf4ead1;
const WHEEL_X = [-29, 30];
const WHEEL_RADIUS = 11;
const WAVE = ['10001 010 101 111', '10001 101 101 100', '10101 111 101 110', '10101 101 101 100', '01010 101 010 111'];

function wheelDisc(art, x, y, radius, color) {
  art.fillStyle(color);
  for (let row = -radius; row <= radius; row += 1) {
    const half = Math.floor(Math.sqrt(radius * radius - row * row));
    art.fillRect(x - half, y + row, half * 2 + 1, 1);
  }
}

export default class Motorbike {
  constructor(scene, x, groundY) {
    this.x = x;
    this.groundY = groundY;
    this.bob = 0;
    this.rotation = 0;
    this.scale = 1;
    this.dust = scene.add.graphics();
    this.rims = scene.add.graphics();
    this.wheels = scene.add.graphics();
    this.body = scene.add.graphics();
    this.puffs = [];
    this.dustClock = 0;
    for (const axle of WHEEL_X) {
      wheelDisc(this.rims, axle, -11, 11, INK);
      wheelDisc(this.rims, axle, -11, 9, RUBBER);
      wheelDisc(this.rims, axle, -11, 7, METAL);
      wheelDisc(this.rims, axle, -11, 5, INK);
    }
    this.drawBody();
    this.update(0, 0, 0);
  }

  drawBody() {
    const g = this.body;
    const r = (color, x, y, w, h) => g.fillStyle(color).fillRect(x, y, w, h);
    // Step-through frame, front shield, seat and rear fairing.
    r(INK, -38, -26, 37, 9); r(INK, -33, -19, 53, 8);
    r(INK, 13, -25, 17, 13); r(INK, 21, -34, 12, 17);
    r(INK, 23, -40, 14, 9); r(INK, 26, -22, 15, 5);
    r(MINT, -36, -24, 30, 7); r(MINT_SHADE, -29, -18, 47, 5);
    r(MINT_SHADE, 15, -23, 13, 10); r(MINT, 23, -32, 8, 15);
    r(MINT_LIGHT, -31, -24, 22, 2); r(DECAL, -28, -20, 14, 1);
    r(MINT_LIGHT, 24, -32, 5, 9);
    r(INK, -35, -30, 38, 6); r(RUBBER, -32, -29, 29, 3);
    r(0xc6756c, -38, -23, 6, 4); r(0xeaf1e8, 32, -38, 5, 5);
    r(MINT, 25, -38, 7, 5); r(INK, 17, -38, 10, 3);
    r(METAL, 30, -17, 3, 8); r(INK, 26, -17, 3, 6);
    r(INK, -10, -13, 21, 7); r(METAL, -8, -12, 15, 4);
    r(INK, -36, -9, 27, 5); r(METAL, -35, -8, 22, 2);
    r(INK, 6, -24, 23, 12);
    r(MINT, 8, -23, 20, 9);
    r(MINT_LIGHT, 29, -22, 11, 3);
    r(BADGE, 8, -22, 18, 7);
    for (const [y, row] of WAVE.entries()) {
      for (const [x, pixel] of [...row].entries()) {
        if (pixel === '1') r(DECAL, x + 9, y - 21, 1, 1);
      }
    }
  }

  update(delta, distance, speed) {
    this.rotation = (this.rotation + distance / WHEEL_RADIUS) % (Math.PI * 2);
    this.bob = speed > 0 ? Math.round(Math.sin(this.rotation * 3)) : 0;
    const x = Math.round(this.x);
    this.body.setPosition(x, this.groundY + this.bob * this.scale).setScale(this.scale);
    this.rims.setPosition(x, this.groundY).setScale(this.scale);
    this.wheels.setPosition(x, this.groundY).setScale(this.scale);
    this.drawSpokes();
    this.updateDust(delta, speed);
  }

  drawSpokes() {
    if (this.spokeRotation === this.rotation) return;
    this.spokeRotation = this.rotation;
    this.wheels.clear();
    for (const axle of WHEEL_X) {
      for (let spoke = 0; spoke < 3; spoke += 1) {
        const angle = this.rotation + spoke * Math.PI * 2 / 3;
        const dx = Math.round(Math.cos(angle) * 4);
        const dy = Math.round(Math.sin(angle) * 4);
        this.wheels.fillStyle(METAL).fillRect(axle + dx, -11 + dy, 2, 2);
      }
      this.wheels.fillStyle(0xe1e9e7).fillRect(axle - 1, -12, 3, 3);
    }
  }

  riderPosition(passenger) {
    return {
      x: Math.round(this.x) + (passenger ? -32 : -8) * this.scale,
      y: this.groundY + (-29 + this.bob) * this.scale,
    };
  }

  updateDust(delta, speed) {
    this.dustClock += delta;
    if (speed > 24 && this.dustClock >= 0.075) {
      this.dustClock = 0;
      this.puffs.push({ x: this.x - 38 * this.scale, y: this.groundY, age: 0 });
    }

    this.dust.clear();
    for (const puff of this.puffs) {
      puff.age += delta;
      if (puff.age >= 0.45) continue;
      const x = Math.round(puff.x - puff.age * 15);
      const y = puff.y - 3 - Math.round(puff.age * 19);
      const size = 2 + Math.floor(puff.age * 12);
      this.dust.fillStyle(0xffe3b6, 0.7 * (1 - puff.age / 0.45));
      this.dust.fillRect(x, y, size + 2, size).fillRect(x + 2, y - 2, size - 1, 2);
    }
    this.puffs = this.puffs.filter((puff) => puff.age < 0.45);
  }
}
