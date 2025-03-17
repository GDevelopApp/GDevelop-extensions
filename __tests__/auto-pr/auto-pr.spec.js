const { mkdir, rm } = require('fs/promises');
const { verifyExtension } = require('../../scripts/check-single-extension');
const { extractExtension } = require('../../scripts/extract-extension');

const TEMPORARY_MOCK_EXTENSIONS_FOLDER = __dirname + '/mock_extensions_folder';
const TEST_ZIPS_FOLDER = __dirname + '/test-zips';
const TEST_EXTENSIONS_FOLDER = __dirname + '/test-extensions';

/** @param {string} zipName */
const wrappedExtractExtension = async (zipName) =>
  (
    await extractExtension(
      `${TEST_ZIPS_FOLDER}/${zipName}.zip`,
      TEMPORARY_MOCK_EXTENSIONS_FOLDER
    )
  ).error;

/** @param {string} extensionName */
const wrappedVerifyExtension = async (extensionName) =>
  (
    await verifyExtension(extensionName, {
      extensionsFolder: TEST_EXTENSIONS_FOLDER,
    })
  ).code;

describe('Auto-pr pipeline', () => {
  beforeAll(async () =>
    mkdir(TEMPORARY_MOCK_EXTENSIONS_FOLDER + '/community', { recursive: true })
  );
  beforeAll(async () =>
    mkdir(TEMPORARY_MOCK_EXTENSIONS_FOLDER + '/reviewed', { recursive: true })
  );
  afterAll(async () =>
    rm(TEMPORARY_MOCK_EXTENSIONS_FOLDER, { recursive: true })
  );

  test('extractExtension()', async () => {
    expect(await wrappedExtractExtension(`empty`)).toBe('no-json-found');
    expect(await wrappedExtractExtension(`invalid-zip`)).toBe('zip-error');
    expect(await wrappedExtractExtension(`not-a-json`)).toBe('no-json-found');
    expect(await wrappedExtractExtension(`path-shenanigans`)).toBe(
      'invalid-file-name'
    );
    expect(await wrappedExtractExtension(`too-many-extensions`)).toBe(
      'too-many-files'
    );

    expect(await wrappedExtractExtension(`valid-extension`)).toBeUndefined();
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
    expect(await wrappedVerifyExtension(`ArrayTools`)).toBe('gdevelop-project-file');

    expect(await wrappedVerifyExtension(`UUID`)).toBe('success');
    expect(await wrappedVerifyExtension(`Clipboard`)).toBe('success');
  });
});
