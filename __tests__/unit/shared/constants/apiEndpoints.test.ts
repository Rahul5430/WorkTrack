import { apiEndpoints } from '@/shared/constants/apiEndpoints';

describe('apiEndpoints', () => {
	it('should export an empty object', () => {
		expect(apiEndpoints).toEqual({});
		expect(typeof apiEndpoints).toBe('object');
	});

	it('should be an object literal', () => {
		expect(Object.keys(apiEndpoints)).toHaveLength(0);
	});
});
