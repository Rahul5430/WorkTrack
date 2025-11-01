// Network monitor service
import NetInfo from '@react-native-community/netinfo';

import { INetworkMonitor } from '../../domain/ports/INetworkMonitor';

export class NetworkMonitorService implements INetworkMonitor {
	async isOnline(): Promise<boolean> {
		const state = await NetInfo.fetch();
		return state.isConnected ?? false;
	}

	listen(callback: (online: boolean) => void): () => void {
		const unsubscribe = NetInfo.addEventListener((state) => {
			callback(state.isConnected ?? false);
		});
		return unsubscribe;
	}
}
