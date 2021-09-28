const {
  legacyCamelCaseExtensions,
} = require('../ExtensionsValidatorExceptions');

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
 * @param {(message: string)=>void} onError Callback function to log errors with.
 */
function checkPascalCase(name, onError) {
  if (name[0] !== name[0].toUpperCase())
    onError(
      `Internal name '${name}' should begin with an uppercase letter (${
        name[0].toUpperCase() + name.slice(1)
      })!`
    );
}

/** @type {import("./rule").Rule} */
async function validate({
  extension: { name, eventsBasedBehaviors },
  publicEventsFunctions,
  onError,
}) {
  if (legacyCamelCaseExtensions.has(name)) return;
  checkPascalCase(name, onError);
  for (const { name } of publicEventsFunctions) checkPascalCase(name, onError);
  for (const { name } of eventsBasedBehaviors) checkPascalCase(name, onError);
}

/** @type {import("./rule").RuleModule} */
module.exports = {
  name: 'PascalCase for internals names',
  validate,
};
