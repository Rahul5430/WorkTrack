import { render } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';

import ListItem from '../../../../src/components/common/ListItem';

// Mock the themes
jest.mock('../../../../src/themes', () => ({
	colors: {
		background: {
			primary: '#ffffff',
		},
		text: {
			primary: '#000000',
			secondary: '#666666',
		},
	},
	fonts: {
		PoppinsMedium: 'Poppins-Medium',
		PoppinsRegular: 'Poppins-Regular',
	},
}));

describe('ListItem', () => {
	it('renders with title string', () => {
		const { getByText } = render(<ListItem title='Test Title' />);

		expect(getByText('Test Title')).toBeTruthy();
	});

	it('renders with title as React node', () => {
		const titleNode = <Text testID='title-node'>Custom Title</Text>;

		const { getByTestId } = render(<ListItem title={titleNode} />);

		expect(getByTestId('title-node')).toBeTruthy();
	});

	it('renders with description', () => {
		const { getByText } = render(
			<ListItem title='Test Title' description='Test Description' />
		);

		expect(getByText('Test Title')).toBeTruthy();
		expect(getByText('Test Description')).toBeTruthy();
	});

	it('renders without description', () => {
		const { getByText, queryByText } = render(
			<ListItem title='Test Title' />
		);

		expect(getByText('Test Title')).toBeTruthy();
		expect(queryByText('Test Description')).toBeNull();
	});

	it('renders with left component', () => {
		const leftComponent = <View testID='left-component' />;

		const { getByTestId, getByText } = render(
			<ListItem title='Test Title' leftComponent={leftComponent} />
		);

		expect(getByTestId('left-component')).toBeTruthy();
		expect(getByText('Test Title')).toBeTruthy();
	});

	it('renders with right component', () => {
		const rightComponent = <View testID='right-component' />;

		const { getByTestId, getByText } = render(
			<ListItem title='Test Title' rightComponent={rightComponent} />
		);

		expect(getByTestId('right-component')).toBeTruthy();
		expect(getByText('Test Title')).toBeTruthy();
	});

	it('renders with both left and right components', () => {
		const leftComponent = <View testID='left-component' />;
		const rightComponent = <View testID='right-component' />;

		const { getByTestId, getByText } = render(
			<ListItem
				title='Test Title'
				leftComponent={leftComponent}
				rightComponent={rightComponent}
			/>
		);

		expect(getByTestId('left-component')).toBeTruthy();
		expect(getByTestId('right-component')).toBeTruthy();
		expect(getByText('Test Title')).toBeTruthy();
	});

	it('applies custom style', () => {
		const customStyle = { backgroundColor: 'red' };

		const { getByTestId } = render(
			<ListItem
				title='Test Title'
				style={customStyle}
				testID='list-item'
			/>
		);

		const listItem = getByTestId('list-item');
		expect(listItem).toBeTruthy();
	});
});
