import { storageKeys } from '@/shared/constants/storageKeys';

describe('storageKeys', () => {
	it('should export an object with storage keys', () => {
		expect(storageKeys).toHaveProperty('user');
	});

	it('should have user key set to "user"', () => {
		expect(storageKeys.user).toBe('user');
	});

	it('should contain expected keys', () => {
		const keys = Object.keys(storageKeys);
		expect(keys).toContain('user');
	});

	it('should have string values for all keys', () => {
		Object.values(storageKeys).forEach((value) => {
			expect(typeof value).toBe('string');
		});
	});
});
