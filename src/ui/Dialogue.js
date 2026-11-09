export default class Dialogue {
  constructor(scene, onFinish) {
    this.onFinish = onFinish;
    this.panel = document.createElement('section');
    this.panel.className = 'journey-dialogue';
    this.panel.setAttribute('aria-label', 'Hội thoại');
    this.panel.hidden = true;

    this.speaker = document.createElement('strong');
    this.text = document.createElement('p');
    this.next = document.createElement('button');
    this.next.type = 'button';
    this.next.textContent = 'Tiếp tục';
    this.next.addEventListener('click', () => this.advance());
    this.panel.append(this.speaker, this.text, this.next);
    scene.game.canvas.parentElement.append(this.panel);
    scene.events.once('shutdown', () => this.panel.remove());
  }

  show(lines) {
    this.lines = lines;
    this.index = 0;
    this.panel.hidden = false;
    this.showLine();
    this.next.focus({ preventScroll: true });
  }

  showLine() {
    const { speaker, text } = this.lines[this.index];
    this.speaker.textContent = speaker;
    this.text.setAttribute('aria-label', text);
    this.letters = Array.from(text);
    this.elapsed = 0;
    this.visible = 0;
    this.text.textContent = '';
  }

  update(delta) {
    if (this.visible === this.letters.length) return;
    this.elapsed += delta;
    this.reveal(Math.min(this.letters.length, Math.floor(this.elapsed * 38)));
  }

  reveal(count) {
    if (this.visible === count) return;
    this.visible = count;
    this.text.textContent = this.letters.slice(0, count).join('');
  }

  advance() {
    if (this.panel.hidden) return;
    if (this.visible < this.letters.length) {
      this.reveal(this.letters.length);
      return;
    }

    this.index += 1;
    if (this.index < this.lines.length) {
      this.showLine();
      return;
    }

    this.panel.hidden = true;
    this.onFinish();
  }

  setPaused(paused) {
    this.next.disabled = paused;
  }

  hide() {
    this.panel.hidden = true;
  }
}
