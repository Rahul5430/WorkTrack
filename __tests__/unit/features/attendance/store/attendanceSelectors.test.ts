import { attendanceSelectors } from '@/features/attendance/store/attendanceSelectors';

describe('attendanceSelectors', () => {
	it('should export an empty object', () => {
		expect(attendanceSelectors).toEqual({});
		expect(typeof attendanceSelectors).toBe('object');
	});

	it('should be a constant object', () => {
		expect(Object.keys(attendanceSelectors)).toHaveLength(0);
	});
});
