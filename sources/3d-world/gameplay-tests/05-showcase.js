// Showcase: island
await harness.goToScene('Game Scene');
harness.setGameResolutionSize(960, 540);
harness.getCurrentRuntimeScene().getLayer('').setEffectBooleanParameter('Effect', 'isCastingShadow', true);
await harness.stepFrames(2);
const scene = harness.getCurrentRuntimeScene();
scene.getObjects('Player')[0].getBehavior('ThirdPersonCamera').activate(false);
const terrain = scene.getObjects('Terrain')[0].__terrain3D;
const view = async (label, x, y, heightAboveGround, rotationX, angle) => {
  gdjs.evtTools.camera.setCameraX(scene, x, '', 0);
  gdjs.evtTools.camera.setCameraY(scene, y, '', 0);
  gdjs.scene3d.camera.setCameraZ(scene, Math.max(terrain.getHeightAt(x, y), -38) + heightAboveGround, '', 0);
  gdjs.scene3d.camera.setCameraRotationX(scene, rotationX, '', 0);
  gdjs.evtTools.camera.setCameraRotation(scene, angle, '', 0);
  await harness.stepFrames(2);
  await harness.takeScreenshot(label);
};
await view('island from above', 640, 750 + 2600, 2200, 45, 0);
harness.assert(true, 'Screenshot taken.');
