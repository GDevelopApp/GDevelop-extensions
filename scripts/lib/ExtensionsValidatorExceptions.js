/** @typedef {import("../types").ExtensionAllowedProperties} ExtensionAllowedProperties */

/**
 * All extensions that were added before the PascalCase best practice was defined,
 * and therefore cannot not be changed without causing a breaking change anymore.
 * Do not add extensions to this list, prefer to change extensions to use PascalCase.
 */
const legacyCamelCaseExtensions = new Set([
  'TextEntryVirtualKeyboard',
  'Rotate13',
  'MQTT',
  'MousePointerLock',
  'MouseHelper',
  'BackButton',
]);

/**
 * All extensions that were added before the no Get prefix best practice was defined,
 * and therefore cannot not be changed without causing a breaking change anymore.
 * Do not add extensions to this list, prefer to change extensions to use expressions without the Get prefix.
 */
const legacyGetPrefixedExpressionsExtensions = new Set([
  'TextEntryConsole',
  'MQTT',
]);

/**
 * A set of all lifecycle functions to ignore some rules for them (like PascalCase).
 */
const lifecycleFunctions = new Set([
  'doStepPreEvents',
  'doStepPostEvents',
  'onDeActivate',
  'onActivate',
  'onCreated',
  'onOwnerRemovedFromScene',
  'onDestroy',
  'onFirstSceneLoaded',
  'onSceneLoaded',
  'onSceneUnloading',
  'onScenePaused',
  'onSceneResumed',
  'onScenePostEvents',
  'onScenePreEvents',
  'onHotReloading',
]);

/**
 * Contains the list of all public API methods or properties
 * that are allowed to be used in JavaScript by extensions.
 *
 * If you add a new extension using JavaScript, try to limit the usage
 * of public APIs to the minimum required, and the usage of any extension
 * specific properties to just one if possible.
 * You can then add a new allowance in this list.
 */
const extensionsAllowedProperties = {
  /**
   * Public properties/APIs that are always allowed.
   * @type {ExtensionAllowedProperties}
   */
  anyExtensionAllowance: {
    gdjsAllowedProperties: [
      'makeUuid',
      'rgbToHex',
      'rgbOrHexToRGBColor',
      'rgbToHexNumber',
      'hexNumberToRGB',
      'hexToRGBColor',
      'rgbOrHexStringToNumber',
      'hexNumberToRGBArray',
      'copyArray',
      'staticArray',
      'staticArray2',
      'staticObject',
      'toDegrees',
      'toRad',
      'random',
      'randomFloat',
      'randomFloatInRange',
      'randomInRange',
      'randomWithStep',
      'evtTools',
      'Variable',
      'RuntimeObject',
      'Logger',
    ],
    // Events tools are wrappers of the JavaScript APIs allowing them to be called by events.
    // They should not be used 99% of the time, the only base exception being
    // `common` as it contains utility functions like `clamp` that are not available
    // in JavaScript by default. Apart from this, the JavaScript functions should be used instead.
    gdjsEvtToolsAllowedProperties: ['common'],
    runtimeSceneAllowedProperties: [
      'getVariables',
      'getLayer',
      'getGame',
      'getBackgroundColor',
      'getName',
      'createObject',
      'createObjectsFrom',
      'setBackgroundColor',
      'sceneJustResumed',
      'requestChange',
      'hasLayer',
      'enableDebugDraw',
    ],
    javaScriptObjectAllowedProperties: [
      'keys',
      'create',
      'assign',
      'is',
      'values',
      'entries',
      'fromEntries',
      'defineProperty',
      'getOwnPropertyNames',
      'getOwnPropertyDescriptor',
      'defineProperties',
      'prototype',
    ],
  },
  /** @type {Record<string, ExtensionAllowedProperties>}} */
  extensionSpecificAllowance: {
    AdvancedHTTP: {
      gdjsAllowedProperties: ['_advancedHTTP', 'PromiseTask'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    AdvancedJump: {
      gdjsAllowedProperties: ['PlatformerObjectRuntimeBehavior'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    AdvancedJump3D: {
      gdjsAllowedProperties: ['PhysicsCharacter3DRuntimeBehavior'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    AdvancedP2PEventHandling: {
      gdjsAllowedProperties: [],
      gdjsEvtToolsAllowedProperties: ['p2p'],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    AudioContext: {
      gdjsAllowedProperties: ['__audioContextExtension'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    BackButton: {
      gdjsAllowedProperties: [],
      gdjsEvtToolsAllowedProperties: ['back_button'],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    Billboard: {
      gdjsAllowedProperties: [
        'Cube3DRuntimeObject',
        'Cube3DRuntimeObjectRenderer',
      ],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    BoidsMovement: {
      gdjsAllowedProperties: [
        '__boidsExtension',
        'RuntimeBehavior',
        'BehaviorRBushAABB',
        'randomFloatInRange',
        'staticObject',
        'staticArray',
      ],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: ['__boidsExtension'],
      javaScriptObjectAllowedProperties: [],
    },
    CameraShake: {
      gdjsAllowedProperties: ['_cameraShakeExtension'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    CameraShake3D: {
      gdjsAllowedProperties: ['_cameraShake3DExtension'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: ['getAllLayerNames'],
      javaScriptObjectAllowedProperties: [],
    },
    Collision3D: {
      gdjsAllowedProperties: [
        '_collision3DExtension',
        'RuntimeObject3D',
        'AABB',
        'Polygon',
      ],
      gdjsEvtToolsAllowedProperties: ['object'],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    Compressor: {
      gdjsAllowedProperties: ['_pakoTools'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    CrazyGamesAdApi: {
      gdjsAllowedProperties: ['_crazyGamesExtension'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: ['getSoundManager'],
      javaScriptObjectAllowedProperties: [],
    },
    CurvedMovement: {
      gdjsAllowedProperties: [
        '__curvedMovementExtension',
        'AffineTransformation',
        'ShapePainterRuntimeObject',
      ],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: ['__curvedMovementExtension'],
      javaScriptObjectAllowedProperties: [],
    },
    DialogBox: {
      gdjsAllowedProperties: [],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: ['getObjects', 'getSoundManager'],
      javaScriptObjectAllowedProperties: [],
    },
    DiscordRichPresence: {
      gdjsAllowedProperties: [],
      gdjsEvtToolsAllowedProperties: ['discordRP'],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    DoubleClick: {
      gdjsAllowedProperties: ['_DoubleClickExtension', 'InputManager'],
      gdjsEvtToolsAllowedProperties: ['input'],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    FlexBox: {
      gdjsAllowedProperties: ['layoutContainers'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    GamePixSDK: {
      gdjsAllowedProperties: ['_gamePixSdkExtension'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    Gamepads: {
      gdjsAllowedProperties: ['_extensionController'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: ['getElapsedTime'],
      javaScriptObjectAllowedProperties: [],
    },
    Geolocation: {
      gdjsAllowedProperties: [],
      gdjsEvtToolsAllowedProperties: ['geolocation'],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    HedgehogPlatformer: {
      gdjsAllowedProperties: [
        '__hedgehogPlatformerExtension',
        'RuntimeInstanceContainer',
        'BehaviorRBushAABB',
        'RuntimeBehavior',
        'RaycastTestResult',
        'Polygon',
        'SpriteRuntimeObject',
      ],
      gdjsEvtToolsAllowedProperties: ['object'],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    HeightMap3D: {
      gdjsAllowedProperties: [
        '__heightMap3DExtension',
        'CustomRuntimeObject3D',
        'CustomRuntimeObject',
        'Physics3DRuntimeBehavior',
      ],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    InkJS: {
      gdjsAllowedProperties: ['_InkJS', 'GDStory'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    JointConnector: {
      gdjsAllowedProperties: ['LinksManager', 'Physics2RuntimeBehavior'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    Jump3D: {
      gdjsAllowedProperties: [],
      gdjsEvtToolsAllowedProperties: ['object'],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    LinkTools: {
      gdjsAllowedProperties: ['LinksManager'],
      gdjsEvtToolsAllowedProperties: ['object'],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    MarchingSquares: {
      gdjsAllowedProperties: [
        '__marchingSquaresExtension',
        'Polygon',
        'ShapePainterRuntimeObject',
      ],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [
        // Extend a behavior with JavaScript:
        'getPrototypeOf',
      ],
    },
    MousePointerLock: {
      gdjsAllowedProperties: ['_MousePointerLockExtension', 'RuntimeGame'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    MQTT: {
      gdjsAllowedProperties: [],
      gdjsEvtToolsAllowedProperties: ['mqtt'],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [
        'prototype',
        'getPrototypeOf',
        'setPrototypeOf',
        'getOwnPropertySymbols',
        'getOwnPropertyDescriptor',
        'getOwnPropertyDescriptors',
      ],
    },
    NavMeshPathfinding: {
      gdjsAllowedProperties: ['__NavMeshPathfinding'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      // This is for UMD extends emulation.
      javaScriptObjectAllowedProperties: ['setPrototypeOf'],
    },
    Noise: {
      gdjsAllowedProperties: ['_extensionNoise', 'randomInRange'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    ObjectSlicer: {
      gdjsAllowedProperties: ['_objectSlicer'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    ObjectStack: {
      gdjsAllowedProperties: [
        '_objectStackExtension',
        'registerObjectDeletedFromSceneCallback',
        'RuntimeObject',
      ],
      gdjsEvtToolsAllowedProperties: ['object'],
      runtimeSceneAllowedProperties: ['_objectStackExtension'],
      javaScriptObjectAllowedProperties: [],
    },
    ParticleEmitter3D: {
      gdjsAllowedProperties: [
        '__particleEmmiter3DExtension',
        'CustomRuntimeObject',
        'CustomRuntimeObjectInstanceContainer',
        'CustomRuntimeObject3DRenderer',
        'CustomRuntimeObject3D',
      ],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: ['__particleEmmiter3DExtension'],
      javaScriptObjectAllowedProperties: ['getPrototypeOf'],
    },
    PixelPerfectMovement: {
      gdjsAllowedProperties: [
        '__pixelPerfectExtension',
        'RuntimeBehavior',
        'TopDownMovementRuntimeBehavior',
        'RuntimeInstanceContainer',
      ],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    PlatformLedgeGrabber: {
      gdjsAllowedProperties: [
        'PlatformerObjectRuntimeBehavior',
        'PlatformRuntimeBehavior',
        'PlatformObjectsManager',
        'AABB',
      ],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    PlatformerTrajectory: {
      gdjsAllowedProperties: ['PlatformerObjectRuntimeBehavior'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    PokiGamesSDKHtml: {
      gdjsAllowedProperties: ['_pokiGamesSDKHtmlExtension'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    Raycaster3D: {
      gdjsAllowedProperties: ['__raycaster3DExtension'],
      gdjsEvtToolsAllowedProperties: ['object'],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    Recolorizer: {
      gdjsAllowedProperties: [
        '__recolorizerExtension',
        'SpriteRuntimeObject',
        'TiledSpriteRuntimeObject',
        'PanelSpriteRuntimeObject',
        'rgbOrHexToRGBColor',
      ],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: ['__recolorizerExtension'],
      javaScriptObjectAllowedProperties: [
        // Extend a behavior with JavaScript:
        'getPrototypeOf',
      ],
    },
    Record: {
      gdjsAllowedProperties: ['_extensionRecord'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    RenderToSprite: {
      gdjsAllowedProperties: [
        '_renderToSprite',
        // Used for better autocomplete
        'SpriteRuntimeObject',
      ],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [
        // Used for rendering
        'getRenderer',
        // Used to update culling before rendering
        '_updateLayersPreRender',
        '_updateObjectsPreRender',
      ],
      javaScriptObjectAllowedProperties: [],
    },
    ReadPixels: {
      gdjsAllowedProperties: ['_readPixels'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    ShakeObject3D: {
      gdjsAllowedProperties: ['_shakeObjectExtension'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    Sprite3D: {
      gdjsAllowedProperties: [
        '__sprite3DExtension',
        'CustomRuntimeObject',
        'Polygon',
      ],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    SpriteMultitouchJoystick: {
      gdjsAllowedProperties: [],
      gdjsEvtToolsAllowedProperties: ['input'],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    Sticker: {
      gdjsAllowedProperties: [
        '_stickerExtension',
        'registerObjectDeletedFromSceneCallback',
        'RuntimeObject',
        'RuntimeBehavior',
      ],
      gdjsEvtToolsAllowedProperties: ['object'],
      runtimeSceneAllowedProperties: ['_stickerExtension'],
      javaScriptObjectAllowedProperties: [],
    },
    Text3D: {
      gdjsAllowedProperties: [
        '__text3DExtension',
        'TextRuntimeObject',
        'CustomRuntimeObject3D',
        'CustomRuntimeObjectInstanceContainer',
        'CustomRuntimeObject3DRenderer',
      ],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: ['freeze'],
    },
    TextEntryVirtualKeyboard: {
      gdjsAllowedProperties: ['_extensionMobileKeyboard'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    TextEntryConsole: {
      gdjsAllowedProperties: ['TextEntryRuntimeObject'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    TextToSpeech: {
      gdjsAllowedProperties: ['_ttsWait'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    TiledUnitsBar: {
      gdjsAllowedProperties: ['_TiledUnitsBarExtension'],
      gdjsEvtToolsAllowedProperties: ['AnchorRuntimeBehavior'],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    TopDownCornerSliding: {
      gdjsAllowedProperties: [
        '__topDownCornerSlidingExtension',
        'TopDownMovementRuntimeBehavior',
        'RuntimeInstanceContainer',
        'RuntimeBehavior',
        'AABB',
      ],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    Tween3D: {
      gdjsAllowedProperties: [
        '__tween3DExtension',
        'RuntimeObject3D',
        'registerObjectDeletedFromSceneCallback',
      ],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: ['__tween3DExtension'],
      javaScriptObjectAllowedProperties: [],
    },
    VoiceRecognition: {
      gdjsAllowedProperties: ['_extensionVoiceRecognition'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    WebSocketClient: {
      gdjsAllowedProperties: [],
      gdjsEvtToolsAllowedProperties: ['wsClient'],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    WortalSDK: {
      gdjsAllowedProperties: ['_wortalExtension'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    YandexGamesSDK: {
      gdjsAllowedProperties: ['_YandexGamesSDK'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    Share: {
      gdjsAllowedProperties: ['_shareExtension'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    Flash: {
      gdjsAllowedProperties: ['SpriteRuntimeObject'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    ObjectPickingTools: {
      gdjsAllowedProperties: [],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: ['getObjects'],
      javaScriptObjectAllowedProperties: [],
    },
    PlaygamaBridge: {
      gdjsAllowedProperties: ['_playgamaBridgeExtension'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: ['setPrototypeOf'],
    },
    Sky3D: {
      gdjsAllowedProperties: ['__Sky3DExtension'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    PlayerAvatar: {
      gdjsAllowedProperties: ['_extensionAvatar', 'multiplayerMessageManager'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
  },
};

module.exports = {
  extensionsAllowedProperties,
  legacyGetPrefixedExpressionsExtensions,
  legacyCamelCaseExtensions,
  lifecycleFunctions,
};
