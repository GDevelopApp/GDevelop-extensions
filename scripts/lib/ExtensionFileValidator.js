const { parse: parsePath } = require('path');
const { isValidExtensionName } = require('./ExtensionNameValidator');

/** @typedef {import("../types").Error} Error */

/**
 * Check that a JSON file of the extensions folder is a GDevelop extension, named after the extension.
 * These checks must pass before running the best practices rules, which expect an extension.
 * @param {string} filename The name of the file, for example `Flash.json`.
 * @param {any} content The parsed JSON content of the file.
 * @returns {Error[]}
 */
function validateExtensionFile(filename, content) {
  /** @type {Error[]} */
  const errors = [];

  const { name: filenameWithoutExtension } = parsePath(filename);
  if (!isValidExtensionName(filenameWithoutExtension)) {
    errors.push({
      message: `[File name]: The file name "${filename}" is invalid. It should only contain latin upper- and lowercase characters and numbers, start with an uppercase character, and end with ".json".`,
    });
  }

  if (
    typeof content.properties === 'object' &&
    content.properties !== null &&
    typeof content.properties.name === 'string'
  ) {
    errors.push({
      message: `[Extension file]: This file is a GDevelop project, not an extension. Export the extension itself from its options ("Export extension", then "Export to a file") and add this file instead.`,
    });
    return errors;
  }

  if (
    !Array.isArray(content.eventsFunctions) ||
    !Array.isArray(content.eventsBasedBehaviors) ||
    typeof content.name !== 'string'
  ) {
    errors.push({
      message: `[Extension file]: This JSON file is not a GDevelop extension. Export it again from the extension editor with the latest version of GDevelop, and do not modify it by hand afterwards.`,
    });
    return errors;
  }

  if (content.name !== filenameWithoutExtension) {
    errors.push({
      message: `[File name]: The file is named "${filename}" but the extension is named "${content.name}". Rename the file to "${content.name}.json".`,
    });
  }

  return errors;
}

module.exports = { validateExtensionFile };
