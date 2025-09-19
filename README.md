![Coverage](https://codecov.io/gh/Rahul5430/WorkTrack/branch/main/graph/badge.svg)
[![Checks](https://github.com/Rahul5430/WorkTrack/actions/workflows/checks.yml/badge.svg?branch=main)](https://github.com/Rahul5430/WorkTrack/actions/workflows/checks.yml?query=branch%3Amain)
[![Android Build](https://github.com/Rahul5430/WorkTrack/actions/workflows/android.yml/badge.svg?branch=main)](https://github.com/Rahul5430/WorkTrack/actions/workflows/android.yml?query=branch%3Amain)
[![iOS Build](https://github.com/Rahul5430/WorkTrack/actions/workflows/ios.yml/badge.svg?branch=main)](https://github.com/Rahul5430/WorkTrack/actions/workflows/ios.yml?query=branch%3Amain)

# WorkTrack

Minimalistic React Native app for tracking work-from-office/work-from-home attendance.

Features:

- Mark days as WFO/WFH
- Add holidays in advance
- Monthly trend charts
- Offline-first, syncs when online
- Role-based sharing with family
- Playground mode for predictions

## 🚀 Getting Started

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

## 🧪 Testing

- Full suite with coverage:

```sh
npm run test:coverage
```

- Coverage threshold enforced at 95% via Jest `coverageThreshold`.

## ⚙️ CI/CD

Workflows on pushes to `main`:

- Checks: ESLint, TypeScript typecheck, tests with coverage, Codecov, security audit
- Android Build: builds debug APK and uploads artifact and Release asset
- iOS Build: builds simulator app and uploads artifact

### 📥 Download Android debug APK

- Latest Release asset (stable link):
    - https://github.com/Rahul5430/WorkTrack/releases/download/android-debug-latest/app-debug.apk
- Or visit Releases page: https://github.com/Rahul5430/WorkTrack/releases

## 📦 Folder Structure

- `__tests__/` – unit and integration tests
- `src/` – application code
    - `db/` – local database (WatermelonDB)
    - `repositories/` – data access layers (Firebase/Watermelon)
    - `use-cases/` – business logic
    - `services/` – external services (Firebase, toast queue)
    - `utils/` – helpers and validation

## 📖 Learn More

- React Native docs: https://reactnative.dev
- Firebase Emulator: https://firebase.google.com/docs/emulator-suite

## Codecov Setup

- CI uploads `coverage/lcov.info` via `codecov/codecov-action@v4`.
- Add `CODECOV_TOKEN` in GitHub repo Settings → Secrets and variables → Actions.
