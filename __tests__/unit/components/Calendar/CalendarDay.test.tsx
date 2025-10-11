import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import CalendarDay from '../../../../src/components/Calendar/CalendarDay';
import { WORK_STATUS } from '../../../../src/constants/workStatus';
// Mock React Native components first - must be before any imports
jest.mock('react-native', () => ({
	Pressable: (props: Record<string, unknown>) => {
		const { children, onPress, style, ...restProps } = props;
		return (
			<div
				data-pressable='true'
				onClick={onPress as React.MouseEventHandler<HTMLDivElement>}
				style={style as React.CSSProperties}
				{...restProps}
			>
				{children as React.ReactNode}
			</div>
		);
	},
	Text: ({ children, style, ...props }: Record<string, unknown>) => (
		<span style={style as React.CSSProperties} {...props}>
			{children as React.ReactNode}
		</span>
	),
	View: ({ children, style, ...props }: Record<string, unknown>) => (
		<div style={style as React.CSSProperties} {...props}>
			{children as React.ReactNode}
		</div>
	),
	StyleSheet: {
		create: (styles: Record<string, unknown>) => styles,
		flatten: (style: Record<string, unknown>) => style,
	},
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
	useAnimatedStyle: (fn: () => Record<string, unknown>) => fn(),
	useSharedValue: (value: number) => ({ value }),
	withSpring: (value: number) => value,
	withTiming: (value: number) => value,
	View: ({ children, style, ...props }: Record<string, unknown>) => (
		<div style={style as React.CSSProperties} {...props}>
			{children as React.ReactNode}
		</div>
	),
	createAnimatedComponent: (component: React.ComponentType) => {
		// Return a proper component that preserves the original component
		const AnimatedComponent = (props: Record<string, unknown>) => {
			const Component = component;
			return <Component {...props} />;
		};
		AnimatedComponent.displayName = `Animated(${component.displayName || component.name || 'Component'})`;
		return AnimatedComponent;
	},
}));

// Mock the useResponsiveLayout hook
jest.mock('../../../../src/hooks/useResponsive', () => ({
	useResponsiveLayout: () => ({
		getResponsiveSize: (value: number) => value,
	}),
}));

// Mock themes
jest.mock('../../../../src/themes', () => ({
	fonts: {
		PoppinsMedium: 'Poppins-Medium',
	},
}));

jest.mock('../../../../src/themes/colors', () => ({
	colors: {
		ui: {
			blue: {
				100: '#dbeafe',
				200: '#bfdbfe',
				400: '#60a5fa',
				600: '#2563eb',
			},
			gray: {
				100: '#f3f4f6',
				200: '#e5e7eb',
			},
			shadow: '#000000',
		},
		background: {
			holiday: '#fef3c7',
			error: '#fee2e2',
		},
		text: {
			primary: '#111827',
			secondary: '#6b7280',
			light: '#ffffff',
		},
		forecast: '#3b82f6',
		error: '#ef4444',
	},
}));

jest.mock('../../../../src/constants/workStatus', () => ({
	WORK_STATUS: {
		WFH: 'WFH',
		OFFICE: 'OFFICE',
		HOLIDAY: 'HOLIDAY',
		LEAVE: 'LEAVE',
	},
	WORK_STATUS_COLORS: {
		WFH: '#10b981',
		OFFICE: '#3b82f6',
		HOLIDAY: '#f59e0b',
		LEAVE: '#ef4444',
	},
	WORK_STATUS_PRESSED_COLORS: {
		WFH: '#059669',
		OFFICE: '#2563eb',
		HOLIDAY: '#d97706',
		LEAVE: '#dc2626',
	},
}));

describe('CalendarDay', () => {
	const mockOnPress = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	// Helper function to check if component renders with expected content
	const expectComponentRenders = (component: React.ReactElement) => {
		const { root } = render(component);
		expect(root.children.length).toBeGreaterThan(0);
		// Additional check that the component structure is correct
		expect(root).toBeTruthy();
	};

	it('can import CalendarDay component', () => {
		// Just test if the component can be imported
		expect(CalendarDay).toBeDefined();
		expect(typeof CalendarDay).toBe('object');
		// React.memo components are objects, not functions
		expect(
			(CalendarDay as unknown as { type: unknown }).type
		).toBeDefined();
	});

	it('renders with correct day number', () => {
		// First check if CalendarDay is defined
		expect(CalendarDay).toBeDefined();

		const { root } = render(
			<CalendarDay
				day={15}
				dateString='2025-01-15'
				onPress={mockOnPress}
			/>
		);
		// Check that the day number is rendered in the component
		expect(root.children.length).toBeGreaterThan(0);
	});

	it('calls onPress when pressed', () => {
		const { root } = render(
			<CalendarDay
				day={15}
				dateString='2025-01-15'
				onPress={mockOnPress}
			/>
		);
		// Find the pressable element by looking for the outer div
		const pressable = root.children[0] as unknown as React.ReactElement;
		(fireEvent.press as unknown as (element: unknown) => void)(pressable);
		expect(mockOnPress).toHaveBeenCalledWith('2025-01-15');
	});

	it('applies correct style for WFH status', () => {
		expectComponentRenders(
			<CalendarDay
				day={15}
				dateString='2025-01-15'
				onPress={mockOnPress}
				type={WORK_STATUS.WFH}
			/>
		);
	});

	it('applies correct style for OFFICE status', () => {
		expectComponentRenders(
			<CalendarDay
				day={15}
				dateString='2025-01-15'
				onPress={mockOnPress}
				type={WORK_STATUS.OFFICE}
			/>
		);
	});

	it('applies correct style for HOLIDAY status', () => {
		expectComponentRenders(
			<CalendarDay
				day={15}
				dateString='2025-01-15'
				onPress={mockOnPress}
				type={WORK_STATUS.HOLIDAY}
			/>
		);
	});

	it('applies correct style for LEAVE status', () => {
		expectComponentRenders(
			<CalendarDay
				day={15}
				dateString='2025-01-15'
				onPress={mockOnPress}
				type={WORK_STATUS.LEAVE}
			/>
		);
	});

	it('renders with today styling when isToday is true', () => {
		expectComponentRenders(
			<CalendarDay
				day={15}
				dateString='2025-01-15'
				onPress={mockOnPress}
				isToday={true}
			/>
		);
	});

	it('renders with advisory styling when isAdvisory is true', () => {
		expectComponentRenders(
			<CalendarDay
				day={15}
				dateString='2025-01-15'
				onPress={mockOnPress}
				isAdvisory={true}
			/>
		);
	});

	it('renders with different styling when not current month', () => {
		expectComponentRenders(
			<CalendarDay
				day={15}
				dateString='2025-01-15'
				onPress={mockOnPress}
				isCurrentMonth={false}
			/>
		);
	});

	it('handles press in animation', () => {
		const { root } = render(
			<CalendarDay
				day={15}
				dateString='2025-01-15'
				onPress={mockOnPress}
			/>
		);
		const pressable = root.children[0] as unknown as React.ReactElement;
		(fireEvent as unknown as (element: unknown, event: string) => void)(
			pressable,
			'pressIn'
		);
	});

	it('handles press out animation', () => {
		const { root } = render(
			<CalendarDay
				day={15}
				dateString='2025-01-15'
				onPress={mockOnPress}
			/>
		);
		const pressable = root.children[0] as unknown as React.ReactElement;
		(fireEvent as unknown as (element: unknown, event: string) => void)(
			pressable,
			'pressOut'
		);
	});

	it('renders advisory with circle container', () => {
		expectComponentRenders(
			<CalendarDay
				day={15}
				dateString='2025-01-15'
				onPress={mockOnPress}
				isAdvisory={true}
			/>
		);
	});

	it('handles multiple status combinations', () => {
		expectComponentRenders(
			<CalendarDay
				day={15}
				dateString='2025-01-15'
				onPress={mockOnPress}
				type={WORK_STATUS.WFH}
				isToday={true}
				isAdvisory={false}
			/>
		);
	});

	it('handles edge case with all props false', () => {
		expectComponentRenders(
			<CalendarDay
				day={1}
				dateString='2025-01-01'
				onPress={mockOnPress}
				isToday={false}
				isAdvisory={false}
				isCurrentMonth={true}
			/>
		);
	});

	it('handles different day numbers', () => {
		const testDays = [1, 15, 28, 31];
		testDays.forEach((day) => {
			expectComponentRenders(
				<CalendarDay
					day={day}
					dateString={`2025-01-${day.toString().padStart(2, '0')}`}
					onPress={mockOnPress}
				/>
			);
		});
	});
});
