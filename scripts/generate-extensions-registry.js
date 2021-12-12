const path = require('path');
const fs = require('fs').promises;
const shell = require('shelljs');
const { validateExtension } = require('./lib/ExtensionValidator');
const args = require('minimist')(process.argv.slice(2));

const extensionsBasePath = path.join(__dirname, '..', 'Extensions');
const distBasePath = path.join(__dirname, '..', 'dist');
const distDatabasesPath = path.join(distBasePath, 'extensions-database');
const distExtensionsPath = path.join(distBasePath, 'extensions');
const extensionsBaseUrl = 'https://resources.gdevelop-app.com/extensions';

/** @typedef {import('./types').ExtensionShortHeader} ExtensionShortHeader */
/** @typedef {import('./types').ExtensionsDatabase} ExtensionsDatabase */
/** @typedef {import('./types').ExtensionHeader} ExtensionHeader */
/** @typedef {import('./types').ExtensionWithFilename} ExtensionWithFilename */

/**
 * @param {string} path
 * @param {any} object
 * @returns {Promise<void>}
 */
const writeJSONFile = (path, object) =>
  fs.writeFile(path, JSON.stringify(object, null, 2));

/**
 * Reads all the extension files and parses their JSON.
 * @returns {Promise<ExtensionWithFilename[]>}
 */
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

    let totalErrors = 0;
    let fixableErrors = 0;

    await Promise.all(
      extensionWithFilenames.map(async (extensionWithFilename) => {
        const { extension } = extensionWithFilename;
        const { name } = extension;

        // Check for errors:
        const errors = await validateExtension(extensionWithFilename);
        if (errors.length !== 0) {
          shell.echo(
            `\n❌ ${errors.length} Error${
              errors.length > 1 ? 's' : ''
            } found in extension '${name}':\n`
          );
          errors.forEach((error) => {
            totalErrors++;
            if (error.fix)
              if (args['fix']) {
                totalErrors--;
                error.fix();
              } else fixableErrors++;
            shell.echo(`  ⟶ ❌${error.fix ? ' (🔧)' : ''} ${error.message}`);
          });
        }

        // Override the base extensions when fixing
        if (args['fix'])
          await writeJSONFile(
            path.join(extensionsBasePath, `${name}.json`),
            extension
          );

        // Convert back to the old format for tags.
        if (Array.isArray(extension.tags)) {
          extension.tags = extension.tags.join(',');
        }

        // Generate the headers of the extension
        /** @type {ExtensionShortHeader} */
        const extensionShortHeader = {
          authorIds: extension.authorIds,
          shortDescription: extension.shortDescription,
          extensionNamespace: extension.extensionNamespace,
          fullName: extension.fullName,
          name,
          version: extension.version,
          url: `${extensionsBaseUrl}/${name}.json`,
          headerUrl: `${extensionsBaseUrl}/${name}-header.json`,
          //@ts-ignore Conversion to string done above
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

    if (totalErrors) {
      shell.echo(
        `\n\n❌ ${totalErrors} Error${
          totalErrors > 1 ? 's' : ''
        } found in extensions - please fix ${
          totalErrors > 1 ? 'them' : 'it'
        } before generating the registry.`
      );
      if (!args['disable-exit-code'] && fixableErrors)
        shell.echo(
          `\n\n🔧 ${fixableErrors} Error${
            fixableErrors > 1 ? 's are' : ' is'
          } auto-fixable - pass the argument --fix to fix them automatically.`
        );
      shell.exit(args['disable-exit-code'] ? 0 : 1);
    }

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

    console.log(`✅ Headers and registry files successfully updated`);
  } catch (error) {
    console.error(
      `⚠️ Error while generating headers and registry files:`,
      error
    );
  }
})();
