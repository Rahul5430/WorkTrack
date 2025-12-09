import { render } from '@testing-library/react-native';
import React from 'react';

import App from '@/app';

// Mock RootNavigator to simplify integration test
jest.mock('@/app/navigation/RootNavigator', () => {
	const { View } = require('react-native');

	const ReactLib = require('react');
	return {
		RootNavigator: () =>
			ReactLib.createElement(View, { testID: 'root-navigator' }),
	};
});

describe('App initialization (integration)', () => {
	it('renders App without crashing', () => {
		const { getByTestId } = render(<App />);
		expect(getByTestId('root-navigator')).toBeTruthy();
	});
});
