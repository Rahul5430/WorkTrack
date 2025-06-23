import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../store/store';
import { MarkedDayStatus } from '../types/calendar';

type MonthData = {
	[key: string]: {
		status: MarkedDayStatus;
		isAdvisory: boolean;
	};
};

export const useMonthData = (currentDate: Date) => {
	const workTrackData = useSelector(
		(state: RootState) => state.workTrack.data
	);
	const [isLoading, setIsLoading] = useState(true);
	const [isInitialized, setIsInitialized] = useState(false);
	const monthDataCache = useRef<{ [key: string]: MonthData }>({});
	const currentMonthKey = useMemo(
		() => currentDate.toISOString().slice(0, 7),
		[currentDate]
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
			const prevMonth = new Date(currentDate);
			prevMonth.setMonth(prevMonth.getMonth() - 1);

			// Get next month
			const nextMonth = new Date(currentDate);
			nextMonth.setMonth(nextMonth.getMonth() + 1);

			// Load data for all three months in parallel
			await Promise.all([
				loadMonthData(currentDate),
				loadMonthData(prevMonth),
				loadMonthData(nextMonth),
			]);

			if (!isInitialized) {
				setIsInitialized(true);
			}
		} finally {
			setIsLoading(false);
		}
	}, [currentDate, loadMonthData, isInitialized]);

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

	const monthData = useMemo(() => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		// Get the first day of the month
		const firstDay = new Date(year, month, 1);
		// Get the last day of the month
		const lastDay = new Date(year, month + 1, 0);

		// Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
		const firstDayOfWeek = firstDay.getDay();
		// Adjust for Monday as first day of week (0 = Monday, 1 = Tuesday, etc.)
		const adjustedFirstDayOfWeek =
			firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

		// Calculate the start date for the calendar (including previous month's days)
		const startDate = new Date(firstDay);
		startDate.setDate(startDate.getDate() - adjustedFirstDayOfWeek);

		// Calculate the end date for the calendar (including next month's days)
		const endDate = new Date(lastDay);
		endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

		const days: Array<{
			date: Date;
			isCurrentMonth: boolean;
			isToday: boolean;
			dayNumber: number;
		}> = [];

		const currentDateObj = new Date();
		const today = new Date(
			currentDateObj.getFullYear(),
			currentDateObj.getMonth(),
			currentDateObj.getDate()
		);

		const currentDay = new Date(startDate);
		while (currentDay <= endDate) {
			const isCurrentMonth = currentDay.getMonth() === month;
			const isToday = currentDay.getTime() === today.getTime();

			days.push({
				date: new Date(currentDay),
				isCurrentMonth,
				isToday,
				dayNumber: currentDay.getDate(),
			});

			currentDay.setDate(currentDay.getDate() + 1);
		}

		return days;
	}, [currentDate]);

	return {
		isLoading: isLoading || !isInitialized,
		getMarkedDaysForMonth,
		currentMonthData,
		isInitialized,
		monthData,
	};
};
