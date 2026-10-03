# Sources of the 3D world extensions

`Terrain3D` (the 3D terrain and the terrain grass) and `Water3D` (in `extensions/community`) are generated from these files: the JavaScript of each extension is in its `helper.js` (and `grass-helper.js` for the terrain grass), and `build.py` writes the extension JSON (events functions, properties, and the helper code in a JavaScript event).

- Build an extension: `python3 Terrain3D/build.py` (writes `extensions/community/Terrain3D.json`).
- Unit tests of the terrain data, brushes and file format: `node Terrain3D/test-helper.js`.
- Collisions tests with the Jolt physics engine (from the GDevelop repository): `node Terrain3D/test-physics.mjs`.
- Gameplay tests: `python3 make-terrain-project.py` makes a project from the 3D platformer starter (of the GDevelop-examples repository) with a terrain, water and grass, and the tests of `gameplay-tests`. Run them with `gdevelop terrain-demo/game.json --run-command RUN_ALL_TESTS`.

## Grounds

A terrain adds itself to the grounds of its scene (`gdjs.__grounds3D`, defined in `Terrain3D/helper.js`), and the terrain grass grows on any ground of the scene. Another ground (like a floating island from another extension) can be used by the grass by adding itself too: see the functions a ground must have in the helper.

## World scale

Since Three.js 0.185, GDevelop scales the 3D world (`getRenderer3DWorldScale`, 100 scene units by 3D unit by default). Shaders work in scene units: positions computed with `modelMatrix` are multiplied by the world scale (a uniform, 1 in older GDevelop versions).

## Assets

All are CC0:

- `assets/WaterNormalMap.jpg` (used by the water of the test project) is a normal map made from "Seamless looping waves heightmaps" by zookeeper ([OpenGameArt](https://opengameart.org/content/seamless-looping-waves-heightmaps)).
- `assets/TerrainGrass.jpg`, `assets/TerrainDirt.jpg` and `assets/TerrainRock.jpg` are textures from [ambientCG](https://ambientcg.com). Their normal maps (`*Normal.jpg`) are made from their brightness.
