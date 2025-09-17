describe('WatermelonTrackerRepository', () => {
	const sample = {
		id: 't1',
		ownerId: 'u1',
		name: 'N',
		color: '#aaaaaa',
		isDefault: false,
		trackerType: 'work',
	};

	function setupDb() {
		const collection = {
			create: jest.fn(
				async (cb: (model: Record<string, unknown>) => void) =>
					cb({
						_raw: {},
						set ownerId(_v: string) {},
						set name(_v: string) {},
						set color(_v: string) {},
						set isDefault(_v: boolean) {},
						set trackerType(_v: string) {},
					})
			),
			find: jest.fn(),
			query: jest
				.fn()
				.mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }),
		};
		const write = jest.fn(async (fn: () => unknown) => {
			await fn();
		});
		return { collection, write };
	}

	it('create, update, listOwned work and errors handled', async () => {
		await jest.isolateModules(async () => {
			const { collection, write } = setupDb();
			collection.find.mockResolvedValueOnce({
				update: jest.fn(
					async (cb: (model: Record<string, unknown>) => void) =>
						cb({
							set name(_v: string) {},
							set color(_v: string) {},
							set isDefault(_v: boolean) {},
							set trackerType(_v: string) {},
						})
				),
			});
			jest.doMock('../../src/db/watermelon', () => ({
				database: { get: () => collection, write },
			}));
			const {
				WatermelonTrackerRepository,
			} = require('../../src/repositories/watermelonTrackerRepository');
			const repo = new WatermelonTrackerRepository();
			await expect(repo.create(sample, 'u1')).resolves.toBeUndefined();
			await expect(
				repo.update({ id: 't1', name: 'X' }, 'u1')
			).resolves.toBeUndefined();
			await expect(repo.listOwned('u1')).resolves.toEqual([]);
		});

		await jest.isolateModules(async () => {
			const { collection } = setupDb();
			const write = jest.fn(async () => {
				throw new Error('boom');
			});
			jest.doMock('../../src/db/watermelon', () => ({
				database: { get: () => collection, write },
			}));
			const {
				WatermelonTrackerRepository,
			} = require('../../src/repositories/watermelonTrackerRepository');
			const repo = new WatermelonTrackerRepository();
			await expect(repo.create(sample, 'u1')).rejects.toMatchObject({
				name: 'SyncError',
			});
		});
	});

	it('ensureExists creates default if not found and logs when exists', async () => {
		await jest.isolateModules(async () => {
			const { collection, write } = setupDb();
			collection.find.mockRejectedValueOnce(new Error('not found'));
			jest.doMock('../../src/db/watermelon', () => ({
				database: { get: () => collection, write },
			}));
			const {
				WatermelonTrackerRepository,
			} = require('../../src/repositories/watermelonTrackerRepository');
			const repo = new WatermelonTrackerRepository();
			await expect(
				repo.ensureExists('t1', 'u1')
			).resolves.toBeUndefined();
		});
	});

	it('upsertMany updates existing and creates missing; errors wrapped', async () => {
		await jest.isolateModules(async () => {
			const { collection, write } = setupDb();
			collection.find
				.mockResolvedValueOnce({
					update: jest.fn(
						async (cb: (model: Record<string, unknown>) => void) =>
							cb({
								set ownerId(_v: string) {},
								set name(_v: string) {},
								set color(_v: string) {},
								set isDefault(_v: boolean) {},
								set trackerType(_v: string) {},
							})
					),
				})
				.mockRejectedValueOnce(new Error('not found'));
			jest.doMock('../../src/db/watermelon', () => ({
				database: { get: () => collection, write },
			}));
			const {
				WatermelonTrackerRepository,
			} = require('../../src/repositories/watermelonTrackerRepository');
			const repo = new WatermelonTrackerRepository();
			await expect(
				repo.upsertMany([sample, { ...sample, id: 't2' }])
			).resolves.toBeUndefined();
		});

		await jest.isolateModules(async () => {
			const { collection } = setupDb();
			const write = jest.fn(async () => {
				throw new Error('bad');
			});
			jest.doMock('../../src/db/watermelon', () => ({
				database: { get: () => collection, write },
			}));
			const {
				WatermelonTrackerRepository,
			} = require('../../src/repositories/watermelonTrackerRepository');
			const repo = new WatermelonTrackerRepository();
			await expect(repo.upsertMany([sample])).rejects.toMatchObject({
				name: 'SyncError',
			});
		});
	});
});
