// Navigation meshes follow the changes of the terrain
await harness.goToScene('Game Scene');
const scene = harness.getCurrentRuntimeScene();
// Faster in the software renderer used to run tests.
harness.setGameResolutionSize(160, 90);
scene.getObjects('Grass')[0].hide(true);
const terrain = scene.getObjects('Terrain')[0].__terrain3D;
const walker = scene.getObjects('Walker')[0];
// The navigation mesh is built after the first frame.
await harness.stepFrames(3);
harness.assert(!!gdjs.NavMeshObstaclesManager.getManager(scene).navMesh, 'The navigation mesh is built.');

// Sculpting the terrain updates the navigation mesh, painting it doesn't.
const manager = gdjs.NavMeshObstaclesManager.getManager(scene);
const navMeshBeforePaint = manager.navMesh;
terrain.paint(walker.getX(), walker.getY(), walker.getX(), walker.getY(), 200, 2, 1);
// The navigation mesh is rebuilt at most every second (of game time).
await harness.stepFrames(12, { dtMs: 100 });
harness.assert(manager.navMesh === navMeshBeforePaint, "Painting doesn't rebuild the navigation mesh.");
terrain.raise(walker.getX(), walker.getY(), walker.getX(), walker.getY(), 200, 100);
// The navigation mesh is rebuilt at most every second (of game time).
await harness.stepFrames(12, { dtMs: 100 });
harness.assert(manager.navMesh !== navMeshBeforePaint, 'Sculpting rebuilds the navigation mesh.');
