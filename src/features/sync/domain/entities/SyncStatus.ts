export type SyncState = 'idle' | 'syncing' | 'offline' | 'error';

export class SyncStatus {
	constructor(
		public readonly state: SyncState,
		public readonly lastSyncedAt?: Date,
		public readonly errorMessage?: string
	) {}

	isSyncing(): boolean {
		return this.state === 'syncing';
	}
}
