describe('WatermelonEntryRepository success paths', () => {
	it('listUnsynced returns mapped entries', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('@nozbe/watermelondb', () => ({
				Q: { where: () => ({}), notEq: () => ({}) },
			}));
			const model = {
				id: '1',
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				trackerId: 't1',
				needsSync: true,
				lastModified: 1,
			};
			const collection = {
				query: () => ({ fetch: jest.fn().mockResolvedValue([model]) }),
			};
			jest.doMock('../../../src/db/watermelon', () => ({
				database: { get: () => collection },
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await expect(repo.listUnsynced()).resolves.toHaveLength(1);
		});
	});

	it('getFailedSyncRecords returns mapped entries', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('@nozbe/watermelondb', () => ({
				Q: { where: () => ({}), notEq: () => ({}) },
			}));
			const model = {
				id: '2',
				date: '2025-02-01',
				status: 'office',
				isAdvisory: false,
				trackerId: 't1',
				needsSync: true,
				lastModified: 1,
			};
			const collection = {
				query: () => ({ fetch: jest.fn().mockResolvedValue([model]) }),
			};
			jest.doMock('../../../src/db/watermelon', () => ({
				database: { get: () => collection },
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await expect(repo.getFailedSyncRecords()).resolves.toHaveLength(1);
		});
	});

	it('getRecordsExceedingRetryLimit returns mapped entries', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('@nozbe/watermelondb', () => ({
				Q: { where: () => ({}), gte: () => ({}) },
			}));
			const model = {
				id: '3',
				date: '2025-03-01',
				status: 'office',
				isAdvisory: false,
				trackerId: 't1',
				needsSync: true,
				lastModified: 1,
			};
			const collection = {
				query: () => ({ fetch: jest.fn().mockResolvedValue([model]) }),
			};
			jest.doMock('../../../src/db/watermelon', () => ({
				database: { get: () => collection },
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await expect(
				repo.getRecordsExceedingRetryLimit(5)
			).resolves.toHaveLength(1);
		});
	});

	it('getEntriesForTracker returns mapped entries', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('@nozbe/watermelondb', () => ({
				Q: { where: () => ({}) },
			}));
			const model = {
				id: '4',
				date: '2025-04-01',
				status: 'office',
				isAdvisory: false,
				trackerId: 't1',
				needsSync: true,
				lastModified: 1,
			};
			const collection = {
				query: () => ({ fetch: jest.fn().mockResolvedValue([model]) }),
			};
			jest.doMock('../../../src/db/watermelon', () => ({
				database: { get: () => collection },
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await expect(repo.getEntriesForTracker('t1')).resolves.toHaveLength(
				1
			);
		});
	});

	it('getAllEntries returns mapped entries', async () => {
		await jest.isolateModules(async () => {
			const model = {
				id: '5',
				date: '2025-05-01',
				status: 'office',
				isAdvisory: false,
				trackerId: 't1',
				needsSync: true,
				lastModified: 1,
			};
			const collection = {
				query: () => ({ fetch: jest.fn().mockResolvedValue([model]) }),
			};
			jest.doMock('../../../src/db/watermelon', () => ({
				database: { get: () => collection },
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await expect(repo.getAllEntries()).resolves.toHaveLength(1);
		});
	});
});
