const {
  legacyGetPrefixedExpressionsExtensions,
} = require('../ExtensionsValidatorExceptions');

/** @type {import("./rule").Rule} */
async function validate({ extension, publicEventsFunctions, onError }) {
  // Check that expressions are not prefixed with 'Get'
  for (const func of publicEventsFunctions) {
    const { name, functionType } = func;
    if (
      (functionType === 'Expression' || functionType === 'StringExpression') &&
      name.startsWith('Get') &&
      !legacyGetPrefixedExpressionsExtensions.has(extension.name)
    )
      onError(`Expression '${name}' is using prohibited 'Get' prefix!`);
  }
}

/** @type {import("./rule").RuleModule} */
module.exports = {
  name: "No 'Get' in expressions",
  validate,
};
