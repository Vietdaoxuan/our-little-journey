import { formatRelationshipDuration } from '../data/relationshipDuration.js';

const dateFormat = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC',
});

export default class Quiz {
  constructor(scene, { onAnswer, onStartInteraction, onContinue, onFinish }) {
    this.card = document.createElement('section');
    this.card.className = 'checkpoint-card';
    this.card.setAttribute('aria-label', 'Quiz kỷ niệm');
    this.card.hidden = true;

    this.title = document.createElement('h2');
    this.title.tabIndex = -1;
    this.location = document.createElement('span');
    this.date = document.createElement('time');
    this.details = document.createElement('div');
    this.details.className = 'quiz-details';
    this.details.append(this.location, this.date);
    this.question = document.createElement('p');
    this.question.className = 'quiz-question';
    this.options = document.createElement('div');
    this.options.className = 'quiz-options';
    this.options.setAttribute('role', 'group');
    this.options.setAttribute('aria-label', 'Đáp án');
    this.feedback = document.createElement('p');
    this.feedback.className = 'quiz-feedback';
    this.feedback.setAttribute('role', 'status');
    this.hearts = document.createElement('span');
    this.hearts.className = 'quiz-hearts';
    this.hearts.textContent = '♥ ♥ ♥';
    this.hearts.setAttribute('aria-hidden', 'true');

    this.next = document.createElement('button');
    this.next.type = 'button';
    this.next.addEventListener('click', () => this.action?.());
    this.card.append(this.title, this.details, this.question, this.options, this.feedback, this.hearts, this.next);
    scene.game.canvas.parentElement.append(this.card);
    scene.events.once('shutdown', () => this.card.remove());

    this.onAnswer = onAnswer;
    this.onStartInteraction = onStartInteraction;
    this.onContinue = onContinue;
    this.onFinish = onFinish;
    this.paused = false;
  }

  showCheckpoint(memory) {
    this.details.hidden = true;
    this.open({ ...memory, title: memory.quizTitle ?? memory.title }, (id, button) => {
      const result = this.onAnswer(memory.id, id);
      if (result === null) return;
      if (result) {
        this.revealMemory(memory);
        this.showCorrect(button);
      } else this.showIncorrect(button);
    });
  }

  revealMemory(memory) {
    this.title.textContent = memory.title;
    this.details.hidden = !(memory.location || memory.date || memory.togetherSince);
    this.location.textContent = memory.togetherSince
      ? `Bên nhau ${formatRelationshipDuration(memory.togetherSince)}`
      : (memory.location ?? '');
    this.date.hidden = !memory.date;
    this.date.dateTime = memory.date ?? '';
    this.date.textContent = memory.date ? dateFormat.format(new Date(memory.date)) : '';
  }

  showUnlocked(memory) {
    this.open({ ...memory, question: 'Ảnh kỷ niệm đã được mở khóa.', options: [] });
    this.revealMemory(memory);
    this.options.hidden = true;
    this.showAction('Tiếp tục hành trình ❤️', this.onContinue);
  }

  showFinale(chapter, completed = false) {
    this.details.hidden = true;
    this.open(chapter, () => {
      if (this.onFinish()) this.showFinaleMessage(chapter);
    });
    if (completed) this.showFinaleMessage(chapter);
  }

  showFinaleMessage(chapter) {
    this.locked = true;
    this.question.hidden = true;
    this.options.hidden = true;
    this.feedback.textContent = chapter.completionMessage;
    this.hearts.hidden = false;
    this.title.focus({ preventScroll: true });
  }

  open({ title, question, options }, onSelect) {
    this.locked = false;
    this.title.textContent = title;
    this.question.textContent = question;
    this.question.hidden = false;
    this.feedback.textContent = '';
    this.hearts.hidden = true;
    this.next.hidden = true;
    this.action = null;
    this.options.hidden = false;
    this.options.replaceChildren();
    for (const { id, label } of options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.addEventListener('click', () => onSelect(id, button));
      this.options.append(button);
    }
    this.setPaused(this.paused);
    this.card.hidden = false;
    this.card.scrollTop = 0;
    this.title.focus({ preventScroll: true });
  }

  showIncorrect(button) {
    this.options.querySelector('.is-incorrect')?.classList.remove('is-incorrect');
    button.classList.add('is-incorrect');
    this.feedback.textContent = 'Chưa đúng rồi, Mai thử lại nha! 🌷';
  }

  showCorrect(button) {
    this.locked = true;
    this.options.querySelector('.is-incorrect')?.classList.remove('is-incorrect');
    button.classList.add('is-correct');
    this.feedback.textContent = 'Đúng rồi! Mở ảnh kỷ niệm nào. ❤️';
    this.hearts.hidden = false;
    this.setPaused(this.paused);
    this.showAction('Mở kỷ niệm ❤️', this.onStartInteraction);
  }

  showAction(label, action) {
    this.action = action;
    this.next.textContent = label;
    this.next.hidden = false;
    this.next.focus();
  }

  hide() {
    this.card.hidden = true;
  }

  setPaused(paused) {
    this.paused = paused;
    this.next.disabled = paused;
    for (const button of this.options.children) button.disabled = paused || this.locked;
  }
}
