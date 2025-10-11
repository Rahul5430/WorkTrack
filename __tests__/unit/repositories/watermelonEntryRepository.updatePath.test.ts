import { jest } from '@jest/globals';

describe('WatermelonEntryRepository update path', () => {
	it('updates existing entries in upsertMany', async () => {
		await jest.isolateModules(async () => {
			const writeMock = jest.fn(async (fn: () => Promise<void>) => fn());
			const updateMock = jest.fn();
			const findMock = jest
				.fn<() => Promise<unknown>>()
				.mockResolvedValue({
					update: updateMock,
				});
			jest.doMock('../../../src/db/watermelon', () => ({
				database: {
					write: writeMock,
					get: jest.fn().mockReturnValue({ find: findMock }),
				},
			}));
			jest.doMock('../../../src/mappers/entryMapper', () => ({
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
			} = require('../../../src/repositories/watermelonEntryRepository');
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
			expect(updateMock).toHaveBeenCalled();
		});
	});
});
