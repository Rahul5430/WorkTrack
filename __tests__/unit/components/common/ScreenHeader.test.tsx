import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import ScreenHeader from '../../../../src/components/common/ScreenHeader';

// Mock the themes
jest.mock('../../../../src/themes', () => ({
	fonts: {
		PoppinsSemiBold: 'Poppins-SemiBold',
	},
}));

jest.mock('../../../../src/themes/colors', () => ({
	colors: {
		text: {
			primary: '#000000',
		},
		background: {
			primary: '#ffffff',
			secondary: '#f0f0f0',
		},
	},
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

describe('ScreenHeader', () => {
	const mockOnBackPress = jest.fn();

	beforeEach(() => {
		mockOnBackPress.mockClear();
	});

	it('renders with title', () => {
		const { getByText } = render(
			<ScreenHeader title='Test Title' onBackPress={mockOnBackPress} />
		);

		expect(getByText('Test Title')).toBeTruthy();
	});

	it('calls onBackPress when back button is pressed', () => {
		const { getByTestId } = render(
			<ScreenHeader title='Test Title' onBackPress={mockOnBackPress} />
		);

		const backButton = getByTestId('back-button');
		fireEvent.press(backButton);
		expect(mockOnBackPress).toHaveBeenCalledTimes(1);
	});

	it('renders right component when provided', () => {
		const rightComponent = <Text testID='right-component'>Right</Text>;

		const { getByTestId } = render(
			<ScreenHeader
				title='Test Title'
				onBackPress={mockOnBackPress}
				rightComponent={rightComponent}
			/>
		);

		expect(getByTestId('right-component')).toBeTruthy();
	});

	it('renders without right component', () => {
		const { queryByTestId } = render(
			<ScreenHeader title='Test Title' onBackPress={mockOnBackPress} />
		);

		expect(queryByTestId('right-component')).toBeNull();
	});
});
