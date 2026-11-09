import Phaser from 'phaser';
import { couple } from '../data/couple.js';
import { presentScene } from '../runtime/gamePresentation.js';
import { drawTitleCard } from '../ui/titleCard.js';
import { addDemoControls } from '../ui/demoControls.js';
import JourneyScene from './JourneyScene.js';

export default class MainScene extends Phaser.Scene {
  static KEY = 'MainScene';

  constructor() {
    super(MainScene.KEY);
  }

  create() {
    const { width, height } = this.scale.gameSize;
    const { gameTitle, firstName, secondName } = couple;
    const subtitle = `${firstName} ❤️ ${secondName}`;

    this.add.image(0, 0, 'landscape').setOrigin(0).setDisplaySize(width, height);
    drawTitleCard(this, { x: width / 2, y: 112, title: gameTitle, subtitle });

    this.game.canvas.setAttribute('role', 'img');
    this.game.canvas.setAttribute('aria-label', `${gameTitle} — ${subtitle}`);
    presentScene(this, 'welcome');

    addDemoControls(this, [
      { label: 'Cùng lên xe', onClick: () => this.scene.start(JourneyScene.KEY) },
    ]);
  }
}
