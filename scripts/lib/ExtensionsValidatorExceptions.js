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
      'evtTools',
      'Variable',
      'RuntimeObject',
    ],
    gdjsEvtToolsAllowedProperties: [
      'network',
      'common',
      // 'object' is not allowed by default because it contains advanced object
      // filtering functions that should be reviewed per extension.
    ],
    runtimeSceneAllowedProperties: ['getVariables', 'getLayer', 'getGame'],
    javaScriptObjectAllowedProperties: ['keys'],
  },
  /** @type {Record<string, ExtensionAllowedProperties>}} */
  extensionSpecificAllowance: {
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
    FlexBox: {
      gdjsAllowedProperties: ['layoutContainers'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: ['assign'],
    },
    MQTT: {
      gdjsAllowedProperties: [],
      gdjsEvtToolsAllowedProperties: ['mqtt'],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [
        'create',
        'defineProperty',
        'assign',
        'prototype',
        'getPrototypeOf',
        'getOwnPropertyNames',
        'setPrototypeOf',
        'getOwnPropertySymbols',
        'getOwnPropertyDescriptor',
        'getOwnPropertyDescriptors',
        'defineProperties',
      ],
    },
    MarchingSquares: {
      gdjsAllowedProperties: ['__marchingSquares'],
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
    TextEntryVirtualKeyboard: {
      gdjsAllowedProperties: ['_extensionMobileKeyboard'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: [],
      javaScriptObjectAllowedProperties: [],
    },
    RenderToSprite: {
      gdjsAllowedProperties: ['_renderToSprite'],
      gdjsEvtToolsAllowedProperties: [],
      runtimeSceneAllowedProperties: ['getRenderer'],
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
      gdjsEvtToolsAllowedProperties: [],
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
      runtimeSceneAllowedProperties: ['__allObjectStacks', '__allUsedObjects'],
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
    YandexGamesSDK: {
      gdjsAllowedProperties: ['_YandexGamesSDK'],
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
