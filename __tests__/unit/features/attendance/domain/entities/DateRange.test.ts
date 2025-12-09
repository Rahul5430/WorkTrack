import { DateRange } from '@/features/attendance/domain/entities/DateRange';

describe('DateRange', () => {
	describe('constructor', () => {
		it('creates date range with Date objects', () => {
			const start = new Date('2023-01-01');
			const end = new Date('2023-01-31');
			const range = new DateRange(start, end);

			expect(range.start).toEqual(start);
			expect(range.end).toEqual(end);
		});

		it('creates date range with string dates', () => {
			const range = new DateRange('2023-01-01', '2023-01-31');

			expect(range.start).toBeInstanceOf(Date);
			expect(range.end).toBeInstanceOf(Date);
		});

		it('strips time from dates', () => {
			const start = new Date('2023-01-01T10:30:00');
			const end = new Date('2023-01-31T15:45:00');
			const range = new DateRange(start, end);

			// stripTime uses UTC, so check UTC values
			expect(range.start.getUTCHours()).toBe(0);
			expect(range.start.getUTCMinutes()).toBe(0);
			expect(range.end.getUTCHours()).toBe(0);
			expect(range.end.getUTCMinutes()).toBe(0);
		});

		it('allows equal start and end dates', () => {
			const date = new Date('2023-01-15');
			const range = new DateRange(date, date);

			expect(range.start.getTime()).toBe(range.end.getTime());
		});

		it('throws error when start is after end', () => {
			expect(() => new DateRange('2023-01-31', '2023-01-01')).toThrow(
				'DateRange start must be before or equal to end'
			);
		});

		it('throws error for invalid start date', () => {
			expect(() => new DateRange('invalid', '2023-01-31')).toThrow(
				'Invalid dates for DateRange'
			);
		});

		it('throws error for invalid end date', () => {
			expect(() => new DateRange('2023-01-01', 'invalid')).toThrow(
				'Invalid dates for DateRange'
			);
		});
	});

	describe('contains', () => {
		it('returns true when date is within range', () => {
			const range = new DateRange('2023-01-01', '2023-01-31');

			expect(range.contains('2023-01-15')).toBe(true);
			expect(range.contains(new Date('2023-01-15'))).toBe(true);
		});

		it('returns true for start date', () => {
			const range = new DateRange('2023-01-01', '2023-01-31');

			expect(range.contains('2023-01-01')).toBe(true);
		});

		it('returns true for end date', () => {
			const range = new DateRange('2023-01-01', '2023-01-31');

			expect(range.contains('2023-01-31')).toBe(true);
		});

		it('returns false when date is before range', () => {
			const range = new DateRange('2023-01-01', '2023-01-31');

			expect(range.contains('2022-12-31')).toBe(false);
		});

		it('returns false when date is after range', () => {
			const range = new DateRange('2023-01-01', '2023-01-31');

			expect(range.contains('2023-02-01')).toBe(false);
		});

		it('strips time when checking contains', () => {
			const range = new DateRange('2023-01-01', '2023-01-31');
			const dateWithTime = new Date('2023-01-15T15:30:00');

			expect(range.contains(dateWithTime)).toBe(true);
		});
	});

	describe('overlaps', () => {
		it('returns true when ranges overlap', () => {
			const range1 = new DateRange('2023-01-01', '2023-01-31');
			const range2 = new DateRange('2023-01-15', '2023-02-15');

			expect(range1.overlaps(range2)).toBe(true);
		});

		it('returns true when one range contains the other', () => {
			const range1 = new DateRange('2023-01-01', '2023-01-31');
			const range2 = new DateRange('2023-01-10', '2023-01-20');

			expect(range1.overlaps(range2)).toBe(true);
		});

		it('returns true when ranges share start date', () => {
			const range1 = new DateRange('2023-01-01', '2023-01-31');
			const range2 = new DateRange('2023-01-01', '2023-02-15');

			expect(range1.overlaps(range2)).toBe(true);
		});

		it('returns true when ranges share end date', () => {
			const range1 = new DateRange('2023-01-01', '2023-01-31');
			const range2 = new DateRange('2022-12-01', '2023-01-31');

			expect(range1.overlaps(range2)).toBe(true);
		});

		it('returns false when ranges do not overlap', () => {
			const range1 = new DateRange('2023-01-01', '2023-01-31');
			const range2 = new DateRange('2023-02-01', '2023-02-28');

			expect(range1.overlaps(range2)).toBe(false);
		});

		it('returns false when ranges are adjacent', () => {
			const range1 = new DateRange('2023-01-01', '2023-01-31');
			const range2 = new DateRange('2023-02-01', '2023-02-28');

			expect(range1.overlaps(range2)).toBe(false);
		});
	});

	describe('toString', () => {
		it('formats range as start..end', () => {
			const range = new DateRange('2023-01-01', '2023-01-31');

			expect(range.toString()).toBe('2023-01-01..2023-01-31');
		});

		it('uses YYYY-MM-DD format', () => {
			const range = new DateRange('2023-12-25', '2024-01-05');

			const result = range.toString();
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}$/);
		});
	});

	describe('stripTime', () => {
		it('strips time component from dates', () => {
			const date = new Date('2023-01-15T15:30:45.123Z');
			const stripped = DateRange.stripTime(date);
			const resultDate = new Date(stripped);

			// stripTime uses UTC, so check UTC values
			expect(resultDate.getUTCHours()).toBe(0);
			expect(resultDate.getUTCMinutes()).toBe(0);
			expect(resultDate.getUTCSeconds()).toBe(0);
			expect(resultDate.getUTCMilliseconds()).toBe(0);
		});

		it('uses UTC to avoid timezone issues', () => {
			const date1 = new Date('2023-01-15T00:00:00Z');
			const date2 = new Date('2023-01-15T23:59:59Z');

			const stripped1 = DateRange.stripTime(date1);
			const stripped2 = DateRange.stripTime(date2);

			expect(stripped1).toBe(stripped2);
		});
	});
});
