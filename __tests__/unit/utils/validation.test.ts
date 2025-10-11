import { MarkedDayStatus } from '../../../src/types/calendar';
import { ValidationUtils } from '../../../src/utils/validation';

describe('ValidationUtils', () => {
	describe('validateStatus', () => {
		it('should validate valid status values', () => {
			const validStatuses: MarkedDayStatus[] = [
				'wfh',
				'office',
				'holiday',
				'leave',
			];

			validStatuses.forEach((status) => {
				expect(ValidationUtils.validateStatus(status)).toBe(true);
			});
		});

		it('should reject invalid status values', () => {
			const invalidStatuses = ['invalid', 'work', 'home', 'sick', ''];

			invalidStatuses.forEach((status) => {
				expect(ValidationUtils.validateStatus(status)).toBe(false);
			});
		});

		it('should work with type assertion', () => {
			const status = 'office' as string;
			if (ValidationUtils.validateStatus(status)) {
				// Type should be narrowed to MarkedDayStatus
				expect(status).toBe('office');
			}
		});
	});

	describe('validateDate', () => {
		it('should validate correct date format', () => {
			const validDates = [
				'2024-01-01',
				'2024-12-31',
				'2000-02-29', // Leap year
				'2023-06-15',
			];

			validDates.forEach((date) => {
				expect(ValidationUtils.validateDate(date)).toBe(true);
			});
		});

		it('should reject invalid date formats', () => {
			const invalidDates = [
				'2024/01/01', // Wrong separator
				'01-01-2024', // Wrong order
				'2024-1-1', // Missing leading zeros
				'invalid', // Not a date
				'', // Empty string
				'2024-01', // Incomplete
			];

			invalidDates.forEach((date) => {
				expect(ValidationUtils.validateDate(date)).toBe(false);
			});
		});

		it('should handle edge cases', () => {
			expect(ValidationUtils.validateDate('0000-01-01')).toBe(true);
			expect(ValidationUtils.validateDate('9999-12-31')).toBe(true);
		});
	});

	describe('validateTrackerId', () => {
		it('should validate non-empty string tracker IDs', () => {
			const validIds = ['tracker1', 'tracker-123', 'my_tracker', 'a'];

			validIds.forEach((id) => {
				expect(ValidationUtils.validateTrackerId(id)).toBe(true);
			});
		});

		it('should reject invalid tracker IDs', () => {
			const invalidIds = ['', null, undefined, 123, {}, []];

			invalidIds.forEach((id) => {
				expect(ValidationUtils.validateTrackerId(id as string)).toBe(
					false
				);
			});
		});
	});

	describe('validateEntryData', () => {
		const validEntryData = {
			trackerId: 'tracker123',
			date: '2024-01-01',
			status: 'office',
			isAdvisory: false,
		};

		it('should validate correct entry data', () => {
			expect(ValidationUtils.validateEntryData(validEntryData)).toBe(
				true
			);
		});

		it('should validate entry data with advisory flag', () => {
			const advisoryData = { ...validEntryData, isAdvisory: true };
			expect(ValidationUtils.validateEntryData(advisoryData)).toBe(true);
		});

		it('should reject entry data with invalid tracker ID', () => {
			const invalidData = { ...validEntryData, trackerId: '' };
			expect(ValidationUtils.validateEntryData(invalidData)).toBe(false);
		});

		it('should reject entry data with invalid date', () => {
			const invalidData = { ...validEntryData, date: 'invalid-date' };
			expect(ValidationUtils.validateEntryData(invalidData)).toBe(false);
		});

		it('should reject entry data with invalid status', () => {
			const invalidData = { ...validEntryData, status: 'invalid-status' };
			expect(ValidationUtils.validateEntryData(invalidData)).toBe(false);
		});

		it('should reject entry data with invalid isAdvisory type', () => {
			const invalidData = {
				...validEntryData,
				isAdvisory: 'true' as unknown as boolean,
			};
			expect(ValidationUtils.validateEntryData(invalidData)).toBe(false);
		});

		it('should validate all valid status types', () => {
			const statuses: MarkedDayStatus[] = [
				'wfh',
				'office',
				'holiday',
				'leave',
			];

			statuses.forEach((status) => {
				const data = { ...validEntryData, status };
				expect(ValidationUtils.validateEntryData(data)).toBe(true);
			});
		});

		it('should handle missing properties', () => {
			const incompleteData = {
				trackerId: 'tracker123',
				date: '2024-01-01',
				// Missing status and isAdvisory
			} as unknown as Parameters<
				typeof ValidationUtils.validateEntryData
			>[0];

			expect(ValidationUtils.validateEntryData(incompleteData)).toBe(
				false
			);
		});
	});
});
