const { readFile } = require('fs/promises');
const { isValidExtensionName } = require('./lib/ExtensionNameValidator');
const { validateExtension } = require('./lib/ExtensionValidator');

/**
 * A function used by the CI to check for issues in a single extension.
 * @param {string} extensionName
 * @param {{extensionsFolder?: string, preliminaryCheck?: boolean}} [options]
 * @returns {Promise<{code: "invalid-file-name" | "not-found" | "duplicated" | "invalid-json" | "success"} | {code: "rule-break", errors: string[]}>}
 */
exports.verifyExtension = async function (extensionName, options) {
  const {
    extensionsFolder = `${__dirname}/../extensions`,
    preliminaryCheck = false,
  } = options || {};
  // Make sure the name is valid, as dots are not allowed in the name
  // and could be used to do relative path shenanigans that could result in skipping automatic checks.
  if (!isValidExtensionName(extensionName))
    return { code: 'invalid-file-name' };

  try {
    const [community, reviewed] = await Promise.all([
      // Added try-catch block for better async error handling
      readFile(`${extensionsFolder}/community/${extensionName}.json`).catch(
        () => null
      ),
      readFile(`${extensionsFolder}/reviewed/${extensionName}.json`).catch(
        () => null
      ),
    ]);
    if (!community && !reviewed) return { code: 'not-found' };
    if (community && reviewed) return { code: 'duplicated' };
    //@ts-ignore We know this cannot be null thanks to the checks done just before
    /** @type {string} */ const file = (
      community ? community : reviewed
    ).toString();
    /** @type {any} */
    let extension;
    try {
      extension = JSON.parse(file);
    } catch {
      return { code: 'invalid-json' };
    }
    const validationDetails = await validateExtension(
      {
        state: 'success',
        extension,
        tier: community ? 'community' : 'reviewed',
        filename: `${extensionName}.json`,
      },
      preliminaryCheck
    );
    if (validationDetails.length > 0)
      return {
        code: 'rule-break',
        errors: validationDetails.map(({ message }) => message),
      };
    return { code: 'success' };
  } catch (error) {
    // General error catch for any unhandled async errors in the process
    console.error(`Error verifying extension: ${extensionName}`, error);
    return { code: 'not-found' }; // Return a default error code, you could also return something more specific based on the context
  }
};
