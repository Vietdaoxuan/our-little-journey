export function addDemoControls(scene, buttons) {
  const controls = document.createElement('div');
  controls.className = 'demo-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Điều khiển demo');

  const elements = buttons.map(({ label, onClick }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', onClick);
    controls.append(button);
    return button;
  });

  scene.game.canvas.parentElement.append(controls);
  scene.events.once('shutdown', () => controls.remove());
  return elements;
}
