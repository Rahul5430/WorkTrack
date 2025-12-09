import { renderHook } from '@testing-library/react-native';
import { Platform, StatusBar } from 'react-native';

import { useResponsiveLayout } from '@/shared/ui/hooks/useResponsive';

// Mock useWindowDimensions
const mockUseWindowDimensions = jest.fn();
const mockUseSafeAreaInsets = jest.fn();

jest.mock('react-native', () => ({
	Platform: {
		OS: 'ios',
	},
	StatusBar: {
		currentHeight: 0,
	},
	useWindowDimensions: () => mockUseWindowDimensions(),
}));

jest.mock('react-native-safe-area-context', () => ({
	useSafeAreaInsets: () => mockUseSafeAreaInsets(),
}));

describe('useResponsiveLayout', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Reset Platform and StatusBar to default iOS values
		(Platform as { OS: 'ios' | 'android' }).OS = 'ios';
		(
			StatusBar as { currentHeight: number | null | undefined }
		).currentHeight = 0;
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});
	});

	it('should return all required functions and properties', () => {
		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.RFValue).toBeDefined();
		expect(result.current.getResponsiveSize).toBeDefined();
		expect(result.current.getResponsiveMargin).toBeDefined();
		expect(result.current.RFPercentage).toBeDefined();
		expect(result.current.autoScaleImage).toBeDefined();
		expect(result.current.isPortrait).toBeDefined();
		expect(result.current.offset).toBeDefined();
		expect(result.current.deviceHeight).toBeDefined();
		expect(result.current.width).toBeDefined();
		expect(result.current.height).toBeDefined();
	});

	it('should return correct dimensions', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.width).toBe(375);
		expect(result.current.height).toBe(812);
	});

	it('should calculate RFValue correctly', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		// deviceHeight = max(375, 812) - 44 = 812 - 44 = 768
		// RFValue(20) = Math.round((20 * 768) / 680) = Math.round(22.588) = 23
		expect(result.current.RFValue(20)).toBe(23);
	});

	it('should scale RFValue based on deviceHeight', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 750,
			height: 1334,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		// deviceHeight = max(750, 1334) - 44 = 1334 - 44 = 1290
		// RFValue(20) = Math.round((20 * 1290) / 680) = Math.round(37.94) = 38
		expect(result.current.RFValue(20)).toBe(38);
	});

	it('should calculate getResponsiveSize with percentages', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const size = result.current.getResponsiveSize(50, 50);
		// width: (375 * 50) / 100 = 187.5
		// height: (812 * 50) / 100 = 406
		expect(size.width).toBe(187.5);
		expect(size.height).toBe(406);
	});

	it('should calculate getResponsiveMargin with percentage', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		// margin = Math.floor((375 * 20) / 100) = Math.floor(75) = 75
		const margin = result.current.getResponsiveMargin(20);
		expect(margin).toBe(75);
	});

	it('should detect portrait when height >= width', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.isPortrait).toBe(true);
	});

	it('should not detect portrait when width > height', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 812,
			height: 375,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.isPortrait).toBe(false);
	});

	it('should calculate offset for iOS in portrait', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.offset).toBe(44);
	});

	it('should calculate deviceHeight correctly', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		// deviceHeight = max(375, 812) - 44 = 812 - 44 = 768
		expect(result.current.deviceHeight).toBe(768);
	});

	it('should round RFValue results', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 450,
			height: 812,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		// deviceHeight = max(450, 812) - 44 = 768
		// RFValue(20) = Math.round((20 * 768) / 680) = Math.round(22.588) = 23
		expect(result.current.RFValue(20)).toBe(23);
	});

	it('should calculate RFPercentage correctly', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		// deviceHeight = 768
		// RFPercentage(50) = Math.round((50 * 768) / 100) = Math.round(384) = 384
		expect(result.current.RFPercentage(50)).toBe(384);
	});

	it('should use StatusBar.currentHeight fallback on Android when null', () => {
		// Set Android platform and null StatusBar
		(Platform as { OS: 'ios' | 'android' }).OS = 'android';
		(
			StatusBar as { currentHeight: number | null | undefined }
		).currentHeight = null;

		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812, // Portrait mode
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		// In portrait on Android: offset = StatusBar.currentHeight ?? 0
		// Since currentHeight is null, should fallback to 0
		expect(result.current.offset).toBe(0);
	});

	it('should use StatusBar.currentHeight on Android when set', () => {
		// Set Android platform with StatusBar height
		(Platform as { OS: 'ios' | 'android' }).OS = 'android';
		(
			StatusBar as { currentHeight: number | null | undefined }
		).currentHeight = 24;

		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812, // Portrait mode
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		// In portrait on Android: offset = StatusBar.currentHeight ?? 0
		expect(result.current.offset).toBe(24);
	});

	it('should scale image with requiredWidth only', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const scaled = result.current.autoScaleImage({
			imageWidth: 1000,
			imageHeight: 500,
			requiredWidth: 500,
		});

		// aspectRatio = 1000/500 = 2
		// width = 500, height = 500/2 = 250
		expect(scaled.width).toBe(500);
		expect(scaled.height).toBe(250);
	});

	it('should scale image with requiredHeight only', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const scaled = result.current.autoScaleImage({
			imageWidth: 1000,
			imageHeight: 500,
			requiredHeight: 250,
		});

		// aspectRatio = 1000/500 = 2
		// height = 250, width = 250*2 = 500
		expect(scaled.width).toBe(500);
		expect(scaled.height).toBe(250);
	});

	it('should return original dimensions when neither requiredWidth nor requiredHeight provided', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const scaled = result.current.autoScaleImage({
			imageWidth: 1000,
			imageHeight: 500,
		});

		// Should return original dimensions
		expect(scaled.width).toBe(1000);
		expect(scaled.height).toBe(500);
	});

	it('should return original dimensions when both requiredWidth and requiredHeight provided', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const scaled = result.current.autoScaleImage({
			imageWidth: 1000,
			imageHeight: 500,
			requiredWidth: 500,
			requiredHeight: 250,
		});

		// When both are provided, should return original dimensions (fallback branch)
		expect(scaled.width).toBe(1000);
		expect(scaled.height).toBe(500);
	});
});
