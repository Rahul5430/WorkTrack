import { DateRange } from '@/features/attendance/domain/entities/DateRange';

describe('DateRange', () => {
	it('constructs with valid dates and normalizes time', () => {
		const r = new DateRange('2023-01-01T10:00:00Z', '2023-01-05T23:59:59Z');
		expect(r.start.toISOString().slice(0, 10)).toBe('2023-01-01');
		expect(r.end.toISOString().slice(0, 10)).toBe('2023-01-05');
	});

	it('throws when start after end', () => {
		expect(() => new DateRange('2023-01-10', '2023-01-05')).toThrow();
	});

	it('contains checks day-in-range', () => {
		const r = new DateRange('2023-01-01', '2023-01-05');
		expect(r.contains('2023-01-03')).toBe(true);
		expect(r.contains('2023-01-06')).toBe(false);
	});

	it('overlaps checks overlap', () => {
		const a = new DateRange('2023-01-01', '2023-01-05');
		const b = new DateRange('2023-01-05', '2023-01-10');
		expect(a.overlaps(b)).toBe(true);
	});
});
