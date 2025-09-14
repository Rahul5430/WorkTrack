# WorkTrack Application Flow Diagram

## Complete Application Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                UI LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  App.tsx                                                                        │
│  ├── MainNavigator.tsx                                                          │
│  │   ├── WelcomeNavigator.tsx → WelcomeScreen.tsx                              │
│  │   ├── LoadingNavigator.tsx → LoadingScreen.tsx                              │
│  │   └── AuthenticatedNavigator.tsx → HomeScreen.tsx, ProfileScreen.tsx        │
│  └── Components/                                                                │
│      ├── Calendar/ (CustomCalendar, MonthCalendar, CalendarDay)                 │
│      ├── Profile/ (ProfileInfo, ShareListItem, SharedWithMeListItem)           │
│      ├── sync/ (SyncErrorBanner, SyncStatusIndicator)                          │
│      ├── worktrack/ (WorkTrackSwitcher, DayMarkingBottomSheet)                 │
│      └── ui/ (Toast, CommonBottomSheet, FocusAwareStatusBar, etc.)             │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            HOOK LAYER (Facade)                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  useWorkTrackManager()                                                          │
│  ├── Sync Operations: sync(), syncFromRemote(), startPeriodicSync()            │
│  ├── Share Operations: share(), updateSharePermission()                        │
│  ├── Tracker Operations: getMyTrackers(), getSharedTrackers(), createTracker() │
│  ├── User Management: userManagement.*                                         │
│  ├── Entry Operations: entry.*                                                 │
│  └── Share Read Operations: shareRead.*                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            USE CASE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│  SyncUseCase                                                                     │
│  ├── SyncToRemoteUseCase → Uploads local changes to Firebase                    │
│  └── SyncFromRemoteUseCase → Downloads remote changes to local                 │
│                                                                                 │
│  ShareUseCase → Manages tracker sharing permissions                             │
│  ShareReadUseCase → Reads and manages share permissions                         │
│  UserManagementUseCase → User-specific tracker management                       │
│  EntryUseCase → Entry creation, updates, and queries                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          REPOSITORY LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│  FirebaseTrackerRepository → Firestore tracker operations                       │
│  WatermelonEntryRepository → Local SQLite entry operations                      │
│  FirebaseShareRepository → Firestore sharing operations                        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Firebase Firestore (Remote)                                                   │
│  ├── /users/{userId} → User profiles                                           │
│  ├── /trackers/{trackerId} → Tracker definitions                               │
│  │   ├── /entries/{entryId} → Work entries (sub-collection)                    │
│  │   └── /shares/{shareId} → Sharing permissions (sub-collection)              │
│                                                                                 │
│  WatermelonDB SQLite (Local)                                                   │
│  ├── trackers table → Local tracker cache                                      │
│  ├── work_tracks table → Local work entries                                    │
│  └── shared_trackers table → Local share cache                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Key Application Flows

### 1. User Authentication Flow

```
WelcomeScreen.tsx
├── Google Sign-In → Firebase Auth
├── Create/Update user in Firestore
├── manager.syncFromRemote() → Download existing data
├── manager.startPeriodicSync() → Start background sync
└── Navigate to HomeScreen
```

### 2. Work Entry Creation Flow

```
HomeScreen.tsx (User clicks day)
├── DayMarkingBottomSheet.tsx
├── User selects status (wfh/office/holiday/leave)
├── manager.entry.createOrUpdateEntry()
│   ├── EntryUseCase.createOrUpdateEntry()
│   ├── ValidationUtils.validateEntryData()
│   ├── WatermelonEntryRepository.upsertOne()
│   └── Mark as needsSync: true
└── UI updates with new entry
```

### 3. Sync Process Flow

```
SyncTrigger (Periodic/Manual)
├── SyncUseCase.execute()
│   ├── SyncToRemoteUseCase.execute()
│   │   ├── WatermelonEntryRepository.listUnsynced()
│   │   ├── Group entries by trackerId
│   │   ├── WatermelonEntryRepository.upsertMany() → Firebase
│   │   └── WatermelonEntryRepository.markSynced()
│   └── SyncFromRemoteUseCase.execute()
│       ├── FirebaseTrackerRepository.listOwned()
│       ├── FirebaseTrackerRepository.listSharedWith()
│       └── Download entries for each tracker
└── Update sync status
```

### 4. Tracker Sharing Flow

```
ProfileScreen.tsx (User shares tracker)
├── User enters email
├── ValidationUtils.validateEmail()
├── manager.share()
│   ├── ShareUseCase.shareByEmail()
│   ├── FirebaseShareRepository.share()
│   └── Create share permission in Firestore
└── Update UI with new share
```

### 5. Data Loading Flow (HomeScreen)

```
HomeScreen.tsx (Component mounts)
├── manager.userManagement.checkAndFixRecordsWithoutTrackerId()
├── manager.syncFromRemote() → Download latest data
├── manager.userManagement.ensureUserHasTracker()
├── manager.entry.getEntriesForTracker()
├── Transform entries to workTrackData
└── Update Redux store → UI re-renders
```

## Error Handling Flow

```
Any Operation
├── Try/Catch in Use Case
├── ErrorHandler.wrapAsync() → Consistent error wrapping
├── AppError hierarchy (ValidationError, SyncError, FirebaseAppError)
├── Logger.error() → Centralized logging
└── UI shows appropriate error message
```

## State Management Flow

```
Redux Store
├── userSlice → Authentication state
│   ├── isLoggedIn: boolean
│   ├── user: GoogleUser
│   └── errorMessage: string
└── workTrackSlice → Work tracking state
    ├── workTrackData: MarkedDay[]
    ├── currentWorkTrack: Tracker
    └── isLoading: boolean
```

## Key Dependencies

- **React Navigation** → Screen navigation
- **Redux Toolkit** → State management
- **Firebase Auth** → User authentication
- **Firebase Firestore** → Remote data storage
- **WatermelonDB** → Local data storage
- **React Native Paper** → UI components
- **React Native Reanimated** → Animations
- **React Native Gesture Handler** → Touch interactions

## Data Flow Summary

1. **UI Events** → useWorkTrackManager hook
2. **Hook** → Use Cases (business logic)
3. **Use Cases** → Repositories (data access)
4. **Repositories** → Firebase/WatermelonDB (storage)
5. **Storage** → Data persistence
6. **Sync** → Bidirectional data synchronization
7. **State Updates** → Redux store updates
8. **UI Re-render** → User sees updated data

This architecture ensures:

- **Separation of Concerns** → Each layer has a specific responsibility
- **Testability** → Each layer can be tested independently
- **Maintainability** → Clear boundaries between layers
- **Scalability** → Easy to add new features or modify existing ones
- **Error Handling** → Consistent error management throughout
- **Type Safety** → Full TypeScript coverage with no `any` types
