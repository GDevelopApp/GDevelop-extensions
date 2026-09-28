// Showcase: grass and path
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
await view('grass around the player', 640, 750 + 350, 130, 70, 0);
await view('path to the sea', 640 - 200, 750 - 300, 160, 72, -45);
harness.assert(true, 'Screenshots taken.');
