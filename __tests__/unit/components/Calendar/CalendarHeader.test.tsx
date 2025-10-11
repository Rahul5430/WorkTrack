import { render } from '@testing-library/react-native';
import React from 'react';

import CalendarHeader from '../../../../src/components/Calendar/CalendarHeader';

// Mock the useResponsiveLayout hook
jest.mock('../../../../src/hooks/useResponsive', () => ({
	useResponsiveLayout: () => ({
		RFValue: (value: number) => value,
		getResponsiveMargin: (value: number) => value * 10,
	}),
}));

// Mock themes
jest.mock('../../../../src/themes', () => ({
	fonts: {
		PoppinsSemiBold: 'Poppins-SemiBold',
		PoppinsRegular: 'Poppins-Regular',
	},
}));

jest.mock('../../../../src/themes/colors', () => ({
	colors: {
		background: {
			primary: '#ffffff',
		},
		text: {
			primary: '#000000',
			secondary: '#666666',
		},
	},
}));

describe('CalendarHeader', () => {
	const mockMonth = new Date('2024-01-01');

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should render without crashing', () => {
		expect(() =>
			render(<CalendarHeader month={mockMonth} />)
		).not.toThrow();
	});

	it('should render with different months', () => {
		const january = new Date('2024-01-01');
		const february = new Date('2024-02-01');
		const december = new Date('2024-12-01');

		expect(() => render(<CalendarHeader month={january} />)).not.toThrow();
		expect(() => render(<CalendarHeader month={february} />)).not.toThrow();
		expect(() => render(<CalendarHeader month={december} />)).not.toThrow();
	});

	it('should render with onHeaderLayout callback', () => {
		const mockOnHeaderLayout = jest.fn();

		expect(() =>
			render(
				<CalendarHeader
					month={mockMonth}
					onHeaderLayout={mockOnHeaderLayout}
				/>
			)
		).not.toThrow();
	});

	it('should render with horizontal padding', () => {
		expect(() =>
			render(<CalendarHeader month={mockMonth} horizontalPadding={20} />)
		).not.toThrow();
	});

	it('should render with all props', () => {
		const mockOnHeaderLayout = jest.fn();

		expect(() =>
			render(
				<CalendarHeader
					month={mockMonth}
					onHeaderLayout={mockOnHeaderLayout}
					horizontalPadding={30}
				/>
			)
		).not.toThrow();
	});

	it('should handle different years', () => {
		const year2023 = new Date('2023-06-01');
		const year2025 = new Date('2025-06-01');

		expect(() => render(<CalendarHeader month={year2023} />)).not.toThrow();
		expect(() => render(<CalendarHeader month={year2025} />)).not.toThrow();
	});

	it('should handle edge case dates', () => {
		const leapYear = new Date('2024-02-29');
		const newYear = new Date('2024-01-01');
		const endOfYear = new Date('2024-12-31');

		expect(() => render(<CalendarHeader month={leapYear} />)).not.toThrow();
		expect(() => render(<CalendarHeader month={newYear} />)).not.toThrow();
		expect(() =>
			render(<CalendarHeader month={endOfYear} />)
		).not.toThrow();
	});

	it('should handle zero horizontal padding', () => {
		expect(() =>
			render(<CalendarHeader month={mockMonth} horizontalPadding={0} />)
		).not.toThrow();
	});

	it('should handle negative horizontal padding', () => {
		expect(() =>
			render(<CalendarHeader month={mockMonth} horizontalPadding={-10} />)
		).not.toThrow();
	});
});
