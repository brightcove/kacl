#!/usr/bin/env node

const { chalk } = require('chalk');
const { init, lint, release } = require('./src');

function run () {
  switch (process.argv[2]) {
    case 'init':
      init();
      break;
    case 'lint':
      lint();
      break;
    case 'prerelease':
      lint(true);
      break;
    case 'release':
      release();
      break;
    default:
      console.log([
        'Usage: kacl init|lint|prerelease|release',
        '',
        '  init       - Initializes a new CHANGELOG.md',
        '  lint       - Lints your changelog for errors',
        '  prerelease - Checks the requirements for creating a new release (should be added to the "preversion" script)',
        '  release    - Creates a new release matching your package.json version (should be added to the "version" script)',
        '',
      ].join('\n'));
      process.exit(2);
      break;
  }
}

try {
  run();
} catch (err) {
  console.error(chalk.red(err.message));
  process.exit(1);
}
