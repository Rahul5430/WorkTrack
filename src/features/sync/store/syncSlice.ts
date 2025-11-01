import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SyncUIState = 'idle' | 'syncing' | 'offline' | 'error';

export interface SyncState {
	state: SyncUIState;
	lastSyncedAt?: string;
	error?: string;
}

const initialState: SyncState = {
	state: 'idle',
};

const slice = createSlice({
	name: 'sync',
	initialState,
	reducers: {
		setSyncing(state) {
			state.state = 'syncing';
			state.error = undefined;
		},
		setIdle(state) {
			state.state = 'idle';
			state.error = undefined;
		},
		setOffline(state) {
			state.state = 'offline';
		},
		setError(state, action: PayloadAction<string>) {
			state.state = 'error';
			state.error = action.payload;
		},
		setLastSyncedAt(state, action: PayloadAction<string | undefined>) {
			state.lastSyncedAt = action.payload;
		},
	},
});

export const { setSyncing, setIdle, setOffline, setError, setLastSyncedAt } =
	slice.actions;

export const syncReducer = slice.reducer;
