const { appendFileSync } = require('fs');

/**
 * @typedef {Object} ExtensionFileError
 * @property {string | null} filePath The path of the file from the repository root, or null if the error is not about a single file.
 * @property {string} message
 * @property {boolean} isAutoFixable
 */

const bestPracticesUrl =
  'https://wiki.gdevelop.io/gdevelop5/extensions/best-practices';

const isRunningInGitHubActions = () => process.env.GITHUB_ACTIONS === 'true';

/**
 * Escape a value of a workflow command, see https://docs.github.com/en/actions/reference/workflow-commands-for-github-actions
 * @param {string} value
 */
const escapeWorkflowCommandData = (value) =>
  value.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');

/** @param {string} value */
const escapeWorkflowCommandProperty = (value) =>
  escapeWorkflowCommandData(value).replace(/:/g, '%3A').replace(/,/g, '%2C');

/**
 * Print an annotation for each error, so that GitHub shows them on the files of the pull request.
 * @param {ExtensionFileError[]} extensionFileErrors
 */
const printAnnotations = (extensionFileErrors) => {
  for (const { filePath, message } of extensionFileErrors) {
    const properties = filePath
      ? ` file=${escapeWorkflowCommandProperty(filePath)}`
      : '';
    console.log(`::error${properties}::${escapeWorkflowCommandData(message)}`);
  }
};

/**
 * @param {ExtensionFileError[]} extensionFileErrors
 * @returns {string}
 */
const formatSummary = (extensionFileErrors) => {
  if (extensionFileErrors.length === 0) {
    return '## ✅ All extensions follow the best practices\n';
  }

  /** @type {Map<string, ExtensionFileError[]>} */
  const errorsByHeading = new Map();
  for (const extensionFileError of extensionFileErrors) {
    const heading = extensionFileError.filePath
      ? `\`${extensionFileError.filePath}\``
      : 'All extensions';
    const errors = errorsByHeading.get(heading) || [];
    errors.push(extensionFileError);
    errorsByHeading.set(heading, errors);
  }

  const lines = [
    `## ❌ ${extensionFileErrors.length} error${
      extensionFileErrors.length > 1 ? 's' : ''
    } found in extensions`,
    '',
    `Extensions must follow the [best practices](${bestPracticesUrl}). Fix these errors in GDevelop, export the extension again and update the file in this pull request.`,
    '',
  ];
  for (const [heading, errors] of errorsByHeading) {
    lines.push(`### ${heading}`, '');
    for (const { message, isAutoFixable } of errors) {
      lines.push(`- ${isAutoFixable ? '🔧 ' : ''}${message}`);
    }
    lines.push('');
  }
  if (extensionFileErrors.some(({ isAutoFixable }) => isAutoFixable)) {
    lines.push(
      'Errors marked with 🔧 can be fixed automatically by running `npm run build -- --fix` in a clone of this repository.',
      ''
    );
  }
  return lines.join('\n');
};

/**
 * When running in GitHub Actions, report the errors as annotations and as a summary of the job.
 * Annotations and summaries don't need a token with write access, so they also work for pull requests from forks.
 * @param {ExtensionFileError[]} extensionFileErrors
 */
const reportToGitHubActions = (extensionFileErrors) => {
  if (!isRunningInGitHubActions()) return;

  printAnnotations(extensionFileErrors);

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    appendFileSync(summaryPath, formatSummary(extensionFileErrors));
  }
};

module.exports = { reportToGitHubActions };
