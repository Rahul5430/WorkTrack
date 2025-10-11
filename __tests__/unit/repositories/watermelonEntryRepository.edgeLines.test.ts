import { jest } from '@jest/globals';

describe('WatermelonEntryRepository edge lines', () => {
	it('upsertMany updates existing entry with all fields (lines 91-97)', async () => {
		await jest.isolateModules(async () => {
			const updateMock = jest.fn(
				(callback: (entry: Record<string, unknown>) => void) => {
					const mockEntry = {
						date: 0,
						status: 'office',
						isAdvisory: false,
						trackerId: 't1',
						needsSync: false,
						lastModified: 0,
					};
					callback(mockEntry);
					return Promise.resolve();
				}
			);

			const findMock = jest
				.fn<
					() => Promise<{
						update: (
							cb: (e: Record<string, unknown>) => void
						) => Promise<void>;
					}>
				>()
				.mockResolvedValue({
					update: updateMock,
				});

			jest.doMock('../../../src/db/watermelon', () => ({
				database: {
					write: jest.fn(async (fn: () => Promise<void>) => {
						await fn();
					}),
					get: jest.fn().mockReturnValue({
						find: findMock,
						create: jest.fn(),
					}),
				},
			}));
			jest.doMock('../../../src/mappers/entryMapper', () => ({
				entryDTOToModelData: jest.fn().mockReturnValue({
					date: 1234567890,
					status: 'home',
					isAdvisory: true,
					trackerId: 't1',
					needsSync: true,
					lastModified: 9876543210,
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

			expect(updateMock).toHaveBeenCalledTimes(1);
			expect(findMock).toHaveBeenCalledWith('e1');
		});
	});
});
