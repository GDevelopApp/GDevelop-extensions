// Raised ground updates the collisions
await harness.goToScene('Game Scene');
// Faster in the software renderer used to run tests (this test is about collisions).
harness.setGameResolutionSize(160, 90);
harness.getCurrentRuntimeScene().getObjects('Grass')[0].hide(true);
harness.watch('Player');
const getPlayer = () => harness.getObjects('Player')[0];
const terrain = harness.getRuntimeObject(harness.getObjects('Terrain')[0].id).__terrain3D;
await harness.stepUntil(() => getPlayer().behaviors.PhysicsCharacter3D.state.IsOnFloor === true, { maxFrames: 40 });
const start = getPlayer();
// Raise a hill next to the player, then drop the player on its top.
const hillX = start.centerX + 500;
const hillY = start.centerY;
const groundBefore = terrain.getHeightAt(hillX, hillY);
terrain.raise(hillX, hillY, hillX, hillY, 300, 150);
const hillZ = terrain.getHeightAt(hillX, hillY);
harness.assert(Math.abs(hillZ - groundBefore - 150) < 1, 'The ground is raised by 150 at the center.');
await harness.stepFrames(2);
harness.setObjectPosition(start.id, hillX - 15, hillY - 15, hillZ + 40);
await harness.stepUntil(() => getPlayer().behaviors.PhysicsCharacter3D.state.IsOnFloor === false, { maxFrames: 5 });
const landed = await harness.stepUntil(
  () => getPlayer().behaviors.PhysicsCharacter3D.state.IsOnFloor === true,
  { maxFrames: 40 }
);
const after = getPlayer();
console.log('ground before=' + groundBefore.toFixed(1) + ' hill=' + hillZ.toFixed(1) + ' player=' + after.z.toFixed(1) + ' at ' + after.centerX.toFixed(0) + ';' + after.centerY.toFixed(0));
harness.assert(landed, 'The player lands.');
harness.assert(Math.abs(after.z - terrain.getHeightAt(after.centerX, after.centerY)) < 4, 'The player lands on the raised ground (z=' + after.z.toFixed(1) + ', ground=' + hillZ.toFixed(1) + ').');
