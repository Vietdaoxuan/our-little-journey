export const JourneyState = Object.freeze({
  MOVING: 'MOVING',
  ARRIVING: 'ARRIVING',
  QUIZ: 'QUIZ',
  CORRECT: 'CORRECT',
  INTERACTION: 'INTERACTION',
  PHOTO_REVEAL: 'PHOTO_REVEAL',
  STOPPED: 'STOPPED',
  FINALE: 'FINALE',
  COMPLETED: 'COMPLETED',
});

const MAX_SPEED = 112;
const ACCELERATION = 58;
const BRAKE = 96;

export default class JourneyManager {
  constructor(checkpoints, startX, progress) {
    this.checkpoints = checkpoints;
    this.x = startX;
    this.speed = 0;
    this.state = JourneyState.MOVING;
    if (progress) {
      this.x = checkpoints.current.worldPosition;
      if (progress.finale === 'complete') this.state = JourneyState.COMPLETED;
      else if (progress.finale === 'open') this.state = JourneyState.FINALE;
      else this.state = checkpoints.completed > checkpoints.index ? JourneyState.STOPPED : JourneyState.QUIZ;
    }
  }

  update(delta) {
    if (this.state !== JourneyState.MOVING && this.state !== JourneyState.ARRIVING) {
      return { distance: 0, arrival: null };
    }

    const checkpoint = this.checkpoints.current;
    const remaining = checkpoint.worldPosition - this.x;
    const brakingSpeed = Math.sqrt(2 * BRAKE * remaining);
    if (brakingSpeed <= MAX_SPEED) this.state = JourneyState.ARRIVING;

    const targetSpeed = Math.min(MAX_SPEED, brakingSpeed);
    const speedChange = targetSpeed - this.speed;
    this.speed += Math.max(-BRAKE * delta, Math.min(speedChange, ACCELERATION * delta));
    const distance = Math.min(remaining, this.speed * delta);
    this.x += distance;

    if (distance < remaining) return { distance, arrival: null };

    this.x = checkpoint.worldPosition;
    this.speed = 0;
    this.state = JourneyState.QUIZ;
    return { distance, arrival: checkpoint };
  }

  answer(checkpointId, optionId) {
    if (this.state !== JourneyState.QUIZ) return null;
    const correct = this.checkpoints.answer(checkpointId, optionId);
    if (correct) this.state = JourneyState.CORRECT;
    return correct;
  }

  startInteraction() {
    if (this.state !== JourneyState.CORRECT) return false;
    this.state = JourneyState.INTERACTION;
    return true;
  }

  revealPhoto() {
    if (this.state !== JourneyState.INTERACTION) return false;
    this.state = JourneyState.PHOTO_REVEAL;
    return true;
  }

  unlockPhoto(memoryId) {
    return this.state === JourneyState.PHOTO_REVEAL &&
      this.checkpoints.current.id === memoryId && this.checkpoints.unlockCurrent();
  }

  closePhoto() {
    if (this.state !== JourneyState.PHOTO_REVEAL) return false;
    this.state = this.checkpoints.completed > this.checkpoints.index ? JourneyState.STOPPED : JourneyState.INTERACTION;
    return true;
  }

  continue() {
    if (this.state !== JourneyState.STOPPED) return false;
    if (this.checkpoints.finished) this.state = JourneyState.FINALE;
    else if (this.checkpoints.advance()) this.state = JourneyState.MOVING;
    else return false;
    return true;
  }

  complete() {
    if (this.state !== JourneyState.FINALE) return false;
    this.state = JourneyState.COMPLETED;
    return true;
  }
}
