import { Q } from '@nozbe/watermelondb';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { WORK_STATUS } from '../constants/workStatus';
import { database } from '../db/watermelon';
import WorkTrack from '../db/watermelon/worktrack/model';
import {
	addOrUpdateEntry,
	rollbackEntry,
	setWorkTrackData,
} from '../store/reducers/workTrackSlice';
import { RootState } from '../store/store';
import { MarkedDay, MarkedDayStatus } from '../types/calendar';

type WorkTrackRecord = {
	date: string;
	status: MarkedDayStatus;
};

export const useCalendarData = () => {
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(true);
	const [hasLoaded, setHasLoaded] = useState(false);
	const markedDays = useSelector(
		(state: RootState) => state.workTrack.markedDays
	);
	const syncStatus = useSelector(
		(state: RootState) => state.workTrack.syncStatus
	);
	const loadingRef = useRef(loading);
	const hasLoadedRef = useRef(hasLoaded);

	// Keep refs in sync with state
	loadingRef.current = loading;
	hasLoadedRef.current = hasLoaded;

	const initializeDatabase = useCallback(async () => {
		const workTracks = await database.collections
			.get('work_tracks')
			.query()
			.fetch();

		if (workTracks.length === 0) {
			const today = new Date();
			const pastYear = new Date(today);
			pastYear.setFullYear(today.getFullYear() - 1);
			const nextYear = new Date(today);
			nextYear.setFullYear(today.getFullYear() + 1);

			const batch: WorkTrackRecord[] = [];
			let currentDate = new Date(pastYear);

			while (currentDate <= nextYear) {
				const dayOfWeek = currentDate.getDay();
				if (dayOfWeek === 0) {
					// Only Sunday (0) is a holiday
					const dateString = currentDate.toISOString().split('T')[0];
					batch.push({
						date: dateString,
						status: WORK_STATUS.HOLIDAY,
					});
				}
				currentDate.setDate(currentDate.getDate() + 1);
			}

			await database.write(async () => {
				for (const record of batch) {
					await database
						.get<WorkTrack>('work_tracks')
						.create((workTrack) => {
							workTrack.date = record.date;
							workTrack.status = record.status;
						});
				}
			});
		}
	}, []);

	const loadData = useCallback(async () => {
		if (loadingRef.current || hasLoadedRef.current) return;

		setLoading(true);

		try {
			// Load all data first
			const allData = await database.collections
				.get('work_tracks')
				.query()
				.fetch();

			// Convert all records to MarkedDay format and create a map for quick lookup
			const markedDaysMap: Record<string, MarkedDay> = {};
			allData.forEach((record) => {
				const workTrack = record as WorkTrack;
				markedDaysMap[workTrack.date] = {
					date: workTrack.date,
					status: workTrack.status,
					isAdvisory: workTrack.isAdvisory,
				};
			});

			// Convert map to array for Redux store
			const filteredMarkedDays = Object.values(markedDaysMap);

			// Only update Redux store after all processing is complete
			dispatch(setWorkTrackData(filteredMarkedDays));

			setHasLoaded(true);
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			setLoading(false);
		}
	}, [dispatch]);

	useEffect(() => {
		initializeDatabase();
	}, [initializeDatabase]);

	useEffect(() => {
		if (!loadingRef.current && !hasLoadedRef.current) {
			loadData();
		}
	}, [loadData]);

	const markDay = useCallback(
		async (
			date: string,
			status: MarkedDayStatus,
			isAdvisory: boolean = false
		) => {
			try {
				const workTrackCollection =
					database.get<WorkTrack>('work_tracks');
				await database.write(async () => {
					await workTrackCollection.create((workTrack) => {
						workTrack.date = date;
						workTrack.status = status;
						workTrack.isAdvisory = isAdvisory;
					});
				});

				dispatch(
					addOrUpdateEntry({
						date,
						status,
						isAdvisory,
					})
				);
			} catch (error) {
				console.error('Error marking day:', error);
			}
		},
		[database, dispatch]
	);

	const unmarkDay = useCallback(
		async (date: string) => {
			try {
				const workTrackCollection =
					database.get<WorkTrack>('work_tracks');
				const record = await workTrackCollection
					.query(Q.where('date', date))
					.fetch();

				if (record.length > 0) {
					await database.write(async () => {
						await record[0].destroyPermanently();
					});

					dispatch(rollbackEntry(date));
				}
			} catch (error) {
				console.error('Error unmarking day:', error);
			}
		},
		[database, dispatch]
	);

	return {
		loading,
		hasLoaded,
		markedDays,
		syncStatus,
		markDay,
		unmarkDay,
	};
};
