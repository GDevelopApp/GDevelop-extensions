// Checks the Jolt height field of TerrainBodyUpdater against the terrain heights,
// after creation and after SetHeights updates.
import fs from 'fs';
import assert from 'assert';
// Jolt from the GDevelop repository (next to this one by default).
const joltPath = process.env.JOLT_PATH || new URL('../../../../GDevelop/Extensions/Physics3DBehavior/jolt-physics.wasm.js', import.meta.url).pathname;
const { default: init } = await import(joltPath);
const Jolt = await init();
globalThis.Jolt = Jolt;

const settings = new Jolt.JoltSettings();
const objectFilter = new Jolt.ObjectLayerPairFilterMask();
const bpi = new Jolt.BroadPhaseLayerInterfaceMask(2);
bpi.ConfigureLayer(new Jolt.BroadPhaseLayer(1), 0x0f, 0);
bpi.ConfigureLayer(new Jolt.BroadPhaseLayer(1), 0xf0, 0);
settings.mObjectLayerPairFilter = objectFilter;
settings.mBroadPhaseLayerInterface = bpi;
settings.mObjectVsBroadPhaseLayerFilter = new Jolt.ObjectVsBroadPhaseLayerFilterMask(bpi);
const jolt = new Jolt.JoltInterface(settings);
const physicsSystem = jolt.GetPhysicsSystem();
const bodyInterface = physicsSystem.GetBodyInterface();

class Physics3DRuntimeBehavior {}
const gdjs = { Physics3DRuntimeBehavior, toDegrees: (r) => (r * 180) / Math.PI };
const THREE = { Raycaster: class {}, Vector2: class {} };
new Function('gdjs', 'THREE', 'Jolt', fs.readFileSync(new URL('./helper.js', import.meta.url), 'utf8'))(gdjs, THREE, Jolt);
const { TerrainData, relief } = gdjs.__terrain3DExtension;
const TerrainBodyUpdater = gdjs.__terrain3DExtension.TerrainBodyUpdater;

const worldScale = 100;
const object = { getX: () => -1408, getY: () => -1298, getZ: () => -100, getWidth: () => 4096, getHeight: () => 3000, getDepth: () => 600 };
const data = new TerrainData(128);
relief.generate(data, 'Hills', 3);
const terrain = { data, object };
const physics = {
  bodyUpdater: { destroyBody() {} }, friction: 0.5, restitution: 0, _body: null,
  getBodyLayer: () => Jolt.ObjectLayerPairFilterMask.prototype.sGetObjectLayer(1, 0xff),
  _sharedData: {
    worldInvScale: 1 / worldScale, worldScale, bodyInterface, jolt,
    getVec3: (x, y, z) => new Jolt.Vec3(x, y, z), getRVec3: (x, y, z) => new Jolt.RVec3(x, y, z),
    getQuat: (x, y, z, w) => new Jolt.Quat(x, y, z, w),
  },
};
const updater = new TerrainBodyUpdater(terrain, physics);
physics._body = updater.createAndAddBody();
physicsSystem.OptimizeBroadPhase();

const cellWidth = object.getWidth() / data.resolution, cellHeight = object.getHeight() / data.resolution;
// Physics ground Z at a scene position, by casting a ray down.
const physicsGroundZ = (x, y) => {
  const ray = new Jolt.RRayCast(new Jolt.RVec3(x / worldScale, y / worldScale, 50), new Jolt.Vec3(0, 0, -100));
  const collector = new Jolt.CastRayClosestHitCollisionCollector();
  physicsSystem.GetNarrowPhaseQuery().CastRay(ray, new Jolt.RayCastSettings(), collector, new Jolt.BroadPhaseLayerFilter(), new Jolt.ObjectLayerFilter(), new Jolt.BodyFilter(), new Jolt.ShapeFilter());
  return collector.HadHit() ? (50 - 100 * collector.mHit.mFraction) * worldScale : null;
};
const expectedZ = (x, y) => object.getZ() + data.sampleHeight((x - object.getX()) / cellWidth, (y - object.getY()) / cellHeight) * object.getDepth();
const check = (label) => {
  let maxError = 0;
  for (let k = 0; k < 200; k++) {
    const x = object.getX() + 50 + Math.random() * (object.getWidth() - 100);
    const y = object.getY() + 50 + Math.random() * (object.getHeight() - 100);
    const z = physicsGroundZ(x, y);
    assert(z !== null, label + ': ray hits the ground at ' + x + ';' + y);
    maxError = Math.max(maxError, Math.abs(z - expectedZ(x, y)));
  }
  console.log(label, 'max error', maxError.toFixed(2));
  assert(maxError < 4, label + ': physics follows the terrain (max error ' + maxError + ')');
};
check('created');
// Raise an area like the brushes do, then apply it to the shape.
const i0 = 40, j0 = 50, i1 = 70, j1 = 90;
for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) data.heights[j * data.size + i] = Math.min(1, data.heights[j * data.size + i] + 0.3);
updater.changedSamples.set(i0, j0, i1, j1);
updater.updateBodyFromObject();
check('after SetHeights');
// Rectangles on the borders and of one sample.
for (const [a, b, c, d] of [[0, 0, 5, 3], [120, 125, 128, 128], [0, 128, 128, 128], [64, 64, 64, 64], [127, 0, 128, 128]]) {
  for (let j = b; j <= d; j++) for (let i = a; i <= c; i++) data.heights[j * data.size + i] = Math.random();
  updater.changedSamples.set(a, b, c, d);
  updater.updateBodyFromObject();
}
check('after border changes');
// A dynamic sphere dropped on a raised area rests on it.
physicsSystem.SetGravity(new Jolt.Vec3(0, 0, -9.8));
const dropOn = (x, y) => {
  const groundZ = expectedZ(x, y);
  const sphere = bodyInterface.CreateBody(new Jolt.BodyCreationSettings(new Jolt.SphereShape(0.2, null), new Jolt.RVec3(x / worldScale, y / worldScale, (groundZ + 100) / worldScale), new Jolt.Quat(0, 0, 0, 1), Jolt.EMotionType_Dynamic, Jolt.ObjectLayerPairFilterMask.prototype.sGetObjectLayer(1 << 4, 0xff)));
  bodyInterface.AddBody(sphere.GetID(), Jolt.EActivation_Activate);
  for (let step = 0; step < 180; step++) jolt.Step(1 / 60, 1);
  const z = sphere.GetPosition().GetZ() * worldScale - 20;
  bodyInterface.RemoveBody(sphere.GetID());
  return { z, groundZ };
};
const x0 = object.getX() + 55 * cellWidth, y0 = object.getY() + 70 * cellHeight;
const onFlat = dropOn(object.getX() + 20 * cellWidth, object.getY() + 20 * cellHeight);
console.log('sphere on unchanged area rests at', onFlat.z.toFixed(1), 'ground', onFlat.groundZ.toFixed(1));
const onRaised = dropOn(x0, y0);
console.log('sphere on raised area rests at', onRaised.z.toFixed(1), 'ground', onRaised.groundZ.toFixed(1));
if (process.env.RECREATE) { updater.recreateShape(); const again = dropOn(x0, y0); console.log('after recreating the shape', again.z.toFixed(1)); }
assert(Math.abs(onRaised.z - onRaised.groundZ) < 5, 'sphere rests on the raised area');
for (const resolution of [256, 512, 1024]) {
  const bigData = new TerrainData(resolution); relief.generate(bigData, 'Hills', 1);
  const t = performance.now(); const u = new TerrainBodyUpdater({ data: bigData, object }, { ...physics, bodyUpdater: { destroyBody() {} } }); u.createShape();
  console.log('shape creation at', resolution, (performance.now() - t).toFixed(0), 'ms');
}
console.log('Physics tests passed.');
