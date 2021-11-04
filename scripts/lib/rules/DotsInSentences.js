/** @typedef {import("../../types").Extension} Extension */
/** @typedef {import("../../types").EventsFunction} EventsFunction */
/** @typedef {import("../../types").EventsBasedBehaviors} EventsBasedBehaviors */
/** @typedef {import("../../types").Parameter} Parameter */
/** @typedef {import("./rule").ErrorLogger} ErrorLogger */

/**
 * The list of required fields per object type, for usage with {@link checkForForbiddenDot}.
 */
const NO_DOT = {
  /** @type {Partial<keyof Extension>[]} */
  EXTENSION: ['name', 'fullName'],
  /** @type {Partial<keyof EventsFunction>[]} */
  EXPRESSION: ['name', 'fullName'],
  /** @type {Partial<keyof EventsFunction>[]} */
  INSTRUCTION: ['name', 'fullName', 'sentence'],
  /** @type {Partial<keyof EventsBasedBehaviors>[]} */
  BEHAVIOR: ['name', 'fullName'],
  /** @type {Partial<keyof Parameter>[]} */
  PARAMETER: ['name', 'description'],
};

/**
 * The list of required fields per object type, for usage with {@link checkForForbiddenDot}.
 */
const DOT_REQUIRED = {
  /** @type {Partial<keyof Extension>[]} */
  EXTENSION: [
    //'description', - Not enforced since most 
    'shortDescription',
  ],
  /** @type {Partial<keyof EventsFunction>[]} */
  EXPRESSION: ['description'],
  /** @type {Partial<keyof EventsFunction>[]} */
  INSTRUCTION: ['description'],
  /** @type {Partial<keyof EventsBasedBehaviors>[]} */
  BEHAVIOR: ['description'],
};

/**
 * Checks if an object has forbidden dots.
 * @template {Record<string, any>} T
 * @param {T} object The object whose fields need a check.
 * @param {Array<keyof T>} fields The fields to check against dots.
 * @param {string} sourceName The name of the object to print in the error.
 * @param {ErrorLogger} onError The errors list to log any error to.
 */
function checkForForbiddenDot(object, fields, sourceName, onError) {
  for (let key of fields) {
    if (object[key].trim().includes('.'))
      onError(
        `Field '${key}' of ${sourceName} has a dot, but it is fobidden there!`,
        () => {
          //@ts-ignore Not sure what it is complaining about
          object[key] = object[key].trim().replace(/\./gm, '');
        }
      );
  }
}

/**
 * Checks if an object misses dots.
 * @template {Record<string, string>} T
 * @param {T} object The object whose fields need a check.
 * @param {Array<keyof T>} fields The fields to check against missing dots.
 * @param {string} sourceName The name of the object to print in the error.
 * @param {ErrorLogger} onError The errors list to log any error to.
 */
function checkForMissingDot(object, fields, sourceName, onError) {
  for (let key of fields) {
    const trimmed = object[key].trim();
    if (trimmed.length !== 0 && !trimmed.endsWith('.'))
      onError(
        `Field '${key}' of ${sourceName} misses a dot at the end of the sentence!`,
        () => {
          //@ts-ignore Not sure what it is complaining about
          object[key] = trimmed + '.';
        }
      );
  }
}

/**
 * Checks for missing and forbidden dots.
 * @template {Record<string, any>} T
 * @param {T} object The object whose fields need a check.
 * @param {keyof typeof DOT_REQUIRED} type The fields to check against missing dots.
 * @param {string} sourceName The name of the object to print in the error.
 * @param {(message: string) => void} onError The errors list to log any error to.
 */
function checkForDots(object, type, sourceName, onError) {
  checkForForbiddenDot(object, NO_DOT[type], sourceName, onError);
  checkForMissingDot(object, DOT_REQUIRED[type], sourceName, onError);
}

/** @type {import("./rule").Rule} */
async function validate({ extension, publicEventsFunctions, onError }) {
  checkForDots(extension, 'EXTENSION', 'the extension description', onError);
  for (const func of publicEventsFunctions) {
    checkForDots(
      func,
      func.functionType === 'Action' || func.functionType === 'Condition'
        ? 'INSTRUCTION'
        : 'EXPRESSION',
      `the function '${func.name}'`,
      onError
    );

    for (const parameter of func.parameters)
      checkForForbiddenDot(
        parameter,
        NO_DOT.PARAMETER,
        `the function '${func.name} parameter '${parameter.name}'`,
        onError
      );
  }
  for (const behavior of extension.eventsBasedBehaviors)
    checkForDots(
      behavior,
      'BEHAVIOR',
      `the behavior '${behavior.name}'`,
      onError
    );
}

/** @type {import("./rule").RuleModule} */
module.exports = {
  name: 'Dots in sentences',
  validate,
};
