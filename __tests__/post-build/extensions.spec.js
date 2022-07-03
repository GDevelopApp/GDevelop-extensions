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

    expect(extensionsDatabase.views.default.firstExtensionIds).toContain(
      'Health'
    );

    // Check that the headers seem correct
    expect(extensionsDatabase.extensionShortHeaders.length).toBeGreaterThan(70);

    const draggableSliderControlExtensionShortHeader =
      extensionsDatabase.extensionShortHeaders.find(
        ({ name }) => name === 'DraggableSliderControl'
      );
    const fireBulletExtensionShortHeader =
      extensionsDatabase.extensionShortHeaders.find(
        ({ name }) => name === 'FireBullet'
      );
    const followObjectsWithCameraExtensionShortHeader =
      extensionsDatabase.extensionShortHeaders.find(
        ({ name }) => name === 'FollowObjectsWithCamera'
      );
    const iframeExtensionShortHeader =
      extensionsDatabase.extensionShortHeaders.find(
        ({ name }) => name === 'Iframe'
      );

    if (!draggableSliderControlExtensionShortHeader)
      throw new Error('DraggableSliderControl extension not found.');
    if (!fireBulletExtensionShortHeader)
      throw new Error('FireBullet extension not found.');
    if (!followObjectsWithCameraExtensionShortHeader)
      throw new Error('FollowObjectsWithCamera extension not found.');
    if (!iframeExtensionShortHeader)
      throw new Error('Iframe extension not found.');

    // Check the content of some extension headers
    expect(fireBulletExtensionShortHeader.tier).toBe('reviewed');
    expect(iframeExtensionShortHeader.tier).toBe('reviewed');
  });
  test('extensions', async () => {
    // Check that extensions are present.
    await expect(
      fs.stat(path.join(distExtensionsPath, '/FireBullet.json'))
    ).resolves.toBeDefined();
    await expect(
      fs.stat(path.join(distExtensionsPath, '/FireBullet-header.json'))
    ).resolves.toBeDefined();
  });
});
