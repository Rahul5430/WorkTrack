import { render } from '@testing-library/react-native';
import React from 'react';

import Label from '../../../../src/components/ui/Label';

// Mock the hooks
jest.mock('../../../../src/hooks', () => ({
	useResponsiveLayout: () => ({
		RFValue: (size: number) => size,
		getResponsiveSize: () => ({ width: 20, height: 20 }),
	}),
}));

// Mock the constants
jest.mock('../../../../src/constants/workStatus', () => ({
	WORK_STATUS: {
		OFFICE: 'office',
		WFH: 'wfh',
		HOLIDAY: 'holiday',
		LEAVE: 'leave',
		ADVISORY: 'advisory',
	},
	WORK_STATUS_LABELS: {
		office: 'Office',
		wfh: 'WFH',
		holiday: 'Holiday',
		leave: 'Leave',
		advisory: 'Advisory',
	},
}));

// Mock the themes
jest.mock('../../../../src/themes', () => ({
	fonts: {
		PoppinsMedium: 'Poppins-Medium',
	},
}));

jest.mock('../../../../src/themes/colors', () => ({
	colors: {
		background: {
			office: '#4CAF50',
			wfh: '#2196F3',
			holiday: '#FF9800',
			error: '#F44336',
			forecast: '#9C27B0',
		},
		text: {
			primary: '#000000',
		},
	},
}));

// Mock the SVG icons
jest.mock('../../../../src/assets/icons/building.svg', () => 'BuildingIcon');
jest.mock('../../../../src/assets/icons/forecast.svg', () => 'ForecastIcon');
jest.mock('../../../../src/assets/icons/home.svg', () => 'HomeIcon');
jest.mock('../../../../src/assets/icons/plus.svg', () => 'PlusIcon');

describe('Label', () => {
	it('renders all work status labels', () => {
		const { getByText } = render(<Label />);

		expect(getByText('Office')).toBeTruthy();
		expect(getByText('WFH')).toBeTruthy();
		expect(getByText('Holiday')).toBeTruthy();
		expect(getByText('Leave')).toBeTruthy();
		expect(getByText('Advisory')).toBeTruthy();
	});

	it('renders labels in two rows', () => {
		const { getByText } = render(<Label />);

		// First row should have Office, WFH, Holiday
		expect(getByText('Office')).toBeTruthy();
		expect(getByText('WFH')).toBeTruthy();
		expect(getByText('Holiday')).toBeTruthy();

		// Second row should have Leave, Advisory
		expect(getByText('Leave')).toBeTruthy();
		expect(getByText('Advisory')).toBeTruthy();
	});

	it('renders with correct structure', () => {
		const { getByText } = render(<Label />);

		// All labels should be present
		const labels = ['Office', 'WFH', 'Holiday', 'Leave', 'Advisory'];
		labels.forEach((label) => {
			expect(getByText(label)).toBeTruthy();
		});
	});
});
