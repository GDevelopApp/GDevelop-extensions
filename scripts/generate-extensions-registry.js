const path = require('path');
const fs = require('fs').promises;
const shell = require('shelljs');
const {
  validateExtension,
  validateNoDuplicates,
} = require('./lib/ExtensionValidator');
const args = require('minimist')(process.argv.slice(2));

/** @typedef {import('./types').ExtensionShortHeader} ExtensionShortHeader */
/** @typedef {import('./types').BehaviorShortHeader} BehaviorShortHeader */
/** @typedef {import('./types').ObjectShortHeader} ObjectShortHeader */
/** @typedef {import('./types').RegistryItem} RegistryItem */
/** @typedef {import('./types').ExtensionsDatabase} ExtensionsDatabase */
/** @typedef {import('./types').ExtensionHeader} ExtensionHeader */
/** @typedef {import('./types').ExtensionWithFileInfo} ExtensionWithFileInfo */
/** @typedef {import('./types').ExtensionTier} ExtensionTier */
/** @typedef {import('./types').Extension} Extension */
/** @typedef {import('./types').EventsBasedBehavior} EventsBasedBehavior */

const extensionsBasePath = path.join(__dirname, '..', 'extensions');
const reviewedExtensionsTier = 'reviewed';
const communityExtensionsTier = 'community';
const distBasePath = path.join(__dirname, '..', 'dist');
const distDatabasesPath = path.join(distBasePath, 'extensions-database');
const distExtensionsPath = path.join(distBasePath, 'extensions');
const extensionsBaseUrl = 'https://resources.gdevelop-app.com/extensions';
const extensionsWithoutValidation = new Set(['WithThreeJS']);
const extensionsRequiring3DPhysics = new Set([
  'AdvancedJump3D',
  'PhysicsCharacter3DAnimator',
  'PhysicsCharacter3DKeyMapper',
  'PhysicsEllipseMovement3D',
]);

/**
 * @param {string} path
 * @param {any} object
 * @returns {Promise<void>}
 */
const writeJSONFile = (path, object) =>
  fs.writeFile(path, JSON.stringify(object, null, 2));

/**
 * Reads the extension files and parses their JSON.
 * @param {string} folderPath
 * @param {ExtensionTier} tier
 * @returns {Promise<ExtensionWithFileInfo[]>}
 */
const readExtensionsFromFolder = async (folderPath, tier) => {
  const filenames = await fs.readdir(folderPath);
  const filteredFilenames = filenames.filter((name) => name.endsWith('.json'));

  return await Promise.all(
    /** @returns {Promise<ExtensionWithFileInfo>} */
    filteredFilenames.map(async (filename) => {
      const content = await fs.readFile(
        path.join(folderPath, filename),
        'utf8'
      );

      try {
        const extension = JSON.parse(content);
        /** @type {ExtensionWithFileInfo} */
        const extensionWithFileInfo = {
          state: 'success',
          filename,
          tier,
          extension,
        };

        return extensionWithFileInfo;
      } catch (error) {
        /** @type {ExtensionWithFileInfo} */
        const extensionWithErroredFileInfo = {
          state: 'error',
          filename,
          tier,
          // @ts-ignore
          error,
        };

        return extensionWithErroredFileInfo;
      }
    })
  );
};

/**
 * Find all required behaviors including transitive ones.
 * @param {Extension} extension
 * @param {EventsBasedBehavior} behavior
 * @param {Array<string>} requiredBehaviorTypes
 */
const findAllRequiredBehaviorTypes = (
  extension,
  behavior,
  requiredBehaviorTypes = []
) => {
  for (const propertyDescriptor of behavior.propertyDescriptors) {
    if (propertyDescriptor.type == 'Behavior') {
      const requiredBehaviorType = propertyDescriptor.extraInformation[0];
      const extensionPrefix = extension.name + '::';
      if (!requiredBehaviorTypes.includes(requiredBehaviorType)) {
        requiredBehaviorTypes.push(requiredBehaviorType);

        if (requiredBehaviorType.startsWith(extensionPrefix)) {
          const behaviorName = requiredBehaviorType.substring(
            extensionPrefix.length
          );
          const requiredBehavior = extension.eventsBasedBehaviors.find(
            (behavior) => behavior.name === behaviorName
          );
          if (!requiredBehavior) {
            throw new Error(
              'Required behavior: ' +
                requiredBehaviorTypes +
                ' is missing in the extension.'
            );
          }
          findAllRequiredBehaviorTypes(
            extension,
            requiredBehavior,
            requiredBehaviorTypes
          );
        }
      }
    }
  }
  return requiredBehaviorTypes;
};

(async () => {
  try {
    shell.mkdir('-p', distBasePath);
    shell.mkdir('-p', distExtensionsPath);
    shell.mkdir('-p', distDatabasesPath);

    const reviewedExtensionWithFileInfos = await readExtensionsFromFolder(
      path.join(extensionsBasePath, reviewedExtensionsTier),
      reviewedExtensionsTier
    );
    const communityExtensionWithFileInfos = await readExtensionsFromFolder(
      path.join(extensionsBasePath, communityExtensionsTier),
      communityExtensionsTier
    );
    const allExtensionWithFileInfos = [
      ...reviewedExtensionWithFileInfos,
      ...communityExtensionWithFileInfos,
    ];

    const allTagsSet = new Set();
    const allCategoriesSet = new Set();

    /** @type {ExtensionShortHeader[]} */
    const extensionShortHeaders = [];
    /** @type {Array<BehaviorShortHeader>} */
    const behaviorShortHeaders = [];
    /** @type {Array<ObjectShortHeader>} */
    const objectShortHeaders = [];

    let totalErrors = 0;
    let fixableErrors = 0;

    const errors = validateNoDuplicates(allExtensionWithFileInfos);
    errors.forEach((error) => {
      totalErrors++;
      shell.echo(`❌ ${error.message}`);
    });

    await Promise.all(
      allExtensionWithFileInfos.map(async (extensionWithFileInfo) => {
        if (extensionWithFileInfo.state === 'error') {
          const error = extensionWithFileInfo.error;
          shell.echo(
            `\n❌ Unable to open extension in file ${extensionWithFileInfo.filename}: ${error.message}\n`
          );
          totalErrors++;
          return;
        }

        const { extension, tier } = extensionWithFileInfo;
        const { name } = extension;

        // Check for errors:
        if (extensionsWithoutValidation.has(name)) {
          shell.echo(`ℹ️ Ignoring validation for extension "${name}".`);
        } else {
          const errors = await validateExtension(extensionWithFileInfo);
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
        }

        // Override the base extensions when fixing
        if (args['fix'])
          await writeJSONFile(
            path.join(extensionsBasePath, tier, `${name}.json`),
            extension
          );

        // Convert back to the old format for tags.
        if (Array.isArray(extension.tags)) {
          extension.tags = extension.tags.join(',');
        }

        // Generate the headers of the extension
        /** @type {RegistryItem} */
        const registryItem = {
          tier,
          authorIds: extension.authorIds,
          extensionNamespace: extension.extensionNamespace,
          fullName: extension.fullName,
          name,
          version: extension.version,
          url: `${extensionsBaseUrl}/${name}.json`,
          headerUrl: `${extensionsBaseUrl}/${name}-header.json`,
          //@ts-ignore Conversion to string done above
          tags: extension.tags,
          category: extension.category || 'General',
          previewIconUrl: extension.previewIconUrl,
        };
        if (extensionsRequiring3DPhysics.has(name)) {
          registryItem.gdevelopVersion = '>=5.5.220';
        }

        /** @type {ExtensionShortHeader} */
        const extensionShortHeader = {
          ...registryItem,
          shortDescription: extension.shortDescription,
          fullName: extension.fullName,
          name,
          eventsBasedBehaviorsCount: extension.eventsBasedBehaviors.length,
          eventsFunctionsCount: extension.eventsFunctions.length,
        };

        extensionShortHeaders.push(extensionShortHeader);

        /** @type {ExtensionHeader} */
        const extensionHeader = {
          ...extensionShortHeader,
          helpPath: extension.helpPath,
          description: Array.isArray(extension.description)
            ? extension.description.join('\n')
            : extension.description,
          iconUrl: extension.iconUrl,
        };

        /** @type {Array<BehaviorShortHeader>} */
        behaviorShortHeaders.push.apply(
          behaviorShortHeaders,
          extension.eventsBasedBehaviors
            .map((behavior) =>
              behavior.private
                ? null
                : {
                    ...registryItem,
                    extensionName: name,
                    name: behavior.name,
                    fullName: behavior.fullName,
                    description: behavior.description,
                    objectType: behavior.objectType,
                    allRequiredBehaviorTypes: findAllRequiredBehaviorTypes(
                      extension,
                      behavior
                    ),
                  }
            )
            .filter(Boolean)
        );

        /** @type {Array<ObjectShortHeader>} */
        objectShortHeaders.push.apply(
          objectShortHeaders,
          extension.eventsBasedObjects
            ? extension.eventsBasedObjects.map((object) => ({
                ...registryItem,
                extensionName: name,
                name: object.name,
                fullName: object.fullName,
                description: object.description,
              }))
            : []
        );

        extension.tags.split(',').forEach(
          /** @param {string} tag */
          (tag) => {
            allTagsSet.add(tag.trim().toLowerCase());
          }
        );
        if (extension.category) {
          allCategoriesSet.add(extension.category);
        }

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

    const views = JSON.parse(
      await fs.readFile(path.join(extensionsBasePath, 'views.json'), 'utf8')
    );

    // Write the registry
    /** @type {ExtensionsDatabase} */
    const registry = {
      version: '0.0.1',
      allTags: Array.from(allTagsSet),
      allCategories: Array.from(allCategoriesSet),
      extensionShortHeaders,
      behavior: {
        headers: behaviorShortHeaders,
        views: {
          default: {
            firstIds: views.default.firstBehaviorIds,
          },
        },
      },
      object: {
        headers: objectShortHeaders,
        views: {
          default: {
            firstIds: views.default.firstObjectIds,
          },
        },
      },
      views: {
        default: {
          firstExtensionIds: views.default.firstExtensionIds,
        },
      },
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
    shell.exit(1);
  }
})();
