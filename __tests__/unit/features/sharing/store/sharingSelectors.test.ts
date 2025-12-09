import { sharingSelectors } from '@/features/sharing/store/sharingSelectors';

describe('sharingSelectors', () => {
	it('should export an empty object', () => {
		expect(sharingSelectors).toEqual({});
		expect(typeof sharingSelectors).toBe('object');
	});

	it('should be a constant object', () => {
		expect(Object.keys(sharingSelectors)).toHaveLength(0);
	});
});
