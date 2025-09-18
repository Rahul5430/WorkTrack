import { FirebaseShareRepository } from '../../src/repositories/firebaseShareRepository';
import { Permission, ShareDTO } from '../../src/types';

// Mock the dependencies
jest.mock('@react-native-firebase/firestore', () => ({
	collectionGroup: jest.fn(),
	doc: jest.fn(),
	getDocs: jest.fn(),
	query: jest.fn(),
	setDoc: jest.fn(),
	where: jest.fn(),
}));

jest.mock('../../src/services', () => ({
	getFirestoreInstance: jest.fn(),
}));

jest.mock('../../src/mappers/shareMapper', () => ({
	shareDTOToFirestore: jest.fn((share) => ({
		...share,
		createdAt: new Date(share.createdAt),
	})),
}));

jest.mock('../../src/logging', () => ({
	logger: {
		debug: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
	},
}));

type MockShareDoc = {
	update: jest.Mock;
	delete: jest.Mock;
	ref: {
		path: string;
	};
};

type MockQuerySnapshot = {
	empty: boolean;
	docs: MockShareDoc[];
};

describe('FirebaseShareRepository - branch coverage', () => {
	let repository: FirebaseShareRepository;
	let mockFirestore: unknown;
	let mockDoc: MockShareDoc;
	let mockQuery: unknown;
	let mockQuerySnapshot: MockQuerySnapshot;

	beforeEach(() => {
		jest.clearAllMocks();
		repository = new FirebaseShareRepository();

		// Setup mock firestore instance
		mockFirestore = {};
		require('../../src/services').getFirestoreInstance.mockReturnValue(
			mockFirestore
		);

		// Setup mock doc
		mockDoc = {
			ref: { path: 'trackers/t1/shares/u1' },
			update: jest.fn(),
			delete: jest.fn(),
		};
		require('@react-native-firebase/firestore').doc.mockReturnValue(
			mockDoc
		);

		// Setup mock query
		mockQuery = {};
		require('@react-native-firebase/firestore').query.mockReturnValue(
			mockQuery
		);
		require('@react-native-firebase/firestore').collectionGroup.mockReturnValue(
			mockQuery
		);
		require('@react-native-firebase/firestore').where.mockReturnValue(
			mockQuery
		);

		// Setup mock query snapshot
		mockQuerySnapshot = {
			empty: false,
			docs: [mockDoc],
		};
		require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
			mockQuerySnapshot
		);

		// Setup mock setDoc
		require('@react-native-firebase/firestore').setDoc.mockResolvedValue(
			undefined
		);
	});

	describe('share', () => {
		it('handles share errors by throwing SyncError', async () => {
			const mockError = new Error('Firestore error');
			require('@react-native-firebase/firestore').setDoc.mockRejectedValue(
				mockError
			);

			const shareData: ShareDTO = {
				trackerId: 'tracker1',
				sharedWithId: 'user1',
				permission: 'read' as Permission,
				sharedWithEmail: 'user1@example.com',
			};

			await expect(repository.share(shareData)).rejects.toThrow(
				'Failed to share tracker'
			);
			expect(
				require('../../src/logging').logger.error
			).toHaveBeenCalledWith('Failed to share tracker', {
				error: mockError,
				share: shareData,
			});
		});

		it('successfully shares tracker', async () => {
			const shareData: ShareDTO = {
				trackerId: 'tracker1',
				sharedWithId: 'user1',
				permission: 'read' as Permission,
				sharedWithEmail: 'user1@example.com',
			};

			await repository.share(shareData);

			expect(
				require('@react-native-firebase/firestore').setDoc
			).toHaveBeenCalled();
		});
	});

	describe('updatePermission', () => {
		it('handles share not found error', async () => {
			mockQuerySnapshot.empty = true;
			require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
				mockQuerySnapshot
			);

			await expect(
				repository.updatePermission('user1', 'write')
			).rejects.toThrow('Failed to update share permission');
			expect(
				require('../../src/logging').logger.error
			).toHaveBeenCalledWith('Failed to update share permission', {
				error: expect.any(Error),
				shareId: 'user1',
				permission: 'write',
			});
		});

		it('handles query errors by throwing SyncError', async () => {
			const mockError = new Error('Query error');
			require('@react-native-firebase/firestore').getDocs.mockRejectedValue(
				mockError
			);

			await expect(
				repository.updatePermission('user1', 'write')
			).rejects.toThrow('Failed to update share permission');
			expect(
				require('../../src/logging').logger.error
			).toHaveBeenCalledWith('Failed to update share permission', {
				error: mockError,
				shareId: 'user1',
				permission: 'write',
			});
		});

		it('handles setDoc errors by throwing SyncError', async () => {
			const mockError = new Error('SetDoc error');
			require('@react-native-firebase/firestore').setDoc.mockRejectedValue(
				mockError
			);

			await expect(
				repository.updatePermission('user1', 'write')
			).rejects.toThrow('Failed to update share permission');
			expect(
				require('../../src/logging').logger.error
			).toHaveBeenCalledWith('Failed to update share permission', {
				error: mockError,
				shareId: 'user1',
				permission: 'write',
			});
		});

		it('successfully updates permission', async () => {
			await repository.updatePermission('user1', 'write');

			expect(
				require('@react-native-firebase/firestore').setDoc
			).toHaveBeenCalledWith(
				mockDoc.ref,
				{ permission: 'write' },
				{ merge: true }
			);
		});
	});

	describe('unshare', () => {
		it('handles unshare errors by throwing SyncError', async () => {
			const mockError = new Error('Delete error');
			mockDoc.delete.mockRejectedValue(mockError);

			await expect(
				repository.unshare('tracker1', 'user1')
			).rejects.toThrow('Failed to unshare tracker');
			expect(
				require('../../src/logging').logger.error
			).toHaveBeenCalledWith('Failed to unshare tracker', {
				error: mockError,
				trackerId: 'tracker1',
				sharedWithId: 'user1',
			});
		});

		it('successfully unshares tracker', async () => {
			await repository.unshare('tracker1', 'user1');

			expect(mockDoc.delete).toHaveBeenCalled();
		});
	});
});
