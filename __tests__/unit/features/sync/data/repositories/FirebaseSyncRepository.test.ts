import {
	collection,
	doc,
	getDocs,
	getFirestore,
	writeBatch,
} from '@react-native-firebase/firestore';

import { FirebaseSyncRepository } from '@/features/sync/data/repositories/FirebaseSyncRepository';
import type { SyncOperationPayload } from '@/features/sync/domain/entities/SyncOperation';

jest.mock('@react-native-firebase/app', () => ({
	getApp: jest.fn(() => ({ id: 'mock-app' })),
}));

jest.mock('@react-native-firebase/auth', () => ({
	getAuth: jest.fn(() => ({
		currentUser: { uid: 'user-1' },
	})),
}));

jest.mock('@react-native-firebase/firestore', () => {
	const mockBatch = {
		set: jest.fn().mockReturnThis(),
		delete: jest.fn().mockReturnThis(),
		commit: jest.fn().mockResolvedValue(undefined),
	};

	const mockDoc = jest.fn(() => ({
		id: 'mock-doc-id',
	}));

	const mockCollection = jest.fn(() => ({
		doc: jest.fn(() => mockDoc()),
		where: jest.fn().mockReturnThis(),
		get: jest.fn(),
	}));

	const mockQuerySnapshot = {
		docs: [],
		size: 0,
	};

	return {
		getFirestore: jest.fn(() => ({
			collection: mockCollection,
		})),
		collection: jest.fn((_ref, _path) => mockCollection()),
		doc: jest.fn((_ref, _path) => mockDoc()),
		collectionGroup: jest.fn(() => ({
			where: jest.fn().mockReturnThis(),
		})),
		query: jest.fn((ref, ..._constraints) => ref),
		where: jest.fn(() => ({ type: 'where' })),
		writeBatch: jest.fn(() => mockBatch),
		getDocs: jest.fn().mockResolvedValue(mockQuerySnapshot),
	};
});

describe('FirebaseSyncRepository', () => {
	let repository: FirebaseSyncRepository;
	let mockCollection: jest.Mock;
	let mockBatch: {
		set: jest.Mock;
		delete: jest.Mock;
		commit: jest.Mock;
	};
	let mockDoc: {
		set: jest.Mock;
		delete: jest.Mock;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockDoc = {
			set: jest.fn(),
			delete: jest.fn(),
		};
		mockBatch = {
			set: jest.fn().mockReturnThis(),
			delete: jest.fn().mockReturnThis(),
			commit: jest.fn().mockResolvedValue(undefined),
		};

		mockCollection = jest.fn(() => ({
			doc: jest.fn(() => mockDoc),
			where: jest.fn().mockReturnThis(),
			get: jest.fn(),
		}));

		// Setup mocks for modular API
		(getFirestore as jest.Mock).mockReturnValue({
			collection: mockCollection,
		});
		(writeBatch as jest.Mock).mockReturnValue(mockBatch);
		(collection as jest.Mock).mockImplementation((_ref, _path) => {
			if (_path) {
				return mockCollection();
			}
			return mockCollection();
		});
		(doc as jest.Mock).mockImplementation((_ref, ..._pathSegments) => {
			return mockDoc;
		});
		(getDocs as jest.Mock).mockResolvedValue({
			docs: [],
			size: 0,
		});

		repository = new FirebaseSyncRepository();
	});

	describe('syncToRemote', () => {
		it('syncs create operations to Firestore', async () => {
			const operations: { id: string; payload: SyncOperationPayload }[] =
				[
					{
						id: 'op-1',
						payload: {
							tableName: 'work_entries',
							recordId: 'entry-1',
							operation: 'create',
							data: {
								date: '2024-01-01',
								status: 'office',
								trackerId: 'tracker-1',
							},
						},
					},
				];

			const result = await repository.syncToRemote(operations);

			// For work_entries, it uses subcollection: trackers/{trackerId}/entries/{entryId}
			expect(doc).toHaveBeenCalled();
			expect(collection).toHaveBeenCalled();
			expect(mockBatch.set).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					date: '2024-01-01',
					status: 'office',
				}),
				{ merge: true }
			);
			expect(mockBatch.commit).toHaveBeenCalled();
			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({ opId: 'op-1', success: true });
		});

		it('syncs update operations to Firestore', async () => {
			const operations: { id: string; payload: SyncOperationPayload }[] =
				[
					{
						id: 'op-2',
						payload: {
							tableName: 'trackers',
							recordId: 'tracker-1',
							operation: 'update',
							data: { name: 'Updated Tracker' },
						},
					},
				];

			const result = await repository.syncToRemote(operations);

			expect(mockBatch.set).toHaveBeenCalledWith(
				mockDoc,
				{ name: 'Updated Tracker' },
				{ merge: true }
			);
			expect(mockBatch.commit).toHaveBeenCalled();
			expect(result[0]).toEqual({ opId: 'op-2', success: true });
		});

		it('skips set when data is undefined for create operation', async () => {
			const operations: { id: string; payload: SyncOperationPayload }[] =
				[
					{
						id: 'op-1',
						payload: {
							tableName: 'work_entries',
							recordId: 'entry-1',
							operation: 'create',
							data: undefined,
						},
					},
				];

			const result = await repository.syncToRemote(operations);

			expect(mockBatch.set).not.toHaveBeenCalled();
			expect(mockBatch.commit).toHaveBeenCalled();
			expect(result[0]).toEqual({ opId: 'op-1', success: true });
		});

		it('skips set when data is undefined for update operation', async () => {
			const operations: { id: string; payload: SyncOperationPayload }[] =
				[
					{
						id: 'op-2',
						payload: {
							tableName: 'trackers',
							recordId: 'tracker-1',
							operation: 'update',
							data: undefined,
						},
					},
				];

			const result = await repository.syncToRemote(operations);

			expect(mockBatch.set).not.toHaveBeenCalled();
			expect(mockBatch.commit).toHaveBeenCalled();
			expect(result[0]).toEqual({ opId: 'op-2', success: true });
		});

		it('syncs delete operations to Firestore', async () => {
			const operations: { id: string; payload: SyncOperationPayload }[] =
				[
					{
						id: 'op-3',
						payload: {
							tableName: 'work_entries',
							recordId: 'entry-1',
							operation: 'delete',
							data: { trackerId: 'tracker-1' },
						},
					},
				];

			const result = await repository.syncToRemote(operations);

			expect(mockBatch.delete).toHaveBeenCalledWith(expect.anything());
			expect(mockBatch.commit).toHaveBeenCalled();
			expect(result[0]).toEqual({ opId: 'op-3', success: true });
		});

		it('syncs delete operation for trackers table', async () => {
			const operations: { id: string; payload: SyncOperationPayload }[] =
				[
					{
						id: 'op-4',
						payload: {
							tableName: 'trackers',
							recordId: 'tracker-1',
							operation: 'delete',
							data: undefined, // Delete doesn't need data
						},
					},
				];

			const result = await repository.syncToRemote(operations);

			expect(mockBatch.delete).toHaveBeenCalledWith(expect.anything());
			expect(mockBatch.commit).toHaveBeenCalled();
			expect(result[0]).toEqual({ opId: 'op-4', success: true });
		});

		it('syncs delete operation for shares table', async () => {
			const operations: { id: string; payload: SyncOperationPayload }[] =
				[
					{
						id: 'op-5',
						payload: {
							tableName: 'shares',
							recordId: 'share-1',
							operation: 'delete',
							data: { trackerId: 'tracker-1' },
						},
					},
				];

			const result = await repository.syncToRemote(operations);

			expect(mockBatch.delete).toHaveBeenCalledWith(expect.anything());
			expect(mockBatch.commit).toHaveBeenCalled();
			expect(result[0]).toEqual({ opId: 'op-5', success: true });
		});

		it('skips work_entry operation when trackerId is missing', async () => {
			const loggerWarnSpy = jest.spyOn(
				require('@/shared/utils/logging').logger,
				'warn'
			);

			const operations: { id: string; payload: SyncOperationPayload }[] =
				[
					{
						id: 'op-1',
						payload: {
							tableName: 'work_entries',
							recordId: 'entry-1',
							operation: 'create',
							data: {
								date: '2024-01-01',
								status: 'office',
								// Missing trackerId - data exists but trackerId is undefined
							},
						},
					},
				];

			const result = await repository.syncToRemote(operations);

			expect(loggerWarnSpy).toHaveBeenCalledWith(
				'Sync operation missing trackerId for work_entry',
				expect.objectContaining({
					operationId: 'op-1',
				})
			);
			// Batch operations are skipped, but batch.commit is still called (might be empty batch)
			expect(mockBatch.commit).toHaveBeenCalled();
			// All operations return success, even if skipped
			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({ opId: 'op-1', success: true });

			loggerWarnSpy.mockRestore();
		});

		it('skips share operation when trackerId is missing', async () => {
			const loggerWarnSpy = jest.spyOn(
				require('@/shared/utils/logging').logger,
				'warn'
			);

			const operations: { id: string; payload: SyncOperationPayload }[] =
				[
					{
						id: 'op-1',
						payload: {
							tableName: 'shares',
							recordId: 'share-1',
							operation: 'create',
							data: {
								permission: 'read',
								// Missing trackerId - data exists but trackerId is undefined
							},
						},
					},
				];

			const result = await repository.syncToRemote(operations);

			expect(loggerWarnSpy).toHaveBeenCalledWith(
				'Sync operation missing trackerId for share',
				expect.objectContaining({
					operationId: 'op-1',
				})
			);
			// Batch operations are skipped, but batch.commit is still called (might be empty batch)
			expect(mockBatch.commit).toHaveBeenCalled();
			// All operations return success, even if skipped
			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({ opId: 'op-1', success: true });

			loggerWarnSpy.mockRestore();
		});

		it('syncs multiple operations in a batch', async () => {
			const operations: { id: string; payload: SyncOperationPayload }[] =
				[
					{
						id: 'op-1',
						payload: {
							tableName: 'trackers',
							recordId: 'tracker-1',
							operation: 'create',
							data: { name: 'Tracker 1' },
						},
					},
					{
						id: 'op-2',
						payload: {
							tableName: 'users',
							recordId: 'user-1',
							operation: 'update',
							data: { name: 'User 1' },
						},
					},
				];

			const result = await repository.syncToRemote(operations);

			expect(mockBatch.set).toHaveBeenCalled();
			expect(mockBatch.commit).toHaveBeenCalledTimes(1);
			expect(result).toHaveLength(2);
		});
	});

	describe('syncFromRemote', () => {
		it('syncs from remote without since date', async () => {
			const mockSnapshot = {
				size: 5,
				docs: [],
			};

			(getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

			await repository.syncFromRemote();

			// Verify that getDocs was called (actual implementation details may vary)
			expect(getDocs).toHaveBeenCalled();
		});

		it('syncs from remote with since date', async () => {
			const since = new Date('2024-01-01T00:00:00Z');
			const mockSnapshot = { size: 3, docs: [] };

			(getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

			await repository.syncFromRemote(since);

			// Verify that getDocs was called
			expect(getDocs).toHaveBeenCalled();
		});

		it('processes all collections', async () => {
			(getDocs as jest.Mock).mockResolvedValue({
				size: 0,
				docs: [],
			});

			await repository.syncFromRemote();

			// Verify that getDocs was called
			expect(getDocs).toHaveBeenCalled();
		});
	});
});
