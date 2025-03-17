const fs = require('fs');
const path = require('path');
const ISO6391 = require('iso-639-1').default;

const rootPath = path.join(__dirname, '../..');
const translationsPath = path.join(rootPath, '.translations');

/**
 * @param {string} langLongCode
 * @returns {string}
 */
const getShortestCode = (langLongCode) => {
  if (langLongCode === 'pt_BR') return langLongCode;

  const langParts = langLongCode.split('_');
  return langParts[0];
};

/**
 * @returns {Promise<string[]>}
 */
const getLocales = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(translationsPath, (error, locales) => {
      if (error) {
        return reject(error);
      }

      return resolve(
        locales
          .filter((name) => name !== '.DS_Store')
          .filter((name) => name !== 'LocalesMetadata.js')
          .filter((name) => name !== '_build')
          // ensure it's a directory
          .filter((name) => {
            const fullPath = path.join(translationsPath, name);
            return fs.statSync(fullPath).isDirectory();
          })
      );
    });
  });
};

/**
 * @param {string} localeName
 * @returns {string[]}
 */
const getLocaleSourceCatalogFiles = (localeName) => {
  if (localeName === 'en') return ['reviewed-extensions-messages.pot'];
  return ['reviewed-extensions-messages.po'];
};

/**
 * @param {string} localeName
 * @returns {string}
 */
const getLocalePath = (localeName) => {
  return path.join(translationsPath, localeName);
};

/**
 * @param {string} localeName
 * @returns {string}
 */
const getLocaleCatalogPath = (localeName) => {
  return path.join(getLocalePath(localeName), 'messages.po');
};

/**
 * @param {string} localeName
 * @returns {string}
 */
const getLocaleCompiledCatalogPath = (localeName) => {
  return path.join(getLocalePath(localeName), 'messages.js');
};

const getLocaleMetadataPath = () => {
  return path.join(translationsPath, 'LocalesMetadata.js');
};

/**
 * @param {string} langCode
 * @returns {string}
 */
const getLocaleName = (langCode) => {
  if (langCode === 'pt_BR') {
    return 'Brazilian Portuguese';
  } else if (langCode === 'zh_CN') {
    return 'Chinese Simplified';
  } else if (langCode === 'zh_TW') {
    return 'Chinese Traditional';
  } else if (langCode === 'sr_CS') {
    return 'Serbian (Latin)';
  } else if (langCode === 'fil_PH') {
    return 'Filipino';
  } else if (langCode === 'pseudo_LOCALE') {
    return 'for development only';
  }

  return ISO6391.getName(getShortestCode(langCode));
};

/**
 *
 * @param {string} langCode
 * @returns {string}
 */
const getLocaleNativeName = (langCode) => {
  if (langCode === 'pt_BR') {
    return 'Português brasileiro';
  } else if (langCode === 'zh_CN') {
    return '简化字';
  } else if (langCode === 'zh_TW') {
    return '正體字';
  } else if (langCode === 'sr_CS') {
    return 'srpski';
  } else if (langCode === 'fil_PH') {
    return 'Mga Filipino';
  } else if (langCode === 'pseudo_LOCALE') {
    return 'Pseudolocalization';
  }

  return ISO6391.getNativeName(getShortestCode(langCode));
};

module.exports = {
  getLocales,
  getLocalePath,
  getLocaleSourceCatalogFiles,
  getLocaleCatalogPath,
  getLocaleCompiledCatalogPath,
  getLocaleMetadataPath,
  getLocaleName,
  getLocaleNativeName,
};
