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
npm run test:marketing
npm pack --dry-run
```

`test:consumer` must install the exact tarball, import ESM and CommonJS without
DOM globals, run `renderToString`, build the conventional Quasar consumer and
measure modular Vite profiles against a Vue-only baseline. `test:marketing` is
mandatory for the 0.4 surface and validates 320, 375, 414 and 768 px. The clean
consumer, compressed budgets and targeted browser behavior are release gates.
Only then:

```bash
npm version prerelease --preid beta # while the adoption is pilot
npm publish --tag beta
```

The stable promotion uses `npm publish --tag latest` and requires at least one live product consuming the release candidate.
