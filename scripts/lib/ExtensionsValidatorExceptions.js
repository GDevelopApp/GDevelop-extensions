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
  'ArrayTools',
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
    // in JavaScript by default. Appart from this, the JavaScript functions should be used instead.
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
      'defineProperties',
    ],
  },
  /** @type {Record<string, ExtensionAllowedProperties>}} */
  extensionSpecificAllowance: {
    AdvancedJump: {
      gdjsAllowedProperties: ['PlatformerObjectRuntimeBehavior'],
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
    BackButton: {
      gdjsAllowedProperties: [],
      gdjsEvtToolsAllowedProperties: ['back_button'],
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
    DialogBox: {
      gdjsAllowedProperties: [],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: ['getObjects', 'getSoundManager'],
      javaScriptObjectAllowedProperties: [],
    },
    FlexBox: {
      gdjsAllowedProperties: ['layoutContainers'],
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
      gdjsAllowedProperties: ['_MousePointerLockExtension'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    Noise: {
      gdjsAllowedProperties: ['_extensionNoise', 'randomInRange'],
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
    TextEntryVirtualKeyboard: {
      gdjsAllowedProperties: ['_extensionMobileKeyboard'],
      gdjsEvtToolsAllowedProperties: [],
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
    Gamepads: {
      gdjsAllowedProperties: ['_extensionController'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    Sticker: {
      gdjsAllowedProperties: [
        'registerObjectDeletedFromSceneCallback',
        'RuntimeObject',
      ],
      gdjsEvtToolsAllowedProperties: ['object'],
      runtimeSceneAllowedProperties: ['__allStickers'],
      javaScriptObjectAllowedProperties: [
        // Extend a behavior with JavaScript:
        'getPrototypeOf',
      ],
    },
    ObjectStack: {
      gdjsAllowedProperties: [
        'registerObjectDeletedFromSceneCallback',
        'RuntimeObject',
      ],
      gdjsEvtToolsAllowedProperties: ['object'],
      runtimeSceneAllowedProperties: [
        '__allObjectStacks',
        '__objectStacks_allUsedObjects',
      ],
      javaScriptObjectAllowedProperties: [],
    },
    ReadPixels: {
      gdjsAllowedProperties: ['_readPixels'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    LinkTools: {
      gdjsAllowedProperties: ['LinksManager'],
      gdjsEvtToolsAllowedProperties: ['object'],
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
    YandexGamesSDK: {
      gdjsAllowedProperties: ['_YandexGamesSDK'],
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
    Compressor: {
      gdjsAllowedProperties: ['_pakoTools'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    DiscordRichPresence: {
      gdjsAllowedProperties: [],
      gdjsEvtToolsAllowedProperties: ['discordRP'],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    VoiceRecognition: {
      gdjsAllowedProperties: ['_extensionVoiceRecognition'],
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
