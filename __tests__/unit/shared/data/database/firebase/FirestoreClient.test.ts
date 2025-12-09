import { FirestoreClient } from '@/shared/data/database/firebase/FirestoreClient';

// Store mock firestore instance reference globally for test assertions
let mockFirestoreInstance: {
	id: string;
	collection: jest.Mock;
	doc: jest.Mock;
};

// Mock React Native Firebase App
jest.mock('@react-native-firebase/app', () => ({
	getApp: jest.fn(() => ({ id: 'mock-app' })),
}));

// Mock React Native Firebase Firestore
jest.mock('@react-native-firebase/firestore', () => {
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

	// Create mock firestore instance with collection and doc methods
	mockFirestoreInstance = {
		id: 'mock-firestore-instance',
		collection: mockCollectionFn,
		doc: mockDocFn,
	} as {
		id: string;
		collection: jest.Mock;
		doc: jest.Mock;
	};

	// Create serverTimestamp mock that returns the expected object
	const serverTimestampValue = {
		_methodName: 'serverTimestamp',
	};
	const mockServerTimestampFn = jest.fn(() => serverTimestampValue);

	// Create FieldValue object
	const mockFieldValue = {
		serverTimestamp: mockServerTimestampFn,
	};

	// Create module exports - this will be both named exports and default export
	// IMPORTANT: FieldValue must be on the object that will become the default export
	const moduleExports: Record<string, unknown> = {
		getFirestore: jest.fn(() => mockFirestoreInstance),
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
		where: mockWhereFn,
		orderBy: mockOrderByFn,
		limit: mockLimitFn,
		startAfter: mockStartAfterFn,
		FieldValue: mockFieldValue,
		Timestamp: {
			fromDate: mockTimestampFromDateFn,
		},
	};

	// For ES modules: default export must be the same object with FieldValue
	// When code does `import firestoreModule from '...'`, it gets this default
	// and can access `firestoreModule.FieldValue.serverTimestamp()`
	moduleExports.default = moduleExports;
	moduleExports.__esModule = true;

	// Return the module exports object
	// Jest will use this as both named exports and default export
	return moduleExports;
});

describe('FirestoreClient', () => {
	let client: FirestoreClient;
	let mockDocRef: {
		get: jest.Mock;
		set: jest.Mock;
		update: jest.Mock;
		delete: jest.Mock;
		onSnapshot: jest.Mock;
	};
	let mockCollectionRef: {
		doc: jest.Mock;
		where: jest.Mock;
		orderBy: jest.Mock;
		limit: jest.Mock;
		startAfter: jest.Mock;
		get: jest.Mock;
		onSnapshot: jest.Mock;
	};
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

	beforeEach(() => {
		mockDocSnapshot = {
			exists: jest.fn().mockReturnValue(true),
			id: 'doc-1',
			data: jest.fn().mockReturnValue({ name: 'Test', value: 123 }),
		};
		(mockDocSnapshot as typeof mockDocSnapshot & { get: jest.Mock }).get =
			jest.fn().mockResolvedValue({
				id: 'doc-1',
				data: () => ({ name: 'Test', value: 123 }),
			});
		mockDocRef = {
			get: jest.fn().mockResolvedValue(mockDocSnapshot),
			set: jest.fn().mockResolvedValue(undefined),
			update: jest.fn().mockResolvedValue(undefined),
			delete: jest.fn().mockResolvedValue(undefined),
			onSnapshot: jest.fn().mockReturnValue(jest.fn()),
		};
		mockCollectionRef = {
			doc: jest.fn().mockReturnValue(mockDocRef),
			where: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			startAfter: jest.fn().mockReturnThis(),
			get: jest.fn().mockResolvedValue({
				docs: [mockDocSnapshot],
			}),
			onSnapshot: jest.fn().mockReturnValue(jest.fn()),
		};
		mockQuerySnapshot = {
			docs: [mockDocSnapshot],
		};

		// Reset and set up the mock firestore instance's collection method
		mockFirestoreInstance.collection.mockReset();
		mockFirestoreInstance.collection.mockReturnValue(
			mockCollectionRef as unknown as ReturnType<
				typeof mockFirestoreInstance.collection
			>
		);

		// Ensure getFirestore returns the mock instance
		const firestoreModule = require('@react-native-firebase/firestore');
		(firestoreModule.getFirestore as jest.Mock).mockReturnValue(
			mockFirestoreInstance
		);

		// CRITICAL FIX: FirestoreClient imports firestoreModule at file load time
		// We must ensure FieldValue.serverTimestamp is properly mocked on the default export
		// The issue is that Jest's module mocking doesn't always apply to default exports correctly
		const serverTimestampValue = { _methodName: 'serverTimestamp' };
		const serverTimestampMock = jest.fn(() => serverTimestampValue);

		// Ensure FieldValue exists on both default export and root module
		const defaultExport = firestoreModule.default || firestoreModule;
		if (!defaultExport.FieldValue) {
			defaultExport.FieldValue = { serverTimestamp: serverTimestampMock };
		} else {
			defaultExport.FieldValue.serverTimestamp = serverTimestampMock;
		}
		// Also set on root module exports
		if (!firestoreModule.FieldValue) {
			firestoreModule.FieldValue = {
				serverTimestamp: serverTimestampMock,
			};
		} else {
			firestoreModule.FieldValue.serverTimestamp = serverTimestampMock;
		}

		client = new FirestoreClient();

		const mocks = getMocks();
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
			const result = await client.getDocument('users', 'user-1');

			expect(mockFirestoreInstance.collection).toHaveBeenCalledWith(
				'users'
			);
			expect(mockCollectionRef.doc).toHaveBeenCalledWith('user-1');
			expect(result).toEqual({
				id: 'doc-1',
				name: 'Test',
				value: 123,
			});
		});

		it('returns null when document does not exist', async () => {
			mockDocSnapshot.data.mockReturnValue(null);
			const result = await client.getDocument('users', 'user-1');

			expect(result).toBeNull();
		});

		it('throws error on failure', async () => {
			const error = new Error('Firestore error');
			mockDocRef.get.mockRejectedValue(error);

			await expect(client.getDocument('users', 'user-1')).rejects.toThrow(
				'Firestore error'
			);
		});
	});

	describe('getCollection', () => {
		it('returns collection documents', async () => {
			const mockQueryableCollection = {
				...mockCollectionRef,
				get: jest.fn().mockResolvedValue({
					docs: [mockDocSnapshot],
				}),
			};
			mockFirestoreInstance.collection.mockReturnValue(
				mockQueryableCollection as unknown as ReturnType<
					typeof mockFirestoreInstance.collection
				>
			);

			const result = await client.getCollection('users');

			expect(mockFirestoreInstance.collection).toHaveBeenCalledWith(
				'users'
			);
			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({
				id: 'doc-1',
				name: 'Test',
				value: 123,
			});
		});

		it('applies query constraints', async () => {
			const mockQueryableCollection = {
				...mockCollectionRef,
				get: jest.fn().mockResolvedValue({
					docs: [mockDocSnapshot],
				}),
			};
			mockFirestoreInstance.collection.mockReturnValue(
				mockQueryableCollection as unknown as ReturnType<
					typeof mockFirestoreInstance.collection
				>
			);

			const constraints = [
				FirestoreClient.where('name', '==', 'Test'),
				FirestoreClient.orderBy('createdAt', 'desc'),
			];

			await client.getCollection('users', constraints);

			expect(mockFirestoreInstance.collection).toHaveBeenCalledWith(
				'users'
			);
			expect(mockQueryableCollection.where).toHaveBeenCalled();
			expect(mockQueryableCollection.orderBy).toHaveBeenCalled();
		});

		it('throws error on failure', async () => {
			const mockQueryableCollection = {
				...mockCollectionRef,
				get: jest.fn().mockRejectedValue(new Error('Firestore error')),
			};
			mockFirestoreInstance.collection.mockReturnValue(
				mockQueryableCollection as unknown as ReturnType<
					typeof mockFirestoreInstance.collection
				>
			);

			await expect(client.getCollection('users')).rejects.toThrow(
				'Firestore error'
			);
		});
	});

	describe('setDocument', () => {
		it('creates or updates document', async () => {
			const data = { name: 'New User', email: 'new@example.com' };

			await client.setDocument('users', 'user-1', data);

			expect(mockFirestoreInstance.collection).toHaveBeenCalledWith(
				'users'
			);
			expect(mockCollectionRef.doc).toHaveBeenCalledWith('user-1');
			expect(mockDocRef.set).toHaveBeenCalledWith(
				{
					...data,
					updatedAt: expect.objectContaining({
						_methodName: 'serverTimestamp',
					}),
				},
				{ merge: true }
			);
		});

		it('throws error on failure', async () => {
			const error = new Error('Firestore error');
			mockDocRef.set.mockRejectedValue(error);

			await expect(
				client.setDocument('users', 'user-1', { name: 'Test' })
			).rejects.toThrow('Firestore error');
		});
	});

	describe('updateDocument', () => {
		it('updates document', async () => {
			const data = { name: 'Updated User' };

			// Verify the mock FieldValue is accessible before calling updateDocument
			const firestoreModule = require('@react-native-firebase/firestore');
			const fieldValue =
				firestoreModule.default?.FieldValue ||
				firestoreModule.FieldValue;
			expect(fieldValue).toBeDefined();
			expect(fieldValue.serverTimestamp).toBeDefined();

			// Reset the mock to clear any previous calls
			mockDocRef.update.mockClear();

			await client.updateDocument('users', 'user-1', data);

			expect(mockFirestoreInstance.collection).toHaveBeenCalledWith(
				'users'
			);
			expect(mockCollectionRef.doc).toHaveBeenCalledWith('user-1');

			// Check what was actually passed to update
			const updateCall = mockDocRef.update.mock.calls[0];
			expect(updateCall).toBeDefined();
			expect(updateCall[0]).toHaveProperty('name', 'Updated User');
			expect(updateCall[0]).toHaveProperty('updatedAt');
			expect(updateCall[0].updatedAt).toEqual(
				expect.objectContaining({
					_methodName: 'serverTimestamp',
				})
			);
		});

		it('throws error on failure', async () => {
			const error = new Error('Firestore error');
			mockDocRef.update.mockRejectedValue(error);

			await expect(
				client.updateDocument('users', 'user-1', { name: 'Test' })
			).rejects.toThrow('Firestore error');
		});
	});

	describe('deleteDocument', () => {
		it('deletes document', async () => {
			await client.deleteDocument('users', 'user-1');

			expect(mockFirestoreInstance.collection).toHaveBeenCalledWith(
				'users'
			);
			expect(mockCollectionRef.doc).toHaveBeenCalledWith('user-1');
			expect(mockDocRef.delete).toHaveBeenCalled();
		});

		it('throws error on failure', async () => {
			const error = new Error('Firestore error');
			mockDocRef.delete.mockRejectedValue(error);

			await expect(
				client.deleteDocument('users', 'user-1')
			).rejects.toThrow('Firestore error');
		});
	});

	describe('subscribeToDocument', () => {
		it('subscribes to document changes', () => {
			const callback = jest.fn();
			const mockUnsubscribe = jest.fn();
			let snapshotCallback: ((doc: unknown) => void) | undefined;

			mockDocRef.onSnapshot = jest.fn((success) => {
				if (success) {
					snapshotCallback = success as (doc: unknown) => void;
				}
				return mockUnsubscribe;
			});

			const unsubscribe = client.subscribeToDocument(
				'users',
				'user-1',
				callback
			);

			expect(mockFirestoreInstance.collection).toHaveBeenCalledWith(
				'users'
			);
			expect(mockCollectionRef.doc).toHaveBeenCalledWith('user-1');
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
			const callback = jest.fn();
			mockDocSnapshot.data.mockReturnValue(null);
			let snapshotCallback: ((doc: unknown) => void) | undefined;

			mockDocRef.onSnapshot = jest.fn((success) => {
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
			const callback = jest.fn();
			let errorCallback: ((error: unknown) => void) | undefined;

			mockDocRef.onSnapshot = jest.fn((_success, error) => {
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
			const callback = jest.fn();
			const mockUnsubscribe = jest.fn();
			let snapshotCallback: ((snapshot: unknown) => void) | undefined;

			const mockQueryableCollection = {
				...mockCollectionRef,
				onSnapshot: jest.fn((success) => {
					if (success) {
						snapshotCallback = success as (
							snapshot: unknown
						) => void;
					}
					return mockUnsubscribe;
				}),
			};
			mockFirestoreInstance.collection.mockReturnValue(
				mockQueryableCollection as unknown as ReturnType<
					typeof mockFirestoreInstance.collection
				>
			);

			const unsubscribe = client.subscribeToCollection(
				'users',
				[],
				callback
			);

			expect(mockFirestoreInstance.collection).toHaveBeenCalledWith(
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
			const callback = jest.fn();
			let errorCallback: ((error: unknown) => void) | undefined;

			const mockQueryableCollection = {
				...mockCollectionRef,
				onSnapshot: jest.fn((_success, error) => {
					errorCallback = error as (error: unknown) => void;
					return jest.fn();
				}),
			};
			mockFirestoreInstance.collection.mockReturnValue(
				mockQueryableCollection as unknown as ReturnType<
					typeof mockFirestoreInstance.collection
				>
			);

			client.subscribeToCollection('users', [], callback);

			if (errorCallback) {
				errorCallback(new Error('Subscription error'));
				expect(callback).toHaveBeenCalledWith([]);
			}
		});
	});

	describe('createBatch', () => {
		it('creates a batch', () => {
			const mockBatch = {
				set: jest.fn(),
				update: jest.fn(),
				delete: jest.fn(),
				commit: jest.fn(),
			};
			(mockFirestoreInstance as { batch?: jest.Mock }).batch = jest
				.fn()
				.mockReturnValue(mockBatch);

			const result = client.createBatch();

			expect(
				(mockFirestoreInstance as { batch?: jest.Mock }).batch
			).toHaveBeenCalled();
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
				mockBatch as unknown as import('@react-native-firebase/firestore').FirebaseFirestoreTypes.WriteBatch
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
					mockBatch as unknown as import('@react-native-firebase/firestore').FirebaseFirestoreTypes.WriteBatch
				)
			).rejects.toThrow('Batch error');
		});
	});

	describe('static methods', () => {
		it('FirestoreClient.where creates where constraint', () => {
			const result = FirestoreClient.where('name', '==', 'Test');
			expect(result).toBeDefined();
			expect(result.type).toBe('where');
			if (result.type === 'where') {
				expect(result.field).toBe('name');
				expect(result.operator).toBe('==');
				expect(result.value).toBe('Test');
			}
		});

		it('FirestoreClient.orderBy creates orderBy constraint with desc', () => {
			const result = FirestoreClient.orderBy('createdAt', 'desc');
			expect(result).toBeDefined();
			expect(result.type).toBe('orderBy');
			if (result.type === 'orderBy') {
				expect(result.field).toBe('createdAt');
				expect(result.direction).toBe('desc');
			}
		});

		it('FirestoreClient.orderBy defaults to asc when no direction provided', () => {
			const result = FirestoreClient.orderBy('createdAt');
			expect(result).toBeDefined();
			expect(result.type).toBe('orderBy');
			if (result.type === 'orderBy') {
				expect(result.field).toBe('createdAt');
				expect(result.direction).toBe('asc');
			}
		});

		it('FirestoreClient.limit creates limit constraint', () => {
			const result = FirestoreClient.limit(10);
			expect(result).toBeDefined();
			expect(result.type).toBe('limit');
			if (result.type === 'limit') {
				expect(result.count).toBe(10);
			}
		});

		it('FirestoreClient.startAfter creates startAfter constraint', () => {
			const mockSnapshot = {
				id: 'doc-1',
				isEqual: jest.fn(),
			} as unknown as import('@react-native-firebase/firestore').FirebaseFirestoreTypes.QueryDocumentSnapshot;
			const result = FirestoreClient.startAfter(mockSnapshot);
			expect(result).toBeDefined();
			expect(result.type).toBe('startAfter');
			if (result.type === 'startAfter') {
				expect(result.docSnapshot).toBe(mockSnapshot);
			}
		});

		it('FirestoreClient.timestampToDate converts timestamp', () => {
			const mockTimestamp = {
				toDate: jest.fn().mockReturnValue(new Date('2024-01-01')),
			} as unknown as import('@react-native-firebase/firestore').FirebaseFirestoreTypes.Timestamp;

			const result = FirestoreClient.timestampToDate(mockTimestamp);

			expect(result).toEqual(new Date('2024-01-01'));
		});

		it('FirestoreClient.timestampToDate returns null for null input', () => {
			const result = FirestoreClient.timestampToDate(null);
			expect(result).toBeNull();
		});

		it('FirestoreClient.dateToTimestamp converts date', () => {
			const mockTimestamp = {
				toDate: jest.fn(() => new Date('2024-01-01')),
			};
			(
				global as { mockTimestampFromDate?: jest.Mock }
			).mockTimestampFromDate?.mockReturnValue(mockTimestamp);

			const date = new Date('2024-01-01');
			const result = FirestoreClient.dateToTimestamp(date);

			expect(result).toBeDefined();
			expect(
				(global as { mockTimestampFromDate?: jest.Mock })
					.mockTimestampFromDate
			).toHaveBeenCalledWith(date);
			// Verify it returns a mock timestamp with toDate
			expect(result.toDate).toBeDefined();
		});
	});
});
