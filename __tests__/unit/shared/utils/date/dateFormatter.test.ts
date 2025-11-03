import { dateFormatter } from '@/shared/utils/date/dateFormatter';

describe('dateFormatter', () => {
	describe('ymd', () => {
		it('formats date as YYYY-MM-DD', () => {
			const date = new Date('2024-01-15T00:00:00Z');
			const result = dateFormatter.ymd(date);

			expect(result).toBe('2024-01-15');
		});

		it('pads single digit month', () => {
			const date = new Date('2024-03-05T00:00:00Z');
			const result = dateFormatter.ymd(date);

			expect(result).toBe('2024-03-05');
		});

		it('pads single digit day', () => {
			const date = new Date('2024-12-05T00:00:00Z');
			const result = dateFormatter.ymd(date);

			expect(result).toBe('2024-12-05');
		});

		it('handles first day of year', () => {
			const date = new Date('2024-01-01T00:00:00Z');
			const result = dateFormatter.ymd(date);

			expect(result).toBe('2024-01-01');
		});

		it('handles last day of year', () => {
			const date = new Date('2024-12-31T00:00:00Z');
			const result = dateFormatter.ymd(date);

			expect(result).toBe('2024-12-31');
		});

		it('handles leap year date', () => {
			const date = new Date('2024-02-29T00:00:00Z');
			const result = dateFormatter.ymd(date);

			expect(result).toBe('2024-02-29');
		});
	});
});
