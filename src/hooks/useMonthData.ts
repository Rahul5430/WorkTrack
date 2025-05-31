import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../store/store';
import { MarkedDay, MarkedDayStatus } from '../types/calendar';

type MonthData = {
	[key: string]: {
		status: MarkedDayStatus;
		isAdvisory: boolean;
	};
};

export const useMonthData = (currentMonth: Date) => {
	const workTrackData = useSelector(
		(state: RootState) => state.workTrack.data
	);
	const [isLoading, setIsLoading] = useState(true);
	const [isInitialized, setIsInitialized] = useState(false);
	const monthDataCache = useRef<{ [key: string]: MonthData }>({});
	const currentMonthKey = useMemo(
		() => currentMonth.toISOString().slice(0, 7),
		[currentMonth]
	);

	const getMonthData = useCallback(
		(monthDate: Date) => {
			const monthKey = monthDate.toISOString().slice(0, 7);
			const monthData: MonthData = {};

			workTrackData.forEach((entry) => {
				if (entry.date.startsWith(monthKey)) {
					monthData[entry.date] = {
						status: entry.status,
						isAdvisory: entry.isAdvisory ?? false,
					};
				}
			});

			return monthData;
		},
		[workTrackData]
	);

	const loadMonthData = useCallback(
		async (monthDate: Date) => {
			const monthKey = monthDate.toISOString().slice(0, 7);
			const data = getMonthData(monthDate);
			monthDataCache.current[monthKey] = data;
			return data;
		},
		[getMonthData]
	);

	const preloadAdjacentMonths = useCallback(async () => {
		if (!isInitialized) {
			setIsLoading(true);
		}

		try {
			// Get previous month
			const prevMonth = new Date(currentMonth);
			prevMonth.setMonth(prevMonth.getMonth() - 1);
			const prevMonthKey = prevMonth.toISOString().slice(0, 7);

			// Get next month
			const nextMonth = new Date(currentMonth);
			nextMonth.setMonth(nextMonth.getMonth() + 1);
			const nextMonthKey = nextMonth.toISOString().slice(0, 7);

			// Load data for all three months in parallel
			await Promise.all([
				loadMonthData(currentMonth),
				loadMonthData(prevMonth),
				loadMonthData(nextMonth),
			]);

			if (!isInitialized) {
				setIsInitialized(true);
			}
		} finally {
			setIsLoading(false);
		}
	}, [currentMonth, loadMonthData, isInitialized]);

	// Initial load
	useEffect(() => {
		if (!isInitialized) {
			preloadAdjacentMonths();
		}
	}, [isInitialized, preloadAdjacentMonths]);

	// Preload data when current month changes
	useEffect(() => {
		if (isInitialized) {
			preloadAdjacentMonths();
		}
	}, [currentMonthKey, isInitialized, preloadAdjacentMonths]);

	const getMarkedDaysForMonth = useCallback((monthDate: Date) => {
		const monthKey = monthDate.toISOString().slice(0, 7);
		return monthDataCache.current[monthKey] || {};
	}, []);

	const currentMonthData = useMemo(() => {
		return monthDataCache.current[currentMonthKey] || {};
	}, [currentMonthKey]);

	return {
		isLoading: isLoading || !isInitialized,
		getMarkedDaysForMonth,
		currentMonthData,
		isInitialized,
	};
};
