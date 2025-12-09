// migrated to V2 structure
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '@/app/store';
import {
	addOrUpdateEntry,
	rollbackEntry,
	setError,
	setLoading,
	setWorkTrackData,
} from '@/app/store/reducers/workTrackSlice';
import { MarkedDay } from '@/types';

export const useAttendance = () => {
	const dispatch = useDispatch<AppDispatch>();
	const {
		data: workTrackData,
		loading,
		error,
	} = useSelector((state: RootState) => state.workTrack);

	const addEntry = useCallback(
		(entry: MarkedDay) => {
			dispatch(addOrUpdateEntry(entry));
		},
		[dispatch]
	);

	const removeEntry = useCallback(
		(date: string) => {
			dispatch(rollbackEntry(date));
		},
		[dispatch]
	);

	const setErrorState = useCallback(
		(errorMessage: string | null) => {
			dispatch(setError(errorMessage));
		},
		[dispatch]
	);

	const setLoadingState = useCallback(
		(isLoading: boolean) => {
			dispatch(setLoading(isLoading));
		},
		[dispatch]
	);

	const updateWorkTrackData = useCallback(
		(data: MarkedDay[]) => {
			dispatch(setWorkTrackData(data));
		},
		[dispatch]
	);

	return {
		workTrackData,
		loading,
		error,
		addEntry,
		removeEntry,
		setError: setErrorState,
		setLoading: setLoadingState,
		updateWorkTrackData,
	};
};
