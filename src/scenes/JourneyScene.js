import Phaser from 'phaser';
import { audio } from '../audio/audioEngine.js';
import Character from '../characters/Character.js';
import { easeInOut, MOUNT_SEATED_AT, MOUNT_SECONDS } from '../characters/animation.js';
import { couple } from '../data/couple.js';
import { finalChapter, memories } from '../data/memories.js';
import MemoryInteractionManager from '../interactions/MemoryInteractionManager.js';
import CheckpointManager from '../journey/CheckpointManager.js';
import JourneyManager, { JourneyState } from '../journey/JourneyManager.js';
import { clearJourneyProgress, readJourneyProgress, saveJourneyProgress } from '../journey/journeyProgress.js';
import Motorbike from '../objects/Motorbike.js';
import { presentScene } from '../runtime/gamePresentation.js';
import Dialogue from '../ui/Dialogue.js';
import PhotoModal from '../ui/PhotoModal.js';
import Quiz from '../ui/Quiz.js';
import Timeline from '../ui/Timeline.js';
import { addDemoControls } from '../ui/demoControls.js';
import { buildWorld, ROAD_Y, WORLD_WIDTH } from '../world/world.js';

const GROUND_Y = ROAD_Y + 31;
const BIKE_START = 251;
const VIET_X = 311;
const MAI_START = -20;
const MAI_X = 184;

const GREETING = [
  { speaker: couple.firstName, text: 'Mai ơi, lên xe nào. Mình đi ngắm trời chiều nhé?' },
  { speaker: couple.secondName, text: 'Đi thôi! Hôm nay mình cứ chạy chậm một chút nha.' },
];

export default class JourneyScene extends Phaser.Scene {
  static KEY = 'JourneyScene';

  constructor() {
    super(JourneyScene.KEY);
  }

  create() {
    window.history.replaceState(window.history.state, '', '#journey');
    const progress = readJourneyProgress(memories);
    if (progress?.finale === 'complete') {
      this.enter('leaving');
      this.scene.start('EndingScene');
      return;
    }
    const { width, height } = this.scale.gameSize;
    this.camera = this.cameras.main;
    this.camera.setBounds(0, 0, WORLD_WIDTH, height).setRoundPixels(true);
    this.viewWidth = width;
    this.cameraX = 0;
    this.updateWorld = buildWorld(this);
    this.bike = new Motorbike(this, BIKE_START, GROUND_Y);
    this.viet = new Character(this, 'viet');
    this.mai = new Character(this, 'mai');
    this.dialogue = new Dialogue(this, () => {
      this.enter('mountDriver');
      this.pauseButton.focus({ preventScroll: true });
    });

    this.checkpoints = new CheckpointManager(memories, progress);
    this.journey = new JourneyManager(this.checkpoints, BIKE_START, progress);
    this.timeline = new Timeline(this, memories);
    this.quiz = new Quiz(this, {
      onAnswer: (checkpointId, optionId) => this.answerCheckpoint(checkpointId, optionId),
      onStartInteraction: () => this.startInteraction(),
      onReviewPhoto: () => this.reviewPhoto(),
      onContinue: () => this.continueJourney(),
      onFinish: () => this.finishJourney(),
    });
    this.interaction = new MemoryInteractionManager(this, (memory) => this.revealPhoto(memory));
    this.photo = new PhotoModal(this, {
      onUnlock: (id) => this.unlockPhoto(id),
      onClose: () => this.closePhoto(),
    });
    this.backgroundTheme = undefined;

    this.paused = false;
    this.elapsed = 0;
    this.enter('waiting');
    this.game.canvas.setAttribute('aria-label', 'Xuân Việt và Ngọc Mai đi xe Wave');
    presentScene(this, 'journey');
    [this.pauseButton] = addDemoControls(this, [
      { label: 'Pause', onClick: () => this.togglePause() },
      { label: 'Restart', onClick: () => {
        clearJourneyProgress();
        this.scene.restart();
      } },
      { label: 'Về tiêu đề', onClick: () => this.returnToTitle() },
    ]);
    this.pauseButton.focus({ preventScroll: true });
    if (progress) this.restoreJourney();
    else {
      this.drawWaiting(MAI_START);
      this.updateWorld(0, 0);
    }
  }

  restoreJourney() {
    this.enter('riding');
    const memory = this.checkpoints.current;
    this.bike.x = this.journey.x;
    this.bike.update(0, 0, 0);
    this.drawRider(this.viet, false);
    this.drawRider(this.mai, true);
    this.cameraX = Math.round(this.cameraTarget());
    this.camera.setScroll(this.cameraX, 0);
    this.backgroundTheme = memory.backgroundTheme;
    this.updateWorld(0, this.cameraX, this.backgroundTheme);

    const { state } = this.journey;
    const finale = state === JourneyState.FINALE;
    this.timeline.setProgress(finale ? -1 : this.checkpoints.index, this.checkpoints.completed);
    if (finale) this.quiz.showFinale(finalChapter);
    else if (state === JourneyState.STOPPED) this.quiz.showUnlocked(memory);
    else this.quiz.showCheckpoint(memory);
  }

  returnToTitle() {
    const { pathname, search } = window.location;
    window.history.replaceState(window.history.state, '', `${pathname}${search}`);
    this.scene.start('MainScene');
  }

  enter(state) {
    this.state = state;
    this.stateTime = 0;
  }

  togglePause() {
    this.paused = !this.paused;
    if (this.paused) audio.setMotorSpeed(0);
    this.pauseButton.textContent = this.paused ? 'Resume' : 'Pause';
    this.dialogue.setPaused(this.paused);
    this.quiz.setPaused(this.paused);
    this.interaction.setPaused(this.paused);
  }

  drawWaiting(maiX, moving = false) {
    this.viet.draw(VIET_X, GROUND_Y, -1, 'idle', this.elapsed);
    this.mai.draw(maiX, GROUND_Y, 1, moving ? 'walking' : 'idle', this.elapsed + 0.4);
  }

  drawRider(character, passenger) {
    const { x, y } = this.bike.riderPosition(passenger);
    character.draw(x, y, 1, 'riding', this.elapsed + (passenger ? 0.8 : 0), passenger);
  }

  mount(character, startX, passenger) {
    const progress = Math.min(this.stateTime / MOUNT_SECONDS, 1);
    const eased = easeInOut(progress);
    const seat = this.bike.riderPosition(passenger);
    const x = Phaser.Math.Linear(startX, seat.x, eased);
    const hips = Phaser.Math.Linear(GROUND_Y - 16, seat.y, eased) - Math.sin(Math.PI * progress) * 8;
    const y = hips + (this.stateTime < MOUNT_SEATED_AT ? 16 : 0);
    character.draw(x, y, 1, 'mounting', this.stateTime, passenger);
    return progress === 1;
  }

  answerCheckpoint(checkpointId, optionId) {
    if (this.paused) return null;
    const result = this.journey.answer(checkpointId, optionId);
    if (result !== null) audio.effect(result ? 'correct' : 'incorrect');
    return result;
  }

  startInteraction() {
    if (this.paused || !this.journey.startInteraction()) return;
    this.quiz.hide();
    this.interaction.open(this.checkpoints.current);
  }

  revealPhoto(memory) {
    if (!this.journey.revealPhoto()) return;
    const previous = memory.revealType === 'album' ? memories.slice(0, this.checkpoints.completed) : [];
    this.photo.open(memory, previous);
  }

  reviewPhoto() {
    if (this.paused || this.journey.state !== JourneyState.STOPPED) return;
    this.photo.open(this.checkpoints.current);
  }

  unlockPhoto(id) {
    if (!this.journey.unlockPhoto(id)) return;
    audio.effect('unlock');
    saveJourneyProgress(this.checkpoints);
    this.timeline.setProgress(this.checkpoints.index, this.checkpoints.completed);
  }

  closePhoto() {
    if (!this.journey.closePhoto()) return;
    const memory = this.checkpoints.current;
    if (this.journey.state === JourneyState.STOPPED) this.quiz.showUnlocked(memory);
    else this.interaction.open(memory);
  }

  continueJourney() {
    if (this.paused || !this.journey.continue()) return;
    if (this.journey.state === JourneyState.FINALE) {
      saveJourneyProgress(this.checkpoints, 'open');
      this.timeline.setProgress(-1, this.checkpoints.completed);
      this.quiz.showFinale(finalChapter);
      return;
    }
    this.quiz.hide();
    this.timeline.setProgress(this.checkpoints.index, this.checkpoints.completed);
    this.pauseButton.focus({ preventScroll: true });
  }

  finishJourney() {
    if (this.paused || !this.journey.complete()) return false;
    saveJourneyProgress(this.checkpoints, 'complete');
    this.scene.start('EndingScene', { completed: this.checkpoints.completed });
    return true;
  }

  cameraTarget() {
    return Phaser.Math.Clamp(this.bike.x - this.viewWidth * 0.47, 0, WORLD_WIDTH - this.viewWidth);
  }

  ride(delta) {
    const { distance, arrival } = this.journey.update(delta);
    audio.setMotorSpeed(this.journey.speed);
    this.bike.x = this.journey.x;
    if (distance > 0 || arrival || this.bike.puffs.length > 0) {
      this.bike.update(delta, distance, this.journey.speed);
    }
    if (!arrival) return;

    this.backgroundTheme = arrival.backgroundTheme;
    saveJourneyProgress(this.checkpoints);
    this.quiz.showCheckpoint(arrival);
  }

  update(_time, frameDelta) {
    if (this.paused || this.state === 'leaving') return;

    const delta = Math.min(frameDelta / 1000, 0.05);
    this.interaction.update(delta);
    this.photo.update(delta);
    this.elapsed += delta;
    this.stateTime += delta;

    switch (this.state) {
      case 'waiting':
        this.drawWaiting(MAI_START);
        if (this.stateTime >= 0.65) this.enter('approaching');
        break;
      case 'approaching': {
        const x = Math.min(MAI_X, MAI_START + this.stateTime * 64);
        this.drawWaiting(x, x < MAI_X);
        if (x === MAI_X) {
          this.enter('dialogue');
          this.dialogue.show(GREETING);
        }
        break;
      }
      case 'dialogue':
        this.drawWaiting(MAI_X);
        this.dialogue.update(delta);
        break;
      case 'mountDriver':
        this.mai.draw(MAI_X, GROUND_Y, 1, 'idle', this.elapsed);
        if (this.mount(this.viet, VIET_X, false)) this.enter('mountPassenger');
        break;
      case 'mountPassenger':
        this.drawRider(this.viet, false);
        if (this.mount(this.mai, MAI_X, true)) {
          this.enter('riding');
          this.timeline.setProgress(this.checkpoints.index, this.checkpoints.completed);
        }
        break;
      case 'riding':
        this.ride(delta);
        this.drawRider(this.viet, false);
        this.drawRider(this.mai, true);
        break;
    }

    if (this.state === 'riding' &&
        (this.journey.state === JourneyState.MOVING || this.journey.state === JourneyState.ARRIVING)) {
      const target = this.cameraTarget();
      this.cameraX += (target - this.cameraX) * (1 - Math.exp(-6 * delta));
    }
    const cameraX = Math.round(this.cameraX);
    this.camera.setScroll(cameraX, 0);
    this.updateWorld(this.elapsed, cameraX, this.backgroundTheme);
  }
}
