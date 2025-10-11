import { renderHook } from '@testing-library/react-native';

import { useResponsiveLayout } from '../../../src/hooks/useResponsive';

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
	useSafeAreaInsets: () => ({
		top: 44,
		bottom: 34,
		left: 0,
		right: 0,
	}),
}));

// Mock React Native modules
jest.mock('react-native', () => ({
	useWindowDimensions: jest.fn(() => ({
		width: 375,
		height: 812,
	})),
	Platform: {
		OS: 'ios',
	},
	StatusBar: {
		currentHeight: 24,
	},
	Dimensions: {
		get: jest.fn(() => ({ width: 375, height: 812 })),
	},
}));

describe('useResponsiveLayout', () => {
	const mockUseWindowDimensions = require('react-native').useWindowDimensions;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should return responsive layout values for portrait', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.width).toBe(375);
		expect(result.current.height).toBe(812);
		expect(result.current.isPortrait).toBe(true);
		expect(result.current.offset).toBe(44); // iOS top inset
		expect(result.current.deviceHeight).toBe(768); // 812 - 44
	});

	it('should return responsive layout values for landscape', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 812,
			height: 375,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.width).toBe(812);
		expect(result.current.height).toBe(375);
		expect(result.current.isPortrait).toBe(false);
		expect(result.current.offset).toBe(0); // Landscape has no offset
		expect(result.current.deviceHeight).toBe(812); // max(width, height) - offset
	});

	it('should calculate RFPercentage correctly', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const percentage = result.current.RFPercentage(10);
		expect(percentage).toBe(77); // Math.round((10 * 768) / 100)
	});

	it('should calculate RFValue correctly', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const fontSize = result.current.RFValue(16);
		expect(fontSize).toBe(18); // Math.round((16 * 768) / 680)
	});

	it('should calculate RFValue with custom base height', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const fontSize = result.current.RFValue(16, 800);
		expect(fontSize).toBe(15); // Math.round((16 * 768) / 800)
	});

	it('should get responsive size correctly', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const size = result.current.getResponsiveSize(50, 30);
		expect(size.width).toBe(187.5); // (375 * 50) / 100
		expect(size.height).toBe(243.6); // (812 * 30) / 100
	});

	it('should get responsive size with default values', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const size = result.current.getResponsiveSize();
		expect(size.width).toBe(375); // (375 * 100) / 100
		expect(size.height).toBe(812); // (812 * 100) / 100
	});

	it('should get responsive margin correctly', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const margin = result.current.getResponsiveMargin(10);
		expect(margin).toBe(37); // Math.floor((375 * 10) / 100)
	});

	it('should auto scale image with required width only', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const scaled = result.current.autoScaleImage({
			imageWidth: 400,
			imageHeight: 300,
			requiredWidth: 200,
		});

		expect(scaled.width).toBe(200);
		expect(scaled.height).toBe(150); // 200 / (400/300)
	});

	it('should auto scale image with required height only', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const scaled = result.current.autoScaleImage({
			imageWidth: 400,
			imageHeight: 300,
			requiredHeight: 150,
		});

		expect(scaled.width).toBe(200); // 150 * (400/300)
		expect(scaled.height).toBe(150);
	});

	it('should auto scale image with both required dimensions', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const scaled = result.current.autoScaleImage({
			imageWidth: 400,
			imageHeight: 300,
			requiredWidth: 200,
			requiredHeight: 150,
		});

		// Should return original dimensions when both are provided
		expect(scaled.width).toBe(400);
		expect(scaled.height).toBe(300);
	});

	it('should auto scale image with no required dimensions', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const scaled = result.current.autoScaleImage({
			imageWidth: 400,
			imageHeight: 300,
		});

		expect(scaled.width).toBe(400);
		expect(scaled.height).toBe(300);
	});

	it('should handle Android platform offset', () => {
		// Mock Android platform
		const mockPlatform = require('react-native').Platform;
		mockPlatform.OS = 'android';

		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.offset).toBe(24); // StatusBar.currentHeight
	});

	it('should handle different screen sizes', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 768,
			height: 1024,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.width).toBe(768);
		expect(result.current.height).toBe(1024);
		expect(result.current.isPortrait).toBe(true);
	});
});
