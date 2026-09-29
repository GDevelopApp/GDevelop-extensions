// The terrain works with older GDevelop versions
await harness.goToScene('Game Scene');
await harness.stepFrames(1);
const scene = harness.getCurrentRuntimeScene();
// Versions without surface meshes for navigation meshes.
const { getSurfaceMesh, setSurfaceMesh } = gdjs.RuntimeObject.prototype;
delete gdjs.RuntimeObject.prototype.getSurfaceMesh;
delete gdjs.RuntimeObject.prototype.setSurfaceMesh;
try {
  const terrainObject = scene.createObject('Terrain');
  terrainObject.setPosition(0, 0);
  const terrain = terrainObject.__terrain3D;
  harness.assert(!!terrain, 'The terrain is created without surface meshes.');
  harness.assert(isFinite(terrain.getHeightAt(100, 100)), 'The terrain has a ground.');
  terrainObject.deleteFromScene();
  harness.assert(!gdjs.__grounds3D.getGrounds(scene).has(terrain), 'The terrain is deleted without surface meshes.');
} finally {
  gdjs.RuntimeObject.prototype.getSurfaceMesh = getSurfaceMesh;
  gdjs.RuntimeObject.prototype.setSurfaceMesh = setSurfaceMesh;
}
await harness.stepFrames(1);

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
