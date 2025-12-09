import NetInfo from '@react-native-community/netinfo';

import { NetworkMonitorService } from '@/shared/data/network';

jest.mock('@react-native-community/netinfo', () => ({
	fetch: jest.fn(),
	addEventListener: jest.fn(),
}));

describe('NetworkMonitorService', () => {
	let service: NetworkMonitorService;

	beforeEach(() => {
		service = new NetworkMonitorService();
		jest.clearAllMocks();
	});

	describe('isOnline', () => {
		it('returns true when connected', async () => {
			(NetInfo.fetch as jest.Mock).mockResolvedValue({
				isConnected: true,
			});

			const result = await service.isOnline();

			expect(NetInfo.fetch).toHaveBeenCalled();
			expect(result).toBe(true);
		});

		it('returns false when not connected', async () => {
			(NetInfo.fetch as jest.Mock).mockResolvedValue({
				isConnected: false,
			});

			const result = await service.isOnline();

			expect(result).toBe(false);
		});

		it('returns false when isConnected is null', async () => {
			(NetInfo.fetch as jest.Mock).mockResolvedValue({
				isConnected: null,
			});

			const result = await service.isOnline();

			expect(result).toBe(false);
		});

		it('returns false when isConnected is undefined', async () => {
			(NetInfo.fetch as jest.Mock).mockResolvedValue({});

			const result = await service.isOnline();

			expect(result).toBe(false);
		});
	});

	describe('listen', () => {
		it('subscribes to network state changes', async () => {
			const mockUnsubscribe = jest.fn();
			const callback = jest.fn();
			let listenerCallback:
				| ((state: {
						isConnected?: boolean;
						isInternetReachable?: boolean;
				  }) => void)
				| undefined;

			(NetInfo.addEventListener as jest.Mock).mockImplementation((cb) => {
				listenerCallback = cb as (state: {
					isConnected?: boolean;
					isInternetReachable?: boolean;
				}) => void;
				return mockUnsubscribe;
			});

			const unsubscribe = service.listen(callback);

			expect(NetInfo.addEventListener).toHaveBeenCalled();
			expect(typeof unsubscribe).toBe('function');

			if (listenerCallback) {
				// Test online state
				listenerCallback({
					isConnected: true,
					isInternetReachable: true,
				});
				await new Promise((resolve) => setTimeout(resolve, 600));
				expect(callback).toHaveBeenCalledWith(true);

				// Test offline state
				callback.mockClear();
				await new Promise((resolve) => setTimeout(resolve, 100));
				listenerCallback({ isConnected: false });
				await new Promise((resolve) => setTimeout(resolve, 600));
				expect(callback).toHaveBeenCalledWith(false);
			}
		});

		it('returns unsubscribe function', () => {
			const mockUnsubscribe = jest.fn();
			const callback = jest.fn();

			(NetInfo.addEventListener as jest.Mock).mockReturnValue(
				mockUnsubscribe
			);

			const unsubscribe = service.listen(callback);

			// The service wraps unsubscribe, so we check it's a function
			expect(typeof unsubscribe).toBe('function');
			// Call the wrapped unsubscribe - it should call the mock
			unsubscribe();
			expect(mockUnsubscribe).toHaveBeenCalled();
		});
	});
});
