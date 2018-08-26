#!/usr/bin/env node

const Semver = require('semver');
const { parser, Release, Changelog } = require('keep-a-changelog');
const fs = require('fs');
const chalk = require('chalk');
const url = require('url');

function getPackageUrl (packageUrl) {
  packageUrl = packageUrl
    //trim git+ from the front of the URL
    .replace(/^git\+/, '')
    //convert ssh://, ssh://git@, or just git@ to https://
    .replace(/^(?:ssh:\/\/(?:git@)?|git@)/, 'https://');

  const parsed = url.parse(packageUrl);
  
  if (parsed.pathname) {
    parsed.pathname = parsed.pathname
      //replace the leading : for ssh paths with / (and pull the port out of the parsed path)
      .replace(/\/:(?:(\d+):)?/, (match, port) => {
        if (!parsed.port && port) {
          parsed.port = port;
          parsed.host += ':' + port;
        }
        return '/';
      })
      //replace the trailing .git
      .replace(/\.git$/, '');
  }

  return url.format(parsed);
}

module.exports.getPackageUrl = getPackageUrl;

function getPackage () {
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync('package.json'));
  } catch (err) {
    throw new Error(`Unable to access package.json: ${err.message}`);
  }

  if (!pkg.repository || !pkg.repository.url) {
    throw new Error('No repository URL found in package.json');
  }

  pkg.repository.url = getPackageUrl(pkg.repository.url);

  if (!/^https?:\/\//.test(pkg.repository.url)) {
    throw new Error('Repository URL in package.json must be a valid URL to a git repository');
  }
  return pkg;
}

function getChangelog () {
  try {
    return parser(fs.readFileSync('CHANGELOG.md', 'utf8'));
  } catch (err) {
    throw new Error(`Unable to read changelog: ${err.message}`);
  }
}

function ensureChangesForRelease (unreleased) {
  if (!unreleased || unreleased.isEmpty()) {
    throw new Error('No changes to the Changelog for release');
  }
}

module.exports.init = function () {
  const pkg = getPackage();
  const changelog = new Changelog('Changelog', [
    'All notable changes to this project will be documented in this file.',
    '',
    'The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)',
    'and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).',
  ].join('\n'));
  changelog.url = pkg.repository.url;
  changelog.addRelease(new Release());
  fs.writeFileSync('CHANGELOG.md', changelog.toString());
  console.log(chalk.green('Generated new CHANGELOG.md'));
};

module.exports.lint = function (forRelase) {
  getPackage();
  const changelog = getChangelog();

  if (forRelase) {
    ensureChangesForRelease(changelog.releases.find(release => !release.version));
  } else {
    console.log(chalk.green('Changelog is valid!'));
  }
};

module.exports.release = function () {
  const pkg = getPackage();
  const changelog = getChangelog();
  changelog.url = pkg.repository.url;

  const unreleased = changelog.releases.find(release => !release.version);
  const existingRelease = changelog.releases.some(release => release.version && Semver.eq(release.version, pkg.version));

  if (!existingRelease) {
    ensureChangesForRelease(unreleased);
    
    unreleased.version = new Semver(pkg.version);
    unreleased.date = new Date();

    changelog.addRelease(new Release());

    fs.writeFileSync('CHANGELOG.md', changelog.toString());

    console.log(chalk.green('Released Changelog!'));

  } else if (unreleased && !unreleased.isEmpty()) {
    throw new Error('Release already exists, did you mean to bump your package\'s version?');
  } else {
    console.log(chalk.blue('Changelog is up-to-date, not performing a release'));
  }
};
