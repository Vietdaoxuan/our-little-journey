import { audio } from '../audio/audioEngine.js';

export function addSoundControls(game, parent) {
  const events = new AbortController();
  const { signal } = events;
  const controls = document.createElement('div');
  controls.className = 'sound-controls';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Âm thanh');
  const volume = document.createElement('label');
  volume.textContent = 'Âm lượng';
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = String(Math.round(audio.volume * 100));
  volume.append(slider);
  controls.append(toggle, volume);
  parent.append(controls);

  const render = () => {
    toggle.textContent = audio.enabled ? '♪ Có âm' : '♪ Tắt tiếng';
    toggle.setAttribute('aria-pressed', String(audio.enabled));
    volume.hidden = !audio.enabled;
  };
  render();
  if (!window.AudioContext && !window.webkitAudioContext) toggle.disabled = true;

  toggle.addEventListener('click', () => {
    audio.setEnabled(!audio.enabled);
    render();
  }, { signal });
  slider.addEventListener('input', () => audio.setVolume(Number(slider.value) / 100), { signal });
  game.events.once('destroy', () => {
    events.abort();
    controls.remove();
  });
}
