// @ts-check
const { validateExtensionFile } = require('../lib/ExtensionFileValidator');

/**
 * @param {string} name
 */
const createFakeExtensionContent = (name) => ({
  name,
  eventsFunctions: [],
  eventsBasedBehaviors: [],
  eventsBasedObjects: [],
});

/**
 * @param {string} filename
 * @param {any} content
 */
const getErrorMessages = (filename, content) =>
  validateExtensionFile(filename, content).map(({ message }) => message);

describe('validateExtensionFile', () => {
  test('accepts an extension in a file named after it', () => {
    expect(
      getErrorMessages('Flash.json', createFakeExtensionContent('Flash'))
    ).toEqual([]);
  });

  test('rejects an invalid file name', () => {
    expect(
      getErrorMessages('flash.json', createFakeExtensionContent('flash'))
    ).toEqual([
      '[File name]: The file name "flash.json" is invalid. It should only contain latin upper- and lowercase characters and numbers, start with an uppercase character, and end with ".json".',
    ]);
  });

  test('rejects a file not named after the extension', () => {
    expect(
      getErrorMessages('MyFlash.json', createFakeExtensionContent('Flash'))
    ).toEqual([
      '[File name]: The file is named "MyFlash.json" but the extension is named "Flash". Rename the file to "Flash.json".',
    ]);
  });

  test('rejects a GDevelop project', () => {
    expect(
      getErrorMessages('MyGame.json', {
        properties: { name: 'My game' },
        layouts: [],
      })
    ).toEqual([
      '[Extension file]: This file is a GDevelop project, not an extension. Export the extension itself from its options ("Export extension", then "Export to a file") and add this file instead.',
    ]);
  });

  test('rejects a JSON file that is not an extension', () => {
    expect(getErrorMessages('Fake.json', { hello: 'world' })).toEqual([
      '[Extension file]: This JSON file is not a GDevelop extension. Export it again from the extension editor with the latest version of GDevelop, and do not modify it by hand afterwards.',
    ]);
  });
});
