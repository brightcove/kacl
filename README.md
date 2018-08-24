# kacl

[**K**eep **a** **C**hange**l**og](https://keepachangelog.com/en/1.0.0/) tooling for linting and automatically releasing changelogs

## Usage

### Installation

```bash
npm i -D @brightcove/kacl
```

### Recommended usage in package.json

```json
{
  "scripts": {
    "pretest": "kacl lint",
    "preversion": "kacl prerelease",
    "version": "kacl release && git add CHANGELOG.md"
  }
}
```

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
