import { dateCalculator } from '@/shared/utils/date/dateCalculator';

describe('dateCalculator', () => {
	describe('addDays', () => {
		it('adds positive days', () => {
			const date = new Date('2024-01-01T00:00:00Z');
			const result = dateCalculator.addDays(date, 5);

			expect(result).toEqual(new Date('2024-01-06T00:00:00Z'));
		});

		it('subtracts days when negative', () => {
			const date = new Date('2024-01-10T00:00:00Z');
			const result = dateCalculator.addDays(date, -3);

			expect(result).toEqual(new Date('2024-01-07T00:00:00Z'));
		});

		it('handles zero days', () => {
			const date = new Date('2024-01-01T00:00:00Z');
			const result = dateCalculator.addDays(date, 0);

			expect(result).toEqual(date);
		});

		it('handles leap year', () => {
			const date = new Date('2024-02-28T00:00:00Z');
			const result = dateCalculator.addDays(date, 1);

			expect(result).toEqual(new Date('2024-02-29T00:00:00Z'));
		});

		it('handles month boundary', () => {
			const date = new Date('2024-01-31T00:00:00Z');
			const result = dateCalculator.addDays(date, 1);

			expect(result).toEqual(new Date('2024-02-01T00:00:00Z'));
		});
	});
});
