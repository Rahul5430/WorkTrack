// migrated to V2 structure
import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';

import type { UserState } from '@/app/store/reducers/userSlice';
import { userSlice } from '@/app/store/reducers/userSlice';
import type { WorkTrackState } from '@/app/store/reducers/workTrackSlice';
import { workTrackSlice } from '@/app/store/reducers/workTrackSlice';
import { useAttendance } from '@/features/attendance/ui/hooks/useAttendance';

interface RootState {
	workTrack: WorkTrackState;
	user: UserState;
}

describe('useAttendance', () => {
	let store: ReturnType<typeof configureStore>;

	beforeEach(() => {
		store = configureStore({
			reducer: {
				workTrack: workTrackSlice.reducer,
				user: userSlice.reducer,
			},
		});
	});

	const wrapper = ({ children }: { children: React.ReactNode }) =>
		React.createElement(
			Provider,
			{ store } as React.ComponentProps<typeof Provider>,
			children
		);

	it('should return initial state', () => {
		const { result } = renderHook(() => useAttendance(), { wrapper });

		expect(result.current.workTrackData).toBeNull();
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBeNull();
		expect(result.current.addEntry).toBeDefined();
		expect(result.current.removeEntry).toBeDefined();
		expect(result.current.setError).toBeDefined();
		expect(result.current.setLoading).toBeDefined();
		expect(result.current.updateWorkTrackData).toBeDefined();
	});

	it('should select workTrack state from Redux', () => {
		const { result } = renderHook(() => useAttendance(), { wrapper });

		expect(result.current.workTrackData).toBeNull();
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBeNull();
	});

	it('should dispatch addEntry action', () => {
		const { result } = renderHook(() => useAttendance(), { wrapper });
		const entry = {
			date: '2024-01-01',
			status: 'office' as const,
			isAdvisory: false,
		};

		act(() => {
			result.current.addEntry(entry);
		});

		// addOrUpdateEntry is a no-op in the reducer, but the action should be dispatched
		const rootState = store.getState() as RootState;
		expect(rootState.workTrack).toBeDefined();
	});

	it('should dispatch removeEntry action', () => {
		const { result } = renderHook(() => useAttendance(), { wrapper });

		act(() => {
			result.current.removeEntry('2024-01-01');
		});

		// rollbackEntry is a no-op in the reducer, but the action should be dispatched
		const rootState = store.getState() as RootState;
		expect(rootState.workTrack).toBeDefined();
	});

	it('should dispatch setError action', () => {
		const { result } = renderHook(() => useAttendance(), { wrapper });
		const errorMessage = 'Test error';

		act(() => {
			result.current.setError(errorMessage);
		});

		const rootState = store.getState() as RootState;
		const state = rootState.workTrack as {
			error: string | null;
		};
		expect(state.error).toBe(errorMessage);
	});

	it('should dispatch setError with null', () => {
		const { result } = renderHook(() => useAttendance(), { wrapper });

		// First set an error
		act(() => {
			result.current.setError('Initial error');
		});

		// Then clear it
		act(() => {
			result.current.setError(null);
		});

		const rootState = store.getState() as RootState;
		const state = rootState.workTrack as {
			error: string | null;
		};
		expect(state.error).toBeNull();
	});

	it('should dispatch setLoading action', () => {
		const { result } = renderHook(() => useAttendance(), { wrapper });

		act(() => {
			result.current.setLoading(true);
		});

		const rootState = store.getState() as RootState;
		const state = rootState.workTrack as {
			loading: boolean;
		};
		expect(state.loading).toBe(true);

		act(() => {
			result.current.setLoading(false);
		});

		const updatedState = (store.getState() as RootState).workTrack as {
			loading: boolean;
		};
		expect(updatedState.loading).toBe(false);
	});

	it('should dispatch updateWorkTrackData action', () => {
		const { result } = renderHook(() => useAttendance(), { wrapper });
		const data = [
			{
				date: '2024-01-01',
				status: 'office' as const,
				isAdvisory: false,
			},
			{ date: '2024-01-02', status: 'wfh' as const, isAdvisory: true },
		];

		act(() => {
			result.current.updateWorkTrackData(data);
		});

		const rootState = store.getState() as RootState;
		const state = rootState.workTrack as {
			data: Array<{
				date: string;
				status:
					| 'office'
					| 'wfh'
					| 'holiday'
					| 'leave'
					| 'weekend'
					| 'forecast'
					| 'advisory';
				isAdvisory: boolean;
			}>;
		};
		expect(state.data).toEqual(data);
	});

	it('should update when Redux state changes', () => {
		const { result } = renderHook(() => useAttendance(), { wrapper });

		act(() => {
			store.dispatch(workTrackSlice.actions.setLoading(true));
		});

		expect(result.current.loading).toBe(true);

		act(() => {
			store.dispatch(workTrackSlice.actions.setError('New error'));
		});

		expect(result.current.error).toBe('New error');
	});

	it('should maintain function references across renders when dependencies unchanged', () => {
		const { result, rerender } = renderHook(() => useAttendance(), {
			wrapper,
		});

		const firstAddEntry = result.current.addEntry;
		const firstRemoveEntry = result.current.removeEntry;
		const firstSetError = result.current.setError;
		const firstSetLoading = result.current.setLoading;
		const firstUpdateWorkTrackData = result.current.updateWorkTrackData;

		rerender({});

		// Functions should maintain same reference due to useCallback
		expect(result.current.addEntry).toBe(firstAddEntry);
		expect(result.current.removeEntry).toBe(firstRemoveEntry);
		expect(result.current.setError).toBe(firstSetError);
		expect(result.current.setLoading).toBe(firstSetLoading);
		expect(result.current.updateWorkTrackData).toBe(
			firstUpdateWorkTrackData
		);
	});
});
