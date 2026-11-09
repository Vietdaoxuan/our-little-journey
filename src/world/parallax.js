export function createParallaxLayer(scene, worldWidth, viewWidth, factor) {
  const width = Math.ceil(viewWidth + (worldWidth - viewWidth) * factor);
  const graphics = scene.add.graphics().setScrollFactor(0);
  return {
    graphics,
    width,
    scrollTo(cameraX) {
      graphics.x = -Math.round(cameraX * factor);
    },
  };
}
