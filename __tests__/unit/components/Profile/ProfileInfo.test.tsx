import { render } from '@testing-library/react-native';
import React from 'react';
import { Image } from 'react-native';

import ProfileInfo from '../../../../src/components/Profile/ProfileInfo';

// Mock the themes
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
		office: '#4CAF50',
	},
}));

describe('ProfileInfo', () => {
	it('renders with name and email', () => {
		const { getByText } = render(
			<ProfileInfo name='John Doe' email='john@example.com' />
		);

		expect(getByText('John Doe')).toBeTruthy();
		expect(getByText('john@example.com')).toBeTruthy();
	});

	it('renders profile image when photo is provided', () => {
		const { UNSAFE_getByType } = render(
			<ProfileInfo
				name='John Doe'
				email='john@example.com'
				photo='https://example.com/photo.jpg'
			/>
		);

		const image = UNSAFE_getByType(Image);
		expect(image).toBeTruthy();
		expect(image.props.source).toEqual({
			uri: 'https://example.com/photo.jpg',
		});
	});

	it('renders placeholder with first letter of name when no photo', () => {
		const { getByText } = render(
			<ProfileInfo name='John Doe' email='john@example.com' />
		);

		expect(getByText('J')).toBeTruthy(); // First letter of name
	});

	it('renders placeholder with question mark when no name', () => {
		const { getByText } = render(<ProfileInfo email='john@example.com' />);

		expect(getByText('?')).toBeTruthy();
	});

	it('renders with empty props', () => {
		const { getByText } = render(<ProfileInfo />);

		expect(getByText('?')).toBeTruthy();
	});

	it('handles empty name gracefully', () => {
		const { getByText } = render(
			<ProfileInfo name='' email='john@example.com' />
		);

		expect(getByText('?')).toBeTruthy();
	});

	it('handles undefined name gracefully', () => {
		const { getByText } = render(
			<ProfileInfo name={undefined} email='john@example.com' />
		);

		expect(getByText('?')).toBeTruthy();
	});

	it('handles empty email gracefully', () => {
		const { getByText } = render(<ProfileInfo name='John Doe' email='' />);

		expect(getByText('John Doe')).toBeTruthy();
		expect(getByText('')).toBeTruthy();
	});

	it('handles undefined email gracefully', () => {
		const { getByText } = render(
			<ProfileInfo name='John Doe' email={undefined} />
		);

		expect(getByText('John Doe')).toBeTruthy();
		expect(getByText('')).toBeTruthy();
	});

	it('handles long names correctly', () => {
		const longName = 'John Michael Christopher Alexander Doe';
		const { getByText } = render(
			<ProfileInfo name={longName} email='john@example.com' />
		);

		expect(getByText(longName)).toBeTruthy();
		expect(getByText('J')).toBeTruthy(); // First letter for placeholder
	});

	it('handles special characters in name', () => {
		const specialName = "John O'Connor-Smith";
		const { getByText } = render(
			<ProfileInfo name={specialName} email='john@example.com' />
		);

		expect(getByText(specialName)).toBeTruthy();
		expect(getByText('J')).toBeTruthy(); // First letter for placeholder
	});

	it('handles names with spaces correctly', () => {
		const { getByText } = render(
			<ProfileInfo name='John   Doe' email='john@example.com' />
		);

		expect(getByText('John   Doe')).toBeTruthy();
		expect(getByText('J')).toBeTruthy(); // First letter for placeholder
	});

	it('renders placeholder with first letter when photo fails to load', () => {
		const { getByText } = render(
			<ProfileInfo
				name='John Doe'
				email='john@example.com'
				photo='https://invalid-url.com/photo.jpg'
			/>
		);

		// Should still render the name and email
		expect(getByText('John Doe')).toBeTruthy();
		expect(getByText('john@example.com')).toBeTruthy();
	});
});
