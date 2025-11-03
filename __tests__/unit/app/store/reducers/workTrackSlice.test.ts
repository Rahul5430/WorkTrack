import {
	addOrUpdateEntry,
	rollbackEntry,
	setError,
	setLoading,
	setWorkTrackData,
	workTrackSlice,
} from '@/app/store/reducers/workTrackSlice';

describe('workTrackSlice', () => {
	const initialState = {
		loading: false,
		error: null,
		data: null,
	};

	describe('setLoading', () => {
		it('sets loading to true', () => {
			const action = setLoading(true);
			const state = workTrackSlice.reducer(initialState, action);

			expect(state.loading).toBe(true);
		});

		it('sets loading to false', () => {
			const action = setLoading(false);
			const state = workTrackSlice.reducer(initialState, action);

			expect(state.loading).toBe(false);
		});
	});

	describe('setError', () => {
		it('sets error message', () => {
			const action = setError('Error occurred');
			const state = workTrackSlice.reducer(initialState, action);

			expect(state.error).toBe('Error occurred');
		});

		it('clears error when set to null', () => {
			const stateWithError = workTrackSlice.reducer(
				initialState,
				setError('Error')
			);
			const action = setError(null);
			const state = workTrackSlice.reducer(stateWithError, action);

			expect(state.error).toBeNull();
		});
	});

	describe('setWorkTrackData', () => {
		it('sets work track data', () => {
			const data = { entries: [], trackers: [] };
			const action = setWorkTrackData(data);
			const state = workTrackSlice.reducer(initialState, action);

			expect(state.data).toEqual(data);
		});
	});

	describe('addOrUpdateEntry', () => {
		it('does not modify state (placeholder)', () => {
			const entry = { id: 'entry-1', date: '2024-01-01' };
			const action = addOrUpdateEntry(entry);
			const state = workTrackSlice.reducer(initialState, action);

			expect(state).toEqual(initialState);
		});
	});

	describe('rollbackEntry', () => {
		it('does not modify state (placeholder)', () => {
			const action = rollbackEntry('entry-1');
			const state = workTrackSlice.reducer(initialState, action);

			expect(state).toEqual(initialState);
		});
	});
});
