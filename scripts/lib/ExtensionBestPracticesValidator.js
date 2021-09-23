const { valid: isValidSemver } = require('semver');
const {
  legacyCamelCaseExtensions,
  legacyGetPrefixedExpressionsExtensions,
  lifecycleFunctions,
} = require('./ExtensionsBestPracticesExceptions');

/** @typedef {import("../types").Extension} Extension */
/** @typedef {import("../types").EventsFunction} EventsFunction */

/**
 * Check if an internal name is in "PascalCase".
 * Note that no real PascalCase is enforced, because it does not
 * make sense to use PascalCase for certain names.
 * (MQTT > Mqtt, URLTools > Urltools)
 *
 * Therefore we just check if at least the first character is uppercase
 * to be sure that at least it is not camelCase that is used.
 *
 * @param {string} name The name to check.
 * @param {string[]} errors The errors list to log any error to.
 */
function checkPascalCase(name, errors) {
  if (name[0] !== name[0].toUpperCase())
    errors.push(
      `Internal name '${name}' should begin with an uppercase letter (${
        name[0].toUpperCase() + name.slice(1)
      })!`
    );
}

/**
 * Checks if an object string fields are filled out.
 * @template {string} T
 * @param {Record<T, string>} object The object to check for fields.
 * @param {T[]} fields The fields to check against emptyness.
 * @param {string} sourceName The name of the object to print in the error.
 * @param {string[]} errors The errors list to log any error to.
 */
function checkForFilledOutString(object, fields, sourceName, errors) {
  for (let key of fields) {
    if (object[key].trim().length === 0)
      errors.push(
        `Required field '${key}' of ${sourceName} is not filled out!`
      );
  }
}

/**
 * Checks an extension for best practices.
 * @param {Extension} extension The extension to check.
 * @param {string[]} errors A list where any error is pushed.
 */
function checkExtensionAgainstBestPractices(extension, errors) {
  // Get all the data needed for verification
  const { version, name, eventsBasedBehaviors, eventsFunctions } = extension;
  /**
   * A list of all events functions that have to comply to the best practices (non-lifecycle and non-private) functions
   * @type {EventsFunction[]}
   */
  const allEventsFunctions = eventsFunctions
    .concat(
      eventsBasedBehaviors.flatMap(({ eventsFunctions }) => eventsFunctions)
    )
    .filter(({ name, private: p }) => !lifecycleFunctions.has(name) && !p);

  // Check for semver conformity
  if (!isValidSemver(version))
    errors.push(`Version '${version}' is not a semver compliant version!`);

  // Check if internal names are in PascalCase
  if (!legacyCamelCaseExtensions.has(name)) {
    checkPascalCase(name, errors);
    for (const { name } of allEventsFunctions) checkPascalCase(name, errors);
    for (const { name } of eventsBasedBehaviors) checkPascalCase(name, errors);
  }

  // Check if necessary fields are filled out
  checkForFilledOutString(
    extension,
    ['name', 'fullName', 'description', 'shortDescription'],
    'the extension description',
    errors
  );
  for (const func of allEventsFunctions) {
    if (func.functionType === 'Action' || func.functionType === 'Condition')
      checkForFilledOutString(
        func,
        ['name', 'fullName', 'description', 'functionType', 'sentence'],
        `the function '${func.name}'`,
        errors
      );
  }
  for (const behavior of eventsBasedBehaviors)
    checkForFilledOutString(
      behavior,
      ['name', 'fullName', 'description'],
      `the behavior '${behavior.name}'`,
      errors
    );

  // Check that expressions are not prefixed with 'Get'
  for (const { name, functionType } of allEventsFunctions) {
    if (
      (functionType === 'Expression' || functionType === 'StringExpression') &&
      name.startsWith('Get') &&
      !legacyGetPrefixedExpressionsExtensions.has(extension.name)
    )
      errors.push(`Expression '${name}' is using prohibited 'Get' prefix!`);
  }
}

module.exports = {
  checkExtensionAgainstBestPractices,
};
