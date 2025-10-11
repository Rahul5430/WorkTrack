import {
	EntryDTO,
	EntryWithTrackerDTO,
	IBaseEntryRepository,
	ILocalEntryRepository,
	IRemoteEntryRepository,
	IShareRepository,
	ITrackerRepository,
	Permission,
	ShareDTO,
	SyncStatusDTO,
	TrackerDTO,
	TrackerWithSharesDTO,
	UserPermissionDTO,
	WorkTrackManager,
} from '../../../src/types';

describe('types/index', () => {
	it('should export Permission type', () => {
		const permissions: Permission[] = ['read', 'write'];

		permissions.forEach((permission) => {
			expect(typeof permission).toBe('string');
			expect(['read', 'write']).toContain(permission);
		});
	});

	it('should export TrackerDTO interface', () => {
		const tracker: TrackerDTO = {
			id: 'tracker1',
			name: 'Work Tracker',
			color: '#2196F3',
			ownerId: 'user1',
			isDefault: true,
			trackerType: 'work_track',
		};

		expect(tracker.id).toBe('tracker1');
		expect(tracker.name).toBe('Work Tracker');
		expect(tracker.color).toBe('#2196F3');
		expect(tracker.ownerId).toBe('user1');
		expect(tracker.isDefault).toBe(true);
		expect(tracker.trackerType).toBe('work_track');
	});

	it('should export EntryDTO interface', () => {
		const entry: EntryDTO = {
			id: 'entry1',
			trackerId: 'tracker1',
			date: '2025-01-01',
			status: 'office',
			isAdvisory: false,
			needsSync: true,
			lastModified: Date.now(),
			syncError: 'Network error',
			retryCount: 3,
		};

		expect(entry.id).toBe('entry1');
		expect(entry.trackerId).toBe('tracker1');
		expect(entry.date).toBe('2025-01-01');
		expect(entry.status).toBe('office');
		expect(entry.isAdvisory).toBe(false);
		expect(entry.needsSync).toBe(true);
		expect(typeof entry.lastModified).toBe('number');
		expect(entry.syncError).toBe('Network error');
		expect(entry.retryCount).toBe(3);
	});

	it('should export ShareDTO interface', () => {
		const share: ShareDTO = {
			trackerId: 'tracker1',
			sharedWithId: 'user2',
			permission: 'read',
			sharedWithEmail: 'user2@example.com',
		};

		expect(share.trackerId).toBe('tracker1');
		expect(share.sharedWithId).toBe('user2');
		expect(share.permission).toBe('read');
		expect(share.sharedWithEmail).toBe('user2@example.com');
	});

	it('should export TrackerWithSharesDTO interface', () => {
		const trackerWithShares: TrackerWithSharesDTO = {
			id: 'tracker1',
			name: 'Work Tracker',
			color: '#2196F3',
			ownerId: 'user1',
			isDefault: true,
			trackerType: 'work_track',
			shares: [
				{
					trackerId: 'tracker1',
					sharedWithId: 'user2',
					permission: 'read',
				},
			],
		};

		expect(trackerWithShares.shares).toHaveLength(1);
		expect(trackerWithShares.shares[0].permission).toBe('read');
	});

	it('should export EntryWithTrackerDTO interface', () => {
		const entryWithTracker: EntryWithTrackerDTO = {
			id: 'entry1',
			trackerId: 'tracker1',
			date: '2025-01-01',
			status: 'office',
			isAdvisory: false,
			needsSync: true,
			lastModified: Date.now(),
			trackerName: 'Work Tracker',
			trackerColor: '#2196F3',
		};

		expect(entryWithTracker.trackerName).toBe('Work Tracker');
		expect(entryWithTracker.trackerColor).toBe('#2196F3');
	});

	it('should export SyncStatusDTO interface', () => {
		const syncStatus: SyncStatusDTO = {
			isSyncing: false,
			isOnline: true,
			lastSyncTime: Date.now(),
			error: 'Network error',
			errorType: 'network',
		};

		expect(syncStatus.isSyncing).toBe(false);
		expect(syncStatus.isOnline).toBe(true);
		expect(typeof syncStatus.lastSyncTime).toBe('number');
		expect(syncStatus.error).toBe('Network error');
		expect(syncStatus.errorType).toBe('network');
	});

	it('should export UserPermissionDTO interface', () => {
		const userPermission: UserPermissionDTO = {
			userId: 'user1',
			email: 'user1@example.com',
			permission: 'write',
			role: 'editor',
			department: 'Engineering',
		};

		expect(userPermission.userId).toBe('user1');
		expect(userPermission.email).toBe('user1@example.com');
		expect(userPermission.permission).toBe('write');
		expect(userPermission.role).toBe('editor');
		expect(userPermission.department).toBe('Engineering');
	});

	it('should export repository interfaces', () => {
		// Test that the interfaces can be used (they're just type definitions)
		const trackerRepo: ITrackerRepository = {} as never;
		const baseEntryRepo: IBaseEntryRepository = {} as never;
		const localEntryRepo: ILocalEntryRepository = {} as never;
		const remoteEntryRepo: IRemoteEntryRepository = {} as never;
		const shareRepo: IShareRepository = {} as never;

		expect(trackerRepo).toBeDefined();
		expect(baseEntryRepo).toBeDefined();
		expect(localEntryRepo).toBeDefined();
		expect(remoteEntryRepo).toBeDefined();
		expect(shareRepo).toBeDefined();
	});

	it('should export WorkTrackManager interface', () => {
		// Test that the interface can be used (it's just a type definition)
		const workTrackManager: WorkTrackManager = {} as never;

		expect(workTrackManager).toBeDefined();
	});

	it('should have correct type structure for all exports', () => {
		// Test that all exported types are properly structured
		const testData = {
			permission: 'read' as Permission,
			tracker: {
				id: 'tracker1',
				name: 'Work Tracker',
				color: '#2196F3',
				ownerId: 'user1',
				isDefault: true,
				trackerType: 'work_track',
			} as TrackerDTO,
			entry: {
				id: 'entry1',
				trackerId: 'tracker1',
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				needsSync: true,
				lastModified: Date.now(),
			} as EntryDTO,
			share: {
				trackerId: 'tracker1',
				sharedWithId: 'user2',
				permission: 'read' as Permission,
			} as ShareDTO,
		};

		expect(typeof testData.permission).toBe('string');
		expect(typeof testData.tracker.id).toBe('string');
		expect(typeof testData.entry.date).toBe('string');
		expect(typeof testData.share.permission).toBe('string');
	});
});
