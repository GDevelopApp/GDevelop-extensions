// Unit tests of the pure parts of the helper (data, codec, brushes, relief).
const fs = require('fs');
const assert = require('assert');
const gdjs = {};
const THREE = { Raycaster: class {}, Vector2: class {}, Color: class {} };
new Function('gdjs', 'THREE', fs.readFileSync(__dirname + '/helper.js', 'utf8'))(gdjs, THREE);
const { TerrainData, codec, relief } = gdjs.__terrain3DExtension;
const { brushes } = gdjs.__terrain3DExtension;
const makeBase = (resolution, reliefName) => { const d = new TerrainData(resolution); relief.generate(d, reliefName, 42); return d; };
const copy = (d) => { const c = new TerrainData(d.resolution); c.copyFrom(d); return c; };
const stroke = (resolution, ax, ay, bx, by, radius) => ({ cellWidth: 4096 / resolution, cellHeight: 4096 / resolution, ax, ay, bx, by, radius });

// Codec round trip on each relief, with painting.
for (const reliefName of ['Flat', 'Hills', 'Mountains', 'Island']) {
  for (const resolution of [64, 256, 1024]) {
    const base = makeBase(resolution, reliefName);
    const data = copy(base);
    const changed = new (gdjs.__terrain3DExtension.SampleRectangle)();
    // A few strokes, like in the editor.
    for (let k = 0; k < 30; k++) brushes.raise(data, stroke(resolution, 1000 + k * 20, 1500, 1000 + k * 20, 1500, 300), 0.01, changed);
    brushes.smooth(data, stroke(resolution, 2000, 2000, 2500, 2600, 250), 0.5, changed);
    brushes.flatten(data, stroke(resolution, 3000, 1000, 3000, 1000, 200), 0.3, 1, changed);
    brushes.paint(data, stroke(resolution, 500, 500, 3500, 3000, 120), 1, 1, changed);
    const t0 = Date.now();
    const text = codec.encode(data, base);
    const t1 = Date.now();
    const decoded = codec.decode(text, (r) => makeBase(r, reliefName));
    const t2 = Date.now();
    assert.strictEqual(decoded.resolution, resolution);
    let maxError = 0;
    for (let i = 0; i < data.heights.length; i++) maxError = Math.max(maxError, Math.abs(decoded.heights[i] - data.heights[i]));
    assert(maxError <= 0.5 / 65535 + 1e-7, 'height error ' + maxError);
    assert.deepStrictEqual(Array.from(decoded.splat), Array.from(data.splat));
    console.log(reliefName, resolution, 'encoded', (text.length / 1024).toFixed(1) + 'KB', 'encode', t1 - t0, 'ms decode', t2 - t1, 'ms');
  }
}
const flatBase = (r) => new TerrainData(r);
assert.strictEqual(codec.decode('', flatBase), null);
assert.strictEqual(codec.decode('garbage', flatBase), null);
assert.strictEqual(codec.decode('1;256;!!!', flatBase), null);
assert.strictEqual(codec.decode('1;256;AAAA', flatBase), null, 'truncated data is rejected');
// Untouched data takes almost no space.
assert(codec.encode(makeBase(1024, 'Mountains'), makeBase(1024, 'Mountains')).length < 100);
// Resampling keeps the shape.
const hills = makeBase(256, 'Hills');
const resampled = hills.resampled(128);
assert(Math.abs(resampled.sampleHeight(64, 64) - hills.sampleHeight(128, 128)) < 1e-6);
// Brushes: raise is maximal on the segment, none outside the radius.
const flat = new TerrainData(64);
brushes.raise(flat, stroke(64, 2048, 2048, 2048, 2048, 256), 0.5, changed2 = new (gdjs.__terrain3DExtension.SampleRectangle)());
assert(Math.abs(flat.getHeight(32, 32) - 0.5) < 1e-6);
assert.strictEqual(flat.getHeight(32, 40), 0);
assert(changed2.minI === 28 && changed2.maxI === 36, 'changed rectangle ' + JSON.stringify(changed2));
// Paint keeps the sum of weights.
brushes.paint(flat, stroke(64, 2048, 2048, 2048, 2048, 300), 2, 0.6, changed2);
for (let i = 0; i < flat.size * flat.size; i++) { const s4 = flat.splat[i*4]+flat.splat[i*4+1]+flat.splat[i*4+2]+flat.splat[i*4+3]; assert(Math.abs(s4 - 255) <= 2, 'sum ' + s4); }
assert.strictEqual(flat.getDominantLayer(32, 32), 2);
// Decoding paint made on another base (the relief changed) keeps valid weights.
{
  const island = makeBase(64, 'Island');
  const painted = copy(island);
  brushes.paint(painted, stroke(64, 2048, 2048, 2048, 2048, 5000), 0, 1, new (gdjs.__terrain3DExtension.SampleRectangle)());
  const text = codec.encode(painted, island);
  const decoded = codec.decode(text, () => { const other = new TerrainData(64); relief.generate(other, 'Island', 99); return other; });
  for (let i = 0; i < decoded.splat.length; i++) assert(decoded.splat[i] >= 0 && decoded.splat[i] <= 255);
}
// Light paint strokes still reach the painted layer.
{
  const data = new TerrainData(64);
  for (let k = 0; k < 400; k++) brushes.paint(data, stroke(64, 2048, 2048, 2048, 2048, 300), 1, 0.005, new (gdjs.__terrain3DExtension.SampleRectangle)());
  assert(data.splat[(32 * data.size + 32) * 4 + 1] === 255, 'center fully painted, got ' + data.splat[(32 * data.size + 32) * 4 + 1]);
}
// Edits: strokes described in JSON, in fractions of the terrain.
{
  const { edits } = gdjs.__terrain3DExtension;
  const data = new TerrainData(64);
  edits.apply(data, JSON.stringify([
    { tool: 'raise', x: 0.5, y: 0.5, radius: 0.2, height: 0.4 },
    { tool: 'paint', x: 0, y: 0, toX: 1, toY: 1, radius: 0.05, layer: 2 },
    { tool: 'flatten', x: 0.1, y: 0.9, radius: 0.1, z: 0.2 },
    { tool: 'smooth', x: 0.5, y: 0.5, radius: 0.3, strength: 0.5 },
  ]));
  assert(data.getHeight(32, 32) > 0.3, 'raised at the center');
  assert(Math.abs(data.getHeight(6, 58) - 0.2) < 0.01, 'flattened');
  assert.strictEqual(data.getDominantLayer(10, 10), 1, 'painted on the diagonal');
  assert.strictEqual(data.getDominantLayer(60, 2), 0, 'not painted elsewhere');
  const untouched = new TerrainData(64);
  edits.apply(untouched, 'not json');
  edits.apply(untouched, '{"tool": "raise"}');
  edits.apply(untouched, '[{"tool": "dig"}, null, 3]');
  assert(untouched.heights.every((h) => h === 0), 'invalid edits are ignored');
}
console.log('All helper tests passed.');

// Height sampling interpolates between samples.
const data = new TerrainData(64);
data.heights[0] = 1;
assert.strictEqual(data.sampleHeight(0, 0), 1);
assert(Math.abs(data.sampleHeight(0.5, 0) - 0.5) < 1e-6);
assert.strictEqual(data.sampleHeight(-10, -10), 1, 'clamped outside');
assert.strictEqual(data.sampleHeight(1, 1), 0);
