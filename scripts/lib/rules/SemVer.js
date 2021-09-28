const { valid: isValidSemver } = require('semver');

/** @type {import("./rule").Rule} */
async function validate({ extension: { version }, onError }) {
  if (!isValidSemver(version))
    onError(
      `Version '${version}' is not a semantic versioning compliant version number!`
    );
}

/** @type {import("./rule").RuleModule} */
module.exports = {
  name: 'Semantic versioning',
  validate,
};
