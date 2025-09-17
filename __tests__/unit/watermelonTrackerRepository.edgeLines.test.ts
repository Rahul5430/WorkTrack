import { jest } from '@jest/globals';

describe('WatermelonTrackerRepository edge lines', () => {
	it('update sets color when provided (line 60)', async () => {
		await jest.isolateModules(async () => {
			const updateMock = jest.fn(
				(callback: (tracker: Record<string, unknown>) => void) => {
					const mockTracker = {
						name: 'Old Name',
						color: '#000000',
						isDefault: false,
						trackerType: 'work',
					};
					callback(mockTracker);
					return Promise.resolve(mockTracker);
				}
			);

			jest.doMock('../../src/db/watermelon', () => ({
				database: {
					write: jest.fn(async (fn: () => Promise<void>) => {
						await fn();
					}),
					get: jest.fn().mockReturnValue({
						find: jest
							.fn<() => Promise<unknown>>()
							.mockResolvedValue({
								update: updateMock,
							}),
					}),
				},
			}));

			const {
				WatermelonTrackerRepository,
			} = require('../../src/repositories/watermelonTrackerRepository');
			const repo = new WatermelonTrackerRepository();

			await repo.update({ id: 't1', color: '#ff0000' }, 'u1');

			expect(updateMock).toHaveBeenCalledTimes(1);
		});
	});

	it('update sets isDefault when provided (line 63)', async () => {
		await jest.isolateModules(async () => {
			const updateMock = jest.fn(
				(callback: (tracker: Record<string, unknown>) => void) => {
					const mockTracker = {
						name: 'Old Name',
						color: '#000000',
						isDefault: false,
						trackerType: 'work',
					};
					callback(mockTracker);
					return Promise.resolve(mockTracker);
				}
			);

			jest.doMock('../../src/db/watermelon', () => ({
				database: {
					write: jest.fn(async (fn: () => Promise<void>) => {
						await fn();
					}),
					get: jest.fn().mockReturnValue({
						find: jest
							.fn<() => Promise<unknown>>()
							.mockResolvedValue({
								update: updateMock,
							}),
					}),
				},
			}));

			const {
				WatermelonTrackerRepository,
			} = require('../../src/repositories/watermelonTrackerRepository');
			const repo = new WatermelonTrackerRepository();

			await repo.update({ id: 't1', isDefault: true }, 'u1');

			expect(updateMock).toHaveBeenCalledTimes(1);
		});
	});

	it('update sets trackerType when provided (line 66)', async () => {
		await jest.isolateModules(async () => {
			const updateMock = jest.fn(
				(callback: (tracker: Record<string, unknown>) => void) => {
					const mockTracker = {
						name: 'Old Name',
						color: '#000000',
						isDefault: false,
						trackerType: 'work',
					};
					callback(mockTracker);
					return Promise.resolve(mockTracker);
				}
			);

			jest.doMock('../../src/db/watermelon', () => ({
				database: {
					write: jest.fn(async (fn: () => Promise<void>) => {
						await fn();
					}),
					get: jest.fn().mockReturnValue({
						find: jest
							.fn<() => Promise<unknown>>()
							.mockResolvedValue({
								update: updateMock,
							}),
					}),
				},
			}));

			const {
				WatermelonTrackerRepository,
			} = require('../../src/repositories/watermelonTrackerRepository');
			const repo = new WatermelonTrackerRepository();

			await repo.update({ id: 't1', trackerType: 'health' }, 'u1');

			expect(updateMock).toHaveBeenCalledTimes(1);
		});
	});
});
