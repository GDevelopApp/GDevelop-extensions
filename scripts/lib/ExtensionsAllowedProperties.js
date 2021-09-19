/** @typedef {import("../types").ExtensionAllowedProperties} ExtensionAllowedProperties */

/**
 * Contains the list of all public API methods or properties
 * that are allowed to be used in JavaScript by extensions.
 *
 * If you add a new extension using JavaScript, try to limit the usage
 * of public APIs to the minimum required, and the usage of any extension
 * specific properties to just one if possible.
 * You can then add a new allowance in this list.
 */
module.exports = {
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
    gdjsEvtToolsAllowedProperties: ['network', 'common'],
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
  },
};
