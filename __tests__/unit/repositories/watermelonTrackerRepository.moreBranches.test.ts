describe('WatermelonTrackerRepository more branches', () => {
	it('update wraps database error in SyncError', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('../../../src/db/watermelon', () => ({
				database: {
					write: jest.fn(async (fn: () => Promise<void>) => {
						await fn();
					}),
					get: jest.fn().mockReturnValue({
						find: jest.fn().mockResolvedValue({
							update: jest
								.fn()
								.mockRejectedValue(new Error('db')),
						}),
					}),
				},
			}));
			const {
				WatermelonTrackerRepository,
			} = require('../../../src/repositories/watermelonTrackerRepository');
			const repo = new WatermelonTrackerRepository();
			await expect(
				repo.update({ id: 't1', name: 'n' }, 'u1')
			).rejects.toMatchObject({ name: 'SyncError' });
		});
	});

	it('listSharedWith wraps error in SyncError when logger throws', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('../../../src/logging', () => ({
				logger: {
					debug: () => {
						throw new Error('dbg');
					},
					error: jest.fn(),
					info: jest.fn(),
					warn: jest.fn(),
				},
			}));
			const {
				WatermelonTrackerRepository,
			} = require('../../../src/repositories/watermelonTrackerRepository');
			const repo = new WatermelonTrackerRepository();
			await expect(repo.listSharedWith('u1')).rejects.toMatchObject({
				name: 'SyncError',
			});
		});
	});
});
