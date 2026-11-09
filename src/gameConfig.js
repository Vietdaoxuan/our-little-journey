import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MainScene from './scenes/MainScene.js';
import WorldScene from './scenes/WorldScene.js';
import JourneyScene from './scenes/JourneyScene.js';
import EndingScene from './scenes/EndingScene.js';

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 480,
  height: 270,
  backgroundColor: '#1c1630',
  pixelArt: true,
  audio: { noAudio: true },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MainScene, WorldScene, JourneyScene, EndingScene],
};
