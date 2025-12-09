/**
 * Network monitoring interface
 * Used to check network connectivity status and listen for changes
 */
export interface INetworkMonitor {
	/**
	 * Check if the device is currently online
	 */
	isOnline(): Promise<boolean>;

	/**
	 * Listen to network state changes
	 * @param callback Function called when network state changes
	 * @returns Unsubscribe function
	 */
	listen(callback: (online: boolean) => void): () => void;
}
