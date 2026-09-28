// Terrain performance
await harness.goToScene('Game Scene');
const terrainObject = harness.getRuntimeObject(harness.getObjects('Terrain')[0].id);
const terrain = terrainObject.__terrain3D;
await harness.stepFrames(3);
// Brush strokes, like a game digging the ground every frame.
let brushMs = 0;
harness.startProfiling();
await harness.stepFrames(20, {
  onFrame: ({ frame }) => {
    const t = performance.now();
    terrain.raise(800 + frame * 10, 800, 800 + frame * 10, 800, 150, -5);
    brushMs += performance.now() - t;
  },
});
const profile = harness.stopProfiling();
console.log('brush avg ms=' + (brushMs / 20).toFixed(3));
console.log('avg step ms=' + profile.avgStepTimeMs.toFixed(2) + ' max=' + profile.maxStepTimeMs.toFixed(2));
console.log('sections=' + JSON.stringify(profile.sections.slice(0, 12)));
console.log('renderer=' + JSON.stringify(profile.renderer));
const t0 = performance.now();
for (let k = 0; k < 10; k++) terrain.update();
console.log('terrain update (LOD + no change) avg ms=' + ((performance.now() - t0) / 10).toFixed(3));
const t1 = performance.now();
const encoded = terrain.save();
console.log('encode ms=' + (performance.now() - t1).toFixed(1) + ' size=' + encoded.length);
harness.assert(true, 'Measured.');
