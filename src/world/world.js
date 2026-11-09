import { drawBackground } from './background.js';
import { drawDecorations } from './decorations.js';

export const WORLD_WIDTH = 2160;
export const ROAD_Y = 209;

export function buildWorld(scene) {
  const scrollBackground = drawBackground(scene, WORLD_WIDTH);

  const road = scene.add.graphics();
  road.fillStyle(0x527e70).fillRect(0, ROAD_Y - 8, WORLD_WIDTH, 8);
  road.fillStyle(0xe9b891).fillRect(0, ROAD_Y, WORLD_WIDTH, 44);
  road.fillStyle(0xfbd2a2).fillRect(0, ROAD_Y, WORLD_WIDTH, 4);
  road.fillStyle(0xc98879).fillRect(0, ROAD_Y + 39, WORLD_WIDTH, 5);
  road.fillStyle(0x6a4c63).fillRect(0, ROAD_Y + 44, WORLD_WIDTH, 20);

  for (let x = 11, i = 0; x < WORLD_WIDTH; x += 27, i += 1) {
    road.fillStyle(0xdca083).fillRect(x, ROAD_Y + 13 + (i % 3) * 7, 5, 2);
    road.fillStyle(0x8f6172).fillRect(x + 6, ROAD_Y + 51 + (i % 2) * 4, 9, 2);
  }

  const drawBirds = drawDecorations(scene, WORLD_WIDTH, ROAD_Y);
  return (elapsed, cameraX, theme) => {
    scrollBackground(cameraX, theme);
    drawBirds(elapsed, cameraX);
  };
}
