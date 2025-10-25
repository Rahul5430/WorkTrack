import { Timestamp } from '../../../../../src/shared/domain/value-objects/Timestamp';

describe('Timestamp', () => {
	describe('constructor', () => {
		it('should create timestamp from Date', () => {
			const date = new Date('2023-01-01T12:00:00Z');
			const timestamp = new Timestamp(date);

			expect(timestamp.value).toEqual(date);
		});

		it('should create timestamp from string', () => {
			const timestamp = new Timestamp('2023-01-01T12:00:00Z');

			expect(timestamp.value).toEqual(new Date('2023-01-01T12:00:00Z'));
		});

		it('should create timestamp from number (milliseconds)', () => {
			const milliseconds = 1672574400000; // 2023-01-01T12:00:00Z
			const timestamp = new Timestamp(milliseconds);

			expect(timestamp.value).toEqual(new Date(milliseconds));
		});

		it('should throw error for invalid input', () => {
			expect(() => new Timestamp('invalid-date')).toThrow(
				'Invalid timestamp value'
			);
			expect(() => new Timestamp(NaN)).toThrow('Invalid timestamp value');
			expect(() => new Timestamp(null as unknown as Date)).toThrow(
				'Timestamp must be a Date, string, or number'
			);
			expect(() => new Timestamp(undefined as unknown as Date)).toThrow(
				'Timestamp must be a Date, string, or number'
			);
		});
	});

	describe('static methods', () => {
		describe('fromDate', () => {
			it('should create timestamp from Date', () => {
				const date = new Date('2023-01-01T12:00:00Z');
				const timestamp = Timestamp.fromDate(date);

				expect(timestamp.value).toEqual(date);
			});
		});

		describe('fromString', () => {
			it('should create timestamp from string', () => {
				const timestamp = Timestamp.fromString('2023-01-01T12:00:00Z');

				expect(timestamp.value).toEqual(
					new Date('2023-01-01T12:00:00Z')
				);
			});
		});

		describe('fromMilliseconds', () => {
			it('should create timestamp from milliseconds', () => {
				const milliseconds = 1672574400000;
				const timestamp = Timestamp.fromMilliseconds(milliseconds);

				expect(timestamp.value).toEqual(new Date(milliseconds));
			});
		});

		describe('fromSeconds', () => {
			it('should create timestamp from seconds', () => {
				const seconds = 1672574400;
				const timestamp = Timestamp.fromSeconds(seconds);

				expect(timestamp.value).toEqual(new Date(seconds * 1000));
			});
		});

		describe('now', () => {
			it('should create timestamp for current time', () => {
				const before = new Date();
				const timestamp = Timestamp.now();
				const after = new Date();

				expect(timestamp.value.getTime()).toBeGreaterThanOrEqual(
					before.getTime()
				);
				expect(timestamp.value.getTime()).toBeLessThanOrEqual(
					after.getTime()
				);
			});
		});

		describe('fromDateParts', () => {
			it('should create timestamp from date parts', () => {
				const timestamp = Timestamp.fromDateParts(
					2023,
					1,
					15,
					12,
					30,
					45,
					500
				);

				expect(timestamp.value).toEqual(
					new Date(2023, 0, 15, 12, 30, 45, 500)
				);
			});

			it('should use default time values', () => {
				const timestamp = Timestamp.fromDateParts(2023, 1, 15);

				expect(timestamp.value).toEqual(
					new Date(2023, 0, 15, 0, 0, 0, 0)
				);
			});
		});

		describe('isValid', () => {
			it('should return true for valid timestamp', () => {
				expect(Timestamp.isValid(new Date())).toBe(true);
				expect(Timestamp.isValid('2023-01-01T12:00:00Z')).toBe(true);
				expect(Timestamp.isValid(1672574400000)).toBe(true);
			});

			it('should return false for invalid timestamp', () => {
				expect(Timestamp.isValid('invalid-date')).toBe(false);
				expect(Timestamp.isValid(NaN)).toBe(false);
				expect(Timestamp.isValid(null as unknown as Date)).toBe(false);
			});
		});
	});

	describe('equality and comparison', () => {
		it('should be equal to itself', () => {
			const timestamp = new Timestamp('2023-01-01T12:00:00Z');
			expect(timestamp.equals(timestamp)).toBe(true);
		});

		it('should be equal to timestamp with same value', () => {
			const timestamp1 = new Timestamp('2023-01-01T12:00:00Z');
			const timestamp2 = new Timestamp('2023-01-01T12:00:00Z');

			expect(timestamp1.equals(timestamp2)).toBe(true);
		});

		it('should not be equal to timestamp with different value', () => {
			const timestamp1 = new Timestamp('2023-01-01T12:00:00Z');
			const timestamp2 = new Timestamp('2023-01-01T13:00:00Z');

			expect(timestamp1.equals(timestamp2)).toBe(false);
		});

		it('should not be equal to null or undefined', () => {
			const timestamp = new Timestamp('2023-01-01T12:00:00Z');

			expect(timestamp.equals(null)).toBe(false);
			expect(timestamp.equals(undefined)).toBe(false);
		});

		it('should check if before another timestamp', () => {
			const earlier = new Timestamp('2023-01-01T12:00:00Z');
			const later = new Timestamp('2023-01-01T13:00:00Z');

			expect(earlier.isBefore(later)).toBe(true);
			expect(later.isBefore(earlier)).toBe(false);
		});

		it('should check if after another timestamp', () => {
			const earlier = new Timestamp('2023-01-01T12:00:00Z');
			const later = new Timestamp('2023-01-01T13:00:00Z');

			expect(later.isAfter(earlier)).toBe(true);
			expect(earlier.isAfter(later)).toBe(false);
		});

		it('should check if same as another timestamp', () => {
			const timestamp1 = new Timestamp('2023-01-01T12:00:00Z');
			const timestamp2 = new Timestamp('2023-01-01T12:00:00Z');
			const timestamp3 = new Timestamp('2023-01-01T13:00:00Z');

			expect(timestamp1.isSame(timestamp2)).toBe(true);
			expect(timestamp1.isSame(timestamp3)).toBe(false);
		});
	});

	describe('difference calculations', () => {
		const base = new Timestamp('2023-01-01T12:00:00Z');
		const oneHourLater = new Timestamp('2023-01-01T13:00:00Z');
		const oneDayLater = new Timestamp('2023-01-02T12:00:00Z');

		it('should calculate difference in milliseconds', () => {
			expect(oneHourLater.differenceInMilliseconds(base)).toBe(3600000);
			expect(base.differenceInMilliseconds(oneHourLater)).toBe(-3600000);
		});

		it('should calculate difference in seconds', () => {
			expect(oneHourLater.differenceInSeconds(base)).toBe(3600);
			expect(base.differenceInSeconds(oneHourLater)).toBe(-3600);
		});

		it('should calculate difference in minutes', () => {
			expect(oneHourLater.differenceInMinutes(base)).toBe(60);
			expect(base.differenceInMinutes(oneHourLater)).toBe(-60);
		});

		it('should calculate difference in hours', () => {
			expect(oneHourLater.differenceInHours(base)).toBe(1);
			expect(base.differenceInHours(oneHourLater)).toBe(-1);
		});

		it('should calculate difference in days', () => {
			expect(oneDayLater.differenceInDays(base)).toBe(1);
			expect(base.differenceInDays(oneDayLater)).toBe(-1);
		});
	});

	describe('addition methods', () => {
		const base = new Timestamp('2023-01-01T12:00:00Z');

		it('should add milliseconds', () => {
			const result = base.addMilliseconds(1000);
			expect(result.differenceInMilliseconds(base)).toBe(1000);
		});

		it('should add seconds', () => {
			const result = base.addSeconds(60);
			expect(result.differenceInSeconds(base)).toBe(60);
		});

		it('should add minutes', () => {
			const result = base.addMinutes(30);
			expect(result.differenceInMinutes(base)).toBe(30);
		});

		it('should add hours', () => {
			const result = base.addHours(2);
			expect(result.differenceInHours(base)).toBe(2);
		});

		it('should add days', () => {
			const result = base.addDays(1);
			expect(result.differenceInDays(base)).toBe(1);
		});
	});

	describe('utility methods', () => {
		it('should return hash code', () => {
			const timestamp = new Timestamp('2023-01-01T12:00:00Z');

			expect(timestamp.hashCode()).toBe(
				timestamp.milliseconds.toString()
			);
		});

		it('should convert to string (ISO format)', () => {
			const timestamp = new Timestamp('2023-01-01T12:00:00Z');

			expect(timestamp.toString()).toBe('2023-01-01T12:00:00.000Z');
		});

		it('should convert to JSON (ISO format)', () => {
			const timestamp = new Timestamp('2023-01-01T12:00:00Z');

			expect(timestamp.toJSON()).toBe('2023-01-01T12:00:00.000Z');
		});

		it('should format timestamp', () => {
			const timestamp = new Timestamp('2023-01-01T12:00:00Z');

			expect(timestamp.format('iso')).toBe('2023-01-01T12:00:00.000Z');
			expect(timestamp.format('date')).toBeDefined();
			expect(timestamp.format('time')).toBeDefined();
			expect(timestamp.format('datetime')).toBeDefined();
		});

		it('should check if in past', () => {
			const past = new Timestamp('2020-01-01T12:00:00Z');
			const future = new Timestamp('2030-01-01T12:00:00Z');

			expect(past.isPast()).toBe(true);
			expect(future.isPast()).toBe(false);
		});

		it('should check if in future', () => {
			const past = new Timestamp('2020-01-01T12:00:00Z');
			const future = new Timestamp('2030-01-01T12:00:00Z');

			expect(past.isFuture()).toBe(false);
			expect(future.isFuture()).toBe(true);
		});

		it('should check if today', () => {
			const today = Timestamp.now();
			const yesterday = today.addDays(-1);
			const tomorrow = today.addDays(1);

			expect(today.isToday()).toBe(true);
			expect(yesterday.isToday()).toBe(false);
			expect(tomorrow.isToday()).toBe(false);
		});
	});
});
