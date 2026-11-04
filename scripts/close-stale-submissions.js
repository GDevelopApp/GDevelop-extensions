// Close the extension submissions (issues and pull requests) that were made with the
// former issue-based workflow and are older than a few months, asking their authors
// to submit again on the community list or with a pull request.
//
// Usage:
//   GITHUB_TOKEN=xxx node scripts/close-stale-submissions.js            # Dry run: list what would be closed.
//   GITHUB_TOKEN=xxx node scripts/close-stale-submissions.js --confirm  # Comment and close.
// Options:
//   --months=3   Only close submissions created more than this number of months ago.

const axios = require('axios').default;
const args = require('minimist')(process.argv.slice(2));
const { setTimeout: wait } = require('timers/promises');

const owner = 'GDevelopApp';
const repo = 'GDevelop-extensions';
const submissionLabels = ['✨ New extension', '🔄 Extension update'];
// GitHub limits how fast content can be created: wait between each closed submission.
const delayBetweenSubmissionsInMs = 2000;

/**
 * @typedef {Object} GitHubIssue An issue or a pull request, as returned by the issues API.
 * @property {number} number
 * @property {string} title
 * @property {string} html_url
 * @property {string} created_at
 * @property {{login: string, type: string}} user
 * @property {string} author_association
 * @property {Object} [pull_request] Only set for pull requests.
 */

// Submissions from the team are not closed: they can follow up on them directly.
const teamAuthorAssociations = new Set(['OWNER', 'MEMBER', 'COLLABORATOR']);

const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
  console.error('❌ Set the GITHUB_TOKEN environment variable.');
  process.exit(1);
}

const github = axios.create({
  baseURL: `https://api.github.com/repos/${owner}/${repo}`,
  headers: {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${githubToken}`,
  },
});

/**
 * @param {string} label
 * @returns {Promise<GitHubIssue[]>} The open issues and pull requests with this label.
 */
const getOpenSubmissionsWithLabel = async (label) => {
  /** @type {GitHubIssue[]} */
  const submissions = [];
  for (let page = 1; ; page++) {
    /** @type {{data: GitHubIssue[]}} */
    const response = await github.get('/issues', {
      params: { state: 'open', labels: label, per_page: 100, page },
    });
    submissions.push(...response.data);
    if (response.data.length < 100) return submissions;
  }
};

/**
 * @param {Date} createdBefore
 * @returns {Promise<GitHubIssue[]>} The open submissions created before the date, oldest first.
 */
const getStaleSubmissions = async (createdBefore) => {
  /** @type {Map<number, GitHubIssue>} */
  const submissionsByNumber = new Map();
  for (const label of submissionLabels) {
    for (const submission of await getOpenSubmissionsWithLabel(label)) {
      submissionsByNumber.set(submission.number, submission);
    }
  }
  return [...submissionsByNumber.values()]
    .filter(({ created_at }) => new Date(created_at) < createdBefore)
    .sort((a, b) => a.number - b.number);
};

/**
 * Pull requests converted from issues were opened by a bot, on a branch named
 * `extension/<submitter login>/<issue number>`.
 * @returns {Promise<Map<number, string>>} The submitter logins by pull request number.
 */
const getSubmitterLoginsOfBotPullRequests = async () => {
  /** @type {Map<number, string>} */
  const submitterLoginsByPullRequestNumber = new Map();
  for (let page = 1; ; page++) {
    /** @type {{data: Array<{number: number, head: {ref: string}}>}} */
    const response = await github.get('/pulls', {
      params: { state: 'open', per_page: 100, page },
    });
    for (const pullRequest of response.data) {
      const match = pullRequest.head.ref.match(/^extension\/([^/]+)\//);
      if (match)
        submitterLoginsByPullRequestNumber.set(pullRequest.number, match[1]);
    }
    if (response.data.length < 100) return submitterLoginsByPullRequestNumber;
  }
};

/** @param {string | null} submitterLogin */
const getClosingComment = (submitterLogin) => {
  return `👋 Hi${
    submitterLogin ? ` @${submitterLogin}` : ''
  }, thanks for your submission!

We've simplified how extensions are submitted, and we're closing the submissions older than a few months that were not merged.

If you still want to share your extension:
- **Fastest**: add it to the [GDevelop Community List](https://github.com/GDevelopApp/GDevelop-community-list/issues/new?template=new-extension.yml). Any extension can be listed there, without waiting for a review.
- If you think it belongs to the official or experimental extensions of GDevelop, [open a pull request](https://github.com/GDevelopApp/GDevelop-extensions#submit-an-extension) with the latest version of your extension. The pull request automatically checks that it follows the best practices, then the extensions team reviews it.

Thanks for contributing to GDevelop! 🙌`;
};

/**
 * @param {GitHubIssue} submission
 * @param {string | null} submitterLogin
 */
const closeSubmission = async (submission, submitterLogin) => {
  await github.post(`/issues/${submission.number}/comments`, {
    body: getClosingComment(submitterLogin),
  });
  await github.patch(
    `/issues/${submission.number}`,
    submission.pull_request
      ? { state: 'closed' }
      : { state: 'closed', state_reason: 'not_planned' }
  );
};

(async () => {
  const months = Number(args['months'] || 3);
  const createdBefore = new Date();
  createdBefore.setMonth(createdBefore.getMonth() - months);
  const createdBeforeDate = createdBefore.toISOString().split('T')[0];

  const staleSubmissions = await getStaleSubmissions(createdBefore);
  const submitterLoginsByPullRequestNumber =
    await getSubmitterLoginsOfBotPullRequests();
  /** @param {GitHubIssue} submission */
  const getSubmitterLogin = (submission) =>
    submission.user.type === 'Bot'
      ? submitterLoginsByPullRequestNumber.get(submission.number) || null
      : submission.user.login;
  const teamSubmissions = staleSubmissions.filter(({ author_association }) =>
    teamAuthorAssociations.has(author_association)
  );
  const submissionsToClose = staleSubmissions.filter(
    ({ author_association }) => !teamAuthorAssociations.has(author_association)
  );

  /** @param {GitHubIssue} submission */
  const formatSubmission = (submission) =>
    `${submission.pull_request ? 'PR   ' : 'Issue'} #${submission.number} (${
      submission.created_at.split('T')[0]
    }, by @${getSubmitterLogin(submission) || 'unknown'}): ${submission.title}`;

  console.log(
    `Skipping ${teamSubmissions.length} open submissions created before ${createdBeforeDate} by the team:\n`
  );
  teamSubmissions.forEach((submission) =>
    console.log(formatSubmission(submission))
  );

  console.log(
    `\nClosing ${submissionsToClose.length} open submissions created before ${createdBeforeDate}:\n`
  );
  for (const submission of submissionsToClose) {
    console.log(formatSubmission(submission));
    if (!args['confirm']) continue;

    await closeSubmission(submission, getSubmitterLogin(submission));
    console.log(`  ✅ Closed ${submission.html_url}`);
    await wait(delayBetweenSubmissionsInMs);
  }

  if (!args['confirm']) {
    console.log(
      '\nℹ️ Dry run: nothing was closed. Run again with --confirm to comment and close these submissions.'
    );
  }
})().catch((error) => {
  console.error(
    '❌ Error while closing submissions:',
    error.response ? error.response.data : error
  );
  process.exit(1);
});
