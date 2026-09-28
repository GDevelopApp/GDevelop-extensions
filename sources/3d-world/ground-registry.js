/**
 * Grounds (like terrains) that objects of other extensions (like grass)
 * follow, without these extensions knowing each other. Each extension using
 * it has this same code: the first one loaded defines it.
 *
 * A ground has: `getVersion()` (changing when the ground changes),
 * `containsPoint(x, y)`, `getHeightAt(x, y)` (Z position of the ground),
 * `getSlopeAt(x, y)` (in degrees) and `getLayerWeightAt(x, y, layer)` (how
 * much a painted layer, from 1 to 4, is there, from 0 to 1).
 */
if (!gdjs.__grounds3D) {
    const groundsByScene = new WeakMap();
    gdjs.__grounds3D = {
        /**
         * @param {gdjs.RuntimeScene} runtimeScene
         * @returns {Set<object>} The grounds of the scene.
         */
        getGrounds(runtimeScene) {
            let grounds = groundsByScene.get(runtimeScene);
            if (!grounds) {
                grounds = new Set();
                groundsByScene.set(runtimeScene, grounds);
            }
            return grounds;
        },
    };
}
