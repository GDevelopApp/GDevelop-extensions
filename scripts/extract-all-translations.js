const path = require('path');
const fs = require('fs');

const rootPath = path.join(__dirname, '..');
const translationsPath = path.join(rootPath, '.translations');
const reviewedExtensionsPath = path.join(rootPath, 'extensions', 'reviewed');

// Ensure translations folder exists
if (!fs.existsSync(translationsPath)) {
  fs.mkdirSync(translationsPath);
}

try {
  // Clean existing English messages catalog, if any
  const enMessagesJsPath = path.join(
    translationsPath,
    'locales/en/messages.js'
  );
  if (fs.existsSync(enMessagesJsPath)) {
    console.info(
      `ℹ️ Removing ${enMessagesJsPath} as "en" should not have any translations ("pot" file)`
    );
    fs.rmSync(enMessagesJsPath, { recursive: true, force: true });
  }
  const enMessagesPotPath = path.join(
    translationsPath,
    'reviewed-extensions-messages.pot'
  );
  if (fs.existsSync(enMessagesPotPath)) {
    console.info(
      `ℹ️ Removing ${enMessagesPotPath} as "en" should not have any translations ("pot" file)`
    );
    fs.rmSync(enMessagesPotPath, { recursive: true, force: true });
  }

  // Step 1: Find JSON files in 'reviewed' folder.
  console.log("ℹ️ Listing all JSON files in the 'reviewed' folder...");
  const jsonFiles = fs
    .readdirSync(reviewedExtensionsPath)
    .filter((file) => file.endsWith('.json'));

  console.log('ℹ️ Reading extension files...');
  let potContent = 'msgid ""\nmsgstr ""\n\n';
  const translationsMap = new Map();

  jsonFiles.forEach((file) => {
    const filePath = path.join(reviewedExtensionsPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    ['fullName', 'shortDescription', 'description', 'category'].forEach(
      (key) => {
        if (data[key]) {
          const values = Array.isArray(data[key]) ? data[key] : [data[key]];
          values.forEach((value) => {
            if (value.trim()) {
              // Avoid empty strings
              if (!translationsMap.has(value)) {
                translationsMap.set(value, []);
              }
              translationsMap.get(value).push(`${filePath}`);
            }
          });
        }
      }
    );
  });

  console.log('ℹ️ Creating .POT content...');
  // Step 3: Build POT content
  translationsMap.forEach((files, value) => {
    const uniqueFiles = [...new Set(files)];
    potContent += uniqueFiles.map((file) => `#: ${file}`).join('\n') + '\n';
    potContent += `msgid "${value.replace(/"/g, '\\"')}"\n`;
    potContent += 'msgstr ""\n\n';
  });

  console.log('ℹ️ Creating .POT file...');
  // Step 4: Write to .POT file
  const potFilePath = path.join(
    translationsPath,
    'reviewed-extensions-messages.pot'
  );
  fs.writeFileSync(potFilePath, potContent);
  console.log(
    "ℹ️ Translation file 'reviewed-messages.pot' generated and ready for translation."
  );
} catch (error) {
  console.error('❌ Error occurred while extracting translations:', error);
  throw error;
}
