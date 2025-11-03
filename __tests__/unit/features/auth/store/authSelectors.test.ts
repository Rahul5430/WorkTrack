import { authSelectors } from '@/features/auth/store/authSelectors';

describe('authSelectors', () => {
	it('should export an empty object', () => {
		expect(authSelectors).toEqual({});
		expect(typeof authSelectors).toBe('object');
	});

	it('should be a constant object', () => {
		expect(Object.keys(authSelectors)).toHaveLength(0);
	});
});
