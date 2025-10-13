import { SharePermission } from '../use-cases/shareReadUseCase';
import { MarkedDayStatus } from './calendar';

export type Permission = 'read' | 'write';

// Core DTOs for data transfer between layers
export interface TrackerDTO {
	id: string;
	name: string;
	color: string;
	ownerId: string;
	isDefault: boolean;
	trackerType: string;
}

export interface EntryDTO {
	id: string;
	trackerId: string;
	date: string;
	status: string;
	isAdvisory: boolean;
	needsSync: boolean;
	lastModified: number;
	syncError?: string;
	retryCount?: number;
}

export interface ShareDTO {
	trackerId: string;
	sharedWithId: string;
	permission: Permission;
	sharedWithEmail?: string;
}

// Extended DTOs for UI display
export interface TrackerWithSharesDTO extends TrackerDTO {
	shares: ShareDTO[];
}

export interface EntryWithTrackerDTO extends EntryDTO {
	trackerName: string;
	trackerColor: string;
}

// Sync status types
export interface SyncStatusDTO {
	isSyncing: boolean;
	isOnline: boolean;
	lastSyncTime?: number;
	error?: string;
	errorType?: 'network' | 'auth' | 'server' | 'unknown';
}

// User permission types for advanced sharing (future-ready)
export interface UserPermissionDTO {
	userId: string;
	email: string;
	permission: Permission;
	role?: 'viewer' | 'editor' | 'admin';
	department?: string;
}

export interface ITrackerRepository {
	create(tracker: TrackerDTO, userId: string): Promise<void>;
	update(
		tracker: Partial<TrackerDTO> & { id: string },
		userId: string
	): Promise<void>;
	listOwned(userId: string): Promise<TrackerDTO[]>;
	listSharedWith(userId: string): Promise<TrackerDTO[]>;
	ensureExists(id: string, ownerId: string): Promise<void>;
	upsertMany(trackers: TrackerDTO[]): Promise<void>;
}

// Base interface for all entry repositories
export interface IBaseEntryRepository {
	upsertMany(trackerId: string, entries: EntryDTO[]): Promise<void>;
	upsertOne(entry: EntryDTO): Promise<void>;
	delete(entryId: string): Promise<void>;
	getEntriesForTracker(trackerId: string): Promise<EntryDTO[]>;
	getAllEntries(): Promise<EntryDTO[]>;
}

// Interface for local entry repositories (with sync capabilities)
export interface ILocalEntryRepository extends IBaseEntryRepository {
	listUnsynced(): Promise<EntryDTO[]>;
	markSynced(entries: EntryDTO[]): Promise<void>;
	getFailedSyncRecords(): Promise<EntryDTO[]>;
	getRecordsExceedingRetryLimit(limit: number): Promise<EntryDTO[]>;
}

// Interface for remote entry repositories (Firebase)
export interface IRemoteEntryRepository extends IBaseEntryRepository {
	// Remote repositories don't need sync methods as they're already synced
}

export interface IShareRepository {
	share(data: ShareDTO): Promise<void>;
	unshare(trackerId: string, sharedWithId: string): Promise<void>;
	updatePermission(
		trackerId: string,
		sharedWithId: string,
		permission: Permission
	): Promise<void>;
}

export interface WorkTrackManager {
	sync(): Promise<void>;
	share(
		email: string,
		permission: Permission,
		trackerId?: string
	): Promise<void>;
	// Sync utilities
	startPeriodicSync(intervalMs?: number): Promise<void>;
	stopPeriodicSync(): void;
	triggerSync(): Promise<void>;
	syncFromRemote(): Promise<void>;
	updateSharePermission(
		sharedWithId: string,
		permission: Permission,
		trackerId?: string
	): Promise<void>;
	getSyncStatus(): Promise<SyncStatusDTO>;
	// Trackers
	getMyTrackers(): Promise<TrackerDTO[]>;
	getSharedTrackers(): Promise<TrackerDTO[]>;
	createTracker(tracker: Omit<TrackerDTO, 'ownerId'>): Promise<void>;
	updateTracker(
		tracker: Partial<Omit<TrackerDTO, 'ownerId'>> & { id: string }
	): Promise<void>;
	// Use cases
	shareRead: {
		getMyShares(): Promise<SharePermission[]>;
		getSharedWithMe(): Promise<SharePermission[]>;
		removeShare(sharedWithId: string, trackerId?: string): Promise<void>;
	};
	userManagement: {
		ensureUserHasTracker(userId: string): Promise<TrackerDTO>;
		initializeUserData(userId: string): Promise<TrackerDTO>;
		getTrackerByOwnerId(ownerId: string): Promise<TrackerDTO | null>;
		getDefaultViewUserId(): Promise<string | null>;
		setDefaultViewUserId(userId: string | null): Promise<void>;
		checkAndFixRecordsWithoutTrackerId(): Promise<void>;
		ensureDatabaseReady(): Promise<void>;
	};
	entry: {
		createOrUpdateEntry(data: {
			trackerId: string;
			date: string;
			status: MarkedDayStatus;
			isAdvisory: boolean;
		}): Promise<void>;
		getFailedSyncRecords(): Promise<EntryDTO[]>;
		getRecordsExceedingRetryLimit(limit: number): Promise<EntryDTO[]>;
		getEntriesForTracker(trackerId: string): Promise<EntryDTO[]>;
	};
}

// Navigation types
export * from './navigation';

// Calendar types
export * from './calendar';
