// The terrain, grass and water follow the world scale of the 3D renderer
await harness.goToScene('Game Scene');
// Faster in the software renderer used to run tests.
harness.setGameResolutionSize(160, 90);
const game = harness.getRuntimeGame();
const scene = harness.getCurrentRuntimeScene();
scene.getObjects('Player')[0].getBehavior('ThirdPersonCamera').activate(false);
const terrain = scene.getObjects('Terrain')[0].__terrain3D;
const grass = scene.getObjects('Grass')[0].__terrainGrass;
const water = scene.getObjects('Water')[0];
// Looking down at the ground in the middle of the island.
const targetX = 640, targetY = 1100;
gdjs.evtTools.camera.setCameraX(scene, targetX, '', 0);
gdjs.evtTools.camera.setCameraY(scene, targetY, '', 0);
gdjs.scene3d.camera.setCameraZ(scene, terrain.getHeightAt(targetX, targetY) + 800, '', 0);
gdjs.scene3d.camera.setCameraRotationX(scene, 0, '', 0);
harness.setMousePositionScreen(game.getGameResolutionWidth() / 2, game.getGameResolutionHeight() / 2);

const measure = async (worldScale) => {
  scene.setRenderer3DWorldScale(worldScale);
  await harness.stepFrames(2);
  // The brush is drawn where the cursor hits the ground, in scene units (with Y flipped).
  const hit = terrain.raycastFromCursor(game, new THREE.Raycaster(), new THREE.Vector2());
  terrain.renderer.setBrush(hit, 50);
  const brush = terrain.renderer.uniforms.terrainBrush.value;
  let visibleBlades = 0;
  for (const chunk of grass.chunks) if (chunk.mesh.visible) visibleBlades += chunk.mesh.geometry.instanceCount;
  return {
    hit: !!hit,
    brushX: brush.x,
    brushY: brush.y,
    visibleBlades,
    waterSurfaceZ: water.__water3D.getSurfaceZ(targetX, targetY),
  };
};
const atDefaultScale = await measure(100);
const atScale1 = await measure(1);
console.log('scale 100: ' + JSON.stringify(atDefaultScale) + ' scale 1: ' + JSON.stringify(atScale1));
for (const [label, result] of [['100', atDefaultScale], ['1', atScale1]]) {
  harness.assert(result.hit, 'The cursor hits the ground at the world scale ' + label + '.');
  harness.assert(
    Math.abs(result.brushX - targetX) < 20 && Math.abs(result.brushY + targetY) < 20,
    'The brush is under the cursor at the world scale ' + label + ' (' + result.brushX.toFixed(0) + ';' + result.brushY.toFixed(0) + ').'
  );
}
harness.assert(
  atDefaultScale.visibleBlades > 0 && atDefaultScale.visibleBlades === atScale1.visibleBlades,
  'The grass fades with the distance the same way at any world scale.'
);
harness.assert(Math.abs(atDefaultScale.waterSurfaceZ - atScale1.waterSurfaceZ) < 1, 'The waves are the same at any world scale.');
