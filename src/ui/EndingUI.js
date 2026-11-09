import { couple } from '../data/couple.js';
import { addDemoControls } from './demoControls.js';

const ENDING_TITLE = 'Mùa Xuân Của Anh Là Em';
const LINES = [
  'Có lẽ mùa xuân nào cũng có hoa mai...',
  'Nhưng mùa xuân của anh chỉ thật sự đẹp khi có Ngọc Mai.',
];

export default class EndingUI {
  constructor(scene, { bloom, depart, skip }) {
    this.scene = scene;
    this.panel = document.createElement('section');
    this.panel.className = 'ending-card';
    this.panel.setAttribute('aria-label', ENDING_TITLE);
    this.panel.hidden = true;
    this.title = document.createElement('h2');
    this.title.textContent = ENDING_TITLE;
    this.lines = LINES.map(() => document.createElement('p'));
    this.signature = document.createElement('div');
    this.signature.className = 'ending-signature';
    const names = document.createElement('strong');
    names.textContent = `${couple.firstName} ❤️ ${couple.secondName}`;
    const epilogue = document.createElement('p');
    epilogue.textContent = 'Our story is still being written...';
    const continuation = document.createElement('p');
    continuation.textContent = 'To be continued... ♡';
    this.signature.append(names, epilogue, continuation);

    this.bloom = document.createElement('button');
    this.bloom.type = 'button';
    this.bloom.textContent = 'Chạm để hoa mai nở 🌼';
    this.bloom.addEventListener('click', bloom);
    this.depart = document.createElement('button');
    this.depart.type = 'button';
    this.depart.textContent = 'Tiếp tục chuyến đi của chúng mình ❤️';
    this.depart.addEventListener('click', depart);
    this.panel.append(this.title, ...this.lines, this.signature, this.bloom, this.depart);

    this.skip = document.createElement('button');
    this.skip.type = 'button';
    this.skip.className = 'ending-skip';
    this.skip.textContent = 'Bỏ qua cảnh đã xem';
    this.skip.hidden = true;
    this.skip.addEventListener('click', skip);
    const parent = scene.game.canvas.parentElement;
    parent.append(this.panel, this.skip);
    scene.events.once('shutdown', () => {
      this.panel.remove();
      this.skip.remove();
    });
  }

  showBloom() {
    this.panel.classList.add('ending-bloom');
    this.title.hidden = true;
    this.signature.hidden = true;
    this.depart.hidden = true;
    this.bloom.hidden = false;
    this.panel.hidden = false;
    this.bloom.focus({ preventScroll: true });
  }

  showMessage() {
    this.panel.classList.remove('ending-bloom');
    this.title.hidden = false;
    this.signature.hidden = true;
    this.bloom.hidden = true;
    this.depart.hidden = true;
    this.panel.hidden = false;
    this.updateMessage(0);
  }

  updateMessage(seconds) {
    const secondStart = LINES[0].length / 25 + 0.6;
    const offsets = [0, secondStart];
    this.lines.forEach((line, i) => {
      const count = Math.max(0, Math.floor((seconds - offsets[i]) * 25));
      const text = LINES[i].slice(0, count);
      if (line.textContent !== text) line.textContent = text;
    });
    return seconds >= secondStart + LINES[1].length / 25 + 0.45;
  }

  showDeparture() {
    this.signature.hidden = false;
    this.depart.hidden = false;
    this.depart.focus({ preventScroll: true });
  }

  showMenu(callbacks) {
    this.skip.hidden = true;
    this.panel.classList.remove('ending-bloom');
    this.panel.classList.add('ending-complete');
    this.title.hidden = false;
    for (const line of this.lines) line.hidden = true;
    this.signature.hidden = false;
    this.bloom.hidden = true;
    this.depart.hidden = true;
    this.panel.hidden = false;
    const [album] = addDemoControls(this.scene, [
      { label: 'Xem lại kỷ niệm', onClick: callbacks.album },
      { label: 'Chơi lại từ đầu', onClick: callbacks.restart },
      { label: 'Về trang chủ', onClick: callbacks.home },
    ]);
    album.focus({ preventScroll: true });
  }

  hide() {
    this.panel.hidden = true;
  }
}
