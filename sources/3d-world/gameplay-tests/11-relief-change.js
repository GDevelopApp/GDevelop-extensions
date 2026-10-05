// Painting after the relief was changed in the scene editor
await harness.goToScene('Game Scene');
// Faster in the software renderer used to run tests.
harness.setGameResolutionSize(160, 90);
await harness.stepFrames(2);
const game = harness.getRuntimeGame();
const scene = harness.getCurrentRuntimeScene();
scene.getObjects('Player')[0].getBehavior('ThirdPersonCamera').activate(false);
scene.getObjects('Grass')[0].hide(true);
const terrainObject = scene.getObjects('Terrain')[0];
const terrain = terrainObject.__terrain3D;
const targetX = 640, targetY = 1100;

// The scene editor changes the relief like this (hot-reload of the object).
const oldObjectData = scene._objects.get('Terrain');
const newObjectData = JSON.parse(JSON.stringify(oldObjectData));
newObjectData.content.Relief = 'Mountains';
const heightBefore = terrain.getHeightAt(targetX, targetY);
terrainObject.updateFromObjectData(oldObjectData, newObjectData);
harness.assert(terrainObject._getRelief() === 'Mountains', 'The relief is changed.');
harness.assert(Math.abs(terrain.getHeightAt(targetX, targetY) - heightBefore) > 1, 'The ground is changed right away.');

gdjs.evtTools.camera.setCameraX(scene, targetX, '', 0);
gdjs.evtTools.camera.setCameraY(scene, targetY, '', 0);
gdjs.scene3d.camera.setCameraZ(scene, terrain.getHeightAt(targetX, targetY) + 800, '', 0);
gdjs.scene3d.camera.setCameraRotationX(scene, 0, '', 0);
await harness.stepFrames(1);

const savedProperties = [];
let toolbarItems = null;
const editor = {
  getRuntimeGame: () => game,
  getSelectedObjects: () => [terrainObject],
  captureLeftMouseButton: () => {},
  updateObjectProperties: (objectName, properties) => savedProperties.push(properties),
  showToolbar: (toolbarId, items) => (toolbarItems = items),
};
const updateTools = () => gdjs.callbacksInGameEditorPostStep.forEach((callback) => callback(editor));
updateTools();
toolbarItems.find((item) => item.id === 'Paint2').onClick();
updateTools();
const layerWeight = () => terrain.getLayerWeightAt(targetX, targetY, 2);
const weightBefore = layerWeight();
harness.setMousePositionScreen(game.getGameResolutionWidth() / 2, game.getGameResolutionHeight() / 2);
harness.setMouseButtonPressed(true);
for (let frame = 0; frame < 20 && layerWeight() < 0.8; frame++) {
  await harness.stepFrames(1);
  updateTools();
  await new Promise((resolve) => setTimeout(resolve, 30));
}
harness.setMouseButtonPressed(false);
await harness.stepFrames(1, { onFrame: updateTools });
const weightAfter = layerWeight();
console.log('layer 2 weight before=' + weightBefore.toFixed(2) + ' after=' + weightAfter.toFixed(2) + ' saves=' + savedProperties.length);
harness.assert(weightAfter > weightBefore + 0.3, 'The layer is painted on the mountains.');
harness.assert(savedProperties.length === 1, 'The stroke is saved.');

// The saved data gives back the painted mountains.
terrainObject._objectData.SculptData = savedProperties[0].SculptData;
terrain.loadFromProperties();
harness.assert(Math.abs(layerWeight() - weightAfter) < 0.02, 'The saved data gives back the paint on the mountains.');

// A heightmap image still loading: the relief is used until the image is there.
const imageManager = game.getImageManager();
const getPIXITexture = imageManager.getPIXITexture;
imageManager.getPIXITexture = () => null;
const objectDataWithMountains = scene._objects.get('Terrain');
const objectDataWithHeightmap = JSON.parse(JSON.stringify(objectDataWithMountains));
objectDataWithHeightmap.content.HeightmapImage = 'assets/TerrainRock.jpg';
objectDataWithHeightmap.content.SculptData = '';
const mountainsHeight = terrain.getHeightAt(targetX, targetY);
try {
  terrainObject.updateFromObjectData(objectDataWithMountains, objectDataWithHeightmap);
} finally {
  imageManager.getPIXITexture = getPIXITexture;
}
harness.assert(terrain.isWaitingForHeightmap, 'The terrain waits for the heightmap image.');
await harness.stepFrames(31);
harness.assert(!terrain.isWaitingForHeightmap, 'The heightmap image is used once loaded.');
harness.assert(Math.abs(terrain.getHeightAt(targetX, targetY) - mountainsHeight) > 1, 'The ground follows the heightmap.');
