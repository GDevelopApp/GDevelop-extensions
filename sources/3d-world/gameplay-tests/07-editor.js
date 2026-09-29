// Sculpt tools of the scene editor
await harness.goToScene('Game Scene');
await harness.stepFrames(2);
const game = harness.getRuntimeGame();
const scene = harness.getCurrentRuntimeScene();
scene.getObjects('Player')[0].getBehavior('ThirdPersonCamera').activate(false);
const terrainObject = scene.getObjects('Terrain')[0];
const terrain = terrainObject.__terrain3D;
// Looking down at the ground in the middle of the island.
const targetX = 640, targetY = 1100;
gdjs.evtTools.camera.setCameraX(scene, targetX, '', 0);
gdjs.evtTools.camera.setCameraY(scene, targetY, '', 0);
gdjs.scene3d.camera.setCameraZ(scene, terrain.getHeightAt(targetX, targetY) + 800, '', 0);
gdjs.scene3d.camera.setCameraRotationX(scene, 0, '', 0);
await harness.stepFrames(1);

// The in-game editor calls the extension with itself: this fake editor has
// the functions the tools use.
const savedProperties = [];
let isLeftButtonCaptured = false;
let toolbarItems = null;
const editor = {
  getRuntimeGame: () => game,
  getSelectedObjects: () => [terrainObject],
  captureLeftMouseButton: () => (isLeftButtonCaptured = true),
  updateObjectProperties: (objectName, properties) => savedProperties.push({ objectName, properties }),
  showToolbar: (toolbarId, items) => (toolbarItems = items),
};
// Like the editor, the capture and the toolbar only last for a frame.
const updateTools = () => {
  isLeftButtonCaptured = false;
  toolbarItems = null;
  gdjs.callbacksInGameEditorPostStep.forEach((callback) => callback(editor));
};
updateTools();
const raiseButton = toolbarItems && toolbarItems.find((item) => item.id === 'Raise');
harness.assert(!!raiseButton, 'The sculpt tools are shown when a terrain is selected.');
harness.assert(!isLeftButtonCaptured, 'The editor keeps the mouse while no brush is used.');
raiseButton.onClick();
updateTools();
harness.assert(isLeftButtonCaptured, 'The left mouse button is used by the brush.');
harness.assert(toolbarItems.find((item) => item.id === 'Raise').isActive, 'The raise button is shown as active.');
toolbarItems.find((item) => item.id === 'Size').onChange(40);
updateTools();
harness.assert(toolbarItems.find((item) => item.id === 'Size').value === 40, 'The size slider shows the brush size.');

const heightBefore = terrain.getHeightAt(targetX, targetY);
harness.setMousePositionScreen(game.getGameResolutionWidth() / 2, game.getGameResolutionHeight() / 2);
harness.setMouseButtonPressed(true);
// Brushes change the ground according to the real time elapsed.
for (let frame = 0; frame < 30 && terrain.getHeightAt(targetX, targetY) < heightBefore + 10; frame++) {
  await harness.stepFrames(1);
  updateTools();
  await new Promise((resolve) => setTimeout(resolve, 30));
}
harness.setMouseButtonPressed(false);
await harness.stepFrames(1, { onFrame: updateTools });
const heightAfter = terrain.getHeightAt(targetX, targetY);
console.log('height before=' + heightBefore.toFixed(1) + ' after=' + heightAfter.toFixed(1) + ' saved=' + savedProperties.length);
harness.assert(heightAfter > heightBefore + 5, 'Dragging with the raise brush raises the ground under the cursor.');
harness.assert(savedProperties.length === 1 && savedProperties[0].objectName === 'Terrain', 'The stroke is saved in the object properties when the mouse is released.');

// Loading the saved data gives back the same ground.
const savedData = savedProperties[0].properties.SculptData;
terrainObject._objectData.SculptData = savedData;
terrain.generate('Flat', 0);
harness.assert(Math.abs(terrain.getHeightAt(targetX, targetY) - heightAfter) > 5, 'The ground was reset.');
terrain.loadFromProperties();
harness.assert(Math.abs(terrain.getHeightAt(targetX, targetY) - heightAfter) < 0.1, 'The saved data gives back the sculpted ground.');

// Escape stops using the brush and gives the mouse back to the editor.
// (The editor calls the tools during the frame, when the key is "just pressed".)
harness.setKeyPressed('Escape', true);
updateTools();
harness.setKeyPressed('Escape', false);
await harness.stepFrames(1, { onFrame: updateTools });
harness.assert(!isLeftButtonCaptured, 'Escape gives the mouse back to the editor.');

// Undo gives back the ground before the stroke, and saves it.
toolbarItems.find((item) => item.id === 'Undo').onClick();
harness.assert(Math.abs(terrain.getHeightAt(targetX, targetY) - heightBefore) < 0.1, 'Undo gives back the ground before the stroke.');
harness.assert(savedProperties.length === 2, 'The ground after the undo is saved.');
