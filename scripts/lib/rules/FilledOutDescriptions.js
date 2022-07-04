/** @typedef {import("../../types").Extension} Extension */
/** @typedef {import("../../types").EventsFunction} EventsFunction */
/** @typedef {import("../../types").EventsBasedBehaviors} EventsBasedBehaviors */
/** @typedef {import("../../types").Parameter} Parameter */

/**
 * The list of required fields per object type, for usage with {@link checkForFilledOutString}.
 */
const NECESSARY_FIELDS = {
  /** @type {Partial<keyof Extension>[]} */
  EXTENSION: ['name', 'fullName', 'description', 'shortDescription'],
  /** @type {Partial<keyof EventsFunction>[]} */
  EXPRESSION: ['name', 'fullName', 'description', 'functionType'],
  /** @type {Partial<keyof EventsFunction>[]} */
  INSTRUCTION: ['name', 'fullName', 'description', 'functionType', 'sentence'],
  /** @type {Partial<keyof EventsBasedBehaviors>[]} */
  BEHAVIOR: ['name', 'fullName', 'description'],
  /** @type {Partial<keyof Parameter>[]} */
  PARAMETER: ['description', 'name', 'type'],
};

/**
 * Checks if an object string fields are filled out.
 * @template {Record<string, any>} T
 * @param {T} object The object to check for fields.
 * @param {Array<keyof T>} fields The fields to check against emptyness.
 * @param {string} sourceName The name of the object to print in the error.
 * @param {(message: string) => void} onError The errors list to log any error to.
 */
function checkForFilledOutString(object, fields, sourceName, onError) {
  for (let key of fields) {
    if (object[key].trim().length === 0)
      onError(`Required field '${key}' of ${sourceName} is not filled out!`);
  }
}

/** @type {import("./rule").Rule} */
async function validate({ extension, publicEventsFunctions, onError }) {
  // Check if necessary fields are filled out
  checkForFilledOutString(
    extension,
    NECESSARY_FIELDS.EXTENSION,
    'the extension description',
    onError
  );
  for (const func of publicEventsFunctions) {
    checkForFilledOutString(
      func,
      func.functionType === 'Action' || func.functionType === 'Condition'
        ? NECESSARY_FIELDS.INSTRUCTION
        : NECESSARY_FIELDS.EXPRESSION,
      `the function '${func.name}'`,
      onError
    );

    for (const parameter of func.parameters)
      checkForFilledOutString(
        parameter,
        NECESSARY_FIELDS.PARAMETER,
        `the function '${func.name} parameter '${parameter.name}'`,
        onError
      );
  }
  for (const behavior of extension.eventsBasedBehaviors)
    checkForFilledOutString(
      behavior,
      NECESSARY_FIELDS.BEHAVIOR,
      `the behavior '${behavior.name}'`,
      onError
    );
}

/** @type {import("./rule").RuleModule} */
module.exports = {
  name: 'Filled out names and descriptions',
  validate,
};
