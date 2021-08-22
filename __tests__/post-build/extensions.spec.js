// @ts-check
const fs = require('fs').promises;
const path = require('path');

/** @typedef {import('../../scripts/types').ExtensionsDatabase} ExtensionsDatabase */

const distExtensionsPath = path.join(__dirname, '../../dist/extensions');

/** @return {Promise<ExtensionsDatabase>} */
const getExtensionsDatabase = async () => {
  const extensionsDatabase = await fs.readFile(
    path.join(
      __dirname,
      '../../dist/extensions-database/extensions-database.json'
    )
  );
  const parsedExtensionsDatabase = JSON.parse(extensionsDatabase.toString());
  return parsedExtensionsDatabase;
};

describe('extensions database post check', () => {
  test('extensions-database.json', async () => {
    const extensionsDatabase = await getExtensionsDatabase();

    // Check that the headers seem correct
    expect(extensionsDatabase.extensionShortHeaders.length).toBeGreaterThan(70);

    expect(
      extensionsDatabase.extensionShortHeaders.find(
        ({ name }) => name === 'DraggableSliderControl'
      )
    ).toBeDefined();
    expect(
      extensionsDatabase.extensionShortHeaders.find(
        ({ name }) => name === 'FireBullet'
      )
    ).toBeDefined();
    expect(
      extensionsDatabase.extensionShortHeaders.find(
        ({ name }) => name === 'FollowObjectsWithCamera'
      )
    ).toBeDefined();
  });
  test('extensions', async () => {
    // Check that extensions are present.
    await expect(
      fs.stat(path.join(distExtensionsPath, '/FireBullet.json'))
    ).resolves.toBeDefined();
    await expect(
      fs.stat(
        path.join(distExtensionsPath, '/FireBullet-header.json')
      )
    ).resolves.toBeDefined();
  });
});
