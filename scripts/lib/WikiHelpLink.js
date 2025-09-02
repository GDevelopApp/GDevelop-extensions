// @ts-check

/** @param {string} str */
const toKebabCase = (str) => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // get all lowercase letters that are near to uppercase ones
    .replace(/[\s_]+/g, '-') // replace all spaces and low dash
    .toLowerCase(); // convert to lower case
};

/** @type {Record<string, string>} */
const renamedExtensionNames = {
  AdMob: 'Admob',
  BuiltinFile: 'Storage',
  FileSystem: 'Filesystem',
  TileMap: 'Tilemap',
  BuiltinMouse: 'MouseTouch',
};

/**
 * @param {string} extensionName
 * @returns {string}
 */
const getExtensionFolderName = (extensionName) => {
  return toKebabCase(
    renamedExtensionNames[extensionName] ||
      extensionName.replace(/^Builtin/, '')
  );
};

/**
 * @param {string} extensionName
 * @returns {string}
 */
const getExtensionReferencePagePath = (extensionName) => {
  const folderName = getExtensionFolderName(extensionName);
  const referencePagePath = `/extensions/${folderName}`;
  return referencePagePath;
};

module.exports = {
  getExtensionReferencePagePath,
};
