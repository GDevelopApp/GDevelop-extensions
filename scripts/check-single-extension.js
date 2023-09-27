const { readFile } = require('fs/promises');
const { isValidExtensionName } = require('./lib/ExtensionNameValidator');
const { validateExtension } = require('./lib/ExtensionValidator');

/**
 * A function used by the CI to check for issues in a single extension.
 * @param {string} extensionName
 * @param {{extensionsFolder?: string, preliminaryCheck?: boolean}} [options]
 * @returns {Promise<{code: "invalid-file-name" | "not-found" | "duplicated" | "invalid-json" | "unknown-json-contents" | "gdevelop-project-file" | "success"} | {code: "rule-break", errors: string[]}>}
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

  const [community, reviewed] = await Promise.all([
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

  // Basic check to see if it is a GDevelop project
  if (
    typeof extension.properties === 'object' &&
    typeof extension.properties.name === 'string'
  ) {
    return { code: 'gdevelop-project-file' };
  }

  // Basic check to see if it is a GDevelop extension
  if (
    !(
      Array.isArray(extension.eventsFunctions) &&
      Array.isArray(extension.eventsBasedBehaviors) &&
      typeof extension.name === 'string'
    )
  ) {
    return { code: 'unknown-json-contents' };
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
};
