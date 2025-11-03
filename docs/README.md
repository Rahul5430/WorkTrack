# WorkTrack Documentation

Comprehensive documentation for WorkTrack V2 architecture, patterns, and development practices.

---

## 📚 Core Documentation

### Architecture & Design

| Document                      | Purpose                                                  |
| ----------------------------- | -------------------------------------------------------- |
| **PHILOSOPHY.md**             | Core principles: offline-first, reliability, testability |
| **REDESIGN_PLAN.md**          | Master V2 architecture plan and implementation roadmap   |
| **ARCHITECTURE_STRUCTURE.md** | Detailed folder structure and module organization        |
| **APP_BOOTSTRAP_DESIGN.md**   | App initialization flow and boot sequence                |

### Architecture Decision Records (ADR)

| ADR     | Topic                   | Decision                                              |
| ------- | ----------------------- | ----------------------------------------------------- |
| **001** | Feature-First Structure | Organize by feature for scalability and ownership     |
| **002** | Hexagonal Architecture  | Domain-driven with ports & adapters                   |
| **003** | Sync Queue Design       | WatermelonDB-backed persistent queue with retry logic |
| **004** | DI Container Strategy   | Custom DI with feature registration                   |

### Development Guides

| Document             | Purpose                                                         |
| -------------------- | --------------------------------------------------------------- |
| **FEATURES.md**      | Feature development guide and checklist                         |
| **TESTING.md**       | Testing strategy, conventions, and coverage targets (95%+ goal) |
| **SYNC_STRATEGY.md** | Offline-first sync system design                                |
| **UI_FLOW_MAP.md**   | Complete UI screen, component, and hook flow map                |

### Progress Tracking

| Document               | Status | Purpose                                      |
| ---------------------- | ------ | -------------------------------------------- |
| **COVERAGE_REPORT.md** | Active | Test coverage progress (69.47% → 95% target) |

---

## 📦 Archive

Historical documentation has been archived in `docs/archive/`:

- **V1_REMOVAL_REPORT.md** - Complete V1 cleanup audit
- **UNUSED_ANALYSIS.md** - Dead code and unused dependency analysis
- **COVERAGE_BASELINE.md** - Initial coverage snapshot (45.84%)

See `docs/archive/README.md` for details.

---

## 🏗️ Quick Reference

### Key Patterns

- **Feature-First**: Each feature is self-contained in `src/features/<feature>/`
- **Hexagonal Architecture**: Domain, Data, UI layers with strict boundaries
- **DI Container**: Centralized dependency injection via `src/di/Container.ts`
- **Offline-First**: Local-first with background sync
- **Test Coverage**: 95%+ target with strict enforcement

### Technology Stack

| Layer      | Technology                |
| ---------- | ------------------------- |
| Local DB   | WatermelonDB              |
| Remote DB  | Firebase Firestore        |
| State      | Redux Toolkit             |
| Navigation | React Navigation          |
| Testing    | Jest (unit + integration) |
| CI/CD      | GitHub Actions            |

---

## 🚀 Getting Started

1. Read **PHILOSOPHY.md** for core principles
2. Review **REDESIGN_PLAN.md** for architecture overview
3. Check **FEATURES.md** for development workflow
4. See **TESTING.md** for test standards
5. Reference **ARCHITECTURE_STRUCTURE.md** for file organization

---

**Last Updated:** 2025-01-XX  
**Status:** V2 Active Development
