import { appConfig } from '@/shared/constants/appConfig';

describe('appConfig', () => {
	it('should export an object with syncIntervalMs', () => {
		expect(appConfig).toHaveProperty('syncIntervalMs');
		expect(typeof appConfig.syncIntervalMs).toBe('number');
	});

	it('should have syncIntervalMs set to 60000 milliseconds', () => {
		expect(appConfig.syncIntervalMs).toBe(60_000);
	});

	it('should be a readonly object structure', () => {
		expect(appConfig).toEqual({
			syncIntervalMs: 60_000,
		});
	});
});
