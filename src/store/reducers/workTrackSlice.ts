import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WorkDayEntry {
	date: string;
	status: 'wfh' | 'office' | 'holiday';
}

interface WorkTrackState {
	entries: WorkDayEntry[];
}

const initialState: WorkTrackState = {
	entries: [],
};

const workTrackSlice = createSlice({
	name: 'workTrack',
	initialState,
	reducers: {
		setWorkTrackData(state, action: PayloadAction<WorkDayEntry[]>) {
			state.entries = action.payload;
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
		},
		clearWorkTrack(state) {
			state.entries = [];
		},
	},
});

export const { setWorkTrackData, addOrUpdateEntry, clearWorkTrack } =
	workTrackSlice.actions;

export default workTrackSlice.reducer;
