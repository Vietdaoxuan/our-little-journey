import { audio } from '../audio/audioEngine.js';

export function presentScene(scene, name) {
  audio.setMotorSpeed(0);
  audio.setScene(name);
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    scene.cameras.main.fadeIn(260, 28, 22, 48);
  }
}

export function bindPageVisibility(game, root) {
  const events = new AbortController();
  const { signal } = events;
  let backgrounded = false;
  const sync = (hidden) => {
    if (backgrounded !== hidden) {
      backgrounded = hidden;
      root.toggleAttribute('data-backgrounded', hidden);
      if (hidden) game.pause();
      else {
        game.loop.resetDelta();
        game.resume();
      }
    }
    audio.setHidden(hidden);
  };
  document.addEventListener('visibilitychange', () => sync(document.hidden), { signal });
  window.addEventListener('pagehide', () => sync(true), { signal });
  window.addEventListener('pageshow', () => sync(document.hidden), { signal });
  sync(document.hidden);
  game.events.once('destroy', () => {
    events.abort();
    audio.destroy();
  });
}
