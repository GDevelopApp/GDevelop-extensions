# Sources of the 3D world extensions

`Terrain3D`, `Water3D` and `Grass3D` (in `extensions/community`) are generated from these files: the JavaScript of each extension is in its `helper.js`, and `build.py` writes the extension JSON (events functions, properties, and the helper code in a JavaScript event).

- Build an extension: `python3 Terrain3D/build.py` (writes `extensions/community/Terrain3D.json`).
- Unit tests of the terrain data, brushes and file format: `node Terrain3D/test-helper.js`.
- Collisions tests with the Jolt physics engine (from the GDevelop repository): `node Terrain3D/test-physics.mjs`.
- Gameplay tests: `python3 make-terrain-project.py` makes a project from the 3D platformer starter (of the GDevelop-examples repository) with a terrain, water and grass, and the tests of `gameplay-tests`. Run them with `gdevelop terrain-demo/game.json --run-command RUN_ALL_TESTS`.

## Grounds shared between extensions

`ground-registry.js` is copied, unchanged, at the start of the helper of every extension using grounds (`build.py` checks it). A terrain adds itself to the grounds of its scene, and grass grows on any ground of the scene, without knowing its extension. Another ground (like a floating island) can be used by the grass by adding itself too: see the functions a ground must have in the file.

## Assets

`assets/WaterNormalMap.jpg` (used by the water of the test project) is a normal map made from "Seamless looping waves heightmaps" by zookeeper ([OpenGameArt](https://opengameart.org/content/seamless-looping-waves-heightmaps), CC0).
