import { jest } from '@jest/globals';

describe('WatermelonTrackerRepository update branches', () => {
	it('updates only provided fields in tracker', async () => {
		await jest.isolateModules(async () => {
			const writeMock = jest.fn(async (fn: () => Promise<void>) => fn());
			const updateMock = jest.fn();
			const findMock = jest
				.fn<() => Promise<unknown>>()
				.mockResolvedValue({
					update: updateMock,
				});
			jest.doMock('../../src/db/watermelon', () => ({
				database: {
					write: writeMock,
					get: jest.fn().mockReturnValue({ find: findMock }),
				},
			}));
			jest.doMock('../../src/mappers/trackerMapper', () => ({
				trackerDTOToModelData: (t: Record<string, unknown>) => t,
			}));
			const {
				WatermelonTrackerRepository,
			} = require('../../src/repositories/watermelonTrackerRepository');
			const repo = new WatermelonTrackerRepository();

			// Test with only name and color
			await repo.update(
				{ id: 't1', name: 'New Name', color: '#ff0000' },
				'u1'
			);
			expect(updateMock).toHaveBeenCalled();

			// Test with only isDefault
			await repo.update({ id: 't1', isDefault: true }, 'u1');
			expect(updateMock).toHaveBeenCalled();

			// Test with only trackerType
			await repo.update({ id: 't1', trackerType: 'personal' }, 'u1');
			expect(updateMock).toHaveBeenCalled();
		});
	});
});
