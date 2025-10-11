import { jest } from '@jest/globals';

describe('WatermelonTrackerRepository optional fields', () => {
	it('handles undefined optional fields in update', async () => {
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
			jest.doMock('../../../src/mappers/trackerMapper', () => ({
				trackerDTOToModelData: (t: Record<string, unknown>) => t,
			}));
			const {
				WatermelonTrackerRepository,
			} = require('../../../src/repositories/watermelonTrackerRepository');
			const repo = new WatermelonTrackerRepository();

			// Test with undefined optional fields
			await repo.update({ id: 't1' }, 'u1');
			expect(updateMock).toHaveBeenCalled();
		});
	});
});
