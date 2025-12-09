import {
	collection,
	collectionGroup,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	setDoc,
} from '@react-native-firebase/firestore';

import { FirebaseShareRepository } from '@/features/sharing/data/repositories/FirebaseShareRepository';
import { Permission, Share } from '@/features/sharing/domain/entities';

jest.mock('@react-native-firebase/app', () => ({
	getApp: jest.fn(() => ({ id: 'mock-app' })),
}));

jest.mock('@react-native-firebase/firestore', () => {
	const mockDoc = {
		set: jest.fn().mockResolvedValue(undefined),
		get: jest.fn(),
	};

	const mockCollection = jest.fn(() => ({
		doc: jest.fn(() => mockDoc),
		where: jest.fn().mockReturnThis(),
		get: jest.fn(),
	}));

	return {
		getFirestore: jest.fn(() => ({
			collection: mockCollection,
		})),
		collection: jest.fn((_ref, _path) => mockCollection()),
		doc: jest.fn((_ref, ..._pathSegments) => mockDoc),
		collectionGroup: jest.fn((_firestore, _collectionName) => ({
			where: jest.fn().mockReturnThis(),
		})),
		query: jest.fn((ref, ..._constraints) => ref),
		where: jest.fn((field, op, value) => ({
			type: 'where',
			field,
			op,
			value,
		})),
		setDoc: jest.fn().mockResolvedValue(undefined),
		getDoc: jest.fn().mockResolvedValue({
			data: () => ({}),
			exists: true,
		}),
		getDocs: jest.fn().mockResolvedValue({
			docs: [],
			size: 0,
		}),
	};
});

describe('FirebaseShareRepository', () => {
	let repository: FirebaseShareRepository;
	let mockDoc: {
		set: jest.Mock;
		get: jest.Mock;
	};
	let mockCollection: {
		doc: jest.Mock;
		where: jest.Mock;
		get: jest.Mock;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockDoc = {
			set: jest.fn().mockResolvedValue(undefined),
			get: jest.fn(),
		};
		mockCollection = {
			doc: jest.fn(() => mockDoc),
			where: jest.fn().mockReturnThis(),
			get: jest.fn(),
		};

		// Setup mocks for modular API
		(getFirestore as jest.Mock).mockReturnValue({
			collection: jest.fn(() => mockCollection),
		});
		(collection as jest.Mock).mockImplementation((_ref, _path) => {
			if (_path) {
				return mockCollection;
			}
			return mockCollection;
		});
		(doc as jest.Mock).mockImplementation((_ref, ..._pathSegments) => {
			return mockDoc;
		});
		(setDoc as jest.Mock).mockResolvedValue(undefined);
		(getDoc as jest.Mock).mockResolvedValue({
			data: () => ({}),
			exists: true,
		});
		(getDocs as jest.Mock).mockResolvedValue({
			docs: [],
			size: 0,
		});

		repository = new FirebaseShareRepository();
	});

	describe('shareTracker', () => {
		it('creates share in Firestore', async () => {
			const share = new Share(
				'share-1',
				'tracker-1',
				'user-2',
				'read',
				true,
				new Date('2024-01-01T00:00:00Z'),
				new Date('2024-01-02T00:00:00Z')
			);

			const result = await repository.shareTracker(share);

			// For shares, it uses subcollection: trackers/{trackerId}/shares/{shareId}
			expect(doc).toHaveBeenCalled();
			expect(collection).toHaveBeenCalled();
			expect(setDoc).toHaveBeenCalledWith(expect.anything(), {
				tracker_id: 'tracker-1',
				shared_with_user_id: 'user-2',
				permission: 'read',
				is_active: true,
				created_at: new Date('2024-01-01T00:00:00Z').getTime(),
				updated_at: new Date('2024-01-02T00:00:00Z').getTime(),
			});
			expect(result).toEqual(share);
		});
	});

	describe('updatePermission', () => {
		it('updates permission in Firestore with trackerId', async () => {
			const permission = new Permission('write');
			const shareId = 'share-1';
			const trackerId = 'tracker-1';

			// Mock getDoc to return share data
			(getDoc as jest.Mock).mockResolvedValue({
				data: () => ({
					tracker_id: 'tracker-1',
					shared_with_user_id: 'user-2',
					permission: 'read',
				}),
			});

			const result = await repository.updatePermission(
				shareId,
				permission,
				trackerId
			);

			expect(getDoc).toHaveBeenCalled();
			expect(setDoc).toHaveBeenCalledWith(
				expect.anything(),
				{
					permission: 'write',
					updated_at: expect.any(Number),
				},
				{ merge: true }
			);
			expect(result).toBeInstanceOf(Share);
			expect(result.permission.value).toBe('write');
		});

		it('throws error when share not found without trackerId', async () => {
			const permission = new Permission('write');
			const shareId = 'share-1';

			// Mock collectionGroup to return empty snapshot
			(getDocs as jest.Mock).mockResolvedValue({
				docs: [],
			});

			await expect(
				repository.updatePermission(shareId, permission)
			).rejects.toThrow('Share not found: share-1');
		});
	});

	describe('unshare', () => {
		it('deactivates share in Firestore with trackerId', async () => {
			const shareId = 'share-1';
			const trackerId = 'tracker-1';

			await repository.unshare(shareId, trackerId);

			expect(doc).toHaveBeenCalled();
			expect(collection).toHaveBeenCalled();
			expect(setDoc).toHaveBeenCalledWith(
				expect.anything(),
				{
					is_active: false,
					updated_at: expect.any(Number),
				},
				{ merge: true }
			);
		});

		it('throws error when share not found without trackerId', async () => {
			const shareId = 'share-1';

			// Mock collectionGroup to return empty snapshot
			(getDocs as jest.Mock).mockResolvedValue({
				docs: [],
			});

			await expect(repository.unshare(shareId)).rejects.toThrow(
				'Share not found: share-1'
			);
		});
	});

	describe('getMyShares', () => {
		it('returns shares for owner user', async () => {
			const ownerUserId = 'user-1';
			const mockDocs = [
				{
					id: 'share-1',
					data: () => ({
						tracker_id: 'tracker-1',
						shared_with_user_id: 'user-2',
						permission: 'read',
					}),
				},
				{
					id: 'share-2',
					data: () => ({
						tracker_id: 'tracker-2',
						shared_with_user_id: 'user-3',
						permission: 'write',
					}),
				},
			];

			(getDocs as jest.Mock).mockResolvedValue({
				docs: mockDocs,
			});

			const result = await repository.getMyShares(ownerUserId);

			expect(collectionGroup).toHaveBeenCalledWith(
				expect.anything(),
				'shares'
			);
			expect(getDocs).toHaveBeenCalled();
			expect(result).toHaveLength(2);
			expect(result[0]).toBeInstanceOf(Share);
			expect(result[0].trackerId).toBe('tracker-1');
			expect(result[1].trackerId).toBe('tracker-2');
		});

		it('returns empty array when no shares found', async () => {
			const ownerUserId = 'user-1';
			(getDocs as jest.Mock).mockResolvedValue({ docs: [] });

			const result = await repository.getMyShares(ownerUserId);

			expect(result).toEqual([]);
		});

		it('defaults to read permission when permission is null', async () => {
			const ownerUserId = 'user-1';
			const mockDocs = [
				{
					id: 'share-1',
					data: () => ({
						tracker_id: 'tracker-1',
						shared_with_user_id: 'user-2',
						permission: null,
					}),
				},
			];

			(getDocs as jest.Mock).mockResolvedValue({
				docs: mockDocs,
			});

			const result = await repository.getMyShares(ownerUserId);

			expect(result).toHaveLength(1);
			expect(result[0].permission.value).toBe('read');
		});
	});

	describe('getSharedWithMe', () => {
		it('returns shares for user', async () => {
			const userId = 'user-2';
			const mockDocs = [
				{
					id: 'share-1',
					data: () => ({
						tracker_id: 'tracker-1',
						shared_with_user_id: 'user-2',
						permission: 'read',
					}),
				},
			];

			(getDocs as jest.Mock).mockResolvedValue({
				docs: mockDocs,
			});

			const result = await repository.getSharedWithMe(userId);

			expect(collectionGroup).toHaveBeenCalledWith(
				expect.anything(),
				'shares'
			);
			expect(getDocs).toHaveBeenCalled();
			expect(result).toHaveLength(1);
			expect(result[0]).toBeInstanceOf(Share);
			expect(result[0].trackerId).toBe('tracker-1');
		});

		it('returns empty array when no shares found', async () => {
			const userId = 'user-2';
			(getDocs as jest.Mock).mockResolvedValue({ docs: [] });

			const result = await repository.getSharedWithMe(userId);

			expect(result).toEqual([]);
		});

		it('defaults to read permission when permission is null', async () => {
			const userId = 'user-2';
			const mockDocs = [
				{
					id: 'share-1',
					data: () => ({
						tracker_id: 'tracker-1',
						shared_with_user_id: 'user-2',
						permission: null,
					}),
				},
			];

			(getDocs as jest.Mock).mockResolvedValue({
				docs: mockDocs,
			});

			const result = await repository.getSharedWithMe(userId);

			expect(result).toHaveLength(1);
			expect(result[0].permission.value).toBe('read');
		});
	});
});
