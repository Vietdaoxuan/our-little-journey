import { characterPose } from './animation.js';

const OUTLINE = 0x3d3046;
const SKIN = 0xffcfaa;
const SKIN_LIGHT = 0xffe2bf;
const SKIN_SHADE = 0xde987e;

const HEAD = [
  '....hhhh....',
  '..hhHHHHhh..',
  '.hHHHHHHHHh.',
  'hHHhHHHHHHHh',
  'hHHHHhHHHHHh',
  'hHHHHhhssss.',
  'hHHHhssssll.',
  'hHHhssssssl.',
  'hHHsSssssesh',
  '.hHsSssssssl',
  '.hHhsssrsssh',
  '..hhssssmsh.',
  '...hSSSSSh..',
  '....hSSSh...',
];

const PALETTES = {
  viet: { hair: 0x43334a, shine: 0x645066, shirt: 0x539fa6, light: 0x85c8c2, shade: 0x387281, pants: 0x535871 },
  mai: { hair: 0x58344d, shine: 0x824e65, shirt: 0xdf7999, light: 0xffb2bc, shade: 0xa9547c, pants: 0x775570 },
};

function drawStandingLeg(rect, stride, rise, color) {
  const knee = Math.trunc(stride / 2);
  rect(OUTLINE, -3 + knee, -6, 4, 4);
  rect(color, -2 + knee, -5, 2, 3);
  rect(OUTLINE, -3 + stride, -4, 4, 4 - rise);
  rect(color, -2 + stride, -3, 2, 2 - rise);
  rect(OUTLINE, -3 + stride, -2 - rise, 6, 2);
  rect(0xf5dcc8, -1 + stride, -1 - rise, 3, 1);
}

// All sprite marks use a two-pixel grid. Mirroring happens around the body anchor.
export default class Character {
  constructor(scene, style) {
    this.art = scene.add.graphics();
    this.palette = PALETTES[style];
    this.longHair = style === 'mai';
  }

  draw(x, y, facing, state, time, passenger = false, scale = 1) {
    const art = this.art;
    art.setPosition(Math.round(x), Math.round(y)).setScale(facing * scale, scale);
    const pose = characterPose(state, time);
    const key = `${pose.stride}/${pose.lift}/${pose.seated}/${pose.blink}/${pose.mounting}/${passenger}`;
    if (key === this.poseKey) return;
    this.poseKey = key;
    art.clear();
    const { hair, shine, shirt, light, shade, pants } = this.palette;
    const rect = (color, px, py, w, h) => art.fillStyle(color).fillRect(px * 2, py * 2, w * 2, h * 2);
    const hips = pose.seated ? 0 : -8;
    const shoulders = hips - 8 - pose.lift;

    if (pose.seated) {
      rect(OUTLINE, -4, -1, 10, 5);
      rect(pants, -3, 0, 8, 3);
      rect(OUTLINE, 3, 2, 4, 7);
      rect(pants, 4, 2, 2, 5);
      rect(OUTLINE, 4, 7, 5, 3);
      rect(0xf5dcc8, 5, 8, 3, 1);
    } else {
      drawStandingLeg(rect, -pose.stride, Number(pose.stride < 0), 0x484155);
      drawStandingLeg(rect, pose.stride, Number(pose.stride > 0 || pose.mounting), pants);
      rect(OUTLINE, -4, hips - 1, 8, 5);
      rect(pants, -3, hips, 6, 3);
    }

    rect(OUTLINE, -5, shoulders + 1, 10, hips - shoulders);
    rect(OUTLINE, -4, shoulders, 7, 2);
    rect(shirt, -4, shoulders + 2, 8, hips - shoulders - 2);
    rect(light, -3, shoulders + 2, 5, 2);
    rect(shade, -3, hips - 2, 7, 2);
    rect(OUTLINE, -1, shoulders - 2, 4, 4);
    rect(SKIN, 0, shoulders - 2, 2, 4);

    const reach = pose.seated ? (passenger ? 7 : 12) : 3 - Math.sign(pose.stride) + Number(Boolean(pose.mounting));
    rect(OUTLINE, 1, shoulders + 2, 4, 4);
    rect(light, 2, shoulders + 2, 2, 3);
    if (pose.seated) {
      rect(OUTLINE, 3, shoulders + 4, reach - 1, 3);
      rect(shirt, 4, shoulders + 4, reach - 3, 2);
      rect(SKIN_LIGHT, reach, shoulders + 4, 2, 2);
    } else {
      rect(OUTLINE, reach, shoulders + 5, 3, 5);
      rect(shirt, reach, shoulders + 5, 2, 3);
      rect(SKIN, reach + 1, shoulders + 8, 2, 2);
    }

    if (this.longHair) {
      rect(hair, -7, shoulders - 9, 4, 15);
      rect(hair, -6, shoulders + 3, 4, 4);
      rect(shine, -6, shoulders - 4, 1, 8);
    }
    const colors = { h: hair, H: shine, s: SKIN, S: SKIN_SHADE, l: SKIN_LIGHT, e: pose.blink ? SKIN_SHADE : OUTLINE, r: 0xf1a08f, m: 0xad6373 };
    for (const [row, pixels] of HEAD.entries()) {
      for (const [column, pixel] of [...pixels].entries()) {
        if (pixel !== '.') rect(colors[pixel], column - 6, shoulders - 14 + row, 1, 1);
      }
    }
    if (this.longHair) {
      rect(0xe88daf, -5, shoulders - 11, 4, 2);
      rect(0xffd7c0, -4, shoulders - 12, 2, 2);
    }
  }
}
