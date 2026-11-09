import Phaser from 'phaser';
import { presentScene } from '../runtime/gamePresentation.js';
import { addDemoControls } from '../ui/demoControls.js';
import { buildWorld, WORLD_WIDTH } from '../world/world.js';

const CAMERA_SPEED = 64;

export default class WorldScene extends Phaser.Scene {
  static KEY = 'WorldScene';

  constructor() {
    super(WorldScene.KEY);
  }

  create() {
    const { width, height } = this.scale.gameSize;
    this.camera = this.cameras.main;
    this.camera.setBounds(0, 0, WORLD_WIDTH, height);
    this.camera.setRoundPixels(true);
    this.endX = WORLD_WIDTH - width;
    this.updateWorld = buildWorld(this);
    this.game.canvas.setAttribute('aria-label', 'Thế giới pixel art Việt và Mai');
    presentScene(this, 'world');

    [this.pauseButton] = addDemoControls(this, [
      { label: 'Pause', onClick: () => this.togglePause() },
      { label: 'Restart', onClick: () => this.restartTour() },
    ]);
    this.restartTour();
    this.pauseButton.focus({ preventScroll: true });
  }

  restartTour() {
    this.elapsed = 0;
    this.paused = false;
    this.pauseButton.disabled = false;
    this.pauseButton.textContent = 'Pause';
    this.camera.setScroll(0, 0);
    this.updateWorld(0, 0);
  }

  togglePause() {
    this.paused = !this.paused;
    this.pauseButton.textContent = this.paused ? 'Resume' : 'Pause';
  }

  update(_time, delta) {
    if (this.paused) return;

    this.elapsed += delta / 1000;
    const x = Math.min(this.endX, this.elapsed * CAMERA_SPEED);
    const cameraX = Math.round(x);
    this.camera.setScroll(cameraX, 0);
    this.updateWorld(this.elapsed, cameraX);

    if (x === this.endX) {
      this.paused = true;
      this.pauseButton.disabled = true;
    }
  }
}
