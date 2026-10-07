// The terrain works with older GDevelop versions
await harness.goToScene('Game Scene');
await harness.stepFrames(1);
const scene = harness.getCurrentRuntimeScene();
// Versions without surfaces for the physics engine and navigation meshes.
const { getSurface, setSurface } = gdjs.RuntimeObject.prototype;
delete gdjs.RuntimeObject.prototype.getSurface;
delete gdjs.RuntimeObject.prototype.setSurface;
try {
  const terrainObject = scene.createObject('Terrain');
  terrainObject.setPosition(0, 0);
  const terrain = terrainObject.__terrain3D;
  harness.assert(!!terrain, 'The terrain is created without surfaces.');
  harness.assert(isFinite(terrain.getHeightAt(100, 100)), 'The terrain has a ground.');
  harness.assert(terrain.bodyUpdaters.length === 1, 'The terrain changes the shape of its Physics3D behavior.');
  terrainObject.deleteFromScene();
  harness.assert(
    !gdjs.__terrain3DExtension.getGrounds(scene).has(terrain),
    'The terrain is deleted without surfaces.'
  );
} finally {
  gdjs.RuntimeObject.prototype.getSurface = getSurface;
  gdjs.RuntimeObject.prototype.setSurface = setSurface;
}
await harness.stepFrames(1);

// Versions without a world scale for the 3D renderer: 1 is used.
// Only the code of the objects is run: the engine itself uses the world scale.
const { getRenderer3DWorldScale } = gdjs.RuntimeScene.prototype;
delete gdjs.RuntimeScene.prototype.getRenderer3DWorldScale;
try {
  for (const objectName of ['Terrain', 'Grass', 'Water']) {
    scene.getObjects(objectName)[0].doStepPostEvents(scene);
  }
  harness.assert(
    scene.getObjects('Terrain')[0].__terrain3D.renderer.uniforms.terrainWorldScale.value === 1 &&
      scene.getObjects('Grass')[0].__terrainGrass.uniforms.grassWorldScale.value === 1 &&
      scene.getObjects('Water')[0].__water3D.uniforms.waterWorldScale.value === 1,
    'Without a world scale, 1 is used.'
  );
} finally {
  gdjs.RuntimeScene.prototype.getRenderer3DWorldScale = getRenderer3DWorldScale;
}

// Versions without toolbars or tools in the scene editor.
const terrainInEditor = scene.getObjects('Terrain')[0];
let isLeftButtonCaptured = false;
const olderEditors = [
  {},
  {
    getRuntimeGame: () => harness.getRuntimeGame(),
    getSelectedObjects: () => [terrainInEditor],
    captureLeftMouseButton: () => (isLeftButtonCaptured = true),
    updateObjectProperties: () => {},
  },
];
for (const editor of olderEditors) {
  gdjs.callbacksInGameEditorPostStep.forEach((callback) => callback(editor));
}
harness.assert(!isLeftButtonCaptured, 'The tools are not used without toolbars.');
