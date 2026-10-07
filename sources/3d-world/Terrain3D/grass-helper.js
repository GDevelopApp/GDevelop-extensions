if (gdjs.__terrainGrassExtension) {
    return;
}
// Blades grow on the grounds of the scene: the 3D terrains (see `getGrounds`
// in the terrain helper).

// Size of the object inner area: instances are scaled from it.
const AREA_SIZE = 1000;
const AREA_DEPTH = 40;
const CHUNK_SIZE = 500;
const MAX_BENDING_OBJECTS = 8;
// The ground or the object can change every frame (while sculpting or moving
// it in the editor): blades are placed again at most this often.
const REBUILD_DELAY = 0.3;

/**
 * A blade: a thin, tapered strip. Its width and height are 1: blades are
 * scaled by the shader.
 */
const createBladeGeometry = () => {
    const halfWidths = [0.5, 0.42, 0.28, 0];
    const heights = [0, 0.35, 0.7, 1];
    const positions = [];
    halfWidths.forEach((halfWidth, level) => {
        positions.push(-halfWidth, 0, heights[level]);
        if (halfWidth > 0) positions.push(halfWidth, 0, heights[level]);
    });
    const indices = [0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 4, 5, 6];
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(positions.length).fill(0), 3));
    geometry.setIndex(indices);
    return geometry;
};

const vertexShaderDeclarations = `
attribute vec4 grassRoot;
attribute vec2 grassShape;
uniform mat3 grassWorldToLocal;
uniform float grassWorldScale;
uniform float grassBladeWidth;
uniform float grassTime;
uniform float grassWindStrength;
uniform float grassWindSpeed;
uniform vec4 grassBenders[${MAX_BENDING_OBJECTS}];
uniform vec3 grassBaseColor;
uniform vec3 grassTipColor;
varying vec3 vGrassColor;
`;
const vertexShaderPosition = `
// Blades are shaped in scene units (with Y flipped like the 3D world), then
// moved back in the (scaled) object space.
float bladeHeight = position.z;
float grassAngle = grassRoot.w;
float bladeWidth = position.x * grassBladeWidth;
vec3 blade = vec3(
  bladeWidth * cos(grassAngle),
  bladeWidth * sin(grassAngle),
  bladeHeight * grassShape.x
);
vec3 rootWorld = (modelMatrix * vec4(grassRoot.xyz, 1.0)).xyz * grassWorldScale;
// Tips bend more than the base.
float bendFactor = bladeHeight * bladeHeight * grassShape.x;
float gust = sin(grassTime * grassWindSpeed + rootWorld.x * 0.013 + rootWorld.y * 0.011);
float flutter = sin(grassTime * grassWindSpeed * 2.7 + grassShape.y * 40.0) * 0.3;
blade.xy += vec2(0.8, 0.5) * (gust + flutter + 0.6) * grassWindStrength * 0.35 * bendFactor;
for (int i = 0; i < ${MAX_BENDING_OBJECTS}; i++) {
  vec4 bender = grassBenders[i];
  if (bender.z <= 0.0) continue;
  vec2 away = rootWorld.xy - bender.xy;
  float distanceToBender = length(away);
  float push = 1.0 - smoothstep(bender.z * 0.3, bender.z, distanceToBender);
  if (push > 0.0) {
    blade.xy += normalize(away + vec2(0.001)) * push * bendFactor * 0.9;
    blade.z *= 1.0 - push * 0.5;
  }
}
vec3 transformed = grassRoot.xyz + grassWorldToLocal * (blade / grassWorldScale);
vGrassColor = mix(grassBaseColor, grassTipColor, bladeHeight) * (0.85 + 0.3 * grassShape.y);
`;
const vertexShaderNormal = `
// Blades are lit like the ground below them.
transformedNormal = normalize((viewMatrix * vec4(0.0, 0.0, 1.0, 0.0)).xyz);
`;
const fragmentShaderDeclarations = `
varying vec3 vGrassColor;
`;
const fragmentShaderColor = `
diffuseColor.rgb *= vGrassColor;
`;
// Both faces of blades are lit like the ground (not flipped for back faces).
const fragmentShaderNormal = `
#include <normal_fragment_begin>
normal = normalize(vNormal);
nonPerturbedNormal = normal;
`;

const { getWorldScale, getGrounds, patchShaderCode } = gdjs.__terrain3DExtension;

const random = (seed) => {
    let state = seed >>> 0 || 1;
    return () => {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        return (state >>> 0) / 4294967296;
    };
};

/**
 * The grass of a terrain grass object: blades drawn with GPU instancing, in chunks
 * that are hidden when off-screen and thinned out with the distance. They grow
 * on the grounds below, like 3D terrains (only where a given layer is painted).
 */
class Grass {
    /** @param {gdjs.CustomRuntimeObject3D} object */
    constructor(object) {
        this.object = object;
        this.group = new THREE.Group();
        object.get3DRendererObject().add(this.group);
        this.bladeGeometry = createBladeGeometry();
        /** @type {Array<{mesh: THREE.Mesh, blades: number, center: THREE.Vector3}>} */
        this.chunks = [];
        this.builtFrom = '';
        this.timeSinceRebuild = 0;
        this.grounds = getGrounds(object.getRuntimeScene());
        this.uniforms = {
            grassWorldToLocal: { value: new THREE.Matrix3() },
            // Scene units by 3D world unit.
            grassWorldScale: { value: 1 },
            grassBladeWidth: { value: 1 },
            grassTime: { value: 0 },
            grassWindStrength: { value: 1 },
            grassWindSpeed: { value: 1 },
            grassBenders: { value: Array.from({ length: MAX_BENDING_OBJECTS }, () => new THREE.Vector4()) },
            grassBaseColor: { value: new THREE.Color() },
            grassTipColor: { value: new THREE.Color() },
        };
        this.material = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, side: THREE.DoubleSide });
        this.material.onBeforeCompile = (shader) => {
            Object.assign(shader.uniforms, this.uniforms);
            shader.vertexShader = patchShaderCode(shader.vertexShader, [
                ['#include <common>', '#include <common>\n' + vertexShaderDeclarations],
                ['#include <begin_vertex>', vertexShaderPosition],
                ['#include <defaultnormal_vertex>', '#include <defaultnormal_vertex>\n' + vertexShaderNormal],
            ], 'TerrainGrass');
            shader.fragmentShader = patchShaderCode(shader.fragmentShader, [
                ['#include <common>', '#include <common>\n' + fragmentShaderDeclarations],
                ['#include <color_fragment>', '#include <color_fragment>\n' + fragmentShaderColor],
                ['#include <normal_fragment_begin>', fragmentShaderNormal],
            ], 'TerrainGrass');
        };
        this.material.customProgramCacheKey = () => 'TerrainGrass';

        this._matrix = new THREE.Matrix4();
        this._cameraPosition = new THREE.Vector3();
        this._chunkPosition = new THREE.Vector3();
        this._scale = new THREE.Vector3();
        this.updateFromProperties();
    }

    updateFromProperties() {
        const { object } = this;
        this.uniforms.grassBaseColor.value.set(gdjs.rgbOrHexStringToNumber(object._getBaseColor()));
        this.uniforms.grassTipColor.value.set(gdjs.rgbOrHexStringToNumber(object._getTipColor()));
        this.uniforms.grassWindStrength.value = object._getWindStrength();
        this.uniforms.grassWindSpeed.value = object._getWindSpeed();
        this.uniforms.grassBladeWidth.value = Math.max(object._getBladeWidth(), 0);
        this.material.needsUpdate = true;
        this.builtFrom = '';
    }

    _getBuildKey() {
        const { object } = this;
        const groundVersions = Array.from(this.grounds, (ground) => ground.getVersion());
        return [
            object.getX(), object.getY(), object.getZ(), object.getWidth(), object.getHeight(), object.getDepth(),
            object._getDensity(), object._getBladeHeight(), object._getGroundLayer(), object._getMaxSlope(),
            object._getSeed(),
            ...groundVersions,
        ].join('|');
    }

    /** Place the blades again, for example after the ground or the object changed. */
    rebuild() {
        const grounds = Array.from(this.grounds);
        for (const chunk of this.chunks) {
            chunk.mesh.removeFromParent();
            chunk.mesh.geometry.dispose();
        }
        this.chunks.length = 0;

        const { object } = this;
        const width = object.getWidth();
        const height = object.getHeight();
        const scaleX = width / AREA_SIZE;
        const scaleY = height / AREA_SIZE;
        const scaleZ = Math.max(object.getDepth() / AREA_DEPTH, 0.0001);
        const bladesPerChunk = Math.round((Math.max(object._getDensity(), 0) * CHUNK_SIZE * CHUNK_SIZE) / 10000);
        const groundLayer = parseInt(object._getGroundLayer(), 10) || 0;
        const maxSlope = object._getMaxSlope();
        const chunksX = Math.max(Math.ceil(width / CHUNK_SIZE), 1);
        const chunksY = Math.max(Math.ceil(height / CHUNK_SIZE), 1);
        const nextRandom = random(object._getSeed() * 7919 + 1);
        const bladeHeight = Math.max(object._getBladeHeight(), 0);

        for (let chunkY = 0; chunkY < chunksY; chunkY++) {
            for (let chunkX = 0; chunkX < chunksX; chunkX++) {
                const roots = new Float32Array(bladesPerChunk * 4);
                const shapes = new Float32Array(bladesPerChunk * 2);
                let blades = 0;
                let minZ = Infinity;
                let maxZ = -Infinity;
                for (let attempt = 0; attempt < bladesPerChunk; attempt++) {
                    // In scene units, relative to the object.
                    const x = (chunkX + nextRandom()) * CHUNK_SIZE;
                    const y = (chunkY + nextRandom()) * CHUNK_SIZE;
                    const angle = nextRandom() * Math.PI * 2;
                    const heightFactor = 0.6 + 0.8 * nextRandom();
                    const tint = nextRandom();
                    const growth = nextRandom();
                    if (x > width || y > height) continue;
                    const sceneX = object.getX() + x;
                    const sceneY = object.getY() + y;
                    let groundZ = object.getZ();
                    const ground = grounds.find((ground) => ground.containsPoint(sceneX, sceneY));
                    if (ground) {
                        if (groundLayer > 0 && growth > ground.getLayerWeightAt(sceneX, sceneY, groundLayer)) continue;
                        if (ground.getSlopeAt(sceneX, sceneY) > maxSlope) continue;
                        groundZ = ground.getHeightAt(sceneX, sceneY);
                    }
                    const localZ = (groundZ - object.getZ()) / scaleZ;
                    roots[blades * 4] = x / scaleX;
                    roots[blades * 4 + 1] = y / scaleY;
                    roots[blades * 4 + 2] = localZ;
                    roots[blades * 4 + 3] = angle;
                    shapes[blades * 2] = heightFactor * bladeHeight;
                    shapes[blades * 2 + 1] = tint;
                    minZ = Math.min(minZ, localZ);
                    maxZ = Math.max(maxZ, localZ);
                    blades++;
                }
                if (blades === 0) continue;

                const geometry = new THREE.InstancedBufferGeometry();
                geometry.index = this.bladeGeometry.index;
                geometry.setAttribute('position', this.bladeGeometry.attributes.position);
                geometry.setAttribute('normal', this.bladeGeometry.attributes.normal);
                geometry.setAttribute('grassRoot', new THREE.InstancedBufferAttribute(roots.subarray(0, blades * 4), 4));
                geometry.setAttribute('grassShape', new THREE.InstancedBufferAttribute(shapes.subarray(0, blades * 2), 2));
                geometry.instanceCount = blades;
                // The furthest tips can go with the wind and the bending objects (see the shader).
                const maxBladeHeight = bladeHeight * 1.4;
                const lean =
                    (0.35 * 1.9 * 0.943 * Math.max(object._getWindStrength(), 0) + 0.9) * maxBladeHeight +
                    Math.max(object._getBladeWidth(), 0) / 2;
                const leanX = lean / scaleX;
                const leanY = lean / scaleY;
                geometry.boundingBox = new THREE.Box3(
                    new THREE.Vector3((chunkX * CHUNK_SIZE) / scaleX - leanX, (chunkY * CHUNK_SIZE) / scaleY - leanY, minZ),
                    new THREE.Vector3(
                        Math.min((chunkX + 1) * CHUNK_SIZE, width) / scaleX + leanX,
                        Math.min((chunkY + 1) * CHUNK_SIZE, height) / scaleY + leanY,
                        maxZ + (bladeHeight * 1.4) / scaleZ
                    )
                );
                geometry.boundingSphere = geometry.boundingBox.getBoundingSphere(new THREE.Sphere());
                const mesh = new THREE.Mesh(geometry, this.material);
                mesh.receiveShadow = true;
                // Raycasts would only test one blade: the selection plane is used instead.
                mesh.raycast = () => {};
                this.group.add(mesh);
                this.chunks.push({ mesh, blades, center: geometry.boundingSphere.center.clone() });
            }
        }
    }

    _updateBendingObjects() {
        const benders = this.uniforms.grassBenders.value;
        const objectName = this.object._getBendingObject();
        const bendingObjects = objectName ? this.object.getInstanceContainer().getObjects(objectName) || [] : [];
        for (let index = 0; index < MAX_BENDING_OBJECTS; index++) {
            const bendingObject = bendingObjects[index];
            if (!bendingObject) {
                benders[index].set(0, 0, 0, 0);
                continue;
            }
            // Blades are pushed in the 3D scene, which is flipped on Y.
            const radius = Math.max(bendingObject.getWidth(), bendingObject.getHeight()) * 1.2;
            benders[index].set(bendingObject.getCenterXInScene(), -bendingObject.getCenterYInScene(), radius, 0);
        }
    }

    /**
     * @param {number} elapsedSeconds
     * @param {number} time In seconds, the same for all grass objects.
     */
    update(elapsedSeconds, time, camera) {
        this.timeSinceRebuild += elapsedSeconds;
        if (!this.builtFrom || this.timeSinceRebuild >= REBUILD_DELAY) {
            const buildKey = this._getBuildKey();
            if (buildKey !== this.builtFrom) {
                this.builtFrom = buildKey;
                this.timeSinceRebuild = 0;
                this.rebuild();
            }
        }

        this.uniforms.grassTime.value = time;
        this.uniforms.grassWorldScale.value = getWorldScale(this.object);
        // The object transformation is applied just before rendering, it's needed now.
        this.object.getRenderer().ensureUpToDate();
        this.group.updateWorldMatrix(true, false);
        this.uniforms.grassWorldToLocal.value.setFromMatrix4(this._matrix.copy(this.group.matrixWorld).invert());
        this._updateBendingObjects();
        if (!camera) return;

        // Far chunks are hidden, and thinned out before (in 3D world units).
        const fadeDistance = Math.max(this.object._getFadeDistance(), 1) / getWorldScale(this.object);
        this._cameraPosition.setFromMatrixPosition(camera.matrixWorld);
        for (const chunk of this.chunks) {
            const distance = this._chunkPosition
                .copy(chunk.center)
                .applyMatrix4(this.group.matrixWorld)
                .distanceTo(this._cameraPosition);
            const density = gdjs.evtTools.common.clamp((fadeDistance - distance) / (fadeDistance * 0.5), 0, 1);
            chunk.mesh.visible = density > 0;
            chunk.mesh.geometry.instanceCount = Math.ceil(chunk.blades * density);
        }
    }

    dispose() {
        for (const chunk of this.chunks) {
            chunk.mesh.geometry.dispose();
        }
        this.bladeGeometry.dispose();
        this.material.dispose();
        this.group.removeFromParent();
    }
}

gdjs.__terrainGrassExtension = { Grass };
