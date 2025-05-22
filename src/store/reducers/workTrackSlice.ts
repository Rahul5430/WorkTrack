import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { MarkedDayStatus } from '../../types/calendar';

export interface WorkDayEntry {
	date: string;
	status: MarkedDayStatus;
}

interface WorkTrackState {
	entries: WorkDayEntry[];
	loading: boolean;
	error: string | null;
	lastSynced: number | null;
}

const initialState: WorkTrackState = {
	entries: [],
	loading: false,
	error: null,
	lastSynced: null,
};

const workTrackSlice = createSlice({
	name: 'workTrack',
	initialState,
	reducers: {
		setWorkTrackData(state, action: PayloadAction<WorkDayEntry[]>) {
			state.entries = action.payload;
			state.error = null;
		},
		addOrUpdateEntry(state, action: PayloadAction<WorkDayEntry>) {
			const existingIndex = state.entries.findIndex(
				(entry) => entry.date === action.payload.date
			);
			if (existingIndex !== -1) {
				state.entries[existingIndex] = action.payload;
			} else {
				state.entries.push(action.payload);
			}
			state.error = null;
		},
		clearWorkTrack(state) {
			state.entries = [];
			state.error = null;
		},
		setLoading(state, action: PayloadAction<boolean>) {
			state.loading = action.payload;
		},
		setError(state, action: PayloadAction<string | null>) {
			state.error = action.payload;
		},
		setLastSynced(state, action: PayloadAction<number>) {
			state.lastSynced = action.payload;
		},
		rollbackEntry(state, action: PayloadAction<string>) {
			state.entries = state.entries.filter(
				(entry) => entry.date !== action.payload
			);
		},
	},
});

export const {
	setWorkTrackData,
	addOrUpdateEntry,
	clearWorkTrack,
	setLoading,
	setError,
	setLastSynced,
	rollbackEntry,
} = workTrackSlice.actions;

export default workTrackSlice.reducer;
