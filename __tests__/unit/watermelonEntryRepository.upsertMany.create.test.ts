import { jest } from '@jest/globals';

describe('WatermelonEntryRepository upsertMany create path', () => {
	it('creates new entries when none exist', async () => {
		await jest.isolateModules(async () => {
			const writeMock = jest.fn(async (fn: () => Promise<void>) => fn());
			const findMock = jest
				.fn<() => Promise<unknown>>()
				.mockResolvedValue(null); // No existing entry
			const createMock = jest.fn(
				(
					cb: (
						m: { _raw: Record<string, unknown> } & Record<
							string,
							unknown
						>
					) => void
				) => {
					cb({
						_raw: { id: 'e1' },
						date: 0,
						status: 'office',
						isAdvisory: false,
						trackerId: 't1',
						needsSync: true,
						lastModified: 0,
					});
				}
			);
			jest.doMock('../../src/db/watermelon', () => ({
				database: {
					write: writeMock,
					get: jest.fn().mockReturnValue({
						find: findMock,
						create: createMock,
					}),
				},
			}));
			jest.doMock('../../src/mappers/entryMapper', () => ({
				entryDTOToModelData: () => ({
					date: 0,
					status: 'office',
					isAdvisory: false,
					trackerId: 't1',
					needsSync: true,
					lastModified: 0,
				}),
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await repo.upsertMany('t1', [
				{
					id: 'e1',
					trackerId: 't1',
					date: '2025-01-01',
					status: 'office',
					isAdvisory: false,
					needsSync: true,
					lastModified: 1,
				},
			]);
			expect(createMock).toHaveBeenCalled();
		});
	});
});
