/** @type {import("./rule").Rule} */
async function validate({ extension: { name }, filename, onError }) {
  // Do some base consistency checks.
  if (name.endsWith('Extension')) {
    onError(
      `Extension names should not finish with \"Extension\". Please rename '${name}' to '${name.slice(
        0,
        -9
      )}'.`
    );
  }

  const expectedFilename = name + '.json';
  if (expectedFilename !== filename) {
    onError(
      `Extension filename should be exactly the name of the extension (with .json extension). Please rename '${filename}' to '${expectedFilename}'.`
    );
  }
}

/** @type {import("./rule").RuleModule} */
module.exports = {
  name: 'Extension name consistency',
  validate,
};
