[![Version](https://img.shields.io/npm/v/@brightcove/kacl.svg)](https://www.npmjs.com/package/@brightcove/kacl)
[![Downloads](https://img.shields.io/npm/dt/@brightcove/kacl.svg)](https://www.npmjs.com/package/@brightcove/kacl)
[![Build Status](https://travis-ci.org/brightcove/kacl.svg?branch=master)](https://travis-ci.org/brightcove/kacl)
[![Coverage](https://img.shields.io/codecov/c/github/brightcove/kacl/master.svg)](https://codecov.io/gh/brightcove/kacl)

# kacl

[**K**eep **a** **C**hange**l**og](https://keepachangelog.com/en/1.0.0/) tooling for linting and automatically releasing changelogs

## Usage

### Installation

```bash
npm i -D @brightcove/kacl
```

You can also install globally to easily initialize changelogs in your projects:

```bash
npm i -g @brightcove/kacl
```

### CLI Usage

If installed globally, you can run the `kacl` command. If not, you can run it from your project's node_modules folder: `./node_modules/.bin/kacl`

```
Usage: kacl init|lint|prerelease|release

  init       - Initializes a new CHANGELOG.md
  lint       - Lints your changelog for errors
  prerelease - Checks the requirements for creating a new release (should be added to the "preversion" script)
  release    - Creates a new release matching your package.json version (should be added to the "version" script)
```

### Usage in package.json

kacl is most effective when added to package.json scripts as it can be used to completely automate changelog changes when running `npm version`. The following is a recommendation for setting up package.json scripts to use kacl.

```json
{
  "scripts": {
    "posttest": "kacl lint",
    "preversion": "kacl prerelease",
    "version": "kacl release && git add CHANGELOG.md"
  }
}
```

This setup does the following:

- Lints your changelog after running tests
- Checks the changelog before bumping the version with `npm version` to ensure there is an unreleased entry
- Updates the changelog and adds it to git after the version has been bumped with `npm version`. The changelog changes will automatically be committed as part of `npm version`.

## Info

- Status: Active
- Type: Utility
- Versioning: [Semantic Versioning](http://semver.org/spec/v2.0.0.html)

## Maintainers

- Ted Janeczko - [@tjaneczko](https://github.com/tjaneczko)

## Contributions

Contributions are welcome, please see the [contributing guidelines](https://github.com/brightcove/kacl/blob/master/CONTRIBUTING.md).

## Issues and Questions

This project uses github issues, please file issues and questions [here](https://github.com/kacl/changelog/issues).

## Attributions and Thanks

This project uses the [keep-a-changelog](https://github.com/oscarotero/keep-a-changelog/) library from [Oscar Otero](https://github.com/oscarotero) for parsing and manipulating changelogs. It's an awesome library which you should definitely check out if you're interested in helping improve project changelogs.