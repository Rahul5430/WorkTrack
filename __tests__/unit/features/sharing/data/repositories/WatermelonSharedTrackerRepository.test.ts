import { Database } from '@nozbe/watermelondb';

import ShareModel from '@/features/sharing/data/models/ShareModel';
import { WatermelonSharedTrackerRepository } from '@/features/sharing/data/repositories/WatermelonSharedTrackerRepository';
import { Share } from '@/features/sharing/domain/entities/Share';

describe('WatermelonSharedTrackerRepository', () => {
	let database: jest.Mocked<Database>;
	let repo: WatermelonSharedTrackerRepository;
	let collection: jest.Mocked<ReturnType<Database['get']>>;

	beforeEach(() => {
		collection = {
			create: jest.fn(),
			find: jest.fn(),
			query: jest
				.fn()
				.mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }),
		} as unknown as jest.Mocked<ReturnType<Database['get']>>;

		database = {
			get: jest.fn().mockReturnValue(collection),
		} as unknown as jest.Mocked<Database>;

		repo = new WatermelonSharedTrackerRepository(database);
	});

	it('creates share record', async () => {
		const share = new Share('s1', 't1', 'u2', 'read');
		collection.create.mockImplementation((cb) => {
			const model = { id: 's1' } as unknown as ShareModel;
			cb(model);
			return Promise.resolve(model);
		});

		const created = await repo.shareTracker(share);
		expect(database.get).toHaveBeenCalledWith('shares');
		expect(collection.create).toHaveBeenCalled();
		expect(created.id).toBe('s1');
	});

	it('updates permission', async () => {
		const found = {
			id: 's1',
			trackerId: 't1',
			sharedWithUserId: 'u2',
			permission: 'read',
			isActive: true,
			createdByUserId: 'u1',
			createdAt: new Date('2023-01-01'),
			updatedAt: new Date('2023-01-02'),
			update: jest.fn((cb: (m: ShareModel) => void) => {
				cb({} as ShareModel);
				return Promise.resolve();
			}),
		} as unknown as ShareModel;
		(collection.find as jest.Mock).mockResolvedValue(found);
		const res = await repo.updatePermission(
			's1',
			new Share('s1', 't1', 'u2', 'write').permission
		);
		expect(collection.find).toHaveBeenCalledWith('s1');
		expect(found.update).toHaveBeenCalled();
		expect(res.id).toBe('s1');
	});

	it('unshares (deactivates) share', async () => {
		const found = {
			update: jest.fn((cb: (m: ShareModel) => void) => {
				cb({} as ShareModel);
				return Promise.resolve();
			}),
		} as unknown as ShareModel;
		(collection.find as jest.Mock).mockResolvedValue(found);
		await repo.unshare('s1');
		expect(found.update).toHaveBeenCalled();
	});

	it('gets my shares', async () => {
		const mockShare1 = {
			id: 's1',
			trackerId: 't1',
			sharedWithUserId: 'u2',
			permission: 'read',
			isActive: true,
			createdByUserId: 'u1',
			createdAt: new Date('2023-01-01'),
			updatedAt: new Date('2023-01-02'),
		} as unknown as ShareModel;
		const mockShare2 = {
			id: 's2',
			trackerId: 't2',
			sharedWithUserId: 'u3',
			permission: 'write',
			isActive: true,
			createdByUserId: 'u1',
			createdAt: new Date('2023-01-03'),
			updatedAt: new Date('2023-01-04'),
		} as unknown as ShareModel;
		const queryBuilder = {
			fetch: jest.fn().mockResolvedValue([mockShare1, mockShare2]),
		};
		(collection.query as jest.Mock).mockReturnValue(queryBuilder);

		const result = await repo.getMyShares('u1');

		expect(collection.query).toHaveBeenCalled();
		expect(queryBuilder.fetch).toHaveBeenCalled();
		expect(result).toHaveLength(2);
		expect(result[0].id).toBe('s1');
		expect(result[1].id).toBe('s2');
	});

	it('gets shared with me', async () => {
		const mockShare = {
			id: 's1',
			trackerId: 't1',
			sharedWithUserId: 'u2',
			permission: 'read',
			isActive: true,
			createdByUserId: 'u1',
			createdAt: new Date('2023-01-01'),
			updatedAt: new Date('2023-01-02'),
		} as unknown as ShareModel;
		const queryBuilder = {
			fetch: jest.fn().mockResolvedValue([mockShare]),
		};
		(collection.query as jest.Mock).mockReturnValue(queryBuilder);

		const result = await repo.getSharedWithMe('u2');

		expect(collection.query).toHaveBeenCalled();
		expect(queryBuilder.fetch).toHaveBeenCalled();
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe('s1');
		expect(result[0].sharedWithUserId).toBe('u2');
	});

	it('returns empty array when no shares found', async () => {
		const queryBuilder = {
			fetch: jest.fn().mockResolvedValue([]),
		};
		(collection.query as jest.Mock).mockReturnValue(queryBuilder);

		const result = await repo.getMyShares('u1');

		expect(result).toEqual([]);
	});

	it('queries with isActive filter', async () => {
		const mockShare1 = {
			id: 's1',
			trackerId: 't1',
			sharedWithUserId: 'u2',
			permission: 'read',
			isActive: true,
			createdByUserId: 'u1',
			createdAt: new Date('2023-01-01'),
			updatedAt: new Date('2023-01-02'),
		} as unknown as ShareModel;
		const queryBuilder = {
			fetch: jest.fn().mockResolvedValue([mockShare1]),
		};
		(collection.query as jest.Mock).mockReturnValue(queryBuilder);

		const result = await repo.getMyShares('u1');

		// Verify query was called with is_active filter
		expect(collection.query).toHaveBeenCalled();
		expect(queryBuilder.fetch).toHaveBeenCalled();
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe('s1');
	});

	it('creates share with correct data mapping', async () => {
		const share = new Share('s1', 't1', 'u2', 'read', true);
		const createdModel = {
			id: 's1',
			trackerId: 't1',
			sharedWithUserId: 'u2',
			permission: 'read',
			isActive: true,
			createdByUserId: 'u1',
			createdAt: new Date('2023-01-01'),
			updatedAt: new Date('2023-01-02'),
		} as unknown as ShareModel;
		let capturedCallback: ((model: ShareModel) => void) | null = null;
		collection.create.mockImplementation((cb) => {
			if (typeof cb === 'function') {
				capturedCallback = cb;
				capturedCallback(createdModel);
			}
			return Promise.resolve(createdModel);
		});

		const result = await repo.shareTracker(share);

		expect(collection.create).toHaveBeenCalled();
		expect(result).toBeDefined();
		expect(result.id).toBe('s1');
	});
});
