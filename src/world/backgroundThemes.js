const THEMES = {
  blush: [0xa788b4, 0xe8acca, 0xf8d1cc],
  peach: [0xe4a19c, 0xf6bca7, 0xffd9a6],
  mint: [0x7dbabd, 0xa6d0be, 0xdce4bc],
  rain: [0x657da5, 0x8294b6, 0xaeb4cd],
  golden: [0xd29a9e, 0xf6c1a0, 0xffdf9d],
};

export function drawTheme(graphics, theme, width) {
  graphics.clear();
  const palette = THEMES[theme];
  if (!palette) return;

  const [upper, middle, horizon] = palette;
  graphics.fillStyle(upper, 0.82).fillRect(0, 0, width, 57);
  graphics.fillStyle(middle, 0.8).fillRect(0, 57, width, 49);
  graphics.fillStyle(horizon, 0.76).fillRect(0, 106, width, 68);
}
