export default class Timeline {
  constructor(scene, memories) {
    this.bar = document.createElement('section');
    this.bar.className = 'love-timeline';
    this.bar.setAttribute('aria-label', 'Love Timeline');
    this.bar.hidden = true;

    const heading = document.createElement('div');
    heading.className = 'love-timeline-heading';
    const label = document.createElement('strong');
    label.textContent = 'Love Timeline';
    this.counter = document.createElement('span');
    this.counter.setAttribute('role', 'status');
    heading.append(label, this.counter);

    const list = document.createElement('ol');
    this.steps = memories.map(({ title, quizTitle }, index) => {
      const step = document.createElement('li');
      list.append(step);
      return { step, title, quizTitle: quizTitle ?? title, number: index + 1 };
    });
    this.bar.append(heading, list);
    scene.game.canvas.parentElement.append(this.bar);
    scene.events.once('shutdown', () => this.bar.remove());
  }

  setProgress(current, completed) {
    this.bar.hidden = false;
    this.counter.textContent = `${completed}/${this.steps.length}`;
    for (const { step, title, quizTitle, number } of this.steps) {
      const done = number <= completed;
      const label = done ? `${title} · Đã hoàn thành` : quizTitle;
      step.title = label;
      step.classList.toggle('is-complete', done);
      step.textContent = done ? '✓' : String(number);
      step.setAttribute('aria-label', label);
      if (number === current + 1) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    }
  }
}
