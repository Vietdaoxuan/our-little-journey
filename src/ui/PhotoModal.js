import { formatRelationshipDuration } from '../data/relationshipDuration.js';
import { loadMemoryPhoto } from '../interactions/memoryPhoto.js';

const dateFormat = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC',
});

export default class PhotoModal {
  constructor(scene, { onUnlock, onClose }) {
    this.onUnlock = onUnlock;
    this.onClose = onClose;
    this.events = new AbortController();
    const { signal } = this.events;
    this.dialog = document.createElement('dialog');
    this.dialog.className = 'photo-modal';
    this.dialog.setAttribute('aria-label', 'Ảnh kỷ niệm');
    this.dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      this.close();
    }, { signal });

    this.frame = document.createElement('article');
    this.frame.className = 'photo-polaroid';
    this.counter = document.createElement('p');
    this.counter.className = 'photo-counter';
    this.counter.setAttribute('role', 'status');
    this.picture = document.createElement('div');
    this.picture.className = 'photo-picture';
    this.placeholder = document.createElement('span');
    this.placeholder.className = 'photo-placeholder';
    this.placeholder.textContent = 'Ảnh minh họa';
    this.title = document.createElement('h2');
    this.details = document.createElement('p');
    this.details.className = 'photo-details';
    this.message = document.createElement('p');
    this.message.className = 'photo-message';

    const actions = document.createElement('div');
    actions.className = 'photo-actions';
    this.next = document.createElement('button');
    this.next.type = 'button';
    this.next.textContent = 'Ảnh tiếp theo';
    this.next.addEventListener('click', () => {
      if (!this.dialog.open || !this.ready || this.lastSlide) return;
      this.index += 1;
      this.showSlide();
    }, { signal });
    this.closeButton = document.createElement('button');
    this.closeButton.type = 'button';
    this.closeButton.autofocus = true;
    this.closeButton.addEventListener('click', () => this.close(), { signal });
    actions.append(this.next, this.closeButton);
    this.frame.append(this.counter, this.picture, this.title, this.details, this.message, actions);
    this.dialog.append(this.frame);
    scene.game.canvas.parentElement.append(this.dialog);
    scene.events.once('shutdown', () => {
      this.stopSlide();
      this.events.abort();
      if (this.dialog.open) this.dialog.close();
      this.dialog.remove();
    });
  }

  open(memory, previous = []) {
    if (this.dialog.open) return;
    this.slides = [...previous, memory];
    this.index = 0;
    this.showSlide();
    this.dialog.showModal();
  }

  get lastSlide() {
    return this.index === this.slides.length - 1;
  }

  showSlide() {
    this.stopSlide();
    const memory = this.slides[this.index];
    this.ready = false;
    this.frame.classList.remove('is-revealed');
    this.frame.dataset.reveal = memory.revealType;
    this.title.textContent = memory.title;
    this.details.textContent = [
      memory.date && dateFormat.format(new Date(memory.date)),
      memory.location,
      memory.togetherSince && `Bên nhau ${formatRelationshipDuration(memory.togetherSince)}`,
    ].filter(Boolean).join(' · ');
    this.details.hidden = !this.details.textContent;
    this.letters = memory.revealType === 'letter' ? Array.from(memory.description) : null;
    this.message.textContent = this.letters ? '' : memory.description;
    this.typed = 0;
    this.placeholder.hidden = true;
    this.counter.hidden = this.slides.length < 2;
    this.counter.textContent = `Album · ${this.index + 1}/${this.slides.length}`;
    this.next.hidden = this.lastSlide;
    this.next.disabled = true;
    this.closeButton.textContent = this.lastSlide ? 'Đóng ảnh' : 'Đóng album';

    const image = document.createElement('img');
    image.alt = memory.title;
    this.picture.replaceChildren(image, this.placeholder);
    this.slideEvents = new AbortController();
    this.loadRemaining = 4;
    this.fallback = loadMemoryPhoto(image, memory, this.slideEvents.signal, (placeholder) => {
      this.loadRemaining = null;
      this.placeholder.hidden = !placeholder;
      this.frame.classList.add('is-revealed');
      this.revealRemaining = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.75;
    });
    this.dialog.scrollTop = 0;
  }

  update(delta) {
    if (!this.dialog.open) return;
    if (this.loadRemaining != null) {
      this.loadRemaining -= delta;
      if (this.loadRemaining <= 0) {
        this.loadRemaining = 3;
        this.fallback();
      }
    }

    if (this.revealRemaining != null) {
      this.revealRemaining -= delta;
      if (this.revealRemaining <= 0) {
        this.revealRemaining = null;
        this.ready = true;
        if (this.lastSlide) this.onUnlock(this.slides[this.index].id);
        else this.next.disabled = false;
      }
    }

    if (this.letters && this.frame.classList.contains('is-revealed') && this.typed < this.letters.length) {
      const previous = Math.floor(this.typed);
      this.typed = Math.min(this.letters.length, this.typed + delta * 32);
      if (Math.floor(this.typed) !== previous) this.message.textContent = this.letters.slice(0, this.typed).join('');
    }
  }

  stopSlide() {
    this.slideEvents?.abort();
    this.loadRemaining = null;
    this.revealRemaining = null;
  }

  close() {
    if (!this.dialog.open) return;
    this.stopSlide();
    this.dialog.close();
    this.picture.replaceChildren();
    this.slides = [];
    this.letters = null;
    this.onClose();
  }
}
