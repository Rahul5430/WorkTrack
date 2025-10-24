Perfect! Now I have enough context to propose a comprehensive architecture. Based on my analysis, I can see:

1. Current structure has some feature folders but they're empty
2. There's a DI container pattern already started
3. Mix of layers (use-cases, repositories, components) but not cleanly organized
4. Tests mirror src structure but not feature-aligned
5. WatermelonDB for local, Firestore for remote
6. Redux for state, React Navigation for routing

Let me create a comprehensive proposal for the complete redesign:

---

# 📁 Proposed Project Structure (Final Architecture)

```
WorkTrack/
├── src/
│   ├── app/
│   │   ├── index.tsx                        # App entry point with providers
│   │   ├── navigation/
│   │   │   ├── RootNavigator.tsx            # Root navigation container
│   │   │   ├── AuthNavigator.tsx            # Unauthenticated routes
│   │   │   ├── MainNavigator.tsx            # Authenticated routes
│   │   │   └── types.ts                     # Navigation type definitions
│   │   ├── providers/
│   │   │   ├── AppProviders.tsx             # All provider composition
│   │   │   ├── ThemeProvider.tsx            # Theme context provider
│   │   │   ├── DIProvider.tsx               # DI container provider
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   ├── store.ts                     # Redux store configuration
│   │   │   ├── rootReducer.ts               # Root reducer combiner
│   │   │   ├── middleware.ts                # Custom middleware
│   │   │   └── index.ts
│   │   └── initialization/
│   │       ├── bootstrap.ts                 # App initialization logic
│   │       ├── migrations.ts                # Data migrations
│   │       └── index.ts
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── User.ts              # User domain entity
│   │   │   │   │   └── AuthSession.ts       # Session entity
│   │   │   │   ├── ports/
│   │   │   │   │   ├── IAuthRepository.ts   # Auth repository interface
│   │   │   │   │   └── IAuthService.ts      # Auth service interface
│   │   │   │   ├── use-cases/
│   │   │   │   │   ├── SignInUseCase.ts
│   │   │   │   │   ├── SignOutUseCase.ts
│   │   │   │   │   ├── CheckAuthStateUseCase.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── data/
│   │   │   │   ├── repositories/
│   │   │   │   │   └── FirebaseAuthRepository.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── FirebaseAuthService.ts
│   │   │   │   ├── mappers/
│   │   │   │   │   └── UserMapper.ts        # Firebase User → Domain User
│   │   │   │   └── index.ts
│   │   │   ├── ui/
│   │   │   │   ├── screens/
│   │   │   │   │   ├── WelcomeScreen.tsx
│   │   │   │   │   ├── SignInScreen.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── SignInButton.tsx
│   │   │   │   │   ├── AuthLoadingIndicator.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useAuth.ts           # Auth state & actions
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── store/
│   │   │   │   ├── authSlice.ts             # Redux slice for auth
│   │   │   │   ├── authSelectors.ts         # Memoized selectors
│   │   │   │   └── index.ts
│   │   │   ├── di.ts                        # Feature DI registration
│   │   │   └── index.ts                     # Public feature API
│   │   │
│   │   ├── attendance/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── WorkEntry.ts         # Core work entry entity
│   │   │   │   │   ├── Tracker.ts           # Tracker entity
│   │   │   │   │   ├── WorkStatus.ts        # Status value object
│   │   │   │   │   └── DateRange.ts         # Date range value object
│   │   │   │   ├── ports/
│   │   │   │   │   ├── IEntryRepository.ts
│   │   │   │   │   ├── ITrackerRepository.ts
│   │   │   │   │   └── IEntryValidator.ts
│   │   │   │   ├── use-cases/
│   │   │   │   │   ├── CreateEntryUseCase.ts
│   │   │   │   │   ├── UpdateEntryUseCase.ts
│   │   │   │   │   ├── DeleteEntryUseCase.ts
│   │   │   │   │   ├── GetEntriesForPeriodUseCase.ts
│   │   │   │   │   ├── GetEntriesForTrackerUseCase.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── validators/
│   │   │   │   │   ├── EntryValidator.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── data/
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── WatermelonEntryRepository.ts
│   │   │   │   │   ├── FirebaseEntryRepository.ts
│   │   │   │   │   ├── WatermelonTrackerRepository.ts
│   │   │   │   │   └── FirebaseTrackerRepository.ts
│   │   │   │   ├── models/
│   │   │   │   │   ├── WorkEntryModel.ts    # WatermelonDB model
│   │   │   │   │   └── TrackerModel.ts      # WatermelonDB model
│   │   │   │   ├── schemas/
│   │   │   │   │   ├── workEntrySchema.ts   # WatermelonDB schema
│   │   │   │   │   └── trackerSchema.ts
│   │   │   │   ├── mappers/
│   │   │   │   │   ├── EntryMapper.ts       # Model ↔ Entity
│   │   │   │   │   └── TrackerMapper.ts
│   │   │   │   └── index.ts
│   │   │   ├── ui/
│   │   │   │   ├── screens/
│   │   │   │   │   ├── HomeScreen.tsx       # Main calendar view
│   │   │   │   │   ├── MonthViewScreen.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── Calendar/
│   │   │   │   │   │   ├── CalendarGrid.tsx
│   │   │   │   │   │   ├── CalendarDay.tsx
│   │   │   │   │   │   ├── CalendarHeader.tsx
│   │   │   │   │   │   ├── MonthNavigator.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── EntryForm/
│   │   │   │   │   │   ├── DayMarkingBottomSheet.tsx
│   │   │   │   │   │   ├── StatusPicker.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── TrackerSelector/
│   │   │   │   │   │   ├── WorkTrackSwitcher.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useAttendance.ts     # Main attendance hook
│   │   │   │   │   ├── useCalendar.ts       # Calendar state
│   │   │   │   │   ├── useEntryForm.ts      # Entry form logic
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── store/
│   │   │   │   ├── attendanceSlice.ts       # Redux slice
│   │   │   │   ├── attendanceSelectors.ts
│   │   │   │   └── index.ts
│   │   │   ├── di.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── sync/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── SyncOperation.ts     # Sync operation entity
│   │   │   │   │   ├── SyncQueue.ts         # Persistent queue entity
│   │   │   │   │   ├── SyncStatus.ts        # Status value object
│   │   │   │   │   └── ConflictResolution.ts
│   │   │   │   ├── ports/
│   │   │   │   │   ├── ISyncRepository.ts
│   │   │   │   │   ├── ISyncQueueRepository.ts
│   │   │   │   │   ├── INetworkMonitor.ts
│   │   │   │   │   └── IConflictResolver.ts
│   │   │   │   ├── use-cases/
│   │   │   │   │   ├── SyncToRemoteUseCase.ts
│   │   │   │   │   ├── SyncFromRemoteUseCase.ts
│   │   │   │   │   ├── EnqueueSyncOperationUseCase.ts
│   │   │   │   │   ├── ProcessSyncQueueUseCase.ts
│   │   │   │   │   ├── ResolveConflictUseCase.ts
│   │   │   │   │   ├── GetSyncStatusUseCase.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   ├── LastWriteWinsStrategy.ts
│   │   │   │   │   ├── ManualResolutionStrategy.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── data/
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── WatermelonSyncQueueRepository.ts
│   │   │   │   │   └── SyncMetadataRepository.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── NetworkMonitorService.ts
│   │   │   │   │   ├── BackgroundSyncService.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── models/
│   │   │   │   │   └── SyncOperationModel.ts
│   │   │   │   ├── schemas/
│   │   │   │   │   └── syncQueueSchema.ts
│   │   │   │   └── index.ts
│   │   │   ├── ui/
│   │   │   │   ├── components/
│   │   │   │   │   ├── SyncStatusIndicator.tsx
│   │   │   │   │   ├── SyncErrorBanner.tsx
│   │   │   │   │   ├── OfflineIndicator.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useSync.ts
│   │   │   │   │   ├── useSyncStatus.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── store/
│   │   │   │   ├── syncSlice.ts
│   │   │   │   ├── syncSelectors.ts
│   │   │   │   └── index.ts
│   │   │   ├── di.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── sharing/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Share.ts             # Share permission entity
│   │   │   │   │   ├── SharedTracker.ts
│   │   │   │   │   └── Permission.ts        # Permission value object
│   │   │   │   ├── ports/
│   │   │   │   │   ├── IShareRepository.ts
│   │   │   │   │   └── IShareValidator.ts
│   │   │   │   ├── use-cases/
│   │   │   │   │   ├── ShareTrackerUseCase.ts
│   │   │   │   │   ├── UnshareTrackerUseCase.ts
│   │   │   │   │   ├── UpdatePermissionUseCase.ts
│   │   │   │   │   ├── GetMySharesUseCase.ts
│   │   │   │   │   ├── GetSharedWithMeUseCase.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── validators/
│   │   │   │   │   └── ShareValidator.ts
│   │   │   │   └── index.ts
│   │   │   ├── data/
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── FirebaseShareRepository.ts
│   │   │   │   │   └── WatermelonSharedTrackerRepository.ts
│   │   │   │   ├── models/
│   │   │   │   │   └── SharedTrackerModel.ts
│   │   │   │   ├── schemas/
│   │   │   │   │   └── sharedTrackerSchema.ts
│   │   │   │   ├── mappers/
│   │   │   │   │   └── ShareMapper.ts
│   │   │   │   └── index.ts
│   │   │   ├── ui/
│   │   │   │   ├── screens/
│   │   │   │   │   └── ProfileScreen.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── ShareList/
│   │   │   │   │   │   ├── ShareListItem.tsx
│   │   │   │   │   │   ├── SharedWithMeListItem.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── ShareForm/
│   │   │   │   │   │   ├── ShareTrackerDialog.tsx
│   │   │   │   │   │   ├── PermissionPicker.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useSharing.ts
│   │   │   │   │   ├── useSharedTrackers.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── store/
│   │   │   │   ├── sharingSlice.ts
│   │   │   │   ├── sharingSelectors.ts
│   │   │   │   └── index.ts
│   │   │   ├── di.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── insights/                        # Future feature (placeholder)
│   │   │   ├── domain/
│   │   │   ├── data/
│   │   │   ├── ui/
│   │   │   ├── store/
│   │   │   ├── di.ts
│   │   │   └── index.ts
│   │   │
│   │   └── notifications/                   # Future feature (placeholder)
│   │       ├── domain/
│   │       ├── data/
│   │       ├── ui/
│   │       ├── store/
│   │       ├── di.ts
│   │       └── index.ts
│   │
│   ├── shared/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── BaseEntity.ts            # Base entity class
│   │   │   ├── value-objects/
│   │   │   │   ├── Email.ts
│   │   │   │   ├── UUID.ts
│   │   │   │   ├── Timestamp.ts
│   │   │   │   └── index.ts
│   │   │   ├── errors/
│   │   │   │   ├── AppError.ts              # Base error class
│   │   │   │   ├── ValidationError.ts
│   │   │   │   ├── NetworkError.ts
│   │   │   │   ├── AuthenticationError.ts
│   │   │   │   ├── SyncError.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── data/
│   │   │   ├── database/
│   │   │   │   ├── watermelon/
│   │   │   │   │   ├── Database.ts          # WatermelonDB setup
│   │   │   │   │   ├── schema.ts            # Combined schema
│   │   │   │   │   ├── migrations.ts        # Schema migrations
│   │   │   │   │   └── index.ts
│   │   │   │   ├── firebase/
│   │   │   │   │   ├── Firebase.ts          # Firebase setup
│   │   │   │   │   ├── FirestoreClient.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── storage/
│   │   │   │   ├── SecureStorage.ts         # Secure storage adapter
│   │   │   │   ├── AsyncStorageAdapter.ts
│   │   │   │   └── index.ts
│   │   │   ├── network/
│   │   │   │   ├── NetworkClient.ts         # HTTP client wrapper
│   │   │   │   ├── NetworkMonitor.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── ui/
│   │   │   ├── components/
│   │   │   │   ├── buttons/
│   │   │   │   │   ├── PrimaryButton.tsx
│   │   │   │   │   ├── SecondaryButton.tsx
│   │   │   │   │   ├── IconButton.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── inputs/
│   │   │   │   │   ├── TextField.tsx
│   │   │   │   │   ├── EmailField.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── feedback/
│   │   │   │   │   ├── Toast.tsx
│   │   │   │   │   ├── GlobalToast.tsx
│   │   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Screen.tsx
│   │   │   │   │   ├── ScreenHeader.tsx
│   │   │   │   │   ├── ListItem.tsx
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── dialogs/
│   │   │   │   │   ├── Dialog.tsx
│   │   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   │   ├── CommonBottomSheet.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useResponsive.ts
│   │   │   │   ├── useToast.ts
│   │   │   │   ├── useKeyboard.ts
│   │   │   │   ├── useNetworkStatus.ts
│   │   │   │   └── index.ts
│   │   │   ├── theme/
│   │   │   │   ├── colors.ts
│   │   │   │   ├── typography.ts
│   │   │   │   ├── spacing.ts
│   │   │   │   ├── theme.ts                 # Complete theme object
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── date/
│   │   │   │   ├── dateFormatter.ts
│   │   │   │   ├── dateCalculator.ts
│   │   │   │   └── index.ts
│   │   │   ├── validation/
│   │   │   │   ├── validators.ts
│   │   │   │   ├── schemas.ts               # Validation schemas
│   │   │   │   └── index.ts
│   │   │   ├── logging/
│   │   │   │   ├── Logger.ts
│   │   │   │   ├── LoggerConfig.ts
│   │   │   │   └── index.ts
│   │   │   ├── testing/
│   │   │   │   ├── testHelpers.ts
│   │   │   │   ├── mockFactories.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── constants/
│   │   │   ├── appConfig.ts                 # App-wide configuration
│   │   │   ├── apiEndpoints.ts
│   │   │   ├── storageKeys.ts
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── di/
│   │   ├── Container.ts                     # Main DI container
│   │   ├── ContainerBuilder.ts              # Container construction
│   │   ├── types.ts                         # DI type definitions
│   │   ├── registry.ts                      # Feature registration
│   │   └── index.ts
│   │
│   └── index.ts                             # Main app export
│
├── __tests__/
│   ├── unit/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   ├── User.test.ts
│   │   │   │   │   │   └── AuthSession.test.ts
│   │   │   │   │   └── use-cases/
│   │   │   │   │       ├── SignInUseCase.test.ts
│   │   │   │   │       ├── SignOutUseCase.test.ts
│   │   │   │   │       └── CheckAuthStateUseCase.test.ts
│   │   │   │   ├── data/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   │   └── FirebaseAuthRepository.test.ts
│   │   │   │   │   └── mappers/
│   │   │   │   │       └── UserMapper.test.ts
│   │   │   │   └── ui/
│   │   │   │       ├── screens/
│   │   │   │       │   └── WelcomeScreen.test.tsx
│   │   │   │       ├── components/
│   │   │   │       │   └── SignInButton.test.tsx
│   │   │   │       └── hooks/
│   │   │   │           └── useAuth.test.ts
│   │   │   │
│   │   │   ├── attendance/
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   ├── WorkEntry.test.ts
│   │   │   │   │   │   ├── Tracker.test.ts
│   │   │   │   │   │   └── WorkStatus.test.ts
│   │   │   │   │   ├── use-cases/
│   │   │   │   │   │   ├── CreateEntryUseCase.test.ts
│   │   │   │   │   │   ├── UpdateEntryUseCase.test.ts
│   │   │   │   │   │   └── GetEntriesForPeriodUseCase.test.ts
│   │   │   │   │   └── validators/
│   │   │   │   │       └── EntryValidator.test.ts
│   │   │   │   ├── data/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   │   ├── WatermelonEntryRepository.test.ts
│   │   │   │   │   │   └── FirebaseEntryRepository.test.ts
│   │   │   │   │   └── mappers/
│   │   │   │   │       └── EntryMapper.test.ts
│   │   │   │   └── ui/
│   │   │   │       ├── components/
│   │   │   │       │   └── Calendar/
│   │   │   │       │       └── CalendarDay.test.tsx
│   │   │   │       └── hooks/
│   │   │   │           └── useAttendance.test.ts
│   │   │   │
│   │   │   ├── sync/
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── SyncOperation.test.ts
│   │   │   │   │   └── use-cases/
│   │   │   │   │       ├── SyncToRemoteUseCase.test.ts
│   │   │   │   │       ├── SyncFromRemoteUseCase.test.ts
│   │   │   │   │       └── ProcessSyncQueueUseCase.test.ts
│   │   │   │   └── data/
│   │   │   │       └── repositories/
│   │   │   │           └── WatermelonSyncQueueRepository.test.ts
│   │   │   │
│   │   │   └── sharing/
│   │   │       ├── domain/
│   │   │       │   └── use-cases/
│   │   │       │       └── ShareTrackerUseCase.test.ts
│   │   │       └── data/
│   │   │           └── repositories/
│   │   │               └── FirebaseShareRepository.test.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── domain/
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── Email.test.ts
│   │   │   │   │   └── UUID.test.ts
│   │   │   │   └── errors/
│   │   │   │       └── AppError.test.ts
│   │   │   ├── ui/
│   │   │   │   ├── components/
│   │   │   │   │   └── buttons/
│   │   │   │   │       └── PrimaryButton.test.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── useToast.test.ts
│   │   │   └── utils/
│   │   │       ├── validation/
│   │   │       │   └── validators.test.ts
│   │   │       └── logging/
│   │   │           └── Logger.test.ts
│   │   │
│   │   └── di/
│   │       └── Container.test.ts
│   │
│   ├── integration/
│   │   ├── features/
│   │   │   ├── attendance/
│   │   │   │   ├── entry-lifecycle.test.ts  # Full entry CRUD flow
│   │   │   │   └── tracker-switching.test.ts
│   │   │   ├── sync/
│   │   │   │   ├── bidirectional-sync.test.ts
│   │   │   │   ├── offline-queue.test.ts
│   │   │   │   └── conflict-resolution.test.ts
│   │   │   └── sharing/
│   │   │       └── share-workflow.test.ts
│   │   └── app/
│   │       └── initialization.test.ts       # App bootstrap test
│   │
│   ├── e2e/                                  # Future E2E tests
│   │   └── placeholder.test.ts
│   │
│   ├── fixtures/
│   │   ├── users.ts
│   │   ├── entries.ts
│   │   ├── trackers.ts
│   │   └── index.ts
│   │
│   └── setup/
│       ├── jest.setup.ts
│       ├── mocks/
│       │   ├── firebase.mock.ts
│       │   ├── watermelon.mock.ts
│       │   ├── asyncStorage.mock.ts
│       │   └── index.ts
│       └── testUtils.ts
│
├── config/
│   ├── env/
│   │   ├── .env.development
│   │   ├── .env.staging
│   │   ├── .env.production
│   │   └── index.ts                         # Environment config loader
│   └── build/
│       ├── metro.config.js
│       └── babel.config.js
│
├── scripts/
│   ├── generate-feature.js                  # CLI to scaffold new feature
│   ├── validate-architecture.js             # Linter for architectural rules
│   └── db-migrations.js                     # Database migration runner
│
├── docs/
│   ├── ARCHITECTURE.md                      # This document (expanded)
│   ├── FEATURES.md                          # Feature development guide
│   ├── TESTING.md                           # Testing strategy
│   ├── SYNC_STRATEGY.md                     # Sync system documentation
│   └── ADR/                                 # Architecture Decision Records
│       ├── 001-feature-first-structure.md
│       ├── 002-hexagonal-architecture.md
│       ├── 003-sync-queue-design.md
│       └── 004-di-container-strategy.md
│
├── .vscode/
│   ├── settings.json
│   └── launch.json
│
├── App.tsx                                  # Root component (minimal)
├── index.js                                 # React Native entry
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.js
├── .prettierrc.js
└── README.md
```

---

## 🗂 Folder Explanations

### `src/app/`
**Purpose:** Application initialization, global providers, navigation setup, and root-level state management.

**Contains:**
- `index.tsx` – Main app entry point that composes all providers
- `navigation/` – Root navigator and screen routing logic
- `providers/` – React context providers (Theme, DI, etc.)
- `store/` – Redux store configuration, root reducer, middleware
- `initialization/` – Bootstrap logic (DB setup, migrations, auth check)

**Import Rules:**
- Can import from `features/*` (to register them)
- Can import from `shared/*`
- Can import from `di/*`
- **Cannot be imported by features** (one-way dependency)

**Notes:** This layer orchestrates the app but contains minimal business logic. It's the composition root.

---

### `src/features/`
**Purpose:** Self-contained feature modules following hexagonal architecture (domain → data → ui).

**Structure per feature:**
```
feature-name/
├── domain/          # Pure business logic (no framework dependencies)
│   ├── entities/    # Business entities
│   ├── ports/       # Interfaces (repository contracts)
│   ├── use-cases/   # Business operations
│   ├── validators/  # Domain validation rules
│   └── strategies/  # Business strategies (optional)
├── data/            # Adapters for external systems
│   ├── repositories/    # Port implementations
│   ├── services/        # External service adapters
│   ├── models/          # Database-specific models
│   ├── schemas/         # Database schemas
│   └── mappers/         # Data transformation (Model ↔ Entity)
├── ui/              # React Native presentation layer
│   ├── screens/         # Full-screen views
│   ├── components/      # Feature-specific components
│   └── hooks/           # Feature-specific React hooks
├── store/           # Feature-specific Redux slice
│   ├── {feature}Slice.ts
│   └── {feature}Selectors.ts
├── di.ts            # Feature's DI registration function
└── index.ts         # Public API (what other features can import)
```

**Import Rules:**
- `domain/` can **only** import from `shared/domain/` (no React, no DB)
- `data/` can import from `domain/` and `shared/data/`
- `ui/` can import from `domain/`, `data/`, `store/`, and `shared/ui/`
- Features **cannot** import from other features directly (must go through `shared/` or DI)
- Each feature exposes a public API via `index.ts`

**Key Features:**

1. **`auth/`**
   - Handles Google Sign-In, session management, auth state
   - Entities: `User`, `AuthSession`
   - Use Cases: `SignInUseCase`, `SignOutUseCase`, `CheckAuthStateUseCase`

2. **`attendance/`**
   - Core work tracking: entries, trackers, calendar views
   - Entities: `WorkEntry`, `Tracker`, `WorkStatus`, `DateRange`
   - Use Cases: `CreateEntryUseCase`, `UpdateEntryUseCase`, `GetEntriesForPeriodUseCase`
   - Repositories: WatermelonDB + Firestore implementations

3. **`sync/`**
   - Offline-first sync system with persistent queue
   - Entities: `SyncOperation`, `SyncQueue`, `SyncStatus`
   - Use Cases: `SyncToRemoteUseCase`, `SyncFromRemoteUseCase`, `ProcessSyncQueueUseCase`, `ResolveConflictUseCase`
   - Includes conflict resolution strategies

4. **`sharing/`**
   - Tracker sharing with permissions (read/write)
   - Entities: `Share`, `SharedTracker`, `Permission`
   - Use Cases: `ShareTrackerUseCase`, `UpdatePermissionUseCase`, `GetMySharesUseCase`

5. **`insights/` (future)**
   - Analytics dashboard, work patterns, reports
   - Ready for expansion without restructuring

6. **`notifications/` (future)**
   - Push notifications, reminders
   - Ready for expansion without restructuring

**Notes:** Each feature is a mini-application. Teams can work on different features independently.

---

### `src/shared/`
**Purpose:** Reusable code shared across features. No feature-specific logic.

**Contains:**

1. **`domain/`** – Shared domain primitives
   - `entities/BaseEntity.ts` – Base class for all entities
   - `value-objects/` – Email, UUID, Timestamp, etc.
   - `errors/` – Error hierarchy (AppError, ValidationError, SyncError)

2. **`data/`** – Shared data infrastructure
   - `database/watermelon/` – WatermelonDB setup, schema, migrations
   - `database/firebase/` – Firebase initialization, Firestore client
   - `storage/` – SecureStorage, AsyncStorage adapters
   - `network/` – HTTP client, network monitoring

3. **`ui/`** – Shared UI components and hooks
   - `components/` – Buttons, inputs, feedback, layout, dialogs
   - `hooks/` – useResponsive, useToast, useKeyboard, useNetworkStatus
   - `theme/` – Colors, typography, spacing, theme object

4. **`utils/`** – Utility functions
   - `date/` – Date formatting and calculations
   - `validation/` – Validation schemas and validators
   - `logging/` – Logger configuration
   - `testing/` – Test helpers, mock factories

5. **`constants/`** – App-wide constants
   - `appConfig.ts`, `apiEndpoints.ts`, `storageKeys.ts`

**Import Rules:**
- Can **only** import from other `shared/` modules
- **Cannot** import from `features/` or `app/`
- Should have zero circular dependencies

**Notes:** Treat `shared/` as an internal library. If it grows too large, consider extracting to a separate package.

---

### `src/di/`
**Purpose:** Dependency Injection container for managing dependencies and feature wiring.

**Contains:**
- `Container.ts` – Main DI container class
- `ContainerBuilder.ts` – Fluent API for building the container
- `types.ts` – Type definitions for all injectable dependencies
- `registry.ts` – Central registry of all features and their dependencies
- `index.ts` – Public API

**How it works:**
1. Each feature exports a `di.ts` file with a registration function
2. `registry.ts` calls all feature registration functions
3. Container is built at app startup in `app/initialization/`
4. Features receive their dependencies via the container (constructor injection)

**Import Rules:**
- Can import from all features (to register them)
- Can import from `shared/`
- Should be initialized once at app startup

**Notes:** The DI container enables loose coupling and makes testing easier (inject mocks).

---

### `__tests__/`
**Purpose:** All test files, organized to mirror the source structure.

**Structure:**

1. **`unit/`** – Fast, isolated tests
   - Mirrors `src/` folder structure exactly
   - Tests one module at a time with mocked dependencies
   - 90%+ code coverage target

2. **`integration/`** – Cross-module tests
   - Tests interactions between multiple modules
   - Uses real implementations where possible
   - Focuses on critical workflows (sync, sharing, entry lifecycle)

3. **`e2e/`** – End-to-end tests (future)
   - Full app tests using Detox or similar
   - Tests complete user journeys

4. **`fixtures/`** – Test data factories
   - Reusable test data (users, entries, trackers)

5. **`setup/`** – Test configuration
   - `jest.setup.ts` – Global test setup
   - `mocks/` – Shared mocks (Firebase, WatermelonDB, etc.)
   - `testUtils.ts` – Test utilities (render, wrappers)

**Import Rules:**
- Tests can import anything from `src/`
- Tests should use fixtures for data
- Integration tests should use real DI container

**Notes:** Tests are NOT inside `src/` to keep production bundle clean. Run with `npm run test`.

---

### `config/`
**Purpose:** Build and environment configuration files.

**Contains:**
- `env/` – Environment-specific variables (.env files)
- `build/` – Metro bundler, Babel, and build tool configs

**Notes:** Keep configs minimal and use TypeScript where possible.

---

### `scripts/`
**Purpose:** Development automation and tooling.

**Contains:**
- `generate-feature.js` – CLI to scaffold a new feature with all folders
- `validate-architecture.js` – ESLint plugin to enforce import rules
- `db-migrations.js` – Script to run database migrations

**Usage:**
```bash
npm run generate:feature insights
npm run validate:architecture
npm run migrate:db
```

**Notes:** These scripts ensure consistency and reduce boilerplate.

---

### `docs/`
**Purpose:** Architecture documentation and decision records.

**Contains:**
- `ARCHITECTURE.md` – High-level architecture overview (this doc, expanded)
- `FEATURES.md` – Guide for adding new features
- `TESTING.md` – Testing strategy and conventions
- `SYNC_STRATEGY.md` – Detailed sync system documentation
- `ADR/` – Architecture Decision Records (why we made certain choices)

**Notes:** Keep documentation close to code. Update ADRs when making architectural changes.

---

## ⚙️ Design Principles Recap

### 1. Feature-First Organization
Instead of organizing by technical layer (components/, services/, etc.), we organize by business feature (auth/, attendance/, sync/). This makes it easier to:
- Understand the system at a glance
- Work on one feature without touching others
- Delete or replace features cleanly
- Scale to multiple developers (feature ownership)

### 2. Hexagonal Architecture (Ports & Adapters)
Each feature follows a three-layer structure:
- **Domain** (core business logic) – Pure, framework-agnostic code
- **Data** (adapters) – Implementations that talk to external systems (DB, API)
- **UI** (presentation) – React Native components and screens

The domain layer defines **ports** (interfaces), and the data layer provides **adapters** (implementations). This makes the system:
- Testable (mock the adapters)
- Flexible (swap implementations without changing business logic)
- Portable (domain logic works anywhere)

### 3. Dependency Inversion & DI Container
Features depend on **abstractions** (interfaces), not concrete implementations. The DI container wires everything together at runtime. Benefits:
- Loose coupling between features
- Easy to test (inject mocks)
- Centralized dependency management
- Clear initialization order

### 4. Offline-First Sync with Persistent Queue
The sync system is a first-class feature with:
- **Persistent queue** for operations (survives app restarts)
- **Conflict resolution strategies** (last-write-wins, manual)
- **Retry logic** with exponential backoff
- **Network monitoring** to sync when online

This ensures data integrity and a smooth UX even in poor network conditions.

### 5. Strict Module Boundaries
Import rules enforce architectural layers:
```
app/ → features/ → shared/
        ↓ (via DI)
features/ ✗ features/ (no direct cross-feature imports)
domain/ ✗ data/ (domain never imports data)
domain/ ✗ ui/ (domain never imports React)
```

These rules are enforced via ESLint (see `scripts/validate-architecture.js`).

### 6. Test-Driven Structure
Every source file has a corresponding test file with the same path. This makes it easy to:
- Find tests for any module
- Measure coverage gaps
- Ensure new code is tested

Tests are organized by type (unit, integration, e2e) and mirror the source structure.

---

## ✅ Next Steps

Before coding begins, complete these planning steps:

1. **Review & Approve Structure**
   - Walk through this document with stakeholders
   - Identify any missing features or layers
   - Adjust based on team feedback

2. **Define Feature Boundaries**
   - List all entities per feature
   - Define public APIs (what each feature exposes)
   - Document cross-feature communication patterns

3. **Set Up Architecture Validation**
   - Configure ESLint rules for import restrictions
   - Set up dependency graph visualization
   - Document architectural guidelines in `docs/FEATURES.md`

4. **Create Feature Scaffolding Script**
   - Build `scripts/generate-feature.js` to automate folder creation
   - Include templates for common files (di.ts, index.ts, etc.)
   - Test by generating a dummy feature

5. **Plan Migration Strategy**
   - Identify which modules can be migrated first (start with `shared/`)
   - Create a phased migration plan (don't rewrite everything at once)
   - Set up A/B structure to migrate incrementally

6. **Document ADRs**
   - Write Architecture Decision Records for key choices
   - Include: context, decision, consequences, alternatives considered
   - Store in `docs/ADR/`

7. **Set Up CI/CD for New Structure**
   - Update build scripts to handle new folder structure
   - Configure test runners for unit/integration separation
   - Set up coverage thresholds per feature

8. **Define Shared Contracts First**
   - Start with `shared/domain/errors/` and `shared/domain/value-objects/`
   - Define interfaces for all repositories (ports)
   - Create DTOs for cross-feature communication

Once these steps are complete, begin implementation feature-by-feature, starting with `shared/`, then `auth/`, then `attendance/`, then `sync/`, then `sharing/`.

---

**End of Proposed Architecture**