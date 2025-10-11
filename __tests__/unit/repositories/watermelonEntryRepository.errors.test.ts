describe('WatermelonEntryRepository error paths', () => {
	it('listUnsynced wraps fetch errors', async () => {
		await jest.isolateModules(async () => {
			const collection = {
				query: () => ({
					fetch: jest.fn().mockRejectedValue(new Error('q')),
				}),
			};
			jest.doMock('../../../src/db/watermelon', () => ({
				database: { get: () => collection },
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await expect(repo.listUnsynced()).rejects.toMatchObject({
				name: 'SyncError',
			});
		});
	});

	it('getFailedSyncRecords wraps fetch errors', async () => {
		await jest.isolateModules(async () => {
			const collection = {
				query: () => ({
					fetch: jest.fn().mockRejectedValue(new Error('q')),
				}),
			};
			jest.doMock('../../../src/db/watermelon', () => ({
				database: { get: () => collection },
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await expect(repo.getFailedSyncRecords()).rejects.toBeInstanceOf(
				Error
			);
		});
	});

	it('getRecordsExceedingRetryLimit wraps fetch errors', async () => {
		await jest.isolateModules(async () => {
			const collection = {
				query: () => ({
					fetch: jest.fn().mockRejectedValue(new Error('q')),
				}),
			};
			jest.doMock('../../../src/db/watermelon', () => ({
				database: { get: () => collection },
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await expect(
				repo.getRecordsExceedingRetryLimit(3)
			).rejects.toBeInstanceOf(Error);
		});
	});

	it('getEntriesForTracker wraps fetch errors', async () => {
		await jest.isolateModules(async () => {
			const collection = {
				query: () => ({
					fetch: jest.fn().mockRejectedValue(new Error('q')),
				}),
			};
			jest.doMock('../../../src/db/watermelon', () => ({
				database: { get: () => collection },
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await expect(
				repo.getEntriesForTracker('t1')
			).rejects.toBeInstanceOf(Error);
		});
	});

	it('getAllEntries wraps fetch errors', async () => {
		await jest.isolateModules(async () => {
			const collection = {
				query: () => ({
					fetch: jest.fn().mockRejectedValue(new Error('q')),
				}),
			};
			jest.doMock('../../../src/db/watermelon', () => ({
				database: { get: () => collection },
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await expect(repo.getAllEntries()).rejects.toBeInstanceOf(Error);
		});
	});

	it('upsertOne wraps write errors', async () => {
		await jest.isolateModules(async () => {
			const collection = {
				find: jest.fn().mockRejectedValue(new Error('nf')),
				create: jest.fn(),
			};
			const write = jest.fn(async () => {
				throw new Error('write');
			});
			jest.doMock('../../../src/db/watermelon', () => ({
				database: { get: () => collection, write },
				WorkTrack: class {},
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await expect(
				repo.upsertOne({
					id: '1',
					trackerId: 't',
					date: 'd',
					status: 'office',
					isAdvisory: false,
					needsSync: true,
					lastModified: 1,
				})
			).rejects.toMatchObject({ name: 'SyncError' });
		});
	});
});
