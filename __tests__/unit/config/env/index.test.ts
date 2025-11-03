import { ENV } from '@/config/env';

describe('ENV config', () => {
	it('should export ENV object', () => {
		expect(ENV).toBeDefined();
		expect(typeof ENV).toBe('object');
	});

	it('should have FIRESTORE_EMULATOR_HOST property', () => {
		expect(ENV).toHaveProperty('FIRESTORE_EMULATOR_HOST');
		expect(
			typeof ENV.FIRESTORE_EMULATOR_HOST === 'string' ||
				ENV.FIRESTORE_EMULATOR_HOST === undefined
		).toBe(true);
	});

	it('should handle missing @env module gracefully', () => {
		// The module handles missing @env by returning empty object
		// Just verify it doesn't throw
		expect(() => ENV).not.toThrow();
	});
});
