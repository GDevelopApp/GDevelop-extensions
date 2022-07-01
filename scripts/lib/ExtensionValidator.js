const { lifecycleFunctions } = require('./ExtensionsValidatorExceptions');
const { readdir } = require('fs').promises;
const { join, extname } = require('path');

/** @typedef {import("../types").ExtensionWithProperFileInfo} ExtensionWithProperFileInfo */
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
 * @returns {Promise<Error[]>}
 */
async function validateExtension(extensionWithFileInfo) {
  /** @type {Error[]} */
  const errors = [];
  const { eventsBasedBehaviors, eventsFunctions } =
    extensionWithFileInfo.extension;

  /**
   * A list of all events functions of the extension.
   * @type {EventsFunction[]}
   */
  const allEventsFunctions = eventsFunctions.concat(
    eventsBasedBehaviors.flatMap(({ eventsFunctions }) => eventsFunctions)
  );

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

module.exports = {
  loadRules,
  validateExtension,
};
