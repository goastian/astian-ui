# Release

## Policy

- SemVer is used. In `0.x`, incompatible changes increment the minor version.

- Each release updates `CHANGELOG.md`, runs all validation, and is released from a signed Git tag when the infrastructure allows it.

- The expected log is npm with public access for `@goastian/astian-ui`; the actual release requires an authorized account in the `@goastian` organization.

## Quality Gateway

```bash
npm ci
npm run check
npm test
npm run build
npm run test:package
npm run test:consumer
npm pack --dry-run
```

Run the targeted Playwright routes when a change affects rendered interaction,
theme, or responsive layout. The clean Vue/Quasar consumer and compressed
bundle budgets are mandatory for every package release. Only then:

```bash
npm version prerelease --preid beta # while the adoption is pilot
npm publish --tag beta
```

The stable promotion uses `npm publish --tag latest` and requires at least one live product consuming the release candidate.
