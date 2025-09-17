describe('WatermelonTrackerRepository error paths', () => {
	it('listOwned wraps fetch errors', async () => {
		await jest.isolateModules(async () => {
			const collection = {
				query: () => ({
					fetch: jest.fn().mockRejectedValue(new Error('q')),
				}),
			};
			jest.doMock('../../src/db/watermelon', () => ({
				database: { get: () => collection },
			}));
			const {
				WatermelonTrackerRepository,
			} = require('../../src/repositories/watermelonTrackerRepository');
			const repo = new WatermelonTrackerRepository();
			await expect(repo.listOwned('u1')).rejects.toMatchObject({
				name: 'SyncError',
			});
		});
	});

	it('ensureExists wraps errors from database', async () => {
		await jest.isolateModules(async () => {
			const collection = {
				find: jest.fn().mockImplementation(() => {
					throw new Error('db');
				}),
			};
			jest.doMock('../../src/db/watermelon', () => ({
				database: { get: () => collection },
			}));
			const {
				WatermelonTrackerRepository,
			} = require('../../src/repositories/watermelonTrackerRepository');
			const repo = new WatermelonTrackerRepository();
			await expect(repo.ensureExists('t1', 'u1')).rejects.toMatchObject({
				name: 'SyncError',
			});
		});
	});
});
