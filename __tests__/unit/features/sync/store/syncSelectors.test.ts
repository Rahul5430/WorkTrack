import { configureStore } from '@reduxjs/toolkit';

import {
	selectLastSyncedAt,
	selectSyncError,
	selectSyncState,
} from '@/features/sync/store/syncSelectors';
import {
	setError,
	setIdle,
	setLastSyncedAt,
	setSyncing,
	syncReducer,
	type SyncState,
} from '@/features/sync/store/syncSlice';

describe('syncSelectors', () => {
	let store: ReturnType<typeof configureStore<{ sync: SyncState }>>;

	beforeEach(() => {
		store = configureStore({
			reducer: {
				sync: syncReducer,
			},
		});
	});

	describe('selectSyncState', () => {
		it('should return idle state initially', () => {
			const state = selectSyncState(store.getState());
			expect(state).toBe('idle');
		});

		it('should return syncing state when set', () => {
			store.dispatch(setSyncing());
			const state = selectSyncState(store.getState());
			expect(state).toBe('syncing');
		});

		it('should return error state when set', () => {
			store.dispatch(setError('Sync failed'));
			const state = selectSyncState(store.getState());
			expect(state).toBe('error');
		});

		it('should return idle state when set', () => {
			store.dispatch(setSyncing());
			store.dispatch(setIdle());
			const state = selectSyncState(store.getState());
			expect(state).toBe('idle');
		});
	});

	describe('selectLastSyncedAt', () => {
		it('should return undefined initially', () => {
			const lastSyncedAt = selectLastSyncedAt(store.getState());
			expect(lastSyncedAt).toBeUndefined();
		});

		it('should return timestamp when set', () => {
			const timestamp = '2024-01-01T00:00:00.000Z';
			store.dispatch(setLastSyncedAt(timestamp));
			const lastSyncedAt = selectLastSyncedAt(store.getState());
			expect(lastSyncedAt).toBe(timestamp);
		});

		it('should return undefined after clearing', () => {
			const timestamp = '2024-01-01T00:00:00.000Z';
			store.dispatch(setLastSyncedAt(timestamp));
			store.dispatch(setLastSyncedAt(undefined));
			const lastSyncedAt = selectLastSyncedAt(store.getState());
			expect(lastSyncedAt).toBeUndefined();
		});
	});

	describe('selectSyncError', () => {
		it('should return undefined initially', () => {
			const error = selectSyncError(store.getState());
			expect(error).toBeUndefined();
		});

		it('should return error message when set', () => {
			const errorMessage = 'Sync failed';
			store.dispatch(setError(errorMessage));
			const error = selectSyncError(store.getState());
			expect(error).toBe(errorMessage);
		});

		it('should return undefined after clearing error', () => {
			store.dispatch(setError('Sync failed'));
			store.dispatch(setIdle());
			const error = selectSyncError(store.getState());
			expect(error).toBeUndefined();
		});
	});
});
