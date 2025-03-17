const path = require('path');
const fs = require('fs');

const rootPath = path.join(__dirname, '..');
const translationsPath = path.join(rootPath, '.translations');
const enPath = path.join(translationsPath, 'en');
const reviewedExtensionsPath = path.join(rootPath, 'extensions', 'reviewed');

// Ensure translations folder exists
if (!fs.existsSync(translationsPath)) {
  fs.mkdirSync(translationsPath);
}

if (!fs.existsSync(enPath)) {
  fs.mkdirSync(enPath);
}

try {
  // Clean existing English messages catalog, if any
  const enMessagesJsPath = path.join(enPath, 'messages.js');
  if (fs.existsSync(enMessagesJsPath)) {
    console.info(
      `ℹ️ Removing ${enMessagesJsPath} as "en" should not have any translations ("pot" file)`
    );
    fs.rmSync(enMessagesJsPath);
  }
  const enMessagesPotPath = path.join(
    enPath,
    'reviewed-extensions-messages.pot'
  );
  if (fs.existsSync(enMessagesPotPath)) {
    console.info(
      `ℹ️ Removing ${enMessagesPotPath} as "en" should not have any translations ("pot" file)`
    );
    fs.rmSync(enMessagesPotPath);
  }

  // Step 1: Find JSON files in 'reviewed' folder.
  console.log("ℹ️ Listing all JSON files in the 'reviewed' folder...");
  const jsonFiles = fs
    .readdirSync(reviewedExtensionsPath)
    .filter((file) => file.endsWith('.json'));

  console.log('ℹ️ Reading extension files...');
  let potContent = 'msgid ""\nmsgstr ""\n\n';
  const translationsMap = new Map();

  /**
   * @param {{[key: string]: any}} data
   * @param {string} filePath
   */
  const getAndAddExtensionPropsForFile = (data, filePath) => {
    ['fullName', 'shortDescription', 'category'].forEach((key) => {
      if (data[key]) {
        /** @type {string[]} */
        const values = Array.isArray(data[key]) ? data[key] : [data[key]];
        values.forEach((value) => {
          if (value.trim()) {
            if (!translationsMap.has(value)) {
              translationsMap.set(value, []);
            }
            translationsMap.get(value).push(`${filePath}`);
          }
        });
      }
    });
  };

  /**
   * @param {{[key: string]: any}} data
   * @param {string} filePath
   */
  const getAndAddPropertyDescriptorsPropsForFile = (data, filePath) => {
    /** @type {{[key: string]: any}[]} */
    const propertyDescriptors = data.propertyDescriptors;

    if (Array.isArray(propertyDescriptors)) {
      propertyDescriptors.forEach((descriptor) => {
        ['label', 'description', 'group'].forEach((key) => {
          if (descriptor[key]) {
            const value = descriptor[key].trim();
            if (value) {
              if (!translationsMap.has(value)) {
                translationsMap.set(value, []);
              }
              translationsMap.get(value).push(`${filePath}`);
            }
          }
        });
      });
    }
  };

  /**
   * @param {{[key: string]: any}} data
   * @param {string} filePath
   */
  const getAndAddEventsFunctionsPropsForFile = (data, filePath) => {
    /** @type {{[key: string]: any}[]} */
    const eventsFunctions = data.eventsFunctions;

    if (Array.isArray(eventsFunctions)) {
      eventsFunctions.forEach((func) => {
        ['description', 'fullName', 'sentence'].forEach((key) => {
          if (func[key]) {
            const value = func[key].trim();
            if (value) {
              if (!translationsMap.has(value)) {
                translationsMap.set(value, []);
              }
              translationsMap.get(value).push(`${filePath}`);
            }
          }
        });

        const parameters = func.parameters;
        if (Array.isArray(parameters)) {
          parameters.forEach((param) => {
            ['description', 'longDescription'].forEach((key) => {
              if (param[key]) {
                const value = param[key].trim();
                if (value) {
                  if (!translationsMap.has(value)) {
                    translationsMap.set(value, []);
                  }
                  translationsMap.get(value).push(`${filePath}`);
                }
              }
            });
          });
        }
      });
    }
  };

  /**
   * @param {{[key: string]: any}} data
   * @param {string} filePath
   */
  const getAndAddEventsBasedBehaviorsPropsForFile = (data, filePath) => {
    /** @type {{[key: string]: any}[]} */
    const eventsBasedBehaviors = data.eventsBasedBehaviors;

    if (Array.isArray(eventsBasedBehaviors)) {
      eventsBasedBehaviors.forEach((func) => {
        ['description', 'fullName'].forEach((key) => {
          if (func[key]) {
            const value = func[key].trim();
            if (value) {
              if (!translationsMap.has(value)) {
                translationsMap.set(value, []);
              }
              translationsMap.get(value).push(`${filePath}`);
            }
          }
        });

        getAndAddPropertyDescriptorsPropsForFile(func, filePath);

        const behaviorEventsFunctions = func.eventsFunctions;
        if (Array.isArray(behaviorEventsFunctions)) {
          behaviorEventsFunctions.forEach((func) => {
            getAndAddEventsFunctionsPropsForFile(func, filePath);
          });
        }
      });
    }
  };

  /**
   * @param {{[key: string]: any}} data
   * @param {string} filePath
   */
  const getAndAddEventsBasedObjectsPropsForFile = (data, filePath) => {
    /** @type {{[key: string]: any}[]} */
    const eventsBasedObjects = data.eventsBasedObjects;

    if (Array.isArray(eventsBasedObjects)) {
      eventsBasedObjects.forEach((func) => {
        ['description', 'fullName'].forEach((key) => {
          if (func[key]) {
            const value = func[key].trim();
            if (value) {
              if (!translationsMap.has(value)) {
                translationsMap.set(value, []);
              }
              translationsMap.get(value).push(`${filePath}`);
            }
          }
        });

        getAndAddPropertyDescriptorsPropsForFile(func, filePath);

        const behaviorEventsFunctions = func.eventsFunctions;
        if (Array.isArray(behaviorEventsFunctions)) {
          behaviorEventsFunctions.forEach((func) => {
            getAndAddEventsFunctionsPropsForFile(func, filePath);
          });
        }
      });
    }
  };

  jsonFiles.forEach((file) => {
    const filePath = path.join(reviewedExtensionsPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    getAndAddExtensionPropsForFile(data, filePath);
    getAndAddEventsFunctionsPropsForFile(data, filePath);
    getAndAddEventsBasedBehaviorsPropsForFile(data, filePath);
    getAndAddEventsBasedObjectsPropsForFile(data, filePath);
  });

  console.log('ℹ️ Creating .POT content...');
  // Step 3: Build POT content
  translationsMap.forEach((files, value) => {
    const uniqueFiles = [...new Set(files)];
    potContent += uniqueFiles.map((file) => `#: ${file}`).join('\n') + '\n';

    // Handle multi-line strings
    const escapedValue = value
      .replace(/\\/g, '\\\\') // Escape existing backslashes
      .replace(/"/g, '\\"'); // Escape double quotes

    /** @type {string[]} */
    let lines = escapedValue.split('\n');
    lines = lines.filter((line) => line.trim());
    potContent +=
      'msgid ' +
      lines
        .map((line, index) =>
          index === lines.length - 1 ? `"${line}"` : `"${line}\\n"`
        )
        .join('\n') +
      '\n';
    potContent += 'msgstr ""\n\n';
  });

  console.log('ℹ️ Creating .POT file...');
  // Step 4: Write to .POT file
  const potFilePath = path.join(enPath, 'reviewed-extensions-messages.pot');
  fs.writeFileSync(potFilePath, potContent);
  console.log(
    "ℹ️ Translation file 'reviewed-extensions-messages.pot' generated and ready for translation."
  );
} catch (error) {
  console.error('❌ Error occurred while extracting translations:', error);
  throw error;
}
