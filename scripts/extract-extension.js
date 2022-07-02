/** @type {import("jszip")} */
const JSZip = require('./jszip.min.js'); // Don't use node_modules to not have to run npm on the CI
const { isValidExtensionName } = require('./lib/ExtensionNameValidator');
const { createWriteStream } = require('fs');
const { readFile } = require('fs/promises');
const pipeline = require('util').promisify(require('stream').pipeline);

/**
 * Extracts exactly one extension into the community extensions folder from a zip file.
 * @param {string} [zipPath] The path to the zip file to extract.
 * @param {string} [extensionsFolder] The folder with the extensions.
 * @returns {Promise<{error: "too-many-files" | "no-json-found"| "invalid-file-name" | "zip-error", details?: any} | {error?: undefined,extensionName: string}>} the name of the extracted extension if successful, else a generic error code.
 */
exports.extractExtension = async function (
  zipPath = '/tmp/ext.zip',
  extensionsFolder = `${__dirname}/../extensions`
) {
  // Load in the archive with JSZip
  const zip = await JSZip.loadAsync(await readFile(zipPath)).catch((e) => {
    console.warn(`JSZip loading error caught: `, e);
    return null;
  });
  if (zip === null) return { error: 'zip-error' };

  // Find JSON files in the zip top level folder
  const jsonFiles = zip.file(/.*\.json$/);

  // Ensure there is exactly 1 file
  if (jsonFiles.length === 0) return { error: 'no-json-found' };
  if (jsonFiles.length > 1) return { error: 'too-many-files' };
  const [file] = jsonFiles;

  if (file.name.slice(-5) !== '.json') return { error: 'invalid-file-name' };
  const extensionName = file.name.slice(0, -5);

  // Ensure no special characters are in the extension name to prevent relative path
  // name schenanigans with dots that could put the extension in the reviewed folder
  if (!isValidExtensionName(extensionName))
    return { error: 'invalid-file-name' };

  try {
    // Write the extension to the community extensions folder
    await pipeline(
      file.nodeStream(),
      createWriteStream(`${extensionsFolder}/community/${file.name}`)
    );
  } catch (e) {
    console.warn(`JSZip extraction error caught: `, e);
    return { error: 'zip-error' };
  }

  return { extensionName };
};
