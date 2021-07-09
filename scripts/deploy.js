const shell = require('shelljs');
const path = require('path');
const { default: axios } = require('axios');
const args = require('minimist')(process.argv.slice(2));

const databasePath = path.join(__dirname, '../dist/extensions-database');
const extensionsPath = path.join(__dirname, '../dist/extensions');
const databaseDestination = `s3://resources.gdevelop-app.com/extensions-database`;
const extensionsDestination = `s3://resources.gdevelop-app.com/extensions`;

if (!args['cf-zoneid'] || !args['cf-token']) {
  shell.echo(
    '❌ You must pass --cf-zoneid, --cf-token to purge the CloudFare cache.'
  );
  shell.exit(1);
}

{
  shell.echo(
    'ℹ️ Uploading extensions to resources.gdevelop-app.com/extensions...'
  );
  const output = shell.exec(
    `aws s3 sync ${extensionsPath} ${extensionsDestination} --acl public-read`
  );
  if (output.code !== 0) {
    shell.echo(
      '❌ Unable to upload database to resources.gdevelop-app.com/extensions-database. Error is:'
    );
    shell.echo(output.stdout);
    shell.echo(output.stderr);
    shell.exit(output.code);
  }
}

{
  shell.echo(
    'ℹ️ Uploading database to resources.gdevelop-app.com/extensions-database...'
  );
  const output = shell.exec(
    `aws s3 sync ${databasePath} ${databaseDestination} --acl public-read`
  );
  if (output.code !== 0) {
    shell.echo(
      '❌ Unable to upload database to resources.gdevelop-app.com/extensions-database. Error is:'
    );
    shell.echo(output.stdout);
    shell.echo(output.stderr);
    shell.exit(output.code);
  }
}

shell.echo('✅ Upload finished');

shell.echo('ℹ️ Purging Cloudflare cache...');

const zoneId = args['cf-zoneid'];
const purgeCacheUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`;

axios
  .post(
    purgeCacheUrl,
    {
      files: [
        // Update the "database"
        'https://resources.gdevelop-app.com/extensions-database/extensions-database.json',
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${args['cf-token']}`,
        'Content-Type': 'application/json',
      },
    }
  )
  .then((response) => response.data)
  .then(() => {
    shell.echo('✅ Cache purge done.');
  })
  .catch((error) => {
    shell.echo(
      '❌ Error while requesting cache purge (are your identifiers correct?)'
    );
    shell.echo(error.message || '(unknown error)');
    shell.exit(1);
  });
