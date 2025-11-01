export interface INetworkMonitor {
	isOnline(): Promise<boolean>;
	listen(callback: (online: boolean) => void): () => void;
}
