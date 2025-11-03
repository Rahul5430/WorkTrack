import { NetworkMonitor } from '@/shared/data/network/NetworkMonitor';

describe('NetworkMonitor', () => {
	let monitor: NetworkMonitor;

	beforeEach(() => {
		monitor = new NetworkMonitor();
	});

	describe('isOnline', () => {
		it('returns true', async () => {
			const result = await monitor.isOnline();

			expect(result).toBe(true);
		});
	});
});
