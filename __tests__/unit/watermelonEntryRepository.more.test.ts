describe('WatermelonEntryRepository additional', () => {
	const entry = {
		id: '2025-01-01',
		trackerId: 't1',
		date: '2025-01-01',
		status: 'office',
		isAdvisory: false,
		needsSync: true,
		lastModified: 1,
	};

	function setupDb() {
		const workTracks = {
			find: jest.fn(),
			create: jest.fn(
				async (cb: (model: Record<string, unknown>) => void) =>
					cb({
						_raw: {},
						set date(v: string) {},
						set status(v: string) {},
						set isAdvisory(v: boolean) {},
						set trackerId(v: string) {},
						set needsSync(v: boolean) {},
						set lastModified(v: number) {},
					})
			),
			query: jest
				.fn()
				.mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }),
		};
		const write = jest.fn(async (fn: () => unknown) => {
			await fn();
		});
		return { workTracks, write };
	}

	it('upsertOne creates when missing and updates when present', async () => {
		await jest.isolateModules(async () => {
			const { workTracks, write } = setupDb();
			workTracks.find.mockRejectedValueOnce(new Error('not found'));
			jest.doMock('../../src/db/watermelon', () => ({
				database: { get: () => workTracks, write },
				WorkTrack: class {},
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await expect(repo.upsertOne(entry)).resolves.toBeUndefined();
		});

		await jest.isolateModules(async () => {
			const { workTracks, write } = setupDb();
			workTracks.find.mockResolvedValueOnce({
				update: jest.fn(
					async (cb: (model: Record<string, unknown>) => void) =>
						cb({
							set date(v: string) {},
							set status(v: string) {},
							set isAdvisory(v: boolean) {},
							set trackerId(v: string) {},
							set needsSync(v: boolean) {},
							set lastModified(v: number) {},
						})
				),
			});
			jest.doMock('../../src/db/watermelon', () => ({
				database: { get: () => workTracks, write },
				WorkTrack: class {},
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await expect(repo.upsertOne(entry)).resolves.toBeUndefined();
		});
	});

	it('markSynced updates fields and handles not found/error', async () => {
		await jest.isolateModules(async () => {
			const { workTracks, write } = setupDb();
			workTracks.find.mockResolvedValueOnce({
				update: jest.fn(
					async (cb: (model: Record<string, unknown>) => void) =>
						cb({})
				),
			});
			jest.doMock('../../src/db/watermelon', () => ({
				database: { get: () => workTracks, write },
				WorkTrack: class {},
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await expect(repo.markSynced([entry])).resolves.toBeUndefined();
		});

		await jest.isolateModules(async () => {
			const { workTracks, write } = setupDb();
			workTracks.find.mockRejectedValueOnce(new Error('nope'));
			jest.doMock('../../src/db/watermelon', () => ({
				database: { get: () => workTracks, write },
				WorkTrack: class {},
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await expect(repo.markSynced([entry])).rejects.toBeInstanceOf(
				Error
			);
		});
	});

	it('delete removes entry; wraps error', async () => {
		await jest.isolateModules(async () => {
			const { workTracks, write } = setupDb();
			workTracks.find.mockResolvedValueOnce({
				destroyPermanently: jest.fn(async () => {}),
			});
			jest.doMock('../../src/db/watermelon', () => ({
				database: { get: () => workTracks, write },
				WorkTrack: class {},
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await expect(repo.delete('2025-01-01')).resolves.toBeUndefined();
		});

		await jest.isolateModules(async () => {
			const { workTracks } = setupDb();
			const write = jest.fn(async () => {
				throw new Error('bad');
			});
			jest.doMock('../../src/db/watermelon', () => ({
				database: { get: () => workTracks, write },
				WorkTrack: class {},
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await expect(repo.delete('2025-01-01')).rejects.toMatchObject({
				name: 'SyncError',
			});
		});
	});
});
