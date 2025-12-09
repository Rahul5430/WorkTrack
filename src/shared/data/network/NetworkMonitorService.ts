// Network monitor service
import NetInfo from '@react-native-community/netinfo';

import { INetworkMonitor } from './INetworkMonitor';

/**
 * Network monitor service implementation using React Native NetInfo
 * Provides network connectivity status and real-time updates
 */
export class NetworkMonitorService implements INetworkMonitor {
	private lastOnlineState: boolean | null = null;
	private debounceTimer: ReturnType<typeof setTimeout> | null = null;
	private readonly DEBOUNCE_MS = 500;

	/**
	 * Check if the device is currently online
	 */
	async isOnline(): Promise<boolean> {
		const state = await NetInfo.fetch();
		return Boolean(
			state.isConnected && state.isInternetReachable !== false
		);
	}

	/**
	 * Listen to network state changes with debouncing
	 * @param callback Function called when network state changes
	 * @returns Unsubscribe function
	 */
	listen(callback: (online: boolean) => void): () => void {
		const unsubscribe = NetInfo.addEventListener((state) => {
			const online = Boolean(
				state.isConnected && state.isInternetReachable !== false
			);

			// Debounce: only emit if state changed and after debounce delay
			if (this.lastOnlineState === online) {
				return;
			}

			// Clear existing timer
			if (this.debounceTimer) {
				clearTimeout(this.debounceTimer);
			}

			// Debounce the callback
			this.debounceTimer = setTimeout(() => {
				this.lastOnlineState = online;
				callback(online);
			}, this.DEBOUNCE_MS);
		});

		return () => {
			if (this.debounceTimer) {
				clearTimeout(this.debounceTimer);
				this.debounceTimer = null;
			}
			unsubscribe();
		};
	}
}
