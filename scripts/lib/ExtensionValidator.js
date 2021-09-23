const {
  checkExtensionForDisallowedProperties,
} = require('./ExtensionPropertiesValidator.js');
const {
  checkExtensionAgainstBestPractices,
} = require('./ExtensionBestPracticesValidator');
const { inspect } = require('util');

/** @typedef {import("../types").ExtensionWithFilename} ExtensionWithFilename */

/**
 * Check the extension for any properties that are not on the allow list.
 * @param {ExtensionWithFilename} extensionWithFilename
 * @returns {string[]}
 */
function validateExtension(extensionWithFilename) {
  /** @type {string[]} */
  const errors = [];
  const { extension, filename } = extensionWithFilename;
  /** @type {string} */
  const name = extension.name;

  // Do some base consistency checks.
  if (name.endsWith('Extension')) {
    errors.push(
      `Extension names should not finish with \"Extension\". Please rename '${name}' to '${name.slice(
        0,
        -9
      )}'.`
    );
  }

  const expectedFilename = name + '.json';
  if (expectedFilename !== filename) {
    errors.push(
      `Extension filename should be exactly the name of the extension (with .json extension). Please rename '${filename}' to '${expectedFilename}'.`
    );
  }

  // Check for disallowed properties
  const disallowedPropertyErrors =
    checkExtensionForDisallowedProperties(extension);
  if (disallowedPropertyErrors.length > 0) {
    const reducedError = disallowedPropertyErrors
      .reduce(
        (accumulator, current) =>
          accumulator + inspect(current, undefined, undefined, true) + '\n',
        `Found disallowed properties in extension '${name}':\n`
      )
      // Remove the last \n
      .slice(0, -1);
    errors.push(reducedError);
  }

  // Check against extension best practices
  checkExtensionAgainstBestPractices(extension, errors);

  return errors;
}

module.exports = {
  validateExtension,
};
