# Release

## Policy

- SemVer is used. In `0.x`, incompatible changes increment the minor version.

- Each release updates `CHANGELOG.md`, runs all validation, and is released from a signed Git tag when the infrastructure allows it.

- The expected log is npm with public access for `@goastian/astian-ui`; the actual release requires an authorized account in the `@goastian` organization.

## Quality Gateway

```bash
npm ci
npm test
npm run test:e2e
npm run build
npm pack --dry-run
```

The tarball is then tested in a clean Vue/Quasar application. Only then:

```bash
npm version prerelease --preid beta # while the adoption is pilot
npm publish --tag beta
```

The stable promotion uses `npm publish --tag latest` and requires at least one live product consuming the release candidate.
