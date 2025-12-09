import NetInfo from '@react-native-community/netinfo';

import { NetworkMonitorService } from '@/shared/data/network';

jest.mock('@react-native-community/netinfo', () => ({
	fetch: jest.fn(),
	addEventListener: jest.fn(),
}));

describe('NetworkMonitorService', () => {
	let monitor: NetworkMonitorService;

	beforeEach(() => {
		monitor = new NetworkMonitorService();
		jest.clearAllMocks();
	});

	describe('isOnline', () => {
		it('returns true when connected', async () => {
			(NetInfo.fetch as jest.Mock).mockResolvedValue({
				isConnected: true,
				isInternetReachable: true,
			});

			const result = await monitor.isOnline();

			expect(NetInfo.fetch).toHaveBeenCalled();
			expect(result).toBe(true);
		});
	});
});
