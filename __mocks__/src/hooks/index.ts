export const useResponsiveLayout = jest.fn(() => ({
	RFValue: jest.fn((size) => size),
	width: 375,
	height: 812,
	isPortrait: true,
	offset: 44,
	deviceHeight: 768,
	RFPercentage: jest.fn((percent) => percent),
	getResponsiveSize: jest.fn(() => ({ width: 375, height: 812 })),
	getResponsiveMargin: jest.fn((margin) => margin),
	autoScaleImage: jest.fn(() => ({ width: 100, height: 100 })),
}));

export const useSharedWorkTracks = jest.fn(() => ({
	sharedWorkTracks: [],
	loading: false,
}));

export const useWorkTrackManager = jest.fn(() => ({
	userManagement: {
		user: null,
	},
	entry: {
		entries: [],
		loading: false,
		error: null,
	},
	syncFromRemote: jest.fn(),
	triggerSync: jest.fn(),
}));

export const useToast = jest.fn(() => ({
	showToast: jest.fn(),
	hideToast: jest.fn(),
}));

// Redux exports - mocked as empty for testing
export const useAppSelector = jest.fn();
export const useAppDispatch = jest.fn();
