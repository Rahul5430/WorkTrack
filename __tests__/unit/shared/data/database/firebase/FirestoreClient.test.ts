import { FirestoreClient } from '@/shared/data/database/firebase/FirestoreClient';

// Store mock firestore instance reference globally for test assertions
let mockFirestoreInstance: { id: string };

jest.mock('firebase/firestore', () => {
	const mockDocFn = jest.fn();
	const mockCollectionFn = jest.fn();
	const mockGetDocFn = jest.fn();
	const mockGetDocsFn = jest.fn();
	const mockSetDocFn = jest.fn();
	const mockUpdateDocFn = jest.fn();
	const mockDeleteDocFn = jest.fn();
	const mockOnSnapshotFn = jest.fn();
	const mockQueryFn = jest.fn();
	const mockWriteBatchFn = jest.fn();
	const mockWhereFn = jest.fn(() => ({ type: 'where' }));
	const mockOrderByFn = jest.fn(() => ({ type: 'orderBy' }));
	const mockLimitFn = jest.fn(() => ({ type: 'limit' }));
	const mockStartAfterFn = jest.fn(() => ({ type: 'startAfter' }));
	const mockTimestampFromDateFn = jest.fn((date: Date) => ({
		toDate: jest.fn(() => date),
	}));

	// Make mocks available globally for tests
	(global as { mockDoc?: typeof mockDocFn }).mockDoc = mockDocFn;
	(global as { mockCollection?: typeof mockCollectionFn }).mockCollection =
		mockCollectionFn;
	(global as { mockGetDoc?: typeof mockGetDocFn }).mockGetDoc = mockGetDocFn;
	(global as { mockGetDocs?: typeof mockGetDocsFn }).mockGetDocs =
		mockGetDocsFn;
	(global as { mockSetDoc?: typeof mockSetDocFn }).mockSetDoc = mockSetDocFn;
	(global as { mockUpdateDoc?: typeof mockUpdateDocFn }).mockUpdateDoc =
		mockUpdateDocFn;
	(global as { mockDeleteDoc?: typeof mockDeleteDocFn }).mockDeleteDoc =
		mockDeleteDocFn;
	(global as { mockOnSnapshot?: typeof mockOnSnapshotFn }).mockOnSnapshot =
		mockOnSnapshotFn;
	(global as { mockQuery?: typeof mockQueryFn }).mockQuery = mockQueryFn;
	(global as { mockWriteBatch?: typeof mockWriteBatchFn }).mockWriteBatch =
		mockWriteBatchFn;
	(global as { mockWhere?: typeof mockWhereFn }).mockWhere = mockWhereFn;
	(global as { mockOrderBy?: typeof mockOrderByFn }).mockOrderBy =
		mockOrderByFn;
	(global as { mockLimit?: typeof mockLimitFn }).mockLimit = mockLimitFn;
	(global as { mockStartAfter?: typeof mockStartAfterFn }).mockStartAfter =
		mockStartAfterFn;
	(
		global as { mockTimestampFromDate?: typeof mockTimestampFromDateFn }
	).mockTimestampFromDate = mockTimestampFromDateFn;

	return {
		collection: mockCollectionFn,
		doc: mockDocFn,
		getDoc: mockGetDocFn,
		getDocs: mockGetDocsFn,
		setDoc: mockSetDocFn,
		updateDoc: mockUpdateDocFn,
		deleteDoc: mockDeleteDocFn,
		onSnapshot: mockOnSnapshotFn,
		query: mockQueryFn,
		writeBatch: mockWriteBatchFn,
		serverTimestamp: jest.fn(() => ({ _methodName: 'serverTimestamp' })),
		where: mockWhereFn,
		orderBy: mockOrderByFn,
		limit: mockLimitFn,
		startAfter: mockStartAfterFn,
		Timestamp: {
			fromDate: mockTimestampFromDateFn,
		},
	};
});

// Mock Firebase module - must be defined before FirestoreClient import
jest.mock('@/shared/data/database/firebase/Firebase', () => {
	mockFirestoreInstance = { id: 'mock-firestore-instance' };
	return {
		firestore: mockFirestoreInstance,
	};
});

describe('FirestoreClient', () => {
	let client: FirestoreClient;
	let mockDocRef: unknown;
	let mockCollectionRef: unknown;
	let mockDocSnapshot: {
		exists: jest.Mock;
		id: string;
		data: jest.Mock;
	};
	let mockQuerySnapshot: {
		docs: unknown[];
	};

	// Helper to get mocks from global
	const getMocks = (): {
		doc: jest.Mock;
		collection: jest.Mock;
		getDoc: jest.Mock;
		getDocs: jest.Mock;
		setDoc: jest.Mock;
		updateDoc: jest.Mock;
		deleteDoc: jest.Mock;
		onSnapshot: jest.Mock;
		query: jest.Mock;
		writeBatch: jest.Mock;
		where: jest.Mock;
		orderBy: jest.Mock;
		limit: jest.Mock;
		startAfter: jest.Mock;
	} => ({
		doc: (global as { mockDoc?: jest.Mock }).mockDoc as jest.Mock,
		collection: (global as { mockCollection?: jest.Mock })
			.mockCollection as jest.Mock,
		getDoc: (global as { mockGetDoc?: jest.Mock }).mockGetDoc as jest.Mock,
		getDocs: (global as { mockGetDocs?: jest.Mock })
			.mockGetDocs as jest.Mock,
		setDoc: (global as { mockSetDoc?: jest.Mock }).mockSetDoc as jest.Mock,
		updateDoc: (global as { mockUpdateDoc?: jest.Mock })
			.mockUpdateDoc as jest.Mock,
		deleteDoc: (global as { mockDeleteDoc?: jest.Mock })
			.mockDeleteDoc as jest.Mock,
		onSnapshot: (global as { mockOnSnapshot?: jest.Mock })
			.mockOnSnapshot as jest.Mock,
		query: (global as { mockQuery?: jest.Mock }).mockQuery as jest.Mock,
		writeBatch: (global as { mockWriteBatch?: jest.Mock })
			.mockWriteBatch as jest.Mock,
		where: (global as { mockWhere?: jest.Mock }).mockWhere as jest.Mock,
		orderBy: (global as { mockOrderBy?: jest.Mock })
			.mockOrderBy as jest.Mock,
		limit: (global as { mockLimit?: jest.Mock }).mockLimit as jest.Mock,
		startAfter: (global as { mockStartAfter?: jest.Mock })
			.mockStartAfter as jest.Mock,
	});

	// Helper for Timestamp
	const getTimestampMock = () => ({
		Timestamp: {
			fromDate: (global as { mockTimestampFromDate?: jest.Mock })
				.mockTimestampFromDate as jest.Mock,
		},
	});

	beforeEach(() => {
		client = new FirestoreClient();
		mockDocSnapshot = {
			exists: jest.fn().mockReturnValue(true),
			id: 'doc-1',
			data: jest.fn().mockReturnValue({ name: 'Test', value: 123 }),
		};
		mockDocRef = { id: 'doc-1' };
		mockCollectionRef = { id: 'collection-1' };
		mockQuerySnapshot = {
			docs: [mockDocSnapshot],
		};

		const mocks = getMocks();

		mocks.doc.mockReturnValue(mockDocRef);
		mocks.collection.mockReturnValue(mockCollectionRef);
		mocks.getDoc.mockResolvedValue(mockDocSnapshot);
		mocks.getDocs.mockResolvedValue(mockQuerySnapshot);
		mocks.setDoc.mockResolvedValue(undefined);
		mocks.updateDoc.mockResolvedValue(undefined);
		mocks.deleteDoc.mockResolvedValue(undefined);
		mocks.query.mockReturnValue(mockCollectionRef);
		mocks.writeBatch.mockReturnValue({
			set: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			commit: jest.fn().mockResolvedValue(undefined),
		});
		jest.clearAllMocks();
	});

	describe('getDocument', () => {
		it('returns document when exists', async () => {
			const mocks = getMocks();
			const result = await client.getDocument('users', 'user-1');

			expect(mocks.doc).toHaveBeenCalledWith(
				mockFirestoreInstance,
				'users',
				'user-1'
			);
			expect(mocks.getDoc).toHaveBeenCalledWith(mockDocRef);
			expect(result).toEqual({
				id: 'doc-1',
				name: 'Test',
				value: 123,
			});
		});

		it('returns null when document does not exist', async () => {
			mockDocSnapshot.exists.mockReturnValue(false);

			const result = await client.getDocument('users', 'user-1');

			expect(result).toBeNull();
		});

		it('throws error on failure', async () => {
			const mocks = getMocks();
			const error = new Error('Firestore error');
			mocks.getDoc.mockRejectedValue(error);

			await expect(client.getDocument('users', 'user-1')).rejects.toThrow(
				'Firestore error'
			);
		});
	});

	describe('getCollection', () => {
		it('returns collection documents', async () => {
			const mocks = getMocks();
			const result = await client.getCollection('users');

			expect(mocks.collection).toHaveBeenCalledWith(
				mockFirestoreInstance,
				'users'
			);
			expect(mocks.query).toHaveBeenCalledWith(mockCollectionRef);
			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({
				id: 'doc-1',
				name: 'Test',
				value: 123,
			});
		});

		it('applies query constraints', async () => {
			const mocks = getMocks();
			const constraints = [
				FirestoreClient.where('name', '==', 'Test'),
				FirestoreClient.orderBy('createdAt', 'desc'),
			];

			await client.getCollection('users', constraints);

			expect(mocks.query).toHaveBeenCalledWith(
				mockCollectionRef,
				...constraints
			);
		});

		it('throws error on failure', async () => {
			const mocks = getMocks();
			const error = new Error('Firestore error');
			mocks.getDocs.mockRejectedValue(error);

			await expect(client.getCollection('users')).rejects.toThrow(
				'Firestore error'
			);
		});
	});

	describe('setDocument', () => {
		it('creates or updates document', async () => {
			const mocks = getMocks();
			const data = { name: 'New User', email: 'new@example.com' };

			await client.setDocument('users', 'user-1', data);

			expect(mocks.doc).toHaveBeenCalledWith(
				mockFirestoreInstance,
				'users',
				'user-1'
			);
			const setDocCall = mocks.setDoc.mock.calls[0];
			expect(setDocCall[0]).toBe(mockDocRef);
			expect(setDocCall[1]).toMatchObject({
				name: data.name,
				email: data.email,
			});
			// Check that updatedAt was included (even if it's a sentinel value)
			expect(setDocCall[1]).toHaveProperty('updatedAt');
		});

		it('throws error on failure', async () => {
			const mocks = getMocks();
			const error = new Error('Firestore error');
			mocks.setDoc.mockRejectedValue(error);

			await expect(
				client.setDocument('users', 'user-1', { name: 'Test' })
			).rejects.toThrow('Firestore error');
		});
	});

	describe('updateDocument', () => {
		it('updates document', async () => {
			const mocks = getMocks();
			const data = { name: 'Updated User' };

			await client.updateDocument('users', 'user-1', data);

			expect(mocks.doc).toHaveBeenCalledWith(
				mockFirestoreInstance,
				'users',
				'user-1'
			);
			const updateDocCall = mocks.updateDoc.mock.calls[0];
			expect(updateDocCall[0]).toBe(mockDocRef);
			expect(updateDocCall[1]).toMatchObject({
				name: data.name,
			});
			// Check that updatedAt was included (even if it's a sentinel value)
			expect(updateDocCall[1]).toHaveProperty('updatedAt');
		});

		it('throws error on failure', async () => {
			const mocks = getMocks();
			const error = new Error('Firestore error');
			mocks.updateDoc.mockRejectedValue(error);

			await expect(
				client.updateDocument('users', 'user-1', { name: 'Test' })
			).rejects.toThrow('Firestore error');
		});
	});

	describe('deleteDocument', () => {
		it('deletes document', async () => {
			const mocks = getMocks();
			await client.deleteDocument('users', 'user-1');

			expect(mocks.doc).toHaveBeenCalledWith(
				mockFirestoreInstance,
				'users',
				'user-1'
			);
			expect(mocks.deleteDoc).toHaveBeenCalledWith(mockDocRef);
		});

		it('throws error on failure', async () => {
			const mocks = getMocks();
			const error = new Error('Firestore error');
			mocks.deleteDoc.mockRejectedValue(error);

			await expect(
				client.deleteDocument('users', 'user-1')
			).rejects.toThrow('Firestore error');
		});
	});

	describe('subscribeToDocument', () => {
		it('subscribes to document changes', () => {
			const mocks = getMocks();
			const callback = jest.fn();
			let snapshotCallback: ((doc: unknown) => void) | undefined;

			mocks.onSnapshot.mockImplementation((_, success) => {
				if (success) {
					snapshotCallback = success as (doc: unknown) => void;
				}
				return jest.fn();
			});

			const unsubscribe = client.subscribeToDocument(
				'users',
				'user-1',
				callback
			);

			expect(mocks.doc).toHaveBeenCalledWith(
				mockFirestoreInstance,
				'users',
				'user-1'
			);
			expect(mocks.onSnapshot).toHaveBeenCalled();
			expect(unsubscribe).toBeDefined();

			if (snapshotCallback) {
				(snapshotCallback as (doc: unknown) => void)(mockDocSnapshot);
				expect(callback).toHaveBeenCalledWith({
					id: 'doc-1',
					name: 'Test',
					value: 123,
				});
			}
		});

		it('calls callback with null when document does not exist', () => {
			const mocks = getMocks();
			const callback = jest.fn();
			mockDocSnapshot.exists.mockReturnValue(false);
			let snapshotCallback: ((doc: unknown) => void) | undefined;

			mocks.onSnapshot.mockImplementation((_, success) => {
				snapshotCallback = success as (doc: unknown) => void;
				return jest.fn();
			});

			client.subscribeToDocument('users', 'user-1', callback);

			if (snapshotCallback) {
				snapshotCallback(mockDocSnapshot);
				expect(callback).toHaveBeenCalledWith(null);
			}
		});

		it('handles subscription errors', () => {
			const mocks = getMocks();
			const callback = jest.fn();
			let errorCallback: ((error: unknown) => void) | undefined;

			mocks.onSnapshot.mockImplementation((_, _success, error) => {
				errorCallback = error as (error: unknown) => void;
				return jest.fn();
			});

			client.subscribeToDocument('users', 'user-1', callback);

			if (errorCallback) {
				errorCallback(new Error('Subscription error'));
				expect(callback).toHaveBeenCalledWith(null);
			}
		});
	});

	describe('subscribeToCollection', () => {
		it('subscribes to collection changes', () => {
			const mocks = getMocks();
			const callback = jest.fn();
			let snapshotCallback: ((snapshot: unknown) => void) | undefined;

			mocks.onSnapshot.mockImplementation((_, success) => {
				if (success) {
					snapshotCallback = success as (snapshot: unknown) => void;
				}
				return jest.fn();
			});

			const unsubscribe = client.subscribeToCollection(
				'users',
				[],
				callback
			);

			expect(mocks.collection).toHaveBeenCalledWith(
				mockFirestoreInstance,
				'users'
			);
			expect(unsubscribe).toBeDefined();

			if (snapshotCallback) {
				(snapshotCallback as (snapshot: unknown) => void)(
					mockQuerySnapshot
				);
				expect(callback).toHaveBeenCalledWith([
					{ id: 'doc-1', name: 'Test', value: 123 },
				]);
			}
		});

		it('handles subscription errors', () => {
			const mocks = getMocks();
			const callback = jest.fn();
			let errorCallback: ((error: unknown) => void) | undefined;

			mocks.onSnapshot.mockImplementation((_, _success, error) => {
				errorCallback = error as (error: unknown) => void;
				return jest.fn();
			});

			client.subscribeToCollection('users', [], callback);

			if (errorCallback) {
				errorCallback(new Error('Subscription error'));
				expect(callback).toHaveBeenCalledWith([]);
			}
		});
	});

	describe('createBatch', () => {
		it('creates a batch', () => {
			const mocks = getMocks();
			const mockBatch = {
				set: jest.fn(),
				update: jest.fn(),
				delete: jest.fn(),
				commit: jest.fn(),
			};
			mocks.writeBatch.mockReturnValue(mockBatch);

			const result = client.createBatch();

			expect(mocks.writeBatch).toHaveBeenCalledWith(
				mockFirestoreInstance
			);
			expect(result).toBe(mockBatch);
		});
	});

	describe('executeBatch', () => {
		it('commits batch', async () => {
			const mockBatch = {
				commit: jest.fn().mockResolvedValue(undefined),
				set: jest.fn(),
				update: jest.fn(),
				delete: jest.fn(),
			} as unknown as { commit: jest.Mock };

			await client.executeBatch(
				mockBatch as unknown as import('firebase/firestore').WriteBatch
			);

			expect(mockBatch.commit).toHaveBeenCalled();
		});

		it('throws error on failure', async () => {
			const error = new Error('Batch error');
			const mockBatch = {
				commit: jest.fn().mockRejectedValue(error),
				set: jest.fn(),
				update: jest.fn(),
				delete: jest.fn(),
			} as unknown as { commit: jest.Mock };

			await expect(
				client.executeBatch(
					mockBatch as unknown as import('firebase/firestore').WriteBatch
				)
			).rejects.toThrow('Batch error');
		});
	});

	describe('static methods', () => {
		it('FirestoreClient.where creates where constraint', () => {
			// Get mocks and ensure where function is properly configured
			const mocks = getMocks();
			// Ensure the mock returns the expected value
			mocks.where.mockReturnValue({ type: 'where' });

			const result = FirestoreClient.where('name', '==', 'Test');
			expect(result).toBeDefined();
			expect(result).toEqual({ type: 'where' });
			expect(mocks.where).toHaveBeenCalledWith('name', '==', 'Test');
		});

		it('FirestoreClient.orderBy creates orderBy constraint with desc', () => {
			const mocks = getMocks();
			mocks.orderBy.mockReturnValue({ type: 'orderBy' });

			const result = FirestoreClient.orderBy('createdAt', 'desc');
			expect(result).toBeDefined();
			expect(result).toEqual({ type: 'orderBy' });
			expect(mocks.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
		});

		it('FirestoreClient.orderBy defaults to asc when no direction provided', () => {
			const mocks = getMocks();
			mocks.orderBy.mockReturnValue({ type: 'orderBy' });

			const result = FirestoreClient.orderBy('createdAt');
			expect(result).toBeDefined();
			expect(result).toEqual({ type: 'orderBy' });
			expect(mocks.orderBy).toHaveBeenCalledWith('createdAt', 'asc');
		});

		it('FirestoreClient.limit creates limit constraint', () => {
			const mocks = getMocks();
			mocks.limit.mockReturnValue({ type: 'limit' });

			const result = FirestoreClient.limit(10);
			expect(result).toBeDefined();
			expect(result).toEqual({ type: 'limit' });
			expect(mocks.limit).toHaveBeenCalledWith(10);
		});

		it('FirestoreClient.startAfter creates startAfter constraint', () => {
			const mocks = getMocks();
			mocks.startAfter.mockReturnValue({ type: 'startAfter' });

			const mockSnapshot = {
				id: 'doc-1',
			} as unknown as import('firebase/firestore').QueryDocumentSnapshot;
			const result = FirestoreClient.startAfter(mockSnapshot);
			expect(result).toBeDefined();
			expect(result).toEqual({ type: 'startAfter' });
			expect(mocks.startAfter).toHaveBeenCalledWith(mockSnapshot);
		});

		it('FirestoreClient.timestampToDate converts timestamp', () => {
			const mockTimestamp = {
				toDate: jest.fn().mockReturnValue(new Date('2024-01-01')),
			} as unknown as import('firebase/firestore').Timestamp;

			const result = FirestoreClient.timestampToDate(mockTimestamp);

			expect(result).toEqual(new Date('2024-01-01'));
		});

		it('FirestoreClient.timestampToDate returns null for null input', () => {
			const result = FirestoreClient.timestampToDate(null);
			expect(result).toBeNull();
		});

		it('FirestoreClient.dateToTimestamp converts date', () => {
			const timestampMocks = getTimestampMock();
			const mockTimestamp = {
				toDate: jest.fn(() => new Date('2024-01-01')),
			};
			timestampMocks.Timestamp.fromDate.mockReturnValue(mockTimestamp);

			const date = new Date('2024-01-01');
			const result = FirestoreClient.dateToTimestamp(date);
			expect(result).toBeDefined();
			expect(timestampMocks.Timestamp.fromDate).toHaveBeenCalledWith(
				date
			);
			// Verify it returns a mock timestamp with toDate
			expect(result.toDate).toBeDefined();
		});
	});
});
