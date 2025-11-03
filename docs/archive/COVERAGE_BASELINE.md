# Coverage Baseline Report

Generated: 2025-11-01

## Overall Coverage

| Metric     | Current | Target | Gap     |
| ---------- | ------- | ------ | ------- |
| Statements | 45.84%  | 95%    | -49.16% |
| Branches   | 49.43%  | 95%    | -45.57% |
| Functions  | 54.38%  | 95%    | -40.62% |
| Lines      | 46.45%  | 95%    | -48.55% |

## Low Coverage Modules (<90%)

### 0% Coverage - Critical Priority

1. **app/initialization/bootstrap.ts** - 0%
2. **features/attendance/data/mappers/EntryMapper.ts** - 25%
3. **features/attendance/data/mappers/TrackerMapper.ts** - 33%
4. **features/attendance/data/repositories/WatermelonEntryRepository.ts** - 0%
5. **features/attendance/data/repositories/WatermelonTrackerRepository.ts** - 0%
6. **features/auth/data/repositories/FirebaseAuthRepository.ts** - 0%
7. **features/auth/data/services/FirebaseAuthService.ts** - 0%
8. **features/sharing/domain/use-cases/GetMySharesUseCase.ts** - 0%
9. **features/sharing/domain/use-cases/GetSharedWithMeUseCase.ts** - 0%
10. **features/sharing/domain/use-cases/ShareTrackerUseCase.ts** - 0%
11. **features/sharing/domain/use-cases/UnshareTrackerUseCase.ts** - 0%
12. **features/sharing/domain/use-cases/UpdatePermissionUseCase.ts** - 0%
13. **features/sharing/data/repositories/FirebaseShareRepository.ts** - 0%
14. **features/sharing/domain/entities/SharedTracker.ts** - 0%
15. **features/sync/data/repositories/FirebaseSyncRepository.ts** - 0%
16. **features/sync/data/services/NetworkMonitorService.ts** - 0%
17. **features/sync/domain/strategies/LastWriteWinsStrategy.ts** - 0%
18. **features/sync/domain/strategies/ManualResolutionStrategy.ts** - 0%
19. **shared/data/database/firebase/FirestoreClient.ts** - 3.27%
20. **shared/data/network/NetworkClient.ts** - 0%
21. **shared/data/network/NetworkMonitor.ts** - 0%
22. **shared/data/storage/AsyncStorageAdapter.ts** - 0%
23. **shared/data/storage/SecureStorage.ts** - 0%
24. **shared/utils/date/dateCalculator.ts** - 0%
25. **shared/utils/date/dateFormatter.ts** - 0%
26. **shared/utils/toast/ToastQueueService.ts** - 0%
27. **shared/utils/validation/schemas.ts** - 0%
28. **shared/utils/validation/validators.ts** - 0%
29. **shared/utils/testing/mockFactories.ts** - 0%
30. **shared/utils/testing/testHelpers.ts** - 0%
31. **features/attendance/domain/ports** (all) - 0%
32. **features/auth/domain/ports** (all) - 0%
33. **features/sync/domain/ports** (all) - 0%
34. **features/sharing/domain/ports** (all) - 0%

### Low Coverage (<90%) - High Priority

1. **features/sync/data/services/SyncManager.ts** - 38.66%
2. **shared/utils/logging/Logger.ts** - 61.53%
3. **features/sharing/data/repositories/WatermelonSharedTrackerRepository.ts** - 83.33%
4. **features/sync/domain/use-cases/ProcessSyncQueueUseCase.ts** - 93.54%
5. **features/sync/domain/use-cases/SyncToRemoteUseCase.ts** - 85.71%
6. **features/attendance/data/repositories/SyncingEntryRepositoryDecorator.ts** - 72.72%
7. **features/attendance/data/repositories/SyncingTrackerRepositoryDecorator.ts** - 80%
8. **features/attendance/domain/entities/WorkEntry.ts** - 87.5%
9. **features/attendance/domain/entities/DateRange.ts** - 92.85%
10. **features/attendance/domain/entities/Tracker.ts** - 91.66%
11. **features/attendance/domain/validators/EntryValidator.ts** - 50%
12. **features/auth/domain/entities/AuthSession.ts** - 85.29%
13. **features/sharing/domain/entities/Share.ts** - 84.61%
14. **features/sharing/domain/validators/ShareValidator.ts** - 85.71%
15. **features/sync/domain/entities/SyncOperation.ts** - 80.95%
16. **features/sync/data/repositories/InMemorySyncQueueRepository.ts** - 94.44%
17. **shared/domain/value-objects/Email.ts** - 96.22%
18. **shared/domain/value-objects/Timestamp.ts** - 96.61%

### Store & Selectors (0% but excluded from threshold)

1. **app/store/reducers/userSlice.ts** - 72.72%
2. **app/store/reducers/workTrackSlice.ts** - 66.66%
3. **features/attendance/store/attendanceSelectors.ts** - 0%
4. **features/auth/store/authSelectors.ts** - 0%
5. **features/sharing/store/sharingSelectors.ts** - 0%
6. **features/sync/store/syncSelectors.ts** - 0%
7. **features/sync/store/syncSlice.ts** - 0%

### UI Hooks (Low Priority - excluded from coverage)

Many UI hooks have low coverage but are excluded by configuration. Will add basic tests for critical hooks.

## Test Coverage by Feature

### Attendance Feature

- Domain use-cases: ✅ 100%
- Domain entities: ⚠️ 89.83% (need to improve WorkEntry, DateRange, Tracker)
- Data mappers: ❌ 28.57% (critical - EntryMapper, TrackerMapper)
- Data repositories: ❌ 16.32% (critical - Watermelon repositories)

### Auth Feature

- Domain use-cases: ✅ 100%
- Domain entities: ⚠️ 90% (AuthSession needs improvement)
- Data mappers: ✅ 100%
- Data repositories: ❌ 0% (FirebaseAuthRepository)
- Data services: ❌ 0% (FirebaseAuthService)

### Sharing Feature

- Domain use-cases: ❌ 0% (all use-cases untested)
- Domain entities: ⚠️ 44.82% (SharedTracker untested)
- Data mappers: ✅ 100%
- Data repositories: ⚠️ 55.55% (FirebaseShareRepository untested)

### Sync Feature

- Domain use-cases: ⚠️ 93.02% (ProcessSyncQueueUseCase needs improvement)
- Domain entities: ⚠️ 82.14%
- Data repositories: ⚠️ 73.4% (FirebaseSyncRepository untested)
- Data services: ❌ 36.25% (SyncManager, NetworkMonitorService)
- Domain strategies: ❌ 0% (both strategies untested)

### Shared

- Domain errors: ✅ 100%
- Domain value-objects: ⚠️ 97.31%
- Data database/firebase: ❌ 18.42% (FirestoreClient critical)
- Data network: ❌ 0% (NetworkClient, NetworkMonitor)
- Data storage: ❌ 0% (AsyncStorageAdapter, SecureStorage)
- Utils: ❌ Many untested utilities

## Action Plan

### Phase 1: Critical Repositories & Mappers

1. WatermelonEntryRepository
2. WatermelonTrackerRepository
3. EntryMapper
4. TrackerMapper
5. FirebaseAuthRepository
6. FirebaseAuthService
7. FirestoreClient

### Phase 2: Sharing Use-Cases

1. ShareTrackerUseCase
2. UnshareTrackerUseCase
3. GetMySharesUseCase
4. GetSharedWithMeUseCase
5. UpdatePermissionUseCase
6. FirebaseShareRepository

### Phase 3: Sync Services & Strategies

1. SyncManager (improve coverage)
2. NetworkMonitorService
3. FirebaseSyncRepository
4. LastWriteWinsStrategy
5. ManualResolutionStrategy

### Phase 4: Shared Utilities

1. NetworkClient
2. NetworkMonitor
3. AsyncStorageAdapter
4. SecureStorage
5. Date utilities
6. Validation utilities
7. Toast utilities

### Phase 5: App Initialization

1. bootstrap.ts
2. initializeRuntime

### Phase 6: Remaining Entities & Validators

1. SharedTracker entity
2. EntryValidator (improve coverage)
3. Improve coverage for existing entities

## Notes

- UI screens and components are excluded from coverage (per jest.config.js)
- Index files are excluded from coverage
- Type/model/schema files are excluded from coverage
- Ports (interfaces) typically don't need tests, but we should verify implementations
