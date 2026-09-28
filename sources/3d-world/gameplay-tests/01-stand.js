// The player stands on the terrain
await harness.goToScene('Game Scene');
harness.watch('Player');
const getPlayer = () => harness.getObjects('Player')[0];
const terrain = harness.getRuntimeObject(harness.getObjects('Terrain')[0].id);
harness.assert(!!terrain.__terrain3D, 'The terrain is created.');
const landed = await harness.stepUntil(
  () => getPlayer().behaviors.PhysicsCharacter3D.state.IsOnFloor === true,
  { maxFrames: 40 }
);
harness.assert(landed, 'The player is on the floor.');
const player = getPlayer();
const groundZ = terrain.__terrain3D.getHeightAt(player.centerX, player.centerY);
console.log('player z=' + player.z.toFixed(1) + ' ground z=' + groundZ.toFixed(1));
harness.assert(Math.abs(player.z - groundZ) < 4, 'The player stands on the ground (z=' + player.z.toFixed(1) + ', ground=' + groundZ.toFixed(1) + ').');
harness.assert(groundZ > -100 + 10, 'The ground under the player is a hill, above the terrain bottom.');
await harness.takeScreenshot('player on the terrain');
