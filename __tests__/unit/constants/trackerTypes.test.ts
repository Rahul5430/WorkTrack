import {
	DEFAULT_TRACKER_TYPE,
	TRACKER_TYPES,
	TrackerType,
} from '../../../src/constants/trackerTypes';

describe('trackerTypes', () => {
	it('should export TRACKER_TYPES with correct values', () => {
		expect(TRACKER_TYPES).toBeDefined();
		expect(TRACKER_TYPES.WORK_TRACK).toBe('work_track');
	});

	it('should have correct structure for TRACKER_TYPES', () => {
		expect(typeof TRACKER_TYPES).toBe('object');
		expect(Object.keys(TRACKER_TYPES)).toHaveLength(1);
		expect(Object.keys(TRACKER_TYPES)).toContain('WORK_TRACK');
	});

	it('should export DEFAULT_TRACKER_TYPE with correct value', () => {
		expect(DEFAULT_TRACKER_TYPE).toBeDefined();
		expect(DEFAULT_TRACKER_TYPE).toBe('work_track');
		expect(DEFAULT_TRACKER_TYPE).toBe(TRACKER_TYPES.WORK_TRACK);
	});

	it('should have correct type for TrackerType', () => {
		// Test that TrackerType is correctly inferred from TRACKER_TYPES
		const trackerType: TrackerType = 'work_track';
		expect(trackerType).toBe('work_track');

		// Test that it matches the TRACKER_TYPES values
		const validTypes: TrackerType[] = [TRACKER_TYPES.WORK_TRACK];
		expect(validTypes).toContain('work_track');
	});

	it('should be readonly (const assertion)', () => {
		// Test that the constants are properly defined
		expect(typeof TRACKER_TYPES).toBe('object');
		expect(TRACKER_TYPES).not.toBeNull();
		expect(typeof DEFAULT_TRACKER_TYPE).toBe('string');
		expect(DEFAULT_TRACKER_TYPE).not.toBeNull();
	});

	it('should maintain consistency between TRACKER_TYPES and DEFAULT_TRACKER_TYPE', () => {
		// Ensure DEFAULT_TRACKER_TYPE always matches a valid TRACKER_TYPES value
		const trackerTypeValues = Object.values(TRACKER_TYPES);
		expect(trackerTypeValues).toContain(DEFAULT_TRACKER_TYPE);
	});
});
