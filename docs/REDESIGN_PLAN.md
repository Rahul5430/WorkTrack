# WorkTrack V2 — Complete Redesign Plan

This document is the master plan for the new app architecture, used by both humans and AI during development.

---

## 🧩 Architecture Design

Previous architecture had limitations:

- Multiple unsynchronized sync triggers
- Data collisions (date used as ID)
- No offline queue → lost data
- Random UI/data coupling
- Architecture not scalable

Current architecture provides: Reliability, Offline-first, Maintainability, Testability

---

## ✅ Target Architecture

✅ Feature-First  
✅ Hexagonal (Ports & Adapters)  
✅ DI-powered  
✅ Domain-driven  
✅ Optimistic UI  
✅ Smart Sync System  
✅ Unit-tested from Day 1

📌 Detailed folder and module structure is in:
`docs/ARCHITECTURE_STRUCTURE.md`

---

## 🔌 Core Technologies

| Layer      | Tech                          |
| ---------- | ----------------------------- |
| Local DB   | WatermelonDB                  |
| Remote     | Firebase Firestore            |
| Sync       | Event-driven queue w/ backoff |
| Navigation | React Navigation              |
| State      | Redux Toolkit                 |
| Testing    | Jest + unit + integration     |
| Dev Tools  | Cursor + CI                   |

---

## 🏁 Scope of V2

| Category      | Status   | Notes                           |
| ------------- | -------- | ------------------------------- |
| Attendance    | ✅       | Calendar UX preserved           |
| Sync          | ✅       | Fully redesigned                |
| Sharing       | ✅       | Same UI, new logic              |
| Auth          | ✅       | Cached login + offline fallback |
| Insights      | ⏳ Later | Future feature                  |
| Notifications | ⏳ Later | Future feature                  |

---

## 🔄 Development Principles

| Principle                  | Meaning                       |
| -------------------------- | ----------------------------- |
| Keep UI visuals consistent | Maintain user experience      |
| Feature-first architecture | Clear separation of concerns  |
| Test-driven development    | Tests enforce correctness     |
| Offline-first sync         | Reliable data synchronization |

---

## 🚫 Forbidden in V2

- Direct Firebase calls in UI
- Starting sync from screens
- Mutating Redux outside reducers
- Domain importing from Data/UI
- Async logic inside components without use-cases

---

## ✅ First-Wave Milestones

| Order | Module            | Status Target                         |
| ----- | ----------------- | ------------------------------------- |
| 1     | Shared foundation | ✅ Value objects, errors, DB, logging |
| 2     | DI Container      | ✅ Feature registration               |
| 3     | Auth              | ✅ Sign-in + caching + DI             |
| 4     | Attendance        | ✅ CRUD + calendar integration        |
| 5     | Sync              | ✅ Offline queue + conflict strategy  |
| 6     | Sharing           | ✅ Permissions + shared trackers      |
| 7     | App bootstrap     | ✅ Navigation & providers             |

---

## 🧪 Testing Targets by Milestone

| Area           | Coverage Req       |
| -------------- | ------------------ |
| Shared domain  | 100%               |
| Feature domain | ≥95%               |
| Sync subsystem | 100% queue logic   |
| UI             | Snapshot stability |
| Integration    | Main workflows e2e |

---

## ✅ Performance Guarantees

- Sync never blocks UI
- Writes always succeed offline
- Entries never lost unless deleted by user
- Minimal network usage during normal operation
- Queue remains consistent across crashes

---

## Final Mission Statement

> WorkTrack V2 shall **never lose a user’s work data**  
> — no matter the network, crashes, or conflicts.

This document stays pinned as THE reference for all redesign decisions.
