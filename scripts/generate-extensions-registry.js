const path = require('path');
const fs = require('fs').promises;
const shell = require('shelljs');

const extensionsBasePath = path.join(__dirname, '..', 'Extensions');
const distBasePath = path.join(__dirname, '..', 'dist');
const distDatabasesPath = path.join(distBasePath, 'extensions-database');
const distExtensionsPath = path.join(distBasePath, 'extensions');
const extensionsBaseUrl = 'https://resources.gdevelop-app.com/extensions';

/** @typedef {import('./types').ExtensionShortHeader} ExtensionShortHeader */
/** @typedef {import('./types').ExtensionsDatabase} ExtensionsDatabase */
/** @typedef {import('./types').ExtensionHeader} ExtensionHeader */

/**
 * @param {string} path
 * @param {any} object
 * @returns {Promise<void>}
 */
const writeJSONFile = (path, object) =>
  fs.writeFile(path, JSON.stringify(object, null, 2));

const readAllExtensions = async () => {
  const filenames = await fs.readdir(extensionsBasePath);
  const filteredFilenames = filenames.filter((name) => name.endsWith('.json'));

  return await Promise.all(
    filteredFilenames.map(async (filename) => {
      const content = await fs.readFile(
        path.join(extensionsBasePath, filename),
        'utf8'
      );

      return {
        filename,
        extension: JSON.parse(content),
      };
    })
  );
};

(async () => {
  try {
    shell.mkdir('-p', distBasePath);
    shell.mkdir('-p', distExtensionsPath);
    shell.mkdir('-p', distDatabasesPath);

    const extensionWithFilenames = await readAllExtensions();

    const allTagsSet = new Set();

    /** @type {ExtensionShortHeader[]} */
    const extensionShortHeaders = [];

    await Promise.all(
      extensionWithFilenames.map(async (extensionWithFilename) => {
        const { extension, filename } = extensionWithFilename;

        // Convert back to the old format for tags.
        if (Array.isArray(extension.tags)) {
          extension.tags = extension.tags.join(',');
        }

        const { name } = extension;

        // Do some consistency checks.
        if (name.endsWith('Extension')) {
          throw new Error(
            `Extension names should not finish with \"Extension\". Please rename ${name}.`
          );
        }

        if (name + '.json' !== filename) {
          throw new Error(
            `Extension filename should be exactly the name of the extension (with .json extension). Please rename ${name} and/or ${filename}.`
          );
        }

        // Generate the headers of the extension
        /** @type {ExtensionShortHeader} */
        const extensionShortHeader = {
          shortDescription: extension.shortDescription,
          extensionNamespace: extension.extensionNamespace,
          fullName: extension.fullName,
          name,
          version: extension.version,
          url: `${extensionsBaseUrl}/${name}.json`,
          headerUrl: `${extensionsBaseUrl}/${name}-header.json`,
          tags: extension.tags,
          previewIconUrl: extension.previewIconUrl,
          eventsBasedBehaviorsCount: extension.eventsBasedBehaviors.length,
          eventsFunctionsCount: extension.eventsFunctions.length,
        };
        extensionShortHeaders.push(extensionShortHeader);

        /** @type {ExtensionHeader} */
        const extensionHeader = {
          ...extensionShortHeader,
          helpPath: extension.helpPath,
          description: extension.description,
          iconUrl: extension.iconUrl,
        };

        extension.tags.split(',').map(
          /** @param {string} tag */
          (tag) => {
            allTagsSet.add(tag.trim().toLowerCase());
          }
        );

        await writeJSONFile(
          path.join(distExtensionsPath, `${name}.json`),
          extension
        );

        await writeJSONFile(
          path.join(distExtensionsPath, `${name}-header.json`),
          extensionHeader
        );
      })
    );

    // Write the registry
    /** @type {ExtensionsDatabase} */
    const registry = {
      version: '0.0.1',
      allTags: Array.from(allTagsSet),
      extensionShortHeaders,
    };

    await writeJSONFile(
      path.join(distDatabasesPath, 'extensions-database.json'),
      registry
    );

    // Also write the old format registry so that it's found by
    // old GDevelop versions.
    await writeJSONFile(
      path.join(__dirname, '..', 'extensions-registry.json'),
      registry
    );

    console.log(`✅ Headers and registry files successfully updated`);
  } catch (error) {
    console.error(
      `⚠️ Error while generating headers and registry files:`,
      error
    );
  }
})();
