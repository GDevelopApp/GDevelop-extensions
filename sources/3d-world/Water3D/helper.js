if (gdjs.__water3DExtension) {
    return;
}

// Size of the object inner area: instances are scaled from it.
const AREA_SIZE = 1000;
// Waves are drawn with vertices up to this distance, in scene units.
const WAVE_VERTEX_SPACING = 25;
const MAX_SEGMENTS = 256;

// The waves are a sum of sines. The same formula is used by the shader and to
// compute the surface height for events.
const WAVES = [
    // [direction x, direction y, relative length, relative speed, relative height]
    [1, 0.3, 1, 1, 0.5],
    [-0.4, 1, 0.61, 1.27, 0.3],
    [0.7, -0.7, 0.37, 1.61, 0.2],
];
const waveDirections = WAVES.map(([x, y]) => {
    const length = Math.hypot(x, y);
    return [x / length, y / length];
});

/**
 * @param {number} x Scene X position.
 * @param {number} y Scene Y position.
 * @param {number} time In seconds.
 * @param {{waveHeight: number, waveLength: number, waveSpeed: number}} settings
 * @returns {number} The height of the waves above the water level.
 */
/**
 * Waves shorter than a few vertices can't be drawn: they are faded out.
 * @param {number} length
 * @param {number} vertexSpacing
 */
const getWaveVisibility = (length, vertexSpacing) => {
    const t = Math.min(Math.max((length / vertexSpacing - 3) / 3, 0), 1);
    return t * t * (3 - 2 * t);
};

const getWaveHeight = (x, y, time, settings) => {
    let height = 0;
    for (let index = 0; index < WAVES.length; index++) {
        const [, , relativeLength, relativeSpeed, relativeHeight] = WAVES[index];
        const [directionX, directionY] = waveDirections[index];
        const length = settings.waveLength * relativeLength;
        const frequency = (2 * Math.PI) / length;
        const phase = (directionX * x + directionY * y) * frequency + time * settings.waveSpeed * relativeSpeed;
        height += Math.sin(phase) * relativeHeight * getWaveVisibility(length, settings.vertexSpacing);
    }
    return height * settings.waveHeight;
};

const wavesShaderCode = WAVES.map(([, , relativeLength, relativeSpeed, relativeHeight], index) => {
    const [directionX, directionY] = waveDirections[index];
    return `
  {
    vec2 direction = vec2(${directionX.toFixed(6)}, ${directionY.toFixed(6)});
    float waveLength = waterWaveLength * ${relativeLength.toFixed(6)};
    float frequency = 6.2831853 / waveLength;
    float phase = dot(direction, position) * frequency + waterTime * waterWaveSpeed * ${relativeSpeed.toFixed(6)};
    float amplitude = waterWaveHeight * ${relativeHeight.toFixed(6)} *
      smoothstep(0.0, 1.0, clamp((waveLength / waterVertexSpacing - 3.0) / 3.0, 0.0, 1.0));
    height += sin(phase) * amplitude;
    slope += direction * cos(phase) * amplitude * frequency;
  }`;
}).join('');

const vertexShaderDeclarations = `
uniform float waterTime;
uniform float waterWaveHeight;
uniform float waterWaveLength;
uniform float waterWaveSpeed;
uniform float waterVertexSpacing;
varying vec2 vWaterWorldXY;
varying float vWaterCrest;

// Returns the height of the waves, and their slope in slopeOut.
float getWaterWaves(vec2 position, out vec2 slopeOut) {
  float height = 0.0;
  vec2 slope = vec2(0.0);
  ${wavesShaderCode}
  slopeOut = slope;
  return height;
}
`;
const vertexShaderWaves = `
// Waves are computed in scene coordinates (the 3D scene is flipped on Y).
vec2 waterScenePosition = (modelMatrix * vec4(position, 1.0)).xy * vec2(1.0, -1.0);
vec2 waterSlope;
float waterHeight = getWaterWaves(waterScenePosition, waterSlope);
vWaterCrest = waterWaveHeight > 0.0 ? waterHeight / waterWaveHeight : 0.0;
vWaterWorldXY = waterScenePosition;
`;
const vertexShaderNormal = `
transformedNormal = normalize((viewMatrix * vec4(-waterSlope.x, waterSlope.y, 1.0, 0.0)).xyz);
`;
const vertexShaderPosition = `
vec3 transformed = vec3(position.xy, position.z + waterHeight / max(length(modelMatrix[2].xyz), 0.0001));
`;
const fragmentShaderDeclarations = `
uniform float waterTime;
uniform float waterRippleTime;
uniform vec3 waterCrestColor;
uniform float waterFoam;
uniform sampler2D waterNormalMap;
uniform float waterNormalMapSize;
uniform float waterHasNormalMap;
varying vec2 vWaterWorldXY;
varying float vWaterCrest;

float waterHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float waterNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(waterHash(i), waterHash(i + vec2(1.0, 0.0)), u.x),
    mix(waterHash(i + vec2(0.0, 1.0)), waterHash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
`;
const fragmentShaderColor = `
// Ripples bend the light: they are a slope in scene coordinates, used for the
// normal (and the foam).
vec2 rippleSlope;
if (waterHasNormalMap > 0.5) {
  // Two layers of the normal map moving in different directions never repeat
  // the same pattern.
  vec2 rippleUv = vWaterWorldXY / waterNormalMapSize;
  vec2 slope1 = texture2D(waterNormalMap, rippleUv + vec2(0.013, 0.007) * waterRippleTime).xy * 2.0 - 1.0;
  vec2 slope2 = texture2D(waterNormalMap, rippleUv * 0.71 + vec2(-0.009, 0.011) * waterRippleTime).xy * 2.0 - 1.0;
  rippleSlope = (slope1 + slope2) * 0.5;
} else {
  vec2 rippleNormalPosition = vWaterWorldXY / 18.0 + vec2(waterRippleTime * 0.4, -waterRippleTime * 0.3);
  rippleSlope = 0.04 * vec2(
    waterNoise(rippleNormalPosition) - 0.5,
    waterNoise(rippleNormalPosition + 7.3) - 0.5
  );
}
// Small ripples moving on top of the waves.
vec2 ripplePosition = vWaterWorldXY / 30.0;
float ripples =
  waterNoise(ripplePosition + vec2(waterRippleTime * 0.6, waterRippleTime * 0.2)) +
  waterNoise(ripplePosition * 1.7 - vec2(waterRippleTime * 0.3, waterRippleTime * 0.5));
float crest = smoothstep(0.35, 1.0, vWaterCrest + (ripples - 1.0) * 0.35);
diffuseColor.rgb = mix(diffuseColor.rgb, waterCrestColor, crest * 0.6);
// Foam only on the highest crests.
float foam = smoothstep(1.0 - waterFoam * 0.3, 1.05 - waterFoam * 0.3, vWaterCrest * 0.75 + ripples * 0.15);
// With a normal map, foam is in streaks along the ripples.
if (waterHasNormalMap > 0.5) foam *= smoothstep(0.1, 0.4, length(rippleSlope));
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), foam * 0.8);
diffuseColor.a = mix(diffuseColor.a, 1.0, foam * 0.8);
`;
const fragmentShaderNormal = `
#include <normal_fragment_maps>
// The 3D scene is flipped on Y.
normal = normalize(normal + faceDirection * (viewMatrix * vec4(rippleSlope.x, -rippleSlope.y, 0.0, 0.0)).xyz);
`;
const fragmentShaderOpacity = `
// Water reflects more light when seen from the side (Fresnel effect).
vec3 waterViewDirection = isOrthographic ? vec3(0.0, 0.0, 1.0) : normalize(vViewPosition);
float waterFresnel = pow(1.0 - clamp(abs(dot(normal, waterViewDirection)), 0.0, 1.0), 4.0);
// It reflects the sky, lit like the wave crests.
outgoingLight = mix(outgoingLight, waterCrestColor, waterFresnel * 0.5);
diffuseColor.a = mix(diffuseColor.a, 1.0, waterFresnel * 0.7);
#include <opaque_fragment>
`;

const normalMapTextures = new WeakMap();
/**
 * @param {gdjs.RuntimeGame} game
 * @param {string} resourceName
 * @returns {THREE.Texture} A repeated texture read as directions, not colors.
 */
const getNormalMapTexture = (game, resourceName) => {
    const imageTexture = game.getImageManager().getThreeTexture(resourceName);
    let texture = normalMapTextures.get(imageTexture);
    if (!texture) {
        texture = imageTexture.clone();
        texture.colorSpace = THREE.NoColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = 4;
        texture.needsUpdate = true;
        normalMapTextures.set(imageTexture, texture);
    }
    return texture;
};

/**
 * The water of a Water3D object: a surface with waves, drawn transparent.
 */
class Water {
    /** @param {gdjs.CustomRuntimeObject3D} object */
    constructor(object) {
        this.object = object;
        this.time = 0;
        this.uniforms = {
            waterTime: { value: 0 },
            // Ripples are noise: a small time keeps them precise.
            waterRippleTime: { value: 0 },
            waterWaveHeight: { value: 0 },
            waterWaveLength: { value: 1 },
            waterWaveSpeed: { value: 1 },
            waterVertexSpacing: { value: 1 },
            waterCrestColor: { value: new THREE.Color() },
            waterFoam: { value: 0 },
            waterNormalMap: { value: null },
            waterNormalMapSize: { value: 1 },
            waterHasNormalMap: { value: 0 },
        };
        this.material = new THREE.MeshStandardMaterial({
            transparent: true,
            roughness: 0.35,
            metalness: 0,
            side: THREE.DoubleSide,
            // Drawn once: the underside is lit with the flipped normal.
            forceSinglePass: true,
            depthWrite: false,
        });
        this.material.onBeforeCompile = (shader) => {
            Object.assign(shader.uniforms, this.uniforms);
            shader.vertexShader = shader.vertexShader
                .replace('#include <common>', '#include <common>\n' + vertexShaderDeclarations)
                .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n' + vertexShaderWaves)
                .replace('#include <defaultnormal_vertex>', '#include <defaultnormal_vertex>\n' + vertexShaderNormal)
                .replace('#include <begin_vertex>', vertexShaderPosition);
            shader.fragmentShader = shader.fragmentShader
                .replace('#include <common>', '#include <common>\n' + fragmentShaderDeclarations)
                .replace('#include <color_fragment>', '#include <color_fragment>\n' + fragmentShaderColor)
                .replace('#include <normal_fragment_maps>', fragmentShaderNormal)
                .replace('#include <opaque_fragment>', fragmentShaderOpacity);
        };
        this.material.customProgramCacheKey = () => 'Water3D';
        this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), this.material);
        this.mesh.receiveShadow = true;
        object.get3DRendererObject().add(this.mesh);
        this.segmentsX = 0;
        this.segmentsY = 0;
        this.settings = { waveHeight: 0, waveLength: 1, waveSpeed: 1, vertexSpacing: 1 };
        this.updateFromProperties();
    }

    updateFromProperties() {
        const { object } = this;
        this.material.color.set(gdjs.rgbOrHexStringToNumber(object._getColor()));
        this.material.opacity = gdjs.evtTools.common.clamp(object._getOpacity() / 255, 0, 1);
        this.uniforms.waterCrestColor.value.set(gdjs.rgbOrHexStringToNumber(object._getCrestColor()));
        this.uniforms.waterFoam.value = gdjs.evtTools.common.clamp(object._getFoam(), 0, 1);
        const normalMapName = object._getNormalMap();
        this.uniforms.waterHasNormalMap.value = normalMapName ? 1 : 0;
        this.uniforms.waterNormalMap.value = normalMapName
            ? getNormalMapTexture(object.getRuntimeScene().getGame(), normalMapName)
            : null;
        this.uniforms.waterNormalMapSize.value = Math.max(object._getNormalMapSize(), 1);
        this.settings.waveHeight = Math.max(object._getWaveHeight(), 0);
        this.settings.waveLength = Math.max(object._getWaveLength(), 1);
        this.settings.waveSpeed = object._getWaveSpeed();
        this.uniforms.waterWaveHeight.value = this.settings.waveHeight;
        this.uniforms.waterWaveLength.value = this.settings.waveLength;
        this.uniforms.waterWaveSpeed.value = this.settings.waveSpeed;
        this._updateGeometryIfNeeded();
    }

    /** Waves need vertices: their count follows the size of the water. */
    _updateGeometryIfNeeded() {
        const { object } = this;
        const hasWaves = this.settings.waveHeight > 0;
        const segmentsX = hasWaves
            ? gdjs.evtTools.common.clamp(Math.ceil(object.getWidth() / WAVE_VERTEX_SPACING), 1, MAX_SEGMENTS)
            : 1;
        const segmentsY = hasWaves
            ? gdjs.evtTools.common.clamp(Math.ceil(object.getHeight() / WAVE_VERTEX_SPACING), 1, MAX_SEGMENTS)
            : 1;
        this.settings.vertexSpacing = Math.max(object.getWidth() / segmentsX, object.getHeight() / segmentsY);
        this.uniforms.waterVertexSpacing.value = this.settings.vertexSpacing;
        const waveHeight = this.settings.waveHeight / Math.max(object.getScaleZ(), 0.0001);
        if (segmentsX !== this.segmentsX || segmentsY !== this.segmentsY) {
            this.segmentsX = segmentsX;
            this.segmentsY = segmentsY;
            const geometry = new THREE.PlaneGeometry(AREA_SIZE, AREA_SIZE, segmentsX, segmentsY);
            geometry.translate(AREA_SIZE / 2, AREA_SIZE / 2, 0);
            geometry.boundingBox = new THREE.Box3();
            geometry.boundingSphere = new THREE.Sphere();
            this.mesh.geometry.dispose();
            this.mesh.geometry = geometry;
        }
        // Waves go above and under the plane.
        const { boundingBox, boundingSphere } = this.mesh.geometry;
        if (boundingBox.max.z !== waveHeight) {
            boundingBox.min.set(0, 0, -waveHeight);
            boundingBox.max.set(AREA_SIZE, AREA_SIZE, waveHeight);
            boundingBox.getBoundingSphere(boundingSphere);
        }
    }

    /** @returns {number} The Z position of the water surface, with the waves. */
    getSurfaceZ(x, y) {
        return this.object.getZ() + getWaveHeight(x, y, this.time, this.settings);
    }

    /** @returns {boolean} true if an object center is under the surface. */
    isUnderwater(object) {
        if (!gdjs.Base3DHandler.is3D(object)) return false;
        const x = object.getCenterXInScene();
        const y = object.getCenterYInScene();
        return this.isOver(x, y) && object.getCenterZInScene() < this.getSurfaceZ(x, y);
    }

    /** @returns {boolean} true if the position is above the water, inside its area. */
    isOver(x, y) {
        const { object } = this;
        return (
            x >= object.getX() &&
            x <= object.getX() + object.getWidth() &&
            y >= object.getY() &&
            y <= object.getY() + object.getHeight()
        );
    }

    /**
     * Push objects up where they are under the surface, and slow them down.
     * @param {gdjs.RuntimeObject[]} objects
     * @param {string} physicsBehaviorName
     * @param {number} buoyancy 1 to float half submerged, higher to float higher.
     */
    applyBuoyancy(objects, physicsBehaviorName, buoyancy) {
        for (const object of objects) {
            /** @type {gdjs.Physics3DRuntimeBehavior | null} */
            const physics = object.getBehavior(physicsBehaviorName);
            if (!physics || !physics.isDynamic()) continue;
            const centerX = object.getCenterXInScene();
            const centerY = object.getCenterYInScene();
            if (!this.isOver(centerX, centerY)) continue;
            const depth = Math.max(object.getDepth(), 1);
            const surfaceZ = this.getSurfaceZ(centerX, centerY);
            const submergedRatio = gdjs.evtTools.common.clamp((surfaceZ - physics.owner3D.getUnrotatedAABBMinZ()) / depth, 0, 1);
            if (submergedRatio <= 0) continue;
            // Forces are in newtons, velocities are converted from pixels to meters.
            const { gravityZ, worldScale } = physics._sharedData;
            const mass = physics.getMass();
            // Archimedes: floats with half of its depth submerged when buoyancy is 1.
            const buoyancyForce = -2 * buoyancy * submergedRatio * mass * gravityZ;
            // Water drag, to stop bouncing forever.
            const drag = (4 * submergedRatio * mass) / worldScale;
            physics.applyForceAtCenter(
                -physics.getLinearVelocityX() * drag,
                -physics.getLinearVelocityY() * drag,
                buoyancyForce - physics.getLinearVelocityZ() * drag
            );
        }
    }

    /** @param {number} time In seconds, the same for all water objects. */
    update(time) {
        this.time = time;
        this.uniforms.waterTime.value = time;
        this.uniforms.waterRippleTime.value = time % 1000;
        this._updateGeometryIfNeeded();
    }

    dispose() {
        this.mesh.removeFromParent();
        this.mesh.geometry.dispose();
        this.material.dispose();
    }
}

gdjs.__water3DExtension = { Water, getWaveHeight };
