// Characters find their way on the terrain with navigation meshes
await harness.goToScene('Game Scene');
const scene = harness.getCurrentRuntimeScene();
scene.getObjects('Player')[0].getBehavior('ThirdPersonCamera').activate(false);
// Faster in the software renderer used to run tests.
harness.setGameResolutionSize(160, 90);
scene.getObjects('Grass')[0].hide(true);
const terrainObject = scene.getObjects('Terrain')[0];
const terrain = terrainObject.__terrain3D;
harness.assert(terrainObject.getSurfaceMesh() === terrain.surfaceMesh, 'The terrain gives its surface to navigation meshes.');
const waterZ = scene.getObjects('Water')[0].getZ();
const walker = scene.getObjects('Walker')[0];
walker.setZ(terrain.getHeightAt(walker.getX(), walker.getY()));
// The navigation mesh is built after the first frame.
await harness.stepFrames(3);
const pathfinding = walker.getBehavior('NavMeshCharacter');

// A destination on the island, up or down a hill.
let target = null;
let targetHeightDifference = 0;
for (let angle = 0; angle < 360; angle += 15) {
  const x = walker.getX() + 500 * Math.cos(gdjs.toRad(angle));
  const y = walker.getY() + 500 * Math.sin(gdjs.toRad(angle));
  const heightDifference = Math.abs(terrain.getHeightAt(x, y) - walker.getZ());
  if (terrain.getHeightAt(x, y) > waterZ + 40 && terrain.getSlopeAt(x, y) < 25 && heightDifference > targetHeightDifference) {
    target = { x, y };
    targetHeightDifference = heightDifference;
  }
}
harness.assert(!!target, 'A destination is found on the island.');
pathfinding.moveTo(target.x, target.y, terrain.getHeightAt(target.x, target.y));
harness.assert(pathfinding.pathFound(), 'A path is found on the terrain.');
let maxDistanceToGround = 0;
let minZ = Infinity;
let maxZ = -Infinity;
for (let frame = 0; frame < 300 && !pathfinding.destinationReached(); frame += 10) {
  await harness.stepFrames(10);
  const groundZ = terrain.getHeightAt(walker.getX(), walker.getY());
  maxDistanceToGround = Math.max(maxDistanceToGround, Math.abs(walker.getZ() - groundZ));
  minZ = Math.min(minZ, walker.getZ());
  maxZ = Math.max(maxZ, walker.getZ());
}
console.log('walked to ' + target.x.toFixed(0) + ';' + target.y.toFixed(0) + ' from z=' + minZ.toFixed(0) +
  ' to z=' + maxZ.toFixed(0) + ', max distance to the ground=' + maxDistanceToGround.toFixed(1));
harness.assert(pathfinding.destinationReached(), 'The walker reaches its destination.');
harness.assert(maxZ - minZ > 30, 'The walker went up or down hills.');
harness.assert(maxDistanceToGround < 40, 'The walker stays on the ground (' + maxDistanceToGround.toFixed(1) + ').');

// The water is an obstacle only: the sea floor can't be walked on.
let seaFloor = null;
for (let x = terrainObject.getX() + 50; x < walker.getX() && !seaFloor; x += 50) {
  if (terrain.getHeightAt(x, walker.getY()) < waterZ - 30) seaFloor = { x, y: walker.getY() };
}
harness.assert(!!seaFloor, 'The terrain has a sea floor.');
pathfinding.moveTo(seaFloor.x, seaFloor.y, terrain.getHeightAt(seaFloor.x, seaFloor.y));
harness.assert(!pathfinding.pathFound(), "The walker can't go on the sea floor.");
