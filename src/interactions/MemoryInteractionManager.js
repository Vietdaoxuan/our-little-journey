import { audio } from '../audio/audioEngine.js';
import { createPreview, memoryInteractions } from './memoryInteractions.js';

export default class MemoryInteractionManager {
  constructor(scene, onComplete) {
    this.onComplete = onComplete;
    this.panel = document.createElement('section');
    this.panel.className = 'checkpoint-card memory-interaction';
    this.panel.setAttribute('aria-label', 'Mở khóa ảnh');
    this.panel.hidden = true;
    scene.game.canvas.parentElement.append(this.panel);
    scene.events.once('shutdown', () => {
      this.hide();
      this.panel.remove();
    });
  }

  open(memory) {
    this.hide();
    this.events = new AbortController();
    this.memory = memory;
    const type = memory.revealType in memoryInteractions ? memory.revealType : 'box';
    const { hint, actions, preview } = memoryInteractions[type];
    this.panel.dataset.reveal = type;
    const title = document.createElement('h2');
    title.textContent = memory.title;
    const instruction = document.createElement('p');
    instruction.textContent = hint;
    this.panel.replaceChildren(title, instruction);

    this.preview = preview ? createPreview(type, memory, this.events.signal) : null;
    if (this.preview) this.panel.append(this.preview.stage);

    const controls = document.createElement('div');
    controls.className = 'memory-actions';
    this.used = new Set();
    this.buttons = actions.map(([icon, label], index) => {
      const button = document.createElement('button');
      button.type = 'button';
      const symbol = document.createElement('span');
      symbol.className = 'memory-symbol';
      symbol.setAttribute('aria-hidden', 'true');
      symbol.textContent = icon;
      button.append(symbol, label);
      button.addEventListener('click', () => this.activate(index), { signal: this.events.signal });
      controls.append(button);
      return button;
    });

    this.status = document.createElement('p');
    this.status.className = 'quiz-feedback';
    this.status.setAttribute('role', 'status');
    this.panel.append(controls, this.status);
    this.panel.hidden = false;
    this.setPaused(this.paused);
    this.buttons[0].focus({ preventScroll: true });
  }

  activate(index) {
    if (!this.memory || this.paused || this.used.has(index)) return;
    audio.effect('interaction');
    this.used.add(index);
    this.buttons[index].classList.add('is-used');
    this.preview?.advance(index, this.used.size);
    this.setPaused(false);

    if (this.used.size < this.buttons.length) {
      this.status.textContent = `${this.used.size}/${this.buttons.length}`;
      this.buttons.find(button => !button.disabled)?.focus({ preventScroll: true });
      return;
    }

    this.status.textContent = '♥ Ảnh đã sẵn sàng ♥';
    this.panel.classList.add('is-unlocking');
    this.remaining = 0.55;
  }

  update(delta) {
    if (this.paused || this.remaining == null) return;
    this.remaining -= delta;
    if (this.remaining > 0) return;
    const memory = this.memory;
    this.hide();
    this.onComplete(memory);
  }

  setPaused(paused) {
    this.paused = Boolean(paused);
    this.panel.classList.toggle('is-paused', this.paused);
    this.buttons?.forEach((button, index) => {
      button.disabled = this.paused || this.used.has(index);
    });
  }

  hide() {
    this.events?.abort();
    this.panel.hidden = true;
    this.panel.replaceChildren();
    this.buttons = null;
    this.preview = null;
    this.panel.classList.remove('is-unlocking');
    this.memory = null;
    this.remaining = null;
  }
}
