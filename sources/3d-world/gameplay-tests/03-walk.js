// The player walks on the slopes of the terrain
await harness.goToScene('Game Scene');
// Faster in the software renderer used to run tests (this test is about collisions).
harness.setGameResolutionSize(160, 90);
harness.getCurrentRuntimeScene().getObjects('Grass')[0].hide(true);
harness.watch('Player');
const getPlayer = () => harness.getObjects('Player')[0];
const terrain = harness.getRuntimeObject(harness.getObjects('Terrain')[0].id).__terrain3D;
await harness.stepUntil(() => getPlayer().behaviors.PhysicsCharacter3D.state.IsOnFloor === true, { maxFrames: 40 });
const start = getPlayer();
harness.setKeyPressed('w', true);
let maxGap = 0;
await harness.stepFrames(18, {
  onFrame: () => {
    const player = getPlayer();
    if (player.behaviors.PhysicsCharacter3D.state.IsOnFloor === true) {
      maxGap = Math.max(maxGap, Math.abs(player.z - terrain.getHeightAt(player.centerX, player.centerY)));
    }
  },
});
harness.releaseAllInputs();
const end = getPlayer();
const distance = Math.hypot(end.x - start.x, end.y - start.y);
console.log('walked ' + distance.toFixed(0) + ' from z=' + start.z.toFixed(0) + ' to z=' + end.z.toFixed(0) + ', max gap to ground=' + maxGap.toFixed(1));
harness.assert(distance > 20, 'The player walked (' + distance.toFixed(0) + ').');
harness.assert(maxGap < 6, 'The player stays on the ground while walking (max gap ' + maxGap.toFixed(1) + ').');
await harness.takeScreenshot('after walking');
