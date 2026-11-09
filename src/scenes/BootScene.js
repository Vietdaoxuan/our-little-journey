import Phaser from 'phaser';
import landscapeUrl from '../assets/landscape.svg?no-inline';
import MainScene from './MainScene.js';
import JourneyScene from './JourneyScene.js';
import EndingScene from './EndingScene.js';
import WorldScene from './WorldScene.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('landscape', landscapeUrl);
  }

  create() {
    this.game.canvas.setAttribute('role', 'img');
    const demo = new URLSearchParams(window.location.search).get('demo');
    if (demo === 'world') this.scene.start(WorldScene.KEY);
    else if (window.location.hash === '#ending') this.scene.start(EndingScene.KEY);
    else this.scene.start(window.location.hash === '#journey' ? JourneyScene.KEY : MainScene.KEY);
  }
}
