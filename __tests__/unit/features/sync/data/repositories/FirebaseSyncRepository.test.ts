import firestore from '@react-native-firebase/firestore';

import { FirebaseSyncRepository } from '@/features/sync/data/repositories/FirebaseSyncRepository';

jest.mock('@react-native-firebase/firestore', () => {
	const mockBatch = {
		set: jest.fn().mockReturnThis(),
		delete: jest.fn().mockReturnThis(),
		commit: jest.fn().mockResolvedValue(undefined),
	};

	const mockDoc = {
		set: jest.fn(),
		delete: jest.fn(),
	};

	const mockCollection = jest.fn(() => ({
		doc: jest.fn(() => mockDoc),
		where: jest.fn().mockReturnThis(),
		get: jest.fn(),
	}));

	return {
		__esModule: true,
		default: jest.fn(() => ({
			collection: mockCollection,
			batch: jest.fn(() => mockBatch),
		})),
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
		repository = new FirebaseSyncRepository();
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

		(firestore as unknown as jest.Mock).mockReturnValue({
			collection: mockCollection,
			batch: jest.fn(() => mockBatch),
		});
		jest.clearAllMocks();
	});

	describe('syncToRemote', () => {
		it('syncs create operations to Firestore', async () => {
			const operations = [
				{
					id: 'op-1',
					payload: {
						tableName: 'work_entries',
						recordId: 'entry-1',
						operation: 'create',
						data: { date: '2024-01-01', status: 'office' },
					},
				},
			];

			const result = await repository.syncToRemote(operations);

			expect(mockCollection).toHaveBeenCalledWith('work_entries');
			expect(mockBatch.set).toHaveBeenCalledWith(
				mockDoc,
				{ date: '2024-01-01', status: 'office' },
				{ merge: true }
			);
			expect(mockBatch.commit).toHaveBeenCalled();
			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({ opId: 'op-1', success: true });
		});

		it('syncs update operations to Firestore', async () => {
			const operations = [
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
			const operations = [
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
			const operations = [
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
			const operations = [
				{
					id: 'op-3',
					payload: {
						tableName: 'work_entries',
						recordId: 'entry-1',
						operation: 'delete',
					},
				},
			];

			const result = await repository.syncToRemote(operations);

			expect(mockBatch.delete).toHaveBeenCalledWith(mockDoc);
			expect(mockBatch.commit).toHaveBeenCalled();
			expect(result[0]).toEqual({ opId: 'op-3', success: true });
		});

		it('syncs multiple operations in a batch', async () => {
			const operations = [
				{
					id: 'op-1',
					payload: {
						tableName: 'work_entries',
						recordId: 'entry-1',
						operation: 'create',
						data: { date: '2024-01-01' },
					},
				},
				{
					id: 'op-2',
					payload: {
						tableName: 'work_entries',
						recordId: 'entry-2',
						operation: 'delete',
					},
				},
			];

			const result = await repository.syncToRemote(operations);

			expect(mockBatch.set).toHaveBeenCalled();
			expect(mockBatch.delete).toHaveBeenCalled();
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

			mockCollection.mockReturnValue({
				doc: jest.fn(),
				where: jest.fn().mockReturnThis(),
				get: jest.fn().mockResolvedValue(mockSnapshot),
			});

			await repository.syncFromRemote();

			expect(mockCollection).toHaveBeenCalledWith('work_entries');
			expect(mockCollection).toHaveBeenCalledWith('trackers');
			expect(mockCollection).toHaveBeenCalledWith('users');
			expect(mockCollection).toHaveBeenCalledWith('shares');
		});

		it('syncs from remote with since date', async () => {
			const since = new Date('2024-01-01T00:00:00Z');
			const mockSnapshot = { size: 3, docs: [] };
			const mockQuery = {
				where: jest.fn().mockReturnThis(),
				get: jest.fn().mockResolvedValue(mockSnapshot),
			};

			// The implementation calls firestore().collection(name).where(...).get()
			// So we need to set up the mock so collection().where() returns a query with get()
			const mockCollectionInstance = {
				doc: jest.fn(),
				where: jest.fn(() => mockQuery),
				get: jest.fn().mockResolvedValue(mockSnapshot),
			};

			mockCollection.mockReturnValue(mockCollectionInstance);

			await repository.syncFromRemote(since);

			// The implementation calls query.where('updated_at', '>', sinceMs).get()
			// So mockCollectionInstance.where should be called, which returns mockQuery
			// Then mockQuery.where should be called, then mockQuery.get
			expect(mockCollectionInstance.where).toHaveBeenCalledWith(
				'updated_at',
				'>',
				since.getTime()
			);
			expect(mockQuery.get).toHaveBeenCalled();
		});

		it('processes all collections', async () => {
			mockCollection.mockReturnValue({
				doc: jest.fn(),
				where: jest.fn().mockReturnThis(),
				get: jest.fn().mockResolvedValue({ size: 0, docs: [] }),
			});

			await repository.syncFromRemote();

			expect(mockCollection).toHaveBeenCalledTimes(4);
		});
	});
});
