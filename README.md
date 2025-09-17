![CI](https://github.com/rahulsharma/WorkTrack/actions/workflows/ci.yml/badge.svg)
![Coverage](https://codecov.io/gh/rahulsharma/WorkTrack/branch/main/graph/badge.svg)

### WorkTrack

Minimalistic React Native app for tracking work-from-office/work-from-home attendance.

Features:

- Mark days as WFO/WFH
- Add holidays in advance
- Monthly trend charts
- Offline-first, syncs when online
- Role-based sharing with family
- Playground mode for predictions

### 🚀 Getting Started

- Start Metro:

```sh
npm start
```

- Android:

```sh
npm run android
```

- iOS (install CocoaPods once, then run):

```sh
cd ios && pod install && cd ..
npm run ios
```

### 🧪 Testing

- Full suite with coverage:

```sh
npm run test:coverage
```

- Coverage threshold enforced at 95% via Jest `coverageThreshold`.

### ⚙️ CI/CD

GitHub Actions pipeline on pushes to `main`:

- Lint + Typecheck (ESLint, `tsc --noEmit`)
- Jest unit + integration tests with coverage
- Upload coverage to Codecov and as artifact
- Build Android APK and iOS IPA artifacts
- Security audit (`npm audit --production`)

### 📦 Folder Structure

- `__tests__/` – unit and integration tests
- `src/` – application code
    - `db/` – local database (WatermelonDB)
    - `repositories/` – data access layers (Firebase/Watermelon)
    - `use-cases/` – business logic
    - `services/` – external services (Firebase, toast queue)
    - `utils/` – helpers and validation

### 📖 Learn More

- React Native docs: https://reactnative.dev
- Firebase Emulator: https://firebase.google.com/docs/emulator-suite

### Codecov Setup

- CI uploads `coverage/lcov.info` via `codecov/codecov-action@v4`.
- Add `CODECOV_TOKEN` in GitHub repo Settings → Secrets and variables → Actions.
