const { mkdir, rm } = require('fs/promises');
const { cp } = require('fs').promises;
const { verifyExtension } = require('../../scripts/check-single-extension');
const { extractExtension } = require('../../scripts/extract-extension');

const TEMPORARY_MOCK_EXTENSIONS_FOLDER = __dirname + '/mock_extensions_folder';
const TEST_ZIPS_FOLDER = __dirname + '/test-zips';
const TEST_EXTENSIONS_FOLDER = __dirname + '/test-extensions';

/**
 *  @param {string} zipName
 *  @param {boolean | undefined} isUpdate
 */
const wrappedExtractExtension = async (zipName, isUpdate = false) =>
  (
    await extractExtension(`${TEST_ZIPS_FOLDER}/${zipName}.zip`, {
      extensionsFolder: TEMPORARY_MOCK_EXTENSIONS_FOLDER,
      isUpdate,
    })
  ).error;

/** @param {string} extensionName */
const wrappedVerifyExtension = async (extensionName) =>
  (
    await verifyExtension(extensionName, {
      extensionsFolder: TEST_EXTENSIONS_FOLDER,
    })
  ).code;

describe('Auto-pr pipeline', () => {
  beforeEach(
    async () =>
      await cp(TEST_EXTENSIONS_FOLDER, TEMPORARY_MOCK_EXTENSIONS_FOLDER, {
        recursive: true,
      })
  );
  afterEach(
    async () => await rm(TEMPORARY_MOCK_EXTENSIONS_FOLDER, { recursive: true })
  );

  describe('extractExtension()', () => {
    test('Can detect extension file errors', async () => {
      expect(await wrappedExtractExtension(`empty-file`)).toBe('zip-error');
      expect(await wrappedExtractExtension(`empty-archive`)).toBe(
        'no-json-found'
      );
      expect(await wrappedExtractExtension(`invalid-zip`)).toBe('zip-error');
      expect(await wrappedExtractExtension(`not-a-json`)).toBe('no-json-found');
      expect(await wrappedExtractExtension(`path-shenanigans`)).toBe(
        'invalid-file-name'
      );
      expect(await wrappedExtractExtension(`too-many-extensions`)).toBe(
        'too-many-files'
      );
    });

    test('Can submit a valid new extension', async () => {
      expect(await wrappedExtractExtension(`new-extension`)).toBeUndefined();
    });

    test('Can detect that the new experimental extension already exists', async () => {
      expect(await wrappedExtractExtension(`experimental-update`)).toBe(
        'already-exists'
      );
    });

    test('Can detect that the new reviewed extension already exists', async () => {
      expect(await wrappedExtractExtension(`reviewed-update`)).toBe(
        'already-exists'
      );
    });

    test("Can detect that the extension to update doesn't exist", async () => {
      expect(await wrappedExtractExtension(`new-extension`, true)).toBe(
        'nothing-to-update'
      );
    });

    test('Can submit a valid experimental extension update', async () => {
      expect(
        await wrappedExtractExtension(`experimental-update`, true)
      ).toBeUndefined();
    });

    test('Can submit a valid reviewed extension update', async () => {
      expect(
        await wrappedExtractExtension(`reviewed-update`, true)
      ).toBeUndefined();
    });
  });

  test(`verifyExtension()`, async () => {
    expect(await wrappedVerifyExtension(`NonExisting`)).toBe('not-found');
    expect(await wrappedVerifyExtension(`BackButton`)).toBe('duplicated');
    expect(
      await wrappedVerifyExtension(`../../../../../../../etc/passwd`)
    ).toBe('invalid-file-name');
    expect(await wrappedVerifyExtension(`cri.png`)).toBe('invalid-file-name');
    expect(await wrappedVerifyExtension(`RealExtension`)).toBe('invalid-json');
    expect(await wrappedVerifyExtension(`Share`)).toBe('rule-break');
    expect(await wrappedVerifyExtension(`Fake`)).toBe('unknown-json-contents');
    expect(await wrappedVerifyExtension(`ArrayTools`)).toBe(
      'gdevelop-project-file'
    );

    expect(await wrappedVerifyExtension(`UUID`)).toBe('success');
    expect(await wrappedVerifyExtension(`Clipboard`)).toBe('success');
  });
});
