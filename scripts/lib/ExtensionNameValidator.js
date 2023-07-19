/** @param {string} extensionName */
exports.isValidExtensionName = (extensionName) => {
  if (extensionName.length === 0) return false;

  // Ensure that the first character is an uppercase character
  const firstCharCode = extensionName.charCodeAt(0);
  if (firstCharCode < 65 || firstCharCode > 90) return false;

  const len = extensionName.length;
  for (let i = 1; i < len; i++) {
    const charCode = extensionName.charCodeAt(i);
    // Use the ascii table to check quickly if a character is a normal upper- or lowercase character or a number,
    // as only those are allowed as extension names.
    if (
      // If below numbers range...
      charCode < 48 ||
      // ...between numbers and uppercase letters range...
      (charCode > 57 && charCode < 65) ||
      // ...between uppercase letters and lowercase letters range...
      (charCode > 90 && charCode < 97) ||
      // ...or after the lowercase letters range...
      charCode > 122
    )
      // ...then it is not in an authorized range.
      return false;
  }

  return true;
};
