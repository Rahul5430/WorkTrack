// migrated to V2 structure
import { Database } from '@nozbe/watermelondb';

// Mock WatermelonDB Database
export const mockDatabase = {
	adapter: {
		schema: {},
		migrations: {},
	},
	collections: {
		get: jest.fn(),
	},
	write: jest.fn(),
	read: jest.fn(),
	batch: jest.fn(),
	unsafeResetDatabase: jest.fn(),
	destroyPermanently: jest.fn(),
} as unknown as Database;

// Mock WatermelonDB models
export const mockWorkEntry = {
	id: 'test-work-entry-id',
	date: '2024-01-01',
	status: 'office',
	isAdvisory: false,
	notes: 'Test notes',
	createdAt: new Date('2024-01-01T00:00:00Z'),
	updatedAt: new Date('2024-01-01T00:00:00Z'),
	userId: 'test-user-id',
	trackerId: 'test-tracker-id',
	syncStatus: 'synced',
	lastSyncedAt: new Date('2024-01-01T00:00:00Z'),
	observe: jest.fn(),
	update: jest.fn(),
	markAsDeleted: jest.fn(),
	destroyPermanently: jest.fn(),
};

export const mockTracker = {
	id: 'test-tracker-id',
	name: 'Test Tracker',
	description: 'Test Description',
	isActive: true,
	createdAt: new Date('2024-01-01T00:00:00Z'),
	updatedAt: new Date('2024-01-01T00:00:00Z'),
	userId: 'test-user-id',
	syncStatus: 'synced',
	lastSyncedAt: new Date('2024-01-01T00:00:00Z'),
	observe: jest.fn(),
	update: jest.fn(),
	markAsDeleted: jest.fn(),
	destroyPermanently: jest.fn(),
};

export const mockUser = {
	id: 'test-user-id',
	email: 'test@example.com',
	name: 'Test User',
	photoUrl: 'https://example.com/photo.jpg',
	isActive: true,
	createdAt: new Date('2024-01-01T00:00:00Z'),
	updatedAt: new Date('2024-01-01T00:00:00Z'),
	syncStatus: 'synced',
	lastSyncedAt: new Date('2024-01-01T00:00:00Z'),
	observe: jest.fn(),
	update: jest.fn(),
	markAsDeleted: jest.fn(),
	destroyPermanently: jest.fn(),
};

export const mockShare = {
	id: 'test-share-id',
	trackerId: 'test-tracker-id',
	sharedWithUserId: 'test-shared-user-id',
	permission: 'read',
	isActive: true,
	createdAt: new Date('2024-01-01T00:00:00Z'),
	updatedAt: new Date('2024-01-01T00:00:00Z'),
	createdByUserId: 'test-user-id',
	syncStatus: 'synced',
	lastSyncedAt: new Date('2024-01-01T00:00:00Z'),
	observe: jest.fn(),
	update: jest.fn(),
	markAsDeleted: jest.fn(),
	destroyPermanently: jest.fn(),
};

export const mockSyncQueue = {
	id: 'test-sync-queue-id',
	operation: 'create',
	tableName: 'work_entries',
	recordId: 'test-record-id',
	data: '{"test": "data"}',
	status: 'pending',
	retryCount: 0,
	maxRetries: 3,
	errorMessage: null,
	createdAt: new Date('2024-01-01T00:00:00Z'),
	updatedAt: new Date('2024-01-01T00:00:00Z'),
	nextRetryAt: null,
	observe: jest.fn(),
	update: jest.fn(),
	markAsDeleted: jest.fn(),
	destroyPermanently: jest.fn(),
};

// Mock collection queries
export const mockCollection = {
	query: jest.fn().mockReturnThis(),
	observe: jest.fn(),
	observeWithColumns: jest.fn(),
	fetch: jest.fn(),
	create: jest.fn(),
	createRecord: jest.fn(),
	find: jest.fn(),
	findAndObserve: jest.fn(),
	markAllAsDeleted: jest.fn(),
	destroyAllPermanently: jest.fn(),
	unsafeClear: jest.fn(),
	unsafeResetDatabase: jest.fn(),
};

// Mock database collections
(mockDatabase.collections.get as jest.Mock).mockImplementation(
	(tableName: string) => {
		switch (tableName) {
			case 'work_entries':
				return mockCollection;
			case 'trackers':
				return mockCollection;
			case 'users':
				return mockCollection;
			case 'shares':
				return mockCollection;
			case 'sync_queue':
				return mockCollection;
			default:
				return mockCollection;
		}
	}
);

// Mock database operations

(mockDatabase.write as jest.Mock).mockImplementation(
	async (callback: () => unknown | Promise<unknown>) => {
		return await callback();
	}
);

(mockDatabase.read as jest.Mock).mockImplementation(
	async (callback: () => unknown | Promise<unknown>) => {
		return await callback();
	}
);

(mockDatabase.batch as jest.Mock).mockImplementation(() => ({
	create: jest.fn(),
	update: jest.fn(),
	markAsDeleted: jest.fn(),
	destroyPermanently: jest.fn(),
	commit: jest.fn(),
}));

export default mockDatabase;
