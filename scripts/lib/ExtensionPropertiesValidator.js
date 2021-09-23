const {
  extensionsAllowedProperties,
} = require('./ExtensionsBestPracticesExceptions.js');

/** @typedef {import('../types.js').ExtensionAllowedProperties} ExtensionAllowedProperties */
/** @typedef {import('../types.js').DisallowedPropertyError} DisallowedPropertyError */

/** @type {ExtensionAllowedProperties} */
const emptyExtensionAllowedProperties = {
  gdjsEvtToolsAllowedProperties: [],
  gdjsAllowedProperties: [],
  runtimeSceneAllowedProperties: [],
  javaScriptObjectAllowedProperties: [],
};

/**
 * @param {Set<string>} allowedProperties
 * @param {Set<string>} properties
 */
const findDisallowedProperties = (allowedProperties, properties) => {
  return [...properties].filter((property) => !allowedProperties.has(property));
};

/**
 * Check the extension for any properties that are not on the allow list.
 * @param {Object} parsedExtensionJson
 * @returns {DisallowedPropertyError[]}
 */
const checkExtensionForDisallowedProperties = (parsedExtensionJson) => {
  // @ts-ignore
  const name = parsedExtensionJson.name;
  const extensionJsonString = JSON.stringify(parsedExtensionJson);

  /** @type {ExtensionAllowedProperties} */
  const extensionSpecificAllowance =
    extensionsAllowedProperties.extensionSpecificAllowance[name] ||
    emptyExtensionAllowedProperties;
  const anyExtensionAllowance =
    extensionsAllowedProperties.anyExtensionAllowance;

  const gdjsAllowedProperties = new Set([
    ...anyExtensionAllowance.gdjsAllowedProperties,
    ...extensionSpecificAllowance.gdjsAllowedProperties,
  ]);
  const gdjsEvtToolsAllowedProperties = new Set([
    ...anyExtensionAllowance.gdjsEvtToolsAllowedProperties,
    ...extensionSpecificAllowance.gdjsEvtToolsAllowedProperties,
  ]);
  const runtimeSceneAllowedProperties = new Set([
    ...anyExtensionAllowance.runtimeSceneAllowedProperties,
    ...extensionSpecificAllowance.runtimeSceneAllowedProperties,
  ]);
  const javaScriptObjectAllowedProperties = new Set([
    ...anyExtensionAllowance.javaScriptObjectAllowedProperties,
    ...extensionSpecificAllowance.javaScriptObjectAllowedProperties,
  ]);

  /** @type {DisallowedPropertyError[]} */
  const disallowedPropertyErrors = [];

  {
    const gdjsPropertiesRegex = /gdjs\.\s*(\w+)/g;
    const matches = [...extensionJsonString.matchAll(gdjsPropertiesRegex)];
    const properties = new Set(matches.map((match) => match[1]));
    findDisallowedProperties(gdjsAllowedProperties, properties).forEach(
      (disallowedProperty) => {
        disallowedPropertyErrors.push({
          allowedProperties: Array.from(gdjsAllowedProperties),
          disallowedProperty: disallowedProperty,
          objectName: 'gdjs',
        });
      }
    );
  }
  {
    const gdjsEvtToolsPropertiesRegex = /gdjs\.\s*evtTools\.\s*(\w+)/g;
    const matches = [
      ...extensionJsonString.matchAll(gdjsEvtToolsPropertiesRegex),
    ];
    const properties = new Set(matches.map((match) => match[1]));
    findDisallowedProperties(gdjsEvtToolsAllowedProperties, properties).forEach(
      (disallowedProperty) => {
        disallowedPropertyErrors.push({
          allowedProperties: Array.from(gdjsEvtToolsAllowedProperties),
          disallowedProperty: disallowedProperty,
          objectName: 'gdjs.evtTools',
        });
      }
    );
  }
  {
    const runtimeScenePropertiesRegex = /runtimeScene\.\s*(\w+)/g;
    const matches = [
      ...extensionJsonString.matchAll(runtimeScenePropertiesRegex),
    ];
    const properties = new Set(matches.map((match) => match[1]));
    findDisallowedProperties(runtimeSceneAllowedProperties, properties).forEach(
      (disallowedProperty) => {
        disallowedPropertyErrors.push({
          allowedProperties: Array.from(runtimeSceneAllowedProperties),
          disallowedProperty: disallowedProperty,
          objectName: 'runtimeScene',
        });
      }
    );
  }
  {
    const javaScriptObjectPropertiesRegex = /\s+Object\.\s*([a-z]\w+)/g;
    const matches = [
      ...extensionJsonString.matchAll(javaScriptObjectPropertiesRegex),
    ];
    const properties = new Set(matches.map((match) => match[1]));
    findDisallowedProperties(
      javaScriptObjectAllowedProperties,
      properties
    ).forEach((disallowedProperty) => {
      disallowedPropertyErrors.push({
        allowedProperties: Array.from(javaScriptObjectAllowedProperties),
        disallowedProperty: disallowedProperty,
        objectName: 'Object',
      });
    });
  }

  return disallowedPropertyErrors;
};

module.exports = {
  checkExtensionForDisallowedProperties,
};
