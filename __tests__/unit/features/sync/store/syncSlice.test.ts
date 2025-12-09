import { configureStore } from '@reduxjs/toolkit';

import {
	setError,
	setIdle,
	setLastSyncedAt,
	setOffline,
	setSyncing,
	syncReducer,
	type SyncState,
} from '@/features/sync/store/syncSlice';

describe('syncSlice', () => {
	let store: ReturnType<typeof configureStore<{ sync: SyncState }>>;

	beforeEach(() => {
		store = configureStore({
			reducer: {
				sync: syncReducer,
			},
		});
	});

	describe('initial state', () => {
		it('should have initial state with idle status', () => {
			const state = store.getState().sync;
			expect(state.state).toBe('idle');
			expect(state.lastSyncedAt).toBeUndefined();
			expect(state.error).toBeUndefined();
		});
	});

	describe('setSyncing', () => {
		it('should set state to syncing and clear error', () => {
			// Set initial error state
			store.dispatch(setError('Previous error'));
			store.dispatch(setSyncing());

			const state = store.getState().sync;
			expect(state.state).toBe('syncing');
			expect(state.error).toBeUndefined();
		});
	});

	describe('setIdle', () => {
		it('should set state to idle and clear error', () => {
			// Set initial error state
			store.dispatch(setError('Previous error'));
			store.dispatch(setIdle());

			const state = store.getState().sync;
			expect(state.state).toBe('idle');
			expect(state.error).toBeUndefined();
		});
	});

	describe('setOffline', () => {
		it('should set state to offline', () => {
			store.dispatch(setOffline());

			const state = store.getState().sync;
			expect(state.state).toBe('offline');
		});

		it('should preserve existing error when setting offline', () => {
			store.dispatch(setError('Network error'));
			store.dispatch(setOffline());

			const state = store.getState().sync;
			expect(state.state).toBe('offline');
			expect(state.error).toBe('Network error');
		});
	});

	describe('setError', () => {
		it('should set state to error with error message', () => {
			store.dispatch(setError('Sync failed'));

			const state = store.getState().sync;
			expect(state.state).toBe('error');
			expect(state.error).toBe('Sync failed');
		});

		it('should overwrite previous error', () => {
			store.dispatch(setError('First error'));
			store.dispatch(setError('Second error'));

			const state = store.getState().sync;
			expect(state.state).toBe('error');
			expect(state.error).toBe('Second error');
		});
	});

	describe('setLastSyncedAt', () => {
		it('should set lastSyncedAt timestamp', () => {
			const timestamp = '2024-01-01T00:00:00.000Z';
			store.dispatch(setLastSyncedAt(timestamp));

			const state = store.getState().sync;
			expect(state.lastSyncedAt).toBe(timestamp);
		});

		it('should clear lastSyncedAt when set to undefined', () => {
			const timestamp = '2024-01-01T00:00:00.000Z';
			store.dispatch(setLastSyncedAt(timestamp));
			store.dispatch(setLastSyncedAt(undefined));

			const state = store.getState().sync;
			expect(state.lastSyncedAt).toBeUndefined();
		});
	});

	describe('reducer immutability', () => {
		it('should not mutate original state', () => {
			const originalState = store.getState().sync;
			store.dispatch(setSyncing());

			const newState = store.getState().sync;
			expect(newState).not.toBe(originalState);
			expect(originalState.state).toBe('idle');
			expect(newState.state).toBe('syncing');
		});
	});
});
