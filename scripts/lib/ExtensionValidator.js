const { lifecycleFunctions } = require('./ExtensionsValidatorExceptions');
const { readdir } = require('fs/promises');
const { join, extname } = require('path');

/** @typedef {import("../types").ExtensionWithFilename} ExtensionWithFilename */
/** @typedef {import("../types").EventsFunction} EventsFunction */
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
 * @param {ExtensionWithFilename} extensionWithFilename
 * @returns {Promise<string[]>}
 */
async function validateExtension(extensionWithFilename) {
  /** @type {string[]} */
  const errors = [];
  const { eventsBasedBehaviors, eventsFunctions } =
    extensionWithFilename.extension;

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
        onError: (message) => errors.push(`[${rule.name}]: ${message}`),
        ...extensionWithFilename,
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
