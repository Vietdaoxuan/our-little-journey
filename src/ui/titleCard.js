export function drawTitleCard(scene, { x, y, title, subtitle }) {
  const card = scene.add.graphics({ x, y });
  card.fillStyle(0x291a37, 0.55);
  card.fillRect(-178, -32, 364, 82);
  card.fillStyle(0xffce92);
  card.fillRect(-182, -40, 364, 80);
  card.fillRect(-176, -46, 352, 92);
  card.fillStyle(0x382444);
  card.fillRect(-180, -38, 360, 76);
  card.fillRect(-174, -44, 348, 88);
  card.fillStyle(0xa96c83);
  card.fillRect(-152, 0, 304, 1);

  const fontFamily = 'Consolas, "Courier New", monospace';
  scene.add.text(x, y - 21, title, {
    fontFamily,
    fontSize: '28px',
    fontStyle: 'bold',
    color: '#fff1bf',
    shadow: { offsetX: 2, offsetY: 3, color: '#21182f', fill: true },
  }).setOrigin(0.5);

  scene.add.text(x, y + 20, subtitle, {
    fontFamily,
    fontSize: '19px',
    color: '#ffd3dd',
    padding: { top: 2, bottom: 2 },
  }).setOrigin(0.5);
}
