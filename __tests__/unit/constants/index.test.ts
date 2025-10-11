import * as constants from '../../../src/constants';

describe('constants/index', () => {
	it('should export all tracker types', () => {
		expect(constants.TRACKER_TYPES).toBeDefined();
		expect(constants.DEFAULT_TRACKER_TYPE).toBeDefined();
	});

	it('should export all work status constants', () => {
		expect(constants.WORK_STATUS).toBeDefined();
		expect(constants.WORK_STATUS_COLORS).toBeDefined();
		expect(constants.WORK_STATUS_BACKGROUND_COLORS).toBeDefined();
		expect(constants.WORK_STATUS_PRESSED_COLORS).toBeDefined();
		expect(constants.WORK_STATUS_LABELS).toBeDefined();
	});

	it('should have correct tracker types structure', () => {
		expect(constants.TRACKER_TYPES.WORK_TRACK).toBe('work_track');
		expect(constants.DEFAULT_TRACKER_TYPE).toBe('work_track');
	});

	it('should have correct work status structure', () => {
		expect(constants.WORK_STATUS.OFFICE).toBe('office');
		expect(constants.WORK_STATUS.WFH).toBe('wfh');
		expect(constants.WORK_STATUS.HOLIDAY).toBe('holiday');
		expect(constants.WORK_STATUS.LEAVE).toBe('leave');
		expect(constants.WORK_STATUS.ADVISORY).toBe('advisory');
	});

	it('should export all expected properties', () => {
		const expectedExports = [
			'TRACKER_TYPES',
			'DEFAULT_TRACKER_TYPE',
			'WORK_STATUS',
			'WORK_STATUS_COLORS',
			'WORK_STATUS_BACKGROUND_COLORS',
			'WORK_STATUS_PRESSED_COLORS',
			'WORK_STATUS_LABELS',
		];

		expectedExports.forEach((exportName) => {
			expect(constants).toHaveProperty(exportName);
		});
	});

	it('should maintain consistency between exports', () => {
		// Verify that all work status constants have consistent keys
		const statusValues = Object.values(constants.WORK_STATUS).sort();
		const colorKeys = Object.keys(constants.WORK_STATUS_COLORS).sort();
		const backgroundColorKeys = Object.keys(
			constants.WORK_STATUS_BACKGROUND_COLORS
		).sort();
		const pressedColorKeys = Object.keys(
			constants.WORK_STATUS_PRESSED_COLORS
		).sort();
		const labelKeys = Object.keys(constants.WORK_STATUS_LABELS).sort();

		expect(colorKeys).toEqual(statusValues);
		expect(backgroundColorKeys).toEqual(statusValues);
		expect(pressedColorKeys).toEqual(statusValues);
		expect(labelKeys).toEqual(statusValues);
	});

	it('should have proper type definitions', () => {
		// Test that work status values are properly typed
		const workStatus: (typeof constants.WORK_STATUS)[keyof typeof constants.WORK_STATUS] =
			constants.WORK_STATUS.OFFICE;
		expect(workStatus).toBe('office');
	});
});
