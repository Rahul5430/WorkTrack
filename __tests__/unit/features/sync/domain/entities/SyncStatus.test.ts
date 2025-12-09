import { SyncStatus } from '@/features/sync/domain/entities/SyncStatus';

describe('SyncStatus', () => {
	it('constructs with valid state', () => {
		const status = new SyncStatus('idle');
		expect(status.state).toBe('idle');
		expect(status.lastSyncedAt).toBeUndefined();
		expect(status.errorMessage).toBeUndefined();
	});

	it('constructs with all fields', () => {
		const lastSynced = new Date();
		const status = new SyncStatus('syncing', lastSynced, 'Error message');
		expect(status.state).toBe('syncing');
		expect(status.lastSyncedAt).toBe(lastSynced);
		expect(status.errorMessage).toBe('Error message');
	});

	it('isSyncing returns true for syncing state', () => {
		const status = new SyncStatus('syncing');
		expect(status.isSyncing()).toBe(true);
	});

	it('isSyncing returns false for non-syncing states', () => {
		expect(new SyncStatus('idle').isSyncing()).toBe(false);
		expect(new SyncStatus('offline').isSyncing()).toBe(false);
		expect(new SyncStatus('error').isSyncing()).toBe(false);
	});
});
