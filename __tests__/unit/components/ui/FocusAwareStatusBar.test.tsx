import { useIsFocused } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StatusBar } from 'react-native';

import FocusAwareStatusBar from '../../../../src/components/ui/FocusAwareStatusBar';

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
	useIsFocused: jest.fn(),
}));

describe('FocusAwareStatusBar', () => {
	const mockUseIsFocused = useIsFocused as jest.MockedFunction<
		typeof useIsFocused
	>;

	beforeEach(() => {
		mockUseIsFocused.mockClear();
	});

	it('renders StatusBar when screen is focused', () => {
		mockUseIsFocused.mockReturnValue(true);

		const { UNSAFE_getByType } = render(
			<FocusAwareStatusBar
				barStyle='dark-content'
				backgroundColor='white'
			/>
		);

		const statusBar = UNSAFE_getByType(StatusBar);
		expect(statusBar).toBeTruthy();
		expect(statusBar.props.barStyle).toBe('dark-content');
		expect(statusBar.props.backgroundColor).toBe('white');
	});

	it('does not render StatusBar when screen is not focused', () => {
		mockUseIsFocused.mockReturnValue(false);

		const { toJSON } = render(
			<FocusAwareStatusBar
				barStyle='dark-content'
				backgroundColor='white'
			/>
		);

		expect(toJSON()).toBeNull();
	});

	it('passes all props to StatusBar when focused', () => {
		mockUseIsFocused.mockReturnValue(true);

		const props = {
			barStyle: 'light-content' as const,
			backgroundColor: 'black',
			translucent: true,
			hidden: false,
		};

		const { UNSAFE_getByType } = render(<FocusAwareStatusBar {...props} />);

		const statusBar = UNSAFE_getByType(StatusBar);
		expect(statusBar.props.barStyle).toBe('light-content');
		expect(statusBar.props.backgroundColor).toBe('black');
		expect(statusBar.props.translucent).toBe(true);
		expect(statusBar.props.hidden).toBe(false);
	});
});
