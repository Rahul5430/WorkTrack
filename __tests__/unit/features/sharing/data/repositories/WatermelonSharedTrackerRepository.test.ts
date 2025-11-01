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

	it('lists shares', async () => {
		(
			collection.query() as unknown as { fetch: jest.Mock }
		).fetch.mockResolvedValueOnce([]);
		const res = await repo.getMyShares('u1');
		expect(Array.isArray(res)).toBe(true);
	});
});
