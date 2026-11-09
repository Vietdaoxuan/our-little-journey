export default class CheckpointManager {
  constructor(memories, progress) {
    this.memories = memories;
    this.index = progress?.index ?? 0;
    this.completed = progress?.completed ?? 0;
  }

  get current() {
    return this.memories[this.index];
  }

  get finished() {
    return this.completed === this.memories.length;
  }

  answer(checkpointId, optionId) {
    const checkpoint = this.current;
    if (this.completed !== this.index || checkpoint.id !== checkpointId ||
        !checkpoint.options.some(({ id }) => id === optionId)) return null;
    return optionId === checkpoint.correctAnswerId;
  }

  unlockCurrent() {
    if (this.completed !== this.index) return false;
    this.completed = this.index + 1;
    return true;
  }

  advance() {
    if (this.finished || this.completed !== this.index + 1) return false;
    this.index += 1;
    return true;
  }
}
