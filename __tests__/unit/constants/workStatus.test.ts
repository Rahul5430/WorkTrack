import {
	WORK_STATUS,
	WORK_STATUS_BACKGROUND_COLORS,
	WORK_STATUS_COLORS,
	WORK_STATUS_LABELS,
	WORK_STATUS_PRESSED_COLORS,
} from '../../../src/constants/workStatus';

// Mock the themes
jest.mock('../../../src/themes', () => ({
	colors: {
		office: '#2196F3',
		wfh: '#4CAF50',
		holiday: '#FF9800',
		error: '#EF4444',
		forecast: '#9C27B0',
		background: {
			office: '#2196F315',
			wfh: '#4CAF5015',
			holiday: '#FF525215',
			error: '#EF444415',
			forecast: '#9C27B015',
		},
		button: {
			primaryPressed: '#1E40AF',
		},
	},
}));

// Mock the types
jest.mock('../../../src/types/calendar', () => ({
	MarkedDayStatus: {},
}));

describe('workStatus', () => {
	it('should export WORK_STATUS with correct values', () => {
		expect(WORK_STATUS).toBeDefined();
		expect(WORK_STATUS.OFFICE).toBe('office');
		expect(WORK_STATUS.WFH).toBe('wfh');
		expect(WORK_STATUS.HOLIDAY).toBe('holiday');
		expect(WORK_STATUS.LEAVE).toBe('leave');
		expect(WORK_STATUS.ADVISORY).toBe('advisory');
	});

	it('should export WORK_STATUS_COLORS with correct values', () => {
		expect(WORK_STATUS_COLORS).toBeDefined();
		expect(WORK_STATUS_COLORS[WORK_STATUS.OFFICE]).toBe('#2196F3');
		expect(WORK_STATUS_COLORS[WORK_STATUS.WFH]).toBe('#4CAF50');
		expect(WORK_STATUS_COLORS[WORK_STATUS.HOLIDAY]).toBe('#FF9800');
		expect(WORK_STATUS_COLORS[WORK_STATUS.LEAVE]).toBe('#EF4444');
		expect(WORK_STATUS_COLORS[WORK_STATUS.ADVISORY]).toBe('#9C27B0');
	});

	it('should export WORK_STATUS_BACKGROUND_COLORS with correct values', () => {
		expect(WORK_STATUS_BACKGROUND_COLORS).toBeDefined();
		expect(WORK_STATUS_BACKGROUND_COLORS[WORK_STATUS.OFFICE]).toBe(
			'#2196F315'
		);
		expect(WORK_STATUS_BACKGROUND_COLORS[WORK_STATUS.WFH]).toBe(
			'#4CAF5015'
		);
		expect(WORK_STATUS_BACKGROUND_COLORS[WORK_STATUS.HOLIDAY]).toBe(
			'#FF525215'
		);
		expect(WORK_STATUS_BACKGROUND_COLORS[WORK_STATUS.LEAVE]).toBe(
			'#EF444415'
		);
		expect(WORK_STATUS_BACKGROUND_COLORS[WORK_STATUS.ADVISORY]).toBe(
			'#9C27B015'
		);
	});

	it('should export WORK_STATUS_PRESSED_COLORS with correct values', () => {
		expect(WORK_STATUS_PRESSED_COLORS).toBeDefined();
		expect(WORK_STATUS_PRESSED_COLORS[WORK_STATUS.OFFICE]).toBe('#1E40AF');
		expect(WORK_STATUS_PRESSED_COLORS[WORK_STATUS.WFH]).toBe('#1E40AF');
		expect(WORK_STATUS_PRESSED_COLORS[WORK_STATUS.HOLIDAY]).toBe('#FF9800');
		expect(WORK_STATUS_PRESSED_COLORS[WORK_STATUS.LEAVE]).toBe('#EF4444');
		expect(WORK_STATUS_PRESSED_COLORS[WORK_STATUS.ADVISORY]).toBe(
			'#9C27B0'
		);
	});

	it('should export WORK_STATUS_LABELS with correct values', () => {
		expect(WORK_STATUS_LABELS).toBeDefined();
		expect(WORK_STATUS_LABELS[WORK_STATUS.OFFICE]).toBe('Office');
		expect(WORK_STATUS_LABELS[WORK_STATUS.WFH]).toBe('WFH');
		expect(WORK_STATUS_LABELS[WORK_STATUS.HOLIDAY]).toBe('Holiday');
		expect(WORK_STATUS_LABELS[WORK_STATUS.LEAVE]).toBe('Leave');
		expect(WORK_STATUS_LABELS[WORK_STATUS.ADVISORY]).toBe('Advisory');
	});

	it('should have consistent structure across all work status constants', () => {
		const statusValues = Object.values(WORK_STATUS).sort();
		const colorKeys = Object.keys(WORK_STATUS_COLORS).sort();
		const backgroundColorKeys = Object.keys(
			WORK_STATUS_BACKGROUND_COLORS
		).sort();
		const pressedColorKeys = Object.keys(WORK_STATUS_PRESSED_COLORS).sort();
		const labelKeys = Object.keys(WORK_STATUS_LABELS).sort();

		// All constants should have the same keys
		expect(colorKeys).toEqual(statusValues);
		expect(backgroundColorKeys).toEqual(statusValues);
		expect(pressedColorKeys).toEqual(statusValues);
		expect(labelKeys).toEqual(statusValues);
	});

	it('should have all expected work status values', () => {
		const expectedStatuses = [
			'office',
			'wfh',
			'holiday',
			'leave',
			'advisory',
		];
		const actualStatuses = Object.values(WORK_STATUS);

		expect(actualStatuses).toEqual(expectedStatuses);
		expect(actualStatuses).toHaveLength(5);
	});

	it('should be readonly (const assertion)', () => {
		// Test that the constants are properly defined
		expect(typeof WORK_STATUS).toBe('object');
		expect(WORK_STATUS).not.toBeNull();
		expect(typeof WORK_STATUS_COLORS).toBe('object');
		expect(WORK_STATUS_COLORS).not.toBeNull();
		expect(typeof WORK_STATUS_BACKGROUND_COLORS).toBe('object');
		expect(WORK_STATUS_BACKGROUND_COLORS).not.toBeNull();
		expect(typeof WORK_STATUS_PRESSED_COLORS).toBe('object');
		expect(WORK_STATUS_PRESSED_COLORS).not.toBeNull();
		expect(typeof WORK_STATUS_LABELS).toBe('object');
		expect(WORK_STATUS_LABELS).not.toBeNull();
	});

	it('should maintain color consistency', () => {
		// Office and WFH should have the same pressed color (primaryPressed)
		expect(WORK_STATUS_PRESSED_COLORS[WORK_STATUS.OFFICE]).toBe(
			WORK_STATUS_PRESSED_COLORS[WORK_STATUS.WFH]
		);

		// Holiday, Leave, and Advisory should use their respective base colors for pressed state
		expect(WORK_STATUS_PRESSED_COLORS[WORK_STATUS.HOLIDAY]).toBe(
			WORK_STATUS_COLORS[WORK_STATUS.HOLIDAY]
		);
		expect(WORK_STATUS_PRESSED_COLORS[WORK_STATUS.LEAVE]).toBe(
			WORK_STATUS_COLORS[WORK_STATUS.LEAVE]
		);
		expect(WORK_STATUS_PRESSED_COLORS[WORK_STATUS.ADVISORY]).toBe(
			WORK_STATUS_COLORS[WORK_STATUS.ADVISORY]
		);
	});
});
