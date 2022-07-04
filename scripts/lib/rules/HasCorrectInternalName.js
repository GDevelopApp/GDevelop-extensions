const { isValidExtensionName } = require('../ExtensionNameValidator');

/** @type {import("./rule").Rule} */
async function validate({ extension, onError }) {
  if (!isValidExtensionName(extension.name))
    onError(
      `The internal name of the extension ${extension.name} is invalid! It should only contain normal latin upper- and lowercase characters and numbers. The first letter must be an uppercase character.`
    );
}

/** @type {import("./rule").RuleModule} */
module.exports = {
  name: 'Internal name validity',
  validate,
};
