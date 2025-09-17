### Local development

- **Pre-commit**: runs ESLint (fix) + Prettier + TypeScript type-check on staged files only via lint-staged.
- **Pre-push**: runs unit tests only (`npm run test:unit`) for fast feedback.

Useful scripts:

- `npm run lint`: ESLint across repo
- `npm run lint:fix`: ESLint with --fix
- `npm run test:unit`: run unit tests
- `npm run test:integration`: run integration tests
- `npm run test:coverage`: run full suite with coverage

### CI/CD (GitHub Actions)

Workflow `ci.yml` runs on pushes to `main`:

- lint-and-typecheck: installs deps, runs ESLint and `tsc --noEmit`.
- test: runs full test suite with coverage; enforces ≥95% via Jest `coverageThreshold`; uploads coverage artifact.
- build-artifacts: builds Android APK and iOS IPA; uploads as artifacts.
- security: runs `npm audit --production` and fails on moderate+ issues.

Artifacts:

- Find downloadable APK/IPA and coverage under the workflow run → Artifacts.

### Notes

- Integration tests and coverage are skipped locally for speed; they run on CI.
- Node 20 is required.
