import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { MarkedDay } from '../../types/calendar';

export interface WorkTrackState {
	data: MarkedDay[];
	loading: boolean;
	error: string | null;
	syncStatus: {
		isSyncing: boolean;
		isOnline: boolean;
		lastSyncTime?: number;
		error?: string;
		pendingSyncs: number;
	};
}

const initialState: WorkTrackState = {
	data: [],
	loading: false,
	error: null,
	syncStatus: {
		isSyncing: false,
		isOnline: true,
		pendingSyncs: 0,
	},
};

const workTrackSlice = createSlice({
	name: 'workTrack',
	initialState,
	reducers: {
		setWorkTrackData: (state, action: PayloadAction<MarkedDay[]>) => {
			state.data = action.payload;
		},
		addOrUpdateEntry: (state, action: PayloadAction<MarkedDay>) => {
			const index = state.data.findIndex(
				(entry) => entry.date === action.payload.date
			);
			if (index !== -1) {
				state.data[index] = action.payload;
			} else {
				state.data.push(action.payload);
			}
		},
		rollbackEntry: (state, action: PayloadAction<string>) => {
			state.data = state.data.filter(
				(entry) => entry.date !== action.payload
			);
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		updateSyncStatus: (
			state,
			action: PayloadAction<Partial<WorkTrackState['syncStatus']>>
		) => {
			state.syncStatus = { ...state.syncStatus, ...action.payload };
		},
	},
});

export const {
	setWorkTrackData,
	addOrUpdateEntry,
	rollbackEntry,
	setLoading,
	setError,
	updateSyncStatus,
} = workTrackSlice.actions;

export const selectSyncStatus = (state: { workTrack: WorkTrackState }) =>
	state.workTrack.syncStatus;

export default workTrackSlice.reducer;
