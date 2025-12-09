import { testHelpers } from '@/shared/utils/testing/testHelpers';

jest.useFakeTimers();

describe('testHelpers', () => {
	describe('delay', () => {
		it('resolves after specified milliseconds', async () => {
			const delayPromise = testHelpers.delay(1000);

			jest.advanceTimersByTime(1000);

			await expect(delayPromise).resolves.toBeUndefined();
		});

		it('handles zero delay', async () => {
			const delayPromise = testHelpers.delay(0);

			jest.advanceTimersByTime(0);

			await expect(delayPromise).resolves.toBeUndefined();
		});

		it('handles various delay values', async () => {
			const delays = [100, 500, 1000, 2000];

			for (const ms of delays) {
				const delayPromise = testHelpers.delay(ms);
				jest.advanceTimersByTime(ms);
				await expect(delayPromise).resolves.toBeUndefined();
			}
		});
	});
});
