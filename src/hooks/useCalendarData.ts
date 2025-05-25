import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadWorkTrackDataFromDB } from '../db/watermelon/worktrack/load';
import SyncService from '../services/sync';
import { setWorkTrackData } from '../store/reducers/workTrackSlice';
import { RootState } from '../store/store';
import { MarkedDayStatus } from '../types/calendar';

export const useCalendarData = () => {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [syncStatus, setSyncStatus] = useState<{
		isSyncing: boolean;
		isOnline: boolean;
		lastSyncTime?: number;
		error?: string;
		pendingSyncs: number;
	}>({
		isSyncing: false,
		isOnline: true,
		pendingSyncs: 0,
	});

	const workTrackData = useSelector(
		(state: RootState) => state.workTrack.data
	);

	useEffect(() => {
		const loadData = async () => {
			try {
				setIsLoading(true);
				const data = await loadWorkTrackDataFromDB();
				dispatch(setWorkTrackData(data));
				setError(null);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: 'Failed to load calendar data'
				);
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [dispatch]);

	useEffect(() => {
		const syncService = SyncService.getInstance();
		const checkSyncStatus = async () => {
			const status = await syncService.getSyncStatus();
			setSyncStatus(status);
		};

		// Check sync status every 30 seconds
		const interval = setInterval(checkSyncStatus, 30000);
		checkSyncStatus(); // Initial check

		return () => clearInterval(interval);
	}, []);

	const getMarkedDays = () => {
		const markedDays: Record<string, MarkedDayStatus> = {};
		workTrackData.forEach((day) => {
			markedDays[day.date] = day.status;
		});
		return markedDays;
	};

	return {
		isLoading,
		error,
		syncStatus,
		markedDays: getMarkedDays(),
	};
};
