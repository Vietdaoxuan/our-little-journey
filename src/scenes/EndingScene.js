import Phaser from 'phaser';
import { audio } from '../audio/audioEngine.js';
import Character from '../characters/Character.js';
import { easeInOut, MOUNT_SEATED_AT, MOUNT_SECONDS } from '../characters/animation.js';
import { couple } from '../data/couple.js';
import { memories } from '../data/memories.js';
import EndingLandscape, { HILL_WIDTH, hillGround } from '../ending/EndingLandscape.js';
import MaiTree from '../ending/MaiTree.js';
import { clearJourneyProgress, markEndingViewed, readJourneyProgress } from '../journey/journeyProgress.js';
import Motorbike from '../objects/Motorbike.js';
import { presentScene } from '../runtime/gamePresentation.js';
import Dialogue from '../ui/Dialogue.js';
import EndingUI from '../ui/EndingUI.js';
import PhotoModal from '../ui/PhotoModal.js';

const BIKE_START = 126;
const BIKE_STOP = 431;
const TREE_X = 574;
const HORIZON = 924;
const ARRIVAL_SECONDS = 5;
const WALK_SECONDS = 1.65;
const BLOOM_SECONDS = 4;
const DEPARTURE_SECONDS = 5.2;
const STEP_OFF = [BIKE_STOP + 48, BIKE_STOP - 53];
const BY_TREE = [TREE_X - 28, TREE_X - 55];

const FAREWELL = [
  { speaker: couple.secondName, text: 'Việt ơi, cây mai kia vẫn chưa nở kìa.' },
  { speaker: couple.firstName, text: 'Mình thử gọi mùa xuân đến nhé, Mai?' },
];

function unit(progress) {
  return Math.min(1, Math.max(0, progress));
}

export default class EndingScene extends Phaser.Scene {
  static KEY = 'EndingScene';

  constructor() {
    super(EndingScene.KEY);
  }

  create({ completed } = {}) {
    this.phase = 'leaving';
    const saved = readJourneyProgress(memories);
    if (completed !== memories.length && saved?.finale !== 'complete') {
      if (!saved) this.clearEndingRoute();
      this.scene.start(saved ? 'JourneyScene' : 'MainScene');
      return;
    }

    window.history.replaceState(window.history.state, '', '#ending');
    this.canSkip = Boolean(saved?.endingViewed);
    const { width, height } = this.scale.gameSize;
    this.camera = this.cameras.main;
    this.camera.setBounds(0, -40, HILL_WIDTH, height + 80).setRoundPixels(true);
    this.camera.setZoom(1).setScroll(0, 0);
    this.cameraX = 0;
    this.landscape = new EndingLandscape(this, width, height);
    this.tree = new MaiTree(this, TREE_X, hillGround(TREE_X) - 12);
    this.bike = new Motorbike(this, BIKE_START, hillGround(BIKE_START));
    this.characters = [new Character(this, 'viet'), new Character(this, 'mai')];
    this.fade = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.fade.fillStyle(0x1c1630).fillRect(-90, -90, width + 180, height + 180).setAlpha(0);
    this.dialogue = new Dialogue(this, () => {
      if (this.phase !== 'dialogue') return;
      this.enter('bloomReady');
      this.ui.showBloom();
    });
    this.ui = new EndingUI(this, {
      bloom: () => this.beginBloom(),
      depart: () => this.beginDeparture(),
      skip: () => { if (this.canSkip) this.finish(); },
    });
    this.ui.skip.hidden = !this.canSkip;
    this.album = new PhotoModal(this, { onUnlock: () => {}, onClose: () => {} });

    this.elapsed = 0;
    this.bloomProgress = 0;
    this.game.canvas.setAttribute('aria-label', 'Mùa Xuân Của Anh Là Em — đồi hoa mai');
    presentScene(this, 'ending');
    this.enter('arrive');
    this.drawRiders();
    this.landscape.drawSky(0, 0, -1);
    this.tree.draw(0, 0);
  }

  enter(phase) {
    this.phase = phase;
    this.phaseTime = 0;
  }

  beginBloom() {
    if (this.phase !== 'bloomReady') return;
    audio.effect('bloom');
    this.ui.hide();
    this.enter('blooming');
  }

  beginDeparture() {
    if (this.phase !== 'farewellReady') return;
    this.ui.hide();
    this.enter('returnWalk');
  }

  finish() {
    if (this.phase === 'finished' || this.phase === 'leaving') return;
    this.enter('finished');
    this.dialogue.hide();
    this.fade.setAlpha(1);
    audio.setMotorSpeed(0);
    markEndingViewed();
    this.ui.showMenu({
      album: () => {
        if (this.phase === 'finished') this.album.open(memories.at(-1), memories.slice(0, -1));
      },
      restart: () => {
        if (this.phase !== 'finished' || !window.confirm('Xóa tiến độ đã lưu và chơi lại từ đầu?')) return;
        this.enter('leaving');
        clearJourneyProgress();
        this.scene.start('JourneyScene');
      },
      home: () => {
        if (this.phase !== 'finished') return;
        this.enter('leaving');
        this.clearEndingRoute();
        this.scene.start('MainScene');
      },
    });
  }

  clearEndingRoute() {
    const { pathname, search } = window.location;
    window.history.replaceState(window.history.state, '', `${pathname}${search}`);
  }

  moveBike(x, delta, scale = 1, stopped = false) {
    const distance = x - this.bike.x;
    this.bike.x = x;
    this.bike.groundY = hillGround(x);
    this.bike.scale = scale;
    const speed = stopped ? 0 : distance / delta;
    this.bike.update(delta, distance, speed);
    audio.setMotorSpeed(speed);
    this.drawRiders();
  }

  drawRiders() {
    this.characters.forEach((character, index) => {
      const passenger = index === 1;
      const { x, y } = this.bike.riderPosition(passenger);
      character.draw(x, y, 1, 'riding', this.elapsed, passenger, this.bike.scale);
    });
  }

  drawStepOff(transitioningOut) {
    this.characters.forEach((character, index) => {
      const passenger = index === 1;
      const time = unit((this.phaseTime - index * MOUNT_SECONDS) / MOUNT_SECONDS);
      const away = transitioningOut ? time : 1 - time;
      const seat = this.bike.riderPosition(passenger);
      const x = Phaser.Math.Linear(seat.x, STEP_OFF[index], easeInOut(away));
      const poseTime = MOUNT_SECONDS * (1 - away);
      const hips = Phaser.Math.Linear(seat.y, hillGround(STEP_OFF[index]) + 5 - 16, easeInOut(away)) - Math.sin(Math.PI * away) * 7;
      const y = hips + (poseTime < MOUNT_SEATED_AT ? 16 : 0);
      const pose = away === 1 ? 'idle' : away === 0 ? 'riding' : 'mounting';
      character.draw(x, y, 1, pose, pose === 'mounting' ? poseTime : this.elapsed, passenger);
    });
  }

  drawWalk(progress, returning) {
    this.characters.forEach((character, index) => {
      const x = Phaser.Math.Linear(STEP_OFF[index], BY_TREE[index], returning ? 1 - progress : progress);
      character.draw(x, hillGround(x) + 5, returning ? -1 : 1, progress === 1 ? 'idle' : 'walking', this.elapsed);
    });
  }

  update(_time, frameDelta) {
    if (this.phase === 'leaving') return;
    const delta = Math.min(frameDelta / 1000, 0.05);
    if (!delta) return;
    this.album.update(delta);
    if (this.phase === 'finished') return;
    this.elapsed += delta;
    this.phaseTime += delta;
    let shootingStar = -1;

    switch (this.phase) {
      case 'arrive': {
        const p = unit(this.phaseTime / ARRIVAL_SECONDS);
        this.moveBike(Phaser.Math.Linear(BIKE_START, BIKE_STOP, 1 - (1 - p) ** 1.55), delta, 1, p === 1);
        if (p === 1) this.enter('dismount');
        break;
      }
      case 'dismount':
        this.drawStepOff(true);
        if (this.phaseTime >= 2 * MOUNT_SECONDS) this.enter('walk');
        break;
      case 'walk': {
        const p = unit(this.phaseTime / WALK_SECONDS);
        this.drawWalk(p, false);
        if (p === 1) {
          this.enter('dialogue');
          this.dialogue.show(FAREWELL);
        }
        break;
      }
      case 'dialogue':
        this.dialogue.update(delta);
        break;
      case 'blooming':
        this.bloomProgress = unit(this.phaseTime / BLOOM_SECONDS);
        shootingStar = (this.phaseTime - 2.15) / 1.2;
        if (this.bloomProgress === 1) {
          this.enter('message');
          this.ui.showMessage();
        }
        break;
      case 'message':
        if (this.ui.updateMessage(this.phaseTime)) {
          this.enter('farewellReady');
          this.ui.showDeparture();
        }
        break;
      case 'returnWalk': {
        const p = unit(this.phaseTime / WALK_SECONDS);
        this.drawWalk(p, true);
        if (p === 1) this.enter('mount');
        break;
      }
      case 'mount':
        this.drawStepOff(false);
        if (this.phaseTime >= 2 * MOUNT_SECONDS) this.enter('depart');
        break;
      case 'depart': {
        const p = unit(this.phaseTime / DEPARTURE_SECONDS);
        const distance = p ** 1.22;
        this.moveBike(Phaser.Math.Linear(BIKE_STOP, HORIZON, distance), delta, 1 - distance * 0.64);
        this.fade.setAlpha(easeInOut(unit((p - 0.68) / 0.32)));
        if (p === 1) this.finish();
        break;
      }
    }

    if (this.bike.puffs.length && this.phase !== 'arrive' && this.phase !== 'depart') this.bike.updateDust(delta, 0);
    const target = Math.max(0, Math.min(this.bike.x - 182, 465));
    this.cameraX += (target - this.cameraX) * (1 - Math.exp(-4.5 * delta));
    this.camera.setZoom(1 - easeInOut(this.bloomProgress) * 0.14).setScroll(Math.round(this.cameraX), 0);
    this.landscape.drawSky(easeInOut(unit(this.elapsed / ARRIVAL_SECONDS)), this.elapsed, shootingStar);
    this.tree.draw(this.bloomProgress, this.elapsed);
  }
}
