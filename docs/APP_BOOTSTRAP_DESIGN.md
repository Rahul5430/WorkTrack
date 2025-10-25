# WorkTrack V2 — App Bootstrap Design

This document defines the startup flow and runtime orchestration for WorkTrack V2, ensuring a reliable, offline-first app boot experience.

---

## ✅ Goals

- One single initialization path ✅
- No duplicate sync triggers ✅
- Fully offline boot ✅
- Clear UI feedback (loading, error, retry) ✅
- Stable DI and database initialization ✅

---

## 🏗 Architecture Overview

index.js
↓ Render(App)
App.tsx
↓ AppProviders (Theme, Store, DI, Toast, Network)
AppBootstrap
↓ Sequential Initialization
RootNavigator (Auth or Main)

---

## 🎬 App Boot Sequence (strict order)

| Step | System | Purpose | Needs Internet? |
|------|--------|---------|----------------|
| 1 | Load .env | Firebase emulator config / sync settings | ❌ |
| 2 | Initialize DI Container | Register repositories and use-cases | ❌ |
| 3 | Initialize Database | WatermelonDB + migrations | ❌ |
| 4 | Initialize Secure Storage | Restore auth session | ❌ |
| 5 | Initialize Redux Store | State from storage or defaults | ❌ |
| 6 | Initialize Sync System | Queue + event listeners | ❌ |
| 7 | Auto-authenticate | Try cached Firebase auth | ✅ (fallback offline) |
| 8 | Render UI | Show loading → Auth/Main screens | ❌ |

✅ App must be fully operational offline  
✅ Sync operations will run only after online is confirmed

---

## 🧩 Modules Involved

| Module | Path | Role |
|--------|------|-----|
| DI Container | `src/di/Container.ts` | Construct dependencies |
| Database Setup | `src/shared/data/database/` | Local persistence |
| Store | `src/app/store/` | Global state |
| SyncManager | `src/features/sync/` | Background sync |
| Auth Session Init | `src/features/auth/` | Quick sign-in |

---

## 🧱 Boot Components

| Component | Path | Role |
|----------|------|-----|
| `AppProviders.tsx` | `src/app/providers/` | Wraps all contexts |
| `bootstrap.ts` | `src/app/initialization/` | Runs boot sequence |
| `RootNavigator.tsx` | `src/app/navigation/` | Switch based on auth |

---

## ✅ UI States at Boot

| Phase | UI |
|------|---|
| Before initialization | Splash screen |
| While initializing | LoadingScreen |
| After success (authed) | HomeScreen |
| After success (unauth) | WelcomeScreen |
| After persistent failure | Retry dialog |

Transition is deterministic and single-path — no race conditions.

---

## 🔄 Sync Manager Startup Rules

✅ Start only after DB + DI + Session ready  
✅ Listen to network status, backoff retry  
✅ Queue entries during boot but do not sync until online  
✅ Never block UI

```ts
syncManager.start({
  immediate: false, // dont sync on boot
  onStatus: dispatch(syncStatusUpdate)
});


⸻

🧪 Boot Testing Strategy

Test Type	Coverage
Unit	DI init, database setup, auth cache restoration
Integration	From bootstrap → correct navigator rendering
Offline Tests	Full boot offline should succeed
Sync Tests	No sync until online


⸻

✅ Final Note

This is the only place allowed to initialize global systems.
If any feature needs initialization — register it in the DI container, not in UI components.

Strict rule:

UI → must not hold boot logic
Boot → must not assume online state
