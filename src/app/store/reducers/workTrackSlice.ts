// migrated to V2 structure
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WorkTrackState {
	loading: boolean;
	error: string | null;
	data: unknown;
}

const initialState: WorkTrackState = {
	loading: false,
	error: null,
	data: null,
};

export const workTrackSlice = createSlice({
	name: 'workTrack',
	initialState,
	reducers: {
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		setWorkTrackData: (state, action: PayloadAction<unknown>) => {
			state.data = action.payload;
		},
		addOrUpdateEntry: (_state, _action: PayloadAction<unknown>) => {},
		rollbackEntry: (_state, _action: PayloadAction<string>) => {},
	},
});

export const {
	setLoading,
	setError,
	setWorkTrackData,
	addOrUpdateEntry,
	rollbackEntry,
} = workTrackSlice.actions;

export default workTrackSlice.reducer;
