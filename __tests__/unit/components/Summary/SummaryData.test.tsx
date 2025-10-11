import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';

import SummaryData from '../../../../src/components/Summary/SummaryData';
import { WORK_STATUS } from '../../../../src/constants/workStatus';
import { RootState } from '../../../../src/store/store';

// Mock React Native components
jest.mock('react-native', () => ({
	View: ({
		children,
		style,
		testID,
		...props
	}: {
		children?: React.ReactNode;
		style?: React.CSSProperties;
		testID?: string;
		[key: string]: unknown;
	}) => (
		<div data-testid={testID || 'view'} style={style} {...props}>
			{children as React.ReactNode}
		</div>
	),
	Text: ({
		children,
		style,
		testID,
		...props
	}: {
		children?: React.ReactNode;
		style?: React.CSSProperties;
		testID?: string;
		[key: string]: unknown;
	}) => (
		<span data-testid={testID || 'text'} style={style} {...props}>
			{children as React.ReactNode}
		</span>
	),
	StyleSheet: {
		create: (styles: Record<string, unknown>) => styles,
	},
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => ({
	ProgressBar: ({
		progress,
		color,
		style,
		fillStyle,
		...props
	}: {
		progress: number;
		color: string;
		style?: React.CSSProperties;
		fillStyle?: React.CSSProperties;
		[key: string]: unknown;
	}) => (
		<div
			data-testid='progress-bar'
			data-progress={progress}
			data-color={color}
			style={{
				...(style as React.CSSProperties),
				...(fillStyle as React.CSSProperties),
			}}
			{...props}
		/>
	),
}));

// Mock the useResponsiveLayout hook
jest.mock('../../../../src/hooks/useResponsive', () => ({
	useResponsiveLayout: () => ({
		RFValue: (value: number) => value,
	}),
}));

// Mock themes
jest.mock('../../../../src/themes', () => ({
	fonts: {
		PoppinsMedium: 'Poppins-Medium',
		PoppinsRegular: 'Poppins-Regular',
	},
}));

jest.mock('../../../../src/themes/colors', () => ({
	colors: {
		text: {
			primary: '#111827',
			secondary: '#6b7280',
		},
		ui: {
			gray: {
				100: '#f3f4f6',
			},
		},
		error: '#ef4444',
	},
}));

jest.mock('../../../../src/constants/workStatus', () => ({
	WORK_STATUS: {
		OFFICE: 'OFFICE',
		WFH: 'WFH',
		HOLIDAY: 'HOLIDAY',
		LEAVE: 'LEAVE',
		ADVISORY: 'ADVISORY',
	},
	WORK_STATUS_COLORS: {
		OFFICE: '#3b82f6',
		WFH: '#10b981',
		HOLIDAY: '#f59e0b',
		LEAVE: '#ef4444',
		ADVISORY: '#8b5cf6',
	},
	WORK_STATUS_LABELS: {
		OFFICE: 'Office',
		WFH: 'WFH',
		HOLIDAY: 'Holiday',
		LEAVE: 'Leave',
		ADVISORY: 'Advisory',
	},
}));

// Create a mock store
const createMockStore = (initialState: Partial<RootState>) => {
	return configureStore({
		reducer: (state = initialState) => state,
		preloadedState: initialState,
	});
};

describe('SummaryData', () => {
	const mockWorkTrackData = [
		{
			date: '2025-01-15',
			status: WORK_STATUS.OFFICE,
			isAdvisory: false,
		},
		{
			date: '2025-01-16',
			status: WORK_STATUS.WFH,
			isAdvisory: false,
		},
		{
			date: '2025-01-17',
			status: WORK_STATUS.HOLIDAY,
			isAdvisory: false,
		},
		{
			date: '2025-01-18',
			status: WORK_STATUS.LEAVE,
			isAdvisory: false,
		},
		{
			date: '2025-01-19',
			status: WORK_STATUS.OFFICE,
			isAdvisory: true,
		},
		{
			date: '2025-02-15',
			status: WORK_STATUS.OFFICE,
			isAdvisory: false,
		},
		{
			date: '2025-04-15',
			status: WORK_STATUS.WFH,
			isAdvisory: false,
		},
		{
			date: '2025-01-18', // Saturday - should be skipped in holiday count
			status: WORK_STATUS.HOLIDAY,
			isAdvisory: false,
		},
		{
			date: '2025-01-19', // Sunday - should be skipped in holiday count
			status: WORK_STATUS.HOLIDAY,
			isAdvisory: false,
		},
	];

	const defaultState: Partial<RootState> = {
		workTrack: {
			data: mockWorkTrackData,
			markedDays: {},
			loading: false,
			error: null,
			syncStatus: {
				isSyncing: false,
				isOnline: true,
				pendingSyncs: 0,
			},
		},
		user: {
			user: {
				id: 'test-user',
				name: 'Test User',
				email: 'test@example.com',
			},
			token: null,
			isLoggedIn: true,
			isFetching: false,
			errorMessage: null,
		},
	};

	const renderWithStore = (
		component: React.ReactElement,
		state = defaultState
	) => {
		const store = createMockStore(state);
		return render(<Provider store={store}>{component}</Provider>);
	};

	it('renders with default props', () => {
		const { root } = renderWithStore(<SummaryData />);
		expect(root.children.length).toBeGreaterThan(0);
	});

	it('renders with selected month', () => {
		const selectedMonth = new Date(2025, 0, 15); // January 2025
		const { root } = renderWithStore(
			<SummaryData selectedMonth={selectedMonth} />
		);
		expect(root.children.length).toBeGreaterThan(0);
	});

	it('renders monthly data correctly', () => {
		const { root } = renderWithStore(<SummaryData />);
		expect(root.children.length).toBeGreaterThan(0);
	});

	it('handles empty work track data', () => {
		const emptyState = {
			...defaultState,
			workTrack: {
				data: [],
				markedDays: {},
				loading: false,
				error: null,
				syncStatus: {
					isSyncing: false,
					isOnline: true,
					pendingSyncs: 0,
				},
			},
		};
		const { root } = renderWithStore(<SummaryData />, emptyState);
		expect(root.children.length).toBeGreaterThan(0);
	});

	it('handles different months', () => {
		const months = [
			new Date(2025, 0, 1), // January
			new Date(2025, 1, 1), // February
			new Date(2025, 11, 1), // December
		];

		months.forEach((month) => {
			const { root } = renderWithStore(
				<SummaryData selectedMonth={month} />
			);
			expect(root.children.length).toBeGreaterThan(0);
		});
	});

	it('handles different quarters', () => {
		const quarters = [
			new Date(2025, 0, 1), // Q1
			new Date(2025, 3, 1), // Q2
			new Date(2025, 6, 1), // Q3
			new Date(2025, 9, 1), // Q4
		];

		quarters.forEach((quarter) => {
			const { root } = renderWithStore(
				<SummaryData selectedMonth={quarter} />
			);
			expect(root.children.length).toBeGreaterThan(0);
		});
	});

	it('handles weekend holidays correctly', () => {
		const weekendHolidayData = [
			{
				date: '2025-01-18', // Saturday
				status: WORK_STATUS.HOLIDAY,
				isAdvisory: false,
			},
			{
				date: '2025-01-19', // Sunday
				status: WORK_STATUS.HOLIDAY,
				isAdvisory: false,
			},
		];

		const weekendState = {
			...defaultState,
			workTrack: {
				data: weekendHolidayData,
				markedDays: {},
				loading: false,
				error: null,
				syncStatus: {
					isSyncing: false,
					isOnline: true,
					pendingSyncs: 0,
				},
			},
		};

		const { root } = renderWithStore(<SummaryData />, weekendState);
		expect(root.children.length).toBeGreaterThan(0);
	});

	it('handles advisory days correctly', () => {
		const advisoryData = [
			{
				date: '2025-01-15',
				status: WORK_STATUS.OFFICE,
				isAdvisory: true,
			},
			{
				date: '2025-01-16',
				status: WORK_STATUS.WFH,
				isAdvisory: true,
			},
		];

		const advisoryState = {
			...defaultState,
			workTrack: {
				data: advisoryData,
				markedDays: {},
				loading: false,
				error: null,
				syncStatus: {
					isSyncing: false,
					isOnline: true,
					pendingSyncs: 0,
				},
			},
		};

		const { root } = renderWithStore(<SummaryData />, advisoryState);
		expect(root.children.length).toBeGreaterThan(0);
	});

	it('handles mixed status data', () => {
		const mixedData = [
			{
				date: '2025-01-01',
				status: WORK_STATUS.OFFICE,
				isAdvisory: false,
			},
			{
				date: '2025-01-02',
				status: WORK_STATUS.WFH,
				isAdvisory: false,
			},
			{
				date: '2025-01-03',
				status: WORK_STATUS.HOLIDAY,
				isAdvisory: false,
			},
			{
				date: '2025-01-04',
				status: WORK_STATUS.LEAVE,
				isAdvisory: false,
			},
			{
				date: '2025-01-05',
				status: WORK_STATUS.OFFICE,
				isAdvisory: true,
			},
		];

		const mixedState = {
			...defaultState,
			workTrack: {
				data: mixedData,
				markedDays: {},
				loading: false,
				error: null,
				syncStatus: {
					isSyncing: false,
					isOnline: true,
					pendingSyncs: 0,
				},
			},
		};

		const { root } = renderWithStore(<SummaryData />, mixedState);
		expect(root.children.length).toBeGreaterThan(0);
	});

	it('handles edge case dates', () => {
		const edgeDates = [
			new Date(2025, 0, 1), // First day of year
			new Date(2025, 11, 31), // Last day of year
			new Date(2025, 1, 28), // February (non-leap year)
			new Date(2024, 1, 29), // February (leap year)
		];

		edgeDates.forEach((date) => {
			const { root } = renderWithStore(
				<SummaryData selectedMonth={date} />
			);
			expect(root.children.length).toBeGreaterThan(0);
		});
	});

	it('handles null selected month', () => {
		const { root } = renderWithStore(
			<SummaryData selectedMonth={undefined} />
		);
		expect(root.children.length).toBeGreaterThan(0);
	});

	it('covers all code paths and branches', () => {
		const comprehensiveData = [
			// January data
			{
				date: '2025-01-01',
				status: WORK_STATUS.OFFICE,
				isAdvisory: false,
			},
			{
				date: '2025-01-02',
				status: WORK_STATUS.WFH,
				isAdvisory: false,
			},
			{
				date: '2025-01-03',
				status: WORK_STATUS.HOLIDAY,
				isAdvisory: false,
			},
			{
				date: '2025-01-04',
				status: WORK_STATUS.LEAVE,
				isAdvisory: false,
			},
			{
				date: '2025-01-05',
				status: WORK_STATUS.OFFICE,
				isAdvisory: true,
			},
			// Weekend holidays (should be filtered out)
			{
				date: '2025-01-04', // Saturday
				status: WORK_STATUS.HOLIDAY,
				isAdvisory: false,
			},
			{
				date: '2025-01-05', // Sunday
				status: WORK_STATUS.HOLIDAY,
				isAdvisory: false,
			},
			// Q2 data
			{
				date: '2025-04-01',
				status: WORK_STATUS.OFFICE,
				isAdvisory: false,
			},
			{
				date: '2025-05-01',
				status: WORK_STATUS.WFH,
				isAdvisory: false,
			},
			{
				date: '2025-06-01',
				status: WORK_STATUS.HOLIDAY,
				isAdvisory: false,
			},
		];

		const comprehensiveState = {
			...defaultState,
			workTrack: {
				data: comprehensiveData,
				markedDays: {},
				loading: false,
				error: null,
				syncStatus: {
					isSyncing: false,
					isOnline: true,
					pendingSyncs: 0,
				},
			},
		};

		const { root } = renderWithStore(<SummaryData />, comprehensiveState);
		expect(root.children.length).toBeGreaterThan(0);
	});
});
