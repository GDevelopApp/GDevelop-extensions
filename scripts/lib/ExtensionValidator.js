const { lifecycleFunctions } = require('./ExtensionsValidatorExceptions');
const { readdir } = require('fs').promises;
const { join, extname } = require('path');

/** @typedef {import("../types").ExtensionWithProperFileInfo} ExtensionWithProperFileInfo */
/** @typedef {import("../types").ExtensionWithFileInfo} ExtensionWithFileInfo */
/** @typedef {import("../types").EventsFunction} EventsFunction */
/** @typedef {import("../types").Error} Error */
/** @typedef {import("./rules/rule").RuleModule} RuleModule */

const rulesPath = join(__dirname, 'rules');
/** @type {RuleModule[]} */
const rules = [];
const loadRules = (async function loadRules() {
  for (const ruleFile of await readdir(rulesPath)) {
    if (extname(ruleFile) !== '.js' || ruleFile === '_Template.js') continue;
    /** @type {import("./rules/rule").RuleModule} */
    const rule = require(join(rulesPath, ruleFile));
    rules.push(rule);
  }
})();

/**
 * Check the extension for any properties that are not on the allow list.
 * @param {ExtensionWithProperFileInfo} extensionWithFileInfo
 * @param {boolean} preliminaryCheck True if we are to skip some checks meant for the reviewer, not the extension creator.
 * @returns {Promise<Error[]>}
 */
async function validateExtension(
  extensionWithFileInfo,
  preliminaryCheck = false
) {
  /** @type {Error[]} */
  const errors = [];
  const { eventsBasedBehaviors, eventsBasedObjects, eventsFunctions } =
    extensionWithFileInfo.extension;

  const behaviorFunctions = eventsBasedBehaviors.flatMap(
    ({ eventsFunctions }) => eventsFunctions
  );
  const objectFunctions = eventsBasedObjects
    ? eventsBasedObjects.flatMap(({ eventsFunctions }) => eventsFunctions)
    : [];
  /**
   * A list of all events functions of the extension.
   * @type {EventsFunction[]}
   */
  const allEventsFunctions = [];
  Array.prototype.push.apply(allEventsFunctions, eventsFunctions);
  Array.prototype.push.apply(allEventsFunctions, behaviorFunctions);
  Array.prototype.push.apply(allEventsFunctions, objectFunctions);

  /**
   * A list of all events functions that will be used by extension users (non-lifecycle and non-private functions).
   * @type {EventsFunction[]}
   */
  const publicEventsFunctions = allEventsFunctions.filter(
    ({ name, private: p }) => !lifecycleFunctions.has(name) && !p
  );

  // Ensure the rules are loaded before starting verification
  if (rules.length === 0) await loadRules;

  const promises = [];
  for (const rule of rules) {
    if (preliminaryCheck && rule.preliminary) continue;
    promises.push(
      rule.validate({
        allEventsFunctions,
        publicEventsFunctions,
        onError: (message, fix) =>
          errors.push({
            message: `[${rule.name}]: ${message}`,
            fix,
          }),
        ...extensionWithFileInfo,
      })
    );
  }

  await Promise.all(promises);

  return errors;
}

/**
 * Check there are no duplicates in extension names.
 * @param {ExtensionWithFileInfo[]} extensionWithFileInfos
 * @returns {Error[]}
 */
function validateNoDuplicates(extensionWithFileInfos) {
  /** @type {Error[]} */
  const errors = [];

  /** @type {Set<string>} */
  const nameAlreadyFound = new Set();
  extensionWithFileInfos.forEach((extensionWithFileInfo) => {
    if (extensionWithFileInfo.state === 'success') {
      const { name } = extensionWithFileInfo.extension;
      if (nameAlreadyFound.has(name)) {
        errors.push({
          message: `[${name}]: There are multiple extensions using this name.`,
        });
      } else {
        nameAlreadyFound.add(name);
      }
    }
  });

  return errors;
}

module.exports = {
  loadRules,
  validateNoDuplicates,
  validateExtension,
};
