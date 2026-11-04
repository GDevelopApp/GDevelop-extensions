const { isValidExtensionName } = require('../lib/ExtensionNameValidator');

describe('ExtensionNameValidator.js', () => {
  test('Disallows invalid names', () => {
    expect(isValidExtensionName('')).toBeFalsy();
    expect(isValidExtensionName(' ')).toBeFalsy();
    expect(isValidExtensionName('!')).toBeFalsy();
    expect(isValidExtensionName('😀')).toBeFalsy();

    expect(isValidExtensionName('hello')).toBeFalsy();
    expect(isValidExtensionName('1hello')).toBeFalsy();
    expect(isValidExtensionName('Hello!')).toBeFalsy();
    expect(isValidExtensionName('!Hello')).toBeFalsy();
    expect(isValidExtensionName('He!!o')).toBeFalsy();
    expect(isValidExtensionName('Hello:')).toBeFalsy();
    expect(isValidExtensionName('Hello@')).toBeFalsy();
    expect(isValidExtensionName('Hello/')).toBeFalsy();
    expect(isValidExtensionName('Hello ')).toBeFalsy();
    expect(isValidExtensionName('Hello[')).toBeFalsy();
    expect(isValidExtensionName('Hello`')).toBeFalsy();
    expect(isValidExtensionName('Hello{')).toBeFalsy();
    expect(isValidExtensionName('Hello😀')).toBeFalsy();
  });

  test('Allows valid names', () => {
    expect(isValidExtensionName('Hello')).toBeTruthy();
    expect(isValidExtensionName('HelloWorld')).toBeTruthy();
    expect(isValidExtensionName('HelloWorld12')).toBeTruthy();
    expect(isValidExtensionName('P2P')).toBeTruthy();
    expect(isValidExtensionName('Rotate13')).toBeTruthy();
  });
});
