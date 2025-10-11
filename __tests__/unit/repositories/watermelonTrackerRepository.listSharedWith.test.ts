import { jest } from '@jest/globals';

describe('WatermelonTrackerRepository listSharedWith', () => {
	it('returns empty array and logs debug message', async () => {
		await jest.isolateModules(async () => {
			const debugSpy = jest.fn();
			jest.doMock('../../../src/logging', () => ({
				logger: {
					debug: debugSpy,
					info: jest.fn(),
					warn: jest.fn(),
					error: jest.fn(),
				},
			}));
			const {
				WatermelonTrackerRepository,
			} = require('../../../src/repositories/watermelonTrackerRepository');
			const repo = new WatermelonTrackerRepository();
			const result = await repo.listSharedWith('u1');
			expect(result).toEqual([]);
			expect(debugSpy).toHaveBeenCalledWith(
				'listSharedWith called on WatermelonTrackerRepository - not implemented'
			);
		});
	});
});
